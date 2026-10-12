// F2 (review drafts), F3 (answer Karan) and F4 (say yes and prep).
// Senpai drafts; you approve, and replies only ever go to Gmail drafts.
import { capFor, pendingDrafts } from "../../core/derive";
import type { FlowCtx, FlowSpec } from "../../core/flow-types";
import { PREP_SEED, REPLY_DRAFTS, simReplyFor } from "../../data";
import type { AppState, ChatBody, QuickChip } from "../../types";
import { at, personIn, plural, replyVisible } from "./helpers";

// ── F2: review drafts ───────────────────────────────────────────────────────

const topDraft = (s: AppState, ctx: FlowCtx) => pendingDrafts(s, ctx.missionId)[0];

export const F2: FlowSpec = {
  id: "F2",
  title: (s, ctx) => `Review ${plural(pendingDrafts(s, ctx.missionId).length, "draft")}`,
  triggers: { phrases: ["review", "drafts", "approve", "approvals", "what needs me", "queue"], chip: "Review 12 drafts" },
  available: (s, ctx) =>
    pendingDrafts(s, ctx.missionId).length > 0 ? true : "Nothing is waiting for you. Want me to find a few more people first?",
  steps: (s, ctx) => {
    const n = pendingDrafts(s, ctx.missionId).length;
    return [
      {
        skill: "write",
        label: `Final check on ${plural(n, "draft")}`,
        detail: "Every claim backed by a resume line",
        ms: 1000,
        effect: (fx, now) => fx.highlight(pendingDrafts(now, ctx.missionId).map((d) => d.personId), "scanning"),
      },
      {
        skill: "send",
        label: "Checked today's cap",
        detail: (now) => `${capFor(now.day)} a day. Approved ones go from tomorrow`,
        ms: 700,
        effect: (fx, now) => {
          fx.dispatch({ type: "SET_APPROVALS_VIEW", view: "stack" });
          fx.dispatch({ type: "SET_TAB", tab: "approvals" });
          const top = topDraft(now, ctx);
          const p = personIn(now, top?.personId);
          if (top && p) fx.dispatch({ type: "FOCUS", item: { kind: "draft", id: top.id, label: `Draft to ${p.first}, ${p.company}` } });
          // On phones and the slide-over, step aside so the stack is in view.
          fx.dispatch({ type: "DOCK", overlay: false });
        },
      },
    ];
  },
  done: (s, ctx) => {
    const top = topDraft(s, ctx);
    const p = personIn(s, top?.personId);
    return [
      {
        kind: "senpai",
        text: `Approvals is open${p ? ` on ${at(p)}` : ""}. A approves, S skips, E edits. Approving reserves a credit; skipping costs nothing.`,
        chips: [{ label: "Make this warmer", flow: "F7" }],
      },
    ];
  },
  result: (s, ctx) => {
    const ds = pendingDrafts(s, ctx.missionId);
    return { label: `${plural(ds.length, "draft")} in Approvals`, tab: "approvals", ids: ds.map((d) => d.personId) };
  },
};

// ── F3: answer Karan ────────────────────────────────────────────────────────

const RP_KARAN = "rp-1";

export const F3: FlowSpec = {
  id: "F3",
  title: "Answer Karan at Paperplane Health",
  // Intent phrases only: a bare "karan" or "paperplane" never starts a draft.
  triggers: {
    phrases: ["answer karan", "reply to karan", "draft a reply to karan", "karan's question", "answer his question", "answer paperplane", "reply to paperplane"],
    chip: "Answer Karan",
  },
  available: (s, ctx) =>
    replyVisible(s, ctx.missionId, RP_KARAN)
      ? true
      : ctx.missionId !== "jan27"
        ? "Karan is in your Jan 2027 internship mission. Switch there and ask again."
        : "Karan has not replied yet on this day. His question lands on Day 2 (Simulated).",
  steps: (s, ctx) => {
    const fact = s.memory.find((m) => m.id === "m-start");
    return [
      {
        skill: "inbox",
        label: "Read Karan's question",
        detail: "Internship or full-time?",
        ms: 800,
        effect: (fx) => {
          fx.dispatch({ type: "SEE_REPLY", id: RP_KARAN });
          fx.dispatch({ type: "SET_TAB", tab: "replies" });
          fx.dispatch({ type: "FOCUS", item: { kind: "reply", id: RP_KARAN, label: "Karan, Paperplane Health" } });
        },
      },
      {
        skill: "write",
        label: fact ? `Found "${fact.text}" in memory` : "Checked memory for your start date",
        detail: fact ? fact.source.label : "Not in memory. Used your quiz answer",
        ms: 900,
      },
      {
        skill: "write",
        label: "Drafted a reply",
        detail: "Two lines. Not sent",
        ms: 1100,
        effect: (fx) => fx.dispatch({ type: "SET_REPLY_DRAFT", id: RP_KARAN, draft: REPLY_DRAFTS[RP_KARAN] }),
      },
    ];
  },
  done: () => [
    {
      kind: "senpai",
      text: "Draft is in Karan's thread: January 2027, six months, Pune or remote. Put it in your Gmail drafts when it reads right. You send it from Gmail, not me.",
      chips: [{ label: "Open Replies", tab: "replies" }],
    },
  ],
  result: () => ({ label: "Reply draft in Replies", tab: "replies", ids: ["paperplane"] }),
};

// ── F4: say yes and prep ────────────────────────────────────────────────────

type PrepKey = keyof typeof PREP_SEED;
const prepKey = (ctx: FlowCtx): PrepKey => (ctx.input.personId === "quillpay" || /quillpay|arjun/i.test(ctx.text ?? "") ? "quillpay" : "kitebase");
const SLOTS: Record<PrepKey, string> = { kitebase: "two Thursday slots", quillpay: "a yes for Tuesday" };

export const F4: FlowSpec = {
  id: "F4",
  title: (s, ctx) => {
    const p = personIn(s, prepKey(ctx));
    return `Say yes to ${p?.company ?? "them"} and prep`;
  },
  triggers: {
    // Intent phrases only: naming Ananya or Kitebase alone never drafts a yes.
    phrases: [
      "say yes", "prep me", "prep pack", "book the call", "accept the call", "accept the invite", "accept their invite",
      "accept kitebase", "accept quillpay", "accept ananya", "accept arjun", "yes to kitebase", "yes to quillpay",
      "yes to ananya", "yes to arjun", "prep for kitebase", "prep for quillpay", "prep for the call",
    ],
    chip: "Say yes to Kitebase and prep me",
  },
  available: (s, ctx) => {
    const key = prepKey(ctx);
    const sim = simReplyFor(key);
    if (sim && replyVisible(s, ctx.missionId, sim.id)) return true;
    if (ctx.missionId !== "jan27") return "That thread is in your Jan 2027 internship mission. Switch there and ask again.";
    return key === "quillpay"
      ? "Quillpay has not replied on this day. Their reply needs a top-up and Day 13 (Simulated)."
      : "Kitebase has not replied yet on this day. Ananya's yes lands on Day 4 (Simulated).";
  },
  steps: (s, ctx) => {
    const key = prepKey(ctx);
    const p = personIn(s, key);
    const sim = simReplyFor(key);
    const first = p?.first ?? "them";
    return [
      {
        skill: "write",
        label: `Drafted ${SLOTS[key]}`,
        detail: "In Replies. Not sent",
        ms: 1100,
        effect: (fx) => {
          if (!sim) return;
          fx.dispatch({ type: "SEE_REPLY", id: sim.id });
          fx.dispatch({ type: "SET_REPLY_DRAFT", id: sim.id, draft: REPLY_DRAFTS[sim.id] });
        },
      },
      { skill: "coach", label: `Read ${p?.company ?? "the company"} and ${first}'s role`, detail: p?.title, ms: 900 },
      { skill: "coach", label: "Picked 3 stories", detail: "Splitkart, the 11%, the dashboard", ms: 1000 },
      {
        skill: "coach",
        label: "Wrote 5 likely questions",
        detail: "Each with the resume line to use",
        ms: 1200,
        effect: (fx) => {
          fx.dispatch({ type: "ADD_PREP", prep: { id: `prep-${key}`, checks: {}, ...PREP_SEED[key] } });
          fx.dispatch({ type: "SET_TAB", tab: "prep" });
        },
      },
    ];
  },
  done: (s, ctx) => {
    const key = prepKey(ctx);
    const p = personIn(s, key);
    const chips: QuickChip[] = [
      { label: "Open Prep", tab: "prep" },
      { label: "Practise 3 questions", flow: "F12", input: { personId: key }, tone: "primary" },
    ];
    const out: ChatBody[] = [
      {
        kind: "senpai",
        text: `Two things ready. A reply to ${p?.first ?? "them"} in Replies, not sent: you put it in Gmail drafts and send it yourself. And a prep pack in Prep for ${PREP_SEED[key].when} (Simulated).`,
        chips,
      },
    ];
    return out;
  },
  result: (_s, ctx) => ({ label: "Prep pack in Prep", tab: "prep", ids: [prepKey(ctx)] }),
};
