-- Drafts created by the browser extension.
--
-- These live here rather than in job-outreach-svc because that service has no
-- endpoint to edit an email before it sends: /campaign/{id}/emails returns
-- subject and body but nothing writes them, and emails are generated
-- server-side at /campaign/create time. So the student's draft is composed and
-- edited on our side, and handed over as subject_template/body_template at the
-- moment they press Send.
--
-- A row exists from the moment Apply is clicked. campaign_id stays NULL until
-- Send, which is what guarantees nothing can leave before a human reads it.
--
-- application_id is nullable on purpose: the career-agent write is
-- deliberately fire-and-forget, and losing the draft as well would be worse
-- than losing the link between them.
CREATE TABLE IF NOT EXISTS "extension_drafts" (
  "id"             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"        text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "application_id" text,
  "campaign_id"    integer,
  "contact_name"   text,
  "contact_email"  text,
  "contact_title"  text,
  "company"        text,
  "role"           text,
  "job_url"        text,
  "subject"        text,
  "body"           text,
  "status"         text NOT NULL DEFAULT 'draft',
  "source"         text NOT NULL DEFAULT 'browser_extension',
  "failure_reason" text,
  "created_at"     timestamp NOT NULL DEFAULT now(),
  "updated_at"     timestamp NOT NULL DEFAULT now(),
  "sent_at"        timestamp
);

-- One draft per application per student: clicking Apply twice on the same
-- posting must not produce two emails to the same person.
CREATE UNIQUE INDEX IF NOT EXISTS "extension_drafts_user_application_unique"
  ON "extension_drafts" ("user_id", "application_id");
CREATE INDEX IF NOT EXISTS "extension_drafts_user_id_idx"
  ON "extension_drafts" ("user_id");
CREATE INDEX IF NOT EXISTS "extension_drafts_status_idx"
  ON "extension_drafts" ("status");
