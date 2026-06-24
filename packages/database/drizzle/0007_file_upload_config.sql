--> statement-breakpoint
ALTER TABLE "form_fields" ADD COLUMN "max_file_size" numeric;
--> statement-breakpoint
ALTER TABLE "form_fields" ADD COLUMN "allowed_file_types" json;
