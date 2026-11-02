import { isPlatformHost } from "./b2c-home";

// Addresses on this host that other apps serve: the ingress sends these prefixes past this site (career-agent's
// /b2cnew, outreach-flow's /flow, outreach-start's /new and the rest). This site's router cannot open one in the
// page: its data request for /b2cnew/start goes to career-agent, whose answer it cannot read, and the student sees
// this site's error page. Leaving for one of them is a full page load. Keep in step with the studojo.pro ingress.
export const OTHER_APPS = [
  "/b2cnew",
  "/flow",
  "/new",
  "/lkot",
  "/clips",
  "/gate",
  "/BOB2",
  "/sensei-demo",
  "/sensei-elements",
  "/sensei-live",
] as const;

/** Whether a same-site address ("/b2cnew/start?fresh") belongs to another app on this host. */
export function isOtherApp(to: string): boolean {
  const path = to.split(/[?#]/)[0];
  return OTHER_APPS.some((app) => path === app || path.startsWith(`${app}/`));
}

/** Whether `to` ("/auth/2fa", "/start?fresh") is one of this site's own sign-in pages (/auth and below). */
function isAuthPage(to: string): boolean {
  const path = to.split(/[?#]/)[0];
  return path === "/auth" || path.startsWith("/auth/");
}

/**
 * Whether /auth moves on to `to` with a full page load rather than this site's router. Another app's address, on any
 * host; and on the product's own host (platform.studojo.com or .pro, b2c-home.ts), every address but this site's own
 * /auth pages, since there the ingress sends only /auth to this app: "/start" or "/" is career-agent's, and a router
 * move would show this site's error page (QA-FIX, 2 Nov 2026). Pure, for tests (app/lib/other-apps.test.mjs).
 */
export function leavesByFullLoad(to: string, host: string | null | undefined): boolean {
  if (isOtherApp(to)) return true;
  return isPlatformHost(host) && !isAuthPage(to);
}
