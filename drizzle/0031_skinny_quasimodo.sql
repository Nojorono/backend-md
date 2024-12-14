ALTER TABLE "absensi" RENAME COLUMN "longitude" TO "longitude_in";--> statement-breakpoint
ALTER TABLE "absensi" RENAME COLUMN "latitude" TO "latitude_in";--> statement-breakpoint
ALTER TABLE "absensi" ADD COLUMN "longitude_out" varchar(255) DEFAULT '';--> statement-breakpoint
ALTER TABLE "absensi" ADD COLUMN "latitude_out" varchar(255) DEFAULT '';