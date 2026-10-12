// Concentric visibility rings: You in the middle, then your link, search
// engines and hiring managers. A ring lights up when its switch is on, sends
// a ripple out when it turns on, and small visitors orbit lit rings.
// Owned by builder B (Your page).
import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useMotionPresets } from "../../motion";
import type { VisibilityState } from "../../types";
import { RINGS, type RingDef, type RingId } from "./visibility-logic";

const C = 200;

interface RingsProps {
  v: VisibilityState;
  locked: Record<RingId, boolean>;
  hot: RingId | null;
}

export function Rings({ v, locked, hot }: RingsProps) {
  const m = useMotionPresets();
  const pulses = usePulses(v);
  const hatch = `jn-ring-hatch-${useId().replace(/:/g, "")}`;

  return (
    <svg viewBox="0 0 400 400" className="mx-auto block h-auto w-full max-w-[26rem]" aria-hidden>
      {/* Waiting on the 18+ check: the same hatching as the switch, never a solid "on". */}
      <defs>
        <pattern id={hatch} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" fill="#ffffff" />
          <rect width="4" height="10" fill="#fbcfe8" />
        </pattern>
      </defs>
      {/* Outer to inner so each band shows its own tint. */}
      {[...RINGS].reverse().map((ring) => {
        const on = v[ring.id] && (ring.id === "link" || v.link);
        const pending = on && !v.adult;
        return (
          <g key={ring.id}>
            <circle cx={C} cy={C} r={ring.r} fill="#ffffff" stroke="#a3a3a3" strokeWidth="2" strokeDasharray="5 7" />
            {pending ? <circle cx={C} cy={C} r={ring.r} fill={`url(#${hatch})`} stroke="#171717" strokeWidth="2" strokeDasharray="6 5" /> : null}
            <motion.circle
              cx={C}
              cy={C}
              r={ring.r}
              fill={ring.tint}
              stroke="#171717"
              strokeWidth="2"
              initial={false}
              animate={{ opacity: on && !pending ? 1 : 0 }}
              transition={{ duration: 0.25 }}
            />
            <motion.circle
              cx={C}
              cy={C}
              r={ring.r}
              fill="none"
              stroke={ring.hex}
              strokeWidth="5"
              initial={false}
              animate={{ opacity: hot === ring.id ? 1 : 0 }}
              transition={{ duration: 0.15 }}
            />
          </g>
        );
      })}

      {/* Ripples: one per switch-on, keyed so each plays once. */}
      {!m.reduced
        ? RINGS.map((ring) =>
            pulses[ring.id] > 0 ? (
              <motion.circle
                key={`${ring.id}-${pulses[ring.id]}`}
                cx={C}
                cy={C}
                r={ring.r}
                fill="none"
                stroke={ring.hex}
                strokeWidth="6"
                initial={{ scale: 0.3, opacity: 0.9 }}
                animate={{ scale: 1.04, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            ) : null,
          )
        : null}

      {/* Visitors orbiting lit rings. */}
      {RINGS.map((ring, i) => {
        const on = v[ring.id] && (ring.id === "link" || v.link) && v.adult;
        return <Orbit key={ring.id} ring={ring} on={on} index={i} />;
      })}

      {/* You */}
      <circle cx={C} cy={C} r="44" fill="#6d28d9" stroke="#171717" strokeWidth="3" />
      <text x={C} y={C + 7} textAnchor="middle" fontFamily="Clash Display, sans-serif" fontWeight="600" fontSize="22" fill="#ffffff">
        You
      </text>

      {/* Labels sit on top of each ring. */}
      {RINGS.map((ring) => {
        const on = v[ring.id] && (ring.id === "link" || v.link);
        return <RingLabel key={ring.id} ring={ring} on={on} pending={on && !v.adult} locked={locked[ring.id]} />;
      })}
    </svg>
  );
}

/** Counts each off-to-on change per ring, so a ripple can play. */
function usePulses(v: VisibilityState): Record<RingId, number> {
  const [pulses, setPulses] = useState<Record<RingId, number>>({ link: 0, search: 0, managers: 0 });
  const prev = useRef(v);
  useEffect(() => {
    const p = prev.current;
    prev.current = v;
    const turnedOn = RINGS.filter((r) => v[r.id] && !p[r.id]).map((r) => r.id);
    if (v.adult && !p.adult && v.link) turnedOn.push("link");
    if (!turnedOn.length) return;
    setPulses((cur) => {
      const next = { ...cur };
      for (const id of turnedOn) next[id] += 1;
      return next;
    });
  }, [v]);
  return pulses;
}

const GLYPH_ANGLES: Record<RingId, number[]> = {
  link: [200, 320, 80],
  search: [150, 210, 20],
  managers: [110, 230, 340, 40],
};

function Orbit({ ring, on, index }: { ring: RingDef; on: boolean; index: number }) {
  const m = useMotionPresets();
  const spin = on && !m.reduced;
  return (
    <motion.g
      initial={false}
      animate={{ opacity: on ? 1 : 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.g
        animate={spin ? { rotate: index % 2 ? -360 : 360 } : { rotate: 0 }}
        transition={spin ? { duration: 60 + index * 18, repeat: Infinity, ease: "linear" } : { duration: 0 }}
      >
        {/* Invisible hoop so the group's box is centred on You: it spins around the middle. */}
        <circle cx={C} cy={C} r={ring.r + 14} fill="none" />
        {GLYPH_ANGLES[ring.id].map((deg) => {
          const a = (deg * Math.PI) / 180;
          const x = C + ring.r * Math.cos(a);
          const y = C + ring.r * Math.sin(a);
          return <Visitor key={deg} kind={ring.id} x={x} y={y} hex={ring.hex} />;
        })}
      </motion.g>
    </motion.g>
  );
}

function Visitor({ kind, x, y, hex }: { kind: RingId; x: number; y: number; hex: string }) {
  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}>
      <circle r="11" fill={hex} stroke="#171717" strokeWidth="2" />
      {kind === "link" ? (
        <g fill="#ffffff" stroke="#171717" strokeWidth="1.2">
          <circle cy="-3" r="3" />
          <path d="M-5.5 6 a5.5 5 0 0 1 11 0 z" />
        </g>
      ) : kind === "search" ? (
        <g fill="none" stroke="#171717" strokeWidth="2" strokeLinecap="round">
          <circle cx="-1.5" cy="-1.5" r="4" fill="#ffffff" />
          <path d="M1.5 1.5 L5.5 5.5" />
        </g>
      ) : (
        <g stroke="#171717" strokeWidth="1.4">
          <rect x="-6" y="-3" width="12" height="9" rx="1.5" fill="#ffffff" />
          <path d="M-2.5 -3 v-2 h5 v2" fill="none" />
        </g>
      )}
    </g>
  );
}

function RingLabel({ ring, on, pending, locked }: { ring: RingDef; on: boolean; pending: boolean; locked: boolean }) {
  const state = locked ? "Locked" : pending ? "Needs 18+" : on ? "On" : "Off";
  const text = `${ring.short} · ${state}`;
  const w = Math.round(text.length * 6.9 + 30);
  const y = C - ring.r;
  return (
    <g transform={`translate(${C - w / 2} ${y - 12})`}>
      <rect width={w} height="24" rx="12" fill="#ffffff" stroke="#171717" strokeWidth="2" />
      <circle cx="13" cy="12" r="4.5" fill={on && !pending ? ring.hex : "#d4d4d4"} stroke="#171717" strokeWidth="1.5" />
      <text x="23" y="16.5" fontFamily="Satoshi, sans-serif" fontWeight="700" fontSize="12" fill="#171717">
        {text}
      </text>
    </g>
  );
}
