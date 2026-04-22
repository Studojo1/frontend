import { Component, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";

class ProfileErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-6 bg-red-50 border-2 border-red-400 rounded-2xl m-6">
          <p className="font-bold text-red-800 mb-2">Profile render error (staging debug):</p>
          <pre className="text-xs text-red-700 whitespace-pre-wrap break-all">{this.state.error.message}{"\n"}{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
import { authClient } from "~/lib/auth-client";
import { Header } from "~/components/common/header";
import { rsbFetch } from "~/lib/rsb/api";
import { outreachFetch } from "~/lib/outreach/api";
import { useOutreachStore } from "~/lib/outreach/store";
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
  leads_ready: "bg-violet-100 text-violet-800 border-violet-300",
  enriching: "bg-amber-100 text-amber-800 border-amber-300",
  enrichment_complete: "bg-violet-100 text-violet-800 border-violet-300",
  campaign_setup: "bg-violet-100 text-violet-800 border-violet-300",
  email_connected: "bg-violet-100 text-violet-800 border-violet-300",
  created: "bg-neutral-100 text-neutral-700 border-neutral-300",
};

function StatusBadge({ status }: { status: string | null | undefined }) {
  const s = status ?? "";
  const cls = STATUS_COLORS[s] ?? "bg-neutral-100 text-neutral-700 border-neutral-300";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls} font-['Satoshi'] capitalize`}>
      {s.replace(/_/g, " ")}
    </span>
  );
}

function Section({
  title,
  cta,
  ctaHref,
  children,
}: {
  title: string;
  cta?: string;
  ctaHref?: string;
  children: React.ReactNode;
}) {
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

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-['Satoshi'] text-xs font-semibold text-neutral-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm font-['Satoshi'] border-2 border-neutral-300 rounded-xl focus:outline-none focus:border-violet-500 transition-colors"
      />
    </div>
  );
}

function ProfileContent() {
  const { data: auth, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const { setOrderId, setCandidateId, setCampaignId, setEmailAccountId } = useOutreachStore();
  const [mounted, setMounted] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rsbSessions, setRsbSessions] = useState<RsbSession[] | null>(null);
  const [classicResumes, setClassicResumes] = useState<ClassicResume[] | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [outreachOrders, setOutreachOrders] = useState<OutreachOrder[] | null>(null);
  const [jobs, setJobs] = useState<any[] | null>(null);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editForm, setEditForm] = useState({ fullName: "", college: "", yearOfStudy: "", course: "" });
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      fetch("/api/v2/resumes")
        .then((r) => r.json())
        .catch(() => ({ drafts: [] })),
      fetch("/api/resumes")
        .then((r) => r.json())
        .catch(() => []),
    ])
      .then(([v2, v1]) => {
        const v2list = Array.isArray(v2?.drafts)
          ? v2.drafts.map((d: any) => ({ id: d.id, name: d.name, updatedAt: d.updatedAt ?? d.createdAt }))
          : [];
        const v1list = Array.isArray(v1)
          ? v1.map((r: any) => ({ id: r.id, name: r.name, updatedAt: r.updatedAt ?? r.createdAt }))
          : [];
        setClassicResumes([...v2list, ...v1list]);
      })
      .catch(() => setClassicResumes([]));

    fetch("/api/user/applications")
      .then((r) => r.json())
      .then((d) => setApplications(Array.isArray(d?.applications) ? d.applications : []))
      .catch(() => setApplications([]));

    outreachFetch<{ orders?: Array<{ order?: OutreachOrder } & OutreachOrder> }>("/orders/list")
      .then((d) => {
        const raw = Array.isArray(d?.orders) ? d.orders : [];
        setOutreachOrders(raw.map((o) => (o as any).order ?? o));
      })
      .catch(() => setOutreachOrders([]));

    getJobs(undefined, 10)
      .then((j) => setJobs(Array.isArray(j) ? j : []))
      .catch(() => setJobs([]));
  }, [auth?.user]);

  const openEdit = () => {
    setEditForm({
      fullName: storedName ?? user?.name ?? "",
      college: profile?.college ?? "",
      yearOfStudy: profile?.yearOfStudy ?? "",
      course: profile?.course ?? "",
    });
    setSaveError("");
    setEditing(true);
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  const handleOrderClick = async (orderId: number) => {
    try {
      const data = await outreachFetch<{
        order_id: number;
        candidate_id?: number;
        campaign_id?: number;
        email_account_id?: number;
        redirect: string;
      }>(`/orders/${orderId}/resume`);
      setOrderId(data.order_id);
      if (data.candidate_id) setCandidateId(data.candidate_id);
      if (data.campaign_id) setCampaignId(data.campaign_id);
      if (data.email_account_id) setEmailAccountId(data.email_account_id);
      const redirect = data.redirect.startsWith("/outreach")
        ? data.redirect
        : `/outreach${data.redirect}`;
      navigate(redirect);
    } catch {
      navigate("/outreach/orders");
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setSaveError("");
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setProfile(data.profile ?? null);
      setEditing(false);
    } catch {
      setSaveError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || isPending || !auth?.user) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center text-neutral-500 font-['Satoshi']">
          Loading...
        </div>
      </>
    );
  }

  const user = auth.user;
  const storedName = profile?.fullName && profile.fullName.trim().length > 2 ? profile.fullName.trim() : null;
  const displayName = storedName ?? user.name ?? user.email;
  const initials = (() => {
    const parts = (displayName ?? "").split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return (parts[0][0] ?? "?").toUpperCase();
    return ((parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")).toUpperCase();
  })();

  // Profile completeness
  const fields = [
    { label: "Name", filled: !!(profile?.fullName && profile.fullName !== "Not specified") },
    { label: "College", filled: !!(profile?.college && profile.college !== "Not specified") },
    { label: "Year", filled: !!(profile?.yearOfStudy && profile.yearOfStudy !== "Not specified") },
    { label: "Course", filled: !!(profile?.course && profile.course !== "Not specified") },
  ];
  const filledCount = fields.filter((f) => f.filled).length;
  const completeness = Math.round((filledCount / fields.length) * 100);

  return (
    <>
      <Header />
      <div className="bg-gradient-to-br from-violet-50 via-white to-amber-50 min-h-[calc(100vh-80px)] px-4 md:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Hero card */}
          <div className="bg-white border-2 border-neutral-900 rounded-2xl shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] p-6 mb-8">
            {!editing ? (
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-violet-500 border-2 border-neutral-900 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
                  <span className="font-['Clash_Display'] text-xl font-bold text-white">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-['Clash_Display'] text-2xl font-bold text-neutral-900 truncate">{displayName}</h1>
                  <p className="font-['Satoshi'] text-sm text-neutral-600 mt-0.5">{user.email}</p>
                  {(profile?.college || profile?.yearOfStudy) && (
                    <p className="font-['Satoshi'] text-sm text-neutral-500 mt-1">
                      {[profile?.college, profile?.yearOfStudy, profile?.course]
                        .filter((v) => v && v !== "Not specified")
                        .join(" · ")}
                    </p>
                  )}
                  {/* Completeness bar */}
                  {completeness < 100 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-['Satoshi'] text-xs text-neutral-500">
                          Profile {completeness}% complete
                        </span>
                        <span className="font-['Satoshi'] text-xs text-neutral-400">
                          {fields.filter((f) => !f.filled).map((f) => f.label).join(", ")} missing
                        </span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full transition-all"
                          style={{ width: `${completeness}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={openEdit}
                    className="inline-block mt-3 text-xs font-bold text-violet-600 hover:text-violet-800 font-['Satoshi']"
                  >
                    Edit profile →
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="font-['Clash_Display'] text-base font-bold text-neutral-900 mb-4">Edit Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-['Satoshi'] text-xs font-semibold text-neutral-600 mb-1">Full Name</label>
                    <input
                      ref={nameRef}
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
                      placeholder="Your full name"
                      className="w-full px-3 py-2 text-sm font-['Satoshi'] border-2 border-neutral-300 rounded-xl focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <InputField
                    label="College / University"
                    value={editForm.college}
                    onChange={(v) => setEditForm((p) => ({ ...p, college: v }))}
                    placeholder="e.g. Christ University"
                  />
                  <InputField
                    label="Year of Study"
                    value={editForm.yearOfStudy}
                    onChange={(v) => setEditForm((p) => ({ ...p, yearOfStudy: v }))}
                    placeholder="e.g. Second year"
                  />
                  <div className="sm:col-span-2">
                    <InputField
                      label="Course / Programme"
                      value={editForm.course}
                      onChange={(v) => setEditForm((p) => ({ ...p, course: v }))}
                      placeholder="e.g. BBA, B.Tech, MBA"
                    />
                  </div>
                </div>
                {saveError && (
                  <p className="font-['Satoshi'] text-xs text-red-600 mt-2">{saveError}</p>
                )}
                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={saving}
                    className="px-5 py-2 bg-violet-500 text-white font-bold text-sm border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all font-['Satoshi'] disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-5 py-2 bg-white text-neutral-700 font-bold text-sm border-2 border-neutral-300 rounded-xl font-['Satoshi'] hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Resume Drafts */}
          <Section title="AI Resume Drafts" cta="Build new resume →" ctaHref="/rsb">
            {rsbSessions === null ? (
              <>
                <Skeleton />
                <Skeleton />
              </>
            ) : rsbSessions.length === 0 ? (
              <div className="text-center py-6">
                <p className="font-['Satoshi'] text-sm text-neutral-500 mb-3">No AI drafts yet.</p>
                <Link
                  to="/rsb"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-500 text-white font-bold text-sm border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all font-['Satoshi']"
                >
                  Build your first resume
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {(Array.isArray(rsbSessions) ? rsbSessions : []).map((s) => {
                  const score = s.ats?.score ?? 0;
                  const scoreColor =
                    score >= 80
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : score >= 60
                        ? "bg-violet-100 text-violet-800 border-violet-300"
                        : score >= 40
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-neutral-100 text-neutral-700 border-neutral-300";
                  const localLabel = typeof window !== "undefined"
                    ? (localStorage.getItem(`rsb:label:${s.id}`) ?? null)
                    : null;
                  const displayName = localLabel ?? s.target_role ?? "Untitled resume";
                  const updatedDate = s.updated_at
                    ? new Date(s.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : null;
                  return (
                    <Link
                      key={s.id}
                      to={`/rsb/session/${s.id}`}
                      className="flex items-center justify-between p-3 rounded-xl border-2 border-neutral-200 hover:border-violet-400 hover:bg-violet-50 transition-all group"
                    >
                      <div className="min-w-0">
                        <div className="font-['Satoshi'] text-sm font-semibold text-neutral-900 group-hover:text-violet-700 truncate">
                          {displayName}
                        </div>
                        <div className="font-['Satoshi'] text-xs text-neutral-500">
                          {s.experience_band ? `${s.experience_band}${updatedDate ? ` · ${updatedDate}` : ""}` : (updatedDate ?? "In progress")}
                        </div>
                      </div>
                      <span
                        className={`ml-3 shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${scoreColor} font-['Satoshi']`}
                      >
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
              <>
                <Skeleton />
                <Skeleton />
              </>
            ) : applications.length === 0 ? (
              <div className="text-center py-6">
                <p className="font-['Satoshi'] text-sm text-neutral-500 mb-3">No applications yet.</p>
                <Link
                  to="/dojos/internships"
                  className="font-['Satoshi'] text-sm font-bold text-violet-600 hover:text-violet-800"
                >
                  Find internships →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {(Array.isArray(applications) ? applications : []).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-xl border-2 border-neutral-200"
                  >
                    <div>
                      <div className="font-['Satoshi'] text-sm font-semibold text-neutral-900">
                        {a.internship?.title ?? "—"}
                      </div>
                      <div className="font-['Satoshi'] text-xs text-neutral-500">
                        {a.internship?.companyName ?? ""}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={a.status} />
                      <span className="font-['Satoshi'] text-[10px] text-neutral-400">
                        {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : ""}
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
              <>
                <Skeleton />
                <Skeleton />
              </>
            ) : outreachOrders.length === 0 ? (
              <p className="font-['Satoshi'] text-sm text-neutral-500 py-4 text-center">
                No outreach orders yet.
              </p>
            ) : (
              <div className="space-y-2">
                {(Array.isArray(outreachOrders) ? outreachOrders : []).map((o, i) => (
                  <button
                    key={o.id ?? i}
                    type="button"
                    onClick={() => handleOrderClick(o.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-neutral-200 hover:border-violet-400 hover:bg-violet-50 transition-all text-left group"
                  >
                    <div>
                      <span className="font-['Satoshi'] text-sm font-semibold text-neutral-900 group-hover:text-violet-700">
                        Order #{o.id}
                      </span>
                      {o.created_at && (
                        <div className="font-['Satoshi'] text-xs text-neutral-400">
                          {new Date(o.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <StatusBadge status={o.status} />
                  </button>
                ))}
              </div>
            )}
          </Section>

          {/* Dojo Activity */}
          <Section title="Dojo Activity">
            {jobs === null ? (
              <>
                <Skeleton />
                <Skeleton />
              </>
            ) : jobs.length === 0 ? (
              <p className="font-['Satoshi'] text-sm text-neutral-500 py-4 text-center">
                No activity yet. Try the Assignment or Humanizer dojo.
              </p>
            ) : (
              <div className="space-y-2">
                {(Array.isArray(jobs) ? jobs : []).map((j) => (
                  <div
                    key={j.job_id}
                    className="flex items-center justify-between p-3 rounded-xl border-2 border-neutral-200"
                  >
                    <div>
                      <div className="font-['Satoshi'] text-sm font-semibold text-neutral-900 capitalize">
                        {j.type?.replace(/_/g, " ")}
                      </div>
                      <div className="font-['Satoshi'] text-xs text-neutral-400">
                        {j.created_at ? new Date(j.created_at).toLocaleDateString() : ""}
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
            <p className="font-['Satoshi'] text-xs text-neutral-500 mb-3">
              New resumes are built with the AI builder. These are your legacy drafts.
            </p>
            {classicResumes === null ? (
              <>
                <Skeleton />
                <Skeleton />
              </>
            ) : classicResumes.length === 0 ? (
              <p className="font-['Satoshi'] text-sm text-neutral-500 py-2">No classic resumes.</p>
            ) : (
              <div className="space-y-2">
                {(Array.isArray(classicResumes) ? classicResumes : []).map((r) => (
                  <Link
                    key={r.id}
                    to={`/resumes/${r.id}/edit`}
                    className="flex items-center justify-between p-3 rounded-xl border-2 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-all"
                  >
                    <span className="font-['Satoshi'] text-sm font-semibold text-neutral-900 truncate max-w-[75%]">
                      {r.name || "Untitled"}
                    </span>
                    <span className="font-['Satoshi'] text-xs text-neutral-400 shrink-0">
                      {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : ""}
                    </span>
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

export default function ProfilePage() {
  return (
    <ProfileErrorBoundary>
      <ProfileContent />
    </ProfileErrorBoundary>
  );
}
