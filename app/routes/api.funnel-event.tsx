import { auth } from "~/lib/auth";
import db from "~/lib/db";
import { systemEvents } from "../../auth-schema";
import type { Route } from "./+types/api.funnel-event";

/** POST /api/funnel-event: server-side record of the signup funnel steps.
 *
 * Between "session created" and "resume uploaded" nothing was written, so a
 * student who stalled there left no trace. These rows make that stretch
 * observable in Postgres without depending on client analytics.
 *
 * Only known step names are accepted; the user id comes from the session,
 * never the body. anon_id links the pre-login auth view to the later user.
 */

// EX-06: the auth_* steps carry an in_app flag (instagram, facebook or null) so
// the in-app browser drop point can be found: view, Google click, OAuth error
// return, email submit.
const EVENTS = new Set([
  "auth_view", "upload_view",
  "auth_google_click", "auth_email_submit", "auth_oauth_error",
  "auth_in_app_copy_link", "auth_in_app_open_chrome",
]);
const IN_APP = new Set(["instagram", "facebook"]);

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    event?: string;
    anon_id?: string;
    path?: string;
    in_app?: string | null;
    info?: string;
  };
  if (!body.event || !EVENTS.has(body.event)) {
    return Response.json({ error: "Unknown event" }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null);

  await db.insert(systemEvents).values({
    eventType: `funnel_${body.event}`,
    userId: session?.user?.id ?? null,
    metadata: {
      anon_id: String(body.anon_id ?? "").slice(0, 64) || null,
      path: String(body.path ?? "").slice(0, 300) || null,
      in_app: body.in_app && IN_APP.has(body.in_app) ? body.in_app : null,
      info: String(body.info ?? "").slice(0, 64) || null,
    },
  });
  return Response.json({ ok: true });
}
