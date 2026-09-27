import { Link } from "react-router";
import type { Route } from "./+types/content._index";
import { requireContentAccess } from "~/lib/content/guard.server";
import { contentStats, listPosts, rosterWeek } from "~/lib/content/store.server";
import { CARD, PageHead, Tile, StatusPill, Empty } from "~/components/content/ui";

/** The landing view at /content: what is where, and what is due next. */

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireContentAccess(request);
  if (!user) return { stats: null, upcoming: [], week: [] };

  const now = new Date();
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const [stats, upcoming, week] = await Promise.all([
    contentStats(),
    listPosts({ from: now, to: in14Days, limit: 12 }),
    rosterWeek(),
  ]);
  return { stats, upcoming, week };
}

const STEPS = [
  {
    to: "/content/accounts",
    title: "1. Accounts",
    body: "Six live, Vanshika on standby. Voice, audience and lane go into every prompt, so a thin persona produces thin posts.",
  },
  {
    to: "/content/playbook",
    title: "2. Playbook",
    body: "The studojo-content skill: hook tiers, story engines, the kill check, the done-ideas list. The rules.",
  },
  {
    to: "/content/examples",
    title: "3. Real posts",
    body: "87 posts that actually went out. The rules say what to do, these show what it sounds like. Anything you schedule is added here automatically.",
  },
  {
    to: "/content/ideas",
    title: "4. Ideate",
    body: "Ideas come with a hook, a hook tier, a story engine and the reason they are not a repeat. Shortlist what is worth writing.",
  },
  {
    to: "/content/write",
    title: "5. Write",
    body: "Draft, then tell it what to change and draft again. Corrections carry forward. Run the kill check before you call it done.",
  },
  {
    to: "/content/calendar",
    title: "6. Schedule",
    body: "Pick the day and it lands on the calendar so you know when it goes out. Nothing here posts for you.",
  },
];

const BAR_TONE: Record<string, string> = {
  purple: "bg-studojo-purple",
  green: "bg-studojo-green",
  orange: "bg-studojo-orange",
  pink: "bg-studojo-pink",
  yellow: "bg-studojo-yellow",
  teal: "bg-studojo-teal",
};

export default function ContentOverview({ loaderData }: Route.ComponentProps) {
  const { stats, upcoming, week } = loaderData;
  const weekDone = week.reduce((n, a) => n + a.done, 0);
  const weekTarget = week.reduce((n, a) => n + a.target, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <PageHead
        title="Overview"
        blurb="The whole loop in one place: accounts, playbook, ideas, drafts, calendar. Staging only, two accounts, not indexed."
      />

      {stats && (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Tile label="Accounts" value={stats.accounts} sub="active" />
          <Tile label="Open ideas" value={stats.openIdeas} sub="new or kept" />
          <Tile label="In progress" value={stats.inProgress} sub="not yet scheduled" />
          <Tile label="Scheduled" value={stats.scheduled} />
          <Tile label="Next 7 days" value={stats.next7Days} />
          <Tile label="Posted" value={stats.posted} sub="all time" />
        </div>
      )}

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-clash text-2xl font-medium text-neutral-900">
            This week
          </h2>
          <span className="font-satoshi text-sm font-bold text-neutral-900">
            {weekDone} of {weekTarget} scheduled
          </span>
        </div>
        <p className="mt-1 font-satoshi text-sm text-neutral-500">
          Monday to Sunday, IST. A post counts once it has a slot on the calendar.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {week.length === 0 ? (
            <Empty>
              No live accounts.{" "}
              <Link to="/content/accounts" className="font-bold text-studojo-purple underline">
                Set the roster up
              </Link>
              .
            </Empty>
          ) : (
            week.map((a) => (
              <Link
                key={a.accountId}
                to={`/content/ideas?account=${a.accountId}`}
                className={`${CARD} p-4 transition-transform hover:translate-x-[1px] hover:translate-y-[1px]`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-satoshi text-sm font-bold text-neutral-900">
                    {a.displayName}
                    {a.lane === "b2b" && (
                      <span className="ml-1.5 font-normal text-xs text-teal-700">B2B</span>
                    )}
                  </span>
                  <span
                    className={`font-satoshi text-sm font-bold ${
                      a.done >= a.target ? "text-emerald-700" : "text-neutral-400"
                    }`}
                  >
                    {a.done}/{a.target}
                  </span>
                </div>
                <div className="mt-2 flex gap-1" aria-hidden>
                  {Array.from({ length: Math.max(a.target, a.done) }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < a.done ? BAR_TONE[a.accent] ?? BAR_TONE.purple : "bg-neutral-200"
                      }`}
                    />
                  ))}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-clash text-2xl font-medium text-neutral-900">
          Coming up
        </h2>
        <p className="mt-1 font-satoshi text-sm text-neutral-500">
          Scheduled slots in the next fourteen days.
        </p>
        <div className="mt-5">
          {upcoming.length === 0 ? (
            <Empty>
              Nothing scheduled yet.{" "}
              <Link to="/content/calendar" className="font-bold text-studojo-purple underline">
                Open the calendar
              </Link>{" "}
              to put something in a slot.
            </Empty>
          ) : (
            <div className={`${CARD} divide-y-2 divide-neutral-100 overflow-hidden`}>
              {upcoming.map((p) => (
                <Link
                  key={p.id}
                  to={`/content/write?post=${p.id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-neutral-50"
                >
                  <span className="font-satoshi text-sm font-bold text-neutral-900">
                    {p.scheduledFor
                      ? new Date(p.scheduledFor).toLocaleString("en-IN", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Unscheduled"}
                  </span>
                  <span className="font-satoshi text-[15px] text-neutral-700">
                    {p.title}
                  </span>
                  {p.accountHandle && (
                    <span className="font-satoshi text-xs text-neutral-500">
                      {p.accountHandle}
                    </span>
                  )}
                  <span className="ml-auto">
                    <StatusPill status={p.status} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-clash text-2xl font-medium text-neutral-900">
          How this fits together
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className={`${CARD} p-5 transition-transform hover:translate-x-[1px] hover:translate-y-[1px]`}
            >
              <div className="font-clash text-lg font-medium text-neutral-900">
                {s.title}
              </div>
              <p className="mt-2 font-satoshi text-sm leading-relaxed text-neutral-600">
                {s.body}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
