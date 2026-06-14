import { eq, desc, and } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { resumes, resumeVersions } from "../../auth-schema";
import type { Route } from "./+types/api.resumes";

// GET /api/resumes - List user's resumes
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const userResumes = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, session.user.id))
    .orderBy(desc(resumes.createdAt))
    .limit(limit)
    .offset(offset);

  return Response.json({ resumes: userResumes });
}

// POST /api/resumes - Create new resume
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, resumeData, templateId, originalFile } = body;

  if (!name || !resumeData) {
    return Response.json(
      { error: "Name and resumeData are required" },
      { status: 400 }
    );
  }

  // originalFile is set on the PDF-import path so the ops dashboard can serve
  // the original file later. Validate shape; ignore if malformed rather than
  // failing the create — a resume row without it just falls back to snapshot.
  let resolvedOriginal: { url: string; contentType: string; name: string } | null = null;
  if (originalFile && typeof originalFile === "object") {
    const { url, contentType, name: fileName } = originalFile as Record<string, unknown>;
    if (typeof url === "string" && typeof contentType === "string" && typeof fileName === "string") {
      resolvedOriginal = { url, contentType, name: fileName };
    }
  }

  const newResume = await db
    .insert(resumes)
    .values({
      userId: session.user.id,
      name,
      resumeData,
      version: 1,
      templateId: templateId || "modern",
      originalFileUrl: resolvedOriginal?.url ?? null,
      originalFileContentType: resolvedOriginal?.contentType ?? null,
      originalFileName: resolvedOriginal?.name ?? null,
    })
    .returning();

  // Create initial version
  await db.insert(resumeVersions).values({
    resumeId: newResume[0].id,
    version: 1,
    resumeData,
    templateId: templateId || "modern",
    changeSummary: "Initial version",
    createdBy: session.user.id,
  });

  // Creating a resume IS using Resume Maker — fire the used signal so the
  // emailer routes engagement (stops not-used chases across tools). Non-blocking.
  try {
    const { publishEmailEvent } = await import("~/lib/events");
    await publishEmailEvent("event.cc.resume_used", {
      user_id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    });
  } catch (err) {
    console.error("Failed to publish resume_used event:", err);
  }

  return Response.json({ resume: newResume[0] }, { status: 201 });
}
