-- Drop and recreate the column "value" in "activity_branch"
ALTER TABLE "activity_branch" DROP COLUMN "value";
ALTER TABLE "activity_branch" ADD COLUMN "value" integer;

-- Drop and recreate the column "value" in "activity_sog"
ALTER TABLE "activity_sog" DROP COLUMN "value";
ALTER TABLE "activity_sog" ADD COLUMN "value" integer;