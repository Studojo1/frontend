// POST /api/enrich — enrich a single LinkedIn profile.
// Pipeline: authenticate -> rate limit -> quota -> validate -> idempotency cache
// -> engine (provider cascade) -> charge on a billable hit -> respond.
import type { Route } from "./+types/api.enrich";
import { guard, json } from "~/lib/api-guard.server";
import { chargeUsage } from "~/lib/api-keys.server";
import { enrichProfile, enginesConfigured, parseTarget } from "~/lib/enrich.server";

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

  const target = parseTarget(body);
  if (!target) {
    return json(
      {
        error: "bad_request",
        message:
          "Provide linkedin_url, or first_name + last_name + (company or domain).",
      },
      422,
      g.headers,
    );
  }

  const fields: string[] = Array.isArray(body.fields)
    ? body.fields.filter((f: any) => f === "email" || f === "phone")
    : ["email", "phone"];
  if (fields.length === 0) fields.push("email", "phone");

  if (!enginesConfigured()) {
    return json(
      {
        error: "engine_unavailable",
        message:
          "The enrichment engine is being connected for your account. Contact admin@studojo.com.",
      },
      503,
      g.headers,
    );
  }

  try {
    const result = await enrichProfile(target, fields);
    // Charge only a fresh billable hit; cached reads and misses are free.
    if (!result.cached && result.credits_used > 0) {
      await chargeUsage(g.caller.id, result.credits_used);
    }
    return json(result, 200, g.headers);
  } catch (e) {
    return json({ error: "internal_error", message: "Enrichment failed, try again." }, 500, g.headers);
  }
}

export async function loader() {
  return json({ error: "method_not_allowed", message: "Use POST." }, 405);
}
