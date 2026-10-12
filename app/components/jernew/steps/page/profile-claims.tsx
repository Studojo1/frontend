// Building blocks of the drafted page: an inspectable claim row with its
// evidence dot, and the inline proof quote phones see under a tapped claim.
// Owned by builder B (Your page).
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiFileText, FiUser } from "react-icons/fi";
import { useMotionPresets } from "../../motion";
import { cx, FOCUS_RING } from "../../ui";
import { evidenceLines, lineWhere, type ProofTarget } from "./profile-logic";

/**
 * Pink dot that says "this has proof". Hollow when the student wrote it.
 * Once the page is approved every dot fills and takes a check, top to bottom.
 */
export function EvidenceDot({ active, hollow, reviewed, order = 0 }: { active: boolean; hollow?: boolean; reviewed?: boolean; order?: number }) {
  const m = useMotionPresets();
  return (
    <span aria-hidden className="relative mt-[0.3em] inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center">
      {active && !hollow ? (
        <motion.span
          className="absolute inset-0 rounded-full bg-studojo-pink"
          initial={{ opacity: 0.5, scale: 1 }}
          {...m.loop({ opacity: [0.5, 0, 0.5], scale: [1, 2.2, 1] }, 1.8)}
        />
      ) : null}
      <span
        className={cx(
          "relative h-3.5 w-3.5 rounded-full border-2",
          reviewed
            ? "border-studojo-ink bg-studojo-pink"
            : hollow
              ? "border-studojo-muted bg-white"
              : active
                ? "border-studojo-ink bg-studojo-pink"
                : "border-[#be185d] bg-studojo-pink-bg",
        )}
      />
      {reviewed ? (
        <motion.span
          className="absolute inset-0 flex items-center justify-center text-[8px] text-studojo-ink"
          initial={m.reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={m.reduced ? { duration: 0.12 } : { type: "spring", stiffness: 520, damping: 30, delay: 0.25 + order * 0.07 }}
        >
          <FiCheck strokeWidth={5} />
        </motion.span>
      ) : null}
    </span>
  );
}

export interface ClaimButtonProps {
  target: ProofTarget;
  selected: boolean;
  onSelect: (id: string) => void;
  children: ReactNode;
  className?: string;
  /** The page is approved: the dot shows a check. order staggers it. */
  reviewed?: boolean;
  order?: number;
}

/**
 * A claim the student can inspect. Mouse hover previews its proof, focus and
 * tap pin it. aria-pressed marks the claim the proof lens shows.
 */
export function ClaimButton({ target, selected, onSelect, children, className, reviewed, order }: ClaimButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(target.id)}
      onFocus={() => onSelect(target.id)}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") onSelect(target.id);
      }}
      className={cx(
        "flex min-h-11 w-full items-start gap-3 rounded-xl border-2 px-2.5 py-2 text-left",
        FOCUS_RING,
        selected ? "border-studojo-ink bg-studojo-pink-bg shadow-[2px_2px_0_0_#191a23]" : "border-transparent hover:border-studojo-ink/25",
        className,
      )}
    >
      <EvidenceDot active={selected} hollow={target.edited} reviewed={reviewed} order={order} />
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}

/** Phones only: the proof drops open right under the tapped claim. */
export function InlineProof({ target, open }: { target: ProofTarget; open: boolean }) {
  const m = useMotionPresets();
  const lines = evidenceLines(target.evidence);
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="proof"
          variants={m.fade}
          initial="hidden"
          animate="show"
          exit="hidden"
          className="lg:hidden"
        >
          <div className="mb-1 ml-5 mt-1 border-l-2 border-dashed border-[#be185d] pl-3">
            {target.edited ? (
              <p className="inline-flex items-center gap-1.5 py-1 font-satoshi text-sm text-studojo-muted">
                <FiUser aria-hidden className="shrink-0 text-studojo-ink" /> Written by you. No resume line needed.
              </p>
            ) : (
              lines.map((l) => (
                <p key={l.id} className="py-1 font-satoshi text-sm leading-snug">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#be185d]">
                    <FiFileText aria-hidden /> {lineWhere(l)}
                  </span>
                  <span className="mt-0.5 block text-studojo-ink">
                    <span className="bg-studojo-pink-300/50 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">{l.text}</span>
                  </span>
                </p>
              ))
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
