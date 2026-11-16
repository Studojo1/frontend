import { productOrigin, productOriginFrom } from "../product-origin";

// EMAILER-STAGING-ONLY (12 Nov 2026, the owner: "only keep it on staging"): the free email writer (/tools/emailer and its
// share pages) shows on staging (studojo.pro) and in local runs, never on production (studojo.com) until the owner says
// so. Production is told apart by its product host (PRODUCT_ORIGIN https://platform.studojo.com, set by
// deploy-web.yml per namespace), which the server and the browser read alike (product-origin.ts), so the header and
// footer draw the same links on both. On production its pages answer 404 and nothing links to them.

/**
 * EMAILER-PROD (16 Nov 2026, the owner: "the email writer that we have can we make that available on .com now for users
 * to access so we can promote it"): on production too. False hides it on production again (404, no links), as before.
 */
export const EMAILER_ON_PRODUCTION = true;

/** Whether the email writer shows for this product origin: everywhere (EMAILER_ON_PRODUCTION), else all but production's. Pure. */
export function emailerLiveFor(value: string | null | undefined): boolean {
  if (EMAILER_ON_PRODUCTION) return true;
  const origin = productOriginFrom(value);
  if (!origin) return true;
  return new URL(origin).hostname !== "platform.studojo.com";
}

/** Whether the email writer shows here (this process's product origin). */
export const emailerLive = (): boolean => emailerLiveFor(productOrigin());
