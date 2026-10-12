// A draft in the thread. Two shapes, so there is one place to act per screen:
// - On the email's own outreach page the workspace beside the chat holds the
//   letter and every button, so the card is compact: status, note, and what
//   changed in a rewrite.
// - On the main thread a single draft gets the full approval card: subject,
//   body, marked lines, the diff, and Approve, Edit, Skip, Discard. Several
//   drafts at once collapse into DraftsSummary (drafts-summary.tsx).
// The buttons call the same routes as the workspace (contract section 3), so
// chat and tabs cannot disagree. Approve never sends in Phase 1.
import { useState } from "react";
import { Link } from "react-router";
import { FiCheck, FiCopy, FiEdit2, FiExternalLink, FiSlash, FiTrash2 } from "react-icons/fi";
import { invalidate, useDeskResource } from "~/lib/desk/cache";
import { useIsDesktop } from "~/lib/desk/hooks";
import { deskPath } from "~/lib/desk/nav";
import { stripDashes } from "~/lib/strip-dashes";
import type { OutreachDetail, OutreachId, PreviousCopy } from "~/lib/desk/types";
import { APPROVED_COPY, StatusPill } from "../tabs/status";
import { approveDraft, discardDraft, editDraft, errorDetail, errorMessage, getOutreachDetail, skipLead } from "./calls";
import { CardShell, ChipButton, cx, DiffText, FOCUS_RING, Kicker, PlainText, Spinner, wordDiff } from "./bits";
import { serverDate } from "./live";
import { useSlot } from "./use-agent";

const TEXT_BUTTON = cx("mt-1.5 rounded font-satoshi text-xs font-bold text-studojo-purple-strong underline underline-offset-2", FOCUS_RING);

function newest(list: (OutreachDetail | null | undefined)[]): OutreachDetail | null {
  let best: OutreachDetail | null = null;
  for (const d of list) {
    if (!d) continue;
    const t = serverDate(d.when)?.getTime() ?? 0;
    const bt = best ? (serverDate(best.when)?.getTime() ?? 0) : -1;
    if (!best || t > bt || (t === bt && (d.version ?? 0) > (best.version ?? 0))) best = d;
  }
  return best;
}

/**
 * The freshest copy of one draft: the shared `outreach:{id}` resource (which
 * the workspace and every invalidate refresh), a local result, or the copy
 * this thread's stream carried.
 */
export function useDraft(id: OutreachId, scope: string, local: OutreachDetail | null = null) {
  const streamed = useSlot(scope).drafts[id];
  const res = useDeskResource<OutreachDetail>(`outreach:${id}`, () => getOutreachDetail(id));
  // Resource first so a refetch after the workspace changed it wins a tie.
  const d = newest([res.data, local, streamed?.outreach]);
  return { d, res, streamed };
}

function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => false,
    );
  }
  return Promise.resolve(false);
}

function lastVersion(d: OutreachDetail, streamedPrev: PreviousCopy | null | undefined): PreviousCopy | null {
  if (streamedPrev) return streamedPrev;
  const v = d.versions[d.versions.length - 1];
  return v ? { subject: v.subject, body: v.body, version: v.version } : null;
}

function Header({ d }: { d: OutreachDetail }) {
  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <Kicker>Email to {d.lead.name}</Kicker>
        {d.lead.title || d.lead.company ? (
          <p className="truncate font-satoshi text-xs text-studojo-muted">{[d.lead.title, d.lead.company].filter(Boolean).join(" at ")}</p>
        ) : null}
      </div>
      <span className="shrink-0">
        <StatusPill word={d.status_word} busy={d.busy} />
      </span>
    </div>
  );
}

function Loading({ failed }: { failed: boolean }) {
  if (failed) return <p className="font-satoshi text-xs text-studojo-muted">This email is no longer in your outreach.</p>;
  return (
    <CardShell label="Loading an email">
      <p className="flex items-center gap-2 font-satoshi text-sm text-studojo-muted">
        <Spinner /> Loading the email
      </p>
    </CardShell>
  );
}

/** On the email's own page: what happened, never a second set of buttons. */
function CompactDraftCard({ id, scope }: { id: OutreachId; scope: string }) {
  const { d, res, streamed } = useDraft(id, scope);
  const isDesktop = useIsDesktop();
  const [showDiff, setShowDiff] = useState(false);
  if (!d) return <Loading failed={!!res.error} />;
  const prev = d.busy ? null : lastVersion(d, streamed?.previous);
  const approved = d.server_status === "approved";
  const where = isDesktop ? "The email on the right is updated." : "Close the chat to see the updated email.";
  return (
    <CardShell label={`Email to ${d.lead.name}`}>
      <Header d={d} />
      {approved ? null : (
        <p className="mt-1 flex items-center gap-1.5 font-satoshi text-xs text-studojo-muted">
          {d.busy ? <Spinner /> : null}
          {stripDashes(d.note)}
        </p>
      )}
      {showDiff && prev ? (
        <div className="mt-2 rounded-xl border-2 border-studojo-ink/15 bg-white px-2.5 py-2">
          <DiffText parts={wordDiff(`${prev.subject}\n\n${prev.body}`, `${stripDashes(d.subject)}\n\n${stripDashes(d.body)}`)} />
        </div>
      ) : null}
      {prev ? (
        <button type="button" onClick={() => setShowDiff(!showDiff)} aria-expanded={showDiff} className={TEXT_BUTTON}>
          {showDiff ? "Hide what changed" : `Show what changed from version ${prev.version}`}
        </button>
      ) : null}
      {d.busy ? null : <p className="mt-1.5 font-satoshi text-xs font-bold text-studojo-ink">{where}</p>}
    </CardShell>
  );
}

export function DraftCard({ id, scope }: { id: OutreachId; scope: string }) {
  return scope === `outreach:${id}` ? <CompactDraftCard id={id} scope={scope} /> : <FullDraftCard id={id} scope={scope} />;
}

/** The approval card for one draft on the main thread. */
function FullDraftCard({ id, scope }: { id: OutreachId; scope: string }) {
  const [local, setLocal] = useState<OutreachDetail | null>(null);
  const { d, res, streamed } = useDraft(id, scope, local);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ subject: string; body: string } | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!d) return <Loading failed={!!res.error} />;

  const prev = lastVersion(d, streamed?.previous);
  const approved = d.server_status === "approved";
  const long = d.body.length > 700;

  const act = async (name: string, fn: () => Promise<OutreachDetail | null>, okNote: string | null = null) => {
    if (busy) return;
    setBusy(name);
    setError(null);
    setNotice(null);
    try {
      const next = await fn();
      if (next) setLocal(next);
      if (okNote) setNotice(okNote);
      try {
        invalidate(["outreach", "matches", "status"]);
      } catch {
        res.reload();
      }
    } catch (e) {
      const det = errorDetail(e);
      if (det?.code === "version_conflict" && det.current) {
        setLocal(det.current);
        setEditing(null);
      }
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  // The approval line below the body says what Approve did, so no notice here.
  const approve = () => d.version !== null && act("approve", async () => (await approveDraft(d.id, d.version as number)).outreach);
  const save = () =>
    editing &&
    d.version !== null &&
    act("save", async () => {
      const next = await editDraft(d.id, { subject: editing.subject, body: editing.body, expected_version: d.version as number });
      setEditing(null);
      return next;
    }, "Saved your edit.");
  const skip = () =>
    act("skip", async () => {
      const row = await skipLead(d.lead.id);
      return { ...d, ...row, can_approve: false, can_edit: false, can_skip: false, can_discard: false };
    });
  const discard = () => act("discard", () => discardDraft(d.id), "Discarded. This person is back in your matches.");
  const copy = async () => {
    const ok = await copyText(`Subject: ${stripDashes(d.subject)}\n\n${stripDashes(d.body)}`);
    setCopied(ok);
    if (!ok) setError("Copy did not work here. Select the text and copy it yourself.");
  };

  return (
    <CardShell label={`Email to ${d.lead.name}`}>
      <Header d={d} />
      {approved ? null : (
        <p className="mt-1 flex items-center gap-1.5 font-satoshi text-xs text-studojo-muted">
          {d.busy ? <Spinner /> : null}
          {stripDashes(d.note)}
        </p>
      )}

      {d.busy ? null : editing ? (
        <div className="mt-2 space-y-2">
          <label className="block font-satoshi text-xs font-bold text-studojo-muted">
            Subject
            <input
              value={editing.subject}
              onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
              className="mt-1 block w-full rounded-lg border-2 border-studojo-ink bg-white px-2 py-1.5 font-satoshi text-base text-studojo-ink focus:outline-none focus:ring-2 focus:ring-studojo-purple"
            />
          </label>
          <label className="block font-satoshi text-xs font-bold text-studojo-muted">
            Email
            <textarea
              value={editing.body}
              rows={9}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              className="mt-1 block w-full resize-y rounded-lg border-2 border-studojo-ink bg-white px-2 py-1.5 font-satoshi text-base leading-snug text-studojo-ink focus:outline-none focus:ring-2 focus:ring-studojo-purple"
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            <ChipButton tone="primary" icon={<FiCheck />} onClick={save} disabled={!!busy || !editing.body.trim()}>
              {busy === "save" ? "Saving" : "Save"}
            </ChipButton>
            <ChipButton onClick={() => setEditing(null)} disabled={!!busy}>
              Cancel
            </ChipButton>
          </div>
        </div>
      ) : d.subject || d.body ? (
        <div className="mt-2 rounded-xl border-2 border-studojo-ink/15 bg-white px-2.5 py-2">
          {showDiff && prev ? (
            <DiffText parts={wordDiff(`${prev.subject}\n\n${prev.body}`, `${stripDashes(d.subject)}\n\n${stripDashes(d.body)}`)} />
          ) : (
            <>
              <p className="font-satoshi text-sm font-bold text-studojo-ink">{stripDashes(d.subject)}</p>
              <div className={cx("relative mt-1", long && !expanded && "max-h-48 overflow-hidden")}>
                <PlainText text={d.body} />
                {long && !expanded ? <span aria-hidden className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white" /> : null}
              </div>
              {long ? (
                <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className={cx(TEXT_BUTTON, "mt-1")}>
                  {expanded ? "Show less" : "Show the whole email"}
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {!editing && prev && !d.busy ? (
        <button type="button" onClick={() => setShowDiff(!showDiff)} aria-expanded={showDiff} className={TEXT_BUTTON}>
          {showDiff ? "Show the email" : `Show what changed from version ${prev.version}`}
        </button>
      ) : null}

      {d.flags.length && !editing ? (
        <ul className="mt-2 space-y-1 rounded-lg border-2 border-studojo-orange bg-studojo-orange-bg px-2 py-1.5 font-satoshi text-xs text-[#92400e]">
          {d.flags.map((f, i) => (
            <li key={i}>
              <span className="font-bold">Check this line:</span> {stripDashes(f.text)} <span className="text-studojo-muted">({stripDashes(f.reason)})</span>
            </li>
          ))}
        </ul>
      ) : null}

      {notice || (approved && !error) ? (
        <p role="status" className="mt-2 font-satoshi text-xs font-bold text-[#047857]">
          {approved ? APPROVED_COPY : notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 font-satoshi text-xs font-bold text-[#be185d]">
          {stripDashes(error)}
        </p>
      ) : null}

      {!editing && !d.busy ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {d.can_approve ? (
            <ChipButton tone="primary" icon={<FiCheck />} onClick={approve} disabled={!!busy}>
              {busy === "approve" ? "Approving" : "Approve"}
            </ChipButton>
          ) : null}
          {approved ? (
            <ChipButton tone="primary" icon={<FiCopy />} onClick={copy}>
              {copied ? "Copied" : "Copy"}
            </ChipButton>
          ) : null}
          {d.can_edit ? (
            <ChipButton icon={<FiEdit2 />} onClick={() => setEditing({ subject: stripDashes(d.subject), body: stripDashes(d.body) })} disabled={!!busy}>
              Edit
            </ChipButton>
          ) : null}
          {d.can_skip ? (
            <ChipButton icon={<FiSlash />} onClick={skip} disabled={!!busy}>
              {busy === "skip" ? "Skipping" : "Skip"}
            </ChipButton>
          ) : null}
          {d.can_discard ? (
            <ChipButton tone="danger" icon={<FiTrash2 />} onClick={discard} disabled={!!busy}>
              {busy === "discard" ? "Discarding" : "Discard"}
            </ChipButton>
          ) : null}
          <Link
            to={deskPath({ to: "outreach", id: d.id, filter: null })}
            className={cx("inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 font-satoshi text-[13px] font-bold text-studojo-purple-strong underline underline-offset-2", FOCUS_RING)}
          >
            <FiExternalLink aria-hidden /> Open
          </Link>
        </div>
      ) : null}
    </CardShell>
  );
}
