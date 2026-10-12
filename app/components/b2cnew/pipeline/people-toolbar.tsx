// People tab filters: stage chips with counts, saved views, the "Set by
// Senpai · Clear" pill and search. Owned by Group 2.
import { AnimatePresence, motion } from "framer-motion";
import { FiSearch, FiZap } from "react-icons/fi";
import { useState, type ReactNode } from "react";
import { stageMeta } from "../config";
import { STAGE_ORDER } from "../core/derive";
import { useB2C } from "../core/store";
import { QUICK, useSafeReducedMotion } from "../motion";
import type { Stage } from "../types";
import { cx, FOCUS_RING } from "../ui";
import { VIEWS, type PeopleFilter, type ViewId } from "./people-model";

interface Props {
  filter: PeopleFilter;
  setFilter: (f: PeopleFilter) => void;
  counts: Record<Stage, number>;
  total: number;
  viewCounts: Record<ViewId, number>;
  q: string;
  setQ: (q: string) => void;
}

export function PeopleToolbar({ filter, setFilter, counts, total, viewCounts, q, setQ }: Props) {
  const { s, dispatch } = useB2C();
  const reduced = useSafeReducedMotion();
  const senpai = s.peopleFilter;
  // Phones keep search behind an icon; it stays open while it holds a query.
  const [searchOpen, setSearchOpen] = useState(false);
  const searching = searchOpen || q.length > 0;
  const pick = (f: PeopleFilter) => {
    if (senpai) dispatch({ type: "SET_PEOPLE_FILTER", value: null });
    setFilter(f);
  };
  const on = (f: PeopleFilter) =>
    !senpai && f.kind === filter.kind && (f.kind === "all" || (f.kind === "stage" && filter.kind === "stage" && f.stage === filter.stage) || (f.kind === "view" && filter.kind === "view" && f.id === filter.id));
  return (
    <div className="@container space-y-2">
      <AnimatePresence initial={false}>
        {senpai ? (
          <motion.div
            key="senpai"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={QUICK}
            role="status"
            className="flex w-fit max-w-full items-center gap-2 rounded-full border-2 border-studojo-ink bg-studojo-purple py-1 pl-3 pr-1 font-satoshi text-sm font-bold text-white shadow-[2px_2px_0_0_#171717]"
          >
            <FiZap aria-hidden className="shrink-0" />
            <span className="min-w-0 truncate">
              Set by Senpai: {senpai.label} ({senpai.ids.length})
            </span>
            <span aria-hidden>·</span>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_PEOPLE_FILTER", value: null })}
              className={cx("min-h-9 shrink-0 rounded-full bg-white px-3 text-studojo-ink", FOCUS_RING)}
            >
              Clear
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {/* One row: stages, then saved views. It scrolls sideways on phones, wraps on wide screens. */}
      <div className="flex items-start gap-2">
        <div className="-ml-4 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-1 pl-4 [scrollbar-width:none] lg:ml-0 lg:flex-wrap lg:overflow-visible lg:pl-0">
          <div role="group" aria-label="Filter by stage" className="flex shrink-0 gap-1.5 lg:flex-wrap">
            <FilterChip pressed={on({ kind: "all" })} onClick={() => pick({ kind: "all" })} count={total}>
              All
            </FilterChip>
            {STAGE_ORDER.map((st) => {
              const meta = stageMeta(st);
              // Empty stages stay out of the way until something lands there.
              if (counts[st] === 0 && !on({ kind: "stage", stage: st })) return null;
              return (
                <FilterChip key={st} pressed={on({ kind: "stage", stage: st })} onClick={() => pick({ kind: "stage", stage: st })} count={counts[st]} dot={meta.tint} muted={counts[st] === 0}>
                  {meta.label}
                </FilterChip>
              );
            })}
          </div>
          <span aria-hidden className="mx-0.5 h-6 w-0.5 shrink-0 rounded-full bg-studojo-ink/15" />
          <div role="group" aria-label="Saved views" className="flex shrink-0 gap-1.5 pr-4 lg:flex-wrap lg:pr-0">
            {VIEWS.map((vw) => (
              <FilterChip key={vw.id} pressed={on({ kind: "view", id: vw.id })} onClick={() => pick(on({ kind: "view", id: vw.id }) ? { kind: "all" } : { kind: "view", id: vw.id })} count={viewCounts[vw.id]} look="view">
                {vw.label}
              </FilterChip>
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-expanded={searching}
          aria-controls="b2c-people-search"
          aria-label={searching ? "Hide search" : "Search people"}
          onClick={() => setSearchOpen((x) => !x)}
          className={cx("inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-studojo-ink bg-white @2xl:hidden", searching && "bg-studojo-ink text-white", FOCUS_RING)}
        >
          <FiSearch aria-hidden />
        </button>
        <SearchBox q={q} setQ={setQ} className="hidden w-56 shrink-0 @2xl:flex" />
      </div>
      {searching ? <SearchBox id="b2c-people-search" q={q} setQ={setQ} autoFocus className="flex w-full @2xl:hidden" /> : null}
    </div>
  );
}

function SearchBox({ q, setQ, className, id, autoFocus }: { q: string; setQ: (q: string) => void; className?: string; id?: string; autoFocus?: boolean }) {
  return (
    <label id={id} className={cx("relative items-center", className)}>
      <span className="sr-only">Search people</span>
      <FiSearch aria-hidden className="pointer-events-none absolute left-3 text-studojo-muted" />
      <input
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name or company"
        className={cx("min-h-11 w-full rounded-xl border-2 border-studojo-ink bg-white pl-9 pr-3 font-satoshi text-base placeholder:text-studojo-muted/80", FOCUS_RING)}
      />
    </label>
  );
}

function FilterChip({
  pressed,
  onClick,
  count,
  children,
  dot,
  muted,
  look = "stage",
}: {
  pressed: boolean;
  onClick: () => void;
  count: number;
  children: ReactNode;
  dot?: string;
  muted?: boolean;
  look?: "stage" | "view";
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-3 font-satoshi text-sm font-bold transition-colors duration-150",
        pressed ? "border-studojo-ink bg-studojo-ink text-white" : look === "view" ? "border-dashed border-studojo-ink/60 bg-white text-studojo-ink hover:border-solid" : "border-studojo-ink bg-white text-studojo-ink hover:bg-studojo-surface-muted",
        muted && !pressed && "text-studojo-muted",
        FOCUS_RING,
      )}
    >
      {dot ? <span aria-hidden className={cx("h-2.5 w-2.5 rounded-full border border-studojo-ink", dot)} /> : null}
      {children}
      <span className={cx("rounded-full px-1.5 text-[11px] tabular-nums", pressed ? "bg-white/20" : "bg-studojo-ink/10")}>{count}</span>
    </button>
  );
}
