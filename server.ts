import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import helmet from 'helmet';
import * as pdfParseModule from 'pdf-parse';
import mammoth from 'mammoth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { Packer } from 'docx';
import { TEMPLATE_PRESETS, getPresetForTemplate, getCleanPresetForTemplate } from './src/data/templatePresets.js';
import { dbAdapter } from './src/db/dbAdapter.js';
import { adminAuth } from './src/lib/firebase-admin.js';
import { buildGeminiCoverLetterPrompt, generateDynamicFallbackLetter } from './src/utils/dynamicCoverLetterEngine.js';
import { autoFixCapitalization } from './src/utils/capitalization.js';
import { buildAdaptedCvLocally, generateTargetingSuggestions } from './src/utils/jobTargetingEngine.js';
import { generateVectorPDF } from './src/utils/vectorPdfGenerator.js';
import { buildDocxDocument } from './src/utils/docxExport.js';
import { detectPaidFeaturesInCV } from './src/utils/paidUsageDetector.js';
import { translateCV } from './src/utils/cvTranslator.js';
import {
  sendWelcomeEmail,
  sendSubscriptionConfirmationEmail,
  sendFeatureUnlockedEmail,
  sendAdminPaymentAlert,
  sendEmailSafe,
  buildHtmlEmailTemplate,
  sendPasswordResetEmail
} from './src/services/emailService.js';

const app = express();
const PORT = 3000;

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION PREVENTED CRASH]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION PREVENTED CRASH]', err);
});

// Trust reverse proxy headers (e.g. Google Cloud Run, Nginx)
app.set('trust proxy', 1);

// CORS Policy
app.use(cors({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : true,
  credentials: true
}));

// HTTP Security Headers
const isDev = process.env.NODE_ENV !== 'production';

// Generate nonce for CSP
const generateNonce = () => crypto.randomBytes(16).toString('base64');

app.use(helmet({
  contentSecurityPolicy: isDev ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https://*"],
      connectSrc: ["'self'", "https://api.ikeepay.com", "https://*.googleapis.com", "https://*.firebaseio.com"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Environment Secrets
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: process.env.JWT_SECRET is required in production.');
    process.exit(1);
  }
  JWT_SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('[SECURITY WARNING] process.env.JWT_SECRET non défini. Un secret aléatoire temporaire a été généré pour cette instance de développement.');
}

const IKEEPAY_PUBLIC_KEY = process.env.IKEEPAY_PUBLIC_KEY || '';
const IKEEPAY_PRIVATE_KEY = process.env.IKEEPAY_PRIVATE_KEY || '';
const IKEEPAY_WEBHOOK_SECRET = process.env.IKEEPAY_WEBHOOK_SECRET || '';

app.use(express.json({ limit: '2mb' }));

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Increased to 300 auth attempts per IP
  message: { error: 'Trop de tentatives de connexion/inscription. Veuillez réessayer dans 15 minutes.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false
  }
});

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  message: { error: 'Trop de requêtes de paiement. Veuillez patienter un instant.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false
  }
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60, // max 60 AI generations per 15 min per IP
  message: { error: 'Trop de demandes de génération IA. Veuillez patienter 15 minutes.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false
  }
});

const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // max 30 document imports per 15 min per IP
  message: { error: 'Trop de demandes d\'importation de document. Veuillez patienter 15 minutes.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false
  }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/session', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/payment', paymentLimiter);
app.use('/api/ai', aiLimiter);
app.use('/api/import', importLimiter);

// PDF Text Extractor Helper
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const fn = typeof pdfParseModule === 'function'
    ? pdfParseModule
    : ((pdfParseModule as any)?.default);

  if (typeof fn === 'function') {
    try {
      const res = await fn(buffer);
      if (res && typeof res.text === 'string') return res.text;
    } catch (e) {
      console.warn('pdf-parse function export failed:', e);
    }
  }

  const PDFParseClass = (pdfParseModule as any)?.PDFParse || (pdfParseModule as any)?.default?.PDFParse;
  if (PDFParseClass) {
    const parser = new PDFParseClass({ data: buffer });
    try {
      const result = await parser.getText();
      if (result && typeof result.text === 'string') return result.text;
    } finally {
      if (typeof parser.destroy === 'function') {
        try { await parser.destroy(); } catch {}
      }
    }
  }

  throw new Error('Impossible d\'initialiser le moteur de lecture PDF.');
}

// File upload configuration for CV import
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

// Database Structure & Persistence
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

interface PricingPlan {
  id: string;
  code: string;
  nom: string;
  prix: number;
  prixUsd?: number;
  devise: string;
  dureeJours: number;
  description: string;
  actif: boolean;
}

interface AppSettings {
  paiementActif: boolean;
  pricingPlans: PricingPlan[];
}

interface UserRecord {
  id: string;
  nom: string;
  email: string;
  motDePasseHash: string;
  role: 'USER' | 'ADMIN';
  langue: string;
  subscriptionTier?: 'freemium' | 'decouverte' | 'classique' | 'premium';
  subscriptionExpiresAt?: string;
  createdAt: string;
}

interface DB {
  users: UserRecord[];
  cvs: Array<any>;
  payments: Array<any>;
  letters: Array<any>;
  appSettings: AppSettings;
  adminPaidMatrix?: any;
}

function loadDB(): DB {
  const defaultSettings: AppSettings = {
    paiementActif: true,
    pricingPlans: [
      {
        id: 'plan-decouverte',
        code: 'decouverte',
        nom: 'Pack Découverte',
        prix: 1000,
        prixUsd: 1.70,
        devise: 'FCFA',
        dureeJours: 7,
        description: 'Accès illimité aux 59+ modèles HD et au Creator Studio pendant 7 jours',
        actif: true
      },
      {
        id: 'plan-classique',
        code: 'classique',
        nom: 'Pack Classique',
        prix: 2500,
        prixUsd: 4.20,
        devise: 'FCFA',
        dureeJours: 30,
        description: 'Accès illimité aux 59+ modèles HD et traducteur 3 langues pendant 1 mois',
        actif: true
      },
      {
        id: 'plan-premium',
        code: 'premium',
        nom: 'Pack Premium VIP',
        prix: 5000,
        prixUsd: 8.50,
        devise: 'FCFA',
        dureeJours: 30,
        description: 'Suite IA complète : Ciblage offres, Lettres de motivation, Profil LinkedIn pendant 1 mois',
        actif: true
      }
    ]
  };

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsedDB: DB = JSON.parse(raw);
      let needsSave = false;

      if (!parsedDB.letters) {
        parsedDB.letters = [];
        needsSave = true;
      }

      if (!parsedDB.appSettings) {
        parsedDB.appSettings = defaultSettings;
        needsSave = true;
      } else if (parsedDB.appSettings.pricingPlans) {
        // Ensure plan-decouverte is present
        const hasDecouverte = parsedDB.appSettings.pricingPlans.some((p: any) => p.code === 'decouverte');
        if (!hasDecouverte) {
          parsedDB.appSettings.pricingPlans.unshift(defaultSettings.pricingPlans[0]);
          needsSave = true;
        }
      }

      if (needsSave) {
        saveDB(parsedDB);
      }
      return parsedDB;
    }
  } catch (err) {
    console.error('Error reading db.json:', err);
  }

  // Initial DB seed if file does not exist
  const initialDB: DB = {
    appSettings: defaultSettings,
    users: [
      {
        id: 'u-demo-1',
        nom: 'Jean Dupont',
        email: 'jean.dupont@exemple.com',
        motDePasseHash: bcrypt.hashSync('demo1234', 10),
        role: 'USER',
        langue: 'fr',
        subscriptionTier: 'freemium',
        createdAt: new Date().toISOString()
      }
    ],
    cvs: [],
    payments: [],
    letters: []
  };

  saveDB(initialDB);
  return initialDB;
}

function saveDB(data: DB) {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

// Security Middlewares
interface AuthRequest extends express.Request {
  user?: UserRecord;
}

async function authenticateToken(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token || token === 'undefined' || token === 'null') {
    return res.status(401).json({ error: 'Token manquant ou invalide.' });
  }

  try {
    // Strictly verify JWT signature using server JWT_SECRET
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded) {
      return res.status(401).json({ error: 'Token invalide ou expiré.' });
    }

    let user: UserRecord | undefined;
    if (decoded.userId) {
      user = await dbAdapter.findUserById(decoded.userId);
    }
    if (!user && decoded.email) {
      user = await dbAdapter.findUserByEmail(decoded.email);
    }
    if (!user && decoded.sub) {
      user = await dbAdapter.findUserById(decoded.sub);
    }

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé ou session expirée.' });
    }

    // Automatic 1-month expiration check: if passed, reset tier to freemium
    if (user.role !== 'ADMIN' && user.subscriptionExpiresAt) {
      const isExpired = new Date(user.subscriptionExpiresAt).getTime() < Date.now();
      if (isExpired && user.subscriptionTier !== 'freemium') {
        await dbAdapter.updateUser(user.id, { subscriptionTier: 'freemium' });
        user.subscriptionTier = 'freemium';
      }
    }

    req.user = user as UserRecord;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
}

async function optionalAuthenticateToken(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token || token === 'undefined' || token === 'null') {
    return next();
  }

  try {
    // Strictly verify JWT signature
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded) {
      let user: UserRecord | undefined;
      if (decoded.userId) {
        user = await dbAdapter.findUserById(decoded.userId);
      }
      if (!user && decoded.email) {
        user = await dbAdapter.findUserByEmail(decoded.email);
      }
      if (!user && decoded.sub) {
        user = await dbAdapter.findUserById(decoded.sub);
      }

      if (user) {
        if (user.role !== 'ADMIN' && user.subscriptionExpiresAt) {
          const isExpired = new Date(user.subscriptionExpiresAt).getTime() < Date.now();
          if (isExpired && user.subscriptionTier !== 'freemium') {
            await dbAdapter.updateUser(user.id, { subscriptionTier: 'freemium' });
            user.subscriptionTier = 'freemium';
          }
        }
        req.user = user as UserRecord;
      }
    }
  } catch (err) {
    // Continue unauthenticated if token verification fails
  }
  next();
}

function requireAdmin(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
  }
  next();
}

function checkSubscriptionGate(requiredTier: 'classique' | 'premium') {
  return async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    // 1. Mandatory authentication: AI endpoints ALWAYS require an authenticated account
    if (!req.user) {
      return res.status(401).json({
        error: "Veuillez vous connecter pour utiliser les fonctionnalités d'assistance intelligente.",
        requiresAuth: true
      });
    }

    // 2. Admins bypass all subscription gates
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // 3. Check if admin turned off payments globally
    const settings = await dbAdapter.getAppSettings();
    if (settings && settings.paiementActif === false) {
      // Payment gates disabled globally: authenticated users can access
      return next();
    }

    // 4. Validate userTier and enforce plan boundaries
    const userTier = req.user.subscriptionTier;
    const allowedTiers = ['decouverte', 'classique', 'premium'];
    if (!userTier || !allowedTiers.includes(userTier) || userTier === 'freemium') {
      return res.status(403).json({
        error: "Cette fonctionnalité requiert un abonnement actif.",
        requiresUpgrade: true,
        code: 'UPGRADE_REQUIRED'
      });
    }

    // Pack Découverte (7 days, templates & studio) does NOT unlock AI features
    if (userTier === 'decouverte') {
      return res.status(403).json({
        error: "Le Pack Découverte donne accès aux modèles HD et au Studio. Les fonctionnalités IA nécessitent la formule Classique ou Premium VIP.",
        requiresUpgrade: true,
        code: 'UPGRADE_REQUIRED'
      });
    }

    // Pack Classique only allows 'classique' tier features
    if (requiredTier === 'classique') {
      if (userTier !== 'classique' && userTier !== 'premium') {
        return res.status(403).json({
          error: "Cette fonctionnalité requiert la formule Classique ou Premium VIP.",
          requiresUpgrade: true,
          code: 'UPGRADE_REQUIRED'
        });
      }
    } else if (requiredTier === 'premium') {
      if (userTier !== 'premium') {
        return res.status(403).json({
          error: "Cette fonctionnalité avancée requiert un abonnement Premium VIP actif.",
          requiresUpgrade: true,
          code: 'UPGRADE_REQUIRED'
        });
      }
    }

    const isExpired = req.user.subscriptionExpiresAt
      ? new Date(req.user.subscriptionExpiresAt).getTime() < Date.now()
      : false;

    if (isExpired) {
      return res.status(403).json({
        error: "Votre abonnement a expiré. Veuillez renouveler votre formule pour continuer à utiliser les fonctionnalités intelligentes.",
        requiresUpgrade: true,
        code: 'SUBSCRIPTION_EXPIRED'
      });
    }

    next();
  };
}

// -------------------------------------------------------------
// PUBLIC & APP CONFIG ROUTES
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// -------------------------------------------------------------
// AI GEMINI SERVICES HELPERS
// -------------------------------------------------------------
let geminiAi: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiAi) {
    geminiAi = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  }
  return geminiAi;
}

function safeJsonParse<T>(text: string | null | undefined, fallback: T): T {
  if (!text || typeof text !== 'string') return fallback;
  try {
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    try {
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
    } catch {}
    return fallback;
  }
}

async function generateGeminiContentWithFallback(ai: GoogleGenAI, contents: any): Promise<string | null> {
  // Use fast, resilient model order with instant fallback (gemini-3.8-flash first as per gemini-api skill)
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

  for (const model of modelsToTry) {
    // Retry up to 2 times for transient errors (503 Service Unavailable / 429 Rate limit / 500 / 504)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: { responseMimeType: 'application/json' }
        });
        if (response?.text) return response.text;
      } catch (err: any) {
        const status = Number(err?.status || err?.statusCode || 0);
        const isTransient = status === 503 || status === 429 || status === 500 || status === 504;

        if (isTransient && attempt === 0) {
          // Brief pause before retry for transient capacity spikes
          await new Promise((resolve) => setTimeout(resolve, 350));
          continue;
        }

        // If JSON mode was rejected or unexpected format error, attempt without responseMimeType
        if (attempt === 0 && (status === 400 || !isTransient)) {
          try {
            const fallbackResponse = await ai.models.generateContent({
              model,
              contents
            });
            if (fallbackResponse?.text) return fallbackResponse.text;
          } catch {}
        }
        break; // Switch to next model
      }
    }
  }
  return null;
}

function formatParsedDataToSections(parsed: any, langue: string = 'fr'): any[] {
  const sections: any[] = [];
  const isEn = langue === 'en';

  if (parsed.profil) {
    sections.push({
      id: 'sec-profil',
      type: 'profil',
      titre: isEn ? 'Profile & Contact' : 'Profil & Coordonnées',
      ordre: 1,
      visible: true,
      contenu: {
        nomComplet: parsed.profil.nomComplet || '',
        titreProfessionnel: parsed.profil.titreProfessionnel || '',
        email: parsed.profil.email || '',
        telephone: parsed.profil.telephone || '',
        adresse: parsed.profil.adresse || '',
        website: parsed.profil.website || '',
        linkedin: parsed.profil.linkedin || '',
        resume: parsed.profil.resume || ''
      }
    });
  }

  if (Array.isArray(parsed.experiences) && parsed.experiences.length > 0) {
    sections.push({
      id: 'sec-exp',
      type: 'experience',
      titre: isEn ? 'Work Experience' : 'Expériences professionnelles',
      ordre: 2,
      visible: true,
      contenu: parsed.experiences.map((exp: any, idx: number) => ({
        id: `exp-ai-${idx}-${Date.now()}`,
        poste: exp.poste || 'Poste occupé',
        entreprise: exp.entreprise || 'Entreprise',
        ville: exp.ville || '',
        dateDebut: exp.dateDebut || '',
        dateFin: exp.dateFin || '',
        actuel: Boolean(exp.actuel),
        description: exp.description || ''
      }))
    });
  }

  if (Array.isArray(parsed.formations) && parsed.formations.length > 0) {
    sections.push({
      id: 'sec-edu',
      type: 'formation',
      titre: isEn ? 'Education' : 'Formations & Diplômes',
      ordre: 3,
      visible: true,
      contenu: parsed.formations.map((edu: any, idx: number) => ({
        id: `edu-ai-${idx}-${Date.now()}`,
        diplome: edu.diplome || 'Diplôme',
        etablissement: edu.etablissement || 'Établissement',
        ville: edu.ville || '',
        dateDebut: edu.dateDebut || '',
        dateFin: edu.dateFin || '',
        description: edu.description || ''
      }))
    });
  }

  if (Array.isArray(parsed.competences) && parsed.competences.length > 0) {
    sections.push({
      id: 'sec-skills',
      type: 'competences',
      titre: isEn ? 'Skills' : 'Compétences',
      ordre: 4,
      visible: true,
      contenu: parsed.competences.map((sk: any, idx: number) => ({
        id: `sk-ai-${idx}-${Date.now()}`,
        nom: typeof sk === 'string' ? sk : sk.nom || 'Compétence',
        niveau: typeof sk === 'object' && typeof sk.niveau === 'number' ? sk.niveau : 4
      }))
    });
  }

  if (Array.isArray(parsed.langues) && parsed.langues.length > 0) {
    sections.push({
      id: 'sec-lang',
      type: 'langues',
      titre: isEn ? 'Languages' : 'Langues',
      ordre: 5,
      visible: true,
      contenu: parsed.langues.map((l: any, idx: number) => ({
        id: `lang-ai-${idx}-${Date.now()}`,
        langue: typeof l === 'string' ? l : l.langue || 'Langue',
        niveau: typeof l === 'object' ? l.niveau || 'Courant' : 'Courant'
      }))
    });
  }

  if (Array.isArray(parsed.projets) && parsed.projets.length > 0) {
    sections.push({
      id: 'sec-proj',
      type: 'projets',
      titre: isEn ? 'Projects' : 'Projets',
      ordre: 6,
      visible: true,
      contenu: parsed.projets.map((p: any, idx: number) => ({
        id: `proj-ai-${idx}-${Date.now()}`,
        nom: p.nom || 'Projet',
        role: p.role || '',
        lien: p.lien || '',
        description: p.description || ''
      }))
    });
  }

  return sections;
}

function buildPlainTextFromParsed(data: any): string {
  if (!data) return '';
  const parts: string[] = [];

  // If data is Section[]
  if (Array.isArray(data)) {
    for (const sec of data) {
      if (sec.type === 'profil' && sec.contenu) {
        if (sec.contenu.nomComplet) parts.push(sec.contenu.nomComplet);
        if (sec.contenu.titreProfessionnel) parts.push(sec.contenu.titreProfessionnel);
        const contacts = [sec.contenu.email, sec.contenu.telephone, sec.contenu.adresse].filter(Boolean);
        if (contacts.length) parts.push(contacts.join(' | '));
        if (sec.contenu.resume) parts.push(`\nPROFIL:\n${sec.contenu.resume}`);
      } else if (sec.type === 'experience' && Array.isArray(sec.contenu)) {
        parts.push('\nEXPÉRIENCES:');
        sec.contenu.forEach((exp: any) => {
          parts.push(`- ${exp.poste || ''} chez ${exp.entreprise || ''} (${exp.dateDebut || ''} - ${exp.dateFin || ''}): ${exp.description || ''}`);
        });
      } else if (sec.type === 'formation' && Array.isArray(sec.contenu)) {
        parts.push('\nFORMATIONS:');
        sec.contenu.forEach((f: any) => {
          parts.push(`- ${f.diplome || ''} à ${f.etablissement || ''} (${f.dateFin || ''}): ${f.description || ''}`);
        });
      } else if (sec.type === 'competences' && Array.isArray(sec.contenu)) {
        parts.push('\nCOMPÉTENCES:');
        parts.push(sec.contenu.map((c: any) => typeof c === 'string' ? c : c.nom).filter(Boolean).join(', '));
      }
    }
    return parts.join('\n');
  }

  if (data.profil) {
    if (data.profil.nomComplet) parts.push(data.profil.nomComplet);
    if (data.profil.titreProfessionnel) parts.push(data.profil.titreProfessionnel);
    const contacts = [data.profil.email, data.profil.telephone, data.profil.adresse].filter(Boolean);
    if (contacts.length) parts.push(contacts.join(' | '));
    if (data.profil.resume) parts.push(`\nPROFIL:\n${data.profil.resume}`);
  }
  if (Array.isArray(data.experiences) && data.experiences.length > 0) {
    parts.push('\nEXPÉRIENCES:');
    data.experiences.forEach((exp: any) => {
      parts.push(`- ${exp.poste || ''} chez ${exp.entreprise || ''} (${exp.dateDebut || ''} - ${exp.dateFin || ''}): ${exp.description || ''}`);
    });
  }
  if (Array.isArray(data.formations) && data.formations.length > 0) {
    parts.push('\nFORMATIONS:');
    data.formations.forEach((f: any) => {
      parts.push(`- ${f.diplome || ''} à ${f.etablissement || ''} (${f.dateFin || ''}): ${f.description || ''}`);
    });
  }
  if (Array.isArray(data.competences) && data.competences.length > 0) {
    parts.push('\nCOMPÉTENCES:');
    parts.push(data.competences.map((c: any) => typeof c === 'string' ? c : c.nom).filter(Boolean).join(', '));
  }
  return parts.join('\n');
}

// -------------------------------------------------------------
// DOCUMENT PARSING ROUTE (AUTHENTICATED & RATE LIMITED)
// -------------------------------------------------------------
async function parseCVTextWithGemini(extractedText: string, langue: string = 'fr'): Promise<any[] | null> {
  const ai = getGemini();
  if (!ai) return null;

  try {
    const prompt = `Tu es un expert mondial en recrutement et analyse de CV.
Analyse scrupuleusement ce texte de CV brut et extrait l'intégralité des informations (coordonnées, profil, expériences professionnelles, formations/diplômes, compétences clés, langues parlées, projets).

Texte brut du CV :
"""
${extractedText.slice(0, 10000)}
"""

Réponds STRICTEMENT sous la forme d'un objet JSON valide au format exact suivant :
{
  "profil": {
    "nomComplet": "Nom et Prénom du candidat",
    "titreProfessionnel": "Titre ou poste principal",
    "email": "adresse e-mail ou ''",
    "telephone": "numéro de téléphone ou ''",
    "adresse": "ville/pays ou adresse ou ''",
    "website": "site web ou portfolio ou ''",
    "linkedin": "lien linkedin ou ''",
    "resume": "résumé / présentation du candidat"
  },
  "experiences": [
    {
      "poste": "Intitulé du poste",
      "entreprise": "Nom de l'entreprise",
      "ville": "Lieu / Ville",
      "dateDebut": "Date de début (ex: Jan 2020 ou 2020)",
      "dateFin": "Date de fin (ex: Présent ou 2023)",
      "actuel": false,
      "description": "Description détaillée des tâches et réalisations"
    }
  ],
  "formations": [
    {
      "diplome": "Diplôme ou certification obtenu",
      "etablissement": "Université, École ou Organisme",
      "ville": "Ville / Pays",
      "dateDebut": "Année de début",
      "dateFin": "Année de fin ou d'obtention",
      "description": "Détails / Mentions"
    }
  ],
  "competences": [
    { "nom": "Nom de la compétence", "niveau": 4 }
  ],
  "langues": [
    { "langue": "Nom de la langue", "niveau": "Courant / Maternelle / Intermédiaire" }
  ],
  "projets": [
    { "nom": "Nom du projet", "role": "Rôle dans le projet", "lien": "", "description": "Description du projet" }
  ]
}`;

    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = safeJsonParse<any>(responseText, null);
    if (!parsed) return null;

    const sections = formatParsedDataToSections(parsed, langue);
    return sections.length > 0 ? sections : null;
  } catch (err) {
    console.error('[PARSE CV AI ERROR]', err);
    return null;
  }
}

async function parseCVMultimodalWithGemini(
  buffer: Buffer,
  mimeType: string,
  langue: string = 'fr'
): Promise<{ text: string; sections: any[] | null }> {
  const ai = getGemini();
  if (!ai) return { text: '', sections: null };

  const prompt = `Tu es un expert mondial en analyse de CV et reconnaissance optique de documents (OCR).
Analyse scrupuleusement ce document de CV (qui peut être un document scanné, une image, ou un PDF sans texte vectoriel).
1. Lis et retranscris l'intégralité du texte visible de ce CV de manière exhaustive dans le champ "texteIntegral".
2. Extrais et structure l'intégralité des informations (coordonnées, profil, expériences professionnelles, formations/diplômes, compétences clés, langues parlées, projets).

Réponds STRICTEMENT sous la forme d'un objet JSON valide au format exact suivant :
{
  "texteIntegral": "L'intégralité du texte extrait mot à mot du document...",
  "profil": {
    "nomComplet": "Nom et Prénom du candidat",
    "titreProfessionnel": "Titre ou poste principal",
    "email": "adresse e-mail ou ''",
    "telephone": "numéro de téléphone ou ''",
    "adresse": "ville/pays ou adresse ou ''",
    "website": "site web ou portfolio ou ''",
    "linkedin": "lien linkedin ou ''",
    "resume": "résumé / présentation du candidat"
  },
  "experiences": [
    {
      "poste": "Intitulé du poste",
      "entreprise": "Nom de l'entreprise",
      "ville": "Lieu / Ville",
      "dateDebut": "Date de début",
      "dateFin": "Date de fin",
      "actuel": false,
      "description": "Description détaillée des tâches et réalisations"
    }
  ],
  "formations": [
    {
      "diplome": "Diplôme ou certification obtenu",
      "etablissement": "Université, École ou Organisme",
      "ville": "Ville / Pays",
      "dateDebut": "Année de début",
      "dateFin": "Année de fin ou d'obtention",
      "description": "Détails / Mentions"
    }
  ],
  "competences": [
    { "nom": "Nom de la compétence", "niveau": 4 }
  ],
  "langues": [
    { "langue": "Nom de la langue", "niveau": "Courant / Maternelle / Intermédiaire" }
  ],
  "projets": [
    { "nom": "Nom du projet", "role": "Rôle dans le projet", "lien": "", "description": "Description du projet" }
  ]
}`;

  let normalizedMime = mimeType || 'application/pdf';
  if (!normalizedMime || normalizedMime === 'application/octet-stream') {
    normalizedMime = 'application/pdf';
  }

  const contents = {
    parts: [
      { text: prompt },
      {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: normalizedMime
        }
      }
    ]
  };

  try {
    const responseText = await generateGeminiContentWithFallback(ai, contents);
    const parsed = safeJsonParse<any>(responseText, null);
    if (!parsed) return { text: '', sections: null };

    const sections = formatParsedDataToSections(parsed, langue);
    const text = (parsed.texteIntegral && typeof parsed.texteIntegral === 'string' && parsed.texteIntegral.trim().length > 15)
      ? parsed.texteIntegral.trim()
      : buildPlainTextFromParsed(parsed);

    return { text, sections: sections.length > 0 ? sections : null };
  } catch (err) {
    console.error('[MULTIMODAL OCR CV ERROR]', err);
    return { text: '', sections: null };
  }
}

app.post('/api/import/parse', authenticateToken, importLimiter, upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier reçu.' });
  }

  const file = req.file;
  const fileName = file.originalname || 'document';
  const ext = path.extname(fileName).toLowerCase();

  // Allow PDF, Word (.docx, .doc), Plain text (.txt, .rtf), and Images (.png, .jpg, .jpeg, .webp)
  const isPdf = ext === '.pdf' || file.mimetype === 'application/pdf';
  const isDocx = ext === '.docx' || ext === '.doc' || file.mimetype.includes('wordprocessingml') || file.mimetype.includes('msword');
  const isTxt = ext === '.txt' || ext === '.rtf' || file.mimetype.includes('text/plain');
  const isImage = ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.webp' || file.mimetype.startsWith('image/');

  if (!isPdf && !isDocx && !isTxt && !isImage) {
    return res.status(400).json({
      error: 'Format non autorisé. Seuls les fichiers .pdf, .docx, .txt et images (.png, .jpg) sont acceptés.'
    });
  }

  try {
    let extractedText = '';
    let aiSections: any[] | null = null;

    if (isPdf) {
      try {
        extractedText = await extractTextFromPDF(file.buffer);
      } catch (pdfErr) {
        console.warn('extractTextFromPDF standard parser failed, will use multimodal Gemini OCR:', pdfErr);
      }
    } else if (isDocx) {
      try {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = result.value || '';
      } catch (docxErr) {
        console.warn('DOCX extraction failed:', docxErr);
      }
    } else if (isTxt) {
      extractedText = file.buffer.toString('utf-8');
    }

    extractedText = (extractedText || '')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    // If text extraction yielded insufficient text (e.g. scanned PDF, image-based PDF, or image file),
    // trigger Gemini Vision / Multimodal OCR directly on the file buffer!
    if (extractedText.length < 20 && (isPdf || isImage)) {
      const mime = isPdf ? 'application/pdf' : (file.mimetype || 'image/jpeg');
      const ocrResult = await parseCVMultimodalWithGemini(file.buffer, mime, 'fr');
      if (ocrResult.text || ocrResult.sections) {
        extractedText = ocrResult.text || (ocrResult.sections ? buildPlainTextFromParsed(ocrResult.sections) : '');
        aiSections = ocrResult.sections;
      }
    }

    // If we have text from vector/text extraction but no sections yet, parse text with Gemini
    if (!aiSections && extractedText.length >= 20) {
      aiSections = await parseCVTextWithGemini(extractedText, 'fr');
    }

    if (!extractedText && (!aiSections || aiSections.length === 0)) {
      return res.status(400).json({
        error: 'Impossible d\'extraire le contenu de ce document. Essayez l\'onglet "Coller du texte brut" pour importer votre CV.'
      });
    }

    res.json({
      text: extractedText,
      sections: aiSections,
      fileName,
      characterCount: extractedText.length
    });
  } catch (err: any) {
    console.error('Error parsing document file:', err?.message || err);
    res.status(500).json({ error: 'Erreur lors de l\'extraction du texte du document.' });
  }
});

app.post('/api/import/parse-text', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { text = '', langue = 'fr' } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return res.status(400).json({ error: 'Le texte est trop court pour être analysé.' });
    }

    if (text.length > 50000) {
      return res.status(400).json({ error: 'Le texte est trop long (maximum 50 000 caractères).' });
    }

    const cleanText = text.trim();
    const aiSections = await parseCVTextWithGemini(cleanText, langue);

    return res.json({
      text: cleanText,
      sections: aiSections,
      characterCount: cleanText.length
    });
  } catch (err: any) {
    console.error('Error in parse-text:', err);
    return res.status(500).json({ error: 'Erreur lors de l\'analyse du texte brut.' });
  }
});

// -------------------------------------------------------------
// AUTHENTICATION ROUTES (BCRYPT + SIGNED JWT + GOOGLE AUTH + DB SESSIONS)
// -------------------------------------------------------------
app.post('/api/auth/session', async (req, res) => {
  try {
    const rawDeviceId = typeof req.body.deviceId === 'string' && req.body.deviceId ? req.body.deviceId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) : '';
    const deviceId = rawDeviceId || crypto.randomUUID().slice(0, 16);
    const guestEmail = `guest_${deviceId.slice(0, 12)}@moncvpro.internal`;
    const selectedLangue = req.body.langue || 'fr';

    let user = await dbAdapter.findUserByEmail(guestEmail);
    if (!user) {
      const dummyPassword = crypto.randomBytes(16).toString('hex');
      user = await dbAdapter.createUser({
        id: `u-gst-${deviceId.slice(0, 16)}`,
        nom: 'Visiteur',
        email: guestEmail,
        motDePasseHash: bcrypt.hashSync(dummyPassword, 10),
        role: 'USER',
        subscriptionTier: 'freemium',
        langue: selectedLangue
      });

    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { motDePasseHash, ...safeUser } = user as any;
    return res.json({ user: safeUser, token });
  } catch (err: any) {
    console.error('[AUTH SESSION ERROR]', err);
    return res.status(500).json({ error: 'Impossible d\'initialiser la session en base de données.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { nom, email, motDePasse, langue, guestUserId } = req.body;
  if (!email || !motDePasse || !nom) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  if (typeof motDePasse !== 'string' || motDePasse.length < 8) {
    return res.status(400).json({ error: 'Le mot de passe doit comporter au moins 8 caractères.' });
  }

  const existing = await dbAdapter.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Un compte existe déjà avec cet e-mail.' });
  }

  const passwordHash = bcrypt.hashSync(motDePasse, 10);

  // Self-registration MUST ALWAYS grant USER role and freemium tier (no auto-admin escalation)
  const newUser = await dbAdapter.createUser({
    nom,
    email,
    motDePasseHash: passwordHash,
    role: 'USER',
    langue: langue || 'fr',
    subscriptionTier: 'freemium'
  });

  // Reassign documents ONLY from unauthenticated guest/visitor sessions, NEVER from registered users
  if (guestUserId && typeof guestUserId === 'string') {
    const isGuestPrefix = guestUserId.startsWith('u-gst-') || guestUserId.startsWith('guest_') || guestUserId.startsWith('anon_') || guestUserId.startsWith('dev_');
    try {
      const existingRegisteredUser = await dbAdapter.findUserById(guestUserId);
      if (isGuestPrefix && !existingRegisteredUser) {
        await dbAdapter.reassignUserDocuments(guestUserId, newUser.id);
      } else {
        console.warn(`[SECURITY] Blocked reassigning documents from ${guestUserId} to ${newUser.id}: Not a valid guest ID or account already belongs to a registered user.`);
      }
    } catch (reassignErr) {
      console.warn('Could not reassign guest documents:', reassignErr);
    }
  }

  // Ensure new registered user has their own initial starter CV
  try {
    const userDocs = await dbAdapter.getCvsByUserId(newUser.id);
    if (!userDocs || userDocs.length === 0) {
      const initialPreset = getPresetForTemplate('modele-1', langue || 'fr');
      const cvDataPayload = {
        ...initialPreset,
        titre: initialPreset.titre || 'Mon CV Professionnel',
        templateId: 'modele-1',
        langue: langue || 'fr',
        statutPaiement: 'PAYE',
        isArchived: false,
        utilisateurId: newUser.id,
        userId: newUser.id
      };
      await dbAdapter.createCv({
        userId: newUser.id,
        titre: cvDataPayload.titre,
        templateId: 'modele-1',
        langue: langue || 'fr',
        cvData: cvDataPayload,
        statutPaiement: 'PAYE'
      });
    }
  } catch (initCvErr) {
    console.warn('Could not create starter CV for new user:', initCvErr);
  }

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { motDePasseHash, ...safeUser } = newUser as any;

  // Send welcome email asynchronously without blocking the response
  sendWelcomeEmail(newUser.email, newUser.nom).catch(err => {
    console.error('[AUTH REGISTER EMAIL ERROR]', err);
  });

  res.json({ user: safeUser, token });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, motDePasse } = req.body;
  if (!email || !motDePasse) {
    return res.status(400).json({ error: 'E-mail et mot de passe requis.' });
  }

  const normalizedEmail = (email || '').toLowerCase().trim();
  const user = await dbAdapter.findUserByEmail(normalizedEmail);

  if (!user || !user.motDePasseHash || !bcrypt.compareSync(motDePasse, user.motDePasseHash)) {
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { motDePasseHash, ...safeUser } = user as any;
  res.json({ user: safeUser, token });
});

// Forgot Password Request Route
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Une adresse e-mail valide est requise.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await dbAdapter.findUserByEmail(normalizedEmail);

  // Always return success response to prevent account enumeration
  if (!user) {
    return res.json({
      success: true,
      message: 'Si un compte est associé à cette adresse e-mail, un lien de réinitialisation sécurisé vous a été envoyé.'
    });
  }

  try {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour validity

    await dbAdapter.savePasswordResetToken(normalizedEmail, resetToken, expiresAt);

    const trustedAppUrl = process.env.APP_URL || process.env.FRONTEND_URL;
    let baseUrl: string;
    if (trustedAppUrl) {
      baseUrl = trustedAppUrl.replace(/\/+$/, '');
    } else if (process.env.NODE_ENV === 'production') {
      console.error('[SECURITY ERROR] APP_URL n\'est pas défini en environnement de production.');
      return res.status(500).json({ error: 'Erreur de configuration serveur (APP_URL manquant en production).' });
    } else {
      baseUrl = 'http://localhost:3000';
    }
    const resetUrl = `${baseUrl}?reset_token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Asynchronously dispatch email
    sendPasswordResetEmail({
      userEmail: user.email,
      userName: user.nom,
      resetUrl
    }).catch(err => {
      console.error('[PASSWORD RESET EMAIL ERROR]', err);
    });

    res.json({
      success: true,
      message: 'Si un compte est associé à cette adresse e-mail, un lien de réinitialisation sécurisé vous a été envoyé.'
    });
  } catch (err: any) {
    console.error('[FORGOT PASSWORD ERROR]', err);
    res.status(500).json({ error: 'Impossible de traiter la demande de réinitialisation.' });
  }
});

// Verify Reset Token Route
app.post('/api/auth/verify-reset-token', async (req, res) => {
  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ valid: false, error: 'Jeton de réinitialisation manquant.' });
  }

  try {
    const record = await dbAdapter.findPasswordResetToken(token);
    if (!record) {
      return res.status(400).json({ valid: false, error: 'Ce lien de réinitialisation est invalide ou a déjà été utilisé.' });
    }

    const expiryTime = new Date(record.expiresAt).getTime();
    if (isNaN(expiryTime) || expiryTime < Date.now()) {
      return res.status(400).json({ valid: false, error: 'Ce lien de réinitialisation a expiré (durée de validité : 1 heure). Veuillez refaire une demande.' });
    }

    res.json({ valid: true, email: record.email });
  } catch (err: any) {
    console.error('[VERIFY RESET TOKEN ERROR]', err);
    res.status(500).json({ valid: false, error: 'Erreur lors de la vérification du lien.' });
  }
});

// Reset Password Execution Route
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Jeton de réinitialisation manquant.' });
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit comporter au moins 8 caractères.' });
  }

  try {
    const record = await dbAdapter.findPasswordResetToken(token);
    if (!record) {
      return res.status(400).json({ error: 'Ce lien de réinitialisation est invalide ou a déjà été utilisé.' });
    }

    const expiryTime = new Date(record.expiresAt).getTime();
    if (isNaN(expiryTime) || expiryTime < Date.now()) {
      return res.status(400).json({ error: 'Ce lien de réinitialisation a expiré. Veuillez refaire une demande.' });
    }

    const user = await dbAdapter.findUserByEmail(record.email);
    if (!user) {
      return res.status(404).json({ error: 'Compte utilisateur associé introuvable.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await dbAdapter.updateUser(user.id, { motDePasseHash: newHash });
    await dbAdapter.deletePasswordResetToken(record.email);

    res.json({
      success: true,
      message: 'Votre mot de passe a été mis à jour avec succès ! Vous pouvez maintenant vous connecter.'
    });
  } catch (err: any) {
    console.error('[RESET PASSWORD ERROR]', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la réinitialisation du mot de passe.' });
  }
});

// Google & Firebase Sync Auth Route (VERIFIED VIA FIREBASE ADMIN SDK)
const handleGoogleOrFirebaseSync = async (req: express.Request, res: express.Response) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const idToken = tokenFromHeader || req.body.idToken || req.body.token;

    if (!idToken || typeof idToken !== 'string') {
      return res.status(401).json({ error: 'Jeton d\'authentification Firebase / Google manquant ou invalide.' });
    }

    // Cryptographically verify the token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken || !decodedToken.email) {
      return res.status(401).json({ error: 'Jeton Firebase non vérifié ou ne contenant aucune adresse e-mail.' });
    }

    // Require email_verified for password logins
    const isPasswordProvider = decodedToken.firebase?.sign_in_provider === 'password';
    if (isPasswordProvider && !decodedToken.email_verified) {
      return res.status(401).json({ error: 'Adresse e-mail non vérifiée. Veuillez vérifier votre e-mail dans Firebase avant de vous connecter.' });
    }

    // CRITICAL SECURITY: strictly trust decodedToken.email, NEVER unverified req.body
    const userEmail = decodedToken.email.toLowerCase().trim();
    const userName = decodedToken.name || (typeof req.body.displayName === 'string' && req.body.displayName.trim()) || (typeof req.body.nom === 'string' && req.body.nom.trim()) || userEmail.split('@')[0] || 'Utilisateur Google';

    let user = await dbAdapter.findUserByEmail(userEmail);
    if (!user) {
      const dummyPasswordHash = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10);
      user = await dbAdapter.createUser({
        nom: userName,
        email: userEmail,
        motDePasseHash: dummyPasswordHash,
        role: 'USER',
        subscriptionTier: 'freemium',
        langue: req.body.langue || 'fr'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { motDePasseHash, ...safeUser } = user as any;
    res.json({ user: safeUser, token });
  } catch (err: any) {
    console.error('[GOOGLE/FIREBASE AUTH VERIFICATION ERROR]', err);
    res.status(401).json({ error: 'Échec de vérification du jeton Google / Firebase. Connexion refusée.' });
  }
};

app.post('/api/auth/google', handleGoogleOrFirebaseSync);
app.post('/api/auth/firebase-sync', handleGoogleOrFirebaseSync);

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Non authentifié.' });
  const { motDePasseHash, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

app.put('/api/auth/profile', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Non authentifié.' });

  const { nom, langue, ancienMotDePasse, nouveauMotDePasse } = req.body;
  const user = await dbAdapter.findUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  }

  const updates: Record<string, any> = {};

  if (nom && typeof nom === 'string' && nom.trim()) {
    updates.nom = nom.trim();
  }

  if (langue && ['fr', 'en', 'ar'].includes(langue)) {
    updates.langue = langue;
  }

  if (nouveauMotDePasse) {
    // CRITICAL SECURITY: Ancien mot de passe strictement obligatoire pour empêcher la prise de compte via token volé
    if (user.motDePasseHash) {
      if (!ancienMotDePasse || typeof ancienMotDePasse !== 'string') {
        return res.status(400).json({ error: 'L\'ancien mot de passe est obligatoire pour définir un nouveau mot de passe.' });
      }
      const isValid = bcrypt.compareSync(ancienMotDePasse, user.motDePasseHash);
      if (!isValid) {
        return res.status(400).json({ error: 'L\'ancien mot de passe est incorrect.' });
      }
    }
    if (typeof nouveauMotDePasse !== 'string' || nouveauMotDePasse.length < 8) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit comporter au moins 8 caractères.' });
    }
    updates.motDePasseHash = bcrypt.hashSync(nouveauMotDePasse, 10);
  }

  const updatedUser = await dbAdapter.updateUser(user.id, updates);
  const { motDePasseHash, ...safeUser } = (updatedUser || { ...user, ...updates }) as any;
  const isAdmin = safeUser.role === 'ADMIN';
  if (isAdmin) {
    safeUser.role = 'ADMIN';
    safeUser.subscriptionTier = 'premium';
  }
  res.json({ user: safeUser, message: 'Profil mis à jour avec succès.' });
});

// -------------------------------------------------------------
// CV CRUD ROUTES (RESOURCE OWNERSHIP & IDOR PROTECTED)
// -------------------------------------------------------------
function ensureCompleteServerCV(cvObj: any): any {
  if (!cvObj) return cvObj;
  const templateId = cvObj.templateId || 'modele-1';
  const langue = cvObj.langue || 'fr';
  const preset = getPresetForTemplate(templateId, langue);
  const presetSections = preset?.sections || [];

  if (!cvObj.sections || !Array.isArray(cvObj.sections) || cvObj.sections.length === 0) {
    return {
      ...preset,
      ...cvObj,
      sections: JSON.parse(JSON.stringify(presetSections))
    };
  }

  const sections: any[] = [...cvObj.sections];
  const coreTypes = ['profil', 'experience', 'formation', 'competences', 'projets'];

  for (const cType of coreTypes) {
    const existingIdx = sections.findIndex((s: any) => s.type === cType);
    const pSec = presetSections.find((ps: any) => ps.type === cType);
    if (existingIdx === -1 && pSec) {
      sections.push(JSON.parse(JSON.stringify(pSec)));
    } else if (existingIdx >= 0 && pSec) {
      const existing = sections[existingIdx];
      const isEmpty = !existing.contenu ||
        (Array.isArray(existing.contenu) && existing.contenu.length === 0) ||
        (typeof existing.contenu === 'object' && Object.keys(existing.contenu).length === 0) ||
        (existing.type === 'profil' && !existing.contenu.nomComplet && !existing.contenu.resume);
      if (isEmpty) {
        sections[existingIdx] = {
          ...existing,
          contenu: JSON.parse(JSON.stringify(pSec.contenu))
        };
      }
    }
  }

  return {
    ...cvObj,
    sections
  };
}

app.get('/api/cv', optionalAuthenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.json({ cvs: [] });
  }
  let userCVs = await dbAdapter.getCvsByUserId(req.user.id);
  const populatedCVs = (userCVs || []).map((c: any) => ensureCompleteServerCV(c));
  res.json({ cvs: populatedCVs });
});

app.post('/api/cv', authenticateToken, async (req: AuthRequest, res) => {
  const { titre, templateId, langue, couleurAccent, police, sections, photoUrl, isPrefilled, isBlank } = req.body;

  // CRITICAL SECURITY FIX: Verify resource ownership before upsert if client supplies an ID
  if (req.body.id && typeof req.body.id === 'string') {
    const existingCv = await dbAdapter.getCvById(req.body.id);
    if (existingCv) {
      const cvOwnerId = existingCv.userId || (existingCv as any).utilisateurId;
      if (cvOwnerId && cvOwnerId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Accès non autorisé. Vous ne pouvez pas modifier ou écraser un CV appartenant à un autre utilisateur.'
        });
      }
    }
  }

  const selectedTemplateId = templateId || 'modele-1';
  const selectedLangue = langue || 'fr';

  const cleanPreset = getCleanPresetForTemplate(selectedTemplateId, selectedLangue);
  const samplePreset = getPresetForTemplate(selectedTemplateId, selectedLangue);

  const prefilledBool = isPrefilled !== undefined ? Boolean(isPrefilled) : (isBlank !== undefined ? !isBlank : true);
  const activePreset = prefilledBool ? samplePreset : cleanPreset;
  const defaultSections = sections || activePreset.sections;

  const cvDataPayload = {
    ...activePreset,
    ...req.body,
    titre: req.body.titre || titre || activePreset.titre || 'Nouveau CV',
    templateId: req.body.templateId || selectedTemplateId,
    langue: req.body.langue || selectedLangue,
    couleurAccent: req.body.couleurAccent || couleurAccent || activePreset.couleurAccent || '#2563EB',
    police: req.body.police || police || activePreset.police || 'Inter',
    photoUrl: req.body.photoUrl !== undefined ? req.body.photoUrl : (photoUrl !== undefined ? photoUrl : (prefilledBool ? samplePreset.photoUrl : '')),
    afficherPhoto: true,
    sections: req.body.sections || defaultSections
  };

  const newCV = await dbAdapter.createCv({
    id: req.body.id,
    userId: req.user!.id,
    titre: cvDataPayload.titre,
    templateId: selectedTemplateId,
    langue: selectedLangue,
    cvData: cvDataPayload,
    statutPaiement: 'PAYE'
  });

  res.json({ cv: { ...newCV, ...cvDataPayload, id: newCV.id || req.body.id, utilisateurId: req.user!.id } });
});

app.get('/api/cv/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const cv = await dbAdapter.getCvById(id);

  if (!cv) {
    return res.status(404).json({ error: 'CV non trouvé.' });
  }

  const cvOwnerId = cv.userId || (cv as any).utilisateurId;
  if (cvOwnerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès non autorisé à ce CV.' });
  }

  const cvObj = (cv as any).cvData ? { ...cv, ...((cv as any).cvData as any), utilisateurId: cvOwnerId } : cv;
  const populatedCV = ensureCompleteServerCV(cvObj);
  res.json({ cv: populatedCV });
});

app.put('/api/cv/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const rawBody = req.body || {};
  const existing = await dbAdapter.getCvById(id);

  if (!existing) {
    return res.status(404).json({ error: 'CV non trouvé.' });
  }

  const ownerId = existing.userId || (existing as any).utilisateurId;
  if (ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès non autorisé.' });
  }

  // WHITELISTING MANDATE: Filter out user_id, statutPaiement, createdAt
  const { utilisateurId, userId, statutPaiement, createdAt, id: _ignoreId, ...allowedUpdates } = rawBody;

  const updatedCv = await dbAdapter.updateCvWhitelisted(id, ownerId, {
    titre: allowedUpdates.titre,
    templateId: allowedUpdates.templateId,
    langue: allowedUpdates.langue,
    cvData: allowedUpdates,
    isArchived: allowedUpdates.isArchived
  });

  res.json({ cv: updatedCv || { ...existing, ...allowedUpdates, utilisateurId: ownerId } });
});

app.delete('/api/cv/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const existing = await dbAdapter.getCvById(id);
  if (!existing) {
    return res.status(404).json({ error: 'CV non trouvé.' });
  }

  const ownerId = existing.userId || (existing as any).utilisateurId;
  if (ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès non autorisé.' });
  }

  await dbAdapter.deleteCv(id, ownerId);
  res.json({ success: true });
});

app.post('/api/cv/:id/duplicate', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const original = await dbAdapter.getCvById(id);
  if (!original) {
    return res.status(404).json({ error: 'CV non trouvé.' });
  }

  const ownerId = original.userId || (original as any).utilisateurId;
  if (ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès non autorisé.' });
  }

  const duplicatedData = (original as any).cvData ? JSON.parse(JSON.stringify((original as any).cvData)) : JSON.parse(JSON.stringify(original));
  duplicatedData.titre = `${original.titre || 'CV'} (Copie)`;

  const duplicated = await dbAdapter.createCv({
    userId: req.user!.id,
    titre: duplicatedData.titre,
    templateId: original.templateId || 'modele-1',
    langue: original.langue || 'fr',
    cvData: duplicatedData,
    statutPaiement: 'PAYE'
  });

  res.json({ cv: { ...duplicated, ...duplicatedData, utilisateurId: req.user!.id } });
});

// -------------------------------------------------------------
// COVER LETTERS PERSISTENCE CRUD (AUTHENTICATED & IDOR PROTECTED)
// -------------------------------------------------------------
app.get('/api/lettres', optionalAuthenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    // Unauthenticated visitors do not share any server database records
    return res.json({ letters: [] });
  }
  const letters = await dbAdapter.getLettersByUserId(req.user.id);
  res.json({ letters: letters || [] });
});

app.post('/api/lettres', authenticateToken, async (req: AuthRequest, res) => {
  const user = req.user!;
  const letterData = req.body || {};

  // If this letter already has an ID and exists in database, perform an update with ownership verification
  if (letterData.id) {
    const existing = await dbAdapter.getLetterById(letterData.id);
    if (existing) {
      const ownerId = existing.userId || (existing as any).utilisateurId;
      if (ownerId !== user.id && user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Accès non autorisé. Cette lettre appartient à un autre compte.' });
      }
      const { utilisateurId, userId, dateCreation, id: _ignoreId, ...allowedUpdates } = letterData;
      const updated = await dbAdapter.updateLetterWhitelisted(letterData.id, ownerId, {
        titre: allowedUpdates.titre || existing.titre,
        templateId: allowedUpdates.templateId || existing.templateId,
        langue: allowedUpdates.langue || existing.langue,
        letterData: allowedUpdates,
        entreprise: allowedUpdates.entreprise,
        poste: allowedUpdates.poste,
        destinataire: allowedUpdates.destinataire,
        objet: allowedUpdates.objet
      });
      return res.json({ letter: updated || { ...existing, ...allowedUpdates, utilisateurId: ownerId } });
    }
  }

  const newLetterPayload = {
    titre: letterData.titre || 'Nouvelle lettre de motivation',
    destinataire: letterData.destinataire || 'Direction des Ressources Humaines',
    entreprise: letterData.entreprise || 'Entreprise Cible',
    poste: letterData.poste || 'Poste Visé',
    villeDate: letterData.villeDate || `Fait le ${new Date().toLocaleDateString('fr-FR')}`,
    langue: letterData.langue || 'fr',
    police: letterData.police || 'Inter',
    couleurAccent: letterData.couleurAccent || '#2563EB',
    expediteur: letterData.expediteur || { nomComplet: user.nom, email: user.email },
    objet: letterData.objet || 'Candidature',
    formulePolitesseEntree: letterData.formulePolitesseEntree || 'Madame, Monsieur,',
    paragrapheAccroche: letterData.paragrapheAccroche || '',
    paragrapheValeurAjoutee: letterData.paragrapheValeurAjoutee || '',
    paragrapheAdequationEntreprise: letterData.paragrapheAdequationEntreprise || '',
    paragrapheConclusion: letterData.paragrapheConclusion || '',
    formulePolitesseSortie: letterData.formulePolitesseSortie || 'Veuillez agréer mes salutations distinguées.',
    texteComplet: letterData.texteComplet || '',
    signature: letterData.signature || user.nom
  };

  const created = await dbAdapter.createLetter({
    userId: user.id,
    titre: newLetterPayload.titre,
    templateId: letterData.templateId || 'classique',
    langue: newLetterPayload.langue,
    letterData: newLetterPayload
  });

  res.json({ letter: { ...created, ...newLetterPayload, utilisateurId: user.id } });
});

app.get('/api/lettres/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const letter = await dbAdapter.getLetterById(id);

  if (!letter) return res.status(404).json({ error: 'Lettre non trouvée.' });

  const ownerId = letter.userId || (letter as any).utilisateurId;
  if (ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès non autorisé.' });
  }

  const letterObj = (letter as any).letterData ? { ...letter, ...((letter as any).letterData as any), utilisateurId: ownerId } : letter;
  res.json({ letter: letterObj });
});

app.put('/api/lettres/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const rawBody = req.body || {};

  const existing = await dbAdapter.getLetterById(id);
  if (!existing) return res.status(404).json({ error: 'Lettre non trouvée.' });

  const ownerId = existing.userId || (existing as any).utilisateurId;
  if (ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès non autorisé.' });
  }

  // WHITELISTING MANDATE: Filter out utilisateurId, userId, dateCreation
  const { utilisateurId, userId, dateCreation, id: _ignoreId, ...allowedUpdates } = rawBody;

  const updated = await dbAdapter.updateLetterWhitelisted(id, ownerId, {
    titre: allowedUpdates.titre,
    templateId: allowedUpdates.templateId,
    langue: allowedUpdates.langue,
    letterData: allowedUpdates,
    entreprise: allowedUpdates.entreprise,
    poste: allowedUpdates.poste,
    destinataire: allowedUpdates.destinataire,
    objet: allowedUpdates.objet
  });

  res.json({ letter: updated || { ...existing, ...allowedUpdates, utilisateurId: ownerId } });
});

app.delete('/api/lettres/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const letter = await dbAdapter.getLetterById(id);

  if (!letter) return res.status(404).json({ error: 'Lettre non trouvée.' });

  const ownerId = letter.userId || (letter as any).utilisateurId;
  if (ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès non autorisé.' });
  }

  await dbAdapter.deleteLetter(id, ownerId);
  res.json({ success: true });
});

app.post('/api/lettres/:id/duplicate', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const original = await dbAdapter.getLetterById(id);
  if (!original) {
    return res.status(404).json({ error: 'Lettre non trouvée.' });
  }

  const ownerId = original.userId || (original as any).utilisateurId;
  if (ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès non autorisé.' });
  }

  const letterData = (original as any).letterData ? JSON.parse(JSON.stringify((original as any).letterData)) : { ...original };
  letterData.titre = `${original.titre || 'Lettre'} (Copie)`;

  const duplicated = await dbAdapter.createLetter({
    userId: req.user!.id,
    titre: letterData.titre,
    templateId: original.templateId || 'classique',
    langue: original.langue || 'fr',
    letterData
  });

  res.json({ letter: { ...duplicated, ...letterData, utilisateurId: req.user!.id } });
});

// -------------------------------------------------------------
// SECURE SERVER-SIDE CV EXPORTS (ANTI-BYPASS & ATS VECTOR GUARANTEED)
// -------------------------------------------------------------
function buildPlainTextCV(cv: any): string {
  const profilSec = cv.sections?.find((s: any) => s.type === 'profil');
  const profil = profilSec?.contenu || {};

  let text = `${(profil.nomComplet || cv.titre || 'CURRICULUM VITAE').toUpperCase()}\n`;
  if (profil.titreProfessionnel) text += `${profil.titreProfessionnel}\n`;
  text += `Email: ${profil.email || ''} | Tel: ${profil.telephone || ''} | Ville: ${profil.adresse || ''}\n`;
  if (profil.linkedin) text += `LinkedIn: ${profil.linkedin}\n`;
  if (profil.siteWeb) text += `Site: ${profil.siteWeb}\n`;
  text += `${'='.repeat(60)}\n\n`;

  if (profil.resume) {
    text += `PROFIL PROFESSIONNEL\n${'-'.repeat(30)}\n${profil.resume}\n\n`;
  }

  for (const sec of cv.sections || []) {
    if (sec.type === 'profil' || sec.visible === false) continue;
    text += `${(sec.titre || sec.type).toUpperCase()}\n${'-'.repeat(30)}\n`;

    if (sec.type === 'experience' || sec.type === 'experiences') {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      for (const it of items) {
        text += `• ${it.poste} - ${it.entreprise} (${it.ville || ''})\n`;
        text += `  Période: ${it.dateDebut} - ${it.actuel ? 'Présent' : it.dateFin}\n`;
        if (it.description) text += `  ${it.description}\n`;
        if (Array.isArray(it.taches)) {
          for (const t of it.taches) text += `    - ${t}\n`;
        }
        text += '\n';
      }
    } else if (sec.type === 'formation' || sec.type === 'formations') {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      for (const it of items) {
        text += `• ${it.diplome} - ${it.etablissement} (${it.ville || ''})\n`;
        text += `  Année: ${it.dateDebut} - ${it.actuel ? 'Présent' : it.dateFin}\n\n`;
      }
    } else if (sec.type === 'competences') {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      text += items.map((c: any) => c.nom + (c.niveau ? ` (${c.niveau}/10)` : '')).join(', ') + '\n\n';
    } else if (sec.type === 'langues') {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      text += items.map((l: any) => `${l.langue} (${l.niveau})`).join(', ') + '\n\n';
    } else if (sec.type === 'interets') {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      text += items.map((i: any) => i.nom).filter(Boolean).join(', ') + '\n\n';
    }
  }

  return text;
}

async function checkExportSecurity(req: AuthRequest, cv: any, format: 'pdf' | 'docx' | 'json' | 'txt') {
  const user = await dbAdapter.findUserById(req.user!.id);
  if (!user) {
    throw { status: 401, error: 'Utilisateur non trouvé.' };
  }

  const now = Date.now();
  const currentExpiryMs = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).getTime() : 0;
  const isActive = !isNaN(currentExpiryMs) && currentExpiryMs > now;
  const effectiveTier = (user.role === 'ADMIN') ? 'premium' : (isActive ? user.subscriptionTier : 'freemium');

  // Gating rule 1: Non-PDF formats are strictly reserved for paid tiers (Classique or Premium)
  if (format !== 'pdf' && effectiveTier === 'freemium') {
    throw {
      status: 403,
      error: `Le format d'export .${format.toUpperCase()} est réservé aux forfaits payants (Classique ou Premium).`
    };
  }

  // Gating rule 2: Check if CV uses paid features in the database matrix
  const settings = await dbAdapter.getAppSettings();
  const paymentActive = settings?.paiementActif !== false;
  if (effectiveTier === 'freemium' && paymentActive && cv.statutPaiement !== 'PAYE') {
    const detected = detectPaidFeaturesInCV(cv, effectiveTier);
    if (detected.length > 0) {
      throw {
        status: 403,
        error: `Ce CV utilise des fonctionnalités réservées aux forfaits payants : ${detected.map(d => d.name).join(', ')}.`,
        features: detected
      };
    }
  }

  return { user, effectiveTier };
}

app.post('/api/export/pdf', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const cv = req.body?.cv || req.body;
    if (!cv || !cv.sections) {
      return res.status(400).json({ error: 'Contenu du CV manquant ou invalide.' });
    }

    await checkExportSecurity(req, cv, 'pdf');

    const pdf = generateVectorPDF(cv);
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    const cleanFilename = (cv.titre || 'CV_Professionnel').replace(/[^a-zA-Z0-9_-]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('[EXPORT PDF ERROR]', err);
    res.status(err.status || 500).json({ error: err.error || err.message || 'Erreur lors de la génération du PDF.' });
  }
});

app.post('/api/export/docx', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const cv = req.body?.cv || req.body;
    if (!cv || !cv.sections) {
      return res.status(400).json({ error: 'Contenu du CV manquant ou invalide.' });
    }

    await checkExportSecurity(req, cv, 'docx');

    const doc = buildDocxDocument(cv);
    const docxBuffer = await Packer.toBuffer(doc);
    const cleanFilename = (cv.titre || 'CV_Professionnel').replace(/[^a-zA-Z0-9_-]/g, '_');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}.docx"`);
    res.send(docxBuffer);
  } catch (err: any) {
    console.error('[EXPORT DOCX ERROR]', err);
    res.status(err.status || 500).json({ error: err.error || err.message || 'Erreur lors de la génération du DOCX.' });
  }
});

app.post('/api/export/json', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const cv = req.body?.cv || req.body;
    if (!cv || !cv.sections) {
      return res.status(400).json({ error: 'Contenu du CV manquant ou invalide.' });
    }

    await checkExportSecurity(req, cv, 'json');

    const cleanFilename = (cv.titre || 'CV_Professionnel').replace(/[^a-zA-Z0-9_-]/g, '_');
    const jsonStr = JSON.stringify(cv, null, 2);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}.json"`);
    res.send(Buffer.from(jsonStr, 'utf-8'));
  } catch (err: any) {
    console.error('[EXPORT JSON ERROR]', err);
    res.status(err.status || 500).json({ error: err.error || err.message || 'Erreur lors de l’export JSON.' });
  }
});

app.post('/api/export/txt', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const cv = req.body?.cv || req.body;
    if (!cv || !cv.sections) {
      return res.status(400).json({ error: 'Contenu du CV manquant ou invalide.' });
    }

    await checkExportSecurity(req, cv, 'txt');

    const cleanFilename = (cv.titre || 'CV_Professionnel').replace(/[^a-zA-Z0-9_-]/g, '_');
    const txtStr = buildPlainTextCV(cv);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}.txt"`);
    res.send(Buffer.from(txtStr, 'utf-8'));
  } catch (err: any) {
    console.error('[EXPORT TXT ERROR]', err);
    res.status(err.status || 500).json({ error: err.error || err.message || 'Erreur lors de l’export texte brut.' });
  }
});

// -------------------------------------------------------------
// IKEEPAY SECURE PAYMENT INTEGRATION & VERIFICATION
// -------------------------------------------------------------
async function applyPlanToUser(userId: string, paymentId: string, planTier: string) {
  const settings = await dbAdapter.getAppSettings();
  const pricingPlans = settings?.pricingPlans || [];
  const matchingPlan = pricingPlans.find((p: any) => p.code === planTier);
  if (!matchingPlan || typeof matchingPlan.prix !== 'number' || typeof matchingPlan.dureeJours !== 'number') {
    console.error(`[PAYMENT SECURITY CRITICAL] Plan introuvable en base pour planTier="${planTier}", userId="${userId}", paymentId="${paymentId}"`);
    throw new Error(`Configuration de forfait introuvable pour le plan ${planTier}`);
  }
  const newDurationDays = matchingPlan.dureeJours;

  const targetUser = await dbAdapter.findUserById(userId);
  if (!targetUser) throw new Error('Utilisateur non trouvé.');

  const now = Date.now();
  const currentExpiryMs = targetUser.subscriptionExpiresAt ? new Date(targetUser.subscriptionExpiresAt).getTime() : 0;
  const isActive = !isNaN(currentExpiryMs) && currentExpiryMs > now;

  const tierWeights: Record<string, number> = { freemium: 0, decouverte: 1, classique: 2, premium: 3 };
  const currentTier = targetUser.subscriptionTier || 'freemium';
  const currentWeight = tierWeights[currentTier] || 0;
  const targetWeight = tierWeights[planTier] || 0;

  let newExpiryMs: number;
  let finalTier: 'freemium' | 'decouverte' | 'classique' | 'premium' = planTier as any;

  if (isActive) {
    if (targetWeight > currentWeight) {
      // UPGRADE: Prorate remaining days of lower tier into higher tier
      const remainingMs = currentExpiryMs - now;
      const remainingDays = remainingMs / (24 * 60 * 60 * 1000);
      const currentPlan = pricingPlans.find((p: any) => p.code === currentTier);
      if (!currentPlan || typeof currentPlan.prix !== 'number') {
        console.error(`[PAYMENT SECURITY CRITICAL] Plan actuel introuvable en base pour currentTier="${currentTier}", userId="${userId}"`);
        throw new Error(`Configuration de forfait introuvable pour le plan actuel ${currentTier}`);
      }
      const currentPlanPrice = currentPlan.prix;
      const newPlanPrice = matchingPlan.prix;
      const ratio = newPlanPrice > 0 ? (currentPlanPrice / newPlanPrice) : 1;
      const proratedDays = Math.floor(remainingDays * Math.min(ratio, 1.0));
      const totalDays = newDurationDays + proratedDays;
      newExpiryMs = now + (totalDays * 24 * 60 * 60 * 1000);
      finalTier = planTier as any;
    } else if (targetWeight === currentWeight) {
      // SAME TIER: Stack new days onto remaining active expiry
      newExpiryMs = currentExpiryMs + (newDurationDays * 24 * 60 * 60 * 1000);
      finalTier = currentTier as any;
    } else {
      // DOWNGRADE: Keep higher tier, extend expiration after current expiry
      const currentPlan = pricingPlans.find((p: any) => p.code === currentTier);
      if (!currentPlan || typeof currentPlan.prix !== 'number') {
        console.error(`[PAYMENT SECURITY CRITICAL] Plan actuel introuvable en base pour currentTier="${currentTier}", userId="${userId}"`);
        throw new Error(`Configuration de forfait introuvable pour le plan actuel ${currentTier}`);
      }
      const currentPlanPrice = currentPlan.prix;
      const newPlanPrice = matchingPlan.prix;
      const ratio = currentPlanPrice > 0 ? (newPlanPrice / currentPlanPrice) : 1;
      const proratedDays = Math.floor(newDurationDays * Math.min(ratio, 1.0));
      newExpiryMs = currentExpiryMs + (proratedDays * 24 * 60 * 60 * 1000);
      finalTier = currentTier as any;
    }
  } else {
    // FRESH OR EXPIRED SUBSCRIPTION
    newExpiryMs = now + (newDurationDays * 24 * 60 * 60 * 1000);
    finalTier = planTier as any;
  }

  const expiryDate = new Date(newExpiryMs).toISOString();

  await dbAdapter.updateUser(userId, {
    subscriptionTier: finalTier,
    subscriptionExpiresAt: expiryDate
  });

  await dbAdapter.createSubscriptionRecord({
    userId,
    paymentId,
    planTier: finalTier,
    startsAt: new Date(now).toISOString(),
    expiresAt: expiryDate
  });

  return {
    tier: finalTier,
    expiresAt: expiryDate,
    durationDays: newDurationDays
  };
}

app.get('/api/payment/ikeepay-config', async (req, res) => {
  const settings = await dbAdapter.getAppSettings();
  res.json({
    publicKey: IKEEPAY_PUBLIC_KEY,
    currency: 'XOF',
    paiementActif: settings?.paiementActif ?? true,
    plans: settings?.pricingPlans || []
  });
});

app.post('/api/payment/ikeepay-initiate', authenticateToken, async (req: AuthRequest, res) => {
  const { planTier = 'classique' } = req.body;
  
  const allowedTiers = ['decouverte', 'classique', 'premium'];
  if (!allowedTiers.includes(planTier)) {
    return res.status(400).json({ error: 'Formule d\'abonnement invalide. Formules autorisées : decouverte, classique, premium.' });
  }

  const settings = await dbAdapter.getAppSettings();
  const plans = settings?.pricingPlans || [];
  const plan = plans.find((p: any) => p.code === planTier);

  if (!plan) {
    return res.status(400).json({ error: 'Formule d\'abonnement non trouvée ou non configurée.' });
  }
  if (plan.actif === false) {
    return res.status(400).json({ error: 'Cette formule d\'abonnement est actuellement désactivée.' });
  }

  // Prevent purchasing a lower plan while a higher plan is active
  const user = await dbAdapter.findUserById(req.user!.id);
  const now = Date.now();
  if (user?.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt).getTime() > now) {
    const tierWeights: Record<string, number> = { freemium: 0, decouverte: 1, classique: 2, premium: 3 };
    const currentWeight = tierWeights[user.subscriptionTier || 'freemium'] || 0;
    const targetWeight = tierWeights[planTier] || 0;
    if (targetWeight < currentWeight) {
      return res.status(400).json({
        error: `Vous bénéficiez déjà d'un abonnement ${user.subscriptionTier.toUpperCase()} actif. Vous ne pouvez pas souscrire à une formule inférieure pendant votre période active.`
      });
    }
  }

  const amount = Number(plan.prix);
  const transactionRef = `IKP_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const newPayment = await dbAdapter.createPayment({
    userId: req.user!.id,
    planTier,
    montant: amount,
    devise: plan.devise || 'FCFA',
    referenceTransaction: transactionRef,
    statut: 'EN_ATTENTE',
    metadata: { userEmail: req.user!.email, userName: req.user!.nom }
  });

  res.json({
    success: true,
    transactionRef,
    amount,
    publicKey: IKEEPAY_PUBLIC_KEY,
    currency: 'XOF',
    payment: newPayment
  });
});

app.post('/api/payment/ikeepay-verify', authenticateToken, async (req: AuthRequest, res) => {
  const { transactionRef } = req.body;
  if (!transactionRef || typeof transactionRef !== 'string') {
    return res.status(400).json({ error: 'Référence de transaction requise.' });
  }

  const paymentRecord = await dbAdapter.findPaymentByRef(transactionRef);

  if (!paymentRecord || paymentRecord.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Transaction non trouvée ou non associée à votre compte.' });
  }

  if (paymentRecord.statut === 'VALIDE') {
    const user = await dbAdapter.findUserById(req.user!.id);
    return res.json({
      success: true,
      subscriptionTier: user?.subscriptionTier || paymentRecord.planTier,
      expiresAt: user?.subscriptionExpiresAt,
      message: 'Transaction déjà vérifiée et validée.'
    });
  }

  const expectedAmount = Number(paymentRecord.montant);

  let verified = false;
  if (IKEEPAY_PRIVATE_KEY) {
    try {
      const apiRes = await fetch(`https://api.ikeepay.com/v1/checkout/verify/${transactionRef}`, {
        headers: { 'Authorization': `Bearer ${IKEEPAY_PRIVATE_KEY}` }
      });
      if (apiRes.ok) {
        const verifyData = await apiRes.json();
        if (verifyData.status === 'SUCCESS' || verifyData.status === 'COMPLETED') {
          if (verifyData.amount !== undefined && Number(verifyData.amount) === expectedAmount) {
            verified = true;
          }
        }
      }
    } catch (e) {
      console.warn('iKeePay verification check error:', e);
    }
  } else {
    return res.status(400).json({
      error: 'La vérification en ligne iKeePay n\'est pas configurée sur le serveur. Veuillez contacter le support.'
    });
  }

  if (!verified) {
    return res.status(400).json({
      error: 'Impossible de vérifier automatiquement le paiement. Le statut ou le montant ne correspond pas.'
    });
  }

  // ATOMIC CLAIM TO PREVENT DOUBLE CREDIT RACE CONDITION WITH WEBHOOK
  const claimed = await dbAdapter.claimAndValidatePayment(paymentRecord.id);
  if (!claimed) {
    const user = await dbAdapter.findUserById(req.user!.id);
    return res.json({
      success: true,
      subscriptionTier: user?.subscriptionTier || paymentRecord.planTier,
      expiresAt: user?.subscriptionExpiresAt,
      message: 'Transaction déjà traitée.'
    });
  }

  const subResult = await applyPlanToUser(req.user!.id, paymentRecord.id, paymentRecord.planTier);

  const matchingPlan = (await dbAdapter.getAppSettings())?.pricingPlans?.find((p: any) => p.code === paymentRecord.planTier);
  sendSubscriptionConfirmationEmail({
    userEmail: req.user!.email,
    userName: req.user!.nom,
    planName: matchingPlan?.nom || `Pack ${paymentRecord.planTier.toUpperCase()}`,
    planTier: subResult.tier,
    amount: expectedAmount,
    currency: paymentRecord.devise || 'FCFA',
    durationDays: subResult.durationDays,
    expiresAt: subResult.expiresAt
  }).catch(err => {
    console.error('[PAYMENT VERIFY CONFIRMATION EMAIL ERROR]', err);
  });

  res.json({
    success: true,
    subscriptionTier: subResult.tier,
    expiresAt: subResult.expiresAt,
    message: `Abonnement ${subResult.tier.toUpperCase()} activé avec succès.`
  });
});

function safeTimingEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// HMAC-SHA256 signature verification for webhooks
function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

app.post('/api/payment/ikeepay-webhook', async (req, res) => {
  const signatureHeader = (req.headers['x-ikeepay-signature'] || req.headers['x-webhook-secret']) as string;
  const payload = JSON.stringify(req.body);

  if (!IKEEPAY_WEBHOOK_SECRET || !signatureHeader) {
    return res.status(401).json({ error: 'Secret de webhook non configuré.' });
  }

  // Verify HMAC-SHA256 signature
  const isValidSignature = verifyHmacSignature(payload, signatureHeader, IKEEPAY_WEBHOOK_SECRET);
  if (!isValidSignature) {
    return res.status(401).json({ error: 'Signature webhook invalide.' });
  }

  const { reference, status } = req.body;
  if (!reference) {
    return res.status(400).json({ error: 'Référence de transaction requise.' });
  }

  const paymentRecord = await dbAdapter.findPaymentByRef(reference);
  if (!paymentRecord) {
    return res.status(404).json({ error: 'Transaction non trouvée.' });
  }

  if (paymentRecord.statut === 'VALIDE') {
    return res.json({ success: true, message: 'Transaction déjà traitée et validée via webhook.', tier: paymentRecord.planTier });
  }

  if (status === 'SUCCESS' || status === 'COMPLETED') {
    let isValidWebhook = false;

    if (IKEEPAY_PRIVATE_KEY) {
      try {
        const apiRes = await fetch(`https://api.ikeepay.com/v1/checkout/verify/${reference}`, {
          headers: { 'Authorization': `Bearer ${IKEEPAY_PRIVATE_KEY}` }
        });
        if (apiRes.ok) {
          const verifyData = await apiRes.json();
          if ((verifyData.status === 'SUCCESS' || verifyData.status === 'COMPLETED') &&
              verifyData.amount !== undefined &&
              Number(verifyData.amount) === Number(paymentRecord.montant)) {
            isValidWebhook = true;
          }
        }
      } catch (e) {
        console.warn('Webhook iKeePay verification check error:', e);
      }
    } else {
      console.warn('[WEBHOOK SECURITY] IKEEPAY_PRIVATE_KEY non configuré. Verification impossible.');
      isValidWebhook = false;
    }

    if (!isValidWebhook) {
      return res.status(400).json({ error: 'Transaction non confirmée par la passerelle de paiement.' });
    }

    // ATOMIC CLAIM TO PREVENT DOUBLE CREDIT RACE CONDITION WITH VERIFY
    const claimed = await dbAdapter.claimAndValidatePayment(paymentRecord.id);
    if (!claimed) {
      return res.json({ success: true, message: 'Transaction déjà traitée.', tier: paymentRecord.planTier });
    }

    const subResult = await applyPlanToUser(paymentRecord.userId, paymentRecord.id, paymentRecord.planTier);

    return res.json({ success: true, message: 'Paiement validé via webhook.', tier: subResult.tier });
  }

  res.status(400).json({ error: 'Statut de transaction non pris en charge.' });
});

// -------------------------------------------------------------
// ADMIN MANAGEMENT ENDPOINTS
// -------------------------------------------------------------
app.get('/api/admin/subscriptions', authenticateToken, requireAdmin, async (req, res) => {
  const users = await dbAdapter.getAllUsers();
  const now = Date.now();
  const subscriptions = users.map(u => {
    const expiresAt = u.subscriptionExpiresAt;
    const isExpired = expiresAt ? new Date(expiresAt).getTime() < now : false;
    const remainingDays = expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / (1000 * 60 * 60 * 24))) : 0;

    return {
      userId: u.id,
      userName: u.nom,
      userEmail: u.email,
      role: u.role,
      subscriptionTier: u.subscriptionTier || 'freemium',
      subscriptionExpiresAt: u.subscriptionExpiresAt || null,
      isExpired,
      remainingDays,
      createdAt: u.createdAt
    };
  });
  res.json({ subscriptions });
});

app.get('/api/admin/paiements', authenticateToken, requireAdmin, async (req, res) => {
  const payments = await dbAdapter.getAllPayments();
  res.json({ payments });
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  const users = await dbAdapter.getAllUsers();
  const safeUsers = users.map(({ motDePasseHash, ...u }) => u);
  res.json({ users: safeUsers });
});

app.get('/api/app-settings', async (req, res) => {
  const settings = await dbAdapter.getAppSettings();
  res.json({
    paiementActif: settings?.paiementActif ?? true,
    pricingPlans: settings?.pricingPlans || [],
    adminPaidMatrix: settings?.adminPaidMatrix || settings || {}
  });
});

// Helper for email broadcast formatting & real SMTP delivery
async function sendBroadcastEmail(subject: string, message: string, recipients: { email: string; nom?: string }[], link?: string) {
  const validRecipients = recipients.filter(r => r.email && r.email.includes('@'));
  const recipientCount = validRecipients.length;
  console.log(`\n======================================================`);
  console.log(`[EMAIL BROADCAST DISPATCH]`);
  console.log(`Objet: ${subject}`);
  console.log(`Destinataires (${recipientCount} utilisateurs):`, validRecipients.map(r => r.email).slice(0, 5).join(', ') + (recipientCount > 5 ? ` ...et ${recipientCount - 5} autres` : ''));
  console.log(`======================================================\n`);

  // Send real personalized emails asynchronously to all valid recipients
  for (const recipient of validRecipients) {
    sendFeatureUnlockedEmail({
      userEmail: recipient.email,
      userName: recipient.nom || 'Cher Candidat',
      featureTitle: subject,
      featureMessage: message,
      actionLink: link || 'gallery'
    }).catch(err => {
      console.error(`[BROADCAST EMAIL ERROR to ${recipient.email}]`, err);
    });
  }

  return recipientCount;
}

// Helper to compare matrices and detect features that became free
function detectFreedFeatures(oldMatrix: any, newMatrix: any): string[] {
  if (!oldMatrix || !newMatrix) return [];
  const freed: string[] = [];

  const checkArray = (oldArr: string[] = [], newArr: string[] = [], categoryName: string) => {
    oldArr.forEach(item => {
      if (!newArr.includes(item)) {
        freed.push(`${item} (${categoryName})`);
      }
    });
  };

  checkArray(oldMatrix.paidTemplates, newMatrix.paidTemplates, 'Modèle de CV');
  checkArray(oldMatrix.paidFonts, newMatrix.paidFonts, 'Police Typographique');
  checkArray(oldMatrix.paidStudioMenus, newMatrix.paidStudioMenus, 'Menu Studio');
  checkArray(oldMatrix.paidSubOptions, newMatrix.paidSubOptions, 'Option Créative');
  checkArray(oldMatrix.paidPatterns, newMatrix.paidPatterns, 'Motif d\'Arrière-Plan');
  checkArray(oldMatrix.paidHeaderStyles, newMatrix.paidHeaderStyles, 'Style d\'En-Tête');

  return freed;
}

// Public endpoint for clients to sync the paid feature matrix
app.get('/api/paid-matrix', async (req, res) => {
  const settings = await dbAdapter.getAppSettings();
  const matrix = settings?.adminPaidMatrix || settings || {};
  res.json(matrix);
});

app.get('/api/admin/paid-matrix', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  const settings = await dbAdapter.getAppSettings();
  const matrix = settings?.adminPaidMatrix || settings || {};
  res.json(matrix);
});

app.post('/api/admin/paid-matrix', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  const newMatrix = req.body;
  const currentSettings = await dbAdapter.getAppSettings();
  const oldMatrix = currentSettings?.adminPaidMatrix || {};

  const updated = await dbAdapter.updateAppSettings({
    ...currentSettings,
    adminPaidMatrix: newMatrix
  });

  // Auto-detect items that became free and trigger broadcast notification
  const freedItems = detectFreedFeatures(oldMatrix, newMatrix);
  if (freedItems.length > 0) {
    const users = await dbAdapter.getAllUsers();
    const itemsPreview = freedItems.slice(0, 4).join(', ') + (freedItems.length > 4 ? ` et ${freedItems.length - 4} autres` : '');
    const notifTitle = '🎉 Élément Payant Débloqué 100% GRATUIT !';
    const notifMessage = `Bonne nouvelle ! Les éléments suivants sont désormais accessibles 100% GRATUITEMENT pour tous les utilisateurs : ${itemsPreview}. Venez personnaliser votre CV dès maintenant !`;

    const createdNotif = await dbAdapter.createNotification({
      titre: notifTitle,
      message: notifMessage,
      type: 'FEATURE_FREE',
      cible: 'TOUS',
      lien: 'gallery',
      badge: 'GRATUIT',
      envoyeParEmail: true,
      nombreEmailsEnvoyes: users.length,
      auteur: req.user?.nom || 'Administrateur'
    });

    sendBroadcastEmail(notifTitle, notifMessage, users as any, 'gallery');
  }

  res.json({ success: true, adminPaidMatrix: updated.adminPaidMatrix || newMatrix });
});

app.get('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  const settings = await dbAdapter.getAppSettings();
  res.json({ appSettings: settings });
});

app.post('/api/admin/settings', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  const { paiementActif, pricingPlans, adminPaidMatrix } = req.body;
  const currentSettings = await dbAdapter.getAppSettings();
  const wasPaiementActif = currentSettings?.paiementActif ?? true;

  const updated = await dbAdapter.updateAppSettings({
    paiementActif,
    pricingPlans,
    ...(adminPaidMatrix ? { adminPaidMatrix } : {})
  });

  // Auto-notify all users if the whole payment system is deactivated (everything becomes free)
  if (wasPaiementActif === true && paiementActif === false) {
    const users = await dbAdapter.getAllUsers();
    const notifTitle = '🎉 TOUT LE SITE EST DÉSORMAIS 100% GRATUIT !';
    const notifMessage = 'L\'administrateur a débloqué l\'accès total : l\'ensemble des 59+ modèles de CV, fonctionnalités du Creator Studio et outils IA sont maintenant entièrement GRATUITS pour tous les utilisateurs !';

    await dbAdapter.createNotification({
      titre: notifTitle,
      message: notifMessage,
      type: 'FEATURE_FREE',
      cible: 'TOUS',
      lien: 'gallery',
      badge: '100% GRATUIT',
      envoyeParEmail: true,
      nombreEmailsEnvoyes: users.length,
      auteur: req.user?.nom || 'Administrateur'
    });

    sendBroadcastEmail(notifTitle, notifMessage, users as any, 'gallery');
  }

  res.json({ success: true, appSettings: updated });
});

// -------------------------------------------------------------
// USER & ADMIN NOTIFICATION ENDPOINTS
// -------------------------------------------------------------
app.get('/api/notifications', optionalAuthenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id || 'anonymous';
  const userTier = req.user?.subscriptionTier || 'freemium';

  const userNotifs = await dbAdapter.getNotificationsForUser(userId, userTier);
  const unreadCount = userNotifs.filter((n: any) => !n.isRead).length;

  res.json({
    notifications: userNotifs,
    unreadCount
  });
});

app.post('/api/notifications/:id/read', optionalAuthenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id || 'anonymous';
  await dbAdapter.markNotificationRead(id, userId);
  res.json({ success: true });
});

app.post('/api/notifications/read-all', optionalAuthenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id || 'anonymous';
  await dbAdapter.markAllNotificationsRead(userId);
  res.json({ success: true });
});

app.get('/api/admin/notifications', authenticateToken, requireAdmin, async (req, res) => {
  const allNotifs = await dbAdapter.getAllNotifications();
  const allUsers = await dbAdapter.getAllUsers();
  res.json({
    notifications: allNotifs,
    totalUsersCount: allUsers.length
  });
});

app.post('/api/admin/notifications/send', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  const { titre, message, type, cible, lien, badge, envoyeParEmail } = req.body;

  if (!titre || !message) {
    return res.status(400).json({ error: 'Le titre et le message sont requis.' });
  }

  const allUsers = await dbAdapter.getAllUsers();
  const targetUsers = allUsers.filter(u => {
    if (!cible || cible === 'TOUS') return true;
    return u.subscriptionTier === cible;
  });

  const shouldSendEmail = Boolean(envoyeParEmail);
  let emailsSent = 0;

  if (shouldSendEmail && targetUsers.length > 0) {
    emailsSent = await sendBroadcastEmail(titre, message, targetUsers as any, lien);
  }

  const newNotification = await dbAdapter.createNotification({
    titre,
    message,
    type: type || 'SYSTEM',
    cible: cible || 'TOUS',
    lien: lien || '',
    badge: badge || '',
    envoyeParEmail: shouldSendEmail,
    nombreEmailsEnvoyes: shouldSendEmail ? targetUsers.length : 0,
    auteur: req.user?.nom || 'Administrateur'
  });

  res.json({
    success: true,
    notification: newNotification,
    recipientsCount: targetUsers.length,
    emailsSentCount: emailsSent
  });
});

app.delete('/api/admin/notifications/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const deleted = await dbAdapter.deleteNotification(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Notification non trouvée.' });
  }
  res.json({ success: true });
});

app.post('/api/admin/paiement/:id/valider', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const payment = await dbAdapter.getPaymentById(id);
  if (!payment) return res.status(404).json({ error: 'Paiement non trouvé.' });

  const claimed = await dbAdapter.claimAndValidatePayment(id);
  if (!claimed) {
    return res.status(400).json({ error: 'Paiement déjà validé ou traité.' });
  }

  const subResult = await applyPlanToUser(payment.userId, payment.id, payment.planTier);

  // Send subscription confirmation email to the user
  const user = await dbAdapter.findUserById(payment.userId);
  if (user && user.email) {
    const settings = await dbAdapter.getAppSettings();
    const matchingPlan = (settings?.pricingPlans || []).find((p: any) => p.code === payment.planTier);
    sendSubscriptionConfirmationEmail({
      userEmail: user.email,
      userName: user.nom,
      planName: matchingPlan?.nom || `Pack ${payment.planTier.toUpperCase()}`,
      planTier: subResult.tier,
      amount: Number(payment.montant),
      currency: payment.devise || 'FCFA',
      durationDays: subResult.durationDays,
      expiresAt: subResult.expiresAt
    }).catch(err => {
      console.error('[ADMIN VALIDATE PAYMENT EMAIL ERROR]', err);
    });
  }

  res.json({ payment: { ...payment, statut: 'VALIDE' } });
});

app.post('/api/admin/paiement/:id/rejeter', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { noteAdmin } = req.body;
  const payment = await dbAdapter.getPaymentById(id);
  if (!payment) return res.status(404).json({ error: 'Paiement non trouvé.' });

  await dbAdapter.updatePaymentStatus(id, 'REJETE', noteAdmin || 'Refusé par l\'administrateur');
  res.json({ payment: { ...payment, statut: 'REJETE', noteAdmin } });
});

// -------------------------------------------------------------
// ADMIN CUSTOM TEMPLATES ENDPOINTS
// -------------------------------------------------------------
app.get('/api/admin/templates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const templates = await dbAdapter.getAdminTemplates();
    res.json({ templates });
  } catch (err) {
    console.error('Error fetching admin templates:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des modèles admin.' });
  }
});

app.post('/api/admin/templates', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const template = req.body;
    const now = new Date().toISOString();
    
    const newTemplate = {
      id: template.id || `custom-admin-${Date.now()}`,
      name: template.name,
      category: template.category,
      description: JSON.stringify(template.description),
      layoutType: template.layoutType,
      layoutFamily: template.layoutFamily,
      defaultAccent: template.defaultAccent,
      defaultSecondaryAccent: template.defaultSecondaryAccent,
      defaultFont: template.defaultFont,
      badgeText: template.badgeText || 'Admin',
      previewImage: template.previewImage,
      preview: template.preview,
      requiredTier: template.requiredTier || 'freemium',
      themeConfig: JSON.stringify(template.themeConfig),
      createdBy: req.user.id,
      createdAt: now,
      updatedAt: now
    };

    await dbAdapter.createAdminTemplate(newTemplate);
    res.json({ success: true, template: newTemplate });
  } catch (err) {
    console.error('Error creating admin template:', err);
    res.status(500).json({ error: 'Erreur lors de la création du modèle admin.' });
  }
});

app.delete('/api/admin/templates/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await dbAdapter.deleteAdminTemplate(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting admin template:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression du modèle admin.' });
  }
});

// -------------------------------------------------------------
// AI GEMINI SERVICES WITH SERVER-SIDE SUBSCRIPTION GATING
// -------------------------------------------------------------
app.post('/api/ai/lettre-motivation', optionalAuthenticateToken, checkSubscriptionGate('premium'), async (req: AuthRequest, res) => {
  const { cv, langue = 'fr', entreprise = '', poste = '', ton = 'professionnel', pointsCles = '' } = req.body;
  if (!cv) return res.status(400).json({ error: 'CV requis' });

  const profilSection = cv.sections?.find((s: any) => s.type === 'profil');
  const nomCandidat = profilSection?.contenu?.nomComplet || req.user?.nom || 'Candidat';
  const titrePro = profilSection?.contenu?.titreProfessionnel || poste || 'Professionnel';

  const dynamicFallback = generateDynamicFallbackLetter(
    { cv, langue, entreprise, poste, ton, pointsCles },
    nomCandidat,
    titrePro
  );

  const ai = getGemini();
  if (!ai) {
    return res.json(dynamicFallback);
  }

  try {
    const prompt = buildGeminiCoverLetterPrompt(
      { cv, langue, entreprise, poste, ton, pointsCles },
      nomCandidat,
      titrePro
    );

    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = safeJsonParse<any>(responseText, dynamicFallback);

    if (!parsed.texteComplet && parsed.paragrapheAccroche) {
      parsed.texteComplet = `${parsed.formulePolitesseEntree || 'Madame, Monsieur,'}\n\n${parsed.paragrapheAccroche}\n\n${parsed.paragrapheValeurAjoutee || ''}\n\n${parsed.paragrapheAdequationEntreprise || ''}\n\n${parsed.paragrapheConclusion || ''}\n\n${parsed.formulePolitesseSortie || 'Veuillez agréer mes salutations.'}\n\n${nomCandidat}`;
    }

    return res.json({ ...dynamicFallback, ...parsed });
  } catch (err: any) {
    console.warn('Gemini cover letter generation fallback used:', err);
    return res.json(dynamicFallback);
  }
});

// 1.b. Optimize Specific Cover Letter Paragraph (PREMIUM / CLASSIQUE Gated)
app.post('/api/ai/optimiser-paragraphe-lettre', optionalAuthenticateToken, checkSubscriptionGate('classique'), async (req: AuthRequest, res) => {
  const {
    texte = '',
    paragrapheType = 'accroche',
    poste = '',
    entreprise = '',
    ton = 'professionnel',
    langue = 'fr',
    instructions = ''
  } = req.body;

  if (!texte || !texte.trim()) {
    return res.status(400).json({ error: 'Texte requis pour optimisation' });
  }

  const ai = getGemini();
  if (!ai) {
    return res.json({
      texteOptimise: texte.trim(),
      suggestions: ['Service IA temporairement inaccessible. Texte d\'origine conservé.']
    });
  }

  try {
    const prompt = `Tu es un expert exécutif en recrutement et en rédaction de lettres de motivation de haut niveau.
Ta mission est d'optimiser le paragraphe de lettre de motivation rédigé par le candidat.

CONTEXTE :
- Type de paragraphe : ${paragrapheType} (accroche motivationnelle, valeur ajoutée et réalisations, adéquation avec l'entreprise, ou conclusion et appel à l'action)
- Poste visé : ${poste || 'Poste professionnel'}
- Entreprise visée : ${entreprise || 'Entreprise cible'}
- Ton souhaité : ${ton || 'professionnel, dynamique et engageant'}
- Langue de rédaction : ${langue === 'en' ? 'English' : langue === 'es' ? 'Español' : 'Français'}
${instructions ? `- Consignes : ${instructions}` : ''}

PARAGRAPHE ENTRÉ PAR L'UTILISATEUR :
"""
${texte.trim()}
"""

INSTRUCTIONS DE RÉDACTION :
1. Conserve fidèlement les éléments factuels, les réalisations et l'intention de l'utilisateur.
2. Utilise des verbes d'action puissants, une syntaxe soignée et un vocabulaire professionnel remarquable.
3. Rends le propos percutant, convaincant et fluide (3 à 5 phrases équilibrées).
4. Élimine les formulations banales ou hésitantes.
5. Renvoie UNIQUEMENT un objet JSON valide conforme au schéma suivant :
{
  "texteOptimise": "Texte complet du paragraphe magnifié et optimisé",
  "suggestions": [
    "Conseil court 1",
    "Conseil court 2"
  ]
}`;

    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = safeJsonParse<any>(responseText, {
      texteOptimise: texte.trim(),
      suggestions: []
    });

    return res.json({
      texteOptimise: parsed.texteOptimise || texte.trim(),
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
    });
  } catch (err: any) {
    console.warn('Gemini paragraph optimization error:', err);
    return res.json({
      texteOptimise: texte.trim(),
      suggestions: []
    });
  }
});


// 2. LinkedIn Profile Generator (PREMIUM)
app.post('/api/ai/linkedin-profile', optionalAuthenticateToken, checkSubscriptionGate('premium'), async (req: AuthRequest, res) => {
  const { cv, langue = 'fr' } = req.body;
  if (!cv) return res.status(400).json({ error: 'CV requis' });

  const ai = getGemini();
  const defaultLinkedIn = {
    titreProfessionnel: `Expert Orienté Résultats & Impact`,
    resumeAPropos: `Passionné par l'excellence opérationnelle et l'innovation, j'accompagne les projets avec rigueur et vision stratégique.`,
    motsClesStrategiques: ['Leadership', 'Gestion de projet', 'Innovation', 'Excellence opérationnelle'],
    experiencesOptimisees: [],
    conseilsVisibilite: ['Soignez votre photo de profil', 'Personnalisez votre bannière', 'Demandez des recommandations professionnelles']
  };

  if (!ai) return res.json(defaultLinkedIn);

  try {
    const prompt = `Crée un profil LinkedIn optimisé basé sur ce CV en ${langue === 'en' ? 'Anglais' : langue === 'ar' ? 'Arabe' : 'Français'}:
${JSON.stringify(cv).slice(0, 6000)}
Format JSON: { "titreProfessionnel": "", "resumeAPropos": "", "motsClesStrategiques": [], "experiencesOptimisees": [], "conseilsVisibilite": [] }`;

    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    return res.json(safeJsonParse(responseText, defaultLinkedIn));
  } catch (err) {
    return res.json(defaultLinkedIn);
  }
});

app.post('/api/ai/linkedin', optionalAuthenticateToken, checkSubscriptionGate('premium'), async (req: AuthRequest, res) => {
  const { cv, langue = 'fr' } = req.body;
  if (!cv) return res.status(400).json({ error: 'CV requis' });

  const ai = getGemini();
  const defaultLinkedIn = {
    titreProfessionnel: `Expert Orienté Résultats & Impact`,
    resumeAPropos: `Passionné par l'excellence opérationnelle et l'innovation, j'accompagne les projets avec rigueur.`,
    motsClesStrategiques: ['Leadership', 'Gestion de projet', 'Innovation'],
    experiencesOptimisees: [],
    conseilsVisibilite: ['Soignez votre photo de profil', 'Personnalisez votre bannière', 'Demandez des recommandations']
  };

  if (!ai) return res.json(defaultLinkedIn);

  try {
    const prompt = `Crée un profil LinkedIn optimisé basé sur ce CV:
${JSON.stringify(cv).slice(0, 6000)}
Format JSON: { "titreProfessionnel": "", "resumeAPropos": "", "motsClesStrategiques": [], "experiencesOptimisees": [], "conseilsVisibilite": [] }`;

    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    return res.json(safeJsonParse(responseText, defaultLinkedIn));
  } catch (err) {
    return res.json(defaultLinkedIn);
  }
});

// 3. Job Offer Targeting & Analysis (PREMIUM)
const handleJobOfferAnalysis = async (req: AuthRequest, res: express.Response) => {
  const { texteOffre, offreTexte, imageBase64, offreImage, cv, langue = 'fr' } = req.body;
  const rawText = (texteOffre || offreTexte || '').trim();
  const rawImage = imageBase64 || offreImage || '';

  if (!rawText && !rawImage) {
    return res.status(400).json({ error: 'Texte ou capture d\'écran de l\'offre d\'emploi requis.' });
  }

  const defaultAnalysis = {
    titrePoste: 'Poste Cible',
    entreprise: 'Entreprise Recruteuse',
    lieu: 'Non spécifié / Télétravail',
    competencesClesRequises: ['Excellence opérationnelle', 'Autonomie & Rigueur', 'Communication & Travail d\'équipe'],
    pointsFortsDetectes: ['Profil aligné avec les exigences fondamentales du poste'],
    couleurDetectee: '#1e40af',
    couleurSecondaire: '#3b82f6',
    nomCouleurMarque: 'Bleu corporate identitaire',
    questionsCompetences: [
      { id: 'q_comp', question: 'Parmi les compétences clés requises par cette offre, lesquelles maîtrisez-vous et sur quels outils concrets ? (Ne rien inventer)', description: 'Indiquez uniquement vos réelles compétences techniques ou outils maîtrisés', contexte: 'Compétences clés' }
    ],
    questionsExperiences: [
      { id: 'q_exp', question: 'Quelles missions ou réalisations de vos expériences passées correspondent le mieux aux attentes de cette offre ?', description: 'Précisez des résultats ou projets clés à reformuler et valoriser', contexte: 'Expériences professionnelles' }
    ],
    questionsPrecision: [
      { id: 'q_comp', question: 'Parmi les compétences clés requises par cette offre, lesquelles maîtrisez-vous et sur quels outils concrets ? (Ne rien inventer)', description: 'Indiquez uniquement vos réelles compétences techniques ou outils maîtrisés', contexte: 'Compétences clés' },
      { id: 'q_exp', question: 'Quelles missions ou réalisations de vos expériences passées correspondent le mieux aux attentes de cette offre ?', description: 'Précisez des résultats ou projets clés à reformuler et valoriser', contexte: 'Expériences professionnelles' }
    ]
  };

  if (rawText) {
    const firstLines = rawText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 2);
    if (firstLines.length > 0) {
      defaultAnalysis.titrePoste = firstLines[0].slice(0, 60);
    }
  }

  const ai = getGemini();
  if (!ai) return res.json(defaultAnalysis);

  try {
    let contents: any;
    const targetLang = langue === 'en' ? 'Anglais' : langue === 'ar' ? 'Arabe' : 'Français';
    const instructionPrompt = `Tu es un expert recruteur RH et directeur artistique. Analyse attentivement cette offre d'emploi et extrait les données en ${targetLang}.
Extrais le titre du poste, le nom de l'entreprise, le lieu, une liste de 3 à 6 compétences clés indispensables ordonnées par priorité, 2 points forts requis, et deux questions ciblées :
1. Une question spécifique sur les compétences techniques / outils réels (pour ne rien inventer d'artificiel).
2. Une question spécifique sur les expériences et réalisations passées du candidat (pour les reformuler et les orienter vers le poste).

IMPORTANT - RECONNAISSANCE DE LA COULEUR DE MARQUE & LOGO :
Repère attentivement la couleur dominante ou de marque visible sur la photo de l'annonce, sur le logo de l'entreprise ou issue de l'identité visuelle de l'entreprise :
1. Si une photo, une annonce graphique ou un logo est présent dans l'image : repère la couleur distinctive dominante du logo ou de la charte (ex: '#0052CC', '#E11D48', '#059669', '#FF6B00', '#10B981', '#18181B', '#7C3AED', '#2563EB').
2. Si l'offre est textuelle : identifie la couleur officielle reconnue de l'entreprise (ex: Google = #4285F4, TotalEnergies = #ED1C24, Orange = #FF7900, Société Générale = #E60028, BNP Paribas = #00915A, Microsoft = #00A4EF, Spotify = #1ED760, Amazon = #FF9900, L'Oréal = #E50019, Capgemini = #0070AD).
3. Si l'entreprise n'a pas de couleur notoire : choisis une teinte harmonieuse et élégante adaptée à son secteur (tech: #2563EB, finance/conseil: #1E3A8A, santé/environnement: #059669, luxe/art: #18181B, marketing/créatif: #7C3AED, industrie/BTP: #0D9488).
Propose également une couleur secondaire harmonieuse et un intitulé court de la couleur repérée.

Format JSON strict obligatoire :
{
  "titrePoste": "intitulé exact",
  "entreprise": "nom ou 'Non spécifié'",
  "lieu": "lieu ou 'Non spécifié'",
  "competencesClesRequises": ["compétence prioritaire 1", "compétence 2", "compétence 3", "compétence 4"],
  "pointsFortsDetectes": ["point fort 1", "point fort 2"],
  "couleurDetectee": "#1E40AF",
  "couleurSecondaire": "#60A5FA",
  "nomCouleurMarque": "Bleu identitaire repéré sur l'annonce / logo",
  "questionsCompetences": [
    { "id": "q_comp", "question": "question sur les compétences et outils réels", "description": "conseil pour répondre", "contexte": "Compétences clés" }
  ],
  "questionsExperiences": [
    { "id": "q_exp", "question": "question sur les projets et réalisations passés à valoriser", "description": "conseil pour répondre", "contexte": "Expériences professionnelles" }
  ],
  "questionsPrecision": [
    { "id": "q_comp", "question": "question sur les compétences et outils réels", "description": "conseil pour répondre", "contexte": "Compétences clés" },
    { "id": "q_exp", "question": "question sur les projets et réalisations passés à valoriser", "description": "conseil pour répondre", "contexte": "Expériences professionnelles" }
  ]
}`;

    if (rawImage) {
      const mimeMatch = rawImage.match(/^data:(image\/[a-zA-Z0-9-+.]+);base64,/i);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64Data = rawImage.replace(/^data:image\/[a-zA-Z0-9-+.]+;base64,/, '');
      contents = {
        parts: [
          { text: instructionPrompt },
          { inlineData: { data: base64Data, mimeType } }
        ]
      };
    } else {
      contents = `${instructionPrompt}\n\n=== OFFRE D'EMPLOI ===\n${rawText.slice(0, 7000)}`;
    }

    const responseText = await generateGeminiContentWithFallback(ai, contents);
    const parsed = safeJsonParse(responseText, defaultAnalysis);
    const parsedAny = parsed as any;
    const deterministicSuggestions = generateTargetingSuggestions({ cv, offre: parsed, rawText, langue });
    return res.json({
      ...defaultAnalysis,
      ...deterministicSuggestions,
      ...parsed,
      suggestionsProfil: parsedAny.suggestionsProfil || deterministicSuggestions.suggestionsProfil,
      competencesPriorisees: parsedAny.competencesPriorisees || deterministicSuggestions.competencesPriorisees,
      suggestionsExperiences: parsedAny.suggestionsExperiences || deterministicSuggestions.suggestionsExperiences,
      questionsCompetences: parsedAny.questionsCompetences || deterministicSuggestions.questionsCompetences,
      questionsExperiences: parsedAny.questionsExperiences || deterministicSuggestions.questionsExperiences
    });
  } catch (err) {
    console.error('handleJobOfferAnalysis error:', err);
    const deterministicSuggestions = generateTargetingSuggestions({ cv, offre: defaultAnalysis, rawText, langue });
    return res.json({ ...defaultAnalysis, ...deterministicSuggestions });
  }
};

app.post('/api/ai/analyse-offre', optionalAuthenticateToken, checkSubscriptionGate('premium'), handleJobOfferAnalysis);
app.post('/api/ai/cibler-offre', optionalAuthenticateToken, checkSubscriptionGate('premium'), handleJobOfferAnalysis);

// 4. Reformuler Expérience (PREMIUM)
app.post('/api/ai/reformuler-experience', optionalAuthenticateToken, checkSubscriptionGate('premium'), async (req: AuthRequest, res) => {
  const { poste = '', entreprise = '', description = '', texteOriginal = '', langue = 'fr' } = req.body;
  const rawInput = (description || texteOriginal || '').trim();
  const ai = getGemini();

  const fallback = rawInput
    ? `${rawInput}\n- Pilotage des missions clés et amélioration continue de la performance opérationnelle.`
    : '- Prise en charge des missions clés et optimisation des résultats selon les objectifs fixés.';

  if (!ai) {
    return res.json({
      description: fallback,
      texteReformule: fallback
    });
  }

  try {
    const prompt = `Tu es un expert RH. Reformule la description d'expérience suivante pour un CV professionnel à fort impact en ${langue === 'en' ? 'Anglais' : langue === 'ar' ? 'Arabe' : 'Français'}.
Poste: ${poste}, Entreprise: ${entreprise}
Description brute: ${rawInput}
Format JSON: { "description": "texte reformulé sous forme de tirets et puces d'action percutantes", "texteReformule": "texte reformulé" }`;

    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = safeJsonParse<{ description?: string; texteReformule?: string }>(responseText, {});
    const finalDesc = parsed.description || parsed.texteReformule || fallback;
    return res.json({ description: finalDesc, texteReformule: finalDesc });
  } catch (err) {
    return res.json({ description: fallback, texteReformule: fallback });
  }
});

// 5. Personnaliser / Adapter Candidature CV (PREMIUM)
const handleAdapterCandidature = async (req: AuthRequest, res: express.Response) => {
  const { cv, texteOffre, offreTexte, offre, offreAnalyse, reponsesQuestions, langue = 'fr' } = req.body;
  if (!cv) return res.status(400).json({ error: 'CV requis' });

  const activeOffre = offre || offreAnalyse || {};
  const targetColor = activeOffre.couleurDetectee || '#1e40af';
  const targetSecondary = activeOffre.couleurSecondaire || '#3b82f6';
  const nomCouleur = activeOffre.nomCouleurMarque || 'Couleur corporate de marque';

  // 1. Foundation: Deterministically adapt CV (skills prioritized, profile updated, experiences oriented, colors applied)
  const baseAdaptedCv = buildAdaptedCvLocally({
    cv,
    offre: activeOffre,
    reponsesQuestions: reponsesQuestions || {},
    langue,
    targetColor,
    targetSecondaryColor: targetSecondary
  });

  const dynamicFallbackLetter = generateDynamicFallbackLetter(
    {
      cv: baseAdaptedCv,
      langue,
      entreprise: activeOffre.entreprise || 'Entreprise Cible',
      poste: activeOffre.titrePoste || 'Poste Cible'
    },
    baseAdaptedCv.sections?.find((s: any) => s.type === 'profil')?.contenu?.nomComplet || 'Candidat',
    activeOffre.titrePoste || 'Professionnel'
  );

  const defaultResult = {
    cvModifie: baseAdaptedCv,
    cvPersonnalise: baseAdaptedCv,
    adaptedCv: baseAdaptedCv,
    tauxCorrespondanceEstime: 92,
    motsClesAjoutes: activeOffre.competencesClesRequises || ['Excellence opérationnelle', 'Rigueur', 'Analyse'],
    justificationAdaptation: `CV adapté pour le poste de ${activeOffre.titrePoste || 'Poste Cible'} chez ${activeOffre.entreprise || 'Entreprise'} : profil professionnel réaligné, compétences réordonnées selon les priorités du poste, descriptions d'expériences orientées et harmonisation graphique (${nomCouleur}).`,
    modificationsApportees: [
      `Profil professionnel réaligné sur le poste de ${activeOffre.titrePoste || 'Poste Cible'}`,
      `Compétences réordonnées en priorité selon les exigences de l'offre (sans compétences inventées)`,
      `Descriptions des expériences orientées avec verbes d'action ciblés`,
      `Palette graphique appliquée aux accents et titres (${targetColor})`
    ],
    couleurDetectee: targetColor,
    couleurSecondaire: targetSecondary,
    nomCouleurMarque: nomCouleur,
    lettreMotivation: dynamicFallbackLetter,
    success: true
  };

  const ai = getGemini();
  if (!ai) return res.json(defaultResult);

  try {
    const offerContent = JSON.stringify(activeOffre || texteOffre || offreTexte || '').slice(0, 5000);
    const prompt = `Tu es un expert RH de haut niveau et directeur artistique. Adapte et personnalise ce CV et cette lettre de motivation pour qu'ils répondent précisément aux exigences de cette offre d'emploi en ${langue === 'en' ? 'Anglais' : langue === 'ar' ? 'Arabe' : 'Français'}.

CV SOURCE JSON :
${JSON.stringify(baseAdaptedCv)}

OFFRE CIBLE :
${offerContent}

RÉPONSES DU CANDIDAT (COMPÉTENCES VALIDÉES & RÉALISATIONS CONCRÈTES) :
${JSON.stringify(reponsesQuestions || {})}

COULEUR DE MARQUE DÉTECTÉE : ${targetColor}

DIRECTIVES IMPÉRATIVES :
1. STRICTEMENT NE RIEN INVENTER : ne crée aucun faux diplôme, aucune fausse entreprise, aucune fausse date et aucune compétence imaginaire.
2. REFORMULATION TOTALE DU PROFIL PROFESSIONNEL : le texte du profil ('resume') doit être COMPLÈTEMENT refait et réécrit pour matcher précisément avec les missions de l'offre chez ${activeOffre.entreprise || 'l\'entreprise cible'}. Rédige un paragraphe fluide, percutant et ultra-professionnel (4 à 5 phrases). Adapte "titreProfessionnel" pour correspondre exactement à ${activeOffre.titrePoste || 'Poste Cible'}.
3. REFORMULATION TOTALE DES EXPÉRIENCES : pour CHAQUE expérience professionnelle, réécris ENTIÈREMENT la description sous forme de puces percutantes (commençant par des verbes d'action professionnels) qui valorisent les missions réelles du candidat en les alignant sur les exigences et le vocabulaire de l'offre. Ne garde pas les phrases d'origine telles quelles, reformule-les de manière percutante sans rien inventer.
4. SECTION "COMPETENCES" : réordonne les compétences existantes pour mettre en tête celles prioritaires pour le poste.
5. TITRES DES SECTIONS : conserve impérativement les titres des sections en ${langue === 'en' ? 'Anglais' : langue === 'ar' ? 'Arabe' : 'Français'}. N'écris JAMAIS de titres de sections en arabe si la langue cible est le français ou l'anglais.
6. CONSERVER TOUTES LES SECTIONS : ne supprime aucune section du CV (profil, experience, formation, competences, etc.). Conserve la même structure JSON pour chaque section.
7. LETTRE DE MOTIVATION : génère une lettre ultra-ciblée, avec une accroche personnalisée, un paragraphe prouvant l'adéquation au poste, et une conclusion demandant explicitement un entretien.

Format JSON strict :
{
  "cvModifie": {
    "titre": "CV - ${activeOffre.titrePoste || 'Candidature Ciblée'}",
    "sections": [
      // Sections complètes avec profil adapté, compétences réordonnées et expériences orientées
    ]
  },
  "tauxCorrespondanceEstime": 95,
  "motsClesAjoutes": ["mot-clé 1", "mot-clé 2"],
  "justificationAdaptation": "synthèse des ajustements réalisés et alignement graphique",
  "modificationsApportees": [
    "Profil professionnel adapté au poste visé",
    "Compétences clés réordonnées selon les priorités du recruteur",
    "Expériences enrichies et orientées résultats",
    "Couleurs du CV harmonisées avec l'identité visuelle de l'entreprise"
  ],
  "lettreMotivation": {
    "objet": "Candidature au poste de ${activeOffre.titrePoste || '...'}",
    "formulePolitesseEntree": "Madame, Monsieur,",
    "paragrapheAccroche": "...",
    "paragrapheValeurAjoutee": "...",
    "paragrapheAdequationEntreprise": "...",
    "paragrapheConclusion": "...",
    "formulePolitesseSortie": "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
    "texteComplet": "..."
  }
}`;

    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = safeJsonParse<any>(responseText, defaultResult);

    // Merge returned sections back onto baseAdaptedCv so no section structure is lost
    let finalSections = baseAdaptedCv.sections;
    if (parsed.cvModifie && Array.isArray(parsed.cvModifie.sections) && parsed.cvModifie.sections.length > 0) {
      finalSections = baseAdaptedCv.sections.map((originalSec: any) => {
        const matchingAiSec = parsed.cvModifie.sections.find((s: any) => s.id === originalSec.id || s.type === originalSec.type);
        if (!matchingAiSec) return originalSec;

        // Ensure contenu is valid and not empty
        const aiContenu = matchingAiSec.contenu;
        let mergedContenu = originalSec.contenu;

        if (originalSec.type === 'profil' && aiContenu && typeof aiContenu === 'object') {
          mergedContenu = {
            ...originalSec.contenu,
            ...aiContenu,
            titreProfessionnel: aiContenu.titreProfessionnel || originalSec.contenu?.titreProfessionnel,
            resume: aiContenu.resume || originalSec.contenu?.resume
          };
        } else if (originalSec.type === 'competences' && Array.isArray(aiContenu) && aiContenu.length > 0) {
          mergedContenu = aiContenu;
        } else if (originalSec.type === 'experience' && Array.isArray(aiContenu) && aiContenu.length > 0) {
          mergedContenu = aiContenu;
        } else if (aiContenu) {
          mergedContenu = aiContenu;
        }

        let safeTitle = originalSec.titre || matchingAiSec.titre;
        if (langue !== 'ar' && matchingAiSec.titre && /[\u0600-\u06FF]/.test(matchingAiSec.titre)) {
          safeTitle = originalSec.titre || (originalSec.type === 'profil' ? 'Profil Professionnel' : originalSec.type === 'experience' ? 'Expériences Professionnelles' : 'Section');
        }

        return {
          ...originalSec,
          ...matchingAiSec,
          id: originalSec.id,
          type: originalSec.type,
          titre: safeTitle,
          contenu: mergedContenu
        };
      });
    }

    const finalAdaptedCv = {
      ...baseAdaptedCv,
      ...(parsed.cvModifie || {}),
      sections: finalSections,
      couleurAccent: targetColor,
      couleurAccentSecondaire: targetSecondary,
      couleurTitreSection: targetColor,
      couleurFondProfil: targetColor,
      theme: {
        ...(cv.theme || {}),
        primaryColor: targetColor,
        secondaryColor: targetSecondary,
        headingColor: targetColor,
        headerBackgroundColor: targetColor,
        badgeColor: targetColor
      }
    };

    // Apply auto-capitalization auto-fix
    const sanitizedCv = autoFixCapitalization(finalAdaptedCv);

    return res.json({
      ...defaultResult,
      ...parsed,
      cvModifie: sanitizedCv,
      cvPersonnalise: sanitizedCv,
      adaptedCv: sanitizedCv,
      couleurDetectee: targetColor,
      couleurSecondaire: targetSecondary,
      nomCouleurMarque: nomCouleur,
      success: true
    });
  } catch (err) {
    console.error('handleAdapterCandidature error:', err);
    return res.json(defaultResult);
  }
};

app.post('/api/ai/personnaliser-cv', optionalAuthenticateToken, checkSubscriptionGate('premium'), handleAdapterCandidature);
app.post('/api/ai/adapter-candidature', optionalAuthenticateToken, checkSubscriptionGate('premium'), handleAdapterCandidature);

// 6. Correction Orthographique & Stylistique (CLASSIQUE / PREMIUM)
const handleCorrection = async (req: AuthRequest, res: express.Response) => {
  const { texte = '', text = '', cv, langue = 'fr' } = req.body;
  const input = texte || text || (cv ? JSON.stringify(cv) : '');
  if (!input) return res.status(400).json({ error: 'Texte à corriger requis.' });

  const ai = getGemini();
  const defaultCorrection = {
    texteCorrige: autoFixCapitalization(input),
    corrections: [],
    erreurs: [],
    score: 98
  };

  if (!ai) return res.json(defaultCorrection);

  try {
    const prompt = `Corrige la grammaire, l'orthographe, les majuscules des noms propres et le style du texte suivant en ${langue === 'en' ? 'Anglais' : langue === 'ar' ? 'Arabe' : 'Français'}.
Texte: ${input.slice(0, 5000)}
Format JSON: { "texteCorrige": "", "corrections": [{ "original": "", "correction": "", "explication": "" }], "erreurs": [{ "motOriginal": "", "correction": "", "explication": "", "type": "orthographe" }], "score": 95 }`;

    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = safeJsonParse(responseText, defaultCorrection);
    return res.json({ ...defaultCorrection, ...parsed, texteCorrige: autoFixCapitalization(parsed.texteCorrige || input) });
  } catch (err) {
    return res.json(defaultCorrection);
  }
};

app.post('/api/ai/correction', optionalAuthenticateToken, checkSubscriptionGate('classique'), handleCorrection);
app.post('/api/correction', optionalAuthenticateToken, checkSubscriptionGate('classique'), handleCorrection);

// 7. Full CV & Letter Translator (CLASSIQUE / PREMIUM)
const handleCVTranslation = async (req: AuthRequest, res: express.Response) => {
  try {
    const { cv, targetLang = 'en' } = req.body;
    if (!cv) {
      return res.status(400).json({ error: 'CV requis pour la traduction.' });
    }

    const ai = getGemini();
    const langLabel = targetLang === 'ar' ? 'Arabe' : targetLang === 'en' ? 'Anglais' : 'Français';

    if (ai) {
      try {
        const cvForPrompt = JSON.parse(JSON.stringify(cv));
        delete cvForPrompt.photo;
        delete cvForPrompt.photoUrl;
        delete cvForPrompt.profilePhoto;

        const prompt = `Tu es un traducteur expert RH et CV multilingue.
Traduis l'intégralité du contenu de ce CV en ${langLabel} (titre du CV, titres de sections, postes, résumés, missions, diplômes, compétences, langues, centres d'intérêt, etc.).
Conserve scrupuleusement la structure JSON exacte (mêmes IDs de sections, types de sections, clés d'objets, numéros de téléphone et e-mails intacts).
CV source:
${JSON.stringify(cvForPrompt)}`;

        const responseText = await generateGeminiContentWithFallback(ai, prompt);
        const parsedCV = safeJsonParse<any>(responseText, null);
        const rawSections = parsedCV?.sections || parsedCV?.cv?.sections || parsedCV?.translatedCv?.sections;

        if (parsedCV && rawSections) {
          // Merge translated sections with original section structures to ensure nothing is lost
          const translatedSections = (cv.sections || []).map((sec: any) => {
            const match = rawSections.find((s: any) => s.id === sec.id || s.type === sec.type);
            if (!match) return sec;
            return {
              ...sec,
              ...match,
              id: sec.id,
              type: sec.type,
              contenu: match.contenu || sec.contenu
            };
          });

          const intermediateCv = autoFixCapitalization({
            ...cv,
            ...parsedCV,
            photo: cv.photo,
            photoUrl: cv.photoUrl,
            profilePhoto: cv.profilePhoto,
            sections: translatedSections,
            langue: targetLang,
            titre: parsedCV.titre || `${cv.titre || 'CV'} (${targetLang.toUpperCase()})`
          });

          // Final polish through deterministic dictionary to guarantee 100% translation of dates, standard section titles & degrees
          const finalCv = translateCV(intermediateCv, targetLang);

          return res.json({
            translatedCv: finalCv,
            success: true
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini translation error, using local engine:', geminiErr);
      }
    }

    // High quality local deterministic dictionary fallback
    const fallbackCv = translateCV(cv, targetLang);
    return res.json({ translatedCv: autoFixCapitalization(fallbackCv), success: true });
  } catch (err) {
    console.error('handleCVTranslation error:', err);
    const fallbackCv = translateCV(req.body.cv || {}, req.body.targetLang || 'en');
    return res.json({ translatedCv: autoFixCapitalization(fallbackCv), success: true });
  }
};

const handleLetterTranslation = async (req: AuthRequest, res: express.Response) => {
  try {
    const { letter, targetLang = 'en' } = req.body;
    if (!letter) {
      return res.status(400).json({ error: 'Lettre requise pour la traduction.' });
    }

    const ai = getGemini();
    const langLabel = targetLang === 'ar' ? 'Arabe' : targetLang === 'en' ? 'Anglais' : 'Français';

    if (ai) {
      const prompt = `Tu es un traducteur expert RH. Traduis cette lettre de motivation en ${langLabel}.
Champs à traduire : objet, formulePolitesseEntree, paragrapheAccroche, paragrapheValeurAjoutee, paragrapheAdequationEntreprise, paragrapheConclusion, formulePolitesseSortie, destinataire.
Lettre source :
${JSON.stringify(letter)}`;

      const responseText = await generateGeminiContentWithFallback(ai, prompt);
      const parsed = safeJsonParse<any>(responseText, null);
      if (parsed) {
        const translatedLetter = autoFixCapitalization({
          ...letter,
          ...parsed,
          langue: targetLang,
          titre: `${letter.titre || 'Lettre'} (${targetLang.toUpperCase()})`,
          texteComplet: `${parsed.formulePolitesseEntree || letter.formulePolitesseEntree}\n\n${parsed.paragrapheAccroche || letter.paragrapheAccroche}\n\n${parsed.paragrapheValeurAjoutee || letter.paragrapheValeurAjoutee}\n\n${parsed.paragrapheAdequationEntreprise || letter.paragrapheAdequationEntreprise}\n\n${parsed.paragrapheConclusion || letter.paragrapheConclusion}\n\n${parsed.formulePolitesseSortie || letter.formulePolitesseSortie}\n\n${letter.signature || letter.expediteur?.nomComplet || ''}`
        });

        return res.json({ translatedLetter, success: true });
      }
    }

    const fallbackLetter = {
      ...letter,
      langue: targetLang,
      titre: `${letter.titre || 'Lettre'} (${targetLang.toUpperCase()})`
    };
    return res.json({ translatedLetter: autoFixCapitalization(fallbackLetter), success: true });
  } catch (err) {
    console.error('handleLetterTranslation error:', err);
    return res.json({ translatedLetter: req.body.letter, success: true });
  }
};

app.post('/api/ai/translate-cv', optionalAuthenticateToken, handleCVTranslation);
app.post('/api/ai/traduction-cv', optionalAuthenticateToken, handleCVTranslation);
app.post('/api/ai/translate-lettre', optionalAuthenticateToken, checkSubscriptionGate('classique'), handleLetterTranslation);
app.post('/api/ai/traduction-lettre', optionalAuthenticateToken, checkSubscriptionGate('classique'), handleLetterTranslation);

// 8. Single Field AI Suggestion Generator (PREMIUM)
app.post('/api/ai/suggest-field', optionalAuthenticateToken, checkSubscriptionGate('premium'), async (req: AuthRequest, res) => {
  try {
    const { fieldName, currentValue = '', context = '', fullCvContext = '', cv, langue = 'fr' } = req.body;
    const ai = getGemini();

    const targetLang = langue === 'en' ? 'Anglais' : langue === 'ar' ? 'Arabe' : 'Français';

    if (!ai) {
      return res.json({
        suggestion: currentValue
          ? `${currentValue} - Optimisé avec des mots-clés d'impact et de précision.`
          : `Spécialiste qualifié avec une solide expérience terrain et sens des résultats.`
      });
    }

    const detailedContext = fullCvContext || context || (cv ? JSON.stringify(cv).slice(0, 3000) : '');

    const prompt = `Tu es un expert mondial en recrutement, rédaction et optimisation de CV.
Génère une amélioration ou suggestion professionnelle directe, percutante et concise en ${targetLang} pour le champ de CV : "${fieldName}".

=== CONTEXTE DÉTAILLÉ DU CV ET DOMAINE DU CANDIDAT ===
${detailedContext || 'Non précisé'}

Valeur actuelle du champ (si déjà renseignée) : "${currentValue}".

RÈGLES ABSOLUES ET IMPÉRATIVES :
1. RESPECT RIGOUREUX DU DOMAINE DE L'UTILISATEUR : Analyse le titre professionnel, les compétences et les expériences fournies dans le contexte ci-dessus.
   - Si le candidat est Développeur Informatique / Software Engineer, toute suggestion (intitulé, compétence, résumé, description) DOIT être STRICTEMENT liée au secteur Informatique / Technologie.
   - Ne propose JAMAIS des termes d'un autre secteur sans rapport (comme comptabilité, finance, santé, vente ou secrétariat).
2. Fournis une suggestion directe prête à être directement insérée dans le champ (pas de guillemets autour, pas d'explications inutiles).
3. La suggestion doit être d'un niveau professionnel élevé, orientée résultats et mots-clés du secteur d'activité du candidat.
4. Réponds au format JSON strict : { "suggestion": "..." }`;

    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = safeJsonParse<{ suggestion?: string }>(responseText, {});
    const suggestion = parsed?.suggestion || (currentValue ? `${currentValue} (Optimisé)` : `Professionnel qualifié et orienté résultats`);

    return res.json({ suggestion });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur lors de la génération de la suggestion IA.' });
  }
});

// -------------------------------------------------------------
// VITE INTEGRATION & SERVER STARTUP
// -------------------------------------------------------------
async function startServer() {
  loadDB(); // Boot DB check
  await dbAdapter.ensurePostgresReadiness();
  try {
    await dbAdapter.syncAllSqliteUsersToPostgres();
  } catch (err) {
    console.warn('Initial sync SQLite users to PostgreSQL notice:', err);
  }

  console.log('[INFO] Pour créer un compte administrateur, utilisez: npm run create-admin');

  // Ensure unmatched /api/* calls return JSON 404, never index.html!
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `Route API introuvable: ${req.method} ${req.path}` });
  });

  // Global API error handler for /api/* routes
  app.use((err: any, req: any, res: any, next: any) => {
    if (req.path?.startsWith('/api/')) {
      console.error('[API ERROR]', err);
      return res.status(500).json({ error: err?.message || 'Erreur interne du serveur' });
    }
    next(err);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: { ignored: ['**/data/db.json', '**/dist/**', '**/.git/**'] }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CV Builder server running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer();
