// The matches radar: a sweep arm turns once, and each company blip pops in as
// the arm passes it. Closer to the centre (you) means a better fit. The list
// beside it is the text equivalent, so the radar itself is aria-hidden.
// Owned by builder C.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { RankedMatch } from "../../data";
import { SPRING_SNAP, useMotionPresets } from "../../motion";
import { cx } from "../../ui";
import { bandStyle, STAGE_BANDS } from "./bits";

const FIRST_SWEEP_MS = 2600;
const C = 160;
const R = 146;
/** Ring radii as a share of R, inner to outer. */
const RINGS = [0.36, 0.58, 0.8, 1];
const R_MIN = 0.3;
const R_MAX = 0.9;

/**
 * Spreads this student's matches across the radar: the best fit sits on the
 * inner ring, the weakest near the edge. Scores cluster, so the spread is
 * relative to the set, not absolute.
 */
function radiusFor(fit: number, lo: number, hi: number) {
  const t = hi === lo ? 0 : (hi - fit) / (hi - lo);
  return R * (R_MIN + t * (R_MAX - R_MIN));
}

function pointFor(m: RankedMatch, lo: number, hi: number) {
  const rad = (m.angle * Math.PI) / 180;
  const r = radiusFor(m.fit, lo, hi);
  return { x: C + r * Math.sin(rad), y: C - r * Math.cos(rad) };
}

function range(matches: RankedMatch[]) {
  const fits = matches.map((x) => x.fit);
  return { lo: Math.min(...fits), hi: Math.max(...fits) };
}

export interface RadarProps {
  matches: RankedMatch[];
  /** Ids that pass the current filter. Others are dimmed. */
  visible: Set<string>;
  activeId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  /** Called once when every blip is on screen. */
  onSweepDone: () => void;
  /** Skip the first sweep (returning to the step). */
  instant: boolean;
  /** False until the radar is on screen, so the one-time sweep is never played out of sight. */
  armed?: boolean;
}

export function Radar({ matches, visible, activeId, onSelect, onHover, onSweepDone, instant, armed = true }: RadarProps) {
  const m = useMotionPresets();
  const skip = instant || m.reduced;
  const [found, setFound] = useState<Set<string>>(() => (skip ? new Set(matches.map((x) => x.id)) : new Set()));
  const [phase, setPhase] = useState<"first" | "idle">(skip ? "idle" : "first");
  const doneRef = useRef(onSweepDone);
  useEffect(() => {
    doneRef.current = onSweepDone;
  });

  // Reveal each blip when the arm reaches its angle. Timers live in an effect.
  useEffect(() => {
    if (skip) {
      setFound(new Set(matches.map((x) => x.id)));
      setPhase("idle");
      doneRef.current();
      return;
    }
    if (!armed) return;
    const timers = matches.map((x) =>
      window.setTimeout(() => setFound((prev) => new Set(prev).add(x.id)), (x.angle / 360) * FIRST_SWEEP_MS),
    );
    const end = window.setTimeout(() => {
      setPhase("idle");
      doneRef.current();
    }, FIRST_SWEEP_MS + 80);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(end);
    };
    // Runs once per mount (once armed); the match set is fixed for the step's lifetime.
  }, [skip, armed]);

  const active = matches.find((x) => x.id === activeId) ?? null;
  const { lo, hi } = range(matches);

  return (
    <div aria-hidden className="relative mx-auto aspect-square w-full max-w-[340px] select-none">
      {/* Rings and crosshair */}
      <svg viewBox="0 0 320 320" className="absolute inset-0 h-full w-full">
        <circle cx={C} cy={C} r={R + 6} fill="#fffbeb" stroke="#171717" strokeWidth="2" />
        {RINGS.map((f) => (
          <circle key={f} cx={C} cy={C} r={R * f} fill="none" stroke="#171717" strokeOpacity="0.18" strokeDasharray="3 5" />
        ))}
        <line x1={C} y1={C - R} x2={C} y2={C + R} stroke="#171717" strokeOpacity="0.1" />
        <line x1={C - R} y1={C} x2={C + R} y2={C} stroke="#171717" strokeOpacity="0.1" />
      </svg>

      {/* Sweep arm with a fading wedge behind it */}
      {!m.reduced ? (
        <motion.div
          key={phase}
          className="pointer-events-none absolute rounded-full"
          style={{
            inset: `${((C - R) / 320) * 100}%`,
            background:
              "conic-gradient(from 0deg, rgba(245,158,11,0) 0deg, rgba(245,158,11,0) 290deg, rgba(245,158,11,0.08) 300deg, rgba(245,158,11,0.42) 360deg)",
            opacity: phase === "idle" ? 0.55 : 1,
          }}
          initial={{ rotate: 0 }}
          animate={{ rotate: armed || phase === "idle" ? 360 : 0 }}
          transition={
            phase === "first"
              ? { duration: FIRST_SWEEP_MS / 1000, ease: "linear" }
              : { duration: 9, ease: "linear", repeat: Infinity }
          }
        >
          <span className="absolute left-1/2 top-0 h-1/2 w-[2px] -translate-x-1/2 bg-studojo-ink" />
        </motion.div>
      ) : null}

      {/* You, at the centre */}
      <span
        className="absolute left-1/2 top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-purple-strong font-clash text-sm font-semibold text-white shadow-[2px_2px_0_0_#191a23]"
      >
        You
      </span>

      {/* Blips */}
      {matches.map((x) => {
        const p = pointFor(x, lo, hi);
        const on = found.has(x.id);
        const isActive = x.id === activeId;
        const dim = !visible.has(x.id);
        const s = bandStyle(x.stage);
        return (
          <div
            key={x.id}
            className="absolute"
            style={{ left: `${(p.x / 320) * 100}%`, top: `${(p.y / 320) * 100}%`, zIndex: isActive ? 30 : 20 }}
          >
            <AnimatePresence>
              {on ? (
                <motion.button
                  type="button"
                  tabIndex={-1}
                  onClick={() => onSelect(x.id)}
                  onPointerEnter={() => onHover(x.id)}
                  onPointerLeave={() => onHover(null)}
                  initial={m.reduced || instant ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: isActive ? 1.25 : 1, opacity: dim ? 0.28 : 1 }}
                  transition={SPRING_SNAP}
                  aria-label={`${x.company}, fit ${x.fit}`}
                  className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                >
                  {/* 28px dot, 44px tap target */}
                  <span
                    className={cx(
                      "flex h-7 w-7 items-center justify-center rounded-full border-2 border-studojo-ink font-clash text-xs font-semibold text-studojo-ink",
                      isActive ? "shadow-[2px_2px_0_0_#191a23]" : "",
                    )}
                    style={{ backgroundColor: s.fill }}
                  >
                    {x.company.charAt(0)}
                  </span>
                </motion.button>
              ) : null}
            </AnimatePresence>
            {on && !m.reduced && !instant ? (
              <motion.span
                className="pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                style={{ borderColor: s.fill }}
                initial={{ scale: 1, opacity: 0.9 }}
                animate={{ scale: 2.6, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            ) : null}
          </div>
        );
      })}

      {/* Label for the active blip */}
      <AnimatePresence>
        {active && found.has(active.id) ? <BlipTag key={active.id} match={active} lo={lo} hi={hi} /> : null}
      </AnimatePresence>
    </div>
  );
}

function BlipTag({ match, lo, hi }: { match: RankedMatch; lo: number; hi: number }) {
  const m = useMotionPresets();
  const p = pointFor(match, lo, hi);
  const leftPct = (p.x / 320) * 100;
  const topPct = (p.y / 320) * 100;
  const align = leftPct > 64 ? "right" : leftPct < 36 ? "left" : "center";
  const below = topPct < 22;
  return (
    <motion.div
      className="pointer-events-none absolute z-40"
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
      initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: below ? -4 : 4, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={m.reduced ? { duration: 0.15 } : SPRING_SNAP}
    >
      <div
        className={cx(
          "absolute whitespace-nowrap rounded-lg border-2 border-studojo-ink bg-white px-2 py-1 font-satoshi text-xs font-bold text-studojo-ink shadow-[2px_2px_0_0_#191a23]",
          below ? "top-5" : "bottom-5",
          align === "right" ? "right-[-10px]" : align === "left" ? "left-[-10px]" : "left-1/2 -translate-x-1/2",
        )}
      >
        {match.company} <span className="text-studojo-muted">· fit {match.fit}</span>
      </div>
    </motion.div>
  );
}

/** Legend under the radar. Plain text, readable by everyone. */
export function RadarLegend() {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-satoshi text-xs text-studojo-muted">
      <span className="font-bold text-studojo-ink">Closer to you = better fit</span>
      {STAGE_BANDS.map((b) => (
        <span key={b.id} className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-3 w-3 rounded-full border-2 border-studojo-ink" style={{ backgroundColor: b.fill }} />
          {b.label}
        </span>
      ))}
    </div>
  );
}
