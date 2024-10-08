ALTER TABLE "m_user" ADD COLUMN "deleted_by" varchar(20);--> statement-breakpoint
ALTER TABLE "m_user" ADD COLUMN "deleted_at" timestamp DEFAULT now();