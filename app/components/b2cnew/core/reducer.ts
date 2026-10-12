// The one reducer for /b2cnew. UI, agent and housekeeping actions live here;
// work actions (drafts, people, replies, page, money, memory) are in
// reducer-work.ts. Pure: no window, no clock, no randomness.
// Shared file: owned by the foundation.
import { isMissionId, MAX_DAY } from "../config";
import { packSends } from "./derive";
import type { AppState, B2Action, ChatMsg } from "../types";
import { withToast } from "./reducer-util";
import { workReducer } from "./reducer-work";
import { seedState } from "./seed";

export function reducer(s: AppState, a: B2Action): AppState {
  const work = workReducer(s, a);
  if (work) return work;

  switch (a.type) {
    case "SET_ENV": {
      if (a.env === s.env || !s.missions.some((m) => m.id === a.env)) return s;
      const m = s.missions.find((x) => x.id === a.env);
      const sent = m ? packSends(m.total, s.drafts, m.id, s.day).sent : 0;
      const seq = s.seq + 1;
      const divider: ChatMsg = {
        id: `c-${seq}`,
        missionId: a.env,
        day: s.day,
        kind: "divider",
        text: `Now in ${m?.short ?? a.env}. ${sent > 0 ? `${sent} sent so far (Simulated).` : "Nothing sent here yet."}`,
      };
      // A thread that is still only its welcome needs no divider under it. A divider
      // that would sit right under the last one replaces it instead of stacking.
      const thread = s.chat.filter((c) => c.missionId === a.env);
      const onlySeed = !thread.some((c) => c.kind === "you" || c.kind === "run");
      const last = thread[thread.length - 1];
      const chat = onlySeed ? s.chat : last?.kind === "divider" ? [...s.chat.filter((c) => c.id !== last.id), divider] : [...s.chat, divider];
      // Attached chips belong to the mission you left, so they go too.
      return { ...s, seq, env: a.env, selected: null, focus: null, peopleFilter: null, highlight: null, composer: { ...s.composer, context: [] }, chat };
    }
    case "SET_TAB":
      return a.tab === s.tab ? s : { ...s, tab: a.tab, focus: null, selected: a.tab === "people" ? s.selected : null };
    case "SET_DAY": {
      const day = Math.max(0, Math.min(MAX_DAY, Math.round(a.day)));
      return day === s.day ? s : { ...s, day };
    }
    case "SELECT": {
      const p = a.id ? s.people.find((x) => x.id === a.id) : undefined;
      return {
        ...s,
        selected: p ? p.id : null,
        focus: p ? { kind: "person", id: p.id, label: `${p.first}, ${p.company}` } : s.focus?.kind === "person" ? null : s.focus,
      };
    }
    case "FOCUS":
      return { ...s, focus: a.item };
    case "DOCK":
      return { ...s, dock: { open: a.open ?? s.dock.open, overlay: a.overlay ?? s.dock.overlay, seg: a.seg ?? s.dock.seg } };
    case "SHEET":
      return { ...s, sheet: a.sheet };
    case "SET_APPROVALS_VIEW":
      return { ...s, approvalsView: a.view };

    // ── Agent ──
    case "CHAT_POST": {
      if (s.chat.some((c) => c.id === a.msg.id)) return s;
      const msg = a.msg;
      // A new "Review now?" card folds the older open ones in that mission, so they never stack up.
      const reviews = (c: ChatMsg) => c.kind === "decision" && !c.resolved && c.actions.some((x) => x.flow === "F2");
      const chat = reviews(msg)
        ? s.chat.map((c) => (c.missionId === msg.missionId && reviews(c) ? ({ ...c, resolved: "Folded into the newer card below" } as ChatMsg) : c))
        : s.chat;
      return { ...s, chat: [...chat, msg] };
    }
    case "CHAT_UPDATE":
      return { ...s, chat: s.chat.map((c) => (c.id === a.id ? ({ ...c, ...a.patch } as ChatMsg) : c)) };
    case "RUN_START":
      return { ...s, runs: [...s.runs.filter((r) => r.id !== a.run.id), a.run] };
    case "RUN_STEP":
      return {
        ...s,
        runs: s.runs.map((r) =>
          r.id === a.runId ? { ...r, steps: r.steps.map((st, i) => (i === a.index ? { ...st, ...a.patch } : st)) } : r,
        ),
      };
    case "RUN_DONE":
      return {
        ...s,
        runs: s.runs.map((r) =>
          r.id === a.runId ? { ...r, status: "done", result: a.result ?? r.result, steps: r.steps.map((st) => ({ ...st, status: "done" })) } : r,
        ),
      };
    case "RUN_STOP":
      return {
        ...s,
        runs: s.runs.map((r) =>
          r.id === a.runId && r.status === "running"
            ? { ...r, status: "stopped", steps: r.steps.map((st) => (st.status === "done" ? st : { ...st, status: "waiting" })) }
            : r,
        ),
      };
    case "LOG": {
      const seq = s.seq + 1;
      const e = a.entry;
      return { ...s, seq, log: [...s.log, { ...e, id: `l-${seq}`, day: e.day ?? s.day }] };
    }
    case "HIGHLIGHT":
      return { ...s, highlight: a.value };
    case "SET_PEOPLE_FILTER":
      return { ...s, peopleFilter: a.value };
    case "COMPOSER":
      return { ...s, composer: { context: a.context ?? s.composer.context, draft: a.draft ?? s.composer.draft } };
    case "TOAST":
      return withToast(s, a.text, a.undo);
    case "CLEAR_TOAST":
      return s.toast ? { ...s, toast: null } : s;
    case "BUMP":
      return { ...s, seq: s.seq + 1, bump: { tab: a.tab, key: s.seq + 1 } };
    case "FIRE_EVENT":
      return s.firedEvents.includes(a.key) ? s : { ...s, firedEvents: [...s.firedEvents, a.key] };
    case "RESET": {
      const fresh = seedState();
      return { ...fresh, ready: true, dock: { ...fresh.dock, open: s.dock.open } };
    }

    // ── Storage and URL ──
    case "HYDRATE": {
      const base = a.saved ? { ...s, ...a.saved } : s;
      const merged: AppState = { ...base, ...a.url, ready: true, toast: null, highlight: null, bump: null, sheet: a.url.sheet ?? null };
      // A run that was live when the tab closed reloads as stopped: its later
      // steps never ran, so the card must not claim they did.
      merged.runs = merged.runs.map((r) =>
        r.status === "running"
          ? { ...r, status: "stopped", interrupted: true, steps: r.steps.map((st) => (st.status === "done" ? st : { ...st, status: "waiting" })) }
          : r,
      );
      if (!isMissionId(merged.env) || !merged.missions.some((m) => m.id === merged.env)) merged.env = "jan27";
      return merged;
    }
    case "FROM_URL": {
      // Back or Forward into another mission clears what SET_ENV clears (no divider).
      const base = a.patch.env && a.patch.env !== s.env
        ? { ...s, selected: null, focus: null, peopleFilter: null, highlight: null, composer: { ...s.composer, context: [] } }
        : s;
      return { ...base, ...a.patch };
    }
    default:
      return s;
  }
}
