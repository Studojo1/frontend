import { Link } from "react-router";
import type { Route } from "./+types/content._index";
import { requireContentAccess } from "~/lib/content/guard.server";
import { contentStats, listPosts } from "~/lib/content/store.server";
import { CARD, PageHead, Tile, StatusPill, Empty } from "~/components/content/ui";

/** The landing view at /content: what is where, and what is due next. */

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireContentAccess(request);
  if (!user) return { stats: null, upcoming: [] };

  const now = new Date();
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const [stats, upcoming] = await Promise.all([
    contentStats(),
    listPosts({ from: now, to: in14Days, limit: 12 }),
  ]);
  return { stats, upcoming };
}

const STEPS = [
  {
    to: "/content/accounts",
    title: "1. Accounts",
    body: "The seven handles. Each one carries its own voice, audience and notes, and that is what the model writes against.",
  },
  {
    to: "/content/playbook",
    title: "2. Playbook",
    body: "Your LinkedIn rules: how to ideate, how to write, the skills and example posts. Everything flagged here is fed into every generation.",
  },
  {
    to: "/content/ideas",
    title: "3. Ideate",
    body: "Generate ideas per account. Keep the good ones, bin the rest, promote a keeper straight into a draft.",
  },
  {
    to: "/content/write",
    title: "4. Write",
    body: "Draft and rewrite the post body against the playbook. Save it and it lands on the calendar.",
  },
  {
    to: "/content/calendar",
    title: "5. Schedule",
    body: "Put a slot and a destination on it, then copy the body into the tool that posts. Studio tracks the state, it does not post for you.",
  },
];

export default function ContentOverview({ loaderData }: Route.ComponentProps) {
  const { stats, upcoming } = loaderData;

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
