// The drop zone that sits inside the scanner window before a scan. The file
// is never opened: only its name is kept. Owned by builder A (You).
import { useRef } from "react";
import { motion } from "framer-motion";
import { FiAlertCircle, FiFolder, FiZap } from "react-icons/fi";
import { SPRING_SNAP } from "../../motion";
import { Button, cx } from "../../ui";

const ACCEPT =
  ".pdf,.docx,.doc,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** PDF or Word only. The check is on the name; nothing inside the file is read. */
export function isResumeName(name: string): boolean {
  return /\.(pdf|docx?)$/i.test(name.trim());
}

export function DropZone({
  dragging,
  error,
  reduced,
  onFile,
  onSample,
}: {
  dragging: boolean;
  error: string | null;
  reduced: boolean;
  onFile: (name: string) => void;
  onSample: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div
      className={cx(
        "flex h-full flex-col items-center justify-center gap-4 rounded-[10px] border-2 border-dashed p-4 text-center",
        dragging ? "border-studojo-purple-strong bg-studojo-purple-bg" : "border-studojo-ink/30 bg-white",
      )}
    >
      <PaperIcon lifted={dragging} reduced={reduced} />
      <div>
        <p className="font-clash text-xl font-semibold text-studojo-ink sm:text-2xl">
          {dragging ? "Let go to drop it in" : "Drop your resume here"}
        </p>
        <p className="mt-1 font-satoshi text-sm text-studojo-muted">PDF or DOCX. It never leaves this browser.</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="secondary" size="sm" icon={<FiFolder />} onClick={() => input.current?.click()}>
          Choose a file
        </Button>
        <Button size="sm" icon={<FiZap />} onClick={onSample}>
          Use the sample resume
        </Button>
      </div>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) onFile(file.name);
          e.currentTarget.value = "";
        }}
      />
      {error ? (
        <p role="alert" className="inline-flex items-start gap-1.5 font-satoshi text-sm font-bold text-[#be185d]">
          <FiAlertCircle aria-hidden className="mt-0.5 shrink-0" /> {error}
        </p>
      ) : null}
    </div>
  );
}

/** A paper sheet with a folded corner. It lifts out of its tray while a file hovers. */
function PaperIcon({ lifted, reduced }: { lifted: boolean; reduced: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 96 80" className="h-20 w-24">
      <motion.g
        initial={false}
        animate={reduced ? { y: 0 } : { y: lifted ? -10 : 0, rotate: lifted ? -4 : 0 }}
        transition={SPRING_SNAP}
        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
      >
        <path d="M28 6h30l12 12v46H28z" fill="#fff" stroke="#171717" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M58 6v12h12" fill="#ddd6fe" stroke="#171717" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="34" y="24" width="18" height="4" rx="2" fill="#8b5cf6" />
        <rect x="34" y="33" width="28" height="3" rx="1.5" fill="#171717" opacity="0.25" />
        <rect x="34" y="40" width="24" height="3" rx="1.5" fill="#171717" opacity="0.25" />
        <rect x="34" y="47" width="28" height="3" rx="1.5" fill="#fde68a" />
        <rect x="34" y="54" width="16" height="3" rx="1.5" fill="#171717" opacity="0.25" />
      </motion.g>
      <path d="M14 58h68l-6 18H20z" fill="#faf5fe" stroke="#171717" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M22 64h52" stroke="#171717" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}
