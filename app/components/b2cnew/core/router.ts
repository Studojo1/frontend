// The intent router: typed text and context chips to a flow and its input.
// Keyword matching only; nothing calls a model or the network.
// Flows trigger on intent phrases ("say yes to", "answer karan"), never on a
// bare name, and a phrase said with a negation in the same clause ("don't
// say yes") never starts an action. Shared file: owned by the foundation.
import type { AppState, ContextChip, FlowInput } from "../types";
import type { FlowSpec } from "./flow-types";

/** Words that turn a request around: "don't approve", "do not say yes". */
const NEGATION = /\b(don'?t|dont|do not|not|never|won'?t|wont|can'?t|cannot|shouldn'?t|stop|cancel|no need to|hold off)\b/;
/** Clause breaks: a negation before one of these does not reach the phrase after it. */
const CLAUSE = /[,.;!?]|\bbut\b|\bthen\b|\binstead\b/g;

/** The text of the clause before `idx`, back to the last clause break. */
function clauseBefore(t: string, idx: number): string {
  let start = 0;
  for (const m of t.slice(0, idx).matchAll(CLAUSE)) start = (m.index ?? 0) + m[0].length;
  return t.slice(start, idx);
}

export interface FlowMatch {
  /** Length of the longest matching phrase, 0 for none (1000 for the exact chip label). */
  score: number;
  /** The phrase was said with a negation in front of it. */
  negated: boolean;
}

/** How well a flow's phrases match the text, and whether the match was negated. */
export function matchFlow(f: FlowSpec, text: string): FlowMatch {
  const t = text.toLowerCase();
  let best: FlowMatch = { score: 0, negated: false };
  if (f.triggers.chip && t.trim() === f.triggers.chip.toLowerCase()) return { score: 1000, negated: false };
  for (const p of f.triggers.phrases) {
    let idx = -1;
    let hit = "";
    if (typeof p === "string") {
      idx = t.indexOf(p.toLowerCase());
      hit = p.toLowerCase();
    } else {
      const m = t.match(p);
      if (m) {
        idx = m.index ?? 0;
        hit = m[0];
      }
    }
    if (idx < 0) continue;
    // A phrase that is itself a negation ("don't email", "no hyderabad") is never turned around.
    const negated = !NEGATION.test(hit) && NEGATION.test(clauseBefore(t, idx));
    if (hit.length > best.score || (hit.length === best.score && best.negated && !negated)) best = { score: hit.length, negated };
  }
  return best;
}

export interface Route {
  /** The flow to run, or null. */
  spec: FlowSpec | null;
  /** Set when the only matches were negated ("don't approve anything"): nothing runs. */
  declined: FlowSpec | null;
}

/** Best flow for the text, ignoring day events. A negated match never wins over nothing. */
export function routeText(flows: FlowSpec[], text: string): Route {
  let spec: FlowSpec | null = null;
  let score = 0;
  let declined: FlowSpec | null = null;
  let declinedScore = 0;
  for (const f of flows) {
    if (f.event) continue;
    const m = matchFlow(f, text);
    if (!m.score) continue;
    if (m.negated) {
      if (m.score > declinedScore) {
        declined = f;
        declinedScore = m.score;
      }
    } else if (m.score > score) {
      spec = f;
      score = m.score;
    }
  }
  return { spec, declined: spec ? null : declined };
}

/** Escapes text for use inside a RegExp. */
const escapeRe = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Input from the composer chips, plus a person or company named in the text. */
export function inputFrom(s: AppState, chips: ContextChip[], text = ""): FlowInput {
  const input: FlowInput = {};
  for (const c of chips) {
    if (c.kind === "person") input.personId = c.id;
    if (c.kind === "draft") {
      input.draftId = c.id;
      input.personId ??= s.drafts.find((d) => d.id === c.id)?.personId;
    }
    if (c.kind === "reply") {
      input.replyId = c.id;
      input.personId ??= s.replies.find((r) => r.id === c.id)?.personId;
    }
    if (c.kind === "claim") input.claimId = c.id;
    if (c.kind === "prep") input.prepId = c.id;
  }
  const t = text.toLowerCase();
  if (t) {
    const named = s.people.find(
      (p) =>
        p.missionId === s.env &&
        (new RegExp(`\\b${escapeRe(p.first.toLowerCase())}\\b`).test(t) || new RegExp(`\\b${escapeRe(p.company.toLowerCase())}\\b`).test(t)),
    );
    if (named) input.personId = named.id;
  }
  return input;
}
