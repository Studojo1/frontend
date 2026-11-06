// EMQ-IP6 (6 Nov 2026, Events Manager on Lead and CompleteRegistration: "Update to IPv6 ... Your server is sending IPv4
// IP addresses through Conversions API, but we observe IPv6 IP addresses received through Meta Pixel"): our cluster
// answers on IPv4 only, so a server copy carried the IPv4 address (on an Indian mobile network, the carrier's shared one)
// while the pixel's came from the phone's own IPv6. The browser asks IP6_ECHO_URL (our own Azure web app studojo-ip6,
// IPv4 and IPv6, on the B1 plan of the Retell webhook) for its IPv6 address and keeps it in the IP6_COOKIE cookie on the
// parent domain for IP6_MAX_AGE_S ("-" when it has none, so it does not ask again); a server copy sends it as
// client_ip_address in place of the IPv4 one (meta-capi.server.ts metaUserDataFromRequest). The platform
// (Studojo1/career-agent app/lib/meta.ts) has the same helpers and reads the same cookie. Pure.

export const IP6_ECHO_URL = "https://studojo-ip6.azurewebsites.net/";
export const IP6_COOKIE = "stu_ip6";
export const IP6_MAX_AGE_S = 1800;

/** A public (global unicast, 2000::/3) IPv6 address, plain hex and colons, lower case; anything else null. */
export function publicIpv6(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase();
  if (s.length > 39 || !/^[23][0-9a-f]{3}:[0-9a-f:]+$/.test(s)) return null;
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const groups = halves.flatMap((h) => (h ? h.split(":") : []));
  if (groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return (halves.length === 2 ? groups.length <= 7 : groups.length === 8) ? s : null;
}

/** The parent domain the IP6_COOKIE goes on, so both hosts read it: studojo.com or studojo.pro; null elsewhere. */
export function ip6CookieDomain(hostname: string): string | null {
  return /(?:^|\.)(studojo\.(?:com|pro))$/.exec(hostname.toLowerCase())?.[1] ?? null;
}
