// The live turn: what the panel shows while a run streams, built from stream
// events by a pure reducer, and folded into a Message when the run settles.
// No network and no clock reads here beyond the fallback timestamp.
import type {
  Card,
  Confirmation,
  ConfirmationDecision,
  InvalidateKey,
  Message,
  NavigateTarget,
  OutreachDetail,
  OutreachId,
  PreviousCopy,
  RunStatus,
  Step,
  StreamEvent,
  Suggestion,
  Usage,
} from "~/lib/desk/types";

export interface LiveDraft {
  outreach: OutreachDetail;
  previous: PreviousCopy | null;
}

export interface TurnError {
  message: string;
  retryable: boolean;
  /** Retry re-sends the same client_turn_id (the server may already hold this turn). */
  sameTurn: boolean;
  signIn: boolean;
}

export type LivePhase = "sending" | "streaming" | "resuming" | "stopping" | "failed";

export interface LiveTurn {
  clientTurnId: string;
  content: string;
  confirmation: ConfirmationDecision | null;
  /** Id of the optimistic user message in the thread, or null when resuming after a reload. */
  localUserId: number | null;
  runId: number | null;
  lastSeq: number;
  text: string;
  finalContent: string | null;
  messageId: number | null;
  steps: Step[];
  cards: Card[];
  draftIds: OutreachId[];
  confirmations: Confirmation[];
  suggestions: Suggestion[];
  navigate: NavigateTarget | null;
  invalidate: InvalidateKey[];
  status: RunStatus | null;
  usage: Usage | null;
  phase: LivePhase;
  error: TurnError | null;
}

export function newLive(init: {
  clientTurnId: string;
  content: string;
  confirmation?: ConfirmationDecision | null;
  localUserId: number | null;
  runId?: number | null;
  phase?: LivePhase;
}): LiveTurn {
  return {
    clientTurnId: init.clientTurnId,
    content: init.content,
    confirmation: init.confirmation ?? null,
    localUserId: init.localUserId,
    runId: init.runId ?? null,
    lastSeq: 0,
    text: "",
    finalContent: null,
    messageId: null,
    steps: [],
    cards: [],
    draftIds: [],
    confirmations: [],
    suggestions: [],
    navigate: null,
    invalidate: [],
    status: null,
    usage: null,
    phase: init.phase ?? "sending",
    error: null,
  };
}

/** True while a turn is in flight (the composer is locked and Stop shows). */
export const isBusy = (live: LiveTurn | null) => !!live && live.phase !== "failed";

const union = (a: InvalidateKey[], b: InvalidateKey[]) => Array.from(new Set([...a, ...b]));

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const i = list.findIndex((x) => x.id === item.id);
  if (i < 0) return [...list, item];
  const next = list.slice();
  next[i] = item;
  return next;
}

/**
 * Applies one event. Text deltas are appended here too; the store batches
 * them per animation frame before calling in, so the thread does not
 * re-render per token.
 */
export function applyEvent(live: LiveTurn, evt: StreamEvent): LiveTurn {
  const l: LiveTurn = typeof evt.seq === "number" && evt.seq > live.lastSeq ? { ...live, lastSeq: evt.seq } : { ...live };
  switch (evt.type) {
    case "run_start":
      return { ...l, runId: evt.run_id, phase: l.phase === "sending" ? "streaming" : l.phase };
    case "text":
      return { ...l, text: l.text + evt.delta };
    case "tool_start":
      if (l.steps.some((s) => s.call_id === evt.call_id)) return l;
      return { ...l, steps: [...l.steps, { call_id: evt.call_id, tool: evt.tool, label: evt.label, ok: null, summary: null }] };
    case "tool_end": {
      const known = l.steps.some((s) => s.call_id === evt.call_id);
      const done = { call_id: evt.call_id, tool: evt.tool, label: evt.summary, ok: evt.ok, summary: evt.summary };
      const steps = known
        ? l.steps.map((s) => (s.call_id === evt.call_id ? { ...s, ok: evt.ok, summary: evt.summary } : s))
        : [...l.steps, done];
      return { ...l, steps, invalidate: union(l.invalidate, evt.invalidate) };
    }
    case "card":
      return { ...l, cards: [...l.cards, evt.card] };
    case "draft":
      return l.draftIds.includes(evt.outreach.id) ? l : { ...l, draftIds: [...l.draftIds, evt.outreach.id] };
    case "confirmation":
      return { ...l, confirmations: upsert(l.confirmations, evt.confirmation) };
    case "navigate":
      return { ...l, navigate: { to: evt.to, id: evt.id, filter: evt.filter } };
    case "suggestions":
      return { ...l, suggestions: evt.items.slice(0, 3) };
    case "message_end":
      return { ...l, messageId: evt.message_id, finalContent: evt.content };
    case "done":
      return { ...l, status: evt.status, usage: evt.usage, invalidate: union(l.invalidate, evt.invalidate) };
    case "error":
      return {
        ...l,
        status: "error",
        phase: "failed",
        error: { message: evt.message, retryable: evt.retryable, sameTurn: false, signIn: false },
      };
    default:
      return l;
  }
}

/** The assistant message a settled live turn becomes (when the server's own copy is not at hand). */
export function toMessage(live: LiveTurn, now: Date = new Date()): Message {
  return {
    id: live.messageId ?? -now.getTime(),
    role: "assistant",
    content: live.finalContent ?? live.text,
    created_at: now.toISOString().slice(0, 19),
    run_id: live.runId,
    status: live.status ?? "done",
    steps: live.steps,
    cards: live.cards,
    outreach_ids: live.draftIds,
    confirmations: live.confirmations,
    navigate: live.navigate,
    suggestions: live.suggestions,
  };
}

/** The optimistic user message shown the moment the student sends. */
export function userMessage(id: number, content: string, now: Date = new Date()): Message {
  return {
    id,
    role: "user",
    content,
    created_at: now.toISOString().slice(0, 19),
    run_id: null,
    status: null,
    steps: [],
    cards: [],
    outreach_ids: [],
    confirmations: [],
    navigate: null,
    suggestions: [],
  };
}

/** Text shown for a confirmation decision sent with no words, as the server stores it. */
export const decisionText = (d: ConfirmationDecision) => (d.decision === "approve" ? "Confirm" : "Cancel");

/** Naive UTC ISO from the server to a Date. */
export const serverDate = (iso: string | null | undefined) => (iso ? new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`) : null);
