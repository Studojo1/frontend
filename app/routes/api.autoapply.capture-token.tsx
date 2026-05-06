// POST /api/autoapply/capture-token
// Generates a short-lived one-time token for the local capture script.
// The script uses this token instead of the session cookie, so the user
// doesn't need to be authenticated in the script's browser context.

import { getSessionFromRequest } from "~/lib/onboarding.server";
import { createClient } from "redis";
import { randomUUID } from "crypto";
import type { Route } from "./+types/api.autoapply.capture-token";

const REDIS_URL = process.env.REDIS_URL ?? "redis://redis.studojo.svc.cluster.local:6379";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? "";
const TOKEN_TTL = 1800; // 30 minutes

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

  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const token = randomUUID();
  const redis = await getRedis();
  await redis.set(`capture_token:${token}`, session.user.id, { EX: TOKEN_TTL });

  return Response.json({ token });
}
