// Quiz card 1: the orbit picker. Role bubbles circle a core; the one you
// pick snaps into the centre and leaves an empty socket on the ring.
// Owned by builder A (You).
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { FiBarChart2, FiCloud, FiCode, FiCompass, FiCpu, FiLayout, FiPenTool, FiTrendingUp } from "react-icons/fi";
import { roleById, ROLES, type RoleOption } from "../../data";
import { SPRING, SPRING_SNAP } from "../../motion";
import type { RoleId } from "../../types";
import { cx, FOCUS_RING, POINTER_FINE } from "../../ui";
import { useNumberKeys, type QuizCardProps } from "./quiz-keys";

const ORBIT: Record<RoleId, { icon: ReactNode; word: string }> = {
  sde: { icon: <FiCode />, word: "Software" },
  frontend: { icon: <FiLayout />, word: "Frontend" },
  data: { icon: <FiBarChart2 />, word: "Data" },
  product: { icon: <FiCompass />, word: "Product" },
  growth: { icon: <FiTrendingUp />, word: "Growth" },
  ml: { icon: <FiCpu />, word: "ML" },
  cloud: { icon: <FiCloud />, word: "DevOps" },
  design: { icon: <FiPenTool />, word: "Design" },
};

const CHIP = 64;

export function RoleOrbit({ q, set, reduced, active }: QuizCardProps) {
  const box = useRef<HTMLDivElement>(null);
  const angle = useMotionValue(0);
  const radius = useMotionValue(140);
  const [hover, setHover] = useState<RoleId | null>(null);
  const [paused, setPaused] = useState(false);
  const [ring, setRing] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const r = Math.max(90, el.clientWidth / 2 - CHIP / 2 - 6);
      radius.set(r);
      setRing(r);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [radius]);

  // A slow orbit (one turn a minute) for the first five seconds, until something
  // is picked or the box is touched. Pauses on hover and focus. The frame loop
  // only runs while the orbit is actually moving.
  const [stopped, setStopped] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setStopped(true), 5000);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    if (reduced || paused || stopped || q.role !== null) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      angle.set((angle.get() + (now - last) * 0.006) % 360);
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, paused, stopped, q.role, angle]);

  useNumberKeys(active, (n) => {
    const r = ROLES[n - 1];
    if (r) set({ role: r.id });
  });

  const chosen = q.role ? roleById(q.role) : null;
  const preview = hover && hover !== q.role ? roleById(hover) : null;

  return (
    <div>
      <div
        ref={box}
        className="relative mx-auto aspect-square w-full max-w-[19rem] sm:max-w-[25rem] lg:max-w-[22rem]"
        onPointerDown={() => setStopped(true)}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => {
          setPaused(false);
          setHover(null);
        }}
        onFocus={() => setPaused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
        }}
      >
        <OrbitRings radius={ring} />
        <Core chosen={chosen} preview={preview} reduced={reduced} />
        <div role="group" aria-label="Roles">
          {ROLES.map((r, i) => (
            <OrbitChip
              key={r.id}
              role={r}
              index={i}
              angle={angle}
              radius={radius}
              selected={q.role === r.id}
              onPick={() => set({ role: r.id })}
              onHover={setHover}
            />
          ))}
        </div>
      </div>
      <p className="mt-2 text-center font-satoshi text-sm text-studojo-muted">
        Tap a bubble
        <span className={POINTER_FINE}>
          , or press <span className="font-bold text-studojo-ink">1 to 8</span>
        </span>
        .
      </p>
    </div>
  );
}

function OrbitChip({
  role,
  index,
  angle,
  radius,
  selected,
  onPick,
  onHover,
}: {
  role: RoleOption;
  index: number;
  angle: MotionValue<number>;
  radius: MotionValue<number>;
  selected: boolean;
  onPick: () => void;
  onHover: (id: RoleId | null) => void;
}) {
  const base = index * (360 / ROLES.length) - 90;
  const x = useTransform([angle, radius], ([a, r]: number[]) => Math.cos(((a + base) * Math.PI) / 180) * r);
  const y = useTransform([angle, radius], ([a, r]: number[]) => Math.sin(((a + base) * Math.PI) / 180) * r);
  const o = ORBIT[role.id];
  return (
    <motion.div className="absolute left-1/2 top-1/2" style={{ x, y, marginLeft: -CHIP / 2, marginTop: -CHIP / 2 }}>
      {/* The socket the bubble leaves behind when it snaps into the core. */}
      <span
        aria-hidden
        className={cx(
          "absolute inset-0 rounded-full border-2 border-dashed border-studojo-purple-strong/50",
          selected ? "opacity-100" : "opacity-0",
        )}
      />
      <motion.button
        type="button"
        aria-pressed={selected}
        aria-label={`${role.label} (${index + 1})`}
        onClick={onPick}
        onPointerEnter={() => onHover(role.id)}
        onFocus={() => onHover(role.id)}
        initial={false}
        animate={
          selected
            ? { x: -x.get(), y: -y.get(), scale: 0.4, opacity: 0 }
            : { x: 0, y: 0, scale: 1, opacity: 1 }
        }
        whileHover={selected ? undefined : { scale: 1.08 }}
        whileTap={selected ? undefined : { scale: 0.94 }}
        transition={SPRING}
        className={cx(
          "relative flex flex-col items-center justify-center gap-0.5 rounded-full border-2 border-studojo-ink bg-white text-studojo-ink shadow-[3px_3px_0_0_#191a23] hover:bg-studojo-purple-bg",
          FOCUS_RING,
        )}
        style={{ width: CHIP, height: CHIP }}
      >
        <span aria-hidden className="text-lg">
          {o.icon}
        </span>
        <span className="font-satoshi text-[11px] font-bold leading-none">{o.word}</span>
        <span
          aria-hidden
          className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-yellow-bg font-satoshi text-[10px] font-bold [@media(hover:hover)_and_(pointer:fine)]:flex"
        >
          {index + 1}
        </span>
      </motion.button>
    </motion.div>
  );
}

function Core({ chosen, preview, reduced }: { chosen: RoleOption | null; preview: RoleOption | null; reduced: boolean }) {
  const show = chosen ?? preview;
  const ghost = !chosen && preview;
  return (
    <div className="absolute left-1/2 top-1/2 h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2">
      <div
        className={cx(
          "flex h-full w-full items-center justify-center rounded-full border-2 border-studojo-ink p-2 text-center",
          chosen ? "bg-studojo-purple-strong text-white shadow-brutal" : "border-dashed bg-white/80 text-studojo-ink",
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={show ? `${show.id}-${chosen ? "on" : "ghost"}` : "empty"}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: chosen ? 1.5 : 0.8 }}
            animate={{ opacity: ghost ? 0.6 : 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={chosen ? { ...SPRING_SNAP, delay: reduced ? 0 : 0.08 } : { duration: 0.15 }}
            className="flex flex-col items-center gap-1"
          >
            {show ? (
              <>
                <span aria-hidden className="text-2xl">
                  {ORBIT[show.id].icon}
                </span>
                <span className="font-clash text-sm font-semibold leading-tight sm:text-base">{show.label}</span>
              </>
            ) : (
              <span className="font-satoshi text-sm font-bold leading-tight text-studojo-muted">Pick a role</span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function OrbitRings({ radius }: { radius: number }) {
  return (
    <div aria-hidden className="absolute inset-0">
      <span className="absolute inset-0 rounded-full border border-studojo-ink/10" />
      {radius > 0 ? (
        <span
          className="absolute left-1/2 top-1/2 rounded-full border-2 border-dashed border-studojo-ink/15"
          style={{ width: radius * 2, height: radius * 2, marginLeft: -radius, marginTop: -radius }}
        />
      ) : null}
      <span className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-studojo-purple/40 bg-studojo-purple-bg" />
    </div>
  );
}
