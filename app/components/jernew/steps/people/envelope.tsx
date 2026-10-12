// The sealed envelope. The wax seal pops, the flap folds back, and the letter
// rises out; the parent then swaps in the full email, which grows out of the
// rising sheet (shared layoutId). Transforms and opacity only.
// Owned by builder C.
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { RankedMatch } from "../../data";
import { SPRING_SNAP, SPRING_SOFT } from "../../motion";
import { cx, FOCUS_RING } from "../../ui";
import { MaskedName } from "./bits";
import { SHEET_LAYOUT_ID } from "./letter";

const OPEN_DELAY_MS = 550;
const RISE_DONE_MS = 760;

export function Envelope({ match, onOpened }: { match: RankedMatch; onOpened: () => void }) {
  const [opening, setOpening] = useState(false);
  const [flapBehind, setFlapBehind] = useState(false);
  const doneRef = useRef(onOpened);
  useEffect(() => {
    doneRef.current = onOpened;
  });

  // Opens on its own shortly after arriving; tapping the seal opens it sooner.
  useEffect(() => {
    const t = window.setTimeout(() => setOpening(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!opening) return;
    const a = window.setTimeout(() => setFlapBehind(true), 170);
    const b = window.setTimeout(() => doneRef.current(), RISE_DONE_MS);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [opening]);

  return (
    <div className="relative mx-auto w-full max-w-[380px] pt-[24%]">
      <div className="relative aspect-[10/7]">
        {/* Back of the envelope */}
        <span aria-hidden className="absolute inset-0 rounded-2xl border-2 border-studojo-ink bg-[#fde68a] shadow-brutal-lg" />

        {/* The letter inside */}
        <motion.div
          layoutId={SHEET_LAYOUT_ID}
          aria-hidden
          className="absolute inset-x-[7%] top-[7%] h-[82%] overflow-hidden border-2 border-studojo-ink bg-white p-[5%]"
          style={{ borderRadius: 12, zIndex: 10 }}
          initial={false}
          animate={{ y: opening ? "-46%" : "0%" }}
          transition={{ ...SPRING_SOFT, delay: opening ? 0.2 : 0 }}
        >
          <span className="block font-satoshi text-sm font-bold text-studojo-ink">Hi {match.manager.first},</span>
          <span className="mt-2 block h-2 w-[92%] rounded-full bg-studojo-ink/15" />
          <span className="mt-1.5 block h-2 w-[80%] rounded-full bg-studojo-ink/15" />
          <span className="mt-1.5 block h-2 w-[86%] rounded-full bg-studojo-purple/30" />
          <span className="mt-1.5 block h-2 w-[64%] rounded-full bg-studojo-ink/15" />
        </motion.div>

        {/* Front pocket */}
        <svg aria-hidden viewBox="0 0 100 70" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" style={{ zIndex: 20 }}>
          <path d="M1 26 L50 50 L99 26 L99 66 Q99 69 96 69 L4 69 Q1 69 1 66 Z" fill="#fef3c6" stroke="#171717" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          <path d="M1 69 L40 44 M99 69 L60 44" stroke="#171717" strokeOpacity="0.25" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Address label */}
        <span
          className="absolute bottom-[9%] left-1/2 flex max-w-[78%] -translate-x-1/2 flex-col items-center rounded-lg border-2 border-studojo-ink bg-white px-3 py-1.5 text-center shadow-[2px_2px_0_0_#191a23]"
          style={{ zIndex: 25 }}
        >
          <span className="font-satoshi text-[10px] font-bold uppercase tracking-[0.14em] text-studojo-muted">To</span>
          <span className="truncate font-clash text-sm font-semibold text-studojo-ink sm:text-base">
            <MaskedName match={match} />, {match.company}
          </span>
        </span>

        {/* Postage stamp */}
        <span
          aria-hidden
          className="absolute bottom-[10%] right-[5%] hidden h-12 w-10 rotate-6 flex-col items-center justify-center rounded-sm border-2 border-dashed border-studojo-ink bg-studojo-purple-bg font-clash text-[10px] font-semibold leading-tight text-studojo-purple-strong min-[400px]:flex"
          style={{ zIndex: 25 }}
        >
          DAY
          <span className="text-base">0</span>
        </span>

        {/* Flap */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[56%]"
          style={{ transformOrigin: "50% 0%", transformPerspective: 900, zIndex: flapBehind ? 5 : 40 }}
          initial={false}
          animate={{ rotateX: opening ? 180 : 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg viewBox="0 0 100 56" preserveAspectRatio="none" className="h-full w-full">
            <path d="M1 4 Q1 1 4 1 L96 1 Q99 1 99 4 L52 54 Q50 56 48 54 Z" fill="#fcd34d" stroke="#171717" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          </svg>
        </motion.div>

        {/* Wax seal: tap to open now */}
        <motion.button
          type="button"
          onClick={() => setOpening(true)}
          disabled={opening}
          aria-label="Open the email"
          className={cx(
            "absolute left-1/2 top-[56%] flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-purple-strong font-clash text-lg font-semibold text-white shadow-[2px_2px_0_0_#191a23]",
            FOCUS_RING,
          )}
          style={{ zIndex: 50 }}
          initial={false}
          animate={opening ? { scale: 0, rotate: -40, opacity: 0 } : { scale: 1, rotate: 0, opacity: 1 }}
          transition={SPRING_SNAP}
        >
          s
        </motion.button>
      </div>
    </div>
  );
}
