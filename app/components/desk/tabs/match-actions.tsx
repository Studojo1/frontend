// Write and Pass on a match, shared by Home and People. Both buttons call the
// same server functions the agent's draft_emails and skip tools call, then
// refetch exactly what those tools invalidate.
import { useCallback, useState } from "react";
import type { DraftsCreated, OutreachId } from "~/lib/desk/types";
import { createDrafts, restoreDraft, skipMatch } from "~/lib/desk/api";
import { Button, clean, errorText, Notice } from "./kit";
import { refresh } from "./live";

export interface ActionNotice {
  tone: "ok" | "error";
  text: string;
  undo?: OutreachId;
}

export function draftsMessage(r: DraftsCreated): string {
  const n = r.items.length;
  const started = n === 0 ? "" : n === 1 ? "Writing 1 email. It shows under Needs you when it is ready." : `Writing ${n} emails. Each one shows under Needs you when it is ready.`;
  const refused = r.refused.map((x) => clean(x.message)).filter(Boolean);
  const unique = Array.from(new Set(refused));
  return [started, ...unique].filter(Boolean).join(" ") || "Nothing new to write.";
}

export function useMatchActions() {
  const [pending, setPending] = useState<ReadonlySet<number>>(new Set());
  const [notice, setNotice] = useState<ActionNotice | null>(null);
  const [batch, setBatch] = useState(false);

  const mark = (ids: number[], on: boolean) =>
    setPending((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });

  const write = useCallback(async (leadIds: number[]) => {
    if (!leadIds.length) return;
    mark(leadIds, true);
    if (leadIds.length > 1) setBatch(true);
    setNotice(null);
    try {
      const r = await createDrafts({ lead_ids: leadIds });
      setNotice({ tone: r.items.length ? "ok" : "error", text: draftsMessage(r) });
      refresh(["outreach", "matches", "status"]);
    } catch (e) {
      setNotice({ tone: "error", text: errorText(e) });
    } finally {
      mark(leadIds, false);
      setBatch(false);
    }
  }, []);

  const pass = useCallback(async (leadId: number, name: string) => {
    mark([leadId], true);
    setNotice(null);
    try {
      const row = await skipMatch(leadId);
      setNotice({ tone: "ok", text: `Passed on ${clean(name)}. I will not suggest them again.`, undo: row.id });
      refresh(["outreach", "matches", "status"]);
    } catch (e) {
      setNotice({ tone: "error", text: errorText(e) });
    } finally {
      mark([leadId], false);
    }
  }, []);

  const undo = useCallback(async (id: OutreachId) => {
    setNotice(null);
    try {
      await restoreDraft(id);
      refresh(["outreach", "matches", "status"]);
    } catch (e) {
      setNotice({ tone: "error", text: errorText(e) });
    }
  }, []);

  return { pending, batch, notice, setNotice, write, pass, undo };
}

export function ActionNoticeView({ notice, onUndo, onClose }: { notice: ActionNotice | null; onUndo: (id: OutreachId) => void; onClose: () => void }) {
  if (!notice) return null;
  return (
    <div className="mb-3">
      <Notice tone={notice.tone} onClose={onClose}>
        {notice.text}
        {notice.undo ? (
          <Button variant="ghost" className="ml-2 min-h-8 px-2 underline" onClick={() => onUndo(notice.undo as OutreachId)}>
            Undo
          </Button>
        ) : null}
      </Notice>
    </div>
  );
}
