CREATE TABLE "app_item" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"enable" boolean DEFAULT false NOT NULL,
	"icon" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "app_item_sort_idx" ON "app_item" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "app_item_enable_idx" ON "app_item" USING btree ("enable");