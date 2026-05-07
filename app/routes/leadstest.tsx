/**
 * Internal experiment page — not linked from any public nav.
 * Requires auth (session cookie). Path: /leadstest
 */

import { useState, useRef } from "react";
import { getToken } from "~/lib/control-plane";

// ── API helpers ──────────────────────────────────────────────────────────────

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const token = await getToken();
  const res = await fetch(`/api/v1/outreach${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail ?? `Request failed (${res.status})`);
  return data as T;
}

async function apiUpload<T>(path: string, file: File): Promise<T> {
  const token = await getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`/api/v1/outreach${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail ?? `Request failed (${res.status})`);
  return data as T;
}

// ── Small shared components ───────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "2px solid #ccc", borderRadius: 8, padding: 24, marginBottom: 32 }}>
      <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, fontFamily: "monospace" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function JsonBlock({ data, maxHeight = 400 }: { data: unknown; maxHeight?: number }) {
  const [expanded, setExpanded] = useState(false);
  const text = JSON.stringify(data, null, 2);
  const lines = text.split("\n").length;
  const showToggle = lines > 30;

  return (
    <div style={{ position: "relative" }}>
      <pre
        style={{
          background: "#1e1e1e",
          color: "#d4d4d4",
          padding: 16,
          borderRadius: 6,
          overflowX: "auto",
          overflowY: "auto",
          maxHeight: expanded ? "none" : maxHeight,
          fontSize: 12,
          lineHeight: 1.5,
          margin: 0,
          fontFamily: "monospace",
        }}
      >
        {text}
      </pre>
      {showToggle && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            background: "#555",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "2px 10px",
            cursor: "pointer",
            fontSize: 11,
          }}
        >
          {expanded ? "▲ collapse" : "▼ expand"}
        </button>
      )}
    </div>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        background: color,
        color: "#fff",
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
        marginLeft: 6,
        fontFamily: "monospace",
      }}
    >
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    success: "#16a34a",
    not_found: "#dc2626",
    js_rendered: "#d97706",
    error: "#dc2626",
  };
  return <Tag label={status} color={colors[status] ?? "#6b7280"} />;
}

function Btn({
  onClick,
  loading,
  children,
}: {
  onClick: () => void;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        background: loading ? "#9ca3af" : "#4f46e5",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        padding: "8px 20px",
        fontSize: 14,
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "monospace",
      }}
    >
      {loading ? "Running..." : children}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  style,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, ...style }}>
      <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace", textTransform: "uppercase" }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          border: "1px solid #d1d5db",
          borderRadius: 6,
          padding: "6px 10px",
          fontSize: 13,
          fontFamily: "monospace",
          outline: "none",
        }}
      />
    </label>
  );
}

// ── Tool 1: Resume Analysis Comparator ───────────────────────────────────────

function ResumeComparator() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await apiUpload("/leadstest/analyze-resume", file);
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const newFields = result?.delta_summary?.new_fields ?? [];

  return (
    <Section title="TOOL 1 — Resume Analysis Comparator">
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 4 }}>
            PDF or DOCX
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx"
            style={{ fontFamily: "monospace", fontSize: 13 }}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <Btn onClick={run} loading={loading}>
          Analyze Resume
        </Btn>
      </div>

      {error && (
        <div style={{ color: "#dc2626", fontFamily: "monospace", fontSize: 13, marginBottom: 12 }}>
          Error: {error}
        </div>
      )}

      {result && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "monospace", fontSize: 13, color: "#374151" }}>
              Current: {result.delta_summary.current_field_count} fields
            </span>
            <span style={{ fontFamily: "monospace", fontSize: 13, color: "#374151" }}>→</span>
            <span style={{ fontFamily: "monospace", fontSize: 13, color: "#16a34a", fontWeight: 700 }}>
              Enhanced: {result.delta_summary.enhanced_field_count} fields
            </span>
            <span style={{ fontFamily: "monospace", fontSize: 13, color: "#6b7280" }}>
              (+{result.delta_summary.new_fields_count} new: {newFields.join(", ")})
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Current */}
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#6b7280" }}>
                CURRENT ({result.delta_summary.current_field_count} fields)
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
                {Object.entries(result.current_analysis).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 8, padding: "5px 10px", borderBottom: "1px solid #f3f4f6", fontFamily: "monospace" }}>
                    <span style={{ fontSize: 11, color: "#9ca3af", width: 140, flexShrink: 0 }}>{k}</span>
                    <span style={{ fontSize: 12, color: "#111827", wordBreak: "break-all" }}>
                      {Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v ?? "—")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced */}
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#16a34a" }}>
                ENHANCED ({result.delta_summary.enhanced_field_count} fields)
              </div>
              <div style={{ border: "2px solid #16a34a", borderRadius: 6, overflow: "hidden" }}>
                {Object.entries(result.enhanced_analysis).map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      gap: 8,
                      padding: "5px 10px",
                      borderBottom: "1px solid #f3f4f6",
                      fontFamily: "monospace",
                      background: newFields.includes(k) ? "#f0fdf4" : "white",
                    }}
                  >
                    <span style={{ fontSize: 11, color: newFields.includes(k) ? "#16a34a" : "#9ca3af", width: 140, flexShrink: 0, fontWeight: newFields.includes(k) ? 700 : 400 }}>
                      {k} {newFields.includes(k) && "🆕"}
                    </span>
                    <span style={{ fontSize: 12, color: "#111827", wordBreak: "break-all" }}>
                      {Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v ?? "—")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </Section>
  );
}

// ── Tool 2: Apollo Data Inspector ────────────────────────────────────────────

function ApolloInspector() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    title: "",
    company: "",
    linkedin_url: "",
    apollo_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await apiPost("/leadstest/apollo-inspect", form);
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const signals = result?.scoring_signals_unlocked ?? {};

  return (
    <Section title="TOOL 2 — Apollo Data Inspector">
      <p style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280", marginTop: 0 }}>
        Shows what Apollo People Match returns — split into currently-extracted vs currently-ignored fields.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12 }}>
        <Input label="First Name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} placeholder="Nikhil" />
        <Input label="Last Name" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} placeholder="Jain" />
        <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Engineering Manager" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12 }}>
        <Input label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="Stripe" />
        <Input label="LinkedIn URL (optional)" value={form.linkedin_url} onChange={(v) => setForm({ ...form, linkedin_url: v })} placeholder="linkedin.com/in/..." />
        <Input label="Apollo ID (optional)" value={form.apollo_id} onChange={(v) => setForm({ ...form, apollo_id: v })} placeholder="6872c2be..." />
      </div>
      <Btn onClick={run} loading={loading}>Inspect Apollo Data</Btn>

      {error && (
        <div style={{ color: "#dc2626", fontFamily: "monospace", fontSize: 13, marginTop: 12 }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Scoring signals banner */}
          <div style={{ background: "#1e1b4b", color: "#e0e7ff", borderRadius: 8, padding: 14, fontFamily: "monospace", fontSize: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Scoring Signals Unlocked</div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <span>
                Hiring Urgency: <strong style={{ color: urgencyColor(signals.hiring_urgency_score) }}>{signals.hiring_urgency_score}/100</strong>
                <span style={{ color: "#a5b4fc", marginLeft: 6 }}>({signals.hiring_urgency_reason})</span>
              </span>
              <span>
                Email Reliability: <strong style={{ color: signals.email_reliability === "high" ? "#86efac" : "#fca5a5" }}>{signals.email_reliability}</strong>
                <span style={{ color: "#a5b4fc", marginLeft: 6 }}>({signals.email_reliability_reason})</span>
              </span>
              <span>
                Career Prestige: <strong style={{ color: "#fbbf24" }}>{signals.career_prestige_tier}</strong>
                <span style={{ color: "#a5b4fc", marginLeft: 6 }}>({signals.career_prestige_reason})</span>
              </span>
            </div>
          </div>

          {/* Three-column comparison */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <FieldPanel title="Currently Extracted ✅" data={result.currently_extracted} accent="#16a34a" />
            <div>
              <FieldPanel title="Hidden Person Fields 🔥" data={result.hidden_person_fields} accent="#dc2626" />
              <div style={{ marginTop: 12 }}>
                <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>
                  EMPLOYMENT HISTORY 🔥
                </div>
                {(result.hidden_person_career ?? []).map((job: any, i: number) => (
                  <div key={i} style={{ fontFamily: "monospace", fontSize: 11, padding: "3px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ color: job.current ? "#16a34a" : "#374151", fontWeight: job.current ? 700 : 400 }}>
                      {job.title}
                    </span>
                    <span style={{ color: "#6b7280" }}> @ {job.company}</span>
                    <span style={{ color: "#9ca3af" }}> {job.start}–{job.end ?? "now"}</span>
                  </div>
                ))}
              </div>
            </div>
            <FieldPanel title="Hidden Company Fields 🔥" data={result.hidden_company_fields} accent="#7c3aed" />
          </div>
        </div>
      )}
    </Section>
  );
}

function FieldPanel({ title, data, accent }: { title: string; data: Record<string, any>; accent: string }) {
  return (
    <div>
      <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: accent, marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ border: `1px solid ${accent}`, borderRadius: 6, overflow: "hidden" }}>
        {Object.entries(data).map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 6, padding: "4px 8px", borderBottom: "1px solid #f3f4f6", fontFamily: "monospace" }}>
            <span style={{ fontSize: 10, color: "#9ca3af", width: 130, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{k}</span>
            <span style={{ fontSize: 11, color: "#111827", wordBreak: "break-all" }}>
              {Array.isArray(v) ? v.join(", ") : v === null || v === undefined ? <span style={{ color: "#d1d5db" }}>null</span> : typeof v === "object" ? JSON.stringify(v).slice(0, 80) : String(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function urgencyColor(score: number): string {
  if (score >= 60) return "#86efac";
  if (score >= 30) return "#fbbf24";
  return "#fca5a5";
}

// ── Tool 3: Career Page Scraper ───────────────────────────────────────────────

function CareerPageTester() {
  const [domain, setDomain] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await apiPost("/leadstest/career-page", { company_domain: domain, company_name: name });
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section title="TOOL 3 — Career Page Scraper">
      <p style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280", marginTop: 0 }}>
        Finds and parses a company's career page. Note: JS-rendered pages (React/Next.js) will return limited data — this test helps gauge coverage.
      </p>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 12 }}>
        <Input label="Company Domain" value={domain} onChange={setDomain} placeholder="razorpay.com" />
        <Input label="Company Name (optional)" value={name} onChange={setName} placeholder="Razorpay" />
        <Btn onClick={run} loading={loading}>Scrape Jobs</Btn>
      </div>

      {error && (
        <div style={{ color: "#dc2626", fontFamily: "monospace", fontSize: 13 }}>Error: {error}</div>
      )}

      {result && (
        <div style={{ fontFamily: "monospace" }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
            <span>Status: <StatusBadge status={result.status} /></span>
            {result.careers_url && <span style={{ fontSize: 13 }}>URL: <a href={result.careers_url} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5" }}>{result.careers_url}</a></span>}
            <span style={{ fontSize: 13 }}>Roles found: <strong>{result.open_roles_count}</strong></span>
            <span style={{ fontSize: 13 }}>Engineering: <strong>{result.engineering_roles_count}</strong></span>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Method: {result.scrape_method ?? "n/a"}</span>
          </div>

          {result.status === "js_rendered" && (
            <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 6, padding: 10, fontSize: 12, color: "#78350f", marginBottom: 12 }}>
              ⚠ JS-rendered page detected — static scraper received an empty shell. This company's career site uses React/Angular. A Playwright-based scraper would be needed for full data.
            </div>
          )}

          {result.open_roles?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>ROLES ({result.open_roles.length}):</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 6 }}>
                {result.open_roles.map((r: any, i: number) => (
                  <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "6px 10px", fontSize: 11 }}>
                    <div style={{ fontWeight: 700, color: "#111827" }}>{r.title}</div>
                    {r.department && <div style={{ color: "#6b7280" }}>{r.department}</div>}
                    {r.location && <div style={{ color: "#9ca3af" }}>{r.location}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

// ── Tool 4: LinkedIn Enrichment ───────────────────────────────────────────────

function LinkedInEnricher() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await apiPost("/leadstest/linkedin-enrich", { linkedin_url: url });
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section title="TOOL 4 — LinkedIn Enrichment via Proxycurl (Paid ~$0.05/call)">
      <p style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280", marginTop: 0 }}>
        Fetches data Apollo doesn't provide: post activity, follower count, skills. Requires PROXYCURL_API_KEY in backend .env.
      </p>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 12 }}>
        <Input
          label="LinkedIn Profile URL"
          value={url}
          onChange={setUrl}
          placeholder="https://linkedin.com/in/username"
          style={{ flex: 3 }}
        />
        <Btn onClick={run} loading={loading}>Enrich (Paid)</Btn>
      </div>

      {error && (
        <div style={{ color: "#dc2626", fontFamily: "monospace", fontSize: 13 }}>
          {error.includes("501") ? "PROXYCURL_API_KEY not set in backend .env" : `Error: ${error}`}
        </div>
      )}

      {result && <JsonBlock data={result} />}
    </Section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LeadsTest() {
  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "32px 24px",
        fontFamily: "monospace",
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>
          Studojo Leadstest
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
          Internal experiment page — not linked from any public nav.
          Tests resume analysis improvements and lead data enrichment.
        </p>
      </div>

      <ResumeComparator />
      <ApolloInspector />
      <CareerPageTester />
      <LinkedInEnricher />
    </div>
  );
}
