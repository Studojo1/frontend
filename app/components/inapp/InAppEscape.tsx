import { useCallback, useEffect, useId, useRef, useState } from "react";
import escCss from "./inapp-escape.css?url";
import { bannerCopy, bannerFor, escapeCopy, escapePlan, escapeUrl, hasEscapeMark, typedSignIn, withoutEscapeMark, type EscapeHow, type EscapePlan } from "~/lib/inapp";
import { isJoinHref } from "~/lib/journey";
import { sendJourney } from "~/lib/journey-pages";
import { productOrigin } from "~/lib/product-origin";
import { heldTrackingParams } from "~/lib/attribution";
import { homeSignIn } from "~/components/home-v3/agent";
import { STU_HEAD } from "~/components/home-b2c/links";

// INAPP (4 Nov 2026, the owner: "for the users tapping inside Instagram or Facebook, inside of the built-in browser,
// instead redirect them to use it directly on Chrome or Safari ... and figure out fixes for the call failures apart from
// the user side"). Every failed call on prod so far was mic_denied, right after Instagram ad and link in bio traffic: an
// app's own browser often refuses the microphone, so the call cannot start there.
//
// One capture listener on the site's own pages (root.tsx, where the page tracking runs), only in an app's browser
// (lib/inapp.ts escapePlan). A tap on a call start does not go on in that browser:
//   - "Start the call" (home-v3 [data-start], signed out: its link is the product's /join), the sign-up card's Google
//     and email buttons ([data-signin] in [data-join-card]), and any link to the product's /join or /start;
//   - the same address (its whole query: utm_*, via, fbclid; the held ad click added when the page lost it) opens in
//     Chrome on Android (an intent URL, Meta's apps) or Safari on iOS 17 and later (x-safari-https://, not in Meta's
//     apps, which drop it: there the sheet shows at once, Copy link as its main button);
//   - if the page is still here after ESCAPE_WAIT_MS, or neither is possible, the sheet: "Open this in Safari to talk to
//     Stu", why, that app's steps to its "open in browser" item, Copy link, Open in Chrome or Safari where that address
//     is safe to offer, a quiet "Set up by typing instead" (sign in, then the product's typed setup, /start?typed), and
//     "Try here anyway" only where the app is a guess from its user agent (a bare web view, WhatsApp).
// clicked_join is still sent for the tap (journey-client.ts listens on the same node); this listener only stops the
// page's own handlers (the call takeover) and the link. Journey rows: inapp_seen once a browser session,
// inapp_escape_tried and inapp_escape_sheet (journey.ts BEACON_STEPS). In a real browser nothing here runs.

/** INAPP-OFF (4 Nov 2026, the owner: "can you remove the entire open in safari, let me see if it works on my phone
 * first"): off, so a tap in an app's browser goes on to the call as in a real browser. inapp_seen is still sent. True
 * turns the escape and its sheet back on. */
const ESCAPE_ON = false;
/**
 * INAPP-BANNER (16 Nov 2026, the owner: "if somebody opens studojo.com on an Instagram browser, it shows a button that
 * says you are on Instagram's browser, click this to go to your device's Chrome ... for both iPhone and Android ... if
 * not Chrome, whatever the default browser"; 15 Nov numbers: 72% of visitors came in Instagram's browser and 8.9% of
 * them signed up, against 28.5% in a real browser). A bar at the top of every page in an app's browser (lib/inapp.ts
 * bannerFor) with one button:
 *   - Android: Chrome by intent (its Google sign-in is already there); with no Chrome, the intent falls back here with
 *     ?esc=1 and the phone's default browser is tried once; if the page is still here, the steps.
 *   - iOS: Meta's browser refuses every address that would open Safari (INAPP-IOS), so the button shows the steps
 *     (••• at the top right, Open in external browser) and Copy link.
 * In the page's flow under the phone's cookie notice (COOKIE-TOP). Hidden for the visit with its ×. Its taps are the same
 * journey rows as the escape's, with cta "banner".
 */
const BANNER_ON = true;
/** INAPP-BANNER: on Android a tap on a call start opens Chrome too (an intent); on iOS the tap goes on as INAPP-OFF left it. */
const ANDROID_TAP_ESCAPE = true;
const BANNER_HIDDEN_KEY = "stu_inapp_banner_hidden";
const DEFAULT_TRIED_KEY = "stu_inapp_default_tried";
/** How long a tap's own escape gets before the sheet shows (the app may ask "Open in Chrome?" first). */
const ESCAPE_WAIT_MS = 1_500;
const SEEN_KEY = "stu_inapp_seen";
/** Set when the sheet shows; /auth then skips its older in-app prompt (lib/in-app-browser.ts). */
export const SHEET_SHOWN_KEY = "stu_inapp_sheet_shown";

type Target = { href: string; cta: string; retry: () => void };
type Open = { plan: EscapePlan; href: string; typed: string; cta: string; retry: () => void };
type Actions = { escape: (t: Target, how?: EscapeHow | null) => void; sheet: (t: Target, why: "manual" | "timeout") => void };

const touch = () => (navigator.maxTouchPoints ?? 0) > 1;

/** The address with the held ad click on it when the page lost it on the way (another browser has none of our storage). */
function withHeld(href: string): string {
  try {
    const u = new URL(href, window.location.origin);
    heldTrackingParams().forEach((v, k) => {
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    });
    return u.toString();
  } catch {
    return href;
  }
}

/** The visit's query with the held ad click, for the typed setup's sign-in link. */
function visitSearch(): string {
  const q = new URLSearchParams(window.location.search);
  heldTrackingParams().forEach((v, k) => {
    if (!q.has(k)) q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

/** A call start under the tap, or null: the sign-up card's buttons, then any link to the product's /join or /start. */
function targetOf(t: EventTarget | null): Target | null {
  if (!(t instanceof Element)) return null;
  const signin = t.closest<HTMLElement>("[data-signin]");
  const card = signin?.closest("[data-join-card]");
  if (signin && card) {
    const google = card.querySelector<HTMLAnchorElement>('a[data-signin="google"]');
    const href = (signin instanceof HTMLAnchorElement ? signin : google)?.href;
    if (!href) return null;
    const form = signin.closest("form");
    return { href, cta: `signup_${signin.dataset.signin || "card"}`, retry: () => (form && signin instanceof HTMLButtonElement ? form.requestSubmit(signin) : signin.click()) };
  }
  const a = t.closest<HTMLAnchorElement>("a[href]");
  if (!a) return null;
  const raw = a.getAttribute("href") ?? "";
  if (!isJoinHref(raw, window.location.origin, productOrigin())) return null;
  // A sign-in or sign-up link to /auth stays as it is (/auth has its own way out, EX-06): only the product's own pages.
  try {
    if (new URL(raw, window.location.origin).pathname.replace(/\/+$/, "") === "/auth") return null;
  } catch {
    return null;
  }
  return { href: a.href, cta: a.dataset.start ? `start_${a.dataset.start}` : "join", retry: () => a.click() };
}

/** Copy a link: the clipboard, else a selected text box (some app browsers withhold the clipboard). */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function Sheet({ open, onClose, onStay }: { open: Open; onClose: () => void; onStay: () => void }) {
  const id = useId();
  const card = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<boolean | null>(null);
  const { plan, href, typed, cta } = open;
  const words = escapeCopy(plan);
  const link = withoutEscapeMark(href);
  useEffect(() => {
    card.current?.querySelector<HTMLElement>("[data-sheet-title]")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="sj-esc" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={card} className="sj-esc-card" role="dialog" aria-modal="true" aria-labelledby={`${id}-t`}>
        <button type="button" className="sj-esc-x" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="sj-esc-who">
          <img src={STU_HEAD} alt="" width={52} height={52} />
          <span className="sj-esc-kicker">Stu, your career agent</span>
        </div>
        <h2 id={`${id}-t`} className="sj-esc-title" data-sheet-title tabIndex={-1}>
          {words.title}
        </h2>
        <p className="sj-esc-lead">{words.lead}</p>
        <ol className="sj-esc-steps">
          {words.steps.map((s, i) => (
            <li key={s}>
              <span aria-hidden="true">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <p className="sj-esc-copyline">{words.copy}</p>
        <div className="sj-esc-acts">
          <button type="button" className={plan.button ? "sj-esc-btn2" : "sj-esc-btn"} onClick={() => void copyText(link).then(setCopied)}>
            {copied ? "Link copied" : "Copy link"}
          </button>
          {plan.button && (
            <a
              className="sj-esc-btn"
              href={escapeUrl(plan.button, link)}
              onClick={() => sendJourney({ step: "inapp_escape_tried", path: window.location.pathname, app: plan.app, os: plan.os, how: plan.button, cta })}
            >
              Open in {plan.browser}
            </a>
          )}
        </div>
        {copied === false && (
          <p className="sj-esc-err" role="alert">
            Copying didn&apos;t work here. Press and hold the address at the top to copy it.
          </p>
        )}
        <div className="sj-esc-quiet">
          <a href={typed}>Can&apos;t talk right now? Set up by typing instead</a>
          {!plan.sure && (
            <button type="button" onClick={onStay}>
              Try here anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** INAPP-BANNER: the bar at the top: where they are, why their browser is better, the button and its ×. */
function Banner({ plan, onOpen, onHide }: { plan: EscapePlan; onOpen: () => void; onHide: () => void }) {
  const bar = useRef<HTMLDivElement>(null);
  const words = bannerCopy(plan);
  // The page starts below the bar (html.sj-inbar-on, --sj-inbar-h), and below the phone's cookie notice when it is open.
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const root = document.documentElement;
    const set = () => root.style.setProperty("--sj-inbar-h", `${Math.ceil(el.getBoundingClientRect().height)}px`);
    set();
    root.classList.add("sj-inbar-on");
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(set) : null;
    ro?.observe(el);
    return () => {
      ro?.disconnect();
      root.classList.remove("sj-inbar-on");
      root.style.removeProperty("--sj-inbar-h");
    };
  }, []);
  return (
    <div ref={bar} className="sj-inbar" role="region" aria-label={words.title}>
      <div className="sj-inbar-text">
        <b>{words.title}</b>
        <span>{words.lead}</span>
      </div>
      <button type="button" className="sj-inbar-go" onClick={onOpen}>
        {words.button}
      </button>
      <button type="button" className="sj-inbar-x" onClick={onHide} aria-label="Hide this">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/** The site's escape from an app's own browser (root.tsx, the site's own hosts). Renders nothing in a real browser. */
export function InAppEscape() {
  const [open, setOpen] = useState<Open | null>(null);
  // In an app's browser: the sheet's stylesheet loads now, so the first sheet never waits for it.
  const [inApp, setInApp] = useState(false);
  const [banner, setBanner] = useState<EscapePlan | null>(null);
  const stayed = useRef(false);
  const actions = useRef<Actions | null>(null);

  useEffect(() => {
    const plan = escapePlan(navigator.userAgent, touch());
    if (!plan) return;
    const base = () => ({ path: window.location.pathname, app: plan.app, os: plan.os });
    try {
      if (!sessionStorage.getItem(SEEN_KEY)) {
        sessionStorage.setItem(SEEN_KEY, "1");
        sendJourney({ step: "inapp_seen", ...base() });
      }
    } catch {
      // storage blocked: no inapp_seen row, the escape still works
    }
    // INAPP-BANNER: the bar, Android's tap escape and the no-Chrome fallback; with none of them, nothing more (INAPP-OFF).
    const tapEscape = ESCAPE_ON || (ANDROID_TAP_ESCAPE && plan.os === "android" && plan.auto === "intent");
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(BANNER_HIDDEN_KEY) === "1";
    } catch {
      // storage blocked: the bar shows
    }
    const showBanner = BANNER_ON && bannerFor(plan) && !hidden;
    const noChrome = plan.os === "android" && hasEscapeMark(window.location.search);
    if (!ESCAPE_ON && !tapEscape && !showBanner && !noChrome) return;
    setInApp(true);
    let timer: ReturnType<typeof setTimeout> | null = null;
    const sheet = (t: Target, why: "manual" | "timeout") => {
      try {
        sessionStorage.setItem(SHEET_SHOWN_KEY, "1");
      } catch {
        // storage blocked: /auth may show its prompt
      }
      setOpen({ plan, href: withHeld(t.href), typed: typedSignIn(homeSignIn(visitSearch())), cta: t.cta, retry: t.retry });
      sendJourney({ step: "inapp_escape_sheet", ...base(), cta: t.cta, why });
    };
    const escape = (t: Target, how: EscapeHow | null = plan.auto) => {
      if (!how) return sheet(t, "manual");
      // The page going to the background is the other browser opening: then no sheet.
      let left = false;
      const onHide = () => {
        if (document.visibilityState === "hidden") left = true;
      };
      const onPageHide = () => {
        left = true;
      };
      document.addEventListener("visibilitychange", onHide);
      window.addEventListener("pagehide", onPageHide);
      sendJourney({ step: "inapp_escape_tried", ...base(), cta: t.cta, how });
      try {
        window.location.href = escapeUrl(how, withHeld(t.href));
      } catch {
        // the app refused the address: the sheet below
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        document.removeEventListener("visibilitychange", onHide);
        window.removeEventListener("pagehide", onPageHide);
        if (!left) sheet(t, "timeout");
      }, ESCAPE_WAIT_MS);
    };
    actions.current = { escape, sheet };
    if (showBanner) setBanner(plan);
    // The Chrome intent fell back here (?esc=1: no Chrome on this phone): the default browser once, then the steps.
    if (noChrome) {
      const here: Target = { href: withoutEscapeMark(window.location.href), cta: "banner", retry: () => undefined };
      let tried = false;
      try {
        tried = sessionStorage.getItem(DEFAULT_TRIED_KEY) === "1";
        sessionStorage.setItem(DEFAULT_TRIED_KEY, "1");
      } catch {
        // storage blocked: try it
      }
      if (tried) sheet(here, "manual");
      else escape(here, "browser");
    }
    if (!tapEscape) {
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
    const onClick = (e: MouseEvent) => {
      if (stayed.current || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const t = targetOf(e.target);
      if (!t) return;
      // Not the link, not the page's own handlers (the call takeover); clicked_join on this node still runs.
      e.preventDefault();
      e.stopPropagation();
      escape(t);
    };
    // Enter in the sign-up card's email field submits without a click.
    const onSubmit = (e: SubmitEvent) => {
      if (stayed.current) return;
      const form = e.target instanceof HTMLFormElement ? e.target : null;
      if (!form?.closest("[data-join-card]")) return;
      const t = targetOf(form.querySelector('[data-signin="email"]'));
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      escape(t);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  const close = useCallback(() => setOpen(null), []);
  // INAPP-BANNER: Android goes to Chrome (the escape, with its sheet if the page stays); iOS gets the steps at once.
  const fromBanner = useCallback(() => {
    const a = actions.current;
    if (!a || !banner) return;
    const t: Target = { href: withoutEscapeMark(window.location.href), cta: "banner", retry: () => undefined };
    if (banner.os === "android" && banner.auto) a.escape(t, banner.auto);
    else a.sheet(t, "manual");
  }, [banner]);
  const hideBanner = useCallback(() => {
    try {
      sessionStorage.setItem(BANNER_HIDDEN_KEY, "1");
    } catch {
      // storage blocked: hidden until the next page
    }
    setBanner(null);
  }, []);
  const stay = useCallback(() => {
    stayed.current = true;
    const retry = open?.retry;
    setOpen(null);
    retry?.();
  }, [open]);

  if (!inApp) return null;
  return (
    <>
      <link rel="stylesheet" href={escCss} precedence="default" />
      {banner && <Banner plan={banner} onOpen={fromBanner} onHide={hideBanner} />}
      {open && <Sheet open={open} onClose={close} onStay={stay} />}
    </>
  );
}
