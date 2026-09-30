/**
 * Tracking consent for EU/UK visitors (audit HP-N13).
 *
 * UK PECR and the GDPR need consent before non-essential cookies, and our
 * Privacy Policy names consent as the legal basis for them in the EU and UK.
 * The Meta pixel, PostHog session recording and PostHog's cookies all started
 * on the first anonymous load, with a notice that did not gate anything.
 *
 * For visitors whose device time zone is in Europe, the Meta pixel (browser and
 * server mirror) stays off, and PostHog runs cookieless (memory only) with no
 * session recording, until they choose Accept. Everyone else is unchanged. The
 * time zone is read on the device, so no location lookup is sent anywhere.
 */

export const CONSENT_KEY = "sj_tracking_consent";
export type Consent = "granted" | "denied";
const CHANGE_EVENT = "sj:consent-change";

// Outside "Europe/*": EU, EEA and UK territories in the Atlantic and Arctic,
// plus the legacy zone names some browsers still report.
const EXTRA_ZONES = new Set([
  "Atlantic/Canary", "Atlantic/Madeira", "Atlantic/Azores", "Atlantic/Reykjavik",
  "Atlantic/Faroe", "Atlantic/Faeroe", "Arctic/Longyearbyen",
  "GB", "GB-Eire", "Eire", "Portugal", "Iceland", "Poland", "WET", "CET", "MET", "EET",
]);

/** Does a visitor in this time zone need to opt in first? Pure, for tests.
 * An unknown zone is treated as needing consent: the safe side. */
export function consentRegion(timeZone: string | null | undefined): boolean {
  if (!timeZone) return true;
  return timeZone.startsWith("Europe/") || EXTRA_ZONES.has(timeZone);
}

export function consentRequired(): boolean {
  if (typeof window === "undefined") return true;
  let tz: string | undefined;
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    tz = undefined;
  }
  return consentRegion(tz);
}

// The choice made on this page; survives blocked storage.
let memo: Consent | null | undefined;

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/** Store the visitor's choice (or clear it, to ask again) and tell listeners. */
export function writeConsent(choice: Consent | null): void {
  try {
    if (choice) localStorage.setItem(CONSENT_KEY, choice);
    else localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Storage blocked: the choice holds for this page only.
  }
  memo = choice;
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: choice }));
}

/** May cookies, the Meta pixel and session recording run for this visitor? */
export function trackingAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (!consentRequired()) return true;
  const c = memo !== undefined ? memo : readConsent();
  return c === "granted";
}

export function onConsentChange(fn: (choice: Consent | null) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => fn((e as CustomEvent<Consent | null>).detail);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}
