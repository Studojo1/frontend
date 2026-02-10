/**
 * PDF Preview API - Live PDF Streaming for Editing/Review
 * 
 * This endpoint submits a job to generate a PDF preview.
 * The job returns a PDF URL which is streamed directly to the browser.
 * No PNG conversion, no image fallbacks - PDF only.
 */
import { eq, and } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { resumeDrafts } from "../../auth-schema";
import { submitPreviewJob } from "~/lib/control-plane";
import { convertSectionsToLegacyResume } from "~/lib/resume-draft";
import type { Route } from "./+types/api.v2.resumes.$id.preview";

// POST /api/v2/resumes/:id/preview - Generate PDF preview (streams PDF, not PNG)
export async function action({ params, request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

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

  const body = await request.json();
  const { templateId } = body;

  // Convert sections to legacy format for backend compatibility
  const legacyResume = convertSectionsToLegacyResume(draft.sections, templateId || draft.templateId);

  try {
    // Submit preview job (using existing preview job type for now)
    // Pass request headers and URL so server-side token fetching works with cookies
    const { res } = await submitPreviewJob({
      resume: legacyResume,
      template_id: templateId || draft.templateId || "modern",
    }, request.headers, request.url);

    return Response.json({
      job_id: res.job_id,
      status: res.status,
    });
  } catch (error: any) {
    console.error("[api.v2.resumes.preview] Error:", error);
    return Response.json(
      { error: error.message || "Failed to generate preview" },
      { status: 500 }
    );
  }
}

