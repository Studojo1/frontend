// GET /api/jobs/{job_id} — poll a bulk job. Advances the job if the batch has
// finished. Scoped to the caller's email, so jobs never leak across accounts.
import type { Route } from "./+types/api.jobs.$id";
import { guard, json } from "~/lib/api-guard.server";
import { getJob } from "~/lib/api-jobs.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const g = await guard(request, false); // polling should not consume the rate limit
  if (!g.ok) return g.response;

  const job = await getJob(g.caller.email, String(params.id));
  if (!job) return json({ error: "not_found", message: "No such job." }, 404);
  return json(job, 200);
}
