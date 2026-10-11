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
 * /profile: the student's profile as one quiet column. Name, headline and
 * status, then labelled rows: About (theirs, or a first-person draft from
 * signup), Experience, Education, Skills, what they're looking for, code and
 * links. Below it, the private part: the agent and activity. After signup
 * (?welcome=1) it leads on to the agent chat in /app.
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
const PROFILE_CSS = `
.ss .pf-col { max-width:680px; margin-left:auto; margin-right:auto; }
.ss .pf-nav { max-width:680px; margin:0 auto; display:flex; align-items:center; gap:14px; padding:7px 7px 7px 14px; border-radius:999px; background:rgba(255,255,255,.82); backdrop-filter:blur(14px); border:1px solid var(--border); }
.ss .pf-card { background:#fff; border:1px solid var(--border); border-radius:20px; box-shadow:var(--sh-md); }
.ss main.pf-card { margin-top:20px; padding:36px 40px 12px; }
.ss .pf-meta { display:flex; flex-wrap:wrap; gap:4px 14px; font-size:12px; color:var(--text-3); }
.ss .pf-row { display:grid; grid-template-columns:118px 1fr; gap:6px 20px; padding:22px 0; border-top:1px solid var(--border); font-size:15px; line-height:1.6; }
.ss header + .pf-row { margin-top:28px; }
.ss .pf-row > h2 { margin:0; font:500 12px/1.9 var(--mono); color:var(--text-3); letter-spacing:0; }
.ss .pf-row > div { min-width:0; }
.ss .pf-note { display:block; margin-top:8px; font-size:13px; }
.ss .pf-item { display:flex; justify-content:space-between; align-items:baseline; gap:16px; }
.ss .pf-date { flex-shrink:0; font-size:12px; color:var(--text-3); }
.ss .pf-dl { margin:0; display:grid; gap:6px; }
.ss .pf-dl > div { display:grid; grid-template-columns:64px 1fr; gap:12px; }
.ss .pf-dl dt { font-size:12px; line-height:1.9; color:var(--text-3); }
.ss .pf-dl dd { margin:0; }
.ss .pf-link { display:grid; grid-template-columns:64px 1fr; gap:12px; color:var(--ink); text-decoration:none; }
.ss .pf-link .mono { font-size:12px; line-height:1.9; color:var(--text-3); }
.ss .pf-link:hover span:last-child { color:var(--accent); }
@media (max-width:560px) {
  .ss main.pf-card { padding:26px 20px 6px; }
  .ss .pf-row { grid-template-columns:1fr; }
}
`;

/** One labelled section of the profile: small mono label left, content right. */
function PfRow({ label, children, tour }: { label: string; children: ReactNode; tour?: string }) {
  return (
    <section className="pf-row" data-tour={tour}>
      <h2>{label}</h2>
      <div>{children}</div>
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
  // GitHub contributions this year; the Code row hides when it is 0 or fails.
  const [ghTotal, setGhTotal] = useState<number | null | undefined>(undefined);

  // edit
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({ about: "", fullName: "", college: "", yearOfStudy: "", course: "", github: "", linkedin: "", portfolio: "" });

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
  const college = filled(profile?.college) ?? resumeProfile?.college ?? null;
  const course = filled(profile?.course) ?? resumeProfile?.course ?? null;
  const year = filled(profile?.yearOfStudy) ?? resumeProfile?.yearOfStudy ?? null;
  const city = t.resume?.city ?? null;
  const role = prefs.titles?.[0] ?? signals.targetRoles[0] ?? signals.roleFits[0]?.title ?? coach?.target_role ?? null;
  const lookingFor = role ? role.replace(/\s*intern(ship)?$/i, "") : prefs.clusters?.[0] ? `${prefs.clusters[0]} roles` : null;
  const exp = signals.experience;
  const links = profile?.links ?? null;

  const openEdit = () => {
    setForm({
      about: t.about ?? "", fullName: name === "Your profile" ? "" : name, college: college ?? "", yearOfStudy: year ?? "", course: course ?? "",
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

  // About: what they wrote, or a first-person draft from what signup learned.
  const where = prefs.cities?.length ? ` in ${prefs.cities.slice(0, 2).join(" or ")}` : "";
  const draftAbout = [
    course && college ? `I'm studying ${course} at ${college}.` : college ? `I'm a student at ${college}.` : null,
    exp[0] ? `Most recently I was ${/^[aeiou]/i.test(exp[0].title) ? "an" : "a"} ${exp[0].title}${exp[0].company ? ` at ${exp[0].company}` : ""}.` : null,
    chat.proud ? `${chat.proud.replace(/\.$/, "")}.` : null,
    prefs.workStyle?.[0] ? `I'm happiest ${prefs.workStyle[0]}${prefs.industries?.[0] ? `, especially in ${prefs.industries[0].toLowerCase()}` : ""}.` : null,
    lookingFor ? `Now looking for ${lookingFor.toLowerCase()} internships${where}.` : null,
  ].filter(Boolean).join(" ");
  const about = t.about?.trim() || draftAbout;
  const isDraft = !t.about?.trim() && !!draftAbout;
  const headline = exp[0] ? `${exp[0].title}${exp[0].company ? ` at ${exp[0].company}` : ""}` : course ?? (lookingFor ? `Aspiring ${lookingFor.toLowerCase()}` : null);
  const skills = (t.resume?.skills?.length ? t.resume.skills : signals.skills) ?? [];
  const startLabel = chat.startWhen ? (chat.startWhen === "Right away" ? "can start now" : `from ${chat.startWhen.toLowerCase()}`) : null;
  const wants: [string, string | null | undefined][] = [
    ["Roles", (prefs.titles ?? []).slice(0, 3).join(", ") || lookingFor],
    ["Where", [...(prefs.cities ?? []), chat.workMode].filter(Boolean).join(", ")],
    ["Start", chat.startWhen],
    ["Industry", prefs.industries?.join(", ")],
    ["Teams", chat.companyStage ?? prefs.companyStage],
    ["Dream", chat.dreamCompanies?.join(", ")],
  ];
  const linkRows: [string, string, string][] = [
    ...(links?.github ? [["GitHub", `github.com/${links.github}`, `https://github.com/${links.github}`] as [string, string, string]] : []),
    ...(links?.linkedin ? [["LinkedIn", links.linkedin.replace(/^https?:\/\/(www\.)?/, ""), links.linkedin.startsWith("http") ? links.linkedin : `https://${links.linkedin}`] as [string, string, string]] : []),
    ...(links?.portfolio ? [["Website", links.portfolio.replace(/^https?:\/\/(www\.)?/, ""), links.portfolio.startsWith("http") ? links.portfolio : `https://${links.portfolio}`] as [string, string, string]] : []),
  ];

  return (
    <div className="ss" style={{ position: "relative", minHeight: "100vh" }}>
      <style>{SENSEI_CSS + PROFILE_CSS}</style>
      <SenseiBackdrop trees={false} />

      <div style={{ position: "relative", zIndex: 1, padding: "14px 16px 72px" }}>
        <nav className="pf-nav">
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--ink)", textDecoration: "none" }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--ink)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 13 }}>S</span>
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-.02em" }}>studojo</span>
          </Link>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button type="button" className="btn btn--ghost" style={{ padding: "8px 15px", fontSize: 14 }} onClick={openEdit} data-tour="edit">Edit</button>
            <Link to="/app" className="btn btn--dark" style={{ padding: "8px 15px", fontSize: 14 }} data-tour="to-agent">Your agent →</Link>
          </div>
        </nav>

        {welcome && (
          <div className="fade pf-col" style={{ marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: 14, background: "var(--accent-soft)", border: "1px solid var(--accent-line)" }} data-tour="welcome">
            <span style={{ fontSize: 14.5, flex: 1, minWidth: 220 }}><strong style={{ fontWeight: 600 }}>Your profile is ready.</strong> Read it over, then your agent starts finding people who are hiring.</span>
            <Link to="/app" className="btn btn--accent" style={{ padding: "9px 16px", fontSize: 14 }}>Meet your agent →</Link>
          </div>
        )}

        <main className="pf-col pf-card fade" data-tour="sheet">
          {/* Identity */}
          <header style={{ display: "grid", gap: 14 }} data-tour="identity">
            {user.image ? (
              <img src={user.image} alt="" referrerPolicy="no-referrer" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <span aria-hidden="true" style={{ width: 64, height: 64, borderRadius: "50%", display: "grid", placeItems: "center", color: "var(--accent-deep)", background: "var(--accent-soft)", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 28 }}>{initials(name)}</span>
            )}
            <div>
              <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2rem)", margin: 0 }}>{name}</h1>
              {headline && <p style={{ margin: "4px 0 0", fontSize: 16.5, color: "var(--text-2)" }}>{headline}</p>}
            </div>
            <div className="mono pf-meta">
              {[city, college].filter(Boolean).join("  ·  ")}
            </div>
            {lookingFor && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }} data-tour="status">
                <span className="dot" />
                <span>Open to {lookingFor.toLowerCase()} internships{startLabel ? `, ${startLabel}` : ""}</span>
              </div>
            )}
          </header>

          <PfRow label="About" tour="about">
            {about ? (
              <>
                <p style={{ margin: 0, whiteSpace: "pre-line" }}>{about}</p>
                {isDraft && <button type="button" className="link pf-note" onClick={openEdit}>We drafted this from your signup. Make it yours →</button>}
              </>
            ) : <button type="button" className="link" onClick={openEdit}>Write a few lines about yourself</button>}
          </PfRow>

          <PfRow label="Experience" tour="experience">
            {exp.length ? (
              <div style={{ display: "grid", gap: 14 }}>
                {(showAllExp ? exp : exp.slice(0, 4)).map((e, i) => (
                  <div key={i} className="pf-item">
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500 }}>{e.title || e.company}</div>
                      {e.title && e.company && <div style={{ color: "var(--text-2)" }}>{e.company}</div>}
                    </div>
                    {e.duration && <span className="mono pf-date">{e.duration}</span>}
                  </div>
                ))}
                {exp.length > 4 && <button type="button" className="link" style={{ justifySelf: "start" }} onClick={() => setShowAllExp((x) => !x)}>{showAllExp ? "Show less" : `Show ${exp.length - 4} more`}</button>}
              </div>
            ) : <span style={{ color: "var(--text-3)" }}>No roles yet.</span>}
          </PfRow>

          <PfRow label="Education" tour="education">
            {college ? (
              <div className="pf-item">
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{college}</div>
                  {course && <div style={{ color: "var(--text-2)" }}>{course}</div>}
                </div>
                {year && <span className="mono pf-date">{year}</span>}
              </div>
            ) : <button type="button" className="link" onClick={openEdit}>Add your college</button>}
          </PfRow>

          {!!skills.length && <PfRow label="Skills" tour="stack"><p style={{ margin: 0 }}>{skills.slice(0, 14).join(", ")}</p></PfRow>}

          {wants.some(([, v]) => v) && (
            <PfRow label="Looking for" tour="wants">
              <dl className="pf-dl">
                {wants.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="mono">{k}</dt><dd>{v}</dd></div>)}
              </dl>
            </PfRow>
          )}

          {links?.github && (
            <div hidden={!ghTotal}>
              <PfRow label="Code" tour="github"><GithubGraph handle={links.github} onTotal={setGhTotal} /></PfRow>
            </div>
          )}

          <PfRow label="Links" tour="links">
            {linkRows.length ? (
              <div style={{ display: "grid", gap: 6 }}>
                {linkRows.map(([k, text, href]) => (
                  <a key={k} href={href} target="_blank" rel="noopener noreferrer" className="pf-link"><span className="mono">{k}</span><span>{text} ↗</span></a>
                ))}
              </div>
            ) : <button type="button" className="link" onClick={openEdit}>Add GitHub, LinkedIn or a website</button>}
          </PfRow>
        </main>

        {/* Private: only the student sees this part */}
        <div className="pf-col" style={{ marginTop: 40 }}>
          <div className="mono" style={{ fontSize: 11.5, color: "var(--text-3)", margin: "0 0 12px 2px" }}>Only you can see this</div>
          <section className="pf-card" style={{ padding: "18px 20px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }} data-tour="next">
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Your agent has read this profile</div>
              <div style={{ color: "var(--text-2)", fontSize: 14.5, marginTop: 2 }}>Tell it where to start and it finds the people hiring.</div>
            </div>
            <Link to="/app" className="btn btn--dark" style={{ padding: "9px 16px", fontSize: 14 }}>Open your agent →</Link>
          </section>

          <section className="pf-card" style={{ marginTop: 14, padding: 0, overflow: "hidden" }} data-tour="activity">
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
      </div>

      {/* Edit */}
      {editing && (
        <div role="dialog" aria-modal="true" aria-label="Edit profile" style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(22,22,30,.35)", display: "grid", placeItems: "center", padding: 16 }} onClick={(e) => e.target === e.currentTarget && setEditing(false)}>
          <div className="panel fade" style={{ width: "100%", maxWidth: 560 }}>
            <div className="panel__bar"><span>edit profile</span><button type="button" className="link" style={{ marginLeft: "auto", fontSize: 12 }} onClick={() => setEditing(false)}>close</button></div>
            <form style={{ padding: 22, display: "grid", gap: 12 }} onSubmit={(e) => { e.preventDefault(); void save(); }}>
              {([["fullName", "Full name"], ["college", "College"], ["course", "Course"], ["yearOfStudy", "Year"], ["github", "GitHub username"], ["linkedin", "LinkedIn"], ["portfolio", "Portfolio"]] as [Exclude<keyof typeof form, "about">, string][]).map(([k, label]) => (
                <label key={k} style={{ display: "grid", gap: 4 }}>
                  <span className="label">{label}</span>
                  <input id={`edit-${k}`} className="field" value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} />
                </label>
              ))}
              <label style={{ display: "grid", gap: 4 }}>
                <span className="label">About</span>
                <textarea id="edit-about" className="field" rows={4} maxLength={600} value={form.about} placeholder={draftAbout || "A few lines in your own words"} onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))} style={{ resize: "vertical", fontFamily: "inherit" }} />
              </label>
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
