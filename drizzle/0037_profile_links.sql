-- Proof-of-work links on the student profile: GitHub, LinkedIn and a
-- portfolio URL, stored as {"github": "...", "linkedin": "...", "portfolio": "..."}.
-- The profile page shows the GitHub contribution graph from the handle.
-- NULL means the student has not added any.
ALTER TABLE "user_profile" ADD COLUMN IF NOT EXISTS "links" jsonb;
