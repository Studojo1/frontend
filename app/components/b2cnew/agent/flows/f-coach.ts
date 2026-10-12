// F11 (what autopilot changes) and F12 (practise 3 questions).
// F11 posts a confirm card, no run. F12 asks one question at a time and
// checks the answers against your resume. Feedback is Simulated.
import { isMinor, missionOf } from "../../core/derive";
import type { FlowCtx, FlowSpec } from "../../core/flow-types";
import { NOTCH3_UNLOCK, notchMeta, NOTCHES } from "../../config";
import { EVIDENCE_PHRASES } from "../../data";
import type { AppState, ChatBody, Notch, Prep, QuickChip } from "../../types";
import { personIn } from "./helpers";

// ── F11: autopilot ──────────────────────────────────────────────────────────

function askedNotch(ctx: FlowCtx): Notch | undefined {
  if (ctx.input.value === 1 || ctx.input.value === 2 || ctx.input.value === 3) return ctx.input.value;
  const t = (ctx.text ?? "").toLowerCase();
  const n = t.match(/notch\s*([123])/)?.[1];
  if (n) return Number(n) as Notch;
  if (/full autopilot|guardrailed|on autopilot|send for me|auto ?send/.test(t)) return 3;
  if (/\bbatch\b/.test(t)) return 2;
  if (/ask me|every email/.test(t)) return 1;
  return undefined;
}

/** Why notch 3 is out of reach, or null when it is unlocked. */
export function notch3Lock(s: AppState, missionId = s.env): string | null {
  if (isMinor(s)) return "Under 18, autopilot stops at Batch and your page stays private.";
  const m = missionOf(s, missionId);
  if (m.approvals < NOTCH3_UNLOCK) return `Guardrailed autopilot unlocks after ${NOTCH3_UNLOCK} approvals in this mission. You have ${m.approvals}, so ${NOTCH3_UNLOCK - m.approvals} to go.`;
  return null;
}

/** The Senpai line after a notch change, so the chat says what changed. */
export function notchNote(n: Notch): string {
  if (n === 3) return "Guardrailed autopilot is on. First emails to people above your fit floor go inside the daily cap, and it stops at 10 credits left. Senpai never replies for you.";
  if (n === 2) return "Batch is on. You approve a run in one tap; follow-ups and the last nudge go on schedule.";
  return "Ask me is on. Every email, follow-ups included, waits for your tap.";
}

export const F11: FlowSpec = {
  id: "F11",
  title: "What autopilot changes",
  triggers: { phrases: ["autopilot", "auto pilot", "lever", "notch", "send for me", "auto send", "autosend"], chip: "What does autopilot change?" },
  steps: () => [],
  done: (s, ctx) => {
    const m = missionOf(s, ctx.missionId);
    const cur = notchMeta(m.notch);
    const want = askedNotch(ctx);
    const lock = notch3Lock(s, ctx.missionId);
    const lines = [`Right now: ${cur.name}. ${cur.may}`];
    if (lock) lines.push(lock);
    lines.push("At every notch: replies go to your Gmail drafts, never out. Pause all stops everything at once.");
    const actions: QuickChip[] = NOTCHES.filter((x) => x.n !== m.notch && !(x.n === 3 && lock)).map((x) => ({
      label: x.n > m.notch ? `Raise to ${x.name}` : `Lower to ${x.name}`,
      action: { type: "SET_NOTCH", missionId: ctx.missionId, notch: x.n },
      tone: x.n === want ? "primary" : "plain",
    }));
    actions.push({ label: "Open the lever", action: { type: "SHEET", sheet: "lever" }, tone: "plain" });
    const out: ChatBody[] = [
      { kind: "senpai", text: lines.join(" ") },
      { kind: "decision", text: "Change it? Raising needs a short hold; lowering is instant.", actions },
    ];
    return out;
  },
};

// ── F12: practise 3 questions ───────────────────────────────────────────────

/** A ready answer per resume line, so the practice works one-handed. */
const READY: Record<string, { label: string; answer: string }> = {
  "r-proj-1-b": { label: "Use my Splitkart story", answer: "I built Splitkart myself in React, Node.js and PostgreSQL. It settles a shared bill in one tap." },
  "r-proj-1-a": { label: "Use the 1,200 number", answer: "Three hostels took it up and 1,200 students used it in the first semester." },
  "r-proj-1-title": { label: "Use the hostel ledger", answer: "Splitkart started from a paper ledger in my hostel. Trust was the hard part: people paid once they could see who owed what." },
  "r-exp-1": { label: "Use the 11% number", answer: "At the snack brand we moved budget to repeat buyers and repeat orders went up 11% over the quarter." },
  "r-exp-2": { label: "Use the dashboard", answer: "I built a cohort dashboard in SQL that the team used in weekly growth reviews." },
  "r-proj-2-a": { label: "Use the canteen numbers", answer: "I used Python and pandas on 9 months of till data and we cut food waste 18%." },
  "r-extra": { label: "Use the coding club", answer: "I lead a 220-member coding club and ran 2 hackathons." },
};

function prepFor(s: AppState, ctx: FlowCtx): Prep | undefined {
  const inMission = (p: Prep) => personIn(s, p.personId)?.missionId === ctx.missionId;
  return (
    s.preps.find((p) => p.id === ctx.input.prepId) ??
    s.preps.find((p) => p.personId === ctx.input.personId && inMission(p)) ??
    s.preps.find(inMission)
  );
}

const backed = (answer: string) => /\d/.test(answer) || EVIDENCE_PHRASES.some((e) => answer.includes(e.phrase));

/** Simulated feedback: checks each answer for a number or a resume phrase. */
export function practiceFeedback(answers: string[]): string {
  const parts = answers.slice(0, 3).map((a, i) => {
    if (/^skip/i.test(a.trim())) return `Answer ${i + 1}: skipped. Try it once out loud before the call.`;
    return backed(a) ? `Answer ${i + 1}: backed by a number from your resume. Keep it.` : `Answer ${i + 1}: no number yet. Add one, like "1,200 students" or "repeat orders up 11%".`;
  });
  return `${parts.join(" ")} One story to tighten: start with the hostel ledger, land on the 1,200 students, and stop under 60 seconds.`;
}

export const F12: FlowSpec = {
  id: "F12",
  title: (s, ctx) => `Practise 3 ${personIn(s, prepFor(s, ctx)?.personId)?.company ?? "interview"} questions`,
  triggers: { phrases: ["practise", "practice", "mock", "interview questions", "rehearse", "quiz me"], chip: "Practise 3 questions" },
  available: (s, ctx) =>
    prepFor(s, ctx) ? true : "No prep pack yet. When someone says yes, I build one, then we practise. Kitebase's yes is in Replies from Day 4.",
  steps: (s, ctx) => {
    const prep = prepFor(s, ctx);
    if (!prep) return [];
    const company = personIn(s, prep.personId)?.company ?? "their";
    const qs = prep.questions.slice(0, 3);
    return [
      { skill: "coach", label: `Picked 3 ${company} questions`, detail: "From your prep pack", ms: 900, effect: (fx) => fx.dispatch({ type: "SET_TAB", tab: "prep" }) },
      ...qs.map((q, i) => {
        const ready = READY[q.lineId] ?? READY["r-proj-1-b"];
        return {
          skill: "coach" as const,
          label: `Asked question ${i + 1} of 3`,
          ms: 500,
          ask: {
            text: `Question ${i + 1}: "${q.q}" Type your answer, or tap one.`,
            chips: [
              { label: ready.label, answer: ready.answer, tone: "primary" as const },
              { label: "Skip this one", answer: "Skip" },
            ],
          },
        };
      }),
      {
        skill: "coach",
        label: "Checked answers against evidence",
        detail: (_now, c) => `${c.answers.filter((a) => backed(a)).length} of 3 backed by a number`,
        ms: 1100,
        effect: (fx, _now, c) => fx.dispatch({ type: "UPDATE_PREP", id: prep.id, patch: { feedback: practiceFeedback(c.answers) } }),
      },
    ];
  },
  done: (s, ctx) => {
    const prep = prepFor(s, ctx);
    const company = personIn(s, prep?.personId)?.company ?? "the";
    return [
      {
        kind: "senpai",
        text: `Feedback is on the ${company} card in Prep. It is Simulated: I check your answers against your resume, I do not grade you or predict the call.`,
        chips: [{ label: "Open Prep", tab: "prep" }],
      },
    ];
  },
  result: (s, ctx) => {
    const prep = prepFor(s, ctx);
    return prep ? { label: "Feedback in Prep", tab: "prep", ids: [prep.personId] } : undefined;
  },
};
