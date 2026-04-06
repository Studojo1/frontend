import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.resumes.parse";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = await getSessionFromRequest(request);
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return new Response(
      JSON.stringify({ error: "No file provided" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
    return new Response(
      JSON.stringify({ error: "Only PDF files are supported" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return new Response(
      JSON.stringify({ error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const pdfText = await extractTextFromPDF(buffer);
    const resumeJson = await parseResumeWithOpenAI(pdfText, openaiApiKey);
    validateParsedResume(resumeJson);

    return new Response(
      JSON.stringify({ resumeData: resumeJson }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("PDF parsing error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to parse PDF" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = await import("pdf-parse");
    const data = await pdfParse.default(buffer);
    return data.text;
  } catch (error: any) {
    throw new Error(`PDF text extraction failed: ${error.message}`);
  }
}

async function parseResumeWithOpenAI(text: string, apiKey: string): Promise<any> {
  // Truncate to 5000 chars — enough for any single-page or two-page resume
  const truncatedText = text.length > 5000 ? text.substring(0, 5000) : text;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s hard limit

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Extract resume data and return ONLY valid JSON with this structure:
{"title":"","summary":"","contact_info":{"name":"","email":"","phone":"","location":"","linkedin":"","website":""},"work_experiences":[{"company":"","role":"","start_date":"","end_date":"","is_current":false,"description":""}],"educations":[{"institution":"","degree":"","field_of_study":"","start_date":"","end_date":"","is_current":false,"description":""}],"skills":[{"category":"","name":"","proficiency":""}],"projects":[{"title":"","url":"","start_date":"","end_date":"","description":""}],"certifications":[{"name":"","issuer":"","issue_date":"","expiry_date":"","url":""}]}
Rules: normalize dates to YYYY-MM, split skills into individual entries, combine bullet points with \\n, return ONLY JSON.`,
          },
          {
            role: "user",
            content: truncatedText,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 1500,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenAI");

    const parsed = JSON.parse(content);
    if (!parsed.contact_info && !parsed.title && !parsed.summary) {
      throw new Error("OpenAI returned invalid resume structure");
    }
    return parsed;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") throw new Error("Resume parsing timed out — please try again");
    throw error;
  }
}

function validateParsedResume(resumeData: any): void {
  const warnings: string[] = [];

  if (!resumeData.contact_info || !resumeData.contact_info.name) {
    warnings.push("Missing contact information or name");
  }
  if (!resumeData.work_experiences || resumeData.work_experiences.length === 0) {
    warnings.push("No work experience entries found");
  }
  if (!resumeData.educations || resumeData.educations.length === 0) {
    warnings.push("No education entries found");
  }
  if (resumeData.contact_info) {
    const c = resumeData.contact_info;
    if (!c.email && !c.phone && !c.linkedin && !c.website) {
      warnings.push("Contact info missing email, phone, LinkedIn, and website");
    }
  }
  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(`[resume-parse] ${w}`));
  }
}
