"use client";
// LinkedIn Outreach Test — /lkot
// Connect options: (1) local Python script — real browser, real IP
//                 (2) server-side Patchright — credentials login
//                 (3) manual cookie paste — fallback

import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "~/components/common/header";

type ConnectState =
  | "idle"
  | "generating_token"   // fetching one-time token
  | "awaiting_script"    // script shown, polling for completion
  | "logging_in"         // server-side Patchright running
  | "awaiting_otp"       // 2FA triggered
  | "connected"
  | "error";

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

function nowStr() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function LkotPage() {
  const [connectState, setConnectState] = useState<ConnectState>("idle");
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Local script flow
  const [scriptCommand, setScriptCommand] = useState("");
  const [copied, setCopied] = useState(false);

  // Server-side login flow
  const [showServerLogin, setShowServerLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  // OTP
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // Step 2
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

  const addLog = useCallback((text: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [...prev, { ts: nowStr(), text, type }]);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // ── Poll session status (used by both flows) ──────────────────────────────

  function startSessionPoll(maxSeconds = 300) {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    const MAX = maxSeconds / 2;

    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > MAX) {
        clearInterval(pollRef.current!);
        setConnectState("error");
        setErrorMsg("Timed out. Run the command again or try another method.");
        addLog("Polling timed out", "error");
        return;
      }

      try {
        const res = await fetch("/api/autoapply/session/status");
        if (res.status === 401) {
          clearInterval(pollRef.current!);
          setConnectState("error");
          setErrorMsg("Not logged into Studojo.");
          return;
        }
        const data = await res.json();
        if (data.connected) {
          clearInterval(pollRef.current!);
          setSessionInfo({ warmupDay: data.warmupDay, proxyCountry: data.proxyCountry, cookieAgeDays: data.cookieAgeDays });
          setConnectState("connected");
          addLog("Session confirmed — cookies encrypted and stored.", "success");
        } else if (attempts % 5 === 0) {
          addLog(`Waiting… (${attempts * 2}s)`, "poll");
        }
      } catch {
        // transient — keep polling
      }
    }, 2000);
  }

  // ── Poll login job status (server-side Patchright) ────────────────────────

  function startLoginPoll(jid: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    const MAX = 150;

    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > MAX) {
        clearInterval(pollRef.current!);
        setConnectState("error");
        setErrorMsg("Login timed out.");
        return;
      }

      try {
        const res = await fetch(`/api/autoapply/linkedin-login/status?jobId=${jid}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "awaiting_otp") {
          clearInterval(pollRef.current!);
          setConnectState("awaiting_otp");
          addLog("2FA required — enter the code LinkedIn sent you.", "info");
          return;
        }
        if (data.status === "success") {
          clearInterval(pollRef.current!);
          const sess = await fetch("/api/autoapply/session/status").then((r) => r.json()).catch(() => ({}));
          setSessionInfo({ warmupDay: sess.warmupDay, proxyCountry: sess.proxyCountry, cookieAgeDays: sess.cookieAgeDays });
          setConnectState("connected");
          addLog("Logged in — cookies captured and encrypted.", "success");
          return;
        }
        if (data.status === "failed") {
          clearInterval(pollRef.current!);
          setConnectState("error");
          setErrorMsg(data.error ?? "Login failed.");
          addLog(`Login failed: ${data.error}`, "error");
          return;
        }
        if (attempts % 5 === 0) addLog(`Logging in… (${attempts * 2}s)`, "poll");
      } catch { /* keep polling */ }
    }, 2000);
  }

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // ── Option 1: local script ────────────────────────────────────────────────

  async function handleLocalScript() {
    setConnectState("generating_token");
    setErrorMsg("");
    addLog("Generating one-time capture token…");

    try {
      const res = await fetch("/api/autoapply/capture-token", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate token");

      const scriptUrl = `${window.location.origin}/api/autoapply/local-capture-script?token=${data.token}`;
      const cmd = `python3 <(curl -fsSL '${scriptUrl}')`;
      setScriptCommand(cmd);
      setConnectState("awaiting_script");
      addLog("Token generated. Waiting for script to complete…", "info");
      startSessionPoll(1800); // 30-min window
    } catch (e: any) {
      setConnectState("error");
      setErrorMsg(e.message);
      addLog(`Error: ${e.message}`, "error");
    }
  }

  async function copyCommand() {
    await navigator.clipboard.writeText(scriptCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Option 2: server-side login ───────────────────────────────────────────

  async function handleServerLogin() {
    if (!email.trim() || !password.trim()) return;
    setConnectState("logging_in");
    setErrorMsg("");
    addLog(`Starting server-side login for ${email}…`);

    try {
      const res = await fetch("/api/autoapply/linkedin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start login");
      setJobId(data.jobId);
      addLog("Job started — polling…", "info");
      startLoginPoll(data.jobId);
    } catch (e: any) {
      setConnectState("error");
      setErrorMsg(e.message);
      addLog(`Error: ${e.message}`, "error");
    }
  }

  async function handleOtpSubmit() {
    if (!otp.trim() || !jobId) return;
    setOtpLoading(true);
    addLog("Submitting OTP…");
    try {
      const res = await fetch("/api/autoapply/linkedin-login/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      addLog("OTP submitted — completing login…", "info");
      setConnectState("logging_in");
      startLoginPoll(jobId);
    } catch (e: any) {
      addLog(`OTP error: ${e.message}`, "error");
    } finally {
      setOtpLoading(false);
      setOtp("");
    }
  }

  function handleRetry() {
    setConnectState("idle");
    setErrorMsg("");
    setJobId(null);
    setOtp("");
    setScriptCommand("");
    setShowServerLogin(false);
    if (pollRef.current) clearInterval(pollRef.current);
  }

  // ── Step 2 ────────────────────────────────────────────────────────────────

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
      addLog(`Queued ${data.queued} leads`, "success");
    } catch (e: any) {
      addLog(`Error: ${e.message}`, "error");
    } finally {
      setStep2Loading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const inputCls = "w-full bg-[#0d0d0d] border border-[#222] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#555]";
  const connected = connectState === "connected";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-satoshi">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="font-clash text-2xl font-semibold tracking-tight">LinkedIn Outreach — Test</h1>
          <p className="text-[#555] text-sm mt-1">Connect your LinkedIn, then inject leads.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          <div className="space-y-4">

            {/* ── Step 1: Connect ── */}
            <div className="border border-[#1e1e1e] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StepBadge n={1} done={connected} />
                  <span className="text-sm font-medium">Connect LinkedIn</span>
                </div>
                {connected && sessionInfo && (
                  <div className="flex items-center gap-3 text-xs text-[#444]">
                    {sessionInfo.proxyCountry && <span>proxy {sessionInfo.proxyCountry}</span>}
                    <span>day {sessionInfo.warmupDay ?? 0}/15</span>
                    <button onClick={handleRetry} className="hover:text-white transition-colors">reconnect</button>
                  </div>
                )}
              </div>

              <div className="px-5 py-6">

                {/* ── Idle ── */}
                {connectState === "idle" && (
                  <div className="space-y-5">
                    {/* Option 1 — local script (primary) */}
                    <div className="border border-[#1e1e1e] rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-base mt-0.5">💻</span>
                        <div>
                          <p className="text-sm font-medium">Run on your machine <span className="text-[#4ade80] text-xs font-normal ml-1">recommended</span></p>
                          <p className="text-xs text-[#555] mt-0.5">Opens a browser on your PC. Your real IP, zero server detection.</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLocalScript}
                        className="w-full py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#e5e5e5] transition-colors"
                      >
                        Generate command →
                      </button>
                    </div>

                    {/* Option 2 — server login (secondary) */}
                    {!showServerLogin ? (
                      <button
                        onClick={() => setShowServerLogin(true)}
                        className="text-xs text-[#444] hover:text-white transition-colors"
                      >
                        Or log in with credentials (server-side) →
                      </button>
                    ) : (
                      <div className="border border-[#1e1e1e] rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="text-base mt-0.5">🖥</span>
                          <div>
                            <p className="text-sm font-medium">Server-side login</p>
                            <p className="text-xs text-[#555] mt-0.5">We log in on our server via Patchright. Routes through residential proxy.</p>
                          </div>
                        </div>
                        <input type="email" className={inputCls} placeholder="LinkedIn email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className={`${inputCls} pr-14`}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleServerLogin()}
                          />
                          <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-white text-xs transition-colors">
                            {showPassword ? "hide" : "show"}
                          </button>
                        </div>
                        <button
                          onClick={handleServerLogin}
                          disabled={!email.trim() || !password.trim()}
                          className="w-full py-2.5 bg-[#0a66c2] hover:bg-[#004182] disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Log in via server →
                        </button>
                      </div>
                    )}

                    {/* Option 3 — manual paste */}
                    <details className="group">
                      <summary className="text-xs text-[#333] hover:text-[#555] cursor-pointer transition-colors list-none">
                        Paste cookies manually →
                      </summary>
                      <div className="mt-3">
                        <ManualSessionForm
                          onSuccess={() => { setConnectState("connected"); addLog("Session saved manually", "success"); }}
                          addLog={addLog}
                        />
                      </div>
                    </details>
                  </div>
                )}

                {/* ── Generating token ── */}
                {connectState === "generating_token" && (
                  <div className="flex items-center gap-3 py-6 text-[#666] text-sm">
                    <Spinner /> Generating token…
                  </div>
                )}

                {/* ── Script ready ── */}
                {connectState === "awaiting_script" && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-2 p-3 bg-[#0a1a0a] border border-[#1a3a1a] rounded-lg">
                      <span className="text-[#4ade80] text-xs mt-0.5">1.</span>
                      <p className="text-[#aaa] text-xs">Open a terminal and paste this command. A browser window will open — log in and come back.</p>
                    </div>
                    <div className="relative">
                      <pre className="bg-[#0d0d0d] border border-[#222] rounded-lg px-4 py-3 text-xs font-mono text-[#ccc] overflow-x-auto whitespace-pre-wrap break-all select-all">
                        {scriptCommand}
                      </pre>
                      <button
                        onClick={copyCommand}
                        className="absolute top-2 right-2 px-2 py-1 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#333] rounded text-[10px] text-[#888] hover:text-white transition-colors"
                      >
                        {copied ? "✓ copied" : "copy"}
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-[#555] text-xs">
                      <Spinner />
                      Waiting for script to complete…
                      <button onClick={handleRetry} className="ml-auto hover:text-white transition-colors">cancel</button>
                    </div>
                    <p className="text-[#2a2a2a] text-xs">Requires Python 3 + pip. Script installs playwright automatically.</p>
                  </div>
                )}

                {/* ── Server login in progress ── */}
                {connectState === "logging_in" && (
                  <div className="flex flex-col items-center gap-4 py-6">
                    <div className="relative w-14 h-14">
                      <div className="absolute inset-0 rounded-full bg-[#0a66c2]/10 border border-[#0a66c2]/20 flex items-center justify-center">
                        <LinkedInIcon size={22} />
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-[#0a66c2] border-t-transparent animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Logging in via server…</p>
                      <p className="text-xs text-[#444] mt-1">Patchright is navigating LinkedIn through a residential proxy.</p>
                    </div>
                    <button onClick={handleRetry} className="text-xs text-[#444] hover:text-white transition-colors">cancel</button>
                  </div>
                )}

                {/* ── OTP ── */}
                {connectState === "awaiting_otp" && (
                  <div className="flex flex-col items-center gap-5 py-4 max-w-xs mx-auto">
                    <div className="w-12 h-12 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center text-xl">🔐</div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Two-factor code</p>
                      <p className="text-xs text-[#555] mt-1">LinkedIn sent a code to your phone or email.</p>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={`${inputCls} text-center text-xl tracking-widest font-mono`}
                      placeholder="000000"
                      maxLength={8}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && handleOtpSubmit()}
                      autoFocus
                    />
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={handleOtpSubmit}
                        disabled={otp.length < 4 || otpLoading}
                        className="flex-1 py-2.5 bg-[#0a66c2] hover:bg-[#004182] disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {otpLoading ? "Submitting…" : "Submit code"}
                      </button>
                      <button onClick={handleRetry} className="px-3 py-2 border border-[#222] text-[#555] hover:text-white rounded-lg text-sm transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Connected ── */}
                {connected && (
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

                {/* ── Error ── */}
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
            <div className={`border border-[#1e1e1e] rounded-xl overflow-hidden transition-opacity duration-200 ${!connected ? "opacity-30 pointer-events-none select-none" : ""}`}>
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
                  <textarea className={`${inputCls} h-16 resize-none text-xs`} value={connectionNote} onChange={(e) => setConnectionNote(e.target.value)} maxLength={300} />
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
                  <p className="text-[#4ade80] text-sm">✓ Queued {step2Result.queued} leads{step2Result.skipped > 0 ? `, ${step2Result.skipped} already existed` : ""}</p>
                ) : (
                  <button onClick={handleLaunch} disabled={step2Loading} className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-[#e5e5e5] transition-colors disabled:opacity-40">
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
    <div className="space-y-2">
      <div>
        <label className="text-xs text-[#444] block mb-1">li_at *</label>
        <textarea className={`${inputCls} h-12 resize-none`} placeholder="AQEDATxxxxxxx…" value={liAt} onChange={(e) => setLiAt(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-[#444] block mb-1">JSESSIONID (optional)</label>
        <input className={inputCls} placeholder='"ajax:123456789"' value={jsessionId} onChange={(e) => setJsessionId(e.target.value)} />
      </div>
      {error && <p className="text-[#f87171] text-xs">{error}</p>}
      <button onClick={submit} disabled={loading} className="px-3 py-1.5 border border-[#333] text-[#888] text-xs rounded-lg hover:border-[#555] hover:text-white transition-colors disabled:opacity-40">
        {loading ? "Saving…" : "Save manually"}
      </button>
    </div>
  );
}
