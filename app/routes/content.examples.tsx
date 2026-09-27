import { useState } from "react";
import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/content.examples";
import { requireContentAccess } from "~/lib/content/guard.server";
import {
  listAccounts,
  listExamples,
  addExample,
  setExemplar,
  deleteExample,
  splitPastedPosts,
  parseScrapeExport,
  matchAccountHandle,
} from "~/lib/content/store.server";
import type { ContentAccount, ContentExample } from "~/lib/content/model";
import {
  CARD,
  INPUT,
  LABEL,
  PageHead,
  Button,
  Empty,
  ErrorNote,
} from "~/components/content/ui";

/**
 * The voice corpus: real posts the model learns the voice from.
 *
 * Separate from the playbook because the two do different jobs. The playbook
 * is rules, which produce competent generic writing on their own. These are
 * worked examples, which is what makes a draft sound like a person. Both go
 * into every prompt.
 *
 * Posts written in the studio land here on their own the moment they are
 * scheduled or posted, so the corpus grows without anyone maintaining it.
 */

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireContentAccess(request);
  if (!user) {
    return { accounts: [] as ContentAccount[], examples: [] as ContentExample[] };
  }
  const [accounts, examples] = await Promise.all([listAccounts(), listExamples()]);
  return { accounts, examples };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireContentAccess(request);
  if (!user) throw new Response("Not authorised.", { status: 403 });

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "delete") {
    await deleteExample(Number(form.get("id")));
    return { ok: true };
  }

  if (intent === "exemplar") {
    await setExemplar(Number(form.get("id")), form.get("value") === "1");
    return { ok: true };
  }

  if (intent === "import-scrape") {
    const raw = String(form.get("json") ?? "").trim();
    if (!raw) return { error: "Paste the scraper's JSON first." };

    let posts;
    try {
      posts = parseScrapeExport(raw);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not read that file." };
    }

    const accounts = await listAccounts();
    let added = 0;
    for (const post of posts) {
      const accountId = matchAccountHandle(post.handle, accounts);
      if (
        await addExample({
          accountId,
          body: post.body,
          engagement: post.engagement,
          source: "imported",
          notes: post.postedAt ? `Posted ${post.postedAt}` : null,
          createdBy: user.email,
        })
      ) {
        added += 1;
      }
    }
    return { ok: true, added, skipped: posts.length - added };
  }

  if (intent === "import") {
    const raw = String(form.get("posts") ?? "");
    const accountId = form.get("accountId") ? Number(form.get("accountId")) : null;
    const posts = splitPastedPosts(raw);
    if (posts.length === 0) return { error: "Nothing to import." };

    let added = 0;
    for (const body of posts) {
      if (await addExample({ accountId, body, source: "imported", createdBy: user.email })) {
        added += 1;
      }
    }
    return {
      ok: true,
      added,
      skipped: posts.length - added,
    };
  }

  return { error: "Unknown action." };
}

export default function ContentExamples({ loaderData, actionData }: Route.ComponentProps) {
  const { accounts, examples } = loaderData;
  const nav = useNavigation();
  const importing =
    nav.state === "submitting" &&
    String(nav.formData?.get("intent") ?? "").startsWith("import");
  const [open, setOpen] = useState<number | null>(null);

  const exemplars = examples.filter((e) => e.isExemplar).length;
  const shipped = examples.filter((e) => e.source === "shipped").length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <PageHead
        title="Real posts"
        blurb="The posts the model learns the voice from. The playbook says what the rules are, these show what the writing actually sounds like. Both go into every draft."
      />

      <p className="mt-3 font-satoshi text-sm text-neutral-500">
        {examples.length} posts, {exemplars} marked as standouts, {shipped} added
        automatically from the studio.
      </p>

      {actionData && "error" in actionData && actionData.error && (
        <div className="mt-6">
          <ErrorNote>{actionData.error}</ErrorNote>
        </div>
      )}
      {actionData && "added" in actionData && (
        <p className="mt-4 font-satoshi text-sm text-emerald-700">
          Imported {actionData.added} posts.
          {(actionData.skipped ?? 0) > 0 &&
            ` Skipped ${actionData.skipped} that were already here.`}
        </p>
      )}

      <section className={`${CARD} mt-8 p-6`}>
        <h2 className="font-clash text-xl font-medium text-neutral-900">
          Import a scrape
        </h2>
        <p className="mt-1 font-satoshi text-sm leading-relaxed text-neutral-600">
          Paste the LinkedIn profile-posts export straight from the scraper, as
          JSON. Profiles are matched to accounts automatically and engagement
          comes across with each post. Duplicates are skipped, so re-importing a
          wider scrape only adds what is new.
        </p>
        <Form method="post" className="mt-5 grid gap-4">
          <div>
            <label className={LABEL} htmlFor="json">Scraper JSON</label>
            <textarea
              id="json"
              name="json"
              rows={6}
              className={`${INPUT} mt-1.5 font-mono text-[12px]`}
              placeholder='[{"author":{"publicIdentifier":"..."},"content":"...","engagement":{"likes":12}}]'
              required
            />
          </div>
          <div>
            <Button type="submit" name="intent" value="import-scrape" disabled={importing}>
              {importing ? "Importing..." : "Import scrape"}
            </Button>
          </div>
        </Form>
      </section>

      <section className={`${CARD} mt-6 p-6`}>
        <h2 className="font-clash text-xl font-medium text-neutral-900">
          Or paste posts by hand
        </h2>
        <p className="mt-1 font-satoshi text-sm leading-relaxed text-neutral-600">
          One post after another, separated by a line of three dashes. Paste the
          body exactly as it went out, line breaks and all: the rhythm is the
          thing being learned, and tidying it up defeats the point. Duplicates
          are skipped, so re-pasting a scrape is safe.
        </p>

        <Form method="post" className="mt-5 grid gap-4">
          <div className="md:w-72">
            <label className={LABEL} htmlFor="accountId">Whose posts are these</label>
            <select id="accountId" name="accountId" className={`${INPUT} mt-1.5`}>
              <option value="">Not sure, mixed</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.displayName}</option>
              ))}
            </select>
            <p className="mt-1.5 font-satoshi text-xs leading-relaxed text-neutral-500">
              Attributed posts are weighted first when writing for that account,
              so it sounds like them and not like the roster average.
            </p>
          </div>

          <div>
            <label className={LABEL} htmlFor="posts">Posts</label>
            <textarea
              id="posts"
              name="posts"
              rows={16}
              className={`${INPUT} mt-1.5 font-mono text-[13px] leading-relaxed`}
              placeholder={
                "if you're not from IIT, nobody's coming to save your career\n\nand it's true...\n\n---\n\nwe ran a small experiment. (to figure out why your resume sucks!)\n\n..."
              }
              required
            />
          </div>

          <div>
            <Button type="submit" name="intent" value="import" disabled={importing}>
              {importing ? "Importing..." : "Import posts"}
            </Button>
          </div>
        </Form>
      </section>

      <div className="mt-10 grid gap-4">
        {examples.length === 0 ? (
          <Empty>
            Nothing here yet. Until real posts are added, drafts are written from
            rules alone and will read more generic than they should.
          </Empty>
        ) : (
          examples.map((e) => (
            <article key={e.id} className={`${CARD} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-clash text-lg font-medium leading-snug text-neutral-900">
                    {e.hook}
                  </p>
                  <p className="mt-1 font-satoshi text-xs text-neutral-500">
                    {e.accountHandle ?? "unattributed"}
                    {e.source === "shipped" && " · written here"}
                    {e.engagement != null && ` · ${e.engagement} engagement`}
                    {e.isExemplar && " · standout"}
                    {` · ${e.body.trim().split(/\s+/).filter(Boolean).length} words`}
                  </p>
                </div>
              </div>

              {open === e.id && (
                <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-neutral-50 p-4 font-satoshi text-sm leading-relaxed text-neutral-700">
                  {e.body}
                </pre>
              )}

              <div className="mt-4 flex flex-wrap gap-2 border-t-2 border-neutral-100 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setOpen(open === e.id ? null : e.id)}
                >
                  {open === e.id ? "Hide" : "Read it"}
                </Button>
                <Form method="post">
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="value" value={e.isExemplar ? "0" : "1"} />
                  <Button type="submit" name="intent" value="exemplar" variant="ghost">
                    {e.isExemplar ? "Not a standout" : "Mark as standout"}
                  </Button>
                </Form>
                <Form
                  method="post"
                  onSubmit={(ev) => {
                    if (!confirm("Remove this post from the corpus?")) ev.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={e.id} />
                  <Button type="submit" name="intent" value="delete" variant="danger">
                    Remove
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
