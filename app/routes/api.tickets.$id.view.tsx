// POST /api/tickets/:id/view — mark the thread as read for this user.
// Called by the chat widget when the user opens a thread, so the unread
// admin-reply badge clears.
import type { Route } from "./+types/api.tickets.$id.view";
import { sql } from "drizzle-orm";
import db from "~/lib/db";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { ensureTicketTables } from "~/lib/tickets.server";

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  await ensureTicketTables();

  const r = await db.execute(sql`
    UPDATE tickets
    SET user_last_viewed_at = NOW()
    WHERE id = ${id} AND user_id = ${session.user.id}
    RETURNING id
  `);
  return Response.json({ ok: r.rows.length > 0 });
}
