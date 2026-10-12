// Small pure helpers the reducers share. Shared file: owned by the foundation.
import { notchMeta } from "../config";
import { evidenceIn, fullName, makeDraft } from "../data";
import type { Actor, AppState, B2Action, Draft, MissionId, Person, Skill } from "../types";

/** Appends one activity-log entry (and bumps seq). */
export function withLog(
  s: AppState,
  text: string,
  opts: { actor?: Actor; skill?: Skill; undo?: B2Action; missionId?: MissionId } = {},
): AppState {
  const seq = s.seq + 1;
  return {
    ...s,
    seq,
    log: [
      ...s.log,
      { id: `l-${seq}`, day: s.day, actor: opts.actor ?? "you", missionId: opts.missionId ?? s.env, text, skill: opts.skill, undo: opts.undo },
    ],
  };
}

/** Shows the toast (one at a time). */
export function withToast(s: AppState, text: string, undo?: B2Action): AppState {
  const seq = s.seq + 1;
  return { ...s, seq, toast: { id: seq, text, undo } };
}

export const mapDraft = (s: AppState, id: string, f: (d: Draft) => Draft): AppState => ({
  ...s,
  drafts: s.drafts.map((d) => (d.id === id ? f(d) : d)),
});

export const mapPerson = (s: AppState, id: string, f: (p: Person) => Person): AppState => ({
  ...s,
  people: s.people.map((p) => (p.id === id ? f(p) : p)),
});

export const nameOf = (s: AppState, personId: string) => {
  const p = s.people.find((x) => x.id === personId);
  return p ? `${fullName(p)}, ${p.company}` : personId;
};

export const notchLabel = (s: AppState, id: MissionId = s.env) =>
  notchMeta(s.missions.find((m) => m.id === id)?.notch ?? 1).name;

/** Next send day with room: up to 10 approved drafts per day, from tomorrow. */
export function nextSlot(s: AppState, missionId: MissionId): number {
  for (let d = s.day + 1; d < s.day + 60; d++) {
    const used = s.drafts.filter((x) => x.missionId === missionId && x.status === "approved" && x.slotDay === d).length;
    if (used < 10) return d;
  }
  return s.day + 1;
}

/** Re-runs evidence detection after the text of a draft changed. */
export const reEvidence = (d: Draft): Draft => ({ ...d, evidence: evidenceIn(d.paragraphs) });

/**
 * Rebuilds unsent follow-ups and nudges with or without the page link
 * (Unpublish and Republish). First emails never carry the link.
 */
export function relinkDrafts(s: AppState, pageLive: boolean): AppState {
  return {
    ...s,
    drafts: s.drafts.map((d) => {
      if (d.status !== "pending" || d.kind === "first") return d;
      const p = s.people.find((x) => x.id === d.personId);
      const m = s.missions.find((x) => x.id === d.missionId);
      if (!p || !m) return d;
      const fresh = makeDraft(p, d.kind, m.target, { pageLive, runId: d.runId, missionId: d.missionId });
      return { ...d, subject: fresh.subject, paragraphs: fresh.paragraphs, evidence: fresh.evidence };
    }),
  };
}
