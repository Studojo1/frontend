"use client";
// LinkedIn outreach automation dashboard
// Route: /autoapply/outreach
// Shows campaigns, contact pipeline, live stats, and session health.

import { useState, useEffect, useCallback } from "react";
import { useFetcher } from "react-router";
import { Header } from "~/components/common/header";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SessionStatus {
  connected: boolean;
  warmupDay?: number;
  dailyLimit?: number;
  sentToday?: number;
  proxyCountry?: string;
  cookieAgeDays?: number;
  cookieExpiresSoon?: boolean;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  targetTitles: string[];
  targetCompanies: string[];
  connectionNote: string | null;
  messageTemplate: string | null;
  followUpTemplate: string | null;
  createdAt: string;
}

interface Contact {
  id: string;
  name: string | null;
  title: string | null;
  company: string | null;
  linkedinUrl: string;
  status: string;
  sequenceStep: number;
  lastActionAt: string | null;
  replied: boolean;
}

interface DashboardStats {
  session: SessionStatus;
  campaigns: Campaign[];
  totals: Record<string, number>;
  acceptanceRate: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  requested: "Request sent",
  accepted: "Connected",
  messaged: "Messaged",
  replied: "Replied",
  done: "Done",
};

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-gray-100 text-gray-500",
  requested: "bg-blue-100 text-blue-700",
  accepted:  "bg-green-100 text-green-700",
  messaged:  "bg-violet-100 text-violet-700",
  replied:   "bg-emerald-100 text-emerald-700",
  done:      "bg-gray-100 text-gray-400",
};

function timeAgo(date: string | null): string {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function LinkedInCampaignDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showAddLeads, setShowAddLeads] = useState(false);
  const [loading, setLoading] = useState(true);

  const campaignFetcher = useFetcher();
  const leadFetcher = useFetcher();

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/outreach/stats");
      if (res.ok) {
        const data: DashboardStats = await res.json();
        setStats(data);
        if (!activeCampaignId && data.campaigns?.length > 0) {
          setActiveCampaignId(data.campaigns[0].id);
        }
      }
    } catch {}
    setLoading(false);
  }, [activeCampaignId]);

  useEffect(() => {
    fetchStats();
    const t = setInterval(fetchStats, 15_000);
    return () => clearInterval(t);
  }, [fetchStats]);

  // SSE — contacts update from stream
  useEffect(() => {
    const es = new EventSource("/api/autoapply/stream");
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if ((data.type === "snapshot" || data.type === "update") && data.outreach) {
          setContacts(data.outreach);
        }
        if (data.type === "reconnect") es.close();
      } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  const session = stats?.session;
  const campaigns = stats?.campaigns ?? [];
  const totals = stats?.totals ?? {};
  const activeCampaign = campaigns.find(c => c.id === activeCampaignId) ?? campaigns[0] ?? null;

  const totalConnected = (totals.accepted ?? 0) + (totals.messaged ?? 0) + (totals.replied ?? 0);
  const totalMessaged  = (totals.messaged ?? 0) + (totals.replied ?? 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="flex items-center justify-center py-32 text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* Page header */}
      <div className="border-b border-gray-200 bg-white px-6 py-5">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-clash">LinkedIn Campaigns</h1>
            <p className="text-sm text-gray-400 mt-0.5 font-satoshi">
              Automated connection requests · messages · follow-ups
            </p>
          </div>
          <button
            onClick={() => setShowNewCampaign(true)}
            className="bg-violet-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-violet-700 transition"
          >
            + New Campaign
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6 space-y-5">

        {/* Session bar */}
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-3.5 flex flex-wrap items-center gap-6 text-sm font-satoshi">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${session?.connected ? "bg-green-500" : "bg-red-400"}`} />
            <span className="font-semibold text-gray-800">
              {session?.connected ? "LinkedIn connected" : "LinkedIn not connected"}
            </span>
          </div>
          {session?.connected && (
            <>
              <span className="text-gray-400">
                Warmup <span className="font-semibold text-gray-700">Day {session.warmupDay}/15</span>
              </span>
              <span className="text-gray-400">
                Sent today <span className={`font-semibold ${(session.sentToday ?? 0) >= (session.dailyLimit ?? 99) ? "text-amber-600" : "text-gray-700"}`}>
                  {session.sentToday ?? 0} / {session.dailyLimit ?? "—"}
                </span>
              </span>
              <span className="text-gray-400">
                Proxy <span className="font-semibold text-gray-700">{session.proxyCountry ?? "—"}</span>
              </span>
              <span className="text-gray-400">
                Cookie <span className={`font-semibold ${session.cookieExpiresSoon ? "text-amber-600" : "text-gray-700"}`}>
                  {session.cookieAgeDays !== null ? `${session.cookieAgeDays}d old` : "—"}
                </span>
              </span>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-gray-400">Warmup</span>
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${Math.min(100, ((session.warmupDay ?? 0) / 15) * 100)}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Warnings */}
        {session?.cookieExpiresSoon && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 font-satoshi">
            ⚠ LinkedIn cookie is {session.cookieAgeDays} days old — refresh via the Chrome extension before it expires.
          </div>
        )}
        {!session?.connected && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700 font-satoshi">
            <span className="font-semibold">LinkedIn not connected.</span> Install the Chrome extension and connect your account to start campaigns.
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: "Requests sent", value: totals.requested ?? 0 },
            { label: "Connected", value: totalConnected },
            { label: "Messaged", value: totalMessaged },
            { label: "Replied", value: totals.replied ?? 0 },
            { label: "Pending", value: totals.pending ?? 0 },
            { label: "Accept rate", value: `${stats?.acceptanceRate ?? 0}%`, highlight: true },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border px-4 py-3 bg-white ${s.highlight ? "border-violet-200" : "border-gray-200"}`}>
              <p className="text-xs text-gray-400 font-satoshi">{s.label}</p>
              <p className={`text-2xl font-bold mt-0.5 font-clash ${s.highlight ? "text-violet-700" : "text-gray-900"}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Campaign list + contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-3 font-satoshi">Campaigns</p>
            {campaigns.length === 0 ? (
              <p className="text-sm text-gray-400 px-1 font-satoshi">No campaigns yet</p>
            ) : campaigns.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCampaignId(c.id)}
                className={`w-full text-left rounded-xl border px-3 py-2.5 transition ${
                  c.id === activeCampaignId
                    ? "border-violet-300 bg-violet-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-gray-800 truncate font-satoshi">{c.name}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      campaignFetcher.submit(
                        { id: c.id, status: c.status === "active" ? "paused" : "active" },
                        { method: "PATCH", action: "/api/autoapply/campaigns", encType: "application/json" }
                      );
                      setTimeout(fetchStats, 800);
                    }}
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold cursor-pointer shrink-0 ${
                      c.status === "active"
                        ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600"
                        : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700"
                    }`}
                  >
                    {c.status === "active" ? "Active" : "Paused"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate font-satoshi">
                  {c.targetTitles?.slice(0, 2).join(", ") || "All titles"}
                </p>
              </button>
            ))}
          </div>

          {/* Main panel */}
          <div className="lg:col-span-3 space-y-4">
            {activeCampaign ? (
              <>
                <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-gray-900 font-clash">{activeCampaign.name}</h2>
                    <p className="text-xs text-gray-400 mt-1 font-satoshi">
                      {activeCampaign.targetTitles?.join(", ") || "All titles"}
                      {activeCampaign.targetCompanies?.length > 0 && ` · ${activeCampaign.targetCompanies.join(", ")}`}
                    </p>
                    {activeCampaign.connectionNote && (
                      <p className="text-xs text-gray-500 mt-2 italic font-satoshi max-w-md">
                        "{activeCampaign.connectionNote.slice(0, 100)}{activeCampaign.connectionNote.length > 100 ? "…" : ""}"
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAddLeads(true)}
                    className="shrink-0 text-sm border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition font-satoshi font-semibold"
                  >
                    + Add leads
                  </button>
                </div>

                {/* Pipeline funnel */}
                <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 font-satoshi">Pipeline</p>
                  <div className="flex items-center gap-2 text-sm font-satoshi">
                    {[
                      { label: "Pending", count: totals.pending ?? 0, color: "bg-gray-100 text-gray-600" },
                      { label: "Requested", count: totals.requested ?? 0, color: "bg-blue-100 text-blue-700" },
                      { label: "Connected", count: totals.accepted ?? 0, color: "bg-green-100 text-green-700" },
                      { label: "Messaged", count: totals.messaged ?? 0, color: "bg-violet-100 text-violet-700" },
                      { label: "Replied", count: totals.replied ?? 0, color: "bg-emerald-100 text-emerald-700" },
                    ].map((stage, i) => (
                      <div key={stage.label} className="flex items-center gap-2">
                        <div className={`rounded-lg px-3 py-1.5 font-semibold text-xs ${stage.color}`}>
                          {stage.label} <span className="ml-1 font-bold">{stage.count}</span>
                        </div>
                        {i < 4 && <span className="text-gray-300">→</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contacts table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700 font-satoshi">Contacts</p>
                    <p className="text-xs text-gray-400 font-satoshi">{contacts.length} total</p>
                  </div>
                  {contacts.length === 0 ? (
                    <div className="px-5 py-14 text-center">
                      <p className="text-sm text-gray-400 font-satoshi">No contacts yet</p>
                      <button
                        onClick={() => setShowAddLeads(true)}
                        className="mt-3 text-sm text-violet-600 hover:text-violet-700 font-semibold font-satoshi"
                      >
                        Add leads →
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {contacts.slice(0, 100).map(contact => (
                        <div key={contact.id} className="px-5 py-3 flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0 font-clash">
                            {(contact.name ?? "?")[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <a
                              href={contact.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold text-gray-800 hover:text-violet-600 truncate block font-satoshi"
                            >
                              {contact.name ?? "Unknown"}
                            </a>
                            <p className="text-xs text-gray-400 truncate font-satoshi">
                              {[contact.title, contact.company].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 font-satoshi ${STATUS_COLOR[contact.status] ?? "bg-gray-100 text-gray-500"}`}>
                            {STATUS_LABEL[contact.status] ?? contact.status}
                          </span>
                          <span className="text-xs text-gray-400 shrink-0 w-16 text-right font-satoshi">
                            {timeAgo(contact.lastActionAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 px-5 py-16 text-center">
                <p className="text-gray-400 text-sm font-satoshi">Create a campaign to get started</p>
                <button
                  onClick={() => setShowNewCampaign(true)}
                  className="mt-4 bg-violet-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-violet-700 transition"
                >
                  + New Campaign
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewCampaign && (
        <NewCampaignModal
          onClose={() => setShowNewCampaign(false)}
          onSave={(data) => {
            campaignFetcher.submit(data, {
              method: "POST",
              action: "/api/autoapply/campaigns",
              encType: "application/json",
            });
            setShowNewCampaign(false);
            setTimeout(fetchStats, 1000);
          }}
        />
      )}

      {showAddLeads && activeCampaign && (
        <AddLeadsModal
          campaignId={activeCampaign.id}
          onClose={() => setShowAddLeads(false)}
          onSave={(payload) => {
            leadFetcher.submit(payload, {
              method: "POST",
              action: "/api/autoapply/leads",
              encType: "application/json",
            });
            setShowAddLeads(false);
            setTimeout(fetchStats, 1000);
          }}
        />
      )}
    </div>
  );
}

// ── New campaign modal ────────────────────────────────────────────────────────

function NewCampaignModal({ onClose, onSave }: { onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    name: "", targetTitles: "", targetCompanies: "",
    connectionNote: "", messageTemplate: "", followUpTemplate: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal title="New campaign" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Campaign name" required>
          <input className={INPUT} placeholder="e.g. Recruiters @ FAANG" value={form.name} onChange={set("name")} />
        </Field>
        <Field label="Target titles" hint="comma-separated">
          <input className={INPUT} placeholder="Recruiter, Talent Acquisition, Engineering Manager" value={form.targetTitles} onChange={set("targetTitles")} />
        </Field>
        <Field label="Target companies" hint="comma-separated, leave blank for all">
          <input className={INPUT} placeholder="Google, Meta, Stripe" value={form.targetCompanies} onChange={set("targetCompanies")} />
        </Field>
        <Field label="Connection note" hint="max 300 chars — leave blank for AI-generated">
          <textarea className={`${INPUT} resize-none`} rows={2} maxLength={300}
            placeholder="Hi {firstName}, I came across your profile and would love to connect…"
            value={form.connectionNote} onChange={set("connectionNote")} />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.connectionNote.length}/300</p>
        </Field>
        <Field label="Intro message" hint="sent 3 days after acceptance">
          <textarea className={`${INPUT} resize-none`} rows={3}
            placeholder="Hi {firstName}, thanks for connecting! I applied for a role at {company} and…"
            value={form.messageTemplate} onChange={set("messageTemplate")} />
        </Field>
        <Field label="Follow-up" hint="sent 7 days after intro if no reply">
          <textarea className={`${INPUT} resize-none`} rows={2}
            placeholder="Hi {firstName}, just following up — happy to jump on a 15 min call if useful."
            value={form.followUpTemplate} onChange={set("followUpTemplate")} />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 font-satoshi">Cancel</button>
          <button
            onClick={() => {
              if (!form.name.trim()) return;
              onSave({
                name: form.name.trim(),
                targetTitles: form.targetTitles.split(",").map(s => s.trim()).filter(Boolean),
                targetCompanies: form.targetCompanies.split(",").map(s => s.trim()).filter(Boolean),
                connectionNote: form.connectionNote.trim() || null,
                messageTemplate: form.messageTemplate.trim() || null,
                followUpTemplate: form.followUpTemplate.trim() || null,
              });
            }}
            disabled={!form.name.trim()}
            className="bg-violet-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-violet-700 disabled:opacity-40 transition font-satoshi"
          >
            Create
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Add leads modal ───────────────────────────────────────────────────────────

function AddLeadsModal({ campaignId, onClose, onSave }: { campaignId: string; onClose: () => void; onSave: (d: any) => void }) {
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    setError("");
    let leads: any[];
    try {
      const parsed = JSON.parse(raw.trim());
      leads = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      setError("Invalid JSON — paste an array of lead objects");
      return;
    }
    const valid = leads.filter((l: any) => l.linkedinUrl);
    if (!valid.length) { setError("Each lead needs a linkedinUrl field"); return; }
    onSave({ campaignId, leads: valid });
  };

  const EXAMPLE = `[
  {
    "linkedinUrl": "https://linkedin.com/in/sarah-patel",
    "name": "Sarah Patel",
    "title": "Recruiter",
    "company": "Google"
  }
]`;

  return (
    <Modal title="Add leads" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500 font-satoshi">
          Paste a JSON array. Each lead needs a <code className="bg-gray-100 px-1 rounded text-xs">linkedinUrl</code>.
          Optional: <code className="bg-gray-100 px-1 rounded text-xs">name</code>, <code className="bg-gray-100 px-1 rounded text-xs">title</code>, <code className="bg-gray-100 px-1 rounded text-xs">company</code>.
        </p>
        <pre className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500 font-mono overflow-auto">{EXAMPLE}</pre>
        <textarea
          className={`${INPUT} resize-none font-mono text-xs`}
          rows={8}
          placeholder="Paste JSON here…"
          value={raw}
          onChange={e => setRaw(e.target.value)}
        />
        {error && <p className="text-sm text-red-500 font-satoshi">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 font-satoshi">Cancel</button>
          <button
            onClick={handleSave}
            className="bg-violet-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-violet-700 transition font-satoshi"
          >
            Add leads
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────

const INPUT = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-satoshi text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 font-clash">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-satoshi">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        {hint && <span className="font-normal text-gray-400 ml-1.5 text-xs">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}
