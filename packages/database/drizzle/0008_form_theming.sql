--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "theme_primary_color" varchar(7) DEFAULT '#3b82f6';
--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "theme_background_color" varchar(7) DEFAULT '#000000';
--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "theme_text_color" varchar(7) DEFAULT '#ffffff';
--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "theme_label_color" varchar(7) DEFAULT '#ffffff';
--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "theme_font_family" varchar(50) DEFAULT 'Inter';
--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "theme_border_radius" varchar(10) DEFAULT '0.5rem';
--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "theme_button_text" varchar(50) DEFAULT 'Submit';
--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "theme_logo_url" text;
