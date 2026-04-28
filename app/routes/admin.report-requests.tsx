import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { authClient } from "~/lib/auth-client";

const ADMIN_EMAILS = ["admin@studojo.com", "jeremy@studojo.com", "jeremyabraham1411@gmail.com"];

interface ReportRequest {
  id: string;
  topic: string;
  email: string | null;
  userId: string | null;
  status: "pending" | "in_progress" | "done";
  createdAt: string;
}

export function meta() {
  return [{ title: "Report Requests | Studojo Admin" }];
}

export default function AdminReportRequests() {
  const { data: session, isPending } = authClient.useSession();
  const [requests, setRequests] = useState<ReportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  useEffect(() => {
    if (isPending) return;
    if (!isAdmin) { setLoading(false); return; }

    fetch("/api/report-requests")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); }
        else { setRequests(d.requests ?? []); }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [isPending, isAdmin]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/report-requests/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: status as ReportRequest["status"] } : r));
    setUpdating(null);
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800 border-amber-300",
      in_progress: "bg-blue-100 text-blue-800 border-blue-300",
      done: "bg-green-100 text-green-800 border-green-300",
    };
    return map[s] ?? "bg-neutral-100 text-neutral-700 border-neutral-300";
  };

  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    done: requests.filter((r) => r.status === "done").length,
  };

  if (isPending || loading) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen items-center justify-center bg-neutral-50">
          <div className="font-['Satoshi'] text-neutral-500">Loading...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 text-center">
          <div className="font-['Clash_Display'] text-3xl font-bold text-neutral-900 mb-4">Access Denied</div>
          <p className="font-['Satoshi'] text-neutral-600 mb-8">You do not have permission to view this page.</p>
          <Link to="/" className="font-['Satoshi'] text-sm font-semibold text-violet-600 underline">Back to home</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-50 px-4 py-10 md:px-8">
        <div className="mx-auto max-w-5xl">

          {/* Page header */}
          <div className="mb-8">
            <div className="mb-2 font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-violet-600">Admin</div>
            <h1 className="font-['Clash_Display'] text-4xl font-bold text-neutral-900">Report Requests</h1>
            <p className="mt-2 font-['Satoshi'] text-neutral-500">Topics students have asked Studojo to research and publish.</p>
          </div>

          {/* Summary stats */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            {[
              { label: "Pending", val: counts.pending, color: "bg-amber-400" },
              { label: "In Progress", val: counts.in_progress, color: "bg-blue-500" },
              { label: "Done", val: counts.done, color: "bg-green-500" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <div className={`mb-2 inline-block h-3 w-3 rounded-full ${s.color}`}></div>
                <div className="font-['Clash_Display'] text-3xl font-bold text-neutral-900">{s.val}</div>
                <div className="font-['Satoshi'] text-sm text-neutral-500">{s.label}</div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 rounded-xl border-2 border-red-400 bg-red-50 p-4 font-['Satoshi'] text-sm text-red-700">{error}</div>
          )}

          {requests.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-white py-20 text-center">
              <div className="font-['Clash_Display'] text-xl font-bold text-neutral-400">No requests yet</div>
              <div className="mt-2 font-['Satoshi'] text-sm text-neutral-400">Report requests from students will appear here.</div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border-2 border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-neutral-900 bg-neutral-50">
                    <th className="px-5 py-3 text-left font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-neutral-500">Topic</th>
                    <th className="px-5 py-3 text-left font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-neutral-500">Email</th>
                    <th className="px-5 py-3 text-left font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-neutral-500">Date</th>
                    <th className="px-5 py-3 text-left font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-neutral-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-50">
                      <td className="max-w-xs px-5 py-4 font-['Satoshi'] text-sm text-neutral-900 leading-snug">{req.topic}</td>
                      <td className="px-5 py-4 font-['Satoshi'] text-sm text-neutral-500">{req.email ?? <span className="italic text-neutral-300">anonymous</span>}</td>
                      <td className="whitespace-nowrap px-5 py-4 font-['Satoshi'] text-sm text-neutral-400">
                        {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={req.status}
                          disabled={updating === req.id}
                          onChange={(e) => updateStatus(req.id, e.target.value)}
                          className={`rounded-full border px-3 py-1 font-['Satoshi'] text-xs font-bold cursor-pointer ${statusBadge(req.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
