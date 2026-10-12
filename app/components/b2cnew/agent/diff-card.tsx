// The diff card: a word diff of a rewritten draft (F7, Forget) or of a new
// page headline (F9), with Approve or Keep mine. The same diff shows in
// Approvals or Page, so either place can settle it.
import { FiCheck, FiExternalLink } from "react-icons/fi";
import { draftById, personById } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import type { ChatMsg } from "../types";
import { EvidenceChip } from "../ui";
import { SenpaiShell } from "./cards";
import { ChipButton, DiffText, wordDiff } from "./bits";

type DiffMsg = Extract<ChatMsg, { kind: "diff" }>;

export function DiffCard({ m }: { m: DiffMsg }) {
  return m.target === "page" ? <PageDiff m={m} /> : <DraftDiff m={m} />;
}

function Head({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-2">
      <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-purple-strong">{kicker}</p>
      <p className="font-satoshi text-sm font-bold text-studojo-ink">{title}</p>
    </div>
  );
}

function Settled({ text }: { text: string }) {
  return (
    <p className="mt-2 inline-flex items-center gap-1.5 font-satoshi text-xs font-bold text-studojo-muted">
      <FiCheck aria-hidden className="text-[#047857]" /> {text}
    </p>
  );
}

function DraftDiff({ m }: { m: DiffMsg }) {
  const { s, dispatch, viewport } = useB2C();
  const agent = useAgent();
  const d = draftById(s, m.refId);
  const p = personById(s, d?.personId);
  if (!d || !p) return null;
  const settle = (keep: "after" | "before") => {
    dispatch({ type: "APPLY_DIFF", id: d.id, keep });
    dispatch({ type: "CHAT_UPDATE", id: m.id, patch: { resolved: keep === "after" ? "Used the rewrite" : "Kept yours" } });
  };
  const openIt = () => {
    dispatch({ type: "SET_TAB", tab: "approvals" });
    dispatch({ type: "FOCUS", item: { kind: "draft", id: d.id, label: `Draft to ${p.first}, ${p.company}` } });
    if (viewport !== "wide") agent.close();
  };
  const pending = !m.resolved && !!d.diff && d.status === "pending";
  return (
    <SenpaiShell>
      <Head kicker="Rewrite · word diff" title={`${d.kind === "first" ? "First email" : d.kind === "follow" ? "Follow-up" : "Nudge"} to ${p.first}, ${p.company}`} />
      {pending && d.diff ? (
        <>
          <div className="max-h-64 overflow-y-auto rounded-xl border-2 border-studojo-ink/15 bg-white px-2.5 py-2">
            <DiffText parts={wordDiff(d.diff.before.join("\n\n"), d.diff.after.join("\n\n"))} />
          </div>
          <p className="mt-1.5 font-satoshi text-xs text-studojo-muted">Violet is new. Struck through is gone. Every fact still has its resume line.</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <ChipButton tone="primary" icon={<FiCheck />} onClick={() => settle("after")}>
              Use the rewrite
            </ChipButton>
            <ChipButton onClick={() => settle("before")}>Keep mine</ChipButton>
            <ChipButton tone="soft" icon={<FiExternalLink />} onClick={openIt}>
              Open in Approvals
            </ChipButton>
          </div>
        </>
      ) : (
        <Settled text={m.resolved ?? (d.status === "pending" ? "Settled in Approvals" : "This draft is no longer waiting")} />
      )}
    </SenpaiShell>
  );
}

function PageDiff({ m }: { m: DiffMsg }) {
  const { s, dispatch } = useB2C();
  const after = s.page.pendingHeadline;
  const settle = (keep: boolean) => {
    if (keep && after) dispatch({ type: "SET_PAGE", patch: { headline: after, pendingHeadline: undefined }, note: "Approved the new headline" });
    else dispatch({ type: "SET_PAGE", patch: { pendingHeadline: undefined }, note: "Kept your headline" });
    dispatch({ type: "CHAT_UPDATE", id: m.id, patch: { resolved: keep ? "Approved the new headline" : "Kept your headline" } });
  };
  return (
    <SenpaiShell>
      <Head kicker="Page · headline" title="Your page headline" />
      {!m.resolved && after ? (
        <>
          <div className="rounded-xl border-2 border-studojo-ink/15 bg-white px-2.5 py-2">
            <DiffText parts={wordDiff(s.page.headline, after)} className="font-clash text-base" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="font-satoshi text-xs text-studojo-muted">Backed by</span>
            <EvidenceChip lineId="r-proj-1-a" label="1,200 students" />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <ChipButton tone="primary" icon={<FiCheck />} onClick={() => settle(true)}>
              Approve
            </ChipButton>
            <ChipButton onClick={() => settle(false)}>Keep mine</ChipButton>
            <ChipButton tone="soft" icon={<FiExternalLink />} onClick={() => dispatch({ type: "SET_TAB", tab: "page" })}>
              See it in Page
            </ChipButton>
          </div>
        </>
      ) : (
        <Settled text={m.resolved ?? `Settled in Page. Headline: ${s.page.headline}`} />
      )}
    </SenpaiShell>
  );
}
