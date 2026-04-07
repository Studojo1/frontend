import { useState, useRef, useEffect } from "react";
import { FiCheck } from "react-icons/fi";
import type { MCQOption } from "~/lib/outreach/types";

interface MCQSelectorProps {
  question: string;
  options: MCQOption[];
  allowMultiple: boolean;
  onSubmit: (selected: string[]) => void;
  loading?: boolean;
}

// Vague options that REQUIRE the user to add detail before continuing
const REQUIRES_DETAIL_PATTERN = /^(other|something else|none of the above|no preference|not sure|unsure|flexible|open to|don't know|dont know|n\/a|none|not applicable)/i;

function requiresDetail(opt: MCQOption): boolean {
  return REQUIRES_DETAIL_PATTERN.test(opt.text.trim());
}

export function MCQSelector({ question, options, allowMultiple, onSubmit, loading }: MCQSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [extraText, setExtraText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Which selected options need mandatory detail
  const selectedOpts = selected.map((label) => options.find((o) => o.label === label)).filter(Boolean) as MCQOption[];
  const hasVagueSelected = selectedOpts.some(requiresDetail);

  // Only show the text box when a vague/other option is selected — not for every selection
  const showExtraInput = hasVagueSelected;

  useEffect(() => {
    if (showExtraInput) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showExtraInput]);

  const toggle = (label: string) => {
    if (allowMultiple) {
      setSelected((prev) =>
        prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
      );
    } else {
      setSelected([label]);
      setExtraText("");
    }
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;

    const answers = selected.map((label) => {
      const opt = options.find((o) => o.label === label);
      if (!opt) return label;
      // For vague options, replace label with typed text; for others, append if provided
      if (requiresDetail(opt) && extraText.trim()) return extraText.trim();
      if (!requiresDetail(opt) && extraText.trim()) return `${opt.text} — ${extraText.trim()}`;
      return opt.text;
    });

    onSubmit(answers);
    setSelected([]);
    setExtraText("");
  };

  const canSubmit =
    selected.length > 0 &&
    !loading &&
    // Vague options require the text box to be filled
    (!hasVagueSelected || extraText.trim().length > 0);

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

      {/* Text box appears for every selection — required for vague options, optional otherwise */}
      {showExtraInput && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-150">
          <input
            ref={inputRef}
            value={extraText}
            onChange={(e) => setExtraText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
            placeholder={hasVagueSelected ? "Please describe..." : "Add more detail (optional)"}
            className="w-full h-9 px-3 rounded-xl border-2 border-studojo-purple/40 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple focus:border-studojo-purple placeholder:text-studojo-muted/50"
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