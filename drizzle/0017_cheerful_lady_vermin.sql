ALTER TABLE "m_user" DROP COLUMN IF EXISTS "area";--> statement-breakpoint
ALTER TABLE "m_user" ADD COLUMN "area" json DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "m_user" ALTER COLUMN "region" SET DEFAULT null;--> statement-breakpoint
ALTER TABLE "m_user" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "m_user" ADD COLUMN "photo" varchar(255);
