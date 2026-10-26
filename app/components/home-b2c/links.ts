import { useRouteLoaderData } from "react-router";
import { authUrl } from "~/lib/return-to";

// Every address the B2C homepage, header and footer link to, in one place, so the chosen design only
// changes how they look.
//
// /b2cnew is another app on this host (Studojo1/career-agent, app/lib/other-apps.ts). Links into it are a
// plain <a href>, a full page load, never this site's router <Link>: the router would ask that app for its
// data and show this site's error page (commit 93ba6dd).
export const STU_START = "/b2cnew/start";
export const STU_HOME = "/b2cnew";
/** Defines the <stu-agent> web component; served by career-agent. Loaded on the B2C homepage only (stu-embed.tsx). */
export const STU_EMBED_SRC = "/b2cnew/embed/stu.js";

/** Sign in, then on to the student's agent (/auth hands /b2cnew over with a full page load). */
export const SIGN_IN = authUrl("signin", STU_HOME);

export const BLOG = "/blog";
export const REPORTS = "/reports";
export const TERMS = "/terms";
export const PRIVACY = "/privacy";
export const REFUNDS = "/refund-policy";
export const CONTACT_EMAIL = "admin@studojo.com";

/** In-page sections of the B2C homepage (ids on HowItWorks and JobsProof). */
export const SECTION_HOW = "how";
export const SECTION_JOBS = "jobs";

/** "Talk to Stu": signed out, the agent's start; signed in, the agent itself. */
export function stuHref(signedIn: boolean): string {
  return signedIn ? STU_HOME : STU_START;
}

/** True on hosts that get the B2C homepage, header and footer (root loader, app/lib/b2c-home.ts). */
export function useB2cHost(): boolean {
  const data = useRouteLoaderData("root") as { b2cHost?: boolean } | undefined;
  return data?.b2cHost === true;
}
