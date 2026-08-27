ALTER TABLE "app_settings" ADD COLUMN "combo_delay_seconds" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
UPDATE "app_settings" SET "combo_delay_seconds" = "delay_seconds";--> statement-breakpoint
ALTER TABLE "moves" ADD COLUMN "is_combo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_combo_delay_range" CHECK ("app_settings"."combo_delay_seconds" between 1 and 300);
