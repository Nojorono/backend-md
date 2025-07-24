ALTER TABLE "activity" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "call_plan_schedule" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "call_plan_schedule" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "call_plan_schedule" ADD COLUMN "type" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "survey" ALTER COLUMN "status" DROP DEFAULT;