// Labelled slots the scanner fills. Each fact lands as an evidence chip that
// keeps the resume line it came from. Owned by builder A (You).
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { FACT_SLOTS, RESUME_FACTS, RESUME_LINES, type FactSlot } from "../../data";
import { SPRING_SNAP } from "../../motion";
import { AnimatedNumber, Badge, cx } from "../../ui";
import { lineNumber, SLOT_STYLE, type ScanState } from "./upload-scan";

/** Display order: short facts pair up, the lists get a full row. */
const GRID_ORDER: FactSlot[] = ["name", "college", "degree", "experience", "skills", "projects"];
const WIDE = new Set<FactSlot>(["skills", "projects"]);

export function FactSlots({ scan, reduced }: { scan: ScanState; reduced: boolean }) {
  const total = RESUME_FACTS.length;
  return (
    <section aria-labelledby="jn-found" className="rounded-2xl border-2 border-studojo-ink bg-white p-3 shadow-brutal sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="jn-found" className="font-clash text-xl font-semibold text-studojo-ink">
          What we found
        </h2>
        <Badge kind="sample" />
        <span className="ml-auto font-satoshi text-sm font-bold text-studojo-ink">
          <AnimatedNumber value={scan.landed} /> of {total} facts
        </span>
      </div>
      <p className="mt-1 hidden font-satoshi text-sm text-studojo-muted sm:block">
        Every fact keeps a pin to the line it came from. You check each one on your page next.
      </p>

      <span aria-hidden className="mt-3 block h-2 overflow-hidden rounded-full border-2 border-studojo-ink bg-studojo-purple-bg">
        <motion.span
          className="block h-full origin-left bg-studojo-purple"
          initial={false}
          animate={{ scaleX: scan.landed / total }}
          transition={reduced ? { duration: 0 } : SPRING_SNAP}
        />
      </span>

      <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
        {GRID_ORDER.map((slot) => {
          const label = FACT_SLOTS.find((s) => s.slot === slot)?.label ?? slot;
          const facts = RESUME_FACTS.map((f, i) => ({ f, i })).filter(({ f }) => f.slot === slot);
          const landed = facts.filter(({ i }) => i < scan.landed);
          const full = landed.length === facts.length;
          const looking = scan.phase === "scanning" && !full && facts.some(({ i }) => i < scan.lifted + 3);
          return (
            <li key={slot} className={cx("min-w-0", WIDE.has(slot) && "col-span-2")}>
              <span className="mb-1 flex items-center gap-1.5 font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-ink">
                <span
                  aria-hidden
                  className={cx(
                    "flex h-4 w-4 items-center justify-center rounded-full border-2 border-studojo-ink",
                    full ? SLOT_STYLE[slot].dot : "bg-white",
                  )}
                >
                  <AnimatePresence initial={false}>
                    {full ? (
                      <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING_SNAP}>
                        <FiCheck className="text-[9px] text-studojo-ink" strokeWidth={4} />
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>
                {label}
              </span>
              <div
                className={cx(
                  "flex min-h-11 min-w-0 flex-wrap items-center gap-1.5 rounded-xl border-2 px-1.5 py-1.5",
                  landed.length ? "border-studojo-ink bg-studojo-surface-muted" : "border-dashed border-studojo-ink/30 bg-white",
                )}
              >
                {landed.map(({ f, i }) => (
                  <EvidenceChip key={i} index={i} value={f.value} lineId={f.lineIds[0]} slot={f.slot} />
                ))}
                {landed.length === 0 ? (
                  <span className="truncate px-1 font-satoshi text-sm text-studojo-muted">
                    {scan.phase === "idle" ? "Waiting" : looking ? <Looking reduced={reduced} /> : "Up next"}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function EvidenceChip({ index, value, lineId, slot }: { index: number; value: string; lineId: string; slot: keyof typeof SLOT_STYLE }) {
  const n = lineNumber(lineId);
  const source = RESUME_LINES[n - 1]?.text ?? "";
  return (
    <motion.span
      layoutId={`jn-fact-${index}`}
      title={`From line ${n}: ${source}`}
      transition={SPRING_SNAP}
      className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-[10px] border-2 border-studojo-ink bg-white py-0.5 pl-2 pr-1 font-satoshi text-[12px] font-bold text-studojo-ink shadow-[2px_2px_0_0_#191a23] sm:text-[13px]"
    >
      <span aria-hidden className={cx("h-2 w-2 shrink-0 rounded-full", SLOT_STYLE[slot].dot)} />
      <span className="min-w-0 leading-tight">{value}</span>
      <span className="shrink-0 whitespace-nowrap rounded-full bg-studojo-ink px-1.5 text-[10px] leading-4 text-white">
        <span className="sr-only">from resume </span>Line {n}
      </span>
    </motion.span>
  );
}

function Looking({ reduced }: { reduced: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      Looking
      {[0, 1, 2].map((d) => (
        <motion.span
          key={d}
          aria-hidden
          className="inline-block h-1 w-1 rounded-full bg-studojo-muted"
          animate={reduced ? undefined : { opacity: [0.2, 1, 0.2] }}
          transition={reduced ? undefined : { duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
        />
      ))}
    </span>
  );
}
