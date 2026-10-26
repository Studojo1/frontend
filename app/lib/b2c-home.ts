// HOMEPAGE (27 Oct 2026): studojo.pro (staging) shows the B2C homepage, Studojo's job agent only
// (app/components/home-b2c), and a header and footer without the old products. studojo.com keeps the
// current homepage. One code base serves both, so the choice is made per request, on the server:
//
// 1. The request's Host header (set by the ingress that routed it; X-Forwarded-Host is never read) is
//    studojo.pro or www.studojo.pro, or localhost / 127.0.0.1 for local runs. Subdomains are not:
//    app. and dashboard. are Sensei, admin. is the admin panel.
// 2. And this deployment is not production: when BETTER_AUTH_URL (the deployment's own public address)
//    is set, it must be one of those hosts too. On studojo.com it is https://studojo.com, so a forged
//    Host header can never switch production's homepage, even if this code reaches main.
//
// Pure, for tests (app/lib/b2c-home.test.mjs).

const B2C_HOSTS = new Set(["studojo.pro", "www.studojo.pro", "localhost", "127.0.0.1"]);

function bareHost(host: string | null | undefined): string {
  return (host ?? "").split(",")[0].trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}

/** Whether this deployment may show the B2C homepage at all (never on studojo.com). */
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
