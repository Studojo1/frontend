/**
 * Resume PDF preview proxy (GET /api/v2/resumes/preview-proxy?url=...).
 *
 * It streams a PDF from our blob storage with Content-Disposition: inline so
 * it renders in an iframe. It used to fetch ANY url for ANY caller, which made
 * it an open, unauthenticated proxy into the cluster: it reached the cloud
 * metadata endpoint and returned the response body (audit AS-N03).
 *
 * Now: a signed-in session is required, the target must be https on our own
 * blob-storage host, and the host must not resolve to a private, loopback or
 * link-local address. Redirects are not followed, so an allowed host cannot
 * bounce the request somewhere else.
 */
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

type Resolver = (host: string) => Promise<string[]>;

export type PreviewProxyDeps = {
  /** Resolves to a truthy value when the request carries a valid session. */
  getSession: (request: Request) => Promise<unknown>;
  /** Hostnames the proxy may fetch from. */
  allowedHosts?: string[];
  resolve?: Resolver;
  fetchImpl?: typeof fetch;
};

const defaultResolve: Resolver = async (host) =>
  (await lookup(host, { all: true, verbatim: true })).map((a) => a.address);

/** Our blob-storage host(s): the only place resume PDFs live. */
export function blobHosts(): string[] {
  const account = process.env.AZURE_STORAGE_ACCOUNT_NAME?.trim();
  return account ? [`${account.toLowerCase()}.blob.core.windows.net`] : [];
}

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((n, o) => (n << 8) + Number(o), 0) >>> 0;
}

const V4_BLOCKED: [string, number][] = [
  ["0.0.0.0", 8], // "this" network
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local, incl. the cloud metadata endpoint
  ["172.16.0.0", 12], // private
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.0.2.0", 24], // documentation
  ["192.168.0.0", 16], // private
  ["198.18.0.0", 15], // benchmarking
  ["198.51.100.0", 24], // documentation
  ["203.0.113.0", 24], // documentation
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved, incl. broadcast
];

function v4Blocked(ip: string): boolean {
  const n = ipv4ToInt(ip);
  return V4_BLOCKED.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (n & mask) === (ipv4ToInt(base) & mask);
  });
}

/** Expand an IPv6 address to 8 16-bit groups. */
function v6Groups(ip: string): number[] | null {
  let s = ip.toLowerCase().split("%")[0];
  // Trailing dotted IPv4 (::ffff:1.2.3.4) becomes two groups.
  const v4 = s.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (v4) {
    const n = ipv4ToInt(v4[1]);
    s = s.slice(0, -v4[1].length) + `${(n >>> 16).toString(16)}:${(n & 0xffff).toString(16)}`;
  }
  const [head, tail] = s.split("::");
  const h = head ? head.split(":") : [];
  const t = tail !== undefined ? (tail ? tail.split(":") : []) : [];
  const fill = s.includes("::") ? 8 - h.length - t.length : 0;
  const groups = [...h, ...Array(fill).fill("0"), ...t].map((g) => parseInt(g || "0", 16));
  return groups.length === 8 && groups.every((g) => g >= 0 && g <= 0xffff) ? groups : null;
}

/** True for any address a server-side fetch must never reach. Pure, for tests. */
export function isPrivateAddress(ip: string): boolean {
  const kind = isIP(ip.split("%")[0]);
  if (kind === 4) return v4Blocked(ip);
  if (kind !== 6) return true; // not an IP at all: refuse
  const g = v6Groups(ip);
  if (!g) return true;
  const embeddedV4 = () => `${g[6] >> 8}.${g[6] & 0xff}.${g[7] >> 8}.${g[7] & 0xff}`;
  if (g.every((x) => x === 0)) return true; // ::
  if (g.slice(0, 7).every((x) => x === 0) && g[7] === 1) return true; // ::1
  if (g.slice(0, 5).every((x) => x === 0) && (g[5] === 0xffff || g[5] === 0)) return v4Blocked(embeddedV4()); // v4-mapped / compatible
  if (g[0] === 0x64 && g[1] === 0xff9b) return v4Blocked(embeddedV4()); // NAT64
  if ((g[0] & 0xfe00) === 0xfc00) return true; // unique local fc00::/7
  if ((g[0] & 0xffc0) === 0xfe80) return true; // link-local fe80::/10
  if ((g[0] & 0xff00) === 0xff00) return true; // multicast
  return false;
}

export type TargetCheck = { ok: true; url: URL } | { ok: false; reason: string };

/** Is `raw` a URL the proxy may fetch? Parses, allowlists the host, and checks
 * every address the host resolves to. */
export async function checkPreviewTarget(
  raw: string,
  allowedHosts: string[],
  resolve: Resolver = defaultResolve,
): Promise<TargetCheck> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "invalid url" };
  }
  if (url.protocol !== "https:") return { ok: false, reason: "https only" };
  if (url.username || url.password) return { ok: false, reason: "credentials in url" };
  if (url.port && url.port !== "443") return { ok: false, reason: "port not allowed" };
  const host = url.hostname.toLowerCase();
  if (!allowedHosts.map((h) => h.toLowerCase()).includes(host)) {
    return { ok: false, reason: "host not allowed" };
  }
  let addrs: string[];
  try {
    addrs = await resolve(host);
  } catch {
    return { ok: false, reason: "host does not resolve" };
  }
  if (addrs.length === 0 || addrs.some(isPrivateAddress)) {
    return { ok: false, reason: "private address" };
  }
  return { ok: true, url };
}

export async function handlePreviewProxy(request: Request, deps: PreviewProxyDeps): Promise<Response> {
  const session = await deps.getSession(request).catch(() => null);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const raw = new URL(request.url).searchParams.get("url");
  if (!raw) return Response.json({ error: "Missing url parameter" }, { status: 400 });

  const check = await checkPreviewTarget(raw, deps.allowedHosts ?? blobHosts(), deps.resolve);
  if (!check.ok) return Response.json({ error: "URL not allowed" }, { status: 400 });

  try {
    const upstream = await (deps.fetchImpl ?? fetch)(check.url.toString(), { redirect: "manual" });
    // Never echo an upstream status or body: that is what leaked internal
    // services' answers back to the caller.
    if (upstream.status !== 200) return Response.json({ error: "Failed to fetch PDF" }, { status: 502 });
    const pdf = await upstream.arrayBuffer();
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="resume-preview.pdf"',
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json({ error: "Failed to fetch PDF" }, { status: 502 });
  }
}
