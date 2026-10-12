// Quiz card 4: company stage on a slider. A skyline grows from a garage
// startup to a large campus as the slider moves. Owned by builder A (You).
import { AnimatePresence, motion } from "framer-motion";
import { STAGES } from "../../data";
import { SPRING, SPRING_SNAP } from "../../motion";
import type { StageStop } from "../../types";
import { cx, FOCUS_RING, POINTER_FINE, RANGE_THUMB } from "../../ui";
import { useNumberKeys, type QuizCardProps } from "./quiz-keys";


/** Untouched sliders sit in the middle, faded, until the student moves them. */
const RESTING: StageStop = 2;

export function StageSlider({ q, set, reduced, active }: QuizCardProps) {
  const value = q.stage ?? RESTING;
  const chosen = q.stage !== null;
  const stage = STAGES[value];
  const pick = (v: number) => set({ stage: Math.max(0, Math.min(4, v)) as StageStop });

  useNumberKeys(active, (n) => {
    if (n >= 1 && n <= STAGES.length) pick(n - 1);
  });

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border-2 border-studojo-ink bg-gradient-to-b from-studojo-purple-bg to-white">
        <Skyline stop={value} chosen={chosen} reduced={reduced} />
        <div className="flex items-start gap-3 border-t-2 border-studojo-ink bg-white px-4 py-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={chosen ? value : "unset"}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="min-w-0"
            >
              {chosen ? (
                <>
                  <p className="font-clash text-xl font-semibold leading-tight text-studojo-ink">
                    {stage.label} <span className="font-satoshi text-sm font-bold text-studojo-purple-strong">{stage.team}</span>
                  </p>
                  <p className="font-satoshi text-sm text-studojo-muted">{stage.blurb}</p>
                </>
              ) : (
                <>
                  <p className="font-clash text-xl font-semibold leading-tight text-studojo-ink">Slide to build it</p>
                  <p className="font-satoshi text-sm text-studojo-muted">
                    Drag or tap a size<span className={POINTER_FINE}>, or press 1 to 5</span>.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="px-1">
        <div className="relative h-11">
          <span aria-hidden className="absolute inset-x-[18px] top-1/2 h-3 -translate-y-1/2 overflow-hidden rounded-full border-2 border-studojo-ink bg-white">
            <motion.span
              className={cx("block h-full origin-left", chosen ? "bg-studojo-purple" : "bg-studojo-ink/15")}
              initial={false}
              animate={{ scaleX: value / 4 }}
              transition={reduced ? { duration: 0 } : SPRING}
            />
          </span>
          <input
            type="range"
            min={0}
            max={4}
            step={1}
            value={value}
            aria-label="Company size"
            aria-valuetext={chosen ? `${stage.label}, ${stage.team}` : "Not chosen yet"}
            onChange={(e) => pick(Number(e.currentTarget.value))}
            onPointerUp={(e) => pick(Number(e.currentTarget.value))}
            onKeyUp={(e) => {
              if (e.key.startsWith("Arrow") || e.key === "Home" || e.key === "End") pick(Number(e.currentTarget.value));
            }}
            className={cx(
              "relative block h-11 w-full cursor-pointer appearance-none rounded-full bg-transparent",
              FOCUS_RING,
              RANGE_THUMB,
              !chosen && "opacity-70",
            )}
          />
        </div>
        <div className="mt-1 grid grid-cols-5 gap-1">
          {STAGES.map((s) => (
            <button
              key={s.stop}
              type="button"
              onClick={() => pick(s.stop)}
              aria-label={`${s.label}, ${s.team} (${s.stop + 1})`}
              className={cx(
                "min-h-11 rounded-lg px-0.5 text-center font-satoshi text-[11px] font-bold leading-tight sm:text-xs",
                FOCUS_RING,
                chosen && s.stop === value ? "text-studojo-purple-strong" : "text-studojo-muted hover:text-studojo-ink",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Five buildings, small to large. Building k stands when the stop is k or more. */
const BUILDINGS = [
  { x: 14, w: 46, h: 30, floors: 0 },
  { x: 70, w: 50, h: 54, floors: 2 },
  { x: 130, w: 56, h: 80, floors: 3 },
  { x: 196, w: 52, h: 108, floors: 5 },
  { x: 258, w: 68, h: 128, floors: 6 },
];

function Skyline({ stop, chosen, reduced }: { stop: number; chosen: boolean; reduced: boolean }) {
  const ground = 150;
  return (
    <svg aria-hidden viewBox="0 0 340 160" className={cx("block h-36 w-full sm:h-44 lg:h-36", !chosen && "opacity-60")}>
      <line x1="0" y1={ground} x2="340" y2={ground} stroke="#171717" strokeWidth="2.5" />
      {BUILDINGS.map((b, k) => {
        const up = k <= stop;
        const current = chosen && k === stop;
        const top = ground - b.h;
        return (
          <motion.g
            key={k}
            initial={false}
            animate={{ scaleY: up ? 1 : 0, opacity: up ? 1 : 0 }}
            transition={reduced ? { duration: 0.15 } : { ...SPRING_SNAP, delay: up ? k * 0.03 : 0 }}
            style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
          >
            <rect x={b.x} y={top} width={b.w} height={b.h} rx="3" fill={current ? "#8b5cf6" : "#fff"} stroke="#171717" strokeWidth="2.5" />
            {k === 0 ? (
              <>
                <rect x={b.x + 15} y={ground - 18} width="16" height="18" fill="#fde68a" stroke="#171717" strokeWidth="2" />
                <line x1={b.x + 8} y1={top} x2={b.x + 8} y2={top - 16} stroke="#171717" strokeWidth="2" />
                <path d={`M${b.x + 8} ${top - 16}h12l-3 4 3 4h-12z`} fill="#ec4899" stroke="#171717" strokeWidth="1.5" />
              </>
            ) : (
              Array.from({ length: b.floors }, (_, f) => (
                <g key={f}>
                  {[0, 1, 2].slice(0, b.w > 60 ? 3 : 2).map((c) => (
                    <rect
                      key={c}
                      x={b.x + 8 + c * (b.w > 60 ? 19 : 22)}
                      y={top + 10 + f * 18}
                      width="10"
                      height="9"
                      rx="1.5"
                      fill={current ? "#fff" : "#ddd6fe"}
                      stroke="#171717"
                      strokeWidth="1.5"
                    />
                  ))}
                </g>
              ))
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}
