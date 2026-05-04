"use client";
// LinkedIn Outreach Test — /lkot
// Option C connect flow: one click → LinkedIn tab opens → extension auto-captures → done.

import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "~/components/common/header";

// ── Types ─────────────────────────────────────────────────────────────────────

type ConnectState =
  | "idle"           // before anything
  | "detecting"      // checking if extension installed (2s window)
  | "no_extension"   // extension not found — show manual fallback
  | "opening"        // background opened LinkedIn tab
  | "waiting"        // polling backend for session
  | "connected"      // session confirmed
  | "error";         // something went wrong

interface SessionInfo {
  warmupDay?: number;
  proxyCountry?: string;
  cookieAgeDays?: number;
}

interface LogEntry {
  ts: string;
  text: string;
  type: "info" | "success" | "error" | "poll";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function nowStr() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function LkotPage() {
  const [connectState, setConnectState] = useState<ConnectState>("idle");
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((text: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [...prev, { ts: nowStr(), text, type }]);
  }, []);

  // ── Step 2: campaign + leads ────────────────────────────────────────────────
  const [campaignId, setCampaignId] = useState("");
  const [campaignName, setCampaignName] = useState("LKOT Test Campaign");
  const [connectionNote, setConnectionNote] = useState(
    "Hi {{firstName}} — saw your work at {{company}} and would love to connect!"
  );
  const [leadsRaw, setLeadsRaw] = useState("");
  const [step2Result, setStep2Result] = useState<{ queued: number; skipped: number } | null>(null);
  const [step2Loading, setStep2Loading] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // ── Extension detection ─────────────────────────────────────────────────────

  function detectExtension(): Promise<boolean> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(false), 2000);
      function onMsg(e: MessageEvent) {
        if (e.data?.type === "STUDOJO_EXTENSION_READY" || e.data?.type === "STUDOJO_STATUS_RESULT") {
          clearTimeout(timer);
          window.removeEventListener("message", onMsg);
          resolve(true);
        }
      }
      window.addEventListener("message", onMsg);
      window.postMessage({ type: "STUDOJO_CHECK_STATUS" }, "*");
    });
  }

  // ── Poll backend for session ────────────────────────────────────────────────

  function startPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    const MAX = 90; // 3 min @ 2s

    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > MAX) {
        clearInterval(pollRef.current!);
        setConnectState("error");
        setErrorMsg("Timed out after 3 minutes. Did the extension fire?");
        addLog("Polling timed out", "error");
        return;
      }

      try {
        const res = await fetch("/api/autoapply/session/status");
        if (res.status === 401) {
          clearInterval(pollRef.current!);
          setConnectState("error");
          setErrorMsg("Not logged in to Studojo. Sign in first.");
          addLog("Not authenticated", "error");
          return;
        }
        const data = await res.json();
        if (data.connected) {
          clearInterval(pollRef.current!);
          setSessionInfo({ warmupDay: data.warmupDay, proxyCountry: data.proxyCountry, cookieAgeDays: data.cookieAgeDays });
          setConnectState("connected");
          addLog(`Connected — warmup day ${data.warmupDay ?? 0}, proxy ${data.proxyCountry ?? "IN"}`, "success");
        } else {
          if (attempts % 5 === 0) addLog(`Still waiting… (${attempts * 2}s)`, "poll");
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 2000);
  }

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // ── Extension push notifications ────────────────────────────────────────────

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data?.type === "STUDOJO_SESSION_CAPTURED") {
        addLog("Extension: session captured!", "success");
      }
      if (e.data?.type === "STUDOJO_SESSION_CAPTURE_FAILED") {
        const err = e.data.error as string;
        const msg =
          err === "not_logged_in_linkedin" ? "Not logged into LinkedIn — log in first."
          : err === "not_logged_in_studojo" ? "Not logged into Studojo — sign in first."
          : `Extension error: ${err}`;
        setErrorMsg(msg);
        setConnectState("error");
        addLog(msg, "error");
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [addLog]);

  // ── Connect handler ─────────────────────────────────────────────────────────

  async function handleConnect() {
    setConnectState("detecting");
    setErrorMsg("");
    addLog("Checking for extension…", "info");

    const present = await detectExtension();

    if (!present) {
      setConnectState("no_extension");
      addLog("Extension not found — showing manual fallback", "error");
      return;
    }

    addLog("Extension found. Opening LinkedIn…", "info");
    setConnectState("opening");

    window.postMessage({ type: "STUDOJO_OPEN_LINKEDIN" }, "*");

    // Wait for tab-opened ack (or proceed after 3s fallback)
    await new Promise<void>((resolve) => {
      const t = setTimeout(resolve, 3000);
      function onAck(e: MessageEvent) {
        if (e.data?.type === "STUDOJO_LINKEDIN_OPENED") {
          clearTimeout(t);
          window.removeEventListener("message", onAck);
          resolve();
        }
      }
      window.addEventListener("message", onAck);
    });

    addLog("LinkedIn tab opened. Polling for session…", "info");
    setConnectState("waiting");
    startPolling();
  }

  function handleRetry() {
    setConnectState("idle");
    setErrorMsg("");
    if (pollRef.current) clearInterval(pollRef.current);
  }

  // ── Step 2: campaign + leads ────────────────────────────────────────────────

  async function handleLaunch() {
    setStep2Loading(true);
    addLog("Setting up campaign…", "info");
    try {
      let cid = campaignId;

      if (!cid) {
        const res = await fetch("/api/autoapply/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: campaignName.trim(),
            targetTitles: ["recruiter", "talent acquisition", "hiring manager"],
            targetCompanies: [],
            connectionNote: connectionNote.trim(),
            messageTemplate: "Hey {{firstName}}, thanks for connecting! I help students land internships — happy to share more if useful.",
            followUpTemplate: "Hey {{firstName}}, just following up — still happy to connect if timing works!",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Campaign creation failed");
        cid = data.id;
        setCampaignId(cid);
        addLog(`Campaign created — ${cid}`, "success");
      }

      const urls = leadsRaw.split("\n").map((l) => l.trim()).filter((l) => l.includes("linkedin.com/in/"));
      if (urls.length === 0) { addLog("No valid LinkedIn URLs found", "error"); return; }

      addLog(`Injecting ${urls.length} lead(s)…`, "info");
      const res = await fetch("/api/autoapply/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: cid, leads: urls.map((linkedinUrl) => ({ linkedinUrl })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lead injection failed");

      setStep2Result({ queued: data.queued, skipped: data.skipped });
      addLog(`Leads queued: ${data.queued}, skipped: ${data.skipped}`, "success");
    } catch (e: any) {
      addLog(`Error: ${e.message}`, "error");
    } finally {
      setStep2Loading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const inputCls = "w-full bg-[#0d0d0d] border border-[#222] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#555]";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-satoshi">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="font-clash text-2xl font-semibold tracking-tight">LinkedIn Outreach — Test</h1>
          <p className="text-[#555] text-sm mt-1">Connect your LinkedIn, then inject leads. Two steps.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          <div className="space-y-4">

            {/* ── Step 1: Connect ── */}
            <div className="border border-[#1e1e1e] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StepBadge n={1} done={connectState === "connected"} />
                  <span className="text-sm font-medium">Connect LinkedIn</span>
                </div>
                {connectState === "connected" && sessionInfo && (
                  <div className="flex items-center gap-3 text-xs text-[#444]">
                    {sessionInfo.proxyCountry && <span>proxy {sessionInfo.proxyCountry}</span>}
                    <span>day {sessionInfo.warmupDay ?? 0}/15</span>
                    <button onClick={handleRetry} className="hover:text-white transition-colors">reconnect</button>
                  </div>
                )}
              </div>

              <div className="px-5 py-6">
                {connectState === "idle" && (
                  <div className="flex flex-col items-center gap-4 py-2">
                    <p className="text-[#555] text-sm text-center max-w-xs">
                      We'll open LinkedIn in a new tab. The extension captures your session automatically — nothing to copy.
                    </p>
                    <button
                      onClick={handleConnect}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <LinkedInIcon /> Connect LinkedIn
                    </button>
                    <p className="text-[#333] text-xs">
                      Requires the{" "}
                      <a href="/install-extension" className="underline hover:text-white">Studojo extension</a>
                    </p>
                  </div>
                )}

                {(connectState === "detecting" || connectState === "opening") && (
                  <div className="flex items-center justify-center gap-3 py-6 text-[#666] text-sm">
                    <Spinner />
                    {connectState === "detecting" ? "Checking for extension…" : "Opening LinkedIn tab…"}
                  </div>
                )}

                {connectState === "waiting" && (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative w-14 h-14">
                      <div className="absolute inset-0 rounded-full bg-[#0a66c2]/10 border border-[#0a66c2]/20 flex items-center justify-center">
                        <LinkedInIcon size={22} />
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-[#0a66c2] border-t-transparent animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-white font-medium">Waiting for LinkedIn…</p>
                      <p className="text-xs text-[#444] mt-1">Log in if prompted. Extension grabs cookies automatically.</p>
                    </div>
                    <button onClick={handleRetry} className="text-xs text-[#444] hover:text-white transition-colors">cancel</button>
                  </div>
                )}

                {connectState === "connected" && (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="w-11 h-11 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p className="text-[#4ade80] text-sm font-medium">LinkedIn connected</p>
                    {sessionInfo && (
                      <p className="text-[#444] text-xs">
                        Warmup day {sessionInfo.warmupDay ?? 0}/15
                        {sessionInfo.proxyCountry ? ` · ${sessionInfo.proxyCountry} proxy` : ""}
                        {sessionInfo.cookieAgeDays != null ? ` · cookie ${sessionInfo.cookieAgeDays}d old` : ""}
                      </p>
                    )}
                  </div>
                )}

                {connectState === "no_extension" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-[#1a1200] border border-[#3a2800] rounded-lg flex items-start gap-2">
                      <span className="text-[#fbbf24] text-xs mt-0.5">⚠</span>
                      <div>
                        <p className="text-[#fbbf24] text-xs font-medium">Extension not detected</p>
                        <p className="text-[#666] text-xs mt-0.5">
                          <a href="/install-extension" className="underline hover:text-white">Install it</a> then refresh, or paste cookies manually.
                        </p>
                      </div>
                    </div>
                    <ManualSessionForm
                      onSuccess={() => { setConnectState("connected"); addLog("Session saved manually", "success"); }}
                      addLog={addLog}
                    />
                  </div>
                )}

                {connectState === "error" && (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#1a0000] border border-[#3a0000] rounded-lg flex items-start gap-2">
                      <span className="text-[#f87171] text-xs mt-0.5">✗</span>
                      <p className="text-[#f87171] text-xs">{errorMsg || "Something went wrong."}</p>
                    </div>
                    <button onClick={handleRetry} className="text-xs text-[#555] hover:text-white transition-colors">← Try again</button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Step 2 ── */}
            <div className={`border border-[#1e1e1e] rounded-xl overflow-hidden transition-opacity duration-200 ${connectState !== "connected" ? "opacity-30 pointer-events-none select-none" : ""}`}>
              <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-center gap-3">
                <StepBadge n={2} done={!!step2Result} />
                <span className="text-sm font-medium">Launch Campaign</span>
              </div>

              <div className="px-5 py-5 space-y-4">
                <div>
                  <label className="text-xs text-[#555] block mb-1">Campaign name</label>
                  <input className={inputCls} value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#555] block mb-1">Connection note (max 300 chars)</label>
                  <textarea
                    className={`${inputCls} h-16 resize-none text-xs`}
                    value={connectionNote}
                    onChange={(e) => setConnectionNote(e.target.value)}
                    maxLength={300}
                  />
                  <p className="text-[#333] text-xs text-right mt-0.5">{connectionNote.length}/300</p>
                </div>
                <div>
                  <label className="text-xs text-[#555] block mb-1">LinkedIn URLs — one per line</label>
                  <textarea
                    className={`${inputCls} h-28 resize-none font-mono text-xs`}
                    placeholder={"https://www.linkedin.com/in/person-a/\nhttps://www.linkedin.com/in/person-b/"}
                    value={leadsRaw}
                    onChange={(e) => setLeadsRaw(e.target.value)}
                  />
                </div>

                {step2Result ? (
                  <p className="text-[#4ade80] text-sm">
                    ✓ Queued {step2Result.queued} leads{step2Result.skipped > 0 ? `, ${step2Result.skipped} already existed` : ""}
                  </p>
                ) : (
                  <button
                    onClick={handleLaunch}
                    disabled={step2Loading}
                    className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-[#e5e5e5] transition-colors disabled:opacity-40"
                  >
                    {step2Loading ? "Launching…" : "Create + inject leads →"}
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* ── Log panel ── */}
          <div className="lg:sticky lg:top-6 self-start border border-[#1e1e1e] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
              <span className="text-xs text-[#444] font-medium">Log</span>
              <button onClick={() => setLogs([])} className="text-[#333] text-xs hover:text-white transition-colors">clear</button>
            </div>
            <div ref={logRef} className="h-72 overflow-y-auto p-3 space-y-1 bg-[#060606] font-mono text-[11px]">
              {logs.length === 0 && <p className="text-[#2a2a2a]">Waiting…</p>}
              {logs.map((e, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[#2a2a2a] shrink-0">{e.ts}</span>
                  <span className={e.type === "success" ? "text-[#4ade80]" : e.type === "error" ? "text-[#f87171]" : e.type === "poll" ? "text-[#444]" : "text-[#888]"}>
                    {e.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small components ──────────────────────────────────────────────────────────

function StepBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${done ? "bg-[#4ade80] text-black" : "bg-[#1a1a1a] text-[#555]"}`}>
      {done ? "✓" : n}
    </span>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#2a2a2a" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#666" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function ManualSessionForm({ onSuccess, addLog }: { onSuccess: () => void; addLog: (t: string, type?: "info" | "success" | "error") => void }) {
  const [liAt, setLiAt] = useState("");
  const [jsessionId, setJsessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputCls = "w-full bg-[#0d0d0d] border border-[#222] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-[#333] focus:outline-none focus:border-[#444]";

  async function submit() {
    if (!liAt.trim()) { setError("li_at is required"); return; }
    setLoading(true); setError("");
    addLog("Saving session manually…");
    try {
      const cookieJar = [`li_at=${liAt.trim()}`, jsessionId.trim() ? `JSESSIONID=${jsessionId.trim()}` : ""].filter(Boolean).join("; ");
      const res = await fetch("/api/autoapply/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liAt: liAt.trim(), cookies: cookieJar, userAgent: navigator.userAgent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      onSuccess();
    } catch (e: any) {
      setError(e.message);
      addLog(`Error: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-[#555] block mb-1">li_at *</label>
        <textarea className={`${inputCls} h-14 resize-none`} placeholder="AQEDATxxxxxxx…" value={liAt} onChange={(e) => setLiAt(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-[#555] block mb-1">JSESSIONID (optional)</label>
        <input className={inputCls} placeholder='"ajax:123456789"' value={jsessionId} onChange={(e) => setJsessionId(e.target.value)} />
      </div>
      {error && <p className="text-[#f87171] text-xs">{error}</p>}
      <button onClick={submit} disabled={loading} className="px-3 py-1.5 border border-[#333] text-white text-xs rounded-lg hover:border-[#555] transition-colors disabled:opacity-40">
        {loading ? "Saving…" : "Save manually"}
      </button>
    </div>
  );
}
