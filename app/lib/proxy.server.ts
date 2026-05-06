// Residential proxy — Evomi Core Residential
//
// Free trial: plain credentials only (no country/session suffix).
// Paid plan: sticky session format is USERNAME_country-CC_session-SESSIONID
// Upgrade at dashboard → Residential Core → Proxy Generator, then re-enable suffix below.

export interface ProxyConfig {
  server: string;
  username: string;
  password: string;
}

const EVOMI_HOST = "core-residential.evomi.com";
const EVOMI_PORT = 1000;

export function buildProxy(userId: string, _country = "IN", _city = "bangalore"): ProxyConfig | undefined {
  const username = process.env.EVOMI_USERNAME;
  const password = process.env.EVOMI_PASSWORD;
  if (!username || !password) return undefined;

  // TODO: on paid plan, replace with sticky format:
  // `${username}_country-${country.toUpperCase()}_session-s${userId.slice(-8)}`
  return {
    server: `http://${EVOMI_HOST}:${EVOMI_PORT}`,
    username,
    password,
  };
}

export function proxyConfigured(): boolean {
  return !!(process.env.EVOMI_USERNAME && process.env.EVOMI_PASSWORD);
}
