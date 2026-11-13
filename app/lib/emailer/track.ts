import { capturePostHog, initPostHog } from "../posthog";

// EMAILER: the tool's PostHog events. PostHog starts after hydration from the root (and only on studojo.com); a call
// before that is queued (posthog.ts), so initPostHog() here only makes sure an early event (emailer_view) is not lost.
// Every Stu link on the page also carries data-join-cta="emailer_<cta>", so the site's own funnel event (clicked_join,
// app/lib/journey-client.ts: our /api/journey, PostHog and Meta's Lead) counts it too, with no code here.

export type EmailerEvent =
  | "emailer_view"
  | "emailer_start"
  | "emailer_generate"
  | "emailer_copy"
  | "emailer_gmail"
  | "emailer_cta"
  | "emailer_share"
  | "emailer_signin_prompt"
  | "emailer_grade"
  | "emailer_resume"
  // EMAILER-FIX (13 Nov 2026): "Already wrote one?" on the write form, to Improve my email.
  | "emailer_to_improve";

declare global {
  interface Window {
    /** DEV ONLY: every event the page sent, for the local Playwright run. */
    __emailerEvents?: { event: string; props: Record<string, unknown> }[];
  }
}

export function track(event: EmailerEvent, props: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  try {
    initPostHog();
    capturePostHog(event, { ...props, path: window.location.pathname });
  } catch {
    // analytics never breaks the page
  }
  if (import.meta.env.DEV) {
    (window.__emailerEvents ??= []).push({ event, props });
  }
}
