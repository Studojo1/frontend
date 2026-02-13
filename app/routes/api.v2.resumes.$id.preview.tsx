/**
 * PDF Preview API - Live PDF Streaming for Editing/Review
 * 
 * This endpoint calls resume-service directly to generate a PDF preview.
 * Returns the PDF as a blob URL that can be displayed inline.
 * Works like docker-compose - direct call, no job queue.
 */
import { eq, and } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { resumeDrafts } from "../../auth-schema";
import { convertSectionsToLegacyResume } from "~/lib/resume-draft";
import type { Route } from "./+types/api.v2.resumes.$id.preview";

// POST /api/v2/resumes/:id/preview - Generate PDF preview (streams PDF directly)
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
  
  // Validate that resume has content
  const hasContent = 
    legacyResume.title ||
    legacyResume.summary ||
    (legacyResume.contact_info && (legacyResume.contact_info.name || legacyResume.contact_info.email)) ||
    (legacyResume.work_experiences && legacyResume.work_experiences.length > 0) ||
    (legacyResume.educations && legacyResume.educations.length > 0) ||
    (legacyResume.skills && legacyResume.skills.length > 0) ||
    (legacyResume.projects && legacyResume.projects.length > 0) ||
    (legacyResume.certifications && legacyResume.certifications.length > 0);
  
  if (!hasContent) {
    console.error("[api.v2.resumes.preview] Resume has no content");
    return Response.json(
      { error: "Resume is empty. Please add at least a name, email, or some content before generating a preview." },
      { status: 400 }
    );
  }

  // Get resume-service URL (works in both docker-compose and k8s)
  const resumeServiceUrl = process.env.RESUME_SERVICE_URL || "http://resume-service:8086";
  
  try {
    // Call resume-service directly (like docker-compose)
    const previewResponse = await fetch(`${resumeServiceUrl}/preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume: legacyResume,
        template_id: templateId || draft.templateId || "modern",
      }),
    });

    if (!previewResponse.ok) {
      const errorText = await previewResponse.text().catch(() => "Unknown error");
      console.error("[api.v2.resumes.preview] Resume service error:", previewResponse.status, errorText);
      return Response.json(
        { error: `Resume service returned ${previewResponse.status}: ${errorText}` },
        { status: previewResponse.status }
      );
    }

    // Get PDF blob
    const pdfBlob = await previewResponse.blob();
    
    // Return PDF as blob with proper headers
    return new Response(pdfBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="resume-preview.pdf"',
      },
    });
  } catch (error: any) {
    console.error("[api.v2.resumes.preview] Error calling resume-service:", error);
    return Response.json(
      { error: error.message || "Failed to generate preview" },
      { status: 500 }
    );
  }
}

