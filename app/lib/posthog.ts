import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = "https://eu.i.posthog.com";

let isInitialized = false;

export function initPostHog() {
  if (typeof window === "undefined") return;
  if (!POSTHOG_KEY) return;
  if (isInitialized) return;

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // we fire manually on route change
      capture_pageleave: true,
      session_recording: {
        maskAllInputs: true,
        blockSelector: ".ph-no-capture",
      },
      loaded: () => {
        isInitialized = true;
      },
    });
    isInitialized = true;
  } catch (error) {
    // Analytics must never break the app, but a silent failure here disables
    // every capture for the whole session, so leave a trace in the console.
    console.error("[posthog] init failed; events will not be sent:", error);
  }
}

export function identifyPostHogUser(
  userId: string,
  properties?: { email?: string; name?: string; [key: string]: any }
) {
  if (typeof window === "undefined" || !isInitialized) return;
  try {
    posthog.identify(userId, properties);
  } catch {
    // Silently fail
  }
}

export function capturePostHog(event: string, properties?: Record<string, any>) {
  if (typeof window === "undefined" || !isInitialized) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // Silently fail
  }
}

export function resetPostHog() {
  if (typeof window === "undefined" || !isInitialized) return;
  try {
    posthog.reset();
  } catch {
    // Silently fail
  }
}

export function registerPostHogProps(props: Record<string, string>) {
  if (typeof window === "undefined" || !isInitialized) return;
  try {
    posthog.register(props);
  } catch {
    // Silently fail
  }
}
