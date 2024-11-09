ALTER TABLE "activity_md" ADD COLUMN "call_plan_schedule_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "call_plan_schedule" ADD COLUMN "day_plan" date NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_md" ADD CONSTRAINT "activity_md_call_plan_schedule_id_call_plan_schedule_id_fk" FOREIGN KEY ("call_plan_schedule_id") REFERENCES "public"."call_plan_schedule"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "call_plan" DROP COLUMN IF EXISTS "start_plan";--> statement-breakpoint
ALTER TABLE "call_plan" DROP COLUMN IF EXISTS "end_plan";--> statement-breakpoint
ALTER TABLE "call_plan_schedule" DROP COLUMN IF EXISTS "start_plan";--> statement-breakpoint
ALTER TABLE "call_plan_schedule" DROP COLUMN IF EXISTS "end_plan";