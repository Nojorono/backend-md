ALTER TABLE "m_user" RENAME COLUMN "name" TO "area";--> statement-breakpoint
ALTER TABLE "m_user" ALTER COLUMN "area" SET DEFAULT null;--> statement-breakpoint
ALTER TABLE "m_user" ALTER COLUMN "area" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "m_user" ADD COLUMN "region" varchar(50) NOT NULL;