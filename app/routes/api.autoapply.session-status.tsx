// GET /api/autoapply/session/status
// Lightweight poll endpoint — returns whether a LinkedIn session is saved for the
// current user. Used by the LKOT page to detect when the extension has fired.

import { getSessionFromRequest } from "~/lib/onboarding.server";
import { eq } from "drizzle-orm";
import db from "~/lib/db";
import { userLinkedinSessions } from "../../auth-schema";
import type { Route } from "./+types/api.autoapply.session-status";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ connected: false, reason: "not_authed" }, { status: 401 });

  const [liSession] = await db
    .select({
      isActive: userLinkedinSessions.isActive,
      warmupDay: userLinkedinSessions.warmupDay,
      proxyCountry: userLinkedinSessions.proxyCountry,
      cookieRefreshedAt: userLinkedinSessions.cookieRefreshedAt,
    })
    .from(userLinkedinSessions)
    .where(eq(userLinkedinSessions.userId, session.user.id))
    .limit(1);

  if (!liSession) return Response.json({ connected: false });

  const cookieAgeDays = liSession.cookieRefreshedAt
    ? Math.floor((Date.now() - new Date(liSession.cookieRefreshedAt).getTime()) / 86_400_000)
    : null;

  return Response.json({
    connected: liSession.isActive,
    warmupDay: liSession.warmupDay,
    proxyCountry: liSession.proxyCountry,
    cookieAgeDays,
    cookieExpiresSoon: (cookieAgeDays ?? 0) >= 25,
    connectedAt: liSession.cookieRefreshedAt,
  });
}
