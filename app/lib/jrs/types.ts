// JRS — Studojo resume maker. Self-contained data model + persistence.
// Stored client-side in localStorage; no backend dependency for resume data.

export interface ResumeBasics {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  start: string;
  end: string;
  location: string;
  details: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  link: string;
  description: string;
  bullets: string[];
}

export interface SkillGroup {
  id: string;
  category: string;
  items: string; // comma-separated
}

export interface ResumeData {
  basics: ResumeBasics;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: SkillGroup[];
}

export type TemplateId = "modern" | "classic" | "compact" | "minimal" | "technical";

export const TEMPLATES: { id: TemplateId; name: string; blurb: string }[] = [
  { id: "modern", name: "Modern", blurb: "Accent sidebar, clean sans-serif" },
  { id: "classic", name: "Classic", blurb: "Traditional serif, centered header" },
  { id: "compact", name: "Compact", blurb: "Dense, fits more on one page" },
  { id: "minimal", name: "Minimal", blurb: "Lots of whitespace, understated" },
  { id: "technical", name: "Technical", blurb: "Mono accents, built for engineers" },
];

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Starter content so the preview is never empty — user edits over it.
export function starterResume(): ResumeData {
  return {
    basics: {
      name: "Aanya Sharma",
      title: "Computer Science Student",
      email: "aanya.sharma@email.com",
      phone: "+91 98765 43210",
      location: "Bengaluru, India",
      website: "aanyasharma.dev",
      linkedin: "linkedin.com/in/aanyasharma",
    },
    summary:
      "Final-year CS student with hands-on experience building full-stack web apps. Looking for a software engineering internship where I can ship real features and learn from a strong team.",
    experience: [
      {
        id: uid(),
        company: "Nimbus Labs",
        role: "Software Engineering Intern",
        location: "Remote",
        start: "May 2025",
        end: "Aug 2025",
        current: false,
        bullets: [
          "Built a React dashboard used by 2,000+ weekly users, cutting support tickets 30%.",
          "Shipped a caching layer that dropped average API response time from 800ms to 120ms.",
          "Wrote integration tests that raised coverage on the payments module from 40% to 85%.",
        ],
      },
    ],
    education: [
      {
        id: uid(),
        school: "RV College of Engineering",
        degree: "B.E.",
        field: "Computer Science",
        start: "2022",
        end: "2026",
        location: "Bengaluru",
        details: "CGPA 8.7/10. Coursework: Data Structures, DBMS, Operating Systems, ML.",
      },
    ],
    projects: [
      {
        id: uid(),
        name: "SplitWise Clone",
        link: "github.com/aanya/splitwise",
        description: "Group expense tracker with real-time settlement.",
        bullets: [
          "Built with React, Node, and Postgres; deployed on Render.",
          "Implemented a debt-simplification algorithm to minimise transactions.",
        ],
      },
    ],
    skills: [
      { id: uid(), category: "Languages", items: "TypeScript, Python, Java, SQL" },
      { id: uid(), category: "Frameworks", items: "React, Node.js, Express, Next.js" },
      { id: uid(), category: "Tools", items: "Git, Docker, PostgreSQL, AWS" },
    ],
  };
}

export function emptyExperience(): ExperienceItem {
  return {
    id: uid(),
    company: "",
    role: "",
    location: "",
    start: "",
    end: "",
    current: false,
    bullets: [""],
  };
}

export function emptyEducation(): EducationItem {
  return {
    id: uid(),
    school: "",
    degree: "",
    field: "",
    start: "",
    end: "",
    location: "",
    details: "",
  };
}

export function emptyProject(): ProjectItem {
  return { id: uid(), name: "", link: "", description: "", bullets: [""] };
}

export function emptySkillGroup(): SkillGroup {
  return { id: uid(), category: "", items: "" };
}

const STORAGE_KEY = "jrs:resume:v1";
const TEMPLATE_KEY = "jrs:template:v1";

export function loadResume(): ResumeData {
  if (typeof window === "undefined") return starterResume();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return starterResume();
    const parsed = JSON.parse(raw);
    // Shallow shape guard — fall back to starter if structure is off.
    if (!parsed || !parsed.basics || !Array.isArray(parsed.experience)) {
      return starterResume();
    }
    return parsed as ResumeData;
  } catch {
    return starterResume();
  }
}

export function saveResume(data: ResumeData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota or disabled storage — non-fatal */
  }
}

/** True if the user has a resume saved from a previous session. */
export function hasSavedResume(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/** Wipe the saved resume (used by "start over"). */
export function clearSavedResume(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** An empty resume — used when a user explicitly starts from scratch. */
export function blankResume(): ResumeData {
  return {
    basics: { name: "", title: "", email: "", phone: "", location: "", website: "", linkedin: "" },
    summary: "",
    experience: [emptyExperience()],
    education: [emptyEducation()],
    projects: [],
    skills: [emptySkillGroup()],
  };
}

export function loadTemplate(): TemplateId {
  if (typeof window === "undefined") return "modern";
  try {
    const raw = localStorage.getItem(TEMPLATE_KEY) as TemplateId | null;
    if (raw && TEMPLATES.some((t) => t.id === raw)) return raw;
  } catch {
    /* ignore */
  }
  return "modern";
}

export function saveTemplate(id: TemplateId): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TEMPLATE_KEY, id);
  } catch {
    /* ignore */
  }
}

/** Flatten a resume to plain text — used for ATS keyword analysis. */
export function resumeToText(d: ResumeData): string {
  const parts: string[] = [
    d.basics.name,
    d.basics.title,
    d.summary,
    ...d.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...d.education.map((e) => `${e.degree} ${e.field} ${e.school} ${e.details}`),
    ...d.projects.flatMap((p) => [p.name, p.description, ...p.bullets]),
    ...d.skills.map((s) => `${s.category}: ${s.items}`),
  ];
  return parts.filter(Boolean).join("\n");
}
