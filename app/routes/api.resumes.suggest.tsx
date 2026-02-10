import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { eq, and } from "drizzle-orm";
import { resumes } from "../../auth-schema";
import type { Route } from "./+types/api.resumes.suggest";

// POST /api/resumes/:id/suggest - Get suggestions
export async function action({ params, request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { job_title, job_description } = body;

  // Verify ownership and get resume
  const [resume] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, params.id), eq(resumes.userId, session.user.id)))
    .limit(1);

  if (!resume) {
    return Response.json({ error: "Resume not found" }, { status: 404 });
  }

  // Call resume service suggest endpoint
  const resumeServiceUrl = process.env.RESUME_SERVICE_URL || "http://resume-service:8086";
  
  try {
    const response = await fetch(`${resumeServiceUrl}/suggest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume: resume.resumeData,
        job_title: job_title || "",
        job_description: job_description || "",
      }),
    });

    if (!response.ok) {
      throw new Error(`Resume service returned ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Failed to get suggestions" },
      { status: 500 }
    );
  }
}

