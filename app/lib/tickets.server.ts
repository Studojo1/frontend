// Server-only ticket helpers. Lazy table creation + emailer event firing.
//
// The lazy CREATE TABLE IF NOT EXISTS pattern follows
// app/lib/chat/logger.server.ts and admin-panel/app/routes/api.ops-alerts.tsx
// so neither studojo nor admin-panel needs a migration step before this
// can ship.
import { sql } from "drizzle-orm";
import db from "./db";
import { getEmailerServiceUrl } from "./emailer";

const TICKET_ADMIN_RECIPIENTS =
  process.env.TICKET_ADMIN_RECIPIENTS ||
  "jeremy.zac@gmail.com,businessconnect.pranav@gmail.com";

let tablesReady = false;
export async function ensureTicketTables(): Promise<void> {
  if (tablesReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_name TEXT,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      source TEXT NOT NULL,
      context JSONB,
      assignee_email TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      closed_at TIMESTAMPTZ
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_tickets_status_priority
      ON tickets (status, priority, created_at DESC)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_tickets_user
      ON tickets (user_id, created_at DESC)
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ticket_messages (
      id SERIAL PRIMARY KEY,
      ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      author_type TEXT NOT NULL,
      author_id TEXT,
      author_email TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket
      ON ticket_messages (ticket_id, created_at ASC)
  `);
  tablesReady = true;
}

/**
 * Fire-and-forget admin notification. Mirrors the contact-form pattern in
 * app/routes/api.contact.tsx — POST to the emailer-service /v1/email/events
 * endpoint with a routing key. Wrapped in a Promise that swallows errors so
 * a flaky emailer-service never blocks ticket creation.
 */
export async function notifyTicketCreated(opts: {
  ticket_id: number;
  category: string;
  priority: string;
  description: string;
  user_email: string;
  user_name: string | null;
  source: string;
}): Promise<void> {
  try {
    const base = getEmailerServiceUrl();
    const res = await fetch(`${base}/v1/email/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        routing_key: "event.ticket.created",
        event: {
          ...opts,
          recipients: TICKET_ADMIN_RECIPIENTS,
          admin_url: `https://admin.studojo.com/tickets/${opts.ticket_id}`,
        },
      }),
    });
    if (!res.ok) {
      console.error(
        `[tickets] emailer event.ticket.created -> HTTP ${res.status}`,
      );
    }
  } catch (e: any) {
    console.error("[tickets] failed to notify admins:", e?.message);
  }
}

/** Same shape but for admin replies — emails the user. */
export async function notifyTicketReplied(opts: {
  ticket_id: number;
  user_email: string;
  user_name: string | null;
  admin_name: string;
  reply_body: string;
}): Promise<void> {
  try {
    const base = getEmailerServiceUrl();
    const res = await fetch(`${base}/v1/email/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        routing_key: "event.ticket.replied",
        event: {
          ...opts,
          studojo_url: `https://studojo.com/tickets/${opts.ticket_id}`,
        },
      }),
    });
    if (!res.ok) {
      console.error(
        `[tickets] emailer event.ticket.replied -> HTTP ${res.status}`,
      );
    }
  } catch (e: any) {
    console.error("[tickets] failed to notify user:", e?.message);
  }
}
