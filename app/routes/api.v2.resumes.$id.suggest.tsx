import { eq, and } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { resumeDrafts } from "../../auth-schema";
import { convertSectionsToLegacyResume } from "~/lib/resume-draft";
import type { Route } from "./+types/api.v2.resumes.$id.suggest";

// POST /api/v2/resumes/:id/suggest - Get inline suggestions for draft
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
  const { job_title, job_description, section_id, section_type, section_content } = body;

  // Convert sections to legacy format for backend compatibility
  const legacyResume = convertSectionsToLegacyResume(draft.sections, draft.templateId);

  // Call resume service suggest endpoint
  const resumeServiceUrl = process.env.RESUME_SERVICE_URL || "http://resume-service:8086";
  
  try {
    const response = await fetch(`${resumeServiceUrl}/suggest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume: legacyResume,
        job_title: job_title || "",
        job_description: job_description || "",
      }),
    });

    if (!response.ok) {
      throw new Error(`Resume service returned ${response.status}`);
    }

    const data = await response.json();
    
    // Filter suggestions for the specific section if provided
    if (section_id && data.suggestions) {
      data.suggestions = data.suggestions.map((s: any) => ({
        ...s,
        id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        field: section_id,
      }));
    }

    return Response.json(data);
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Failed to get suggestions" },
      { status: 500 }
    );
  }
}

