ALTER TABLE "m_user_role" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "m_user" ADD COLUMN "name" varchar(20) NOT NULL;