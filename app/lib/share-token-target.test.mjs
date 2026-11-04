// SEC-4NOV (4 Nov 2026, the site audit): the JWT that /api/auth/share-token-redirect puts in an address's hash goes to
// the admin panel's own origins only (lib/share-token-target.ts), and sign-in's ?redirect stays on this site and never
// becomes an address of another host (routes/auth._index.tsx getRedirectUrl).
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { isShareTokenTarget, SHARE_TOKEN_ORIGINS } from "./share-token-target.ts";

assert.deepEqual([...SHARE_TOKEN_ORIGINS].sort(), ["https://admin.studojo.com", "https://admin.studojo.pro"]);

// The admin panel's login page, as it sends itself (window.location.href), in every environment.
for (const env of ["production", "development", undefined]) {
  for (const to of [
    "https://admin.studojo.com/login",
    "https://admin.studojo.com/login?next=%2Fusers",
    "https://admin.studojo.com",
    "https://admin.studojo.com/",
    "https://admin.studojo.com#x",
    "https://admin.studojo.com?x=1",
    "https://admin.studojo.pro/login",
  ]) {
    assert.equal(isShareTokenTarget(to, env), true, `${to} (${env})`);
  }
}

// A local admin panel on a laptop, any port: only when the site is not in production.
for (const to of ["http://localhost:3001/login", "http://127.0.0.1:3001/login", "http://localhost:5173/", "http://localhost/login"]) {
  assert.equal(isShareTokenTarget(to, "development"), true, to);
  assert.equal(isShareTokenTarget(to, undefined), true, to);
  assert.equal(isShareTokenTarget(to, "production"), false, `${to} in production`);
}

// Everything else, in every environment.
const refused = [
  // another site, and look-alikes of ours
  "https://evil.example/login",
  "https://admin.studojo.com.evil.com/login",
  "https://evil.com/admin.studojo.com",
  "https://evil.com?https://admin.studojo.com",
  "https://xadmin.studojo.com/login",
  "https://studojo.com/login",
  "https://platform.studojo.com/login",
  // the right host on the wrong scheme or port
  "http://admin.studojo.com/login",
  "http://admin.studojo.pro/login",
  "https://admin.studojo.com:8443/login",
  "https://admin.studojo.com:443/login",
  "ftp://admin.studojo.com/login",
  "ws://admin.studojo.com/login",
  // a user part, or a backslash the parser would read differently
  "https://admin.studojo.com@evil.com/login",
  "https://admin.studojo.com:pw@evil.com",
  "https://evil.com\\@admin.studojo.com",
  "https://evil.com\\@admin.studojo.com/login",
  "https://user:pw@admin.studojo.com/login",
  "https://user@admin.studojo.com/login",
  "https:\\\\admin.studojo.com/login",
  "https:/admin.studojo.com/login",
  "https:admin.studojo.com/login",
  "HTTPS://ADMIN.STUDOJO.COM/login",
  " https://admin.studojo.com/login",
  "https://admin.studojo.com\t/login",
  // relative, protocol relative, and not web addresses at all
  "//evil.com",
  "//admin.studojo.com/login",
  "/\\evil.com",
  "/login",
  "admin.studojo.com/login",
  "javascript:alert(1)",
  "javascript://admin.studojo.com/%0aalert(1)",
  "data:text/html,hi",
  "",
  null,
  undefined,
  // a local address passed off as ours
  "http://localhost.evil.com:3001/login",
  "http://localhost:3001@evil.com/login",
  "http://127.0.0.1.evil.com/login",
];
for (const env of ["production", "development", undefined]) {
  for (const to of refused) assert.equal(isShareTokenTarget(to, env), false, `${JSON.stringify(to)} (${env})`);
}

// The route checks the address before anything else (the session, the token), refuses with a 400, and its success
// path is unchanged.
const route = readFileSync(new URL("../routes/api.auth.share-token-redirect.tsx", import.meta.url), "utf8");
const check = route.indexOf("if (!isShareTokenTarget(redirectTo, process.env.NODE_ENV)) {");
assert.ok(check > 0, "the route checks the address");
assert.ok(check < route.indexOf("auth.api.getSession"), "before the session is read");
assert.match(route, /if \(!isShareTokenTarget\(redirectTo, process\.env\.NODE_ENV\)\) \{\n\s+return Response\.json\(\{ error: "redirect not allowed" \}, \{ status: 400 \}\);/);
assert.match(route, /const redirectUrl = new URL\(redirectTo\);\n\s+redirectUrl\.hash = `token=\$\{encodeURIComponent\(jwtToken\)\}`;\n\s+\n\s+return Response\.redirect\(redirectUrl\.toString\(\), 302\);/);

// Sign-in's ?redirect (auth._index.tsx getRedirectUrl), run as written: this site only, and never "//host" or "/\host".
const page = readFileSync(new URL("../routes/auth._index.tsx", import.meta.url), "utf8");
const m = /const getRedirectUrl = \(\): string => \{\n([\s\S]*?)\n  \};\n/.exec(page);
assert.ok(m, "getRedirectUrl is where it was");
const getRedirectUrl = (origin, value) => {
  const searchParams = new URLSearchParams(value === null ? "" : `redirect=${encodeURIComponent(value)}`);
  return new Function("searchParams", "window", m[1])(searchParams, { location: { origin } });
};
const here = "https://studojo.com";
for (const [value, want] of [
  [null, "/"],
  ["/b2cnew", "/b2cnew"],
  ["/b2cnew/start?fresh=1#top", "/b2cnew/start?fresh=1#top"],
  ["/outreach", "/outreach"],
  ["https://studojo.com/api/auth/share-token-redirect?redirect=x", "/api/auth/share-token-redirect?redirect=x"],
  ["dashboard", "/dashboard"],
  // another host, however it is written
  ["https://evil.com/x", "/"],
  ["//evil.com", "/"],
  ["/\\evil.com", "/"],
  ["\\/evil.com", "/"],
  ["\\\\evil.com", "/"],
  [" //evil.com", "/"],
  ["/\t/evil.com", "/"],
  ["javascript:alert(1)", "/"],
  // this site's address, with a path the browser would read as another host
  ["/.//evil.com", "/"],
  ["/%2e//evil.com", "/"],
  ["https://studojo.com//evil.com", "/"],
  ["https://studojo.com/.//evil.com", "/"],
]) {
  assert.equal(getRedirectUrl(here, value), want, JSON.stringify(value));
}

console.log("share-token-target: ok");
