ALTER TABLE "activity_sio" RENAME COLUMN "photo" TO "photo_before";--> statement-breakpoint
ALTER TABLE "activity_sio" ADD COLUMN "photo_after" varchar(255);