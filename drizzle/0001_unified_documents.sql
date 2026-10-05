-- =========================================================================
-- Migration: 0001_unified_documents.sql
-- Description: Unifies CV and Cover Letter data structures into a single
-- consistent SQL schema ("documents") with proper relational integrity.
-- =========================================================================

-- 1. Create the unified documents table
CREATE TABLE IF NOT EXISTS "documents" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "type" text NOT NULL CHECK ("type" IN ('CV', 'COVER_LETTER')),
    "cv_id" text,
    "titre" text NOT NULL,
    "template_id" text NOT NULL,
    "langue" text DEFAULT 'fr' NOT NULL,
    "content" jsonb NOT NULL,
    "entreprise" text,
    "poste" text,
    "destinataire" text,
    "objet" text,
    "statut_paiement" text DEFAULT 'PAYE' NOT NULL,
    "is_archived" boolean DEFAULT false NOT NULL,
    "is_public" boolean DEFAULT false NOT NULL,
    "metadata" jsonb,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 2. Foreign key constraints: cascade on user deletion, set null on parent CV deletion
ALTER TABLE "documents"
    DROP CONSTRAINT IF EXISTS "documents_user_id_users_id_fk";

ALTER TABLE "documents"
    ADD CONSTRAINT "documents_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action;

ALTER TABLE "documents"
    DROP CONSTRAINT IF EXISTS "documents_cv_id_documents_id_fk";

ALTER TABLE "documents"
    ADD CONSTRAINT "documents_cv_id_documents_id_fk"
    FOREIGN KEY ("cv_id") REFERENCES "public"."documents"("id")
    ON DELETE set null ON UPDATE no action;

-- 3. Performance & relational indexes
CREATE INDEX IF NOT EXISTS "idx_documents_user_id" ON "documents" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_documents_user_type" ON "documents" ("user_id", "type");
CREATE INDEX IF NOT EXISTS "idx_documents_cv_id" ON "documents" ("cv_id");
CREATE INDEX IF NOT EXISTS "idx_documents_updated_at" ON "documents" ("updated_at");

-- 4. Data Migration: CVs -> documents (ensuring no data loss)
INSERT INTO "documents" (
    "id", "user_id", "type", "cv_id", "titre", "template_id", "langue", "content",
    "statut_paiement", "is_archived", "is_public", "created_at", "updated_at"
)
SELECT
    c."id",
    c."user_id",
    'CV' AS "type",
    NULL AS "cv_id",
    COALESCE(c."titre", 'Mon CV') AS "titre",
    COALESCE(c."template_id", 'classique') AS "template_id",
    COALESCE(c."langue", 'fr') AS "langue",
    c."cv_data" AS "content",
    COALESCE(c."statut_paiement", 'PAYE') AS "statut_paiement",
    COALESCE(c."is_archived", false) AS "is_archived",
    false AS "is_public",
    COALESCE(c."created_at", now()) AS "created_at",
    COALESCE(c."updated_at", now()) AS "updated_at"
FROM "cvs" c
ON CONFLICT ("id") DO UPDATE SET
    "content" = EXCLUDED."content",
    "titre" = EXCLUDED."titre",
    "template_id" = EXCLUDED."template_id",
    "langue" = EXCLUDED."langue",
    "statut_paiement" = EXCLUDED."statut_paiement",
    "is_archived" = EXCLUDED."is_archived",
    "updated_at" = EXCLUDED."updated_at";

-- 5. Data Migration: Cover Letters -> documents (ensuring no data loss)
INSERT INTO "documents" (
    "id", "user_id", "type", "cv_id", "titre", "template_id", "langue", "content",
    "entreprise", "poste", "destinataire", "objet", "statut_paiement", "is_archived", "is_public", "created_at", "updated_at"
)
SELECT
    cl."id",
    cl."user_id",
    'COVER_LETTER' AS "type",
    NULL AS "cv_id",
    COALESCE(cl."titre", 'Lettre de motivation') AS "titre",
    COALESCE(cl."template_id", 'classique') AS "template_id",
    COALESCE(cl."langue", 'fr') AS "langue",
    cl."letter_data" AS "content",
    cl."letter_data"->>'entreprise' AS "entreprise",
    cl."letter_data"->>'poste' AS "poste",
    cl."letter_data"->>'destinataire' AS "destinataire",
    cl."letter_data"->>'objet' AS "objet",
    'PAYE' AS "statut_paiement",
    false AS "is_archived",
    false AS "is_public",
    COALESCE(cl."created_at", now()) AS "created_at",
    COALESCE(cl."updated_at", now()) AS "updated_at"
FROM "cover_letters" cl
ON CONFLICT ("id") DO UPDATE SET
    "content" = EXCLUDED."content",
    "titre" = EXCLUDED."titre",
    "template_id" = EXCLUDED."template_id",
    "langue" = EXCLUDED."langue",
    "entreprise" = EXCLUDED."entreprise",
    "poste" = EXCLUDED."poste",
    "destinataire" = EXCLUDED."destinataire",
    "objet" = EXCLUDED."objet",
    "updated_at" = EXCLUDED."updated_at";

-- 6. Backward compatibility views
CREATE OR REPLACE VIEW "v_cvs" AS
SELECT 
    "id", "user_id", "titre", "template_id", "langue", 
    "content" AS "cv_data", "statut_paiement", "is_archived", "is_public", 
    "created_at", "updated_at"
FROM "documents"
WHERE "type" = 'CV';

CREATE OR REPLACE VIEW "v_cover_letters" AS
SELECT 
    "id", "user_id", "cv_id", "titre", "template_id", "langue",
    "entreprise", "poste", "destinataire", "objet", 
    "content" AS "letter_data", "statut_paiement", "is_archived", "is_public",
    "created_at", "updated_at"
FROM "documents"
WHERE "type" = 'COVER_LETTER';
