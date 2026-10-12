// Pure helpers for the Mail group (Approvals, the lever, Replies).
// Deterministic: nothing here reads the clock or the window.
import { capFor, packSends, pendingDrafts } from "../core/derive";
import { dayDate, sentByDay } from "../data";
import type { AppState, Draft, MissionId } from "../types";

/** "First email", "Follow-up", "Last nudge". */
export const KIND_LABEL: Record<Draft["kind"], string> = { first: "First email", follow: "Follow-up", nudge: "Last nudge" };

/** Pending drafts in the order the stack shows them: rewrites waiting for you first, then the store order. */
export function stackOrder(s: AppState, id: MissionId = s.env): Draft[] {
  const all = pendingDrafts(s, id);
  return [...all.filter((d) => d.diff), ...all.filter((d) => !d.diff)];
}

/** The run whose drafts are still waiting (the newest one), with its pending drafts. */
export function latestRunBatch(s: AppState, id: MissionId = s.env): { runId: string | null; ids: string[] } {
  const all = pendingDrafts(s, id);
  const runIds = Array.from(new Set(all.map((d) => d.runId).filter((x): x is string => !!x)));
  // Runs are appended, so the last one in s.runs that still has drafts is the newest.
  const newest = [...s.runs].reverse().find((r) => runIds.includes(r.id))?.id ?? runIds[runIds.length - 1] ?? null;
  return { runId: newest, ids: newest ? all.filter((d) => d.runId === newest).map((d) => d.id) : all.map((d) => d.id) };
}

export interface ScheduleDay {
  day: number;
  label: string;
  weekday: string;
  cap: number;
  /** First emails already queued by the campaign plan for that day (Simulated). */
  planned: number;
  /** Drafts you approved here that go out that day. */
  approved: Draft[];
  isToday: boolean;
}

/**
 * Seven send days from today, each with its cap from DAILY_SEND_CAP. The
 * pack's own plan only fills what your approvals leave: approved drafts take
 * their slot first, and the plan never queues more than the credits left
 * after them, so queued plus approved plus sent never passes the pack.
 */
export function sendSchedule(s: AppState, total: number, id: MissionId = s.env): ScheduleDay[] {
  const approvedAll = s.drafts.filter((x) => x.missionId === id && x.kind === "first" && x.status === "approved").length;
  // What the plan already sent before today, and what it may still send from today on.
  let budget = Math.max(0, total - approvedAll - packSends(total, s.drafts, id, s.day - 1).plan);
  const out: ScheduleDay[] = [];
  for (let day = s.day; day < s.day + 7; day++) {
    const d = dayDate(day);
    const cap = capFor(day);
    const approved = s.drafts.filter((x) => x.missionId === id && x.status === "approved" && x.slotDay === day);
    const want = sentByDay(total, day) - sentByDay(total, day - 1);
    const planned = Math.max(0, Math.min(want, budget, cap - approved.length));
    budget -= planned;
    out.push({ day, label: d.date, weekday: d.weekday, cap, planned, approved, isToday: day === s.day });
  }
  return out;
}

// ── Evidence segments ───────────────────────────────────────────────────────

export type Segment = { text: string; lineId?: string };

/** Splits a paragraph into plain text and evidence phrases (each backed by a resume line). */
export function segmentsOf(text: string, evidence: { phrase: string; lineId: string }[]): Segment[] {
  const hits: { start: number; end: number; lineId: string }[] = [];
  for (const e of [...evidence].sort((a, b) => b.phrase.length - a.phrase.length)) {
    const start = text.indexOf(e.phrase);
    if (start < 0) continue;
    const end = start + e.phrase.length;
    if (hits.some((h) => start < h.end && end > h.start)) continue;
    hits.push({ start, end, lineId: e.lineId });
  }
  hits.sort((a, b) => a.start - b.start);
  const out: Segment[] = [];
  let at = 0;
  for (const h of hits) {
    if (h.start > at) out.push({ text: text.slice(at, h.start) });
    out.push({ text: text.slice(h.start, h.end), lineId: h.lineId });
    at = h.end;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}

// ── Word diff ───────────────────────────────────────────────────────────────

export type DiffPart = { text: string; op: "same" | "add" | "del" };

/** A word-level diff (longest common subsequence). Whitespace rides with the word before it. */
export function diffWords(before: string, after: string): DiffPart[] {
  const a = before.split(/(?<=\s)/);
  const b = after.split(/(?<=\s)/);
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array.from({ length: m + 1 }, () => 0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i].trim() === b[j].trim() ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffPart[] = [];
  const push = (text: string, op: DiffPart["op"]) => {
    const last = out[out.length - 1];
    if (last && last.op === op) last.text += text;
    else out.push({ text, op });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i].trim() === b[j].trim()) {
      push(b[j], "same");
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push(a[i++], "del");
    } else {
      push(b[j++], "add");
    }
  }
  while (i < n) push(a[i++], "del");
  while (j < m) push(b[j++], "add");
  return out;
}

/** Diffs two paragraph lists, paragraph by paragraph. */
export function diffParagraphs(before: string[], after: string[]): DiffPart[][] {
  const len = Math.max(before.length, after.length);
  return Array.from({ length: len }, (_, i) => diffWords(before[i] ?? "", after[i] ?? ""));
}

/** Counts changed words, for "3 words changed". */
export const changedWords = (parts: DiffPart[][]) =>
  parts.flat().filter((p) => p.op === "add").reduce((n, p) => n + p.text.trim().split(/\s+/).filter(Boolean).length, 0);

/** The send day an approval would land on now (mirrors the reducer: 10 a day, from tomorrow). */
export function slotPreview(s: AppState, id: MissionId = s.env): number {
  for (let d = s.day + 1; d < s.day + 60; d++) {
    const used = s.drafts.filter((x) => x.missionId === id && x.status === "approved" && x.slotDay === d).length;
    if (used < 10) return d;
  }
  return s.day + 1;
}
