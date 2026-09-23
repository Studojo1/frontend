import { useEffect, useState } from "react";
import { Form, Link, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/content.write";
import { requireContentAccess } from "~/lib/content/guard.server";
import {
  listAccounts,
  listPosts,
  getPost,
  getIdea,
  upsertPost,
  deletePost,
  setIdeaStatus,
} from "~/lib/content/store.server";
import {
  POST_STATUSES,
  istInputToIso,
  isoToIstInput,
  type ContentAccount,
  type ContentIdea,
  type ContentPost,
} from "~/lib/content/model";
import { draftPost, ContentLlmError } from "~/lib/content/llm.server";
import {
  CARD,
  INPUT,
  LABEL,
  PageHead,
  Button,
  Empty,
  StatusPill,
  ErrorNote,
} from "~/components/content/ui";

/**
 * The writer.
 *
 * Three entry points, all landing in the same editor:
 *   /content/write             pick up a recent draft
 *   /content/write?idea=N      start from a kept idea
 *   /content/write?post=N      keep editing an existing post
 *
 * Generating always writes to the database and redirects to ?post=N. Holding a
 * generated draft in client state only means one stray refresh loses a post.
 */

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireContentAccess(request);
  if (!user) {
    return {
      accounts: [] as ContentAccount[],
      post: null as ContentPost | null,
      idea: null as ContentIdea | null,
      recent: [] as ContentPost[],
    };
  }

  const url = new URL(request.url);
  const postId = url.searchParams.get("post");
  const ideaId = url.searchParams.get("idea");

  const [accounts, post, idea, recent] = await Promise.all([
    listAccounts(),
    postId ? getPost(Number(postId)) : Promise.resolve(null),
    ideaId ? getIdea(Number(ideaId)) : Promise.resolve(null),
    listPosts({ limit: 15 }),
  ]);

  return { accounts, post, idea, recent };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireContentAccess(request);
  if (!user) throw new Response("Not authorised.", { status: 403 });

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "delete") {
    await deletePost(Number(form.get("id")));
    return redirect("/content/write");
  }

  const id = form.get("id") ? Number(form.get("id")) : null;
  const ideaId = form.get("ideaId") ? Number(form.get("ideaId")) : null;
  const accountId = form.get("accountId") ? Number(form.get("accountId")) : null;
  const title = String(form.get("title") ?? "").trim();
  const body = String(form.get("body") ?? "");

  if (!title) return { error: "Give the post a working title first." };

  if (intent === "draft") {
    const accounts = await listAccounts();
    const account = accounts.find((a) => a.id === accountId) ?? null;
    const idea = ideaId ? await getIdea(ideaId) : null;

    let generated: string;
    try {
      generated = await draftPost({
        account,
        title,
        angle: idea?.angle ?? null,
        hook: idea?.hook ?? null,
        instructions: String(form.get("instructions") ?? "").trim() || null,
        // Present means rewrite, absent means write from scratch.
        existingBody: body.trim() || null,
      });
    } catch (err) {
      return {
        error:
          err instanceof ContentLlmError
            ? err.message
            : "Drafting failed. Try again in a moment.",
      };
    }

    const savedId = await upsertPost({
      id,
      accountId,
      ideaId,
      title,
      body: generated,
      status: "drafted",
      scheduledFor: istInputToIso(String(form.get("scheduledFor") ?? "")),
      scheduledWhere: String(form.get("scheduledWhere") ?? "").trim() || null,
      notes: String(form.get("notes") ?? "").trim() || null,
      createdBy: user.email,
    });

    // An idea that has produced a draft should stop showing up as unwritten.
    if (ideaId) await setIdeaStatus(ideaId, "drafted");

    return redirect(`/content/write?post=${savedId}`);
  }

  const savedId = await upsertPost({
    id,
    accountId,
    ideaId,
    title,
    body,
    status: String(form.get("status") ?? "drafted"),
    scheduledFor: istInputToIso(String(form.get("scheduledFor") ?? "")),
    scheduledWhere: String(form.get("scheduledWhere") ?? "").trim() || null,
    notes: String(form.get("notes") ?? "").trim() || null,
    createdBy: user.email,
  });

  if (ideaId) await setIdeaStatus(ideaId, "drafted");
  return redirect(`/content/write?post=${savedId}&saved=1`);
}

export default function ContentWrite({ loaderData, actionData }: Route.ComponentProps) {
  const { accounts, post, idea, recent } = loaderData;
  const nav = useNavigation();
  const drafting =
    nav.state === "submitting" && nav.formData?.get("intent") === "draft";
  const saving =
    nav.state === "submitting" && nav.formData?.get("intent") === "save";

  const [body, setBody] = useState(post?.body ?? "");
  const [copied, setCopied] = useState(false);

  // The editor is keyed on the post id below, but a generate-in-place returns
  // the same id with new text, so mirror loader data back into state.
  useEffect(() => {
    setBody(post?.body ?? "");
  }, [post?.id, post?.body]);

  const editing = Boolean(post || idea);

  const copy = async () => {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <PageHead
        title="Write"
        blurb="Draft against the account's voice and the playbook, edit it until it sounds like a person, then send it to the calendar."
        actions={
          editing ? (
            <Link
              to="/content/write"
              className="inline-flex items-center rounded-xl border-2 border-neutral-900 bg-white px-4 py-2 font-satoshi text-sm font-bold shadow-[3px_3px_0px_0px_rgba(23,23,23,1)]"
            >
              New post
            </Link>
          ) : undefined
        }
      />

      {actionData && "error" in actionData && actionData.error && (
        <div className="mt-6">
          <ErrorNote>{actionData.error}</ErrorNote>
        </div>
      )}

      {idea && !post && (
        <section className={`${CARD} mt-8 border-studojo-purple bg-studojo-purple-bg p-5`}>
          <p className={LABEL}>Writing from this idea</p>
          <h2 className="mt-1 font-clash text-lg font-medium text-neutral-900">
            {idea.title}
          </h2>
          {idea.angle && (
            <p className="mt-2 font-satoshi text-sm text-neutral-700">{idea.angle}</p>
          )}
        </section>
      )}

      <Form method="post" className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {post && <input type="hidden" name="id" value={post.id} />}
        <input
          type="hidden"
          name="ideaId"
          value={idea?.id ?? post?.ideaId ?? ""}
        />

        <div className={`${CARD} p-6`}>
          <div>
            <label className={LABEL} htmlFor="title">Working title</label>
            <input
              id="title"
              name="title"
              className={`${INPUT} mt-1.5`}
              defaultValue={post?.title ?? idea?.title ?? ""}
              placeholder="What the post is about"
              required
            />
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <label className={LABEL} htmlFor="body">Post body</label>
              <span className="font-satoshi text-xs text-neutral-500">
                {body.length.toLocaleString()} characters
              </span>
            </div>
            <textarea
              id="body"
              name="body"
              rows={20}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={`${INPUT} mt-1.5 leading-relaxed`}
              placeholder="Leave this empty and hit Draft to write from scratch. Paste or write something first and Draft rewrites it against the playbook."
            />
          </div>

          <div className="mt-5">
            <label className={LABEL} htmlFor="instructions">
              Instructions for this draft
            </label>
            <input
              id="instructions"
              name="instructions"
              className={`${INPUT} mt-1.5`}
              placeholder="Optional. Shorter, harder opening, more specific, cut the last line."
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t-2 border-neutral-100 pt-5">
            <Button type="submit" name="intent" value="draft" disabled={drafting || saving}>
              {drafting ? "Writing..." : body.trim() ? "Rewrite with playbook" : "Draft it"}
            </Button>
            <Button
              type="submit"
              name="intent"
              value="save"
              variant="ghost"
              disabled={drafting || saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            {body.trim() && (
              <Button type="button" variant="ghost" onClick={copy}>
                {copied ? "Copied" : "Copy body"}
              </Button>
            )}
            {post && (
              <Button
                type="submit"
                name="intent"
                value="delete"
                variant="danger"
                formNoValidate
                className="ml-auto"
                onClick={(e) => {
                  if (!confirm("Delete this post?")) e.preventDefault();
                }}
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        <aside className="grid gap-5">
          <div className={`${CARD} p-5`}>
            <h3 className="font-clash text-lg font-medium text-neutral-900">Where it goes</h3>

            <div className="mt-4">
              <label className={LABEL} htmlFor="accountId">Account</label>
              <select
                id="accountId"
                name="accountId"
                className={`${INPUT} mt-1.5`}
                defaultValue={post?.accountId ?? idea?.accountId ?? ""}
              >
                <option value="">Unassigned</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.displayName}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className={LABEL} htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className={`${INPUT} mt-1.5`}
                defaultValue={post?.status ?? "drafted"}
              >
                {POST_STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className={LABEL} htmlFor="scheduledFor">Slot (IST)</label>
              <input
                id="scheduledFor"
                name="scheduledFor"
                type="datetime-local"
                className={`${INPUT} mt-1.5`}
                defaultValue={isoToIstInput(post?.scheduledFor)}
              />
            </div>

            <div className="mt-4">
              <label className={LABEL} htmlFor="scheduledWhere">Queued in</label>
              <input
                id="scheduledWhere"
                name="scheduledWhere"
                className={`${INPUT} mt-1.5`}
                defaultValue={post?.scheduledWhere ?? ""}
                placeholder="Buffer, native scheduler, manual"
              />
              <p className="mt-2 font-satoshi text-xs leading-relaxed text-neutral-500">
                Studio tracks the slot. It does not post for you, so record where
                the post is actually queued.
              </p>
            </div>

            <div className="mt-4">
              <label className={LABEL} htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className={`${INPUT} mt-1.5`}
                defaultValue={post?.notes ?? ""}
                placeholder="Image to attach, link in first comment, anything else."
              />
            </div>
          </div>
        </aside>
      </Form>

      <section className="mt-12">
        <h2 className="font-clash text-2xl font-medium text-neutral-900">Recent posts</h2>
        <div className="mt-5">
          {recent.length === 0 ? (
            <Empty>Nothing written yet.</Empty>
          ) : (
            <div className={`${CARD} divide-y-2 divide-neutral-100 overflow-hidden`}>
              {recent.map((p) => (
                <Link
                  key={p.id}
                  to={`/content/write?post=${p.id}`}
                  className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-neutral-50 ${
                    post?.id === p.id ? "bg-studojo-purple-bg" : ""
                  }`}
                >
                  <StatusPill status={p.status} />
                  <span className="font-satoshi text-[15px] text-neutral-800">
                    {p.title}
                  </span>
                  {p.accountHandle && (
                    <span className="font-satoshi text-xs text-neutral-500">
                      {p.accountHandle}
                    </span>
                  )}
                  <span className="ml-auto font-satoshi text-xs text-neutral-400">
                    {p.scheduledFor
                      ? new Date(p.scheduledFor).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "no slot"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
