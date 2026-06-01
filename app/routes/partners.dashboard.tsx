import { useEffect, useState, useCallback, type ReactNode } from "react";
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

// ── API Docs component ─────────────────────────────────────────────────────────

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-xl border-2 border-neutral-800 bg-neutral-950 overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
        <span className="text-xs text-neutral-500 font-mono">{lang}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-xs text-neutral-400 hover:text-white transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs text-green-300 leading-relaxed"><code>{code}</code></pre>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 border-b-2 border-neutral-100 pb-12 mb-12">
      <h2 className="font-['Clash_Display'] text-2xl font-bold text-neutral-900 mb-6">{title}</h2>
      {children}
    </section>
  );
}

function EndpointBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    POST: "bg-green-100 text-green-700 border-green-300",
    GET: "bg-blue-100 text-blue-700 border-blue-300",
    DELETE: "bg-red-100 text-red-700 border-red-300",
  };
  return (
    <span className={`inline-block rounded border px-2 py-0.5 text-xs font-bold font-mono ${colors[method] ?? "bg-neutral-100 text-neutral-700"}`}>
      {method}
    </span>
  );
}

function Field({ name, type, required, desc }: { name: string; type: string; required?: boolean; desc: string }) {
  return (
    <div className="flex gap-4 border-b border-neutral-100 py-3 last:border-0">
      <div className="w-48 shrink-0">
        <code className="text-sm font-semibold text-violet-600">{name}</code>
        {required && <span className="ml-1 text-[10px] text-red-500 font-semibold">required</span>}
      </div>
      <div className="w-28 shrink-0 text-xs text-neutral-400 font-mono pt-0.5">{type}</div>
      <div className="text-sm text-neutral-600">{desc}</div>
    </div>
  );
}

function ApiDocs({ apiKey }: { apiKey: string | null }) {
  const nav = [
    { id: "overview", label: "Overview" },
    { id: "auth", label: "Authentication" },
    { id: "create-job", label: "Create Job" },
    { id: "job-status", label: "Job Status" },
    { id: "job-results", label: "Job Results" },
    { id: "credits", label: "Credits" },
    { id: "lead-object", label: "Lead Object" },
    { id: "webhooks", label: "Webhooks" },
    { id: "errors", label: "Errors" },
  ];

  const exampleKey = apiKey ? `sk_live_${apiKey.split("sk_live_")[1] ?? "YOUR_KEY"}` : "sk_live_YOUR_KEY";

  return (
    <div className="flex min-h-0">
      {/* Sidebar */}
      <aside className="hidden lg:block w-52 shrink-0 border-r-2 border-neutral-900 bg-white sticky top-0 h-[calc(100vh-112px)] overflow-y-auto">
        <div className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">API Reference</div>
          <nav className="space-y-0.5">
            {nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-lg px-3 py-1.5 text-sm text-neutral-600 hover:bg-violet-50 hover:text-violet-700 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8 max-w-3xl">

        <Section id="overview" title="Overview">
          <p className="text-neutral-600 mb-4">
            The Studojo B2B API discovers and delivers 200 verified hiring manager contacts for any given candidate profile. Each run performs live lead discovery, multi-signal scoring, web research, email enrichment, and AI-generated outreach intel — all within 10–15 minutes.
          </p>
          <div className="rounded-xl border-2 border-neutral-900 bg-neutral-50 px-5 py-4 space-y-2">
            <div className="flex gap-3 text-sm">
              <span className="font-semibold text-neutral-700 w-28">Base URL</span>
              <code className="text-violet-600">https://partners.studojo.com</code>
            </div>
            <div className="flex gap-3 text-sm">
              <span className="font-semibold text-neutral-700 w-28">Auth</span>
              <code className="text-violet-600">X-API-Key: sk_live_...</code>
            </div>
            <div className="flex gap-3 text-sm">
              <span className="font-semibold text-neutral-700 w-28">Leads per run</span>
              <span className="text-neutral-600">200 verified hiring managers</span>
            </div>
            <div className="flex gap-3 text-sm">
              <span className="font-semibold text-neutral-700 w-28">Turnaround</span>
              <span className="text-neutral-600">10–15 minutes per job</span>
            </div>
            <div className="flex gap-3 text-sm">
              <span className="font-semibold text-neutral-700 w-28">Pricing</span>
              <span className="text-neutral-600">1 credit per job (200 leads)</span>
            </div>
          </div>
        </Section>

        <Section id="auth" title="Authentication">
          <p className="text-neutral-600 mb-4">
            Every request must include your API key in the <code className="bg-neutral-100 px-1 rounded text-sm">X-API-Key</code> header. Keys are scoped to your account — credits are deducted from the account balance, not the key.
          </p>
          <CodeBlock lang="bash" code={`curl https://partners.studojo.com/api/v1/credits \\
  -H "X-API-Key: ${exampleKey}"`} />
          <p className="mt-4 text-sm text-neutral-500">
            Create and manage keys in the Dashboard tab. A key is shown once on creation — store it immediately.
          </p>
        </Section>

        <Section id="create-job" title="Create Job">
          <div className="flex items-center gap-3 mb-4">
            <EndpointBadge method="POST" />
            <code className="text-sm text-neutral-700">/api/v1/jobs</code>
          </div>
          <p className="text-neutral-600 mb-4">
            Submit a candidate profile to start a discovery run. The job runs asynchronously — poll <code className="bg-neutral-100 px-1 rounded text-sm">/api/v1/jobs/{"{job_id}"}</code> or wait for your webhook.
          </p>

          <h4 className="font-semibold text-neutral-900 mb-2 mt-6">Request body</h4>
          <div className="rounded-xl border-2 border-neutral-200 overflow-hidden mb-4">
            <Field name="candidate.name" type="string" required desc="Full name of the candidate." />
            <Field name="candidate.resume_profile" type="object" required desc="Structured resume data. Include as much detail as possible — richer profiles produce better-matched leads." />
            <Field name="candidate.resume_profile.skills" type="string[]" desc="Technical and domain skills (e.g. ['Python', 'FastAPI', 'AWS'])." />
            <Field name="candidate.resume_profile.experience_years" type="int" desc="Total years of work experience." />
            <Field name="candidate.resume_profile.education" type="string[]" desc="Degrees, institutions, graduation years." />
            <Field name="candidate.resume_profile.projects" type="string[]" desc="Notable projects or achievements. The more specific, the better the outreach intel." />
            <Field name="candidate.preferences" type="object" desc="Job search preferences used to filter and rank leads." />
            <Field name="candidate.preferences.target_roles" type="string[]" desc="Desired job titles (e.g. ['Backend Engineer', 'SWE'])." />
            <Field name="candidate.preferences.target_locations" type="string[]" desc="Cities or regions (e.g. ['Bangalore', 'Remote'])." />
            <Field name="candidate.preferences.target_industries" type="string[]" desc="Industry filters (e.g. ['Fintech', 'AI/ML'])." />
            <Field name="webhook_url" type="string" desc="If provided, Studojo will POST the completed results payload to this URL when the job finishes." />
          </div>

          <CodeBlock lang="bash" code={`curl -X POST https://partners.studojo.com/api/v1/jobs \\
  -H "X-API-Key: ${exampleKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "candidate": {
      "name": "Rahul Mehta",
      "resume_profile": {
        "skills": ["Python", "FastAPI", "PostgreSQL", "Redis"],
        "experience_years": 2,
        "education": ["B.Tech Computer Science, IIT Delhi, 2024"],
        "projects": [
          "Built a real-time analytics pipeline processing 500K events/day",
          "Open-source FastAPI auth library — 800 GitHub stars"
        ]
      },
      "preferences": {
        "target_roles": ["Backend Engineer", "Software Engineer"],
        "target_locations": ["Bangalore", "Remote"],
        "target_industries": ["Fintech", "SaaS", "AI/ML"]
      }
    },
    "webhook_url": "https://yourapp.com/webhooks/studojo"
  }'`} />

          <h4 className="font-semibold text-neutral-900 mb-2 mt-6">Response</h4>
          <CodeBlock lang="json" code={`{
  "job_id": "job_a1b2c3d4e5f6",
  "status": "queued",
  "created_at": "2026-06-01T07:00:00Z",
  "credits_used": 1,
  "credits_remaining": 49
}`} />
        </Section>

        <Section id="job-status" title="Job Status">
          <div className="flex items-center gap-3 mb-4">
            <EndpointBadge method="GET" />
            <code className="text-sm text-neutral-700">/api/v1/jobs/{"{job_id}"}</code>
          </div>
          <p className="text-neutral-600 mb-4">
            Poll this endpoint to track progress. Jobs typically move through <code className="bg-neutral-100 px-1 rounded text-sm">queued → running → completed</code> within 10–15 minutes.
          </p>

          <div className="rounded-xl border-2 border-neutral-200 overflow-hidden mb-4">
            <Field name="status" type="string" desc={`"queued" | "running" | "completed" | "failed"`} />
            <Field name="leads_found" type="int" desc="Number of leads discovered so far (increments during run)." />
            <Field name="progress_pct" type="int" desc="Estimated completion percentage (0–100)." />
            <Field name="completed_at" type="string | null" desc="ISO timestamp when the job finished, or null if still running." />
          </div>

          <CodeBlock lang="bash" code={`curl https://partners.studojo.com/api/v1/jobs/job_a1b2c3d4e5f6 \\
  -H "X-API-Key: ${exampleKey}"`} />

          <CodeBlock lang="json" code={`{
  "job_id": "job_a1b2c3d4e5f6",
  "status": "completed",
  "leads_found": 200,
  "progress_pct": 100,
  "created_at": "2026-06-01T07:00:00Z",
  "completed_at": "2026-06-01T07:12:34Z"
}`} />
        </Section>

        <Section id="job-results" title="Job Results">
          <div className="flex items-center gap-3 mb-4">
            <EndpointBadge method="GET" />
            <code className="text-sm text-neutral-700">/api/v1/jobs/{"{job_id}"}/results</code>
          </div>
          <p className="text-neutral-600 mb-4">
            Returns the full array of 200 leads once the job status is <code className="bg-neutral-100 px-1 rounded text-sm">completed</code>. Each lead includes contact data, company context, and AI-generated outreach intel.
          </p>

          <CodeBlock lang="bash" code={`curl https://partners.studojo.com/api/v1/jobs/job_a1b2c3d4e5f6/results \\
  -H "X-API-Key: ${exampleKey}"`} />

          <CodeBlock lang="json" code={`{
  "job_id": "job_a1b2c3d4e5f6",
  "total": 200,
  "leads": [
    {
      "rank": 1,
      "tier": "A",
      "name": "Priya Sharma",
      "title": "Co-founder & CTO",
      "company": "DataFlow AI",
      "email": "priya@dataflow.ai",
      "linkedin_url": "https://linkedin.com/in/priya-sharma",
      "company_size": "12",
      "company_stage": "Seed",
      "tech_stack": ["Python", "Kafka", "PostgreSQL"],
      "intel": {
        "connection_point": "DataFlow AI processes event streams at scale — directly overlapping with Rahul's real-time pipeline work.",
        "outreach_angle": "DataFlow is expanding its data infra team post-seed close. Rahul's pipeline architecture is a direct fit.",
        "why_now": "The company raised seed funding 6 weeks ago and posted 3 backend roles since — actively building the core team.",
        "suggested_opening": "DataFlow is building exactly the kind of event-driven infra I've been working on — I processed 500K events/day at my last project and the architecture overlap felt worth reaching out.",
        "signal_rationale": "Recent funding, 3 active backend postings, and direct tech stack overlap with candidate profile."
      }
    }
  ]
}`} />
          <p className="mt-3 text-sm text-neutral-500">
            See the Lead Object section below for the complete field reference.
          </p>
        </Section>

        <Section id="credits" title="Credits">
          <div className="flex items-center gap-3 mb-4">
            <EndpointBadge method="GET" />
            <code className="text-sm text-neutral-700">/api/v1/credits</code>
          </div>
          <p className="text-neutral-600 mb-4">
            Returns the current credit balance for the account linked to the API key.
          </p>
          <CodeBlock lang="bash" code={`curl https://partners.studojo.com/api/v1/credits \\
  -H "X-API-Key: ${exampleKey}"`} />
          <CodeBlock lang="json" code={`{
  "candidate_credits_total": 100,
  "candidate_credits_used": 3,
  "candidate_credits_remaining": 97,
  "price_per_candidate_inr": 1500,
  "leads_per_candidate": 200
}`} />
        </Section>

        <Section id="lead-object" title="Lead Object">
          <p className="text-neutral-600 mb-4">
            Every lead returned in the results array contains the following fields.
          </p>
          <div className="rounded-xl border-2 border-neutral-200 overflow-hidden mb-6">
            <Field name="rank" type="int" desc="Ordinal rank within this job (1 = highest relevance)." />
            <Field name="tier" type="string" desc={`Quality tier: "A" (top 10%), "B" (priority), "C" (qualified), "D" (long-tail).`} />
            <Field name="name" type="string" desc="Full name of the hiring manager." />
            <Field name="title" type="string" desc="Job title at the company." />
            <Field name="company" type="string" desc="Company name." />
            <Field name="email" type="string" desc="Verified work email address." />
            <Field name="linkedin_url" type="string | null" desc="LinkedIn profile URL when available." />
            <Field name="company_size" type="string" desc="Headcount range (e.g. '10–50')." />
            <Field name="company_stage" type="string" desc="Funding stage: Bootstrapped, Pre-seed, Seed, Series A, Series B+." />
            <Field name="tech_stack" type="string[]" desc="Technologies the company is known to use, inferred from public signals." />
            <Field name="intel.connection_point" type="string" desc="Why this specific hiring manager and this specific candidate belong in a conversation." />
            <Field name="intel.outreach_angle" type="string" desc="The strategic angle for the cold message — what to lead with." />
            <Field name="intel.why_now" type="string" desc="What makes the timing of outreach specifically right (hiring signals, funding, growth)." />
            <Field name="intel.suggested_opening" type="string" desc="A ready-to-use first-person opening sentence, written for this candidate and this company." />
            <Field name="intel.signal_rationale" type="string" desc="The evidence behind the lead's relevance — what signals drove the score." />
          </div>
        </Section>

        <Section id="webhooks" title="Webhooks">
          <p className="text-neutral-600 mb-4">
            Pass a <code className="bg-neutral-100 px-1 rounded text-sm">webhook_url</code> when creating a job. Studojo will POST the completed results payload to your URL immediately on job completion — no polling required.
          </p>

          <h4 className="font-semibold text-neutral-900 mb-2 mt-6">Payload</h4>
          <p className="text-sm text-neutral-500 mb-3">The webhook body is identical to the <code className="bg-neutral-100 px-1 rounded text-sm">GET /results</code> response.</p>
          <CodeBlock lang="json" code={`{
  "job_id": "job_a1b2c3d4e5f6",
  "event": "job.completed",
  "total": 200,
  "leads": [ ... ]
}`} />

          <h4 className="font-semibold text-neutral-900 mb-2 mt-6">Signature verification</h4>
          <p className="text-sm text-neutral-600 mb-3">
            Every webhook includes a <code className="bg-neutral-100 px-1 rounded text-sm">Webhook-Signature</code> header. Verify it using your webhook secret (shown once when you create an API key) and the <a href="https://www.standardwebhooks.com" target="_blank" rel="noreferrer" className="text-violet-600 underline">Standard Webhooks</a> spec.
          </p>
          <CodeBlock lang="python" code={`from standardwebhooks import Webhook

wh = Webhook("whsec_YOUR_WEBHOOK_SECRET")

# In your endpoint handler:
wh.verify(
    request.body,          # raw bytes
    {"webhook-signature": request.headers["Webhook-Signature"]}
)`} />

          <div className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Always respond with <code className="bg-amber-100 px-1 rounded">HTTP 200</code> within 10 seconds. Studojo retries failed deliveries up to 3 times with exponential backoff.
          </div>
        </Section>

        <Section id="errors" title="Errors">
          <p className="text-neutral-600 mb-4">
            All errors follow a consistent JSON structure.
          </p>
          <CodeBlock lang="json" code={`{ "detail": "No candidate credits remaining. Purchase credits at partners.studojo.com." }`} />
          <div className="mt-4 rounded-xl border-2 border-neutral-200 overflow-hidden">
            <div className="grid grid-cols-3 gap-4 border-b border-neutral-100 px-4 py-2 text-xs font-semibold uppercase text-neutral-400">
              <div>Status</div><div>Meaning</div><div>Common cause</div>
            </div>
            {[
              ["401", "Unauthorized", "Missing, invalid, or revoked API key."],
              ["402", "Payment Required", "No candidate credits remaining on the account."],
              ["422", "Validation Error", "Missing required fields or invalid candidate data."],
              ["429", "Rate Limited", "Too many concurrent jobs. Retry after a short delay."],
              ["502", "Gateway Error", "Transient upstream failure. Safe to retry."],
            ].map(([code, meaning, cause]) => (
              <div key={code} className="grid grid-cols-3 gap-4 border-b border-neutral-100 px-4 py-3 text-sm last:border-0">
                <code className="font-semibold text-neutral-900">{code}</code>
                <span className="text-neutral-700">{meaning}</span>
                <span className="text-neutral-500">{cause}</span>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}

export default function PartnersDashboard() {
  const navigate = useNavigate();
  // Stabilise with useState — getStoredUser() does JSON.parse and returns a new
  // object on every call, so calling it directly causes an infinite useEffect loop.
  const [storedUser] = useState(getStoredUser);
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
  }, [load]); // storedUser/navigate are stable refs — omitting prevents re-trigger on object identity change

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
        <ApiDocs apiKey={keys.find((k) => k.status === "active")?.prefix ?? null} />
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
                  <p className="text-sm text-neutral-500">Each credit = 200 leads delivered</p>
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
