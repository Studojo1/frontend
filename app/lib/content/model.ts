/**
 * Types and constants shared by the /content server code and its components.
 *
 * Separate from store.server.ts on purpose: a route component that imports a
 * value (not just a type) from a .server module pulls the whole server module
 * into the client bundle, and React Router fails the build for it. Types erase,
 * POST_STATUSES does not.
 */

export type ContentAccount = {
  id: number;
  handle: string;
  platform: string;
  displayName: string;
  persona: string | null;
  audience: string | null;
  notes: string | null;
  accent: string;
  active: boolean;
};

export type PlaybookEntry = {
  id: number;
  kind: string;
  title: string;
  body: string;
  includeInPrompt: boolean;
  updatedAt: string;
};

export type ContentIdea = {
  id: number;
  accountId: number | null;
  accountHandle: string | null;
  title: string;
  angle: string | null;
  hook: string | null;
  whyItWorks: string | null;
  pillar: string | null;
  status: string;
  source: string;
  createdAt: string;
};

export type ContentPost = {
  id: number;
  accountId: number | null;
  accountHandle: string | null;
  accountAccent: string | null;
  ideaId: number | null;
  title: string;
  body: string;
  status: string;
  scheduledFor: string | null;
  scheduledWhere: string | null;
  postedAt: string | null;
  notes: string | null;
  updatedAt: string;
};

/** The statuses a post moves through. Track only: nothing here posts for you. */
export const POST_STATUSES = [
  "idea",
  "drafted",
  "ready",
  "scheduled",
  "posted",
] as const;

export const IDEA_STATUSES = ["new", "kept", "drafted", "binned"] as const;

export const PLAYBOOK_KINDS = [
  { value: "ideation", label: "How to ideate" },
  { value: "writing", label: "How to write" },
  { value: "skills", label: "Skills and topics" },
  { value: "examples", label: "Example posts" },
  { value: "reference", label: "Reference" },
] as const;

export const PLATFORMS = [
  "linkedin",
  "x",
  "instagram",
  "youtube",
  "newsletter",
  "other",
] as const;

/**
 * The studio works in IST, everywhere, on purpose.
 *
 * The cluster runs UTC and a browser runs whatever the laptop is set to. A
 * datetime-local input has no timezone at all, so "2026-09-25T10:30" typed by
 * someone in Bengaluru would be stored as 10:30 UTC, which the calendar would
 * then show as 16:00. Both directions are pinned to Asia/Kolkata instead, so a
 * slot means the same thing no matter who opened the page or where the pod is.
 */
export const CONTENT_TZ = "Asia/Kolkata";
const IST_OFFSET = "+05:30";

/** "2026-09-25T10:30" typed as IST wall time, to a real instant. */
export function istInputToIso(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  const match = v.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2})?$/);
  if (!match) return null;
  return `${match[1]}T${match[2]}:00${IST_OFFSET}`;
}

/** An instant back to the "YYYY-MM-DDTHH:mm" an IST datetime-local expects. */
export function isoToIstInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CONTENT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  // en-CA renders midnight as 24, which datetime-local rejects.
  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}
