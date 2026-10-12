// /b2cnew: the student desk. An assistant that reads and writes the same
// records as the workspace tabs beside it (Home, People, Inbox, Profile,
// plus Settings), on the student's real matches and outreach. Nothing is sent
// until the student approves it, and in this phase approving does not send.
//
// The loader is only a session gate; all data is fetched in the browser from
// /api/v1/outreach/agent (the session cookie is the auth). Tabs, filters and
// the outreach page are query-string state, so changing them never reruns
// the loader. Shell: app/components/desk/shell.tsx.
import { redirect, useLoaderData, type ShouldRevalidateFunctionArgs } from "react-router";
import { DeskShell } from "~/components/desk/shell";
import { resetDeskCache } from "~/lib/desk/cache";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/b2cnew";

export async function loader({ request }: Route.LoaderArgs) {
  // Local testing against a mock API only. import.meta.env.DEV is the literal
  // false in every production build, so this branch is compiled out there.
  if (import.meta.env.DEV && process.env.DESK_DEV_USER) return { user: { id: process.env.DESK_DEV_USER } };
  const session = await getSessionFromRequest(request);
  if (!session) {
    const url = new URL(request.url);
    throw redirect(`/auth?redirect=${encodeURIComponent(url.pathname + url.search)}`);
  }
  return { user: { id: String(session.user.id) } };
}

/** Query-only changes (tabs, filters, the assistant sheet) skip the session check. */
export function shouldRevalidate({ currentUrl, nextUrl, formMethod, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  if (!formMethod && currentUrl.pathname === nextUrl.pathname) return false;
  return defaultShouldRevalidate;
}

export function meta() {
  return [
    { title: "Studojo | Your outreach desk" },
    {
      name: "description",
      content: "Your matched hiring managers, your drafts and your replies in one place, with an assistant that writes with you. Nothing is sent until you approve it.",
    },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

// The signed-in student this browser's desk cache belongs to (client only).
let cacheOwner: string | null = null;

/**
 * A different account in the same tab must never see the last one's data.
 * Runs before the shell renders (an effect would run after the shell's own
 * effects had already read the cache). Switching accounts goes through
 * /auth, so the desk is unmounted and nothing is subscribed at this point.
 */
function claimCache(userId: string) {
  if (typeof window === "undefined" || cacheOwner === userId) return;
  if (cacheOwner) resetDeskCache();
  cacheOwner = userId;
}

export default function B2CNewRoute() {
  const { user } = useLoaderData<typeof loader>();
  claimCache(user.id);
  return <DeskShell key={user.id} />;
}
