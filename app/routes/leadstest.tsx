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

// ── Tool 2: Lead Intelligence (DuckDuckGo + Google News RSS) ─────────────────

function LeadIntelligence() {
  const [form, setForm] = useState({ first_name: "", title: "", company_name: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!form.first_name || !form.title || !form.company_name) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await apiPost("/leadstest/lead-intel", form);
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section title="TOOL 2 — Lead Intelligence (Free: DuckDuckGo + Google News RSS)">
      <p style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280", marginTop: 0 }}>
        Given a name and company, finds their LinkedIn, company domain, recent funding news, and open roles. No API keys, no credits.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
        <Input label="First Name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} placeholder="Sai" />
        <Input label="Title / Position" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Head of Data Analytics" />
        <Input label="Company Name" value={form.company_name} onChange={(v) => setForm({ ...form, company_name: v })} placeholder="Razorpay" />
      </div>
      <Btn onClick={run} loading={loading}>Find Intel</Btn>

      {error && (
        <div style={{ color: "#dc2626", fontFamily: "monospace", fontSize: 13, marginTop: 12 }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Quick summary row */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 12 }}>
            <span>Person LinkedIn: {result.person_linkedin_url
              ? <a href={result.person_linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: "#0a66c2", fontWeight: 700 }}>{result.person_linkedin_url.replace("https://www.linkedin.com/in/", "linkedin.com/in/")}</a>
              : <span style={{ color: "#dc2626" }}>not found</span>}
            </span>
            <span>Company Domain: {result.company_domain
              ? <a href={`https://${result.company_domain}`} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5", fontWeight: 700 }}>{result.company_domain}</a>
              : <span style={{ color: "#dc2626" }}>not found</span>}
            </span>
            <span>Company LinkedIn: {result.company_linkedin_url
              ? <a href={result.company_linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: "#0a66c2", fontWeight: 700 }}>View page</a>
              : <span style={{ color: "#dc2626" }}>not found</span>}
            </span>
            <span>News items: <strong>{result.funding_news?.length ?? 0}</strong></span>
            <span>Open roles: <strong>{result.careers?.open_roles_count ?? (result.careers ? "scraped" : "no domain")}</strong></span>
          </div>

          {/* Funding news */}
          {result.funding_news?.length > 0 && (
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#7c3aed", marginBottom: 6 }}>
                FUNDING & HIRING NEWS ({result.funding_news.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {result.funding_news.map((item: any, i: number) => (
                  <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "6px 10px", fontFamily: "monospace", fontSize: 11, display: "flex", gap: 10, alignItems: "baseline" }}>
                    <span style={{ color: "#9ca3af", flexShrink: 0, minWidth: 90 }}>{item.published_at ? item.published_at.slice(0, 16) : "—"}</span>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: "#111827", textDecoration: "none", flex: 1 }}>
                      {item.headline}
                    </a>
                    {item.source && <span style={{ color: "#6b7280", flexShrink: 0 }}>{item.source}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Career page results */}
          {result.careers && (
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#0369a1", marginBottom: 6 }}>
                CAREER PAGE — <StatusBadge status={result.careers.status} />
                {result.careers.careers_url && (
                  <a href={result.careers.careers_url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, color: "#4f46e5", fontWeight: 400 }}>
                    {result.careers.careers_url}
                  </a>
                )}
                <span style={{ marginLeft: 10, fontWeight: 400, color: "#374151" }}>
                  {result.careers.open_roles_count} roles · {result.careers.engineering_roles_count} engineering
                </span>
              </div>
              {result.careers.status === "js_rendered" && (
                <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 6, padding: 8, fontSize: 11, color: "#78350f", marginBottom: 8 }}>
                  JS-rendered page — static scraper got empty shell. Company uses React/Next.js career site.
                </div>
              )}
              {result.careers.open_roles?.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 5 }}>
                  {result.careers.open_roles.slice(0, 20).map((r: any, i: number) => (
                    <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "5px 8px", fontSize: 11, fontFamily: "monospace" }}>
                      <div style={{ fontWeight: 700, color: "#111827" }}>{r.title}</div>
                      {r.department && <div style={{ color: "#6b7280" }}>{r.department}</div>}
                      {r.location && <div style={{ color: "#9ca3af" }}>{r.location}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search results used — for debugging */}
          <details style={{ fontFamily: "monospace", fontSize: 11 }}>
            <summary style={{ cursor: "pointer", color: "#6b7280" }}>Raw search results (debug)</summary>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Person LinkedIn search:</div>
              {(result.person_linkedin_search_results ?? []).map((r: any, i: number) => (
                <div key={i} style={{ padding: "3px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5" }}>{r.title}</a>
                  <div style={{ color: "#9ca3af" }}>{r.snippet?.slice(0, 120)}</div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </Section>
  );
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
      <LeadIntelligence />
      <CareerPageTester />
      <LinkedInEnricher />
    </div>
  );
}
