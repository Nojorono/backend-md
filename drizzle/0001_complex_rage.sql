ALTER TABLE "activity_md" ALTER COLUMN "status" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "m_user" ALTER COLUMN "area" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "m_user" ALTER COLUMN "area" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "activity_md" ADD COLUMN "call_plan_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_md" ADD COLUMN "outlet_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "m_user_role" ADD COLUMN "menus" json DEFAULT '[]'::json;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_md" ADD CONSTRAINT "activity_md_call_plan_id_call_plan_id_fk" FOREIGN KEY ("call_plan_id") REFERENCES "public"."call_plan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_md" ADD CONSTRAINT "activity_md_outlet_id_m_outlet_id_fk" FOREIGN KEY ("outlet_id") REFERENCES "public"."m_outlet"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
