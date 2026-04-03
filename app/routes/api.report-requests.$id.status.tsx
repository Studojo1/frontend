import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { reportRequests } from "../../auth-schema";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/api.report-requests.$id.status";

const ADMIN_EMAILS = ["admin@studojo.com", "jeremy@studojo.com", "jeremyabraham1411@gmail.com"];

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "PATCH") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const session = await getSessionFromRequest(request);
  if (!session || !ADMIN_EMAILS.includes(session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const { status } = (await request.json()) as { status?: string };

  if (!status || !["pending", "in_progress", "done"].includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  await db.update(reportRequests).set({ status }).where(eq(reportRequests.id, id));
  return Response.json({ success: true });
}
