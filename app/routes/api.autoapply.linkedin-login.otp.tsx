// POST /api/autoapply/linkedin-login/otp
// Injects the 2FA OTP into Redis so the waiting worker can proceed.

import { getSessionFromRequest } from "~/lib/onboarding.server";
import { getState, submitOtp } from "~/workers/linkedin-login-worker";
import type { Route } from "./+types/api.autoapply.linkedin-login.otp";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { jobId, otp } = body as { jobId?: string; otp?: string };

  if (!jobId || !otp) return Response.json({ error: "jobId and otp are required" }, { status: 400 });

  const state = await getState(jobId);
  if (!state) return Response.json({ error: "Job not found or expired" }, { status: 404 });
  if (state.userId !== session.user.id) return Response.json({ error: "Forbidden" }, { status: 403 });
  if (state.status !== "awaiting_otp") return Response.json({ error: "Job is not awaiting OTP" }, { status: 409 });

  await submitOtp(jobId, otp.trim());
  return Response.json({ ok: true });
}
