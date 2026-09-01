import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  FiPlus, FiTrash2, FiSend, FiDownload, FiLock, FiZap, FiSearch,
  FiFileText, FiGrid, FiLoader, FiExternalLink,
  FiSidebar, FiMaximize2, FiMinimize2, FiX, FiLinkedin, FiCopy, FiCheck,
  FiMessageSquare, FiColumns, FiUsers,
  FiLayers, FiGlobe, FiPaperclip, FiFile, FiPhone, FiMail, FiUserPlus, FiSlash,
  FiMoon, FiSun, FiChevronDown,
} from "react-icons/fi";

// ─────────────────────────────────────────────────────────────────────────────
// Bob — placement intelligence workspace.
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
  return s ? `${base}/?s=${encodeURIComponent(s)}` : base;
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

interface ChatSummary { id: number; title: string; updated_at: string }
interface Message { id: number; role: string; content: string; created_at: string; meta?: { suggestions?: string[] } }
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
  "company", "contact_name", "contact_title", "tier", "fit_score", "city",
  "hiring_evidence", "why_now", "what_they_do", "size_band", "funding",
  "website", "evidence_url", "linkedin_url", "contact_linkedin_url",
];
const WIDE_KEYS = new Set(["hiring_evidence", "why_now", "what_they_do", "funding", "outreach_angle", "suggested_opening", "connection_point", "signal_rationale"]);

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

// ── Root ─────────────────────────────────────────────────────────────────────

export default function BobPage() {
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Password-reset link (?reset=token) — show the set-new-password screen.
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

  if (!mounted) return <div className="min-h-screen bg-[#faf7f2]" />;
  if (resetToken) return <ResetPasswordScreen token={resetToken} onDone={() => setResetToken(null)} />;
  if (!authed) return <Gate onSuccess={() => setAuthed(true)} />;
  return <Workspace onAuthLost={() => setAuthed(false)} />;
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
          <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />
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
          <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />
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

// ── Workspace ────────────────────────────────────────────────────────────────

type PanelMode = "split" | "chat" | "table";
type ResultsView = "cards" | "table";

function Workspace({ onAuthLost }: { onAuthLost: () => void }) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tables, setTables] = useState<BobTable[]>([]);
  const [run, setRun] = useState<Run | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<{ id: number; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [credits, setCredits] = useState<{ enrichment: number; ai: number; enabled: boolean; tiers?: any[] } | null>(null);
  const [notice, setNotice] = useState<string>("");
  const [me, setMe] = useState<{ email: string | null; role: string; org: { id: number; name: string } | null; capabilities?: { candidate_sourcing?: boolean } } | null>(null);
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
  const [tablePct, setTablePct] = useState(48);
  const [viewPref, setViewPref] = useState<ResultsView | null>(null);
  const dragging = useRef(false);
  const layoutRef = useRef<HTMLDivElement>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LAYOUT_STORAGE) || "{}");
      if (typeof saved.sidebarOpen === "boolean") setSidebarOpen(saved.sidebarOpen);
      if (typeof saved.tablePct === "number") setTablePct(saved.tablePct);
      if (saved.viewPref === "cards" || saved.viewPref === "table") setViewPref(saved.viewPref);
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(LAYOUT_STORAGE, JSON.stringify({ sidebarOpen, tablePct, viewPref }));
  }, [sidebarOpen, tablePct, viewPref]);

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
      const d = await bobFetch<{ chats: ChatSummary[] }>("/chats");
      setChats(d.chats);
      return d.chats;
    } catch (e) {
      handleError(e);
      return [];
    }
  }, [handleError]);

  // Credit balances for the header counter. Best-effort: a failure just hides
  // the counter rather than disrupting the workspace.
  const loadCredits = useCallback(async () => {
    try {
      setCredits(await bobFetch<{ enrichment: number; ai: number; enabled: boolean }>("/credits"));
    } catch { /* counter is non-critical */ }
  }, []);
  useEffect(() => { loadCredits(); }, [loadCredits]);

  const loadMe = useCallback(async () => {
    try {
      setMe(await bobFetch<{ email: string | null; role: string; org: { id: number; name: string } | null; capabilities?: { candidate_sourcing?: boolean } }>("/me"));
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
    try {
      // Make it visible to the whole workspace so a teammate who opens the link also
      // finds it in their own sidebar (it is their workspace too), then copy a deep
      // link to this chat. Opening it (after login if needed) lands them on this chat.
      await bobFetch(`/chats/${chatId}/share`, { method: "POST", body: JSON.stringify({ shared: true }) });
      const link = `${window.location.origin}/?chat=${chatId}`;
      let copied = false;
      try { await navigator.clipboard.writeText(link); copied = true; } catch { /* clipboard blocked (non-secure ctx / denied) */ }
      setNotice(copied
        ? "Share link copied — send it to a teammate and it opens this chat in their workspace."
        : `Share link: ${link}`);
    } catch (e) { handleError(e); }
  }, [handleError]);

  // Track whether the current chat is a throwaway (no messages, no tables) so we
  // can drop it the moment the user navigates away. An empty "New chat" is never
  // worth persisting — this keeps the sidebar clean of blank entries.
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
    if (id === emptyRef.current.id) return;   // already open
    await dropCurrentIfEmpty();
    setActiveChat(id);
    // Keep the URL pointing at the open chat so it is always shareable + refresh-safe
    // (this is the link the Share button copies: app.studojo.com/?chat=<id>).
    try { window.history.replaceState({}, "", `/?chat=${id}`); } catch { /* ignore */ }
    setRun(null);
    setPendingFiles([]);
    try {
      const d = await bobFetch<any>(`/chats/${id}`);
      setMessages(d.messages);
      setTables(d.tables || []);
      if (d.latest_run && d.latest_run.status === "running") setRun(d.latest_run);
    } catch (e) {
      handleError(e);
    }
  }, [handleError, dropCurrentIfEmpty]);

  useEffect(() => {
    // Deep link: app.studojo.com/?chat=<id> opens that specific chat (a shared link).
    // The recipient is a member of the same workspace, so get_chat authorizes it; the
    // login gate is in-page, so this param survives an unauthenticated -> login -> here.
    let wanted: number | null = null;
    try {
      const v = new URLSearchParams(window.location.search).get("chat");
      wanted = v && /^\d+$/.test(v) ? parseInt(v, 10) : null;
    } catch { /* ignore */ }
    loadChats().then((list) => {
      if (wanted != null) openChat(wanted);
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
          loadCredits();          // a finished run charges AI credits — refresh
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

  const newChat = async () => {
    // Don't create a server chat yet — an empty one is throwaway. Reset to the
    // empty state; the first message (or file) creates the chat lazily.
    await dropCurrentIfEmpty();
    setMessages([]);
    setTables([]);
    setRun(null);
    setPendingFiles([]);
    setActiveChat(null);
    try { window.history.replaceState({}, "", "/"); } catch { /* ignore */ }
    setMode("split");
  };

  const deleteChat = async (id: number) => {
    if (!confirm("Delete this chat and its tables?")) return;
    try {
      await bobFetch(`/chats/${id}`, { method: "DELETE" });
      const list = await loadChats();
      if (activeChat === id) {
        if (list.length > 0) openChat(list[0].id);
        else {
          setActiveChat(null); setMessages([]); setTables([]); setRun(null);
          try { window.history.replaceState({}, "", "/"); } catch { /* ignore */ }
        }
      }
    } catch (e) {
      handleError(e);
    }
  };

  const stopRun = async () => {
    if (!run || stopping) return;
    setStopping(true);
    try { await bobFetch(`/runs/${run.id}/stop`, { method: "POST" }); } catch { /* best-effort */ }
  };

  const uploadFile = async (f: globalThis.File) => {
    setUploading(true);
    try {
      let chatId = activeChat;
      if (!chatId) {
        const d = await bobFetch<{ id: number }>("/chats", { method: "POST" });
        chatId = d.id;
        setActiveChat(chatId);
        loadChats();
      }
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
      alert(e?.message || "Could not read that file");
      if (e instanceof BobError) handleError(e);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        const d = await bobFetch<{ id: number }>("/chats", { method: "POST" });
        chatId = d.id;
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
        setNotice(e.message || "Out of AI credits. Buy enrichments to refill — each one includes a full search.");
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

  const enrichRow = async (rowId: number) => {
    markEnriching(new Set([rowId]));
    try {
      await bobFetch(`/rows/${rowId}/enrich`, { method: "POST" });
    } catch (e) { onEnrichError(e); }
  };

  const enrichTable = async (tableId: number) => {
    const t = tables.find((x) => x.id === tableId);
    if (!t) return;
    const todo = new Set(
      t.rows
        .filter((r) => !["found", "enriching"].includes(str(r.cells._contact_status)))
        .map((r) => r.id),
    );
    if (todo.size === 0) return;
    markEnriching(todo);
    try {
      await bobFetch(`/tables/${tableId}/enrich`, { method: "POST" });
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
  const hasTables = tables.length > 0;
  // The table Work mode shows: the most recent one that has rows.
  const activeWorkTable = [...tables].reverse().find((t) => t.rows.length > 0) || tables[tables.length - 1] || null;
  const exportTable = async (t: BobTable) => {
    const res = await fetch(`${API}/tables/${t.id}/export`, { headers: authHeaders() });
    if (!res.ok) { setNotice("Export failed"); return; }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${t.name.replace(/[^a-z0-9 _-]/gi, "")}.xlsx`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  };
  const showChat = mode !== "table";
  // Mount the results panel as soon as a run STARTS (not only once a table object
  // exists), so the live-progress banner + provisional rows can show immediately.
  // A run is only SEARCHING once it has actually opened a table. Keying the
  // research UI off `running` alone made every run flash the split view, the
  // neural-net panel and "about 10 min left" for a few seconds — including runs
  // that were only going to come back with one clarifying question. create_table
  // is the first thing a real search does, so it is the honest signal.
  const searching = running && hasTables;
  const showTable = (hasTables || searching) && mode !== "chat";
  const lastMsg = messages[messages.length - 1];
  const suggestions: string[] =
    !running && lastMsg?.role === "assistant" ? lastMsg.meta?.suggestions || [] : [];
  // A brand-new chat with nothing said yet. The greeting and the composer centre
  // together as one block instead of sitting at opposite ends of the pane.
  const atRest = messages.length === 0 && !running;

  return (
    <div className={`h-screen bg-[#faf7f2] flex overflow-hidden font-['Satoshi'] text-neutral-900 ${dark ? "bob-dark" : ""}`}>
      {showTeam && <TeamModal orgName={me?.org?.name || "your workspace"} onClose={() => setShowTeam(false)} />}
      {showEnrich && <EnrichModal onClose={() => { setShowEnrich(false); loadCredits(); }} />}
      {showSupport && <SupportModal email={me?.email || ""} orgName={me?.org?.name || ""} onClose={() => setShowSupport(false)} />}
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
        /* 700/800 are body/content text (table cells, chips) — keep them BRIGHT so
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
        }`}
      >
        <div className="w-64 flex flex-col h-full">
          <div className="h-12 shrink-0 px-3 border-b-2 border-neutral-900 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 border-2 border-neutral-900 rounded-lg overflow-hidden shrink-0">
                <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />
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
              onClick={newChat}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-neutral-900 text-white rounded-xl px-3 py-2.5 hover:bg-violet-700 transition-colors"
            >
              <FiPlus size={15} /> New chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {chats.map((c) => (
              <div
                key={c.id}
                onClick={() => openChat(c.id)}
                className={`group flex items-center justify-between gap-1 px-3 py-2.5 mb-1 rounded-xl cursor-pointer text-sm transition-colors ${
                  activeChat === c.id ? "bg-violet-100 border-2 border-neutral-900" : "hover:bg-neutral-100 border-2 border-transparent"
                }`}
              >
                <span className="truncate">{c.title}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); shareChat(c.id); }}
                    title="Share with your team"
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-violet-600"
                  >
                    <FiUsers size={13} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChat(c.id); }}
                    title="Delete"
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {chats.length === 0 && <p className="text-neutral-400 text-sm p-3">No chats yet.</p>}
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

      {/* ── Main ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        <header className="h-12 shrink-0 border-b-2 border-neutral-900 bg-white flex items-center gap-2 px-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Hide chats" : "Show chats"}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <FiSidebar />
          </button>
          <span className="text-sm font-bold truncate">
            {chats.find((c) => c.id === activeChat)?.title || "New conversation"}
          </span>
          {running && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-1">
              {/* "researching" is only true once a table exists. A run that is
                  about to come back with a question was claiming to research. */}
              <FiLoader className="animate-spin" size={11} /> {searching ? "researching" : "thinking"}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {credits?.enabled && <CreditsMenu credits={credits} />}
            {hasTables && (
              <div className="flex items-center rounded-lg bg-neutral-100 p-0.5">
                {([["chat", "Ask"], ["split", "Work"]] as const).map(([m, label]) => (
                  <button
                    key={m}
                    onClick={() => setMode(m as PanelMode)}
                    className={`h-7 px-3.5 rounded-md text-[13px] font-semibold transition-colors ${
                      (m === "chat" ? mode === "chat" : mode !== "chat")
                        ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {notice && (
          <div className="shrink-0 bg-red-50 border-b-2 border-red-500 text-red-700 text-xs font-bold px-4 py-2 flex items-center justify-between gap-3">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} className="text-red-400 hover:text-red-700 shrink-0" title="Dismiss">
              <FiX size={14} />
            </button>
          </div>
        )}

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
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md ${BRUT} bg-violet-500 text-white ${SHADOW} whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[14.5px] leading-relaxed`}>
                          {g.items.map((m) => m.content).join("\n\n")}
                        </div>
                      </div>
                    ) : (
                      /* One avatar per TURN, and the turn's lines stack as
                         paragraphs instead of separate boxes. */
                      <div key={g.items[0].id} className="flex gap-3">
                        <div className="w-7 h-7 mt-0.5 shrink-0 rounded-lg overflow-hidden border-2 border-neutral-900">
                          <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 max-w-[92%] space-y-2.5">
                          {g.items.map((m) => {
                            const rep = parseSearchReport(m.content);
                            return rep
                              ? <SearchReport key={m.id} report={rep} />
                              : <div key={m.id} className={`${CARD} rounded-tl-md px-4 py-3`}>
                                  <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[14.5px] leading-[1.7] text-neutral-800">{m.content}</p>
                                </div>;
                          })}
                        </div>
                      </div>
                    )
                  ))}
                  {/* Before a table exists we do not yet know whether this run
                      is a search or a one-line question, so show a quiet thinking
                      line rather than a progress bar promising "10 min left". */}
                  {running && !hasTables && (
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 mt-0.5 shrink-0 rounded-lg overflow-hidden border-2 border-neutral-900">
                        <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />
                      </div>
                      <div className={`${CARD} rounded-tl-md px-4 py-3 flex items-center gap-1.5`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse [animation-delay:300ms]" />
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
                    accept=".pdf,.docx,.xlsx,.xlsm,.csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadFile(f);
                    }}
                  />
                  <div className="border-2 border-neutral-900 rounded-2xl bg-white transition-all focus-within:shadow-[5px_5px_0px_0px_rgba(124,92,255,1)]">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                      }}
                      rows={2}
                      placeholder={running ? "Sensei is working on it. Ask your next question when it finishes." : "Describe a candidate, cohort, or the companies you need..."}
                      disabled={running}
                      className="w-full bg-transparent px-4 pt-3.5 pb-1 text-[14.5px] leading-relaxed resize-none focus:outline-none disabled:opacity-60 rounded-2xl"
                    />
                    <div className="flex items-center justify-between px-2.5 pb-2.5">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={running || uploading}
                        title="Attach a resume or cohort sheet (PDF, Word, Excel, CSV)"
                        className="w-9 h-9 rounded-xl border-2 border-neutral-900 bg-white text-neutral-600 flex items-center justify-center hover:bg-violet-50 hover:text-violet-700 transition-colors disabled:opacity-40"
                      >
                        {uploading ? <FiLoader className="animate-spin" size={15} /> : <FiPaperclip size={15} />}
                      </button>
                      {running ? (
                        <button
                          onClick={stopRun}
                          disabled={stopping}
                          title="Stop this run (keeps what's already found)"
                          className="bg-red-600 text-white w-9 h-9 rounded-xl flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-60 border-2 border-neutral-900"
                        >
                          {stopping ? <FiLoader className="animate-spin" size={14} /> : <span className="w-3 h-3 bg-white rounded-[3px]" />}
                        </button>
                      ) : (
                        <button
                          onClick={() => send()}
                          disabled={sending || !input.trim()}
                          className="bg-violet-700 text-white w-9 h-9 rounded-xl border-2 border-neutral-900 flex items-center justify-center hover:bg-violet-800 transition-colors disabled:opacity-30"
                        >
                          {sending ? <FiLoader className="animate-spin" size={15} /> : <FiSend size={15} />}
                        </button>
                      )}
                    </div>
                  </div>
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

          {/* Results — full-width Work view reuses the SAME rich table as the split view
              (DenseTable = every column: fit score, city, hiring evidence, why now, what
              they do, ...), with its detail drawer, cards toggle and reduce-to-split. The
              old bespoke WorkGrid only showed company/contact/phone/email, so the Work
              table read as blank vs prod. */}
          {showTable && mode === "table" && (
            <ResultsPanel
              widthPct={tablePct}
              fullWidth={true}
              tables={tables}
              run={running ? run : null}
              expanded={true}
              onExpand={() => setMode("split")}
              viewPref={viewPref}
              onViewPref={setViewPref}
              onRowStatus={updateRowStatus}
              onEnrichRow={enrichRow}
              onEnrichTable={enrichTable}
              onDeleteRow={deleteRow}
            />
          )}
          {showTable && mode !== "table" && (
            <ResultsPanel
              widthPct={tablePct}
              fullWidth={false}
              tables={tables}
              run={running ? run : null}
              expanded={false}
              onExpand={() => setMode("table")}
              viewPref={viewPref}
              onViewPref={setViewPref}
              onRowStatus={updateRowStatus}
              onEnrichRow={enrichRow}
              onEnrichTable={enrichTable}
              onDeleteRow={deleteRow}
            />
          )}
        </div>
      </div>
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
// these to shadow-sm / thin neutral-200 borders — that "calm design system" pass was reverted.
const BRUT = "border-2 border-neutral-900";
const SHADOW = "shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]";
const SHADOW_LG = "shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]";
const PRESS = "transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]";
const CARD = `bg-white ${BRUT} rounded-2xl ${SHADOW}`;

function parseSearchReport(text: string): { headline: string; sub: string; raw: string } | null {
  if (!/^\s*search REPORT/i.test(text) && !/harvested items:/i.test(text)) return null;
  const written = text.match(/written\s+(\d+)/i)?.[1];
  const target = text.match(/target\s+(\d+)\s*rows?/i)?.[1];
  const loc = text.match(/location\s+([^,)]+(?:,\s*[^,)]+)?)/i)?.[1]?.trim();
  const fresh = text.match(/freshness\s+(\d+)\s*d/i)?.[1];
  const n = written || target || "";
  const bits = [loc && `in ${loc}`, fresh && `posted in the last ${fresh} days`].filter(Boolean);
  const headline = n ? `Found ${n} compan${n === "1" ? "y" : "ies"}` : "Search complete";
  return { headline, sub: bits.join(" · "), raw: text.trim() };
}

function SearchReport({ report }: { report: { headline: string; sub: string; raw: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${CARD} overflow-hidden`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="w-8 h-8 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <FiCheck size={16} />
        </span>
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-neutral-900 leading-tight">{report.headline}</div>
          {report.sub && <div className="text-[12.5px] text-neutral-500 truncate">{report.sub}</div>}
        </div>
        <button onClick={() => setOpen((v) => !v)}
          className="ml-auto text-[12px] font-medium text-neutral-400 hover:text-neutral-700 shrink-0">
          {open ? "Hide details" : "Search details"}
        </button>
      </div>
      {open && (
        <pre className="border-t border-neutral-100 bg-neutral-50 px-4 py-3 text-[11.5px] leading-5 text-neutral-500 whitespace-pre-wrap font-mono overflow-x-auto">{report.raw}</pre>
      )}
    </div>
  );
}

function CreditsMenu({ credits }: { credits: any }) {
  const [open, setOpen] = useState(false);
  const tiers: any[] = credits?.tiers || [];
  // Headline is what he can still DO: reveals available. AI sits behind it,
  // because nobody plans their day around an AI-credit number.
  const reveals = tiers.length
    ? tiers.reduce((n: number, t: any) => n + (t.balance || 0), 0)
    : credits.enrichment;
  const low = reveals <= 0;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 h-8 rounded-lg px-2.5 text-[12.5px] font-semibold transition-colors ${
          low ? "bg-red-50 text-red-600 hover:bg-red-100" : "text-neutral-600 hover:bg-neutral-100"
        }`}
      >
        <FiPhone size={12} />
        <span className="tabular-nums">{reveals}</span>
        <span className="font-medium text-neutral-400">reveals</span>
        <FiChevronDown size={12} className="text-neutral-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 z-50 bg-white border border-neutral-200 rounded-2xl shadow-xl p-4 text-left">
            {tiers.length > 0 ? (
              <>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mb-2.5">
                  Enrichment credits
                </div>
                <div className="space-y-2">
                  {tiers.map((t) => (
                    <div key={t.key} className="flex items-baseline justify-between gap-3">
                      <span className="text-[13.5px] text-neutral-700">{t.label}</span>
                      <span className={`text-[13.5px] font-semibold tabular-nums ${
                        t.balance <= 0 ? "text-red-500" : "text-neutral-900"}`}>{t.balance}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11.5px] leading-5 text-neutral-500">
                  Each has its own balance. You are only charged when we find a personal mobile.
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold leading-none tabular-nums">{credits.enrichment}</div>
                <div className="text-[13px] text-neutral-500 mb-2">contact reveals left</div>
                <p className="text-[11.5px] leading-5 text-neutral-500">
                  You are only charged when we actually return a contact.
                </p>
              </>
            )}
            <div className="mt-3 pt-3 border-t border-neutral-100 flex items-baseline justify-between">
              <span className="text-[13px] text-neutral-500">AI credits</span>
              <span className="text-[13px] font-semibold tabular-nums text-neutral-700">
                {credits.ai >= 100000000 ? "unlimited" : credits.ai?.toLocaleString?.() ?? credits.ai}
              </span>
            </div>
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

// Context.dev Logo Link — a real company logo for a domain, drawn from a free
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
            className="flex-1 border-2 border-neutral-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
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
function EnrichModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"paste" | "file">("paste");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<{ rows: any[]; billing: string } | null>(null);

  const runPaste = async () => {
    setBusy(true); setErr(""); setResult(null);
    try {
      const d = await bobFetch<{ rows: any[]; billing: string }>("/sourcing/enrich", {
        method: "POST", body: JSON.stringify({ text }),
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
            <button onClick={runPaste} disabled={busy || !text.trim()}
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
              <div className="border border-neutral-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
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
              className="w-full border-2 border-neutral-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
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
        <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />
      </div>
      <h2 className="font-['Clash_Display'] text-[30px] sm:text-[34px] leading-[1.15] font-semibold tracking-tight">
        Who are we getting hired today?
      </h2>
    </div>
  );
}

// ── Run progress ─────────────────────────────────────────────────────────────

// The pipeline stages, in order, with a friendly name and a rough share of the
// total time (used to draw the progress bar). Sensei's raw logs say things like
// "harvest(ring 0): done" — users shouldn't have to read that.
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
// One-line hint per stage for the live banner (the bold label names the stage; this
// adds context that MATCHES the stage, instead of a hardcoded "scoring" line).
const RUN_STAGE_HINT: Record<string, string> = {
  plan: "understanding your brief",
  search: "reading job boards and posts",
  extract: "pulling out the real companies",
  score: "scoring and removing weak matches",
  enrich: "checking live hiring signals",
  contact: "finding the right person to reach",
  assemble: "finalizing your table",
};
const FRIENDLY_SOURCE: Record<string, string> = {
  getro: "startup job boards", careerjet: "Careerjet", ats: "company career pages",
  reddit: "Reddit", ctx_li_posts: "LinkedIn posts", ctx_x: "X (Twitter)",
  hirist: "Hirist", iimjobs: "IIMJobs", naukri: "Naukri", yc: "Y Combinator", remote_boards: "remote boards",
};

// Turn one raw event into a human sentence. Never leak internal ids / ring jargon.
function humanizeEvent(ev: RunEvent): string {
  const raw = ev.label || "";
  const low = raw.toLowerCase();
  for (const s of RUN_STAGES) {
    if (s.key !== "search" && low.startsWith(s.key)) return s.label;
  }
  if (/harvest/.test(low)) return "Searching boards & LinkedIn";
  // Search events look like "[getro] sre engineer @ Pune" or
  // "[ctx_li_posts] site:linkedin.com/posts \"sre engineer\" Pune hiring".
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
// One source of truth for elapsed + a SANE countdown, used by every in-run surface.
// The old ETA projected total = elapsed/prog with no ceiling, so a slow stage made
// "min left" CLIMB toward 40-90 min. This version: derives the clock from the run's
// REAL start (first backend event, so it survives a page reload), caps the projected
// total at 25 min, drives "remaining" off real stage progress (so it accelerates when
// a stage completes), and clamps it to only ever DECREASE.
const RUN_HARD_CAP_S = 25 * 60;
const RUN_FLOOR_TOTAL_S = 12 * 60;

function fmtClock(s: number): string {
  s = Math.max(0, Math.floor(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function useRunEstimate(run: Run) {
  const events = run.events || [];
  const stageIdx = currentStageIndex(events);

  // Re-render the elapsed clock once a second.
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Real run start: the first backend event's timestamp survives a reload/remount;
  // fall back to a mount ref for the brief window before any event has landed.
  const mountRef = useRef<number>(Date.now());
  const firstTs = events.length ? Date.parse(events[0].ts) : NaN;
  const startMs = Number.isFinite(firstTs) ? firstTs : mountRef.current;
  const elapsedS = Math.max(0, Math.floor((Date.now() - startMs) / 1000));

  const stageProgress = RUN_STAGES.slice(0, stageIdx).reduce((s, x) => s + x.weight, 0)
    + RUN_STAGES[stageIdx].weight * 0.5;

  const prog = Math.max(0.06, Math.min(0.98, stageProgress));
  const estTotalS = Math.max(RUN_FLOOR_TOTAL_S, Math.min(RUN_HARD_CAP_S, elapsedS / prog));
  const rawRemaining = Math.max(0, Math.min(estTotalS * (1 - prog), RUN_HARD_CAP_S - elapsedS));
  // Monotonic: remaining only ever counts down, never jumps up (per component instance).
  const remainRef = useRef<number>(Infinity);
  remainRef.current = Math.min(remainRef.current, rawRemaining);
  const remainingS = remainRef.current;

  const last = stageIdx >= RUN_STAGES.length - 1;
  const etaText = last || remainingS < 45 ? "wrapping up…" : `~${Math.max(1, Math.round(remainingS / 60))} min left`;

  // Bar: max of real stage progress and a smooth time creep (so it is never frozen),
  // capped at 96% until the run actually finishes.
  const timeProgress = Math.min(0.92, elapsedS / estTotalS);
  const pct = Math.min(96, Math.max(stageProgress, timeProgress) * 100);

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

function RunCounter({ n, label, keep }: { n: number; label: string; keep?: boolean }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-[#faf7f2] px-2.5 py-1.5">
      <TickingNumber value={n} className={`font-['Clash_Display'] font-bold text-lg leading-none tabular-nums ${keep ? "text-green-600" : "text-neutral-900"}`} />
      <div className="text-[9.5px] font-bold uppercase tracking-wide text-neutral-400 mt-1">{label}</div>
    </div>
  );
}

function FitChip({ fit }: { fit: number }) {
  const per100 = fit > 10;
  const high = per100 ? fit >= 80 : fit >= 8;
  const mid = per100 ? fit >= 60 : fit >= 6;
  const cls = high ? "bg-green-100 text-green-700" : mid ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-500";
  return <span className={`text-[10.5px] font-bold rounded-md px-1.5 py-0.5 shrink-0 tabular-nums ${cls}`}>{Math.round(fit)}</span>;
}

// The companies Sensei has already found this run (provisional opportunities, before
// assemble writes the final rows), streamed in best-first — the live proof-of-work.
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
          name: o.company_norm || str(o.cells.company) || "Company",
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
  const { stageIdx, elapsedS, etaText, pct, last } = useRunEstimate(run);
  const reduce = useReducedMotion();
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 mt-0.5 shrink-0 rounded-lg overflow-hidden border-2 border-neutral-900">
        <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />
      </div>
      <div className={`flex-1 ${CARD} rounded-tl-md px-3.5 py-2.5`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="relative flex h-2 w-2 shrink-0">
            {!reduce && <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="font-bold text-[13.5px]">{RUN_STAGES[stageIdx].label}…</span>
          <span className="ml-auto flex items-center gap-2 text-[11px] text-neutral-500">
            <span className="tabular-nums">{fmtClock(elapsedS)}</span>
            <span className={`rounded-full px-2 py-0.5 font-bold border ${last ? "bg-green-50 text-green-700 border-green-300" : "bg-violet-50 text-violet-700 border-violet-300"}`}>{etaText}</span>
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11px] text-neutral-400 mt-1.5">Live progress is in the panel on the right.</p>
      </div>
    </div>
  );
}

// Compact live-progress banner shown ABOVE the results table while a run works, so a
// slow run always reads as "actively narrowing the funnel", never as frozen. Reuses the
// stage helpers + the pipeline's own funnel counters (sourced/extracted/scored/removed/kept).
function RunBanner({ run, provisional }: { run: Run; provisional: number }) {
  const c = run.counters || {};
  const { stageIdx, pct } = useRunEstimate(run);
  const kept = Number(c.kept ?? c.rows_added ?? 0);
  const chips: { label: string; tone?: string }[] = [];
  if (c.sourced) chips.push({ label: `${c.sourced} posts read` });
  if (c.extracted) chips.push({ label: `${c.extracted} companies` });
  if (c.scored) chips.push({ label: `${c.scored} scored` });
  if (c.removed) chips.push({ label: `${c.removed} filtered out`, tone: "muted" });
  if (kept) chips.push({ label: `${kept} kept`, tone: "keep" });
  return (
    <div className="shrink-0 border-b-2 border-neutral-900 bg-violet-50">
      <div className="px-4 py-2 flex items-center gap-2 flex-wrap">
        <FiLoader className="animate-spin text-violet-500 shrink-0" size={13} />
        <span className="font-bold text-[12.5px]">{RUN_STAGES[stageIdx].label}…</span>
        <span className="hidden sm:inline text-[11px] text-neutral-500">
          {RUN_STAGE_HINT[RUN_STAGES[stageIdx].key] || ""}{provisional ? ` · ${provisional} still in review` : ""}
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px]">
          {chips.map((ch, i) => (
            <span key={i} className={`rounded-full px-2 py-0.5 font-semibold ${
              ch.tone === "keep" ? "bg-violet-600 text-white"
                : ch.tone === "muted" ? "bg-white text-neutral-400 border border-neutral-200"
                : "bg-white text-neutral-600 border border-neutral-300"}`}>{ch.label}</span>
          ))}
        </span>
      </div>
      <div className="h-1 w-full bg-violet-100 overflow-hidden">
        <div className="h-full bg-violet-500/70"
          style={{ width: `${pct}%`, transition: "width .7s ease-out" }} />
      </div>
    </div>
  );
}

// A small stage badge for provisional rows — replaces the CRM status <select> and the
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
  const { stageIdx, elapsedS, etaText, pct, last } = useRunEstimate(run);
  const c = run.counters || {};
  const events = run.events || [];
  const sourced = Number(c.sourced ?? c.extracted ?? 0);
  const scored = Number(c.scored ?? 0);
  const kept = Number(c.kept ?? c.rows_added ?? 0);
  const lastEv = events[events.length - 1];

  // sources actually seen in the event stream -> lit chips (proof it's scanning the web)
  const seen = useMemo(() => {
    const s = new Set<string>();
    for (const ev of events) {
      const low = (ev.label || "").toLowerCase();
      const m = low.match(/^\[([a-z_]+)\]/);
      if (m) s.add(m[1]);
      if (/harvest|linkedin/.test(low)) s.add("linkedin");
    }
    return s;
  }, [events]);
  const liveCount = useMemo(
    () => (run.opportunities?.rows || []).filter((o) => o.status !== "rejected" && o.status !== "written").length,
    [run.opportunities],
  );

  const stats: [string, number, boolean][] = [["Sourced", sourced, false], ["Scored", scored, false], ["Kept", kept, true]];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">

        {/* identity + stage + live countdown + progress */}
        <div className={`${CARD} p-5`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 shrink-0 ${BRUT} rounded-xl overflow-hidden ${SHADOW}`}>
              <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  {!reduce && <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />}
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <h3 className="font-['Clash_Display'] text-lg font-bold leading-none">Sensei is researching</h3>
              </div>
              <p className="text-[13px] text-neutral-700 font-semibold mt-2">{RUN_STAGES[stageIdx].label}</p>
              <p className="text-[12px] text-neutral-400">{RUN_STAGE_HINT[RUN_STAGES[stageIdx].key]}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-['Clash_Display'] text-2xl font-bold tabular-nums leading-none">{fmtClock(elapsedS)}</div>
              <div className={`inline-block mt-2 text-[11px] font-bold rounded-full px-2 py-0.5 border ${last ? "bg-green-50 text-green-700 border-green-300" : "bg-violet-50 text-violet-700 border-violet-300"}`}>{etaText}</div>
            </div>
          </div>

          <div className="mt-4 h-2.5 w-full rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden relative">
            <div className={`h-full rounded-full relative overflow-hidden ${reduce ? "" : "sd-shimmer"}`}
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
            {MC_BOARDS.map(([k, name]) => {
              const lit = seen.has(k);
              return (
                <span key={k} className={`inline-flex items-center gap-1 text-[11px] font-semibold rounded-lg px-2 py-1 border-2 transition-colors ${lit ? "border-neutral-900 bg-green-50 text-green-700" : "border-neutral-200 bg-white text-neutral-400"}`}>
                  {lit ? <FiCheck size={11} /> : <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />} {name}
                </span>
              );
            })}
          </div>
        </div>

        {/* companies as they're found — the centerpiece */}
        <div className={`${CARD} p-4 min-h-[128px]`}>
          {liveCount > 0 ? <LiveCompanies run={run} /> : (
            <div className="flex flex-col items-center justify-center text-center py-7 gap-2">
              <FiSearch className={`text-violet-400 ${reduce ? "" : "animate-pulse"}`} size={20} />
              <p className="text-[13px] font-bold text-neutral-600">Companies appear here as Sensei finds them</p>
              <p className="text-[11px] text-neutral-400">Reading job boards, career pages and hiring posts…</p>
            </div>
          )}
        </div>

        {/* current action, in plain words */}
        <div className="flex items-start gap-2 text-[13px] text-neutral-900 font-semibold px-1">
          <FiZap className="text-violet-500 shrink-0 mt-0.5" size={14} />
          <span>{lastEv ? humanizeEvent(lastEv) : "Planning the research…"}</span>
        </div>

        <p className="text-[11px] text-neutral-400 text-center pb-2">Most runs finish in about 12 to 20 minutes. You can leave this tab open.</p>
      </div>
    </div>
  );
}

// Live animated pipeline graph — a neural-network visual on the right panel while
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
            <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />
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


type SortState = { key: string; dir: 1 | -1 } | null;

function WorkGrid({ table, onEnrichRow, onRowStatus, onDeleteRow, tiered }: {
  table: BobTable;
  onEnrichRow: (rowId: number, tier?: string) => void;
  onRowStatus: (rowId: number, status: string) => void;
  onDeleteRow: (rowId: number) => void;
  tiered: boolean;
}) {
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [sort, setSort] = useState<SortState>(null);
  const [openRow, setOpenRow] = useState<number | null>(null);

  const rows = table.rows;
  // Is this a people table or a companies table? Decides the primary column.
  const peopleTable = rows.some((r) => str(r.cells.name) && !str(r.cells.contact_name));

  const nameOf = (c: any) => str(c.name) || str(c.contact_name) || "";
  const orgOf = (c: any) => str(c.company) || "";
  const phoneOf = (c: any) => str(c.phone) || str(c.contact_phone) || "";
  const emailOf = (c: any) => str(c.email) || str(c.contact_email) || "";
  const titleOf = (c: any) => str(c.title) || str(c.contact_title) || "";
  const primaryOf = (c: any) => (peopleTable ? nameOf(c) : orgOf(c));

  const columns: { key: string; label: string; get: (c: any) => string; grow?: boolean }[] = peopleTable
    ? [
        { key: "name", label: "Name", get: nameOf, grow: true },
        { key: "company", label: "Company", get: orgOf },
        { key: "title", label: "Title", get: titleOf },
        { key: "phone", label: "Phone", get: phoneOf },
        { key: "email", label: "Email", get: emailOf, grow: true },
      ]
    : [
        { key: "company", label: "Company", get: orgOf, grow: true },
        { key: "contact_name", label: "Contact", get: nameOf },
        { key: "phone", label: "Phone", get: phoneOf },
        { key: "email", label: "Email", get: emailOf, grow: true },
      ];

  let view = rows;
  if (sort) {
    const col = columns.find((c) => c.key === sort.key);
    if (col) view = [...rows].sort((a, b) => col.get(a.cells).localeCompare(col.get(b.cells)) * sort.dir);
  }

  const allSel = view.length > 0 && view.every((r) => sel.has(r.id));
  const toggleAll = () => setSel(allSel ? new Set() : new Set(view.map((r) => r.id)));
  const toggle = (id: number) => setSel((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const clickSort = (key: string) =>
    setSort((p) => (p?.key === key ? { key, dir: (p.dir * -1) as 1 | -1 } : { key, dir: 1 }));

  const selRows = view.filter((r) => sel.has(r.id));
  const enrichSelected = () => { selRows.forEach((r) => onEnrichRow(r.id)); setSel(new Set()); };

  return (
    <div className="relative flex-1 min-h-0 flex flex-col bg-white">
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-[13px] border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr className="bg-neutral-100">
              <th className="w-9 px-3 py-2.5 border-b-2 border-neutral-900">
                <input type="checkbox" checked={allSel} onChange={toggleAll}
                  className="accent-violet-600 cursor-pointer" />
              </th>
              {columns.map((c) => (
                <th key={c.key} onClick={() => clickSort(c.key)}
                  className={`px-3 py-2.5 text-left font-bold text-[11px] uppercase tracking-wide text-neutral-600 border-b-2 border-neutral-900 whitespace-nowrap cursor-pointer select-none hover:text-neutral-900 ${c.grow ? "" : "w-px"}`}>
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {sort?.key === c.key && <span className="text-violet-500">{sort.dir === 1 ? "↑" : "↓"}</span>}
                  </span>
                </th>
              ))}
              <th className="px-3 py-2.5 text-left font-bold text-[11px] uppercase tracking-wide text-neutral-600 border-b-2 border-neutral-900 w-px">Stage</th>
              <th className="border-b-2 border-neutral-900 w-px" />
            </tr>
          </thead>
          <tbody>
            {view.map((r) => {
              const c = r.cells as any;
              const has = phoneOf(c) || emailOf(c);
              const selected = sel.has(r.id);
              return (
                <tr key={r.id}
                  onClick={() => setOpenRow(openRow === r.id ? null : r.id)}
                  className={`group cursor-pointer transition-colors ${selected ? "bg-violet-50/60" : "hover:bg-neutral-50"}`}>
                  <td className="px-3 py-2.5 border-b border-neutral-200" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected} onChange={() => toggle(r.id)}
                      className="accent-violet-600 cursor-pointer" />
                  </td>
                  {columns.map((col, ci) => {
                    const v = col.get(c);
                    return (
                      <td key={col.key} className="px-3 py-2.5 border-b border-neutral-200 align-middle max-w-[280px]">
                        {ci === 0 ? (
                          <span className="inline-flex items-center gap-2 min-w-0">
                            {peopleTable
                              ? <span className="w-6 h-6 shrink-0 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center">
                                  {primaryOf(c).split(/\s+/).map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
                                </span>
                              : <CompanyLogo company={orgOf(c)} website={str(c.website)} domain={str(c._domain)} size={22} />}
                            <span className="font-semibold text-neutral-900 truncate">{v || "—"}</span>
                          </span>
                        ) : col.key === "phone" ? (
                          v ? <a href={`tel:${v}`} onClick={(e) => e.stopPropagation()} className="tabular-nums text-neutral-700 hover:text-violet-700">{v}</a> : <span className="text-neutral-300">—</span>
                        ) : col.key === "email" ? (
                          v ? <a href={`mailto:${v}`} onClick={(e) => e.stopPropagation()} className="text-neutral-600 hover:text-violet-700 truncate block max-w-[240px]">{v}</a> : <span className="text-neutral-300">—</span>
                        ) : (
                          <span className="text-neutral-700 truncate block">{v || <span className="text-neutral-300">—</span>}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 border-b border-neutral-200" onClick={(e) => e.stopPropagation()}>
                    {has ? (
                      <select value={r.status || "new"} onChange={(e) => onRowStatus(r.id, e.target.value)}
                        className="text-[12px] rounded-lg border border-neutral-200 bg-white px-2 py-1 text-neutral-600 focus:outline-none focus:ring-1 focus:ring-violet-400">
                        {ROW_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                      </select>
                    ) : (
                      <button onClick={() => onEnrichRow(r.id)}
                        className="text-[12px] font-semibold text-violet-700 hover:text-violet-900">Enrich</button>
                    )}
                  </td>
                  <td className="px-2 py-2.5 border-b border-neutral-200" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onDeleteRow(r.id)} title="Remove"
                      className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-500 transition-opacity">
                      <FiX size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {view.length === 0 && (
          <div className="p-10 text-center text-neutral-400 text-sm">No rows yet.</div>
        )}
      </div>

      {sel.size > 0 && (
        <div className="shrink-0 border-t border-neutral-200 bg-white px-4 py-2.5 flex items-center gap-3">
          <span className="text-[13px] font-medium text-neutral-600">{sel.size} selected</span>
          <button onClick={enrichSelected}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg px-3 py-1.5">
            <FiUserPlus size={13} /> Enrich {sel.size}
          </button>
          <button onClick={() => { selRows.forEach((r) => onDeleteRow(r.id)); setSel(new Set()); }}
            className="text-[13px] font-medium text-neutral-500 hover:text-red-600">Remove</button>
          <button onClick={() => setSel(new Set())} className="ml-auto text-[13px] text-neutral-400 hover:text-neutral-700">Clear</button>
        </div>
      )}

      {/* Row detail — clicking a row opens the full dossier drawer (was dead state before). */}
      {openRow != null && (() => {
        const r = rows.find((x) => x.id === openRow);
        return r ? (
          <RowDrawer
            row={r}
            columns={orderColumns(table.columns)}
            onClose={() => setOpenRow(null)}
            onStatus={(s) => onRowStatus(r.id, s)}
            onEnrich={() => onEnrichRow(r.id)}
            onDelete={() => { onDeleteRow(r.id); setOpenRow(null); }}
          />
        ) : null;
      })()}
    </div>
  );
}

function ResultsPanel({ tables, run, widthPct, fullWidth, expanded, onExpand, viewPref, onViewPref, onRowStatus, onEnrichRow, onEnrichTable, onDeleteRow }: {
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
}) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [detailRow, setDetailRow] = useState<BobRow | null>(null);
  const seenRows = useRef<Set<number>>(new Set());

  const active = tables.find((t) => t.id === activeId) || tables[tables.length - 1] || null;

  // Live overlay -> provisional rows for the active table. Excludes rejected (they drop)
  // and already-shipped (deduped by _company_norm so the real row's hand-off is seamless).
  // Negative synthetic ids never collide with bob_rows.id and are stable across polls, so
  // flash-in + row identity keep working. Ordered by opp id (harvest order) so fit changes
  // during scoring never reshuffle rows.
  const provisional = useMemo<BobRow[]>(() => {
    const opp = run?.opportunities;
    if (!run || run.status !== "running" || !active || !opp || opp.table_id !== active.id) return [];
    const shipped = new Set(
      active.rows.map((r) => String((r.cells as Record<string, unknown>)._company_norm || "")).filter(Boolean),
    );
    return [...opp.rows]
      .filter((o) => o.status !== "rejected" && o.status !== "written" && !(o.company_norm && shipped.has(o.company_norm)))
      .sort((a, b) => a.id - b.id)
      .map((o) => ({ id: -o.id, status: "new", cells: { ...o.cells, _provisional: true, _opp_status: o.status } }));
  }, [run, active]);

  const displayRows = useMemo(() => [...(active?.rows ?? []), ...provisional], [active, provisional]);
  const activeDisplay: BobTable | null = active ? { ...active, rows: displayRows } : null;
  // Cards only for a handful of rows, where the extra detail earns its space.
  // The old threshold was 40, so an 8-row contact list rendered as eight large
  // cards and a single result floated alone in a mostly empty pane. A recruiter
  // scanning names, numbers and status wants rows, not posters.
  const view: ResultsView = viewPref ?? (displayRows.length > 5 ? "table" : "cards");

  // Provisional rows (negative id) must never trigger a PATCH/enrich/delete on a
  // non-existent bob_row — guard every row action at the boundary.
  const rowStatusG = (id: number, s: string) => { if (id >= 0) onRowStatus(id, s); };
  const enrichRowG = (id: number) => { if (id >= 0) onEnrichRow(id); };
  const deleteRowG = (id: number) => { if (id >= 0) onDeleteRow(id); };

  // Track which rows are new (for the flash-in animation), then mark seen.
  const newIds = useMemo(() => {
    const ids = new Set<number>();
    for (const t of tables) for (const r of t.rows) if (!seenRows.current.has(r.id)) ids.add(r.id);
    for (const r of provisional) if (!seenRows.current.has(r.id)) ids.add(r.id);
    return ids;
  }, [tables, provisional]);
  useEffect(() => {
    const timer = setTimeout(() => {
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
            title={prettify(t.name)}
          >
            <span className="truncate">{prettify(t.name)}</span>
            <span className="opacity-70 shrink-0">· {t.id === active?.id ? displayRows.length : t.rows.length}</span>
          </button>
        ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center rounded-xl border-2 border-neutral-900 overflow-hidden mr-1">
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

      {/* Body */}
      {/* While a run is ACTIVE, MissionControl owns the pane the whole time — companies stream into
          its own live list, not a half-baked "In review…" provisional table. The real table only
          takes over once the run is DONE (run is null here). */}
      {run && (MISSION_CONTROL ? <MissionControl run={run} /> : <RunGraph run={run} />)}

      {!run && activeDisplay && view === "cards" && (
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

      {!run && activeDisplay && view === "table" && (
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
  if (status === "found")
    return (
      <button onClick={(e) => { stop(e); onEnrich(); }} title="Contact found — click to re-run"
        className={`inline-flex items-center font-bold rounded-lg bg-green-50 text-green-700 border border-green-300 hover:bg-green-100 ${pad}`}>
        <FiCheck size={10} /> Contact
      </button>
    );
  if (status === "not_found")
    return (
      <button onClick={(e) => { stop(e); onEnrich(); }} title={str(cells._contact_note) || "No reachable contact found — click to retry"}
        className={`inline-flex items-center font-bold rounded-lg bg-neutral-100 text-neutral-500 border border-neutral-300 hover:border-neutral-400 ${pad}`}>
        <FiSlash size={10} /> No contact
      </button>
    );
  if (status === "error")
    return (
      <button onClick={(e) => { stop(e); onEnrich(); }} title={str(cells._contact_note) || "Enrichment failed — retry"}
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
  const c = row.cells;
  const prov = c._provisional === true;
  const company = str(c.company) || `Company ${index + 1}`;
  const website = str(c.website);
  const domain = website ? domainOf(website) : "";
  // LinkedIn/job-board URLs in the website field are not a real company site —
  // never use them for the favicon or a "website" chip.
  const websiteIsReal = !!domain && !NON_SITE_DOMAINS.test(domain);
  const meta = [str(c.city), str(c.size_band) !== "unknown" ? str(c.size_band) : ""].filter(Boolean).join(" · ");
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
  const contactName = str(c.contact_name) || str(c.name);
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
            {fit}
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
            {whyNow || evidence}
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
                      <FiPhone size={11} className="text-green-600" /> {contactPhone}
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
                <FiPhone size={11} className="text-green-600" /> {contactPhone}
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
  return (
    <div className="flex-1 overflow-auto bg-white">
      <table className="text-[12.5px] border-collapse w-full">
        <thead className="sticky top-0 z-20">
          <tr className="bg-[#faf7f2]">
            <th className="sticky left-0 z-30 bg-[#faf7f2] px-3 py-2.5 text-left font-bold text-neutral-500 border-b-2 border-neutral-900 whitespace-nowrap">Company</th>
            <th className="px-3 py-2.5 text-left font-bold text-neutral-500 border-b-2 border-neutral-900 whitespace-nowrap">Contact</th>
            {cols.filter((c) => !HIDE.has(c.key)).map((c) => (
              <th key={c.key} className={`px-3 py-2.5 text-left font-bold text-neutral-500 border-b-2 border-neutral-900 whitespace-nowrap ${WIDE_KEYS.has(c.key) ? "min-w-[240px]" : ""}`}>
                {prettify(c.label || c.key)}
              </th>
            ))}
            <th className="px-3 py-2.5 text-left font-bold text-neutral-500 border-b-2 border-neutral-900 whitespace-nowrap">Status</th>
            <th className="px-2 py-2.5 border-b-2 border-neutral-900" />
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
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 text-right text-[10px] font-normal text-neutral-300">{idx + 1}</span>
                  <CompanyLogo company={str(r.cells.company)} website={str(r.cells.website)} domain={str(r.cells._domain)} size={20} />
                  {str(r.cells.company)}
                </span>
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                {prov ? (
                  <span className="text-neutral-300">—</span>
                ) : str(r.cells.contact_name) ? (
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold truncate max-w-[180px]">{str(r.cells.contact_name)}</div>
                    <div className="flex items-center gap-2 text-[10.5px] text-neutral-500">
                      {str(r.cells.contact_phone) && (
                        <a href={`tel:${str(r.cells.contact_phone)}`} className="inline-flex items-center gap-0.5 hover:text-neutral-900">
                          <FiPhone size={9} className="text-green-600" /> {str(r.cells.contact_phone)}
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
              {cols.filter((c) => !HIDE.has(c.key)).map((c) => (
                <td key={c.key} className={`px-3 py-2.5 ${WIDE_KEYS.has(c.key) ? "min-w-[240px] max-w-[340px]" : "max-w-[200px]"}`}>
                  <Cell colKey={c.key} value={r.cells[c.key]} />
                </td>
              ))}
              <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                {prov ? (
                  <ProvChip status={str(r.cells._opp_status)} />
                ) : (
                  <select
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
  const s = str(value);
  if (!s) return <span className="text-neutral-300">-</span>;

  if (colKey === "tier") {
    const t = s.toUpperCase().replace(/[^T0-9]/g, "");
    return <TierBadge tier={t || s.slice(0, 4)} />;
  }

  if (colKey === "fit_score") {
    const n = parseFloat(s);
    if (!isNaN(n)) {
      const style = n >= 8 ? "bg-green-100 text-green-800" : n >= 6 ? "bg-amber-100 text-amber-800" : "bg-neutral-100 text-neutral-500";
      return <span className={`inline-block text-[11px] font-black rounded-md px-1.5 py-0.5 ${style}`}>{n}</span>;
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
  const [copied, setCopied] = useState<string | null>(null);
  const company = str(row.cells.company) || "Details";

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

  return (
    <>
      <div className="absolute inset-0 bg-neutral-900/20 z-30" onClick={onClose} />
      <div className="absolute top-0 right-0 bottom-0 w-full max-w-[440px] bg-white border-l-2 border-neutral-900 z-40 flex flex-col bob-pop">
        <div className="p-4 border-b-2 border-neutral-900 flex items-start gap-3">
          <div className="min-w-0">
            <h3 className="font-['Clash_Display'] text-xl font-semibold truncate">{company}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <select
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
            {contactStatus(row.cells) === "not_found" && str(row.cells._contact_note) && (
              <p className="text-[11px] text-neutral-500 mt-1.5">{str(row.cells._contact_note)}</p>
            )}
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900">
            <FiX />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {sections.map(([title, cols]) => {
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
                          {prettify(c.label || c.key)}
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
                        ) : (
                          <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{s}</p>
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
