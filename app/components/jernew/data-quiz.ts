// Quiz options and the project specificity scorer for /jernew.
// Shared file: owned by the foundation. Import it through ./data.
import type { CityId, JobType, QuizAnswers, RoleId, StageStop, Tone } from "./types";
import { QUIZ_MIN_PROJECT_CHARS } from "./config";

export type QuestionId = "role" | "where" | "type" | "stage" | "project" | "tone";

/** The six quiz cards, one at a time, in this order. */
export const QUIZ_QUESTIONS: { id: QuestionId; kicker: string; title: string; help: string }[] = [
  { id: "role", kicker: "Role", title: "What do you want to be hired as?", help: "Pick one. You can change it later." },
  { id: "where", kicker: "Where", title: "Where would you work?", help: "Pick any cities, plus Remote if you are open to it." },
  { id: "type", kicker: "When", title: "Internship, full-time, or either?", help: "And roughly when you can start." },
  { id: "stage", kicker: "Company", title: "What size of company excites you?", help: "Slide it. We favour this size but do not hide the rest." },
  { id: "project", kicker: "Proof", title: "Your best project, in a sentence or two", help: "Numbers, tools and what changed. This goes into your first email." },
  { id: "tone", kicker: "Voice", title: "How should your first email sound?", help: "Same facts, three ways to open. Pick the one that sounds like you." },
];

export interface RoleOption {
  id: RoleId;
  label: string;
  /** Two or three letters for the orbit chip. */
  short: string;
  /** Used in emails: "a {intern}" or "a {fulltime}". */
  intern: string;
  fulltime: string;
}

export const ROLES: RoleOption[] = [
  { id: "sde", label: "Software engineer", short: "SDE", intern: "software engineering intern", fulltime: "software engineer" },
  { id: "frontend", label: "Frontend developer", short: "FE", intern: "frontend intern", fulltime: "frontend developer" },
  { id: "data", label: "Data analyst", short: "DA", intern: "data analyst intern", fulltime: "data analyst" },
  { id: "product", label: "Product (APM)", short: "PM", intern: "product intern", fulltime: "associate product manager" },
  { id: "growth", label: "Growth and marketing", short: "GR", intern: "growth intern", fulltime: "growth associate" },
  { id: "ml", label: "ML engineer", short: "ML", intern: "machine learning intern", fulltime: "machine learning engineer" },
  { id: "cloud", label: "Cloud and DevOps", short: "OPS", intern: "DevOps intern", fulltime: "DevOps engineer" },
  { id: "design", label: "Product designer", short: "UX", intern: "design intern", fulltime: "product designer" },
];

export const CITIES: { id: CityId; label: string }[] = [
  { id: "bengaluru", label: "Bengaluru" },
  { id: "pune", label: "Pune" },
  { id: "hyderabad", label: "Hyderabad" },
  { id: "mumbai", label: "Mumbai" },
  { id: "delhi", label: "Delhi NCR" },
  { id: "chennai", label: "Chennai" },
  { id: "kolkata", label: "Kolkata" },
];

export const JOB_TYPES: { id: JobType; label: string; blurb: string }[] = [
  { id: "internship", label: "Internship", blurb: "2 to 6 months" },
  { id: "fulltime", label: "Full-time", blurb: "After you graduate" },
  { id: "either", label: "Either", blurb: "Whatever is right" },
];

/** Start month options. Fixed list, so no date is read at render time. */
export const START_MONTHS: { id: string; label: string }[] = [
  { id: "2026-12", label: "Dec 2026" },
  { id: "2027-01", label: "Jan 2027" },
  { id: "2027-02", label: "Feb 2027" },
  { id: "2027-03", label: "Mar 2027" },
  { id: "2027-05", label: "May 2027" },
  { id: "2027-07", label: "Jul 2027" },
  { id: "flexible", label: "Flexible" },
];

export interface StageOption {
  stop: StageStop;
  label: string;
  team: string;
  blurb: string;
}

/** Slider stops, small to large. The illustration grows with the stop. */
export const STAGES: StageOption[] = [
  { stop: 0, label: "Tiny startup", team: "Under 15 people", blurb: "You will touch everything." },
  { stop: 1, label: "Seed", team: "15 to 50 people", blurb: "Fast, scrappy, close to the founders." },
  { stop: 2, label: "Series A to B", team: "50 to 300 people", blurb: "Real users, still room to own things." },
  { stop: 3, label: "Growth stage", team: "300 to 2,000 people", blurb: "Structure, mentors, bigger stakes." },
  { stop: 4, label: "Large company", team: "2,000 plus", blurb: "Big brand, defined roles." },
];

export interface ToneOption {
  id: Tone;
  label: string;
  blurb: string;
  signoff: string;
}

export const TONES: ToneOption[] = [
  {
    id: "direct",
    label: "Direct",
    blurb: "Gets to the point in one line.",
    signoff: "Thanks,",
  },
  {
    id: "warm",
    label: "Warm",
    blurb: "Friendly, curious, a little personal.",
    signoff: "Warmly,",
  },
  {
    id: "bold",
    label: "Bold",
    blurb: "Leads with the result. Confident, not loud.",
    signoff: "Cheers,",
  },
];

/** Tap-to-insert hints under the project box. */
export const PROJECT_HINTS: { id: "number" | "tool" | "outcome"; label: string; insert: string }[] = [
  { id: "number", label: "Add a number", insert: " used by 1,200 students" },
  { id: "tool", label: "Name the tool", insert: " built with React and Node.js" },
  { id: "outcome", label: "Say what changed", insert: ", which cut settle-up time to one tap" },
];

/** Used in emails when the student's own project text is too thin. */
export const SAMPLE_PROJECT =
  "Built Splitkart, a campus UPI expense tracker used by 1,200 students, with React, Node.js and PostgreSQL.";

const TOOL_WORDS = [
  "react", "node", "typescript", "javascript", "python", "pandas", "sql", "postgres", "postgresql", "mongodb",
  "java", "kotlin", "swift", "flutter", "django", "flask", "fastapi", "docker", "kubernetes", "tensorflow",
  "pytorch", "excel", "tableau", "power bi", "go", "rust", "c++", "next.js", "express", "spring", "git", "aws",
  "linux", "redis", "graphql", "html", "css", "scikit", "numpy", "spark", "r ",
];

const OUTCOME_WORDS = [
  "cut", "grew", "grow", "increased", "reduced", "saved", "used by", "adopted", "launched", "shipped", "won",
  "up ", "down ", "raised", "improved", "doubled", "halved", "users", "downloads", "revenue", "faster", "first place",
];

const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wholeWords = (list: string[]) =>
  new RegExp(`(?<![a-z0-9])(${list.map((w) => esc(w.trim())).sort((a, b) => b.length - a.length).join("|")})(?![a-z0-9])`, "i");
const TOOL_RE = wholeWords(TOOL_WORDS);
const OUTCOME_RE = wholeWords(OUTCOME_WORDS);

export interface Specificity {
  /** 0 to 100. */
  score: number;
  level: "Empty" | "Vague" | "Getting there" | "Specific" | "Sharp";
  hasNumber: boolean;
  hasTool: boolean;
  hasOutcome: boolean;
  /** Which hint chips are still worth showing. */
  missing: ("number" | "tool" | "outcome")[];
}

/** Live specificity meter for the project box. Pure and cheap: run it on every keystroke. */
export function scoreSpecificity(text: string): Specificity {
  const trimmed = text.trim();
  const hasNumber = /\d/.test(text);
  // Whole words only, the same rule as the highlighter, so "digital" is not
  // Git and "executed" is not "cut": what lights the meter is what is marked.
  const hasTool = TOOL_RE.test(text);
  const hasOutcome = OUTCOME_RE.test(text) || /%/.test(text);
  const length = Math.min(trimmed.length / 120, 1) * 25;
  const score = Math.round(length + (hasNumber ? 30 : 0) + (hasTool ? 25 : 0) + (hasOutcome ? 20 : 0));
  const level: Specificity["level"] =
    trimmed.length === 0 ? "Empty" : score < 30 ? "Vague" : score < 55 ? "Getting there" : score < 80 ? "Specific" : "Sharp";
  const missing = (["number", "tool", "outcome"] as const).filter(
    (k) => !(k === "number" ? hasNumber : k === "tool" ? hasTool : hasOutcome),
  );
  return { score, level, hasNumber, hasTool, hasOutcome, missing };
}

/** True when every quiz answer the flow needs is present. */
export function isQuizComplete(q: QuizAnswers): boolean {
  return (
    q.role !== null &&
    (q.cities.length > 0 || q.remote) &&
    q.jobType !== null &&
    q.startMonth !== null &&
    q.stage !== null &&
    q.project.trim().length >= QUIZ_MIN_PROJECT_CHARS &&
    q.tone !== null
  );
}

/** True when the given quiz card has a valid answer (drives the per-card Next). */
export function isQuestionAnswered(q: QuizAnswers, id: QuestionId): boolean {
  switch (id) {
    case "role":
      return q.role !== null;
    case "where":
      return q.cities.length > 0 || q.remote;
    case "type":
      return q.jobType !== null && q.startMonth !== null;
    case "stage":
      return q.stage !== null;
    case "project":
      return q.project.trim().length >= QUIZ_MIN_PROJECT_CHARS;
    case "tone":
      return q.tone !== null;
  }
}

export const roleById = (id: RoleId | null) => ROLES.find((r) => r.id === id) ?? ROLES[0];
export const cityLabel = (id: CityId) => CITIES.find((c) => c.id === id)?.label ?? id;
export const monthLabel = (id: string | null) => START_MONTHS.find((m) => m.id === id)?.label ?? "Flexible";
export const toneById = (id: Tone | null) => TONES.find((t) => t.id === id) ?? TONES[0];
