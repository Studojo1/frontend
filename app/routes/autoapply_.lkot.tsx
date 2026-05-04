"use client";
// LinkedIn Outreach Test — /autoapply/lkot
// Full-flow test harness: session capture → campaign → leads → live worker output

import { useState, useEffect, useRef } from "react";
import { Header } from "~/components/common/header";

// ── Types ─────────────────────────────────────────────────────────────────────

interface StepResult {
  ok: boolean;
  message: string;
  data?: any;
}

interface LogEntry {
  ts: string;
  text: string;
  type: "info" | "success" | "error" | "sse";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function now() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

function StatusBadge({ ok }: { ok: boolean | null }) {
  if (ok === null) return <span className="text-[#888] text-xs">—</span>;
  return ok
    ? <span className="text-[#4ade80] text-xs font-medium">✓ done</span>
    : <span className="text-[#f87171] text-xs font-medium">✗ failed</span>;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LkotPage() {
  // ── Step 1: Session ──────────────────────────────────────────────────────
  const [liAt, setLiAt] = useState("");
  const [jsessionId, setJsessionId] = useState("");
  const [userAgent, setUserAgent] = useState(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );
  const [sessionResult, setSessionResult] = useState<StepResult | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // ── Step 2: Campaign ────────────────────────────────────────────────────
  const [campaignName, setCampaignName] = useState("LKOT Test Campaign");
  const [connectionNote, setConnectionNote] = useState(
    "Hi {{firstName}} — saw your work at {{company}} and would love to connect!"
  );
  const [messageTemplate, setMessageTemplate] = useState(
    "Hey {{firstName}}, thanks for connecting! I'm reaching out because we help students land internships at companies like yours. Happy to share more if you're open to it."
  );
  const [campaignResult, setCampaignResult] = useState<StepResult | null>(null);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignId, setCampaignId] = useState("");

  // ── Step 3: Leads ───────────────────────────────────────────────────────
  const [leadsRaw, setLeadsRaw] = useState(
    `https://www.linkedin.com/in/example-person-1/\nhttps://www.linkedin.com/in/example-person-2/`
  );
  const [leadsResult, setLeadsResult] = useState<StepResult | null>(null);
  const [leadsLoading, setLeadsLoading] = useState(false);

  // ── Step 4: Poll test ───────────────────────────────────────────────────
  const [pollResult, setPollResult] = useState<StepResult | null>(null);
  const [pollLoading, setPollLoading] = useState(false);

  // ── Step 5: Stats ───────────────────────────────────────────────────────
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Live log ────────────────────────────────────────────────────────────
  const [log, setLog] = useState<LogEntry[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  function addLog(text: string, type: LogEntry["type"] = "info") {
    setLog((prev) => [...prev, { ts: now(), text, type }]);
  }

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  // SSE listener
  function startSSE() {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    addLog("Connecting to SSE stream…", "info");
    const es = new EventSource("/api/autoapply/stream");
    eventSourceRef.current = es;

    es.onopen = () => addLog("SSE connected", "success");
    es.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        addLog(`SSE → ${JSON.stringify(d)}`, "sse");
      } catch {
        addLog(`SSE raw: ${e.data}`, "sse");
      }
    };
    es.onerror = () => addLog("SSE error / disconnected", "error");
  }

  useEffect(() => {
    return () => eventSourceRef.current?.close();
  }, []);

  // ── Step handlers ─────────────────────────────────────────────────────────

  async function handleSession() {
    if (!liAt.trim()) {
      setSessionResult({ ok: false, message: "li_at is required" });
      return;
    }
    setSessionLoading(true);
    addLog("POSTing session credentials…", "info");
    try {
      // Build a minimal cookie jar string from the two cookies
      const cookieJar = [
        `li_at=${liAt.trim()}`,
        jsessionId.trim() ? `JSESSIONID=${jsessionId.trim()}` : "",
      ].filter(Boolean).join("; ");

      const res = await fetch("/api/autoapply/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          liAt: liAt.trim(),
          userAgent: userAgent.trim() || navigator.userAgent,
          cookies: cookieJar,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSessionResult({ ok: true, message: "Session saved", data });
        addLog(`Session saved — proxy: ${data.proxyCountry ?? "IN"}`, "success");
      } else {
        setSessionResult({ ok: false, message: data.error ?? "Failed", data });
        addLog(`Session error: ${data.error}`, "error");
      }
    } catch (e: any) {
      setSessionResult({ ok: false, message: e.message });
      addLog(`Session fetch error: ${e.message}`, "error");
    } finally {
      setSessionLoading(false);
    }
  }

  async function handleCampaign() {
    if (!campaignName.trim()) return;
    setCampaignLoading(true);
    addLog("Creating test campaign…", "info");
    try {
      const res = await fetch("/api/autoapply/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName.trim(),
          targetTitles: ["recruiter", "talent acquisition", "hiring manager"],
          targetCompanies: [],
          connectionNote: connectionNote.trim(),
          messageTemplate: messageTemplate.trim(),
          followUpTemplate: "Hey {{firstName}}, just checking in — still happy to connect if timing works!",
        }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        setCampaignId(data.id);
        setCampaignResult({ ok: true, message: `Campaign created: ${data.id}`, data });
        addLog(`Campaign created — id: ${data.id}`, "success");
      } else {
        setCampaignResult({ ok: false, message: data.error ?? "Failed", data });
        addLog(`Campaign error: ${data.error}`, "error");
      }
    } catch (e: any) {
      setCampaignResult({ ok: false, message: e.message });
      addLog(`Campaign fetch error: ${e.message}`, "error");
    } finally {
      setCampaignLoading(false);
    }
  }

  async function handleLeads() {
    if (!campaignId) {
      setLeadsResult({ ok: false, message: "Create a campaign first (Step 2)" });
      return;
    }
    const urls = leadsRaw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.includes("linkedin.com/in/"));

    if (urls.length === 0) {
      setLeadsResult({ ok: false, message: "No valid LinkedIn URLs found" });
      return;
    }

    setLeadsLoading(true);
    addLog(`Injecting ${urls.length} lead(s)…`, "info");
    try {
      const res = await fetch("/api/autoapply/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          leads: urls.map((linkedinUrl) => ({ linkedinUrl })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLeadsResult({ ok: true, message: `Queued: ${data.queued}, skipped: ${data.skipped}`, data });
        addLog(`Leads injected — queued: ${data.queued}, skipped: ${data.skipped}`, "success");
      } else {
        setLeadsResult({ ok: false, message: data.error ?? "Failed", data });
        addLog(`Leads error: ${data.error}`, "error");
      }
    } catch (e: any) {
      setLeadsResult({ ok: false, message: e.message });
      addLog(`Leads fetch error: ${e.message}`, "error");
    } finally {
      setLeadsLoading(false);
    }
  }

  async function handlePollAcceptances() {
    setPollLoading(true);
    addLog("Triggering acceptance poll…", "info");
    try {
      const res = await fetch("/api/autoapply/poll-acceptances", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setPollResult({ ok: true, message: `Accepted: ${data.accepted ?? 0}`, data });
        addLog(`Poll done — accepted: ${data.accepted ?? 0}`, "success");
      } else {
        setPollResult({ ok: false, message: data.error ?? "Failed", data });
        addLog(`Poll error: ${data.error}`, "error");
      }
    } catch (e: any) {
      setPollResult({ ok: false, message: e.message });
      addLog(`Poll fetch error: ${e.message}`, "error");
    } finally {
      setPollLoading(false);
    }
  }

  async function handleStats() {
    setStatsLoading(true);
    addLog("Fetching stats…", "info");
    try {
      const res = await fetch("/api/outreach/stats");
      const data = await res.json();
      setStats(data);
      addLog(`Stats — sentToday: ${data.session?.sentToday ?? "?"}, warmupDay: ${data.session?.warmupDay ?? "?"}`, "success");
    } catch (e: any) {
      addLog(`Stats error: ${e.message}`, "error");
    } finally {
      setStatsLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const inputCls = "w-full bg-[#0d0d0d] border border-[#222] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#444]";
  const btnCls = "px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const primaryBtn = `${btnCls} bg-white text-black hover:bg-[#e5e5e5]`;
  const ghostBtn = `${btnCls} border border-[#333] text-white hover:border-[#555]`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-satoshi">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-3">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-clash text-2xl font-semibold tracking-tight">LKOT — LinkedIn Outreach Test</h1>
          <p className="text-[#666] text-sm mt-1">Full-flow test harness. Run each step in order.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* ── Left: Steps ── */}
          <div className="space-y-4">

            {/* Step 1 */}
            <Section title="Step 1 — LinkedIn Session" result={sessionResult}>
              <p className="text-[#888] text-xs mb-3">
                Paste your <code className="text-[#aaa]">li_at</code> cookie and optionally <code className="text-[#aaa]">JSESSIONID</code>.
                JSESSIONID is needed for the Voyager acceptance poller.
              </p>
              <label className="text-xs text-[#666] block mb-1">li_at *</label>
              <textarea
                className={`${inputCls} h-20 resize-none font-mono text-xs`}
                placeholder="AQEDATxxxxxxx…"
                value={liAt}
                onChange={(e) => setLiAt(e.target.value)}
              />
              <label className="text-xs text-[#666] block mt-3 mb-1">JSESSIONID (optional but recommended)</label>
              <input
                className={inputCls}
                placeholder='"ajax:123456789012345678"'
                value={jsessionId}
                onChange={(e) => setJsessionId(e.target.value)}
              />
              <label className="text-xs text-[#666] block mt-3 mb-1">User-Agent</label>
              <input
                className={`${inputCls} font-mono text-xs`}
                value={userAgent}
                onChange={(e) => setUserAgent(e.target.value)}
              />
              <div className="mt-3">
                <button className={primaryBtn} onClick={handleSession} disabled={sessionLoading}>
                  {sessionLoading ? "Saving…" : "Save session →"}
                </button>
              </div>
            </Section>

            {/* Step 2 */}
            <Section title="Step 2 — Create Campaign" result={campaignResult}>
              {campaignId && (
                <p className="text-[#4ade80] text-xs mb-3 font-mono">id: {campaignId}</p>
              )}
              <label className="text-xs text-[#666] block mb-1">Campaign name</label>
              <input
                className={inputCls}
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
              <label className="text-xs text-[#666] block mt-3 mb-1">Connection note (max 300 chars)</label>
              <textarea
                className={`${inputCls} h-20 resize-none text-xs`}
                value={connectionNote}
                onChange={(e) => setConnectionNote(e.target.value)}
                maxLength={300}
              />
              <p className="text-[#555] text-xs mt-1 text-right">{connectionNote.length}/300</p>
              <label className="text-xs text-[#666] block mt-2 mb-1">Message template (sent after connection accepted)</label>
              <textarea
                className={`${inputCls} h-20 resize-none text-xs`}
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
              />
              <div className="mt-3">
                <button className={primaryBtn} onClick={handleCampaign} disabled={campaignLoading}>
                  {campaignLoading ? "Creating…" : "Create campaign →"}
                </button>
              </div>
            </Section>

            {/* Step 3 */}
            <Section title="Step 3 — Inject Leads" result={leadsResult}>
              <p className="text-[#888] text-xs mb-3">
                One LinkedIn URL per line. Will be queued as connection requests with up to 8h random stagger.
              </p>
              <textarea
                className={`${inputCls} h-32 resize-none font-mono text-xs`}
                placeholder={"https://www.linkedin.com/in/person-a/\nhttps://www.linkedin.com/in/person-b/"}
                value={leadsRaw}
                onChange={(e) => setLeadsRaw(e.target.value)}
              />
              <div className="mt-3 flex items-center gap-3">
                <button className={primaryBtn} onClick={handleLeads} disabled={leadsLoading}>
                  {leadsLoading ? "Injecting…" : "Inject leads →"}
                </button>
                {!campaignId && (
                  <span className="text-[#f87171] text-xs">Complete Step 2 first</span>
                )}
              </div>
            </Section>

            {/* Step 4 */}
            <Section title="Step 4 — Trigger Acceptance Poll" result={pollResult}>
              <p className="text-[#888] text-xs mb-3">
                Manually fires the Voyager API poller to check if any pending connection requests were accepted.
                In production this runs every 2 hours automatically.
              </p>
              <button className={ghostBtn} onClick={handlePollAcceptances} disabled={pollLoading}>
                {pollLoading ? "Polling…" : "Run acceptance poll"}
              </button>
            </Section>

            {/* Step 5 */}
            <Section title="Step 5 — Check Stats" result={null}>
              <button className={ghostBtn} onClick={handleStats} disabled={statsLoading}>
                {statsLoading ? "Loading…" : "Fetch /api/outreach/stats"}
              </button>
              {stats && (
                <pre className="mt-3 text-[#aaa] text-xs bg-[#111] border border-[#1e1e1e] rounded-lg p-3 overflow-auto max-h-64">
                  {JSON.stringify(stats, null, 2)}
                </pre>
              )}
            </Section>
          </div>

          {/* ── Right: Live log ── */}
          <div className="lg:sticky lg:top-6 self-start">
            <div className="border border-[#1e1e1e] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e] bg-[#0d0d0d]">
                <span className="text-xs font-medium text-[#888]">Live log</span>
                <div className="flex gap-2">
                  <button
                    className="text-xs text-[#555] hover:text-white transition-colors"
                    onClick={startSSE}
                  >
                    connect SSE
                  </button>
                  <button
                    className="text-xs text-[#555] hover:text-white transition-colors"
                    onClick={() => setLog([])}
                  >
                    clear
                  </button>
                </div>
              </div>
              <div
                ref={logRef}
                className="h-[520px] overflow-y-auto p-3 space-y-1 bg-[#080808] font-mono text-xs"
              >
                {log.length === 0 && (
                  <p className="text-[#444]">No activity yet. Run a step above.</p>
                )}
                {log.map((entry, i) => (
                  <div key={i} className="flex gap-2 leading-relaxed">
                    <span className="text-[#444] shrink-0">{entry.ts}</span>
                    <span
                      className={
                        entry.type === "success" ? "text-[#4ade80]"
                        : entry.type === "error" ? "text-[#f87171]"
                        : entry.type === "sse" ? "text-[#60a5fa]"
                        : "text-[#aaa]"
                      }
                    >
                      {entry.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick reference */}
            <div className="mt-4 border border-[#1e1e1e] rounded-xl p-4 bg-[#0d0d0d]">
              <p className="text-xs font-medium text-[#666] mb-3">Quick reference</p>
              <div className="space-y-2">
                {[
                  ["Step 1", sessionResult ? (sessionResult.ok ? "✓" : "✗") : "—", sessionResult?.ok ?? null],
                  ["Step 2 — campaign", campaignResult ? (campaignResult.ok ? "✓" : "✗") : "—", campaignResult?.ok ?? null],
                  ["Step 3 — leads", leadsResult ? (leadsResult.ok ? "✓" : "✗") : "—", leadsResult?.ok ?? null],
                  ["Step 4 — poll", pollResult ? (pollResult.ok ? "✓" : "✗") : "—", pollResult?.ok ?? null],
                ].map(([label, , ok]) => (
                  <div key={String(label)} className="flex items-center justify-between">
                    <span className="text-[#666] text-xs">{String(label)}</span>
                    <StatusBadge ok={ok as boolean | null} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  result,
  children,
}: {
  title: string;
  result: StepResult | null;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#1e1e1e] rounded-xl p-5 bg-[#0d0d0d]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {result && (
          <span className={`text-xs ${result.ok ? "text-[#4ade80]" : "text-[#f87171]"}`}>
            {result.message}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
