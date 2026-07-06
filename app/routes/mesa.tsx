import { useEffect, useState, useCallback } from "react";
import { redirect } from "react-router";
import { Header, Footer } from "~/components";
import {
  FiPlus, FiPlay, FiDownload, FiTrash2, FiEdit2, FiSearch,
  FiMapPin, FiClock, FiExternalLink, FiRefreshCw, FiX, FiZap,
} from "react-icons/fi";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { outreachFetch } from "~/lib/outreach/api";
import type { Route } from "./+types/mesa";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth?redirect=/mesa");
  return { user: { name: session.user.name, email: session.user.email } };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mesa — Job & Hiring-Signal Tracker | Studojo" },
    { name: "description", content: "Daily job scraping plus company hiring signals for the roles and keywords you care about." },
  ];
}

const DATE_OPTIONS = [
  { v: "24h", l: "Last 24 hours" },
  { v: "week", l: "Last week" },
  { v: "month", l: "Last month" },
  { v: "any", l: "Any time" },
];
const WORKPLACE = [
  { v: "on-site", l: "On-site" },
  { v: "remote", l: "Remote" },
  { v: "hybrid", l: "Hybrid" },
];
const EXPERIENCE = [
  { v: "internship", l: "Internship" },
  { v: "entry", l: "Entry" },
  { v: "associate", l: "Associate" },
  { v: "mid-senior", l: "Mid-Senior" },
  { v: "director", l: "Director" },
  { v: "executive", l: "Executive" },
];
const SOURCES = [
  { v: "linkedin", l: "LinkedIn" },
  { v: "linkedin_posts", l: "LinkedIn Posts" },
  { v: "getro", l: "VC Boards (Getro)" },
  { v: "themuse", l: "The Muse" },
  { v: "remotive", l: "Remotive" },
  { v: "remoteok", l: "RemoteOK" },
  { v: "arbeitnow", l: "Arbeitnow" },
  { v: "jobicy", l: "Jobicy" },
  { v: "weworkremotely", l: "WeWorkRemotely" },
  { v: "instahyre", l: "InstaHyre (beta)" },
  { v: "indeed", l: "Indeed (beta)" },
  { v: "naukri", l: "Naukri (beta)" },
];
const SOURCE_STYLE: Record<string, string> = {
  linkedin: "bg-[#0a66c2] text-white", linkedin_posts: "bg-[#004182] text-white", getro: "bg-fuchsia-600 text-white",
  themuse: "bg-violet-500 text-white",
  remotive: "bg-emerald-500 text-white", remoteok: "bg-neutral-800 text-white",
  arbeitnow: "bg-amber-500 text-neutral-900", instahyre: "bg-rose-500 text-white",
  jobicy: "bg-teal-500 text-white", weworkremotely: "bg-blue-600 text-white",
  indeed: "bg-indigo-600 text-white", naukri: "bg-sky-600 text-white",
};
const srcLabel = (v: string) => SOURCES.find((s) => s.v === v)?.l || v;

type Search = {
  id: number; name: string; keywords: string; location: string;
  date_posted: string; workplace_types: string[]; experience_levels: string[];
  sources: string[]; is_active: boolean; last_run_at: string | null; job_count: number;
};
type Job = {
  id: number; title: string; company: string; location: string;
  posted_date: string | null; url: string; source: string; scraped_at: string | null;
  author?: string | null; apply_link?: string | null; post_text?: string | null;
};
type Brief = { confidence?: number; verdict?: string; narrative?: string; outreach_opener?: string; kill_signal?: boolean };
type CompanySignal = {
  company: string; score: number; n_families: number; confluence: boolean;
  families: string[]; signals: string[]; top_role: string; role_count: number;
  sample_roles: string[]; sources: string[]; freshest_posted?: string | null;
  read: string; enriched?: boolean; brief?: Brief | null; news_headlines?: string[];
};
type Enrichment = { running: boolean; done: number; total: number };

const card = "rounded-2xl border-2 border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]";
const btn = "inline-flex items-center gap-2 rounded-xl border-2 border-neutral-900 px-3.5 py-2 text-sm font-semibold shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50";
const blankForm = (): Omit<Search, "id" | "last_run_at" | "job_count"> => ({
  name: "", keywords: "", location: "", date_posted: "24h",
  workplace_types: [], experience_levels: [], sources: ["linkedin", "getro", "themuse", "remotive"], is_active: true,
});
const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
const fmtDate = (s: string | null) => (s ? new Date(s).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "never");
const scoreColor = (s: number) => (s >= 70 ? "bg-emerald-500 text-white" : s >= 45 ? "bg-amber-400 text-neutral-900" : "bg-neutral-300 text-neutral-700");

export default function Mesa() {
  const [searches, setSearches] = useState<Search[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsTotal, setJobsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Search | "new" | null>(null);
  const [form, setForm] = useState(blankForm());
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"scraped" | "posted" | "company" | "title">("scraped");
  // Signals view
  const [view, setView] = useState<"jobs" | "signals">("jobs");
  const [signals, setSignals] = useState<CompanySignal[]>([]);
  const [sigInfo, setSigInfo] = useState<{ total_companies: number; confluence_count: number; enrichment?: Enrichment } | null>(null);
  const [sigLoading, setSigLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);

  const loadSearches = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await outreachFetch<{ searches: Search[] }>("/mesa/searches");
      setSearches(data.searches);
      setSelected((prev) => prev ?? (data.searches[0]?.id ?? null));
    } catch (e: any) { setError(e?.message || "Failed to load searches"); }
    finally { setLoading(false); }
  }, []);

  const loadJobs = useCallback(async (id: number) => {
    setJobsLoading(true);
    try {
      const params = new URLSearchParams({ sort, limit: "300" });
      if (q.trim()) params.set("q", q.trim());
      const data = await outreachFetch<{ total: number; jobs: Job[] }>(`/mesa/searches/${id}/jobs?${params}`);
      setJobs(data.jobs); setJobsTotal(data.total);
    } catch (e: any) { setError(e?.message || "Failed to load jobs"); }
    finally { setJobsLoading(false); }
  }, [q, sort]);

  const loadSignals = useCallback(async (id: number) => {
    setSigLoading(true);
    try {
      const d = await outreachFetch<{ total_companies: number; confluence_count: number; enrichment?: Enrichment; companies: CompanySignal[] }>(`/mesa/searches/${id}/signals?limit=60`);
      setSignals(d.companies || []);
      setSigInfo({ total_companies: d.total_companies, confluence_count: d.confluence_count, enrichment: d.enrichment });
    } catch (e: any) { setError(e?.message || "Failed to load signals"); }
    finally { setSigLoading(false); }
  }, []);

  useEffect(() => { loadSearches(); }, [loadSearches]);
  useEffect(() => { if (selected && view === "jobs") loadJobs(selected); }, [selected, view, loadJobs]);
  useEffect(() => { if (selected && view === "signals") loadSignals(selected); }, [selected, view, loadSignals]);

  const enrichSignals = async (id: number) => {
    setEnriching(true); setError("");
    try {
      await outreachFetch(`/mesa/searches/${id}/signals/enrich?limit=15`, { method: "POST", maxRetries: 1 });
    } catch (e: any) { setError(e?.message || "Failed to start enrichment"); setEnriching(false); return; }
    setError("Enriching the top companies with funding, news and an AI brief — this takes a minute and refreshes automatically.");
    let tries = 0;
    const poll = async () => {
      tries++;
      await loadSignals(id);
      try {
        const d = await outreachFetch<{ enrichment?: Enrichment }>(`/mesa/searches/${id}/signals?limit=1`);
        if (d.enrichment && !d.enrichment.running && d.enrichment.total > 0) {
          setEnriching(false); setError("Enrichment done — companies updated."); await loadSignals(id); return;
        }
      } catch {}
      if (tries >= 18) { setEnriching(false); return; }
      setTimeout(poll, 10_000);
    };
    setTimeout(poll, 8_000);
  };

  const saveSearch = async () => {
    if (!form.name.trim() || !form.keywords.trim()) { setError("Name and keywords are required"); return; }
    try {
      if (editing === "new") await outreachFetch("/mesa/searches", { method: "POST", body: JSON.stringify(form) });
      else if (editing) await outreachFetch(`/mesa/searches/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
      setEditing(null); await loadSearches();
    } catch (e: any) { setError(e?.message || "Failed to save"); }
  };

  const removeSearch = async (id: number) => {
    if (!confirm("Delete this search and all its scraped jobs?")) return;
    try {
      await outreachFetch(`/mesa/searches/${id}`, { method: "DELETE" });
      if (selected === id) setSelected(null);
      await loadSearches();
    } catch (e: any) { setError(e?.message || "Failed to delete"); }
  };

  const runNow = async (id: number) => {
    setRunning(true); setError("");
    const before = searches.find((s) => s.id === id)?.last_run_at || null;
    try {
      await outreachFetch(`/mesa/searches/${id}/run`, { method: "POST", maxRetries: 1 });
    } catch (e: any) { setError(e?.message || "Failed to start run"); setRunning(false); return; }
    setError("Scraping in the background — a deep run takes 1-3 minutes. Results refresh automatically.");
    let tries = 0;
    const poll = async () => {
      tries++;
      try {
        const d = await outreachFetch<{ searches: Search[] }>("/mesa/searches");
        setSearches(d.searches);
        const now = d.searches.find((s) => s.id === id)?.last_run_at || null;
        if (now && now !== before) {
          if (view === "jobs") await loadJobs(id); else await loadSignals(id);
          setRunning(false); setError("Done — results updated."); return;
        }
      } catch {}
      if (tries >= 30) { setRunning(false); setError("Still scraping — it'll finish shortly; refresh to see new results."); return; }
      setTimeout(poll, 10_000);
    };
    setTimeout(poll, 10_000);
  };

  const exportCsv = async (s: Search) => {
    try {
      const data = await outreachFetch<{ jobs: Job[] }>(`/mesa/searches/${s.id}/jobs?limit=1000&sort=scraped`);
      const rows = [["Title", "Company", "Author", "Apply", "LinkedIn URL", "Location", "Posted", "Source", "Post"]];
      data.jobs.forEach((j) => rows.push([j.title, j.company, j.author || "", (j.apply_link || "").replace(/^mailto:/, ""), j.url, j.location, j.posted_date || "", srcLabel(j.source), (j.post_text || "").slice(0, 500)]));
      const csv = rows.map((r) => r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `mesa_${s.name.replace(/\s+/g, "_").slice(0, 40)}.csv`;
      a.click();
    } catch (e: any) { setError(e?.message || "Export failed"); }
  };

  const openForm = (s: Search | "new") => {
    setEditing(s);
    setForm(s === "new" ? blankForm() : { name: s.name, keywords: s.keywords, location: s.location, date_posted: s.date_posted, workplace_types: s.workplace_types, experience_levels: s.experience_levels, sources: s.sources?.length ? s.sources : ["linkedin"], is_active: s.is_active });
  };

  const current = searches.find((s) => s.id === selected) || null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-['Clash_Display'] text-3xl font-bold text-neutral-900">
              Mesa <span className="text-violet-500">·</span> Job &amp; Signal Tracker
            </h1>
            <p className="text-sm text-neutral-600 mt-1">Saved searches scrape jobs daily and score which companies are hiring your profiles. No LinkedIn login needed.</p>
          </div>
          <button onClick={() => openForm("new")} className={`${btn} bg-violet-500 text-white`}><FiPlus /> New search</button>
        </div>

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border-2 border-neutral-900 bg-amber-50 px-4 py-2.5 text-sm font-medium text-neutral-800">
            <span>{error}</span>
            <button onClick={() => setError("")}><FiX /></button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-[3px] border-violet-500 border-t-transparent" /></div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            {/* Searches sidebar */}
            <div className="space-y-3">
              {searches.length === 0 && (
                <div className={`${card} p-6 text-center text-sm text-neutral-500`}>No searches yet. Create one to start tracking jobs.</div>
              )}
              {searches.map((s) => (
                <div key={s.id} onClick={() => setSelected(s.id)}
                  className={`${card} cursor-pointer p-4 transition-all ${selected === s.id ? "ring-2 ring-violet-500" : "hover:translate-x-[1px] hover:translate-y-[1px]"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-neutral-900">{s.name}</div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.is_active ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-500"}`}>{s.is_active ? "ACTIVE" : "PAUSED"}</span>
                  </div>
                  <div className="mt-1 text-xs text-neutral-600 line-clamp-1">{s.keywords}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500">
                    {s.location && <span className="inline-flex items-center gap-1"><FiMapPin size={11} />{s.location}</span>}
                    <span className="inline-flex items-center gap-1"><FiClock size={11} />{fmtDate(s.last_run_at)}</span>
                    <span className="font-semibold text-violet-600">{s.job_count} jobs</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); runNow(s.id); }} disabled={running} className={`${btn} bg-white px-2.5 py-1 text-xs`}><FiPlay size={12} /> Run</button>
                    <button onClick={(e) => { e.stopPropagation(); openForm(s); }} className={`${btn} bg-white px-2.5 py-1 text-xs`}><FiEdit2 size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); removeSearch(s.id); }} className={`${btn} bg-white px-2.5 py-1 text-xs text-red-600`}><FiTrash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Results */}
            <div className={`${card} overflow-hidden`}>
              {!current ? (
                <div className="p-10 text-center text-neutral-500">Select a search to see its jobs.</div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-neutral-900 bg-neutral-50 px-5 py-3">
                    <div>
                      <h2 className="font-['Clash_Display'] text-lg font-bold">{current.name}</h2>
                      <p className="text-xs text-neutral-500">
                        {view === "jobs" ? `${jobsTotal} jobs tracked` : `${sigInfo?.total_companies ?? signals.length} companies scored · ${sigInfo?.confluence_count ?? 0} with 2+ signals`} · last run {fmtDate(current.last_run_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex overflow-hidden rounded-xl border-2 border-neutral-900">
                        <button onClick={() => setView("jobs")} className={`px-3 py-1.5 text-sm font-semibold ${view === "jobs" ? "bg-violet-500 text-white" : "bg-white text-neutral-700"}`}>Jobs</button>
                        <button onClick={() => setView("signals")} className={`border-l-2 border-neutral-900 px-3 py-1.5 text-sm font-semibold ${view === "signals" ? "bg-violet-500 text-white" : "bg-white text-neutral-700"}`}>Signals</button>
                      </div>
                      {view === "jobs" && (
                        <>
                          <div className="relative">
                            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter title/company" className="w-44 rounded-xl border-2 border-neutral-300 py-1.5 pl-8 pr-2 text-sm focus:border-violet-500 focus:outline-none" />
                          </div>
                          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-xl border-2 border-neutral-300 px-2 py-1.5 text-sm focus:outline-none">
                            <option value="scraped">Newest scraped</option>
                            <option value="posted">Date posted</option>
                            <option value="company">Company</option>
                            <option value="title">Title</option>
                          </select>
                          <button onClick={() => exportCsv(current)} className={`${btn} bg-white`}><FiDownload /> CSV</button>
                        </>
                      )}
                      {view === "signals" && (
                        <button onClick={() => enrichSignals(current.id)} disabled={enriching} className={`${btn} bg-white`}>{enriching ? <FiRefreshCw className="animate-spin" /> : <FiZap />} Enrich</button>
                      )}
                      <button onClick={() => runNow(current.id)} disabled={running} className={`${btn} bg-violet-500 text-white`}>{running ? <FiRefreshCw className="animate-spin" /> : <FiPlay />} Run now</button>
                    </div>
                  </div>

                  {view === "jobs" ? (
                    jobsLoading ? (
                      <div className="flex justify-center py-16"><div className="h-7 w-7 animate-spin rounded-full border-[3px] border-violet-500 border-t-transparent" /></div>
                    ) : jobs.length === 0 ? (
                      <div className="p-10 text-center text-neutral-500">No jobs yet. Hit “Run now” to scrape, or wait for the daily run.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead><tr className="bg-neutral-50 text-left text-neutral-600">
                            <th className="px-4 py-2 font-semibold border-b border-neutral-200">Role</th>
                            <th className="px-4 py-2 font-semibold border-b border-neutral-200">Company</th>
                            <th className="px-4 py-2 font-semibold border-b border-neutral-200">Location</th>
                            <th className="px-4 py-2 font-semibold border-b border-neutral-200 whitespace-nowrap">Posted</th>
                            <th className="px-4 py-2 font-semibold border-b border-neutral-200">Source</th>
                            <th className="px-4 py-2 font-semibold border-b border-neutral-200"></th>
                          </tr></thead>
                          <tbody>
                            {jobs.map((j, i) => (
                              <tr key={j.id} className={i % 2 ? "bg-neutral-50/40" : "bg-white"}>
                                <td className="px-4 py-2.5 border-b border-neutral-100 font-medium text-neutral-900 max-w-[280px]">{j.title}</td>
                                <td className="px-4 py-2.5 border-b border-neutral-100 text-neutral-700">{j.company}</td>
                                <td className="px-4 py-2.5 border-b border-neutral-100 text-neutral-500">{j.location}</td>
                                <td className="px-4 py-2.5 border-b border-neutral-100 text-neutral-500 whitespace-nowrap">{j.posted_date || "—"}</td>
                                <td className="px-4 py-2.5 border-b border-neutral-100"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${SOURCE_STYLE[j.source] || "bg-neutral-200 text-neutral-700"}`}>{srcLabel(j.source)}</span></td>
                                <td className="px-4 py-2.5 border-b border-neutral-100 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    {j.url ? (
                                      <a href={j.url} target="_blank" rel="noreferrer" title={j.author ? `Open ${j.author} on LinkedIn` : "Open on LinkedIn"} className="inline-flex items-center gap-1 text-violet-600 hover:underline"><FiExternalLink size={14} /> {j.source === "linkedin_posts" ? "LinkedIn" : "Open"}</a>
                                    ) : <span className="text-neutral-300">—</span>}
                                    {j.apply_link ? (
                                      <a href={j.apply_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-600 hover:underline" title={j.apply_link.replace(/^mailto:/, "")}>✉ Apply</a>
                                    ) : null}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    sigLoading ? (
                      <div className="flex justify-center py-16"><div className="h-7 w-7 animate-spin rounded-full border-[3px] border-violet-500 border-t-transparent" /></div>
                    ) : signals.length === 0 ? (
                      <div className="p-10 text-center text-neutral-500">No signals yet. Run the search to scrape jobs, then this scores which companies are worth reaching out to. Hit “Enrich” for funding, news and an AI brief on the top companies.</div>
                    ) : (
                      <div className="space-y-3 p-4">
                        <p className="px-1 text-[11px] text-neutral-500">Companies ranked by how many independent hiring signals they emit. 2+ signals (confluence) is a real signal; one alone is usually noise.</p>
                        {signals.map((c) => (
                          <div key={c.company} className="rounded-xl border-2 border-neutral-900 bg-white p-3.5 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
                            <div className="flex items-start gap-3">
                              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-black ${scoreColor(c.score)}`}>{c.score}</div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-neutral-900">{c.company}</span>
                                  {c.confluence && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">CONFLUENCE · {c.n_families}</span>}
                                  {c.enriched && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">ENRICHED</span>}
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                  {c.signals.map((s, i) => <span key={i} className="rounded-md border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">{s}</span>)}
                                </div>
                                <p className="mt-2 text-[13px] text-neutral-700">{c.read}</p>
                                {c.brief && (
                                  <div className="mt-2 rounded-lg border border-violet-200 bg-violet-50 p-2.5 text-[12.5px]">
                                    <div className="font-semibold text-violet-800">AI brief · {c.brief.verdict}{typeof c.brief.confidence === "number" ? ` (${c.brief.confidence}%)` : ""}</div>
                                    {c.brief.narrative && <p className="mt-1 text-neutral-700">{c.brief.narrative}</p>}
                                    {c.brief.outreach_opener && <p className="mt-1 italic text-neutral-600">“{c.brief.outreach_opener}”</p>}
                                  </div>
                                )}
                                {c.top_role && <p className="mt-1.5 text-[11px] text-neutral-400">Top role: {c.top_role} · {c.role_count} open{c.freshest_posted ? ` · freshest ${c.freshest_posted}` : ""}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Create / edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <div className={`${card} w-full max-w-lg p-6`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Clash_Display'] text-xl font-bold">{editing === "new" ? "New search" : "Edit search"}</h3>
              <button onClick={() => setEditing(null)}><FiX /></button>
            </div>
            <div className="space-y-4">
              <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Marketing internships — Paris" className={inputCls} /></Field>
              <Field label="Keywords / role"><input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="e.g. marketing intern" className={inputCls} /></Field>
              <Field label="Location"><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Paris, France (leave blank for worldwide)" className={inputCls} /></Field>
              <Field label="Date posted">
                <select value={form.date_posted} onChange={(e) => setForm({ ...form, date_posted: e.target.value })} className={inputCls}>
                  {DATE_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </Field>
              <Field label="Workplace type"><Chips opts={WORKPLACE} sel={form.workplace_types} onTap={(v) => setForm({ ...form, workplace_types: toggle(form.workplace_types, v) })} /></Field>
              <Field label="Seniority"><Chips opts={EXPERIENCE} sel={form.experience_levels} onTap={(v) => setForm({ ...form, experience_levels: toggle(form.experience_levels, v) })} /></Field>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-500">Job sources</label>
                <Chips opts={SOURCES} sel={form.sources} onTap={(v) => setForm({ ...form, sources: toggle(form.sources, v) })} />
                <p className="mt-1.5 text-[11px] text-neutral-400">(beta) sources are bot-walled (Indeed/Naukri) or login-gated (InstaHyre) and may return few or no results.</p>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4" />
                Active (include in the daily run)
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className={`${btn} bg-white`}>Cancel</button>
              <button onClick={saveSearch} className={`${btn} bg-violet-500 text-white`}>Save</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

const inputCls = "w-full rounded-xl border-2 border-neutral-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-500">{label}</label>{children}</div>;
}
function Chips({ opts, sel, onTap }: { opts: { v: string; l: string }[]; sel: string[]; onTap: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => (
        <button key={o.v} type="button" onClick={() => onTap(o.v)}
          className={`rounded-lg border-2 border-neutral-900 px-2.5 py-1 text-xs font-semibold ${sel.includes(o.v) ? "bg-violet-500 text-white" : "bg-white text-neutral-700"}`}>{o.l}</button>
      ))}
    </div>
  );
}
