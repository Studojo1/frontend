// The launch board: an outbox at the top, a send calendar below. On launch,
// one envelope per send day flies along a curve onto its day, which fills in.
// For Free, a page card gets a LIVE stamp instead. Owned by builder D.
import { motion } from "framer-motion";
import { formatCount, PROFILE_DRAFT, sendPlan } from "../../data";
import { SPRING_SNAP, SPRING_SOFT, useMotionPresets } from "../../motion";
import { curvePoints } from "./shared";

export type BoardPhase = "ready" | "flying" | "done";

const VW = 360;
const CELL_W = 44;
const CELL_H = 46;
const GAP_X = 6;
const GAP_Y = 8;
const X0 = (VW - (7 * CELL_W + 6 * GAP_X)) / 2;
const Y0 = 104;
const FROM = { x: VW / 2, y: 44 };

/** Seconds between envelopes and per flight. Exported so Launch can time the hand-off. */
export const FLIGHT = { gap: 0.13, dur: 0.75 };

export function flightSeconds(total: number) {
  return (sendPlan(total).length - 1) * FLIGHT.gap + FLIGHT.dur;
}

function cellPos(i: number) {
  return { x: X0 + (i % 7) * (CELL_W + GAP_X), y: Y0 + Math.floor(i / 7) * (CELL_H + GAP_Y) };
}

export function SendBoard({ total, phase }: { total: number; phase: BoardPhase }) {
  const m = useMotionPresets();
  const plan = sendPlan(total);
  const rows = Math.max(2, Math.ceil(plan.length / 7));
  const vh = Y0 + rows * (CELL_H + GAP_Y) + 4;
  const flying = phase === "flying" && !m.reduced;

  return (
    <figure>
      <svg viewBox={`0 0 ${VW} ${vh}`} className="mx-auto block h-auto w-full max-w-[440px] overflow-visible" aria-hidden>
        <Outbox launched={phase !== "ready"} />
        {Array.from({ length: rows * 7 }, (_, i) => {
          const p = cellPos(i);
          const d = plan[i];
          const landed = phase === "done" || (phase === "flying" && m.reduced);
          return (
            <g key={i}>
              <rect
                x={p.x}
                y={p.y}
                width={CELL_W}
                height={CELL_H}
                rx={9}
                fill="#ffffff"
                stroke="#171717"
                strokeWidth={d ? 2 : 1.5}
                strokeDasharray={d ? undefined : "3 4"}
                opacity={d ? 1 : 0.35}
              />
              {d ? (
                <>
                  <motion.rect
                    x={p.x + 2}
                    y={p.y + 2}
                    width={CELL_W - 4}
                    height={CELL_H - 4}
                    rx={7}
                    fill="#6ee7b7"
                    initial={false}
                    animate={{ opacity: landed ? 1 : 0, scale: landed ? 1 : 0.4 }}
                    transition={
                      m.reduced
                        ? { duration: 0.15 }
                        : { ...SPRING_SNAP, delay: phase === "flying" ? 0 : i * 0.02 }
                    }
                  />
                  {flying ? (
                    <motion.rect
                      x={p.x + 2}
                      y={p.y + 2}
                      width={CELL_W - 4}
                      height={CELL_H - 4}
                      rx={7}
                      fill="#6ee7b7"
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ ...SPRING_SNAP, delay: i * FLIGHT.gap + FLIGHT.dur * 0.92 }}
                    />
                  ) : null}
                  <text x={p.x + CELL_W / 2} y={p.y + 15} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#525252" className="font-satoshi">
                    DAY {d.day}
                  </text>
                  <text x={p.x + CELL_W / 2} y={p.y + 35} textAnchor="middle" fontSize={16} fontWeight={700} fill="#171717" className="font-clash">
                    {d.count}
                  </text>
                </>
              ) : null}
            </g>
          );
        })}
        {flying ? plan.map((d, i) => <Envelope key={d.day} i={i} />) : null}
      </svg>
      <figcaption className="sr-only">
        Send calendar: {plan.map((d) => `day ${d.day}, ${d.count} emails`).join("; ")}.
      </figcaption>
      <p className="mt-3 font-satoshi text-sm text-studojo-muted">
        {formatCount(total)} first emails over {plan.length} days, starting at {plan[0]?.count ?? 0} a day. Follow-ups go 4 days after each
        first email, last nudges 9 days after. A slow start keeps your inbox healthy.
      </p>
    </figure>
  );
}

function Envelope({ i }: { i: number }) {
  const p = cellPos(i);
  const to = { x: p.x + CELL_W / 2, y: p.y + CELL_H / 2 };
  const bend = { x: (FROM.x + to.x) / 2 + (to.x < FROM.x ? -46 : 46), y: Math.min(FROM.y, to.y) - 34 };
  const { xs, ys } = curvePoints(FROM, bend, to, 10);
  const tilt = to.x < FROM.x ? -14 : 14;
  return (
    <motion.g
      initial={{ x: FROM.x, y: FROM.y, opacity: 0, scale: 0.6 }}
      animate={{
        x: xs,
        y: ys,
        rotate: [0, tilt, tilt, tilt * 0.5, 0, 0, 0, 0, 0, 0, 0],
        opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        scale: [0.6, 1, 1.1, 1.1, 1, 1, 1, 0.95, 0.9, 0.85, 0.7],
      }}
      transition={{ duration: FLIGHT.dur, delay: i * FLIGHT.gap, ease: "easeInOut" }}
    >
      <rect x={-12} y={-8.5} width={24} height={17} rx={3} fill="#ffffff" stroke="#171717" strokeWidth={2} />
      <path d="M -10.5 -6.5 L 0 1.5 L 10.5 -6.5" fill="none" stroke="#171717" strokeWidth={2} strokeLinejoin="round" />
    </motion.g>
  );
}

function Outbox({ launched }: { launched: boolean }) {
  const m = useMotionPresets();
  return (
    <g>
      <motion.g initial={false} animate={{ y: launched && !m.reduced ? [0, 3, 0] : 0 }} transition={{ duration: 0.3 }}>
        <path d={`M ${FROM.x - 46} 30 L ${FROM.x - 38} 64 L ${FROM.x + 38} 64 L ${FROM.x + 46} 30`} fill="#faf5fe" stroke="#171717" strokeWidth={3} strokeLinejoin="round" />
        <rect x={FROM.x - 50} y={24} width={100} height={10} rx={4} fill="#8b5cf6" stroke="#171717" strokeWidth={2.5} />
        <text x={FROM.x} y={54} textAnchor="middle" fontSize={11} fontWeight={700} fill="#171717" className="font-satoshi" style={{ letterSpacing: "0.12em" }}>
          OUTBOX
        </text>
      </motion.g>
      <text x={8} y={92} fontSize={10} fontWeight={700} fill="#525252" className="font-satoshi" style={{ letterSpacing: "0.12em" }}>
        SEND CALENDAR
      </text>
    </g>
  );
}

/** Free: a page card that gets a LIVE (or PRIVATE) stamp when launched. */
export function PageBoard({ phase, isPublic }: { phase: BoardPhase; isPublic: boolean }) {
  const m = useMotionPresets();
  const on = phase !== "ready";
  return (
    <div className="relative mx-auto max-w-sm py-4">
      <div className="rounded-2xl border-2 border-studojo-ink bg-white p-4 shadow-brutal">
        <p className="truncate rounded-lg border-2 border-studojo-ink bg-studojo-surface-muted px-2 py-1 font-satoshi text-xs text-studojo-muted">
          {PROFILE_DRAFT.url}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-purple-bg font-clash font-semibold">
            {PROFILE_DRAFT.initials}
          </span>
          <span className="min-w-0">
            <span className="block font-clash text-lg font-semibold leading-tight">{PROFILE_DRAFT.name}</span>
            <span className="block truncate font-satoshi text-xs text-studojo-muted">{PROFILE_DRAFT.meta}</span>
          </span>
        </div>
        <span aria-hidden className="mt-3 block h-2 w-4/5 rounded-full bg-studojo-ink/10" />
        <span aria-hidden className="mt-2 block h-2 w-3/5 rounded-full bg-studojo-ink/10" />
      </div>
      <motion.span
        aria-hidden
        className="absolute right-2 top-2 rounded-lg border-[3px] border-[#047857] bg-white/90 px-3 py-1 font-clash text-2xl font-bold tracking-wider text-[#047857]"
        initial={false}
        animate={on ? { opacity: 1, scale: 1, rotate: -10 } : { opacity: 0, scale: m.reduced ? 1 : 1.8, rotate: -10 }}
        transition={m.reduced ? { duration: 0.15 } : SPRING_SOFT}
      >
        {isPublic ? "LIVE" : "SAVED"}
      </motion.span>
    </div>
  );
}
