import { useState, useRef, useEffect } from "react";
import { FiCheck, FiSend } from "react-icons/fi";
import type { MCQOption } from "~/lib/outreach/types";

interface MCQSelectorProps {
  question: string;
  options: MCQOption[];
  allowMultiple: boolean;
  onSubmit: (selected: string[]) => void;
  loading?: boolean;
}

// Any option whose text matches these is treated as "other — please specify"
const OTHER_PATTERN = /^(other|something else|none of the above|other.*)/i;

function isOtherOption(opt: MCQOption): boolean {
  return OTHER_PATTERN.test(opt.text.trim());
}

export function MCQSelector({ question, options, allowMultiple, onSubmit, loading }: MCQSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const otherInputRef = useRef<HTMLInputElement>(null);

  const otherOption = options.find(isOtherOption);
  const otherSelected = otherOption ? selected.includes(otherOption.label) : false;

  // Focus the text box as soon as "Other" is selected
  useEffect(() => {
    if (otherSelected) {
      setTimeout(() => otherInputRef.current?.focus(), 50);
    }
  }, [otherSelected]);

  const toggle = (label: string) => {
    if (allowMultiple) {
      setSelected((prev) =>
        prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
      );
    } else {
      setSelected([label]);
      // Clear other text if switching away from "Other"
      const opt = options.find((o) => o.label === label);
      if (opt && !isOtherOption(opt)) setOtherText("");
    }
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;

    const answers = selected.map((label) => {
      const opt = options.find((o) => o.label === label);
      if (!opt) return label;
      // Replace "Other" text with whatever the user typed, if provided
      if (isOtherOption(opt) && otherText.trim()) return otherText.trim();
      return opt.text;
    });

    onSubmit(answers);
    setSelected([]);
    setOtherText("");
  };

  const canSubmit =
    selected.length > 0 &&
    !loading &&
    // If "Other" is selected, require the text box to be filled
    (!otherSelected || otherText.trim().length > 0);

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.label);
          return (
            <button
              key={opt.label}
              onClick={() => toggle(opt.label)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[13px] font-satoshi border-2 transition-all duration-150
                ${isSelected
                  ? "border-studojo-purple bg-studojo-purple-bg text-studojo-purple shadow-sm"
                  : "border-studojo-ink/20 text-studojo-ink hover:border-studojo-ink/40 hover:bg-studojo-surface-muted"
                }`}
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[11px] font-semibold ${
                  isSelected ? "bg-studojo-purple text-white" : "bg-studojo-surface-muted text-studojo-muted"
                }`}
              >
                {isSelected ? <FiCheck className="w-3 h-3" /> : opt.label}
              </span>
              <span className="leading-tight">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Inline text box shown when "Other" is selected */}
      {otherSelected && (
        <div className="flex gap-2 items-center animate-in fade-in slide-in-from-top-1 duration-150">
          <input
            ref={otherInputRef}
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
            placeholder="Please describe..."
            className="flex-1 h-9 px-3 rounded-xl border-2 border-studojo-purple/40 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple focus:border-studojo-purple placeholder:text-studojo-muted/50"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="h-9 px-4 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "..." : "Continue"}
        </button>
        {allowMultiple && (
          <span className="text-xs text-studojo-muted font-satoshi">Select multiple</span>
        )}
      </div>
    </div>
  );
}