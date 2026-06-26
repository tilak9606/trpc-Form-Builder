-- Add `plan` column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan varchar(20) DEFAULT 'free' NOT NULL;

-- Add `thank_you_url` column to forms table
ALTER TABLE forms ADD COLUMN IF NOT EXISTS thank_you_url text;
