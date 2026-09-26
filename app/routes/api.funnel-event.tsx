import { auth } from "~/lib/auth";
import db from "~/lib/db";
import { systemEvents } from "../../auth-schema";
import type { Route } from "./+types/api.funnel-event";

/** POST /api/funnel-event — server-side record of the signup funnel steps.
 *
 * Between "session created" and "resume uploaded" nothing was written, so a
 * student who stalled there left no trace. These rows make that stretch
 * observable in Postgres without depending on client analytics.
 *
 * Only known step names are accepted; the user id comes from the session,
 * never the body. anon_id links the pre-login auth view to the later user.
 */

const EVENTS = new Set(["auth_view", "upload_view"]);

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    event?: string;
    anon_id?: string;
    path?: string;
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
    },
  });
  return Response.json({ ok: true });
}
