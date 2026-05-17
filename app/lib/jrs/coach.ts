// JRS coach — scripted onboarding + op-based resume patching.
// Shared between the client (apply ops live) and the chat endpoint (validate
// ops before returning them).
import type {
  ResumeData,
  ResumeBasics,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  SkillGroup,
} from "./types";
import {
  emptyExperience,
  emptyEducation,
  emptyProject,
  emptySkillGroup,
  uid,
} from "./types";

// ─── Scripted onboarding (zero LLM calls) ────────────────────────────────────
//
// We walk users through the basic fields one at a time using a deterministic
// state machine. No tokens spent.

export type ScriptedStep =
  | "name"
  | "title"
  | "location"
  | "email"
  | "phone"
  | "linkedin"
  | null;

const STEP_ORDER: Exclude<ScriptedStep, null>[] = [
  "name",
  "title",
  "location",
  "email",
  "phone",
  "linkedin",
];

const STARTER_NAME = "Aanya Sharma";
const STARTER_EMAIL = "aanya.sharma@email.com";

/** True if basics still match the starter sample / are empty enough to script. */
function basicsAreStarter(data: ResumeData): boolean {
  return (
    data.basics.name === STARTER_NAME ||
    data.basics.name === "" ||
    data.basics.email === STARTER_EMAIL ||
    data.basics.email === ""
  );
}

/** Pick the next scripted step, or null if basics are all filled with non-sample content. */
export function nextScriptedStep(data: ResumeData): ScriptedStep {
  if (!basicsAreStarter(data)) return null;
  // Replace each starter value with "" for the missing-check.
  const fields: Record<Exclude<ScriptedStep, null>, string> = {
    name: data.basics.name === STARTER_NAME ? "" : data.basics.name.trim(),
    title: data.basics.title === "Computer Science Student" ? "" : data.basics.title.trim(),
    location: data.basics.location === "Bengaluru, India" ? "" : data.basics.location.trim(),
    email: data.basics.email === STARTER_EMAIL ? "" : data.basics.email.trim(),
    phone: data.basics.phone === "+91 98765 43210" ? "" : data.basics.phone.trim(),
    linkedin:
      data.basics.linkedin === "linkedin.com/in/aanyasharma"
        ? ""
        : data.basics.linkedin.trim(),
  };
  for (const step of STEP_ORDER) {
    if (!fields[step]) return step;
  }
  return null;
}

const QUESTION_TEMPLATES: Record<Exclude<ScriptedStep, null>, string> = {
  name: "Hey, I'll help you build this in a few minutes. What's your name?",
  title: "Nice to meet you, {first}. What role are you targeting? (e.g. SWE Intern, Marketing Analyst)",
  location: "Where are you based? (City, country)",
  email: "What email do you want on the resume?",
  phone: "Phone number? Type 'skip' if you'd rather leave it out.",
  linkedin: "LinkedIn URL? Type 'skip' if you don't want it on the resume.",
};

export const KICKOFF_AFTER_BASICS =
  "Great, basics are in. Now tell me about your most recent role or internship, what you did, where, and any numbers you can share.";

export function scriptedQuestion(
  step: Exclude<ScriptedStep, null>,
  data: ResumeData,
): string {
  const first = (data.basics.name || "").split(/\s+/)[0] || "there";
  return QUESTION_TEMPLATES[step].replace("{first}", first);
}

/** Apply a user's scripted answer. "skip" is a no-op. Wipes any starter sample for that field. */
export function applyScripted(
  step: Exclude<ScriptedStep, null>,
  text: string,
  data: ResumeData,
): ResumeData {
  const v = text.trim();
  if (!v || v.toLowerCase() === "skip") {
    // For starter values we still want to clear them on skip so we don't keep
    // pretending Aanya's data is theirs.
    return blankStarterField(step, data);
  }
  // If the user is on their first step ("name") and we're still on the starter
  // sample, clear ALL starter fields so we don't mix Aanya's contact in with
  // the new user's name.
  let next = data;
  if (step === "name" && basicsAreStarter(data)) {
    next = clearAllStarterBasics(next);
  }
  next = { ...next, basics: { ...next.basics, [step]: v } };
  return next;
}

function blankStarterField(step: Exclude<ScriptedStep, null>, data: ResumeData): ResumeData {
  if (!basicsAreStarter(data)) return data;
  return { ...data, basics: { ...data.basics, [step]: "" } };
}

function clearAllStarterBasics(data: ResumeData): ResumeData {
  return {
    ...data,
    basics: {
      name: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: data.basics.website === "aanyasharma.dev" ? "" : data.basics.website,
      linkedin: "",
    },
    // Also clear the sample content blocks the starter brings in so the
    // preview doesn't show Aanya's job while the user builds.
    summary:
      data.summary.startsWith("Final-year CS student with hands-on") ? "" : data.summary,
    experience: data.experience.some((e) => e.company === "Nimbus Labs")
      ? [emptyExperience()]
      : data.experience,
    education: data.education.some((e) => e.school === "RV College of Engineering")
      ? [emptyEducation()]
      : data.education,
    projects: data.projects.some((p) => p.name === "SplitWise Clone") ? [] : data.projects,
    skills: data.skills.some((s) => s.items === "TypeScript, Python, Java, SQL")
      ? [emptySkillGroup()]
      : data.skills,
  };
}

// ─── Contextual smart opener (zero LLM calls) ────────────────────────────────

export function smartOpener(data: ResumeData): string {
  const expCount = data.experience.filter((e) => e.company || e.role).length;
  const projCount = data.projects.filter((p) => p.name).length;
  const first = (data.basics.name || "").split(/\s+/)[0];
  const hey = first ? `Hey ${first}.` : "Hey.";
  if (expCount === 0 && projCount === 0) {
    return `${hey} Let's get your first role on the resume. Tell me about your most recent job or internship.`;
  }
  const pieces: string[] = [];
  if (expCount > 0) pieces.push(`${expCount} role${expCount === 1 ? "" : "s"}`);
  if (projCount > 0) pieces.push(`${projCount} project${projCount === 1 ? "" : "s"}`);
  const summaryNote = data.summary.trim() ? "" : " You don't have a summary yet, want to write one?";
  return `${hey} You've got ${pieces.join(" and ")} in. Want to tighten existing bullets, add something new, or work on your summary?${summaryNote ? "\n\n" + summaryNote.trim() : ""}`;
}

// ─── Ops model (token-cheap LLM output) ──────────────────────────────────────
//
// The chat endpoint returns a list of these instead of writing the whole
// ResumeData back. "hey" responses produce an empty ops array.

export type Op =
  | { op: "set"; path: string; value: string }
  | { op: "add"; path: "experience" | "education" | "projects" | "skills"; value: any }
  | { op: "update"; path: string; value: Record<string, any> }
  | { op: "remove"; path: string };

function setBasicsField(d: ResumeData, field: keyof ResumeBasics, v: string): ResumeData {
  return { ...d, basics: { ...d.basics, [field]: v } };
}

function applyOne(data: ResumeData, op: Op): ResumeData {
  try {
    if (op.op === "set") {
      const [section, field] = op.path.split(".");
      if (section === "summary") return { ...data, summary: String(op.value ?? "") };
      if (section === "basics" && field && field in data.basics) {
        return setBasicsField(data, field as keyof ResumeBasics, String(op.value ?? ""));
      }
      return data;
    }
    if (op.op === "add") {
      const v = (op.value ?? {}) as any;
      if (op.path === "experience") {
        const item: ExperienceItem = {
          ...emptyExperience(),
          ...v,
          id: v.id || uid(),
          bullets: Array.isArray(v.bullets) ? v.bullets.map(String) : [""],
        };
        return { ...data, experience: [...data.experience, item] };
      }
      if (op.path === "education") {
        const item: EducationItem = {
          ...emptyEducation(),
          ...v,
          id: v.id || uid(),
        };
        return { ...data, education: [...data.education, item] };
      }
      if (op.path === "projects") {
        const item: ProjectItem = {
          ...emptyProject(),
          ...v,
          id: v.id || uid(),
          bullets: Array.isArray(v.bullets) ? v.bullets.map(String) : [""],
        };
        return { ...data, projects: [...data.projects, item] };
      }
      if (op.path === "skills") {
        const item: SkillGroup = { ...emptySkillGroup(), ...v, id: v.id || uid() };
        return { ...data, skills: [...data.skills, item] };
      }
      return data;
    }
    if (op.op === "update") {
      // path: "experience.<id>" / "education.<id>" / "projects.<id>" / "skills.<id>"
      const [section, id] = op.path.split(".");
      const patch = (op.value ?? {}) as Record<string, any>;
      if (!id) return data;
      if (section === "experience") {
        return {
          ...data,
          experience: data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        };
      }
      if (section === "education") {
        return {
          ...data,
          education: data.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        };
      }
      if (section === "projects") {
        return {
          ...data,
          projects: data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        };
      }
      if (section === "skills") {
        return {
          ...data,
          skills: data.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        };
      }
      return data;
    }
    if (op.op === "remove") {
      const [section, id] = op.path.split(".");
      if (!id) return data;
      if (section === "experience")
        return { ...data, experience: data.experience.filter((e) => e.id !== id) };
      if (section === "education")
        return { ...data, education: data.education.filter((e) => e.id !== id) };
      if (section === "projects")
        return { ...data, projects: data.projects.filter((p) => p.id !== id) };
      if (section === "skills")
        return { ...data, skills: data.skills.filter((s) => s.id !== id) };
      return data;
    }
    return data;
  } catch {
    return data;
  }
}

export function applyOps(data: ResumeData, ops: Op[]): ResumeData {
  return (ops || []).reduce(applyOne, data);
}

// ─── Compact resume serialization (token-cheap LLM input) ────────────────────

/** Strip empty fields and starter sample so we send the LLM only what matters. */
export function compactResume(d: ResumeData): any {
  const omitEmpty = (obj: Record<string, any>) =>
    Object.fromEntries(
      Object.entries(obj).filter(
        ([, v]) => v !== "" && v !== null && v !== undefined && v !== false,
      ),
    );
  const out: any = { basics: omitEmpty(d.basics) };
  if (d.summary.trim()) out.summary = d.summary;
  const exp = d.experience
    .filter((e) => e.company || e.role)
    .map((e) => ({ id: e.id, ...omitEmpty(e as any), bullets: e.bullets.filter(Boolean) }));
  if (exp.length) out.experience = exp;
  const edu = d.education
    .filter((e) => e.school || e.degree || e.field)
    .map((e) => ({ id: e.id, ...omitEmpty(e as any) }));
  if (edu.length) out.education = edu;
  const proj = d.projects
    .filter((p) => p.name || p.description)
    .map((p) => ({ id: p.id, ...omitEmpty(p as any), bullets: p.bullets.filter(Boolean) }));
  if (proj.length) out.projects = proj;
  const skills = d.skills.filter((s) => s.items.trim());
  if (skills.length) out.skills = skills.map((s) => ({ id: s.id, ...omitEmpty(s as any) }));
  return out;
}
