// Stream events into the live turn: text batched per animation frame, drafts
// and tickets kept per thread, invalidate keys forwarded to the workspace
// cache, navigate events applied only when they arrive live (never on a
// replay), and the settled turn folded into the thread.
import { invalidate } from "~/lib/desk/cache";
import type { InvalidateKey, Message, StreamEvent } from "~/lib/desk/types";
import { listThreads } from "./calls";
import { applyEvent, toMessage, type TurnError } from "./live";
import { MAIN, getSlot, navigateWorkspace, patchLive, patchSlot, setMainThreads, setUsage } from "./store";

export function refresh(keys: InvalidateKey[]) {
  if (!keys.length) return;
  try {
    invalidate(keys);
  } catch {
    // The workspace cache is not mounted (for example in a test); nothing to refresh.
  }
}

// ------------------------------------------------------------------ text batching

const pending = new Map<string, { text: string; seq: number }>();
let frame = false;

export function flushScope(scope: string) {
  const p = pending.get(scope);
  if (!p) return;
  pending.delete(scope);
  patchLive(scope, (l) => ({ ...l, text: l.text + p.text, lastSeq: Math.max(l.lastSeq, p.seq) }));
}

function flushAll() {
  frame = false;
  for (const scope of Array.from(pending.keys())) flushScope(scope);
}

function schedule() {
  if (frame) return;
  frame = true;
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(flushAll);
  else setTimeout(flushAll, 16);
}

// ------------------------------------------------------------------ events

export function handleEvent(scope: string, evt: StreamEvent, replay: boolean) {
  if (evt.type === "text") {
    const p = pending.get(scope) ?? { text: "", seq: 0 };
    pending.set(scope, { text: p.text + evt.delta, seq: Math.max(p.seq, evt.seq) });
    schedule();
    return;
  }
  flushScope(scope);
  if (evt.type === "draft") {
    const { outreach, previous } = evt;
    patchSlot(scope, (s) => ({
      drafts: { ...s.drafts, [outreach.id]: { outreach, previous: previous ?? s.drafts[outreach.id]?.previous ?? null } },
    }));
  }
  if (evt.type === "confirmation") {
    patchSlot(scope, (s) => ({ confirmations: { ...s.confirmations, [evt.confirmation.id]: evt.confirmation } }));
  }
  patchLive(scope, (l) => applyEvent(l, evt));
  // A draft_emails call can run for a minute: show each finished draft in
  // the workspace as it lands instead of waiting for the tool to end.
  if (evt.type === "draft" && !replay) refresh(["outreach"]);
  if (evt.type === "tool_end") refresh(evt.invalidate);
  if (evt.type === "done") {
    // A stopped turn may have started drafts whose tool_end never came.
    refresh(evt.status === "done" ? evt.invalidate : [...evt.invalidate, "outreach", "matches", "status"]);
    setUsage(evt.usage);
  }
  if (evt.type === "navigate" && !replay) {
    // The shell drops ?ask=1 on navigation, so a phone sheet closes on its own.
    navigateWorkspace({ to: evt.to, id: evt.id, filter: evt.filter });
  }
}

export function finalize(scope: string, server: Message | null = null) {
  flushScope(scope);
  const live = getSlot(scope).live;
  if (!live) return;
  const msg = server ?? toMessage(live);
  patchSlot(scope, (s) => {
    const tickets = { ...s.confirmations };
    for (const c of msg.confirmations) if (!tickets[c.id] || tickets[c.id].status === "pending") tickets[c.id] = c;
    return { live: null, messages: [...s.messages, msg], confirmations: tickets };
  });
  if (scope === MAIN) {
    listThreads()
      .then((r) => {
        setMainThreads(r.items);
        const mine = r.items.find((t) => t.id === getSlot(MAIN).thread?.id);
        if (mine) patchSlot(MAIN, () => ({ thread: mine }));
      })
      .catch(() => {});
  }
}

export function fail(scope: string, err: Partial<TurnError> & { message: string }, restore = false) {
  flushScope(scope);
  const error: TurnError = { retryable: false, sameTurn: false, signIn: false, ...err };
  patchSlot(scope, (s) => {
    if (!s.live) return {};
    const live = { ...s.live, phase: "failed" as const, error };
    if (!restore) return { live };
    return {
      live,
      messages: s.messages.filter((m) => m.id !== s.live?.localUserId),
      restoreText: s.live.content || null,
    };
  });
}
