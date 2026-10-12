import { stripDashes } from "~/lib/strip-dashes";

/**
 * Deterministic clean-up and checks for the posts written for /pb.
 *
 * Pure on purpose: no server imports, no network, no database. Every rule here
 * is pinned by polish.test.mjs and behaves the same in the pipeline, in a test
 * and anywhere else it is called.
 *
 * The model is told every one of these rules and still breaks some of them now
 * and then. Enforcing them in code is cheaper and more reliable than asking
 * again, and the checks that cannot be fixed by code (a hook that runs long,
 * a number the student never gave) are reported so the pipeline can send the
 * post back for one targeted fix.
 *
 * Special characters are built from code points rather than typed: this file
 * must never contain an em or en dash (app/lib/no-dashes.test.mjs), and the
 * curly quotes and invisible spaces are easier to review as numbers anyway.
 */

const cp = (...codes: number[]) => String.fromCodePoint(...codes);
const cls = (codes: number[]) => `[${cp(...codes)}]`;
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

const EM = cp(0x2014);
const EN = cp(0x2013);
const ANY_DASH = new RegExp(cls([0x2013, 0x2014]));

/** Figure dash: a range character, so it becomes an en dash and then a hyphen. */
const TO_EN = new RegExp(cls([0x2012]), "g");
/** Horizontal bar, two and three em dashes, small em dash. */
const TO_EM = new RegExp(cls([0x2015, 0x2e3a, 0x2e3b, 0xfe58]), "g");
/** Hyphen, non-breaking hyphen, minus sign, small and fullwidth hyphen-minus. */
const TO_HYPHEN = new RegExp(cls([0x2010, 0x2011, 0x2212, 0xfe63, 0xff0d]), "g");
const SINGLE_QUOTES = new RegExp(cls([0x2018, 0x2019, 0x201a, 0x201b, 0x2032]), "g");
const DOUBLE_QUOTES = new RegExp(cls([0x201c, 0x201d, 0x201e, 0x201f, 0x2033, 0x00ab, 0x00bb]), "g");
const ELLIPSIS = new RegExp(cp(0x2026), "g");
const ODD_SPACES = new RegExp(cls([0x00a0, ...range(0x2000, 0x200a), 0x202f, 0x205f, 0x3000]), "g");
/** Zero-width space, word joiner, BOM, soft hyphen. The zero-width joiner is
 *  left alone: emoji sequences are built from it. */
const INVISIBLE = new RegExp(cls([0x200b, 0x2060, 0xfeff, 0x00ad]), "g");

/** One emoji, including skin tones, variation selectors, joined sequences and flags. */
const EMOJI_SOURCE =
  `(?:\\p{Regional_Indicator}{2}|\\p{Extended_Pictographic}\\p{Emoji_Modifier}?${cp(0xfe0f)}?` +
  `(?:${cp(0x200d)}\\p{Extended_Pictographic}\\p{Emoji_Modifier}?${cp(0xfe0f)}?)*)`;
const EMOJI = new RegExp(EMOJI_SOURCE, "gu");

/** Characters people and models use as list bullets. */
const BULLET_CHARS = cls([
  0x2022, 0x2023, 0x2043, 0x25aa, 0x25ab, 0x25cf, 0x25cb, 0x25a0, 0x25a1, 0x25e6, 0x25b6, 0x25ba,
  0x2192, 0x21d2, 0x27a1, 0x27a2, 0x27a4, 0x2713, 0x2714, 0x2705, 0x2611, 0x1f449, 0x1f539, 0x1f538,
]);
const BULLET_LINE = new RegExp(
  `^[ \\t]*(?:[-*+>]|->|=>|${BULLET_CHARS}${cp(0xfe0f)}?)[ \\t]+(?=\\S)`,
  "gmu"
);
const NUMBERED_LINE = /^[ \t]*\d{1,2}[.)][ \t]+\S/gm;

const URL = /\b(?:https?:\/\/|www\.)[^\s<>"]+[^\s<>".,;:!?)'\]]/gi;
const TLDS =
  "com|in|io|ai|co|org|net|pro|me|app|dev|uk|sg|ae|gg|ly|so|xyz|edu|gov|info|biz|us|ca|au|link|page|site|" +
  "ee|gle|be|to|gy|fi|ma|tech|design|bio|tv|fm|cc|id|online|store|studio";
const DOMAIN_WITH_PATH = new RegExp(
  `\\b[a-z0-9][a-z0-9-]*(?:\\.[a-z0-9-]+)*\\.(?:${TLDS})\\/[^\\s<>"]*[^\\s<>".,;:!?)'\\]]`,
  "gi"
);
const BARE_DOMAIN = new RegExp(`\\b[a-z0-9][a-z0-9-]*(?:\\.[a-z0-9-]+)*\\.(?:${TLDS})\\b(?![-.\\w])`, "gi");
/** A hashtag has at least one letter (#100DaysOfCode counts; #1, C# and "issue #42" do not). */
const HASHTAG = /(^|[^\p{L}\p{N}_&#])#([\p{N}_]*\p{L}[\p{L}\p{N}_]*)/gu;
const HASHTAG_LINE = /^[ \t]*(?:#[\p{N}_]*\p{L}[\p{L}\p{N}_]*[ \t,]*)+$/gmu;
const HAS_HASHTAG = /(^|[^\p{L}\p{N}_&#])#[\p{N}_]*\p{L}/u;
/** Longest text polish and lint look at. LinkedIn's own limit is 3,000; this only bounds a broken reply. */
const MAX_INPUT = 12_000;

/* ----------------------------------------------------------------- checks */

/**
 * The review checklist, in order. The model reviewer answers one item per id,
 * the deterministic lint below reports against the same ids, and the label is
 * what staff read on /pbadmin.
 */
export const REVIEW_CHECKS = [
  { id: "hook", label: "Hook stops the scroll" },
  { id: "voice", label: "Sounds like them" },
  { id: "specific", label: "Only they could post it" },
  { id: "facts", label: "No invented facts" },
  { id: "tells", label: "No AI tells or cliches" },
  { id: "format", label: "No hashtags, lists or links" },
  { id: "people", label: "No private person named" },
  { id: "studojo", label: "No Studojo numbers or unearned claims" },
  { id: "structure", label: "Short lines and spacing" },
  { id: "close", label: "One close" },
  { id: "mention", label: "Studojo mention and disclosure" },
  { id: "length", label: "Length and first lines" },
] as const;

export type ReviewCheckId = (typeof REVIEW_CHECKS)[number]["id"];

export const REVIEW_CHECK_IDS: readonly ReviewCheckId[] = REVIEW_CHECKS.map((c) => c.id);

/**
 * Words and phrases that read as machine-written or as LinkedIn filler. From
 * the house playbook's "Do Not Sound Like AI" and "Phrases to never use" lists
 * and the brand rules. Only entries that are almost never a student's own
 * natural word are here, because a hit triggers a rewrite.
 */
export const BANNED_PHRASES = [
  "delve", "delves", "delved", "delving",
  "crucial", "crucially",
  "pivotal",
  "tapestry",
  "testament",
  "vibrant",
  "robust",
  "showcase", "showcases", "showcased", "showcasing",
  "meticulous", "meticulously",
  "intricate", "intricacies",
  "interplay",
  "bolster", "bolstered", "bolstering",
  "fostering",
  "garner", "garnered", "garnering",
  "underscore", "underscores", "underscored", "underscoring",
  "enhance", "enhances", "enhanced", "enhancing",
  "valuable",
  "leverage", "leveraged", "leveraging",
  "synergy", "synergies",
  "holistic",
  "empower", "empowers", "empowered", "empowering", "empowerment",
  "ecosystem",
  "navigate", "navigates", "navigated", "navigating",
  "landscape",
  "game-changer", "game changer",
  "level up",
  "unlock your potential",
  "excited to share", "excited to announce",
  "thrilled to share", "thrilled to announce",
  "humbled",
  "hope this helps",
  "let me know your thoughts",
  "let that sink in",
  "drop a like",
  "follow for more",
  "comment below",
  "fast-paced world",
  "ever-evolving",
  "plays a role in",
  "serves as a",
  "stands as a",
  "align with", "aligns with",
  "the math isn't mathing",
  "just sayin",
  "in conclusion",
  "it's important to note",
] as const;

/** Max emoji in a post for each /pb emoji setting. */
const EMOJI_LIMIT: Record<string, number> = { none: 0, few: 2, some: 6 };

export const HOOK_MAX_WORDS = 12;
export const LINKEDIN_MAX_CHARS = 3000;

/** Word range per format. Stories carry a scene and may run longer. */
export function wordRange(format: string): { min: number; max: number; target: string } {
  if (format === "take" || format === "howto") {
    return { min: 60, max: 170, target: "80 to 150 words" };
  }
  return {
    min: 60,
    max: 250,
    target: "80 to 150 words, up to 250 only when the post carries a real scene from their stories",
  };
}

/* ------------------------------------------------------------- utilities */

/** First non-empty line of a post. On LinkedIn that is the hook. */
export function hookOf(body: string): string {
  return body.split("\n").map((l) => l.trim()).find(Boolean)?.slice(0, 300) ?? "";
}

/** Words with at least one letter or digit in them. Emoji and punctuation do not count. */
export function wordCount(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

export function countEmoji(text: string): number {
  return (text.match(EMOJI) ?? []).length;
}

export function countStudojo(text: string): number {
  return (text.match(/studojo/gi) ?? []).length;
}

/**
 * Time details: when something happened and how long it took. Models add
 * them to make a scene vivid ("last month", "in a week", "that night"), and
 * each one is a fact about a real student's life. They may only appear when
 * the student's own words (or the brief) carry the same phrase.
 */
const TIME_PHRASES =
  /\b(?:last|this|that|next|one|every)\s+(?:night|morning|evening|afternoon|week|weekend|month|summer|winter|semester|term|year|day)\b|\bin\s+(?:a|one|two|three|four|five|six|\d+)\s+(?:hours?|days?|weeks?|months?)\b|\b(?:yesterday|overnight|tonight)\b|\bfirst\s+(?:morning|night|evening|weekend)\b/gi;

export function inventedTimeline(text: string, source: string): string[] {
  const src = source.toLowerCase().replace(/\s+/g, " ");
  const out: string[] = [];
  for (const m of text.match(TIME_PHRASES) ?? []) {
    const phrase = m.toLowerCase().replace(/\s+/g, " ");
    if (!src.includes(phrase) && !out.includes(phrase)) out.push(phrase);
  }
  return out;
}

const COMMENT_LINES = ["Here's the link I mentioned:", "The link, if you want it:", "Link from the post:"];

/**
 * The first comment under a post that ends with an ask: one plain line and
 * the tracked link. Written by code, not a model, because it is public and
 * short, and the model kept describing the link as something it is not ("the
 * email template I used"). Varied per post so a cohort's comments differ,
 * lowercase for students whose own writing is.
 */
export function firstCommentFor(seed: string, link: string, lowercase: boolean): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const line = COMMENT_LINES[h % COMMENT_LINES.length];
  return `${lowercase ? line.charAt(0).toLowerCase() + line.slice(1) : line}\n${link}`;
}

/** Studojo by name or by one of its products ("the Internship Dojo"). */
const STUDOJO_REF = /studojo|\b(?:internship|careers|assignment|revision)\s+dojo\b/i;

export function mentionsStudojo(text: string): boolean {
  return STUDOJO_REF.test(text);
}

const QUANTITY_WORDS = /\b(?:hundreds?|thousands?|lakhs?|crores?|millions?|billions?|percent|dozens?)\b/gi;

/**
 * Sentences that put a figure on Studojo itself ("Studojo has helped 10,000
 * students", "95% of users"). A number the student gave about their own life
 * is fine; one that only exists in a brief, or any percentage, is not.
 */
export function studojoFigures(text: string, studentSource: string): string[] {
  const out: string[] = [];
  for (const s of sentencesOf(text)) {
    if (!STUDOJO_REF.test(s)) continue;
    const foreign = ungroundedNumbers(s, studentSource);
    const words = (s.match(QUANTITY_WORDS) ?? []).filter((w) => !new RegExp(`\\b${w}\\b`, "i").test(studentSource));
    if (foreign.length || /%/.test(s) || words.length) out.push(s);
  }
  return out;
}

export function hasDash(text: string): boolean {
  return ANY_DASH.test(text);
}

/** Sentences, split on terminal punctuation and on line breaks. */
export function sentencesOf(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => /[\p{L}\p{N}]/u.test(s));
}

function escapeRegex(s: string): string {
  // Only the syntax characters: in a /u regex any other escape is an error.
  return s.replace(/[\\^$.*+?()[\]{}|/]/g, "\\$&");
}

function phraseRegex(phrase: string, forms = false): RegExp {
  const words = phrase.trim().split(/\s+/).map(escapeRegex);
  let core = words.join("\\s+");
  if (forms && words.length === 1) {
    const w = words[0];
    const alts = new Set([w, `${w}s`, `${w}es`, `${w}ed`, `${w}d`, `${w}ing`, `${w}er`, `${w}ers`]);
    if (w.endsWith("e")) alts.add(`${w.slice(0, -1)}ing`);
    if (w.endsWith("y")) alts.add(`${w.slice(0, -1)}ies`);
    core = `(?:${[...alts].join("|")})`;
  }
  return new RegExp(`(?<![\\p{L}\\p{N}])${core}(?![\\p{L}\\p{N}])`, "iu");
}

/** Which of these phrases appear in the text, whole words only, case-insensitive. */
export function findPhrases(text: string, phrases: readonly string[], opts: { forms?: boolean } = {}): string[] {
  const found: string[] = [];
  for (const p of phrases) {
    if (!p.trim()) continue;
    if (phraseRegex(p, opts.forms).test(text) && !found.includes(p)) found.push(p);
  }
  return found;
}

/**
 * A student's "words I never use" field as a list. Free text, so it is split
 * on commas, semicolons, slashes and line breaks; anything that reads like a
 * sentence rather than a word or short phrase is left to the model.
 */
export function parseAvoidList(avoid: string | null | undefined): string[] {
  const out: string[] = [];
  for (const raw of String(avoid ?? "").split(/[,;/|\n]+/)) {
    const item = raw.replace(/^[\s"'.]+|[\s"'.!?]+$/g, "").replace(/\s+/g, " ").toLowerCase();
    if (item.length < 2 || item.length > 40 || item.split(" ").length > 4) continue;
    if (!out.includes(item)) out.push(item);
  }
  return out;
}

const NUMBER_WORDS: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7",
  eight: "8", nine: "9", ten: "10", eleven: "11", twelve: "12", thirteen: "13",
  fourteen: "14", fifteen: "15", sixteen: "16", seventeen: "17", eighteen: "18",
  nineteen: "19", twenty: "20", thirty: "30", forty: "40", fifty: "50", sixty: "60",
  seventy: "70", eighty: "80", ninety: "90", hundred: "100", thousand: "1000",
  first: "1", second: "2", third: "3", fourth: "4", fifth: "5", sixth: "6",
  seventh: "7", eighth: "8", ninth: "9", tenth: "10", once: "1", twice: "2",
  dozen: "12", single: "1",
};

function normaliseNumber(raw: string): string {
  let n = raw;
  // Thousands separators, Western (2,100) and Indian (64,00,000).
  if (/^\d{1,3}(?:,\d{2,3})+$/.test(n)) n = n.replace(/,/g, "");
  if (n.includes(".")) n = n.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  return n.replace(/^0+(?=\d)/, "");
}

/**
 * Every number written in digits. A number glued to a letter on its left
 * (B2B, D2C) is part of a word, not a figure, and is skipped; a suffix on the
 * right (2nd, 7am, 300+) is still a number.
 */
export function numbersIn(text: string): string[] {
  const out: string[] = [];
  // Not glued to a letter or digit on the left (B2B, v2.5), and not the tail
  // of another number (the 5 in 2.5); a dot after letters is fine (Rs.8000).
  for (const m of text.matchAll(/(?<![\p{L}\d])(?<!\d[.,])\d+(?:[.,]\d+)*/gu)) out.push(normaliseNumber(m[0]));
  return out;
}

/**
 * Numbers in a post that never appear in the student's own words or the brief.
 * The commonest invented fact is a number, and this is the one kind of
 * invention code can catch without a model. 0 and 1 are always allowed: "one
 * thing" is not a statistic.
 */
export function ungroundedNumbers(text: string, source: string): string[] {
  const allowed = new Set(["0", "1", ...numbersIn(source)]);
  for (const w of source.toLowerCase().match(/\p{L}+/gu) ?? []) {
    const n = NUMBER_WORDS[w];
    if (n) allowed.add(n);
  }
  const out: string[] = [];
  for (const n of numbersIn(text)) if (!allowed.has(n) && !out.includes(n)) out.push(n);
  return out;
}

const STOPWORDS = new Set(
  "a an the and or but so of to in on at for with from by is are was were be been it its this that these those i me my we our you your he she they them their his her as if then than not no do did does have has had just very".split(
    " "
  )
);

function contentWords(text: string): Set<string> {
  return new Set(
    (text.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [])
      .map((w) => w.replace(/'s$/, ""))
      .filter((w) => w.length > 1 && !STOPWORDS.has(w))
  );
}

/** Word-overlap similarity of two lines, 0 to 1 (Jaccard on content words). */
export function similarity(a: string, b: string): number {
  const A = contentWords(a);
  const B = contentWords(b);
  if (A.size === 0 || B.size === 0) return 0;
  let shared = 0;
  for (const w of A) if (B.has(w)) shared++;
  return shared / (A.size + B.size - shared);
}

/* ---------------------------------------------------------- voice stats */

export type VoiceStats = {
  words: number;
  sentences: number;
  avgSentenceWords: number;
  /** Sentences whose first letter is lowercase, out of `sentences`. */
  lowercaseStarts: number;
  /** Writes "i" for "I" at least once. */
  lowercaseI: boolean;
  exclamations: number;
  questions: number;
  emoji: number;
  ellipses: number;
  parentheses: number;
  /** Casual markers found verbatim in the sample, such as "lol" or "bhai". */
  markers: string[];
};

const MARKERS = [
  "lol", "lmao", "haha", "tbh", "ngl", "btw", "imo", "fr", "bhai", "yaar", "matlab", "accha",
  "ok so", "okay so", "anyway", "gonna", "wanna", "kinda", "sorta", "like,", "honestly",
  "spoiler", "low-key", "lowkey", "basically", "literally",
];

/**
 * Measurable facts about how someone writes, from their own sample. The model
 * describes a voice well and measures it badly; these numbers keep its
 * description honest (sentence length, lowercase starts, the slang they use).
 * Null when the sample is too short to say anything.
 */
export function voiceStats(sample: string | null | undefined): VoiceStats | null {
  const text = normaliseChars(String(sample ?? ""));
  const words = wordCount(text);
  if (words < 25) return null;
  const sentences = sentencesOf(text);
  const starts = sentences.map((s) => s.match(/\p{L}/u)?.[0] ?? "");
  return {
    words,
    sentences: sentences.length,
    avgSentenceWords: Math.round(words / Math.max(1, sentences.length)),
    lowercaseStarts: starts.filter((c) => c && c === c.toLowerCase() && c !== c.toUpperCase()).length,
    lowercaseI: /(^|[\s(])i(?=[\s',.!?)])/m.test(text),
    exclamations: (text.match(/!/g) ?? []).length,
    questions: (text.match(/\?/g) ?? []).length,
    emoji: countEmoji(text),
    ellipses: (text.match(/\.{3}/g) ?? []).length,
    parentheses: (text.match(/\(/g) ?? []).length,
    markers: findPhrases(text, MARKERS),
  };
}

/* ---------------------------------------------------------------- polish */

const ENTITIES: Record<string, string> = {
  amp: "&", quot: '"', apos: "'", nbsp: " ", lt: "<", gt: ">", hellip: "...",
  lsquo: "'", rsquo: "'", ldquo: '"', rdquo: '"', mdash: EM, ndash: EN,
};

function decodeEntities(text: string): string {
  return text
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/&#(\d{2,7});/g, (m, d: string) => safeCodePoint(Number(d)) ?? m)
    .replace(/&#x([0-9a-f]{2,6});/gi, (m, h: string) => safeCodePoint(parseInt(h, 16)) ?? m);
}

function safeCodePoint(n: number): string | null {
  return Number.isInteger(n) && n > 31 && n <= 0x10ffff ? String.fromCodePoint(n) : null;
}

/**
 * Typography the house rules ban or that reads as generated: every dash
 * variant (to a comma, or a hyphen in a range), curly quotes, the ellipsis
 * character, odd spaces and invisible characters. Line breaks survive.
 */
export function normaliseChars(text: string): string {
  const t = decodeEntities(String(text ?? ""))
    .replace(/\r\n?/g, "\n")
    .replace(INVISIBLE, "")
    .replace(ODD_SPACES, " ")
    .replace(/\t/g, " ")
    .replace(TO_EN, EN)
    .replace(TO_EM, EM)
    .replace(TO_HYPHEN, "-")
    .replace(SINGLE_QUOTES, "'")
    .replace(DOUBLE_QUOTES, '"')
    .replace(ELLIPSIS, "...")
    // A spaced double hyphen is a typed em dash.
    .replace(/[ ]+--[ ]+/g, ` ${EM} `);
  return stripDashes(t);
}

/** Code fences, a "Here's the post:" preamble and quotes around the whole post. */
export function unwrapPost(text: string): string {
  let t = text.trim();
  t = t.replace(/^```[a-z]*[ \t]*\n?/i, "").replace(/\n?```[ \t]*$/, "").trim();
  t = t.replace(
    /^(?:here(?:'s| is) (?:the|your|a|my) (?:final |revised |updated |rewritten |corrected )?(?:linkedin )?(?:post|draft|version|comment)[^\n]*|(?:final |revised )?(?:linkedin )?(?:post|draft|body|comment))[ \t]*:[ \t]*\n+/i,
    ""
  );
  if (/^"""[\s\S]*"""$/.test(t)) t = t.slice(3, -3).trim();
  else if (t.length > 2 && t.startsWith('"') && t.endsWith('"') && !t.slice(1, -1).includes('"')) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

/** LinkedIn shows asterisks and hashes literally, so markdown is noise. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*\n]+?)\*\*/g, "$1")
    .replace(/__([^_\n]+?)__/g, "$1")
    .replace(/(^|[\s(])\*([^\s*][^*\n]*?)\*(?=[\s).,!?:;]|$)/gm, "$1$2")
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, "");
}

export type LinkRemoval = { text: string; removed: string[]; brokenLines: string[] };

/**
 * Links come out of the body: on LinkedIn they cut reach, and the house rule
 * puts them in the first comment. A line left with words around the gap is
 * reported so the pipeline can ask for that sentence to be repaired.
 */
export function removeLinks(text: string): LinkRemoval {
  const removed: string[] = [];
  const brokenLines: string[] = [];
  const lines = text.split("\n").map((line) => {
    let hit = false;
    const next = line
      .replace(URL, (m) => {
        removed.push(m);
        hit = true;
        return "";
      })
      .replace(DOMAIN_WITH_PATH, (m) => {
        removed.push(m);
        hit = true;
        return "";
      });
    if (!hit) return line;
    const tidy = next
      .replace(/\(\s*\)/g, "")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/[ \t]+([,.;:!?])/g, "$1")
      .trim();
    // Nothing left but an arrow, a colon or punctuation: drop the line.
    if (!/[\p{L}\p{N}]/u.test(tidy)) return "";
    brokenLines.push(tidy);
    return tidy;
  });
  return { text: lines.join("\n"), removed, brokenLines };
}

/** Lines of hashtags go; an inline #word keeps the word. "#1" and "C#" are not hashtags. */
export function removeHashtags(text: string): { text: string; removed: number } {
  let removed = 0;
  const out = text
    .replace(HASHTAG_LINE, (m) => {
      removed += (m.match(/#/g) ?? []).length;
      return "";
    })
    .replace(HASHTAG, (_m, pre: string, word: string) => {
      removed++;
      return `${pre}${word}`;
    });
  return { text: out, removed };
}

/** Bullet and arrow markers at the start of a line. Numbered lists are left for the lint. */
export function removeBullets(text: string): { text: string; removed: number } {
  let removed = 0;
  const out = text.replace(BULLET_LINE, () => {
    removed++;
    return "";
  });
  return { text: out, removed };
}

export function removeEmoji(text: string): string {
  return text.replace(EMOJI, "").replace(new RegExp(cp(0xfe0f), "g"), "");
}

/** Trailing spaces off every line, single spaces inside, at most one blank line in a row. */
export function tidyWhitespace(text: string): string {
  return text
    .split("\n")
    .map((l) => l.replace(/[ ]{2,}/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type PolishResult = {
  body: string;
  hook: string;
  /** What polish changed, in plain words, for logs and tests. */
  changes: string[];
  /** Lines that lost a link mid-sentence and may need a human-sounding repair. */
  brokenLines: string[];
};

/**
 * The deterministic last pass on every draft. Idempotent: polishing a
 * polished post changes nothing.
 */
export function polishPost(raw: string, opts: { emoji?: string | null } = {}): PolishResult {
  const changes: string[] = [];
  const start = String(raw ?? "").slice(0, MAX_INPUT);
  let t = unwrapPost(start.replace(/\r\n?/g, "\n"));
  if (t !== start.replace(/\r\n?/g, "\n").trim()) changes.push("unwrapped");

  const normalised = normaliseChars(t);
  if (normalised !== t) changes.push("typography");
  t = normalised;

  const md = stripMarkdown(t);
  if (md !== t) changes.push("markdown");
  t = md;

  const links = removeLinks(t);
  if (links.removed.length) changes.push(`links: ${links.removed.length}`);
  t = links.text;

  const tags = removeHashtags(t);
  if (tags.removed) changes.push(`hashtags: ${tags.removed}`);
  t = tags.text;

  const bullets = removeBullets(t);
  if (bullets.removed) changes.push(`bullets: ${bullets.removed}`);
  t = bullets.text;

  if (opts.emoji === "none") {
    const plain = removeEmoji(t);
    if (plain !== t) changes.push("emoji");
    t = plain;
  }

  t = tidyWhitespace(t);
  return { body: t, hook: hookOf(t), changes, brokenLines: links.brokenLines };
}

/* ------------------------------------------------------------------ lint */

export type LintIssue = { code: string; check: ReviewCheckId; message: string };

export type LintOptions = {
  format: string;
  /** The mention level this post was written for: none, soft or cta. */
  mention: string;
  /** The student's connection to Studojo (PB_RELATIONS value). */
  relation: string;
  /** The student's emoji setting (PB_EMOJI value). */
  emoji: string;
  /** The student's own "never use" words, already parsed. */
  avoid: string[];
  /** Everything the post may take facts from: the student's input and the brief. */
  source: string;
  /** The student's own input alone, without the brief. Figures about Studojo must come from here. */
  studentSource?: string;
  /** From polishPost: lines that lost a link mid-sentence. */
  brokenLines?: string[];
};

const quote = (s: string, max = 70) => `"${s.length > max ? `${s.slice(0, max).trimEnd()}...` : s}"`;

export function findLinks(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.match(URL) ?? []) out.add(m);
  for (const m of text.match(DOMAIN_WITH_PATH) ?? []) {
    if (![...out].some((o) => o.includes(m))) out.add(m);
  }
  for (const m of text.match(BARE_DOMAIN) ?? []) {
    if (![...out].some((o) => o.includes(m))) out.add(m);
  }
  return [...out];
}

/** True when the first two non-empty lines say plainly that this is a paid partnership with Studojo. */
export function hasPartnerDisclosure(body: string): boolean {
  const top = body.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 2).join(" ");
  return /studojo/i.test(top) && /\b(paid|partner(ship)?|sponsored|ad|advert(isement)?|collab(oration)?)\b/i.test(top);
}

/**
 * Every rule code can check, run on a polished post. Each issue is phrased as
 * the instruction that fixes it, because that is exactly what is sent back to
 * the writer when one remains.
 */
export function lintPost(fullBody: string, o: LintOptions): LintIssue[] {
  const body = String(fullBody ?? "").slice(0, MAX_INPUT);
  const issues: LintIssue[] = [];
  const add = (code: string, check: ReviewCheckId, message: string) => issues.push({ code, check, message });

  if (hasDash(body)) add("dash", "tells", "Replace every em or en dash with a comma, colon or full stop.");

  const links = findLinks(body);
  if (links.length) {
    add("link", "format", `Remove ${links.map((l) => quote(l)).join(", ")} from the body. Links go in the first comment.`);
  }
  for (const line of o.brokenLines ?? []) {
    add("link_cut", "format", `A link was cut out of the line ${quote(line)}. Rewrite that line so it reads naturally without it.`);
  }
  if (HAS_HASHTAG.test(body)) add("hashtag", "format", "Remove the hashtags.");
  const numbered = body.match(NUMBERED_LINE)?.length ?? 0;
  const bulleted = body.match(BULLET_LINE)?.length ?? 0;
  if (numbered >= 2 || bulleted >= 1) {
    add("list", "format", "Turn the list into short plain lines: no numbers, bullets or arrows at the start of lines.");
  }
  if (/\*\*|__|^[ \t]*#{1,6}[ \t]/m.test(body)) add("markdown", "format", "Remove the markdown (asterisks, underscores, headings).");

  const banned = findPhrases(body, BANNED_PHRASES);
  if (banned.length) {
    add("banned", "tells", `Replace ${banned.map((b) => quote(b)).join(", ")}: it reads as machine-written. Say the plain thing instead.`);
  }
  if (/\bnot just\b[^.!?\n]{1,60}?\bbut\b/i.test(body)) {
    add("not_just", "tells", 'Cut the "not just X, but Y" construction. Say the one thing directly.');
  }
  const avoided = findPhrases(body, o.avoid, { forms: true });
  if (avoided.length) {
    add("avoid", "voice", `They never use ${avoided.map((a) => quote(a)).join(", ")}. Remove it.`);
  }

  const hook = hookOf(body);
  const hookWords = wordCount(hook);
  if (hookWords > HOOK_MAX_WORDS) {
    add("hook_long", "hook", `The first line is ${hookWords} words. Cut it to ${HOOK_MAX_WORDS} or fewer and keep the concrete detail.`);
  }

  const words = wordCount(body);
  const r = wordRange(o.format);
  if (words < r.min) add("short", "length", `Only ${words} words. Aim for ${r.target}, using more of their real detail, not new facts.`);
  if (words > r.max) add("long", "length", `${words} words is too long. Cut to ${r.max} or fewer: cut explanation, keep the scene.`);
  if (body.length > LINKEDIN_MAX_CHARS) add("chars", "length", `Over the LinkedIn limit of ${LINKEDIN_MAX_CHARS} characters.`);

  const limit = EMOJI_LIMIT[o.emoji] ?? 2;
  const emoji = countEmoji(body);
  if (emoji > limit) {
    add("emoji", "voice", limit === 0 ? "Remove every emoji: they use none." : `Use at most ${limit} emoji: there are ${emoji}.`);
  }

  const mentions = countStudojo(body);
  const referred = mentionsStudojo(body);
  if (o.mention === "none" && referred) add("mention_none", "mention", "Remove every mention of Studojo and its products: this post does not mention them.");
  if ((o.mention === "soft" || o.mention === "cta") && !referred) add("mention_missing", "mention", "Mention Studojo once, as planned for this post.");
  const figures = studojoFigures(body, o.studentSource ?? o.source);
  if (figures.length) {
    add("studojo_number", "studojo", `Remove the figure about Studojo in ${quote(figures[0], 60)}: Studojo has no approved numbers.`);
  }
  if (mentions > 2) add("mention_many", "mention", `Studojo is named ${mentions} times. Once is enough (twice if the disclosure needs it).`);
  if (o.mention === "cta" && !/\bcomments?\b/i.test(body)) {
    add("cta_ask", "close", "End with one soft ask that points to the link in the first comment.");
  }
  if (o.relation === "partner" && o.mention !== "none" && referred && !hasPartnerDisclosure(body)) {
    add("disclosure", "mention", "Say in the first two lines, in plain words, that this is a paid partnership with Studojo.");
  }

  const timeline = inventedTimeline(body, o.source);
  if (timeline.length) {
    add("timeline", "facts", `These time details are not in their input: ${timeline.map((t) => quote(t)).join(", ")}. Remove them or use only timing they gave.`);
  }

  const invented = ungroundedNumbers(body, o.source);
  if (invented.length) {
    add("numbers", "facts", `These numbers are not in their input or the brief: ${invented.join(", ")}. Remove them or use only numbers they gave.`);
  }

  for (const para of body.split(/\n\s*\n/)) {
    if (wordCount(para) > 55) {
      add("paragraph", "structure", `Break up the paragraph that starts ${quote(para.trim(), 50)}: it runs past three lines on a phone.`);
      break;
    }
  }
  const sentences = sentencesOf(body);
  for (let i = 0; i + 2 < sentences.length; i++) {
    if ([0, 1, 2].every((k) => wordCount(sentences[i + k]) > 22)) {
      add("long_run", "structure", `Three long sentences in a row, starting ${quote(sentences[i], 50)}. Break them up.`);
      break;
    }
  }

  return issues;
}
