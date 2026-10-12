// Sample data for /b2cnew: the single import surface. Re-exports the jernew
// data (never edits it) and adds what the day-to-day app needs. Everything is
// fixed and deterministic so the server and browser render the same thing.
// Shared file: owned by the foundation. Groups import, never edit.
import {
  buildEmailSequence,
  MATCHES,
  PROFILE_DRAFT,
  RESUME_LINES,
  SAMPLE_PROJECT,
  SIM_REPLIES,
  type Match,
  type ResumeLine,
} from "../jernew/data";
import type { CityId, QuizAnswers } from "../jernew/types";
import { DAY0_UTC } from "./config";
import { evidenceIn } from "./data-text";
import type { Draft, MissionId, Person } from "./types";

export {
  buildEmailSequence,
  CLAIM_SECTION_LABEL,
  CITIES,
  DAILY_SEND_CAP,
  formatCount,
  formatINR,
  MATCHES,
  MISSION_DAYS,
  monthLabel,
  PACK_RULES,
  packById,
  PACKS,
  PROFILE_DRAFT,
  REPLY_TAG_STYLE,
  RESUME_LINES,
  RESUME_SECTION_LABEL,
  ROLES,
  roleById,
  SAMPLE_MATCH_COUNT,
  SAMPLE_PROJECT,
  SEND_PACE,
  SEND_TIMELINE,
  sendPlan,
  sentByDay,
  SIM_REPLIES,
  simulateCampaign,
  START_MONTHS,
  STUDENT,
  TONES,
  TOP_UP,
} from "../jernew/data";
export type { CampaignSnapshot, EmailDraft, Match, Pack, ProfileClaim, ResumeLine, SimReply } from "../jernew/data";
export { GMAIL_SAMPLE_ADDRESS, rankMatches } from "../jernew/data";
export * from "./data-people";
export * from "./data-text";

// ── The two missions' targets (the /jernew quiz answers) ────────────────────

export const RIYA_QUIZ: QuizAnswers = {
  role: "sde",
  cities: ["pune", "bengaluru"],
  remote: true,
  jobType: "internship",
  startMonth: "2027-01",
  stage: 1,
  project: SAMPLE_PROJECT,
  tone: "direct",
  card: 0,
};

export const FT27_QUIZ: QuizAnswers = {
  role: "data",
  cities: ["mumbai", "bengaluru"] as CityId[],
  remote: false,
  jobType: "fulltime",
  startMonth: "2027-07",
  stage: 2,
  project: "Cut canteen food waste 18% with a Python and pandas analysis of 9 months of till data.",
  tone: "bold",
  card: 0,
};

// ── Days and dates (fixed, never read from the clock) ───────────────────────

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Simulated Day n as a date. Day 6 is "Sun 11 Oct". */
export function dayDate(day: number): { weekday: string; date: string; label: string } {
  const d = new Date(DAY0_UTC + day * 86_400_000);
  const weekday = WEEKDAYS[d.getUTCDay()];
  const date = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  return { weekday, date, label: `${weekday} ${date}` };
}

// ── Lookups ─────────────────────────────────────────────────────────────────

export const lineById = (id: string): ResumeLine | undefined => RESUME_LINES.find((l) => l.id === id);
export const matchById = (id: string | undefined): Match | undefined => (id ? MATCHES.find((m) => m.id === id) : undefined);
export const claimById = (id: string) => PROFILE_DRAFT.claims.find((c) => c.id === id);
export const fullName = (p: Pick<Person, "first" | "last">) => `${p.first} ${p.last}`;

/** The SIM_REPLIES entry from this person, if any. */
export const simReplyFor = (personId: string) => SIM_REPLIES.find((r) => r.matchId === personId);

/** A Match-shaped object for any person, so buildEmailSequence works for extras too. */
export function matchFor(p: Person): Match {
  const m = matchById(p.matchId);
  if (m) return m;
  return {
    id: p.id,
    company: p.company,
    hook: p.hook,
    sector: p.sector,
    city: "remote",
    cityLabel: p.city,
    stage: 1,
    stageLabel: p.stageLabel,
    manager: { first: p.first, maskedLast: p.last, title: p.title },
    hiringFor: p.hiringFor,
    roles: ["sde"],
    baseFit: p.fit,
    why: p.why,
    angle: 0,
  };
}

/** Page URL used in follow-ups. */
export const PAGE_URL = PROFILE_DRAFT.url;

/**
 * Builds a draft of one kind to one person, in the mission's tone, with the
 * page link only when the page is live. Ids are deterministic: `d-<kind>-<personId>`.
 */
export function makeDraft(
  p: Person,
  kind: Draft["kind"],
  quiz: QuizAnswers,
  opts: { pageLive?: boolean; runId?: string; missionId?: MissionId } = {},
): Draft {
  const seq = buildEmailSequence(quiz, matchFor(p), PAGE_URL, opts.pageLive ?? true);
  const email = seq.find((e) => e.id === kind) ?? seq[0];
  return {
    id: `d-${kind}-${p.id}`,
    personId: p.id,
    missionId: opts.missionId ?? p.missionId,
    kind,
    subject: email.subject,
    paragraphs: email.paragraphs,
    signoff: email.signoff,
    evidence: evidenceIn(email.paragraphs),
    status: "pending",
    runId: opts.runId,
  };
}
