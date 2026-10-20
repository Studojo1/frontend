/**
 * pageView(): a launched project page's row (career_agent.career_project_launches,
 * contract section 2) in, a plain render model out. Every block is checked again
 * here (contract sections 3 and 3.2): a block that fails is skipped, a link that
 * fails becomes plain text, and nothing here ever throws. The components only lay
 * the model out. Pure, so tests and the browser can load it.
 * Contract: career-agent docs/b2c8/CONTRACT-PAGES.md. Tests: ./view.test.mjs.
 *
 * Limits the contract does not set are kept generous: any other string up to
 * 2,000 characters, a timeline up to 60 items, a list or paragraph up to 200 parts.
 */
import { isPageHandle, isPageSlug } from "../../lib/project-pages";
import { stripDashes } from "../../lib/strip-dashes";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Unit = "number" | "inr" | "pct" | "x";
export type Theme = "masala" | "notebook" | "night" | "campus";
export type Fonts = "clash" | "satoshi" | "mono";
export type Provider = "google_sheets" | "google_slides" | "google_docs" | "figma" | "notion" | "loom" | "youtube" | "canva" | "tableau" | "looker_studio";
export type Align = "left" | "right";

export type SpanView = { t: string; b: boolean; i: boolean; href: string | null };
export type ParaView = { kind: "p"; spans: SpanView[] } | { kind: "ul" | "ol"; items: SpanView[][] };
export type CellView = { text: string; num: boolean };
export type SeriesView = { name: string; values: (number | null)[]; shown: string[] };

export type BlockView =
  | { id: string; type: "heading"; level: 1 | 2 | 3; text: string }
  | { id: string; type: "text"; rich: ParaView[] }
  | { id: string; type: "image"; src: string; alt: string; caption: string; width: number; height: number }
  | { id: string; type: "table"; caption: string; columns: string[]; align: Align[]; rows: CellView[][] }
  | { id: string; type: "chart"; kind: "bar" | "line" | "pie"; title: string; labels: string[]; series: SeriesView[]; unit: Unit; source: string; sourceId: string }
  | { id: string; type: "metrics"; items: { label: string; value: string; note: string }[] }
  | { id: string; type: "model"; title: string; columns: string[]; rows: { label: string; cells: string[]; bold: boolean }[]; notes: string }
  | { id: string; type: "quote"; text: string; by: string }
  | { id: string; type: "callout"; tone: "note" | "result" | "caution"; label: string; rich: ParaView[] }
  | { id: string; type: "timeline"; items: { when: string; what: string }[] }
  | { id: string; type: "file"; href: string; name: string; kind: "pdf"; size: string }
  | { id: string; type: "embed"; provider: Provider; providerName: string; src: string; title: string; aspect: "16:9" | "4:3" | "1:1" | "3:4" }
  | { id: string; type: "web"; src: string; title: string; height: number }
  | { id: string; type: "divider" };

export type BlockType = BlockView["type"];

export type PageView = {
  id: number;
  handle: string;
  slug: string;
  path: string;
  title: string;
  summary: string;
  theme: Theme;
  fonts: Fonts;
  /** CSS custom properties for the page root: the theme's colours and the font set. */
  vars: Record<string, string>;
  version: number;
  /** "20 Oct 2026", or "" when the row's date is not a real date. */
  launched: string;
  noindex: boolean;
  student: { name: string; initial: string; about: string; profileHref: string | null };
  kind: string;
  skills: string[];
  company: string;
  cover: string | null;
  blocks: BlockView[];
  reportHref: string;
  viewHref: string;
};

// ── Checks (contract 3 and 3.2) ───────────────────────────────────────────────

/** Links open in a new tab and pass no ranking (contract 3.2). */
export const LINK_REL = "nofollow ugc noopener";

export const BLOCK_ID_RE = /^[a-z0-9]{6,16}$/;
export const MEDIA_RE = /^\/b2cnew\/media\/[a-z0-9]{16,40}$/;
export const WEB_RE = /^\/b2cnew\/sites\/[0-9]+\/[0-9]+\/index\.html$/;

export const MAX_BLOCKS = 80;
const TEXT_MAX = 2000;
const SPAN_MAX = 2000;
const HEADING_MAX = 160;
const PARAS_MAX = 40;
const PARTS_MAX = 200;
const COLS_MAX = 12;
const ROWS_MAX = 60;
const LABELS_MAX = 24;
const SERIES_MAX = 4;
const TIMELINE_MAX = 60;
const NUM_MAX = 1e15;

/** The embed providers: the host and path start each src must have (contract 3.2). */
export const PROVIDERS: Record<Provider, { name: string; host: (h: string) => boolean; path: string }> = {
  google_sheets: { name: "Google Sheets", host: (h) => h === "docs.google.com", path: "/spreadsheets/d/" },
  google_slides: { name: "Google Slides", host: (h) => h === "docs.google.com", path: "/presentation/d/" },
  google_docs: { name: "Google Docs", host: (h) => h === "docs.google.com", path: "/document/d/" },
  figma: { name: "Figma", host: (h) => h === "www.figma.com", path: "/embed" },
  notion: { name: "Notion", host: (h) => h.length > ".notion.site".length && h.endsWith(".notion.site"), path: "/" },
  loom: { name: "Loom", host: (h) => h === "www.loom.com", path: "/embed/" },
  youtube: { name: "YouTube", host: (h) => h === "www.youtube-nocookie.com", path: "/embed/" },
  canva: { name: "Canva", host: (h) => h === "www.canva.com", path: "/design/" },
  tableau: { name: "Tableau", host: (h) => h === "public.tableau.com", path: "/views/" },
  looker_studio: { name: "Looker Studio", host: (h) => h === "lookerstudio.google.com", path: "/embed/" },
};

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const has = (o: Record<string, unknown>, k: string) => Object.prototype.hasOwnProperty.call(o, k) && o[k] !== undefined;
const oneOf = <T extends string>(v: unknown, list: readonly T[]): v is T => typeof v === "string" && (list as readonly string[]).includes(v);

// Control characters and bidi overrides never reach the page: they hide or reorder text.
// eslint-disable-next-line no-control-regex
const HIDDEN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g;

/** A string as the page shows it: hidden characters out, and no em or en dashes (the site's rule, app/lib/strip-dashes.ts). */
function plain(s: string): string {
  return stripDashes(s.replace(HIDDEN, ""));
}

/** A required string of 1 to max characters (trimmed), shown as plain text; null when it fails. */
function text(v: unknown, max = TEXT_MAX): string | null {
  if (typeof v !== "string" || v.length > max) return null;
  const t = plain(v).trim();
  return t ? t : null;
}

/** An optional string: "" when absent, null when present but wrong. */
function optText(o: Record<string, unknown>, k: string, max = TEXT_MAX): string | null {
  if (!has(o, k) || o[k] === null) return "";
  return text(o[k], max);
}

/** Whitespace, a backslash or a control character: a URL that holds one is refused, not repaired. */
// eslint-disable-next-line no-control-regex
const UNSAFE_URL = /[\s\\\u0000-\u001f\u007f-\u009f]/;

const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && Math.abs(v) < NUM_MAX;

/** A list of numbers or nulls of exactly n entries; null when it fails. */
function numbers(v: unknown, n: number): (number | null)[] | null {
  if (!Array.isArray(v) || v.length !== n) return null;
  return v.every((x) => x === null || finite(x)) ? (v as (number | null)[]) : null;
}

/** A span's link: https only (any host, no user or password in it) or a media path; null means plain text. */
export function safeHref(h: unknown): string | null {
  if (typeof h !== "string" || h.length > TEXT_MAX) return null;
  if (MEDIA_RE.test(h)) return h;
  if (!h.startsWith("https://") || UNSAFE_URL.test(h)) return null;
  let u: URL;
  try {
    u = new URL(h);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || !u.hostname || u.username || u.password) return null;
  return u.href;
}

/** An embed's src, normalised, when its host and path start match the provider; null otherwise. */
export function safeEmbed(provider: unknown, src: unknown): string | null {
  if (!oneOf(provider, Object.keys(PROVIDERS) as Provider[])) return null;
  if (typeof src !== "string" || src.length > TEXT_MAX || !src.startsWith("https://") || UNSAFE_URL.test(src)) return null;
  let u: URL;
  try {
    u = new URL(src);
  } catch {
    return null;
  }
  const p = PROVIDERS[provider];
  if (u.protocol !== "https:" || u.username || u.password || u.port) return null;
  if (!p.host(u.hostname) || !u.pathname.startsWith(p.path)) return null;
  return u.href;
}

// ── Formats (contract 3.1) ────────────────────────────────────────────────────

/** "12345678" as "1,23,45,678": the last three digits, then pairs. */
function groupIndian(digits: string): string {
  if (digits.length <= 3) return digits;
  let rest = digits.slice(0, -3);
  const parts: string[] = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) parts.unshift(rest);
  return `${parts.join(",")},${digits.slice(-3)}`;
}

/** Indian grouping with exactly (fixed) or up to (trim) a number of decimals; the minus is a plain hyphen. */
function grouped(n: number, decimals: number, trim: boolean): { neg: boolean; s: string } {
  const [int, dec = ""] = Math.abs(n).toFixed(decimals).split(".");
  const d = trim ? dec.replace(/0+$/, "") : dec;
  const s = groupIndian(int) + (d ? `.${d}` : "");
  return { neg: n < 0 && /[1-9]/.test(s), s };
}

/** A number in its unit: number 1,23,456.78 (up to 2 decimals), inr ₹1,23,456, pct 12.5%, x 18.2x. */
export function fmt(n: number, unit: Unit): string {
  if (unit === "pct" || unit === "x") {
    const { neg, s } = grouped(n, 1, false);
    return `${neg ? "-" : ""}${s}${unit === "pct" ? "%" : "x"}`;
  }
  const { neg, s } = grouped(n, 2, true);
  return `${neg ? "-" : ""}${unit === "inr" ? "₹" : ""}${s}`;
}

/** A null is an empty cell. */
export const fmtCell = (n: number | null, unit: Unit) => (n === null ? "" : fmt(n, unit));

/** An axis tick: like fmt, but with only the decimals the step needs ("4%", "₹200"). */
export function fmtTick(n: number, unit: Unit, step: number): string {
  const decimals = Math.max(0, Math.min(2, -Math.floor(Math.log10(step) + 1e-9)));
  const { neg, s } = grouped(n, decimals, false);
  const sign = neg ? "-" : "";
  if (unit === "pct") return `${sign}${s}%`;
  if (unit === "x") return `${sign}${s}x`;
  return `${sign}${unit === "inr" ? "₹" : ""}${s}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-20" as "20 Oct 2026"; "" when it is not a real date. */
export function fmtDate(v: unknown): string {
  if (typeof v !== "string") return "";
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return "";
  return `${d} ${MONTHS[mo - 1]} ${y}`;
}

/** 482113 bytes as "471 KB". */
export function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} MB`;
}

// ── Themes and fonts (contract 3.3) ───────────────────────────────────────────

type Palette = { bg: string; surface: string; ink: string; muted: string; line: string; accent: string; accentSoft: string; onAccent: string; warn: string; warnSoft: string; series: string[] };

export const THEMES: Record<Theme, Palette> = {
  // Warm cream, chilli red.
  masala: { bg: "#fbf6ee", surface: "#fffdf9", ink: "#1f1a16", muted: "#665a4e", line: "#e8ddcd", accent: "#c0321b", accentSoft: "#f8e2d9", onAccent: "#ffffff", warn: "#8a5300", warnSoft: "#fcefd4", series: ["#c0321b", "#24407a", "#d4931a", "#2f7a57", "#8a4b9c", "#7c6f62"] },
  // White paper, blue ink.
  notebook: { bg: "#ffffff", surface: "#f6f8fc", ink: "#111827", muted: "#4b5563", line: "#e3e7ef", accent: "#1d4ed8", accentSoft: "#e3ebff", onAccent: "#ffffff", warn: "#8a5300", warnSoft: "#fdf1d8", series: ["#1d4ed8", "#e2632b", "#0f766e", "#a21caf", "#ca8a04", "#64748b"] },
  // Charcoal, lime.
  night: { bg: "#151619", surface: "#1e1f24", ink: "#f2f2ee", muted: "#a7a8a1", line: "#33353c", accent: "#c6f432", accentSoft: "#2a3313", onAccent: "#151619", warn: "#ffcf70", warnSoft: "#3a2d12", series: ["#c6f432", "#7cc4ff", "#ff8f6b", "#c9a7ff", "#ffd166", "#9ca3af"] },
  // Soft lilac, violet.
  campus: { bg: "#f6f2fd", surface: "#ffffff", ink: "#1c1530", muted: "#5b5272", line: "#e2d9f3", accent: "#6d28d9", accentSoft: "#ebe2fd", onAccent: "#ffffff", warn: "#8a5300", warnSoft: "#fcefd4", series: ["#6d28d9", "#db4f94", "#0f9d8a", "#df9014", "#3b82f6", "#6b7280"] },
};

const CLASH = "'Clash Display', ui-sans-serif, system-ui, sans-serif";
const SATOSHI = "'Satoshi', ui-sans-serif, system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

/** Headings, body text, and tables and models. */
export const FONTS: Record<Fonts, { head: string; body: string; data: string }> = {
  clash: { head: CLASH, body: SATOSHI, data: SATOSHI },
  satoshi: { head: SATOSHI, body: SATOSHI, data: SATOSHI },
  mono: { head: SATOSHI, body: MONO, data: MONO },
};

/** The page root's CSS variables for a theme and font set. */
export function themeVars(theme: Theme, fonts: Fonts): Record<string, string> {
  const p = THEMES[theme];
  const f = FONTS[fonts];
  const vars: Record<string, string> = {
    "--pp-bg": p.bg,
    "--pp-surface": p.surface,
    "--pp-ink": p.ink,
    "--pp-muted": p.muted,
    "--pp-line": p.line,
    "--pp-accent": p.accent,
    "--pp-accent-soft": p.accentSoft,
    "--pp-on-accent": p.onAccent,
    "--pp-warn": p.warn,
    "--pp-warn-soft": p.warnSoft,
    "--pp-head": f.head,
    "--pp-body": f.body,
    "--pp-data": f.data,
  };
  p.series.forEach((c, i) => (vars[`--pp-s${i + 1}`] = c));
  return vars;
}

// ── Rich text ─────────────────────────────────────────────────────────────────

function spanOf(v: unknown): SpanView | null | "empty" {
  if (!isObj(v) || typeof v.t !== "string" || v.t.length > SPAN_MAX) return null;
  // Spaces inside and at the ends of a span are kept: "Result: " runs into the next span.
  const t = plain(v.t);
  if (!t.trim()) return "empty";
  return { t, b: v.b === true, i: v.i === true, href: has(v, "href") ? safeHref(v.href) : null };
}

function spansOf(v: unknown): SpanView[] | null {
  if (!Array.isArray(v) || v.length > PARTS_MAX) return null;
  const out: SpanView[] = [];
  for (const s of v) {
    const span = spanOf(s);
    if (span === null) return null;
    if (span !== "empty") out.push(span);
  }
  return out;
}

/** Rich text; null when any part fails. Empty paragraphs and list items are left out. */
export function richOf(v: unknown): ParaView[] | null {
  if (!Array.isArray(v) || v.length === 0 || v.length > PARAS_MAX) return null;
  const out: ParaView[] = [];
  for (const p of v) {
    if (!isObj(p)) return null;
    if (p.kind === "p") {
      const spans = spansOf(p.spans);
      if (!spans) return null;
      if (spans.length) out.push({ kind: "p", spans });
    } else if (p.kind === "ul" || p.kind === "ol") {
      if (!Array.isArray(p.items) || p.items.length > PARTS_MAX) return null;
      const items: SpanView[][] = [];
      for (const it of p.items) {
        const spans = spansOf(it);
        if (!spans) return null;
        if (spans.length) items.push(spans);
      }
      if (items.length) out.push({ kind: p.kind, items });
    } else return null;
  }
  return out.length ? out : null;
}

// ── Blocks ────────────────────────────────────────────────────────────────────

const KINDS: Record<string, string> = {
  side: "Side project",
  college: "College project",
  competition: "Competition",
  freelance: "Freelance",
  research: "Research",
  company: "Built for a company",
  internship: "Internship project",
  personal: "Personal project",
};

/** The project kind as a label: "side" is "Side project"; an unknown word is shown capitalised. */
export function kindLabel(v: unknown): string {
  if (typeof v !== "string") return "Project";
  const k = v.trim().toLowerCase();
  if (KINDS[k]) return KINDS[k];
  if (!/^[a-z][a-z _-]{1,39}$/.test(k)) return "Project";
  const words = k.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const TONE_LABEL = { note: "Note", result: "Result", caution: "Caution" } as const;

/** A table cell: text as given, a number in Indian grouping, null as empty. */
function cellOf(v: unknown): CellView | null {
  if (v === null) return { text: "", num: false };
  if (finite(v)) return { text: fmt(v, "number"), num: true };
  if (typeof v === "string" && v.length <= TEXT_MAX) return { text: plain(v).trim(), num: false };
  return null;
}

/** Numbers and number-like strings ("3.8%", "-5.6%", "₹665") line up on the right. */
const NUMERIC_TEXT = /^[-+]?[₹$€£]?\s?[\d,]+(\.\d+)?\s?(%|x|cr|l|k|m|bn)?$/i;

function blockOf(raw: unknown): BlockView | null {
  if (!isObj(raw) || typeof raw.id !== "string" || !BLOCK_ID_RE.test(raw.id)) return null;
  const id = raw.id;
  const b = raw;
  switch (b.type) {
    case "heading": {
      const t = text(b.text, HEADING_MAX);
      if (!t || (b.level !== 1 && b.level !== 2 && b.level !== 3)) return null;
      return { id, type: "heading", level: b.level, text: t };
    }
    case "text": {
      const rich = richOf(b.rich);
      return rich ? { id, type: "text", rich } : null;
    }
    case "image": {
      if (typeof b.src !== "string" || !MEDIA_RE.test(b.src)) return null;
      if (typeof b.alt !== "string" || b.alt.length > TEXT_MAX) return null;
      const caption = optText(b, "caption");
      const size = (n: unknown) => typeof n === "number" && Number.isInteger(n) && n > 0 && n <= 20000;
      if (caption === null || !size(b.width) || !size(b.height)) return null;
      return { id, type: "image", src: b.src, alt: plain(b.alt).trim(), caption, width: b.width as number, height: b.height as number };
    }
    case "table": {
      const caption = optText(b, "caption");
      if (caption === null || !Array.isArray(b.columns) || b.columns.length === 0 || b.columns.length > COLS_MAX) return null;
      const columns = b.columns.map((c) => (typeof c === "string" && c.length <= TEXT_MAX ? plain(c).trim() : null));
      if (columns.some((c) => c === null)) return null;
      const n = columns.length;
      if (!Array.isArray(b.rows) || b.rows.length === 0 || b.rows.length > ROWS_MAX) return null;
      const rows: CellView[][] = [];
      for (const r of b.rows) {
        // A short row is padded with empty cells; a long one would lose data, so the table is skipped.
        if (!Array.isArray(r) || r.length > n) return null;
        const cells = r.map(cellOf);
        if (cells.some((c) => c === null)) return null;
        while (cells.length < n) cells.push({ text: "", num: false });
        rows.push(cells as CellView[]);
      }
      let align: Align[];
      if (has(b, "align")) {
        if (!Array.isArray(b.align) || b.align.length !== n || !b.align.every((a) => a === "left" || a === "right")) return null;
        align = b.align as Align[];
      } else {
        align = columns.map((_, i) => {
          const filled = rows.map((r) => r[i]).filter((c) => c.text);
          return filled.length > 0 && filled.every((c) => c.num || NUMERIC_TEXT.test(c.text)) ? "right" : "left";
        });
      }
      return { id, type: "table", caption, columns: columns as string[], align, rows };
    }
    case "chart": {
      if (b.kind !== "bar" && b.kind !== "line" && b.kind !== "pie") return null;
      const title = optText(b, "title");
      if (title === null) return null;
      if (!Array.isArray(b.labels) || b.labels.length === 0 || b.labels.length > LABELS_MAX) return null;
      const labels = b.labels.map((l) => (typeof l === "string" && l.length <= TEXT_MAX ? plain(l).trim() : null));
      if (labels.some((l) => l === null)) return null;
      if (!Array.isArray(b.series) || b.series.length === 0 || b.series.length > SERIES_MAX) return null;
      let unit: Unit = "number";
      if (has(b, "unit")) {
        if (!oneOf(b.unit, ["number", "inr", "pct", "x"] as const)) return null;
        unit = b.unit;
      }
      const series: SeriesView[] = [];
      for (const s of b.series) {
        if (!isObj(s)) return null;
        const name = text(s.name);
        const values = numbers(s.values, labels.length);
        if (!name || !values) return null;
        series.push({ name, values, shown: values.map((v) => fmtCell(v, unit)) });
      }
      if (series.every((s) => s.values.every((v) => v === null))) return null;
      // A pie shows one series of parts: nothing below zero, something above it.
      if (b.kind === "pie") {
        const vals = series[0].values;
        if (series.length !== 1 || vals.some((v) => v !== null && v < 0) || !vals.some((v) => v !== null && v > 0)) return null;
      }
      let sourceId = "";
      if (has(b, "source") && b.source !== null) {
        if (typeof b.source !== "string" || !BLOCK_ID_RE.test(b.source)) return null;
        sourceId = b.source;
      }
      return { id, type: "chart", kind: b.kind, title, labels: labels as string[], series, unit, source: "", sourceId };
    }
    case "metrics": {
      if (!Array.isArray(b.items) || b.items.length < 2 || b.items.length > 6) return null;
      const items: { label: string; value: string; note: string }[] = [];
      for (const it of b.items) {
        if (!isObj(it)) return null;
        const label = text(it.label);
        const value = text(it.value);
        const note = optText(it, "note");
        if (!label || !value || note === null) return null;
        items.push({ label, value, note });
      }
      return { id, type: "metrics", items };
    }
    case "model": {
      const title = optText(b, "title");
      const notes = optText(b, "notes");
      if (title === null || notes === null) return null;
      if (!Array.isArray(b.columns) || b.columns.length === 0 || b.columns.length > COLS_MAX) return null;
      const columns = b.columns.map((c) => (typeof c === "string" && c.length <= TEXT_MAX ? plain(c).trim() : null));
      if (columns.some((c) => c === null)) return null;
      if (!Array.isArray(b.rows) || b.rows.length === 0 || b.rows.length > ROWS_MAX) return null;
      const rows: { label: string; cells: string[]; bold: boolean }[] = [];
      for (const r of b.rows) {
        if (!isObj(r)) return null;
        const label = text(r.label);
        const values = numbers(r.values, columns.length);
        if (!label || !values || !oneOf(r.format, ["number", "inr", "pct", "x"] as const)) return null;
        const format = r.format;
        rows.push({ label, cells: values.map((v) => fmtCell(v, format)), bold: r.bold === true });
      }
      return { id, type: "model", title, columns: columns as string[], rows, notes };
    }
    case "quote": {
      const t = text(b.text);
      const by = optText(b, "by");
      if (!t || by === null) return null;
      return { id, type: "quote", text: t, by };
    }
    case "callout": {
      if (b.tone !== "note" && b.tone !== "result" && b.tone !== "caution") return null;
      const rich = richOf(b.rich);
      return rich ? { id, type: "callout", tone: b.tone, label: TONE_LABEL[b.tone], rich } : null;
    }
    case "timeline": {
      if (!Array.isArray(b.items) || b.items.length === 0 || b.items.length > TIMELINE_MAX) return null;
      const items: { when: string; what: string }[] = [];
      for (const it of b.items) {
        if (!isObj(it)) return null;
        const when = text(it.when);
        const what = text(it.what);
        if (!when || !what) return null;
        items.push({ when, what });
      }
      return { id, type: "timeline", items };
    }
    case "file": {
      if (typeof b.href !== "string" || !MEDIA_RE.test(b.href) || b.kind !== "pdf") return null;
      const name = text(b.name);
      if (!name) return null;
      let size = "";
      if (has(b, "size") && b.size !== null) {
        if (typeof b.size !== "number" || !Number.isInteger(b.size) || b.size < 0 || b.size > NUM_MAX) return null;
        size = fmtSize(b.size);
      }
      return { id, type: "file", href: b.href, name, kind: "pdf", size };
    }
    case "embed": {
      const src = safeEmbed(b.provider, b.src);
      const title = text(b.title);
      if (!src || !title || !oneOf(b.aspect, ["16:9", "4:3", "1:1", "3:4"] as const)) return null;
      const provider = b.provider as Provider;
      return { id, type: "embed", provider, providerName: PROVIDERS[provider].name, src, title, aspect: b.aspect };
    }
    case "web": {
      const title = text(b.title);
      if (typeof b.src !== "string" || !WEB_RE.test(b.src) || !title) return null;
      if (typeof b.height !== "number" || !Number.isInteger(b.height) || b.height < 320 || b.height > 1600) return null;
      return { id, type: "web", src: b.src, title, height: b.height };
    }
    case "divider":
      return { id, type: "divider" };
    default:
      return null;
  }
}

/** Every block that passes, in order: the first 80, no repeated ids. A chart's source becomes its caption. */
export function blocksOf(v: unknown): BlockView[] {
  if (!Array.isArray(v)) return [];
  const out: BlockView[] = [];
  const seen = new Set<string>();
  for (const raw of v.slice(0, MAX_BLOCKS)) {
    let block: BlockView | null = null;
    try {
      block = blockOf(raw);
    } catch {
      block = null;
    }
    if (!block || seen.has(block.id)) continue;
    seen.add(block.id);
    out.push(block);
  }
  out.forEach((block, i) => {
    if (block.type !== "chart" || !block.sourceId) return;
    const j = out.findIndex((s) => s.id === block.sourceId);
    const src = out[j];
    if (!src || (src.type !== "table" && src.type !== "model")) return;
    const where = j < i ? "above" : "below";
    const name = src.type === "table" ? src.caption : src.title;
    const what = src.type === "table" ? "table" : "model";
    block.source = name ? `From the ${what} ${where}: ${name}` : `From the ${what} ${where}`;
  });
  return out;
}

// ── The page ──────────────────────────────────────────────────────────────────

/** The row as the page draws it; null when it cannot be a page (no id, address or title). */
export function pageView(row: unknown): PageView | null {
  if (!isObj(row)) return null;
  const id = row.id;
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) return null;
  const handle = row.handle;
  const slug = row.slug;
  if (typeof handle !== "string" || typeof slug !== "string" || !isPageHandle(handle) || !isPageSlug(slug)) return null;
  const title = text(row.title, 90);
  if (!title || title.length < 3) return null;

  const theme: Theme = oneOf(row.theme, ["masala", "notebook", "night", "campus"] as const) ? row.theme : "masala";
  const fonts: Fonts = oneOf(row.fonts, ["clash", "satoshi", "mono"] as const) ? row.fonts : "clash";
  const meta = isObj(row.meta) ? row.meta : {};
  const st = isObj(meta.student) ? meta.student : {};
  const name = text(st.name, 120) ?? "A Studojo student";
  const college = text(st.college, 200) ?? "";
  const degree = text(st.degree, 200) ?? "";
  const profileSlug = typeof st.profile_slug === "string" && /^[a-z0-9-]{3,80}$/.test(st.profile_slug) ? st.profile_slug : null;
  const skills = Array.isArray(meta.skills)
    ? meta.skills
        .map((s) => text(s, 60))
        .filter((s): s is string => !!s)
        .slice(0, 8)
    : [];
  const cover = isObj(meta.cover) && typeof meta.cover.image === "string" && MEDIA_RE.test(meta.cover.image) ? meta.cover.image : null;
  const version = typeof row.version === "number" && Number.isInteger(row.version) && row.version > 0 ? row.version : 1;

  return {
    id,
    handle,
    slug,
    path: `/${handle}/${slug}`,
    title,
    summary: text(row.summary, 280) ?? "",
    theme,
    fonts,
    vars: themeVars(theme, fonts),
    version,
    launched: fmtDate(row.published_on),
    // Anything but a plain false keeps search engines out.
    noindex: row.noindex !== false,
    student: {
      name,
      initial: (name.match(/[A-Za-z0-9]/)?.[0] ?? "S").toUpperCase(),
      about: [degree, college].filter(Boolean).join(", "),
      profileHref: profileSlug ? `/profile/${profileSlug}` : null,
    },
    kind: kindLabel(meta.kind),
    skills,
    company: text(meta.company, 120) ?? "",
    cover,
    blocks: blocksOf(row.blocks),
    reportHref: `/b2cnew/report/${id}`,
    viewHref: `/b2cnew/api/public/launches/${id}/view`,
  };
}
