// Motion presets for /jernew. Springs around stiffness 400, damping 32;
// 200 to 350ms; transforms and opacity only. With reduced motion everything
// falls back to plain fades and loops stop.
// Copied from Studojo1/outreach-flow (app/components/jernew/motion.ts) for the
// student page; the main site's /jernew concept has its own copy.
import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useReducedMotion, type TargetAndTransition, type Transition, type Variants } from "framer-motion";

export const SPRING: Transition = { type: "spring", stiffness: 400, damping: 32 };
/** Softer spring for big surfaces (cards, the stamp landing). */
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 260, damping: 26 };
/** Snappy spring for small things (chips, toggles, dots). */
export const SPRING_SNAP: Transition = { type: "spring", stiffness: 520, damping: 34 };
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const FADE: Transition = { duration: 0.2, ease: "easeOut" };

/**
 * prefers-reduced-motion, but false until after hydration. The server cannot
 * know the setting, so reading it during the first render would make the
 * client's first frame differ from the server HTML (a hydration mismatch).
 * The shell also wraps the page in <MotionConfig reducedMotion="user">, which
 * makes transform animations instant for those users from the first frame.
 */
const ReducedCtx = createContext(false);

/**
 * Works out the setting once for the whole page (the shell renders it), so
 * the dozens of motion components below do not each re-render on mount.
 */
export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const pref = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return createElement(ReducedCtx.Provider, { value: mounted && !!pref }, children);
}

export function useSafeReducedMotion(): boolean {
  return useContext(ReducedCtx);
}

/** Step-to-step transition. Use with custom={direction} (1 forward, -1 back). */
export function stepVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      enter: { opacity: 0 },
      center: { opacity: 1, transition: FADE },
      exit: { opacity: 0, transition: { duration: 0.15 } },
    };
  }
  return {
    enter: (dir: number) => ({ opacity: 0, x: dir * 48 }),
    center: { opacity: 1, x: 0, transition: { ...SPRING, opacity: { duration: 0.22 } } },
    exit: (dir: number) => ({ opacity: 0, x: dir * -32, transition: { duration: 0.18, ease: EASE_OUT } }),
  };
}

export interface MotionPresets {
  reduced: boolean;
  /** Parent for staggered children: initial="hidden" animate="show". */
  list: Variants;
  /** Child of `list`: rises and fades in. */
  item: Variants;
  /** Pops in from slightly small. Good for badges, chips, stamps. */
  pop: Variants;
  /** Plain fade, for anything that should not move. */
  fade: Variants;
  /** Spring to use for layout and drags. */
  spring: Transition;
  /**
   * Props for a looping animation, or {} when reduced (no loops). Spread them:
   *   <motion.span {...m.loop({ y: [0, 8, 0] }, 2)} />
   */
  loop: (animate: TargetAndTransition, duration?: number) => { animate?: TargetAndTransition; transition?: Transition };
}

/**
 * Presets that respect prefers-reduced-motion. Usage:
 *   const m = useMotionPresets();
 *   <motion.ul variants={m.list} initial="hidden" animate="show">
 *     <motion.li variants={m.item}>...</motion.li>
 */
export function useMotionPresets(): MotionPresets {
  const reduced = useSafeReducedMotion();
  return useMemo<MotionPresets>(() => {
    const stagger = reduced ? 0 : 0.06;
    return {
      reduced,
      list: { hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: reduced ? 0 : 0.04 } } },
      item: reduced
        ? { hidden: { opacity: 0 }, show: { opacity: 1, y: 0, transition: FADE } }
        : { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: SPRING } },
      pop: reduced
        ? { hidden: { opacity: 0 }, show: { opacity: 1, scale: 1, transition: FADE } }
        : { hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1, transition: SPRING_SNAP } },
      fade: { hidden: { opacity: 0 }, show: { opacity: 1, transition: FADE } },
      spring: reduced ? { duration: 0 } : SPRING,
      loop: (animate, duration = 2.4) =>
        reduced ? {} : { animate, transition: { duration, repeat: Infinity, ease: "easeInOut" } },
    };
  }, [reduced]);
}
