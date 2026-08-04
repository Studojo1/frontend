// POST /api/enrich — enrich a single LinkedIn profile.
// Pipeline: authenticate -> rate limit -> quota -> validate -> idempotency cache
// -> engine (provider cascade) -> charge on a billable hit -> respond.
import type { Route } from "./+types/api.enrich";
import { guard, json } from "~/lib/api-guard.server";
import { chargeUsage, logRequest } from "~/lib/api-keys.server";
import { enrichProfile, enginesConfigured, parseTarget } from "~/lib/enrich.server";

function targetLabel(body: any): string {
  if (body?.linkedin_url) return String(body.linkedin_url);
  const name = [body?.first_name, body?.last_name].filter(Boolean).join(" ");
  const org = body?.company || body?.domain || "";
  return [name, org].filter(Boolean).join(" @ ") || "(unspecified)";
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const g = await guard(request);
  if (!g.ok) return g.response;

  const t0 = Date.now();
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
  const log = (
    status: string,
    httpStatus: number,
    extra?: { target?: string; credits?: number; cached?: boolean },
  ) =>
    logRequest({
      keyId: g.caller.id,
      email: g.caller.email,
      endpoint: "/api/enrich",
      target: extra?.target ?? null,
      status,
      httpStatus,
      credits: extra?.credits ?? 0,
      cached: extra?.cached ?? false,
      ms: Date.now() - t0,
      ip,
    });

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    await log("bad_request", 422);
    return json({ error: "bad_request", message: "Body must be JSON." }, 422, g.headers);
  }

  const target = parseTarget(body);
  const tlabel = targetLabel(body);
  if (!target) {
    await log("bad_request", 422, { target: tlabel });
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
    await log("engine_unavailable", 503, { target: tlabel });
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
    await log(result.status || "ok", 200, {
      target: tlabel,
      credits: result.credits_used || 0,
      cached: !!result.cached,
    });
    return json(result, 200, g.headers);
  } catch (e) {
    await log("error", 500, { target: tlabel });
    return json({ error: "internal_error", message: "Enrichment failed, try again." }, 500, g.headers);
  }
}

export async function loader() {
  return json({ error: "method_not_allowed", message: "Use POST." }, 405);
}
