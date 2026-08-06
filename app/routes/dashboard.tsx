import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiUsers, FiPhone, FiZap, FiExternalLink, FiUserPlus, FiActivity,
  FiMessageSquare, FiAlertTriangle, FiHome, FiMail, FiCpu, FiCopy, FiTrash2,
} from "react-icons/fi";

// ─────────────────────────────────────────────────────────────────────────────
// dashboard.studojo.com — the org manager (super-admin) portal for a Sensei
// workspace. The BD-team managers live here: they watch team activity, the
// shared credit pool, who's spending reveals, and manage members. A button
// takes them into Sensei itself (app.studojo.com) to do the work.
// Backend: bob-svc /org/analytics (admin-gated) + /me + /org/members.
// ─────────────────────────────────────────────────────────────────────────────

export function meta() {
  return [
    { title: "Sensei Dashboard — Studojo" },
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
  return s ? `${base}/?s=${encodeURIComponent(s)}` : base;
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

export default function DashboardPage() {
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
    // Session handoff from Sensei (?s=token) — adopt it (overriding any stale
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

  if (!mounted) return <div className="min-h-screen bg-[#faf7f2]" />;
  if (resetToken) return <ResetPasswordScreen token={resetToken} onDone={() => setResetToken(null)} />;
  if (!authed) return <DashGate onSuccess={() => setAuthed(true)} />;
  return <Dashboard onSignOut={() => setAuthed(false)} />;
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
          <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />
        </div>
        <h1 className="font-['Clash_Display'] text-3xl font-semibold text-neutral-900">
          Team dashboard <span className="text-neutral-400 text-xl font-normal">Sensei</span>
        </h1>
        <p className="text-neutral-600 mt-2 mb-6">
          {forgot
            ? "Enter your email and we'll send you a link to set a new password."
            : "Sign in with your manager email and password to see your team's activity."}
        </p>
        <form onSubmit={(e) => { e.preventDefault(); forgot ? submitForgot() : submit(); }}>
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

  // Non-admin members don't get the manager dashboard — send them to Sensei.
  if (me && me.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#faf7f2] font-['Satoshi'] flex items-center justify-center p-6 text-neutral-900">
        <div className={`${card} p-8 max-w-md text-center`}>
          <div className="w-12 h-12 border-2 border-neutral-900 rounded-2xl overflow-hidden mx-auto mb-4">
            <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />
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
    <div className={`${card} p-5 ${warn ? "!border-amber-500" : ""}`}>
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
            <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />
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
                <StatCard icon={<FiMessageSquare size={12} />} label="Chats" value={data?.chats.length ?? "-"} sub="in this workspace" />
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
                    className="flex-1 border-2 border-neutral-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)}
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

          {/* CREDIT USAGE — per-member spend + full enrichment log */}
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
                      <div className="truncate text-neutral-700">{str(r.contact_phone) ? <a href={`tel:${str(r.contact_phone)}`} className="hover:text-violet-700 flex items-center gap-1"><FiPhone size={11} />{str(r.contact_phone)}</a> : <span className="text-neutral-300">—</span>}</div>
                      <div className="truncate text-neutral-700">{str(r.contact_email) ? <a href={`mailto:${str(r.contact_email)}`} className="hover:text-violet-700 flex items-center gap-1 truncate"><FiMail size={11} className="shrink-0" /><span className="truncate">{str(r.contact_email)}</span></a> : <span className="text-neutral-300">—</span>}</div>
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
                        <span className="font-semibold truncate group-hover:text-violet-700 group-hover:underline">{ch.title}</span>
                        {ch.shared_org && <span className="shrink-0 text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5">shared</span>}
                      </button>
                      <div className="text-neutral-400 text-xs truncate" title={ch.owner_email || ""}>{ch.owner_email || "-"}</div>
                      <div>
                        <select value={ch.assigned_to || ""} onChange={(e) => assignChat(ch.id, e.target.value)}
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
      body: body ? JSON.stringify(body) : undefined,
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
          <div className="text-xs font-bold uppercase tracking-wide text-violet-700 mb-2">Your new key — copy it now</div>
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

// Read-only chat viewer for managers — the full conversation + the results the
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
                      <div className="font-semibold truncate">{str(r.cells.company) || "—"}</div>
                      <div className="text-xs text-neutral-400 truncate">{str(r.cells.role_title) || str(r.cells.contact_name)}</div>
                    </div>
                    <div className="text-xs text-neutral-500 truncate max-w-[45%] text-right">
                      {str(r.cells.contact_email) || str(r.cells.contact_phone) || str(r.cells.location_city)}
                    </div>
                  </div>
                ))}
                {t.rows.length > 50 && <div className="px-4 py-2 text-xs text-neutral-400">+ {t.rows.length - 50} more — open in Sensei to see all.</div>}
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
          <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />
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
