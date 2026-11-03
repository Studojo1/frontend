import { isExternalReferrer } from "./attribution";
import { INAPP_APPS } from "./inapp";

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
// utm_id, referrer (outside sites only), landing_path, first_seen_at (ISO), and fbclid, gclid, gbraid when present.
// utm_id is the short link's slug (studojo.com/go/<slug> adds it), so a sign-up ties back to the exact link.
//
// The site writes these steps of career_agent.career_journey_events itself (journey.server.ts): visited_home (once per
// visitor per day, on /, the blog and the reports) and clicked_join (POST /api/journey, sent with sendBeacon on any
// join or start click, journey-client.ts). Pure, for tests (app/lib/journey.test.mjs).
//
// SITE-TRACK (3 Nov 2026, the owner: 144 visitors today, almost nobody clicked "Start the call", and "we can't tell how
// far they scrolled, how long they stayed, or what they looked at ... page-by-page browsing isn't visible ... the device
// type isn't being saved"). Two more steps from the browser (journey-pages.ts), through the same POST /api/journey:
//
//   page_view     every page load, client-side route change and Back to a cached page. props: pv (the page view's
//                 random id, which every event of that page view carries), path, title, nav (load, route, back), ref
//                 (document.referrer as origin and path, on the first page view of a load only).
//   page_engaged  what that page view did so far, cumulative: a page view can send several (take the largest per pv).
//                 props: pv, path, engaged_s (seconds the tab was visible), scroll (the deepest 0, 25, 50, 75 or 100
//                 percent reached), sections (data-section names on screen for a second, in the order seen), cta_seen
//                 and cta_at (a start button, [data-start], at least half on screen for half a second, and the engaged
//                 second it first was; only on pages that have one), clicked (the first join CTA clicked), why (check,
//                 hidden, leave, route: what sent it).
//
// Every row the site writes also carries device (mobile, tablet, desktop) and inapp (instagram, facebook, linkedin,
// whatsapp, other, none), read from the user agent on our server; the browser's rows add sw, the viewport width
// bucket (WIDTH_BUCKETS, CSS pixels). clicked_join adds pv and cta_seen. In-app browsers often block the microphone
// (an Instagram visitor's 4 calls failed with mic_denied on 3 Nov), so inapp is on every row.

export const VISITOR_COOKIE = "stu_vid";
export const FIRST_TOUCH_COOKIE = "stu_src";
export const LAST_TOUCH_COOKIE = "stu_lt";

const DAY_S = 24 * 60 * 60;
export const VISITOR_MAX_AGE_S = 365 * DAY_S;
export const FIRST_TOUCH_MAX_AGE_S = 90 * DAY_S;
export const LAST_TOUCH_MAX_AGE_S = 30 * DAY_S;

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id"] as const;
export const CLICK_ID_KEYS = ["fbclid", "gclid", "gbraid"] as const;

export type Source = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  /** The admin short link's slug (utm_campaigns.slug), set by /go/<slug>. */
  utm_id?: string;
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

// ── SITE-TRACK (3 Nov 2026, the owner): page views, engagement and the device, the shared rules. ──

/**
 * The steps the browser may send to /api/journey (the allow-list). A body with no step is clicked_join.
 * INAPP (4 Nov 2026, the owner: "for the users tapping inside Instagram or Facebook, inside of the built-in browser,
 * instead redirect them to use it directly on Chrome or Safari"): the escape's three (components/inapp/InAppEscape.tsx),
 * the product's names (its journey.ts): inapp_seen (a page of the site open in an app's browser, once a browser
 * session), inapp_escape_tried (a call tap tried to open Chrome or Safari: how intent or safari) and inapp_escape_sheet
 * (the steps shown: why manual or timeout). Their props: path, app (inapp.ts INAPP_APPS), os, cta, how, why; the
 * server adds device and inapp as on every row.
 */
export const BEACON_STEPS = ["clicked_join", "page_view", "page_engaged", "inapp_seen", "inapp_escape_tried", "inapp_escape_sheet"] as const;
export type BeaconStep = (typeof BEACON_STEPS)[number];

export type Device = "mobile" | "tablet" | "desktop";
export type InApp = "instagram" | "facebook" | "linkedin" | "whatsapp" | "other" | "none";

/**
 * Phone, tablet or computer, from the user agent. `touch` is the browser's own hint (navigator.maxTouchPoints > 1):
 * an iPad asks for the desktop site with a Mac's user agent, so a "Mac" with a touch screen is a tablet. Pure.
 */
export function deviceOf(ua: string | null | undefined, touch = false): Device {
  const s = ua ?? "";
  if (/iPad|Tablet|PlayBook|Silk\/|Kindle/i.test(s)) return "tablet";
  if (/Android/i.test(s)) return /Mobile/i.test(s) ? "mobile" : "tablet";
  if (/Mobi|iPhone|iPod|Windows Phone|IEMobile|Opera Mini|BlackBerry/i.test(s)) return "mobile";
  if (touch && /Macintosh/i.test(s)) return "tablet";
  return "desktop";
}

/**
 * Which app's own browser the page is open in, from the user agent. "other" is any other app's web view (X, Snapchat,
 * Telegram, TikTok, Threads, the Google app, WeChat, a bare Android web view, or an iPhone web view without Safari's
 * name); "none" is a real browser. Pure.
 */
export function inAppOf(ua: string | null | undefined): InApp {
  const s = ua ?? "";
  if (!s) return "none";
  if (/Instagram/i.test(s)) return "instagram";
  if (/FBAN|FBAV|FB_IAB|FB4A|FBIOS|FBLC\/|Messenger/.test(s)) return "facebook";
  if (/LinkedInApp/i.test(s)) return "linkedin";
  if (/WhatsApp/i.test(s)) return "whatsapp";
  if (/Twitter|Snapchat|Telegram|BytedanceWebview|musical_ly|TikTok|\bLine\/|Pinterest|GSA\/|Barcelona|MicroMessenger|; wv\)/i.test(s)) return "other";
  if (/iPhone|iPad|iPod/.test(s) && /AppleWebKit/.test(s) && !/Safari\//.test(s)) return "other";
  return "none";
}

/** props.device and props.inapp for a request's user agent. Pure. */
export function deviceProps(ua: string | null | undefined, touch = false): { device: Device; inapp: InApp } {
  return { device: deviceOf(ua, touch), inapp: inAppOf(ua) };
}

/** Viewport width buckets, CSS pixels: a row's sw is the largest edge at or under the width. */
export const WIDTH_BUCKETS = [0, 360, 390, 430, 600, 768, 1024, 1280, 1440, 1920] as const;

/** The viewport width's bucket, or null for a value that is not a width. Pure. */
export function widthBucket(px: unknown): number | null {
  if (typeof px !== "number" || !Number.isFinite(px) || px < 0 || px > 20_000) return null;
  let out = 0;
  for (const edge of WIDTH_BUCKETS) if (px >= edge) out = edge;
  return out;
}

export const SCROLL_MILESTONES = [0, 25, 50, 75, 100] as const;

/**
 * The deepest milestone a scroll position reaches: `bottom` is how far down the viewport's bottom edge is (scrollY plus
 * the viewport height), `total` the page's height. The last 2 px count as the end. Pure.
 */
export function scrollMilestone(bottom: number, total: number): number {
  if (!Number.isFinite(bottom) || !Number.isFinite(total) || total <= 0) return 0;
  if (bottom >= total - 2) return 100;
  const pct = (bottom / total) * 100;
  let out = 0;
  for (const m of SCROLL_MILESTONES) if (pct >= m) out = m;
  return out;
}

const PV_RE = /^[A-Za-z0-9_-]{8,40}$/;
/** A data-section name: short, lower case. */
export const SECTION_RE = /^[a-z][a-z0-9_]{0,23}$/;
const NAVS = new Set(["load", "route", "back"]);
const INAPP_OS = new Set(["android", "ios", "other"]);
const INAPP_HOWS = new Set(["intent", "safari"]);
const INAPP_WHYS = new Set(["manual", "timeout"]);
const WHYS = new Set(["check", "hidden", "leave", "route"]);
const MAX_ENGAGED_S = 3_600;

/** A page view id from the browser, or null. Pure. */
export function cleanPv(v: unknown): string | null {
  return typeof v === "string" && PV_RE.test(v) ? v : null;
}

/** A page title: plain text, one line, at most 120 characters, or null. Pure. */
export function cleanTitle(v: unknown): string | null {
  if (typeof v !== "string") return null;
  // eslint-disable-next-line no-control-regex
  const s = v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
  return s || null;
}

/** A referrer from the browser as origin and path only (http or https), or null. Pure. */
export function cleanRef(v: unknown): string | null {
  if (typeof v !== "string" || !/^https?:\/\//i.test(v)) return null;
  return cleanReferrer(v) || null;
}

function seconds(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return null;
  return Math.min(MAX_ENGAGED_S, Math.round(v));
}

export type Beacon = { step: BeaconStep; props: Record<string, unknown>; touch: boolean };

/**
 * One /api/journey body, checked against the allow-list: the step, and the props it may carry (anything else in the
 * body is dropped). Null when the step is not ours or a required field is missing. device and inapp are not here: the
 * server adds them from the request's user agent. Pure.
 */
export function cleanBeacon(body: unknown): Beacon | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  const raw = b.step === undefined ? "clicked_join" : b.step;
  if (typeof raw !== "string" || !(BEACON_STEPS as readonly string[]).includes(raw)) return null;
  const step = raw as BeaconStep;
  const path = cleanPath(b.path);
  if (!path) return null;
  const touch = b.touch === true;
  const sw = widthBucket(b.sw);
  const pv = cleanPv(b.pv);
  const props: Record<string, unknown> = {};
  if (step === "clicked_join") {
    const cta = cleanCta(b.cta);
    if (!cta) return null;
    props.cta = cta;
    props.path = path;
    if (pv) props.pv = pv;
    if (typeof b.cta_seen === "boolean") props.cta_seen = b.cta_seen;
  } else if (step === "page_view") {
    if (!pv) return null;
    props.pv = pv;
    props.path = path;
    const title = cleanTitle(b.title);
    if (title) props.title = title;
    props.nav = typeof b.nav === "string" && NAVS.has(b.nav) ? b.nav : "load";
    const ref = props.nav === "load" ? cleanRef(b.ref) : null;
    if (ref) props.ref = ref;
  } else if (step === "inapp_seen" || step === "inapp_escape_tried" || step === "inapp_escape_sheet") {
    // INAPP: the app and os the browser read, each from its own short list; nothing else.
    if (typeof b.app !== "string" || !(INAPP_APPS as readonly string[]).includes(b.app)) return null;
    props.path = path;
    props.app = b.app;
    if (typeof b.os === "string" && INAPP_OS.has(b.os)) props.os = b.os;
    const cta = b.cta === undefined ? null : cleanCta(b.cta);
    if (cta && step !== "inapp_seen") props.cta = cta;
    if (step === "inapp_escape_tried" && typeof b.how === "string" && INAPP_HOWS.has(b.how)) props.how = b.how;
    if (step === "inapp_escape_sheet" && typeof b.why === "string" && INAPP_WHYS.has(b.why)) props.why = b.why;
  } else {
    if (!pv) return null;
    props.pv = pv;
    props.path = path;
    props.engaged_s = seconds(b.engaged_s) ?? 0;
    props.scroll = typeof b.scroll === "number" && (SCROLL_MILESTONES as readonly number[]).includes(b.scroll) ? b.scroll : 0;
    const sections = Array.isArray(b.sections) ? b.sections.filter((s): s is string => typeof s === "string" && SECTION_RE.test(s)) : [];
    props.sections = [...new Set(sections)].slice(0, 16);
    if (typeof b.cta_seen === "boolean") {
      props.cta_seen = b.cta_seen;
      const at = b.cta_seen ? seconds(b.cta_at) : null;
      if (at !== null) props.cta_at = at;
    }
    const clicked = b.clicked === undefined ? null : cleanCta(b.clicked);
    if (clicked) props.clicked = clicked;
    props.why = typeof b.why === "string" && WHYS.has(b.why) ? b.why : "check";
  }
  if (sw !== null) props.sw = sw;
  return { step, props, touch };
}
