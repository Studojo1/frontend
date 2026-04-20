import { useEffect, useState } from "react";
import { Link, redirect } from "react-router";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiArrowRight,
  FiTrash2,
  FiExternalLink,
  FiClipboard,
  FiCheckCircle,
  FiClock,
  FiZap,
  FiEdit3,
} from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { authClient } from "~/lib/auth-client";
import { rsbFetch } from "~/lib/rsb/api";
import { outreachFetch } from "~/lib/outreach/api";
import { toast } from "sonner";
import { getSessionFromRequest, requireOnboardingComplete } from "~/lib/onboarding.server";
import type { Route } from "./+types/profile";
import type { RsbSession } from "~/lib/rsb/types";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth");
  const onboardingStatus = await requireOnboardingComplete(session.user.id);
  if (!onboardingStatus.complete) throw redirect("/onboarding");
  return null;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Profile – Studojo" },
    { name: "description", content: "Your Studojo profile — resumes, applications, and outreach orders." },
  ];
}

type UserProfile = {
  fullName: string | null;
  college: string | null;
  yearOfStudy: string | null;
  course: string | null;
};

type ClassicResume = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type OutreachOrder = {
  id: number;
  status: string;
  leads_collected: number | null;
  leads_target: number | null;
  created_at: string | null;
};

type Application = {
  id: string;
  status: string;
  createdAt: string;
  internshipTitle: string;
  internshipCompany: string;
};

const APP_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-300" },
  shortlisted: { label: "Shortlisted", color: "bg-violet-50 text-violet-700 border-violet-300" },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-600 border-red-300" },
  forwarded: { label: "Forwarded", color: "bg-blue-50 text-blue-700 border-blue-300" },
  accepted: { label: "Accepted", color: "bg-emerald-50 text-emerald-700 border-emerald-300" },
  interview_scheduled: { label: "Interview", color: "bg-violet-50 text-violet-700 border-violet-300" },
  more_info_requested: { label: "Info Requested", color: "bg-amber-50 text-amber-700 border-amber-300" },
};

const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  created: { label: "Created", color: "bg-neutral-100 text-neutral-600 border-neutral-300" },
  leads_generating: { label: "Discovering Leads", color: "bg-amber-50 text-amber-700 border-amber-300" },
  leads_ready: { label: "Leads Ready", color: "bg-violet-50 text-violet-700 border-violet-300" },
  enriching: { label: "Enriching", color: "bg-amber-50 text-amber-700 border-amber-300" },
  enrichment_complete: { label: "Enrichment Done", color: "bg-violet-50 text-violet-700 border-violet-300" },
  campaign_setup: { label: "Campaign Setup", color: "bg-violet-50 text-violet-700 border-violet-300" },
  email_connected: { label: "Email Connected", color: "bg-violet-50 text-violet-700 border-violet-300" },
  campaign_running: { label: "Campaign Running", color: "bg-emerald-50 text-emerald-700 border-emerald-300" },
  completed: { label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-300" },
};

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border font-['Satoshi'] ${color}`}>
      {label}
    </span>
  );
}

function AtsScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
      : score >= 60
      ? "bg-violet-50 text-violet-700 border-violet-300"
      : score >= 40
      ? "bg-amber-50 text-amber-700 border-amber-300"
      : "bg-neutral-100 text-neutral-500 border-neutral-300";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border font-['Satoshi'] ${color}`}>
      ATS {score}
    </span>
  );
}

function SectionHeader({ title, cta }: { title: string; cta?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-['Clash_Display'] text-xl font-semibold text-neutral-900">{title}</h2>
      {cta}
    </div>
  );
}

function EmptyState({ icon, title, desc, cta }: { icon: React.ReactNode; title: string; desc: string; cta?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-neutral-200 py-10 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        {icon}
      </div>
      <div>
        <p className="font-['Satoshi'] text-sm font-semibold text-neutral-700">{title}</p>
        <p className="mt-0.5 font-['Satoshi'] text-xs text-neutral-500">{desc}</p>
      </div>
      {cta}
    </div>
  );
}

export default function Profile() {
  const { data: authSession, isPending: authPending } = authClient.useSession();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rsbSessions, setRsbSessions] = useState<RsbSession[] | null>(null);
  const [classicResumes, setClassicResumes] = useState<ClassicResume[] | null>(null);
  const [outreachOrders, setOutreachOrders] = useState<OutreachOrder[] | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const user = authSession?.user;

  useEffect(() => {
    if (!user) return;

    // User profile
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile))
      .catch(() => setProfile(null));

    // RSB sessions
    rsbFetch<{ sessions: RsbSession[] }>("/sessions")
      .then((d) => setRsbSessions(d.sessions))
      .catch(() => setRsbSessions([]));

    // Classic resumes (v2 + v1)
    Promise.all([
      fetch("/api/v2/resumes").then((r) => (r.ok ? r.json() : { drafts: [] })),
      fetch("/api/resumes").then((r) => (r.ok ? r.json() : { resumes: [] })),
    ])
      .then(([v2, v1]) => {
        const v2Items: ClassicResume[] = (v2.drafts || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        }));
        const v1Items: ClassicResume[] = (v1.resumes || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }));
        const all = [...v2Items, ...v1Items].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        setClassicResumes(all);
      })
      .catch(() => setClassicResumes([]));

    // Outreach orders
    outreachFetch<{ orders: Array<{ order?: OutreachOrder } & OutreachOrder> }>("/orders/list")
      .then((d) => {
        const orders = (d.orders || []).map((o: any) => o.order || o) as OutreachOrder[];
        setOutreachOrders(orders.slice(0, 5));
      })
      .catch(() => setOutreachOrders([]));

    // Internship applications
    fetch("/api/user/applications")
      .then((r) => (r.ok ? r.json() : { applications: [] }))
      .then((d) => setApplications(d.applications))
      .catch(() => setApplications([]));
  }, [user]);

  const handleDeleteClassic = async (id: string) => {
    setDeletingId(id);
    try {
      let res = await fetch(`/api/v2/resumes/${id}`, { method: "DELETE" });
      if (res.status === 404 || res.status === 400) {
        res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      }
      if (!res.ok) throw new Error("Delete failed");
      setClassicResumes((prev) => prev?.filter((r) => r.id !== id) ?? null);
      toast.success("Resume deleted");
    } catch {
      toast.error("Failed to delete resume");
    } finally {
      setDeletingId(null);
    }
  };

  const initials = (user?.name || user?.email || "?")
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  const displayName = profile?.fullName || user?.name || user?.email || "";

  if (authPending) {
    return (
      <>
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center font-['Satoshi'] text-neutral-500">
          Loading…
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-10 md:px-8 md:py-14">

          {/* ── Hero ── */}
          <div className="mb-10 flex flex-col gap-6 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:flex-row md:items-center md:p-8">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-violet-500 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
              <span className="font-['Clash_Display'] text-2xl font-bold text-white">{initials}</span>
            </div>
            <div className="flex-1">
              <h1 className="font-['Clash_Display'] text-2xl font-semibold text-neutral-900 md:text-3xl">
                {displayName}
              </h1>
              <p className="mt-0.5 font-['Satoshi'] text-sm text-neutral-500">{user?.email}</p>
              {(profile?.college || profile?.yearOfStudy) && (
                <p className="mt-1 font-['Satoshi'] text-sm text-neutral-600">
                  {[profile.college, profile.course, profile.yearOfStudy].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <Link
              to="/settings"
              className="flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-white px-4 py-2 font-['Satoshi'] text-sm font-semibold text-neutral-700 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            >
              <FiEdit3 className="h-4 w-4" />
              Edit profile
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">

            {/* ── AI Resume Drafts ── */}
            <section>
              <SectionHeader
                title="AI Resume Drafts"
                cta={
                  <Link
                    to="/rsb"
                    className="flex items-center gap-1.5 rounded-xl bg-violet-500 px-4 py-2 font-['Satoshi'] text-sm font-bold text-neutral-900 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  >
                    Build new <FiArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
              {rsbSessions === null ? (
                <Skeleton rows={2} />
              ) : rsbSessions.length === 0 ? (
                <EmptyState
                  icon={<FiFileText className="h-6 w-6" />}
                  title="No resume drafts yet"
                  desc="Start a chat-based session and build your ATS-ready resume in 10 minutes."
                  cta={
                    <Link to="/rsb" className="flex items-center gap-1.5 rounded-xl bg-violet-500 px-4 py-2 font-['Satoshi'] text-sm font-bold text-neutral-900 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                      Start building <FiArrowRight className="h-4 w-4" />
                    </Link>
                  }
                />
              ) : (
                <ul className="space-y-3">
                  {rsbSessions.map((s) => (
                    <li key={s.id}>
                      <Link
                        to={`/rsb/session/${s.id}`}
                        className="flex items-center justify-between gap-4 rounded-2xl border-2 border-neutral-900 bg-white p-4 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                      >
                        <div className="min-w-0">
                          <p className="font-['Satoshi'] text-sm font-bold text-neutral-900 truncate">{s.target_role}</p>
                          <p className="mt-0.5 font-['Satoshi'] text-xs text-neutral-500">
                            {[s.target_industry, s.experience_band].filter(Boolean).join(" · ")}
                            {s.updated_at ? ` · ${new Date(s.updated_at).toLocaleDateString()}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <AtsScoreBadge score={s.ats?.score ?? 0} />
                          <FiArrowRight className="h-4 w-4 text-neutral-400" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* ── Internship Applications ── */}
            <section>
              <SectionHeader
                title="Internship Applications"
                cta={
                  <Link to="/dojos/internships" className="font-['Satoshi'] text-sm font-semibold text-violet-600 hover:underline flex items-center gap-1">
                    Browse <FiExternalLink className="h-3.5 w-3.5" />
                  </Link>
                }
              />
              {applications === null ? (
                <Skeleton rows={2} />
              ) : applications.length === 0 ? (
                <EmptyState
                  icon={<FiClipboard className="h-6 w-6" />}
                  title="No applications yet"
                  desc="Apply to internships from the Internship Dojo and they'll appear here."
                />
              ) : (
                <ul className="space-y-3">
                  {applications.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-4 rounded-2xl border-2 border-neutral-200 bg-white p-4">
                      <div className="min-w-0">
                        <p className="font-['Satoshi'] text-sm font-bold text-neutral-900 truncate">{a.internshipTitle}</p>
                        <p className="mt-0.5 font-['Satoshi'] text-xs text-neutral-500">
                          {a.internshipCompany} · {new Date(a.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge
                        label={APP_STATUS[a.status]?.label ?? a.status}
                        color={APP_STATUS[a.status]?.color ?? "bg-neutral-100 text-neutral-600 border-neutral-300"}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* ── Outreach Orders ── */}
            <section>
              <SectionHeader
                title="Outreach Orders"
                cta={
                  <Link to="/outreach" className="font-['Satoshi'] text-sm font-semibold text-violet-600 hover:underline flex items-center gap-1">
                    View all <FiExternalLink className="h-3.5 w-3.5" />
                  </Link>
                }
              />
              {outreachOrders === null ? (
                <Skeleton rows={2} />
              ) : outreachOrders.length === 0 ? (
                <EmptyState
                  icon={<FiZap className="h-6 w-6" />}
                  title="No outreach orders yet"
                  desc="Start an outreach campaign to auto-discover and contact leads."
                  cta={
                    <Link to="/outreach" className="font-['Satoshi'] text-sm font-semibold text-violet-600 hover:underline">
                      Start Outreach →
                    </Link>
                  }
                />
              ) : (
                <ul className="space-y-3">
                  {outreachOrders.map((o) => {
                    const cfg = ORDER_STATUS[o.status] ?? { label: o.status, color: "bg-neutral-100 text-neutral-600 border-neutral-300" };
                    const Icon =
                      o.status === "completed"
                        ? FiCheckCircle
                        : o.status === "campaign_running"
                        ? FiZap
                        : ["leads_generating", "enriching"].includes(o.status)
                        ? FiClock
                        : FiClipboard;
                    return (
                      <li key={o.id} className="flex items-center justify-between gap-4 rounded-2xl border-2 border-neutral-200 bg-white p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className="h-5 w-5 flex-shrink-0 text-neutral-500" />
                          <div className="min-w-0">
                            <p className="font-['Satoshi'] text-sm font-bold text-neutral-900">Order #{o.id}</p>
                            <p className="mt-0.5 font-['Satoshi'] text-xs text-neutral-500">
                              {o.leads_collected != null ? `${o.leads_collected}/${o.leads_target ?? "?"} leads` : ""}
                              {o.created_at ? ` · ${new Date(o.created_at).toLocaleDateString()}` : ""}
                            </p>
                          </div>
                        </div>
                        <StatusBadge label={cfg.label} color={cfg.color} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* ── Classic Resumes ── */}
            <section>
              <SectionHeader
                title="Classic Resumes"
                cta={
                  <span className="font-['Satoshi'] text-xs text-neutral-400 italic">Read-only · use AI builder for new ones</span>
                }
              />
              {classicResumes === null ? (
                <Skeleton rows={2} />
              ) : classicResumes.length === 0 ? (
                <EmptyState
                  icon={<FiFileText className="h-6 w-6" />}
                  title="No classic resumes"
                  desc="All new resumes are built with the AI Resume Builder."
                />
              ) : (
                <ul className="space-y-3">
                  {classicResumes.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-4 rounded-2xl border-2 border-neutral-200 bg-white p-4">
                      <div className="min-w-0">
                        <p className="font-['Satoshi'] text-sm font-bold text-neutral-900 truncate">{r.name}</p>
                        <p className="mt-0.5 font-['Satoshi'] text-xs text-neutral-500">
                          {new Date(r.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          to={`/resumes/${r.id}/edit`}
                          className="flex items-center justify-center rounded-lg border-2 border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50"
                          title="View resume"
                        >
                          <FiExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteClassic(r.id)}
                          disabled={deletingId === r.id}
                          className="flex items-center justify-center rounded-lg border-2 border-red-200 p-2 text-red-500 hover:bg-red-50 disabled:opacity-40"
                          title="Delete resume"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

          </div>
        </div>
      </motion.main>
      <Footer />
    </>
  );
}

function Skeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl border-2 border-neutral-100 bg-neutral-50" />
      ))}
    </div>
  );
}
