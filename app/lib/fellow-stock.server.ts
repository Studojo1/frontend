// Stock images for a fellow's post when they have no photo of their own. The page asks whether they can post
// a stock image and shows one picked for the post; if they say yes, it is saved on the post like their own
// photo and the post unlocks. Nobody on the team picks it. The pictures come from Openverse's search, kept to
// StockSnap's public-domain (CC0) photos, so they can go on LinkedIn with no credit. Photos of one person are
// left out: a stranger's face would read as the fellow's own.

const SEARCH = "https://api.openverse.org/v1/images/";
const AZURE_ENDPOINT = (process.env.AZURE_OPENAI_ENDPOINT ?? "").replace(/\/+$/, "");
const AZURE_KEY = process.env.AZURE_OPENAI_API_KEY ?? "";
const DEPLOYMENT = process.env.FELLOW_COACH_DEPLOYMENT?.trim() || "gpt-4o-mini";
const HOST = "cdn.stocksnap.io";
const PICKS = 6;
const DAY = 24 * 3600_000;

export interface StockPick {
  id: string;
  title: string;
  src: string;
}

interface Hit {
  id?: unknown;
  title?: unknown;
  url?: unknown;
  width?: unknown;
  height?: unknown;
  license?: unknown;
  tags?: { name?: unknown }[];
}

// Words that say nothing about what's in the picture.
const FILLER = new Set(
  ("a an the of at on in with or and to for from by as about into over near during while after before " +
    "one some any that this these those it its is are was be been being up out like e g eg example such " +
    "photo photos picture pictures pic pics image images shot snap selfie candid recent recently own " +
    "you your yours yourself her hers herself his him himself their them themselves they she he we our " +
    "fits fitting showing shows taken post posts something someone moment day time new old good great").split(" "),
);
// One person on their own: never offered, whatever the post is about.
const PORTRAIT = /\b(girl|girls|woman|women|man|men|boy|boys|guy|lady|ladies|portrait|model|face|selfie|beauty|fashion|person|dad|father|mom|mother|baby|child|kid|kids|family)\b/i;

/**
 * The search words for a post when the model can't help: what its photo idea says should be in the picture,
 * minus filler and names (a capitalised word inside the sentence is a college, city or company, which stock
 * photos won't have), then safe everyday scenes.
 */
export function stockQueries(photoIdea: string | null, kind: string, suggested: string[] = []): string[] {
  const words: string[] = [];
  (photoIdea || "").split(/(?<=[.!?])\s+/).forEach((sentence) => {
    sentence.split(/[^A-Za-z]+/).filter(Boolean).forEach((w, i) => {
      const lower = w.toLowerCase();
      if (i > 0 && /^[A-Z]/.test(w)) return;
      if (lower.length < 3 || FILLER.has(lower) || words.includes(lower)) return;
      words.push(lower);
    });
  });
  const own = [words.slice(0, 3), words.slice(0, 2)].map((w) => w.join(" ")).filter(Boolean);
  const safe = kind === "studojo" ? ["laptop work", "notebook laptop", "office desk"] : ["student desk", "notebook coffee", "books study"];
  return [...new Set([...suggested, ...own, ...safe].map((q) => q.toLowerCase().replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim()).filter(Boolean))];
}

export type StockAsk = (system: string, user: string) => Promise<string>;

export const STOCK_SYSTEM = `You pick stock photos for LinkedIn posts written for college students in India. Given a post's title and the photo its writer suggested, give three short stock-photo search phrases, best first, each two or three plain words for things a camera can see (for example "laptop notebook desk", "college library", "team whiteboard"). The photo must show a scene, objects or hands, never one person's face or a portrait, because it goes out under the student's own name. Skip names of colleges, cities and companies.`;

const STOCK_SHAPE = {
  name: "stock_queries",
  strict: true,
  schema: { type: "object", properties: { queries: { type: "array", items: { type: "string" } } }, required: ["queries"], additionalProperties: false },
};

const askAzure: StockAsk = async (system, user) => {
  if (!AZURE_ENDPOINT || !AZURE_KEY) throw new Error("azure not configured");
  const res = await fetch(`${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=2025-04-01-preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": AZURE_KEY },
    body: JSON.stringify({
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      max_completion_tokens: 200,
      response_format: { type: "json_schema", json_schema: STOCK_SHAPE },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`model ${res.status}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
};

/** The model's search phrases for a post, or none if it can't be reached: the words in the photo idea still work. */
export async function suggestedQueries(post: { photoIdea: string | null; title: string }, ask: StockAsk = askAzure): Promise<string[]> {
  try {
    const raw = await ask(STOCK_SYSTEM, `Post title: ${post.title.slice(0, 200)}\nSuggested photo: ${(post.photoIdea || "a photo that fits the post").slice(0, 300)}`);
    const q = (JSON.parse(raw) as { queries?: unknown }).queries;
    return Array.isArray(q) ? q.filter((x): x is string => typeof x === "string" && x.length <= 40 && !PORTRAIT.test(x)).slice(0, 3) : [];
  } catch {
    return [];
  }
}

/** The usable pictures from one search: StockSnap, public domain, wider than tall, no one on their own. */
export function picksFrom(results: Hit[]): StockPick[] {
  const out: StockPick[] = [];
  for (const r of results) {
    const src = typeof r.url === "string" ? r.url : "";
    let u: URL;
    try { u = new URL(src); } catch { continue; }
    if (u.protocol !== "https:" || u.hostname !== HOST || !/\.jpe?g$/i.test(u.pathname)) continue;
    if (!["cc0", "pdm"].includes(String(r.license))) continue;
    if (Number(r.width) < Number(r.height)) continue;
    const title = typeof r.title === "string" ? r.title.slice(0, 80) : "";
    const tags = (r.tags || []).map((t) => (typeof t?.name === "string" ? t.name : "")).join(" ");
    if (PORTRAIT.test(`${title} ${tags}`)) continue;
    if (typeof r.id !== "string" || !/^[\w-]{8,64}$/.test(r.id)) continue;
    out.push({ id: r.id, title, src });
  }
  return out;
}

const searched = new Map<string, { at: number; picks: StockPick[] }>();

async function search(q: string): Promise<StockPick[]> {
  const hit = searched.get(q);
  if (hit && Date.now() - hit.at < DAY) return hit.picks;
  const url = `${SEARCH}?${new URLSearchParams({ q, license: "cc0,pdm", source: "stocksnap", page_size: "20" })}`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`openverse ${res.status}`);
  const data = (await res.json()) as { results?: Hit[] };
  const picks = picksFrom(Array.isArray(data.results) ? data.results : []);
  if (searched.size > 500) searched.clear();
  searched.set(q, { at: Date.now(), picks });
  return picks;
}

const asked = new Map<string, { at: number; queries: string[] }>();

/** Up to six pictures for a post, best match first; the same post gets the same pictures all day. */
export async function stockFor(post: { photoIdea: string | null; title: string; kind: string }, ask?: StockAsk): Promise<StockPick[]> {
  const key = `${post.title}\n${post.photoIdea ?? ""}`;
  let hit = asked.get(key);
  if (!hit || Date.now() - hit.at > DAY) {
    hit = { at: Date.now(), queries: await suggestedQueries(post, ask) };
    if (asked.size > 500) asked.clear();
    asked.set(key, hit);
  }
  // One search that fails (a refused phrase, a slow answer) moves on to the next; only all of them failing is an error.
  const out: StockPick[] = [];
  let failed: unknown = null;
  for (const q of stockQueries(post.photoIdea, post.kind, hit.queries)) {
    try {
      for (const p of await search(q)) if (!out.some((o) => o.id === p.id)) out.push(p);
    } catch (e) {
      failed = e;
      console.error("[fellow-stock] search failed:", JSON.stringify(q), e instanceof Error ? e.message : "unknown");
    }
    if (out.length >= 3) break;
  }
  if (!out.length && failed) throw failed;
  return out.slice(0, PICKS);
}

/** The picture itself, as a JPEG of at most maxBytes, straight from StockSnap. */
export async function stockJpeg(pick: StockPick, maxBytes: number): Promise<Uint8Array> {
  const u = new URL(pick.src);
  if (u.protocol !== "https:" || u.hostname !== HOST) throw new Error("not a stock picture");
  const res = await fetch(u, { redirect: "error", signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`stock picture ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.length > maxBytes || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) throw new Error("stock picture unusable");
  return bytes;
}
