// POST /api/autoapply/token-login/otp
// Injects OTP for a token-based login job.

import { getState, submitOtp } from "~/workers/linkedin-login-worker";
import { createClient } from "redis";
import type { Route } from "./+types/api.autoapply.token-login.otp";

const REDIS_URL = process.env.REDIS_URL ?? "redis://redis.studojo.svc.cluster.local:6379";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? "";

let _redis: ReturnType<typeof createClient> | null = null;
async function getRedis() {
  if (_redis) return _redis;
  _redis = createClient({ url: REDIS_URL, password: REDIS_PASSWORD || undefined });
  _redis.on("error", () => {});
  await _redis.connect();
  return _redis;
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 });

  const { jobId, otp, connectToken } = body as { jobId?: string; otp?: string; connectToken?: string };
  if (!jobId || !otp || !connectToken) return Response.json({ error: "jobId, otp, and connectToken required" }, { status: 400 });

  const redis = await getRedis();
  const userId = await redis.get(`linkedin_connect_token:${connectToken}`);
  if (!userId) return Response.json({ error: "Link invalid or expired" }, { status: 401 });

  const state = await getState(jobId);
  if (!state) return Response.json({ error: "Job not found" }, { status: 404 });
  if (state.userId !== userId) return Response.json({ error: "Forbidden" }, { status: 403 });
  if (state.status !== "awaiting_otp") return Response.json({ error: "Job is not awaiting OTP" }, { status: 409 });

  await submitOtp(jobId, otp.trim());
  return Response.json({ ok: true });
}
