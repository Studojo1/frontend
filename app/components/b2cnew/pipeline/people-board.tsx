// Desktop Board view: one read-only column per stage, no drag. Cards open
// the drawer. Owned by Group 2.
import { motion } from "framer-motion";
import { FiEye } from "react-icons/fi";
import { stageMeta } from "../config";
import { STAGE_ORDER, type PersonView } from "../core/derive";
import { useB2C } from "../core/store";
import { formatCount } from "../data";
import { useSafeReducedMotion } from "../motion";
import { cx, FOCUS_RING } from "../ui";
import type { RowGlow } from "./people-row";

export function PeopleBoard({ list, more, glowOf }: { list: PersonView[]; more: number; glowOf: (id: string) => RowGlow }) {
  const { s, dispatch } = useB2C();
  const reduced = useSafeReducedMotion();
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-3" role="region" aria-label="Board by stage, read only" tabIndex={0}>
      <div className="flex min-w-max gap-3">
        {STAGE_ORDER.map((stage) => {
          const col = list.filter((v) => v.stage === stage).sort((a, b) => b.p.fit - a.p.fit);
          const meta = stageMeta(stage);
          const extra = stage === "contacted" ? more : 0;
          return (
            <section key={stage} aria-label={`${meta.label}, ${col.length}`} className="flex w-56 shrink-0 flex-col rounded-2xl border-2 border-studojo-ink bg-white/80">
              <header className={cx("flex items-center gap-2 rounded-t-[14px] border-b-2 border-studojo-ink px-3 py-2", meta.tint)}>
                <h3 className={cx("font-satoshi text-sm font-bold", meta.text)}>{meta.label}</h3>
                <span className="ml-auto font-satoshi text-xs font-bold tabular-nums">{col.length}</span>
              </header>
              <ul className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto p-2">
                {col.map((v) => {
                  const glow = glowOf(v.p.id);
                  const on = s.selected === v.p.id;
                  return (
                    <motion.li key={v.p.id} layout={reduced ? false : "position"}>
                      <button
                        type="button"
                        data-person-row={v.p.id}
                        onClick={() => dispatch({ type: "SELECT", id: on ? null : v.p.id })}
                        aria-current={on || undefined}
                        className={cx(
                          "relative w-full rounded-xl border-2 border-studojo-ink bg-white p-2 text-left font-satoshi shadow-[2px_2px_0_0_#171717]",
                          on && "bg-studojo-purple-bg",
                          glow === "scanning" && "border-l-[6px] border-l-studojo-purple",
                          glow === "landed" && "ring-4 ring-studojo-purple/50",
                          FOCUS_RING,
                        )}
                      >
                        <span className="block truncate text-sm font-bold">
                          {v.p.first} {v.p.last}
                        </span>
                        <span className="block truncate text-xs text-studojo-muted">{v.p.company}</span>
                        <span className="mt-1 flex items-center gap-2 text-[11px] text-studojo-muted">
                          <span>Fit {v.p.fit}</span>
                          {v.pageOpened ? (
                            <span className="inline-flex items-center gap-1 text-studojo-purple-strong">
                              <FiEye aria-hidden /> Opened
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
                {extra > 0 ? (
                  <li className="rounded-xl border-2 border-dashed border-studojo-ink/30 p-2 font-satoshi text-xs text-studojo-muted">
                    <b className="text-studojo-ink">+ {formatCount(extra)} more</b> (Sample)
                  </li>
                ) : null}
                {col.length === 0 && extra === 0 ? <li className="px-1 py-3 text-center font-satoshi text-xs text-studojo-muted">Nobody here</li> : null}
              </ul>
            </section>
          );
        })}
      </div>
      <p className="mt-2 font-satoshi text-xs text-studojo-muted">Read only. Stages move when emails go, replies land or you log an outcome. Fit scores are Sample.</p>
    </div>
  );
}
