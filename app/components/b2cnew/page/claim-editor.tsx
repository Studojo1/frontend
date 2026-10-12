// Inline editor for a claim or the headline. Save runs Senpai's evidence
// check: backed text is saved, anything the resume cannot back is refused
// with the reason, and the text stays so you can fix it. Group 4.
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle, FiCheck, FiLoader } from "react-icons/fi";
import { QUICK, useSafeReducedMotion } from "../motion";
import { Button, cx, SkillChip } from "../ui";
import { checkClaim, type CheckResult } from "./page-logic";

export interface ClaimEditorProps {
  label: string;
  value: string;
  /** Resume lines that must back the text. Empty means the whole resume. */
  lineIds: string[];
  onSave: (text: string) => void;
  onCancel: () => void;
  /** Asks Senpai to suggest a backed version. */
  onAsk?: () => void;
}

export function ClaimEditor({ label, value, lineIds, onSave, onCancel, onAsk }: ClaimEditorProps) {
  const id = useId();
  const reduced = useSafeReducedMotion();
  const [text, setText] = useState(value);
  const [phase, setPhase] = useState<"idle" | "checking" | "refused">("idle");
  const [result, setResult] = useState<CheckResult | null>(null);
  const timer = useRef<number | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = area.current;
    if (el) {
      el.focus({ preventScroll: true });
      el.setSelectionRange(el.value.length, el.value.length);
    }
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const save = () => {
    if (phase === "checking") return;
    if (text.trim() === value.trim()) {
      onCancel();
      return;
    }
    setPhase("checking");
    setResult(null);
    timer.current = window.setTimeout(() => {
      const r = checkClaim(text, lineIds);
      setResult(r);
      if (r.ok) onSave(text.trim());
      else setPhase("refused");
    }, 650);
  };

  return (
    <div className="rounded-xl border-2 border-studojo-ink bg-white p-3">
      <label htmlFor={id} className="font-satoshi text-[11px] font-bold uppercase tracking-wide text-studojo-muted">
        {label}
      </label>
      <textarea
        id={id}
        ref={area}
        value={text}
        rows={2}
        maxLength={160}
        onChange={(e) => {
          setText(e.target.value);
          if (phase === "refused") setPhase("idle");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            save();
          }
          if (e.key === "Escape") {
            e.stopPropagation();
            onCancel();
          }
        }}
        aria-describedby={`${id}-check`}
        aria-invalid={phase === "refused" || undefined}
        className={cx(
          "mt-1 block w-full resize-none rounded-lg border-2 bg-white px-2.5 py-2 font-satoshi text-base leading-snug text-studojo-ink outline-none focus:ring-4 focus:ring-studojo-purple/30",
          phase === "refused" ? "border-studojo-pink" : "border-studojo-ink",
        )}
      />
      <div id={`${id}-check`} aria-live="polite" className="min-h-0">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "checking" ? (
            <motion.p key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={QUICK} className="mt-2 flex items-center gap-2 font-satoshi text-sm text-studojo-muted">
              <SkillChip skill="coach" />
              <FiLoader aria-hidden className={cx(!reduced && "animate-spin")} /> Checking it against your resume
            </motion.p>
          ) : phase === "refused" && result ? (
            <motion.div
              key="r"
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: -6 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, x: [0, 5, -4, 2, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 rounded-lg border-2 border-studojo-ink bg-studojo-pink-bg px-2.5 py-2"
            >
              <p className="flex items-start gap-2 font-satoshi text-sm text-studojo-ink">
                <FiAlertCircle aria-hidden className="mt-0.5 shrink-0 text-[#be185d]" />
                <span>
                  <b>Senpai kept it off.</b> {result.reason}
                </span>
              </p>
            </motion.div>
          ) : (
            <motion.p key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={QUICK} className="mt-2 flex items-center gap-1.5 font-satoshi text-xs text-studojo-muted">
              <FiCheck aria-hidden /> Senpai checks every word against your resume before it goes on the page.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={save} disabled={phase === "checking"}>
          {phase === "checking" ? "Checking" : "Save"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        {phase === "refused" && onAsk ? (
          <Button size="sm" variant="secondary" onClick={onAsk}>
            Ask Senpai for a backed version
          </Button>
        ) : null}
      </div>
    </div>
  );
}
