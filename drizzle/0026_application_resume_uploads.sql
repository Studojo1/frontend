-- One row per file a candidate has uploaded for an internship application.
-- Lets the apply flow show "use a previous resume" without going through
-- internship_applications, and lets the apply endpoint verify the URL the
-- client sent was actually uploaded by this user (not replayed from elsewhere).
CREATE TABLE IF NOT EXISTS "application_resume_uploads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "url" text NOT NULL,
  "content_type" text NOT NULL,
  "name" text NOT NULL,
  "size_bytes" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "last_used_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "application_resume_uploads_user_url_unique" UNIQUE ("user_id", "url")
);

CREATE INDEX IF NOT EXISTS "application_resume_uploads_user_last_used_idx"
  ON "application_resume_uploads" ("user_id", "last_used_at" DESC);

-- Backfill from existing applications so candidates who've already applied
-- see their previously-used resume(s) the next time they hit Apply. Dedupes
-- by (user_id, url) via ON CONFLICT.
INSERT INTO "application_resume_uploads" ("user_id", "url", "content_type", "name", "created_at", "last_used_at")
SELECT
  ia.user_id,
  ia.resume_file_url,
  COALESCE(ia.resume_file_content_type, 'application/pdf'),
  COALESCE(ia.resume_file_name, 'resume.pdf'),
  MIN(ia.created_at),
  MAX(ia.created_at)
FROM "internship_applications" ia
WHERE ia.resume_file_url IS NOT NULL
GROUP BY ia.user_id, ia.resume_file_url, ia.resume_file_content_type, ia.resume_file_name
ON CONFLICT ("user_id", "url") DO NOTHING;
