/** First-touch attribution capture.
 *
 * Nothing in the product recorded where a visitor came from, so a paying
 * customer could never be joined back to an ad. This captures the ad click
 * parameters on the first page a visitor lands on and holds them until a
 * session exists, at which point they are written against the user.
 *
 * First touch, not last: the click that introduced someone to Studojo is the
 * one that earned the signup, and overwriting it on a later organic visit
 * would quietly credit the wrong source. Once set, it is never replaced.
 */

import { trackingAllowed } from "./consent";

const KEY = "studojo_attribution";
const SENT = "studojo_attribution_sent";

export type Attribution = {
  fbclid?: string;
  gclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_path?: string;
  captured_at?: string;
  untagged?: boolean;
};

export const PARAMS = [
  "fbclid", "gclid",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
] as const;

/** Hosts a visitor passes through on the way into or around Studojo, not
 * sources that sent them. EX-08 / VS-V09: the Google sign-in return arrives
 * with an accounts.google.com referrer, and that was counted as a referral,
 * so it overwrote the held direct or search first touch (89 of 161 untagged
 * rows). Payment gateways return the same way after checkout. */
const INTERNAL_HOSTS = [
  "studojo.com", "studojo.pro",
  "razorpay.com", "dodopayments.com",
];

function hostMatches(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

/** True if `referrer` is a real outside source, not our own site, the Google
 * OAuth hop or a payment gateway returning the user. Pure, for tests. */
export function isExternalReferrer(referrer: string, currentHost: string): boolean {
  if (!referrer) return false;
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return false;
  }
  const own = currentHost.toLowerCase().split(":")[0];
  if (host === own) return false;
  // accounts.google.com, and its country variants.
  if (/^accounts\.google\.[a-z.]+$/.test(host)) return false;
  return !INTERNAL_HOSTS.some((d) => hostMatches(host, d));
}

/** The ad click parameters present in a query string. */
export function trackingParams(search: string): URLSearchParams {
  const qs = new URLSearchParams(search);
  const out = new URLSearchParams();
  for (const p of PARAMS) {
    const v = qs.get(p);
    if (v) out.set(p, v);
  }
  return out;
}

function read(): Attribution | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

/** Record this visit if it is the first one we have seen. Safe to call anywhere. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const held = read();
    // A tagged first touch is never replaced. An untagged one only holds the
    // slot until a tagged visit arrives.
    if (held && !held.untagged) return;

    const qs = new URLSearchParams(window.location.search);
    const found: Attribution = {};
    for (const p of PARAMS) {
      const v = qs.get(p);
      if (v) found[p] = v.slice(0, 300);
    }

    // Untagged direct visits are still recorded: a row with no source is data
    // (it counts direct traffic), a missing row is not. It is marked so a later
    // tagged click can still take the first-touch slot.
    const ref = document.referrer || "";
    const external = isExternalReferrer(ref, window.location.host);
    const untagged = Object.keys(found).length === 0 && !external;
    if (untagged && held) return;
    if (untagged) found.untagged = true;

    // EX-08: an internal hop (Google OAuth, a payment gateway, our own pages)
    // is not a source, so a first row seen straight after one reads as direct.
    found.referrer = external ? ref.slice(0, 500) : "";
    found.landing_path = window.location.pathname.slice(0, 200);
    found.captured_at = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(found));
  } catch {
    // localStorage can be unavailable (private mode, blocked cookies). Losing
    // attribution must never break the page.
  }
}

/**
 * Send the held attribution to the server once, after a session exists.
 *
 * Deliberately not tied to the signup call: Google sign-in leaves the site for
 * the OAuth round trip, so there is no reliable success callback to hang this
 * on. Watching for "a session is present and we have not sent yet" covers the
 * email and the OAuth paths with the same code.
 */
export async function flushAttribution(userId: string): Promise<void> {
  if (typeof window === "undefined") return;
  // VS-V09: keyed per user. One flag per browser meant a second account made
  // on the same device never got a row. The server ignores repeats.
  const sentKey = `${SENT}_${userId}`;
  try {
    if (localStorage.getItem(sentKey)) return;
    const data = read();
    if (!data) return;

    const res = await fetch("/api/attribution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    // Only mark as sent on success, so a transient failure retries next load
    // rather than losing the attribution permanently.
    if (res.ok) localStorage.setItem(sentKey, "1");
  } catch {
    // Same reasoning as above: never let this surface to the user.
  }
}

/** The held first-touch ad parameters, for carrying onto a link that may be
 * opened in another browser (EX-06: leaving the Instagram in-app browser
 * would otherwise drop the fbclid that credits the ad). */
export function heldTrackingParams(): URLSearchParams {
  const out = new URLSearchParams();
  if (typeof window === "undefined") return out;
  const held = read();
  if (!held) return out;
  for (const p of PARAMS) {
    const v = held[p];
    if (v) out.set(p, v);
  }
  return out;
}

/** Pages where a visitor may leave for another browser (the Instagram and
 * Facebook in-app browsers' "Open in browser" menu) and where the held ad
 * click should ride along in the address bar (audit VS-V09). */
export function carriesTrackingParams(pathname: string): boolean {
  return pathname === "/auth" || pathname.startsWith("/outreach/onboarding/upload");
}

/**
 * The query string with the held first-touch ad parameters added, or null
 * when there is nothing to add. A URL that already carries any tracking
 * parameter is left alone, so two different touches are never mixed. Pure,
 * for tests.
 */
export function withHeldTracking(search: string, held: URLSearchParams): string | null {
  const qs = new URLSearchParams(search);
  if ([...held.keys()].length === 0) return null;
  if (PARAMS.some((p) => qs.has(p))) return null;
  held.forEach((v, k) => qs.set(k, v));
  return `?${qs.toString()}`;
}

/** Meta's fbc format for a click id: fb.<subdomain index>.<ms>.<fbclid>. */
export function buildFbc(fbclid: string, clickMs: number): string {
  return `fb.1.${Math.floor(clickMs)}.${fbclid}`;
}

/** The browser ids Meta matches a server-side event on (EX-07): the _fbp and
 * _fbc cookies the pixel sets, or an fbc built from the stored fbclid when
 * the pixel was blocked before it could write one. */
export function metaBrowserIds(): { fbp?: string; fbc?: string } {
  if (typeof document === "undefined") return {};
  // No consent (EU/UK), no Meta identifiers on the order either (HP-N13).
  if (!trackingAllowed()) return {};
  const cookie = (name: string): string | undefined => {
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    try {
      return m ? decodeURIComponent(m[1]) : undefined;
    } catch {
      return undefined;
    }
  };
  const out: { fbp?: string; fbc?: string } = {};
  const fbp = cookie("_fbp");
  if (fbp) out.fbp = fbp;
  let fbc = cookie("_fbc");
  if (!fbc) {
    const held = read();
    if (held?.fbclid) {
      const ms = Date.parse(held.captured_at ?? "");
      fbc = buildFbc(held.fbclid, Number.isFinite(ms) ? ms : Date.now());
    }
  }
  if (fbc) out.fbc = fbc;
  return out;
}
