ALTER TABLE "activity_md_detail" ALTER COLUMN "name" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "activity_md_detail" ADD COLUMN "type" varchar(50) NOT NULL;