import { useEffect, useMemo, useState } from "react";
import { Header, Footer } from "~/components";
import { authClient } from "~/lib/auth-client";

const ADMIN_EMAILS = [
  "admin@studojo.com",
  "jeremy@studojo.com",
  "jeremyabraham1411@gmail.com",
  "studojo@gmail.com",
];

interface Registration {
  id: number;
  full_name: string;
  whatsapp: string;
  email: string;
  college: string;
  course: string;
  specialisation: string | null;
  year_of_study: string;
  graduation_year: string | null;
  life_stage: string | null;
  created_at: string;
}

interface Stats {
  total: string;
  last_2_days: string;
  last_4_days: string;
  last_7_days: string;
  last_30_days: string;
}

export function meta() {
  return [{ title: "Webinar Registrations | Studojo Admin" }];
}

const NOT_SPECIFIED = "__none__";

export default function AdminWebinarRegistrations() {
  const { data: session, isPending } = authClient.useSession();
  const [rows, setRows] = useState<Registration[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<string>("");

  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  useEffect(() => {
    if (isPending) return;
    if (!isAdmin) { setLoading(false); return; }

    fetch("/api/admin/webinar-registrations")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); }
        else { setRows(d.registrations ?? []); setStats(d.stats ?? null); }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [isPending, isAdmin]);

  const stages = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => { if (r.life_stage) set.add(r.life_stage); });
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    if (!stageFilter) return rows;
    if (stageFilter === NOT_SPECIFIED) return rows.filter((r) => !r.life_stage);
    return rows.filter((r) => r.life_stage === stageFilter);
  }, [rows, stageFilter]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const dash = (v: string | null) => v ? v : <span className="text-neutral-300">—</span>;

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32 text-neutral-500">Loading…</div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32 text-red-500">Access denied.</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Webinar Registrations</h1>
          <p className="text-sm text-neutral-500 mt-1">Everyone who registered for the webinar.</p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total", value: stats.total },
              { label: "Last 2 days", value: stats.last_2_days },
              { label: "Last 4 days", value: stats.last_4_days },
              { label: "Last 7 days", value: stats.last_7_days },
              { label: "Last 30 days", value: stats.last_30_days },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-neutral-200 bg-white p-5">
                <p className="text-xs text-neutral-500 font-medium">{s.label}</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Stage filter */}
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm font-medium text-neutral-600">Stage:</label>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            <option value="">All stages</option>
            {stages.map((s) => <option key={s} value={s}>{s}</option>)}
            <option value={NOT_SPECIFIED}>Not specified</option>
          </select>
          <span className="text-sm text-neutral-400">{filtered.length} shown</span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-neutral-400 text-sm">
            No registrations{stageFilter ? " for this stage" : ""} yet.
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {["#", "Date", "Name", "Email", "WhatsApp", "College", "Course", "Specialisation", "Year", "Grad Year", "Stage"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{r.id}</td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">{fmt(r.created_at)}</td>
                    <td className="px-4 py-3 text-neutral-900 font-medium">{r.full_name}</td>
                    <td className="px-4 py-3 text-neutral-800">{r.email}</td>
                    <td className="px-4 py-3 text-neutral-800">{r.whatsapp}</td>
                    <td className="px-4 py-3 text-neutral-800">{r.college}</td>
                    <td className="px-4 py-3 text-neutral-800">{r.course}</td>
                    <td className="px-4 py-3 text-neutral-800">{dash(r.specialisation)}</td>
                    <td className="px-4 py-3 text-neutral-800">{r.year_of_study}</td>
                    <td className="px-4 py-3 text-neutral-800">{dash(r.graduation_year)}</td>
                    <td className="px-4 py-3">
                      {r.life_stage ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 border border-violet-200">
                          {r.life_stage}
                        </span>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
