// F5 (why this person), F6 (find 10 more like Kitebase) and F10 (who opened
// my page). Scout finds and explains; Write drafts; nothing is sent.
import { fuel, missionOf, peopleIn, pendingDrafts } from "../../core/derive";
import type { FlowCtx, FlowSpec } from "../../core/flow-types";
import { fromExtra } from "../../core/seed";
import { EXTRA_PEOPLE, makeDraft, SAMPLE_MATCH_COUNT } from "../../data";
import type { AppState, ChatBody } from "../../types";
import { andList, at, liveRunId, personIn, plural } from "./helpers";

// ── F5: why this person ─────────────────────────────────────────────────────

const whoOf = (s: AppState, ctx: FlowCtx) => {
  // The person attached or named, else whoever's drawer is open.
  const p = personIn(s, ctx.input.personId ?? s.selected ?? undefined);
  return p && p.missionId === ctx.missionId ? p : undefined;
};

export const F5: FlowSpec = {
  id: "F5",
  title: "Why this person",
  triggers: { phrases: [/\bwhy (her|him|them|this person|[a-z]{3,})\b/, "why this person", "why them", "explain the match"], chip: "Why this person?" },
  available: (s, ctx) => (whoOf(s, ctx) ? true : "Pick someone first. Tap a row in People, then ask me why."),
  steps: () => [],
  done: (s, ctx) => {
    const p = whoOf(s, ctx);
    if (!p) return [];
    return [
      { kind: "senpai", text: `Here is why ${p.first} is on your list. Fit is a Sample score, not a promise.` },
      { kind: "why", personId: p.id },
    ];
  },
};

// ── F6: find 10 more like Kitebase ──────────────────────────────────────────

// Held people not brought in yet, plus any brought in by a run that stopped
// before drafting (a reload mid-run), so asking again finishes the job.
const heldLeft = (s: AppState) =>
  EXTRA_PEOPLE.filter((x) => {
    if (x.group !== "held") return false;
    const p = s.people.find((y) => y.id === x.id);
    return !p || (p.stage !== "closed" && p.stage !== "later" && !s.drafts.some((d) => d.personId === x.id));
  });

export const F6: FlowSpec = {
  id: "F6",
  title: (s) => `Find ${Math.min(10, heldLeft(s).length) || 10} more like Kitebase`,
  triggers: {
    phrases: [
      "find more", "more like", "more people", "find people", "someone else", "swap",
      "more hiring managers", "more managers", "more contacts", "new hiring managers",
      /\b(find|get|show|add)\b[^.?!]{0,24}\b(more|new|other)\b[^.?!]{0,24}\b(hiring managers?|managers|people|contacts|founders)\b/,
    ],
    chip: "Find 10 more like Kitebase",
  },
  available: (s, ctx) => {
    if (ctx.missionId !== "jan27") return "I match people here once this mission is set up. Finding more works in your Jan 2027 internship for now.";
    return heldLeft(s).length
      ? true
      : "I already brought in the closest people in your matched pool. Approve or skip those first, then I can widen the search.";
  },
  steps: (s, ctx) => {
    const held = heldLeft(s).slice(0, 10);
    const ids = held.map((x) => x.id);
    return [
      { skill: "scout", label: "Read your target and Kitebase", detail: "Payments, Seed, Pune or Bengaluru", ms: 900 },
      {
        skill: "scout",
        label: "Searched your matched pool",
        detail: `${SAMPLE_MATCH_COUNT}, Sample`,
        ms: 1200,
        effect: (fx) => {
          fx.dispatch({ type: "ADD_PEOPLE", people: held.map((x) => fromExtra(x, "found")) });
          fx.dispatch({ type: "SET_PEOPLE_FILTER", value: { label: "Found by Senpai", ids } });
          fx.dispatch({ type: "SET_TAB", tab: "people" });
          fx.highlight(ids, "scanning");
        },
      },
      { skill: "scout", label: "Checked addresses", detail: `${held.length} verified, 1 risky dropped`, ms: 1000 },
      {
        skill: "write",
        label: `Drafted ${plural(held.length, "first email")}`,
        detail: "No credit used until you approve",
        ms: 1300,
        effect: (fx) => {
          const now = fx.get();
          const m = now.missions.find((x) => x.id === ctx.missionId);
          if (!m) return;
          const runId = liveRunId(fx, ctx.missionId);
          const people = now.people.filter((p) => ids.includes(p.id));
          fx.dispatch({ type: "ADD_DRAFTS", drafts: people.map((p) => makeDraft(p, "first", m.target, { pageLive: now.page.live, runId })) });
        },
      },
    ];
  },
  done: (s, ctx) => {
    const found = s.people.filter((p) => p.missionId === ctx.missionId && p.source === "found");
    const top = [...found].sort((a, b) => b.fit - a.fit).slice(0, 2);
    const waiting = pendingDrafts(s, ctx.missionId);
    const fresh = waiting.filter((d) => found.some((p) => p.id === d.personId)).length;
    const left = fuel(s, ctx.missionId).left;
    const out: ChatBody[] = [
      {
        kind: "senpai",
        text: `Done. ${plural(found.length, "person", "people")}, all with verified addresses. Nothing is sent until you approve.${top.length ? ` Closest to Kitebase: ${andList(top.map(at))}.` : ""}`,
      },
      {
        kind: "decision",
        text: `${plural(fresh, "new draft")} from this run${waiting.length > fresh ? `, ${waiting.length} waiting in all` : ""}.${
          left === 0 ? " Your pack has no credits left, so first emails wait for a top-up." : ""
        } Review now?`,
        actions: [
          ...(left === 0 && missionOf(s, ctx.missionId).total > 0 ? [{ label: "Top up", flow: "F13" as const, tone: "primary" as const }] : []),
          { label: "Review now", flow: "F2", tone: left === 0 ? "plain" : "primary" },
          { label: "Later", tone: "plain" },
        ],
        drafts: waiting.map((d) => d.id),
      },
    ];
    return out;
  },
  result: (s, ctx) => {
    const ids = s.people.filter((p) => p.missionId === ctx.missionId && p.source === "found").map((p) => p.id);
    return { label: `${plural(ids.length, "person", "people")} in People`, tab: "people", ids };
  },
};

// ── F10: who opened my page ─────────────────────────────────────────────────

function opens(s: AppState, missionId: AppState["env"]) {
  const opened = peopleIn(s, missionId).filter((v) => v.pageOpened);
  const quiet = opened.filter((v) => !v.reply && v.stage !== "closed" && v.stage !== "later");
  return { opened, quiet };
}

export const F10: FlowSpec = {
  id: "F10",
  title: "Who opened your page",
  triggers: { phrases: ["who opened", "page opens", "opened my page", "who viewed", "who looked", "page views"], chip: "Who opened my page?" },
  available: (s, ctx) =>
    opens(s, ctx.missionId).opened.length
      ? true
      : "No page opens yet. Your page travels in the follow-up, which goes 4 days after the first email.",
  steps: (s, ctx) => {
    const { opened, quiet } = opens(s, ctx.missionId);
    const ids = opened.map((v) => v.p.id);
    return [
      { skill: "send", label: "Read page opens", detail: `${plural(opened.length, "person", "people")}, Simulated`, ms: 800 },
      {
        skill: "scout",
        label: "Matched them to threads",
        detail: `${quiet.length} with no reply yet`,
        ms: 1000,
        effect: (fx) => {
          fx.dispatch({ type: "SET_PEOPLE_FILTER", value: { label: "Opened my page", ids } });
          fx.dispatch({ type: "SET_TAB", tab: "people" });
          fx.highlight(ids, "scanning");
        },
      },
      {
        skill: "write",
        label: "Drafted nudges for opens with no reply",
        detail: `${plural(quiet.length, "nudge")}, waiting for you`,
        ms: 1200,
        effect: (fx) => {
          const now = fx.get();
          const m = now.missions.find((x) => x.id === ctx.missionId);
          if (!m) return;
          const runId = liveRunId(fx, ctx.missionId);
          fx.dispatch({
            type: "ADD_DRAFTS",
            drafts: quiet.map((v) => makeDraft(v.p, "nudge", m.target, { pageLive: now.page.live, runId, missionId: ctx.missionId })),
          });
        },
      },
    ];
  },
  done: (s, ctx) => {
    const { opened, quiet } = opens(s, ctx.missionId);
    const replied = opened.filter((v) => v.reply).length;
    const out: ChatBody[] = [
      {
        kind: "senpai",
        text: `${plural(opened.length, "person", "people")} opened your page (Simulated). ${replied} replied. I drafted a short nudge for ${quiet.length ? andList(quiet.map((v) => v.p.first)) : "nobody"}. People is filtered to them.${s.page.live ? "" : " Your page is private, so the nudges go without the link."}`,
      },
    ];
    if (quiet.length) {
      out.push({
        kind: "decision",
        text: `${plural(quiet.length, "nudge")} waiting. A nudge is free; it goes to people you already wrote to.`,
        actions: [{ label: "Review nudges", flow: "F2", tone: "primary" }, { label: "Later", tone: "plain" }],
      });
    }
    return out;
  },
  result: (s, ctx) => {
    const { opened } = opens(s, ctx.missionId);
    return { label: `${plural(opened.length, "opener")} in People`, tab: "people", ids: opened.map((v) => v.p.id) };
  },
};
