// SITE-TRACK (3 Nov 2026, the owner: "how far they scrolled, how long they stayed, or what they looked at"): drives the
// browser half of page_view and page_engaged (app/lib/journey-pages.ts) against a stand-in window, document, clock and
// IntersectionObserver, and reads every beacon it sends. What it guards: one page_view a page view (a route change is
// a new one, a #hash is not, Back to a kept page is), engaged time only while the tab shows, the deepest scroll (never
// the call takeover's pinned body, never the glide back to the top after a route change), a section seen after a second across the middle of the screen, a start button after
// half a second at half on screen (never while aria-hidden or inert), the checks at 5 and 15 seconds, nothing twice,
// clicked_join's page view and cta_seen, and nothing at all for a visitor who said no.
import assert from "node:assert/strict";

// ---------- the stand-in browser ----------
let now = 0;
let timers = [];
let nextTimer = 1;
const addTimer = (fn, ms, every) => {
  const id = nextTimer++;
  timers.push({ id, at: now + ms, fn, every });
  return id;
};
const clearTimer = (id) => {
  timers = timers.filter((t) => t.id !== id);
};
function advance(ms) {
  const end = now + ms;
  for (;;) {
    timers.sort((a, b) => a.at - b.at || a.id - b.id);
    const t = timers[0];
    if (!t || t.at > end) break;
    now = t.at;
    if (t.every) t.at = now + t.every;
    else timers.shift();
    t.fn();
  }
  now = end;
}

const sent = [];
const listeners = { window: new Map(), document: new Map() };
const on = (where) => (type, fn) => {
  const set = listeners[where].get(type) ?? new Set();
  set.add(fn);
  listeners[where].set(type, set);
};
const off = (where) => (type, fn) => listeners[where].get(type)?.delete(fn);
const emit = (where, type, e = {}) => {
  for (const fn of listeners[where].get(type) ?? []) fn(e);
};

function el(attrs = {}) {
  return {
    dataset: { ...attrs.dataset },
    isConnected: true,
    hidden: false,
    closest(sel) {
      return sel.includes("aria-hidden") && this.hidden ? this : null;
    },
  };
}
let sections = [];
let starts = [];

const observers = [];
class FakeIO {
  constructor(cb, opts) {
    this.cb = cb;
    this.opts = opts ?? {};
    this.els = new Set();
    observers.push(this);
  }
  observe(e) {
    this.els.add(e);
  }
  unobserve(e) {
    this.els.delete(e);
  }
  disconnect() {
    this.els.clear();
  }
}
function view(e, isIntersecting, intersectionRatio = isIntersecting ? 1 : 0) {
  for (const o of observers) if (o.els.has(e)) o.cb([{ target: e, isIntersecting, intersectionRatio }]);
}

const page = { scrollY: 0, innerHeight: 700, innerWidth: 393, scrollHeight: 6000, visibility: "visible", title: "Studojo", referrer: "https://l.instagram.com/?u=x", path: "/", cookie: "" };
const bodyStyle = { position: "" };
const htmlStyle = { overflow: "" };

globalThis.window = {
  get innerWidth() {
    return page.innerWidth;
  },
  get innerHeight() {
    return page.innerHeight;
  },
  get scrollY() {
    return page.scrollY;
  },
  location: {
    get pathname() {
      return page.path;
    },
  },
  setTimeout: (fn, ms) => addTimer(fn, ms),
  clearTimeout: clearTimer,
  setInterval: (fn, ms) => addTimer(fn, ms, ms),
  clearInterval: clearTimer,
  addEventListener: on("window"),
  removeEventListener: off("window"),
};
globalThis.document = {
  get visibilityState() {
    return page.visibility;
  },
  get title() {
    return page.title;
  },
  get referrer() {
    return page.referrer;
  },
  get cookie() {
    return page.cookie;
  },
  body: { style: bodyStyle },
  documentElement: {
    style: htmlStyle,
    get scrollHeight() {
      return page.scrollHeight;
    },
  },
  querySelectorAll(sel) {
    return sel === "[data-section]" ? sections : sel === "[data-start]" ? starts : [];
  },
  addEventListener: on("document"),
  removeEventListener: off("document"),
};
globalThis.IntersectionObserver = FakeIO;
globalThis.requestAnimationFrame = (fn) => addTimer(fn, 16);
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
Object.defineProperty(globalThis, "performance", { value: { now: () => now }, configurable: true });
Object.defineProperty(globalThis, "navigator", {
  value: {
    maxTouchPoints: 5,
    sendBeacon(url, blob) {
      sent.push({ url, blob });
      return true;
    },
  },
  configurable: true,
});

const { currentPageView, installPageTracking, noteJoinClick, notePageView } = await import("./journey-pages.ts");

async function drain() {
  const out = [];
  for (const { url, blob } of sent.splice(0)) {
    assert.equal(url, "/api/journey");
    assert.equal(blob.type, "text/plain", "a simple request: no preflight, cookies sent");
    out.push(JSON.parse(await blob.text()));
  }
  return out;
}

// ---------- 1. a homepage load from Instagram ----------
const hero = el({ dataset: { section: "hero" } });
const how = el({ dataset: { section: "how" } });
const why = el({ dataset: { section: "why" } });
const proof = el({ dataset: { section: "proof" } });
const heroBtn = el({ dataset: { start: "hero" } });
const sideBtn = el({ dataset: { start: "side" } });
sideBtn.hidden = true; // the floating agent, tucked away (aria-hidden)
sections = [hero, how, why, proof];
starts = [heroBtn, sideBtn];

const uninstall = installPageTracking();
notePageView("/");
const pv = currentPageView();
assert.match(pv, /^[A-Za-z0-9_-]{8,40}$/);
advance(100);
let out = await drain();
assert.equal(out.length, 1);
assert.deepEqual(out[0], { step: "page_view", pv, path: "/", title: "Studojo", nav: "load", ref: "https://l.instagram.com/", sw: 390, touch: true });
// sections across the middle 30% of the screen, start buttons at half; each element on its own observer
assert.deepEqual(observers.map((o) => [o.opts, [...o.els].map((e) => e.dataset.section ?? e.dataset.start)]), [
  [{ rootMargin: "-35% 0px -35% 0px", threshold: 0 }, ["hero", "how", "why", "proof"]],
  [{ threshold: [0, 0.5, 1] }, ["hero", "side"]],
]);

// the hero crosses the middle of the screen at once; the hero button is half on screen; the side pill is "in view"
// but aria-hidden
view(hero, true);
view(heroBtn, true, 0.6);
view(sideBtn, true, 1);
view(how, false);
advance(400);
// a click this early: clicked_join says the button had not yet been seen for half a second
assert.deepEqual(noteJoinClick("join_site", false), { pv, cta_seen: false });
advance(600); // 1 s on screen: the hero is seen; the button long since
advance(1_000);
// a short phone page view so far: nothing sent before the 5 s check
assert.equal(sent.length, 0);
advance(3_100); // 5 s engaged
out = await drain();
assert.equal(out.length, 1);
assert.deepEqual(out[0], { step: "page_engaged", pv, path: "/", engaged_s: 5, scroll: 0, sections: ["hero"], why: "check", cta_seen: true, cta_at: 1, clicked: "join_site", sw: 390, touch: true });

// scroll to half way: how crosses the middle for 0.8 s only (not seen), then why for a full second
page.scrollY = 2000;
emit("window", "scroll");
view(hero, false);
view(heroBtn, false);
view(how, true);
advance(800);
view(how, false);
view(why, true);
advance(1_000);
// proof: on screen 1.05 s, gone again between two half-second checks of the clock; still seen
view(why, false);
advance(100);
view(proof, true);
advance(1_050);
view(proof, false);

// ---------- 2. the call takeover: the body is pinned, the page under it inert ----------
bodyStyle.position = "fixed";
page.scrollY = 0;
page.scrollHeight = 700; // a pinned body reads as a page one screen tall: the end of the page
emit("window", "scroll");
advance(500);
bodyStyle.position = "";
page.scrollHeight = 6000;
page.scrollY = 2000;

// ---------- 3. the tab is hidden: time stops, the page view so far goes ----------
advance(1_100);
page.visibility = "hidden";
emit("document", "visibilitychange");
out = await drain();
assert.equal(out.length, 1);
assert.equal(out[0].why, "hidden");
assert.equal(out[0].scroll, 25, "(2000 + 700) / 6000 is past 25%, and the takeover's pinned body never counted as 100%");
assert.deepEqual(out[0].sections, ["hero", "why", "proof"], "how was on screen 0.8 s only");
assert.equal(out[0].engaged_s, 10, "9.75 s with the tab showing");
advance(60_000); // a minute in another app: not engaged, no checks
assert.equal(sent.length, 0);
emit("document", "visibilitychange"); // still hidden: nothing new, nothing sent
assert.equal(sent.length, 0);
page.visibility = "visible";
emit("document", "visibilitychange");
advance(6_500); // 15 s engaged: the next check
out = await drain();
assert.equal(out.length, 1);
assert.equal(out[0].engaged_s, 15);
assert.equal(out[0].why, "check");

// ---------- 4. a #hash (the takeover's #stu) is the same page; a new path is a new page view ----------
notePageView("/");
assert.equal(currentPageView(), pv);
page.path = "/blog";
page.title = "Blog | Studojo";
sections = [];
starts = [el({ dataset: { start: "blog-inline" } })];
advance(1_000);
// the new page is drawn at the old scroll, clamped near its own bottom, and the site glides back to the top
page.scrollHeight = 1526;
page.scrollY = 826;
notePageView("/blog");
const pv2 = currentPageView();
assert.notEqual(pv2, pv);
out = await drain();
assert.equal(out.length, 1, "the home page view's last word");
assert.equal(out[0].pv, pv);
assert.equal(out[0].why, "route");
assert.equal(out[0].engaged_s, 17);
advance(100);
out = await drain();
assert.deepEqual(out[0], { step: "page_view", pv: pv2, path: "/blog", title: "Blog | Studojo", nav: "route", sw: 390, touch: true }, "no referrer after the first");

for (const y of [673, 363, 50, 0]) {
  page.scrollY = y;
  emit("window", "scroll");
  advance(150);
}
advance(1_200); // still for a while: settled
page.visibility = "hidden";
emit("document", "visibilitychange");
out = await drain();
assert.equal(out[0].scroll, 25, "the glide back to the top never counted as the end of /blog (700 / 1526 is 45%)");
page.visibility = "visible";
emit("document", "visibilitychange");

// a blog reader who scrolls to the end and taps the inline start
page.scrollY = 826;
emit("window", "scroll");
advance(16);
assert.deepEqual(noteJoinClick("start_blog-inline", true), { pv: pv2, cta_seen: false });

// ---------- 5. leaving (pagehide) sends the last word once; Back to the kept page is a new page view ----------
page.visibility = "hidden";
emit("document", "visibilitychange");
emit("window", "pagehide", { persisted: true });
out = await drain();
assert.equal(out.length, 1, "visibilitychange then pagehide: one beacon, nothing twice");
assert.deepEqual(
  { scroll: out[0].scroll, cta_seen: out[0].cta_seen, cta_at: out[0].cta_at, clicked: out[0].clicked, why: out[0].why },
  { scroll: 100, cta_seen: true, cta_at: 2, clicked: "start_blog-inline", why: "hidden" },
  "a click on a start button is a sight of it",
);
assert.equal(currentPageView(), null);
page.visibility = "visible";
emit("window", "pageshow", { persisted: true });
const pv3 = currentPageView();
assert.ok(pv3 && pv3 !== pv2);
advance(100);
out = await drain();
assert.equal(out[0].nav, "back");
assert.equal(out[0].ref, undefined);

// ---------- 6. a bounce under a second sends its page view only ----------
emit("window", "pagehide", { persisted: false });
assert.equal((await drain()).length, 0);

// ---------- 7. said no to tracking: nothing ----------
page.cookie = "sj_tracking_consent=denied";
page.path = "/";
emit("window", "pageshow", { persisted: true });
advance(10_000);
assert.ok(currentPageView(), "measured, never sent");
emit("window", "pagehide", { persisted: false });
assert.equal(sent.length, 0);
uninstall();

console.log("journey-pages: ok");
