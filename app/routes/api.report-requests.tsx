import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { reportRequests } from "../../../auth-schema";
import { desc, eq } from "drizzle-orm";
import type { Route } from "./+types/api.report-requests";

const ADMIN_EMAILS = ["admin@studojo.com", "jeremy@studojo.com", "jeremyabraham1411@gmail.com"];

// POST /api/report-requests — submit a request (public)
// GET  /api/report-requests — list all requests (admin only)
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { topic, email } = body as { topic?: string; email?: string };

  if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
    return Response.json({ error: "A topic of at least 3 characters is required" }, { status: 400 });
  }

  if (topic.trim().length > 500) {
    return Response.json({ error: "Topic must be under 500 characters" }, { status: 400 });
  }

  const session = await getSessionFromRequest(request);
  const userId = session?.user?.id ?? null;

  const [row] = await db
    .insert(reportRequests)
    .values({
      topic: topic.trim(),
      email: email?.trim() || session?.user?.email || null,
      userId,
    })
    .returning();

  return Response.json({ success: true, id: row.id });
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session || !ADMIN_EMAILS.includes(session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(reportRequests)
    .orderBy(desc(reportRequests.createdAt))
    .limit(200);

  return Response.json({ requests: rows });
}
