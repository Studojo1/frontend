-- Mirror the original-file columns on resumes rows so the URL survives the
-- import-to-builder path. Migration 0023 only added these to internship_applications,
-- which works for the direct-upload tab but loses the URL when a candidate
-- imports their PDF into the builder first and then applies via resume_id.
-- These columns get populated on import (POST /api/resumes from the parsed PDF)
-- and copied onto internship_applications at apply time.
ALTER TABLE "resumes" ADD COLUMN IF NOT EXISTS "original_file_url" text;
ALTER TABLE "resumes" ADD COLUMN IF NOT EXISTS "original_file_content_type" text;
ALTER TABLE "resumes" ADD COLUMN IF NOT EXISTS "original_file_name" text;
