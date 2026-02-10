import { eq, desc, and } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { resumeDrafts, resumeVersions } from "../../auth-schema";
import type { Route } from "./+types/api.v2.resumes.$id.versions";

// GET /api/v2/resumes/:id/versions - List all versions
export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const [draft] = await db
    .select()
    .from(resumeDrafts)
    .where(and(eq(resumeDrafts.id, params.id), eq(resumeDrafts.userId, session.user.id)))
    .limit(1);

  if (!draft) {
    return Response.json({ error: "Draft not found" }, { status: 404 });
  }

  const versions = await db
    .select()
    .from(resumeVersions)
    .where(eq(resumeVersions.resumeId, params.id))
    .orderBy(desc(resumeVersions.version));

  return Response.json({ versions });
}

