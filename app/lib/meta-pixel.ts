// Meta (Facebook) Pixel — browser-side conversion events for the Outreach Dojo ad campaigns.
//
// Every track call mints an eventId and returns it. When the Conversions API is added
// server-side, the same eventId must be sent with the server copy so Meta deduplicates
// the pair into a single event instead of counting it twice.

const PIXEL_ID = import.meta.env.VITE_PUBLIC_META_PIXEL_ID as string | undefined;

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

export function initMetaPixel() {
  if (typeof window === "undefined") return;
  if (!PIXEL_ID) return;
  if (isInitialized) return;
  if (!isTrackableHost()) return;

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
    if (!q) return;
    // autoConfig off: we fire every event explicitly so the funnel stays auditable.
    q("set", "autoConfig", false, PIXEL_ID);
    q("init", PIXEL_ID);
    isInitialized = true;
  } catch {
    // Silently fail — analytics must never break the app
  }
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
      body: JSON.stringify({ eventName, eventId, sourceUrl: window.location.href }),
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
  properties?: Record<string, unknown>
): string | null {
  if (typeof window === "undefined") return null;
  if (!isTrackableHost()) return null;

  const eventId = newEventId();
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

/** PageView on every client-side route change. Meta only auto-fires it on hard loads. */
export function trackMetaPageView() {
  if (typeof window === "undefined" || !isInitialized) return;
  try {
    fbq()?.("track", "PageView");
  } catch {
    // Silently fail
  }
}
