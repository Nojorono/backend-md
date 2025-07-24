CREATE TABLE IF NOT EXISTS "m_area" (
	"id" serial PRIMARY KEY NOT NULL,
	"region_id" integer,
	"area" varchar(150),
	"created_by" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(100),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(100),
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "m_region" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"created_by" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(100),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(100),
	"deleted_at" timestamp DEFAULT null,
	CONSTRAINT "m_region_name_unique" UNIQUE("name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "m_area" ADD CONSTRAINT "m_area_region_id_m_region_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."m_region"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
