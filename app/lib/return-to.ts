/** The one place /auth and /onboarding URLs carrying a return path are built,
 * so call sites cannot drift back to hardcoded destinations. */

/** A same-origin path, or null. Rejects protocol-relative and backslash tricks. */
export function safeReturnPath(v: string | null | undefined): string | null {
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return null;
  return v;
}

/** /auth link that brings the user back to `returnTo` after signing in. */
export function authUrl(mode: "signin" | "signup", returnTo?: string): string {
  const qs = new URLSearchParams({ mode });
  const path = safeReturnPath(returnTo);
  if (path && path !== "/" && !path.startsWith("/auth")) qs.set("redirect", path);
  return `/auth?${qs}`;
}

/** /onboarding URL that continues to `returnTo` once the profile form is done. */
export function onboardingUrl(request: Request): string {
  const url = new URL(request.url);
  const path = url.pathname + url.search;
  return path === "/" ? "/onboarding" : `/onboarding?next=${encodeURIComponent(path)}`;
}
