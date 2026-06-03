import { getSessionFromRequest } from "~/lib/onboarding.server";
import { getCareerSummary } from "~/lib/career-coach.server";
import type { Route } from "./+types/api.career-coach.summary";

/**
 * Same-origin, session-authed proxy that returns the logged-in student's Career
 * Coach summary (readiness, level, next action). The browser calls this; it
 * resolves the user's email from the session and fetches the coach summary
 * server-to-server with the shared secret.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session?.user?.email) {
    return Response.json({ found: false, reason: "unauthenticated" }, { status: 401 });
  }
  const origin = new URL(request.url).origin;
  const summary = await getCareerSummary(session.user.email, origin);
  return Response.json(summary ?? { found: false, reason: "unavailable" });
}
