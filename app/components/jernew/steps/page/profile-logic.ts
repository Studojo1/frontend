// Pure helpers for the profile step: which resume lines back each part of
// the drafted page, and how edits tick the strength checklist.
// Owned by builder B (Your page).
import { PROFILE_DRAFT, RESUME_LINES, RESUME_SECTION_LABEL, type ProfileClaim, type ResumeLine } from "../../data";
import type { ProfileCheckId, ProfileState } from "../../types";

/** Ids for the two editable blocks, so the proof lens can point at them too. */
export const HEADLINE_ID = "c-headline";
export const ABOUT_ID = "c-about";

export const HEADLINE_MAX = 90;
export const ABOUT_MAX = 320;

/** What the headline and about were drafted from (only while unedited). */
const DRAFT_EVIDENCE: Record<string, string[]> = {
  [HEADLINE_ID]: ["r-edu", "r-proj-1-a"],
  [ABOUT_ID]: ["r-proj-1-a", "r-exp-title", "r-exp-1"],
};

/** One tap fix for the "add a number" check: the headline carries a real figure. */
export const NUMBER_HEADLINE = "Final-year CSE student whose campus app is used by 1,200 students";

const LINE_BY_ID = new Map(RESUME_LINES.map((l) => [l.id, l]));

export interface ProofTarget {
  id: string;
  /** Short label of the thing being proved, for the lens caption. */
  text: string;
  evidence: string[];
  /** The student rewrote it: it is theirs now, not drafted from a line. */
  edited: boolean;
}

/** Every claim on the page that can be inspected, keyed by id. */
export function proofTargets(p: ProfileState): Map<string, ProofTarget> {
  const m = new Map<string, ProofTarget>();
  const headlineEdited = p.headline !== PROFILE_DRAFT.headline;
  const aboutEdited = p.about !== PROFILE_DRAFT.about;
  m.set(HEADLINE_ID, {
    id: HEADLINE_ID,
    text: "Headline",
    evidence: headlineEdited ? [] : DRAFT_EVIDENCE[HEADLINE_ID],
    edited: headlineEdited,
  });
  m.set(ABOUT_ID, {
    id: ABOUT_ID,
    text: "About",
    evidence: aboutEdited ? [] : DRAFT_EVIDENCE[ABOUT_ID],
    edited: aboutEdited,
  });
  for (const c of PROFILE_DRAFT.claims as ProfileClaim[]) {
    m.set(c.id, { id: c.id, text: c.text, evidence: c.evidence, edited: false });
  }
  return m;
}

export function evidenceLines(ids: string[]): ResumeLine[] {
  return ids.map((id) => LINE_BY_ID.get(id)).filter((l): l is ResumeLine => Boolean(l));
}

/** "Projects, line 2" style pointer for a resume line. */
export function lineWhere(line: ResumeLine): string {
  const inSection = RESUME_LINES.filter((l) => l.section === line.section);
  const n = inSection.findIndex((l) => l.id === line.id) + 1;
  const label = RESUME_SECTION_LABEL[line.section] || "Header";
  return `${label}, line ${n}`;
}

/** Screen reader sentence for the current proof. */
export function proofAnnouncement(t: ProofTarget | undefined): string {
  if (!t) return "";
  if (t.edited) return `${t.text}: written by you, so there is no resume line to point at.`;
  const lines = evidenceLines(t.evidence);
  return `${t.text}. Backed by ${lines.length} resume line${lines.length === 1 ? "" : "s"}: ${lines
    .map((l) => `${lineWhere(l)}, ${l.text}`)
    .join("; ")}.`;
}

/**
 * Checklist state after an edit. "number" is live (a digit in the headline),
 * "headline" and "about" tick when the student saves their own edit, and the
 * college email ticks only through the mock code.
 */
export function nextChecks(
  p: ProfileState,
  patch: Partial<ProfileState>,
  savedBlock?: "headline" | "about",
): Partial<Record<ProfileCheckId, boolean>> {
  const merged = { ...p, ...patch };
  const checks = { ...p.checks, ...patch.checks };
  checks.number = /\d/.test(merged.headline);
  if (savedBlock === "headline" && merged.headline !== PROFILE_DRAFT.headline) checks.headline = true;
  if (savedBlock === "about") checks.about = true;
  if (merged.collegeVerified) checks["college-email"] = true;
  return checks;
}

export function strengthWord(v: number): string {
  if (v >= 90) return "Ready to impress";
  if (v >= 75) return "Strong";
  if (v >= 60) return "Getting there";
  return "Good start";
}
