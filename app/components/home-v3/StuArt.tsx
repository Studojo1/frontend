import { useEffect, useRef, useState } from "react";

// HOMEPAGE V2: Stu, the logo's own face: the white hand-drawn head with its rough black marker outline, cut at the
// neck like the logo (career-agent public/stu-art, here public/stu/agent), straight on the page with no purple disc.
// ?stu=circle (the root's hv-stu-circle) puts it back on the h1 purple disc, for comparison only (home-v3.css).
// Its size comes from the CSS (--hv-s) of where it sits.
//   cycle: at rest the expressions keep changing (sparkle, curious, grin, happy, laugh), one every 3.5 s; `hold`
//          (hovered or focused) shows the laugh; reduced motion, the laugh only.
//   live:  while she talks, as the in-call Stu does it (career-agent components/voice/Stu.tsx and Orb ink): the
//          mouth open (grin) or closed (happy) with her voice, the head's bob and sway, and three ink speech strokes
//          a side, longer as she speaks up. Drawn every frame through refs; nothing re-renders but the face swap.

export type Face = "laugh" | "sparkle" | "curious" | "grin" | "happy";
export const FACES: readonly Face[] = ["laugh", "sparkle", "curious", "grin", "happy"];
export const faceSrc = (f: Face) => `/stu/agent/head-${f}.png`;
const CYCLE: readonly Face[] = ["sparkle", "curious", "grin", "happy", "laugh"];
const CYCLE_MS = 3500;

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const reducedMotion = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Which head shows while she talks: open past 0.28, as the in-call Stu (Stu.tsx artFor). Pure. */
export const talkingFace = (open: number): Face => (open > 0.28 ? "grin" : "happy");

type Props = {
  face?: Face;
  small?: boolean;
  cycle?: boolean;
  hold?: boolean;
  /** Her level while she talks (useSpoken), or null when she is not talking. */
  live?: { agent: number } | null;
  className?: string;
};

export function StuArt({ face = "laugh", small = false, cycle = false, hold = false, live = null, className }: Props) {
  const [shown, setShown] = useState<Face>(face);
  const rig = useRef<HTMLSpanElement>(null);
  const strokes = useRef<SVGSVGElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  const held = useRef(hold);
  held.current = hold;

  // At rest: the expressions change; held, the laugh.
  useEffect(() => {
    if (live) return;
    setShown(hold ? "laugh" : face);
    if (!cycle || reducedMotion()) return;
    let k = 0;
    const id = window.setInterval(() => {
      if (!held.current) setShown(CYCLE[k++ % CYCLE.length]);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [cycle, face, hold, live]);

  // Talking: the in-call Stu's motion.
  useEffect(() => {
    if (!live) return;
    const reduced = reducedMotion();
    const st = { open: 0, agent: 0, tilt: 0, lift: 0 };
    const t0 = performance.now();
    let raf = 0;
    let last: Face | null = null;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const t = (performance.now() - t0) / 1000;
      const agent = Math.min(1, live.agent * 2.6);
      st.open = lerp(st.open, agent, agent > st.open ? 0.5 : 0.28);
      st.agent += (live.agent - st.agent) * 0.25;
      st.tilt = lerp(st.tilt, reduced ? 0 : Math.sin(t * 2.1) * 3, 0.08);
      st.lift = lerp(st.lift, reduced ? 0 : -st.open * 6 + Math.sin(t * 1.4), 0.25);
      const f = talkingFace(reduced ? 0.35 : st.open);
      if (f !== last) setShown((last = f));
      const S = box.current?.getBoundingClientRect().width || 200;
      if (rig.current) rig.current.style.transform = `translateY(${((st.lift * S) / 300).toFixed(2)}px) rotate(${st.tilt.toFixed(2)}deg)`;
      // the speech strokes, in the art's own units: the head's round part is centred at (50, 42), radius 43
      const lines = strokes.current?.querySelectorAll("line");
      if (!lines) return;
      let i = 0;
      for (const side of [-1, 1]) {
        for (const k of [-1, 0, 1]) {
          const ang = side === 1 ? -Math.PI / 4 + k * 0.28 : (-3 * Math.PI) / 4 - k * 0.28;
          const r0 = 43 * 1.12;
          const len = reduced ? 0 : 43 * (0.08 + st.agent * 0.5) * (k === 0 ? 1 : 0.75);
          const l = lines[i++];
          l.setAttribute("x1", (50 + Math.cos(ang) * r0).toFixed(2));
          l.setAttribute("y1", (42 + Math.sin(ang) * r0).toFixed(2));
          l.setAttribute("x2", (50 + Math.cos(ang) * (r0 + len)).toFixed(2));
          l.setAttribute("y2", (42 + Math.sin(ang) * (r0 + len)).toFixed(2));
          l.style.strokeWidth = String(Math.max(1.6, (3.6 * 124) / (S * 1.24)));
        }
      }
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      if (rig.current) rig.current.style.transform = "";
      strokes.current?.querySelectorAll("line").forEach((l) => ["x1", "y1", "x2", "y2"].forEach((a) => l.removeAttribute(a)));
      setShown(face);
    };
  }, [live, face]);

  const cls = ["hv-stu-art", small ? "hv-sm" : "", live ? "hv-live" : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <span ref={box} className={cls} aria-hidden="true">
      <span className="hv-glow" />
      <span className="hv-disc" />
      <span ref={rig} className="hv-rig">
        <span className="hv-faces">
          {FACES.map((f) => (
            <img
              key={f}
              src={faceSrc(f)}
              alt=""
              width={256}
              height={256}
              draggable={false}
              className={f === shown ? undefined : "hv-off"}
              loading={f === face ? undefined : "lazy"}
              decoding="async"
            />
          ))}
        </span>
      </span>
      <svg ref={strokes} className="hv-strokes" viewBox="-12 -12 124 124" aria-hidden="true">
        <line />
        <line />
        <line />
        <line />
        <line />
        <line />
      </svg>
    </span>
  );
}
