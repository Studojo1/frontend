"use client";
// LinkedIn Outreach Test — /lkot
// Primary: Chrome extension (Option C — opens LinkedIn tab, auto-captures)
// Fallback: email + password (server-side Patchright)
// Last resort: manual cookie paste

import { redirect } from "react-router";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/lkot";
import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "~/components/common/header";

// ── Auth guard ────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth?redirect=/lkot");
  return null;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type ConnectState =
  | "idle"
  | "detecting"       // 2s window to check if extension is present
  | "no_extension"    // extension not found
  | "opening"         // extension opening LinkedIn tab
  | "waiting"         // polling for session (extension flow)
  | "logging_in"      // server-side Patchright
  | "awaiting_otp"    // 2FA
  | "connected"
  | "error";

interface SessionInfo { warmupDay?: number; proxyCountry?: string; cookieAgeDays?: number; }
interface LogEntry { ts: string; text: string; type: "info" | "success" | "error" | "poll"; }

function nowStr() { return new Date().toLocaleTimeString("en-GB", { hour12: false }); }

// ── Main ──────────────────────────────────────────────────────────────────────

export default function LkotPage() {
  const [connectState, setConnectState] = useState<ConnectState>("idle");
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Credentials fallback
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
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

  // ── Extension detection ───────────────────────────────────────────────────

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

  // ── Session poll (extension flow) ─────────────────────────────────────────

  function startSessionPoll() {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;

    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > 90) { // 3 min
        clearInterval(pollRef.current!);
        setConnectState("error");
        setErrorMsg("Timed out waiting for LinkedIn session.");
        addLog("Timed out", "error");
        return;
      }
      try {
        const res = await fetch("/api/autoapply/session/status");
        if (res.status === 401) { clearInterval(pollRef.current!); return; }
        const data = await res.json();
        if (data.connected) {
          clearInterval(pollRef.current!);
          setSessionInfo({ warmupDay: data.warmupDay, proxyCountry: data.proxyCountry, cookieAgeDays: data.cookieAgeDays });
          setConnectState("connected");
          addLog("Session confirmed.", "success");
        } else if (attempts % 5 === 0) {
          addLog(`Waiting… (${attempts * 2}s)`, "poll");
        }
      } catch { /* keep polling */ }
    }, 2000);
  }

  // ── Login job poll (credentials flow) ────────────────────────────────────

  function startLoginPoll(jid: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;

    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > 150) {
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
        } else if (data.status === "success") {
          clearInterval(pollRef.current!);
          const sess = await fetch("/api/autoapply/session/status").then((r) => r.json()).catch(() => ({}));
          setSessionInfo({ warmupDay: sess.warmupDay, proxyCountry: sess.proxyCountry, cookieAgeDays: sess.cookieAgeDays });
          setConnectState("connected");
          addLog("Logged in — cookies captured and encrypted.", "success");
        } else if (data.status === "failed") {
          clearInterval(pollRef.current!);
          setConnectState("error");
          setErrorMsg(data.error ?? "Login failed.");
          addLog(`Failed: ${data.error}`, "error");
        } else if (attempts % 5 === 0) {
          addLog(`Logging in… (${attempts * 2}s)`, "poll");
        }
      } catch { /* keep polling */ }
    }, 2000);
  }

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // ── Extension push events ─────────────────────────────────────────────────

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data?.type === "STUDOJO_SESSION_CAPTURED") {
        addLog("Extension: session captured!", "success");
        // poll will pick it up within 2s
      }
      if (e.data?.type === "STUDOJO_SESSION_CAPTURE_FAILED") {
        const err = e.data.error as string;
        const msg =
          err === "not_logged_in_linkedin" ? "Not logged into LinkedIn — log in first."
          : err === "not_logged_in_studojo" ? "Not logged into Studojo."
          : `Extension error: ${err}`;
        if (pollRef.current) clearInterval(pollRef.current);
        setConnectState("error");
        setErrorMsg(msg);
        addLog(msg, "error");
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [addLog]);

  // ── Extension connect ─────────────────────────────────────────────────────

  async function handleConnect() {
    setConnectState("detecting");
    setErrorMsg("");
    addLog("Checking for extension…");

    const present = await detectExtension();

    if (!present) {
      setConnectState("no_extension");
      addLog("Extension not found.", "error");
      return;
    }

    addLog("Extension found — opening LinkedIn…");
    setConnectState("opening");
    window.postMessage({ type: "STUDOJO_OPEN_LINKEDIN" }, "*");

    await new Promise<void>((resolve) => {
      const t = setTimeout(resolve, 3000);
      function onAck(e: MessageEvent) {
        if (e.data?.type === "STUDOJO_LINKEDIN_OPENED") {
          clearTimeout(t); window.removeEventListener("message", onAck); resolve();
        }
      }
      window.addEventListener("message", onAck);
    });

    setConnectState("waiting");
    addLog("LinkedIn tab opened — waiting for auto-capture…");
    startSessionPoll();
  }

  // ── Credentials connect ───────────────────────────────────────────────────

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
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setJobId(data.jobId);
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
    try {
      const res = await fetch("/api/autoapply/linkedin-login/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      addLog("OTP submitted…", "info");
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
    if (pollRef.current) clearInterval(pollRef.current);
  }

  // ── Step 2 ────────────────────────────────────────────────────────────────

  async function handleLaunch() {
    setStep2Loading(true);
    addLog("Setting up campaign…");
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
      if (!urls.length) { addLog("No valid LinkedIn URLs", "error"); return; }
      addLog(`Injecting ${urls.length} lead(s)…`);
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

            {/* ── Step 1 ── */}
            <div className="border border-[#1e1e1e] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StepBadge n={1} done={connected} />
                  <span className="text-sm font-medium">Connect LinkedIn</span>
                </div>
                {connected && (
                  <div className="flex items-center gap-3 text-xs text-[#444]">
                    {sessionInfo?.proxyCountry && <span>proxy {sessionInfo.proxyCountry}</span>}
                    {sessionInfo?.warmupDay != null && <span>day {sessionInfo.warmupDay}/15</span>}
                    <button onClick={handleRetry} className="hover:text-white transition-colors">reconnect</button>
                  </div>
                )}
              </div>

              <div className="px-5 py-6">

                {connectState === "idle" && (
                  <div className="space-y-5">
                    {/* Primary: extension */}
                    <div className="flex flex-col items-center gap-4 py-2">
                      <p className="text-[#555] text-sm text-center max-w-xs">
                        One click — the extension opens LinkedIn and captures your session automatically.
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleConnect}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <LinkedInIcon /> Connect LinkedIn
                        </button>
                        <a
                          href="/install-extension"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2.5 border border-[#2a2a2a] hover:border-[#444] text-[#888] hover:text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          Download extension
                        </a>
                      </div>
                      <p className="text-[#333] text-xs">Install once — works on all Studojo pages</p>
                    </div>

                    <div className="border-t border-[#111] pt-4 space-y-3">
                      {/* Fallback: credentials */}
                      <details>
                        <summary className="text-xs text-[#333] hover:text-[#555] cursor-pointer transition-colors list-none">No extension? Log in with email + password →</summary>
                        <div className="mt-3 space-y-3">
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
                          <button onClick={handleServerLogin} disabled={!email.trim() || !password.trim()} className="w-full py-2 bg-[#0a66c2] hover:bg-[#004182] disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors">
                            Log in via server →
                          </button>
                        </div>
                      </details>

                      {/* Last resort: manual paste */}
                      <details>
                        <summary className="text-xs text-[#333] hover:text-[#555] cursor-pointer transition-colors list-none">Paste cookies manually →</summary>
                        <div className="mt-3">
                          <ManualSessionForm onSuccess={() => { setConnectState("connected"); addLog("Session saved manually", "success"); }} addLog={addLog} />
                        </div>
                      </details>
                    </div>
                  </div>
                )}

                {(connectState === "detecting" || connectState === "opening") && (
                  <div className="flex items-center justify-center gap-3 py-8 text-[#666] text-sm">
                    <Spinner />
                    {connectState === "detecting" ? "Checking for extension…" : "Opening LinkedIn tab…"}
                  </div>
                )}

                {connectState === "waiting" && (
                  <div className="flex flex-col items-center gap-4 py-6">
                    <div className="relative w-14 h-14">
                      <div className="absolute inset-0 rounded-full bg-[#0a66c2]/10 border border-[#0a66c2]/20 flex items-center justify-center">
                        <LinkedInIcon size={22} />
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-[#0a66c2] border-t-transparent animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Waiting for LinkedIn…</p>
                      <p className="text-xs text-[#444] mt-1">Log in if prompted. Extension grabs cookies automatically.</p>
                    </div>
                    <button onClick={handleRetry} className="text-xs text-[#444] hover:text-white transition-colors">cancel</button>
                  </div>
                )}

                {connectState === "logging_in" && (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="relative w-14 h-14">
                      <div className="absolute inset-0 rounded-full bg-[#0a66c2]/10 border border-[#0a66c2]/20 flex items-center justify-center">
                        <LinkedInIcon size={22} />
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-[#0a66c2] border-t-transparent animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Logging in…</p>
                      <p className="text-xs text-[#444] mt-1">Our server is navigating LinkedIn via residential proxy.</p>
                    </div>
                    <button onClick={handleRetry} className="text-xs text-[#444] hover:text-white transition-colors">cancel</button>
                  </div>
                )}

                {connectState === "awaiting_otp" && (
                  <div className="flex flex-col items-center gap-5 py-4 max-w-xs mx-auto">
                    <div className="w-12 h-12 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center text-xl">🔐</div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Two-factor code</p>
                      <p className="text-xs text-[#555] mt-1">LinkedIn sent a code to your phone or email.</p>
                    </div>
                    <input
                      type="text" inputMode="numeric"
                      className={`${inputCls} text-center text-xl tracking-widest font-mono`}
                      placeholder="000000" maxLength={8}
                      value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && handleOtpSubmit()}
                      autoFocus
                    />
                    <div className="flex gap-3 w-full">
                      <button onClick={handleOtpSubmit} disabled={otp.length < 4 || otpLoading} className="flex-1 py-2.5 bg-[#0a66c2] hover:bg-[#004182] disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors">
                        {otpLoading ? "Submitting…" : "Submit code"}
                      </button>
                      <button onClick={handleRetry} className="px-3 border border-[#222] text-[#555] hover:text-white rounded-lg text-sm transition-colors">Cancel</button>
                    </div>
                  </div>
                )}

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

                {connectState === "no_extension" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-[#1a1200] border border-[#3a2800] rounded-lg flex items-start gap-2">
                      <span className="text-[#fbbf24] text-xs mt-0.5">⚠</span>
                      <div>
                        <p className="text-[#fbbf24] text-xs font-medium">Extension not detected</p>
                        <p className="text-[#666] text-xs mt-1">
                          <a href="/install-extension" className="underline hover:text-white">Install the Studojo extension</a>
                          {" "}and refresh, or use a fallback below.
                        </p>
                      </div>
                    </div>
                    <details open>
                      <summary className="text-xs text-[#555] cursor-pointer list-none mb-3">Log in with email + password →</summary>
                      <div className="space-y-3">
                        <input type="email" className={inputCls} placeholder="LinkedIn email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} className={`${inputCls} pr-14`} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleServerLogin()} />
                          <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-white text-xs transition-colors">{showPassword ? "hide" : "show"}</button>
                        </div>
                        <button onClick={handleServerLogin} disabled={!email.trim() || !password.trim()} className="w-full py-2 bg-[#0a66c2] hover:bg-[#004182] disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors">Log in via server →</button>
                      </div>
                    </details>
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
                  <textarea className={`${inputCls} h-28 resize-none font-mono text-xs`} placeholder={"https://www.linkedin.com/in/person-a/\nhttps://www.linkedin.com/in/person-b/"} value={leadsRaw} onChange={(e) => setLeadsRaw(e.target.value)} />
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
                  <span className={e.type === "success" ? "text-[#4ade80]" : e.type === "error" ? "text-[#f87171]" : e.type === "poll" ? "text-[#444]" : "text-[#888]"}>{e.text}</span>
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
