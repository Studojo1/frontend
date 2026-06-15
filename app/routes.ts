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
  route("reports/hidden-job-market-70-percent-never-posted-2026", "routes/reports.hidden-job-market-70-percent-never-posted-2026.tsx"),
  route("reports/linkedin-easy-apply-killing-chances-2026", "routes/reports.linkedin-easy-apply-killing-chances-2026.tsx"),
  route("reports/dubai-hiring-whos-hiring-and-pay-2026", "routes/reports.dubai-hiring-whos-hiring-and-pay-2026.tsx"),
  route("reports/product-management-internships-india-2026", "routes/reports.product-management-internships-india-2026.tsx"),
  route("reports/cold-outreach-what-gets-reply-2026", "routes/reports.cold-outreach-what-gets-reply-2026.tsx"),
  route("reports/internships-singapore-what-gets-you-hired-2026", "routes/reports.internships-singapore-what-gets-you-hired-2026.tsx"),
  route("reports/linkedin-profile-what-hiring-managers-look-at-2026", "routes/reports.linkedin-profile-what-hiring-managers-look-at-2026.tsx"),
  route("reports/mba-internship-market-india-2026", "routes/reports.mba-internship-market-india-2026.tsx"),
  route("reports/referrals-vs-applications-how-people-get-hired-2026", "routes/reports.referrals-vs-applications-how-people-get-hired-2026.tsx"),
  route("reports/rejection-report-what-happens-after-you-apply-2026", "routes/reports.rejection-report-what-happens-after-you-apply-2026.tsx"),
  route("reports/singapore-remote-from-india-2026", "routes/reports.singapore-remote-from-india-2026.tsx"),
  route("reports/first-job-india-2026", "routes/reports.first-job-india-2026.tsx"),
  route("reports/unpaid-internship-report-where-legal-2026", "routes/reports.unpaid-internship-report-where-legal-2026.tsx"),
  route("reports/growth-marketing-jobs-skills-pay-hiring-2026", "routes/reports.growth-marketing-jobs-skills-pay-hiring-2026.tsx"),
  route("reports/finance-internships-india-ib-consulting-fintech-2026", "routes/reports.finance-internships-india-ib-consulting-fintech-2026.tsx"),
  route("reports/data-ai-internships-entry-level-reality-2026", "routes/reports.data-ai-internships-entry-level-reality-2026.tsx"),
  route("reports/tier-2-cities-hiring-jobs-leaving-bangalore-mumbai-2026", "routes/reports.tier-2-cities-hiring-jobs-leaving-bangalore-mumbai-2026.tsx"),
  route("reports/interview-report-why-candidates-fail-after-shortlist-2026", "routes/reports.interview-report-why-candidates-fail-after-shortlist-2026.tsx"),
  route("reports/luck-report-how-much-career-success-is-luck-2026", "routes/reports.luck-report-how-much-career-success-is-luck-2026.tsx"),
  route("reports/ai-interns-using-ai-wont-replace-interns-2026", "routes/reports.ai-interns-using-ai-wont-replace-interns-2026.tsx"),
  route("reports/placement-cell-report-what-they-can-cannot-do-2026", "routes/reports.placement-cell-report-what-they-can-cannot-do-2026.tsx"),
  route("reports/return-offer-report-why-some-interns-get-hired-2026", "routes/reports.return-offer-report-why-some-interns-get-hired-2026.tsx"),
  route("reports/nepotism-report-how-much-hiring-happens-through-connections-2026", "routes/reports.nepotism-report-how-much-hiring-happens-through-connections-2026.tsx"),
  route("reports/first-1-lakh-month-report-fastest-paths-students-2026", "routes/reports.first-1-lakh-month-report-fastest-paths-students-2026.tsx"),
] satisfies RouteConfig;
