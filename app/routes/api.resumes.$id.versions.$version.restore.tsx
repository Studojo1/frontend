import { eq, desc, and } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { resumes, resumeVersions } from "../../auth-schema";
import type { Route } from "./+types/api.resumes.$id.versions.$version.restore";

// POST /api/resumes/:id/versions/:version/restore - Restore version
export async function action({ params, request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

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

  // Get next version number
  const [latestVersion] = await db
    .select()
    .from(resumeVersions)
    .where(eq(resumeVersions.resumeId, params.id))
    .orderBy(desc(resumeVersions.version))
    .limit(1);

  const nextVersion = (latestVersion?.version || resume.version) + 1;

  // Update resume with restored data
  const [updated] = await db
    .update(resumes)
    .set({
      resumeData: version.resumeData,
      templateId: version.templateId || resume.templateId,
      version: nextVersion,
      updatedAt: new Date(),
    })
    .where(eq(resumes.id, params.id))
    .returning();

  // Create new version from restored data
  await db.insert(resumeVersions).values({
    resumeId: params.id,
    version: nextVersion,
    resumeData: version.resumeData,
    templateId: version.templateId || resume.templateId,
    changeSummary: `Restored from version ${versionNum}`,
    createdBy: session.user.id,
  });

  return Response.json({ resume: updated });
}

