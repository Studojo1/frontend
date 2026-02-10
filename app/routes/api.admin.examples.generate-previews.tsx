import type { Route } from "./+types/api.admin.examples.generate-previews";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { resumeExamples } from "../../auth-schema";
import { eq } from "drizzle-orm";
import { uploadExamplePreview } from "~/lib/blob-storage.server";
import { convertPdfToPng } from "~/lib/pdf-to-png.server";
import type { ResumeSection } from "~/lib/resume-draft";

/**
 * Convert resume sections to legacy format for resume service
 */
function convertSectionsToLegacy(sections: ResumeSection[]): any {
  const legacy: any = {
    contact_info: {},
    summary: "",
    work_experiences: [],
    educations: [],
    skills: [],
    projects: [],
    certifications: [],
  };

  for (const section of sections) {
    if (section.type === "contact" && section.content.contact) {
      legacy.contact_info = section.content.contact;
    } else if (section.type === "summary" && section.content.summary) {
      legacy.summary = section.content.summary;
    } else if (section.type === "experience" && section.content.experience) {
      legacy.work_experiences = section.content.experience.map((exp) => ({
        company: exp.company || "",
        role: exp.role || "",
        start_date: exp.startDate || "",
        end_date: exp.endDate || null,
        is_current: exp.isCurrent || false,
        description: exp.description || "",
      }));
    } else if (section.type === "education" && section.content.education) {
      legacy.educations = section.content.education.map((edu) => ({
        institution: edu.institution || "",
        degree: edu.degree || "",
        field_of_study: edu.fieldOfStudy || "",
        start_date: edu.startDate || "",
        end_date: edu.endDate || null,
        is_current: edu.isCurrent || false,
        description: edu.description || "",
      }));
    } else if (section.type === "skills" && section.content.skills) {
      legacy.skills = section.content.skills.map((skill) => ({
        category: skill.category || "",
        name: skill.name || "",
        proficiency: skill.proficiency || "",
      }));
    } else if (section.type === "projects" && section.content.projects) {
      legacy.projects = section.content.projects.map((proj) => ({
        title: proj.title || "",
        url: proj.url || "",
        start_date: proj.startDate || "",
        end_date: proj.endDate || null,
        description: proj.description || "",
      }));
    } else if (section.type === "certifications" && section.content.certifications) {
      legacy.certifications = section.content.certifications.map((cert) => ({
        name: cert.name || "",
        issuer: cert.issuer || "",
        issue_date: cert.issueDate || "",
        expiry_date: cert.expiryDate || null,
        url: cert.url || "",
      }));
    }
  }

  return legacy;
}

/**
 * Generate PDF from resume sections using resume service
 */
async function generatePdfFromSections(sections: ResumeSection[], templateId: string): Promise<Buffer> {
  const resumeServiceUrl = process.env.RESUME_SERVICE_URL || "http://resume-service:8086";
  
  const legacyResume = convertSectionsToLegacy(sections);
  legacyResume.template_id = templateId;

  const response = await fetch(`${resumeServiceUrl}/make-resume`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(legacyResume),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resume service returned ${response.status}: ${errorText}`);
  }

  const pdfBuffer = Buffer.from(await response.arrayBuffer());
  return pdfBuffer;
}

/**
 * Generate preview for a single example resume
 */
async function generateExamplePreview(example: any): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    // Generate PDF from example resume data
    const pdfBuffer = await generatePdfFromSections(example.resumeData as ResumeSection[], example.templateId);

    // Convert PDF to PNG
    const pngBuffer = await convertPdfToPng(pdfBuffer, {
      scale: 2.0,
      page: 1,
    });

    // Upload to blob storage
    const previewUrl = await uploadExamplePreview(example.id, pngBuffer);

    // Update database with preview URL
    await db
      .update(resumeExamples)
      .set({ previewUrl, updatedAt: new Date() })
      .where(eq(resumeExamples.id, example.id));

    return {
      success: true,
      previewUrl,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * POST /api/admin/examples/generate-previews - Generate previews for all example resumes
 */
export async function action({ request }: Route.ActionArgs) {
  // Check authentication
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Add admin role check here
  // For now, allow any authenticated user (should be restricted in production)

  try {
    // Load all active examples
    const examples = await db
      .select()
      .from(resumeExamples)
      .where(eq(resumeExamples.isActive, true));

    if (examples.length === 0) {
      return Response.json({
        success: true,
        message: "No examples found",
        results: [],
      });
    }

    // Generate previews for all examples
    const results = await Promise.all(
      examples.map((example) => generateExamplePreview(example))
    );

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return Response.json({
      success: true,
      message: `Generated ${successful} previews, ${failed} failed`,
      total: examples.length,
      successful,
      failed,
      results: results.map((r, idx) => ({
        exampleId: examples[idx].id,
        name: examples[idx].name,
        ...r,
      })),
    });
  } catch (error: any) {
    console.error("[api.admin.examples.generate-previews] Error:", error);
    return Response.json(
      { error: error.message || "Failed to generate previews" },
      { status: 500 }
    );
  }
}

