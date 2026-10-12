// Day events: short runs that fire once, the first time the simulated day
// reaches them moving forward. Day 7 all sent, Day 8 Tandem's Not now,
// Day 11 Brightfold's Hyderabad question (with the rule clash) and Day 13
// Quillpay's yes after a top-up. All replies are Simulated.
import { fuel, missionOf, snapshot } from "../../core/derive";
import type { FlowCtx, FlowSpec } from "../../core/flow-types";
import { formatINR, REPLY_DRAFTS, TOP_UP } from "../../data";
import type { AppState, ChatBody } from "../../types";
import { cityRule, personIn, replyVisible } from "./helpers";

const inJan = (s: AppState) => s.env === "jan27";

/** "12 drafts are waiting for credits. " when first emails still wait with an empty pack. */
const pendingLine = (s: AppState) => {
  const n = fuel(s, "jan27").waiting;
  return n ? `${n} draft${n === 1 ? " is" : "s are"} waiting for credits. ` : "";
};

// ── Day 7: all sent ─────────────────────────────────────────────────────────

export const DAY7: FlowSpec = {
  id: "event",
  key: "day7",
  title: "Your pack is used up",
  triggers: { phrases: [] },
  event: { day: 7, when: (s) => inJan(s) && snapshot(s, "jan27").allSent && !missionOf(s, "jan27").toppedUp },
  steps: (s) => {
    const f = fuel(s, "jan27");
    return [
      { skill: "send", label: "Counted first emails sent", detail: `${f.sent} of ${f.total}${f.reserved ? `, ${f.reserved} approved and queued` : ""}, Simulated`, ms: 800 },
      { skill: "inbox", label: "Checked what keeps running", detail: "Follow-ups and nudges, free", ms: 700 },
    ];
  },
  done: (s) => [
    {
      kind: "decision",
      text: `${pendingLine(s)}All ${missionOf(s, "jan27").total} credits in your pack are used. Follow-ups and nudges keep going and cost nothing. Want more people? A top-up is ${formatINR(TOP_UP.price)} for ${TOP_UP.outreaches} more, from people already matched.`,
      actions: [{ label: "Top up", flow: "F13", tone: "primary" }, { label: "Not now", tone: "plain" }],
    },
  ],
};

// ── Day 8: Tandem says not now ──────────────────────────────────────────────

export const DAY8: FlowSpec = {
  id: "event",
  key: "day8",
  title: "Tandem Labs said not now",
  triggers: { phrases: [] },
  event: { day: 8, when: (s) => inJan(s) && replyVisible(s, "jan27", "rp-4") && personIn(s, "tandem")?.stage !== "later" },
  steps: () => [
    { skill: "inbox", label: "Read Meera's reply", detail: "Not until summer. Write in April", ms: 800 },
    {
      skill: "scout",
      label: "Snoozed Meera until Apr 2027",
      detail: "Her unsent emails stop",
      ms: 900,
      effect: (fx, now) => {
        fx.dispatch({ type: "SNOOZE", id: "tandem", until: "Apr 2027", by: "senpai" });
        if (!now.replies.find((r) => r.id === "rp-4")?.draft) fx.dispatch({ type: "SET_REPLY_DRAFT", id: "rp-4", draft: REPLY_DRAFTS["rp-4"] });
      },
    },
  ],
  done: () => [
    {
      kind: "senpai",
      text: "Meera at Tandem Labs liked the canteen analysis but is not taking interns until summer. I snoozed her until Apr 2027; it is in Coming up on Today. A short thank-you is in Replies, not sent.",
      chips: [{ label: "Open Today", tab: "today" }],
    },
  ],
  result: () => ({ label: "Meera in Coming up", tab: "today", ids: ["tandem"] }),
};

// ── Day 11: Brightfold asks about Hyderabad ─────────────────────────────────

const ruleDay = (s: AppState) => cityRule(s, "hyderabad")?.source.label.match(/Day (\d+)/)?.[1];
const saidFine = (ctx: FlowCtx) => {
  const a = (ctx.answers[ctx.answers.length - 1] ?? "").toLowerCase();
  return /fine|yes|ok|sure|three months|3 months|works/.test(a) && !/still no|^no\b/.test(a);
};

const DECLINE = ["Hi Sana, thanks for asking.", "I am staying with Pune, Bengaluru or remote for now, so I will pass on Hyderabad. If the role can be remote, I would love to hear."];
const ACCEPT = ["Hi Sana, thanks for asking.", "Hyderabad works for the first three months, from March 2027. After that I would like Pune or remote, if that suits the team."];

export const DAY11: FlowSpec = {
  id: "event",
  key: "day11",
  title: "Brightfold asked about Hyderabad",
  triggers: { phrases: [] },
  event: { day: 11, when: (s) => inJan(s) && replyVisible(s, "jan27", "rp-5") },
  steps: (s) => {
    const rule = cityRule(s, "hyderabad");
    const read = { skill: "inbox" as const, label: "Read Sana's question", detail: "Hyderabad for the first three months?", ms: 800 };
    if (!rule) {
      return [
        read,
        {
          skill: "write",
          label: "Drafted a reply",
          detail: "In Replies. Not sent",
          ms: 1000,
          effect: (fx) => fx.dispatch({ type: "SET_REPLY_DRAFT", id: "rp-5", draft: REPLY_DRAFTS["rp-5"] }),
        },
      ];
    }
    return [
      read,
      {
        skill: "inbox",
        label: "Checked your rules",
        ms: 700,
        ask: {
          text: `You said no Hyderabad on Day ${ruleDay(s) ?? s.day}. Brightfold is asking about Hyderabad. Still no, or fine for three months?`,
          chips: [
            { label: "Still no", answer: "Still no", tone: "primary" },
            { label: "Fine for three months", answer: "Fine for three months" },
          ],
        },
        effect: (fx, now, ctx) => {
          if (!saidFine(ctx)) return;
          fx.dispatch({
            type: "ADD_MEMORY",
            by: "you",
            item: {
              id: "m-hyd-3mo",
              kind: "fact",
              text: "Open to Hyderabad from Mar 2027",
              scope: "jan27",
              source: { kind: "chat", label: `Chat on Day ${now.day}` },
              proof: "your-word",
              useInEmails: false,
            },
          });
          if (personIn(now, "brightfold")?.stage === "closed") fx.dispatch({ type: "SET_STAGE", id: "brightfold", stage: "contacted", by: "senpai" });
        },
      },
      {
        skill: "write",
        label: "Drafted a reply to Sana",
        detail: "In Replies. Not sent",
        ms: 1000,
        effect: (fx, _now, ctx) => fx.dispatch({ type: "SET_REPLY_DRAFT", id: "rp-5", draft: saidFine(ctx) ? ACCEPT : DECLINE }),
      },
    ];
  },
  done: (s, ctx) => {
    const rule = cityRule(s, "hyderabad");
    const text = !rule
      ? "Sana at Brightfold asks if you can do Hyderabad for three months. I drafted a reply asking if it can be remote. Change it if Hyderabad works. In Replies, not sent."
      : saidFine(ctx)
        ? "Saved \"Open to Hyderabad from Mar 2027\" as your word, so it stays out of emails. Brightfold is back in your pipeline and a yes is in Replies, not sent. Your no-Hyderabad rule still covers new matches."
        : "Kept the rule. A polite no is in Replies, not sent. You can still change your mind there.";
    const out: ChatBody[] = [{ kind: "senpai", text, chips: [{ label: "Open Replies", tab: "replies" }] }];
    return out;
  },
  result: () => ({ label: "Reply draft in Replies", tab: "replies", ids: ["brightfold"] }),
};

// ── Day 13: Quillpay says yes ───────────────────────────────────────────────

export const DAY13: FlowSpec = {
  id: "event",
  key: "day13",
  title: "Quillpay wants a first round",
  triggers: { phrases: [] },
  event: { day: 13, when: (s) => inJan(s) && replyVisible(s, "jan27", "rp-6") },
  steps: () => [
    { skill: "inbox", label: "Tagged Quillpay, Positive", detail: "First round next Tuesday", ms: 800 },
    {
      skill: "write",
      label: "Drafted a yes for Tuesday",
      detail: "In Replies. Not sent",
      ms: 1000,
      effect: (fx) => fx.dispatch({ type: "SET_REPLY_DRAFT", id: "rp-6", draft: REPLY_DRAFTS["rp-6"] }),
    },
  ],
  done: () => [
    {
      kind: "decision",
      text: "Arjun at Quillpay wants a first round next Tuesday (Simulated). A yes is in Replies, not sent. Want a prep pack for it?",
      actions: [
        { label: "Prep me for Quillpay", flow: "F4", input: { personId: "quillpay" }, tone: "primary" },
        { label: "Later", tone: "plain" },
      ],
    },
  ],
  result: () => ({ label: "Reply draft in Replies", tab: "replies", ids: ["quillpay"] }),
};

export const EVENTS: FlowSpec[] = [DAY7, DAY8, DAY11, DAY13];
