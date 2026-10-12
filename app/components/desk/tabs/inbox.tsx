// Inbox: replies grouped Positive, Question, Not now, Bounced, with a reading
// pane. Phase 1 drafts no answers, so the pane links to the outreach page.
import { Link } from "react-router";
import { FiArrowLeft, FiArrowRight, FiMessageCircle } from "react-icons/fi";
import { deskPath, useDeskParams } from "~/lib/desk/nav";
import type { OutreachDetail, ReplyGroup, ReplyItem, ReplyList } from "~/lib/desk/types";
import { getOutreach, listReplies } from "~/lib/desk/api";
import { Button, Card, clean, cx, Empty, ErrorBox, FilterChip, FOCUS_RING, Initials, Loading, PlainText, Pill, Section, when, type Tone } from "./kit";
import { ask, useLive, usePageContext } from "./live";
import { Pager } from "./outreach-table";

const PAGE = 20;
const GROUPS: { id: ReplyGroup; label: string; tone: Tone }[] = [
  { id: "positive", label: "Positive", tone: "green" },
  { id: "question", label: "Question", tone: "purple" },
  { id: "not_now", label: "Not now", tone: "yellow" },
  { id: "bounced", label: "Bounced", tone: "pink" },
];
const GROUP_OF = Object.fromEntries(GROUPS.map((g) => [g.id, g])) as Record<ReplyGroup, (typeof GROUPS)[number]>;

const isGroup = (v: string | null): v is ReplyGroup => !!v && v in GROUP_OF;

export function InboxTab() {
  const [params, setParams] = useDeskParams();
  const group = isGroup(params.filter) ? params.filter : null;
  const offset = params.offset;
  const selected = params.id;
  const list = useLive<ReplyList>("replies", () => listReplies({ group, limit: PAGE, offset }), { group, offset });
  // The shell keeps this entry fresh for the top bar badge; it carries every group's count.
  const badge = useLive<ReplyList>("replies", () => listReplies({ limit: 1 }), "badge");
  usePageContext({ route: "inbox", outreach_id: selected, filter: group });

  const select = (id: string | null) => setParams({ id }, { replace: true });
  const pick = (g: ReplyGroup | null) => setParams({ filter: g, id: null });
  const setOffset = (o: number) => setParams({ offset: o });

  const counts = badge.data?.counts ?? list.data?.counts ?? null;
  const total = counts ? counts.positive + counts.question + counts.not_now + counts.bounced : null;
  const data = list.data;
  const current = data?.items.find((x) => x.outreach_id === selected) ?? null;

  return (
    <Section title="Inbox" sub="Replies to your emails, sorted by what they need from you.">
      <div role="toolbar" aria-label="Filter replies" className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
        <FilterChip selected={group === null} count={total} onClick={() => pick(null)}>All</FilterChip>
        {GROUPS.map((g) => (
          <FilterChip key={g.id} selected={group === g.id} count={counts ? counts[g.id] : null} onClick={() => pick(g.id)}>
            {g.label}
          </FilterChip>
        ))}
      </div>
      {list.error ? (
        <ErrorBox error={list.error} onRetry={list.reload} />
      ) : !data ? (
        <Loading label="Loading replies" />
      ) : data.items.length === 0 ? (
        <Empty
          title={group ? `No ${GROUP_OF[group].label.toLowerCase()} replies` : "No replies yet"}
          body={group ? "Pick another group to see the rest." : "When someone writes back to an email you sent, it shows up here."}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div className={cx(selected && "hidden lg:block")}>
            <ul className="space-y-2">
              {data.items.map((r) => (
                <ReplyRow key={r.outreach_id} r={r} active={r.outreach_id === selected} onOpen={() => select(r.outreach_id)} />
              ))}
            </ul>
            <Pager total={data.total} offset={data.offset} limit={data.limit || PAGE} onPage={setOffset} />
          </div>
          <div className={cx(!selected && "hidden lg:block")}>
            {selected ? (
              <ReadingPane id={selected} item={current} onBack={() => select(null)} />
            ) : (
              <Empty title="Pick a reply" body="Its text and your original email open here." />
            )}
          </div>
        </div>
      )}
    </Section>
  );
}

function ReplyRow({ r, active, onOpen }: { r: ReplyItem; active: boolean; onOpen: () => void }) {
  const g = GROUP_OF[r.group];
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-current={active || undefined}
        className={cx(
          "flex w-full items-start gap-3 rounded-2xl border-2 border-studojo-ink px-3 py-3 text-left",
          active ? "bg-studojo-purple-bg shadow-[3px_3px_0_0_#191a23]" : "bg-white hover:bg-studojo-surface-muted",
          FOCUS_RING,
        )}
      >
        <Initials name={r.lead.name} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate font-satoshi text-sm font-bold text-studojo-ink">{clean(r.lead.name)}</span>
            <span className="shrink-0 font-satoshi text-xs tabular-nums text-studojo-muted">{when(r.received_at ?? r.sent_at)}</span>
          </span>
          <span className="block truncate font-satoshi text-xs text-studojo-muted">{clean(r.lead.company)}</span>
          <span className="mt-1 line-clamp-2 block font-satoshi text-sm text-studojo-ink/80">
            {clean(r.reply_text) || (r.group === "bounced" ? "This address did not accept the email." : "No reply text.")}
          </span>
          <span className="mt-1.5 block">
            <Pill tone={g.tone}>{g.label}</Pill>
          </span>
        </span>
      </button>
    </li>
  );
}

function ReadingPane({ id, item, onBack }: { id: string; item: ReplyItem | null; onBack: () => void }) {
  const d = useLive<OutreachDetail>(`outreach:${id}`, () => getOutreach(id));
  const detail = d.data;
  const lead = item?.lead ?? detail?.lead ?? null;
  const replyText = item?.reply_text ?? detail?.thread?.reply_text ?? null;
  const first = detail?.thread?.touches[0] ?? null;
  const name = clean(lead?.name) || "this person";

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <Button variant="ghost" icon={<FiArrowLeft />} onClick={onBack}>All replies</Button>
      </div>
      {d.error && !item ? <ErrorBox error={d.error} onRetry={d.reload} /> : null}
      {lead ? (
        <div className="flex items-start gap-3">
          <Initials name={lead.name} />
          <div className="min-w-0 flex-1">
            <p className="font-clash text-xl font-semibold text-studojo-ink">{name}</p>
            <p className="font-satoshi text-sm text-studojo-muted">{[clean(lead.title), clean(lead.company)].filter(Boolean).join(" at ")}</p>
          </div>
          {item ? <Pill tone={GROUP_OF[item.group].tone}>{GROUP_OF[item.group].label}</Pill> : null}
        </div>
      ) : !d.error ? (
        <Loading label="Loading the reply" rows={2} />
      ) : null}

      <div className="mt-5">
        <p className="font-satoshi text-xs font-bold uppercase tracking-wide text-studojo-muted">
          Their reply{item?.received_at ? `, ${when(item.received_at)}` : ""}
        </p>
        <div className="mt-2 rounded-2xl border-2 border-studojo-ink bg-studojo-green-bg/50 p-4">
          {replyText ? (
            <PlainText text={replyText} className="font-satoshi text-base text-studojo-ink" />
          ) : (
            <p className="font-satoshi text-sm text-studojo-muted">
              {item?.group === "bounced" ? "This address did not accept the email, so there is no reply." : "No reply text was saved for this email."}
            </p>
          )}
        </div>
      </div>

      {first ? (
        <details className="mt-4 rounded-2xl border-2 border-studojo-ink/15 p-3">
          <summary className={cx("cursor-pointer rounded font-satoshi text-sm font-bold text-studojo-ink", FOCUS_RING)}>
            Your email{first.subject ? `: ${clean(first.subject)}` : ""}
          </summary>
          <PlainText text={first.body} className="mt-2 font-satoshi text-sm text-studojo-ink/80" />
        </details>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link to={deskPath({ to: "outreach", id, filter: null })} className={cx("inline-flex min-h-10 items-center gap-1 rounded-xl border-2 border-studojo-ink bg-studojo-purple-strong px-3 font-satoshi text-sm font-bold text-white shadow-[3px_3px_0_0_#191a23]", FOCUS_RING)}>
          Open the outreach <FiArrowRight aria-hidden />
        </Link>
        <Button variant="ghost" icon={<FiMessageCircle />} onClick={() => ask(`${name} replied to my email. What should I say back?`, { kind: "outreach", id })}>
          Ask me how to answer
        </Button>
      </div>
      <p className="mt-3 font-satoshi text-xs text-studojo-muted">To answer, write back from your own Gmail for now.</p>
    </Card>
  );
}
