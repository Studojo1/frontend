import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import classicImg from "~/assets/rsb/templates/classic.png";
import modernImg from "~/assets/rsb/templates/modern.png";
import compactImg from "~/assets/rsb/templates/compact.png";

export type TemplateId = "classic" | "modern" | "compact";

type Opt = {
  id: TemplateId;
  name: string;
  tagline: string;
  image: string;
};

const OPTIONS: Opt[] = [
  {
    id: "classic",
    name: "Classic",
    tagline: "Centered serif name, dot-separated contact line, traditional.",
    image: classicImg,
  },
  {
    id: "modern",
    name: "Modern",
    tagline: "Small label above name, boxed summary, crisp sans-serif.",
    image: modernImg,
  },
  {
    id: "compact",
    name: "Compact",
    tagline: "Left-aligned header, tight spacing, fits more per page.",
    image: compactImg,
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
                <div className="aspect-[1/1.4] bg-white border border-neutral-300 rounded-md overflow-hidden mb-3 flex items-center justify-center">
                  <img
                    src={opt.image}
                    alt={`${opt.name} template preview`}
                    className="w-full h-full object-cover object-top"
                  />
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
