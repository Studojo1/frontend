// Every store action for /b2cnew. Shared file: owned by the foundation.
// Groups dispatch these; they never add their own. Ask for new ones.
//
// `by` (default "you") is who did it. It goes into the activity log.
import type {
  Actor,
  AppState,
  ChatMsg,
  ContextChip,
  DockSeg,
  Draft,
  LogEntry,
  MemoryItem,
  Mission,
  MissionId,
  Notch,
  PackId,
  PageState,
  Person,
  Prep,
  ReplyTag,
  Run,
  RunStep,
  SheetId,
  Stage,
  TabId,
} from "../types";

export type B2Action =
  // Navigation and UI
  | { type: "SET_ENV"; env: MissionId }
  | { type: "SET_TAB"; tab: TabId }
  | { type: "SET_DAY"; day: number }
  /** Opens (id) or closes (null) the person drawer. Mirrors ?p=. */
  | { type: "SELECT"; id: string | null }
  /** What the student is looking at; becomes a composer chip. */
  | { type: "FOCUS"; item: ContextChip | null }
  | { type: "DOCK"; open?: boolean; overlay?: boolean; seg?: DockSeg }
  | { type: "SHEET"; sheet: SheetId | null }
  | { type: "SET_APPROVALS_VIEW"; view: "stack" | "list" }
  // Drafts
  | { type: "APPROVE_DRAFT"; id: string; by?: Actor }
  | { type: "UNAPPROVE_DRAFT"; id: string }
  | { type: "SKIP_DRAFT"; id: string; by?: Actor }
  | { type: "RESTORE_DRAFT"; id: string }
  | { type: "EDIT_DRAFT"; id: string; subject?: string; paragraphs?: string[] }
  /** Senpai proposes a rewrite. The card shows a word diff until APPLY_DIFF. */
  | { type: "PROPOSE_DIFF"; id: string; after: string[] }
  /** keep "after" takes the rewrite, "before" keeps yours. Either way the diff closes. */
  | { type: "APPLY_DIFF"; id: string; keep: "after" | "before" }
  /** Approves pending drafts in order; first emails stop when the pack runs out. Sets its own toast with Undo. */
  | { type: "APPROVE_MANY"; ids: string[]; by?: Actor }
  /** Takes back approvals whose send day has not come yet (the Undo for APPROVE_MANY). */
  | { type: "UNAPPROVE_MANY"; ids: string[] }
  | { type: "ADD_DRAFTS"; drafts: Draft[] }
  // People
  | { type: "ADD_PEOPLE"; people: Person[] }
  | { type: "SET_STAGE"; id: string; stage: Stage; by?: Actor }
  | { type: "SNOOZE"; id: string; until: string; by?: Actor }
  | { type: "NEVER_CONTACT"; id: string; by?: Actor }
  /** Drops unsent drafts for these people. close also moves them to Closed. */
  | { type: "DROP_FROM_QUEUE"; personIds: string[]; close?: boolean; reason?: string; by?: Actor }
  // Replies
  | { type: "SET_REPLY_DRAFT"; id: string; draft: string[] }
  | { type: "SAVE_TO_GMAIL"; id: string }
  | { type: "RETAG"; id: string; tag: ReplyTag }
  | { type: "LOG_OUTCOME"; personId: string; outcome: "interview" | "offer" }
  | { type: "SEE_REPLY"; id: string }
  | { type: "REMIND_REPLY"; id: string; on: string }
  // Prep
  | { type: "ADD_PREP"; prep: Prep }
  | { type: "UPDATE_PREP"; id: string; patch: Partial<Prep> }
  // Page
  | { type: "SET_PAGE"; patch: Partial<PageState>; note?: string; by?: Actor }
  | { type: "UNPUBLISH" }
  | { type: "REPUBLISH" }
  // Mission, sending, Gmail, money
  | { type: "SET_NOTCH"; missionId: MissionId; notch: Notch }
  | { type: "PAUSE_SENDING"; paused: boolean }
  | { type: "DISCONNECT_GMAIL" }
  | { type: "CONNECT_GMAIL" }
  | { type: "TOP_UP"; missionId: MissionId }
  | { type: "FUND_MISSION"; missionId: MissionId; pack: PackId }
  | { type: "CREATE_MISSION"; mission: Mission }
  | { type: "UPDATE_MISSION"; id: MissionId; patch: Partial<Mission>; note?: string }
  // Memory
  | { type: "ADD_MEMORY"; item: MemoryItem; by?: Actor }
  | { type: "UPDATE_MEMORY"; id: string; patch: Partial<MemoryItem> }
  | { type: "FORGET_MEMORY"; id: string }
  // Agent (the engine dispatches these; groups rarely need them)
  | { type: "CHAT_POST"; msg: ChatMsg }
  | { type: "CHAT_UPDATE"; id: string; patch: Partial<ChatMsg> }
  | { type: "RUN_START"; run: Run }
  | { type: "RUN_STEP"; runId: string; index: number; patch: Partial<RunStep> }
  | { type: "RUN_DONE"; runId: string; result?: Run["result"] }
  | { type: "RUN_STOP"; runId: string }
  | { type: "LOG"; entry: Omit<LogEntry, "id" | "day"> & { day?: number } }
  | { type: "HIGHLIGHT"; value: AppState["highlight"] }
  | { type: "SET_PEOPLE_FILTER"; value: AppState["peopleFilter"] }
  | { type: "COMPOSER"; context?: ContextChip[]; draft?: string }
  | { type: "TOAST"; text: string; undo?: B2Action }
  | { type: "CLEAR_TOAST" }
  | { type: "BUMP"; tab: TabId }
  | { type: "FIRE_EVENT"; key: string }
  | { type: "RESET" }
  // Internal: the store uses these for storage and the URL.
  | { type: "HYDRATE"; saved: Partial<AppState> | null; url: Partial<AppState> }
  | { type: "FROM_URL"; patch: Partial<AppState> };

export type B2Dispatch = (a: B2Action) => void;
