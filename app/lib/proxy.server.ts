// Residential proxy config — Bright Data (primary) or IPRoyal (fallback)
//
// Bright Data credentials (from dashboard → Zone → Access parameters):
//   BRIGHTDATA_CUSTOMER_ID  e.g. "hl_abc12345"
//   BRIGHTDATA_ZONE_NAME    e.g. "residential"
//   BRIGHTDATA_ZONE_PASSWORD the zone password (the UUID you have)
//
// Bright Data proxy URL format:
//   http://brd-customer-{CUSTOMER_ID}-zone-{ZONE_NAME}-country-{CC}-city-{CITY}:{PASSWORD}@brd.superproxy.io:22225

export interface ProxyConfig {
  server: string;
  username: string;
  password: string;
}

const BD_CUSTOMER   = process.env.BRIGHTDATA_CUSTOMER_ID ?? "";
const BD_ZONE       = process.env.BRIGHTDATA_ZONE_NAME ?? "residential";
const BD_PASSWORD   = process.env.BRIGHTDATA_ZONE_PASSWORD ?? "";
const BD_HOST       = "brd.superproxy.io";
const BD_PORT       = 22225;

// IPRoyal fallback (if Bright Data not configured)
const IPR_HOST      = "geo.iproyal.com";
const IPR_PORT      = 12321;

export function buildProxy(userId: string, country = "IN", city = "bangalore"): ProxyConfig {
  if (BD_CUSTOMER && BD_PASSWORD) {
    return buildBrightDataProxy(userId, country, city);
  }
  return buildIPRoyalProxy(userId, country, city);
}

export function buildProxyUrl(userId: string, country = "IN", city = "bangalore"): string {
  const cfg = buildProxy(userId, country, city);
  const u = encodeURIComponent(cfg.username);
  const p = encodeURIComponent(cfg.password);
  return `http://${u}:${p}@${cfg.server.replace("http://", "")}`;
}

// ── Bright Data ───────────────────────────────────────────────────────────────
// Sticky session: same userId + country always routes through the same IP.
// Bright Data sticky sessions last 10 minutes by default; use a session ID
// derived from userId so the same account always hits the same residential IP.

function buildBrightDataProxy(userId: string, country: string, city: string): ProxyConfig {
  const sessionId = `studojo_${userId.slice(-8)}`;
  const countryPart = country ? `-country-${country.toLowerCase()}` : "";
  const cityPart = city ? `-city-${city.toLowerCase().replace(/\s+/g, "_")}` : "";

  return {
    server: `http://${BD_HOST}:${BD_PORT}`,
    username: `brd-customer-${BD_CUSTOMER}-zone-${BD_ZONE}${countryPart}${cityPart}-session-${sessionId}`,
    password: BD_PASSWORD,
  };
}

// ── IPRoyal fallback ──────────────────────────────────────────────────────────

function buildIPRoyalProxy(userId: string, country: string, city: string): ProxyConfig {
  const sessionKey = `usr_${userId}`;
  return {
    server: `http://${IPR_HOST}:${IPR_PORT}`,
    username: `studojo_${process.env.IPROYAL_USERNAME ?? "user"}_country-${country}_city-${city}_session-${sessionKey}_lifetime-24h`,
    password: process.env.IPROYAL_PASSWORD ?? "",
  };
}

// Returns true if any proxy is configured
export function proxyConfigured(): boolean {
  return !!(BD_CUSTOMER && BD_PASSWORD) || !!(process.env.IPROYAL_PASSWORD);
}
