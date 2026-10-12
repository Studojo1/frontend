// The two lists in Settings: people and companies I never contact, and what I
// remember about you (Forget removes it for good; Add saves one by hand).
import { useState, type FormEvent } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import type { MemoryList, MemoryScope, NeverContact } from "~/lib/desk/types";
import { createMemory, deleteMemory, listMemories } from "~/lib/desk/api";
import { Button, Card, clean, cx, Empty, ErrorBox, errorText, FOCUS_RING, Loading, Notice, Pill, Section, when } from "./kit";
import { refresh, useLive } from "./live";

const INPUT = cx("min-h-11 w-full rounded-xl border-2 border-studojo-ink bg-white px-3 font-satoshi text-base text-studojo-ink", FOCUS_RING);

export function NeverContactEditor({ items, busy, onChange }: { items: NeverContact[]; busy: boolean; onChange: (list: NeverContact[]) => void }) {
  const [kind, setKind] = useState<NeverContact["kind"]>("company");
  const [value, setValue] = useState("");

  const add = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    if (items.some((x) => x.kind === kind && x.value.toLowerCase() === v.toLowerCase())) {
      setValue("");
      return;
    }
    onChange([...items, { kind, value: v }]);
    setValue("");
  };

  return (
    <div>
      <p className="font-satoshi text-base font-bold text-studojo-ink">Never contact</p>
      <p className="font-satoshi text-sm text-studojo-muted">I will not suggest or write to these people or companies.</p>
      {items.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {items.map((x, i) => (
            <li key={`${x.kind}:${x.value}`} className="inline-flex items-center gap-1.5 rounded-full border-2 border-studojo-ink bg-white py-1 pl-3 pr-1 font-satoshi text-sm">
              <span className="text-studojo-muted">{x.kind === "company" ? "Company" : "Person"}:</span>
              <span className="font-bold">{clean(x.value)}</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                aria-label={`Remove ${x.value}`}
                className={cx("inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-studojo-pink-bg disabled:opacity-50", FOCUS_RING)}
              >
                <FiTrash2 aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <form onSubmit={add} className="mt-3 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="nc-kind">Type</label>
        <select id="nc-kind" value={kind} onChange={(e) => setKind(e.target.value as NeverContact["kind"])} className={cx(INPUT, "w-auto")}>
          <option value="company">Company</option>
          <option value="person">Person</option>
        </select>
        <label className="min-w-[12rem] flex-1">
          <span className="sr-only">{kind === "company" ? "Company name" : "Person's name"}</span>
          <input type="text" value={value} maxLength={200} onChange={(e) => setValue(e.target.value)} placeholder={kind === "company" ? "Company name" : "Full name"} className={INPUT} />
        </label>
        <Button type="submit" icon={<FiPlus />} busy={busy} disabled={!value.trim()} className="min-h-11">Add</Button>
      </form>
    </div>
  );
}

const SCOPES: { id: MemoryScope; label: string }[] = [
  { id: "everywhere", label: "Everywhere" },
  { id: "emails", label: "Emails" },
  { id: "matching", label: "Matching" },
  { id: "company", label: "One company" },
];
const SCOPE_LABEL = Object.fromEntries(SCOPES.map((s) => [s.id, s.label])) as Record<MemoryScope, string>;

export function MemoriesCard() {
  const list = useLive<MemoryList>("memories", listMemories);
  const [forgetting, setForgetting] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const forget = async (id: number) => {
    setForgetting(id);
    setMsg(null);
    try {
      await deleteMemory(id);
      setMsg({ tone: "ok", text: "Forgotten." });
      refresh(["memories"]);
    } catch (e) {
      setMsg({ tone: "error", text: errorText(e) });
    } finally {
      setForgetting(null);
    }
  };

  const data = list.data;
  return (
    <Section title="What I remember" sub={data ? `${data.items.length} of ${data.cap} saved. Tell me in chat, or add one here.` : "Preferences you have told me."}>
      {msg ? <div className="mb-3"><Notice tone={msg.tone} onClose={() => setMsg(null)}>{msg.text}</Notice></div> : null}
      {list.error ? (
        <ErrorBox error={list.error} onRetry={list.reload} />
      ) : !data ? (
        <Loading label="Loading what I remember" rows={2} />
      ) : (
        <div className="space-y-3">
          {data.items.length === 0 ? (
            <Empty title="Nothing saved yet" body='Say something like "keep my emails under 100 words" and I will remember it.' />
          ) : (
            <Card>
              <ul className="divide-y-2 divide-studojo-ink/10">
                {data.items.map((m) => (
                  <li key={m.id} className="flex items-start gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-satoshi text-base text-studojo-ink">{clean(m.text)}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Pill tone="white">{SCOPE_LABEL[m.scope] ?? m.scope}{m.scope === "company" && m.company ? `: ${clean(m.company)}` : ""}</Pill>
                        {m.use_in_emails ? <Pill tone="purple">Used in emails</Pill> : null}
                        <span className="font-satoshi text-xs text-studojo-muted">{when(m.created_at)}</span>
                      </div>
                    </div>
                    <Button variant="ghost" busy={forgetting === m.id} onClick={() => void forget(m.id)} aria-label={`Forget: ${clean(m.text)}`}>
                      Forget
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {data.items.length < data.cap ? <AddMemory /> : <p className="font-satoshi text-sm text-studojo-muted">That is the most I keep. Forget one to add another.</p>}
        </div>
      )}
    </Section>
  );
}

function AddMemory() {
  const [text, setText] = useState("");
  const [scope, setScope] = useState<MemoryScope>("everywhere");
  const [company, setCompany] = useState("");
  const [useInEmails, setUseInEmails] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || (scope === "company" && !company.trim())) return;
    setBusy(true);
    setErr(null);
    try {
      await createMemory({ text: t, scope, company: scope === "company" ? company.trim() : null, use_in_emails: useInEmails });
      setText("");
      setCompany("");
      setUseInEmails(false);
      refresh(["memories"]);
    } catch (e2) {
      setErr(errorText(e2));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border-2 border-dashed border-studojo-ink/30 p-4">
      <label className="block">
        <span className="font-satoshi text-sm font-bold text-studojo-ink">Add something for me to remember</span>
        <input type="text" value={text} maxLength={300} onChange={(e) => setText(e.target.value)} placeholder="For example: I prefer early stage startups" className={cx(INPUT, "mt-1.5")} />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 font-satoshi text-sm">
          <span className="whitespace-nowrap font-bold">Applies to</span>
          <select value={scope} onChange={(e) => setScope(e.target.value as MemoryScope)} className={cx(INPUT, "w-auto")}>
            {SCOPES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        {scope === "company" ? (
          <label className="min-w-[12rem] flex-1">
            <span className="sr-only">Company</span>
            <input type="text" value={company} maxLength={200} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" className={INPUT} />
          </label>
        ) : null}
      </div>
      <label className="flex items-start gap-2 font-satoshi text-sm text-studojo-ink">
        <input type="checkbox" checked={useInEmails} onChange={(e) => setUseInEmails(e.target.checked)} className="mt-0.5 h-5 w-5 accent-studojo-purple-strong" />
        <span>This is a fact about me that emails may mention.</span>
      </label>
      {err ? <Notice tone="error" onClose={() => setErr(null)}>{err}</Notice> : null}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" icon={<FiPlus />} busy={busy} disabled={!text.trim() || (scope === "company" && !company.trim())}>
          Save
        </Button>
      </div>
    </form>
  );
}
