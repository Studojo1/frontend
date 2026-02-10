import type { Route } from "./+types/api.resumes.templates.$id.preview";

/**
 * GET /api/resumes/templates/:id/preview
 * 
 * Legacy endpoint - redirects to static preview image endpoint.
 * All template previews are now static images served from blob storage.
 * No on-demand generation, no PDF→PNG conversion.
 */
export async function loader({ params }: Route.LoaderArgs) {
  const templateId = String(params.id || "").trim();
  if (!templateId || templateId === "undefined" || templateId === "null") {
    return new Response(
      JSON.stringify({ error: "Template ID is required" }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Redirect to static preview image endpoint
  return Response.redirect(`/api/resumes/templates/${templateId}/preview-image`, 302);
}

