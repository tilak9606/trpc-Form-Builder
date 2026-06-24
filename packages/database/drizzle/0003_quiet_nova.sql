ALTER TYPE "public"."field_type_enum" ADD VALUE 'SELECT';--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'MULTI_SELECT';--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'DATE';--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'TEXTAREA';--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'FILE_UPLOAD';--> statement-breakpoint
ALTER TABLE "form_fields" DROP CONSTRAINT "form_fields_form_id_forms_id_fk";
--> statement-breakpoint
ALTER TABLE "form_submissions" DROP CONSTRAINT "form_submissions_form_id_forms_id_fk";
--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "title" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "slug" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "status" varchar(10) DEFAULT 'DRAFT' NOT NULL;--> statement-breakpoint
ALTER TABLE "form_fields" ADD COLUMN "options" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "form_fields" ADD COLUMN "validation" json;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD COLUMN "respondent_email" varchar(255);--> statement-breakpoint
ALTER TABLE "form_submissions" ADD COLUMN "respondent_ip" varchar(45);--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_slug_unique" UNIQUE("slug");