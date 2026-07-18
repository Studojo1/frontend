import { useCallback, useEffect, useState } from "react";
import {
  FiUsers, FiPhone, FiZap, FiExternalLink, FiUserPlus, FiActivity,
  FiMessageSquare, FiAlertTriangle,
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

// dashboard.studojo.* -> app.studojo.* (same env).
function senseiUrl(): string {
  if (typeof window === "undefined") return "https://app.studojo.com";
  const host = window.location.host.replace(/^dashboard\./, "app.");
  return `${window.location.protocol}//${host}`;
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
interface DashData { org: { id: number; name: string } | null; credits: Credits | null; members: Member[]; chats: Chat[]; activity: Activity[] }
interface ChatMsg { id: number; role: string; content: string }
interface ChatRow { id: number; cells: Record<string, any>; status?: string }
interface ChatTable { id: number; name: string; rows: ChatRow[] }
interface ChatDetail { messages: ChatMsg[]; tables: ChatTable[] }

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem(SESSION_STORAGE) || localStorage.getItem(KEY_STORAGE)) setAuthed(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#faf7f2]" />;
  if (!authed) return <DashGate onSuccess={() => setAuthed(true)} />;
  return <Dashboard onSignOut={() => setAuthed(false)} />;
}

function DashGate({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password || busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch(`${API}/auth/email`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
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
        <p className="text-neutral-600 mt-2 mb-6">Sign in with your manager email and password to see your team's activity.</p>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="you@company.com"
          className="w-full border-2 border-neutral-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Password"
          className="w-full border-2 border-neutral-900 rounded-2xl px-4 py-3 mt-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <button
          onClick={submit} disabled={busy}
          className="mt-4 w-full bg-violet-500 text-white font-bold py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Continue"}
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
    localStorage.removeItem(SESSION_STORAGE);
    localStorage.removeItem(KEY_STORAGE);
    onSignOut();
  };

  const doInvite = async () => {
    if (!invite.trim() || inviteBusy) return;
    setInviteBusy(true); setErr("");
    try {
      await api("/org/members", { method: "POST", body: JSON.stringify({ email: invite.trim(), role: inviteRole }) });
      setInvite(""); await load();
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

  const card = "bg-white border-2 border-neutral-900 rounded-2xl shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]";

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

  return (
    <div className="min-h-screen bg-[#faf7f2] font-['Satoshi'] text-neutral-900">
      {viewChat && <ChatViewer chatId={viewChat.id} title={viewChat.title} onClose={() => setViewChat(null)} />}
      {/* Header */}
      <header className="sticky top-0 z-20 border-b-2 border-neutral-900 bg-white">
        <div className="mx-auto max-w-6xl px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 border-2 border-neutral-900 rounded-xl overflow-hidden shrink-0">
              <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="font-['Clash_Display'] text-lg font-semibold leading-none">Team dashboard</div>
              <div className="text-xs text-neutral-400 truncate">{me?.org?.name || "your workspace"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={senseiUrl()} className="flex items-center gap-1.5 bg-violet-600 text-white font-bold text-sm px-4 py-2 rounded-xl border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] hover:shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-shadow">
              Open Sensei <FiExternalLink size={15} />
            </a>
            <button onClick={signOut} className="text-sm font-semibold text-neutral-400 hover:text-neutral-900 px-2">Sign out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 md:px-8 py-8">
        {err && <div className="mb-4 bg-red-50 border-2 border-red-500 text-red-700 rounded-xl px-4 py-2 text-sm">{err}</div>}

        {/* Credit pool + top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`${card} p-5 ${c?.low ? "!border-amber-500" : ""}`}>
            <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-bold uppercase mb-1"><FiPhone size={12} /> Reveals left</div>
            <div className={`text-3xl font-black ${c?.low ? "text-amber-600" : ""}`}>{c ? c.enrichment_balance.toLocaleString() : "-"}</div>
            <div className="text-xs text-neutral-400 mt-1">{c ? `${c.enrichment_used.toLocaleString()} used all-time` : ""}</div>
          </div>
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-bold uppercase mb-1"><FiZap size={12} /> AI credits</div>
            <div className="text-3xl font-black">{c ? (c.ai_balance >= 100_000_000 ? "∞" : c.ai_balance.toLocaleString()) : "-"}</div>
            <div className="text-xs text-neutral-400 mt-1">shared across the team</div>
          </div>
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-bold uppercase mb-1"><FiUsers size={12} /> Team</div>
            <div className="text-3xl font-black">{data?.members.length ?? "-"}</div>
            <div className="text-xs text-neutral-400 mt-1">members</div>
          </div>
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-bold uppercase mb-1"><FiMessageSquare size={12} /> Chats</div>
            <div className="text-3xl font-black">{data?.chats.length ?? "-"}</div>
            <div className="text-xs text-neutral-400 mt-1">in this workspace</div>
          </div>
        </div>

        {c?.low && (
          <div className="mb-6 flex items-center gap-2 bg-amber-50 border-2 border-amber-500 rounded-xl px-4 py-3 text-sm text-amber-800">
            <FiAlertTriangle size={16} className="shrink-0" />
            Your team is running low on reveal credits ({c.enrichment_balance} left). Reach out to Studojo to top up before it runs out.
          </div>
        )}

        {/* How credits work */}
        <p className="text-xs text-neutral-400 mb-6">
          Credits are one shared pool. Every member sees the same balance; a reveal by anyone lowers it for everyone.
        </p>

        {/* Team + invite */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-['Clash_Display'] text-xl font-bold">Team</h2>
        </div>
        <div className={`${card} p-5 mb-4`}>
          <div className="flex items-center gap-2">
            <FiUserPlus size={16} className="text-neutral-400 shrink-0" />
            <input
              type="email" value={invite} onChange={(e) => setInvite(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doInvite()} placeholder="teammate@company.com"
              className="flex-1 border-2 border-neutral-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)}
                    className="border-2 border-neutral-900 rounded-xl px-2 py-2 text-sm">
              <option value="member">Member</option>
              <option value="admin">Manager</option>
            </select>
            <button onClick={doInvite} disabled={inviteBusy}
                    className="bg-violet-600 text-white font-bold px-4 py-2 rounded-xl border-2 border-neutral-900 text-sm disabled:opacity-60">
              {inviteBusy ? "..." : "Invite"}
            </button>
          </div>
        </div>
        <div className={`${card} overflow-x-auto mb-8`}>
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[2.2fr_0.9fr_0.8fr_0.9fr_1fr] gap-2 px-5 py-3 border-b-2 border-neutral-900 text-xs font-bold uppercase text-neutral-400">
              <div>Member</div><div>Role</div><div>Chats</div><div>Reveals</div><div>Last active</div>
            </div>
            {(data?.members || []).map((m) => (
              <div key={m.email} className="grid grid-cols-[2.2fr_0.9fr_0.8fr_0.9fr_1fr] gap-2 px-5 py-3 border-b border-neutral-100 text-sm items-center">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{m.email}</div>
                  <div className="text-[11px] text-neutral-400">{m.last_login_at ? "Active" : "Invited, not signed in yet"}</div>
                </div>
                <div>
                  <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 border-2 ${
                    m.role === "admin" ? "border-violet-500 text-violet-600 bg-violet-50" : "border-neutral-300 text-neutral-500"}`}>
                    {m.role === "admin" ? "manager" : "member"}
                  </span>
                </div>
                <div>{m.chats}</div>
                <div>{m.phones_revealed}</div>
                <div className="text-neutral-500">{fmtDate(m.last_activity)}</div>
              </div>
            ))}
            {(data?.members.length ?? 0) === 0 && <div className="px-5 py-8 text-center text-neutral-400 text-sm">No members yet.</div>}
          </div>
        </div>

        {/* Recent chats — assign each to a team member */}
        <h2 className="font-['Clash_Display'] text-xl font-bold mb-1">Recent chats</h2>
        <p className="text-xs text-neutral-400 mb-3">Assign a chat to someone and it shows up in their Sensei sidebar.</p>
        <div className={`${card} overflow-x-auto mb-8`}>
          <div className="min-w-[640px]">
            {(data?.chats || []).map((ch) => (
              <div key={ch.id} className="grid grid-cols-[1.8fr_1fr_1.3fr_0.7fr] gap-3 items-center px-5 py-3 border-b border-neutral-100 text-sm">
                <button
                  onClick={() => setViewChat({ id: ch.id, title: ch.title })}
                  className="min-w-0 flex items-center gap-2 text-left group"
                  title="Open this chat"
                >
                  <span className="font-semibold truncate group-hover:text-violet-700 group-hover:underline">{ch.title}</span>
                  {ch.shared_org && <span className="shrink-0 text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5">shared</span>}
                </button>
                <div className="text-neutral-400 text-xs truncate" title={ch.owner_email || ""}>
                  {ch.owner_email || "-"}
                </div>
                <div>
                  <select
                    value={ch.assigned_to || ""}
                    onChange={(e) => assignChat(ch.id, e.target.value)}
                    className={`w-full border-2 rounded-lg px-2 py-1.5 text-xs ${ch.assigned_to ? "border-violet-500 text-violet-700 bg-violet-50" : "border-neutral-300 text-neutral-500"}`}
                  >
                    <option value="">Unassigned</option>
                    {(data?.members || []).map((m) => (
                      <option key={m.email} value={m.email}>{m.email}</option>
                    ))}
                  </select>
                </div>
                <div className="text-neutral-400 text-xs text-right">{fmtDate(ch.updated_at)}</div>
              </div>
            ))}
            {(data?.chats.length ?? 0) === 0 && <div className="px-5 py-8 text-center text-neutral-400 text-sm">No chats yet.</div>}
          </div>
        </div>

        {/* Activity / spend log */}
        <h2 className="font-['Clash_Display'] text-xl font-bold mb-3 flex items-center gap-2"><FiActivity size={18} /> Credit activity</h2>
        <div className={`${card} overflow-hidden`}>
          {(data?.activity || []).map((a, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-5 py-2.5 border-b border-neutral-100 text-sm">
              <div className="min-w-0 flex items-center gap-2">
                <span className={`shrink-0 text-[10px] font-bold rounded px-1.5 py-0.5 ${a.kind === "enrichment" ? "bg-violet-100 text-violet-700" : "bg-neutral-100 text-neutral-500"}`}>
                  {a.kind === "enrichment" ? "reveal" : "AI"}
                </span>
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
      </div>
    </div>
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
