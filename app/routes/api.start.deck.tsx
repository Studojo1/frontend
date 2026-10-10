import { and, desc, eq, gt, isNull, or } from "drizzle-orm";
import db from "~/lib/db";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { findPlace, geocodeLocation, extractCity } from "~/lib/geo";
import { clusterOf, parseStipend, pickDeck, type DeckRole } from "~/lib/swipe-prefs";
import { internships, userProfile } from "../../auth-schema";
import type { Route } from "./+types/api.start.deck";

/**
 * GET /api/start/deck: the role cards for /start's swipe step, plus a compact
 * pool of every open role so the page can count live matches as they swipe.
 * The deck leans towards the student's confirmed skills and course but is
 * spread across kinds of work, so every swipe teaches us something.
 */

/** Display city for a location string, so "Koramangala, Bengaluru" and "Bangalore" group together. */
function cityOf(location: string): string | null {
  const strict = findPlace(location);
  if (strict) return strict.name === "Bangalore" ? "Bengaluru" : strict.name;
  if (extractCity(location).length < 3) return null;
  return geocodeLocation(location) ? location.split(/[,/(|]/)[0].trim() : null;
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [rows, [profile]] = await Promise.all([
    db
      .select({
        id: internships.id,
        title: internships.title,
        company: internships.companyName,
        location: internships.location,
        stipend: internships.stipend,
        duration: internships.duration,
        slug: internships.slug,
      })
      .from(internships)
      .where(
        and(
          eq(internships.status, "published"),
          or(isNull(internships.applicationDeadline), gt(internships.applicationDeadline, new Date())),
        ),
      )
      .orderBy(desc(internships.createdAt))
      .limit(1500),
    db
      .select({ course: userProfile.course, talent: userProfile.talent })
      .from(userProfile)
      .where(eq(userProfile.userId, session.user.id))
      .limit(1),
  ]);

  const pool: DeckRole[] = rows.map((r) => ({
    ...r,
    city: cityOf(r.location),
    cluster: clusterOf(r.title),
    monthly: parseStipend(r.stipend),
  }));
  const hints = [profile?.course ?? "", ...(profile?.talent?.resume?.skills ?? [])];
  const cards = pickDeck(pool, hints, 12);

  return Response.json({
    cards,
    pool: pool.map((r) => ({ cluster: r.cluster, city: r.city, monthly: r.monthly })),
  });
}
