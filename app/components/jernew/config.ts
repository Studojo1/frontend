// Step metadata, rail groups and per-group colours for /jernew.
// Shared file: owned by the foundation. Step builders read it, never edit it.
import { STEP_IDS, type GroupId, type StepId } from "./types";

export const STORAGE_KEY = "jernew:v1";

/** Quiz: the project answer needs at least this many characters to count. */
export const QUIZ_MIN_PROJECT_CHARS = 20;

export interface StepMeta {
  id: StepId;
  /** Short station name on the rail. */
  label: string;
  /** Rail group, or null for steps that sit off the rail (intro, mission). */
  group: GroupId | null;
  /** Default primary label if a step never calls useStepBar. */
  primary: string;
}

export const STEP_META: Record<StepId, StepMeta> = {
  intro: { id: "intro", label: "Start", group: null, primary: "Start" },
  upload: { id: "upload", label: "Resume", group: "you", primary: "Continue" },
  quiz: { id: "quiz", label: "Questions", group: "you", primary: "Next" },
  profile: { id: "profile", label: "Review", group: "page", primary: "Approve page" },
  visibility: { id: "visibility", label: "Visibility", group: "page", primary: "Save and continue" },
  matches: { id: "matches", label: "Matches", group: "people", primary: "Continue" },
  email: { id: "email", label: "Emails", group: "people", primary: "Looks good" },
  pack: { id: "pack", label: "Pack", group: "go", primary: "Pay" },
  connect: { id: "connect", label: "Gmail", group: "go", primary: "Connect Gmail" },
  launch: { id: "launch", label: "Launch", group: "go", primary: "Start sending" },
  mission: { id: "mission", label: "Live", group: null, primary: "Done" },
};

export const stepIndex = (id: StepId): number => STEP_IDS.indexOf(id);

export const isStepId = (v: unknown): v is StepId =>
  typeof v === "string" && (STEP_IDS as readonly string[]).includes(v);

export interface GroupMeta {
  id: GroupId;
  label: string;
  steps: StepId[];
}

export const GROUPS: GroupMeta[] = [
  { id: "you", label: "You", steps: ["upload", "quiz"] },
  { id: "page", label: "Your page", steps: ["profile", "visibility"] },
  { id: "people", label: "Your people", steps: ["matches", "email"] },
  { id: "go", label: "Go", steps: ["pack", "connect", "launch"] },
];

/** Steps that appear as stations on the metro rail, in order. */
export const RAIL_STEPS: StepId[] = GROUPS.flatMap((g) => g.steps);

/**
 * Colour per rail group. Full class strings so Tailwind picks them up.
 * solid: fills (dots, active line). tint: soft backgrounds. text: readable
 * text on white. ring: focus or highlight ring.
 */
export const GROUP_STYLE: Record<GroupId, { solid: string; tint: string; text: string; ring: string; hex: string }> = {
  you: {
    solid: "bg-studojo-purple",
    tint: "bg-studojo-purple-bg",
    text: "text-studojo-purple-strong",
    ring: "ring-studojo-purple",
    hex: "#8b5cf6",
  },
  page: {
    solid: "bg-studojo-pink",
    tint: "bg-studojo-pink-bg",
    text: "text-[#be185d]",
    ring: "ring-studojo-pink",
    hex: "#ec4899",
  },
  people: {
    solid: "bg-studojo-orange",
    tint: "bg-studojo-orange-bg",
    text: "text-[#b45309]",
    ring: "ring-studojo-orange",
    hex: "#f59e0b",
  },
  go: {
    solid: "bg-studojo-green",
    tint: "bg-studojo-green-bg",
    text: "text-[#047857]",
    ring: "ring-studojo-green",
    hex: "#10b981",
  },
};

/** Group of a step, falling back to "you" for intro and "go" for mission. */
export function groupOf(id: StepId): GroupId {
  const g = STEP_META[id].group;
  if (g) return g;
  return id === "mission" ? "go" : "you";
}
