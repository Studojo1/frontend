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

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = "https://eu.i.posthog.com";

let isInitialized = false;

export function initPostHog() {
  if (typeof window === "undefined") return;
  if (!POSTHOG_KEY) return;
  if (isInitialized) return;

  isInitialized = true;
  import("posthog-js")
    .then(({ default: ph }) => {
      ph.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false, // we fire manually on route change
        capture_pageleave: true,
        session_recording: {
          maskAllInputs: true,
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
