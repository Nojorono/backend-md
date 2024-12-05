ALTER TABLE "comments" ALTER COLUMN "notification_identifier" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "notification_identifier" SET DATA TYPE text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_identifier_idx" ON "notifications" USING btree ("notification_identifier");