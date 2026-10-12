// Shared bits for the visibility step: the rings, their colours, and the
// plain sentence for who can open the page. Owned by builder B (Your page).
import type { VisibilityState } from "../../types";

export type RingId = "link" | "search" | "managers";

export interface RingDef {
  id: RingId;
  /** Radius in the 400 x 400 viewBox. */
  r: number;
  label: string;
  short: string;
  hex: string;
  tint: string;
}

/** Inner to outer. "You" sits in the middle and is always lit. */
export const RINGS: RingDef[] = [
  { id: "link", r: 92, label: "People with your link", short: "Your link", hex: "#ec4899", tint: "#fbd5e8" },
  { id: "search", r: 138, label: "Search engines", short: "Search", hex: "#14b8a6", tint: "#c9f3ec" },
  { id: "managers", r: 184, label: "Hiring managers we show you to", short: "Hiring managers", hex: "#f59e0b", tint: "#fde9b8" },
];

/** Is this ring actually reaching people right now? */
export function ringLive(v: VisibilityState, id: RingId): boolean {
  if (!v.link || !v.adult) return false;
  return v[id];
}

/** Why a switch cannot be changed right now, or null when it can. */
export function lockReason(v: VisibilityState, approved: boolean, id: RingId): string | null {
  if (id === "link") return null;
  if (!v.link) return "Turn on the link first. A private page stays out of everything.";
  if (id === "search" && !approved) return "Unlocks after you approve your page. Search engines only ever see a page you have checked.";
  if (!v.adult) return "Confirm you are 18 or older first.";
  return null;
}

export function reachSentence(v: VisibilityState): string {
  if (!v.link) return "Only you. Your page is private.";
  if (!v.adult) return "Only you, until you confirm you are 18 or older.";
  const parts = ["people you send the link to"];
  if (v.search) parts.push("anyone who searches your name");
  if (v.managers) parts.push("hiring managers Studojo shows you to");
  if (parts.length === 1) return "Only the people you send the link to.";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}.`.replace(/^p/, "P");
}

/** Short version for the bar hint and the receipt total. */
export function reachShort(v: VisibilityState): string {
  if (!v.link || !v.adult) return "Only you";
  const n = 1 + (v.search ? 1 : 0) + (v.managers ? 1 : 0);
  if (n === 1) return "People with your link";
  return `Your link + ${n - 1} more`;
}
