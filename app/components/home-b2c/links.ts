import { useRouteLoaderData } from "react-router";
import { authUrl } from "../../lib/return-to";

// Every address the B2C homepage, header and footer link to, in one place, so the design only changes how
// they look.
//
// /b2cnew is another app on this host (Studojo1/career-agent, app/lib/other-apps.ts). Links into it are a
// plain <a href>, a full page load, never this site's router <Link>: the router would ask that app for its
// data and show this site's error page (commit 93ba6dd).
export const STU_HOME = "/b2cnew";
/** Signed out, "start the call": a quick sign-up, then straight into the voice call. */
export const STU_JOIN = "/b2cnew/join";
/** Signed out, "prefer typing?": the typed set-up. */
export const STU_START = "/b2cnew/start";
/** Defines the <stu-agent> web component; served by career-agent. Loaded on the B2C homepage only (stu-embed.tsx). */
export const STU_EMBED_SRC = "/b2cnew/embed/stu.js";

/** Sign in, then on to the student's agent (/auth hands /b2cnew over with a full page load). */
export const SIGN_IN = authUrl("signin", STU_HOME);

/** Account settings, account deletion included: in the signed-in header menu, so it stays reachable. */
export const SETTINGS = "/settings";

/** Stu's static art (the hero's fallback, the floating start, the footer, the call example). ONE place to swap it. */
export const STU_ART = "/stu/stu2-speak.svg";

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

export type StartHow = "voice" | "type";

/**
 * The way into the agent from the homepage, signed out. "voice" is the big "start the call" button
 * (/b2cnew/join), "type" the small "prefer typing?" link (/b2cnew/start). The visit's whole landing query is
 * kept (utm_*, gclid, fbclid and anything else), each key once (its first value), and via=home&how=<how> is
 * set last, replacing any via or how the query brought. Pure, for tests.
 */
export function startHref(landingSearch: string | null | undefined, how: StartHow): string {
  const landing = new URLSearchParams(landingSearch ?? "");
  const out = new URLSearchParams();
  for (const [key, value] of landing) {
    if (key === "via" || key === "how" || out.has(key)) continue;
    out.append(key, value);
  }
  out.set("via", "home");
  out.set("how", how);
  return `${how === "voice" ? STU_JOIN : STU_START}?${out}`;
}

/**
 * Every "start the call" button. Signed in it becomes "open my jobs" to /b2cnew: sending a student through
 * /join again would restart their onboarding. Pure, for tests.
 */
export function startCta(signedIn: boolean, landingSearch: string | null | undefined): { label: string; href: string } {
  return signedIn ? { label: "open my jobs", href: STU_HOME } : { label: "start the call", href: startHref(landingSearch, "voice") };
}

/** True on hosts that get the B2C homepage, header and footer (root loader, app/lib/b2c-home.ts). */
export function useB2cHost(): boolean {
  const data = useRouteLoaderData("root") as { b2cHost?: boolean } | undefined;
  return data?.b2cHost === true;
}
