// Sign-in hands a student to another app on this host with a full page load (app/lib/other-apps.ts): this site's
// router would ask that app for its data and show its error page instead (seen 22 Oct on /b2cnew/start).
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { isOtherApp, leavesByFullLoad } from "./other-apps.ts";
import { isPlatformHost } from "./b2c-home.ts";

// Other apps' addresses, with or without a path, a query or a hash.
for (const to of ["/b2cnew", "/b2cnew/", "/b2cnew/start", "/b2cnew/start?fresh", "/b2cnew?tab=companies", "/flow/", "/flow/?fresh=1", "/new", "/new/x#y", "/sensei-live/a"]) {
  assert.equal(isOtherApp(to), true, to);
}
// This site's own pages stay in the page, as before, including look-alikes of another app's prefix.
for (const to of ["/", "/outreach", "/outreach/upload", "/crm", "/profile/kabir-menon", "/b2cnewer", "/flowers", "/newsletter", "/news", "/auth?redirect=/b2cnew"]) {
  assert.equal(isOtherApp(to), false, to);
}

// QA-FIX (2 Nov 2026): on the product's own host only /auth is this site, so every other move is a full page load
// ("/start?fresh" there is career-agent's page, and the router would show this site's error page).
for (const host of ["platform.studojo.com", "platform.studojo.pro", "PLATFORM.studojo.pro:443"]) {
  assert.equal(isPlatformHost(host), true, host);
  for (const to of ["/", "/start?fresh", "/start", "/join?via=home", "/?s=settings", "/b2cnew/start?fresh", "/settings", "/account/delete", "/authx", "/forgot-password"]) {
    assert.equal(leavesByFullLoad(to, host), true, `${host} ${to}`);
  }
  for (const to of ["/auth", "/auth?mode=signin", "/auth/2fa", "/auth/2fa?x=1", "/auth#top"]) {
    assert.equal(leavesByFullLoad(to, host), false, `${host} ${to}`);
  }
}
// On the main site and anywhere else, as before: only another app's address is a full load.
for (const host of ["studojo.com", "www.studojo.com", "studojo.pro", "localhost:5173", "app.studojo.com", "platform.studojo.com.evil.io", "", null]) {
  assert.equal(isPlatformHost(host), false, String(host));
  assert.equal(leavesByFullLoad("/b2cnew/start?fresh", host), true, `${host} other app`);
  for (const to of ["/", "/settings", "/outreach", "/auth?redirect=/b2cnew"]) assert.equal(leavesByFullLoad(to, host), false, `${host} ${to}`);
}

// The sign-in page never moves on with the router alone: every move after signing in goes through goOn.
const page = readFileSync(new URL("../routes/auth._index.tsx", import.meta.url), "utf8");
assert.doesNotMatch(page, /\bnavigate\(redirectUrl/, "moves after sign-in go through goOn");
assert.match(page, /if \(leavesByFullLoad\(to, window\.location\.host\)\) \{\s*if \(replace\) window\.location\.replace\(to\);\s*else window\.location\.assign\(to\);\s*return;\s*\}\s*navigate\(to, \{ replace \}\);/);
// META-FIX (B4): the move waits for a sign-up's tracking answer (signupReported, at most 1.5 s), still through goOn.
assert.match(page, /if \(isPending \|\| !session\) return;[\s\S]{0,120}signupReported\(\)\.then\(\(\) => \{\s*if \(live\) goOn\(redirectUrl, true\);/);

console.log("other-apps: ok");
