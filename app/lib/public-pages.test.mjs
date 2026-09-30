// Guards for the public site: header links, retired LinkedIn pages, share
// images and phone tap targets (audit 30 Sep 2026: VS-V05, VS-V01, NEW-09,
// HP-N12, HP-N18, PH-10, PH-14).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { authUrl, signupReturnPath } from "./return-to.ts";
import { loader as linkedinLoader } from "../routes/linkedin._index.tsx";
import { loader as linkedinPricingLoader } from "../routes/linkedin.pricing.tsx";

const APP = new URL("../", import.meta.url).pathname;
const PUBLIC = new URL("../../public/", import.meta.url).pathname;

// VS-V05: Get Started on /outreach returns the new user to the upload step,
// keeping the ad click, not to the landing page they just left.
assert.equal(signupReturnPath("/outreach", ""), "/outreach/onboarding/upload");
assert.equal(signupReturnPath("/outreach/", "?utm_source=ig"), "/outreach/onboarding/upload?utm_source=ig");
assert.equal(
  authUrl("signup", signupReturnPath("/outreach", "?fbclid=abc")),
  "/auth?mode=signup&redirect=%2Foutreach%2Fonboarding%2Fupload%3Ffbclid%3Dabc&fbclid=abc",
);
// Other pages come back to themselves.
assert.equal(signupReturnPath("/about", ""), "/about");
assert.equal(signupReturnPath("/outreach/orders", "?x=1"), "/outreach/orders?x=1");
// VS-V01: on /auth itself the page's own redirect is carried through.
assert.equal(
  authUrl("signup", signupReturnPath("/auth", "?redirect=%2Foutreach%2Fonboarding%2Fupload")),
  "/auth?mode=signup&redirect=%2Foutreach%2Fonboarding%2Fupload",
);

// NEW-09: the retired LinkedIn sales pages send visitors to /outreach, with
// their tracking params, and never render the old plans.
for (const [loader, path] of [[linkedinLoader, "/linkedin"], [linkedinPricingLoader, "/linkedin/pricing"]]) {
  const res = await loader({ request: new Request(`https://studojo.com${path}?utm_source=ig`) });
  assert.equal(res.status, 301, path);
  assert.equal(res.headers.get("Location"), "/outreach?utm_source=ig", path);
}

// HP-N12: every studojo.com share image the app points at exists in public/,
// so a link preview never falls back to no image.
const files = ["root.tsx", "routes/_index.tsx", "routes/outreach._index.tsx"];
for (const f of files) {
  const src = readFileSync(APP + f, "utf8");
  for (const m of src.matchAll(/(?:studojo\.com|BASE_URL\})\/(og-[a-z0-9-]+\.png)/g)) {
    assert.ok(existsSync(PUBLIC + m[1]), `${f} points at missing public/${m[1]}`);
  }
}
assert.match(readFileSync(APP + "routes/_index.tsx", "utf8"), /og-home\.png/, "the homepage has its own share card");

// PH-10 / PH-14: every row in the phone menu and the logo link are at least
// 44px tall (min-h-11), and the phone menu's My Orders is the outreach one.
const header = readFileSync(APP + "components/common/header.tsx", "utf8");
const logo = header.match(/<Link\s+to="\/"\s+className="([^"]*)"\s*>\s*studojo/);
assert.ok(logo, "logo link found");
assert.match(logo[1], /\bmin-h-11\b/, "logo link is at least 44px tall");
const mobile = header.slice(header.indexOf('aria-label="Mobile menu"'));
assert.ok(mobile.length > 100, "mobile menu found");
const rows = [...mobile.matchAll(/className=\{?[`"]([^`"]*rounded-lg[^`"]*)[`"]/g)].map((m) => m[1]);
assert.ok(rows.length >= 5, `found ${rows.length} mobile menu rows`);
for (const cls of rows) assert.match(cls, /\bmin-h-1[12]\b/, `mobile menu row under 44px: ${cls}`);
assert.ok(!/to="\/assignments"/.test(header), "header My Orders goes to /outreach/orders");

console.log("public-pages: ok");
