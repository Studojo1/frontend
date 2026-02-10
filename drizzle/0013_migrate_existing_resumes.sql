--> statement-breakpoint
-- Migrate existing resumes to versioned system
-- Set all existing resumes to version 1
-- Set default template to "modern"
-- Create initial version records for existing resumes

UPDATE "resumes" 
SET "version" = 1, "template_id" = 'modern' 
WHERE "version" IS NULL OR "template_id" IS NULL;

--> statement-breakpoint
-- Create initial version records for all existing resumes
INSERT INTO "resume_versions" ("resume_id", "version", "resume_data", "template_id", "change_summary", "created_by")
SELECT 
    "id" as "resume_id",
    1 as "version",
    "resume_data",
    COALESCE("template_id", 'modern') as "template_id",
    'Initial version (migrated)' as "change_summary",
    "user_id" as "created_by"
FROM "resumes"
WHERE NOT EXISTS (
    SELECT 1 FROM "resume_versions" 
    WHERE "resume_versions"."resume_id" = "resumes"."id" 
    AND "resume_versions"."version" = 1
);

