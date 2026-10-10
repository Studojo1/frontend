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
 * /profile: the student's talent sheet, shown the way a recruiter would see
 * them in Sensei: identity with what's verified, a "why talk to them" note
 * written from their answers, signals and top matches, then the detail as
 * rows, in the sensei.studojo.com style used by /start. Everything comes from what
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
`;

function Section({ title, right, children, tour }: { title: ReactNode; right?: ReactNode; children: ReactNode; tour?: string }) {
  return (
    <section className="sec" data-tour={tour} style={{ minWidth: 0, overflow: "hidden" }}>
      <div className="sec__head"><h2>{title}</h2>{right}</div>
      <div className="sec__body">{children}</div>
    </section>
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
  const [first] = name.split(" ");
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
  // "Why talk to them", written in the third person from what signup learned.
  const third = (x: string) => x.replace(/^You'd /, `${first} would `).replace(/^You're /, `${first} is `).replace(/^You /, `${first} `).replace(/\byou\b/g, "them").replace(/\byour\b/g, "their");
  const values = insights.find((i) => i.kind === "values" && !/^Dream/.test(i.text));
  const pitch = [
    exp[0] ? `${exp[0].title}${exp[0].company ? ` at ${exp[0].company}` : ""}.` : course && college ? `${course} at ${college}.` : null,
    chat.proud ? `${chat.proud.replace(/\.$/, "")}.` : null,
    lookingFor ? `Wants ${lookingFor.toLowerCase()} roles${prefs.cities?.length ? ` in ${prefs.cities.slice(0, 2).join(" or ")}` : ""}${chat.workMode ? `, ${chat.workMode.toLowerCase()}` : ""}${chat.startWhen ? `, ${chat.startWhen === "Right away" ? "can start right away" : `starting ${chat.startWhen.toLowerCase()}`}` : ""}.` : null,
    values ? third(values.text) : null,
  ].filter(Boolean).join(" ") || "Finish signup and this fills in from your resume and swipes.";
  const signalTags: [string, string][] = [
    ...(prefs.clusters?.[0] ? [[`into ${prefs.clusters[0].toLowerCase()}`, ""] as [string, string]] : []),
    ...(insights.some((i) => /move for the right role|move to/.test(i.text)) ? [["would relocate", ""] as [string, string]] : insights.some((i) => /rather stay/.test(i.text)) ? [["stays local", "plain"] as [string, string]] : []),
    ...(chat.companyStage ? [[chat.companyStage.toLowerCase(), "rose"] as [string, string]] : []),
    ...(prefs.minMonthly ? [[`₹${Math.round(prefs.minMonthly / 1000)}k+ / month`, "mint"] as [string, string]] : insights.some((i) => /work matters more to you than the stipend/.test(i.text)) ? [["work over stipend", "mint"] as [string, string]] : []),
    ...(chat.startWhen ? [[chat.startWhen.toLowerCase(), "amber"] as [string, string]] : []),
    ...(insights.some((i) => /mentor/.test(i.text)) ? [["wants a mentor", "rose"] as [string, string]] : []),
  ];
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

        {/* Talent sheet: how a recruiter sees them in Sensei */}
        <main className="panel fade" style={{ maxWidth: 1040, margin: "24px auto 0" }} data-tour="sheet">
          <div className="panel__bar">
            <span style={{ display: "flex", gap: 5 }} aria-hidden="true">{[0, 1, 2].map((i) => <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#DCDCE6" }} />)}</span>
            <span style={{ marginLeft: 6 }}>studojo · talent sheet · {name.toLowerCase().replace(/\s+/g, "-")}</span>
            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7 }}><span className="dot" />live</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 330px), 1fr))" }}>
            {/* Identity */}
            <div style={{ padding: 26, borderRight: "1px solid var(--border)", display: "grid", gap: 18, alignContent: "start" }} data-tour="identity">
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {user.image ? (
                  <img src={user.image} alt="" referrerPolicy="no-referrer" style={{ width: 84, height: 84, borderRadius: 20, objectFit: "cover", boxShadow: "var(--sh-md)" }} />
                ) : (
                  <span style={{ width: 84, height: 84, borderRadius: 20, display: "grid", placeItems: "center", flexShrink: 0, color: "#fff", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 40,
                    background: "radial-gradient(120% 100% at 25% 15%, #8E95F5 0%, #5B63E8 50%, #3A3FB0 100%)", boxShadow: "var(--sh-md)" }}>{initials(name)}</span>
                )}
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.2rem)" }}>{name}</h1>
                  {lookingFor && <div style={{ fontSize: 17, marginTop: 2 }}>Aspiring <em className="em">{lookingFor.toLowerCase()}</em></div>}
                </div>
              </div>
              <div className="mono" style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.7 }}>
                {[course, college, year].filter(Boolean).join(" · ").toLowerCase()}
                {city && <><br />based in {city.toLowerCase()}</>}
              </div>
              <div className="tile" style={{ overflow: "hidden" }} data-tour="verified">
                {[
                  ["email", user.email, verified ? "verified" : "unverified", verified ? "mint" : "amber"],
                  ["resume", t.resume ? "read at signup" : "not uploaded", t.resume ? "read" : "missing", t.resume ? "" : "amber"],
                  ["answers", `${(prefs.liked?.length ?? 0) + (prefs.passed?.length ?? 0)} roles judged`, insights.length ? "learned" : "pending", insights.length ? "" : "plain"],
                  ["github", links?.github ? `@${links.github}` : "not linked", links?.github ? "linked" : "add", links?.github ? "" : "plain"],
                ].map(([k, v, status, tone]) => (
                  <div key={k as string} className="row" style={{ padding: "10px 14px", gap: 10 }}>
                    <span className="label" style={{ width: 62 }}>{k}</span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v}</span>
                    {status === "add" ? <button type="button" className="link" style={{ fontSize: 12.5 }} onClick={openEdit}>add</button> : <span className={`tag ${tone}`}>{status}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Why talk to them + matches */}
            <div style={{ padding: 26, display: "grid", gap: 18, alignContent: "start" }}>
              <div style={{ padding: "16px 18px", borderRadius: 14, background: "var(--accent-soft)", border: "1px solid var(--accent-line)" }} data-tour="why">
                <div className="label" style={{ color: "var(--accent-deep)" }}>why talk to {first?.toLowerCase()}</div>
                <p style={{ margin: "6px 0 0", fontSize: 15.5, lineHeight: 1.55 }}>{pitch}</p>
              </div>
              {!!signalTags.length && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }} data-tour="signals">
                  {signalTags.map(([text, tone]) => <span key={text} className={`tag ${tone}`}>{text}</span>)}
                </div>
              )}
              {!!prefs.best?.length && (
                <div>
                  <div className="label" style={{ marginBottom: 8 }}>top matches for {first?.toLowerCase()}</div>
                  <div className="tile" style={{ overflow: "hidden" }} data-tour="matches">
                    {prefs.best.map((m) => (
                      <a key={m.slug} href={`/internships/${m.slug}`} target="_blank" rel="noopener" className="row" style={{ textDecoration: "none", color: "inherit" }}>
                        <span className="sq" style={{ background: colorFor(m.company) }}>{initials(m.company)}</span>
                        <span style={{ minWidth: 0, flex: 1 }}>
                          <span style={{ display: "block", fontWeight: 500, fontSize: 14.5 }}>{m.title}</span>
                          <span className="mono" style={{ display: "block", fontSize: 11.5, color: "var(--text-3)" }}>{m.company} · {(m.city ?? "remote").toLowerCase()}</span>
                        </span>
                        <span style={{ fontWeight: 600, fontSize: 17 }}>{m.match}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* The sheet's detail, as rows */}
        <div style={{ maxWidth: 1040, margin: "20px auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 20, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
            <Section title="Wants" tour="wants">
              <div className="tile" style={{ overflow: "hidden" }}>
                {[
                  ["roles", (prefs.titles ?? []).slice(0, 3).join(", ") || lookingFor],
                  ["cities", (prefs.cities ?? []).join(", ")],
                  ["works", chat.workMode],
                  ["starts", chat.startWhen],
                  ["company", chat.companyStage ?? prefs.companyStage],
                  ["stipend", prefs.minMonthly ? `₹${Math.round(prefs.minMonthly / 1000)}k+ a month` : null],
                  ["dream", chat.dreamCompanies?.join(", ")],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k as string} className="row" style={{ padding: "11px 14px" }}>
                    <span className="label" style={{ width: 70, flexShrink: 0 }}>{k}</span>
                    <span style={{ fontSize: 14.5 }}>{v}</span>
                  </div>
                ))}
              </div>
            </Section>

            {!!(workRows.length + lifeRows.length) && (
              <Section title={<>What we <em>learned</em></>} right={<span className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>{prefs.liked?.length ?? 0} kept · {prefs.passed?.length ?? 0} passed</span>} tour="learned">
                <div className="tile" style={{ overflow: "hidden" }}>
                  {[...workRows, ...lifeRows].map((i) => (
                    <div key={i.text} className="row" style={{ alignItems: "flex-start", padding: "11px 14px" }}>
                      <span style={{ width: 84, flexShrink: 0 }}><span className={`tag ${TAG_TONE[i.kind] ?? ""}`}>{i.kind === "avoid" ? "not for you" : i.kind === "plan" ? "plans" : i.kind}</span></span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 14.5, fontWeight: 500 }}>{i.text}</span>
                        <span className="mono" style={{ display: "block", fontSize: 11.5, color: "var(--text-3)" }}>{i.evidence}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
            <Section title="Experience" tour="experience">
              <div className="tile" style={{ overflow: "hidden" }}>
                {exp.length ? (showAllExp ? exp : exp.slice(0, 4)).map((e, i) => (
                  <div key={i} className="row" style={{ padding: "11px 14px" }}>
                    <span className="sq" style={{ width: 32, height: 32, borderRadius: 9, fontSize: 11.5, background: colorFor(e.company || e.title) }}>{initials(e.company || e.title)}</span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: "block", fontWeight: 500, fontSize: 14.5 }}>{e.title}</span>
                      <span className="mono" style={{ display: "block", fontSize: 11.5, color: "var(--text-3)" }}>{(e.company || "").toLowerCase()}{e.duration ? ` · ${e.duration.toLowerCase()}` : ""}</span>
                    </span>
                  </div>
                )) : <div className="row" style={{ color: "var(--text-3)", fontSize: 14 }}>None yet. Your first role is what we're here for.</div>}
                {exp.length > 4 && <div className="row"><button type="button" className="link" onClick={() => setShowAllExp((x) => !x)}>{showAllExp ? "Show less" : `Show ${exp.length - 4} more`}</button></div>}
              </div>
            </Section>

            <Section title="Education" tour="education">
              <div className="tile" style={{ overflow: "hidden" }}>
                <div className="row" style={{ padding: "11px 14px" }}>
                  <span className="sq" style={{ width: 32, height: 32, borderRadius: 9, fontSize: 11.5, background: colorFor(college ?? "c") }}>{initials(college ?? "?")}</span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: "block", fontWeight: 500, fontSize: 14.5 }}>{college ?? "Add your college"}</span>
                    <span className="mono" style={{ display: "block", fontSize: 11.5, color: "var(--text-3)" }}>{[course, year].filter(Boolean).join(" · ").toLowerCase()}</span>
                  </span>
                </div>
              </div>
            </Section>

            {!!skills.length && (
              <Section title="Skills" tour="stack">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {skills.map((s) => <span key={s} className="tag plain" style={{ fontSize: 11.5, padding: "4px 10px" }}>{s.toLowerCase()}</span>)}
                </div>
              </Section>
            )}

            {links?.github && <Section title={<>Recent <em>work</em></>} tour="github"><GithubGraph handle={links.github} /></Section>}
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
