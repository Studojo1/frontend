// F13 (top up) and F14 (launch the data mission, start a new one, or move
// unspent credits). Payments are mock and happen in the wallet with a hold.
import { fuel, missionOf, pendingDrafts } from "../../core/derive";
import type { FlowCtx, FlowSpec, StepSpec } from "../../core/flow-types";
import { MAX_MISSIONS } from "../../config";
import { formatINR, makeDraft, PACK_RULES, packById, TOP_UP } from "../../data";
import type { AppState, ChatBody, QuickChip } from "../../types";
import { andList, liveRunId, plural } from "./helpers";
import { NEW_MISSION_ASKS, newMission, parseCities, parseMonth, parseSize } from "./mission-parts";

// ── F13: top up ─────────────────────────────────────────────────────────────

export const F13: FlowSpec = {
  id: "F13",
  title: "Top up this mission",
  triggers: { phrases: ["top up", "topup", "top-up", "more credits", "buy more", "out of credits", "ran out"], chip: "Top up" },
  available: (s, ctx) =>
    missionOf(s, ctx.missionId).total > 0
      ? true
      : `Fund this mission first. Starter is ${formatINR(packById("starter")?.price ?? 499)} for 50 outreaches.`,
  steps: (s, ctx) => [
    {
      skill: "scout",
      label: "Counted matched people not yet emailed",
      detail: `${fuel(s, ctx.missionId).left} credits left now. Room for 150 more, Sample`,
      ms: 1000,
    },
    {
      skill: "write",
      label: "Previewed the best 150",
      detail: "Fit 70 and up, Sample",
      ms: 1100,
      effect: (fx) => fx.dispatch({ type: "SHEET", sheet: "wallet" }),
    },
  ],
  done: () => [
    {
      kind: "senpai",
      text: `A top-up is ${formatINR(TOP_UP.price)} for ${TOP_UP.outreaches} more, from people already matched. ${PACK_RULES.oneTime} ${PACK_RULES.noGuarantee} Hold to pay in the wallet; it is Simulated, nothing charged.`,
      chips: [{ label: "Open wallet", action: { type: "SHEET", sheet: "wallet" }, tone: "primary" }],
    },
  ],
};

// ── F14: missions ───────────────────────────────────────────────────────────

type Mode = "launch" | "new" | "move";
const modeOf = (ctx: FlowCtx): Mode =>
  ctx.input.choice === "move" ? "move" : ctx.input.choice === "new" || /new mission|another mission|third mission/i.test(ctx.text ?? "") ? "new" : "launch";

const MOVE = 10;
/** Unspent jan27 credits that can move without starving its waiting drafts. */
function movable(s: AppState): number {
  const spare = fuel(s, "jan27").left - pendingDrafts(s, "jan27").filter((d) => d.kind === "first").length;
  return spare >= MOVE ? MOVE : 0;
}

const ft27 = (s: AppState) => s.missions.find((m) => m.id === "ft27");
const needsSwitch = (s: AppState, ctx: FlowCtx) => modeOf(ctx) === "launch" && ctx.missionId !== "ft27" && ft27(s)?.status === "draft";

function launchSteps(ctx: FlowCtx): StepSpec[] {
  const patchTarget = (fx: Parameters<NonNullable<StepSpec["effect"]>>[0], patch: Partial<AppState["missions"][number]["target"]>) => {
    const m = fx.get().missions.find((x) => x.id === "ft27");
    if (m) fx.dispatch({ type: "UPDATE_MISSION", id: "ft27", patch: { target: { ...m.target, ...patch } } });
  };
  const last = (c: FlowCtx) => c.answers[c.answers.length - 1] ?? "";
  return [
    {
      skill: "scout",
      label: "Asked where",
      ms: 500,
      ask: {
        text: "Three quick questions, prefilled from your quiz. First: which cities?",
        chips: [
          { label: "Mumbai and Bengaluru", answer: "Mumbai and Bengaluru", tone: "primary" },
          { label: "Add Pune", answer: "Mumbai, Bengaluru and Pune" },
          { label: "Remote too", answer: "Mumbai, Bengaluru and remote" },
        ],
      },
      effect: (fx, _s, c) => patchTarget(fx, parseCities(last(c), ["mumbai", "bengaluru"])),
    },
    {
      skill: "scout",
      label: "Asked when",
      ms: 500,
      ask: {
        text: "When can you start full-time?",
        chips: [
          { label: "Jul 2027", answer: "Jul 2027", tone: "primary" },
          { label: "May 2027", answer: "May 2027" },
          { label: "Flexible", answer: "Flexible" },
        ],
      },
      effect: (fx, _s, c) => patchTarget(fx, { startMonth: parseMonth(last(c), "2027-07") }),
    },
    {
      skill: "scout",
      label: "Asked company size",
      ms: 500,
      ask: {
        text: "Last one: what size of company?",
        chips: [
          { label: "Series A to B", answer: "Series A to B", tone: "primary" },
          { label: "Seed", answer: "Seed" },
          { label: "Any size", answer: "Any size" },
        ],
      },
      effect: (fx, _s, c) => patchTarget(fx, { stage: parseSize(last(c), 2) }),
    },
    {
      skill: "coach",
      label: "Set the page lens to lead with the canteen analysis",
      detail: "Your page opened from this mission's emails",
      ms: 900,
      effect: (fx) => {
        const m = fx.get().missions.find((x) => x.id === "ft27");
        if (m) fx.dispatch({ type: "UPDATE_MISSION", id: "ft27", patch: { lens: ["c-proj-2", ...m.lens.filter((c) => c !== "c-proj-2")] } });
      },
    },
    {
      skill: "scout",
      label: "Matched 4 people",
      detail: "Loomwell, Seedline, Monsoon, Orbitly. Sample",
      ms: 1200,
      effect: (fx, now) => {
        fx.dispatch({ type: "SET_TAB", tab: "people" });
        fx.highlight(now.people.filter((p) => p.missionId === "ft27").map((p) => p.id), "scanning");
      },
    },
    {
      skill: "write",
      label: "Drafted 4 first emails",
      detail: "Bold tone, waiting for you",
      ms: 1000,
      effect: (fx) => {
        const now = fx.get();
        const m = now.missions.find((x) => x.id === "ft27");
        if (!m) return;
        const runId = liveRunId(fx, "ft27");
        const people = now.people.filter((p) => p.missionId === "ft27");
        fx.dispatch({ type: "ADD_DRAFTS", drafts: people.map((p) => makeDraft(p, "first", m.target, { pageLive: now.page.live, runId, missionId: "ft27" })) });
        fx.dispatch({ type: "UPDATE_MISSION", id: "ft27", patch: { status: "ready" }, note: "Full-time 2027 is ready: 4 people, 4 drafts" });
      },
    },
  ];
}

export const F14: FlowSpec = {
  id: "F14",
  title: (_s, ctx) => (modeOf(ctx) === "move" ? "Move unspent credits" : modeOf(ctx) === "new" ? "Set up a new mission" : "Launch your data mission"),
  triggers: {
    phrases: ["data roles", "full-time", "full time", "launch my data mission", "data mission", "new mission", "another mission", "move credits", "move unspent"],
    chip: "Launch my data mission",
  },
  available: (s, ctx) => {
    const mode = modeOf(ctx);
    if (mode === "new") return s.missions.length < MAX_MISSIONS ? true : "You have three missions, the most at once. Pause or finish one first.";
    if (mode === "move") {
      if (ctx.missionId !== "ft27") return "Moving credits works from Full-time 2027. Switch there and ask again.";
      return movable(s) ? true : "Your Jan 2027 internship needs every credit it has left for the drafts waiting there.";
    }
    const m = ft27(s);
    if (!m) return "There is no data mission yet. Say \"new mission\" and I will set one up.";
    if (m.status === "draft") return true;
    return m.total > 0 ? "Full-time 2027 is already running." : "Full-time 2027 is ready. Fund it from the wallet, then approve its drafts.";
  },
  steps: (s, ctx) => {
    const mode = modeOf(ctx);
    if (needsSwitch(s, ctx)) return [];
    if (mode === "move") {
      return [
        {
          skill: "send",
          label: `Moved ${MOVE} unspent credits from Jan 2027`,
          detail: "Its waiting drafts keep theirs",
          ms: 900,
          effect: (fx) => {
            const now = fx.get();
            const jan = now.missions.find((x) => x.id === "jan27");
            const ft = now.missions.find((x) => x.id === "ft27");
            if (!jan || !ft) return;
            fx.dispatch({ type: "UPDATE_MISSION", id: "jan27", patch: { total: jan.total - MOVE }, note: `Moved ${MOVE} unspent credits to Full-time 2027` });
            fx.dispatch({ type: "UPDATE_MISSION", id: "ft27", patch: { total: ft.total + MOVE, status: "running" }, note: `Got ${MOVE} credits from Jan 2027 internship. Nothing charged` });
          },
        },
      ];
    }
    if (mode === "new") {
      return [
        ...NEW_MISSION_ASKS,
        {
          skill: "coach",
          label: "Set up Mission 3",
          detail: "A draft. Nothing sent",
          ms: 900,
          effect: (fx, now, c) => {
            const m = newMission(now, c.answers);
            fx.dispatch({ type: "CREATE_MISSION", mission: m });
            fx.dispatch({ type: "LOG", entry: { actor: "senpai", missionId: m.id, text: `Set up ${m.name} as a draft`, skill: "coach" } });
          },
        },
      ];
    }
    return launchSteps(ctx);
  },
  done: (s, ctx) => {
    if (needsSwitch(s, ctx)) {
      return [
        {
          kind: "senpai",
          text: "Your data mission is Full-time 2027. Switch there and I will set it up with three quick questions.",
          chips: [{ label: "Switch and set it up", action: { type: "SET_ENV", env: "ft27" }, flow: "F14", tone: "primary" }],
        },
      ];
    }
    const mode = modeOf(ctx);
    if (mode === "move") {
      return [{ kind: "senpai", text: `Moved ${MOVE} credits. Full-time 2027 can send now, still only what you approve. Nothing charged.` }];
    }
    if (mode === "new") {
      const m3 = s.missions.find((m) => m.id === "m3");
      return [
        {
          kind: "senpai",
          text: m3
            ? `${m3.name} is set up as a draft. I match people once you fund it; two missions never email the same person.`
            : "That did not save. You may already have three missions.",
          chips: m3 ? [{ label: `Open ${m3.short}`, action: { type: "SET_ENV", env: "m3" }, tone: "primary" }] : undefined,
        },
      ];
    }
    const actions: QuickChip[] = [
      { label: `Starter, ${formatINR(packById("starter")?.price ?? 499)} for 50`, action: { type: "SHEET", sheet: "wallet" }, tone: "primary" },
    ];
    if (movable(s)) actions.push({ label: `Move ${MOVE} unspent credits`, flow: "F14", input: { choice: "move" } });
    actions.push({ label: "Later", tone: "plain" });
    const names = s.people.filter((p) => p.missionId === "ft27").map((p) => p.company);
    const out: ChatBody[] = [
      { kind: "senpai", text: `Ready. ${plural(names.length, "person", "people")} at ${andList(names)}, ${plural(names.length, "draft")} waiting. Nothing goes out until you fund it and approve.` },
      { kind: "decision", text: "How do you want to fund it?", actions },
    ];
    return out;
  },
  result: (s, ctx) => {
    if (modeOf(ctx) !== "launch" || needsSwitch(s, ctx)) return undefined;
    const ids = s.people.filter((p) => p.missionId === "ft27").map((p) => p.id);
    return { label: `${plural(ids.length, "draft")} in Approvals`, tab: "approvals", ids };
  },
};
