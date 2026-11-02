import { sql } from "drizzle-orm";
import db from "~/lib/db";
import { ensureTicketTables } from "~/lib/tickets.server";
import { contactBody, contactCategory, contactPriority, overContactLimit } from "~/lib/contact-limit";
import type { Route } from "./+types/api.contact";
import { guardPublicForm } from "~/lib/ratelimit.server";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Unauthenticated: per-IP rate limit and honeypot (audit AS-N05).
  const blocked = await guardPublicForm(request, body);
  if (blocked) return blocked;

  const { name, email, subject, message } = body as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  // Validate required fields
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: "Name is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!email || typeof email !== "string") {
    return new Response(
      JSON.stringify({ error: "Email is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({ error: "Invalid email format" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!subject || typeof subject !== "string") {
    return new Response(
      JSON.stringify({ error: "Subject is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!message || typeof message !== "string" || message.trim().length < 10) {
    return new Response(
      JSON.stringify({ error: "Message must be at least 10 characters" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    await ensureTicketTables();
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim().slice(0, 200);
    const cleanSubject = subject.slice(0, 100);

    // Per-email cap on top of the per-IP one: at most 3 contact tickets from one address in an hour.
    const recent = await db.execute(sql`
      SELECT COUNT(*)::int AS n FROM tickets
      WHERE source = 'contact_form' AND user_email = ${cleanEmail}
        AND created_at > NOW() - INTERVAL '1 hour'
    `);
    if (overContactLimit(Number((recent.rows as any[])[0]?.n ?? 0))) {
      return new Response(
        JSON.stringify({ error: "You have sent a few messages already. Please wait a while, or write to admin@studojo.com." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const category = contactCategory(cleanSubject);
    const priority = contactPriority(category);
    const context = JSON.stringify({ via: "contact_form", subject: cleanSubject });
    const created = await db.execute(sql`
      INSERT INTO tickets (user_id, user_email, user_name, category, priority, status, source, context)
      VALUES ('visitor', ${cleanEmail}, ${cleanName}, ${category}, ${priority}, 'open', 'contact_form', ${context}::jsonb)
      RETURNING id
    `);
    const ticketId = Number((created.rows as any[])[0]?.id);
    await db.execute(sql`
      INSERT INTO ticket_messages (ticket_id, author_type, author_email, body)
      VALUES (${ticketId}, 'user', ${cleanEmail}, ${contactBody(cleanSubject, message)})
    `);

    // The team replies by hand. Nothing is emailed to the visitor or anyone else.
    return new Response(
      JSON.stringify({ success: true, message: `Thanks. We got it and will reply to ${cleanEmail} soon.` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[api.contact] Error saving contact form:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send message. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
