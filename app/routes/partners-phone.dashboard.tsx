import { useEffect, useState, useCallback, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { phonePartnersGet, phonePartnersPost, phonePartnersDelete, clearToken, getStoredUser } from "~/lib/partnersPhone/api";
import type { Route } from "./+types/partners-phone.dashboard";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard | Studojo Phone API" }];
}

interface Me {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone_credits_total: number;
  phone_credits_used: number;
  phone_credits_remaining: number;
}

interface ApiKey {
  id: string;
  key_prefix: string;
  label: string;
  status: string;
  created_at: string;
  burst_rps: number;
  daily_job_quota: number;
  concurrent_job_cap: number;
}

interface NewKeyData {
  id: string;
  raw_key: string;
  prefix: string;
  webhook_secret: string;
}

// ── API Docs helper components ─────────────────────────────────────────────────

function CB({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-4 rounded-xl border-2 border-neutral-800 bg-neutral-950 overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
        <span className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider">{lang}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-xs text-neutral-400 hover:text-white transition-colors font-medium"
        >
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
  const cls =
    color === "violet" ? "border-violet-300 bg-violet-50 text-violet-800"
    : color === "blue" ? "border-blue-300 bg-blue-50 text-blue-800"
    : "border-amber-300 bg-amber-50 text-amber-800";
  return <div className={`mt-4 rounded-xl border-2 px-4 py-3 text-sm ${cls}`}>{children}</div>;
}

function Badge({ method }: { method: string }) {
  const cls: Record<string, string> = {
    POST: "bg-green-100 text-green-700 border-green-300",
    GET: "bg-blue-100 text-blue-700 border-blue-300",
    DELETE: "bg-red-100 text-red-700 border-red-300",
  };
  return (
    <span className={`inline-block rounded border px-2.5 py-0.5 text-xs font-bold font-mono ${cls[method] ?? "bg-neutral-100 text-neutral-600"}`}>
      {method}
    </span>
  );
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

// ── API Docs ───────────────────────────────────────────────────────────────────

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
    { id: "match-scores", label: "Match Scores" },
    { id: "intel-fields", label: "Intel Fields" },
    { id: "webhooks", label: "Webhooks" },
    { id: "errors", label: "Errors" },
    { id: "rate-limits", label: "Rate Limits" },
    { id: "best-practices", label: "Best Practices" },
    { id: "sdk", label: "SDK Examples" },
    { id: "faq", label: "FAQ" },
  ];

  const BASE = "studojo.com/partners/phone";
  const K = apiKey ?? "sk_phone_YOUR_KEY";

  return (
    <div className="flex h-[calc(100vh-112px)]">
      {/* Sidebar */}
      <aside className="hidden lg:block w-56 shrink-0 border-r-2 border-neutral-900 bg-white overflow-y-auto">
        <div className="p-5">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Studojo Phone API</div>
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
            <code className="text-[11px] text-violet-600 break-all">{BASE}/api/v1</code>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="mx-auto max-w-3xl px-10 py-10">

          <Sec id="overview" title="Overview">
            <p className="text-neutral-600 leading-relaxed mb-5">
              The Studojo Phone API is a hiring intelligence engine that delivers direct phone numbers and verified emails for hiring managers — plus personalised AI-generated outreach context for each one.
            </p>
            <p className="text-neutral-600 leading-relaxed mb-6">
              Submit a candidate profile. Get back 25 ranked hiring authorities with phone numbers, emails, career match analysis, and ready-to-use outreach intel — in under 5 minutes.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Base URL", `${BASE}/api/v1`],
                ["Auth header", "X-Phone-API-Key"],
                ["Leads per run", "25 verified contacts"],
                ["Turnaround", "~3 minutes"],
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
                ["25 ranked contacts", "Hiring authorities selected and scored for compatibility with the candidate profile"],
                ["Phone + email per lead", "A verified direct phone number and work email address for each contact"],
                ["Per-lead outreach intel", "Connection point, outreach angle, timing rationale, and a suggested opening for each lead"],
                ["Match scores", "Career match %, authority match %, hiring probability, and career category per lead"],
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
              ["The Candidate Profile", "A structured input describing the candidate's professional specialisation, target roles, location, company preferences, and a signature project. The richer the profile — particularly subdomain and flex_notes — the more precisely the API identifies compatible hiring authorities."],
              ["Career Path Graph", "Each lead's title is mapped to a career category (founder, coo, chief_of_staff, strategy_ops, tech_domain_leader, etc.) with a base hiring probability. This drives both scoring and the match_scores output."],
              ["Hiring Authority Relevance", "The API identifies specific individuals with the authority and organisational context to act on a candidate's profile. This requires reasoning about company size, stage, and decision-making structure — not just title matching."],
              ["Outreach Intelligence", "Each lead comes with five structured fields of pre-researched context synthesised from live company research — not static profile scraping. Funding events, product direction, team signals, and hiring indicators are used."],
              ["Async Processing", "Jobs complete asynchronously in ~3 minutes. The API returns a job_id immediately. Poll the status endpoint or configure a webhook to receive results."],
            ].map(([title, desc]) => (
              <div key={title as string} className="mb-5 rounded-xl border-2 border-neutral-200 p-5">
                <div className="font-['Clash_Display'] font-bold text-neutral-900 mb-1">{title}</div>
                <p className="text-sm text-neutral-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </Sec>

          <Sec id="auth" title="Authentication">
            <p className="text-neutral-600 mb-4">
              All job requests require your API key in the <InlineCode>X-Phone-API-Key</InlineCode> header. Keys are account-scoped — credits are deducted from your account balance.
            </p>
            <CB lang="http" code={`X-Phone-API-Key: ${K}`} />
            <Note color="amber">Never include API keys in client-side code, URLs, or public repositories. Rotate immediately via the Dashboard if compromised.</Note>
          </Sec>

          <Sec id="quickstart" title="Quickstart">
            <p className="text-neutral-600 mb-5">Get your first result in under 5 minutes.</p>

            <div className="flex gap-3 mb-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 text-xs font-bold text-white">1</span>
              <div className="flex-1">
                <div className="font-semibold text-neutral-900 mb-1">Submit a job</div>
                <CB lang="bash" code={`curl -X POST https://${BASE}/api/v1/phone-jobs \\
  -H "X-Phone-API-Key: ${K}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Arjun Rao",
    "preferences": {
      "preferred_roles": ["Chief of Staff", "Strategy & Operations"],
      "company_stage": "startup",
      "locations": ["Bengaluru"],
      "archetype": "founder_office"
    },
    "resume_profile": {
      "subdomain": "Founder-adjacent strategy and operations for early-stage startups",
      "top_skills": ["strategic ops", "fundraising support", "0-to-1 execution"],
      "seniority_signal": "mid",
      "experience_years": 4
    },
    "flex_notes": {
      "best_project": "Led Series A data room prep and investor pipeline at a B2B SaaS startup.",
      "outcome": "Closed $4M round in 6 weeks."
    }
  }'`} />
                <CB lang="json" code={`{ "job_id": "phjob_a1b2c3...", "status": "queued", "estimated_seconds": 180 }`} />
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 text-xs font-bold text-white">2</span>
              <div className="flex-1">
                <div className="font-semibold text-neutral-900 mb-1">Poll for completion (every 15–30s)</div>
                <CB lang="bash" code={`curl https://${BASE}/api/v1/phone-jobs/phjob_a1b2c3... \\
  -H "X-Phone-API-Key: ${K}"`} />
                <CB lang="json" code={`{ "job_id": "phjob_a1b2c3...", "status": "completed", "lead_count": 25, "completed_at": "2026-06-17T10:23:41Z" }`} />
              </div>
            </div>

            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 text-xs font-bold text-white">3</span>
              <div className="flex-1">
                <div className="font-semibold text-neutral-900 mb-1">Fetch results</div>
                <CB lang="bash" code={`curl https://${BASE}/api/v1/phone-jobs/phjob_a1b2c3.../results \\
  -H "X-Phone-API-Key: ${K}"`} />
              </div>
            </div>
          </Sec>

          <Sec id="lifecycle" title="Job Lifecycle">
            <p className="text-neutral-600 mb-5">Jobs move through a fixed set of states. Poll or use webhooks.</p>
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {["queued", "running", "completed / failed"].map((s, i, arr) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={`rounded-full border-2 px-3 py-1 text-xs font-semibold ${s.includes("completed") ? "border-green-400 bg-green-50 text-green-700" : s === "queued" ? "border-neutral-300 bg-neutral-100 text-neutral-600" : "border-violet-400 bg-violet-50 text-violet-700"}`}>{s}</span>
                  {i < arr.length - 1 && <span className="text-neutral-400 font-bold">→</span>}
                </div>
              ))}
            </div>
            <SchemaTable rows={[
              { name: "queued", type: "string", desc: "Job accepted, waiting for a worker slot. Typically under 10 seconds." },
              { name: "running", type: "string", desc: "Lead discovery, scoring, web research, and enrichment in progress." },
              { name: "completed", type: "string", desc: "All 25 leads ready. Fetch results from the /results endpoint." },
              { name: "failed", type: "string", desc: "Job failed — check error_message on the status response." },
            ]} />
          </Sec>

          <Sec id="create-job" title="Create Job">
            <div className="mb-3 flex items-center gap-3">
              <Badge method="POST" />
              <code className="text-sm text-neutral-700">/api/v1/phone-jobs</code>
            </div>
            <p className="text-neutral-600 mb-4">Submit a candidate profile to start a phone lead generation job. Deducts 1 credit from your account.</p>
            <CB lang="bash" code={`curl -X POST https://${BASE}/api/v1/phone-jobs \\
  -H "X-Phone-API-Key: ${K}" \\
  -H "Content-Type: application/json" \\
  -d '{ ... }'`} />
            <H3>Request body</H3>
            <SchemaTable rows={[
              { name: "name", type: "string", required: true, desc: "Candidate's full name." },
              { name: "preferences", type: "object", required: true, desc: "Targeting preferences: preferred_roles, company_stage, locations, archetype, company_type_avoid." },
              { name: "resume_profile", type: "object", required: true, desc: "Professional profile: subdomain, top_skills, tech_stack, seniority_signal, experience_years, target_industries." },
              { name: "dream_companies", type: "string[]", desc: "Optional list of specific company names to always include if found." },
              { name: "flex_notes", type: "object", desc: "Freeform signals: best_project, outcome, additional_context. Strongly recommended for quality." },
              { name: "options", type: "object", desc: "Job options: webhook_url (string or null)." },
            ]} />
            <Note color="violet">
              <strong>Quality tip:</strong> The <InlineCode>subdomain</InlineCode> and <InlineCode>flex_notes.best_project</InlineCode> fields have the highest impact on lead relevance. A vague subdomain ("software engineer") returns generic results. A specific one ("LLM fine-tuning for enterprise SaaS at Series A startups") drives precision targeting.
            </Note>
          </Sec>

          <Sec id="job-status" title="Job Status">
            <div className="mb-3 flex items-center gap-3">
              <Badge method="GET" />
              <code className="text-sm text-neutral-700">/api/v1/phone-jobs/{"{job_id}"}</code>
            </div>
            <p className="text-neutral-600 mb-4">Returns the current status of a job. Poll every 15–30 seconds.</p>
            <CB lang="bash" code={`curl https://${BASE}/api/v1/phone-jobs/phjob_a1b2c3... \\
  -H "X-Phone-API-Key: ${K}"`} />
            <CB lang="json" code={`{
  "job_id": "phjob_a1b2c3...",
  "status": "completed",
  "lead_count": 25,
  "created_at": "2026-06-17T10:20:00Z",
  "completed_at": "2026-06-17T10:23:41Z",
  "error_message": null
}`} />
          </Sec>

          <Sec id="job-results" title="Job Results">
            <div className="mb-3 flex items-center gap-3">
              <Badge method="GET" />
              <code className="text-sm text-neutral-700">/api/v1/phone-jobs/{"{job_id}"}/results</code>
            </div>
            <p className="text-neutral-600 mb-4">Returns the full result payload when status is <InlineCode>completed</InlineCode>. Returns 404 if the job is still running.</p>
            <CB lang="bash" code={`curl https://${BASE}/api/v1/phone-jobs/phjob_a1b2c3.../results \\
  -H "X-Phone-API-Key: ${K}"`} />
            <CB lang="json" code={`{
  "job_id": "phjob_a1b2c3...",
  "leads": [
    {
      "name": "Rohan Verma",
      "title": "Co-Founder & CEO",
      "company": "Vernacular AI",
      "phone": "+91 98765 43210",
      "email": "rohan@vernacular.ai",
      "linkedin_url": "https://linkedin.com/in/rohanverma",
      "location": "Bengaluru, Karnataka, India",
      "overall_score": 87.3,
      "match_scores": {
        "career_match": 92,
        "authority_match": 100,
        "hiring_probability": 88,
        "career_category": "founder"
      },
      "outreach_intel": {
        "connection_point": "...",
        "outreach_angle": "...",
        "why_now": "...",
        "suggested_opening": "...",
        "signal_rationale": "...",
        "hiring_probability_rationale": "..."
      }
    }
  ],
  "lead_count": 25,
  "completed_at": "2026-06-17T10:23:41Z"
}`} />
          </Sec>

          <Sec id="credits" title="Credits">
            <p className="text-neutral-600 mb-4">Each job submission deducts 1 credit from your account. Credits are checked at submission time — if your balance is 0 the request returns <InlineCode>402 Payment Required</InlineCode>.</p>
            <SchemaTable rows={[
              { name: "phone_credits_total", type: "integer", desc: "Total credits ever purchased." },
              { name: "phone_credits_used", type: "integer", desc: "Credits consumed by completed jobs." },
              { name: "phone_credits_remaining", type: "integer", desc: "Available credits. Must be > 0 to submit a new job." },
            ]} />
            <CB lang="bash" code={`# Check your balance
curl https://${BASE}/api/v1/phone/partners/me \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`} />
            <Note color="blue">Credits never expire. There is no subscription, no renewal, no seat limit.</Note>
          </Sec>

          <Sec id="request-schema" title="Request Schema">
            <H3>preferences object</H3>
            <SchemaTable rows={[
              { name: "preferred_roles", type: "string[]", required: true, desc: 'Target job titles. E.g. ["Chief of Staff", "VP Operations"].' },
              { name: "company_stage", type: "string", required: true, desc: '"startup", "growth", "enterprise", or "any".' },
              { name: "locations", type: "string[]", required: true, desc: 'Target city/region. E.g. ["Bengaluru", "Mumbai"].' },
              { name: "archetype", type: "string", desc: '"founder_office" (default for strategy/ops/chief-of-staff roles) or "general".' },
              { name: "company_type_avoid", type: "string[]", desc: 'Company types to hard-exclude. E.g. ["agency", "education", "consulting"].' },
            ]} />
            <H3>resume_profile object</H3>
            <SchemaTable rows={[
              { name: "subdomain", type: "string", required: true, desc: "1–2 sentence professional specialisation. The most important field for quality targeting." },
              { name: "top_skills", type: "string[]", required: true, desc: "3–8 key skills." },
              { name: "seniority_signal", type: "string", desc: '"junior", "mid", "senior", "lead".' },
              { name: "experience_years", type: "integer", desc: "Total years of professional experience." },
              { name: "tech_stack", type: "string[]", desc: "Technologies if relevant." },
              { name: "target_industries", type: "string[]", desc: 'Preferred sectors. E.g. ["B2B SaaS", "Fintech"].' },
            ]} />
            <H3>flex_notes object</H3>
            <SchemaTable rows={[
              { name: "best_project", type: "string", desc: "One specific high-impact project with concrete context. Strongly influences outreach intel quality." },
              { name: "outcome", type: "string", desc: "Measurable outcome from best_project." },
              { name: "additional_context", type: "string", desc: "Any other signals the outreach should reflect." },
            ]} />
          </Sec>

          <Sec id="response-schema" title="Response Schema">
            <p className="text-neutral-600 mb-4">Each object in the <InlineCode>leads</InlineCode> array:</p>
            <SchemaTable rows={[
              { name: "name", type: "string", desc: "Lead's full name." },
              { name: "title", type: "string", desc: "Current job title." },
              { name: "company", type: "string", desc: "Company name." },
              { name: "phone", type: "string | null", desc: "Verified direct phone number. May be null if enrichment could not resolve." },
              { name: "email", type: "string | null", desc: "Verified work email address." },
              { name: "linkedin_url", type: "string | null", desc: "LinkedIn profile URL." },
              { name: "location", type: "string | null", desc: "Location string returned by Apollo." },
              { name: "overall_score", type: "float", desc: "Composite heuristic relevance score (0–100)." },
              { name: "match_scores", type: "object", desc: "Sub-score breakdown. See Match Scores section." },
              { name: "outreach_intel", type: "object", desc: "5-field AI-generated outreach intelligence. See Intel Fields section." },
            ]} />
          </Sec>

          <Sec id="match-scores" title="Match Scores">
            <p className="text-neutral-600 mb-4">
              The <InlineCode>match_scores</InlineCode> object provides per-dimension scoring for each lead. Use these to filter, sort, or explain matches to your end users.
            </p>
            <SchemaTable rows={[
              { name: "career_match", type: "integer", desc: "0–100. Title relevance to the candidate's preferred roles." },
              { name: "authority_match", type: "integer", desc: "0–100. Seniority and decision-making authority score." },
              { name: "hiring_probability", type: "integer", desc: "0–100. Estimated probability this person would act on a strong candidate. Blends a heuristic Career Path score with an LLM adjustment (±10)." },
              { name: "career_category", type: "string", desc: '"founder", "coo", "chief_of_staff", "strategy_ops", "tech_domain_leader", "function_mismatch", or "other". Maps to the Career Path Graph.' },
            ]} />
            <Note color="violet">
              <strong>Career categories explained:</strong> founder (95 base HP) → direct hiring authority at early-stage companies. coo (88) → operational hiring authority. chief_of_staff (85) → high-access role with direct founder visibility. strategy_ops (80) → adjacent to decision-making. tech_domain_leader (50) → owns a domain but may not hire. function_mismatch (12) → wrong function for this archetype.
            </Note>
          </Sec>

          <Sec id="intel-fields" title="Intel Fields">
            <p className="text-neutral-600 mb-4">
              Every lead includes an <InlineCode>outreach_intel</InlineCode> object with six fields generated by AI from live company research.
            </p>
            <SchemaTable rows={[
              { name: "connection_point", type: "string", desc: "Why this specific lead and this specific candidate belong in a conversation." },
              { name: "outreach_angle", type: "string", desc: "The strategic angle for the cold call or email." },
              { name: "why_now", type: "string", desc: "What makes this timing specifically right — based on company signals." },
              { name: "suggested_opening", type: "string", desc: "A first-person opening sentence ready to paste into a call script or email." },
              { name: "signal_rationale", type: "string", desc: "Plain-language evidence behind the lead's relevance score." },
              { name: "hiring_probability_rationale", type: "string", desc: "LLM explanation for why the hiring_probability score was adjusted up or down from the heuristic base." },
            ]} />
          </Sec>

          <Sec id="webhooks" title="Webhooks">
            <p className="text-neutral-600 mb-4">
              Set <InlineCode>options.webhook_url</InlineCode> in the job request. Studojo will send a <InlineCode>POST</InlineCode> to your URL when the job completes with the full result payload.
            </p>
            <CB lang="json" code={`{
  "event": "phone_job.completed",
  "job_id": "phjob_a1b2c3...",
  "lead_count": 25,
  "leads": [ ... ]
}`} />
            <H3>Verifying webhook signatures</H3>
            <p className="text-neutral-600 mb-2">Each delivery includes a <InlineCode>webhook-signature</InlineCode> header. Verify it using your webhook secret (shown once at key creation).</p>
            <CB lang="python" code={`from standardwebhooks import Webhook

wh = Webhook(WEBHOOK_SECRET)
wh.verify(raw_body_bytes, {"webhook-signature": request.headers["webhook-signature"]})`} />
          </Sec>

          <Sec id="errors" title="Errors">
            <p className="text-neutral-600 mb-4">All errors return JSON with a <InlineCode>detail</InlineCode> field.</p>
            <StatusTable rows={[
              ["400", "Bad request", "Invalid request body or failed validation."],
              ["401", "Unauthorized", "Missing or invalid X-Phone-API-Key."],
              ["402", "Payment required", "Insufficient credits. Buy more via /partners/phone/checkout."],
              ["404", "Not found", "Job ID does not exist or results not yet available."],
              ["429", "Rate limited", "Too many requests. See rate limits."],
              ["500", "Server error", "Unexpected error. Retry with exponential backoff."],
            ]} />
          </Sec>

          <Sec id="rate-limits" title="Rate Limits">
            <p className="text-neutral-600 mb-4">Default limits per API key:</p>
            <SchemaTable rows={[
              { name: "burst_rps", type: "integer", desc: "Maximum requests per second. Default: 5." },
              { name: "daily_job_quota", type: "integer", desc: "Maximum jobs per calendar day. Default: 1,000." },
              { name: "concurrent_job_cap", type: "integer", desc: "Maximum simultaneous running jobs. Default: 5." },
            ]} />
            <Note>Limits are configurable per key. Contact support to adjust for bulk use cases.</Note>
          </Sec>

          <Sec id="best-practices" title="Best Practices">
            {[
              ["Use a specific subdomain", "\"Full-stack engineer at Series A B2B SaaS\" beats \"software engineer\" every time. Be specific about the niche."],
              ["Include flex_notes", "The best_project field is used verbatim in per-lead outreach intel. A concrete example with a quantified outcome dramatically improves output quality."],
              ["Use archetype: founder_office for non-technical roles", "Chief of Staff, Strategy & Ops, and BizDev roles targeting early-stage companies should always use archetype: founder_office to activate the Career Path Graph correctly."],
              ["Use company_type_avoid for clean results", "Pass [\"agency\", \"education\", \"consulting\"] if your candidate does not want those environments. These are hard-excluded, not just down-ranked."],
              ["Poll with 15–30s intervals", "Jobs typically complete in 2–4 minutes. Polling more frequently is wasted — use webhooks for production workloads."],
              ["Handle null phone gracefully", "Phone numbers are enriched from Apollo. A small percentage of leads may return phone: null — always check before dialing."],
            ].map(([title, desc]) => (
              <div key={title as string} className="mb-4 flex gap-3 rounded-xl border-2 border-neutral-100 px-5 py-4">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-violet-100 flex items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                </span>
                <div>
                  <span className="font-semibold text-neutral-900">{title}</span>
                  <span className="text-neutral-500"> — {desc}</span>
                </div>
              </div>
            ))}
          </Sec>

          <Sec id="sdk" title="SDK Examples">
            <H3>Python</H3>
            <CB lang="python" code={`import requests, time

API_KEY = "${K}"
BASE = "https://${BASE}/api/v1"

# Submit job
resp = requests.post(f"{BASE}/phone-jobs",
  headers={"X-Phone-API-Key": API_KEY},
  json={
    "name": "Arjun Rao",
    "preferences": {"preferred_roles": ["Chief of Staff"], "company_stage": "startup", "locations": ["Bengaluru"], "archetype": "founder_office"},
    "resume_profile": {"subdomain": "Founder-adjacent strategy and ops", "top_skills": ["strategic ops", "fundraising support"]},
    "flex_notes": {"best_project": "Led Series A data room prep.", "outcome": "Closed $4M in 6 weeks."},
  }
)
job_id = resp.json()["job_id"]

# Poll for completion
while True:
    status = requests.get(f"{BASE}/phone-jobs/{job_id}", headers={"X-Phone-API-Key": API_KEY}).json()
    if status["status"] == "completed":
        break
    time.sleep(20)

# Fetch results
leads = requests.get(f"{BASE}/phone-jobs/{job_id}/results", headers={"X-Phone-API-Key": API_KEY}).json()
for lead in leads["leads"]:
    print(lead["name"], lead["title"], lead["phone"], lead["match_scores"]["hiring_probability"])`} />

            <H3>Node.js</H3>
            <CB lang="javascript" code={`const BASE = "https://${BASE}/api/v1";
const KEY = "${K}";
const h = { "X-Phone-API-Key": KEY, "Content-Type": "application/json" };

const { job_id } = await fetch(\`\${BASE}/phone-jobs\`, {
  method: "POST", headers: h,
  body: JSON.stringify({
    name: "Arjun Rao",
    preferences: { preferred_roles: ["Chief of Staff"], company_stage: "startup", locations: ["Bengaluru"], archetype: "founder_office" },
    resume_profile: { subdomain: "Founder-adjacent strategy and ops", top_skills: ["strategic ops"] },
    flex_notes: { best_project: "Led Series A data room prep.", outcome: "Closed $4M in 6 weeks." },
  }),
}).then(r => r.json());

// Poll
let done = false;
while (!done) {
  await new Promise(r => setTimeout(r, 20000));
  const s = await fetch(\`\${BASE}/phone-jobs/\${job_id}\`, { headers: h }).then(r => r.json());
  done = s.status === "completed";
}

const { leads } = await fetch(\`\${BASE}/phone-jobs/\${job_id}/results\`, { headers: h }).then(r => r.json());
leads.forEach(l => console.log(l.name, l.phone, l.match_scores.hiring_probability));`} />
          </Sec>

          <Sec id="faq" title="FAQ">
            {[
              ["How is the Phone API different from the Email API?", "The Phone API delivers 25 leads per run (vs 215) with direct phone numbers per lead. It runs in ~3 minutes (vs ~10 minutes). Price is ₹3,000/run (₹120/lead vs ₹7/lead for email). Phone is designed for high-touch outreach; email is designed for volume campaigns."],
              ["Are phone numbers always available?", "We enrich phone numbers from Apollo's database. The vast majority of leads will include a phone number. A small fraction may return phone: null if enrichment could not resolve a direct number — always handle this case."],
              ["Can I run multiple jobs simultaneously?", "Yes, up to your concurrent_job_cap (default 5). Contact support to increase this limit."],
              ["When is a credit consumed?", "At job submission, before the job runs. A failed job does not refund the credit automatically — contact support if you experience repeated failures."],
              ["Can I filter by company type?", "Yes. Pass company_type_avoid: [\"agency\", \"education\"] in preferences. These companies are hard-excluded from results."],
              ["What is the archetype field?", "founder_office activates the Career Path Graph, which scores title categories (founder, coo, chief_of_staff, etc.) by hiring probability. Use it for any non-technical, founder-adjacent role targeting early-stage startups."],
            ].map(([q, a]) => (
              <div key={q as string} className="mb-5 rounded-xl border-2 border-neutral-200 p-5">
                <div className="font-['Clash_Display'] font-bold text-neutral-900 mb-2">{q}</div>
                <p className="text-sm text-neutral-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </Sec>

        </div>
      </div>
    </div>
  );
}

// ── Dashboard main ─────────────────────────────────────────────────────────────

export default function PhonePartnersDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"dashboard" | "api-docs">("dashboard");
  const [me, setMe] = useState<Me | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<NewKeyData | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [creatingKey, setCreatingKey] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [keyLabel, setKeyLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const storedUser = getStoredUser();

  const fetchMe = useCallback(async () => {
    try {
      const data = await phonePartnersGet<Me>("/api/v1/phone/partners/me");
      setMe(data);
    } catch {
      clearToken();
      navigate("/partners-phone/login");
    } finally {
      setLoadingMe(false);
    }
  }, [navigate]);

  const fetchKeys = useCallback(async () => {
    try {
      const data = await phonePartnersGet<ApiKey[]>("/api/v1/phone/partners/keys");
      setKeys(data);
    } catch {
      // ignore
    } finally {
      setLoadingKeys(false);
    }
  }, []);

  useEffect(() => {
    if (!storedUser) { navigate("/partners-phone/login"); return; }
    fetchMe();
    fetchKeys();
  }, [storedUser, navigate, fetchMe, fetchKeys]);

  const handleCreateKey = async () => {
    setCreatingKey(true);
    setError(null);
    try {
      const data = await phonePartnersPost<NewKeyData>("/api/v1/phone/partners/keys", { label: keyLabel || undefined });
      setNewKey(data);
      setKeyLabel("");
      fetchKeys();
    } catch (err: any) {
      setError(err.message ?? "Failed to create key.");
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Revoke this key? Any integrations using it will stop working immediately.")) return;
    setRevoking(id);
    try {
      await phonePartnersDelete(`/api/v1/phone/partners/keys/${id}`);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {
      // ignore
    } finally {
      setRevoking(null);
    }
  };

  const apiKeyForDocs = newKey?.raw_key ?? (keys[0]?.key_prefix ? keys[0].key_prefix + "..." : null);

  return (
    <div className="min-h-screen bg-neutral-50 font-['Satoshi']">
      {/* Nav */}
      <nav className="border-b-2 border-neutral-900 bg-white px-6 py-4 flex items-center justify-between">
        <Link to="/partners-phone" className="font-['Clash_Display'] text-xl font-bold text-neutral-900">
          Studojo Phone API
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border-2 border-neutral-900 overflow-hidden">
            <button
              onClick={() => setTab("dashboard")}
              className={`px-4 py-1.5 text-sm font-semibold transition-colors ${tab === "dashboard" ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setTab("api-docs")}
              className={`px-4 py-1.5 text-sm font-semibold transition-colors border-l-2 border-neutral-900 ${tab === "api-docs" ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}
            >
              API Reference
            </button>
          </div>
          <button
            onClick={() => { clearToken(); navigate("/partners-phone/login"); }}
            className="text-sm text-neutral-500 hover:text-neutral-800 ml-2"
          >
            Sign out
          </button>
        </div>
      </nav>

      {tab === "api-docs" ? (
        <ApiDocs apiKey={apiKeyForDocs} />
      ) : (
        <div className="mx-auto max-w-4xl px-6 py-10">

          {/* Credits card */}
          {loadingMe ? (
            <div className="mb-8 h-32 rounded-2xl border-2 border-neutral-200 bg-white animate-pulse" />
          ) : me && (
            <div className="mb-8 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    {me.company ? `${me.name} · ${me.company}` : me.name}
                  </div>
                  <div className="font-['Clash_Display'] text-4xl font-bold text-neutral-900">
                    {me.phone_credits_remaining.toLocaleString("en-IN")}
                    <span className="ml-2 font-['Satoshi'] text-base font-normal text-neutral-400">credits remaining</span>
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">
                    {me.phone_credits_used.toLocaleString("en-IN")} used of {me.phone_credits_total.toLocaleString("en-IN")} total
                    {" · "}
                    {(me.phone_credits_remaining * 25).toLocaleString("en-IN")} leads remaining
                  </div>
                </div>
                <Link
                  to="/partners-phone/checkout"
                  className="rounded-xl border-2 border-neutral-900 bg-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                >
                  Buy credits
                </Link>
              </div>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all"
                    style={{ width: me.phone_credits_total > 0 ? `${(me.phone_credits_used / me.phone_credits_total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* New key reveal */}
          {newKey && (
            <div className="mb-8 rounded-2xl border-2 border-green-400 bg-green-50 p-5">
              <div className="mb-1 font-['Clash_Display'] text-base font-bold text-green-800">API key created — save it now.</div>
              <p className="mb-3 text-sm text-green-700">This is the only time this key will be shown. Copy it to a secure location immediately.</p>
              <div className="space-y-2">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-green-600 mb-1">API Key</div>
                  <code className="block rounded-xl border-2 border-green-300 bg-white px-4 py-2.5 text-sm font-mono text-neutral-900 break-all">{newKey.raw_key}</code>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-green-600 mb-1">Webhook Secret</div>
                  <code className="block rounded-xl border-2 border-green-300 bg-white px-4 py-2.5 text-sm font-mono text-neutral-900 break-all">{newKey.webhook_secret}</code>
                </div>
              </div>
              <button
                onClick={() => setNewKey(null)}
                className="mt-4 text-xs font-semibold text-green-700 underline"
              >
                I've saved it — dismiss
              </button>
            </div>
          )}

          {/* API Keys */}
          <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-['Clash_Display'] text-xl font-bold text-neutral-900">API Keys</h2>
            </div>

            {/* Create key */}
            <div className="mb-5 flex gap-2">
              <input
                type="text"
                value={keyLabel}
                onChange={(e) => setKeyLabel(e.target.value)}
                placeholder="Key label (optional)"
                className="flex-1 rounded-xl border-2 border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
              />
              <button
                onClick={handleCreateKey}
                disabled={creatingKey}
                className="rounded-xl border-2 border-neutral-900 bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-700 disabled:opacity-50"
              >
                {creatingKey ? "Creating..." : "+ Create key"}
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border-2 border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            {loadingKeys ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="h-14 rounded-xl bg-neutral-100 animate-pulse" />)}
              </div>
            ) : keys.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-neutral-200 px-5 py-8 text-center text-sm text-neutral-400">
                No API keys yet. Create one above to start making requests.
              </div>
            ) : (
              <div className="space-y-3">
                {keys.map((k) => (
                  <div key={k.id} className="flex items-center justify-between rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <code className="text-sm font-semibold text-violet-600">{k.key_prefix}...</code>
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">{k.status}</span>
                      </div>
                      <div className="text-xs text-neutral-400">
                        {k.label && <span className="mr-2 font-medium text-neutral-600">{k.label}</span>}
                        Created {new Date(k.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeKey(k.id)}
                      disabled={revoking === k.id}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-40"
                    >
                      {revoking === k.id ? "Revoking..." : "Revoke"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick start snippet */}
          <div className="mt-6 rounded-2xl border-2 border-neutral-900 bg-neutral-950 p-6">
            <div className="mb-3 font-['Clash_Display'] text-base font-bold text-white">Quick start</div>
            <pre className="overflow-x-auto text-[13px] text-green-300 leading-relaxed font-mono whitespace-pre-wrap">
{`curl -X POST https://studojo.com/partners/phone/api/v1/phone-jobs \\
  -H "X-Phone-API-Key: ${apiKeyForDocs ?? "<your_key>"}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Arjun Rao",
    "preferences": {
      "preferred_roles": ["Chief of Staff"],
      "company_stage": "startup",
      "locations": ["Bengaluru"],
      "archetype": "founder_office"
    },
    "resume_profile": {
      "subdomain": "Founder-adjacent strategy and operations",
      "top_skills": ["strategic ops", "fundraising", "0-to-1"]
    },
    "flex_notes": {
      "best_project": "Led Series A data room prep.",
      "outcome": "Closed $4M in 6 weeks."
    }
  }'`}
            </pre>
            <button
              onClick={() => setTab("api-docs")}
              className="mt-4 text-sm font-semibold text-violet-400 hover:text-violet-300 underline"
            >
              Full API Reference →
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
