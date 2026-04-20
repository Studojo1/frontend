import { Link } from "react-router";
import { FiCheck, FiArrowRight } from "react-icons/fi";

const BULLETS = [
  "Chat-based, so it feels like talking, not form-filling.",
  "ATS-ready the second you export. Real text layer, no gimmicks.",
  "Every word tuned to the role you actually want.",
];

const STATS = [
  { value: "10,000+", label: "students helped" },
  { value: "95%", label: "satisfaction rate" },
  { value: "ATS-ready", label: "on export" },
];

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-violet-50 via-white to-amber-50 flex items-center justify-center px-6 py-16">
      <div className="max-w-3xl w-full">
        {/* Back link */}
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 font-['Satoshi'] text-sm text-neutral-500 hover:text-neutral-800 mb-8 transition-colors"
        >
          ← Back to profile
        </Link>

        {/* Badge */}
        <div className="inline-block px-3 py-1 text-xs font-bold bg-violet-500 text-white border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] rounded-full mb-6 font-['Satoshi'] uppercase tracking-wider">
          AI Resume Builder
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 leading-[1.05] mb-5 font-['Clash_Display']">
          Let&apos;s build a resume<br />that actually lands interviews.
        </h1>
        <p className="text-lg md:text-xl text-neutral-700 mb-8 font-['Satoshi'] max-w-2xl">
          Takes about 10 minutes. You talk, we format. ATS-ready the second you export.
        </p>

        <ul className="space-y-3 mb-10">
          {BULLETS.map((b) => (
            <li key={b} className="flex items-start gap-3 font-['Satoshi'] text-neutral-800">
              <span className="mt-1 flex-shrink-0 w-6 h-6 bg-violet-500 border-2 border-neutral-900 rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
                <FiCheck className="w-3.5 h-3.5 text-white stroke-[3]" />
              </span>
              <span className="text-base md:text-lg">{b}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-7 py-4 bg-violet-500 text-white font-bold text-lg border-2 border-neutral-900 rounded-2xl shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all font-['Satoshi']"
        >
          Start building
          <FiArrowRight className="w-5 h-5" />
        </button>

        {/* Stats */}
        <div className="mt-10 flex flex-wrap gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="font-['Satoshi']">
              <span className="text-xl font-black text-neutral-900">{s.value}</span>
              <span className="ml-1.5 text-sm text-neutral-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
