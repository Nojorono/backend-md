CREATE TABLE IF NOT EXISTS "m_brand" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand" varchar(50) NOT NULL,
	"sog" jsonb DEFAULT '[]'::jsonb,
	"created_by" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_by" varchar(50),
	"updated_at" timestamp DEFAULT now(),
	"deleted_by" varchar(50),
	"deleted_at" timestamp DEFAULT null,
	CONSTRAINT "m_brand_brand_unique" UNIQUE("brand")
);
