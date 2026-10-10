import { useEffect, useRef } from "react";

/**
 * The sensei.studojo.com background, for /start: off-white with a faint dot
 * grid, indigo and lavender glows at the top, film grain, and the seeded
 * blossom trees growing in from both sides with small mono tags on their
 * tips. The tree painter is the site's own (same seed, same palette); the
 * tags speak to students instead of recruiters. The middle is masked clear
 * so the signup card always sits on calm space.
 */

const PINK = ["#D6D1E6", "#C4BCDB", "#B3AACF", "#E4E0EF", "#A99FC7", "#CCC6E0"];
const BARK = "72,70,92";
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
const LABELS: [string, string, number, number][] = [
  ["new role · 2h", "", 0.1, 0.3],
  ["paid · ₹40k", "hl", 0.89, 0.3],
  ["near you", "", 0.16, 0.62],
  ["recruiter replied", "hl", 0.86, 0.64],
  ["hiring now", "", 0.05, 0.8],
  ["uses your SQL", "", 0.95, 0.46],
  ["ghost post · skipped", "faint", 0.8, 0.82],
  ["unpaid · hidden", "faint", 0.2, 0.44],
];

type Op =
  | { k: "s"; x1: number; y1: number; x2: number; y2: number; w: number; t: number }
  | { k: "f"; x: number; y: number; s: number; c: string; rot: number; t: number };

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function build(r: () => number, roots: { x: number; y: number; a: number; len: number; w: number; d?: number; t?: number }[], opt: { depth: number; buds: number }) {
  const ops: Op[] = [];
  const tips: { x: number; y: number; t: number }[] = [];
  let maxT = 0;
  const grow = (x: number, y: number, ang: number, len: number, w: number, depth: number, t: number) => {
    const steps = Math.max(4, Math.round(len / 7));
    let a = ang, px = x, py = y;
    for (let i = 0; i < steps; i++) {
      a += (r() - 0.5) * 0.32;
      const nx = px + Math.cos(a) * 7, ny = py + Math.sin(a) * 7, ww = w * (1 - (i / steps) * 0.45);
      ops.push({ k: "s", x1: px, y1: py, x2: nx, y2: ny, w: ww, t });
      t++; px = nx; py = ny;
      if (depth >= 2 && r() < opt.buds) ops.push({ k: "f", x: px + (r() - 0.5) * 8, y: py + (r() - 0.5) * 8, s: 2.6 + r() * 2.4, c: PINK[(r() * PINK.length) | 0], rot: r() * 6, t });
      if (depth < opt.depth && i > 2 && r() < 0.09 + depth * 0.02) {
        const sd = r() < 0.5 ? -1 : 1;
        grow(px, py, a + sd * (0.35 + r() * 0.55), len * (0.42 + r() * 0.3), ww * 0.62, depth + 1, t);
      }
    }
    if (t > maxT) maxT = t;
    if (depth >= 1) {
      tips.push({ x: px, y: py, t });
      const n = 2 + ((r() * 4) | 0);
      for (let j = 0; j < n; j++) ops.push({ k: "f", x: px + (r() - 0.5) * 22, y: py + (r() - 0.5) * 18, s: 3.4 + r() * 3.8, c: PINK[(r() * PINK.length) | 0], rot: r() * 6, t: t + j * 0.6 });
    }
    if (depth < opt.depth && w > 1.6) {
      grow(px, py, a - 0.3 - r() * 0.35, len * 0.62, w * 0.68, depth + 1, t);
      grow(px, py, a + 0.3 + r() * 0.35, len * 0.58, w * 0.66, depth + 1, t);
    }
  };
  roots.forEach((q) => grow(q.x, q.y, q.a, q.len, q.w, q.d ?? 0, q.t ?? 0));
  ops.sort((a, b) => a.t - b.t);
  return { ops, tips, maxT };
}

export function SenseiBackdrop({ trees = true }: { trees?: boolean } = {}) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const labsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cv = cvRef.current, labs = labsRef.current;
    if (!cv || !labs || !trees) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    const draw = () => {
      cancelAnimationFrame(raf);
      const b = cv.getBoundingClientRect();
      const ctx = cv.getContext("2d")!;
      cv.width = b.width * DPR; cv.height = b.height * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const W = b.width, H = b.height, sc = Math.max(0.6, Math.min(1.25, W / 1300)), phone = W < 640;
      const tree = phone
        ? build(rng(20260928), [{ x: -6, y: H * 0.98, a: -1.25, len: 230, w: 9 }, { x: W + 6, y: H * 0.9, a: Math.PI + 1.25, len: 210, w: 8.5 }], { depth: 4, buds: 0.05 })
        : build(rng(20260928), [
            { x: -30, y: H * 0.9, a: -0.42, len: 330 * sc, w: 20 * sc },
            { x: W + 30, y: H * 0.84, a: Math.PI + 0.46, len: 320 * sc, w: 19 * sc },
            { x: W * 0.2, y: H + 20, a: -1.25, len: 230 * sc, w: 12 * sc, d: 1, t: 12 },
            { x: W * 0.8, y: H + 20, a: -1.95, len: 220 * sc, w: 11 * sc, d: 1, t: 14 },
          ], { depth: 5, buds: 0.05 });

      // Hatched bark pattern, as on the site.
      const p = document.createElement("canvas");
      p.width = 4 * DPR; p.height = 3 * DPR;
      const pc = p.getContext("2d")!;
      pc.fillStyle = `rgba(${BARK},.34)`;
      pc.fillRect(0, 0, p.width, 1.2 * DPR);
      const pat = ctx.createPattern(p, "repeat")!;
      const fine = `rgba(${BARK},.22)`;

      labs.innerHTML = "";
      if (!phone) {
        for (const [text, cls, fx, fy] of LABELS) {
          const tx = fx * W, ty = fy * H;
          let best: { x: number; y: number; t: number } | null = null, bd = 1e9;
          for (const tip of tree.tips) {
            const dd = (tip.x - tx) ** 2 + (tip.y - ty) ** 2;
            if (dd < bd && tip.y > 60) { bd = dd; best = tip; }
          }
          if (!best) continue;
          const el = document.createElement("span");
          el.className = `sb-lab ${cls}`;
          el.textContent = text;
          el.style.left = `${Math.max(70, Math.min(W - 70, best.x))}px`;
          el.style.top = `${best.y - 20}px`;
          el.dataset.t = String(best.t);
          labs.appendChild(el);
        }
      }

      let idx = 0;
      const paint = (T: number) => {
        ctx.lineCap = "round";
        while (idx < tree.ops.length && tree.ops[idx].t <= T) {
          const o = tree.ops[idx++];
          if (o.k === "s") {
            ctx.strokeStyle = o.w > 2.2 ? pat : fine;
            ctx.lineWidth = Math.max(0.8, o.w);
            ctx.beginPath(); ctx.moveTo(o.x1, o.y1); ctx.lineTo(o.x2, o.y2); ctx.stroke();
          } else {
            ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot); ctx.fillStyle = o.c; ctx.globalAlpha = 0.82;
            for (let k = 0; k < 5; k++) { ctx.rotate((Math.PI * 2) / 5); ctx.beginPath(); ctx.ellipse(0, -o.s * 0.55, o.s * 0.42, o.s * 0.58, 0, 0, Math.PI * 2); ctx.fill(); }
            ctx.globalAlpha = 1; ctx.fillStyle = "#7E74A8"; ctx.beginPath(); ctx.arc(0, 0, Math.max(0.8, o.s * 0.18), 0, Math.PI * 2); ctx.fill(); ctx.restore();
          }
        }
        for (const el of Array.from(labs.children) as HTMLElement[]) if (+(el.dataset.t ?? 0) <= T) el.classList.add("on");
        return idx >= tree.ops.length;
      };
      if (reduce) { paint(1e9); return; }
      const st = performance.now();
      const f = (n: number) => {
        const x = Math.min(1, (n - st) / 2800);
        const done = paint(tree.maxT * (1 - (1 - x) ** 2) + (x >= 1 ? 1e9 : 0));
        if (!done) raf = requestAnimationFrame(f);
      };
      raf = requestAnimationFrame(f);
    };

    draw();
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(t); t = setTimeout(draw, 200); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); window.removeEventListener("resize", onResize); };
  }, [trees]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ background: "radial-gradient(rgba(22,22,42,.045) 1px, transparent 1px) 0 0/24px 24px, #FBFBFD" }}>
      <style>{`
        @font-face { font-family: "JetBrains Mono"; src: url(/fonts/sensei/JetBrainsMono-400.woff2) format("woff2"); font-weight: 400; font-display: swap; }
        .sb-lab { position: absolute; transform: translate(-50%, -100%); font: 11px/1.4 "JetBrains Mono", ui-monospace, Menlo, monospace; letter-spacing: .02em; padding: 2px 7px;
          background: rgba(255,255,255,.9); border: 1px solid rgba(22,22,40,.16); color: #585B6C; white-space: nowrap; opacity: 0; transition: opacity .6s ease; }
        .sb-lab.on { opacity: 1 }
        .sb-lab.hl { color: #4148C6; border-color: rgba(91,99,232,.4); background: #F3F3FE }
        .sb-lab.faint { color: #AAADBC; border-style: dashed; background: rgba(251,251,253,.7) }
      `}</style>
      <div className="absolute inset-0" style={{ background: "radial-gradient(900px 620px at 8% -120px, rgba(110,123,242,.22), transparent 65%), radial-gradient(820px 600px at 98% -60px, rgba(178,138,250,.18), transparent 65%)" }} />
      <div className="absolute inset-0" style={{ opacity: 0.35, mixBlendMode: "multiply", backgroundImage: GRAIN }} />
      <canvas
        ref={cvRef}
        className="absolute inset-0 h-full w-full"
        style={{ WebkitMaskImage: "radial-gradient(ellipse 40% 62% at 50% 45%, transparent 55%, #000 92%)", maskImage: "radial-gradient(ellipse 40% 62% at 50% 45%, transparent 55%, #000 92%)" }}
      />
      <div ref={labsRef} className="absolute inset-0" />
    </div>
  );
}
