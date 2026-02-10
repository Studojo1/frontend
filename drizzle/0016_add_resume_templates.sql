--> statement-breakpoint
-- Migration: Add resume_templates table and seed with initial templates
-- This replaces the JSON file-based template system with a proper database table

-- Create resume_templates table
CREATE TABLE IF NOT EXISTS "resume_templates" (
    "id" text PRIMARY KEY NOT NULL,
    "version" text DEFAULT '1.0' NOT NULL,
    "name" text NOT NULL,
    "description" text NOT NULL,
    "category" text NOT NULL,
    "latex_file" text NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

--> statement-breakpoint
-- Create indexes
CREATE INDEX IF NOT EXISTS "resume_templates_category_idx" ON "resume_templates"("category");
CREATE INDEX IF NOT EXISTS "resume_templates_is_active_idx" ON "resume_templates"("is_active");

--> statement-breakpoint
-- Seed initial templates
INSERT INTO "resume_templates" ("id", "version", "name", "description", "category", "latex_file", "is_active")
VALUES
    ('modern', '1.0', 'Modern', 'Clean, professional design with modern typography', 'professional', 'modern/resume.tex', true),
    ('classic', '1.0', 'Classic', 'Traditional format with timeless elegance', 'traditional', 'classic/resume.tex', true),
    ('minimal', '1.0', 'Minimal', 'Clean, ATS-friendly format with maximum readability', 'ats-friendly', 'minimal/resume.tex', true),
    ('executive', '1.0', 'Executive', 'Sophisticated design for senior roles', 'executive', 'executive/resume.tex', true),
    ('creative', '1.0', 'Creative', 'Bold design for creative and design roles', 'creative', 'creative/resume.tex', true)
ON CONFLICT ("id") DO NOTHING;

--> statement-breakpoint
-- Add foreign key constraint from resume_drafts to resume_templates
-- Note: This assumes resume_drafts already exists. If template_id values don't match, 
-- we'll need to handle that separately.
ALTER TABLE "resume_drafts" 
ADD CONSTRAINT "resume_drafts_template_id_resume_templates_id_fk" 
FOREIGN KEY ("template_id") REFERENCES "resume_templates"("id") ON DELETE RESTRICT;

