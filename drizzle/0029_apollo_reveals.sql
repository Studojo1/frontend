-- Apollo phone reveals land asynchronously via webhook. The engine inserts a
-- pending row keyed by a reveal id (rid), fires the reveal with that rid in the
-- callback URL, and briefly polls this row for the number to arrive.
CREATE TABLE IF NOT EXISTS "apollo_reveals" (
  "rid"          text PRIMARY KEY,
  "linkedin_url" text NOT NULL DEFAULT '',
  "apollo_id"    text NOT NULL DEFAULT '',
  "phone"        text,
  "status"       text NOT NULL DEFAULT 'pending',
  "created_at"   timestamp NOT NULL DEFAULT now(),
  "updated_at"   timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "apollo_reveals_created_idx" ON "apollo_reveals" ("created_at");
