// The Email sub-tab. A draft can be edited, approved, skipped or discarded
// through the same routes the agent's tools use; rewrites go through the
// assistant's thread beside it, so there is one way to ask for one; a campaign email
// is read only (its touches, the reply, or why it failed). Approving never
// sends in Phase 1: it saves the final copy and offers Copy.
import { useState } from "react";
import { FiCheck, FiEdit2, FiRotateCcw, FiSlash, FiTrash2 } from "react-icons/fi";
import { approveDraft, createDrafts, discardDraft, editDraft, errorDetail, restoreDraft, skipMatch } from "~/lib/desk/api";
import { setResource } from "~/lib/desk/cache";
import { useDeskNavigate } from "~/lib/desk/nav";
import type { OutreachDetail } from "~/lib/desk/types";
import { Button, clean, Empty, errorText, Notice, PlainText, when } from "../tabs/kit";
import { refresh } from "../tabs/live";
import { APPROVED_COPY } from "../tabs/status";
import { CopyButton, EditForm, FactsUsed, FlagList, Letter, Versions } from "./parts";

type Busy = null | "approve" | "edit" | "skip" | "discard" | "restore" | "retry";

export function EmailPane({ d }: { d: OutreachDetail }) {
  return d.kind === "email" ? <SentEmail d={d} /> : <Draft d={d} />;
}

function Draft({ d }: { d: OutreachDetail }) {
  const go = useDeskNavigate();
  const [busy, setBusy] = useState<Busy>(null);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const key = `outreach:${d.id}`;
  const version = d.version ?? 0;
  const name = clean(d.lead.name);

  const run = async (what: Exclude<Busy, null>, fn: () => Promise<string | null>) => {
    setBusy(what);
    setMsg(null);
    try {
      const ok = await fn();
      if (ok) setMsg({ tone: "ok", text: ok });
    } catch (e) {
      const current = errorDetail(e)?.current;
      if (current) setResource(key, current);
      setMsg({ tone: "error", text: errorText(e) });
    } finally {
      setBusy(null);
    }
  };

  const approve = () =>
    run("approve", async () => {
      const r = await approveDraft(d.id, { expected_version: version });
      setResource(key, r.outreach);
      refresh(["outreach", "status"]);
      // The approved banner above the letter carries the message and Copy.
      return null;
    });
  const save = (subject: string, body: string) =>
    run("edit", async () => {
      const next = await editDraft(d.id, { subject, body, expected_version: version });
      setResource(key, next);
      setEditing(false);
      refresh(["outreach"]);
      return "Saved your edit.";
    });
  const skip = () =>
    run("skip", async () => {
      await skipMatch(d.lead.id);
      refresh(["outreach", "matches", "status"]);
      return `Passed on ${name}. Restore brings the draft back.`;
    });
  const discard = () =>
    run("discard", async () => {
      const next = await discardDraft(d.id);
      setResource(key, next);
      refresh(["outreach", "matches", "status"]);
      return `Discarded. ${name} is back in your matches.`;
    });
  const restore = () =>
    run("restore", async () => {
      await restoreDraft(d.id);
      refresh(["outreach", "matches", "status"]);
      return "Restored.";
    });
  const retry = () =>
    run("retry", async () => {
      const r = await createDrafts({ lead_ids: [d.lead.id] });
      refresh(["outreach", "matches", "status"]);
      const row = r.items[0];
      if (row) {
        go({ to: "outreach", id: row.id, filter: null }, { replace: true });
        return null;
      }
      return r.refused.map((x) => clean(x.message)).join(" ") || "I could not start that one.";
    });

  const notice = msg ? <Notice tone={msg.tone} onClose={() => setMsg(null)}>{msg.text}</Notice> : null;

  if (d.busy || d.server_status === "drafting") {
    return (
      <div className="space-y-3">
        <div role="status" className="rounded-2xl border-2 border-studojo-ink bg-studojo-purple-bg p-5">
          <p className="font-satoshi text-base font-bold">Writing your email to {name}.</p>
          <p className="mt-1 font-satoshi text-sm text-studojo-muted">It shows here by itself when it is ready.</p>
          <div aria-hidden className="mt-4 space-y-2">
            {[80, 95, 70, 88].map((w) => (
              <div key={w} className="h-3 animate-pulse rounded bg-white" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (d.server_status === "failed") {
    return (
      <div className="space-y-3">
        {notice}
        <Empty title="I couldn't write this one" body={clean(d.note)} action={<Button variant="primary" icon={<FiRotateCcw />} busy={busy === "retry"} onClick={() => void retry()}>Try again</Button>} />
      </div>
    );
  }

  if (d.server_status === "skipped" || d.server_status === "discarded" || d.server_status === "superseded") {
    return (
      <div className="space-y-3">
        {notice}
        <Empty
          title={d.server_status === "skipped" ? `You passed on ${name}` : "This draft is no longer in your outreach"}
          body={d.server_status === "skipped" ? "Restore brings the draft back for review." : `${name} is back in your matches.`}
          action={d.server_status === "skipped" && d.subject ? <Button icon={<FiRotateCcw />} busy={busy === "restore"} onClick={() => void restore()}>Restore</Button> : null}
        />
        {d.body ? <Letter d={d} /> : null}
      </div>
    );
  }

  const approved = d.server_status === "approved";
  return (
    <div className="space-y-4">
      {approved ? (
        <div role="status" className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-studojo-ink bg-studojo-green-bg px-4 py-3">
          <FiCheck aria-hidden className="shrink-0" />
          <p className="min-w-0 flex-1 basis-56 font-satoshi text-sm font-bold">
            {APPROVED_COPY}
            {d.approved_at ? <span className="font-normal text-studojo-muted"> Approved {when(d.approved_at)}.</span> : null}
          </p>
          <CopyButton d={d} />
        </div>
      ) : null}
      {notice}
      <FlagList flags={d.flags} />
      {editing ? <EditForm d={d} busy={busy === "edit"} onSave={(s, b) => void save(s, b)} onCancel={() => setEditing(false)} /> : <Letter d={d} />}

      {!editing ? (
        <div className="flex flex-wrap items-center gap-2">
          {d.can_approve && !approved ? (
            <Button variant="primary" size="md" icon={<FiCheck />} busy={busy === "approve"} disabled={!!busy && busy !== "approve"} onClick={() => void approve()}>
              Approve
            </Button>
          ) : null}
          {d.can_edit ? <Button icon={<FiEdit2 />} disabled={!!busy} onClick={() => setEditing(true)}>Edit</Button> : null}
          {d.can_skip ? <Button variant="ghost" icon={<FiSlash />} busy={busy === "skip"} disabled={!!busy && busy !== "skip"} onClick={() => void skip()}>Skip</Button> : null}
          {d.can_discard ? <Button variant="ghost" icon={<FiTrash2 />} busy={busy === "discard"} disabled={!!busy && busy !== "discard"} onClick={() => void discard()}>Discard</Button> : null}
        </div>
      ) : null}
      {!approved && !editing ? <p className="font-satoshi text-xs text-studojo-muted">Nothing is sent until you approve it. Approving saves the final copy; sending is not switched on yet, so you can copy it into Gmail yourself.</p> : null}

      {d.can_edit && !editing ? (
        <p className="font-satoshi text-sm text-studojo-muted">To rewrite it, tell the assistant what to change, for example: make it shorter.</p>
      ) : null}
      <FactsUsed facts={d.facts_used} />
      <Versions versions={d.versions} previous={null} />
    </div>
  );
}

function SentEmail({ d }: { d: OutreachDetail }) {
  const t = d.thread;
  const touches = t?.touches.length ? t.touches : [{ number: 0, status: d.server_status, subject: d.subject, body: d.body, sent_at: null }];
  return (
    <div className="space-y-4">
      {t?.failure_note ? <Notice tone="error">{clean(t.failure_note)}</Notice> : null}
      <ol className="space-y-3">
        {touches.map((x) => (
          <li key={x.number} className="rounded-2xl border-2 border-studojo-ink bg-white">
            <div className="flex flex-wrap items-center gap-2 border-b-2 border-studojo-ink/10 px-4 py-2 font-satoshi text-sm">
              <span className="font-bold">{x.number === 0 ? "Your email" : `Follow-up ${x.number}`}</span>
              <span className="text-studojo-muted">{x.sent_at ? `Sent ${when(x.sent_at)}` : clean(x.status).replace(/_/g, " ")}</span>
            </div>
            <div className="px-4 py-3">
              {x.subject ? <p className="font-satoshi text-sm font-bold">{clean(x.subject)}</p> : null}
              {x.body ? <PlainText text={x.body} className="mt-1 font-satoshi text-base leading-relaxed" /> : <p className="font-satoshi text-sm text-studojo-muted">The text of this email was not saved.</p>}
            </div>
          </li>
        ))}
      </ol>
      {t?.reply_text ? (
        <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-green-bg/60 p-4">
          <p className="font-satoshi text-xs font-bold uppercase tracking-wide text-studojo-muted">
            Their reply{t.reply_received_at ? `, ${when(t.reply_received_at)}` : ""}
          </p>
          <PlainText text={t.reply_text} className="mt-2 font-satoshi text-base" />
        </div>
      ) : null}
      {d.followups.length ? (
        <p className="font-satoshi text-sm text-studojo-muted">
          {d.followups.length === 1 ? "1 follow-up" : `${d.followups.length} follow-ups`} on this thread.
        </p>
      ) : null}
    </div>
  );
}
