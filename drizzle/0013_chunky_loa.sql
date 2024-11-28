ALTER TABLE "activity" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "status" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "call_plan_schedule" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "call_plan_schedule" ADD COLUMN "status" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "survey" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "survey" ADD COLUMN "status" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "photos" jsonb DEFAULT '[]'::jsonb;