// B2CProvider: the one store for /b2cnew. State, persistence (localStorage
// "b2cnew:v1", inside try/catch), URL sync (env and tab push history; day and
// the person drawer replace) and the viewport. The agent engine sits inside.
// Shared file: owned by the foundation.
//
//   const { s, dispatch } = useB2C();
//   dispatch({ type: "APPROVE_DRAFT", id });
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { STORAGE_KEY } from "../config";
import type { AppState, B2Action, Mission, MissionId } from "../types";
import type { B2Dispatch } from "./actions";
import { missionOf } from "./derive";
import { AgentEngine } from "./engine";
import { reducer } from "./reducer";
import { seedState } from "./seed";
import { normSearch, parseUrl, shouldPush, toSearch } from "./url";

/** phone: under 1024px (bottom bar, sheet). compact: 1024 to 1279 (icon rail, slide-over). wide: 1280 and up. */
export type Viewport = "phone" | "compact" | "wide";

interface StoreValue {
  s: AppState;
  /** The one dispatch. It also advances a synchronous shadow, so getState() sees the change at once. */
  dispatch: B2Dispatch;
  /** The latest state, including actions dispatched since the last render (for the agent engine). */
  getState: () => AppState;
  /** The composer textarea. The agent panel attaches it; the engine focuses it. */
  composerRef: RefObject<HTMLTextAreaElement | null>;
  /** "wide" on the server and first frame; the real value after mount. */
  viewport: Viewport;
}

const StoreCtx = createContext<StoreValue | null>(null);

/** Keys that are saved. Transient UI (toast, highlight, sheet, overlay) is not. */
const PERSIST: (keyof AppState)[] = [
  "env", "tab", "day", "dock", "missions", "people", "drafts", "replies", "preps", "memory", "runs", "chat", "log",
  "page", "gmail", "firedEvents", "composer", "approvalsView", "seq",
];

/** Bump when AppState changes shape, so an old save is dropped instead of crashing render. */
const SAVE_VERSION = 2;
const ARRAY_KEYS = new Set<keyof AppState>(["missions", "people", "drafts", "replies", "preps", "memory", "runs", "chat", "log", "firedEvents"]);
const OBJECT_KEYS = new Set<keyof AppState>(["dock", "page", "gmail", "composer"]);

/** Keeps each saved key only if it has the expected shape; anything else falls back to the seed. */
function validSaved(raw: Partial<AppState>, seed: AppState): Partial<AppState> {
  const out: Record<string, unknown> = {};
  for (const k of PERSIST) {
    const v = (raw as Record<string, unknown>)[k];
    if (v === undefined) continue;
    const want = seed[k];
    if (ARRAY_KEYS.has(k) ? Array.isArray(v) : OBJECT_KEYS.has(k) ? v !== null && typeof v === "object" && !Array.isArray(v) : typeof v === typeof want) {
      out[k] = OBJECT_KEYS.has(k) ? { ...(want as object), ...(v as object) } : v;
    }
  }
  return out as Partial<AppState>;
}

function readSaved(seed: AppState): Partial<AppState> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as { v?: number; state?: Partial<AppState> };
    if (obj?.v !== SAVE_VERSION || !obj.state || !Array.isArray(obj.state.missions) || !Array.isArray(obj.state.people)) return null;
    return validSaved(obj.state, seed);
  } catch {
    return null;
  }
}

/** Long demo sessions stay light: the newest messages, log entries and runs per mission. */
const CAP = { chat: 150, log: 200, runs: 40 };
function capPerMission<T extends { missionId: string }>(xs: T[], n: number, keep?: (x: T) => boolean): T[] {
  const seen = new Map<string, number>();
  const out: T[] = [];
  for (let i = xs.length - 1; i >= 0; i--) {
    const x = xs[i];
    const c = (seen.get(x.missionId) ?? 0) + 1;
    seen.set(x.missionId, c);
    if (c <= n || keep?.(x)) out.push(x);
  }
  return out.reverse();
}

function writeSaved(s: AppState) {
  try {
    const state: Partial<AppState> = {};
    for (const k of PERSIST) (state as Record<string, unknown>)[k] = s[k];
    state.dock = { ...s.dock, overlay: false };
    const chat = capPerMission(s.chat, CAP.chat);
    const inChat = new Set(chat.flatMap((c) => (c.kind === "run" ? [c.runId] : [])));
    state.chat = chat;
    state.log = capPerMission(s.log, CAP.log);
    state.runs = capPerMission(s.runs, CAP.runs, (r) => inChat.has(r.id));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: SAVE_VERSION, state }));
  } catch {
    // Private mode or storage full: the demo still works, it just forgets.
  }
}

/** Removes the saved state (Reset demo). */
export function clearSaved() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function useViewportValue(): Viewport {
  const [v, setV] = useState<Viewport>("wide");
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1280px)");
    const compact = window.matchMedia("(min-width: 1024px)");
    const read = () => setV(wide.matches ? "wide" : compact.matches ? "compact" : "phone");
    read();
    wide.addEventListener("change", read);
    compact.addEventListener("change", read);
    return () => {
      wide.removeEventListener("change", read);
      compact.removeEventListener("change", read);
    };
  }, []);
  return v;
}

export function B2CProvider({ children }: { children: ReactNode }) {
  const [s, rawDispatch] = useReducer(reducer, undefined, seedState);
  // A shadow of the state, advanced synchronously by the same reducer in the
  // same order, so code that dispatches and then reads (the agent engine)
  // sees its own change. Synced to the committed state after each render.
  const shadow = useRef<AppState>(s);
  useLayoutEffect(() => {
    shadow.current = s;
  });
  const dispatch = useCallback<B2Dispatch>((a) => {
    shadow.current = reducer(shadow.current, a);
    rawDispatch(a);
  }, []);
  const getState = useCallback(() => shadow.current, []);
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  // When opening the overlay or a sheet pushed a history entry, closing it
  // goes back to that entry instead of replacing it (so Back is not doubled).
  const pushed = useRef<{ from: string; to: string }[]>([]);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const viewport = useViewportValue();
  const stateRef = useRef(s);
  const prevRef = useRef(s);
  const lastWritten = useRef<string | null>(null);
  useEffect(() => {
    stateRef.current = s;
  });

  // Storage and URL are read once, after the first client render.
  useEffect(() => {
    const saved = readSaved(seedState());
    const base = saved ? ({ ...stateRef.current, ...saved } as AppState) : stateRef.current;
    lastWritten.current = normSearch(location.search);
    dispatch({ type: "HYDRATE", saved, url: parseUrl(location.search, base, false) });
    // Mount only.
  }, []);

  // Autosave, lightly debounced.
  useEffect(() => {
    if (!s.ready) return;
    const t = window.setTimeout(() => writeSaved(s), 200);
    return () => window.clearTimeout(t);
  }, [s]);

  // State -> URL.
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = s;
    if (!s.ready) return;
    const want = toSearch(s);
    const cur = normSearch(params.toString());
    if (want === cur) return;
    lastWritten.current = want;
    const closing = (prev.dock.overlay && !s.dock.overlay) || (!!prev.sheet && !s.sheet);
    const top = pushed.current[pushed.current.length - 1];
    if (closing && top && top.to === cur && top.from === want) {
      pushed.current = pushed.current.slice(0, -1);
      navigate(-1);
      return;
    }
    const push = prev.ready && shouldPush(prev, s);
    const opening = (!prev.dock.overlay && s.dock.overlay) || (!prev.sheet && !!s.sheet);
    pushed.current = push && opening ? [...pushed.current, { from: cur, to: want }] : [];
    // No server data on this page, so skip refetching the root loader.
    setParams(new URLSearchParams(want), {
      replace: !push,
      preventScrollReset: true,
      unstable_defaultShouldRevalidate: false,
    });
  }, [s]);

  // URL -> state, for browser Back and Forward.
  useEffect(() => {
    if (!stateRef.current.ready) return;
    const now = normSearch(location.search);
    if (now === lastWritten.current || now === toSearch(stateRef.current)) return;
    lastWritten.current = now;
    dispatch({ type: "FROM_URL", patch: parseUrl(location.search, stateRef.current) });
  }, [location.search]);

  // A slide-over or phone sheet left open when the screen grows wide becomes the dock.
  useEffect(() => {
    if (s.ready && viewport === "wide" && s.dock.overlay) dispatch({ type: "DOCK", open: true, overlay: false });
  }, [viewport, s.ready, s.dock.overlay]);

  const value = useMemo<StoreValue>(() => ({ s, dispatch, getState, composerRef, viewport }), [s, viewport]);
  return (
    <StoreCtx.Provider value={value}>
      <AgentEngine>{children}</AgentEngine>
    </StoreCtx.Provider>
  );
}

/** The whole state and dispatch. Every component that reads or changes state uses this. */
export function useB2C(): StoreValue {
  const v = useContext(StoreCtx);
  if (!v) throw new Error("useB2C must be used inside <B2CProvider>");
  return v;
}

/** The active mission, or another by id. */
export function useMission(id?: MissionId): Mission {
  const { s } = useB2C();
  return missionOf(s, id ?? s.env);
}

/** The viewport bucket ("wide" until mounted). */
export const useViewport = () => useB2C().viewport;

/** Convenience for one-off dispatches in handlers: const act = useAct(); act({ type: "SET_TAB", tab }). */
export function useAct(): (a: B2Action) => void {
  return useB2C().dispatch;
}
