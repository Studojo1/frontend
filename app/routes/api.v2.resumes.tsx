import { eq, desc, and } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { resumeDrafts, resumeVersions } from "../../auth-schema";
import type { Route } from "./+types/api.v2.resumes";

// GET /api/v2/resumes - List drafts
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const includeArchived = url.searchParams.get("archived") === "true";

  const whereConditions = [eq(resumeDrafts.userId, session.user.id)];
  if (!includeArchived) {
    whereConditions.push(eq(resumeDrafts.isArchived, false));
  }

  const drafts = await db
    .select()
    .from(resumeDrafts)
    .where(and(...whereConditions))
    .orderBy(desc(resumeDrafts.updatedAt))
    .limit(limit)
    .offset(offset);

  return Response.json({ drafts });
}

// POST /api/v2/resumes - Create draft (from wizard)
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, templateId, sections } = body;

  if (!name || !sections || !Array.isArray(sections)) {
    return Response.json(
      { error: "Name and sections array are required" },
      { status: 400 }
    );
  }

  const newDraft = await db
    .insert(resumeDrafts)
    .values({
      userId: session.user.id,
      name,
      templateId: templateId || "modern",
      sections,
      version: 1,
    })
    .returning();

  // Note: resume_versions table references resumes table, not resume_drafts
  // For now, we'll skip version creation until we migrate to resume_draft_versions
  // The draft itself tracks version in the version column

  return Response.json({ draft: newDraft[0] }, { status: 201 });
}

