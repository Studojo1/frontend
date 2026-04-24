// Residential proxy — Decodo (Smartproxy)
//
// Credentials from dashboard → Proxy setup → Endpoint generator:
//   DECODO_USERNAME   your Smartproxy/Decodo username
//   DECODO_PASSWORD   your password
//
// Sticky session format (same userId = same residential IP every time):
//   username: user-USERNAME-session-SESSIONID-country-CC
//   host: gate.decodo.com
//   port: 10001

export interface ProxyConfig {
  server: string;
  username: string;
  password: string;
}

const DECODO_HOST = "gate.decodo.com";
const DECODO_PORT = 10001;

export function buildProxy(userId: string, country = "IN", _city = "bangalore"): ProxyConfig | undefined {
  const username = process.env.DECODO_USERNAME;
  const password = process.env.DECODO_PASSWORD;
  if (!username || !password) return undefined;

  // Sticky session key derived from userId — same user always hits the same residential IP
  const sessionId = `studojo${userId.slice(-8)}`;
  const cc = country.toLowerCase();

  return {
    server: `http://${DECODO_HOST}:${DECODO_PORT}`,
    username: `user-${username}-session-${sessionId}-country-${cc}`,
    password,
  };
}

export function proxyConfigured(): boolean {
  return !!(process.env.DECODO_USERNAME && process.env.DECODO_PASSWORD);
}
