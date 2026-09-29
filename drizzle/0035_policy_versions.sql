-- Which version of each policy the user accepted, alongside the existing
-- accepted-at timestamps. A timestamp alone can't say which text a user agreed
-- to, and the refund policy is governed by the version in force on the day of
-- purchase. NULL means the user accepted a version before these columns
-- existed, so they are shown the update notice once.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "terms_version" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "privacy_version" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "refund_version" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "age_confirmed_at" timestamp;
