import type { Route } from "./+types/api.company-logo";

// Company logos for the outreach lead cards, fetched by our server rather than
// the student's browser.
//
// The cards used to load logos straight from third parties, one request per
// card, from the student's own browser and IP. That handed Google the full
// list of companies each student was about to pay to contact. Going through
// here, the third party only ever sees our server asking for a domain, and the
// cache below means most domains are asked for once.
//
// The first source used to be logo.clearbit.com, which no longer resolves in
// DNS, so every card fired a request that could never succeed. It is gone.

const DOMAIN_RE = /^(?=.{3,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const MAX_ENTRIES = 2000;
const TTL_MS = 24 * 60 * 60 * 1000;

type Entry = { body: ArrayBuffer | null; type: string; expires: number };
const cache = new Map<string, Entry>();

function remember(domain: string, entry: Entry) {
  if (cache.size >= MAX_ENTRIES) {
    // Map keeps insertion order, so the first key is the oldest.
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(domain, entry);
}

function respond(entry: Entry) {
  if (!entry.body) {
    // A 404 lets the card's onError fall back to its letter tile.
    return new Response(null, { status: 404, headers: { "Cache-Control": "public, max-age=86400" } });
  }
  return new Response(entry.body, {
    status: 200,
    headers: {
      "Content-Type": entry.type,
      "Cache-Control": "public, max-age=604800, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const domain = (new URL(request.url).searchParams.get("domain") || "").trim().toLowerCase();
  if (!DOMAIN_RE.test(domain)) {
    return new Response(null, { status: 400 });
  }

  const hit = cache.get(domain);
  if (hit && hit.expires > Date.now()) return respond(hit);

  let entry: Entry = { body: null, type: "", expires: Date.now() + TTL_MS };
  try {
    const res = await fetch(`https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(domain)}`, {
      signal: AbortSignal.timeout(5000),
    });
    const type = res.headers.get("content-type") || "";
    // Google answers an unknown domain with a 404 and a generic globe; treat
    // that as "no logo" so the card shows the company's initial instead.
    if (res.ok && type.startsWith("image/")) {
      entry = { body: await res.arrayBuffer(), type, expires: Date.now() + TTL_MS };
    }
  } catch {
    // Network trouble: no logo this time, and do not cache the failure long.
    entry.expires = Date.now() + 5 * 60 * 1000;
  }
  remember(domain, entry);
  return respond(entry);
}
