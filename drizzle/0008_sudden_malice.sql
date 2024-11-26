CREATE TABLE IF NOT EXISTS "survey" (
	"id" serial PRIMARY KEY NOT NULL,
	"outlet_code" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"brand" varchar(255) NOT NULL,
	"address_line" varchar(300),
	"sub_district" varchar(255),
	"district" varchar(255),
	"city_or_regency" varchar(255),
	"postal_code" integer DEFAULT 0,
	"latitude" varchar(225),
	"longitude" varchar(225),
	"sio_type" varchar(50),
	"region" varchar(50),
	"area" varchar(50),
	"cycle" varchar(50),
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
	"outlet_id" integer,
	"status" varchar(20),
	"created_by" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(100),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(100),
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "survey" ADD CONSTRAINT "survey_outlet_id_m_outlet_id_fk" FOREIGN KEY ("outlet_id") REFERENCES "public"."m_outlet"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
