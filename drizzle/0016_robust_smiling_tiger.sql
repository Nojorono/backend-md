ALTER TABLE "call_plan_detail_schedule" RENAME TO "call_plan_schedule";--> statement-breakpoint
ALTER TABLE "call_plan_schedule" DROP CONSTRAINT "call_plan_detail_schedule_call_plan_id_call_plan_id_fk";
--> statement-breakpoint
ALTER TABLE "call_plan_schedule" DROP CONSTRAINT "call_plan_detail_schedule_outlet_id_m_outlet_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_plan_schedule" ADD CONSTRAINT "call_plan_schedule_call_plan_id_call_plan_id_fk" FOREIGN KEY ("call_plan_id") REFERENCES "public"."call_plan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_plan_schedule" ADD CONSTRAINT "call_plan_schedule_outlet_id_m_outlet_id_fk" FOREIGN KEY ("outlet_id") REFERENCES "public"."m_outlet"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
