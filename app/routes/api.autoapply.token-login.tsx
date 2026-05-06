// POST /api/autoapply/token-login
// Starts a Patchright LinkedIn login using a connect token instead of Studojo session.
// Used by /connect-linkedin page which has no Studojo auth cookie.

import { linkedinLoginQueue } from "~/lib/queues.server";
import { setState } from "~/workers/linkedin-login-worker";
import { createClient } from "redis";
import { randomUUID } from "crypto";
import type { Route } from "./+types/api.autoapply.token-login";

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

  const { connectToken, email, password } = body as {
    connectToken?: string;
    email?: string;
    password?: string;
  };

  if (!connectToken) return Response.json({ error: "connectToken required" }, { status: 400 });
  if (!email || !password) return Response.json({ error: "email and password required" }, { status: 400 });

  const redis = await getRedis();
  const userId = await redis.get(`linkedin_connect_token:${connectToken}`);
  if (!userId) return Response.json({ error: "Link invalid or expired" }, { status: 401 });

  const jobId = randomUUID();
  await setState(jobId, { status: "pending", userId });

  await linkedinLoginQueue.add(
    "login",
    { jobId, userId, email: email.trim(), password },
    { attempts: 1, removeOnComplete: true, removeOnFail: true }
  );

  return Response.json({ jobId });
}
