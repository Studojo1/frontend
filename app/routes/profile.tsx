import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import { Header } from "~/components/common/header";
import { rsbFetch } from "~/lib/rsb/api";
import { outreachFetch } from "~/lib/outreach/api";
import { getJobs } from "~/lib/control-plane";
import type { RsbSession } from "~/lib/rsb/types";

type UserProfile = {
  fullName: string | null;
  college: string | null;
  yearOfStudy: string | null;
  course: string | null;
};

type ClassicResume = { id: string; name: string; updatedAt: string };

type Application = {
  id: string;
  status: string;
  appliedAt: string;
  internship: { title: string; companyName: string };
};

type OutreachOrder = { id: number; status: string; created_at?: string };

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  shortlisted: "bg-violet-100 text-violet-800 border-violet-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  interview_scheduled: "bg-emerald-100 text-emerald-800 border-emerald-300",
  forwarded: "bg-blue-100 text-blue-800 border-blue-300",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-300",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
  campaign_running: "bg-violet-100 text-violet-800 border-violet-300",
  leads_generating: "bg-amber-100 text-amber-800 border-amber-300",
  created: "bg-neutral-100 text-neutral-700 border-neutral-300",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? "bg-neutral-100 text-neutral-700 border-neutral-300";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls} font-['Satoshi']`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function Section({ title, cta, ctaHref, children }: { title: string; cta?: string; ctaHref?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border-2 border-neutral-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] overflow-hidden mb-6">
      <div className="flex items-center justify-between px-5 py-3 border-b-2 border-neutral-900 bg-neutral-50">
        <h2 className="font-['Clash_Display'] text-base font-bold text-neutral-900">{title}</h2>
        {cta && ctaHref && (
          <Link to={ctaHref} className="text-xs font-bold text-violet-600 hover:text-violet-800 font-['Satoshi']">
            {cta}
          </Link>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Skeleton() {
  return <div className="h-4 bg-neutral-100 rounded animate-pulse w-3/4 mb-2" />;
}

export default function ProfilePage() {
  const { data: auth, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rsbSessions, setRsbSessions] = useState<RsbSession[] | null>(null);
  const [classicResumes, setClassicResumes] = useState<ClassicResume[] | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [outreachOrders, setOutreachOrders] = useState<OutreachOrder[] | null>(null);
  const [jobs, setJobs] = useState<any[] | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isPending && !auth?.user) navigate("/auth?mode=signin&redirect=/profile");
  }, [mounted, isPending, auth?.user, navigate]);

  useEffect(() => {
    if (!auth?.user) return;

    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile ?? null))
      .catch(() => setProfile(null));

    rsbFetch<{ sessions: RsbSession[] }>("/sessions")
      .then((d) => setRsbSessions(Array.isArray(d?.sessions) ? d.sessions : []))
      .catch(() => setRsbSessions([]));

    Promise.all([
      fetch("/api/v2/resumes").then((r) => r.json()).catch(() => ({ drafts: [] })),
      fetch("/api/resumes").then((r) => r.json()).catch(() => []),
    ]).then(([v2, v1]) => {
      const v2list = Array.isArray(v2?.drafts) ? v2.drafts.map((d: any) => ({ id: d.id, name: d.name, updatedAt: d.updatedAt ?? d.createdAt })) : [];
      const v1list = Array.isArray(v1) ? v1.map((r: any) => ({ id: r.id, name: r.name, updatedAt: r.updatedAt ?? r.createdAt })) : [];
      setClassicResumes([...v2list, ...v1list]);
    }).catch(() => setClassicResumes([]));

    fetch("/api/user/applications")
      .then((r) => r.json())
      .then((d) => setApplications(Array.isArray(d?.applications) ? d.applications : []))
      .catch(() => setApplications([]));

    outreachFetch<{ orders?: OutreachOrder[] }>("/orders/list")
      .then((d) => setOutreachOrders(Array.isArray(d?.orders) ? d.orders : []))
      .catch(() => setOutreachOrders([]));

    getJobs(undefined, 10)
      .then((j) => setJobs(Array.isArray(j) ? j : []))
      .catch(() => setJobs([]));
  }, [auth?.user]);

  if (!mounted || isPending || !auth?.user) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center text-neutral-500 font-['Satoshi']">Loading...</div>
      </>
    );
  }

  const user = auth.user;
  const initials = (profile?.fullName ?? user.name ?? user.email ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const displayName = profile?.fullName ?? user.name ?? user.email;

  return (
    <>
      <Header />
      <div className="bg-gradient-to-br from-violet-50 via-white to-amber-50 min-h-[calc(100vh-80px)] px-4 md:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Hero card */}
          <div className="bg-white border-2 border-neutral-900 rounded-2xl shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] p-6 mb-8 flex items-start gap-5">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-violet-500 border-2 border-neutral-900 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
              <span className="font-['Clash_Display'] text-xl font-bold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-['Clash_Display'] text-2xl font-bold text-neutral-900 truncate">{displayName}</h1>
              <p className="font-['Satoshi'] text-sm text-neutral-600 mt-0.5">{user.email}</p>
              {(profile?.college || profile?.yearOfStudy) && (
                <p className="font-['Satoshi'] text-sm text-neutral-500 mt-1">
                  {[profile.college, profile.yearOfStudy, profile.course].filter(Boolean).join(" · ")}
                </p>
              )}
              <Link to="/settings" className="inline-block mt-3 text-xs font-bold text-violet-600 hover:text-violet-800 font-['Satoshi']">
                Edit profile →
              </Link>
            </div>
          </div>

          {/* AI Resume Drafts */}
          <Section title="AI Resume Drafts" cta="Build new resume →" ctaHref="/rsb">
            {rsbSessions === null ? (
              <><Skeleton /><Skeleton /></>
            ) : rsbSessions.length === 0 ? (
              <div className="text-center py-6">
                <p className="font-['Satoshi'] text-sm text-neutral-500 mb-3">No AI drafts yet.</p>
                <Link to="/rsb" className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-500 text-white font-bold text-sm border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all font-['Satoshi']">
                  Build your first resume
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {rsbSessions.map((s) => {
                  const score = s.ats?.score ?? 0;
                  const scoreColor = score >= 80 ? "bg-emerald-100 text-emerald-800 border-emerald-300" : score >= 60 ? "bg-violet-100 text-violet-800 border-violet-300" : score >= 40 ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-neutral-100 text-neutral-700 border-neutral-300";
                  return (
                    <Link
                      key={s.id}
                      to={`/rsb/session/${s.id}`}
                      className="flex items-center justify-between p-3 rounded-xl border-2 border-neutral-200 hover:border-violet-400 hover:bg-violet-50 transition-all group"
                    >
                      <div>
                        <div className="font-['Satoshi'] text-sm font-semibold text-neutral-900 group-hover:text-violet-700">
                          {s.target_role ?? "Resume draft"}
                        </div>
                        {s.experience_band && (
                          <div className="font-['Satoshi'] text-xs text-neutral-500">{s.experience_band}</div>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${scoreColor} font-['Satoshi']`}>
                        {score > 0 ? `ATS ${score}` : "In progress"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Internship Applications */}
          <Section title="Internship Applications" cta="Browse internships →" ctaHref="/dojos/internships">
            {applications === null ? (
              <><Skeleton /><Skeleton /></>
            ) : applications.length === 0 ? (
              <div className="text-center py-6">
                <p className="font-['Satoshi'] text-sm text-neutral-500 mb-3">No applications yet.</p>
                <Link to="/dojos/internships" className="font-['Satoshi'] text-sm font-bold text-violet-600 hover:text-violet-800">
                  Find internships →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {applications.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-xl border-2 border-neutral-200">
                    <div>
                      <div className="font-['Satoshi'] text-sm font-semibold text-neutral-900">{a.internship.title}</div>
                      <div className="font-['Satoshi'] text-xs text-neutral-500">{a.internship.companyName}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={a.status} />
                      <span className="font-['Satoshi'] text-[10px] text-neutral-400">
                        {new Date(a.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Outreach Orders */}
          <Section title="Outreach Orders" cta="View in Outreach →" ctaHref="/outreach">
            {outreachOrders === null ? (
              <><Skeleton /><Skeleton /></>
            ) : outreachOrders.length === 0 ? (
              <p className="font-['Satoshi'] text-sm text-neutral-500 py-4 text-center">No outreach orders yet.</p>
            ) : (
              <div className="space-y-2">
                {outreachOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-xl border-2 border-neutral-200">
                    <span className="font-['Satoshi'] text-sm font-semibold text-neutral-900">Order #{o.id}</span>
                    <StatusBadge status={o.status} />
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Dojo Activity */}
          <Section title="Dojo Activity">
            {jobs === null ? (
              <><Skeleton /><Skeleton /></>
            ) : jobs.length === 0 ? (
              <p className="font-['Satoshi'] text-sm text-neutral-500 py-4 text-center">No activity yet. Try the Assignment or Humanizer dojo.</p>
            ) : (
              <div className="space-y-2">
                {jobs.map((j) => (
                  <div key={j.job_id} className="flex items-center justify-between p-3 rounded-xl border-2 border-neutral-200">
                    <div>
                      <div className="font-['Satoshi'] text-sm font-semibold text-neutral-900 capitalize">{j.type?.replace(/_/g, " ")}</div>
                      <div className="font-['Satoshi'] text-xs text-neutral-400">
                        {new Date(j.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <StatusBadge status={j.status} />
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Classic Resumes */}
          <Section title="Classic Resumes">
            <p className="font-['Satoshi'] text-xs text-neutral-500 mb-3">New resumes are built with the AI builder. These are your legacy drafts.</p>
            {classicResumes === null ? (
              <><Skeleton /><Skeleton /></>
            ) : classicResumes.length === 0 ? (
              <p className="font-['Satoshi'] text-sm text-neutral-500 py-2">No classic resumes.</p>
            ) : (
              <div className="space-y-2">
                {classicResumes.map((r) => (
                  <Link key={r.id} to={`/resumes/${r.id}/edit`} className="flex items-center justify-between p-3 rounded-xl border-2 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-all">
                    <span className="font-['Satoshi'] text-sm font-semibold text-neutral-900">{r.name || "Untitled"}</span>
                    <span className="font-['Satoshi'] text-xs text-neutral-400">{new Date(r.updatedAt).toLocaleDateString()}</span>
                  </Link>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </>
  );
}
