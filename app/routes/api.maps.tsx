import type { Route } from "./+types/api.maps";
import db from "~/lib/db";
import { sql } from "drizzle-orm";
import { detectMarket, geocodeLocation } from "~/lib/geo";

// ─── DB query ─────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const market = url.searchParams.get("market") || "all";

  const result = await db.execute(sql.raw(`
    SELECT
      c.id,
      c.name,
      c.logo_url,
      c.website,
      COUNT(i.id) FILTER (WHERE i.status = 'published') AS internship_count,
      json_agg(
        json_build_object(
          'id', i.id,
          'title', i.title,
          'location', i.location,
          'stipend', i.stipend,
          'duration', i.duration,
          'slug', i.slug,
          'deadline', i.application_deadline
        ) ORDER BY i.created_at DESC
      ) FILTER (WHERE i.status = 'published') AS internships
    FROM companies c
    INNER JOIN internships i ON i.company_id = c.id AND i.status = 'published'
    WHERE c.is_deleted = false
    GROUP BY c.id
    HAVING COUNT(i.id) FILTER (WHERE i.status = 'published') > 0
    ORDER BY c.name
  `));

  // Also pick up internships without a linked company (including scraped ones)
  const unlinkedResult = await db.execute(sql.raw(`
    SELECT
      company_name AS name,
      COUNT(id) AS internship_count,
      json_agg(
        json_build_object(
          'id', id,
          'title', title,
          'location', location,
          'stipend', stipend,
          'duration', duration,
          'slug', slug,
          'deadline', application_deadline
        ) ORDER BY created_at DESC
      ) AS internships
    FROM internships
    WHERE status = 'published'
      AND (company_id IS NULL OR company_id NOT IN (SELECT id FROM companies WHERE is_deleted = false))
      AND company_name IS NOT NULL
      AND company_name != ''
      AND company_name != 'null'
    GROUP BY company_name
    ORDER BY company_name
  `));

  interface CompanyEntry {
    id: string;
    name: string;
    logo_url: string | null;
    website: string | null;
    lat: number | null;
    lng: number | null;
    market: string;
    niche_score: number;
    internship_count: number;
    internships: any[];
  }

  const companies: CompanyEntry[] = [];

  const processRow = (row: any, isUnlinked = false) => {
    const internships: any[] = row.internships || [];
    const count = parseInt(row.internship_count || "0");
    if (count === 0) return;

    // Pick best (non-remote) location from any internship in this company
    const locations = internships.map((i: any) => i.location || "").filter(Boolean);
    const bestLocation =
      locations.find((l: string) => {
        const low = l.toLowerCase();
        return !low.includes("worldwide") && !low.includes("anywhere") && !low.includes("global");
      }) ||
      locations[0] ||
      "";

    const coords = geocodeLocation(bestLocation);
    if (!coords) return;

    const mkt = detectMarket(bestLocation);

    companies.push({
      id: isUnlinked ? `unlinked-${row.name}` : row.id,
      name: row.name,
      logo_url: row.logo_url || null,
      website: row.website || null,
      lat: coords[0],
      lng: coords[1],
      market: mkt,
      niche_score: 3,
      internship_count: count,
      internships: internships.slice(0, 5),
    });
  };

  (result.rows as any[]).forEach((r) => processRow(r, false));
  unlinkedResult.rows.forEach((r) => processRow(r, true));

  // Deduplicate by company name
  const seen = new Set<string>();
  const deduped = companies.filter((co) => {
    const key = co.name.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  let filtered = deduped;
  if (market !== "all") {
    filtered = filtered.filter((co) => co.market === market);
  }

  const stats = {
    total_companies: deduped.length,
    total_internships: deduped.reduce((sum, co) => sum + co.internship_count, 0),
    markets: {
      India: deduped.filter((c) => c.market === "India").length,
      US: deduped.filter((c) => c.market === "US").length,
      UK: deduped.filter((c) => c.market === "UK").length,
      UAE: deduped.filter((c) => c.market === "UAE").length,
      Singapore: deduped.filter((c) => c.market === "Singapore").length,
      Europe: deduped.filter((c) => c.market === "Europe").length,
      APAC: deduped.filter((c) => c.market === "APAC").length,
      Global: deduped.filter((c) => c.market === "Global").length,
    },
  };

  return Response.json({ companies: filtered, stats });
}
