import type { Route } from "./+types/api.ugc-apply";
import { checkEmail } from "~/lib/email-validate";
import { guardPublicForm } from "~/lib/ratelimit.server";
import { validateUgcApplication } from "~/lib/ugc-application";
import { saveUgcApplication } from "~/lib/ugc-application.server";

function clamp(v: unknown, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Unauthenticated: per-IP rate limit and honeypot (audit AS-N05).
  const blocked = await guardPublicForm(request, body);
  if (blocked) return blocked;

  // The same checks the form runs, done again here because the form's are
  // bypassable. The email check is the strict one (typo domains, bad TLDs).
  let suggestion: string | undefined;
  const result = validateUgcApplication(body, (email) => {
    const c = checkEmail(email);
    if (c.ok) return null;
    suggestion = c.suggestion;
    return c.error ?? "Please enter a valid email address.";
  });
  if (!result.ok) {
    return Response.json({ error: result.error, field: result.field, suggestion }, { status: 400 });
  }

  // Attribution is client-supplied, so it is a hint, never a reason to reject.
  const { isNew } = await saveUgcApplication(result.value, {
    sourcePath: clamp(body.sourcePath, 120),
    utmSource: clamp(body.utmSource, 80),
    utmMedium: clamp(body.utmMedium, 80),
    utmCampaign: clamp(body.utmCampaign, 120),
    referrer: clamp(body.referrer, 300),
  });

  return Response.json(isNew ? { ok: true } : { ok: true, alreadyApplied: true });
}
