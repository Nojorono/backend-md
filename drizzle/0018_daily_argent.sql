ALTER TABLE "comments" RENAME COLUMN "notification_id" TO "notification_identifier";--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "notification_identifier" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "outlet_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "is_liked" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "notification_identifier" text;