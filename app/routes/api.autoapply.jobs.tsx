import { eq, desc } from "drizzle-orm";
import db from "~/lib/db";
import { autoapplyJobs, autoapplyConfigs } from "../../auth-schema";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.autoapply.jobs";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await db
    .select()
    .from(autoapplyJobs)
    .where(eq(autoapplyJobs.userId, session.user.id))
    .orderBy(desc(autoapplyJobs.createdAt))
    .limit(100);

  const stats = {
    total: jobs.length,
    applied: jobs.filter((j) => j.status === "applied").length,
    queued: jobs.filter((j) => j.status === "queued").length,
    failed: jobs.filter((j) => j.status === "failed").length,
    skipped: jobs.filter((j) => j.status === "skipped").length,
  };

  return Response.json({ jobs, stats });
}
