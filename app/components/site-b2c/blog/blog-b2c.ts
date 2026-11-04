import { processBlogContentHtml } from "~/components/blog/blog-content";
import { STU_JOIN, siteStartHref } from "../site-links";
import { STU_CTA_QUIET, stuCtaHtml, stuGoInner, stuVia, withVia } from "../stu-cta";

// SITE-V2 blog (B2C hosts only): pure helpers for the blog index and post pages. studojo.com never calls these; its
// blog keeps components/blog/* exactly as they were (Outreach CTAs, job.studojo.com rewrite to /outreach).
// CTA-NEW (4 Nov 2026): RELAUNCH made studojo.com a B2C host too, so these now draw every post on studojo.com. The
// Stu card is the shared one (stu-cta.ts, StuCta.tsx), and every start link in a post carries via=blog-<slug>.

export { stuGoInner, withVia };

/** Where a job.studojo.com link in a post body goes on B2C hosts when no post is known (never /outreach). */
export const BLOG_JOB_LINK = `${STU_JOIN}?via=blog&how=voice`;

/** "start the call" for one post: /b2cnew/join with the URL's ad keys, via=blog-<slug>, how=voice. Pure, deterministic. */
export function blogStartHref(slug: string, search: string | null | undefined): string {
  return withVia(siteStartHref(search, null), stuVia("blog", slug));
}

/** The one line on every Stu card in a post (React card and HTML card alike). */
export const STU_CARD_LINE = STU_CTA_QUIET;

/** The quiet Stu card as an HTML string, for CTA spots inside post HTML (stu-cta.ts stuCtaHtml, the quiet size). */
export function stuCardHtml(href: string): string {
  return stuCtaHtml({ href, size: "quiet", place: "blog-inline" });
}

// QA-FIX (2 Nov 2026): the blog's posts live in the database (production only) and still carry the retired product's
// claims: "8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent..." (old
// counts; the account count is about 8,700), "a one-time payment, not a subscription" (old pricing), and "people
// sourced from 20,000+ databases" (unproven). They are rewritten as the page renders, so every post is fixed without
// editing 46 rows by hand. Pure, for tests (app/lib/site-v2.test.mjs). Competitors' own pricing lines are kept.
export const SIGNED_UP_LINE = "8,700+ students have signed up to Studojo.";
export const PRICE_LINE =
  "Talking to Stu is free, and so are your top matches every day. You pay to see every match, and emailing the people hiring uses credits.";
const APOS = "(?:'|&#39;|&#x27;|&rsquo;|\u2019)";
const OLD_COUNTS = new RegExp(
  `(?:(?:So far|(?:Our|The) (?:numbers|counts?|scale) so far)[,:]\\s*)?8,500\\+ students (?:have )?signed up, 4,000\\+ (?:have been )?matched with hiring managers and 28,000\\+ personal emails (?:sent|have gone out) from students${APOS} own Gmail \\(Studojo${APOS}s own records, September 2026\\)\\.`,
  "gi",
);

export function fixBlogClaims(html: string): string {
  if (!html) return html;
  let out = html.replace(OLD_COUNTS, SIGNED_UP_LINE);
  // A sentence on Studojo's old one-time price: the 20,000+ databases ones go, the rest say what is paid for today.
  // A dropped sentence that followed a colon (a link's "...with Studojo</a>: setup takes...") leaves a period instead.
  out = out.replace(/(:?)([^.<>:]*\bone-time payment\b[^.<>]*\.)/gi, (all, colon: string, m: string) => {
    if (/subscription, not a one-time payment/i.test(m)) return all; // a competitor's own pricing
    if (/20,000\+ databases/i.test(m)) return colon ? "." : "";
    const lead = /^\s/.test(m) ? " " : "";
    return `${colon}${lead}${PRICE_LINE}${/replies are not guaranteed/i.test(m) ? " Replies are not guaranteed." : ""}`;
  });
  // a comparison table's cell
  out = out.replace(/>(\s*)One-time payment, not a subscription(\s*)</gi, ">$1Free to start, then credits to email the people hiring$2<");
  // "People sourced from 20,000+ databases": as its own sentence it goes; as a trailing clause it is cut
  out = out.replace(/[^.<>:]*\b(?:people|sourced)\b[^.<>]*\bsourced from 20,000\+ databases\b[^.<>]*\./gi, (m) =>
    /^\s*(?:The people|People)\b/i.test(m) ? "" : m.replace(/,? with people sourced from 20,000\+ databases/i, ""),
  );
  out = out.replace(/,? with people sourced from 20,000\+ databases/gi, "");
  return out;
}

/**
 * Post HTML for B2C hosts. Every CTA spot in a post becomes the Stu card: the writer's placeholder
 * (data-studojo-cta="stu", the CTA-NEW migration's, or the older "outreach") and an already rendered Outreach CTA saved
 * into a post. Every start link in the text (the migration marks them data-stu-start; also any link left to the retired
 * Outreach page or job.studojo.com) points at this post's start link and is marked data-sv-blog-link, so the page can
 * swap in the signed-in or held-first-touch link after hydration. Then the claims fixes and the shared image fixes.
 */
export function processBlogHtmlB2c(html: string, startHref: string): string {
  if (!html) return html;
  const href = startHref.replace(/&/g, "&amp;");
  const card = stuCardHtml(startHref);
  let out = html.replace(/<div[^>]*data-studojo-cta="rendered"[^>]*>[\s\S]*?<\/a>\s*<\/div>/gi, card);
  out = out.replace(/<div[^>]*data-studojo-cta="(?:outreach|stu)"[^>]*>[\s\S]*?<\/div>/gi, card);
  // a start link the migration wrote (<a ... data-stu-start ...>): this post's live start link
  out = out.replace(/<a\b([^>]*?)\sdata-stu-start(?:=(?:""|''))?([^>]*)>/gi, (_m, a: string, b: string) => {
    const attrs = `${a}${b}`.replace(/\shref\s*=\s*(?:"[^"]*"|'[^']*')/i, "");
    return `<a href="${href}" data-sv-blog-link=""${attrs}>`;
  });
  // a writer's own link to the retired Outreach page (studojo.com/outreach or /outreach) or the old job board
  out = out.replace(
    /(href\s*=\s*["'])(?:(?:https?:\/\/(?:www\.)?studojo\.com)?\/outreach(?:[/?#][^"']*)?|https?:\/\/(?:jobs?\.studojo\.com|jobstudojo\.com)[^"']*)(["'])/gi,
    `$1${href}$2 data-sv-blog-link=""`,
  );
  out = out.replace(/https?:\/\/job\.studojo\.com[^\s"'<>]*/gi, BLOG_JOB_LINK.replace(/&/g, "&amp;"));
  return processBlogContentHtml(fixBlogClaims(out));
}

/**
 * Where the mid-article Stu card goes on B2C: just before the first <h2> past the quarter mark (so a section is never
 * cut from its heading), else after the third paragraph. Short posts, or posts with neither, get no mid card.
 */
export function splitForStu(html: string): [string, string] {
  if (!html || html.length < 600) return [html, ""];
  const quarter = Math.floor(html.length * 0.25);
  const h2 = /<h2[\s>]/gi;
  let m: RegExpExecArray | null;
  while ((m = h2.exec(html)) !== null) {
    if (m.index > quarter) return [html.slice(0, m.index), html.slice(m.index)];
  }
  const p = /<\/p>/gi;
  let n = 0;
  while ((m = p.exec(html)) !== null) {
    n++;
    if (n === 3) {
      const at = m.index + m[0].length;
      if (html.slice(at).trim()) return [html.slice(0, at), html.slice(at)];
      break;
    }
  }
  return [html, ""];
}

/** "Oct 26, 2026", the same on server and browser (UTC), or "" for a missing date. */
export function blogDate(iso: string, month: "short" | "long" = "short"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month, day: "numeric", timeZone: "UTC" });
}

