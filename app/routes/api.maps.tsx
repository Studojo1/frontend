import type { Route } from "./+types/api.maps";
import db from "~/lib/db";
import { sql } from "drizzle-orm";

// City → [lat, lng]. Covers Studojo's target markets.
const CITY_COORDS: Record<string, [number, number]> = {
  // India
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  bengluru: [12.9716, 77.5946],
  bangaluru: [12.9716, 77.5946],
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
  jaipur: [26.9124, 75.7873],
  surat: [21.1702, 72.8311],
  lucknow: [26.8467, 80.9462],
  kochi: [9.9312, 76.2673],
  bhopal: [23.2599, 77.4126],
  indore: [22.7196, 75.8577],
  chandigarh: [30.7333, 76.7794],
  coimbatore: [11.0168, 76.9558],
  nagpur: [21.1458, 79.0882],
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
  atlanta: [33.749, -84.388],
  dallas: [32.7767, -96.797],
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

// Broader aliases to handle partial matches
const CITY_ALIASES: Array<[string, [number, number]]> = [
  ["bang", [12.9716, 77.5946]], // bangalore/bengaluru/bengluru all start with bang/beng
  ["beng", [12.9716, 77.5946]],
  ["mumb", [19.076, 72.8777]],
  ["delhi", [28.6139, 77.209]],
  ["hyder", [17.385, 78.4867]],
  ["singap", [1.3521, 103.8198]],
  ["dubai", [25.2048, 55.2708]],
  ["london", [51.5074, -0.1278]],
];

function extractCity(location: string): string {
  if (!location) return "";
  // Strip parenthetical content: "Bangalore (On-field)" → "Bangalore"
  let cleaned = location.replace(/\(.*?\)/g, "").trim();
  // Take first segment before / or ,
  cleaned = cleaned.split(/[\/,]/)[0].trim();
  // Remove common suffixes
  cleaned = cleaned.replace(/\b(based|office|city|area|region|campus)\b/gi, "").trim();
  return cleaned.toLowerCase();
}

function geocodeLocation(location: string): [number, number] | null {
  if (!location) return null;
  const skip = ["remote", "flexible", "work from home", "wfh", "anywhere", "pan india", "pan-india", "hybrid", "onsite", "on-site"];
  const lower = location.toLowerCase();
  if (skip.some((s) => lower.includes(s) && lower.length < 20)) return null;

  const city = extractCity(location);
  if (!city || city.length < 3) return null;

  // Exact match
  if (CITY_COORDS[city]) return CITY_COORDS[city];

  // Partial match — city contains a known key or vice versa
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (city.startsWith(key) || key.startsWith(city) || city.includes(key) || key.includes(city)) {
      return coords;
    }
  }

  // Alias prefix match
  for (const [prefix, coords] of CITY_ALIASES) {
    if (city.startsWith(prefix)) return coords;
  }

  return null;
}

function detectMarket(location: string): string {
  const l = (location || "").toLowerCase();
  const indiaCities = ["bangalore", "bengaluru", "bengluru", "mumbai", "delhi", "hyderabad", "pune", "chennai", "kolkata", "noida", "gurgaon", "gurugram", "ahmedabad", "india", "jaipur", "kochi", "indore", "bhopal", "nagpur", "surat", "chandigarh", "coimbatore", "lucknow"];
  if (indiaCities.some((c) => l.includes(c))) return "India";
  if (["singapore"].some((c) => l.includes(c))) return "Singapore";
  if (["dubai", "abu dhabi", "sharjah", "uae", "emirates"].some((c) => l.includes(c))) return "UAE";
  if (["london", "manchester", "edinburgh", "birmingham", " uk", "united kingdom"].some((c) => l.includes(c))) return "UK";
  if (["new york", "san francisco", "seattle", "austin", "chicago", "boston", "los angeles", "denver", "miami", "atlanta", "dallas", " us ", "usa", "united states"].some((c) => l.includes(c))) return "US";
  return "Global";
}

// GET /api/maps — returns companies with active internship counts and coordinates
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const market = url.searchParams.get("market") || "all";
  const workMode = url.searchParams.get("work_mode") || "all";

  // Query companies + their published internships using only columns guaranteed to exist
  // (does NOT reference the new lat/lng columns which may not be migrated yet)
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

  const rows = result.rows as any[];

  // Also try to pick up internships not yet linked to a company via company_id
  // by querying internships directly by company_name
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

  // Build unified company list
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

    // Find the best location string from internships (prefer non-remote ones first)
    const locations = internships.map((i: any) => i.location || "").filter(Boolean);
    let bestLocation = locations.find((l: string) => {
      const low = l.toLowerCase();
      return !low.includes("remote") && !low.includes("flexible") && !low.includes("wfh");
    }) || locations[0] || "";

    // Geocode
    const coords = geocodeLocation(bestLocation);
    if (!coords) return; // skip companies we can't place on the map

    const mkt = detectMarket(bestLocation);

    companies.push({
      id: isUnlinked ? `unlinked-${row.name}` : row.id,
      name: row.name,
      logo_url: row.logo_url || null,
      website: row.website || null,
      lat: coords[0],
      lng: coords[1],
      market: mkt,
      niche_score: 3, // default; will be enhanced with niche scoring later
      internship_count: count,
      internships: internships.slice(0, 5),
    });
  };

  rows.forEach((r) => processRow(r, false));
  unlinkedResult.rows.forEach((r) => processRow(r, true));

  // Deduplicate by company name (in case a company appears in both queries)
  const seen = new Set<string>();
  const deduped = companies.filter((co) => {
    const key = co.name.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Apply filters
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
      Global: deduped.filter((c) => c.market === "Global").length,
    },
  };

  return Response.json({ companies: filtered, stats });
}
