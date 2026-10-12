// Keyboard for /b2cnew. useHotkeys is for tabs (J, K, Enter, A, S, E);
// useGlobalKeys is the shell's (1 to 6, /, Ctrl or Cmd K, M, ., [ and ], Esc).
// Shared file: owned by the foundation.
import { useEffect, useRef } from "react";
import { MAX_DAY, TABS } from "../config";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";

/** True while the student is typing in a field (single keys must not fire). */
export function isTyping(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t.isContentEditable;
}

/**
 * Single-key shortcuts while a component is mounted and `enabled`. Keys are
 * lower-case ("a", "j", "enter", "arrowdown"). Ignored while typing, with a
 * modifier held, or while a dialog is open.
 *   useHotkeys({ a: approveTop, s: skipTop, e: editTop }, s.tab === "approvals");
 */
export function useHotkeys(map: Record<string, (e: KeyboardEvent) => void>, enabled = true) {
  const ref = useRef(map);
  useEffect(() => {
    ref.current = map;
  });
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || isTyping(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const fn = ref.current[e.key.toLowerCase()];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}

/** The shell's own keys. Mounted once by Shell. */
export function useGlobalKeys() {
  const { s, dispatch, viewport } = useB2C();
  const agent = useAgent();
  const live = useRef({ s, agent, viewport });
  useEffect(() => {
    live.current = { s, agent, viewport };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { s: st, agent: ag, viewport: vp } = live.current;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ag.focusComposer();
        return;
      }
      if (e.defaultPrevented || isTyping(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const tab = TABS.find((t) => t.key === e.key);
      if (tab) {
        e.preventDefault();
        dispatch({ type: "SET_TAB", tab: tab.id });
        return;
      }
      switch (e.key) {
        case "/":
          e.preventDefault();
          ag.focusComposer();
          break;
        case ".":
          e.preventDefault();
          if (vp === "wide") dispatch({ type: "DOCK", open: !st.dock.open });
          else dispatch({ type: "DOCK", overlay: !st.dock.overlay });
          break;
        case "[":
          dispatch({ type: "SET_DAY", day: Math.max(0, st.day - 1) });
          break;
        case "]":
          dispatch({ type: "SET_DAY", day: Math.min(MAX_DAY, st.day + 1) });
          break;
        case "m":
        case "M":
          dispatch({ type: "SHEET", sheet: "switcher" });
          break;
        case "Escape":
          if (st.selected) dispatch({ type: "SELECT", id: null });
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);
}
