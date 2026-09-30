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

/** Keep NOTICE_VAR equal to the notice's lift while it is on screen. */
function useLiftFloatingActions(mode: string) {
  const open = mode !== "hidden";
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!open || !el) {
      root.style.removeProperty(NOTICE_VAR);
      return;
    }
    const set = () => root.style.setProperty(NOTICE_VAR, noticeLift(el.getBoundingClientRect().height));
    set();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(set) : null;
    ro?.observe(el);
    return () => {
      ro?.disconnect();
      root.style.removeProperty(NOTICE_VAR);
    };
  }, [open, mode]);
  return ref;
}

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
        className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-xl pb-[env(safe-area-inset-bottom,0px)]"
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
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-xl pb-[env(safe-area-inset-bottom,0px)]"
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
