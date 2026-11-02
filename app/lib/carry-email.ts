// QA-FIX (2 Nov 2026): the email someone types on the homepage's call screen (the sign-up card, home-v3/JoinCard.tsx)
// carries to /auth and fills its email field, so nobody types it twice. It travels in this tab's sessionStorage, never
// in the address (a URL ends up in history, logs, referrers and analytics): /auth is on the same origin and opens in
// the same tab. It is short-lived (10 minutes), read once, and only a plausible address is kept. Pure helpers are
// exported for tests (app/lib/carry-email.test.mjs); storage errors (private mode, blocked storage) are silent.

export const CARRY_EMAIL_KEY = "stu_carry_email";
export const CARRY_EMAIL_TTL_MS = 10 * 60_000;

/** A plausible email, trimmed, or null. Not a full check: /auth's own form and the server do that. */
export function cleanEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const e = raw.trim();
  if (e.length < 3 || e.length > 254) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}

/** The stored value for an email typed at `now`, or null when there is nothing worth keeping. Pure. */
export function packEmail(raw: unknown, now: number): string | null {
  const e = cleanEmail(raw);
  return e ? JSON.stringify({ e, t: now }) : null;
}

/** The email from a stored value, or null when it is missing, malformed or older than the TTL. Pure. */
export function unpackEmail(stored: string | null | undefined, now: number): string | null {
  if (!stored) return null;
  try {
    const v = JSON.parse(stored) as { e?: unknown; t?: unknown };
    if (typeof v.t !== "number" || now - v.t < 0 || now - v.t > CARRY_EMAIL_TTL_MS) return null;
    return cleanEmail(v.e);
  } catch {
    return null;
  }
}

/** On the call screen: hold the typed email for /auth (or forget an old one when the field is empty). */
export function holdEmail(raw: unknown): void {
  try {
    const packed = packEmail(raw, Date.now());
    if (packed) sessionStorage.setItem(CARRY_EMAIL_KEY, packed);
    else sessionStorage.removeItem(CARRY_EMAIL_KEY);
  } catch {
    // storage blocked: /auth just opens with an empty field
  }
}

/** On /auth: the held email, once. It is removed whether or not it was still fresh. */
export function takeEmail(): string | null {
  try {
    const stored = sessionStorage.getItem(CARRY_EMAIL_KEY);
    sessionStorage.removeItem(CARRY_EMAIL_KEY);
    return unpackEmail(stored, Date.now());
  } catch {
    return null;
  }
}
