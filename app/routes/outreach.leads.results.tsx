import { describeError } from "~/lib/error-detail";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { capturePostHog } from "~/lib/posthog";
import { FiArrowRight, FiArrowLeft, FiSearch, FiSend, FiRefreshCw } from "react-icons/fi";
import { LuArrowUpDown } from "react-icons/lu";
import { Header } from "~/components/common/header";
import { AppFooter } from "~/components/outreach/AppFooter";
import { FlashCard } from "~/components/outreach/FlashCard";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch, isAuthExpired } from "~/lib/outreach/api";
import { pageWindow } from "~/lib/outreach/pagination";
import type { Lead } from "~/lib/outreach/types";

const PAGE_SIZE = 20;
// Every lead is listed and paged. Only the top 100 get AI justifications (the
// backend's JUSTIFY_TOP_K=100), so this is what polling waits on; the rest
// say plainly that they have no AI note (UC-Q22).
const JUSTIFIED_LIMIT = 100;
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

// The leads the backend justifies: the top JUSTIFIED_LIMIT by heuristic score.
// That score does not change while justifications stream in, so this set is
// stable across polls. lead.id breaks ties so equal scores cannot swap places
// between two identical responses.
function pickJustified(leads: Lead[]): Lead[] {
  return [...leads]
    .sort((a, b) => (b.score?.overall || 0) - (a.score?.overall || 0) || a.id - b.id)
    .slice(0, JUSTIFIED_LIMIT);
}

// Best match puts high/medium signal leads first, and
// low-signal leads fall to the bottom. Don't hide low-signal leads: on
// India-focused searches Apollo data is sparse and the LLM marks most leads
// "low" even when they're legitimate targets.
function rank(shown: Lead[], sortBy: SortBy): number[] {
  // An unscored lead ranks at the median, not 0, which sank it to the last
  // page (B2C UC-Q35). The API orders them the same way.
  const scores = shown.map((l) => l.score?.overall).filter((v): v is number => typeof v === "number").sort((x, y) => x - y);
  const median = scores.length ? scores[Math.floor(scores.length / 2)] : 0;
  const scoreOf = (l: Lead) => (typeof l.score?.overall === "number" ? l.score.overall : median);
  return [...shown]
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "") || a.id - b.id;
      // Strong matches first; broader ones follow under their own heading.
      return Number(!!a.broader) - Number(!!b.broader) || signalRank(b) - signalRank(a) || scoreOf(b) - scoreOf(a) || a.id - b.id;
    })
    .map((l) => l.id);
}

// This page is driven entirely by browser state (the persisted candidateId and
// the BetterAuth client session), so the server has nothing real to render.
// A clientLoader with hydrate=true makes the server send HydrateFallback, and
// the page itself only ever renders in the browser.
export async function clientLoader() {
  return null;
}
clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main id="main" className="mx-auto max-w-[var(--section-max-width)] px-4 py-6 md:px-8">
        <h1 className="font-clash text-xl sm:text-2xl font-bold text-studojo-ink">Your Hiring Managers</h1>
        <div className="flex justify-center py-20" role="status">
          <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" aria-hidden />
          <span className="sr-only">Loading your matches</span>
        </div>
      </main>
    </div>
  );
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const { loading: authLoading, recovering } = useOutreachAuth();
  const { candidateId, setCandidateId } = useOutreachStore();
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
  // UC-Q14: the upload page sends a re-uploaded, identical resume here with
  // ?existing=1. Say why they skipped the quiz, until they dismiss it.
  const [searchParams] = useSearchParams();
  const [existingNote, setExistingNote] = useState(searchParams.get("existing") === "1");
  // UC-Q25: the candidate ids this page already switched away from, so an
  // active_candidate_id that points back (or keeps changing) cannot loop.
  const switchedFromRef = useRef<Set<number>>(new Set());

  // No candidate in the browser, even after recovering the active order: ask
  // the server for the user's most recent candidate before giving up, so a
  // cleared store or a new device does not send someone with leads back to
  // resume upload. Runs as an effect, never during render.
  const ready = !authLoading && !recovering;
  const [lookedUpLatest, setLookedUpLatest] = useState(false);
  useEffect(() => {
    if (!ready || candidateId || lookedUpLatest) return;
    let cancelled = false;
    outreachFetch<{ candidate_id: number | null }>("/candidate/latest", { maxRetries: 1 })
      .then((data) => {
        if (cancelled) return;
        if (data?.candidate_id) setCandidateId(data.candidate_id);
        else navigate("/outreach/onboarding/upload", { replace: true });
      })
      .catch(() => { if (!cancelled) navigate("/outreach/onboarding/upload", { replace: true }); })
      .finally(() => { if (!cancelled) setLookedUpLatest(true); });
    return () => { cancelled = true; };
  }, [ready, candidateId, lookedUpLatest, setCandidateId, navigate]);

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
    // Set when this load hands over to another candidate (UC-Q25): keep the
    // spinner up instead of flashing "no matches" before the next load starts.
    let switching = false;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();

    // The full lead set, as last seen. Polls only fetch scores and merge them in.
    let current: Lead[] = [];

    const fetchLeads = (isInitial: boolean, pollCount: number, lastWithBullets: number) => {
      // Only justifications change while polling, so a poll asks for just
      // those (fields=justification) instead of re-downloading every lead.
      const path = isInitial
        ? `/candidate/${candidateId}/leads`
        : `/candidate/${candidateId}/leads?fields=justification`;
      outreachFetch<{ leads: Lead[]; total?: number; active_candidate_id?: number | null } | Lead[]>(path, {
        signal: controller.signal,
        // A poll is its own retry 15s later; stacking three more on top of it
        // only multiplies the work on a server that is already struggling.
        ...(isInitial ? {} : { maxRetries: 1 }),
      })
        .then((data) => {
          if (cancelled) return;
          const rows = Array.isArray(data) ? data : data.leads || [];
          // UC-Q25: the stored candidate can be a newer upload with no leads
          // while an older one holds the student's list. The API names that
          // one; switch to it once instead of saying "no matches". The effect
          // re-runs on the new candidateId and loads its leads.
          const active = Array.isArray(data) ? null : data.active_candidate_id;
          if (
            isInitial && rows.length === 0 && typeof active === "number" && active !== candidateId &&
            !switchedFromRef.current.has(candidateId) && !switchedFromRef.current.has(active)
          ) {
            switchedFromRef.current.add(candidateId);
            switching = true;
            capturePostHog("leads_switched_to_active_candidate", { from: candidateId, to: active });
            setCandidateId(active);
            return;
          }
          let list: Lead[];
          if (isInitial) {
            list = rows;
          } else {
            const scores = new Map(rows.map((r) => [r.id, r.score]));
            list = current.map((l) => (scores.has(l.id) ? { ...l, score: scores.get(l.id) ?? l.score } : l));
          }
          current = list;
          setLeads(list);
          setRefreshFailed(false);
          if (isInitial) {
            capturePostHog("leads_loaded", {
              leads_returned: list.length,
              leads_shown: list.length,
              leads_justified_target: Math.min(list.length, JUSTIFIED_LIMIT),
              candidate_id: candidateId,
            });
            if (!viewedMarkedRef.current && list.length > 0) {
              viewedMarkedRef.current = true;
              outreachFetch("/orders/funnel/mark", {
                method: "POST",
                body: JSON.stringify({ stage: "leads_viewed" }),
              }).catch(() => { /* never break the page */ });
            }
          }
          // Bullets stream in after the page opens. Keep re-fetching until ~90%
          // of the top 100 have them, but stop early once two polls in a row
          // bring nothing new: a justification pass that failed is not coming back.
          const shownSet = pickJustified(list);
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
        .finally(() => { if (isInitial && !cancelled && !switching) setLoading(false); });
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
  }, [ready, candidateId, reloadKey, setCandidateId]);

  const shown = leads;
  const byId = useMemo(() => new Map(shown.map((l) => [l.id, l])), [shown]);
  const liveOrder = useMemo(() => rank(shown, sortBy), [shown, sortBy]);
  // UC-Q22: the leads whose AI note may still arrive, so their cards can say
  // it is on the way instead of claiming there is none.
  const justifiedIds = useMemo(() => new Set(pickJustified(shown).map((l) => l.id)), [shown]);

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
  const broaderCount = useMemo(() => leads.filter((l) => l.broader).length, [leads]);
  const strongCount = leads.length - broaderCount;
  // Where the broader matches start in the list being shown, if they are grouped.
  const firstBroader = sortBy === "best" && !q ? filtered.findIndex((l) => l.broader) : -1;
  const pageStart = (currentPage - 1) * PAGE_SIZE;

  // LinkedIn plans are retired (audit NEW-09), so every student goes to the
  // email pricing page.
  const ctaLabel = "Get Their Emails";
  const cardActionLabel = "Unlock contacts";
  const onCta = (source: string) => {
    capturePostHog("get_emails_clicked", { source });
    navigate("/outreach/enrichment");
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
      : (broaderCount > 0
          ? `${strongCount.toLocaleString("en-US")} strong matches for your target roles and ${broaderCount.toLocaleString("en-US")} broader matches, across ${companies.toLocaleString("en-US")} companies. `
          : `${leads.length.toLocaleString("en-US")} matches across ${companies.toLocaleString("en-US")} companies. `) +
        // UC-Q22: do not promise notes that have not arrived yet.
        (polling
          ? `AI notes on why to contact ${leads.length > JUSTIFIED_LIMIT ? `the top ${JUSTIFIED_LIMIT}` : "them"} are still being written. Tap any card to reach out.`
          : `${leads.length > JUSTIFIED_LIMIT ? `The top ${JUSTIFIED_LIMIT} come` : "They come"} with AI notes on why to contact them. Tap any card to reach out.`);

  return (
    <div className="min-h-screen bg-white pb-24">
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
              <LuArrowUpDown className="w-4 h-4 text-studojo-muted flex-shrink-0" aria-hidden />
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
            {existingNote && (
              <div className="mb-4 rounded-xl border-2 border-studojo-purple/30 bg-studojo-purple-bg px-4 py-3 flex flex-wrap items-center justify-between gap-2 font-satoshi text-sm text-studojo-ink" role="status">
                <span>That's the same resume you uploaded before, so here are the hiring managers we already found for it.</span>
                <button onClick={() => setExistingNote(false)} className="inline-flex min-h-11 items-center font-semibold text-studojo-purple-strong underline">Got it</button>
              </div>
            )}
            {refreshFailed && (
              <div className="mb-4 rounded-xl border-2 border-studojo-orange/40 bg-studojo-orange-bg px-4 py-3 flex flex-wrap items-center justify-between gap-2 font-satoshi text-sm text-studojo-ink" role="status">
                <span>We couldn't refresh your matches just now. You're seeing the latest we have.</span>
                <button onClick={() => refreshNowRef.current()} className="inline-flex min-h-11 items-center font-semibold underline">Retry</button>
              </div>
            )}
            {rankingChanged && (
              <div className="mb-4 rounded-xl border-2 border-studojo-purple/30 bg-studojo-purple-bg px-4 py-3 flex flex-wrap items-center justify-between gap-2 font-satoshi text-sm text-studojo-ink" role="status">
                <span>Our AI has finished reviewing your matches.</span>
                <button onClick={() => resort("best")} className="inline-flex min-h-11 items-center font-semibold text-studojo-purple-strong underline">Show the best matches first</button>
              </div>
            )}

            <div className="mb-4 relative max-w-md">
              <FiSearch className="w-4 h-4 text-studojo-muted absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search by name, title or company"
                aria-label="Search your matches"
                className="w-full text-base sm:text-sm border-2 border-studojo-ink/20 rounded-xl pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-studojo-purple font-satoshi"
              />
            </div>

            {filtered.length === 0 ? (
              <p className="text-sm text-studojo-muted font-satoshi py-10 text-center">No matches for "{query}".</p>
            ) : (
              <div className="ph-no-capture grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginated.map((lead, i) => (
                  <Fragment key={lead.id}>
                    {pageStart + i === firstBroader && (
                      <div className="col-span-full mt-4 border-t-2 border-studojo-ink/10 pt-5">
                        <h2 className="font-clash text-lg font-bold text-studojo-ink">Broader matches</h2>
                        <p className="text-sm text-studojo-muted font-satoshi mt-0.5">
                          Their job titles do not match your target roles. They are still decision-makers at companies in your search, so a message can be worth it, with lower odds than the matches above.
                        </p>
                      </div>
                    )}
                    <FlashCard lead={lead} actionLabel={cardActionLabel} onSelect={() => onCta("card")} notePending={polling && justifiedIds.has(lead.id)} />
                  </Fragment>
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
                {pageWindow(currentPage, totalPages).map((pageNum) => (
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
      <AppFooter />

      {/* Floating CTA: only once the data is in, and only while the header CTA is off screen */}
      {hasLeads && !headerCtaVisible && (
        <div data-floating-cta className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
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
