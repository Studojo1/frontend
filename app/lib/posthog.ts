import type { PostHog } from "posthog-js";

// PH-05: posthog-js is ~57 KB gzipped and used to ship in the root bundle on
// every page. It is now fetched with a dynamic import after hydration, so it
// no longer delays first paint. Calls made before it loads are queued and
// replayed in order once init has run.
let posthog: PostHog | null = null;
const pending: ((ph: PostHog) => void)[] = [];

function withPostHog(fn: (ph: PostHog) => void) {
  if (posthog) {
    try {
      fn(posthog);
    } catch {
      // Silently fail
    }
  } else {
    pending.push(fn);
  }
}

const POSTHOG_KEY = import.meta.env?.VITE_PUBLIC_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = "https://eu.i.posthog.com";

let isInitialized = false;

// Production hosts only. Staging (studojo.pro) and local builds carry the
// same project key, so their test traffic landed in the production funnel
// (audit ST-N03).
function isProductionHost(): boolean {
  const h = window.location.hostname;
  return h === "studojo.com" || h.endsWith(".studojo.com");
}

// One-time Gmail OAuth codes ride in the URL of /outreach/connect/gmail (and,
// when the visitor is bounced to sign in, inside /auth's redirect param).
// Strip them from every property before an event leaves the browser (PS-N15).
const SECRET_PARAM = /([?&]|%3F|%26)(gmail_code|gmail_state)(=|%3D)[^&#%]*(%[0-9A-F]{2}[^&#%]*)*/gi;

export function scrubSecrets<T>(value: T): T {
  if (typeof value === "string") return value.replace(SECRET_PARAM, "$1$2$3[redacted]") as T;
  if (Array.isArray(value)) return value.map(scrubSecrets) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = scrubSecrets(v);
    return out as T;
  }
  return value;
}

export function initPostHog() {
  if (typeof window === "undefined") return;
  if (!POSTHOG_KEY) return;
  if (!isProductionHost()) return;
  if (isInitialized) return;

  isInitialized = true;
  import("posthog-js")
    .then(({ default: ph }) => {
      ph.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false, // we fire manually on route change
        capture_pageleave: true,
        before_send: (event) => (event ? { ...event, properties: scrubSecrets(event.properties) } : event),
        // Replays mask every piece of on-screen text, not only inputs: they
        // were recording resume details, outreach email bodies and hiring
        // managers' replies (audit ST-N05).
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: "*",
          blockSelector: ".ph-no-capture",
        },
      });
      posthog = ph;
      for (const fn of pending.splice(0)) withPostHog(fn);
    })
    .catch((error) => {
      // Analytics must never break the app, but a silent failure here disables
      // every capture for the whole session, so leave a trace in the console.
      console.error("[posthog] init failed; events will not be sent:", error);
      pending.length = 0;
      isInitialized = false;
    });
}

export function identifyPostHogUser(
  userId: string,
  properties?: { email?: string; name?: string; [key: string]: any }
) {
  if (typeof window === "undefined" || !isInitialized) return;
  withPostHog((ph) => ph.identify(userId, properties));
}

export function capturePostHog(event: string, properties?: Record<string, any>) {
  if (typeof window === "undefined" || !isInitialized) return;
  withPostHog((ph) => ph.capture(event, properties));
}

export function resetPostHog() {
  if (typeof window === "undefined" || !isInitialized) return;
  withPostHog((ph) => ph.reset());
}

export function registerPostHogProps(props: Record<string, string>) {
  if (typeof window === "undefined" || !isInitialized) return;
  withPostHog((ph) => ph.register(props));
}
