import type { Route } from "./+types/api.ugc-apply";
import { checkEmail } from "~/lib/email-validate";
import { guardPublicForm } from "~/lib/ratelimit.server";
import { validateUgcApplication } from "~/lib/ugc-application";
import { saveUgcApplication } from "~/lib/ugc-application.server";

// A real application is a few KB; anything far past that is not one.
const MAX_BODY = 32 * 1024;

function clamp(v: unknown, max: number): string {
  // eslint-disable-next-line no-control-regex -- stripping control characters is the point
  return typeof v === "string" ? v.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max) : "";
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // JSON only: a text/plain post is a CORS "simple request" that any site could
  // make its visitors' browsers send. Requiring JSON forces a preflight.
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "Unsupported content type" }, { status: 415 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) {
    return Response.json({ error: "That's too long to send. Please shorten your answers." }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) {
      return Response.json({ error: "That's too long to send. Please shorten your answers." }, { status: 413 });
    }
    const parsed = JSON.parse(text);
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
  let isNew: boolean;
  let shareCode: string;
  try {
    ({ isNew, shareCode } = await saveUgcApplication(result.value, {
      sourcePath: clamp(body.sourcePath, 120),
      utmSource: clamp(body.utmSource, 80),
      utmMedium: clamp(body.utmMedium, 80),
      utmCampaign: clamp(body.utmCampaign, 120),
      referrer: clamp(body.referrer, 300),
    }));
  } catch (e) {
    // Never log the error itself: the database driver puts every bound value
    // (the whole application, stories included) in its message.
    const code = (e as { cause?: { code?: string }; code?: string })?.cause?.code ?? (e as { code?: string })?.code;
    console.error("[ugc-apply] save failed", code ?? (e as Error)?.name ?? "unknown");
    return Response.json({ error: "We couldn't save your application just now. Please try again in a minute." }, { status: 503 });
  }

  // The share code lets the success screen hand out links that credit them.
  return Response.json(isNew ? { ok: true, shareCode } : { ok: true, alreadyApplied: true, shareCode });
}
