// FIRST-PARTY JOURNEY (RELAUNCH, 2 Nov 2026): stu_vid, stu_src, stu_lt on the parent domain, visited_home and
// clicked_join into career_agent.career_journey_events (app/lib/journey.ts, journey.server.ts, journey-client.ts).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  cleanCta,
  cleanPath,
  cookieDomainFor,
  isJoinHref,
  isLandingPath,
  isPrefetch,
  journeyEnv,
  parseCookies,
  planCookies,
  readSource,
  serializeCookie,
  validVisitorId,
  visitSource,
} from "./journey.ts";

const NOW = new Date("2026-11-02T06:00:00.000Z");
const ID = "0b6f2c1e-9a52-4c1e-8d43-3f2b6a0e9c11";

// ── 1. Cookie domain: the parent domain only for hosts inside it.
assert.equal(cookieDomainFor("studojo.com", ".studojo.com"), ".studojo.com");
assert.equal(cookieDomainFor("platform.studojo.com", ".studojo.com"), ".studojo.com");
assert.equal(cookieDomainFor("studojo.pro", ".studojo.pro"), ".studojo.pro");
assert.equal(cookieDomainFor("studojo.pro:443", "studojo.pro"), ".studojo.pro");
assert.equal(cookieDomainFor("localhost:5173", ".studojo.com"), null, "local runs stay host-only");
assert.equal(cookieDomainFor("evilstudojo.com", ".studojo.com"), null);
assert.equal(cookieDomainFor("studojo.com", ""), null);

// ── 2. A first visit from an ad: all three cookies, the right lifetimes and flags.
const ad = planCookies({
  cookies: new Map(),
  url: new URL("http://studojo.com/?utm_source=test&utm_medium=qa&fbclid=abc&x=1"),
  referer: "https://l.facebook.com/l.php?u=secret",
  host: "studojo.com",
  domain: ".studojo.com",
  secure: true,
  now: NOW,
  newId: ID,
});
assert.equal(ad.visitorId, ID);
assert.equal(ad.setCookies.length, 3);
const [vid, src, lt] = ad.setCookies;
assert.equal(vid, `stu_vid=${ID}; Path=/; Max-Age=31536000; SameSite=Lax; Domain=.studojo.com; Secure`, "stu_vid is not HttpOnly");
assert.match(src, /^stu_src=[^;]+; Path=\/; Max-Age=7776000; SameSite=Lax; Domain=\.studojo\.com; Secure; HttpOnly$/);
assert.match(lt, /^stu_lt=[^;]+; Path=\/; Max-Age=2592000; SameSite=Lax; Domain=\.studojo\.com; Secure; HttpOnly$/);
const srcJson = JSON.parse(decodeURIComponent(src.split(";")[0].slice("stu_src=".length)));
assert.deepEqual(srcJson, {
  landing_path: "/",
  first_seen_at: NOW.toISOString(),
  utm_source: "test",
  utm_medium: "qa",
  fbclid: "abc",
  referrer: "https://l.facebook.com/l.php",
});
assert.deepEqual(ad.source, srcJson);

// ── 3. A later direct visit: nothing rewritten, the held last touch is the source.
const jar = parseCookies(ad.setCookies.map((c) => c.split(";")[0]).join("; "));
assert.equal(jar.get("stu_vid"), ID);
const direct = planCookies({ cookies: jar, url: new URL("http://studojo.com/blog"), referer: "https://studojo.com/", host: "studojo.com", domain: ".studojo.com", secure: true, now: NOW, newId: "other-id-123" });
assert.deepEqual(direct.setCookies, [], "set once; an internal referrer is not a touch");
assert.equal(direct.visitorId, ID);
assert.equal(direct.source.utm_source, "test");

// ── 4. A later tagged visit replaces stu_lt only.
const again = planCookies({ cookies: jar, url: new URL("http://studojo.com/reports/x?utm_source=linkedin"), referer: null, host: "studojo.com", domain: ".studojo.com", secure: true, now: NOW, newId: "other-id-123" });
assert.equal(again.setCookies.length, 1);
assert.match(again.setCookies[0], /^stu_lt=/);
assert.equal(again.source.utm_source, "linkedin");
assert.equal(again.source.landing_path, "/reports/x");

// ── 5. Google sign-in, payment gateways and our own hosts are not referrers; a junk stu_vid is replaced.
for (const ref of ["https://accounts.google.com/", "https://platform.studojo.com/join", "https://checkout.dodopayments.com/x"]) {
  assert.equal(visitSource(new URL("http://studojo.com/"), ref, "studojo.com", NOW).touch, false, ref);
}
assert.equal(visitSource(new URL("http://studojo.com/"), "https://www.google.com/", "studojo.com", NOW).source.referrer, "https://www.google.com/");
assert.equal(validVisitorId("<script>"), false);
assert.equal(validVisitorId(ID), true);
const junk = planCookies({ cookies: new Map([["stu_vid", "a;b"]]), url: new URL("http://studojo.pro/"), referer: null, host: "studojo.pro", domain: ".studojo.pro", secure: true, now: NOW, newId: ID });
assert.equal(junk.visitorId, ID);
assert.equal(readSource("not json"), null);
assert.equal(readSource(JSON.stringify({ utm_source: "x" })), null, "a source has landing_path and first_seen_at");
assert.equal(serializeCookie("a", "b", { maxAge: 1, domain: null, secure: false, httpOnly: false }), "a=b; Path=/; Max-Age=1; SameSite=Lax");

// ── 6. Where visited_home is written, prefetches, env.
for (const p of ["/", "/blog", "/blog/some-post", "/reports", "/reports/ghost-jobs-2026"]) assert.equal(isLandingPath(p), true, p);
for (const p of ["/auth", "/privacy", "/blogger", "/b2cnew"]) assert.equal(isLandingPath(p), false, p);
assert.equal(isPrefetch(new Headers({ "sec-purpose": "prefetch;prerender" })), true);
assert.equal(isPrefetch(new Headers({ purpose: "prefetch" })), true);
assert.equal(isPrefetch(new Headers({ "x-moz": "prefetch" })), true);
assert.equal(isPrefetch(new Headers({})), false);
assert.equal(journeyEnv("studojo.pro"), "staging");
assert.equal(journeyEnv("platform.studojo.pro"), "staging");
assert.equal(journeyEnv("studojo.com"), "prod");

// ── 7. Join CTAs.
const PO = "https://platform.studojo.com";
const HERE = "https://studojo.com";
assert.equal(isJoinHref(`${PO}/join?via=home&how=voice`, HERE, PO), true);
assert.equal(isJoinHref(`${PO}/`, HERE, PO), false, "open my jobs is not a join");
assert.equal(isJoinHref("/b2cnew/join?via=site", HERE, ""), true);
assert.equal(isJoinHref("/auth?redirect=%2Fb2cnew%2Fstart%3Ffresh", HERE, PO), true, "the sign-up card");
assert.equal(isJoinHref("/auth?mode=signin&redirect=%2Fb2cnew", HERE, PO), false, "the header's sign in");
assert.equal(isJoinHref("/blog", HERE, PO), false);
assert.equal(isJoinHref("https://evil.example/join", HERE, PO), false);
assert.equal(cleanCta("start_hero"), "start_hero");
assert.equal(cleanCta("<x>"), null);
assert.equal(cleanPath("/reports/x"), "/reports/x");
assert.equal(cleanPath("https://x"), null);

// ── 8. Wiring: the page render sets the cookies, the beacon route exists, the INSERT is safe.
const APP = new URL("../", import.meta.url).pathname;
const entry = readFileSync(`${APP}entry.server.tsx`, "utf8");
assert.match(entry, /journeyOnPage\(request, responseHeaders\)/);
assert.ok(entry.indexOf("journeyOnPage(request") > entry.indexOf('=== "HEAD"'), "HEAD returns before the cookies");
const server = readFileSync(`${APP}lib/journey.server.ts`, "utf8");
assert.match(server, /career_agent\.career_journey_events/);
assert.match(server, /"42P01"/, "a missing table is skipped quietly");
assert.match(server, /void insert\(e\)\.catch/, "never awaited by a page");
const beacon = readFileSync(`${APP}routes/api.journey.tsx`, "utf8");
assert.match(beacon, /step: "clicked_join"/);
assert.match(beacon, /sec-fetch-site/);
const client = readFileSync(`${APP}lib/journey-client.ts`, "utf8");
assert.match(client, /sendBeacon\("\/api\/journey"/);
assert.match(client, /trackMeta\("Lead"/);
assert.match(client, /readConsent\(\) === "denied"/);
const root = readFileSync(`${APP}root.tsx`, "utf8");
assert.match(root, /installJoinTracking\(\)/);
assert.match(root, /trackMetaPageView\(\)/, "PageView on every route change");
const authPage = readFileSync(`${APP}routes/auth._index.tsx`, "utf8");
assert.match(authPage, /trackSignedUpOnce\(\{ id: data\.user\.id/, "CompleteRegistration on email sign-up");

console.log("journey: ok");
