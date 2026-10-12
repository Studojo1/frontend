// The scanner timeline for the upload step. Nothing is read from any file:
// the "scan" is a fixed, deterministic schedule over the sample resume.
// Owned by builder A (You).
import { useCallback, useEffect, useRef, useState } from "react";
import { RESUME_FACTS, RESUME_LINES, SCAN_STATUS, type FactSlot } from "../../data";

export type ScanPhase = "idle" | "scanning" | "done";

export interface ScanState {
  phase: ScanPhase;
  /** Index into SCAN_STATUS, or -1 before a scan. */
  status: number;
  /** Facts 0..lifted-1 have left their resume line. */
  lifted: number;
  /** Facts 0..landed-1 sit in their slots. Always <= lifted. */
  landed: number;
  /** The resume line the beam is reading, or null for the opening sweep. */
  focus: string | null;
  /** Bumps on every new scan, so the sheet can replay its sweep. */
  run: number;
}

/** Which status line introduces each slot. */
const STATUS_FOR_SLOT: Record<FactSlot, number> = {
  name: 1,
  college: 1,
  degree: 1,
  skills: 2,
  projects: 3,
  experience: 4,
};

type ScanEvent =
  | { at: number; kind: "status"; index: number }
  | { at: number; kind: "lift"; fact: number }
  | { at: number; kind: "land"; fact: number }
  | { at: number; kind: "done" };

/** Build the schedule. Reduced motion: no lift phase, short gaps, no sweep. */
export function buildSchedule(reduced: boolean): ScanEvent[] {
  const events: ScanEvent[] = [{ at: 0, kind: "status", index: 0 }];
  let t = reduced ? 160 : 760;
  let lastStatus = 0;
  RESUME_FACTS.forEach((fact, i) => {
    const s = STATUS_FOR_SLOT[fact.slot];
    if (s !== lastStatus) {
      events.push({ at: t, kind: "status", index: s });
      lastStatus = s;
      t += reduced ? 60 : 160;
    }
    const quick = fact.slot === "skills";
    const hold = reduced ? 0 : quick ? 250 : 330;
    events.push({ at: t, kind: "lift", fact: i });
    events.push({ at: t + hold, kind: "land", fact: i });
    t += reduced ? 110 : quick ? 170 : 430;
  });
  t += reduced ? 120 : 420;
  events.push({ at: t, kind: "status", index: SCAN_STATUS.length - 1 });
  events.push({ at: t, kind: "done" });
  return events;
}

const FULL = RESUME_FACTS.length;

export const IDLE: ScanState = { phase: "idle", status: -1, lifted: 0, landed: 0, focus: null, run: 0 };

function finished(run: number): ScanState {
  return { phase: "done", status: SCAN_STATUS.length - 1, lifted: FULL, landed: FULL, focus: null, run };
}

function apply(s: ScanState, e: ScanEvent): ScanState {
  switch (e.kind) {
    case "status":
      return { ...s, status: e.index };
    case "lift":
      return { ...s, lifted: Math.max(s.lifted, e.fact + 1), focus: RESUME_FACTS[e.fact].lineIds[0] };
    case "land":
      return { ...s, landed: Math.max(s.landed, e.fact + 1) };
    case "done":
      return finished(s.run);
  }
}

/**
 * Runs the scan. start() plays it, finish() jumps to the end, reset() goes
 * back to idle. onDone fires once per finished scan.
 */
export function useScan({ reduced, initiallyDone, onDone }: { reduced: boolean; initiallyDone: boolean; onDone: () => void }) {
  const [state, setState] = useState<ScanState>(() => (initiallyDone ? finished(0) : IDLE));
  const timers = useRef<number[]>([]);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  const clear = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => clear, [clear]);

  const finish = useCallback(() => {
    clear();
    setState((s) => finished(s.run));
    doneRef.current();
  }, [clear]);

  const start = useCallback(() => {
    clear();
    setState((s) => ({ ...IDLE, phase: "scanning", status: 0, run: s.run + 1 }));
    for (const e of buildSchedule(reduced)) {
      const id = window.setTimeout(() => {
        setState((s) => apply(s, e));
        if (e.kind === "done") doneRef.current();
      }, e.at);
      timers.current.push(id);
    }
  }, [clear, reduced]);

  const reset = useCallback(() => {
    clear();
    setState((s) => ({ ...IDLE, run: s.run }));
  }, [clear]);

  return { state, start, finish, reset };
}

/** 1-based line number on the sample resume, shown on evidence chips. */
export function lineNumber(id: string): number {
  return RESUME_LINES.findIndex((l) => l.id === id) + 1;
}

/** Highlighter colour and dot class per slot. Light tints so ink text stays readable. */
export const SLOT_STYLE: Record<FactSlot, { hl: string; dot: string }> = {
  name: { hl: "#ddd6fe", dot: "bg-studojo-purple" },
  college: { hl: "#fbcfe8", dot: "bg-studojo-pink" },
  degree: { hl: "#fbcfe8", dot: "bg-studojo-pink" },
  skills: { hl: "#99f6e4", dot: "bg-studojo-teal" },
  projects: { hl: "#fde68a", dot: "bg-studojo-orange" },
  experience: { hl: "#bbf7d0", dot: "bg-studojo-green" },
};

/** For each resume line, the first fact that reads it (drives the highlighter). */
export const FACT_FOR_LINE: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  RESUME_FACTS.forEach((f, i) => {
    for (const id of f.lineIds) if (!(id in map)) map[id] = i;
  });
  return map;
})();
