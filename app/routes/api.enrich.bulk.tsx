// POST /api/enrich/bulk — submit up to 500 LinkedIn profiles, get a job_id.
import type { Route } from "./+types/api.enrich.bulk";
import { guard, json } from "~/lib/api-guard.server";
import { enginesConfigured } from "~/lib/enrich.server";
import { createJob, BULK_MAX } from "~/lib/api-jobs.server";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const g = await guard(request);
  if (!g.ok) return g.response;

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request", message: "Body must be JSON." }, 422, g.headers);
  }

  // Entries may be LinkedIn-URL strings or objects ({linkedin_url} or name+company).
  const profiles: any[] = Array.isArray(body.profiles) ? body.profiles : [];
  if (profiles.length === 0) {
    return json({ error: "bad_request", message: "profiles must be a non-empty array." }, 422, g.headers);
  }
  if (profiles.length > BULK_MAX) {
    return json({ error: "bad_request", message: `Max ${BULK_MAX} profiles per job.` }, 422, g.headers);
  }

  const fields: string[] = Array.isArray(body.fields)
    ? body.fields.filter((f: any) => f === "email" || f === "phone")
    : ["email", "phone"];
  if (fields.length === 0) fields.push("email", "phone");

  if (!enginesConfigured()) {
    return json({ error: "engine_unavailable", message: "The enrichment engine is being connected." }, 503, g.headers);
  }

  const job = await createJob(g.caller, profiles, fields);
  return json(job, 202, g.headers);
}

export async function loader() {
  return json({ error: "method_not_allowed", message: "Use POST." }, 405);
}
