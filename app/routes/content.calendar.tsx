import { Form, Link, useSearchParams } from "react-router";
import type { Route } from "./+types/content.calendar";
import { requireContentAccess } from "~/lib/content/guard.server";
import {
  listAccounts,
  listPosts,
  upsertPost,
  getPost,
  learnFromPost,
} from "~/lib/content/store.server";
import {
  POST_STATUSES,
  CONTENT_TZ,
  istInputToIso,
  type ContentAccount,
  type ContentPost,
} from "~/lib/content/model";
import { CARD, INPUT, LABEL, PageHead, Button, Empty, StatusPill } from "~/components/content/ui";

/**
 * The content calendar.
 *
 * All dates are rendered in Asia/Kolkata, pinned explicitly rather than taken
 * from the runtime. The server runs UTC in the cluster and the browser runs
 * whatever the laptop is set to, and a calendar that buckets a 11pm post into
 * a different day on each would be worse than useless.
 */

/** YYYY-MM-DD for an instant, in IST, identical on server and client. */
function istDayKey(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CONTENT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function istTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: CONTENT_TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** The month being shown, as ?month=YYYY-MM, defaulting to the current one in IST. */
function resolveMonth(param: string | null): { year: number; month: number } {
  const match = param?.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    return { year: Number(match[1]), month: Number(match[2]) - 1 };
  }
  const now = new Intl.DateTimeFormat("en-CA", {
    timeZone: CONTENT_TZ,
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
  const [y, m] = now.split("-");
  return { year: Number(y), month: Number(m) - 1 };
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireContentAccess(request);
  if (!user) {
    return {
      accounts: [] as ContentAccount[],
      posts: [] as ContentPost[],
      unscheduled: [] as ContentPost[],
      month: resolveMonth(null),
    };
  }

  const url = new URL(request.url);
  const month = resolveMonth(url.searchParams.get("month"));

  // A week of slack either side so posts that fall in the leading and trailing
  // grid cells of the month view are fetched too.
  const from = new Date(Date.UTC(month.year, month.month, 1) - 8 * 86400000);
  const to = new Date(Date.UTC(month.year, month.month + 1, 1) + 8 * 86400000);

  const [accounts, posts, all] = await Promise.all([
    listAccounts(),
    listPosts({ from, to }),
    listPosts({ limit: 300 }),
  ]);

  return {
    accounts,
    posts,
    unscheduled: all.filter((p) => !p.scheduledFor && p.status !== "posted"),
    month,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireContentAccess(request);
  if (!user) throw new Response("Not authorised.", { status: 403 });

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "quick-add") {
    const title = String(form.get("title") ?? "").trim();
    if (!title) return { error: "A slot needs a title." };
    await upsertPost({
      accountId: form.get("accountId") ? Number(form.get("accountId")) : null,
      title,
      status: String(form.get("status") ?? "idea"),
      scheduledFor: istInputToIso(String(form.get("scheduledFor") ?? "")),
      scheduledWhere: String(form.get("scheduledWhere") ?? "").trim() || null,
      createdBy: user.email,
    });
    return { ok: true };
  }

  if (intent === "schedule") {
    // Only the slot changes here, so read the post first and write it back
    // whole: upsertPost replaces every column, and a partial write would blank
    // the body of a finished draft.
    const id = Number(form.get("id"));
    const existing = await getPost(id);
    if (!existing) return { error: "That post is gone." };
    await upsertPost({
      id,
      accountId: existing.accountId,
      ideaId: existing.ideaId,
      title: existing.title,
      body: existing.body,
      status: String(form.get("status") ?? existing.status),
      scheduledFor: istInputToIso(String(form.get("scheduledFor") ?? "")),
      scheduledWhere:
        String(form.get("scheduledWhere") ?? "").trim() || existing.scheduledWhere,
      notes: existing.notes,
    });
    await learnFromPost(id, user.email);
    return { ok: true };
  }

  return { error: "Unknown action." };
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ACCENT_BAR: Record<string, string> = {
  purple: "border-l-studojo-purple",
  green: "border-l-studojo-green",
  orange: "border-l-studojo-orange",
  pink: "border-l-studojo-pink",
  yellow: "border-l-studojo-yellow",
  teal: "border-l-studojo-teal",
};

export default function ContentCalendar({ loaderData, actionData }: Route.ComponentProps) {
  const { accounts, posts, unscheduled, month } = loaderData;
  const [params, setParams] = useSearchParams();

  const first = new Date(Date.UTC(month.year, month.month, 1));
  const daysInMonth = new Date(Date.UTC(month.year, month.month + 1, 0)).getUTCDate();
  // Monday-first grid.
  const leading = (first.getUTCDay() + 6) % 7;

  const byDay = new Map<string, ContentPost[]>();
  for (const p of posts) {
    if (!p.scheduledFor) continue;
    const key = istDayKey(p.scheduledFor);
    byDay.set(key, [...(byDay.get(key) ?? []), p]);
  }

  const cells: { key: string; day: number | null }[] = [];
  for (let i = 0; i < leading; i++) cells.push({ key: `pad-${i}`, day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${month.year}-${String(month.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ key, day: d });
  }

  const label = new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(first);

  const shift = (delta: number) => {
    const d = new Date(Date.UTC(month.year, month.month + delta, 1));
    const next = new URLSearchParams(params);
    next.set(
      "month",
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
    );
    setParams(next, { replace: true });
  };

  const todayKey = istDayKey(new Date().toISOString());

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <PageHead
        title="Calendar"
        blurb="Every slot across all seven accounts, in IST. Studio tracks what is queued and where. It does not publish, so the post still has to be put into whatever actually sends it."
        actions={
          <>
            <Button variant="ghost" onClick={() => shift(-1)}>Previous</Button>
            <Button variant="ghost" onClick={() => shift(1)}>Next</Button>
          </>
        }
      />

      <h2 className="mt-6 font-clash text-2xl font-medium text-neutral-900">{label}</h2>

      {actionData && "error" in actionData && actionData.error && (
        <p className="mt-3 font-satoshi text-sm text-red-600">{actionData.error}</p>
      )}

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-7 gap-2">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="pb-1 font-satoshi text-xs font-bold uppercase tracking-[0.12em] text-neutral-500"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-2">
            {cells.map((cell) => {
              if (cell.day === null) {
                return <div key={cell.key} className="min-h-[120px] rounded-xl bg-neutral-100/50" />;
              }
              const dayPosts = byDay.get(cell.key) ?? [];
              const isToday = cell.key === todayKey;
              return (
                <div
                  key={cell.key}
                  className={`min-h-[120px] rounded-xl border-2 bg-white p-2 ${
                    isToday ? "border-studojo-purple" : "border-neutral-900/15"
                  }`}
                >
                  <div
                    className={`font-satoshi text-xs font-bold ${
                      isToday ? "text-studojo-purple" : "text-neutral-400"
                    }`}
                  >
                    {cell.day}
                  </div>
                  <div className="mt-1 grid gap-1">
                    {dayPosts.map((p) => (
                      <Link
                        key={p.id}
                        to={`/content/write?post=${p.id}`}
                        className={`block rounded-lg border-l-4 bg-neutral-50 px-2 py-1 transition-colors hover:bg-neutral-100 ${
                          ACCENT_BAR[p.accountAccent ?? "purple"] ?? ACCENT_BAR.purple
                        }`}
                      >
                        <div className="font-satoshi text-[11px] font-bold text-neutral-500">
                          {p.scheduledFor ? istTime(p.scheduledFor) : ""}
                          {p.accountHandle ? ` · ${p.accountHandle}` : ""}
                        </div>
                        <div className="line-clamp-2 font-satoshi text-[12px] leading-snug text-neutral-800">
                          {p.title}
                        </div>
                        <div className="mt-0.5">
                          <StatusPill status={p.status} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section className={`${CARD} mt-10 p-6`}>
        <h2 className="font-clash text-xl font-medium text-neutral-900">Add a slot</h2>
        <p className="mt-1 font-satoshi text-sm text-neutral-500">
          For a post you already know is going out. Write the body later.
        </p>
        <Form method="post" className="mt-4 grid gap-4 md:grid-cols-[1fr_180px_200px_160px_auto]">
          <div>
            <label className={LABEL} htmlFor="qa-title">Title</label>
            <input id="qa-title" name="title" className={`${INPUT} mt-1.5`} required />
          </div>
          <div>
            <label className={LABEL} htmlFor="qa-account">Account</label>
            <select id="qa-account" name="accountId" className={`${INPUT} mt-1.5`}>
              <option value="">Unassigned</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.displayName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="qa-when">Slot (IST)</label>
            <input
              id="qa-when"
              name="scheduledFor"
              type="datetime-local"
              className={`${INPUT} mt-1.5`}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="qa-status">Status</label>
            <select id="qa-status" name="status" className={`${INPUT} mt-1.5`} defaultValue="idea">
              {POST_STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" name="intent" value="quick-add">Add</Button>
          </div>
        </Form>
      </section>

      <section className="mt-10">
        <h2 className="font-clash text-2xl font-medium text-neutral-900">
          Waiting for a slot
        </h2>
        <p className="mt-1 font-satoshi text-sm text-neutral-500">
          Written or part written, nowhere to go yet.
        </p>
        <div className="mt-5 grid gap-3">
          {unscheduled.length === 0 ? (
            <Empty>Everything has a slot.</Empty>
          ) : (
            unscheduled.map((p) => (
              <div key={p.id} className={`${CARD} flex flex-wrap items-center gap-x-4 gap-y-3 p-4`}>
                <StatusPill status={p.status} />
                <Link
                  to={`/content/write?post=${p.id}`}
                  className="font-satoshi text-[15px] font-semibold text-neutral-900 hover:underline"
                >
                  {p.title}
                </Link>
                {p.accountHandle && (
                  <span className="font-satoshi text-xs text-neutral-500">
                    {p.accountHandle}
                  </span>
                )}
                <Form method="post" className="ml-auto flex flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value="scheduled" />
                  <input
                    name="scheduledFor"
                    type="datetime-local"
                    className={`${INPUT} w-auto`}
                    required
                  />
                  <input
                    name="scheduledWhere"
                    className={`${INPUT} w-40`}
                    placeholder="Queued in"
                  />
                  <Button type="submit" name="intent" value="schedule">Schedule</Button>
                </Form>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
