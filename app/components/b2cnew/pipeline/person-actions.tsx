// What you can do about one person: approve or skip their draft, swap them,
// snooze, never contact, log an interview or offer, or ask Senpai.
// Every change goes through dispatch. Owned by Group 2.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAward, FiCheck, FiCreditCard, FiHelpCircle, FiInbox, FiMessageCircle, FiMoon, FiRefreshCw, FiSlash, FiSkipForward, FiStar } from "react-icons/fi";
import { COPY } from "../config";
import { needsCredit, type PersonView } from "../core/derive";
import { chipFor, useAgent } from "../core/engine";
import { useB2C, useMission } from "../core/store";
import { QUICK, stampVariants, useSafeReducedMotion } from "../motion";
import type { B2Action } from "../types";
import { Button, cx, FOCUS_RING } from "../ui";
import { alreadyContacted, SNOOZE_OPTIONS } from "./people-model";

export function PendingDraftCard({ v }: { v: PersonView }) {
  const { s, dispatch } = useB2C();
  const d = v.pendingDraft;
  if (!d) return null;
  const broke = needsCredit(s, d);
  return (
    <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-orange-bg p-3">
      <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-[#92400e]">
        {d.kind === "first" ? "First email" : d.kind === "follow" ? "Follow-up" : "Nudge"} waiting for you
      </p>
      <p className="mt-1 font-satoshi text-sm font-bold">"{d.subject}"</p>
      <p className="mt-0.5 line-clamp-2 font-satoshi text-sm text-studojo-muted">{d.paragraphs[0]}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {broke ? (
          <Button size="sm" icon={<FiCreditCard />} onClick={() => dispatch({ type: "SHEET", sheet: "wallet" })}>
            Top up to approve
          </Button>
        ) : (
          <Button
            size="sm"
            icon={<FiCheck />}
            onClick={() => {
              dispatch({ type: "APPROVE_DRAFT", id: d.id });
              dispatch({ type: "TOAST", text: `Approved. ${d.kind === "first" ? "1 credit reserved." : "Free, it is a follow-up."}`, undo: { type: "UNAPPROVE_DRAFT", id: d.id } });
            }}
          >
            Approve
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          icon={<FiSkipForward />}
          onClick={() => {
            dispatch({ type: "SKIP_DRAFT", id: d.id });
            dispatch({ type: "TOAST", text: "Skipped. No credit used.", undo: { type: "RESTORE_DRAFT", id: d.id } });
          }}
        >
          Skip
        </Button>
        <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "SET_TAB", tab: "approvals" })}>
          Read it in Approvals
        </Button>
      </div>
    </div>
  );
}

export function PersonActions({ v }: { v: PersonView }) {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const mission = useMission();
  const [menu, setMenu] = useState<"snooze" | "never" | null>(null);
  const { p, stage } = v;
  const contacted = alreadyContacted(s, v);
  const canSwap = !contacted && (stage === "matched" || stage === "approved");
  const canOutcome = contacted && stage !== "closed" && stage !== "offer";
  const reply = s.replies.find((r) => r.personId === p.id);
  const run = (...as: B2Action[]) => as.forEach(dispatch);

  if (stage === "closed") {
    const listed = mission.neverContact.includes(p.id);
    return (
      <div className="rounded-2xl border-2 border-dashed border-studojo-ink/40 p-3 font-satoshi text-sm">
        <p>
          <b>Closed.</b> Nothing else goes to {p.first}.{listed ? " They are on your never-contact list for this mission." : ""}
        </p>
        <Button
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            run(
              { type: "SET_STAGE", id: p.id, stage: contacted ? "contacted" : "matched" },
              ...(listed ? [{ type: "UPDATE_MISSION", id: mission.id, patch: { neverContact: mission.neverContact.filter((x) => x !== p.id) }, note: `Took ${p.first} off the never-contact list` } as B2Action] : []),
            )
          }
        >
          Move back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stage === "later" ? (
        <p className="flex flex-wrap items-center gap-2 rounded-xl bg-studojo-orange-bg px-3 py-2 font-satoshi text-sm text-[#92400e]">
          <FiMoon aria-hidden />
          <span className="flex-1">Snoozed{p.snoozeUntil ? ` until ${p.snoozeUntil}` : ""}. Senpai reminds you then.</span>
          <button type="button" className={cx("min-h-9 rounded-lg px-2 font-bold underline", FOCUS_RING)} onClick={() => dispatch({ type: "SET_STAGE", id: p.id, stage: contacted ? "contacted" : "matched" })}>
            Wake now
          </button>
        </p>
      ) : null}
      {reply && v.reply ? (
        <Button
          size="sm"
          variant="secondary"
          icon={<FiInbox />}
          className="w-full"
          onClick={() => run({ type: "SET_TAB", tab: "replies" }, { type: "FOCUS", item: chipFor.reply(reply, `${p.first}, ${p.company}`) }, { type: "SEE_REPLY", id: reply.id })}
        >
          Open {p.first}'s reply
        </Button>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        {canSwap ? (
          <ActionTile
            icon={<FiRefreshCw />}
            label="Swap for someone else"
            onClick={() => {
              const approved = s.drafts.find((d) => d.personId === p.id && d.status === "approved");
              run(
                ...(approved ? [{ type: "UNAPPROVE_DRAFT", id: approved.id } as B2Action] : []),
                { type: "DROP_FROM_QUEUE", personIds: [p.id], close: true, reason: "swapped for someone else", by: "you" },
                { type: "SELECT", id: null },
              );
              agent.open({ focus: false });
              agent.start("F6", { personId: p.id, choice: "swap" });
            }}
          />
        ) : null}
        {stage !== "later" ? <ActionTile icon={<FiMoon />} label="Snooze" pressed={menu === "snooze"} onClick={() => setMenu(menu === "snooze" ? null : "snooze")} /> : null}
        <ActionTile icon={<FiSlash />} label="Never contact" tone="danger" pressed={menu === "never"} onClick={() => setMenu(menu === "never" ? null : "never")} />
        {canOutcome ? (
          <>
            {stage !== "interview" ? <ActionTile icon={<FiStar />} label="I got an interview" tone="good" onClick={() => dispatch({ type: "LOG_OUTCOME", personId: p.id, outcome: "interview" })} /> : null}
            <ActionTile icon={<FiAward />} label="I got an offer" tone="good" onClick={() => dispatch({ type: "LOG_OUTCOME", personId: p.id, outcome: "offer" })} />
          </>
        ) : null}
      </div>
      <AnimatePresence initial={false} mode="wait">
        {menu === "snooze" ? (
          <Reveal key="snooze">
            <p className="font-satoshi text-sm">Write to {p.first} again in:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SNOOZE_OPTIONS.map((until) => (
                <Button
                  key={until}
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setMenu(null);
                    run({ type: "SNOOZE", id: p.id, until }, { type: "TOAST", text: `Snoozed until ${until}. Unsent emails to ${p.first} dropped.` });
                  }}
                >
                  {until}
                </Button>
              ))}
            </div>
          </Reveal>
        ) : menu === "never" ? (
          <Reveal key="never">
            <p className="font-satoshi text-sm">
              {p.first} moves to Closed, any unsent email drops, and Senpai never writes to them from this mission.
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="dark"
                onClick={() => {
                  setMenu(null);
                  run({ type: "NEVER_CONTACT", id: p.id }, { type: "TOAST", text: `${p.first} is on your never-contact list.` });
                }}
              >
                Never contact {p.first}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setMenu(null)}>
                Cancel
              </Button>
            </div>
          </Reveal>
        ) : null}
      </AnimatePresence>
      <div className="flex flex-wrap gap-2 border-t-2 border-studojo-ink/10 pt-3">
        <Button size="sm" variant="secondary" icon={<FiMessageCircle />} onClick={() => agent.open({ attach: chipFor.person(p) })}>
          Ask Senpai
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={<FiHelpCircle />}
          onClick={() => {
            agent.open({ attach: chipFor.person(p), focus: false });
            agent.start("F5", { personId: p.id });
          }}
        >
          Why this person?
        </Button>
      </div>
    </div>
  );
}

function ActionTile({ icon, label, onClick, tone = "plain", pressed }: { icon: ReactNode; label: string; onClick: () => void; tone?: "plain" | "good" | "danger"; pressed?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cx(
        "flex min-h-12 items-center gap-2 rounded-xl border-2 border-studojo-ink px-3 py-2 text-left font-satoshi text-sm font-bold shadow-[2px_2px_0_0_#171717]",
        "transition-[transform,box-shadow] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        tone === "good" ? "bg-studojo-green-bg" : tone === "danger" ? "bg-white text-[#be185d]" : "bg-white",
        pressed && "bg-studojo-ink text-white",
        FOCUS_RING,
      )}
    >
      <span aria-hidden className="shrink-0 text-base">{icon}</span>
      <span className="min-w-0">{label}</span>
    </button>
  );
}

function Reveal({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={QUICK}
      className="overflow-hidden"
    >
      <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-surface-muted p-3">{children}</div>
    </motion.div>
  );
}

/** The no-fee stamp, shown once an interview or offer is logged. */
export function OutcomeStamp({ v }: { v: PersonView }) {
  const reduced = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const shown = v.stage === "interview" || v.stage === "offer";
  // Bring the stamp into view when it lands (the button that logged it sits lower down).
  useEffect(() => {
    if (shown) ref.current?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [shown, v.stage]);
  if (v.stage !== "interview" && v.stage !== "offer") return null;
  return (
    <motion.div
      ref={ref}
      key={v.stage}
      variants={stampVariants(reduced)}
      initial="hidden"
      animate="show"
      role="status"
      className="mx-auto w-fit max-w-full rounded-2xl border-[3px] border-[#047857] bg-studojo-green-bg px-4 py-2 text-center"
    >
      <p className="font-clash text-lg font-semibold uppercase tracking-wide text-[#047857]">{v.stage === "offer" ? "Offer" : "Interview"}</p>
      <p className="font-satoshi text-sm font-bold text-[#047857]">{COPY.noFee}</p>
    </motion.div>
  );
}
