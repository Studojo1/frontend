-- Which email style the student picked for an extension draft.
--
-- job-outreach-svc offers six styles (email_generator_service.py:24) and
-- rewrites the message using the chosen one. Since the template path in
-- /campaign/create is unreachable — blank styles default to two AI styles —
-- picking a style is how a student actually controls the email that goes out.
ALTER TABLE "extension_drafts"
  ADD COLUMN IF NOT EXISTS "email_style" text NOT NULL DEFAULT 'warm_intro';
