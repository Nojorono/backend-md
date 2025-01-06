CREATE TABLE IF NOT EXISTS "activity_program" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_id" integer,
	"name" varchar(50) NOT NULL,
	"description" varchar(255),
	"photo" varchar(255),
	"created_by" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(100),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(100),
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "photo_program" varchar(255);--> statement-breakpoint
ALTER TABLE "m_program" ADD COLUMN "photo" varchar(255);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_program" ADD CONSTRAINT "activity_program_activity_id_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
