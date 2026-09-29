// "Download my data" must never hand a student a credential: not theirs, and
// not one job-outreach-svc added to its half of the file later. Pin the net
// that app/routes/api.account.export.tsx runs over the whole file.
import assert from "node:assert/strict";
import { exportFilename, isSecretKey, pickColumns, stripSecrets } from "./account-export.ts";

// Every secret this app or the backend stores, in both naming styles.
const SECRETS = [
  "password", "accessToken", "access_token", "refreshToken", "refresh_token", "idToken", "id_token",
  "token", "session_token", "secret", "backupCodes", "backup_codes", "publicKey", "public_key",
  "credentialID", "credential_id", "liAtEncrypted", "li_at_encrypted", "li_at", "cookiesEncrypted",
  "cookies", "keyHash", "key_hash", "key_prefix", "company_token", "razorpay_signature", "nonce",
  "otp", "private_key", "api_key", "tracking_token",
];
for (const k of SECRETS) assert.ok(isSecretKey(k), `secret key kept: ${k}`);

// Ordinary fields that merely look close must survive.
const KEEP = [
  "email", "name", "resume_text", "last_four", "provider_id", "scope", "credits_granted", "linkedin_url",
  "status", "created_at", "is_active", "user_message", "body", "subject", "ip_address", "user_agent",
];
for (const k of KEEP) assert.ok(!isSecretKey(k), `ordinary key dropped: ${k}`);

// The deep walk: nested objects, arrays of rows, and the backend's own half.
const file = {
  user_id: "u1",
  account: {
    email: "a@b.co",
    password: "$2a$hash",
    sign_in_methods: [{ provider_id: "google", accessToken: "ya29.x", refresh_token: "1//r", idToken: "eyJ" }],
    passkeys: [{ name: "Mac", publicKey: "pk", credentialID: "cid" }],
  },
  autoapply: { linkedin_session: { is_active: true, li_at_encrypted: "enc", cookies_encrypted: "enc" } },
  job_outreach: { gmail_accounts: [{ email_address: "a@gmail.com", access_token: "at", refresh_token: "rt" }] },
  when: new Date("2026-09-29T10:00:00Z"),
  none: null,
};
const out = stripSecrets(file);
assert.deepEqual(out, {
  user_id: "u1",
  account: {
    email: "a@b.co",
    sign_in_methods: [{ provider_id: "google" }],
    passkeys: [{ name: "Mac" }],
  },
  autoapply: { linkedin_session: { is_active: true } },
  job_outreach: { gmail_accounts: [{ email_address: "a@gmail.com" }] },
  when: "2026-09-29T10:00:00.000Z",
  none: null,
});
// Not mutated in place: the caller's object is untouched.
assert.equal(file.account.password, "$2a$hash");
// Nothing that looks like a token value is left anywhere in the output.
assert.ok(!/ya29|1\/\/r|eyJ|\$2a\$|"enc"|"at"|"rt"/.test(JSON.stringify(out)));

// Column allowlist: only listed columns, and a missing column is skipped, not null.
assert.deepEqual(
  pickColumns([{ id: 1, name: "CV", password: "x" }, { id: 2 }], ["id", "name"]),
  [{ id: 1, name: "CV" }, { id: 2 }],
);

assert.equal(exportFilename(new Date("2026-09-29T23:30:00Z")), "studojo-data-2026-09-29.json");

console.log(`account export: ${SECRETS.length} secret keys stripped, ${KEEP.length} ordinary keys kept, deep walk passes`);
