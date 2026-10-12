/**
 * The /pb "About you" form: its field names and the one parser both sides use.
 *
 * Pure and client-safe (it imports nothing but the shared model). The page
 * runs the same checks in the browser that the action runs on the server, so
 * a student sees a missing headline before a round trip, and the completeness
 * meter scores exactly what will be saved. The store cleans every field again
 * on write (cleanProfileInput in store.server.ts). This is the first line of
 * defence, not the only one, and its rules mirror the store's so a saved
 * profile comes back looking the way the student typed it.
 */
import {
  PB_EMOJI,
  PB_LANGS,
  PB_LIMITS,
  PB_MARKETS,
  PB_RELATIONS,
  PB_TONE_SCALES,
  PB_TOPICS,
} from "./model";
import type { PbProfile, PbProfileInput, PbStory, PbTone } from "./model";

/** Every form field name. The page renders these and the parser reads them, so the two cannot drift. */
export const PB_FIELDS = {
  intent: "intent",
  name: "name",
  headline: "headline",
  stage: "stage",
  market: "market",
  relation: "relation",
  goals: "goals",
  /** One checkbox per picked topic from PB_TOPICS, repeated. */
  topics: "topics",
  /** Free text, comma separated, for topics that are not in PB_TOPICS. */
  customTopics: "customTopics",
  /** Stories arrive as repeated story_id + story_text pairs, in page order. */
  storyId: "story_id",
  storyText: "story_text",
  writingSample: "writingSample",
  emoji: "emoji",
  lang: "lang",
  avoid: "avoid",
  linkedinUrl: "linkedinUrl",
  extra: "extra",
} as const;

/** The intent the About you form submits. */
export const PB_SAVE_INTENT = "save-profile";

export type PbToneKey = keyof typeof PB_TONE_SCALES;
export const PB_TONE_KEYS: readonly PbToneKey[] = ["formality", "rhythm", "energy"];

/** Form field name for one tone slider: tone_formality, tone_rhythm, tone_energy. */
export function toneField(key: PbToneKey): string {
  return `tone_${key}`;
}

/** Same defaults as the pb_profiles columns, so an untouched control saves what the store would assume. */
export const PB_DEFAULT_TONE: PbTone = { formality: 2, rhythm: 2, energy: 3 };
const DEFAULT_MARKET = "India";
const DEFAULT_RELATION = "none";
const DEFAULT_EMOJI = "few";
const DEFAULT_LANG = "english";

/** Story ids the store keeps as they are. It replaces anything else, so other ids would not survive a save. */
export const PB_STORY_ID = /^[a-z0-9-]{4,40}$/i;

/** Longest custom topics field: every topic at full length plus a separator. */
export const PB_CUSTOM_TOPICS_MAX = PB_LIMITS.topics * (PB_LIMITS.customTopic + 2);

export const PB_ERRORS = {
  name: "Add your name.",
  headline: "Add your LinkedIn headline.",
  linkedinUrl: "That does not look like a LinkedIn profile link. It should look like linkedin.com/in/your-name.",
  postedUrl: "That does not look like a LinkedIn link. Paste the link to your post, or leave it empty.",
} as const;

const RELATION_VALUES: readonly string[] = PB_RELATIONS.map((r) => r.value);
const EMOJI_VALUES: readonly string[] = PB_EMOJI.map((e) => e.value);
const LANG_VALUES: readonly string[] = PB_LANGS.map((l) => l.value);
const MARKET_VALUES: readonly string[] = PB_MARKETS;
const TOPIC_BY_LOWER = new Map<string, string>(PB_TOPICS.map((t) => [t.toLowerCase(), t]));

/* ------------------------------------------------------------- text cleanup */

/** Cut at a UTF-16 boundary without leaving half an emoji behind. */
function cut(s: string, max: number): string {
  if (s.length <= max) return s;
  let out = s.slice(0, max);
  const last = out.charCodeAt(out.length - 1);
  if (last >= 0xd800 && last <= 0xdbff) out = out.slice(0, -1);
  return out;
}

/** Bound the work on a hostile multi-megabyte field before any per-character pass. */
function bounded(s: string, max: number): string {
  const room = max * 4 + 64;
  return s.length > room ? s.slice(0, room) : s;
}

/**
 * Drop control characters other than tab and newline (Postgres refuses a NUL
 * in TEXT), and the bidirectional override characters, which can make a name
 * render backwards in staff lists. Emoji joiners are left alone.
 */
function dropControl(s: string): string {
  let out = "";
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    if (c !== 9 && c !== 10 && (c < 32 || c === 127)) continue;
    if ((c >= 0x202a && c <= 0x202e) || (c >= 0x2066 && c <= 0x2069) || c === 0xfeff) continue;
    out += ch;
  }
  return out;
}

/** A single-line field: whitespace collapsed, trimmed, clamped. */
export function oneLine(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return cut(dropControl(bounded(v, max).replace(/\s+/g, " ")).trim(), max).trim();
}

/** A multi-line field: line breaks kept, trailing spaces and long runs of blank lines tidied, clamped. */
export function multiLine(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  const text = dropControl(bounded(v, max).replace(/\r\n?/g, "\n"))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
  return cut(text, max).trim();
}

/** One of the allowed values (case-insensitive, canonical casing out), else the fallback. */
function pick(v: unknown, allowed: readonly string[], fallback: string): string {
  if (typeof v !== "string") return fallback;
  const want = v.trim().toLowerCase();
  return allowed.find((a) => a.toLowerCase() === want) ?? fallback;
}

/** A tone slider value: a whole number from 1 to 5. */
function toneValue(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(5, Math.max(1, Math.round(n)));
}

/* ------------------------------------------------------------------ topics */

/** Topics from the custom field: split on commas, semicolons or new lines, a leading # dropped. */
export function splitCustomTopics(v: unknown): string[] {
  if (typeof v !== "string") return [];
  return bounded(v, PB_CUSTOM_TOPICS_MAX)
    .split(/[,;\n]/)
    .map((t) => oneLine(oneLine(t, 200).replace(/^#+\s*/, ""), PB_LIMITS.customTopic))
    .filter(Boolean);
}

/** Known topics in their canonical casing, custom ones clamped, no duplicates, at most `cap`. */
export function cleanTopics(list: readonly unknown[], cap: number = PB_LIMITS.topics): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of list.slice(0, 200)) {
    const t = oneLine(raw, PB_LIMITS.customTopic);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(TOPIC_BY_LOWER.get(key) ?? t);
    if (out.length >= cap) break;
  }
  return out;
}

/** How many distinct topics the chips and the custom field add up to, before the cap. */
export function topicCount(picked: readonly string[], customText: string): number {
  return cleanTopics([...picked, ...splitCustomTopics(customText)], Number.POSITIVE_INFINITY).length;
}

/** A saved topic list split back into chips (PB_TOPICS) and the custom text field. */
export function splitTopicsForForm(topics: readonly string[]): { known: string[]; custom: string } {
  const known: string[] = [];
  const custom: string[] = [];
  for (const t of topics) {
    const canonical = TOPIC_BY_LOWER.get(t.trim().toLowerCase());
    if (canonical) {
      if (!known.includes(canonical)) known.push(canonical);
    } else if (t.trim()) {
      custom.push(t.trim());
    }
  }
  return { known, custom: custom.join(", ") };
}

/** A stable id fragment for a topic chip: "Resumes and ATS" becomes "resumes-and-ats". */
export function topicSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ----------------------------------------------------------------- stories */

/**
 * Non-empty stories, clamped, at most PB_LIMITS.stories, each with a unique id
 * the store will keep. A missing, malformed or repeated id gets a fresh one.
 */
export function cleanStories(list: readonly unknown[]): PbStory[] {
  const kept: { id: string; text: string }[] = [];
  for (const raw of list.slice(0, 100)) {
    if (kept.length >= PB_LIMITS.stories) break;
    const item = (typeof raw === "string" ? { text: raw } : raw) as { id?: unknown; text?: unknown } | null;
    const text = multiLine(item?.text, PB_LIMITS.story);
    if (!text) continue;
    const id = typeof item?.id === "string" ? item.id.trim() : "";
    kept.push({ id, text });
  }
  const used = new Set<string>();
  for (const k of kept) {
    if (PB_STORY_ID.test(k.id) && !used.has(k.id)) used.add(k.id);
    else k.id = "";
  }
  for (const k of kept) {
    if (!k.id) {
      k.id = freshStoryId(used, String(used.size + 1));
      used.add(k.id);
    }
  }
  return kept;
}

/**
 * A story id that is not in `taken` and that the store keeps: "story-" plus a
 * seed, made unique with a counter when needed. The page seeds new stories
 * with the time, and empty slots with their position, so server and browser
 * render the same ids.
 */
export function freshStoryId(taken: Iterable<string>, seed: string): string {
  const used = new Set(taken);
  const base = cut(`story-${seed.toLowerCase().replace(/[^a-z0-9-]/g, "")}`, 34).replace(/-+$/, "");
  let id = base.length >= 4 ? base : `${base}-new`;
  for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
  return id;
}

/* -------------------------------------------------------------------- links */

/**
 * An http(s) URL, normalised. Empty input is fine (url null, ok true); input
 * that is not a usable link is not (ok false). Accepts a bare host and path
 * ("linkedin.com/in/someone") by assuming https, because that is how people
 * paste links. Same rules as the store's cleanHttpUrl: no other schemes, no
 * credentials, a dot in the host, and never cut short.
 */
export function normalizeHttpUrl(v: unknown, max: number): { url: string | null; ok: boolean } {
  const s = oneLine(v, max * 2 + 16);
  if (!s) return { url: null, ok: true };
  const bad = { url: null, ok: false };
  if (s.length > max || /\s/.test(s)) return bad;
  let candidate = s;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) {
    if (!/^(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#]|$)/i.test(s)) return bad;
    candidate = `https://${s}`;
  }
  let u: URL;
  try {
    u = new URL(candidate);
  } catch {
    return bad;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return bad;
  if (u.username || u.password) return bad;
  if (!u.hostname.includes(".")) return bad;
  const out = u.toString();
  return out.length <= max ? { url: out, ok: true } : bad;
}

/**
 * The student's LinkedIn profile link: https, on linkedin.com, with tracking
 * query strings dropped. When it is not one, the typed text is kept (so the
 * field does not empty itself) and an error is returned.
 */
export function normalizeLinkedinUrl(v: unknown): { url: string; error: string | null } {
  const typed = oneLine(v, PB_LIMITS.linkedinUrl);
  const r = normalizeHttpUrl(v, PB_LIMITS.linkedinUrl);
  if (!r.ok) return { url: typed, error: PB_ERRORS.linkedinUrl };
  if (!r.url) return { url: "", error: null };
  const u = new URL(r.url);
  const host = u.hostname.toLowerCase();
  const onLinkedin = host === "linkedin.com" || host.endsWith(".linkedin.com");
  // The bare home page is not anyone's profile.
  if (!onLinkedin || u.pathname.replace(/\/+$/, "") === "") {
    return { url: typed, error: PB_ERRORS.linkedinUrl };
  }
  u.protocol = "https:";
  u.search = "";
  u.hash = "";
  return { url: u.toString(), error: null };
}

/** The optional link a student gives when they say they posted. */
export function normalizePostedUrl(v: unknown): { url: string | null; error: string | null } {
  const r = normalizeHttpUrl(v, PB_LIMITS.postedUrl);
  if (!r.ok) return { url: null, error: PB_ERRORS.postedUrl };
  if (!r.url) return { url: null, error: null };
  // Staff see this as a link to open, so it may only point at LinkedIn.
  const host = new URL(r.url).hostname.toLowerCase();
  const onLinkedin = host === "linkedin.com" || host.endsWith(".linkedin.com") || host === "lnkd.in";
  return onLinkedin ? { url: r.url, error: null } : { url: null, error: PB_ERRORS.postedUrl };
}

/* ------------------------------------------------------------------ profile */

/**
 * Any object shaped roughly like a profile, cleaned into a PbProfileInput,
 * plus the errors that would stop it saving. Used for the form, for a draft
 * read back from the browser, and to compare two profiles field by field.
 *
 * Required: name and headline. Everything else is optional; stories and a
 * writing sample matter most, and the completeness meter says so instead.
 */
export function normalizeProfileInput(raw: unknown): {
  input: PbProfileInput;
  errors: Record<string, string>;
} {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const tone = (r.tone && typeof r.tone === "object" ? r.tone : {}) as Record<string, unknown>;
  const linkedin = normalizeLinkedinUrl(r.linkedinUrl);
  const input: PbProfileInput = {
    name: oneLine(r.name, PB_LIMITS.name),
    headline: oneLine(r.headline, PB_LIMITS.headline),
    stage: oneLine(r.stage, PB_LIMITS.stage),
    market: pick(r.market, MARKET_VALUES, DEFAULT_MARKET),
    relation: pick(r.relation, RELATION_VALUES, DEFAULT_RELATION),
    goals: multiLine(r.goals, PB_LIMITS.goals),
    topics: cleanTopics(Array.isArray(r.topics) ? r.topics : []),
    stories: cleanStories(Array.isArray(r.stories) ? r.stories : []),
    writingSample: multiLine(r.writingSample, PB_LIMITS.writingSample),
    tone: {
      formality: toneValue(tone.formality, PB_DEFAULT_TONE.formality),
      rhythm: toneValue(tone.rhythm, PB_DEFAULT_TONE.rhythm),
      energy: toneValue(tone.energy, PB_DEFAULT_TONE.energy),
    },
    emoji: pick(r.emoji, EMOJI_VALUES, DEFAULT_EMOJI),
    lang: pick(r.lang, LANG_VALUES, DEFAULT_LANG),
    avoid: oneLine(r.avoid, PB_LIMITS.avoid),
    linkedinUrl: linkedin.url,
    extra: multiLine(r.extra, PB_LIMITS.extra),
  };
  const errors: Record<string, string> = {};
  if (!input.name) errors.name = PB_ERRORS.name;
  if (!input.headline) errors.headline = PB_ERRORS.headline;
  if (linkedin.error) errors.linkedinUrl = linkedin.error;
  return { input, errors };
}

/**
 * The About you form as submitted. Field names are PB_FIELDS. Every value is
 * read defensively: a missing field becomes its default, a File where text was
 * expected is ignored, and story ids and texts are paired by position.
 */
export function parseProfileForm(form: FormData): {
  input: PbProfileInput;
  errors: Record<string, string>;
} {
  const text = (name: string): string => {
    const v = form.get(name);
    return typeof v === "string" ? v : "";
  };
  const ids = form.getAll(PB_FIELDS.storyId).slice(0, 100);
  const texts = form.getAll(PB_FIELDS.storyText).slice(0, 100);
  const stories = texts.map((t, i) => {
    const id = ids[i];
    return { id: typeof id === "string" ? id : "", text: typeof t === "string" ? t : "" };
  });
  const picked = form
    .getAll(PB_FIELDS.topics)
    .slice(0, 100)
    .filter((t): t is string => typeof t === "string");
  return normalizeProfileInput({
    name: text(PB_FIELDS.name),
    headline: text(PB_FIELDS.headline),
    stage: text(PB_FIELDS.stage),
    market: text(PB_FIELDS.market),
    relation: text(PB_FIELDS.relation),
    goals: text(PB_FIELDS.goals),
    topics: [...picked, ...splitCustomTopics(text(PB_FIELDS.customTopics))],
    stories,
    writingSample: text(PB_FIELDS.writingSample),
    tone: {
      formality: text(toneField("formality")),
      rhythm: text(toneField("rhythm")),
      energy: text(toneField("energy")),
    },
    emoji: text(PB_FIELDS.emoji),
    lang: text(PB_FIELDS.lang),
    avoid: text(PB_FIELDS.avoid),
    linkedinUrl: text(PB_FIELDS.linkedinUrl),
    extra: text(PB_FIELDS.extra),
  });
}

/**
 * The form for a student with no profile yet. Defaults match the store's
 * column defaults, except relation, which starts unpicked so the student has
 * to look at it: it decides how posts talk about Studojo. Left unpicked, it
 * saves as "none".
 */
export function emptyProfileInput(seed?: { name?: string | null }): PbProfileInput {
  return {
    name: oneLine(seed?.name ?? "", PB_LIMITS.name),
    headline: "",
    stage: "",
    market: DEFAULT_MARKET,
    relation: "",
    goals: "",
    topics: [],
    stories: [],
    writingSample: "",
    tone: { ...PB_DEFAULT_TONE },
    emoji: DEFAULT_EMOJI,
    lang: DEFAULT_LANG,
    avoid: "",
    linkedinUrl: "",
    extra: "",
  };
}

/** A stored profile as form input: the account fields and timestamps dropped. */
export function profileToInput(p: PbProfile): PbProfileInput {
  return {
    name: p.name,
    headline: p.headline,
    stage: p.stage,
    market: p.market,
    relation: p.relation,
    goals: p.goals,
    topics: [...p.topics],
    stories: p.stories.map((s) => ({ id: s.id, text: s.text })),
    writingSample: p.writingSample,
    tone: { ...p.tone },
    emoji: p.emoji,
    lang: p.lang,
    avoid: p.avoid,
    linkedinUrl: p.linkedinUrl,
    extra: p.extra,
  };
}
