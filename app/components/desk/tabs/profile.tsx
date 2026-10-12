// Profile: what I read from the resume, the targets, and the notes every email
// draws on (best project, outcome, why now, credential), editable here.
import { useEffect, useState, type ReactNode } from "react";
import { FiExternalLink, FiSave } from "react-icons/fi";
import type { Profile, ProfileNotes, UpdateNotesBody } from "~/lib/desk/types";
import { getProfile, updateNotes } from "~/lib/desk/api";
import { NeedsResume } from "./home";
import { Button, Card, clean, cx, ErrorBox, errorCode, errorText, FOCUS_RING, Loading, Notice, Pill, Section } from "./kit";
import { refresh, useLive, usePageContext } from "./live";

type NoteKey = keyof ProfileNotes;
const NOTES: { key: NoteKey; label: string; help: string; max: number; rows: number }[] = [
  { key: "best_project", label: "Best project", help: "The one thing you built that every email should lead with.", max: 500, rows: 3 },
  { key: "outcome", label: "Outcome", help: "What came of it. A real number helps, if you have one.", max: 500, rows: 2 },
  { key: "why_now", label: "Why now", help: "Why you are reaching out at this point.", max: 500, rows: 2 },
  { key: "credential", label: "Credential", help: "One line every email must mention, such as your degree or an award.", max: 200, rows: 1 },
];

export function ProfileTab() {
  const p = useLive<Profile>("profile", getProfile);
  usePageContext({ route: "profile" });

  if (p.error && errorCode(p.error) === "not_found") return <NeedsResume />;
  if (p.error) return <ErrorBox error={p.error} onRetry={p.reload} />;
  if (!p.data) return <Loading label="Loading your profile" rows={4} />;
  const d = p.data;

  return (
    <div className="space-y-8">
      <Section title={clean(d.name) || "Your profile"} sub={[clean(d.education), clean(d.career_stage)].filter(Boolean).join(" · ") || undefined}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-4 sm:p-5">
            <h3 className="font-satoshi text-xs font-bold uppercase tracking-wide text-studojo-muted">From your resume</h3>
            {d.summary ? <p className="mt-2 font-satoshi text-base text-studojo-ink">{clean(d.summary)}</p> : <p className="mt-2 font-satoshi text-sm text-studojo-muted">No summary was parsed from your resume.</p>}
            <Tags label="Top skills" items={d.top_skills} />
          </Card>
          <Card className="p-4 sm:p-5">
            <h3 className="font-satoshi text-xs font-bold uppercase tracking-wide text-studojo-muted">What you are aiming for</h3>
            <Tags label="Roles" items={d.target_roles} />
            <Tags label="Industries" items={d.target_industries} />
            <Tags label="Cities" items={d.locations} />
            <Tags label="Dream companies" items={d.dream_companies} />
            <Tags label="People I write to" items={d.hiring_manager_titles} />
          </Card>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <OutLink href="/resume-maker">Edit your resume</OutLink>
          <OutLink href="/cc">Talk to Career Coach</OutLink>
        </div>
      </Section>
      <NotesEditor notes={d.notes} />
    </div>
  );
}

function Tags({ label, items }: { label: string; items: string[] }) {
  const list = items.map((x) => clean(x)).filter(Boolean);
  return (
    <div className="mt-3">
      <p className="font-satoshi text-sm font-bold text-studojo-ink">{label}</p>
      {list.length ? (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {list.map((x) => (
            <Pill key={x} tone="white" className="normal-case tracking-normal">{x}</Pill>
          ))}
        </div>
      ) : (
        <p className="mt-0.5 font-satoshi text-sm text-studojo-muted">None yet.</p>
      )}
    </div>
  );
}

function OutLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className={cx("inline-flex min-h-10 items-center gap-1.5 rounded-xl border-2 border-studojo-ink bg-white px-3 font-satoshi text-sm font-bold text-studojo-ink shadow-[3px_3px_0_0_#191a23] hover:bg-studojo-purple-bg", FOCUS_RING)}>
      {children}
      <FiExternalLink aria-hidden />
    </a>
  );
}

function toForm(n: ProfileNotes): Record<NoteKey, string> {
  return { best_project: n.best_project ?? "", outcome: n.outcome ?? "", why_now: n.why_now ?? "", credential: n.credential ?? "" };
}

function NotesEditor({ notes }: { notes: ProfileNotes }) {
  const saved = toForm(notes);
  const savedSig = JSON.stringify(saved);
  const [form, setForm] = useState<Record<NoteKey, string>>(saved);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  // A save from the chat (after Confirm) refetches the profile; take it in
  // unless the student has unsaved typing here.
  const [base, setBase] = useState(savedSig);
  useEffect(() => {
    if (savedSig === base) return;
    setForm((cur) => (JSON.stringify(cur) === base ? (JSON.parse(savedSig) as Record<NoteKey, string>) : cur));
    setBase(savedSig);
  }, [savedSig, base]);

  const changed = NOTES.filter(({ key }) => form[key].trim() !== saved[key].trim());

  const save = async () => {
    if (!changed.length) return;
    const body: UpdateNotesBody = {};
    for (const { key } of changed) body[key] = form[key].trim();
    setBusy(true);
    setMsg(null);
    try {
      const p = await updateNotes(body);
      const next = toForm(p.notes);
      setForm(next);
      setBase(JSON.stringify(next));
      setMsg({ tone: "ok", text: "Saved. New emails will use these notes." });
      refresh(["profile"]);
    } catch (e) {
      setMsg({ tone: "error", text: errorText(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section title="Notes for your emails" sub="I use these in every new draft. Leave a box empty to remove it.">
      <Card className="space-y-4 p-4 sm:p-5">
        {NOTES.map((n) => (
          <label key={n.key} className="block">
            <span className="block font-satoshi text-sm font-bold text-studojo-ink">{n.label}</span>
            <span className="block font-satoshi text-sm text-studojo-muted">{n.help}</span>
            <textarea
              value={form[n.key]}
              maxLength={n.max}
              rows={n.rows}
              onChange={(e) => setForm({ ...form, [n.key]: e.target.value })}
              className={cx("mt-1.5 w-full resize-y rounded-xl border-2 border-studojo-ink bg-white px-3 py-2 font-satoshi text-base text-studojo-ink", FOCUS_RING)}
            />
            <span className="mt-0.5 block text-right font-satoshi text-xs tabular-nums text-studojo-muted">{form[n.key].length}/{n.max}</span>
          </label>
        ))}
        {msg ? <Notice tone={msg.tone} onClose={() => setMsg(null)}>{msg.text}</Notice> : null}
        <div className="flex justify-end gap-2">
          {changed.length ? <Button variant="ghost" onClick={() => setForm(saved)}>Undo changes</Button> : null}
          <Button variant="primary" icon={<FiSave />} busy={busy} disabled={!changed.length} onClick={() => void save()}>
            Save notes
          </Button>
        </div>
      </Card>
    </Section>
  );
}
