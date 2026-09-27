/**
 * Access control for /content, the internal content studio.
 *
 * Two independent gates, both enforced on the server so neither can be
 * bypassed by hitting a loader directly or by tampering with client state:
 *
 *   1. Host gate. This tool exists on studojo.pro (staging) only. On
 *      studojo.com it must not exist at all, so we throw a 404 rather than a
 *      403: a 403 would confirm there is something here to find.
 *   2. Email gate. Only the two Google accounts on the allowlist. Not a role
 *      check like maverick's ops-guard, because "ops" is a broad role and
 *      this tool is deliberately narrower than that.
 *
 * The two predicates live in access.server.ts so they can be tested without a
 * database. Re-exported here so callers have one import.
 */
import { auth } from "~/lib/auth";
import { isContentHost, isAllowedEmail } from "./access.server";

export { isContentHost, isAllowedEmail };

export type ContentUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

/**
 * Guard for every /content loader and action.
 *
 * Throws a 404 Response off-host. Otherwise returns the signed-in user when
 * they are on the allowlist, or null when they are not, so the caller can
 * render a sign-in wall instead of redirecting. A redirect to /auth would
 * bounce a signed-in-but-unlisted user in a loop; the wall tells them plainly
 * that this account is not the one.
 */
export async function requireContentAccess(
  request: Request
): Promise<ContentUser | null> {
  if (!isContentHost(request)) {
    throw new Response("Not Found", { status: 404 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  const u = session?.user as
    | { id: string; email: string; name?: string | null; image?: string | null }
    | undefined;

  if (!u || !isAllowedEmail(u.email)) return null;

  return {
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    image: u.image ?? null,
  };
}

/**
 * Same gates, for API routes. Throws instead of returning null: an API caller
 * has no sign-in wall to render, so an unauthorised call is just a 403.
 */
export async function requireContentApiAccess(
  request: Request
): Promise<ContentUser> {
  const user = await requireContentAccess(request);
  if (!user) {
    throw new Response(JSON.stringify({ error: "Not authorised." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}
