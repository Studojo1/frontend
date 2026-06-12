import type { Route } from "./+types/api.email-preferences";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import {
  getEmailPreferences,
  updateEmailPreferences,
  type EmailPreferencesUpdate,
} from "~/lib/emailer";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// GET /api/email-preferences — returns the signed-in user's email preferences.
// Server-side proxy: holds EMAILER_INTERNAL_SECRET and scopes the lookup to the
// authenticated session so the secret never reaches the browser.
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return json({ error: "Authentication required" }, 401);
  try {
    const prefs = await getEmailPreferences(session.user.id);
    return json(prefs);
  } catch (err: any) {
    return json({ error: err?.message || "Failed to load preferences" }, 500);
  }
}

// PUT /api/email-preferences — updates the signed-in user's email preferences.
// userId comes from the session, never the request body, so a user can only ever
// change their own preferences (this is what closes the IDOR on the emailer).
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "PUT" && request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  const session = await getSessionFromRequest(request);
  if (!session) return json({ error: "Authentication required" }, 401);

  let body: EmailPreferencesUpdate;
  try {
    body = (await request.json()) as EmailPreferencesUpdate;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  try {
    const updated = await updateEmailPreferences(session.user.id, body);
    return json(updated);
  } catch (err: any) {
    return json({ error: err?.message || "Failed to update preferences" }, 500);
  }
}
