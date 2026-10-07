import { pgTable, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';

// Users table authenticated via Express JWT / bcrypt
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  nom: text('nom').notNull(),
  email: text('email').notNull().unique(),
  motDePasseHash: text('mot_de_passe_hash').notNull(),
  role: text('role').default('USER').notNull(), // 'USER' | 'ADMIN'
  subscriptionTier: text('subscription_tier').default('freemium').notNull(), // 'freemium' | 'classique' | 'premium'
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  langue: text('langue').default('fr').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Unified Career Documents table (CVs & Cover Letters)
export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(), // 'CV' | 'COVER_LETTER'
  cvId: text('cv_id').references((): any => documents.id, { onDelete: 'set null' }), // Self-referential FK: cover letters linked to source CV
  titre: text('titre').notNull(),
  templateId: text('template_id').notNull(),
  langue: text('langue').default('fr').notNull(),
  content: jsonb('content').notNull(), // Unified JSON payload for CV data or Letter data
  entreprise: text('entreprise'),
  poste: text('poste'),
  destinataire: text('destinataire'),
  objet: text('objet'),
  statutPaiement: text('statut_paiement').default('PAYE').notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// CV Documents table (Legacy / View compatibility)
export const cvs = pgTable('cvs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  titre: text('titre').notNull(),
  templateId: text('template_id').notNull(),
  langue: text('langue').default('fr').notNull(),
  cvData: jsonb('cv_data').notNull(),
  statutPaiement: text('statut_paiement').default('PAYE').notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cover Letters table
export const coverLetters = pgTable('cover_letters', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  titre: text('titre').notNull(),
  templateId: text('template_id').notNull(),
  langue: text('langue').default('fr').notNull(),
  letterData: jsonb('letter_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payments table
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  utilisateurId: text('utilisateur_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  planTier: text('plan_tier').notNull(),
  montant: integer('montant').notNull(),
  devise: text('devise').default('FCFA').notNull(),
  referenceTransaction: text('reference_transaction').notNull().unique(),
  provider: text('provider').default('ikeepay').notNull(),
  providerTransactionId: text('provider_transaction_id'),
  metadata: jsonb('metadata'),
  statut: text('statut').default('EN_ATTENTE').notNull(), // 'EN_ATTENTE' | 'VALIDE' | 'REJETE'
  valideLe: timestamp('valide_le'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subscriptions history table
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  paymentId: text('payment_id').references(() => payments.id),
  planTier: text('plan_tier').notNull(),
  startsAt: timestamp('starts_at').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  statut: text('statut').default('ACTIF').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Global App Settings table
export const appSettings = pgTable('app_settings', {
  id: text('id').primaryKey(),
  adminPaidMatrix: jsonb('admin_paid_matrix'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Password Resets table
export const passwordResets = pgTable('password_resets', {
  email: text('email').primaryKey(),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Admin Custom Templates table
export const adminTemplates = pgTable('admin_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: jsonb('description').notNull(),
  layoutType: text('layout_type').notNull(),
  layoutFamily: text('layout_family').notNull(),
  defaultAccent: text('default_accent').notNull(),
  defaultSecondaryAccent: text('default_secondary_accent').notNull(),
  defaultFont: text('default_font').notNull(),
  badgeText: text('badge_text').notNull(),
  previewImage: text('preview_image').notNull(),
  preview: text('preview').notNull(),
  requiredTier: text('required_tier').notNull(),
  themeConfig: jsonb('theme_config').notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
