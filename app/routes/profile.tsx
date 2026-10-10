import { Component, useEffect, useMemo, useRef, useState } from "react";
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
import { ProfileTickets } from "~/components/profile-tickets";
import { TalentGlobe, type GlobePin } from "~/components/profile/talent-globe";
import { ProfileStrength } from "~/components/profile/profile-strength";
import { GithubGraph } from "~/components/profile/github-graph";
import { outreachFetch } from "~/lib/outreach/api";
import { useOutreachStore } from "~/lib/outreach/store";
import { getJobs } from "~/lib/control-plane";
import { profileFromResume, type ResumeProfile } from "~/lib/profile-from-resume";
import {
  EMPTY_SIGNALS,
  headline,
  mergeSignals,
  profileStrength,
  signalsFromCandidate,
  signalsFromTalent,
  type TalentSignals,
} from "~/lib/talent-profile";
import type { ProfileLinks, TalentStore } from "../../auth-schema";

type UserProfile = {
  fullName: string | null;
  college: string | null;
  yearOfStudy: string | null;
  course: string | null;
  links: ProfileLinks | null;
  talent: TalentStore | null;
};

type ClassicResume = { id: string; name: string; updatedAt: string };

type Application = {
  id: string;
  status: string;
  appliedAt: string;
  internship: { title: string; companyName: string };
};

type OutreachOrder = { id: number; status: string; created_at?: string };

type CoachSummary = {
  found: boolean;
  has_analysis?: boolean;
  chat_url?: string;
  readiness_score?: number;
  level?: number;
  level_label?: string;
  target_role?: string | null;
  next_action?: string | null;
  score_history?: unknown;
};

type GlobeCity = {
  name: string;
  lat: number;
  lng: number;
  openRoles: number;
  samples: { title: string; company: string; slug: string }[];
};
type GlobeData = {
  home: { name: string; lat: number; lng: number } | null;
  cities: GlobeCity[];
  hubs: GlobeCity[];
  applied: { company: string; title: string; status: string; lat: number; lng: number }[];
  totalOpen: number;
};

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

const CARD = "bg-white border-2 border-neutral-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]";
const BTN_PRIMARY =
  "inline-flex items-center gap-2 px-4 py-2 bg-violet-500 text-white font-bold text-sm border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all font-['Satoshi'] disabled:opacity-60";

function StatusBadge({ status }: { status: string | null | undefined }) {
  const s = status ?? "";
  const cls = STATUS_COLORS[s] ?? "bg-neutral-100 text-neutral-700 border-neutral-300";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls} font-['Satoshi'] capitalize`}>
      {s.replace(/_/g, " ")}
    </span>
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
  inputRef,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <div>
      <label className="block font-['Satoshi'] text-xs font-semibold text-neutral-600 mb-1">{label}</label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-base font-['Satoshi'] border-2 border-neutral-300 rounded-xl focus:outline-none focus:border-violet-500 transition-colors"
      />
    </div>
  );
}

/** A titled card in the "beyond the resume" grid, styled like a profile prompt. */
function PromptCard({ prompt, children, className = "" }: { prompt: string; children: ReactNode; className?: string }) {
  return (
    <div className={`${CARD} p-5 ${className}`}>
      <p className="font-['Satoshi'] text-[11px] font-bold uppercase tracking-wider text-violet-600 mb-2">{prompt}</p>
      {children}
    </div>
  );
}

/** A stored profile value, or null when it is empty or the "Not specified" placeholder. */
function filled(v: string | null | undefined): string | null {
  return v && v.trim() && v !== "Not specified" ? v : null;
}

const initialsOf = (s: string) => {
  const parts = s.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0][0] ?? "?").toUpperCase();
  return ((parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")).toUpperCase();
};

/** Coach score history as numbers, oldest first; [] when the shape is unknown. */
function scoreSeries(h: unknown): number[] {
  const list = Array.isArray(h) ? h : h && typeof h === "object" && Array.isArray((h as any).history) ? (h as any).history : [];
  return list
    .map((x: any) => (typeof x === "number" ? x : typeof x?.score === "number" ? x.score : null))
    .filter((n: number | null): n is number => n !== null && n >= 0 && n <= 100)
    .slice(-12);
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 120, h = 32;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / span) * (h - 4) - 2}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-[120px]" aria-hidden="true">
      <polyline points={pts} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

type Tab = "outreach" | "applications" | "resumes" | "dojo" | "support";

function ProfileContent() {
  const { data: auth, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const { setOrderId, setCandidateId, setCampaignId, setEmailAccountId, candidateId } = useOutreachStore();
  const [mounted, setMounted] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [classicResumes, setClassicResumes] = useState<ClassicResume[] | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [outreachOrders, setOutreachOrders] = useState<OutreachOrder[] | null>(null);
  const [outreachOrdersError, setOutreachOrdersError] = useState(false);
  const [jobs, setJobs] = useState<any[] | null>(null);
  const [coachSummary, setCoachSummary] = useState<CoachSummary | null>(null);
  // PH-28: name parsed from the outreach resume, used when the account has no
  // real name (email signups through outreach never see the profile form).
  // College, course and graduation year come from the same resume and prefill
  // the form; nothing is saved until the student presses Save (or "Fill from resume").
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile | null>(null);
  const resumeName = resumeProfile?.name ?? null;
  // Everything else the outreach profiling already learned: skills, roles, cities.
  const [candidateSignals, setSignals] = useState<TalentSignals>(EMPTY_SIGNALS);
  // undefined = still looking, null = this user has no outreach candidate.
  const [activeCandidate, setActiveCandidate] = useState<number | null | undefined>(undefined);
  const [candidateLoaded, setCandidateLoaded] = useState(false);
  const [globe, setGlobe] = useState<GlobeData | null>(null);
  const [focusCity, setFocusCity] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("outreach");

  // Edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editForm, setEditForm] = useState({
    fullName: "",
    college: "",
    yearOfStudy: "",
    course: "",
    github: "",
    linkedin: "",
    portfolio: "",
  });
  const nameRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLDivElement>(null);

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
      .catch(() => setProfile(null))
      .finally(() => setProfileLoaded(true));

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

    // Career Coach readiness summary (same-origin, session-authed proxy)
    fetch("/api/career-coach/summary")
      .then((r) => r.json())
      .then((d) => setCoachSummary(d ?? null))
      .catch(() => setCoachSummary(null));

    outreachFetch<{ orders?: Array<{ order?: OutreachOrder } & OutreachOrder> }>("/orders/list")
      .then((d) => {
        const raw = Array.isArray(d?.orders) ? d.orders : [];
        setOutreachOrders(raw.map((o) => (o as any).order ?? o));
      })
      .catch(() => { setOutreachOrders([]); setOutreachOrdersError(true); });

    getJobs(undefined, 10)
      .then((j) => setJobs(Array.isArray(j) ? j : []))
      .catch(() => setJobs([]));
  }, [auth?.user]);

  // The outreach candidate holds the parsed resume. The browser remembers its
  // id, but a new device or cleared storage doesn't, so ask the server for the
  // latest one rather than showing an empty profile.
  useEffect(() => {
    if (!auth?.user) return;
    if (candidateId) {
      setActiveCandidate(candidateId);
      return;
    }
    let cancelled = false;
    outreachFetch<{ candidate_id: number | null }>("/candidate/latest", { maxRetries: 1 })
      .then((d) => !cancelled && setActiveCandidate(d?.candidate_id ?? null))
      .catch(() => !cancelled && setActiveCandidate(null));
    return () => {
      cancelled = true;
    };
  }, [auth?.user, candidateId]);

  useEffect(() => {
    if (!activeCandidate) return;
    setCandidateLoaded(false);
    outreachFetch<any>(`/candidate/${activeCandidate}/profile`)
      .then((d) => {
        setResumeProfile(profileFromResume(d?.parsed_json));
        setSignals(signalsFromCandidate(d));
      })
      .catch(() => {
        setResumeProfile(null);
        setSignals(EMPTY_SIGNALS);
      })
      .finally(() => setCandidateLoaded(true));
  }, [activeCandidate]);

  // What the outreach profiling learned wins; the /start talent store fills the gaps.
  const signals = useMemo(
    () => mergeSignals(candidateSignals, signalsFromTalent(profile?.talent)),
    [candidateSignals, profile?.talent],
  );

  // Globe: wait until we know the student's cities (or that there are none).
  const homeText = filled(profile?.college) ?? resumeProfile?.college ?? "";
  const cityKey = signals.locations.join("|");
  const candidateSettled = activeCandidate === null || (!!activeCandidate && candidateLoaded);
  useEffect(() => {
    if (!auth?.user || !profileLoaded || !candidateSettled) return;
    let cancelled = false;
    const q = new URLSearchParams({ home: homeText, cities: cityKey });
    fetch(`/api/profile/globe?${q}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => !cancelled && setGlobe(d))
      .catch(() => !cancelled && setGlobe(null));
    return () => {
      cancelled = true;
    };
  }, [auth?.user, profileLoaded, candidateSettled, homeText, cityKey]);

  const user = auth?.user;
  const storedName = profile?.fullName && profile.fullName.trim().length > 2 ? profile.fullName.trim() : null;
  // PH-28: email signups get the email prefix as their account name, which
  // is not a name. Ignore it and fall back to the resume, then to a prompt.
  const emailPrefix = (user?.email ?? "").split("@")[0].toLowerCase();
  const accountName =
    user?.name && !user.name.includes("@") && user.name.trim().toLowerCase() !== emailPrefix
      ? user.name.trim()
      : null;
  const displayName = storedName ?? accountName ?? resumeName;

  const basics = {
    name: !!(storedName && storedName !== "Not specified") || !!accountName,
    college: !!filled(profile?.college),
    year: !!filled(profile?.yearOfStudy),
    course: !!filled(profile?.course),
  };
  // PH-28: the resume can fill at least one missing field.
  const resumeCanFill =
    !!resumeProfile &&
    ((!basics.name && !!resumeProfile.name) ||
      (!basics.college && !!resumeProfile.college) ||
      (!basics.year && !!resumeProfile.yearOfStudy) ||
      (!basics.course && !!resumeProfile.course));

  const strength = profileStrength({
    basics,
    resumeCanFill,
    hasResume: !!activeCandidate || (classicResumes?.length ?? 0) > 0 || !!profile?.talent?.resume,
    hasCareerDna: !!(coachSummary?.found && coachSummary.has_analysis),
    signals,
    links: profile?.links ?? null,
    hasApplied: (applications?.length ?? 0) > 0 || (outreachOrders?.length ?? 0) > 0,
  });

  // Globe pins: home, target cities (or busiest hubs), applications.
  const places: GlobeCity[] = globe ? (globe.cities.length ? globe.cities : globe.hubs) : [];
  const pins = useMemo<GlobePin[]>(() => {
    if (!globe) return [];
    const out: GlobePin[] = [];
    if (globe.home) out.push({ id: "home", kind: "home", lat: globe.home.lat, lng: globe.home.lng, kicker: "You're here", text: globe.home.name });
    const isTarget = globe.cities.length > 0;
    places.forEach((c, i) => {
      const s = c.samples[0];
      out.push({
        id: `city-${i}`,
        kind: isTarget ? "target" : "hub",
        lat: c.lat,
        lng: c.lng,
        kicker: s ? `${s.company} is hiring` : c.name,
        text: s ? s.title : c.openRoles ? `${c.openRoles} open roles` : "Your target city",
      });
    });
    globe.applied.slice(0, 12).forEach((a, i) => {
      out.push({ id: `applied-${i}`, kind: "applied", lat: a.lat, lng: a.lng });
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globe]);
  const focusIndex = focusCity ? Number(focusCity.replace("city-", "")) : -1;
  const focused = focusIndex >= 0 ? places[focusIndex] : null;
  const nearbyOpen = places.reduce((n, c) => n + c.openRoles, 0);

  const openEdit = () => {
    setEditForm({
      fullName: displayName ?? "",
      college: filled(profile?.college) ?? resumeProfile?.college ?? "",
      yearOfStudy: filled(profile?.yearOfStudy) ?? resumeProfile?.yearOfStudy ?? "",
      course: filled(profile?.course) ?? resumeProfile?.course ?? "",
      github: profile?.links?.github ?? "",
      linkedin: profile?.links?.linkedin ?? "",
      portfolio: profile?.links?.portfolio ?? "",
    });
    setSaveError("");
    setEditing(true);
    setTimeout(() => {
      editRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      nameRef.current?.focus({ preventScroll: true });
    }, 50);
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

  const patchProfile = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : "Couldn't save. Try again.");
    setProfile(data.profile ?? null);
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const { github, linkedin, portfolio, ...basicsForm } = editForm;
      await patchProfile({ ...basicsForm, links: { github, linkedin, portfolio } });
      setEditing(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // One click: copy what the resume knows into the empty basics, keep the rest.
  const autofill = async () => {
    if (!resumeProfile) return;
    setAutofilling(true);
    try {
      await patchProfile({
        fullName: displayName ?? resumeProfile.name ?? "",
        college: filled(profile?.college) ?? resumeProfile.college ?? "",
        yearOfStudy: filled(profile?.yearOfStudy) ?? resumeProfile.yearOfStudy ?? "",
        course: filled(profile?.course) ?? resumeProfile.course ?? "",
      });
    } catch {
      openEdit();
    } finally {
      setAutofilling(false);
    }
  };

  if (!mounted || isPending || !user) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center text-neutral-500 font-['Satoshi']">
          Loading...
        </div>
      </>
    );
  }

  const initials = initialsOf(displayName ?? user.email ?? "");
  const college = filled(profile?.college) ?? resumeProfile?.college ?? null;
  const course = filled(profile?.course) ?? resumeProfile?.course ?? null;
  const year = filled(profile?.yearOfStudy) ?? resumeProfile?.yearOfStudy ?? null;
  const tagline = headline(signals, coachSummary?.target_role);
  const hasCareerDna = !!(coachSummary?.found && coachSummary.has_analysis);
  const stats = [
    signals.salary && { label: "Target CTC", value: signals.salary },
    signals.workMode && { label: "Work mode", value: signals.workMode },
    hasCareerDna && { label: "Readiness", value: `${coachSummary?.readiness_score ?? 0}/100` },
    signals.timeline && { label: "Timeline", value: signals.timeline },
  ].filter(Boolean).slice(0, 3) as { label: string; value: string }[];
  const links = profile?.links ?? null;
  const series = scoreSeries(coachSummary?.score_history);
  const hasResumeData = signals.skills.length > 0 || signals.experience.length > 0 || signals.strengths.length > 0;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "outreach", label: "Outreach", count: outreachOrders?.length },
    { key: "applications", label: "Applications", count: applications?.length },
    { key: "resumes", label: "Resumes", count: classicResumes?.length },
    { key: "dojo", label: "Dojo activity", count: jobs?.length },
    { key: "support", label: "Support" },
  ];

  return (
    <>
      <Header />
      <div className="bg-gradient-to-br from-violet-50 via-white to-amber-50 min-h-[calc(100vh-80px)] px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* ── Talent card + globe ─────────────────────────────────────── */}
          <section className={`${CARD} overflow-hidden shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] grid lg:grid-cols-[1fr_1.05fr]`}>
            <div className="p-6 md:p-8 flex flex-col">
              <div className="flex items-start gap-4">
                {user.image ? (
                  <img
                    src={user.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-20 w-20 shrink-0 rounded-2xl border-2 border-neutral-900 object-cover shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
                  />
                ) : (
                  <div className="h-20 w-20 shrink-0 rounded-2xl bg-violet-500 border-2 border-neutral-900 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
                    <span className="font-['Clash_Display'] text-2xl font-bold text-white">{initials}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {user.emailVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-300 px-2 py-0.5 font-['Satoshi'] text-[11px] font-bold text-emerald-700">✓ Verified email</span>
                    )}
                    {activeCandidate ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-300 px-2 py-0.5 font-['Satoshi'] text-[11px] font-bold text-violet-700">✓ Resume read</span>
                    ) : null}
                    {hasCareerDna && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-300 px-2 py-0.5 font-['Satoshi'] text-[11px] font-bold text-amber-800">✓ Career DNA</span>
                    )}
                  </div>
                  <h1 className="mt-2 font-['Clash_Display'] text-3xl md:text-4xl font-bold text-neutral-900 leading-tight break-words">
                    {displayName ?? "Your profile"}
                  </h1>
                  {tagline && <p className="font-['Satoshi'] text-base font-bold text-violet-600 mt-1">{tagline}</p>}
                </div>
              </div>

              {(college || course || year) && (
                <p className="font-['Satoshi'] text-sm text-neutral-700 mt-4">
                  {[course, college, year].filter(Boolean).join(" · ")}
                </p>
              )}
              <p className="font-['Satoshi'] text-sm text-neutral-500 mt-0.5 break-all">{user.email}</p>

              {stats.length > 0 && (
                <div className="mt-5 grid grid-cols-3 divide-x-2 divide-neutral-100 border-y-2 border-neutral-100 py-3">
                  {stats.map((s) => (
                    <div key={s.label} className="px-2 text-center first:pl-0 last:pr-0">
                      <div className="font-['Clash_Display'] text-lg font-bold text-neutral-900 capitalize truncate">{s.value}</div>
                      <div className="font-['Satoshi'] text-[11px] text-neutral-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {signals.summary && (
                <p className="mt-5 font-['Satoshi'] text-sm leading-relaxed text-neutral-700 line-clamp-4">“{signals.summary}”</p>
              )}

              <div className="mt-auto pt-5 flex flex-wrap items-center gap-2">
                {links?.github && (
                  <a href={`https://github.com/${links.github}`} target="_blank" rel="noopener noreferrer" className="rounded-full border-2 border-neutral-900 px-3 py-1 font-['Satoshi'] text-xs font-bold hover:bg-neutral-50">GitHub ↗</a>
                )}
                {links?.linkedin && (
                  <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-full border-2 border-neutral-900 px-3 py-1 font-['Satoshi'] text-xs font-bold hover:bg-neutral-50">LinkedIn ↗</a>
                )}
                {links?.portfolio && (
                  <a href={links.portfolio} target="_blank" rel="noopener noreferrer" className="rounded-full border-2 border-neutral-900 px-3 py-1 font-['Satoshi'] text-xs font-bold hover:bg-neutral-50">Portfolio ↗</a>
                )}
                <button type="button" onClick={openEdit} className="inline-flex min-h-[44px] items-center px-1 text-sm font-bold text-violet-600 hover:text-violet-800 font-['Satoshi']">
                  Edit profile →
                </button>
              </div>
            </div>

            {/* Globe */}
            <div className="relative border-t-2 lg:border-t-0 lg:border-l-2 border-neutral-900 bg-gradient-to-b from-white to-violet-50/60 p-5 md:p-6">
              <div className="text-center">
                <p className="font-['Satoshi'] text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  {globe?.cities.length ? "Where you want to work" : "Where the roles are"}
                </p>
                <h2 className="font-['Clash_Display'] text-2xl md:text-3xl font-bold text-neutral-900 mt-1">
                  {focused?.name ?? globe?.home?.name ?? places[0]?.name ?? "Your map"}
                </h2>
                <p className="font-['Satoshi'] text-sm text-neutral-500">
                  {globe
                    ? focused
                      ? `${focused.openRoles} open ${focused.openRoles === 1 ? "role" : "roles"} on Studojo nearby`
                      : nearbyOpen > 0
                        ? `${nearbyOpen} open roles ${globe.cities.length ? "across your places" : "in the busiest places"}`
                        : `${globe.totalOpen} open roles on Studojo`
                    : "Placing you on the map…"}
                </p>
              </div>
              <div className="mx-auto mt-2 max-w-[440px]">
                {globe ? (
                  <TalentGlobe pins={pins} arcsFrom="home" focus={focusCity ?? "home"} />
                ) : (
                  <div className="aspect-square w-full rounded-full bg-gradient-to-br from-violet-100/60 to-white animate-pulse" />
                )}
              </div>

              {places.length > 0 && (
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {globe?.home && (
                    <button
                      type="button"
                      onClick={() => setFocusCity(null)}
                      className={`rounded-full border-2 px-3 py-1 font-['Satoshi'] text-xs font-bold transition-colors ${!focusCity ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900"}`}
                    >
                      ● Home
                    </button>
                  )}
                  {places.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setFocusCity(`city-${i}`)}
                      className={`rounded-full border-2 px-3 py-1 font-['Satoshi'] text-xs font-bold transition-colors ${focusCity === `city-${i}` ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900"}`}
                    >
                      {c.name}
                      {c.openRoles > 0 && <span className="ml-1 opacity-60">{c.openRoles}</span>}
                    </button>
                  ))}
                </div>
              )}

              {focused && focused.samples.length > 0 && (
                <div className="mt-4 rounded-xl border-2 border-neutral-900 bg-white p-3">
                  <p className="font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-neutral-500">Hiring in {focused.name}</p>
                  <ul className="mt-1 divide-y divide-neutral-100">
                    {focused.samples.map((s) => (
                      <li key={s.slug}>
                        <Link to={`/internships/${s.slug}`} className="flex items-center justify-between gap-3 py-2 group">
                          <span className="min-w-0">
                            <span className="block truncate font-['Satoshi'] text-sm font-bold text-neutral-900 group-hover:text-violet-700">{s.title}</span>
                            <span className="block truncate font-['Satoshi'] text-xs text-neutral-500">{s.company}</span>
                          </span>
                          <span className="shrink-0 text-neutral-400 group-hover:text-violet-700" aria-hidden="true">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {globe && globe.cities.length === 0 && (
                <p className="mt-3 text-center font-['Satoshi'] text-xs text-neutral-500">
                  Showing the busiest places.{" "}
                  <Link to="/outreach/onboarding/chat" className="font-bold text-violet-600 hover:text-violet-800">Add your cities →</Link>
                </p>
              )}
              <div className="mt-3 flex justify-center gap-4 font-['Satoshi'] text-[11px] text-neutral-500">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-700" /> You</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> {globe?.cities.length ? "Targets" : "Hubs"}</span>
                {(globe?.applied.length ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Applied</span>
                )}
              </div>
            </div>
          </section>

          {/* ── Edit ───────────────────────────────────────────────────── */}
          {editing && (
            <div ref={editRef} className={`${CARD} p-6`}>
              <h2 className="font-['Clash_Display'] text-base font-bold text-neutral-900 mb-4">Edit profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <InputField
                    label="Full Name"
                    inputRef={nameRef}
                    value={editForm.fullName}
                    onChange={(v) => setEditForm((p) => ({ ...p, fullName: v }))}
                    placeholder="Your full name"
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
                <div className="sm:col-span-2 pt-2">
                  <p className="font-['Satoshi'] text-xs font-bold uppercase tracking-wider text-neutral-500">Proof of work</p>
                </div>
                <InputField
                  label="GitHub username"
                  value={editForm.github}
                  onChange={(v) => setEditForm((p) => ({ ...p, github: v }))}
                  placeholder="e.g. octocat"
                />
                <InputField
                  label="LinkedIn"
                  value={editForm.linkedin}
                  onChange={(v) => setEditForm((p) => ({ ...p, linkedin: v }))}
                  placeholder="linkedin.com/in/your-name"
                />
                <div className="sm:col-span-2">
                  <InputField
                    label="Portfolio or website"
                    value={editForm.portfolio}
                    onChange={(v) => setEditForm((p) => ({ ...p, portfolio: v }))}
                    placeholder="e.g. yourname.dev"
                  />
                </div>
              </div>
              {saveError && <p className="font-['Satoshi'] text-xs text-red-600 mt-2">{saveError}</p>}
              <div className="flex items-center gap-3 mt-4">
                <button type="button" onClick={saveProfile} disabled={saving} className={BTN_PRIMARY}>
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

          {/* ── Strength + where you're headed ─────────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
            <ProfileStrength
              score={strength.score}
              items={strength.items}
              onEdit={openEdit}
              onAutofill={autofill}
              autofilling={autofilling}
            />

            <PromptCard prompt="Roles I'm built for">
              {signals.roleFits.length > 0 || signals.targetRoles.length > 0 ? (
                <>
                  <ul className="space-y-3">
                    {(signals.roleFits.length
                      ? signals.roleFits
                      : signals.targetRoles.map((t) => ({ title: t, fit: null, reasoning: null }))
                    ).map((r) => (
                      <li key={r.title}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-['Clash_Display'] text-base font-bold text-neutral-900">{r.title}</span>
                          {r.fit !== null && (
                            <span className="font-['Satoshi'] text-xs font-bold text-violet-700">{Math.round(r.fit * 100)}% fit</span>
                          )}
                        </div>
                        {r.fit !== null && (
                          <div className="mt-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                            <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.round(r.fit * 100)}%` }} />
                          </div>
                        )}
                        {r.reasoning && <p className="mt-1 font-['Satoshi'] text-xs text-neutral-500 line-clamp-2">{r.reasoning}</p>}
                      </li>
                    ))}
                  </ul>
                  {(signals.industries.length > 0 || signals.dreamCompanies.length > 0) && (
                    <div className="mt-4 space-y-2">
                      {signals.dreamCompanies.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-['Satoshi'] text-xs font-semibold text-neutral-500 mr-1">Dream companies</span>
                          {signals.dreamCompanies.map((c) => (
                            <span key={c} className="rounded-full border-2 border-neutral-900 bg-amber-50 px-2.5 py-0.5 font-['Satoshi'] text-xs font-bold">{c}</span>
                          ))}
                        </div>
                      )}
                      {signals.industries.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-['Satoshi'] text-xs font-semibold text-neutral-500 mr-1">Industries</span>
                          {signals.industries.map((c) => (
                            <span key={c} className="rounded-full bg-neutral-100 px-2.5 py-0.5 font-['Satoshi'] text-xs font-semibold text-neutral-700">{c}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="py-2">
                  <p className="font-['Satoshi'] text-sm text-neutral-600 mb-3">
                    Answer a few quick questions and we'll rank the roles you fit best, with the reason for each.
                  </p>
                  <Link to={activeCandidate ? "/outreach/onboarding/chat" : "/outreach/onboarding/upload"} className={BTN_PRIMARY}>
                    {activeCandidate ? "Find my roles" : "Upload resume"}
                  </Link>
                </div>
              )}
            </PromptCard>
          </div>

          {/* ── Beyond the resume ──────────────────────────────────────── */}
          <div>
            <h2 className="font-['Clash_Display'] text-2xl font-bold text-neutral-900 mb-3">Beyond the resume</h2>
            {!hasResumeData && !links?.github && !hasCareerDna ? (
              <div className={`${CARD} p-6 text-center`}>
                <p className="font-['Clash_Display'] text-lg font-bold text-neutral-900">Upload your resume once. We'll fill in the rest.</p>
                <p className="font-['Satoshi'] text-sm text-neutral-600 mt-1 mb-4">
                  Your skills, strengths and experience show up here automatically, no forms.
                </p>
                <a href="/outreach/onboarding/upload" className={BTN_PRIMARY}>Upload resume</a>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {signals.skills.length > 0 && (
                  <PromptCard prompt="My stack">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {signals.skills.slice(0, 12).map((s, i) => (
                        <div key={s} className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-neutral-200 p-2 text-center">
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border-2 border-neutral-900 font-['Clash_Display'] text-sm font-bold ${["bg-violet-200", "bg-amber-200", "bg-emerald-200", "bg-pink-200"][i % 4]}`}
                          >
                            {s.replace(/[^A-Za-z0-9+#]/g, "").slice(0, 2).toUpperCase() || "•"}
                          </span>
                          <span className="w-full truncate font-['Satoshi'] text-[11px] font-semibold text-neutral-700" title={s}>{s}</span>
                        </div>
                      ))}
                    </div>
                    {signals.skills.length > 12 && (
                      <p className="mt-2 font-['Satoshi'] text-xs text-neutral-500">+{signals.skills.length - 12} more: {signals.skills.slice(12).join(", ")}</p>
                    )}
                  </PromptCard>
                )}

                {signals.strengths.length > 0 && (
                  <PromptCard prompt="What I bring">
                    <ul className="space-y-2">
                      {signals.strengths.map((s) => (
                        <li key={s} className="flex gap-2 font-['Satoshi'] text-sm text-neutral-800">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </PromptCard>
                )}

                {signals.experience.length > 0 && (
                  <PromptCard prompt="Where I've worked">
                    <ol className="relative border-l-2 border-neutral-200 ml-1.5 space-y-4">
                      {signals.experience.map((e, i) => (
                        <li key={i} className="pl-4">
                          <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-neutral-900 bg-white" />
                          <div className="font-['Satoshi'] text-sm font-bold text-neutral-900">{e.title || e.company}</div>
                          <div className="font-['Satoshi'] text-xs text-neutral-500">
                            {[e.title ? e.company : null, e.duration].filter(Boolean).join(" · ")}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </PromptCard>
                )}

                <PromptCard prompt="What I've shipped">
                  {links?.github ? (
                    <GithubGraph handle={links.github} />
                  ) : (
                    <div className="py-2">
                      <p className="font-['Satoshi'] text-sm text-neutral-600 mb-3">
                        Add your GitHub and your contribution graph shows here. Recruiters trust commits more than claims.
                      </p>
                      <button type="button" onClick={openEdit} className={BTN_PRIMARY}>Add GitHub</button>
                    </div>
                  )}
                </PromptCard>

                {hasCareerDna && (
                  <PromptCard prompt="Career readiness" className="md:col-span-2">
                    <div className="flex flex-wrap items-center gap-5">
                      <div className="flex items-baseline gap-1">
                        <span className="font-['Clash_Display'] text-4xl font-bold text-neutral-900">{coachSummary?.readiness_score ?? 0}</span>
                        <span className="font-['Satoshi'] text-sm text-neutral-500">/100</span>
                      </div>
                      <Sparkline values={series} />
                      <div className="min-w-0 flex-1">
                        {coachSummary?.level_label && (
                          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">
                            Level {coachSummary.level} · {coachSummary.level_label}
                          </span>
                        )}
                        {coachSummary?.next_action && (
                          <p className="font-['Satoshi'] text-sm text-neutral-600 mt-2">
                            <span className="font-semibold text-neutral-800">Next step:</span> {coachSummary.next_action}
                          </p>
                        )}
                      </div>
                      <Link to={coachSummary?.chat_url || "/cc/chat"} className={BTN_PRIMARY}>
                        Continue with your Coach →
                      </Link>
                    </div>
                  </PromptCard>
                )}
              </div>
            )}
            {coachSummary?.found && coachSummary.has_analysis === false && (
              <div className={`${CARD} p-5 mt-6 flex flex-wrap items-center justify-between gap-3`}>
                <div>
                  <h3 className="font-['Clash_Display'] text-lg font-bold text-neutral-900">Finish your Career DNA</h3>
                  <p className="font-['Satoshi'] text-sm text-neutral-600">A few more answers unlock your readiness score and action plan.</p>
                </div>
                <Link to={coachSummary.chat_url || "/cc/chat"} className={BTN_PRIMARY}>Continue your analysis →</Link>
              </div>
            )}
          </div>

          {/* ── Activity ───────────────────────────────────────────────── */}
          <section className={`${CARD} overflow-hidden`}>
            <div className="flex overflow-x-auto border-b-2 border-neutral-900 bg-neutral-50" role="tablist">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`min-h-[48px] shrink-0 px-4 font-['Satoshi'] text-sm font-bold transition-colors border-r-2 border-neutral-200 ${tab === t.key ? "bg-white text-neutral-900" : "text-neutral-500 hover:text-neutral-900"}`}
                >
                  {t.label}
                  {typeof t.count === "number" && t.count > 0 && (
                    <span className="ml-1.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] text-violet-700">{t.count}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="p-5">
              {tab === "outreach" && (
                <>
                  {outreachOrders === null ? (
                    <>
                      <Skeleton />
                      <Skeleton />
                    </>
                  ) : outreachOrdersError ? (
                    <p className="font-['Satoshi'] text-sm text-neutral-500 py-4 text-center">
                      Couldn't load orders. <a href="/outreach/orders" className="inline-flex min-h-[44px] items-center text-violet-600 font-semibold hover:underline">View in Outreach →</a>
                    </p>
                  ) : outreachOrders.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="font-['Satoshi'] text-sm text-neutral-500 mb-3">No outreach orders yet.</p>
                      <a href="/outreach/onboarding/upload" className={BTN_PRIMARY}>Start outreach</a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {outreachOrders.map((o, i) => (
                        <button
                          key={o.id ?? i}
                          type="button"
                          onClick={() => handleOrderClick(o.id)}
                          className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-neutral-200 hover:border-violet-400 hover:bg-violet-50 transition-all text-left group"
                        >
                          <div className="min-w-0">
                            <span className="font-['Satoshi'] text-sm font-semibold text-neutral-900 group-hover:text-violet-700">Order #{o.id}</span>
                            {o.created_at && (
                              <div className="font-['Satoshi'] text-xs text-neutral-400">{new Date(o.created_at).toLocaleDateString()}</div>
                            )}
                          </div>
                          <StatusBadge status={o.status} />
                        </button>
                      ))}
                      <Link to="/outreach" className="inline-flex min-h-[44px] items-center text-sm font-bold text-violet-600 hover:text-violet-800 font-['Satoshi']">View in Outreach →</Link>
                    </div>
                  )}
                </>
              )}

              {tab === "applications" && (
                <>
                  {applications === null ? (
                    <>
                      <Skeleton />
                      <Skeleton />
                    </>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="font-['Satoshi'] text-sm text-neutral-500 mb-3">No applications yet.</p>
                      <Link to="/dojos/internships" className="inline-flex min-h-[44px] items-center font-['Satoshi'] text-sm font-bold text-violet-600 hover:text-violet-800">
                        Find internships →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {applications.map((a) => (
                        <div key={a.id} className="flex items-center justify-between p-3 rounded-xl border-2 border-neutral-200">
                          <div>
                            <div className="font-['Satoshi'] text-sm font-semibold text-neutral-900">{a.internship?.title ?? "-"}</div>
                            <div className="font-['Satoshi'] text-xs text-neutral-500">{a.internship?.companyName ?? ""}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <StatusBadge status={a.status} />
                            <span className="font-['Satoshi'] text-[10px] text-neutral-400">
                              {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                      <Link to="/dojos/internships" className="inline-flex min-h-[44px] items-center text-sm font-bold text-violet-600 hover:text-violet-800 font-['Satoshi']">Browse internships →</Link>
                    </div>
                  )}
                </>
              )}

              {tab === "resumes" && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 rounded-xl bg-violet-50 p-4">
                    <p className="font-['Satoshi'] text-sm text-neutral-700">
                      Build an ATS-ready resume in minutes: 12 templates, live preview, AI coach.
                    </p>
                    <Link to="/resume-maker" className={BTN_PRIMARY}>Open Resume Maker</Link>
                  </div>
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
                      {classicResumes.map((r) => (
                        <Link
                          key={r.id}
                          to={`/resumes/${r.id}/edit`}
                          className="flex items-center justify-between p-3 rounded-xl border-2 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-all"
                        >
                          <span className="font-['Satoshi'] text-sm font-semibold text-neutral-900 truncate max-w-[75%]">{r.name || "Untitled"}</span>
                          <span className="font-['Satoshi'] text-xs text-neutral-400 shrink-0">
                            {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : ""}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}

              {tab === "dojo" && (
                <>
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
                      {jobs.map((j) => (
                        <div key={j.job_id} className="flex items-center justify-between p-3 rounded-xl border-2 border-neutral-200">
                          <div>
                            <div className="font-['Satoshi'] text-sm font-semibold text-neutral-900 capitalize">{j.type?.replace(/_/g, " ")}</div>
                            <div className="font-['Satoshi'] text-xs text-neutral-400">
                              {j.created_at ? new Date(j.created_at).toLocaleDateString() : ""}
                            </div>
                          </div>
                          <StatusBadge status={j.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {tab === "support" && <ProfileTickets />}
            </div>
          </section>

          {/* Career DNA invite for students who never started it */}
          {coachSummary && !coachSummary.found && (
            <div className={`${CARD} p-6 flex flex-wrap items-center justify-between gap-3`}>
              <div>
                <h2 className="font-['Clash_Display'] text-lg font-bold text-neutral-900">Get your free Career DNA</h2>
                <p className="font-['Satoshi'] text-sm text-neutral-600 mt-1">
                  Your free AI Career Coach builds a readiness score, gap analysis, and a weekly action plan tailored to your target role.
                </p>
              </div>
              <Link to="/cc" className={BTN_PRIMARY}>Start your Career DNA →</Link>
            </div>
          )}
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
