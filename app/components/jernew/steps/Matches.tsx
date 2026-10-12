// Step 6: matches. A radar sweeps once and company blips pop in by fit, next
// to the list of 12 matched hiring managers (fictional companies, sample
// data). Picking someone sets who the email on the next step goes to.
// Owned by builder C; helpers live in ./people.
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FiChevronDown, FiLock, FiTarget } from "react-icons/fi";
import { useFlow, useStepBar } from "../flow";
import { cityLabel, rankMatches, roleById, SAMPLE_MATCH_COUNT, STAGES } from "../data";
import { useMotionPresets } from "../motion";
import { AnimatedNumber, Badge, Button, Card, LiveRegion, StepHeader } from "../ui";
import { MiniLabel } from "./people/bits";
import { FilterRow, MatchList, passes, type ListedMatch, type MatchFilter } from "./people/match-list";
import { Radar, RadarLegend } from "./people/radar";

const PREVIEW_COUNT = 6;

export function Matches() {
  const f = useFlow();
  const m = useMotionPresets();
  const q = f.data.quiz;
  const ranked = useMemo<ListedMatch[]>(() => rankMatches(q).map((x, rank) => ({ ...x, rank })), [q]);
  const [activeId, setActiveId] = useState<string | null>(() => f.data.people.recipientId);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [filter, setFilter] = useState<MatchFilter>("all");
  const [expanded, setExpanded] = useState(false);
  // The radar sweeps the first time only; coming back shows it settled.
  const [instant] = useState(() => f.data.people.swept);
  const [done, setDone] = useState(instant);
  // The sweep and the count wait until the radar is half on screen (phones scroll to it).
  const radarRef = useRef<HTMLDivElement>(null);
  const inView = useInView(radarRef, { once: true, amount: 0.5 });
  const [count, setCount] = useState(instant ? SAMPLE_MATCH_COUNT : 0);
  useEffect(() => {
    if (inView) setCount(SAMPLE_MATCH_COUNT);
  }, [inView]);

  const shown = useMemo(() => ranked.filter((x) => passes(x, filter, q)), [ranked, filter, q]);
  const visibleIds = useMemo(() => new Set(shown.map((x) => x.id)), [shown]);
  const listed = filter === "all" && !expanded ? shown.slice(0, PREVIEW_COUNT) : shown;
  const top = ranked[0];
  // The picked person, else the best fit the filter still shows, else the best fit overall.
  const target = ranked.find((x) => x.id === activeId) ?? shown[0] ?? top;

  const select = (id: string) => {
    setActiveId((cur) => (cur === id ? null : id));
    // A blip deep in the list should still show its card.
    if (ranked.findIndex((x) => x.id === id) >= PREVIEW_COUNT) setExpanded(true);
    if (!passes(ranked.find((x) => x.id === id) ?? top, filter, q)) setFilter("all");
  };

  const write = (id: string) => {
    f.update("people", { recipientId: id });
    f.next();
  };

  useStepBar({
    label: `Write to ${target.manager.first}`,
    hint: activeId ? `${target.company} picked. Change it any time.` : "Tap anyone to write to them first, or start with your best fit.",
    onPrimary: () => write(target.id),
  });

  const role = roleById(q.role);
  const where = [...q.cities.map(cityLabel), ...(q.remote ? ["Remote"] : [])];
  const stage = q.stage !== null ? STAGES[q.stage]?.label : null;

  return (
    <div>
      <StepHeader
        title="People who can actually hire you"
        description="Hiring managers at companies that fit your answers, best fit first. Tap anyone to see why, then draft the email they would get."
        aside={<Badge kind="sample" />}
      />

      <motion.div variants={m.list} initial="hidden" animate="show" className="space-y-6 sm:space-y-8">
        <motion.div variants={m.item}>
          <Card tone="orange" shadow="md" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-studojo-ink bg-white text-2xl">
                <FiTarget />
              </span>
              <div>
                <p className="flex flex-wrap items-baseline gap-x-2 font-clash text-3xl font-semibold leading-none text-studojo-ink sm:text-4xl">
                  <AnimatedNumber value={count} duration={instant || m.reduced ? 0.01 : 2.4} />
                  <span className="font-satoshi text-base font-bold sm:text-lg">hiring managers fit you</span>
                </p>
                <p className="mt-1.5 flex flex-wrap items-center gap-2 font-satoshi text-sm text-studojo-muted">
                  <Badge kind="sample">Sample number</Badge>
                  <span>12 shown here. The companies are made up for this preview.</span>
                </p>
              </div>
            </div>
            <div className="min-w-0 sm:max-w-[45%]">
              <MiniLabel className="hidden sm:block">Matched on</MiniLabel>
              <p className="truncate font-satoshi text-sm font-medium text-studojo-ink sm:mt-1 sm:whitespace-normal">
                <span className="sm:hidden">Matched on: </span>
                {role.label}
                {where.length ? ` · ${where.join(", ")}` : ""}
                {stage ? ` · ${stage}` : ""}
              </p>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-8">
          <motion.div variants={m.item} className="lg:sticky lg:top-40">
            <div ref={radarRef}>
            <Card shadow="lg" pad="md">
              <div className="mb-3 flex items-center justify-between gap-2">
                <MiniLabel>Fit radar</MiniLabel>
                <LiveRegion
                  visible
                  className="font-satoshi text-xs font-bold text-[#b45309]"
                  message={done ? `12 matches. Best fit: ${top.company}, ${top.fit}.` : "Sweeping for people who fit you"}
                />
              </div>
              <Radar
                matches={ranked}
                visible={visibleIds}
                activeId={hoverId ?? activeId}
                onSelect={select}
                onHover={setHoverId}
                instant={instant}
                armed={inView}
                onSweepDone={() => {
                  if (!f.data.people.swept) f.update("people", { swept: true });
                  setDone(true);
                }}
              />
              <RadarLegend />
            </Card>
            </div>
            <p className="mt-4 flex items-start gap-2 px-1 font-satoshi text-sm text-studojo-muted">
              <FiLock aria-hidden className="mt-0.5 shrink-0 text-studojo-ink" />
              <span>Surnames and emails unlock with a pack. Free keeps this preview and your page.</span>
            </p>
          </motion.div>

          <motion.section variants={m.item} aria-labelledby="matches-list-h" className="min-w-0">
            <h2 id="matches-list-h" className="sr-only">
              Your matches
            </h2>
            <div className="mb-4">
              <FilterRow matches={ranked} filter={filter} quiz={q} onChange={setFilter} />
            </div>
            <MatchList
              matches={listed}
              activeId={activeId}
              hoverId={hoverId}
              onSelect={select}
              onHover={setHoverId}
              onWrite={write}
            />
            {filter === "all" && !expanded && shown.length > PREVIEW_COUNT ? (
              <div className="mt-4 flex justify-center">
                <Button variant="secondary" icon={<FiChevronDown />} onClick={() => setExpanded(true)}>
                  Show all {shown.length}
                </Button>
              </div>
            ) : null}
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
}
