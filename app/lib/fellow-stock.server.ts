// Photos for a fellow's post when they have no photo of their own. The page asks whether they can post one
// and shows a few picked for the post; if they say yes, it is saved on the post like their own photo and the
// post unlocks. Nobody on the team picks it.
//
// The pictures come from a fixed library (fellow-stock-library.json): public-domain (CC0) photos from the
// WordPress Photo Directory, real photos people took on their phones rather than studio stock, so they can go
// on LinkedIn with no credit. Each one was looked at once (gpt-4o-mini, 7 Nov 2026) and kept only if it's a
// natural photo a student in India could post: desks, notes, chai, campuses, classrooms, offices, events,
// streets, trains. No stranger's face as the subject, no logos, nothing religious or odd, no statues or landmarks. The founder wanted
// pictures that look the part, not stock.
//
// The fellow decides (the founder, 7 Nov 2026): they search for what the photo should show, across the library
// and the whole WordPress Photo Directory (live, through Openverse), and pick one. Until they search, the page
// shows a varied set we picked for the post (gpt-4o-mini, from the library; the photo idea's words if it can't
// be reached), and they can take one of those or search for their own.
import LIBRARY from "./fellow-stock-library.json";

const AZURE_ENDPOINT = (process.env.AZURE_OPENAI_ENDPOINT ?? "").replace(/\/+$/, "");
const AZURE_KEY = process.env.AZURE_OPENAI_API_KEY ?? "";
const DEPLOYMENT = process.env.FELLOW_COACH_DEPLOYMENT?.trim() || "gpt-4o-mini";
const HOST = "pd.w.org";
const SEARCH = "https://api.openverse.org/v1/images/";
const PICKS = 6;
const RESULTS = 12;
const DAY = 24 * 3600_000;

export interface LibraryPhoto {
  id: string;
  src: string;
  w: number;
  h: number;
  desc: string;
  tags: string[];
  indian: boolean;
}
export interface StockPick {
  id: string;
  title: string;
  src: string;
  /** A small copy for the grid (Openverse's thumbnail of the same photo). */
  thumb: string;
}

const PHOTOS = LIBRARY as LibraryPhoto[];

// Words that say nothing about what's in the picture.
const FILLER = new Set(
  ("a an the of at on in with or and to for from by as about into over near during while after before " +
    "one some any that this these those it its is are was be been being up out like e g eg example such " +
    "photo photos picture pictures pic pics image images shot snap selfie candid recent recently own " +
    "you your yours yourself her hers herself his him himself their them themselves they she he we our " +
    "fits fitting showing shows taken post posts something someone moment day time new old good great").split(" "),
);

/**
 * What the photo idea says should be in the picture, minus filler and names (a capitalised word inside the
 * sentence is a college, city or company), then everyday scenes that suit the kind of post.
 */
export function stockWords(photoIdea: string | null, kind: string): string[] {
  const words: string[] = [];
  (photoIdea || "").split(/(?<=[.!?])\s+/).forEach((sentence) => {
    sentence.split(/[^A-Za-z]+/).filter(Boolean).forEach((w, i) => {
      const lower = w.toLowerCase();
      if (i > 0 && /^[A-Z]/.test(w)) return;
      if (lower.length < 3 || FILLER.has(lower) || words.includes(lower)) return;
      words.push(lower);
    });
  });
  const safe = kind === "studojo" ? ["laptop", "desk", "notebook", "office"] : ["desk", "notebook", "chai", "campus"];
  return [...new Set([...words, ...safe])];
}

/** The library ranked by how many of the words its description and tags share (earlier words count more), Indian settings first on a tie. */
export function rankByWords(words: string[], photos: LibraryPhoto[] = PHOTOS): LibraryPhoto[] {
  const score = (p: LibraryPhoto) => {
    const hay = new Set(`${p.desc} ${p.tags.join(" ")}`.toLowerCase().split(/[^a-z]+/));
    return words.reduce((s, w, i) => s + (hay.has(w) || hay.has(w.replace(/s$/, "")) ? 10 - Math.min(i, 8) : 0), 0) + (p.indian ? 0.5 : 0);
  };
  return photos.map((p) => [score(p), p] as const).filter(([s]) => s >= 1).sort((a, b) => b[0] - a[0] || a[1].id.localeCompare(b[1].id)).map(([, p]) => p);
}

export type StockAsk = (system: string, user: string) => Promise<string>;

export const STOCK_SYSTEM = `You pick a photo for a LinkedIn post written for a college student in India, from a numbered library of real photos. Choose the ones that best fit what the post is about and the photo its writer suggested, and that the student could believably have taken: their desk, notes, chai, campus, a classroom or office, an event, the city they live in. Give a varied set, different kinds of scene rather than six of the same, so the student has a real choice. Prefer everyday scenes over sights: a desk, a notebook, chai, a classroom beats a famous building. Prefer Indian settings. Never pick something unrelated just to fill the list.`;

const PICK_SHAPE = {
  name: "stock_picks",
  strict: true,
  schema: { type: "object", properties: { picks: { type: "array", items: { type: "integer" } } }, required: ["picks"], additionalProperties: false },
};

const askAzure: StockAsk = async (system, user) => {
  if (!AZURE_ENDPOINT || !AZURE_KEY) throw new Error("azure not configured");
  const res = await fetch(`${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=2025-04-01-preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": AZURE_KEY },
    body: JSON.stringify({
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      max_completion_tokens: 200,
      response_format: { type: "json_schema", json_schema: PICK_SHAPE },
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`model ${res.status}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
};

/** The model's picks from the library for a post, best first, or none if it can't be reached. */
export async function modelPicks(post: { photoIdea: string | null; title: string }, ask: StockAsk = askAzure, photos: LibraryPhoto[] = PHOTOS): Promise<LibraryPhoto[]> {
  const list = photos.map((p, i) => `${i + 1}. ${p.desc}${p.indian ? " (India)" : ""}`).join("\n");
  try {
    const raw = await ask(STOCK_SYSTEM, `Post title: ${post.title.slice(0, 200)}\nSuggested photo: ${(post.photoIdea || "a photo that fits the post").slice(0, 300)}\n\nGive up to 10 numbers, best first.\n\nLibrary:\n${list}`);
    const nums = (JSON.parse(raw) as { picks?: unknown }).picks;
    if (!Array.isArray(nums)) return [];
    const out: LibraryPhoto[] = [];
    for (const n of nums) {
      const p = Number.isInteger(n) ? photos[(n as number) - 1] : undefined;
      if (p && !out.includes(p)) out.push(p);
    }
    return out.slice(0, 10);
  } catch {
    return [];
  }
}

/** Rotates a list by a number derived from the post, so fellows with similar posts don't all get the same first picture. */
export function spread<T>(list: T[], seed: string): T[] {
  if (list.length < 2) return list;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const k = h % Math.min(list.length, 4);
  return [...list.slice(k), ...list.slice(0, k)];
}

const picked = new Map<string, { at: number; picks: StockPick[] }>();

/** Up to six pictures for a post, best match first; the same post gets the same pictures all day. */
export async function stockFor(post: { id: number | string; photoIdea: string | null; title: string; kind: string }, ask?: StockAsk): Promise<StockPick[]> {
  const key = `${post.id}\n${post.title}\n${post.photoIdea ?? ""}`;
  const hit = picked.get(key);
  if (hit && Date.now() - hit.at < DAY) return hit.picks;
  const fromModel = await modelPicks(post, ask);
  const fromWords = rankByWords(stockWords(post.photoIdea, post.kind));
  const all = [...fromModel, ...fromWords.filter((p) => !fromModel.includes(p))];
  const picks = spread(all.slice(0, 10), String(post.id)).slice(0, PICKS).map(toPick);
  // A failed model call isn't remembered for the day: the next look tries it again.
  if (fromModel.length) {
    if (picked.size > 500) picked.clear();
    picked.set(key, { at: Date.now(), picks });
  }
  return picks;
}

const thumbOf = (id: string) => `${SEARCH}${id}/thumb/`;
const toPick = (p: { id: string; desc: string; src: string }): StockPick => ({ id: p.id, title: p.desc, src: p.src, thumb: thumbOf(p.id) });
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

interface Hit { id?: unknown; title?: unknown; url?: unknown; license?: unknown; source?: unknown }
/** A WordPress Photo Directory photo from Openverse, if it's one the page can offer: public domain, a JPEG on pd.w.org. */
export function hitToPick(r: Hit): StockPick | null {
  const id = typeof r.id === "string" && ID.test(r.id) ? r.id : null;
  const src = typeof r.url === "string" ? r.url : "";
  if (!id || r.source !== "wordpress" || !["cc0", "pdm"].includes(String(r.license))) return null;
  try {
    const u = new URL(src);
    if (u.protocol !== "https:" || u.hostname !== HOST || !/\.jpe?g$/i.test(u.pathname)) return null;
  } catch { return null; }
  return { id, title: typeof r.title === "string" ? r.title.slice(0, 80) : "", src, thumb: thumbOf(id) };
}

/** What the fellow typed, as search words: letters only, at most 60 characters. */
export const searchQuery = (raw: unknown) => String(raw ?? "").toLowerCase().replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);

const searched = new Map<string, { at: number; picks: StockPick[] }>();

/**
 * The fellow's own search: matching photos from the library first, then the WordPress Photo Directory's own
 * search (Openverse). If Openverse is down or out of searches for the day, the library's matches still come back.
 */
export async function stockSearch(raw: unknown, live: (q: string) => Promise<Hit[]> = openverse): Promise<StockPick[]> {
  const q = searchQuery(raw);
  if (!q) return [];
  const hit = searched.get(q);
  if (hit && Date.now() - hit.at < DAY) return hit.picks;
  const words = q.split(" ").filter((w) => w.length > 2 && !FILLER.has(w));
  const fromLib = rankByWords(words).filter((p) => words.some((w) => `${p.desc} ${p.tags.join(" ")}`.toLowerCase().includes(w))).slice(0, 6).map(toPick);
  let fromLive: StockPick[] = [];
  let ok = true;
  try {
    fromLive = (await live(q)).map(hitToPick).filter((p): p is StockPick => !!p);
  } catch (e) {
    ok = false;
    console.error("[fellow-stock] search failed:", e instanceof Error ? e.message : "unknown");
  }
  const picks = [...fromLib, ...fromLive.filter((p) => !fromLib.some((l) => l.id === p.id))].slice(0, RESULTS);
  if (ok) {
    if (searched.size > 500) searched.clear();
    searched.set(q, { at: Date.now(), picks });
  }
  return picks;
}

async function openverse(q: string): Promise<Hit[]> {
  const res = await fetch(`${SEARCH}?${new URLSearchParams({ q, license: "cc0,pdm", source: "wordpress", page_size: "20", mature: "false" })}`, {
    headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`openverse ${res.status}`);
  const data = (await res.json()) as { results?: Hit[] };
  return Array.isArray(data.results) ? data.results : [];
}

/** The photo the fellow chose, looked up again on our side: from the library, or from Openverse by its id. Never trusts the page's copy. */
export async function stockById(raw: unknown, lookup: (id: string) => Promise<Hit | null> = openverseOne): Promise<StockPick | null> {
  const id = typeof raw === "string" && ID.test(raw) ? raw : null;
  if (!id) return null;
  const lib = PHOTOS.find((p) => p.id === id);
  if (lib) return toPick(lib);
  const r = await lookup(id);
  return r ? hitToPick(r) : null;
}

async function openverseOne(id: string): Promise<Hit | null> {
  const res = await fetch(`${SEARCH}${id}/`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`openverse ${res.status}`);
  return (await res.json()) as Hit;
}

/** The picture itself, as a JPEG of at most maxBytes, straight from the WordPress Photo Directory. */
export async function stockJpeg(pick: StockPick, maxBytes: number): Promise<Uint8Array> {
  const u = new URL(pick.src);
  if (u.protocol !== "https:" || u.hostname !== HOST) throw new Error("not a photo directory picture");
  const res = await fetch(u, { redirect: "error", signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`stock picture ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) throw new Error("stock picture unusable");
  if (bytes.length > maxBytes) throw new StockTooBig();
  return bytes;
}

/** The chosen photo is bigger than a post's photo can be. */
export class StockTooBig extends Error {}
