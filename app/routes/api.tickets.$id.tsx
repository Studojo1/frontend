// GET /api/tickets/:id — fetch a single ticket + its full message thread.
// Only the owner can read. Returns 404 (not 403) if a ticket isn't
// theirs, to avoid leaking which IDs exist.
import type { Route } from "./+types/api.tickets.$id";
import { sql } from "drizzle-orm";
import db from "~/lib/db";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { ensureTicketTables } from "~/lib/tickets.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  await ensureTicketTables();

  const ticketRes = await db.execute(sql`
    SELECT id, category, status, source, context, attachments,
           created_at, updated_at, closed_at
    FROM tickets
    WHERE id = ${id} AND user_id = ${session.user.id}
    LIMIT 1
  `);
  const ticket = ticketRes.rows[0];
  if (!ticket) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const messagesRes = await db.execute(sql`
    SELECT id, ticket_id, author_type, author_email, body, created_at
    FROM ticket_messages
    WHERE ticket_id = ${id}
    ORDER BY created_at ASC
  `);

  return Response.json({
    ...(ticket as Record<string, any>),
    messages: messagesRes.rows,
  });
}
