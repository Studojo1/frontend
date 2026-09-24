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
  listRevisions,
  addRevision,
  setPostBody,
  saveKillCheck,
  usedAngles,
  learnFromPost,
} from "~/lib/content/store.server";
import { draftPost, runKillCheck, ContentLlmError } from "~/lib/content/llm.server";
import {
  POST_STATUSES,
  istInputToIso,
  isoToIstInput,
  type ContentAccount,
  type ContentIdea,
  type ContentPost,
  type PostRevision,
} from "~/lib/content/model";
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
 *   /content/write?idea=N      start from a shortlisted idea
 *   /content/write?post=N      keep editing an existing post
 *
 * The loop is draft, read it, tell it what to change, draft again. Every round
 * is saved as a revision, and earlier instructions are replayed into each new
 * prompt so round four does not quietly undo what you asked for in round two.
 */

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireContentAccess(request);
  if (!user) {
    return {
      accounts: [] as ContentAccount[],
      post: null as ContentPost | null,
      idea: null as ContentIdea | null,
      recent: [] as ContentPost[],
      revisions: [] as PostRevision[],
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

  const revisions = post ? await listRevisions(post.id) : [];
  return { accounts, post, idea, recent, revisions };
}

/** Fields the editor always posts, pulled out so every intent saves the same way. */
function readFields(form: FormData) {
  return {
    id: form.get("id") ? Number(form.get("id")) : null,
    ideaId: form.get("ideaId") ? Number(form.get("ideaId")) : null,
    accountId: form.get("accountId") ? Number(form.get("accountId")) : null,
    title: String(form.get("title") ?? "").trim(),
    body: String(form.get("body") ?? ""),
    status: String(form.get("status") ?? "drafted"),
    scheduledFor: istInputToIso(String(form.get("scheduledFor") ?? "")),
    scheduledWhere: String(form.get("scheduledWhere") ?? "").trim() || null,
    notes: String(form.get("notes") ?? "").trim() || null,
    visualPlan: String(form.get("visualPlan") ?? "").trim() || null,
  };
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

  // Reverting touches the body alone. Going back a round should not also roll
  // back the slot or the account.
  if (intent === "revert") {
    const postId = Number(form.get("id"));
    const body = String(form.get("body") ?? "");
    await addRevision({
      postId,
      body,
      instruction: "Reverted to an earlier revision",
      createdBy: user.email,
    });
    await setPostBody(postId, body);
    return redirect(`/content/write?post=${postId}`);
  }

  const f = readFields(form);
  if (!f.title) return { error: "Give the post a working title first." };

  if (intent === "killcheck") {
    if (!f.body.trim()) return { error: "Nothing to check yet." };
    const accounts = await listAccounts();
    const account = accounts.find((a) => a.id === f.accountId) ?? null;
    try {
      const check = await runKillCheck({
        account,
        body: f.body,
        hasVisual: Boolean(f.visualPlan),
        usedAngles: await usedAngles(120),
      });
      const savedId = await upsertPost({ ...f, createdBy: user.email });
      await saveKillCheck(savedId, check);
      return redirect(`/content/write?post=${savedId}`);
    } catch (err) {
      return {
        error:
          err instanceof ContentLlmError
            ? err.message
            : "The kill check failed. Try again in a moment.",
      };
    }
  }

  if (intent === "draft") {
    const accounts = await listAccounts();
    const account = accounts.find((a) => a.id === f.accountId) ?? null;
    const idea = f.ideaId ? await getIdea(f.ideaId) : null;
    const instruction = String(form.get("instruction") ?? "").trim() || null;

    // Replay earlier instructions, oldest first, so a correction from round two
    // survives round five.
    const prior = f.id ? await listRevisions(f.id) : [];
    const priorInstructions = prior
      .map((r) => r.instruction)
      .filter((i): i is string => Boolean(i) && i !== "Reverted to an earlier revision")
      .reverse();

    let generated: string;
    try {
      generated = await draftPost({
        account,
        title: f.title,
        hook: idea?.hook ?? null,
        hookType: idea?.hookType ?? null,
        storyEngine: idea?.storyEngine ?? null,
        angle: idea?.angle ?? null,
        cinematicDetail: idea?.cinematicDetail ?? null,
        existingBody: f.body.trim() || null,
        instruction,
        priorInstructions,
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
      ...f,
      body: generated,
      // A fresh draft invalidates the last kill check, so status drops back.
      status: f.status === "idea" ? "drafted" : f.status,
      createdBy: user.email,
    });
    await addRevision({
      postId: savedId,
      body: generated,
      instruction,
      createdBy: user.email,
    });
    // upsertPost retires the kill check itself whenever the body changes, so
    // there is nothing to clear here.

    if (f.ideaId) await setIdeaStatus(f.ideaId, "drafted");
    return redirect(`/content/write?post=${savedId}`);
  }

  // Plain save, and the schedule button, which is a save with the slot set and
  // the status forced. Nothing here publishes: it only puts it on the calendar.
  const status = intent === "schedule" ? "scheduled" : f.status;
  const savedId = await upsertPost({ ...f, status, createdBy: user.email });
  if (f.ideaId) await setIdeaStatus(f.ideaId, "drafted");
  // Committing to a post is the strongest signal in the tool. Feed it back.
  await learnFromPost(savedId, user.email);
  return redirect(`/content/write?post=${savedId}`);
}

/** The playbook's length target for an insight or hook-driven post. */
const WORD_TARGET = { min: 80, max: 150, hard: 250 };

function WordCount({ body }: { body: string }) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const tone =
    words === 0
      ? "text-neutral-400"
      : words < WORD_TARGET.min
        ? "text-neutral-500"
        : words <= WORD_TARGET.max
          ? "text-emerald-700"
          : words <= WORD_TARGET.hard
            ? "text-yellow-700"
            : "text-red-600";
  return (
    <span className={`font-satoshi text-xs font-bold ${tone}`}>
      {words} words
      <span className="font-normal text-neutral-400">
        {" "}
        · target {WORD_TARGET.min} to {WORD_TARGET.max}, {WORD_TARGET.hard} with a real scene
      </span>
    </span>
  );
}

function KillCheckPanel({ post }: { post: ContentPost }) {
  const check = post.killCheck;
  if (!check) return null;
  const failed = check.items.filter((i) => !i.pass);

  return (
    <section className={`${CARD} mt-6 p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-clash text-lg font-medium text-neutral-900">Kill check</h3>
        <span
          className={`rounded-full px-3 py-1 font-satoshi text-xs font-bold ${
            check.verdict === "pass"
              ? "bg-studojo-green-bg text-emerald-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {check.verdict === "pass"
            ? "Passes"
            : `${failed.length} to fix`}
        </span>
      </div>
      <ul className="mt-4 grid gap-2">
        {check.items.map((item, i) => (
          <li key={i} className="flex gap-3 font-satoshi text-sm leading-relaxed">
            <span
              className={`mt-0.5 shrink-0 font-bold ${
                item.pass ? "text-emerald-600" : "text-red-600"
              }`}
              aria-hidden
            >
              {item.pass ? "ok" : "no"}
            </span>
            <span>
              <span className={item.pass ? "text-neutral-500" : "font-bold text-neutral-900"}>
                {item.check}
              </span>
              {item.note && (
                <span className="text-neutral-500">
                  {" "}
                  {item.note}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ContentWrite({ loaderData, actionData }: Route.ComponentProps) {
  const { accounts, post, idea, recent, revisions } = loaderData;
  const nav = useNavigation();
  const busy = nav.state === "submitting";
  const running = (name: string) => busy && nav.formData?.get("intent") === name;

  const [body, setBody] = useState(post?.body ?? "");
  const [copied, setCopied] = useState(false);

  // A refine returns the same post id with new text, so mirror loader data back
  // into state rather than keying the editor on the id alone.
  useEffect(() => {
    setBody(post?.body ?? "");
  }, [post?.id, post?.body]);

  const editing = Boolean(post || idea);
  const account = accounts.find((a) => a.id === (post?.accountId ?? idea?.accountId));

  const copy = async () => {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <PageHead
        title="Write"
        blurb="Draft it, read it, tell it what to change, draft again. Every round is kept, and your earlier corrections carry forward."
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
          <p className="mt-1 font-clash text-lg font-medium leading-snug text-neutral-900">
            {idea.hook || idea.title}
          </p>
          <p className="mt-2 flex flex-wrap gap-x-3 font-satoshi text-xs font-bold text-studojo-purple">
            {idea.hookType && <span>{idea.hookType}</span>}
            {idea.hookTier && <span>{idea.hookTier}</span>}
            {idea.storyEngine && <span>{idea.storyEngine}</span>}
          </p>
          {idea.cinematicDetail && (
            <p className="mt-2 font-satoshi text-sm text-neutral-700">
              Built around: {idea.cinematicDetail}
            </p>
          )}
        </section>
      )}

      <Form method="post" className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {post && <input type="hidden" name="id" value={post.id} />}
        <input type="hidden" name="ideaId" value={idea?.id ?? post?.ideaId ?? ""} />

        <div>
          <div className={`${CARD} p-6`}>
            <div>
              <label className={LABEL} htmlFor="title">Working title</label>
              <input
                id="title"
                name="title"
                className={`${INPUT} mt-1.5`}
                defaultValue={post?.title ?? idea?.title ?? ""}
                placeholder="What the post is about. Not the hook."
                required
              />
            </div>

            <div className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className={LABEL} htmlFor="body">Post body</label>
                <WordCount body={body} />
              </div>
              <textarea
                id="body"
                name="body"
                rows={20}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className={`${INPUT} mt-1.5 leading-relaxed`}
                placeholder="Empty plus Draft writes it from scratch. Anything in here plus Refine rewrites it."
              />
            </div>

            {/* The refine loop. This is the part that gets used every round, so
                it sits directly under the body rather than in the sidebar. */}
            <div className="mt-5 rounded-xl border-2 border-dashed border-neutral-300 p-4">
              <label className={LABEL} htmlFor="instruction">
                Tell it what to change
              </label>
              <input
                id="instruction"
                name="instruction"
                className={`${INPUT} mt-1.5`}
                placeholder="Harder opening. Cut the last line. More specific, name the company. Less polished."
              />
              <p className="mt-2 font-satoshi text-xs leading-relaxed text-neutral-500">
                Every instruction you give is replayed into the next round, so a
                correction sticks instead of being undone two drafts later.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t-2 border-neutral-100 pt-5">
              <Button type="submit" name="intent" value="draft" disabled={busy}>
                {running("draft")
                  ? "Writing..."
                  : body.trim()
                    ? "Refine"
                    : "Draft it"}
              </Button>
              <Button
                type="submit"
                name="intent"
                value="killcheck"
                variant="ghost"
                disabled={busy || !body.trim()}
              >
                {running("killcheck") ? "Checking..." : "Run kill check"}
              </Button>
              <Button type="submit" name="intent" value="save" variant="ghost" disabled={busy}>
                {running("save") ? "Saving..." : "Save"}
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

          {post && <KillCheckPanel post={post} />}
        </div>

        <aside className="grid gap-5">
          <div className={`${CARD} p-5`}>
            <h3 className="font-clash text-lg font-medium text-neutral-900">Account</h3>
            <select
              id="accountId"
              name="accountId"
              className={`${INPUT} mt-3`}
              defaultValue={post?.accountId ?? idea?.accountId ?? ""}
            >
              <option value="">Unassigned</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.displayName}
                  {a.active ? "" : " (standby)"}
                </option>
              ))}
            </select>
            {account?.lane === "b2b" && (
              <p className="mt-2 font-satoshi text-xs leading-relaxed text-teal-700">
                B2B account. No webinar content, and the CTA is direct response,
                not a comment gate.
              </p>
            )}

            <div className="mt-5">
              <label className={LABEL} htmlFor="visualPlan">Visual</label>
              <input
                id="visualPlan"
                name="visualPlan"
                className={`${INPUT} mt-1.5`}
                defaultValue={post?.visualPlan ?? ""}
                placeholder="Carousel: 5 slides, the A/B resume"
              />
              <p className="mt-2 font-satoshi text-xs leading-relaxed text-neutral-500">
                The playbook makes this non-negotiable: posts with a visual
                averaged five times the engagement. The kill check fails without it.
              </p>
            </div>
          </div>

          {/* Scheduling is calendar-only, and the copy says so plainly so nobody
              waits on a post that was never going to send itself. */}
          <div className={`${CARD} p-5`}>
            <h3 className="font-clash text-lg font-medium text-neutral-900">Schedule</h3>
            <p className="mt-1 font-satoshi text-xs leading-relaxed text-neutral-500">
              This puts it on the calendar and tells you when it goes out. It does
              not post for you.
            </p>

            <div className="mt-4">
              <label className={LABEL} htmlFor="scheduledFor">Day and time (IST)</label>
              <input
                id="scheduledFor"
                name="scheduledFor"
                type="datetime-local"
                className={`${INPUT} mt-1.5`}
                defaultValue={isoToIstInput(post?.scheduledFor)}
              />
            </div>

            <div className="mt-3">
              <Button
                type="submit"
                name="intent"
                value="schedule"
                className="w-full"
                disabled={busy}
              >
                {running("schedule") ? "Adding..." : "Put it on the calendar"}
              </Button>
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
              <label className={LABEL} htmlFor="scheduledWhere">Queued in</label>
              <input
                id="scheduledWhere"
                name="scheduledWhere"
                className={`${INPUT} mt-1.5`}
                defaultValue={post?.scheduledWhere ?? ""}
                placeholder="Native scheduler, Buffer, manual"
              />
            </div>

            <div className="mt-4">
              <label className={LABEL} htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className={`${INPUT} mt-1.5`}
                defaultValue={post?.notes ?? ""}
                placeholder="Link in first comment, who to tag, anything else."
              />
            </div>
          </div>
        </aside>
      </Form>

      {post && revisions.length > 0 && (
        <section className="mt-12">
          <h2 className="font-clash text-2xl font-medium text-neutral-900">
            Revisions
          </h2>
          <p className="mt-1 font-satoshi text-sm text-neutral-500">
            Every round, newest first. Revert puts that text back in the editor
            as a new revision, so nothing is lost either way.
          </p>
          <div className="mt-5 grid gap-3">
            {revisions.map((r, i) => (
              <div key={r.id} className={`${CARD} p-5`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-satoshi text-sm font-bold text-neutral-900">
                    {r.instruction || (i === revisions.length - 1 ? "First draft" : "No instruction")}
                  </span>
                  <span className="font-satoshi text-xs text-neutral-400">
                    {new Date(r.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap font-satoshi text-sm leading-relaxed text-neutral-600">
                  {r.body}
                </pre>
                {r.body !== body && (
                  <Form method="post" className="mt-3">
                    <input type="hidden" name="id" value={post.id} />
                    <input type="hidden" name="body" value={r.body} />
                    <Button type="submit" name="intent" value="revert" variant="ghost">
                      Revert to this
                    </Button>
                  </Form>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

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
                  <span className="font-satoshi text-[15px] text-neutral-800">{p.title}</span>
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
