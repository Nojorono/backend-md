CREATE TABLE IF NOT EXISTS "activity_md" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"code_outlet" varchar(20) NOT NULL,
	"code_call_plan" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
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
	"start_plan" date NOT NULL,
	"end_plan" date NOT NULL,
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
	"start_plan" date NOT NULL,
	"end_plan" date NOT NULL,
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
CREATE TABLE IF NOT EXISTS "m_outlet" (
	"id" serial PRIMARY KEY NOT NULL,
	"outlet_code" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"brand" varchar(255) NOT NULL,
	"unique_name" varchar(255) NOT NULL,
	"address_line" varchar(300) NOT NULL,
	"sub_district" varchar(255) DEFAULT '',
	"district" varchar(255) NOT NULL,
	"city_or_regency" varchar(255) DEFAULT '',
	"postal_code" integer DEFAULT 1,
	"latitude" varchar(225) DEFAULT '',
	"longitude" varchar(225) DEFAULT '',
	"outlet_type" varchar(50) DEFAULT '',
	"region" varchar(50) DEFAULT '',
	"area" varchar(50) DEFAULT '',
	"cycle" varchar(50) DEFAULT '',
	"is_active" integer DEFAULT 1 NOT NULL,
	"visit_day" varchar(50) NOT NULL,
	"odd_even" varchar(20) NOT NULL,
	"photos" json DEFAULT '[]',
	"remarks" text DEFAULT '',
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
	"area" json DEFAULT '[]',
	"region" varchar(50) DEFAULT null,
	"is_active" integer DEFAULT 1 NOT NULL,
	"valid_from" timestamp,
	"valid_to" timestamp,
	"remember_token" varchar(500),
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
	"is_web" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_md" ADD CONSTRAINT "activity_md_user_id_m_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."m_user"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "m_user" ADD CONSTRAINT "m_user_user_role_id_m_user_role_id_fk" FOREIGN KEY ("user_role_id") REFERENCES "public"."m_user_role"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
