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

  // Validate file size (max 10MB to prevent memory issues)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return new Response(
      JSON.stringify({ error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    console.log(`[resume-parse] Starting PDF parse for file: ${file.name}, size: ${file.size} bytes`);
    
    // Convert file to base64 for OpenAI vision API
    console.log("[resume-parse] Converting file to buffer...");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`[resume-parse] Buffer created, size: ${buffer.length} bytes`);

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error("[resume-parse] OpenAI API key not configured");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract text from PDF
    console.log("[resume-parse] Extracting text from PDF...");
    const pdfText = await extractTextFromPDF(buffer);
    console.log(`[resume-parse] PDF text extracted, length: ${pdfText.length} characters`);
    
    // Log PDF text preview for debugging
    const textPreview = pdfText.substring(0, 500);
    console.log(`[resume-parse] PDF text preview (first 500 chars):\n${textPreview}...`);
    
    // Use OpenAI to structure the resume data
    console.log("[resume-parse] Parsing resume with OpenAI...");
    const resumeJson = await parseResumeWithOpenAI(pdfText, openaiApiKey);
    console.log("[resume-parse] Resume parsed successfully");
    
    // Validate parsed data completeness
    validateParsedResume(resumeJson);

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
    console.log("[resume-parse] Importing pdf-parse library...");
    // Import pdf-parse dynamically
    const pdfParse = await import("pdf-parse");
    console.log("[resume-parse] Parsing PDF buffer...");
    const data = await pdfParse.default(buffer);
    console.log(`[resume-parse] PDF parsed, pages: ${data.numpages}, text length: ${data.text.length}`);
    return data.text;
  } catch (error: any) {
    console.error("[resume-parse] PDF extraction error:", error);
    throw new Error(`PDF text extraction failed: ${error.message}`);
  }
}

async function parseResumeWithOpenAI(text: string, apiKey: string): Promise<any> {
  console.log(`[resume-parse] Calling OpenAI API with text length: ${text.length}`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for OpenAI
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert resume parser. Your task is to extract COMPLETE and COMPREHENSIVE structured resume data from the provided text. 

CRITICAL INSTRUCTIONS:
1. Extract ALL sections comprehensively - do not skip any information
2. Extract ALL work experiences, ALL education entries, ALL projects, ALL skills, ALL achievements
3. For LaTeX-generated PDFs, pay attention to section headers (EDUCATION, EXPERIENCE, PROJECTS, TECHNICAL SKILLS, ACHIEVEMENTS, etc.)
4. Extract complete contact information including email, phone, website, LinkedIn, GitHub, location
5. Handle bullet points and multi-line descriptions - preserve all content
6. Extract dates in various formats (MMM YYYY, YYYY-MM, YYYY, etc.) and normalize them
7. For current positions, set is_current: true and end_date can be empty or "Present"
8. For skills, categorize them appropriately (Languages, Frameworks, DevOps, Tools, etc.)
9. Achievements should be mapped to certifications section with issuer as "Award" or "Achievement"
10. Extract ALL bullet points under each work experience, project, or education entry

SCHEMA:
{
  "title": "string (job title or professional title)",
  "summary": "string (professional summary if present, otherwise empty)",
  "contact_info": {
    "name": "string (full name)",
    "email": "string (email address)",
    "phone": "string (phone number)",
    "location": "string (city, state/country)",
    "linkedin": "string (LinkedIn URL or username)",
    "website": "string (personal website or portfolio URL)"
  },
  "work_experiences": [{
    "company": "string (company name)",
    "role": "string (job title/position)",
    "start_date": "string (format: YYYY-MM or YYYY)",
    "end_date": "string (format: YYYY-MM, YYYY, or empty if current)",
    "is_current": boolean (true if currently working here),
    "description": "string (ALL bullet points combined, preserve line breaks with \\n)"
  }],
  "educations": [{
    "institution": "string (school/university name)",
    "degree": "string (degree type: B.Tech, B.S., M.S., etc.)",
    "field_of_study": "string (major/field of study)",
    "start_date": "string (format: YYYY-MM or YYYY)",
    "end_date": "string (format: YYYY-MM, YYYY, or empty if current)",
    "is_current": boolean (true if currently enrolled),
    "description": "string (GPA, honors, relevant coursework, etc.)"
  }],
  "skills": [{
    "category": "string (Languages, Frameworks, DevOps, Tools, Specializations, etc.)",
    "name": "string (individual skill name)",
    "proficiency": "string (optional: Beginner, Intermediate, Advanced, Expert)"
  }],
  "projects": [{
    "title": "string (project name)",
    "url": "string (GitHub URL, website URL, or empty)",
    "start_date": "string (format: YYYY-MM or YYYY)",
    "end_date": "string (format: YYYY-MM, YYYY, or empty if ongoing)",
    "description": "string (ALL bullet points and details combined)"
  }],
  "certifications": [{
    "name": "string (certification name or achievement title)",
    "issuer": "string (issuing organization or 'Award' for achievements)",
    "issue_date": "string (format: YYYY-MM or YYYY)",
    "expiry_date": "string (empty if not applicable)",
    "url": "string (certification URL or empty)"
  }]
}

EXAMPLES:
- Date formats: "Aug 2023", "2023-08", "2023", "Jan 2026 -- May 2026" → parse as "2023-08" to "2026-05"
- Skills: "Languages: C++, Python, Go" → extract as separate skills with category "Languages"
- Bullet points: Extract ALL bullets under each entry, combine with \\n separators
- Contact info: Extract from header line, parse email, phone, URLs, location

Return ONLY valid JSON matching the schema above. Extract EVERYTHING - completeness is critical.`,
        },
        {
          role: "user",
          content: `Extract ALL resume data from this text comprehensively. Pay special attention to:
- Contact information (email, phone, website, LinkedIn, GitHub, location)
- ALL work experience entries with complete descriptions
- ALL education entries
- ALL projects with full details
- ALL technical skills (categorized properly)
- ALL achievements/awards

Resume text:\n\n${text}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 4000, // Increased for comprehensive extraction
    }),
    });
    
    clearTimeout(timeoutId);
    console.log(`[resume-parse] OpenAI API response status: ${response.status}`);

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
    console.log("[resume-parse] OpenAI response received");
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response. The model may have failed to generate a response.");
    }

    // Log OpenAI response preview for debugging
    const responsePreview = content.substring(0, 500);
    console.log(`[resume-parse] OpenAI response preview (first 500 chars):\n${responsePreview}...`);

    try {
      const parsed = JSON.parse(content);
      // Validate that we got a resume-like structure
      if (!parsed.contact_info && !parsed.title && !parsed.summary) {
        throw new Error("OpenAI returned invalid resume structure");
      }
      console.log("[resume-parse] Resume JSON parsed and validated");
      
      // Log extracted data summary
      console.log(`[resume-parse] Extracted data summary:
        - Contact info: ${parsed.contact_info ? 'Yes' : 'Missing'}
        - Work experiences: ${parsed.work_experiences?.length || 0}
        - Education entries: ${parsed.educations?.length || 0}
        - Projects: ${parsed.projects?.length || 0}
        - Skills: ${parsed.skills?.length || 0}
        - Certifications/Achievements: ${parsed.certifications?.length || 0}`);
      
      return parsed;
    } catch (error: any) {
      if (error.message.includes("invalid resume structure")) {
        throw error;
      }
      throw new Error(`Failed to parse OpenAI response as JSON: ${error.message}`);
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.error("[resume-parse] OpenAI API request timed out");
      throw new Error("OpenAI API request timed out after 2 minutes");
    }
    throw error;
  }
}

function validateParsedResume(resumeData: any): void {
  const warnings: string[] = [];
  
  // Check for missing critical sections
  if (!resumeData.contact_info || !resumeData.contact_info.name) {
    warnings.push("Missing contact information or name");
  }
  
  if (!resumeData.work_experiences || resumeData.work_experiences.length === 0) {
    warnings.push("No work experience entries found");
  }
  
  if (!resumeData.educations || resumeData.educations.length === 0) {
    warnings.push("No education entries found");
  }
  
  // Check for incomplete contact info
  if (resumeData.contact_info) {
    const contact = resumeData.contact_info;
    if (!contact.email && !contact.phone && !contact.linkedin && !contact.website) {
      warnings.push("Contact info missing email, phone, LinkedIn, and website");
    }
  }
  
  // Log warnings if any
  if (warnings.length > 0) {
    console.warn("[resume-parse] Validation warnings:");
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  } else {
    console.log("[resume-parse] Validation passed - all critical sections present");
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout for summary
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
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
    
    clearTimeout(timeoutId);

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
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Summary generation timed out after 1 minute");
    }
    throw error;
  }
}
