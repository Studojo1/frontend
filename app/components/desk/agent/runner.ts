// Runs turns: send, stream, resume by polling, stop, retry, confirm, and the
// thread loads (bootstrap, scoped, switch, new chat, earlier messages).
// Rules from contract section 4: one fetch per turn, no automatic retry, a
// Retry re-sends the same client_turn_id when the server may already hold
// the turn, Stop aborts and cancels, a dropped body resumes by polling, and
// navigate events move the workspace only when they arrive live.
import { parseDeskParams } from "~/lib/desk/nav";
import type {
  Bootstrap,
  ConfirmationDecision,
  ContextItem,
  PageContext,
  Run,
  SendMessageBody,
} from "~/lib/desk/types";
import { cancelRun, followRun, newTurnId, sendTurn, type HttpFailure } from "~/lib/desk/stream";
import { createThread, getThread, listThreads } from "./calls";
import { fail, finalize, flushScope, handleEvent, refresh } from "./turn-events";
import { decisionText, isBusy, newLive, userMessage } from "./live";
import {
  MAIN,
  applyBootstrap,
  clearSelected,
  emptySlot,
  getSlot,
  getState,
  hydrateSlot,
  patchLive,
  patchSlot,
  prependMessages,
  setMainThreads,
} from "./store";

const controllers = new Map<string, AbortController>();
const bodies = new Map<string, SendMessageBody>();
let localIds = 0;

// ------------------------------------------------------------------ page context

/** What the URL says is on screen, for when no screen registered its own context. */
function urlParams() {
  return parseDeskParams(typeof window === "undefined" ? "" : window.location.search);
}

function contextFor(scope: string): PageContext {
  const ctx = getState().pageContext;
  if (ctx) return ctx;
  if (scope.startsWith("outreach:")) return { route: "outreach", outreach_id: scope.slice("outreach:".length) };
  const p = urlParams();
  if (p.tab === "outreach") return { route: "outreach", outreach_id: p.id };
  if (p.tab === "people") return { route: "people", query: p.q, lead_id: p.lead };
  return { route: p.tab, filter: p.tab === "home" || p.tab === "inbox" ? p.filter : null };
}

/** The thread a workspace button talks to: the outreach page's own thread there, else the main one. */
export function targetScope(): string {
  const p = urlParams();
  return p.tab === "outreach" && p.id ? `outreach:${p.id}` : MAIN;
}

/** Sends now, or once the thread has loaded (the panel may only just be opening). */
export function sendOrQueue(scope: string, prompt: string, opts: SendOptions = {}): boolean {
  if (getSlot(scope).thread) return send(scope, prompt, opts);
  patchSlot(scope, () => ({ queued: { prompt, selected: opts.selected ?? null } }));
  return true;
}

function flushQueued(scope: string) {
  const q = getSlot(scope).queued;
  if (!q || !getSlot(scope).thread || isBusy(getSlot(scope).live)) return;
  patchSlot(scope, () => ({ queued: null }));
  send(scope, q.prompt, q.selected ? { selected: q.selected } : {});
}

function timeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ turns

async function run(scope: string, body: SendMessageBody) {
  const threadId = getSlot(scope).thread?.id;
  if (!threadId) return fail(scope, { message: "This chat is still loading. Try again in a moment.", retryable: true, sameTurn: true });
  bodies.set(scope, body);
  const ctl = new AbortController();
  controllers.set(scope, ctl);
  const out = await sendTurn(threadId, body, { signal: ctl.signal, onEvent: (e) => handleEvent(scope, e, false) });
  if (controllers.get(scope) === ctl) controllers.delete(scope);
  flushScope(scope);
  const live = getSlot(scope).live;
  if (!live) return;
  switch (out.kind) {
    case "finished":
      if (out.terminal.type === "done") return finalize(scope);
      return refresh(live.invalidate);
    case "dropped":
      if (out.runId) return resume(scope, out.runId, out.lastSeq);
      return fail(scope, { message: "The connection dropped. Try again.", retryable: true, sameTurn: true });
    case "aborted": {
      const runId = out.runId ?? live.runId;
      if (runId) return resume(scope, runId, Math.max(out.lastSeq, live.lastSeq));
      return fail(scope, { message: "Stopped.", retryable: true, sameTurn: true });
    }
    case "network":
      return fail(scope, { message: out.message, retryable: true, sameTurn: true });
    case "refused":
      return refused(scope, out.failure);
  }
}

function refused(scope: string, f: HttpFailure) {
  const code = f.detail?.code;
  const runId = f.detail?.run_id ?? null;
  const live = getSlot(scope).live;
  if (code === "duplicate_turn" && runId) {
    patchLive(scope, (l) => ({ ...l, runId, phase: "resuming" }));
    return resume(scope, runId, 0);
  }
  if (code === "run_in_progress") {
    fail(scope, { message: "I am still working on your last message. Send this again once it is done." }, true);
    if (runId) void settleOther(scope, runId);
    return;
  }
  if (code === "wrong_state" && live?.confirmation) {
    const id = live.confirmation.id;
    patchSlot(scope, (s) => (s.confirmations[id] ? { confirmations: { ...s.confirmations, [id]: { ...s.confirmations[id], status: "expired" } } } : {}));
  }
  const retryable = code === "busy" || (!code && f.status >= 500);
  fail(scope, { message: f.message, retryable, sameTurn: true, signIn: f.status === 401 }, f.status === 429 || code === "daily_limit");
}

/** Another tab's turn is running: wait for it, then show the thread as the server has it. */
async function settleOther(scope: string, runId: number) {
  try {
    await followRun(runId, 0, { onEvent: () => {} });
  } catch {
    // Reload anyway.
  }
  await reloadThread(scope);
}

async function resume(scope: string, runId: number, afterSeq: number) {
  patchLive(scope, (l) => ({ ...l, runId, phase: l.phase === "stopping" ? "stopping" : "resuming" }));
  const ctl = new AbortController();
  controllers.set(scope, ctl);
  try {
    const poll = await followRun(runId, afterSeq, { signal: ctl.signal, onEvent: (e) => handleEvent(scope, e, true) });
    const live = getSlot(scope).live;
    if (!poll || !live) return;
    if (poll.run.status === "running") return;
    if (poll.run.status === "error") {
      if (live.phase !== "failed") fail(scope, { message: "That turn was interrupted. Please send it again.", retryable: true });
      return refresh(live.invalidate);
    }
    finalize(scope, poll.message);
  } catch (e) {
    const status = (e as { failure?: HttpFailure })?.failure?.status;
    fail(scope, { message: "I lost track of that turn. Reload the page to see where it ended.", signIn: status === 401 });
  } finally {
    if (controllers.get(scope) === ctl) controllers.delete(scope);
  }
}

export interface SendOptions {
  confirmation?: ConfirmationDecision | null;
  /** Items to send as page_context.selected instead of the composer's chips. */
  selected?: ContextItem[];
}

/** Sends a turn on a thread. False when it cannot start (loading, a turn in flight, empty). */
export function send(scope: string, text: string, opts: SendOptions = {}): boolean {
  const slot = getSlot(scope);
  if (!slot.thread || isBusy(slot.live)) return false;
  const content = text.trim();
  const confirmation = opts.confirmation ?? null;
  if (!content && !confirmation) return false;
  const st = getState();
  if (content.length > st.maxChars) return false;
  const localUserId = -++localIds;
  const live = newLive({ clientTurnId: newTurnId(), content, confirmation, localUserId });
  patchSlot(scope, (s) => ({
    messages: [...s.messages, userMessage(localUserId, content || (confirmation ? decisionText(confirmation) : ""))],
    live,
    restoreText: null,
  }));
  const ctx = contextFor(scope);
  const selected = (opts.selected ?? st.selected.map(({ kind, id }) => ({ kind, id }))).slice(0, 5);
  const body: SendMessageBody = {
    content,
    client_turn_id: live.clientTurnId,
    page_context: { ...ctx, selected: selected.length ? selected : (ctx.selected ?? []) },
    confirmation,
    time_zone: timeZone(),
  };
  if (!opts.selected && !confirmation) clearSelected();
  void run(scope, body);
  return true;
}

export function confirm(scope: string, id: string, decision: ConfirmationDecision["decision"]): boolean {
  return send(scope, "", { confirmation: { id, decision } });
}

export function retry(scope: string) {
  const l = getSlot(scope).live;
  if (!l || l.phase !== "failed" || !l.error?.retryable) return;
  if (l.error.sameTurn) {
    const fresh = newLive({ clientTurnId: l.clientTurnId, content: l.content, confirmation: l.confirmation, localUserId: l.localUserId });
    patchSlot(scope, () => ({ live: fresh }));
    const body = bodies.get(scope);
    if (body && body.client_turn_id === l.clientTurnId) void run(scope, body);
    else fail(scope, { message: "Send that message again." });
    return;
  }
  // The server holds that turn and its error; a new turn asks again.
  patchSlot(scope, () => ({ live: null }));
  send(scope, l.content, { confirmation: l.confirmation });
}

export function dismissError(scope: string) {
  patchSlot(scope, (s) => (s.live?.phase === "failed" ? { live: null } : {}));
}

export function stop(scope: string) {
  const l = getSlot(scope).live;
  if (!l || !isBusy(l) || l.phase === "stopping") return;
  const resuming = l.phase === "resuming";
  patchLive(scope, (x) => ({ ...x, phase: "stopping" }));
  if (l.runId) void cancelRun(l.runId).catch(() => {});
  if (!resuming) controllers.get(scope)?.abort();
}

// ------------------------------------------------------------------ threads

function resumeLatest(scope: string, latest: Run | null) {
  if (!latest || latest.status !== "running" || getSlot(scope).live) return;
  patchSlot(scope, () => ({ live: newLive({ clientTurnId: "", content: "", localUserId: null, runId: latest.id, phase: "resuming" }) }));
  void resume(scope, latest.id, 0);
}

export function hydrateMain(b: Bootstrap) {
  applyBootstrap(b);
  const slot = getSlot(MAIN);
  if (slot.thread && slot.thread.id !== b.thread.thread.id) return;
  if (slot.thread) {
    patchSlot(MAIN, () => ({ defaults: b.suggestions, greeting: b.greeting }));
    return;
  }
  hydrateSlot(MAIN, b.thread, { defaults: b.suggestions, greeting: b.greeting });
  resumeLatest(MAIN, b.thread.latest_run);
  flushQueued(MAIN);
}

export async function reloadThread(scope: string) {
  const id = getSlot(scope).thread?.id;
  if (!id) return;
  try {
    const detail = await getThread(id);
    hydrateSlot(scope, detail);
    resumeLatest(scope, detail.latest_run);
  } catch {
    // Keep what is on screen.
  }
}

export async function openThread(id: number): Promise<string | null> {
  if (isBusy(getSlot(MAIN).live)) return "Wait for the current reply to finish.";
  const keep = getSlot(MAIN);
  patchSlot(MAIN, () => ({ loading: true, loadError: null }));
  try {
    const detail = await getThread(id);
    patchSlot(MAIN, () => ({ ...emptySlot(MAIN), defaults: keep.defaults }));
    hydrateSlot(MAIN, detail);
    resumeLatest(MAIN, detail.latest_run);
    return null;
  } catch {
    patchSlot(MAIN, () => ({ loading: false }));
    return "I could not open that chat. Try again.";
  }
}

export async function newChat(): Promise<string | null> {
  const keep = getSlot(MAIN);
  if (isBusy(keep.live)) return "Wait for the current reply to finish.";
  try {
    const thread = await createThread({ scope: MAIN });
    patchSlot(MAIN, () => ({ ...emptySlot(MAIN), thread, defaults: keep.defaults }));
    refresh(["threads"]);
    listThreads()
      .then((r) => setMainThreads(r.items))
      .catch(() => {});
    return null;
  } catch {
    return "I could not start a new chat. Try again.";
  }
}

/** The thread for an outreach page: get or create, then load. */
export async function ensureScoped(scope: string) {
  const slot = getSlot(scope);
  if (slot.thread || slot.loading) return;
  patchSlot(scope, () => ({ loading: true, loadError: null }));
  try {
    const thread = await createThread({ scope });
    const detail = await getThread(thread.id);
    hydrateSlot(scope, detail);
    resumeLatest(scope, detail.latest_run);
    flushQueued(scope);
  } catch {
    patchSlot(scope, () => ({ loading: false, loadError: "I could not open the chat for this email. Reload to try again." }));
  }
}

export async function loadEarlier(scope: string) {
  const slot = getSlot(scope);
  const first = slot.messages.find((m) => m.id > 0);
  if (!slot.thread || !slot.hasMore || slot.loadingEarlier || !first) return;
  patchSlot(scope, () => ({ loadingEarlier: true }));
  try {
    const detail = await getThread(slot.thread.id, first.id);
    prependMessages(scope, detail.messages, detail.has_more);
  } catch {
    patchSlot(scope, () => ({ loadingEarlier: false }));
  }
}
