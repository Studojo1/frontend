import { useRouteLoaderData } from "react-router";
import { authUrl } from "../../lib/return-to";

// Every address the B2C homepage, header and footer link to, in one place, so the design only changes how
// they look.
//
// /b2cnew is another app on this host (Studojo1/career-agent, app/lib/other-apps.ts). Links into it are a
// plain <a href>, a full page load, never this site's router <Link>: the router would ask that app for its
// data and show this site's error page (commit 93ba6dd).
export const STU_HOME = "/b2cnew";
/** Signed out, every way in: a quick sign-up, then straight into the call (owner rule, 27 Oct: every way in goes
 * through /b2cnew/join, and the homepage links nothing else in /b2cnew but "my jobs"). */
export const STU_JOIN = "/b2cnew/join";
/** The script that defines career-agent's stu-agent web component (stu-embed.tsx). Not loaded on the homepage (owner, 27 Oct). */
export const STU_EMBED_SRC = "/b2cnew/embed/stu.js";

/** Sign in, then on to the student's agent (/auth hands /b2cnew over with a full page load). */
export const SIGN_IN = authUrl("signin", STU_HOME);

/** Account settings, account deletion included: in the signed-in header menu, so it stays reachable. */
export const SETTINGS = "/settings";

/** Stu's art, the owner's hand-drawn head on the logo purple circle (27 Oct). ONE place to swap it.
 * STU_HEAD: the laughing head (the small round slots and the hero's default); STU_FACES: the hero's cross-fade. */
export const STU_HEAD = "/stu/head-laugh.png";
export const STU_FACES = ["/stu/head-sparkle.png", "/stu/head-happy.png", "/stu/head-grin.png", STU_HEAD] as const;

export const BLOG = "/blog";
export const REPORTS = "/reports";
export const TERMS = "/terms";
export const PRIVACY = "/privacy";
export const REFUNDS = "/refund-policy";
export const CONTACT_EMAIL = "admin@studojo.com";

/** In-page sections of the B2C homepage, in page order (h-sections.html). */
export const SECTION_WHAT = "what";
export const SECTION_CALL = "call";
export const SECTION_BRIEF = "brief";
export const SECTION_MATCHES = "matches";
export const SECTION_GETJOB = "getjob";
export const SECTION_MORE = "more";
export const SECTION_PROOF = "proof";
export const SECTION_EXPECT = "expect";
export const SECTION_FAQ = "faq";
export const SECTION_READ = "read";

/**
 * The way into the agent from the homepage, signed out: /b2cnew/join with the visit's whole landing query (utm_*,
 * gclid, fbclid and anything else), each key once (its first value), then via=home&how=voice, replacing any via or
 * how the query brought. Pure, for tests.
 */
export function startHref(landingSearch: string | null | undefined): string {
  const landing = new URLSearchParams(landingSearch ?? "");
  const out = new URLSearchParams();
  for (const [key, value] of landing) {
    if (key === "via" || key === "how" || out.has(key)) continue;
    out.append(key, value);
  }
  out.set("via", "home");
  out.set("how", "voice");
  return `${STU_JOIN}?${out}`;
}

/**
 * Every "start the call" button. Signed in it becomes "open my jobs" to /b2cnew: sending a student through
 * /join again would restart their onboarding. Pure, for tests.
 */
export function startCta(signedIn: boolean, landingSearch: string | null | undefined): { label: string; href: string } {
  return signedIn ? { label: "open my jobs", href: STU_HOME } : { label: "start the call", href: startHref(landingSearch) };
}

/** True on hosts that get the B2C homepage, header and footer (root loader, app/lib/b2c-home.ts). */
export function useB2cHost(): boolean {
  const data = useRouteLoaderData("root") as { b2cHost?: boolean } | undefined;
  return data?.b2cHost === true;
}
