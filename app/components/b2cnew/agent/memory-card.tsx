// One memory card: solid when a resume line or quiz answer backs it, dashed
// "Your word" when you only said it. Source chip (opens the resume line),
// Use in emails, Edit and Forget. Forget and switching emails off send the
// affected unsent drafts back to Approvals as diffs.
import { useState } from "react";
import { motion } from "framer-motion";
import { FiEdit2, FiFileText, FiMessageCircle, FiTrash2 } from "react-icons/fi";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { QUICK, useSafeReducedMotion } from "../motion";
import type { MemoryItem } from "../types";
import { cx, EvidenceChip, FOCUS_RING } from "../ui";
import { ChipButton } from "./bits";
import { draftsUsing, forgetDiffs, plural } from "./flows/helpers";

const KIND_LABEL: Record<MemoryItem["source"]["kind"], string> = { resume: "From your resume", quiz: "Quiz answer", chat: "You said", reply: "From a reply" };

export function MemoryCard({ item }: { item: MemoryItem }) {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const reduced = useSafeReducedMotion();
  const [mode, setMode] = useState<"view" | "edit" | "forget">("view");
  const [text, setText] = useState(item.text);
  const word = item.proof === "your-word";
  const affected = draftsUsing(s, item).length;

  const rewrite = () => {
    for (const a of forgetDiffs(s, item)) dispatch(a);
  };
  const forget = () => {
    const n = forgetDiffs(s, item).length;
    rewrite();
    dispatch({ type: "FORGET_MEMORY", id: item.id });
    agent.note(
      n
        ? `Forgot "${item.text}". ${plural(n, "unsent draft")} changed; they are back in Approvals as rewrites for you to approve.`
        : `Forgot "${item.text}". No unsent draft used it.`,
    );
  };
  const toggleEmails = () => {
    const on = !item.useInEmails;
    dispatch({ type: "UPDATE_MEMORY", id: item.id, patch: { useInEmails: on } });
    if (!on) {
      const n = forgetDiffs(s, item).length;
      rewrite();
      agent.note(n ? `Out of emails now. ${plural(n, "unsent draft")} changed and wait in Approvals as rewrites.` : "Out of emails now. No unsent draft used it.");
    } else agent.note(`"${item.text}" can go in new drafts again.`);
  };
  const saveEdit = () => {
    const t = text.trim();
    if (!t || t === item.text) return setMode("view");
    const demote = item.kind === "fact" && !word;
    dispatch({ type: "UPDATE_MEMORY", id: item.id, patch: demote ? { text: t, proof: "your-word", useInEmails: false } : { text: t } });
    if (demote) agent.note("Edited. A resume line no longer backs those exact words, so it is your word now and stays out of emails.");
    setMode("view");
  };

  return (
    <motion.li
      layout={!reduced}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      transition={QUICK}
      className={cx(
        "rounded-2xl border-2 px-3 py-2.5",
        item.kind === "rule" ? "border-studojo-ink bg-studojo-yellow-bg" : word ? "border-dashed border-studojo-ink/60 bg-white" : "border-studojo-ink bg-white shadow-[2px_2px_0_0_#191a23]",
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {word && item.kind === "fact" ? (
          <span className="rounded-md border-2 border-dashed border-studojo-ink/60 px-1.5 font-satoshi text-[11px] font-bold leading-4 text-studojo-ink">Your word</span>
        ) : null}
        {item.source.lineId ? (
          <EvidenceChip lineId={item.source.lineId} label={item.source.label} />
        ) : (
          <span className="inline-flex min-h-8 items-center gap-1 rounded-lg border-2 border-studojo-ink/20 bg-studojo-surface-muted px-2 font-satoshi text-xs font-bold text-studojo-muted">
            {item.source.kind === "chat" ? <FiMessageCircle aria-hidden /> : <FiFileText aria-hidden />}
            {item.source.kind === "resume" ? item.source.label : `${KIND_LABEL[item.source.kind]} · ${item.source.label}`}
          </span>
        )}
      </div>

      {mode === "edit" ? (
        <div className="mt-2">
          <label htmlFor={`mem-${item.id}`} className="sr-only">
            Edit memory
          </label>
          <textarea
            id={`mem-${item.id}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                saveEdit();
              }
              if (e.key === "Escape") {
                e.stopPropagation();
                setMode("view");
              }
            }}
            rows={2}
            autoFocus
            className={cx("w-full resize-none rounded-xl border-2 border-studojo-ink px-2 py-1.5 font-satoshi text-base", FOCUS_RING)}
          />
          {item.kind === "fact" && !word ? <p className="mt-1 font-satoshi text-xs text-studojo-muted">Changing the words makes it your word, so it stays out of emails.</p> : null}
          <div className="mt-1.5 flex gap-1.5">
            <ChipButton tone="primary" onClick={saveEdit}>Save</ChipButton>
            <ChipButton onClick={() => { setText(item.text); setMode("view"); }}>Cancel</ChipButton>
          </div>
        </div>
      ) : (
        <p className={cx("mt-1.5 font-satoshi text-[15px] font-bold leading-snug", word && item.kind === "fact" ? "text-studojo-ink/80" : "text-studojo-ink")}>{item.text}</p>
      )}

      {mode === "forget" ? (
        <div role="alert" className="mt-2 rounded-xl border-2 border-studojo-ink bg-studojo-pink-bg px-2.5 py-2">
          <p className="font-satoshi text-sm text-studojo-ink">
            Forget this? {affected ? `Changes ${plural(affected, "unsent draft")}. They go back to Approvals as rewrites.` : "No unsent draft uses it."}
          </p>
          <div className="mt-1.5 flex gap-1.5">
            <ChipButton tone="primary" onClick={forget}>Yes, forget it</ChipButton>
            <ChipButton onClick={() => setMode("view")}>Keep it</ChipButton>
          </div>
        </div>
      ) : mode === "view" ? (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          {item.kind === "fact" ? (
            <button
              type="button"
              role="switch"
              aria-checked={item.useInEmails}
              disabled={word}
              title={word ? "Your word stays out of emails until a resume line backs it" : undefined}
              onClick={toggleEmails}
              className={cx("inline-flex min-h-9 items-center gap-2 rounded-lg font-satoshi text-xs font-bold text-studojo-ink disabled:cursor-not-allowed disabled:text-studojo-muted", FOCUS_RING)}
            >
              <span aria-hidden className={cx("relative h-5 w-9 rounded-full border-2 border-studojo-ink transition-colors", item.useInEmails ? "bg-studojo-purple" : "bg-studojo-surface-muted")}>
                <span className={cx("absolute top-0.5 h-3 w-3 rounded-full border-2 border-studojo-ink bg-white transition-[left]", item.useInEmails ? "left-[18px]" : "left-0.5")} />
              </span>
              {word ? "Out of emails" : "Use in emails"}
            </button>
          ) : (
            <span className="font-satoshi text-xs text-[#854d0e]">Senpai checks every new match against this.</span>
          )}
          <span className="flex-1" />
          <button type="button" onClick={() => { setText(item.text); setMode("edit"); }} className={cx("inline-flex min-h-9 items-center gap-1 rounded-lg px-1.5 font-satoshi text-xs font-bold text-studojo-muted hover:text-studojo-ink", FOCUS_RING)}>
            <FiEdit2 aria-hidden /> Edit
          </button>
          <button type="button" onClick={() => setMode("forget")} className={cx("inline-flex min-h-9 items-center gap-1 rounded-lg px-1.5 font-satoshi text-xs font-bold text-studojo-muted hover:text-[#be185d]", FOCUS_RING)}>
            <FiTrash2 aria-hidden /> Forget
          </button>
        </div>
      ) : null}
      {mode === "view" && affected > 0 && item.useInEmails ? (
        <p className="mt-1 font-satoshi text-[11px] text-studojo-muted">In {plural(affected, "unsent draft")}</p>
      ) : null}
    </motion.li>
  );
}
