/**
 * Text rules for the student page (/profile/:slug), shared by the mapper
 * (app/lib/student-page.server.ts) and the page's view model
 * (app/components/student-page/profile-view.ts). Pure and safe in the browser:
 * no server imports, and no regex lookbehind (older iOS Safari cannot parse it,
 * which would break the whole bundle).
 *
 * Long dashes are written as unicode escapes, never as characters: the no-dashes guard scans
 * every file under app/.
 */

/** Bullet characters resume parsers emit at the start of a line (private-use glyphs are handled separately). */
export const BULLET_CHARS =
  "\u2022\u25cf\u25cb\u25aa\u25ab\u25a0\u25a1\u2023\u25e6\u2043\u2219\u00b7\u27a2\u27a4\u2713\u2714\u25ba\u25b8\u25b6\u2192\u2794\u203a\u00bb";

const PUA = /[\ue000-\uf8ff\ufffd]/g;
const LEAD = new RegExp(`^[\\s${BULLET_CHARS}>]+`);
const GLYPH = /[\ue000-\uf8ff\u2022\u25cf\u25aa\u25a0]/;
const IS_BULLET = new RegExp(`^\\s*(?:[\\ue000-\\uf8ff${BULLET_CHARS}]|[-*]\\s)`);

/** Every displayed string goes through clean(): no bullet glyphs, no long dashes, tidy spacing, curly apostrophes. */
export function clean(s: unknown): string {
  if (s === null || s === undefined) return "";
  let t = String(s).replace(PUA, " ");
  t = t.replace(/\s*[\u2012-\u2015]\s*/g, (m) => (/\s/.test(m) ? " - " : "-"));
  t = t.replace(/\s+/g, " ").trim();
  for (let i = 0; i < 3; i++) t = t.replace(LEAD, "").replace(/^[-*]\s+/, "").trim();
  t = t.replace(/\s+([,;:!?%)])/g, "$1").replace(/\(\s+/g, "(");
  return t.replace(/(\w)'(\w)/g, "$1\u2019$2");
}

/** Came from a bullet line (a parsed title that carries a bullet glyph is a sentence, not a heading). */
export const hasGlyph = (s: unknown) => GLYPH.test(String(s ?? ""));
/** A line that starts with a bullet, private-use glyphs included. */
export const isBullet = (s: unknown) => IS_BULLET.test(String(s ?? ""));

/** Contact details never show: not in entries, not in quoted resume lines. */
export function redact(t: string): string {
  return t
    .replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, "[email hidden]")
    .replace(/\+?\d[\d\s().-]{8,}\d/g, (m) => (m.replace(/\D/g, "").length >= 10 ? "[phone hidden]" : m));
}
export const txt = (s: unknown) => redact(clean(s));

/** 4+ digit numbers get separators (1000 to 1,000). Years (1900 to 2099), codes and decimals are left alone. */
export function fmtNum(t: string): string {
  return t.replace(/(^|[^\w.,/:-])(\d{4,9})(?![\w]|[.,]\d)/g, (m: string, pre: string, d: string, off: number, all: string) => {
    const n = Number(d);
    const money = /[$\u20b9\u20ac\u00a3]\s?$/.test(all.slice(Math.max(0, off - 1), off + pre.length));
    if (d.length === 4 && n >= 1900 && n <= 2099 && !money) return m;
    if (d[0] === "0") return m;
    return pre + n.toLocaleString("en-US");
  });
}

export const capFirst = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
export const norm = (s: unknown) => clean(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// ---------------------------------------------------------------- the sentence-like test

export const VERB =
  /^(devised|awarded|created|led|managed|built|designed|developed|executed|organi[sz]ed|hosted|ran|grew|worked|crafted|improved|secured|increased|launched|conducted|achieved|won|spearheaded|collaborated|implemented|handled|coordinated|assisted|anal[yz]sed|prepared|represented|pitched|curated|doubled|identified|established|delivered|drove|generated|reduced|wrote|published|presented|volunteered|participated|completed|received|selected|served|trained|mentored|taught|helped|supported|contributed|responsible|ideated)\b/i;
export const ROLE_TAIL =
  /\b(intern|internship|trainee|analyst|associate|manager|lead|engineer|developer|designer|consultant|executive|officer|office|specialist|strategist|assistant|coordinator|fellow|researcher|scientist|head|director|founder|co-?founder|member|president|volunteer|representative|ambassador)s?\)?$/i;
const ABBR = new Set(["st", "dr", "mr", "mrs", "ms", "mt", "no", "pvt", "ltd", "inc", "co", "corp", "univ", "govt", "intl", "dept", "jr", "sr", "bros", "hon", "hons", "prof", "vs", "engg", "mgmt", "inst", "assn", "estd", "approx", "tech", "sc", "com", "eng"]);
/** An org field that is really a role line ("Head of Marketing at CUSBMA"). No bare " at " rule: "Women at Work Foundation" is an org. */
export const ROLE_AT = /^(head|lead|member|core member|president|vice[- ]president|captain|founder|co-?founder|intern|manager|director|coordinator|secretary|volunteer|treasurer)\b.*\bat\b/i;

/** "strategies. Managed" is a sentence break; "St. Thomas", "B.Tech. Computer" and "Govt. College" are not. */
export function midSentence(s: string): boolean {
  const re = /(?:^|\s)([A-Za-z]{2,})\.\s+[A-Z]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) if (!ABBR.has(m[1].toLowerCase())) return true;
  return false;
}

/** A parsed title or org that is really a resume sentence. */
export function readsLikeSentence(raw: unknown): boolean {
  if (!raw) return false;
  if (hasGlyph(raw)) return true;
  const s = clean(raw);
  const words = s.split(" ");
  const roleTail = ROLE_TAIL.test(s);
  if (s.length > 64) return true;
  if (VERB.test(s) && !roleTail) return true;
  if (/^[A-Za-z]+ed$/.test(words[0]) && words.length >= 5 && !roleTail) return true;
  if (midSentence(s)) return true;
  if (/[!?;:]$/.test(s)) return true;
  const end = /(?:^|\s)([a-z]{2,})\.$/.exec(s);
  if (end && !ABBR.has(end[1])) return true;
  return false;
}

export type EntryMode = "clean" | "anchored" | "loose";

/**
 * How a parsed entry is drawn. clean: a CV entry. anchored: the title is junk
 * but the org is a real name with dates, so the org heads the entry. loose:
 * never drawn as an entry; its lines join the section's list.
 */
export function entryMode(st: { title?: unknown; org?: { name?: unknown } | null; hideOrg?: boolean; from?: unknown; to?: unknown }): EntryMode {
  const title = clean(st.title);
  const orgRaw = st.org?.name ?? "";
  const org = clean(orgRaw);
  const same = !!org && org.toLowerCase() === title.toLowerCase();
  const showOrg = !!org && !st.hideOrg && !same;
  const titleJunk = !title || readsLikeSentence(st.title);
  const orgJunk = !org || same || readsLikeSentence(orgRaw) || ROLE_AT.test(org);
  const dated = !!(clean(st.from) || clean(st.to));
  if (!titleJunk && (!showOrg || !orgJunk)) return "clean";
  if (titleJunk && !orgJunk && dated) return "anchored";
  return "loose";
}

/** "Resume line 20", "Resume lines 30 to 33", "Lines 6 and 9": long or short form. */
export function lineRef(ls: { n: number }[], long: boolean): string {
  const ns = ls.map((l) => l.n);
  if (!ns.length) return "";
  const one = long ? "Resume line" : "Line";
  const many = long ? "Resume lines" : "Lines";
  if (ns.length === 1) return `${one} ${ns[0]}`;
  const run = ns.every((n, i) => !i || n === ns[i - 1] + 1);
  if (ns.length === 2) return `${many} ${ns[0]} and ${ns[1]}`;
  if (run) return `${many} ${ns[0]} to ${ns[ns.length - 1]}`;
  if (ns.length <= 4) return `${many} ${ns.slice(0, -1).join(", ")} and ${ns[ns.length - 1]}`;
  return long ? `${ns.length} resume lines` : `${ns.length} lines`;
}
