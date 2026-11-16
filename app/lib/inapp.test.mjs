// INAPP (4 Nov 2026, the owner: "for the users tapping inside Instagram or Facebook, inside of the built-in browser,
// instead redirect them to use it directly on Chrome or Safari"): app/lib/inapp.ts with real user agents (which app,
// the os, the escape's addresses and words), the three journey beacons (journey.ts cleanBeacon), and the wiring of
// components/inapp/InAppEscape.tsx (root.tsx, the call starts it stops, the copy).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ARRIVE_CARD, ARRIVE_KEY, bannerCopy, bannerFor, browserIntentUrl, CARRY_MAX_AGE_MS, CARRY_VISITOR_KEY, cardArrivalUrl, chromeIntentUrl, homepageStart, gateHow, igExtBrowserUrl, instagramGateOs, ESCAPE_KEY, escapeCopy, escapePlan, escapeUrl, hasEscapeMark, inAppOf, INAPP_APPS, iosMajor, osOf, safariUrl, typedSignIn,
  withoutEscapeMark,
} from "./inapp.ts";
import { BEACON_STEPS, cleanBeacon } from "./journey.ts";
import { homeSignIn, joinHref } from "../components/home-v3/agent.ts";

const IG_ANDROID = "Mozilla/5.0 (Linux; Android 13; SM-A536E Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.163 Mobile Safari/537.36 Instagram 309.0.0.40.113 Android (33/13; 450dpi; 1080x2177; samsung; SM-A536E; a53x; s5e8825; en_IN; 541635890)";
const IG_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 307.0.0.34.111 (iPhone14,5; iOS 17_1; en_IN; en; scale=3.00; 1170x2532; 532277994)";
const IG_IOS16 = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 302.0.0.23.114 (iPhone12,1; iOS 16_6_1; en_GB; en; scale=2.00; 828x1792; 521431125)";
const FB_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/440.0.0.33.116;FBBV/552000000;FBDV/iPhone14,5;FBMD/iPhone;FBSN/iOS;FBSV/17.1;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5]";
const FB_ANDROID = "Mozilla/5.0 (Linux; Android 14; RMX3741 Build/UKQ1.230924.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.193 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/446.0.0.33.112;]";
const MSG_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/MessengerForiOS;FBAV/443.0.0.31.112;FBBV/553178627;FBDV/iPhone13,2;FBMD/iPhone;FBSN/iOS;FBSV/17.2;FBSS/3;FBCR/;FBID/phone;FBLC/en_US;FBOP/5]";
const MSG_ANDROID = "Mozilla/5.0 (Linux; Android 13; SM-S911B Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.144 Mobile Safari/537.36 [FB_IAB/Orca-Android;FBAV/441.0.0.18.109;]";
const LI_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 LinkedInApp/9.29.6";
const LI_ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/UQ1A.240205.004; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/122.0.6261.64 Mobile Safari/537.36 LinkedInApp/4.1.912";
const TT_ANDROID = "Mozilla/5.0 (Linux; Android 12; 2201117PI Build/SKQ1.211006.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.193 Mobile Safari/537.36 trill_2023201030 JsSdk/1.0 NetType/WIFI Channel/googleplay AppName/musical_ly app_version/32.1.3 ByteLocale/en ByteFullLocale/en Region/IN BytedanceWebview/d8a21c6";
const TT_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_32.5.0 JsSdk/2.0 NetType/WIFI Channel/App Store ByteLocale/en Region/US RevealType/Dialog isDarkMode/0 WKWebView/1 BytedanceWebview/d8a21c6";
const SNAP = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Snapchat/12.60.0.43 (like Safari/8617.2.4.10.8, panda)";
const WA = "Mozilla/5.0 (Linux; Android 13; SM-A536E Build/TP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.0.0 Mobile Safari/537.36 WhatsApp/2.24.1.6";
const WEBVIEW = "Mozilla/5.0 (Linux; Android 12; M2101K6G Build/SKQ1; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/118.0.0.0 Mobile Safari/537.36";
const GSA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/290.0.584508049 Mobile/15E148 Safari/604.1";
const WECHAT = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.44(0x18002c2f) NetType/WIFI Language/en";
const SAFARI = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const CHROME_ANDROID = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";
const CHROME_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.6723.90 Mobile/15E148 Safari/604.1";
const SAMSUNG = "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36";
const IPAD = "Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";
const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15";
const WIN = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

// ── 1. Which app's browser, and the os, from real user agents; a real browser is none.
for (const [ua, app, os] of [
  [IG_ANDROID, "instagram", "android"],
  [IG_IOS, "instagram", "ios"],
  [FB_IOS, "facebook", "ios"],
  [FB_ANDROID, "facebook", "android"],
  [MSG_IOS, "messenger", "ios"],
  [MSG_ANDROID, "messenger", "android"],
  [LI_IOS, "linkedin", "ios"],
  [LI_ANDROID, "linkedin", "android"],
  [TT_ANDROID, "tiktok", "android"],
  [TT_IOS, "tiktok", "ios"],
  [SNAP, "snapchat", "ios"],
  [WA, "whatsapp", "android"],
  [WEBVIEW, "other-webview", "android"],
  [GSA, "other-webview", "ios"],
  [WECHAT, "other-webview", "ios"],
  [SAFARI, "none", "ios"],
  [CHROME_ANDROID, "none", "android"],
  [CHROME_IOS, "none", "ios"],
  [SAMSUNG, "none", "android"],
  [IPAD, "none", "ios"],
  [MAC, "none", "other"],
  [WIN, "none", "other"],
  ["", "none", "other"],
]) {
  assert.equal(inAppOf(ua), app, `app: ${ua.slice(0, 80)}`);
  assert.equal(osOf(ua), os, `os: ${ua.slice(0, 80)}`);
}
assert.equal(osOf(MAC, true), "ios", "an iPad asking for the desktop site");
assert.equal(iosMajor(IG_IOS), 17);
assert.equal(iosMajor(IG_IOS16), 16);
assert.equal(iosMajor(IG_ANDROID), null);

// ── 2. The plan: Chrome by intent in Meta's apps on Android, Safari on iOS 17 and later outside Meta's apps, the sheet
// everywhere else.
assert.equal(escapePlan(SAFARI), null);
assert.equal(escapePlan(CHROME_ANDROID), null);
assert.equal(escapePlan(WIN), null);
assert.deepEqual(escapePlan(IG_ANDROID), { app: "instagram", os: "android", auto: "intent", button: "intent", sure: true, browser: "Chrome" });
assert.deepEqual(escapePlan(FB_ANDROID), { app: "facebook", os: "android", auto: "intent", button: "intent", sure: true, browser: "Chrome" });
assert.equal(escapePlan(MSG_ANDROID).auto, "intent");
assert.deepEqual(escapePlan(LI_ANDROID), { app: "linkedin", os: "android", auto: null, button: "intent", sure: true, browser: "Chrome" });
assert.deepEqual(escapePlan(WEBVIEW), { app: "other-webview", os: "android", auto: null, button: null, sure: false, browser: "Chrome" });
assert.deepEqual(escapePlan(IG_IOS), { app: "instagram", os: "ios", auto: "igext", button: "igext", sure: true, browser: "Safari" }, "IG-TAP: Instagram's own instagram://extbrowser (Meta's browser drops x-safari-https)");
for (const ua of [FB_IOS, MSG_IOS]) assert.deepEqual([escapePlan(ua).auto, escapePlan(ua).button], [null, null], ua);
assert.deepEqual(escapePlan(LI_IOS), { app: "linkedin", os: "ios", auto: "safari", button: "safari", sure: true, browser: "Safari" }, "other apps still try Safari");
assert.deepEqual(escapePlan(IG_IOS16), { app: "instagram", os: "ios", auto: "igext", button: "igext", sure: true, browser: "Safari" }, "iOS 16 in Instagram: extbrowser too");
assert.equal(escapePlan(WA).sure, false);

// ── 3. The addresses keep the whole query; the fallback is marked so the product's /join shows the steps, never loops.
{
  const href = "https://platform.studojo.com/join?utm_source=ig&utm_medium=paid&fbclid=IwAR0x_y&via=home&how=voice";
  const intent = chromeIntentUrl(href);
  assert.ok(intent.startsWith("intent://platform.studojo.com/join?utm_source=ig&utm_medium=paid&fbclid=IwAR0x_y&via=home&how=voice#Intent;"), intent);
  assert.match(intent, /;scheme=https;package=com\.android\.chrome;S\.browser_fallback_url=/);
  assert.ok(intent.endsWith(";end"));
  const fb = decodeURIComponent(/S\.browser_fallback_url=([^;]+)/.exec(intent)[1]);
  assert.equal(fb, `${href}&${ESCAPE_KEY}=1`);
  assert.ok(hasEscapeMark(new URL(fb).search));
  assert.equal(withoutEscapeMark(fb), href);
  assert.equal(safariUrl(href), "x-safari-https://platform.studojo.com/join?utm_source=ig&utm_medium=paid&fbclid=IwAR0x_y&via=home&how=voice");
  assert.equal(escapeUrl("intent", href), intent);
  // The homepage's own start link, as the hero draws it from an Instagram ad's landing.
  const start = new URL(joinHref("?utm_source=ig&utm_campaign=nov&fbclid=abc"), "https://studojo.com").toString();
  assert.match(safariUrl(start), /^x-safari-https:\/\/studojo\.com\/b2cnew\/join\?utm_source=ig&utm_campaign=nov&fbclid=abc&via=home&how=voice$/);
}

// ── 4. The words: the app by name, its own steps, Safari on iPhone and Chrome on Android, short, no dashes.
{
  const ig = escapeCopy(escapePlan(IG_IOS));
  assert.equal(ig.title, "Open this in Safari to talk to Stu");
  assert.equal(ig.lead, "Instagram's browser can't use your microphone, so the call can't start here.");
  assert.deepEqual(ig.steps, ["Tap ••• at the top right.", "Tap Open in external browser."]);
  assert.equal(ig.copy, "Or copy the link and paste it into Safari.");
  const iga = escapeCopy(escapePlan(IG_ANDROID));
  assert.equal(iga.title, "Open this in Chrome to talk to Stu");
  assert.deepEqual(iga.steps, ["Tap ⋮ at the top right.", "Tap Open in Chrome."]);
  assert.equal(escapeCopy(escapePlan(FB_ANDROID)).lead, "Facebook's browser can't use your microphone, so the call can't start here.");
  assert.equal(escapeCopy(escapePlan(WEBVIEW)).lead, "This app's browser can't use your microphone, so the call can't start here.");
  for (const ua of [IG_ANDROID, IG_IOS, FB_IOS, FB_ANDROID, MSG_IOS, LI_IOS, LI_ANDROID, TT_IOS, TT_ANDROID, SNAP, WA, WEBVIEW, GSA]) {
    const w = escapeCopy(escapePlan(ua));
    for (const line of [w.title, w.lead, w.copy, ...w.steps]) {
      assert.doesNotMatch(line, /[\u2013\u2014]/, line);
      assert.ok(line.length <= 90, line);
    }
  }
}

// ── 5. "Set up by typing instead": the sign-up card's link, back to the typed setup, the visit's keys kept.
{
  const typed = typedSignIn(homeSignIn("?utm_source=ig&fbclid=abc"));
  const u = new URL(typed, "https://studojo.com");
  assert.equal(u.pathname, "/auth");
  assert.equal(u.searchParams.get("redirect"), "/b2cnew/start?typed&fresh&utm_source=ig&fbclid=abc&via=home&how=voice");
  assert.equal(u.searchParams.get("fbclid"), "abc");
  assert.equal(typedSignIn("/blog"), "/blog");
}

// ── 6. The journey's three beacons: the app and os from short lists, nothing else; the server adds device and inapp.
{
  for (const s of ["inapp_seen", "inapp_escape_tried", "inapp_escape_sheet"]) assert.ok(BEACON_STEPS.includes(s), s);
  assert.deepEqual(cleanBeacon({ step: "inapp_seen", path: "/", app: "instagram", os: "ios", cta: "start_hero" }), { step: "inapp_seen", props: { path: "/", app: "instagram", os: "ios" }, touch: false });
  assert.deepEqual(
    cleanBeacon({ step: "inapp_escape_tried", path: "/", app: "facebook", os: "android", how: "intent", why: "timeout", cta: "start_hero", sw: 393, email: "x@y.z" }),
    { step: "inapp_escape_tried", props: { path: "/", app: "facebook", os: "android", cta: "start_hero", how: "intent", sw: 390 }, touch: false },
  );
  assert.deepEqual(
    cleanBeacon({ step: "inapp_escape_sheet", path: "/blog", app: "other-webview", os: "android", why: "timeout", how: "intent", cta: "join" }).props,
    { path: "/blog", app: "other-webview", os: "android", cta: "join", why: "timeout" },
  );
  assert.equal(cleanBeacon({ step: "inapp_seen", path: "/", app: "myspace" }), null, "an app that is not ours");
  assert.equal(cleanBeacon({ step: "inapp_seen", path: "/" }), null);
  assert.equal(cleanBeacon({ step: "inapp_seen", path: "https://evil.example/", app: "instagram" }), null);
  assert.deepEqual(cleanBeacon({ step: "inapp_escape_sheet", path: "/", app: "tiktok", os: "beos", why: "because", how: "x" }).props, { path: "/", app: "tiktok" });
  for (const a of INAPP_APPS) assert.ok(cleanBeacon({ step: "inapp_seen", path: "/", app: a }), a);
}

// ── 6b. INAPP-BANNER (16 Nov 2026): the default browser's intent, where the bar shows, and its words.
{
  const href = "https://studojo.com/?utm_source=ig&fbclid=abc&esc=1";
  const u = browserIntentUrl(href);
  assert.equal(u, "intent://studojo.com/?utm_source=ig&fbclid=abc#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end");
  assert.doesNotMatch(u, /package=/, "no app named: Android picks the default browser");
  assert.equal(escapeUrl("browser", href), u);
  assert.equal(bannerFor(escapePlan(IG_ANDROID, true)), true);
  assert.equal(bannerFor(escapePlan(IG_IOS, true)), true);
  assert.equal(bannerFor(escapePlan(FB_IOS, true)), true);
  assert.equal(bannerFor(escapePlan("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15")), false, "a real browser");
  assert.deepEqual(bannerCopy(escapePlan(IG_ANDROID, true)), { title: "You're in Instagram's browser", lead: "Google sign-in and the call with Stu work best in Chrome.", button: "Open in Chrome" });
  assert.deepEqual(bannerCopy(escapePlan(IG_IOS, true)), { title: "You're in Instagram's browser", lead: "Google sign-in and the call with Stu work best in Safari.", button: "Open in Safari" });
  for (const w of Object.values(bannerCopy(escapePlan(IG_IOS, true)))) assert.doesNotMatch(w, /[\u2013\u2014]/, "no dashes");
  // IG-GATE: Instagram's browser on a phone only; Facebook's, a real browser and a computer never.
  assert.equal(instagramGateOs(IG_IOS), "ios");
  assert.equal(instagramGateOs(IG_IOS16), "ios");
  assert.equal(instagramGateOs(IG_ANDROID), "android");
  assert.equal(instagramGateOs(FB_IOS), null);
  assert.equal(instagramGateOs(FB_ANDROID), null);
  assert.equal(instagramGateOs("Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1"), null);
  assert.equal(instagramGateOs(null), null);
  // IG-CARD: a homepage start lands on the homepage's sign-up card in the phone's browser, the visit's keys kept.
  assert.equal(cardArrivalUrl("https://studojo.pro/blog/x?utm_source=ig&fbclid=a1&esc=1#stu"), "https://studojo.pro/?utm_source=ig&fbclid=a1&stu=card");
  assert.equal(`${ARRIVE_KEY}=${ARRIVE_CARD}`, "stu=card");
  // ESC-TRACK: the app browser's visitor id rides along as ?sv=<id>.<the tap's ms in base 36>; none, none (and an old
  // one in the address is dropped).
  assert.equal(CARRY_VISITOR_KEY, "sv");
  const TAP_MS = 1_794_841_357_296;
  assert.equal(
    cardArrivalUrl("https://studojo.com/?utm_content=120254173597630472&fbclid=a1", "4f1c2b9e-6a7d-4e1f-9a3b-2c5d8e7f0a11", TAP_MS),
    `https://studojo.com/?utm_content=120254173597630472&fbclid=a1&stu=card&sv=4f1c2b9e-6a7d-4e1f-9a3b-2c5d8e7f0a11.${TAP_MS.toString(36)}`,
  );
  assert.equal(cardArrivalUrl("https://studojo.com/?fbclid=a1&sv=someone-elses-id"), "https://studojo.com/?fbclid=a1&stu=card");
  assert.equal(cardArrivalUrl("https://studojo.com/?fbclid=a1", null), "https://studojo.com/?fbclid=a1&stu=card");
  assert.equal(CARRY_MAX_AGE_MS, 30 * 60 * 1000, "good for half an hour: a link copied later carries nobody");
  for (const c of ["start_hero", "start_bar", "start_footer", "signup_google", "signup_email"]) assert.equal(homepageStart(c), true, c);
  for (const c of ["join", "join_report-x"]) assert.equal(homepageStart(c), false, c);
  assert.equal(gateHow("ios", ""), "igext");
  assert.equal(gateHow("android", "?utm_source=ig"), "intent");
  assert.equal(gateHow("android", "?utm_source=ig&esc=1"), "browser", "Chrome missing: the default browser");
  // INAPP-IGEXT: Instagram's own way out, the page's whole address (the escape's mark left off).
  assert.equal(igExtBrowserUrl("https://studojo.pro/?utm_source=ig&esc=1"), "instagram://extbrowser/?url=https%3A%2F%2Fstudojo.pro%2F%3Futm_source%3Dig");
  assert.equal(escapeUrl("igext", "https://studojo.pro/"), "instagram://extbrowser/?url=https%3A%2F%2Fstudojo.pro%2F");
}

// ── 7. The wiring: root.tsx on the site's own hosts; the call starts it stops; the sheet's copy.
{
  const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
  const root = read("root.tsx");
  assert.match(root, /\{journeyPages && !onSensei && !projectPage && <InAppEscape gated=\{Boolean\(gate\)\} \/>\}/);
  // IG-GATE (16 Nov 2026): Instagram's browser gets the one page, decided by the server from the user agent; no notices on it.
  assert.match(root, /igGate: isB2cRequest\(request\) && !isPlatformHost\(host\) \? instagramGateOs\(request\.headers\.get\("user-agent"\)\) : null/);
  assert.match(root, /const gate = IG_GATE_ON && journeyPages && !onSensei && !projectPage && !gateSkipped \? igGate : null;/);
  assert.match(read("components/inapp/IgGate.tsx"), /export const IG_GATE_ON = false;/, "IG-TAP: no extra page");
  assert.match(root, /\{gate \? <IgGate os=\{gate\} onSkip=\{skipGate\} \/> : <Outlet \/>\}/);
  assert.match(root, /\{!gate && !onSensei && !projectPage && <CookieNotice \/>\}/);
  const gateSrc = read("components/inapp/IgGate.tsx");
  assert.match(gateSrc, /Use your phone&apos;s browser to access Studojo/);
  assert.match(gateSrc, /Continue here anyway/, "nobody is ever stuck");
  assert.match(gateSrc, /cta: "gate"/);
  const esc = read("components/inapp/InAppEscape.tsx");
  // INAPP-STAY: /auth's older "open in your browser" prompt is off too (calls stay in the app's browser).
  assert.match(read("routes/auth._index.tsx"), /const IN_APP_PROMPT_ON = false;[\s\S]*\{IN_APP_PROMPT_ON && inApp && /);
  // INAPP-OFF: the owner switched the escape off to try the call in Instagram's browser; inapp_seen is still sent first.
  assert.match(esc, /const ESCAPE_ON = false;/);
  // INAPP-BANNER (16 Nov 2026): the bar on, Android's tap escape on, and nothing more where neither applies.
  assert.match(esc, /const BANNER_ON = false;/, "IG-GATE: no banner");
  assert.match(esc, /if \(gated\) return;/, "under the gate only inapp_seen");
  assert.match(esc, /const ANDROID_TAP_ESCAPE = true;/);
  assert.match(esc, /const tapEscape =\s*ESCAPE_ON \|\| \(ANDROID_TAP_ESCAPE && plan\.os === "android" && plan\.auto === "intent"\) \|\| \(IG_TAP_ESCAPE && plan\.app === "instagram" && plan\.auto !== null\);/);
  // IG-TAP (16 Nov 2026): in Instagram's browser a call start leaves for the phone's browser, on both phones.
  assert.match(esc, /const IG_TAP_ESCAPE = true;/);
  assert.match(esc, /const dest = \(t: Target\) => withHeld\(homepageStart\(t\.cta\) \? cardArrivalUrl\(window\.location\.href, heldVisitorId\(\)\) : t\.href\);/);
  // ESC-TRACK (16 Nov 2026): the visitor id read from stu_vid, only one journey.ts would accept.
  assert.match(esc, /const vid = parseCookies\(document\.cookie\)\.get\(VISITOR_COOKIE\);\s*return validVisitorId\(vid\) \? vid : null;/);
  // The arrival sends no second Lead, from the moment the join tracking is installed.
  const jc = read("lib/journey-client.ts");
  assert.match(jc, /installed = true;\s*settleEscapeArrival\(\);/);
  assert.match(jc, /get\(ARRIVE_KEY\) === ARRIVE_CARD\) sessionStorage\.setItem\(LEAD_SENT, "1"\);/);
  assert.match(esc, /window\.location\.href = escapeUrl\(how, dest\(t\)\);/);
  const startSrc = read("components/home-v3/start.tsx");
  assert.match(startSrc, /new URLSearchParams\(search\)\.get\(ARRIVE_KEY\) === ARRIVE_CARD/);
  assert.match(startSrc, /if \(signedIn\) return;\s*go\("signup"\);\s*openCall\(null\);/, "the card at once, signed out only");
  assert.match(esc, /step: "inapp_seen"[\s\S]{0,1200}if \(!ESCAPE_ON && !tapEscape && !showBanner && !noChrome\) return;/);
  assert.match(esc, /if \(banner\.os === "android" && banner\.auto\) a\.escape\(t, banner\.auto\);\s*else if \(IOS_IG_EXTBROWSER && banner\.os === "ios" && banner\.app === "instagram"\) a\.escape\(t, "igext"\);\s*else a\.sheet\(t, "manual"\);/, "Android: Chrome; iPhone in Instagram: extbrowser, then the steps");
  assert.match(esc, /else escape\(here, "browser"\);/, "no Chrome: the default browser once");
  assert.match(esc, /\{banner && <Banner plan=\{banner\} onOpen=\{fromBanner\} onHide=\{hideBanner\} \/>\}/);
  // The card's buttons, then any link to the product's /join or /start (not /auth); the takeover's handler is stopped,
  // clicked_join (same node, capture) is not.
  assert.match(esc, /closest<HTMLElement>\("\[data-signin\]"\)/);
  assert.match(esc, /closest\("\[data-join-card\]"\)/);
  assert.match(esc, /isJoinHref\(raw, window\.location\.origin, productOrigin\(\)\)/);
  assert.match(esc, /=== "\/auth"\) return null/);
  assert.match(esc, /e\.preventDefault\(\);\s*e\.stopPropagation\(\);/);
  assert.doesNotMatch(esc, /stopImmediatePropagation/, "clicked_join on the same node must still run");
  assert.match(esc, /document\.addEventListener\("click", onClick, true\)/);
  assert.match(esc, /const ESCAPE_WAIT_MS = 1_500;/);
  assert.match(esc, /Can&apos;t talk right now\? Set up by typing instead/);
  assert.match(esc, /Try here anyway/);
  assert.match(esc, /\(!plan\.sure \|\| plan\.app === "instagram"\) &&/, "Try here anyway where the app is a guess, and in Instagram after a failed escape");
  // The homepage's start link is a link to /join, so the listener sees it (start.tsx StartLink).
  assert.match(read("components/home-v3/start.tsx"), /href=\{a\.href\}[\s\S]{0,200}data-start=\{place\}/);
}

console.log("inapp: detection, the escape plan and addresses, the words, the typed link, the beacons and the wiring hold");

