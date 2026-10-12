// Types for the /jernew concept flow (the remade B2C Outreach onboarding).
// Shared file: owned by the foundation. Step builders import from here and do
// not edit it.

/** Every step, in flow order. The URL carries one of these as ?step=id. */
export const STEP_IDS = [
  "intro",
  "upload",
  "quiz",
  "profile",
  "visibility",
  "matches",
  "email",
  "pack",
  "connect",
  "launch",
  "mission",
] as const;

export type StepId = (typeof STEP_IDS)[number];

/** 1 = moving forward through the flow, -1 = moving back. */
export type Direction = 1 | -1;

/** The four groups on the metro rail. Intro and mission sit off the rail. */
export type GroupId = "you" | "page" | "people" | "go";

// ── Quiz ───────────────────────────────────────────────────────────────────

export type RoleId =
  | "sde"
  | "frontend"
  | "data"
  | "product"
  | "growth"
  | "ml"
  | "cloud"
  | "design";

export type CityId = "bengaluru" | "hyderabad" | "pune" | "mumbai" | "delhi" | "chennai" | "kolkata";

export type JobType = "internship" | "fulltime" | "either";

export type Tone = "direct" | "warm" | "bold";

/** Company stage slider stop: 0 = tiny startup to 4 = large company. */
export type StageStop = 0 | 1 | 2 | 3 | 4;

export interface QuizAnswers {
  role: RoleId | null;
  cities: CityId[];
  remote: boolean;
  jobType: JobType | null;
  /** One of START_MONTHS[].id, for example "2027-01", or "flexible". */
  startMonth: string | null;
  stage: StageStop | null;
  /** Free text: the student's best project in a sentence or two. */
  project: string;
  tone: Tone | null;
  /** Index of the question card currently showing (0 to QUIZ_QUESTIONS.length - 1). */
  card: number;
}

// ── Resume ─────────────────────────────────────────────────────────────────

export type ResumeSource = "none" | "sample" | "file";

export interface ResumeState {
  source: ResumeSource;
  /** Name of the file the student dropped. The file itself is never read or sent. */
  fileName: string | null;
  /** True once the scanner has finished and the facts are in their slots. */
  scanned: boolean;
}

// ── Profile page ───────────────────────────────────────────────────────────

/** Ids of the profile-strength checklist items (see PROFILE_CHECKS in data.ts). */
export type ProfileCheckId = "number" | "college-email" | "headline" | "about";

export interface ProfileState {
  /** Starts as PROFILE_DRAFT.headline; inline edits overwrite it. */
  headline: string;
  /** Starts as PROFILE_DRAFT.about; inline edits overwrite it. */
  about: string;
  /** Checklist items the student has done. */
  checks: Partial<Record<ProfileCheckId, boolean>>;
  /** Mock OTP for the college email went through. */
  collegeVerified: boolean;
  /** The student pressed Approve and the stamp landed. */
  approved: boolean;
}

// ── Visibility and consent ─────────────────────────────────────────────────

export interface VisibilityState {
  /** Anyone with the link can open the page. On by default. */
  link: boolean;
  /** Show in search engines. Only allowed once the page is approved. */
  search: boolean;
  /** Let Studojo show me to hiring managers. Off by default. */
  managers: boolean;
  /** "I am 18 or older". Needed for a public link, otherwise the page stays private. */
  adult: boolean;
}

// ── Packs and Gmail ────────────────────────────────────────────────────────

export type PackId = "free" | "starter" | "standard" | "pro";

export interface GmailState {
  connected: boolean;
  /** Sample address shown once connected. */
  address: string;
}

// ── Mission control ────────────────────────────────────────────────────────

export interface MissionState {
  /** Time scrubber position, Day 0 to Day 14 (MISSION_DAYS). */
  day: number;
  interview: boolean;
  offer: boolean;
  toppedUp: boolean;
  unpublished: boolean;
  /** Ids of SIM_REPLIES the student has opened or dismissed. */
  seenReplies: string[];
}

// ── Your people (matches and email) ────────────────────────────────────────

export interface PeopleState {
  /** The match the sample email is written to. Null means the best fit. */
  recipientId: string | null;
  /** The radar sweep has played once (it does not replay on return). */
  swept: boolean;
  /** The envelope has opened once (coming back shows the email straight away). */
  envelopeOpened: boolean;
}

// ── The whole flow ─────────────────────────────────────────────────────────

/** Everything the student has told or done. Persisted to localStorage. */
export interface FlowData {
  resume: ResumeState;
  quiz: QuizAnswers;
  profile: ProfileState;
  visibility: VisibilityState;
  people: PeopleState;
  pack: PackId | null;
  /** The mock Pay succeeded. Nothing is charged. */
  paid: boolean;
  gmail: GmailState;
  /** "Start sending" was pressed on the launch step. */
  launched: boolean;
  mission: MissionState;
}

/** Keys of FlowData whose values are objects and can be shallow-merged with update(). */
export type FlowSlice = "resume" | "quiz" | "profile" | "visibility" | "people" | "gmail" | "mission";

/** Full reducer state: the data plus where the student is. */
export interface FlowState {
  data: FlowData;
  step: StepId;
  direction: Direction;
  /** Highest step index ever reached with next(). Rail jumps never pass it. */
  reached: number;
  /** Counts step changes this session; 0 means first paint (no focus steal). */
  navCount: number;
  /** How the next URL sync should write history. */
  navKind: "push" | "replace";
  /** True once localStorage has been read (client only). */
  ready: boolean;
  /** Set when a saved session exists and the student landed on intro. */
  resumeOffer: StepId | null;
}

// ── Bottom action bar ──────────────────────────────────────────────────────

export interface BarConfig {
  /** Primary button text, for example "Continue" or "Approve page". */
  label: string;
  /** Greys out the primary button. A click then shakes it and announces disabledHint. */
  disabled?: boolean;
  /** Short reason shown and announced when the primary is pressed while disabled. */
  disabledHint?: string;
  /** Small helper text beside the buttons. Hidden on phones unless hintOnPhone is set. */
  hint?: string;
  /** Also show the hint on phones, as a one-line row above the buttons (use it for honesty lines). */
  hintOnPhone?: boolean;
  /** Runs instead of next(). Call next() yourself when you are done. */
  onPrimary?: () => void;
  /** Optional second action shown left of the primary, for example "Skip". */
  secondary?: { label: string; onClick: () => void };
  /** Hide Back for this step (intro hides it automatically). */
  hideBack?: boolean;
  /** Hide the whole bar (intro uses this: its Start button is in the hero). */
  hidden?: boolean;
  /** Set false to stop Enter from pressing the primary on this step. */
  enterToContinue?: boolean;
  /** Primary button colour. Defaults to "primary" (violet). */
  tone?: "primary" | "dark" | "green";
}
