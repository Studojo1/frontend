// INAPP (4 Nov 2026, the owner: "for the users tapping inside Instagram or Facebook, inside of the built-in browser,
// instead redirect them to use it directly on Chrome or Safari ... and figure out fixes for the call failures apart from
// the user side"). Every call that failed on prod so far failed with mic_denied, right after Instagram ad and link in bio
// traffic: an app's own browser (Instagram, Facebook, Messenger, LinkedIn, TikTok, Snapchat) often refuses the
// microphone, sometimes without asking. This module is the pure half of the site's escape (components/inapp/
// InAppEscape.tsx): a tap on "Start the call", the sign-up card or any link to the product's /join, in an app's browser,
// opens the same address in Chrome or Safari instead of going on there.
//
//   inAppOf      which app's browser a user agent is (or "none", a real browser)
//   osOf         android, ios or other (an iPad asking for the desktop site is ios, by its touch screen)
//   escapePlan   how to leave: Android opens Chrome with an intent URL, iOS 17 and later opens Safari with
//                x-safari-https:// (not in Meta's apps, which drop it); a sheet with the app's own steps and Copy link
//                when neither happens in 1.5 s
//
// The product (Studojo1/career-agent app/lib/inapp.ts) has the same detection and the same escape, plus the
// microphone's own steps; a change here is a change there. journey.ts inAppOf (SITE-TRACK, every journey row's inapp)
// keeps its own coarser values. Pure, for tests (app/lib/inapp.test.mjs).

export const INAPP_APPS = ["instagram", "facebook", "messenger", "linkedin", "tiktok", "snapchat", "whatsapp", "other-webview"] as const;
export type InAppApp = (typeof INAPP_APPS)[number];
export type InApp = InAppApp | "none";
export type Os = "android" | "ios" | "other";

/**
 * Which app's own browser the page is open in, from the user agent. Messenger before Facebook (its agent carries FBAV
 * too). "other-webview": any other app's web view (X, Telegram, Line, Pinterest, Threads, the Google app, WeChat, a bare
 * Android web view, or an iPhone web view without Safari's name). "none": a real browser (Chrome, Safari, Samsung
 * Internet, Firefox, Edge, and Chrome's Custom Tabs, which Gmail and WhatsApp on Android open links in). Pure.
 */
export function inAppOf(ua: string | null | undefined): InApp {
  const s = ua ?? "";
  if (!s) return "none";
  if (/Instagram/i.test(s)) return "instagram";
  if (/FBAN\/Messenger|FB_IAB\/Orca-Android|MessengerLite|FBAN\/MessengerForiOS/i.test(s)) return "messenger";
  if (/FBAN\/|FBAV\/|FB_IAB|FB4A|FBIOS/.test(s)) return "facebook";
  if (/LinkedInApp/i.test(s)) return "linkedin";
  if (/musical_ly|BytedanceWebview|TikTok|\btrill_\d|ByteLocale\//i.test(s)) return "tiktok";
  if (/Snapchat/i.test(s)) return "snapchat";
  if (/WhatsApp/i.test(s)) return "whatsapp";
  if (/Twitter|Telegram|\bLine\/|Pinterest|GSA\/|Barcelona|MicroMessenger|; wv\)/i.test(s)) return "other-webview";
  if (/iPhone|iPad|iPod/.test(s) && /AppleWebKit/.test(s) && !/Safari\//.test(s)) return "other-webview";
  return "none";
}

/**
 * Android, iOS or anything else. `touch` is the browser's own hint (navigator.maxTouchPoints > 1): an iPad asking for
 * the desktop site says Mac, and a Mac with a touch screen is an iPad. Pure.
 */
export function osOf(ua: string | null | undefined, touch = false): Os {
  const s = ua ?? "";
  if (/Android/i.test(s)) return "android";
  if (/iPhone|iPad|iPod/.test(s) || (touch && /Macintosh/.test(s))) return "ios";
  return "other";
}

/** The iOS major version ("CPU iPhone OS 17_4", "CPU OS 18_0"), or null when it is not iOS or does not say. Pure. */
export function iosMajor(ua: string | null | undefined): number | null {
  const s = ua ?? "";
  if (!/iPhone|iPad|iPod/.test(s)) return null;
  const m = /\bOS (\d{1,2})[_.]\d/.exec(s);
  return m ? Number(m[1]) : null;
}

// ------------------------------------------------------------------------------------------------------------ escape

/** The query key the escape's fallback address carries: the intent could not open Chrome, so the page it opens (the
 * product's /join, which has the same escape) shows the steps instead of trying again. */
export const ESCAPE_KEY = "esc";

/** Apps whose browser refuses the microphone for sure: no "Try here anyway". The rest are a guess from the user agent. */
const SURE = new Set<InApp>(["instagram", "facebook", "messenger", "linkedin", "tiktok", "snapchat"]);
/** Apps known to hand an intent:// address to Android (Meta's in-app browser). Elsewhere it may show an error page. */
const INTENT_OK = new Set<InApp>(["instagram", "facebook", "messenger"]);
/** INAPP-IOS (4 Nov 2026, the owner: "the open in safari button on my phone doesn't work"): Meta's browser on an iPhone
 * drops x-safari-https:// without a word (prod, Instagram on iOS: 10 tries, none left the app). Facebook and Messenger
 * run the same browser. There the sheet shows at once: the app's own steps and Copy link, no Open in Safari. */
const SAFARI_BLOCKED = new Set<InApp>(["instagram", "facebook", "messenger"]);

export type EscapeHow = "intent" | "safari";

export interface EscapePlan {
  app: InAppApp;
  os: Os;
  /** Tried at once on the tap: Chrome by intent (Android, Meta's apps), Safari by x-safari-https (iOS 17 and later). */
  auto: EscapeHow | null;
  /** The sheet's own "Open in Chrome" or "Open in Safari" button, where that address is safe to offer. */
  button: EscapeHow | null;
  /** The app's browser refuses the microphone for sure (no "Try here anyway"). */
  sure: boolean;
  /** Where to open it: Chrome on Android, Safari on iOS. */
  browser: "Chrome" | "Safari" | "your browser";
}

/** How a visitor in an app's browser gets to a real one, or null in a real browser. Pure. */
export function escapePlan(ua: string | null | undefined, touch = false): EscapePlan | null {
  const app = inAppOf(ua);
  if (app === "none") return null;
  const os = osOf(ua, touch);
  const sure = SURE.has(app);
  if (os === "android") {
    return { app, os, auto: INTENT_OK.has(app) ? "intent" : null, button: app === "other-webview" ? null : "intent", sure, browser: "Chrome" };
  }
  if (os === "ios") {
    const v = iosMajor(ua);
    const safari = v !== null && v >= 17 && !SAFARI_BLOCKED.has(app) ? "safari" : null;
    return { app, os, auto: safari, button: safari, sure, browser: "Safari" };
  }
  return { app, os, auto: null, button: null, sure, browser: "your browser" };
}

/** An address without the escape's own mark (what is copied, opened and shown). Pure. */
export function withoutEscapeMark(href: string): string {
  try {
    const u = new URL(href);
    if (!u.searchParams.has(ESCAPE_KEY)) return href;
    u.searchParams.delete(ESCAPE_KEY);
    return u.toString();
  } catch {
    return href;
  }
}

/** Whether an address carries the escape's mark (an intent that fell back to the page). Pure. */
export function hasEscapeMark(search: string): boolean {
  return new URLSearchParams(search).has(ESCAPE_KEY);
}

/**
 * An Android intent address that opens `href` in Chrome, query and all (utm_*, via, fbclid). If Chrome is missing, the
 * app's browser opens the fallback: the same address with ?esc=1, where the page shows the steps instead of trying
 * again. Pure.
 */
export function chromeIntentUrl(href: string): string {
  const u = new URL(withoutEscapeMark(href));
  const fallback = new URL(u.toString());
  fallback.hash = "";
  fallback.searchParams.set(ESCAPE_KEY, "1");
  const scheme = u.protocol.replace(":", "");
  return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(fallback.toString())};end`;
}

/** The address that opens `href` in Safari from an app's browser (iOS 17 and later): x-safari-https://... Pure. */
export function safariUrl(href: string): string {
  const u = new URL(withoutEscapeMark(href));
  return `x-safari-${u.protocol.replace(":", "")}://${u.host}${u.pathname}${u.search}${u.hash}`;
}

/** The address an escape opens. Pure. */
export function escapeUrl(how: EscapeHow, href: string): string {
  return how === "intent" ? chromeIntentUrl(href) : safariUrl(href);
}

/**
 * The sign-up card's link (home-v3/agent.ts homeSignIn), back to the typed setup (/start?typed&fresh) instead of the
 * call: the escape sheet's "Set up by typing instead". The same link otherwise (the visit's keys kept). Pure.
 */
export function typedSignIn(signIn: string): string {
  try {
    const u = new URL(signIn, "http://local");
    const next = u.searchParams.get("redirect");
    if (!next || !/\/start\?fresh(&|$)/.test(next)) return signIn;
    u.searchParams.set("redirect", next.replace(/\/start\?fresh/, "/start?typed&fresh"));
    return u.origin === "http://local" ? `${u.pathname}${u.search}` : u.toString();
  } catch {
    return signIn;
  }
}

const APP_NAMES: Record<InAppApp, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  messenger: "Messenger",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  snapchat: "Snapchat",
  whatsapp: "WhatsApp",
  "other-webview": "This app",
};

/** The app's name as the sheet says it ("This app" for an unnamed web view). Pure. */
export function appName(app: InAppApp): string {
  return APP_NAMES[app];
}

/**
 * The sheet's words for an app on a phone, in Stu's voice: the title, why, the app's own steps to its "open in browser"
 * item, and the copy-link line. Plain and short, no dashes. Pure.
 */
export function escapeCopy(plan: Pick<EscapePlan, "app" | "os" | "browser">): { title: string; lead: string; steps: string[]; copy: string } {
  const { app, os, browser } = plan;
  const dots = os === "android" ? "⋮" : "•••";
  const where = `Tap ${dots} at the top right.`;
  const open = (label: string) => `Tap ${label}.`;
  let steps: string[];
  if (app === "instagram" || app === "facebook" || app === "messenger") steps = [where, open(os === "android" ? "Open in Chrome" : "Open in external browser")];
  else if (app === "linkedin") steps = [where, open(os === "ios" ? "Open in Safari" : "Open in browser")];
  else if (app === "tiktok") steps = [where, open("Open in browser")];
  else if (app === "snapchat") steps = [`Tap ${dots} or the share icon.`, open(os === "ios" ? "Open in Safari" : "Open in browser")];
  else steps = [`Tap ${dots} or the share icon.`, open(browser === "your browser" ? "Open in browser" : `Open in ${browser}`)];
  return {
    title: `Open this in ${browser} to talk to Stu`,
    lead: `${appName(app)}'s browser can't use your microphone, so the call can't start here.`,
    steps,
    copy: `Or copy the link and paste it into ${browser}.`,
  };
}
