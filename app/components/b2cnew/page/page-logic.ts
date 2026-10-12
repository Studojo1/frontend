// Pure helpers for the Page tab: claim order through a mission's lens, the
// evidence check Senpai runs on an edit, and a small word diff for the
// headline proposal. Group 4. No state, no clock, no randomness.
import { lineById, PROFILE_DRAFT, RESUME_LINES, type ProfileClaim } from "../data";
import type { Mission, PageState } from "../types";

/** How many lens claims lead the page opened from a mission's emails. */
export const LENS_LEAD = 3;

/** Claims in this mission's lens order. Claims missing from the lens go last. */
export function lensClaims(m: Mission): ProfileClaim[] {
  const all = PROFILE_DRAFT.claims;
  const inLens = m.lens.map((id) => all.find((c) => c.id === id)).filter((c): c is ProfileClaim => !!c);
  return [...inLens, ...all.filter((c) => !m.lens.includes(c.id))];
}

/** The text a claim shows: the student's checked edit, or the draft. */
export const claimTextOf = (page: PageState, c: ProfileClaim) => page.claimText[c.id] ?? c.text;

/** Moves one id up or down in a list. Returns the same list when it cannot move. */
export function move(ids: string[], id: string, dir: -1 | 1): string[] {
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return ids;
  const out = [...ids];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

// ── Evidence check ──────────────────────────────────────────────────────────

export interface CheckResult {
  ok: boolean;
  /** One plain sentence, in Senpai's voice. */
  reason: string;
}

/** Words nothing on a student resume can back. */
const UNBACKED = ["expert", "guru", "ninja", "rockstar", "world-class", "world class", "genius", "visionary", "award-winning", "best in", "top 1", "10x", "thought leader"];

const STOP = new Set(["with", "that", "this", "from", "used", "into", "over", "their", "they", "your", "have", "built", "students", "student"]);

const numbersIn = (t: string) => (t.match(/\d[\d,]*(?:\.\d+)?%?/g) ?? []).map((n) => n.replace(/,/g, ""));
const wordsIn = (t: string) => (t.toLowerCase().match(/[a-z][a-z.+]{3,}/g) ?? []).filter((w) => !STOP.has(w));

/**
 * Checks an edit against the resume lines that back it. Refuses hype words,
 * numbers the lines do not contain, and text that no longer shares a detail
 * with its lines. lineIds empty means "anything on the resume" (headline).
 */
export function checkClaim(text: string, lineIds: string[]): CheckResult {
  const t = text.trim();
  if (t.length < 12) return { ok: false, reason: "Too short to say anything. Give it one concrete detail." };
  if (t.length > 140) return { ok: false, reason: "Keep it under 140 characters. Busy readers skim." };
  const lower = t.toLowerCase();
  const hype = UNBACKED.find((w) => lower.includes(w));
  if (hype) {
    return { ok: false, reason: `Nothing on your resume backs "${hype}", so it stays off. Lead with a number you can prove instead.` };
  }
  const lines = (lineIds.length ? lineIds.map((id) => lineById(id)).filter((l) => !!l) : RESUME_LINES).map((l) => l!.text);
  const backing = lines.join(" ");
  const have = numbersIn(backing);
  const stray = numbersIn(t).find((n) => !have.includes(n));
  if (stray) {
    const known = have.filter((n) => n.length > 1 || n.endsWith("%"));
    const hint = known.length ? ` Your resume says ${known.slice(0, 2).map(pretty).join(" and ")}.` : "";
    return { ok: false, reason: `Nothing on your resume backs "${pretty(stray)}".${hint}` };
  }
  const shared = wordsIn(t).some((w) => wordsIn(backing).includes(w));
  if (!shared) {
    const example = wordsIn(backing).find((w) => w.length > 5) ?? "a detail from that line";
    return { ok: false, reason: `This no longer matches the resume line behind it. Keep at least one detail, like "${example}".` };
  }
  return { ok: true, reason: "Checked against your resume. Every number and detail is backed." };
}

/** 1200 to "1,200" for messages (Indian grouping is the same at this size). */
function pretty(n: string): string {
  const pct = n.endsWith("%");
  const raw = pct ? n.slice(0, -1) : n;
  const num = Number(raw);
  if (!Number.isFinite(num)) return n;
  return `${num.toLocaleString("en-IN")}${pct ? "%" : ""}`;
}

// ── Word diff ───────────────────────────────────────────────────────────────

export type DiffPart = { text: string; kind: "same" | "add" | "del" };

/** Word-level diff (longest common subsequence). Fine for a headline. */
export function wordDiff(before: string, after: string): DiffPart[] {
  const a = before.split(/\s+/).filter(Boolean);
  const b = after.split(/\s+/).filter(Boolean);
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => Array.from({ length: b.length + 1 }, () => 0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffPart[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      out.push({ text: a[i], kind: "same" });
      i++;
      j++;
    } else if (j < b.length && (i >= a.length || dp[i][j + 1] >= dp[i + 1][j])) {
      out.push({ text: b[j], kind: "add" });
      j++;
    } else {
      out.push({ text: a[i], kind: "del" });
      i++;
    }
  }
  return out;
}
