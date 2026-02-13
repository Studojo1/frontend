// Resume Draft v2: Section-based resume manipulation utilities
// New model: sections-first, not JSON-first

export interface ResumeSection {
  id: string;
  type: 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'custom';
  order: number;
  content: SectionContent;
  aiSuggestions?: AISuggestion[];
}

export interface SectionContent {
  // Contact section
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  
  // Summary section
  summary?: string; // Rich text
  
  // Experience section
  experience?: Array<{
    id: string;
    company: string;
    role: string;
    startDate?: string;
    endDate?: string;
    isCurrent: boolean;
    description: string; // Rich text
  }>;
  
  // Education section
  education?: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
  }>;
  
  // Skills section
  skills?: Array<{
    id: string;
    category: string;
    name: string;
    proficiency?: string;
  }>;
  
  // Projects section
  projects?: Array<{
    id: string;
    title: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    description: string; // Rich text
  }>;
  
  // Certifications section
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate?: string;
    expiryDate?: string;
    url?: string;
  }>;
  
  // Custom section
  custom?: {
    title: string;
    content: string; // Rich text
  };
}

export interface AISuggestion {
  id: string;
  type: 'keyword' | 'completeness' | 'formatting' | 'rewrite';
  message: string;
  severity: 'info' | 'warning' | 'error';
  suggestedValue?: string;
  field?: string;
}

export interface ResumeDraft {
  id: string;
  userId: string;
  name: string;
  templateId: string;
  sections: ResumeSection[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

// Convert legacy resume JSON to section-based format
export function convertLegacyResumeToSections(legacyResume: any): ResumeSection[] {
  const sections: ResumeSection[] = [];
  let order = 0;

  // Contact section
  if (legacyResume.contact_info) {
    sections.push({
      id: `contact-${Date.now()}`,
      type: 'contact',
      order: order++,
      content: {
        contact: {
          name: legacyResume.contact_info.name || '',
          email: legacyResume.contact_info.email || '',
          phone: legacyResume.contact_info.phone || '',
          location: legacyResume.contact_info.location || '',
          linkedin: legacyResume.contact_info.linkedin || '',
          website: legacyResume.contact_info.website || '',
        },
      },
    });
  }

  // Summary section
  if (legacyResume.summary) {
    sections.push({
      id: `summary-${Date.now()}`,
      type: 'summary',
      order: order++,
      content: {
        summary: legacyResume.summary,
      },
    });
  }

  // Experience section
  if (legacyResume.work_experiences && legacyResume.work_experiences.length > 0) {
    sections.push({
      id: `experience-${Date.now()}`,
      type: 'experience',
      order: order++,
      content: {
        experience: legacyResume.work_experiences.map((exp: any, idx: number) => ({
          id: `exp-${idx}`,
          company: exp.company || '',
          role: exp.role || '',
          startDate: exp.start_date || undefined,
          endDate: exp.end_date || undefined,
          isCurrent: exp.is_current || false,
          description: exp.description || '',
        })),
      },
    });
  }

  // Education section
  if (legacyResume.educations && legacyResume.educations.length > 0) {
    sections.push({
      id: `education-${Date.now()}`,
      type: 'education',
      order: order++,
      content: {
        education: legacyResume.educations.map((edu: any, idx: number) => ({
          id: `edu-${idx}`,
          institution: edu.institution || '',
          degree: edu.degree || '',
          fieldOfStudy: edu.field_of_study || undefined,
          startDate: edu.start_date || undefined,
          endDate: edu.end_date || undefined,
          isCurrent: edu.is_current || false,
          description: edu.description || undefined,
        })),
      },
    });
  }

  // Skills section
  if (legacyResume.skills && legacyResume.skills.length > 0) {
    sections.push({
      id: `skills-${Date.now()}`,
      type: 'skills',
      order: order++,
      content: {
        skills: legacyResume.skills.map((skill: any, idx: number) => ({
          id: `skill-${idx}`,
          category: skill.category || 'Other',
          name: skill.name || '',
          proficiency: skill.proficiency || undefined,
        })),
      },
    });
  }

  // Projects section
  if (legacyResume.projects && legacyResume.projects.length > 0) {
    sections.push({
      id: `projects-${Date.now()}`,
      type: 'projects',
      order: order++,
      content: {
        projects: legacyResume.projects.map((proj: any, idx: number) => ({
          id: `proj-${idx}`,
          title: proj.title || '',
          url: proj.url || undefined,
          startDate: proj.start_date || undefined,
          endDate: proj.end_date || undefined,
          description: proj.description || '',
        })),
      },
    });
  }

  // Certifications section
  if (legacyResume.certifications && legacyResume.certifications.length > 0) {
    sections.push({
      id: `certifications-${Date.now()}`,
      type: 'certifications',
      order: order++,
      content: {
        certifications: legacyResume.certifications.map((cert: any, idx: number) => ({
          id: `cert-${idx}`,
          name: cert.name || '',
          issuer: cert.issuer || '',
          issueDate: cert.issue_date || undefined,
          expiryDate: cert.expiry_date || undefined,
          url: cert.url || undefined,
        })),
      },
    });
  }

  return sections;
}

// Convert sections back to legacy JSON format (for export/backend compatibility)
export function convertSectionsToLegacyResume(sections: ResumeSection[], templateId?: string): any {
  const resume: any = {
    title: '',
    summary: '',
    contact_info: {},
    work_experiences: [],
    educations: [],
    skills: [],
    projects: [],
    certifications: [],
  };
  
  // Add template_id if provided
  if (templateId) {
    resume.template_id = templateId;
  }

  for (const section of sections.sort((a, b) => a.order - b.order)) {
    switch (section.type) {
      case 'contact':
        if (section.content.contact) {
          // Only set contact_info if it has at least a name or email
          const contact = section.content.contact;
          if (contact.name || contact.email || contact.phone || contact.linkedin || contact.website || contact.location) {
            resume.contact_info = contact;
            resume.title = contact.name || '';
          }
        }
        break;
      case 'summary':
        if (section.content.summary) {
          resume.summary = section.content.summary;
        }
        break;
      case 'experience':
        if (section.content.experience) {
          resume.work_experiences = section.content.experience.map(exp => ({
            company: exp.company,
            role: exp.role,
            start_date: exp.startDate || null,
            end_date: exp.endDate || null,
            is_current: exp.isCurrent,
            description: exp.description,
          }));
        }
        break;
      case 'education':
        if (section.content.education) {
          resume.educations = section.content.education.map(edu => ({
            institution: edu.institution,
            degree: edu.degree,
            field_of_study: edu.fieldOfStudy || null,
            start_date: edu.startDate || null,
            end_date: edu.endDate || null,
            is_current: edu.isCurrent,
            description: edu.description || null,
          }));
        }
        break;
      case 'skills':
        if (section.content.skills) {
          resume.skills = section.content.skills.map(skill => ({
            category: skill.category,
            name: skill.name,
            proficiency: skill.proficiency || null,
          }));
        }
        break;
      case 'projects':
        if (section.content.projects) {
          resume.projects = section.content.projects.map(proj => ({
            title: proj.title,
            url: proj.url || null,
            start_date: proj.startDate || null,
            end_date: proj.endDate || null,
            description: proj.description,
          }));
        }
        break;
      case 'certifications':
        if (section.content.certifications) {
          resume.certifications = section.content.certifications.map(cert => ({
            name: cert.name,
            issuer: cert.issuer,
            issue_date: cert.issueDate || null,
            expiry_date: cert.expiryDate || null,
            url: cert.url || null,
          }));
        }
        break;
    }
  }

  // Add template_id if provided (at the end to ensure it's set)
  if (templateId) {
    resume.template_id = templateId;
  }

  // Ensure we always return a valid object with at least the basic structure
  // This prevents empty payloads from being sent to the control plane
  if (!resume.title && !resume.summary && 
      (!resume.contact_info || Object.keys(resume.contact_info).length === 0) &&
      (!resume.work_experiences || resume.work_experiences.length === 0) &&
      (!resume.educations || resume.educations.length === 0) &&
      (!resume.skills || resume.skills.length === 0) &&
      (!resume.projects || resume.projects.length === 0) &&
      (!resume.certifications || resume.certifications.length === 0)) {
    // At minimum, ensure we have an empty but valid structure
    // The API route will validate and reject empty resumes
    console.warn("[convertSectionsToLegacyResume] Resume has no content, returning minimal structure");
  }

  return resume;
}

// Section manipulation utilities
export function addSection(sections: ResumeSection[], type: ResumeSection['type'], content: SectionContent): ResumeSection[] {
  const newSection: ResumeSection = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    order: sections.length,
    content,
  };
  return [...sections, newSection];
}

export function removeSection(sections: ResumeSection[], sectionId: string): ResumeSection[] {
  return sections.filter(s => s.id !== sectionId).map((s, idx) => ({ ...s, order: idx }));
}

export function updateSection(sections: ResumeSection[], sectionId: string, updates: Partial<ResumeSection>): ResumeSection[] {
  return sections.map(s => s.id === sectionId ? { ...s, ...updates } : s);
}

export function reorderSections(sections: ResumeSection[], fromIndex: number, toIndex: number): ResumeSection[] {
  const result = [...sections];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result.map((s, idx) => ({ ...s, order: idx }));
}

// Auto-save utilities
let autoSaveTimeout: NodeJS.Timeout | null = null;
const AUTO_SAVE_DELAY = 2000; // 2 seconds for v2 (faster than v1)

export async function autoSaveDraft(
  draftId: string,
  sections: ResumeSection[],
  templateId?: string
): Promise<ResumeDraft> {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  return new Promise((resolve, reject) => {
    autoSaveTimeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/v2/resumes/${draftId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sections,
            templateId,
            changeSummary: "Auto-saved",
          }),
        });

        if (!response.ok) {
          throw new Error(`Auto-save failed: ${response.statusText}`);
        }

        const data = await response.json();
        resolve(data.draft);
      } catch (error) {
        reject(error);
      } finally {
        autoSaveTimeout = null;
      }
    }, AUTO_SAVE_DELAY);
  });
}

export function cancelAutoSave() {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = null;
  }
}

