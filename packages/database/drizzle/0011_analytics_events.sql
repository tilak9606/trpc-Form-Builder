CREATE TABLE IF NOT EXISTS "form_analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"form_id" uuid NOT NULL REFERENCES "forms"("id") ON DELETE CASCADE,
	"event_type" varchar(20) NOT NULL,
	"session_id" varchar(100),
	"device_fingerprint" varchar(255),
	"respondent_ip" varchar(45),
	"created_at" timestamp DEFAULT now()
);
