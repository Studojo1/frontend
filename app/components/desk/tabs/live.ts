// Data and agent seams for the workspace screens.
//
// Every screen reads through the shared cache (lib/desk/cache.ts), which is
// primed by bootstrap, polled by the shell, and refetched by the invalidate
// keys each agent turn and each button sends. Filters become cache `params`,
// so every filter value is its own entry and none can show another's rows.
import { useEffect, useRef } from "react";
import { askAgent } from "~/lib/desk/agent-store";
import { invalidate, useDeskResource } from "~/lib/desk/cache";
import type { ContextItem, DeskResourceKey, InvalidateKey } from "~/lib/desk/types";

export { usePageContext } from "~/lib/desk/page-context";

export interface Live<T> {
  /** The latest value for these params; kept on screen while it refetches. */
  data: T | null;
  /** Only when there is nothing to show. A failed refetch keeps the old data. */
  error: unknown;
  /** True while a refetch is running, data or not. */
  refreshing: boolean;
  reload: () => void;
}

export function useLive<T>(key: DeskResourceKey | string, load: () => Promise<T>, params?: unknown): Live<T> {
  const r = useDeskResource<T>(key, load, { params });
  const data = r.data ?? null;
  return {
    data,
    error: data === null ? r.error : null,
    refreshing: r.loading,
    reload: () => void r.reload(),
  };
}

/** Refetch everything a workspace write touched (the same words the agent's tools send). */
export function refresh(keys: InvalidateKey[]): void {
  invalidate(keys);
}

/**
 * Hand a request to the assistant: it opens and sends the prompt as the
 * student, with the person or email attached so "them" resolves on the server.
 * False when a turn is already running (the panel shows why).
 */
export function ask(prompt: string, about?: ContextItem): boolean {
  return askAgent(prompt, about ? { selected: [about] } : {});
}

/** Re-run `tick` every `ms` while `active`, skipped while the page is hidden. */
export function usePoll(active: boolean, tick: () => void, ms = 3000): void {
  const fn = useRef(tick);
  fn.current = tick;
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") fn.current();
    }, ms);
    return () => window.clearInterval(id);
  }, [active, ms]);
}
