import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import { Header } from "~/components/common/header";
import { rsbFetch } from "~/lib/rsb/api";
import type { RsbSession } from "~/lib/rsb/types";

type ListResp = { sessions: RsbSession[] };

export default function RsbDrafts() {
  const navigate = useNavigate();
  const { data: auth, isPending } = authClient.useSession();
  const [list, setList] = useState<RsbSession[] | null>(null);

  useEffect(() => {
    if (!isPending && !auth?.user) navigate("/auth?mode=signin&redirect=/rsb/drafts");
  }, [isPending, auth?.user, navigate]);

  useEffect(() => {
    if (!auth?.user) return;
    rsbFetch<ListResp>("/sessions").then((r) => setList(r.sessions)).catch(() => setList([]));
  }, [auth?.user]);

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-10 font-['Satoshi']">
        <h1 className="text-3xl font-bold text-neutral-900 mb-1 font-['Clash_Display']">Your resume drafts</h1>
        <p className="text-neutral-700 mb-6">Pick up where you left off, or start a fresh one.</p>

        <Link
          to="/rsb"
          className="inline-block mb-6 px-5 py-3 bg-violet-500 text-neutral-900 font-bold border-2 border-neutral-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all"
        >
          + New resume
        </Link>

        {list === null && <div className="text-neutral-500">Loading...</div>}
        {list && list.length === 0 && (
          <div className="border-2 border-dashed border-neutral-900 rounded-2xl p-8 text-center text-neutral-600">
            No drafts yet. Start your first one above.
          </div>
        )}
        {list && list.length > 0 && (
          <ul className="space-y-3">
            {list.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/rsb/session/${s.id}`}
                  className="block bg-white border-2 border-neutral-900 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-neutral-900">{s.target_role}</div>
                      <div className="text-xs text-neutral-600">
                        {s.target_industry || "-"} · {s.experience_band || "-"} ·{" "}
                        {s.updated_at ? new Date(s.updated_at).toLocaleDateString() : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-neutral-500">ATS</div>
                      <div className="text-lg font-bold text-neutral-900">{s.ats?.score ?? 0}</div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
