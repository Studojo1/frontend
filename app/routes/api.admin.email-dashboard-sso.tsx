import { getSessionFromRequest } from "~/lib/onboarding.server";
import { getToken } from "~/lib/control-plane";
import type { Route } from "./+types/api.admin.email-dashboard-sso";

// Redirect admins to the email dashboard with their JWT pre-filled in the URL fragment.
// The fragment (#token=...) is never sent to servers, so it won't appear in logs.
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/?error=unauthenticated" },
    });
  }

  if (session.user.role !== "admin") {
    return new Response(null, {
      status: 302,
      headers: { Location: "/?error=forbidden" },
    });
  }

  const token = await getToken(request.headers, request.url);
  if (!token) {
    return new Response("Failed to retrieve auth token", { status: 500 });
  }

  // Pass token in URL fragment — not sent to server, stays client-side only
  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://email.studojo.com/mail/#token=${token}`,
    },
  });
}
