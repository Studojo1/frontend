/**
 * The two pure gates on /pb and /pbadmin, with no other dependencies.
 *
 * Kept free of auth and db imports so app/lib/pb/access.test.mjs can load it
 * directly. Still .server so a component cannot pull the staff allowlist into
 * the client bundle. guard.server.ts builds the real request guards on top.
 */

/**
 * Staff who may open /pbadmin. Sign-in for staff is Google only (the guard
 * also checks the account rows), so these are Google addresses.
 *
 * PB_ADMIN_EMAILS (comma separated) replaces this list when it is set to at
 * least one address, so staff can change without a deploy.
 */
const DEFAULT_ADMIN_EMAILS = ["jeremy.zac@gmail.com"];

function adminEmails(): string[] {
  const fromEnv = process.env.PB_ADMIN_EMAILS?.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv?.length ? fromEnv : DEFAULT_ADMIN_EMAILS;
}

/**
 * True when this request may be served /pb or /pbadmin.
 *
 * The apex staging host only, plus localhost so the pages are developable.
 * Unlike /content this deliberately refuses every subdomain of studojo.pro:
 * sign-in cookies do not work there for this flow, and app.studojo.pro and
 * dashboard.studojo.pro route to the same pods, so a suffix match would open
 * the pages on hosts nobody meant to serve them on. studojo.com gets nothing.
 *
 * Reads Host first and x-forwarded-host only as a fallback, exactly like
 * isContentHost: a client can put anything in x-forwarded-host, so it can
 * neither open nor close the gate when a real Host header is present. Fails
 * closed (404) on anything unexpected.
 */
export function isPbHost(request: Request): boolean {
  if (!deploymentAllowsPb()) return false;
  const host = (
    request.headers.get("host") ??
    request.headers.get("x-forwarded-host") ??
    ""
  )
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");

  return host === "studojo.pro" || host === "localhost" || host === "127.0.0.1";
}

/**
 * The Host header is the client's to set, so on its own it cannot keep these
 * pages off production: a request sent to a production pod with a forged Host
 * would pass. BETTER_AUTH_URL is this deployment's own public address
 * (studojo.com in production), so when it is set it has to be the staging
 * apex or localhost too. Unset (tests, bare local runs) the header decides.
 */
function deploymentAllowsPb(): boolean {
  const raw = process.env.BETTER_AUTH_URL?.trim();
  if (!raw) return true;
  try {
    const h = new URL(raw).hostname.toLowerCase();
    return h === "studojo.pro" || h === "localhost" || h === "127.0.0.1";
  } catch {
    return false;
  }
}

/** True when this address is on the staff list. Exact match, case and whitespace insensitive. */
export function isPbAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}
