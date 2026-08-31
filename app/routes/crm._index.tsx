// The CRM the extension has been linking to.
//
// api.extension.apply.tsx has returned `crmUrl: "/crm"` since the extension
// shipped, and until now that link 404ed. This is the page it meant.
import { useEffect, useState } from "react";
import { Link, redirect } from "react-router";
import { Footer, Header } from "~/components";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/crm._index";

const CAREER_AGENT_URL =
  process.env.CAREER_AGENT_URL ?? "http://studojo-career-agent.studojo.svc.cluster.local:8000";

interface Application {
  id: string;
  company_name: string;
  role: string;
  date_applied: string | null;
  platform: string | null;
  source: string | null;
  location: string | null;
  contact_name: string | null;
  contact_title: string | null;
  status: string | null;
}

interface DraftRow {
  id: string;
  applicationId: string | null;
  status: string;
  subject: string | null;
  contactName: string | null;
}

export function meta() {
  return [{ title: "My CRM · Studojo" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  // Send them back here after signing in, not to a generic dashboard — they
  // clicked through from a specific job.
  if (!session) throw redirect(`/auth?redirect=${encodeURIComponent("/crm")}`);

  // Read server-side using the SESSION's id. The career agent's own auth is
  // soft-enforced, so a client-supplied id here would be an open door.
  let applications: Application[] = [];
  try {
    const res = await fetch(
      `${CAREER_AGENT_URL}/jobs/${encodeURIComponent(session.user.id)}`,
      { signal: AbortSignal.timeout(6000) },
    );
    if (res.ok) applications = ((await res.json())?.jobs ?? []) as Application[];
  } catch (e) {
    console.error("[crm] could not load applications:", e);
  }

  return { applications };
}

export default function Crm({ loaderData }: Route.ComponentProps) {
  const { applications } = loaderData as { applications: Application[] };
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>({});

  useEffect(() => {
    fetch("/api/crm/drafts")
      .then((r) => r.json())
      .then((d) => {
        const byApplication: Record<string, DraftRow> = {};
        for (const row of (d?.drafts ?? []) as DraftRow[]) {
          if (row.applicationId) byApplication[row.applicationId] = row;
        }
        setDrafts(byApplication);
      })
      .catch(() => {});
  }, []);

  const fromExtension = applications.filter((a) => a.source === "browser_extension").length;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="mb-2 font-['Clash_Display'] text-4xl font-bold text-studojo-ink">
              My CRM
            </h1>
            <p className="font-['Satoshi'] text-studojo-muted">
              {applications.length === 0
                ? "Jobs you save from the extension will appear here."
                : `${applications.length} saved${
                    fromExtension ? ` · ${fromExtension} from the extension` : ""
                  }`}
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-2xl border-2 border-studojo-ink/15 bg-studojo-surface-muted p-10 text-center">
              <p className="font-['Satoshi'] text-studojo-ink">Nothing saved yet.</p>
              <p className="mt-2 font-['Satoshi'] text-sm text-studojo-muted">
                Open a job on LinkedIn with the Studojo extension installed and click
                Apply through Studojo.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {applications.map((a) => {
                const draft = drafts[a.id];
                return (
                  <li key={a.id}>
                    <Link
                      to={`/crm/${a.id}`}
                      className="block rounded-2xl border-2 border-studojo-ink bg-white p-5 shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    >
                      <div className="flex flex-wrap items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <h2 className="font-['Satoshi'] text-lg font-semibold text-studojo-ink">
                            {a.role}
                          </h2>
                          <p className="font-['Satoshi'] text-sm text-studojo-muted">
                            {[a.company_name, a.location].filter(Boolean).join(" · ")}
                          </p>
                          {a.contact_name ? (
                            <p className="mt-1 font-['Satoshi'] text-sm text-studojo-ink">
                              Contact: {a.contact_name}
                              {a.contact_title ? ` — ${a.contact_title}` : ""}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {a.source === "browser_extension" ? (
                            <span className="rounded-full bg-studojo-purple-bg px-3 py-1 font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-studojo-purple">
                              via extension
                            </span>
                          ) : null}
                          <DraftBadge status={draft?.status} />
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** The status a student most needs to see is "this has not gone out yet". */
function DraftBadge({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<string, { label: string; cls: string }> = {
    draft: {
      label: "Not sent yet",
      cls: "bg-amber-50 text-amber-800 border-amber-200",
    },
    sending: { label: "Sending…", cls: "bg-blue-50 text-blue-800 border-blue-200" },
    sent: { label: "Sent", cls: "bg-studojo-green-bg text-studojo-green border-studojo-green/30" },
    failed: { label: "Failed", cls: "bg-red-50 text-red-800 border-red-200" },
  };
  const s = map[status] ?? map.draft;
  return (
    <span className={`rounded-full border px-3 py-1 font-['Satoshi'] text-xs ${s.cls}`}>
      {s.label}
    </span>
  );
}
