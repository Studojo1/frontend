// POST /api/tickets/:id/messages — user follow-up on their own ticket.
// Refuses if the ticket is resolved/wont_fix or belongs to someone else.
import type { Route } from "./+types/api.tickets.$id.messages";
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

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const text = String(body?.body || "").trim();
  if (text.length < 1) {
    return Response.json({ error: "Message can't be empty" }, { status: 400 });
  }
  if (text.length > 5000) {
    return Response.json(
      { error: "Message too long (5000 chars max)" },
      { status: 400 },
    );
  }

  await ensureTicketTables();

  // Confirm ownership + that the ticket is still open. 404 for everything
  // unowned so we don't leak which IDs exist.
  const tRes = await db.execute(sql`
    SELECT status FROM tickets
    WHERE id = ${id} AND user_id = ${session.user.id}
    LIMIT 1
  `);
  const ticket = tRes.rows[0] as { status?: string } | undefined;
  if (!ticket) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (ticket.status === "resolved" || ticket.status === "wont_fix") {
    return Response.json(
      { error: "This ticket is closed. Open a new one if you need more help." },
      { status: 409 },
    );
  }

  const msgRes = await db.execute(sql`
    INSERT INTO ticket_messages (ticket_id, author_type, author_id, author_email, body)
    VALUES (${id}, 'user', ${session.user.id}, ${session.user.email}, ${text})
    RETURNING id, ticket_id, author_type, author_email, body, created_at
  `);
  await db.execute(sql`
    UPDATE tickets SET updated_at = NOW() WHERE id = ${id}
  `);

  return Response.json({ message: msgRes.rows[0] });
}
