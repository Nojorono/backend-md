CREATE TABLE IF NOT EXISTS "activity_branch" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_id" integer,
	"name" varchar(50) NOT NULL,
	"value" varchar(255),
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
CREATE TABLE IF NOT EXISTS "m_program" (
	"id" serial PRIMARY KEY NOT NULL,
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
ALTER TABLE "activity_sog" ADD COLUMN "value" varchar(255);--> statement-breakpoint
ALTER TABLE "m_brand" ADD COLUMN "branch" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "m_brand" ADD COLUMN "color" varchar(50) DEFAULT '';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_branch" ADD CONSTRAINT "activity_branch_activity_id_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
