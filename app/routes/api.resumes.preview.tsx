import { getSessionFromRequest } from "~/lib/onboarding.server";
import { submitPreviewJob } from "~/lib/control-plane";
import db from "~/lib/db";
import { eq, and } from "drizzle-orm";
import { resumes } from "../../auth-schema";
import type { Route } from "./+types/api.resumes.preview";

// POST /api/resumes/:id/preview - Trigger preview generation
export async function action({ params, request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { templateId } = body;

  // Get resume data directly from database
  const [resume] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, params.id), eq(resumes.userId, session.user.id)))
    .limit(1);

  if (!resume) {
    return Response.json({ error: "Resume not found" }, { status: 404 });
  }

  // Submit preview job
  try {
    const { res } = await submitPreviewJob({
      resume: resume.resumeData,
      template_id: templateId || resume.templateId || "modern",
    });

    return Response.json({ job_id: res.job_id, status: res.status });
  } catch (error: any) {
    console.error("[api.resumes.preview] Error:", error);
    return Response.json(
      { error: error.message || "Failed to generate preview" },
      { status: 500 }
    );
  }
}

