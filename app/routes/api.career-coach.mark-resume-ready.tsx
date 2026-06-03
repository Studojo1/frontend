import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.career-coach.mark-resume-ready";

/**
 * Same-origin, session-authed proxy. When a logged-in student has a real saved
 * resume in Resume Maker, the client pings this once; we tell the coach to set
 * resume_maker_ready for that email (server-to-server with the shared secret).
 */
export async function action({ request }: Route.ActionArgs) {
  const session = await getSessionFromRequest(request);
  if (!session?.user?.email) {
    return Response.json({ updated: false, reason: "unauthenticated" }, { status: 401 });
  }
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return Response.json({ updated: false, reason: "unconfigured" });
  try {
    const origin = new URL(request.url).origin;
    const resp = await fetch(`${origin}/api/v1/cc/public/mark-resume-ready`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-studojo-internal": secret },
      body: JSON.stringify({ email: session.user.email }),
      signal: AbortSignal.timeout(6000),
    });
    return Response.json(resp.ok ? await resp.json() : { updated: false });
  } catch {
    return Response.json({ updated: false, reason: "unavailable" });
  }
}
