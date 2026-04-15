import { FiEdit3, FiFileText, FiArrowRight } from "react-icons/fi";

export type SourceChoice = "scratch" | "existing";

export function SourcePicker({ onPick }: { onPick: (s: SourceChoice) => void }) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-violet-50 via-white to-amber-50 px-4 py-10 font-['Satoshi']">
      <div className="max-w-[820px] mx-auto">
        <h1 className="font-['Clash_Display'] text-3xl md:text-4xl text-neutral-900 leading-tight mb-2 text-center">
          Do you already have a resume?
        </h1>
        <p className="text-neutral-600 mb-10 text-[15px] text-center">
          If you do, upload it on the next screen and we'll mine it along with your chat answers.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          <button
            type="button"
            onClick={() => onPick("scratch")}
            className="group text-left bg-white border-2 border-neutral-900 rounded-[24px] p-6 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0px_0px_rgba(124,58,237,1)] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-500 border-2 border-neutral-900 flex items-center justify-center mb-4">
              <FiEdit3 className="w-6 h-6 text-neutral-900" />
            </div>
            <h3 className="font-['Clash_Display'] text-2xl text-neutral-900 mb-1">Build from scratch</h3>
            <p className="text-sm text-neutral-600 mb-5">
              Answer a few short questions and we'll draft the whole thing for you. No prior resume needed.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-900">
              Start the interview <FiArrowRight />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onPick("existing")}
            className="group text-left bg-white border-2 border-neutral-900 rounded-[24px] p-6 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0px_0px_rgba(124,58,237,1)] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-300 border-2 border-neutral-900 flex items-center justify-center mb-4">
              <FiFileText className="w-6 h-6 text-neutral-900" />
            </div>
            <h3 className="font-['Clash_Display'] text-2xl text-neutral-900 mb-1">I have a resume</h3>
            <p className="text-sm text-neutral-600 mb-5">
              Upload your existing PDF resume plus your LinkedIn. We'll merge everything into an ATS-ready rewrite.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-900">
              Upload and continue <FiArrowRight />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
