import { isExternalReferrer } from "./attribution";

// FIRST-PARTY JOURNEY (RELAUNCH, 2 Nov 2026). The contract shared with the product (Studojo1/career-agent on
// platform.studojo.com, staging platform.studojo.pro) and the admin dashboards:
//
//   stu_vid  a random visitor id (crypto UUID), 1 year, set once, readable by scripts (not HttpOnly)
//   stu_src  the first touch, JSON, 90 days, set once
//   stu_lt   the last touch, JSON, 30 days, replaced by every visit that carries utm_* (or a click id) or comes from
//            an outside site
//
// All three on the parent domain (AUTH_COOKIE_DOMAIN: .studojo.com, staging .studojo.pro), Secure, SameSite=Lax, so
// they already exist when the visitor clicks through to the platform. The JSON is URI-encoded in the cookie value
// (decodeURIComponent, then JSON.parse). Source keys: utm_source, utm_medium, utm_campaign, utm_content, utm_term,
// referrer (outside sites only), landing_path, first_seen_at (ISO), and fbclid, gclid, gbraid when present.
//
// The site writes two steps of career_agent.career_journey_events itself (journey.server.ts): visited_home (once per
// visitor per day, on /, the blog and the reports) and clicked_join (POST /api/journey, sent with sendBeacon on any
// join or start click, journey-client.ts). Pure, for tests (app/lib/journey.test.mjs).

export const VISITOR_COOKIE = "stu_vid";
export const FIRST_TOUCH_COOKIE = "stu_src";
export const LAST_TOUCH_COOKIE = "stu_lt";

const DAY_S = 24 * 60 * 60;
export const VISITOR_MAX_AGE_S = 365 * DAY_S;
export const FIRST_TOUCH_MAX_AGE_S = 90 * DAY_S;
export const LAST_TOUCH_MAX_AGE_S = 30 * DAY_S;

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
export const CLICK_ID_KEYS = ["fbclid", "gclid", "gbraid"] as const;

export type Source = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_path: string;
  first_seen_at: string;
  fbclid?: string;
  gclid?: string;
  gbraid?: string;
};

const VID_RE = /^[A-Za-z0-9_-]{8,64}$/;

/** A visitor id we accept from a cookie: a UUID or a similar plain token, never anything else. */
export function validVisitorId(v: string | null | undefined): v is string {
  return typeof v === "string" && VID_RE.test(v);
}

/** The Cookie header as a map (first value of each name wins, values URI-decoded where possible). */
export function parseCookies(header: string | null | undefined): Map<string, string> {
  const out = new Map<string, string>();
  for (const part of (header ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i < 1) continue;
    const name = part.slice(0, i).trim();
    if (!name || out.has(name)) continue;
    let value = part.slice(i + 1).trim();
    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) value = value.slice(1, -1);
    try {
      value = decodeURIComponent(value);
    } catch {
      // keep it raw
    }
    out.set(name, value);
  }
  return out;
}

/** A source cookie's JSON, or null when it is missing or not one of ours. */
export function readSource(raw: string | null | undefined): Source | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as unknown;
    if (!v || typeof v !== "object" || Array.isArray(v)) return null;
    const s = v as Record<string, unknown>;
    if (typeof s.landing_path !== "string" || typeof s.first_seen_at !== "string") return null;
    return s as unknown as Source;
  } catch {
    return null;
  }
}

/** The referrer as origin and path only (no query: a search box's text is not ours to keep). */
function cleanReferrer(ref: string): string {
  try {
    const u = new URL(ref);
    return `${u.origin}${u.pathname}`.slice(0, 300);
  } catch {
    return "";
  }
}

/**
 * This visit's source, and whether it is a touch (utm_*, a click id, or an outside referrer). `host` is the Host the
 * request came for: a referrer from it, or from any studojo.com / studojo.pro host, the Google sign-in hop or a
 * payment gateway, is not a source (attribution.ts isExternalReferrer). Pure.
 */
export function visitSource(url: URL, referer: string | null | undefined, host: string, now: Date): { source: Source; touch: boolean } {
  const source: Source = { landing_path: url.pathname.slice(0, 200) || "/", first_seen_at: now.toISOString() };
  let touch = false;
  for (const k of [...UTM_KEYS, ...CLICK_ID_KEYS]) {
    const v = url.searchParams.get(k)?.trim();
    if (v) {
      source[k] = v.slice(0, 200);
      touch = true;
    }
  }
  const ref = (referer ?? "").trim();
  if (ref && isExternalReferrer(ref, host)) {
    const clean = cleanReferrer(ref);
    if (clean) {
      source.referrer = clean;
      touch = true;
    }
  }
  return { source, touch };
}

/** The cookie domain for this request: AUTH_COOKIE_DOMAIN when the host is inside it, else host-only (null). */
export function cookieDomainFor(host: string | null | undefined, configured: string | null | undefined): string | null {
  const d = (configured ?? "").trim().toLowerCase();
  if (!d) return null;
  const bare = d.replace(/^\./, "");
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(bare)) return null;
  const h = (host ?? "").split(",")[0].trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
  if (h !== bare && !h.endsWith(`.${bare}`)) return null;
  return `.${bare}`;
}

export type CookieOpts = { maxAge: number; domain: string | null; secure: boolean; httpOnly: boolean };

/** One Set-Cookie value. The value is URI-encoded (JSON has quotes, commas and semicolons). */
export function serializeCookie(name: string, value: string, o: CookieOpts): string {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", `Max-Age=${o.maxAge}`, "SameSite=Lax"];
  if (o.domain) parts.push(`Domain=${o.domain}`);
  if (o.secure) parts.push("Secure");
  if (o.httpOnly) parts.push("HttpOnly");
  return parts.join("; ");
}

export type CookiePlan = {
  visitorId: string;
  /** The touch this visit counts under: the new or held last touch, else the first touch. */
  source: Source;
  setCookies: string[];
};

/**
 * What a page load does with the three cookies. stu_vid and stu_src only when missing; stu_lt when missing or when
 * this visit is a touch. Pure (the id comes in as `newId`).
 */
export function planCookies(args: {
  cookies: Map<string, string>;
  url: URL;
  referer: string | null | undefined;
  host: string;
  domain: string | null;
  secure: boolean;
  now: Date;
  newId: string;
}): CookiePlan {
  const { cookies, url, referer, host, domain, secure, now, newId } = args;
  const setCookies: string[] = [];
  const held = cookies.get(VISITOR_COOKIE);
  let visitorId = held ?? "";
  if (!validVisitorId(held)) {
    visitorId = newId;
    setCookies.push(serializeCookie(VISITOR_COOKIE, visitorId, { maxAge: VISITOR_MAX_AGE_S, domain, secure, httpOnly: false }));
  }
  const { source, touch } = visitSource(url, referer, host, now);
  const first = readSource(cookies.get(FIRST_TOUCH_COOKIE));
  if (!first) {
    setCookies.push(serializeCookie(FIRST_TOUCH_COOKIE, JSON.stringify(source), { maxAge: FIRST_TOUCH_MAX_AGE_S, domain, secure, httpOnly: true }));
  }
  const last = readSource(cookies.get(LAST_TOUCH_COOKIE));
  let current: Source = last ?? first ?? source;
  if (touch || !last) {
    setCookies.push(serializeCookie(LAST_TOUCH_COOKIE, JSON.stringify(source), { maxAge: LAST_TOUCH_MAX_AGE_S, domain, secure, httpOnly: true }));
    current = touch || !first ? source : first;
  }
  return { visitorId, source: current, setCookies };
}

/** The pages whose arrival is visited_home: the homepage, the blog and the reports. */
export function isLandingPath(pathname: string): boolean {
  return pathname === "/" || pathname === "/blog" || pathname.startsWith("/blog/") || pathname === "/reports" || pathname.startsWith("/reports/");
}

/** A prefetch or prerender (Chrome, Safari, Firefox), not a visit. */
export function isPrefetch(headers: Headers): boolean {
  const purpose = `${headers.get("sec-purpose") ?? ""} ${headers.get("purpose") ?? ""} ${headers.get("x-purpose") ?? ""} ${headers.get("x-moz") ?? ""}`.toLowerCase();
  return /prefetch|prerender|preview/.test(purpose);
}

/** 'staging' for studojo.pro (and its subdomains), else 'prod'. Pure. */
export function journeyEnv(host: string | null | undefined): "prod" | "staging" {
  const h = (host ?? "").split(",")[0].trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
  return h === "studojo.pro" || h.endsWith(".studojo.pro") ? "staging" : "prod";
}

/** A CTA name or a path from the beacon: short and plain, or null. */
export function cleanCta(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, 64);
  return /^[A-Za-z0-9_:.-]+$/.test(s) ? s : null;
}

export function cleanPath(v: unknown): string | null {
  if (typeof v !== "string" || !v.startsWith("/")) return null;
  return v.slice(0, 200);
}

/**
 * Is a link a way to join or start? The product's own /join (on its host, or /b2cnew/join here), and /auth sign-ups
 * that return to the product. `productOrigin` is PRODUCT_ORIGIN ("" when unset). Pure.
 */
export function isJoinHref(href: string, pageOrigin: string, productOrigin: string): boolean {
  let u: URL;
  try {
    u = new URL(href, pageOrigin);
  } catch {
    return false;
  }
  const p = u.pathname.replace(/\/+$/, "") || "/";
  if (productOrigin && u.origin === productOrigin) return p === "/join" || p.startsWith("/join/") || p === "/start" || p.startsWith("/start/");
  if (u.origin !== pageOrigin) return false;
  if (p === "/b2cnew/join" || p === "/b2cnew/start" || p.startsWith("/b2cnew/join/") || p.startsWith("/b2cnew/start/")) return true;
  if (p === "/auth") {
    // The header's "sign in" (mode=signin) is a returning student, not a join.
    const mode = u.searchParams.get("mode");
    if (mode === "signin") return false;
    return mode === "signup" || (u.searchParams.get("redirect") ?? "").startsWith("/b2cnew");
  }
  return false;
}
