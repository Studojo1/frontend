import { useState } from "react";
import { Form, Link, useNavigation, useSearchParams } from "react-router";
import type { Route } from "./+types/content.ideas";
import { requireContentAccess } from "~/lib/content/guard.server";
import {
  listAccounts,
  listIdeas,
  saveIdeas,
  setIdeaStatus,
  updateIdea,
  deleteIdea,
  usedAngles,
} from "~/lib/content/store.server";
import {
  IDEA_STATUSES,
  type ContentAccount,
  type ContentIdea,
} from "~/lib/content/model";
import { generateIdeas, ContentLlmError } from "~/lib/content/llm.server";
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
 * The idea generator.
 *
 * Ideas are written to the database as they are generated rather than held in
 * client state: a batch you liked should survive a refresh, and the next
 * generation needs the previous titles to avoid repeating itself.
 */

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireContentAccess(request);
  if (!user) return { accounts: [] as ContentAccount[], ideas: [] as ContentIdea[] };

  const url = new URL(request.url);
  const accountId = url.searchParams.get("account");
  const status = url.searchParams.get("status");

  const [accounts, ideas] = await Promise.all([
    listAccounts(),
    listIdeas({
      accountId: accountId ? Number(accountId) : null,
      status: status && status !== "all" ? status : null,
    }),
  ]);
  return { accounts, ideas };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireContentAccess(request);
  if (!user) throw new Response("Not authorised.", { status: 403 });

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "status") {
    await setIdeaStatus(Number(form.get("id")), String(form.get("status")));
    return { ok: true };
  }

  if (intent === "edit") {
    const title = String(form.get("title") ?? "").trim();
    if (!title) return { error: "An idea needs a title." };
    await updateIdea({
      id: Number(form.get("id")),
      title,
      hook: String(form.get("hook") ?? "").trim() || null,
      angle: String(form.get("angle") ?? "").trim() || null,
      cinematicDetail: String(form.get("cinematicDetail") ?? "").trim() || null,
      pillar: String(form.get("pillar") ?? "").trim() || null,
    });
    return { ok: true };
  }

  if (intent === "delete") {
    await deleteIdea(Number(form.get("id")));
    return { ok: true };
  }

  if (intent === "generate") {
    const accountId = form.get("accountId") ? Number(form.get("accountId")) : null;
    const accounts = await listAccounts();
    const account = accounts.find((a) => a.id === accountId) ?? null;

    // Roster wide, not per account. The playbook treats an idea as done once it
    // has run anywhere, because these audiences already overlap.
    const used = await usedAngles(200);

    try {
      const ideas = await generateIdeas({
        account,
        brief: String(form.get("brief") ?? "").trim(),
        count: Number(form.get("count") ?? 6),
        usedAngles: used,
      });
      await saveIdeas(ideas, { accountId, source: "ai", createdBy: user.email });
      return { ok: true, generated: ideas.length };
    } catch (err) {
      return {
        error:
          err instanceof ContentLlmError
            ? err.message
            : "Generation failed. Try again in a moment.",
      };
    }
  }

  return { error: "Unknown action." };
}

function Tag({
  children,
  tone = "plain",
}: {
  children: React.ReactNode;
  tone?: "plain" | "strong";
}) {
  return (
    <span
      className={`inline-block rounded-lg px-2 py-0.5 font-satoshi text-[11px] font-bold ${
        tone === "strong"
          ? "bg-studojo-purple-bg text-studojo-purple"
          : "bg-neutral-100 text-neutral-600"
      }`}
    >
      {children}
    </span>
  );
}

export default function ContentIdeas({ loaderData, actionData }: Route.ComponentProps) {
  const { accounts, ideas } = loaderData;
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<number | null>(null);
  const nav = useNavigation();
  const generating =
    nav.state === "submitting" && nav.formData?.get("intent") === "generate";

  const accountFilter = params.get("account") ?? "";
  const statusFilter = params.get("status") ?? "all";

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <PageHead
        title="Ideas"
        blurb="Generate against an account's voice and your playbook. Keep what is worth writing, bin the rest, then send a keeper to the writer."
      />

      <section className={`${CARD} mt-8 p-6`}>
        <Form method="post" className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-[1fr_200px_140px]">
            <div>
              <label className={LABEL} htmlFor="brief">Brief</label>
              <input
                id="brief"
                name="brief"
                className={`${INPUT} mt-1.5`}
                placeholder="What should this batch be about? Leave empty to let the playbook decide."
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="accountId">Account</label>
              <select
                id="accountId"
                name="accountId"
                className={`${INPUT} mt-1.5`}
                defaultValue={accountFilter}
              >
                <option value="">No specific account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="count">How many</label>
              <select id="count" name="count" className={`${INPUT} mt-1.5`} defaultValue="6">
                {[3, 6, 9, 12].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Button type="submit" name="intent" value="generate" disabled={generating}>
              {generating ? "Thinking..." : "Generate ideas"}
            </Button>
          </div>
        </Form>

        {actionData && "error" in actionData && actionData.error && (
          <div className="mt-4">
            <ErrorNote>{actionData.error}</ErrorNote>
          </div>
        )}
        {actionData && "generated" in actionData && actionData.generated ? (
          <p className="mt-4 font-satoshi text-sm text-emerald-700">
            {actionData.generated} new ideas saved below.
          </p>
        ) : null}

        {accounts.length === 0 && (
          <p className="mt-4 font-satoshi text-sm text-neutral-500">
            No accounts set up yet.{" "}
            <Link to="/content/accounts" className="font-bold text-studojo-purple underline">
              Add one
            </Link>{" "}
            so ideas are generated in that account's voice.
          </p>
        )}
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <span className={LABEL}>Showing</span>
        <select
          className={`${INPUT} w-auto`}
          value={accountFilter}
          onChange={(e) => setParam("account", e.target.value)}
        >
          <option value="">All accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.displayName}</option>
          ))}
        </select>
        <select
          className={`${INPUT} w-auto`}
          value={statusFilter}
          onChange={(e) => setParam("status", e.target.value)}
        >
          {["all", ...IDEA_STATUSES].map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
        <span className="font-satoshi text-sm text-neutral-500">
          {ideas.length} idea{ideas.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        {ideas.length === 0 ? (
          <Empty>Nothing here. Generate a batch above.</Empty>
        ) : (
          ideas.map((idea) => (
            <article key={idea.id} className={`${CARD} p-6`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {editing === idea.id ? (
                    <Form method="post" className="grid gap-3" onSubmit={() => setEditing(null)}>
                      <input type="hidden" name="id" value={idea.id} />
                      <div>
                        <label className={LABEL}>Hook, the literal first line</label>
                        <textarea
                          name="hook"
                          rows={2}
                          className={`${INPUT} mt-1.5`}
                          defaultValue={idea.hook ?? ""}
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-[1fr_200px]">
                        <div>
                          <label className={LABEL}>Title</label>
                          <input
                            name="title"
                            className={`${INPUT} mt-1.5`}
                            defaultValue={idea.title}
                            required
                          />
                        </div>
                        <div>
                          <label className={LABEL}>Pillar</label>
                          <input
                            name="pillar"
                            className={`${INPUT} mt-1.5`}
                            defaultValue={idea.pillar ?? ""}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={LABEL}>Built around</label>
                        <input
                          name="cinematicDetail"
                          className={`${INPUT} mt-1.5`}
                          defaultValue={idea.cinematicDetail ?? ""}
                        />
                      </div>
                      <div>
                        <label className={LABEL}>Angle</label>
                        <textarea
                          name="angle"
                          rows={2}
                          className={`${INPUT} mt-1.5`}
                          defaultValue={idea.angle ?? ""}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" name="intent" value="edit">Save idea</Button>
                        <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                      </div>
                    </Form>
                  ) : (
                  <>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={idea.status} />
                    {idea.pillar && (
                      <span className="font-satoshi text-xs font-semibold text-studojo-purple">
                        {idea.pillar}
                      </span>
                    )}
                    {idea.accountHandle && (
                      <span className="font-satoshi text-xs text-neutral-500">
                        {idea.accountHandle}
                      </span>
                    )}
                  </div>
                  {/* The hook leads. It is the thing that has to pass the viral
                      bar, so it is what you should be judging, not the title. */}
                  {idea.hook && (
                    <p className="mt-2 font-clash text-xl font-medium leading-snug text-neutral-900">
                      {idea.hook}
                    </p>
                  )}
                  <p className="mt-2 font-satoshi text-sm text-neutral-500">
                    {idea.title}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {idea.hookType && (
                      <Tag tone={idea.hookTier === "Tier 1" ? "strong" : "plain"}>
                        {idea.hookType}
                        {idea.hookTier ? ` · ${idea.hookTier}` : ""}
                      </Tag>
                    )}
                    {idea.storyEngine && <Tag tone="plain">{idea.storyEngine}</Tag>}
                  </div>

                  {idea.cinematicDetail && (
                    <p className="mt-3 border-l-4 border-studojo-purple-light pl-3 font-satoshi text-[15px] leading-relaxed text-neutral-800">
                      {idea.cinematicDetail}
                    </p>
                  )}
                  {idea.angle && (
                    <p className="mt-3 font-satoshi text-sm leading-relaxed text-neutral-700">
                      {idea.angle}
                    </p>
                  )}
                  <dl className="mt-3 grid gap-1">
                    {idea.whyItWorks && (
                      <div className="font-satoshi text-sm leading-relaxed text-neutral-500">
                        <dt className="inline font-bold">Why it lands: </dt>
                        <dd className="inline">{idea.whyItWorks}</dd>
                      </div>
                    )}
                    {idea.whyDifferent && (
                      <div className="font-satoshi text-sm leading-relaxed text-neutral-500">
                        <dt className="inline font-bold">Not a repeat because: </dt>
                        <dd className="inline">{idea.whyDifferent}</dd>
                      </div>
                    )}
                  </dl>
                  </>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t-2 border-neutral-100 pt-4">
                <Link
                  to={`/content/write?idea=${idea.id}`}
                  className="inline-flex items-center rounded-xl border-2 border-neutral-900 bg-studojo-purple px-4 py-2 font-satoshi text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(23,23,23,1)]"
                >
                  Write this
                </Link>
                {idea.status !== "kept" && (
                  <Form method="post">
                    <input type="hidden" name="id" value={idea.id} />
                    <input type="hidden" name="status" value="kept" />
                    <Button type="submit" name="intent" value="status" variant="ghost">
                      Shortlist
                    </Button>
                  </Form>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setEditing(editing === idea.id ? null : idea.id)}
                >
                  {editing === idea.id ? "Close" : "Fix it"}
                </Button>
                {idea.status !== "binned" && (
                  <Form method="post">
                    <input type="hidden" name="id" value={idea.id} />
                    <input type="hidden" name="status" value="binned" />
                    <Button type="submit" name="intent" value="status" variant="ghost">
                      Bin
                    </Button>
                  </Form>
                )}
                <Form
                  method="post"
                  onSubmit={(e) => {
                    if (!confirm("Delete this idea for good?")) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={idea.id} />
                  <Button type="submit" name="intent" value="delete" variant="danger">
                    Delete
                  </Button>
                </Form>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
