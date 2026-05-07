import { type RouteConfig, route } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

// File-based route discovery handles most routes automatically.
//
// Report detail pages (reports.*.tsx) are excluded from flatRoutes and declared
// explicitly below. This is required because flatRoutes treats reports.tsx as a
// layout parent and would nest all reports.*.tsx files inside it as children.
// Since reports.tsx has no <Outlet>, child content would never render.

export default [
  ...(await flatRoutes({
    ignoredRouteFiles: [
      "**/well-known.$.tsx",
      "**/sitemap.xml.tsx",
      "**/robots.txt.tsx",
      "**/reports.*.tsx",
      "**/connect-linkedin.tsx",
    ],
  })),

  // ── Special path segments ──────────────────────────────────────────────
  route(".well-known/*", "routes/well-known.$.tsx"),
  route("sitemap.xml", "routes/sitemap.xml.tsx"),
  route("robots.txt", "routes/robots.txt.tsx"),

  // ── LinkedIn connect (email link, no Studojo auth) ─────────────────────
  route("connect-linkedin", "routes/connect-linkedin.tsx"),

  // ── Reports (explicit to avoid nesting under reports.tsx layout) ───────
  route("reports/ops-india-2026", "routes/reports.ops-india-2026.tsx"),
  route("reports/internships-ai-india-2026", "routes/reports.internships-ai-india-2026.tsx"),
  route("reports/cs-india-2026", "routes/reports.cs-india-2026.tsx"),
  route("reports/sales-india-2026", "routes/reports.sales-india-2026.tsx"),
  route("reports/finance-india-2026", "routes/reports.finance-india-2026.tsx"),
  route("reports/marketing-india-2026", "routes/reports.marketing-india-2026.tsx"),
  route("reports/pune-jobs-2026", "routes/reports.pune-jobs-2026.tsx"),
  route("reports/internships-15k-india-2026", "routes/reports.internships-15k-india-2026.tsx"),
  route("reports/flame-marketing-2026", "routes/reports.flame-marketing-2026.tsx"),
  route("reports/hiring-calendar-india-2026", "routes/reports.hiring-calendar-india-2026.tsx"),
  route("reports/internships-germany-2026", "routes/reports.internships-germany-2026.tsx"),
  route("reports/internships-uk-2026", "routes/reports.internships-uk-2026.tsx"),
  route("reports/skills-ai-entry-level-2026", "routes/reports.skills-ai-entry-level-2026.tsx"),
  route("reports/internships-australia-2026", "routes/reports.internships-australia-2026.tsx"),
  route("reports/christ-university-finance-2026", "routes/reports.christ-university-finance-2026.tsx"),
  route("reports/ghost-jobs-2026", "routes/reports.ghost-jobs-2026.tsx"),
  route("reports/application-response-rate-2026", "routes/reports.application-response-rate-2026.tsx"),
  route("reports/linkedin-profile-2026", "routes/reports.linkedin-profile-2026.tsx"),
  route("reports/startup-vs-mnc-2026", "routes/reports.startup-vs-mnc-2026.tsx"),
  route("reports/remote-internships-2026", "routes/reports.remote-internships-2026.tsx"),
  route("reports/job-search-2026", "routes/reports.job-search-2026.tsx"),
  route("reports/degree-vs-skills-2026", "routes/reports.degree-vs-skills-2026.tsx"),
  route("reports/unpaid-internship-trap-2026", "routes/reports.unpaid-internship-trap-2026.tsx"),
  route("reports/tier-2-college-to-top-company-conversion-2026", "routes/reports.tier-2-college-to-top-company-conversion-2026.tsx"),
  route("reports/why-80-percent-applications-get-no-response-2026", "routes/reports.why-80-percent-applications-get-no-response-2026.tsx"),
] satisfies RouteConfig;
