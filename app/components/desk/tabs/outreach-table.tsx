// "All outreach" on Home: status chips, one row per person with a live note,
// and "Approve all" over drafts waiting for review.
import { useState } from "react";
import { Link } from "react-router";
import { FiCheck, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { approveAll, getSettings, getStatus, listOutreach } from "~/lib/desk/api";
import { deskPath, useDeskParams } from "~/lib/desk/nav";
import type { AgentSettings, OutreachList, OutreachRow, Status, StatusWord } from "~/lib/desk/types";
import { Button, Card, clean, cx, Drawer, Empty, ErrorBox, FilterChip, FOCUS_RING, Loading, Notice, Section, when, errorText } from "./kit";
import { refresh, useLive, usePageContext } from "./live";
import { APPROVED_SHORT, CHIP_ORDER, countFor, isStatusWord, labelFor, noteFor, StatusPill } from "./status";

const PAGE = 20;

export function OutreachTable() {
  const [params, setParams] = useDeskParams();
  const filter: StatusWord | "all" = isStatusWord(params.filter) ? params.filter : "all";
  const offset = params.offset;
  // The first page of "all" is the entry bootstrap primed (no params).
  const first = filter === "all" && offset === 0;
  const list = useLive<OutreachList>(
    "outreach",
    () => listOutreach(first ? { status: "all" } : { status: filter, limit: PAGE, offset }),
    first ? undefined : { status: filter, offset },
  );
  const status = useLive<Status>("status", getStatus);
  const settings = useLive<AgentSettings>("settings", getSettings);
  usePageContext({ route: "home", filter: filter === "all" ? null : filter });

  const shown = list.data;
  const pick = (w: StatusWord | "all") => setParams({ filter: w === "all" ? null : w });
  const counts = shown?.counts ?? status.data?.counts ?? null;
  const waiting = counts?.needs_you ?? 0;

  return (
    <Section
      title="All outreach"
      sub="One row per person you are writing to."
      actions={waiting > 0 ? <ApproveAll reviewFirst={settings.data?.review_before_send ?? true} /> : null}
    >
      <div role="toolbar" aria-label="Filter by status" className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {CHIP_ORDER.map((w) => (
          <FilterChip key={w} selected={filter === w} count={countFor(w, counts)} onClick={() => pick(w)}>
            {labelFor(w)}
          </FilterChip>
        ))}
      </div>
      {list.error ? (
        <ErrorBox error={list.error} onRetry={list.reload} />
      ) : !shown ? (
        <Loading label="Loading your outreach" />
      ) : shown.items.length === 0 ? (
        <Empty
          title={filter === "all" ? "No outreach yet" : `Nothing under ${labelFor(filter)}`}
          body={filter === "all" ? "Press Write on a match, or ask me to write to your top 5. Drafts land here for you to review." : "Pick another status to see the rest."}
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_4.5rem] gap-4 border-b-2 border-studojo-ink bg-studojo-surface-muted px-4 py-2 font-satoshi text-xs font-bold uppercase tracking-wide text-studojo-muted md:grid">
              <span>Person</span>
              <span>Subject</span>
              <span>Status</span>
              <span className="text-right">When</span>
            </div>
            <ul className="divide-y-2 divide-studojo-ink/10">
              {shown.items.map((r) => (
                <Row key={r.id} r={r} />
              ))}
            </ul>
          </Card>
          <Pager total={shown.total} offset={shown.offset} limit={shown.limit || PAGE} onPage={(o) => setParams({ offset: o })} />
        </>
      )}
    </Section>
  );
}

function Row({ r }: { r: OutreachRow }) {
  const name = clean(r.lead.name);
  return (
    <li>
      <Link
        to={deskPath({ to: "outreach", id: r.id, filter: null })}
        className={cx("grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 px-4 py-3 hover:bg-studojo-purple-bg md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_4.5rem] md:items-center md:gap-4", FOCUS_RING)}
      >
        <span className="min-w-0">
          <span className="block truncate font-satoshi text-sm font-bold text-studojo-ink">{name}</span>
          <span className="block truncate font-satoshi text-xs text-studojo-muted">{clean(r.lead.company)}</span>
        </span>
        <span className="text-right font-satoshi text-xs tabular-nums text-studojo-muted md:order-last">{when(r.when)}</span>
        <span className="col-span-2 min-w-0 truncate font-satoshi text-sm text-studojo-ink md:col-span-1">
          {r.busy ? <span className="text-studojo-muted">Writing...</span> : clean(r.subject) || <span className="text-studojo-muted">{r.status_word === "skipped" ? "No email written" : "No subject"}</span>}
        </span>
        <span className="col-span-2 flex min-w-0 flex-wrap items-center gap-2 md:col-span-1">
          <StatusPill word={r.status_word} busy={r.busy} />
          <span className="min-w-0 font-satoshi text-xs text-studojo-muted">{noteFor(r)}</span>
        </span>
      </Link>
    </li>
  );
}

export function Pager({ total, offset, limit, onPage }: { total: number; offset: number; limit: number; onPage: (o: number) => void }) {
  if (total <= limit) return null;
  const from = offset + 1;
  const to = Math.min(offset + limit, total);
  return (
    <nav aria-label="Pages" className="mt-3 flex items-center justify-end gap-2 font-satoshi text-sm text-studojo-muted">
      <span className="tabular-nums">{from} to {to} of {total}</span>
      <Button aria-label="Previous page" icon={<FiChevronLeft />} disabled={offset === 0} onClick={() => onPage(Math.max(0, offset - limit))} />
      <Button aria-label="Next page" icon={<FiChevronRight />} disabled={to >= total} onClick={() => onPage(offset + limit)} />
    </nav>
  );
}

/** Approves the current version of every draft waiting for review. Nothing is sent in Phase 1. */
function ApproveAll({ reviewFirst }: { reviewFirst: boolean }) {
  const [ids, setIds] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const gather = async () => {
    const r = await listOutreach({ status: "needs_you", limit: 50 });
    return r.items.filter((x) => x.server_status === "needs_review" && !x.busy).map((x) => x.id);
  };

  const run = async (list: string[]) => {
    setBusy(true);
    try {
      const r = await approveAll({ ids: list });
      const refused = r.refused.length ? ` ${r.refused.length} could not be approved and still need you.` : "";
      const n = r.approved.length;
      const done = n ? `${n === 1 ? "1 draft" : `${n} drafts`}: ${APPROVED_SHORT}` : "Nothing was approved.";
      setMsg({ tone: "ok", text: `${done}${refused}` });
      refresh(["outreach", "status"]);
    } catch (e) {
      setMsg({ tone: "error", text: errorText(e) });
    } finally {
      setBusy(false);
      setIds(null);
    }
  };

  const start = async () => {
    setMsg(null);
    setBusy(true);
    try {
      const list = await gather();
      setBusy(false);
      if (!list.length) {
        setMsg({ tone: "error", text: "No drafts are ready to approve yet." });
        return;
      }
      if (reviewFirst) setIds(list);
      else await run(list);
    } catch (e) {
      setBusy(false);
      setMsg({ tone: "error", text: errorText(e) });
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button variant="dark" icon={<FiCheck />} busy={busy} onClick={() => void start()}>
        Approve all
      </Button>
      {msg ? <Notice tone={msg.tone} onClose={() => setMsg(null)}>{msg.text}</Notice> : null}
      <Drawer
        open={!!ids}
        onClose={() => setIds(null)}
        title={`Approve ${ids?.length ?? 0} ${ids?.length === 1 ? "draft" : "drafts"}?`}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIds(null)}>Cancel</Button>
            <Button variant="primary" busy={busy} onClick={() => ids && void run(ids)}>Approve</Button>
          </div>
        }
      >
        <p className="font-satoshi text-base text-studojo-ink">
          Approving saves the final copy of each draft as it reads now. Nothing goes out: sending is not switched on yet, so you can copy each approved email into Gmail yourself.
        </p>
        <p className="mt-3 font-satoshi text-sm text-studojo-muted">
          Review before send is on, so I check with you before approving in bulk. You can change that in Settings.
        </p>
      </Drawer>
    </div>
  );
}
