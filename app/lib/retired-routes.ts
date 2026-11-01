// RELAUNCH (2 Nov 2026, the owner): every old student product is gone from this site, and every old link goes to the
// homepage, which asks the visitor to join the call. "The minute they hit studojo.com/outreach it should just redirect
// to the page, nothing else."
//
// Each path below is registered in app/routes.ts against one module, app/routes/retired.tsx, whose loader and action
// answer 301 to "/" with the query string dropped. Nothing old renders and no old service is called: the old route
// modules are deleted (their code stays on GitHub, tag archive/old-site-2026-11-02).
//
// A prefix covers the path itself and everything under it ("outreach" is /outreach and /outreach/anything). An exact
// path covers only itself. Paths are written without the leading slash, the way app/routes.ts takes them.
//
// Pure, for app/routes.ts and the tests (app/lib/retired-routes.test.mjs).

/** Old products: the path and everything under it. */
export const RETIRED_PREFIXES: readonly string[] = Object.freeze([
  // Outreach (job-outreach-svc) and its ad and payment pages
  "outreach",
  "start",
  "payment-success",
  "pricing",
  "jernew",
  "flow",
  "new",
  // Internship Dojo, every /dojos page, the internships map
  "dojos",
  "internships",
  "my-applications",
  "maps",
  // Career coach and the job readiness coach
  "cc",
  "jrs",
  // Assignments, the resume builder, revision
  "assignments",
  "resume-maker",
  "resumes",
  "revision",
  // AutoApply, the browser extension, the LinkedIn tool
  "autoapply",
  "extension",
  "extension-auth",
  "install-extension",
  "connect-linkedin",
  "lkot",
  "linkedin",
  "test123",
  // The CRM
  "crm",
  // Partners
  "partners",
  "partners-phone",
  // The old account and onboarding pages, students' public pages
  "profile",
  "onboarding",
  // Old marketing pages for the old products: the toolkit, careers, campus ambassadors, the September webinar
  "toolkit",
  "careers",
  "campus-ambassador",
  "insider",
  "webinar",
  "no-one-is-hiring",
  "ressources",
  "playbook",
  "clips",
  // The old products' APIs on this site
  "api/autoapply",
  "api/extension",
  "api/resumes",
  "api/v2/resumes",
  "api/resume-maker",
  "api/crm",
  "api/internships",
  "api/career-coach",
  "api/ai-risk",
  "api/outreach",
  "api/questions",
  "api/onboarding",
  "api/webhooks",
  "api/maps",
  "api/company-logo",
  "api/email-event",
  "api/careers",
  "api/admin/examples",
  "api/admin/templates",
]);

/** Old pages and APIs whose parent stays: only the path itself. */
export const RETIRED_EXACT: readonly string[] = Object.freeze([
  // Email preferences (no email goes to students any more)
  "settings/email",
  "api/user/applications",
  "api/user/resume-uploads",
  "api/user/phone",
  "api/webinar-register",
  "api/webinar-confirm",
  "api/webinar-ref-code",
  "api/campus-ambassador-apply",
  "api/consultation-signup",
  "api/newsletter",
  "api/admin/cc-user-activity",
  "api/admin/scrape-internships",
]);

export interface RetiredRoute {
  /** The route path, as app/routes.ts takes it. */
  path: string;
  /** A unique route id (one module serves them all). */
  id: string;
}

/** A route id for a path: "retired-" and the path with every non-alphanumeric run as one dash. */
export function retiredId(path: string): string {
  return `retired-${path.replace(/\*/g, "all").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

/** Every route to register: each prefix and its splat, then each exact path. */
export function retiredRoutes(): RetiredRoute[] {
  const paths: string[] = [];
  for (const p of RETIRED_PREFIXES) paths.push(p, `${p}/*`);
  paths.push(...RETIRED_EXACT);
  return paths.map((path) => ({ path, id: retiredId(path) }));
}

/** Whether a URL path is retired (what the registered routes match). Pure, for tests. */
export function isRetiredPath(pathname: string): boolean {
  const p = pathname.replace(/^\/+|\/+$/g, "");
  if (RETIRED_EXACT.includes(p)) return true;
  return RETIRED_PREFIXES.some((pre) => p === pre || p.startsWith(`${pre}/`));
}

/** Where every retired path goes: the homepage, with no query string. */
export const RETIRED_TARGET = "/";
