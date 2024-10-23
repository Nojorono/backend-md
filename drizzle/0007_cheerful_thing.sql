ALTER TABLE "m_user_role" DROP COLUMN "is_active";
ALTER TABLE "m_user_role" ADD COLUMN "is_active" integer NOT NULL DEFAULT 1;
