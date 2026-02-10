import type { Route } from "./+types/api.admin.templates.generate-all-previews";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { loadAllTemplates } from "~/lib/template-loader.server";
import { uploadTemplatePreviewImage } from "~/lib/blob-storage.server";
import { convertPdfToPng } from "~/lib/pdf-to-png.server";

// Sample resume data for preview generation
const sampleResumeData = {
  contact_info: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/johndoe",
    website: "johndoe.dev",
  },
  summary: "Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and mentoring junior developers.",
  work_experiences: [
    {
      company: "Tech Corp",
      role: "Senior Software Engineer",
      start_date: "2021-01",
      end_date: null,
      is_current: true,
      description: "Led development of microservices architecture serving 1M+ users\n• Architected and implemented RESTful APIs using Node.js and TypeScript\n• Reduced system latency by 40% through performance optimization\n• Mentored team of 5 junior engineers",
    },
    {
      company: "StartupXYZ",
      role: "Full Stack Developer",
      start_date: "2019-06",
      end_date: "2020-12",
      is_current: false,
      description: "Built customer-facing web applications using React and Node.js\n• Implemented CI/CD pipelines reducing deployment time by 60%\n• Collaborated with design team to improve UX metrics by 25%",
    },
  ],
  educations: [
    {
      institution: "University of Technology",
      degree: "B.S. Computer Science",
      field_of_study: "Computer Science",
      start_date: "2015-09",
      end_date: "2019-05",
      is_current: false,
      description: "GPA: 3.8/4.0\nRelevant Coursework: Data Structures, Algorithms, Database Systems",
    },
  ],
  skills: [
    { category: "Languages", name: "JavaScript", proficiency: "Expert" },
    { category: "Languages", name: "TypeScript", proficiency: "Expert" },
    { category: "Languages", name: "Python", proficiency: "Advanced" },
    { category: "Frameworks", name: "React", proficiency: "Expert" },
    { category: "Frameworks", name: "Node.js", proficiency: "Expert" },
    { category: "Tools", name: "Docker", proficiency: "Advanced" },
    { category: "Tools", name: "AWS", proficiency: "Advanced" },
  ],
  projects: [
    {
      title: "E-Commerce Platform",
      url: "github.com/johndoe/ecommerce",
      start_date: "2022-01",
      end_date: "2022-06",
      description: "Built full-stack e-commerce platform with payment integration\n• Handled 10K+ concurrent users with Redis caching\n• Implemented real-time inventory management system",
    },
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      issue_date: "2022-03",
      expiry_date: null,
      url: "aws.amazon.com/certification",
    },
  ],
};

/**
 * Generate PDF from resume data using resume service
 */
async function generatePdfFromResume(resumeData: any, templateId: string): Promise<Buffer> {
  const resumeServiceUrl = process.env.RESUME_SERVICE_URL || "http://resume-service:8086";
  
  const legacyResume = {
    contact_info: resumeData.contact_info,
    summary: resumeData.summary,
    work_experiences: resumeData.work_experiences || [],
    educations: resumeData.educations || [],
    skills: resumeData.skills || [],
    projects: resumeData.projects || [],
    certifications: resumeData.certifications || [],
    template_id: templateId,
  };

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
 * Generate preview for a single template
 */
async function generateTemplatePreview(templateId: string): Promise<{ templateId: string; success: boolean; previewUrl?: string; error?: string }> {
  try {
    // Generate PDF from sample resume data
    const pdfBuffer = await generatePdfFromResume(sampleResumeData, templateId);

    // Convert PDF to PNG
    const pngBuffer = await convertPdfToPng(pdfBuffer, {
      scale: 2.0,
      page: 1,
    });

    // Upload to blob storage
    const previewUrl = await uploadTemplatePreviewImage(templateId, pngBuffer);

    return {
      templateId,
      success: true,
      previewUrl,
    };
  } catch (error: any) {
    return {
      templateId,
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * POST /api/admin/templates/generate-all-previews - Generate previews for all templates
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
    // Load all templates
    const templates = await loadAllTemplates();

    if (templates.length === 0) {
      return Response.json({
        success: true,
        message: "No templates found",
        results: [],
      });
    }

    // Generate previews for all templates
    const results = await Promise.all(
      templates.map((template) => generateTemplatePreview(template.id))
    );

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return Response.json({
      success: true,
      message: `Generated ${successful} previews, ${failed} failed`,
      total: templates.length,
      successful,
      failed,
      results,
    });
  } catch (error: any) {
    console.error("[api.admin.templates.generate-all-previews] Error:", error);
    return Response.json(
      { error: error.message || "Failed to generate previews" },
      { status: 500 }
    );
  }
}


