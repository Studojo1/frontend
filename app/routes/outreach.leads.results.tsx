import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FiArrowRight, FiArrowLeft, FiFilter, FiMail, FiSend } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { FlashCard } from "~/components/outreach/FlashCard";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";
import type { Lead } from "~/lib/outreach/types";

const PAGE_SIZE = 20;

export default function ResultsPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { candidateId } = useOutreachStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "name">("score");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (authLoading || !candidateId) return;
    outreachFetch<{ leads: Lead[] } | Lead[]>(`/candidate/${candidateId}/leads`)
      .then((data) => setLeads(Array.isArray(data) ? data : data.leads || []))
      .catch((err) => setError(err?.body?.detail || err.message || "Failed to load leads"))
      .finally(() => setLoading(false));
  }, [authLoading, candidateId]);

  const sorted = [...leads].sort((a, b) => {
    if (sortBy === "score") return (b.score?.overall || 0) - (a.score?.overall || 0);
    return (a.name || "").localeCompare(b.name || "");
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!candidateId) {
    navigate("/outreach/onboarding/upload");
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />
      <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-6 md:px-8">
        <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between sm:mb-6">
          <div>
            <h1 className="font-clash text-xl sm:text-2xl font-bold text-studojo-ink">Lead Results</h1>
            <p className="text-sm text-studojo-muted font-satoshi mt-0.5">
              {leads.length} decision makers found. Tap cards to see scoring details.
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
                <option value="score">Highest Score</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
            <button
              onClick={() => navigate("/outreach/enrichment")}
              className="h-9 px-4 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center whitespace-nowrap"
            >
              <FiSend className="w-4 h-4 mr-1.5" /> Send Emails
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center">
            <p className="text-red-600 font-satoshi">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) pageNum = i + 1;
                  else if (page <= 4) pageNum = i + 1;
                  else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
                  else pageNum = page - 3 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold font-satoshi transition-colors ${
                        page === pageNum
                          ? "bg-studojo-purple text-white border-2 border-studojo-ink"
                          : "border-2 border-studojo-ink/20 hover:bg-studojo-surface-muted text-studojo-muted"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
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
      <Footer />

      {/* Floating Send Emails button — always visible */}
      {leads.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => navigate("/outreach/enrichment")}
            className="h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-semibold text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center whitespace-nowrap"
          >
            <FiSend className="w-4 h-4 mr-2" /> Send Emails
          </button>
        </div>
      )}
    </div>
  );
}