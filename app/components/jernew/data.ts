// Sample data for /jernew. Everything is fixed and deterministic, so the
// server and the browser render the same thing. Nothing here is real: the
// student, the companies and the people are all made up for the concept.
// Shared file: owned by the foundation. Step builders import, never edit.
//
// This file is the single import surface for data: it re-exports the people,
// quiz, people, packs, email and campaign data from the data-*.ts files.
import type { ProfileCheckId, ProfileState } from "./types";

export * from "./data-quiz";
export * from "./data-people";
export * from "./data-campaign";

// ── Deterministic helpers ───────────────────────────────────────────────────

/** Seeded pseudo-random generator (mulberry32). Same seed, same sequence. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── The sample student and her resume ───────────────────────────────────────

export const STUDENT = {
  name: "Riya Sharma",
  first: "Riya",
  initials: "RS",
  city: "Pune",
  degree: "B.Tech, Computer Science and Engineering",
  college: "Deccan Institute of Technology, Pune",
  collegeShort: "DIT Pune",
  classOf: "Class of 2027",
  collegeEmail: "riya.sharma@dit.example.edu",
} as const;

export type ResumeSection = "header" | "education" | "experience" | "projects" | "skills" | "extra";

export interface ResumeLine {
  id: string;
  section: ResumeSection;
  text: string;
  /** Rendered as a bold line (titles, the name). */
  strong?: boolean;
}

/** The sample resume, line by line. Profile claims point at these ids. */
export const RESUME_LINES: ResumeLine[] = [
  { id: "r-name", section: "header", text: "Riya Sharma", strong: true },
  { id: "r-contact", section: "header", text: "Pune, India · riya.sharma@example.com" },
  { id: "r-edu", section: "education", text: "B.Tech, Computer Science and Engineering, Deccan Institute of Technology", strong: true },
  { id: "r-edu-year", section: "education", text: "Class of 2027 · CGPA 8.6 of 10" },
  { id: "r-exp-title", section: "experience", text: "Growth Intern, Crunchwell Foods (D2C snack brand), May to Jul 2026", strong: true },
  { id: "r-exp-1", section: "experience", text: "Ran 14 social and chat campaigns; repeat orders up 11% over the quarter" },
  { id: "r-exp-2", section: "experience", text: "Built a cohort dashboard in SQL used in weekly growth reviews" },
  { id: "r-proj-1-title", section: "projects", text: "Splitkart: campus UPI expense tracker", strong: true },
  { id: "r-proj-1-a", section: "projects", text: "Used by 1,200 students across 3 hostels in its first semester" },
  { id: "r-proj-1-b", section: "projects", text: "React, Node.js and PostgreSQL; settles a shared bill in one tap" },
  { id: "r-proj-2-title", section: "projects", text: "Canteen sales analysis", strong: true },
  { id: "r-proj-2-a", section: "projects", text: "Python and pandas on 9 months of till data; cut food waste 18%" },
  { id: "r-proj-2-b", section: "projects", text: "Menu changes adopted by the campus canteen committee" },
  { id: "r-skills", section: "skills", text: "React, TypeScript, Node.js, PostgreSQL, Python, pandas, SQL, Git" },
  { id: "r-extra", section: "extra", text: "Lead, college coding club (220 members); ran 2 hackathons" },
];

export const RESUME_SECTION_LABEL: Record<ResumeSection, string> = {
  header: "",
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  extra: "Leadership",
};

export type FactSlot = "name" | "college" | "degree" | "skills" | "projects" | "experience";

export interface ResumeFact {
  slot: FactSlot;
  value: string;
  /** Resume lines this fact was read from. */
  lineIds: string[];
}

/** Labelled slots the scanner fills, in the order they fly in. */
export const FACT_SLOTS: { slot: FactSlot; label: string }[] = [
  { slot: "name", label: "Name" },
  { slot: "college", label: "College" },
  { slot: "degree", label: "Degree" },
  { slot: "skills", label: "Skills" },
  { slot: "projects", label: "Projects" },
  { slot: "experience", label: "Experience" },
];

/** What the scanner "finds". Several facts can share a slot (skills, projects). */
export const RESUME_FACTS: ResumeFact[] = [
  { slot: "name", value: "Riya Sharma", lineIds: ["r-name"] },
  { slot: "college", value: "Deccan Institute of Technology", lineIds: ["r-edu"] },
  { slot: "degree", value: "B.Tech CSE, Class of 2027", lineIds: ["r-edu", "r-edu-year"] },
  { slot: "skills", value: "React", lineIds: ["r-skills"] },
  { slot: "skills", value: "Node.js", lineIds: ["r-skills"] },
  { slot: "skills", value: "PostgreSQL", lineIds: ["r-skills"] },
  { slot: "skills", value: "Python", lineIds: ["r-skills"] },
  { slot: "skills", value: "SQL", lineIds: ["r-skills"] },
  { slot: "projects", value: "Splitkart: 1,200 users", lineIds: ["r-proj-1-title", "r-proj-1-a"] },
  { slot: "projects", value: "Canteen analysis: waste down 18%", lineIds: ["r-proj-2-title", "r-proj-2-a"] },
  { slot: "experience", value: "Growth Intern, D2C snack brand", lineIds: ["r-exp-title", "r-exp-1"] },
];

/** Status lines for the scanner's aria-live region, in order. */
export const SCAN_STATUS: string[] = [
  "Reading your resume in this browser",
  "Found your name and college",
  "Picking out skills you have used",
  "Pulling projects that carry numbers",
  "Lining up your experience",
  "Done. Every fact links back to a line on your resume",
];

// ── The drafted profile page ───────────────────────────────────────────────

export type ClaimSection = "intro" | "projects" | "experience" | "skills" | "more";

export interface ProfileClaim {
  id: string;
  section: ClaimSection;
  text: string;
  /** RESUME_LINES ids this claim is backed by. Never empty. */
  evidence: string[];
}

export const PROFILE_DRAFT = {
  slug: "riya-sharma-7k2",
  url: "studojo.com/p/riya-sharma-7k2",
  name: STUDENT.name,
  initials: STUDENT.initials,
  meta: "B.Tech CSE · Class of 2027 · Pune",
  headline: "Final-year CSE student who builds things people actually use",
  about:
    "I like small products with real users. My campus expense tracker grew to 1,200 students, and a summer in growth taught me to measure what I ship. Looking for a team where I can build and see the numbers move.",
  claims: [
    { id: "c-degree", section: "intro", text: "Final-year B.Tech CSE, Class of 2027", evidence: ["r-edu", "r-edu-year"] },
    { id: "c-proj-1", section: "projects", text: "Built Splitkart, a UPI expense tracker used by 1,200 students", evidence: ["r-proj-1-title", "r-proj-1-a"] },
    { id: "c-proj-1-stack", section: "projects", text: "Shipped it with React, Node.js and PostgreSQL", evidence: ["r-proj-1-b"] },
    { id: "c-proj-2", section: "projects", text: "Cut canteen food waste 18% with a sales analysis in Python", evidence: ["r-proj-2-title", "r-proj-2-a"] },
    { id: "c-exp", section: "experience", text: "Growth intern at a D2C snack brand: repeat orders up 11%", evidence: ["r-exp-title", "r-exp-1"] },
    { id: "c-dash", section: "experience", text: "Built the cohort dashboard used in weekly growth reviews", evidence: ["r-exp-2"] },
    { id: "c-skills", section: "skills", text: "React, TypeScript, Node.js, PostgreSQL, Python, SQL", evidence: ["r-skills"] },
    { id: "c-lead", section: "more", text: "Leads a 220-member coding club; ran 2 hackathons", evidence: ["r-extra"] },
  ] as ProfileClaim[],
};

export const CLAIM_SECTION_LABEL: Record<ClaimSection, string> = {
  intro: "About",
  projects: "Projects",
  experience: "Experience",
  skills: "Skills",
  more: "Also",
};

export interface ProfileCheck {
  id: ProfileCheckId;
  label: string;
  hint: string;
  points: number;
}

/** Profile-strength checklist. Strength = PROFILE_BASE_STRENGTH + points done. */
export const PROFILE_CHECKS: ProfileCheck[] = [
  { id: "number", label: "Add a number to your headline", hint: "Numbers are the first thing a busy reader looks for.", points: 15 },
  { id: "college-email", label: "Verify your college email", hint: "Adds a verified badge next to your college.", points: 20 },
  { id: "headline", label: "Make the headline sound like you", hint: "One line, in your words.", points: 10 },
  { id: "about", label: "Read and tweak your about", hint: "Three sentences is plenty.", points: 10 },
];

export const PROFILE_BASE_STRENGTH = 45;

/** 0 to 100. Pure function of the profile slice. */
export function profileStrength(p: ProfileState): number {
  let s = PROFILE_BASE_STRENGTH;
  for (const c of PROFILE_CHECKS) if (p.checks[c.id]) s += c.points;
  return Math.min(100, s);
}

/** The mock OTP shown on the college-email badge. */
export const MOCK_OTP = "482916";
