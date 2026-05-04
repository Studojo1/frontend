// GET /api/autoapply/linkedin-login/status?jobId=...
// Returns current state of a LinkedIn credential login job.

import { getSessionFromRequest } from "~/lib/onboarding.server";
import { getState } from "~/workers/linkedin-login-worker";
import type { Route } from "./+types/api.autoapply.linkedin-login.status";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  if (!jobId) return Response.json({ error: "jobId required" }, { status: 400 });

  const state = await getState(jobId);
  if (!state) return Response.json({ error: "Job not found or expired" }, { status: 404 });

  // Verify the job belongs to this user
  if (state.userId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json({
    status: state.status,
    tfaType: state.tfaType ?? null,
    error: state.error ?? null,
  });
}
