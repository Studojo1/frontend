import { NavLink, Outlet, useLoaderData } from "react-router";
import type { Route } from "./+types/content";
import { requireContentAccess } from "~/lib/content/guard.server";

/**
 * Layout and gate for /content, the internal content studio.
 *
 * Lives on studojo.pro only. requireContentAccess throws a 404 on any other
 * host, so on studojo.com this URL does not exist. Signed-in users who are not
 * on the allowlist get a wall, not a redirect: redirecting a signed-in user to
 * /auth just bounces them back here forever.
 *
 * Under flat routing this file is the parent of every content.*.tsx. Children
 * guard themselves as well, so a direct loader call cannot skip this.
 */

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Content Studio | Studojo" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireContentAccess(request);
  return { user };
}

const NAV = [
  { to: "/content", label: "Overview", end: true },
  { to: "/content/ideas", label: "Ideas", end: false },
  { to: "/content/write", label: "Write", end: false },
  { to: "/content/calendar", label: "Calendar", end: false },
  { to: "/content/accounts", label: "Accounts", end: false },
  { to: "/content/playbook", label: "Playbook", end: false },
  { to: "/content/examples", label: "Real posts", end: false },
];

function SignInWall() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-2xl border-2 border-neutral-900 bg-white p-8 shadow-[6px_6px_0px_0px_rgba(23,23,23,1)]">
        <p className="font-satoshi text-xs font-bold uppercase tracking-[0.18em] text-studojo-purple">
          Studojo internal
        </p>
        <h1 className="mt-3 font-clash text-3xl font-medium text-neutral-900">
          Content Studio
        </h1>
        <p className="mt-3 font-satoshi text-[15px] leading-relaxed text-neutral-600">
          This tool is restricted to two Google accounts. Sign in with one of
          them to continue. If you are already signed in and still seeing this,
          you are signed in as someone else.
        </p>
        <a
          href="/auth?redirect=/content"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl border-2 border-neutral-900 bg-studojo-purple px-5 py-3 font-satoshi text-[15px] font-bold text-white shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(23,23,23,1)]"
        >
          Sign in with Google
        </a>
      </div>
    </main>
  );
}

export default function ContentLayout() {
  const { user } = useLoaderData<typeof loader>();

  if (!user) return <SignInWall />;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b-2 border-neutral-900 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
          <a href="/content" className="font-clash text-xl font-medium text-neutral-900">
            Content Studio
          </a>
          <nav className="flex flex-wrap items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 font-satoshi text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <span className="ml-auto font-satoshi text-xs text-neutral-500">
            {user.email}
          </span>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
