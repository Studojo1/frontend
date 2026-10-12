// The fuel gauge: a semicircle in the rail, a ring on phones. Sent is ink,
// reserved (approved, not yet sent) is violet hatch, left is white. Orange
// at 25 left. Tap opens the wallet. Shared file: owned by the foundation.
import { useId } from "react";
import { motion } from "framer-motion";
import { LOW_FUEL_WARN } from "../config";
import { fuel } from "../core/derive";
import { useB2C } from "../core/store";
import { formatCount } from "../data";
import { SPRING } from "../motion";
import type { MissionId } from "../types";
import { cx, FOCUS_RING } from "../ui";

export function FuelGauge({ variant = "semi", missionId, className }: { variant?: "semi" | "ring"; missionId?: MissionId; className?: string }) {
  const { s, dispatch } = useB2C();
  const f = fuel(s, missionId ?? s.env);
  const pid = useId().replace(/:/g, "");
  const low = f.total > 0 && f.left <= LOW_FUEL_WARN;
  const sentP = f.total ? f.sent / f.total : 0;
  const resP = f.total ? Math.min(1 - sentP, f.reserved / f.total) : 0;
  const label = f.total
    ? `Fuel: ${formatCount(f.left)} of ${formatCount(f.total)} outreaches left, ${formatCount(f.sent)} sent, ${f.reserved} reserved, Simulated. Open wallet`
    : "No pack on this mission yet. Open wallet";

  const hatch = (
    <defs>
      <pattern id={`h${pid}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="5" height="5" fill="#ede4fe" />
        <rect width="2.2" height="5" fill="#8b5cf6" />
      </pattern>
    </defs>
  );

  if (variant === "ring") {
    const r = 15;
    const c = 2 * Math.PI * r;
    return (
      <button type="button" aria-label={label} onClick={() => dispatch({ type: "SHEET", sheet: "wallet" })} className={cx("relative inline-flex h-11 w-11 items-center justify-center rounded-full", FOCUS_RING, className)}>
        <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90" aria-hidden>
          {hatch}
          <circle cx="20" cy="20" r={r} fill="white" stroke="#171717" strokeWidth="7" />
          <circle cx="20" cy="20" r={r} fill="none" stroke="white" strokeWidth="4" />
          <motion.circle cx="20" cy="20" r={r} fill="none" stroke={`url(#h${pid})`} strokeWidth="4"
            strokeDasharray={c} initial={false} animate={{ strokeDashoffset: c * (1 - sentP - resP) }} transition={SPRING} />
          <motion.circle cx="20" cy="20" r={r} fill="none" stroke={low ? "#f59e0b" : "#171717"} strokeWidth="4"
            strokeDasharray={c} initial={false} animate={{ strokeDashoffset: c * (1 - sentP) }} transition={SPRING} />
        </svg>
        <span aria-hidden className={cx("absolute font-satoshi text-[10px] font-bold tabular-nums", low ? "text-[#b45309]" : "text-studojo-ink")}>
          {f.total ? f.left : "0"}
        </span>
      </button>
    );
  }

  // Semicircle: an arc from left to right across the top.
  const R = 52;
  const L = Math.PI * R;
  const d = `M 8 62 A ${R} ${R} 0 0 1 112 62`;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => dispatch({ type: "SHEET", sheet: "wallet" })}
      className={cx("group block w-full rounded-2xl text-left", FOCUS_RING, className)}
    >
      <svg viewBox="0 0 120 70" className="mx-auto block w-full max-w-[180px]" aria-hidden>
        {hatch}
        <path d={d} fill="none" stroke="#171717" strokeWidth="14" strokeLinecap="round" />
        <path d={d} fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" />
        <motion.path d={d} fill="none" stroke={`url(#h${pid})`} strokeWidth="10" strokeDasharray={L}
          initial={false} animate={{ strokeDashoffset: L * (1 - sentP - resP) }} transition={SPRING} />
        <motion.path d={d} fill="none" stroke={low ? "#f59e0b" : "#171717"} strokeWidth="10" strokeDasharray={L}
          initial={false} animate={{ strokeDashoffset: L * (1 - sentP) }} transition={SPRING} />
      </svg>
      <div className="-mt-6 text-center">
        <p className={cx("font-clash text-2xl font-semibold tabular-nums", low ? "text-[#b45309]" : "text-studojo-ink")}>{formatCount(f.left)}</p>
        <p className="font-satoshi text-xs text-studojo-muted">
          {f.total ? `left of ${formatCount(f.total)}, Simulated` : "No pack yet"}
        </p>
      </div>
      {f.total ? (
        <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 font-satoshi text-[11px] text-studojo-muted">
          <span className="inline-flex items-center gap-1"><i aria-hidden className="h-2 w-2 rounded-full bg-studojo-ink" />{formatCount(f.sent)} sent</span>
          <span className="inline-flex items-center gap-1"><i aria-hidden className="h-2 w-2 rounded-full bg-studojo-purple" />{f.reserved} reserved</span>
          <span className="inline-flex items-center gap-1 text-[#047857]">+{f.givenBack} back</span>
        </div>
      ) : null}
    </button>
  );
}
