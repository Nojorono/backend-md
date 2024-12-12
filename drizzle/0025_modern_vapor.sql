ALTER TABLE "call_plan_schedule" ADD COLUMN "program_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_plan_schedule" ADD CONSTRAINT "call_plan_schedule_program_id_m_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."m_program"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
