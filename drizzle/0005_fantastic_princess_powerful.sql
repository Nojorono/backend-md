ALTER TABLE "m_outlet" ALTER COLUMN "outlet_code" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "m_outlet" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "m_outlet" ALTER COLUMN "brand" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "m_outlet" ALTER COLUMN "unique_name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "m_outlet" ALTER COLUMN "sub_district" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "m_outlet" ALTER COLUMN "sub_district" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "m_outlet" ALTER COLUMN "sub_district" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "m_outlet" ALTER COLUMN "district" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "m_outlet" ALTER COLUMN "city_or_regency" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "m_outlet" ALTER COLUMN "postal_code" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "m_outlet" ALTER COLUMN "postal_code" DROP NOT NULL;