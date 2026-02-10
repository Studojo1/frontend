import type { Route } from "./+types/api.resumes.examples.$id.use";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { resumeExamples, resumeDrafts } from "../../auth-schema";
import { eq, and } from "drizzle-orm";
import { loadAllTemplates } from "~/lib/template-loader.server";

/**
 * POST /api/resumes/examples/:id/use - Create draft from example resume
 */
export async function action({ params, request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the example
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

    // Generate resume name from example
    const resumeName = `${example.jobTypeLabel} Resume - ${example.name}`;

    // Choose a template ID:
    // - Prefer a random active template from blob/db
    // - Fallback to the example's templateId
    // - Final fallback to "modern"
    let chosenTemplateId = example.templateId || "modern";
    try {
      const templates = await loadAllTemplates();
      if (templates && templates.length > 0) {
        const index = Math.floor(Math.random() * templates.length);
        const randomTemplate = templates[index];
        if (randomTemplate?.id) {
          chosenTemplateId = randomTemplate.id;
        }
      }
    } catch (error) {
      console.error("[api.resumes.examples.$id.use] Failed to load templates for random selection:", error);
    }

    // Create draft from example
    const [draft] = await db
      .insert(resumeDrafts)
      .values({
        userId: session.user.id,
        name: resumeName,
        templateId: chosenTemplateId,
        sections: example.resumeData as any,
        version: 1,
      })
      .returning();

    return Response.json({
      success: true,
      draft: {
        id: draft.id,
        name: draft.name,
        templateId: draft.templateId,
        sections: draft.sections,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("[api.resumes.examples.$id.use] Error:", error);
    return Response.json(
      { error: error.message || "Failed to create draft from example" },
      { status: 500 }
    );
  }
}


