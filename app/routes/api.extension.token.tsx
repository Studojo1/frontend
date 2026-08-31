// POST /api/extension/token
// Mints a long-lived token for the browser extension.
//
// Called by /extension/connect AFTER the user is signed in, so the sign-in,
// sign-up and Google OAuth steps are all handled by the existing BetterAuth
// flow — this route adds no auth of its own.
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { mintExtensionToken } from "~/lib/extension-auth.server";
import type { Route } from "./+types/api.extension.token";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Same-origin call from our own page, so the session cookie is present.
  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const token = await mintExtensionToken(session.user.id);
  return Response.json({
    token,
    user: { name: session.user.name, email: session.user.email },
  });
}
