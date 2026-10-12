// The matched hiring managers as a list: filter chips, then one card per
// person with a fit dial and a one-line "why you". This list is the text
// equivalent of the radar. Owned by builder C.
import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowRight, FiBriefcase, FiMapPin } from "react-icons/fi";
import type { QuizAnswers } from "../../types";
import type { RankedMatch } from "../../data";
import { SPRING, useMotionPresets } from "../../motion";
import { Chip, cx, FOCUS_RING, PRESS } from "../../ui";
import { bandOf, bandStyle, FitDial, ManagerAvatar, MaskedName, type StageBand } from "./bits";

export type MatchFilter = "all" | "cities" | StageBand;

/** A ranked match plus its position in the full ranking (0 = best fit). */
export type ListedMatch = RankedMatch & { rank: number };

export function filterLabel(id: MatchFilter): string {
  return { all: "All", cities: "Your cities", early: "Early startups", scale: "Scale-ups", large: "Bigger teams" }[id];
}

export function passes(m: RankedMatch, filter: MatchFilter, q: QuizAnswers): boolean {
  if (filter === "all") return true;
  if (filter === "cities") return m.city === "remote" ? q.remote : q.cities.includes(m.city);
  return bandOf(m.stage) === filter;
}

export function FilterRow({
  matches,
  filter,
  quiz,
  onChange,
}: {
  matches: RankedMatch[];
  filter: MatchFilter;
  quiz: QuizAnswers;
  onChange: (f: MatchFilter) => void;
}) {
  const ids: MatchFilter[] = ["all", "cities", "early", "scale", "large"];
  return (
    <div role="group" aria-label="Filter matches" className="-mx-1 flex flex-wrap gap-2 px-1">
      {ids.map((id) => {
        const n = matches.filter((m) => passes(m, id, quiz)).length;
        if (n === 0 && id !== "all") return null;
        return (
          <Chip key={id} selected={filter === id} tone="people" onClick={() => onChange(id)}>
            {filterLabel(id)}
            <span className="ml-1.5 tabular-nums text-studojo-muted">{n}</span>
          </Chip>
        );
      })}
    </div>
  );
}

export interface MatchListProps {
  matches: ListedMatch[];
  activeId: string | null;
  hoverId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onWrite: (id: string) => void;
}

export function MatchList({ matches, activeId, hoverId, onSelect, onHover, onWrite }: MatchListProps) {
  const m = useMotionPresets();
  return (
    <motion.ul layout={!m.reduced} className="space-y-3" aria-label="Matched hiring managers, best fit first">
      <AnimatePresence initial={false} mode="popLayout">
        {matches.map((x) => (
          <motion.li
            key={x.id}
            layout={!m.reduced}
            initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={m.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={m.reduced ? { duration: 0.15 } : SPRING}
          >
            <MatchCard
              match={x}
              rank={x.rank}
              active={x.id === activeId}
              hovered={x.id === hoverId}
              onSelect={() => onSelect(x.id)}
              onHover={(on) => onHover(on ? x.id : null)}
              onWrite={() => onWrite(x.id)}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}

function MatchCard({
  match,
  rank,
  active,
  hovered,
  onSelect,
  onHover,
  onWrite,
}: {
  match: ListedMatch;
  rank: number;
  active: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: (on: boolean) => void;
  onWrite: () => void;
}) {
  const m = useMotionPresets();
  const s = bandStyle(match.stage);
  const ref = useRef<HTMLDivElement>(null);

  // When a blip on the radar selects this card, bring it into view. Not on
  // mount: coming back to the step must land at the heading, not mid-list.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!active || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    if (r.top < 120 || r.bottom > window.innerHeight - 140) {
      ref.current.scrollIntoView({ block: "center", behavior: m.reduced ? "auto" : "smooth" });
    }
  }, [active]);

  return (
    <div
      ref={ref}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      className={cx(
        "rounded-2xl border-2 border-studojo-ink transition-[box-shadow,background-color] duration-200",
        active ? "bg-studojo-orange-bg shadow-brutal" : "bg-white shadow-[2px_2px_0_0_#191a23]",
        hovered && !active && "ring-4 ring-studojo-orange/40",
      )}
    >
      <button
        type="button"
        aria-pressed={active}
        onClick={onSelect}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        className={cx("block w-full rounded-2xl p-3 text-left sm:p-4", FOCUS_RING)}
      >
        <span className="flex items-start gap-3">
          <ManagerAvatar match={match} />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-baseline gap-x-2">
              <MaskedName match={match} className="font-satoshi text-base font-bold text-studojo-ink" />
              <span className="font-satoshi text-sm text-studojo-muted">{match.manager.title}</span>
            </span>
            <span className="mt-0.5 block font-satoshi text-sm text-studojo-ink">
              <strong className="font-bold">{match.company}</strong>
              <span className="text-studojo-muted">, {match.hook}</span>
            </span>
          </span>
          <span className="flex flex-col items-center gap-0.5">
            <FitDial fit={match.fit} size={46} />
            <span className="font-satoshi text-[10px] font-bold uppercase tracking-wider text-studojo-muted">Fit</span>
          </span>
        </span>

        <span className="mt-3 flex flex-wrap gap-1.5">
          {rank < 3 ? (
            <Tag className="bg-studojo-ink text-white">#{rank + 1} fit</Tag>
          ) : null}
          <Tag className="bg-white text-studojo-ink">
            <FiMapPin aria-hidden /> {match.cityLabel}
          </Tag>
          <Tag className={cx(s.tint, s.text)}>{match.stageLabel}</Tag>
          <Tag className="bg-white text-studojo-ink">
            <FiBriefcase aria-hidden /> {match.hiringFor}
          </Tag>
        </span>

        <span className="mt-3 flex gap-2 rounded-xl border-2 border-dashed border-studojo-ink/30 bg-white/70 px-3 py-2 font-satoshi text-sm leading-snug text-studojo-ink">
          <span className="shrink-0 font-bold text-[#b45309]">Why you:</span>
          <span>{match.why}</span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {active ? (
          <motion.div
            initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={m.reduced ? { duration: 0.15 } : SPRING}
            className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-studojo-ink/15 px-3 pb-3 pt-2 sm:px-4"
          >
            <span className="font-satoshi text-sm text-studojo-muted">See the email {match.manager.first} would get.</span>
            <button
              type="button"
              onClick={onWrite}
              className={cx(
                "inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-studojo-ink bg-white px-4 font-satoshi text-sm font-bold text-studojo-ink shadow-[2px_2px_0_0_#191a23] hover:bg-studojo-purple-bg active:shadow-none",
                PRESS,
                FOCUS_RING,
              )}
            >
              Draft my email to {match.manager.first} <FiArrowRight aria-hidden />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border-2 border-studojo-ink px-2 py-0.5 font-satoshi text-xs font-bold",
        className,
      )}
    >
      {children}
    </span>
  );
}
