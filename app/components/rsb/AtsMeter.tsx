import type { Ats } from "~/lib/rsb/types";

export function AtsMeter({ ats }: { ats: Ats }) {
  const score = Math.max(0, Math.min(100, ats.score || 0));
  const tier =
    score >= 80 ? "Great shape" :
    score >= 60 ? "Looking good" :
    score >= 40 ? "Needs more content" :
    "Just getting started";
  const barColor =
    score >= 80 ? "bg-emerald-400" :
    score >= 60 ? "bg-violet-500" :
    score >= 40 ? "bg-amber-400" :
    "bg-neutral-300";
  const tierColor =
    score >= 80 ? "text-emerald-600" :
    score >= 60 ? "text-violet-600" :
    score >= 40 ? "text-amber-600" :
    "text-neutral-400";

  return (
    <div className="bg-white border-2 border-neutral-900 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] font-['Satoshi']">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">ATS score</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-neutral-900">{score}</span>
          <span className="text-xs text-neutral-400">/ 100</span>
        </div>
      </div>
      <div className="w-full h-3 bg-neutral-100 border-2 border-neutral-900 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      <div className={`text-xs font-semibold mt-1.5 ${tierColor}`}>{tier}</div>

      {ats.missing_keywords && ats.missing_keywords.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">Missing keywords</div>
          <div className="flex flex-wrap gap-1">
            {ats.missing_keywords.slice(0, 6).map((k) => (
              <span
                key={k}
                className="px-2 py-0.5 bg-amber-100 border-2 border-neutral-900 rounded-full text-[11px] text-neutral-800"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {ats.suggestions && ats.suggestions.length > 0 && (
        <ul className="mt-3 space-y-1 text-[11px] text-neutral-700">
          {ats.suggestions.slice(0, 3).map((s, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-violet-600">•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
