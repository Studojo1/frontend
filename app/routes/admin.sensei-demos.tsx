import { useEffect, useState } from "react";
import { Header, Footer } from "~/components";
import { authClient } from "~/lib/auth-client";

const ADMIN_EMAILS = ["admin@studojo.com", "jeremy@studojo.com", "jeremyabraham1411@gmail.com"];

interface DemoRequest {
  id: number;
  name: string;
  work_email: string;
  organisation: string;
  phone: string | null;
  cohort_size: string | null;
  note: string | null;
  source: string | null;
  created_at: string;
}

export function meta() {
  return [{ title: "Sensei Demo Requests | Studojo Admin" }];
}

export default function AdminSenseiDemos() {
  const { data: session, isPending } = authClient.useSession();
  const [rows, setRows] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  useEffect(() => {
    if (isPending) return;
    if (!isAdmin) { setLoading(false); return; }
    fetch("/api/admin/sensei-demos")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setRows(d.requests ?? []);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [isPending, isAdmin]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-50 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-['Clash_Display'] text-3xl font-medium text-neutral-900">
            Sensei demo requests
          </h1>
          <p className="mt-2 font-['Satoshi'] text-[15px] text-neutral-600">
            From the /sensei page. Newest first.
          </p>

          {isPending || loading ? (
            <p className="mt-10 font-['Satoshi'] text-neutral-500">Loading...</p>
          ) : !isAdmin ? (
            <p className="mt-10 font-['Satoshi'] text-neutral-700">
              Sign in with an admin account to view this page.
            </p>
          ) : error ? (
            <p className="mt-10 font-['Satoshi'] text-red-600">{error}</p>
          ) : rows.length === 0 ? (
            <p className="mt-10 font-['Satoshi'] text-neutral-500">No requests yet.</p>
          ) : (
            <div className="mt-8 overflow-x-auto rounded-2xl border-2 border-neutral-900 bg-white shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]">
              <table className="w-full min-w-[900px] text-left font-['Satoshi'] text-[14px]">
                <thead className="border-b-2 border-neutral-900 bg-neutral-100">
                  <tr>
                    {["When", "Name", "Organisation", "Work email", "Phone", "Batch", "Notes"].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold text-neutral-900">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-neutral-200 align-top last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 text-neutral-500">{fmt(r.created_at)}</td>
                      <td className="px-4 py-3 font-medium text-neutral-900">{r.name}</td>
                      <td className="px-4 py-3 text-neutral-700">{r.organisation}</td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${r.work_email}`} className="text-violet-600 underline">{r.work_email}</a>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-neutral-700">{r.phone || "-"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-neutral-700">{r.cohort_size || "-"}</td>
                      <td className="max-w-sm px-4 py-3 text-neutral-600">{r.note || "-"}</td>
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
