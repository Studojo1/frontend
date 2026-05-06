// GET /api/autoapply/token-login/status?jobId=&connectToken=
// Returns login job state. Validates connectToken matches the job's userId.

import { getState } from "~/workers/linkedin-login-worker";
import { createClient } from "redis";
import type { Route } from "./+types/api.autoapply.token-login.status";

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

export async function loader({ request }: Route.LoaderArgs) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  const connectToken = searchParams.get("connectToken");

  if (!jobId || !connectToken) return Response.json({ error: "jobId and connectToken required" }, { status: 400 });

  const redis = await getRedis();
  const userId = await redis.get(`linkedin_connect_token:${connectToken}`);
  if (!userId) return Response.json({ error: "Link invalid or expired" }, { status: 401 });

  const state = await getState(jobId);
  if (!state) return Response.json({ error: "Job not found or expired" }, { status: 404 });
  if (state.userId !== userId) return Response.json({ error: "Forbidden" }, { status: 403 });

  // Consume the token once login succeeds so it can't be replayed
  if (state.status === "success") {
    await redis.del(`linkedin_connect_token:${connectToken}`);
  }

  return Response.json({ status: state.status, tfaType: state.tfaType ?? null, error: state.error ?? null });
}
