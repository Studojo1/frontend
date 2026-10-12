// One message in the thread: the student's bubble, or a reply with its tool
// lines, text, cards, drafts, tickets and suggestions. The live turn renders
// the same pieces from the stream, plus a thinking line and an inline error.
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { useDeskResource } from "~/lib/desk/cache";
import type { Card, Confirmation, Message, OutreachDetail, OutreachId, Step, Suggestion } from "~/lib/desk/types";
import { getOutreachDetail } from "./calls";
import { CardShell, ChipButton, cx, FOCUS_RING, PlainText, Spinner, StepRow } from "./bits";
import { CardView, ConfirmationCard } from "./cards";
import { DraftCard } from "./draft-card";
import { DraftsSummary } from "./drafts-summary";
import { serverDate, type LiveTurn } from "./live";
import { dismissError, retry, send } from "./runner";

export function UserBubble({ m }: { m: Message }) {
  return (
    <div className="flex justify-end pl-10">
      <p className="whitespace-pre-wrap break-words rounded-2xl rounded-tr-md border-2 border-studojo-ink bg-studojo-ink px-3 py-2 font-satoshi text-sm leading-relaxed text-white">
        <span className="sr-only">You: </span>
        {m.content}
      </p>
    </div>
  );
}

function Bubble({ text, typing }: { text: string; typing?: boolean }) {
  return (
    <div className="mr-6 rounded-2xl rounded-tl-md border-2 border-studojo-ink bg-white px-3 py-2">
      <span className="sr-only">Assistant: </span>
      <PlainText text={text} />
      {typing ? <span aria-hidden className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-studojo-purple align-middle motion-reduce:animate-none" /> : null}
    </div>
  );
}

function Steps({ steps, stopped }: { steps: Step[]; stopped?: boolean }) {
  if (!steps.length) return null;
  return (
    <ol aria-label="What I did" className="mr-6 rounded-xl border-2 border-dashed border-studojo-ink/20 bg-studojo-surface-muted/60 px-2.5 py-1.5">
      {steps.map((s) => (
        <StepRow key={s.call_id} step={s} stopped={stopped} />
      ))}
    </ol>
  );
}

/**
 * Cards, drafts and tickets under a reply. Several drafts become one summary
 * that points at Home, where the same rows sit under Needs you; one draft
 * keeps its card (compact on its own outreach page, see draft-card.tsx).
 */
function Extras({ cards, drafts, tickets, scope }: { cards: Card[]; drafts: OutreachId[]; tickets: Confirmation[]; scope: string }) {
  const unique = [...new Set(drafts)];
  return (
    <>
      {cards.map((c, i) => (
        <CardView key={`card-${i}`} card={c} scope={scope} />
      ))}
      {unique.length > 1 ? <DraftsSummary ids={unique} scope={scope} /> : unique.length === 1 ? <DraftCard id={unique[0]} scope={scope} /> : null}
      {tickets.map((c) => (
        <ConfirmationCard key={c.id} c={c} scope={scope} />
      ))}
    </>
  );
}

export function Suggestions({ items, scope, busy }: { items: Suggestion[]; scope: string; busy: boolean }) {
  if (!items.length) return null;
  return (
    <div role="group" aria-label="Suggestions" className="flex flex-wrap gap-1.5">
      {items.slice(0, 3).map((s) => (
        <ChipButton key={s.label} tone="soft" disabled={busy} onClick={() => send(scope, s.prompt)} title={s.prompt}>
          {s.label}
        </ChipButton>
      ))}
    </div>
  );
}

const STATUS_NOTE: Partial<Record<NonNullable<Message["status"]>, string>> = {
  cancelled: "Stopped. Anything finished before that is kept.",
  limit: "I stopped there because this turn ran long. Ask me to carry on.",
};

/**
 * On an outreach thread, chips such as "Approve it" go stale once the email
 * changed after the reply (approved or edited in the workspace): hide them.
 */
function useStaleOnScope(scope: string, createdAt: string): boolean {
  const id = scope.startsWith("outreach:") ? scope.slice("outreach:".length) : null;
  const when = useDeskResource<OutreachDetail>(id ? `outreach:${id}` : "outreach:none", () => getOutreachDetail(id ?? ""), { enabled: !!id }).data?.when;
  if (!id || !when) return false;
  const changed = serverDate(when)?.getTime() ?? 0;
  const said = serverDate(createdAt)?.getTime() ?? 0;
  return changed > said;
}

export function AssistantMessage({ m, scope, latest, busy }: { m: Message; scope: string; latest: boolean; busy: boolean }) {
  const note = m.status ? STATUS_NOTE[m.status] : undefined;
  const stale = useStaleOnScope(scope, m.created_at);
  return (
    <div className="space-y-2">
      <Steps steps={m.steps} stopped={m.status === "cancelled" || m.status === "limit"} />
      {m.content ? <Bubble text={m.content} /> : null}
      <Extras cards={m.cards} drafts={m.outreach_ids} tickets={m.confirmations} scope={scope} />
      {note ? <p className="font-satoshi text-xs text-studojo-muted">{note}</p> : null}
      {latest && !stale ? <Suggestions items={m.suggestions} scope={scope} busy={busy} /> : null}
    </div>
  );
}

function signInHref() {
  if (typeof window === "undefined") return "/auth";
  return `/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
}

export function LiveAssistant({ live, scope, hideTickets }: { live: LiveTurn; scope: string; hideTickets?: Set<string> }) {
  const text = live.finalContent ?? live.text;
  const working = live.phase !== "failed";
  const quiet = working && !text && !live.steps.length && !live.cards.length && !live.draftIds.length;
  return (
    <div className="space-y-2" aria-busy={working}>
      {quiet ? (
        <p className="flex items-center gap-2 font-satoshi text-sm text-studojo-muted">
          <Spinner />
          {live.phase === "resuming" ? "Picking up where I left off" : live.phase === "stopping" ? "Stopping" : "Thinking"}
        </p>
      ) : null}
      <Steps steps={live.steps} stopped={live.phase === "failed"} />
      {text ? <Bubble text={text} typing={working && live.finalContent === null} /> : null}
      <Extras cards={live.cards} drafts={live.draftIds} tickets={hideTickets ? live.confirmations.filter((c) => !hideTickets.has(c.id)) : live.confirmations} scope={scope} />
      {working && !quiet && live.phase === "stopping" ? <p className="font-satoshi text-xs text-studojo-muted">Stopping</p> : null}
      {live.error ? (
        <CardShell label="Something went wrong" tone="yellow">
          <p role="alert" className="flex items-start gap-1.5 font-satoshi text-sm text-studojo-ink">
            <FiAlertCircle aria-hidden className="mt-0.5 shrink-0 text-[#92400e]" />
            <span className="whitespace-pre-wrap">{live.error.message}</span>
          </p>
          <div className={cx("mt-2 flex flex-wrap gap-1.5")}>
            {live.error.signIn ? (
              <a href={signInHref()} className={cx("inline-flex min-h-9 items-center rounded-full border-2 border-studojo-ink bg-studojo-purple-strong px-3 font-satoshi text-[13px] font-bold text-white", FOCUS_RING)}>
                Sign in again
              </a>
            ) : null}
            {live.error.retryable ? (
              <ChipButton tone="primary" icon={<FiRefreshCw />} onClick={() => retry(scope)}>
                Try again
              </ChipButton>
            ) : null}
            <ChipButton onClick={() => dismissError(scope)}>Dismiss</ChipButton>
          </div>
        </CardShell>
      ) : null}
    </div>
  );
}
