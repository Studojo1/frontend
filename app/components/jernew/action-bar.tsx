// The fixed bottom action bar for /jernew: Back, an optional secondary
// action, and the step's primary action. Enter presses the primary.
// Shared file: owned by the foundation.
import { useCallback, useEffect, useRef, useState } from "react";
import { useAnimate } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useFlow, useResolvedBar } from "./flow";
import { useSafeReducedMotion } from "./motion";
import { Button, Kbd } from "./ui";
import { cx } from "./ui-base";

/** Keys that should never trigger "Enter continues" (they use Enter themselves). */
const ENTER_OWNERS =
  "button, a[href], textarea, select, [contenteditable='true'], [role='switch'], [role='slider'], [role='radio'], input[type='checkbox'], input[type='radio'], [data-no-enter]";

export function ActionBar() {
  const f = useFlow();
  const bar = useResolvedBar();
  const reduced = useSafeReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const [nudge, setNudge] = useState("");
  const [announce, setAnnounce] = useState("");

  // Clear the nudge when the step changes or the button becomes enabled.
  useEffect(() => setNudge(""), [f.step, bar.disabled]);

  // Enter is ignored for a moment after each step change, so one held or
  // double-tapped Enter can never run two steps in a row.
  const stepAt = useRef(0);
  useEffect(() => {
    stepAt.current = performance.now();
  }, [f.step]);

  const press = useCallback(() => {
    if (bar.switching) return;
    if (bar.disabled) {
      const why = bar.disabledHint ?? "Finish this step to continue.";
      setNudge(why);
      setAnnounce("");
      requestAnimationFrame(() => setAnnounce(why));
      if (!reduced && scope.current) animate(scope.current, { x: [0, -7, 7, -4, 4, 0] }, { duration: 0.32 });
      return;
    }
    if (bar.onPrimary) bar.onPrimary();
    else f.next();
  }, [bar, f, reduced, animate, scope]);

  // Enter continues when the step is valid, unless focus is on something that uses Enter itself.
  const pressRef = useRef(press);
  useEffect(() => {
    pressRef.current = press;
  });
  const enterOff = bar.enterToContinue === false || (bar.hidden && bar.enterToContinue !== true);
  useEffect(() => {
    if (enterOff) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.defaultPrevented || e.isComposing || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest?.(ENTER_OWNERS)) return;
      e.preventDefault();
      if (e.repeat || performance.now() - stepAt.current < 250) return;
      pressRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterOff]);

  const showBack = f.stepIndex > 0 && !bar.hideBack;
  const hint = nudge || bar.hint;

  return (
    <>
      <div aria-live="polite" role="status" className="sr-only">
        {announce}
      </div>
      {bar.hidden ? null : (
        <div
          data-floating-cta
          className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-studojo-ink bg-white pb-[env(safe-area-inset-bottom)]"
        >
          {bar.hintOnPhone && bar.hint && !nudge ? (
            <p className="mx-auto max-w-[1200px] truncate px-4 pt-2 font-satoshi text-xs text-studojo-muted sm:hidden">{bar.hint}</p>
          ) : null}
          <div className={cx("mx-auto flex w-full max-w-[1200px] items-center gap-3 px-4 py-3 sm:px-6", bar.hintOnPhone && bar.hint && !nudge && "pt-1.5 sm:pt-3")}>
            {showBack ? (
              <Button variant="secondary" size="lg" onClick={f.back} icon={<FiArrowLeft />} className="shrink-0" aria-label="Back">
                <span className="hidden sm:inline">Back</span>
              </Button>
            ) : null}
            <p
              className={cx(
                "hidden min-w-0 flex-1 truncate font-satoshi text-sm sm:block",
                nudge ? "font-bold text-[#be185d]" : "text-studojo-muted",
              )}
            >
              {hint ||
                (!enterOff && !bar.disabled ? (
                  <span className="hidden lg:inline">
                    Press <Kbd>Enter</Kbd> to continue
                  </span>
                ) : null)}
            </p>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none">
              {bar.secondary ? (
                <Button variant="ghost" onClick={bar.secondary.onClick} className="shrink-0">
                  {bar.secondary.label}
                </Button>
              ) : null}
              <div ref={scope} className={cx("min-w-0 flex-1 sm:flex-none", bar.switching && "pointer-events-none")}>
                <Button
                  variant={bar.tone ?? "primary"}
                  size="lg"
                  onClick={press}
                  aria-disabled={bar.disabled || undefined}
                  iconRight={<FiArrowRight />}
                  className="w-full sm:w-auto"
                >
                  <span className="truncate">{bar.label}</span>
                </Button>
              </div>
            </div>
          </div>
          {nudge ? (
            <p className="mx-auto -mt-1 max-w-[1200px] px-4 pb-2 font-satoshi text-xs font-bold text-[#be185d] sm:hidden">{nudge}</p>
          ) : null}
        </div>
      )}
    </>
  );
}
