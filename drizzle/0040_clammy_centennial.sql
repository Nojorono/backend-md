CREATE TABLE IF NOT EXISTS "reimburse_bbm" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"photo_in" varchar(255) DEFAULT '',
	"photo_out" varchar(255) DEFAULT '',
	"kilometer_in" integer DEFAULT 0,
	"kilometer_out" integer DEFAULT 0,
	"date_in" timestamp DEFAULT now() NOT NULL,
	"date_out" timestamp DEFAULT null,
	"total_kilometer" integer DEFAULT 0,
	"description" varchar(255) DEFAULT '',
	"status" integer DEFAULT 0,
	"approved_by" varchar(100) DEFAULT '',
	"approved_at" timestamp DEFAULT null,
	CONSTRAINT "reimburse_bbm_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reimburse_bbm" ADD CONSTRAINT "reimburse_bbm_user_id_m_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."m_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
