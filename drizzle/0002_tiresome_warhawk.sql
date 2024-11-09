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
DO $$ BEGIN
 ALTER TABLE "m_batch_target" ADD CONSTRAINT "m_batch_target_batch_id_m_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."m_batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
