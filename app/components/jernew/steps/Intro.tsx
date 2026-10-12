// Step 1: intro. The reference step for the other builders: StepHeader for
// the title (focus lands on it), useStepBar for the bottom bar, useFlow for
// state, useMotionPresets for motion, ui primitives for everything visible.
// Owned by the foundation.
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowRight, FiClock, FiEyeOff, FiFileText, FiInbox, FiRotateCw, FiUsers } from "react-icons/fi";
import { GROUP_STYLE, GROUPS, STEP_META } from "../config";
import { SEND_PACE } from "../data";
import { useFlow, useStepBar } from "../flow";
import { useMotionPresets } from "../motion";
import { Button, Card, cx, StepHeader } from "../ui";
import { IntroVisual } from "./IntroVisual";

const GROUP_BLURB: Record<string, string> = {
  you: "Resume and 6 questions",
  page: "Review it, choose who sees it",
  people: "Matches and your emails",
  go: "Pack, Gmail, launch",
};

export function Intro() {
  const f = useFlow();
  const m = useMotionPresets();
  // First paint is server-rendered: show it as-is. Animate only when arriving from another step.
  const animateIn = f.navCount > 0;

  // The Start button lives in the hero, so the bar is hidden; Enter still starts.
  useStepBar({ label: "Start", hidden: true, enterToContinue: true });

  return (
    <div>
      <AnimatePresence initial={false}>
        {f.resumeOffer ? <ResumeOffer key="offer" /> : null}
      </AnimatePresence>

      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-14">
        <motion.div variants={m.list} initial={animateIn ? "hidden" : false} animate="show" className="min-w-0">
          <motion.div variants={m.item}>
            <StepHeader
              kicker="Studojo Outreach, rebuilt"
              title={
                <>
                  Your resume becomes <Mark color="#ddd6fe">a page worth opening</Mark>, sent to the{" "}
                  <Mark color="#fde68a">people who can actually hire you</Mark>.
                </>
              }
              description={`Upload once and answer six quick questions. You approve a page drafted from your resume, we find hiring managers at companies that fit you, and personal emails go out from your own Gmail, ${SEND_PACE}.`}
            />
          </motion.div>

          <motion.div variants={m.item} className="lg:hidden">
            <PromiseStrip />
          </motion.div>

          <motion.div variants={m.item} className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button size="lg" onClick={f.next} iconRight={<FiArrowRight />} className="min-w-44">
              Start
            </Button>
            <span className="inline-flex items-center gap-2 font-satoshi text-base font-medium text-studojo-ink">
              <FiClock aria-hidden /> Takes about 4 minutes
            </span>
          </motion.div>

          <motion.p
            variants={m.item}
            className="mt-5 inline-flex items-start gap-2 rounded-xl border-2 border-dashed border-studojo-ink/40 bg-white/80 px-3 py-2 font-satoshi text-sm text-studojo-muted"
          >
            <FiEyeOff aria-hidden className="mt-0.5 shrink-0 text-studojo-ink" />
            <span>
              <strong className="text-studojo-ink">Concept preview:</strong> nothing is uploaded, charged or sent.
            </span>
          </motion.p>

          <motion.ol variants={m.item} aria-label="How it goes" className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GROUPS.map((g, i) => (
              <li key={g.id} className={cx("rounded-xl border-2 border-studojo-ink px-3 py-2", GROUP_STYLE[g.id].tint)}>
                <span className={cx("block font-satoshi text-[11px] font-bold uppercase tracking-[0.12em]", GROUP_STYLE[g.id].text)}>
                  {i + 1}. {g.label}
                </span>
                <span className="mt-0.5 block font-satoshi text-sm leading-snug text-studojo-ink">{GROUP_BLURB[g.id]}</span>
              </li>
            ))}
          </motion.ol>
        </motion.div>

        <IntroVisual animateIn={animateIn} />
      </div>
    </div>
  );
}

const PROMISE = [
  { id: "page", icon: <FiFileText />, word: "Your page", cls: "bg-studojo-pink-bg" },
  { id: "people", icon: <FiUsers />, word: "Your people", cls: "bg-studojo-orange-bg" },
  { id: "inbox", icon: <FiInbox />, word: "Your inbox", cls: "bg-studojo-green-bg" },
] as const;

/** Phones: the page, people, inbox promise as three tiles, joined by a travelling dot. */
function PromiseStrip() {
  const m = useMotionPresets();
  return (
    <div aria-hidden className="relative mb-6 grid grid-cols-3 gap-3">
      <span className="absolute inset-x-[16%] top-7 border-t-2 border-dashed border-studojo-ink/40" />
      {!m.reduced ? (
        <motion.span
          className="absolute top-7 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-studojo-ink bg-studojo-purple"
          initial={{ left: "16%" }}
          animate={{ left: ["16%", "82%"] }}
          transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" }}
        />
      ) : null}
      {PROMISE.map((p) => (
        <span key={p.id} className="relative flex flex-col items-center gap-1.5">
          <span className={cx("flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-studojo-ink text-xl shadow-[2px_2px_0_0_#191a23]", p.cls)}>
            {p.icon}
          </span>
          <span className="font-satoshi text-xs font-bold text-studojo-ink">{p.word}</span>
        </span>
      ))}
    </div>
  );
}

/** Highlighter stroke behind a phrase in the title. Wraps cleanly across lines. */
function Mark({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      className="[box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
      style={{ backgroundImage: `linear-gradient(transparent 58%, ${color} 58%, ${color} 92%, transparent 92%)` }}
    >
      {children}
    </span>
  );
}

function ResumeOffer() {
  const f = useFlow();
  const m = useMotionPresets();
  if (!f.resumeOffer) return null;
  const label = f.resumeOffer === "mission" ? "Mission control" : STEP_META[f.resumeOffer].label;
  return (
    <motion.div variants={m.pop} initial="hidden" animate="show" exit={{ opacity: 0 }} className="mb-8">
      <Card tone="yellow" shadow="md" className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-studojo-ink bg-white text-xl">
          <FiRotateCw />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-clash text-xl font-semibold">Pick up where you left off</h2>
          <p className="font-satoshi text-sm text-studojo-muted">
            You got as far as <strong className="text-studojo-ink">{label}</strong>. Your answers are saved in this browser only.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={f.acceptResume} iconRight={<FiArrowRight />}>
            Pick up at {label}
          </Button>
          <Button variant="ghost" onClick={f.startOver}>
            Start fresh
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
