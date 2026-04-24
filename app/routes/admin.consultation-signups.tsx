import { useEffect, useState } from "react";
import { Header, Footer } from "~/components";
import { authClient } from "~/lib/auth-client";

const ADMIN_EMAILS = ["admin@studojo.com", "jeremy@studojo.com", "jeremyabraham1411@gmail.com"];

interface Signup {
  id: number;
  user_id: string | null;
  email: string | null;
  target_role: string;
  biggest_challenge: string;
  timeline: string;
  created_at: string;
}

interface Stats {
  total: string;
  last_7_days: string;
  last_30_days: string;
}

export function meta() {
  return [{ title: "Free Call Signups — Studojo Admin" }];
}

export default function AdminConsultationSignups() {
  const { data: session, isPending } = authClient.useSession();
  const [signups, setSignups] = useState<Signup[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  useEffect(() => {
    if (isPending) return;
    if (!isAdmin) { setLoading(false); return; }

    fetch("/api/admin/consultation-signups")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); }
        else { setSignups(d.signups ?? []); setStats(d.stats ?? null); }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [isPending, isAdmin]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

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
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Free Call Signups</h1>
          <p className="text-sm text-neutral-500 mt-1">Students who requested a free 1:1 internship strategy call.</p>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total", value: stats.total },
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

        {signups.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-neutral-400 text-sm">
            No signups yet.
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {["#", "Date", "Email", "Target Role", "Biggest Challenge", "Timeline"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {signups.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{s.id}</td>
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap text-xs">{fmt(s.created_at)}</td>
                    <td className="px-4 py-3 text-neutral-800">{s.email ?? <span className="text-neutral-400 italic">not signed in</span>}</td>
                    <td className="px-4 py-3 text-neutral-800">{s.target_role}</td>
                    <td className="px-4 py-3 text-neutral-800">{s.biggest_challenge}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 border border-violet-200">
                        {s.timeline}
                      </span>
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
