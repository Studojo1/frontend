// EX-08 / VS-V09 / VS-V01 / EX-06 / EX-07: the pure helpers behind signup
// attribution. The Google sign-in return (accounts.google.com) and payment
// gateway returns were counted as referral sources and overwrote the held
// direct first touch; the header on /auth dropped the redirect.
import assert from "node:assert/strict";
import { buildFbc, carriesTrackingParams, isExternalReferrer, trackingParams, withHeldTracking } from "./attribution.ts";
import { authUrl } from "./return-to.ts";
import { chromeIntentUrl, detectInAppBrowser } from "./in-app-browser.ts";

const HOST = "studojo.com";

// Internal hops are not sources.
for (const ref of [
  "",
  "https://accounts.google.com/",
  "https://accounts.google.com/o/oauth2/v2/auth?client_id=x",
  "https://accounts.google.co.in/",
  "https://studojo.com/outreach",
  "https://www.studojo.com/",
  "https://studojo.pro/auth",
  "https://api.razorpay.com/v1/checkout",
  "https://checkout.razorpay.com/",
  "https://checkout.dodopayments.com/buy/x",
  "https://test.checkout.dodopayments.com/",
  "not a url",
]) assert.equal(isExternalReferrer(ref, HOST), false, ref);
assert.equal(isExternalReferrer("http://localhost:5173/x", "localhost:5173"), false);

// Real sources still count.
for (const ref of [
  "https://www.google.com/",
  "https://l.instagram.com/?u=x",
  "https://www.linkedin.com/",
  "https://notstudojo.com/",
  "https://studojo.com.evil.io/",
]) assert.equal(isExternalReferrer(ref, HOST), true, ref);

assert.equal(
  trackingParams("?fbclid=abc&utm_source=ig&foo=1").toString(),
  "fbclid=abc&utm_source=ig",
);

// VS-V01: a link built on /auth keeps the redirect the page carries.
assert.equal(
  authUrl("signup", "/auth?redirect=%2Foutreach%2Fonboarding%2Fupload&mode=signin"),
  "/auth?mode=signup&redirect=%2Foutreach%2Fonboarding%2Fupload",
);
assert.equal(authUrl("signin", "/auth?mode=signup"), "/auth?mode=signin");
assert.equal(authUrl("signin", "/auth?redirect=%2F%2Fevil.com"), "/auth?mode=signin");
assert.equal(authUrl("signin", "/auth?redirect=%2Fauth%3Fredirect%3D%2Fx"), "/auth?mode=signin");
assert.equal(authUrl("signup", "/pricing"), "/auth?mode=signup&redirect=%2Fpricing");
assert.equal(authUrl("signup", "/"), "/auth?mode=signup");
assert.equal(authUrl("signup", "//evil.com"), "/auth?mode=signup");
assert.equal(authUrl("signup"), "/auth?mode=signup");
// VS-V09: the ad click rides along onto /auth.
assert.equal(
  authUrl("signup", "/outreach?fbclid=abc&utm_campaign=c1"),
  "/auth?mode=signup&redirect=%2Foutreach%3Ffbclid%3Dabc%26utm_campaign%3Dc1&fbclid=abc&utm_campaign=c1",
);
assert.equal(
  authUrl("signup", "/auth?redirect=%2Fx&fbclid=abc"),
  "/auth?mode=signup&redirect=%2Fx&fbclid=abc",
);

// EX-06: Meta in-app browsers.
const IG_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 339.0.3.12.108";
const IG_ANDROID = "Mozilla/5.0 (Linux; Android 14; SM-S918B Build/UP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0 Mobile Safari/537.36 Instagram 340.0.0.22.109 Android";
const FB_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0.0.40.108;FBBV/1]";
const FB_ANDROID = "Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/470.0.0.40.108;]";
const SAFARI = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const CHROME = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36";
assert.equal(detectInAppBrowser(IG_IOS), "instagram");
assert.equal(detectInAppBrowser(IG_ANDROID), "instagram");
assert.equal(detectInAppBrowser(FB_IOS), "facebook");
assert.equal(detectInAppBrowser(FB_ANDROID), "facebook");
assert.equal(detectInAppBrowser(SAFARI), null);
assert.equal(detectInAppBrowser(CHROME), null);
assert.equal(detectInAppBrowser(""), null);
assert.equal(detectInAppBrowser(undefined), null);

const intent = chromeIntentUrl("https://studojo.com/auth?mode=signup&fbclid=abc");
assert.ok(intent.startsWith("intent://studojo.com/auth?mode=signup&fbclid=abc#Intent;scheme=https;package=com.android.chrome;"), intent);
assert.ok(intent.endsWith(";end"));

// EX-07: fbc built from a stored fbclid, in Meta's format.
assert.equal(buildFbc("IwAR0abc", 1727600000000.7), "fb.1.1727600000000.IwAR0abc");

// VS-V09: /auth and the upload step carry the held ad click in the URL, so
// "Open in browser" from an in-app browser keeps it. A URL that already has
// its own tracking params is left alone (never mix two touches).
const held = new URLSearchParams("fbclid=IwAR0abc&utm_source=ig");
assert.equal(carriesTrackingParams("/auth"), true);
assert.equal(carriesTrackingParams("/outreach/onboarding/upload"), true);
assert.equal(carriesTrackingParams("/outreach"), false);
assert.equal(withHeldTracking("?mode=signup&redirect=%2Foutreach", held), "?mode=signup&redirect=%2Foutreach&fbclid=IwAR0abc&utm_source=ig");
assert.equal(withHeldTracking("", held), "?fbclid=IwAR0abc&utm_source=ig");
assert.equal(withHeldTracking("?utm_source=google", held), null);
assert.equal(withHeldTracking("?mode=signin", new URLSearchParams()), null);

console.log("signup attribution helpers: all cases pass");
