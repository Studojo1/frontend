// POST /api/autoapply/poll-acceptances
// Manually triggers the Voyager acceptance poller for the authenticated user.
// In production the poller runs automatically every 2h via the maintenance queue.
// This endpoint lets the test harness (lkot) trigger it on-demand.

import { getSessionFromRequest } from "~/lib/onboarding.server";
import { checkAcceptances } from "~/workers/acceptance-poller";
import type { Route } from "./+types/api.autoapply.poll-acceptances";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await checkAcceptances(session.user.id);
    return Response.json({ ok: true, ...result });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
