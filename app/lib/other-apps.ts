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
