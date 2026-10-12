// The hooks the rest of the desk uses (contract section 10):
//   useAgent()            the panel's thread, messages, live turn and actions
//   askAgent(prompt)      a workspace button that hands a prompt to the agent
//   usePageContext(ctx)   each screen says what the student is looking at
//   attachToAgent(item)   put a person or an email in the composer's chips
import { useEffect, useMemo } from "react";
import type { ConfirmationDecision, ContextItem, Message, PageContext, Thread } from "~/lib/desk/types";
import { isBusy, type LiveTurn } from "./live";
import { confirm as confirmTurn, newChat, retry, send, sendOrQueue, stop, targetScope, type SendOptions } from "./runner";
import {
  MAIN,
  attachToAgent,
  emptySlot,
  getState,
  readOpenState,
  setOpen,
  setPageContext,
  useAgentStore,
  type SelectedItem,
  type ThreadSlot,
} from "./store";

export { attachToAgent, detachFromAgent } from "./store";
export type { SelectedItem } from "./store";

/** Normalises a panel scope: "outreach:d_88" stays, a bare outreach id gains the prefix, anything else is main. */
export function scopeKey(scope?: string | null): string {
  if (!scope || scope === MAIN) return MAIN;
  if (scope.startsWith("outreach:")) return scope;
  return /^[de]_[1-9][0-9]*$/.test(scope) ? `outreach:${scope}` : MAIN;
}

/** The slot for a scope, re-rendering only when that slot changes. */
export function useSlot(scope: string): ThreadSlot {
  const slot = useAgentStore((s) => s.slots[scope]);
  return useMemo(() => slot ?? emptySlot(scope), [slot, scope]);
}

export interface AgentHandle {
  scope: string;
  thread: Thread | null;
  messages: Message[];
  live: LiveTurn | null;
  busy: boolean;
  isOpen: boolean;
  send: (text: string, opts?: SendOptions) => boolean;
  confirm: (id: string, decision: ConfirmationDecision["decision"]) => boolean;
  stop: () => void;
  retry: () => void;
  newChat: () => Promise<string | null>;
  open: () => void;
  close: () => void;
}

/** Without a scope it follows the panel on screen (the outreach thread on an outreach page). */
export function useAgent(scope?: string): AgentHandle {
  const active = useAgentStore((s) => s.activeScope);
  const key = scope === undefined ? active : scopeKey(scope);
  const slot = useSlot(key);
  const isOpen = useAgentStore((s) => s.isOpen);
  useEffect(() => readOpenState(), []);
  return useMemo(
    () => ({
      scope: key,
      thread: slot.thread,
      messages: slot.messages,
      live: slot.live,
      busy: isBusy(slot.live),
      isOpen,
      send: (text: string, opts?: SendOptions) => send(key, text, opts),
      confirm: (id: string, decision: ConfirmationDecision["decision"]) => confirmTurn(key, id, decision),
      stop: () => stop(key),
      retry: () => retry(key),
      newChat,
      open: () => setOpen(true),
      close: () => setOpen(false),
    }),
    [key, slot, isOpen],
  );
}

/**
 * Sends a prompt from a workspace button to the agent (the outreach thread
 * on an outreach page, else the main thread) and opens the panel. When the
 * panel has not loaded that thread yet, the prompt waits and goes once it
 * has. False when a turn is already running.
 */
export function askAgent(prompt: string, opts: { selected?: (ContextItem | SelectedItem)[] } = {}): boolean {
  setOpen(true);
  const selected = opts.selected?.map(({ kind, id }) => ({ kind, id }));
  return sendOrQueue(targetScope(), prompt, selected ? { selected } : {});
}

/** Registers what the visible screen shows; the composer sends the latest with every message. */
export function usePageContext(ctx: PageContext | null) {
  const sig = JSON.stringify(ctx);
  useEffect(() => {
    const value = sig === "null" ? null : (JSON.parse(sig) as PageContext);
    setPageContext(value);
    return () => {
      if (JSON.stringify(getState().pageContext) === sig) setPageContext(null);
    };
  }, [sig]);
}

/** Convenience for a workspace row: attach a person to the composer and open the panel. */
export function askAbout(item: SelectedItem) {
  attachToAgent(item);
  setOpen(true);
}
