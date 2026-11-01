// RELAUNCH (2 Nov 2026): every old product path answers 301 to "/", query dropped, and nothing old renders. These
// checks read the real route tree (react-router routes --json) and match URLs against it the way the server does.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { matchRoutes } from "react-router";
import { RETIRED_EXACT, RETIRED_PREFIXES, RETIRED_TARGET, isRetiredPath, retiredId, retiredRoutes } from "./retired-routes.ts";
import { action as retiredAction, loader as retiredLoader } from "../routes/retired.tsx";

const APP = new URL("../", import.meta.url).pathname;

// ── 1. The module: 301 to "/", for reads and writes, no query string, nothing else run.
for (const res of [retiredLoader(), retiredAction()]) {
  assert.equal(res.status, 301);
  assert.equal(res.headers.get("Location"), "/");
}
assert.equal(RETIRED_TARGET, "/");
const mod = readFileSync(APP + "routes/retired.tsx", "utf8").replace(/^\s*\/\/.*$/gm, "");
assert.doesNotMatch(mod, /request|session|db|fetch\(/, "the redirect reads nothing: no session, no database, no service");

// ── 2. Ids are unique, and every prefix comes with its splat.
const routes = retiredRoutes();
assert.equal(new Set(routes.map((r) => r.id)).size, routes.length, "one id per path");
assert.equal(routes.length, RETIRED_PREFIXES.length * 2 + RETIRED_EXACT.length);
assert.equal(retiredId("outreach/*"), "retired-outreach-all");
assert.equal(retiredId("api/v2/resumes"), "retired-api-v2-resumes");

// ── 3. The real route tree: every retired path is there, served by routes/retired.tsx.
const tree = JSON.parse(
  execFileSync("npx", ["react-router", "routes", "--json"], {
    cwd: new URL("../../", import.meta.url).pathname,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }),
);
const root = tree.find((r) => r.id === "root");
const toRoutes = (rs) => rs.map((r) => ({ id: r.id, path: r.path, index: r.index, file: r.file, children: r.children ? toRoutes(r.children) : undefined }));
const routeTree = [{ id: "root", path: "", file: root.file, children: toRoutes(root.children ?? []) }];
const leaf = (url) => {
  const m = matchRoutes(routeTree, url);
  return m ? m[m.length - 1].route : null;
};
const byId = new Map();
(function walk(rs) {
  for (const r of rs) {
    byId.set(r.id, r);
    walk(r.children ?? []);
  }
})(root.children);
for (const r of routes) {
  const got = byId.get(r.id);
  assert.ok(got, `${r.path} is not in the route tree`);
  assert.equal(got.file, "routes/retired.tsx", r.path);
}

// Old links land on the redirect, whatever is under them.
const OLD = [
  "/outreach", "/outreach/", "/outreach/onboarding/upload", "/outreach/campaign/setup", "/outreach/orders",
  "/dojos", "/dojos/internships", "/dojos/humanizer", "/dojos/ai-risk", "/dojos/careers", "/internships", "/internships/some-role",
  "/cc", "/cc/chat", "/cc/dashboard", "/assignments", "/resume-maker", "/resumes/abc", "/revision", "/revision/notes",
  "/autoapply", "/autoapply/outreach", "/extension/connect", "/extension-auth", "/install-extension", "/connect-linkedin",
  "/lkot", "/linkedin", "/linkedin/leads/discovery", "/linkedin/pricing", "/crm", "/crm/setup", "/crm/abc",
  "/partners", "/partners/login", "/partners-phone/checkout", "/profile", "/profile/someone", "/profile/someone/photo",
  "/onboarding", "/my-applications", "/maps", "/toolkit", "/start", "/jernew", "/test123", "/payment-success",
  "/pricing", "/careers", "/campus-ambassador", "/insider", "/webinar", "/webinar/quick-register", "/no-one-is-hiring",
  "/ressources", "/playbook", "/settings/email", "/flow", "/new", "/clips", "/jrs",
  "/api/autoapply/config", "/api/extension/token", "/api/resumes", "/api/v2/resumes/1/preview", "/api/resume-maker/chat",
  "/api/crm/drafts", "/api/internships", "/api/internships/1/apply", "/api/career-coach/summary", "/api/ai-risk/analyse",
  "/api/outreach/stats", "/api/questions/match", "/api/onboarding", "/api/onboarding/status", "/api/webhooks/razorpay",
  "/api/webhooks/stripe", "/api/maps", "/api/company-logo", "/api/email-event", "/api/careers/apply",
  "/api/admin/templates/upload", "/api/admin/examples/generate-previews", "/api/admin/cc-user-activity",
  "/api/admin/scrape-internships", "/api/user/applications", "/api/user/resume-uploads", "/api/user/phone",
  "/api/webinar-register", "/api/webinar-confirm", "/api/webinar-ref-code", "/api/campus-ambassador-apply",
  "/api/consultation-signup", "/api/newsletter",
];
for (const url of OLD) {
  assert.ok(isRetiredPath(url), `${url}: isRetiredPath`);
  const r = leaf(url);
  assert.ok(r, `${url}: no route`);
  assert.equal(r.file, "routes/retired.tsx", `${url} reaches ${r.file}, not the redirect`);
}

// What stays never reaches the redirect: the new site, sign-in, legal, support, reports, blog, Sensei and Bob, and the
// paths the ingress sends elsewhere (the Bob API under /api/v1/outreach/bob, auth under /api/auth, the product).
const KEPT = [
  "/", "/blog", "/blog/some-post", "/reports", "/reports/ghost-jobs-2026", "/about", "/contact", "/privacy", "/terms",
  "/refund-policy", "/auth", "/auth/2fa", "/forgot-password", "/reset-password", "/settings", "/account/delete",
  "/signup", "/login", "/support", "/sensei", "/bob", "/dashboard", "/oldui", "/mesa", "/apidocs", "/apidashboard",
  "/mcpdocs", "/b2cnew", "/go/abc", "/meta.json", "/sitemap.xml", "/robots.txt", "/ananya/blinkit-vs-instamart",
  "/api/auth/session", "/api/account/export", "/api/chat", "/api/contact", "/api/tickets", "/api/tickets/1/messages",
  "/api/enrich", "/api/enrich/bulk", "/api/jobs/1", "/api/mcp", "/api/sensei-demo", "/api/sensei-ticket",
  "/api/user/profile", "/api/user/accept-terms", "/api/report-requests", "/api/attribution", "/api/funnel-event",
  "/api/meta-event", "/api/blog", "/api/images/blog-images/a.png",
];
for (const url of KEPT) {
  assert.ok(!isRetiredPath(url), `${url} must stay`);
  const r = leaf(url);
  if (r) assert.notEqual(r.file, "routes/retired.tsx", `${url} reaches the redirect`);
}
for (const url of ["/api/v1/outreach/bob/x", "/api/v1/outreach/mesa/searches", "/api/auth/callback/google"]) {
  assert.ok(!isRetiredPath(url), `${url} is the ingress's, never retired here`);
}

// ── 4. No old route module is left in app/routes for a retired path (nothing old can render).
const routeFiles = readdirSync(APP + "routes").filter((f) => /\.tsx?$/.test(f));
const asPath = (f) =>
  f
    .replace(/\.tsx?$/, "")
    .split("[.]")
    .join("%DOT%")
    .split(".")
    .map((seg) => seg.split("%DOT%").join(".").replace(/_$/, "").replace(/^_index$/, "").replace(/^\$$/, "*"))
    .filter(Boolean)
    .join("/");
for (const f of routeFiles) {
  if (f === "retired.tsx") continue;
  assert.ok(!isRetiredPath(`/${asPath(f)}`), `app/routes/${f} serves a retired path (/${asPath(f)})`);
}

// ── 5. The pages that stay call no retired service: no job-outreach-svc server client, no career coach or resume
// service, and no old onboarding check.
const REACHABLE = ["root.tsx", "routes/_index.tsx", "routes/settings._index.tsx", "routes/account.delete.tsx", "routes/api.account.export.tsx", "routes/api.tickets.tsx", "routes/auth._index.tsx", "routes/forgot-password.tsx", "routes/reset-password.tsx"];
for (const f of REACHABLE) {
  const src = readFileSync(APP + f, "utf8");
  assert.doesNotMatch(src, /outreach\/server-api|outreachServerFetch|outreachFetch\(|career-coach\.server|RESUME_SERVICE_URL|OUTREACH_SVC_URL|requireOnboardingComplete|onboardingUrl\(/, f);
}

console.log(`retired-routes: ${routes.length} routes, ${OLD.length} old links redirect, ${KEPT.length} kept paths untouched`);
