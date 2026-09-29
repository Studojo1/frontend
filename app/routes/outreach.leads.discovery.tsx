import { describeError } from "~/lib/error-detail";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";
import { capturePostHog } from "~/lib/posthog";
import { RealNumbers } from "~/components/outreach/RealNumbers";

const POLL_INTERVAL_MS = 5000;
// Everything on this screen is real server state (B2C UC-Q08). It used to show
// a made-up 2.1M-3.4M "profiles scanned" counter, ticks for 19 sources that are
// never queried (only Apollo is searched), random "profiles indexed" and "/sec"
// numbers, invented people under "Matches forming" and unverified stats.
const SEARCH_RAMP_MS = 60000; // the search itself typically takes 30-50s

const COLORS = ["bg-studojo-purple", "bg-studojo-pink", "bg-studojo-green", "bg-studojo-orange", "bg-studojo-teal", "bg-indigo-500", "bg-rose-500", "bg-amber-500"];
const fmt = (n: number) => Math.max(0, Math.round(n)).toLocaleString("en-US");
type Preview = { title: string; company: string };
const initOf = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const colOf = (n: string) => COLORS[n.charCodeAt(0) % COLORS.length];

export default function DiscoveryPage() {
  const navigate = useNavigate();
  const { loading: authLoading, recovering } = useOutreachAuth();
  const { candidateId } = useOutreachStore();

  const [error, setError] = useState("");
  const [allDone, setAllDone] = useState(false);
  // Real progress: how many leads the search stored, then scoring counts.
  const [found, setFound] = useState<number | null>(null);
  const [stats, setStats] = useState<{ total: number; scored: number; with_bullets: number } | null>(null);
  const [preview, setPreview] = useState<Preview[]>([]);
  const [elapsed, setElapsed] = useState(0);
  // Kept across effect re-runs so the bar never snaps back to zero.
  const animStartRef = useRef<number | null>(null);

  const allDoneRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => { allDoneRef.current = allDone; }, [allDone]);

  // No candidate once auth and order recovery have settled: back to upload.
  // This used to be a navigate() called during render, which re-rendered in a
  // loop ("Maximum update depth exceeded", React #185) on every logged-out or
  // candidate-less visit.
  useEffect(() => {
    if (!authLoading && !recovering && !candidateId) {
      navigate("/outreach/onboarding/upload", { replace: true });
    }
  }, [authLoading, recovering, candidateId, navigate]);

  // ── Discovery + scoring orchestration (unchanged behaviour) ──
  useEffect(() => {
    if (authLoading || !candidateId) return;
    let cancelled = false;

    const startedAt = Date.now();
    capturePostHog("discovery_started", { candidate_id: candidateId });

    // Only a run that actually produced ready results counts as completed. A
    // timeout still moves the user on, but must not inflate discovery_completed.
    const finish = (outcome: "ready" | "timeout", data?: { total?: number; with_bullets?: number }) => {
      if (cancelled) return;
      if (outcome === "ready") {
        capturePostHog("discovery_completed", {
          candidate_id: candidateId,
          leads_found: data?.total ?? null,
          justified_count: data?.with_bullets ?? null,
          seconds: Math.round((Date.now() - startedAt) / 1000),
        });
      }
      setAllDone(true);
      setTimeout(() => navigate("/outreach/leads/results"), 900);
    };

    // A mobile browser can evict this tab during the 5-minute search below. When
    // the user comes back, the work the server already did is still there, so
    // ask before paying for it again -- scoring-ready is keyed on candidate_id
    // alone, with no job or session handle, so a fresh tab can read it.
    const resumeIfAlreadyDone = async (): Promise<boolean> => {
      try {
        const data = await outreachFetch<any>(`/discovery/scoring-ready/${candidateId}`, { method: "GET" });
        // A previous run that found nobody is not something to resume: the
        // results page sends "Run the search again" here, and resuming it
        // would bounce the user straight back to the empty page.
        if (data?.ready && !data?.zero_leads && !cancelled) {
          capturePostHog("discovery_resumed", { candidate_id: candidateId });
          finish("ready", data);
          return true;
        }
      } catch {
        // Never seen this candidate, or the check failed: fall through and run
        // discovery normally.
      }
      return false;
    };

    resumeIfAlreadyDone().then((resumed) => {
      if (resumed || cancelled) return;

      outreachFetch<{ leads_collected?: number }>("/discovery/search", {
        method: "POST",
        body: JSON.stringify({ candidate_id: candidateId }),
        timeout: 300_000,
        maxRetries: 1,
      })
      .then((res) => {
        if (cancelled) return;
        setFound(res?.leads_collected ?? 0);
        if (res?.leads_collected) {
          // A few real matches to look at while they are ranked.
          outreachFetch<{ leads: { title?: string; company?: string }[] }>(`/candidate/${candidateId}/leads?limit=6`)
            .then((d) => {
              if (!cancelled) {
                setPreview((d?.leads || []).filter((l) => l.title && l.company).slice(0, 6)
                  .map((l) => ({ title: l.title as string, company: l.company as string })));
              }
            })
            .catch(() => {});
        }
        // Nothing was found, so nothing will ever be scored. Waiting on the
        // scoring poll here held the user at 96% for the full six minutes.
        if (res?.leads_collected === 0) {
          capturePostHog("discovery_completed", {
            candidate_id: candidateId,
            leads_found: 0,
            justified_count: 0,
            seconds: Math.round((Date.now() - startedAt) / 1000),
          });
          setAllDone(true);
          setTimeout(() => navigate("/outreach/leads/results"), 900);
          return;
        }
        const SCORING_TIMEOUT_MS = 6 * 60 * 1000;
        const started = Date.now();
        pollRef.current = setInterval(async () => {
          if (Date.now() - started >= SCORING_TIMEOUT_MS) {
            clearInterval(pollRef.current);
            capturePostHog("discovery_failed", { candidate_id: candidateId, reason: "scoring_timeout" });
            finish("timeout");
            return;
          }
          try {
            const data = await outreachFetch<any>(`/discovery/scoring-ready/${candidateId}`, { method: "GET" });
            if (data && typeof data.total === "number") {
              setStats({ total: data.total, scored: data.scored ?? 0, with_bullets: data.with_bullets ?? 0 });
            }
            if (data?.ready) {
              clearInterval(pollRef.current);
              finish("ready", data);
            }
          } catch {
            // non-fatal: keep polling
          }
        }, POLL_INTERVAL_MS);
      })
      .catch((err: any) => {
        if (!cancelled) {
          capturePostHog("discovery_failed", { candidate_id: candidateId, reason: describeError(err, "search_error") });
          setError(describeError(err, "Lead discovery failed"));
        }
      });
    });

    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
    };
  }, [candidateId, authLoading, navigate]);

  // One clock for the search-phase bar. Paused while the tab is hidden.
  useEffect(() => {
    if (!candidateId || authLoading) return;
    if (animStartRef.current === null) animStartRef.current = Date.now();
    const start = animStartRef.current;
    const id = setInterval(() => { if (!document.hidden) setElapsed(Date.now() - start); }, 1000);
    return () => clearInterval(id);
  }, [candidateId, authLoading]);

  if (!candidateId) return null;

  // Bar: the search is 5-45% (time-based, it cannot report progress), ranking
  // is 45-95% from real scored/total, then 100 when results open.
  const searching = found === null;
  const barPct = allDone
    ? 100
    : searching
      ? Math.min(45, 5 + Math.round((elapsed / SEARCH_RAMP_MS) * 40))
      : stats && stats.total > 0
        ? 45 + Math.round((Math.min(stats.scored, stats.total) / stats.total) * 50)
        : 45;
  const steps: { label: string; state: "done" | "active" | "todo" }[] = [
    { label: "Reading your profile and targets", state: "done" },
    {
      label: searching ? "Searching for hiring managers who match your targets" : `Found ${fmt(found ?? 0)} hiring managers`,
      state: searching ? "active" : "done",
    },
    {
      label: stats && stats.total > 0
        ? `Ranking them by fit to you: ${fmt(Math.min(stats.scored, stats.total))} of ${fmt(stats.total)}`
        : "Ranking them by fit to you",
      state: allDone ? "done" : searching ? "todo" : "active",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1">
        {error ? (
          <div className="flex items-center justify-center px-4 py-20">
            <div className="max-w-md w-full rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border-2 border-red-200">
                <span className="text-2xl">!</span>
              </div>
              <p className="text-red-600 text-sm font-satoshi mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="h-11 px-6 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-semibold border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <main className="max-w-3xl mx-auto px-4 py-10 text-center">
              <h2 className="font-clash text-2xl sm:text-3xl font-bold text-studojo-ink mb-1">
                {allDone ? "Opening your matches" : searching ? "Finding your hiring managers" : "Ranking your matches"}
              </h2>
              <p className="text-sm text-studojo-muted font-satoshi mb-8">This usually takes one to two minutes. You can keep this tab open in the background.</p>

              {/* progress bar, driven by the steps below */}
              <div className="w-full max-w-lg mx-auto mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-satoshi text-studojo-muted">
                    {allDone ? "Done. Opening your matches…" : searching ? "Searching" : "Ranking"}
                  </span>
                  <span className={`text-sm font-satoshi font-bold tabular-nums ${allDone ? "text-studojo-green" : "text-studojo-purple"}`}>{barPct}%</span>
                </div>
                <div className="relative h-3.5 w-full bg-studojo-surface-muted rounded-full border border-studojo-ink/10">
                  <div
                    className={`relative h-full rounded-full overflow-hidden ${allDone ? "" : "sd-shimmer"}`}
                    style={{ width: `${barPct}%`, background: allDone ? "#10b981" : "linear-gradient(90deg,#8b5cf6,#ec4899)", transition: "width .6s cubic-bezier(.2,.8,.2,1)" }}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-left items-start">
                {/* what is actually happening */}
                <div className="rounded-2xl border-2 border-studojo-ink bg-white p-4 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
                  <p className="text-[11px] uppercase tracking-wide font-satoshi font-bold text-studojo-muted mb-3">What is happening</p>
                  <ol className="space-y-3">
                    {steps.map((st) => (
                      <li key={st.label} className="flex items-start gap-2.5">
                        <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${
                          st.state === "done" ? "bg-studojo-green text-white" : st.state === "active" ? "border-2 border-studojo-purple" : "border-2 border-studojo-ink/15"
                        }`}>
                          {st.state === "done" ? "✓" : st.state === "active" ? <span className="w-1.5 h-1.5 rounded-full bg-studojo-purple animate-pulse" /> : null}
                        </span>
                        <span className={`text-sm font-satoshi leading-snug ${st.state === "todo" ? "text-studojo-muted" : "text-studojo-ink"}`}>{st.label}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* the first real matches, once the search has returned */}
                <div className="rounded-2xl border-2 border-studojo-ink bg-white p-4 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
                  <p className="text-[11px] uppercase tracking-wide font-satoshi font-bold text-studojo-muted mb-3">First matches</p>
                  {preview.length > 0 ? (
                    <ul className="space-y-2.5">
                      {preview.map((m, k) => (
                        <li key={k} className="sd-fade-up flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${colOf(m.company)} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white text-xs font-bold">{initOf(m.company)}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-satoshi font-semibold text-studojo-ink truncate">{m.title}</p>
                            <p className="text-[11px] font-satoshi text-studojo-muted truncate">{m.company}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm font-satoshi text-studojo-muted">Your first matches appear here as soon as the search returns.</p>
                  )}
                </div>
              </div>
            </main>

            {/* Outcome figures from our own records (these replaced invented testimonials). */}
            <section className="mt-6 pb-16 max-w-3xl mx-auto px-4">
              <RealNumbers title="Students are already getting in" />
            </section>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
