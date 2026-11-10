import { stagingHost } from "./staging-host";

// CRAWL POLICY (4 Nov 2026, the owner: "ban crawlers from the website except reports and blogs"). On studojo.com only
// the homepage, the blog, the reports and the legal pages are for search: the homepage and the legal pages carry the
// legal name, which Meta's business verification and a brand search need. robots.txt (routes/robots.txt.tsx) and the
// X-Robots-Tag on every other page (entry.server.tsx) both come from here. studojo.pro (staging) keeps its own rule,
// noindex everywhere (staging-host.ts). Pure.

export const CRAWL_NOINDEX = "noindex";

// EMAILER (11 Nov 2026): the free job email writer is a search landing page too; its share pages
// (/tools/emailer/s/<id>) are not (thin, one person's score), though link previews may read them.
const INDEXABLE_PAGES = new Set(["/", "/terms", "/privacy", "/refund-policy", "/tools/emailer"]);
const INDEXABLE_SECTIONS = ["/blog", "/reports"];

/** A page search engines may index: the homepage, /blog and /reports and everything under them, the legal pages, the
 * free email writer (not its share pages). */
export function indexablePath(pathname: string): boolean {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return INDEXABLE_PAGES.has(p) || INDEXABLE_SECTIONS.some((s) => p === s || p.startsWith(`${s}/`));
}

/** Adds X-Robots-Tag: noindex to a studojo.com page outside indexablePath. Staging's own noindex is left alone. */
export function markNoindex(request: Request, headers: Headers): void {
  if (stagingHost(request.headers.get("host")) || headers.has("X-Robots-Tag")) return;
  if (!indexablePath(new URL(request.url).pathname)) headers.set("X-Robots-Tag", CRAWL_NOINDEX);
}

// AI training crawlers and SEO scrapers: nothing at all. Answer engines that cite a page when someone asks
// (OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot) are not here: they read what Google reads, so the
// reports' FAQ work can still be cited.
const BLOCKED_BOTS = [
  "GPTBot", "CCBot", "Google-Extended", "Applebot-Extended", "ClaudeBot", "anthropic-ai", "Claude-Web", "Bytespider",
  "meta-externalagent", "FacebookBot", "Amazonbot", "cohere-ai", "cohere-training-data-crawler", "Diffbot", "AI2Bot",
  "Ai2Bot-Dolma", "PanguBot", "Timpibot", "ImagesiftBot", "Omgilibot", "Omgili", "Webzio-Extended", "img2dataset",
  "Scrapy", "magpie-crawler", "VelenPublicWebCrawler", "Kangaroo Bot", "PetalBot",
  "AhrefsBot", "AhrefsSiteAudit", "SemrushBot", "SiteAuditBot", "SplitSignalBot", "MJ12bot", "DotBot", "rogerbot",
  "BLEXBot", "DataForSeoBot", "Barkrowler", "serpstatbot", "SeekportBot", "MegaIndex", "ZoominfoBot",
];

// Link previews: one fetch of a page someone shared (a /go short link, the homepage, a report), never an index.
const PREVIEW_BOTS = ["facebookexternalhit", "Facebot", "LinkedInBot", "Twitterbot", "WhatsApp", "Slackbot", "TelegramBot", "Discordbot"];

// Everyone else: the indexable pages (the homepage with or without a query string, an ad's click ids) and what they
// load (built assets, fonts, images, the blog's pictures and share images, the sitemap).
const ALLOWED = [
  "/$", "/?", ...INDEXABLE_SECTIONS, "/terms", "/privacy", "/refund-policy", "/tools/emailer$", "/tools/emailer?",
  "/assets/", "/fonts/", "/api/blog-og/", "/api/images/blog-images/", "/sitemap.xml", "/llms.txt",
  "/*.css$", "/*.js$", "/*.png$", "/*.jpg$", "/*.jpeg$", "/*.webp$", "/*.svg$", "/*.ico$", "/*.woff2$",
];

/** studojo.com's robots.txt. */
export function robotsTxt(baseUrl: string): string {
  const agents = (names: string[]) => names.map((n) => `User-agent: ${n}`).join("\n");
  return `# Search engines may read the homepage, the blog, the reports, the legal pages and the free email writer. Link previews may read any page.

# AI training crawlers and SEO scrapers
${agents(BLOCKED_BOTS)}
Disallow: /

# Link previews
${agents(PREVIEW_BOTS)}
Allow: /

User-agent: *
${ALLOWED.map((p) => `Allow: ${p}`).join("\n")}
Disallow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
}
