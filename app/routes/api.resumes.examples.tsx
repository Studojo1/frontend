import type { Route } from "./+types/api.resumes.examples";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { resumeExamples } from "../../auth-schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/resumes/examples - List example resumes
 * Query params: jobType?, templateId?
 */
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const jobType = url.searchParams.get("jobType");
  const templateId = url.searchParams.get("templateId");

  try {
    const conditions = [eq(resumeExamples.isActive, true)];

    if (jobType) {
      conditions.push(eq(resumeExamples.jobType, jobType));
    }

    if (templateId) {
      conditions.push(eq(resumeExamples.templateId, templateId));
    }

    const examples = await db
      .select()
      .from(resumeExamples)
      .where(and(...conditions))
      .orderBy(resumeExamples.jobTypeLabel, resumeExamples.name);

    const useLocalStack = process.env.USE_LOCALSTACK === "true";
    const localStackEndpoint = process.env.LOCALSTACK_ENDPOINT || "http://localstack:4566";
    const externalEndpoint = useLocalStack && localStackEndpoint.includes("localstack:")
      ? localStackEndpoint.replace("localstack:", "localhost:")
      : localStackEndpoint;

    return Response.json({
      examples: examples.map((ex) => ({
        id: ex.id,
        jobType: ex.jobType,
        jobTypeLabel: ex.jobTypeLabel,
        templateId: ex.templateId,
        name: ex.name,
        description: ex.description,
        resumeData: ex.resumeData,
        // In local dev with LocalStack, preview generation stores PNGs in:
        //   bucket: resumes
        //   key:    resumes/example-previews/{exampleId}.png
        // Even if the DB previewUrl is empty (due to Azure SDK/LocalStack quirks),
        // we can synthesize the public URL directly.
        previewUrl:
          ex.previewUrl ||
          (useLocalStack
            // In LocalStack, blobs are stored under key: "example-previews/{id}.png"
            // and the container is "resumes", so the path-style URL is:
            //   {endpoint}/resumes/example-previews/{id}.png
            ? `${externalEndpoint}/resumes/example-previews/${ex.id}.png`
            : undefined),
        createdAt: ex.createdAt,
        updatedAt: ex.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("[api.resumes.examples] Error:", error);
    return Response.json(
      { error: error.message || "Failed to load examples" },
      { status: 500 }
    );
  }
}


