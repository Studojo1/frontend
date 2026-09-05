-- better-auth 1.7 requires account.issuer. This adds it AHEAD of the upgrade.
--
-- Why this ships on its own, before any version bump:
--
-- better-auth marks `issuer` required and writes it on EVERY account creation
-- (createLocalAccountIssuer for credential/passkey, the provider's own issuer
-- URL for OAuth). Our account table has no such column, so if the new package
-- ships first, every signup fails on INSERT — while existing users keep
-- logging in perfectly well. That is a silent break: only NEW accounts stop
-- working, which is exactly how it reaches production unnoticed.
--
-- Running 1.4.18 neither reads nor writes this column, so applying this
-- migration alone changes nothing until the upgrade lands. That is the point:
-- it makes the version bump a code-only change with no data risk.

-- NULLABLE on purpose. A NOT NULL add would fail immediately against existing
-- rows, and every account in the table predates this column. Tightening it is
-- a separate decision for after the upgrade is proven.
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "issuer" text;

-- Backfill, using the exact values better-auth 1.7.2 generates. Verified
-- against @better-auth/core/dist/db/schema/account.mjs:
--
--   createLocalAccountIssuer(id)  ->  'local:' + encodeURIComponent(id)
--   createOAuthAccountIssuer(id)  ->  'local:oauth:' + encodeURIComponent(id)
--
-- and against @better-auth/core/src/social-providers/google.ts:154, where
-- Google declares accountIssuer: 'https://accounts.google.com' — so Google
-- accounts carry the real issuer URL rather than the synthetic 'local:oauth:'
-- form, which is only used by providers that declare no issuer of their own.
--
-- Providers are handled by name so a row that already has a value is never
-- overwritten, making this safe to re-run.

-- Local authentication methods: password and passkey. These have no external
-- issuer, so better-auth namespaces them under 'local:'.
UPDATE "account"
   SET "issuer" = 'local:' || "provider_id"
 WHERE "issuer" IS NULL
   AND "provider_id" IN ('credential', 'passkey');

-- Google is the only social provider configured (app/lib/auth.ts).
UPDATE "account"
   SET "issuer" = 'https://accounts.google.com'
 WHERE "issuer" IS NULL
   AND "provider_id" = 'google';

-- Anything else: fall back to the local namespace rather than leaving NULL.
-- A wrong-but-present issuer is recoverable; a NULL in a column the library
-- treats as required is not. provider_id has no characters encodeURIComponent
-- would escape in practice, so this matches what the library would write.
UPDATE "account"
   SET "issuer" = 'local:' || "provider_id"
 WHERE "issuer" IS NULL;
