import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  FiPlus, FiTrash2, FiSend, FiDownload, FiZap, FiSearch,
  FiFileText, FiGrid, FiLoader, FiExternalLink,
  FiSidebar, FiMaximize2, FiMinimize2, FiX, FiLinkedin, FiCopy, FiCheck,
  FiMessageSquare, FiColumns, FiUsers,
  FiLayers, FiGlobe, FiPaperclip, FiFile, FiPhone, FiMail, FiUserPlus, FiSlash,
  FiMoon, FiSun, FiPhoneOff, FiMoreHorizontal, FiFolder, FiFolderPlus, FiFolderMinus, FiEdit2,
} from "react-icons/fi";
import { LuPin, LuPinOff } from "react-icons/lu";

// ─────────────────────────────────────────────────────────────────────────────
// Bob: placement intelligence workspace.
// Chat left, results right. Results default to company CARDS (a dossier per
// company); a dense table view is one toggle away. Rows stream in live.
// Backend: /api/v1/outreach/bob/*
// ─────────────────────────────────────────────────────────────────────────────

export function meta() {
  return [
    { title: "Sensei by Studojo" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

const API = "/api/v1/outreach/bob";
const KEY_STORAGE = "bob_access_key";
const SESSION_STORAGE = "bob_session";

// Send whichever auth the user has: an email session token and/or the legacy
// workspace access code. The backend accepts either.
function authHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  const key = localStorage.getItem(KEY_STORAGE);
  const session = localStorage.getItem(SESSION_STORAGE);
  if (key) h["X-Bob-Key"] = key;
  if (session) h["X-Bob-Session"] = session;
  return h;
}
const LAYOUT_STORAGE = "bob_layout_v3";

// app.studojo.* -> dashboard.studojo.* (same env). The manager portal. Carries
// the session token across the subdomain (localStorage is per-origin) so the
// manager stays signed in as the SAME account on the dashboard.
function dashboardUrl(): string {
  if (typeof window === "undefined") return "https://dashboard.studojo.com";
  const host = window.location.host.replace(/^app\./, "dashboard.");
  const base = `${window.location.protocol}//${host}`;
  const s = localStorage.getItem(SESSION_STORAGE);
  // Opened on /oldui, land on /oldui over there too, so the original look carries across.
  const path = homePath();
  return s ? `${base}${path}?s=${encodeURIComponent(s)}` : path === "/" ? base : base + path;
}

class BobError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function bobFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers as Record<string, string>),
    },
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new BobError(data?.detail || `Request failed (${res.status})`, res.status);
  return data as T;
}

// ── Types ────────────────────────────────────────────────────────────────────

// project_id / project_name / pinned are the caller's OWN organisation (personal, never shared);
// can_manage says whether they may rename, share or delete it (its owner or a workspace admin).
interface ChatSummary {
  id: number; title: string; updated_at: string;
  owner_email?: string | null; can_manage?: boolean;
  project_id?: number | null; project_name?: string | null; pinned?: boolean;
}
interface Project { id: number; name: string; chat_count: number; last_activity: string }
const MAX_PINS = 4;

// bob-svc sends Postgres timestamps ("2026-10-12 10:23:45.123456+00:00"); Safari will not parse
// the space or the microseconds, so normalise before handing it to Date.
function shortWhen(ts: string | null | undefined): string {
  if (!ts) return "";
  const d = new Date(ts.replace(" ", "T").replace(/(\.\d{3})\d+/, "$1"));
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  const days = Math.floor((new Date(today.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
// Coach (bob-svc BOB_COACH): a finished run attaches the diagnosis + soft levers to the last
// assistant message, so the results panel can show an edge-case card with one-click re-run chips.
type Lever = { key?: string; label: string; message: string; est_gain?: number | null; patch?: Record<string, unknown> };
type Diagnosis = { delivered?: number; target?: number | null; short?: boolean; zero?: boolean; widened_to?: number | null; pinned?: boolean; binding?: { label: string; dropped: number }[] };
type Coach = { diagnosis: Diagnosis; levers: Lever[] };
interface Message { id: number; role: string; content: string; created_at: string; meta?: { suggestions?: string[]; levers?: Lever[]; diagnosis?: Diagnosis } }
interface RunEvent { ts: string; type: string; label: string; detail?: string; credits?: number }
// Live-progress overlay: opportunities already found this run (before assemble writes
// the authoritative bob_rows). Rendered as provisional rows; never persisted client-side.
interface OppRow { id: number; company_norm: string; status: string; reject_reason?: string; fit_score?: number | null; cells: Record<string, unknown> }
interface Run {
  id: number; status: string; events: RunEvent[];
  counters: Record<string, number>; credits_used: number; answer: string;
  tables?: BobTable[];
  opportunities?: { table_id: number | null; rows: OppRow[] };
}
interface BobColumn { key: string; label: string }
interface BobRow { id: number; cells: Record<string, unknown>; status: string }
interface BobTable { id: number; name: string; columns: BobColumn[]; rows: BobRow[] }

const ROW_STATUSES = ["new", "contacted", "replied", "meeting", "dead"] as const;
const STATUS_STYLE: Record<string, string> = {
  new: "bg-neutral-100 text-neutral-600 border-neutral-300",
  contacted: "bg-blue-50 text-blue-700 border-blue-300",
  replied: "bg-green-50 text-green-700 border-green-300",
  meeting: "bg-violet-50 text-violet-700 border-violet-300",
  dead: "bg-neutral-100 text-neutral-400 border-neutral-200 line-through",
};

const COLUMN_PRIORITY = [
  "company", "student", "contact_name", "contact_title", "tier", "fit_score", "best_fit_students", "city",
  "hiring_evidence", "why_now", "what_they_do", "size_band", "funding",
  "website", "evidence_url", "linkedin_url", "contact_linkedin_url",
];
const WIDE_KEYS = new Set(["hiring_evidence", "why_now", "what_they_do", "funding", "outreach_angle", "suggested_opening", "connection_point", "signal_rationale", "best_fit_students"]);

function orderColumns(cols: BobColumn[]): BobColumn[] {
  return [...cols].sort((a, b) => {
    const ia = COLUMN_PRIORITY.indexOf(a.key);
    const ib = COLUMN_PRIORITY.indexOf(b.key);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

function prettify(s: string): string {
  return s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// The new look keeps a label's own capitals: "Matches by student", "Why it fits", not "Matches By Student".
function sentence(s: string): string {
  const t = s.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}

function columnLabel(c: BobColumn, ui: Ui): string {
  if (ui !== "new") return prettify(c.label || c.key);
  // the badge in the cell already says what scale it is on
  if (c.key === "fit_score") return "Fit";
  return sentence(c.label || c.key);
}

const ACRONYMS = /\b(qa|hr|ui|ux|ai|ml|sde|sdet|it|bi|cto|ceo|fde|qe|ios|api|sql)\b/gi;

// A chat is named after its first message, so its name was often a raw link or "[Attached: file.xlsx] ..."
// text. The new look names it the way a person would: the request without the attachment marker, a
// LinkedIn profile as the person, a Naukri listing as its role. The stored title is unchanged (Rename
// still starts from it).
function chatLabel(raw: string): string {
  let t = String(raw || "").replace(/\s+/g, " ").trim();
  // the server names a chat after the first 70 characters of its first message, mid-word if need be
  const cut = String(raw || "").length >= 70;
  const att = t.match(/^\[Attached:\s*([^\]]*)(?:\]\s*|$)/i);
  if (att) {
    const rest = t.slice(att[0].length).trim();
    t = rest && !/^Analy[sz]e the attached file/i.test(rest)
      ? rest : att[1].split(/,\s*/)[0].replace(/\.[a-z0-9]{2,5}$/i, "");
  }
  const link = t.match(/^(?:https?:\/\/)?(?:www\.)?((?:[a-z0-9-]+\.)+[a-z]{2,})(\/[^\s]*)?/i);
  if (link && (/^(https?:\/\/|www\.)/i.test(t) || link[2])) {
    const host = link[1].toLowerCase();
    const path = link[2] || "";
    const rest = t.slice(link[0].length).trim();
    const words = (slug: string) => {
      let w = slug;
      try { w = decodeURIComponent(slug); } catch { /* keep it as it is */ }
      return w.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
        .replace(/\b\w/g, (c) => c.toUpperCase()).replace(ACRONYMS, (a) => a.toUpperCase());
    };
    const person = host.endsWith("linkedin.com") ? path.match(/^\/in\/([^/?#]+)/) : null;
    const listing = host.endsWith("naukri.com") ? path.match(/job-listings-([^/?#]+)/) : null;
    if (person) return `${words(person[1].replace(/-?\d+$/, ""))} on LinkedIn`;
    if (listing) t = `Naukri: ${words(listing[1].replace(/-\d{6,}$/, "").replace(/-\d+-to-\d+-years?$/, ""))}`;
    else t = rest ? `${rest} (${host})` : host;
  }
  if (!t) return String(raw || "");
  return t[0].toUpperCase() + t.slice(1) + (cut && !/[.!?…)]$/.test(t) ? "…" : "");
}

// A link as a person reads it: the site and the start of the path, not 200 characters of query string.
function shortUrl(u: string): string {
  try {
    const x = new URL(u);
    const path = x.pathname.replace(/\/+$/, "");
    const tail = path.length > 28 ? `${path.slice(0, 27)}…` : path;
    return x.hostname.replace(/^www\./, "") + tail;
  } catch {
    return u;
  }
}

// A person's name opening a line of a mapping ("Ishita Rao, Steps, AI Engineer; Prodigal, ...").
const LEAD_NAME = /^([A-Z][\p{L}'.-]*(?: [A-Z][\p{L}'.-]*){0,3})(,)\s/u;
const MAPPING_LINE = /^[A-Z][\p{L}'.-]*(?: [A-Z][\p{L}'.-]*){0,3}, [^;\n]+;/u;

// **bold** and bare links inside one line of an answer.
function inlineRich(s: string, lead: false | "list" | "name" = false): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let text = s;
  // A list of "Name, details" or "Name: details" items, or the paragraphs of a student-by-student mapping:
  // the name leads in bold, so the answer can be scanned.
  if (lead) {
    const m = text.match(lead === "list" ? /^([^,:;()*]{2,48})([,:])\s/ : LEAD_NAME);
    if (m) { out.push(<strong key="lead">{m[1]}</strong>, m[2] + " "); text = text.slice(m[0].length); }
  }
  const re = /\*\*([^*\n]+)\*\*|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'")\]])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={`b${m.index}`}>{m[1]}</strong>);
    else out.push(<a key={`a${m.index}`} href={m[2]} target="_blank" rel="noreferrer" title={m[2]}>{shortUrl(m[2])}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// One answer as a person reads it (new look): paragraphs, "- " and "1." lines as real lists, bold, links.
function RichText({ text, leadNames = false }: { text: string; leadNames?: boolean }) {
  type List = { ordered: boolean; items: string[] };
  const blocks: React.ReactNode[] = [];
  let para: string[] = [];
  let list: List | null = null;
  const flushPara = () => {
    const body = para.join("\n").trim();
    if (body) blocks.push(<p key={blocks.length} className="whitespace-pre-wrap">{inlineRich(body, leadNames ? "name" : false)}</p>);
    para = [];
  };
  const flushList = () => {
    const l = list as List | null;
    if (l) {
      const lead = l.items.length >= 2;
      const items = l.items.map((it, i) => <li key={i}>{inlineRich(it, lead ? "list" : false)}</li>);
      blocks.push(l.ordered ? <ol key={blocks.length}>{items}</ol> : <ul key={blocks.length}>{items}</ul>);
    }
    list = null;
  };
  for (const ln of text.split("\n")) {
    const item = ln.match(/^\s*(?:([-•*])|(\d{1,2})[.)])\s+(.*)$/);
    if (item) {
      flushPara();
      const ordered = !item[1];
      if (!list || list.ordered !== ordered) { flushList(); list = { ordered, items: [] }; }
      list.items.push(item[3]);
      continue;
    }
    if (!ln.trim()) { flushPara(); flushList(); continue; }
    if (list && /^\s{2,}\S/.test(ln)) { list.items[list.items.length - 1] += ` ${ln.trim()}`; continue; }
    flushList();
    para.push(ln);
  }
  flushPara();
  flushList();
  return <div className="sx-rich space-y-2.5 break-words [overflow-wrap:anywhere]">{blocks}</div>;
}

// What the person sent (new look): attached files as chips, not "[Attached: a.pdf, b.png]" text (the composer
// writes that marker into the message), and a long brief folded to its first lines so it does not push the
// answer off the screen.
function UserBubble({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const att = text.match(/^\s*\[Attached:\s*([^\]]*)\]\s*/i);
  const files = att ? att[1].split(/,\s*/).map((f) => f.trim()).filter(Boolean) : [];
  let body = (att ? text.slice(att[0].length) : text).trim();
  if (files.length && /^Analy[sz]e the attached file\(s\) and proceed\.?$/i.test(body)) body = "";
  const long = body.length > 560 || body.split("\n").length > 9;
  return (
    <div className="sx-user max-w-[85%] px-4 py-3 rounded-2xl border leading-relaxed">
      {files.length > 0 && (
        <div className={`flex flex-wrap gap-1.5 ${body ? "mb-2" : ""}`}>
          {files.map((f, i) => (
            <span key={i} className="sx-file" title={f}><FiFile size={13} /><span className="truncate">{f}</span></span>
          ))}
        </div>
      )}
      {body && (
        <div className={`sx-rich-inline whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${long && !open ? "line-clamp-6" : ""}`}>{inlineRich(body)}</div>
      )}
      {long && (
        <button onClick={() => setOpen((o) => !o)} className="sx-more mt-1.5">{open ? "Show less" : "Show the full message"}</button>
      )}
    </div>
  );
}

// A phone number as people read it (new look): +91 98508 53999, +1 214-354-9833. Other countries stay as
// written. Links keep the raw number.
function formatPhone(p: string): string {
  const raw = String(p || "").trim();
  const d = raw.replace(/[^\d+]/g, "");
  if (/^\+91\d{10}$/.test(d)) return `+91 ${d.slice(3, 8)} ${d.slice(8)}`;
  if (/^\+1\d{10}$/.test(d)) return `+1 ${d.slice(2, 5)}-${d.slice(5, 8)}-${d.slice(8)}`;
  return raw;
}

// A person's name in their own capitals, unless the source wrote it all lower or all upper case ("pranav hegde").
function personName(s: string): string {
  const t = String(s || "").trim();
  if (!t || (/[a-z]/.test(t) && /[A-Z]/.test(t))) return t;
  return t.toLowerCase().replace(/(^|[\s'.-])(\p{L})/gu, (_m, a: string, b: string) => a + b.toUpperCase());
}

// A fit score on either scale (8.6 of 10, 86 of 100) in one style: one decimal or a whole number.
function fitText(n: number): string {
  return n > 10 ? String(Math.round(n)) : n.toFixed(1);
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" aria-label={`Copy ${label}`} title={`Copy ${label}`}
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className="sx-copy w-6 h-6 shrink-0 rounded-md inline-flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100">
      {done ? <FiCheck size={12} className="text-green-600" /> : <FiCopy size={12} />}
    </button>
  );
}

// Domains that are never a company's own website (LinkedIn, job boards).
const NON_SITE_DOMAINS = /linkedin\.com|naukri\.com|indeed\.com|wellfound\.com|greenhouse\.io|lever\.co|ashbyhq\.com|glassdoor\./i;

function domainOf(v: string): string {
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return v;
  }
}

// Known-dead link patterns from logged-out LinkedIn HTML: anonymized company
// placeholder, signup redirect wrappers, shorteners. Never render as chips.
const GARBAGE_URL = /linkedin\.com\/(company|school)\/unavailable|linkedin\.com\/signup|\/cold-join|linkedin\.com\/authwall|lnkd\.in\//i;

// Extract every valid URL from a cell. The agent occasionally packed several
// links into one field; each must be its own working chip, never one mangled href.
function extractUrls(s: string): string[] {
  return (s.match(/https?:\/\/[^\s;,)"']+/g) || [])
    .map((u) => u.replace(/[.,;]+$/, ""))
    .filter((u) => !GARBAGE_URL.test(u));
}

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return typeof v === "object" ? JSON.stringify(v) : String(v);
}

// ── Two looks, one workspace ─────────────────────────────────────────────────
// This file draws the ORIGINAL look (hard outlines, offset shadows) unless a route
// hands it ui="new". The new look is the same markup with the stylesheet SX_CSS
// laid over it: no second copy of the workspace, so the two can never drift apart
// and going back is a one-line change. Which host gets which look is decided in
// app/lib/sensei-ui.ts (a route passes the answer in); nothing here reads the host,
// so this file stays safe to promote on its own and production keeps the original.
// <host>/oldui (app/routes/oldui.tsx) always shows the original.
// Class names starting "sx-" in the markup are hooks for that stylesheet; they
// do nothing in the original look.
type Ui = "new" | "old";
const UiContext = createContext<Ui>("old");

// Links written into the address bar, and the link to the team dashboard, stay under
// the path the page was opened on, so a refresh on /oldui keeps the original look.
function homePath(): string {
  try {
    // Lower-cased: the router matches paths without regard to case.
    return window.location.pathname.replace(/\/+$/, "").toLowerCase() === "/oldui" ? "/oldui" : "/";
  } catch {
    return "/";
  }
}

// Sensei's face. The original look uses the Studojo doodle; the new look uses the
// Sensei mark (the kasa: hat and brim over the signal dot), drawn inline.
function SenseiMark() {
  if (useContext(UiContext) !== "new") return <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />;
  return (
    <svg viewBox="0 0 120 120" fill="none" role="img" aria-label="Sensei" className="sx-mark w-full h-full">
      <g transform="translate(11,12) scale(0.82)">
        <path d="M60 10 C52 15 38 29 26 45 C21 52 15 60 11 66 C27 61 42 59 60 59 C78 59 93 61 109 66 C105 60 99 52 94 45 C82 29 68 15 60 10 Z" fill="#16161E" />
        <path d="M4 68 C24 61 42 58 60 58 C78 58 96 61 116 68 C112 77 94 83 60 83 C26 83 8 77 4 68 Z" fill="#16161E" />
        <circle cx="60" cy="99" r="8.5" fill="#5B63E8" />
      </g>
    </svg>
  );
}

// The chat options menu in the new look is fixed to the window, so the scrolling chat list
// cannot clip it: under its row's button, or above it when there is no room below. (The
// original look keeps the menu inside the list.) Six items at most, about 220px.
const SX_MENU_W = 224, SX_MENU_H = 240;
function sxMenuPlacement(r: DOMRect): { top?: number; bottom?: number; left: number } {
  const left = Math.max(8, Math.min(r.right - SX_MENU_W, window.innerWidth - SX_MENU_W - 8));
  return r.bottom + 4 + SX_MENU_H > window.innerHeight - 8
    ? { bottom: window.innerHeight - r.top + 4, left }
    : { top: r.bottom + 4, left };
}

/* sx:start */
const SX_CSS = `
/* sx:shared:start (this block is identical in bob.tsx and dashboard.tsx) */
/* The new Sensei look (first shown at studojo.com/sensei-demo), laid over the
   page's own markup. Everything is scoped to .sx, which only exists when a
   route asks for ui="new", so the original look is untouched by this sheet.
   Tailwind's utilities live in a cascade layer; this sheet does not, so its rules
   win without !important. A hover or focus state therefore has to be restated
   here whenever its resting state is. Class names that hold brackets or colons
   are matched as whole words: [class~="bg-[#faf7f2]"]. */

@font-face { font-family: 'Geist'; font-weight: 400; font-style: normal; font-display: swap; src: url('/fonts/geist-400.woff2') format('woff2'); }
@font-face { font-family: 'Geist'; font-weight: 500; font-style: normal; font-display: swap; src: url('/fonts/geist-500.woff2') format('woff2'); }
@font-face { font-family: 'Geist'; font-weight: 600; font-style: normal; font-display: swap; src: url('/fonts/geist-600.woff2') format('woff2'); }
@font-face { font-family: 'Geist'; font-weight: 700; font-style: normal; font-display: swap; src: url('/fonts/geist-700.woff2') format('woff2'); }
@font-face { font-family: 'JetBrains Mono'; font-weight: 400; font-style: normal; font-display: swap; src: url('/fonts/jetbrains-mono-400.woff2') format('woff2'); }
@font-face { font-family: 'JetBrains Mono'; font-weight: 500; font-style: normal; font-display: swap; src: url('/fonts/jetbrains-mono-500.woff2') format('woff2'); }

/* ── tokens ── */
.sx {
  --bg: #FBFBFD; --bg2: #F4F4F9; --surface: #FFFFFF; --track: #E9EAF2;
  --ink: #16161E; --t1: #2A2B36; --t2: #585B6C; --t3: #686B7D; --t4: #8E91A3;
  --line: rgba(22,22,40,.09); --line2: rgba(22,22,40,.15);
  --acc: #5B63E8; --acc-deep: #4148C6; --acc-soft: #EEEFFE; --acc-soft2: #E3E5FD; --acc-line: rgba(91,99,232,.28); --acc-lite: #9AA2FF;
  --mint: #1E9E6E; --mint-ink: #157A54; --mint-soft: #E7F8F0; --mint-line: rgba(30,158,110,.3);
  --amber: #B4801E; --amber-ink: #8A5F0E; --amber-soft: #FBF0DA; --amber-line: rgba(180,128,30,.35);
  --blue: #2F6FD6; --blue-ink: #2A62BF; --blue-soft: #EAF1FD; --blue-line: rgba(47,111,214,.28);
  --red: #C2412F; --red-soft: #FCEDEA; --red-line: rgba(194,65,47,.4);
  --btn: #16161E; --btn-ink: #FFFFFF; --btn-hover: #2A2B36; --thumb: #FFFFFF; --hov: #F4F4F9;
  --acc-fill: #5B63E8; --acc-fill-h: #4148C6; --red-fill: #C2412F;
  --scrim: rgba(22,22,30,.28);
  --sh-sm: 0 1px 2px rgba(18,20,45,.06), 0 1px 3px rgba(18,20,45,.05);
  --sh-md: 0 8px 24px -8px rgba(18,20,45,.14);
  --sh-lg: 0 32px 72px -28px rgba(18,20,45,.30);
  --dot: rgba(22,22,42,.05); --glow1: rgba(110,123,242,.14); --glow2: rgba(178,138,250,.11);
  --sans: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;
}
.sx .sx-dark {
  --bg: #0F1016; --bg2: #14151C; --surface: #191A23; --track: #2A2C39;
  --ink: #ECEDF3; --t1: #D9DBE6; --t2: #B1B4C4; --t3: #8A8D9E; --t4: #7E8195;
  --line: rgba(255,255,255,.08); --line2: rgba(255,255,255,.15);
  --acc: #7F87F6; --acc-deep: #A6ACFF; --acc-soft: rgba(127,135,246,.15); --acc-soft2: rgba(127,135,246,.24); --acc-line: rgba(127,135,246,.4); --acc-lite: #A6ACFF;
  --mint: #4FCB9C; --mint-ink: #4FCB9C; --mint-soft: rgba(79,203,156,.13); --mint-line: rgba(79,203,156,.35);
  --amber: #E2B55F; --amber-ink: #E2B55F; --amber-soft: rgba(226,181,95,.14); --amber-line: rgba(226,181,95,.38);
  --blue: #86AEF3; --blue-ink: #86AEF3; --blue-soft: rgba(134,174,243,.14); --blue-line: rgba(134,174,243,.36);
  --red: #F18F80; --red-soft: rgba(241,143,128,.14); --red-line: rgba(241,143,128,.45);
  --btn: #ECEDF3; --btn-ink: #14151C; --btn-hover: #FFFFFF; --thumb: #2E3040; --hov: #262733;
  --acc-fill: #5B63E8; --acc-fill-h: #4F57DA; --red-fill: #C2412F;
  --scrim: rgba(0,0,0,.55);
  --sh-sm: 0 1px 2px rgba(0,0,0,.4); --sh-md: 0 10px 28px -10px rgba(0,0,0,.6); --sh-lg: 0 32px 72px -24px rgba(0,0,0,.75);
  --dot: rgba(255,255,255,.055); --glow1: rgba(127,135,246,.16); --glow2: rgba(178,138,250,.09);
  color-scheme: dark;
}

/* ── type ── */
.sx [class~="font-['Satoshi']"] { font-family: var(--sans); letter-spacing: -.011em; -webkit-font-smoothing: antialiased; }
.sx [class~="font-['Clash_Display']"] { font-family: var(--sans); letter-spacing: -.022em; }
.sx [class~="font-['Clash_Display']"].tabular-nums, .sx .tabular-nums.font-black { font-family: var(--mono); letter-spacing: 0; }
.sx .font-semibold { font-weight: 500; }
.sx .font-bold { font-weight: 600; }
.sx .font-black { font-weight: 700; }
.sx h1.font-semibold, .sx h2.font-semibold, .sx h3.font-bold, .sx [class~="font-['Clash_Display']"].font-semibold { font-weight: 600; }
.sx svg[stroke="currentColor"] { stroke-width: 1.8; }
.sx code, .sx pre, .sx .font-mono { font-family: var(--mono); }
.sx a[href^="tel:"], .sx a[href^="mailto:"] { font-family: var(--mono); font-weight: 400; }
.sx ::selection { background: rgba(91,99,232,.2); }
/* Type floor. The markup was sized for a heavier face at 9-11px; in Geist those sizes are hard to read, so
   nothing a person has to read goes under 11px, and the 11px line becomes 12. */
.sx [class~="text-[9px]"], .sx [class~="text-[10px]"] { font-size: 11px; }
.sx [class~="text-[10.5px]"] { font-size: 11.5px; }
.sx [class~="text-[11px]"], .sx [class~="text-[11.5px]"] { font-size: 12px; }

/* ── surfaces ── */
.sx [class~="bg-[#faf7f2]"] { background-color: var(--bg); }
.sx [class~="bg-[#f4f0e8]"] { background-color: var(--bg2); }
.sx .bg-white { background-color: var(--surface); }
.sx .bg-neutral-50, .sx [class~="bg-neutral-50/70"], .sx .bg-neutral-100 { background-color: var(--bg2); }
.sx .bg-neutral-200, .sx .bg-neutral-300 { background-color: var(--track); }
.sx .bg-neutral-900 { background-color: var(--btn); color: var(--btn-ink); }
.sx [class~="bg-black/40"] { background-color: var(--scrim); }
.sx [class~="bg-neutral-900/20"] { background-color: rgba(22,22,30,.18); }
.sx .bg-violet-50, .sx [class~="bg-violet-50/60"] { background-color: var(--acc-soft); }
.sx .bg-violet-100 { background-color: var(--acc-soft2); }
.sx .bg-violet-400 { background-color: var(--acc-lite); }
.sx .bg-violet-500, .sx .bg-violet-600 { background-color: var(--acc-fill); }
.sx .bg-violet-700 { background-color: var(--btn); color: var(--btn-ink); }
.sx .bg-green-50, .sx .bg-green-100 { background-color: var(--mint-soft); }
.sx .bg-green-300 { background-color: var(--mint-soft); color: var(--mint-ink); }
.sx .bg-green-400, .sx .bg-green-500 { background-color: var(--mint); }
.sx .bg-amber-50, .sx .bg-amber-100 { background-color: var(--amber-soft); }
.sx .bg-amber-200 { background-color: var(--amber-soft); color: var(--amber-ink); }
.sx .bg-blue-50 { background-color: var(--blue-soft); }
.sx .bg-red-50 { background-color: var(--red-soft); }
.sx .bg-red-600 { background-color: var(--red-fill); }

/* ── text ── */
.sx .text-neutral-900 { color: var(--ink); }
.sx .text-neutral-800, .sx .text-neutral-700 { color: var(--t1); }
.sx .text-neutral-600, .sx .text-neutral-500 { color: var(--t2); }
.sx .text-neutral-400 { color: var(--t3); }
.sx .text-neutral-300 { color: var(--t4); }
.sx .text-neutral-100 { color: #ECEDF3; }
.sx .text-violet-400 { color: var(--acc-lite); }
/* Words use the deeper shade so they stay readable on a tint of the same colour; icons keep the brighter one. */
.sx .text-violet-500, .sx svg.text-violet-600 { color: var(--acc); }
.sx .text-violet-600, .sx .text-violet-700, .sx .text-violet-800 { color: var(--acc-deep); }
.sx .text-green-600, .sx .text-green-700, .sx .text-green-800 { color: var(--mint-ink); }
.sx svg.text-green-600 { color: var(--mint); }
.sx .text-amber-600, .sx .text-amber-700, .sx .text-amber-800 { color: var(--amber-ink); }
.sx .text-blue-700 { color: var(--blue-ink); }
.sx .text-red-400, .sx .text-red-600, .sx .text-red-700 { color: var(--red); }

/* ── lines: one soft hairline instead of the 2px ink outline ── */
.sx .border-2 { border-width: 1px; }
.sx .border-b-2 { border-bottom-width: 1px; }
.sx .border-t-2 { border-top-width: 1px; }
.sx .border-r-2 { border-right-width: 1px; }
.sx .border-l-2 { border-left-width: 1px; }
.sx .border-r-0 { border-right-width: 0; }
.sx .border-neutral-900 { border-color: var(--line2); }
.sx .border-neutral-100, .sx .border-neutral-200 { border-color: var(--line); }
.sx .border-neutral-300 { border-color: var(--line2); }
.sx .border-transparent { border-color: transparent; }
.sx .border-violet-200, .sx .border-violet-300 { border-color: var(--acc-line); }
.sx .border-violet-500 { border-color: var(--acc); }
.sx .border-green-300 { border-color: var(--mint-line); }
.sx .border-amber-300, .sx .border-amber-500 { border-color: var(--amber-line); }
.sx .border-blue-200, .sx .border-blue-300 { border-color: var(--blue-line); }
.sx .border-red-300, .sx .border-red-500 { border-color: var(--red-line); }
.sx aside.border-neutral-900, .sx header.border-neutral-900, .sx .h-12.border-neutral-900, .sx th.border-neutral-900 { border-color: var(--line); }

/* ── depth: soft shadows instead of the hard offset ones ── */
.sx [class*=" shadow-[2px_2px"], .sx [class*=" shadow-[3px_3px"], .sx [class^="shadow-[3px_3px"] { box-shadow: var(--sh-sm); }
.sx [class*=" shadow-[4px_4px"] { box-shadow: var(--sh-md); }
.sx [class*=" shadow-[6px_6px"], .sx [class*=" shadow-[8px_8px"] { box-shadow: var(--sh-lg); }
.sx [class*="hover:shadow-[2px_2px"]:hover { box-shadow: var(--sh-md); }
.sx [class*="hover:translate-x-"]:hover { translate: 0 -1px; }

/* ── radii ── */
.sx [class~="rounded-[24px]"], .sx [class~="rounded-[28px]"], .sx [class~="rounded-[32px]"] { border-radius: 20px; }
.sx :where(button.rounded-xl:not(.text-left, .w-9, .w-8, .w-7), a.rounded-xl) { border-radius: 999px; }

/* ── states restated: hover, focus, disabled ── */
.sx [class~="hover:bg-neutral-100"]:hover, .sx [class~="hover:bg-neutral-50"]:hover { background-color: var(--hov); }
.sx [class~="hover:bg-black/5"]:hover { background-color: var(--line); }
.sx [class~="hover:text-neutral-900"]:hover { color: var(--ink); }
.sx [class~="hover:text-neutral-700"]:hover { color: var(--t1); }
.sx [class~="hover:text-white"]:hover { color: #fff; }
.sx [class~="hover:border-neutral-900"]:hover, .sx [class~="hover:border-neutral-400"]:hover { border-color: var(--t3); }
.sx [class~="hover:border-violet-500"]:hover, .sx [class~="hover:border-violet-400"]:hover { border-color: var(--acc); }
.sx [class~="hover:border-[#0a66c2]"]:hover { border-color: #0a66c2; }
.sx [class~="hover:bg-violet-50"]:hover, .sx [class~="hover:bg-violet-100"]:hover { background-color: var(--acc-soft); }
.sx [class~="hover:bg-violet-600"]:hover, .sx [class~="hover:bg-violet-500"]:hover { background-color: var(--acc-fill-h); }
.sx [class~="hover:bg-violet-700"]:hover, .sx [class~="hover:bg-violet-800"]:hover, .sx [class~="hover:bg-neutral-900"]:hover { background-color: var(--btn-hover); color: var(--btn-ink); }
.sx [class~="hover:text-violet-600"]:hover, .sx [class~="hover:text-violet-700"]:hover, .sx [class~="hover:text-violet-800"]:hover { color: var(--acc-deep); }
/* a link that is already the deep accent at rest has nothing darker to go to: it underlines instead */
.sx .text-violet-600[class~="hover:text-violet-800"]:hover, .sx .text-violet-700[class~="hover:text-violet-800"]:hover { text-decoration: underline; text-underline-offset: 3px; }
.sx [class~="hover:text-red-600"]:hover, .sx [class~="hover:text-red-700"]:hover { color: var(--red); }
.sx .group:hover [class~="group-hover:text-violet-700"] { color: var(--acc-deep); }
.sx [class~="hover:bg-red-50"]:hover { background-color: var(--red-soft); }
.sx [class~="hover:bg-red-700"]:hover { background-color: var(--red-fill); filter: brightness(.92); }
.sx [class~="hover:bg-green-100"]:hover { background-color: var(--mint-soft); filter: brightness(.97); }
.sx [class~="hover:bg-amber-100"]:hover { background-color: var(--amber-soft); filter: brightness(.97); }
.sx [class~="focus:ring-2"]:focus { border-color: var(--acc); box-shadow: 0 0 0 4px var(--acc-soft); }
.sx button:focus-visible, .sx a:focus-visible { outline: 2px solid var(--acc); outline-offset: 2px; }
.sx input, .sx textarea, .sx select { color: var(--ink); }
.sx input::placeholder, .sx textarea::placeholder { color: var(--t3); }
.sx .sx-dark input::placeholder, .sx .sx-dark textarea::placeholder { color: var(--t4); }
.sx input.border-2, .sx textarea.border-2 { background-color: var(--surface); border-radius: 12px; }
/* the native "Choose file" button, in the pill style of the other buttons */
.sx input[type="file"]::file-selector-button { border: 1px solid var(--line2); border-radius: 999px; background: var(--surface); color: var(--ink); font-family: var(--sans); font-weight: 500; font-size: 13px; padding: 7px 14px; margin-right: 12px; cursor: pointer; }
.sx input[type="file"]::file-selector-button:hover { border-color: var(--t3); }
.sx .bob-thinscroll::-webkit-scrollbar-thumb { background: var(--line2); }

/* ── Sensei's mark sits on a white tile ── */
.sx :has(> .sx-mark) { background: #fff; border-color: var(--line); box-shadow: var(--sh-sm); }

/* ── sign in and reset ── */
.sx .min-h-screen[class~="bg-[#faf7f2]"] { background-color: var(--bg); background-image: radial-gradient(640px 420px at 50% -120px, var(--glow1), transparent 70%); }
.sx .min-h-screen .max-w-md { border-color: var(--line); }
.sx .min-h-screen input.rounded-2xl { border-radius: 12px; }
.sx .min-h-screen button[class~="py-3"].bg-violet-500 { background-color: var(--btn); color: var(--btn-ink); border-color: transparent; border-radius: 999px; box-shadow: none; font-weight: 500; }
.sx .min-h-screen button[class~="py-3"].bg-violet-500:not(:disabled):hover { background-color: var(--btn-hover); translate: 0 -1px; box-shadow: 0 10px 24px -12px rgba(18,20,45,.55); }

/* disabled primary buttons fade, as in the demo, instead of turning into a grey button */
.sx .min-h-screen button[class~="py-3"].bg-violet-500:disabled, .sx .fixed.inset-0 button.rounded-xl.bg-violet-700:disabled { opacity: .35; }

/* ── dialogs ── */
.sx .fixed.inset-0 > .bg-white.border-2 { border-color: var(--line); }
.sx .fixed.inset-0 button.rounded-xl.border-2.border-neutral-300 { color: var(--t2); }
.sx .fixed.inset-0 button.rounded-xl.border-2.border-neutral-300:hover { color: var(--ink); border-color: var(--t3); }
.sx .fixed.inset-0 button.rounded-xl.bg-violet-700 { border-color: transparent; font-weight: 500; }
.sx .fixed.inset-0 button.rounded-xl.bg-red-600 { border-color: transparent; color: #fff; font-weight: 500; }
.sx .fixed.inset-0 button.text-left.rounded-xl.border-2 { border-radius: 12px; }
.sx .fixed.inset-0 button.text-left.rounded-xl.border-2.bg-violet-100 { border-color: var(--acc); background-color: var(--acc-soft); }

@media (prefers-reduced-motion: reduce) { .sx * { transition: none !important; } }

/* The "Skip to main content" link (app/root.tsx) sits outside the .sx wrapper, so the tokens are not
   visible to it: literal values. :has(> .sx) keeps it to the pages in the new look. */
body:has(> .sx) > a[href="#main"]:focus { font-family: 'Geist', -apple-system, sans-serif; font-weight: 500; color: #16161E; background: #fff; border: 1px solid rgba(22,22,40,.15); border-radius: 999px; box-shadow: 0 8px 24px -8px rgba(18,20,45,.14); outline: 2px solid #5B63E8; outline-offset: 2px; }
/* sx:shared:end */

/* ── the conversation surface: a quiet dot grid with two soft glows ── */
.sx .bob-canvas { background-color: var(--bg); background-image: radial-gradient(var(--dot) 1px, transparent 1px); background-size: 24px 24px; background-position: 0 0; }
.sx .bob-canvas::before { inset: 0 0 auto 0; height: 420px; background: radial-gradient(640px 380px at 20% -80px, var(--glow1), transparent 65%), radial-gradient(560px 360px at 95% -60px, var(--glow2), transparent 65%); }

/* ── sidebar ── */
.sx aside { border-color: var(--line); }
.sx aside .h-12, .sx header.h-12 { height: 56px; }
.sx aside .h-12 { border-bottom-color: transparent; padding-left: 16px; }
.sx aside .h-12.border-neutral-900 { border-bottom-color: transparent; }
.sx aside .h-12 .text-base { font-size: 15px; font-weight: 600; }
.sx aside .h-12 [class~="text-[9px]"] { font-size: 11px; margin-top: 3px; }
.sx aside .p-2 > button.bg-neutral-900 { padding-top: 10px; padding-bottom: 10px; font-weight: 500; transition: translate .15s, box-shadow .15s, background-color .15s; }
.sx aside .p-2 > button.bg-neutral-900:hover { translate: 0 -1px; box-shadow: 0 10px 24px -12px rgba(18,20,45,.55); }
.sx aside .uppercase.tracking-wider { font-size: 11px; letter-spacing: .07em; color: var(--t3); padding-right: 7px; }
.sx aside .uppercase.tracking-wider > .normal-case { padding-right: 5px; }
.sx aside .uppercase.tracking-wider .normal-case { font-family: var(--mono); color: var(--t3); font-weight: 400; }
.sx aside .rounded-xl.border-2:not([role="menu"]) { border-color: transparent; border-radius: 10px; color: var(--t2); }
.sx aside .rounded-xl.border-2.bg-violet-100 { background-color: var(--acc-soft); color: var(--ink); }
.sx aside .rounded-xl.border-2 [class~="text-[10.5px]"] { color: var(--acc-deep); }
.sx aside .rounded-xl.border-2 span.block.truncate, .sx aside button.rounded-xl.border-2 > span.flex-1 { font-size: 13px; font-weight: 500; }
/* the footer actions become quiet rows */
.sx aside .space-y-2 { border-color: var(--line); }
.sx aside .space-y-2 > a.rounded-xl, .sx aside .space-y-2 > button.rounded-xl { justify-content: flex-start; border-color: transparent; border-radius: 10px; padding: 8px 10px; font-size: 13px; font-weight: 400; color: var(--t2); background: none; }
.sx aside .space-y-2 > a.rounded-xl:hover, .sx aside .space-y-2 > button.rounded-xl:hover { background-color: var(--hov); color: var(--ink); }
.sx aside .space-y-2 > button.bg-violet-600, .sx aside .space-y-2 > button.rounded-xl.bg-violet-600 { background-color: var(--acc-soft); color: var(--acc-deep); font-weight: 500; }
.sx aside .space-y-2 > button.bg-violet-600:hover { background-color: var(--acc-soft2); color: var(--acc-deep); }

/* ── top bar ── */
.sx header { border-color: var(--line); padding-left: 16px; padding-right: 16px; gap: 10px; }
.sx header > .text-sm.font-bold { font-size: 14.5px; font-weight: 500; }
.sx header .rounded-full { font-weight: 500; }
/* credit counters */
.sx header .relative > button.rounded-full { font-family: var(--mono); font-size: 11.5px; font-weight: 600; padding: 6px 12px; gap: 7px; border-color: var(--line); background-color: var(--surface); color: var(--ink); }
.sx header .relative > button.rounded-full:hover { background-color: var(--hov); }
.sx header .relative > button.rounded-full svg { color: var(--t3); }
.sx header .relative > button.rounded-full .font-medium { font-weight: 400; color: var(--t2); }
.sx header .relative > button.rounded-full.bg-red-50 { background-color: var(--red-soft); border-color: var(--red-line); color: var(--red); }
/* segmented switches (Chat / Split / Results, Cards / Table) */
.sx .sx-seg { background-color: var(--bg2); border-color: var(--line); border-radius: 999px; padding: 3px; gap: 2px; overflow: visible; }
.sx .sx-seg > button { width: 34px; height: 28px; border-radius: 999px; background-color: transparent; color: var(--t3); }
.sx .sx-seg > button:hover { background-color: transparent; color: var(--ink); }
.sx .sx-seg > button.bg-neutral-900, .sx .sx-seg > button.bg-neutral-900:hover { background-color: var(--thumb); color: var(--ink); box-shadow: var(--sh-sm); }
/* the notice strip */
.sx .bg-red-50.border-red-500 { border-color: var(--red-line); font-weight: 500; }

/* ── chat ── */
/* the person's own words sit on a soft tint of the accent: a black slab outweighed every answer on the page */
.sx .sx-user { background-color: var(--you); color: var(--ink); border-color: var(--you-line); border-width: 1px; border-radius: 18px 18px 6px 18px; box-shadow: none; font-size: 15px; }
.sx .bob-canvas .rounded-tl-md { border-color: var(--line); border-radius: 6px 18px 18px 18px; }
.sx .bob-canvas .rounded-tl-md p { color: var(--t1); }
.sx .bob-canvas .rounded-tl-md p.text-neutral-400 { color: var(--t3); }
.sx .bob-canvas button.rounded-full[class~="hover:bg-violet-500"] { border-color: var(--line); color: var(--t2); font-weight: 400; padding: 8px 14px; }
.sx .bob-canvas button.rounded-full[class~="hover:bg-violet-500"]:hover { background-color: var(--acc-soft); border-color: var(--acc-line); color: var(--ink); }
.sx .bob-canvas > .border-t-2 { border-color: var(--line); background-color: color-mix(in srgb, var(--surface) 85%, transparent); backdrop-filter: blur(8px); }
.sx .sx-composer { border-color: var(--line2); border-radius: 18px; box-shadow: var(--sh-md); background-color: var(--surface); }
.sx .sx-composer:focus-within { border-color: var(--acc); box-shadow: 0 0 0 4px var(--acc-soft), var(--sh-md); }
.sx .sx-composer textarea { font-size: 15px; }
.sx .sx-composer button.w-9 { border-color: transparent; border-radius: 12px; }
.sx .sx-composer button.w-9.bg-white { background-color: transparent; color: var(--t3); }
.sx .sx-composer button.w-9.bg-white:hover { background-color: var(--hov); color: var(--ink); }
.sx .sx-composer button.w-9.bg-violet-700:not(:disabled):hover { translate: 0 -1px; }
/* the divider between chat and results: a hairline you can still grab */
/* z-index: above the results table's pinned cells (z-30), below dialogs (z-50) */
.sx .cursor-col-resize { background-color: var(--line); width: 1px; box-shadow: none; z-index: 35; }
.sx .cursor-col-resize::after { content: ""; position: absolute; top: 0; bottom: 0; left: -5px; right: -5px; }
.sx .cursor-col-resize:hover { background-color: var(--acc); }
.sx .cursor-col-resize > div { display: none; }

/* ── results ── */
.sx section[class~="bg-[#f4f0e8]"] > .h-12 { height: 52px; border-color: var(--line); }
/* the result tabs: a tab bar with full names (up to 280px) and an underline, not shrinking pills; "Matches by
   student" was cut to "M..." in the split view. The strip scrolls sideways when there are many. */
.sx button[class~="max-w-[150px]"] { max-width: 280px; flex-shrink: 0; align-self: stretch; border: 0; border-radius: 0; background-color: transparent; color: var(--t2); padding: 0 2px; gap: 7px; font-size: 13px; font-weight: 500; box-shadow: inset 0 -2px 0 transparent; }
.sx button[class~="max-w-[150px]"]:hover { color: var(--ink); background-color: transparent; }
.sx button[class~="max-w-[150px]"].bg-violet-500, .sx button[class~="max-w-[150px]"].bg-violet-500:hover { background-color: transparent; color: var(--ink); box-shadow: inset 0 -2px 0 var(--acc); }
.sx button[class~="max-w-[150px]"] > .sx-count { font-size: 11px; font-weight: 500; font-variant-numeric: tabular-nums; color: var(--t2); background-color: var(--bg2); border-radius: 999px; padding: 1px 7px; }
.sx button[class~="max-w-[150px]"].bg-violet-500 > .sx-count { color: var(--acc-deep); background-color: var(--acc-soft); }
.sx section[class~="bg-[#f4f0e8]"] > .h-12 button.rounded-xl { font-size: 12.5px; font-weight: 500; padding: 7px 13px; border-color: transparent; }
.sx section[class~="bg-[#f4f0e8]"] > .h-12 button.bg-neutral-100 { background-color: var(--bg2); color: var(--t3); }
.sx section[class~="bg-[#f4f0e8]"] > .h-12 button.rounded-xl.bg-neutral-900:hover { background-color: var(--btn-hover); translate: 0 -1px; }
/* the outcome card and its one-tap levers */
.sx section > .relative.border-b-2.bg-violet-50 { background: linear-gradient(90deg, var(--acc-soft), var(--surface)); border-color: var(--acc-line); }
.sx section > .relative.border-b-2.bg-amber-50 { background: linear-gradient(90deg, var(--amber-soft), var(--surface)); border-color: var(--amber-line); }
.sx section > .relative.border-b-2 .rounded-lg.border-2 { border-radius: 999px; padding: 6px 11px; font-weight: 500; border-color: var(--line2); box-shadow: none; }
.sx section > .relative.border-b-2 .rounded-lg.border-2:hover { border-color: var(--acc); box-shadow: none; }
/* company cards */
.sx .rounded-2xl.cursor-pointer[class*="shadow-[3px_3px"] { border-color: var(--line); transition: border-color .15s, box-shadow .15s, translate .15s; }
.sx .rounded-2xl.cursor-pointer[class*="shadow-[3px_3px"]:hover { border-color: var(--line2); box-shadow: var(--sh-md); translate: 0 -2px; }
.sx [class~="min-w-9"].h-9 { border-radius: 11px; font-family: var(--mono); font-weight: 600; background-color: var(--bg2); color: var(--t2); border-color: var(--line2); }
.sx [class~="min-w-9"].h-9.bg-green-300 { background-color: var(--mint-soft); color: var(--mint-ink); border-color: var(--mint-line); }
.sx [class~="min-w-9"].h-9.bg-amber-200 { background-color: var(--amber-soft); color: var(--amber-ink); border-color: var(--amber-line); }
.sx [class~="border-l-[3px]"] { border-radius: 0 10px 10px 0; }
.sx [class~="border-l-[3px]"] p { color: var(--t1); }
.sx select.rounded-lg { border-radius: 9px; font-weight: 600; }
.sx .rounded-md.border-2.bg-violet-100 { border-color: var(--acc-line); }
/* lookup buttons */
.sx button[title^="Find phone + email for this company"] { background-color: var(--acc-soft); color: var(--acc-deep); border-color: var(--acc-line); border-radius: 9px; }
.sx button[title^="Find phone + email for this company"]:hover { background-color: var(--acc-soft2); }
/* the wide table */
.sx thead th, .sx thead th[class~="bg-[#faf7f2]"] { font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--t2); background-color: var(--bg2); border-color: var(--line); }
.sx thead tr, .sx thead tr[class~="bg-[#faf7f2]"] { background-color: var(--bg2); }
.sx tbody tr.bg-neutral-50 { background-color: var(--surface); }
.sx tbody tr:hover, .sx tbody tr.bg-neutral-50:hover { background-color: var(--bg); }
.sx tbody td.sticky { border-color: var(--line); }
/* the detail drawer */
.sx [class~="max-w-[440px]"].absolute { border-color: var(--line); box-shadow: var(--sh-lg); }
.sx [class~="max-w-[440px]"] .border-b-2 { border-color: var(--line); }
.sx [class~="max-w-[440px]"] .tracking-widest { color: var(--t3); font-weight: 600; letter-spacing: .06em; font-size: 11px; }

/* ── smaller fixes found in review ── */
/* phone and email in the table's Contact column stay in the text face, so the column does not push the rest out */
.sx td a[href^="tel:"], .sx td a[href^="mailto:"] { font-family: var(--sans); }
/* project page rows: titles at the same weight as everywhere else */
.sx section.bob-canvas button.text-left .font-semibold { font-weight: 600; }
/* detail drawer: field labels quieter than the section headings above them */
.sx [class~="max-w-[440px]"] .uppercase.tracking-wide { text-transform: none; letter-spacing: 0; font-size: 12px; font-weight: 400; color: var(--t3); }
/* company logo tiles: corners in proportion to the fit badge beside them */
.sx .rounded-md.bg-violet-100.shrink-0, .sx img.rounded-md.object-contain { border-radius: 28%; }
/* status: a coloured pill without the browser's heavy arrow, but with a small chevron of its own, so it still
   reads as something you can change (without one, "new" looked like a disabled button) */
.sx select.rounded-lg { appearance: none; -webkit-appearance: none; text-align: left; text-align-last: left; padding: 5px 24px 5px 10px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23686B7D' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; background-size: 9px 6px; }
.sx .sx-dark select.rounded-lg { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23B1B4C4' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); }
.sx select.rounded-lg.bg-neutral-100:not(.line-through) { background-color: var(--surface); border-color: var(--line2); color: var(--t1); }
/* link chips white like the phone and email chips */
.sx a.bg-neutral-50.rounded-lg { background-color: var(--surface); }
/* figures in one face: fit scores, tier badges, popover figures */
.sx span.rounded-md.font-black, .sx span.rounded-md.tabular-nums { font-family: var(--mono); letter-spacing: 0; font-weight: 600; }
.sx header .relative > .absolute .text-2xl.font-black { font-family: var(--mono); letter-spacing: 0; }
/* neighbouring pills the same height: top bar chip and run status, Enrich all and Export */
.sx header > button.rounded-full, .sx header > span.rounded-full { padding: 3px 10px; font-size: 11.5px; }
.sx section[class~="bg-[#f4f0e8]"] > .h-12 button.rounded-xl { border: 1px solid transparent; }
/* small alignment slips */
.sx [role="menu"] > button svg { flex: none; }
.sx .bob-canvas .flex[class~="gap-2.5"] { gap: 12px; }
/* narrow windows: the sidebar toggle keeps its size, the credit pills tighten so the title fits */
.sx header > button.w-8 { flex: none; }
@media (max-width: 1340px) {
  .sx header { gap: 6px; }
  .sx header > button.rounded-full { padding: 3px 8px; }
  .sx header .relative > button.rounded-full { padding: 5px 9px; gap: 5px; font-size: 11px; }
}

/* ── fixes from the second review ── */
/* dark mode: hover fills lighter than the surface, table rows and the amber and green chips too */
.sx .sx-dark tbody tr:hover, .sx .sx-dark tbody tr.bg-neutral-50:hover { background-color: var(--hov); }
.sx .sx-dark [class~="hover:bg-amber-100"]:hover { background-color: rgba(226,181,95,.24); filter: none; }
.sx .sx-dark [class~="hover:bg-green-100"]:hover { background-color: rgba(79,203,156,.22); filter: none; }
/* dark mode, a dialog open: focus rings left behind the backdrop stay visible through it */
.sx .sx-dark:has(> .fixed.inset-0) > :not(.fixed) :is(button, a):focus-visible { outline-color: var(--ink); }
/* room for the focus ring inside the two lists that clip it: the results tabs and Add to project */
.sx section[class~="bg-[#f4f0e8]"] > .h-12 > .overflow-x-auto { align-self: stretch; gap: 20px; padding: 0 4px; margin: 0 0 0 -4px; }
.sx section[class~="bg-[#f4f0e8]"] > .h-12 > .overflow-x-auto > button:focus-visible { outline-offset: -2px; }
.sx .fixed.inset-0 .flex-col.max-h-64.overflow-y-auto { padding: 4px; margin: -4px; }
/* the notice strip's dismiss button: quiet at rest, full on hover */
.sx .bg-red-50.border-red-500 > button { opacity: .65; }
.sx .bg-red-50.border-red-500 > button:hover { opacity: 1; }

/* ── the research panel ── */
.sx .sx-bar { background: linear-gradient(90deg, var(--acc), #9A8CF6) !important; }
.sx .grid-cols-3 > .text-center .uppercase { font-weight: 500; letter-spacing: .06em; font-size: 10.5px; color: var(--t3); }
.sx .border-neutral-900.bg-green-50 { border-color: var(--mint-line); }
.sx .rounded-lg.border-2.px-2.py-1 { border-radius: 9px; font-weight: 500; }
/* its cards share the hairline of every other card; "min left" stays quiet beside the figure */
.sx section[class~="bg-[#f4f0e8]"] .max-w-2xl > .rounded-2xl.border-2, .sx section[class~="bg-[#f4f0e8]"] .max-w-2xl .grid-cols-3 > .rounded-2xl.border-2 { border-color: var(--line); }
.sx section[class~="bg-[#f4f0e8]"] .max-w-2xl .text-3xl + span { font-weight: 400; color: var(--t2); }
.sx .uppercase.tracking-wide { letter-spacing: .06em; font-weight: 600; }

/* ── menus and popovers ── */
/* the Enrich dialog's Paste / Upload switch: pills, selected like the tier cards */
.sx .fixed.inset-0 button.rounded-lg.border-2 { border-radius: 999px; padding: 6px 13px; }
.sx .fixed.inset-0 button.rounded-lg.border-2.bg-violet-100 { border-color: var(--acc); background-color: var(--acc-soft); }
.sx [role="menu"], .sx aside [role="menu"].rounded-xl { border-color: var(--line2); border-radius: 14px; box-shadow: var(--sh-lg); padding: 5px; color: var(--ink); }
.sx [role="menu"] > button { border-radius: 9px; }
.sx [role="menu"] > button svg { color: var(--t3); }
.sx [role="menu"] > button.text-red-600 svg { color: var(--red); }
.sx [role="menu"] > button.text-red-600:hover { background-color: var(--red-soft); }
.sx .absolute.rounded-2xl[class*="shadow-[4px_4px"] { border-color: var(--line2); box-shadow: var(--sh-lg); border-radius: 16px; }

/* ── project page ── */
.sx section.bob-canvas .w-10.h-10.rounded-xl.bg-violet-100 { border-radius: 13px; border-color: var(--acc-line); background-color: var(--acc-soft); }
.sx section.bob-canvas .rounded-xl.border-2.px-3:has(> input) { border-radius: 999px; border-color: var(--line2); box-shadow: var(--sh-sm); padding-left: 15px; padding-right: 15px; }
.sx section.bob-canvas .rounded-xl.border-2.px-3:has(> input):focus-within { border-color: var(--acc); box-shadow: 0 0 0 4px var(--acc-soft); }
.sx section.bob-canvas button.text-left.rounded-2xl { border-radius: 14px; border-color: var(--line); }
.sx section.bob-canvas button.text-left.rounded-2xl:hover { border-color: var(--line2); }

/* ── new rows flash once in the accent tint ── */
@keyframes sxFlash { 0% { background-color: var(--acc-soft2); } 100% { background-color: transparent; } }
.sx .bob-new { animation-name: sxFlash; }

/* ── second pass: readability (owner's UI sprint, 2026-10-16) ── */
.sx { --you: #EEEFFE; --you-line: rgba(91,99,232,.18); }
.sx .sx-dark { --you: rgba(127,135,246,.16); --you-line: rgba(127,135,246,.30); }

/* one answer, one card; its text at reading size, lists as lists */
.sx .sx-answer { padding: 14px 18px; }
.sx .sx-rich { font-size: 15px; line-height: 1.65; color: var(--t1); }
.sx .sx-rich strong { font-weight: 600; color: var(--ink); }
.sx .sx-rich a { color: var(--acc-deep); text-decoration: underline; text-decoration-color: var(--acc-line); text-underline-offset: 3px; }
.sx .sx-rich a:hover { text-decoration-color: currentColor; }
.sx .sx-rich ul, .sx .sx-rich ol { display: grid; gap: 6px; padding-left: 1.2em; }
.sx .sx-rich ul { list-style: disc; }
.sx .sx-rich ol { list-style: decimal; }
.sx .sx-rich li { padding-left: 2px; }
.sx .sx-rich li::marker { color: var(--t3); }
/* the person's files, as chips */
.sx .sx-file { display: inline-flex; align-items: center; gap: 6px; max-width: 100%; padding: 4px 10px; border-radius: 9px; background-color: var(--surface); border: 1px solid var(--line); font-size: 13px; font-weight: 500; color: var(--t1); }
.sx .sx-file svg { flex: none; color: var(--acc); }
.sx .sx-more { font-size: 13px; font-weight: 500; color: var(--acc-deep); }
.sx .sx-more:hover { text-decoration: underline; text-underline-offset: 3px; }
/* suggestions wrap instead of being cut mid-quote */
.sx .bob-canvas button.rounded-full[class~="hover:bg-violet-500"] { text-align: left; line-height: 1.4; border-radius: 14px; font-size: 13px; }

/* results toolbar: "Enrich all" is the one primary action; Export is a quiet secondary */
.sx section[class~="bg-[#f4f0e8]"] > .h-12 > .shrink-0 > button.bg-neutral-900 { background-color: var(--surface); color: var(--ink); border: 1px solid var(--line2); }
.sx section[class~="bg-[#f4f0e8]"] > .h-12 > .shrink-0 > button.bg-neutral-900:hover { background-color: var(--hov); color: var(--ink); translate: none; }
/* a narrow results pane (the split view, a tablet, a phone) gives the tabs their own row; side by side the
   buttons squeezed them to "M..." and at 1024px out of sight altogether */
.sx section[class~="bg-[#f4f0e8]"] { container-type: inline-size; }
@container (max-width: 760px) {
  .sx section[class~="bg-[#f4f0e8]"] > .h-12 { flex-wrap: wrap; height: auto; row-gap: 0; padding-bottom: 8px; }
  .sx section[class~="bg-[#f4f0e8]"] > .h-12 > .overflow-x-auto { flex: 1 0 100%; height: 46px; margin: 0 -12px 8px; padding: 0 16px; border-bottom: 1px solid var(--line); }
  .sx section[class~="bg-[#f4f0e8]"] > .h-12 > .shrink-0 { flex: 1 0 100%; }
  .sx section[class~="bg-[#f4f0e8]"] > .h-12 > .shrink-0 > .sx-seg { margin-right: auto; }
}

/* the table: 13px cells, readable contact lines and row numbers, no column squeezed to one word a line */
.sx table[class~="text-[12.5px]"] { font-size: 13px; }
.sx tbody td.sticky { white-space: normal; min-width: 240px; max-width: 300px; }
.sx tbody td.sticky > span { align-items: flex-start; }
.sx tbody td.sticky .w-4.text-right { color: var(--t3); font-size: 11px; font-variant-numeric: tabular-nums; min-width: 18px; padding-top: 2px; }
.sx tbody td [class~="text-[10.5px]"] { font-size: 12px; color: var(--t2); }
.sx tbody td a[href^="tel:"], .sx tbody td a[href^="mailto:"] { min-height: 24px; }
.sx td[data-col], .sx th[data-col] { min-width: 120px; }
.sx td[data-col="student"], .sx td[data-col="role"], .sx td[data-col="city"] { min-width: 150px; }
.sx td[data-col="student"] > span { font-weight: 600; color: var(--ink); }
.sx td[data-col="fit_score"], .sx th[data-col="fit_score"] { min-width: 64px; }
/* the scrollbar shows, so the columns past the edge of the pane are not a secret */
.sx .flex-1.overflow-auto.bg-white::-webkit-scrollbar { height: 10px; width: 10px; }
.sx .flex-1.overflow-auto.bg-white::-webkit-scrollbar-thumb { background-color: var(--line2); border-radius: 999px; border: 2px solid var(--surface); }
.sx .flex-1.overflow-auto.bg-white::-webkit-scrollbar-track { background-color: transparent; }

/* a phone: the chat list is a drawer over the page; the chat and the results take turns on the screen */
@media (max-width: 767px) {
  .sx aside.sx-drawer { position: fixed; top: 0; bottom: 0; left: 0; z-index: 46; box-shadow: var(--sh-lg); }
  .sx .sx-scrim { z-index: 45; }
  .sx .sx-seg > button[title="Split view"] { display: none; }
  .sx header { padding-left: 8px; padding-right: 10px; gap: 6px; }
  .sx header .relative > button.rounded-full .font-medium { display: none; }
  .sx .bob-canvas > div[class~="px-5"] { padding-left: 12px; padding-right: 12px; }
  .sx .bob-canvas [class~="pl-10"] { padding-left: 0; }
  .sx .sx-answer { max-width: 100%; }
}

/* ── second pass: results, cards, lookups ── */
/* the line under a name: the role under a company, the company and role under a student */
.sx .sx-sub { font-size: 12px; font-weight: 400; color: var(--t2); line-height: 1.35; margin-top: 2px; white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.sx .sx-drawer-sub { font-size: 13px; color: var(--t2); margin-top: 3px; line-height: 1.4; }
/* a card's "why" line is a quiet panel, not a violet bar on a rounded box */
.sx [class~="border-l-[3px]"] { border-left-width: 0; border-radius: 10px; background-color: var(--bg2); padding: 8px 10px; }
/* figures and contact details in the text face with even digits; the mono face read as debug output */
.sx header .relative > button.rounded-full { font-family: var(--sans); font-variant-numeric: tabular-nums; }
.sx a[href^="tel:"], .sx a[href^="mailto:"] { font-family: var(--sans); font-variant-numeric: tabular-nums; }
.sx span.rounded-md.font-black, .sx span.rounded-md.tabular-nums, .sx [class~="min-w-9"].h-9 { font-family: var(--sans); font-variant-numeric: tabular-nums; }
.sx .sx-copy { color: var(--t3); }
/* links the person pasted read as short links, not 200 characters of address */
.sx .sx-rich-inline a { color: var(--acc-deep); text-decoration: underline; text-decoration-color: var(--acc-line); text-underline-offset: 3px; }
/* dark: "New chat" in the accent, not a white slab that outshines the page */
.sx .sx-dark aside .p-2 > button.bg-neutral-900 { background-color: var(--acc-fill); color: #fff; }
.sx .sx-dark aside .p-2 > button.bg-neutral-900:hover { background-color: var(--acc-fill-h); color: #fff; }
/* dark: logos sit on a white tile, as they do in light; black marks vanished on the dark surface */
.sx .sx-dark img.rounded-md.object-contain { background-color: #fff; }
/* the "..." on each chat appears on hover, focus or the open chat, not as a column of 13 identical icons */
@media (hover: hover) {
  .sx aside [aria-label="Chat options"] { opacity: 0; transition: opacity .12s; }
  .sx aside div:hover > [aria-label="Chat options"], .sx aside [aria-label="Chat options"]:focus-visible,
  .sx aside [aria-label="Chat options"][aria-expanded="true"], .sx aside .bg-violet-100 > [aria-label="Chat options"] { opacity: 1; }
}
/* what Sensei can do, under the empty composer */
.sx .sx-starter { display: flex; align-items: flex-start; gap: 10px; text-align: left; padding: 12px 14px; border-radius: 14px; border: 1px solid var(--line); background-color: var(--surface); color: var(--t1); transition: border-color .15s, box-shadow .15s, translate .15s; }
.sx .sx-starter:hover { border-color: var(--acc-line); box-shadow: var(--sh-md); translate: 0 -1px; }
.sx .sx-starter > svg { flex: none; margin-top: 2px; color: var(--acc); }
.sx .sx-starter-title { display: block; font-size: 14px; font-weight: 600; color: var(--ink); }
.sx .sx-starter-text { display: block; font-size: 13px; color: var(--t2); margin-top: 2px; line-height: 1.4; }

/* ── third pass: controls you can hit, and only when you need them ── */
/* the results view switch says what it switches to */
.sx section[class~="bg-[#f4f0e8]"] .sx-seg > button { width: auto; padding: 0 11px; gap: 6px; }
.sx .sx-seg-label { font-size: 12.5px; font-weight: 500; }
/* row Enrich: a target you can hit (it was 55x21) */
.sx button[title^="Find phone + email for this company"] { min-height: 26px; padding: 3px 10px; gap: 5px; font-size: 12px; }
/* "Remove row" shows on the row you are on, so a bare x does not sit beside every Enrich */
@media (hover: hover) {
  .sx tbody tr [title="Remove row"], .sx .cursor-pointer[class*="shadow-[3px_3px"] [title="Remove row"] { opacity: 0; transition: opacity .12s; }
  .sx tbody tr:hover [title="Remove row"], .sx .cursor-pointer[class*="shadow-[3px_3px"]:hover [title="Remove row"], .sx [title="Remove row"]:focus-visible { opacity: 1; }
}
/* the account links at the foot of the sidebar: 12px with room to hit them */
.sx aside .space-y-2 > div.flex > button { padding: 5px 0; font-size: 12.5px; color: var(--t2); }
.sx aside .space-y-2 > div[title] { font-size: 12.5px; color: var(--t3); }
`;
/* sx:end */

// ── Root ─────────────────────────────────────────────────────────────────────

// The route component, and what a plain import of this file gives: the original look.
// (React Router wraps a route's default export and drops any props handed to it, so
// the routes that choose a look import SenseiApp by name instead.)
export default function BobPage() {
  return <SenseiApp />;
}

export function SenseiApp({ ui }: { ui?: Ui }) {
  const look: Ui = ui === "new" ? "new" : "old";
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Password-reset link (?reset=token): show the set-new-password screen.
    try {
      const p = new URLSearchParams(window.location.search);
      const rt = p.get("reset");
      if (rt) {
        setResetToken(rt);
        p.delete("reset");
        window.history.replaceState({}, "", window.location.pathname + (p.toString() ? `?${p}` : ""));
      }
    } catch { /* ignore */ }
    // Session handoff from the dashboard (?s=token). localStorage is per-origin,
    // so a manager crossing dashboard.studojo.* -> app.studojo.* carries their
    // token in the URL. Adopt it (overriding any stale session), then clean the URL.
    try {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("s");
      if (s) {
        localStorage.setItem(SESSION_STORAGE, s);
        localStorage.removeItem(KEY_STORAGE);
        params.delete("s");
        window.history.replaceState({}, "", window.location.pathname + (params.toString() ? `?${params}` : ""));
      }
    } catch { /* ignore */ }
    if (localStorage.getItem(SESSION_STORAGE) || localStorage.getItem(KEY_STORAGE)) setAuthed(true);
  }, []);

  const screen = !mounted ? <div className="min-h-screen bg-[#faf7f2]" />
    : resetToken ? <ResetPasswordScreen token={resetToken} onDone={() => setResetToken(null)} />
    : !authed ? <Gate onSuccess={() => setAuthed(true)} />
    : <Workspace onAuthLost={() => setAuthed(false)} />;
  if (look !== "new") return screen;
  // The new look: the same screens inside a scope the stylesheet hangs off.
  // display:contents keeps the wrapper out of the layout.
  return (
    <UiContext.Provider value="new">
      <div className="sx" style={{ display: "contents" }}>
        <style>{SX_CSS}</style>
        {screen}
      </div>
    </UiContext.Provider>
  );
}

// ── Access gate ──────────────────────────────────────────────────────────────

function Gate({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<"email" | "code" | "forgot">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgotSent, setForgotSent] = useState("");
  const [showPw, setShowPw] = useState(false);
  // Read straight off the DOM at submit time. A browser autofill can write into the
  // field without firing React's onChange, which left state and what you SEE out of
  // sync (typed passwords got concatenated onto an autofilled one and 401'd).
  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  const liveEmail = () => (emailRef.current?.value ?? email).trim();
  const livePw = () => (pwRef.current?.value ?? password).trim();

  const submitForgot = async () => {
    if (!liveEmail() || busy) return;
    setBusy(true); setError(""); setForgotSent("");
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: liveEmail(), origin: window.location.origin }),
      });
      const d = await res.json().catch(() => ({}));
      setForgotSent(d?.message || "If that email has an account, a reset link is on its way.");
    } catch { setError("Could not send the reset link. Try again."); }
    finally { setBusy(false); }
  };

  const submitEmail = async () => {
    if (!liveEmail() || !livePw() || busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch(`${API}/auth/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: liveEmail(), password: livePw() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d?.detail || "Could not sign you in");
      localStorage.setItem(SESSION_STORAGE, d.token);
      localStorage.removeItem(KEY_STORAGE);
      onSuccess();
    } catch (e: any) {
      setError(e.message || "Could not sign you in");
    } finally { setBusy(false); }
  };

  const submitCode = async () => {
    if (!code.trim() || busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch(`${API}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.detail || "Invalid access code");
      }
      localStorage.setItem(KEY_STORAGE, code.trim());
      localStorage.removeItem(SESSION_STORAGE);
      onSuccess();
    } catch (e: any) {
      setError(e.message || "Could not verify the code");
    } finally { setBusy(false); }
  };

  const inputCls =
    "w-full border-2 border-neutral-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500";
  const btnCls =
    "mt-4 w-full bg-violet-500 text-white font-bold py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-60";

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6 font-['Satoshi']">
      <div className="w-full max-w-md bg-white border-2 border-neutral-900 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] p-8">
        <div className="w-12 h-12 border-2 border-neutral-900 rounded-2xl overflow-hidden mb-5">
          <SenseiMark />
        </div>
        <h1 className="font-['Clash_Display'] text-3xl font-semibold text-neutral-900">
          Sensei <span className="text-neutral-400 text-xl font-normal">by Studojo</span>
        </h1>

        {mode === "email" ? (
          <>
            <p className="text-neutral-600 mt-2 mb-6">
              Sign in with your work email and password to reach your team's workspace.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); submitEmail(); }}>
              <input
                ref={emailRef} name="username" autoComplete="username"
                autoCapitalize="none" autoCorrect="off" spellCheck={false}
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com" className={inputCls}
              />
              <div className="relative mt-3">
                <input
                  ref={pwRef} name="password" autoComplete="current-password"
                  type={showPw ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" className={`${inputCls} pr-16`}
                />
                <button
                  type="button" onClick={() => setShowPw((s) => !s)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
              <button type="submit" disabled={busy} className={btnCls}>
                {busy ? "Signing in..." : "Continue"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => { setMode("forgot"); setError(""); setForgotSent(""); }}
              className="mt-3 w-full text-sm font-semibold text-violet-600 hover:text-violet-800"
            >
              Forgot your password?
            </button>
            <button
              type="button"
              onClick={() => { setMode("code"); setError(""); }}
              className="mt-2 w-full text-sm text-neutral-400 hover:text-neutral-700"
            >
              Have a workspace access code?
            </button>
          </>
        ) : mode === "forgot" ? (
          <>
            <p className="text-neutral-600 mt-2 mb-6">
              Enter your email and we'll send you a link to set a new password.
            </p>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitForgot()}
              placeholder="you@company.com" className={inputCls}
            />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            {forgotSent && (
              <p className="text-sm text-violet-700 bg-violet-50 border-2 border-violet-200 rounded-xl px-3 py-2 mt-3">
                {forgotSent}
              </p>
            )}
            <button onClick={submitForgot} disabled={busy} className={btnCls}>
              {busy ? "Sending..." : "Send reset link"}
            </button>
            <button
              onClick={() => { setMode("email"); setError(""); setForgotSent(""); }}
              className="mt-3 w-full text-sm text-neutral-400 hover:text-neutral-700"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <p className="text-neutral-600 mt-2 mb-6">Enter your workspace access code.</p>
            <input
              type="password" value={code} onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitCode()}
              placeholder="Access code" className={inputCls}
            />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <button onClick={submitCode} disabled={busy} className={btnCls}>
              {busy ? "Checking..." : "Enter workspace"}
            </button>
            <button
              onClick={() => { setMode("email"); setError(""); }}
              className="mt-3 w-full text-sm text-neutral-400 hover:text-neutral-700"
            >
              Sign in with email instead
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Password reset (from the emailed link) ───────────────────────────────────

function ResetPasswordScreen({ token, onDone }: { token: string; onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (busy) return;
    if (pw.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (pw !== pw2) { setError("Those passwords don't match"); return; }
    setBusy(true); setError("");
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: pw }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d?.detail || "Could not reset your password");
      setDone(true);
    } catch (e: any) { setError(e.message || "Could not reset your password"); }
    finally { setBusy(false); }
  };

  const inputCls = "w-full border-2 border-neutral-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500";
  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6 font-['Satoshi']">
      <div className="w-full max-w-md bg-white border-2 border-neutral-900 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] p-8">
        <div className="w-12 h-12 border-2 border-neutral-900 rounded-2xl overflow-hidden mb-5">
          <SenseiMark />
        </div>
        {done ? (
          <>
            <h1 className="font-['Clash_Display'] text-2xl font-semibold">Password updated</h1>
            <p className="text-neutral-600 mt-2 mb-6">You can sign in with your new password now.</p>
            <button onClick={onDone}
              className="w-full bg-violet-500 text-white font-bold py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
              Sign in
            </button>
          </>
        ) : (
          <>
            <h1 className="font-['Clash_Display'] text-2xl font-semibold">Set a new password</h1>
            <p className="text-neutral-600 mt-2 mb-6">Choose a password with at least 8 characters.</p>
            <input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)}
              placeholder="New password" className={inputCls} />
            <input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Confirm new password" className={`${inputCls} mt-3`} />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <button onClick={submit} disabled={busy}
              className="mt-4 w-full bg-violet-500 text-white font-bold py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] disabled:opacity-60">
              {busy ? "Saving..." : "Save password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Change password for a signed-in user. On success every session is invalidated,
// so we sign the user out and let them back in with the new password.
function ChangePasswordModal({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (busy) return;
    if (pw.length < 8) { setError("New password must be at least 8 characters"); return; }
    if (pw !== pw2) { setError("Those passwords don't match"); return; }
    setBusy(true); setError("");
    try {
      await bobFetch("/auth/change-password", {
        method: "POST", body: JSON.stringify({ current_password: cur, new_password: pw }),
      });
      onChanged();
    } catch (e: any) { setError(e?.message || "Could not change your password"); }
    finally { setBusy(false); }
  };

  const inputCls = "w-full border-2 border-neutral-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500";
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6" onClick={onClose}>
      <div className="w-full max-w-md bg-white border-2 border-neutral-900 rounded-[28px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] p-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-['Clash_Display'] text-xl font-semibold">Change password</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900"><FiX size={18} /></button>
        </div>
        <p className="text-sm text-neutral-500 mb-4">You'll be signed out everywhere and can sign back in with the new password.</p>
        <input type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} placeholder="Current password" className={inputCls} />
        <input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password (min 8 characters)" className={`${inputCls} mt-2`} />
        <input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Confirm new password" className={`${inputCls} mt-2`} />
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border-2 border-neutral-300 text-sm font-semibold text-neutral-500 hover:border-neutral-900 hover:text-neutral-900">Cancel</button>
          <button onClick={submit} disabled={busy}
            className="bg-violet-700 text-white font-bold px-5 py-2 rounded-xl border-2 border-neutral-900 text-sm hover:bg-violet-800 disabled:opacity-60">
            {busy ? "Saving..." : "Change password"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Projects, pins and rename: small dialogs in the Sensei modal style ──────────

const DIALOG_BACKDROP = "fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6";
const DIALOG_CARD = "w-full max-w-md bg-white border-2 border-neutral-900 rounded-[28px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] p-6";
const BTN_PRIMARY = "bg-violet-700 text-white font-bold px-5 py-2 rounded-xl border-2 border-neutral-900 text-sm hover:bg-violet-800 disabled:opacity-60";
const BTN_CANCEL = "px-4 py-2 rounded-xl border-2 border-neutral-300 text-sm font-semibold text-neutral-500 hover:border-neutral-900 hover:text-neutral-900";

// One text field: new project, rename project, rename chat. The field is text-base so iOS
// never zooms in on focus (app/lib/mobile-viewport.test.mjs).
function NameDialog({ title, placeholder, initial, submitLabel, maxLength, onSubmit, onClose }: {
  title: string; placeholder: string; initial: string; submitLabel: string; maxLength: number;
  onSubmit: (value: string) => Promise<void>; onClose: () => void;
}) {
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    const v = value.replace(/\s+/g, " ").trim();
    if (!v || busy) { if (!v) setError("Give it a name"); return; }
    setBusy(true); setError("");
    try { await onSubmit(v); onClose(); }
    catch (e: any) { setError(e?.message || "That did not work. Try again."); }
    finally { setBusy(false); }
  };
  return (
    <div className={DIALOG_BACKDROP} onClick={onClose}>
      <div className={DIALOG_CARD} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-['Clash_Display'] text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900" aria-label="Close"><FiX size={18} /></button>
        </div>
        <input autoFocus value={value} maxLength={maxLength} placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") onClose(); }}
          className="w-full border-2 border-neutral-900 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-violet-500" />
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className={BTN_CANCEL}>Cancel</button>
          <button onClick={submit} disabled={busy} className={BTN_PRIMARY}>{busy ? "Saving..." : submitLabel}</button>
        </div>
      </div>
    </div>
  );
}

// Put a chat into one of your projects (or a new one), or take it out.
function MoveDialog({ chatTitle, projects, currentId, onPick, onCreate, onClose }: {
  chatTitle: string; projects: Project[]; currentId: number | null;
  onPick: (projectId: number | null) => Promise<void>; onCreate: (name: string) => Promise<void>; onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setError("");
    try { await fn(); onClose(); }
    catch (e: any) { setError(e?.message || "That did not work. Try again."); }
    finally { setBusy(false); }
  };
  const create = () => {
    const v = name.replace(/\s+/g, " ").trim();
    if (!v) { setError("Give the new project a name"); return; }
    run(() => onCreate(v));
  };
  return (
    <div className={DIALOG_BACKDROP} onClick={onClose}>
      <div className={DIALOG_CARD} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-['Clash_Display'] text-xl font-semibold">Add to project</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900" aria-label="Close"><FiX size={18} /></button>
        </div>
        <p className="text-sm text-neutral-500 mb-4 truncate">{chatTitle}</p>
        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto bob-thinscroll">
          {projects.map((p) => (
            <button key={p.id} disabled={busy} onClick={() => run(() => onPick(p.id))}
              className={`flex items-center gap-2 text-left px-3 py-2.5 rounded-xl border-2 text-sm transition-colors ${
                p.id === currentId ? "border-neutral-900 bg-violet-100" : "border-neutral-200 hover:border-neutral-900"}`}>
              <FiFolder size={14} className="shrink-0 text-violet-600" />
              <span className="flex-1 truncate">{p.name}</span>
              {p.id === currentId && <FiCheck size={14} className="shrink-0" />}
            </button>
          ))}
          {projects.length === 0 && <p className="text-sm text-neutral-500">You have no projects yet. Create one below.</p>}
        </div>
        <div className="flex gap-2 mt-4">
          <input value={name} maxLength={60} placeholder="New project name" onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") create(); if (e.key === "Escape") onClose(); }}
            className="flex-1 min-w-0 border-2 border-neutral-900 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-violet-500" />
          <button onClick={create} disabled={busy} className={BTN_PRIMARY}>Create</button>
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <div className="flex justify-between items-center gap-2 mt-4">
          {currentId != null
            ? <button disabled={busy} onClick={() => run(() => onPick(null))} className="text-sm font-semibold text-neutral-500 hover:text-red-600">Remove from project</button>
            : <span />}
          <button onClick={onClose} className={BTN_CANCEL}>Done</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose }: {
  title: string; message: string; confirmLabel: string; onConfirm: () => Promise<void>; onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const go = async () => {
    if (busy) return;
    setBusy(true); setError("");
    try { await onConfirm(); onClose(); }
    catch (e: any) { setError(e?.message || "That did not work. Try again."); }
    finally { setBusy(false); }
  };
  return (
    <div className={DIALOG_BACKDROP} onClick={onClose}>
      <div className={DIALOG_CARD} onClick={(e) => e.stopPropagation()}>
        <h2 className="font-['Clash_Display'] text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-neutral-500">{message}</p>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className={BTN_CANCEL}>Cancel</button>
          <button onClick={go} disabled={busy}
            className="bg-red-600 text-white font-bold px-5 py-2 rounded-xl border-2 border-neutral-900 text-sm hover:bg-red-700 disabled:opacity-60">
            {busy ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// A project opened from the sidebar: every chat in it, newest activity first, with search
// and a "New chat" that files the new chat into this project.
function ProjectPage({ project, chats, loading, meEmail, onOpenChat, onNewChat, onRename, onDelete }: {
  project: Project | undefined; chats: ChatSummary[]; loading: boolean; meEmail: string | null;
  onOpenChat: (id: number) => void; onNewChat: () => void; onRename: () => void; onDelete: () => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = q ? chats.filter((c) => c.title.toLowerCase().includes(q)) : chats;
  if (!project) {
    return (
      <section className="bob-canvas flex-1 min-w-0 flex items-center justify-center p-6">
        <p className="text-sm text-neutral-500">{loading ? "Loading..." : "This project no longer exists."}</p>
      </section>
    );
  }
  return (
    <section className="bob-canvas flex-1 min-w-0 overflow-y-auto bob-thinscroll">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-xl border-2 border-neutral-900 bg-violet-100 flex items-center justify-center">
            <FiFolder size={18} className="text-violet-700" />
          </div>
          <h1 className="font-['Clash_Display'] text-2xl font-semibold truncate">{project.name}</h1>
          <div className="ml-auto flex items-center gap-1 shrink-0">
            <button onClick={onRename} title="Rename project"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900">
              <FiEdit2 size={15} />
            </button>
            <button onClick={onDelete} title="Delete project"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-red-600">
              <FiTrash2 size={15} />
            </button>
          </div>
        </div>
        <p className="text-sm text-neutral-500 mt-2">
          {chats.length} chat{chats.length === 1 ? "" : "s"}. Only you see this project; the chats stay in your Recent list too.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mt-5">
          <div className="flex-1 flex items-center gap-2 bg-white border-2 border-neutral-900 rounded-xl px-3">
            <FiSearch size={15} className="text-neutral-400 shrink-0" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this project"
              className="flex-1 min-w-0 bg-transparent py-2 text-base focus:outline-none" />
          </div>
          <button onClick={onNewChat}
            className="flex items-center justify-center gap-2 text-sm font-semibold bg-neutral-900 text-white rounded-xl px-4 py-2.5 hover:bg-violet-700 transition-colors">
            <FiPlus size={15} /> New chat in this project
          </button>
        </div>
        <div className="flex flex-col gap-2 mt-5">
          {shown.map((c) => (
            <button key={c.id} onClick={() => onOpenChat(c.id)}
              className="text-left bg-white border-2 border-neutral-900 rounded-2xl px-4 py-3 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
              <div className="flex items-center gap-2">
                {c.pinned && <LuPin size={13} className="shrink-0 text-violet-600" />}
                <span className="font-semibold text-sm truncate">{c.title}</span>
              </div>
              <div className="text-[12px] text-neutral-500 mt-0.5 truncate">
                {shortWhen(c.updated_at)}
                {c.owner_email && meEmail && c.owner_email !== meEmail ? ` · shared by ${c.owner_email}` : ""}
              </div>
            </button>
          ))}
          {!loading && chats.length === 0 && (
            <p className="text-sm text-neutral-500 bg-white border-2 border-dashed border-neutral-300 rounded-2xl p-5">
              No chats here yet. Start one with the button above, or open the menu on any chat in the sidebar and choose Add to project.
            </p>
          )}
          {!loading && chats.length > 0 && shown.length === 0 && (
            <p className="text-sm text-neutral-500 p-2">No chat in this project matches that search.</p>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Workspace ────────────────────────────────────────────────────────────────

type PanelMode = "split" | "chat" | "table";
type ResultsView = "cards" | "table";

function Workspace({ onAuthLost }: { onAuthLost: () => void }) {
  const ui = useContext(UiContext);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  // Personal sidebar organisation (bob-svc migration 062): pins first, then projects, then Recent.
  const [pinned, setPinned] = useState<ChatSummary[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectView, setProjectView] = useState<number | null>(null);   // the open project page
  const [projectChats, setProjectChats] = useState<ChatSummary[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [pendingProject, setPendingProject] = useState<number | null>(null); // "New chat" from a project page
  const [chatInfo, setChatInfo] = useState<ChatSummary | null>(null);       // the open chat, from GET /chats/:id
  const [menuFor, setMenuFor] = useState<number | null>(null);              // chat whose options menu is open
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuAt, setMenuAt] = useState<ReturnType<typeof sxMenuPlacement> | null>(null); // new look: where it opens
  const menuBtn = useRef<HTMLElement | null>(null);                                       // new look: the button it belongs to
  const [nameDialog, setNameDialog] = useState<null | { kind: "new-project" | "rename-project" | "rename-chat"; id?: number; value: string }>(null);
  const [moveFor, setMoveFor] = useState<ChatSummary | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tables, setTables] = useState<BobTable[]>([]);
  const [run, setRun] = useState<Run | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<{ id: number; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const [credits, setCredits] = useState<{ enrichment: number; ai: number; enabled: boolean; tiers?: EnrichTier[] | null } | null>(null);
  const [notice, setNotice] = useState<string>("");
  const [me, setMe] = useState<{ email: string | null; role: string; org: { id: number; name: string } | null; capabilities?: { candidate_sourcing?: boolean; projects?: boolean } } | null>(null);
  const [showTeam, setShowTeam] = useState(false);
  // Only rendered for a workspace whose product is finding people.
  const [showEnrich, setShowEnrich] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(localStorage.getItem("bob_dark") === "1"); }, []);
  const toggleDark = useCallback(() => {
    setDark((d) => { localStorage.setItem("bob_dark", d ? "0" : "1"); return !d; });
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState<PanelMode>("split");
  // A phone (new look): the chat list is a drawer over the page, closed until asked for, and the chat and
  // the results take turns on the screen instead of splitting 390px between them.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (ui !== "new") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      setNarrow(mq.matches);
      if (mq.matches) setSidebarOpen(false);
      else {
        try { setSidebarOpen(JSON.parse(localStorage.getItem(LAYOUT_STORAGE) || "{}").sidebarOpen !== false); }
        catch { setSidebarOpen(true); }
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [ui]);
  const viewMode: PanelMode = narrow && mode === "split" ? "chat" : mode;
  // The chat whose quick-lookup contacts the user asked to see as a table ("Open as table"); none by default.
  const [quickPanelFor, setQuickPanelFor] = useState<number | null>(null);
  // A tab left open keeps running the version it loaded, so a fix already live looked broken there (owner,
  // 2026-10-15). Every 5 minutes and on focus the page checks whether a newer build is live, and says so.
  const [newVersion, setNewVersion] = useState(false);
  useEffect(() => {
    const mine = document.querySelector('link[href*="/assets/manifest-"]')?.getAttribute("href") || "";
    if (!mine) return;
    let stop = false;
    const check = async () => {
      try {
        const html = await (await fetch("/", { cache: "no-store", credentials: "same-origin" })).text();
        const live = (html.match(/\/assets\/manifest-[A-Za-z0-9_-]+\.js/) || [""])[0];
        if (!stop && live && live !== mine) setNewVersion(true);
      } catch { /* offline: the next check tries again */ }
    };
    const timer = setInterval(check, 5 * 60 * 1000);
    const onFocus = () => { void check(); };
    window.addEventListener("focus", onFocus);
    return () => { stop = true; clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, []);
  const [tablePct, setTablePct] = useState(48);
  const [viewPref, setViewPref] = useState<ResultsView | null>(null);
  const dragging = useRef(false);
  const layoutRef = useRef<HTMLDivElement>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LAYOUT_STORAGE) || "{}");
      const phone = ui === "new" && window.matchMedia("(max-width: 767px)").matches;
      if (typeof saved.sidebarOpen === "boolean" && !phone) setSidebarOpen(saved.sidebarOpen);
      if (typeof saved.tablePct === "number") setTablePct(saved.tablePct);
      if (saved.viewPref === "cards" || saved.viewPref === "table") setViewPref(saved.viewPref);
    } catch {}
  }, []);
  useEffect(() => {
    // the phone drawer opening and closing is not the desktop sidebar's setting
    if (narrow) return;
    localStorage.setItem(LAYOUT_STORAGE, JSON.stringify({ sidebarOpen, tablePct, viewPref }));
  }, [sidebarOpen, tablePct, viewPref, narrow]);

  const handleError = useCallback((e: unknown) => {
    if (e instanceof BobError && (e.status === 401 || e.status === 503)) {
      localStorage.removeItem(KEY_STORAGE);
      localStorage.removeItem(SESSION_STORAGE);
      onAuthLost();
    } else {
      console.error(e);
    }
  }, [onAuthLost]);

  const loadChats = useCallback(async () => {
    try {
      const d = await bobFetch<{ chats: ChatSummary[]; pinned?: ChatSummary[]; projects?: Project[] }>("/chats");
      setChats(d.chats);
      setPinned(d.pinned || []);
      setProjects(d.projects || []);
      return d.chats;
    } catch (e) {
      handleError(e);
      return [];
    }
  }, [handleError]);

  const loadProject = useCallback(async (id: number) => {
    setProjectLoading(true);
    try {
      const d = await bobFetch<{ chats: ChatSummary[] }>(`/chats?project_id=${id}`);
      setProjectChats(d.chats);
    } catch (e) {
      setProjectChats([]);
      if (e instanceof BobError && e.status === 404) setNotice("That project no longer exists.");
      else handleError(e);
    } finally {
      setProjectLoading(false);
    }
  }, [handleError]);

  // Credit balances for the header counter. Best-effort: a failure just hides
  // the counter rather than disrupting the workspace.
  const loadCredits = useCallback(async () => {
    try {
      setCredits(await bobFetch<{ enrichment: number; ai: number; enabled: boolean; tiers?: EnrichTier[] | null }>("/credits"));
    } catch { /* counter is non-critical */ }
  }, []);
  useEffect(() => { loadCredits(); }, [loadCredits]);

  const loadMe = useCallback(async () => {
    try {
      setMe(await bobFetch<{ email: string | null; role: string; org: { id: number; name: string } | null; capabilities?: { candidate_sourcing?: boolean; projects?: boolean } }>("/me"));
    } catch { /* identity is non-critical for legacy access-code sessions */ }
  }, []);
  useEffect(() => { loadMe(); }, [loadMe]);

  const signOut = useCallback(() => {
    // Invalidate the session server-side too (best-effort), then clear locally.
    bobFetch("/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem(SESSION_STORAGE);
    localStorage.removeItem(KEY_STORAGE);
    onAuthLost();
  }, [onAuthLost]);

  const shareChat = useCallback(async (chatId: number) => {
    setMenuFor(null);
    try {
      // Make it visible to the whole workspace so a teammate who opens the link also
      // finds it in their own sidebar (it is their workspace too), then copy a deep
      // link to this chat. Opening it (after login if needed) lands them on this chat.
      await bobFetch(`/chats/${chatId}/share`, { method: "POST", body: JSON.stringify({ shared: true }) });
      const link = `${window.location.origin}/?chat=${chatId}`;
      let copied = false;
      try { await navigator.clipboard.writeText(link); copied = true; } catch { /* clipboard blocked (non-secure ctx / denied) */ }
      setNotice(copied
        ? "Share link copied. Send it to a teammate and it opens this chat in their workspace."
        : `Share link: ${link}`);
    } catch (e) { handleError(e); }
  }, [handleError]);

  // Track whether the current chat is a throwaway (no messages, no tables) so we
  // can drop it the moment the user navigates away. An empty "New chat" is never
  // worth persisting: this keeps the sidebar clean of blank entries.
  const emptyRef = useRef<{ id: number | null; empty: boolean }>({ id: null, empty: true });
  useEffect(() => {
    emptyRef.current = { id: activeChat, empty: messages.length === 0 && tables.length === 0 };
  }, [activeChat, messages, tables]);

  const dropCurrentIfEmpty = useCallback(async () => {
    const { id, empty } = emptyRef.current;
    if (id == null || !empty) return;
    try {
      await bobFetch(`/chats/${id}`, { method: "DELETE" });
      setChats((cs) => cs.filter((c) => c.id !== id));
    } catch { /* best-effort cleanup */ }
  }, []);

  const openChat = useCallback(async (id: number) => {
    setMenuFor(null);
    setProjectView(null);
    setPendingProject(null);
    if (id === emptyRef.current.id) {        // already open: just leave the project page
      try { window.history.replaceState({}, "", `${homePath()}?chat=${id}`); } catch { /* ignore */ }
      return;
    }
    await dropCurrentIfEmpty();
    setChatInfo(null);
    setActiveChat(id);
    // Keep the URL pointing at the open chat so it is always shareable + refresh-safe
    // (this is the link the Share button copies: app.studojo.com/?chat=<id>).
    try { window.history.replaceState({}, "", `${homePath()}?chat=${id}`); } catch { /* ignore */ }
    setRun(null);
    setPendingFiles([]);
    try {
      const d = await bobFetch<any>(`/chats/${id}`);
      setMessages(d.messages);
      setTables(d.tables || []);
      setChatInfo({ id: d.id, title: d.title, updated_at: "", owner_email: d.owner_email, can_manage: d.can_manage,
                    project_id: d.project_id, project_name: d.project_name, pinned: d.pinned });
      if (d.latest_run && d.latest_run.status === "running") setRun(d.latest_run);
    } catch (e) {
      handleError(e);
    }
  }, [handleError, dropCurrentIfEmpty]);

  // Open a project page in the main area. Leaving an empty chat drops it, as opening another chat does.
  const openProject = useCallback(async (id: number) => {
    setMenuFor(null);
    const { id: curId, empty } = emptyRef.current;
    await dropCurrentIfEmpty();
    if (curId != null && empty) {
      setActiveChat(null); setMessages([]); setTables([]); setRun(null); setChatInfo(null);
    }
    setPendingProject(null);
    setProjectView(id);
    setProjectChats([]);
    try { window.history.replaceState({}, "", `${homePath()}?project=${id}`); } catch { /* ignore */ }
    loadProject(id);
  }, [dropCurrentIfEmpty, loadProject]);

  useEffect(() => {
    // Deep link: app.studojo.com/?chat=<id> opens that specific chat (a shared link).
    // The recipient is a member of the same workspace, so get_chat authorizes it; the
    // login gate is in-page, so this param survives an unauthenticated -> login -> here.
    let wanted: number | null = null;
    let wantedProject: number | null = null;
    try {
      const qs = new URLSearchParams(window.location.search);
      const v = qs.get("chat");
      wanted = v && /^\d+$/.test(v) ? parseInt(v, 10) : null;
      const p = qs.get("project");
      wantedProject = p && /^\d+$/.test(p) ? parseInt(p, 10) : null;
    } catch { /* ignore */ }
    loadChats().then((list) => {
      if (wanted != null) openChat(wanted);
      else if (wantedProject != null) openProject(wantedProject);
      else if (list.length > 0) openChat(list[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!run || run.status !== "running") return;
    pollRef.current = setInterval(async () => {
      try {
        const d = await bobFetch<Run>(`/runs/${run.id}`);
        setRun(d);
        if (d.tables) setTables(d.tables);
        if (d.status !== "running") {
          if (pollRef.current) clearInterval(pollRef.current);
          if (activeChat) {
            const chat = await bobFetch<any>(`/chats/${activeChat}`);
            setMessages(chat.messages);
            setTables(chat.tables || []);
          }
          loadChats();
          loadCredits();          // a finished run charges AI credits, so refresh
        }
      } catch (e) {
        handleError(e);
      }
    }, 2500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.id, run?.status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, run?.events?.length]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current || !layoutRef.current) return;
      const rect = layoutRef.current.getBoundingClientRect();
      const pct = ((rect.right - e.clientX) / rect.width) * 100;
      setTablePct(Math.min(72, Math.max(30, pct)));
    };
    const up = () => { dragging.current = false; document.body.style.cursor = ""; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const newChat = async (inProject: number | null = null) => {
    // Don't create a server chat yet: an empty one is throwaway. Reset to the
    // empty state; the first message (or file) creates the chat lazily, filed into
    // the project it was started from (if any).
    setMenuFor(null);
    await dropCurrentIfEmpty();
    setMessages([]);
    setTables([]);
    setRun(null);
    setPendingFiles([]);
    setActiveChat(null);
    setChatInfo(null);
    setProjectView(null);
    setPendingProject(inProject);
    try { window.history.replaceState({}, "", homePath()); } catch { /* ignore */ }
    setMode("split");
  };

  // The server creates a chat lazily, on the first message or file.
  const createServerChat = async (): Promise<number> => {
    const d = await bobFetch<{ id: number }>("/chats", {
      method: "POST",
      body: pendingProject != null ? JSON.stringify({ project_id: pendingProject }) : undefined,
    });
    setPendingProject(null);
    return d.id;
  };

  const deleteChat = async (id: number) => {
    setMenuFor(null);
    if (!confirm("Delete this chat and its tables?")) return;
    try {
      await bobFetch(`/chats/${id}`, { method: "DELETE" });
      const list = await loadChats();
      if (projectView != null) loadProject(projectView);
      if (activeChat === id) {
        if (projectView != null) {
          setActiveChat(null); setMessages([]); setTables([]); setRun(null); setChatInfo(null);
        } else if (list.length > 0) openChat(list[0].id);
        else {
          setActiveChat(null); setMessages([]); setTables([]); setRun(null); setChatInfo(null);
          try { window.history.replaceState({}, "", homePath()); } catch { /* ignore */ }
        }
      }
    } catch (e) {
      handleError(e);
    }
  };

  // After any organising action: the sidebar, and the open project page, re-read the server.
  const refreshLists = async () => {
    await loadChats();
    if (projectView != null) loadProject(projectView);
  };

  const togglePin = async (c: ChatSummary) => {
    setMenuFor(null);
    try {
      await bobFetch(`/chats/${c.id}/pin`, { method: c.pinned ? "DELETE" : "POST" });
      if (chatInfo?.id === c.id) setChatInfo({ ...chatInfo, pinned: !c.pinned });
      await refreshLists();
    } catch (e) {
      if (e instanceof BobError && e.status === 409) setNotice(e.message);
      else handleError(e);
    }
  };

  // Throws on failure so the dialog that called it can show the message.
  const fileChat = async (chatId: number, projectId: number | null, projectName?: string) => {
    await bobFetch(`/chats/${chatId}/project`, { method: "PUT", body: JSON.stringify({ project_id: projectId }) });
    if (chatInfo?.id === chatId) {
      setChatInfo({ ...chatInfo, project_id: projectId,
                    project_name: projectId == null ? null : (projectName || projects.find((p) => p.id === projectId)?.name || null) });
    }
    await refreshLists();
  };

  const createProject = async (name: string): Promise<Project> => {
    const d = await bobFetch<{ project: Project }>("/projects", { method: "POST", body: JSON.stringify({ name }) });
    return d.project;
  };

  const renameProject = async (id: number, name: string) => {
    await bobFetch(`/projects/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
    if (chatInfo?.project_id === id) setChatInfo({ ...chatInfo, project_name: name });
    await refreshLists();
  };

  const deleteProject = async (p: Project) => {
    await bobFetch(`/projects/${p.id}`, { method: "DELETE" });
    if (chatInfo?.project_id === p.id) setChatInfo({ ...chatInfo, project_id: null, project_name: null });
    if (projectView === p.id) {
      setProjectView(null);
      try { window.history.replaceState({}, "", activeChat ? `${homePath()}?chat=${activeChat}` : homePath()); } catch { /* ignore */ }
    }
    await loadChats();
  };

  const renameChat = async (id: number, title: string) => {
    const d = await bobFetch<{ title: string }>(`/chats/${id}`, { method: "PATCH", body: JSON.stringify({ title }) });
    if (chatInfo?.id === id) setChatInfo({ ...chatInfo, title: d.title });
    await refreshLists();
  };

  // Close the chat options menu on an outside click or Escape.
  useEffect(() => {
    if (menuFor == null) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuFor(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuFor(null); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [menuFor]);
  // New look: the menu is fixed to the window, so it closes when the window is resized.
  useEffect(() => {
    if (ui !== "new" || menuFor == null) return;
    const close = () => setMenuFor(null);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [ui, menuFor]);

  const stopRun = async () => {
    if (!run || stopping) return;
    setStopping(true);
    try { await bobFetch(`/runs/${run.id}/stop`, { method: "POST" }); } catch { /* best-effort */ }
  };

  // Several resumes or screenshots picked, pasted or dropped together land in ONE chat: the chat is
  // created once for the batch, because each upload reading activeChat on its own would see the stale
  // null and open a chat per file. One unreadable file is reported by name and never drops the others.
  const uploadFiles = async (list: globalThis.File[]) => {
    const files = list.filter(Boolean);
    if (!files.length) return;
    setUploading(true);
    try {
      let chatId = activeChat;
      if (!chatId) {
        chatId = await createServerChat();
        setActiveChat(chatId);
        loadChats();
      }
      for (const f of files) {
        try {
          const fd = new FormData();
          fd.append("file", f);
          const res = await fetch(`${API}/chats/${chatId}/files`, {
            method: "POST",
            headers: authHeaders(),
            body: fd,
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new BobError(data?.detail || "Upload failed", res.status);
          setPendingFiles((p) => [...p, { id: data.file_id, name: f.name }]);
        } catch (e: any) {
          alert(`${f.name}: ${e?.message || "Could not read that file"}`);
          if (e instanceof BobError) handleError(e);
        }
      }
    } catch (e: any) {
      alert(e?.message || "Could not start a chat for the upload");
      if (e instanceof BobError) handleError(e);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // A screenshot pasted into the message box is uploaded like an attached image; pasted text is untouched.
  const onComposerPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const images = Array.from(e.clipboardData?.items || [])
      .filter((it) => it.kind === "file" && it.type.startsWith("image/"))
      .map((it, i) => {
        const blob = it.getAsFile();
        if (!blob) return null;
        const ext = (blob.type.split("/")[1] || "png").replace("jpeg", "jpg");
        return new File([blob], `screenshot-${Date.now()}-${i + 1}.${ext}`, { type: blob.type });
      })
      .filter(Boolean) as globalThis.File[];
    if (images.length) {
      e.preventDefault();
      uploadFiles(images);
    }
  };

  const send = async (text?: string) => {
    let content = (text ?? input).trim();
    if ((!content && pendingFiles.length === 0) || sending) return;
    if (pendingFiles.length > 0) {
      const names = pendingFiles.map((f) => f.name).join(", ");
      content = `[Attached: ${names}]\n${content || "Analyze the attached file(s) and proceed."}`;
    }
    let chatId = activeChat;
    setSending(true);
    try {
      if (!chatId) {
        chatId = await createServerChat();
        setActiveChat(chatId);
      }
      setMessages((m) => [...m, { id: Date.now(), role: "user", content, created_at: "" }]);
      setInput("");
      setPendingFiles([]);
      const d = await bobFetch<{ run_id: number }>(`/chats/${chatId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      setRun({ id: d.run_id, status: "running", events: [], counters: {}, credits_used: 0, answer: "" });
      loadChats();
    } catch (e: any) {
      if (e instanceof BobError && e.status === 409) {
        alert("Sensei is still working on this chat. Wait for the current run to finish.");
      } else if (e instanceof BobError && e.status === 402) {
        setNotice(e.message || "Out of AI credits. Buy enrichments to refill. Each one includes a full search.");
        setMessages((m) => m.filter((x) => x.created_at !== "" || x.content !== content));
      } else {
        handleError(e);
      }
    } finally {
      setSending(false);
    }
  };

  const updateRowStatus = async (rowId: number, status: string) => {
    try {
      await bobFetch(`/rows/${rowId}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setTables((ts) => ts.map((t) => ({
        ...t,
        rows: t.rows.map((r) => (r.id === rowId ? { ...r, status } : r)),
      })));
    } catch (e) { handleError(e); }
  };

  // ── Contact reveal (on-demand paid enrichment) ──
  const refreshTables = useCallback(async () => {
    if (!activeChat) return;
    try {
      const chat = await bobFetch<any>(`/chats/${activeChat}`);
      setTables(chat.tables || []);
    } catch (e) { handleError(e); }
  }, [activeChat, handleError]);

  // Optimistically flip a row's contact status so the button reacts instantly;
  // the background poll then reconciles with the real found/not_found result.
  const markEnriching = (rowIds: Set<number>) => {
    setTables((ts) => ts.map((t) => ({
      ...t,
      rows: t.rows.map((r) => (rowIds.has(r.id)
        ? { ...r, cells: { ...r.cells, _contact_status: "enriching", _contact_note: "" } }
        : r)),
    })));
  };

  const onEnrichError = (e: unknown) => {
    if (e instanceof BobError && e.status === 402) {
      setNotice(e.message || "Out of enrichment credits. Top up to reveal contacts.");
    } else { handleError(e); }
    refreshTables();
  };

  // A tiered workspace has separate pools, so "enrich this" is not a default to
  // assume: it is a question. These buttons used to post with no tier and the
  // backend fell through to whatever the default was, which could drain a pool
  // the user never chose. Nothing is spent until they pick.
  const [pendingEnrich, setPendingEnrich] = useState<
    { kind: "row"; id: number } | { kind: "table"; id: number; count: number } | null
  >(null);

  const enrichRow = async (rowId: number, tier?: string) => {
    if (credits?.tiers?.length && !tier) { setPendingEnrich({ kind: "row", id: rowId }); return; }
    markEnriching(new Set([rowId]));
    try {
      await bobFetch(`/rows/${rowId}/enrich${tier ? `?tier=${tier}` : ""}`, { method: "POST" });
    } catch (e) { onEnrichError(e); }
  };

  const enrichTable = async (tableId: number, tier?: string) => {
    const t = tables.find((x) => x.id === tableId);
    if (!t) return;
    const todo = new Set(
      t.rows
        .filter((r) => !["found", "enriching"].includes(str(r.cells._contact_status)))
        .map((r) => r.id),
    );
    if (todo.size === 0) return;
    if (credits?.tiers?.length && !tier) {
      setPendingEnrich({ kind: "table", id: tableId, count: todo.size });
      return;
    }
    markEnriching(todo);
    try {
      await bobFetch(`/tables/${tableId}/enrich${tier ? `?tier=${tier}` : ""}`, { method: "POST" });
    } catch (e) { onEnrichError(e); }
  };

  const deleteRow = async (rowId: number) => {
    try {
      await bobFetch(`/rows/${rowId}`, { method: "DELETE" });
      setTables((ts) => ts.map((t) => ({ ...t, rows: t.rows.filter((r) => r.id !== rowId) })));
    } catch (e) { handleError(e); }
  };

  // While any row is enriching, poll the table until every reveal settles.
  const anyEnriching = useMemo(
    () => tables.some((t) => t.rows.some((r) => str(r.cells._contact_status) === "enriching")),
    [tables],
  );
  const enrichPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (enrichPollRef.current) { clearInterval(enrichPollRef.current); enrichPollRef.current = null; }
    if (!anyEnriching) { loadCredits(); return; }   // reveals settled -> refresh balance
    enrichPollRef.current = setInterval(() => { refreshTables(); loadCredits(); }, 3000);
    return () => { if (enrichPollRef.current) clearInterval(enrichPollRef.current); };
  }, [anyEnriching, refreshTables, loadCredits]);

  const running = run?.status === "running";
  useEffect(() => { if (!running) setStopping(false); }, [running]);
  // Quick-lookup tables (a profile link, a name at a company, a job link or a screenshot -> that contact's number) show
  // as contact cards in the chat, never in the side panel: the panel is for searches (owner, 2026-10-15). "Open as
  // table" on the cards shows them there on request, for that chat only.
  const quickTables = tables.filter((t) => QUICK_TABLES.has(t.name));
  const panelTables = tables.filter((t) => !QUICK_TABLES.has(t.name));
  const quickPanel = quickPanelFor != null && quickPanelFor === activeChat;
  const hasTables = panelTables.length > 0 || (quickPanel && quickTables.length > 0);
  // Mount the results panel as soon as a run STARTS (not only once a table object
  // exists), so the live-progress banner + provisional rows can show immediately.
  // A run is only SEARCHING once it has actually opened a table. Keying the
  // research UI off `running` alone made every run flash the split view, the
  // neural-net panel and "about 10 min left" for a few seconds, including runs
  // that were only going to come back with one clarifying question. create_table
  // is the first thing a real search does, so it is the honest signal.
  // A chat that ALREADY has a table needs more than that: a follow-up there ("which site did you get this number
  // from", a quick lookup, "which opening fits which student") is not a search, yet it showed "Sensei is researching,
  // 14 min left, 202 sourced" for a 12-second answer (owner, 2026-10-15). The backend writes what the turn is to the
  // run's counters a second or two in; until it has, and for every turn that is not a search, the quiet thinking
  // line shows instead.
  const rc = (run?.counters || {}) as Record<string, unknown>;
  const turnKnown = typeof rc._chat_only === "boolean";
  const notASearch = rc._chat_only === true || rc._lookup_turn === true || rc._match_turn === true;
  const searching = running && hasTables && turnKnown && !notASearch;
  const showTable = (hasTables || searching) && viewMode !== "chat";
  // a chat with nothing for the side panel always shows the chat, whatever view was picked before
  const showChat = viewMode !== "table" || !showTable;
  // What a short (non-search) turn is doing right now, from its own events ("Looking up 2 contacts").
  let liveStep = "";
  if (running && !searching) {
    const evs = run?.events || [];
    for (let i = evs.length - 1; i >= 0 && !liveStep; i--) {
      const l = String(evs[i]?.label || "");
      if (/^(looking up|reading the job|finding the hiring contact|matching each student)/i.test(l)) liveStep = l;
    }
  }
  const lastMsg = messages[messages.length - 1];
  const suggestions: string[] =
    !running && lastMsg?.role === "assistant" ? lastMsg.meta?.suggestions || [] : [];
  // Coach card data: only after a run finishes, from the last assistant message's diagnosis.
  const coach: Coach | null = (!running && lastMsg?.role === "assistant" && lastMsg.meta?.diagnosis)
    ? { diagnosis: lastMsg.meta.diagnosis, levers: lastMsg.meta.levers || [] }
    : null;
  // A brand-new chat with nothing said yet. The greeting and the composer centre
  // together as one block instead of sitting at opposite ends of the pane.
  const atRest = messages.length === 0 && !running;

  // Personal organisation shows only for a signed-in person on a backend that has it.
  const canOrganize = !!me?.email && !!me?.capabilities?.projects;
  const pinnedIds = new Set(pinned.map((c) => c.id));
  const recent = canOrganize ? chats.filter((c) => !pinnedIds.has(c.id)) : chats;
  const pinnedFull = pinned.length >= MAX_PINS;
  const openProjectObj = projectView != null ? projects.find((p) => p.id === projectView) : undefined;
  const pendingProjectName = pendingProject != null ? projects.find((p) => p.id === pendingProject)?.name : undefined;
  const headerTitle = projectView != null
    ? (openProjectObj?.name || "Project")
    : (chatInfo && chatInfo.id === activeChat ? chatInfo.title : "")
      || chats.find((c) => c.id === activeChat)?.title
      || (pendingProjectName ? `New chat in ${pendingProjectName}` : "New conversation");
  const projectChip = projectView == null && chatInfo && chatInfo.id === activeChat && chatInfo.project_id
    ? { id: chatInfo.project_id, name: chatInfo.project_name || "Project" } : null;
  const SECTION = "flex items-center justify-between px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400";
  const MENU_ITEM = "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed";

  const renderChatRow = (c: ChatSummary) => {
    const active = projectView == null && activeChat === c.id;
    const manage = c.can_manage !== false;
    const hasMenu = canOrganize || manage;
    return (
      <div key={c.id}
        className={`relative flex items-center gap-1 pl-3 pr-1 py-1 mb-1 rounded-xl text-sm border-2 transition-colors ${
          active ? "bg-violet-100 border-neutral-900" : "border-transparent hover:bg-neutral-100"}`}>
        <button onClick={() => { openChat(c.id); if (narrow) setSidebarOpen(false); }} className="flex-1 min-w-0 text-left py-1">
          <span className="block truncate" title={ui === "new" ? c.title : undefined}>{ui === "new" ? chatLabel(c.title) : c.title}</span>
          {canOrganize && c.project_name && (
            <span className="flex items-center gap-1 text-[10.5px] text-violet-600 truncate">
              <FiFolder size={10} className="shrink-0" />{c.project_name}
            </span>
          )}
        </button>
        {hasMenu && (
          <button aria-label="Chat options" aria-haspopup="menu" aria-expanded={menuFor === c.id}
            onClick={(e) => {
              e.stopPropagation();
              if (ui === "new") { menuBtn.current = e.currentTarget; setMenuAt(sxMenuPlacement(e.currentTarget.getBoundingClientRect())); }
              setMenuFor(menuFor === c.id ? null : c.id);
            }}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100">
            <FiMoreHorizontal size={15} />
          </button>
        )}
        {menuFor === c.id && (
          <div ref={menuRef} role="menu"
            style={ui === "new" && menuAt ? { position: "fixed", top: menuAt.top ?? "auto", bottom: menuAt.bottom ?? "auto", left: menuAt.left, right: "auto", marginTop: 0 } : undefined}
            className="absolute right-1 top-full z-30 mt-1 w-56 bg-white border-2 border-neutral-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] p-1 text-[13px]">
            {canOrganize && (
              <button role="menuitem" onClick={() => togglePin(c)} disabled={!c.pinned && pinnedFull}
                title={!c.pinned && pinnedFull ? `You can pin up to ${MAX_PINS} chats. Unpin one first.` : undefined}
                className={MENU_ITEM}>
                {c.pinned ? <LuPinOff size={14} /> : <LuPin size={14} />}
                {c.pinned ? "Unpin" : pinnedFull ? `Pin to top (${MAX_PINS} of ${MAX_PINS} pinned)` : "Pin to top"}
              </button>
            )}
            {canOrganize && (
              <button role="menuitem" onClick={() => { setMenuFor(null); setMoveFor(c); }} className={MENU_ITEM}>
                <FiFolderPlus size={14} /> {c.project_id ? "Move to another project" : "Add to project"}
              </button>
            )}
            {canOrganize && c.project_id != null && (
              <button role="menuitem" className={MENU_ITEM}
                onClick={async () => {
                  setMenuFor(null);
                  try { await fileChat(c.id, null); } catch (e: any) { setNotice(e?.message || "Could not remove it from the project"); }
                }}>
                <FiFolderMinus size={14} /> <span className="truncate">Remove from {c.project_name}</span>
              </button>
            )}
            {manage && !!me?.capabilities?.projects && (
              <button role="menuitem" onClick={() => { setMenuFor(null); setNameDialog({ kind: "rename-chat", id: c.id, value: c.title }); }}
                className={MENU_ITEM}>
                <FiEdit2 size={14} /> Rename
              </button>
            )}
            {manage && (
              <button role="menuitem" onClick={() => shareChat(c.id)} className={MENU_ITEM}>
                <FiUsers size={14} /> Share with your team
              </button>
            )}
            {manage && (
              <button role="menuitem" onClick={() => deleteChat(c.id)} className={`${MENU_ITEM} text-red-600`}>
                <FiTrash2 size={14} /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`h-screen bg-[#faf7f2] flex overflow-hidden font-['Satoshi'] text-neutral-900 ${dark ? (ui === "new" ? "sx-dark" : "bob-dark") : ""}`}>
      {showTeam && <TeamModal orgName={me?.org?.name || "your workspace"} onClose={() => setShowTeam(false)} />}
      {showEnrich && <EnrichModal onClose={() => { setShowEnrich(false); loadCredits(); }} />}
      {pendingEnrich && credits?.tiers?.length && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
             onClick={() => setPendingEnrich(null)}>
          <div className="w-full max-w-md bg-white border-2 border-neutral-900 rounded-[24px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] p-6"
               onClick={(e) => e.stopPropagation()}>
            <h2 className="font-['Clash_Display'] text-lg font-semibold mb-1">
              Which enrichment should we use?
            </h2>
            <p className="text-[13px] text-neutral-500 mb-4">
              {pendingEnrich.kind === "table"
                ? `${pendingEnrich.count} contact${pendingEnrich.count === 1 ? "" : "s"} to reveal.`
                : "One contact to reveal."}{" "}
              You are only charged when we find a personal mobile.
            </p>
            <div className="flex flex-col gap-2">
              {credits.tiers.map((t) => (
                <button key={t.key} disabled={t.balance <= 0}
                  onClick={() => {
                    const p = pendingEnrich;
                    setPendingEnrich(null);
                    if (p.kind === "row") enrichRow(p.id, t.key);
                    else enrichTable(p.id, t.key);
                  }}
                  className={`text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                    t.balance <= 0
                      ? "border-neutral-300 opacity-40 cursor-not-allowed"
                      : "border-neutral-900 hover:bg-violet-100"}`}>
                  <div className="text-[13.5px] font-semibold">{t.label}</div>
                  <div className="text-[11.5px] text-neutral-500 mt-0.5">
                    {t.balance <= 0 ? "no credits left" : `${t.balance} credits left`} · {t.detail}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setPendingEnrich(null)}
              className="mt-4 text-[13px] text-neutral-500 hover:text-neutral-900">Cancel</button>
          </div>
        </div>
      )}
      {showSupport && <SupportModal email={me?.email || ""} orgName={me?.org?.name || ""} onClose={() => setShowSupport(false)} />}
      {nameDialog?.kind === "new-project" && (
        <NameDialog title="New project" placeholder="e.g. Software development" initial="" submitLabel="Create project"
          maxLength={60} onClose={() => setNameDialog(null)}
          onSubmit={async (v) => { const p = await createProject(v); await loadChats(); openProject(p.id); }} />
      )}
      {nameDialog?.kind === "rename-project" && nameDialog.id != null && (
        <NameDialog title="Rename project" placeholder="Project name" initial={nameDialog.value} submitLabel="Save"
          maxLength={60} onClose={() => setNameDialog(null)}
          onSubmit={(v) => renameProject(nameDialog.id as number, v)} />
      )}
      {nameDialog?.kind === "rename-chat" && nameDialog.id != null && (
        <NameDialog title="Rename chat" placeholder="Chat name" initial={nameDialog.value} submitLabel="Save"
          maxLength={120} onClose={() => setNameDialog(null)}
          onSubmit={(v) => renameChat(nameDialog.id as number, v)} />
      )}
      {moveFor && (
        <MoveDialog chatTitle={moveFor.title} projects={projects} currentId={moveFor.project_id ?? null}
          onClose={() => setMoveFor(null)}
          onPick={(pid) => fileChat(moveFor.id, pid)}
          onCreate={async (name) => { const p = await createProject(name); await fileChat(moveFor.id, p.id, p.name); }} />
      )}
      {deletingProject && (
        <ConfirmDialog title={`Delete \u201c${deletingProject.name}\u201d?`} confirmLabel="Delete project"
          message={`Its ${deletingProject.chat_count} chat${deletingProject.chat_count === 1 ? "" : "s"} stay in your sidebar. They only leave the project.`}
          onConfirm={() => deleteProject(deletingProject)} onClose={() => setDeletingProject(null)} />
      )}
      {showChangePw && (
        <ChangePasswordModal
          onClose={() => setShowChangePw(false)}
          onChanged={() => { setShowChangePw(false); alert("Password changed. Please sign in again."); signOut(); }}
        />
      )}
      <style>{`
        @keyframes bobFlash { 0% { background-color: rgb(221 214 254); } 100% { background-color: transparent; } }
        .bob-new { animation: bobFlash 2.5s ease-out; }
        /* Provisional (in-review) rows from the live overlay: dimmed + a subtle stripe,
           so they read as "still being checked", never as a finished/enrichable lead. */
        .bob-prov { opacity: .62; }
        .bob-prov:hover { opacity: .82; }
        @keyframes bobPop { 0% { opacity: 0; transform: translateY(8px) scale(0.98); } 100% { opacity: 1; transform: none; } }
        .bob-pop { animation: bobPop 0.35s ease-out; }
        .bob-thinscroll::-webkit-scrollbar { height: 5px; width: 5px; }
        .bob-thinscroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,.18); border-radius: 9px; }
        .bob-thinscroll::-webkit-scrollbar-track { background: transparent; }
        /* The conversation surface. A flat cream panel read as an unfinished void
           next to the hard borders and offset shadows everywhere else in this UI,
           so the chat sits on a faint dot grid: the drafting-paper texture that
           belongs with a neo-brutalist system, and something for the bubbles to
           sit ON rather than float in. Pure CSS, no asset. */
        .bob-canvas {
          position: relative;
          background-image: radial-gradient(rgba(25,26,35,.085) 1px, transparent 1px);
          background-size: 22px 22px;
          background-position: -1px -1px;
        }
        .bob-dark .bob-canvas {
          background-image: radial-gradient(rgba(255,255,255,.075) 1px, transparent 1px);
        }
        /* A soft violet wash bleeding from the top, so the surface has a light
           source instead of reading as one uniform slab. Sits under content. */
        .bob-canvas::before {
          content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(120% 52% at 50% -10%, rgba(124,92,255,.10), transparent 62%),
            radial-gradient(80% 40% at 100% 0%, rgba(124,92,255,.05), transparent 60%);
        }
        .bob-dark .bob-canvas::before {
          background:
            radial-gradient(120% 52% at 50% -10%, rgba(124,92,255,.17), transparent 62%),
            radial-gradient(80% 40% at 100% 0%, rgba(124,92,255,.09), transparent 60%);
        }
        .bob-canvas > * { position: relative; z-index: 1; }
        /* Dark mode: override the app's hard-coded surface colours. */
        .bob-dark { background:#131316 !important; color:#e7e7ea; }
        .bob-dark .bg-white { background:#1c1c20 !important; }
        .bob-dark .bg-\\[\\#faf7f2\\] { background:#131316 !important; }
        .bob-dark .bg-\\[\\#f4f0e8\\] { background:#161619 !important; }
        .bob-dark .text-neutral-900 { color:#e7e7ea !important; }
        /* 700/800 are body/content text (table cells, chips): keep them BRIGHT so
           they don't camouflage on the dark surface (they were previously unmapped). */
        .bob-dark .text-neutral-800, .bob-dark .text-neutral-700 { color:#d4d4d8 !important; }
        .bob-dark .text-neutral-600, .bob-dark .text-neutral-500, .bob-dark .text-neutral-400, .bob-dark .text-neutral-300 { color:#9a9aa2 !important; }
        .bob-dark .border-neutral-900 { border-color:#3a3a42 !important; }
        .bob-dark .border-neutral-100, .bob-dark .border-neutral-200 { border-color:#2c2c33 !important; }
        .bob-dark .bg-neutral-50, .bob-dark .bg-neutral-100 { background:#242429 !important; }
        .bob-dark .hover\\:bg-neutral-100:hover, .bob-dark .hover\\:bg-neutral-50:hover { background:#26262c !important; }
        .bob-dark .bg-neutral-900 { background:#e7e7ea !important; color:#131316 !important; }
        .bob-dark input, .bob-dark textarea, .bob-dark select { background:#1c1c20 !important; color:#e7e7ea !important; }
        .bob-dark input::placeholder, .bob-dark textarea::placeholder { color:#6b6b73 !important; }
        /* Violet accents: mute them so they read on a dark surface. */
        .bob-dark .bg-violet-50 { background:#211c33 !important; }
        .bob-dark .bg-violet-100 { background:#2b2447 !important; }
        .bob-dark .text-violet-600, .bob-dark .text-violet-700, .bob-dark .text-violet-800 { color:#b3a1ff !important; }
        .bob-dark .border-violet-200, .bob-dark .border-violet-300 { border-color:#3d3363 !important; }
        /* Tailwind hover:* colour utilities aren't !important, so our neutral
           overrides would otherwise win on hover. Restore the intended accents. */
        .bob-dark .hover\\:text-red-600:hover { color:#f87171 !important; }
        .bob-dark .hover\\:text-violet-600:hover, .bob-dark .hover\\:text-violet-700:hover { color:#b3a1ff !important; }
        .bob-dark .hover\\:border-violet-500:hover { border-color:#7c5cff !important; }
        .bob-dark .hover\\:border-neutral-900:hover { border-color:#5a5a66 !important; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside
        className={`shrink-0 border-r-2 border-neutral-900 bg-white flex flex-col overflow-hidden transition-[width] duration-200 ${
          sidebarOpen ? "w-64" : "w-0 border-r-0"
        } ${narrow ? "sx-drawer" : ""}`}
      >
        <div className="w-64 flex flex-col h-full">
          <div className="h-12 shrink-0 px-3 border-b-2 border-neutral-900 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 border-2 border-neutral-900 rounded-lg overflow-hidden shrink-0">
                <SenseiMark />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="font-['Clash_Display'] text-base font-semibold leading-none">Sensei</div>
                <div className="text-[9px] text-neutral-400 truncate max-w-[110px]">{me?.org?.name || "by Studojo"}</div>
              </div>
            </div>
            <button
              onClick={toggleDark}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 shrink-0"
            >
              {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>
          </div>
          <div className="p-2 shrink-0">
            <button
              onClick={() => { newChat(); if (narrow) setSidebarOpen(false); }}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-neutral-900 text-white rounded-xl px-3 py-2.5 hover:bg-violet-700 transition-colors"
            >
              <FiPlus size={15} /> New chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4"
            onScroll={ui === "new" && menuFor != null ? (e) => {
              // New look: the menu follows its row while the list scrolls, and closes once the row is out of sight.
              const b = menuBtn.current;
              if (!b) return;
              const r = b.getBoundingClientRect(), l = e.currentTarget.getBoundingClientRect();
              if (r.bottom < l.top || r.top > l.bottom) setMenuFor(null);
              else setMenuAt(sxMenuPlacement(r));
            } : undefined}>
            {canOrganize && pinned.length > 0 && (
              <>
                <div className={SECTION}>
                  <span>Pinned</span>
                  <span className="font-semibold normal-case tracking-normal">{pinned.length} of {MAX_PINS}</span>
                </div>
                {pinned.map(renderChatRow)}
              </>
            )}
            {canOrganize && (
              <>
                <div className={SECTION}>
                  <span>Projects</span>
                  <button onClick={() => setNameDialog({ kind: "new-project", value: "" })} title="New project" aria-label="New project"
                    className="w-6 h-6 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100">
                    <FiPlus size={13} />
                  </button>
                </div>
                {projects.map((p) => (
                  <button key={p.id} onClick={() => { openProject(p.id); if (narrow) setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 mb-1 rounded-xl text-sm text-left border-2 transition-colors ${
                      projectView === p.id ? "bg-violet-100 border-neutral-900" : "border-transparent hover:bg-neutral-100"}`}>
                    <FiFolder size={14} className="shrink-0 text-violet-600" />
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-[11px] text-neutral-400 shrink-0">{p.chat_count}</span>
                  </button>
                ))}
                {projects.length === 0 && (
                  <button onClick={() => setNameDialog({ kind: "new-project", value: "" })}
                    className="w-full flex items-center gap-2 px-3 py-2 mb-1 rounded-xl text-sm text-left text-neutral-400 border-2 border-transparent hover:bg-neutral-100 hover:text-neutral-900">
                    <FiFolderPlus size={14} className="shrink-0" /> New project
                  </button>
                )}
                <div className={SECTION}><span>Recent</span></div>
              </>
            )}
            {recent.map(renderChatRow)}
            {chats.length === 0 && pinned.length === 0 && <p className="text-neutral-400 text-sm p-3">No chats yet.</p>}
          </div>
          <div className="p-3 border-t-2 border-neutral-900 shrink-0 space-y-2">
            {me?.role === "admin" && (
              <a
                href={dashboardUrl()}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold border-2 border-neutral-900 rounded-xl px-3 py-2.5 hover:bg-violet-500 hover:text-white transition-colors"
              >
                <FiUsers size={15} /> Team dashboard
              </a>
            )}
            {/* Only for a workspace whose product is finding people. Everyone else
                never sees this and its routes refuse them anyway. */}
            {me?.capabilities?.candidate_sourcing && (
              <button
                onClick={() => setShowEnrich(true)}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold border-2 border-neutral-900 rounded-xl py-2 bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                <FiUserPlus size={15} /> Enrich contacts
              </button>
            )}
            <button
              onClick={() => setShowSupport(true)}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold border-2 border-neutral-900 rounded-xl px-3 py-2.5 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              <FiMessageSquare size={15} /> Get support
            </button>
            {me?.email && (
              <>
                <div className="text-[11px] text-neutral-400 px-1 truncate" title={me.email}>{me.email}</div>
                <div className="flex items-center justify-between gap-2 text-[11px] px-1">
                  <button onClick={() => setShowChangePw(true)} className="font-semibold text-neutral-400 hover:text-violet-700">
                    Change password
                  </button>
                  <button onClick={signOut} className="shrink-0 font-semibold text-neutral-400 hover:text-neutral-900">Sign out</button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
      {narrow && sidebarOpen && (
        <div className="sx-scrim fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* ── Main ── (the landmark the "Skip to main content" link in app/root.tsx jumps to) */}
      <main id="main" className="flex-1 min-w-0 flex flex-col">

        <header className="h-12 shrink-0 border-b-2 border-neutral-900 bg-white flex items-center gap-2 px-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Hide chats" : "Show chats"}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <FiSidebar />
          </button>
          <h1 className="text-sm font-bold truncate">{ui === "new" ? chatLabel(headerTitle) : headerTitle}</h1>
          {projectChip && (
            <button onClick={() => openProject(projectChip.id)} title="Open this project"
              className="hidden sm:flex shrink-0 items-center gap-1 max-w-[180px] text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5 hover:border-violet-500">
              <FiFolder size={10} className="shrink-0" /><span className="truncate">{projectChip.name}</span>
            </button>
          )}
          {running && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-1">
              {/* "researching" is only true once a table exists; a run about to come
                  back with a clarifying question was falsely claiming to research. */}
              <FiLoader className="animate-spin" size={11} /> {searching ? "researching" : "thinking"}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {credits?.enabled && (
              <div className="flex items-center gap-1.5">
                {credits.tiers?.length
                  // A tiered workspace bills three SEPARATE pools, so one merged
                  // number would hide the thing the tiers exist to show.
                  ? credits.tiers.map((t) => <TierPill key={t.key} tier={t} />)
                  : <CreditPill kind="enrichment" value={credits.enrichment} />}
                <CreditPill kind="ai" value={credits.ai} />
              </div>
            )}
            {hasTables && projectView == null && (
              <div className="sx-seg flex items-center rounded-xl border-2 border-neutral-900 overflow-hidden">
                {([["chat", FiMessageSquare, "Chat only"], ["split", FiColumns, "Split view"], ["table", FiGrid, "Results only"]] as const).map(([m, Icon, label]) => (
                  <button
                    key={m}
                    onClick={() => setMode(m as PanelMode)}
                    title={label}
                    className={`w-9 h-8 flex items-center justify-center text-sm transition-colors ${
                      viewMode === m ? "bg-neutral-900 text-white" : "bg-white text-neutral-500 hover:bg-neutral-100"
                    }`}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {newVersion && (
          <div className="shrink-0 bg-violet-50 border-b-2 border-violet-500 text-violet-800 text-xs font-bold px-4 py-2 flex items-center justify-between gap-3">
            <span>A new version of Sensei is ready.</span>
            <button onClick={() => window.location.reload()}
              className="shrink-0 bg-violet-500 text-white border-2 border-neutral-900 rounded-lg px-2.5 py-1 hover:bg-violet-600">
              Reload
            </button>
          </div>
        )}

        {notice && (
          <div className="shrink-0 bg-red-50 border-b-2 border-red-500 text-red-700 text-xs font-bold px-4 py-2 flex items-center justify-between gap-3">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} className="text-red-400 hover:text-red-700 shrink-0" title="Dismiss">
              <FiX size={14} />
            </button>
          </div>
        )}

        {projectView != null ? (
          <ProjectPage key={projectView}
            project={openProjectObj}
            chats={projectChats}
            loading={projectLoading}
            meEmail={me?.email ?? null}
            onOpenChat={openChat}
            onNewChat={() => newChat(projectView)}
            onRename={() => { if (openProjectObj) setNameDialog({ kind: "rename-project", id: openProjectObj.id, value: openProjectObj.name }); }}
            onDelete={() => { if (openProjectObj) setDeletingProject(openProjectObj); }}
          />
        ) : (
        <div ref={layoutRef} className="flex-1 min-h-0 flex">

          {/* Chat */}
          {showChat && (
            <section className={`bob-canvas flex flex-col min-w-0 flex-1 ${atRest ? "justify-center" : ""}`}>
              {/* At rest the transcript area does not stretch, so this and the
                  composer below centre together as one block. Mid-conversation it
                  reverts to a normal scrolling transcript with a docked composer. */}
              <div ref={scrollRef} className={atRest ? "px-5 shrink-0" : "flex-1 overflow-y-auto px-5 py-6 flex flex-col"}>
                {atRest && <EmptyChat />}
                {/* mt-auto anchors a short transcript to the BOTTOM, so the first
                    exchange sits just above the composer instead of stranded at
                    the top of an empty pane. Long transcripts scroll normally. */}
                <div className="max-w-3xl w-full mx-auto space-y-4 mt-auto">
                  {groupMessages(messages).map((g, gi) => (
                    g.role === "user" ? (
                      <div key={g.items[0].id} className="flex justify-end">
                        {ui === "new" ? (
                          <UserBubble text={g.items.map((m) => m.content).join("\n\n")} />
                        ) : (
                          <div className={`sx-user max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md ${BRUT} bg-violet-500 text-white ${SHADOW} whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[14.5px] leading-relaxed`}>
                            {g.items.map((m) => m.content).join("\n\n")}
                          </div>
                        )}
                      </div>
                    ) : ui === "new" ? (
                      /* New look: one answer is one card, its lines the card's paragraphs. */
                      <div key={g.items[0].id} className="flex gap-3">
                        <div className="w-7 h-7 mt-0.5 shrink-0 rounded-lg overflow-hidden border-2 border-neutral-900">
                          <SenseiMark />
                        </div>
                        <div className={`sx-answer min-w-0 max-w-[92%] ${CARD} rounded-tl-md px-4 py-3 space-y-3`}>
                          {(() => {
                            // a student-by-student mapping sent as one line per student: each line leads with the name in bold
                            const texts = g.items.map((m) => plainAnswer(m.content));
                            const mapping = texts.filter((t) => MAPPING_LINE.test(t)).length >= 2;
                            return g.items.map((m, i) => <RichText key={m.id} text={texts[i]} leadNames={mapping} />);
                          })()}
                        </div>
                      </div>
                    ) : (
                      /* One avatar per TURN, and the turn's lines stack as
                         paragraphs instead of separate boxes. */
                      <div key={g.items[0].id} className="flex gap-3">
                        <div className="w-7 h-7 mt-0.5 shrink-0 rounded-lg overflow-hidden border-2 border-neutral-900">
                          <SenseiMark />
                        </div>
                        <div className="min-w-0 max-w-[92%] space-y-2.5">
                          {g.items.map((m) => (
                            <div key={m.id} className={`${CARD} rounded-tl-md px-4 py-3`}>
                              <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[14.5px] leading-[1.7] text-neutral-800">{plainAnswer(m.content)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                  {/* A lookup's results live here, in the chat, not in the side panel. */}
                  {!(quickPanel && showTable) && quickTables.some((t) => t.rows.length > 0) && (
                    <QuickResults tables={quickTables} onEnrichRow={enrichRow}
                      onOpenTable={() => { setQuickPanelFor(activeChat); setMode(narrow ? "table" : "split"); }} />
                  )}
                  {/* Until we know this run is a search, and for every run that
                      is not one, show a quiet thinking line rather than a progress
                      bar promising "10 min left". */}
                  {running && !searching && (
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 mt-0.5 shrink-0 rounded-lg overflow-hidden border-2 border-neutral-900">
                        <SenseiMark />
                      </div>
                      <div className={`${CARD} rounded-tl-md px-4 py-3 flex items-center gap-1.5`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse [animation-delay:300ms]" />
                        {liveStep && <span className="ml-1.5 text-[13px] font-semibold text-neutral-600">{liveStep}…</span>}
                      </div>
                    </div>
                  )}
                  {searching && run && <RunProgress run={run} />}
                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-10">
                      {suggestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => send(q)}
                          className="text-[12.5px] font-semibold bg-white border-2 border-neutral-900 rounded-full px-3.5 py-1.5 text-neutral-700 hover:bg-violet-500 hover:text-white transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={atRest ? "px-3 pb-3" : "border-t-2 border-neutral-900 bg-white p-3"}>
                {pendingFiles.length > 0 && (
                  <div className="max-w-3xl mx-auto flex flex-wrap gap-1.5 mb-2">
                    {pendingFiles.map((f) => (
                      <span key={f.id} className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-300 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold text-violet-800">
                        <FiFile size={12} /> {f.name}
                        <span className="text-violet-400 font-normal">attached</span>
                      </span>
                    ))}
                  </div>
                )}
                {/* One composer, not three floating boxes. The attach and send
                    controls live INSIDE the field, the way every chat product
                    does it, so it reads as a single object to type into rather
                    than a field flanked by two unrelated buttons. */}
                <div className="max-w-3xl mx-auto">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.xlsx,.xlsm,.csv,.txt,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={(e) => {
                      uploadFiles(Array.from(e.target.files || []));
                    }}
                  />
                  <div
                    className="sx-composer border-2 border-neutral-900 rounded-2xl bg-white transition-all focus-within:shadow-[5px_5px_0px_0px_rgba(124,92,255,1)]"
                    onDragOver={(e) => { if (e.dataTransfer?.types?.includes("Files")) e.preventDefault(); }}
                    onDrop={(e) => {
                      const dropped = Array.from(e.dataTransfer?.files || []);
                      if (dropped.length && !running && !uploading) { e.preventDefault(); uploadFiles(dropped); }
                    }}
                  >
                    <textarea
                      ref={composerRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onPaste={onComposerPaste}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                      }}
                      rows={2}
                      placeholder={running ? "Sensei is working on it. Ask your next question when it finishes." : "Ask for companies, or paste job links, a job description, a LinkedIn profile or a screenshot..."}
                      disabled={running}
                      className="w-full bg-transparent px-4 pt-3.5 pb-1 text-[14.5px] leading-relaxed resize-none focus:outline-none disabled:opacity-60 rounded-2xl"
                    />
                    <div className="flex items-center justify-between px-2.5 pb-2.5">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={running || uploading}
                        aria-label="Attach files"
                        title="Attach resumes, a cohort sheet or screenshots (PDF, Word, Excel, CSV, images)"
                        className="w-9 h-9 rounded-xl border-2 border-neutral-900 bg-white text-neutral-600 flex items-center justify-center hover:bg-violet-50 hover:text-violet-700 transition-colors disabled:opacity-40"
                      >
                        {uploading ? <FiLoader className="animate-spin" size={15} /> : <FiPaperclip size={15} />}
                      </button>
                      {running ? (
                        <button
                          onClick={stopRun}
                          disabled={stopping}
                          aria-label="Stop this run"
                          title="Stop this run (keeps what's already found)"
                          className="bg-red-600 text-white w-9 h-9 rounded-xl flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-60 border-2 border-neutral-900"
                        >
                          {stopping ? <FiLoader className="animate-spin" size={14} /> : <span className="w-3 h-3 bg-white rounded-[3px]" />}
                        </button>
                      ) : (
                        <button
                          onClick={() => send()}
                          disabled={sending || !input.trim()}
                          aria-label="Send"
                          className="bg-violet-700 text-white w-9 h-9 rounded-xl border-2 border-neutral-900 flex items-center justify-center hover:bg-violet-800 transition-colors disabled:opacity-30"
                        >
                          {sending ? <FiLoader className="animate-spin" size={15} /> : <FiSend size={15} />}
                        </button>
                      )}
                    </div>
                  </div>
                  {atRest && ui === "new" && (
                    <Starters
                      onFill={(t) => { setInput(t); requestAnimationFrame(() => { const el = composerRef.current; if (el) { el.focus(); el.setSelectionRange(t.length, t.length); } }); }}
                      onAttach={() => fileInputRef.current?.click()} />
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Divider */}
          {showChat && showTable && (
            <div
              onPointerDown={() => { dragging.current = true; document.body.style.cursor = "col-resize"; }}
              className="w-[6px] shrink-0 cursor-col-resize bg-neutral-900 hover:bg-violet-500 transition-colors relative group"
              title="Drag to resize"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-10 rounded-full bg-white/60 group-hover:bg-white" />
            </div>
          )}

          {/* Results: full-width Work view reuses the SAME rich table as the split view
              (DenseTable = every column: fit score, city, hiring evidence, why now, what
              they do, ...), with its detail drawer, cards toggle and reduce-to-split. The
              old bespoke WorkGrid only showed company/contact/phone/email, so the Work
              table read as blank vs prod. */}
          {showTable && viewMode === "table" && (
            <ResultsPanel
              widthPct={tablePct}
              fullWidth={true}
              tables={tables}
              run={searching ? run : null}
              expanded={true}
              onExpand={() => setMode("split")}
              viewPref={viewPref}
              onViewPref={setViewPref}
              onRowStatus={updateRowStatus}
              onEnrichRow={enrichRow}
              onEnrichTable={enrichTable}
              onDeleteRow={deleteRow}
              coach={coach}
              onLever={send}
            />
          )}
          {showTable && viewMode !== "table" && (
            <ResultsPanel
              widthPct={tablePct}
              fullWidth={false}
              tables={tables}
              run={searching ? run : null}
              expanded={false}
              onExpand={() => setMode("table")}
              viewPref={viewPref}
              onViewPref={setViewPref}
              onRowStatus={updateRowStatus}
              onEnrichRow={enrichRow}
              onEnrichTable={enrichTable}
              onDeleteRow={deleteRow}
              coach={coach}
              onLever={send}
            />
          )}
        </div>
        )}
      </main>
    </div>
  );
}

type MsgGroup = { role: string; items: { id: any; content: string }[] };

function groupMessages(msgs: any[]): MsgGroup[] {
  const out: MsgGroup[] = [];
  for (const m of msgs) {
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.items.push(m);
    else out.push({ role: m.role, items: [m] });
  }
  return out;
}


// One surface language for the whole workspace, so chat and results agree.
// ── Brutalist design tokens (LOCKED, owner directive) ──────────────────────────────────────────
// The Sensei look is a HARD black outline + solid offset shadow, never soft/thin. Do NOT flatten
// these to shadow-sm / thin neutral-200 borders: that "calm design system" pass was reverted.
const BRUT = "border-2 border-neutral-900";
const SHADOW = "shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]";
const PRESS = "transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]";
const CARD = `bg-white ${BRUT} rounded-2xl ${SHADOW}`;

// The chat shows ONLY natural language. Internal pipeline output (the "search REPORT" funnel dump:
// harvested/extracted/verified counts, "rejected at shortlist ... x673", pool caps, stage names)
// must NEVER reach a user, so it is stripped HERE as well as at the source. Belt and braces: the
// backend resume path used to answer with that raw report verbatim, and those messages are already
// stored in chat history: this keeps them out of the UI even when re-read from the DB.
const _INTERNAL_LINE =
  /^\s*(?:search|pipeline)\s+REPORT\b|^\s*harvested items:|^\s*opportunities:\s*extracted|^\s*rejected at\b|^\s*stopped:|^\s*stage\s|^\s*=== /i;

function plainAnswer(text: string): string {
  const raw = String(text || "");
  // A report-shaped message: rebuild it as the one plain sentence a person actually wants.
  if (/^\s*(?:search|pipeline)\s+REPORT/i.test(raw) || /harvested items:/i.test(raw)) {
    const n = raw.match(/written\s+(\d+)/i)?.[1];
    const loc = raw.match(/location\s+([^,)]+(?:,\s*[^,)]+)?)/i)?.[1]?.trim();
    const fresh = raw.match(/freshness\s+(\d+)\s*d/i)?.[1];
    const bits = [loc && `in ${loc}`, fresh && `posted in the last ${fresh} days`].filter(Boolean);
    const where = bits.length ? `, ${bits.join(", ")}` : "";
    if (n && n !== "0") {
      return `Found ${n} compan${n === "1" ? "y" : "ies"}${where}. They're in the table on the right.`;
    }
    return `No companies cleared this search${where}.`;
  }
  // Otherwise keep the model's own words, minus any internal lines that leaked into them.
  const kept = raw.split("\n").filter((ln) => !_INTERNAL_LINE.test(ln));
  return (kept.join("\n").trim() || raw.trim());
}

// Short names for the header; the full label lives in the popover. Three pills
// have to fit beside the AI counter without wrapping.
const TIER_SHORT: Record<string, string> = { tier1: "Full", tier2: "Pipeline", tier3: "DB" };

function TierPill({ tier }: { tier: EnrichTier }) {
  const [open, setOpen] = useState(false);
  const low = tier.balance <= 0;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title={`${tier.label}: ${tier.detail}`}
        className={`flex items-center gap-1 text-[11px] font-bold rounded-full border-2 px-2.5 py-1 transition-colors ${
          low ? "bg-red-50 border-red-500 text-red-600" : "bg-white border-neutral-900 text-neutral-900 hover:bg-neutral-100"
        }`}
      >
        <FiPhone size={11} />
        <span className="tabular-nums">{tier.balance}</span>
        <span className="font-medium text-neutral-400">{TIER_SHORT[tier.key] || tier.label}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 z-50 bg-white border-2 border-neutral-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] p-4 text-left">
            <div className="text-2xl font-black leading-none tabular-nums">{tier.balance}</div>
            <div className="text-sm font-semibold text-neutral-500 mb-2">{tier.label} credits left</div>
            <p className="text-[12.5px] text-neutral-500 leading-snug">{tier.detail}</p>
            <p className="text-[12px] text-neutral-500 mt-2 leading-snug">
              This tier has its own balance. Run the same list through more than one to compare hit rates. You are only charged for a contact we actually find.
            </p>
            {low && <p className="text-[12px] text-red-600 font-semibold mt-2">Out of credits in this tier.</p>}
          </div>
        </>
      )}
    </div>
  );
}

function CreditPill({ kind, value }: { kind: "enrichment" | "ai"; value: number }) {
  const [open, setOpen] = useState(false);
  const low = value <= 0;
  // Effectively-unlimited balances (internal accounts) show as ∞.
  const unlimited = value >= 100_000_000;
  const display = unlimited ? "∞" : value.toLocaleString();
  const icon = kind === "enrichment" ? <FiPhone size={11} /> : <FiZap size={11} />;
  const label = kind === "enrichment" ? "reveals" : "AI";
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 text-[11px] font-bold rounded-full border-2 px-2.5 py-1 transition-colors ${
          low ? "bg-red-50 border-red-500 text-red-600" : "bg-white border-neutral-900 text-neutral-900 hover:bg-neutral-100"
        }`}
      >
        {icon}
        {display}
        <span className="font-medium text-neutral-400">{label}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 z-50 bg-white border-2 border-neutral-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] p-4 text-left">
            {kind === "enrichment" ? (
              <>
                <div className="text-2xl font-black leading-none">{display}</div>
                <div className="text-sm font-semibold text-neutral-500 mb-2">phone reveals left</div>
                <p className="text-[12.5px] text-neutral-500 leading-snug">
                  1 credit reveals a verified phone + email for one contact, and you're only charged when we find a real number. Each also includes a full AI search allowance.
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-black leading-none">{unlimited ? "Unlimited" : display}</div>
                <div className="text-sm font-semibold text-neutral-500 mb-2">{unlimited ? "AI on this workspace" : "AI credits left"}</div>
                <p className="text-[12.5px] text-neutral-500 leading-snug">
                  AI credits power each search, and the cost scales with depth: a quick job scan is lean, while a deep run (funding and company research) costs more. Every enrichment you buy includes enough AI credits for at least one full search (10+ companies).
                </p>
              </>
            )}
            {low && kind === "enrichment" && (
              <p className="text-[12px] text-red-600 font-semibold mt-2">Out of reveals. Contact Studojo to top up.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Context.dev Logo Link: a real company logo for a domain, drawn from a free
// CDN (a separate 10k/mo quota that does NOT touch our search credits) that
// returns a generated monogram fallback when a domain has no logo. The
// publicClientId is frontend-safe (locked to our allowlisted domains) and set
// as a build-time env var; when it is absent we degrade to Google's free
// favicon service, and when there is no domain at all to a letter tile.
const LOGO_CLIENT_ID =
  (import.meta.env as Record<string, string | undefined>).VITE_CONTEXT_LOGO_CLIENT_ID || "";

// Company logo. Prefers the backend-resolved domain (row.cells._domain), else
// derives one from the website field. Never triggers a paid lookup.
function CompanyLogo({ company, website, domain: domainProp, size = 36 }:
    { company: string; website: string; domain?: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const derived = website ? domainOf(website) : "";
  const domain =
    domainProp && !NON_SITE_DOMAINS.test(domainProp) ? domainProp
    : derived && !NON_SITE_DOMAINS.test(derived) ? derived
    : "";
  const box = { width: size, height: size };
  if (domain && !failed) {
    const src = LOGO_CLIENT_ID
      ? `https://logos.context.dev/?publicClientId=${LOGO_CLIENT_ID}&domain=${encodeURIComponent(domain)}&theme=light`
      : `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
    return (
      <img
        src={src} alt="" onError={() => setFailed(true)} style={box}
        className="rounded-md border border-neutral-200 bg-white object-contain shrink-0"
      />
    );
  }
  return (
    <div style={{ ...box, fontSize: Math.round(size * 0.42) }}
      className="rounded-md border-2 border-neutral-900 bg-violet-100 flex items-center justify-center font-['Clash_Display'] font-semibold text-violet-700 shrink-0">
      {company.replace(/[^a-zA-Z0-9]/g, "")[0]?.toUpperCase() || "?"}
    </div>
  );
}

function TeamModal({ orgName, onClose }: { orgName: string; onClose: () => void }) {
  const [members, setMembers] = useState<{ email: string; role: string; name: string; last_login_at: string | null }[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setMembers((await bobFetch<{ members: any[] }>("/org")).members || []); } catch { /* */ }
  }, []);
  useEffect(() => { load(); }, [load]);

  const invite = async () => {
    if (!email.trim() || busy) return;
    setBusy(true); setError("");
    try {
      await bobFetch("/org/members", { method: "POST", body: JSON.stringify({ email: email.trim(), role }) });
      setEmail(""); await load();
    } catch (e: any) { setError(e?.message || "Could not add member"); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white border-2 border-neutral-900 rounded-[28px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-['Clash_Display'] text-xl font-semibold">Team · {orgName}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900"><FiX size={18} /></button>
        </div>
        <p className="text-sm text-neutral-500 mb-4">
          Invite teammates by their work email. They sign in with that email, no password.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && invite()} placeholder="teammate@company.com"
            className="flex-1 border-2 border-neutral-900 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <select value={role} onChange={(e) => setRole(e.target.value as "member" | "admin")}
                  className="border-2 border-neutral-900 rounded-xl px-2 py-2 text-sm">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={invite} disabled={busy}
                  className="bg-violet-500 text-white font-bold px-4 rounded-xl border-2 border-neutral-900 text-sm disabled:opacity-60">
            {busy ? "..." : "Invite"}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <div className="max-h-72 overflow-y-auto space-y-1.5">
          {members.map((m) => (
            <div key={m.email} className="flex items-center justify-between border-2 border-neutral-200 rounded-xl px-3 py-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{m.email}</div>
                <div className="text-[11px] text-neutral-400">{m.last_login_at ? "Active" : "Invited, not signed in yet"}</div>
              </div>
              <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 border-2 shrink-0 ${
                m.role === "admin" ? "border-violet-500 text-violet-600 bg-violet-50" : "border-neutral-300 text-neutral-500"}`}>
                {m.role}
              </span>
            </div>
          ))}
          {members.length === 0 && <p className="text-sm text-neutral-400 text-center py-4">No members yet.</p>}
        </div>
      </div>
    </div>
  );
}

// ── Enrich contacts ─────────────────────────────────────────────────────────
// A dedicated surface for a sourcing workspace: paste LinkedIn links or upload a
// sheet, get contacts back. Rendered only when /me reports the capability, so no
// other workspace ever sees it. The file path streams the enriched spreadsheet
// straight back, so what they upload is what they download, plus contacts.
// Deliberately no provider/vendor field. Which data sources sit behind a tier is
// our commercial detail, not the customer's, and a type that cannot carry them is
// a stronger guarantee than remembering not to render them.
type EnrichTier = { key: string; label: string; detail: string; balance: number };

function EnrichModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"paste" | "file">("paste");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<{ rows: any[]; billing: string } | null>(null);
  // Each tier bills its OWN balance, so the choice has to be visible and
  // deliberate rather than buried in a default.
  const [tiers, setTiers] = useState<EnrichTier[]>([]);
  // A CHOICE, not a single value: he can run one tier or several. Several run
  // cheapest-first, each seeing only who the cheaper ones missed.
  const [picked, setPicked] = useState<string[]>([]);
  const COST_ORDER = ["tier3", "tier2", "tier1"];
  const chosen = COST_ORDER.filter((k) => picked.includes(k));
  const toggle = (k: string) =>
    setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  useEffect(() => {
    (async () => {
      try {
        const d = await bobFetch<{ tiers: EnrichTier[] | null; default_tier: string | null }>("/credits");
        if (d?.tiers?.length) { setTiers(d.tiers); setPicked(d.default_tier ? [d.default_tier] : []); }
      } catch { /* no tiers: the panel just runs on the backend default */ }
    })();
  }, []);

  const runPaste = async () => {
    setBusy(true); setErr(""); setResult(null);
    try {
      const d = await bobFetch<{ rows: any[]; billing: string }>("/sourcing/enrich", {
        method: "POST",
        body: JSON.stringify(chosen.length ? { text, tiers: chosen } : { text }),
      });
      setResult(d);
    } catch (e: any) { setErr(String(e?.message || e)); }
    finally { setBusy(false); }
  };

  const runFile = async () => {
    if (!file) return;
    setBusy(true); setErr(""); setResult(null);
    try {
      const fd = new FormData(); fd.append("file", file);
      chosen.forEach((t) => fd.append("tiers", t));
      const res = await fetch(`${API}/sourcing/enrich-file/download`, {
        method: "POST", headers: authHeaders(), body: fd,
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `Failed (${res.status})`);
      const line = res.headers.get("X-Enrich-Summary") || "";
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = (file.name || "list").replace(/\.[^.]+$/, "") + "-enriched.xlsx";
      a.click(); URL.revokeObjectURL(a.href);
      setResult({ rows: [], billing: line || "Downloaded." });
    } catch (e: any) { setErr(String(e?.message || e)); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white border-2 border-neutral-900 rounded-[28px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] p-6 max-h-[86vh] overflow-y-auto"
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-['Clash_Display'] text-xl font-semibold">Enrich contacts</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900"><FiX size={18} /></button>
        </div>
        <p className="text-[13px] text-neutral-500 mb-4">
          Paste LinkedIn profile links, or upload a sheet. You are charged only for contacts we actually find.
        </p>

        {tiers.length > 0 && (
          <div className="mb-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mb-2">
              Enrichment tier
            </div>
            <div className="grid grid-cols-3 gap-2">
              {tiers.map((t) => {
                const active = picked.includes(t.key);
                const empty = t.balance <= 0;
                return (
                  <button key={t.key} onClick={() => toggle(t.key)} disabled={empty}
                    title={t.detail}
                    className={`text-left px-3 py-2.5 rounded-xl border-2 transition-colors ${
                      active ? "border-neutral-900 bg-violet-100"
                             : "border-neutral-300 hover:border-neutral-400"} ${
                      empty ? "opacity-40 cursor-not-allowed" : ""}`}>
                    <div className="text-[12.5px] font-semibold leading-tight">{t.label}</div>
                    <div className="text-[11px] text-neutral-500 mt-1 tabular-nums">
                      {empty ? "no credits left" : `${t.balance} credit${t.balance === 1 ? "" : "s"} left`}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11.5px] text-neutral-400 mt-2">
              {chosen.length > 1
                ? "Runs cheapest first. Each tier only looks up whoever the previous one could not find, so you are never charged twice for the same person."
                : "Each tier has its own balance. Pick more than one to run them in sequence."}
            </p>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          {(["paste", "file"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setResult(null); setErr(""); }}
              className={`text-[13px] font-semibold px-3 py-1.5 rounded-lg border-2 transition-colors ${
                tab === t ? "border-neutral-900 bg-violet-100" : "border-neutral-300 text-neutral-500"}`}>
              {t === "paste" ? "Paste LinkedIn links" : "Upload a sheet"}
            </button>
          ))}
        </div>

        {tab === "paste" ? (
          <>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7}
              placeholder={"https://www.linkedin.com/in/one\nhttps://www.linkedin.com/in/two\n\nOr rows from a sheet:\nName | Company\nJay Parekh | Bajaj Broking"}
              className="w-full border-2 border-neutral-900 rounded-xl px-3 py-2.5 text-[13.5px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500" />
            <button onClick={runPaste} disabled={busy || !text.trim() || (tiers.length > 0 && !chosen.length)}
              className="mt-3 bg-violet-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl border-2 border-neutral-900 disabled:opacity-40">
              {busy ? "Enriching..." : "Enrich"}
            </button>
          </>
        ) : (
          <>
            <input type="file" accept=".xlsx,.xlsm,.csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-[13.5px] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-2
                         file:border-neutral-900 file:bg-white file:font-semibold file:text-[13px]" />
            <p className="text-[12px] text-neutral-500 mt-2">
              Needs a name and company column, or a LinkedIn column. Your columns come back in your order with
              email, phone and status added.
            </p>
            <button onClick={runFile} disabled={busy || !file}
              className="mt-3 bg-violet-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl border-2 border-neutral-900 disabled:opacity-40">
              {busy ? "Enriching..." : "Enrich and download"}
            </button>
          </>
        )}

        {err && <div className="mt-3 text-[13px] text-red-600">{err}</div>}

        {result && (
          <div className="mt-5">
            <div className="text-[13px] font-semibold mb-2">{result.billing}</div>
            {result.rows.length > 0 && (
              <div className="border-2 border-neutral-900 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-[12.5px]">
                  <thead className="bg-neutral-100 sticky top-0">
                    <tr><th className="text-left px-3 py-2">Name</th><th className="text-left px-3 py-2">Email</th>
                        <th className="text-left px-3 py-2">Phone</th><th className="text-left px-3 py-2">Status</th></tr>
                  </thead>
                  <tbody>
                    {result.rows.map((r, i) => (
                      <tr key={i} className="border-t border-neutral-200">
                        <td className="px-3 py-1.5">{r.name || "-"}</td>
                        <td className="px-3 py-1.5">{r.email || "-"}</td>
                        <td className="px-3 py-1.5">{r.phone || "-"}</td>
                        <td className={`px-3 py-1.5 ${r.status === "found" ? "text-green-700" : "text-neutral-400"}`}>{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SupportModal({ email, orgName, onClose }: { email: string; orgName: string; onClose: () => void }) {
  const REASONS = [
    { id: "broken", label: "Something is broken" },
    { id: "billing", label: "Credits or billing" },
    { id: "question", label: "A question / how does this work" },
    { id: "other", label: "Something else" },
  ];
  const [reason, setReason] = useState("broken");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState<number | null>(null);

  const submit = async () => {
    if (description.trim().length < 5 || busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/sensei-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, org: orgName, reason, description: description.trim(),
          context: { page_url: typeof window !== "undefined" ? window.location.href : null },
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json?.error || `Couldn't submit (HTTP ${res.status})`); return; }
      setDoneId(json.id);
    } catch { setError("Couldn't reach the server. Try again."); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white border-2 border-neutral-900 rounded-[28px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-['Clash_Display'] text-xl font-semibold">Get support</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900"><FiX size={18} /></button>
        </div>
        {doneId ? (
          <div className="py-6 text-center">
            <div className="text-3xl mb-2">✓</div>
            <p className="font-semibold">Ticket #{doneId} raised.</p>
            <p className="text-sm text-neutral-500 mt-1">
              Our team will get back to you at {email || "your email"}. You can close this.
            </p>
            <button onClick={onClose}
                    className="mt-5 bg-neutral-900 text-white font-bold px-5 py-2 rounded-xl border-2 border-neutral-900 text-sm hover:bg-violet-700">
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-500 mb-4">
              Tell us what's going on. It goes straight to the Studojo team.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {REASONS.map((r) => (
                <button key={r.id} onClick={() => setReason(r.id)}
                        className={`text-xs font-semibold rounded-full px-3 py-1.5 border-2 transition-colors ${
                          reason === r.id ? "border-violet-500 bg-violet-500 text-white" : "border-neutral-300 text-neutral-500 hover:border-neutral-900"}`}>
                  {r.label}
                </button>
              ))}
            </div>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              rows={5} placeholder="Describe the issue or request..."
              className="w-full border-2 border-neutral-900 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={onClose} className="px-4 py-2 rounded-xl border-2 border-neutral-300 text-sm font-semibold text-neutral-500 hover:border-neutral-900 hover:text-neutral-900">
                Cancel
              </button>
              <button onClick={submit} disabled={busy || description.trim().length < 5}
                      className="bg-violet-700 text-white font-bold px-5 py-2 rounded-xl border-2 border-neutral-900 text-sm hover:bg-violet-800 disabled:opacity-60">
                {busy ? "Sending..." : "Raise ticket"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// The first thing a new chat shows is Sensei speaking, not a menu. The four
// template cards were doing the intake layer's job from the front end: they made
// the user pick a shape before they had said anything, and each one pasted a
// bracketed form ("[city, company stage, expected CTC]") that people then sent
// half-filled. Sensei now reads the shape from whatever they type, so the right
// opening is simply to ask.
// A new chat opens the way ChatGPT, Claude and Perplexity all open one: a single
// centred line with the composer directly beneath it, both sitting in the middle
// of the pane. What made earlier attempts feel wrong was not the wording, it was
// that the input stayed pinned to the bottom of the window while the greeting sat
// at the top, so the two never read as one moment. The composer moves up to meet
// this (see the `atRest` branches in the chat section).
function EmptyChat() {
  return (
    <div className="max-w-2xl mx-auto text-center pb-7 bob-pop">
      <div className="w-12 h-12 mx-auto mb-5 rounded-2xl overflow-hidden border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
        <SenseiMark />
      </div>
      <h2 className="font-['Clash_Display'] text-[30px] sm:text-[34px] leading-[1.15] font-semibold tracking-tight">
        Who are we getting hired today?
      </h2>
    </div>
  );
}

// New look: what Sensei can do, under the empty composer. A tile only fills in the composer (or opens the
// file picker); nothing is sent until the person sends it.
const STARTERS: { title: string; text: string; fill?: string; icon: typeof FiSearch }[] = [
  { title: "Find companies hiring", text: "Search live postings by role, city and company type", icon: FiSearch,
    fill: "Find startups in Bengaluru hiring React developers, posted in the last 7 days" },
  { title: "A job link", text: "Paste a Naukri or LinkedIn job: get the recruiter and their number", icon: FiExternalLink,
    fill: "Find the hiring contact and their number for this job: " },
  { title: "A LinkedIn profile", text: "Paste a profile: get their phone and email", icon: FiLinkedin,
    fill: "Find the phone number and email for this LinkedIn profile: " },
  { title: "A cohort sheet", text: "Attach a sheet or resumes: match each student to openings", icon: FiPaperclip },
];

function Starters({ onFill, onAttach }: { onFill: (t: string) => void; onAttach: () => void }) {
  return (
    <div className="sx-starters grid sm:grid-cols-2 gap-2 mt-3">
      {STARTERS.map((s) => (
        <button key={s.title} type="button" onClick={() => (s.fill ? onFill(s.fill) : onAttach())} className="sx-starter">
          <s.icon size={15} />
          <span className="min-w-0">
            <span className="sx-starter-title">{s.title}</span>
            <span className="sx-starter-text">{s.text}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Run progress ─────────────────────────────────────────────────────────────

// The pipeline stages, in order, with a friendly name and a rough share of the
// total time (used to draw the progress bar). Sensei's raw logs say things like
// "harvest(ring 0): done"; users shouldn't have to read that.
const RUN_STAGES = [
  { key: "plan", label: "Planning the search", weight: 0.05 },
  { key: "search", label: "Searching boards & LinkedIn", weight: 0.30 },
  { key: "extract", label: "Reading & pulling out companies", weight: 0.22 },
  { key: "score", label: "Scoring how well each fits", weight: 0.13 },
  { key: "enrich", label: "Checking live hiring signals", weight: 0.12 },
  { key: "contact", label: "Finding the right person to reach", weight: 0.10 },
  { key: "assemble", label: "Building your table", weight: 0.08 },
];
// A finished run is tagged with a depth (the pipeline sets counters.depth): a lean
// job-scan costs few AI credits, a deep funding/company-research run costs more.
const RUN_DEPTH: Record<number, string> = { 1: "Quick scan", 2: "Standard search", 3: "Deep research" };
const FRIENDLY_SOURCE: Record<string, string> = {
  getro: "startup job boards", careerjet: "Careerjet", ats: "company career pages",
  reddit: "Reddit", ctx_li_posts: "LinkedIn posts", ctx_x: "X (Twitter)",
  hirist: "Hirist", iimjobs: "IIMJobs", naukri: "Naukri", yc: "Y Combinator", remote_boards: "remote boards",
};

// Turn one raw event into a human sentence. Never leak internal ids / ring jargon.
// User-friendly copy for every internal pipeline step, so the chat/panel NEVER leak raw names like
// "jd_fetch: started", "stream_front4", "company_ctx". Checked in order; first match wins.
const STEP_FRIENDLY: [RegExp, string][] = [
  // Streaming delivery (bob-svc BOB_STREAM_DELIVERY_ENABLED) works in waves over what the search has found so far.
  [/^wave \d+: started/, "Checking the latest finds"],
  [/^wave \d+: .*added/, "Adding companies to your table"],
  [/plan|understood/, "Planning the search"],
  [/harvest|stream_front|scanning/, "Searching boards & LinkedIn"],
  [/created table|create_table|setting up/, "Setting up your results"],
  [/shortlist/, "Shortlisting the best matches"],
  [/extract|pulling out|reading/, "Reading & pulling out companies"],
  [/linkedin_company|company details/, "Finding company details"],
  [/jd_fetch|job description/, "Analysing job descriptions"],
  [/prefilter|filtering/, "Filtering out weak matches"],
  [/company_ctx|company_verify|verify/, "Researching the companies"],
  [/scor/, "Scoring how well each fits"],
  [/enrich|hiring signal/, "Checking live hiring signals"],
  [/contact|right person/, "Finding the right person to reach"],
  [/assemble|building your table/, "Building your table"],
  [/search summary|finalising|finalizing/, "Finalising the shortlist"],
  [/pipeline finished|wrapping|finished/, "Wrapping up"],
];

function humanizeEvent(ev: RunEvent): string {
  const raw = ev.label || "";
  const low = raw.toLowerCase();
  // Search events look like "[getro] sre engineer @ Pune" -> "Searching startup boards: sre engineer in Pune".
  const m = raw.match(/^\[([a-z_]+)\]\s*(.*)$/i);
  if (m) {
    const src = FRIENDLY_SOURCE[m[1].toLowerCase()] || m[1];
    let q = m[2]
      .replace(/site:\S+/gi, "")
      .replace(/["']/g, "")
      .replace(/\bhiring\b/gi, "")
      .replace(/@/g, "in ")
      .replace(/\s+/g, " ")
      .trim();
    if (q.length > 60) q = q.slice(0, 60) + "…";
    return q ? `Searching ${src}: ${q}` : `Searching ${src}`;
  }
  // Internal step name -> friendly phrase (never leak "jd_fetch: started").
  for (const [rx, friendly] of STEP_FRIENDLY) if (rx.test(low)) return friendly;
  return raw;
}

// Which stage is currently active, from the furthest-along stage keyword seen.
function currentStageIndex(events: RunEvent[]): number {
  let idx = 0;
  for (const ev of events) {
    const low = (ev.label || "").toLowerCase();
    for (let i = 0; i < RUN_STAGES.length; i++) {
      const k = RUN_STAGES[i].key;
      const hit = k === "search" ? /harvest|^\[/.test(low) : low.startsWith(k);
      if (hit && i > idx) idx = i;
    }
  }
  return idx;
}

// ── Shared run estimator ─────────────────────────────────────────────────────
// One source of truth for a SANE "time left" countdown, used by every in-run surface. It starts at a
// fixed ~14 min and ONLY ticks down, driven by real stage progress: smooth run -> ticks down; slow
// run -> holds; it never climbs and never shows more than the start (the old elapsed/prog model
// ballooned to a 25-min cap early and showed "22 min left", which was wrong).
const INITIAL_TOTAL_S = 14 * 60;

function fmtClock(s: number): string {
  s = Math.max(0, Math.floor(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function useRunEstimate(run: Run) {
  const events = run.events || [];
  const stageIdx = currentStageIndex(events);

  // Re-render the elapsed clock once a second, SELF-CORRECTING to the real second boundary. A plain
  // setInterval(1000) drifts and coalesces when the poll (2.5s) + streaming list jank the main
  // thread, so the clock jumps unevenly (2-3s at a time). Re-scheduling to `1000 - now%1000` each
  // tick keeps every update near a true second, however busy the thread is.
  const [, setTick] = useState(0);
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      setTick((n) => n + 1);
      id = setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    id = setTimeout(tick, 1000 - (Date.now() % 1000));
    return () => clearTimeout(id);
  }, []);

  // Real run start, LOCKED ONCE: the first backend event's timestamp (survives a reload/remount);
  // fall back to mount time only if no event has landed yet. Locking it in a ref means a later poll
  // that reorders the events array can never move the start and make elapsed jump backwards/forwards.
  const startRef = useRef<number | null>(null);
  if (startRef.current == null) {
    const firstTs = events.length ? Date.parse(events[0].ts) : NaN;
    startRef.current = Number.isFinite(firstTs) ? firstTs : Date.now();
  }
  const startMs = startRef.current;
  const elapsedS = Math.max(0, Math.floor((Date.now() - startMs) / 1000));

  const stageProgress = RUN_STAGES.slice(0, stageIdx).reduce((s, x) => s + x.weight, 0)
    + RUN_STAGES[stageIdx].weight * 0.5;

  // Countdown model (owner spec): start at a fixed ~14 min and ONLY ever tick DOWN. Driven by real
  // stage PROGRESS, not elapsed/prog (which ballooned to the 25-min cap early and showed "22 min"):
  //   - run going smoothly -> stages advance -> remaining ticks down
  //   - run is slow         -> progress stalls -> remaining HOLDS (a tiny time-creep, then flat)
  //   - never climbs back up, never shows more than the ~14-min start
  const stageProg = Math.max(0.02, Math.min(0.97, stageProgress));
  const creep = Math.min(0.04, elapsedS / (INITIAL_TOTAL_S * 6));   // gentle intra-stage tick, then flat
  const shown = Math.min(0.97, stageProg + creep);
  const rawRemaining = INITIAL_TOTAL_S * (1 - shown);
  const remainRef = useRef<number>(INITIAL_TOTAL_S);
  remainRef.current = Math.min(remainRef.current, rawRemaining);    // never above the start, never climbs
  const remainingS = Math.max(remainRef.current, 40);               // hold "~1 min" near the end, not 0

  const last = stageIdx >= RUN_STAGES.length - 1;
  const etaText = last || remainingS < 50 ? "wrapping up…" : `~${Math.max(1, Math.round(remainingS / 60))} min left`;

  const pct = Math.min(96, shown * 100);

  return { stageIdx, elapsedS, remainingS, etaText, pct, last };
}

// A number that eases toward its target as the funnel counters tick up.
function TickingNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const raf = useRef<number | undefined>(undefined);
  useEffect(() => {
    const from = display, to = value;
    if (from === to) return;
    const start = performance.now(), dur = 500;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span className={className}>{display.toLocaleString("en-US")}</span>;
}

function FitChip({ fit }: { fit: number }) {
  const per100 = fit > 10;
  const high = per100 ? fit >= 80 : fit >= 8;
  const mid = per100 ? fit >= 60 : fit >= 6;
  const cls = high ? "bg-green-100 text-green-700" : mid ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-500";
  return <span className={`text-[10.5px] font-bold rounded-md px-1.5 py-0.5 shrink-0 tabular-nums ${cls}`}>{Math.round(fit)}</span>;
}

// The companies Sensei has already found this run (provisional opportunities, before
// assemble writes the final rows), streamed in best-first: the live proof-of-work.
function LiveCompanies({ run }: { run: Run }) {
  const reduce = useReducedMotion();
  const opp = run.opportunities;
  const rows = useMemo(() => {
    if (!opp) return [] as { id: number; name: string; city: string; website: string; domain: string; fit: number | null }[];
    return [...opp.rows]
      .filter((o) => o.status !== "rejected" && o.status !== "written")
      .map((o) => {
        const fitRaw = typeof o.fit_score === "number" ? o.fit_score : parseFloat(str(o.cells.fit_score));
        return {
          id: o.id,
          // Show the real company name, NOT company_norm (that's the lowercased, punctuation-stripped
          // dedup KEY, e.g. "accentureinindia", "bnpparibas", "tvsd", never a display name).
          name: str(o.cells.company) || o.company_norm || "Company",
          city: str(o.cells.city),
          website: str(o.cells.website),
          domain: str(o.cells._domain),
          fit: Number.isFinite(fitRaw) ? fitRaw : null,
        };
      })
      .sort((a, b) => (b.fit ?? 0) - (a.fit ?? 0));
  }, [opp]);

  if (rows.length === 0) return null;
  const top = rows.slice(0, 6);
  const extra = rows.length - top.length;

  return (
    <div className="mb-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10.5px] font-bold uppercase tracking-wide text-neutral-500">Companies found so far</span>
        <span className="text-[10.5px] font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5 tabular-nums">{rows.length}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {top.map((r) => (
            <motion.div
              key={r.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.35, ease: [0.2, 0.9, 0.25, 1] }}
              className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-[#faf7f2] px-2.5 py-1.5"
            >
              <CompanyLogo company={r.name} website={r.website} domain={r.domain} size={22} />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-bold leading-tight truncate">{r.name}</p>
                {r.city && <p className="text-[10.5px] text-neutral-500 leading-tight truncate">{r.city}</p>}
              </div>
              {r.fit != null ? <FitChip fit={r.fit} /> : <span className="text-[10px] text-neutral-400 font-semibold shrink-0">scoring…</span>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {extra > 0 && <p className="text-[10.5px] text-neutral-400 font-semibold mt-1.5">+ {extra} more found</p>}
    </div>
  );
}

// Compact in-CHAT status line while a run works. The rich, live detail (counters, sources,
// company stream) lives in the MissionControl on the RIGHT, so this stays a slim one-liner and
// the two panels never duplicate the same big card.
function RunProgress({ run }: { run: Run }) {
  const { stageIdx, etaText, pct, last } = useRunEstimate(run);
  const reduce = useReducedMotion();
  // Streaming delivery: rows land as they pass and the run ends when the sources do, so a countdown would be a guess.
  const streaming = isStreamingRun(run);
  const kept = Number(run.counters?.kept ?? 0);
  // Show the REAL current step (friendly), not a stale "Searching LinkedIn" when we've moved on.
  const events = run.events || [];
  const lastEv = events[events.length - 1];
  const activity = lastEv ? humanizeEvent(lastEv) : RUN_STAGES[stageIdx].label;
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 mt-0.5 shrink-0 rounded-lg overflow-hidden border-2 border-neutral-900">
        <SenseiMark />
      </div>
      <div className={`flex-1 ${CARD} rounded-tl-md px-3.5 py-2.5`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="relative flex h-2 w-2 shrink-0">
            {!reduce && <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="font-bold text-[13.5px] min-w-0 truncate">{activity}…</span>
          <span className="ml-auto shrink-0">
            {streaming ? (
              <span className="rounded-full px-2 py-0.5 text-[11px] font-bold border bg-green-50 text-green-700 border-green-300 tabular-nums">{kept} added</span>
            ) : (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold border ${last ? "bg-green-50 text-green-700 border-green-300" : "bg-violet-50 text-violet-700 border-violet-300"}`}>{etaText}</span>
            )}
          </span>
        </div>
        {!streaming && (
          <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
          </div>
        )}
        <p className="text-[11px] text-neutral-400 mt-1.5">{streaming
          ? "Companies appear in the table as soon as they pass your checks. The search keeps going until the sources run out."
          : "Full live progress is in the panel on the right."}</p>
      </div>
    </div>
  );
}

// Streaming delivery (bob-svc BOB_STREAM_DELIVERY_ENABLED sets counters.stream_mode): rows are written the moment they
// pass every check and the run keeps searching until the sources run out.
function isStreamingRun(run: Run | null | undefined): boolean {
  return !!run && Number(run.counters?.stream_mode ?? 0) === 1;
}

// Slim status line above a streaming run's table while the search goes on.
function LiveStrip({ run, rows }: { run: Run; rows: number }) {
  const reduce = useReducedMotion();
  const events = run.events || [];
  const lastEv = events[events.length - 1];
  return (
    <div className="shrink-0 border-b-2 border-neutral-900 bg-white px-3 py-2 flex items-center gap-2.5">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        {!reduce && <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />}
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
      <span className="text-[12.5px] font-bold text-neutral-900 shrink-0">Still searching</span>
      <span className="text-[12px] text-neutral-500 truncate min-w-0 flex-1">{lastEv ? humanizeEvent(lastEv) : "Reading job boards and career pages"}</span>
      <span className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-300 rounded-full px-2 py-0.5 tabular-nums shrink-0">{rows} added</span>
    </div>
  );
}

// A small stage badge for provisional rows: replaces the CRM status <select> and the
// Enrich button (which must never fire on a not-yet-shipped opportunity).
function ProvChip({ status }: { status: string }) {
  const label = status === "contacted" ? "Shortlisting…"
    : status === "scored" ? "Scored" : "In review…";
  return (
    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold rounded-lg px-1.5 py-0.5 bg-neutral-100 text-neutral-500 border border-neutral-200 whitespace-nowrap">
      <FiLoader size={9} className="animate-spin opacity-60" /> {label}
    </span>
  );
}

// ── Live mission-control (right panel, while a run works before rows land) ─────────────────────────
// Fills the pane with real, moving signal so a long run NEVER reads as stuck: a ticking countdown,
// funnel counters that climb, sources lighting up as they're scanned, the current action in plain
// words, and companies as they're found. Replaces the small floating "Sensei is thinking" card.
const MISSION_CONTROL = true;   // kill-switch: set false to fall back to the RunGraph neural-net card
const MC_BOARDS: [string, string][] = [
  ["linkedin", "LinkedIn"], ["naukri", "Naukri"], ["yc", "Y Combinator"],
  ["getro", "Startup boards"], ["ats", "Career pages"], ["hirist", "Hirist"],
  ["iimjobs", "IIMJobs"], ["ctx_li_posts", "LinkedIn posts"], ["reddit", "Reddit"],
];

function MissionControl({ run }: { run: Run }) {
  const reduce = useReducedMotion();
  const { stageIdx, elapsedS, remainingS, pct, last } = useRunEstimate(run);
  const c = run.counters || {};
  const events = run.events || [];
  const lastEv = events[events.length - 1];

  // Progress theater (owner directive): ONLY the raw-harvest number is faked. The real raw harvest
  // arrives in one ~5-min burst, reading as a dead 0 then a jump, so drive "Sourced" (+ the source
  // chips) off a deterministic, per-run, ease-out ramp tuned to real magnitudes (~4.8-6.3k by ~5 min).
  // SHORTLISTED and KEPT stay REAL from the backend counters so they always match the rows actually
  // delivered in the table below (a faked kept would contradict the real output).
  const seed = (((run.id || 1) * 2654435761) % 100000) / 100000;   // stable per run, varies run to run
  const ramp = (startS: number, fullS: number) => {
    const f = Math.max(0, Math.min(1, (elapsedS - startS) / Math.max(1, fullS - startS)));
    return 1 - Math.pow(1 - f, 2.4);                                // ease-out
  };
  const sourced = Math.round((4800 + seed * 1500) * ramp(4, 300));  // FAKED: ~4.8-6.3k, fills by ~5 min
  const shortlisted = Number(c.scored ?? 0);                        // REAL: survivors after scoring
  const kept = Number(c.kept ?? c.rows_added ?? 0);                 // REAL: rows actually delivered
  // source chips light up one by one across the search window (not the real all-at-once burst)
  const litCount = Math.min(MC_BOARDS.length, Math.floor(ramp(6, 250) * (MC_BOARDS.length + 1)));

  const liveCount = useMemo(
    () => (run.opportunities?.rows || []).filter((o) => o.status !== "rejected" && o.status !== "written").length,
    [run.opportunities],
  );

  const stats: [string, number, boolean][] = [["Sourced", sourced, false], ["Shortlisted", shortlisted, false], ["Kept", kept, true]];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">

        {/* identity + stage + live countdown + progress */}
        <div className={`${CARD} p-5`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 shrink-0 ${BRUT} rounded-xl overflow-hidden ${SHADOW}`}>
              <SenseiMark />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  {!reduce && <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />}
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <h3 className="font-['Clash_Display'] text-lg font-bold leading-none">Sensei is researching</h3>
              </div>
              <p className="text-[13px] text-neutral-700 font-semibold mt-2">{lastEv ? humanizeEvent(lastEv) : RUN_STAGES[stageIdx].label}</p>
            </div>
            {/* Only the time LEFT, bold: the elapsed timer had no value. It re-predicts as stages
                complete (adaptive, capped, only counts down). */}
            <div className="text-right shrink-0 leading-none">
              {last ? (
                <div className="font-['Clash_Display'] text-xl font-bold text-green-600">wrapping up…</div>
              ) : (
                <>
                  <span className="font-['Clash_Display'] text-3xl font-bold text-violet-700 tabular-nums">{Math.max(1, Math.round(remainingS / 60))}</span>
                  <span className="text-[12px] font-bold text-neutral-500 ml-1">min left</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 h-2.5 w-full rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden relative">
            <div className={`sx-bar h-full rounded-full relative overflow-hidden ${reduce ? "" : "sd-shimmer"}`}
              style={{ width: `${pct}%`, background: "linear-gradient(90deg,#8b5cf6,#ec4899)", transition: "width .7s ease-out" }} />
          </div>
          <div className="flex justify-between text-[10.5px] text-neutral-400 mt-1.5">
            <span>Step {stageIdx + 1} of {RUN_STAGES.length}</span>
            <span className="tabular-nums">{Math.round(pct)}%</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {RUN_STAGES.map((s, i) => (
              <div key={s.key} title={s.label}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i < stageIdx ? "bg-violet-500" : i === stageIdx ? `bg-violet-400 ${reduce ? "" : "animate-pulse"}` : "bg-neutral-200"}`} />
            ))}
          </div>
        </div>

        {/* funnel counters, ticking up */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(([label, n, keep]) => (
            <div key={label} className={`${CARD} px-3 py-3 text-center`}>
              <TickingNumber value={n} className={`block font-['Clash_Display'] font-bold text-2xl leading-none tabular-nums ${keep ? "text-green-600" : "text-neutral-900"}`} />
              <div className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mt-1.5">{label}</div>
            </div>
          ))}
        </div>

        {/* sources being scanned */}
        <div className={`${CARD} p-4`}>
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-neutral-500">Scanning the web</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MC_BOARDS.map(([k, name], i) => {
              const lit = i < litCount;
              return (
                <span key={k} className={`inline-flex items-center gap-1 text-[11px] font-semibold rounded-lg px-2 py-1 border-2 transition-colors ${lit ? "border-neutral-900 bg-green-50 text-green-700" : "border-neutral-200 bg-white text-neutral-400"}`}>
                  {lit ? <FiCheck size={11} /> : <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />} {name}
                </span>
              );
            })}
          </div>
        </div>

        {/* companies as they're found: the centerpiece */}
        <div className={`${CARD} p-4 min-h-[128px]`}>
          {liveCount > 0 ? <LiveCompanies run={run} /> : (
            <div className="flex flex-col items-center justify-center text-center py-7 gap-2">
              <FiSearch className={`text-violet-400 ${reduce ? "" : "animate-pulse"}`} size={20} />
              <p className="text-[13px] font-bold text-neutral-600">Companies appear here as Sensei finds them</p>
              <p className="text-[11px] text-neutral-400">Reading job boards, career pages and hiring posts…</p>
            </div>
          )}
        </div>

        {/* The live current-action line moved to the CHAT one-liner (people watch that), so it is
            not repeated here at the bottom where it went unseen. */}
        <p className="text-[11px] text-neutral-400 text-center pb-2">Most runs finish in about 12 to 20 minutes. You can leave this tab open.</p>
      </div>
    </div>
  );
}

// Live animated pipeline graph: a neural-network visual on the right panel while
// a run works and no rows have landed yet, so the user sees Sensei "thinking".
const NN_LAYERS = [3, 5, 5, 4, 2];
const NN_W = 320, NN_H = 200, NN_PADX = 26, NN_PADY = 22;
function nnNodes(): { x: number; y: number; layer: number }[][] {
  return NN_LAYERS.map((count, li) => {
    const x = NN_PADX + ((NN_W - 2 * NN_PADX) * li) / (NN_LAYERS.length - 1);
    return Array.from({ length: count }, (_, j) => {
      const y = count === 1 ? NN_H / 2 : NN_PADY + ((NN_H - 2 * NN_PADY) * j) / (count - 1);
      return { x, y, layer: li };
    });
  });
}

function RunGraph({ run }: { run: Run }) {
  const { stageIdx: idx, elapsedS, etaText } = useRunEstimate(run);
  const c = run.counters || {};
  // Progress across the network layers, from the current pipeline stage.
  const frac = (idx + 1) / RUN_STAGES.length;
  const wavefront = frac * (NN_LAYERS.length - 1);
  const layers = nnNodes();

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
      <style>{`
        @keyframes bobDash { to { stroke-dashoffset: -14; } }
        .bob-edge-live { stroke-dasharray: 3 6; animation: bobDash .5s linear infinite; }
        @keyframes bobNodeGlow { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        .bob-node-live { animation: bobNodeGlow 1.1s ease-in-out infinite; }
      `}</style>
      <div className="w-full max-w-[360px] bg-white border-2 border-neutral-900 rounded-2xl shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] p-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 mx-auto border-2 border-neutral-900 rounded-2xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] mb-3">
            <SenseiMark />
          </div>
          <h3 className="font-['Clash_Display'] text-xl font-semibold">Sensei is thinking</h3>
          <p className="text-sm text-neutral-500 mt-1">{RUN_STAGES[idx].label}…</p>
          <p className="text-[11px] text-neutral-400 mt-1 tabular-nums">{fmtClock(elapsedS)} elapsed · {etaText}</p>
        </div>

        {/* Neural network, framed like a little screen */}
        <div className="border-2 border-neutral-900 rounded-xl bg-[#faf7f2] p-3">
        <svg viewBox={`0 0 ${NN_W} ${NN_H}`} className="w-full h-auto">
          {/* edges */}
          {layers.slice(0, -1).map((la, li) =>
            la.flatMap((a) =>
              layers[li + 1].map((b, bj) => {
                const live = li < wavefront;
                return (
                  <line key={`${li}-${a.y}-${bj}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={live ? "#7c5cff" : "#e4e0d8"} strokeWidth={live ? 1.1 : 0.7}
                    className={li === Math.floor(wavefront) ? "bob-edge-live" : ""}
                    opacity={live ? 0.7 : 0.5} />
                );
              })
            )
          )}
          {/* nodes */}
          {layers.map((la, li) =>
            la.map((n, nj) => {
              const done = li < wavefront - 0.5;
              const active = Math.abs(li - wavefront) <= 0.6;
              return (
                <circle key={`${li}-${nj}`} cx={n.x} cy={n.y} r={active ? 6 : 5}
                  fill={done || active ? "#7c5cff" : "#ffffff"}
                  stroke={done || active ? "#191a23" : "#cfc9bd"} strokeWidth={1.5}
                  className={active ? "bob-node-live" : ""} />
              );
            })
          )}
        </svg>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mt-4">
          <span className="text-[11px] font-bold bg-neutral-100 rounded-full px-2.5 py-1">Step {idx + 1} of {RUN_STAGES.length}</span>
          {c.rows_added ? <span className="text-[11px] font-bold bg-violet-100 text-violet-700 rounded-full px-2.5 py-1">{c.rows_added} companies found</span> : null}
          {c.ai_credits ? <span className="text-[11px] font-bold bg-white border-2 border-neutral-900 rounded-full px-2.5 py-1" title="AI credits this search, scales with research depth">{c.ai_credits} AI credits{c.depth ? ` · ${RUN_DEPTH[c.depth]}` : ""}</span> : null}
        </div>
      </div>
    </div>
  );
}

// ── Results panel (cards ⇄ table) ────────────────────────────────────────────

// Coach card shown ABOVE the results once a run finishes short / zero / widened. Leads positive
// (what you got), names the tightest constraint, and offers the soft levers as one-click re-run chips
// (tap = re-run with that single change relaxed). Brutalist, sits above the table, never over it.
function ResultSummaryCard({ coach, onLever }: { coach: Coach; onLever: (message: string) => void }) {
  const [dismissed, setDismissed] = useState(false);
  const d = coach.diagnosis || {};
  const levers = (coach.levers || []).filter((l) => l && l.message);
  const zero = !!d.zero;
  const tight = !!d.short && !zero;
  // nothing worth surfacing: hit the target, no widen, no levers
  if (!zero && !tight && !d.widened_to && levers.length === 0) return null;
  if (dismissed) return null;

  const binding = (d.binding || [])[0];
  const headline = zero
    ? "No companies cleared this exact mandate"
    : `${d.delivered ?? 0} compan${d.delivered === 1 ? "y" : "ies"} ready${tight && d.target ? ` of the ${d.target} you asked for` : ""}`;
  const sub = zero
    ? (binding ? `The tightest constraint was ${binding.label}. Loosen one to open it up:` : "This mandate was very tight. Try loosening one constraint:")
    : tight
      ? (binding ? `A tight slice: ${binding.label} cost the most. One tap to get more:` : "A tight slice. One tap to get more:")
      : (d.widened_to ? `Extended the posting window to ${d.widened_to} days to reach the count.` : "");

  return (
    <div className={`relative shrink-0 border-b-2 border-neutral-900 ${zero ? "bg-amber-50" : "bg-violet-50"} px-4 py-3`}>
      {/* dismiss so the user can see the table alone */}
      <button onClick={() => setDismissed(true)} title="Dismiss"
        className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-black/5 transition-colors">
        <FiX size={15} />
      </button>
      <div className="pr-8">
        <p className="font-['Clash_Display'] font-bold text-[15px] leading-tight">{headline}</p>
        {sub && <p className="text-[12.5px] text-neutral-600 mt-0.5">{sub}</p>}
        {levers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {levers.map((l, i) => (
              <button key={i} onClick={() => onLever(l.message)} title={l.message}
                className={`text-[12px] font-bold bg-white ${BRUT} rounded-lg px-2.5 py-1 ${PRESS}`}>
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultsPanel({ tables, run, widthPct, fullWidth, expanded, onExpand, viewPref, onViewPref, onRowStatus, onEnrichRow, onEnrichTable, onDeleteRow, coach, onLever }: {
  tables: BobTable[];
  run: Run | null;
  widthPct: number;
  fullWidth: boolean;
  expanded: boolean;
  onExpand: () => void;
  viewPref: ResultsView | null;
  onViewPref: (v: ResultsView) => void;
  onRowStatus: (rowId: number, status: string) => void;
  onEnrichRow: (rowId: number) => void;
  onEnrichTable: (tableId: number) => void;
  onDeleteRow: (rowId: number) => void;
  coach: Coach | null;
  onLever: (message: string) => void;
}) {
  const ui = useContext(UiContext);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [detailRow, setDetailRow] = useState<BobRow | null>(null);
  const seenRows = useRef<Set<number>>(new Set());

  const active = tables.find((t) => t.id === activeId) || tables[tables.length - 1] || null;

  // Live overlay -> provisional rows for the active table. Excludes rejected (they drop)
  // and already-shipped (deduped by _company_norm so the real row's hand-off is seamless).
  // Negative synthetic ids never collide with bob_rows.id and are stable across polls, so
  // flash-in + row identity keep working. Ordered by opp id (harvest order) so fit changes
  // during scoring never reshuffle rows.
  // A streaming run writes rows the moment they pass, so the table shows only those: no provisional rows that may drop.
  const streaming = isStreamingRun(run);
  const liveTable = streaming && !!active && active.rows.length > 0;
  const provisional = useMemo<BobRow[]>(() => {
    const opp = run?.opportunities;
    if (!run || run.status !== "running" || streaming || !active || !opp || opp.table_id !== active.id) return [];
    const shipped = new Set(
      active.rows.map((r) => String((r.cells as Record<string, unknown>)._company_norm || "")).filter(Boolean),
    );
    return [...opp.rows]
      .filter((o) => o.status !== "rejected" && o.status !== "written" && !(o.company_norm && shipped.has(o.company_norm)))
      .sort((a, b) => a.id - b.id)
      .map((o) => ({ id: -o.id, status: "new", cells: { ...o.cells, _provisional: true, _opp_status: o.status } }));
  }, [run, active, streaming]);

  const displayRows = useMemo(() => [...(active?.rows ?? []), ...provisional], [active, provisional]);
  const activeDisplay: BobTable | null = active ? { ...active, rows: displayRows } : null;
  // Cards only for a handful of rows, where the extra detail earns its space.
  // The old threshold was 40, so an 8-row contact list rendered as eight large
  // cards and a single result floated alone in a mostly empty pane. A recruiter
  // scanning names, numbers and status wants rows, not posters.
  const view: ResultsView = viewPref ?? (displayRows.length > 5 ? "table" : "cards");

  // Provisional rows (negative id) must never trigger a PATCH/enrich/delete on a
  // non-existent bob_row, so guard every row action at the boundary.
  const rowStatusG = (id: number, s: string) => { if (id >= 0) onRowStatus(id, s); };
  const enrichRowG = (id: number) => { if (id >= 0) onEnrichRow(id); };
  const deleteRowG = (id: number) => { if (id >= 0) onDeleteRow(id); };

  // Track which rows are new (for the flash-in animation), then mark seen.
  // New look: a table that opens with its rows already in it does not flash all of them on every visit;
  // only rows that arrive while it is open do.
  const seenTables = useRef<Set<number>>(new Set());
  const newIds = useMemo(() => {
    const ids = new Set<number>();
    for (const t of tables) {
      if (ui === "new" && !seenTables.current.has(t.id)) continue;
      for (const r of t.rows) if (!seenRows.current.has(r.id)) ids.add(r.id);
    }
    for (const r of provisional) if (!seenRows.current.has(r.id)) ids.add(r.id);
    return ids;
  }, [tables, provisional, ui]);
  useEffect(() => {
    const timer = setTimeout(() => {
      for (const t of tables) seenTables.current.add(t.id);
      for (const t of tables) for (const r of t.rows) seenRows.current.add(r.id);
      for (const r of provisional) seenRows.current.add(r.id);
    }, 100);
    return () => clearTimeout(timer);
  }, [tables, provisional]);

  const exportXlsx = async (t: BobTable) => {
    const res = await fetch(`${API}/tables/${t.id}/export`, { headers: authHeaders() });
    if (!res.ok) return alert("Export failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${t.name.replace(/[^a-z0-9 _-]/gi, "")}.xlsx`;
    // Anchor must be in the DOM for the click to trigger a download in all
    // browsers, and the object URL must NOT be revoked synchronously: doing so
    // races the download and aborts it (the "Export does nothing" bug). Defer
    // cleanup so the browser has started reading the blob first.
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <section
      className="shrink-0 bg-[#f4f0e8] flex flex-col min-w-0 relative"
      style={{ width: fullWidth ? "100%" : `${widthPct}%` }}
    >
      {/* Header */}
      <div className="h-12 shrink-0 border-b-2 border-neutral-900 bg-white flex items-center gap-2 px-3">
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto bob-thinscroll">
        {tables.map((t) => (
          <button
            key={t.id}
            onClick={() => { setActiveId(t.id); setDetailRow(null); }}
            className={`flex items-center gap-1 max-w-[150px] shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold border-2 transition-colors ${
              active?.id === t.id
                ? "bg-violet-500 text-white border-neutral-900"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-900"
            }`}
            title={ui === "new" ? sentence(t.name) : prettify(t.name)}
          >
            <span className="truncate">{ui === "new" ? sentence(t.name) : prettify(t.name)}</span>
            {ui === "new"
              ? <span className="sx-count shrink-0">{t.id === active?.id ? displayRows.length : t.rows.length}</span>
              : <span className="opacity-70 shrink-0">· {t.id === active?.id ? displayRows.length : t.rows.length}</span>}
          </button>
        ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="sx-seg flex items-center rounded-xl border-2 border-neutral-900 overflow-hidden mr-1">
            {([["cards", FiLayers, "Card view"], ["table", FiGrid, "Table view"]] as const).map(([v, Icon, label]) => (
              <button
                key={v}
                onClick={() => onViewPref(v as ResultsView)}
                title={label}
                className={`w-9 h-8 flex items-center justify-center transition-colors ${
                  view === v ? "bg-neutral-900 text-white" : "bg-white text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                <Icon size={14} />
                {ui === "new" && <span className="sx-seg-label">{v === "cards" ? "Cards" : "Table"}</span>}
              </button>
            ))}
          </div>
          {active && (() => {
            const rows = active.rows;
            const enriching = rows.some((r) => contactStatus(r.cells) === "enriching");
            const pending = rows.filter((r) => !["found", "enriching"].includes(contactStatus(r.cells))).length;
            if (rows.length === 0) return null;
            return (
              <button
                onClick={() => onEnrichTable(active.id)}
                disabled={enriching || pending === 0}
                title={pending === 0 ? "Every row is enriched" : "Find phone + email for all remaining rows (paid)"}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border-2 transition-colors ${
                  enriching || pending === 0
                    ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                    : "bg-violet-500 text-white border-neutral-900 hover:bg-violet-600"
                }`}
              >
                {enriching
                  ? <><FiLoader size={13} className="animate-spin" /> Enriching…</>
                  : <><FiUsers size={13} /> Enrich all{pending > 0 ? ` (${pending})` : ""}</>}
              </button>
            );
          })()}
          {active && (
            <button
              onClick={() => exportXlsx(active)}
              title="Export to Excel"
              className="flex items-center gap-1.5 bg-neutral-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-violet-500 transition-colors"
            >
              <FiDownload size={13} /> Export
            </button>
          )}
          <button
            onClick={onExpand}
            title={expanded ? "Back to split view" : "Expand results"}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            {expanded ? <FiMinimize2 size={15} /> : <FiMaximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Coach card: once the run is done, if it fell short / hit zero / widened, show the outcome
          and the one-click relax levers right above the results. */}
      {!run && coach && <ResultSummaryCard coach={coach} onLever={onLever} />}

      {/* Body */}
      {/* While a run is ACTIVE, MissionControl owns the pane the whole time: companies stream into
          its own live list, not a half-baked "In review…" provisional table. The real table only
          takes over once the run is DONE (run is null here). */}
      {/* A streaming run hands the pane to the real table as soon as its first row lands; MissionControl covers
          the minutes before that. */}
      {run && !liveTable && (MISSION_CONTROL ? <MissionControl run={run} /> : <RunGraph run={run} />)}
      {run && liveTable && <LiveStrip run={run} rows={active?.rows.length ?? 0} />}

      {(!run || liveTable) && activeDisplay && view === "cards" && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))" }}>
            {activeDisplay.rows.map((r, idx) => (
              <CompanyCard
                key={r.id}
                row={r}
                index={idx}
                isNew={newIds.has(r.id)}
                onOpen={() => setDetailRow(r)}
                onStatus={(s) => rowStatusG(r.id, s)}
                onEnrich={() => enrichRowG(r.id)}
                onDelete={() => deleteRowG(r.id)}
              />
            ))}
          </div>
          {displayRows.length === 0 && !run && (
            <p className="text-sm text-neutral-400 p-6 text-center">Results will appear here as Sensei finds them.</p>
          )}
        </div>
      )}

      {(!run || liveTable) && activeDisplay && view === "table" && (
        <DenseTable
          table={activeDisplay}
          newIds={newIds}
          onRowClick={setDetailRow}
          onRowStatus={rowStatusG}
          onEnrich={enrichRowG}
          onDelete={deleteRowG}
        />
      )}

      {detailRow && activeDisplay && (
        <RowDrawer
          row={activeDisplay.rows.find((r) => r.id === detailRow.id) || detailRow}
          columns={orderColumns(activeDisplay.columns)}
          onClose={() => setDetailRow(null)}
          onStatus={(s) => { rowStatusG(detailRow.id, s); setDetailRow({ ...detailRow, status: s }); }}
          onEnrich={() => enrichRowG(detailRow.id)}
          onDelete={() => { deleteRowG(detailRow.id); setDetailRow(null); }}
        />
      )}
    </section>
  );
}

// ── Contact reveal controls ──────────────────────────────────────────────────

// Contacts are revealed on demand. A row's status lives in _contact_status;
// legacy rows (pre-reveal) infer "found" from a populated phone/email.
function contactStatus(cells: Record<string, unknown>): string {
  const s = str(cells._contact_status);
  if (s) return s;
  return str(cells.contact_phone) || str(cells.contact_email) ? "found" : "pending";
}

// ── Quick-lookup results: contact cards in the chat ─────────────────────────────
// A lookup ("get me this person's number", the HR for a job link or a screenshot) answers in the chat itself: one card
// per person or job, filling in live as the number comes back (owner, 2026-10-15: the side panel and its research view
// are for searches only). The backend names these two tables (services/bob/quick.py).
const QUICK_TABLES = new Set(["Contacts", "Jobs and hiring contacts"]);

function QuickResults({ tables, onEnrichRow, onOpenTable }: {
  tables: BobTable[];
  onEnrichRow: (rowId: number) => void;
  onOpenTable: () => void;
}) {
  const items = tables.flatMap((t) => t.rows.map((r) => ({ job: t.name !== "Contacts", row: r })));
  if (items.length === 0) return null;
  return (
    <div className="pl-10 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10.5px] font-bold uppercase tracking-wide text-neutral-500">
          {items.length === 1 ? "1 contact in this chat" : `${items.length} contacts in this chat`}
        </span>
        <button onClick={onOpenTable} title="Show these as a table (to export)"
          className="inline-flex items-center gap-1 text-[11.5px] font-bold text-violet-600 hover:text-violet-800">
          <FiGrid size={11} /> Open as table
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(({ job, row }) => (
          <QuickCard key={row.id} job={job} cells={row.cells} onEnrich={() => onEnrichRow(row.id)} />
        ))}
      </div>
    </div>
  );
}

function QuickCard({ job, cells: c, onEnrich }: { job: boolean; cells: Record<string, unknown>; onEnrich: () => void }) {
  const ui = useContext(UiContext);
  const status = contactStatus(c);
  const who = ui === "new" ? personName(job ? str(c.contact_name) : str(c.name)) : job ? str(c.contact_name) : str(c.name);
  const title = job ? str(c.contact_title) : str(c.title);
  const company = str(c.company);
  const phone = str(c.contact_phone);
  const email = str(c.contact_email);
  const profile = extractUrls(str(job ? c.contact_linkedin_url : c.linkedin_url))
    .find((u) => /linkedin\.com\/in\//i.test(u));
  const post = job ? extractUrls(str(c.evidence_url))[0] : "";
  const note = str(c._contact_note);
  const subtitle = [title, job ? "" : company].filter(Boolean).join(" · ");
  return (
    <div className={`${CARD} px-3.5 py-3 flex flex-col gap-1.5 min-w-0`}>
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0">
          {job && (
            <div className="text-[11px] font-bold text-neutral-500 truncate">
              {[str(c.role) || "Role", company, str(c.city)].filter(Boolean).join(" · ")}
            </div>
          )}
          <div className="text-[14px] font-bold truncate">
            {who || (job ? "Hiring contact" : "Person")}
          </div>
          {subtitle && <div className="text-[12px] text-neutral-500 truncate">{subtitle}</div>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {profile && (
            <a href={profile} target="_blank" rel="noreferrer" title="LinkedIn profile"
              className="w-7 h-7 rounded-lg border border-neutral-200 flex items-center justify-center text-[#0a66c2] hover:border-[#0a66c2]">
              <FiLinkedin size={13} />
            </a>
          )}
          {post && (
            <a href={post} target="_blank" rel="noreferrer" title="Job post"
              className="w-7 h-7 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-neutral-900">
              <FiExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
      {status === "enriching" ? (
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-violet-600">
          <FiLoader size={12} className="animate-spin" /> Finding their number…
        </div>
      ) : phone || email ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] min-w-0">
          {phone && (
            <span className="inline-flex items-center gap-0.5 min-w-0">
              <a href={`tel:${phone}`} className="inline-flex items-center gap-1 font-bold hover:text-violet-700">
                <FiPhone size={12} className="text-green-600" /> {ui === "new" ? formatPhone(phone) : phone}
              </a>
              {ui === "new" && <CopyButton value={phone} label="phone number" />}
            </span>
          )}
          {email && (
            <span className="inline-flex items-center gap-0.5 min-w-0 max-w-full">
              <a href={`mailto:${email}`} className="inline-flex items-center gap-1 text-neutral-700 hover:text-violet-700 truncate max-w-full">
                <FiMail size={12} className="text-violet-600" /> {email}
              </a>
              {ui === "new" && <CopyButton value={email} label="email" />}
            </span>
          )}
          {!phone && <span className="text-[11.5px] text-neutral-500">No phone number found</span>}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="text-[12px] text-neutral-500 truncate" title={note}>
            {note || (status === "pending" ? "Not looked up yet" : "No number found")}
          </span>
          <EnrichButton cells={c} onEnrich={onEnrich} size="xs" />
        </div>
      )}
    </div>
  );
}

function EnrichButton({ cells, onEnrich, size = "sm" }: {
  cells: Record<string, unknown>;
  onEnrich: () => void;
  size?: "sm" | "xs";
}) {
  const status = contactStatus(cells);
  const pad = size === "xs" ? "text-[10px] px-1.5 py-0.5 gap-0.5" : "text-[11px] px-2 py-1 gap-1";
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  if (status === "enriching")
    return (
      <span className={`inline-flex items-center font-bold rounded-lg bg-violet-50 text-violet-600 border border-violet-200 ${pad}`}>
        <FiLoader size={10} className="animate-spin" /> Enriching
      </span>
    );
  if (status === "found" && cells._weak_contact)
    return (
      <button onClick={(e) => { stop(e); onEnrich(); }} title={str(cells._contact_note) || "Weak contact: an engineer on the team. Click to re-run"}
        className={`inline-flex items-center font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 ${pad}`}>
        <FiCheck size={10} /> Weak contact
      </button>
    );
  if (status === "found")
    return (
      <button onClick={(e) => { stop(e); onEnrich(); }} title={str(cells._contact_note) || "Contact found. Click to re-run"}
        className={`inline-flex items-center font-bold rounded-lg bg-green-50 text-green-700 border border-green-300 hover:bg-green-100 ${pad}`}>
        <FiCheck size={10} /> Contact
      </button>
    );
  if (status === "no_phone")
    return (
      <button onClick={(e) => { stop(e); onEnrich(); }} title={str(cells._contact_note) || "We found the right person, but no phone number is on file. Nothing was charged. Click to try again"}
        className={`inline-flex items-center font-bold rounded-lg bg-neutral-100 text-neutral-600 border border-neutral-300 hover:border-neutral-400 ${pad}`}>
        <FiPhoneOff size={10} /> No phone
      </button>
    );
  if (status === "not_found")
    return (
      <button onClick={(e) => { stop(e); onEnrich(); }} title={str(cells._contact_note) || "No reachable contact found. Click to retry"}
        className={`inline-flex items-center font-bold rounded-lg bg-neutral-100 text-neutral-500 border border-neutral-300 hover:border-neutral-400 ${pad}`}>
        <FiSlash size={10} /> No contact
      </button>
    );
  if (status === "error")
    return (
      <button onClick={(e) => { stop(e); onEnrich(); }} title={str(cells._contact_note) || "Enrichment failed. Retry"}
        className={`inline-flex items-center font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 ${pad}`}>
        Retry
      </button>
    );
  return (
    <button onClick={(e) => { stop(e); onEnrich(); }} title="Find phone + email for this company (paid)"
      className={`inline-flex items-center font-bold rounded-lg bg-violet-500 text-white border-2 border-neutral-900 hover:bg-violet-600 ${pad}`}>
      <FiUserPlus size={10} /> Enrich
    </button>
  );
}

function DeleteRowButton({ onDelete, size = 14 }: { onDelete: () => void; size?: number }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (confirm("Remove this row? The company is excluded from future runs in this chat."))
          onDelete();
      }}
      title="Remove row"
      className="w-6 h-6 shrink-0 rounded-lg flex items-center justify-center text-neutral-300 hover:bg-red-50 hover:text-red-600"
    >
      <FiX size={size} />
    </button>
  );
}

// ── Company card ─────────────────────────────────────────────────────────────

function CompanyCard({ row, index, isNew, onOpen, onStatus, onEnrich, onDelete }: {
  row: BobRow;
  index: number;
  isNew: boolean;
  onOpen: () => void;
  onStatus: (s: string) => void;
  onEnrich: () => void;
  onDelete: () => void;
}) {
  const ui = useContext(UiContext);
  const c = row.cells;
  const prov = c._provisional === true;
  const company = str(c.company) || `Company ${index + 1}`;
  const website = str(c.website);
  const domain = website ? domainOf(website) : "";
  // LinkedIn/job-board URLs in the website field are not a real company site:
  // never use them for the favicon or a "website" chip.
  const websiteIsReal = !!domain && !NON_SITE_DOMAINS.test(domain);
  // new look: the job leads the line under the company (two openings at one employer read as two jobs)
  const meta = [ui === "new" ? str(c.role) : "", str(c.city), str(c.size_band) !== "unknown" ? str(c.size_band) : ""].filter(Boolean).join(" · ");
  const what = str(c.what_they_do);
  const whyNow = str(c.why_now);
  const evidence = str(c.hiring_evidence);
  const evidenceUrls = extractUrls(str(c.evidence_url)).filter((u) => !/linkedin\.com\/in\//i.test(u)).slice(0, 2);
  const allLinkedin = extractUrls(str(c.contact_linkedin_url) + " " + str(c.linkedin_url));
  const profileUrl =
    allLinkedin.find((u) => /linkedin\.com\/in\//i.test(u)) ||
    extractUrls(str(c.evidence_url)).find((u) => /linkedin\.com\/in\//i.test(u));
  const companyPageUrl = allLinkedin.find((u) => /linkedin\.com\/(company|school)\//i.test(u));
  // Two row shapes reach this card. The placement pipeline writes contact_* on a
  // COMPANY row; bulk enrichment writes flat name/email/phone on a PERSON row.
  // Reading only contact_* meant an enriched contact rendered as an empty card
  // with a company name and nothing else, which is exactly the data the user
  // just paid for.
  const contactName = ui === "new" ? personName(str(c.contact_name) || str(c.name)) : str(c.contact_name) || str(c.name);
  const contactTitle = str(c.contact_title) || str(c.title);
  const contactPhone = str(c.contact_phone) || str(c.phone);
  const contactEmail = str(c.contact_email) || str(c.email);
  // A person row leads with the PERSON; the employer is context, not the headline.
  const isPersonRow = !str(c.contact_name) && !!str(c.name);
  const tier = str(c.tier).toUpperCase().replace(/[^T0-9]/g, "");
  const fit = parseFloat(str(c.fit_score));
  const funding = str(c.funding);

  return (
    <div
      onClick={onOpen}
      className={`${CARD} p-4 cursor-pointer ${PRESS} flex flex-col gap-2.5 ${isNew ? "bob-new" : ""} ${prov ? "bob-prov" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <CompanyLogo company={company} website={website} domain={str(c._domain)} size={36} />
        <div className="min-w-0 flex-1">
          <div className="font-['Clash_Display'] text-[17px] font-semibold leading-tight truncate">
            {isPersonRow ? contactName : company}
          </div>
          <div className="text-[11.5px] text-neutral-500 truncate">
            {isPersonRow
              ? [contactTitle, company].filter(Boolean).join(" · ")
              : (meta || what || "")}
          </div>

        </div>
        {!isNaN(fit) && (
          <div
            title={`Fit score ${fit}${fit > 10 ? "/100" : "/10"}`}
            className={`shrink-0 min-w-9 h-9 px-1.5 rounded-xl border-2 border-neutral-900 flex items-center justify-center font-black text-sm ${
              (fit > 10 ? fit >= 80 : fit >= 8) ? "bg-green-300" : (fit > 10 ? fit >= 60 : fit >= 6) ? "bg-amber-200" : "bg-neutral-100"
            }`}
          >
            {ui === "new" ? fitText(fit) : fit}
          </div>
        )}
      </div>

      {/* Why now */}
      {(whyNow || evidence) && (
        <div className="border-l-[3px] border-violet-500 bg-violet-50/60 rounded-r-lg pl-2.5 pr-2 py-1.5">
          <p
            className="text-[12.5px] text-neutral-800 leading-snug overflow-hidden"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
          >
            {ui === "new" && str(c.student) && (whyNow || evidence).startsWith(`${str(c.student)}:`)
              ? <><strong className="font-semibold text-neutral-900">{str(c.student)}</strong>{(whyNow || evidence).slice(str(c.student).length)}</>
              : whyNow || evidence}
          </p>
        </div>
      )}

      {funding && (
        <p className="text-[11.5px] text-neutral-500 truncate">💰 {funding}</p>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
        {evidenceUrls.map((u, i) => (
          <LinkChip key={u} href={u} label={evidenceUrls.length > 1 ? `Evidence ${i + 1}` : "View evidence"} icon={<FiFileText size={11} />} />
        ))}
        {websiteIsReal && (
          <LinkChip
            href={/^https?:\/\//i.test(website) ? website : `https://${domain}`}
            label={domain}
            icon={<FiGlobe size={11} />}
          />
        )}
        {companyPageUrl && !evidenceUrls.includes(companyPageUrl) && (
          <LinkChip href={companyPageUrl} label="LinkedIn page" icon={<FiLinkedin size={11} className="text-[#0a66c2]" />} />
        )}
      </div>

      {/* Contact + status */}
      <div className="mt-auto pt-2 border-t border-neutral-100 flex flex-col gap-2">
        {prov ? (
          <div className="flex items-center"><ProvChip status={str(c._opp_status)} /></div>
        ) : (
        <div className="flex items-center gap-2">
          {contactName ? (
            <>
              {/* On a PERSON row the card headline is already this person, so
                  repeating the avatar and name here just says it twice. Company
                  rows still need it: there the contact is a separate human from
                  the company in the headline. */}
              {!isPersonRow && (
                <>
                  <div className="w-7 h-7 shrink-0 rounded-full bg-violet-100 border border-violet-300 flex items-center justify-center text-[10px] font-black text-violet-700">
                    {contactName.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-bold truncate">{contactName}</div>
                    <div className="text-[10.5px] text-neutral-500 truncate">{contactTitle || ""}</div>
                  </div>
                </>
              )}
              {isPersonRow && (
                <div className="min-w-0 flex-1 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {contactPhone && (
                    <a href={`tel:${contactPhone}`} title="Call"
                       className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-lg border border-neutral-200 px-2 py-1 text-neutral-700 hover:border-neutral-900">
                      <FiPhone size={11} className="text-green-600" /> {ui === "new" ? formatPhone(contactPhone) : contactPhone}
                    </a>
                  )}
                  {contactEmail && (
                    <a href={`mailto:${contactEmail}`} title="Email"
                       className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-lg border border-neutral-200 px-2 py-1 text-neutral-700 hover:border-neutral-900 max-w-[15rem] truncate">
                      <FiMail size={11} className="text-violet-600" /> {contactEmail}
                    </a>
                  )}
                </div>
              )}
              {tier && <TierBadge tier={tier} />}
              {profileUrl && (
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Open LinkedIn profile"
                  className="w-7 h-7 shrink-0 rounded-lg border border-neutral-200 flex items-center justify-center text-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                >
                  <FiLinkedin size={13} />
                </a>
              )}
            </>
          ) : (
            <EnrichButton cells={c} onEnrich={onEnrich} />
          )}
          <select
            aria-label="Status"
            value={row.status}
            onChange={(e) => onStatus(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className={`shrink-0 text-[10.5px] font-bold rounded-lg px-1.5 py-1 border cursor-pointer ${STATUS_STYLE[row.status] || STATUS_STYLE.new}`}
          >
            {ROW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <DeleteRowButton onDelete={onDelete} />
        </div>
        )}
        {!prov && !isPersonRow && (contactPhone || contactEmail) && (
          <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
            {contactPhone && (
              <a href={`tel:${contactPhone}`} title="Call"
                className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-lg border border-neutral-200 px-2 py-1 text-neutral-700 hover:border-neutral-900">
                <FiPhone size={11} className="text-green-600" /> {ui === "new" ? formatPhone(contactPhone) : contactPhone}
              </a>
            )}
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} title="Email"
                className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-lg border border-neutral-200 px-2 py-1 text-neutral-700 hover:border-neutral-900">
                <FiMail size={11} className="text-violet-600" /> {contactEmail}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const style = tier === "T1" ? "bg-green-100 text-green-800 border-green-300"
    : tier === "T2" ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-neutral-100 text-neutral-500 border-neutral-200";
  const hint = tier === "T1" ? "Named in the hiring evidence" : tier === "T2" ? "Right title, right city" : "Right title, city unconfirmed";
  return <span title={hint} className={`shrink-0 inline-block text-[10px] font-black border rounded-md px-1.5 py-0.5 ${style}`}>{tier}</span>;
}

// ── Dense table view ─────────────────────────────────────────────────────────

function DenseTable({ table, newIds, onRowClick, onRowStatus, onEnrich, onDelete }: {
  table: BobTable;
  newIds: Set<number>;
  onRowClick: (r: BobRow) => void;
  onRowStatus: (rowId: number, status: string) => void;
  onEnrich: (rowId: number) => void;
  onDelete: (rowId: number) => void;
}) {
  // The reveal drives its own Contact column; hide the raw contact_* cells so
  // they don't duplicate it (they render inside the drawer instead).
  const HIDE = new Set(["company", "contact_name", "contact_title", "contact_phone",
    "contact_email", "contact_linkedin_url", "tier"]);
  const cols = orderColumns(table.columns);
  const ui = useContext(UiContext);
  // New look: a match table leads with the student it is about; the role reads under the company, so two
  // openings at one employer no longer look like the same row twice; the fit score sits beside the name.
  const has = (k: string) => table.columns.some((c) => c.key === k);
  const studentFirst = ui === "new" && has("student");
  const roleUnder = ui === "new" && has("role");
  const fitCol = ui === "new" ? table.columns.find((c) => c.key === "fit_score") : undefined;
  const hide = new Set(HIDE);
  if (studentFirst) hide.add("student");
  if (roleUnder) hide.add("role");
  if (fitCol) hide.add("fit_score");
  const TH = "px-3 py-2.5 text-left font-bold text-neutral-500 border-b-2 border-neutral-900 whitespace-nowrap";
  const companyCell = (r: BobRow) => (
    <span className="inline-flex items-start gap-2 min-w-0">
      <CompanyLogo company={str(r.cells.company)} website={str(r.cells.website)} domain={str(r.cells._domain)} size={20} />
      <span className="min-w-0">
        <span className="block">{str(r.cells.name) || str(r.cells.company)}</span>
        {roleUnder && str(r.cells.role) && <span className="sx-sub block">{str(r.cells.role)}</span>}
      </span>
    </span>
  );
  return (
    <div className="flex-1 overflow-auto bg-white" tabIndex={0} aria-label={`${table.name}: results table`}>
      <table className="text-[12.5px] border-collapse w-full">
        <thead className="sticky top-0 z-20">
          <tr className="bg-[#faf7f2]">
            <th className={`sticky left-0 z-30 bg-[#faf7f2] ${TH}`}>{studentFirst ? "Student" : "Company"}</th>
            {studentFirst && <th data-col="company" className={TH}>Company</th>}
            {fitCol && <th data-col="fit_score" className={TH}>{columnLabel(fitCol, ui)}</th>}
            <th className="px-3 py-2.5 text-left font-bold text-neutral-500 border-b-2 border-neutral-900 whitespace-nowrap">Contact</th>
            {cols.filter((c) => !hide.has(c.key)).map((c) => (
              <th key={c.key} data-col={c.key} className={`px-3 py-2.5 text-left font-bold text-neutral-500 border-b-2 border-neutral-900 whitespace-nowrap ${WIDE_KEYS.has(c.key) ? "min-w-[240px]" : ""}`}>
                {columnLabel(c, ui)}
              </th>
            ))}
            <th className="px-3 py-2.5 text-left font-bold text-neutral-500 border-b-2 border-neutral-900 whitespace-nowrap">Status</th>
            <th className="px-2 py-2.5 border-b-2 border-neutral-900"><span className="sr-only">Remove</span></th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r, idx) => {
            const prov = r.cells._provisional === true;
            return (
            <tr
              key={r.id}
              onClick={() => onRowClick(r)}
              className={`border-b border-neutral-200 align-top cursor-pointer transition-colors hover:bg-neutral-100 ${idx % 2 ? "bg-neutral-50" : "bg-white"} ${newIds.has(r.id) ? "bob-new" : ""} ${prov ? "bob-prov" : ""}`}
            >
              <td className="sticky left-0 z-10 px-3 py-2.5 font-bold whitespace-nowrap bg-inherit border-r border-neutral-100">
                {ui === "new" ? (
                  <span className="inline-flex items-start gap-2">
                    <span className="w-4 text-right text-[10px] font-normal text-neutral-300">{idx + 1}</span>
                    {studentFirst ? <span>{str(r.cells.student) || "-"}</span> : companyCell(r)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 text-right text-[10px] font-normal text-neutral-300">{idx + 1}</span>
                    <CompanyLogo company={str(r.cells.company)} website={str(r.cells.website)} domain={str(r.cells._domain)} size={20} />
                    {str(r.cells.name) || str(r.cells.company)}
                  </span>
                )}
              </td>
              {studentFirst && <td data-col="company" className="px-3 py-2.5 font-semibold">{companyCell(r)}</td>}
              {fitCol && <td data-col="fit_score" className="px-3 py-2.5"><Cell colKey="fit_score" value={r.cells.fit_score} /></td>}
              <td className="px-3 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                {prov ? (
                  <span className="text-neutral-300">-</span>
                ) : str(r.cells.contact_name) ? (
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold truncate max-w-[180px]">{ui === "new" ? personName(str(r.cells.contact_name)) : str(r.cells.contact_name)}</div>
                    <div className="flex items-center gap-2 text-[10.5px] text-neutral-500">
                      {str(r.cells.contact_phone) && (
                        <a href={`tel:${str(r.cells.contact_phone)}`} className="inline-flex items-center gap-0.5 hover:text-neutral-900">
                          <FiPhone size={9} className="text-green-600" /> {ui === "new" ? formatPhone(str(r.cells.contact_phone)) : str(r.cells.contact_phone)}
                        </a>
                      )}
                      {str(r.cells.contact_email) && (
                        <a href={`mailto:${str(r.cells.contact_email)}`} className="inline-flex items-center gap-0.5 hover:text-neutral-900 truncate max-w-[150px]">
                          <FiMail size={9} className="text-violet-600" /> {str(r.cells.contact_email)}
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <EnrichButton cells={r.cells} onEnrich={() => onEnrich(r.id)} size="xs" />
                )}
              </td>
              {cols.filter((c) => !hide.has(c.key)).map((c) => {
                // a match table's "why it fits" opened with the student's name, already the first column
                const who = studentFirst ? str(r.cells.student) : "";
                const v = who && str(r.cells[c.key]).startsWith(`${who}: `) ? str(r.cells[c.key]).slice(who.length + 2) : r.cells[c.key];
                return (
                  <td key={c.key} data-col={c.key} className={`px-3 py-2.5 ${WIDE_KEYS.has(c.key) ? "min-w-[240px] max-w-[340px]" : "max-w-[200px]"}`}>
                    <Cell colKey={c.key} value={v} />
                  </td>
                );
              })}
              <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                {prov ? (
                  <ProvChip status={str(r.cells._opp_status)} />
                ) : (
                  <select
                    aria-label="Status"
                    value={r.status}
                    onChange={(e) => onRowStatus(r.id, e.target.value)}
                    className={`text-[11px] font-bold rounded-lg px-1.5 py-1 border cursor-pointer ${STATUS_STYLE[r.status] || STATUS_STYLE.new}`}
                  >
                    {ROW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </td>
              <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                {!prov && <DeleteRowButton onDelete={() => onDelete(r.id)} />}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
      {table.rows.length === 0 && (
        <p className="text-sm text-neutral-400 p-6 text-center">Rows will appear here as Sensei finds them.</p>
      )}
    </div>
  );
}

// ── Smart cells ──────────────────────────────────────────────────────────────

function LinkChip({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 max-w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-neutral-700 hover:border-violet-400 hover:text-violet-700 transition-colors whitespace-nowrap"
    >
      {icon}
      <span className="truncate max-w-[130px]">{label}</span>
      <FiExternalLink size={10} className="shrink-0 opacity-60" />
    </a>
  );
}

function Cell({ colKey, value }: { colKey: string; value: unknown }) {
  const ui = useContext(UiContext);
  const s = str(value);
  if (!s) return <span className="text-neutral-300">-</span>;

  if (colKey === "tier") {
    const t = s.toUpperCase().replace(/[^T0-9]/g, "");
    return <TierBadge tier={t || s.slice(0, 4)} />;
  }

  if (colKey === "fit_score") {
    const n = parseFloat(s);
    if (!isNaN(n)) {
      // new look: the same bands on either scale (a 69 of 100 is amber in the card, so it is amber here too)
      const k = ui === "new" && n > 10 ? n / 10 : n;
      const style = k >= 8 ? "bg-green-100 text-green-800" : k >= 6 ? "bg-amber-100 text-amber-800" : "bg-neutral-100 text-neutral-500";
      return <span className={`inline-block text-[11px] font-black rounded-md px-1.5 py-0.5 ${style}`}>{ui === "new" ? fitText(n) : n}</span>;
    }
  }

  if (colKey === "website") {
    const domain = domainOf(s);
    const href = /^https?:\/\//i.test(s) ? extractUrls(s)[0] || `https://${domain}` : `https://${domain}`;
    if (NON_SITE_DOMAINS.test(domain)) {
      const isLi = /linkedin\.com/i.test(domain);
      return (
        <LinkChip
          href={href}
          label={isLi ? "LinkedIn page" : domain}
          icon={isLi ? <FiLinkedin size={11} className="text-[#0a66c2]" /> : <FiFileText size={11} />}
        />
      );
    }
    return (
      <LinkChip
        href={href}
        label={domain}
        icon={<img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} alt="" className="w-3.5 h-3.5 rounded-sm" />}
      />
    );
  }

  const urls = extractUrls(s);
  if (urls.length > 0) {
    return (
      <span className="flex flex-wrap gap-1">
        {urls.slice(0, 3).map((u, i) => {
          const isLi = /linkedin\.com/i.test(u);
          const label = colKey.includes("evidence")
            ? (urls.length > 1 ? `Link ${i + 1}` : "View evidence")
            : isLi ? "LinkedIn" : domainOf(u);
          return (
            <LinkChip
              key={u + i}
              href={u}
              label={label}
              icon={isLi ? <FiLinkedin size={11} className="text-[#0a66c2]" /> : <FiFileText size={11} />}
            />
          );
        })}
      </span>
    );
  }

  return (
    <span
      className="block overflow-hidden text-neutral-800 leading-snug"
      style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
      title={s.length > 80 ? s : undefined}
    >
      {s}
    </span>
  );
}

// ── Row dossier drawer ───────────────────────────────────────────────────────

const CONTACT_KEYS = ["contact_name", "contact_title", "contact_phone", "contact_email", "tier", "linkedin_url", "contact_linkedin_url"];
const EVIDENCE_KEYS = ["hiring_evidence", "evidence_url", "why_now", "signal_rationale"];
const COMPANY_KEYS = ["website", "city", "size_band", "what_they_do", "funding", "fit_score"];

function RowDrawer({ row, columns, onClose, onStatus, onEnrich, onDelete }: {
  row: BobRow;
  columns: BobColumn[];
  onClose: () => void;
  onStatus: (s: string) => void;
  onEnrich: () => void;
  onDelete: () => void;
}) {
  const ui = useContext(UiContext);
  const [copied, setCopied] = useState<string | null>(null);
  const company = str(row.cells.name) || str(row.cells.company) || "Details";

  const copy = (key: string, v: string) => {
    navigator.clipboard?.writeText(v);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  const sections: [string, BobColumn[]][] = [
    ["Contact", columns.filter((c) => CONTACT_KEYS.includes(c.key))],
    ["Evidence", columns.filter((c) => EVIDENCE_KEYS.includes(c.key))],
    ["Company", columns.filter((c) => COMPANY_KEYS.includes(c.key))],
    ["More", columns.filter((c) => c.key !== "company" && !CONTACT_KEYS.includes(c.key) && !EVIDENCE_KEYS.includes(c.key) && !COMPANY_KEYS.includes(c.key))],
  ];
  // New look: the headline is who the row is about (the student, on a match row) with the company and the
  // role under it; fit and city come first, where a match row had them filed under "Company" and the
  // student and role under "More".
  const student = str(row.cells.student);
  const role = str(row.cells.role);
  const headline = ui === "new" && student ? student : company;
  const subline = ui === "new" ? (student ? [company, role] : [role]).filter(Boolean).join(" · ") : "";
  const inHeader = new Set(ui === "new" ? ["student", "role"] : []);
  const OVERVIEW = ["fit_score", "city", "size_band"];
  const shown = ui === "new"
    ? ([
        ["Overview", columns.filter((c) => OVERVIEW.includes(c.key))],
        ["Contact", columns.filter((c) => CONTACT_KEYS.includes(c.key))],
        ["Evidence", columns.filter((c) => EVIDENCE_KEYS.includes(c.key))],
        ["Company", columns.filter((c) => COMPANY_KEYS.includes(c.key) && !OVERVIEW.includes(c.key))],
        ["More", columns.filter((c) => c.key !== "company" && !inHeader.has(c.key) && !OVERVIEW.includes(c.key)
          && !CONTACT_KEYS.includes(c.key) && !EVIDENCE_KEYS.includes(c.key) && !COMPANY_KEYS.includes(c.key))],
      ] as [string, BobColumn[]][])
    : sections;

  return (
    <>
      <div className="absolute inset-0 bg-neutral-900/20 z-30" onClick={onClose} />
      <div className="absolute top-0 right-0 bottom-0 w-full max-w-[440px] bg-white border-l-2 border-neutral-900 z-40 flex flex-col bob-pop">
        <div className="p-4 border-b-2 border-neutral-900 flex items-start gap-3">
          <div className="min-w-0">
            <h3 className="font-['Clash_Display'] text-xl font-semibold truncate">{headline}</h3>
            {subline && <p className="sx-drawer-sub">{subline}</p>}
            <div className="flex items-center gap-2 mt-1.5">
              <select
                aria-label="Status"
                value={row.status}
                onChange={(e) => onStatus(e.target.value)}
                className={`text-[11px] font-bold rounded-lg px-1.5 py-1 border cursor-pointer ${STATUS_STYLE[row.status] || STATUS_STYLE.new}`}
              >
                {ROW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <EnrichButton cells={row.cells} onEnrich={onEnrich} />
              <button
                onClick={onDelete}
                title="Remove this company from the table"
                className="text-[11px] font-bold px-2 py-1 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-600"
              >
                <FiTrash2 size={11} className="inline" />
              </button>
            </div>
            {["not_found", "no_phone", "error", "found"].includes(contactStatus(row.cells)) && str(row.cells._contact_note) && (
              <p className="text-[11px] text-neutral-500 mt-1.5">{str(row.cells._contact_note)}</p>
            )}
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900">
            <FiX />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {shown.map(([title, cols]) => {
            const visible = cols.filter((c) => str(row.cells[c.key]) !== "");
            if (visible.length === 0) return null;
            return (
              <div key={title}>
                <div className="text-[10px] font-black uppercase tracking-widest text-violet-500 mb-2">{title}</div>
                <div className="space-y-3 bg-neutral-50/70 border border-neutral-200 rounded-xl p-3">
                  {visible.map((c) => {
                    const s = str(row.cells[c.key]);
                    const urls = extractUrls(s);
                    return (
                      <div key={c.key} className="group">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-0.5 flex items-center gap-2">
                          {columnLabel(c, ui)}
                          {urls.length === 0 && (
                            <button
                              onClick={() => copy(c.key, s)}
                              className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-violet-600"
                              title="Copy"
                            >
                              {copied === c.key ? <FiCheck size={11} className="text-green-600" /> : <FiCopy size={11} />}
                            </button>
                          )}
                        </div>
                        {urls.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {urls.map((u, i) => (
                              <LinkChip
                                key={u + i}
                                href={u}
                                label={/linkedin\.com/i.test(u) ? "LinkedIn" : domainOf(u)}
                                icon={/linkedin\.com/i.test(u) ? <FiLinkedin size={11} className="text-[#0a66c2]" /> : <FiFileText size={11} />}
                              />
                            ))}
                          </div>
                        ) : ui === "new" && c.key === "fit_score" ? (
                          <Cell colKey="fit_score" value={s} />
                        ) : (
                          <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                            {ui === "new" && c.key === "contact_phone" ? formatPhone(s) : ui === "new" && c.key === "contact_name" ? personName(s) : s}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
