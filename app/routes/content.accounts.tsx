import { useState } from "react";
import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/content.accounts";
import { requireContentAccess } from "~/lib/content/guard.server";
import {
  listAccounts,
  upsertAccount,
  deleteAccount,
} from "~/lib/content/store.server";
import { PLATFORMS, type ContentAccount } from "~/lib/content/model";
import { CARD, INPUT, LABEL, PageHead, Button, Empty } from "~/components/content/ui";

/**
 * The accounts posts are written for. Persona and audience are not decoration:
 * they are pasted into the system prompt for both the ideator and the writer,
 * so a thin persona produces thin posts.
 */

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireContentAccess(request);
  if (!user) return { accounts: [] as ContentAccount[] };
  return { accounts: await listAccounts() };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireContentAccess(request);
  if (!user) throw new Response("Not authorised.", { status: 403 });

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "delete") {
    await deleteAccount(Number(form.get("id")));
    return { ok: true };
  }

  const handle = String(form.get("handle") ?? "").trim();
  const displayName = String(form.get("displayName") ?? "").trim();
  if (!handle || !displayName) {
    return { error: "Handle and display name are both required." };
  }

  await upsertAccount({
    id: form.get("id") ? Number(form.get("id")) : null,
    handle,
    displayName,
    platform: String(form.get("platform") ?? "linkedin"),
    persona: String(form.get("persona") ?? "").trim() || null,
    audience: String(form.get("audience") ?? "").trim() || null,
    notes: String(form.get("notes") ?? "").trim() || null,
    active: form.get("active") === "on",
  });
  return { ok: true };
}

function AccountForm({
  account,
  onDone,
}: {
  account?: ContentAccount;
  onDone?: () => void;
}) {
  const nav = useNavigation();
  const saving = nav.state !== "idle";

  return (
    <Form method="post" className="grid gap-4" onSubmit={onDone}>
      {account && <input type="hidden" name="id" value={account.id} />}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className={LABEL} htmlFor="displayName">Display name</label>
          <input
            id="displayName"
            name="displayName"
            className={`${INPUT} mt-1.5`}
            defaultValue={account?.displayName}
            placeholder="Vanshika, founder account"
            required
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="handle">Handle</label>
          <input
            id="handle"
            name="handle"
            className={`${INPUT} mt-1.5`}
            defaultValue={account?.handle}
            placeholder="@vanshika"
            required
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="platform">Platform</label>
          <select
            id="platform"
            name="platform"
            className={`${INPUT} mt-1.5`}
            defaultValue={account?.platform ?? "linkedin"}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p} className="capitalize">{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="persona">Voice and persona</label>
        <textarea
          id="persona"
          name="persona"
          rows={3}
          className={`${INPUT} mt-1.5`}
          defaultValue={account?.persona ?? ""}
          placeholder="Who is posting, what they have actually done, how they sound. The more specific, the better the drafts."
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="audience">Audience</label>
        <textarea
          id="audience"
          name="audience"
          rows={2}
          className={`${INPUT} mt-1.5`}
          defaultValue={account?.audience ?? ""}
          placeholder="Who reads this. Students, founders, recruiters, and what they want from it."
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className={`${INPUT} mt-1.5`}
          defaultValue={account?.notes ?? ""}
          placeholder="Posting cadence, topics to avoid, anything the writer should know."
        />
      </div>

      <label className="flex items-center gap-2 font-satoshi text-sm text-neutral-700">
        <input
          type="checkbox"
          name="active"
          defaultChecked={account?.active ?? true}
          className="h-4 w-4 accent-[var(--color-studojo-purple)]"
        />
        Active
      </label>

      <div className="flex gap-2">
        <Button type="submit" name="intent" value="save" disabled={saving}>
          {saving ? "Saving..." : account ? "Save changes" : "Add account"}
        </Button>
      </div>
    </Form>
  );
}

export default function ContentAccounts({ loaderData, actionData }: Route.ComponentProps) {
  const { accounts } = loaderData;
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <PageHead
        title="Accounts"
        blurb="Every handle you publish under. Voice, audience and notes go straight into the prompt, so treat them as the brief, not as labels."
        actions={
          <Button onClick={() => setAdding((v) => !v)}>
            {adding ? "Close" : "Add account"}
          </Button>
        }
      />

      <p className="mt-3 font-satoshi text-sm text-neutral-500">
        {accounts.filter((a) => a.active).length} active of {accounts.length} set up.
      </p>

      {actionData && "error" in actionData && actionData.error && (
        <p className="mt-4 font-satoshi text-sm text-red-600">{actionData.error}</p>
      )}

      {adding && (
        <section className={`${CARD} mt-6 p-6`}>
          <h2 className="font-clash text-xl font-medium text-neutral-900">New account</h2>
          <div className="mt-4">
            <AccountForm onDone={() => setAdding(false)} />
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-5">
        {accounts.length === 0 && !adding && (
          <Empty>No accounts yet. Add the first of the seven.</Empty>
        )}

        {accounts.map((a) => (
          <section key={a.id} className={`${CARD} p-6`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-clash text-xl font-medium text-neutral-900">
                  {a.displayName}
                </h3>
                <p className="mt-1 font-satoshi text-sm text-neutral-500">
                  {a.handle} <span className="capitalize">· {a.platform}</span>
                  {!a.active && " · inactive"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setEditing(editing === a.id ? null : a.id)}
                >
                  {editing === a.id ? "Close" : "Edit"}
                </Button>
                <Form
                  method="post"
                  onSubmit={(e) => {
                    if (!confirm(`Delete ${a.displayName}? Its ideas and posts stay, unassigned.`)) {
                      e.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="id" value={a.id} />
                  <Button type="submit" name="intent" value="delete" variant="danger">
                    Delete
                  </Button>
                </Form>
              </div>
            </div>

            {editing === a.id ? (
              <div className="mt-5 border-t-2 border-neutral-100 pt-5">
                <AccountForm account={a} onDone={() => setEditing(null)} />
              </div>
            ) : (
              <dl className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  ["Voice", a.persona],
                  ["Audience", a.audience],
                  ["Notes", a.notes],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <dt className={LABEL}>{label}</dt>
                    <dd className="mt-1 font-satoshi text-sm leading-relaxed text-neutral-700">
                      {value || <span className="text-neutral-400">Not set</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
