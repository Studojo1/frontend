import type { Route } from "./+types/api.journey";
import { cleanCta, cleanPath, FIRST_TOUCH_COOKIE, journeyEnv, LAST_TOUCH_COOKIE, parseCookies, readSource, validVisitorId, VISITOR_COOKIE } from "~/lib/journey";
import { isBotRequest, recordJourneyEvent } from "~/lib/journey.server";
import { checkRateLimit } from "~/lib/ratelimit.server";

/**
 * POST /api/journey: clicked_join, sent with navigator.sendBeacon on any join or start click (journey-client.ts).
 * Body {cta, path}. The visitor and the source come from this site's own cookies (stu_vid, stu_lt, else stu_src),
 * never from the body. Same-origin only, crawlers and prefetches ignored, capped per IP like the other tracking
 * endpoints. Always 204: a beacon has nobody to read an error.
 */
const done = () => new Response(null, { status: 204 });

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  try {
    if (isBotRequest(request)) return done();
    // A beacon from our own page says same-origin; anything else is someone else's page posting here.
    const site = request.headers.get("sec-fetch-site");
    if (site && site !== "same-origin") return done();
    const cookies = parseCookies(request.headers.get("cookie"));
    const visitorId = cookies.get(VISITOR_COOKIE);
    if (!validVisitorId(visitorId)) return done();
    const raw = (await request.text()).slice(0, 2_000);
    let body: { cta?: unknown; path?: unknown } = {};
    try {
      body = JSON.parse(raw) as typeof body;
    } catch {
      return done();
    }
    const cta = cleanCta(body.cta);
    const path = cleanPath(body.path);
    if (!cta || !path) return done();
    const limit = await checkRateLimit(request).catch(() => null);
    if (limit && !limit.allowed) return done();
    const source = readSource(cookies.get(LAST_TOUCH_COOKIE)) ?? readSource(cookies.get(FIRST_TOUCH_COOKIE));
    recordJourneyEvent({
      env: journeyEnv(request.headers.get("host")),
      visitorId,
      step: "clicked_join",
      props: { cta, path },
      source,
    });
  } catch {
    // never surfaces
  }
  return done();
}

export function loader() {
  return new Response(null, { status: 405 });
}
