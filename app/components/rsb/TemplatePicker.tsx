import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";

export type TemplateId = "classic" | "modern" | "compact";

type Opt = {
  id: TemplateId;
  name: string;
  tagline: string;
  preview: React.ReactNode;
};

const OPTIONS: Opt[] = [
  {
    id: "classic",
    name: "Classic",
    tagline: "Safest pick for any ATS. Clean uppercase headings.",
    preview: <ClassicPreview />,
  },
  {
    id: "modern",
    name: "Modern",
    tagline: "Violet accent bar, friendly sans, strong section cues.",
    preview: <ModernPreview />,
  },
  {
    id: "compact",
    name: "Compact",
    tagline: "Dense serif layout when you need to fit a lot on one page.",
    preview: <CompactPreview />,
  },
];

export function TemplatePicker({ onPick }: { onPick: (t: TemplateId) => void }) {
  const [selected, setSelected] = useState<TemplateId>("classic");

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-violet-50 via-white to-amber-50 px-4 py-10 font-['Satoshi']">
      <div className="max-w-[1000px] mx-auto">
        <h1 className="font-['Clash_Display'] text-3xl md:text-4xl text-neutral-900 leading-tight mb-2 text-center">
          Pick a resume template.
        </h1>
        <p className="text-neutral-600 mb-8 text-[15px] text-center">
          All three are single-column and ATS-safe. You can change this later.
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {OPTIONS.map((opt) => {
            const on = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected(opt.id)}
                className={`text-left bg-white border-2 border-neutral-900 rounded-[24px] p-4 transition-all ${
                  on
                    ? "shadow-[6px_6px_0px_0px_rgba(124,58,237,1)] -translate-x-[2px] -translate-y-[2px]"
                    : "shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:-translate-x-[1px] hover:-translate-y-[1px]"
                }`}
              >
                <div className="aspect-[1/1.4] bg-neutral-50 border border-neutral-300 rounded-md overflow-hidden mb-3">
                  {opt.preview}
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-['Clash_Display'] text-xl text-neutral-900">{opt.name}</h3>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border-2 border-neutral-900 ${
                      on ? "bg-violet-500 text-neutral-900" : "bg-white text-neutral-500"
                    }`}
                  >
                    {on ? "Selected" : "Choose"}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-1">{opt.tagline}</p>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={() => onPick(selected)}
            className="bg-violet-500 text-neutral-900 font-bold border-2 border-neutral-900 rounded-xl py-3 px-8 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all flex items-center gap-2"
          >
            Continue with {OPTIONS.find((o) => o.id === selected)!.name}
            <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}

function BarLines({ count = 4, maxW = 95 }: { count?: number; maxW?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[3px] bg-neutral-300 rounded mb-[3px]"
          style={{ width: `${maxW - i * 8}%` }}
        />
      ))}
    </>
  );
}

function ClassicPreview() {
  return (
    <div className="p-3 h-full flex flex-col gap-2">
      <div className="h-2 bg-neutral-900 rounded w-2/3" />
      <div className="h-[4px] bg-neutral-500 rounded w-3/4" />
      <div className="h-[1px] bg-neutral-900 mt-1" />
      <div className="h-[5px] bg-neutral-900 w-1/4 rounded" />
      <BarLines />
      <div className="h-[1px] bg-neutral-900 mt-1" />
      <div className="h-[5px] bg-neutral-900 w-1/3 rounded" />
      <BarLines count={3} />
    </div>
  );
}

function ModernPreview() {
  return (
    <div className="p-3 h-full flex flex-col gap-2">
      <div className="h-[9px] bg-neutral-900 rounded w-3/4" />
      <div className="h-[3px] bg-neutral-400 rounded w-2/3" />
      <div className="h-[1px] bg-neutral-300 mt-1" />
      <div className="flex items-center gap-1 mt-1">
        <div className="w-[3px] h-[7px] bg-violet-500 rounded-sm" />
        <div className="h-[5px] bg-violet-700 w-1/4 rounded" />
      </div>
      <BarLines />
      <div className="flex items-center gap-1 mt-1">
        <div className="w-[3px] h-[7px] bg-violet-500 rounded-sm" />
        <div className="h-[5px] bg-violet-700 w-1/3 rounded" />
      </div>
      <BarLines count={3} />
    </div>
  );
}

function CompactPreview() {
  return (
    <div className="p-3 h-full flex flex-col gap-1 items-center">
      <div className="h-[6px] bg-neutral-900 rounded w-1/2 mx-auto" />
      <div className="h-[3px] bg-neutral-500 rounded w-2/3 mx-auto" />
      <div className="h-[1px] bg-neutral-900 w-full mt-1" />
      <div className="h-[4px] bg-neutral-900 w-1/4 self-start rounded" />
      <div className="self-stretch"><BarLines count={5} /></div>
      <div className="h-[1px] bg-neutral-900 w-full mt-1" />
      <div className="h-[4px] bg-neutral-900 w-1/3 self-start rounded" />
      <div className="self-stretch"><BarLines count={4} /></div>
    </div>
  );
}
