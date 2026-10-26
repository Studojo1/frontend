import { useEffect, useRef, useState } from "react";
import { Cross } from "./icons";
import { JoinCard, Said, Talking, Ticks } from "./JoinCard";
import { useAgent } from "./start";
import { StuArt } from "./StuArt";

// HOMEPAGE V2: the sheet the floating agent and the footer's button open (hp/v2.html): the same live Stu, her words
// and /join's card, in place over the page. A bottom sheet on a phone, a panel above the side pill on a desktop.
// The same one stage as the hero (start.tsx), so her line plays once: opened while she is idle she starts here;
// opened after, it shows where she is. Closing it (the x, the backdrop or Escape) while she talks stops her, and the
// card is what shows next. Focus goes to the x when it opens and back to the button that opened it.

export function Sheet() {
  const a = useAgent();
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const x = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLElement>(null);
  const { sheetOpen, closeSheet } = a;

  useEffect(() => {
    if (sheetOpen) {
      setMounted(true);
      const r = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(r);
    }
    setShown(false);
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(() => setMounted(false), reduced ? 0 : 320);
    return () => window.clearTimeout(id);
  }, [sheetOpen]);

  useEffect(() => {
    if (shown) x.current?.focus({ preventScroll: true });
  }, [shown]);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetOpen, closeSheet]);

  // On a phone, the card comes in below her: bring it into view inside the sheet (join.tsx, 450 ms).
  useEffect(() => {
    if (!sheetOpen || a.stage !== "signup" || a.from !== "sheet" || window.innerWidth > 640) return;
    const id = window.setTimeout(() => card.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 450);
    return () => window.clearTimeout(id);
  }, [sheetOpen, a.stage, a.from]);

  if (!mounted || a.signedIn) return null;
  const stage = a.stage === "idle" ? "speaking" : a.stage;
  return (
    <>
      <div className={`hv-sheet-back${shown ? " hv-open" : ""}`} onClick={closeSheet} aria-hidden="true" />
      <div className={`hv-sheet${shown ? " hv-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="sheet-kicker" data-stage={stage} data-sheet>
        <div className="hv-sheet-top">
          <span className="hv-kicker" id="sheet-kicker">
            Stu, your career agent
          </span>
          <button ref={x} type="button" className="hv-sheet-x" aria-label="close" onClick={closeSheet}>
            <Cross size={16} sw={2.6} />
          </button>
        </div>
        <StuArt live={a.speaking ? a.level : null} />
        <Said />
        {stage === "speaking" && <Talking />}
        {stage === "signup" && <Ticks />}
        {stage === "signup" && <JoinCard ref={card} idPrefix="sheet" />}
      </div>
    </>
  );
}
