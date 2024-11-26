ALTER TABLE "m_outlet" RENAME COLUMN "outlet_type" TO "sio_type";--> statement-breakpoint
ALTER TABLE "call_plan_schedule" ALTER COLUMN "outlet_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "call_plan_schedule" ADD COLUMN "new_outlet_id" integer;--> statement-breakpoint
ALTER TABLE "call_plan_schedule" ADD COLUMN "type" varchar(20) DEFAULT 'normal';--> statement-breakpoint
ALTER TABLE "m_outlet" ADD COLUMN "survey_outlet_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_plan_schedule" ADD CONSTRAINT "call_plan_schedule_new_outlet_id_survey_id_fk" FOREIGN KEY ("new_outlet_id") REFERENCES "public"."survey"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "m_outlet" ADD CONSTRAINT "m_outlet_survey_outlet_id_survey_id_fk" FOREIGN KEY ("survey_outlet_id") REFERENCES "public"."survey"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
