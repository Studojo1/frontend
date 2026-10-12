// Top bars. Desktop (lg and up, 56px): wordmark, concept badge, the
// Simulated day control, Reset demo, avatar. Phones (52px plus a 28px
// ribbon): wordmark, mission chip, fuel ring; the ribbon carries the concept
// line and the day stepper. Shared file: owned by the foundation.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { FiChevronDown, FiRotateCcw } from "react-icons/fi";
import { MISSION_ACCENT } from "../config";
import { useAgent } from "../core/engine";
import { clearSaved, useB2C, useMission } from "../core/store";
import { STUDENT } from "../data";
import { Avatar, Button, cx, FOCUS_RING } from "../ui";
import { ConceptBadge } from "../widgets/concept-badge";
import { DayControl } from "../widgets/day-control";
import { FuelGauge } from "../widgets/fuel-gauge";

function Wordmark() {
  return (
    <Link to="/" className={cx("flex min-h-11 shrink-0 items-center rounded-lg font-clash text-2xl font-bold tracking-tight text-studojo-ink", FOCUS_RING)}>
      studojo
    </Link>
  );
}

function ResetDemo() {
  const { dispatch } = useB2C();
  const agent = useAgent();
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!confirming) return;
    const t = window.setTimeout(() => setConfirming(false), 3500);
    return () => window.clearTimeout(t);
  }, [confirming]);
  return (
    <Button
      variant="ghost"
      size="sm"
      icon={<FiRotateCcw />}
      onClick={() => {
        if (!confirming) return setConfirming(true);
        setConfirming(false);
        // Stop every live run and timer first, so nothing from the old run writes into the fresh state.
        agent.reset();
        clearSaved();
        dispatch({ type: "RESET" });
      }}
      className={cx("shrink-0", confirming && "bg-studojo-pink-bg text-[#be185d]")}
    >
      {confirming ? "Tap again to reset" : "Reset demo"}
    </Button>
  );
}

export function DesktopTopBar() {
  return (
    <header className="hidden h-14 shrink-0 items-center gap-3 border-b-2 border-studojo-ink bg-white px-4 lg:flex">
      <Wordmark />
      <ConceptBadge />
      <div className="flex-1" />
      <DayControl />
      <ResetDemo />
      <span className="flex items-center gap-2 pl-1" title={`${STUDENT.name}, ${STUDENT.classOf}`}>
        <Avatar first="Riya" last="Sharma" size="sm" />
        <span className="sr-only">Signed in as {STUDENT.name} (Sample)</span>
      </span>
    </header>
  );
}

export function PhoneTopBar() {
  const { dispatch } = useB2C();
  const m = useMission();
  const accent = MISSION_ACCENT[m.accent];
  return (
    <header className="sticky top-0 z-30 border-b-2 border-studojo-ink bg-white lg:hidden">
      <div className="flex h-[52px] items-center gap-2 px-4">
        <Wordmark />
        <button
          type="button"
          onClick={() => dispatch({ type: "SHEET", sheet: "switcher" })}
          aria-label={`Mission: ${m.short}. Switch mission`}
          className={cx("ml-1 inline-flex min-h-11 min-w-0 flex-1 items-center gap-1.5 rounded-xl px-2 font-satoshi text-sm font-bold", FOCUS_RING)}
        >
          <span aria-hidden className={cx("h-2.5 w-2.5 shrink-0 rounded-full border-2 border-studojo-ink", accent.solid)} />
          <span className="truncate">{m.short}</span>
          <FiChevronDown aria-hidden className="shrink-0" />
        </button>
        <FuelGauge variant="ring" />
      </div>
      <div className="flex h-7 items-center gap-2 border-t border-studojo-ink/15 bg-studojo-purple-bg px-4 font-satoshi text-[11px] font-bold text-studojo-purple-strong">
        <span className="min-w-0 truncate">Concept preview: nothing is sent</span>
        {/* Under 380px the concept line and the day need the room; the day control still says Simulated to screen readers. */}
        <span aria-hidden className="max-[379px]:hidden">·</span>
        <span className="shrink-0 max-[379px]:hidden">Simulated</span>
        <DayControl compact className="-mr-1 ml-auto" />
      </div>
    </header>
  );
}
