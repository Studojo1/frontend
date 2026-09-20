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
};

const PARAMS = [
  "fbclid", "gclid",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
] as const;

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
    if (read()) return; // first touch already held, leave it alone

    const qs = new URLSearchParams(window.location.search);
    const found: Attribution = {};
    for (const p of PARAMS) {
      const v = qs.get(p);
      if (v) found[p] = v.slice(0, 300);
    }

    // A visit with no tags and no external referrer tells us nothing, and
    // storing it would block a later tagged click from being recorded as the
    // first touch. Only keep a visit that carries some signal.
    const ref = document.referrer || "";
    const external = ref && !ref.includes(window.location.host);
    if (Object.keys(found).length === 0 && !external) return;

    found.referrer = ref.slice(0, 500);
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
export async function flushAttribution(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(SENT)) return;
    const data = read();
    if (!data) return;

    const res = await fetch("/api/attribution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    // Only mark as sent on success, so a transient failure retries next load
    // rather than losing the attribution permanently.
    if (res.ok) localStorage.setItem(SENT, "1");
  } catch {
    // Same reasoning as above: never let this surface to the user.
  }
}
