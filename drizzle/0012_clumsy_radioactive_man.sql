CREATE TABLE IF NOT EXISTS "activity_sog" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_id" integer,
	"name" varchar(50) NOT NULL,
	"description" varchar(255),
	"notes" varchar(255),
	"created_by" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(100),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(100),
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
ALTER TABLE "activity_md" RENAME TO "activity";--> statement-breakpoint
ALTER TABLE "activity_md_detail" RENAME TO "activity_sio";--> statement-breakpoint
ALTER TABLE "call_plan_schedule" RENAME COLUMN "new_outlet_id" TO "survey_outlet_id";--> statement-breakpoint
ALTER TABLE "activity" DROP CONSTRAINT "activity_md_user_id_m_user_id_fk";
--> statement-breakpoint
ALTER TABLE "activity" DROP CONSTRAINT "activity_md_call_plan_id_call_plan_id_fk";
--> statement-breakpoint
ALTER TABLE "activity" DROP CONSTRAINT "activity_md_call_plan_schedule_id_call_plan_schedule_id_fk";
--> statement-breakpoint
ALTER TABLE "activity" DROP CONSTRAINT "activity_md_outlet_id_m_outlet_id_fk";
--> statement-breakpoint
ALTER TABLE "activity_sio" DROP CONSTRAINT "activity_md_detail_activity_id_activity_md_id_fk";
--> statement-breakpoint
ALTER TABLE "call_plan_schedule" DROP CONSTRAINT "call_plan_schedule_new_outlet_id_survey_id_fk";
--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "outlet_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "area" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "region" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "brand" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "type_sio" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "call_plan_schedule" ALTER COLUMN "code_call_plan" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "survey_outlet_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_sog" ADD CONSTRAINT "activity_sog_activity_id_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity" ADD CONSTRAINT "activity_user_id_m_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."m_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity" ADD CONSTRAINT "activity_call_plan_id_call_plan_id_fk" FOREIGN KEY ("call_plan_id") REFERENCES "public"."call_plan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity" ADD CONSTRAINT "activity_call_plan_schedule_id_call_plan_schedule_id_fk" FOREIGN KEY ("call_plan_schedule_id") REFERENCES "public"."call_plan_schedule"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity" ADD CONSTRAINT "activity_outlet_id_m_outlet_id_fk" FOREIGN KEY ("outlet_id") REFERENCES "public"."m_outlet"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity" ADD CONSTRAINT "activity_survey_outlet_id_survey_id_fk" FOREIGN KEY ("survey_outlet_id") REFERENCES "public"."survey"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_sio" ADD CONSTRAINT "activity_sio_activity_id_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_plan_schedule" ADD CONSTRAINT "call_plan_schedule_survey_outlet_id_survey_id_fk" FOREIGN KEY ("survey_outlet_id") REFERENCES "public"."survey"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "activity" DROP COLUMN IF EXISTS "code_outlet";--> statement-breakpoint
ALTER TABLE "activity" DROP COLUMN IF EXISTS "code_call_plan";--> statement-breakpoint
ALTER TABLE "activity" DROP COLUMN IF EXISTS "brand_type_sio";--> statement-breakpoint
ALTER TABLE "activity" DROP COLUMN IF EXISTS "amo_brand_type";--> statement-breakpoint
ALTER TABLE "activity_sio" DROP COLUMN IF EXISTS "type";--> statement-breakpoint
ALTER TABLE "activity_sio" DROP COLUMN IF EXISTS "value";