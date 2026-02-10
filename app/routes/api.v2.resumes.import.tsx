import { getSessionFromRequest } from "~/lib/onboarding.server";
import { convertLegacyResumeToSections } from "~/lib/resume-draft";
import type { Route } from "./+types/api.v2.resumes.import";

// POST /api/v2/resumes/import - Import resume from parsed PDF
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { resumeData, name, templateId } = body;

    if (!resumeData) {
      return Response.json(
        { error: "resumeData is required" },
        { status: 400 }
      );
    }

    // Convert legacy resume format to sections
    const sections = convertLegacyResumeToSections(resumeData);

    // Return sections so frontend can create the draft
    return Response.json({
      sections,
      templateId: templateId || resumeData.template_id || "modern",
      suggestedName: name || resumeData.contact_info?.name || "Imported Resume",
    });
  } catch (error: any) {
    console.error("[api.v2.resumes.import] Error:", error);
    return Response.json(
      { error: error.message || "Failed to import resume" },
      { status: 500 }
    );
  }
}

