--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "notify_email" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "notify_email_to" varchar(255);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhooks" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "form_id" uuid NOT NULL REFERENCES "forms"("id") ON DELETE CASCADE,
    "name" varchar(100) NOT NULL,
    "url" text NOT NULL,
    "events" json DEFAULT '["submission.created"]'::json NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_templates" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" varchar(100) NOT NULL,
    "description" varchar(300),
    "fields" json DEFAULT '[]'::json NOT NULL,
    "created_by" text REFERENCES "users"("id"),
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);
