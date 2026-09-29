import { redirect } from "react-router";

// Permanent redirects for URLs people type, old playbook links, and reports
// merged into a stronger duplicate. Each path is registered in app/routes.ts
// against this module (audit ST-N11, HP-N18, ST-N06). Query strings (utm_*,
// fbclid) are carried over so attribution survives the hop.
export const LEGACY_REDIRECTS: Record<string, string> = {
  "/signup": "/auth?mode=signup",
  "/register": "/auth?mode=signup",
  "/login": "/auth?mode=signin",
  "/signin": "/auth?mode=signin",
  "/sign-in": "/auth?mode=signin",
  "/pricing": "/outreach",
  "/dojos": "/",
  "/dojos/careers": "/resume-maker",
  "/dojos/outreach": "/outreach",
  "/internships": "/dojos/internships",
  // Emails sent before 29 Sep link "Help" to /support.
  "/support": "/contact",
  // Near-duplicate reports: keep the stronger page of each pair.
  "/reports/why-80-percent-applications-get-no-response-2026": "/reports/application-response-rate-2026",
  "/reports/linkedin-profile-what-hiring-managers-look-at-2026": "/reports/linkedin-profile-2026",
  "/reports/high-school-internships-how-to-get-one-2026": "/reports/how-to-get-a-high-school-internship-2026",
};

export function redirectTarget(requestUrl: string): string {
  const url = new URL(requestUrl);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const target = new URL(LEGACY_REDIRECTS[path] ?? "/", url.origin);
  for (const [k, v] of url.searchParams) {
    if (!target.searchParams.has(k)) target.searchParams.set(k, v);
  }
  return target.pathname + target.search;
}

export function loader({ request }: { request: Request }) {
  return redirect(redirectTarget(request.url), 301);
}

export default function LegacyRedirect() {
  return null;
}
