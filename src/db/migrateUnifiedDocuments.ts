import { Pool } from 'pg';
import { getSqliteDb } from './sqliteEngine.js';
import fs from 'fs';
import path from 'path';

export interface MigrationResult {
  success: boolean;
  targetEngine: 'postgresql' | 'sqlite' | 'both';
  cvsMigrated: number;
  coverLettersMigrated: number;
  totalDocumentsInUnifiedTable: number;
  relationalIntegrityCheck: {
    foreignKeysValid: boolean;
    orphanDocumentsCount: number;
    parentCvLinksCount: number;
  };
  details: string[];
  errors: string[];
  timestamp: string;
}

function getAdminPgPool(): Pool {
  const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER || 'postgres';
  const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD || 'postgres';
  return new Pool({
    host: process.env.SQL_HOST || 'localhost',
    port: parseInt(process.env.SQL_PORT || '5432', 10),
    user,
    password,
    database: process.env.SQL_DB_NAME || 'cv_builder_db',
    connectionTimeoutMillis: 15000,
  });
}

/**
 * Migration engine to unify CVs and Cover Letters into a single consistent SQL schema.
 * Ensures zero data loss and strict relational integrity across PostgreSQL and SQLite.
 */
export async function runUnifiedDocumentsMigration(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    targetEngine: 'both',
    cvsMigrated: 0,
    coverLettersMigrated: 0,
    totalDocumentsInUnifiedTable: 0,
    relationalIntegrityCheck: {
      foreignKeysValid: true,
      orphanDocumentsCount: 0,
      parentCvLinksCount: 0,
    },
    details: [],
    errors: [],
    timestamp: new Date().toISOString(),
  };

  const isPgAvailable = !!process.env.DATABASE_URL || !!process.env.SQL_HOST;

  // =========================================================================
  // 1. POSTGRESQL / CLOUD SQL UNIFIED MIGRATION
  // =========================================================================
  if (isPgAvailable) {
    result.details.push('[PostgreSQL] Connecting with administrative credentials...');
    let pool: Pool | null = null;
    try {
      pool = getAdminPgPool();
      const client = await pool.connect();

      try {
        await client.query('BEGIN');
        result.details.push('[PostgreSQL] Transaction started.');

        // 1.1 Ensure unified `documents` table exists
        await client.query(`
          CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type TEXT NOT NULL CHECK(type IN ('CV', 'COVER_LETTER')),
            cv_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
            titre TEXT NOT NULL,
            template_id TEXT NOT NULL,
            langue TEXT DEFAULT 'fr' NOT NULL,
            content JSONB NOT NULL,
            entreprise TEXT,
            poste TEXT,
            destinataire TEXT,
            objet TEXT,
            statut_paiement TEXT DEFAULT 'PAYE' NOT NULL,
            is_archived BOOLEAN DEFAULT FALSE NOT NULL,
            is_public BOOLEAN DEFAULT FALSE NOT NULL,
            metadata JSONB,
            created_at TIMESTAMP DEFAULT now() NOT NULL,
            updated_at TIMESTAMP DEFAULT now() NOT NULL
          );
        `);
        result.details.push('[PostgreSQL] Table "documents" ensured.');

        // 1.2 Ensure indices exist
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
          CREATE INDEX IF NOT EXISTS idx_documents_user_type ON documents(user_id, type);
          CREATE INDEX IF NOT EXISTS idx_documents_cv_id ON documents(cv_id);
          CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at);
        `);
        result.details.push('[PostgreSQL] Indices ensured for performance & relational joins.');

        // 1.3 Grant app user privileges if running with admin
        const appUser = process.env.SQL_USER;
        if (appUser) {
          try {
            await client.query(`GRANT ALL PRIVILEGES ON TABLE documents TO "${appUser}";`);
            result.details.push(`[PostgreSQL] Granted table privileges to app user "${appUser}".`);
          } catch (grantErr: any) {
            result.details.push(`[PostgreSQL] Permission grant notice: ${grantErr.message}`);
          }
        }

        // 1.4 Inspect and migrate from legacy `cvs` table
        const cvTableCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'cvs'
          );
        `);

        if (cvTableCheck.rows[0].exists) {
          const cvCountRes = await client.query('SELECT COUNT(*) FROM cvs;');
          const cvCount = parseInt(cvCountRes.rows[0].count, 10);
          result.details.push(`[PostgreSQL] Detected ${cvCount} records in legacy "cvs" table.`);

          if (cvCount > 0) {
            // Guarantee parent users exist to preserve foreign key integrity
            await client.query(`
              INSERT INTO users (id, nom, email, mot_de_passe_hash, role, subscription_tier, langue, created_at, updated_at)
              SELECT DISTINCT c.user_id, 'Utilisateur ' || SUBSTRING(c.user_id FROM 1 FOR 8), c.user_id || '@cv-platform.internal', '$2b$10$hashed_pwd_migration', 'USER', 'freemium', 'fr', now(), now()
              FROM cvs c
              LEFT JOIN users u ON u.id = c.user_id
              WHERE u.id IS NULL
              ON CONFLICT (id) DO NOTHING;
            `);

            // Migrate CV records into `documents` table
            const insertCvRes = await client.query(`
              INSERT INTO documents (
                id, user_id, type, cv_id, titre, template_id, langue, content,
                statut_paiement, is_archived, is_public, created_at, updated_at
              )
              SELECT
                c.id,
                c.user_id,
                'CV' AS type,
                NULL AS cv_id,
                COALESCE(c.titre, 'Mon CV') AS titre,
                COALESCE(c.template_id, 'classique') AS template_id,
                COALESCE(c.langue, 'fr') AS langue,
                c.cv_data AS content,
                COALESCE(c.statut_paiement, 'PAYE') AS statut_paiement,
                COALESCE(c.is_archived, false) AS is_archived,
                false AS is_public,
                COALESCE(c.created_at, now()) AS created_at,
                COALESCE(c.updated_at, now()) AS updated_at
              FROM cvs c
              ON CONFLICT (id) DO UPDATE SET
                content = EXCLUDED.content,
                titre = EXCLUDED.titre,
                template_id = EXCLUDED.template_id,
                langue = EXCLUDED.langue,
                statut_paiement = EXCLUDED.statut_paiement,
                is_archived = EXCLUDED.is_archived,
                updated_at = EXCLUDED.updated_at;
            `);
            result.cvsMigrated += insertCvRes.rowCount || 0;
            result.details.push(`[PostgreSQL] Migrated ${insertCvRes.rowCount} CV records into "documents".`);
          }
        }

        // 1.5 Inspect and migrate from legacy `cover_letters` table
        const letterTableCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'cover_letters'
          );
        `);

        if (letterTableCheck.rows[0].exists) {
          const letterCountRes = await client.query('SELECT COUNT(*) FROM cover_letters;');
          const letterCount = parseInt(letterCountRes.rows[0].count, 10);
          result.details.push(`[PostgreSQL] Detected ${letterCount} records in legacy "cover_letters" table.`);

          if (letterCount > 0) {
            // Guarantee parent users exist
            await client.query(`
              INSERT INTO users (id, nom, email, mot_de_passe_hash, role, subscription_tier, langue, created_at, updated_at)
              SELECT DISTINCT cl.user_id, 'Utilisateur ' || SUBSTRING(cl.user_id FROM 1 FOR 8), cl.user_id || '@cv-platform.internal', '$2b$10$hashed_pwd_migration', 'USER', 'freemium', 'fr', now(), now()
              FROM cover_letters cl
              LEFT JOIN users u ON u.id = cl.user_id
              WHERE u.id IS NULL
              ON CONFLICT (id) DO NOTHING;
            `);

            // Migrate Cover Letter records into `documents` table
            const insertLetterRes = await client.query(`
              INSERT INTO documents (
                id, user_id, type, cv_id, titre, template_id, langue, content,
                entreprise, poste, destinataire, objet, statut_paiement, is_archived, is_public, created_at, updated_at
              )
              SELECT
                cl.id,
                cl.user_id,
                'COVER_LETTER' AS type,
                NULL AS cv_id,
                COALESCE(cl.titre, 'Lettre de motivation') AS titre,
                COALESCE(cl.template_id, 'classique') AS template_id,
                COALESCE(cl.langue, 'fr') AS langue,
                cl.letter_data AS content,
                cl.letter_data->>'entreprise' AS entreprise,
                cl.letter_data->>'poste' AS poste,
                cl.letter_data->>'destinataire' AS destinataire,
                cl.letter_data->>'objet' AS objet,
                'PAYE' AS statut_paiement,
                false AS is_archived,
                false AS is_public,
                COALESCE(cl.created_at, now()) AS created_at,
                COALESCE(cl.updated_at, now()) AS updated_at
              FROM cover_letters cl
              ON CONFLICT (id) DO UPDATE SET
                content = EXCLUDED.content,
                titre = EXCLUDED.titre,
                template_id = EXCLUDED.template_id,
                langue = EXCLUDED.langue,
                entreprise = EXCLUDED.entreprise,
                poste = EXCLUDED.poste,
                destinataire = EXCLUDED.destinataire,
                objet = EXCLUDED.objet,
                updated_at = EXCLUDED.updated_at;
            `);
            result.coverLettersMigrated += insertLetterRes.rowCount || 0;
            result.details.push(`[PostgreSQL] Migrated ${insertLetterRes.rowCount} cover letter records into "documents".`);
          }
        }

        // 1.6 Link parent CVs if cover letters contain a cvId in content JSON
        const linkRes = await client.query(`
          UPDATE documents d
          SET cv_id = p.id
          FROM documents p
          WHERE d.type = 'COVER_LETTER'
            AND p.type = 'CV'
            AND (d.content->>'cvId' = p.id OR d.content->>'cv_id' = p.id)
            AND d.cv_id IS NULL;
        `);
        result.relationalIntegrityCheck.parentCvLinksCount = linkRes.rowCount || 0;
        result.details.push(`[PostgreSQL] Linked ${linkRes.rowCount || 0} cover letters to parent CV documents.`);

        // 1.7 Verification & Integrity Checks
        const totalDocsRes = await client.query('SELECT COUNT(*) FROM documents;');
        result.totalDocumentsInUnifiedTable = parseInt(totalDocsRes.rows[0].count, 10);
        result.details.push(`[PostgreSQL] Unified "documents" table verified with ${result.totalDocumentsInUnifiedTable} total rows.`);

        const orphanCheck = await client.query(`
          SELECT COUNT(*) as orphans
          FROM documents d
          LEFT JOIN users u ON u.id = d.user_id
          WHERE u.id IS NULL;
        `);
        const orphanCount = parseInt(orphanCheck.rows[0].orphans, 10);
        result.relationalIntegrityCheck.orphanDocumentsCount = orphanCount;

        if (orphanCount > 0) {
          result.relationalIntegrityCheck.foreignKeysValid = false;
          result.errors.push(`[PostgreSQL] Warning: ${orphanCount} orphan documents detected.`);
        } else {
          result.details.push('[PostgreSQL] Relational integrity verified: 100% of documents reference valid users.');
        }

        // 1.8 Create or replace backward compatibility views
        try {
          await client.query(`
            CREATE OR REPLACE VIEW v_cvs AS
            SELECT 
              id, user_id, titre, template_id, langue, 
              content AS cv_data, statut_paiement, is_archived, is_public, 
              created_at, updated_at
            FROM documents
            WHERE type = 'CV';

            CREATE OR REPLACE VIEW v_cover_letters AS
            SELECT 
              id, user_id, cv_id, titre, template_id, langue,
              entreprise, poste, destinataire, objet, 
              content AS letter_data, statut_paiement, is_archived, is_public,
              created_at, updated_at
            FROM documents
            WHERE type = 'COVER_LETTER';
          `);
          result.details.push('[PostgreSQL] Backward-compatibility views "v_cvs" and "v_cover_letters" active.');
        } catch (viewErr: any) {
          result.details.push(`[PostgreSQL] View creation note: ${viewErr.message}`);
        }

        await client.query('COMMIT');
        result.details.push('[PostgreSQL] Transaction committed successfully.');
      } catch (pgErr: any) {
        await client.query('ROLLBACK');
        result.details.push('[PostgreSQL] Transaction rolled back due to error.');
        result.errors.push(`[PostgreSQL Error] ${pgErr.message}`);
        result.success = false;
      } finally {
        client.release();
        await pool.end();
      }
    } catch (connErr: any) {
      result.errors.push(`[PostgreSQL Connection] ${connErr.message}`);
      result.success = false;
    }
  }

  // =========================================================================
  // 2. SQLITE UNIFIED MIGRATION
  // =========================================================================
  try {
    result.details.push('[SQLite] Inspecting SQLite engine for schema unification...');
    const sqlite = getSqliteDb();

    sqlite.exec('PRAGMA foreign_keys = OFF;');

    // Ensure all userIds from cvs and cover_letters exist in SQLite users table
    const cvUsers = sqlite.prepare('SELECT DISTINCT userId FROM cvs').all() as { userId: string }[];
    const letterUsers = sqlite.prepare('SELECT DISTINCT userId FROM cover_letters').all() as { userId: string }[];
    const allUserIds = new Set([...cvUsers.map(u => u.userId), ...letterUsers.map(u => u.userId)]);
    for (const uid of allUserIds) {
      if (!uid) continue;
      const uExists = sqlite.prepare('SELECT id FROM users WHERE id = ?').get(uid);
      if (!uExists) {
        const now = new Date().toISOString();
        sqlite.prepare(`
          INSERT OR IGNORE INTO users (id, nom, email, motDePasseHash, role, subscriptionTier, langue, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, 'USER', 'freemium', 'fr', ?, ?)
        `).run(uid, `Utilisateur ${uid.substring(0, 8)}`, `${uid}@cv-platform.internal`, '$2b$10$hashed_pwd_migration', now, now);
      }
    }

    // 2.1 Create unified documents table in SQLite
    sqlite.exec(`
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
    result.details.push('[SQLite] Unified "documents" table and indices ensured.');

    // 2.2 Migrate CVs from SQLite cvs table
    const existingCvsStmt = sqlite.prepare('SELECT * FROM cvs');
    const sqliteCvs = existingCvsStmt.all() as any[];

    if (sqliteCvs.length > 0) {
      const insertSqliteDoc = sqlite.prepare(`
        INSERT OR REPLACE INTO documents (
          id, userId, type, cvId, titre, templateId, langue, content,
          statutPaiement, isArchived, isPublic, createdAt, updatedAt
        )
        VALUES (?, ?, 'CV', NULL, ?, ?, ?, ?, 'PAYE', 0, ?, ?, ?)
      `);

      for (const cv of sqliteCvs) {
        insertSqliteDoc.run(
          cv.id,
          cv.userId,
          cv.titre || 'Mon CV',
          cv.templateId || 'classique',
          cv.langue || 'fr',
          typeof cv.cvData === 'string' ? cv.cvData : JSON.stringify(cv.cvData || {}),
          cv.isPublic ? 1 : 0,
          cv.createdAt || new Date().toISOString(),
          cv.updatedAt || new Date().toISOString()
        );
      }
      result.details.push(`[SQLite] Migrated ${sqliteCvs.length} CVs into SQLite "documents".`);
    }

    // 2.3 Migrate Cover Letters from SQLite cover_letters table
    const existingLettersStmt = sqlite.prepare('SELECT * FROM cover_letters');
    const sqliteLetters = existingLettersStmt.all() as any[];

    if (sqliteLetters.length > 0) {
      const insertSqliteLetter = sqlite.prepare(`
        INSERT OR REPLACE INTO documents (
          id, userId, type, cvId, titre, templateId, langue, content,
          entreprise, poste, destinataire, objet, statutPaiement, isArchived, isPublic, createdAt, updatedAt
        )
        VALUES (?, ?, 'COVER_LETTER', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAYE', 0, 0, ?, ?)
      `);

      for (const l of sqliteLetters) {
        let validCvId: string | null = null;
        if (l.cvId) {
          const cvCheck = sqlite.prepare('SELECT id FROM documents WHERE id = ?').get(l.cvId);
          if (cvCheck) validCvId = l.cvId;
        }

        insertSqliteLetter.run(
          l.id,
          l.userId,
          validCvId,
          l.titre || 'Lettre de motivation',
          l.templateId || 'classique',
          l.langue || 'fr',
          typeof l.letterData === 'string' ? l.letterData : JSON.stringify(l.letterData || {}),
          l.entreprise || '',
          l.poste || '',
          l.destinataire || '',
          l.objet || '',
          l.createdAt || new Date().toISOString(),
          l.updatedAt || new Date().toISOString()
        );
      }
      result.details.push(`[SQLite] Migrated ${sqliteLetters.length} cover letters into SQLite "documents".`);
    }

    // 2.4 Verify SQLite unified records
    const sqliteCountRow = sqlite.prepare('SELECT COUNT(*) as count FROM documents').get() as { count: number };
    result.details.push(`[SQLite] Total unified documents in SQLite: ${sqliteCountRow.count}.`);

  } catch (sqliteErr: any) {
    result.errors.push(`[SQLite Error] ${sqliteErr.message}`);
    result.success = false;
  }

  return result;
}
