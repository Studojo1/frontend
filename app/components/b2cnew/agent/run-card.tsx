// The run card: title, skill chips, live steps (waiting, running, done with
// a short result, needs you), Stop, "Next up", and the result chip that
// lands in its tab. The signature agent moment.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowRight, FiCheck, FiChevronDown, FiSquare } from "react-icons/fi";
import { SKILL_STYLE, tabMeta } from "../config";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { dayDate } from "../data";
import { LAYOUT, QUICK, SPRING_SNAP, useSafeReducedMotion } from "../motion";
import type { AppState, Run, RunStep } from "../types";
import { cx, FOCUS_RING, PRESS, SkillChip } from "../ui";
import { lowerFirst } from "./bits";
import { useFlyToTab } from "./fly";

const STATUS: Record<Run["status"], { label: string; cls: string }> = {
  running: { label: "Working", cls: "bg-studojo-purple-bg text-studojo-purple-strong" },
  done: { label: "Done", cls: "bg-studojo-green-bg text-[#047857]" },
  stopped: { label: "Stopped", cls: "bg-studojo-surface-muted text-studojo-muted" },
};

export function RunCard({ run, latest }: { run: Run; latest: boolean }) {
  const { s, dispatch, viewport } = useB2C();
  const agent = useAgent();
  const reduced = useSafeReducedMotion();
  const [open, setOpen] = useState<boolean | null>(null);
  // On Today the brief card already tells the morning run's story, so its steps start folded there.
  const briefShowsIt = s.tab === "today" && run.flowId === "F1";
  const expanded = open ?? (run.status === "running" || (latest && !briefShowsIt));
  const needsYou = run.steps.some((st) => st.status === "needs-you");
  const done = run.steps.filter((st) => st.status === "done").length;
  const skills = Array.from(new Set(run.steps.map((st) => st.skill)));
  const resultRef = useRef<HTMLButtonElement>(null);
  const fly = useFlyToTab();

  // When this run finishes while you watch, its result chip flies to the tab.
  const was = useRef(run.status);
  useEffect(() => {
    if (was.current === "running" && run.status === "done" && run.result) fly(resultRef.current, run.result.tab, run.result.label);
    was.current = run.status;
  }, [run.status]);

  const status = needsYou ? { label: "Needs you", cls: "bg-studojo-orange-bg text-[#92400e]" } : STATUS[run.status];
  const result = run.result ? liveResult(s, run) : null;
  const goResult = () => {
    if (!run.result) return;
    dispatch({ type: "SET_TAB", tab: run.result.tab });
    if (viewport !== "wide") agent.close();
  };

  return (
    <motion.article
      aria-label={`Run: ${run.title}`}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduced ? QUICK : SPRING_SNAP}
      className={cx(
        "relative overflow-hidden rounded-2xl border-2 border-studojo-ink bg-white",
        run.status === "running" ? "shadow-[3px_3px_0_0_#8b5cf6]" : "shadow-[2px_2px_0_0_#191a23]",
      )}
    >
      {run.status === "running" ? <Progress value={done / run.steps.length} needsYou={needsYou} /> : null}
      <div className="flex items-start gap-2 px-3 pb-2 pt-3">
        <button
          type="button"
          onClick={() => setOpen(!expanded)}
          aria-expanded={expanded}
          className={cx("min-w-0 flex-1 rounded-lg text-left", FOCUS_RING)}
        >
          <span className="flex items-center gap-1.5">
            <span className={cx("rounded-md border-2 border-studojo-ink px-1.5 font-satoshi text-[11px] font-bold leading-4", status.cls)}>{status.label}</span>
            <span className="font-satoshi text-[11px] font-bold uppercase tracking-wide text-studojo-muted">
              Run · Day {run.day} · {dayDate(run.day).weekday}
            </span>
            <FiChevronDown aria-hidden className={cx("ml-auto shrink-0 text-studojo-muted transition-transform", expanded && "rotate-180")} />
          </span>
          <span className="mt-1 block font-clash text-base font-semibold leading-snug text-studojo-ink">{run.title}</span>
          <span className="mt-1.5 flex flex-wrap gap-1">
            {skills.map((sk) => (
              <SkillChip key={sk} skill={sk} />
            ))}
            <span className="self-center pl-1 font-satoshi text-xs text-studojo-muted">
              {done} of {run.steps.length} steps
            </span>
          </span>
        </button>
        {run.status === "running" && run.steps.some((st) => st.status !== "done") ? (
          <button
            type="button"
            onClick={() => agent.stop(run.id)}
            className={cx("inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg border-2 border-studojo-ink bg-white px-2.5 font-satoshi text-xs font-bold", PRESS, FOCUS_RING)}
          >
            <FiSquare aria-hidden className="fill-current text-[10px]" /> Stop
          </button>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.ol
            key="steps"
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={QUICK}
            className="overflow-hidden border-t-2 border-dashed border-studojo-ink/15 px-3 py-2"
          >
            {run.steps.map((st, i) => (
              <Step key={i} st={st} />
            ))}
          </motion.ol>
        ) : null}
      </AnimatePresence>

      {run.status === "running" && agent.nextUp && run.missionId === s.env ? (
        <p className="border-t-2 border-dashed border-studojo-ink/15 px-3 py-1.5 font-satoshi text-xs text-studojo-muted">
          <span className="font-bold text-studojo-ink">Next up:</span> {agent.nextUp}
        </p>
      ) : null}
      {run.status === "stopped" ? (
        <p className="border-t-2 border-dashed border-studojo-ink/15 px-3 py-1.5 font-satoshi text-xs text-studojo-muted">
          {run.interrupted ? "Stopped when the page reloaded. Nothing after the last done step happened. Ask again to finish it." : "Stopped by you. Nothing after the last done step happened."}
        </p>
      ) : null}

      {run.result && result && run.status === "done" ? (
        <div className="px-3 pb-3">
          <motion.button
            ref={resultRef}
            layoutId={LAYOUT.result(run.id)}
            type="button"
            onClick={goResult}
            className={cx(
              "inline-flex min-h-9 items-center gap-1.5 rounded-full border-2 border-studojo-ink px-3 font-satoshi text-[13px] font-bold shadow-[2px_2px_0_0_#191a23]",
              result.done ? "bg-studojo-green-bg text-[#047857]" : "bg-studojo-purple-strong text-white",
              PRESS,
              FOCUS_RING,
            )}
          >
            {result.label}
            <span className="sr-only">. Open {tabMeta(run.result.tab).label}</span>
            <FiArrowRight aria-hidden />
          </motion.button>
        </div>
      ) : null}
    </motion.article>
  );
}

/**
 * The result chip with live numbers: drafts that landed in Approvals count
 * down as you approve or skip them, then read "Done".
 */
function liveResult(s: AppState, run: Run): { label: string; done: boolean } {
  const r = run.result;
  if (!r) return { label: "", done: false };
  if (r.tab !== "approvals" || !r.ids.length) return { label: r.label, done: false };
  const waiting = s.drafts.filter((d) => d.missionId === run.missionId && d.status === "pending" && r.ids.includes(d.personId)).length;
  if (waiting === 0) return { label: "Done: settled in Approvals", done: true };
  if (waiting === r.ids.length) return { label: r.label, done: false };
  return { label: `${waiting} of ${r.ids.length} still in Approvals`, done: false };
}

function Progress({ value, needsYou }: { value: number; needsYou: boolean }) {
  return (
    <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-studojo-ink/5">
      <motion.div
        className={cx("h-full origin-left", needsYou ? "bg-studojo-orange" : "bg-studojo-purple")}
        initial={false}
        animate={{ scaleX: Math.max(0.04, value) }}
        transition={QUICK}
      />
    </div>
  );
}

function Step({ st }: { st: RunStep }) {
  const reduced = useSafeReducedMotion();
  const sk = SKILL_STYLE[st.skill];
  return (
    <li className={cx("flex items-start gap-2 py-1 font-satoshi text-[13px] leading-snug", st.status === "waiting" && "text-studojo-muted")}>
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
        {st.status === "done" ? (
          <motion.span
            initial={reduced ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reduced ? QUICK : SPRING_SNAP}
            className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-green text-[9px] text-studojo-ink"
          >
            <FiCheck aria-hidden strokeWidth={4} />
          </motion.span>
        ) : st.status === "running" ? (
          <motion.span
            className="h-3.5 w-3.5 rounded-full border-2 border-studojo-purple border-t-transparent"
            {...(reduced ? {} : { animate: { rotate: 360 }, transition: { duration: 0.8, repeat: Infinity, ease: "linear" } })}
          />
        ) : st.status === "needs-you" ? (
          <motion.span
            className="h-3 w-3 rounded-full border-2 border-studojo-ink bg-studojo-orange"
            {...(reduced ? {} : { animate: { scale: [1, 1.35, 1] }, transition: { duration: 1.1, repeat: Infinity } })}
          />
        ) : (
          <span className="h-3 w-3 rounded-full border-2 border-studojo-ink/30" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cx("font-bold", st.status === "waiting" ? "text-studojo-muted" : sk.text)}>{sk.label}:</span>{" "}
        <span className={st.status === "waiting" ? "" : "text-studojo-ink"}>{lowerFirst(st.label)}</span>
        {st.status === "needs-you" ? <span className="ml-1 font-bold text-[#92400e]">· needs you</span> : null}
        {st.detail && st.status === "done" ? <span className="line-clamp-2 text-xs text-studojo-muted">{st.detail}</span> : null}
      </span>
      <span className="sr-only">{st.status === "done" ? "done" : st.status === "running" ? "working" : st.status === "needs-you" ? "waiting for you" : "waiting"}</span>
    </li>
  );
}
