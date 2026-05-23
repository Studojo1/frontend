// Typography controls shown above the resume editor. Pure controlled
// component over ResumeFormatting; the parent persists it.
import {
  type ResumeFormatting,
  type FontFamilyChoice,
  DEFAULT_FORMATTING,
} from "~/lib/jrs/formatting";

const FONT_LABELS: Record<FontFamilyChoice, string> = {
  default: "Template default",
  sans: "Sans",
  serif: "Serif",
  mono: "Mono",
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function Toggle({
  label,
  active,
  onClick,
  style,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-pressed={active}
      className={`h-8 w-8 rounded-md border text-sm transition-colors ${
        active
          ? "border-violet-500 bg-violet-100 text-violet-800"
          : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
      }`}
      style={style}
    >
      {label}
    </button>
  );
}

function Stepper({
  label,
  value,
  display,
  onDecrement,
  onIncrement,
  onReset,
}: {
  label: string;
  value: number;
  display: string;
  onDecrement: () => void;
  onIncrement: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
        {label}
      </span>
      <button
        type="button"
        onClick={onDecrement}
        className="h-8 w-8 rounded-md border border-neutral-300 bg-white text-base font-bold text-neutral-700 hover:bg-neutral-50"
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <button
        type="button"
        onClick={onReset}
        className="h-8 min-w-[3rem] rounded-md border border-neutral-300 bg-white px-2 text-xs font-mono text-neutral-700 hover:bg-neutral-50"
        title="Reset"
      >
        {display}
      </button>
      <button
        type="button"
        onClick={onIncrement}
        className="h-8 w-8 rounded-md border border-neutral-300 bg-white text-base font-bold text-neutral-700 hover:bg-neutral-50"
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  );
}

export function FormatToolbar({
  formatting,
  onChange,
}: {
  formatting: ResumeFormatting;
  onChange: (next: ResumeFormatting) => void;
}) {
  const set = (patch: Partial<ResumeFormatting>) =>
    onChange({ ...formatting, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-neutral-200 bg-white px-3 py-2 mb-3">
      <Stepper
        label="Size"
        value={formatting.fontScale}
        display={pct(formatting.fontScale)}
        onDecrement={() =>
          set({ fontScale: clamp(formatting.fontScale - 0.05, 0.8, 1.3) })
        }
        onIncrement={() =>
          set({ fontScale: clamp(formatting.fontScale + 0.05, 0.8, 1.3) })
        }
        onReset={() => set({ fontScale: DEFAULT_FORMATTING.fontScale })}
      />

      <Stepper
        label="Line"
        value={formatting.lineHeight}
        display={formatting.lineHeight.toFixed(2)}
        onDecrement={() =>
          set({ lineHeight: clamp(formatting.lineHeight - 0.05, 1.1, 1.7) })
        }
        onIncrement={() =>
          set({ lineHeight: clamp(formatting.lineHeight + 0.05, 1.1, 1.7) })
        }
        onReset={() => set({ lineHeight: DEFAULT_FORMATTING.lineHeight })}
      />

      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
          Font
        </span>
        <select
          value={formatting.fontFamily}
          onChange={(e) => set({ fontFamily: e.target.value as FontFamilyChoice })}
          className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs text-neutral-700 hover:bg-neutral-50"
        >
          {(Object.keys(FONT_LABELS) as FontFamilyChoice[]).map((k) => (
            <option key={k} value={k}>
              {FONT_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
          Headings
        </span>
        <Toggle
          label="B"
          active={formatting.headingsBold}
          onClick={() => set({ headingsBold: !formatting.headingsBold })}
          style={{ fontWeight: 900 }}
        />
        <Toggle
          label="I"
          active={formatting.headingsItalic}
          onClick={() => set({ headingsItalic: !formatting.headingsItalic })}
          style={{ fontStyle: "italic" }}
        />
        <Toggle
          label="U"
          active={formatting.headingsUnderline}
          onClick={() =>
            set({ headingsUnderline: !formatting.headingsUnderline })
          }
          style={{ textDecoration: "underline" }}
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-neutral-700">
        <input
          type="checkbox"
          checked={formatting.sectionPageBreak}
          onChange={(e) => set({ sectionPageBreak: e.target.checked })}
          className="h-4 w-4 rounded border-neutral-300"
        />
        Section per page
      </label>

      {(formatting.fontScale !== DEFAULT_FORMATTING.fontScale ||
        formatting.lineHeight !== DEFAULT_FORMATTING.lineHeight ||
        formatting.fontFamily !== DEFAULT_FORMATTING.fontFamily ||
        formatting.headingsBold ||
        formatting.headingsItalic ||
        formatting.headingsUnderline ||
        formatting.sectionPageBreak) && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FORMATTING)}
          className="ml-auto text-[11px] font-semibold text-neutral-500 underline hover:text-neutral-800"
        >
          Reset all
        </button>
      )}
    </div>
  );
}
