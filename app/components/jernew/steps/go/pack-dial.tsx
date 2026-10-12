// The pack gauge: a half dial whose needle snaps between Free, Starter,
// Standard and Pro. Drag it, tap a band, or use the arrow keys (it is a
// role="slider"). Owned by builder D.
import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { motion } from "framer-motion";
import { formatINR, PACKS } from "../../data";
import { SPRING } from "../../motion";
import type { PackId } from "../../types";
import { cx, FOCUS_RING } from "../../ui";

const W = 320;
const H = 196;
const CX = 160;
const CY = 170;
const R = 120;

/** Needle angle (degrees from straight up, clockwise) for each stop. */
const STOP_ANGLE: Record<PackId, number> = { free: -67.5, starter: -22.5, standard: 22.5, pro: 67.5 };
const BAND: Record<PackId, { from: number; to: number; fill: string }> = {
  free: { from: -90, to: -45, fill: "#f5f5f5" },
  starter: { from: -45, to: 0, fill: "#d0fae4" },
  standard: { from: 0, to: 45, fill: "#6ee7b7" },
  pro: { from: 45, to: 90, fill: "#10b981" },
};
const ORDER: PackId[] = ["free", "starter", "standard", "pro"];
const TICKS = Array.from({ length: 31 }, (_, i) => -90 + i * 6);

function pt(deg: number, r: number) {
  const a = (deg * Math.PI) / 180;
  return { x: CX + r * Math.sin(a), y: CY - r * Math.cos(a) };
}

function arc(from: number, to: number, r: number) {
  const a = pt(from, r);
  const b = pt(to, r);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

export interface PackDialProps {
  value: PackId;
  onChange: (id: PackId) => void;
  /** Locks the dial while the mock payment runs. */
  locked?: boolean;
}

export function PackDial({ value, onChange, locked }: PackDialProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const idx = ORDER.indexOf(value);
  const pack = PACKS.find((p) => p.id === value) ?? PACKS[2];
  const needle = STOP_ANGLE[value];

  const pick = (clientX: number, clientY: number) => {
    const el = svgRef.current;
    if (!el || locked) return;
    const box = el.getBoundingClientRect();
    const sx = ((clientX - box.left) / box.width) * W;
    const sy = ((clientY - box.top) / box.height) * H;
    const deg = Math.max(-90, Math.min(90, (Math.atan2(sx - CX, CY - sy) * 180) / Math.PI));
    let best: PackId = value;
    let bestD = Infinity;
    for (const id of ORDER) {
      const d = Math.abs(STOP_ANGLE[id] - deg);
      if (d < bestD) {
        bestD = d;
        best = id;
      }
    }
    if (best !== value) onChange(best);
  };

  // Mouse and pen drag straight away. Touch waits to see the gesture: a
  // sideways drag turns the dial, a vertical swipe scrolls the page, a tap picks.
  const start = useRef<{ x: number; y: number; touch: boolean } | null>(null);
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (locked) return;
    const touch = e.pointerType === "touch";
    start.current = { x: e.clientX, y: e.clientY, touch };
    if (touch) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pick(e.clientX, e.clientY);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s0 = start.current;
    if (!dragging.current && s0?.touch) {
      const dx = Math.abs(e.clientX - s0.x);
      const dy = Math.abs(e.clientY - s0.y);
      if (dx > 6 && dx > dy) {
        dragging.current = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }
    }
    if (dragging.current) pick(e.clientX, e.clientY);
  };
  const stop = (e?: PointerEvent<HTMLDivElement>) => {
    const s0 = start.current;
    if (e?.type === "pointerup" && s0?.touch && !dragging.current) {
      if (Math.abs(e.clientX - s0.x) < 8 && Math.abs(e.clientY - s0.y) < 8) pick(e.clientX, e.clientY);
    }
    dragging.current = false;
    start.current = null;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (locked) return;
    let n = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") n = Math.min(ORDER.length - 1, idx + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") n = Math.max(0, idx - 1);
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = ORDER.length - 1;
    else return;
    e.preventDefault();
    if (n !== idx) onChange(ORDER[n]);
  };

  const valueText =
    pack.id === "free"
      ? "Free: your page only, no emails"
      : `${pack.name}: ${formatINR(pack.price)} for ${pack.outreaches} emails`;

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Pack dial"
      aria-valuemin={0}
      aria-valuemax={ORDER.length - 1}
      aria-valuenow={idx}
      aria-valuetext={valueText}
      aria-disabled={locked || undefined}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
      className={cx("relative mx-auto w-full max-w-[420px] touch-pan-y select-none rounded-2xl", FOCUS_RING, locked ? "cursor-wait" : "cursor-grab active:cursor-grabbing")}
    >
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" aria-hidden>
        {/* Bands, outlined in ink */}
        {ORDER.map((id, i) => {
          const b = BAND[id];
          const lit = i <= idx;
          return (
            <g key={id}>
              <path d={arc(b.from + 1.4, b.to - 1.4, R)} stroke="#171717" strokeWidth={30} fill="none" strokeLinecap="butt" />
              <path d={arc(b.from + 2.1, b.to - 2.1, R)} stroke={lit ? b.fill : "#ffffff"} strokeWidth={25} fill="none" strokeLinecap="butt" />
            </g>
          );
        })}
        {/* Ticks light up to the needle */}
        {TICKS.map((t) => {
          const a = pt(t, R - 24);
          const b = pt(t, R - (t % 18 === 0 ? 36 : 31));
          return (
            <line
              key={t}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#171717"
              strokeWidth={t % 18 === 0 ? 2.5 : 1.5}
              strokeLinecap="round"
              style={{ opacity: t <= needle + 2 ? 1 : 0.2, transition: "opacity 220ms ease-out" }}
            />
          );
        })}
        {/* Stop labels outside the arc */}
        {ORDER.map((id) => {
          const side = id === "free" ? "end" : id === "pro" ? "start" : "middle";
          const p = pt(STOP_ANGLE[id], side === "middle" ? R + 32 : R + 22);
          const on = id === value;
          return (
            <text
              key={id}
              x={p.x}
              y={p.y + 4}
              textAnchor={side}
              className="font-satoshi"
              fontSize={13}
              fontWeight={on ? 800 : 600}
              fill={on ? "#171717" : "#525252"}
              style={{ letterSpacing: "0.06em" }}
            >
              {PACKS.find((p2) => p2.id === id)?.name.toUpperCase()}
            </text>
          );
        })}
        {/* Needle: the invisible circle centres the box on the hub, so it rotates around it */}
        <motion.g initial={false} animate={{ rotate: needle }} transition={SPRING}>
          <circle cx={CX} cy={CY} r={R - 8} fill="none" stroke="none" />
          <path d={`M ${CX - 7} ${CY} L ${CX} ${CY - (R - 22)} L ${CX + 7} ${CY} Z`} fill="#171717" />
          <path d={`M ${CX - 3} ${CY - 8} L ${CX} ${CY - (R - 30)} L ${CX + 3} ${CY - 8} Z`} fill="#8b5cf6" />
        </motion.g>
        <circle cx={CX} cy={CY} r={15} fill="#171717" />
        <circle cx={CX} cy={CY} r={6} fill="#ffffff" />
      </svg>
    </div>
  );
}

export const PACK_ORDER = ORDER;
