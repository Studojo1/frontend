// Pure state for /jernew: initial data, completion guards, the reducer and
// the localStorage helpers. No React here, so it is easy to reason about.
// Shared file: owned by the foundation.
import { STEP_IDS, type FlowData, type FlowSlice, type FlowState, type StepId } from "./types";
import { isStepId, stepIndex, STORAGE_KEY } from "./config";
import {
  CITIES,
  GMAIL_SAMPLE_ADDRESS,
  isQuizComplete,
  JOB_TYPES,
  MATCHES,
  MISSION_DAYS,
  PACKS,
  PROFILE_CHECKS,
  PROFILE_DRAFT,
  QUIZ_QUESTIONS,
  ROLES,
  SIM_REPLIES,
  START_MONTHS,
  TONES,
} from "./data";

export function initialData(): FlowData {
  return {
    resume: { source: "none", fileName: null, scanned: false },
    quiz: {
      role: null,
      cities: [],
      remote: false,
      jobType: null,
      startMonth: null,
      stage: null,
      project: "",
      tone: null,
      card: 0,
    },
    profile: {
      headline: PROFILE_DRAFT.headline,
      about: PROFILE_DRAFT.about,
      checks: {},
      collegeVerified: false,
      approved: false,
    },
    visibility: { link: true, search: false, managers: false, adult: false },
    people: { recipientId: null, swept: false, envelopeOpened: false },
    pack: null,
    paid: false,
    gmail: { connected: false, address: GMAIL_SAMPLE_ADDRESS },
    launched: false,
    mission: { day: 0, interview: false, offer: false, toppedUp: false, unpublished: false, seenReplies: [] },
  };
}

export function initialState(step: StepId = "intro"): FlowState {
  return {
    data: initialData(),
    step,
    direction: 1,
    reached: 0,
    navCount: 0,
    navKind: "replace",
    ready: false,
    resumeOffer: null,
  };
}

/** Is this step done, so the student may move past it? */
export function isComplete(d: FlowData, id: StepId): boolean {
  switch (id) {
    case "intro":
      return true;
    case "upload":
      return d.resume.scanned;
    case "quiz":
      return isQuizComplete(d.quiz);
    case "profile":
      return d.profile.approved;
    case "visibility":
      // A public link needs the 18+ confirmation; a private page does not.
      return !d.visibility.link || d.visibility.adult;
    case "matches":
    case "email":
      return true;
    case "pack":
      return d.pack !== null && (d.pack === "free" || d.paid);
    case "connect":
      return d.gmail.connected || d.pack === "free";
    case "launch":
      return d.launched;
    case "mission":
      return true;
  }
}

/** Highest step index the student may open right now. */
export function maxReachable(s: Pick<FlowState, "data" | "reached">): number {
  let i = 0;
  while (i < s.reached && i < STEP_IDS.length - 1 && isComplete(s.data, STEP_IDS[i])) i++;
  return i;
}

export const canReach = (s: Pick<FlowState, "data" | "reached">, id: StepId) => stepIndex(id) <= maxReachable(s);

/**
 * The step after this one. Free sends nothing, so it skips the Gmail step:
 * pack goes straight to launch.
 */
export function nextStepOf(d: FlowData, step: StepId): StepId | null {
  const i = stepIndex(step);
  if (i >= STEP_IDS.length - 1) return null;
  const next = STEP_IDS[i + 1];
  return next === "connect" && d.pack === "free" ? "launch" : next;
}

/** The step before this one, with the same Free skip as nextStepOf. */
export function prevStepOf(d: FlowData, step: StepId): StepId | null {
  const i = stepIndex(step);
  if (i <= 0) return null;
  const prev = STEP_IDS[i - 1];
  return prev === "connect" && d.pack === "free" ? "pack" : prev;
}

export type Action =
  | { type: "next" }
  | { type: "back"; kind?: "push" | "replace" }
  | { type: "goto"; step: StepId; kind?: "push" | "replace" }
  | { type: "fromUrl"; step: StepId }
  | { type: "update"; slice: FlowSlice; patch: Record<string, unknown> }
  | { type: "set"; patch: Partial<FlowData> }
  | { type: "hydrate"; saved: SavedFlow | null; urlStep: StepId }
  | { type: "acceptResume" }
  | { type: "dismissResume" }
  | { type: "reset" };

function moveTo(s: FlowState, step: StepId, kind: "push" | "replace" = "push"): FlowState {
  if (step === s.step) return s;
  const to = stepIndex(step);
  return {
    ...s,
    step,
    direction: to >= stepIndex(s.step) ? 1 : -1,
    reached: Math.max(s.reached, to),
    navCount: s.navCount + 1,
    navKind: kind,
    resumeOffer: null,
  };
}

export function reducer(s: FlowState, a: Action): FlowState {
  switch (a.type) {
    case "next": {
      const to = nextStepOf(s.data, s.step);
      if (!to || !isComplete(s.data, s.step)) return s;
      return moveTo(s, to);
    }
    case "back": {
      const to = prevStepOf(s.data, s.step);
      return to ? moveTo(s, to, a.kind) : s;
    }
    case "goto":
      return canReach(s, a.step) ? moveTo(s, a.step, a.kind) : s;
    case "fromUrl": {
      // Browser back or forward. Clamp to what is reachable, and fix the URL if we had to.
      const allowed = canReach(s, a.step) ? a.step : STEP_IDS[maxReachable(s)];
      const next = moveTo(s, allowed, "replace");
      return allowed === a.step ? { ...next, navKind: "push" } : next;
    }
    case "update":
      return { ...s, data: { ...s.data, [a.slice]: { ...s.data[a.slice], ...a.patch } } };
    case "set":
      return { ...s, data: { ...s.data, ...a.patch } };
    case "hydrate": {
      const base: FlowState = { ...s, ready: true };
      if (!a.saved) return a.urlStep === "intro" ? base : { ...base, step: "intro", navKind: "replace" };
      const withData: FlowState = { ...base, data: a.saved.data, reached: a.saved.reached };
      if (a.urlStep === "intro") {
        const offer = a.saved.step !== "intro" && canReach(withData, a.saved.step) ? a.saved.step : null;
        return { ...withData, resumeOffer: offer };
      }
      const step = canReach(withData, a.urlStep) ? a.urlStep : STEP_IDS[maxReachable(withData)];
      return { ...withData, step, navKind: "replace" };
    }
    case "acceptResume":
      return s.resumeOffer ? moveTo(s, s.resumeOffer) : s;
    case "dismissResume":
      return { ...s, resumeOffer: null };
    case "reset":
      return { ...initialState("intro"), ready: true, navCount: s.navCount + 1, direction: -1, navKind: "push" };
  }
}

// ── Persistence ─────────────────────────────────────────────────────────────

export interface SavedFlow {
  v: 1;
  data: FlowData;
  step: StepId;
  reached: number;
}

/** Reads the saved flow. Returns null on any problem, including storage that throws. */
export function readSaved(): SavedFlow | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedFlow>;
    if (parsed?.v !== 1 || !parsed.data || !isStepId(parsed.step)) return null;
    // Merge over fresh defaults so a save from an older shape still loads,
    // then check every field so a stale or hand-edited save cannot crash a step.
    const data = sanitize(parsed.data as Partial<FlowData>);
    const reached = Math.max(0, Math.min(STEP_IDS.length - 1, Number(parsed.reached) || 0));
    return { v: 1, data, step: parsed.step, reached };
  } catch {
    return null;
  }
}

const oneOf = <T>(v: unknown, ok: readonly T[], fallback: T): T => (ok.includes(v as T) ? (v as T) : fallback);
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
const str = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);
const int = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : fallback;
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const listOf = <T>(v: unknown, ok: readonly T[]): T[] => (Array.isArray(v) ? (v.filter((x) => ok.includes(x as T)) as T[]) : []);

/** Rebuilds FlowData from a saved blob, keeping only values that are valid today. */
function sanitize(raw: Partial<FlowData>): FlowData {
  const fresh = initialData();
  const r = obj(raw.resume);
  const q = obj(raw.quiz);
  const p = obj(raw.profile);
  const v = obj(raw.visibility);
  const pe = obj(raw.people);
  const g = obj(raw.gmail);
  const ms = obj(raw.mission);
  const checks = obj(p.checks);
  const stage = q.stage === null ? null : int(q.stage, 0, 4, -1);
  return {
    resume: {
      source: oneOf(r.source, ["none", "sample", "file"] as const, fresh.resume.source),
      fileName: typeof r.fileName === "string" ? r.fileName : null,
      scanned: bool(r.scanned, false),
    },
    quiz: {
      role: oneOf(q.role, [null, ...ROLES.map((x) => x.id)], null),
      cities: listOf(q.cities, CITIES.map((x) => x.id)),
      remote: bool(q.remote, false),
      jobType: oneOf(q.jobType, [null, ...JOB_TYPES.map((x) => x.id)], null),
      startMonth: oneOf(q.startMonth, [null, ...START_MONTHS.map((x) => x.id)], null),
      stage: stage === null || stage < 0 ? null : (stage as 0 | 1 | 2 | 3 | 4),
      project: str(q.project, "").slice(0, 400),
      tone: oneOf(q.tone, [null, ...TONES.map((x) => x.id)], null),
      card: int(q.card, 0, QUIZ_QUESTIONS.length - 1, 0),
    },
    profile: {
      headline: str(p.headline, fresh.profile.headline),
      about: str(p.about, fresh.profile.about),
      checks: Object.fromEntries(PROFILE_CHECKS.filter((c) => checks[c.id] === true).map((c) => [c.id, true])),
      collegeVerified: bool(p.collegeVerified, false),
      approved: bool(p.approved, false),
    },
    visibility: {
      link: bool(v.link, fresh.visibility.link),
      search: bool(v.search, false),
      managers: bool(v.managers, false),
      adult: bool(v.adult, false),
    },
    people: {
      recipientId: oneOf(pe.recipientId, [null, ...MATCHES.map((x) => x.id)], null),
      swept: bool(pe.swept, false),
      envelopeOpened: bool(pe.envelopeOpened, false),
    },
    pack: oneOf(raw.pack, [null, ...PACKS.map((x) => x.id)], null),
    paid: bool(raw.paid, false),
    gmail: { connected: bool(g.connected, false), address: str(g.address, fresh.gmail.address) },
    launched: bool(raw.launched, false),
    mission: {
      day: int(ms.day, 0, MISSION_DAYS, 0),
      interview: bool(ms.interview, false),
      offer: bool(ms.offer, false),
      toppedUp: bool(ms.toppedUp, false),
      unpublished: bool(ms.unpublished, false),
      seenReplies: listOf(ms.seenReplies, SIM_REPLIES.map((x) => x.id)),
    },
  };
}

export function writeSaved(s: FlowState): void {
  try {
    const saved: SavedFlow = { v: 1, data: s.data, step: s.step, reached: s.reached };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Storage full, blocked or private mode: the flow still works, it just will not remember.
  }
}

export function clearSaved(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
