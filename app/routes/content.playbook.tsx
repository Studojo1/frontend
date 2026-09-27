import { useState } from "react";
import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/content.playbook";
import { requireContentAccess } from "~/lib/content/guard.server";
import {
  listPlaybook,
  upsertPlaybookEntry,
  deletePlaybookEntry,
} from "~/lib/content/store.server";
import { PLAYBOOK_KINDS, type PlaybookEntry } from "~/lib/content/model";
import { CARD, INPUT, LABEL, PageHead, Button, Empty } from "~/components/content/ui";

/**
 * The playbook: how to ideate, how to write, the skills list, example posts.
 *
 * Every entry with "feed to the model" on is concatenated into the system
 * prompt for both the idea generator and the writer. That is the whole point
 * of this page: it is the one place that changes what the model produces.
 *
 * Paste-in rather than file upload on purpose. A .md or .docx would have to be
 * parsed and stored somewhere, and the model only ever sees the text anyway.
 */

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireContentAccess(request);
  if (!user) return { entries: [] as PlaybookEntry[] };
  return { entries: await listPlaybook() };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireContentAccess(request);
  if (!user) throw new Response("Not authorised.", { status: 403 });

  const form = await request.formData();
  if (String(form.get("intent")) === "delete") {
    await deletePlaybookEntry(Number(form.get("id")));
    return { ok: true };
  }

  const title = String(form.get("title") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  if (!title || !body) return { error: "Title and body are both required." };

  await upsertPlaybookEntry({
    id: form.get("id") ? Number(form.get("id")) : null,
    kind: String(form.get("kind") ?? "writing"),
    title,
    body,
    includeInPrompt: form.get("includeInPrompt") === "on",
  });
  return { ok: true };
}

function EntryForm({ entry, onDone }: { entry?: PlaybookEntry; onDone?: () => void }) {
  const nav = useNavigation();
  const saving = nav.state !== "idle";

  return (
    <Form method="post" className="grid gap-4" onSubmit={onDone}>
      {entry && <input type="hidden" name="id" value={entry.id} />}
      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <div>
          <label className={LABEL} htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            className={`${INPUT} mt-1.5`}
            defaultValue={entry?.title}
            placeholder="How to write a LinkedIn post"
            required
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="kind">Kind</label>
          <select
            id="kind"
            name="kind"
            className={`${INPUT} mt-1.5`}
            defaultValue={entry?.kind ?? "writing"}
          >
            {PLAYBOOK_KINDS.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="body">Content</label>
        <textarea
          id="body"
          name="body"
          rows={14}
          className={`${INPUT} mt-1.5 font-mono text-[13px] leading-relaxed`}
          defaultValue={entry?.body}
          placeholder="Paste the whole document. Rules, structures, hooks, examples, anything the writer should follow."
          required
        />
      </div>

      <label className="flex items-center gap-2 font-satoshi text-sm text-neutral-700">
        <input
          type="checkbox"
          name="includeInPrompt"
          defaultChecked={entry?.includeInPrompt ?? true}
          className="h-4 w-4 accent-[var(--color-studojo-purple)]"
        />
        Feed this to the model on every generation
      </label>

      <div>
        <Button type="submit" name="intent" value="save" disabled={saving}>
          {saving ? "Saving..." : entry ? "Save changes" : "Add to playbook"}
        </Button>
      </div>
    </Form>
  );
}

export default function ContentPlaybook({ loaderData, actionData }: Route.ComponentProps) {
  const { entries } = loaderData;
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const fed = entries.filter((e) => e.includeInPrompt).length;
  const chars = entries
    .filter((e) => e.includeInPrompt)
    .reduce((n, e) => n + e.body.length, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <PageHead
        title="Playbook"
        blurb="Your LinkedIn rules live here: how to ideate, how to write, the skills, the example posts. Anything switched on is pasted into the prompt every time the studio generates or drafts."
        actions={
          <Button onClick={() => setAdding((v) => !v)}>
            {adding ? "Close" : "Add entry"}
          </Button>
        }
      />

      <p className="mt-3 font-satoshi text-sm text-neutral-500">
        {fed} of {entries.length} entries feeding the model, about{" "}
        {Math.round(chars / 4).toLocaleString()} tokens of context.
      </p>

      {actionData && "error" in actionData && actionData.error && (
        <p className="mt-4 font-satoshi text-sm text-red-600">{actionData.error}</p>
      )}

      {adding && (
        <section className={`${CARD} mt-6 p-6`}>
          <h2 className="font-clash text-xl font-medium text-neutral-900">New entry</h2>
          <div className="mt-4">
            <EntryForm onDone={() => setAdding(false)} />
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-5">
        {entries.length === 0 && !adding && (
          <Empty>
            Nothing here yet. Paste in your LinkedIn writing rules and ideation
            process first. Until you do, the model falls back on generic advice.
          </Empty>
        )}

        {entries.map((e) => (
          <section key={e.id} className={`${CARD} p-6`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-clash text-xl font-medium text-neutral-900">
                  {e.title}
                </h3>
                <p className="mt-1 font-satoshi text-sm text-neutral-500">
                  {PLAYBOOK_KINDS.find((k) => k.value === e.kind)?.label ?? e.kind}
                  {e.includeInPrompt ? " · feeding the model" : " · parked, not in prompt"}
                  {" · "}
                  {e.body.length.toLocaleString()} characters
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setEditing(editing === e.id ? null : e.id)}
                >
                  {editing === e.id ? "Close" : "Edit"}
                </Button>
                <Form
                  method="post"
                  onSubmit={(ev) => {
                    if (!confirm(`Delete "${e.title}"?`)) ev.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={e.id} />
                  <Button type="submit" name="intent" value="delete" variant="danger">
                    Delete
                  </Button>
                </Form>
              </div>
            </div>

            {editing === e.id ? (
              <div className="mt-5 border-t-2 border-neutral-100 pt-5">
                <EntryForm entry={e} onDone={() => setEditing(null)} />
              </div>
            ) : (
              <pre className="mt-4 max-h-56 overflow-auto whitespace-pre-wrap rounded-xl bg-neutral-50 p-4 font-mono text-[13px] leading-relaxed text-neutral-700">
                {e.body}
              </pre>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
