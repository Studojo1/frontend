// Per-user IPRoyal residential proxy config
// Sticky session keyed on userId — same userId always gets same IP

const IPROYAL_HOST = "geo.iproyal.com";
const IPROYAL_PORT = 12321;

export interface ProxyConfig {
  server: string;
  username: string;
  password: string;
}

export function buildProxy(userId: string, country = "IN", city = "bangalore"): ProxyConfig {
  const password = process.env.IPROYAL_PASSWORD ?? "";
  const sessionKey = `usr_${userId}`;

  return {
    server: `http://${IPROYAL_HOST}:${IPROYAL_PORT}`,
    username: `studojo_${process.env.IPROYAL_USERNAME ?? "user"}_country-${country}_city-${city}_session-${sessionKey}_lifetime-24h`,
    password,
  };
}

export function buildProxyUrl(userId: string, country = "IN", city = "bangalore"): string {
  const cfg = buildProxy(userId, country, city);
  const [username, password] = [encodeURIComponent(cfg.username), encodeURIComponent(cfg.password)];
  return `http://${username}:${password}@${IPROYAL_HOST}:${IPROYAL_PORT}`;
}
