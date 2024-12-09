ALTER TABLE "survey" ADD COLUMN "new_outlet_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "survey" ADD CONSTRAINT "survey_new_outlet_id_m_outlet_id_fk" FOREIGN KEY ("new_outlet_id") REFERENCES "public"."m_outlet"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
