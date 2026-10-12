// The "Reviewed by you" rubber stamp that lands on the page when the student
// approves it. Inked SVG with a little grain, a bouncy landing and an ink
// ring. Reduced motion: a plain fade. Owned by builder B (Your page).
import { useId } from "react";
import { motion } from "framer-motion";
import { useMotionPresets } from "../../motion";

const INK = "#be185d";

/** Spring for the landing: heavier and a touch bouncier than SPRING. */
const LAND = { type: "spring", stiffness: 520, damping: 24, mass: 0.9 } as const;

export function Stamp({ animateIn, onLanded }: { animateIn: boolean; onLanded?: () => void }) {
  const m = useMotionPresets();
  const raw = useId();
  const fid = `ink${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const play = animateIn && !m.reduced;

  return (
    <div className="pointer-events-none relative h-full w-full" role="img" aria-label="Stamp: reviewed by you">
      {play ? (
        <motion.span
          aria-hidden
          className="absolute inset-[-12%] rounded-full border-4"
          style={{ borderColor: INK }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.5, 0], scale: [0.4, 0.9, 1.25] }}
          transition={{ duration: 0.5, delay: 0.16, ease: "easeOut" }}
        />
      ) : null}
      <motion.svg
        aria-hidden
        viewBox="0 0 240 132"
        className="h-full w-full drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]"
        initial={animateIn ? (m.reduced ? { opacity: 0 } : { opacity: 0, scale: 2.3, rotate: -26, y: -30 }) : false}
        animate={{ opacity: 0.96, scale: 1, rotate: -9, y: 0 }}
        transition={m.reduced ? { duration: 0.2 } : LAND}
        onAnimationComplete={onLanded}
      >
        <defs>
          <filter id={fid} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="11" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.45" result="mask" />
            <feComposite in="SourceGraphic" in2="mask" operator="in" />
          </filter>
        </defs>
        <g filter={`url(#${fid})`} fill="none" stroke={INK}>
          <rect x="6" y="6" width="228" height="120" rx="18" strokeWidth="6" />
          <rect x="16" y="16" width="208" height="100" rx="12" strokeWidth="2.5" />
          <g fill={INK} stroke="none">
            <text x="120" y="62" textAnchor="middle" fontFamily="Clash Display, sans-serif" fontWeight="700" fontSize="34" letterSpacing="3">
              REVIEWED
            </text>
            <text x="120" y="94" textAnchor="middle" fontFamily="Satoshi, sans-serif" fontWeight="800" fontSize="18" letterSpacing="6">
              BY YOU
            </text>
            <path d="M34 80 l8 8 l14 -18" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="198" cy="84" r="4" />
            <circle cx="186" cy="84" r="2.5" />
          </g>
        </g>
      </motion.svg>
    </div>
  );
}
