// F1, the reference flow: the morning run. Copy its shape for F2 to F14.
// Triggers: opening the app on a day it has not run, a day change, or the
// "What happened?" chip. Steps: Inbox checks and tags replies, Send counts
// today's sends, Write drafts first emails. Ends with a summary and a
// decision card. Shared file: owned by the foundation.
import { capFor, packSends } from "./derive";
import { COPY } from "../config";
import {
  dayDate,
  EXTRA_PEOPLE,
  makeDraft,
  matchById,
  REPLY_DRAFTS,
  SIM_REPLIES,
  simulateCampaign,
  type SimReply,
} from "../data";
import type { AppState, ChatBody, MissionId } from "../types";
import type { FlowSpec, StepSpec } from "./flow-types";

export const f1Title = (day: number) => `Morning run · ${dayDate(day).label}`;
export const F1_RUN_TITLE = f1Title(6);

const company = (r: SimReply) => matchById(r.matchId)?.company ?? r.matchId;

/** What the morning run found on a day. Pure, so the seed and the flow agree. */
export function f1Facts(s: Pick<AppState, "day" | "missions" | "people" | "drafts" | "gmail">, missionId: MissionId) {
  const m = s.missions.find((x) => x.id === missionId);
  const total = m?.total ?? 0;
  const now = simulateCampaign(total, s.day);
  const prev = simulateCampaign(total, s.day - 1);
  const inMission = new Set(s.people.filter((p) => p.missionId === missionId).map((p) => p.id));
  const newReplies = now.replies.filter((r) => inMission.has(r.matchId) && !prev.replies.some((p) => p.id === r.id));
  const toDraft = missionId === "jan27"
    ? EXTRA_PEOPLE.filter((x) => x.group === "pending" && !s.drafts.some((d) => d.id === `d-first-${x.id}`))
    : [];
  const sentToday = packSends(total, s.drafts, missionId, s.day).sent - packSends(total, s.drafts, missionId, s.day - 1).sent;
  return { total, sentToday, opens: Math.max(0, now.pageOpens - prev.pageOpens), newReplies, toDraft, allSent: now.allSent };
}

/** The visible steps (labels and details only). The seed uses these for the done run on Day 6. */
export function f1Steps(day: number, total: number, drafting: boolean, newReplies?: SimReply[], paused = false): Omit<StepSpec, "effect">[] {
  const replies = newReplies ?? SIM_REPLIES.filter((r) => r.day === day && simulateCampaign(total, day).replies.some((x) => x.id === r.id));
  const sentToday = simulateCampaign(total, day).sent - simulateCampaign(total, day - 1).sent;
  const steps: Omit<StepSpec, "effect">[] = [
    { skill: "inbox", label: "Checked replies", detail: replies.length ? `${replies.length} new` : "Nothing new", ms: 900 },
    ...replies.map((r) => ({ skill: "inbox" as const, label: `Tagged ${company(r)}, ${r.tag}`, ms: 700 })),
    {
      skill: "send",
      label: "Counted today's sends",
      detail: paused ? "Paused. Nothing went out" : sentToday > 0 ? `${sentToday}, inside the cap of ${capFor(day)}` : "None today",
      ms: 800,
    },
  ];
  steps.push(
    drafting
      ? { skill: "write", label: "Drafted 12 first emails", detail: "Waiting for you", ms: 1300 }
      : { skill: "write", label: "Checked your queue", ms: 600 },
  );
  return steps;
}

export const F1: FlowSpec = {
  id: "F1",
  title: (s) => f1Title(s.day),
  triggers: { phrases: ["what happened", "morning", "update", "catch me up", "brief", "summary", "news"], chip: "What happened?" },
  available: (s, ctx) => {
    const m = s.missions.find((x) => x.id === ctx.missionId);
    return m && m.total > 0 ? true : "Nothing has been sent in this mission yet, so there is nothing to check. Want me to set it up?";
  },
  steps: (s, ctx) => {
    const f = f1Facts(s, ctx.missionId);
    const base = f1Steps(s.day, f.total, f.toDraft.length > 0, f.newReplies, s.gmail.paused);
    return base.map((st, i): StepSpec => {
      // Tag steps: draft a thank-you for a new Not now reply (never sent; it waits in Replies).
      const reply = st.label.startsWith("Tagged") ? f.newReplies[i - 1] : undefined;
      if (reply) {
        return {
          ...st,
          effect: (fx, now) => {
            const rs = now.replies.find((r) => r.id === reply.id);
            if (reply.tag === "Not now" && rs && !rs.draft && REPLY_DRAFTS[reply.id]) {
              fx.dispatch({ type: "SET_REPLY_DRAFT", id: reply.id, draft: REPLY_DRAFTS[reply.id] });
            }
            fx.dispatch({ type: "LOG", entry: { actor: "senpai", missionId: ctx.missionId, text: `Tagged ${company(reply)}: ${reply.tag}`, skill: "inbox" } });
          },
        };
      }
      if (st.skill === "write" && f.toDraft.length) {
        return {
          ...st,
          effect: (fx, now) => {
            const m = now.missions.find((x) => x.id === ctx.missionId);
            const people = now.people.filter((p) => f.toDraft.some((x) => x.id === p.id));
            fx.highlight(people.map((p) => p.id), "scanning");
            if (m) fx.dispatch({ type: "ADD_DRAFTS", drafts: people.map((p) => makeDraft(p, "first", m.target, { pageLive: now.page.live })) });
          },
        };
      }
      return st;
    });
  },
  done: (s, ctx) => {
    const f = f1Facts(s, ctx.missionId);
    const pending = s.drafts.filter((d) => d.missionId === ctx.missionId && d.status === "pending").length;
    const out: ChatBody[] = [
      {
        kind: "senpai",
        text: `Since yesterday: ${f.sentToday} first emails sent, ${f.newReplies.length} new ${f.newReplies.length === 1 ? "reply" : "replies"}, ${f.opens} page opens. All Simulated.${s.gmail.paused ? ` ${COPY.paused}` : ""}`,
      },
    ];
    // One open "Review now?" card at a time: posting this one folds any older one (see CHAT_POST).
    if (pending > 0) {
      out.push({
        kind: "decision",
        text: `${pending} ${pending === 1 ? "draft" : "drafts"} ready. Nothing is sent until you approve. Review now?`,
        actions: [{ label: "Review now", flow: "F2", tone: "primary" }, { label: "Later", tone: "plain" }],
        drafts: s.drafts.filter((d) => d.missionId === ctx.missionId && d.status === "pending").map((d) => d.id),
      });
    }
    return out;
  },
  result: (s, ctx) => {
    const f = f1Facts(s, ctx.missionId);
    const pending = s.drafts.filter((d) => d.missionId === ctx.missionId && d.status === "pending");
    if (pending.length) return { label: `${pending.length} drafts in Approvals`, tab: "approvals", ids: pending.map((d) => d.personId) };
    if (f.newReplies.length) return { label: `${f.newReplies.length} new in Replies`, tab: "replies", ids: f.newReplies.map((r) => r.matchId) };
    return undefined;
  },
};

/** Flows the foundation ships. The engine runs these plus agent/flows FLOWS. */
export const CORE_FLOWS: FlowSpec[] = [F1];
