import { and, desc, eq, gt, isNull, or } from "drizzle-orm";
import db from "~/lib/db";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { distanceKm, extractCity, findPlace, geocodeLocation } from "~/lib/geo";
import { internshipApplications, internships } from "../../auth-schema";
import type { Route } from "./+types/api.profile.globe";

/**
 * Data for the profile globe: GET /api/profile/globe?home=<text>&cities=<a>|<b>
 *
 *  - home:    the student's base, found in free text (their college, or the
 *             first city they want to work in)
 *  - cities:  where they want to work, each with the live internships on
 *             Studojo within NEAR_KM and up to three "X is hiring" samples
 *  - applied: internships they applied to that we can place on the map
 *  - hubs:    when they named no cities, the three busiest places, so the
 *             globe still shows where the roles are
 */

const NEAR_KM = 60;
const MAX_CITIES = 8;

type Point = { name: string; lat: number; lng: number };
type Sample = { title: string; company: string; slug: string };
type CityOut = Point & { openRoles: number; samples: Sample[] };

/** A place a student typed ("Bengaluru", "Delhi NCR"); null for "Remote" and unknowns. */
function locate(name: string): Point | null {
  const strict = findPlace(name);
  if (strict) return { ...strict, name };
  if (extractCity(name).length < 3) return null; // "Remote", "Hybrid": nothing to place
  const c = geocodeLocation(name);
  return c ? { name, lat: c[0], lng: c[1] } : null;
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const wanted = (params.get("cities") ?? "")
    .split("|")
    .map((s) => s.trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, MAX_CITIES);

  const now = new Date();
  const [open, applied] = await Promise.all([
    db
      .select({
        title: internships.title,
        company: internships.companyName,
        slug: internships.slug,
        location: internships.location,
      })
      .from(internships)
      .where(
        and(
          eq(internships.status, "published"),
          or(isNull(internships.applicationDeadline), gt(internships.applicationDeadline, now)),
        ),
      )
      .orderBy(desc(internships.createdAt))
      .limit(1500),
    db
      .select({
        title: internships.title,
        company: internships.companyName,
        location: internships.location,
        status: internshipApplications.status,
      })
      .from(internshipApplications)
      .innerJoin(internships, eq(internshipApplications.internshipId, internships.id))
      .where(eq(internshipApplications.userId, session.user.id))
      .orderBy(desc(internshipApplications.createdAt))
      .limit(40),
  ]);

  // Geocode each distinct location string once.
  const memo = new Map<string, [number, number] | null>();
  const where = (loc: string) => {
    if (!memo.has(loc)) memo.set(loc, extractCity(loc).length >= 2 ? geocodeLocation(loc) : null);
    return memo.get(loc)!;
  };
  const placed = open
    .map((r) => ({ ...r, at: where(r.location) }))
    .filter((r): r is typeof r & { at: [number, number] } => !!r.at);

  const near = (p: Point): CityOut => {
    const here = placed.filter((r) => distanceKm([p.lat, p.lng], r.at) <= NEAR_KM);
    const seen = new Set<string>();
    const samples: Sample[] = [];
    for (const r of here) {
      // One sample per company so three cards show three different employers.
      if (seen.has(r.company.toLowerCase())) continue;
      seen.add(r.company.toLowerCase());
      samples.push({ title: r.title, company: r.company, slug: r.slug });
      if (samples.length === 3) break;
    }
    return { ...p, openRoles: here.length, samples };
  };

  const cities: CityOut[] = [];
  for (const name of wanted) {
    const p = locate(name);
    if (p && !cities.some((c) => distanceKm([c.lat, c.lng], [p.lat, p.lng]) < 5)) cities.push(near(p));
  }

  const homeText = params.get("home");
  const homePoint = (homeText && findPlace(homeText)) || (cities[0] ? { name: cities[0].name, lat: cities[0].lat, lng: cities[0].lng } : null);

  let hubs: CityOut[] = [];
  if (cities.length === 0) {
    // Busiest places, clustered by the same radius as above.
    const groups: { at: [number, number]; label: string; n: number }[] = [];
    for (const r of placed) {
      const g = groups.find((x) => distanceKm(x.at, r.at) <= NEAR_KM);
      if (g) g.n++;
      else groups.push({ at: r.at, label: r.location.split(/[,/(|]/)[0].trim(), n: 1 });
    }
    hubs = groups
      .sort((a, b) => b.n - a.n)
      .slice(0, 3)
      .map((g) => near({ name: g.label, lat: g.at[0], lng: g.at[1] }));
  }

  const appliedOut = applied
    .map((a) => {
      const at = where(a.location);
      return at ? { company: a.company, title: a.title, status: a.status, lat: at[0], lng: at[1] } : null;
    })
    .filter(Boolean);

  return Response.json(
    {
      home: homePoint,
      cities,
      hubs,
      applied: appliedOut,
      totalOpen: open.length,
    },
    { headers: { "Cache-Control": "private, max-age=300" } },
  );
}
