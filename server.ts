import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { TEMPLATE_PRESETS, getPresetForTemplate } from './src/data/templatePresets';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Ensure database file exists
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

interface DB {
  users: Array<{ id: string; nom: string; email: string; motDePasseHash: string; role?: string; langue: string; createdAt: string }>;
  cvs: Array<any>;
  payments: Array<any>;
}

function loadDB(): DB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsedDB: DB = JSON.parse(raw);

      // Guarantee admin user exists with required credentials
      let admin = parsedDB.users.find(u => u.email.toLowerCase() === 'mouotiejospel@gmail.com');
      if (!admin) {
        admin = {
          id: 'u-admin',
          nom: 'Administrateur Jospel',
          email: 'mouotiejospel@gmail.com',
          motDePasseHash: 'Iorimarou1@',
          role: 'ADMIN',
          langue: 'fr',
          createdAt: new Date().toISOString()
        };
        parsedDB.users.push(admin);
      } else {
        admin.motDePasseHash = 'Iorimarou1@';
        admin.role = 'ADMIN';
      }

      // Guarantee photoUrl and photo settings on CVs
      if (parsedDB.cvs) {
        parsedDB.cvs.forEach(c => {
          if (!c.photoUrl) {
            c.photoUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
          }
          if (c.afficherPhoto === undefined) {
            c.afficherPhoto = true;
          }
        });
      }

      saveDB(parsedDB);
      return parsedDB;
    }
  } catch (err) {
    console.error('Error loading db.json:', err);
  }

  // Initial seed data
  const initialDB: DB = {
    users: [
      {
        id: 'u-demo-1',
        nom: 'Jean Dupont',
        email: 'jean.dupont@exemple.com',
        motDePasseHash: 'demo123',
        role: 'USER',
        langue: 'fr',
        createdAt: new Date().toISOString()
      },
      {
        id: 'u-admin',
        nom: 'Administrateur Jospel',
        email: 'mouotiejospel@gmail.com',
        motDePasseHash: 'Iorimarou1@',
        role: 'ADMIN',
        langue: 'fr',
        createdAt: new Date().toISOString()
      }
    ],
    cvs: [
      {
        id: 'cv-demo-1',
        utilisateurId: 'u-demo-1',
        titre: 'Mon CV Développeur Full Stack',
        templateId: 'moderne-1',
        langue: 'fr',
        couleurAccent: '#2563EB',
        police: 'Inter',
        statutPaiement: 'PAYE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sections: [
          {
            id: 'sec-p-1',
            type: 'profil',
            titre: 'Profil & Coordonnées',
            ordre: 1,
            visible: true,
            contenu: {
              nomComplet: 'Jean Dupont',
              titreProfessionnel: 'Développeur Full Stack Senior',
              email: 'jean.dupont@exemple.com',
              telephone: '+237 658 60 61 03',
              adresse: 'Douala, Cameroun',
              website: 'www.jeandupont.dev',
              linkedin: 'linkedin.com/in/jeandupont',
              resume: 'Développeur passionné avec 5+ années d\'expérience dans le développement d\'applications web performantes. Spécialisé en React, Node.js, TypeScript et architectures modernes.'
            }
          },
          {
            id: 'sec-exp-1',
            type: 'experience',
            titre: 'Expériences professionnelles',
            ordre: 2,
            visible: true,
            contenu: [
              {
                id: 'exp-1',
                poste: 'Lead Developer Frontend',
                entreprise: 'Tech Vision Africa',
                ville: 'Douala',
                dateDebut: 'Janvier 2022',
                dateFin: 'Présent',
                actuel: true,
                description: 'Direction technique d\'une équipe de 5 développeurs. Conception d\'interfaces web responsives et optimisation des performances.'
              },
              {
                id: 'exp-2',
                poste: 'Développeur Web Full Stack',
                entreprise: 'Innov Digital Solutions',
                ville: 'Yaoundé',
                dateDebut: 'Juin 2019',
                dateFin: 'Décembre 2021',
                actuel: false,
                description: 'Développement d\'API RESTful sécurisées et de tableaux de bord interactifs pour clients grands comptes.'
              }
            ]
          },
          {
            id: 'sec-edu-1',
            type: 'formation',
            titre: 'Formations & Diplômes',
            ordre: 3,
            visible: true,
            contenu: [
              {
                id: 'edu-1',
                diplome: 'Master en Génie Logiciel',
                etablissement: 'Université de Douala - IUT',
                ville: 'Douala',
                dateDebut: '2017',
                dateFin: '2019',
                description: 'Spécialité Systèmes d\'information et Sécurité. Mention Très Bien.'
              }
            ]
          },
          {
            id: 'sec-sk-1',
            type: 'competences',
            titre: 'Compétences',
            ordre: 4,
            visible: true,
            contenu: [
              { id: 's-1', nom: 'TypeScript / JavaScript', niveau: 5 },
              { id: 's-2', nom: 'React / Next.js', niveau: 5 },
              { id: 's-3', nom: 'Node.js & Express', niveau: 4 },
              { id: 's-4', nom: 'Tailwind CSS', niveau: 5 },
              { id: 's-5', nom: 'PostgreSQL / MongoDB', niveau: 4 }
            ]
          },
          {
            id: 'sec-l-1',
            type: 'langues',
            titre: 'Langues',
            ordre: 5,
            visible: true,
            contenu: [
              { id: 'l-1', langue: 'Français', niveau: 'Langue maternelle' },
              { id: 'l-2', langue: 'Anglais', niveau: 'Courant (C1 / Professionnel)' }
            ]
          }
        ]
      }
    ],
    payments: [
      {
        id: 'pay-demo-1',
        utilisateurId: 'u-demo-1',
        cvId: 'cv-demo-1',
        montant: 100,
        numeroReception: '653998494',
        numeroExpediteur: '690001122',
        referenceTransaction: 'OM202608061234',
        statut: 'VALIDE',
        valideLe: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        userEmail: 'jean.dupont@exemple.com',
        userName: 'Jean Dupont',
        cvTitle: 'Mon CV Développeur Full Stack'
      }
    ]
  };

  saveDB(initialDB);
  return initialDB;
}

function saveDB(data: DB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  const { nom, email, motDePasse, langue } = req.body;
  if (!email || !motDePasse || !nom) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  const db = loadDB();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Un compte existe déjà avec cet e-mail' });
  }

  const newUser = {
    id: `u-${Date.now()}`,
    nom,
    email,
    motDePasseHash: motDePasse,
    role: email.toLowerCase() === 'mouotiejospel@gmail.com' ? 'ADMIN' : 'USER',
    langue: langue || 'fr',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDB(db);

  const { motDePasseHash, ...safeUser } = newUser;
  res.json({ user: safeUser, token: `jwt-token-${newUser.id}` });
});

app.post('/api/auth/login', (req, res) => {
  const { email, motDePasse } = req.body;
  const db = loadDB();

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.motDePasseHash !== motDePasse) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  const { motDePasseHash, ...safeUser } = user;
  res.json({ user: safeUser, token: `jwt-token-${user.id}` });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const userId = authHeader.replace('Bearer jwt-token-', '');
  const db = loadDB();
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    return res.status(401).json({ error: 'Session expirée' });
  }

  const { motDePasseHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

// CV Routes
app.get('/api/cv', (req, res) => {
  const userId = req.query.userId as string;
  const db = loadDB();

  let userCVs = db.cvs;
  if (userId) {
    userCVs = db.cvs.filter(c => c.utilisateurId === userId);
  }

  res.json({ cvs: userCVs });
});

app.post('/api/cv', (req, res) => {
  const { utilisateurId, titre, templateId, langue, couleurAccent, police, sections } = req.body;
  const db = loadDB();

  const preset = getPresetForTemplate(templateId || 'moderne-1', langue || 'fr');
  const defaultSections = sections || preset.sections;

  const newCV = {
    id: `cv-${Date.now()}`,
    utilisateurId: utilisateurId || 'u-demo-1',
    titre: titre || preset.titre || 'Nouveau CV',
    templateId: templateId || 'moderne-1',
    langue: langue || 'fr',
    couleurAccent: couleurAccent || preset.couleurAccent || '#2563EB',
    police: police || preset.police || 'Inter',
    taillePolice: 'md',
    hauteurLigne: 'normal',
    ecartementTexte: 'normal',
    margeSection: 'normal',
    photoUrl: preset.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    afficherPhoto: true,
    titrePrincipalEnGrand: 'NOM',
    statutPaiement: 'NON_PAYE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: defaultSections
  };

  db.cvs.push(newCV);
  saveDB(db);

  res.json({ cv: newCV });
});

app.get('/api/cv/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const cv = db.cvs.find(c => c.id === id);

  if (!cv) {
    return res.status(404).json({ error: 'CV non trouvé' });
  }

  res.json({ cv });
});

app.put('/api/cv/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const db = loadDB();

  const index = db.cvs.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'CV non trouvé' });
  }

  db.cvs[index] = {
    ...db.cvs[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveDB(db);
  res.json({ cv: db.cvs[index] });
});

app.delete('/api/cv/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDB();

  db.cvs = db.cvs.filter(c => c.id !== id);
  db.payments = db.payments.filter(p => p.cvId !== id);

  saveDB(db);
  res.json({ success: true });
});

app.post('/api/cv/:id/duplicate', (req, res) => {
  const { id } = req.params;
  const db = loadDB();

  const original = db.cvs.find(c => c.id === id);
  if (!original) {
    return res.status(404).json({ error: 'CV non trouvé' });
  }

  const duplicated = {
    ...JSON.parse(JSON.stringify(original)),
    id: `cv-${Date.now()}`,
    titre: `${original.titre} (Copie)`,
    statutPaiement: 'NON_PAYE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.cvs.push(duplicated);
  saveDB(db);

  res.json({ cv: duplicated });
});

// Payment Routes
app.post('/api/paiement/soumettre', (req, res) => {
  const { utilisateurId, cvId, numeroReception, numeroExpediteur, referenceTransaction } = req.body;
  if (!cvId || !numeroReception || !numeroExpediteur || !referenceTransaction) {
    return res.status(400).json({ error: 'Informations de paiement incomplètes' });
  }

  const db = loadDB();
  const cvIndex = db.cvs.findIndex(c => c.id === cvId);
  if (cvIndex === -1) {
    return res.status(404).json({ error: 'CV non trouvé' });
  }

  const user = db.users.find(u => u.id === utilisateurId) || { nom: 'Utilisateur', email: 'user@exemple.com' };

  // Set CV status to EN_ATTENTE when user submits code so admin can review and validate
  db.cvs[cvIndex].statutPaiement = 'EN_ATTENTE';
  db.cvs[cvIndex].updatedAt = new Date().toISOString();

  // Remove previous pending payments for this CV if any
  db.payments = db.payments.filter(p => p.cvId !== cvId);

  const newPayment = {
    id: `pay-${Date.now()}`,
    utilisateurId: utilisateurId || 'u-demo-1',
    cvId,
    montant: 500,
    numeroReception: numeroReception || '653998494',
    numeroExpediteur,
    referenceTransaction,
    statut: 'EN_ATTENTE',
    createdAt: new Date().toISOString(),
    userEmail: user.email,
    userName: user.nom,
    cvTitle: db.cvs[cvIndex].titre
  };

  db.payments.push(newPayment);
  saveDB(db);

  res.json({ payment: newPayment, cv: db.cvs[cvIndex] });
});

// Admin Routes
app.get('/api/admin/paiements', (req, res) => {
  const db = loadDB();
  res.json({ payments: db.payments });
});

app.post('/api/admin/paiement/:id/valider', (req, res) => {
  const { id } = req.params;
  const db = loadDB();

  const paymentIndex = db.payments.findIndex(p => p.id === id);
  if (paymentIndex === -1) {
    return res.status(404).json({ error: 'Paiement non trouvé' });
  }

  db.payments[paymentIndex].statut = 'VALIDE';
  db.payments[paymentIndex].valideLe = new Date().toISOString();

  const cvId = db.payments[paymentIndex].cvId;
  const cvIndex = db.cvs.findIndex(c => c.id === cvId);
  if (cvIndex !== -1) {
    db.cvs[cvIndex].statutPaiement = 'PAYE';
    db.cvs[cvIndex].updatedAt = new Date().toISOString();
  }

  saveDB(db);
  res.json({ payment: db.payments[paymentIndex] });
});

app.post('/api/admin/paiement/:id/rejeter', (req, res) => {
  const { id } = req.params;
  const { noteAdmin } = req.body;
  const db = loadDB();

  const paymentIndex = db.payments.findIndex(p => p.id === id);
  if (paymentIndex === -1) {
    return res.status(404).json({ error: 'Paiement non trouvé' });
  }

  db.payments[paymentIndex].statut = 'REJETE';
  db.payments[paymentIndex].noteAdmin = noteAdmin || 'Refusé par l\'administrateur';

  const cvId = db.payments[paymentIndex].cvId;
  const cvIndex = db.cvs.findIndex(c => c.id === cvId);
  if (cvIndex !== -1) {
    db.cvs[cvIndex].statutPaiement = 'NON_PAYE';
    db.cvs[cvIndex].updatedAt = new Date().toISOString();
  }

  saveDB(db);
  res.json({ payment: db.payments[paymentIndex] });
});

// -------------------------------------------------------------
// AI SPELLCHECK & GRAMMAR CORRECTION ENDPOINTS (GEMINI API)
// -------------------------------------------------------------

import { GoogleGenAI } from '@google/genai';

let geminiAi: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiAi) {
    geminiAi = new GoogleGenAI({ apiKey });
  }
  return geminiAi;
}

// Simple in-memory cache for spellcheck to minimize Gemini API calls
const spellcheckCache = new Map<string, any>();
const MAX_CACHE_SIZE = 300;

function getCachedCorrection(key: string) {
  return spellcheckCache.get(key);
}

function setCachedCorrection(key: string, val: any) {
  if (spellcheckCache.size >= MAX_CACHE_SIZE) {
    const firstKey = spellcheckCache.keys().next().value;
    if (firstKey) spellcheckCache.delete(firstKey);
  }
  spellcheckCache.set(key, val);
}

async function generateGeminiContentWithFallback(ai: GoogleGenAI, prompt: string) {
  const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return response.text || '{}';
    } catch (err: any) {
      lastError = err;
      const isQuota = err?.status === 'RESOURCE_EXHAUSTED' ||
                      err?.status === 429 ||
                      err?.message?.includes('429') ||
                      err?.message?.includes('Quota exceeded');
      if (isQuota) {
        console.warn(`[Gemini] Model ${model} rate limited or quota exceeded, trying fallback model...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

app.post('/api/correction', async (req, res) => {
  const { texte, langue = 'fr' } = req.body;

  if (!texte || typeof texte !== 'string' || texte.trim().length === 0) {
    return res.json({ erreurs: [] });
  }

  const cacheKey = `${langue}:${texte.trim()}`;
  const cached = getCachedCorrection(cacheKey);
  if (cached) {
    return res.json({ erreurs: cached });
  }

  const ai = getGemini();

  if (!ai) {
    return res.json({
      erreurs: [],
      warning: 'API Key Gemini non configurée sur le serveur.'
    });
  }

  try {
    const prompt = `Tu es un expert en révision de CV professionnel en langue ${langue === 'en' ? 'Anglaise' : 'Française'}.
Analyse le texte suivant et identifie TOUTES les fautes d'orthographe, de grammaire, de conjugaison, d'accord et de ponctuation.
Retourne EXCLUSIVEMENT un objet JSON valide au format exact suivant:
{
  "erreurs": [
    {
      "motOriginal": "mot ou expression fautive",
      "correction": "mot ou expression corrigée",
      "explication": "brève explication claire",
      "type": "orthographe"
    }
  ]
}

Si le texte n'a aucune faute, retourne {"erreurs": []}.
Ne rajoute aucun texte avant ou après le JSON.

Texte à analyser:
"${texte.replace(/"/g, '\\"')}"`;

    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = JSON.parse(responseText || '{}');
    const erreurs = Array.isArray(parsed.erreurs) ? parsed.erreurs : [];

    setCachedCorrection(cacheKey, erreurs);

    res.json({ erreurs });
  } catch (err: any) {
    const isQuota = err?.status === 'RESOURCE_EXHAUSTED' ||
                    err?.status === 429 ||
                    err?.message?.includes('429') ||
                    err?.message?.includes('Quota exceeded');

    if (isQuota) {
      console.warn('Gemini spellcheck API quota/rate limit reached. Returning fallback response.');
      return res.json({
        erreurs: [],
        warning: 'Quota d\'analyse orthographique temporairement atteint.'
      });
    }

    console.error('Gemini spellcheck error:', err?.message || err);
    res.json({
      erreurs: [],
      warning: 'Erreur lors de la vérification orthographique par IA.'
    });
  }
});

app.post('/api/correction/cv', async (req, res) => {
  const { cv } = req.body;
  if (!cv || !cv.sections) {
    return res.status(400).json({ error: 'CV invalide' });
  }

  const ai = getGemini();
  if (!ai) {
    return res.json({
      correctionsGlobales: [],
      warning: 'API Key Gemini non configurée.'
    });
  }

  try {
    const prompt = `Tu es un consultant en recrutement et expert en rédaction de CV.
Examine la structure et les textes de ce CV au format JSON et suggère des corrections orthographiques, grammaticales et d'amélioration d'impact professionnel.

Retourne un JSON avec cette structure:
{
  "correctionsGlobales": [
    {
      "sectionId": "id de la section",
      "champ": "nom du champ",
      "texteOriginal": "texte original",
      "texteCorrige": "texte corrigé",
      "explication": "explication"
    }
  ]
}

CV: ${JSON.stringify(cv).slice(0, 8000)}`;

    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = JSON.parse(responseText || '{}');
    res.json(parsed);
  } catch (err: any) {
    const isQuota = err?.status === 'RESOURCE_EXHAUSTED' ||
                    err?.status === 429 ||
                    err?.message?.includes('429') ||
                    err?.message?.includes('Quota exceeded');

    if (isQuota) {
      console.warn('Gemini CV correction API quota/rate limit reached.');
      return res.json({
        correctionsGlobales: [],
        warning: 'Quota d\'analyse IA temporairement atteint.'
      });
    }

    console.error('Error correcting entire CV with Gemini:', err?.message || err);
    res.json({ correctionsGlobales: [], error: err?.message || 'Erreur inconnue' });
  }
});

// -------------------------------------------------------------
// VITE INTEGRATION & SERVER STARTUP
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
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
    console.log(`CV Builder server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
