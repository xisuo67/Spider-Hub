-- Add parent_id column to app_item for self-referencing hierarchy
ALTER TABLE "app_item" ADD COLUMN IF NOT EXISTS "parent_id" text;

-- Optional: add a foreign key (will be no-op if not supported in your environment)
DO $$
BEGIN
  ALTER TABLE "app_item" ADD CONSTRAINT app_item_parent_fk FOREIGN KEY ("parent_id") REFERENCES "app_item"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Index to speed up lookups by parent and ordering
CREATE INDEX IF NOT EXISTS app_item_parent_sort_idx ON "app_item" ("parent_id", "sort_order");


