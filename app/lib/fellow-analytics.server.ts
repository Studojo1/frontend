import JSZip from "jszip";
import type { Readable } from "node:stream";

/**
 * Reads LinkedIn's content analytics export: on a computer, Post impressions on the feed, the last 7
 * days, then Export, which saves an .xlsx for the whole account over that time. The page keeps the file
 * and this reads what's in it: the period, the totals (impressions, members reached, followers), the
 * numbers for each day, every post listed with its impressions and engagements, and the top demographics
 * of who saw them.
 *
 * LinkedIn doesn't document the file, so nothing here depends on a sheet's name or a cell's position.
 * Every sheet is read. A table is found by its header row: Date with numbers beside it (each day), Post
 * URL with a date and numbers beside it (the posts; LinkedIn puts two lists side by side), or Category /
 * Value / Percentage (demographics). Outside a table, a number is matched by the label beside it, in any
 * case or spacing. A file with no impressions anywhere in it isn't one of these exports and is refused.
 *
 * Dates like 11/3/2026 could be read month first or day first. The file decides: a date with a part over
 * 12 settles it, and failing that, the reading whose latest date is nearest the day the file came in.
 *
 * An .xlsx is a zip, so a small upload can unpack to something huge: only the sheets and their shared
 * text are unpacked, each one stops at PART_MAX, and all of them together at TOTAL_MAX.
 */

export const MAX_ANALYTICS_BYTES = 5 * 1024 * 1024;
const PART_MAX = 16 * 1024 * 1024;
const TOTAL_MAX = 32 * 1024 * 1024;
const SHEETS_MAX = 20;
const DAYS_MAX = 400;
const POSTS_MAX = 100;

export const NOT_AN_EXPORT =
  "That doesn't look like LinkedIn's analytics export. On LinkedIn on a computer, open Post impressions, choose 7 days, tap Export, and upload the file it saves (it ends in .xlsx).";

export class AnalyticsFileError extends Error {}

/** One day's numbers, by key (impressions, engagements, newFollowers, ...), with its date. */
export type Day = { [key: string]: number | string; date: string };
export interface WeekAnalytics {
  periodStart: string | null;
  periodEnd: string | null;
  totals: Record<string, number>;
  daily: Day[];
  posts: { url: string; publishedOn: string | null; impressions: number | null; engagements: number | null }[];
  demographics: Record<string, { value: string; pct: number }[]>;
}

/** An .xlsx (any zip) starts with PK\x03\x04. */
export const looksLikeXlsx = (b: Uint8Array) => b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04;

// ---------------------------------------------------------------- unpacking

function unpack(file: JSZip.JSZipObject, budget: { left: number }): Promise<string> {
  return new Promise((resolve, reject) => {
    const s = file.nodeStream("nodebuffer") as Readable;
    const parts: Buffer[] = [];
    let size = 0;
    let done = false;
    const fail = () => {
      if (done) return;
      done = true;
      s.destroy?.();
      reject(new AnalyticsFileError(NOT_AN_EXPORT));
    };
    s.on("data", (chunk: Buffer) => {
      size += chunk.length;
      budget.left -= chunk.length;
      if (size > PART_MAX || budget.left < 0) return fail();
      parts.push(chunk);
    });
    s.on("error", fail);
    s.on("end", () => {
      if (done) return;
      done = true;
      resolve(Buffer.concat(parts).toString("utf8"));
    });
  });
}

// ---------------------------------------------------------------- the sheets, as rows of cells

type Cell = string | number;
type Row = { n: number; cells: { col: number; v: Cell }[] };

const ENTITY: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
function decode(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] !== "#") return ENTITY[e.toLowerCase()] ?? m;
    const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
  });
}

/** The text of a shared or inline string: its runs joined, without the phonetic guides some languages add. */
const textOf = (xml: string) =>
  decode([...xml.replace(/<rPh\b[\s\S]*?<\/rPh>/g, "").matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join(""));

function sharedStrings(xml: string): string[] {
  return [...xml.matchAll(/<si\b[^>]*?(?:\/>|>([\s\S]*?)<\/si>)/g)].map((m) => textOf(m[1] ?? ""));
}

const colIndex = (letters: string) => [...letters].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;

function sheetRows(xml: string, strings: string[]): Row[] {
  const out: Row[] = [];
  let rowNo = 0;
  for (const rm of xml.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const r = /\br="(\d+)"/.exec(rm[1]);
    rowNo = r ? Number(r[1]) : rowNo + 1;
    const cells: Row["cells"] = [];
    let col = -1;
    for (const cm of (rm[2] ?? "").matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const ref = /\br="([A-Z]{1,3})\d+"/.exec(cm[1]);
      col = ref ? colIndex(ref[1]) : col + 1;
      const type = /\bt="(\w+)"/.exec(cm[1])?.[1] ?? "n";
      const body = cm[2] ?? "";
      const raw = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
      let v: Cell | null = null;
      if (type === "s") v = raw != null ? strings[Number(raw)] ?? null : null;
      else if (type === "inlineStr") v = textOf(/<is>([\s\S]*?)<\/is>/.exec(body)?.[1] ?? "");
      else if (type === "str" || type === "d") v = raw != null ? decode(raw) : null;
      else if (type === "n" && raw != null && raw.trim() !== "") v = Number(raw);
      if (typeof v === "number" && !Number.isFinite(v)) v = null;
      if (typeof v === "string") v = v.replace(/\s+/g, " ").trim();
      if (v === null || v === "") continue;
      cells.push({ col, v });
    }
    if (cells.length) out.push({ n: rowNo, cells: cells.sort((a, b) => a.col - b.col) });
  }
  return out;
}

// ---------------------------------------------------------------- reading values

const norm = (s: string) => s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9%]+/g, " ").trim();

/** A number as LinkedIn writes it: 1234, "1,234", "12.5%" (as 0.125). */
function numberOf(v: Cell): number | null {
  if (typeof v === "number") return v;
  const m = /^(-?\d+(?:\.\d+)?)(%?)$/.exec(v.replace(/[,\s]/g, ""));
  if (!m) return null;
  return m[2] ? Number(m[1]) / 100 : Number(m[1]);
}

/**
 * A share between 0 and 1. In a Percentage column a plain 25 means 25%; elsewhere only a "%" or a
 * fraction below 1 counts, so a count like "Comments 4" is never read as a share. "< 1%" is kept as
 * 1%, its upper bound.
 */
function shareOf(v: Cell, inPctColumn: boolean): number | null {
  const t = typeof v === "number" ? "" : v.replace(/[<>~\s]/g, "");
  let n = typeof v === "number" ? v : numberOf(t);
  if (n == null || n < 0) return null;
  if (!t.endsWith("%")) {
    if (!inPctColumn && n >= 1) return null;
    if (n > 1) n /= 100;
  }
  return n > 1 ? null : Math.round(n * 10000) / 10000;
}

// The numbers the page and the admin panel know by name. Anything else is kept under its own label, camelCased.
const METRICS: [RegExp, string][] = [
  [/^impressions?$/, "impressions"],
  [/^(members? reached|unique (impressions|viewers)|reach)$/, "membersReached"],
  [/^(reactions?|likes?)$/, "reactions"],
  [/^comments?$/, "comments"],
  [/^(reposts?|shares?)$/, "reposts"],
  [/^saves?$/, "saves"],
  [/^sends?( on linkedin)?$/, "sends"],
  [/^profile (viewers|views)( from this post)?$/, "profileViewers"],
  [/^followers? gained( from this post)?$/, "followersGained"],
  [/^new followers$/, "newFollowers"],
  [/^engagements?$/, "engagements"],
];
const COUNT_KEYS = new Set(METRICS.map(([, k]) => k));
// The same limit the page's own numbers form uses for a post; a count no week reaches otherwise.
const MOST: Record<string, number> = { impressions: 50_000_000 };
const METRICS_MAX = 40;

const knownMetric = (label: string) => METRICS.find(([re]) => re.test(norm(label)))?.[1] ?? null;
function metricKey(label: string): string | null {
  const known = knownMetric(label);
  if (known) return known;
  const words = norm(label).replace(/%/g, " percent ").split(" ").filter(Boolean);
  if (!words.length || label.length > 60 || /\b(date|time|url|link|on)\b/.test(words.join(" "))) return null;
  const key = words.map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w)).join("").replace(/^\d+/, "");
  return key && key.length <= 48 ? key : null;
}

const DEMO_CATEGORY = /^(job titles?|titles?|locations?|industr(y|ies)|seniorit(y|ies)|company sizes?|compan(y|ies)|job functions?|functions?)$/;
const isCategory = (v: Cell) => typeof v === "string" && DEMO_CATEGORY.test(norm(v));
const isPctHeader = (v: Cell) => typeof v === "string" && /percent|^%$|^share$|^pct$/.test(norm(v));
const isUrlHeader = (v: Cell) => typeof v === "string" && /^post (url|link)$/.test(norm(v));
const isDateHeader = (v: Cell) => typeof v === "string" && /^(date|day)$/.test(norm(v));
const LINKEDIN_URL = /^https?:\/\/([a-z]{2,3}\.|www\.)?linkedin\.com\/\S+$/i;


// ---------------------------------------------------------------- dates

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const SLASH = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/;
type Order = "mdy" | "dmy" | null;

function ymd(y: number, m: number, d: number): string | null {
  const t = new Date(Date.UTC(y, m - 1, d));
  if (y < 2003 || y > 2100 || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) return null;
  return t.toISOString().slice(0, 10);
}

/** Month first or day first, as the file's own dates show (see the note at the top). */
function slashOrder(samples: string[], nowMs: number): Order {
  let mdy = false, dmy = false;
  for (const s of samples) {
    const m = SLASH.exec(s)!;
    if (+m[1] > 12 && +m[2] <= 12) dmy = true;
    if (+m[2] > 12 && +m[1] <= 12) mdy = true;
  }
  if (mdy !== dmy) return mdy ? "mdy" : "dmy";
  if (mdy && dmy) return null;
  const today = new Date(nowMs).toISOString().slice(0, 10);
  const latest = (order: "mdy" | "dmy") => samples
    .map((s) => { const m = SLASH.exec(s)!; return order === "mdy" ? ymd(+m[3], +m[1], +m[2]) : ymd(+m[3], +m[2], +m[1]); })
    .filter((d): d is string => !!d && d <= addDay(today))
    .sort().pop() ?? null;
  const a = latest("mdy"), b = latest("dmy");
  if (a === b) return a ? "mdy" : null; // every date reads the same both ways
  if (!a || !b) return a ? "mdy" : "dmy";
  return a > b ? "mdy" : "dmy";
}
const addDay = (d: string) => new Date(Date.parse(d) + 86400000).toISOString().slice(0, 10);

function dateOf(v: Cell, order: Order): string | null {
  if (typeof v === "number") {
    if (v < 30000 || v > 80000) return null;
    return new Date(Date.UTC(1899, 11, 30) + Math.floor(v) * 86400000).toISOString().slice(0, 10);
  }
  const s = v.trim().replace(/:$/, "");
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) return ymd(+m[1], +m[2], +m[3]);
  m = SLASH.exec(s);
  if (m) {
    if (+m[1] === +m[2]) return ymd(+m[3], +m[1], +m[2]);
    return order === "mdy" ? ymd(+m[3], +m[1], +m[2]) : order === "dmy" ? ymd(+m[3], +m[2], +m[1]) : null;
  }
  m = /^([a-z]{3})[a-z]*\.? (\d{1,2}),? (\d{4})$/i.exec(s);
  if (m && MONTHS.includes(m[1].toLowerCase())) return ymd(+m[3], MONTHS.indexOf(m[1].toLowerCase()) + 1, +m[2]);
  m = /^(\d{1,2}) ([a-z]{3})[a-z]*\.?,? (\d{4})$/i.exec(s);
  if (m && MONTHS.includes(m[2].toLowerCase())) return ymd(+m[3], MONTHS.indexOf(m[2].toLowerCase()) + 1, +m[1]);
  return null;
}

// ---------------------------------------------------------------- the export

const DATE_TEXT = /\b\d{1,2}[/.-]\d{1,2}[/.-]\d{4}\b/g;
const RANGE = /(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/.-]\d{1,2}[/.-]\d{4}|[a-z]{3,9}\.? \d{1,2},? \d{4}|\d{1,2} [a-z]{3,9}\.?,? \d{4})\s*(?:-|to|\u2013|\u2014)\s*(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/.-]\d{1,2}[/.-]\d{4}|[a-z]{3,9}\.? \d{1,2},? \d{4}|\d{1,2} [a-z]{3,9}\.?,? \d{4})/i;

type Table =
  | { kind: "daily"; date: number; cols: Map<number, string> }
  | { kind: "posts"; groups: { url: number; date: number | null; cols: Map<number, string> }[] }
  | { kind: "demo"; cat: number; val: number; pct: number; last: string }
  | { kind: "section"; cat: string };

export async function readAnalyticsExport(file: Uint8Array, nowMs: number = Date.now()): Promise<WeekAnalytics> {
  if (!looksLikeXlsx(file)) throw new AnalyticsFileError(NOT_AN_EXPORT);
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch {
    throw new AnalyticsFileError(NOT_AN_EXPORT);
  }
  const sheetFiles = Object.values(zip.files)
    .filter((f) => !f.dir && /^xl\/worksheets\/sheet\d+\.xml$/.test(f.name))
    .sort((a, b) => Number(/\d+/.exec(a.name.slice(14))?.[0]) - Number(/\d+/.exec(b.name.slice(14))?.[0]));
  if (!sheetFiles.length || sheetFiles.length > SHEETS_MAX) throw new AnalyticsFileError(NOT_AN_EXPORT);
  const budget = { left: TOTAL_MAX };
  const shared = zip.file("xl/sharedStrings.xml");
  const strings = shared ? sharedStrings(await unpack(shared, budget)) : [];
  const sheets: Row[][] = [];
  for (const f of sheetFiles) sheets.push(sheetRows(await unpack(f, budget), strings));

  const samples = sheets.flat().flatMap((r) => r.cells).flatMap((c) => (typeof c.v === "string" ? c.v.match(DATE_TEXT) ?? [] : []));
  const order = slashOrder(samples, nowMs);
  const dateIn = (v: Cell | undefined) => (v == null ? null : dateOf(v, order));

  const totals: Record<string, number> = {};
  const days = new Map<string, Record<string, number>>();
  const posts = new Map<string, WeekAnalytics["posts"][number]>();
  const demographics: WeekAnalytics["demographics"] = {};
  let periodStart: string | null = null, periodEnd: string | null = null;
  const addDemo = (category: string, value: Cell, pct: number) => {
    const cat = category.slice(0, 60);
    if (!demographics[cat] && Object.keys(demographics).length >= 12) return;
    const list = (demographics[cat] ??= []);
    if (list.length < 25) list.push({ value: String(value).slice(0, 120), pct });
  };
  const addTotal = (key: string | null, n: number) => {
    if (key && !(key in totals) && Object.keys(totals).length < METRICS_MAX) totals[key] = n;
  };

  for (const rows of sheets) {
    let table: Table | null = null;
    for (const row of rows) {
      const c = row.cells;
      const at = (col: number) => c.find((x) => x.col === col)?.v;

      // A header row starts a table.
      const urlCols = c.filter((x) => isUrlHeader(x.v)).map((x) => x.col);
      if (urlCols.length) {
        table = {
          kind: "posts",
          groups: urlCols.map((u, i) => {
            const end = urlCols[i + 1] ?? Infinity;
            const mine = c.filter((x) => x.col > u && x.col < end && typeof x.v === "string");
            const date = mine.find((x) => /\bdate\b/.test(norm(x.v as string)))?.col ?? null;
            const cols = new Map(mine.filter((x) => x.col !== date).map((x) => [x.col, metricKey(x.v as string)] as const).filter((e): e is [number, string] => !!e[1]));
            return { url: u, date, cols };
          }),
        };
        continue;
      }
      const catCol = c.find((x) => typeof x.v === "string" && /demographic|^category$|^type$/.test(norm(x.v)))?.col;
      const valCol = c.find((x) => typeof x.v === "string" && /^(value|name|segment)$/.test(norm(x.v)))?.col;
      const pctCol = c.find((x) => isPctHeader(x.v))?.col;
      if (catCol != null && valCol != null && pctCol != null) {
        table = { kind: "demo", cat: catCol, val: valCol, pct: pctCol, last: "" };
        continue;
      }
      const dateHead = c.find((x) => isDateHeader(x.v));
      if (dateHead) {
        const cols = new Map(c.filter((x) => x.col !== dateHead.col && typeof x.v === "string").map((x) => [x.col, metricKey(x.v as string)] as const).filter((e): e is [number, string] => !!e[1]));
        if (cols.size) {
          table = { kind: "daily", date: dateHead.col, cols };
          continue;
        }
      }

      // A row of the table it's in; a row that doesn't fit ends the table.
      if (table?.kind === "posts") {
        let hit = false;
        for (const g of table.groups) {
          const url = at(g.url);
          if (typeof url !== "string" || !LINKEDIN_URL.test(url) || posts.size >= POSTS_MAX && !posts.has(url)) continue;
          hit = true;
          const p = posts.get(url) ?? { url: url.slice(0, 500), publishedOn: null, impressions: null, engagements: null };
          if (g.date != null && !p.publishedOn) p.publishedOn = dateIn(at(g.date));
          for (const [col, key] of g.cols) {
            const n = at(col) != null ? numberOf(at(col)!) : null;
            if (n != null && (key === "impressions" || key === "engagements") && p[key] == null) p[key] = n;
          }
          posts.set(url, p);
        }
        if (hit) continue;
        table = null;
      } else if (table?.kind === "daily") {
        const date = dateIn(at(table.date));
        if (date) {
          if (!days.has(date) && days.size >= DAYS_MAX) continue;
          const day = days.get(date) ?? {};
          for (const [col, key] of table.cols) {
            const n = at(col) != null ? numberOf(at(col)!) : null;
            if (n != null && !(key in day)) day[key] = n;
          }
          days.set(date, day);
          continue;
        }
        table = null;
      } else if (table?.kind === "demo") {
        const cat = at(table.cat), val = at(table.val), pctCell = at(table.pct);
        const pct = pctCell != null ? shareOf(pctCell, true) : null;
        if (cat != null) table.last = String(cat);
        if (table.last && val != null && pct != null) {
          addDemo(table.last, val, pct);
          continue;
        }
        table = null;
      } else if (table?.kind === "section") {
        const pct = c.length >= 2 ? shareOf(c[c.length - 1].v, false) : null;
        if (typeof c[0].v === "string" && !knownMetric(c[0].v) && pct != null) {
          addDemo(table.cat, c[0].v, pct);
          continue;
        }
        table = null;
      }

      // Outside a table: the period, a category's rows, or a label and its number.
      for (const x of c) {
        const m = typeof x.v === "string" && !periodStart ? RANGE.exec(x.v) : null;
        if (m) { periodStart = dateIn(m[1]); periodEnd = dateIn(m[2]); }
      }
      if (isCategory(c[0].v)) {
        const pct = c.length >= 3 ? shareOf(c[c.length - 1].v, false) : null;
        if (pct != null && typeof c[1].v === "string") { addDemo(String(c[0].v), c[1].v, pct); continue; }
        if (c.length === 1 || (c.length === 2 && isPctHeader(c[1].v))) { table = { kind: "section", cat: String(c[0].v) }; continue; }
      }
      const li = c.findIndex((x) => typeof x.v === "string" && numberOf(x.v) == null);
      if (li < 0) continue;
      const label = c[li].v as string;
      const num = c.slice(li + 1).find((x) => numberOf(x.v) != null);
      if (!num) continue;
      // "Total followers on 11/3/2026:" names its own date.
      addTotal(/^total followers\b/.test(norm(label)) ? "totalFollowers" : metricKey(label), numberOf(num.v)!);
    }
  }

  const daily = [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, d]): Day => ({ ...d, date }));
  // Totals the file gives only day by day.
  for (const key of ["impressions", "engagements", "newFollowers"]) {
    if (!(key in totals) && daily.some((d) => typeof d[key] === "number")) totals[key] = daily.reduce((n, d) => n + (typeof d[key] === "number" ? (d[key] as number) : 0), 0);
  }
  const check = (key: string, n: number) => {
    if (COUNT_KEYS.has(key) && (n < 0 || n > (MOST[key] ?? 1_000_000_000))) {
      throw new AnalyticsFileError("The numbers in that file don't look right. Check it's LinkedIn's export of your own analytics.");
    }
    return COUNT_KEYS.has(key) ? Math.round(n) : Math.round(n * 10000) / 10000;
  };
  for (const [key, n] of Object.entries(totals)) {
    if (Math.abs(n) > 1e12) delete totals[key];
    else totals[key] = check(key, n);
  }
  for (const d of daily) for (const [key, n] of Object.entries(d)) if (typeof n === "number") d[key] = check(key, n);
  for (const p of posts.values()) {
    if (p.impressions != null) p.impressions = check("impressions", p.impressions);
    if (p.engagements != null) p.engagements = check("engagements", p.engagements);
  }
  if (totals.impressions == null && ![...posts.values()].some((p) => p.impressions != null)) throw new AnalyticsFileError(NOT_AN_EXPORT);
  if (!periodStart && daily.length) { periodStart = daily[0].date; periodEnd = daily[daily.length - 1].date; }
  return { periodStart, periodEnd, totals, daily, posts: [...posts.values()], demographics };
}

/** The activity number in a LinkedIn post link (".../posts/name-activity-7254...-x" or ".../urn:li:activity:7254..."). */
export const activityOf = (url: string | null | undefined) => /activity[:-](\d{15,22})/i.exec(url ?? "")?.[1] ?? null;
