// Mission switcher content (phone mission chip, or the M key). The shell
// wraps it in a Sheet. Shared file: owned by the foundation.
import { FiCheck, FiPlus } from "react-icons/fi";
import { MAX_MISSIONS, MISSION_ACCENT, MISSION_STATUS_LABEL } from "../config";
import { fuel, unseenReplies } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { formatCount } from "../data";
import { cx, FOCUS_RING } from "../ui";
import { targetSummary } from "./mission-header";

export function Switcher() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const full = s.missions.length >= MAX_MISSIONS;
  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {s.missions.map((m) => {
          const on = m.id === s.env;
          const f = fuel(s, m.id);
          const unseen = unseenReplies(s, m.id);
          const accent = MISSION_ACCENT[m.accent];
          return (
            <li key={m.id}>
              <button
                type="button"
                aria-current={on ? "true" : undefined}
                onClick={() => {
                  dispatch({ type: "SET_ENV", env: m.id });
                  dispatch({ type: "SHEET", sheet: null });
                }}
                className={cx("flex min-h-14 w-full items-start gap-3 rounded-2xl border-2 border-studojo-ink p-3 text-left", on ? accent.tint : "bg-white", FOCUS_RING)}
              >
                <span aria-hidden className={cx("mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-studojo-ink", accent.solid)} />
                <span className="min-w-0 flex-1">
                  <span className="block font-satoshi text-base font-bold text-studojo-ink">{m.name}</span>
                  <span className="mt-0.5 block font-satoshi text-xs text-studojo-muted">{targetSummary(m)}</span>
                  <span className="mt-1 block font-satoshi text-xs font-bold text-studojo-ink">
                    {MISSION_STATUS_LABEL[m.status]} · {f.total ? `${formatCount(f.left)} of ${formatCount(f.total)} left` : "No pack yet"}
                    {unseen ? ` · ${unseen} new ${unseen === 1 ? "reply" : "replies"}` : ""}
                  </span>
                </span>
                {on ? <FiCheck aria-hidden className="mt-1 shrink-0 text-lg" /> : null}
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        disabled={full}
        onClick={() => {
          dispatch({ type: "SHEET", sheet: null });
          agent.open({ focus: false });
          agent.start("F14", { choice: "new" });
        }}
        className={cx("flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-studojo-ink/50 font-satoshi text-sm font-bold disabled:opacity-40", FOCUS_RING)}
      >
        <FiPlus aria-hidden /> {full ? "Three missions is the most at once" : "New mission with Senpai"}
      </button>
    </div>
  );
}
