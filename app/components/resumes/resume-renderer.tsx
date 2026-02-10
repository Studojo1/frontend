/**
 * Resume Renderer - Pure rendering component for resume display
 * 
 * Observes document state and renders resume based on template.
 * Template styles are loaded from template metadata, not hardcoded.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { ResumeDocument } from "~/lib/resume-document";
import type { Template } from "~/lib/template-store";

interface ResumeRendererProps {
  document: ResumeDocument;
  template: Template;
  showCelebration?: boolean;
}

interface TemplateStyles {
  headerBg: string;
  headerText: string;
  bodyBg: string;
  accentColor: string;
  borderColor: string;
}

/**
 * Get template-specific styles based on template category/id
 * In the future, this could load styles from template metadata
 */
function getTemplateStyles(template: Template): TemplateStyles {
  // Map template category/id to Tailwind classes
  const category = template.category.toLowerCase();
  const id = template.id.toLowerCase();

  if (id === "classic" || category.includes("traditional")) {
    return {
      headerBg: "bg-gray-900",
      headerText: "text-white",
      bodyBg: "bg-white",
      accentColor: "text-gray-900",
      borderColor: "border-gray-300",
    };
  }

  if (id === "minimal" || category.includes("ats")) {
    return {
      headerBg: "bg-white",
      headerText: "text-gray-900",
      bodyBg: "bg-white",
      accentColor: "text-gray-900",
      borderColor: "border-gray-200",
    };
  }

  if (id === "executive" || category.includes("executive")) {
    return {
      headerBg: "bg-slate-800",
      headerText: "text-white",
      bodyBg: "bg-white",
      accentColor: "text-slate-800",
      borderColor: "border-gray-300",
    };
  }

  if (id === "creative" || category.includes("creative")) {
    return {
      headerBg: "bg-gradient-to-r from-purple-600 to-blue-600",
      headerText: "text-white",
      bodyBg: "bg-white",
      accentColor: "text-purple-600",
      borderColor: "border-purple-200",
    };
  }

  // Default: modern/professional
  return {
    headerBg: "bg-emerald-600",
    headerText: "text-white",
    bodyBg: "bg-white",
    accentColor: "text-emerald-600",
    borderColor: "border-gray-200",
  };
}

export function ResumeRenderer({
  document,
  template,
  showCelebration = false,
}: ResumeRendererProps) {
  const styles = getTemplateStyles(template);
  const sortedSections = document.getSortedSections();

  // Extract contact info from contact section
  const contactSection = sortedSections.find((s) => s.type === "contact");
  const contactInfo = contactSection?.content?.contact || {};

  // Extract other sections
  const summarySection = sortedSections.find((s) => s.type === "summary");
  const experienceSection = sortedSections.find((s) => s.type === "experience");
  const educationSection = sortedSections.find((s) => s.type === "education");
  const skillsSection = sortedSections.find((s) => s.type === "skills");
  const projectsSection = sortedSections.find((s) => s.type === "projects");
  const certificationsSection = sortedSections.find((s) => s.type === "certifications");

  const hasAnyContactInfo = Object.values(contactInfo).some((v) => v && String(v).trim());

  // Build contact info string matching LaTeX format: email | website | linkedin | phone | location
  const contactParts: string[] = [];
  if (contactInfo.email) contactParts.push(contactInfo.email);
  if (contactInfo.website) contactParts.push(contactInfo.website);
  if (contactInfo.linkedin) contactParts.push(contactInfo.linkedin);
  if (contactInfo.phone) contactParts.push(contactInfo.phone);
  if (contactInfo.location) contactParts.push(contactInfo.location);
  const contactInfoLine = contactParts.length > 0 ? contactParts.join(" | ") : "";

  // Determine if template should have colored header (only creative)
  const hasColoredHeader = template.id.toLowerCase() === "creative";

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[8.5in] bg-white shadow-2xl"
        style={{ aspectRatio: "8.5/11" }}
      >
        {/* Header Section - Centered like LaTeX */}
        <div className={`${hasColoredHeader ? styles.headerBg : "bg-white"} px-8 py-6 text-center`}>
          <AnimatePresence mode="wait">
            {contactInfo.name ? (
              <motion.h1
                key="name"
                initial={showCelebration ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={
                  showCelebration
                    ? {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }
                    : { duration: 0.2 }
                }
                className={`${hasColoredHeader ? styles.headerText : "text-gray-900"} text-3xl font-bold mb-2 ${
                  showCelebration ? "animate-pulse" : ""
                }`}
              >
                {contactInfo.name}
              </motion.h1>
            ) : (
              <motion.div
                key="name-placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                className={`${hasColoredHeader ? styles.headerText : "text-gray-900"} text-3xl font-bold mb-2`}
              >
                Your Name
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contact Info - Single line format matching LaTeX */}
          {contactInfoLine ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${hasColoredHeader ? styles.headerText : "text-gray-700"} text-sm mt-2`}
            >
              {contactInfoLine}
            </motion.div>
          ) : (
            <div className={`${hasColoredHeader ? styles.headerText : "text-gray-400"} text-sm mt-2 opacity-50`}>
              email@example.com | website.com | linkedin.com/in/profile | +1 (555) 000-0000 | City, State
            </div>
          )}
        </div>

        {/* Body Section */}
        <div className={`${styles.bodyBg} px-8 py-4`}>
          {/* Summary Section */}
          {summarySection?.content?.summary ? (
            <div className="mb-5">
              <h2 className={`${styles.accentColor} text-lg font-bold mb-2 border-b ${styles.borderColor} pb-1 uppercase`}>
                Professional Summary
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">{summarySection.content.summary}</p>
            </div>
          ) : null}

          {/* Experience Section */}
          {experienceSection?.content?.experience && experienceSection.content.experience.length > 0 && (
            <div className="mb-5">
              <h2 className={`${styles.accentColor} text-lg font-bold mb-2 border-b ${styles.borderColor} pb-1 uppercase`}>
                Experience
              </h2>
              <div className="space-y-3">
                {experienceSection.content.experience.map((exp) => (
                  <div key={exp.id} className="mb-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{exp.role}</h3>
                        <p className="text-gray-600 italic text-sm">{exp.company}</p>
                      </div>
                      <div className="text-xs text-gray-500 italic">
                        {exp.startDate && exp.endDate && `${exp.startDate} - ${exp.endDate}`}
                        {exp.isCurrent && exp.startDate && `${exp.startDate} - Present`}
                      </div>
                    </div>
                    <p className="text-gray-700 text-xs leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {educationSection?.content?.education && educationSection.content.education.length > 0 && (
            <div className="mb-5">
              <h2 className={`${styles.accentColor} text-lg font-bold mb-2 border-b ${styles.borderColor} pb-1 uppercase`}>
                Education
              </h2>
              <div className="space-y-3">
                {educationSection.content.education.map((edu) => (
                  <div key={edu.id} className="mb-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{edu.degree}</h3>
                        <p className="text-gray-600 italic text-sm">{edu.institution}</p>
                        {edu.fieldOfStudy && <p className="text-gray-500 text-xs">{edu.fieldOfStudy}</p>}
                      </div>
                      <div className="text-xs text-gray-500 italic">
                        {edu.startDate && edu.endDate && `${edu.startDate} - ${edu.endDate}`}
                        {edu.isCurrent && edu.startDate && `${edu.startDate} - Present`}
                      </div>
                    </div>
                    {edu.description && <p className="text-gray-700 text-xs leading-relaxed">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {skillsSection?.content?.skills && skillsSection.content.skills.length > 0 && (
            <div className="mb-5">
              <h2 className={`${styles.accentColor} text-lg font-bold mb-2 border-b ${styles.borderColor} pb-1 uppercase`}>
                Technical Skills
              </h2>
              <div className="text-xs text-gray-700">
                {skillsSection.content.skills.map((skill, idx) => (
                  <span key={skill.id}>
                    {idx > 0 && <span className="text-gray-400"> • </span>}
                    {skill.name}
                    {skill.category && skill.category !== skill.name && ` (${skill.category})`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {projectsSection?.content?.projects && projectsSection.content.projects.length > 0 && (
            <div className="mb-5">
              <h2 className={`${styles.accentColor} text-lg font-bold mb-2 border-b ${styles.borderColor} pb-1 uppercase`}>
                Projects
              </h2>
              <div className="space-y-3">
                {projectsSection.content.projects.map((proj) => (
                  <div key={proj.id} className="mb-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 text-sm">{proj.title}</h3>
                      {proj.startDate && proj.endDate && (
                        <div className="text-xs text-gray-500 italic">
                          {proj.startDate} - {proj.endDate}
                        </div>
                      )}
                    </div>
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-xs hover:underline">
                        {proj.url}
                      </a>
                    )}
                    <p className="text-gray-700 text-xs leading-relaxed mt-1">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications/Achievements Section */}
          {certificationsSection?.content?.certifications && certificationsSection.content.certifications.length > 0 && (
            <div className="mb-5">
              <h2 className={`${styles.accentColor} text-lg font-bold mb-2 border-b ${styles.borderColor} pb-1 uppercase`}>
                Achievements
              </h2>
              <div className="space-y-2">
                {certificationsSection.content.certifications.map((cert) => (
                  <div key={cert.id} className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-gray-900 text-sm">{cert.name}</span>
                      {cert.issuer && <span className="text-gray-600 text-xs ml-2">- {cert.issuer}</span>}
                    </div>
                    {cert.issueDate && <span className="text-gray-500 text-xs italic">{cert.issueDate}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

