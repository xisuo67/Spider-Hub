CREATE TABLE "i18n_translation" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"language_code" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_item" ADD COLUMN "key" text;--> statement-breakpoint
CREATE UNIQUE INDEX "i18n_translation_key_lang_unique" ON "i18n_translation" USING btree ("key","language_code");--> statement-breakpoint
CREATE INDEX "i18n_translation_key_idx" ON "i18n_translation" USING btree ("key");