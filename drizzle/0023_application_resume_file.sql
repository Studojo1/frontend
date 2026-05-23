-- Preserve the original uploaded resume file for direct-upload applicants.
-- Without these columns, only the parsed JSON snapshot was kept, which
-- produced blank or "Contact information not provided" previews for any
-- applicant whose PDF didn't parse cleanly. New columns are nullable so
-- existing rows (and Studojo-builder applicants who never upload a file)
-- are unaffected.
ALTER TABLE "internship_applications" ADD COLUMN IF NOT EXISTS "resume_file_url" text;
ALTER TABLE "internship_applications" ADD COLUMN IF NOT EXISTS "resume_file_content_type" text;
ALTER TABLE "internship_applications" ADD COLUMN IF NOT EXISTS "resume_file_name" text;
