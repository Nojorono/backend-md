CREATE TABLE IF NOT EXISTS "m_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(30) PRIMARY KEY NOT NULL,
	"user_role_id" bigint,
	"fullname" varchar(50),
	"password" varchar(100),
	"email" varchar(60),
	"phone" varchar(20),
	"tipe_md" varchar(20),
	"is_active" varchar(1) DEFAULT 'Y' NOT NULL,
	"is_android" varchar(1) DEFAULT 'Y' NOT NULL,
	"is_web" varchar(1) DEFAULT 'Y' NOT NULL,
	"valid_from" timestamp,
	"valid_to" timestamp,
	"remember_token" varchar(100),
	"last_login" timestamp,
	"created_by" varchar(20),
	"created_at" timestamp DEFAULT now(),
	"update_by" varchar(20),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "m_user_role" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(10) NOT NULL,
	"description" varchar(255) NOT NULL,
	"is_active" varchar(1) DEFAULT 'Y' NOT NULL,
	"created_by" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(50),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "m_user" ADD CONSTRAINT "m_user_user_role_id_m_user_role_id_fk" FOREIGN KEY ("user_role_id") REFERENCES "public"."m_user_role"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
