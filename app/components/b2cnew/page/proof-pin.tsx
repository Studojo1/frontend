// An evidence pin that opens inline (no popover, so it never clips inside a
// frame or a sheet): tap "Proof" and the backing resume lines slide in,
// highlighted like /jernew's proof lens. Group 4.
import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMapPin } from "react-icons/fi";
import { lineById, RESUME_SECTION_LABEL } from "../data";
import { QUICK, useSafeReducedMotion } from "../motion";
import { cx, FOCUS_RING } from "../ui";

/** With children, the pin sits at the end of that row and the lines open below it. */
export function ProofPin({ lineIds, label = "Proof", className, children }: { lineIds: string[]; label?: string; className?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const reduced = useSafeReducedMotion();
  const lines = lineIds.map((x) => lineById(x)).filter((l) => !!l);
  if (!lines.length) return null;
  return (
    <div className={cx(children ? "flex flex-wrap items-start gap-x-2 gap-y-1" : "", className)}>
      {children ? <div className="min-w-0 flex-1">{children}</div> : null}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "inline-flex min-h-8 items-center gap-1 rounded-lg border-2 border-studojo-ink px-2 font-satoshi text-xs font-bold transition-colors",
          open ? "bg-studojo-purple text-white" : "bg-studojo-purple-bg text-studojo-purple-strong",
          FOCUS_RING,
        )}
      >
        <FiMapPin aria-hidden />
        {label}
        <span className="sr-only">: {open ? "hide" : "show"} the resume line</span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={id}
            role="note"
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={QUICK}
            className={cx("overflow-hidden", children ? "basis-full" : "")}
          >
            <div className="mt-2 space-y-1 rounded-xl border-2 border-studojo-ink bg-white p-2.5">
              <p className="font-satoshi text-[11px] font-bold uppercase tracking-wide text-studojo-muted">
                From your resume{RESUME_SECTION_LABEL[lines[0]!.section] ? ` · ${RESUME_SECTION_LABEL[lines[0]!.section]}` : ""}
              </p>
              {lines.map((l) => (
                <p key={l!.id} className={cx("font-satoshi text-sm text-studojo-ink", l!.strong && "font-bold")}>
                  <mark className="rounded bg-studojo-yellow-bg px-1 py-0.5 text-studojo-ink [box-decoration-break:clone]">{l!.text}</mark>
                </p>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
