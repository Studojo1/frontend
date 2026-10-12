// One draft in the approval stack: recipient, why, subject, body with
// evidence underlines, the Day 0, 4, 9 timeline and the cost. Also the
// editing and rewritten (word diff) states.
import { useState, type ReactNode } from "react";
import { FiCheck, FiCheckCircle, FiCreditCard, FiEdit3, FiMessageCircle, FiShield, FiSkipForward, FiZap } from "react-icons/fi";
import { needsCredit, personById } from "../core/derive";
import { chipFor, useAgent } from "../core/engine";
import { useB2C, useMission } from "../core/store";
import { buildEmailSequence, evidenceIn, fullName, matchFor, PAGE_URL } from "../data";
import type { Draft, Person } from "../types";
import { Avatar, Button, cx, FOCUS_RING, Kbd, POINTER_FINE, SimNote } from "../ui";
import { DiffBody, EmailBody, SequenceTimeline } from "./email-body";
import { changedWords, diffParagraphs, KIND_LABEL } from "./helpers";

export const draftLabel = (d: Draft, p?: Person) => `${KIND_LABEL[d.kind]} to ${p ? `${p.first}, ${p.company}` : "them"}`;

/** The card's top: who it goes to, why, the cost. Also used by the peeking cards. */
export function Recipient({ d, p }: { d: Draft; p?: Person }) {
  const { s } = useB2C();
  const m = useMission();
  if (!p) return null;
  const broke = needsCredit(s, d);
  const willSend = m.notch === 3 && d.kind === "first" && p.fit >= m.fitFloor;
  return (
    <div className="flex items-start gap-3">
      <Avatar first={p.first} last={p.last} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-clash text-lg font-semibold leading-tight text-studojo-ink">{fullName(p)}</p>
        <p className="truncate font-satoshi text-sm text-studojo-muted">
          {p.title}, {p.company} · {p.city}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-satoshi text-xs">
          <span className={cx("inline-flex items-center gap-1 font-bold", p.address === "verified" ? "text-[#047857]" : "text-[#92400e]")}>
            <FiShield aria-hidden />
            {p.address === "verified" ? "Verified address" : "Risky address"}
          </span>
          <span className="text-studojo-muted">
            Fit {p.fit} <SimNote kind="sample" className="ml-0.5" />
          </span>
          {willSend ? <span className="rounded-full border border-studojo-ink bg-[#ccfbf1] px-1.5 font-bold text-[#0f766e]">Will send, inside the cap</span> : null}
        </p>
      </div>
      <span className={cx("shrink-0 rounded-full border-2 border-studojo-ink px-2 py-0.5 font-satoshi text-xs font-bold", broke ? "bg-studojo-orange-bg text-[#92400e]" : d.kind === "first" ? "bg-studojo-yellow-bg text-[#854d0e]" : "bg-studojo-green-bg text-[#047857]")}>
        {broke ? "Needs a credit" : d.kind === "first" ? "1 credit" : "Free"}
      </span>
    </div>
  );
}

interface CardProps {
  d: Draft;
  onApprove: () => void;
  onSkip: () => void;
  editing: boolean;
  setEditing: (v: boolean) => void;
  /** In the stack: the action row sticks to the bottom of the view and spans the card's edge. */
  pinActions?: boolean;
}

/** The full card for the top of the stack (and the list view's expanded row). */
export function ApprovalCardBody({ d, onApprove, onSkip, editing, setEditing, pinActions }: CardProps) {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const m = useMission(d.missionId);
  const p = personById(s, d.personId);
  const [view, setView] = useState<Draft["kind"]>(d.kind);
  if (!p) return null;
  const label = draftLabel(d, p);
  const broke = needsCredit(s, d);
  // With no credit left, Approve becomes the way to get one (the wallet: top up, or fund a new mission).
  const topUp = () => dispatch({ type: "SHEET", sheet: "wallet" });
  const preview = view !== d.kind ? buildEmailSequence(m.target, matchFor(p), PAGE_URL, s.page.live).find((e) => e.id === view) : undefined;
  const warmer = () => {
    dispatch({ type: "FOCUS", item: chipFor.draft(d, label) });
    agent.open({ focus: false });
    agent.start("F7", { draftId: d.id, personId: p.id });
  };

  return (
    <div className="flex flex-col gap-3">
      <Recipient d={d} p={p} />
      <p className="rounded-xl bg-studojo-surface-muted px-3 py-2 font-satoshi text-sm text-studojo-ink">
        <span className="font-bold">Why them: </span>
        {p.why}
      </p>

      {editing ? (
        <DraftEditor d={d} onDone={() => setEditing(false)} onRewrite={warmer} />
      ) : d.diff ? (
        <RewriteView d={d} />
      ) : (
        <div className="rounded-xl border-2 border-studojo-ink bg-white p-3">
          <p className="font-satoshi text-sm">
            <span className="text-studojo-muted">Subject: </span>
            <span className="font-bold">{preview ? preview.subject : d.subject}</span>
          </p>
          <div className="my-2 h-px bg-studojo-ink/10" />
          {preview ? (
            <>
              <p className="mb-2 font-satoshi text-xs font-bold text-studojo-muted">Preview: goes {preview.day} days after the first email, only if they have not replied.</p>
              <EmailBody paragraphs={preview.paragraphs} evidence={evidenceIn(preview.paragraphs)} signoff={preview.signoff} clamp />
              {preview.pageCard ? (
                <p className="mt-2 rounded-lg border-2 border-dashed border-studojo-purple bg-studojo-purple-bg px-2 py-1.5 font-satoshi text-xs font-bold text-studojo-purple-strong">Your page card: {PAGE_URL}</p>
              ) : null}
            </>
          ) : (
            <EmailBody paragraphs={d.paragraphs} evidence={d.evidence} signoff={d.signoff} clamp />
          )}
        </div>
      )}

      {!editing ? (
        <>
          <SequenceTimeline kind={d.kind} view={view} onPick={setView} pageLive={s.page.live} />
          <p className="font-satoshi text-xs text-studojo-muted">
            {d.evidence.length ? `${d.evidence.length} line${d.evidence.length === 1 ? "" : "s"} backed by your resume. Tap an underline to see it.` : "No resume claims in this one."}
          </p>
          {d.diff ? null : (
            <>
              {/* Senpai lives here on the Approvals tab (the floating pill steps aside on phones). */}
              <div className="flex flex-wrap items-center gap-1">
                <Button variant="ghost" size="sm" icon={<FiZap />} onClick={warmer}>
                  Make this warmer
                </Button>
                <Button variant="ghost" size="sm" icon={<FiMessageCircle />} onClick={() => agent.open({ attach: chipFor.draft(d, label) })} aria-label={`Ask Senpai about the ${label}`}>
                  Ask Senpai
                </Button>
              </div>
              {broke ? (
                <p className="font-satoshi text-xs font-bold text-[#92400e]">
                  Your pack has no credits left. This one waits until you top up. Skipping still costs nothing.
                </p>
              ) : null}
              {/* The actions stay in reach: pinned to the bottom of the view while the card is on screen. */}
              <div
                data-card-actions
                className={cx(
                  "flex items-center gap-2",
                  pinActions &&
                    "sticky bottom-[calc(4.75rem_+_env(safe-area-inset-bottom))] z-10 -mx-4 -mb-4 rounded-b-2xl border-t-2 border-studojo-ink/10 bg-white/95 px-4 pb-4 pt-3 backdrop-blur sm:-mx-5 sm:-mb-5 sm:px-5 sm:pb-5 lg:bottom-0",
                )}
              >
                <ActionButton tone="skip" kbd="S" onClick={onSkip} icon={<FiSkipForward />}>Skip</ActionButton>
                <ActionButton tone="edit" kbd="E" onClick={() => setEditing(true)} icon={<FiEdit3 />}>Edit</ActionButton>
                {broke ? (
                  <ActionButton tone="approve" kbd="A" onClick={topUp} icon={<FiCreditCard />}>Top up to approve</ActionButton>
                ) : (
                  <ActionButton tone="approve" kbd="A" onClick={onApprove} icon={<FiCheck />}>Approve</ActionButton>
                )}
              </div>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}

const ACTION_TONE = {
  skip: "bg-white text-studojo-ink",
  edit: "bg-studojo-yellow-bg text-studojo-ink",
  approve: "bg-studojo-purple-strong text-white",
};

function ActionButton({ tone, kbd, onClick, icon, children }: { tone: keyof typeof ACTION_TONE; kbd: string; onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-keyshortcuts={kbd}
      className={cx(
        "inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-studojo-ink px-3 font-satoshi text-base font-bold shadow-brutal transition-[transform,box-shadow] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#191a23] sm:flex-none",
        ACTION_TONE[tone],
        FOCUS_RING,
      )}
    >
      <span aria-hidden>{icon}</span>
      {children}
      <span className={cx(POINTER_FINE, "ml-1")}>
        <Kbd className={tone === "approve" ? "border-white/70 bg-white/15 text-white shadow-none" : undefined}>{kbd}</Kbd>
      </span>
    </button>
  );
}

/** Editing: subject and paragraphs, Save or Cancel, or ask Senpai to rewrite. */
function DraftEditor({ d, onDone, onRewrite }: { d: Draft; onDone: () => void; onRewrite: () => void }) {
  const { dispatch } = useB2C();
  const [subject, setSubject] = useState(d.subject);
  const [paras, setParas] = useState(d.paragraphs);
  const dirty = subject !== d.subject || paras.some((p, i) => p !== d.paragraphs[i]);
  const save = () => {
    dispatch({ type: "EDIT_DRAFT", id: d.id, subject: subject.trim() || d.subject, paragraphs: paras.map((p) => p.trim()).filter(Boolean) });
    dispatch({ type: "TOAST", text: "Saved your edit. Underlines rechecked against your resume." });
    onDone();
  };
  return (
    <form
      className="flex flex-col gap-2 rounded-xl border-2 border-studojo-ink bg-studojo-yellow-bg/50 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onDone();
        }
      }}
    >
      <label className="font-satoshi text-xs font-bold text-studojo-muted" htmlFor={`subj-${d.id}`}>
        Subject
      </label>
      <input
        id={`subj-${d.id}`}
        data-autofocus
        autoFocus
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className={cx("min-h-11 w-full rounded-lg border-2 border-studojo-ink bg-white px-3 font-satoshi text-base", FOCUS_RING)}
      />
      {paras.map((p, i) => (
        <div key={i}>
          <label className="sr-only" htmlFor={`para-${d.id}-${i}`}>
            Paragraph {i + 1}
          </label>
          <textarea
            id={`para-${d.id}-${i}`}
            value={p}
            rows={Math.max(1, Math.ceil(p.length / 46))}
            onChange={(e) => setParas((xs) => xs.map((x, j) => (j === i ? e.target.value : x)))}
            className={cx("w-full resize-y rounded-lg border-2 border-studojo-ink bg-white px-3 py-2 font-satoshi text-base leading-relaxed", FOCUS_RING)}
          />
        </div>
      ))}
      <p className="font-satoshi text-xs text-studojo-muted">Keep it true. Anything your resume backs gets underlined again when you save.</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" icon={<FiCheck />} disabled={!dirty}>
          Save edit
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <button
          type="button"
          onClick={onRewrite}
          className={cx("inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-studojo-ink bg-studojo-purple-bg px-3 font-satoshi text-sm font-bold text-studojo-purple-strong", FOCUS_RING)}
        >
          <FiZap aria-hidden />
          Ask Senpai to rewrite
        </button>
      </div>
    </form>
  );
}

/** Rewritten by Senpai: a word diff with Approve rewrite or Keep mine. */
function RewriteView({ d }: { d: Draft }) {
  const { dispatch } = useB2C();
  if (!d.diff) return null;
  const n = changedWords(diffParagraphs(d.diff.before, d.diff.after));
  return (
    <div className="rounded-xl border-2 border-studojo-purple bg-white p-3 shadow-[3px_3px_0_0_#8b5cf6]">
      <p className="mb-2 flex flex-wrap items-center gap-2 font-satoshi text-sm font-bold text-studojo-purple-strong">
        <FiZap aria-hidden />
        Senpai rewrote this. {n} new word{n === 1 ? "" : "s"}, every fact kept.
      </p>
      <DiffBody before={d.diff.before} after={d.diff.after} />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" icon={<FiCheckCircle />} onClick={() => dispatch({ type: "APPLY_DIFF", id: d.id, keep: "after" })}>
          Approve rewrite
        </Button>
        <Button size="sm" variant="secondary" onClick={() => dispatch({ type: "APPLY_DIFF", id: d.id, keep: "before" })}>
          Keep mine
        </Button>
      </div>
      <p className="mt-2 font-satoshi text-xs text-studojo-muted">Taking the rewrite does not send it. You still approve the email.</p>
    </div>
  );
}
