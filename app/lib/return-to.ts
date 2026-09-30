/** The one place /auth and /onboarding URLs carrying a return path are built,
 * so call sites cannot drift back to hardcoded destinations. */

/** A same-origin path, or null. Rejects protocol-relative and backslash tricks. */
export function safeReturnPath(v: string | null | undefined): string | null {
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return null;
  return v;
}

// Ad click parameters worth keeping on an /auth link (VS-V09). Mirrors
// PARAMS in attribution.ts; kept here so this file stays dependency free.
const TRACKING = [
  "fbclid", "gclid",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
] as const;

/** /auth link that brings the user back to `returnTo` after signing in. */
export function authUrl(mode: "signin" | "signup", returnTo?: string): string {
  const qs = new URLSearchParams({ mode });
  const path = safeReturnPath(returnTo);
  if (!path) return `/auth?${qs}`;
  const url = new URL(path, "http://x");
  if (url.pathname === "/auth" || url.pathname.startsWith("/auth/")) {
    // VS-V01: a link built on /auth itself (the header's Get Started) keeps
    // the redirect the page already carries, instead of dropping it and
    // sending the new user to the homepage after Google.
    const inner = safeReturnPath(url.searchParams.get("redirect"));
    if (inner && inner !== "/" && !inner.startsWith("/auth")) qs.set("redirect", inner);
  } else if (path !== "/") {
    qs.set("redirect", path);
  }
  // VS-V09: carry the ad click onto the /auth URL too, so a visitor who copies
  // it into another browser (leaving the Instagram webview) keeps the fbclid.
  for (const p of TRACKING) {
    const v = url.searchParams.get(p);
    if (v) qs.set(p, v);
  }
  return `/auth?${qs}`;
}

/**
 * Where the header's Get Started should return a new user to. On the
 * /outreach landing page that is the upload step, not the landing page
 * itself, which made every ad visitor who signed up from the header tap the
 * same CTA a second time (audit VS-V05). The query string is kept so ad
 * click ids and utm tags still reach /auth. Everywhere else: this page.
 */
export function signupReturnPath(pathname: string, search = ""): string {
  if (pathname === "/outreach" || pathname === "/outreach/") return `/outreach/onboarding/upload${search}`;
  return pathname + search;
}

/** /onboarding URL that continues to `returnTo` once the profile form is done. */
export function onboardingUrl(request: Request): string {
  const url = new URL(request.url);
  const path = url.pathname + url.search;
  return path === "/" ? "/onboarding" : `/onboarding?next=${encodeURIComponent(path)}`;
}
