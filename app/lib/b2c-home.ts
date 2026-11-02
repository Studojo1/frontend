// HOMEPAGE: which hosts get the new site (the B2C homepage, app/components/home-v3, and the SITE-V2 header, footer
// and pages). One code base serves every host, so the choice is made per request, on the server.
//
// RELAUNCH (2 Nov 2026, the owner): studojo.com gets the site studojo.pro showed. The same homepage on studojo.com,
// www.studojo.com and studojo.pro. Before this, studojo.pro (staging) was the only B2C host and studojo.com kept the
// old homepage.
//
// 1. The request's Host header (set by the ingress that routed it; X-Forwarded-Host is never read) is studojo.com,
//    studojo.pro or their www, platform.studojo.com or platform.studojo.pro (only their sign-in pages reach this app),
//    or localhost / 127.0.0.1 for local runs. Subdomains are not: app. and dashboard. are
//    Sensei, admin. is the admin panel, and they keep exactly what they had.
// 2. And, when BETTER_AUTH_URL (the deployment's own public address) is set, it is one of those hosts too, so a
//    deployment for some other address never draws this site by accident.
//
// Pure, for tests (app/lib/b2c-home.test.mjs).

// The product's own hosts: this app serves only their /auth and /api/auth (sign-in), in the new look. Everything else
// on them (/, /join, /start) is career-agent's, so a page of this app there leaves with a full page load and links to
// the main site's pages absolutely (QA-FIX, 2 Nov 2026: app/lib/other-apps.ts, product-origin.ts mainOriginFrom).
const PLATFORM_HOSTS = new Set(["platform.studojo.com", "platform.studojo.pro"]);

const B2C_HOSTS = new Set([
  "studojo.com",
  "www.studojo.com",
  "studojo.pro",
  "www.studojo.pro",
  ...PLATFORM_HOSTS,
  "localhost",
  "127.0.0.1",
]);

function bareHost(host: string | null | undefined): string {
  return (host ?? "").split(",")[0].trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}

/** Whether a Host is the product's own (platform.studojo.com or platform.studojo.pro). Pure. */
export function isPlatformHost(host: string | null | undefined): boolean {
  return PLATFORM_HOSTS.has(bareHost(host));
}

/** Whether this deployment may show the B2C homepage at all (its own address is one of the B2C hosts). */
export function deploymentAllowsB2c(deploymentUrl: string | null | undefined): boolean {
  const raw = (deploymentUrl ?? "").trim();
  if (!raw) return true;
  try {
    return B2C_HOSTS.has(bareHost(new URL(raw).host));
  } catch {
    return false;
  }
}

/** Whether a request for this Host, on this deployment, gets the B2C homepage, header and footer. */
export function b2cHomeHost(host: string | null | undefined, deploymentUrl: string | null | undefined): boolean {
  return B2C_HOSTS.has(bareHost(host)) && deploymentAllowsB2c(deploymentUrl);
}

/** The same rule for a Request, with this process's BETTER_AUTH_URL. Server only (loaders). */
export function isB2cRequest(request: Request): boolean {
  return b2cHomeHost(request.headers.get("host"), process.env.BETTER_AUTH_URL);
}

/** HOMEPAGE V3 unless the server's HOME_V3 is "0" (the undo: HOMEPAGE V2). Unset is V3, so studojo.com, whose deploy
 * never sets it, shows the same page as studojo.pro. Pure. */
export function homeV3On(value: string | undefined): boolean {
  return (value ?? "").trim() !== "0";
}
