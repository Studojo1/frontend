import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import type { MCQOption } from "~/lib/outreach/types";

interface MCQSelectorProps {
  question: string;
  options: MCQOption[];
  allowMultiple: boolean;
  onSubmit: (selected: string[]) => void;
  loading?: boolean;
}

export function MCQSelector({ question, options, allowMultiple, onSubmit, loading }: MCQSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (label: string) => {
    if (allowMultiple) {
      setSelected((prev) =>
        prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
      );
    } else {
      setSelected([label]);
    }
  };

  const handleSubmit = () => {
    if (selected.length > 0) {
      const answers = selected.map((label) => {
        const opt = options.find((o) => o.label === label);
        return opt ? opt.text : label;
      });
      onSubmit(answers);
      setSelected([]);
    }
  };

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
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0 || loading}
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