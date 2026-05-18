// JRS import — turns an uploaded resume PDF or LinkedIn screenshots into
// structured ResumeData. PDF text is extracted with pdf-parse; images are
// read by gpt-4o-mini vision. The model only extracts what is present.
import type { Route } from "./+types/api.resume-maker.import";
import type { ResumeData } from "~/lib/jrs/types";
import { uid } from "~/lib/jrs/types";
// @ts-ignore — pdf-parse has type defs via @types/pdf-parse
import pdfParse from "pdf-parse";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const MAX_FILES = 6;
const MAX_SIZE = 10 * 1024 * 1024; // 10MB per file

const SYSTEM = `You extract resume / CV / LinkedIn-profile content into a strict JSON object.

Rules:
- Use ONLY information present in the provided text and images. Never invent names, dates, employers, numbers or skills.
- If a field is not present, use an empty string, or an empty array.
- "bullets" is an array of concise one-line strings (achievements, responsibilities).
- "current" is true only if the role is clearly ongoing (e.g. "Present").
- Keep wording close to the source; light cleanup of casing/spacing is fine.
- Return ONLY the JSON object, no commentary.

Schema:
{
  "basics": { "name": "", "title": "", "email": "", "phone": "", "location": "", "website": "", "linkedin": "" },
  "summary": "",
  "experience": [ { "role": "", "company": "", "location": "", "start": "", "end": "", "current": false, "bullets": [] } ],
  "education": [ { "school": "", "degree": "", "field": "", "start": "", "end": "", "location": "", "details": "" } ],
  "projects": [ { "name": "", "link": "", "description": "", "bullets": [] } ],
  "skills": [ { "category": "", "items": "" } ]
}`;

function s(v: any): string {
  return typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim();
}
function sArr(v: any): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => s(x)).filter(Boolean);
}

/** Coerce loose model JSON into a valid ResumeData with fresh ids. */
function normalize(ai: any): ResumeData {
  const b = ai?.basics ?? {};
  const exp = Array.isArray(ai?.experience) ? ai.experience : [];
  const edu = Array.isArray(ai?.education) ? ai.education : [];
  const proj = Array.isArray(ai?.projects) ? ai.projects : [];
  const skl = Array.isArray(ai?.skills) ? ai.skills : [];
  return {
    basics: {
      name: s(b.name),
      title: s(b.title),
      email: s(b.email),
      phone: s(b.phone),
      location: s(b.location),
      website: s(b.website),
      linkedin: s(b.linkedin),
    },
    summary: s(ai?.summary),
    experience: exp.slice(0, 12).map((e: any) => ({
      id: uid(),
      role: s(e?.role),
      company: s(e?.company),
      location: s(e?.location),
      start: s(e?.start),
      end: s(e?.end),
      current: e?.current === true,
      bullets: sArr(e?.bullets).slice(0, 10),
    })),
    education: edu.slice(0, 8).map((e: any) => ({
      id: uid(),
      school: s(e?.school),
      degree: s(e?.degree),
      field: s(e?.field),
      start: s(e?.start),
      end: s(e?.end),
      location: s(e?.location),
      details: s(e?.details),
    })),
    projects: proj.slice(0, 10).map((p: any) => ({
      id: uid(),
      name: s(p?.name),
      link: s(p?.link),
      description: s(p?.description),
      bullets: sArr(p?.bullets).slice(0, 8),
    })),
    skills: skl.slice(0, 10).map((g: any) => ({
      id: uid(),
      category: s(g?.category),
      items: s(g?.items),
    })),
  };
}

function isEmpty(d: ResumeData): boolean {
  return (
    !d.basics.name &&
    !d.summary &&
    d.experience.length === 0 &&
    d.education.length === 0 &&
    d.projects.length === 0
  );
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  if (!OPENAI_API_KEY) {
    return Response.json(
      { error: "Import is unavailable right now. You can still fill the resume in by hand." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload" }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return Response.json({ error: "No files uploaded" }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return Response.json({ error: `Upload up to ${MAX_FILES} files` }, { status: 400 });
  }

  // Split into PDF text and images.
  let pdfText = "";
  const images: { url: string }[] = [];
  try {
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        return Response.json({ error: `${file.name} is over 10MB` }, { status: 400 });
      }
      const isPdf =
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isImg = file.type.startsWith("image/");
      const buf = Buffer.from(await file.arrayBuffer());
      if (isPdf) {
        const parsed = await pdfParse(buf);
        pdfText += "\n" + (parsed.text || "");
      } else if (isImg) {
        const mime = file.type || "image/png";
        images.push({ url: `data:${mime};base64,${buf.toString("base64")}` });
      } else {
        return Response.json(
          { error: `${file.name} is not a PDF or image` },
          { status: 400 },
        );
      }
    }
  } catch {
    return Response.json(
      { error: "Could not read those files. Try a different export." },
      { status: 422 },
    );
  }

  if (!pdfText.trim() && images.length === 0) {
    return Response.json({ error: "Nothing readable in those files" }, { status: 422 });
  }

  // Build the user message: text part + any images.
  const content: any[] = [
    {
      type: "text",
      text: pdfText.trim()
        ? `Extract this resume into the JSON schema:\n\n${pdfText.slice(0, 14000)}`
        : "Extract the resume / LinkedIn profile shown in the image(s) into the JSON schema.",
    },
    ...images.map((img) => ({ type: "image_url", image_url: { url: img.url } })),
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.1,
        max_tokens: 2400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content },
        ],
      }),
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error(`[jrs-import] OpenAI error ${res.status}: ${errBody}`);
      return Response.json(
        { error: "Couldn't parse that resume. Try a clearer file or fill it in by hand." },
        { status: 502 },
      );
    }

    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return Response.json({ error: "Couldn't read that resume" }, { status: 502 });
    }
    const data = normalize(JSON.parse(raw));
    if (isEmpty(data)) {
      return Response.json(
        { error: "Couldn't find resume content in that file. Try a clearer export." },
        { status: 422 },
      );
    }
    return Response.json({ data });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return Response.json({ error: "Import timed out. Try a smaller file." }, { status: 504 });
    }
    console.error("[jrs-import] error:", err?.message);
    return Response.json({ error: "Import failed. Try again in a moment." }, { status: 500 });
  }
}
