--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "folders" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" varchar(100) NOT NULL,
    "user_id" text REFERENCES "users"("id"),
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "folder_id" uuid REFERENCES "folders"("id") ON DELETE SET NULL;
