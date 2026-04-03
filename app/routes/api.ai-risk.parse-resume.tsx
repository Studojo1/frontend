/**
 * POST /api/ai-risk/parse-resume
 *
 * Public (no auth required) — extracts job title from an uploaded resume PDF.
 * Used by the AI Risk page so unauthenticated users can upload their resume.
 *
 * Flow:
 *  1. pdf-parse extracts raw text from the PDF
 *  2. Regex heuristics attempt a fast job title extraction
 *  3. If heuristics fail, Ollama confirms / extracts from the text
 */

import type { Route } from "./+types/api.ai-risk.parse-resume";
// @ts-ignore — pdf-parse has type defs via @types/pdf-parse
import pdfParse from "pdf-parse";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama.staging.svc.cluster.local:11434";

// Common resume section headers to stop scanning at
const SECTION_STOPS = /^(education|skills|experience|projects|certifications|awards|languages|interests|references|summary|objective|profile|work history)/i;

// Patterns that look like job titles
const TITLE_PATTERNS = [
  // "Job Title: X" or "Title: X" or "Position: X" or "Role: X"
  /(?:job\s*title|current\s*role|position|role|title)\s*[:\-]\s*(.+)/i,
  // LinkedIn-style: bold name on first line, title on second
  /^[\w\s,]+\n(.+?)\n/m,
];

function extractTitleHeuristic(text: string): string | null {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Try explicit label patterns first
  for (const pattern of TITLE_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const candidate = match[1].trim().replace(/[|•·]/g, "").trim();
      if (candidate.length > 2 && candidate.length < 80) return candidate;
    }
  }

  // Heuristic: scan first 20 lines for a plausible title
  // Skip name lines (usually ALL CAPS or very short) and section headers
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i];
    if (SECTION_STOPS.test(line)) break;
    // Skip email / phone / URL lines
    if (/[@\d+\-\(\)]{4,}|http|linkedin|github/.test(line)) continue;
    // Skip lines that look like names (< 4 words, no lowercase letters between words)
    if (line.split(/\s+/).length <= 2 && !/[a-z]/.test(line.slice(1))) continue;
    // If it's 2-6 words and title-case / mixed-case, likely a job title
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 7 && line.length < 70) {
      return line;
    }
  }

  return null;
}

async function extractTitleWithLLM(text: string): Promise<string | null> {
  // Truncate to first 1500 chars (enough context, small model friendly)
  const snippet = text.slice(0, 1500).replace(/\s+/g, " ").trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "llama3.2:1b",
        messages: [
          {
            role: "system",
            content:
              "You extract the current job title from resume text. Reply with ONLY the job title, nothing else. No punctuation, no quotes, no explanation.",
          },
          {
            role: "user",
            content: `Resume text:\n${snippet}\n\nWhat is this person's current or most recent job title?`,
          },
        ],
        stream: false,
        options: { temperature: 0.1, num_predict: 20 },
      }),
    });

    clearTimeout(timeoutId);
    if (!res.ok) return null;

    const data = await res.json();
    const raw: string = (data?.message?.content || data?.response || "").trim();
    // Sanity check: must be reasonable length
    if (raw && raw.length > 2 && raw.length < 100) return raw;
    return null;
  } catch {
    return null;
  }
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: "File too large. Max 10MB." }, { status: 400 });
  }

  // Accept PDF and Word docs — for non-PDF, we can only do basic text
  const isPDF =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  try {
    let text = "";

    if (isPDF) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await pdfParse(buffer);
      text = parsed.text || "";
    } else {
      // For .doc/.docx, read as text (limited but avoids extra deps)
      text = await file.text();
    }

    if (!text.trim()) {
      return Response.json(
        { error: "Could not read text from this file. Try a different PDF or enter your title manually." },
        { status: 422 }
      );
    }

    // Try fast heuristic first
    let jobTitle = extractTitleHeuristic(text);

    // Fallback to LLM if heuristic fails
    if (!jobTitle) {
      jobTitle = await extractTitleWithLLM(text);
    }

    if (!jobTitle) {
      return Response.json(
        { error: "Could not find a job title in your resume. Please enter it manually." },
        { status: 422 }
      );
    }

    return Response.json({ job_title: jobTitle.trim() });
  } catch (err: any) {
    console.error("[ai-risk/parse-resume]", err?.message);
    return Response.json(
      { error: "Failed to read the file. Please try a different PDF or enter your title manually." },
      { status: 500 }
    );
  }
}
