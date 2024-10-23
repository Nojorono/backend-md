ALTER TABLE "m_user" RENAME COLUMN "tipe_md" TO "type_md";--> statement-breakpoint
ALTER TABLE "m_user" ALTER COLUMN "username" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "m_user" ALTER COLUMN "user_role_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "m_user_role" DROP COLUMN "is_active";
ALTER TABLE "m_user_role" ADD COLUMN "is_active" integer NOT NULL DEFAULT 1;
ALTER TABLE "m_user" DROP COLUMN IF EXISTS "is_android";--> statement-breakpoint
ALTER TABLE "m_user" DROP COLUMN IF EXISTS "is_web";
