/**
 * PDF Preview Proxy - Streams PDFs with correct headers for inline display
 * 
 * This endpoint proxies PDF requests from blob storage and ensures they're
 * served with Content-Disposition: inline so they display in iframes instead
 * of downloading.
 */
import type { Route } from "./+types/api.v2.resumes.preview-proxy";

// GET /api/v2/resumes/preview-proxy?url=<encoded-pdf-url>
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const pdfUrl = url.searchParams.get("url");

  if (!pdfUrl) {
    return Response.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    // Decode the URL
    let decodedUrl = decodeURIComponent(pdfUrl);

    // Rewrite localhost:4566 to localstack:4566 for server-side access in Docker
    // The URL from blob storage uses localhost for browser access, but server-side needs service name
    if (decodedUrl.includes("localhost:4566")) {
      decodedUrl = decodedUrl.replace("localhost:4566", "localstack:4566");
    }

    // Fetch the PDF from blob storage
    const pdfResponse = await fetch(decodedUrl);

    if (!pdfResponse.ok) {
      return Response.json(
        { error: "Failed to fetch PDF" },
        { status: pdfResponse.status }
      );
    }

    // Get the PDF data
    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Stream the PDF with correct headers for inline display
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="resume-preview.pdf"',
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("[preview-proxy] Error:", error);
    return Response.json(
      { error: error.message || "Failed to proxy PDF" },
      { status: 500 }
    );
  }
}

