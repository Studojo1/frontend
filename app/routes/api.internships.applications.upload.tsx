import { getSessionFromRequest } from "~/lib/onboarding.server";
import { uploadApplicationResume } from "~/lib/blob-storage.server";
import type { Route } from "./+types/api.internships.applications.upload";

// POST /api/internships/applications/upload
//
// Uploads the candidate's resume PDF to blob storage and returns a reference
// that the apply endpoint will persist on the new internship_applications row.
// This is a tiny purpose-built helper for the application flow — it does not
// parse, render, or otherwise touch the file. The companion /api/resumes/parse
// endpoint still exists for the resume builder and the autoapply tool.
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
    return Response.json({ error: "Only PDF files are supported" }, { status: 400 });
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return Response.json(
      { error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` },
      { status: 400 },
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = file.type || "application/pdf";
    const uploaded = await uploadApplicationResume(
      session.user.id,
      buffer,
      contentType,
      file.name,
    );

    return Response.json({
      url: uploaded.url,
      contentType,
      name: file.name,
    });
  } catch (error: any) {
    console.error("[applications/upload] error:", error?.message || error);
    return Response.json(
      { error: "Failed to store resume. Please try again." },
      { status: 500 },
    );
  }
}
