import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { authClient } from "~/lib/auth-client";
import { ProfileTickets } from "~/components/profile-tickets";
import { GithubGraph } from "~/components/profile/github-graph";
import { SenseiBackdrop } from "~/components/start/sensei-backdrop";
import { SENSEI_CSS } from "~/components/start/sensei-style";
import { outreachFetch } from "~/lib/outreach/api";
import { useOutreachStore } from "~/lib/outreach/store";
import { profileFromResume, type ResumeProfile } from "~/lib/profile-from-resume";
import { EMPTY_SIGNALS, mergeSignals, signalsFromCandidate, signalsFromTalent, type TalentSignals } from "~/lib/talent-profile";
import type { ProfileLinks, TalentStore } from "../../auth-schema";

/**
 * /profile: the student's profile, laid out like a Tal public profile (big
 * name, portrait card between two tilted cards, then timelines and a stack),
 * in the sensei.studojo.com style used by /start. Everything comes from what
 * signup learned (resume, swipes, question cards) plus the outreach profile.
 * After signup (?welcome=1) it leads straight on to the agent chat in /app.
 */

type UserProfile = {
  fullName: string | null;
  college: string | null;
  yearOfStudy: string | null;
  course: string | null;
  links: ProfileLinks | null;
  talent: TalentStore | null;
};
type Application = { id: string; status: string; appliedAt: string; internship: { title: string; companyName: string } };
type OutreachOrder = { id: number; status: string; created_at?: string };
type Coach = { found: boolean; has_analysis?: boolean; chat_url?: string; readiness_score?: number; target_role?: string | null };

const filled = (v: string | null | undefined) => (v && v.trim() && v !== "Not specified" ? v.trim() : null);
const initials = (s: string) => s.replace(/[^A-Za-z0-9 ]/g, "").split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
const SQ_COLORS = ["#5B63E8", "#C4477A", "#1E9E6E", "#C9822B", "#16161E", "#2A8C8C", "#9B59C9"];
const colorFor = (s: string) => SQ_COLORS[[...s].reduce((n, c) => n + c.charCodeAt(0), 0) % SQ_COLORS.length];
const TAG_TONE: Record<string, string> = { work: "", avoid: "plain", place: "", pay: "mint", length: "amber", company: "rose", fit: "amber", speed: "mint", values: "rose", plan: "amber" };

const PROFILE_CSS = `
.ss .sec { background:#fff; border:1px solid var(--border); border-radius:20px; box-shadow:var(--sh-md); }
.ss .sec__head { display:flex; align-items:baseline; justify-content:space-between; gap:12px; padding:20px 22px 0; }
.ss .sec__head h2 { font-size:1.35rem; letter-spacing:-.025em; font-weight:600; margin:0; }
.ss .sec__head h2 em { font-family:var(--serif); font-style:italic; font-weight:400; color:var(--accent); }
.ss .sec__body { padding:16px 22px 22px; }
.ss .tl { position:relative; display:grid; gap:18px; }
.ss .tl__item { display:grid; grid-template-columns:44px 1fr; gap:14px; position:relative; }
.ss .tl__item:not(:last-child)::after { content:""; position:absolute; left:21px; top:48px; bottom:-14px; width:1px; background:var(--border-2); }
.ss .duration { display:inline-flex; align-items:center; gap:6px; font-family:var(--mono); font-size:10.5px; padding:2px 8px; border-radius:999px; background:var(--bg-2); color:var(--text-2); }
.ss .tilt-l { transform:rotate(-6deg) translateY(18px); }
.ss .tilt-r { transform:rotate(6deg) translateY(18px); }
@media (max-width: 860px) { .ss .tilt-l, .ss .tilt-r { transform:none; } }
.ss .seal { width:84px; height:84px; filter:drop-shadow(0 6px 10px rgba(18,20,45,.25)); }
`;

function Section({ title, right, children, tour }: { title: ReactNode; right?: ReactNode; children: ReactNode; tour?: string }) {
  return (
    <section className="sec" data-tour={tour} style={{ minWidth: 0, overflow: "hidden" }}>
      <div className="sec__head"><h2>{title}</h2>{right}</div>
      <div className="sec__body">{children}</div>
    </section>
  );
}

function Seal() {
  // A silver scalloped seal with a tick, like Tal's verified badge.
  const pts = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2, r = i % 2 ? 40 : 46;
    return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className="seal" aria-hidden="true">
      <defs>
        <linearGradient id="sealg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F2F2F6" /><stop offset=".45" stopColor="#B9BAC6" /><stop offset=".7" stopColor="#E4E4EC" /><stop offset="1" stopColor="#9A9BA9" />
        </linearGradient>
      </defs>
      <polygon points={pts} fill="url(#sealg)" stroke="#8E8FA0" strokeWidth=".8" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.2" />
      <path d="M37 51l9 9 18-20" fill="none" stroke="#F8F8FB" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProfilePage() {
  const { data: auth, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const welcome = params.get("welcome") === "1";
  const { setOrderId, setCandidateId, setCampaignId, setEmailAccountId, candidateId } = useOutreachStore();
  const [mounted, setMounted] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [orders, setOrders] = useState<OutreachOrder[] | null>(null);
  const [resumes, setResumes] = useState<{ id: string; name: string; updatedAt: string }[] | null>(null);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile | null>(null);
  const [candidateSignals, setCandidateSignals] = useState<TalentSignals>(EMPTY_SIGNALS);
  const [tab, setTab] = useState<"outreach" | "applications" | "resumes" | "support">("outreach");
  const [showAllExp, setShowAllExp] = useState(false);

  // edit
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({ fullName: "", college: "", yearOfStudy: "", course: "", github: "", linkedin: "", portfolio: "" });

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !isPending && !auth?.user) navigate("/auth?mode=signin&redirect=/profile");
  }, [mounted, isPending, auth?.user, navigate]);

  useEffect(() => {
    if (!auth?.user) return;
    fetch("/api/user/profile").then((r) => r.json()).then((d) => setProfile(d.profile ?? null)).catch(() => setProfile(null)).finally(() => setLoaded(true));
    fetch("/api/user/applications").then((r) => r.json()).then((d) => setApplications(Array.isArray(d?.applications) ? d.applications : [])).catch(() => setApplications([]));
    fetch("/api/career-coach/summary").then((r) => r.json()).then(setCoach).catch(() => setCoach(null));
    outreachFetch<{ orders?: Array<{ order?: OutreachOrder } & OutreachOrder> }>("/orders/list")
      .then((d) => setOrders((Array.isArray(d?.orders) ? d.orders : []).map((o) => (o as any).order ?? o)))
      .catch(() => setOrders([]));
    Promise.all([
      fetch("/api/v2/resumes").then((r) => r.json()).catch(() => ({ drafts: [] })),
      fetch("/api/resumes").then((r) => r.json()).catch(() => []),
    ]).then(([v2, v1]) => setResumes([
      ...(Array.isArray(v2?.drafts) ? v2.drafts : []).map((x: any) => ({ id: x.id, name: x.name, updatedAt: x.updatedAt ?? x.createdAt })),
      ...(Array.isArray(v1) ? v1 : []).map((x: any) => ({ id: x.id, name: x.name, updatedAt: x.updatedAt ?? x.createdAt })),
    ])).catch(() => setResumes([]));
  }, [auth?.user]);

  // The outreach profile (if any) adds what its profiling chat learned.
  useEffect(() => {
    if (!auth?.user) return;
    let cancelled = false;
    const load = (id: number) => outreachFetch<any>(`/candidate/${id}/profile`).then((d) => {
      if (cancelled) return;
      setResumeProfile(profileFromResume(d?.parsed_json));
      setCandidateSignals(signalsFromCandidate(d));
    }).catch(() => {});
    if (candidateId) load(candidateId);
    else outreachFetch<{ candidate_id: number | null }>("/candidate/latest", { maxRetries: 1 }).then((d) => { if (d?.candidate_id) void load(d.candidate_id); }).catch(() => {});
    return () => { cancelled = true; };
  }, [auth?.user, candidateId]);

  const t = profile?.talent ?? {};
  const prefs = t.prefs ?? {};
  const chat = t.chat ?? {};
  const signals = useMemo(() => mergeSignals(signalsFromTalent(t), candidateSignals), [t, candidateSignals]);

  const user = auth?.user;
  const emailPrefix = (user?.email ?? "").split("@")[0].toLowerCase();
  const accountName = user?.name && !user.name.includes("@") && user.name.trim().toLowerCase() !== emailPrefix ? user.name.trim() : null;
  const name = filled(profile?.fullName) ?? accountName ?? resumeProfile?.name ?? "Your profile";
  const [first, ...rest] = name.split(" ");
  const college = filled(profile?.college) ?? resumeProfile?.college ?? null;
  const course = filled(profile?.course) ?? resumeProfile?.course ?? null;
  const year = filled(profile?.yearOfStudy) ?? resumeProfile?.yearOfStudy ?? null;
  const city = t.resume?.city ?? null;
  const role = prefs.titles?.[0] ?? signals.targetRoles[0] ?? signals.roleFits[0]?.title ?? coach?.target_role ?? null;
  const lookingFor = role ? role.replace(/\s*intern(ship)?$/i, "") : prefs.clusters?.[0] ? `${prefs.clusters[0]} roles` : null;
  const exp = signals.experience;
  const links = profile?.links ?? null;
  const verified = !!user?.emailVerified;

  const openEdit = () => {
    setForm({
      fullName: name === "Your profile" ? "" : name, college: college ?? "", yearOfStudy: year ?? "", course: course ?? "",
      github: links?.github ?? "", linkedin: links?.linkedin ?? "", portfolio: links?.portfolio ?? "",
    });
    setSaveError("");
    setEditing(true);
  };
  const save = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const { github, linkedin, portfolio, ...basics } = form;
      const res = await fetch("/api/user/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...basics, links: { github, linkedin, portfolio } }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : "Couldn't save. Try again.");
      setProfile(data.profile ?? null);
      setEditing(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };
  const openOrder = async (orderId: number) => {
    try {
      const d = await outreachFetch<{ order_id: number; candidate_id?: number; campaign_id?: number; email_account_id?: number; redirect: string }>(`/orders/${orderId}/resume`);
      setOrderId(d.order_id);
      if (d.candidate_id) setCandidateId(d.candidate_id);
      if (d.campaign_id) setCampaignId(d.campaign_id);
      if (d.email_account_id) setEmailAccountId(d.email_account_id);
      navigate(d.redirect.startsWith("/outreach") ? d.redirect : `/outreach${d.redirect}`);
    } catch {
      navigate("/outreach/orders");
    }
  };

  if (!mounted || isPending || !user || !loaded) {
    return (
      <div className="ss" style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#FBFBFD" }}>
        <style>{SENSEI_CSS}</style>
        <span className="mono" style={{ fontSize: 12, color: "#8A8D9E" }}>loading your profile…</span>
      </div>
    );
  }

  const insights = (prefs.insights ?? []).filter((i) => i.kind !== "speed");
  const workRows = insights.filter((i) => ["work", "avoid", "fit"].includes(i.kind));
  const lifeRows = insights.filter((i) => !["work", "avoid", "fit"].includes(i.kind));
  const skills = (t.resume?.skills?.length ? t.resume.skills : signals.skills) ?? [];

  return (
    <div className="ss" style={{ position: "relative", minHeight: "100vh" }}>
      <style>{SENSEI_CSS + PROFILE_CSS}</style>
      <SenseiBackdrop trees={false} />

      <div style={{ position: "relative", zIndex: 1, padding: "14px 16px 64px" }}>
        {/* Nav pill */}
        <nav style={{ maxWidth: 1040, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, padding: "8px 8px 8px 16px", borderRadius: 999, background: "rgba(255,255,255,.82)", backdropFilter: "blur(14px)", border: "1px solid var(--border)", boxShadow: "0 12px 40px -24px rgba(18,20,45,.45)" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--ink)", textDecoration: "none" }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--ink)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 13 }}>S</span>
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-.02em" }}>studojo</span>
          </Link>
          <span className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>· profile</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button type="button" className="btn btn--ghost" style={{ padding: "9px 16px", fontSize: 14 }} onClick={openEdit} data-tour="edit">Edit</button>
            <Link to="/app" className="btn btn--dark" style={{ padding: "9px 16px", fontSize: 14 }} data-tour="to-agent">Talk to your agent →</Link>
          </div>
        </nav>

        {/* Welcome after signup: profile first, then the agent */}
        {welcome && (
          <div className="fade" style={{ maxWidth: 1040, margin: "16px auto 0", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 16, background: "var(--accent-soft)", border: "1px solid var(--accent-line)" }} data-tour="welcome">
            <span className="dot" />
            <span style={{ fontSize: 15 }}><strong style={{ fontWeight: 600 }}>Your profile is ready.</strong> This is what recruiters see. Next, your agent finds the people hiring for it.</span>
            <Link to="/app" className="btn btn--accent" style={{ marginLeft: "auto", padding: "10px 18px", fontSize: 14 }}>Meet your agent →</Link>
          </div>
        )}

        {/* Hero: big name, portrait between two tilted cards */}
        <header style={{ textAlign: "center", marginTop: 40 }} data-tour="hero">
          <h1 style={{ fontSize: "clamp(2.8rem, 7vw, 5.2rem)", letterSpacing: "-.04em", lineHeight: 1 }}>
            <em style={{ color: "var(--ink)" }}>{first?.toLowerCase()}</em> {rest.join(" ").toLowerCase()}
          </h1>
          {lookingFor && <p className="lead" style={{ margin: "14px auto 0" }}>Looking for <span style={{ color: "var(--ink)", fontWeight: 500 }}>{lookingFor}</span> roles{city ? <> · {city}</> : null}</p>}
        </header>

        <div style={{ maxWidth: 1040, margin: "34px auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", alignItems: "center", gap: 20 }}>
          {/* Left card: what they're after */}
          <div className="sec tilt-l" style={{ padding: 22, order: 0 }} data-tour="card-left">
            <span className="sq" style={{ width: 52, height: 52, borderRadius: 14, background: colorFor(exp[0]?.company || prefs.clusters?.[0] || "x"), fontSize: 18 }}>{initials(exp[0]?.company || prefs.clusters?.[0] || lookingFor || name)}</span>
            <div style={{ marginTop: 14, fontSize: 13.5, color: "var(--text-2)" }}>{exp[0]?.company || college || "Student"}</div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.025em", lineHeight: 1.15 }}>{exp[0]?.title || course || "Your next role"}</div>
            <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
              <div><div className="label">looking for</div><div style={{ fontSize: 15, fontWeight: 500 }}>{lookingFor ?? "Tell us in signup"}</div></div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}><div className="label">location</div><div style={{ fontSize: 15, fontWeight: 500 }}>{[city, ...(prefs.cities ?? []).filter((c) => c !== city)].filter(Boolean).slice(0, 3).join(", ") || "Anywhere"}</div></div>
            </div>
          </div>

          {/* Centre: portrait */}
          <div style={{ padding: 14, background: "#fff", borderRadius: 26, boxShadow: "var(--sh-lg)", border: "1px solid var(--border)", order: 1 }} data-tour="portrait">
            {user.image ? (
              <img src={user.image} alt="" referrerPolicy="no-referrer" style={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", borderRadius: 18, display: "block" }} />
            ) : (
              <div style={{ aspectRatio: "4 / 5", borderRadius: 18, display: "grid", placeItems: "center", position: "relative", overflow: "hidden",
                background: "radial-gradient(120% 90% at 30% 10%, #8E95F5 0%, #5B63E8 45%, #2E2F8C 100%)" }}>
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.18) 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
                <span style={{ position: "relative", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(5rem, 11vw, 7.5rem)", color: "#fff", letterSpacing: "-.02em" }}>{initials(name)}</span>
                <span className="mono" style={{ position: "absolute", bottom: 14, left: 16, fontSize: 11, color: "rgba(255,255,255,.75)" }}>{[course, year].filter(Boolean).join(" · ").toLowerCase()}</span>
              </div>
            )}
          </div>

          {/* Right card: verified */}
          <div className="sec tilt-r" style={{ padding: 22, textAlign: "center", order: 2 }} data-tour="card-right">
            <div style={{ display: "grid", placeItems: "center" }}><Seal /></div>
            <div style={{ marginTop: 14, fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.15, textTransform: "uppercase", letterSpacing: ".02em" }}>
              {verified ? <>{first} is a verified<br />Studojo student</> : <>{first}'s email<br />isn't verified yet</>}
            </div>
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
              {verified && <span className="tag mint">email verified</span>}
              {t.resume && <span className="tag">resume read</span>}
              {!!insights.length && <span className="tag rose">{insights.length} things learned</span>}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div style={{ maxWidth: 1040, margin: "56px auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 20, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
            {chat.proud && (
              <section className="sec" style={{ padding: "26px 26px 22px" }} data-tour="proud">
                <div className="label">proud of</div>
                <p style={{ margin: "8px 0 0", fontFamily: "var(--serif)", fontSize: 28, lineHeight: 1.2, letterSpacing: "-.01em" }}>“{chat.proud}”</p>
              </section>
            )}

            <Section title={<>What {first} is <em>looking for</em></>} tour="looking">
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  ["roles", (prefs.titles ?? []).slice(0, 3).join(", ") || lookingFor],
                  ["cities", (prefs.cities ?? []).join(", ")],
                  ["works", chat.workMode],
                  ["starts", chat.startWhen],
                  ["company", chat.companyStage ?? prefs.companyStage],
                  ["stipend", prefs.minMonthly ? `₹${Math.round(prefs.minMonthly / 1000)}k+ a month` : null],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k as string} style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 12, alignItems: "baseline" }}>
                    <span className="label">{k}</span>
                    <span style={{ fontSize: 15 }}>{v}</span>
                  </div>
                ))}
              </div>
              {!!chat.dreamCompanies?.length && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                  <div className="label" style={{ marginBottom: 10 }}>dream companies</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {chat.dreamCompanies.map((c) => (
                      <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 6px", border: "1px solid var(--border)", borderRadius: 999, background: "#fff" }}>
                        <span className="sq" style={{ width: 26, height: 26, borderRadius: 8, fontSize: 11, background: colorFor(c) }}>{initials(c)}</span>
                        <span style={{ fontSize: 14 }}>{c}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {!!(workRows.length + lifeRows.length) && (
              <Section title={<>What we <em>learned</em></>} right={<span className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>from {prefs.liked?.length ?? 0} kept · {prefs.passed?.length ?? 0} passed</span>} tour="learned">
                <div style={{ display: "grid", gap: 14 }}>
                  {[...workRows, ...lifeRows].map((i) => (
                    <div key={i.text} style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: 12 }}>
                      <span><span className={`tag ${TAG_TONE[i.kind] ?? ""}`}>{i.kind === "avoid" ? "not for you" : i.kind === "plan" ? "plans" : i.kind}</span></span>
                      <span>
                        <span style={{ display: "block", fontSize: 15, fontWeight: 500 }}>{i.text}</span>
                        <span className="mono" style={{ display: "block", fontSize: 11.5, color: "var(--text-3)" }}>{i.evidence}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
            <Section title={exp.length ? <>{exp.length} {exp.length === 1 ? "role" : "roles"} of <em>experience</em></> : <>Experience</>} tour="experience">
              {exp.length ? (
                <div className="tl">
                  {(showAllExp ? exp : exp.slice(0, 3)).map((e, i) => (
                    <div key={i} className="tl__item">
                      <span className="sq" style={{ width: 44, height: 44, borderRadius: 12, background: colorFor(e.company || e.title) }}>{initials(e.company || e.title)}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15.5 }}>{e.title}</div>
                        <div style={{ fontSize: 14, color: "var(--text-2)" }}>{e.company}</div>
                        {e.duration && <div style={{ marginTop: 6 }}><span className="duration">{e.duration}</span></div>}
                      </div>
                    </div>
                  ))}
                  {exp.length > 3 && <button type="button" className="link" onClick={() => setShowAllExp((x) => !x)} style={{ justifySelf: "start" }}>{showAllExp ? "Show less" : `Show ${exp.length - 3} more`}</button>}
                </div>
              ) : <p style={{ margin: 0, color: "var(--text-3)", fontSize: 14 }}>None yet. Your first role is what we're here for.</p>}
            </Section>

            <Section title="Education" tour="education">
              <div className="tl">
                <div className="tl__item">
                  <span className="sq" style={{ width: 44, height: 44, borderRadius: 12, background: colorFor(college ?? "c") }}>{initials(college ?? "?")}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15.5 }}>{college ?? "Add your college"}</div>
                    <div style={{ fontSize: 14, color: "var(--text-2)" }}>{course ?? ""}</div>
                    {year && <div style={{ marginTop: 6 }}><span className="duration">{year.toLowerCase()}</span></div>}
                  </div>
                </div>
              </div>
            </Section>

            {!!skills.length && (
              <Section title={<>{first}'s <em>stack</em></>} tour="stack">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))", gap: 10 }}>
                  {skills.slice(0, 12).map((s) => (
                    <div key={s} style={{ display: "grid", justifyItems: "center", gap: 8, padding: "14px 8px", border: "1px solid var(--border)", borderRadius: 14, background: "#fff" }}>
                      <span className="sq" style={{ width: 40, height: 40, borderRadius: 11, background: colorFor(s), fontSize: 12 }}>{s.replace(/[^A-Za-z0-9+#]/g, "").slice(0, 2).toUpperCase()}</span>
                      <span style={{ fontSize: 12.5, color: "var(--text-2)", textAlign: "center", lineHeight: 1.2 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {links?.github ? (
              <Section title={<>What {first}'s <em>shipped</em></>} tour="github"><GithubGraph handle={links.github} /></Section>
            ) : (
              <section className="sec" style={{ padding: 22, display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 14.5, color: "var(--text-2)" }}>Add your GitHub, LinkedIn or portfolio so recruiters see your work.</span>
                <button type="button" className="btn btn--ghost" style={{ padding: "8px 14px", fontSize: 13.5, marginLeft: "auto" }} onClick={openEdit}>Add links</button>
              </section>
            )}
          </div>
        </div>

        {/* Next: the agent */}
        <section className="sec" style={{ maxWidth: 1040, margin: "28px auto 0", padding: "26px 26px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18, background: "linear-gradient(120deg, #fff 0%, #F3F3FE 100%)" }} data-tour="next">
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="label">next</div>
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-.03em", marginTop: 4 }}>Your agent finds the people <em style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontWeight: 400, color: "var(--accent)" }}>hiring for this.</em></div>
            <p style={{ margin: "6px 0 0", color: "var(--text-2)", fontSize: 15 }}>It already knows everything on this page, so you just tell it where to start.</p>
          </div>
          <Link to="/app" className="btn btn--dark">Talk to your agent →</Link>
        </section>

        {/* Activity */}
        <section className="sec" style={{ maxWidth: 1040, margin: "20px auto 0", overflow: "hidden" }} data-tour="activity">
          <div className="panel__bar" style={{ gap: 4, padding: "6px 8px" }} role="tablist">
            {([["outreach", "Outreach", orders?.length], ["applications", "Applications", applications?.length], ["resumes", "Resumes", resumes?.length], ["support", "Support", undefined]] as const).map(([k, label, n]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                style={{ border: 0, cursor: "pointer", padding: "8px 14px", borderRadius: 10, font: "500 13.5px var(--sans)", background: tab === k ? "#fff" : "transparent", color: tab === k ? "var(--ink)" : "var(--text-3)", boxShadow: tab === k ? "var(--sh-sm)" : "none" }}>
                {label}{n ? <span className="mono" style={{ marginLeft: 6, fontSize: 11 }}>{n}</span> : null}
              </button>
            ))}
          </div>
          <div>
            {tab === "outreach" && (orders === null ? <div className="row mono" style={{ fontSize: 12, color: "var(--text-3)" }}>loading…</div> : orders.length === 0 ? (
              <div className="row" style={{ justifyContent: "space-between" }}><span style={{ color: "var(--text-2)", fontSize: 14 }}>No outreach yet.</span><Link to="/app" className="link">Start with your agent →</Link></div>
            ) : orders.map((o) => (
              <button key={o.id} type="button" className="row" onClick={() => openOrder(o.id)} style={{ width: "100%", background: "none", border: 0, borderBottom: "1px solid var(--border)", cursor: "pointer", font: "inherit", textAlign: "left" }}>
                <span style={{ fontWeight: 500 }}>Outreach #{o.id}</span>
                <span className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>{o.created_at ? new Date(o.created_at).toLocaleDateString() : ""}</span>
                <span className="tag" style={{ marginLeft: "auto" }}>{o.status.replace(/_/g, " ")}</span>
              </button>
            )))}
            {tab === "applications" && (applications === null ? <div className="row mono" style={{ fontSize: 12, color: "var(--text-3)" }}>loading…</div> : applications.length === 0 ? (
              <div className="row" style={{ justifyContent: "space-between" }}><span style={{ color: "var(--text-2)", fontSize: 14 }}>No applications yet.</span><Link to="/dojos/internships" className="link">Browse internships →</Link></div>
            ) : applications.map((a) => (
              <div key={a.id} className="row">
                <span className="sq" style={{ background: colorFor(a.internship?.companyName ?? "a") }}>{initials(a.internship?.companyName ?? "?")}</span>
                <span style={{ minWidth: 0, flex: 1 }}><span style={{ display: "block", fontWeight: 500 }}>{a.internship?.title}</span><span className="mono" style={{ display: "block", fontSize: 11.5, color: "var(--text-3)" }}>{a.internship?.companyName} · {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : ""}</span></span>
                <span className="tag">{a.status.replace(/_/g, " ")}</span>
              </div>
            )))}
            {tab === "resumes" && (
              <>
                <div className="row" style={{ justifyContent: "space-between" }}><span style={{ color: "var(--text-2)", fontSize: 14 }}>Build an ATS-ready resume with the AI resume maker.</span><Link to="/resume-maker" className="link">Open Resume Maker →</Link></div>
                {(resumes ?? []).map((r) => (
                  <Link key={r.id} to={`/resumes/${r.id}/edit`} className="row" style={{ textDecoration: "none", color: "inherit" }}>
                    <span style={{ fontWeight: 500 }}>{r.name || "Untitled"}</span>
                    <span className="mono" style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--text-3)" }}>{r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : ""}</span>
                  </Link>
                ))}
              </>
            )}
            {tab === "support" && <div style={{ padding: 18 }}><ProfileTickets /></div>}
          </div>
        </section>
      </div>

      {/* Edit */}
      {editing && (
        <div role="dialog" aria-modal="true" aria-label="Edit profile" style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(22,22,30,.35)", display: "grid", placeItems: "center", padding: 16 }} onClick={(e) => e.target === e.currentTarget && setEditing(false)}>
          <div className="panel fade" style={{ width: "100%", maxWidth: 560 }}>
            <div className="panel__bar"><span>edit profile</span><button type="button" className="link" style={{ marginLeft: "auto", fontSize: 12 }} onClick={() => setEditing(false)}>close</button></div>
            <form style={{ padding: 22, display: "grid", gap: 12 }} onSubmit={(e) => { e.preventDefault(); void save(); }}>
              {([["fullName", "Full name"], ["college", "College"], ["course", "Course"], ["yearOfStudy", "Year"], ["github", "GitHub username"], ["linkedin", "LinkedIn"], ["portfolio", "Portfolio"]] as [keyof typeof form, string][]).map(([k, label]) => (
                <label key={k} style={{ display: "grid", gap: 4 }}>
                  <span className="label">{label}</span>
                  <input id={`edit-${k}`} className="field" value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} />
                </label>
              ))}
              {saveError && <p style={{ margin: 0, color: "var(--rose)", fontSize: 14 }}>{saveError}</p>}
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button type="submit" className="btn btn--dark" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
                <button type="button" className="btn btn--ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
