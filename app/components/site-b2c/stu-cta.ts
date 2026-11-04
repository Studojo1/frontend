import { STU_HEAD, STU_JOIN } from "./site-links";

// CTA-NEW (4 Nov 2026, the owner: "on the blogs change the cta to the new product and rewrite all cta's for the new
// product"): the one call to action on every blog post and report. One ask: start the call with Stu, Studojo's
// career agent. Stu finds jobs that fit you, finds who's hiring and writes the email to them. The button is the
// homepage's own start (site-links.ts siteStartHref, ui.tsx useSiteStart): the platform's /join with the page's ad
// keys, how=voice and via=blog-<slug> or via=report-<slug>, so every start is counted to the page it came from.
// The React card is StuCta.tsx; stuCtaHtml() draws the same card as an HTML string for CTA spots inside a post's
// HTML. Look: site.css (.sv-stu-cta). Pure, for tests (app/lib/cta-new.test.mjs).

export type StuCtaSize = "card" | "quiet";

/** The default copy (a page's own title and line, written for its topic, go in their place). */
export const STU_CTA_KICKER = "stu, your career agent";
export const STU_CTA_TITLE = "Tell Stu the job you want. Stu does the rest.";
export const STU_CTA_LINE =
  "One short call with Stu, Studojo's career agent. Stu finds jobs that fit you, finds who's hiring and writes the email to them.";
/** The quiet card's one line (inside a blog post). */
export const STU_CTA_QUIET = "Stu, Studojo's career agent, finds jobs that fit you and the people hiring for them, after one short call.";
export const STU_CTA_GO = "start the call";
export const STU_CTA_GO_SIGNED = "my jobs";
export const STU_CTA_NOTE = "free to start";

/** The `via` for a page: blog-<slug> or report-<slug> (what the homepage's via=home is to the homepage). */
export function stuVia(kind: "blog" | "report", slug: string): string {
  const clean = String(slug ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
  return clean ? `${kind}-${clean}` : kind;
}

/** The start link with its `via` replaced (keeps utm/gclid/fbclid and how=voice). Signed-in links (no query) pass through. */
export function withVia(href: string, via: string): string {
  const q = href.indexOf("?");
  if (q < 0) return href;
  const params = new URLSearchParams(href.slice(q + 1));
  if (!params.has("via")) return href;
  params.set("via", via);
  return `${href.slice(0, q)}?${params}`;
}

/** The no-script start link for a page (no ad keys): the platform's /join, via=<via>, how=voice. Pure. */
export function stuStartFallback(via: string, join: string = STU_JOIN): string {
  return `${join}?${new URLSearchParams({ via, how: "voice" })}`;
}

const MIC_SVG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
const ARROW_SVG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** The inner HTML of a card's button: mic + "start the call", or (signed in) arrow + "my jobs". */
export function stuGoInner(signedIn: boolean): string {
  return signedIn ? `${ARROW_SVG}<span>${STU_CTA_GO_SIGNED}</span>` : `${MIC_SVG}<span>${STU_CTA_GO}</span>`;
}

/**
 * The card as an HTML string (the same markup StuCta.tsx renders), for CTA spots inside a post's HTML where React
 * cannot go. The button carries data-sv-blog-start, so the page can point it at the signed-in or held-first-touch
 * link after hydration without re-rendering the post body.
 */
export function stuCtaHtml(opts: { href: string; size?: StuCtaSize; title?: string; line?: string; place?: string }): string {
  const size = opts.size ?? "quiet";
  const place = opts.place ?? "blog-inline";
  const title = size === "quiet" ? opts.title || STU_CTA_QUIET : opts.title || STU_CTA_TITLE;
  const copy =
    size === "quiet"
      ? `<p class="sv-stu-cta-title">${esc(title)}</p>`
      : `<span class="sv-kicker sv-stu-cta-kick">${STU_CTA_KICKER}</span>` +
        `<p class="sv-stu-cta-title">${esc(title)}</p>` +
        `<p class="sv-stu-cta-line">${esc(opts.line || STU_CTA_LINE)}</p>`;
  return (
    `<aside class="sv-stu-cta" data-size="${size}" data-studojo-cta="stu" aria-label="stu, your career agent">` +
    `<img class="sv-stu-cta-head" src="${STU_HEAD}" alt="" width="56" height="56">` +
    `<div class="sv-stu-cta-copy">${copy}</div>` +
    `<div class="sv-stu-cta-act">` +
    `<a class="sv-btn sv-btn-sm sv-stu-cta-go" href="${esc(opts.href)}" data-sv-blog-start="" data-start="${esc(place)}">${stuGoInner(false)}</a>` +
    (size === "card" ? `<span class="sv-stu-cta-note">${STU_CTA_NOTE}</span>` : "") +
    `</div>` +
    `</aside>`
  );
}

// ── What may never be offered again: the retired products (RELAUNCH, 2 Nov 2026). Shared by the CTA test
// (app/lib/cta-new.test.mjs) and the blog migration (scripts/cta-new-blog-migrate.ts).

/** Old product names and claims a page may not sell. Case-insensitive. */
export const RETIRED_PRODUCT_PHRASES: readonly RegExp[] = Object.freeze([
  /\bInternship Dojo\b/i,
  /\bCareers? Dojo\b/i,
  /\bAssignment Dojo\b/i,
  /\bRevision Dojo\b/i,
  /\bStudojo Outreach\b/, // the product name (a source line "Studojo outreach conversion data" is a fact)
  /\bStudojo'?s? (?:free )?resume builder\b/i,
  /\bresume builder\b[^.]{0,40}\bStudojo\b/i,
  /\bone-time (?:purchase|payment)\b[^.]{0,30}\bnot a subscription\b/i,
  /\bStudojo is a one-time\b/i,
  /\b(?:Stu|Studojo)\b[^.]{0,60}\btailors? your resume\b/i,
  /\bjobs?\.studojo\.com\b/i,
  /\bJobStudojo\.com\b/i,
  /\b20,000\+ databases\b/i,
]);

/** Links to the retired products' own hosts (the paths are checked with retired-routes.ts isRetiredPath). */
export const RETIRED_HOSTS: readonly RegExp[] = Object.freeze([
  /^https?:\/\/jobs?\.studojo\.com/i,
  /^https?:\/\/jobstudojo\.com/i,
  /^https?:\/\/partners\.studojo\.com/i,
]);
