import type { Route } from "./+types/api.meta-event";
import { auth } from "~/lib/auth";
import { sendMetaEvent, metaUserDataFromRequest, isMetaCapiConfigured } from "~/lib/meta-capi.server";
import { checkRateLimit } from "~/lib/ratelimit.server";
import { serverMayReportToMeta } from "~/lib/consent";

/**
 * Server-side mirror for browser pixel events (Meta Conversions API).
 *
 * Why this exists: connect.facebook.net and facebook.com/tr are blocked for a
 * large share of our audience, so the browser pixel silently loses conversions.
 * This route is on our own domain, so the POST always lands, and the server then
 * calls Meta directly. Same event_id on both copies, so Meta deduplicates rather
 * than double counting.
 *
 * The email is taken from the session on the server, never from the request body:
 * a client-supplied address would let anyone poison the match data.
 *
 * Always returns 200. A failed analytics call must never surface to the user.
 */

// Only events the app actually fires. Without this an attacker could post
// arbitrary standard events (Purchase, with a value) into the ad dataset and
// corrupt the optimiser we bid with.
const ALLOWED_EVENTS = new Set([
  "ViewContent",
  "Lead",
  "CompleteRegistration",
  "ResumeUploaded",
  "InitiateCheckout",
  "AddPaymentInfo",
]);

// Only real when someone is signed in.
const SESSION_EVENTS = new Set(["CompleteRegistration", "Lead"]);

// Purchase is deliberately absent. It is the only event carrying a monetary
// value, so accepting it here would let anyone POST fabricated revenue into the
// dataset the campaigns bid against, and into reported ROAS. The browser pixel
// still sends Purchase directly; the authoritative server-side copy belongs in
// job-outreach-svc, which knows the real order amount and does not have to take
// a caller's word for it.

const ok = () =>
  new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isMetaCapiConfigured()) return ok();

  let body: { eventName?: string; eventId?: string; sourceUrl?: string; tracking_consent?: unknown; time_zone?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return ok();
  }

  const { eventName, eventId } = body;
  if (!eventName || !eventId || !ALLOWED_EVENTS.has(eventName)) return ok();
  // HP-N13: the browser holds these events for an EU/UK visitor who has not
  // accepted, and so does the server. No consent state from an EU/UK time
  // zone, or no time zone at all, is a no.
  if (!serverMayReportToMeta(body.tracking_consent, body.time_zone)) return ok();

  // Per-IP cap, silent like everything else here (audit ST-N12).
  const limit = await checkRateLimit(request);
  if (limit && !limit.allowed) return ok();

  const user = metaUserDataFromRequest(request);

  // Logged-in users get email and a stable id, which is what lifts Event Match
  // Quality above the threshold where optimisation actually works. Anonymous
  // landing-page hits still send cookies, IP and user agent.
  let signedIn = false;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user) {
      signedIn = true;
      user.email = session.user.email ?? null;
      user.externalId = session.user.id ?? null;
    }
  } catch {
    // Not signed in, or auth unavailable. Send what we have.
  }
  // A registration or lead with no account behind it is not one; anyone could
  // POST these to inflate the conversions the ads optimise for (ST-N12).
  if (!signedIn && SESSION_EVENTS.has(eventName)) return ok();

  await sendMetaEvent({
    eventName,
    eventId,
    eventSourceUrl: body.sourceUrl ?? request.headers.get("referer"),
    user,
  });

  return ok();
}
