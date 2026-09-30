// Guards for the Outreach app-screen fixes from the 30 Sep 2026 B2C audit:
// NEW-07, OP-N03, OP-N12, UC-Q13, UC-Q20, PS-N13, PH-07, PH-15, PH-28.
// Every check calls the production helper the pages use, or reads the real
// route tree / page source.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { resultsDestination, isPaidNotLaunched } from "./next-step.ts";
import { couponFromSearch, rememberCoupon, recallCoupon, COUPON_STORAGE_KEY } from "./coupon.ts";
import { tierMatch, leadHeadline } from "./tier-match.ts";
import { profileFromResume } from "../profile-from-resume.ts";

const APP = new URL("../../", import.meta.url).pathname;
const read = (p) => readFileSync(APP + p, "utf8");

const step = (state, extra = {}) => ({
  state,
  path: null,
  available_credits: 0,
  order_id: 1,
  candidate_id: null,
  email_account_id: null,
  campaign_id: null,
  ...extra,
});

// ── NEW-07: /outreach/results sends each student to the right place ──────────
// Unpaid with leads: their leads, coupon kept.
assert.equal(
  resultsDestination(step("not_paid", { path: "/leads/results", candidate_id: 7 }), "?coupon=SAVE20"),
  "/outreach/leads/results?coupon=SAVE20",
);
// Unpaid with no leads anywhere: the /outreach page, coupon kept for later.
assert.equal(resultsDestination(step("not_paid"), "?coupon=SAVE20"), "/outreach?coupon=SAVE20");
// Paid, not launched: the step that blocks Launch, never upload.
assert.equal(resultsDestination(step("connect_gmail", { path: "/connect/gmail", available_credits: 200 }), "?coupon=X"), "/outreach/connect/gmail");
assert.ok(isPaidNotLaunched(step("launch_ready", { path: "/campaign/setup" })));
// Running campaign: the dashboard.
assert.equal(resultsDestination(step("campaign_active", { path: "/campaign/dashboard" }), ""), "/outreach/campaign/dashboard");
// Lookup failed: the results page, which finds their latest leads itself.
assert.equal(resultsDestination(null, "coupon=AB"), "/outreach/leads/results?coupon=AB");
assert.equal(resultsDestination(null, ""), "/outreach/leads/results");

// The route exists at exactly /outreach/results (it 404'd before).
const tree = JSON.parse(
  execFileSync("npx", ["react-router", "routes", "--json"], {
    cwd: new URL("../../../", import.meta.url).pathname,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }),
);
const paths = [];
(function walk(routes, prefix) {
  for (const r of routes) {
    const full = r.path ? `${prefix}/${r.path}`.replace(/\/+/g, "/") : prefix;
    paths.push({ full, file: r.file });
    if (r.children) walk(r.children, full);
  }
})(tree, "");
assert.ok(
  paths.some((p) => p.full === "/outreach/results" && p.file === "routes/outreach.results.tsx"),
  "/outreach/results must be a route (the outreach emails link to it)",
);

// ── NEW-07 / OP-N12: ?coupon= survives the hop to pricing ────────────────────
const mem = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m };
};
assert.equal(couponFromSearch("?coupon= save20 "), "SAVE20");
assert.equal(couponFromSearch("?coupon=<script>"), null, "junk is not prefilled");
assert.equal(couponFromSearch("?x=1"), null);
{
  const s = mem();
  assert.equal(rememberCoupon("?coupon=abc12", s), "ABC12");
  assert.equal(s.m.get(COUPON_STORAGE_KEY), "ABC12");
  assert.equal(recallCoupon("", s), "ABC12", "pricing page gets the code from an earlier page");
  assert.equal(recallCoupon("?coupon=NEW1", s), "NEW1", "the URL wins");
  const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.equal(rememberCoupon("?coupon=ZZ9", broken), "ZZ9", "blocked storage never throws");
  assert.equal(recallCoupon("", broken), null);
}
assert.match(read("routes/outreach.tsx"), /rememberCoupon\(/, "the /outreach layout remembers ?coupon=");
assert.match(read("routes/outreach.enrichment.tsx"), /recallCoupon\(/, "pricing reads the remembered coupon");

// ── OP-N03: pricing follows the API to the candidate that has the leads ─────
assert.match(read("routes/outreach.enrichment.tsx"), /active_candidate_id/, "pricing must switch to active_candidate_id");

// ── UC-Q13 / UC-Q20: pricing states the lead count and what each pack reaches ─
assert.equal(leadHeadline(0, null), null);
assert.equal(leadHeadline(812, null), "We found 812 hiring managers for you.");
assert.equal(
  leadHeadline(812, 126),
  "We found 812 hiring managers for you: 126 strong matches for your target roles and 686 broader matches.",
);
assert.equal(tierMatch(200, null, null), null);
{
  const m = tierMatch(500, 300, 120);
  assert.equal(m.reach, "Reaches your 120 strong matches and 180 broader ones");
  assert.equal(m.leftover, "You have 300 matches today, so 200 credits stay on your balance for later.");
}
assert.equal(tierMatch(200, 812, 500).reach, "Reaches 200 of your 500 strong matches");
assert.equal(tierMatch(200, 812, 200).reach, "Reaches all 200 of your strong matches");
assert.equal(tierMatch(200, 812, 0).reach, "Reaches 200 broader matches");
{
  // No strong_total from the API: falls back to the plain count.
  const m = tierMatch(350, 812, null);
  assert.equal(m.reach, "Reaches 350 of your 812 hiring managers");
  assert.equal(m.leftover, null);
  assert.equal(tierMatch(500, 400, undefined).reach, "Reaches all 400 of your hiring managers");
}
assert.doesNotMatch(read("routes/outreach.enrichment.tsx"), /verified hiring managers/, "packs do not promise verified contacts");

// ── PS-N13: the deliverability test says where the emails really go ─────────
{
  const setup = read("routes/outreach.campaign.setup.tsx");
  assert.match(setup, /\[TEST\]/, "setup says test subjects start with [TEST]");
  assert.match(setup, /Nothing goes to the hiring managers/);
  assert.doesNotMatch(setup, /placeholder=\{email\.original_email\}/, "never show the lead's address as the test recipient");
  assert.doesNotMatch(setup, /9 AM - 6 PM|40-90 minutes|Redirecting to launch/);
}

// ── PH-07: no 9-11px text on the money screens ──────────────────────────────
for (const f of [
  "routes/outreach.onboarding.profile.tsx",
  "routes/outreach.leads.discovery.tsx",
  "routes/outreach.leads.results.tsx",
  "routes/outreach.enrichment.tsx",
  "components/outreach/FlashCard.tsx",
]) {
  assert.doesNotMatch(read(f), /text-\[(9|10|11)px\]/, `${f} uses text smaller than 12px`);
}

// ── PH-15: the Outreach app uses the small footer, not the marketing one ─────
for (const f of readdirSync(APP + "routes").filter((f) => /^outreach\..+\.tsx$/.test(f) && f !== "outreach._index.tsx")) {
  assert.doesNotMatch(read("routes/" + f), /components\/common\/footer/, `${f} renders the marketing footer`);
}

// ── PH-28: profile details come from the parsed resume ──────────────────────
{
  const now = new Date("2026-09-30T00:00:00Z");
  const p = profileFromResume(
    {
      personal_info: { name: "Asha Rao" },
      education: [{ institution: "Christ University", degree: "BBA", end_date: "Jun 2027" }],
    },
    now,
  );
  assert.deepEqual(p, { name: "Asha Rao", college: "Christ University", course: "BBA", yearOfStudy: "Graduating 2027" });
  assert.equal(profileFromResume({ education: [{ school: "X Institute", year: 2023 }] }, now).yearOfStudy, "Graduated 2023");
  assert.deepEqual(profileFromResume(null), { name: null, college: null, course: null, yearOfStudy: null });
  assert.equal(profileFromResume({ personal_info: { name: "a@b.co" } }).name, null, "an email is not a name");
  assert.equal(profileFromResume({ education: ["B.Tech, IIT"] }).college, null, "free text is not guessed");
}

console.log("outreach app-screens: ok");
