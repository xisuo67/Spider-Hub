ALTER TABLE "app_item" ADD COLUMN "parent_id" text;--> statement-breakpoint
CREATE INDEX "app_item_parent_sort_idx" ON "app_item" USING btree ("parent_id","sort_order");