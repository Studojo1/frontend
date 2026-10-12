// Replies pieces: Senpai's draft reply (Put in Gmail drafts), the outcome
// buttons with the no-fee stamp, Remind me, and the Delivery group.
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle, FiAward, FiBell, FiCheckCircle, FiChevronDown, FiEdit3, FiInbox, FiPhoneCall, FiZap } from "react-icons/fi";
import { COPY, GIVEN_BACK } from "../config";
import { snapshot } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { dayDate, REPLY_DRAFTS, type SimReply } from "../data";
import { QUICK, stampVariants, useSafeReducedMotion } from "../motion";
import type { Person, ReplyState } from "../types";
import { Button, cx, FOCUS_RING, SimNote, SkillChip } from "../ui";

/** Senpai's draft reply. Senpai never sends it: you put it in Gmail drafts and send it yourself. */
export function DraftReply({ sim, state, p }: { sim: SimReply; state: ReplyState; p: Person }) {
  const { dispatch } = useB2C();
  const agent = useAgent();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const reduced = useSafeReducedMotion();

  const draftIt = () => {
    if (sim.id === "rp-1" || sim.id === "rp-2") {
      agent.open({ focus: false });
      agent.start(sim.id === "rp-1" ? "F3" : "F4", { personId: p.id, replyId: sim.id });
      return;
    }
    dispatch({ type: "SET_REPLY_DRAFT", id: sim.id, draft: REPLY_DRAFTS[sim.id] ?? [`Hi ${p.first}, thank you for writing back.`] });
    agent.note(`Drafted a reply to ${p.first} at ${p.company}. It is in Replies, not sent. You send it from Gmail.`);
  };

  if (!state.draft) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-studojo-ink/40 bg-white/70 p-3">
        <p className="font-satoshi text-sm text-studojo-muted">No reply drafted yet. Senpai writes two to four lines from what it knows about you, then you send it from Gmail.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" icon={<FiZap />} onClick={draftIt}>
            {sim.id === "rp-1" ? "Answer Karan" : sim.id === "rp-2" ? "Say yes and prep me" : "Draft a reply"}
          </Button>
        </div>
      </div>
    );
  }

  const save = () => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length) dispatch({ type: "SET_REPLY_DRAFT", id: sim.id, draft: lines });
    setEditing(false);
  };

  return (
    <div className="rounded-2xl border-2 border-studojo-ink bg-white p-3 shadow-[3px_3px_0_0_#ec4899]">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <SkillChip skill="inbox" />
        <span className="font-satoshi text-sm font-bold">Senpai's draft reply</span>
        <span className="font-satoshi text-xs text-studojo-muted">to {p.first}</span>
      </div>
      {editing ? (
        <div>
          <label htmlFor={`rd-${sim.id}`} className="sr-only">
            Edit the reply
          </label>
          <textarea
            id={`rd-${sim.id}`}
            autoFocus
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={cx("w-full rounded-lg border-2 border-studojo-ink px-3 py-2 font-satoshi text-base leading-relaxed", FOCUS_RING)}
          />
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={save}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5 rounded-xl bg-studojo-pink-bg/50 px-3 py-2 font-satoshi text-[15px] leading-relaxed">
          {state.draft.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      )}
      {!editing ? (
        <AnimatePresence mode="wait" initial={false}>
          {state.savedToGmail ? (
            <motion.p
              key="saved"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={QUICK}
              role="status"
              className="mt-3 flex items-start gap-2 rounded-xl border-2 border-studojo-ink bg-studojo-green-bg px-3 py-2 font-satoshi text-sm font-bold text-[#047857]"
            >
              <FiCheckCircle aria-hidden className="mt-0.5 shrink-0" />
              {COPY.savedToGmail}
            </motion.p>
          ) : (
            <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={QUICK} className="mt-3 flex flex-wrap items-center gap-2">
              <Button size="sm" icon={<FiInbox />} onClick={() => dispatch({ type: "SAVE_TO_GMAIL", id: sim.id })}>
                Put in Gmail drafts
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon={<FiEdit3 />}
                onClick={() => {
                  setText(state.draft?.join("\n") ?? "");
                  setEditing(true);
                }}
              >
                Edit
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      ) : null}
      <p className="mt-2 font-satoshi text-xs text-studojo-muted">{COPY.neverReplies}</p>
    </div>
  );
}

/** I got an interview, I got an offer (with the no-fee stamp), and Remind me. */
export function Outcomes({ state, p }: { state: ReplyState; p: Person }) {
  const { s, dispatch } = useB2C();
  const reduced = useSafeReducedMotion();
  const [remind, setRemind] = useState(false);
  const opts = [1, 3, 7].map((n) => ({ n, label: dayDate(s.day + n).label }));
  return (
    <section aria-label="Outcome" className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={state.outcome === "interview" ? "dark" : "secondary"} icon={<FiPhoneCall />} aria-pressed={state.outcome === "interview"} onClick={() => dispatch({ type: "LOG_OUTCOME", personId: p.id, outcome: "interview" })}>
          I got an interview
        </Button>
        <Button size="sm" variant={state.outcome === "offer" ? "dark" : "secondary"} icon={<FiAward />} aria-pressed={state.outcome === "offer"} onClick={() => dispatch({ type: "LOG_OUTCOME", personId: p.id, outcome: "offer" })}>
          I got an offer
        </Button>
        <Button size="sm" variant="ghost" icon={<FiBell />} aria-expanded={remind} onClick={() => setRemind((v) => !v)}>
          {state.remindOn ? `Remind me: ${state.remindOn}` : "Remind me"}
        </Button>
      </div>
      <AnimatePresence initial={false}>
        {remind ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={QUICK} className="overflow-hidden">
            <div role="group" aria-label="Remind me on" className="flex flex-wrap items-center gap-2">
              {opts.map((o) => (
                <button
                  key={o.n}
                  type="button"
                  aria-pressed={state.remindOn === o.label}
                  onClick={() => {
                    dispatch({ type: "REMIND_REPLY", id: state.id, on: o.label });
                    dispatch({ type: "TOAST", text: `Reminder set for ${o.label} (Simulated). It shows up in Today.` });
                    setRemind(false);
                  }}
                  className={cx(
                    "min-h-11 rounded-full border-2 border-studojo-ink px-3 font-satoshi text-sm font-bold",
                    state.remindOn === o.label ? "bg-studojo-ink text-white" : "bg-white",
                    FOCUS_RING,
                  )}
                >
                  {o.n === 1 ? "Tomorrow" : o.n === 3 ? "In 3 days" : "In a week"} · {o.label}
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {state.outcome ? (
        <motion.div
          key={state.outcome}
          variants={stampVariants(reduced)}
          initial="hidden"
          animate="show"
          role="status"
          className="inline-flex max-w-full items-center gap-2 rounded-xl border-[3px] border-[#047857] bg-studojo-green-bg px-3 py-2 font-clash text-base font-semibold text-[#047857] shadow-[3px_3px_0_0_#047857]"
        >
          <FiAward aria-hidden className="shrink-0" />
          <span>
            {COPY.noFee} <SimNote className="ml-1 align-middle" />
          </span>
        </motion.div>
      ) : null}
    </section>
  );
}

/** Bounces and failed sends, collapsed. Every credit for a failed send comes back. All Sample. */
export function DeliveryGroup({ forceOpen = false }: { forceOpen?: boolean }) {
  const { s } = useB2C();
  const [open, setOpen] = useState(false);
  const shown = open || forceOpen;
  const sent = snapshot(s).sent;
  const people = s.people.filter((p) => p.missionId === s.env && p.source === "extra" && p.firstDay !== undefined && p.firstDay <= s.day).slice(0, GIVEN_BACK);
  if (!sent || !people.length) {
    return forceOpen ? <p className="rounded-2xl border-2 border-dashed border-studojo-ink/40 bg-white/70 p-4 font-satoshi text-sm text-studojo-muted">No delivery problems in this mission. Nothing sent here yet, or nothing bounced.</p> : null;
  }
  return (
    <section aria-labelledby="rp-delivery" className="rounded-2xl border-2 border-studojo-ink bg-white">
      <h3 id="rp-delivery">
        <button
          type="button"
          aria-expanded={shown}
          onClick={() => setOpen((v) => !v)}
          className={cx("flex min-h-12 w-full items-center gap-2 rounded-2xl px-3 text-left font-satoshi text-sm font-bold", FOCUS_RING)}
        >
          <FiAlertCircle aria-hidden className="text-[#92400e]" />
          Delivery · {people.length} bounced, {people.length} credit{people.length === 1 ? "" : "s"} given back
          <SimNote kind="sample" className="ml-1" />
          <span className="flex-1" />
          {forceOpen ? null : <FiChevronDown aria-hidden className={cx("transition-transform", shown && "rotate-180")} />}
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {shown ? (
          <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={QUICK} className="overflow-hidden border-t-2 border-studojo-ink/10">
            {people.map((p) => (
              <li key={p.id} className="flex items-start gap-3 px-3 py-2.5 font-satoshi text-sm">
                <span className="min-w-0 flex-1">
                  <span className="font-bold">
                    {p.first} at {p.company}
                  </span>
                  <span className="block text-studojo-muted">The address bounced on Day {p.firstDay}. Senpai stopped this thread.</span>
                </span>
                <span className="shrink-0 rounded-full border-2 border-studojo-ink bg-studojo-green-bg px-2 py-0.5 text-xs font-bold text-[#047857]">Credit given back</span>
              </li>
            ))}
            <li className="px-3 pb-3 font-satoshi text-xs text-studojo-muted">A bounced email never uses up your pack.</li>
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
