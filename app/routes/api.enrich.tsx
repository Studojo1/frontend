// POST /api/enrich — Contact Enrichment API entrypoint.
//
// This layer authenticates the caller's API key and will proxy to the
// enrichment engine (the multi-provider phone waterfall). The provider cascade
// is not wired to this edge yet, so a valid key currently gets a 503 telling it
// the engine is being connected. That lets customers verify their key works
// (401 vs 503) before the engine goes live.
import type { Route } from "./+types/api.enrich";
import { verifyKey } from "~/lib/api-keys.server";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function bearer(request: Request): string {
  const h = request.headers.get("authorization") || "";
  return h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : "";
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const key = bearer(request);
  const caller = await verifyKey(key);
  if (!caller) {
    return json({ error: "invalid_api_key" }, 401);
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request", message: "Body must be JSON." }, 422);
  }
  const url = String(body.linkedin_url || "").trim();
  if (!/linkedin\.com\/in\//i.test(url)) {
    return json(
      { error: "bad_request", message: "linkedin_url must be a LinkedIn profile URL." },
      422,
    );
  }

  // Key is valid; the provider cascade is not attached to this edge yet.
  return json(
    {
      error: "engine_unavailable",
      message:
        "Your API key is authenticated. The enrichment engine is being connected for your account. Contact admin@studojo.com.",
      authenticated: true,
    },
    503,
  );
}

// GET is not supported on this endpoint.
export async function loader() {
  return json({ error: "method_not_allowed", message: "Use POST." }, 405);
}
