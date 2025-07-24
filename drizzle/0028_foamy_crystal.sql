CREATE TABLE IF NOT EXISTS "absensi" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"date" date NOT NULL,
	"status" varchar(255) DEFAULT '',
	"remarks" varchar(500) DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"clock_in" timestamp DEFAULT null,
	"clock_out" timestamp DEFAULT null,
	"area" varchar(255) DEFAULT '',
	"region" varchar(255) DEFAULT '',
	CONSTRAINT "absensi_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "absensi" ADD CONSTRAINT "absensi_user_id_m_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."m_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
