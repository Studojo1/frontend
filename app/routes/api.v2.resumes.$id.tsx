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

  // Update draft
  const updateData: {
    name?: string;
    sections?: any;
    templateId?: string;
    version?: number;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  // Only update fields that are explicitly provided
  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "Name must be a non-empty string" }, { status: 400 });
    }
    updateData.name = name.trim();
  }
  if (sections !== undefined) {
    updateData.sections = sections;
  }
  if (templateId !== undefined) {
    updateData.templateId = templateId;
  }

  // Only increment version if sections or templateId changed, not for name-only updates
  if (sections !== undefined || templateId !== undefined) {
    const nextVersion = (existing.version || 0) + 1;
    updateData.version = nextVersion;
  }

  // Ensure we have at least one field to update (besides updatedAt)
  const fieldsToUpdate = Object.keys(updateData).filter(key => key !== 'updatedAt');
  if (fieldsToUpdate.length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(resumeDrafts)
    .set(updateData)
    .where(eq(resumeDrafts.id, params.id))
    .returning();

  if (!updated) {
    return Response.json({ error: "Failed to update draft" }, { status: 500 });
  }

  // Note: resume_versions table references resumes table, not resume_drafts
  // Drafts track their own version in the version column, so we skip creating version records
  // This prevents foreign key constraint errors

  return Response.json({ draft: updated });
}

// DELETE /api/v2/resumes/:id - Delete draft (soft delete via archive)
// Handle DELETE in action function

