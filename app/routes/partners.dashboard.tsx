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

function CB({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-4 rounded-xl border-2 border-neutral-800 bg-neutral-950 overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
        <span className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider">{lang}</span>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-xs text-neutral-400 hover:text-white transition-colors font-medium">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 text-[13px] text-green-300 leading-relaxed font-mono"><code>{code}</code></pre>
    </div>
  );
}

function Sec({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4 pb-14 mb-14 border-b-2 border-neutral-100 last:border-0">
      <h2 className="font-['Clash_Display'] text-2xl font-bold text-neutral-900 mb-1">{title}</h2>
      <div className="mb-6 h-0.5 w-12 bg-violet-500 rounded-full" />
      {children}
    </section>
  );
}

function H3({ children }: { children: ReactNode }) {
  return <h3 className="font-['Clash_Display'] text-lg font-bold text-neutral-900 mt-8 mb-3">{children}</h3>;
}

function Note({ children, color = "amber" }: { children: ReactNode; color?: "amber" | "violet" | "blue" }) {
  const cls = color === "violet"
    ? "border-violet-300 bg-violet-50 text-violet-800"
    : color === "blue"
    ? "border-blue-300 bg-blue-50 text-blue-800"
    : "border-amber-300 bg-amber-50 text-amber-800";
  return <div className={`mt-4 rounded-xl border-2 px-4 py-3 text-sm ${cls}`}>{children}</div>;
}

function Badge({ method }: { method: string }) {
  const cls: Record<string, string> = {
    POST: "bg-green-100 text-green-700 border-green-300",
    GET: "bg-blue-100 text-blue-700 border-blue-300",
    DELETE: "bg-red-100 text-red-700 border-red-300",
  };
  return <span className={`inline-block rounded border px-2.5 py-0.5 text-xs font-bold font-mono ${cls[method] ?? "bg-neutral-100 text-neutral-600"}`}>{method}</span>;
}

function SchemaTable({ rows }: { rows: { name: string; type: string; required?: boolean; desc: string }[] }) {
  return (
    <div className="rounded-xl border-2 border-neutral-200 overflow-hidden my-4">
      <div className="grid grid-cols-[180px_120px_1fr] gap-0 border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        <div>Field</div><div>Type</div><div>Description</div>
      </div>
      {rows.map((r) => (
        <div key={r.name} className="grid grid-cols-[180px_120px_1fr] gap-0 border-b border-neutral-100 px-4 py-3 text-sm last:border-0 hover:bg-neutral-50 transition-colors">
          <div className="flex items-start gap-1 pr-2">
            <code className="font-semibold text-violet-600 text-[13px] break-all">{r.name}</code>
            {r.required && <span className="shrink-0 mt-0.5 rounded bg-red-100 px-1 text-[9px] font-bold text-red-600 uppercase">req</span>}
          </div>
          <div className="text-[12px] text-neutral-400 font-mono pr-2 pt-0.5">{r.type}</div>
          <div className="text-neutral-600">{r.desc}</div>
        </div>
      ))}
    </div>
  );
}

function StatusTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="rounded-xl border-2 border-neutral-200 overflow-hidden my-4">
      <div className="grid grid-cols-[80px_160px_1fr] border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        <div>Status</div><div>Meaning</div><div>Cause</div>
      </div>
      {rows.map(([code, meaning, cause]) => (
        <div key={code} className="grid grid-cols-[80px_160px_1fr] border-b border-neutral-100 px-4 py-3 text-sm last:border-0">
          <code className="font-bold text-neutral-900">{code}</code>
          <span className="text-neutral-700">{meaning}</span>
          <span className="text-neutral-500">{cause}</span>
        </div>
      ))}
    </div>
  );
}

function InlineCode({ children }: { children: string }) {
  return <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[13px] font-mono text-neutral-800">{children}</code>;
}

function ApiDocs({ apiKey }: { apiKey: string | null }) {
  const nav = [
    { id: "overview", label: "Overview" },
    { id: "concepts", label: "Core Concepts" },
    { id: "auth", label: "Authentication" },
    { id: "quickstart", label: "Quickstart" },
    { id: "lifecycle", label: "Job Lifecycle" },
    { id: "create-job", label: "Create Job" },
    { id: "job-status", label: "Job Status" },
    { id: "job-results", label: "Job Results" },
    { id: "credits", label: "Credits" },
    { id: "request-schema", label: "Request Schema" },
    { id: "response-schema", label: "Response Schema" },
    { id: "intel-fields", label: "Intel Fields" },
    { id: "webhooks", label: "Webhooks" },
    { id: "errors", label: "Errors" },
    { id: "rate-limits", label: "Rate Limits" },
    { id: "best-practices", label: "Best Practices" },
    { id: "personas", label: "Example Personas" },
    { id: "sdk", label: "SDK Examples" },
    { id: "faq", label: "FAQ" },
    { id: "glossary", label: "Glossary" },
  ];

  const K = apiKey ? `sk_live_${apiKey}` : "sk_live_YOUR_KEY";

  return (
    <div className="flex h-[calc(100vh-112px)]">
      {/* Sidebar */}
      <aside className="hidden lg:block w-56 shrink-0 border-r-2 border-neutral-900 bg-white overflow-y-auto">
        <div className="p-5">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Studojo Partners</div>
          <div className="mb-4 text-[11px] text-neutral-400">API Reference v1</div>
          <nav className="space-y-px">
            {nav.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="flex items-center rounded-lg px-3 py-1.5 text-[13px] text-neutral-500 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 rounded-xl border-2 border-neutral-200 bg-neutral-50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Base URL</div>
            <code className="text-[11px] text-violet-600 break-all">partners.studojo.com/api/v1</code>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="mx-auto max-w-3xl px-10 py-10">

          <Sec id="overview" title="Overview">
            <p className="text-neutral-600 leading-relaxed mb-5">
              The Studojo Partners API is a career outreach intelligence engine. Given a structured candidate profile, it identifies the hiring authorities most relevant to that candidate and generates the context, reasoning, and copy needed to make contact.
            </p>
            <p className="text-neutral-600 leading-relaxed mb-6">
              Every result set is generated fresh. The output is not a contact list — it is a ranked, researched set of opportunities with pre-written outreach intelligence for each one.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Base URL", "partners.studojo.com"],
                ["Auth header", "X-API-Key"],
                ["Leads per run", "215 verified contacts"],
                ["Turnaround", "10–15 minutes"],
                ["Pricing", "1 credit per run"],
                ["Format", "JSON over HTTPS"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">{label}</div>
                  <div className="text-[13px] font-semibold text-neutral-800">{value}</div>
                </div>
              ))}
            </div>
            <H3>What the API delivers per run</H3>
            <ul className="space-y-2">
              {[
                ["200 ranked contacts", "Hiring authorities selected and ordered by compatibility with the candidate profile"],
                ["Verified contact details", "Email addresses verified at time of generation, included with each lead"],
                ["Per-lead outreach intelligence", "A connection point, outreach angle, timing rationale, and a specific suggested opening for each lead"],
                ["Signal rationale", "A plain-language explanation of the specific data behind each match"],
              ].map(([title, desc]) => (
                <li key={title as string} className="flex gap-3 rounded-xl border-2 border-neutral-100 px-4 py-3">
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  </span>
                  <div><span className="font-semibold text-neutral-900">{title}</span><span className="text-neutral-500"> — {desc}</span></div>
                </li>
              ))}
            </ul>
          </Sec>

          <Sec id="concepts" title="Core Concepts">
            {[
              ["The Candidate Profile", "A structured input describing the candidate's professional specialisation, skills, target roles, location, preferred company stage, and a signature project. The richer the profile — specifically the subdomain and flex_notes fields — the more precisely the API identifies compatible opportunities."],
              ["Hiring Authority Relevance", "The API identifies the specific individuals with the authority and organisational context to make a hiring decision for this candidate's profile. This requires reasoning about company size, structure, and stage — not just title matching."],
              ["Org-Stage Compatibility", "Companies at different funding stages hire differently. A very early-stage company's founder makes every hire personally. A later-stage company has formalised hiring infrastructure. The API models this — a lead's ranking reflects whether the specific person has the authority and accessibility to act."],
              ["Outreach Intelligence", "Each lead comes with five structured fields of pre-researched context synthesised from live company research — funding events, product direction, hiring signals, team composition — not generated from static profile pages."],
              ["Async Processing", "Each run requires live company research, multi-step compatibility analysis, and per-lead content generation. Jobs complete asynchronously within 10–15 minutes. The API returns a job_id immediately and exposes a status endpoint for tracking."],
            ].map(([title, desc]) => (
              <div key={title as string} className="mb-5 rounded-xl border-2 border-neutral-200 p-5">
                <div className="font-['Clash_Display'] font-bold text-neutral-900 mb-1">{title}</div>
                <p className="text-sm text-neutral-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </Sec>

          <Sec id="auth" title="Authentication">
            <p className="text-neutral-600 mb-4">All requests require your API key in the <InlineCode>X-API-Key</InlineCode> header. Keys are scoped to your account — credits are deducted from the account balance, not the key.</p>
            <CB lang="http" code={`X-API-Key: ${K}`} />
            <SchemaTable rows={[
              { name: "sk_live_", type: "prefix", desc: "Production key — live processing, credits consumed." },
              { name: "sk_test_", type: "prefix", desc: "Sandbox key — returns fixture data, no credits consumed, job completes in ~5 seconds." },
            ]} />
            <Note color="amber">Never include API keys in client-side code, URLs, or public repositories. Rotate immediately via the Dashboard if compromised.</Note>
          </Sec>

          <Sec id="quickstart" title="Quickstart">
            <p className="text-neutral-600 mb-5">Get your first result in under 20 minutes.</p>
            <div className="flex gap-3 mb-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 text-xs font-bold text-white">1</span>
              <div className="flex-1"><div className="font-semibold text-neutral-900 mb-1">Create a job</div>
            <CB lang="bash" code={`curl -X POST https://partners.studojo.com/api/v1/jobs \\
  -H "X-API-Key: ${K}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "candidate": {
      "name": "Aisha Mehta",
      "resume_profile": {
        "subdomain": "ML infrastructure and LLM fine-tuning for enterprise SaaS",
        "top_skills": ["PyTorch", "RLHF", "distributed training", "LLM evaluation"],
        "tech_stack": ["PyTorch", "Ray", "Kubernetes"],
        "target_industries": ["AI/ML", "B2B SaaS"],
        "seniority_signal": "mid",
        "experience_years": 3
      },
      "preferences": {
        "preferred_roles": ["ML Engineer", "AI Research Engineer"],
        "company_stage": "startup",
        "locations": ["Bengaluru"]
      },
      "flex_notes": {
        "best_project": "Built a distributed RLHF pipeline at Sarvam AI cutting fine-tuning cost by 40% on 7B models.",
        "outcome": "40% cost reduction, 3 enterprise deployments."
      }
    },
    "options": { "webhook_url": null }
  }'`} />
            <CB lang="json" code={`{ "job_id": "job_a1b2c3...", "status": "queued", "estimated_completion_seconds": 720 }`} />
            </div></div>
            <div className="flex gap-3 mb-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 text-xs font-bold text-white">2</span>
              <div className="flex-1"><div className="font-semibold text-neutral-900 mb-1">Poll for completion (every 30–60s)</div>
            <CB lang="bash" code={`curl https://partners.studojo.com/api/v1/jobs/job_a1b2c3... \\
  -H "X-API-Key: ${K}"`} />
            </div></div>
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 text-xs font-bold text-white">3</span>
              <div className="flex-1"><div className="font-semibold text-neutral-900 mb-1">Fetch results when status is completed</div>
            <CB lang="bash" code={`curl https://partners.studojo.com/api/v1/jobs/job_a1b2c3.../results \\
  -H "X-API-Key: ${K}"`} />
            </div></div>
          </Sec>

          <Sec id="lifecycle" title="Job Lifecycle">
            <p className="text-neutral-600 mb-5">Jobs move through a fixed set of states. Poll the status endpoint or use webhooks to track progress.</p>
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {["queued", "running", "completed / failed"].map((s, i, arr) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={`rounded-full border-2 px-3 py-1 text-xs font-semibold ${s.includes("completed") ? "border-green-400 bg-green-50 text-green-700" : s === "queued" ? "border-neutral-300 bg-neutral-100 text-neutral-600" : "border-violet-400 bg-violet-50 text-violet-700"}`}>{s}</span>
                  {i < arr.length - 1 && <span className="text-neutral-400 font-bold">→</span>}
                </div>
              ))}
            </div>
            <SchemaTable rows={[
              { name: "queued", type: "status", desc: "Job accepted and waiting for a processing slot." },
              { name: "running", type: "status", desc: "Actively processing — see stage field for the current phase." },
              { name: "completed", type: "status", desc: "Results are ready at /results." },
              { name: "failed", type: "status", desc: "Processing failed — see the error field for the reason." },
            ]} />
            <H3>Processing stages</H3>
            <SchemaTable rows={[
              { name: "discovering", type: "stage", desc: "Identifying relevant hiring authorities in the candidate's target geography and domain." },
              { name: "researching", type: "stage", desc: "Running live company research — funding history, product direction, open roles, team signals." },
              { name: "analysing", type: "stage", desc: "Computing compatibility across all discovered leads." },
              { name: "generating", type: "stage", desc: "Producing per-lead outreach intelligence." },
              { name: "verifying", type: "stage", desc: "Verifying and enriching contact details." },
            ]} />
            <Note>Use webhooks for production. Polling at 30–60 second intervals is fine for testing.</Note>
          </Sec>

          <Sec id="create-job" title="Create Job">
            <div className="flex items-center gap-3 mb-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3">
              <Badge method="POST" />
              <code className="text-sm font-semibold text-neutral-700">/api/v1/jobs</code>
            </div>
            <p className="text-neutral-600 mb-4">Submit a candidate profile to begin processing. Returns immediately with a <InlineCode>job_id</InlineCode>.</p>
            <CB lang="bash" code={`curl -X POST https://partners.studojo.com/api/v1/jobs \\
  -H "X-API-Key: ${K}" \\
  -H "Content-Type: application/json" \\
  -d '{ "candidate": { ... }, "options": { "webhook_url": null } }'`} />
            <H3>Response — 202 Accepted</H3>
            <CB lang="json" code={`{
  "job_id": "job_b3fd85429d544340b487562e167c1dfe",
  "status": "queued",
  "status_url": "/api/v1/jobs/job_b3fd85429d544340b487562e167c1dfe",
  "results_url": "/api/v1/jobs/job_b3fd85429d544340b487562e167c1dfe/results",
  "estimated_completion_seconds": 720
}`} />
            <SchemaTable rows={[
              { name: "job_id", type: "string", desc: "Unique job identifier. Prefix: job_. Store this — required for all subsequent requests." },
              { name: "status", type: "string", desc: 'Always "queued" at creation.' },
              { name: "status_url", type: "string", desc: "Relative path to the status endpoint." },
              { name: "results_url", type: "string", desc: "Relative path to the results endpoint." },
              { name: "estimated_completion_seconds", type: "int", desc: "Estimated time to completion. Not a guarantee." },
            ]} />
          </Sec>

          <Sec id="job-status" title="Job Status">
            <div className="flex items-center gap-3 mb-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3">
              <Badge method="GET" />
              <code className="text-sm font-semibold text-neutral-700">/api/v1/jobs/{"{job_id}"}</code>
            </div>
            <p className="text-neutral-600 mb-4">Returns the current state and processing stage of a job.</p>
            <CB lang="bash" code={`curl https://partners.studojo.com/api/v1/jobs/job_b3fd85... \\
  -H "X-API-Key: ${K}"`} />
            <CB lang="json" code={`{
  "job_id": "job_b3fd85429d544340b487562e167c1dfe",
  "status": "running",
  "stage": "researching",
  "started_at": "2026-06-01T07:00:00Z",
  "completed_at": null,
  "error": null
}`} />
            <SchemaTable rows={[
              { name: "status", type: "string", desc: '"queued" | "running" | "completed" | "failed"' },
              { name: "stage", type: "string|null", desc: "Current processing stage. Null when not actively running." },
              { name: "started_at", type: "string|null", desc: "ISO 8601 UTC timestamp when processing began." },
              { name: "completed_at", type: "string|null", desc: "ISO 8601 UTC timestamp when processing finished." },
              { name: "error", type: "string|null", desc: "Error reason if status is failed. Null otherwise." },
            ]} />
          </Sec>

          <Sec id="job-results" title="Job Results">
            <div className="flex items-center gap-3 mb-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3">
              <Badge method="GET" />
              <code className="text-sm font-semibold text-neutral-700">/api/v1/jobs/{"{job_id}"}/results</code>
            </div>
            <p className="text-neutral-600 mb-4">Returns the full ranked result set once <InlineCode>status</InlineCode> is <InlineCode>completed</InlineCode>. Each lead includes contact data, company context, and outreach intelligence.</p>
            <Note color="blue">Fetching results before the job completes returns <strong>409 Conflict</strong>. Fetching results for a failed job returns <strong>422</strong>.</Note>
            <CB lang="bash" code={`curl https://partners.studojo.com/api/v1/jobs/job_b3fd85.../results \\
  -H "X-API-Key: ${K}"`} />
            <CB lang="json" code={`{
  "job_id": "job_b3fd85429d544340b487562e167c1dfe",
  "candidate_name": "Aisha Mehta",
  "leads_returned": 200,
  "generated_at": "2026-06-01T07:12:34Z",
  "leads": [
    {
      "name": "Pratyush Kumar",
      "title": "Co-Founder & CTO",
      "company": "InferIQ",
      "company_domain": "inferiq.ai",
      "location": "Bengaluru, India",
      "linkedin_url": "https://linkedin.com/in/pratyushkumar",
      "email": "pratyush@inferiq.ai",
      "email_verified": true,
      "outreach_intel": {
        "connection_point": "InferIQ is building inference-time alignment tooling that requires the same preference-scoring infrastructure Aisha built at Sarvam AI.",
        "outreach_angle": "InferIQ is building alignment guardrails for LLM inference that validate output quality against preference criteria in real time. Aisha built Sarvam AI's RLHF evaluation harness and identified reward hacking patterns that invalidated two prior training runs.",
        "why_now": "InferIQ raised a $1.2M pre-seed in March 2026 and is actively hiring an ML Researcher.",
        "suggested_opening": "The way InferIQ is approaching preference validation at inference time caught my attention — I spent months building the exact evaluation harness for that problem at Sarvam.",
        "signal_rationale": "Open ML Researcher role confirmed; InferIQ's inference-time alignment product directly overlaps with the candidate's preference-learning evaluation work."
      }
    }
  ]
}`} />
          </Sec>

          <Sec id="credits" title="Credits">
            <div className="flex items-center gap-3 mb-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3">
              <Badge method="GET" />
              <code className="text-sm font-semibold text-neutral-700">/api/v1/credits</code>
            </div>
            <CB lang="bash" code={`curl https://partners.studojo.com/api/v1/credits \\
  -H "X-API-Key: ${K}"`} />
            <CB lang="json" code={`{
  "candidate_credits_total": 100,
  "candidate_credits_used": 3,
  "candidate_credits_remaining": 97,
  "price_per_candidate_inr": 1500,
  "leads_per_candidate": 200
}`} />
          </Sec>

          <Sec id="request-schema" title="Request Schema">
            <H3>candidate object</H3>
            <SchemaTable rows={[
              { name: "name", type: "string", required: true, desc: "Candidate's full name. Used in generated outreach copy." },
              { name: "resume_profile", type: "object", required: true, desc: "Structured professional profile. See below." },
              { name: "preferences", type: "object", required: true, desc: "Search constraints and role preferences. See below." },
              { name: "flex_notes", type: "object", desc: "Project and outcome context. Strongly recommended — highest impact on output quality." },
              { name: "dream_companies", type: "string[]", desc: "Company names to prioritise in ranking." },
            ]} />
            <H3>candidate.resume_profile</H3>
            <Note color="violet"><strong>subdomain is the most important field.</strong> The more specific, the better. "RLHF evaluation for production 7B parameter fine-tuning" produces far better results than "Machine Learning".</Note>
            <SchemaTable rows={[
              { name: "subdomain", type: "string", required: true, desc: "1–2 sentences describing the candidate's specific professional niche." },
              { name: "top_skills", type: "string[]", required: true, desc: "The candidate's strongest skills. Use specific terms, not categories. Up to 15." },
              { name: "tech_stack", type: "string[]", desc: "Technologies the candidate works with. Used for technical overlap analysis." },
              { name: "archetype_label", type: "string", desc: "One sentence describing the candidate's professional identity and standout credential." },
              { name: "target_industries", type: "string[]", desc: "Industries the candidate is targeting. Improves matching precision." },
              { name: "company_type_avoid", type: "string[]", desc: 'Company types to exclude (e.g. "IT services", "consulting", "FMCG").' },
              { name: "seniority_signal", type: "string", desc: '"junior" | "mid" | "senior". Calibrates hiring-authority targeting.' },
              { name: "experience_years", type: "int", desc: "Years of relevant experience." },
              { name: "builder_signal", type: "boolean", desc: "Whether the candidate has a track record of building products. Boosts compatibility with early-stage companies." },
              { name: "distribution_signal", type: "boolean", desc: "Whether the candidate has demonstrated GTM or growth ability." },
            ]} />
            <H3>candidate.preferences</H3>
            <SchemaTable rows={[
              { name: "preferred_roles", type: "string[]", required: true, desc: "Target role titles. Directly determines which hiring authorities are surfaced at each company." },
              { name: "locations", type: "string[]", required: true, desc: "Target cities or regions." },
              { name: "company_stage", type: "string", desc: '"startup" | "early" | "growth" | "enterprise" | "any". Default: "startup".' },
              { name: "niche_keywords", type: "string[]", desc: 'Additional search terms to narrow discovery — e.g. "AI-native", "seed stage".' },
              { name: "remote", type: "boolean", desc: "Whether to include remote-first companies. Default: false." },
            ]} />
            <H3>candidate.flex_notes</H3>
            <SchemaTable rows={[
              { name: "best_project", type: "string", desc: "1–3 sentences describing the candidate's most compelling project. Include what it did, how it was built, and what was technically hard." },
              { name: "outcome", type: "string", desc: "The measurable result — numbers, adoption, revenue. Anchors every suggested_opening and connection_point in the result set." },
            ]} />
            <H3>options object</H3>
            <SchemaTable rows={[
              { name: "webhook_url", type: "string|null", desc: "HTTPS URL to receive a POST when the job completes. Must use HTTPS." },
            ]} />
            <H3>Full example request</H3>
            <CB lang="json" code={`{
  "candidate": {
    "name": "Neel Madhavan",
    "resume_profile": {
      "location": "Bengaluru, India",
      "subdomain": "ML research and LLM evaluation infrastructure at foundation model labs",
      "top_skills": ["PyTorch", "RLHF", "LLM evaluation", "model distillation", "preference learning"],
      "tech_stack": ["PyTorch", "Ray", "Kubernetes", "Hugging Face"],
      "archetype_label": "ML researcher with 2 first-author papers on preference learning, previously at IISc and Sarvam AI.",
      "target_industries": ["AI/ML", "Foundation Models", "Developer Tools"],
      "company_type_avoid": ["IT services", "consulting", "FMCG"],
      "builder_signal": true,
      "seniority_signal": "mid",
      "experience_years": 3
    },
    "preferences": {
      "preferred_roles": ["ML Research Engineer", "AI Research Scientist", "LLM Engineer"],
      "company_stage": "startup",
      "locations": ["Bengaluru"],
      "niche_keywords": ["foundation model", "LLM", "research lab", "AI-native"]
    },
    "flex_notes": {
      "best_project": "Built a preference-learning evaluation harness at Sarvam AI benchmarking RLHF fine-tunes across 7B and 13B parameter models. Identified reward hacking patterns that invalidated two prior training runs.",
      "outcome": "3 production model deployments, 2 first-author papers under review."
    },
    "dream_companies": ["Sarvam AI", "Krutrim", "AI4Bharat"]
  },
  "options": {
    "webhook_url": "https://your-server.com/webhooks/studojo"
  }
}`} />
          </Sec>

          <Sec id="response-schema" title="Response Schema">
            <H3>Top-level result object</H3>
            <SchemaTable rows={[
              { name: "job_id", type: "string", desc: "Job identifier." },
              { name: "candidate_name", type: "string", desc: "Name from the original request." },
              { name: "leads_returned", type: "int", desc: "Number of leads in the leads array." },
              { name: "generated_at", type: "string", desc: "ISO 8601 UTC timestamp of result generation." },
              { name: "leads", type: "Lead[]", desc: "Ranked array of leads, highest compatibility first." },
            ]} />
            <H3>Lead object</H3>
            <SchemaTable rows={[
              { name: "name", type: "string", desc: "Lead's name." },
              { name: "title", type: "string", desc: "Lead's current job title." },
              { name: "company", type: "string", desc: "Company name." },
              { name: "company_domain", type: "string|null", desc: "Company website domain, when available." },
              { name: "location", type: "string|null", desc: "Lead's location, when available." },
              { name: "linkedin_url", type: "string|null", desc: "LinkedIn profile URL, when available." },
              { name: "email", type: "string|null", desc: "Verified email address." },
              { name: "email_verified", type: "boolean", desc: "Whether the email passed verification at time of generation." },
              { name: "outreach_intel", type: "OutreachIntel", desc: "Pre-researched outreach context. See Intel Fields." },
            ]} />
          </Sec>

          <Sec id="intel-fields" title="Intel Fields">
            <p className="text-neutral-600 mb-6">The <InlineCode>outreach_intel</InlineCode> object contains five structured fields of pre-researched context. Each serves a distinct purpose in the outreach workflow.</p>
            {[
              {
                field: "connection_point",
                label: "Connection Point",
                usage: "Reference when writing your own copy to stay grounded. Not designed for direct use in messages.",
                desc: "The single most direct professional overlap between this candidate and this company. One sentence, specific enough that it could not describe a different candidate or a different company.",
              },
              {
                field: "outreach_angle",
                label: "Outreach Angle",
                usage: "Use as the body of a short cold email, or paraphrase into a LinkedIn message. 50–130 words.",
                desc: "The core argument for engagement. 2–3 sentences: observation → overlap → stakes. Sentence 1: what this company is building or the precise problem they're solving. Sentence 2: the candidate's direct overlap. Sentence 3 (optional): why the specific lead is the right receiver.",
              },
              {
                field: "why_now",
                label: "Why Now",
                usage: "Include as a postscript, or weave into the message body. Check the date on funding references if the run is more than 2 weeks old.",
                desc: "What makes this moment the right time to reach out. Draws from live company research — a funding round with a date, a confirmed open role, a recent product launch, or a stage-based strategic observation.",
              },
              {
                field: "suggested_opening",
                label: "Suggested Opening",
                usage: "Use directly or edit for tone. If signal_rationale indicates thin company data, review before sending.",
                desc: "A complete first sentence ready to use in a cold email or LinkedIn message. Specific to this company — replacing the company name would require rewriting it entirely.",
              },
              {
                field: "signal_rationale",
                label: "Signal Rationale",
                usage: "Read before deciding how much to personalise. A rationale citing a confirmed open role warrants a highly personalised message. A title-only match warrants a lighter, exploratory message.",
                desc: "One sentence stating explicitly what data supported this match — and what was missing. Intentionally transparent about confidence level.",
              },
            ].map((item, i) => (
              <div key={item.field} className="mb-5 rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-neutral-900 bg-violet-100 text-xs font-bold text-violet-700">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <div className="font-['Clash_Display'] font-bold text-neutral-900">{item.label}</div>
                    <code className="text-xs text-violet-500">{item.field}</code>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-3">{item.desc}</p>
                <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs text-neutral-500">
                  <span className="font-semibold text-neutral-700">How to use:</span> {item.usage}
                </div>
              </div>
            ))}
          </Sec>

          <Sec id="webhooks" title="Webhooks">
            <p className="text-neutral-600 mb-5">Set <InlineCode>webhook_url</InlineCode> in your request options to receive a POST notification when the job completes. The payload does not include leads — fetch results separately.</p>
            <H3>On success</H3>
            <CB lang="json" code={`{
  "event": "job.completed",
  "job_id": "job_b3fd85429d544340b487562e167c1dfe",
  "status": "completed",
  "leads_returned": 200,
  "generated_at": "2026-06-01T07:12:34Z",
  "results_url": "https://partners.studojo.com/api/v1/jobs/job_b3fd85.../results"
}`} />
            <H3>On failure</H3>
            <CB lang="json" code={`{ "event": "job.failed", "job_id": "job_b3fd85...", "status": "failed", "error": "insufficient_leads_discovered" }`} />
            <H3>Signature verification</H3>
            <p className="text-neutral-600 mb-3">Every webhook includes a <InlineCode>Webhook-Signature</InlineCode> header. Verify it using your webhook secret and the <a href="https://www.standardwebhooks.com" target="_blank" rel="noreferrer" className="text-violet-600 underline">Standard Webhooks</a> spec.</p>
            <CB lang="python" code={`from standardwebhooks import Webhook

wh = Webhook("whsec_YOUR_WEBHOOK_SECRET")
wh.verify(request.body, {"webhook-signature": request.headers["Webhook-Signature"]})`} />
            <H3>Handler example (Express)</H3>
            <CB lang="javascript" code={`app.post("/webhooks/studojo", async (req, res) => {
  res.status(200).json({ received: true }); // respond immediately

  const { event, job_id } = req.body;
  if (event === "job.completed") {
    const results = await fetchResults(job_id);
    await saveToDatabase(job_id, results.leads);
  }
});`} />
            <Note>Respond with HTTP 200 within 10 seconds. Failed deliveries are retried 3 times with exponential backoff: 30s, 90s, 270s.</Note>
          </Sec>

          <Sec id="errors" title="Error Handling">
            <p className="text-neutral-600 mb-4">All errors return a consistent JSON body.</p>
            <CB lang="json" code={`{ "error": "invalid_api_key", "message": "The provided API key is not valid or has been revoked.", "status": 401 }`} />
            <StatusTable rows={[
              ["400", "invalid_request", "Malformed JSON or missing required fields."],
              ["401", "invalid_api_key", "API key missing or invalid."],
              ["403", "api_key_revoked", "API key has been revoked."],
              ["404", "job_not_found", "Job does not exist or belongs to a different key."],
              ["409", "job_not_completed", "Results requested before job has finished."],
              ["422", "job_failed", "Job completed with a processing error."],
              ["429", "rate_limit_exceeded", "Request rate limit hit. See Retry-After header."],
              ["500", "internal_error", "Unexpected server error. Retry with exponential backoff."],
              ["503", "service_unavailable", "Temporarily unavailable. Retry after 60 seconds."],
            ]} />
            <H3>Retry logic</H3>
            <CB lang="python" code={`def create_job_with_retry(payload, max_retries=3):
    for attempt in range(max_retries):
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in (500, 503):
            time.sleep(5 * (2 ** attempt))  # 5s, 10s, 20s
            continue
        response.raise_for_status()
        return response
    raise RuntimeError("Job creation failed after retries")`} />
          </Sec>

          <Sec id="rate-limits" title="Rate Limits">
            <StatusTable rows={[
              ["5 / key", "Concurrent active jobs", "Maximum parallel jobs per API key."],
              ["20 / min", "Job creation", "POST /jobs requests per API key per minute."],
              ["120 / min", "Status + results", "GET requests per API key per minute."],
            ]} />
            <p className="mt-3 text-sm text-neutral-500">When a rate limit is exceeded, the response includes a <InlineCode>Retry-After</InlineCode> header specifying seconds until the limit resets.</p>
          </Sec>

          <Sec id="best-practices" title="Best Practices">
            <H3>Writing an effective candidate profile</H3>
            <div className="space-y-3 mb-6">
              {[
                ["subdomain — highest leverage field", 'Write it as a specific professional niche, not a job title. "RLHF evaluation and reward modelling for production fine-tuning pipelines" produces far better results than "Machine Learning".'],
                ["preferred_roles — determines who gets surfaced", "The roles listed directly influence which hiring authority is identified at each company. Different roles produce very different lead sets even at the same company."],
                ["flex_notes — the difference between generic and specific copy", "Every suggested_opening and connection_point in the result set is anchored to flex_notes.best_project. Without it, copy is generic. With a specific project and metric, copy is specific enough to pass as genuinely researched."],
                ["company_type_avoid — prevents poor-fit noise", 'Always specify company types that would never be a fit. Common values: "IT services", "consulting", "outsourcing", "FMCG". These are excluded before ranking.'],
              ].map(([title, desc]) => (
                <div key={title as string} className="rounded-xl border-2 border-neutral-200 p-4">
                  <div className="font-semibold text-neutral-900 mb-1 text-sm">{title}</div>
                  <p className="text-sm text-neutral-600">{desc}</p>
                </div>
              ))}
            </div>
            <H3>Interpreting results</H3>
            <ul className="space-y-2 text-sm text-neutral-600">
              {[
                "The first 20–30 leads in the ranked list are the highest-priority contacts — start there.",
                "Always read signal_rationale before sending a highly personalised message. It tells you exactly what the basis for the match is.",
                "suggested_opening is a starting point — edit for your candidate's voice and communication style.",
                "why_now contains time-sensitive information. Verify funding references if the run is more than 2 weeks old.",
              ].map((t) => (
                <li key={t} className="flex gap-2"><span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full bg-violet-500" />{t}</li>
              ))}
            </ul>
          </Sec>

          <Sec id="personas" title="Example Personas">
            <p className="text-neutral-600 mb-5">Reference profiles showing effective use of the schema for different candidate types.</p>
            {[
              {
                title: "ML Researcher",
                code: `{
  "resume_profile": {
    "subdomain": "LLM fine-tuning and RLHF evaluation for production language model deployment",
    "top_skills": ["PyTorch", "RLHF", "preference learning", "distributed training"],
    "target_industries": ["AI/ML", "Foundation Models"]
  },
  "preferences": {
    "preferred_roles": ["ML Research Engineer", "AI Research Scientist"],
    "company_stage": "startup",
    "niche_keywords": ["foundation model", "research lab", "LLM-native"]
  }
}`,
              },
              {
                title: "Enterprise Sales Lead",
                code: `{
  "resume_profile": {
    "subdomain": "B2B enterprise sales for developer tools and technical infrastructure products",
    "top_skills": ["enterprise sales", "technical demos", "MEDDIC", "ARR growth"],
    "target_industries": ["B2B SaaS", "Developer Tools"]
  },
  "preferences": {
    "preferred_roles": ["Account Executive", "Enterprise Sales Lead"],
    "company_stage": "growth",
    "niche_keywords": ["developer tools", "Series A", "first sales hire"]
  }
}`,
              },
              {
                title: "Generalist Operator",
                code: `{
  "resume_profile": {
    "subdomain": "Zero-to-one product building, GTM execution, and cross-functional startup operations",
    "top_skills": ["product thinking", "outbound sales", "LLM product architecture", "organic growth"],
    "builder_signal": true,
    "distribution_signal": true
  },
  "preferences": {
    "preferred_roles": ["Founder's Associate", "AI Generalist", "GTM Lead"],
    "company_stage": "startup",
    "niche_keywords": ["seed stage", "founding team", "0-to-1"]
  }
}`,
              },
            ].map((p) => (
              <div key={p.title} className="mb-5">
                <div className="font-['Clash_Display'] font-bold text-neutral-700 mb-1">{p.title}</div>
                <CB lang="json" code={p.code} />
              </div>
            ))}
          </Sec>

          <Sec id="sdk" title="SDK Examples">
            <H3>Python</H3>
            <CB lang="python" code={`import time, requests

BASE_URL = "https://partners.studojo.com/api/v1"
headers = {"X-API-Key": "${K}", "Content-Type": "application/json"}

def create_job(candidate: dict, webhook_url: str = None) -> str:
    r = requests.post(f"{BASE_URL}/jobs", json={"candidate": candidate, "options": {"webhook_url": webhook_url}}, headers=headers)
    r.raise_for_status()
    return r.json()["job_id"]

def wait_for_job(job_id: str, poll_interval: int = 30, timeout: int = 1800) -> None:
    elapsed = 0
    while elapsed < timeout:
        data = requests.get(f"{BASE_URL}/jobs/{job_id}", headers=headers).json()
        if data["status"] == "completed": return
        if data["status"] == "failed": raise RuntimeError(f"Job failed: {data.get('error')}")
        print(f"  [{data.get('stage', 'queued')}] still processing...")
        time.sleep(poll_interval); elapsed += poll_interval
    raise TimeoutError(f"Job {job_id} did not complete within {timeout}s")

def get_results(job_id: str) -> dict:
    return requests.get(f"{BASE_URL}/jobs/{job_id}/results", headers=headers).json()

# Usage
job_id = create_job({"name": "Aisha Mehta", "resume_profile": { ... }, "preferences": { ... }})
wait_for_job(job_id)
results = get_results(job_id)
print(f"{results['leads_returned']} leads returned")`} />
            <H3>TypeScript</H3>
            <CB lang="typescript" code={`const BASE_URL = "https://partners.studojo.com/api/v1";
const headers = { "X-API-Key": "${K}", "Content-Type": "application/json" };

async function createJob(candidate: object, webhookUrl?: string): Promise<string> {
  const r = await fetch(\`\${BASE_URL}/jobs\`, {
    method: "POST", headers,
    body: JSON.stringify({ candidate, options: { webhook_url: webhookUrl ?? null } }),
  });
  if (!r.ok) throw new Error(\`Job creation failed: \${(await r.json()).message}\`);
  return (await r.json()).job_id;
}

async function waitForJob(jobId: string, pollMs = 30_000, timeoutMs = 1_800_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const status = await fetch(\`\${BASE_URL}/jobs/\${jobId}\`, { headers }).then(r => r.json());
    if (status.status === "completed") return;
    if (status.status === "failed") throw new Error(\`Job failed: \${status.error}\`);
    await new Promise(r => setTimeout(r, pollMs));
  }
  throw new Error(\`Job \${jobId} timed out\`);
}

async function getResults(jobId: string) {
  return fetch(\`\${BASE_URL}/jobs/\${jobId}/results\`, { headers }).then(r => r.json());
}`} />
            <H3>Running multiple candidates in parallel</H3>
            <CB lang="python" code={`import concurrent.futures

def run_candidate(candidate):
    job_id = create_job(candidate)
    wait_for_job(job_id)
    return get_results(job_id)

# API allows up to 5 concurrent jobs per key
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    all_results = list(pool.map(run_candidate, [candidate_a, candidate_b, candidate_c]))`} />
          </Sec>

          <Sec id="faq" title="FAQ">
            <div className="space-y-4">
              {[
                ["How does the API determine who to surface at each company?", "It identifies the individual with organisational authority to hire someone with the candidate's profile — which varies by company size, structure, and the specific roles listed. This is not simple title matching; it accounts for how authority is distributed at different stages."],
                ["Are results deterministic?", "No. Company research is live — job postings, funding announcements, and team signals change daily. Two runs with the same profile will return overlapping but not identical results. Rankings may shift as company momentum changes."],
                ["Can I run the same profile twice?", "Yes, and it is encouraged for active candidates. Re-running every 2–4 weeks refreshes company research and surfaces new leads as companies evolve. Handle deduplication between runs in your own system."],
                ["What geographies are supported?", "Major tech hubs — Bengaluru, Mumbai, Delhi NCR, Singapore, San Francisco, London, New York — have the best coverage. Results in smaller cities or niche geographies may be lower in volume."],
                ["How specific does the subdomain need to be?", "As specific as possible. The model uses subdomain to reason about which companies are genuinely compatible, not just broadly related. A vague subdomain produces a broader, less targeted result set."],
                ["What happens if there are not enough leads?", "For narrow geographies or niche specialisations, the discovery pool may be smaller. The API returns as many verified, qualified leads as it can find rather than padding with poor-quality matches. Adding locations, broadening target_industries, or relaxing company_stage improves yield."],
              ].map(([q, a]) => (
                <div key={q as string} className="rounded-xl border-2 border-neutral-200 p-5">
                  <div className="font-semibold text-neutral-900 mb-2">{q}</div>
                  <p className="text-sm text-neutral-600 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </Sec>

          <Sec id="glossary" title="Glossary">
            <div className="rounded-xl border-2 border-neutral-200 overflow-hidden">
              {[
                ["Candidate profile", "The structured input describing a candidate's skills, experience, preferences, and project context."],
                ["Connection point", "The most direct professional overlap between a candidate's specific work and a company's specific product or challenge."],
                ["Hiring authority", "The specific person at a company with the organisational authority to make a hiring decision for this candidate's profile."],
                ["Job", "An asynchronous processing run for one candidate profile."],
                ["Lead", "A specific person at a specific company, included in the ranked result set."],
                ["Org-stage compatibility", "The degree to which a company's size and funding stage match the candidate's preferred working environment."],
                ["Outreach intelligence", "The set of pre-researched, per-lead fields enabling specific, credible cold outreach."],
                ["Signal rationale", "A plain-language explanation of the specific data that supports a given match — including gaps in available information."],
                ["Subdomain", "A 1–2 sentence description of the candidate's specific professional niche. The most important input field for matching quality."],
                ["Webhook", "An HTTPS endpoint that receives a POST notification when a job completes."],
              ].map(([term, def]) => (
                <div key={term as string} className="flex gap-4 border-b border-neutral-100 px-5 py-3 last:border-0">
                  <div className="w-44 shrink-0 font-semibold text-neutral-900 text-sm">{term}</div>
                  <div className="text-sm text-neutral-600">{def}</div>
                </div>
              ))}
            </div>
          </Sec>

        </div>
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
