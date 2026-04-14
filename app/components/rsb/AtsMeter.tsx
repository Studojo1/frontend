import type { Ats } from "~/lib/rsb/types";

export function AtsMeter({ ats }: { ats: Ats }) {
  const score = Math.max(0, Math.min(100, ats.score || 0));
  const tier = score >= 80 ? "Great" : score >= 60 ? "Good" : score >= 40 ? "Needs work" : "Just started";
  const barColor = score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-violet-500" : score >= 40 ? "bg-amber-400" : "bg-neutral-300";

  return (
    <div className="bg-white border-2 border-neutral-900 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] font-['Satoshi']">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">ATS score</span>
        <span className="text-sm font-bold text-neutral-900">
          {score} <span className="font-normal text-neutral-500">/ 100</span>
        </span>
      </div>
      <div className="w-full h-3 bg-neutral-100 border-2 border-neutral-900 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      <div className="text-xs text-neutral-700 mt-1.5">{tier}</div>

      {ats.missing_keywords && ats.missing_keywords.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">Missing keywords</div>
          <div className="flex flex-wrap gap-1">
            {ats.missing_keywords.slice(0, 6).map((k) => (
              <span
                key={k}
                className="px-2 py-0.5 bg-amber-100 border border-neutral-900 rounded-full text-[11px] text-neutral-800"
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
