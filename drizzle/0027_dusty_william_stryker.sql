CREATE TABLE IF NOT EXISTS "sio_type_galery" (
	"id" serial PRIMARY KEY NOT NULL,
	"sio_type_id" integer,
	"name" text NOT NULL,
	"photo" text,
	"created_at" timestamp DEFAULT now(),
	"type" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "latitude" varchar(100);--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "longitude" varchar(100);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sio_type_galery" ADD CONSTRAINT "sio_type_galery_sio_type_id_m_sio_type_id_fk" FOREIGN KEY ("sio_type_id") REFERENCES "public"."m_sio_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "sio_type_galery" USING btree ("name");