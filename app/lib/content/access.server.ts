/**
 * The two gates on /content, with no other dependencies.
 *
 * Split out of guard.server.ts so they can be tested without pulling in
 * better-auth and a database pool. Still .server so a component cannot import
 * the allowlist into the client bundle.
 */

/**
 * The only two accounts with access. Sign-in is Google (betterAuth
 * socialProviders.google), so these are the Google addresses.
 *
 * Override with CONTENT_ALLOWED_EMAILS (comma separated) to change the list
 * without a deploy.
 */
const DEFAULT_ALLOWED_EMAILS = [
  "anamvanshikaa@gmail.com",
  "vanshikastudojo@gmail.com",
];

function allowedEmails(): string[] {
  const fromEnv = process.env.CONTENT_ALLOWED_EMAILS?.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv?.length ? fromEnv : DEFAULT_ALLOWED_EMAILS;
}

/**
 * True when this request is for a host allowed to serve /content.
 *
 * studojo.pro and its subdomains only, plus localhost so the tool is
 * developable. Anything else, studojo.com above all, gets nothing. Matching is
 * on exact host or a real dot-prefixed suffix, so studojo.pro.evil.com and
 * evilstudojo.pro both fail.
 */
export function isContentHost(request: Request): boolean {
  // Host first, x-forwarded-host only as a fallback. A client can put any
  // value in x-forwarded-host; nginx happens to overwrite it today, but that
  // is ingress config, not a guarantee, and this gate is the only thing
  // keeping the tool off production. root.tsx reads "host" the same way for
  // its own host routing, so it is known good behind this ingress. If a proxy
  // ever rewrites Host, this fails closed to 404 rather than open.
  const host = (
    request.headers.get("host") ??
    request.headers.get("x-forwarded-host") ??
    ""
  )
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");

  if (host === "studojo.pro" || host.endsWith(".studojo.pro")) return true;
  if (host === "localhost" || host === "127.0.0.1") return true;
  return false;
}

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return allowedEmails().includes(email.trim().toLowerCase());
}
