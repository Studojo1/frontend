// POST /api/tickets/upload — upload a screenshot for a (not-yet-created)
// ticket. Returns the public URL the client then attaches to the
// /api/tickets POST payload. Decoupling the upload from creation makes
// the modal flow simple: pick file → upload → preview → submit.
import type { Route } from "./+types/api.tickets.upload";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { uploadTicketScreenshot } from "~/lib/blob-storage.server";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/heic",
]);

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: "Only image files are allowed (PNG, JPEG, GIF, WebP, HEIC)" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: "File too large (8 MB max)" },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadTicketScreenshot(
      session.user.id,
      buffer,
      file.type,
      file.name,
    );
    return Response.json({
      url,
      content_type: file.type,
      filename: file.name,
      size: file.size,
    });
  } catch (e: any) {
    console.error("[tickets] screenshot upload failed:", e?.message);
    return Response.json(
      { error: "Upload failed. Try again in a moment." },
      { status: 500 },
    );
  }
}
