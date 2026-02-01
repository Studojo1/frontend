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

  try {
    // Convert file to base64 for OpenAI vision API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Use OpenAI Vision API to extract text from PDF
    // Note: OpenAI Vision API works with images, so we'll need to convert PDF pages to images
    // For now, let's use a simpler approach: extract text using a library or use OpenAI's text extraction
    
    // Alternative: Use OpenAI's chat completion with file upload
    // For PDFs, we can use the Assistants API or convert PDF to text first
    
    // Using OpenAI's chat completion with vision (for images) or text extraction
    // Since we have the PDF, let's use a text extraction approach
    
    // For now, let's use OpenAI to parse the PDF content
    // We'll need to extract text from PDF first, then send to OpenAI
    
    // Using OpenAI API to parse resume from PDF
    // Convert PDF to text (we'll use a simple approach - in production, use pdf-parse or similar)
    const pdfText = await extractTextFromPDF(buffer);
    
    // Use OpenAI to structure the resume data
    const resumeJson = await parseResumeWithOpenAI(pdfText, openaiApiKey);

    // Generate professional summary if missing
    if (!resumeJson.summary || resumeJson.summary.trim() === "") {
      try {
        const summary = await generateProfessionalSummary(resumeJson, openaiApiKey);
        resumeJson.summary = summary;
      } catch (error) {
        // Log error but don't fail the import if summary generation fails
        console.error("Failed to generate professional summary:", error);
      }
    }

    return new Response(
      JSON.stringify({ resumeData: resumeJson }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("PDF parsing error:", error);
    const errorMessage = error.message || "Failed to parse PDF";
    
    // Log more details for debugging
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Import pdf-parse dynamically
    const pdfParse = await import("pdf-parse");
    const data = await pdfParse.default(buffer);
    return data.text;
  } catch (error: any) {
    throw new Error(`PDF text extraction failed: ${error.message}`);
  }
}

async function parseResumeWithOpenAI(text: string, apiKey: string): Promise<any> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a resume parser. Extract structured resume data from the provided text and return it as JSON matching this schema:
{
  "title": "string",
  "summary": "string",
  "contact_info": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "website": "string"
  },
  "work_experiences": [{
    "company": "string",
    "role": "string",
    "start_date": "string",
    "end_date": "string",
    "is_current": boolean,
    "description": "string"
  }],
  "educations": [{
    "institution": "string",
    "degree": "string",
    "field_of_study": "string",
    "start_date": "string",
    "end_date": "string",
    "is_current": boolean,
    "description": "string"
  }],
  "skills": [{
    "category": "string",
    "name": "string",
    "proficiency": "string"
  }],
  "projects": [{
    "title": "string",
    "url": "string",
    "start_date": "string",
    "end_date": "string",
    "description": "string"
  }],
  "certifications": [{
    "name": "string",
    "issuer": "string",
    "issue_date": "string",
    "expiry_date": "string",
    "url": "string"
  }]
}

Return ONLY valid JSON, no markdown, no code blocks.`,
        },
        {
          role: "user",
          content: `Parse this resume text into the JSON schema:\n\n${text}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    let errorMessage = "OpenAI API error";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorData.error || errorMessage;
    } catch {
      const errorText = await response.text();
      errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(`OpenAI API error: ${errorMessage}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content in OpenAI response. The model may have failed to generate a response.");
  }

  try {
    const parsed = JSON.parse(content);
    // Validate that we got a resume-like structure
    if (!parsed.contact_info && !parsed.title && !parsed.summary) {
      throw new Error("OpenAI returned invalid resume structure");
    }
    return parsed;
  } catch (error: any) {
    if (error.message.includes("invalid resume structure")) {
      throw error;
    }
    throw new Error(`Failed to parse OpenAI response as JSON: ${error.message}`);
  }
}

async function generateProfessionalSummary(resumeData: any, apiKey: string): Promise<string> {
  // Build context from resume data
  const workExps = resumeData.work_experiences || [];
  const educations = resumeData.educations || [];
  const skills = resumeData.skills || [];
  const projects = resumeData.projects || [];

  let context = "Based on the following resume information, write a professional 2-3 sentence summary:\n\n";

  if (workExps.length > 0) {
    context += "Work Experience:\n";
    workExps.slice(0, 3).forEach((exp: any) => {
      context += `- ${exp.role || "Position"} at ${exp.company || "Company"}`;
      if (exp.description) {
        context += `: ${exp.description.substring(0, 200)}`;
      }
      context += "\n";
    });
  }

  if (educations.length > 0) {
    context += "\nEducation:\n";
    educations.slice(0, 2).forEach((edu: any) => {
      context += `- ${edu.degree || ""} ${edu.field_of_study ? `in ${edu.field_of_study}` : ""} from ${edu.institution || ""}\n`;
    });
  }

  if (skills.length > 0) {
    context += "\nKey Skills:\n";
    const skillNames = skills.slice(0, 10).map((s: any) => s.name || s.category).filter(Boolean);
    context += skillNames.join(", ") + "\n";
  }

  if (projects.length > 0) {
    context += "\nNotable Projects:\n";
    projects.slice(0, 2).forEach((proj: any) => {
      context += `- ${proj.title || "Project"}`;
      if (proj.description) {
        context += `: ${proj.description.substring(0, 150)}`;
      }
      context += "\n";
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer. Write concise, impactful professional summaries (2-3 sentences) that highlight key qualifications, experience, and value proposition. Focus on achievements and expertise.",
        },
        {
          role: "user",
          content: context + "\n\nWrite a professional summary:",
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    let errorMessage = "OpenAI API error";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorData.error || errorMessage;
    } catch {
      const errorText = await response.text();
      errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(`OpenAI API error: ${errorMessage}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content in OpenAI response for summary generation");
  }

  return content.trim();
}
