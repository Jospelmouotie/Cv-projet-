import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db, isPostgresAvailable, refreshPostgresAvailability } from './index.js';
import { users, documents, cvs, coverLetters, payments, appSettings, passwordResets, subscriptions, adminTemplates } from './schema.js';
import { eq, and } from 'drizzle-orm';
import { getSqliteDb } from './sqliteEngine.js';

const isSqlAvailable = (): boolean => isPostgresAvailable();

export const ensurePostgresReadiness = async () => refreshPostgresAvailability();

export const dbAdapter = {
  ensurePostgresReadiness,
  // -------------------------------------------------------------------
  // USERS
  // -------------------------------------------------------------------
  async findUserByEmail(email: string) {
    const normalized = email.toLowerCase().trim();
    if (isSqlAvailable()) {
      try {
        const results = await db.select().from(users).where(eq(users.email, normalized));
        return results[0] || null;
      } catch (err) {
        console.warn('PostgreSQL query failed, using SQLite:', err);
      }
    }
    const sqlite = getSqliteDb();
    const row = sqlite.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(normalized) as any;
    if (!row) return null;
    return {
      ...row,
      subscriptionExpiresAt: row.subscriptionExpiresAt ? new Date(row.subscriptionExpiresAt) : null,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    };
  },

  async findUserById(id: string) {
    if (isSqlAvailable()) {
      try {
        const results = await db.select().from(users).where(eq(users.id, id));
        return results[0] || null;
      } catch (err) {
        console.warn('PostgreSQL query failed, using SQLite:', err);
      }
    }
    const sqlite = getSqliteDb();
    const row = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      ...row,
      subscriptionExpiresAt: row.subscriptionExpiresAt ? new Date(row.subscriptionExpiresAt) : null,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    };
  },

  async ensureUserInPostgres(userId: string) {
    if (!isSqlAvailable() || !userId) return;
    try {
      const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
      if (existing && existing.length > 0) return;

      const sqlite = getSqliteDb();
      const u = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

      if (u) {
        const normEmail = (u.email || `user_${userId}@moncvpro.internal`).toLowerCase().trim();
        const existingEmail = await db.select().from(users).where(eq(users.email, normEmail));
        const safeEmail = (existingEmail && existingEmail.length > 0 && existingEmail[0].id !== userId)
          ? `user_${userId}_${Date.now()}@moncvpro.internal`
          : normEmail;

        await db.insert(users).values({
          id: userId,
          nom: u.nom || 'Utilisateur',
          email: safeEmail,
          motDePasseHash: u.motDePasseHash || '$2b$10$fallbackhash12345678901234567890',
          role: u.role || 'USER',
          subscriptionTier: u.subscriptionTier || 'freemium',
          subscriptionExpiresAt: u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt) : null,
          langue: u.langue || 'fr',
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
        } as any).onConflictDoNothing();
      } else {
        await db.insert(users).values({
          id: userId,
          nom: 'Utilisateur',
          email: `user_${userId}@moncvpro.internal`.toLowerCase(),
          motDePasseHash: '$2b$10$fallbackhash12345678901234567890',
          role: 'USER',
          subscriptionTier: 'freemium',
          subscriptionExpiresAt: null,
          langue: 'fr',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any).onConflictDoNothing();
      }
    } catch (e) {
      console.warn('ensureUserInPostgres warning:', e);
    }
  },

  async ensureUserInSqlite(userId: string, fallbackInfo?: { nom?: string; email?: string; role?: string; subscriptionTier?: string }) {
    if (!userId) return;
    try {
      const sqlite = getSqliteDb();
      const existing = sqlite.prepare('SELECT id FROM users WHERE id = ?').get(userId);
      if (existing) return;

      let u: any = null;
      if (isSqlAvailable()) {
        try {
          const pgUsers = await db.select().from(users).where(eq(users.id, userId));
          if (pgUsers && pgUsers[0]) {
            u = pgUsers[0];
          }
        } catch {
          // ignore
        }
      }

      const nowIso = new Date().toISOString();
      const nom = u?.nom || fallbackInfo?.nom || 'Utilisateur';
      const email = (u?.email || fallbackInfo?.email || `user_${userId}@moncvpro.internal`).toLowerCase().trim();
      const motDePasseHash = u?.motDePasseHash || '$2b$10$fallbackhash12345678901234567890';
      const role = u?.role || fallbackInfo?.role || 'USER';
      const subscriptionTier = u?.subscriptionTier || fallbackInfo?.subscriptionTier || 'freemium';
      const subscriptionExpiresAt = u?.subscriptionExpiresAt ? (u.subscriptionExpiresAt instanceof Date ? u.subscriptionExpiresAt.toISOString() : String(u.subscriptionExpiresAt)) : null;
      const langue = u?.langue || 'fr';

      // Avoid email unique constraint collisions
      const existingByEmail = sqlite.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
      const safeEmail = (existingByEmail && existingByEmail.id !== userId)
        ? `user_${userId}_${Date.now()}@moncvpro.internal`
        : email;

      sqlite.prepare(`
        INSERT OR IGNORE INTO users (id, nom, email, motDePasseHash, role, subscriptionTier, subscriptionExpiresAt, langue, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        nom,
        safeEmail,
        motDePasseHash,
        role,
        subscriptionTier,
        subscriptionExpiresAt,
        langue,
        nowIso,
        nowIso
      );
    } catch (e) {
      console.warn('ensureUserInSqlite warning:', e);
    }
  },

  async syncAllSqliteUsersToPostgres() {
    if (!isSqlAvailable()) return;
    try {
      const sqlite = getSqliteDb();
      const allSqliteUsers = sqlite.prepare('SELECT * FROM users').all() as any[];
      for (const u of allSqliteUsers) {
        await this.ensureUserInPostgres(u.id);
      }
    } catch (e) {
      console.warn('syncAllSqliteUsersToPostgres notice:', e);
    }
  },

  async createUser(data: {
    id?: string;
    nom: string;
    email: string;
    motDePasseHash: string;
    role?: string;
    subscriptionTier?: string;
    subscriptionExpiresAt?: string | Date | null;
    langue?: string;
  }) {
    const newId = data.id || `u-${crypto.randomUUID()}`;
    const normalizedEmail = data.email.toLowerCase().trim();
    const nowIso = new Date().toISOString();
    const parsedSubDate = data.subscriptionExpiresAt ? new Date(data.subscriptionExpiresAt) : null;

    const newUser = {
      id: newId,
      nom: data.nom,
      email: normalizedEmail,
      motDePasseHash: data.motDePasseHash,
      role: data.role || 'USER',
      subscriptionTier: data.subscriptionTier || 'freemium',
      subscriptionExpiresAt: parsedSubDate ? parsedSubDate.toISOString() : null,
      langue: data.langue || 'fr',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (isSqlAvailable()) {
      try {
        const pgUserValues = {
          id: newId,
          nom: data.nom,
          email: normalizedEmail,
          motDePasseHash: data.motDePasseHash,
          role: data.role || 'USER',
          subscriptionTier: data.subscriptionTier || 'freemium',
          subscriptionExpiresAt: parsedSubDate,
          langue: data.langue || 'fr',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const existingUsers = await db.select().from(users).where(eq(users.email, normalizedEmail));
        if (existingUsers && existingUsers.length > 0) {
          const matched = existingUsers[0];
          await db.update(users).set({
            nom: data.nom,
            motDePasseHash: data.motDePasseHash,
            role: data.role || matched.role,
            subscriptionTier: data.subscriptionTier || matched.subscriptionTier,
            subscriptionExpiresAt: parsedSubDate || matched.subscriptionExpiresAt,
            langue: data.langue || matched.langue,
            updatedAt: new Date(),
          }).where(eq(users.id, matched.id));
          newUser.id = matched.id;
        } else {
          await db.insert(users).values(pgUserValues as any).onConflictDoUpdate({
            target: users.id,
            set: {
              nom: data.nom,
              email: normalizedEmail,
              motDePasseHash: data.motDePasseHash,
              role: data.role || 'USER',
              subscriptionTier: data.subscriptionTier || 'freemium',
              subscriptionExpiresAt: parsedSubDate,
              langue: data.langue || 'fr',
              updatedAt: new Date(),
            }
          });
        }
      } catch (err) {
        console.warn('PostgreSQL insert user failed, using SQLite:', err);
      }
    }

    const sqlite = getSqliteDb();
    sqlite.prepare(`
      INSERT OR REPLACE INTO users (id, nom, email, motDePasseHash, role, subscriptionTier, subscriptionExpiresAt, langue, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newUser.id,
      newUser.nom,
      newUser.email,
      newUser.motDePasseHash,
      newUser.role,
      newUser.subscriptionTier,
      newUser.subscriptionExpiresAt,
      newUser.langue,
      newUser.createdAt,
      newUser.updatedAt
    );

    return newUser;
  },

  async updateUser(id: string, updates: Partial<{
    nom: string;
    email: string;
    motDePasseHash: string;
    role: string;
    subscriptionTier: string;
    subscriptionExpiresAt: string | Date | null;
    langue: string;
  }>) {
    const nowIso = new Date().toISOString();
    const cleanUpdates: any = { ...updates, updatedAt: nowIso };

    if (isSqlAvailable()) {
      try {
        await this.ensureUserInPostgres(id);
        const pgUpdates: any = {};
        if (updates.nom !== undefined) pgUpdates.nom = updates.nom;
        if (updates.email !== undefined) pgUpdates.email = updates.email.toLowerCase().trim();
        if (updates.motDePasseHash !== undefined) pgUpdates.motDePasseHash = updates.motDePasseHash;
        if (updates.role !== undefined) pgUpdates.role = updates.role;
        if (updates.subscriptionTier !== undefined) pgUpdates.subscriptionTier = updates.subscriptionTier;
        if (updates.subscriptionExpiresAt !== undefined) {
          pgUpdates.subscriptionExpiresAt = updates.subscriptionExpiresAt ? new Date(updates.subscriptionExpiresAt) : null;
        }
        if (updates.langue !== undefined) pgUpdates.langue = updates.langue;
        pgUpdates.updatedAt = new Date();

        await db.update(users).set(pgUpdates).where(eq(users.id, id));
        return this.findUserById(id);
      } catch (err) {
        console.warn('PostgreSQL update user failed, using SQLite:', err);
      }
    }

    const sqlite = getSqliteDb();
    const existing = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!existing) return null;

    const nom = cleanUpdates.nom !== undefined ? cleanUpdates.nom : existing.nom;
    const email = cleanUpdates.email !== undefined ? cleanUpdates.email.toLowerCase().trim() : existing.email;
    const motDePasseHash = cleanUpdates.motDePasseHash !== undefined ? cleanUpdates.motDePasseHash : existing.motDePasseHash;
    const role = cleanUpdates.role !== undefined ? cleanUpdates.role : existing.role;
    const subscriptionTier = cleanUpdates.subscriptionTier !== undefined ? cleanUpdates.subscriptionTier : existing.subscriptionTier;
    const subExpires = cleanUpdates.subscriptionExpiresAt !== undefined
      ? (cleanUpdates.subscriptionExpiresAt ? new Date(cleanUpdates.subscriptionExpiresAt).toISOString() : null)
      : existing.subscriptionExpiresAt;
    const langue = cleanUpdates.langue !== undefined ? cleanUpdates.langue : existing.langue;

    sqlite.prepare(`
      UPDATE users SET nom = ?, email = ?, motDePasseHash = ?, role = ?, subscriptionTier = ?, subscriptionExpiresAt = ?, langue = ?, updatedAt = ?
      WHERE id = ?
    `).run(nom, email, motDePasseHash, role, subscriptionTier, subExpires, langue, nowIso, id);

    return this.findUserById(id);
  },

  async getAllUsers() {
    if (isSqlAvailable()) {
      try {
        return await db.select().from(users);
      } catch (err) {
        console.warn('PostgreSQL query failed, using SQLite:', err);
      }
    }
    const sqlite = getSqliteDb();
    return sqlite.prepare('SELECT * FROM users ORDER BY createdAt DESC').all();
  },

  // -------------------------------------------------------------------
  // CVS & UNIFIED DOCUMENTS
  // -------------------------------------------------------------------
  async getCvsByUserId(userId: string) {
    if (isSqlAvailable()) {
      try {
        const docRows = await db.select().from(documents).where(and(eq(documents.userId, userId), eq(documents.type, 'CV')));
        if (docRows && docRows.length > 0) {
          return docRows.map(d => {
            const contentObj = (typeof d.content === 'object' && d.content) ? d.content : {};
            return {
              ...contentObj,
              id: d.id,
              userId: d.userId,
              utilisateurId: d.userId,
              titre: d.titre,
              templateId: d.templateId,
              langue: d.langue,
              statutPaiement: d.statutPaiement,
              isArchived: d.isArchived,
              isPublic: d.isPublic,
              createdAt: d.createdAt,
              updatedAt: d.updatedAt
            };
          });
        }
        return await db.select().from(cvs).where(eq(cvs.userId, userId));
      } catch (err) {
        console.warn('PostgreSQL query failed, using SQLite:', err);
      }
    }
    const sqlite = getSqliteDb();
    // Try unified documents table first
    const docRows = sqlite.prepare("SELECT * FROM documents WHERE userId = ? AND type = 'CV' ORDER BY updatedAt DESC").all(userId) as any[];
    if (docRows && docRows.length > 0) {
      return docRows.map(r => {
        let parsedData = {};
        try { parsedData = JSON.parse(r.content); } catch (e) {}
        return {
          ...parsedData,
          id: r.id,
          userId: r.userId,
          utilisateurId: r.userId,
          titre: r.titre,
          templateId: r.templateId,
          langue: r.langue,
          statutPaiement: r.statutPaiement,
          isArchived: !!r.isArchived,
          isPublic: !!r.isPublic,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        };
      });
    }

    const rows = sqlite.prepare('SELECT * FROM cvs WHERE userId = ? ORDER BY updatedAt DESC').all(userId) as any[];
    return rows.map(r => {
      let parsedData = {};
      try { parsedData = JSON.parse(r.cvData); } catch (e) {}
      return {
        ...parsedData,
        id: r.id,
        userId: r.userId,
        utilisateurId: r.userId,
        titre: r.titre,
        templateId: r.templateId,
        langue: r.langue,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      };
    });
  },

  async reassignUserDocuments(oldUserId: string, newUserId: string) {
    if (isSqlAvailable()) {
      try {
        await this.ensureUserInPostgres(newUserId);
        await db.update(documents).set({ userId: newUserId }).where(eq(documents.userId, oldUserId));
        await db.update(cvs).set({ userId: newUserId }).where(eq(cvs.userId, oldUserId));
        await db.update(coverLetters).set({ userId: newUserId }).where(eq(coverLetters.userId, oldUserId));
      } catch (err) {
        console.warn('PostgreSQL reassignUserDocuments fallback:', err);
      }
    }
    try {
      await this.ensureUserInSqlite(newUserId);
      const sqlite = getSqliteDb();
      sqlite.prepare("UPDATE documents SET userId = ? WHERE userId = ?").run(newUserId, oldUserId);
      sqlite.prepare("UPDATE cvs SET userId = ? WHERE userId = ?").run(newUserId, oldUserId);
      sqlite.prepare("UPDATE cover_letters SET userId = ? WHERE userId = ?").run(newUserId, oldUserId);
    } catch (err) {
      console.warn('SQLite reassignUserDocuments error:', err);
    }
  },

  async getCvById(id: string) {
    if (isSqlAvailable()) {
      try {
        const docRes = await db.select().from(documents).where(and(eq(documents.id, id), eq(documents.type, 'CV')));
        if (docRes && docRes[0]) {
          const d = docRes[0];
          const contentObj = (typeof d.content === 'object' && d.content) ? d.content : {};
          return {
            ...contentObj,
            id: d.id,
            userId: d.userId,
            utilisateurId: d.userId,
            titre: d.titre,
            templateId: d.templateId,
            langue: d.langue,
            statutPaiement: d.statutPaiement,
            isArchived: d.isArchived,
            isPublic: d.isPublic,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt
          };
        }
        const results = await db.select().from(cvs).where(eq(cvs.id, id));
        return results[0] || null;
      } catch (err) {
        console.warn('PostgreSQL query failed, using SQLite:', err);
      }
    }
    const sqlite = getSqliteDb();
    const docRow = sqlite.prepare("SELECT * FROM documents WHERE id = ? AND type = 'CV'").get(id) as any;
    if (docRow) {
      let parsedData = {};
      try { parsedData = JSON.parse(docRow.content); } catch (e) {}
      return {
        ...parsedData,
        id: docRow.id,
        userId: docRow.userId,
        utilisateurId: docRow.userId,
        titre: docRow.titre,
        templateId: docRow.templateId,
        langue: docRow.langue,
        createdAt: docRow.createdAt,
        updatedAt: docRow.updatedAt
      };
    }

    const r = sqlite.prepare('SELECT * FROM cvs WHERE id = ?').get(id) as any;
    if (!r) return null;
    let parsedData = {};
    try { parsedData = JSON.parse(r.cvData); } catch (e) {}
    return {
      ...parsedData,
      id: r.id,
      userId: r.userId,
      utilisateurId: r.userId,
      titre: r.titre,
      templateId: r.templateId,
      langue: r.langue,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    };
  },

  async createCv(data: {
    id?: string;
    userId: string;
    titre: string;
    templateId: string;
    langue?: string;
    cvData: any;
    statutPaiement?: string;
    isArchived?: boolean;
  }) {
    let newId = data.id || `cv-${crypto.randomUUID()}`;
    if (data.id) {
      const existingDoc = await this.getCvById(data.id);
      if (existingDoc && (existingDoc.userId || (existingDoc as any).utilisateurId) && (existingDoc.userId || (existingDoc as any).utilisateurId) !== data.userId) {
        // IDOR Prevention: Generate a fresh UUID so another user's document can never be overwritten
        newId = `cv-${crypto.randomUUID()}`;
      }
    }
    const nowIso = new Date().toISOString();
    const fullCvData = {
      ...data.cvData,
      id: newId,
      utilisateurId: data.userId,
      userId: data.userId,
      titre: data.titre,
      templateId: data.templateId,
      langue: data.langue || 'fr',
      updatedAt: nowIso
    };

    if (isSqlAvailable()) {
      try {
        await this.ensureUserInPostgres(data.userId);

        // Unified documents table insert
        await db.insert(documents).values({
          id: newId,
          userId: data.userId,
          type: 'CV',
          cvId: null,
          titre: data.titre,
          templateId: data.templateId,
          langue: data.langue || 'fr',
          content: fullCvData as any,
          statutPaiement: data.statutPaiement || 'PAYE',
          isArchived: data.isArchived || false,
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any).onConflictDoUpdate({
          target: documents.id,
          set: {
            titre: data.titre,
            templateId: data.templateId,
            langue: data.langue || 'fr',
            content: fullCvData as any,
            updatedAt: new Date()
          }
        });

        // Dual write to legacy cvs table for compatibility
        await db.insert(cvs).values({
          id: newId,
          userId: data.userId,
          titre: data.titre,
          templateId: data.templateId,
          langue: data.langue || 'fr',
          cvData: fullCvData as any,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any).onConflictDoUpdate({
          target: cvs.id,
          set: {
            titre: data.titre,
            templateId: data.templateId,
            langue: data.langue || 'fr',
            cvData: fullCvData as any,
            updatedAt: new Date()
          }
        });

        return fullCvData;
      } catch (err) {
        console.warn('PostgreSQL insert CV failed, using SQLite:', err);
      }
    }

    await this.ensureUserInSqlite(data.userId);
    try {
      const sqlite = getSqliteDb();
      sqlite.prepare(`
        INSERT OR REPLACE INTO documents (id, userId, type, cvId, titre, templateId, langue, content, statutPaiement, isArchived, isPublic, createdAt, updatedAt)
        VALUES (?, ?, 'CV', NULL, ?, ?, ?, ?, 'PAYE', 0, 0, ?, ?)
      `).run(
        newId,
        data.userId,
        data.titre,
        data.templateId || 'classique',
        data.langue || 'fr',
        JSON.stringify(fullCvData),
        nowIso,
        nowIso
      );

      sqlite.prepare(`
        INSERT OR REPLACE INTO cvs (id, userId, titre, templateId, langue, cvData, isPublic, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId,
        data.userId,
        data.titre,
        data.templateId || 'classique',
        data.langue || 'fr',
        JSON.stringify(fullCvData),
        0,
        nowIso,
        nowIso
      );
    } catch (sqliteErr) {
      console.warn('SQLite saveCv warning:', sqliteErr);
    }

    return fullCvData;
  },

  async updateCvWhitelisted(id: string, userId: string, allowedUpdates: {
    titre?: string;
    templateId?: string;
    langue?: string;
    cvData?: any;
    isArchived?: boolean;
    couleurAccent?: string;
    police?: string;
  }) {
    const nowIso = new Date().toISOString();
    const existing = await this.getCvById(id);
    if (!existing) return null;

    const mergedCvData = {
      ...existing,
      ...(allowedUpdates.cvData || allowedUpdates),
      id,
      userId,
      utilisateurId: userId,
      updatedAt: nowIso
    };

    const newTitre = allowedUpdates.titre || mergedCvData.titre || existing.titre || 'Mon CV';
    const newTemplateId = allowedUpdates.templateId || mergedCvData.templateId || existing.templateId || 'classique';
    const newLangue = allowedUpdates.langue || mergedCvData.langue || existing.langue || 'fr';

    if (isSqlAvailable()) {
      try {
        await this.ensureUserInPostgres(userId);
        await db.update(documents).set({
          titre: newTitre,
          templateId: newTemplateId,
          langue: newLangue,
          content: mergedCvData as any,
          updatedAt: new Date()
        }).where(and(eq(documents.id, id), eq(documents.userId, userId)));

        await db.update(cvs).set({
          titre: newTitre,
          templateId: newTemplateId,
          langue: newLangue,
          cvData: mergedCvData as any,
          updatedAt: new Date()
        }).where(and(eq(cvs.id, id), eq(cvs.userId, userId)));

        return mergedCvData;
      } catch (err) {
        console.warn('PostgreSQL update CV failed, using SQLite:', err);
      }
    }

    const sqlite = getSqliteDb();
    sqlite.prepare(`
      UPDATE documents SET titre = ?, templateId = ?, langue = ?, content = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `).run(newTitre, newTemplateId, newLangue, JSON.stringify(mergedCvData), nowIso, id, userId);

    sqlite.prepare(`
      UPDATE cvs SET titre = ?, templateId = ?, langue = ?, cvData = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `).run(newTitre, newTemplateId, newLangue, JSON.stringify(mergedCvData), nowIso, id, userId);

    return mergedCvData;
  },

  async deleteCv(id: string, userId: string) {
    if (isSqlAvailable()) {
      try {
        await db.delete(documents).where(and(eq(documents.id, id), eq(documents.userId, userId)));
        await db.delete(cvs).where(and(eq(cvs.id, id), eq(cvs.userId, userId)));
        return true;
      } catch (err) {
        console.warn('PostgreSQL delete CV failed, using SQLite:', err);
      }
    }
    const sqlite = getSqliteDb();
    sqlite.prepare('DELETE FROM documents WHERE id = ? AND userId = ?').run(id, userId);
    const res = sqlite.prepare('DELETE FROM cvs WHERE id = ? AND userId = ?').run(id, userId);
    return res.changes > 0;
  },

  // -------------------------------------------------------------------
  // LETTERS & UNIFIED DOCUMENTS
  // -------------------------------------------------------------------
  async getLettersByUserId(userId: string) {
    if (isSqlAvailable()) {
      try {
        const docRows = await db.select().from(documents).where(and(eq(documents.userId, userId), eq(documents.type, 'COVER_LETTER')));
        if (docRows && docRows.length > 0) {
          return docRows.map(d => {
            const contentObj = (typeof d.content === 'object' && d.content) ? d.content : {};
            return {
              ...contentObj,
              id: d.id,
              userId: d.userId,
              utilisateurId: d.userId,
              cvId: d.cvId,
              titre: d.titre,
              templateId: d.templateId,
              langue: d.langue,
              entreprise: d.entreprise,
              poste: d.poste,
              destinataire: d.destinataire,
              objet: d.objet,
              statutPaiement: d.statutPaiement,
              isArchived: d.isArchived,
              createdAt: d.createdAt,
              updatedAt: d.updatedAt
            };
          });
        }
        return await db.select().from(coverLetters).where(eq(coverLetters.userId, userId));
      } catch (err) {
        console.warn('PostgreSQL query letters failed, using SQLite:', err);
      }
    }
    const sqlite = getSqliteDb();
    const docRows = sqlite.prepare("SELECT * FROM documents WHERE userId = ? AND type = 'COVER_LETTER' ORDER BY updatedAt DESC").all(userId) as any[];
    if (docRows && docRows.length > 0) {
      return docRows.map(r => {
        let parsed = {};
        try { parsed = JSON.parse(r.content); } catch (e) {}
        return {
          ...parsed,
          id: r.id,
          userId: r.userId,
          utilisateurId: r.userId,
          cvId: r.cvId,
          titre: r.titre,
          templateId: r.templateId,
          langue: r.langue,
          entreprise: r.entreprise,
          poste: r.poste,
          destinataire: r.destinataire,
          objet: r.objet,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        };
      });
    }

    const rows = sqlite.prepare('SELECT * FROM cover_letters WHERE userId = ? ORDER BY updatedAt DESC').all(userId) as any[];
    return rows.map(r => {
      let parsed = {};
      try { parsed = JSON.parse(r.letterData); } catch (e) {}
      return {
        ...parsed,
        id: r.id,
        userId: r.userId,
        utilisateurId: r.userId,
        titre: r.titre,
        templateId: r.templateId,
        langue: r.langue,
        entreprise: r.entreprise,
        poste: r.poste,
        destinataire: r.destinataire,
        objet: r.objet,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      };
    });
  },

  async getLetterById(id: string) {
    if (isSqlAvailable()) {
      try {
        const docRes = await db.select().from(documents).where(and(eq(documents.id, id), eq(documents.type, 'COVER_LETTER')));
        if (docRes && docRes[0]) {
          const d = docRes[0];
          const contentObj = (typeof d.content === 'object' && d.content) ? d.content : {};
          return {
            ...contentObj,
            id: d.id,
            userId: d.userId,
            utilisateurId: d.userId,
            cvId: d.cvId,
            titre: d.titre,
            templateId: d.templateId,
            langue: d.langue,
            entreprise: d.entreprise,
            poste: d.poste,
            destinataire: d.destinataire,
            objet: d.objet,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt
          };
        }
        const results = await db.select().from(coverLetters).where(eq(coverLetters.id, id));
        return results[0] || null;
      } catch (err) {
        console.warn('PostgreSQL query letter failed, using SQLite:', err);
      }
    }
    const sqlite = getSqliteDb();
    const docRow = sqlite.prepare("SELECT * FROM documents WHERE id = ? AND type = 'COVER_LETTER'").get(id) as any;
    if (docRow) {
      let parsed = {};
      try { parsed = JSON.parse(docRow.content); } catch (e) {}
      return {
        ...parsed,
        id: docRow.id,
        userId: docRow.userId,
        utilisateurId: docRow.userId,
        cvId: docRow.cvId,
        titre: docRow.titre,
        templateId: docRow.templateId,
        langue: docRow.langue,
        entreprise: docRow.entreprise,
        poste: docRow.poste,
        destinataire: docRow.destinataire,
        objet: docRow.objet,
        createdAt: docRow.createdAt,
        updatedAt: docRow.updatedAt
      };
    }

    const r = sqlite.prepare('SELECT * FROM cover_letters WHERE id = ?').get(id) as any;
    if (!r) return null;
    let parsed = {};
    try { parsed = JSON.parse(r.letterData); } catch (e) {}
    return {
      ...parsed,
      id: r.id,
      userId: r.userId,
      utilisateurId: r.userId,
      titre: r.titre,
      templateId: r.templateId,
      langue: r.langue,
      entreprise: r.entreprise,
      poste: r.poste,
      destinataire: r.destinataire,
      objet: r.objet,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    };
  },

  async createLetter(data: {
    id?: string;
    userId: string;
    titre: string;
    templateId: string;
    langue?: string;
    letterData: any;
  }) {
    const newId = data.id || `lettre-${crypto.randomUUID()}`;
    const nowIso = new Date().toISOString();
    const fullData = {
      ...data.letterData,
      id: newId,
      userId: data.userId,
      utilisateurId: data.userId,
      titre: data.titre,
      templateId: data.templateId || 'classique',
      langue: data.langue || 'fr',
      updatedAt: nowIso
    };

    const targetCvId = data.letterData?.cvId || data.letterData?.cv_id || null;

    if (isSqlAvailable()) {
      try {
        await this.ensureUserInPostgres(data.userId);

        let validCvId: string | null = null;
        if (targetCvId) {
          const cvCheck = await db.select({ id: documents.id }).from(documents).where(eq(documents.id, targetCvId));
          if (cvCheck && cvCheck.length > 0) {
            validCvId = targetCvId;
          }
        }

        await db.insert(documents).values({
          id: newId,
          userId: data.userId,
          type: 'COVER_LETTER',
          cvId: validCvId,
          titre: data.titre,
          templateId: data.templateId || 'classique',
          langue: data.langue || 'fr',
          content: fullData as any,
          entreprise: data.letterData?.entreprise || '',
          poste: data.letterData?.poste || '',
          destinataire: data.letterData?.destinataire || '',
          objet: data.letterData?.objet || '',
          statutPaiement: 'PAYE',
          isArchived: false,
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any).onConflictDoUpdate({
          target: documents.id,
          set: {
            titre: data.titre,
            templateId: data.templateId || 'classique',
            langue: data.langue || 'fr',
            content: fullData as any,
            entreprise: data.letterData?.entreprise || '',
            poste: data.letterData?.poste || '',
            destinataire: data.letterData?.destinataire || '',
            objet: data.letterData?.objet || '',
            updatedAt: new Date()
          }
        });

        await db.insert(coverLetters).values({
          id: newId,
          userId: data.userId,
          titre: data.titre,
          templateId: data.templateId || 'classique',
          langue: data.langue || 'fr',
          letterData: fullData as any,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any).onConflictDoUpdate({
          target: coverLetters.id,
          set: {
            titre: data.titre,
            templateId: data.templateId || 'classique',
            langue: data.langue || 'fr',
            letterData: fullData as any,
            updatedAt: new Date()
          }
        });

        return fullData;
      } catch (err) {
        console.warn('PostgreSQL insert Letter failed, using SQLite:', err);
      }
    }

    await this.ensureUserInSqlite(data.userId);
    try {
      const sqlite = getSqliteDb();
      sqlite.prepare(`
        INSERT OR REPLACE INTO documents (id, userId, type, cvId, titre, templateId, langue, content, entreprise, poste, destinataire, objet, statutPaiement, isArchived, isPublic, createdAt, updatedAt)
        VALUES (?, ?, 'COVER_LETTER', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAYE', 0, 0, ?, ?)
      `).run(
        newId,
        data.userId,
        targetCvId,
        data.titre,
        data.templateId || 'classique',
        data.langue || 'fr',
        JSON.stringify(fullData),
        data.letterData?.entreprise || '',
        data.letterData?.poste || '',
        data.letterData?.destinataire || '',
        data.letterData?.objet || '',
        nowIso,
        nowIso
      );

      sqlite.prepare(`
        INSERT OR REPLACE INTO cover_letters (id, userId, cvId, titre, templateId, langue, entreprise, poste, destinataire, objet, letterData, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId,
        data.userId,
        targetCvId,
        data.titre,
        data.templateId || 'classique',
        data.langue || 'fr',
        data.letterData?.entreprise || '',
        data.letterData?.poste || '',
        data.letterData?.destinataire || '',
        data.letterData?.objet || '',
        JSON.stringify(fullData),
        nowIso,
        nowIso
      );
    } catch (sqliteErr) {
      console.warn('SQLite saveLetter warning:', sqliteErr);
    }

    return fullData;
  },

  async updateLetterWhitelisted(id: string, userId: string, allowedUpdates: {
    titre?: string;
    templateId?: string;
    langue?: string;
    letterData?: any;
    entreprise?: string;
    poste?: string;
    destinataire?: string;
    objet?: string;
  }) {
    const nowIso = new Date().toISOString();
    const existing = await this.getLetterById(id);
    if (!existing) return null;

    const mergedData = {
      ...existing,
      ...(allowedUpdates.letterData || allowedUpdates),
      id,
      userId,
      utilisateurId: userId,
      updatedAt: nowIso
    };

    const newTitre = allowedUpdates.titre || mergedData.titre || existing.titre || 'Lettre de motivation';
    const newTemplateId = allowedUpdates.templateId || mergedData.templateId || existing.templateId || 'classique';
    const newLangue = allowedUpdates.langue || mergedData.langue || existing.langue || 'fr';

    if (isSqlAvailable()) {
      try {
        await this.ensureUserInPostgres(userId);
        await db.update(documents).set({
          titre: newTitre,
          templateId: newTemplateId,
          langue: newLangue,
          entreprise: mergedData.entreprise || '',
          poste: mergedData.poste || '',
          destinataire: mergedData.destinataire || '',
          objet: mergedData.objet || '',
          content: mergedData as any,
          updatedAt: new Date()
        }).where(and(eq(documents.id, id), eq(documents.userId, userId)));

        await db.update(coverLetters).set({
          titre: newTitre,
          templateId: newTemplateId,
          langue: newLangue,
          letterData: mergedData as any,
          updatedAt: new Date()
        }).where(and(eq(coverLetters.id, id), eq(coverLetters.userId, userId)));

        return mergedData;
      } catch (err) {
        console.warn('PostgreSQL update Letter failed, using SQLite:', err);
      }
    }

    const sqlite = getSqliteDb();
    sqlite.prepare(`
      UPDATE documents SET titre = ?, templateId = ?, langue = ?, content = ?, entreprise = ?, poste = ?, destinataire = ?, objet = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `).run(
      newTitre,
      newTemplateId,
      newLangue,
      JSON.stringify(mergedData),
      mergedData.entreprise || '',
      mergedData.poste || '',
      mergedData.destinataire || '',
      mergedData.objet || '',
      nowIso,
      id,
      userId
    );

    sqlite.prepare(`
      UPDATE cover_letters SET titre = ?, templateId = ?, langue = ?, entreprise = ?, poste = ?, destinataire = ?, objet = ?, letterData = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `).run(
      newTitre,
      newTemplateId,
      newLangue,
      mergedData.entreprise || '',
      mergedData.poste || '',
      mergedData.destinataire || '',
      mergedData.objet || '',
      JSON.stringify(mergedData),
      nowIso,
      id,
      userId
    );

    return mergedData;
  },

  async deleteLetter(id: string, userId: string) {
    if (isSqlAvailable()) {
      try {
        await db.delete(documents).where(and(eq(documents.id, id), eq(documents.userId, userId)));
        await db.delete(coverLetters).where(and(eq(coverLetters.id, id), eq(coverLetters.userId, userId)));
        return true;
      } catch (err) {
        console.warn('PostgreSQL delete Letter failed, using SQLite:', err);
      }
    }
    const sqlite = getSqliteDb();
    sqlite.prepare('DELETE FROM documents WHERE id = ? AND userId = ?').run(id, userId);
    const res = sqlite.prepare('DELETE FROM cover_letters WHERE id = ? AND userId = ?').run(id, userId);
    return res.changes > 0;
  },

  // -------------------------------------------------------------------
  // UNIFIED DOCUMENT HELPERS (CVs + Letters)
  // -------------------------------------------------------------------
  async getAllDocumentsByUserId(userId: string) {
    if (isSqlAvailable()) {
      try {
        const rows = await db.select().from(documents).where(eq(documents.userId, userId));
        return rows;
      } catch (err) {
        console.warn('PostgreSQL query unified documents failed, using SQLite:', err);
      }
    }
    const sqlite = getSqliteDb();
    return sqlite.prepare('SELECT * FROM documents WHERE userId = ? ORDER BY updatedAt DESC').all(userId);
  },

  // -------------------------------------------------------------------
  // PAYMENTS
  // -------------------------------------------------------------------
  async createPayment(data: {
    id?: string;
    utilisateurId?: string;
    userId?: string;
    planTier: string;
    montant: number;
    devise?: string;
    referenceTransaction: string;
    provider?: string;
    providerTransactionId?: string;
    metadata?: any;
    statut?: string;
  }) {
    const ownerId = data.utilisateurId || data.userId || 'u-system';
    const newId = data.id || `pay-${crypto.randomUUID()}`;
    const nowIso = new Date().toISOString();

    const newPayment = {
      id: newId,
      utilisateurId: ownerId,
      userId: ownerId,
      planTier: data.planTier,
      montant: data.montant,
      devise: data.devise || 'FCFA',
      referenceTransaction: data.referenceTransaction,
      provider: data.provider || 'ikeepay',
      providerTransactionId: data.providerTransactionId || null,
      metadata: data.metadata || null,
      statut: data.statut || 'EN_ATTENTE',
      valideLe: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await this.ensureUserInPostgres(ownerId);
    await this.ensureUserInSqlite(ownerId, {
      email: data.metadata?.userEmail,
      nom: data.metadata?.userName
    });

    if (isSqlAvailable()) {
      try {
        await db.insert(payments).values({
          id: newId,
          utilisateurId: ownerId,
          planTier: data.planTier,
          montant: data.montant,
          devise: data.devise || 'FCFA',
          referenceTransaction: data.referenceTransaction,
          provider: data.provider || 'ikeepay',
          providerTransactionId: data.providerTransactionId || null,
          metadata: data.metadata || null,
          statut: data.statut || 'EN_ATTENTE',
          valideLe: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any).onConflictDoNothing();
      } catch (err) {
        console.warn('PostgreSQL insert payment failed, using SQLite:', err);
      }
    }

    try {
      const sqlite = getSqliteDb();
      sqlite.prepare(`
        INSERT INTO payments (id, userId, planTier, montant, devise, referenceTransaction, statut, methodePaiement, datePaiement, metaData)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newPayment.id,
        ownerId,
        newPayment.planTier,
        newPayment.montant,
        newPayment.devise,
        newPayment.referenceTransaction,
        newPayment.statut,
        newPayment.provider,
        nowIso,
        newPayment.metadata ? JSON.stringify(newPayment.metadata) : null
      );
    } catch (sqliteErr) {
      console.warn('SQLite payment insert warning:', sqliteErr);
    }

    return newPayment;
  },

  async getPaymentById(id: string) {
    if (isSqlAvailable()) {
      try {
        const results = await db.select().from(payments).where(eq(payments.id, id));
        if (results && results[0]) {
          const r = results[0];
          return {
            ...r,
            userId: r.utilisateurId,
            utilisateurId: r.utilisateurId,
            methodePaiement: r.provider,
            provider: r.provider,
            metaData: r.metadata ? JSON.stringify(r.metadata) : null,
            metadata: r.metadata
          };
        }
      } catch (err) {
        console.warn('PostgreSQL getPaymentById fallback to SQLite:', err);
      }
    }

    try {
      const sqlite = getSqliteDb();
      const row = sqlite.prepare('SELECT * FROM payments WHERE id = ?').get(id) as any;
      if (!row) return null;
      return {
        ...row,
        utilisateurId: row.userId,
        provider: row.methodePaiement,
        metadata: row.metaData ? JSON.parse(row.metaData) : null
      };
    } catch (err) {
      console.warn('SQLite getPaymentById error:', err);
      return null;
    }
  },

  async findPaymentByRef(reference: string, userId?: string) {
    if (isSqlAvailable()) {
      try {
        const results = await db.select().from(payments).where(eq(payments.referenceTransaction, reference));
        if (results && results[0]) {
          const r = results[0];
          if (userId && r.utilisateurId !== userId) return null;
          return {
            ...r,
            userId: r.utilisateurId,
            utilisateurId: r.utilisateurId,
            methodePaiement: r.provider,
            provider: r.provider,
            metaData: r.metadata ? JSON.stringify(r.metadata) : null,
            metadata: r.metadata
          };
        }
      } catch (err) {
        console.warn('PostgreSQL findPaymentByRef fallback to SQLite:', err);
      }
    }

    try {
      const sqlite = getSqliteDb();
      const row = sqlite.prepare('SELECT * FROM payments WHERE referenceTransaction = ? OR id = ?').get(reference, `pay-${reference}`) as any;
      if (!row) return null;
      if (userId && row.userId !== userId) return null;
      return {
        ...row,
        utilisateurId: row.userId,
        provider: row.methodePaiement,
        metadata: row.metaData ? JSON.parse(row.metaData) : null
      };
    } catch (err) {
      console.warn('SQLite findPaymentByRef error:', err);
      return null;
    }
  },

  async updatePaymentStatus(id: string, statut: 'VALIDE' | 'REJETE' | 'EN_ATTENTE', noteOrDate?: string | Date) {
    const validDate = (noteOrDate instanceof Date) ? noteOrDate : new Date();
    const noteAdmin = typeof noteOrDate === 'string' ? noteOrDate : undefined;

    if (isSqlAvailable()) {
      try {
        await db.update(payments).set({
          statut,
          valideLe: validDate,
          updatedAt: new Date()
        }).where(eq(payments.id, id));
      } catch (err) {
        console.warn('PostgreSQL update payment failed, using SQLite:', err);
      }
    }

    try {
      const sqlite = getSqliteDb();
      if (noteAdmin) {
        sqlite.prepare(`
          UPDATE payments SET statut = ?, datePaiement = ?, metaData = json_set(COALESCE(metaData, '{}'), '$.noteAdmin', ?) WHERE id = ?
        `).run(statut, validDate.toISOString(), noteAdmin, id);
      } else {
        sqlite.prepare(`
          UPDATE payments SET statut = ?, datePaiement = ? WHERE id = ?
        `).run(statut, validDate.toISOString(), id);
      }
    } catch (sqliteErr) {
      console.warn('SQLite updatePaymentStatus warning:', sqliteErr);
    }
  },

  async claimAndValidatePayment(id: string): Promise<boolean> {
    const nowIso = new Date().toISOString();
    let pgClaimed = false;
    let sqliteClaimed = false;

    if (isSqlAvailable()) {
      try {
        const updateRes = await db.update(payments).set({
          statut: 'VALIDE',
          valideLe: new Date(),
          updatedAt: new Date()
        }).where(and(eq(payments.id, id), eq(payments.statut, 'EN_ATTENTE'))).returning({ id: payments.id });
        if (updateRes && updateRes.length > 0) pgClaimed = true;
      } catch (err) {
        console.warn('PostgreSQL claim payment failed:', err);
      }
    }

    try {
      const sqlite = getSqliteDb();
      const info = sqlite.prepare(`
        UPDATE payments SET statut = 'VALIDE', datePaiement = ? WHERE id = ? AND statut = 'EN_ATTENTE'
      `).run(nowIso, id);
      if (info && info.changes > 0) sqliteClaimed = true;
    } catch (sqliteErr) {
      console.warn('SQLite claim payment warning:', sqliteErr);
    }

    return pgClaimed || sqliteClaimed;
  },

  async createSubscriptionRecord(data: {
    userId: string;
    paymentId?: string;
    planTier: string;
    startsAt: string;
    expiresAt: string;
  }) {
    const id = `sub-${crypto.randomUUID()}`;
    const nowIso = new Date().toISOString();

    await this.ensureUserInPostgres(data.userId);
    await this.ensureUserInSqlite(data.userId);

    if (isSqlAvailable()) {
      try {
        await db.insert(subscriptions).values({
          id,
          userId: data.userId,
          paymentId: data.paymentId || null,
          planTier: data.planTier,
          startsAt: new Date(data.startsAt),
          expiresAt: new Date(data.expiresAt),
          statut: 'ACTIF',
          createdAt: new Date()
        });
      } catch (err) {
        console.warn('PostgreSQL insert subscription failed:', err);
      }
    }

    try {
      const sqlite = getSqliteDb();
      sqlite.prepare(`
        INSERT INTO subscriptions (id, userId, paymentId, planTier, startsAt, expiresAt, statut, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, data.userId, data.paymentId || null, data.planTier, data.startsAt, data.expiresAt, 'ACTIF', nowIso);
    } catch (sqliteErr) {
      console.warn('SQLite insert subscription warning:', sqliteErr);
    }

    return { id, ...data, statut: 'ACTIF', createdAt: nowIso };
  },

  async getUserSubscriptions(userId: string) {
    const sqlite = getSqliteDb();
    const rows = sqlite.prepare('SELECT * FROM subscriptions WHERE userId = ? ORDER BY createdAt DESC').all(userId) as any[];
    return rows;
  },

  async getAllPayments() {
    if (isSqlAvailable()) {
      try {
        const results = await db.select().from(payments);
        if (results && results.length > 0) {
          return results.reverse().map(r => ({
            ...r,
            userId: r.utilisateurId,
            utilisateurId: r.utilisateurId,
            methodePaiement: r.provider,
            provider: r.provider,
            datePaiement: r.valideLe ? r.valideLe.toISOString() : (r.createdAt ? r.createdAt.toISOString() : new Date().toISOString()),
            metaData: r.metadata ? JSON.stringify(r.metadata) : null,
            metadata: r.metadata
          }));
        }
      } catch (err) {
        console.warn('PostgreSQL getAllPayments fallback to SQLite:', err);
      }
    }

    try {
      const sqlite = getSqliteDb();
      const rows = sqlite.prepare('SELECT * FROM payments ORDER BY datePaiement DESC').all() as any[];
      return rows.map(r => ({
        ...r,
        utilisateurId: r.userId,
        provider: r.methodePaiement,
        metadata: r.metaData ? JSON.parse(r.metaData) : null
      }));
    } catch (err) {
      console.warn('SQLite getAllPayments error:', err);
      return [];
    }
  },

  // -------------------------------------------------------------------
  // APP SETTINGS
  // -------------------------------------------------------------------
  async getAppSettings() {
    if (isSqlAvailable()) {
      try {
        const rows = await db.select().from(appSettings).where(eq(appSettings.id, 'global_config'));
        if (rows && rows.length > 0 && rows[0].adminPaidMatrix) {
          return rows[0].adminPaidMatrix as any;
        }
      } catch (err) {
        console.warn('PostgreSQL getAppSettings query failed, using SQLite:', err);
      }
    }
    const sqlite = getSqliteDb();
    const row = sqlite.prepare('SELECT value FROM app_settings WHERE key = ?').get('global_config') as any;
    if (!row) return {};
    try {
      return JSON.parse(row.value);
    } catch (e) {
      return {};
    }
  },

  async updateAppSettings(updates: any) {
    const current = await this.getAppSettings();
    const merged = { ...current, ...updates };
    const nowIso = new Date().toISOString();

    if (isSqlAvailable()) {
      try {
        await db.insert(appSettings).values({
          id: 'global_config',
          adminPaidMatrix: merged,
          updatedAt: new Date()
        }).onConflictDoUpdate({
          target: appSettings.id,
          set: {
            adminPaidMatrix: merged,
            updatedAt: new Date()
          }
        });
      } catch (err) {
        console.warn('PostgreSQL updateAppSettings failed:', err);
      }
    }

    const sqlite = getSqliteDb();
    sqlite.prepare(`
      INSERT OR REPLACE INTO app_settings (key, value, updatedAt) VALUES (?, ?, ?)
    `).run('global_config', JSON.stringify(merged), nowIso);

    return merged;
  },

  // -------------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------------
  async createNotification(data: {
    id?: string;
    titre: string;
    message: string;
    type?: string;
    cible?: string;
    lien?: string;
    badge?: string;
    envoyeParEmail?: boolean;
    nombreEmailsEnvoyes?: number;
    auteur?: string;
  }) {
    const newId = data.id || `notif-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const nowIso = new Date().toISOString();

    const newNotif = {
      id: newId,
      titre: data.titre,
      message: data.message,
      type: data.type || 'SYSTEM',
      cible: data.cible || 'TOUS',
      lien: data.lien || '',
      badge: data.badge || '',
      envoyeParEmail: Boolean(data.envoyeParEmail),
      nombreEmailsEnvoyes: data.nombreEmailsEnvoyes || 0,
      luPar: [] as string[],
      dateCreation: nowIso,
      auteur: data.auteur || 'Administrateur'
    };

    const sqlite = getSqliteDb();
    sqlite.prepare(`
      INSERT INTO notifications (id, userId, title, message, type, isRead, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(newId, data.cible || 'TOUS', data.titre, JSON.stringify(newNotif), data.type || 'info', 0, nowIso);

    return newNotif;
  },

  async getAllNotifications() {
    const sqlite = getSqliteDb();
    const rows = sqlite.prepare('SELECT message FROM notifications ORDER BY createdAt DESC').all() as any[];
    return rows.map(r => {
      try { return JSON.parse(r.message); } catch (e) { return null; }
    }).filter(Boolean);
  },

  async getNotificationsForUser(userId: string, userTier: string = 'freemium') {
    const all = await this.getAllNotifications();
    return all.filter((n: any) => {
      if (!n.cible || n.cible === 'TOUS') return true;
      if (n.cible === userTier) return true;
      return false;
    }).map((n: any) => ({
      ...n,
      isRead: Array.isArray(n.luPar) && n.luPar.includes(userId)
    }));
  },

  async markNotificationRead(notificationId: string, userId: string) {
    const sqlite = getSqliteDb();
    const row = sqlite.prepare('SELECT message FROM notifications WHERE id = ?').get(notificationId) as any;
    if (!row) return false;
    try {
      const notif = JSON.parse(row.message);
      if (!Array.isArray(notif.luPar)) notif.luPar = [];
      if (!notif.luPar.includes(userId)) {
        notif.luPar.push(userId);
        sqlite.prepare('UPDATE notifications SET message = ? WHERE id = ?').run(JSON.stringify(notif), notificationId);
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  async markAllNotificationsRead(userId: string) {
    const all = await this.getAllNotifications();
    const sqlite = getSqliteDb();
    for (const notif of all) {
      if (!Array.isArray(notif.luPar)) notif.luPar = [];
      if (!notif.luPar.includes(userId)) {
        notif.luPar.push(userId);
        sqlite.prepare('UPDATE notifications SET message = ? WHERE id = ?').run(JSON.stringify(notif), notif.id);
      }
    }
    return true;
  },

  async deleteNotification(notificationId: string) {
    const sqlite = getSqliteDb();
    const res = sqlite.prepare('DELETE FROM notifications WHERE id = ?').run(notificationId);
    return res.changes > 0;
  },

  // -------------------------------------------------------------------
  // PASSWORD RESETS
  // -------------------------------------------------------------------
  async savePasswordResetToken(email: string, token: string, expiresAt: Date) {
    const normalizedEmail = email.toLowerCase().trim();
    const nowIso = new Date().toISOString();
    const expiresAtIso = expiresAt.toISOString();

    if (isSqlAvailable()) {
      try {
        await db.insert(passwordResets).values({
          email: normalizedEmail,
          token,
          expiresAt,
          createdAt: new Date(),
        }).onConflictDoUpdate({
          target: passwordResets.email,
          set: {
            token,
            expiresAt,
            createdAt: new Date(),
          }
        });
      } catch (err) {
        console.warn('PostgreSQL save password reset token failed, fallback to SQLite:', err);
      }
    }

    const sqlite = getSqliteDb();
    sqlite.prepare(`
      INSERT OR REPLACE INTO password_resets (email, token, expiresAt, createdAt)
      VALUES (?, ?, ?, ?)
    `).run(normalizedEmail, token, expiresAtIso, nowIso);

    return { email: normalizedEmail, token, expiresAt: expiresAtIso };
  },

  async findPasswordResetToken(token: string) {
    if (isSqlAvailable()) {
      try {
        const results = await db.select().from(passwordResets).where(eq(passwordResets.token, token));
        if (results[0]) {
          return {
            email: results[0].email,
            token: results[0].token,
            expiresAt: results[0].expiresAt instanceof Date ? results[0].expiresAt.toISOString() : String(results[0].expiresAt),
          };
        }
      } catch (err) {
        console.warn('PostgreSQL find reset token failed, fallback to SQLite:', err);
      }
    }

    const sqlite = getSqliteDb();
    const row = sqlite.prepare('SELECT * FROM password_resets WHERE token = ?').get(token) as any;
    if (!row) return null;
    return {
      email: row.email,
      token: row.token,
      expiresAt: row.expiresAt,
    };
  },

  async deletePasswordResetToken(email: string) {
    const normalized = email.toLowerCase().trim();
    if (isSqlAvailable()) {
      try {
        await db.delete(passwordResets).where(eq(passwordResets.email, normalized));
      } catch (err) {
        console.warn('PostgreSQL delete reset token failed, fallback to SQLite:', err);
      }
    }
    const sqlite = getSqliteDb();
    sqlite.prepare('DELETE FROM password_resets WHERE email = ?').run(normalized);
  },

  // -------------------------------------------------------------------
  // ADMIN CUSTOM TEMPLATES
  // -------------------------------------------------------------------
  async getAdminTemplates() {
    if (isSqlAvailable()) {
      try {
        const results = await db.select().from(adminTemplates);
        return results.map(t => ({
          ...t,
          description: typeof t.description === 'string' ? JSON.parse(t.description) : t.description,
          themeConfig: typeof t.themeConfig === 'string' ? JSON.parse(t.themeConfig) : t.themeConfig,
        }));
      } catch (err) {
        console.warn('PostgreSQL get admin templates failed, fallback to SQLite:', err);
      }
    }
    const sqlite = getSqliteDb();
    const rows = sqlite.prepare('SELECT * FROM admin_templates').all() as any[];
    return rows.map(row => ({
      ...row,
      description: JSON.parse(row.description),
      themeConfig: JSON.parse(row.themeConfig),
    }));
  },

  async createAdminTemplate(template: any) {
    if (isSqlAvailable()) {
      try {
        await db.insert(adminTemplates).values(template);
      } catch (err) {
        console.warn('PostgreSQL create admin template failed, fallback to SQLite:', err);
      }
    }
    const sqlite = getSqliteDb();
    sqlite.prepare(`
      INSERT INTO admin_templates (id, name, category, description, layoutType, layoutFamily, defaultAccent, defaultSecondaryAccent, defaultFont, badgeText, previewImage, preview, requiredTier, themeConfig, createdBy, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      template.id,
      template.name,
      template.category,
      template.description,
      template.layoutType,
      template.layoutFamily,
      template.defaultAccent,
      template.defaultSecondaryAccent,
      template.defaultFont,
      template.badgeText,
      template.previewImage,
      template.preview,
      template.requiredTier,
      template.themeConfig,
      template.createdBy,
      template.createdAt,
      template.updatedAt
    );
  },

  async deleteAdminTemplate(id: string) {
    if (isSqlAvailable()) {
      try {
        await db.delete(adminTemplates).where(eq(adminTemplates.id, id));
      } catch (err) {
        console.warn('PostgreSQL delete admin template failed, fallback to SQLite:', err);
      }
    }
    const sqlite = getSqliteDb();
    sqlite.prepare('DELETE FROM admin_templates WHERE id = ?').run(id);
  },
};
