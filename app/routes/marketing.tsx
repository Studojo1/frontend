import { useState } from "react";
import {
  FiSearch, FiBriefcase, FiUser, FiLinkedin, FiMail, FiCheck, FiAlertCircle,
  FiRefreshCw, FiZap, FiCopy, FiExternalLink, FiTrendingUp,
} from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { outreachFetch } from "~/lib/outreach/api";

interface Lead {
  apollo_person_id: string;
  first_name: string;
  last_name_obfuscated: string;
  display_name: string;
  title: string;
  company: string;
  has_email: boolean;
  last_refreshed_at: string | null;
}

interface SimilarCompany {
  name: string;
  domain: string | null;
  logo_url: string | null;
  industry: string | null;
}

interface FindLeadResponse {
  lead: Lead | null;
  similar_companies: SimilarCompany[];
  searched_company: string;
  searched_position: string;
  swapped: boolean;
}

interface EnrichResponse {
  email: string | null;
  email_status: string | null;
  name: string;
  title: string | null;
  linkedin_url: string | null;
  company: string | null;
}

export default function MarketingDojoPage() {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<FindLeadResponse | null>(null);
  const [error, setError] = useState("");

  const [enriching, setEnriching] = useState(false);
  const [enriched, setEnriched] = useState<EnrichResponse | null>(null);
  const [enrichConfirm, setEnrichConfirm] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const runSearch = async (companyName: string, role: string) => {
    if (!companyName.trim() || !role.trim()) {
      setError("Enter both a company and a position.");
      return;
    }
    setError("");
    setSearching(true);
    setResult(null);
    setEnriched(null);
    setEnrichConfirm(false);
    try {
      const r = await outreachFetch<FindLeadResponse>("/marketing/find-lead", {
        method: "POST",
        body: JSON.stringify({ company: companyName.trim(), position: role.trim() }),
      });
      setResult(r);
    } catch (err: any) {
      setError(err?.body?.detail || err.message || "Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(company, position);
  };

  const handleSimilarClick = (cName: string) => {
    setCompany(cName);
    runSearch(cName, position);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEnrichClick = () => {
    setEnrichConfirm(true);
  };

  const confirmEnrich = async () => {
    if (!result?.lead) return;
    setEnrichConfirm(false);
    setEnriching(true);
    setError("");
    try {
      const r = await outreachFetch<EnrichResponse>("/marketing/enrich-email", {
        method: "POST",
        body: JSON.stringify({
          apollo_person_id: result.lead.apollo_person_id,
          first_name: result.lead.first_name,
          company: result.lead.company,
        }),
      });
      setEnriched(r);
    } catch (err: any) {
      const status = err?.status;
      if (status === 401) {
        setError("Sign in to enrich emails. Email enrichment requires a Studojo account.");
      } else {
        setError(err?.body?.detail || err.message || "Enrichment failed.");
      }
    } finally {
      setEnriching(false);
    }
  };

  const copyEmail = () => {
    if (!enriched?.email) return;
    navigator.clipboard.writeText(enriched.email);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 1800);
  };

  const lead = result?.lead;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero + search */}
      <section className="relative overflow-hidden border-b-2 border-studojo-ink/10">
        <div className="absolute inset-0 bg-gradient-to-br from-studojo-purple-bg/40 via-white to-studojo-green-bg/20 pointer-events-none" />
        <div className="relative mx-auto max-w-3xl px-4 py-14 md:py-20 md:px-8">
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-satoshi bg-white text-studojo-purple border-2 border-studojo-purple/30 mb-4">
              MARKETING DOJO · BETA
            </span>
            <h1 className="font-clash text-4xl md:text-5xl font-bold text-studojo-ink mb-3 leading-tight">
              Find the right person.<br />
              <span className="text-studojo-purple">In one search.</span>
            </h1>
            <p className="text-base md:text-lg text-studojo-muted font-satoshi max-w-xl mx-auto">
              Tell us the company and the role you want to reach. We'll surface the exact decision maker.
              Free — no portal, no upload, no profiling.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold font-satoshi text-studojo-ink uppercase tracking-wide mb-1.5">
                Company
              </label>
              <div className="relative">
                <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-studojo-muted" />
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Razorpay, Bain, Zomato"
                  className="w-full border-2 border-studojo-ink/20 rounded-xl pl-10 pr-4 py-3 text-sm font-satoshi focus:outline-none focus:border-studojo-purple"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold font-satoshi text-studojo-ink uppercase tracking-wide mb-1.5">
                Position you want to reach
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-studojo-muted" />
                <input
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Head of Marketing, Analyst, VP Sales"
                  className="w-full border-2 border-studojo-ink/20 rounded-xl pl-10 pr-4 py-3 text-sm font-satoshi focus:outline-none focus:border-studojo-purple"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={searching || !company.trim() || !position.trim()}
              className="w-full h-12 rounded-xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
            >
              {searching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <FiSearch className="w-4 h-4" /> Find the person
                </>
              )}
            </button>
            <p className="text-xs text-studojo-muted font-satoshi text-center">
              Search is free. Email enrichment uses 1 Apollo credit per click.
            </p>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 md:px-8 py-10">
        {error && (
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 mb-6 flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-satoshi text-red-700">{error}</p>
          </div>
        )}

        {/* No result */}
        {result && !lead && (
          <div className="rounded-2xl border-2 border-studojo-ink/15 bg-studojo-surface-muted p-8 text-center">
            <FiSearch className="w-10 h-10 text-studojo-muted mx-auto mb-3" />
            <p className="text-base font-bold font-satoshi text-studojo-ink mb-1">No match found</p>
            <p className="text-sm text-studojo-muted font-satoshi">
              We searched for <span className="font-bold">{result.searched_position}</span> at{" "}
              <span className="font-bold">{result.searched_company}</span> and couldn't find anyone.
              Double-check the company name is in the <span className="font-bold">Company</span> field
              and the job title is in the <span className="font-bold">Position</span> field, or try a different title.
            </p>
          </div>
        )}

        {/* Swap notice */}
        {lead && result?.swapped && (
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3 mb-4 flex items-start gap-2">
            <FiAlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-satoshi text-amber-800">
              Looked like your fields were swapped. We searched for{" "}
              <span className="font-bold">{result.searched_position}</span> at{" "}
              <span className="font-bold">{result.searched_company}</span> instead. Showing that result.
            </p>
          </div>
        )}

        {/* Flashcard */}
        {lead && (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6 md:p-8 mb-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-purple text-2xl font-clash font-bold flex-shrink-0">
                {lead.first_name?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-clash text-2xl font-bold text-studojo-ink leading-tight">
                  {enriched?.name || lead.display_name}
                  {!enriched && lead.last_name_obfuscated && (
                    <span className="ml-2 text-xs font-satoshi font-medium text-studojo-muted align-middle">
                      (last name hidden — enrich to reveal)
                    </span>
                  )}
                </h2>
                <p className="text-sm font-satoshi text-studojo-muted mt-1">{lead.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-satoshi text-studojo-muted">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-studojo-surface-muted border border-studojo-ink/10">
                    <FiBriefcase className="w-3 h-3" /> {lead.company}
                  </span>
                </div>
              </div>
            </div>

            {enriched?.linkedin_url && (
              <a
                href={enriched.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-satoshi font-bold text-studojo-purple hover:underline mb-5"
              >
                <FiLinkedin className="w-4 h-4" /> View LinkedIn profile
                <FiExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Email section */}
            <div className="border-t border-studojo-ink/10 pt-5">
              {!enriched ? (
                <>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-bold font-satoshi text-studojo-ink">Work email</p>
                      <p className="text-xs text-studojo-muted font-satoshi mt-0.5">
                        Reveal the verified email — uses 1 Apollo credit.
                      </p>
                    </div>
                  </div>
                  {!enrichConfirm ? (
                    <button
                      onClick={handleEnrichClick}
                      disabled={enriching}
                      className="w-full h-11 rounded-xl bg-studojo-ink text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                      <FiZap className="w-4 h-4" /> Enrich email · 1 credit
                    </button>
                  ) : (
                    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
                      <p className="text-sm font-bold font-satoshi text-amber-900 mb-1">Confirm enrichment</p>
                      <p className="text-xs font-satoshi text-amber-800 mb-3">
                        This will burn <span className="font-bold">1 Apollo credit</span> to reveal{" "}
                        {lead.first_name}'s verified work email, full name, and LinkedIn URL.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEnrichConfirm(false)}
                          className="flex-1 h-10 rounded-xl border-2 border-studojo-ink bg-white text-sm font-satoshi font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmEnrich}
                          disabled={enriching}
                          className="flex-1 h-10 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-bold border-2 border-studojo-ink disabled:opacity-50"
                        >
                          {enriching ? "Enriching…" : "Yes, use 1 credit"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : enriched.email ? (
                <div className="rounded-xl border-2 border-studojo-green/40 bg-studojo-green-bg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCheck className="w-4 h-4 text-studojo-green" />
                    <p className="text-xs font-bold font-satoshi text-studojo-green uppercase">
                      {enriched.email_status === "verified" ? "Verified email" : "Email found"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail className="w-4 h-4 text-studojo-ink flex-shrink-0" />
                    <code className="flex-1 text-sm font-mono text-studojo-ink truncate">
                      {enriched.email}
                    </code>
                    <button
                      onClick={copyEmail}
                      className="flex-shrink-0 h-9 px-3 rounded-lg bg-white border-2 border-studojo-ink text-xs font-bold font-satoshi inline-flex items-center gap-1"
                    >
                      {emailCopied ? (
                        <><FiCheck className="w-3.5 h-3.5 text-studojo-green" /> Copied</>
                      ) : (
                        <><FiCopy className="w-3.5 h-3.5" /> Copy</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-bold font-satoshi text-amber-900 mb-0.5">Email not available</p>
                  <p className="text-xs text-studojo-muted font-satoshi">
                    Apollo couldn't reveal a verified email for this contact. Try a slightly different role
                    or someone else at the company.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Similar companies */}
        {result && result.similar_companies.length > 0 && (
          <div className="rounded-2xl border-2 border-studojo-ink/15 bg-white p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FiTrendingUp className="w-5 h-5 text-studojo-purple" />
              <h3 className="font-clash text-lg font-bold text-studojo-ink">
                Similar companies hiring {position}
              </h3>
            </div>
            <p className="text-xs text-studojo-muted font-satoshi mb-4">
              Click any company to find the same role's decision maker there (free).
            </p>
            <div className="flex flex-wrap gap-2">
              {result.similar_companies.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleSimilarClick(c.name)}
                  disabled={searching}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-studojo-surface-muted border-2 border-studojo-ink/15 hover:border-studojo-purple hover:bg-studojo-purple-bg transition-colors text-sm font-bold font-satoshi text-studojo-ink disabled:opacity-50"
                >
                  <FiBriefcase className="w-3.5 h-3.5 text-studojo-muted" />
                  {c.name}
                  <FiRefreshCw className="w-3 h-3 text-studojo-muted" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        {!result && !searching && (
          <div className="rounded-2xl border-2 border-studojo-ink/15 bg-studojo-surface-muted p-6">
            <h3 className="font-clash text-lg font-bold text-studojo-ink mb-4">How it works</h3>
            <ol className="space-y-3">
              {[
                "Type the company and the role you want to reach — no resume upload needed.",
                "We surface one matching decision maker with their LinkedIn profile, instantly. Free.",
                "Click Enrich Email to reveal their verified work email — uses one Apollo credit.",
                "Browse similar companies in the same space and pull their hiring manager too.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-satoshi text-studojo-ink">
                  <span className="w-6 h-6 rounded-full bg-studojo-purple text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
