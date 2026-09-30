import { timingSafeEqual } from "node:crypto";

/** True only when the X-Internal-Secret header matches EMAILER_INTERNAL_SECRET
 * (the service-to-service secret the emailer already uses). No secret
 * configured means nobody gets in. */
export function hasInternalSecret(request: Request): boolean {
  const expected = process.env.EMAILER_INTERNAL_SECRET || "";
  const given = request.headers.get("x-internal-secret") || "";
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
