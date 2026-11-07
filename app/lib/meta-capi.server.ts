// Meta Conversions API: the server-side half of the pixel.
//
// The browser pixel is blocked for a large slice of traffic (ad blockers, iOS,
// Safari tracking prevention). This sends the same event from our own server,
// where nothing can intercept it, carrying the same event_id so Meta collapses
// the browser and server copies into one conversion rather than counting two.
//
// Unconfigured means disabled: with no access token every call is a silent
// no-op, so a missing secret degrades attribution instead of breaking signup.

import crypto from "node:crypto";
import { buildFbc } from "./attribution";
import { FIRST_TOUCH_COOKIE, LAST_TOUCH_COOKIE, VISITOR_COOKIE, parseCookies, readSource, validVisitorId } from "./journey";
import { IP6_COOKIE, publicIpv6 } from "./meta-ip6";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v21.0";
const PIXEL_ID = process.env.META_PIXEL_ID || "1402801611979819";
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;

/** SHA-256 hex of a value already normalised (the norm* helpers below). Pure. */
export function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** Meta requires SHA-256 of the trimmed, lowercased value. */
function hash(value: string): string {
  return sha256Hex(value.trim().toLowerCase());
}

export type MetaUserData = {
  email?: string | null;
  /** The account's phone, any common shape ("+91 98765-43210"); normPhone makes it Meta's digits. */
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  /** ISO 3166-1 alpha-2 (withAccount takes it from the phone's calling code, phoneCountry). */
  country?: string | null;
  /** _fbp cookie: Meta's own browser id. The single biggest match-quality lever. */
  fbp?: string | null;
  /** _fbc cookie: derived from the fbclid on the ad click, ties the conversion to the ad. */
  fbc?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  /** Stable ids, each hashed into external_id: the account id when signed in, then the stu_vid visitor id. */
  externalIds?: (string | null | undefined)[];
};

// EMQ (5 Nov 2026, the owner: Events Manager showed PageView 6.1, Lead 6.1, CompleteRegistration 7.7 of 10, "we need
// to be around 9+"). More customer information on every server copy, each normalised the way Meta's Conversions API
// spec asks before it is hashed: ph, fn, ln, country, and external_id as a list (the account id and the visitor id).
// The browser pixel's init carries the same hashed visitor id (meta-pixel.ts visitorExternalId), so the browser copy,
// Meta's own gateway copy of it and this copy all match on one id. The platform's relay (Studojo1/career-agent) gets
// the same keys the same way in its own EMQ change. Pure helpers, for tests (app/lib/meta-emq.test.mjs).

/** em: trimmed and lowercased, or null when empty. Pure. */
export function normEmail(v: string | null | undefined): string | null {
  const s = (v ?? "").trim().toLowerCase();
  return s.includes("@") ? s : null;
}

/**
 * ph: digits only with the country code, no leading + or 00 (Meta: "remove symbols, letters, and any leading zeros"),
 * so "+91 98765-43210" is 919876543210. Fewer than 8 digits is not a phone number: null. Pure.
 */
export function normPhone(v: string | null | undefined): string | null {
  const digits = (v ?? "").replace(/\D/g, "").replace(/^0+/, "");
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

// Calling code to ISO 3166-1 alpha-2, for the markets the site sells in. Calling codes are prefix free (E.164), so a
// startsWith on the digits after + is exact.
const CALLING_CODES: [string, string][] = [
  ["971", "ae"],
  ["91", "in"],
  ["65", "sg"],
  ["44", "gb"],
  ["1", "us"],
];

/**
 * country from a phone's calling code: 91 in, 971 ae, 65 sg, 44 gb, 1 us; anything else null. Only a number written
 * in international form (a leading + or 00) has a calling code at all: a bare Indian mobile such as 6512345678 would
 * otherwise read as Singapore. Pure.
 */
export function phoneCountry(v: string | null | undefined): string | null {
  const s = (v ?? "").trim();
  if (!/^(\+|00)/.test(s)) return null;
  const digits = normPhone(s);
  if (!digits) return null;
  for (const [code, iso] of CALLING_CODES) if (digits.startsWith(code)) return iso;
  return null;
}

/** country: two lowercase letters (ISO 3166-1 alpha-2), or null. Pure. */
export function normCountry(v: string | null | undefined): string | null {
  const s = (v ?? "").trim().toLowerCase();
  return /^[a-z]{2}$/.test(s) ? s : null;
}

/**
 * fn and ln: lowercased, punctuation, digits and spaces dropped, letters of any script kept (with their combining
 * marks, so a Devanagari name survives whole). Null when nothing is left. Pure.
 */
export function normName(v: string | null | undefined): string | null {
  const s = (v ?? "").normalize("NFC").toLowerCase().replace(/[^\p{L}\p{M}]/gu, "");
  return s || null;
}

/**
 * A full name as first and last: the first word is the first name, the last word the last name when there are two or
 * more (middle names are dropped). A word with no letters ("-", "2") does not count. One word: a first name only. Pure.
 */
export function splitName(full: string | null | undefined): { firstName: string | null; lastName: string | null } {
  const words = (full ?? "").trim().split(/\s+/).filter((w) => normName(w));
  if (words.length === 0) return { firstName: null, lastName: null };
  return { firstName: words[0], lastName: words.length > 1 ? words[words.length - 1] : null };
}

/**
 * The account's name when it is a real one. An email sign-up on /auth stores the email's local part as the name
 * (auth._index.tsx, `email.split("@")[0] || "User"`), which is no one's first name; that and "User" are dropped. Pure.
 */
export function accountName(name: string | null | undefined, email: string | null | undefined): string | null {
  const n = (name ?? "").trim();
  if (!n || n.toLowerCase() === "user") return null;
  const local = (email ?? "").split("@")[0]?.trim().toLowerCase();
  if (local && n.toLowerCase() === local) return null;
  return n;
}

/** external_id: each id trimmed, lowercased and hashed, blanks and repeats dropped, in order. Pure. */
export function externalIdHashes(ids: (string | null | undefined)[] | null | undefined): string[] {
  const out: string[] = [];
  for (const id of ids ?? []) {
    const s = (id ?? "").trim();
    if (!s) continue;
    const h = hash(s);
    if (!out.includes(h)) out.push(h);
  }
  return out;
}

/**
 * The signed-in account's match keys on top of what the request gave (metaUserDataFromRequest): its email, its name
 * as fn and ln (not the email sign-up's placeholder, accountName), its phone and the phone's country, and its id ahead
 * of the visitor id in external_id. Pure.
 */
export function withAccount(
  user: MetaUserData,
  account: { id?: string | null; email?: string | null; name?: string | null; phoneNumber?: string | null },
): MetaUserData {
  const { firstName, lastName } = splitName(accountName(account.name, account.email));
  const phone = account.phoneNumber ?? null;
  return {
    ...user,
    email: account.email ?? null,
    phone,
    firstName,
    lastName,
    country: phoneCountry(phone),
    externalIds: [account.id, ...(user.externalIds ?? [])],
  };
}

/**
 * The Conversions API user_data for one event: every customer key normalised and hashed (em, ph, fn, ln, country,
 * external_id; a key with no usable value is left out, never sent empty), and ip, user agent, fbp and fbc raw, as Meta
 * asks. Pure.
 */
export function metaUserDataPayload(user: MetaUserData): Record<string, unknown> {
  const userData: Record<string, unknown> = {};
  const em = normEmail(user.email);
  if (em) userData.em = [sha256Hex(em)];
  const ph = normPhone(user.phone);
  if (ph) userData.ph = [sha256Hex(ph)];
  const fn = normName(user.firstName);
  if (fn) userData.fn = [sha256Hex(fn)];
  const ln = normName(user.lastName);
  if (ln) userData.ln = [sha256Hex(ln)];
  const country = normCountry(user.country);
  if (country) userData.country = [sha256Hex(country)];
  const ext = externalIdHashes(user.externalIds);
  if (ext.length > 0) userData.external_id = ext;
  // These four are sent raw by design; Meta hashes or discards them itself.
  if (user.clientIp) userData.client_ip_address = user.clientIp;
  if (user.userAgent) userData.client_user_agent = user.userAgent;
  if (user.fbp) userData.fbp = user.fbp;
  if (user.fbc) userData.fbc = user.fbc;
  return userData;
}

/**
 * B8 (2 Nov 2026): the production host gate for the relay (api.meta-event.tsx). Only a request that came for
 * studojo.com or www.studojo.com may reach the live dataset; staging (studojo.pro) and anything else never does,
 * token or not. From the Host header the ingress routed on, not X-Forwarded-Host, which a client can set
 * (staging-host.ts reads it the same way). The platform host's /api/meta-event goes to career-agent, which has its
 * own gate. Pure.
 */
export function metaProdHost(host: string | null | undefined): boolean {
  const h = (host ?? "").split(":")[0].trim().toLowerCase().replace(/\.$/, "");
  return h === "studojo.com" || h === "www.studojo.com";
}

export function isMetaCapiConfigured(): boolean {
  return Boolean(ACCESS_TOKEN);
}

/**
 * META-TEST (2 Nov 2026): Meta's "Test events" tab only shows a server event that carries its test code. With
 * META_TEST_EVENT_CODE set (production: app-secrets meta-test-event-code, optional), every Conversions API payload
 * carries it as test_event_code; unset or blank, the payload is exactly as before. Read on every call. Pure.
 */
export function withTestEventCode<P extends { data: unknown[] }>(
  payload: P,
  env: Record<string, string | undefined> = process.env,
): P | (P & { test_event_code: string }) {
  const code = env.META_TEST_EVENT_CODE?.trim();
  return code ? { ...payload, test_event_code: code } : payload;
}

/**
 * Fire one server-side event. Never throws: analytics must not be able to fail
 * a signup or a payment webhook.
 */
export async function sendMetaEvent(opts: {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string | null;
  user: MetaUserData;
  customData?: Record<string, unknown>;
  /** LEAD-LATE: when it happened (ms), for a copy sent later (meta-lead-late.server.ts); now when left out. */
  eventTime?: number;
}): Promise<{ ok: boolean; error?: string }> {
  if (!ACCESS_TOKEN) return { ok: false, error: "unconfigured" };

  const { eventName, eventId, eventSourceUrl, user, customData, eventTime } = opts;

  const userData = metaUserDataPayload(user);

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor((eventTime ?? Date.now()) / 1000),
        event_id: eventId, // MUST match the browser copy or the event double counts
        action_source: "website",
        ...(eventSourceUrl ? { event_source_url: eventSourceUrl } : {}),
        user_data: userData,
        ...(customData ? { custom_data: customData } : {}),
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withTestEventCode(payload)),
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) {
      // Body, not just status: Meta returns the actual reason (bad token,
      // malformed user_data) in the response and the status alone hides it.
      const body = await res.text().catch(() => "");
      console.error(`[meta-capi] ${eventName} rejected ${res.status}: ${body.slice(0, 300)}`);
      return { ok: false, error: `http_${res.status}` };
    }
    return { ok: true };
  } catch (err: any) {
    console.error(`[meta-capi] ${eventName} failed: ${err?.message ?? err}`);
    return { ok: false, error: "network" };
  }
}

// META-FIX (2 Nov 2026, B5): events whose server copy carries value and currency (INR), as the browser copy does.
// Lead carries none; Purchase is not taken from a browser at all (api.meta-event.tsx).
const VALUE_EVENTS = new Set(["InitiateCheckout", "AddPaymentInfo"]);

/** value and currency from a relay body, for VALUE_EVENTS only, kept to sane numbers and a 3 letter code. Pure. */
export function valueData(eventName: string, body: { value?: unknown; currency?: unknown }): { value: number; currency: string } | null {
  if (!VALUE_EVENTS.has(eventName)) return null;
  const value = typeof body.value === "number" ? body.value : Number.NaN;
  const currency = typeof body.currency === "string" ? body.currency.toUpperCase() : "";
  if (!Number.isFinite(value) || value < 0 || value > 1_000_000 || !/^[A-Z]{3}$/.test(currency)) return null;
  return { value: Math.round(value * 100) / 100, currency };
}

/** META-FIX (2 Nov 2026, B1): an fbc a browser sent, kept only with Meta's shape. Pure. */
export function cleanFbc(v: unknown): string | null {
  return typeof v === "string" && /^fb\.\d\.\d{10,13}\.[A-Za-z0-9_-]{8,500}$/.test(v) ? v : null;
}

/**
 * META-FIX (2 Nov 2026, B1): the fbc for a request with no _fbc cookie (the pixel blocked, or consent given after the
 * landing page): built from the fbclid this site keeps in stu_lt (the latest click) else stu_src (the first touch),
 * set server-side on every page load (journey.ts), as fb.1.<first_seen_ms>.<fbclid>. Null when neither holds one. Pure.
 */
export function fbcFromSourceCookies(cookieHeader: string | null | undefined): string | null {
  const cookies = parseCookies(cookieHeader);
  for (const name of [LAST_TOUCH_COOKIE, FIRST_TOUCH_COOKIE]) {
    const s = readSource(cookies.get(name));
    if (!s?.fbclid) continue;
    const ms = Date.parse(s.first_seen_at);
    if (Number.isFinite(ms) && /^[A-Za-z0-9_-]{8,500}$/.test(s.fbclid)) return buildFbc(s.fbclid, ms);
  }
  return null;
}

/** Pull the identity signals Meta can match on out of an incoming request. fbc: the _fbc cookie, else the stored
 * fbclid (fbcFromSourceCookies). fbp: the _fbp cookie when it exists. EMQ (5 Nov 2026): externalIds holds the stu_vid
 * visitor id when the request has a valid one (journey.ts validVisitorId), the same id the browser pixel's init sends
 * hashed, so a signed-out visitor's events carry external_id too. */
export function metaUserDataFromRequest(request: Request): MetaUserData {
  const cookieHeader = request.headers.get("cookie") || "";
  const readCookie = (name: string): string | null => {
    const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
  };

  // Behind the ingress the socket address is the proxy, so the real client is
  // the first entry of x-forwarded-for.
  const xff = request.headers.get("x-forwarded-for") || "";
  const cookies = parseCookies(cookieHeader);
  // EMQ-IP6: the browser's own IPv6 address when it has one (meta-ip6.ts), the address Meta's pixel sees; else the one
  // our ingress saw (IPv4 only).
  const clientIp = publicIpv6(cookies.get(IP6_COOKIE)) ?? (xff.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null);

  const vid = cookies.get(VISITOR_COOKIE);

  return {
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc") || fbcFromSourceCookies(cookieHeader),
    clientIp,
    userAgent: request.headers.get("user-agent"),
    ...(validVisitorId(vid) ? { externalIds: [vid] } : {}),
  };
}
