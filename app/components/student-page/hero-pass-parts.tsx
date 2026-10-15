// Copied from Studojo1/outreach-flow (app/components/profile-ideas/v2/hero-pass-parts.tsx), which
// drafts the page in its onboarding flow; keep the two in step.
// Small pieces for the boarding-pass hero, drawn in the onboarding's style:
// the barcode, the monogram portrait, the jet, the marker highlight, the
// numbered circle and the media query hook.
import { motion } from "framer-motion";
import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { cx } from "./ui";

export const INK = "#191a23";

export function useMedia(q: string, server = false) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(q);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(q).matches,
    () => server,
  );
}

/** The onboarding's highlighter stroke, swiped in from the left once. */
export function Mark({ color, children, reduced, delay = 0.35 }: { color: string; children: ReactNode; reduced: boolean; delay?: number }) {
  return (
    <motion.span
      className="bg-no-repeat [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
      style={{ backgroundImage: `linear-gradient(transparent 60%, ${color} 60%, ${color} 92%, transparent 92%)` }}
      initial={reduced ? false : { backgroundSize: "0% 100%" }}
      animate={{ backgroundSize: "100% 100%" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  );
}

/** (1) (2) (3): the brief's numbered circle. */
export function Num({ n, on = false, className }: { n: number; on?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink font-satoshi text-[10px] font-bold tabular-nums transition-colors",
        on ? "bg-studojo-purple text-white" : "bg-white text-studojo-ink",
        className,
      )}
    >
      {n}
    </span>
  );
}

// ---- Deterministic PDF417-style barcode -------------------------------------

function seed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function rng(a: number) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** One 17-module codeword: 4 bars and 4 spaces, each 1 to 6 wide. */
function codeword(r: () => number) {
  const w = [1, 1, 1, 1, 1, 1, 1, 1];
  let left = 9;
  while (left > 0) {
    const k = Math.floor(r() * 8);
    if (w[k] < 6) { w[k]++; left--; }
  }
  return w;
}
const START = [8, 1, 1, 1, 1, 1, 1, 3];
const STOP = [7, 1, 1, 3, 1, 1, 1, 2, 1];

/** Bars as [x, width] in modules for each row; same slug, same code. */
function pdf417(slug: string, rows: number, cols: number) {
  const r = rng(seed(slug));
  const out: { x: number; w: number }[][] = [];
  let width = 0;
  for (let y = 0; y < rows; y++) {
    const seq = [START, codeword(r), ...Array.from({ length: cols }, () => codeword(r)), codeword(r), STOP];
    const bars: { x: number; w: number }[] = [];
    let x = 0;
    for (const cw of seq) cw.forEach((m, i) => { if (i % 2 === 0) bars.push({ x, w: m }); x += m; });
    width = x;
    out.push(bars);
  }
  return { rows: out, width };
}

export function Barcode({ slug, rows = 9, cols = 2, className = "", rowH = 3 }: { slug: string; rows?: number; cols?: number; className?: string; rowH?: number }) {
  const { rows: rs, width } = useMemo(() => pdf417(slug, rows, cols), [slug, rows, cols]);
  return (
    <svg viewBox={`0 0 ${width} ${rows * rowH}`} preserveAspectRatio="none" className={className} aria-hidden shapeRendering="crispEdges">
      {rs.map((bars, y) => bars.map((b, i) => <rect key={`${y}-${i}`} x={b.x} y={y * rowH} width={b.w} height={rowH} fill={INK} />))}
    </svg>
  );
}

// ---- Portrait -----------------------------------------------------------------

/** Photo-ID tile: the photo when there is one, otherwise a lilac card with a
 * big Clash monogram. Ink border, offset shadow, a jet sticker in the corner. */
export function Portrait({ photo, initials, name, size, sticker = true }: { photo: string | null; initials: string; name: string; size: number; sticker?: boolean }) {
  return (
    <span className="relative inline-block shrink-0 rotate-[-3deg]" style={{ width: size, height: size }}>
      {photo ? (
        <img
          src={photo}
          alt={`Portrait of ${name}`}
          className="h-full w-full rounded-xl border-2 border-studojo-ink object-cover shadow-[3px_3px_0_0_#191a23]"
        />
      ) : (
        <span
          role="img"
          aria-label={`${name}, no photo yet`}
          className="flex h-full w-full items-center justify-center rounded-xl border-2 border-studojo-ink bg-studojo-purple-light shadow-[3px_3px_0_0_#191a23]"
        >
          <span className="font-clash font-semibold leading-none text-studojo-ink" style={{ fontSize: size * 0.42 }}>
            {initials}
          </span>
        </span>
      )}
      {sticker ? (
        <span
          aria-hidden
          className="absolute -right-2.5 -top-2.5 flex h-7 w-7 rotate-[12deg] items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-yellow-bg"
        >
          <Jet size={14} />
        </span>
      ) : null}
    </span>
  );
}

// ---- Jet ------------------------------------------------------------------------

export function Jet({ size = 18, fill = INK }: { size?: number; fill?: string }) {
  // Top-down airliner, nose to the right.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill={fill}
        d="M21.5 12c0-.7-.6-1.2-1.3-1.2h-5.4L9.9 3.4H8.1l2.6 7.4H5.6L3.9 8.6H2.6l1 3.4-1 3.4h1.3l1.7-2.2h5.1l-2.6 7.4h1.8l4.9-7.4h5.4c.7 0 1.3-.5 1.3-1.2z"
      />
    </svg>
  );
}
