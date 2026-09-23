import { describeError } from "~/lib/error-detail";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { capturePostHog } from "~/lib/posthog";
import { FiArrowRight, FiArrowLeft, FiSearch, FiSend, FiRefreshCw } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { FlashCard } from "~/components/outreach/FlashCard";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch, isAuthExpired } from "~/lib/outreach/api";
import type { Lead } from "~/lib/outreach/types";

const PAGE_SIZE = 20;
// Only surface the top 100 leads (matches the backend's JUSTIFY_TOP_K=100, the
// only leads that get AI justifications). The heading says how many exist in
// total, so nobody thinks the other leads they are paying for vanished.
const SHOWN_LIMIT = 100;
const POLL_MS = 15_000;
const MAX_POLLS = 12;

type SortBy = "best" | "name";

// Signal priority: high=2, medium=1, low=0
const signalRank = (lead: Lead) => {
  const s = lead.score?.justification?.signal_strength;
  if (s === "high") return 2;
  if (s === "medium") return 1;
  return 0;
};

// The shown set is the top SHOWN_LIMIT by heuristic score. That score does not
// change while justifications stream in, so the set is stable across polls,
// and it is the same set the backend picks to justify. lead.id breaks ties so
// equal scores cannot swap places between two identical responses.
function pickShown(leads: Lead[]): Lead[] {
  return [...leads]
    .sort((a, b) => (b.score?.overall || 0) - (a.score?.overall || 0) || a.id - b.id)
    .slice(0, SHOWN_LIMIT);
}

// Within the shown set: best match puts high/medium signal leads first, and
// low-signal leads fall to the bottom. Don't hide low-signal leads: on
// India-focused searches Apollo data is sparse and the LLM marks most leads
// "low" even when they're legitimate targets.
function rank(shown: Lead[], sortBy: SortBy): number[] {
  return [...shown]
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "") || a.id - b.id;
      return signalRank(b) - signalRank(a) || (b.score?.overall || 0) - (a.score?.overall || 0) || a.id - b.id;
    })
    .map((l) => l.id);
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const { loading: authLoading, recovering } = useOutreachAuth();
  const { candidateId, planType } = useOutreachStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authExpired, setAuthExpired] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [polling, setPolling] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("best");
  // The display order is frozen once shown, so cards do not jump around while
  // the user is reading them. It changes only when the user asks.
  const [order, setOrder] = useState<number[] | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headerCtaRef = useRef<HTMLButtonElement>(null);
  const [headerCtaVisible, setHeaderCtaVisible] = useState(true);
  const viewedMarkedRef = useRef(false);
  // Lets the "couldn't refresh" banner retry right away without wiping the grid.
  const refreshNowRef = useRef<() => void>(() => {});

  // No candidate at all, even after recovering the active order from the
  // server: send them to the start. This runs as an effect, after hydration, so
  // the server render and the first client render never take this branch.
  const ready = !authLoading && !recovering;
  useEffect(() => {
    if (ready && !candidateId) navigate("/outreach/onboarding/upload", { replace: true });
  }, [ready, candidateId, navigate]);

  useEffect(() => {
    if (!ready || !candidateId) return;

    // A different candidate must never blend into the previous one's grid.
    setLeads([]);
    setOrder(null);
    setError("");
    setAuthExpired(false);
    setRefreshFailed(false);
    setLoading(true);
    setPage(1);

    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();

    const fetchLeads = (isInitial: boolean, pollCount: number, lastWithBullets: number) => {
      outreachFetch<{ leads: Lead[]; total?: number } | Lead[]>(`/candidate/${candidateId}/leads`, {
        signal: controller.signal,
        // A poll is its own retry 15s later; stacking three more on top of it
        // only multiplies the work on a server that is already struggling.
        ...(isInitial ? {} : { maxRetries: 1 }),
      })
        .then((data) => {
          if (cancelled) return;
          const list = Array.isArray(data) ? data : data.leads || [];
          setLeads(list);
          setRefreshFailed(false);
          if (isInitial) {
            const shown = Math.min(list.length, SHOWN_LIMIT);
            capturePostHog("leads_loaded", { leads_returned: list.length, leads_shown: shown, candidate_id: candidateId });
            if (!viewedMarkedRef.current && list.length > 0) {
              viewedMarkedRef.current = true;
              outreachFetch("/orders/funnel/mark", {
                method: "POST",
                body: JSON.stringify({ stage: "leads_viewed" }),
              }).catch(() => { /* never break the page */ });
            }
          }
          // Bullets stream in after the page opens. Keep re-fetching until ~90%
          // of the shown set has them, but stop early once two polls in a row
          // bring nothing new: a justification pass that failed is not coming back.
          const shownSet = pickShown(list);
          const withBullets = shownSet.filter((l) => l.score?.justification).length;
          lastKnown = withBullets;
          const stalled = !isInitial && pollCount > 1 && withBullets <= lastWithBullets;
          const more = shownSet.length > 0 && withBullets < shownSet.length * 0.9 && pollCount < MAX_POLLS && !stalled;
          setPolling(more);
          if (more) schedule(pollCount + 1, withBullets);
        })
        .catch((err) => {
          if (cancelled) return;
          if (isAuthExpired(err)) {
            setAuthExpired(true);
            setPolling(false);
            return;
          }
          if (isInitial) {
            setError(describeError(err, "Failed to load leads"));
            return;
          }
          // A failed background refresh must not wipe a grid the user is
          // reading. Keep what is on screen, say so, and try again.
          setRefreshFailed(true);
          if (pollCount < MAX_POLLS) schedule(pollCount + 1, lastWithBullets);
          else setPolling(false);
        })
        .finally(() => { if (isInitial && !cancelled) setLoading(false); });
    };

    const schedule = (pollCount: number, withBullets: number) => {
      // Jitter so every open results page does not poll in lockstep.
      const delay = POLL_MS + Math.round(Math.random() * 3000);
      pollTimer = setTimeout(() => fetchLeads(false, pollCount, withBullets), delay);
    };

    let lastKnown = 0;
    refreshNowRef.current = () => {
      clearTimeout(pollTimer);
      fetchLeads(false, 1, lastKnown);
    };

    fetchLeads(true, 0, 0);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(pollTimer);
    };
  }, [ready, candidateId, reloadKey]);

  const shown = useMemo(() => pickShown(leads), [leads]);
  const byId = useMemo(() => new Map(shown.map((l) => [l.id, l])), [shown]);
  const liveOrder = useMemo(() => rank(shown, sortBy), [shown, sortBy]);

  // Freeze on first data; afterwards only append ids the frozen order lacks.
  useEffect(() => {
    if (shown.length === 0) return;
    setOrder((prev) => {
      if (!prev) return liveOrder;
      const known = new Set(prev);
      const added = liveOrder.filter((id) => !known.has(id));
      const kept = prev.filter((id) => byId.has(id));
      return added.length || kept.length !== prev.length ? [...kept, ...added] : prev;
    });
  }, [liveOrder, byId, shown.length]);

  const rankingChanged =
    !polling && sortBy === "best" && !!order && order.length === liveOrder.length && order.some((id, i) => id !== liveOrder[i]);

  const ordered = (order ?? liveOrder).map((id) => byId.get(id)).filter((l): l is Lead => !!l);
  const q = query.trim().toLowerCase();
  const filtered = q
    ? ordered.filter((l) => [l.name, l.title, l.company, l.location].some((f) => (f || "").toLowerCase().includes(q)))
    : ordered;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const companies = useMemo(() => new Set(leads.map((l) => (l.company || "").toLowerCase()).filter(Boolean)).size, [leads]);

  // The CTA follows the plan the user chose, not the shape of the data. Leads
  // have no email before payment, so guessing from the data sent nearly every
  // email-plan buyer to LinkedIn pricing.
  const isLinkedInPlan = planType === "linkedin";
  const ctaLabel = isLinkedInPlan ? "Start LinkedIn automation" : "Get Their Emails";
  const cardActionLabel = isLinkedInPlan ? "Send an invite" : "Unlock contacts";
  const onCta = (source: string) => {
    if (isLinkedInPlan) {
      capturePostHog("start_linkedin_automation_clicked", { source });
      navigate("/linkedin/pricing");
    } else {
      capturePostHog("get_emails_clicked", { source });
      navigate("/outreach/enrichment");
    }
  };

  const loaded = !loading && !error && !authExpired;
  const hasLeads = loaded && leads.length > 0;

  // The floating CTA is only for when the header one has scrolled away.
  useEffect(() => {
    const el = headerCtaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setHeaderCtaVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [hasLeads]);

  const goToPage = (p: number) => {
    setPage(p);
    // Land at the top of the new page, and tell screen readers the list changed.
    headingRef.current?.scrollIntoView({ block: "start" });
    headingRef.current?.focus({ preventScroll: true });
  };

  const resort = (next: SortBy) => {
    setSortBy(next);
    setOrder(rank(shown, next));
    setPage(1);
  };

  const summary = !loaded
    ? loading
      ? "Loading your matches…"
      : ""
    : leads.length === 0
      ? "No matches yet."
      : leads.length > shown.length
        ? `Your top ${shown.length} of ${leads.length.toLocaleString("en-US")} matches, across ${companies.toLocaleString("en-US")} companies. Tap any card to reach out.`
        : `${shown.length} matches across ${companies.toLocaleString("en-US")} companies. Tap any card to reach out.`;

  return (
    <div className="min-h-screen bg-white pb-24">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:border-2 focus:border-studojo-ink font-satoshi"
      >
        Skip to your matches
      </a>
      <Header />
      <main id="main" className="mx-auto max-w-[var(--section-max-width)] px-4 py-6 md:px-8">
        <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between sm:mb-6">
          <div>
            <h1 ref={headingRef} tabIndex={-1} className="font-clash text-xl sm:text-2xl font-bold text-studojo-ink scroll-mt-20 focus:outline-none">
              Your Hiring Managers
            </h1>
            <p className="text-sm text-studojo-muted font-satoshi mt-0.5" role="status" aria-live="polite">
              {summary}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-2 flex-1 sm:flex-none">
              <span className="text-sm text-studojo-muted font-satoshi">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => resort(e.target.value as SortBy)}
                aria-label="Sort leads"
                disabled={!hasLeads}
                className="flex-1 sm:flex-none text-base sm:text-sm border-2 border-studojo-ink/20 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-studojo-purple font-satoshi disabled:opacity-50"
              >
                <option value="best">Best match</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </label>
            <button
              ref={headerCtaRef}
              onClick={() => onCta("header")}
              disabled={!hasLeads}
              className="h-9 px-4 rounded-xl bg-studojo-purple-strong text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all motion-safe:hover:translate-x-[2px] motion-safe:hover:translate-y-[2px] hover:shadow-none inline-flex items-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal"
            >
              <FiSend className="w-4 h-4 mr-1.5" aria-hidden /> {ctaLabel}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20" role="status">
            <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" aria-hidden />
            <span className="sr-only">Loading your matches</span>
          </div>
        ) : authExpired ? (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center">
            <p className="text-studojo-ink font-satoshi mb-4">Your session has expired. Sign in again to see your matches.</p>
            <Link
              to={`/auth?mode=signin&redirect=${encodeURIComponent("/outreach/leads/results")}`}
              className="inline-flex h-11 items-center px-6 rounded-xl bg-studojo-purple-strong text-white text-sm font-satoshi font-semibold border-2 border-studojo-ink shadow-brutal"
            >
              Sign in
            </Link>
          </div>
        ) : error ? (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center">
            <p className="text-red-700 font-satoshi mb-4">{error}</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="h-11 px-6 rounded-xl bg-studojo-purple-strong text-white text-sm font-satoshi font-semibold border-2 border-studojo-ink shadow-brutal transition-all motion-safe:hover:translate-x-[2px] motion-safe:hover:translate-y-[2px] hover:shadow-none"
            >
              Try again
            </button>
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center max-w-xl mx-auto">
            <h2 className="font-clash text-lg font-bold text-studojo-ink mb-2">We couldn't find hiring managers for this search</h2>
            <p className="text-sm text-studojo-muted font-satoshi mb-6">
              Nothing matched your roles and locations closely enough. This usually means the search was very narrow.
              Run it again, or tell us what you're looking for and we'll help.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate("/outreach/leads/discovery")}
                className="h-11 px-6 rounded-xl bg-studojo-purple-strong text-white text-sm font-satoshi font-semibold border-2 border-studojo-ink shadow-brutal transition-all motion-safe:hover:translate-x-[2px] motion-safe:hover:translate-y-[2px] hover:shadow-none inline-flex items-center"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" aria-hidden /> Run the search again
              </button>
              <Link
                to="/contact"
                className="h-11 px-6 rounded-xl bg-white text-studojo-ink text-sm font-satoshi font-semibold border-2 border-studojo-ink shadow-brutal inline-flex items-center"
              >
                Contact support
              </Link>
            </div>
          </div>
        ) : (
          <>
            {refreshFailed && (
              <div className="mb-4 rounded-xl border-2 border-studojo-orange/40 bg-studojo-orange-bg px-4 py-3 flex flex-wrap items-center justify-between gap-2 font-satoshi text-sm text-studojo-ink" role="status">
                <span>We couldn't refresh your matches just now. You're seeing the latest we have.</span>
                <button onClick={() => refreshNowRef.current()} className="font-semibold underline">Retry</button>
              </div>
            )}
            {rankingChanged && (
              <div className="mb-4 rounded-xl border-2 border-studojo-purple/30 bg-studojo-purple-bg px-4 py-3 flex flex-wrap items-center justify-between gap-2 font-satoshi text-sm text-studojo-ink" role="status">
                <span>Our AI has finished reviewing your matches.</span>
                <button onClick={() => resort("best")} className="font-semibold text-studojo-purple-strong underline">Show the best matches first</button>
              </div>
            )}

            <div className="mb-4 relative max-w-md">
              <FiSearch className="w-4 h-4 text-studojo-muted absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search by name, title, company or city"
                aria-label="Search your matches"
                className="w-full text-base sm:text-sm border-2 border-studojo-ink/20 rounded-xl pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-studojo-purple font-satoshi"
              />
            </div>

            {filtered.length === 0 ? (
              <p className="text-sm text-studojo-muted font-satoshi py-10 text-center">No matches for "{query}".</p>
            ) : (
              <div className="ph-no-capture grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginated.map((lead) => (
                  <FlashCard key={lead.id} lead={lead} actionLabel={cardActionLabel} onSelect={() => onCta("card")} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav aria-label="Leads pagination" className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="p-2 rounded-xl border-2 border-studojo-ink/20 hover:bg-studojo-surface-muted disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FiArrowLeft className="w-4 h-4" aria-hidden />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    aria-label={`Page ${pageNum}`}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                    className={`w-9 h-9 rounded-xl text-sm font-bold font-satoshi transition-colors ${
                      currentPage === pageNum
                        ? "bg-studojo-purple-strong text-white border-2 border-studojo-ink"
                        : "border-2 border-studojo-ink/20 hover:bg-studojo-surface-muted text-studojo-muted"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="p-2 rounded-xl border-2 border-studojo-ink/20 hover:bg-studojo-surface-muted disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FiArrowRight className="w-4 h-4" aria-hidden />
                </button>
                <span className="w-full text-center text-xs text-studojo-muted font-satoshi">Page {currentPage} of {totalPages}</span>
              </nav>
            )}
          </>
        )}
      </main>
      <Footer />

      {/* Floating CTA: only once the data is in, and only while the header CTA is off screen */}
      {hasLeads && !headerCtaVisible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => onCta("floating")}
            className="h-12 px-8 rounded-2xl bg-studojo-purple-strong text-white font-satoshi font-semibold text-base border-2 border-studojo-ink shadow-brutal transition-all motion-safe:hover:translate-x-[2px] motion-safe:hover:translate-y-[2px] hover:shadow-none inline-flex items-center whitespace-nowrap"
          >
            <FiSend className="w-4 h-4 mr-2" aria-hidden /> {ctaLabel}
          </button>
        </div>
      )}
    </div>
  );
}
