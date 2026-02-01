import type { Route } from "./+types/$id.action";
import db from "~/lib/db";
import { sql } from "drizzle-orm";

// POST /api/company/applications/:id/action - Company action (token auth)
export async function action({ params, request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { id: applicationId } = params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { action, notes, token } = body as {
    action?: string;
    notes?: string;
    token?: string;
  };

  if (!token) {
    return new Response(
      JSON.stringify({ error: "Token required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!action) {
    return new Response(
      JSON.stringify({ error: "Action is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate token
  const tokenResult = await db.execute(
    sql`SELECT * FROM company_tokens WHERE token = ${token} LIMIT 1`
  );

  if (tokenResult.rows.length === 0) {
    return new Response(
      JSON.stringify({ error: "Invalid token" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const companyToken = tokenResult.rows[0] as any;

  // Check expiration
  if (companyToken.expires_at && new Date(companyToken.expires_at) < new Date()) {
    return new Response(
      JSON.stringify({ error: "Token has expired" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Verify token has access to this application
  const applicationIds = companyToken.application_ids as string[];
  if (!applicationIds.includes(applicationId)) {
    return new Response(
      JSON.stringify({ error: "Token does not have access to this application" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Map action to status
  const statusMap: Record<string, string> = {
    accept: "accepted",
    schedule_interview: "interview_scheduled",
    request_info: "more_info_requested",
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Update application status
  const updateResult = await db.execute(
    sql`
      UPDATE internship_applications SET
        status = ${newStatus},
        admin_notes = COALESCE(${notes || null}, admin_notes),
        updated_at = NOW()
      WHERE id = ${applicationId}
      RETURNING *
    `
  );

  if (updateResult.rows.length === 0) {
    return new Response(
      JSON.stringify({ error: "Application not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      application: updateResult.rows[0],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

