import { productHref } from "../../lib/product-origin";

// SITE-V2 (27 Oct 2026): the look of every studojo.pro page but the homepage (blog, reports, legal, contact, about,
// /auth, password pages, 404), from the owner's pick, the h1 prototype: soft off-white page with a faint dot grid,
// white cards, lowercase headings, small mono purple kickers, the purple pill "start the call".
//
// studojo.com never gets any of it. The root loader's b2cHost (app/lib/b2c-home.ts) decides per request; on
// studojo.com the root Layout adds no data-sv2 mark and links no SITE-V2 stylesheet, so its HTML is unchanged.
// Pure helpers here, for tests (app/lib/site-v2.test.mjs).

/** Where "how it works" goes: the homepage's "How it works" section (HOMEPAGE V3, HowItWorks.tsx, #how). QA-FIX (2 Nov
 * 2026): it was /#what, which V3 does not have, so every inner page's link landed at the top of the homepage. */
export const HOW_IT_WORKS = "/#how";
// RELAUNCH (2 Nov 2026): on the product's own host (PRODUCT_ORIGIN, app/lib/product-origin.ts), or under /b2cnew
// on this host without one.
export const STU_HOME = productHref("/");
export const STU_JOIN = productHref("/join");
export const BLOG = "/blog";
export const REPORTS = "/reports";
export const TERMS = "/terms";
export const PRIVACY = "/privacy";
export const REFUNDS = "/refund-policy";
export const CONTACT = "/contact";
export const SETTINGS = "/settings";
/** The owner's hand-drawn Stu: the logo's own laughing head, white with the rough outline, cut at the neck. Never on
 * a purple circle. */
export const STU_HEAD = "/stu/head-laugh.png";
/** The bare doodle logo (transparent cutout) for the header and footer wordmark. */
export const LOGO_DOODLE = "/stu/logo-doodle.png";

/** A main-site path as a link: absolute to the main site when `origin` is set (on the product's own host, host.tsx
 * useMainOrigin), else the path itself. Pure, for tests. */
export function mainHref(path: string, origin: string): string {
  return origin ? `${origin}${path.startsWith("/") ? path : `/${path}`}` : path;
}

/** Ad click keys carried from the page's URL onto the start link (mirrors PARAMS in app/lib/attribution.ts). */
export const TRACKING_KEYS = ["fbclid", "gclid", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

/**
 * "start the call" from any SITE-V2 page: /b2cnew/join with the page's ad click keys (utm_*, gclid, fbclid; each once,
 * its first value), then via=site&how=voice. Other query keys (a blog page number, a search) stay behind.
 * `held` is the visit's held first touch (attribution.ts heldTrackingParams), used only when the URL has no ad key,
 * so two different touches are never mixed. Pure, for tests.
 */
export function siteStartHref(search: string | null | undefined, held?: URLSearchParams | null): string {
  const here = new URLSearchParams(search ?? "");
  const out = new URLSearchParams();
  for (const key of TRACKING_KEYS) {
    const v = here.get(key);
    if (v) out.set(key, v);
  }
  if ([...out.keys()].length === 0 && held) {
    for (const key of TRACKING_KEYS) {
      const v = held.get(key);
      if (v) out.set(key, v);
    }
  }
  out.set("via", "site");
  out.set("how", "voice");
  return `${STU_JOIN}?${out}`;
}

export type Sv2Page = "blog" | "reports" | "report" | "legal" | "contact" | "about" | "auth" | "profile" | "account" | "error";

/**
 * Which SITE-V2 page a path is, or null for a path that keeps its own look (the homepage, the retired products, the
 * apps). Only asked on B2C hosts. "error" is set by the root error boundary, not here. Pure, for tests.
 */
export function sv2PageFor(pathname: string): Sv2Page | null {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/blog" || p.startsWith("/blog/")) return "blog";
  if (p === "/reports") return "reports";
  if (p.startsWith("/reports/")) return "report";
  if (p === "/terms" || p === "/privacy" || p === "/refund-policy") return "legal";
  if (p === "/contact") return "contact";
  if (p === "/about") return "about";
  if (p === "/auth" || p.startsWith("/auth/") || p === "/forgot-password" || p === "/reset-password") return "auth";
  // The account pages keep their own body but wear the site header (QA-FIX, 2 Nov 2026: without the SITE-V2 stylesheet
  // the header rendered unstyled at 1440 px).
  if (p === "/settings" || p === "/account/delete") return "account";
  // A student's public page (/profile/:slug; components/student-page/b2c). Not /profile itself, the old account page.
  if (/^\/profile\/[^/]+$/.test(p)) return "profile";
  return null;
}
