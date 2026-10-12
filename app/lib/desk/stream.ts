// The agent stream client (contract section 4).
//
// One POST per turn over plain fetch with the session cookie, read as SSE
// frames ("data: {json}\n\n", ": ping" heartbeats). Never retried
// automatically: an agent turn is not a replay, so a retry is the student's
// click and re-sends the same client_turn_id, which the server deduplicates.
// When the body drops, the run keeps going on the server; followRun polls
// GET /runs/{id}?after_seq=N until it settles and replays what was missed.
//
// Dependency free apart from types, so the parser can be tested under node.
import type { AgentErrorDetail, CancelResult, RunPoll, SendMessageBody, StreamEvent } from "./types";

export const AGENT_BASE = "/api/v1/outreach/agent";

// ------------------------------------------------------------------ parser

/**
 * Feeds one decoded chunk into the frame buffer. Returns the complete events
 * and what is left over for the next chunk. Comments (": ping") and frames
 * that are not JSON are dropped; a frame may carry several data lines.
 */
export function parseSse(chunk: string, buffer: string): { events: StreamEvent[]; buffer: string } {
  const text = (buffer + chunk).replace(/\r\n?/g, "\n");
  const frames = text.split("\n\n");
  const rest = frames.pop() ?? "";
  const events: StreamEvent[] = [];
  for (const frame of frames) {
    const data: string[] = [];
    for (const line of frame.split("\n")) {
      if (line.startsWith("data:")) data.push(line.slice(line.startsWith("data: ") ? 6 : 5));
    }
    if (!data.length) continue;
    try {
      const evt = JSON.parse(data.join("\n")) as StreamEvent;
      if (evt && typeof evt === "object" && typeof evt.type === "string") events.push(evt);
    } catch {
      // A malformed frame is skipped; the run's persisted events stay the truth.
    }
  }
  return { events, buffer: rest };
}

// ------------------------------------------------------------------ errors

/** A non 2xx answer, with the server's detail when it sent one. */
export interface HttpFailure {
  status: number;
  detail: AgentErrorDetail | null;
  message: string;
}

const FALLBACK = "Something went wrong on our side. Please try again.";

function messageFor(status: number, detail: AgentErrorDetail | null): string {
  if (detail?.message) return detail.message;
  if (status === 401) return "Your session ended. Sign in again to keep going.";
  if (status === 403) return "The assistant is not switched on for your account yet.";
  if (status === 429) return "You have reached today's limit. It resets tomorrow.";
  return FALLBACK;
}

async function readFailure(res: Response): Promise<HttpFailure> {
  let detail: AgentErrorDetail | null = null;
  try {
    const body = (await res.json()) as { detail?: unknown };
    const d = body?.detail;
    if (d && typeof d === "object" && !Array.isArray(d) && typeof (d as AgentErrorDetail).code === "string") {
      detail = d as AgentErrorDetail;
    }
  } catch {
    // An ingress error page is HTML; the status alone decides the copy.
  }
  return { status: res.status, detail, message: messageFor(res.status, detail) };
}

export class AgentHttpError extends Error {
  constructor(public failure: HttpFailure) {
    super(failure.message);
    this.name = "AgentHttpError";
  }
}

// ------------------------------------------------------------------ send

export type TurnOutcome =
  /** The stream ended with done or error. */
  | { kind: "finished"; runId: number | null; lastSeq: number; terminal: Extract<StreamEvent, { type: "done" | "error" }> }
  /** The body stopped before a terminal event: resume by polling the run. */
  | { kind: "dropped"; runId: number | null; lastSeq: number }
  /** The server refused the turn before streaming (409, 429, 503, ...). */
  | { kind: "refused"; failure: HttpFailure }
  /** The caller aborted (Stop). */
  | { kind: "aborted"; runId: number | null; lastSeq: number }
  /** fetch itself failed: no answer at all, so it is unknown whether the server got it. */
  | { kind: "network"; message: string };

export interface SendTurnOptions {
  signal: AbortSignal;
  onEvent: (evt: StreamEvent) => void;
}

const isAbort = (e: unknown) => (e as { name?: string })?.name === "AbortError";

/** POST /threads/{id}/messages and read the stream to its end. Never throws. */
export async function sendTurn(threadId: number, body: SendMessageBody, opts: SendTurnOptions): Promise<TurnOutcome> {
  let res: Response;
  try {
    res = await fetch(`${AGENT_BASE}/threads/${threadId}/messages`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify(body),
      signal: opts.signal,
    });
  } catch (e) {
    if (isAbort(e)) return { kind: "aborted", runId: null, lastSeq: 0 };
    return { kind: "network", message: "I could not reach the server. Check your connection and try again." };
  }
  if (!res.ok || !res.body) return { kind: "refused", failure: await readFailure(res) };

  type Terminal = Extract<StreamEvent, { type: "done" | "error" }>;
  // An object, not loose lets: TypeScript does not see writes made inside take().
  const st: { runId: number | null; lastSeq: number; terminal: Terminal | null } = { runId: null, lastSeq: 0, terminal: null };
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const take = (events: StreamEvent[]) => {
    for (const evt of events) {
      if (typeof evt.seq === "number" && evt.seq > st.lastSeq) st.lastSeq = evt.seq;
      if (evt.type === "run_start") st.runId = evt.run_id;
      if (evt.type === "done" || evt.type === "error") st.terminal = evt;
      opts.onEvent(evt);
    }
  };
  try {
    while (!st.terminal) {
      const { done, value } = await reader.read();
      if (done) break;
      const parsed = parseSse(decoder.decode(value, { stream: true }), buffer);
      buffer = parsed.buffer;
      take(parsed.events);
    }
    if (!st.terminal) take(parseSse(decoder.decode() + "\n\n", buffer).events);
  } catch (e) {
    if (isAbort(e) || opts.signal.aborted) return { kind: "aborted", runId: st.runId, lastSeq: st.lastSeq };
    return { kind: "dropped", runId: st.runId, lastSeq: st.lastSeq };
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // Already released.
    }
  }
  if (st.terminal) return { kind: "finished", runId: st.runId, lastSeq: st.lastSeq, terminal: st.terminal };
  if (opts.signal.aborted) return { kind: "aborted", runId: st.runId, lastSeq: st.lastSeq };
  return { kind: "dropped", runId: st.runId, lastSeq: st.lastSeq };
}

// ------------------------------------------------------------------ resume

async function getJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${AGENT_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers as Record<string, string> | undefined) },
  });
  if (!res.ok) throw new AgentHttpError(await readFailure(res));
  return (await res.json()) as T;
}

/** One poll: GET /runs/{id}?after_seq=N. */
export function pollRun(runId: number, afterSeq: number, signal?: AbortSignal): Promise<RunPoll> {
  return getJson<RunPoll>(`/runs/${runId}?after_seq=${Math.max(0, afterSeq)}`, { signal });
}

/** POST /runs/{id}/cancel. Idempotent on the server, so a lost answer is harmless. */
export function cancelRun(runId: number): Promise<CancelResult> {
  return getJson<CancelResult>(`/runs/${runId}/cancel`, { method: "POST", body: "{}" });
}

export interface FollowOptions {
  signal?: AbortSignal;
  onEvent: (evt: StreamEvent) => void;
  intervalMs?: number;
  /** Consecutive failed polls tolerated before giving up. */
  maxFailures?: number;
}

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      resolve();
    }, { once: true });
  });

/**
 * Polls a run every second until it is no longer running, handing each new
 * event to onEvent in order. Resolves with the last poll (its `message` is
 * the saved assistant reply), or null when aborted or the server stays away.
 */
export async function followRun(runId: number, afterSeq: number, opts: FollowOptions): Promise<RunPoll | null> {
  let seq = afterSeq;
  let failures = 0;
  const interval = opts.intervalMs ?? 1000;
  const maxFailures = opts.maxFailures ?? 8;
  while (!opts.signal?.aborted) {
    try {
      const poll = await pollRun(runId, seq, opts.signal);
      failures = 0;
      for (const evt of poll.events) {
        if (evt.seq <= seq) continue;
        seq = evt.seq;
        opts.onEvent(evt);
      }
      if (poll.run.status !== "running") return poll;
    } catch (e) {
      if (isAbort(e) || opts.signal?.aborted) return null;
      const status = (e as AgentHttpError)?.failure?.status;
      if (status === 404 || status === 401 || status === 403) throw e;
      failures += 1;
      if (failures >= maxFailures) throw e;
    }
    await wait(interval, opts.signal);
  }
  return null;
}

/** A client_turn_id. Reused on Retry so the server can tell it is the same turn. */
export function newTurnId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    // Older browsers fall through.
  }
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
