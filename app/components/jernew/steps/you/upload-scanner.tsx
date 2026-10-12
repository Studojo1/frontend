// The scanner device on the upload step: a window the resume sheet feeds
// through while a beam reads it line by line. Facts lift off their line as
// evidence chips (layoutId jn-fact-i) and fly into the slots beside it.
// Owned by builder A (You).
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { animate, AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiLock } from "react-icons/fi";
import { RESUME_FACTS, RESUME_LINES, RESUME_SECTION_LABEL, SCAN_STATUS, type ResumeSection } from "../../data";
import { EASE_OUT, SPRING, SPRING_SNAP, SPRING_SOFT } from "../../motion";
import { cx } from "../../ui";
import { FACT_FOR_LINE, SLOT_STYLE, type ScanState } from "./upload-scan";

const SECTIONS: ResumeSection[] = ["header", "education", "experience", "projects", "skills", "extra"];

export function Scanner({
  scan,
  reduced,
  dragging,
  idle,
  footerAction,
}: {
  scan: ScanState;
  reduced: boolean;
  dragging: boolean;
  /** The drop zone, shown inside the window before a scan. */
  idle: ReactNode;
  /** Small control at the right of the status strip (skip, change file). */
  footerAction?: ReactNode;
}) {
  const windowRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  // State, not a ref: the sheet mounts after the drop zone leaves, and the sweep must wait for it.
  const [feed, setFeed] = useState<HTMLDivElement | null>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const lines = useRef<Record<string, HTMLParagraphElement | null>>({});

  // Move the beam (and feed the sheet when it is taller than the window).
  useEffect(() => {
    const win = windowRef.current;
    const sheet = sheetRef.current;
    const beam = beamRef.current;
    if (!win || !sheet || !feed || !beam) return;
    if (scan.phase !== "scanning" || reduced) {
      const a = animate(feed, { y: 0 }, reduced ? { duration: 0 } : SPRING_SOFT);
      const b = animate(beam, { opacity: 0 }, { duration: 0.2 });
      return () => {
        a.stop();
        b.stop();
      };
    }
    const wh = win.clientHeight;
    const sh = sheet.offsetHeight;
    if (!scan.focus) {
      const a = animate(beam, { y: [0, Math.max(0, Math.min(sh, wh) - 6)], opacity: [0, 1, 1] }, { duration: 0.7, ease: "easeInOut" });
      return () => a.stop();
    }
    const el = lines.current[scan.focus];
    if (!el) return;
    const fy = el.offsetTop + el.offsetHeight / 2;
    const feedY = sh > wh ? Math.min(0, Math.max(wh - sh, wh * 0.42 - fy)) : 0;
    const a = animate(feed, { y: feedY }, SPRING_SOFT);
    const b = animate(beam, { y: fy + feedY - 2, opacity: 1 }, SPRING);
    return () => {
      a.stop();
      b.stop();
    };
  }, [scan.focus, scan.phase, scan.run, reduced, feed]);

  const statusText =
    scan.phase === "idle" ? "Ready. Drop a resume, or use the sample." : SCAN_STATUS[Math.max(0, scan.status)];

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-studojo-ink bg-studojo-purple-bg shadow-brutal-lg">
      <div className="flex items-center gap-2 border-b-2 border-studojo-ink bg-white px-3 py-2">
        <span aria-hidden className="relative flex h-3 w-3">
          <span className={cx("h-3 w-3 rounded-full border-2 border-studojo-ink", scan.phase === "scanning" ? "bg-studojo-green" : scan.phase === "done" ? "bg-studojo-purple" : "bg-white")} />
        </span>
        <span className="font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-ink">Resume scanner</span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-satoshi text-xs font-bold text-studojo-purple-strong">
          <FiLock aria-hidden /> Runs in this browser
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <div
          ref={windowRef}
          className={cx(
            "relative h-[14rem] rounded-xl border-2 border-studojo-ink bg-white sm:h-[22rem] lg:h-[25rem]",
            scan.phase === "done" ? "overflow-y-auto overscroll-contain" : "overflow-hidden",
            dragging && "shadow-[0_0_0_4px_#8b5cf6]",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {scan.phase === "idle" ? (
              <motion.div key="idle" className="absolute inset-0" exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.18 }}>
                {idle}
              </motion.div>
            ) : (
              <motion.div
                key={`sheet-${scan.run}`}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: -28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduced ? { duration: 0.2 } : { ...SPRING, opacity: { duration: 0.2 } }}
              >
                <motion.div ref={setFeed}>
                  <Sheet scan={scan} reduced={reduced} sheetRef={sheetRef} lines={lines} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            ref={beamRef}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-studojo-purple opacity-0 shadow-[0_0_12px_2px_rgba(139,92,246,0.55)]"
          >
            <div className="absolute inset-x-0 bottom-full h-10 bg-gradient-to-b from-transparent to-[#8b5cf6]/20" />
          </div>

          <AnimatePresence>
            {scan.phase === "done" ? <DoneStamp key="stamp" reduced={reduced} /> : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex min-h-12 items-center gap-3 border-t-2 border-studojo-ink bg-studojo-ink px-3 py-2">
        <span aria-hidden className="shrink-0 text-studojo-emerald-300">
          {scan.phase === "done" ? <FiCheck /> : <span className="font-satoshi font-bold">&gt;</span>}
        </span>
        <div role="status" aria-live="polite" className="min-w-0 flex-1 font-satoshi text-sm font-medium text-white">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={statusText}
              className="line-clamp-2 block"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
            >
              {statusText}
            </motion.span>
          </AnimatePresence>
        </div>
        {footerAction}
      </div>
    </div>
  );
}

function Sheet({
  scan,
  reduced,
  sheetRef,
  lines,
}: {
  scan: ScanState;
  reduced: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  lines: RefObject<Record<string, HTMLParagraphElement | null>>;
}) {
  // A finished scan restored from storage shows instantly.
  const instant = scan.phase === "done" && scan.run === 0;
  return (
    <div ref={sheetRef} className="relative px-4 py-4 font-satoshi text-[12px] leading-[1.45] text-studojo-ink sm:px-6 sm:py-5 sm:text-[13px]">
      {SECTIONS.map((section) => {
        const rows = RESUME_LINES.filter((l) => l.section === section);
        return (
          <div key={section} className={section === "header" ? "mb-2 border-b-2 border-dashed border-studojo-ink/20 pb-2" : "mt-2"}>
            {RESUME_SECTION_LABEL[section] ? (
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-studojo-purple-strong">{RESUME_SECTION_LABEL[section]}</p>
            ) : null}
            {rows.map((line) => {
              const idx = RESUME_LINES.indexOf(line);
              const factIdx = FACT_FOR_LINE[line.id];
              const hit = factIdx !== undefined && scan.lifted > factIdx;
              const hl = factIdx !== undefined ? SLOT_STYLE[RESUME_FACTS[factIdx].slot].hl : "transparent";
              const liftedHere = RESUME_FACTS.map((f, i) => ({ f, i })).filter(
                ({ f, i }) => f.lineIds[0] === line.id && i < scan.lifted && i >= scan.landed,
              );
              return (
                <motion.p
                  key={line.id}
                  ref={(el) => {
                    lines.current[line.id] = el;
                  }}
                  className={cx(
                    "relative rounded-[4px] px-1",
                    line.strong && "font-bold",
                    line.id === "r-name" && "font-clash text-[18px] leading-tight sm:text-[20px]",
                  )}
                  initial={instant || reduced ? false : { opacity: 0.3 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduced ? 0 : idx * 0.042, duration: 0.2 }}
                >
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 origin-left rounded-[4px]"
                    style={{ backgroundColor: hl }}
                    initial={false}
                    animate={{ scaleX: hit ? 1 : 0 }}
                    transition={reduced ? { duration: 0 } : { duration: 0.3, ease: EASE_OUT }}
                  />
                  <span className="relative">{line.text}</span>
                  {liftedHere.length ? (
                    <span className="absolute inset-y-0 right-0 flex items-center gap-1">
                      {liftedHere.map(({ f, i }) => (
                        <motion.span
                          key={i}
                          layoutId={`jn-fact-${i}`}
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={SPRING_SNAP}
                          className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-studojo-ink bg-white px-2 py-0.5 text-[11px] font-bold shadow-[2px_2px_0_0_#191a23]"
                        >
                          <span aria-hidden className={cx("h-2 w-2 rounded-full", SLOT_STYLE[f.slot].dot)} />
                          {f.value}
                        </motion.span>
                      ))}
                    </span>
                  ) : null}
                </motion.p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function DoneStamp({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute bottom-4 right-3 z-10"
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.6, rotate: -14 }}
      animate={{ opacity: 1, scale: 1, rotate: -8 }}
      exit={{ opacity: 0 }}
      transition={reduced ? { duration: 0.2 } : SPRING_SOFT}
    >
      <span className="rounded-lg border-[3px] border-studojo-purple-strong bg-white/90 px-2.5 py-1 font-clash text-sm font-semibold uppercase tracking-wider text-studojo-purple-strong">
        Read in your browser
      </span>
    </motion.div>
  );
}
