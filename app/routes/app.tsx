import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import { ProfileChat, type ChatAnswers } from "~/components/start/profile-chat";
import { RoleMap, type MapPlace } from "~/components/start/role-map";
import type { TalentStore } from "../../auth-schema";

/**
 * /app: the student's Studojo app, in the same layout as the Sensei app
 * (chats on the left, the conversation in the middle, a live panel on the
 * right). Signup (/start) hands off here, and the first conversation is
 * "Getting to know you": a one-minute chat for what a resume and swipes
 * can't tell us. The right panel shows setup progress and the profile as
 * answers land.
 */

export function meta() {
  return [{ title: "Studojo" }];
}

type Profile = {
  fullName: string | null;
  college: string | null;
  course: string | null;
  yearOfStudy: string | null;
  talent: TalentStore | null;
};
type GlobeCity = { name: string; lat: number; lng: number; openRoles: number };
type GlobeData = { home: { name: string; lat: number; lng: number } | null; cities: GlobeCity[] };

const filled = (v: string | null | undefined) => (v && v.trim() && v !== "Not specified" ? v : null);

const CSS = `
@font-face { font-family: "Geist"; src: url(/fonts/geist/Geist-Variable.woff2) format("woff2"); font-weight: 100 900; font-display: swap; }
@font-face { font-family: "Geist Mono"; src: url(/fonts/geist/GeistMono-Variable.woff2) format("woff2"); font-weight: 100 900; font-display: swap; }
.ap {
  --bg: #FBFBFD; --panel: #FFFFFF; --ink: #16161E; --ink-2: #3A3A4A; --muted: #6B6B80; --faint: #9A9AAD;
  --line: #E7E7EF; --line-2: #F1F1F6; --indigo: #5B63E8; --indigo-ink: #4349C9; --indigo-soft: #EEEFFD;
  --green: #12A672; --green-soft: #E7F7F0; --amber: #D98A00; --amber-soft: #FFF5E0;
  --sans: "Geist", -apple-system, "Segoe UI", system-ui, sans-serif; --mono: "Geist Mono", ui-monospace, Menlo, monospace;
  font-family: var(--sans); color: var(--ink); background: var(--bg); height: 100dvh; display: grid; grid-template-columns: 1fr;
}
@media (min-width: 1100px) { .ap { grid-template-columns: 260px minmax(0, 1fr) 400px; } }
.ap *:focus-visible { outline: 2px solid var(--indigo); outline-offset: 2px; border-radius: 8px; }
.ap-mono { font-family: var(--mono); font-variant-numeric: tabular-nums; }
.ap-label { font-family: var(--mono); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--faint); }
.ap-side { display: none; border-right: 1px solid var(--line); background: var(--panel); padding: 16px 12px; flex-direction: column; gap: 14px; min-height: 0; }
@media (min-width: 1100px) { .ap-side { display: flex; } .ap-right { display: flex !important; } }
.ap-main { display: flex; flex-direction: column; min-height: 0; min-width: 0;
  background-image: radial-gradient(circle at 1px 1px, #E2E2EC 1px, transparent 0); background-size: 22px 22px; }
.ap-top { height: 56px; flex-shrink: 0; display: flex; align-items: center; gap: 12px; padding: 0 20px; border-bottom: 1px solid var(--line); background: var(--panel); }
.ap-right { display: none; flex-direction: column; gap: 12px; border-left: 1px solid var(--line); background: var(--bg); padding: 16px; overflow-y: auto; min-height: 0; }
.ap-card { background: var(--panel); border: 1px solid var(--line); border-radius: 16px; box-shadow: 0 1px 2px rgba(22,22,30,.04), 0 8px 24px rgba(22,22,30,.04); }
.ap-pill { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--line); background: var(--panel); font: 600 12px var(--sans); color: var(--ink-2); }
.ap-chip { display: inline-flex; align-items: center; height: 24px; padding: 0 9px; border-radius: 999px; font: 500 12px var(--sans); background: var(--line-2); color: var(--ink-2); }
.ap-nav { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 10px; font-size: 14px; color: var(--ink-2); text-decoration: none; }
.ap-nav.on { background: var(--indigo-soft); color: var(--ink); font-weight: 600; }
.ap-nav.off { color: var(--faint); }
.ap-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; padding: 0 16px; border-radius: 12px; font: 600 14px var(--sans); border: 0; cursor: pointer; text-decoration: none; background: var(--ink); color: #fff; }
.ap-btn.indigo { background: var(--indigo); } .ap-btn.ghost { background: var(--panel); color: var(--ink); border: 1px solid var(--line); }
.ap-bubble { max-width: 78%; padding: 11px 15px; border-radius: 16px; border-top-left-radius: 6px; background: var(--panel); border: 1px solid var(--line); font-size: 15px; line-height: 1.5; color: var(--ink); box-shadow: 0 1px 2px rgba(22,22,30,.04); }
.ap-bubble.me { background: var(--ink); color: #fff; border-color: var(--ink); border-top-left-radius: 16px; border-top-right-radius: 6px; }
.ap-reply { height: 34px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--panel); font: 600 13px var(--sans); color: var(--ink); cursor: pointer; transition: border-color .15s, background .15s; }
.ap-reply:hover { border-color: var(--indigo); background: var(--indigo-soft); }
.ap-reply.on { border-color: var(--indigo); background: var(--indigo); color: #fff; }
.ap-composer { display: flex; align-items: center; gap: 8px; background: var(--panel); border: 1px solid var(--line); border-radius: 16px; padding: 8px 8px 8px 16px; box-shadow: 0 8px 24px rgba(22,22,30,.06); }
.ap-composer input { flex: 1; min-width: 0; border: 0; outline: none; font: 400 15px var(--sans); background: transparent; color: var(--ink); height: 36px; }
.ap-composer button { height: 38px; min-width: 44px; padding: 0 12px; border-radius: 11px; border: 0; background: var(--indigo); color: #fff; font: 600 14px var(--sans); cursor: pointer; }
.ap-composer button:disabled { background: #C9CBEF; cursor: default; }
@keyframes apPop { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
.ap-pop { animation: apPop .3s ease both; }
@keyframes apDot { 0%, 80%, 100% { opacity: .25 } 40% { opacity: 1 } }
.ap-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); animation: apDot 1s infinite; }
@keyframes apSpin { to { transform: rotate(360deg) } }
.ap-spin { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--indigo-soft); border-top-color: var(--indigo); animation: apSpin .8s linear infinite; }
@media (prefers-reduced-motion: reduce) { .ap-pop, .ap-dot, .ap-spin { animation: none } }
`;

const Tick = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="#12A672" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Lock = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="3.5" y="7" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5.5 7V5.5a2.5 2.5 0 015 0V7" stroke="currentColor" strokeWidth="1.4" /></svg>
);

export default function AppHome() {
  const navigate = useNavigate();
  const { data: auth, isPending } = authClient.useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [globe, setGlobe] = useState<GlobeData | null>(null);
  const [chat, setChat] = useState<ChatAnswers>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isPending && !auth?.user) navigate("/start", { replace: true });
  }, [isPending, auth?.user, navigate]);

  useEffect(() => {
    if (!auth?.user) return;
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        const p = (d?.profile ?? null) as Profile | null;
        setProfile(p ?? { fullName: null, college: null, course: null, yearOfStudy: null, talent: null });
        if (p?.talent?.chat) setChat(p.talent.chat);
        const q = new URLSearchParams({ home: p?.talent?.resume?.city ?? p?.college ?? "", cities: (p?.talent?.prefs?.cities ?? []).join("|") });
        return fetch(`/api/profile/globe?${q}`).then((r) => (r.ok ? r.json() : null)).then(setGlobe);
      })
      .catch(() => setProfile({ fullName: null, college: null, course: null, yearOfStudy: null, talent: null }));
  }, [auth?.user]);

  const t = profile?.talent ?? {};
  const prefs = t.prefs ?? {};
  const resume = t.resume ?? {};
  const name = filled(profile?.fullName) ?? auth?.user?.name ?? "";
  const firstName = name.split(" ")[0] || "there";
  const initials = name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const line = [filled(profile?.course), filled(profile?.college), filled(profile?.yearOfStudy)].filter(Boolean).join(" · ");
  const openRoles = (globe?.cities ?? []).reduce((n, c) => n + c.openRoles, 0);
  const chatCount = Object.values(chat).filter((v) => (Array.isArray(v) ? v.length : !!v)).length;
  const alreadyDone = !!t.chat && !done;

  // Open with what the swipes taught us, in their words, so the chat never re-asks.
  // One natural sentence from the strongest findings (kind of work, place, pay).
  const pickKind = (k: string) => (prefs.insights ?? []).find((i) => i.kind === k && !/^Especially/.test(i.text));
  const parts = ["work", "place", "pay", "company"]
    .map(pickKind)
    .filter((i): i is { kind: string; text: string; evidence: string } => !!i)
    .slice(0, 3)
    .map((i) => i.text.replace(/\.$/, "").replace(/, and you loved one$/, "").replace(/^You/, "you").replace(/^Pay/, "pay"));
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0];
  const summary = list
    ? `From your swipes I learned ${list}.${prefs.cities?.length ? ` You'd work in ${prefs.cities.slice(0, 3).join(", ")}.` : ""} I won't ask about any of that again.`
    : "I've got your resume, so I won't ask you anything that's already on it.";
  const inferredStage = prefs.companyStage ?? null;

  const places = useMemo<MapPlace[]>(
    () => (globe?.cities ?? []).map((c) => ({ name: c.name, lat: c.lat, lng: c.lng, count: c.openRoles, picked: true })),
    [globe],
  );

  const setup: { label: string; done: boolean; now?: boolean }[] = [
    { label: "Resume read", done: !!t.resume },
    { label: "Email verified", done: !!auth?.user?.emailVerified },
    { label: "Details confirmed", done: !!t.resume },
    { label: "Preferences learned from swipes", done: !!prefs.clusters?.length || !!prefs.titles?.length },
    { label: "Cities picked", done: !!prefs.cities?.length },
    { label: "Getting to know you", done: done || alreadyDone, now: !(done || alreadyDone) },
  ];
  const setupDone = setup.filter((s) => s.done).length;

  const save = async (a: ChatAnswers) => {
    setDone(true);
    await fetch("/api/start/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "chat", chat: a }),
    }).catch(() => {});
  };

  if (!auth?.user || !profile) {
    return (
      <div className="ap" style={{ display: "grid", placeItems: "center" }}>
        <style>{CSS}</style>
        <span className="ap-spin" aria-label="Loading" />
      </div>
    );
  }

  const Row = ({ k, v }: { k: string; v: ReactNode }) => (
    <>
      <dt style={{ color: "var(--faint)", fontSize: 12.5 }}>{k}</dt>
      <dd className="ap-pop" style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--ink)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{v}</dd>
    </>
  );

  return (
    <div className="ap">
      <style>{CSS}</style>

      {/* Sidebar: same shape as the Sensei app */}
      <aside className="ap-side" data-tour="app-side">
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px", color: "var(--ink)", textDecoration: "none" }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--ink)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13 }}>S</span>
          <span style={{ fontWeight: 650, fontSize: 16 }}>studojo</span>
        </Link>
        <button type="button" className="ap-btn" disabled={!done && !alreadyDone} style={{ width: "100%", opacity: done || alreadyDone ? 1 : 0.55 }} title={done || alreadyDone ? undefined : "Finish getting to know you first"}>
          + New chat
        </button>
        <div>
          <div className="ap-label" style={{ padding: "4px 10px 6px" }}>Chats</div>
          <div className="ap-nav on">
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: done || alreadyDone ? "var(--green)" : "var(--indigo)" }} />
            Getting to know you
          </div>
          <div className="ap-nav off"><Lock /> Find people hiring</div>
          <div className="ap-nav off"><Lock /> Draft my first emails</div>
          <div className="ap-nav off"><Lock /> Prep for interviews</div>
        </div>
        <div style={{ marginTop: "auto", display: "grid", gap: 6 }}>
          <Link to="/profile" className="ap-nav">Your profile</Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, border: "1px solid var(--line)", borderRadius: 12 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--indigo-soft)", color: "var(--indigo-ink)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12 }}>{initials}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name || "You"}</span>
              <span style={{ display: "block", fontSize: 11.5, color: "var(--faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{auth.user.email}</span>
            </span>
          </div>
        </div>
      </aside>

      {/* Conversation */}
      <section className="ap-main">
        <div className="ap-top">
          <span style={{ fontSize: 15, fontWeight: 600 }}>{alreadyDone || done ? "Welcome to Studojo" : "Getting to know you"}</span>
          <span className="ap-pill ap-mono" style={{ marginLeft: "auto" }}>{alreadyDone || done ? "profile complete" : `${chatCount} answered`}</span>
          <span className="ap-pill ap-mono">{openRoles} open roles in your cities</span>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          {alreadyDone ? (
            <div style={{ height: "100%", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 650 }}>You're all set, {firstName}.</div>
                <p style={{ color: "var(--muted)", marginTop: 8 }}>We learned everything we need from your resume and swipes. Next, find the people hiring for it.</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
                  <Link to="/outreach" className="ap-btn indigo">Find people hiring →</Link>
                  <Link to="/profile" className="ap-btn ghost">See my profile</Link>
                </div>
              </div>
            </div>
          ) : (
            <ProfileChat
              firstName={firstName}
              summary={summary}
              suggestions={prefs.likedCompanies ?? []}
              onAnswer={setChat}
              onDone={save}
              skip={inferredStage ? ["companyStage"] : []}
              known={inferredStage ? { companyStage: inferredStage } : {}}
              doneActions={
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Link to="/outreach" className="ap-btn indigo" data-tour="app-next">Find people hiring for this →</Link>
                  <Link to="/profile" className="ap-btn ghost">See my profile</Link>
                </div>
              }
            />
          )}
        </div>
      </section>

      {/* Live panel */}
      <aside className="ap-right" data-tour="app-panel">
        <div className="ap-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: setupDone === setup.length ? "var(--green)" : "var(--indigo)" }} />
            <span style={{ fontWeight: 600 }}>{setupDone === setup.length ? "You're all set" : "Setting you up"}</span>
            <span className="ap-mono" style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>{setupDone}/{setup.length}</span>
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
            {setup.map((s) => <span key={s.label} style={{ flex: 1, height: 4, borderRadius: 4, background: s.done ? "var(--indigo)" : "var(--line)" }} />)}
          </div>
          <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "grid", gap: 7 }}>
            {setup.map((s) => (
              <li key={s.label} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: s.done ? "var(--ink-2)" : "var(--ink)", fontWeight: s.now ? 600 : 400 }}>
                <span style={{ width: 16, display: "grid", placeItems: "center" }}>{s.done ? <Tick /> : s.now ? <span className="ap-spin" /> : null}</span>
                {s.label}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[
            ["Skills", resume.skills?.length ?? 0, "var(--ink)"],
            ["Open roles", openRoles, "var(--indigo)"],
            ["Cities", prefs.cities?.length ?? 0, "var(--green)"],
          ].map(([k, v, c]) => (
            <div key={k as string} className="ap-card" style={{ padding: "12px 8px", textAlign: "center" }}>
              <div className="ap-mono" style={{ fontSize: 22, fontWeight: 600, color: c as string }}>{(v as number) || "–"}</div>
              <div className="ap-label" style={{ fontSize: 10, marginTop: 2 }}>{k}</div>
            </div>
          ))}
        </div>

        <div className="ap-card" style={{ padding: 16 }} data-tour="app-profile">
          <div className="ap-label" style={{ marginBottom: 10 }}>Your profile</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#5B63E8,#8B5CF6)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 650 }}>{initials}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 650, fontSize: 15 }}>{name}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{line}</div>
            </div>
          </div>
          {!!resume.skills?.length && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 12 }}>
              {resume.skills.slice(0, 8).map((s) => <span key={s} className="ap-chip">{s}</span>)}
            </div>
          )}
          <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px", margin: "14px 0 0", paddingTop: 12, borderTop: "1px dashed var(--line)" }}>
            {!!prefs.clusters?.length && <Row k="Into" v={prefs.clusters.slice(0, 3).join(", ")} />}
            {!!prefs.cities?.length && <Row k="Cities" v={prefs.cities.join(", ")} />}
            {!!prefs.minMonthly && <Row k="Stipend" v={`₹${Math.round(prefs.minMonthly / 1000)}k+/mo`} />}
            {chat.companyStage && <Row k="Company" v={chat.companyStage} />}
            {!!chat.dreamCompanies?.length && <Row k="Dream" v={chat.dreamCompanies.join(", ")} />}
            {chat.workMode && <Row k="Works" v={chat.workMode} />}
            {chat.startWhen && <Row k="Starts" v={chat.startWhen} />}
            {chat.proud && <Row k="Proud of" v={chat.proud} />}
          </dl>
          {!done && !alreadyDone && (
            <p style={{ fontSize: 12, color: "var(--faint)", margin: "12px 0 0" }}>Answers from the chat appear here as you give them.</p>
          )}
        </div>

        <div className="ap-card" style={{ padding: 12 }}>
          <div className="ap-label" style={{ padding: "2px 4px 8px" }}>Your cities</div>
          <RoleMap home={globe?.home ?? null} places={places} height={190} />
        </div>
        {!!prefs.insights?.length && (
          <div className="ap-card" style={{ padding: 16 }}>
            <div className="ap-label" style={{ marginBottom: 8 }}>Learned from your swipes</div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
              {prefs.insights.slice(0, 5).map((i) => (
                <li key={i.text} style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{i.text}</span>
                  <span style={{ display: "block", fontSize: 12, color: "var(--faint)" }}>{i.evidence}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
