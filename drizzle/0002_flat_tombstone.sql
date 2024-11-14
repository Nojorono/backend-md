ALTER TABLE "activity_md" ALTER COLUMN "area" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "activity_md" ALTER COLUMN "region" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "activity_md" ALTER COLUMN "brand" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "activity_md" ALTER COLUMN "type_sio" SET DATA TYPE varchar(80);--> statement-breakpoint
ALTER TABLE "activity_md" ALTER COLUMN "brand_type_sio" SET DATA TYPE varchar(80);--> statement-breakpoint
ALTER TABLE "activity_md" ALTER COLUMN "amo_brand_type_sio" SET DATA TYPE varchar(80);--> statement-breakpoint
ALTER TABLE "call_plan_schedule" ALTER COLUMN "status" SET DEFAULT 'scheduled';--> statement-breakpoint
ALTER TABLE "activity_md_detail" ADD COLUMN "value" varchar(255);--> statement-breakpoint
ALTER TABLE "call_plan_schedule" ADD COLUMN "time_start" timestamp DEFAULT null;--> statement-breakpoint
ALTER TABLE "call_plan_schedule" ADD COLUMN "time_end" timestamp DEFAULT null;