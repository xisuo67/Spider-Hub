-- Add nullable key column to app_item table
ALTER TABLE "app_item" ADD COLUMN IF NOT EXISTS "key" text;

-- Backfill existing rows: use id as key to guarantee uniqueness
UPDATE "app_item" SET "key" = "id" WHERE "key" IS NULL;

-- Enforce NOT NULL
ALTER TABLE "app_item" ALTER COLUMN "key" SET NOT NULL;

-- Add unique index for key
CREATE UNIQUE INDEX IF NOT EXISTS "app_item_key_unique" ON "app_item" ("key");


