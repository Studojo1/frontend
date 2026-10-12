/**
 * Types and constants shared by /pb (the student page) and /pbadmin (the
 * staff page that triggers post generation).
 *
 * Client-safe on purpose: no server imports. A route component that imports a
 * value from a .server module drags the whole module into the client bundle
 * and React Router fails the build, so everything both sides need lives here.
 */

export const PB_MARKETS = ["India", "US", "UK", "UAE", "Singapore", "Global"] as const;

/** How the student is connected to Studojo. Drives disclosure in posts. */
export const PB_RELATIONS = [
  { value: "ambassador", label: "Studojo campus ambassador" },
  { value: "intern", label: "I intern at Studojo" },
  { value: "team", label: "I work at Studojo" },
  { value: "partner", label: "Paid creator partner" },
  { value: "user", label: "I use Studojo (not affiliated)" },
  { value: "none", label: "No connection to Studojo yet" },
] as const;

export const PB_TOPICS = [
  "Internships",
  "Resumes and ATS",
  "Cold outreach",
  "Placements",
  "Interviews",
  "First job",
  "College life",
  "Marketing",
  "Tech and coding",
  "Finance",
  "Consulting",
  "Design",
  "Startups",
  "AI tools",
  "Study abroad",
  "Productivity",
  "Side projects",
  "Personal branding",
] as const;

export const PB_EMOJI = [
  { value: "none", label: "None" },
  { value: "few", label: "One or two" },
  { value: "some", label: "Expressive" },
] as const;

export const PB_LANGS = [
  { value: "english", label: "English" },
  { value: "hinglish", label: "Light Hinglish" },
] as const;

/** 1 to 5 sliders. 1 is the left label, 5 the right. */
export const PB_TONE_SCALES = {
  formality: { left: "Casual", right: "Polished" },
  rhythm: { left: "Punchy", right: "Storyteller" },
  energy: { left: "Serious", right: "Playful" },
} as const;

export type PbTone = { formality: number; rhythm: number; energy: number };

export type PbStory = { id: string; text: string };

/** Everything a student types on /pb. One row per signed-in user. */
export type PbProfile = {
  userId: string;
  email: string | null;
  name: string;
  headline: string;
  /** Free text, e.g. "3rd year BBA" or "Final year B.Tech". */
  stage: string;
  market: string;
  relation: string;
  /** What they are aiming for next. */
  goals: string;
  topics: string[];
  stories: PbStory[];
  /** Something they wrote themselves. Used to match rhythm, never copied. */
  writingSample: string;
  tone: PbTone;
  emoji: string;
  lang: string;
  /** Words or phrases they never use. */
  avoid: string;
  linkedinUrl: string;
  /** Anything else they want the writer to know. */
  extra: string;
  createdAt: string;
  updatedAt: string;
};

/** What the /pb form submits. The store clamps and cleans every field. */
export type PbProfileInput = Omit<PbProfile, "userId" | "email" | "createdAt" | "updatedAt">;

export const PB_LIMITS = {
  name: 60,
  headline: 220,
  stage: 80,
  goals: 600,
  story: 700,
  stories: 6,
  writingSample: 5000,
  avoid: 300,
  extra: 800,
  linkedinUrl: 300,
  topics: 10,
  customTopic: 40,
  brief: 2000,
  link: 400,
  postsPerStudent: 3,
  postedUrl: 400,
} as const;

/** held: waiting for staff review. delivered: visible on /pb. removed: hidden everywhere. */
export const PB_POST_STATUSES = ["held", "delivered", "removed"] as const;
export type PbPostStatus = (typeof PB_POST_STATUSES)[number];

export type PbReviewItem = { check: string; pass: boolean; note: string };

/** The last hostile review a post went through before it was saved. Staff only. */
export type PbReview = {
  items: PbReviewItem[];
  verdict: "pass" | "fix";
  /** How many review-and-revise rounds the post took. */
  rounds: number;
};

export const PB_FORMATS = ["story", "lesson", "take", "howto", "behind", "win"] as const;
export type PbFormat = (typeof PB_FORMATS)[number];

export const PB_FORMAT_LABELS: Record<string, string> = {
  story: "Story",
  lesson: "Lessons",
  take: "Hot take",
  howto: "How-to",
  behind: "Behind the scenes",
  win: "Win",
};

/** none: Studojo not mentioned. soft: one mention, no ask. cta: one soft ask, link in first comment. */
export const PB_MENTIONS = [
  { value: "mix", label: "Mix (one post per student mentions Studojo)" },
  { value: "none", label: "No Studojo mention" },
  { value: "soft", label: "Mention in passing" },
  { value: "cta", label: "Mention with a link" },
] as const;

export type PbPost = {
  id: number;
  userId: string;
  runId: number | null;
  body: string;
  /** First line of the body. */
  hook: string;
  /** One line on what the post is about and why it suits this student. Staff only. */
  angle: string;
  format: string;
  mention: string;
  /** For cta posts: the first comment to paste under the post, with the link. */
  firstComment: string | null;
  status: PbPostStatus;
  review: PbReview | null;
  createdAt: string;
  deliveredAt: string | null;
  copiedAt: string | null;
  postedAt: string | null;
  postedUrl: string | null;
};

/** One post as the pipeline hands it to the store. */
export type NewPbPost = {
  body: string;
  hook: string;
  angle: string;
  format: string;
  mention: string;
  firstComment: string | null;
  review: PbReview | null;
};

export const PB_JOB_STATUSES = ["queued", "running", "done", "failed"] as const;
export type PbJobStatus = (typeof PB_JOB_STATUSES)[number];

/** The pipeline's steps, in order, with the label staff see on /pbadmin. */
export const PB_STEPS = {
  queued: "Waiting",
  dossier: "Reading their profile",
  plan: "Planning angles",
  draft: "Writing",
  review: "Reviewing",
  revise: "Revising",
  polish: "Final checks",
  saving: "Saving",
} as const;
export type PbStep = keyof typeof PB_STEPS;

export type PbJob = {
  id: number;
  runId: number;
  userId: string;
  studentName: string;
  status: PbJobStatus;
  step: string | null;
  error: string | null;
  attempts: number;
  postsCreated: number;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};

export type PbRun = {
  id: number;
  brief: string;
  postsPerStudent: number;
  mention: string;
  link: string | null;
  /** now: posts go straight to /pb. hold: staff deliver them from /pbadmin. */
  deliver: "now" | "hold";
  createdBy: string;
  createdAt: string;
  jobs: PbJob[];
};

/** One row of the student list on /pbadmin. */
export type PbStudentRow = {
  userId: string;
  email: string | null;
  name: string;
  headline: string;
  stage: string;
  market: string;
  relation: string;
  topics: string[];
  storiesCount: number;
  hasSample: boolean;
  completeness: number;
  updatedAt: string;
  postsDelivered: number;
  postsHeld: number;
  postsPosted: number;
  lastPostAt: string | null;
  /** Status of the newest job for this student, if one is queued or running. */
  activeJob: PbJobStatus | null;
};

/**
 * How filled-in a profile is, 0 to 100, and what is missing.
 * Stories and a writing sample carry the most weight because they are what
 * make a post sound like this student and nobody else.
 */
export function profileCompleteness(p: Pick<PbProfile, "name" | "headline" | "goals" | "topics" | "stories" | "writingSample">): {
  score: number;
  missing: string[];
} {
  const missing: string[] = [];
  let score = 0;
  if (p.name?.trim()) score += 10;
  else missing.push("name");
  if (p.headline?.trim()) score += 15;
  else missing.push("headline");
  if (p.goals?.trim()) score += 10;
  else missing.push("goals");
  if ((p.topics ?? []).length > 0) score += 10;
  else missing.push("topics");
  const stories = (p.stories ?? []).filter((s) => s.text?.trim()).length;
  score += Math.min(stories, 3) * 12;
  if (stories < 2) missing.push(stories === 0 ? "stories" : "a second story");
  if ((p.writingSample ?? "").trim().length >= 150) score += 19;
  else missing.push("writing sample");
  return { score: Math.min(100, score), missing };
}
