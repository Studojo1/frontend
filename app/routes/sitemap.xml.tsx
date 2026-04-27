import db from "~/lib/db";
import { sql } from "drizzle-orm";

export async function loader() {
  const baseUrl = "https://studojo.com";

  // Static pages
  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/blog", priority: "0.8", changefreq: "daily" },
    { loc: "/reports", priority: "0.9", changefreq: "weekly" },
    { loc: "/reports/cs-india-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/job-search-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/christ-university-finance-2026", priority: "0.9", changefreq: "monthly" },
    { loc: "/reports/ghost-jobs-2026", priority: "0.9", changefreq: "monthly" },
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

  // Report pages have a fixed publish date — use it so Google sees accurate lastmod
  const reportLastmod: Record<string, string> = {
    "/reports/cs-india-2026": "2026-04-01",
    "/reports/finance-india-2026": "2026-04-01",
    "/reports/marketing-india-2026": "2026-04-01",
    "/reports/sales-india-2026": "2026-04-01",
    "/reports/ops-india-2026": "2026-04-01",
    "/reports/internships-ai-india-2026": "2026-04-01",
    "/reports/internships-15k-india-2026": "2026-04-01",
    "/reports/hiring-calendar-india-2026": "2026-04-01",
    "/reports/pune-jobs-2026": "2026-04-01",
    "/reports/flame-marketing-2026": "2026-04-01",
    "/reports/internships-germany-2026": "2026-04-20",
    "/reports/internships-uk-2026": "2026-04-20",
    "/reports/internships-australia-2026": "2026-04-20",
    "/reports/skills-ai-entry-level-2026": "2026-04-20",
    "/reports/christ-university-finance-2026": "2026-04-23",
    "/reports/ghost-jobs-2026": "2026-04-27",
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