// Agent panel state: one slot per thread scope ("main", "outreach:d_88"),
// the panel's open state, the page context the workspace registered, and the
// composer's selected items. Status labels live in tabs/status.tsx only. Threads live on the server; this only mirrors
// what the panel shows. Nothing here goes to localStorage except the open
// state (desk.agentOpen), read and written in try/catch.
import { create } from "zustand";
import type {
  Bootstrap,
  Confirmation,
  ContextItem,
  Message,
  NavigateTarget,
  PageContext,
  Suggestion,
  Thread,
  ThreadDetail,
  Usage,
} from "~/lib/desk/types";
import { isBusy, type LiveDraft, type LiveTurn } from "./live";

export interface ThreadSlot {
  scope: string;
  thread: Thread | null;
  messages: Message[];
  hasMore: boolean;
  loading: boolean;
  loadingEarlier: boolean;
  loadError: string | null;
  live: LiveTurn | null;
  /** Drafts seen in this thread's stream, newest copy per id. */
  drafts: Record<string, LiveDraft>;
  /** Tickets by id: a later event (approved, declined) wins over the copy in an older message. */
  confirmations: Record<string, Confirmation>;
  defaults: Suggestion[];
  greeting: string | null;
  /** Text handed back to the composer when a send could not start. */
  restoreText: string | null;
  /** A workspace prompt that arrived before the thread loaded; sent once it has. */
  queued: { prompt: string; selected: ContextItem[] | null } | null;
}

export interface SelectedItem extends ContextItem {
  label: string;
}

export interface AgentState {
  isOpen: boolean;
  slots: Record<string, ThreadSlot>;
  /** The scope of the panel on screen; askAgent sends there. */
  activeScope: string;
  pageContext: PageContext | null;
  selected: SelectedItem[];
  usage: Usage | null;
  maxChars: number;
  mainThreads: Thread[];
}

export const MAIN = "main";
export const OPEN_KEY = "desk.agentOpen";

export const emptySlot = (scope: string): ThreadSlot => ({
  scope,
  thread: null,
  messages: [],
  hasMore: false,
  loading: false,
  loadingEarlier: false,
  loadError: null,
  live: null,
  drafts: {},
  confirmations: {},
  defaults: [],
  greeting: null,
  restoreText: null,
  queued: null,
});

export const useAgentStore = create<AgentState>(() => ({
  isOpen: true,
  slots: {},
  activeScope: MAIN,
  pageContext: null,
  selected: [],
  usage: null,
  maxChars: 4000,
  mainThreads: [],
}));

export const getState = () => useAgentStore.getState();
const setState = useAgentStore.setState;

export function getSlot(scope: string): ThreadSlot {
  return getState().slots[scope] ?? emptySlot(scope);
}

export function patchSlot(scope: string, fn: (s: ThreadSlot) => Partial<ThreadSlot>) {
  setState((st) => {
    const cur = st.slots[scope] ?? emptySlot(scope);
    return { slots: { ...st.slots, [scope]: { ...cur, ...fn(cur) } } };
  });
}

export function patchLive(scope: string, fn: (l: LiveTurn) => LiveTurn | null) {
  patchSlot(scope, (s) => (s.live ? { live: fn(s.live) } : {}));
}

function ticketsOf(messages: Message[]): Record<string, Confirmation> {
  const out: Record<string, Confirmation> = {};
  for (const m of messages) for (const c of m.confirmations) out[c.id] = c;
  return out;
}

/** Puts a loaded thread into its slot. A turn in flight keeps its messages. */
export function hydrateSlot(scope: string, detail: ThreadDetail, extra: { defaults?: Suggestion[]; greeting?: string | null } = {}) {
  patchSlot(scope, (s) => {
    const base: Partial<ThreadSlot> = {
      thread: detail.thread,
      loading: false,
      loadError: null,
      ...(extra.defaults ? { defaults: extra.defaults } : {}),
      ...(extra.greeting !== undefined ? { greeting: extra.greeting } : {}),
    };
    if (isBusy(s.live) && s.thread?.id === detail.thread.id) return base;
    return {
      ...base,
      messages: detail.messages,
      hasMore: detail.has_more,
      live: null,
      confirmations: { ...ticketsOf(detail.messages) },
    };
  });
}

/** Older messages from GET /threads/{id}?before=, put in front. */
export function prependMessages(scope: string, older: Message[], hasMore: boolean) {
  patchSlot(scope, (s) => {
    const seen = new Set(s.messages.map((m) => m.id));
    const add = older.filter((m) => !seen.has(m.id));
    return { messages: [...add, ...s.messages], hasMore, loadingEarlier: false, confirmations: { ...ticketsOf(add), ...s.confirmations } };
  });
}

export function applyBootstrap(b: Bootstrap) {
  setState({
    maxChars: b.status.limits.max_message_chars || 4000,
    usage: { messages_today: b.status.limits.messages_today, messages_cap: b.status.limits.messages_cap },
    mainThreads: b.threads,
  });
}

export function setUsage(usage: Usage) {
  setState({ usage });
}

export function setMainThreads(threads: Thread[]) {
  setState({ mainThreads: threads });
}

export function setActiveScope(scope: string) {
  if (getState().activeScope !== scope) setState({ activeScope: scope });
}

// ------------------------------------------------------------------ page context and selection

export function setPageContext(ctx: PageContext | null) {
  setState({ pageContext: ctx });
}

export function attachToAgent(item: SelectedItem) {
  setState((st) => {
    if (st.selected.some((x) => x.kind === item.kind && String(x.id) === String(item.id))) return {};
    return { selected: [...st.selected, item].slice(-5) };
  });
}

export function detachFromAgent(item: ContextItem) {
  setState((st) => ({ selected: st.selected.filter((x) => !(x.kind === item.kind && String(x.id) === String(item.id))) }));
}

export function clearSelected() {
  setState({ selected: [] });
}

// ------------------------------------------------------------------ open state

const narrow = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(max-width: 1023px)").matches;

let openRead = false;
/** Reads desk.agentOpen once, after hydration. Phones start with the sheet closed. */
export function readOpenState() {
  if (openRead || typeof window === "undefined") return;
  openRead = true;
  if (narrow()) {
    setState({ isOpen: false });
    return;
  }
  try {
    const v = window.localStorage.getItem(OPEN_KEY);
    if (v === "0" || v === "1") setState({ isOpen: v === "1" });
  } catch {
    // Storage blocked: stay open.
  }
}

export function setOpen(open: boolean) {
  setState({ isOpen: open });
  if (narrow()) return;
  try {
    window.localStorage.setItem(OPEN_KEY, open ? "1" : "0");
  } catch {
    // Storage blocked: the choice lasts for this page only.
  }
}

// ------------------------------------------------------------------ navigation

type Navigator = (t: NavigateTarget) => void;
let navigator: Navigator | null = null;

/** The panel registers the router's navigate here, so navigate events can move the workspace. */
export function registerNavigator(fn: Navigator | null) {
  navigator = fn;
}

export function navigateWorkspace(t: NavigateTarget) {
  navigator?.(t);
}
