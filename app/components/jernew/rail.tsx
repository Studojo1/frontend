// The metro-line progress rail for /jernew. Stations grouped You, Your page,
// Your people, Go, then a "Live" terminus. Full rail from md up, a compact
// line on phones. Shared file: owned by the foundation.
import { motion } from "framer-motion";
import { FiCheck, FiRadio } from "react-icons/fi";
import { GROUP_STYLE, GROUPS, groupOf, RAIL_STEPS, STEP_META, stepIndex } from "./config";
import { useFlow } from "./flow";
import { SPRING, SPRING_SNAP } from "./motion";
import type { StepId } from "./types";
import { cx, FOCUS_RING } from "./ui-base";

const COLS = RAIL_STEPS.length + 1; // stations plus the Live terminus

type StationState = "done" | "current" | "todo";

export function Rail() {
  const f = useFlow();
  if (f.step === "intro") return null;
  return (
    <>
      <FullRail />
      <CompactRail />
    </>
  );
}

function FullRail() {
  const f = useFlow();
  const curIdx = f.step === "mission" ? RAIL_STEPS.length : RAIL_STEPS.indexOf(f.step);
  const progress = Math.max(0, curIdx) / (COLS - 1);

  return (
    <nav aria-label="Progress" className="hidden md:block">
      <div className="relative grid pb-1 pt-2" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
        {/* Group labels, each spanning its stations */}
        {GROUPS.map((g) => (
          <div key={g.id} className="flex flex-col items-center px-2" style={{ gridColumn: `span ${g.steps.length} / span ${g.steps.length}` }}>
            <span className={cx("font-satoshi text-[11px] font-bold uppercase tracking-[0.14em]", GROUP_STYLE[g.id].text)}>{g.label}</span>
            <span aria-hidden className={cx("mt-1 h-1 w-[calc(100%-2.5rem)] rounded-full border border-studojo-ink/20", GROUP_STYLE[g.id].tint)} />
          </div>
        ))}
        <div aria-hidden />

        {/* The line: a grey track and an ink fill that grows (scaleX) with progress */}
        <div aria-hidden className="pointer-events-none absolute top-[3.15rem]" style={{ left: `${50 / COLS}%`, right: `${50 / COLS}%` }}>
          <div className="h-[3px] rounded-full bg-studojo-ink/15" />
          <motion.div
            className="absolute inset-0 h-[3px] origin-left rounded-full bg-studojo-ink"
            initial={false}
            animate={{ scaleX: progress }}
            transition={SPRING}
          />
        </div>

        <ol className="contents">
          {RAIL_STEPS.map((id, i) => (
            <Station key={id} id={id} n={i + 1} />
          ))}
          <li className="relative flex justify-center pt-1.5">
            <span
              className={cx(
                "flex min-h-11 flex-col items-center gap-1 font-satoshi text-xs font-bold",
                f.step === "mission" ? "text-studojo-ink" : "text-studojo-muted",
              )}
              aria-current={f.step === "mission" ? "step" : undefined}
            >
              <span
                className={cx(
                  "relative z-10 flex h-6 w-6 items-center justify-center rounded-md border-2 border-studojo-ink",
                  f.step === "mission" ? "bg-studojo-ink text-white" : "bg-white",
                )}
              >
                <FiRadio aria-hidden className="text-[12px]" />
              </span>
              Live
            </span>
          </li>
        </ol>
      </div>
    </nav>
  );
}

function Station({ id, n }: { id: StepId; n: number }) {
  const f = useFlow();
  const reachable = f.canGo(id);
  const state: StationState =
    id === f.step ? "current" : reachable && f.isComplete(id) && stepIndex(id) < f.maxReachable ? "done" : "todo";
  const group = groupOf(id);
  const style = GROUP_STYLE[group];
  const label = STEP_META[id].label;
  const status = state === "current" ? "current step" : state === "done" ? "done" : reachable ? "available" : "locked";

  return (
    <li className="relative flex justify-center pt-1.5">
      <button
        type="button"
        onClick={() => reachable && f.goTo(id)}
        aria-disabled={!reachable || undefined}
        aria-current={state === "current" ? "step" : undefined}
        aria-label={`${label}, step ${n} of ${RAIL_STEPS.length}, ${status}`}
        className={cx(
          "group flex min-h-11 min-w-11 flex-col items-center gap-1 rounded-xl px-1 font-satoshi text-xs font-bold",
          FOCUS_RING,
          reachable ? "cursor-pointer" : "cursor-not-allowed",
          state === "todo" ? "text-studojo-muted" : "text-studojo-ink",
        )}
      >
        <span className="relative z-10 flex h-6 w-6 items-center justify-center">
          {state === "current" ? (
            <motion.span
              layoutId="jernew-rail-current"
              transition={SPRING_SNAP}
              className={cx("absolute -inset-1.5 rounded-full border-2 border-studojo-ink", style.tint)}
            />
          ) : null}
          <span
            className={cx(
              "relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-studojo-ink transition-transform duration-200",
              state === "todo" ? "bg-white" : style.solid,
              reachable && state !== "current" && "group-hover:scale-110",
            )}
          >
            {state === "done" ? <FiCheck aria-hidden className="text-[11px] text-studojo-ink" strokeWidth={4} /> : null}
          </span>
        </span>
        <span className="max-w-full truncate">{label}</span>
      </button>
    </li>
  );
}

function CompactRail() {
  const f = useFlow();
  const onMission = f.step === "mission";
  const pos = onMission ? RAIL_STEPS.length : RAIL_STEPS.indexOf(f.step);
  const group = groupOf(f.step);
  const groupLabel = onMission ? "Live" : GROUPS.find((g) => g.id === group)?.label;
  const style = GROUP_STYLE[group];

  return (
    <nav aria-label="Progress" className="md:hidden">
      <div className="flex items-center justify-between gap-3 py-2">
        <span className="flex min-w-0 items-center gap-2 font-satoshi text-sm">
          <span aria-hidden className={cx("h-3 w-3 shrink-0 rounded-full border-2 border-studojo-ink", onMission ? "bg-studojo-ink" : style.solid)} />
          <span className="truncate font-bold text-studojo-ink">{groupLabel}</span>
          <span className="truncate text-studojo-muted">{onMission ? "Mission control" : STEP_META[f.step].label}</span>
        </span>
        <span className="shrink-0 font-satoshi text-xs font-bold text-studojo-muted">
          {onMission ? "All set" : `${pos + 1} of ${RAIL_STEPS.length}`}
        </span>
      </div>
      <ol aria-hidden className="flex items-center gap-1 pb-2">
        {RAIL_STEPS.map((id, i) => {
          const g = GROUP_STYLE[groupOf(id)];
          const current = i === pos;
          return (
            <li key={id} className="relative h-2 flex-1">
              <span className="absolute inset-0 rounded-full border border-studojo-ink/25 bg-white" />
              <motion.span
                className={cx("absolute inset-0 origin-left rounded-full border border-studojo-ink", g.solid)}
                initial={false}
                animate={{ scaleX: i < pos ? 1 : current ? 0.55 : 0, opacity: i <= pos ? 1 : 0 }}
                transition={SPRING}
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
