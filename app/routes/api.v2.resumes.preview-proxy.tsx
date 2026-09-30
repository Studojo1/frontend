/**
 * PDF Preview Proxy: streams a resume PDF from our blob storage with
 * Content-Disposition: inline so it displays in an iframe instead of
 * downloading. Signed-in users only, and only from our blob host
 * (audit AS-N03; see app/lib/preview-proxy.server.ts).
 */
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { handlePreviewProxy } from "~/lib/preview-proxy.server";
import type { Route } from "./+types/api.v2.resumes.preview-proxy";

// GET /api/v2/resumes/preview-proxy?url=<encoded-pdf-url>
export async function loader({ request }: Route.LoaderArgs) {
  return handlePreviewProxy(request, { getSession: getSessionFromRequest });
}
