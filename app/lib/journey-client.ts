import { capturePostHog } from "./posthog";
import { trackMeta } from "./meta-pixel";
import { readConsent } from "./consent";
import { isJoinHref, widthBucket } from "./journey";
import { noteJoinClick, sendJourney } from "./journey-pages";
import { productOrigin } from "./product-origin";

// FIRST-PARTY JOURNEY, the browser half (contract in app/lib/journey.ts): one listener for the whole site. A click on
// any join or start CTA sends
//   - clicked_join to our own /api/journey (navigator.sendBeacon, survives the page leaving), props {cta, path}, and
//     (SITE-TRACK, 3 Nov 2026) pv, the page view it happened on, cta_seen, whether a start button had been on screen
//     before this click (journey-pages.ts), and sw, the viewport width bucket; the server adds device and inapp;
//   - clicked_join to PostHog;
//   - Meta Lead, once per browser session, browser pixel and the server copy (/api/meta-event) with one event_id so
//     Meta keeps one. trackMeta applies the host gate (studojo.com, ?fbdebug elsewhere) and the consent rule.
// A visitor who said no to tracking (sj_tracking_consent "denied") sends nothing.
//
// A join or start CTA is: the homepage's "start the call" ([data-start], signed out) and its sign-up card's Google and
// email buttons ([data-signin]), any element marked [data-join-cta="name"], and any link to the product's /join (or
// /b2cnew/join, or a sign-up on /auth that returns to the product), journey.ts isJoinHref.

const LEAD_SENT = "stu_lead_sent";

function ctaFor(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null;
  const marked = target.closest<HTMLElement>("[data-join-cta]");
  if (marked) return marked.dataset.joinCta || "join";
  const signin = target.closest<HTMLElement>("[data-signin]");
  if (signin && signin.closest("[data-join-card]")) return `signup_${signin.dataset.signin || "card"}`;
  const a = target.closest<HTMLAnchorElement>("a[href]");
  if (!a) return null;
  const href = a.getAttribute("href") ?? "";
  if (!isJoinHref(href, window.location.origin, productOrigin())) return null;
  if (a.dataset.start) return `start_${a.dataset.start}`;
  const via = (() => {
    try {
      return new URL(href, window.location.origin).searchParams.get("via");
    } catch {
      return null;
    }
  })();
  return via ? `join_${via}` : "join";
}

/** Send clicked_join (and Meta Lead once a session). Exported for the odd caller that is not a click. */
export function reportJoin(cta: string): void {
  try {
    if (readConsent() === "denied") return;
    const path = window.location.pathname;
    const seen = noteJoinClick(cta, cta.startsWith("start_"));
    const sw = widthBucket(window.innerWidth);
    const touch = (navigator.maxTouchPoints ?? 0) > 1;
    // sendJourney: navigator.sendBeacon("/api/journey", ...), else a keepalive fetch (journey-pages.ts).
    sendJourney({ cta: cta.slice(0, 64), path, ...seen, ...(sw !== null ? { sw } : {}), ...(touch ? { touch } : {}) });
    capturePostHog("clicked_join", { cta, path });
    let leadSent = false;
    try {
      leadSent = sessionStorage.getItem(LEAD_SENT) === "1";
    } catch {
      leadSent = false;
    }
    if (!leadSent) {
      const id = trackMeta("Lead", { content_name: cta });
      if (id) {
        try {
          sessionStorage.setItem(LEAD_SENT, "1");
        } catch {
          // storage blocked: at worst a second Lead this session
        }
      }
    }
  } catch {
    // analytics must never break a click
  }
}

let installed = false;

/** One capture listener on the document (clicks and the sign-up card's email form). Returns the uninstall. */
export function installJoinTracking(): () => void {
  if (typeof document === "undefined" || installed) return () => {};
  installed = true;
  // A click and the submit it causes are one join.
  let last = 0;
  const fire = (cta: string | null) => {
    if (!cta) return;
    const now = Date.now();
    if (now - last < 800) return;
    last = now;
    reportJoin(cta);
  };
  const onClick = (e: MouseEvent) => {
    if (e.button !== 0) return;
    fire(ctaFor(e.target));
  };
  const onSubmit = (e: SubmitEvent) => {
    const form = e.target instanceof Element ? e.target : null;
    if (!form?.closest("[data-join-card]")) return;
    fire("signup_email");
  };
  document.addEventListener("click", onClick, true);
  document.addEventListener("submit", onSubmit, true);
  return () => {
    installed = false;
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("submit", onSubmit, true);
  };
}
