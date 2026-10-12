// Pure helpers the Group 1 flows and agent cards share: reply visibility,
// names, rewrites (warmer, shorter, without a forgotten fact) and the side
// effects of saving a rule. Deterministic, no window, no clock.
// Import rule: core/flow-types, core/derive, config, data and types only.
import { snapshot } from "../../core/derive";
import { CITIES, EVIDENCE_PHRASES, fullName } from "../../data";
import type { AppState, B2Action, Draft, MemoryItem, MissionId, Person } from "../../types";
import type { Effects } from "../../core/flow-types";

/** The reply with this SIM_REPLIES id has arrived in this mission on the current day. */
export function replyVisible(s: AppState, missionId: MissionId, replyId: string): boolean {
  return snapshot(s, missionId).replies.some((r) => r.id === replyId);
}

export const personIn = (s: AppState, id: string | undefined) => (id ? s.people.find((p) => p.id === id) : undefined);

/** "Ananya at Kitebase" */
export const at = (p: Person) => `${p.first} at ${p.company}`;
export const nameAt = (p: Person) => `${fullName(p)}, ${p.company}`;

/** "Brightfold and Cobalt Cloud", "A, B and C". */
export function andList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The id of the run that is live in a mission right now (for draft runIds). */
export function liveRunId(fx: Effects, missionId: MissionId): string | undefined {
  return fx.get().runs.find((r) => r.missionId === missionId && r.status === "running")?.id;
}

// ── Cities named in text (F8) ───────────────────────────────────────────────

const CITY_ALIASES: Record<string, string> = { bangalore: "bengaluru", bombay: "mumbai", delhi: "delhi", ncr: "delhi", madras: "chennai" };

/** The first city named in the text, as a CITIES entry. */
export function cityIn(text: string | undefined): { id: string; label: string } | undefined {
  const t = (text ?? "").toLowerCase();
  for (const [alias, id] of Object.entries(CITY_ALIASES)) {
    if (t.includes(alias)) return CITIES.find((c) => c.id === id);
  }
  return CITIES.find((c) => t.includes(c.id) || t.includes(c.label.toLowerCase()));
}

/** City names match the label on a person's row ("Delhi NCR" matches "Delhi"). */
export const inCity = (p: Person, cityLabel: string) => p.city.toLowerCase().startsWith(cityLabel.toLowerCase().split(" ")[0]);

// ── Rules (F8) ──────────────────────────────────────────────────────────────

export const RULE_CITY_PREFIX = "m-rule-no-";
export const RULE_NEVER_PREFIX = "m-rule-never-";

/** People a rule would move to Closed. Only people not already closed. */
export function ruleTargets(s: AppState, item: MemoryItem): Person[] {
  const scope = item.scope === "shared" ? s.env : item.scope;
  const live = (p: Person) => p.missionId === scope && p.stage !== "closed";
  if (item.id.startsWith(RULE_CITY_PREFIX)) {
    const city = CITIES.find((c) => c.id === item.id.slice(RULE_CITY_PREFIX.length));
    return city ? s.people.filter((p) => live(p) && inCity(p, city.label)) : [];
  }
  if (item.id.startsWith(RULE_NEVER_PREFIX)) {
    const p = personIn(s, item.id.slice(RULE_NEVER_PREFIX.length));
    return p && live(p) ? [p] : [];
  }
  return [];
}

/** The store actions that apply a saved rule. */
export function ruleActions(s: AppState, item: MemoryItem): B2Action[] {
  const targets = ruleTargets(s, item);
  if (!targets.length) return [];
  if (item.id.startsWith(RULE_NEVER_PREFIX)) return targets.map((p) => ({ type: "NEVER_CONTACT", id: p.id, by: "senpai" }) as B2Action);
  return [{ type: "DROP_FROM_QUEUE", personIds: targets.map((p) => p.id), close: true, reason: item.text, by: "senpai" }];
}

/** The rule "No Hyderabad roles", if saved. */
export const cityRule = (s: AppState, cityId: string) => s.memory.find((m) => m.id === `${RULE_CITY_PREFIX}${cityId}`);

// ── Rewrites ────────────────────────────────────────────────────────────────

const tidy = (t: string) =>
  t
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*\./g, ".")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .trim();

/** Same facts, a warmer opener and close (F7). */
export function warmer(d: Draft, p: Person): string[] {
  const out = [...d.paragraphs];
  if (d.kind === "first" && out.length >= 4) {
    // Keep the intro fact ("a final-year CSE student") so "every fact kept" stays true.
    const who = /^I am .+? student/.exec(out[1])?.[0] ?? "I am Riya";
    out[1] = `${who}, and I have been reading about how ${p.company} works on ${p.hook}. It sounds like the kind of thing I like to build.`;
    out[3] = out[3].replace("Happy to share more.", "I would love to hear what you are building next, and I am happy to share more.");
  } else if (out.length >= 2) {
    out[1] = `Hope your week is going well. ${out[1]}`;
  }
  return out;
}

/** Same facts, fewer words (F7, "shorter"). */
export function shorter(d: Draft): string[] {
  return d.paragraphs.map((t) => tidy(t.replace("Happy to share more.", "").replace("in case this got buried", "")));
}

/** How each evidence phrase reads once the fact behind it is forgotten. */
const WITHOUT: Record<string, [RegExp, string][]> = {
  "r-proj-1-b": [[/,?\s*with React, Node\.js and PostgreSQL/g, ""], [/React, Node\.js and PostgreSQL/g, "a web stack"]],
  "r-proj-1-a": [[/\s*used by 1,200 students,?/g, ""], [/1,200 students/g, "students"]],
  "r-edu-year": [[/final-year CSE student/g, "CSE student"]],
  "r-proj-1-title": [[/campus UPI expense tracker/g, "expense tracker"], [/Splitkart/g, "a campus app"]],
  "r-proj-2-a": [[/cut food waste 18%/g, "cut food waste"]],
  "r-proj-2-title": [[/canteen analysis/g, "sales analysis"]],
  "r-exp-1": [[/repeat orders up 11%/g, "repeat orders up"]],
  "r-exp-2": [[/cohort dashboard/g, "dashboard"]],
  "r-extra": [[/220-member coding club/g, "coding club"]],
};

/** The paragraphs with every phrase backed by this resume line taken out. */
export function without(paragraphs: string[], lineId: string): string[] {
  const rules = WITHOUT[lineId] ?? [];
  return paragraphs.map((t) => {
    let out = t;
    for (const [re, to] of rules) out = out.replace(re, to);
    return out === t ? t : tidy(out);
  });
}

/** Unsent drafts in any mission that lean on this memory item's resume line. */
export function draftsUsing(s: AppState, item: MemoryItem): Draft[] {
  const line = item.source.lineId;
  if (!line || item.kind !== "fact") return [];
  const phrases = EVIDENCE_PHRASES.filter((e) => e.lineId === line).map((e) => e.phrase);
  return s.drafts.filter(
    (d) => d.status === "pending" && (d.evidence.some((e) => e.lineId === line) || phrases.some((ph) => d.paragraphs.some((t) => t.includes(ph)))),
  );
}

/** PROPOSE_DIFF actions that take a fact out of every unsent draft that uses it. */
export function forgetDiffs(s: AppState, item: MemoryItem): B2Action[] {
  const line = item.source.lineId;
  if (!line) return [];
  const out: B2Action[] = [];
  for (const d of draftsUsing(s, item)) {
    const after = without(d.paragraphs, line);
    if (after.join("\n") !== d.paragraphs.join("\n")) out.push({ type: "PROPOSE_DIFF", id: d.id, after });
  }
  return out;
}
