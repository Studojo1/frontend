// PeopleTab: every named hiring manager in this mission and where they stand.
// Stage chips, saved views, Senpai's filter, the list grouped by stage (or a
// read-only board on desktop) and the person drawer (?p=). Owned by Group 2.
import { useEffect, useMemo, useRef, useState } from "react";
import { FiColumns, FiList, FiSearch, FiUsers, FiZap } from "react-icons/fi";
import { stageMeta } from "../config";
import { peopleIn } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C, useViewport } from "../core/store";
import { useSafeReducedMotion } from "../motion";
import { useHotkeys } from "../shell/keys";
import { Button, cx, EmptyState, Kbd, LiveRegion, POINTER_FINE, Segmented, SimNote } from "../ui";
import { applyFilter, groupByStage, inView, moreContacted, stageCounts, VIEWS, type PeopleFilter, type ViewId } from "./people-model";
import { PeopleBoard } from "./people-board";
import { MoreRow, PersonRow, type RowGlow } from "./people-row";
import { PeopleToolbar } from "./people-toolbar";
import { PersonDrawer } from "./person-drawer";

export function PeopleTab() {
  const { s, dispatch } = useB2C();
  const vp = useViewport();
  const agent = useAgent();
  const reduced = useSafeReducedMotion();
  const [filter, setFilter] = useState<PeopleFilter>({ kind: "all" });
  const [q, setQ] = useState("");
  const [layout, setLayout] = useState<"list" | "board">("list");
  const [showClosed, setShowClosed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const all = useMemo(() => peopleIn(s), [s]);
  const counts = stageCounts(all);
  const viewCounts = Object.fromEntries(VIEWS.map((vw) => [vw.id, all.filter((v) => inView(s, v, vw.id)).length])) as Record<ViewId, number>;
  const list = applyFilter(s, all, filter, q);
  const groups = groupByStage(list);
  const more = moreContacted(s, all);
  const board = layout === "board" && vp !== "phone";
  const order = groups.flatMap((g) => (g.stage === "closed" && !showClosed && filter.kind !== "stage" ? [] : g.people.map((v) => v.p.id)));
  const glowOf = (id: string): RowGlow => (s.highlight?.ids.includes(id) ? s.highlight.kind : null);
  const drawerOpen = !!s.selected && vp !== "phone" && all.some((v) => v.p.id === s.selected);

  // When Senpai lands people here, bring the first one into view.
  const landedKey = s.highlight?.kind === "landed" ? s.highlight.ids.join(",") : "";
  useEffect(() => {
    if (!landedKey) return;
    const first = landedKey.split(",")[0];
    const row = listRef.current?.querySelector<HTMLElement>(`[data-person-row="${first}"]`);
    row?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [landedKey]);

  // J and K move between people (and follow along in an open drawer).
  const move = (d: number) => {
    const rows = Array.from(listRef.current?.querySelectorAll<HTMLElement>("[data-person-row]") ?? []);
    if (!rows.length) return;
    const cur = rows.findIndex((r) => r === document.activeElement || r.dataset.personRow === s.selected);
    const next = rows[Math.max(0, Math.min(rows.length - 1, cur < 0 ? 0 : cur + d))];
    next.focus();
    next.scrollIntoView({ block: "nearest" });
    if (s.selected && next.dataset.personRow) dispatch({ type: "SELECT", id: next.dataset.personRow });
  };
  useHotkeys({ j: () => move(1), k: () => move(-1) }, s.tab === "people");

  const findMore = () => {
    agent.open({ focus: false });
    agent.start("F6");
  };

  if (all.length === 0) {
    return (
      <EmptyState
        icon={<FiUsers />}
        title="No people yet. Ask Senpai to find some."
        body="Senpai finds named hiring managers who fit your target and checks every address before a credit is spent."
        action={<Button icon={<FiZap />} onClick={findMore}>Find people with Senpai</Button>}
      />
    );
  }

  const status = s.peopleFilter ? `${list.length} people, set by Senpai` : `${list.length} of ${all.length} people`;
  return (
    <div className={cx("grid items-start gap-4", drawerOpen && "lg:grid-cols-[minmax(0,1fr)_minmax(19rem,25rem)]")}>
      <div className="min-w-0 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="min-w-0 font-clash text-xl font-semibold">
              {all.length} named people <SimNote kind="sample" className="ml-1 align-middle" />
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              {vp !== "phone" ? (
                <Segmented
                  items={[
                    { id: "list", label: "List", icon: <FiList /> },
                    { id: "board", label: "Board", icon: <FiColumns /> },
                  ]}
                  value={layout}
                  onChange={setLayout}
                  label="People layout"
                  layoutId="b2c-people-layout"
                  idPrefix="b2c-people-layout"
                  size="sm"
                />
              ) : null}
              {s.env === "jan27" ? (
                <Button size="sm" variant="secondary" icon={<FiZap />} onClick={findMore} title="Senpai finds 10 more like Kitebase. No credit used until you approve.">
                  Find 10 more
                </Button>
              ) : null}
            </div>
          </div>
          <p className="font-satoshi text-xs text-studojo-muted sm:text-sm">
            Named hiring managers who fit your target. People and companies are fictional; fit scores are Sample.
            <span className={cx(POINTER_FINE, "ml-2")}>
              <Kbd>J</Kbd> <Kbd>K</Kbd> to move
            </span>
          </p>
        </div>
        <PeopleToolbar filter={filter} setFilter={setFilter} counts={counts} total={all.length} viewCounts={viewCounts} q={q} setQ={setQ} />
        <LiveRegion message={status} />
        <div ref={listRef} className="@container">
          {board ? (
            <PeopleBoard list={list} more={s.peopleFilter || filter.kind !== "all" || q ? 0 : more} glowOf={glowOf} />
          ) : list.length === 0 ? (
            <NoResults
              filter={filter}
              q={q}
              onClear={() => {
                setFilter({ kind: "all" });
                setQ("");
                if (s.peopleFilter) dispatch({ type: "SET_PEOPLE_FILTER", value: null });
              }}
            />
          ) : (
            <div className="space-y-4">
              {groups.map((g) => {
                const meta = stageMeta(g.stage);
                const collapsed = g.stage === "closed" && !showClosed && filter.kind !== "stage" && !s.peopleFilter;
                const showMore = g.stage === "contacted" && filter.kind === "all" && !s.peopleFilter && !q && more > 0;
                return (
                  <section key={g.stage} aria-labelledby={`people-g-${g.stage}`} className="rounded-2xl border-2 border-studojo-ink bg-white p-1.5 shadow-[3px_3px_0_0_#171717]">
                    <div className="flex min-h-10 items-center gap-2 px-2.5">
                      <span aria-hidden className={cx("h-3 w-3 rounded-full border-2 border-studojo-ink", meta.tint)} />
                      <h3 id={`people-g-${g.stage}`} className="font-satoshi text-sm font-bold">
                        {meta.label} <span className="font-medium text-studojo-muted">{g.people.length}</span>
                      </h3>
                      {g.stage === "closed" ? (
                        <button type="button" onClick={() => setShowClosed((x) => !x)} aria-expanded={!collapsed} className="ml-auto min-h-10 rounded-lg px-2 font-satoshi text-sm font-bold underline">
                          {collapsed ? "Show" : "Hide"}
                        </button>
                      ) : null}
                    </div>
                    {collapsed ? null : (
                      <ul className="space-y-0.5">
                        {g.people.map((v) => (
                          <PersonRow key={v.p.id} v={v} glow={glowOf(v.p.id)} selected={s.selected === v.p.id} />
                        ))}
                        {showMore ? <MoreRow n={more} /> : null}
                      </ul>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <PersonDrawer order={order} />
    </div>
  );
}

function NoResults({ filter, q, onClear }: { filter: PeopleFilter; q: string; onClear: () => void }) {
  const { s } = useB2C();
  const view = filter.kind === "view" ? VIEWS.find((v) => v.id === filter.id) : undefined;
  const body = s.peopleFilter
    ? "Nobody left in Senpai's filter. Some may have moved stage."
    : q
      ? `Nobody matches "${q}".`
      : view
        ? view.empty
        : filter.kind === "stage"
          ? `Nobody is at ${stageMeta(filter.stage).label} right now.`
          : "Nobody here.";
  return (
    <EmptyState
      icon={<FiSearch />}
      title="No one here"
      body={body}
      action={
        <Button size="sm" variant="secondary" onClick={onClear}>
          Show everyone
        </Button>
      }
    />
  );
}
