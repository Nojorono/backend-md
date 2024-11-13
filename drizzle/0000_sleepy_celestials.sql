CREATE TABLE IF NOT EXISTS "activity_md" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"call_plan_id" integer NOT NULL,
	"call_plan_schedule_id" integer NOT NULL,
	"outlet_id" integer NOT NULL,
	"code_outlet" varchar(20) NOT NULL,
	"code_call_plan" varchar(20) NOT NULL,
	"status" varchar NOT NULL,
	"area" varchar(20) NOT NULL,
	"region" varchar(20) NOT NULL,
	"brand" varchar(20) NOT NULL,
	"type_sio" varchar(25) NOT NULL,
	"brand_type_sio" varchar(50) NOT NULL,
	"amo_brand_type_sio" varchar(50) NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"created_by" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(50),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(50),
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activity_md_detail" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_id" integer,
	"name" varchar(30) NOT NULL,
	"description" varchar(255),
	"notes" varchar(255),
	"photo" varchar(255),
	"created_by" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(50),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(50),
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "call_plan" (
	"id" serial PRIMARY KEY NOT NULL,
	"code_batch" varchar,
	"area" varchar(20) NOT NULL,
	"region" varchar(20) NOT NULL,
	"created_by" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(50),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(50),
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "call_plan_schedule" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"code_call_plan" varchar(20) NOT NULL,
	"call_plan_id" integer NOT NULL,
	"outlet_id" integer NOT NULL,
	"day_plan" date NOT NULL,
	"notes" varchar(255),
	"status" varchar(20) DEFAULT 'ready',
	"created_by" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(50),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(50),
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "m_batch" (
	"id" serial PRIMARY KEY NOT NULL,
	"code_batch" varchar(20) NOT NULL,
	"start_plan" date NOT NULL,
	"end_plan" date NOT NULL,
	"created_by" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(50),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(50),
	"deleted_at" timestamp DEFAULT null,
	CONSTRAINT "m_batch_code_batch_unique" UNIQUE("code_batch")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "m_batch_target" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" integer,
	"regional" varchar(100),
	"amo" varchar(100),
	"brand_type_sio" varchar(100),
	"amo_brand_type" varchar(100),
	"allocation_ho" integer DEFAULT 0,
	"created_by" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(50),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(50),
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "m_outlet" (
	"id" serial PRIMARY KEY NOT NULL,
	"outlet_code" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"brand" varchar(255) NOT NULL,
	"unique_name" varchar(255),
	"address_line" varchar(300),
	"sub_district" varchar(255),
	"district" varchar(255),
	"city_or_regency" varchar(255),
	"postal_code" integer DEFAULT 0,
	"latitude" varchar(225),
	"longitude" varchar(225),
	"outlet_type" varchar(50),
	"region" varchar(50),
	"area" varchar(50),
	"cycle" varchar(50),
	"is_active" integer DEFAULT 1 NOT NULL,
	"visit_day" varchar(50),
	"odd_even" varchar(20),
	"photos" jsonb DEFAULT '[]'::jsonb,
	"remarks" text DEFAULT '',
	"range_health_facilities" integer DEFAULT 0,
	"range_work_place" integer DEFAULT 0,
	"range_public_transportation_facilities" integer DEFAULT 0,
	"range_worship_facilities" integer DEFAULT 0,
	"range_playground_facilities" integer DEFAULT 0,
	"range_educational_facilities" integer DEFAULT 0,
	"created_by" varchar(20),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(20),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(20),
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "m_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"user_role_id" integer NOT NULL,
	"fullname" varchar(50),
	"password" varchar(100),
	"email" varchar(60),
	"phone" varchar(20),
	"type_md" varchar(20),
	"photo" varchar(255),
	"area" jsonb DEFAULT '[]'::jsonb,
	"region" varchar(50) DEFAULT null,
	"is_active" integer DEFAULT 1 NOT NULL,
	"valid_from" timestamp,
	"valid_to" timestamp,
	"remember_token" varchar(500),
	"refresh_token" varchar(500),
	"last_login" timestamp,
	"created_by" varchar(20),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(20),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(20),
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "m_user_role" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(20) NOT NULL,
	"description" varchar(255) NOT NULL,
	"created_by" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(50),
	"updated_at" timestamp DEFAULT now(),
	"is_active" integer DEFAULT 1 NOT NULL,
	"is_mobile" integer DEFAULT 0 NOT NULL,
	"is_web" integer DEFAULT 0 NOT NULL,
	"menus" json DEFAULT '[]'::json
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_md" ADD CONSTRAINT "activity_md_user_id_m_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."m_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_md" ADD CONSTRAINT "activity_md_call_plan_id_call_plan_id_fk" FOREIGN KEY ("call_plan_id") REFERENCES "public"."call_plan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_md" ADD CONSTRAINT "activity_md_call_plan_schedule_id_call_plan_schedule_id_fk" FOREIGN KEY ("call_plan_schedule_id") REFERENCES "public"."call_plan_schedule"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_md" ADD CONSTRAINT "activity_md_outlet_id_m_outlet_id_fk" FOREIGN KEY ("outlet_id") REFERENCES "public"."m_outlet"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_md_detail" ADD CONSTRAINT "activity_md_detail_activity_id_activity_md_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity_md"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_plan" ADD CONSTRAINT "call_plan_code_batch_m_batch_code_batch_fk" FOREIGN KEY ("code_batch") REFERENCES "public"."m_batch"("code_batch") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_plan_schedule" ADD CONSTRAINT "call_plan_schedule_user_id_m_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."m_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "m_batch_target" ADD CONSTRAINT "m_batch_target_batch_id_m_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."m_batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "m_user" ADD CONSTRAINT "m_user_user_role_id_m_user_role_id_fk" FOREIGN KEY ("user_role_id") REFERENCES "public"."m_user_role"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
