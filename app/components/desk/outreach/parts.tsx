// Pieces of the Email sub-tab: the letter with marked lines, what I used,
// earlier versions and the edit form. Rewrites are asked for in the chat
// beside it, so the page has one text box and one way to rewrite.
import { useState } from "react";
import { FiCopy } from "react-icons/fi";
import type { DraftVersion, Fact, Flag, OutreachDetail, PreviousCopy } from "~/lib/desk/types";
import { Button, clean, cx, FOCUS_RING, Pill, PlainText, when } from "../tabs/kit";

const INPUT = cx("w-full rounded-xl border-2 border-studojo-ink bg-white px-3 font-satoshi text-base text-studojo-ink", FOCUS_RING);

/** Subject and body as plain text; a line a flag points at is marked. */
export function Letter({ d }: { d: OutreachDetail }) {
  const flags = d.flags.map((f) => clean(f.text).trim()).filter(Boolean);
  const lines = clean(d.body).split("\n");
  return (
    <div className="rounded-2xl border-2 border-studojo-ink bg-white">
      <div className="border-b-2 border-studojo-ink/10 px-4 py-3 font-satoshi text-sm">
        <p>
          <span className="text-studojo-muted">To </span>
          <span className="font-bold">{clean(d.lead.name)}</span>
          {d.lead.company ? <span className="text-studojo-muted">, {clean(d.lead.company)}</span> : null}
        </p>
        <p className="mt-1">
          <span className="text-studojo-muted">Subject </span>
          <span className="font-bold">{clean(d.subject) || "No subject"}</span>
        </p>
      </div>
      <div className="px-4 py-4 font-satoshi text-base leading-relaxed text-studojo-ink">
        {lines.map((line, i) => {
          const marked = line.trim() && flags.some((f) => line.includes(f));
          return (
            <p key={i} className={cx("min-h-[1.5em] whitespace-pre-wrap break-words", marked && "rounded bg-studojo-yellow-bg underline decoration-[#ca8a04] decoration-wavy underline-offset-4")}>
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export function FlagList({ flags }: { flags: Flag[] }) {
  if (!flags.length) return null;
  return (
    <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-yellow-bg px-4 py-3">
      <p className="font-satoshi text-sm font-bold text-studojo-ink">Check the marked {flags.length === 1 ? "line" : "lines"}</p>
      <ul className="mt-1 space-y-1 font-satoshi text-sm text-studojo-ink">
        {flags.map((f, i) => (
          <li key={i}>
            <span className="font-bold">"{clean(f.text)}"</span> <span className="text-studojo-muted">{clean(f.reason)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SOURCE: Record<Fact["source"], string> = { profile: "Resume", notes: "Your notes", memory: "Something you told me", company: "Company research" };

export function FactsUsed({ facts }: { facts: Fact[] }) {
  if (!facts.length) return null;
  return (
    <details className="rounded-2xl border-2 border-studojo-ink/15 px-4 py-3">
      <summary className={cx("cursor-pointer rounded font-satoshi text-sm font-bold text-studojo-ink", FOCUS_RING)}>What I used ({facts.length})</summary>
      <ul className="mt-2 space-y-1.5">
        {facts.map((f, i) => (
          <li key={i} className="flex flex-wrap items-baseline gap-2 font-satoshi text-sm">
            <Pill tone="white" className="normal-case tracking-normal">{SOURCE[f.source] ?? f.source}</Pill>
            <span>{clean(f.text)}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function Versions({ versions, previous }: { versions: DraftVersion[]; previous: PreviousCopy | null }) {
  const list = [...versions].sort((a, b) => b.version - a.version);
  if (!list.length && !previous) return null;
  return (
    <details className="rounded-2xl border-2 border-studojo-ink/15 px-4 py-3" open={!!previous}>
      <summary className={cx("cursor-pointer rounded font-satoshi text-sm font-bold text-studojo-ink", FOCUS_RING)}>
        {previous ? `Before this rewrite (version ${previous.version})` : `Earlier versions (${list.length})`}
      </summary>
      {previous ? (
        <div className="mt-2 rounded-xl bg-studojo-surface-muted p-3">
          <p className="font-satoshi text-sm font-bold">{clean(previous.subject)}</p>
          <PlainText text={previous.body} className="mt-1 font-satoshi text-sm text-studojo-ink/80" />
        </div>
      ) : null}
      {!previous ? (
        <ul className="mt-2 space-y-2">
          {list.map((v) => (
            <li key={v.version} className="rounded-xl bg-studojo-surface-muted p-3">
              <p className="font-satoshi text-xs text-studojo-muted">
                Version {v.version}, {v.edited_by === "student" ? "your edit" : "my draft"}, {when(v.created_at)}
              </p>
              <p className="mt-1 font-satoshi text-sm font-bold">{clean(v.subject)}</p>
              <PlainText text={v.body} className="mt-1 font-satoshi text-sm text-studojo-ink/80" />
            </li>
          ))}
        </ul>
      ) : null}
    </details>
  );
}

export function EditForm({ d, busy, onSave, onCancel }: { d: OutreachDetail; busy: boolean; onSave: (subject: string, body: string) => void; onCancel: () => void }) {
  const [subject, setSubject] = useState(clean(d.subject));
  const [body, setBody] = useState(clean(d.body));
  const changed = subject.trim() !== clean(d.subject).trim() || body.trim() !== clean(d.body).trim();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (changed && subject.trim() && body.trim()) onSave(subject.trim(), body.trim());
      }}
      className="space-y-3 rounded-2xl border-2 border-studojo-ink bg-white p-4"
    >
      <label className="block">
        <span className="font-satoshi text-sm font-bold">Subject</span>
        <input type="text" value={subject} maxLength={200} onChange={(e) => setSubject(e.target.value)} className={cx(INPUT, "mt-1 min-h-11")} data-autofocus />
      </label>
      <label className="block">
        <span className="font-satoshi text-sm font-bold">Body</span>
        <textarea value={body} rows={12} onChange={(e) => setBody(e.target.value)} className={cx(INPUT, "mt-1 resize-y py-2 leading-relaxed")} />
      </label>
      <p className="font-satoshi text-xs text-studojo-muted">Your words are kept as you write them. Saving clears any earlier approval.</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" variant="primary" busy={busy} disabled={!changed || !subject.trim() || !body.trim()}>Save</Button>
      </div>
    </form>
  );
}

export async function copyEmail(d: OutreachDetail): Promise<boolean> {
  const text = `Subject: ${clean(d.subject)}\n\n${clean(d.body)}`;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the textarea copy.
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    el.remove();
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({ d }: { d: OutreachDetail }) {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  return (
    <Button
      variant="primary"
      icon={<FiCopy />}
      onClick={() =>
        void copyEmail(d).then((ok) => {
          setState(ok ? "ok" : "fail");
          window.setTimeout(() => setState("idle"), 2500);
        })
      }
    >
      {state === "ok" ? "Copied" : state === "fail" ? "Copy failed, select the text instead" : "Copy subject and body"}
    </Button>
  );
}
