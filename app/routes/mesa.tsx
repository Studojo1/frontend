import { useEffect, useState, useCallback } from "react";
import { redirect } from "react-router";
import { Header, Footer } from "~/components";
import {
  FiPlus, FiPlay, FiDownload, FiTrash2, FiEdit2, FiSearch,
  FiMapPin, FiClock, FiExternalLink, FiRefreshCw, FiX,
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
    { title: "Mesa — LinkedIn Job Tracker | Studojo" },
    { name: "description", content: "Daily LinkedIn job scraping for the roles and keywords you care about." },
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
  linkedin: "bg-[#0a66c2] text-white", linkedin_posts: "bg-[#004182] text-white", themuse: "bg-violet-500 text-white",
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
};

const card = "rounded-2xl border-2 border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]";
const btn = "inline-flex items-center gap-2 rounded-xl border-2 border-neutral-900 px-3.5 py-2 text-sm font-semibold shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50";
const blankForm = (): Omit<Search, "id" | "last_run_at" | "job_count"> => ({
  name: "", keywords: "", location: "", date_posted: "24h",
  workplace_types: [], experience_levels: [], sources: ["linkedin", "themuse", "remotive"], is_active: true,
});
const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
const fmtDate = (s: string | null) => (s ? new Date(s).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "never");

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

  useEffect(() => { loadSearches(); }, [loadSearches]);
  useEffect(() => { if (selected) loadJobs(selected); }, [selected, loadJobs]);

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
      await outreachFetch(`/mesa/searches/${id}/run`, { method: "POST", maxRetries: 0 });
    } catch (e: any) { setError(e?.message || "Failed to start run"); setRunning(false); return; }
    setError("Scraping in the background — a deep run takes 1-3 minutes. Results refresh automatically.");
    // Poll for completion via last_run_at changing (DB-backed, works across replicas).
    let tries = 0;
    const poll = async () => {
      tries++;
      try {
        const d = await outreachFetch<{ searches: Search[] }>("/mesa/searches");
        setSearches(d.searches);
        const now = d.searches.find((s) => s.id === id)?.last_run_at || null;
        if (now && now !== before) { await loadJobs(id); setRunning(false); setError("Done — results updated."); return; }
      } catch {}
      if (tries >= 30) { setRunning(false); setError("Still scraping — it'll finish shortly; refresh to see new jobs."); return; }
      setTimeout(poll, 10_000);
    };
    setTimeout(poll, 10_000);
  };

  const exportCsv = async (s: Search) => {
    try {
      const data = await outreachFetch<{ jobs: Job[] }>(`/mesa/searches/${s.id}/jobs?limit=1000&sort=scraped`);
      const rows = [["Title", "Company", "Location", "Posted", "Source", "URL"]];
      data.jobs.forEach((j) => rows.push([j.title, j.company, j.location, j.posted_date || "", srcLabel(j.source), j.url]));
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
              Mesa <span className="text-violet-500">·</span> LinkedIn Job Tracker
            </h1>
            <p className="text-sm text-neutral-600 mt-1">Saved searches scrape LinkedIn daily for your roles and keywords. No login to LinkedIn needed.</p>
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
                      <p className="text-xs text-neutral-500">{jobsTotal} jobs tracked · last run {fmtDate(current.last_run_at)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
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
                      <button onClick={() => runNow(current.id)} disabled={running} className={`${btn} bg-violet-500 text-white`}>{running ? <FiRefreshCw className="animate-spin" /> : <FiPlay />} Run now</button>
                      <button onClick={() => exportCsv(current)} className={`${btn} bg-white`}><FiDownload /> CSV</button>
                    </div>
                  </div>

                  {jobsLoading ? (
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
                              <td className="px-4 py-2.5 border-b border-neutral-100">
                                <a href={j.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-violet-600 hover:underline"><FiExternalLink size={14} /> Open</a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
