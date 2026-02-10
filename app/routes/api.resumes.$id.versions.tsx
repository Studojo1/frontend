import { eq, desc, and } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { resumes, resumeVersions } from "../../auth-schema";
import type { Route } from "./+types/api.resumes.$id.versions";

// GET /api/resumes/:id/versions - List all versions
export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const [resume] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, params.id), eq(resumes.userId, session.user.id)))
    .limit(1);

  if (!resume) {
    return Response.json({ error: "Resume not found" }, { status: 404 });
  }

  const versions = await db
    .select()
    .from(resumeVersions)
    .where(eq(resumeVersions.resumeId, params.id))
    .orderBy(desc(resumeVersions.version));

  return Response.json({ versions });
}

