-- Create email_notification_settings table
CREATE TABLE IF NOT EXISTS "email_notification_settings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "form_id" uuid NOT NULL UNIQUE REFERENCES "forms"("id") ON DELETE CASCADE,
    "creator_notify_on_submission" boolean DEFAULT false NOT NULL,
    "creator_notify_email" varchar(255),
    "creator_email_subject" text,
    "creator_email_template" text,
    "respondent_confirmation_enabled" boolean DEFAULT false NOT NULL,
    "respondent_email_field_id" uuid REFERENCES "form_fields"("id") ON DELETE SET NULL,
    "respondent_email_subject" text,
    "respondent_email_template" text,
    "weekly_digest_enabled" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_email_settings_form" ON "email_notification_settings" ("form_id");
