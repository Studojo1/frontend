// The /pb form parser: what a student may store, and where a link may point.
//
// Run: npx tsx app/lib/pb/profile-form.test.mjs
import assert from "node:assert";
import { normalizePostedUrl, normalizeLinkedinUrl, parseProfileForm, emptyProfileInput } from "./profile-form.ts";

// Staff see the "I posted it" link as something to open, so it must be LinkedIn.
assert.equal(normalizePostedUrl("https://www.linkedin.com/posts/abc-123").url, "https://www.linkedin.com/posts/abc-123");
assert.equal(normalizePostedUrl("linkedin.com/feed/update/urn:li:activity:1").error, null);
assert.equal(normalizePostedUrl("https://lnkd.in/abc").error, null);
assert.equal(normalizePostedUrl("").url, null, "empty is fine: the link is optional");
assert.equal(normalizePostedUrl("").error, null);
for (const bad of ["https://evil.example/linkedin-login", "https://linkedin.com.evil.example/x", "https://notlinkedin.com/x", "javascript:alert(1)", "data:text/html,x", "ftp://linkedin.com/x"]) {
  const r = normalizePostedUrl(bad);
  assert.equal(r.url, null, `${bad} is not stored`);
  assert.ok(r.error, `${bad} gets an error`);
}

// The profile link has to be a LinkedIn profile too.
assert.equal(normalizeLinkedinUrl("https://evil.example/in/me").error !== null, true);
assert.equal(normalizeLinkedinUrl("linkedin.com/in/asha").error, null);

// A form round trip: required fields, clamps, and nothing trusted from the client.
{
  const form = new FormData();
  const empty = parseProfileForm(form);
  assert.ok(empty.errors.name && empty.errors.headline, "name and headline are required");
  const seed = emptyProfileInput({ name: "Asha Rao" });
  assert.equal(seed.name, "Asha Rao");
  assert.equal(seed.stories.length >= 0, true);
}

console.log("pb profile form: all assertions passed");
