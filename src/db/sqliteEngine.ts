import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'app.db');
const LEGACY_JSON_PATH = path.join(DB_DIR, 'db.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let sqliteDbInstance: DatabaseSync | null = null;

export function getSqliteDb(): DatabaseSync {
  if (!sqliteDbInstance) {
    sqliteDbInstance = new DatabaseSync(DB_PATH);
    // Keep foreign keys OFF in SQLite local replica to prevent foreign key mismatch crashes
    sqliteDbInstance.exec('PRAGMA foreign_keys = OFF;');
    sqliteDbInstance.exec('PRAGMA journal_mode = WAL;');
    initTables(sqliteDbInstance);
    migrateLegacyJsonData(sqliteDbInstance);
  }
  return sqliteDbInstance;
}

function initTables(db: DatabaseSync) {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      motDePasseHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      subscriptionTier TEXT NOT NULL DEFAULT 'freemium',
      subscriptionExpiresAt TEXT,
      langue TEXT DEFAULT 'fr',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 2. Unified Documents Table (CVs and Cover Letters)
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('CV', 'COVER_LETTER')),
      cvId TEXT,
      titre TEXT NOT NULL,
      templateId TEXT NOT NULL DEFAULT 'classique',
      langue TEXT DEFAULT 'fr',
      content TEXT NOT NULL,
      entreprise TEXT,
      poste TEXT,
      destinataire TEXT,
      objet TEXT,
      statutPaiement TEXT DEFAULT 'PAYE',
      isArchived INTEGER DEFAULT 0,
      isPublic INTEGER DEFAULT 0,
      metadata TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (cvId) REFERENCES documents(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sqlite_docs_user_type ON documents(userId, type);
    CREATE INDEX IF NOT EXISTS idx_sqlite_docs_cv_id ON documents(cvId);
    CREATE INDEX IF NOT EXISTS idx_sqlite_docs_updated_at ON documents(updatedAt);
  `);

  // 3. CVs Table (Legacy compatibility)
  db.exec(`
    CREATE TABLE IF NOT EXISTS cvs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      titre TEXT NOT NULL,
      templateId TEXT NOT NULL DEFAULT 'classique',
      langue TEXT DEFAULT 'fr',
      cvData TEXT NOT NULL,
      isPublic INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 4. Cover Letters Table (Legacy compatibility)
  db.exec(`
    CREATE TABLE IF NOT EXISTS cover_letters (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      cvId TEXT,
      titre TEXT NOT NULL,
      templateId TEXT NOT NULL DEFAULT 'classique',
      langue TEXT DEFAULT 'fr',
      entreprise TEXT,
      poste TEXT,
      destinataire TEXT,
      objet TEXT,
      letterData TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 4. Payments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      planTier TEXT NOT NULL,
      montant REAL NOT NULL,
      devise TEXT NOT NULL DEFAULT 'FCFA',
      referenceTransaction TEXT UNIQUE NOT NULL,
      statut TEXT NOT NULL DEFAULT 'succeeded',
      methodePaiement TEXT DEFAULT 'ikeepay',
      datePaiement TEXT NOT NULL,
      metaData TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 5. App Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 6. Password Resets Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      email TEXT PRIMARY KEY,
      token TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  // 7. Subscriptions History Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      paymentId TEXT,
      planTier TEXT NOT NULL,
      startsAt TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      statut TEXT NOT NULL DEFAULT 'ACTIF',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (paymentId) REFERENCES payments(id) ON DELETE SET NULL
    );
  `);

  // 6. User Activity Log Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_activity (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      activityType TEXT NOT NULL,
      description TEXT,
      metadata TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  // 7. Notifications Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      isRead INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);
}

function migrateLegacyJsonData(db: DatabaseSync) {
  try {
    // Seed default Admin user if users table is empty
    const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users');
    const userCountRow = userCountStmt.get() as { count: number };

    let importedUsers = false;

    if (userCountRow.count === 0 && fs.existsSync(LEGACY_JSON_PATH)) {
      try {
        const rawJson = fs.readFileSync(LEGACY_JSON_PATH, 'utf-8');
        const legacyData = JSON.parse(rawJson);

        // Migrate users
        if (Array.isArray(legacyData.users)) {
          const insertUser = db.prepare(`
            INSERT OR IGNORE INTO users (id, nom, email, motDePasseHash, role, subscriptionTier, subscriptionExpiresAt, langue, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const u of legacyData.users) {
            insertUser.run(
              u.id || `u-${Math.random().toString(36).substring(2)}`,
              u.nom || 'Utilisateur',
              (u.email || '').toLowerCase().trim(),
              u.motDePasseHash || bcrypt.hashSync('password123', 10),
              u.role || 'USER',
              u.subscriptionTier || 'freemium',
              u.subscriptionExpiresAt || null,
              u.langue || 'fr',
              u.createdAt || new Date().toISOString(),
              u.updatedAt || new Date().toISOString()
            );
          }
          importedUsers = true;
        }

        // Migrate CVs
        if (Array.isArray(legacyData.cvs)) {
          const insertCv = db.prepare(`
            INSERT OR IGNORE INTO cvs (id, userId, titre, templateId, langue, cvData, isPublic, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          const ensureUser = db.prepare(`
            INSERT OR IGNORE INTO users (id, nom, email, motDePasseHash, role, subscriptionTier, langue, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, 'USER', 'freemium', 'fr', ?, ?)
          `);
          for (const c of legacyData.cvs) {
            const ownerId = c.userId || c.utilisateurId || 'u-admin-1';
            const nowIso = new Date().toISOString();
            ensureUser.run(ownerId, `Utilisateur ${ownerId.substring(0, 8)}`, `${ownerId}@cv-platform.internal`, bcrypt.hashSync('password123', 10), nowIso, nowIso);
            insertCv.run(
              c.id,
              ownerId,
              c.titre || c.titreCV || 'Mon CV',
              c.templateId || 'classique',
              c.langue || 'fr',
              JSON.stringify(c),
              c.isPublic ? 1 : 0,
              c.createdAt || c.dateCreation || new Date().toISOString(),
              c.updatedAt || new Date().toISOString()
            );
          }
        }

        // Migrate Cover Letters
        if (Array.isArray(legacyData.letters)) {
          const insertLetter = db.prepare(`
            INSERT OR IGNORE INTO cover_letters (id, userId, cvId, titre, templateId, langue, entreprise, poste, destinataire, objet, letterData, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          const ensureUser = db.prepare(`
            INSERT OR IGNORE INTO users (id, nom, email, motDePasseHash, role, subscriptionTier, langue, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, 'USER', 'freemium', 'fr', ?, ?)
          `);
          for (const l of legacyData.letters) {
            const ownerId = l.userId || l.utilisateurId || 'u-admin-1';
            const nowIso = new Date().toISOString();
            ensureUser.run(ownerId, `Utilisateur ${ownerId.substring(0, 8)}`, `${ownerId}@cv-platform.internal`, bcrypt.hashSync('password123', 10), nowIso, nowIso);
            insertLetter.run(
              l.id,
              ownerId,
              l.cvId || null,
              l.titre || 'Lettre de motivation',
              l.templateId || 'classique',
              l.langue || 'fr',
              l.entreprise || '',
              l.poste || '',
              l.destinataire || '',
              l.objet || '',
              JSON.stringify(l),
              l.createdAt || l.dateCreation || new Date().toISOString(),
              l.updatedAt || new Date().toISOString()
            );
          }
        }

        // Migrate App Settings
        if (legacyData.appSettings && typeof legacyData.appSettings === 'object') {
          const insertSetting = db.prepare(`
            INSERT OR REPLACE INTO app_settings (key, value, updatedAt) VALUES (?, ?, ?)
          `);
          insertSetting.run(
            'global_config',
            JSON.stringify(legacyData.appSettings),
            new Date().toISOString()
          );
        }
      } catch (e) {
        console.warn('Could not parse legacy db.json for migration:', e);
      }
    }

    // Seed admin user ONLY if ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD env vars are set
    const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || '').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

    if (adminEmail && adminPassword) {
      const adminCheck = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
      if (!adminCheck) {
        const adminHash = bcrypt.hashSync(adminPassword, 12);
        const now = new Date().toISOString();
        db.prepare(`
          INSERT INTO users (id, nom, email, motDePasseHash, role, subscriptionTier, langue, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(`u-admin-${Date.now()}`, 'Administrateur Principal', adminEmail, adminHash, 'ADMIN', 'premium', 'fr', now, now);
        console.log(`[SQLITE BOOTSTRAP] Compte admin initialisé avec succès pour ${adminEmail}`);
      }
    }

    // Ensure default app_settings row exists
    const settingsCheck = db.prepare('SELECT key FROM app_settings WHERE key = ?').get('global_config');
    if (!settingsCheck) {
      const defaultConfig = {
        paiementActif: true,
        pricingPlans: [
          { code: 'decouverte', nom: 'Découverte / Gratuit', prix: 0, devise: 'FCFA', description: 'Accès aux fonctionnalités de base' },
          { code: 'classique', nom: 'Pass Classique (7 Jours)', prix: 2500, devise: 'FCFA', description: 'Génération IA illimitée + Export PDF' },
          { code: 'premium', nom: 'Pass Premium Pro (30 Jours)', prix: 5000, devise: 'FCFA', description: 'Accès complet Studio + Ciblage d\'offres + Support prioritaire' }
        ],
        adminPaidMatrix: {
          studioMenus: {
            creativeTemplates: { isPaid: true, label: 'Modèles Créatifs & Design' },
            designerCanvas: { isPaid: true, label: 'Visual Designer Canvas' },
            translatorAI: { isPaid: true, label: 'Traducteur IA Multi-langues' },
            letterGenerator: { isPaid: true, label: 'Générateur de Lettre IA' },
            jobTargeting: { isPaid: true, label: 'Ciblage d\'Offre d\'Emploi' },
            linkedinGenerator: { isPaid: true, label: 'Optimiseur de Profil LinkedIn' },
            careerTools: { isPaid: false, label: 'Outils de Carrière' }
          },
          subOptions: {
            pdfExportWatermarkFree: { isPaid: true, label: 'Export PDF HD sans Filigrane' },
            aiAutoFix: { isPaid: true, label: 'Correction Automatique IA' },
            customFonts: { isPaid: true, label: 'Polices Typographiques Premium' },
            unlimitedCVs: { isPaid: true, label: 'Création de CVs Illimités' },
            highPrioritySupport: { isPaid: false, label: 'Support Client' }
          }
        }
      };

      db.prepare(`
        INSERT INTO app_settings (key, value, updatedAt) VALUES (?, ?, ?)
      `).run('global_config', JSON.stringify(defaultConfig), new Date().toISOString());
    }
  } catch (err) {
    console.warn('Error during SQLite database initialization or migration:', err);
  }
}
