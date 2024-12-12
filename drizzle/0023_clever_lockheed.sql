ALTER TABLE "m_batch" DROP CONSTRAINT IF EXISTS "m_batch_code_batch_unique" CASCADE;--> statement-breakpoint
ALTER TABLE "m_batch" ALTER COLUMN "code_batch" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "m_batch_target" ADD COLUMN "total_master" integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "unique_code_batch_active" ON "m_batch" USING btree ("code_batch") WHERE deleted_at IS NULL;