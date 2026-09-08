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
 * Fire a Meta standard event. Returns the eventId used, for server-side deduplication.
 * Returns null when the pixel is disabled or unavailable.
 */
export function trackMeta(
  eventName: string,
  properties?: Record<string, unknown>
): string | null {
  if (typeof window === "undefined" || !isInitialized) return null;
  try {
    const eventId = newEventId();
    fbq()?.("track", eventName, properties ?? {}, { eventID: eventId });
    return eventId;
  } catch {
    return null;
  }
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
