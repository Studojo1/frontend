import { useEffect, useState } from "react";
import { ResumeRenderer } from "./resume-renderer";
import { ResumeDocument } from "~/lib/resume-document";
import type { Template } from "~/lib/template-store";
import { normalizeTemplate } from "~/lib/template-store";

interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
}

interface LiveResumeCanvasProps {
  contactInfo: ContactInfo;
  targetRole?: string;
  templateId: string;
  showCelebration?: boolean;
}

/**
 * Live Resume Canvas - Wrapper component that creates a minimal document
 * from contact info and renders using ResumeRenderer
 */
export function LiveResumeCanvas({
  contactInfo,
  targetRole,
  templateId,
  showCelebration = false,
}: LiveResumeCanvasProps) {
  const [template, setTemplate] = useState<Template | null>(null);

  // Load template metadata
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch("/api/resumes/templates");
        if (response.ok) {
          const data = await response.json();
          const templates = data.map(normalizeTemplate).filter((t: Template | null) => t !== null);
          const foundTemplate = templates.find((t: Template) => t.id === templateId);
          if (foundTemplate) {
            setTemplate(foundTemplate);
          } else {
            // Fallback template if not found
            setTemplate({
              id: templateId,
              version: "1.0",
              name: templateId.charAt(0).toUpperCase() + templateId.slice(1),
              description: "",
              category: "professional",
              assets: { latexFile: "" },
            });
          }
        }
      } catch (error) {
        console.error("Failed to load template:", error);
        // Fallback template
        setTemplate({
          id: templateId,
          version: "1.0",
          name: templateId.charAt(0).toUpperCase() + templateId.slice(1),
          description: "",
          category: "professional",
          assets: { latexFile: "" },
        });
      }
    };

    loadTemplate();
  }, [templateId]);

  // Create minimal document from contact info
  const document = ResumeDocument.empty("temp-user", "Resume", templateId).addSection(
    "contact",
    { contact: contactInfo },
    0
  );

  if (!template) {
  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gray-50">
        <div className="text-center text-gray-500">Loading template...</div>
    </div>
  );
  }

  return <ResumeRenderer document={document} template={template} showCelebration={showCelebration} />;
}

