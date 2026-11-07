// Photos for a fellow's post when they have no photo of their own. The page asks whether they can post one
// and shows a few picked for the post; if they say yes, it is saved on the post like their own photo and the
// post unlocks. Nobody on the team picks it.
//
// The pictures come from a fixed library (fellow-stock-library.json): public-domain (CC0) photos from the
// WordPress Photo Directory, real photos people took on their phones rather than studio stock, so they can go
// on LinkedIn with no credit. Each one was looked at once (gpt-4o-mini, 7 Nov 2026) and kept only if it's a
// natural photo a student in India could post: desks, notes, chai, campuses, classrooms, offices, events,
// streets, trains. No stranger's face as the subject, no logos, nothing religious or odd, no statues or landmarks. The founder wanted
// pictures that look the part, not stock. For each post, gpt-4o-mini picks the best matches from the library;
// if it can't be reached, the photo idea's own words do.
import LIBRARY from "./fellow-stock-library.json";

const AZURE_ENDPOINT = (process.env.AZURE_OPENAI_ENDPOINT ?? "").replace(/\/+$/, "");
const AZURE_KEY = process.env.AZURE_OPENAI_API_KEY ?? "";
const DEPLOYMENT = process.env.FELLOW_COACH_DEPLOYMENT?.trim() || "gpt-4o-mini";
const HOST = "pd.w.org";
const PICKS = 6;
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

export const STOCK_SYSTEM = `You pick a photo for a LinkedIn post written for a college student in India, from a numbered library of real photos. Choose the ones that best fit what the post is about and the photo its writer suggested, and that the student could believably have taken: their desk, notes, chai, campus, a classroom or office, an event, the city they live in. Prefer everyday scenes over sights: a desk, a notebook, chai, a classroom beats a famous building. Prefer Indian settings. Never pick something unrelated just to fill the list.`;

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
  const picks = spread(all.slice(0, 10), String(post.id)).slice(0, PICKS).map((p) => ({ id: p.id, title: p.desc, src: p.src }));
  // A failed model call isn't remembered for the day: the next look tries it again.
  if (fromModel.length) {
    if (picked.size > 500) picked.clear();
    picked.set(key, { at: Date.now(), picks });
  }
  return picks;
}

/** The picture itself, as a JPEG of at most maxBytes, straight from the WordPress Photo Directory. */
export async function stockJpeg(pick: StockPick, maxBytes: number): Promise<Uint8Array> {
  const p = PHOTOS.find((x) => x.id === pick.id);
  if (!p) throw new Error("not a library picture");
  const u = new URL(p.src);
  if (u.protocol !== "https:" || u.hostname !== HOST) throw new Error("not a library picture");
  const res = await fetch(u, { redirect: "error", signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`stock picture ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.length > maxBytes || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) throw new Error("stock picture unusable");
  return bytes;
}
