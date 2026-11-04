// SEC-4NOV (4 Nov 2026, the site audit): /api/auth/share-token-redirect puts the signed-in person's JWT in the hash of
// the address it sends them to, so it may only ever send them to the admin panel. Its one caller is the admin panel's
// login page (admin-panel app/routes/login.tsx, "Use credentials from main app"), which sends its own address: the
// panel on admin.studojo.com (production) or admin.studojo.pro (staging), or a local panel on a laptop (port 3001).
// Pure: the address is read twice (as the browser parses it, and as written), and both must name an allowed origin.

/** The admin panel's own origins, in every environment. */
export const SHARE_TOKEN_ORIGINS: ReadonlySet<string> = new Set(["https://admin.studojo.com", "https://admin.studojo.pro"]);

/** A local admin panel, any port: allowed only when the site does not run in production. */
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/;

/** Whether the token may go to `redirect`: an absolute http(s) address on an allowed origin, with no user or password. */
export function isShareTokenTarget(redirect: string | null | undefined, nodeEnv: string | undefined): boolean {
  if (typeof redirect !== "string" || !redirect) return false;
  let url: URL;
  try {
    url = new URL(redirect);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (url.username || url.password) return false;
  const allowed = SHARE_TOKEN_ORIGINS.has(url.origin) || (nodeEnv !== "production" && LOCAL_ORIGIN.test(url.origin));
  if (!allowed) return false;
  // As written, too: the origin exactly, then the end, a path, a query or a hash. Nothing the parser would rewrite
  // (a backslash, a user part, a default port, upper case) gets through.
  if (!redirect.startsWith(url.origin)) return false;
  const next = redirect.charAt(url.origin.length);
  return next === "" || next === "/" || next === "?" || next === "#";
}
