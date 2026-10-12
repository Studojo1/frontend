// Types for /b2cnew, the day-to-day app after /jernew onboarding.
// Shared file: owned by the foundation. Group builders import, never edit.
// Need a new field or action? Ask the foundation.
import type { PackId, QuizAnswers, VisibilityState } from "../jernew/types";
import type { ReplyTag } from "../jernew/data";
// The action union lives in core/actions.ts; re-exported here for convenience.
import type { B2Action } from "./core/actions";

export type { B2Action, PackId, QuizAnswers, ReplyTag, VisibilityState };

export type MissionId = "jan27" | "ft27" | "m3";
export type TabId = "today" | "people" | "approvals" | "replies" | "page" | "prep";
export type DockSeg = "chat" | "runs" | "memory";
export type SheetId = "lever" | "wallet" | "mission" | "switcher" | "more" | "gmail";
export type Notch = 1 | 2 | 3;
export type Skill = "scout" | "write" | "send" | "inbox" | "coach";
export type Stage = "matched" | "approved" | "contacted" | "replied" | "interview" | "offer" | "later" | "closed";
export type FlowId =
  | "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7" | "F8" | "F9" | "F10" | "F11" | "F12" | "F13" | "F14" | "event" | "cant";
export type Actor = "you" | "senpai" | "gmail";

/** Something the agent is told about: shown as a chip in the composer and passed to flows. */
export interface ContextChip {
  kind: "mission" | "tab" | "person" | "draft" | "reply" | "claim" | "prep";
  id: string;
  label: string;
}

/** Extra input a chip or a tab hands to a flow. Every field is optional. */
export interface FlowInput {
  personId?: string;
  draftId?: string;
  replyId?: string;
  claimId?: string;
  prepId?: string;
  /** A choice the student tapped, for flows that branch (F8, F11, F14, events). */
  choice?: string;
  /** Free value, for example a notch number for F11 or a city for F8. */
  value?: string | number;
}

/** A tappable suggestion in the chat or the composer. Exactly one of flow, action, answer or tab does the work. */
export interface QuickChip {
  label: string;
  /** Starts this flow. */
  flow?: FlowId;
  /** Extra input for that flow. */
  input?: FlowInput;
  /** Dispatches this store action instead. */
  action?: B2Action;
  /** Answers a paused run (a step with `ask`). */
  answer?: string;
  /** Opens this tab. */
  tab?: TabId;
  tone?: "primary" | "plain";
}

export interface Mission {
  id: MissionId;
  name: string;
  /** Short name for chips and the phone top bar. */
  short: string;
  accent: "purple" | "teal" | "pink";
  status: "running" | "draft" | "ready" | "paused";
  target: QuizAnswers;
  pack: PackId | null;
  toppedUp: boolean;
  /** Outreaches bought for this mission (pack plus top-ups). 0 when unfunded. */
  total: number;
  notch: Notch;
  /** Drafts approved in this mission. Notch 3 unlocks at 20. */
  approvals: number;
  /** Claim ids (PROFILE_DRAFT.claims) in lens order: these lead the page opened from this mission. */
  lens: string[];
  fitFloor: number;
  /** Person ids or company names that must never be emailed. */
  neverContact: string[];
}

export interface Person {
  id: string;
  missionId: MissionId;
  /** MATCHES id when the person is one of the twelve jernew matches. */
  matchId?: string;
  first: string;
  last: string;
  title: string;
  company: string;
  /** What the company does, in a phrase that reads inside a sentence. */
  hook: string;
  sector: string;
  city: string;
  /** Company stage label, for example "Seed". */
  stageLabel: string;
  fit: number;
  why: string;
  /** RESUME_LINES ids that back the why. */
  evidence: string[];
  /** Stored stage. Read the effective stage with stageOf() in core/derive.ts. */
  stage: Stage;
  address: "verified" | "risky";
  /** Simulated day the first email went (contacted people). */
  firstDay?: number;
  /** Simulated day they opened the page from a follow-up. */
  pageOpenedDay?: number;
  /** Shown in Coming up, for example "Apr 2027". */
  snoozeUntil?: string;
  source: "match" | "extra" | "found";
  /** Role they are hiring for, in their words. */
  hiringFor: string;
}

export interface Draft {
  id: string;
  personId: string;
  missionId: MissionId;
  kind: "first" | "follow" | "nudge";
  subject: string;
  paragraphs: string[];
  signoff: string;
  /** Phrases inside the paragraphs that come from a resume line. Underline them. */
  evidence: { phrase: string; lineId: string }[];
  status: "pending" | "approved" | "skipped" | "dropped";
  runId?: string;
  /** A rewrite waiting for Approve or Keep mine. `after` replaces paragraphs on APPLY_DIFF. */
  diff?: { before: string[]; after: string[] };
  /** Simulated day it goes out once approved. */
  slotDay?: number;
}

export interface ReplyState {
  /** SIM_REPLIES id. */
  id: string;
  personId: string;
  tag: ReplyTag;
  /** Senpai's draft reply, two to four lines. */
  draft?: string[];
  savedToGmail: boolean;
  outcome?: "interview" | "offer";
  seen: boolean;
  remindOn?: string;
}

export interface Prep {
  id: string;
  personId: string;
  when: string;
  brief: string;
  said: string;
  questions: { q: string; lineId: string }[];
  story: string;
  askBack: string[];
  checks: Record<string, boolean>;
  feedback?: string;
  outcome?: string;
}

export interface MemoryItem {
  id: string;
  kind: "fact" | "rule";
  text: string;
  scope: "shared" | MissionId;
  source: { kind: "resume" | "quiz" | "chat" | "reply"; label: string; lineId?: string };
  /** pinned = backed by a resume line or quiz answer. your-word = only said in chat; never used in emails. */
  proof: "pinned" | "your-word";
  useInEmails: boolean;
}

export interface RunStep {
  skill: Skill;
  label: string;
  detail?: string;
  status: "waiting" | "running" | "done" | "needs-you";
}

export interface Run {
  id: string;
  flowId: FlowId;
  missionId: MissionId;
  title: string;
  steps: RunStep[];
  status: "running" | "done" | "stopped";
  /** Stopped because the page reloaded mid-run, not by you. */
  interrupted?: boolean;
  day: number;
  result?: { label: string; tab: TabId; ids: string[] };
}

type ChatBase = { id: string; missionId: MissionId; day: number };
/** One message kind, without the fields the engine fills in (id, missionId, day). */
export type ChatBody =
  | { kind: "you"; text: string; context: ContextChip[] }
  | { kind: "senpai"; text: string; chips?: QuickChip[] }
  | { kind: "run"; runId: string }
  /** `drafts`: the draft ids a "Review now?" card is about, so it can settle itself once none are pending. */
  | { kind: "decision"; text: string; actions: QuickChip[]; resolved?: string; drafts?: string[] }
  | { kind: "memory"; item: MemoryItem; status: "proposed" | "saved" | "declined" }
  | { kind: "why"; personId: string }
  | { kind: "diff"; target: "draft" | "page"; refId: string; resolved?: string }
  | { kind: "divider"; text: string };
export type ChatMsg = ChatBase & ChatBody;

export interface LogEntry {
  id: string;
  day: number;
  actor: Actor;
  missionId: MissionId;
  text: string;
  skill?: Skill;
  /** An action that reverses this entry, while it is still unsent. */
  undo?: B2Action;
}

export interface PageState {
  live: boolean;
  headline: string;
  about: string;
  visibility: VisibilityState;
  /** A headline Senpai proposed, waiting for Approve (F9). */
  pendingHeadline?: string;
  /** Claim text overrides by claim id (evidence-checked edits). */
  claimText: Record<string, string>;
}

export interface AppState {
  /** False on the server and first client frame; true once storage and URL are read. */
  ready: boolean;
  env: MissionId;
  tab: TabId;
  /** Simulated day, 0 to 14. Default 6 (Sunday 11 Oct 2026). */
  day: number;
  /** Person whose drawer is open (?p=). */
  selected: string | null;
  /** The thing the student is looking at in the workspace. Becomes a composer chip. */
  focus: ContextChip | null;
  /** open: docked panel on wide screens. overlay: slide-over or phone sheet. */
  dock: { open: boolean; overlay: boolean; seg: DockSeg };
  sheet: SheetId | null;
  missions: Mission[];
  people: Person[];
  drafts: Draft[];
  replies: ReplyState[];
  preps: Prep[];
  memory: MemoryItem[];
  runs: Run[];
  chat: ChatMsg[];
  log: LogEntry[];
  page: PageState;
  gmail: { connected: boolean; address: string; paused: boolean };
  /** Keys of one-time events already fired (day events, F1 per day). */
  firedEvents: string[];
  highlight: { ids: string[]; kind: "scanning" | "landed" } | null;
  peopleFilter: { label: string; ids: string[] } | null;
  composer: { context: ContextChip[]; draft: string };
  toast: { id: number; text: string; undo?: B2Action } | null;
  /** Bumps a tab's count badge when a run lands results there. */
  bump: { tab: TabId; key: number } | null;
  /** Approvals view. */
  approvalsView: "stack" | "list";
  /** Counter the reducer uses for ids (log entries, toasts). */
  seq: number;
}
