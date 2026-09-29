-- Google sign-in stored the provider's access, refresh and ID tokens in plain
-- text. Nothing reads them: sign-in only needs them during the OAuth round
-- trip, our own API auth uses the better-auth JWT, and Gmail outreach has its
-- own (encrypted) tokens in email_accounts. From this release better-auth
-- encrypts new access and refresh tokens (account.encryptOAuthTokens) and the
-- ID token is not stored at all (app/lib/auth.ts). Existing plaintext values
-- are cleared rather than encrypted in place: an unreadable plaintext value
-- would make better-auth's decrypt throw, and there is nothing to keep.
-- Password (credential) rows are untouched.
UPDATE "account"
SET "access_token" = NULL, "refresh_token" = NULL, "id_token" = NULL
WHERE "provider_id" <> 'credential'
  AND ("access_token" IS NOT NULL OR "refresh_token" IS NOT NULL OR "id_token" IS NOT NULL);
