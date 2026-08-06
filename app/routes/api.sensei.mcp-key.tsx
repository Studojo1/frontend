// /api/sensei/mcp-key — MCP key self-service for a Sensei workspace ADMIN.
//
// Bridges the two account systems. A Sensei customer signs in with their Sensei
// account (bob_users, app.studojo.com); API keys live in the platform's api_keys
// table, which is otherwise reachable only behind a studojo.com platform login +
// the builder allowlist. Here the caller proves who they are with their Sensei
// SESSION token, bob-svc verifies it, and we mint a key on their behalf.
//
// The minted key is mapped to their EXISTING workspace, so their agent sees the same
// searches, contacts and shared credit pool as the browser — instead of the MCP's
// default behaviour of provisioning a fresh empty workspace per key.
import type { Route } from "./+types/api.sensei.mcp-key";
import { json } from "~/lib/api-guard.server";
import { createKey, listKeys, revokeKey } from "~/lib/api-keys.server";
import { whoAmI, bobConfigured } from "~/lib/mcp/bob-client";
import { mapKeyToOrg, unmapKey, mappedOrgs } from "~/lib/mcp/keyorg.server";

const KEY_LABEL = "Sensei MCP";

type Admin = { email: string; org: { id: number; name: string } };

/** Resolve the caller's Sensei session to a workspace ADMIN, or a Response to return. */
async function requireAdmin(request: Request): Promise<{ ok: true; admin: Admin } | { ok: false; response: Response }> {
  if (!bobConfigured()) {
    return { ok: false, response: json({ error: "unavailable", message: "Sensei is not configured on this environment." }, 503) };
  }
  const session = request.headers.get("x-bob-session") || "";
  if (!session) return { ok: false, response: json({ error: "unauthenticated", message: "Sign in to Sensei first." }, 401) };

  const me = await whoAmI(session);
  if (!me.ok || !me.data?.email) {
    return { ok: false, response: json({ error: "unauthenticated", message: "Your session has expired. Sign in again." }, 401) };
  }
  if (me.data.role !== "admin" || !me.data.org) {
    return {
      ok: false,
      response: json(
        { error: "forbidden", message: "Only the workspace admin can create an agent key." },
        403,
      ),
    };
  }
  return { ok: true, admin: { email: me.data.email, org: me.data.org } };
}

/** Keys this admin has minted for the MCP, newest first, with their workspace mapping. */
async function currentKeys(email: string) {
  const [rows, mapped] = await Promise.all([listKeys(email), mappedOrgs(email)]);
  return rows
    .filter((k: any) => String(k.name || "").startsWith(KEY_LABEL) && !k.revoked_at)
    .map((k: any) => ({
      id: String(k.id),
      name: k.name,
      last_four: k.last_four,
      created_at: k.created_at,
      last_used_at: k.last_used_at,
      request_count: k.request_count ?? 0,
      workspace_id: mapped[String(k.id)] ?? null,
    }));
}

export async function loader({ request }: Route.LoaderArgs) {
  const g = await requireAdmin(request);
  if (!g.ok) return g.response;
  return json({ org: g.admin.org, keys: await currentKeys(g.admin.email) });
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const g = await requireAdmin(request);
  if (!g.ok) return g.response;
  const { email, org } = g.admin;

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const act = String(body.action || "create");

  if (act === "revoke") {
    const id = String(body.id || "").trim();
    if (!id) return json({ error: "bad_request", message: "Which key?" }, 422);
    // Ownership is enforced by revokeKey (it matches on this admin's email).
    await revokeKey(email, id);
    await unmapKey(id);
    return json({ ok: true, keys: await currentKeys(email) });
  }

  if (act === "create") {
    // One live key per workspace keeps the story simple: rotating means revoking the
    // old one first, so a leaked key can't quietly keep working.
    const existing = await currentKeys(email);
    if (existing.length >= 3) {
      return json(
        { error: "too_many_keys", message: "You already have 3 agent keys. Revoke one before creating another." },
        409,
      );
    }
    const { id, plaintext, lastFour } = await createKey(email, null, `${KEY_LABEL} — ${org.name}`);
    // Point it at THIS workspace before it is ever used.
    await mapKeyToOrg(id, email, org.id);
    return json({
      ok: true,
      key: { id, plaintext, last_four: lastFour, workspace_id: org.id },
      keys: await currentKeys(email),
    });
  }

  return json({ error: "bad_request", message: `Unknown action: ${act}` }, 422);
}
