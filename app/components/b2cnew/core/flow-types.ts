// The contract for scripted agent flows. Group 1 writes FlowSpecs in
// agent/flows/ and lists them in FLOWS; the engine (core/engine.ts) runs them.
// Shared file: owned by the foundation.
import type { B2Dispatch } from "./actions";
import type { AppState, ChatBody, ContextChip, FlowId, FlowInput, MissionId, QuickChip, Run, Skill, TabId } from "../types";

/** What a flow knows when it starts. */
export interface FlowCtx {
  /** The mission the run belongs to (the active one when it started). */
  missionId: MissionId;
  /** From the chip, the tab that asked, the composer context, or names found in the text. */
  input: FlowInput;
  /** The typed text, when the flow was started from the composer. */
  text?: string;
  /** Composer chips at start (mission, tab, focus, attachments). */
  context: ContextChip[];
  /** Answers to `ask` steps, in order. A step's effect sees its own answer last. */
  answers: string[];
}

/** Tools a step effect gets. Effects run when the step finishes (or when its ask is answered). */
export interface Effects {
  dispatch: B2Dispatch;
  /** The latest state (not the state when the run started). */
  get: () => AppState;
  /** Posts a message into the run's mission thread. */
  post: (body: ChatBody) => void;
  /** Violet scanning edge (or a one-time landed glow) on these row ids. Cleared when the run ends. */
  highlight: (ids: string[], kind?: "scanning" | "landed") => void;
  toast: (text: string) => void;
}

export interface StepSpec {
  skill: Skill;
  /** Short verb phrase: "Checked addresses". The run card prints "Scout: checked addresses". */
  label: string;
  /** Short result shown when done: "1 risky dropped". A function reads the state at that moment. */
  detail?: string | ((s: AppState, ctx: FlowCtx) => string | undefined);
  /** How long the step "works" before it completes. 500 to 1,400ms, varied. */
  ms: number;
  /** Changes the workspace. Must only dispatch store actions. */
  effect?: (fx: Effects, s: AppState, ctx: FlowCtx) => void;
  /**
   * Pauses the run with this step at "needs you": Senpai posts the text with
   * the chips, and the run waits. A chip with `answer` (or typed text) resumes
   * it: the answer is pushed to ctx.answers, then effect runs.
   */
  ask?: { text: string; chips: QuickChip[] };
}

export interface FlowSpec {
  id: FlowId;
  /** Unique key. Defaults to id. Day events must set their own ("day7", "day8", ...). */
  key?: string;
  /** Run card title. */
  title: string | ((s: AppState, ctx: FlowCtx) => string);
  triggers: {
    /** Lower-case phrases or regexes matched against typed text. Longest match wins. */
    phrases: (string | RegExp)[];
    /** The suggestion chip label that starts it. */
    chip?: string;
  };
  /** true to run, or a short reason Senpai says instead (with the tab's quick chips). */
  available?: (s: AppState, ctx: FlowCtx) => true | string;
  /** Messages posted before the run starts (a question, a confirm card). */
  intro?: (s: AppState, ctx: FlowCtx) => ChatBody[];
  /** The visible steps. Return [] for a flow that only posts messages (F5, F11). */
  steps: (s: AppState, ctx: FlowCtx) => StepSpec[];
  /** Messages posted after the last step (summary, decision card, why card). */
  done?: (s: AppState, ctx: FlowCtx) => ChatBody[];
  /** Where the result landed. The engine bumps that tab's count and glows the ids once. */
  result?: (s: AppState, ctx: FlowCtx) => Run["result"] | undefined;
  /**
   * Day event: fires once, as a short run, the first time the simulated day
   * reaches `day` (and `when` holds). Its fired key is "event:<key>".
   */
  event?: { day: number; when?: (s: AppState) => boolean };
}

/** What useAgent() returns. */
export interface AgentApi {
  /** Posts the student's text, routes it to a flow, or answers with the tab's quick chips. */
  ask: (text: string, context?: ContextChip[]) => void;
  /** Starts a flow by id (or key). Queues as "Next up" when a run is live in this mission. */
  start: (flowId: FlowId | string, input?: FlowInput) => void;
  /** Handles any QuickChip: flow, action, answer or tab. */
  chip: (c: QuickChip) => void;
  /** Answers the paused step of this mission's live run. Returns false if nothing is waiting. */
  answer: (text: string) => boolean;
  /** Stops a live run (this mission's when no id is given). Steps already done stay done. */
  stop: (runId?: string) => void;
  /** Clears every live run, queue and timer. Call before dispatching RESET. */
  reset: () => void;
  /** Opens the agent (dock on wide screens, slide-over or sheet otherwise), optionally attaching a chip. */
  open: (opts?: { seg?: "chat" | "runs" | "memory"; attach?: ContextChip; focus?: boolean }) => void;
  /** Closes the agent: collapses the dock on wide screens, closes the slide-over or sheet otherwise. */
  close: () => void;
  /** Posts a Senpai note in the active mission's thread (after an instant control, for example). */
  note: (text: string, chips?: QuickChip[]) => void;
  /** Focuses the composer (opening the agent first if needed). */
  focusComposer: () => void;
  /** A run is live in the active mission. */
  busy: boolean;
  /** The live run's current step, for the phone pill and the strip. */
  liveStep: { runId: string; skill: Skill; label: string; index: number; total: number; needsYou: boolean } | null;
  /** Title of the queued run ("Next up"), if any. */
  nextUp: string | null;
  /** Quick chips for a tab (defaults to the current tab). */
  quickChips: (tab?: TabId) => QuickChip[];
  /** Every registered flow. */
  flows: FlowSpec[];
}
