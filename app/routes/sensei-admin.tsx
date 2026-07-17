// Sensei super-admin portal — served at the root of admin.studojo.* (host-routed
// from _index.tsx). Studojo super-admins mint partner organizations here; org
// admins then invite their own teams inside Sensei. Gated by the super-admin
// secret (sent as X-Superadmin-Secret). Self-contained (react + react-icons).
import { useCallback, useEffect, useState } from "react";
import { FiPlus, FiRefreshCw, FiLock, FiUsers, FiMessageSquare, FiBriefcase } from "react-icons/fi";

const API = "/api/v1/outreach/bob";
const SECRET_STORAGE = "sensei_admin_secret";

interface Org { id: number; name: string; email_domain: string | null; created_at: string | null; members: number; chats: number }

async function adminFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const secret = localStorage.getItem(SECRET_STORAGE) || "";
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", "X-Superadmin-Secret": secret, ...(options.headers as any) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `Request failed (${res.status})`);
  return data as T;
}

export default function SenseiAdmin() {
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setMounted(true); if (localStorage.getItem(SECRET_STORAGE)) setAuthed(true); }, []);
  if (!mounted) return <div className="min-h-screen bg-[#faf7f2]" />;
  if (!authed) return <Gate onSuccess={() => setAuthed(true)} />;
  return <Portal onSignOut={() => { localStorage.removeItem(SECRET_STORAGE); setAuthed(false); }} />;
}

function Gate({ onSuccess }: { onSuccess: () => void }) {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!secret.trim() || busy) return;
    setBusy(true); setError("");
    localStorage.setItem(SECRET_STORAGE, secret.trim());
    try { await adminFetch("/admin/orgs"); onSuccess(); }
    catch (e: any) { localStorage.removeItem(SECRET_STORAGE); setError(e?.message || "Invalid secret"); }
    finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6 font-['Satoshi']">
      <div className="w-full max-w-md bg-white border-2 border-neutral-900 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] p-8">
        <div className="w-12 h-12 bg-neutral-900 border-2 border-neutral-900 rounded-2xl flex items-center justify-center mb-5">
          <FiLock className="text-white text-xl" />
        </div>
        <h1 className="font-['Clash_Display'] text-2xl font-semibold">Sensei Admin</h1>
        <p className="text-neutral-600 mt-2 mb-6">Studojo super-admin access. Enter the admin secret.</p>
        <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Super-admin secret"
               className="w-full border-2 border-neutral-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500" />
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <button onClick={submit} disabled={busy}
                className="mt-4 w-full bg-neutral-900 text-white font-bold py-3 rounded-2xl border-2 border-neutral-900 hover:bg-violet-500 transition-colors disabled:opacity-60">
          {busy ? "Checking..." : "Enter"}
        </button>
      </div>
    </div>
  );
}

type Tab = "orgs" | "usage" | "logs" | "tickets";

function Portal({ onSignOut }: { onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>("orgs");
  const [orgs, setOrgs] = useState<Org[]>([]);
  const load = useCallback(async () => {
    try { setOrgs((await adminFetch<{ orgs: Org[] }>("/admin/orgs")).orgs || []); } catch { /* */ }
  }, []);
  useEffect(() => { load(); }, [load]);

  const tabs: [Tab, string, any][] = [
    ["orgs", "Organizations", FiBriefcase], ["usage", "Usage", FiUsers],
    ["logs", "Logs", FiRefreshCw], ["tickets", "Tickets", FiMessageSquare],
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] font-['Satoshi'] text-neutral-900">
      <header className="h-14 border-b-2 border-neutral-900 bg-white flex items-center gap-3 px-5">
        <div className="w-8 h-8 border-2 border-neutral-900 rounded-xl overflow-hidden">
          <img src="/favicon.png" alt="Sensei" className="w-full h-full object-cover" />
        </div>
        <span className="font-['Clash_Display'] text-lg font-semibold">Sensei Admin</span>
        <button onClick={onSignOut} className="ml-auto text-sm font-semibold text-neutral-400 hover:text-neutral-900">Sign out</button>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex gap-1 mb-6 border-2 border-neutral-900 rounded-2xl p-1 w-fit bg-white">
          {tabs.map(([t, label, Icon]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                tab === t ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {tab === "orgs" && <OrgsTab orgs={orgs} reload={load} />}
        {tab === "usage" && <UsageTab orgs={orgs} />}
        {(tab === "logs" || tab === "tickets") && (
          <div className="bg-white border-2 border-neutral-900 rounded-2xl p-10 text-center text-neutral-400">
            {tab === "logs" ? "Run + credit logs" : "Support tickets"} — coming next.
          </div>
        )}
      </div>
    </div>
  );
}

function OrgsTab({ orgs, reload }: { orgs: Org[]; reload: () => void }) {
  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const create = async () => {
    if (!name.trim() || !adminEmail.trim() || busy) return;
    setBusy(true); setMsg("");
    try {
      await adminFetch("/admin/orgs", { method: "POST",
        body: JSON.stringify({ org_name: name.trim(), admin_email: adminEmail.trim(), email_domain: domain.trim() }) });
      setName(""); setAdminEmail(""); setDomain(""); setMsg("Organization created."); reload();
    } catch (e: any) { setMsg(e?.message || "Could not create organization"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-neutral-900 rounded-2xl p-5">
        <h3 className="font-semibold mb-1">New partner account</h3>
        <p className="text-sm text-neutral-500 mb-4">Create the org and its first admin. The admin invites their own team.</p>
        <div className="grid sm:grid-cols-3 gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company name"
                 className="border-2 border-neutral-900 rounded-xl px-3 py-2 text-sm" />
          <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Admin email" type="email"
                 className="border-2 border-neutral-900 rounded-xl px-3 py-2 text-sm" />
          <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Email domain (optional)"
                 className="border-2 border-neutral-900 rounded-xl px-3 py-2 text-sm" />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={create} disabled={busy}
                  className="flex items-center gap-2 bg-violet-500 text-white font-bold px-4 py-2 rounded-xl border-2 border-neutral-900 text-sm disabled:opacity-60">
            <FiPlus size={15} /> {busy ? "Creating..." : "Create organization"}
          </button>
          {msg && <span className="text-sm text-neutral-500">{msg}</span>}
        </div>
      </div>

      <div className="bg-white border-2 border-neutral-900 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-2 px-5 py-3 border-b-2 border-neutral-900 text-xs font-bold uppercase text-neutral-400">
          <div>Organization</div><div>Email domain</div><div>Members</div><div>Chats</div>
        </div>
        {orgs.map((o) => (
          <div key={o.id} className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-2 px-5 py-3 border-b border-neutral-100 text-sm items-center">
            <div className="font-semibold truncate">{o.name}</div>
            <div className="text-neutral-500 truncate">{o.email_domain || "—"}</div>
            <div>{o.members}</div><div>{o.chats}</div>
          </div>
        ))}
        {orgs.length === 0 && <div className="px-5 py-8 text-center text-neutral-400 text-sm">No organizations yet.</div>}
      </div>
    </div>
  );
}

function UsageTab({ orgs }: { orgs: Org[] }) {
  const totalMembers = orgs.reduce((s, o) => s + o.members, 0);
  const totalChats = orgs.reduce((s, o) => s + o.chats, 0);
  const stat = (label: string, value: number) => (
    <div className="bg-white border-2 border-neutral-900 rounded-2xl p-5">
      <div className="text-3xl font-['Clash_Display'] font-semibold">{value.toLocaleString()}</div>
      <div className="text-sm text-neutral-400 mt-1">{label}</div>
    </div>
  );
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {stat("Organizations", orgs.length)}
      {stat("Members", totalMembers)}
      {stat("Chats", totalChats)}
    </div>
  );
}
