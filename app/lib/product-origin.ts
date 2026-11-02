import { normaliseOrigin } from "./auth-cookies";

// PRODUCT_ORIGIN (RELAUNCH, 2 Nov 2026): the product (Stu, Studojo1/career-agent) lives on its own host,
// https://platform.studojo.com (staging https://platform.studojo.pro). The homepage and every "join" or "start" link
// go straight there, and this site answers /b2cnew and /b2cnew/* with a 301 to the same path on that host
// (routes/b2cnew.tsx), so old links keep working.
//
// The server reads PRODUCT_ORIGIN; the browser gets the same value from one inline script in the root layout
// (window.__STU_PRODUCT_ORIGIN__, set before any module runs), so server and browser draw the same links. Unset (local
// runs, tests) the links stay where they were, under /b2cnew on this host. Pure, for tests (app/lib/product-origin.test.mjs).

declare global {
  interface Window {
    __STU_PRODUCT_ORIGIN__?: string;
  }
}

/** Where the product used to live on this host. Sign-in returns stay here (a same-origin path), then the 301. */
export const PRODUCT_LEGACY_BASE = "/b2cnew";

/** A PRODUCT_ORIGIN value as an origin ("https://platform.studojo.com"), or "" when unset or not an https origin. */
export function productOriginFrom(value: string | null | undefined): string {
  return normaliseOrigin(value ?? "") ?? "";
}

/** This process's product origin: the server's PRODUCT_ORIGIN, or in the browser the value the page was drawn with. */
export function productOrigin(): string {
  if (typeof window !== "undefined") return productOriginFrom(window.__STU_PRODUCT_ORIGIN__);
  return productOriginFrom(typeof process !== "undefined" ? process.env?.PRODUCT_ORIGIN : undefined);
}

/**
 * The main site's origin, for this app's pages on the product's own host (QA-FIX, 2 Nov 2026). There only /auth is this
 * app, so the header and footer link to the main site absolutely. MAIN_ORIGIN when it is an https origin; else
 * PRODUCT_ORIGIN without its "platform." label (https://platform.studojo.pro gives https://studojo.pro); else "", and
 * the links stay paths. Pure.
 */
export function mainOriginFrom(mainValue: string | null | undefined, productValue: string | null | undefined): string {
  const set = productOriginFrom(mainValue);
  if (set) return set;
  const product = productOriginFrom(productValue);
  if (!product) return "";
  const u = new URL(product);
  if (!u.hostname.startsWith("platform.")) return "";
  u.hostname = u.hostname.slice("platform.".length);
  return u.origin;
}

/** This server's main-site origin (MAIN_ORIGIN, else from PRODUCT_ORIGIN). Server only: the root loader hands it on. */
export function mainOrigin(): string {
  return mainOriginFrom(process.env.MAIN_ORIGIN, process.env.PRODUCT_ORIGIN);
}

/** A path inside the product ("/join?via=home", "/") as a link: on the product host, or under /b2cnew without one. */
export function productHref(path: string, origin: string = productOrigin()): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (origin) return `${origin}${p}`;
  if (p === "/") return PRODUCT_LEGACY_BASE;
  return `${PRODUCT_LEGACY_BASE}${p}`;
}

/** Where an old /b2cnew address goes: the same path and query on the product host, or null (not one, or no host). */
export function productRedirect(url: string, origin: string): string | null {
  if (!origin) return null;
  const u = new URL(url, "http://local");
  const p = u.pathname;
  if (p !== PRODUCT_LEGACY_BASE && !p.startsWith(`${PRODUCT_LEGACY_BASE}/`)) return null;
  const rest = p.slice(PRODUCT_LEGACY_BASE.length) || "/";
  return `${origin}${rest}${u.search}`;
}

/** The inline script that hands the browser the origin (JSON, and an origin never holds "<"). */
export function productOriginScript(origin: string): string {
  return `window.__STU_PRODUCT_ORIGIN__=${JSON.stringify(productOriginFrom(origin))};`;
}
