import { eq } from "drizzle-orm";
import db from "~/lib/db";
import { autoapplyJobs, autoapplyConfigs } from "../../auth-schema";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.autoapply.report";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { company, roleTitle, location, platform, applyUrl, status, matchScore } = await request.json();

  const [config] = await db
    .select({ id: autoapplyConfigs.id })
    .from(autoapplyConfigs)
    .where(eq(autoapplyConfigs.userId, session.user.id))
    .limit(1);

  if (!config) return Response.json({ error: "No config found" }, { status: 404 });

  const [job] = await db
    .insert(autoapplyJobs)
    .values({
      configId: config.id,
      userId: session.user.id,
      company: company ?? "Unknown",
      roleTitle: roleTitle ?? "Unknown Role",
      location: location ?? "",
      platform: platform ?? "other",
      applyUrl: applyUrl ?? "",
      matchScore: matchScore ?? null,
      status: status ?? "applied",
      appliedAt: status === "applied" ? new Date() : null,
    })
    .returning();

  return Response.json({ ok: true, job });
}
