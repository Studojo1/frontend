import type { Route } from "./+types/api.meta-event";
import { auth } from "~/lib/auth";
import { sendMetaEvent, metaUserDataFromRequest, isMetaCapiConfigured, cleanFbc, valueData, metaProdHost, withAccount } from "~/lib/meta-capi.server";
import { claimOnce, POSTHOG_SIGNED_UP } from "~/lib/tracking-once.server";
import { checkRateLimit } from "~/lib/ratelimit.server";
import { serverMayReportToMeta } from "~/lib/consent";
import { parseCookies, validVisitorId, VISITOR_COOKIE } from "~/lib/journey";
import { holdLead } from "~/lib/meta-lead-late.server";

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
 * EMQ (5 Nov 2026): so are the name and phone. What each copy carries (meta-capi.server.ts metaUserDataPayload):
 *   signed out  external_id [visitor id], ip, user agent, fbp, fbc.
 *   signed in   also em, fn, ln (a real name only, accountName), ph and country (when the account has a phone), and
 *               external_id [account id, visitor id].
 * All hashed except ip, user agent, fbp and fbc. The browser pixel's init sends the same hashed visitor id.
 * LEAD-LATE (7 Nov 2026): a signed-out Lead's server copy is held (meta-lead-late.server.ts) and sent with the signed-in
 * keys of the account that visitor makes next, at the click's time, or after 10 minutes as it is.
 *
 * Always returns 200. A failed analytics call must never surface to the user.
 *
 * META-FIX (2 Nov 2026). The event map, one meaning per name across studojo.com and platform.studojo.com (one dataset):
 *   PageView              every page change, browser only.
 *   Lead                  THIS SITE only: a click on a join or start CTA (journey-client.ts), browser + server, a
 *                         random event_id, once a tab session. The platform never fires Lead.
 *   CompleteRegistration  a new account, event_id reg_<userId>, browser + server, exactly once a person across both
 *                         hosts: the body's once: true claims it (career_agent.career_tracking_once,
 *                         tracking-once.server.ts) before either copy fires. Email sign-ups here (/auth), Google
 *                         sign-ups on the platform.
 *   OnboardingComplete    the platform's custom event (set up done), event_id onboarding_<userId>; not sent from here.
 *   ViewContent, InitiateCheckout, AddPaymentInfo, Purchase: the old /outreach funnel (analytics.ts META_EVENT). The
 *                         server copies of InitiateCheckout and AddPaymentInfo carry value and currency (INR) too.
 * once: true answers {ok, once: {meta, posthog}}: true first (fire the browser copy), false already reported, null
 * unknown (the browser's own flag decides). meta: false (the browser may not tell Meta) claims nothing for Meta;
 * posthog: true also claims PostHog's signed_up, so it is captured once too. The claim is made even where this server
 * does not send to Meta (staging, no token), so signed_up is once everywhere.
 * fbc: the _fbc cookie, else built from the fbclid in stu_lt / stu_src (meta-capi.server.ts), else the fbc the browser
 * sends when it has Meta's shape (attribution.ts metaBrowserIds). fbp from the _fbp cookie when it exists.
 *
 * B8: only a request that came for studojo.com or www.studojo.com (the Host header, metaProdHost) is read at all.
 * Anywhere else (studojo.pro staging, a laptop) the answer is 204 and nothing is sent or claimed, so staging never
 * writes to the live dataset even with the token set; a once claim there gets no answer and the browser's own flag
 * decides.
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

// RELAUNCH (2 Nov 2026): the new site's Lead is a click on a join or start CTA, made before any account exists
// (journey-client.ts). Accepted without a session only from our own page (Sec-Fetch-Site same-origin) with a visitor
// id this site issued (stu_vid), and once per visitor per half hour, so a script cannot pour Leads in.
const ANON_LEAD_WINDOW_MS = 30 * 60 * 1000;
const anonLeads = new Map<string, number>();
function anonLeadAllowed(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") !== "same-origin") return false;
  const vid = parseCookies(request.headers.get("cookie")).get(VISITOR_COOKIE);
  if (!validVisitorId(vid)) return false;
  const now = Date.now();
  const at = anonLeads.get(vid);
  if (at && now - at < ANON_LEAD_WINDOW_MS) return false;
  if (anonLeads.size > 50_000) anonLeads.clear();
  anonLeads.set(vid, now);
  return true;
}

// Purchase is deliberately absent. It is the only event carrying a monetary
// value, so accepting it here would let anyone POST fabricated revenue into the
// dataset the campaigns bid against, and into reported ROAS. The browser pixel
// still sends Purchase directly; the authoritative server-side copy belongs in
// job-outreach-svc, which knows the real order amount and does not have to take
// a caller's word for it.

type OnceReply = { meta: boolean | null; posthog?: boolean | null };
const ok = (once?: OnceReply) =>
  new Response(JSON.stringify(once ? { ok: true, once } : { ok: true }), {
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

  // B8: the production host gate. Not studojo.com or www.studojo.com: 204, nothing sent.
  if (!metaProdHost(request.headers.get("host"))) return new Response(null, { status: 204 });

  let body: {
    eventName?: string;
    eventId?: string;
    sourceUrl?: string;
    tracking_consent?: unknown;
    time_zone?: unknown;
    once?: unknown;
    meta?: unknown;
    posthog?: unknown;
    value?: unknown;
    currency?: unknown;
    fbc?: unknown;
  } = {};
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
  const consentOk = serverMayReportToMeta(body.tracking_consent, body.time_zone);

  // B4: CompleteRegistration once a person, across both hosts (and PostHog's signed_up with it).
  if (body.once === true && eventName === "CompleteRegistration") return claimRegistration(request, body, eventId, consentOk);

  if (!isMetaCapiConfigured()) return ok();
  if (!consentOk) return ok();

  // Per-IP cap, silent like everything else here (audit ST-N12).
  const limit = await checkRateLimit(request);
  if (limit && !limit.allowed) return ok();

  let user = metaUserDataFromRequest(request);

  // Logged-in users get email and a stable id, which is what lifts Event Match
  // Quality above the threshold where optimisation actually works. Anonymous
  // landing-page hits still send cookies, IP, user agent and the hashed stu_vid visitor id.
  // EMQ (5 Nov 2026): signed in, the account's name (fn, ln), phone (ph) and the phone's country too, from the
  // session (better-auth's phone-number plugin returns phoneNumber on the session user; no extra query), and
  // external_id lists the account id and the visitor id (meta-capi.server.ts withAccount).
  let signedIn = false;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user) {
      signedIn = true;
      user = withAccount(user, session.user);
    }
  } catch {
    // Not signed in, or auth unavailable. Send what we have.
  }
  // A registration or lead with no account behind it is not one; anyone could
  // POST these to inflate the conversions the ads optimise for (ST-N12).
  if (!signedIn && SESSION_EVENTS.has(eventName) && !(eventName === "Lead" && anonLeadAllowed(request))) return ok();

  if (!user.fbc) user.fbc = cleanFbc(body.fbc);
  const customData = valueData(eventName, body);
  const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.slice(0, 500) : request.headers.get("referer");

  // LEAD-LATE (7 Nov 2026): a signed-out Lead's server copy waits for the account this visitor makes next, and goes
  // with its email, phone and name, at the click's own time (meta-lead-late.server.ts).
  const vid = parseCookies(request.headers.get("cookie")).get(VISITOR_COOKIE);
  if (!signedIn && eventName === "Lead" && validVisitorId(vid)) {
    holdLead({ eventId, at: Date.now(), sourceUrl, user, visitorId: vid });
    return ok();
  }

  await sendMetaEvent({
    eventName,
    eventId,
    eventSourceUrl: sourceUrl,
    user,
    ...(customData ? { customData } : {}),
  });

  return ok();
}

/**
 * B4: the signed-in person's CompleteRegistration (reg_<their id>, never anyone else's), claimed before it is sent,
 * and PostHog's signed_up with it when asked. Answers at once; the server copy goes on after.
 */
async function claimRegistration(
  request: Request,
  body: { sourceUrl?: string; meta?: unknown; posthog?: unknown; fbc?: unknown },
  eventId: string,
  consentOk: boolean,
): Promise<Response> {
  let userId: string | null = null;
  let account: Parameters<typeof withAccount>[1] = {};
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    userId = session?.user?.id ?? null;
    account = session?.user ?? {};
  } catch {
    userId = null;
  }
  if (!userId) return ok();
  // analytics.ts registrationEventId (a browser module, so not imported here).
  if (eventId !== `reg_${userId}`) return ok({ meta: false, posthog: false });
  const limit = await checkRateLimit(request);
  if (limit && !limit.allowed) return ok();
  const host = new URL(request.url).host;
  const metaClaim = body.meta !== false && consentOk ? await claimOnce(userId, "CompleteRegistration", host) : false;
  const reply: OnceReply = { meta: metaClaim };
  if (body.posthog === true) reply.posthog = await claimOnce(userId, POSTHOG_SIGNED_UP, host);
  // Unknown (null) still sends: the same event id, so Meta keeps one.
  if (metaClaim !== false && isMetaCapiConfigured()) {
    // EMQ (5 Nov 2026): the same keys as every signed-in send (withAccount): email, name, phone and its country, the
    // account id and the visitor id.
    const user = withAccount(metaUserDataFromRequest(request), account);
    if (!user.fbc) user.fbc = cleanFbc(body.fbc);
    void sendMetaEvent({ eventName: "CompleteRegistration", eventId, eventSourceUrl: body.sourceUrl ?? request.headers.get("referer"), user });
  }
  return ok(reply);
}
