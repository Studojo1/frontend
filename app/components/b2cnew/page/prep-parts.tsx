// Prep card pieces: the 60-second story timer, the readiness ring, the
// checklist and the outcome logger with the no-fee stamp. Group 4.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAward, FiCheck, FiPause, FiPlay, FiRotateCcw, FiTrendingUp, FiX } from "react-icons/fi";
import { COPY } from "../config";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { stampVariants, useMotionPresets } from "../motion";
import type { Person, Prep } from "../types";
import { Button, cx, FOCUS_RING } from "../ui";

export const CHECKS = [
  { id: "brief", label: "Read the brief" },
  { id: "practise", label: "Practise 3 questions" },
  { id: "ready", label: "Mark ready" },
] as const;

export const doneCount = (p: Prep) => CHECKS.filter((c) => p.checks[c.id]).length;

/** A small ring: how many of the three checks are done. */
export function ReadinessRing({ prep }: { prep: Prep }) {
  const n = doneCount(prep);
  const r = 16;
  const c = 2 * Math.PI * r;
  const ready = n === CHECKS.length;
  return (
    <span className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center" role="img" aria-label={`${n} of ${CHECKS.length} prep steps done`}>
      <svg viewBox="0 0 40 40" className="h-12 w-12 -rotate-90" aria-hidden>
        <circle cx="20" cy="20" r={r} fill="white" stroke="#171717" strokeWidth="6" />
        <circle cx="20" cy="20" r={r} fill="none" stroke="white" strokeWidth="3" />
        <motion.circle cx="20" cy="20" r={r} fill="none" stroke={ready ? "#10b981" : "#8b5cf6"} strokeWidth="3" strokeDasharray={c} initial={false} animate={{ strokeDashoffset: c * (1 - n / CHECKS.length) }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      </svg>
      <span aria-hidden className="absolute font-satoshi text-xs font-bold tabular-nums">{ready ? <FiCheck /> : `${n}/3`}</span>
    </span>
  );
}

export function Checklist({ prep }: { prep: Prep }) {
  const { dispatch } = useB2C();
  return (
    <ul className="space-y-1.5">
      {CHECKS.map((c) => {
        const on = !!prep.checks[c.id];
        return (
          <li key={c.id}>
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => dispatch({ type: "UPDATE_PREP", id: prep.id, patch: { checks: { ...prep.checks, [c.id]: !on } } })}
              className={cx("flex min-h-11 w-full items-center gap-3 rounded-xl border-2 border-studojo-ink px-3 text-left font-satoshi text-sm font-bold transition-colors", on ? "bg-studojo-green-bg" : "bg-white", FOCUS_RING)}
            >
              <span aria-hidden className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-studojo-ink", on ? "bg-studojo-green text-studojo-ink" : "bg-white")}>
                {on ? <FiCheck /> : null}
              </span>
              <span className={cx(on && "text-[#047857]")}>{c.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Say the story out loud against a 60-second bar. */
export function StoryTimer() {
  const [start, setStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (start === null) return;
    const tick = () => {
      const t = (Date.now() - start) / 1000;
      if (t >= 60) {
        setElapsed(60);
        setStart(null);
        setDone(true);
        return;
      }
      setElapsed(t);
    };
    raf.current = window.setInterval(tick, 200);
    return () => {
      if (raf.current) window.clearInterval(raf.current);
    };
  }, [start]);
  const running = start !== null;
  const secs = Math.floor(elapsed);
  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={running ? "dark" : "secondary"}
          icon={running ? <FiPause /> : <FiPlay />}
          onClick={() => {
            if (running) {
              setStart(null);
              return;
            }
            setDone(false);
            setStart(Date.now() - (elapsed >= 60 ? 0 : elapsed) * 1000);
            if (elapsed >= 60) setElapsed(0);
          }}
        >
          {running ? "Pause" : elapsed > 0 && elapsed < 60 ? "Keep going" : "Time yourself"}
        </Button>
        {elapsed > 0 ? (
          <button type="button" onClick={() => { setStart(null); setElapsed(0); setDone(false); }} aria-label="Reset the timer" className={cx("inline-flex h-11 w-11 items-center justify-center rounded-xl text-studojo-muted hover:text-studojo-ink", FOCUS_RING)}>
            <FiRotateCcw aria-hidden />
          </button>
        ) : null}
        <span className="ml-auto font-satoshi text-sm font-bold tabular-nums" aria-live="off">0:{String(secs).padStart(2, "0")} / 1:00</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-studojo-ink bg-white" role="progressbar" aria-label="Story time" aria-valuemin={0} aria-valuemax={60} aria-valuenow={secs}>
        <div className={cx("h-full origin-left", elapsed > 50 ? "bg-studojo-orange" : "bg-studojo-purple")} style={{ transform: `scaleX(${elapsed / 60})` }} />
      </div>
      <p className="mt-1 font-satoshi text-xs text-studojo-muted" aria-live="polite">
        {done ? "Time. If you ran over, cut the setup, keep the number." : "Out loud, once. Land the number before 45 seconds."}
      </p>
    </div>
  );
}

const OUTCOMES = [
  { id: "interview", label: "Next round", icon: <FiTrendingUp /> },
  { id: "offer", label: "Offer", icon: <FiAward /> },
  { id: "none", label: "No next step", icon: <FiX /> },
] as const;

export function OutcomeLogger({ prep, person, stage }: { prep: Prep; person: Person; stage: string }) {
  const { dispatch } = useB2C();
  const agent = useAgent();
  const m = useMotionPresets();
  const logged = prep.outcome ?? (stage === "interview" || stage === "offer" ? stage : undefined);
  const [fresh, setFresh] = useState(false);
  const pick = (id: (typeof OUTCOMES)[number]["id"]) => {
    dispatch({ type: "UPDATE_PREP", id: prep.id, patch: { outcome: id } });
    setFresh(true);
    if (id === "none") {
      agent.note(`Logged: no next step with ${person.company} for now. That happens. The thread stays, and so does your page.`);
      return;
    }
    dispatch({ type: "LOG_OUTCOME", personId: person.id, outcome: id });
    agent.note(`${id === "offer" ? "An offer" : "Next round"} with ${person.company}, logged. ${COPY.noFee}`);
  };
  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        {logged && logged !== "none" ? (
          <motion.div key="stamp" variants={stampVariants(m.reduced)} initial={fresh ? "hidden" : false} animate="show" className="inline-flex max-w-full flex-col items-start rounded-xl border-[3px] border-[#047857] bg-studojo-green-bg px-3 py-2 text-[#047857]">
            <span className="font-clash text-lg font-semibold uppercase tracking-wide">{logged === "offer" ? "Offer" : "Next round"}</span>
            <span className="font-satoshi text-sm font-bold">{COPY.noFee}</span>
          </motion.div>
        ) : logged === "none" ? (
          <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-satoshi text-sm text-studojo-muted">
            Logged: no next step for now.
          </motion.p>
        ) : null}
      </AnimatePresence>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Log outcome">
        {OUTCOMES.map((o) => (
          <Button key={o.id} size="sm" variant={logged === o.id ? "dark" : "secondary"} icon={o.icon} aria-pressed={logged === o.id} onClick={() => pick(o.id)}>
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
