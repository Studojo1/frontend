import type { Route } from "./+types/api.resumes.templates";
import { loadAllTemplates } from "~/lib/template-loader.server";

// GET /api/resumes/templates - Get templates from blob storage (with database fallback)
export async function loader({ request }: Route.LoaderArgs) {
  try {
    // Load templates from blob storage first, fallback to database
    const templates = await loadAllTemplates();

    const useLocalStack = process.env.USE_LOCALSTACK === "true";
    const localStackEndpoint = process.env.LOCALSTACK_ENDPOINT || "http://localstack:4566";
    const externalEndpoint = useLocalStack && localStackEndpoint.includes("localstack:")
      ? localStackEndpoint.replace("localstack:", "localhost:")
      : localStackEndpoint;

    // Transform to unified API format with consistent field names
    const formattedTemplates = templates.map((t) => ({
      id: t.id,
      version: t.version,
      name: t.name,
      description: t.description,
      category: t.category,
      // Prefer explicit previewUrl from metadata; otherwise, in LocalStack dev,
      // synthesize a URL that matches where the preview generator uploads:
      //   bucket: resumes
      //   key:    templates/{id}/preview.png
      previewUrl:
        t.previewUrl ||
        (useLocalStack
          ? `${externalEndpoint}/resumes/templates/${t.id}/preview.png`
          : t.assets.previewImage),
      assets: {
        latexFile: t.assets.latexFile,
        previewImage:
          t.assets.previewImage ||
          (useLocalStack
            ? `${externalEndpoint}/resumes/templates/${t.id}/preview.png`
            : undefined),
      },
    }));

    return Response.json(formattedTemplates);
  } catch (error: any) {
    console.error("[api.resumes.templates] Error loading templates:", error);
    return Response.json(
      { error: error.message || "Failed to load templates" },
      { status: 500 }
    );
  }
}

