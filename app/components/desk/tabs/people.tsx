// People: every matched hiring manager, ranked, with search and filters.
// Row actions Write, Pass and Details (a drawer with the full match).
import { useEffect, useId, useState } from "react";
import { Link } from "react-router";
import { FiEdit3, FiFilter, FiInfo, FiSearch, FiX } from "react-icons/fi";
import { getStatus, listMatches, type MatchQuery } from "~/lib/desk/api";
import { deskPath, useDeskParams } from "~/lib/desk/nav";
import type { MatchCard, MatchList, Status } from "~/lib/desk/types";
import { NeedsResume } from "./home";
import { Button, Card, clean, cx, Empty, ErrorBox, FilterChip, FOCUS_RING, Loading, Score, Section } from "./kit";
import { useLive, usePageContext } from "./live";
import { ActionNoticeView, useMatchActions } from "./match-actions";
import { Pager } from "./outreach-table";
import { PersonDrawer } from "./people-drawer";
import { MatchStatePill } from "./status";

const PAGE = 25;
const SCORES = [null, 50, 70, 85] as const;
const INPUT = cx("min-h-11 w-full rounded-xl border-2 border-studojo-ink bg-white px-3 font-satoshi text-base text-studojo-ink placeholder:text-studojo-muted", FOCUS_RING);

/** The typed fields; they reach the URL (and the server) 300 ms after the last key. */
interface Typed { q: string; company: string; city: string; title: string }
const NONE: Typed = { q: "", company: "", city: "", title: "" };

export function PeopleTab() {
  const [params, setParams] = useDeskParams();
  const status = useLive<Status>("status", getStatus);
  const fromUrl: Typed = { q: params.q ?? "", company: params.company ?? "", city: params.city ?? "", title: params.title ?? "" };
  const urlSig = JSON.stringify(fromUrl);
  const [typed, setTyped] = useState<Typed>(fromUrl);
  const [strongOnly, setStrongOnly] = useState(false);
  const [hideContacted, setHideContacted] = useState(false);
  const [showFilters, setShowFilters] = useState(!!(params.company || params.city || params.title || params.min_score));
  const acts = useMatchActions();
  const filterId = useId();
  const f = typed;
  const setF = (t: Typed) => setTyped(t);

  // Typing settles into the URL; a change from elsewhere (Back, the agent) flows into the boxes.
  const typedSig = JSON.stringify({ q: typed.q.trim(), company: typed.company.trim(), city: typed.city.trim(), title: typed.title.trim() });
  useEffect(() => {
    if (typedSig === urlSig) return;
    const t = window.setTimeout(() => {
      const v = JSON.parse(typedSig) as Typed;
      setParams({ q: v.q || null, company: v.company || null, city: v.city || null, title: v.title || null });
    }, 300);
    return () => window.clearTimeout(t);
  }, [typedSig]);
  useEffect(() => {
    if (urlSig !== typedSig) setTyped(JSON.parse(urlSig) as Typed);
  }, [urlSig]);

  const query: MatchQuery = {
    q: params.q, company: params.company, city: params.city, title: params.title, min_score: params.min_score,
    strong_only: strongOnly || undefined, exclude_contacted: hideContacted || undefined, limit: PAGE, offset: params.offset,
  };
  const list = useLive<MatchList>("matches", () => listMatches(query), query);
  const open = params.lead;
  usePageContext({ route: "people", query: params.q, lead_id: open });

  const openDetails = (id: number | null) => setParams({ lead: id }, { replace: true });
  const clearAll = () => {
    setTyped(NONE);
    setStrongOnly(false);
    setHideContacted(false);
    setParams({ q: null, company: null, city: null, title: null, min_score: null });
  };

  if (status.data?.state === "needs_resume") return <NeedsResume />;

  const active = [params.company, params.city, params.title].filter(Boolean).length + (params.min_score ? 1 : 0) + (strongOnly ? 1 : 0) + (hideContacted ? 1 : 0);
  const q = typed.q;
  const data = list.data;

  return (
    <Section
      title="People"
      sub={data ? `${data.total} matched hiring managers, best fit first. ${data.strong_total} strong.` : "Matched hiring managers, best fit first."}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <label className="relative min-w-[14rem] flex-1">
          <span className="sr-only">Search people</span>
          <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-studojo-muted" />
          <input type="search" value={q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search name, title or company" className={cx(INPUT, "pl-9")} />
        </label>
        <Button icon={<FiFilter />} aria-expanded={showFilters} aria-controls={filterId} onClick={() => setShowFilters((s) => !s)} className="min-h-11">
          Filters{active ? ` (${active})` : ""}
        </Button>
        {active ? (
          <Button variant="ghost" icon={<FiX />} className="min-h-11" onClick={clearAll}>
            Clear
          </Button>
        ) : null}
      </div>
      {showFilters ? (
        <div id={filterId} className="mb-4 grid gap-3 rounded-2xl border-2 border-studojo-ink/15 bg-studojo-surface-muted p-3 sm:grid-cols-3">
          <TextFilter label="Company" value={f.company} onChange={(v) => setF({ ...f, company: v })} />
          <TextFilter label="City" value={f.city} onChange={(v) => setF({ ...f, city: v })} />
          <TextFilter label="Title contains" value={f.title} onChange={(v) => setF({ ...f, title: v })} />
          <div className="flex flex-wrap items-center gap-2 sm:col-span-3">
            <span className="font-satoshi text-sm font-bold text-studojo-ink">Minimum fit</span>
            {SCORES.map((s) => (
              <FilterChip key={String(s)} selected={params.min_score === s} onClick={() => setParams({ min_score: s })}>
                {s == null ? "Any" : `${s}+`}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-3">
            <FilterChip selected={strongOnly} onClick={() => { setStrongOnly(!strongOnly); setParams({ offset: 0 }); }}>Strong matches only</FilterChip>
            <FilterChip selected={hideContacted} onClick={() => { setHideContacted(!hideContacted); setParams({ offset: 0 }); }}>Hide people I have written to</FilterChip>
          </div>
        </div>
      ) : null}

      <ActionNoticeView notice={acts.notice} onUndo={(id) => void acts.undo(id)} onClose={() => acts.setNotice(null)} />

      {list.error ? (
        <ErrorBox error={list.error} onRetry={list.reload} />
      ) : !data ? (
        <Loading label="Loading people" rows={5} />
      ) : data.items.length === 0 ? (
        <Empty
          title={q || active ? "Nobody matches that search" : "No matches yet"}
          body={q || active ? "Try a shorter search or clear the filters." : "Your matches appear here once your profile is ready."}
          action={q || active ? <Button onClick={clearAll}>Clear search</Button> : null}
        />
      ) : (
        <>
          <ul className="space-y-2">
            {data.items.map((m) => (
              <PersonRow
                key={m.lead_id}
                m={m}
                busy={acts.pending.has(m.lead_id)}
                onWrite={() => void acts.write([m.lead_id])}
                onPass={() => void acts.pass(m.lead_id, m.name)}
                onDetails={() => openDetails(m.lead_id)}
              />
            ))}
          </ul>
          <Pager total={data.total} offset={data.offset} limit={data.limit || PAGE} onPage={(o) => setParams({ offset: o })} />
        </>
      )}

      <PersonDrawer leadId={open} onClose={() => openDetails(null)} acts={acts} />
    </Section>
  );
}

function TextFilter({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block font-satoshi text-sm font-bold text-studojo-ink">{label}</span>
      <input type="text" value={value} maxLength={120} onChange={(e) => onChange(e.target.value)} className={INPUT} />
    </label>
  );
}

function PersonRow({ m, busy, onWrite, onPass, onDetails }: { m: MatchCard; busy: boolean; onWrite: () => void; onPass: () => void; onDetails: () => void }) {
  const name = clean(m.name);
  const canWrite = m.state === "new";
  return (
    <Card as="li" className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Score value={m.score} strong={m.strong} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <button type="button" onClick={onDetails} className={cx("truncate rounded font-satoshi text-base font-bold text-studojo-ink hover:underline", FOCUS_RING)}>
              {name}
            </button>
            <MatchStatePill state={m.state} outreachId={m.outreach_id} />
          </div>
          <p className="truncate font-satoshi text-sm text-studojo-muted">
            {[clean(m.title), clean(m.company), clean(m.city)].filter(Boolean).join(" · ")}
          </p>
          {m.reason ? <p className="mt-1 line-clamp-2 font-satoshi text-sm text-studojo-ink/80">{clean(m.reason)}</p> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:justify-end">
        <Button variant="ghost" icon={<FiInfo />} onClick={onDetails} aria-label={`Details for ${name}`}>
          Details
        </Button>
        {m.state === "new" || m.state === "drafted" ? (
          <Button variant="ghost" icon={<FiX />} disabled={busy} onClick={onPass} aria-label={`Pass on ${name}`}>
            Pass
          </Button>
        ) : null}
        {canWrite ? (
          <Button variant="primary" icon={<FiEdit3 />} busy={busy} onClick={onWrite} aria-label={`Write to ${name}`}>
            Write
          </Button>
        ) : m.outreach_id ? (
          <Link to={deskPath({ to: "outreach", id: m.outreach_id, filter: null })} className={cx("inline-flex min-h-10 items-center rounded-xl border-2 border-studojo-ink bg-white px-3 font-satoshi text-sm font-bold shadow-[3px_3px_0_0_#191a23] hover:bg-studojo-purple-bg", FOCUS_RING)}>
            Open email
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
