-- Contact Enrichment API: usage/quota, rate limiting, idempotency cache, bulk jobs.

-- Per-key monthly quota (soft abuse cap, drives 402 out_of_credits). Generous
-- default so it never blocks a paying customer; raise per key as needed.
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "monthly_quota" integer NOT NULL DEFAULT 10000;

-- Generic per-key counters: rate-limit windows and monthly usage share one table.
-- bucket = 'rate:<YYYY-MM-DDTHH:MM>' (fixed 1-min window) or 'month:<YYYY-MM>'.
CREATE TABLE IF NOT EXISTS "api_counters" (
  "key_id" uuid NOT NULL REFERENCES "api_keys"("id") ON DELETE CASCADE,
  "bucket" text NOT NULL,
  "count"  integer NOT NULL DEFAULT 0,
  "updated_at" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("key_id", "bucket")
);
CREATE INDEX IF NOT EXISTS "api_counters_updated_idx" ON "api_counters" ("updated_at");

-- Idempotency + negative cache. Same LinkedIn URL inside the TTL returns the
-- cached result and is never re-charged.
CREATE TABLE IF NOT EXISTS "api_enrich_cache" (
  "linkedin_url" text PRIMARY KEY,
  "status"      text NOT NULL,
  "result"      jsonb NOT NULL,
  "created_at"  timestamp NOT NULL DEFAULT now()
);

-- Bulk jobs. results holds one enrich object per profile as they resolve.
CREATE TABLE IF NOT EXISTS "api_jobs" (
  "id"         text PRIMARY KEY,
  "email"      text NOT NULL,
  "key_id"     uuid,
  "status"     text NOT NULL DEFAULT 'processing',
  "total"      integer NOT NULL DEFAULT 0,
  "processed"  integer NOT NULL DEFAULT 0,
  "results"    jsonb NOT NULL DEFAULT '[]'::jsonb,
  "meta"       jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "api_jobs_email_idx" ON "api_jobs" (lower("email"));
