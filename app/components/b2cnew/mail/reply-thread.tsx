// One reply thread: their message, your emails (collapsed), the tag with
// Retag, Senpai's draft reply, and the outcome buttons.
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowLeft, FiChevronDown, FiMessageCircle, FiTag } from "react-icons/fi";
import { useB2C, useMission } from "../core/store";
import { chipFor, useAgent } from "../core/engine";
import { buildEmailSequence, dayDate, fullName, matchFor, PAGE_URL, REPLY_TAG_STYLE, type SimReply } from "../data";
import { QUICK } from "../motion";
import type { Person, ReplyState, ReplyTag } from "../types";
import { Avatar, Badge, cx, FOCUS_RING, IconButton } from "../ui";
import { DraftReply, Outcomes } from "./reply-parts";

const TAGS: ReplyTag[] = ["Positive", "Question", "Not now"];

export function ReplyThread({ sim, state, p, onBack }: { sim: SimReply; state: ReplyState; p: Person; onBack?: () => void }) {
  const agent = useAgent();
  const label = `${p.first}, ${p.company}`;
  return (
    <article aria-labelledby={`th-${sim.id}`} className="space-y-4">
      <header className="flex items-start gap-3">
        {onBack ? <IconButton label="Back to all replies" icon={<FiArrowLeft />} onClick={onBack} className="-ml-2" /> : null}
        <span className="hidden shrink-0 sm:block"><Avatar first={p.first} last={p.last} size="lg" /></span>
        <div className="min-w-0 flex-1">
          <h3 id={`th-${sim.id}`} className="truncate font-clash text-xl font-semibold leading-tight">
            {fullName(p)}
          </h3>
          <p className="truncate font-satoshi text-sm text-studojo-muted">
            {p.title}, {p.company} · {p.city}
          </p>
        </div>
        <IconButton label={`Ask Senpai about ${label}'s reply`} icon={<FiMessageCircle />} tone="purple" onClick={() => agent.open({ attach: chipFor.reply(state, label) })} />
      </header>

      <TagRow state={state} />
      <YourEmails p={p} replyDay={sim.day} />

      <div className="relative rounded-2xl rounded-tl-md border-2 border-studojo-ink bg-white p-3 shadow-[2px_2px_0_0_#191a23]">
        <p className="mb-1 flex flex-wrap items-center gap-2 font-satoshi text-xs text-studojo-muted">
          <span className="font-bold text-studojo-ink">{p.first} replied</span>
          <span>
            Day {sim.day} · {dayDate(sim.day).label}
          </span>
          <Badge kind="simulated" />
        </p>
        <p className="font-satoshi text-base leading-relaxed text-studojo-ink">{sim.text}</p>
      </div>

      <DraftReply sim={sim} state={state} p={p} />
      <Outcomes state={state} p={p} />
    </article>
  );
}

function TagRow({ state }: { state: ReplyState }) {
  const { dispatch } = useB2C();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={cx("inline-flex items-center gap-1 rounded-full border-2 border-studojo-ink px-2 py-0.5 font-satoshi text-xs font-bold", REPLY_TAG_STYLE[state.tag])}>
        <FiTag aria-hidden />
        {state.tag}
      </span>
      <span className="font-satoshi text-xs text-studojo-muted">Tagged by Senpai</span>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cx("min-h-11 rounded-lg px-2 font-satoshi text-sm font-bold text-studojo-purple-strong underline underline-offset-4", FOCUS_RING)}
      >
        Retag
      </button>
      {open ? (
        <div role="radiogroup" aria-label="Tag this reply" className="flex flex-wrap gap-1.5">
          {TAGS.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={state.tag === t}
              onClick={() => {
                if (t !== state.tag) dispatch({ type: "RETAG", id: state.id, tag: t });
                setOpen(false);
              }}
              className={cx(
                "min-h-11 rounded-full border-2 border-studojo-ink px-3 font-satoshi text-sm font-bold",
                state.tag === t ? "bg-studojo-ink text-white" : REPLY_TAG_STYLE[t],
                FOCUS_RING,
              )}
            >
              {t}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** The emails you sent before they replied, collapsed. */
function YourEmails({ p, replyDay }: { p: Person; replyDay: number }) {
  const { s } = useB2C();
  const m = useMission(p.missionId);
  const [open, setOpen] = useState(false);
  if (p.firstDay === undefined) return null;
  const fd = p.firstDay;
  const seq = buildEmailSequence(m.target, matchFor(p), PAGE_URL, s.page.live).filter((e) => fd + e.day <= replyDay);
  return (
    <div className="rounded-2xl border-2 border-studojo-ink/20 bg-studojo-surface-muted/60">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cx("flex min-h-11 w-full items-center gap-2 rounded-2xl px-3 text-left font-satoshi text-sm", FOCUS_RING)}
      >
        <span className="font-bold">Your {seq.length === 1 ? "email" : `${seq.length} emails`}</span>
        <span className="min-w-0 flex-1 truncate text-studojo-muted">
          {seq.map((e) => `${e.label}, Day ${fd + e.day}`).join(" · ")}
        </span>
        <FiChevronDown aria-hidden className={cx("shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={QUICK} className="overflow-hidden">
            <div className="space-y-3 px-3 pb-3">
              {seq.map((e) => (
                <div key={e.id} className="rounded-xl border-2 border-studojo-ink/20 bg-white p-3 font-satoshi text-sm">
                  <p className="text-xs text-studojo-muted">
                    {e.label} · Day {fd + e.day} · from {s.gmail.address}
                  </p>
                  <p className="mt-1 font-bold">{e.subject}</p>
                  <div className="mt-1 space-y-1 text-studojo-ink">
                    {e.paragraphs.map((x, i) => (
                      <p key={i}>{x}</p>
                    ))}
                  </div>
                  {e.pageCard ? <p className="mt-2 rounded-lg border-2 border-dashed border-studojo-purple bg-studojo-purple-bg px-2 py-1 text-xs font-bold text-studojo-purple-strong">Your page card: {PAGE_URL}</p> : null}
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
