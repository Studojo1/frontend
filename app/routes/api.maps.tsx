import type { Route } from "./+types/api.maps";
import db from "~/lib/db";
import { sql } from "drizzle-orm";

// ─── City / country → [lat, lng] ─────────────────────────────────────────────

const COORDS: Record<string, [number, number]> = {
  // ── India ──
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
  india: [20.5937, 78.9629],
  // ── US ──
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
  portland: [45.5051, -122.675],
  nashville: [36.1627, -86.7816],
  phoenix: [33.4484, -112.074],
  minneapolis: [44.9778, -93.265],
  "san diego": [32.7157, -117.1611],
  "salt lake city": [40.7608, -111.891],
  "washington dc": [38.9072, -77.0369],
  washington: [38.9072, -77.0369],
  "united states": [37.09, -95.7129],
  usa: [37.09, -95.7129],
  us: [37.09, -95.7129],
  america: [37.09, -95.7129],
  "usa only": [37.09, -95.7129],
  "us only": [37.09, -95.7129],
  // ── UK ──
  london: [51.5074, -0.1278],
  manchester: [53.4808, -2.2426],
  edinburgh: [55.9533, -3.1883],
  birmingham: [52.4862, -1.8904],
  bristol: [51.4545, -2.5879],
  leeds: [53.8008, -1.5491],
  glasgow: [55.8617, -4.2583],
  liverpool: [53.4084, -2.9916],
  "united kingdom": [55.3781, -3.436],
  uk: [55.3781, -3.436],
  england: [52.3555, -1.1743],
  // ── UAE ──
  dubai: [25.2048, 55.2708],
  "abu dhabi": [24.4539, 54.3773],
  sharjah: [25.3373, 55.4121],
  uae: [24.0, 53.847],
  emirates: [24.0, 53.847],
  // ── Singapore ──
  singapore: [1.3521, 103.8198],
  // ── Germany ──
  berlin: [52.52, 13.405],
  munich: [48.1351, 11.582],
  hamburg: [53.5753, 10.0153],
  frankfurt: [50.1109, 8.6821],
  cologne: [50.9333, 6.95],
  stuttgart: [48.7758, 9.1829],
  düsseldorf: [51.2217, 6.7762],
  dusseldorf: [51.2217, 6.7762],
  germany: [51.1657, 10.4515],
  // ── Netherlands ──
  amsterdam: [52.3676, 4.9041],
  rotterdam: [51.9244, 4.4777],
  "the hague": [52.0705, 4.3007],
  utrecht: [52.0907, 5.1214],
  netherlands: [52.1326, 5.2913],
  holland: [52.1326, 5.2913],
  // ── France ──
  paris: [48.8566, 2.3522],
  lyon: [45.7640, 4.8357],
  marseille: [43.2965, 5.3698],
  france: [46.2276, 2.2137],
  // ── Spain ──
  madrid: [40.4168, -3.7038],
  barcelona: [41.3851, 2.1734],
  spain: [40.4637, -3.7492],
  // ── Poland ──
  warsaw: [52.2297, 21.0122],
  krakow: [50.0647, 19.945],
  kraków: [50.0647, 19.945],
  wroclaw: [51.1079, 17.0385],
  poland: [51.9194, 19.1451],
  // ── Czech Republic ──
  prague: [50.0755, 14.4378],
  brno: [49.1951, 16.6068],
  "czech republic": [49.8175, 15.473],
  czechia: [49.8175, 15.473],
  // ── Portugal ──
  lisbon: [38.7223, -9.1393],
  porto: [41.1579, -8.6291],
  portugal: [39.3999, -8.2245],
  // ── Sweden ──
  stockholm: [59.3293, 18.0686],
  gothenburg: [57.7089, 11.9746],
  sweden: [60.1282, 18.6435],
  // ── Norway ──
  oslo: [59.9139, 10.7522],
  norway: [60.472, 8.4689],
  // ── Denmark ──
  copenhagen: [55.6761, 12.5683],
  denmark: [56.2639, 9.5018],
  // ── Finland ──
  helsinki: [60.1699, 24.9384],
  finland: [61.9241, 25.7482],
  // ── Austria ──
  vienna: [48.2082, 16.3738],
  wien: [48.2082, 16.3738],
  austria: [47.5162, 14.5501],
  // ── Switzerland ──
  zurich: [47.3769, 8.5417],
  zürich: [47.3769, 8.5417],
  geneva: [46.2044, 6.1432],
  basel: [47.5596, 7.5886],
  switzerland: [46.8182, 8.2275],
  // ── Italy ──
  rome: [41.9028, 12.4964],
  milan: [45.4654, 9.1859],
  italy: [41.8719, 12.5674],
  // ── Belgium ──
  brussels: [50.8503, 4.3517],
  antwerp: [51.2194, 4.4025],
  belgium: [50.5039, 4.4699],
  // ── Ireland ──
  dublin: [53.3498, -6.2603],
  ireland: [53.1424, -7.6921],
  // ── Romania ──
  bucharest: [44.4268, 26.1025],
  romania: [45.9432, 24.9668],
  // ── Hungary ──
  budapest: [47.4979, 19.0402],
  hungary: [47.1625, 19.5033],
  // ── Ukraine ──
  kyiv: [50.4501, 30.5234],
  ukraine: [48.3794, 31.1656],
  // ── Greece ──
  athens: [37.9838, 23.7275],
  greece: [39.0742, 21.8243],
  // ── Turkey ──
  istanbul: [41.0082, 28.9784],
  ankara: [39.9334, 32.8597],
  turkey: [38.9637, 35.2433],
  // ── Europe (generic) ──
  europe: [54.526, 15.2551],
  "eu only": [54.526, 15.2551],
  "europe only": [54.526, 15.2551],
  emea: [38.0, 35.0],
  // ── Canada ──
  toronto: [43.6532, -79.3832],
  vancouver: [49.2827, -123.1207],
  montreal: [45.5017, -73.5673],
  calgary: [51.0447, -114.0719],
  ottawa: [45.4215, -75.6972],
  canada: [56.1304, -106.3468],
  // ── Australia ──
  sydney: [-33.8688, 151.2093],
  melbourne: [-37.8136, 144.9631],
  brisbane: [-27.4698, 153.0251],
  perth: [-31.9505, 115.8605],
  adelaide: [-34.9285, 138.6007],
  australia: [-25.2744, 133.7751],
  // ── New Zealand ──
  auckland: [-36.8485, 174.7633],
  "new zealand": [-40.9006, 174.886],
  // ── Japan ──
  tokyo: [35.6762, 139.6503],
  osaka: [34.6937, 135.5023],
  japan: [36.2048, 138.2529],
  // ── South Korea ──
  seoul: [37.5665, 126.978],
  "south korea": [35.9078, 127.7669],
  korea: [35.9078, 127.7669],
  // ── China ──
  beijing: [39.9042, 116.4074],
  shanghai: [31.2304, 121.4737],
  shenzhen: [22.5431, 114.0579],
  guangzhou: [23.1291, 113.2644],
  china: [35.8617, 104.1954],
  // ── Hong Kong / Taiwan ──
  "hong kong": [22.3193, 114.1694],
  taipei: [25.033, 121.5654],
  taiwan: [23.6978, 120.9605],
  // ── South / Southeast Asia ──
  jakarta: [-6.2088, 106.8456],
  indonesia: [-0.7893, 113.9213],
  "kuala lumpur": [3.1412, 101.6865],
  malaysia: [4.2105, 101.9758],
  manila: [14.5995, 120.9842],
  philippines: [12.8797, 121.774],
  bangkok: [13.7563, 100.5018],
  thailand: [15.87, 100.9925],
  "ho chi minh": [10.8231, 106.6297],
  vietnam: [14.0583, 108.2772],
  // ── Middle East ──
  riyadh: [24.7136, 46.6753],
  "saudi arabia": [23.8859, 45.0792],
  "tel aviv": [32.0853, 34.7818],
  israel: [31.0461, 34.8516],
  doha: [25.2854, 51.531],
  qatar: [25.3548, 51.1839],
  // ── Africa ──
  "cape town": [-33.9249, 18.4241],
  johannesburg: [-26.2041, 28.0473],
  "south africa": [-30.5595, 22.9375],
  nairobi: [-1.2921, 36.8219],
  kenya: [-0.0236, 37.9062],
  lagos: [6.5244, 3.3792],
  nigeria: [9.082, 8.6753],
  cairo: [30.0444, 31.2357],
  egypt: [26.8206, 30.8025],
  // ── South America ──
  "sao paulo": [-23.5505, -46.6333],
  "são paulo": [-23.5505, -46.6333],
  "rio de janeiro": [-22.9068, -43.1729],
  brazil: [-14.235, -51.9253],
  "buenos aires": [-34.6037, -58.3816],
  argentina: [-38.4161, -63.6167],
  "mexico city": [19.4326, -99.1332],
  mexico: [23.6345, -102.5528],
  bogota: [4.711, -74.0721],
  colombia: [4.5709, -74.2973],
  santiago: [-33.4489, -70.6693],
  chile: [-35.6751, -71.5430],
  lima: [-12.0464, -77.0428],
  peru: [-9.19, -75.0152],
};

// ─── location string → coords ─────────────────────────────────────────────────

const SKIP_PATTERNS = [
  "worldwide", "anywhere", "global", "international", "fully remote",
  "work from home", "wfh", "telecommute",
];

// Words to strip before city matching
const NOISE = [
  "based", "office", "city", "area", "region", "campus",
  "only", "remote", "hybrid", "on-site", "onsite", "flexible",
];

function extractCity(location: string): string {
  if (!location) return "";
  let c = location.replace(/\(.*?\)/g, "").trim();  // strip parentheticals
  c = c.split(/[\/,;|]/)[0].trim();                 // first segment
  c = c.replace(/\b(US|UK|EU|IN|DE|FR|CA|AU)\b/g, "").trim(); // country codes
  c = c.replace(new RegExp(`\\b(${NOISE.join("|")})\\b`, "gi"), "").trim();
  return c.toLowerCase().replace(/\s+/g, " ").trim();
}

function geocodeLocation(location: string): [number, number] | null {
  if (!location) return null;
  const lower = location.toLowerCase().trim();

  // Skip truly unlocatable strings
  if (SKIP_PATTERNS.some((p) => lower === p || lower.startsWith(p + " ") || lower.endsWith(" " + p))) {
    // Exception: "Remote, US" or "Remote (EU)" — still has a region
    if (!lower.includes(",") && !lower.includes("(") && lower.length < 25) return null;
  }

  // Exact match on full location string
  if (COORDS[lower]) return COORDS[lower];

  // Try each segment split by comma or slash
  const segments = lower.split(/[,\/;|]/).map((s) => s.trim().replace(/[()]/g, "").trim());
  for (const seg of segments) {
    if (seg && COORDS[seg]) return COORDS[seg];
  }

  // Try extracted city
  const city = extractCity(location);
  if (city && city.length >= 2 && COORDS[city]) return COORDS[city];

  // Partial / prefix match
  for (const [key, coords] of Object.entries(COORDS)) {
    if (
      (city.length >= 3 && (city.startsWith(key) || key.startsWith(city))) ||
      city.includes(key) ||
      key.includes(city)
    ) {
      return coords;
    }
  }

  // Fallback: look for any known city name anywhere in the string
  for (const [key, coords] of Object.entries(COORDS)) {
    if (key.length >= 4 && lower.includes(key)) return coords;
  }

  return null;
}

function detectMarket(location: string): string {
  const l = (location || "").toLowerCase();
  const indiaCities = ["bangalore", "bengaluru", "bengluru", "mumbai", "delhi", "hyderabad", "pune", "chennai", "kolkata", "noida", "gurgaon", "gurugram", "ahmedabad", "india", "jaipur", "kochi", "indore", "bhopal", "nagpur", "surat", "chandigarh", "coimbatore", "lucknow"];
  if (indiaCities.some((c) => l.includes(c))) return "India";
  if (["singapore"].some((c) => l.includes(c))) return "Singapore";
  if (["dubai", "abu dhabi", "sharjah", "uae", "emirates"].some((c) => l.includes(c))) return "UAE";
  if (["london", "manchester", "edinburgh", "birmingham", " uk", "united kingdom", "england", "bristol", "leeds", "glasgow"].some((c) => l.includes(c))) return "UK";
  if (["new york", "san francisco", "seattle", "austin", "chicago", "boston", "los angeles", "denver", "miami", "atlanta", "dallas", " us ", "usa", "united states", "america", "portland", "nashville", "washington"].some((c) => l.includes(c))) return "US";
  if (["berlin", "munich", "hamburg", "frankfurt", "germany", "amsterdam", "netherlands", "paris", "france", "madrid", "barcelona", "spain", "warsaw", "poland", "prague", "czechia", "lisbon", "portugal", "stockholm", "sweden", "oslo", "norway", "copenhagen", "denmark", "helsinki", "finland", "vienna", "austria", "zurich", "switzerland", "rome", "milan", "italy", "brussels", "belgium", "dublin", "ireland", "bucharest", "romania", "budapest", "hungary", "europe"].some((c) => l.includes(c))) return "Europe";
  if (["toronto", "vancouver", "montreal", "canada"].some((c) => l.includes(c))) return "Canada";
  if (["sydney", "melbourne", "brisbane", "australia"].some((c) => l.includes(c))) return "APAC";
  if (["tokyo", "osaka", "japan", "seoul", "korea", "singapore", "hong kong", "taiwan", "beijing", "shanghai", "china"].some((c) => l.includes(c))) return "APAC";
  if (["nairobi", "lagos", "cairo", "cape town", "johannesburg", "africa"].some((c) => l.includes(c))) return "Africa";
  if (["sao paulo", "são paulo", "rio", "brazil", "buenos aires", "argentina", "mexico"].some((c) => l.includes(c))) return "LatAm";
  return "Global";
}

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
