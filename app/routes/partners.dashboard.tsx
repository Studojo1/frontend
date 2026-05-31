import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { partnersGet, partnersPost, partnersDelete, clearToken, getStoredUser, PartnersApiError } from "~/lib/partners/api";
import type { Route } from "./+types/partners.dashboard";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard | Studojo Partners" }];
}

interface Me {
  id: number;
  name: string;
  email: string;
  company?: string;
  candidate_credits_total: number;
  candidate_credits_used: number;
  candidate_credits_remaining: number;
}

interface ApiKey {
  id: number;
  prefix: string;
  label: string;
  status: string;
  created_at: string;
  last_used_at: string | null;
}

interface NewKeyData {
  id: number;
  raw_key: string;
  prefix: string;
  webhook_secret: string;
}

const API_DOCS_URL = "https://partners.studojo.com/docs";

export default function PartnersDashboard() {
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const [me, setMe] = useState<Me | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<NewKeyData | null>(null);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "docs">("dashboard");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [meData, keysData] = await Promise.all([
        partnersGet<Me>("/partners/auth/me"),
        partnersGet<ApiKey[]>("/partners/keys"),
      ]);
      setMe(meData);
      setKeys(keysData);
    } catch (err: any) {
      if (err instanceof PartnersApiError && err.status === 401) {
        clearToken();
        navigate("/partners/login");
      } else {
        setError("Failed to load dashboard.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!storedUser) { navigate("/partners/login"); return; }
    load();
  }, [load, navigate, storedUser]);

  const createKey = async () => {
    setCreatingKey(true);
    setError(null);
    try {
      const res = await partnersPost<{ id: number; raw_key: string; prefix: string; webhook_secret: string; created_at: string; warning: string }>(
        "/partners/keys",
        { label: newKeyLabel || undefined },
      );
      setNewKey({ id: res.id, raw_key: res.raw_key, prefix: res.prefix, webhook_secret: res.webhook_secret });
      setShowCreateForm(false);
      setNewKeyLabel("");
      load();
    } catch (err: any) {
      setError(err.message ?? "Failed to create key.");
    } finally {
      setCreatingKey(false);
    }
  };

  const revokeKey = async (id: number) => {
    if (!confirm("Revoke this API key? Any integrations using it will stop working.")) return;
    setRevokingId(id);
    try {
      await partnersDelete(`/partners/keys/${id}`);
      load();
    } catch (err: any) {
      setError(err.message ?? "Failed to revoke key.");
    } finally {
      setRevokingId(null);
    }
  };

  const copy = (text: string, id: number | string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const signOut = () => { clearToken(); navigate("/partners/login"); };

  const creditPct = me
    ? me.candidate_credits_total > 0
      ? Math.round((me.candidate_credits_remaining / me.candidate_credits_total) * 100)
      : 0
    : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 font-['Satoshi']">
        <div className="text-neutral-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-['Satoshi']">
      {/* Nav */}
      <nav className="border-b-2 border-neutral-900 bg-white px-6 py-4 flex items-center justify-between">
        <Link to="/partners" className="font-['Clash_Display'] text-xl font-bold text-neutral-900">
          Studojo Partners
        </Link>
        <div className="flex items-center gap-4">
          {me && (
            <span className="hidden text-sm text-neutral-500 md:block">
              {me.name} {me.company ? `· ${me.company}` : ""}
            </span>
          )}
          <button onClick={signOut} className="text-sm text-neutral-500 hover:text-neutral-800">
            Sign out
          </button>
        </div>
      </nav>

      {/* Tab bar */}
      <div className="border-b-2 border-neutral-900 bg-white px-6">
        <div className="flex gap-0">
          {(["dashboard", "docs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-5 py-3 text-sm font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "border-violet-500 text-violet-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {tab === "dashboard" ? "Dashboard" : "API Reference"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "docs" ? (
        <div className="h-[calc(100vh-112px)]">
          <iframe
            src={API_DOCS_URL}
            title="Studojo Partners API Reference"
            className="h-full w-full border-0"
          />
        </div>
      ) : (
        <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
          {error && (
            <div className="rounded-xl border-2 border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Newly created key — show once */}
          {newKey && (
            <div className="rounded-2xl border-2 border-green-500 bg-green-50 p-6 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-green-600 text-lg">✓</span>
                <h3 className="font-['Clash_Display'] text-lg font-bold text-neutral-900">API key created</h3>
              </div>
              <p className="mb-4 text-sm text-red-600 font-semibold">
                Copy this key now. It will not be shown again.
              </p>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 text-xs font-semibold text-neutral-500 uppercase">API Key</div>
                  <div className="flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-white px-4 py-2.5">
                    <code className="flex-1 overflow-x-auto text-sm font-mono text-neutral-900 whitespace-nowrap">{newKey.raw_key}</code>
                    <button
                      onClick={() => copy(newKey.raw_key, "raw")}
                      className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                    >
                      {copiedId === "raw" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold text-neutral-500 uppercase">Webhook Secret</div>
                  <div className="flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-white px-4 py-2.5">
                    <code className="flex-1 overflow-x-auto text-sm font-mono text-neutral-900 whitespace-nowrap">{newKey.webhook_secret}</code>
                    <button
                      onClick={() => copy(newKey.webhook_secret, "whsec")}
                      className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                    >
                      {copiedId === "whsec" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setNewKey(null)}
                className="mt-4 text-xs text-neutral-400 hover:text-neutral-600"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Credits */}
          {me && (
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="font-['Clash_Display'] text-xl font-bold text-neutral-900">Candidate credits</h2>
                  <p className="text-sm text-neutral-500">Each credit = 215 leads delivered</p>
                </div>
                <Link
                  to="/partners/checkout"
                  className="rounded-xl border-2 border-neutral-900 bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]"
                >
                  Buy more →
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-4 text-center">
                  <div className="font-['Clash_Display'] text-3xl font-bold text-violet-600">
                    {me.candidate_credits_remaining.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-neutral-500">Remaining</div>
                </div>
                <div className="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-4 text-center">
                  <div className="font-['Clash_Display'] text-3xl font-bold text-neutral-900">
                    {me.candidate_credits_used.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-neutral-500">Used</div>
                </div>
                <div className="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-4 text-center">
                  <div className="font-['Clash_Display'] text-3xl font-bold text-neutral-900">
                    {me.candidate_credits_total.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-neutral-500">Total purchased</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full overflow-hidden rounded-full border-2 border-neutral-900 bg-neutral-100">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all"
                  style={{ width: `${creditPct}%` }}
                />
              </div>
              <div className="mt-1 text-right text-xs text-neutral-400">{creditPct}% remaining</div>
            </div>
          )}

          {/* API Keys */}
          <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-['Clash_Display'] text-xl font-bold text-neutral-900">API keys</h2>
                <p className="text-sm text-neutral-500">Pass the key as X-API-Key header on every request.</p>
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="rounded-xl border-2 border-neutral-900 bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]"
              >
                + New key
              </button>
            </div>

            {showCreateForm && (
              <div className="mb-4 rounded-xl border-2 border-violet-300 bg-violet-50 p-4">
                <div className="mb-3 text-sm font-semibold text-neutral-700">Create new API key</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                    placeholder="e.g. Production, Staging"
                    className="flex-1 rounded-xl border-2 border-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"
                    onKeyDown={(e) => e.key === "Enter" && createKey()}
                  />
                  <button
                    onClick={createKey}
                    disabled={creatingKey}
                    className="rounded-xl border-2 border-neutral-900 bg-violet-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {creatingKey ? "Creating..." : "Create"}
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="rounded-xl border-2 border-neutral-300 px-3 py-2 text-sm text-neutral-600"
                  >
                    Cancel
                  </button>
                </div>
                {me && me.candidate_credits_remaining <= 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    You need at least 1 credit to create an API key.{" "}
                    <Link to="/partners/checkout" className="underline">Buy credits →</Link>
                  </p>
                )}
              </div>
            )}

            {keys.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-400">
                No API keys yet. Create one to start making requests.
              </div>
            ) : (
              <div className="space-y-3">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className={`flex items-center gap-4 rounded-xl border-2 px-4 py-3 ${
                      key.status === "active" ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 bg-neutral-100 opacity-60"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono font-semibold text-neutral-900">{key.prefix}••••••••</code>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            key.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-neutral-200 text-neutral-500"
                          }`}
                        >
                          {key.status}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-neutral-400">
                        {key.label} · Created {new Date(key.created_at).toLocaleDateString("en-IN")}
                        {key.last_used_at ? ` · Last used ${new Date(key.last_used_at).toLocaleDateString("en-IN")}` : ""}
                      </div>
                    </div>
                    {key.status === "active" && (
                      <button
                        onClick={() => revokeKey(key.id)}
                        disabled={revokingId === key.id}
                        className="shrink-0 rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        {revokingId === key.id ? "Revoking..." : "Revoke"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick start */}
          <div className="rounded-2xl border-2 border-neutral-900 bg-neutral-900 p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            <h2 className="mb-3 font-['Clash_Display'] text-xl font-bold text-white">Quick start</h2>
            <p className="mb-4 text-sm text-neutral-400">
              Fire your first job in under 60 seconds.
            </p>
            <pre className="overflow-x-auto rounded-xl border border-neutral-700 bg-neutral-800 p-4 text-xs text-green-300">
{`curl -X POST https://partners.studojo.com/api/v1/jobs \\
  -H "X-API-Key: sk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "candidate": {
      "name": "Rahul Mehta",
      "resume_profile": {
        "skills": ["Python", "FastAPI"],
        "experience_years": 2
      },
      "preferences": {
        "target_roles": ["Backend Engineer"],
        "target_locations": ["Bangalore"]
      }
    }
  }'`}
            </pre>
            <button
              onClick={() => setActiveTab("docs")}
              className="mt-4 inline-block rounded-xl border border-neutral-600 px-4 py-2 text-xs font-semibold text-neutral-300 hover:border-neutral-400 hover:text-white"
            >
              Full API reference →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
