// POST  /api/tickets  — create a new ticket (logged-in users only)
// GET   /api/tickets  — list this user's tickets
import type { Route } from "./+types/api.tickets";
import { sql } from "drizzle-orm";
import db from "~/lib/db";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import {
  categoryToPriority,
  isValidCategory,
  isValidSource,
} from "~/lib/tickets";
import {
  ensureTicketTables,
  notifyTicketCreated,
} from "~/lib/tickets.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureTicketTables();
  // List this user's tickets with: latest-message preview, unread admin
  // reply count (admin messages newer than the user's last viewed time),
  // and recent-resolved flag for the outreach dashboard banner.
  const rows = await db.execute(sql`
    SELECT
      t.id, t.category, t.status, t.source, t.attachments,
      t.created_at, t.updated_at, t.closed_at, t.user_last_viewed_at,
      COALESCE(
        (SELECT LEFT(m.body, 120)
         FROM ticket_messages m
         WHERE m.ticket_id = t.id
         ORDER BY m.created_at DESC
         LIMIT 1),
        ''
      ) AS preview,
      COALESCE(
        (SELECT COUNT(*)::int
         FROM ticket_messages m
         WHERE m.ticket_id = t.id
           AND m.author_type = 'admin'
           AND m.created_at > COALESCE(t.user_last_viewed_at, '1970-01-01'::timestamptz)),
        0
      ) AS unread_admin_replies
    FROM tickets t
    WHERE t.user_id = ${session.user.id}
    ORDER BY t.created_at DESC
    LIMIT 50
  `);

  // Aggregate summary used by the chat bubble + dashboard banner.
  const totalUnread = (rows.rows as any[]).reduce(
    (sum, r) => sum + (Number(r.unread_admin_replies) || 0),
    0,
  );
  const openCount = (rows.rows as any[]).filter(
    (r) => r.status === "open" || r.status === "in_progress",
  ).length;
  const recentlyResolved = (rows.rows as any[]).find((r) => {
    if (r.status !== "resolved") return false;
    if (!r.closed_at) return false;
    const ageMs = Date.now() - new Date(r.closed_at).getTime();
    return ageMs >= 0 && ageMs < 24 * 60 * 60 * 1000; // last 24h
  });

  return Response.json({
    tickets: rows.rows,
    summary: {
      total_unread: totalUnread,
      open_count: openCount,
      recently_resolved_id: recentlyResolved?.id ?? null,
      recently_resolved_at: recentlyResolved?.closed_at ?? null,
    },
  });
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const category = String(body?.category || "");
  const description = String(body?.description || "").trim();
  const source = String(body?.source || "");
  const contextRaw = body?.context;
  const attachmentsRaw = body?.attachments;

  if (!isValidCategory(category)) {
    return Response.json({ error: "Invalid category" }, { status: 400 });
  }
  if (!isValidSource(source)) {
    return Response.json({ error: "Invalid source" }, { status: 400 });
  }
  if (description.length < 10) {
    return Response.json(
      { error: "Add a bit more detail (10 chars minimum)" },
      { status: 400 },
    );
  }
  if (description.length > 5000) {
    return Response.json(
      { error: "Description is too long (5000 chars max)" },
      { status: 400 },
    );
  }

  // Screenshots are mandatory — every ticket needs supporting evidence.
  // Only URLs returned by our own upload endpoint are accepted (server
  // validates each is from the configured blob host to prevent abuse).
  const attachments: Array<{ url: string; content_type?: string; filename?: string }> =
    Array.isArray(attachmentsRaw)
      ? attachmentsRaw
          .filter(
            (a: any) =>
              a && typeof a === "object" && typeof a.url === "string",
          )
          .slice(0, 6)
          .map((a: any) => ({
            url: String(a.url),
            content_type:
              typeof a.content_type === "string" ? a.content_type : undefined,
            filename:
              typeof a.filename === "string" ? a.filename.slice(0, 200) : undefined,
          }))
      : [];
  if (attachments.length === 0) {
    return Response.json(
      { error: "Please attach a screenshot showing what's happening." },
      { status: 400 },
    );
  }

  const priority = categoryToPriority(category);
  const userEmail = session.user.email;
  const userName = session.user.name ?? null;
  const context =
    contextRaw && typeof contextRaw === "object" ? contextRaw : null;

  await ensureTicketTables();

  const ticketRows = await db.execute(sql`
    INSERT INTO tickets (user_id, user_email, user_name, category, priority, source, context, attachments)
    VALUES (${session.user.id}, ${userEmail}, ${userName}, ${category},
            ${priority}, ${source},
            ${context ? sql`${JSON.stringify(context)}::jsonb` : sql`NULL`},
            ${sql`${JSON.stringify(attachments)}::jsonb`})
    RETURNING id
  `);
  const ticketId = Number((ticketRows.rows[0] as any)?.id);

  await db.execute(sql`
    INSERT INTO ticket_messages (ticket_id, author_type, author_id, author_email, body)
    VALUES (${ticketId}, 'user', ${session.user.id}, ${userEmail}, ${description})
  `);

  // Notify admins out of band — failures don't block ticket creation.
  notifyTicketCreated({
    ticket_id: ticketId,
    category,
    priority,
    description,
    user_email: userEmail,
    user_name: userName,
    source,
  });

  return Response.json({ id: ticketId, status: "open" });
}
