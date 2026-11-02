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
import { FIRST_TOUCH_COOKIE, LAST_TOUCH_COOKIE, parseCookies, readSource } from "./journey";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v21.0";
const PIXEL_ID = process.env.META_PIXEL_ID || "1402801611979819";
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;

/** Meta requires SHA-256 of the trimmed, lowercased value. */
function hash(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export type MetaUserData = {
  email?: string | null;
  /** _fbp cookie: Meta's own browser id. The single biggest match-quality lever. */
  fbp?: string | null;
  /** _fbc cookie: derived from the fbclid on the ad click, ties the conversion to the ad. */
  fbc?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  /** Stable internal user id, hashed. Helps match logged-in users. */
  externalId?: string | null;
};

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
}): Promise<{ ok: boolean; error?: string }> {
  if (!ACCESS_TOKEN) return { ok: false, error: "unconfigured" };

  const { eventName, eventId, eventSourceUrl, user, customData } = opts;

  const userData: Record<string, unknown> = {};
  if (user.email) userData.em = [hash(user.email)];
  if (user.externalId) userData.external_id = [hash(user.externalId)];
  // These three are sent raw by design; Meta hashes or discards them itself.
  if (user.clientIp) userData.client_ip_address = user.clientIp;
  if (user.userAgent) userData.client_user_agent = user.userAgent;
  if (user.fbp) userData.fbp = user.fbp;
  if (user.fbc) userData.fbc = user.fbc;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
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
 * fbclid (fbcFromSourceCookies). fbp: the _fbp cookie when it exists. */
export function metaUserDataFromRequest(request: Request): MetaUserData {
  const cookieHeader = request.headers.get("cookie") || "";
  const readCookie = (name: string): string | null => {
    const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
  };

  // Behind the ingress the socket address is the proxy, so the real client is
  // the first entry of x-forwarded-for.
  const xff = request.headers.get("x-forwarded-for") || "";
  const clientIp = xff.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;

  return {
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc") || fbcFromSourceCookies(cookieHeader),
    clientIp,
    userAgent: request.headers.get("user-agent"),
  };
}
