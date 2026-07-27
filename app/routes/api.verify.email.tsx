// POST /api/verify/email — validate an email (syntax + MX). No reveal, no charge.
import type { Route } from "./+types/api.verify.email";
import { guard, json } from "~/lib/api-guard.server";
import { verifyEmail } from "~/lib/email-verify.server";

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
  const email = String(body.email || "").trim();
  if (!email) return json({ error: "bad_request", message: "email is required." }, 422, g.headers);

  const verdict = await verifyEmail(email);
  return json(verdict, 200, g.headers);
}

export async function loader() {
  return json({ error: "method_not_allowed", message: "Use POST." }, 405);
}
