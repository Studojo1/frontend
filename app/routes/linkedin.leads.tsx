import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    if (!candidateId) return;
    setLoading(true);
    outreachFetch<{ leads: Lead[] } | Lead[]>(`/candidate/${candidateId}/leads`)
      .then((r: any) => setLeads(Array.isArray(r) ? r : (r?.leads ?? [])))
      .catch((e: any) => setError(e?.body?.detail || "Couldn't load matches"))
      .finally(() => setLoading(false));
  }, [candidateId]);

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
            <button
              onClick={() => navigate("/linkedin/pricing")}
              className="h-9 px-4 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center whitespace-nowrap"
            >
              <FiSend className="w-4 h-4 mr-1.5" /> Send invites
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-satoshi text-studojo-muted">Scanning 2,000,000+ profiles for your matches…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center">
            <p className="text-red-600 font-satoshi">{error}</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border-2 border-studojo-ink/15 bg-studojo-surface-muted p-10 text-center">
            <p className="font-bold font-satoshi text-studojo-ink mb-1">Still finding matches…</p>
            <p className="text-sm text-studojo-muted font-satoshi">This usually takes about 2 minutes after upload. Refresh in a bit?</p>
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
