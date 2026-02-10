import { eq, desc, and } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { resumeDrafts, resumeVersions } from "../../auth-schema";
import type { Route } from "./+types/api.v2.resumes.$id";

// GET /api/v2/resumes/:id - Get draft
export async function loader({ params, request }: Route.LoaderArgs) {
  // Skip database query for special routes that should be handled by other routes
  if (params.id === "preview-proxy" || params.id === "import") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Validate UUID format before querying database to prevent errors
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(params.id)) {
    return Response.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [draft] = await db
    .select()
    .from(resumeDrafts)
    .where(and(eq(resumeDrafts.id, params.id), eq(resumeDrafts.userId, session.user.id)))
    .limit(1);

  if (!draft) {
    return Response.json({ error: "Draft not found" }, { status: 404 });
  }

  return Response.json({ draft });
}

// PUT /api/v2/resumes/:id - Update draft (auto-versions)
// DELETE /api/v2/resumes/:id - Delete draft (soft delete via archive)
export async function action({ params, request }: Route.ActionArgs) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Skip database query for special routes
  if (params.id === "preview-proxy" || params.id === "import") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Validate UUID format before querying database
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(params.id)) {
    return Response.json({ error: "Invalid ID format" }, { status: 400 });
  }

  // Handle DELETE
  if (request.method === "DELETE") {
    // Verify ownership
    const [existing] = await db
      .select()
      .from(resumeDrafts)
      .where(and(eq(resumeDrafts.id, params.id), eq(resumeDrafts.userId, session.user.id)))
      .limit(1);

    if (!existing) {
      return Response.json({ error: "Draft not found" }, { status: 404 });
    }

    // Soft delete (archive)
    await db
      .update(resumeDrafts)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(eq(resumeDrafts.id, params.id));

    return Response.json({ message: "Draft archived successfully" });
  }

  // Handle PUT
  if (request.method !== "PUT") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // UUID validation already done above, but keep it here for safety
  // Verify ownership
  const [existing] = await db
    .select()
    .from(resumeDrafts)
    .where(and(eq(resumeDrafts.id, params.id), eq(resumeDrafts.userId, session.user.id)))
    .limit(1);

  if (!existing) {
    return Response.json({ error: "Draft not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, sections, templateId, changeSummary } = body;

  // Get next version number
  const [latestVersion] = await db
    .select()
    .from(resumeVersions)
    .where(eq(resumeVersions.resumeId, params.id))
    .orderBy(desc(resumeVersions.version))
    .limit(1);

  const nextVersion = (existing.version || 0) + 1;

  // Update draft
  const [updated] = await db
    .update(resumeDrafts)
    .set({
      name: name || existing.name,
      sections: sections || existing.sections,
      templateId: templateId || existing.templateId,
      version: nextVersion,
      updatedAt: new Date(),
    })
    .where(eq(resumeDrafts.id, params.id))
    .returning();

  // Note: resume_versions table references resumes table, not resume_drafts
  // Drafts track their own version in the version column, so we skip creating version records
  // This prevents foreign key constraint errors

  return Response.json({ draft: updated });
}

// DELETE /api/v2/resumes/:id - Delete draft (soft delete via archive)
// Handle DELETE in action function

