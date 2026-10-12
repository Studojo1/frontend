// The /b2cnew frame. Desktop (1024px and up): top bar, rail, workspace and
// the agent dock in one fixed-height app. Phones: sticky top bar and ribbon,
// the page scrolls, and the Senpai pill and bottom bar float at the bottom.
// Shared file: owned by the foundation.
import { useEffect, type CSSProperties } from "react";
import { AnimatePresence, LayoutGroup, motion, MotionConfig } from "framer-motion";
import { SKILL_STYLE, tabMeta, UNDO_MS } from "../config";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { ReducedMotionProvider, useSafeReducedMotion, workspaceVariants } from "../motion";
import { TAB_COMPONENTS } from "../tabs";
import { Card, LiveRegion, ToastView } from "../ui";
import { Dock } from "./dock";
import { useGlobalKeys } from "./keys";
import { MissionHeader } from "./mission-header";
import { PhoneDock } from "./bottom-bar";
import { Rail } from "./rail";
import { SheetHost } from "./sheet-host";
import { DesktopTopBar, PhoneTopBar } from "./top-bar";

const DOTS: CSSProperties = {
  backgroundColor: "#fcfbff",
  backgroundImage: "radial-gradient(circle, rgba(23,23,23,0.11) 1px, transparent 1.3px)",
  backgroundSize: "22px 22px",
};

export function Shell() {
  return (
    <MotionConfig reducedMotion="user">
      <ReducedMotionProvider>
        <LayoutGroup id="b2cnew">
          <Frame />
        </LayoutGroup>
      </ReducedMotionProvider>
    </MotionConfig>
  );
}

function Frame() {
  useGlobalKeys();
  return (
    <div className="flex min-h-dvh flex-col font-satoshi text-studojo-ink lg:h-dvh lg:overflow-hidden" style={DOTS}>
      <a href="#b2c-ws-panel" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[60] focus:rounded-lg focus:bg-white focus:p-2">
        Skip to workspace
      </a>
      <DesktopTopBar />
      <PhoneTopBar />
      <div className="flex min-h-0 flex-1">
        <Rail />
        <main className="flex min-w-0 flex-1 flex-col">
          <MissionHeader />
          <Workspace />
        </main>
        <Dock />
      </div>
      <PhoneDock />
      <SheetHost />
      <ToastHost />
      <RunAnnouncer />
    </div>
  );
}

function Workspace() {
  const { s } = useB2C();
  const reduced = useSafeReducedMotion();
  const Tab = TAB_COMPONENTS[s.tab];
  return (
    <div className="min-h-0 flex-1 lg:overflow-y-auto" data-scroll-container>
      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={`${s.env}-${s.tab}`}
          id="b2c-ws-panel"
          role="tabpanel"
          tabIndex={-1}
          aria-label={tabMeta(s.tab).label}
          variants={workspaceVariants(reduced)}
          initial="enter"
          animate="center"
          exit="exit"
          className="mx-auto w-full max-w-[1100px] px-4 pb-[calc(11rem_+_var(--sj-notice-h,0px))] pt-4 outline-none lg:px-6 lg:pb-10 lg:pt-6"
        >
          {s.ready ? <Tab /> : <TabSkeleton />}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}

function TabSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="h-28 rounded-2xl border-2 border-studojo-ink/15 bg-white/70" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Card shadow="none" className="h-24 border-studojo-ink/15 bg-white/70">
          <span className="sr-only">Loading your workspace</span>
        </Card>
        <Card shadow="none" className="h-24 border-studojo-ink/15 bg-white/70" />
      </div>
    </div>
  );
}

function ToastHost() {
  const { s, dispatch } = useB2C();
  const t = s.toast;
  useEffect(() => {
    if (!t) return;
    const timer = window.setTimeout(() => dispatch({ type: "CLEAR_TOAST" }), t.undo ? UNDO_MS : 4000);
    return () => window.clearTimeout(timer);
  }, [t?.id]);
  return (
    <div data-floating-cta className="pointer-events-none fixed inset-x-0 bottom-36 z-[45] flex justify-center px-4 lg:bottom-6">
      <div aria-live="polite" role="status">
        <AnimatePresence>
          {t ? (
            <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <ToastView
                text={t.text}
                onClose={() => dispatch({ type: "CLEAR_TOAST" })}
                onUndo={
                  t.undo
                    ? () => {
                        if (t.undo) dispatch(t.undo);
                        dispatch({ type: "CLEAR_TOAST" });
                      }
                    : undefined
                }
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Announces run progress to screen readers ("Scout: checked addresses, 3 of 4"). */
function RunAnnouncer() {
  const agent = useAgent();
  const l = agent.liveStep;
  const msg = l ? `Senpai, ${SKILL_STYLE[l.skill].label}: ${l.label}, step ${l.index + 1} of ${l.total}${l.needsYou ? ", needs you" : ""}` : "";
  return <LiveRegion message={msg} />;
}
