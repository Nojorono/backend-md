ALTER TABLE "m_outlet" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "m_outlet" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "m_outlet" ALTER COLUMN "deleted_at" SET DEFAULT null;