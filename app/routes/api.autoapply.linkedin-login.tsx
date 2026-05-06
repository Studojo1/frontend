// POST /api/autoapply/linkedin-login
// Enqueues a server-side Patchright login job.
// Returns { jobId } — client polls /api/autoapply/linkedin-login/status?jobId=...

import { getSessionFromRequest } from "~/lib/onboarding.server";
import { linkedinLoginQueue } from "~/lib/queues.server";
import type { Route } from "./+types/api.autoapply.linkedin-login";
import { setState } from "~/workers/linkedin-login-worker";
import { randomUUID } from "crypto";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return Response.json({ error: "email and password are required" }, { status: 400 });
  }

  const jobId = randomUUID();

  // Write initial state immediately so status endpoint never returns 404
  await setState(jobId, { status: "pending", userId: session.user.id });

  await linkedinLoginQueue.add(
    "login",
    { jobId, userId: session.user.id, email, password },
    { attempts: 1, removeOnComplete: true, removeOnFail: true }
  );

  return Response.json({ jobId });
}
