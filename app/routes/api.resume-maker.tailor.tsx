// JRS tailor — rewrites a resume to target a specific job description.
// Mirrors the JD's language and priorities WITHOUT inventing facts.
// gpt-4o-mini. Structure (contact, dates, ids, entry counts) is preserved
// server-side; the model only rephrases and reprioritises real content.
import type { Route } from "./+types/api.resume-maker.tailor";
import type { ResumeData } from "~/lib/jrs/types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM = `You tailor a resume to a specific job description.

Rules:
- Rewrite the summary and every experience/project bullet so they mirror the language, keywords and priorities of the job description.
- NEVER invent achievements, skills, employers, titles, dates or numbers. Only rephrase real content the resume already contains.
- Within each skills group you MAY reorder the comma-separated items to put the most job-relevant first, but do not add skills that are not there.
- Keep the SAME number of experience, education, project and skills entries.
- Keep each entry's "id" value exactly as given.
- Every bullet opens with a strong past-tense action verb, one line.
- Return ONLY a JSON object in the same schema as the input resume. No commentary.`;

async function callOpenAI(data: ResumeData, jd: string): Promise<any | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 2400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `JOB DESCRIPTION:\n${jd}\n\nRESUME JSON:\n${JSON.stringify(data)}`,
          },
        ],
      }),
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const j = await res.json();
    const raw = j?.choices?.[0]?.message?.content?.trim();
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function str(v: any, fallback: string): string {
  return typeof v === "string" && v.trim() ? v : fallback;
}
function strArr(v: any, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback;
  const cleaned = v.map((x) => String(x ?? "")).filter((x) => x.trim());
  return cleaned.length ? cleaned : fallback;
}

/** Apply AI edits but keep structure: contact, dates, ids, counts stay original. */
function merge(input: ResumeData, ai: any): ResumeData {
  if (!ai || typeof ai !== "object") return input;
  const b = ai.basics ?? {};
  return {
    basics: {
      name: str(b.name, input.basics.name),
      title: str(b.title, input.basics.title),
      email: input.basics.email,
      phone: input.basics.phone,
      location: str(b.location, input.basics.location),
      website: input.basics.website,
      linkedin: input.basics.linkedin,
    },
    summary: str(ai.summary, input.summary),
    experience: input.experience.map((e, i) => {
      const a = Array.isArray(ai.experience) ? ai.experience[i] : null;
      if (!a) return e;
      return {
        ...e,
        role: str(a.role, e.role),
        company: str(a.company, e.company),
        location: str(a.location, e.location),
        bullets: strArr(a.bullets, e.bullets),
      };
    }),
    education: input.education.map((e, i) => {
      const a = Array.isArray(ai.education) ? ai.education[i] : null;
      return a ? { ...e, details: str(a.details, e.details) } : e;
    }),
    projects: input.projects.map((p, i) => {
      const a = Array.isArray(ai.projects) ? ai.projects[i] : null;
      if (!a) return p;
      return {
        ...p,
        name: str(a.name, p.name),
        description: str(a.description, p.description),
        bullets: strArr(a.bullets, p.bullets),
      };
    }),
    skills: input.skills.map((s, i) => {
      const a = Array.isArray(ai.skills) ? ai.skills[i] : null;
      return a ? { ...s, items: str(a.items, s.items) } : s;
    }),
  };
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body?.data as ResumeData | undefined;
  const jd = typeof body?.jobDescription === "string" ? body.jobDescription.trim() : "";
  if (!data || !data.basics || !Array.isArray(data.experience)) {
    return Response.json({ error: "Invalid resume data" }, { status: 400 });
  }
  if (jd.length < 20) {
    return Response.json({ error: "Paste a job description to tailor against" }, { status: 400 });
  }

  const ai = await callOpenAI(data, jd.slice(0, 6000));
  if (!ai) {
    return Response.json(
      { error: "Tailoring is unavailable right now. Try again in a moment." },
      { status: 503 },
    );
  }
  return Response.json({ data: merge(data, ai) });
}
