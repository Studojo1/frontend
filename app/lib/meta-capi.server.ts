// Meta Conversions API — the server-side half of the pixel.
//
// The browser pixel is blocked for a large slice of traffic (ad blockers, iOS,
// Safari tracking prevention). This sends the same event from our own server,
// where nothing can intercept it, carrying the same event_id so Meta collapses
// the browser and server copies into one conversion rather than counting two.
//
// Unconfigured means disabled: with no access token every call is a silent
// no-op, so a missing secret degrades attribution instead of breaking signup.

import crypto from "node:crypto";

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

export function isMetaCapiConfigured(): boolean {
  return Boolean(ACCESS_TOKEN);
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
        body: JSON.stringify(payload),
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

/** Pull the identity signals Meta can match on out of an incoming request. */
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
    fbc: readCookie("_fbc"),
    clientIp,
    userAgent: request.headers.get("user-agent"),
  };
}
