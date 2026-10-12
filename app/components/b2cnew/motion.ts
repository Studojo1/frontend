// Motion for /b2cnew: the jernew presets plus layoutIds and a few surfaces.
// Springs and short durations; transforms and opacity only. Under reduced
// motion everything is a plain fade. Shared file: owned by the foundation.
import type { Transition, Variants } from "framer-motion";

export {
  EASE_OUT,
  FADE,
  ReducedMotionProvider,
  SPRING,
  SPRING_SNAP,
  SPRING_SOFT,
  useMotionPresets,
  useSafeReducedMotion,
  type MotionPresets,
} from "../jernew/motion";

/** Quiet UI: 150 to 250ms. */
export const QUICK: Transition = { duration: 0.18, ease: [0.22, 1, 0.36, 1] };

/**
 * Shared layoutIds. One LayoutGroup wraps the whole app (shell.tsx), so an
 * element with the same id in two places animates between them.
 */
export const LAYOUT = {
  /** The active-tab pill in the desktop tab strip. */
  tabPill: "b2c-tab-pill",
  /** The active-slot pill in the phone bottom bar. */
  barPill: "b2c-bar-pill",
  /** The active segment in the agent dock (Chat, Runs, Memory). */
  dockSeg: "b2c-dock-seg",
  /** The active mission row in the rail. */
  missionRow: "b2c-mission-row",
  /** A run's result chip; the run card and the tab strip both render it, so it flies to the tab. */
  result: (runId: string) => `b2c-result-${runId}`,
  /** An approval card flying into its send-day slot. */
  draft: (draftId: string) => `b2c-draft-${draftId}`,
} as const;

/** Workspace crossfade when the mission or tab changes. */
export function workspaceVariants(reduced: boolean): Variants {
  return reduced
    ? { enter: { opacity: 0 }, center: { opacity: 1, transition: QUICK }, exit: { opacity: 0, transition: { duration: 0.12 } } }
    : {
        enter: { opacity: 0, y: 8 },
        center: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 420, damping: 34, opacity: { duration: 0.18 } } },
        exit: { opacity: 0, transition: { duration: 0.12 } },
      };
}

/** Sheets: from the bottom on phones, from the right on desktop. */
export function sheetVariants(reduced: boolean, from: "bottom" | "right" | "center"): Variants {
  if (reduced) return { hidden: { opacity: 0 }, show: { opacity: 1, transition: QUICK }, exit: { opacity: 0, transition: { duration: 0.12 } } };
  const off = from === "bottom" ? { y: "100%" } : from === "right" ? { x: "100%" } : { opacity: 0, scale: 0.96, y: 12 };
  return {
    hidden: { ...off, opacity: from === "center" ? 0 : 1 },
    show: { x: 0, y: 0, scale: 1, opacity: 1, transition: { type: "spring", stiffness: 380, damping: 36 } },
    exit: { ...off, opacity: from === "center" ? 0 : 1, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
  };
}

/** The stamp landing (approve, the no-fee stamp): drops in with a tilt. */
export function stampVariants(reduced: boolean): Variants {
  return reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: QUICK } }
    : {
        hidden: { opacity: 0, scale: 1.6, rotate: -14 },
        show: { opacity: 1, scale: 1, rotate: -6, transition: { type: "spring", stiffness: 520, damping: 22 } },
      };
}

/** A count badge that bumps once when results land on its tab. Use with key={bump.key}. */
export function bumpAnimation(reduced: boolean) {
  return reduced
    ? { initial: { opacity: 0.4 }, animate: { opacity: 1 }, transition: QUICK }
    : { initial: { scale: 1.45 }, animate: { scale: 1 }, transition: { type: "spring" as const, stiffness: 500, damping: 14 } };
}
