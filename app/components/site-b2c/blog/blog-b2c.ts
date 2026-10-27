import { processBlogContentHtml } from "~/components/blog/blog-content";
import { STU_HEAD, STU_JOIN, siteStartHref } from "../site-links";

// SITE-V2 blog (B2C hosts only): pure helpers for the blog index and post pages. studojo.com never calls these; its
// blog keeps components/blog/* exactly as they were (Outreach CTAs, job.studojo.com rewrite to /outreach).

/** Where a job.studojo.com link in a post body goes on B2C hosts (never /outreach). */
export const BLOG_JOB_LINK = `${STU_JOIN}?via=blog&how=voice`;

/** The start link with its `via` replaced (keeps utm/gclid/fbclid and how=voice). Signed-in links (no query) pass through. */
export function withVia(href: string, via: string): string {
  const q = href.indexOf("?");
  if (q < 0) return href;
  const params = new URLSearchParams(href.slice(q + 1));
  if (!params.has("via")) return href;
  params.set("via", via);
  return `${href.slice(0, q)}?${params}`;
}

/** "start the call" for one post: /b2cnew/join with the URL's ad keys, via=blog-<slug>, how=voice. Pure, deterministic. */
export function blogStartHref(slug: string, search: string | null | undefined): string {
  return withVia(siteStartHref(search, null), `blog-${slug}`);
}

const MIC_SVG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
const ARROW_SVG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

/** The one line on every Stu card in a post (React card and HTML card alike). */
export const STU_CARD_LINE = "Stu, Studojo's job agent, finds jobs that fit you after one short call.";

function escAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/** The inner HTML of a Stu card's start link: mic + "start the call", or (signed in) arrow + "my jobs". */
export function stuGoInner(signedIn: boolean): string {
  return signedIn ? `${ARROW_SVG}<span>my jobs</span>` : `${MIC_SVG}<span>start the call</span>`;
}

/**
 * The quiet Stu card as an HTML string, for CTA placeholders inside post HTML (where React components cannot go).
 * Plain classes, styled in site-blog.css. The link carries data-sv-blog-start so the page can point it at the
 * signed-in or held-first-touch link after hydration without re-rendering the post body.
 */
export function stuCardHtml(href: string): string {
  return (
    `<div class="sv-blog-stu" data-studojo-cta="stu">` +
    `<img class="sv-blog-stu-head" src="${STU_HEAD}" alt="" width="52" height="52">` +
    `<p class="sv-blog-stu-line">${STU_CARD_LINE}</p>` +
    `<a class="sv-btn sv-btn-sm sv-blog-stu-go" href="${escAttr(href)}" data-sv-blog-start="" data-start="blog-inline">${stuGoInner(false)}</a>` +
    `</div>`
  );
}

/**
 * Post HTML for B2C hosts: job.studojo.com links go to the job agent (not /outreach), every Outreach CTA placeholder
 * (and an already rendered Outreach CTA saved into a post) becomes the Stu card, links to /outreach go to the job
 * agent, then the shared image fixes.
 */
export function processBlogHtmlB2c(html: string, startHref: string): string {
  if (!html) return html;
  const jobLink = BLOG_JOB_LINK.replace(/&/g, "&amp;");
  let out = html.replace(/https?:\/\/job\.studojo\.com[^\s"'<>]*/gi, jobLink);
  const card = stuCardHtml(startHref);
  out = out.replace(/<div[^>]*data-studojo-cta="rendered"[^>]*>[\s\S]*?<\/a>\s*<\/div>/gi, card);
  out = out.replace(/<div[^>]*data-studojo-cta="outreach"[^>]*>[\s\S]*?<\/div>/gi, card);
  // a writer's own link to the retired Outreach page (studojo.com/outreach or /outreach) goes to the job agent too
  out = out.replace(/(href\s*=\s*["'])(?:https?:\/\/(?:www\.)?studojo\.com)?\/outreach(?:[/?#][^"']*)?(["'])/gi, `$1${jobLink}$2`);
  return processBlogContentHtml(out);
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

