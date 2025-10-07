-- Add link column to app_item table
ALTER TABLE "app_item" ADD COLUMN IF NOT EXISTS "link" text;


