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

// META-FIX (2 Nov 2026, B7): the choice is also a cookie on the parent domain (.studojo.com, staging .studojo.pro),
// so the platform (Studojo1/career-agent on platform.studojo.com) honours an Accept made here, and this site honours
// one made on its /auth on the platform host. The cookie is the latest choice on any of our hosts, so it wins over
// this origin's localStorage; a choice held only in localStorage (made before the cookie existed) is copied to it.
export const CONSENT_COOKIE = "sj_tracking_consent";
const CONSENT_COOKIE_MAX_AGE_S = 365 * 24 * 60 * 60;

/** The parent domain the consent cookie is set on for this host, or null (host-only). Pure. */
export function consentCookieDomain(hostname: string): string | null {
  const h = hostname.toLowerCase();
  for (const d of ["studojo.com", "studojo.pro"]) if (h === d || h.endsWith(`.${d}`)) return `.${d}`;
  return null;
}

/** The consent cookie's Set value for a choice (null clears it). Pure. */
export function consentCookieString(choice: Consent | null, hostname: string, secure: boolean): string {
  const domain = consentCookieDomain(hostname);
  const parts = [`${CONSENT_COOKIE}=${choice ?? ""}`, "Path=/", `Max-Age=${choice ? CONSENT_COOKIE_MAX_AGE_S : 0}`, "SameSite=Lax"];
  if (domain) parts.push(`Domain=${domain}`);
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

/** The choice in a Cookie header (or document.cookie), or null. Pure. */
export function consentFromCookie(cookie: string | null | undefined): Consent | null {
  const m = (cookie ?? "").match(/(?:^|;\s*)sj_tracking_consent=([^;]*)/);
  const v = m?.[1]?.trim();
  return v === "granted" || v === "denied" ? v : null;
}

function writeConsentCookie(choice: Consent | null): void {
  try {
    document.cookie = consentCookieString(choice, window.location.hostname, window.location.protocol === "https:");
  } catch {
    // cookies blocked: localStorage still holds it here
  }
}

let copied = false;

export function readConsent(): Consent | null {
  try {
    const c = consentFromCookie(document.cookie);
    if (c) return c;
  } catch {
    // cookies blocked: localStorage below
  }
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    const held = v === "granted" || v === "denied" ? v : null;
    if (held && !copied) {
      copied = true;
      writeConsentCookie(held);
    }
    return held;
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
  writeConsentCookie(choice);
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

/**
 * The consent state for a server that reports to Meta on our behalf (HP-N13):
 * job-outreach-svc's Purchase and our own /api/meta-event. The server applies
 * the same rule as trackingAllowed(): an EU/UK time zone with no "granted"
 * choice means no event. Sent with every order and every mirrored event.
 */
export function consentForServer(): { tracking_consent: Consent | null; time_zone: string | null } {
  let tz: string | null = null;
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    tz = null;
  }
  const c = memo !== undefined ? memo : readConsent();
  return { tracking_consent: c ?? null, time_zone: tz };
}

/** Server side of the same rule, for /api/meta-event. Pure, for tests.
 * An explicit choice wins; with none, an EU/UK (or unknown) time zone is no. */
export function serverMayReportToMeta(consent: unknown, timeZone: unknown): boolean {
  if (consent === "denied") return false;
  if (consent === "granted") return true;
  return !consentRegion(typeof timeZone === "string" ? timeZone : null);
}
