// @ts-ignore: pdf-parse has type defs via @types/pdf-parse
import pdfParse from "pdf-parse";
import { guardPublicForm } from "~/lib/ratelimit.server";
import { quickParseResume, filledCount } from "~/lib/resume-quick-parse";
import type { Route } from "./+types/api.start.parse";

/**
 * POST /api/start/parse (multipart, field "file"): the instant resume read
 * behind /start. Public, because it runs before the account exists, so it is
 * rate-limited per IP, reads the file in memory and stores nothing. The
 * student confirms what it found after signing in, and only then is it saved.
 */

const MAX_SIZE = 5 * 1024 * 1024;

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const blocked = await guardPublicForm(request, null);
  if (blocked) return blocked;

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get("file");
    file = f instanceof File ? f : null;
  } catch {
    return Response.json({ error: "That upload didn't come through. Try again." }, { status: 400 });
  }
  if (!file) return Response.json({ error: "Choose your resume file." }, { status: 400 });
  if (file.size > MAX_SIZE) return Response.json({ error: "That file is over 5 MB. Export a smaller PDF." }, { status: 400 });

  const name = file.name.toLowerCase();
  let text = "";
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    if (file.type === "application/pdf" || name.endsWith(".pdf")) {
      text = (await pdfParse(buf)).text ?? "";
    } else if (file.type.startsWith("text/") || name.endsWith(".txt")) {
      text = buf.toString("utf8");
    } else {
      return Response.json({ error: "Use a PDF of your resume." }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "We couldn't read that PDF. Try exporting it again." }, { status: 422 });
  }
  if (text.trim().length < 40) {
    return Response.json(
      { error: "That PDF has no readable text. It may be a scan; export it from Word or Google Docs instead." },
      { status: 422 },
    );
  }

  const resume = quickParseResume(text.slice(0, 40000));
  return Response.json({ resume, ...filledCount(resume) });
}
