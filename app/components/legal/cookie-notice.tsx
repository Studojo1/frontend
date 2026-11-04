import { useEffect, useRef, useState } from "react";
import { consentRequired, onConsentChange, readConsent, writeConsent } from "~/lib/consent";

const KEY = "sj_cookie_notice_seen";

/** The CSS variable floating actions ([data-floating-cta], app.css) are lifted by. */
export const NOTICE_VAR = "--sj-notice-h";

/** How far a floating action must rise to clear the notice: its height, the
 * 16px it sits above the screen edge, and an 8px gap (audit PH-06). */
export function noticeLift(noticeHeight: number): string {
  return noticeHeight > 0 ? `${Math.ceil(noticeHeight) + 24}px` : "0px";
}

/** COOKIE-TOP (4 Nov 2026, the owner: "add the cookie notification to the top of the screen on phone not over the start a
 * call button"): on a phone the notice is a bar at the top of the page, in the flow of the page (absolute at the top, the
 * body padded by its height, so it scrolls away with the page and never covers the header, the start button or the
 * bottom bar). NOTICE_TOP_VAR is that height; NOTICE_VAR (the bottom lift) stays 0 on a phone. */
export const NOTICE_TOP_VAR = "--sj-notice-top";
export const PHONE_QUERY = "(max-width: 639.98px)";

/** Keep NOTICE_VAR (desktop) or NOTICE_TOP_VAR (phone) equal to the space the notice takes while it is on screen. */
function useLiftFloatingActions(mode: string) {
  const open = mode !== "hidden";
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    const clear = () => {
      root.style.removeProperty(NOTICE_VAR);
      root.style.removeProperty(NOTICE_TOP_VAR);
    };
    if (!open || !el) {
      clear();
      return;
    }
    const mq = typeof window.matchMedia === "function" ? window.matchMedia(PHONE_QUERY) : null;
    const set = () => {
      const h = el.getBoundingClientRect().height;
      if (mq?.matches) {
        root.style.removeProperty(NOTICE_VAR);
        root.style.setProperty(NOTICE_TOP_VAR, `${Math.ceil(h)}px`);
      } else {
        root.style.removeProperty(NOTICE_TOP_VAR);
        root.style.setProperty(NOTICE_VAR, noticeLift(h));
      }
    };
    set();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(set) : null;
    ro?.observe(el);
    mq?.addEventListener?.("change", set);
    return () => {
      ro?.disconnect();
      mq?.removeEventListener?.("change", set);
      clear();
    };
  }, [open, mode]);
  return ref;
}

// Phone: a bar at the top of the page, under the status bar (safe area). From 640px up: the floating card at the foot.
const WRAP =
  "absolute inset-x-0 top-0 z-[60] px-3 pb-2 pt-[calc(env(safe-area-inset-top,0px)+8px)] sm:fixed sm:inset-x-4 sm:bottom-4 sm:top-auto sm:mx-auto sm:max-w-xl sm:p-0 sm:pb-[env(safe-area-inset-bottom,0px)]";

const box =
  "flex flex-wrap items-center gap-3 rounded-2xl border-2 border-neutral-900 bg-white py-3 pl-4 pr-3 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]";
const primaryBtn =
  "h-10 shrink-0 rounded-xl border-2 border-neutral-900 bg-studojo-purple-strong px-4 font-['Satoshi'] text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none";
// Reject is exactly as prominent as Accept: same size, same weight.
const secondaryBtn =
  "h-10 shrink-0 rounded-xl border-2 border-neutral-900 bg-white px-4 font-['Satoshi'] text-sm font-bold text-neutral-900 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none";

/**
 * First-visit cookie banner.
 *
 * EU/UK visitors (by device time zone) get a real choice: nothing
 * non-essential runs until they tap Accept (see lib/consent.ts, audit HP-N13).
 * Everyone else gets the one-line notice with "Got it".
 */
export function CookieNotice() {
  const [mode, setMode] = useState<"hidden" | "notice" | "choice">("hidden");
  const liftRef = useLiftFloatingActions(mode);

  useEffect(() => {
    const decide = () => {
      if (consentRequired()) {
        setMode(readConsent() ? "hidden" : "choice");
        return;
      }
      try {
        setMode(localStorage.getItem(KEY) ? "hidden" : "notice");
      } catch {
        // Storage blocked: skip the notice rather than show it on every page.
        setMode("hidden");
      }
    };
    decide();
    // "Change cookie choice" on /privacy clears the choice: ask again.
    return onConsentChange(decide);
  }, []);

  if (mode === "hidden") return null;

  if (mode === "choice") {
    const choose = (granted: boolean) => {
      writeConsent(granted ? "granted" : "denied");
      setMode("hidden");
    };
    return (
      <div
        ref={liftRef}
        role="region"
        aria-label="Cookie choice"
        className={WRAP}
      >
        <div className={box}>
          <p className="min-w-[12rem] flex-1 font-['Satoshi'] text-sm leading-5 text-neutral-900">
            We use essential cookies to keep you signed in. With your OK, we also use analytics and advertising
            cookies (PostHog, Meta) and record visits to improve Studojo.{" "}
            <a href="/privacy#cookies" className="font-medium text-studojo-purple-strong underline">
              Learn more
            </a>
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => choose(false)} className={secondaryBtn}>
              Reject
            </button>
            <button type="button" onClick={() => choose(true)} className={primaryBtn}>
              Accept
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setMode("hidden");
  };

  return (
    <div
      ref={liftRef}
      role="region"
      aria-label="Cookie notice"
      className={WRAP}
    >
      <div className={box}>
        <p className="flex-1 font-['Satoshi'] text-sm leading-5 text-neutral-900">
          We use cookies to keep you signed in and improve Studojo.{" "}
          <a href="/privacy#cookies" className="font-medium text-studojo-purple-strong underline">
            Learn more
          </a>
        </p>
        <button type="button" onClick={dismiss} className={primaryBtn}>
          Got it
        </button>
      </div>
    </div>
  );
}

/** For the Privacy Policy: forget the choice so the banner asks again. */
export function CookieChoiceButton() {
  return (
    <button
      type="button"
      onClick={() => writeConsent(null)}
      className="font-medium text-studojo-purple-strong underline"
    >
      Change your cookie choice
    </button>
  );
}
