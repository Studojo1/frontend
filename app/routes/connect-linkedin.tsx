// /connect-linkedin?token=xxx
// Token-based LinkedIn connect page — no Studojo login required.
// Sent via email link (Gojiberry-style).

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "redis";
import type { Route } from "./+types/connect-linkedin";

const REDIS_URL = process.env.REDIS_URL ?? "redis://redis.studojo.svc.cluster.local:6379";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? "";

let _redis: ReturnType<typeof createClient> | null = null;
async function getRedis() {
  if (_redis) return _redis;
  _redis = createClient({ url: REDIS_URL, password: REDIS_PASSWORD || undefined });
  _redis.on("error", () => {});
  await _redis.connect();
  return _redis;
}

export async function loader({ request }: Route.LoaderArgs) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) return Response.json({ valid: false, reason: "missing" });

  const redis = await getRedis();
  const userId = await redis.get(`linkedin_connect_token:${token}`);

  return Response.json({ valid: !!userId, reason: userId ? null : "expired" });
}

export function meta() {
  return [
    { title: "Connect LinkedIn | Studojo" },
    { name: "robots", content: "noindex" },
  ];
}

// ── Types ────────────────────────────────────────────────────────────────────

type Step = "form" | "logging_in" | "awaiting_otp" | "awaiting_app_push" | "success" | "error";

function nowStr() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ConnectLinkedIn({ loaderData }: Route.ComponentProps) {
  const { valid, reason } = loaderData as { valid: boolean; reason: string | null };

  const [token] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("token") ?? "";
  });

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  function startPoll(jid: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;

    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > 150) {
        clearInterval(pollRef.current!);
        setStep("error");
        setErrorMsg("Login timed out. Please try again.");
        return;
      }

      try {
        const res = await fetch(`/api/autoapply/token-login/status?jobId=${jid}&connectToken=${encodeURIComponent(token)}`);
        if (res.status === 401) {
          clearInterval(pollRef.current!);
          setStep("error");
          setErrorMsg("This link has expired. Please request a new one.");
          return;
        }
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "awaiting_otp") {
          clearInterval(pollRef.current!);
          setStep("awaiting_otp");
        } else if (data.status === "awaiting_app_push") {
          clearInterval(pollRef.current!);
          setStep("awaiting_app_push");
          startPoll(jid);
        } else if (data.status === "success") {
          clearInterval(pollRef.current!);
          setStep("success");
        } else if (data.status === "failed") {
          clearInterval(pollRef.current!);
          setStep("error");
          setErrorMsg(data.error ?? "Login failed. Check your credentials and try again.");
        } else if (attempts % 5 === 0) {
          setStatusMsg(`Logging in… (${attempts * 2}s)`);
        }
      } catch { /* keep polling */ }
    }, 2000);
  }

  async function handleLogin() {
    if (!email.trim() || !password.trim() || !token) return;
    setStep("logging_in");
    setStatusMsg("Connecting to LinkedIn…");
    setErrorMsg("");

    try {
      const res = await fetch("/api/autoapply/token-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectToken: token, email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start login");
      setJobId(data.jobId);
      startPoll(data.jobId);
    } catch (e: any) {
      setStep("error");
      setErrorMsg(e.message);
    }
  }

  async function handleOtp() {
    if (!otp.trim() || !jobId || !token) return;
    setOtpLoading(true);
    try {
      const res = await fetch("/api/autoapply/token-login/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, otp: otp.trim(), connectToken: token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setStep("logging_in");
      setStatusMsg("Verifying code…");
      startPoll(jobId);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setOtpLoading(false);
      setOtp("");
    }
  }

  const inputCls = "w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-sm text-[#0a0a0a] placeholder-[#aaa] focus:outline-none focus:border-[#0a66c2] transition-colors";

  // ── Invalid / expired token ───────────────────────────────────────────────
  if (!valid) {
    return (
      <Page>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <h2 className="text-lg font-semibold text-[#0a0a0a] mb-2">Link expired</h2>
          <p className="text-sm text-[#777]">
            {reason === "missing" ? "No token found in this link." : "This link has expired or already been used."}
            {" "}Please request a new connect link.
          </p>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {step === "form" && (
        <div className="space-y-5">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#0a66c2] flex items-center justify-center mx-auto mb-4">
              <LinkedInIcon size={24} />
            </div>
            <h2 className="text-xl font-semibold text-[#0a0a0a] mb-1">Connect LinkedIn</h2>
            <p className="text-sm text-[#777]">Enter your LinkedIn credentials. We log in on a secure server — your password is never stored.</p>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              className={inputCls}
              placeholder="LinkedIn email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`${inputCls} pr-16`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#aaa] hover:text-[#555] transition-colors"
              >
                {showPassword ? "hide" : "show"}
              </button>
            </div>
            <button
              onClick={handleLogin}
              disabled={!email.trim() || !password.trim()}
              className="w-full py-3 bg-[#0a66c2] hover:bg-[#004182] disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Connect →
            </button>
          </div>

          <p className="text-center text-xs text-[#aaa]">
            Your password is used once to capture your session cookie, then discarded.
          </p>
        </div>
      )}

      {step === "logging_in" && (
        <div className="flex flex-col items-center gap-5 py-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-[#0a66c2]/10 border border-[#0a66c2]/20 flex items-center justify-center">
              <LinkedInIcon size={24} />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-[#0a66c2] border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#0a0a0a]">Logging in to LinkedIn…</p>
            <p className="text-xs text-[#999] mt-1">{statusMsg || "This takes a few seconds."}</p>
          </div>
        </div>
      )}

      {step === "awaiting_otp" && (
        <div className="flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-xl">🔐</div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-[#0a0a0a] mb-1">Enter your code</h2>
            <p className="text-sm text-[#777]">LinkedIn sent a verification code to your phone or email.</p>
          </div>
          {errorMsg && <p className="text-sm text-red-500 text-center">{errorMsg}</p>}
          <input
            type="text"
            inputMode="numeric"
            className={`${inputCls} text-center text-2xl tracking-widest font-mono`}
            placeholder="000000"
            maxLength={8}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleOtp()}
            autoFocus
          />
          <button
            onClick={handleOtp}
            disabled={otp.length < 4 || otpLoading}
            className="w-full py-3 bg-[#0a66c2] hover:bg-[#004182] disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {otpLoading ? "Verifying…" : "Submit code"}
          </button>
        </div>
      )}

      {step === "awaiting_app_push" && (
        <div className="flex flex-col items-center gap-5 py-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-[#0a66c2]/10 border border-[#0a66c2]/20 flex items-center justify-center text-2xl">📱</div>
            <div className="absolute inset-0 rounded-2xl border-2 border-[#0a66c2] border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-[#0a0a0a] mb-1">Check your LinkedIn app</h2>
            <p className="text-sm text-[#777] max-w-[240px] mx-auto">
              LinkedIn sent a push notification to your phone. Open the LinkedIn app and tap <strong>Approve</strong>.
            </p>
          </div>
          <p className="text-xs text-[#bbb]">Waiting for approval…</p>
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center gap-5 py-4">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-[#0a0a0a] mb-2">LinkedIn connected!</h2>
            <p className="text-sm text-[#777]">Your session is active. You can close this tab.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#bbb]">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Session encrypted and stored
          </div>
        </div>
      )}

      {step === "error" && (
        <div className="flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-[#0a0a0a] mb-2">Connection failed</h2>
            <p className="text-sm text-[#777]">{errorMsg || "Something went wrong."}</p>
          </div>
          <button
            onClick={() => { setStep("form"); setErrorMsg(""); setJobId(null); setOtp(""); }}
            className="px-5 py-2.5 border border-[#e5e5e5] text-sm text-[#555] rounded-lg hover:border-[#ccc] transition-colors"
          >
            Try again
          </button>
        </div>
      )}
    </Page>
  );
}

// ── Layout wrapper ────────────────────────────────────────────────────────────

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f8f5] flex flex-col">
      {/* Minimal header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-lg mx-auto w-full">
        <span className="font-semibold text-[#0a0a0a] tracking-tight">Studojo</span>
        <span className="text-xs text-[#aaa]">LinkedIn Connect</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-[#e8e8e5] p-8 shadow-sm">
          {children}
        </div>
      </main>

      <footer className="py-5 text-center text-xs text-[#ccc]">
        Studojo · Your session is encrypted end-to-end
      </footer>
    </div>
  );
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
