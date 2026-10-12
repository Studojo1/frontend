// RepliesTab: honest reply tracking and fast answers from your own Gmail.
// The open thread is the workspace focus (a reply chip), so Senpai's flows
// (F3, F4) open a thread by focusing it, and the composer knows about it.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiInbox, FiMessageCircle } from "react-icons/fi";
import { COPY } from "../config";
import { missionOf, noReplyYet, visibleReplies } from "../core/derive";
import { chipFor, useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { dayDate, formatCount, REPLY_TAG_STYLE } from "../data";
import { useMotionPresets } from "../motion";
import { useHotkeys } from "../shell/keys";
import type { QuickChip, ReplyTag } from "../types";
import { Avatar, cx, EmptyState, FOCUS_RING, SimNote } from "../ui";
import { DeliveryGroup } from "./reply-parts";
import { ReplyThread } from "./reply-thread";

type Filter = "All" | ReplyTag | "Delivery";
const FILTERS: Filter[] = ["All", "Positive", "Question", "Not now", "Delivery"];
type Row = ReturnType<typeof visibleReplies>[number];

/** What needs you first: an unanswered question, then a yes with no draft yet, then the rest; newest first inside each. */
const need = (r: Row) => (r.state.tag === "Question" && !r.state.savedToGmail ? 0 : r.state.tag === "Positive" && !r.state.draft && !r.state.outcome ? 1 : 2);
const byNeed = (a: Row, b: Row) => need(a) - need(b) || b.sim.day - a.sim.day;

export function RepliesTab() {
  const { s, dispatch, viewport } = useB2C();
  const [filter, setFilter] = useState<Filter>("All");
  const all = visibleReplies(s).sort(byNeed);
  const rows = filter === "All" || filter === "Delivery" ? all : all.filter((r) => r.state.tag === filter);
  const openId = s.focus?.kind === "reply" ? s.focus.id : null;
  const open = all.find((r) => r.sim.id === openId);
  const phone = viewport === "phone";

  const openRow = (r: Row) => dispatch({ type: "FOCUS", item: chipFor.reply(r.state, `${r.person.first}, ${r.person.company}`) });
  useEffect(() => {
    if (open && !open.state.seen) dispatch({ type: "SEE_REPLY", id: open.sim.id });
  }, [open?.sim.id, open?.state.seen]);
  // Wide screens never open on an empty pane: the reply that needs you most is open.
  const first = rows[0];
  useEffect(() => {
    if (!phone && !openId && first && s.tab === "replies") openRow(first);
  }, [phone, openId, first?.sim.id, s.tab]);
  // On phones the thread replaces the list: bring its top into view.
  useEffect(() => {
    if (phone && open) document.getElementById(`th-${open.sim.id}`)?.scrollIntoView({ block: "center" });
  }, [phone, open?.sim.id]);

  const step = (by: number) => {
    if (!rows.length) return;
    const i = rows.findIndex((r) => r.sim.id === openId);
    openRow(rows[Math.max(0, Math.min(rows.length - 1, i < 0 ? 0 : i + by))]);
  };
  useHotkeys({ j: () => step(1), k: () => step(-1), enter: () => !open && rows[0] && openRow(rows[0]) }, s.tab === "replies");

  const m = missionOf(s);
  if (m.total === 0) {
    return (
      <div className="space-y-4">
        <TopLine count={0} none={0} />
        <EmptyState icon={<FiInbox />} title="Nothing sent in this mission yet." body="So there is nothing to reply to. Once emails go out, replies land here, tagged, with a draft answer you send from Gmail." />
      </div>
    );
  }

  const list = (
    <div className="space-y-3">
      <FilterChips value={filter} onChange={setFilter} counts={all} />
      {filter === "Delivery" ? (
        <DeliveryGroup forceOpen />
      ) : rows.length ? (
        <ReplyList rows={rows} openId={openId} onOpen={openRow} />
      ) : (
        <EmptyState
          icon={<FiInbox />}
          title={all.length ? `No ${filter} replies.` : "No replies yet."}
          body={all.length ? "Try another tag, or All." : "Follow-ups are still scheduled. Replies are not guaranteed, and this page never pretends otherwise."}
        />
      )}
      {filter === "All" ? <DeliveryGroup /> : null}
    </div>
  );

  return (
    <div className="@container space-y-4">
      {/* On phones an open thread gets the whole screen, so the summary steps aside. */}
      {phone && open ? null : <TopLine count={all.length} none={noReplyYet(s)} />}
      {phone ? (
        open ? (
          <ReplyThread key={open.sim.id} sim={open.sim} state={open.state} p={open.person} onBack={() => dispatch({ type: "FOCUS", item: null })} />
        ) : (
          list
        )
      ) : (
        <div className="grid items-start gap-5 @[680px]:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          {list}
          <div className="min-w-0 rounded-2xl border-2 border-studojo-ink bg-studojo-surface-muted/40 p-4">
            {open ? (
              <ReplyThread key={open.sim.id} sim={open.sim} state={open.state} p={open.person} />
            ) : (
              <PickOne hasReplies={all.length > 0} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TopLine({ count, none }: { count: number; none: number }) {
  return (
    <section aria-labelledby="rp-title" className="space-y-1">
      <h2 id="rp-title" className="font-clash text-2xl font-semibold">
        {count === 0 && none === 0
          ? "No replies yet."
          : `${count} ${count === 1 ? "reply" : "replies"}. No reply yet from ${formatCount(none)}.`}
      </h2>
      <p className="flex flex-wrap items-center gap-2 font-satoshi text-sm text-studojo-muted">
        <span>{COPY.noGuarantee}</span>
        <SimNote />
      </p>
    </section>
  );
}

function FilterChips({ value, onChange, counts }: { value: Filter; onChange: (f: Filter) => void; counts: Row[] }) {
  const n = (f: Filter) => (f === "All" ? counts.length : f === "Delivery" ? null : counts.filter((r) => r.state.tag === f).length);
  return (
    <div role="group" aria-label="Filter replies" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 xl:flex-wrap xl:overflow-visible">
      {FILTERS.map((f) => {
        const on = f === value;
        const c = n(f);
        return (
          <button
            key={f}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(f)}
            className={cx(
              "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border-2 border-studojo-ink px-3 font-satoshi text-sm font-bold",
              on ? "bg-studojo-ink text-white shadow-[2px_2px_0_0_#8b5cf6]" : "bg-white text-studojo-ink hover:bg-studojo-purple-bg",
              FOCUS_RING,
            )}
          >
            {f}
            {c !== null ? <span className={cx("rounded-full px-1.5 text-[11px] tabular-nums", on ? "bg-white/20" : "bg-studojo-ink/10")}>{c}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function ReplyList({ rows, openId, onOpen }: { rows: Row[]; openId: string | null; onOpen: (r: Row) => void }) {
  const { s } = useB2C();
  const m = useMotionPresets();
  return (
    <motion.ul variants={m.list} initial="hidden" animate="show" aria-label="Replies, what needs you first" className="overflow-hidden rounded-2xl border-2 border-studojo-ink bg-white shadow-[2px_2px_0_0_#191a23]">
      {rows.map((r) => {
        const on = r.sim.id === openId;
        const landed = s.highlight?.ids.includes(r.person.id);
        return (
          <motion.li key={r.sim.id} variants={m.item} className="border-b-2 border-studojo-ink/10 last:border-b-0">
            <button
              type="button"
              aria-current={on || undefined}
              onClick={() => onOpen(r)}
              className={cx(
                "relative flex min-h-16 w-full items-start gap-3 px-3 py-2.5 text-left",
                on ? "bg-studojo-purple-bg" : "hover:bg-studojo-surface-muted",
                landed && "ring-2 ring-inset ring-studojo-purple",
                FOCUS_RING,
              )}
            >
              {on ? <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-studojo-purple" /> : null}
              <Avatar first={r.person.first} last={r.person.last} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className={cx("truncate font-satoshi text-sm", r.state.seen ? "font-bold" : "font-black")}>
                    {r.person.first} {r.person.last}
                  </span>
                  {!r.state.seen ? <span aria-label="New" className="h-2 w-2 shrink-0 rounded-full border border-studojo-ink bg-studojo-pink" /> : null}
                  <span className="ml-auto shrink-0 font-satoshi text-[11px] text-studojo-muted">{dayDate(r.sim.day).date}</span>
                </span>
                <span className="block truncate font-satoshi text-xs text-studojo-muted">{r.person.company}</span>
                <span className="mt-0.5 line-clamp-2 font-satoshi text-sm text-studojo-ink">{r.sim.text}</span>
                <span className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className={cx("rounded-full border border-studojo-ink px-1.5 font-satoshi text-[11px] font-bold", REPLY_TAG_STYLE[r.state.tag])}>{r.state.tag}</span>
                  {r.state.savedToGmail ? <span className="font-satoshi text-[11px] font-bold text-[#047857]">In Gmail drafts</span> : r.state.draft ? <span className="font-satoshi text-[11px] font-bold text-[#be185d]">Draft ready</span> : null}
                  {r.state.outcome ? <span className="font-satoshi text-[11px] font-bold text-[#047857]">{r.state.outcome === "offer" ? "Offer" : "Interview"}</span> : null}
                  {r.state.remindOn ? <span className="font-satoshi text-[11px] text-studojo-muted">Remind {r.state.remindOn}</span> : null}
                </span>
              </span>
            </button>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

function PickOne({ hasReplies }: { hasReplies: boolean }) {
  const agent = useAgent();
  const run = (c: QuickChip) => {
    agent.open({ focus: false });
    agent.chip(c);
  };
  return (
    <div className="flex flex-col items-center px-2 py-10 text-center">
      <span aria-hidden className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-studojo-ink bg-studojo-pink-bg text-xl text-[#be185d]">
        <FiMessageCircle />
      </span>
      <p className="font-clash text-lg font-semibold">{hasReplies ? "Pick a reply to answer it." : "Nothing to answer yet."}</p>
      <p className="mt-1 max-w-sm font-satoshi text-sm text-studojo-muted">
        Senpai drafts an answer. You put it in Gmail drafts and send it yourself. {COPY.neverReplies.split(".")[0]}.
      </p>
      {hasReplies ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {agent.quickChips("replies").map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => run(c)}
              className={cx("inline-flex min-h-11 items-center rounded-full border-2 border-studojo-ink bg-studojo-purple-bg px-3 font-satoshi text-sm font-bold text-studojo-purple-strong", FOCUS_RING)}
            >
              {c.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
