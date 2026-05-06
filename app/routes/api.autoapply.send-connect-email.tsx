// POST /api/autoapply/send-connect-email
// Generates a 24-hour one-time token and emails a LinkedIn connect link to the user.

import { getSessionFromRequest } from "~/lib/onboarding.server";
import { sendLinkedInConnectEmail } from "~/lib/notifications.server";
import { createClient } from "redis";
import { randomUUID } from "crypto";
import type { Route } from "./+types/api.autoapply.send-connect-email";

const REDIS_URL = process.env.REDIS_URL ?? "redis://redis.studojo.svc.cluster.local:6379";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? "";
const TOKEN_TTL = 86_400; // 24 hours

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

  const body = await request.json().catch(() => ({})) as { email?: string; firstName?: string };

  // Default to sending to the logged-in user's own email
  const to = body.email?.trim() || session.user.email;
  const firstName = body.firstName?.trim() || session.user.name?.split(" ")[0];

  if (!to) return Response.json({ error: "email required" }, { status: 400 });

  const token = randomUUID();
  const redis = await getRedis();
  await redis.set(`linkedin_connect_token:${token}`, session.user.id, { EX: TOKEN_TTL });

  const baseUrl = process.env.BASE_URL?.trim() || "https://studojo.com";
  const connectUrl = `${baseUrl}/connect-linkedin?token=${token}`;

  await sendLinkedInConnectEmail({ to, connectUrl, firstName });

  return Response.json({ ok: true, sentTo: to });
}
