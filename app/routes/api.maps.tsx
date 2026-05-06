import type { Route } from "./+types/api.maps";
import db from "~/lib/db";
import { sql } from "drizzle-orm";

// City → [lat, lng] lookup for geocoding without an API key.
// Covers the markets Studojo targets.
const CITY_COORDS: Record<string, [number, number]> = {
  // India
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  mumbai: [19.076, 72.8777],
  delhi: [28.6139, 77.209],
  "new delhi": [28.6139, 77.209],
  hyderabad: [17.385, 78.4867],
  pune: [18.5204, 73.8567],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  ahmedabad: [23.0225, 72.5714],
  noida: [28.5355, 77.391],
  gurgaon: [28.4595, 77.0266],
  gurugram: [28.4595, 77.0266],
  // US
  "new york": [40.7128, -74.006],
  "new york city": [40.7128, -74.006],
  nyc: [40.7128, -74.006],
  "san francisco": [37.7749, -122.4194],
  sf: [37.7749, -122.4194],
  "los angeles": [34.0522, -118.2437],
  la: [34.0522, -118.2437],
  seattle: [47.6062, -122.3321],
  austin: [30.2672, -97.7431],
  chicago: [41.8781, -87.6298],
  boston: [42.3601, -71.0589],
  denver: [39.7392, -104.9903],
  miami: [25.7617, -80.1918],
  // UK
  london: [51.5074, -0.1278],
  manchester: [53.4808, -2.2426],
  edinburgh: [55.9533, -3.1883],
  birmingham: [52.4862, -1.8904],
  // UAE
  dubai: [25.2048, 55.2708],
  "abu dhabi": [24.4539, 54.3773],
  sharjah: [25.3373, 55.4121],
  // Singapore
  singapore: [1.3521, 103.8198],
  // Other
  toronto: [43.6532, -79.3832],
  sydney: [-33.8688, 151.2093],
  melbourne: [-37.8136, 144.9631],
  amsterdam: [52.3676, 4.9041],
  berlin: [52.52, 13.405],
  paris: [48.8566, 2.3522],
};

function extractCity(location: string): string {
  if (!location) return "";
  // Take first part before comma, lowercase, trim
  return location.split(",")[0].trim().toLowerCase();
}

function geocodeLocation(location: string): [number, number] | null {
  const city = extractCity(location);
  // Exact match
  if (CITY_COORDS[city]) return CITY_COORDS[city];
  // Partial match (e.g. "bangalore, karnataka")
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (city.includes(key) || key.includes(city)) return coords;
  }
  return null;
}

function detectMarket(country: string, city: string): string {
  const c = (country || "").toLowerCase();
  const ci = (city || "").toLowerCase();
  if (c.includes("india") || ["bangalore", "bengaluru", "mumbai", "delhi", "hyderabad", "pune", "chennai", "kolkata", "noida", "gurgaon", "gurugram"].some(x => ci.includes(x))) return "India";
  if (c.includes("united states") || c === "us" || c === "usa") return "US";
  if (c.includes("united kingdom") || c === "uk") return "UK";
  if (c.includes("emirates") || c === "uae" || ci.includes("dubai") || ci.includes("abu dhabi")) return "UAE";
  if (c.includes("singapore") || ci.includes("singapore")) return "Singapore";
  return "Global";
}

// GET /api/maps - returns all companies with active internship counts + coords
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const market = url.searchParams.get("market") || "all";
  const workMode = url.searchParams.get("work_mode") || "all";

  // Fetch companies joined with internship counts
  const result = await db.execute(sql.raw(`
    SELECT
      c.id,
      c.name,
      c.city,
      c.country,
      c.market,
      c.lat,
      c.lng,
      c.logo_url,
      c.sector,
      c.stage,
      c.niche_score,
      c.website,
      COUNT(i.id) FILTER (WHERE i.status = 'published') AS internship_count,
      json_agg(
        json_build_object(
          'id', i.id,
          'title', i.title,
          'location', i.location,
          'work_mode', COALESCE(i.work_mode, 'onsite'),
          'stipend', i.stipend,
          'duration', i.duration,
          'slug', i.slug,
          'deadline', i.application_deadline,
          'niche_score', COALESCE(i.niche_score, 3)
        )
      ) FILTER (WHERE i.status = 'published') AS internships
    FROM companies c
    LEFT JOIN internships i ON i.company_id = c.id
    WHERE c.is_deleted = false
    GROUP BY c.id
    HAVING COUNT(i.id) FILTER (WHERE i.status = 'published') > 0
    ORDER BY c.name
  `));

  let companies = result.rows as any[];

  // Geocode companies that don't have lat/lng yet (from their internship locations)
  // and detect market from location data
  const geocodeUpdates: Array<{ id: string; lat: number; lng: number; city: string; country: string; market: string }> = [];

  companies = companies.map((co) => {
    let lat = co.lat ? parseFloat(co.lat) : null;
    let lng = co.lng ? parseFloat(co.lng) : null;
    let city = co.city || "";
    let country = co.country || "";
    let market = co.market || "";

    // Try to geocode from first internship's location field
    if ((!lat || !lng) && co.internships?.length) {
      const location = co.internships[0]?.location || "";
      const coords = geocodeLocation(location);
      if (coords) {
        lat = coords[0];
        lng = coords[1];
        city = city || extractCity(location);
        // Extract country from location (second part after comma)
        const parts = location.split(",");
        country = country || (parts[1]?.trim() || "");
      }
    }

    if (!market && (city || country)) {
      market = detectMarket(country, city);
    }

    // Queue a DB update if we resolved coords
    if (lat && lng && (!co.lat || !co.lng)) {
      geocodeUpdates.push({ id: co.id, lat, lng, city, country, market });
    }

    return { ...co, lat, lng, city, country, market };
  });

  // Persist resolved coords in background (best-effort, no await blocking the response)
  if (geocodeUpdates.length > 0) {
    Promise.all(
      geocodeUpdates.map(({ id, lat, lng, city, country, market }) =>
        db.execute(sql.raw(`
          UPDATE companies SET lat=${lat}, lng=${lng},
            city=${city ? `'${city.replace(/'/g, "''")}'` : "city"},
            country=${country ? `'${country.replace(/'/g, "''")}'` : "country"},
            market=${market ? `'${market.replace(/'/g, "''")}'` : "market"},
            updated_at=now()
          WHERE id='${id}'
        `)).catch(() => {/* silent */})
      )
    );
  }

  // Apply filters
  let filtered = companies.filter((co) => co.lat && co.lng);

  if (market !== "all") {
    filtered = filtered.filter((co) => co.market === market);
  }
  if (workMode !== "all") {
    filtered = filtered.map((co) => ({
      ...co,
      internships: (co.internships || []).filter((i: any) => i.work_mode === workMode),
    })).filter((co) => co.internships?.length > 0);
  }

  // Aggregate stats
  const stats = {
    total_companies: filtered.length,
    total_internships: filtered.reduce((sum: number, co: any) => sum + parseInt(co.internship_count || "0"), 0),
    markets: {
      India: companies.filter((c) => c.market === "India").length,
      US: companies.filter((c) => c.market === "US").length,
      UK: companies.filter((c) => c.market === "UK").length,
      UAE: companies.filter((c) => c.market === "UAE").length,
      Singapore: companies.filter((c) => c.market === "Singapore").length,
      Global: companies.filter((c) => c.market === "Global" || !c.market).length,
    },
  };

  return Response.json({ companies: filtered, stats });
}
