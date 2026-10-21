// NOINDEX: studojo.pro is staging; its pages must never be in search engines, while studojo.com's are untouched.
// From the request's Host header (set by the ingress that routed it, not X-Forwarded-Host, which a client can set):
// studojo.pro or one of its subdomains, and nothing else. Pure. (Studojo1/career-agent has the same rule.)
export const STAGING_NOINDEX = "noindex, nofollow";

export function stagingHost(host: string | null | undefined): boolean {
  const h = (host ?? "").split(":")[0].trim().toLowerCase().replace(/\.$/, "");
  return h === "studojo.pro" || h.endsWith(".studojo.pro");
}

/** Adds X-Robots-Tag: noindex, nofollow to a response's headers when the request came for studojo.pro. */
export function markStaging(request: Request, headers: Headers): void {
  if (stagingHost(request.headers.get("host"))) headers.set("X-Robots-Tag", STAGING_NOINDEX);
}
