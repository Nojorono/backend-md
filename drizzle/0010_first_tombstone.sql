ALTER TABLE "survey" ADD COLUMN "batch_code" varchar(50);--> statement-breakpoint
ALTER TABLE "survey" ADD COLUMN "is_approved" integer DEFAULT null;