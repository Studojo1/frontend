// Constants, labels and colour maps for /b2cnew. Full Tailwind class strings
// so the compiler picks them up. Shared file: owned by the foundation.
import type { IconType } from "react-icons";
import { FiCheckSquare, FiInbox, FiSun, FiUsers, FiFileText, FiBookOpen } from "react-icons/fi";
import type { DockSeg, MissionId, Mission, Notch, QuickChip, SheetId, Skill, Stage, TabId } from "./types";

export const STORAGE_KEY = "b2cnew:v1";

/** Simulated Day 0 is Monday 5 Oct 2026, so the default Day 6 is Sunday 11 Oct 2026. */
export const DAY0_UTC = Date.UTC(2026, 9, 5);
export const DEFAULT_DAY = 6;
export const MAX_DAY = 14;
export const DEFAULT_ENV: MissionId = "jan27";
export const DEFAULT_TAB: TabId = "today";
export const MAX_MISSIONS = 3;

/** Unpublish and other instant controls offer Undo for this long. */
export const UNDO_MS = 10_000;
/** Notch 3 unlocks after this many approvals in a mission. */
export const NOTCH3_UNLOCK = 20;
/** Guardrailed autopilot stops when this many credits are left. */
export const LOW_FUEL_STOP = 10;
/** The fuel gauge turns orange at this many left. */
export const LOW_FUEL_WARN = 25;
/** Credits given back for failed sends (Sample). */
export const GIVEN_BACK = 2;

// ── Copy used in more than one place (keep wording identical) ──────────────

export const COPY = {
  concept: "Concept preview: nothing is sent",
  neverReplies: "Senpai never replies for you. Replies go to your Gmail drafts.",
  approvalCost: "Approving reserves a credit. Skipping costs nothing. If an email fails to send, that credit is given back.",
  noGuarantee: "Replies are not guaranteed. Every reply here is Simulated.",
  paused: "Sending is paused. Nothing goes out until you resume.",
  privatePage: "Your page is private. Follow-ups now go without the link.",
  noFee: "Yours. Hires from your own emails never carry a fee.",
  savedToGmail: "Saved to your Gmail drafts (Simulated). You send it from Gmail.",
  mockPay: "Simulated, nothing charged",
} as const;

// ── Tabs ────────────────────────────────────────────────────────────────────

export interface TabMeta {
  id: TabId;
  label: string;
  /** Number key that opens it (desktop, not while typing). */
  key: string;
  icon: IconType;
  /** On phones these four sit in the bottom bar; page and prep live under More. */
  phoneBar: boolean;
}

export const TABS: TabMeta[] = [
  { id: "today", label: "Today", key: "1", icon: FiSun, phoneBar: true },
  { id: "people", label: "People", key: "2", icon: FiUsers, phoneBar: true },
  { id: "approvals", label: "Approvals", key: "3", icon: FiCheckSquare, phoneBar: true },
  { id: "replies", label: "Replies", key: "4", icon: FiInbox, phoneBar: true },
  { id: "page", label: "Page", key: "5", icon: FiFileText, phoneBar: false },
  { id: "prep", label: "Prep", key: "6", icon: FiBookOpen, phoneBar: false },
];

export const TAB_IDS: TabId[] = TABS.map((t) => t.id);
export const isTabId = (v: unknown): v is TabId => typeof v === "string" && (TAB_IDS as string[]).includes(v);
export const tabMeta = (id: TabId): TabMeta => TABS.find((t) => t.id === id) ?? TABS[0];

export const DOCK_SEGS: { id: DockSeg; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "runs", label: "Runs" },
  { id: "memory", label: "Memory" },
];
export const isDockSeg = (v: unknown): v is DockSeg => v === "chat" || v === "runs" || v === "memory";

export const SHEET_IDS: SheetId[] = ["lever", "wallet", "mission", "switcher", "more", "gmail"];
export const isSheetId = (v: unknown): v is SheetId => typeof v === "string" && (SHEET_IDS as string[]).includes(v);

// ── Skills (run step chips) ─────────────────────────────────────────────────

export interface SkillStyle {
  label: string;
  /** One line on what it does, for tooltips and the Runs filter. */
  does: string;
  solid: string;
  tint: string;
  text: string;
  hex: string;
}

export const SKILL_STYLE: Record<Skill, SkillStyle> = {
  scout: { label: "Scout", does: "Finds named managers and checks addresses", solid: "bg-studojo-orange", tint: "bg-studojo-orange-bg", text: "text-[#92400e]", hex: "#f59e0b" },
  write: { label: "Write", does: "Drafts emails from facts with evidence", solid: "bg-studojo-purple", tint: "bg-studojo-purple-bg", text: "text-studojo-purple-strong", hex: "#8b5cf6" },
  send: { label: "Send", does: "Paces sends inside the daily cap", solid: "bg-studojo-teal", tint: "bg-[#ccfbf1]", text: "text-[#0f766e]", hex: "#14b8a6" },
  inbox: { label: "Inbox", does: "Tags replies, saves reply drafts to Gmail drafts", solid: "bg-studojo-pink", tint: "bg-studojo-pink-bg", text: "text-[#be185d]", hex: "#ec4899" },
  coach: { label: "Coach", does: "Prep packs, practice and page edits", solid: "bg-studojo-green", tint: "bg-studojo-green-bg", text: "text-[#047857]", hex: "#10b981" },
};
export const SKILLS: Skill[] = ["scout", "write", "send", "inbox", "coach"];

// ── Missions ────────────────────────────────────────────────────────────────

export const MISSION_ACCENT: Record<Mission["accent"], { solid: string; tint: string; text: string; ring: string; border: string; hex: string }> = {
  purple: { solid: "bg-studojo-purple", tint: "bg-studojo-purple-bg", text: "text-studojo-purple-strong", ring: "ring-studojo-purple", border: "border-studojo-purple", hex: "#8b5cf6" },
  teal: { solid: "bg-studojo-teal", tint: "bg-[#ccfbf1]", text: "text-[#0f766e]", ring: "ring-studojo-teal", border: "border-studojo-teal", hex: "#14b8a6" },
  pink: { solid: "bg-studojo-pink", tint: "bg-studojo-pink-bg", text: "text-[#be185d]", ring: "ring-studojo-pink", border: "border-studojo-pink", hex: "#ec4899" },
};

export const MISSION_STATUS_LABEL: Record<Mission["status"], string> = {
  running: "Running",
  draft: "Draft",
  ready: "Ready",
  paused: "Paused",
};

export const isMissionId = (v: unknown): v is MissionId => v === "jan27" || v === "ft27" || v === "m3";

// ── Autopilot notches ───────────────────────────────────────────────────────

export const NOTCHES: { n: Notch; name: string; may: string }[] = [
  { n: 1, name: "Ask me", may: "Find and draft. Every email, follow-ups included, waits for your tap." },
  { n: 2, name: "Batch", may: "Approve a whole run in one tap. Follow-ups and the last nudge to people you approved go on schedule." },
  { n: 3, name: "Guardrailed autopilot", may: "First emails to people above your fit floor send inside the daily cap." },
];
export const notchMeta = (n: Notch) => NOTCHES[n - 1];

/** Notch 3 guardrails, in the order they unfold. */
export const GUARDRAILS: string[] = [
  "Only people above your fit floor (75, Sample)",
  "Never more than the daily send cap",
  "Stops when 10 credits are left",
  "Never your never-contact list, or a Not now company before its date",
  "Pauses a thread the moment anyone replies",
  "Pauses itself after 2 bounces in a day",
  "A digest every night of what went out",
];

// ── Stages ──────────────────────────────────────────────────────────────────

export const STAGES: { id: Stage; label: string; tint: string; text: string }[] = [
  { id: "matched", label: "Matched", tint: "bg-white", text: "text-studojo-ink" },
  { id: "approved", label: "Approved", tint: "bg-studojo-purple-bg", text: "text-studojo-purple-strong" },
  { id: "contacted", label: "Contacted", tint: "bg-[#ccfbf1]", text: "text-[#0f766e]" },
  { id: "replied", label: "Replied", tint: "bg-studojo-pink-bg", text: "text-[#be185d]" },
  { id: "interview", label: "Interview", tint: "bg-studojo-green-bg", text: "text-[#047857]" },
  { id: "offer", label: "Offer", tint: "bg-studojo-yellow-bg", text: "text-[#854d0e]" },
  { id: "later", label: "Later", tint: "bg-studojo-orange-bg", text: "text-[#92400e]" },
  { id: "closed", label: "Closed", tint: "bg-studojo-surface-muted", text: "text-studojo-muted" },
];
export const stageMeta = (id: Stage) => STAGES.find((s) => s.id === id) ?? STAGES[0];

// ── Quick chips per tab (composer and the unmatched-text answer) ───────────

export const QUICK_CHIPS: Record<TabId, QuickChip[]> = {
  today: [{ label: "What happened?", flow: "F1" }, { label: "Review 12 drafts", flow: "F2" }],
  people: [{ label: "Find 10 more like Kitebase", flow: "F6" }, { label: "Why this person?", flow: "F5" }],
  approvals: [{ label: "Make this warmer", flow: "F7" }, { label: "Review 12 drafts", flow: "F2" }],
  replies: [{ label: "Answer Karan", flow: "F3" }, { label: "Say yes to Kitebase and prep me", flow: "F4" }],
  page: [{ label: "Make my headline punchier", flow: "F9" }, { label: "Who opened my page?", flow: "F10" }],
  prep: [{ label: "Practise 3 questions", flow: "F12" }],
};
