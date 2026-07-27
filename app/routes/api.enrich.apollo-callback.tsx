// POST /api/enrich/apollo-callback?secret=..&rid=.. — Apollo posts a revealed
// phone here a few seconds after a reveal. We store it against the reveal id so
// the in-flight engine poll can pick it up, and patch the cache so a late number
// is available to the next call for that profile.
import type { Route } from "./+types/api.enrich.apollo-callback";
import { sql } from "drizzle-orm";
import db from "~/lib/db";
import { parseCallback, webhookSecretOk } from "~/lib/apollo.server";
import { patchCachePhone } from "~/lib/enrich.server";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export async function action({ request }: Route.ActionArgs) {
  const u = new URL(request.url);
  if (!webhookSecretOk(u.searchParams.get("secret") || "")) {
    return json({ error: "forbidden" }, 403);
  }
  const rid = u.searchParams.get("rid") || "";
  if (!rid) return json({ error: "bad_request" }, 422);

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return json({ ok: true }); // acknowledge malformed callbacks so Apollo stops retrying
  }
  const phone = parseCallback(body);

  const r: any = await db.execute(sql`
    UPDATE apollo_reveals
    SET phone = ${phone}, status = ${phone ? "done" : "empty"}, updated_at = now()
    WHERE rid = ${rid}
    RETURNING linkedin_url`);
  const url = (r.rows ?? r ?? [])[0]?.linkedin_url;
  if (phone && url) await patchCachePhone(String(url), phone);

  return json({ ok: true });
}

export async function loader() {
  return json({ error: "method_not_allowed" }, 405);
}
