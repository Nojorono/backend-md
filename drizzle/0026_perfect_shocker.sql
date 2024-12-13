ALTER TABLE "activity" ADD COLUMN "program_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity" ADD CONSTRAINT "activity_program_id_m_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."m_program"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
