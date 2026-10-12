// Shared bits for the quiz cards: the props every card gets, number-key
// picking, and arrow keys for radio groups. Owned by builder A (You).
import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useIsPresent } from "framer-motion";
import type { QuizAnswers } from "../../types";

export interface QuizCardProps {
  q: QuizAnswers;
  set: (patch: Partial<QuizAnswers>) => void;
  reduced: boolean;
  /** True for the card on screen (an exiting card stops listening). */
  active: boolean;
  /** Moves on when this card is answered. Enter on a radio calls it. */
  advance: () => void;
}

const TYPING = "input, textarea, select, [contenteditable='true']";

/** Number keys 1 to 9 pick options while the card is active and nobody is typing. */
export function useNumberKeys(activeProp: boolean, onNumber: (n: number) => void) {
  // A card that is animating out must not catch keys meant for the next one.
  const present = useIsPresent();
  const active = activeProp && present;
  const ref = useRef(onNumber);
  useEffect(() => {
    ref.current = onNumber;
  });
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || !/^[1-9]$/.test(e.key)) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest?.(TYPING)) return;
      e.preventDefault();
      ref.current(Number(e.key));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);
}

/**
 * Arrow keys, Home and End for a role="radiogroup": moves the choice and the
 * focus together. Enter submits (radios have no Enter of their own).
 */
export function radioKeyDown(
  e: ReactKeyboardEvent<HTMLElement>,
  index: number,
  count: number,
  select: (i: number) => void,
  submit?: () => void,
) {
  let next = -1;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % count;
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + count) % count;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = count - 1;
  else if (e.key === "Enter" && submit) {
    e.preventDefault();
    submit();
    return;
  }
  if (next < 0) return;
  e.preventDefault();
  select(next);
  const group = e.currentTarget.closest("[role='radiogroup']");
  const radios = group?.querySelectorAll<HTMLElement>("[role='radio']");
  radios?.[next]?.focus();
}

/** Roving tabindex: the checked radio, or the first one when none is checked. */
export function rovingTab(index: number, selected: number): 0 | -1 {
  return index === (selected < 0 ? 0 : selected) ? 0 : -1;
}
