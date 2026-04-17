"use client";
import { useEffect, useState, useCallback } from "react";
import {
  FiCheck,
  FiRefreshCw,
  FiUser,
  FiWifi,
  FiWifiOff,
  FiSend,
  FiUserPlus,
  FiDownload,
} from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { outreachFetch } from "~/lib/outreach/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TokenStatus {
  connected: boolean;
  linkedin_name?: string | null;
}

type Tab = "message" | "connect";

type ResultState =
  | { status: "idle" }
  | { status: "loading"; label: string }
  | { status: "success"; label: string }
  | { status: "error"; label: string };

// ── Extension status banner ───────────────────────────────────────────────────

function ExtensionBanner({ status, onRefresh }: { status: TokenStatus | null; onRefresh: () => void }) {
  if (status === null) {
    return (
      <div className="rounded-2xl border-2 border-neutral-200 bg-white p-5 shadow-sm flex items-center gap-3 animate-pulse">
        <div className="h-5 w-5 rounded-full bg-neutral-200" />
        <div className="h-4 w-48 rounded bg-neutral-200" />
      </div>
    );
  }

  if (!status.connected) {
    return (
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <FiWifiOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="font-satoshi text-sm font-semibold text-amber-800">
              LinkedIn not connected
            </p>
            <p className="mt-0.5 font-satoshi text-xs text-amber-700">
              Install the LeadFlow extension, open it, and click "Connect LinkedIn". Then refresh below.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="https://studojo.com/outreach/install-extension"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border-2 border-studojo-ink bg-white px-3 py-1.5 font-satoshi text-xs font-semibold shadow-brutal transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                <FiDownload className="h-3 w-3" />
                Get extension
              </a>
              <button
                onClick={onRefresh}
                className="inline-flex items-center gap-1.5 rounded-lg border-2 border-studojo-ink bg-white px-3 py-1.5 font-satoshi text-xs font-semibold shadow-brutal transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                <FiRefreshCw className="h-3 w-3" />
                Refresh status
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <FiWifi className="h-4 w-4 shrink-0 text-green-600" />
        <span className="font-satoshi text-sm font-semibold text-green-800">
          LinkedIn connected
          {status.linkedin_name ? ` — ${status.linkedin_name}` : ""}
        </span>
      </div>
      <span className="rounded-full bg-green-200 px-2 py-0.5 font-satoshi text-xs font-bold text-green-800">
        Active
      </span>
    </div>
  );
}

// ── Send panel ────────────────────────────────────────────────────────────────

function SendPanel({ connected }: { connected: boolean }) {
  const [tab, setTab] = useState<Tab>("message");
  const [profileUrl, setProfileUrl] = useState("");
  const [content, setContent] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<ResultState>({ status: "idle" });

  const reset = () => setResult({ status: "idle" });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUrl.trim() || !content.trim()) return;
    setResult({ status: "loading", label: "Sending message…" });
    try {
      await outreachFetch("/linkedin/message", {
        method: "POST",
        body: JSON.stringify({ profile_url: profileUrl.trim(), content: content.trim() }),
        maxRetries: 1,
        timeout: 30000,
      });
      setResult({ status: "success", label: "Message sent!" });
      setContent("");
    } catch (err: unknown) {
      const msg =
        (err as { body?: { detail?: string }; message?: string })?.body?.detail ||
        (err as { message?: string })?.message ||
        "Failed to send. Try again.";
      setResult({ status: "error", label: msg });
    }
  };

  const handleSendConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUrl.trim()) return;
    setResult({ status: "loading", label: "Sending connection request…" });
    try {
      await outreachFetch("/linkedin/connect-request", {
        method: "POST",
        body: JSON.stringify({ profile_url: profileUrl.trim(), note: note.trim() }),
        maxRetries: 1,
        timeout: 30000,
      });
      setResult({ status: "success", label: "Connection request sent!" });
      setNote("");
    } catch (err: unknown) {
      const msg =
        (err as { body?: { detail?: string }; message?: string })?.body?.detail ||
        (err as { message?: string })?.message ||
        "Failed to send. Try again.";
      setResult({ status: "error", label: msg });
    }
  };

  const isLoading = result.status === "loading";

  return (
    <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal">
      {/* Tabs */}
      <div className="flex border-b-2 border-studojo-ink">
        {(["message", "connect"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); reset(); }}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3.5 font-satoshi text-sm font-semibold transition-colors first:rounded-tl-2xl last:rounded-tr-2xl ${
              tab === t
                ? "bg-studojo-purple text-white"
                : "bg-white text-studojo-muted hover:text-studojo-ink"
            }`}
          >
            {t === "message" ? <FiSend className="h-3.5 w-3.5" /> : <FiUserPlus className="h-3.5 w-3.5" />}
            {t === "message" ? "Send Message" : "Send Connection"}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Profile URL — shared across tabs */}
        <div className="mb-4">
          <label className="mb-1.5 block font-satoshi text-xs font-semibold uppercase tracking-wide text-studojo-muted">
            LinkedIn Profile URL
          </label>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-studojo-ink bg-neutral-50">
              <FiUser className="h-4 w-4 text-studojo-muted" />
            </div>
            <input
              type="url"
              value={profileUrl}
              onChange={(e) => { setProfileUrl(e.target.value); reset(); }}
              placeholder="https://linkedin.com/in/username"
              disabled={isLoading || !connected}
              className="h-9 flex-1 rounded-xl border-2 border-studojo-ink bg-neutral-50 px-3 font-satoshi text-sm text-studojo-ink placeholder:text-studojo-muted focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-1 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Tab-specific content */}
        {tab === "message" ? (
          <form onSubmit={handleSendMessage}>
            <label className="mb-1.5 block font-satoshi text-xs font-semibold uppercase tracking-wide text-studojo-muted">
              Message
            </label>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); reset(); }}
              placeholder="Hey [Name], I came across your profile and wanted to reach out…"
              rows={5}
              disabled={isLoading || !connected}
              className="mb-4 w-full resize-none rounded-xl border-2 border-studojo-ink bg-neutral-50 px-3 py-2.5 font-satoshi text-sm text-studojo-ink placeholder:text-studojo-muted focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-1 disabled:opacity-50"
            />
            <ResultBox result={result} />
            <button
              type="submit"
              disabled={isLoading || !connected || !profileUrl.trim() || !content.trim()}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-studojo-ink bg-studojo-purple font-satoshi text-sm font-semibold text-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? (
                <><FiRefreshCw className="h-4 w-4 animate-spin" /> Sending…</>
              ) : (
                <><FiSend className="h-4 w-4" /> Send Message</>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSendConnect}>
            <label className="mb-1.5 block font-satoshi text-xs font-semibold uppercase tracking-wide text-studojo-muted">
              Note{" "}
              <span className="font-normal normal-case text-studojo-muted">(optional, max 300 chars)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => { setNote(e.target.value.slice(0, 300)); reset(); }}
              placeholder="Hi [Name], I'd love to connect — I'm interested in roles at [Company]."
              rows={4}
              disabled={isLoading || !connected}
              className="mb-1 w-full resize-none rounded-xl border-2 border-studojo-ink bg-neutral-50 px-3 py-2.5 font-satoshi text-sm text-studojo-ink placeholder:text-studojo-muted focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-1 disabled:opacity-50"
            />
            <div className="mb-4 text-right font-satoshi text-xs text-studojo-muted">
              {note.length}/300
            </div>
            <ResultBox result={result} />
            <button
              type="submit"
              disabled={isLoading || !connected || !profileUrl.trim()}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-studojo-ink bg-studojo-ink font-satoshi text-sm font-semibold text-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? (
                <><FiRefreshCw className="h-4 w-4 animate-spin" /> Sending…</>
              ) : (
                <><FiUserPlus className="h-4 w-4" /> Send Connection Request</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ResultBox({ result }: { result: ResultState }) {
  if (result.status === "idle") return null;
  if (result.status === "loading") return null;

  const isSuccess = result.status === "success";
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 font-satoshi text-sm font-semibold ${
        isSuccess
          ? "border-green-300 bg-green-50 text-green-700"
          : "border-red-300 bg-red-50 text-red-700"
      }`}
    >
      {isSuccess && <FiCheck className="h-4 w-4 shrink-0" />}
      {result.label}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LinkedInOutreachPage() {
  const { loading: authLoading } = useOutreachAuth();
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);

  const fetchStatus = useCallback(async () => {
    setTokenStatus(null);
    try {
      const s = await outreachFetch<TokenStatus>("/linkedin/token/status");
      setTokenStatus(s);
    } catch {
      setTokenStatus({ connected: false });
    }
  }, []);

  useEffect(() => {
    if (!authLoading) fetchStatus();
  }, [authLoading, fetchStatus]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32">
          <FiRefreshCw className="h-8 w-8 animate-spin text-studojo-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* Hero */}
      <section className="border-b-2 border-studojo-ink bg-white px-4 py-10 md:px-8">
        <div className="mx-auto max-w-[var(--section-max-width)]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-studojo-ink bg-violet-500 px-4 py-1 font-satoshi text-xs font-bold uppercase tracking-wider text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
            LinkedIn Outreach
          </div>
          <h1 className="font-clash text-3xl font-bold text-studojo-ink md:text-4xl">
            Send messages and connections.
          </h1>
          <p className="mt-2 max-w-xl font-satoshi text-base text-studojo-muted">
            Connect your LinkedIn account via the extension, then send messages
            and connection requests directly from here.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="mx-auto max-w-2xl px-4 py-10 md:px-8">
        <div className="flex flex-col gap-6">
          {/* Extension status */}
          <ExtensionBanner status={tokenStatus} onRefresh={fetchStatus} />

          {/* Send panel */}
          <SendPanel connected={tokenStatus?.connected ?? false} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
