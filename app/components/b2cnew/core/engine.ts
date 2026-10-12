// The agent engine: runs scripted flows step by step with timers that clean
// up, one run per mission ("Next up" queues the rest), answers paused steps,
// lands results in the workspace and fires day events. No model, no network.
// Every timeout is tracked, so Stop, Reset demo and leaving the page clear
// them all. Shared file: owned by the foundation. Use it through useAgent().
import { createElement, useEffect, useMemo, useRef, type ReactNode } from "react";
import { FLOWS } from "../agent/flows";
import type { AppState, ChatBody, ChatMsg, FlowInput, MissionId, QuickChip, TabId } from "../types";
import { AgentCtx } from "./agent-ctx";
import { composerContext, liveRun, missionOf } from "./derive";
import { chipsAnywhere, chipsFor } from "./engine-chips";
import type { AgentApi, Effects, FlowCtx, FlowSpec, StepSpec } from "./flow-types";
import { CORE_FLOWS } from "./flows-core";
import { inputFrom, routeText } from "./router";
import { useB2C } from "./store";

export { chipFor, useAgent } from "./agent-ctx";

interface Active {
  runId: string;
  spec: FlowSpec;
  ctx: FlowCtx;
  steps: StepSpec[];
  i: number;
  waiting: boolean;
  /** Every step is done; the result lands in a moment. Stop no longer applies. */
  finishing: boolean;
  timer: number | null;
}

// Built lazily (first use), so an import cycle through agent/flows can never see FLOWS undefined.
let allFlows: FlowSpec[] | null = null;
function flowsAll(): FlowSpec[] {
  allFlows ??= [...CORE_FLOWS, ...FLOWS.filter((f) => f.event || !CORE_FLOWS.some((c) => c.id === f.id))];
  return allFlows;
}
const keyOf = (f: FlowSpec) => f.key ?? f.id;
const findFlow = (id: string) => flowsAll().find((f) => keyOf(f) === id) ?? flowsAll().find((f) => f.id === id);
const titleOf = (spec: FlowSpec, s: AppState, ctx: FlowCtx) => (typeof spec.title === "function" ? spec.title(s, ctx) : spec.title);

let uid = 0;
/** Ids made in event handlers only (never during render), so the server never sees them. */
const newId = (p: string) => `${p}-${Date.now().toString(36)}-${(uid += 1)}`;

export function AgentEngine({ children }: { children: ReactNode }) {
  const { s, dispatch, getState, composerRef, viewport } = useB2C();
  const active = useRef(new Map<MissionId, Active>());
  const queue = useRef(new Map<MissionId, { spec: FlowSpec; ctx: FlowCtx }[]>());
  const timers = useRef(new Set<number>());
  const alive = useRef(false);
  const reduced = useRef(false);
  const landTimer = useRef<number | null>(null);
  const lastDay = useRef<number | null>(null);
  const lastEnv = useRef<MissionId | null>(null);

  /** A tracked timeout: cleared by Stop, Reset and unmount, and a no-op once unmounted. */
  function later(fn: () => void, ms: number): number {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      if (alive.current) fn();
    }, ms);
    timers.current.add(id);
    return id;
  }
  function clearTimer(id: number | null) {
    if (id === null) return;
    window.clearTimeout(id);
    timers.current.delete(id);
  }
  function clearAll() {
    for (const t of timers.current) window.clearTimeout(t);
    timers.current.clear();
    active.current.clear();
    queue.current.clear();
    landTimer.current = null;
  }

  useEffect(() => {
    alive.current = true;
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => {
      alive.current = false;
      clearAll();
    };
  }, []);

  const post = (missionId: MissionId, body: ChatBody) => {
    const msg = { ...body, id: newId("c"), missionId, day: getState().day } as ChatMsg;
    dispatch({ type: "CHAT_POST", msg });
  };

  /** Highlights and tab bumps only show in the mission you are looking at. */
  const here = (mid: MissionId) => getState().env === mid;

  const fxFor = (missionId: MissionId): Effects => ({
    dispatch,
    get: getState,
    post: (body) => post(missionId, body),
    highlight: (ids, kind = "scanning") => {
      if (here(missionId)) dispatch({ type: "HIGHLIGHT", value: { ids, kind } });
    },
    toast: (text) => dispatch({ type: "TOAST", text }),
  });

  function schedule(mid: MissionId) {
    const a = active.current.get(mid);
    if (!a) return;
    const ms = reduced.current ? Math.min(a.steps[a.i].ms, 350) : a.steps[a.i].ms;
    a.timer = later(() => complete(mid), ms);
  }

  function detailOf(st: StepSpec, ctx: FlowCtx) {
    return typeof st.detail === "function" ? st.detail(getState(), ctx) : st.detail;
  }

  function advance(mid: MissionId) {
    const a = active.current.get(mid);
    if (!a) return;
    a.i += 1;
    if (a.i < a.steps.length) {
      dispatch({ type: "RUN_STEP", runId: a.runId, index: a.i, patch: { status: "running" } });
      schedule(mid);
    } else finish(mid);
  }

  function complete(mid: MissionId) {
    const a = active.current.get(mid);
    if (!a) return;
    a.timer = null;
    const st = a.steps[a.i];
    if (st.ask) {
      a.waiting = true;
      dispatch({ type: "RUN_STEP", runId: a.runId, index: a.i, patch: { status: "needs-you" } });
      post(mid, { kind: "senpai", text: st.ask.text, chips: st.ask.chips });
      return;
    }
    st.effect?.(fxFor(mid), getState(), a.ctx);
    dispatch({ type: "RUN_STEP", runId: a.runId, index: a.i, patch: { status: "done", detail: detailOf(st, a.ctx) } });
    advance(mid);
  }

  function finish(mid: MissionId) {
    const a = active.current.get(mid);
    if (!a) return;
    a.finishing = true;
    // A beat after the last step, so the card shows it done before the result lands.
    a.timer = later(() => {
      if (active.current.get(mid) !== a) return;
      active.current.delete(mid);
      const now = getState();
      const result = a.spec.result?.(now, a.ctx);
      dispatch({ type: "RUN_DONE", runId: a.runId, result });
      for (const body of a.spec.done?.(now, a.ctx) ?? []) post(mid, body);
      dispatch({ type: "LOG", entry: { actor: "senpai", missionId: mid, text: `Ran: ${titleOf(a.spec, now, a.ctx)}`, skill: a.steps[a.steps.length - 1]?.skill } });
      if (here(mid)) {
        if (result) {
          dispatch({ type: "BUMP", tab: result.tab });
          dispatch({ type: "HIGHLIGHT", value: { ids: result.ids, kind: "landed" } });
        } else dispatch({ type: "HIGHLIGHT", value: null });
        clearTimer(landTimer.current);
        landTimer.current = later(() => dispatch({ type: "HIGHLIGHT", value: null }), 1800);
      }
      const next = queue.current.get(mid)?.shift();
      if (next) launch(next.spec, next.ctx, true);
    }, 150);
  }

  /** quiet: queue without a chat line (day changes, day events, runs that were already queued). */
  function launch(spec: FlowSpec, ctx: FlowCtx, quiet = false) {
    const now = getState();
    const mid = ctx.missionId;
    const ok = spec.available ? spec.available(now, ctx) : true;
    if (ok !== true) {
      post(mid, { kind: "senpai", text: ok, chips: chipsAnywhere(findFlow, now, spec.id) });
      return;
    }
    const cur = active.current.get(mid);
    if (cur) {
      const q = queue.current.get(mid) ?? [];
      // One queued copy per flow: stepping the day fast does not stack morning runs.
      queue.current.set(mid, [...q.filter((x) => keyOf(x.spec) !== keyOf(spec)), { spec, ctx }]);
      if (!quiet && !spec.event) {
        const busyWith = now.runs.find((r) => r.id === cur.runId)?.title ?? "this run";
        post(mid, { kind: "senpai", text: `Got it. I will do that next, once I finish "${busyWith}".` });
      }
      return;
    }
    // An open decision card that offered this flow is settled by starting it from anywhere.
    for (const c of now.chat) {
      if (c.missionId !== mid || c.kind !== "decision" || c.resolved) continue;
      const hit = c.actions.find((x) => x.flow === spec.id);
      if (hit) dispatch({ type: "CHAT_UPDATE", id: c.id, patch: { resolved: hit.label } });
    }
    for (const body of spec.intro?.(now, ctx) ?? []) post(mid, body);
    const steps = spec.steps(now, ctx);
    if (!steps.length) {
      for (const body of spec.done?.(getState(), ctx) ?? []) post(mid, body);
      return;
    }
    const runId = newId("run");
    dispatch({
      type: "RUN_START",
      run: {
        id: runId,
        flowId: spec.id,
        missionId: mid,
        title: titleOf(spec, now, ctx),
        day: now.day,
        status: "running",
        steps: steps.map((st, i) => ({ skill: st.skill, label: st.label, status: i === 0 ? "running" : "waiting" })),
      },
    });
    post(mid, { kind: "run", runId });
    active.current.set(mid, { runId, spec, ctx, steps, i: 0, waiting: false, finishing: false, timer: null });
    schedule(mid);
  }

  const makeCtx = (input: FlowInput = {}, text?: string): FlowCtx => {
    const now = getState();
    const context = composerContext(now);
    return { missionId: now.env, input: { ...inputFrom(now, context, text), ...input }, text, context, answers: [] };
  };

  const open: AgentApi["open"] = (opts = {}) => {
    if (opts.attach) {
      const ctx = getState().composer.context.filter((c) => !(c.kind === opts.attach?.kind));
      dispatch({ type: "COMPOSER", context: [...ctx, opts.attach] });
    }
    dispatch(viewport === "wide" ? { type: "DOCK", open: true, seg: opts.seg } : { type: "DOCK", overlay: true, seg: opts.seg });
    if (opts.focus !== false) later(() => composerRef.current?.focus(), 80);
  };

  const answer = (text: string): boolean => {
    const mid = getState().env;
    const a = active.current.get(mid);
    if (!a || !a.waiting) return false;
    post(mid, { kind: "you", text, context: [] });
    a.waiting = false;
    a.ctx = { ...a.ctx, answers: [...a.ctx.answers, text] };
    const st = a.steps[a.i];
    st.effect?.(fxFor(mid), getState(), a.ctx);
    dispatch({ type: "RUN_STEP", runId: a.runId, index: a.i, patch: { status: "done", detail: text } });
    advance(mid);
    return true;
  };

  const start: AgentApi["start"] = (flowId, input) => {
    const spec = findFlow(flowId);
    if (spec) launch(spec, makeCtx(input));
  };

  const ask: AgentApi["ask"] = (raw, context) => {
    const text = raw.trim();
    if (!text) return;
    const now = getState();
    if (active.current.get(now.env)?.waiting) {
      answer(text);
      return;
    }
    const chips = context ?? composerContext(now);
    post(now.env, { kind: "you", text, context: chips.filter((c) => c.kind !== "mission" && c.kind !== "tab") });
    dispatch({ type: "COMPOSER", draft: "" });
    const route = routeText(flowsAll(), text);
    if (route.declined) {
      post(now.env, { kind: "senpai", text: "Okay, I will leave that alone. Nothing changes unless you ask.", chips: chipsAnywhere(findFlow, now, route.declined.id) });
      return;
    }
    if (!route.spec) {
      post(now.env, { kind: "senpai", text: "I can do these right now.", chips: chipsAnywhere(findFlow, now) });
      return;
    }
    launch(route.spec, { ...makeCtx(undefined, text), context: chips });
  };

  const chip: AgentApi["chip"] = (c: QuickChip) => {
    if (c.answer !== undefined && answer(c.answer)) return;
    if (c.action) dispatch(c.action);
    if (c.tab) dispatch({ type: "SET_TAB", tab: c.tab });
    if (c.flow) {
      post(getState().env, { kind: "you", text: c.label, context: [] });
      start(c.flow, c.input);
    }
  };

  const stop: AgentApi["stop"] = (runId) => {
    const entry = runId
      ? Array.from(active.current.entries()).find(([, x]) => x.runId === runId)
      : ([getState().env, active.current.get(getState().env)] as const);
    const [mid, a] = entry ?? [];
    if (!mid || !a || a.finishing) return;
    clearTimer(a.timer);
    active.current.delete(mid);
    queue.current.delete(mid);
    dispatch({ type: "RUN_STOP", runId: a.runId });
    if (here(mid)) dispatch({ type: "HIGHLIGHT", value: null });
    post(mid, { kind: "senpai", text: `Stopped. ${a.i} of ${a.steps.length} steps done; nothing after that happened.` });
  };

  const reset = () => {
    clearAll();
    lastDay.current = null;
    lastEnv.current = null;
  };

  // Opening the app (or a mission) on a day the morning run has not covered,
  // a day change, and day events (once each). Events are re-checked when you
  // switch missions, so stepping days elsewhere never skips them for good.
  useEffect(() => {
    if (!s.ready) return;
    const dayChanged = lastDay.current !== s.day;
    const envChanged = lastEnv.current !== s.env;
    if (!dayChanged && !envChanged) return;
    const forward = lastDay.current === null || s.day > lastDay.current;
    lastDay.current = s.day;
    lastEnv.current = s.env;
    const now = getState();
    const key = `F1:${now.env}:${now.day}`;
    const f1 = findFlow("F1");
    if (f1 && missionOf(now).total > 0 && !now.firedEvents.includes(key)) {
      dispatch({ type: "FIRE_EVENT", key });
      launch(f1, makeCtx(), true);
    }
    if (!forward && !envChanged) return;
    for (const f of flowsAll()) {
      const st = getState();
      if (!f.event || f.event.day > st.day) continue;
      const k = `event:${keyOf(f)}`;
      if (st.firedEvents.includes(k) || (f.event.when && !f.event.when(st))) continue;
      dispatch({ type: "FIRE_EVENT", key: k });
      launch(f, makeCtx(), true);
    }
  }, [s.ready, s.day, s.env]);

  const run = liveRun(s);
  const a = active.current.get(s.env);
  const cur = run ? run.steps.findIndex((st) => st.status === "running" || st.status === "needs-you") : -1;
  const liveStep = run && cur >= 0
    ? { runId: run.id, skill: run.steps[cur].skill, label: run.steps[cur].label, index: cur, total: run.steps.length, needsYou: run.steps[cur].status === "needs-you" }
    : null;
  const q = queue.current.get(s.env)?.[0];
  const nextUp = q ? titleOf(q.spec, s, q.ctx) : null;

  const api: AgentApi = {
    ask,
    start,
    chip,
    answer,
    stop,
    reset,
    open,
    close: () => dispatch(viewport === "wide" ? { type: "DOCK", open: false } : { type: "DOCK", overlay: false }),
    note: (text, chips) => post(getState().env, { kind: "senpai", text, chips }),
    focusComposer: () => open({ focus: true }),
    busy: !!run || !!a,
    liveStep,
    nextUp,
    quickChips: (tab?: TabId) => chipsFor(findFlow, s, tab ?? s.tab),
    flows: flowsAll(),
  };
  const value = useMemo(() => api, [s, viewport]);
  return createElement(AgentCtx.Provider, { value }, children);
}
