import { and, desc, eq, gt, isNull, or } from "drizzle-orm";
import db from "~/lib/db";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { findPlace, geocodeLocation, extractCity } from "~/lib/geo";
import { skillsIn } from "~/lib/resume-quick-parse";
import { toBrainRole } from "~/lib/swipe-brain";
import { internships } from "../../auth-schema";
import type { Route } from "./+types/api.start.deck";

/**
 * GET /api/start/deck: every open role, described for the swipe brain
 * (kind of work, specialty, city, pay, length, company type, skills it uses).
 * There is no fixed deck: /start picks each next card in the browser from
 * what the student kept and passed (app/lib/swipe-brain.ts).
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

  const rows = await db
    .select({
      id: internships.id,
      title: internships.title,
      company: internships.companyName,
      location: internships.location,
      stipend: internships.stipend,
      duration: internships.duration,
      slug: internships.slug,
      requirements: internships.requirements,
      description: internships.description,
    })
    .from(internships)
    .where(
      and(
        eq(internships.status, "published"),
        or(isNull(internships.applicationDeadline), gt(internships.applicationDeadline, new Date())),
      ),
    )
    .orderBy(desc(internships.createdAt))
    .limit(1500);

  const pool = rows.map((r) => toBrainRole(r, cityOf(r.location), skillsIn));
  return Response.json({ pool }, { headers: { "Cache-Control": "private, max-age=120" } });
}
