import { eq, and } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { resumes, resumeVersions } from "../../auth-schema";
import type { Route } from "./+types/api.resumes.$id.versions.$version";

// GET /api/resumes/:id/versions/:version - Get specific version
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

  const versionNum = parseInt(params.version);
  const [version] = await db
    .select()
    .from(resumeVersions)
    .where(
      and(
        eq(resumeVersions.resumeId, params.id),
        eq(resumeVersions.version, versionNum)
      )
    )
    .limit(1);

  if (!version) {
    return Response.json({ error: "Version not found" }, { status: 404 });
  }

  return Response.json({ version });
}

