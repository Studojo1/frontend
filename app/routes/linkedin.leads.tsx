import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { FiArrowRight, FiArrowLeft, FiFilter, FiLinkedin, FiSend } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { FlashCard } from "~/components/outreach/FlashCard";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";
import type { Lead } from "~/lib/outreach/types";

const PAGE_SIZE = 12;

export default function LinkedInLeads() {
  const navigate = useNavigate();
  useOutreachAuth();
  const { candidateId } = useOutreachStore();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"score" | "name">("score");

  useEffect(() => {
    if (!candidateId) {
      const t = setTimeout(() => navigate("/linkedin/onboarding/upload"), 200);
      return () => clearTimeout(t);
    }
  }, [candidateId, navigate]);

  const [importing, setImporting] = useState(false);
  const [hasOutreachLeads, setHasOutreachLeads] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const discoverStartedRef = useRef(false);

  // Fetch leads; resolves to the count so callers can poll for completion.
  const loadLeads = (silent = false): Promise<number> => {
    if (!candidateId) return Promise.resolve(0);
    if (!silent) setLoading(true);
    return outreachFetch<{ leads: Lead[] } | Lead[]>(`/candidate/${candidateId}/leads`)
      .then((r: any) => {
        const arr = Array.isArray(r) ? r : (r?.leads ?? []);
        setLeads(arr);
        return arr.length as number;
      })
      .catch((e: any) => { setError(e?.body?.detail || "Couldn't load matches"); return 0; })
      .finally(() => { if (!silent) setLoading(false); });
  };

  // Find real LinkedIn profiles via public web search — no login, no Apollo.
  // Backend runs in the background (~1-2 min), so we poll for the new rows.
  const findLinkedInLeads = async () => {
    if (!candidateId || discovering) return;
    setDiscovering(true);
    setError("");
    try {
      await outreachFetch<any>("/discovery/linkedin-discover", {
        method: "POST",
        body: JSON.stringify({ candidate_id: candidateId }),
        timeout: 30_000,
      });
      for (let i = 0; i < 24; i++) {
        await new Promise((r) => setTimeout(r, 10_000));
        const n = await loadLeads(true);
        if (n > 0) break;
      }
    } catch (e: any) {
      setError(e?.body?.detail || "Couldn't find LinkedIn leads right now. Try again in a moment.");
    } finally {
      setDiscovering(false);
    }
  };

  useEffect(() => {
    loadLeads().then((n) => {
      // Works on its own: if there are no leads yet, kick off web discovery once.
      if (n === 0 && !discoverStartedRef.current) {
        discoverStartedRef.current = true;
        findLinkedInLeads();
      }
    });
  }, [candidateId]);

  // Check whether the user has leads in a previous Outreach campaign to offer import.
  useEffect(() => {
    if (!candidateId) return;
    outreachFetch<any>(`/discovery/outreach-sources/${candidateId}`)
      .then((r: any) => setHasOutreachLeads((r?.sources?.length ?? 0) > 0))
      .catch(() => setHasOutreachLeads(false));
  }, [candidateId]);

  const importFromOutreach = async () => {
    if (!candidateId || importing) return;
    setImporting(true);
    try {
      const r = await outreachFetch<any>("/discovery/import-from-outreach", {
        method: "POST",
        body: JSON.stringify({ candidate_id: candidateId }),
        timeout: 60_000,
      });
      loadLeads();
      setHasOutreachLeads(false);
      if ((r?.imported ?? 0) === 0) setError("No new leads to import — they're already here.");
    } catch (e: any) {
      setError(e?.body?.detail || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const sorted = useMemo(() => {
    const arr = [...leads];
    if (sortBy === "score") {
      arr.sort((a, b) => (b.score?.overall || 0) - (a.score?.overall || 0));
    } else {
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return arr;
  }, [leads, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />
      <div className="mx-auto max-w-[var(--section-max-width,1280px)] px-4 py-6 md:px-8">
        <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between sm:mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-satoshi bg-[#0a66c2]/10 text-[#0a66c2] border border-[#0a66c2]/30 mb-2">
              <FiLinkedin className="w-3 h-3" /> LINKEDIN
            </span>
            <h1 className="font-clash text-xl sm:text-2xl font-bold text-studojo-ink">Your hiring managers</h1>
            <p className="text-sm text-studojo-muted font-satoshi mt-0.5">
              <span className="font-semibold text-studojo-ink">{sorted.length} hand-picked matches</span>. We'll send connection invites to the ones you don't filter out.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <FiFilter className="w-4 h-4 text-studojo-muted flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as "score" | "name"); setPage(1); }}
                className="flex-1 sm:flex-none text-sm border-2 border-studojo-ink/20 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-studojo-purple font-satoshi"
              >
                <option value="score">Highest score</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>
            {hasOutreachLeads && (
              <button
                onClick={importFromOutreach}
                disabled={importing}
                className="h-9 px-4 rounded-xl bg-white text-studojo-ink text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center whitespace-nowrap disabled:opacity-60"
                title="Bring leads you already discovered in an Outreach campaign into LinkedIn"
              >
                {importing ? "Importing…" : "⬇ Export from Outreach"}
              </button>
            )}
            <button
              onClick={() => navigate("/linkedin/pricing")}
              className="h-9 px-4 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center whitespace-nowrap"
            >
              <FiSend className="w-4 h-4 mr-1.5" /> Send invites
            </button>
          </div>
        </div>

        {loading || (discovering && sorted.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-satoshi text-studojo-muted">
              {discovering
                ? "Finding real LinkedIn profiles for you… this takes about a minute."
                : "Scanning 2,000,000+ profiles for your matches…"}
            </p>
          </div>
        ) : error && sorted.length === 0 ? (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center">
            <p className="text-red-600 font-satoshi mb-4">{error}</p>
            <button
              onClick={findLinkedInLeads}
              disabled={discovering}
              className="h-10 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center disabled:opacity-60"
            >
              {discovering ? "Finding…" : "Find LinkedIn leads"}
            </button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border-2 border-studojo-ink/15 bg-studojo-surface-muted p-10 text-center">
            <p className="font-bold font-satoshi text-studojo-ink mb-1">No LinkedIn matches yet</p>
            <p className="text-sm text-studojo-muted font-satoshi mb-4">
              We find these by searching the public web — no LinkedIn login needed.
              {hasOutreachLeads ? " You can also pull in leads from an Outreach campaign." : ""}
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={findLinkedInLeads}
                disabled={discovering}
                className="h-10 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center disabled:opacity-60"
              >
                {discovering ? "Finding…" : "Find LinkedIn leads"}
              </button>
              {hasOutreachLeads && (
                <button
                  onClick={importFromOutreach}
                  disabled={importing}
                  className="h-10 px-5 rounded-xl bg-white text-studojo-ink text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center disabled:opacity-60"
                >
                  {importing ? "Importing…" : "⬇ Export from Outreach"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginated.map((lead) => (
                <FlashCard key={lead.id} lead={lead} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border-2 border-studojo-ink/20 hover:bg-studojo-surface-muted disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FiArrowLeft className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-satoshi text-studojo-muted">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border-2 border-studojo-ink/20 hover:bg-studojo-surface-muted disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky CTA — drives them to pricing */}
      {!loading && sorted.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => navigate("/linkedin/pricing")}
            className="h-12 px-7 rounded-2xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center gap-2 whitespace-nowrap"
          >
            <FiSend className="w-4 h-4" /> Send invites to these {sorted.length} <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}
