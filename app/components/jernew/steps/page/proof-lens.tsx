// The proof lens: a stylised copy of the resume. When a claim on the page is
// selected, its source lines get a highlighter swipe, everything else dims,
// and a lens tab springs to the first source line. Owned by builder B.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiSearch, FiUser } from "react-icons/fi";
import { RESUME_LINES, RESUME_SECTION_LABEL, type ResumeSection } from "../../data";
import { SPRING, useMotionPresets } from "../../motion";
import { Card, cx } from "../../ui";
import type { ProofTarget } from "./profile-logic";

const SECTIONS: ResumeSection[] = ["header", "education", "experience", "projects", "skills", "extra"];

export function ProofLens({ target }: { target: ProofTarget | undefined }) {
  const m = useMotionPresets();
  const lineRefs = useRef(new Map<string, HTMLDivElement>());
  const [pointerY, setPointerY] = useState<number | null>(null);
  const evidence = target?.evidence ?? [];
  const hasProof = evidence.length > 0;
  const key = evidence.join("|");

  // Measure where the first source line sits, on change and on resize.
  useEffect(() => {
    const measure = () => {
      const first = evidence[0] ? lineRefs.current.get(evidence[0]) : undefined;
      setPointerY(first ? first.offsetTop + first.offsetHeight / 2 : null);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // key captures the evidence list.
  }, [key]);

  return (
    <Card as="aside" tone="white" shadow="md" pad="none" aria-label="Proof lens" className="overflow-hidden">
      <div className="flex items-center gap-3 border-b-2 border-studojo-ink bg-studojo-pink-bg px-4 py-3">
        <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-white">
          <FiSearch />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-[#be185d]">Proof lens</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={target?.id ?? "none"}
              initial={{ opacity: 0, y: m.reduced ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="truncate font-satoshi text-sm font-bold text-studojo-ink"
            >
              {target ? target.text : "Pick any line on your page"}
            </motion.p>
          </AnimatePresence>
        </div>
        <span className="shrink-0 rounded-full border-2 border-studojo-ink bg-white px-2 py-0.5 font-satoshi text-xs font-bold tabular-nums">
          {hasProof ? `${evidence.length} source line${evidence.length === 1 ? "" : "s"}` : "Yours"}
        </span>
      </div>

      <div className="relative bg-[#fffdf7] px-3 py-4 sm:px-4">
        {/* The paper */}
        <div className="relative rounded-lg border-2 border-studojo-ink/80 bg-white py-3 pl-11 pr-3 shadow-[2px_2px_0_0_#191a23]">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1 top-0 z-10"
            initial={false}
            animate={{ y: (pointerY ?? 0) - 16, opacity: hasProof && pointerY !== null ? 1 : 0 }}
            transition={m.reduced ? { duration: 0 } : SPRING}
          >
            <span className="flex h-8 items-center gap-0.5 rounded-r-full rounded-l-md border-2 border-studojo-ink bg-studojo-pink px-1.5 text-white shadow-[2px_2px_0_0_#191a23]">
              <FiSearch className="text-sm text-studojo-ink" />
              <svg viewBox="0 0 8 10" className="h-2.5 w-2 fill-studojo-ink" aria-hidden>
                <path d="M0 0 L8 5 L0 10 Z" />
              </svg>
            </span>
          </motion.div>

          {SECTIONS.map((sec) => {
            const lines = RESUME_LINES.filter((l) => l.section === sec);
            return (
              <div key={sec} className={sec === "header" ? "" : "mt-2.5"}>
                {RESUME_SECTION_LABEL[sec] ? (
                  <p className="mb-0.5 border-b border-studojo-ink/15 pb-0.5 font-satoshi text-[10px] font-bold uppercase tracking-[0.14em] text-studojo-muted">
                    {RESUME_SECTION_LABEL[sec]}
                  </p>
                ) : null}
                {lines.map((l) => {
                  const idx = evidence.indexOf(l.id);
                  const on = idx >= 0;
                  return (
                    <motion.div
                      key={l.id}
                      ref={(el) => {
                        if (el) lineRefs.current.set(l.id, el);
                        else lineRefs.current.delete(l.id);
                      }}
                      className="relative py-0.5"
                      initial={false}
                      animate={{ opacity: !target || on || !hasProof ? 1 : 0.32 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.span
                        aria-hidden
                        className="absolute inset-x-[-4px] inset-y-0 origin-left rounded-[4px] bg-studojo-pink-300/70"
                        initial={false}
                        animate={{ scaleX: on ? 1 : 0, opacity: on ? 1 : 0 }}
                        transition={m.reduced ? { duration: 0 } : { ...SPRING, delay: on ? 0.05 + idx * 0.08 : 0 }}
                      />
                      <span
                        className={cx(
                          "relative block font-satoshi leading-snug text-studojo-ink",
                          l.strong ? "text-[13px] font-bold" : "text-[12px]",
                          l.id === "r-name" && "font-clash text-base font-semibold",
                        )}
                      >
                        {l.text}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}

          <AnimatePresence>
            {target && !hasProof ? (
              <motion.div
                key="yours"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 p-6 text-center"
              >
                <p className="max-w-[17rem] rounded-xl border-2 border-studojo-ink bg-white px-4 py-3 font-satoshi text-sm text-studojo-ink shadow-[2px_2px_0_0_#191a23]">
                  <FiUser aria-hidden className="mx-auto mb-2 text-xl" />
                  <strong>Written by you.</strong> Edited text is yours, so the lens has nothing to point at. That is fine.
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <p className="mt-3 font-satoshi text-sm text-studojo-muted">
          Every line on your page points back to your resume. If it is not on your resume, we do not write it.
        </p>
      </div>
    </Card>
  );
}
