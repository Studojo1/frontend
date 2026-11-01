// Sign-in cookies and origins for `web`, from env (RELAUNCH, 2 Nov 2026).
//
// The product sits on platform.studojo.com (staging: platform.studojo.pro), whose /auth and /api/auth this app
// serves, while Google keeps its one callback on BETTER_AUTH_URL (https://studojo.com, staging https://studojo.pro).
// So the OAuth state cookie and the session cookies must be shared across subdomains, and a sign-in posted from
// platform must come from a trusted origin. Three settings:
//
//   AUTH_COOKIE_DOMAIN     ".studojo.com" (staging ".studojo.pro"): better-auth advanced.crossSubDomainCookies.
//                          (advanced.cookieOptions, used before, is not a better-auth 1.4 option: it was ignored, the
//                          cookies were host-only, and Google sign-in from another host failed with state_mismatch.)
//   AUTH_COOKIE_PREFIX     "stu": advanced.cookiePrefix. The B2B app (`frontend` on app. and dashboard.) uses the
//                          default "better-auth", so a parent-domain cookie under the default name would hand our
//                          sessions to the B2B hosts. With "stu" it never reads them. A shared domain is refused
//                          with the default prefix for that reason.
//   AUTH_TRUSTED_ORIGINS   comma separated: "https://studojo.com,https://www.studojo.com,https://platform.studojo.com"
//                          (staging "https://studojo.pro,https://platform.studojo.pro"). Bare hosts mean https.
//
// Cookie names with prefix "stu" (better-auth 1.4.18, src/cookies): stu.session_token, stu.session_data,
// stu.dont_remember, stu.account_data, stu.state (Google sign-in state), stu.two_factor, stu.trust_device,
// stu.admin_session, stu.better-auth-passkey; on an https BETTER_AUTH_URL each gets the "__Secure-" prefix
// (__Secure-stu.session_token). Plus stu.last_used_login_method (LAST_LOGIN_METHOD_COOKIE, no "__Secure-": the plugin
// sets its name as given). Pure, for tests (app/lib/auth-cookies.test.mjs).

export const DEFAULT_COOKIE_PREFIX = "better-auth";

export interface AuthCookieConfig {
  cookiePrefix: string;
  /** Set only with a valid domain and a prefix of our own. */
  crossSubDomainCookies: { enabled: true; domain: string } | null;
  /** Origins from AUTH_TRUSTED_ORIGINS, normalised (scheme://host[:port]). */
  trustedOrigins: string[];
  /** What was ignored and why (logged at start). */
  problems: string[];
}

type Env = Record<string, string | undefined>;

const PREFIX_RE = /^[a-z0-9_-]{1,32}$/i;
const DOMAIN_RE = /^\.?[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

/** One origin from a list entry ("studojo.com" means https), or null when it is not one. */
export function normaliseOrigin(entry: string): string | null {
  const raw = entry.trim();
  if (!raw) return null;
  const withScheme = /^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    if (u.pathname !== "/" || u.search || u.hash || u.username || u.password) return null;
    const local = ["localhost", "127.0.0.1"].includes(u.hostname);
    if (u.protocol !== "https:" && !(u.protocol === "http:" && local)) return null;
    if (!local && !DOMAIN_RE.test(u.hostname)) return null;
    return u.origin;
  } catch {
    return null;
  }
}

/** The cookie and origin settings from env. Pure. */
export function authCookieConfig(env: Env): AuthCookieConfig {
  const problems: string[] = [];

  const rawPrefix = (env.AUTH_COOKIE_PREFIX ?? "").trim();
  let cookiePrefix = DEFAULT_COOKIE_PREFIX;
  if (rawPrefix) {
    if (PREFIX_RE.test(rawPrefix)) cookiePrefix = rawPrefix;
    else problems.push(`AUTH_COOKIE_PREFIX "${rawPrefix}" is not a plain name; using "${DEFAULT_COOKIE_PREFIX}"`);
  }

  const rawDomain = (env.AUTH_COOKIE_DOMAIN ?? "").trim().toLowerCase();
  let crossSubDomainCookies: AuthCookieConfig["crossSubDomainCookies"] = null;
  if (rawDomain) {
    if (!DOMAIN_RE.test(rawDomain)) {
      problems.push(`AUTH_COOKIE_DOMAIN "${rawDomain}" is not a domain; cookies stay host-only`);
    } else if (cookiePrefix === DEFAULT_COOKIE_PREFIX) {
      problems.push(`AUTH_COOKIE_DOMAIN needs AUTH_COOKIE_PREFIX (not "${DEFAULT_COOKIE_PREFIX}"), or the B2B hosts would read these sessions; cookies stay host-only`);
    } else {
      crossSubDomainCookies = { enabled: true, domain: rawDomain.startsWith(".") ? rawDomain : `.${rawDomain}` };
    }
  }

  const trustedOrigins: string[] = [];
  for (const entry of (env.AUTH_TRUSTED_ORIGINS ?? "").split(",")) {
    if (!entry.trim()) continue;
    const o = normaliseOrigin(entry);
    if (o) {
      if (!trustedOrigins.includes(o)) trustedOrigins.push(o);
    } else problems.push(`AUTH_TRUSTED_ORIGINS entry "${entry.trim()}" is not an https origin; left out`);
  }

  return { cookiePrefix, crossSubDomainCookies, trustedOrigins, problems };
}

/** The "last signed in with" cookie (better-auth's lastLoginMethod plugin, server and client). It copies the session
 * cookie's attributes, so on a shared domain it must not keep the default name "better-auth.last_used_login_method",
 * which the B2B hosts read. Not httpOnly (the sign-in page reads it); it holds only "google" or "email". */
export const LAST_LOGIN_METHOD_COOKIE = "stu.last_used_login_method";

/** The session cookie's name as better-auth sets it (career-agent reads it). Pure. */
export function sessionCookieName(prefix: string, secure: boolean): string {
  return `${secure ? "__Secure-" : ""}${prefix}.session_token`;
}
