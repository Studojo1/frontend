// Inline editor for the headline and about text on the drafted page.
// Enter saves in both boxes (the page shows the about as one paragraph, so
// there are no line breaks to keep), Escape cancels. Owned by builder B (Your page).
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiX } from "react-icons/fi";
import { useMotionPresets } from "../../motion";
import { Button, cx, FOCUS_RING } from "../../ui";

export interface InlineEditProps {
  label: string;
  value: string;
  multiline?: boolean;
  maxLength: number;
  minLength?: number;
  onSave: (next: string) => void;
  onCancel: () => void;
}

export function InlineEdit({ label, value, multiline, maxLength, minLength = 8, onSave, onCancel }: InlineEditProps) {
  const m = useMotionPresets();
  const id = useId();
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const tooShort = draft.trim().length < minLength;
  const left = maxLength - draft.length;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus({ preventScroll: false });
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  const save = () => {
    if (tooShort) return;
    onSave(draft.replace(/\s+/g, " ").trim());
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
      return;
    }
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      save();
    }
  };

  const field = cx(
    "w-full rounded-xl border-2 border-studojo-ink bg-white px-3 py-2.5 font-satoshi text-base text-studojo-ink shadow-[2px_2px_0_0_#191a23]",
    FOCUS_RING,
  );

  return (
    <motion.div variants={m.pop} initial="hidden" animate="show" className="rounded-2xl border-2 border-dashed border-[#be185d] bg-studojo-pink-bg p-3">
      <label htmlFor={id} className="mb-1.5 block font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-[#be185d]">
        Edit {label.toLowerCase()}
      </label>
      {multiline ? (
        <textarea
          id={id}
          ref={ref}
          data-no-enter
          rows={5}
          value={draft}
          maxLength={maxLength}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          aria-describedby={`${id}-c`}
          className={cx(field, "resize-none leading-relaxed")}
        />
      ) : (
        <input
          id={id}
          ref={ref}
          data-no-enter
          type="text"
          value={draft}
          maxLength={maxLength}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          aria-describedby={`${id}-c`}
          className={field}
        />
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p id={`${id}-c`} className={cx("mr-auto font-satoshi text-sm", tooShort ? "font-bold text-[#be185d]" : "text-studojo-muted")}>
          {tooShort ? `A few more words, please.` : `${left} characters left`}
          <span className="hidden [@media(hover:hover)_and_(pointer:fine)]:inline"> · Enter saves, Esc cancels</span>
        </p>
        <Button variant="ghost" size="sm" icon={<FiX />} onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" icon={<FiCheck />} onClick={save} aria-disabled={tooShort || undefined}>
          Save
        </Button>
      </div>
    </motion.div>
  );
}
