// POST /api/sensei-ticket — support ticket from a Sensei workspace user.
//
// Sensei users authenticate through bob-svc (email + opaque session), NOT
// through better-auth, so they can't use /api/tickets (which requires a
// studojo.com login session). This endpoint writes into the SAME `tickets`
// table the admin panel reads, tagged source='sensei', so Sensei support
// requests land in the admin Tickets view (and the Sensei tab filters on it).
import type { Route } from "./+types/api.sensei-ticket";
import { sql } from "drizzle-orm";
import db from "~/lib/db";
import { ensureTicketTables, notifyTicketCreated } from "~/lib/tickets.server";

// Sensei reasons map onto existing ticket categories so the admin filters and
// priority routing keep working unchanged.
const SENSEI_REASONS: Record<string, { category: string; priority: string }> = {
  broken: { category: "website_broken", priority: "high" },
  billing: { category: "other", priority: "normal" },
  question: { category: "info_request", priority: "low" },
  other: { category: "other", priority: "normal" },
};

function validEmail(e: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body?.email || "").trim().toLowerCase();
  const org = String(body?.org || "").trim();
  const reasonKey = String(body?.reason || "other");
  const description = String(body?.description || "").trim();

  if (!validEmail(email)) {
    return Response.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (description.length < 5) {
    return Response.json(
      { error: "Tell us a little more about what's happening." },
      { status: 400 },
    );
  }
  if (description.length > 5000) {
    return Response.json({ error: "That message is too long." }, { status: 400 });
  }

  const reason = SENSEI_REASONS[reasonKey] ?? SENSEI_REASONS.other;
  const context = {
    workspace: org || null,
    product: "sensei",
    page_url:
      body?.context && typeof body.context.page_url === "string"
        ? body.context.page_url
        : null,
  };
  // Sensei has no studojo user_id — use a stable synthetic id so the ticket's
  // per-user history still groups correctly.
  const userId = `sensei:${email}`;
  const userName = org || email;

  await ensureTicketTables();

  const ticketRows = await db.execute(sql`
    INSERT INTO tickets (user_id, user_email, user_name, category, priority, source, context, attachments)
    VALUES (${userId}, ${email}, ${userName}, ${reason.category},
            ${reason.priority}, ${"sensei"},
            ${sql`${JSON.stringify(context)}::jsonb`},
            ${sql`'[]'::jsonb`})
    RETURNING id
  `);
  const ticketId = Number((ticketRows.rows[0] as any)?.id);

  await db.execute(sql`
    INSERT INTO ticket_messages (ticket_id, author_type, author_id, author_email, body)
    VALUES (${ticketId}, 'user', ${userId}, ${email}, ${description})
  `);

  notifyTicketCreated({
    ticket_id: ticketId,
    category: reason.category,
    priority: reason.priority,
    description,
    user_email: email,
    user_name: userName,
    source: "sensei",
  });

  return Response.json({ id: ticketId, status: "open" });
}
