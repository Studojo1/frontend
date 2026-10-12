// Home: "Top matches" (five people worth writing to now) and "All outreach".
import { Link } from "react-router";
import { FiArrowRight, FiEdit3, FiMessageCircle, FiX } from "react-icons/fi";
import { getStatus, listMatches } from "~/lib/desk/api";
import { UPLOAD_PATH } from "~/lib/desk/hooks";
import { deskPath } from "~/lib/desk/nav";
import type { MatchCard, Status } from "~/lib/desk/types";
import { Button, Card, clean, cx, Empty, ErrorBox, FOCUS_RING, Loading, Score, Section } from "./kit";
import { ask, useLive } from "./live";
import { ActionNoticeView, useMatchActions } from "./match-actions";
import { OutreachTable } from "./outreach-table";

const LINK = cx("inline-flex min-h-10 items-center gap-1 rounded-xl border-2 border-studojo-ink bg-white px-3 font-satoshi text-sm font-bold text-studojo-ink shadow-[3px_3px_0_0_#191a23] hover:bg-studojo-purple-bg", FOCUS_RING);

export function HomeTab() {
  const status = useLive<Status>("status", getStatus);
  if (status.data?.state === "needs_resume") return <NeedsResume />;
  return (
    <div className="space-y-10">
      <TopMatches status={status.data} />
      <OutreachTable />
    </div>
  );
}

export function NeedsResume() {
  return (
    <Empty
      title="Start with your resume"
      body="I find hiring managers and write to them from what you have built. Upload your resume and your matches land here."
      action={
        <a href={UPLOAD_PATH} className={cx("inline-flex min-h-12 items-center rounded-xl border-2 border-studojo-ink bg-studojo-purple-strong px-5 font-satoshi font-bold text-white shadow-[3px_3px_0_0_#191a23]", FOCUS_RING)}>
          Upload your resume
        </a>
      }
    />
  );
}

/** Same loader the shell registers for top_matches, so a refetch from anywhere agrees. */
const loadTop = () => listMatches({ state: "new", limit: 5 }).then((l) => l.items);

function TopMatches({ status }: { status: Status | null }) {
  const top = useLive<MatchCard[]>("top_matches", loadTop);
  const acts = useMatchActions();
  const items = (top.data ?? []).slice(0, 5);
  const total = status?.matches.total ?? null;
  const people = deskPath({ to: "people", id: null, filter: null });

  const actions = (
    <>
      <Link to={people} className={cx("inline-flex min-h-10 items-center gap-1 rounded-xl px-3 font-satoshi text-sm font-bold text-studojo-ink underline-offset-4 hover:underline", FOCUS_RING)}>
        See all people{total ? ` (${total})` : ""}
        <FiArrowRight aria-hidden />
      </Link>
      {items.length > 1 ? (
        <Button variant="primary" busy={acts.batch} onClick={() => void acts.write(items.map((m) => m.lead_id))}>
          Write to all {items.length}
        </Button>
      ) : null}
    </>
  );

  return (
    <Section title="Top matches" sub="Hiring managers worth writing to now. Nothing is sent until you approve it." actions={actions}>
      <ActionNoticeView notice={acts.notice} onUndo={(id) => void acts.undo(id)} onClose={() => acts.setNotice(null)} />
      {top.error ? (
        <ErrorBox error={top.error} onRetry={top.reload} />
      ) : !top.data ? (
        <Loading label="Loading your top matches" rows={2} />
      ) : items.length === 0 ? (
        <Empty
          title="No new matches waiting"
          body="Everyone in your current list has a draft, an email or a pass. People shows all of them."
          action={<Link to={people} className={LINK}>See all people</Link>}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {items.map((m) => (
            <TopCard
              key={m.lead_id}
              m={m}
              busy={acts.pending.has(m.lead_id)}
              onWrite={() => void acts.write([m.lead_id])}
              onPass={() => void acts.pass(m.lead_id, m.name)}
            />
          ))}
        </ul>
      )}
    </Section>
  );
}

function TopCard({ m, busy, onWrite, onPass }: { m: MatchCard; busy: boolean; onWrite: () => void; onPass: () => void }) {
  const name = clean(m.name);
  return (
    <Card as="li" className="flex min-w-0 flex-col p-4">
      <div className="flex items-start gap-3">
        <Score value={m.score} strong={m.strong} />
        <div className="min-w-0 flex-1">
          <Link
            to={deskPath({ to: "people", id: String(m.lead_id), filter: null })}
            className={cx("line-clamp-2 break-words rounded font-satoshi text-base font-bold leading-snug text-studojo-ink hover:underline", FOCUS_RING)}
            title={`Details for ${name}`}
          >
            {name}
          </Link>
          <p className="line-clamp-2 break-words font-satoshi text-sm leading-snug text-studojo-muted">{clean(m.title) || "Title not listed"}</p>
          <p className="truncate font-satoshi text-sm font-bold text-studojo-ink">{clean(m.company)}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 min-h-[2.5rem] flex-1 font-satoshi text-sm text-studojo-ink/80">{clean(m.reason)}</p>
      <div className="mt-3 flex items-center gap-2">
        <Button variant="ghost" icon={<FiX />} disabled={busy} onClick={onPass} aria-label={`Pass on ${name}`}>
          Pass
        </Button>
        <Button variant="primary" className="flex-1" icon={<FiEdit3 />} busy={busy} onClick={onWrite} aria-label={`Write to ${name}`}>
          Write
        </Button>
      </div>
      <button
        type="button"
        onClick={() => ask(`Why is ${name} at ${clean(m.company) || "this company"} a good fit for me?`, { kind: "lead", id: m.lead_id })}
        className={cx("mt-2 inline-flex min-h-8 items-center gap-1 self-start rounded-lg px-1 font-satoshi text-xs font-bold text-studojo-muted hover:text-studojo-purple-strong", FOCUS_RING)}
      >
        <FiMessageCircle aria-hidden />
        Ask why
      </button>
    </Card>
  );
}
