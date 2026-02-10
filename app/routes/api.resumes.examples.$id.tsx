import type { Route } from "./+types/api.resumes.examples.$id";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { resumeExamples } from "../../auth-schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/resumes/examples/:id - Get specific example resume
 */
export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [example] = await db
      .select()
      .from(resumeExamples)
      .where(and(eq(resumeExamples.id, params.id), eq(resumeExamples.isActive, true)))
      .limit(1);

    if (!example) {
      return Response.json(
        { error: "Example not found" },
        { status: 404 }
      );
    }

    return Response.json({
      example: {
        id: example.id,
        jobType: example.jobType,
        jobTypeLabel: example.jobTypeLabel,
        templateId: example.templateId,
        name: example.name,
        description: example.description,
        resumeData: example.resumeData,
        previewUrl: example.previewUrl,
        createdAt: example.createdAt,
        updatedAt: example.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("[api.resumes.examples.$id] Error:", error);
    return Response.json(
      { error: error.message || "Failed to load example" },
      { status: 500 }
    );
  }
}

