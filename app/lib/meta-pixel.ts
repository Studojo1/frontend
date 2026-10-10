// Meta (Facebook) Pixel: browser-side conversion events for the Outreach Dojo ad campaigns.
//
// Every track call mints an eventId and returns it. When the Conversions API is added
// server-side, the same eventId must be sent with the server copy so Meta deduplicates
// the pair into a single event instead of counting it twice.

import { consentForServer, trackingAllowed } from "./consent";

const PIXEL_ID = import.meta.env?.VITE_PUBLIC_META_PIXEL_ID as string | undefined;

/** Pages Meta must never see: the high-school reports are read by minors, who
 * must not be profiled for ads (audit HP-N13). Pure, for tests. */
export function metaExcludedPath(pathname: string): boolean {
  return pathname.startsWith("/reports/") && pathname.includes("high-school");
}

/** URLs Meta must never see: the Gmail connect return carries a one-time
 * code and state in the query string, and every pixel event sends the full
 * page URL (audit 10 Oct 2026). Pure, for tests. */
export function metaExcludedSearch(search: string): boolean {
  return /[?&](gmail_code|gmail_state)=/i.test(search);
}

/** Every Meta call checks this: a production host, the visitor's consent
 * where it is needed (EU/UK), not a page minors read, and no secret in the
 * URL. */
function metaAllowed(): boolean {
  if (!isTrackableHost()) return false;
  if (!trackingAllowed()) return false;
  if (metaExcludedSearch(window.location.search ?? "")) return false;
  return !metaExcludedPath(window.location.pathname ?? "");
}

// Staging builds from the same Dockerfile and so carries the same pixel id. Without
// this gate, QA and smoke runs on studojo.pro would fire real conversions into the
// live dataset, and Meta gives no way to filter them out afterwards. Append
// ?fbdebug to deliberately exercise the pixel on a non-production host.
const PROD_HOST = "studojo.com";

function isTrackableHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  if (host === PROD_HOST || host.endsWith(`.${PROD_HOST}`)) return true;
  try {
    return new URLSearchParams(window.location.search).has("fbdebug");
  } catch {
    return false;
  }
}

let isInitialized = false;

type Fbq = (...args: unknown[]) => void;

function fbq(): Fbq | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { fbq?: Fbq }).fbq;
}

function newEventId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // fall through to the timestamp id below
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Load fbevents.js and initialise the pixel. Exported for tests.
 *
 * disablePushState matters: left alone, fbevents.js listens for every
 * pushState / replaceState and sends its own PageView for the new URL. Those
 * automatic PageViews never pass through metaAllowed, so clicking from
 * /reports into a high-school report told Meta about a minor's visit even
 * though a direct load was correctly excluded, and ad-tagged visitors got a
 * second PageView on /auth (audit 10 Oct 2026). With it off, the only
 * PageViews are the ones trackMetaPageView sends, and every one is gated.
 */
export function bootPixel(pixelId: string): boolean {
  try {
    /* eslint-disable */
    // Standard Meta bootstrap snippet, inlined so no extra network request is needed
    // before fbevents.js itself loads.
    (function (f: any, b: any, e: string, v: string, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */

    const q = fbq();
    if (!q) return false;
    // Must be set before init, or the first history change still slips out.
    (q as unknown as { disablePushState?: boolean }).disablePushState = true;
    // autoConfig off: we fire every event explicitly so the funnel stays auditable.
    q("set", "autoConfig", false, pixelId);
    q("init", pixelId);
    return true;
  } catch {
    // Silently fail: analytics must never break the app
    return false;
  }
}

export function initMetaPixel() {
  if (typeof window === "undefined") return;
  if (!PIXEL_ID) return;
  if (isInitialized) return;
  if (!metaAllowed()) return;
  if (bootPixel(PIXEL_ID)) isInitialized = true;
}

/**
 * Mirror the event to our own server, which then calls Meta's Conversions API.
 *
 * This is the copy that actually survives. When an ad blocker kills
 * connect.facebook.net the browser pixel still *appears* to work, because the
 * bootstrap stub queues calls that are never sent. This request goes to our own
 * origin, so it is not blocked, and the server sends the event instead.
 */
function mirrorToServer(eventName: string, eventId: string) {
  try {
    fetch("/api/meta-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // HP-N13: the server checks consent again before it reports anything.
      body: JSON.stringify({ eventName, eventId, sourceUrl: window.location.href, ...consentForServer() }),
      // survives the page being navigated away mid-flight
      keepalive: true,
      // the session cookie is how the server gets a trustworthy email
      credentials: "same-origin",
    }).catch(() => {});
  } catch {
    // Analytics must never break the app
  }
}

/**
 * Fire a Meta standard event, in the browser and via the server, sharing one
 * eventId so Meta deduplicates the pair into a single conversion.
 * Returns that eventId, or null when tracking is disabled for this host.
 */
export function trackMeta(
  eventName: string,
  properties?: Record<string, unknown>,
  explicitEventId?: string
): string | null {
  if (typeof window === "undefined") return null;
  // Also covers the server mirror: no consent, no event to Meta at all.
  if (!metaAllowed()) return null;

  // A route's effect runs before the root effect that normally initialises the
  // pixel, so ViewContent on the landing page would otherwise lose its browser
  // copy and rely on the server mirror alone. init is idempotent and cheap.
  initMetaPixel();

  // A caller-supplied id is how two code paths reporting the SAME conversion
  // (the Razorpay handler and the payment-success page both confirm one sale)
  // collapse into a single event instead of double counting revenue.
  const eventId = explicitEventId || newEventId();
  try {
    // Best effort. Deliberately not gating the server copy on this succeeding,
    // because a blocked pixel is exactly the case CAPI exists to cover.
    if (isInitialized) {
      fbq()?.("track", eventName, properties ?? {}, { eventID: eventId });
    }
  } catch {
    // fall through to the server copy
  }
  mirrorToServer(eventName, eventId);
  return eventId;
}

/** PageView on the first load and on every client-side route change. This is
 * the only source of PageViews: fbevents' own history listener is switched off
 * in bootPixel, so each one passes metaAllowed. */
export function trackMetaPageView() {
  if (typeof window === "undefined" || !metaAllowed()) return;
  // A visit that began on an excluded page, or before consent, never ran init.
  initMetaPixel();
  if (!isInitialized) return;
  try {
    fbq()?.("track", "PageView");
  } catch {
    // Silently fail
  }
}

/** The visitor withdrew consent after the pixel loaded: tell Meta to stop
 * using its cookies for them. Later calls are already blocked by metaAllowed. */
export function revokeMetaConsent() {
  if (typeof window === "undefined" || !isInitialized) return;
  try {
    fbq()?.("consent", "revoke");
  } catch {
    // Silently fail
  }
}

/** The visitor accepted: lift a revoke from earlier in this page. */
export function grantMetaConsent() {
  if (typeof window === "undefined" || !isInitialized) return;
  try {
    fbq()?.("consent", "grant");
  } catch {
    // Silently fail
  }
}
