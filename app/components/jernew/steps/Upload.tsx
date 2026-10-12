// Step 2: upload. Drop a PDF or DOCX (only its name is kept) or use the
// sample. A scanner beam reads a stylised resume while facts fly into
// labelled slots as evidence chips. Owned by builder A (You).
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiFileText, FiRefreshCw } from "react-icons/fi";
import { STUDENT } from "../data";
import { useFlow, useStepBar } from "../flow";
import { useMotionPresets } from "../motion";
import { Badge, cx, FOCUS_RING, StepHeader } from "../ui";
import { DropZone, isResumeName } from "./you/upload-drop";
import { useScan } from "./you/upload-scan";
import { Scanner } from "./you/upload-scanner";
import { FactSlots } from "./you/upload-slots";

export function Upload() {
  const f = useFlow();
  const m = useMotionPresets();
  const resume = f.data.resume;
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state: scan, start, finish, reset } = useScan({
    reduced: m.reduced,
    initiallyDone: resume.scanned,
    onDone: () => f.update("resume", { scanned: true }),
  });

  const scannerRef = useRef<HTMLDivElement>(null);
  const begin = (source: "sample" | "file", fileName: string | null) => {
    setError(null);
    f.update("resume", { source, fileName, scanned: false });
    start();
    // On phones, bring the scanner and the slots under it into view together.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      scannerRef.current?.scrollIntoView({ block: "start", behavior: m.reduced ? "auto" : "smooth" });
    }
  };

  const takeFile = (name: string) => {
    if (!isResumeName(name)) {
      setError(`That looks like ${extOf(name)}. Use a PDF or DOCX, or the sample.`);
      return;
    }
    begin("file", name);
  };

  const again = () => {
    reset();
    f.update("resume", { source: "none", fileName: null, scanned: false });
  };

  // Drop anywhere on the page. The browser must not open the file instead.
  const takeRef = useRef(takeFile);
  useEffect(() => {
    takeRef.current = takeFile;
  });
  const phaseRef = useRef(scan.phase);
  useEffect(() => {
    phaseRef.current = scan.phase;
  }, [scan.phase]);
  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
    const enter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth += 1;
      if (phaseRef.current === "idle") setDragging(true);
    };
    const over = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const leave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const drop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      setDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file && phaseRef.current !== "scanning") takeRef.current(file.name);
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
    };
  }, []);

  useStepBar(
    scan.phase === "idle"
      ? {
          label: "Use the sample resume",
          onPrimary: () => begin("sample", null),
          hint: "Or drop your own PDF or DOCX. It stays in this browser.",
        }
      : scan.phase === "scanning"
        ? {
            label: "Reading",
            disabled: true,
            disabledHint: "A few more lines. Or skip the animation.",
            secondary: { label: "Skip", onClick: finish },
          }
        : { label: "Continue", hint: `${STUDENT.first}'s facts are in. Six quick questions next.` },
  );

  const fileName = resume.source === "file" ? resume.fileName : null;

  return (
    <div>
      <StepHeader
        title="Drop your resume. It stays in this browser."
        description={<span className="hidden sm:inline">PDF or DOCX, or use the sample. We pull out the facts and pin each one to the line it came from.</span>}
      />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div ref={scannerRef} className="min-w-0 scroll-mt-32">
          <Scanner
            scan={scan}
            reduced={m.reduced}
            dragging={dragging}
            idle={<DropZone dragging={dragging} error={error} reduced={m.reduced} onFile={takeFile} onSample={() => begin("sample", null)} />}
            footerAction={
              scan.phase === "done" ? (
                <FooterButton onClick={again} icon={<FiRefreshCw />}>
                  Different file
                </FooterButton>
              ) : null
            }
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <AnimatePresence initial={false}>
            {fileName && scan.phase !== "idle" ? (
              <motion.div key="file" variants={m.pop} initial="hidden" animate="show" exit={{ opacity: 0 }} className="order-1">
                <div className="flex items-start gap-3 rounded-2xl border-2 border-studojo-ink bg-studojo-yellow-bg p-3 shadow-[2px_2px_0_0_#191a23]">
                  <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-studojo-ink bg-white text-lg">
                    <FiFileText />
                  </span>
                  <p className="min-w-0 font-satoshi text-sm text-studojo-ink">
                    <strong className="break-all">{fileName}</strong> stayed in this browser and was not opened. This preview reads a{" "}
                    <strong>sample resume</strong> instead, so the facts below are {STUDENT.first}&apos;s, not yours.{" "}
                    <Badge kind="sample" />
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <div className="order-2">
            <FactSlots scan={scan} reduced={m.reduced} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FooterButton({ onClick, icon, children }: { onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border-2 border-white/60 px-3 font-satoshi text-sm font-bold text-white hover:bg-white/10",
        FOCUS_RING,
      )}
    >
      <span aria-hidden>{icon}</span>
      {children}
    </button>
  );
}

function extOf(name: string): string {
  const m = /\.([a-z0-9]{1,6})$/i.exec(name);
  return m ? `a .${m[1].toLowerCase()} file` : "a file without a type";
}
