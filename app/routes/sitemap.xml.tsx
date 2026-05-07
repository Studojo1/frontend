import db from "~/lib/db";
import { sql } from "drizzle-orm";

export async function loader() {
  const baseUrl = "https://studojo.com";

  // Static pages
  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/blog", priority: "0.8", changefreq: "daily" },
    { loc: "/reports", priority: "0.9", changefreq: "weekly" },
    // Reports — all 17
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
    { loc: "/reports/why-80-percent-applications-get-no-response-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/hidden-job-market-70-percent-never-posted-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/linkedin-easy-apply-killing-chances-2026", priority: "0.9", changefreq: "monthly" },
    // Product + other
    { loc: "/dojos/internships", priority: "0.8", changefreq: "weekly" },
    { loc: "/dojos/assignment", priority: "0.7", changefreq: "monthly" },
    { loc: "/dojos/careers", priority: "0.7", changefreq: "monthly" },
    { loc: "/about", priority: "0.6", changefreq: "monthly" },
    { loc: "/contact", priority: "0.5", changefreq: "yearly" },
    { loc: "/auth?mode=signup", priority: "0.5", changefreq: "monthly" },
    { loc: "/careers", priority: "0.5", changefreq: "monthly" },
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

  const today = new Date().toISOString().split("T")[0];

  // Report pages — accurate publish dates so Google sees correct lastmod
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
    "/reports/why-80-percent-applications-get-no-response-2026": "2026-05-07",
    "/reports/hidden-job-market-70-percent-never-posted-2026": "2026-05-07",
    "/reports/linkedin-easy-apply-killing-chances-2026": "2026-05-07",
  };

  const urls = [
    ...staticPages.map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${reportLastmod[page.loc] ?? today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    ),
    ...blogPosts.map((post) => {
      const lastmod = post.updated_at
        ? new Date(post.updated_at).toISOString().split("T")[0]
        : post.published_at
          ? new Date(post.published_at).toISOString().split("T")[0]
          : today;
      return `
  <url>
    <loc>${baseUrl}/blog/${encodeURIComponent(post.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }),
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