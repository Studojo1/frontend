// Residential proxy — Evomi Core Residential
//
// Credentials from dashboard → Residential Core → Proxy Generator:
//   EVOMI_USERNAME   jeremyzac1
//   EVOMI_PASSWORD   your password
//
// Sticky session format:
//   username: USERNAME_country-CC_session-SESSIONID
//   host: core-residential.evomi.com
//   port: 1000 (HTTP)

export interface ProxyConfig {
  server: string;
  username: string;
  password: string;
}

const EVOMI_HOST = "core-residential.evomi.com";
const EVOMI_PORT = 1000;

export function buildProxy(userId: string, country = "IN", _city = "bangalore"): ProxyConfig | undefined {
  const username = process.env.EVOMI_USERNAME;
  const password = process.env.EVOMI_PASSWORD;
  if (!username || !password) return undefined;

  // Sticky session key — same userId always gets the same residential IP
  const sessionId = `s${userId.slice(-8)}`;
  const cc = country.toUpperCase();

  return {
    server: `http://${EVOMI_HOST}:${EVOMI_PORT}`,
    username: `${username}_country-${cc}_session-${sessionId}`,
    password,
  };
}

export function proxyConfigured(): boolean {
  return !!(process.env.EVOMI_USERNAME && process.env.EVOMI_PASSWORD);
}
