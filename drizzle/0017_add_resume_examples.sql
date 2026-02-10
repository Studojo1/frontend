--> statement-breakpoint
-- Migration: Add resume_examples table for job-type-specific example resumes

-- Create resume_examples table
CREATE TABLE IF NOT EXISTS "resume_examples" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "job_type" text NOT NULL,
    "job_type_label" text NOT NULL,
    "template_id" text NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "resume_data" jsonb NOT NULL,
    "preview_url" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

--> statement-breakpoint
-- Create indexes
CREATE INDEX IF NOT EXISTS "resume_examples_job_type_idx" ON "resume_examples"("job_type");
CREATE INDEX IF NOT EXISTS "resume_examples_template_id_idx" ON "resume_examples"("template_id");
CREATE INDEX IF NOT EXISTS "resume_examples_is_active_idx" ON "resume_examples"("is_active");

--> statement-breakpoint
-- Add foreign key constraint
ALTER TABLE "resume_examples" 
ADD CONSTRAINT "resume_examples_template_id_resume_templates_id_fk" 
FOREIGN KEY ("template_id") REFERENCES "resume_templates"("id") ON DELETE RESTRICT;


