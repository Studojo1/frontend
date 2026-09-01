// The CRM the extension has been linking to.
//
// api.extension.apply.tsx has returned `crmUrl: "/crm"` since the extension
// shipped, and until now that link 404ed. This is the page it meant.
import { useEffect, useState } from "react";
import { Link, redirect } from "react-router";
import { Footer, Header } from "~/components";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { desc, eq } from "drizzle-orm";
import db from "~/lib/db";
import { extensionDrafts } from "../../auth-schema";
import type { Route } from "./+types/crm._index";

const CAREER_AGENT_URL =
  // Bare service name, resolving in whatever namespace we are deployed to.
  // The previous value pinned `.studojo.svc`, so from the staging namespace it
  // pointed at the wrong cluster address — every CRM write failed silently and
  // the page showed "Nothing saved yet" while the extension said "Saved".
  // The service is `cc-backend` on port 80 in the staging namespace — see
  // studojo-career-agent/backend/k8s/service.yaml. The previous default,
  // "studojo-career-agent:8000", is a name that has never existed anywhere;
  // I invented it. Every CRM write silently failed against it, which is why
  // the extension kept saying "we couldn't reach your CRM".
  process.env.CAREER_AGENT_URL ?? "http://cc-backend";

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
  let agentReachable = true;
  try {
    const res = await fetch(
      `${CAREER_AGENT_URL}/jobs/${encodeURIComponent(session.user.id)}`,
      { signal: AbortSignal.timeout(6000) },
    );
    if (res.ok) applications = ((await res.json())?.jobs ?? []) as Application[];
    else agentReachable = false;
  } catch (e) {
    console.error("[crm] could not load applications:", e);
    agentReachable = false;
  }

  // Drafts live in OUR database, so they survive the career agent being
  // unreachable. Reading them here means a student still sees their emails
  // instead of a page that says "Nothing saved yet" while a draft exists.
  //
  // WRAPPED. An unguarded query here took the whole page down with "Oops! An
  // unexpected error occurred" — if extension_drafts is missing or the pool is
  // unreachable, a student should still see their applications rather than a
  // dead end. A page that degrades beats a page that dies.
  let drafts: (typeof extensionDrafts.$inferSelect)[] = [];
  let draftsReadable = true;
  try {
    drafts = await db
      .select()
      .from(extensionDrafts)
      .where(eq(extensionDrafts.userId, session.user.id))
      .orderBy(desc(extensionDrafts.createdAt))
      .limit(100);
  } catch (e) {
    console.error("[crm] could not load drafts:", e);
    draftsReadable = false;
  }

  return { applications, drafts, agentReachable, draftsReadable };
}

export default function Crm({ loaderData }: Route.ComponentProps) {
  const { applications, drafts: draftRows, agentReachable, draftsReadable } =
    loaderData as {
      applications: Application[];
      drafts: any[];
      agentReachable: boolean;
      draftsReadable: boolean;
    };

  const drafts: Record<string, DraftRow> = {};
  for (const row of draftRows ?? []) {
    if (row.applicationId) drafts[row.applicationId] = row;
  }

  // Show a draft even when the career agent did not return its application.
  // Previously the page rendered ONLY agent rows, so an unreachable agent
  // meant "Nothing saved yet" while a perfectly good draft sat in our
  // database — which is exactly the contradiction that was reported.
  const seen = new Set(applications.map((a) => a.id));
  const orphanRows: Application[] = (draftRows ?? [])
    .filter((d) => !d.applicationId || !seen.has(d.applicationId))
    .map((d) => ({
      id: d.applicationId ?? d.id,
      company_name: d.company ?? "",
      role: d.role ?? "",
      date_applied: null,
      platform: null,
      source: "browser_extension",
      location: null,
      contact_name: d.contactName ?? null,
      contact_title: d.contactTitle ?? null,
      status: null,
    }));
  const rows = [...applications, ...orphanRows];
  const fromExtension = rows.filter((a) => a.source === "browser_extension").length;

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
              {rows.length === 0
                ? "Jobs you save from the extension will appear here."
                : `${rows.length} saved${
                    fromExtension ? ` · ${fromExtension} from the extension` : ""
                  }`}
            </p>
          </div>

          {!draftsReadable ? (
            <div className="mb-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
              <p className="font-['Satoshi'] text-sm text-amber-900">
                Your drafts couldn&rsquo;t be loaded just now. Nothing is lost
                &mdash; refresh in a moment.
              </p>
            </div>
          ) : null}

          {!agentReachable && rows.length > 0 ? (
            <div className="mb-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
              <p className="font-['Satoshi'] text-sm text-amber-900">
                Some details couldn&rsquo;t be loaded just now. Your drafts are
                here and safe &mdash; job details may fill in shortly.
              </p>
            </div>
          ) : null}

          {rows.length === 0 ? (
            <div className="rounded-2xl border-2 border-studojo-ink/15 bg-studojo-surface-muted p-10 text-center">
              <p className="font-['Satoshi'] text-studojo-ink">Nothing saved yet.</p>
              <p className="mt-2 font-['Satoshi'] text-sm text-studojo-muted">
                Open a job on LinkedIn with the Studojo extension installed and click
                Apply through Studojo.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {rows.map((a) => {
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
