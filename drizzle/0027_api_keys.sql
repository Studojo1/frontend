-- API keys for the Studojo Contact Enrichment API (studojo.com/apidocs).
-- A key is shown to the builder exactly once at creation; we only ever store
-- its sha256 hash. Only allowlisted emails can create keys (enforced in the
-- app layer via API_BUILDER_ALLOWLIST), but the table itself is generic.
CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text REFERENCES "user"("id") ON DELETE CASCADE,
  "email" text NOT NULL,
  "name" text NOT NULL DEFAULT 'API key',
  "key_prefix" text NOT NULL,
  "key_hash" text NOT NULL UNIQUE,
  "last_four" text NOT NULL DEFAULT '',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "last_used_at" timestamp,
  "revoked_at" timestamp,
  "request_count" integer DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS "api_keys_email_idx" ON "api_keys" (lower("email"));
CREATE INDEX IF NOT EXISTS "api_keys_hash_idx" ON "api_keys" ("key_hash");
