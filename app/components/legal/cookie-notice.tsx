import { useEffect, useState } from "react";

const KEY = "sj_cookie_notice_seen";

// One-line notice shown on the first visit. Clicking "Got it" hides it for
// good on this browser. It does not gate the trackers: Privacy Policy §13
// tells people to block analytics and ad cookies in their browser instead.
export function CookieNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      // Storage blocked: skip the notice rather than show it on every page.
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setShow(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-xl pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="flex items-center gap-3 rounded-2xl border-2 border-neutral-900 bg-white py-3 pl-4 pr-3 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
        <p className="flex-1 font-['Satoshi'] text-sm leading-5 text-neutral-900">
          We use cookies to keep you signed in and improve Studojo.{" "}
          <a href="/privacy#cookies" className="font-medium text-studojo-purple-strong underline">
            Learn more
          </a>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="h-10 shrink-0 rounded-xl border-2 border-neutral-900 bg-studojo-purple-strong px-4 font-['Satoshi'] text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
