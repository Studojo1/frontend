/**
 * Coupon codes that arrive in a link (audit NEW-07, OP-N12).
 *
 * Coupon and checkout-recovery emails link to /outreach/results?coupon=CODE.
 * The student then goes results -> pricing, so the code has to outlive the
 * page it arrived on. Every /outreach/* page remembers it (the outreach
 * layout calls rememberCoupon) and the pricing page reads it back.
 *
 * Pure apart from the storage handed in, so tests can call it directly.
 */

export const COUPON_STORAGE_KEY = "outreach_coupon";

type Store = Pick<Storage, "getItem" | "setItem">;

/** The ?coupon= value, cleaned up, or null when there is none or it is junk. */
export function couponFromSearch(search: string): string | null {
  const raw = new URLSearchParams(search).get("coupon");
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  return /^[A-Z0-9_-]{2,40}$/.test(code) ? code : null;
}

/** Keep a ?coupon= code for the rest of this visit. Never throws. */
export function rememberCoupon(search: string, storage: Store | null | undefined): string | null {
  const code = couponFromSearch(search);
  if (code && storage) {
    try {
      storage.setItem(COUPON_STORAGE_KEY, code);
    } catch {
      // Storage blocked (private mode): the URL still carries it this once.
    }
  }
  return code;
}

/** The code to prefill: the URL wins, then one remembered earlier this visit. */
export function recallCoupon(search: string, storage: Store | null | undefined): string | null {
  const fromUrl = couponFromSearch(search);
  if (fromUrl) return fromUrl;
  if (!storage) return null;
  try {
    const saved = storage.getItem(COUPON_STORAGE_KEY);
    return saved ? couponFromSearch(`?coupon=${encodeURIComponent(saved)}`) : null;
  } catch {
    return null;
  }
}

/** sessionStorage when the browser allows it, else null. */
export function sessionStore(): Store | null {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}
