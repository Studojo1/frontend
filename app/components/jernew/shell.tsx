// The page frame for /jernew: top bar (wordmark, Concept preview, Start over),
// the metro rail, the animated step stage and the fixed action bar.
// Shared file: owned by the foundation.
import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { AnimatePresence, LayoutGroup, motion, MotionConfig } from "framer-motion";
import { FiRotateCcw } from "react-icons/fi";
import { ActionBar } from "./action-bar";
import { StepScope, useFlow } from "./flow";
import { ReducedMotionProvider, stepVariants, useSafeReducedMotion } from "./motion";
import { Rail } from "./rail";
import { STEP_COMPONENTS } from "./steps";
import { Badge, Button, Card } from "./ui";
import { cx } from "./ui-base";

const DOTS: CSSProperties = {
  backgroundColor: "#fcfbff",
  backgroundImage: "radial-gradient(circle, rgba(23,23,23,0.13) 1px, transparent 1.3px)",
  backgroundSize: "22px 22px",
};

export function Shell() {
  return (
    <MotionConfig reducedMotion="user">
      <ReducedMotionProvider>
        <div className="min-h-dvh font-satoshi text-studojo-ink" style={DOTS}>
          <TopBar />
          <Stage />
          <ActionBar />
        </div>
      </ReducedMotionProvider>
    </MotionConfig>
  );
}

function TopBar() {
  const f = useFlow();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const t = window.setTimeout(() => setConfirming(false), 3500);
    return () => window.clearTimeout(t);
  }, [confirming]);

  const showStartOver = f.ready && (f.step !== "intro" || f.maxReachable > 0 || f.resumeOffer !== null);

  return (
    <header className="sticky top-0 z-30 border-b-2 border-studojo-ink bg-white/95 backdrop-blur">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="flex min-h-14 items-center gap-2 sm:gap-3">
          <Link to="/" className="flex min-h-11 shrink-0 items-center font-clash text-2xl font-bold tracking-tight text-studojo-ink">
            studojo
          </Link>
          <span className="hidden sm:inline-flex">
            <Badge kind="concept" />
          </span>
          <span className="inline-flex sm:hidden">
            <Badge kind="concept">Concept</Badge>
          </span>
          <div className="flex-1" />
          {showStartOver ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<FiRotateCcw />}
              onClick={() => {
                if (!confirming) return setConfirming(true);
                setConfirming(false);
                f.startOver();
              }}
              className={cx("shrink-0", confirming && "bg-studojo-pink-bg text-[#be185d]")}
            >
              {confirming ? "Tap again to clear" : "Start over"}
            </Button>
          ) : null}
        </div>
        <Rail />
      </div>
    </header>
  );
}

function Stage() {
  const f = useFlow();
  const reduced = useSafeReducedMotion();
  const Step = STEP_COMPONENTS[f.step];
  const variants = stepVariants(reduced);
  // The server and the first client frame cannot know saved progress, so any
  // step but intro waits for storage to be read before it renders.
  const canRender = f.ready || f.step === "intro";

  // The bar is lifted above the cookie notice while it shows (--sj-notice-h), so the page pads by the same amount.
  return (
    <main
      id="main"
      className="relative mx-auto w-full max-w-[1200px] overflow-x-clip px-4 pb-[calc(10rem+var(--sj-notice-h,0px))] pt-6 sm:px-6 sm:pt-10"
    >
      <LayoutGroup id="jernew">
        <AnimatePresence mode="wait" custom={f.direction} initial={false}>
          <motion.section
            key={f.step}
            custom={f.direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <StepScope id={f.step}>{canRender ? <Step /> : <StepSkeleton />}</StepScope>
          </motion.section>
        </AnimatePresence>
      </LayoutGroup>
    </main>
  );
}

function StepSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="h-4 w-40 rounded-full bg-studojo-ink/10" />
      <div className="h-10 w-3/4 max-w-xl rounded-xl bg-studojo-ink/10" />
      <Card shadow="sm" className="h-64 border-studojo-ink/20 bg-white/70">
        <span className="sr-only">Loading your progress</span>
      </Card>
    </div>
  );
}
