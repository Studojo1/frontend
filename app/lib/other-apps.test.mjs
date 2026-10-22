// Sign-in hands a student to another app on this host with a full page load (app/lib/other-apps.ts): this site's
// router would ask that app for its data and show its error page instead (seen 22 Oct on /b2cnew/start).
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { isOtherApp } from "./other-apps.ts";

// Other apps' addresses, with or without a path, a query or a hash.
for (const to of ["/b2cnew", "/b2cnew/", "/b2cnew/start", "/b2cnew/start?fresh", "/b2cnew?tab=companies", "/flow/", "/flow/?fresh=1", "/new", "/new/x#y", "/sensei-live/a"]) {
  assert.equal(isOtherApp(to), true, to);
}
// This site's own pages stay in the page, as before, including look-alikes of another app's prefix.
for (const to of ["/", "/outreach", "/outreach/upload", "/crm", "/profile/kabir-menon", "/b2cnewer", "/flowers", "/newsletter", "/news", "/auth?redirect=/b2cnew"]) {
  assert.equal(isOtherApp(to), false, to);
}

// The sign-in page never moves on with the router alone: every move after signing in goes through goOn.
const page = readFileSync(new URL("../routes/auth._index.tsx", import.meta.url), "utf8");
assert.doesNotMatch(page, /\bnavigate\(redirectUrl/, "moves after sign-in go through goOn");
assert.match(page, /if \(isOtherApp\(to\)\)/);
assert.match(page, /!isPending && session\) goOn\(redirectUrl, true\)/);

console.log("other-apps: ok");
