import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  FiUsers, FiPhone, FiZap, FiExternalLink, FiUserPlus, FiActivity,
  FiMessageSquare, FiAlertTriangle, FiHome, FiMail, FiCpu, FiCopy, FiTrash2,
} from "react-icons/fi";

// ─────────────────────────────────────────────────────────────────────────────
// dashboard.studojo.com: the org manager (super-admin) portal for a Sensei
// workspace. The BD-team managers live here: they watch team activity, the
// shared credit pool, who's spending reveals, and manage members. A button
// takes them into Sensei itself (app.studojo.com) to do the work.
// Backend: bob-svc /org/analytics (admin-gated) + /me + /org/members.
// ─────────────────────────────────────────────────────────────────────────────

export function meta() {
  return [
    { title: "Sensei Dashboard | Studojo" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

const API = "/api/v1/outreach/bob";
const SESSION_STORAGE = "bob_session";
const KEY_STORAGE = "bob_access_key";

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  if (typeof localStorage === "undefined") return h;
  const key = localStorage.getItem(KEY_STORAGE);
  const session = localStorage.getItem(SESSION_STORAGE);
  if (key) h["X-Bob-Key"] = key;
  if (session) h["X-Bob-Session"] = session;
  return h;
}

async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(options.headers as any) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `Request failed (${res.status})`);
  return data as T;
}

// dashboard.studojo.* -> app.studojo.* (same env). Carries the session token
// across the subdomain (localStorage is per-origin) so Sensei opens as the SAME
// account the manager is signed into here, not whatever was cached on app.*.
function senseiUrl(): string {
  if (typeof window === "undefined") return "https://app.studojo.com";
  const host = window.location.host.replace(/^dashboard\./, "app.");
  const base = `${window.location.protocol}//${host}`;
  const s = typeof localStorage !== "undefined" ? localStorage.getItem(SESSION_STORAGE) : null;
  // Opened on /oldui, land on /oldui over there too, so the original look carries across.
  const path = homePath();
  return s ? `${base}${path}?s=${encodeURIComponent(s)}` : path === "/" ? base : base + path;
}

function fmtDate(s: string | null): string {
  if (!s) return "-";
  try { return new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
  catch { return "-"; }
}
function fmtTime(s: string | null): string {
  if (!s) return "-";
  try { return new Date(s).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
  catch { return "-"; }
}

// ── Types ────────────────────────────────────────────────────────────────────
interface Me { email: string | null; role: string; org: { id: number; name: string } | null }
interface Member { email: string; name: string; role: string; last_login_at: string | null; chats: number; phones_revealed: number; last_activity: string | null }
interface Chat { id: number; title: string; owner_email: string | null; shared_org: boolean; updated_at: string | null; assigned_to: string | null }
interface Activity { created_at: string | null; kind: string; delta: number; reason: string; email: string | null }
interface Credits { enrichment_balance: number; ai_balance: number; enrichment_used: number; ai_used: number; low: boolean }
interface EnrichLog { created_at: string | null; email: string | null; chat_title: string | null; company: string | null; contact_name: string | null; contact_title: string | null; contact_phone: string | null; contact_email: string | null }
interface DashData { org: { id: number; name: string; max_members?: number | null } | null; credits: Credits | null; members: Member[]; chats: Chat[]; activity: Activity[]; enrichment_log: EnrichLog[] }
interface ChatMsg { id: number; role: string; content: string }
interface ChatRow { id: number; cells: Record<string, any>; status?: string }
interface ChatTable { id: number; name: string; rows: ChatRow[] }
interface ChatDetail { messages: ChatMsg[]; tables: ChatTable[] }

// ── Two looks, one dashboard ─────────────────────────────────────────────────
// Same arrangement as the workspace (app/routes/bob.tsx): this file draws the
// ORIGINAL look unless a route hands it ui="new". The new look is this markup
// with the stylesheet SX_CSS laid over it. Which host gets which look is decided
// in app/lib/sensei-ui.ts (a route passes the answer in); nothing here reads the
// host for that, so the file stays safe to promote on its own and production keeps
// the original. <host>/oldui (app/routes/oldui.tsx) always shows the original.
// Class names starting "sx-" in the markup are hooks for that stylesheet; they
// do nothing in the original look.
type Ui = "new" | "old";
const UiContext = createContext<Ui>("old");

// "/" or "/oldui": the path this page was opened on (lower-cased: the router
// matches paths without regard to case).
function homePath(): string {
  try {
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

/* ── the dashboard's frame: sidebar and navigation ── */
.sx aside { border-color: var(--line); }
.sx aside .h-16 { border-bottom-color: transparent; }
.sx aside .h-16 .text-base { font-size: 15px; font-weight: 600; }
.sx aside nav > button { border-radius: 10px; font-weight: 500; color: var(--t2); }
.sx aside nav > button svg { color: var(--t3); }
.sx aside nav > button:hover { background-color: var(--bg2); color: var(--ink); }
.sx aside nav > button.bg-neutral-900, .sx aside nav > button.bg-neutral-900:hover { background-color: var(--acc-soft); color: var(--ink); }
.sx aside nav > button.bg-neutral-900 svg { color: var(--acc); }
.sx aside .space-y-2 { border-color: var(--line); }
/* the way into the workspace is the one solid action */
.sx a.bg-violet-600 { background-color: var(--btn); color: var(--btn-ink); border-color: transparent; box-shadow: none; font-weight: 500; transition: translate .15s, box-shadow .15s, background-color .15s; }
.sx a.bg-violet-600:hover { background-color: var(--btn-hover); translate: 0 -1px; box-shadow: 0 10px 24px -12px rgba(18,20,45,.55); }

/* ── the page ── */
.sx main h1 { font-size: 24px; font-weight: 600; letter-spacing: -.025em; }
.sx main h2 { font-weight: 600; }
.sx main .rounded-2xl[class*=" shadow-[2px_2px"] { border-color: var(--line); }
/* figures: label above, number in the mono face */
.sx .text-3xl.font-black { font-family: var(--sans); font-size: 30px; font-weight: 600; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.sx .text-xs.font-bold.uppercase { font-size: 10.5px; font-weight: 600; letter-spacing: .06em; }
.sx main .rounded-2xl.sx-warn[class*=" shadow-[2px_2px"] { border-color: var(--amber-line); box-shadow: 0 0 0 1px var(--amber-line), var(--sh-sm); }
/* lists laid out as tables: a tinted header row over hairlines */
.sx main .grid.uppercase { background-color: var(--bg2); border-color: var(--line); color: var(--t2); }
/* the page's own actions are near-black pills, like every other primary action */
.sx main button.bg-violet-600, .sx main button.bg-violet-500 { background-color: var(--btn); color: var(--btn-ink); border-color: transparent; box-shadow: none; font-weight: 500; }
.sx main button.bg-violet-600:not(:disabled):hover, .sx main button.bg-violet-500:not(:disabled):hover { background-color: var(--btn-hover); }
.sx main select.border-2 { border-radius: 10px; background-color: var(--surface); }
.sx main select.border-violet-500 { border-color: var(--acc-line); background-color: var(--acc-soft); color: var(--acc-deep); }
.sx .rounded-full.border-2 { font-weight: 500; }
/* phone numbers and addresses sit in narrow columns: the mono face a size down so they fit */
.sx main a[href^="tel:"], .sx main a[href^="mailto:"] { font-size: 12px; }
.sx .rounded-full.border-2.border-violet-500 { border-color: var(--acc-line); }

/* ── AI agent keys ── */
.sx .rounded-2xl.border-2.border-violet-500 { border-color: var(--acc-line); }
.sx pre[class~="bg-[#15141b]"] { background-color: #16161E; border-color: transparent; color: #E6E7F0; }

/* ── the read-only chat viewer ── */
.sx .fixed.inset-0 .border-b-2 { border-color: var(--line); }
.sx .fixed.inset-0 [class~="max-w-[85%]"].bg-violet-500 { background-color: var(--btn); color: var(--btn-ink); border-color: transparent; border-radius: 18px 18px 6px 18px; }
.sx .fixed.inset-0 [class~="max-w-[85%]"].bg-white { border-color: var(--line); border-radius: 6px 18px 18px 18px; box-shadow: var(--sh-sm); color: var(--t1); }
.sx .fixed.inset-0 .rounded-2xl.border-2.overflow-hidden { border-color: var(--line); }
.sx .fixed.inset-0 [class~="bg-[#faf7f2]"] { background-color: var(--bg2); }

/* ── fixes from the second review ── */
/* phone and email in the enrichment log: the focus ring goes on the cell, which does not clip it */
.sx main .truncate:has(> a[href^="tel:"]:focus-visible), .sx main .truncate:has(> a[href^="mailto:"]:focus-visible) { outline: 2px solid var(--acc); outline-offset: 2px; border-radius: 4px; }
/* disabled primary buttons fade, as in the demo */
.sx main button.bg-violet-600:disabled, .sx main button.bg-violet-500:disabled { opacity: .35; }
/* the last row's divider would double the card's bottom edge */
.sx .border-b.border-neutral-100:last-child { border-bottom-color: transparent; }

/* ── second pass (owner's UI sprint, 2026-10-16) ── */
/* headings keep their own capitals ("Credit usage", not "Credit Usage") */
.sx h1.capitalize { text-transform: none; }
/* contact details in the text face with even digits; the mono face read as debug output */
.sx a[href^="tel:"], .sx a[href^="mailto:"] { font-family: var(--sans); font-variant-numeric: tabular-nums; }
/* a phone: the left nav becomes a strip of tabs over the page instead of a 240px column beside it */
@media (max-width: 767px) {
  .sx .min-h-screen.flex:has(> aside.fixed) { flex-direction: column; }
  .sx aside.fixed.w-60 { position: static; width: 100%; border-right-width: 0; border-bottom: 1px solid var(--line); }
  .sx aside.fixed.w-60 > nav { display: flex; gap: 4px; overflow-x: auto; padding: 6px 8px; }
  .sx aside.fixed.w-60 > nav > button { width: auto; flex: none; white-space: nowrap; padding: 8px 12px; }
  .sx aside.fixed.w-60 > .p-3 { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
  .sx aside.fixed.w-60 > .p-3 > a { width: auto; flex: 1 1 auto; }
  .sx aside.fixed.w-60 > .p-3 > div[title] { display: none; }
  .sx main[class~="ml-60"] { margin-left: 0; }
  .sx main[class~="ml-60"] > div { padding-left: 16px; padding-right: 16px; }
}
`;
/* sx:end */

// The route component, and what a plain import of this file gives: the original look.
// (React Router wraps a route's default export and drops any props handed to it, so
// the routes that choose a look import DashboardApp by name instead.)
// What a chat is called (new look), the same as in bob.tsx: a chat is named after the first 70 characters of
// its first message, so it was often a raw link or "[Attached: file.xlsx] ..." text.
const ACRONYMS = /\b(qa|hr|ui|ux|ai|ml|sde|sdet|it|bi|cto|ceo|fde|qe|ios|api|sql)\b/gi;
function chatLabel(raw: string): string {
  let t = String(raw || "").replace(/\s+/g, " ").trim();
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

// A phone number as people read it (new look), the same as in bob.tsx.
function formatPhone(p: string): string {
  const raw = String(p || "").trim();
  const d = raw.replace(/[^\d+]/g, "");
  if (/^\+91\d{10}$/.test(d)) return `+91 ${d.slice(3, 8)} ${d.slice(8)}`;
  if (/^\+1\d{10}$/.test(d)) return `+1 ${d.slice(2, 5)}-${d.slice(5, 8)}-${d.slice(8)}`;
  return raw;
}

export default function DashboardPage() {
  return <DashboardApp />;
}

export function DashboardApp({ ui }: { ui?: Ui }) {
  const look: Ui = ui === "new" ? "new" : "old";
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Password-reset link (?reset=token).
    try {
      const p = new URLSearchParams(window.location.search);
      const rt = p.get("reset");
      if (rt) {
        setResetToken(rt);
        p.delete("reset");
        window.history.replaceState({}, "", window.location.pathname + (p.toString() ? `?${p}` : ""));
      }
    } catch { /* ignore */ }
    // Session handoff from Sensei (?s=token): adopt it (overriding any stale
    // session on this subdomain), then clean the URL.
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
    : !authed ? <DashGate onSuccess={() => setAuthed(true)} />
    : <Dashboard onSignOut={() => setAuthed(false)} />;
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

function DashGate({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState("");
  const [showPw, setShowPw] = useState(false);
  // Submit what is actually in the field: browser autofill can write to the DOM
  // without firing onChange, which made typed passwords fail while pasted ones worked.
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

  const submit = async () => {
    if (!liveEmail() || !livePw() || busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch(`${API}/auth/email`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: liveEmail(), password: livePw() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d?.detail || "Could not sign you in");
      localStorage.setItem(SESSION_STORAGE, d.token);
      localStorage.removeItem(KEY_STORAGE);
      onSuccess();
    } catch (e: any) { setError(e.message || "Could not sign you in"); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6 font-['Satoshi']">
      <div className="w-full max-w-md bg-white border-2 border-neutral-900 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] p-8">
        <div className="w-12 h-12 border-2 border-neutral-900 rounded-2xl overflow-hidden mb-5">
          <SenseiMark />
        </div>
        <h1 className="font-['Clash_Display'] text-3xl font-semibold text-neutral-900">
          Team dashboard <span className="text-neutral-400 text-xl font-normal">Sensei</span>
        </h1>
        <p className="text-neutral-600 mt-2 mb-6">
          {forgot
            ? "Enter your email and we'll send you a link to set a new password."
            : "Sign in with your manager email and password to see your team's activity."}
        </p>
        <form onSubmit={(e) => { e.preventDefault(); if (forgot) submitForgot(); else submit(); }}>
        <input
          ref={emailRef} name="username" autoComplete="username"
          autoCapitalize="none" autoCorrect="off" spellCheck={false}
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full border-2 border-neutral-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        {!forgot && (
          <div className="relative mt-3">
            <input
              ref={pwRef} name="password" autoComplete="current-password"
              type={showPw ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border-2 border-neutral-900 rounded-2xl px-4 py-3 pr-16 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="button" onClick={() => setShowPw((s) => !s)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        )}
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {forgotSent && (
          <p className="text-sm text-violet-700 bg-violet-50 border-2 border-violet-200 rounded-xl px-3 py-2 mt-3">{forgotSent}</p>
        )}
        <button
          type="submit" disabled={busy}
          className="mt-4 w-full bg-violet-500 text-white font-bold py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-60"
        >
          {busy ? (forgot ? "Sending..." : "Signing in...") : (forgot ? "Send reset link" : "Continue")}
        </button>
        </form>
        <button
          type="button"
          onClick={() => { setForgot(!forgot); setError(""); setForgotSent(""); }}
          className={`mt-3 w-full text-sm font-semibold ${forgot ? "text-neutral-400 hover:text-neutral-700" : "text-violet-600 hover:text-violet-800"}`}
        >
          {forgot ? "Back to sign in" : "Forgot your password?"}
        </button>
      </div>
    </div>
  );
}

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const ui = useContext(UiContext);
  const [me, setMe] = useState<Me | null>(null);
  const [data, setData] = useState<DashData | null>(null);
  const [err, setErr] = useState("");
  const [invite, setInvite] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");
  const [showChangePw, setShowChangePw] = useState(false);
  const [viewChat, setViewChat] = useState<{ id: number; title: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const m = await api<Me>("/me");
      setMe(m);
      if (m.role === "admin") setData(await api<DashData>("/org/analytics"));
    } catch (e: any) {
      if (String(e.message).includes("401") || String(e.message).toLowerCase().includes("sign in")) {
        localStorage.removeItem(SESSION_STORAGE); onSignOut();
      } else setErr(e.message || "Could not load the dashboard");
    }
  }, [onSignOut]);
  useEffect(() => { load(); }, [load]);

  const signOut = () => {
    api("/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem(SESSION_STORAGE);
    localStorage.removeItem(KEY_STORAGE);
    onSignOut();
  };

  const doInvite = async () => {
    if (!invite.trim() || inviteBusy) return;
    setInviteBusy(true); setErr(""); setInviteMsg("");
    const who = invite.trim();
    try {
      const r = await api<{ emailed: boolean; password: string | null }>(
        "/org/members", { method: "POST", body: JSON.stringify({ email: who, role: inviteRole }) });
      setInvite("");
      setInviteMsg(r.emailed
        ? `Invite sent to ${who}. Their login was emailed to them.`
        : `Added ${who}. Email failed, share this password with them: ${r.password}`);
      await load();
    } catch (e: any) { setErr(e.message || "Could not add member"); }
    finally { setInviteBusy(false); }
  };

  const assignChat = async (chatId: number, email: string) => {
    // Optimistic: reflect the choice immediately, then persist.
    setData((d) => d && { ...d, chats: d.chats.map((c) => c.id === chatId ? { ...c, assigned_to: email || null } : c) });
    try {
      await api(`/chats/${chatId}/assign`, { method: "POST", body: JSON.stringify({ email: email || null }) });
    } catch (e: any) { setErr(e.message || "Could not assign chat"); load(); }
  };

  const [tab, setTab] = useState<"overview" | "team" | "credits" | "chats" | "activity" | "agent">("overview");
  const card = "bg-white border-2 border-neutral-900 rounded-2xl shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]";
  const str = (v: any) => (v == null || v === "" ? "" : String(v));

  // Non-admin members don't get the manager dashboard; send them to Sensei.
  if (me && me.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#faf7f2] font-['Satoshi'] flex items-center justify-center p-6 text-neutral-900">
        <div className={`${card} p-8 max-w-md text-center`}>
          <div className="w-12 h-12 border-2 border-neutral-900 rounded-2xl overflow-hidden mx-auto mb-4">
            <SenseiMark />
          </div>
          <h1 className="font-['Clash_Display'] text-2xl font-bold mb-2">This is the manager dashboard</h1>
          <p className="text-neutral-500 mb-6">Your workspace's manager sees team activity here. You can jump straight into Sensei to start working.</p>
          <a href={senseiUrl()} className="inline-flex items-center gap-2 bg-violet-600 text-white font-bold px-5 py-2.5 rounded-xl border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
            Open Sensei <FiExternalLink size={16} />
          </a>
          <button onClick={signOut} className="block mx-auto mt-4 text-sm text-neutral-400 hover:text-neutral-700">Sign out</button>
        </div>
      </div>
    );
  }

  const c = data?.credits;
  const members = data?.members || [];
  const log = data?.enrichment_log || [];
  const seatCap = data?.org?.max_members ?? null;
  const seatsFull = seatCap !== null && members.length >= seatCap;
  const NAV = [
    { id: "overview", label: "Overview", icon: FiHome },
    { id: "team", label: "Team", icon: FiUsers },
    { id: "credits", label: "Credit usage", icon: FiPhone },
    { id: "chats", label: "Chats", icon: FiMessageSquare },
    { id: "activity", label: "Activity log", icon: FiActivity },
    { id: "agent", label: "AI agent", icon: FiCpu },
  ] as const;

  const StatCard = ({ icon, label, value, sub, warn }: { icon: any; label: string; value: any; sub?: string; warn?: boolean }) => (
    // "!border-amber-500" is !important inside Tailwind's cascade layer, which nothing outside the
    // layers can override, so the new look marks the card with its own class instead.
    <div className={`${card} p-5 ${warn ? (ui === "new" ? "sx-warn" : "!border-amber-500") : ""}`}>
      <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-bold uppercase mb-1">{icon} {label}</div>
      <div className={`text-3xl font-black ${warn ? "text-amber-600" : ""}`}>{value}</div>
      {sub && <div className="text-xs text-neutral-400 mt-1">{sub}</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf7f2] font-['Satoshi'] text-neutral-900 flex">
      {viewChat && <ChatViewer chatId={viewChat.id} title={viewChat.title} onClose={() => setViewChat(null)} />}
      {showChangePw && (
        <ChangePasswordModal
          onClose={() => setShowChangePw(false)}
          onChanged={() => { setShowChangePw(false); alert("Password changed. Please sign in again."); signOut(); }}
        />
      )}

      {/* ── Left nav ── */}
      <aside className="w-60 shrink-0 border-r-2 border-neutral-900 bg-white flex flex-col fixed inset-y-0 left-0 z-20">
        <div className="h-16 px-4 flex items-center gap-2.5 border-b-2 border-neutral-900">
          <div className="w-9 h-9 border-2 border-neutral-900 rounded-xl overflow-hidden shrink-0">
            <SenseiMark />
          </div>
          <div className="min-w-0">
            <div className="font-['Clash_Display'] text-base font-semibold leading-none">Team dashboard</div>
            <div className="text-xs text-neutral-400 truncate">{me?.org?.name || "your workspace"}</div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                tab === n.id ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
              <n.icon size={16} /> {n.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t-2 border-neutral-900 space-y-2">
          <a href={senseiUrl()} className="w-full flex items-center justify-center gap-1.5 bg-violet-600 text-white font-bold text-sm px-3 py-2.5 rounded-xl border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
            Open Sensei <FiExternalLink size={14} />
          </a>
          <div className="text-[11px] text-neutral-400 px-1 truncate" title={me?.email || ""}>{me?.email}</div>
          <div className="flex items-center justify-between gap-2 text-[11px] text-neutral-400 px-1">
            <button onClick={() => setShowChangePw(true)} className="font-semibold hover:text-violet-700">Change password</button>
            <button onClick={signOut} className="shrink-0 font-semibold hover:text-neutral-900">Sign out</button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 ml-60 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {err && <div className="mb-4 bg-red-50 border-2 border-red-500 text-red-700 rounded-xl px-4 py-2 text-sm">{err}</div>}
          <h1 className="font-['Clash_Display'] text-2xl font-bold mb-6 capitalize">{NAV.find((n) => n.id === tab)?.label}</h1>

          {/* OVERVIEW */}
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={<FiPhone size={12} />} label="Reveals left" warn={c?.low} value={c ? c.enrichment_balance.toLocaleString() : "-"} sub={c ? `${c.enrichment_used.toLocaleString()} used all-time` : ""} />
                <StatCard icon={<FiZap size={12} />} label="AI credits" value={c ? (c.ai_balance >= 100_000_000 ? "∞" : c.ai_balance.toLocaleString()) : "-"} sub="shared across the team" />
                <StatCard icon={<FiUsers size={12} />} label="Team"
                  value={data?.org?.max_members ? `${members.length} / ${data.org.max_members}` : members.length}
                  sub={data?.org?.max_members ? "seats used" : "members"} />
                <StatCard icon={<FiMessageSquare size={12} />} label="Chats"
                  // the chat list the server sends is the 50 most recent, so its length was never the total
                  value={data ? Math.max(data.chats.length, members.reduce((n, m) => n + (m.chats || 0), 0)).toLocaleString() : "-"}
                  sub="in this workspace" />
              </div>
              {c?.low && (
                <div className="mb-6 flex items-center gap-2 bg-amber-50 border-2 border-amber-500 rounded-xl px-4 py-3 text-sm text-amber-800">
                  <FiAlertTriangle size={16} className="shrink-0" />
                  Your team is running low on reveal credits ({c.enrichment_balance} left). Reach out to Studojo to top up.
                </div>
              )}
              <p className="text-xs text-neutral-400 mb-6">Credits are one shared pool. Every member sees the same balance; a reveal by anyone lowers it for everyone.</p>
              {/* Most active */}
              <h2 className="font-['Clash_Display'] text-lg font-bold mb-3">Who's doing the most</h2>
              <div className={`${card} overflow-hidden`}>
                {[...members].sort((a, b) => (b.phones_revealed - a.phones_revealed) || (b.chats - a.chats)).map((m) => (
                  <div key={m.email} className="flex items-center justify-between gap-3 px-5 py-3 border-b border-neutral-100 text-sm">
                    <span className="font-semibold truncate">{m.email}</span>
                    <div className="shrink-0 flex items-center gap-4 text-xs text-neutral-500">
                      <span><b className="text-neutral-900">{m.phones_revealed}</b> reveals</span>
                      <span><b className="text-neutral-900">{m.chats}</b> chats</span>
                      <span className="w-16 text-right">{fmtDate(m.last_activity)}</span>
                    </div>
                  </div>
                ))}
                {members.length === 0 && <div className="px-5 py-8 text-center text-neutral-400 text-sm">No members yet.</div>}
              </div>
            </>
          )}

          {/* TEAM */}
          {tab === "team" && (
            <>
              <div className={`${card} p-5 mb-4`}>
                <div className="flex items-center gap-2">
                  <FiUserPlus size={16} className="text-neutral-400 shrink-0" />
                  <input type="email" value={invite} onChange={(e) => setInvite(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doInvite()} placeholder="teammate@company.com"
                    className="flex-1 border-2 border-neutral-900 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  <select aria-label="Role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)}
                    className="border-2 border-neutral-900 rounded-xl px-2 py-2 text-sm">
                    <option value="member">Member</option><option value="admin">Manager</option>
                  </select>
                  <button onClick={doInvite} disabled={inviteBusy || seatsFull}
                    title={seatsFull ? "All seats are in use" : ""}
                    className="bg-violet-600 text-white font-bold px-4 py-2 rounded-xl border-2 border-neutral-900 text-sm disabled:opacity-60">
                    {inviteBusy ? "..." : "Invite"}
                  </button>
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  Adding someone creates their account and emails them a password to sign in with.
                  {seatCap !== null && ` You've used ${members.length} of your ${seatCap} seats.`}
                </p>
                {seatsFull && (
                  <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 mt-2">
                    All {seatCap} seats are in use. Contact Studojo to add more.
                  </p>
                )}
                {inviteMsg && <p className="text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 mt-2">{inviteMsg}</p>}
              </div>
              <div className={`${card} overflow-x-auto`}>
                <div className="min-w-[680px]">
                  <div className="grid grid-cols-[2.2fr_0.9fr_0.8fr_0.9fr_1fr] gap-2 px-5 py-3 border-b-2 border-neutral-900 text-xs font-bold uppercase text-neutral-400">
                    <div>Member</div><div>Role</div><div>Chats</div><div>Reveals</div><div>Last active</div>
                  </div>
                  {members.map((m) => (
                    <div key={m.email} className="grid grid-cols-[2.2fr_0.9fr_0.8fr_0.9fr_1fr] gap-2 px-5 py-3 border-b border-neutral-100 text-sm items-center">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{m.email}</div>
                        <div className="text-[11px] text-neutral-400">{m.last_login_at ? "Active" : "Invited, not signed in yet"}</div>
                      </div>
                      <div><span className={`text-[11px] font-bold rounded-full px-2 py-0.5 border-2 ${m.role === "admin" ? "border-violet-500 text-violet-600 bg-violet-50" : "border-neutral-300 text-neutral-500"}`}>{m.role === "admin" ? "manager" : "member"}</span></div>
                      <div>{m.chats}</div><div>{m.phones_revealed}</div>
                      <div className="text-neutral-500">{fmtDate(m.last_activity)}</div>
                    </div>
                  ))}
                  {members.length === 0 && <div className="px-5 py-8 text-center text-neutral-400 text-sm">No members yet.</div>}
                </div>
              </div>
            </>
          )}

          {/* CREDIT USAGE: per-member spend + full enrichment log */}
          {tab === "credits" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <StatCard icon={<FiPhone size={12} />} label="Reveals left" warn={c?.low} value={c ? c.enrichment_balance.toLocaleString() : "-"} />
                <StatCard icon={<FiActivity size={12} />} label="Reveals used" value={c ? c.enrichment_used.toLocaleString() : "-"} sub="all-time" />
                <StatCard icon={<FiZap size={12} />} label="AI credits" value={c ? (c.ai_balance >= 100_000_000 ? "∞" : c.ai_balance.toLocaleString()) : "-"} />
              </div>

              <h2 className="font-['Clash_Display'] text-lg font-bold mb-3">Reveals by member</h2>
              <div className={`${card} overflow-hidden mb-8`}>
                {[...members].sort((a, b) => b.phones_revealed - a.phones_revealed).map((m) => (
                  <div key={m.email} className="flex items-center gap-3 px-5 py-2.5 border-b border-neutral-100 text-sm">
                    <span className="font-semibold truncate flex-1">{m.email}</span>
                    <div className="w-40 h-2 rounded-full bg-neutral-100 overflow-hidden shrink-0">
                      <div className="h-full bg-violet-500" style={{ width: `${Math.min(100, (m.phones_revealed / Math.max(1, Math.max(...members.map((x) => x.phones_revealed)))) * 100)}%` }} />
                    </div>
                    <span className="w-16 text-right font-bold shrink-0">{m.phones_revealed}</span>
                  </div>
                ))}
                {members.length === 0 && <div className="px-5 py-8 text-center text-neutral-400 text-sm">No members yet.</div>}
              </div>

              <h2 className="font-['Clash_Display'] text-lg font-bold mb-1">Enrichment log</h2>
              <p className="text-xs text-neutral-400 mb-3">Every paid contact reveal: who did it, the company, and the contact that was unlocked.</p>
              <div className={`${card} overflow-x-auto`}>
                <div className="min-w-[900px]">
                  <div className="grid grid-cols-[1fr_1.3fr_1.2fr_1.5fr_1.1fr_1.6fr] gap-2 px-5 py-3 border-b-2 border-neutral-900 text-xs font-bold uppercase text-neutral-400">
                    <div>When</div><div>Who</div><div>Company</div><div>Contact</div><div>Phone</div><div>Email</div>
                  </div>
                  {log.map((r, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1.3fr_1.2fr_1.5fr_1.1fr_1.6fr] gap-2 px-5 py-3 border-b border-neutral-100 text-sm items-center">
                      <div className="text-neutral-400 text-xs">{fmtTime(r.created_at)}</div>
                      <div className="truncate text-neutral-600" title={str(r.email)}>{str(r.email) || "-"}</div>
                      <div className="font-semibold truncate" title={str(r.company)}>{str(r.company) || "-"}</div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{str(r.contact_name) || "-"}</div>
                        {r.contact_title && <div className="text-[11px] text-neutral-400 truncate">{str(r.contact_title)}</div>}
                      </div>
                      <div className="truncate text-neutral-700">{str(r.contact_phone) ? <a href={`tel:${str(r.contact_phone)}`} className="hover:text-violet-700 flex items-center gap-1"><FiPhone size={11} />{ui === "new" ? formatPhone(str(r.contact_phone)) : str(r.contact_phone)}</a> : <span className="text-neutral-300">-</span>}</div>
                      <div className="truncate text-neutral-700">{str(r.contact_email) ? <a href={`mailto:${str(r.contact_email)}`} className="hover:text-violet-700 flex items-center gap-1 truncate"><FiMail size={11} className="shrink-0" /><span className="truncate">{str(r.contact_email)}</span></a> : <span className="text-neutral-300">-</span>}</div>
                    </div>
                  ))}
                  {log.length === 0 && <div className="px-5 py-10 text-center text-neutral-400 text-sm">No reveals yet. When your team enriches a contact, every one shows up here with who did it.</div>}
                </div>
              </div>
            </>
          )}

          {/* CHATS */}
          {tab === "chats" && (
            <>
              <p className="text-xs text-neutral-400 mb-3">Open a chat to review it, or assign it to someone so it shows up in their Sensei sidebar.</p>
              <div className={`${card} overflow-x-auto`}>
                <div className="min-w-[640px]">
                  {(data?.chats || []).map((ch) => (
                    <div key={ch.id} className="grid grid-cols-[1.8fr_1fr_1.3fr_0.7fr] gap-3 items-center px-5 py-3 border-b border-neutral-100 text-sm">
                      <button onClick={() => setViewChat({ id: ch.id, title: ch.title })} className="min-w-0 flex items-center gap-2 text-left group" title="Open this chat">
                        <span className="font-semibold truncate group-hover:text-violet-700 group-hover:underline" title={ui === "new" ? ch.title : undefined}>{ui === "new" ? chatLabel(ch.title) : ch.title}</span>
                        {ch.shared_org && <span className="shrink-0 text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5">shared</span>}
                      </button>
                      <div className="text-neutral-400 text-xs truncate" title={ch.owner_email || ""}>{ch.owner_email || "-"}</div>
                      <div>
                        <select aria-label="Assign to" value={ch.assigned_to || ""} onChange={(e) => assignChat(ch.id, e.target.value)}
                          className={`w-full border-2 rounded-lg px-2 py-1.5 text-xs ${ch.assigned_to ? "border-violet-500 text-violet-700 bg-violet-50" : "border-neutral-300 text-neutral-500"}`}>
                          <option value="">Unassigned</option>
                          {members.map((m) => (<option key={m.email} value={m.email}>{m.email}</option>))}
                        </select>
                      </div>
                      <div className="text-neutral-400 text-xs text-right">{fmtDate(ch.updated_at)}</div>
                    </div>
                  ))}
                  {(data?.chats.length ?? 0) === 0 && <div className="px-5 py-8 text-center text-neutral-400 text-sm">No chats yet.</div>}
                </div>
              </div>
            </>
          )}

          {/* ACTIVITY */}
          {tab === "activity" && (
            <div className={`${card} overflow-hidden`}>
              {(data?.activity || []).map((a, i) => (
                <div key={i} className="flex items-center justify-between gap-3 px-5 py-2.5 border-b border-neutral-100 text-sm">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className={`shrink-0 text-[10px] font-bold rounded px-1.5 py-0.5 ${a.kind === "enrichment" ? "bg-violet-100 text-violet-700" : "bg-neutral-100 text-neutral-500"}`}>{a.kind === "enrichment" ? "reveal" : "AI"}</span>
                    <span className="truncate text-neutral-600">{a.email || "team"}</span>
                  </div>
                  <div className="shrink-0 flex items-center gap-3 text-xs">
                    <span className="font-bold text-neutral-700">{a.delta}</span>
                    <span className="text-neutral-400">{fmtTime(a.created_at)}</span>
                  </div>
                </div>
              ))}
              {(data?.activity.length ?? 0) === 0 && <div className="px-5 py-8 text-center text-neutral-400 text-sm">No credit activity yet.</div>}
            </div>
          )}

          {/* AI AGENT (MCP) */}
          {tab === "agent" && <AgentPanel card={card} orgName={data?.org?.name || "your workspace"} />}
        </div>
      </main>
    </div>
  );
}

// ── AI agent (MCP) ───────────────────────────────────────────────────────────
// Lets the workspace ADMIN mint a key that connects Claude/Cursor/any MCP client
// straight to THIS workspace. The key is issued by /api/sensei/mcp-key, which
// verifies the caller's Sensei session and maps the key to this org, so the agent
// shares the team's searches, contacts and credit pool.
function AgentPanel({ card, orgName }: { card: string; orgName: string }) {
  const [keys, setKeys] = useState<any[] | null>(null);
  const [fresh, setFresh] = useState<string>("");      // plaintext, shown once
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");

  const mcpUrl = () => {
    const host = typeof window === "undefined" ? "studojo.com" : window.location.host.replace(/^dashboard\./, "");
    return `https://${host}/api/mcp`;
  };

  const call = async (method: "GET" | "POST", body?: any) => {
    const res = await fetch("/api/sensei/mcp-key", {
      method,
      headers: { "Content-Type": "application/json", ...authHeaders() },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d?.message || d?.error || `Request failed (${res.status})`);
    return d;
  };

  const load = useCallback(() => {
    call("GET").then((d) => { setKeys(d.keys || []); setErr(""); })
      .catch((e) => { setKeys([]); setErr(e.message); });
  }, []);
  useEffect(load, [load]);

  const generate = async () => {
    setBusy(true); setErr("");
    try {
      const d = await call("POST", { action: "create" });
      setFresh(d.key?.plaintext || "");
      setKeys(d.keys || []);
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this key? Any agent using it stops working immediately.")) return;
    setBusy(true); setErr("");
    try { const d = await call("POST", { action: "revoke", id }); setKeys(d.keys || []); setFresh(""); }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  const copy = (text: string, what: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(what); setTimeout(() => setCopied(""), 1400);
  };

  const config = `{
  "mcpServers": {
    "sensei": {
      "url": "${mcpUrl()}",
      "headers": { "Authorization": "Bearer ${fresh || "YOUR_KEY_HERE"}" }
    }
  }
}`;

  const CopyBtn = ({ text, what }: { text: string; what: string }) => (
    <button onClick={() => copy(text, what)}
      className="shrink-0 flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border-2 border-neutral-900 bg-white hover:bg-neutral-50">
      <FiCopy size={12} /> {copied === what ? "Copied" : "Copy"}
    </button>
  );

  return (
    <>
      <p className="text-sm text-neutral-600 mb-5 max-w-2xl">
        Connect Claude, Cursor or your own agent directly to {orgName}. It can run searches, read the
        results and reveal contacts, using the same shared credits as the team.
      </p>

      {err && (
        <div className="mb-5 bg-amber-50 border-2 border-amber-500 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
          <FiAlertTriangle size={16} className="shrink-0 mt-0.5" /> <span>{err}</span>
        </div>
      )}

      {fresh && (
        <div className="mb-5 bg-violet-50 border-2 border-violet-500 rounded-2xl p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-violet-700 mb-2">Your new key: copy it now</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 truncate bg-white border-2 border-neutral-900 rounded-lg px-3 py-2 text-[13px]">{fresh}</code>
            <CopyBtn text={fresh} what="key" />
          </div>
          <p className="text-xs text-violet-700 mt-2">This is the only time it is shown. If you lose it, revoke it and make a new one.</p>
        </div>
      )}

      <div className={`${card} p-5 mb-6`}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="font-['Clash_Display'] text-lg font-bold">Your keys</h2>
          <button onClick={generate} disabled={busy}
            className="bg-violet-500 text-white text-sm font-bold px-4 py-2 rounded-xl border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] disabled:opacity-60">
            {busy ? "Working…" : "Generate key"}
          </button>
        </div>
        {keys === null && <p className="text-neutral-400 text-sm">Loading…</p>}
        {keys?.length === 0 && <p className="text-neutral-400 text-sm">No agent keys yet. Generate one to get started.</p>}
        {keys?.map((k) => (
          <div key={k.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-neutral-100 last:border-0 text-sm">
            <div className="min-w-0">
              <div className="font-mono text-[13px] truncate">sk_live_…{k.last_four}</div>
              <div className="text-xs text-neutral-400">
                {k.request_count} calls{k.last_used_at ? ` · last used ${fmtDate(k.last_used_at)}` : " · never used"}
              </div>
            </div>
            <button onClick={() => revoke(k.id)} title="Revoke"
              className="shrink-0 flex items-center gap-1 text-xs font-bold text-red-600 px-2.5 py-1.5 rounded-lg border-2 border-red-300 hover:bg-red-50">
              <FiTrash2 size={12} /> Revoke
            </button>
          </div>
        ))}
      </div>

      <h2 className="font-['Clash_Display'] text-lg font-bold mb-3">Connect your client</h2>
      <div className={`${card} p-5`}>
        <p className="text-sm text-neutral-600 mb-3">Paste this into your MCP client config, with the key from above.</p>
        <div className="flex items-start gap-2">
          <pre className="flex-1 min-w-0 overflow-x-auto bg-[#15141b] text-neutral-100 rounded-xl border-2 border-neutral-900 p-4 text-[12.5px] leading-relaxed">{config}</pre>
          <CopyBtn text={config} what="config" />
        </div>
        <p className="text-xs text-neutral-400 mt-3">
          Full tool reference at <a className="font-semibold text-violet-700 hover:underline" href={`https://${typeof window === "undefined" ? "studojo.com" : window.location.host.replace(/^dashboard\./, "")}/mcpdocs`} target="_blank" rel="noreferrer">/mcpdocs</a>.
        </p>
      </div>
    </>
  );
}

// Read-only chat viewer for managers: the full conversation + the results the
// team built (companies, contacts). Managers can review any chat in their org.
function ChatViewer({ chatId, title, onClose }: { chatId: number; title: string; onClose: () => void }) {
  const [data, setData] = useState<ChatDetail | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api<ChatDetail>(`/chats/${chatId}`).then(setData).catch((e) => setErr(e.message || "Could not load chat"));
  }, [chatId]);

  const str = (v: any) => (v == null ? "" : String(v));

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[88vh] flex flex-col bg-white border-2 border-neutral-900 rounded-[24px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-b-2 border-neutral-900">
          <div className="min-w-0">
            <div className="font-['Clash_Display'] text-lg font-semibold truncate">{title}</div>
            <div className="text-xs text-neutral-400">Read-only · manager view</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href={senseiUrl()} className="flex items-center gap-1 text-xs font-bold text-violet-700 hover:underline">
              Open in Sensei <FiExternalLink size={13} />
            </a>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 text-xl leading-none px-1">×</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {err && <p className="text-red-600 text-sm">{err}</p>}
          {!data && !err && <p className="text-neutral-400 text-sm">Loading…</p>}

          {/* Conversation */}
          {data?.messages?.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl border-2 border-neutral-900 text-sm whitespace-pre-wrap break-words ${
                m.role === "user" ? "bg-violet-500 text-white rounded-br-md" : "bg-white rounded-tl-md"}`}>
                {m.content}
              </div>
            </div>
          ))}

          {/* Results the team built */}
          {data?.tables?.filter((t) => t.rows?.length).map((t) => (
            <div key={t.id} className="border-2 border-neutral-900 rounded-2xl overflow-hidden">
              <div className="px-4 py-2 bg-[#faf7f2] border-b-2 border-neutral-900 text-sm font-bold flex items-center justify-between">
                <span className="truncate">{t.name}</span>
                <span className="text-neutral-400 text-xs shrink-0">{t.rows.length} rows</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {t.rows.slice(0, 50).map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-2 border-b border-neutral-100 text-sm">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{str(r.cells.company) || "-"}</div>
                      <div className="text-xs text-neutral-400 truncate">{str(r.cells.role_title) || str(r.cells.contact_name)}</div>
                    </div>
                    <div className="text-xs text-neutral-500 truncate max-w-[45%] text-right">
                      {str(r.cells.contact_email) || str(r.cells.contact_phone) || str(r.cells.location_city)}
                    </div>
                  </div>
                ))}
                {t.rows.length > 50 && <div className="px-4 py-2 text-xs text-neutral-400">+ {t.rows.length - 50} more. Open in Sensei to see all.</div>}
              </div>
            </div>
          ))}

          {data && data.messages?.length === 0 && (data.tables?.length ?? 0) === 0 && (
            <p className="text-neutral-400 text-sm text-center py-6">This chat is empty.</p>
          )}
        </div>
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
            <button onClick={onDone} className="w-full bg-violet-500 text-white font-bold py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">Sign in</button>
          </>
        ) : (
          <>
            <h1 className="font-['Clash_Display'] text-2xl font-semibold">Set a new password</h1>
            <p className="text-neutral-600 mt-2 mb-6">Choose a password with at least 8 characters.</p>
            <input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" className={inputCls} />
            <input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Confirm new password" className={`${inputCls} mt-3`} />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <button onClick={submit} disabled={busy} className="mt-4 w-full bg-violet-500 text-white font-bold py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] disabled:opacity-60">
              {busy ? "Saving..." : "Save password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Change password for a signed-in manager; invalidates all sessions on success.
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
      await api("/auth/change-password", { method: "POST", body: JSON.stringify({ current_password: cur, new_password: pw }) });
      onChanged();
    } catch (e: any) { setError(e?.message || "Could not change your password"); }
    finally { setBusy(false); }
  };

  const inputCls = "w-full border-2 border-neutral-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500";
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6" onClick={onClose}>
      <div className="w-full max-w-md bg-white border-2 border-neutral-900 rounded-[28px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-['Clash_Display'] text-xl font-semibold mb-1">Change password</h2>
        <p className="text-sm text-neutral-500 mb-4">You'll be signed out everywhere and can sign back in with the new password.</p>
        <input type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} placeholder="Current password" className={inputCls} />
        <input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password (min 8 characters)" className={`${inputCls} mt-2`} />
        <input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Confirm new password" className={`${inputCls} mt-2`} />
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border-2 border-neutral-300 text-sm font-semibold text-neutral-500 hover:border-neutral-900 hover:text-neutral-900">Cancel</button>
          <button onClick={submit} disabled={busy} className="bg-violet-700 text-white font-bold px-5 py-2 rounded-xl border-2 border-neutral-900 text-sm hover:bg-violet-800 disabled:opacity-60">
            {busy ? "Saving..." : "Change password"}
          </button>
        </div>
      </div>
    </div>
  );
}
