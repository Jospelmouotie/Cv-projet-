CREATE TABLE "cover_letters" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"titre" text NOT NULL,
	"template_id" text NOT NULL,
	"langue" text DEFAULT 'fr' NOT NULL,
	"letter_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cvs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"titre" text NOT NULL,
	"template_id" text NOT NULL,
	"langue" text DEFAULT 'fr' NOT NULL,
	"cv_data" jsonb NOT NULL,
	"statut_paiement" text DEFAULT 'PAYE' NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"uid" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"photo_url" text,
	"subscription_tier" text DEFAULT 'freemium' NOT NULL,
	"subscription_expires_at" timestamp,
	"langue" text DEFAULT 'fr' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cover_letters" ADD CONSTRAINT "cover_letters_user_id_users_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_user_id_users_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;