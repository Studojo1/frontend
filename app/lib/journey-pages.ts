import { readConsent } from "./consent";
import { scrollMilestone, SECTION_RE, widthBucket } from "./journey";

// SITE-TRACK (3 Nov 2026, the owner: 144 visitors today, almost nobody clicked "Start the call", and "we can't tell how
// far they scrolled, how long they stayed, or what they looked at ... page-by-page browsing isn't visible"): the
// browser half of page_view and page_engaged (the contract, and every prop, in app/lib/journey.ts). Both go to our own
// POST /api/journey with navigator.sendBeacon, like clicked_join (journey-client.ts), and nowhere else.
//
//   page_view     at each page load, each client-side route change (a new path; a #hash or a query change is the same
//                 page) and each Back to a page the browser kept (pageshow, persisted). Its pv id is what the page's
//                 other events carry (clicked_join too, journey-client.ts reportJoin).
//   page_engaged  the page view so far, cumulative, so a lost last beacon costs only the end: when the tab is hidden,
//                 when the page goes (pagehide) or the route changes, and at 5, 15, 45, 120, 300 and 600 engaged
//                 seconds. Never twice with nothing new, and not at all for a page view gone inside its first second
//                 with nothing seen. A page view sends about 3 (an in-app browser that is swiped away may never say
//                 goodbye, which is what the checks are for).
//
// Engaged time counts only while the tab is visible. Scroll is the deepest 25, 50, 75 or 100 percent the bottom of the
// screen reached, not counted while the page is locked under the call takeover (its body is pinned, which would read
// as the end of the page), nor after a route change until the scroll has settled (the site glides back to the top, so
// a short next page starts out near its own bottom: /blog read as 100% in a local walk). A [data-section] is seen once it crosses the middle of the screen for a second; a
// [data-start] (the start buttons) once at least half of it is on screen for half a second. Neither counts while
// it is inert or aria-hidden (the page under the call takeover; the floating agent while it is tucked away). A visitor
// who said no to tracking (sj_tracking_consent "denied") sends nothing, the rule clicked_join follows.

const CHECKS_S = [5, 15, 45, 120, 300, 600];
const SECTION_DWELL_MS = 1_000;
const CTA_DWELL_MS = 500;
const TICK_MS = 500;

/** since: when it last came on screen, shown and with the tab visible (null while it is not). */
type Watch = { el: Element; kind: "section" | "cta"; name: string; inView: boolean; since: number | null; done: boolean };

type View = {
  id: string;
  path: string;
  engagedMs: number;
  visibleSince: number | null;
  scroll: number;
  sections: string[];
  ctaPresent: boolean;
  ctaAt: number | null;
  clicked: string | null;
  /** False after a route change until the scroll stands still (or 3 s): nothing on screen counts while it glides. */
  settled: boolean;
  lastY: number;
  began: number;
  nextCheck: number;
  lastSent: string;
  watches: Map<Element, Watch>;
  observers: IntersectionObserver[];
  timers: number[];
};

let view: View | null = null;
let installed = false;
let ticker: number | null = null;

function newId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    // fall through
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

/** The viewport's width bucket and the touch hint every browser row carries (journey.ts WIDTH_BUCKETS, deviceOf). */
function common(): { sw?: number; touch?: true } {
  const out: { sw?: number; touch?: true } = {};
  try {
    const sw = widthBucket(window.innerWidth);
    if (sw !== null) out.sw = sw;
    if ((navigator.maxTouchPoints ?? 0) > 1) out.touch = true;
  } catch {
    // nothing to add
  }
  return out;
}

/** POST one body to /api/journey: sendBeacon (it survives the page going), else a keepalive fetch. Never throws. */
export function sendJourney(body: Record<string, unknown>): void {
  try {
    if (readConsent() === "denied") return;
    // A browser driven by a script (Selenium, Puppeteer, Playwright say so here) is not a visit.
    if (navigator.webdriver) return;
    const text = JSON.stringify(body);
    let sent = false;
    try {
      sent = typeof navigator.sendBeacon === "function" && navigator.sendBeacon("/api/journey", new Blob([text], { type: "text/plain" }));
    } catch {
      sent = false;
    }
    if (!sent) {
      void fetch("/api/journey", { method: "POST", body: text, keepalive: true, credentials: "same-origin", headers: { "Content-Type": "text/plain" } }).catch(() => {});
    }
  } catch {
    // analytics must never break a page
  }
}

function engagedMs(v: View): number {
  return v.engagedMs + (v.visibleSince !== null ? performance.now() - v.visibleSince : 0);
}
const engagedS = (v: View) => Math.round(engagedMs(v) / 1000);

/** The page is locked under the call takeover (call-lock.ts pins the body), or any other pinned modal. */
function locked(): boolean {
  return document.body?.style.position === "fixed" || document.documentElement.style.overflow === "hidden";
}

function measureScroll(): void {
  const v = view;
  if (!v || !v.settled || locked()) return;
  const m = scrollMilestone(window.scrollY + window.innerHeight, document.documentElement.scrollHeight);
  if (m > v.scroll) v.scroll = m;
}

let scrollQueued = false;
function onScroll(): void {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    scrollQueued = false;
    measureScroll();
  });
}

const hiddenFromView = (el: Element) => !el.isConnected || !!el.closest('[inert], [aria-hidden="true"]');

function mark(v: View, w: Watch): void {
  w.done = true;
  for (const o of v.observers) o.unobserve(w.el);
  if (w.kind === "section") {
    if (!v.sections.includes(w.name)) v.sections.push(w.name);
  } else if (v.ctaAt === null) {
    v.ctaAt = engagedS(v);
  }
}

function tick(): void {
  const v = view;
  if (!v) return;
  const now = performance.now();
  if (!v.settled) {
    const y = window.scrollY;
    if (y === v.lastY || now - v.began >= 3_000) v.settled = true;
    else v.lastY = y;
  }
  for (const w of v.watches.values()) {
    if (w.done) continue;
    if (v.settled && w.inView && !hiddenFromView(w.el)) {
      if (w.since === null) w.since = now;
      else if (now - w.since >= (w.kind === "section" ? SECTION_DWELL_MS : CTA_DWELL_MS)) mark(v, w);
    } else {
      w.since = null;
    }
  }
  measureScroll();
  const s = engagedS(v);
  if (v.nextCheck < CHECKS_S.length && s >= CHECKS_S[v.nextCheck]) {
    while (v.nextCheck < CHECKS_S.length && s >= CHECKS_S[v.nextCheck]) v.nextCheck++;
    flush("check");
  }
}

function startTicker(): void {
  if (ticker !== null || !view || document.visibilityState !== "visible") return;
  ticker = window.setInterval(tick, TICK_MS);
}
function stopTicker(): void {
  // time with the tab hidden never counts towards a sight
  if (view) for (const w of view.watches.values()) w.since = null;
  if (ticker === null) return;
  window.clearInterval(ticker);
  ticker = null;
}

/** Watch the page's sections and start buttons (again later for anything drawn after the first paint). */
function scan(v: View): void {
  if (view !== v || typeof IntersectionObserver === "undefined") return;
  if (!v.observers.length) {
    const onEntries = (entries: IntersectionObserverEntry[]) => {
      for (const e of entries) {
        const w = v.watches.get(e.target);
        if (!w || w.done) continue;
        const t = performance.now();
        w.inView = w.kind === "section" ? e.isIntersecting : e.isIntersecting && e.intersectionRatio >= 0.5;
        // leaving the screen after long enough between two ticks still counts
        if (!w.inView && w.since !== null && t - w.since >= (w.kind === "section" ? SECTION_DWELL_MS : CTA_DWELL_MS)) {
          mark(v, w);
          continue;
        }
        w.since = v.settled && w.inView && document.visibilityState === "visible" && !hiddenFromView(w.el) ? (w.since ?? t) : null;
      }
    };
    // a section counts when it crosses the middle 30% of the screen (tall or short alike); a button when half shows
    v.observers.push(new IntersectionObserver(onEntries, { rootMargin: "-35% 0px -35% 0px", threshold: 0 }));
    v.observers.push(new IntersectionObserver(onEntries, { threshold: [0, 0.5, 1] }));
  }
  const [sections, ctas] = v.observers;
  for (const el of document.querySelectorAll<HTMLElement>("[data-section]")) {
    const name = el.dataset.section ?? "";
    if (v.watches.has(el) || !SECTION_RE.test(name)) continue;
    v.watches.set(el, { el, kind: "section", name, inView: false, since: null, done: false });
    sections.observe(el);
  }
  for (const el of document.querySelectorAll<HTMLElement>("[data-start]")) {
    v.ctaPresent = true;
    if (v.watches.has(el)) continue;
    v.watches.set(el, { el, kind: "cta", name: el.dataset.start ?? "", inView: false, since: null, done: false });
    ctas.observe(el);
  }
}

/** Send page_engaged for the current page view, unless nothing is new since the last one. */
function flush(why: "check" | "hidden" | "leave" | "route"): void {
  const v = view;
  if (!v) return;
  const ms = engagedMs(v);
  const s = Math.round(ms / 1000);
  const key = `${s}|${v.scroll}|${v.sections.join(",")}|${v.ctaAt}|${v.clicked}`;
  if (key === v.lastSent) return;
  if (!v.lastSent && ms < 1_000 && !v.sections.length && !v.clicked) return;
  v.lastSent = key;
  const body: Record<string, unknown> = { step: "page_engaged", pv: v.id, path: v.path, engaged_s: s, scroll: v.scroll, sections: v.sections, why };
  if (v.ctaPresent) {
    body.cta_seen = v.ctaAt !== null;
    if (v.ctaAt !== null) body.cta_at = v.ctaAt;
  }
  if (v.clicked) body.clicked = v.clicked;
  sendJourney({ ...body, ...common() });
}

function end(why: "leave" | "route"): void {
  const v = view;
  if (!v) return;
  if (v.visibleSince !== null) {
    v.engagedMs += performance.now() - v.visibleSince;
    v.visibleSince = null;
  }
  flush(why);
  for (const o of v.observers) o.disconnect();
  for (const t of v.timers) window.clearTimeout(t);
  stopTicker();
  view = null;
}

function begin(path: string, nav: "load" | "route" | "back"): void {
  const v: View = {
    id: newId(),
    path: path.slice(0, 200) || "/",
    engagedMs: 0,
    visibleSince: document.visibilityState === "visible" ? performance.now() : null,
    scroll: 0,
    sections: [],
    ctaPresent: false,
    ctaAt: null,
    clicked: null,
    settled: nav !== "route",
    lastY: window.scrollY,
    began: performance.now(),
    nextCheck: 0,
    lastSent: "",
    watches: new Map(),
    observers: [],
    timers: [],
  };
  view = v;
  // After the route's page is drawn and its title set (as root.tsx's PostHog page view waits).
  v.timers.push(
    window.setTimeout(() => {
      if (view !== v) return;
      const body: Record<string, unknown> = { step: "page_view", pv: v.id, path: v.path, title: document.title, nav };
      if (nav === "load" && document.referrer) {
        try {
          const r = new URL(document.referrer);
          body.ref = `${r.origin}${r.pathname}`.slice(0, 300);
        } catch {
          // no referrer
        }
      }
      sendJourney({ ...body, ...common() });
      scan(v);
      measureScroll();
    }, 100),
    window.setTimeout(() => scan(v), 1_500),
  );
  startTicker();
}

/** The current page view's id, or null (journey-client.ts puts it on clicked_join). */
export function currentPageView(): string | null {
  return view?.id ?? null;
}

/**
 * A join or start click on this page view: what clicked_join carries (the page view, and whether a start button had
 * been seen before this click), and the click noted for page_engaged. A click on a start button is itself a sight of it.
 */
export function noteJoinClick(cta: string, onStart: boolean): { pv?: string; cta_seen?: boolean } {
  const v = view;
  if (!v) return {};
  const out: { pv?: string; cta_seen?: boolean } = { pv: v.id };
  if (v.ctaPresent) out.cta_seen = v.ctaAt !== null;
  if (!v.clicked) v.clicked = cta.slice(0, 64);
  if (onStart && v.ctaAt === null) v.ctaAt = engagedS(v);
  return out;
}

let waitingForActivation = false;

/** Called with the path on every route change (root.tsx): the first call is the load's page view. */
export function notePageView(path: string): void {
  if (!installed) return;
  try {
    // A page the browser renders ahead (prerender) is not a visit until the visitor opens it.
    const doc = document as Document & { prerendering?: boolean };
    if (doc.prerendering) {
      if (!waitingForActivation) {
        waitingForActivation = true;
        doc.addEventListener(
          "prerenderingchange",
          () => {
            waitingForActivation = false;
            notePageView(window.location.pathname);
          },
          { once: true },
        );
      }
      return;
    }
    if (!view) begin(path, "load");
    else if (view.path !== path.slice(0, 200)) {
      end("route");
      begin(path, "route");
    }
  } catch {
    // analytics must never break a page
  }
}

/** The listeners for the whole visit. Returns the uninstall. */
export function installPageTracking(): () => void {
  if (typeof document === "undefined" || installed) return () => {};
  installed = true;
  const onVisibility = () => {
    const v = view;
    if (!v) return;
    if (document.visibilityState === "visible") {
      if (v.visibleSince === null) v.visibleSince = performance.now();
      startTicker();
    } else {
      if (v.visibleSince !== null) {
        v.engagedMs += performance.now() - v.visibleSince;
        v.visibleSince = null;
      }
      stopTicker();
      flush("hidden");
    }
  };
  const onPageHide = () => end("leave");
  const onPageShow = (e: PageTransitionEvent) => {
    // Back to a page the browser kept in memory: a new visit to it, with no new load.
    if (e.persisted && !view) begin(window.location.pathname, "back");
  };
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("pageshow", onPageShow);
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    end("leave");
    installed = false;
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", onPageHide);
    window.removeEventListener("pageshow", onPageShow);
    window.removeEventListener("scroll", onScroll);
  };
}
