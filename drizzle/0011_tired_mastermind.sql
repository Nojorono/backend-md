CREATE TYPE activity_status AS ENUM (
  'default',
  'survey',
  'submitted',
  'pending',
  'clear',
  'reject'
);

CREATE TABLE IF NOT EXISTS "activity_md" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"code_outlet" varchar(20) NOT NULL,
	"code_call_plan" varchar(20) NOT NULL,
	"status" "activity_status" NOT NULL,
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
	"user_id" integer,
	"code_call_plan" varchar(20) NOT NULL,
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
CREATE TABLE IF NOT EXISTS "call_plan_detail" (
	"id" serial PRIMARY KEY NOT NULL,
	"code_call_plan" varchar(20) NOT NULL,
	"call_plan_id" integer NOT NULL,
	"outlet_id" integer NOT NULL,
	"start_plan" date NOT NULL,
	"end_plan" date NOT NULL,
	"notes" varchar(255),
	"created_by" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(50),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(50),
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
ALTER TABLE "m_user_role" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
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
 ALTER TABLE "call_plan" ADD CONSTRAINT "call_plan_user_id_m_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."m_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_plan_detail" ADD CONSTRAINT "call_plan_detail_call_plan_id_call_plan_id_fk" FOREIGN KEY ("call_plan_id") REFERENCES "public"."call_plan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_plan_detail" ADD CONSTRAINT "call_plan_detail_outlet_id_m_outlet_id_fk" FOREIGN KEY ("outlet_id") REFERENCES "public"."m_outlet"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
