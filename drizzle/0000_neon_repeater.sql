CREATE TABLE "app_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"active_style_id" uuid,
	"delay_seconds" integer DEFAULT 5 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_settings_singleton" CHECK ("app_settings"."id" = 1),
	CONSTRAINT "app_settings_delay_range" CHECK ("app_settings"."delay_seconds" between 1 and 300)
);
--> statement-breakpoint
CREATE TABLE "dance_styles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moves" (
	"id" uuid PRIMARY KEY NOT NULL,
	"style_id" uuid NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"reference_url" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_active_style_id_dance_styles_id_fk" FOREIGN KEY ("active_style_id") REFERENCES "public"."dance_styles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moves" ADD CONSTRAINT "moves_style_id_dance_styles_id_fk" FOREIGN KEY ("style_id") REFERENCES "public"."dance_styles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "dance_styles_position_idx" ON "dance_styles" USING btree ("position");--> statement-breakpoint
CREATE UNIQUE INDEX "moves_style_position_idx" ON "moves" USING btree ("style_id","position");