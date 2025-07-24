CREATE TABLE IF NOT EXISTS "m_sio_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"component" jsonb DEFAULT '[]'::jsonb,
	"created_by" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(50),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(50),
	"deleted_at" timestamp DEFAULT null,
	CONSTRAINT "m_sio_type_name_unique" UNIQUE("name")
);
