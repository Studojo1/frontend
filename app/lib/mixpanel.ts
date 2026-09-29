import type { OverridedMixpanel } from "mixpanel-browser";

const MIXPANEL_TOKEN = "78431f4d81860b16a66d35a343d0618e";

// PH-05: mixpanel-browser (with its session recorder) is ~117 KB gzipped, the
// largest chunk in the root bundle, and used to download before first paint on
// every page. It is now fetched with a dynamic import on first use (root calls
// initMixpanel after hydration). Calls made before it loads are queued and
// replayed in order.
let mixpanel: OverridedMixpanel | null = null;
let loading = false;
let failed = false;
const pending: ((mp: OverridedMixpanel) => void)[] = [];

function run(fn: (mp: OverridedMixpanel) => void) {
  try {
    fn(mixpanel!);
  } catch {
    // Silently fail to avoid breaking the app
  }
}

function withMixpanel(fn: (mp: OverridedMixpanel) => void) {
  if (typeof window === "undefined" || failed) return;
  if (mixpanel) {
    run(fn);
    return;
  }
  pending.push(fn);
  initMixpanel();
}

// Initialize Mixpanel
export function initMixpanel() {
  if (typeof window === "undefined") return;
  if (mixpanel || loading || failed) return;
  loading = true;

  import("mixpanel-browser")
    .then(({ default: mp }) => {
      mp.init(MIXPANEL_TOKEN, {
        debug: import.meta.env.DEV,
        track_pageview: true,
        persistence: "localStorage",
        autocapture: true,
        record_sessions_percent: 100,
      });
      mixpanel = mp;
      for (const fn of pending.splice(0)) run(fn);
    })
    .catch((error) => {
      console.error("Failed to initialize Mixpanel:", error);
      failed = true;
      pending.length = 0;
    })
    .finally(() => {
      loading = false;
    });
}

// Identify a user
export function identifyUser(userId: string, properties?: {
  email?: string;
  name?: string;
  [key: string]: any;
}) {
  withMixpanel((mp) => {
    mp.identify(userId);
    if (properties) {
      mp.people.set({
        $name: properties.name,
        $email: properties.email,
        ...properties,
      });
    }
  });
}

// Track an event
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  withMixpanel((mp) => {
    mp.track(eventName, properties);
  });
}

// Reset Mixpanel (on logout)
export function resetMixpanel() {
  if (typeof window === "undefined" || !mixpanel) return;
  run((mp) => mp.reset());
}
