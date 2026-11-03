import type { Route } from "./+types/api.journey";
import { readJourneyBeacon, recordJourneyEvent, underDailyCap } from "~/lib/journey.server";
import { checkRateLimit } from "~/lib/ratelimit.server";

/**
 * POST /api/journey: the browser's journey steps, sent with navigator.sendBeacon. clicked_join on any join or start
 * click (journey-client.ts), body {cta, path}; SITE-TRACK (3 Nov 2026, the owner): page_view and page_engaged
 * (journey-pages.ts), body {step, pv, path, ...}. journey.server.ts readJourneyBeacon decides what is written: only the
 * steps and props on journey.ts's allow-list (a body without a step is clicked_join), the visitor and the source from
 * this site's own cookies (stu_vid, stu_lt, else stu_src), never from the body, device and inapp from the user agent;
 * same-origin only, crawlers ignored, nothing for a visitor who said no to tracking. Then capped per IP (its own
 * bucket, ratelimit.server.ts) and per visitor a day (underDailyCap). Always 204: a beacon has nobody to read an error.
 */
const done = () => new Response(null, { status: 204 });

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  try {
    const event = await readJourneyBeacon(request);
    if (!event) return done();
    const limit = await checkRateLimit(request).catch(() => null);
    if (limit && !limit.allowed) return done();
    if (!underDailyCap(event.visitorId, new Date())) return done();
    recordJourneyEvent(event);
  } catch {
    // never surfaces
  }
  return done();
}

export function loader() {
  return new Response(null, { status: 405 });
}
