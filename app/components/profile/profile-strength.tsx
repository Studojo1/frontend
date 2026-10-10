import { Link } from "react-router";
import type { StrengthItem } from "~/lib/talent-profile";

function Ring({ score }: { score: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const tone = score >= 80 ? "#10b981" : score >= 50 ? "#8b5cf6" : "#f59e0b";
  return (
    <svg viewBox="0 0 84 84" className="h-20 w-20 shrink-0 -rotate-90" role="img" aria-label={`Profile strength ${score} of 100`}>
      <circle cx="42" cy="42" r={r} fill="none" stroke="#f5f5f5" strokeWidth="9" />
      <circle
        cx="42"
        cy="42"
        r={r}
        fill="none"
        stroke={tone}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - score / 100)}
        className="transition-[stroke-dashoffset] duration-700"
      />
      <text x="42" y="42" textAnchor="middle" dominantBaseline="central" transform="rotate(90 42 42)" className="fill-neutral-900 font-['Clash_Display'] text-[22px] font-bold">
        {score}
      </text>
    </svg>
  );
}

export function ProfileStrength({
  score,
  items,
  onEdit,
  onAutofill,
  autofilling,
}: {
  score: number;
  items: StrengthItem[];
  onEdit: () => void;
  onAutofill: () => void;
  autofilling: boolean;
}) {
  const todo = items.filter((i) => !i.done).sort((a, b) => b.weight - a.weight);
  const done = items.filter((i) => i.done);
  return (
    <div className="rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
      <div className="flex items-center gap-4">
        <Ring score={score} />
        <div className="min-w-0">
          <h2 className="font-['Clash_Display'] text-lg font-bold text-neutral-900">Profile strength</h2>
          <p className="font-['Satoshi'] text-sm text-neutral-600">
            {todo.length === 0
              ? "Complete. Recruiters see everything we know about you."
              : `${todo.length} ${todo.length === 1 ? "step" : "steps"} left · biggest wins first`}
          </p>
        </div>
      </div>

      {todo.length > 0 && (
        <ul className="mt-4 space-y-2">
          {todo.slice(0, 4).map((it) => (
            <li key={it.key} className="flex items-center gap-3 rounded-xl border-2 border-neutral-200 p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-50 font-['Satoshi'] text-[11px] font-bold text-violet-700">
                +{it.weight}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-['Satoshi'] text-sm font-semibold text-neutral-900">{it.label}</div>
                <div className="font-['Satoshi'] text-xs text-neutral-500">{it.why}</div>
              </div>
              {it.action.kind === "autofill" ? (
                <button
                  type="button"
                  onClick={onAutofill}
                  disabled={autofilling}
                  className="shrink-0 rounded-lg border-2 border-neutral-900 bg-violet-500 px-3 py-1.5 font-['Satoshi'] text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-60"
                >
                  {autofilling ? "Filling…" : "Fill from resume"}
                </button>
              ) : it.action.kind === "edit" ? (
                <button
                  type="button"
                  onClick={onEdit}
                  className="shrink-0 rounded-lg border-2 border-neutral-900 bg-white px-3 py-1.5 font-['Satoshi'] text-xs font-bold text-neutral-900 transition-colors hover:bg-neutral-50"
                >
                  Add
                </button>
              ) : (
                <Link
                  to={it.action.href}
                  className="shrink-0 rounded-lg border-2 border-neutral-900 bg-white px-3 py-1.5 font-['Satoshi'] text-xs font-bold text-neutral-900 transition-colors hover:bg-neutral-50"
                >
                  {it.action.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {done.map((it) => (
            <span key={it.key} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-['Satoshi'] text-[11px] font-semibold text-emerald-700">
              <span aria-hidden="true">✓</span> {it.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
