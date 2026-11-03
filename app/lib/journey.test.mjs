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
assert.match(beacon, /const event = await readJourneyBeacon\(request\);/);
assert.match(beacon, /if \(!underDailyCap\(event\.visitorId, new Date\(\)\)\) return done\(\);\s*recordJourneyEvent\(event\);/);
assert.match(server, /sec-fetch-site/);
const client = readFileSync(`${APP}lib/journey-client.ts`, "utf8");
const pagesSrc = readFileSync(`${APP}lib/journey-pages.ts`, "utf8");
assert.match(pagesSrc, /navigator\.sendBeacon\("\/api\/journey"/);
assert.match(client, /sendJourney\(\{ cta: cta\.slice\(0, 64\), path, \.\.\.seen/);
assert.match(client, /trackMeta\("Lead"/);
assert.match(client, /readConsent\(\) === "denied"/);
assert.match(pagesSrc, /if \(readConsent\(\) === "denied"\) return;/, "page events follow clicked_join's consent rule");
const root = readFileSync(`${APP}root.tsx`, "utf8");
assert.match(root, /installJoinTracking\(\)/);
assert.match(root, /trackMetaPageView\(\)/, "PageView on every route change");
const authPage = readFileSync(`${APP}routes/auth._index.tsx`, "utf8");
assert.match(authPage, /trackSignedUpOnce\(\{ id: data\.user\.id/, "CompleteRegistration on email sign-up");

// ── 9. CompleteRegistration's event_id is reg_<userId> on both copies (the platform uses the same), guard kept.
const analytics = readFileSync(`${APP}lib/analytics.ts`, "utf8");
assert.match(analytics, /return `reg_\$\{userId\}`;/);
// META-FIX (B4): claimed once a person on the server first (both hosts), PostHog's signed_up with it; the per-user
// flag still guards this browser (meta-fix.test.mjs drives it).
assert.match(analytics, /claimMetaOnce\("CompleteRegistration", registrationEventId\(user\.id\), \{ posthog: true \}\)/);
assert.match(analytics, /if \(answer\.posthog !== false\) capturePostHog\("signed_up", \{ email: user\.email, name: user\.name \}\)/);
assert.match(analytics, /if \(localStorage\.getItem\(key\)\) return Promise\.resolve\(\);/, "the per-user signed_up flag");
const { registrationEventId } = await import("./analytics.ts").catch(() => ({}));
if (registrationEventId) assert.equal(registrationEventId("u_123"), "reg_u_123");

// ── 10. Short links (2 Nov 2026): /go/<slug> adds utm_id=<slug>; the site keeps it in the source cookies; a product
// destination gets the cookies on the redirect itself, a site destination from its own page render.
const tagged = visitSource(new URL("http://studojo.com/?utm_source=linkedin&utm_medium=post&utm_campaign=launch-nov26&utm_id=li-post-launch"), null, "studojo.com", NOW);
assert.equal(tagged.touch, true);
assert.equal(tagged.source.utm_id, "li-post-launch");
const idOnly = planCookies({ cookies: new Map(), url: new URL("http://studojo.com/?utm_id=x1"), referer: null, host: "studojo.com", domain: ".studojo.com", secure: true, now: NOW, newId: ID });
assert.equal(JSON.parse(decodeURIComponent(idOnly.setCookies[1].split(";")[0].slice("stu_src=".length))).utm_id, "x1", "utm_id in stu_src");
assert.equal(JSON.parse(decodeURIComponent(idOnly.setCookies[2].split(";")[0].slice("stu_lt=".length))).utm_id, "x1", "utm_id in stu_lt");
process.env.AUTH_COOKIE_DOMAIN = ".studojo.com";
const { journeyCookiesForRedirect } = await import("./journey.server.ts");
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const goReq = (headers) => new Request("https://studojo.com/go/li-dm", { headers: { host: "studojo.com", "user-agent": UA, ...headers } });
const toProduct = new URL("https://platform.studojo.com/join?utm_source=linkedin&utm_medium=dm&utm_campaign=launch-nov26&utm_id=li-dm");
const viaGo = journeyCookiesForRedirect(goReq({ referer: "https://www.linkedin.com/" }), toProduct);
assert.equal(viaGo.length, 3, "a product destination: all three cookies on the redirect");
assert.ok(viaGo.every((c) => c.includes("Domain=.studojo.com") && c.includes("Secure")));
const goSrc = JSON.parse(decodeURIComponent(viaGo[1].split(";")[0].slice("stu_src=".length)));
assert.equal(goSrc.utm_id, "li-dm");
assert.equal(goSrc.utm_medium, "dm");
assert.equal(goSrc.landing_path, "/join");
assert.equal(goSrc.referrer, "https://www.linkedin.com/");
assert.deepEqual(journeyCookiesForRedirect(goReq({}), new URL("https://studojo.com/?utm_id=li-dm")), [], "a site destination sets them on its own render");
assert.deepEqual(journeyCookiesForRedirect(goReq({ "user-agent": "facebookexternalhit/1.1" }), toProduct), [], "no cookies for crawlers");
const heldVid = journeyCookiesForRedirect(goReq({ cookie: `stu_vid=${ID}` }), toProduct);
assert.ok(heldVid.every((c) => !c.startsWith("stu_vid=")), "a held visitor id is kept");
const go = readFileSync(`${APP}routes/go.$slug.tsx`, "utf8");
assert.match(go, /target\.searchParams\.set\("utm_id", slug\)/);
assert.match(go, /journeyCookiesForRedirect\(request, target\)/);

// ── 11. visited_home once a visitor an IST day, across pods (QA-FIX, 2 Nov 2026: web runs 2 pods, and the per-process
// guard alone wrote a second row when the visitor's next landing page hit the other pod about 45 s later).
{
  const { firstToday, istDay, insertVisitedOnce, visitedLockKey, VISITED_ONCE_SQL } = await import("./journey.server.ts");
  assert.equal(istDay(new Date("2026-11-02T18:29:00Z")), "2026-11-02");
  assert.equal(istDay(new Date("2026-11-02T18:31:00Z")), "2026-11-03", "the day turns at IST midnight");
  const later = new Date(NOW.getTime() + 45_000);
  const podA = new Map();
  const podB = new Map();
  assert.equal(firstToday(ID, NOW, podA), true);
  assert.equal(firstToday(ID, later, podA), false, "a reload on the same pod stops in memory");
  assert.equal(firstToday(ID, later, podB), true, "the other pod's memory lets it through, so the database must hold it");
  // The database guard: lock, then insert only when that visitor has no visited_home since the IST day began.
  assert.match(VISITED_ONCE_SQL, /WHERE NOT EXISTS \(/);
  assert.match(VISITED_ONCE_SQL, /visitor_id = \$2 AND step = 'visited_home' AND env = \$1/);
  assert.match(VISITED_ONCE_SQL, /date_trunc\('day', now\(\) AT TIME ZONE 'Asia\/Kolkata'\) AT TIME ZONE 'Asia\/Kolkata'/);
  // A fake table shared by two pods, answering the INSERT the way Postgres does once the lock is held.
  const table = [];
  let clock = NOW;
  const pod = () => {
    const log = [];
    return {
      log,
      async query(sql, values = []) {
        if (sql === VISITED_ONCE_SQL) {
          log.push("INSERT");
          const [env, vid] = values;
          const day = istDay(clock);
          if (table.some((r) => r.env === env && r.vid === vid && r.day === day)) return { rowCount: 0 };
          table.push({ env, vid, day, props: JSON.parse(values[2]) });
          return { rowCount: 1 };
        }
        if (sql.includes("pg_advisory_xact_lock")) {
          log.push(`LOCK ${values[0]}`);
          return { rowCount: 1 };
        }
        log.push(sql);
        return { rowCount: null };
      },
    };
  };
  const ev = (path) => ({ env: "prod", visitorId: ID, step: "visited_home", props: { path }, source: null });
  const a = pod();
  const b = pod();
  assert.equal(await insertVisitedOnce(a, ev("/"), NOW), true, "the first landing writes the row");
  assert.deepEqual(a.log, ["BEGIN", `LOCK ${visitedLockKey(ID, "2026-11-02")}`, "INSERT", "COMMIT"], "one transaction, the lock first");
  clock = later;
  assert.equal(await insertVisitedOnce(b, ev("/blog"), later), false, "the other pod, 45 s later: no second row");
  assert.equal(table.length, 1);
  clock = new Date("2026-11-02T19:00:00Z");
  assert.equal(await insertVisitedOnce(b, ev("/"), clock), true, "the next IST day writes again");
  assert.equal(table.length, 2);
  // A database error rolls back and reaches the caller (insertVisited keeps it quiet).
  const failing = { log: [], async query(sql) { this.log.push(sql.split(" ")[0]); if (sql === VISITED_ONCE_SQL) throw Object.assign(new Error("x"), { code: "42P01" }); return {}; } };
  await assert.rejects(insertVisitedOnce(failing, ev("/"), NOW), { code: "42P01" });
  assert.deepEqual(failing.log.at(-1), "ROLLBACK");
  // The page render uses the cross-pod path, never the plain INSERT, for visited_home.
  const srv = readFileSync(`${APP}lib/journey.server.ts`, "utf8");
  assert.match(srv, /if \(!firstToday\(plan\.visitorId, now\)\) return;\s*recordVisitedHome\(/);
}

// ── 12. SITE-TRACK (3 Nov 2026, the owner: "how far they scrolled, how long they stayed, or what they looked at ...
// the device type isn't being saved"): device and in-app browser, the beacon allow-list, the daily cap, the wiring.
{
  const { BEACON_STEPS, cleanBeacon, deviceOf, inAppOf, scrollMilestone, widthBucket } = await import("./journey.ts");
  const IG_ANDROID = "Mozilla/5.0 (Linux; Android 13; SM-A536E Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.163 Mobile Safari/537.36 Instagram 309.0.0.40.113 Android (33/13; 450dpi; 1080x2177; samsung; SM-A536E; a53x; s5e8825; en_IN; 541635890)";
  const IG_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 307.0.0.34.111 (iPhone14,5; iOS 17_1; en_IN; en; scale=3.00; 1170x2532; 532277994)";
  const FB_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/440.0.0.33.116;FBBV/552000000;FBDV/iPhone14,5;FBMD/iPhone;FBSN/iOS;FBSV/17.1;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5]";
  const FB_ANDROID = "Mozilla/5.0 (Linux; Android 14; RMX3741 Build/UKQ1.230924.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.193 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/446.0.0.33.112;]";
  const LI_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 LinkedInApp/9.29.6";
  const LI_ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/UQ1A.240205.004; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/122.0.6261.64 Mobile Safari/537.36 LinkedInApp/4.1.912";
  const WA = "Mozilla/5.0 (Linux; Android 13; SM-A536E Build/TP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.0.0 Mobile Safari/537.36 WhatsApp/2.24.1.6";
  const SNAP = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Snapchat/12.60.0.43 (like Safari/8617.2.4.10.8, panda)";
  const WEBVIEW = "Mozilla/5.0 (Linux; Android 12; M2101K6G Build/SKQ1; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/118.0.0.0 Mobile Safari/537.36";
  const SAFARI = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
  const CHROME_ANDROID = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";
  const CHROME_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.6723.90 Mobile/15E148 Safari/604.1";
  const ANDROID_TAB = "Mozilla/5.0 (Linux; Android 13; SM-X200) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
  const IPAD = "Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";
  const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15";
  const WIN = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
  for (const [ua, device, inapp] of [
    [IG_ANDROID, "mobile", "instagram"],
    [IG_IOS, "mobile", "instagram"],
    [FB_IOS, "mobile", "facebook"],
    [FB_ANDROID, "mobile", "facebook"],
    [LI_IOS, "mobile", "linkedin"],
    [LI_ANDROID, "mobile", "linkedin"],
    [WA, "mobile", "whatsapp"],
    [SNAP, "mobile", "other"],
    [WEBVIEW, "mobile", "other"],
    [SAFARI, "mobile", "none"],
    [CHROME_ANDROID, "mobile", "none"],
    [CHROME_IOS, "mobile", "none"],
    [ANDROID_TAB, "tablet", "none"],
    [IPAD, "tablet", "none"],
    [MAC, "desktop", "none"],
    [WIN, "desktop", "none"],
    ["", "desktop", "none"],
  ]) {
    assert.equal(deviceOf(ua), device, `device: ${ua.slice(0, 70)}`);
    assert.equal(inAppOf(ua), inapp, `inapp: ${ua.slice(0, 70)}`);
  }
  assert.equal(deviceOf(MAC, true), "tablet", "an iPad asking for the desktop site says Mac, with a touch screen");
  assert.equal(deviceOf(WIN, true), "desktop", "a touch laptop is still a computer");

  // Width buckets and scroll milestones.
  assert.equal(widthBucket(320), 0);
  assert.equal(widthBucket(360), 360);
  assert.equal(widthBucket(375), 360);
  assert.equal(widthBucket(393), 390);
  assert.equal(widthBucket(430), 430);
  assert.equal(widthBucket(820), 768);
  assert.equal(widthBucket(1512), 1440);
  assert.equal(widthBucket(2560), 1920);
  for (const junk of [-1, NaN, Infinity, "390", null, undefined, 1e9]) assert.equal(widthBucket(junk), null, String(junk));
  assert.equal(scrollMilestone(700, 6000), 0, "the first screen of a long page");
  assert.equal(scrollMilestone(1500, 6000), 25);
  assert.equal(scrollMilestone(3000, 6000), 50);
  assert.equal(scrollMilestone(4700, 6000), 75);
  assert.equal(scrollMilestone(5999, 6000), 100, "the last 2 px are the end");
  assert.equal(scrollMilestone(800, 700), 100, "a page shorter than the screen");
  assert.equal(scrollMilestone(100, 0), 0);

  // The allow-list: the old clicked_join body still works; page_view and page_engaged keep only their own props.
  assert.deepEqual([...BEACON_STEPS], ["clicked_join", "page_view", "page_engaged"]);
  const PV = "8c1d6b8e-6a3f-4c1b-9b7e-1a2b3c4d5e6f";
  assert.deepEqual(cleanBeacon({ cta: "start_hero", path: "/" }), { step: "clicked_join", props: { cta: "start_hero", path: "/" }, touch: false });
  assert.deepEqual(
    cleanBeacon({ cta: "start_hero", path: "/", pv: PV, cta_seen: true, sw: 393, touch: true, email: "x@y.z" }),
    { step: "clicked_join", props: { cta: "start_hero", path: "/", pv: PV, cta_seen: true, sw: 390 }, touch: true },
  );
  assert.equal(cleanBeacon({ step: "signed_up", path: "/" }), null, "a step that is not the browser's");
  assert.equal(cleanBeacon({ step: "paid", cta: "x", path: "/" }), null);
  assert.equal(cleanBeacon({ step: "page_view", path: "/" }), null, "a page view has an id");
  assert.equal(cleanBeacon({ step: "page_view", pv: "<script>", path: "/" }), null);
  assert.equal(cleanBeacon({ step: "page_view", pv: PV, path: "https://evil.example/" }), null);
  assert.equal(cleanBeacon(null), null);
  assert.equal(cleanBeacon([]), null);
  assert.deepEqual(
    cleanBeacon({ step: "page_view", pv: PV, path: "/", title: "  Studojo\n | Stu ", nav: "load", ref: "https://l.instagram.com/?u=secret#x", sw: 412, extra: 1 }),
    { step: "page_view", props: { pv: PV, path: "/", title: "Studojo | Stu", nav: "load", ref: "https://l.instagram.com/", sw: 390 }, touch: false },
  );
  assert.deepEqual(
    cleanBeacon({ step: "page_view", pv: PV, path: "/blog", nav: "route", ref: "https://www.google.com/" }).props,
    { pv: PV, path: "/blog", nav: "route" },
    "the referrer on the load's page view only",
  );
  assert.equal(cleanBeacon({ step: "page_view", pv: PV, path: "/", nav: "teleport" }).props.nav, "load");
  assert.equal(cleanBeacon({ step: "page_view", pv: PV, path: "/", ref: "javascript:alert(1)" }).props.ref, undefined);
  assert.equal(cleanBeacon({ step: "page_view", pv: PV, path: "/", title: "x".repeat(500) }).props.title.length, 120);
  assert.deepEqual(
    cleanBeacon({ step: "page_engaged", pv: PV, path: "/", engaged_s: 42.4, scroll: 75, sections: ["hero", "how", "how", "Bad Name", 7, "proof"], cta_seen: true, cta_at: 0, clicked: "start_hero", why: "hidden", sw: 1300 }),
    { step: "page_engaged", props: { pv: PV, path: "/", engaged_s: 42, scroll: 75, sections: ["hero", "how", "proof"], cta_seen: true, cta_at: 0, clicked: "start_hero", why: "hidden", sw: 1280 }, touch: false },
  );
  const odd = cleanBeacon({ step: "page_engaged", pv: PV, path: "/", engaged_s: 1e9, scroll: 60, sections: "hero", cta_seen: false, cta_at: 5, clicked: "<x>", why: "?" }).props;
  assert.deepEqual(odd, { pv: PV, path: "/", engaged_s: 3600, scroll: 0, sections: [], cta_seen: false, why: "check" }, "clamped, and nothing that is not ours");
  assert.equal(cleanBeacon({ step: "page_engaged", pv: PV, path: "/", engaged_s: -4 }).props.engaged_s, 0);
  assert.equal(cleanBeacon({ step: "page_engaged", pv: PV, path: "/", sections: Array.from({ length: 40 }, (_, i) => `s${i}`) }).props.sections.length, 16);

  // One visitor's beacons an IST day: 200, then none until the next day.
  const { readJourneyBeacon, underDailyCap, VISITOR_DAILY_CAP } = await import("./journey.server.ts");
  assert.equal(VISITOR_DAILY_CAP, 200);
  const capState = { day: "", counts: new Map() };
  let let_through = 0;
  for (let i = 0; i < 250; i++) if (underDailyCap(ID, NOW, capState)) let_through++;
  assert.equal(let_through, 200);
  assert.equal(underDailyCap("another-visitor-1", NOW, capState), true, "per visitor");
  assert.equal(underDailyCap(ID, new Date("2026-11-02T19:00:00Z"), capState), true, "a new IST day");

  // The route's decision, request by request.
  const post = (body, { ua = IG_ANDROID, cookie = `stu_vid=${ID}`, site = "same-origin", host = "studojo.com" } = {}) =>
    readJourneyBeacon(
      new Request(`https://${host}/api/journey`, {
        method: "POST",
        headers: { host, "user-agent": ua, ...(cookie ? { cookie } : {}), ...(site ? { "sec-fetch-site": site } : {}), "content-type": "text/plain" },
        body: typeof body === "string" ? body : JSON.stringify(body),
      }),
    );
  const pvBody = { step: "page_view", pv: PV, path: "/", title: "Studojo", nav: "load", sw: 393 };
  const pvEvent = await post(pvBody);
  assert.deepEqual(pvEvent, {
    env: "prod",
    visitorId: ID,
    step: "page_view",
    props: { pv: PV, path: "/", title: "Studojo", nav: "load", sw: 390, device: "mobile", inapp: "instagram" },
    source: null,
  });
  assert.equal(await post(pvBody, { ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" }), null, "crawlers");
  assert.equal(await post(pvBody, { ua: `${MAC} StudojoAudit-bot/1.0` }), null, "our own audit walks");
  assert.equal(await post(pvBody, { ua: "" }), null, "no browser at all");
  assert.equal(await post(pvBody, { site: "cross-site" }), null, "another site's page");
  assert.equal(await post(pvBody, { cookie: "" }), null, "no visitor id");
  assert.equal(await post(pvBody, { cookie: "stu_vid=a;b" }), null);
  assert.equal(await post(pvBody, { cookie: `stu_vid=${ID}; sj_tracking_consent=denied` }), null, "said no to tracking");
  assert.ok(await post(pvBody, { cookie: `stu_vid=${ID}; sj_tracking_consent=granted` }), "said yes");
  assert.equal(await post("not json"), null);
  assert.equal(await post({ step: "page_view", path: "/" }), null);
  assert.equal((await post(pvBody, { host: "studojo.pro" })).env, "staging");
  assert.equal((await post({ ...pvBody, touch: true }, { ua: MAC })).props.device, "tablet", "an iPad in desktop mode");
  const lastTouch = encodeURIComponent(JSON.stringify({ utm_source: "instagram", landing_path: "/", first_seen_at: NOW.toISOString() }));
  const join = await post({ cta: "start_hero", path: "/", pv: PV, cta_seen: true }, { cookie: `stu_vid=${ID}; stu_lt=${lastTouch}`, ua: SAFARI });
  assert.equal(join.step, "clicked_join");
  assert.deepEqual(join.props, { cta: "start_hero", path: "/", pv: PV, cta_seen: true, device: "mobile", inapp: "none" });
  assert.equal(join.source.utm_source, "instagram", "clicked_join keeps its source");
  const engaged = await post({ step: "page_engaged", pv: PV, path: "/", engaged_s: 12, scroll: 50, sections: ["hero"], why: "check" }, { cookie: `stu_vid=${ID}; stu_lt=${lastTouch}` });
  assert.equal(engaged.source, null, "page rows carry no source (the visitor's visited_home has it)");
  assert.equal(engaged.props.device, "mobile");

  // visited_home now says the device too; the page render passes the user agent.
  assert.match(srvSrc(), /props: \{ path: url\.pathname\.slice\(0, 200\), \.\.\.deviceProps\(request\.headers\.get\("user-agent"\)\) \}/);

  // Wiring: root installs the page tracking on the site's own hosts and notes every route change.
  assert.match(root, /useEffect\(\(\) => \(pages \? installPageTracking\(\) : undefined\), \[pages\]\);/);
  assert.match(root, /if \(pages\) notePageView\(location\.pathname\);\n\s+\}, \[pages, location\.pathname\]\);/);
  assert.match(root, /journeyPages: isB2cRequest\(request\) && !isPlatformHost\(host\),/);
  assert.match(root, /<AnalyticsInit pages=\{journeyPages && !onSensei\} \/>/);
  // clicked_join carries the page view (journey-pages.ts noteJoinClick) before Meta and PostHog are told.
  assert.match(client, /const seen = noteJoinClick\(cta, cta\.startsWith\("start_"\)\);/);
}
function srvSrc() {
  return readFileSync(`${APP}lib/journey.server.ts`, "utf8");
}

console.log("journey: ok");
