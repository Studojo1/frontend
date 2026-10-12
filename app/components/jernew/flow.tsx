// FlowProvider and hooks for /jernew: state, persistence, URL sync, guards
// and the bottom action bar. Shared file: owned by the foundation.
//
// Steps use:
//   const f = useFlow();            // data, next(), back(), update(), ...
//   useStepBar({ label: "Next" });  // the fixed bottom bar for this step
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, useNavigationType, useSearchParams } from "react-router";
import { STEP_IDS, type BarConfig, type Direction, type FlowData, type FlowSlice, type StepId } from "./types";
import { isStepId, STEP_META, stepIndex } from "./config";
import {
  canReach,
  clearSaved,
  initialState,
  isComplete as isStepComplete,
  maxReachable,
  prevStepOf,
  readSaved,
  reducer,
  writeSaved,
} from "./flow-state";

export interface FlowApi {
  /** Current step id (also in the URL as ?step=id). */
  step: StepId;
  /** Index of the current step in STEP_IDS. */
  stepIndex: number;
  /** 1 when the last move was forward, -1 when back. Drives transitions. */
  direction: Direction;
  /** False on the server and the first client frame, true once storage is read. */
  ready: boolean;
  /** Everything the student has entered so far. */
  data: FlowData;
  /** Step changes this session. 0 means first paint. */
  navCount: number;
  /** A saved session's step, offered on intro as "Pick up where you left off". */
  resumeOffer: StepId | null;

  /** Go to the next step. Does nothing if the current step is not complete. */
  next: () => void;
  /** Go to the previous step. */
  back: () => void;
  /** Jump to a step, only if every step before it is complete and it was reached. */
  goTo: (id: StepId) => void;
  /** Whether goTo(id) would work right now. */
  canGo: (id: StepId) => boolean;
  /** Whether a step's own requirements are met (see flow-state.ts isComplete). */
  isComplete: (id: StepId) => boolean;
  /** Index of the furthest step the student can open. */
  maxReachable: number;

  /** Shallow-merge into one slice: update("quiz", { role: "sde" }). */
  update: <K extends FlowSlice>(slice: K, patch: Partial<FlowData[K]>) => void;
  /** Set top-level fields: set({ pack: "pro", paid: true }). */
  set: (patch: Partial<FlowData>) => void;

  /** Clear everything (memory and storage) and go back to intro. */
  startOver: () => void;
  acceptResume: () => void;
  dismissResume: () => void;
}

interface BarSlot {
  step: StepId;
  cfg: BarConfig;
}

interface BarApi {
  slot: BarSlot | null;
  setSlot: (slot: BarSlot) => void;
}

const FlowCtx = createContext<FlowApi | null>(null);
const BarCtx = createContext<BarApi | null>(null);
/** Which step a subtree belongs to. Stays fixed while a step animates out. */
const StepScopeCtx = createContext<StepId | null>(null);

export function useFlow(): FlowApi {
  const v = useContext(FlowCtx);
  if (!v) throw new Error("useFlow must be used inside <FlowProvider>");
  return v;
}

/** The step id the calling component was rendered for. */
export function useStepScope(): StepId | null {
  return useContext(StepScopeCtx);
}

export function StepScope({ id, children }: { id: StepId; children: ReactNode }) {
  return <StepScopeCtx.Provider value={id}>{children}</StepScopeCtx.Provider>;
}

export function FlowProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const navType = useNavigationType();
  const raw = params.get("step");
  const urlStep: StepId = isStepId(raw) ? raw : "intro";
  const [state, dispatch] = useReducer(reducer, urlStep, initialState);
  const [slot, setSlot] = useState<BarSlot | null>(null);
  const navigate = useNavigate();
  // The history entries this session wrote, and which one we are on. Lets the
  // in-app Back pop history (navigate(-1)) instead of pushing a new entry, so
  // browser Back after an in-app Back never moves the student forward.
  const hist = useRef<{ entries: StepId[]; at: number }>({ entries: [], at: -1 });
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  // Read storage once, on the client only.
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    dispatch({ type: "hydrate", saved: readSaved(), urlStep });
  }, [urlStep]);

  // Autosave.
  useEffect(() => {
    if (state.ready) writeSaved(state);
  }, [state]);

  // State -> URL. Each step change becomes a history entry, so browser back works.
  useEffect(() => {
    if (!state.ready) return;
    const h = hist.current;
    if (h.at < 0) {
      h.entries = [state.step];
      h.at = 0;
    } else if (h.entries[h.at] !== state.step) {
      if (state.navKind === "push") {
        h.entries = [...h.entries.slice(0, h.at + 1), state.step];
        h.at += 1;
      } else {
        h.entries[h.at] = state.step;
      }
    }
    if (urlStep === state.step) return;
    const nextParams = new URLSearchParams(params);
    if (state.step === "intro") nextParams.delete("step");
    else nextParams.set("step", state.step);
    // unstable_defaultShouldRevalidate: false stops React Router refetching the
    // root loader (a .data request) on every step: the page has no server data.
    setParams(nextParams, {
      replace: state.navKind === "replace",
      preventScrollReset: true,
      unstable_defaultShouldRevalidate: false,
    });
    // Only a state change should write the URL; urlStep and params are read, not watched.
  }, [state.step, state.ready, state.navCount]);

  // URL -> state, for browser back and forward only.
  useEffect(() => {
    if (!state.ready || navType !== "POP" || urlStep === state.step) return;
    const h = hist.current;
    if (h.entries[h.at - 1] === urlStep) h.at -= 1;
    else if (h.entries[h.at + 1] === urlStep) h.at += 1;
    else {
      h.entries = [urlStep];
      h.at = 0;
    }
    dispatch({ type: "fromUrl", step: urlStep });
  }, [urlStep]);

  const next = useCallback(() => dispatch({ type: "next" }), []);
  const back = useCallback(() => {
    const s = stateRef.current;
    const target = prevStepOf(s.data, s.step);
    if (!target) return;
    const h = hist.current;
    // The previous history entry is the step we want: pop it like browser Back.
    if (h.at > 0 && h.entries[h.at - 1] === target && h.entries[h.at] === s.step) {
      navigate(-1);
      return;
    }
    dispatch({ type: "back", kind: "replace" });
  }, [navigate]);
  const goTo = useCallback((id: StepId) => dispatch({ type: "goto", step: id }), []);
  const update = useCallback(<K extends FlowSlice>(slice: K, patch: Partial<FlowData[K]>) => {
    dispatch({ type: "update", slice, patch: patch as Record<string, unknown> });
  }, []);
  const set = useCallback((patch: Partial<FlowData>) => dispatch({ type: "set", patch }), []);
  const startOver = useCallback(() => {
    clearSaved();
    dispatch({ type: "reset" });
  }, []);
  const acceptResume = useCallback(() => dispatch({ type: "acceptResume" }), []);
  const dismissResume = useCallback(() => dispatch({ type: "dismissResume" }), []);

  const api = useMemo<FlowApi>(
    () => ({
      step: state.step,
      stepIndex: stepIndex(state.step),
      direction: state.direction,
      ready: state.ready,
      data: state.data,
      navCount: state.navCount,
      resumeOffer: state.resumeOffer,
      next,
      back,
      goTo,
      canGo: (id) => canReach(state, id),
      isComplete: (id) => isStepComplete(state.data, id),
      maxReachable: maxReachable(state),
      update,
      set,
      startOver,
      acceptResume,
      dismissResume,
    }),
    [state, next, back, goTo, update, set, startOver, acceptResume, dismissResume],
  );

  const bar = useMemo<BarApi>(() => ({ slot, setSlot }), [slot]);

  return (
    <FlowCtx.Provider value={api}>
      <BarCtx.Provider value={bar}>{children}</BarCtx.Provider>
    </FlowCtx.Provider>
  );
}

/**
 * Sets the fixed bottom bar for the calling step. Call it once, at the top of
 * the step component, every render. Functions may change identity freely.
 *
 *   useStepBar({ label: "Approve page", disabled: !ready, onPrimary: stamp });
 *
 * Without onPrimary, the primary button calls next().
 */
export function useStepBar(cfg: BarConfig): void {
  const owner = useContext(StepScopeCtx);
  const api = useContext(BarCtx);
  const primaryRef = useRef(cfg.onPrimary);
  const secondaryRef = useRef(cfg.secondary?.onClick);
  // Keep the latest handlers without re-publishing the bar on every render.
  useEffect(() => {
    primaryRef.current = cfg.onPrimary;
    secondaryRef.current = cfg.secondary?.onClick;
  });
  const hasPrimary = Boolean(cfg.onPrimary);
  const secondaryLabel = cfg.secondary?.label;
  const setSlot = api?.setSlot;
  useEffect(() => {
    if (!owner || !setSlot) return;
    setSlot({
      step: owner,
      cfg: {
        label: cfg.label,
        disabled: cfg.disabled,
        disabledHint: cfg.disabledHint,
        hint: cfg.hint,
        hintOnPhone: cfg.hintOnPhone,
        hideBack: cfg.hideBack,
        hidden: cfg.hidden,
        enterToContinue: cfg.enterToContinue,
        tone: cfg.tone,
        onPrimary: hasPrimary ? () => primaryRef.current?.() : undefined,
        secondary: secondaryLabel ? { label: secondaryLabel, onClick: () => secondaryRef.current?.() } : undefined,
      },
    });
  }, [
    owner,
    setSlot,
    cfg.label,
    cfg.disabled,
    cfg.disabledHint,
    cfg.hint,
    cfg.hintOnPhone,
    cfg.hideBack,
    cfg.hidden,
    cfg.enterToContinue,
    cfg.tone,
    hasPrimary,
    secondaryLabel,
  ]);
}

/**
 * Shell only: the bar config for the current step. While a step animates out
 * and the next has not registered its bar yet, the last bar stays on screen
 * but inert (switching: true), so it never flickers to a wrong, greyed label
 * and Enter cannot fire a stale action.
 */
export function useResolvedBar(): BarConfig & { switching?: boolean } {
  const f = useFlow();
  const api = useContext(BarCtx);
  const slot = api?.slot;
  if (slot && slot.step === f.step) return slot.cfg;
  if (slot && f.step !== "intro") return { ...slot.cfg, secondary: undefined, switching: true };
  return {
    label: STEP_META[f.step].primary,
    disabled: !f.isComplete(f.step),
    hidden: f.step === "intro",
    switching: true,
  };
}

export const LAST_STEP: StepId = STEP_IDS[STEP_IDS.length - 1];
