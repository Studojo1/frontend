import db from "~/lib/db";
import { sql } from "drizzle-orm";

export async function loader() {
  const baseUrl = "https://studojo.com";

  // Static pages
  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/blog", priority: "0.8", changefreq: "daily" },
    { loc: "/reports", priority: "0.9", changefreq: "weekly" },
    // Reports: all 17
    { loc: "/reports/ops-india-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/internships-ai-india-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/cs-india-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/sales-india-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/finance-india-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/marketing-india-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/pune-jobs-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/internships-15k-india-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/flame-marketing-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/hiring-calendar-india-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/internships-germany-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/internships-uk-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/skills-ai-entry-level-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/internships-australia-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/christ-university-finance-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/ghost-jobs-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/application-response-rate-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/linkedin-profile-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/startup-vs-mnc-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/remote-internships-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/degree-vs-skills-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/job-search-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/unpaid-internship-trap-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/tier-2-college-to-top-company-conversion-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/hidden-job-market-70-percent-never-posted-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/linkedin-easy-apply-killing-chances-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/dubai-hiring-whos-hiring-and-pay-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/product-management-internships-india-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/cold-outreach-what-gets-reply-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/internships-singapore-what-gets-you-hired-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/mba-internship-market-india-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/referrals-vs-applications-how-people-get-hired-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/rejection-report-what-happens-after-you-apply-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/singapore-remote-from-india-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/first-job-india-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/unpaid-internship-report-where-legal-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/growth-marketing-jobs-skills-pay-hiring-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/finance-internships-india-ib-consulting-fintech-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/data-ai-internships-entry-level-reality-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/tier-2-cities-hiring-jobs-leaving-bangalore-mumbai-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/interview-report-why-candidates-fail-after-shortlist-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/luck-report-how-much-career-success-is-luck-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/ai-interns-using-ai-wont-replace-interns-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/placement-cell-report-what-they-can-cannot-do-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/return-offer-report-why-some-interns-get-hired-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/nepotism-report-how-much-hiring-happens-through-connections-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/first-1-lakh-month-report-fastest-paths-students-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/cold-email-subject-lines-best-practices-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/how-to-get-a-high-school-internship-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/internship-vs-externship-coop-practicum-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/cybersecurity-internship-report-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/google-internship-report-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/apple-internship-report-2026-27", priority: "0.9", changefreq: "monthly" },
    // Product + other. Only URLs that return 200 and robots.txt allows
    // (no /auth, no /careers, which 301s to /).
    { loc: "/outreach", priority: "0.9", changefreq: "weekly" },
    { loc: "/dojos/internships", priority: "0.8", changefreq: "weekly" },
    { loc: "/cc", priority: "0.7", changefreq: "monthly" },
    { loc: "/campus-ambassador", priority: "0.6", changefreq: "monthly" },
    { loc: "/webinar", priority: "0.5", changefreq: "weekly" },
    { loc: "/sensei", priority: "0.6", changefreq: "monthly" },
    { loc: "/resume-maker", priority: "0.7", changefreq: "monthly" },
    { loc: "/about", priority: "0.6", changefreq: "monthly" },
    { loc: "/contact", priority: "0.5", changefreq: "yearly" },
    { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
    { loc: "/terms", priority: "0.3", changefreq: "yearly" },
    { loc: "/refund-policy", priority: "0.3", changefreq: "yearly" },
  ];

  // Dynamic blog posts
  let blogPosts: Array<{ slug: string; updated_at: string | null; published_at: string | null }> = [];
  try {
    const result = await db.execute(
      sql`SELECT slug, updated_at, published_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC`
    );
    blogPosts = result.rows as typeof blogPosts;
  } catch (error) {
    console.error("[sitemap.xml] Failed to fetch blog posts:", error);
  }

  // Published internship pages, with their real last-edit date.
  let internships: Array<{ slug: string; updated_at: string }> = [];
  try {
    const result = await db.execute(
      sql`SELECT slug, updated_at FROM internships WHERE status = 'published' ORDER BY updated_at DESC`
    );
    internships = result.rows as typeof internships;
  } catch (error) {
    console.error("[sitemap.xml] Failed to fetch internships:", error);
  }

  const day = (v: string | null | undefined) => (v ? new Date(v).toISOString().split("T")[0] : null);
  // lastmod is only sent when we know the real date. Stamping "today" on
  // every static page told crawlers everything changed daily (audit HP-N15).
  const lastmodTag = (d: string | null | undefined) => (d ? `\n    <lastmod>${d}</lastmod>` : "");

  // Report pages: accurate publish dates so Google sees correct lastmod
  const reportLastmod: Record<string, string> = {
    "/reports/ops-india-2026": "2026-04-12",
    "/reports/internships-ai-india-2026": "2026-04-08",
    "/reports/cs-india-2026": "2026-04-01",
    "/reports/sales-india-2026": "2026-04-01",
    "/reports/finance-india-2026": "2026-04-01",
    "/reports/marketing-india-2026": "2026-04-05",
    "/reports/pune-jobs-2026": "2026-04-05",
    "/reports/internships-15k-india-2026": "2026-04-10",
    "/reports/flame-marketing-2026": "2026-04-15",
    "/reports/hiring-calendar-india-2026": "2026-04-10",
    "/reports/internships-germany-2026": "2026-04-20",
    "/reports/internships-uk-2026": "2026-04-20",
    "/reports/skills-ai-entry-level-2026": "2026-04-20",
    "/reports/internships-australia-2026": "2026-04-20",
    "/reports/christ-university-finance-2026": "2026-04-23",
    "/reports/ghost-jobs-2026": "2026-04-27",
    "/reports/application-response-rate-2026": "2026-05-01",
    "/reports/linkedin-profile-2026": "2026-05-02",
    "/reports/startup-vs-mnc-2026": "2026-05-03",
    "/reports/remote-internships-2026": "2026-05-03",
    "/reports/degree-vs-skills-2026": "2026-05-03",
    "/reports/job-search-2026": "2026-04-22",
    "/reports/unpaid-internship-trap-2026": "2026-05-05",
    "/reports/tier-2-college-to-top-company-conversion-2026": "2026-05-07",
    "/reports/hidden-job-market-70-percent-never-posted-2026": "2026-05-07",
    "/reports/linkedin-easy-apply-killing-chances-2026": "2026-05-07",
    "/reports/dubai-hiring-whos-hiring-and-pay-2026": "2026-05-08",
    "/reports/product-management-internships-india-2026": "2026-05-10",
    "/reports/cold-outreach-what-gets-reply-2026": "2026-05-12",
    "/reports/internships-singapore-what-gets-you-hired-2026": "2026-05-12",
    "/reports/mba-internship-market-india-2026": "2026-05-19",
    "/reports/referrals-vs-applications-how-people-get-hired-2026": "2026-05-20",
    "/reports/rejection-report-what-happens-after-you-apply-2026": "2026-05-20",
    "/reports/singapore-remote-from-india-2026": "2026-05-23",
    "/reports/first-job-india-2026": "2026-06-02",
    "/reports/unpaid-internship-report-where-legal-2026": "2026-06-01",
    "/reports/growth-marketing-jobs-skills-pay-hiring-2026": "2026-05-30",
    "/reports/finance-internships-india-ib-consulting-fintech-2026": "2026-06-04",
    "/reports/data-ai-internships-entry-level-reality-2026": "2026-06-01",
    "/reports/tier-2-cities-hiring-jobs-leaving-bangalore-mumbai-2026": "2026-05-30",
    "/reports/interview-report-why-candidates-fail-after-shortlist-2026": "2026-06-04",
    "/reports/luck-report-how-much-career-success-is-luck-2026": "2026-06-05",
    "/reports/ai-interns-using-ai-wont-replace-interns-2026": "2026-06-06",
    "/reports/placement-cell-report-what-they-can-cannot-do-2026": "2026-06-06",
    "/reports/return-offer-report-why-some-interns-get-hired-2026": "2026-06-06",
    "/reports/nepotism-report-how-much-hiring-happens-through-connections-2026": "2026-06-12",
    "/reports/first-1-lakh-month-report-fastest-paths-students-2026": "2026-06-12",
    "/reports/cold-email-subject-lines-best-practices-2026": "2026-06-16",
    "/reports/how-to-get-a-high-school-internship-2026": "2026-09-27",
    "/reports/internship-vs-externship-coop-practicum-2026": "2026-09-27",
    "/reports/cybersecurity-internship-report-2026": "2026-09-27",
    "/reports/google-internship-report-2026": "2026-09-27",
    "/reports/apple-internship-report-2026-27": "2026-09-26",
  };

  const urls = [
    ...staticPages.map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.loc}</loc>${lastmodTag(reportLastmod[page.loc])}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    ),
    ...blogPosts.map(
      (post) => `
  <url>
    <loc>${baseUrl}/blog/${encodeURIComponent(post.slug)}</loc>${lastmodTag(day(post.updated_at) ?? day(post.published_at))}
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    ),
    ...internships.map(
      (job) => `
  <url>
    <loc>${baseUrl}/internships/${encodeURIComponent(job.slug)}</loc>${lastmodTag(day(job.updated_at))}
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    ),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}