// HP-N17 (audit 30 Sep 2026): HTML pages must carry anti-framing and basic
// hardening headers. GET had them, HEAD (what curl -I and scanners send)
// did not. Calls the real entry.server handleRequest for a HEAD request.
import assert from "node:assert/strict";

const { default: handleRequest } = await import("../entry.server.tsx");

const res = await handleRequest(
  new Request("https://studojo.com/auth", { method: "HEAD" }),
  200,
  new Headers(),
  {},
  {},
);
assert.equal(res.headers.get("content-security-policy"), "frame-ancestors 'self'");
assert.equal(res.headers.get("x-frame-options"), "SAMEORIGIN");
assert.equal(res.headers.get("x-content-type-options"), "nosniff");
assert.equal(res.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
// Never the full API CSP here: it would block PostHog and the Meta pixel.
assert.ok(!/script-src/.test(res.headers.get("content-security-policy") ?? ""));

console.log("page-security-headers: ok");
