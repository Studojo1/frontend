import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import {
  FiDownload,
  FiSearch,
  FiCopy,
  FiCheck,
  FiExternalLink,
  FiRefreshCw,
  FiX,
  FiUser,
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

interface SearchJob {
  id: number;
  status: "queued" | "running" | "done" | "failed";
  target_role: string;
  result_count: number;
  error?: string | null;
  created_at: string;
}

interface Lead {
  id: number;
  name: string;
  headline?: string | null;
  company?: string | null;
  profile_url: string;
  profile_image_url?: string | null;
  suggested_message?: string | null;
  message_copied_at?: string | null;
}

// ── Install step ──────────────────────────────────────────────────────────────

function InstallStep() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border-2 border-studojo-ink bg-white p-8 shadow-brutal text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-studojo-ink bg-violet-100">
          <span className="text-2xl font-bold text-studojo-purple" style={{ fontFamily: "'Clash Display', sans-serif" }}>S</span>
        </div>
        <h2 className="font-clash text-2xl font-bold text-studojo-ink mb-2">
          Install the Chrome Extension
        </h2>
        <p className="font-satoshi text-sm text-studojo-muted mb-6 leading-relaxed">
          The Studojo extension reads your LinkedIn session securely so we can
          find the right people for you to connect with. Nothing is stored
          except an encrypted token — your session never leaves your browser in
          plain text.
        </p>

        <div className="mb-6 flex flex-col gap-3 text-left">
          {[
            "Install the extension below",
            "Click the extension icon in your toolbar",
            "Hit \"Connect LinkedIn\" — done in 5 seconds",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-violet-500 font-satoshi text-xs font-bold text-white">
                {i + 1}
              </div>
              <span className="font-satoshi text-sm text-studojo-ink">{step}</span>
            </div>
          ))}
        </div>

        <a
          href="https://studojo.com/install-extension"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-studojo-ink bg-studojo-purple font-satoshi text-sm font-semibold text-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          <FiDownload className="h-4 w-4" />
          Install Extension (Chrome)
        </a>

        <p className="mt-4 font-satoshi text-xs text-studojo-muted">
          Already installed? Open the extension popup and click Connect LinkedIn.
          Then refresh this page.
        </p>
      </div>
    </div>
  );
}

// ── Search form ───────────────────────────────────────────────────────────────

interface SearchFormProps {
  onJobStarted: (job: SearchJob) => void;
}

function SearchForm({ onJobStarted }: SearchFormProps) {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) return;
    setLoading(true);
    setError("");
    try {
      // 1. Create job on backend (returns job ID immediately)
      const job = await outreachFetch<SearchJob>("/linkedin/search", {
        method: "POST",
        body: JSON.stringify({
          target_role: role.trim(),
          location: location.trim() || undefined,
        }),
      });

      // 2. Get Studojo session cookie to pass to extension
      const sessionCookie = document.cookie
        .split("; ")
        .find((c) => c.startsWith("__Secure-better-auth.session_token=") || c.startsWith("better-auth.session_token="))
        ?.split("=")
        .slice(1)
        .join("=") || "";

      // 3. Tell extension to do the LinkedIn search and submit results to backend
      const submitUrl = `${window.location.origin}/api/v1/outreach/linkedin/search/${job.id}/submit-results`;
      window.dispatchEvent(
        new CustomEvent("STUDOJO_SEARCH", {
          detail: { jobId: job.id, keywords: role.trim(), location: location.trim() || null, apiUrl: submitUrl, sessionCookie },
        })
      );

      onJobStarted(job);
    } catch (err: unknown) {
      const msg = (err as { body?: { detail?: string }; message?: string })?.body?.detail
        || (err as { message?: string })?.message
        || "Search failed. Make sure the extension is installed and LinkedIn is open.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl">
      <div className="rounded-2xl border-2 border-studojo-ink bg-white p-8 shadow-brutal">
        <h2 className="font-clash text-2xl font-bold text-studojo-ink mb-1">
          Who should you connect with?
        </h2>
        <p className="font-satoshi text-sm text-studojo-muted mb-6">
          Tell us the role you want. We find the right people on LinkedIn and
          write a personalised message for each one.
        </p>

        <div className="mb-4">
          <label className="mb-1.5 block font-satoshi text-sm font-semibold text-studojo-ink">
            Role you are targeting <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Product Manager, SWE Intern, Marketing Intern"
            required
            maxLength={150}
            className="w-full rounded-xl border-2 border-studojo-ink bg-neutral-50 px-4 py-3 font-satoshi text-sm text-studojo-ink placeholder:text-studojo-muted focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block font-satoshi text-sm font-semibold text-studojo-ink">
            Location{" "}
            <span className="font-normal text-studojo-muted">(optional)</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Bangalore, Mumbai, Delhi"
            maxLength={100}
            className="w-full rounded-xl border-2 border-studojo-ink bg-neutral-50 px-4 py-3 font-satoshi text-sm text-studojo-ink placeholder:text-studojo-muted focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 font-satoshi text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !role.trim()}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-studojo-ink bg-studojo-purple font-satoshi text-sm font-semibold text-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:pointer-events-none disabled:opacity-60"
        >
          {loading ? (
            <>
              <FiRefreshCw className="h-4 w-4 animate-spin" />
              Starting search...
            </>
          ) : (
            <>
              <FiSearch className="h-4 w-4" />
              Find people to connect with
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ── Search results ─────────────────────────────────────────────────────────────

interface ResultsProps {
  job: SearchJob;
  onReset: () => void;
}

function SearchResults({ job: initialJob, onReset }: ResultsProps) {
  const [job, setJob] = useState<SearchJob>(initialJob);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [copiedIds, setCopiedIds] = useState<Set<number>>(new Set());
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Poll job status until done
  useEffect(() => {
    if (job.status === "done" || job.status === "failed") return;

    const interval = setInterval(async () => {
      try {
        const updated = await outreachFetch<SearchJob>(`/linkedin/search/${job.id}`);
        setJob(updated);
        if (updated.status === "done" || updated.status === "failed") {
          clearInterval(interval);
        }
      } catch (_) {}
    }, 2500);

    return () => clearInterval(interval);
  }, [job.id, job.status]);

  // Load leads when done
  useEffect(() => {
    if (job.status !== "done") return;
    setLoadingLeads(true);
    outreachFetch<Lead[]>(`/linkedin/search/${job.id}/leads`)
      .then(setLeads)
      .catch(() => {})
      .finally(() => setLoadingLeads(false));
  }, [job.id, job.status]);

  const handleCopy = async (lead: Lead) => {
    if (!lead.suggested_message) return;
    try {
      await navigator.clipboard.writeText(lead.suggested_message);
      setCopiedIds((prev) => new Set([...prev, lead.id]));
      // Track copy
      outreachFetch("/linkedin/leads/mark-copied", {
        method: "POST",
        body: JSON.stringify({ lead_id: lead.id }),
      }).catch(() => {});
      // Reset copied indicator after 3s
      setTimeout(() => {
        setCopiedIds((prev) => {
          const next = new Set(prev);
          next.delete(lead.id);
          return next;
        });
      }, 3000);
    } catch (_) {}
  };

  if (job.status === "queued" || job.status === "running") {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border-2 border-studojo-ink bg-white p-10 shadow-brutal text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center">
            <FiRefreshCw className="h-10 w-10 animate-spin text-studojo-purple" />
          </div>
          <h3 className="font-clash text-xl font-bold text-studojo-ink mb-2">
            Finding people...
          </h3>
          <p className="font-satoshi text-sm text-studojo-muted">
            Searching LinkedIn for{" "}
            <span className="font-semibold text-studojo-ink">{job.target_role}</span>{" "}
            and writing personalised messages. Takes about 15 seconds.
          </p>
        </div>
      </div>
    );
  }

  if (job.status === "failed") {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-8 text-center">
          <h3 className="font-clash text-xl font-bold text-red-700 mb-2">Search failed</h3>
          <p className="font-satoshi text-sm text-red-600 mb-4">
            {job.error || "Something went wrong. Your LinkedIn session may have expired."}
          </p>
          <button
            onClick={onReset}
            className="mx-auto flex h-10 items-center gap-2 rounded-xl border-2 border-studojo-ink bg-white px-5 font-satoshi text-sm font-semibold shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <FiRefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (loadingLeads) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="font-satoshi text-sm text-studojo-muted">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-clash text-2xl font-bold text-studojo-ink">
            {leads.length} people found
          </h2>
          <p className="font-satoshi text-sm text-studojo-muted">
            For: <span className="font-semibold text-studojo-ink">{job.target_role}</span>
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex h-9 items-center gap-2 rounded-xl border-2 border-studojo-ink bg-white px-4 font-satoshi text-sm font-semibold shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          <FiSearch className="h-3.5 w-3.5" />
          New search
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-2xl border-2 border-studojo-ink bg-white p-8 text-center shadow-brutal">
          <p className="font-satoshi text-sm text-studojo-muted">
            No results found for this search. Try a broader role title.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl border-2 border-studojo-ink bg-white p-5 shadow-brutal"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="shrink-0">
                  {lead.profile_image_url ? (
                    <img
                      src={lead.profile_image_url}
                      alt={lead.name}
                      className="h-12 w-12 rounded-xl border-2 border-studojo-ink object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-studojo-ink bg-violet-100">
                      <FiUser className="h-5 w-5 text-studojo-purple" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-clash text-base font-bold text-studojo-ink truncate">
                      {lead.name}
                    </h3>
                    <a
                      href={lead.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-studojo-muted hover:text-studojo-purple"
                    >
                      <FiExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  {lead.headline && (
                    <p className="font-satoshi text-xs text-studojo-muted mt-0.5 line-clamp-2">
                      {lead.headline}
                    </p>
                  )}
                  {lead.company && !lead.headline && (
                    <p className="font-satoshi text-xs text-studojo-muted mt-0.5">{lead.company}</p>
                  )}
                </div>
              </div>

              {/* Suggested message */}
              {lead.suggested_message && (
                <div className="mt-4">
                  <div className="mb-1.5 font-satoshi text-xs font-semibold uppercase tracking-wide text-studojo-muted">
                    Suggested connection note
                  </div>
                  <div className="relative rounded-xl border-2 border-neutral-200 bg-neutral-50 p-3 pr-10 font-satoshi text-sm text-studojo-ink leading-relaxed">
                    {lead.suggested_message}
                    <button
                      onClick={() => handleCopy(lead)}
                      className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-300 bg-white transition-colors hover:border-studojo-ink hover:bg-violet-50"
                      title="Copy message"
                    >
                      {copiedIds.has(lead.id) ? (
                        <FiCheck className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <FiCopy className="h-3.5 w-3.5 text-studojo-muted" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-satoshi text-xs text-studojo-muted">
                      {lead.message_copied_at || copiedIds.has(lead.id)
                        ? "Copied"
                        : "Copy, then paste in LinkedIn"}
                    </span>
                    <a
                      href={lead.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-satoshi text-xs font-semibold text-studojo-purple hover:underline"
                    >
                      Connect on LinkedIn
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LinkedInConnectPage() {
  const { loading: authLoading } = useOutreachAuth();
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [activeJob, setActiveJob] = useState<SearchJob | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchJob[]>([]);
  const [checkingToken, setCheckingToken] = useState(true);
  const [extensionReady, setExtensionReady] = useState(false);

  // Detect if extension content script is injected
  useEffect(() => {
    const onReady = () => setExtensionReady(true);
    window.addEventListener("STUDOJO_EXTENSION_READY", onReady);
    // Give content script 800ms to fire the event
    const timer = setTimeout(() => setExtensionReady(false), 800);
    return () => {
      window.removeEventListener("STUDOJO_EXTENSION_READY", onReady);
      clearTimeout(timer);
    };
  }, []);

  const checkTokenStatus = useCallback(async () => {
    try {
      const status = await outreachFetch<TokenStatus>("/linkedin/token/status");
      setTokenStatus(status);

      if (status.connected) {
        const searches = await outreachFetch<SearchJob[]>("/linkedin/searches");
        setRecentSearches(searches);
      }
    } catch (_) {
      setTokenStatus({ connected: false });
    } finally {
      setCheckingToken(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) checkTokenStatus();
  }, [authLoading, checkTokenStatus]);

  if (authLoading || checkingToken) {
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
      <section className="border-b-2 border-studojo-ink bg-white px-4 py-12 md:px-8">
        <div className="mx-auto max-w-[var(--section-max-width)]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-studojo-ink bg-violet-500 px-4 py-1 font-satoshi text-xs font-bold uppercase tracking-wider text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
            LinkedIn Connect
          </div>
          <h1 className="font-clash text-3xl font-bold text-studojo-ink md:text-4xl">
            Find who to connect with.
          </h1>
          <p className="mt-3 max-w-xl font-satoshi text-base text-studojo-muted">
            Tell us the role you want. We find the right people on LinkedIn and
            write a personalised connection note for each one. No cold outreach
            guesswork.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-[var(--section-max-width)] px-4 py-10 md:px-8">
        {(!tokenStatus?.connected || !extensionReady) ? (
          <InstallStep />
        ) : activeJob ? (
          <SearchResults
            job={activeJob}
            onReset={() => setActiveJob(null)}
          />
        ) : (
          <div className="flex flex-col gap-10">
            <SearchForm onJobStarted={setActiveJob} />

            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="mx-auto w-full max-w-xl">
                <h3 className="mb-3 font-clash text-lg font-bold text-studojo-ink">
                  Recent searches
                </h3>
                <div className="flex flex-col gap-2">
                  {recentSearches.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveJob(s)}
                      className="flex items-center justify-between rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-left transition-colors hover:border-studojo-ink"
                    >
                      <div>
                        <div className="font-satoshi text-sm font-semibold text-studojo-ink">
                          {s.target_role}
                        </div>
                        <div className="font-satoshi text-xs text-studojo-muted">
                          {s.result_count} people found
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-satoshi text-xs font-semibold ${
                          s.status === "done"
                            ? "bg-green-100 text-green-700"
                            : s.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
