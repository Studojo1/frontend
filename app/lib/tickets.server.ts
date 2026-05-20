// Server-only ticket helpers. Lazy table creation + direct Gmail email send.
//
// The lazy CREATE TABLE IF NOT EXISTS pattern follows
// app/lib/chat/logger.server.ts and admin-panel/app/routes/api.ops-alerts.tsx
// so neither studojo nor admin-panel needs a migration step before this
// can ship.
//
// Email path: direct SMTP from studojo@gmail.com via App Password — no
// emailer-service hop. See app/lib/gmail-direct.server.ts.
import { sql } from "drizzle-orm";
import db from "./db";
import { sendDirectGmail } from "./gmail-direct.server";

const TICKET_ADMIN_RECIPIENTS = (
  process.env.TICKET_ADMIN_RECIPIENTS ||
  "jeremy.zac@gmail.com,businessconnect.pranav@gmail.com"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

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
      attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
      assignee_email TEXT,
      user_last_viewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      closed_at TIMESTAMPTZ
    )
  `);
  // Forward-compat: if tickets existed without the new columns, add them.
  await db.execute(sql`
    ALTER TABLE tickets
      ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb
  `);
  await db.execute(sql`
    ALTER TABLE tickets
      ADD COLUMN IF NOT EXISTS user_last_viewed_at TIMESTAMPTZ
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

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function priorityBadge(priority: string): string {
  const color =
    priority === "high"
      ? "#dc2626"
      : priority === "low"
        ? "#737373"
        : "#7c3aed";
  return `<span style="display:inline-block;background:${color};color:#ffffff;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">${esc(priority)}</span>`;
}

function renderTicketCreatedHtml(opts: {
  ticket_id: number;
  category: string;
  priority: string;
  description: string;
  user_email: string;
  user_name: string;
  source: string;
  admin_url: string;
}): string {
  return `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fafafa;padding:24px;color:#171717;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;padding:28px;">
      <h2 style="margin:0 0 16px;font-size:20px;">New support ticket #${opts.ticket_id}</h2>
      <p style="margin:0 0 20px;">${priorityBadge(opts.priority)}</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 20px;">
        <tr><td style="padding:6px 0;color:#737373;font-size:13px;width:110px;">Category</td><td style="padding:6px 0;font-weight:600;">${esc(opts.category)}</td></tr>
        <tr><td style="padding:6px 0;color:#737373;font-size:13px;">Source</td><td style="padding:6px 0;">${esc(opts.source)}</td></tr>
        <tr><td style="padding:6px 0;color:#737373;font-size:13px;">From</td><td style="padding:6px 0;font-weight:600;">${esc(opts.user_name)}</td></tr>
        <tr><td style="padding:6px 0;color:#737373;font-size:13px;">Email</td><td style="padding:6px 0;"><a href="mailto:${esc(opts.user_email)}" style="color:#7c3aed;">${esc(opts.user_email)}</a></td></tr>
      </table>
      <div style="background:#fafafa;border-left:3px solid #171717;padding:14px 16px;border-radius:6px;margin:0 0 24px;">
        <p style="margin:0 0 6px;color:#737373;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Description</p>
        <p style="margin:0;white-space:pre-wrap;">${esc(opts.description)}</p>
      </div>
      <p style="text-align:center;margin:0 0 16px;">
        <a href="${esc(opts.admin_url)}" style="display:inline-block;background:#7c3aed;color:#ffffff;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;">Open in admin panel</a>
      </p>
      <p style="font-size:12px;color:#737373;text-align:center;margin:0;">Screenshots are visible on the ticket page.</p>
    </div>
  </body></html>`;
}

function renderTicketRepliedHtml(opts: {
  ticket_id: number;
  user_name: string;
  admin_name: string;
  reply_body: string;
  studojo_url: string;
}): string {
  return `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fafafa;padding:24px;color:#171717;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;padding:28px;">
      <h2 style="margin:0 0 12px;font-size:20px;">Hey ${esc(opts.user_name)},</h2>
      <p style="margin:0 0 18px;">The team replied on your support ticket #${opts.ticket_id}.</p>
      <div style="background:#faf5ff;border-left:3px solid #7c3aed;padding:14px 16px;border-radius:6px;margin:0 0 24px;">
        <p style="margin:0 0 6px;color:#737373;font-size:12px;">${esc(opts.admin_name)} wrote</p>
        <p style="margin:0;white-space:pre-wrap;">${esc(opts.reply_body)}</p>
      </div>
      <p style="text-align:center;margin:0 0 16px;">
        <a href="${esc(opts.studojo_url)}" style="display:inline-block;background:#7c3aed;color:#ffffff;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;">View ticket on Studojo</a>
      </p>
      <p style="font-size:12px;color:#737373;text-align:center;margin:0;">Reply from the support chat or your profile.</p>
    </div>
  </body></html>`;
}

/**
 * Email the admin recipients when a user raises a ticket. Sends sequentially
 * via direct Gmail SMTP. Swallows errors so a transient SMTP issue never
 * blocks ticket creation.
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
  const admin_url = `https://admin.studojo.com/tickets/${opts.ticket_id}`;
  const userName = opts.user_name || opts.user_email;
  const html = renderTicketCreatedHtml({
    ticket_id: opts.ticket_id,
    category: opts.category,
    priority: opts.priority,
    description: opts.description,
    user_email: opts.user_email,
    user_name: userName,
    source: opts.source,
    admin_url,
  });
  const subjectPrefix = opts.priority === "high" ? "[HIGH] " : "";
  const subject = `${subjectPrefix}New ticket #${opts.ticket_id} - ${opts.category}`;
  for (const to of TICKET_ADMIN_RECIPIENTS) {
    const ok = await sendDirectGmail({
      to,
      subject,
      html,
      replyTo: opts.user_email,
    });
    if (!ok) {
      console.error(`[tickets] notifyTicketCreated send failed for ${to}`);
    }
  }
}

/** Email the ticket owner when an admin replies. */
export async function notifyTicketReplied(opts: {
  ticket_id: number;
  user_email: string;
  user_name: string | null;
  admin_name: string;
  reply_body: string;
}): Promise<void> {
  const studojo_url = `https://studojo.com/tickets/${opts.ticket_id}`;
  const html = renderTicketRepliedHtml({
    ticket_id: opts.ticket_id,
    user_name: opts.user_name || "there",
    admin_name: opts.admin_name || "The Studojo team",
    reply_body: opts.reply_body,
    studojo_url,
  });
  const ok = await sendDirectGmail({
    to: opts.user_email,
    subject: `Re: Studojo ticket #${opts.ticket_id}`,
    html,
  });
  if (!ok) {
    console.error(
      `[tickets] notifyTicketReplied send failed for ${opts.user_email}`,
    );
  }
}
