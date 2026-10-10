import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import type { QuickResume } from "~/lib/resume-quick-parse";
import { type Cluster } from "~/lib/swipe-prefs";
import { confidence, believe, learn, nextItem, predict, skillHits, type Answers, type BrainRole, type Item, type Side, type Swipe, type Verdict, type Insight } from "~/lib/swipe-brain";
import { SenseiBackdrop } from "~/components/start/sensei-backdrop";
import { RoleMap, type MapPlace } from "~/components/start/role-map";
import { COORDS } from "~/lib/geo";

/**
 * /start: sign up by dropping a resume.
 *
 *  1. Drop     the resume is read instantly (no account yet, nothing stored)
 *  2. Verify   a six-digit code goes to the email on the resume; no password
 *  3. Confirm  one tap if we read it right; edit only what's wrong
 *  4. Swipe    an adaptive deck: each card is chosen from what they kept and
 *              passed to learn the most (app/lib/swipe-brain.ts), then we say
 *              what we learned, with evidence, and the best matches
 *  5. Cities   on a map fitted to where their roles are
 *
 * Styled to match sensei.studojo.com (Geist, Instrument Serif accents,
 * JetBrains Mono labels, hairline panels, pill buttons) on its background.
 * Then it hands off to /app for a short "tell us more" chat.
 */

export function meta() {
  return [
    { title: "Start | Studojo" },
    { name: "description", content: "Drop your resume. That's the signup." },
  ];
}

type Step = "drop" | "reading" | "verify" | "confirm" | "swipe" | "proud" | "learned" | "cities" | "saving";

const CONSENT_PENDING_KEY = "sj_consent_pending";
const STASH_KEY = "sj_start_resume";

const STEPS: { key: Step[]; label: string }[] = [
  { key: ["drop", "reading"], label: "Drop your resume" },
  { key: ["verify"], label: "Verify your email" },
  { key: ["confirm"], label: "Check what we found" },
  { key: ["swipe", "proud", "learned"], label: "Get to know you" },
  { key: ["cities", "saving"], label: "Pick your cities" },
];

// Solid initial squares, as in Sensei's company rows.
const CLUSTER_COLOR: Record<Cluster, string> = {
  Analytics: "#5B63E8", Product: "#C4477A", Engineering: "#16161E", Design: "#9B59C9", Marketing: "#C9822B", Finance: "#1E9E6E",
  Consulting: "#2A8C8C", Sales: "#B4801E", Content: "#C4477A", HR: "#5E9A2E", Operations: "#6B6E80", Other: "#8A8D9E",
};
const INSIGHT_TONE: Record<Insight["kind"], string> = {
  work: "accent", avoid: "plain", place: "accent", pay: "mint", length: "amber", company: "rose", fit: "amber", speed: "mint", values: "rose", plan: "amber",
};

const CSS = `
@font-face { font-family: "Geist"; src: url(/fonts/geist/Geist-Variable.woff2) format("woff2"); font-weight: 100 900; font-display: swap; }
@font-face { font-family: "Instrument Serif"; src: url(/fonts/sensei/InstrumentSerif-400.woff2) format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "Instrument Serif"; src: url(/fonts/sensei/InstrumentSerif-400-italic.woff2) format("woff2"); font-style: italic; font-weight: 400; font-display: swap; }
@font-face { font-family: "JetBrains Mono"; src: url(/fonts/sensei/JetBrainsMono-400.woff2) format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "JetBrains Mono"; src: url(/fonts/sensei/JetBrainsMono-500.woff2) format("woff2"); font-weight: 500; font-display: swap; }
.ss {
  --bg:#FBFBFD; --bg-2:#F4F4F9; --panel:#FFFFFF; --ink:#16161E; --text-2:#585B6C; --text-3:#8A8D9E; --text-4:#AAADBC;
  --border:rgba(22,22,40,.09); --border-2:rgba(22,22,40,.15);
  --accent:#5B63E8; --accent-deep:#4148C6; --accent-soft:#EEEFFE; --accent-line:rgba(91,99,232,.28);
  --mint:#1E9E6E; --mint-soft:#E7F8F0; --amber:#B4801E; --amber-soft:#FBF0DA; --rose:#C4477A; --rose-soft:#FCEAF0;
  --sans:'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; --serif:'Instrument Serif',Georgia,serif; --mono:'JetBrains Mono',ui-monospace,Menlo,monospace;
  --ease:cubic-bezier(.4,0,.2,1);
  --sh-sm:0 1px 2px rgba(18,20,45,.06),0 1px 3px rgba(18,20,45,.05); --sh-md:0 8px 24px -8px rgba(18,20,45,.14); --sh-lg:0 32px 72px -28px rgba(18,20,45,.30);
  font-family:var(--sans); color:var(--ink); font-size:16px; line-height:1.6; letter-spacing:-.011em; -webkit-font-smoothing:antialiased;
}
.ss *:focus-visible { outline:2px solid var(--accent); outline-offset:2px; border-radius:8px; }
.ss h1 { font-size:clamp(2rem,4.2vw,2.75rem); line-height:1.04; letter-spacing:-.035em; font-weight:600; text-wrap:balance; margin:0; }
.ss h1 em, .ss .em { font-family:var(--serif); font-style:italic; font-weight:400; letter-spacing:-.01em; color:var(--accent); }
.ss .lead { font-size:1.02rem; color:var(--text-2); line-height:1.6; max-width:56ch; margin:10px 0 0; }
.ss .mono { font-family:var(--mono); }
.ss .label { font-family:var(--mono); font-size:10.5px; letter-spacing:.04em; text-transform:uppercase; color:var(--text-3); }
.ss .tag { display:inline-flex; align-items:center; gap:5px; font-family:var(--mono); font-size:10.5px; padding:3px 9px; border-radius:999px; white-space:nowrap; border:1px solid var(--accent-line); color:var(--accent-deep); background:var(--accent-soft); }
.ss .tag.amber { color:var(--amber); border-color:rgba(180,128,30,.3); background:var(--amber-soft); }
.ss .tag.rose { color:var(--rose); border-color:rgba(196,71,122,.3); background:var(--rose-soft); }
.ss .tag.mint { color:var(--mint); border-color:rgba(30,158,110,.3); background:var(--mint-soft); }
.ss .tag.plain { color:var(--text-3); border-color:var(--border); background:var(--bg-2); }
.ss .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:999px; padding:12px 22px; font:500 15px var(--sans); border:0; cursor:pointer; white-space:nowrap; text-decoration:none;
  transition:transform .15s var(--ease), box-shadow .15s var(--ease), border-color .15s, background .15s; }
.ss .btn--dark { background:var(--ink); color:#fff; }
.ss .btn--dark:hover { transform:translateY(-1px); box-shadow:0 12px 28px -12px rgba(18,20,45,.55); }
.ss .btn--accent { background:var(--accent); color:#fff; }
.ss .btn--accent:hover { transform:translateY(-1px); box-shadow:0 12px 28px -12px rgba(91,99,232,.6); }
.ss .btn--ghost { background:#fff; color:var(--ink); border:1px solid var(--border-2); }
.ss .btn--ghost:hover { border-color:var(--ink); }
.ss .btn[disabled] { opacity:.5; pointer-events:none; }
.ss .link { background:none; border:0; padding:0; font:inherit; font-weight:500; color:var(--accent-deep); cursor:pointer; text-decoration:none; }
.ss .link:hover { text-decoration:underline; }
.ss .chip { display:inline-flex; align-items:center; gap:7px; padding:7px 13px; border:1px solid var(--border); border-radius:999px; background:#fff; font-size:13.5px; color:var(--text-2); cursor:pointer; transition:border-color .15s, background .15s, color .15s; }
.ss .chip:hover { border-color:var(--border-2); color:var(--ink); }
.ss .chip.on { border-color:var(--accent-line); background:var(--accent-soft); color:var(--accent-deep); }
.ss .panel { background:#fff; border:1px solid var(--border); border-radius:20px; box-shadow:var(--sh-lg); overflow:hidden; }
.ss .panel__bar { display:flex; align-items:center; gap:10px; padding:12px 18px; border-bottom:1px solid var(--border); background:var(--bg-2); font-family:var(--mono); font-size:11.5px; color:var(--text-3); }
.ss .tile { background:#fff; border:1px solid var(--border); border-radius:14px; box-shadow:var(--sh-sm); }
.ss .row { display:flex; align-items:center; gap:14px; padding:14px 18px; border-bottom:1px solid var(--border); }
.ss .row:last-child { border-bottom:0; }
.ss .sq { width:36px; height:36px; border-radius:10px; flex-shrink:0; display:grid; place-items:center; color:#fff; font-weight:600; font-size:13px; }
.ss .dot { width:7px; height:7px; border-radius:50%; background:var(--mint); box-shadow:0 0 0 3px rgba(30,158,110,.15); }
.ss input.field { width:100%; border:1px solid var(--border-2); border-radius:12px; padding:11px 14px; font:400 15px var(--sans); color:var(--ink); background:#fff; outline:none; }
.ss input.field:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-soft); }
@keyframes ssIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:none } }
.ss .fade { animation:ssIn .3s var(--ease) both; }
@media (prefers-reduced-motion: reduce) { .ss .fade { animation:none } .ss .btn { transition:none } }
`;

type Draft = {
  name: string; email: string; college: string; course: string; gradYear: string; city: string;
  skills: string[]; experience: { title: string; company: string }[];
  links: { github?: string; linkedin?: string; portfolio?: string };
  unsure: Set<string>; edited: Set<string>;
};

function draftFrom(r: QuickResume | null): Draft {
  const unsure = new Set<string>();
  const v = <T,>(key: string, f: { value: T; confidence: string } | null | undefined): T | "" => {
    if (!f) return "";
    if (f.confidence === "low") unsure.add(key);
    return f.value;
  };
  return {
    name: v("name", r?.name) as string, email: v("email", r?.email) as string, college: v("college", r?.college) as string,
    course: v("course", r?.course) as string, gradYear: r?.gradYear ? String(v("gradYear", r.gradYear)) : "", city: v("city", r?.city) as string,
    skills: r?.skills ?? [], experience: r?.experience ?? [], links: r?.links ?? {}, unsure, edited: new Set(),
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const coordsOf = (city: string) => COORDS[city.toLowerCase()] ?? (city === "Bengaluru" ? COORDS.bangalore : undefined);
const initials = (s: string) => s.replace(/[^A-Za-z0-9 ]/g, "").split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
const Tick = ({ c = "currentColor" }: { c?: string }) => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

function useCountUp(target: number) {
  const [n, setN] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now(), a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 450);
      setN(Math.round(a + (target - a) * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(tick); else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return n;
}

export default function StartPage() {
  const navigate = useNavigate();
  const { data: auth, isPending } = authClient.useSession();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("drop");
  const [error, setError] = useState("");
  const [d, setD] = useState<Draft>(() => draftFrom(null));
  const [fileName, setFileName] = useState("");
  const [revealed, setRevealed] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  // verify
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // confirm
  const [editing, setEditing] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);

  // swipe brain
  const [pool, setPool] = useState<BrainRole[]>([]);
  const [swipes, setSwipes] = useState<Swipe[]>([]);
  const [probes, setProbes] = useState<string[]>([]);
  const [item, setItem] = useState<Item | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [lastQuick, setLastQuick] = useState(false);
  const [sinceQuick, setSinceQuick] = useState(0);
  const [proud, setProud] = useState("");
  const current = item?.kind === "role" ? item.pick : null;
  const quick = item?.kind === "quick" ? item.quick : null;
  const [shownAt, setShownAt] = useState(0);
  const [drag, setDrag] = useState<{ x: number; start: number } | null>(null);
  const [fling, setFling] = useState<"left" | "right" | "up" | null>(null);
  const [justLearned, setJustLearned] = useState<Insight | null>(null);

  // cities
  const [cities, setCities] = useState<string[]>([]);

  const signedIn = !!auth?.user;
  const shown = useMemo<Draft>(() => {
    if (step !== "reading") return d;
    const keep = (i: number) => revealed > i;
    return { ...d, name: keep(0) ? d.name : "", email: keep(1) ? d.email : "", college: keep(2) ? d.college : "",
      course: keep(3) ? d.course : "", gradYear: keep(4) ? d.gradYear : "", city: keep(5) ? d.city : "", skills: keep(6) ? d.skills : [] };
  }, [d, step, revealed]);

  useEffect(() => setMounted(true), []);

  // Resume read before a Google round trip survives it.
  useEffect(() => {
    if (!mounted || isPending) return;
    try {
      const raw = sessionStorage.getItem(STASH_KEY);
      if (raw && signedIn) {
        sessionStorage.removeItem(STASH_KEY);
        setD({ ...draftFrom(JSON.parse(raw) as QuickResume), email: auth!.user.email });
        setStep("confirm");
      }
    } catch {}
  }, [mounted, isPending, signedIn, auth]);

  const ctx = useMemo(() => ({ homeCity: d.city || null, skills: d.skills }), [d.city, d.skills]);
  const belief = useMemo(() => believe(pool, swipes, ctx), [pool, swipes, ctx]);
  const conf = Math.round(confidence(belief, swipes) * 100);
  const learned = useMemo(() => (swipes.length ? learn(pool, swipes, ctx, answers) : null), [pool, swipes, ctx, answers]);
  const answeredCount = swipes.length + Object.keys(answers).length;
  const fitNow = useCountUp(pool.length ? pool.filter((r) => predict(r, belief, ctx) >= 0.5).length : 0);
  const confShown = useCountUp(conf);

  // ── 1. Drop ──
  const readFile = async (file: File) => {
    setError("");
    if (!/\.pdf$|\.txt$/i.test(file.name)) { setError("Use a PDF of your resume."); return; }
    setFileName(file.name);
    setRevealed(0);
    setStep("reading");
    const form = new FormData();
    form.append("file", file);
    try {
      const [res] = await Promise.all([fetch("/api/start/parse", { method: "POST", body: form }), sleep(700)]);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "We couldn't read that file.");
      const draft = draftFrom(data.resume);
      try { localStorage.setItem(CONSENT_PENDING_KEY, "1"); } catch {}
      setD(signedIn ? { ...draft, email: auth!.user.email } : draft);
      for (let i = 1; i <= 7; i++) { setRevealed(i); await sleep(220); }
      await sleep(800);
      if (signedIn) { setStep("confirm"); return; }
      try { sessionStorage.setItem(STASH_KEY, JSON.stringify(data.resume)); } catch {}
      setStep("verify");
      if (draft.email && !draft.unsure.has("email")) void sendCode(draft.email);
      else setChangingEmail(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't read that file.");
      setStep("drop");
    }
  };

  // ── 2. Verify ──
  const sendCode = async (email: string) => {
    setError("");
    const { error: err } = await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
    if (err) { setError(err.message || "We couldn't send a code to that address."); setChangingEmail(true); return; }
    setSentTo(email);
    setChangingEmail(false);
    setCode("");
  };
  const verify = useCallback(async (otp: string) => {
    setVerifying(true);
    setError("");
    const { error: err } = await authClient.signIn.emailOtp({ email: sentTo, otp });
    setVerifying(false);
    if (err) {
      setError(err.message?.includes("expired") ? "That code expired. Send a new one." : "That code didn't match. Check the email and try again.");
      setCode("");
      return;
    }
    try { sessionStorage.removeItem(STASH_KEY); } catch {}
    setD((x) => ({ ...x, email: sentTo }));
    setStep("confirm");
  }, [sentTo]);
  useEffect(() => {
    if (step === "verify" && code.length === 6 && !verifying) void verify(code);
  }, [code, step, verifying, verify]);

  // ── 3. Confirm ──
  const setField = (key: keyof Draft, value: string) =>
    setD((x) => {
      if ((x[key] as string) === value) return x;
      const unsure = new Set(x.unsure);
      unsure.delete(key);
      return { ...x, [key]: value, unsure, edited: new Set(x.edited).add(key === "gradYear" ? "year" : key) };
    });

  const confirm = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/start/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "confirm",
          basics: {
            fullName: d.name, college: d.college, course: d.course,
            yearOfStudy: d.gradYear ? `${Number(d.gradYear) < new Date().getFullYear() ? "Graduated" : "Graduating"} ${d.gradYear}` : "",
          },
          resume: { skills: d.skills, experience: d.experience, city: d.city, gradYear: d.gradYear },
          links: d.links,
          edited: [...d.edited],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Couldn't save. Try again.");
      void authClient.getSession({ query: { disableCookieCache: true } });
      const deck = await fetch("/api/start/deck").then((r) => r.json());
      const list: BrainRole[] = Array.isArray(deck?.pool) ? deck.pool : [];
      setPool(list);
      setSwipes([]);
      setProbes([]);
      setAnswers({});
      const first = nextItem(list, [], {}, { homeCity: d.city || null, skills: d.skills }, [], false, 0);
      setItem(first);
      setShownAt(performance.now());
      setStep(first ? "swipe" : "proud");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── 4. Swipe: every next card (role or question) is chosen from what they've said so far ──
  const advance = (nextSwipes: Swipe[], nextAnswers: Answers, nextProbes: string[], wasQuick: boolean, since: number) => {
    const before = learned?.insights.map((i) => i.text) ?? [];
    const after = learn(pool, nextSwipes, ctx, nextAnswers).insights;
    setJustLearned(after.find((i) => !before.includes(i.text)) ?? null);
    setSwipes(nextSwipes);
    setAnswers(nextAnswers);
    setProbes(nextProbes);
    setLastQuick(wasQuick);
    setSinceQuick(since);
    const n = nextItem(pool, nextSwipes, nextAnswers, ctx, nextProbes, wasQuick, since);
    setItem(n);
    setShownAt(performance.now());
    setFling(null);
    setDrag(null);
    if (!n) setStep("proud");
  };

  const decide = useCallback((verdict: Verdict) => {
    if (!current || fling) return;
    const ms = Math.round(performance.now() - shownAt);
    setFling(verdict === "pass" ? "left" : verdict === "love" ? "up" : "right");
    setTimeout(() => advance([...swipes, { id: current.role.id, verdict, ms }], answers, [...probes, current.probe], false, sinceQuick + 1), 220);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, fling, shownAt, swipes, probes, pool, ctx, learned, answers, sinceQuick]);

  const answerQuick = useCallback((side: Side) => {
    if (!quick || fling) return;
    setFling(side === "left" ? "left" : side === "right" ? "right" : "up");
    setTimeout(() => advance(swipes, { ...answers, [quick.id]: side }, probes, true, 0), 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quick, fling, swipes, probes, pool, ctx, learned, answers]);

  useEffect(() => {
    if (step !== "swipe") return;
    const onKey = (e: KeyboardEvent) => {
      if (quick) {
        if (e.key === "ArrowLeft") answerQuick("left");
        if (e.key === "ArrowRight") answerQuick("right");
        if (e.key === "ArrowUp") answerQuick("either");
        return;
      }
      if (e.key === "ArrowRight") decide("like");
      if (e.key === "ArrowLeft") decide("pass");
      if (e.key === "ArrowUp") decide("love");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, decide, answerQuick, quick]);

  // ── 5. Cities ──
  const toCities = () => {
    const kept = learned?.cities ?? [];
    setCities(kept.length ? kept : d.city ? [d.city] : []);
    setStep("cities");
  };
  const cityCounts = useMemo(() => {
    const n = new Map<string, number>();
    for (const r of pool) if (r.city) n.set(r.city, (n.get(r.city) ?? 0) + 1);
    for (const c of cities) if (!n.has(c)) n.set(c, 0);
    return [...n.entries()].sort((a, b) => b[1] - a[1]);
  }, [pool, cities]);
  const toggleCity = (c: string) => setCities((x) => (x.includes(c) ? x.filter((k) => k !== c) : [...x, c]));

  const finish = async () => {
    setStep("saving");
    const l = learned;
    const byId = new Map(pool.map((r) => [r.id, r]));
    await fetch("/api/start/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: "prefs",
        prefs: {
          clusters: l?.clusters ?? [], avoid: l?.avoid ?? [], cities, minMonthly: l?.minMonthly ?? null, titles: l?.titles ?? [],
          liked: swipes.filter((s) => s.verdict !== "pass").map((s) => s.id), passed: swipes.filter((s) => s.verdict === "pass").map((s) => s.id),
          likedCompanies: [...new Set(swipes.filter((s) => s.verdict !== "pass").map((s) => byId.get(s.id)?.company).filter(Boolean))],
          insights: l?.insights ?? [], matters: l?.matters ?? [], companyStage: l?.companyStage ?? null,
        },
      }),
    }).catch(() => {});
    // Everything the old "tell us more" chat asked is answered by the deck.
    await fetch("/api/start/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: "chat",
        chat: { companyStage: l?.companyStage ?? undefined, dreamCompanies: l?.dreamCompanies ?? [], workMode: l?.workMode ?? undefined, startWhen: l?.startWhen ?? undefined, proud: proud.trim() || undefined },
      }),
    }).catch(() => {});
    navigate("/app?welcome=1");
  };

  // Map places: cities with open roles; kept / picked ones highlighted.
  const keptCities = new Set(learned?.cities ?? []);
  const places: MapPlace[] = cityCounts
    .map(([c, n]): MapPlace | null => {
      const at = coordsOf(c);
      return at ? { name: c, lat: at[0], lng: at[1], count: n, picked: step === "cities" || step === "saving" ? cities.includes(c) : keptCities.has(c) } : null;
    })
    .filter((p): p is MapPlace => !!p);
  const homeAt = shown.city ? coordsOf(shown.city) : undefined;
  const home = homeAt ? { name: shown.city, lat: homeAt[0], lng: homeAt[1] } : null;

  const stepIndex = STEPS.findIndex((s) => s.key.includes(step));
  const dx = fling === "right" ? 520 : fling === "left" ? -520 : drag?.x ?? 0;
  const dy = fling === "up" ? -420 : 0;
  const tags = (c: BrainRole) => {
    const out: { text: string; tone: string }[] = [];
    if (c.city && d.city && c.city === d.city) out.push({ text: "near you", tone: "mint" });
    else if (c.city) out.push({ text: `move to ${c.city}`, tone: "" });
    else out.push({ text: "remote", tone: "" });
    if (c.monthly) out.push({ text: c.monthly >= 35000 ? "well paid" : c.monthly < 15000 ? "low stipend" : "paid", tone: c.monthly < 15000 ? "amber" : "mint" });
    else out.push({ text: "stipend not stated", tone: "amber" });
    out.push({ text: c.big ? "big company" : "startup", tone: "plain" });
    if (c.months && c.months >= 6) out.push({ text: "6+ months", tone: "plain" });
    return out;
  };

  const Bar = ({ children, right }: { children: ReactNode; right?: ReactNode }) => (
    <div className="panel__bar">
      <span style={{ display: "flex", gap: 5 }} aria-hidden="true">
        {[0, 1, 2].map((i) => <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#DCDCE6" }} />)}
      </span>
      <span style={{ marginLeft: 6 }}>{children}</span>
      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7 }}>{right}</span>
    </div>
  );

  return (
    <div className="ss" style={{ position: "relative", minHeight: "100vh" }}>
      <style>{CSS}</style>
      <SenseiBackdrop />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 16px 40px" }}>
        {/* Nav pill, as on the site */}
        <nav style={{ width: "100%", maxWidth: 760, display: "flex", alignItems: "center", gap: 16, padding: "8px 8px 8px 16px", borderRadius: 999, background: "rgba(255,255,255,.82)", backdropFilter: "blur(14px)", border: "1px solid var(--border)", boxShadow: "0 12px 40px -24px rgba(18,20,45,.45)" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--ink)", textDecoration: "none" }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--ink)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 13 }}>S</span>
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-.02em" }}>studojo</span>
          </Link>
          <div style={{ display: "flex", gap: 4, marginLeft: "auto" }} data-tour="progress" aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <span key={s.label} style={{ width: 22, height: 4, borderRadius: 4, background: i < stepIndex ? "var(--ink)" : i === stepIndex ? "var(--accent)" : "var(--border-2)", transition: "background .3s" }} />
            ))}
          </div>
          <span className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>{stepIndex + 1}/{STEPS.length}</span>
          {!signedIn ? <Link to="/auth?mode=signin" className="btn btn--dark" style={{ padding: "9px 16px", fontSize: 14 }}>Sign in</Link> : <span style={{ width: 4 }} />}
        </nav>

        <main className="panel" style={{ width: "100%", maxWidth: 760, marginTop: 28 }} data-tour="main">
          <Bar right={<><span className="dot" />{STEPS[stepIndex]?.label.toLowerCase()}</>}>
            {step === "swipe" || step === "learned" || step === "proud" ? `getting to know ${d.name.split(" ")[0]?.toLowerCase() || "you"} · ${answeredCount} answers` : `studojo.com/start · step ${stepIndex + 1} of ${STEPS.length}`}
          </Bar>
          <div style={{ padding: "30px 32px 32px", display: "grid", gap: 22 }}>
            {/* 1. Drop */}
            {(step === "drop" || step === "reading") && (
              <>
                <div>
                  <span className="tag">no forms · no password</span>
                  <h1 style={{ marginTop: 14 }}>Drop your resume. <em>That's the signup.</em></h1>
                  <p className="lead">We read it in a second, then get to know you from a few swipes on real roles. No questionnaire.</p>
                </div>
                <label
                  data-tour="dropzone"
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) void readFile(f); }}
                  style={{ display: "block", borderRadius: 16, border: `1px dashed ${dragOver ? "var(--accent)" : "var(--border-2)"}`, background: dragOver ? "var(--accent-soft)" : "var(--bg)", padding: step === "reading" ? 18 : "34px 24px", cursor: step === "reading" ? "default" : "pointer", pointerEvents: step === "reading" ? "none" : undefined, transition: "background .15s, border-color .15s" }}
                >
                  <input id="start-resume" type="file" accept=".pdf,.txt,application/pdf,text/plain" className="sr-only"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) void readFile(f); e.target.value = ""; }} />
                  {step === "reading" ? (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span className="dot" />
                        <span style={{ fontWeight: 500 }}>Reading {fileName}</span>
                        <span className="mono" style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-3)" }}>{Math.min(revealed, 7)}/7</span>
                      </div>
                      <div className="tile" style={{ marginTop: 14, overflow: "hidden" }}>
                        {([["name", d.name], ["email", d.email], ["college", d.college], ["course", d.course], ["graduating", d.gradYear], ["city", d.city], ["skills", d.skills.length ? d.skills.slice(0, 4).join(", ") + (d.skills.length > 4 ? ` +${d.skills.length - 4}` : "") : ""]] as [string, string][]).map(([k, v], i) => (
                          <div key={k} className="row" style={{ padding: "9px 14px", opacity: i < revealed ? 1 : 0.35, transition: "opacity .25s" }}>
                            <span style={{ width: 16, color: "var(--mint)" }}>{i < revealed && v ? <Tick /> : null}</span>
                            <span className="label" style={{ width: 92 }}>{k}</span>
                            <span style={{ fontSize: 14, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i < revealed ? v || <span style={{ color: "var(--text-4)" }}>not found</span> : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8 }}>
                      <span style={{ width: 46, height: 46, borderRadius: 12, background: "var(--accent-soft)", border: "1px solid var(--accent-line)", display: "grid", placeItems: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15V4m0 0l-4 4m4-4l4 4M5 15v3a2 2 0 002 2h10a2 2 0 002-2v-3" stroke="#5B63E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      <span style={{ fontSize: 17, fontWeight: 500 }}>Drop your resume here</span>
                      <span style={{ fontSize: 14, color: "var(--text-3)" }}>or <span style={{ color: "var(--accent-deep)", fontWeight: 500 }}>choose a file</span> <span className="mono" style={{ fontSize: 11.5 }}>· pdf · up to 5 mb</span></span>
                    </div>
                  )}
                </label>
                {error && <p style={{ margin: 0, color: "var(--rose)", fontSize: 14 }}>{error}</p>}
                {step === "drop" && (
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
                    {!signedIn && (
                      <button type="button" className="btn btn--ghost" onClick={() => {
                        try { localStorage.setItem(CONSENT_PENDING_KEY, "1"); } catch {}
                        authClient.signIn.social({ provider: "google", callbackURL: "/start", errorCallbackURL: "/auth?redirect=%2Fstart" });
                      }}>No resume handy? Continue with Google</button>
                    )}
                    <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-3)", maxWidth: "46ch", lineHeight: 1.5 }}>
                      By continuing, you confirm you are 18 or older and agree to our{" "}
                      <a href="/terms" target="_blank" rel="noopener" style={{ color: "inherit" }}>Terms of Service</a> and{" "}
                      <a href="/privacy" target="_blank" rel="noopener" style={{ color: "inherit" }}>Privacy Policy</a>.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* 2. Verify */}
            {step === "verify" && (
              <div data-tour="verify" style={{ display: "grid", gap: 22 }} className="fade">
                <div>
                  <span className="tag mint"><Tick /> resume read · {d.name || "you"}</span>
                  <h1 style={{ marginTop: 14 }}>Check your <em>inbox.</em></h1>
                  {sentTo && !changingEmail ? (
                    <p className="lead">Your resume says <strong style={{ color: "var(--ink)", fontWeight: 500 }}>{sentTo}</strong>. We sent a 6-digit code there. <button type="button" className="link" onClick={() => setChangingEmail(true)}>Wrong address?</button></p>
                  ) : (
                    <p className="lead">{d.email ? "Where should we send your code?" : "We couldn't find an email on your resume. Where should we send your code?"}</p>
                  )}
                </div>
                {sentTo && !changingEmail ? (
                  <div>
                    <label htmlFor="start-code" className="label">6-digit code</label>
                    <div style={{ position: "relative", display: "inline-block", marginTop: 10 }}>
                      <input id="start-code" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={6} value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} style={{ position: "absolute", inset: 0, opacity: 0 }} />
                      <div style={{ display: "flex", gap: 8 }} aria-hidden="true">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="mono" style={{ width: 48, height: 58, borderRadius: 12, display: "grid", placeItems: "center", fontSize: 24, fontWeight: 500, background: "#fff", border: `1px solid ${i === code.length ? "var(--accent)" : "var(--border-2)"}`, boxShadow: i === code.length ? "0 0 0 3px var(--accent-soft)" : "var(--sh-sm)" }}>{code[i] ?? ""}</div>
                        ))}
                      </div>
                    </div>
                    <p style={{ margin: "14px 0 0", fontSize: 14, color: "var(--text-2)" }}>
                      {verifying ? "Checking…" : "You're signed in as soon as you type the last digit. No password to remember."}{" "}
                      {!verifying && <button type="button" className="link" onClick={() => void sendCode(sentTo)}>Send a new code</button>}
                    </p>
                  </div>
                ) : (
                  <form style={{ display: "flex", flexWrap: "wrap", gap: 10 }} onSubmit={(e) => { e.preventDefault(); if (/\S+@\S+\.\S+/.test(d.email)) void sendCode(d.email.trim().toLowerCase()); }}>
                    <label htmlFor="start-email" className="sr-only">Email</label>
                    <input id="start-email" type="email" className="field" style={{ flex: 1, minWidth: 220, width: "auto" }} value={d.email} onChange={(e) => setD((x) => ({ ...x, email: e.target.value }))} placeholder="you@college.edu" />
                    <button type="submit" className="btn btn--dark">Send code</button>
                  </form>
                )}
                {error && <p style={{ margin: 0, color: "var(--rose)", fontSize: 14 }}>{error}</p>}
              </div>
            )}

            {/* 3. Confirm */}
            {step === "confirm" && (
              <div data-tour="confirm" style={{ display: "grid", gap: 20 }} className="fade">
                <div>
                  <h1>Did we get it <em>right?</em></h1>
                  <p className="lead">Tap anything that's wrong. {d.unsure.size ? <>The ones marked <span className="tag amber">check this</span> we weren't sure about.</> : "Everything came straight off your resume."}</p>
                </div>
                <div className="tile" style={{ overflow: "hidden" }}>
                  {([["name", "Name", d.name, "Your full name"], ["college", "College", d.college, "e.g. Christ University"], ["course", "Course", d.course, "e.g. BBA, B.Tech"], ["gradYear", "Graduating", d.gradYear, "e.g. 2027"], ["city", "Based in", d.city, "e.g. Bengaluru"]] as [keyof Draft, string, string, string][]).map(([key, label, value, ph]) => {
                    const unsure = d.unsure.has(key as string);
                    const mine = d.edited.has(key === "gradYear" ? "year" : (key as string));
                    const pill = unsure ? { t: "check this", tone: "amber" } : !value ? { t: "add", tone: "plain" } : mine ? { t: "edited", tone: "" } : { t: "from resume", tone: "mint" };
                    return (
                      <div key={key} className="row" style={{ background: unsure ? "#FFFCF4" : undefined }}>
                        <span className="label" style={{ width: 92, flexShrink: 0 }}>{label}</span>
                        {editing === key ? (
                          <>
                            <label htmlFor={`start-${key}`} className="sr-only">{label}</label>
                            <input id={`start-${key}`} className="field" autoFocus defaultValue={value} placeholder={ph} style={{ padding: "7px 11px" }}
                              onBlur={(e) => { setField(key, e.target.value.trim()); setEditing(null); }}
                              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} />
                          </>
                        ) : (
                          <button type="button" data-tour={`field-${key}`} onClick={() => setEditing(key as string)}
                            style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, background: "none", border: 0, padding: 0, cursor: "text", textAlign: "left", font: "inherit" }}>
                            <span style={{ flex: 1, minWidth: 0, fontSize: 15, color: value ? "var(--ink)" : "var(--text-4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value || ph}</span>
                            <span className={`tag ${pill.tone}`}>{pill.t}</span>
                            <span className="mono" style={{ fontSize: 11, color: "var(--text-4)" }}>edit</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {d.experience.length > 0 && (
                    <div className="row">
                      <span className="label" style={{ width: 92, flexShrink: 0 }}>Experience</span>
                      <span style={{ fontSize: 14.5, color: "var(--ink)" }}>{d.experience.slice(0, 2).map((e) => `${e.title}${e.company ? `, ${e.company}` : ""}`).join(" · ")}</span>
                    </div>
                  )}
                  <div className="row" style={{ alignItems: "flex-start" }} data-tour="skills">
                    <span className="label" style={{ width: 92, flexShrink: 0, paddingTop: 4 }}>Skills</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1 }}>
                      {d.skills.map((s) => (
                        <span key={s} className="tag" style={{ paddingRight: 4 }}>
                          {s}
                          <button type="button" aria-label={`Remove ${s}`} onClick={() => setD((x) => ({ ...x, skills: x.skills.filter((k) => k !== s), edited: new Set(x.edited).add("skills") }))}
                            style={{ width: 16, height: 16, border: 0, borderRadius: 999, background: "transparent", color: "inherit", cursor: "pointer", lineHeight: 1 }}>×</button>
                        </span>
                      ))}
                      <form onSubmit={(e) => { e.preventDefault(); const s = newSkill.trim(); if (s && !d.skills.some((k) => k.toLowerCase() === s.toLowerCase())) setD((x) => ({ ...x, skills: [...x.skills, s], edited: new Set(x.edited).add("skills") })); setNewSkill(""); }}>
                        <label htmlFor="start-skill" className="sr-only">Add a skill</label>
                        <input id="start-skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="+ add"
                          className="mono" style={{ width: 80, fontSize: 10.5, padding: "3px 9px", borderRadius: 999, border: "1px dashed var(--border-2)", background: "#fff", outline: "none" }} />
                      </form>
                    </div>
                  </div>
                </div>
                {error && <p style={{ margin: 0, color: "var(--rose)", fontSize: 14 }}>{error}</p>}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
                  <button type="button" className="btn btn--dark" onClick={confirm} disabled={saving || !d.name.trim()} data-tour="looks-right">{saving ? "Saving…" : "Looks right"} <span aria-hidden="true">→</span></button>
                  <span style={{ fontSize: 14, color: "var(--text-3)" }}>{!d.name.trim() ? "Add your name to continue." : "Next: swipe real roles so we get to know you."}</span>
                </div>
              </div>
            )}

            {/* 4. Swipe */}
            {step === "swipe" && item && (
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
                  <h1>{quick ? (quick.kind === "city" ? <>Would you <em>move?</em></> : quick.kind === "dream" ? <>Dream <em>company?</em></> : <>This <em>or that?</em></>) : <>Would you <em>take this?</em></>}</h1>
                  <div style={{ minWidth: 200 }} data-tour="confidence">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span className="label">how well we know you</span>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{confShown}%</span>
                    </div>
                    <div style={{ marginTop: 6, height: 4, borderRadius: 4, background: "var(--bg-2)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${conf}%`, background: "var(--accent)", transition: "width .5s var(--ease)" }} />
                    </div>
                  </div>
                </div>

                {current && (
                  <div key={current.role.id} className="fade" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: "var(--accent-soft)", border: "1px solid var(--accent-line)" }} data-tour="reason">
                    <span className="mono" style={{ fontSize: 10.5, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--accent-deep)" }}>{current.probe === "open" ? "starting" : current.probe.startsWith("explore") ? "exploring" : current.probe === "confirm" ? "checking fit" : "testing"}</span>
                    <span style={{ fontSize: 14.5, color: "var(--ink)" }}>{current.reason.replace(/^(Exploring|Checking|Testing): /, "")}</span>
                  </div>
                )}
                {quick && (
                  <div key={quick.id} className="fade" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: "var(--rose-soft)", border: "1px solid rgba(196,71,122,.3)" }} data-tour="reason">
                    <span className="mono" style={{ fontSize: 10.5, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--rose)" }}>quick one</span>
                    <span style={{ fontSize: 14.5, color: "var(--ink)" }}>{quick.label}: swipe to pick a side</span>
                  </div>
                )}

                {quick && (
                  <div key={`q-${quick.id}`} className="tile fade" data-quick={quick.id} data-tour="quick"
                    style={{ height: 268, padding: 22, display: "flex", flexDirection: "column", boxShadow: "var(--sh-md)", transform: fling === "left" ? "translateX(-480px) rotate(-6deg)" : fling === "right" ? "translateX(480px) rotate(6deg)" : fling === "up" ? "translateY(-360px)" : "none", opacity: fling ? 0 : 1, transition: "transform .2s var(--ease), opacity .2s var(--ease)" }}>
                    <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-.03em", lineHeight: 1.2 }}>{quick.question}</div>
                    {quick.kind === "city" && quick.count ? <div className="mono" style={{ marginTop: 6, fontSize: 12, color: "var(--text-3)" }}>{quick.count} open roles there right now</div> : null}
                    <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {(["left", "right"] as const).map((side) => (
                        <button key={side} type="button" onClick={() => answerQuick(side)} data-tour={`quick-${side}`}
                          style={{ textAlign: "left", padding: "16px 16px", borderRadius: 14, border: "1px solid var(--border-2)", background: "#fff", cursor: "pointer", font: "inherit", transition: "border-color .15s, background .15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent-soft)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.background = "#fff"; }}>
                          <span className="mono" style={{ display: "block", fontSize: 11, color: "var(--text-3)" }}>{side === "left" ? "← swipe left" : "swipe right →"}</span>
                          <span style={{ display: "block", marginTop: 4, fontSize: 15.5, fontWeight: 500, lineHeight: 1.35 }}>{quick[side]}</span>
                        </button>
                      ))}
                    </div>
                    {quick.either && (
                      <button type="button" className="link" onClick={() => answerQuick("either")} style={{ marginTop: 10, alignSelf: "center", fontSize: 13.5 }} data-tour="quick-either">↑ {quick.either}</button>
                    )}
                  </div>
                )}

                {current && <div style={{ position: "relative", height: 268, userSelect: "none" }} data-tour="deck">
                  {[2, 1].map((depth) => (
                    <div key={depth} aria-hidden="true" className="tile" style={{ position: "absolute", inset: 0, transform: `translateY(${depth * 8}px) scale(${1 - depth * 0.03})`, opacity: 1 - depth * 0.25 }} />
                  ))}
                  {(() => {
                    const c = current.role;
                    const hits = skillHits(c, d.skills);
                    return (
                      <div
                        key={c.id}
                        data-cluster={c.cluster}
                        data-probe={current.probe}
                        data-monthly={c.monthly ?? ""}
                        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setDrag({ x: 0, start: e.clientX }); }}
                        onPointerMove={(e) => drag && setDrag({ ...drag, x: e.clientX - drag.start })}
                        onPointerUp={() => { if (drag && Math.abs(drag.x) > 90) decide(drag.x > 0 ? "like" : "pass"); else setDrag(null); }}
                        className="tile fade"
                        style={{ position: "absolute", inset: 0, padding: 22, display: "flex", flexDirection: "column", cursor: "grab", touchAction: "none", boxShadow: "var(--sh-md)",
                          transform: `translate(${dx}px, ${dy}px) rotate(${dx / 36}deg)`, transition: drag && !fling ? "none" : "transform .22s var(--ease), opacity .22s var(--ease)", opacity: fling ? 0 : 1 }}
                      >
                        {dx !== 0 && (
                          <span className={`tag ${dx > 0 ? "mint" : "rose"}`} style={{ position: "absolute", top: 18, [dx > 0 ? "right" : "left"]: 18, opacity: Math.min(1, Math.abs(dx) / 90) } as React.CSSProperties}>
                            {dx > 0 ? "interested" : "not for me"}
                          </span>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span className="sq" style={{ background: CLUSTER_COLOR[c.cluster] }}>{initials(c.company)}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 500, fontSize: 15 }}>{c.company}</div>
                            <div className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>{c.focus.toLowerCase()} · {c.big ? "big company" : "startup"}</div>
                          </div>
                          <span className="tag" style={{ marginLeft: "auto" }}>{c.cluster.toLowerCase()}</span>
                        </div>
                        <div style={{ marginTop: 16, fontSize: 26, fontWeight: 600, letterSpacing: "-.03em", lineHeight: 1.15 }}>{c.title}</div>
                        <div style={{ marginTop: 6, fontSize: 14, color: hits.length ? "var(--mint)" : "var(--text-3)" }}>
                          {hits.length ? `Uses your ${hits.join(", ")}` : "Doesn't use your resume skills: a stretch"}
                        </div>
                        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {tags(c).map((t) => <span key={t.text} className={`tag ${t.tone}`}>{t.text}</span>)}
                        </div>
                        <dl style={{ marginTop: "auto", marginBottom: 0, paddingTop: 14, borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                          {[["stipend", c.stipend], ["where", c.city ?? c.location], ["length", c.duration]].map(([k, v]) => (
                            <div key={k} style={{ minWidth: 0 }}>
                              <dt className="label">{k}</dt>
                              <dd style={{ margin: "2px 0 0", fontSize: 14.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    );
                  })()}
                </div>}

                {current && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                    <button type="button" className="btn btn--ghost" onClick={() => decide("pass")} data-tour="pass" style={{ minWidth: 140 }}>Not for me</button>
                    <button type="button" className="btn btn--ghost" onClick={() => decide("love")} data-tour="love" style={{ minWidth: 120, color: "var(--amber)", borderColor: "rgba(180,128,30,.35)", background: "var(--amber-soft)" }}>★ Love it</button>
                    <button type="button" className="btn btn--dark" onClick={() => decide("like")} data-tour="like" style={{ minWidth: 140 }}>Interested</button>
                  </div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, fontSize: 13, color: "var(--text-3)" }}>
                  <span><span className="mono" style={{ fontSize: 11.5 }}>← ↑ →</span> or drag · {answeredCount} answered · {fitNow} roles fit so far</span>
                  {answeredCount >= 12 && <button type="button" className="link" onClick={() => setStep("proud")}>That's enough, show me →</button>}
                </div>
                {justLearned && (
                  <div key={justLearned.text} className="fade" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: "var(--mint-soft)", border: "1px solid rgba(30,158,110,.25)" }} data-tour="just-learned">
                    <span className="mono" style={{ fontSize: 10.5, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--mint)" }}>just learned</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{justLearned.text}</span>
                    <span className="mono" style={{ fontSize: 11.5, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{justLearned.evidence}</span>
                  </div>
                )}
              </div>
            )}

            {/* 4b. One line they're proud of (the only typing in the whole flow) */}
            {step === "proud" && (
              <div style={{ display: "grid", gap: 18 }} className="fade" data-tour="proud">
                <div>
                  <span className="tag rose">last one · optional</span>
                  <h1 style={{ marginTop: 14 }}>One thing you're <em>proud of?</em></h1>
                  <p className="lead">Something you built or did, in a line or two. It becomes the opening line of your outreach.</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); setStep("learned"); }} style={{ display: "grid", gap: 12 }}>
                  <label htmlFor="start-proud" className="sr-only">One thing you're proud of</label>
                  <textarea id="start-proud" value={proud} onChange={(e) => setProud(e.target.value.slice(0, 300))} rows={3} autoFocus
                    placeholder={d.experience[0] ? `e.g. As ${d.experience[0].title} at ${d.experience[0].company}, I built…` : "e.g. Built a dashboard my college club still uses"}
                    style={{ width: "100%", border: "1px solid var(--border-2)", borderRadius: 14, padding: "12px 14px", font: "400 15px var(--sans)", color: "var(--ink)", resize: "vertical", outline: "none" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button type="submit" className="btn btn--dark" data-tour="proud-next">{proud.trim() ? "Save and see what we learned" : "Skip"} <span aria-hidden="true">→</span></button>
                    <span className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>{proud.length}/300</span>
                  </div>
                </form>
              </div>
            )}

            {/* 4c. What we learned */}
            {step === "learned" && (
              <div style={{ display: "grid", gap: 20 }} data-tour="learned" className="fade">
                <div>
                  <span className="tag mint">{answeredCount} answers · {conf}% sure</span>
                  <h1 style={{ marginTop: 14 }}>Here's what we <em>learned</em> about you.</h1>
                  {learned?.matters.length ? (
                    <p className="lead">What decides it for you: {learned.matters.map((m, i) => <span key={m}>{i > 0 && <span style={{ color: "var(--text-4)" }}> › </span>}<span style={{ color: "var(--ink)", fontWeight: 500 }}>{m}</span></span>)}</p>
                  ) : null}
                </div>
                <div className="tile" style={{ overflow: "hidden" }}>
                  {(learned?.insights ?? []).map((i) => (
                    <div key={i.text} className="row" style={{ alignItems: "flex-start" }}>
                      <span className={`tag ${INSIGHT_TONE[i.kind]}`} style={{ marginTop: 2, minWidth: 84, justifyContent: "center", flexShrink: 0 }}>{i.kind === "avoid" ? "not for you" : i.kind === "values" ? "values" : i.kind === "plan" ? "plans" : i.kind}</span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 15, fontWeight: 500 }}>{i.text}</span>
                        <span className="mono" style={{ display: "block", fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>{i.evidence}</span>
                      </span>
                    </div>
                  ))}
                  {!learned?.insights.length && <div className="row" style={{ color: "var(--text-3)", fontSize: 14 }}>Swipe a few more and we'll have a clearer picture.</div>}
                </div>
                {!!learned?.best.length && (
                  <div>
                    <div className="label" style={{ marginBottom: 8 }}>your best matches you haven't seen</div>
                    <div className="tile" style={{ overflow: "hidden" }}>
                      {learned.best.map(({ role, match }) => (
                        <a key={role.id} href={`/internships/${role.slug}`} target="_blank" rel="noopener" className="row" style={{ textDecoration: "none", color: "inherit" }}>
                          <span className="sq" style={{ background: CLUSTER_COLOR[role.cluster] }}>{initials(role.company)}</span>
                          <span style={{ minWidth: 0, flex: 1 }}>
                            <span style={{ display: "block", fontWeight: 500, fontSize: 15 }}>{role.title}</span>
                            <span className="mono" style={{ display: "block", fontSize: 11.5, color: "var(--text-3)" }}>{role.company} · {role.city ?? "remote"} · {role.stipend}</span>
                          </span>
                          <span className="tag">{role.focus.toLowerCase()}</span>
                          <span style={{ fontWeight: 600, fontSize: 17, width: 44, textAlign: "right" }}>{Math.round(match * 100)}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
                  <button type="button" className="btn btn--dark" onClick={toCities} data-tour="to-cities">Looks like me <span aria-hidden="true">→</span></button>
                  {item && <button type="button" className="link" onClick={() => setStep("swipe")}>Not quite, keep swiping</button>}
                </div>
              </div>
            )}

            {/* 5. Cities */}
            {(step === "cities" || step === "saving") && (
              <div data-tour="cities" style={{ display: "grid", gap: 18 }} className="fade">
                <div>
                  <h1>Where would you <em>work?</em></h1>
                  <p className="lead">{cities.length ? "Picked from the roles you kept. Tap a city on the map or below to add or remove it." : "Tap the cities you'd work in."}</p>
                </div>
                <div className="tile" style={{ overflow: "hidden", background: "var(--bg)" }}>
                  <RoleMap home={home} places={places} onToggle={toggleCity} height={340} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {cityCounts.slice(0, 10).map(([c, n]) => {
                    const on = cities.includes(c);
                    return (
                      <button key={c} type="button" className={`chip${on ? " on" : ""}`} onClick={() => toggleCity(c)}>
                        {on && <Tick />}{c} <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>{n}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
                  <button type="button" className="btn btn--dark" onClick={finish} disabled={step === "saving"} data-tour="finish">{step === "saving" ? "Setting up…" : "Finish signup"} <span aria-hidden="true">→</span></button>
                  <span style={{ fontSize: 14, color: "var(--text-3)" }}>That's it. Your profile is complete.</span>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Profile strip with a live map */}
        <div className="panel" style={{ width: "100%", maxWidth: 760, marginTop: 16, display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", boxShadow: "var(--sh-md)" }} data-tour="card">
          <div style={{ padding: "16px 18px", minWidth: 0, display: "grid", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="sq" style={{ background: shown.name ? "var(--accent)" : "var(--bg-2)", color: shown.name ? "#fff" : "var(--text-4)" }}>{shown.name ? initials(shown.name) : "?"}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{shown.name || "Your profile"}</div>
                <div className="mono" style={{ fontSize: 11.5, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{[shown.course, shown.college, shown.gradYear && `’${shown.gradYear.slice(-2)}`].filter(Boolean).join(" · ").toLowerCase() || "builds itself as you go"}</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 18 }}>
                {[["skills", shown.skills.length], ["fit", pool.length ? fitNow : 0], ["sure", conf ? `${conf}%` : 0]].map(([k, v]) => (
                  <div key={k as string} style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.1 }}>{v || "–"}</div>
                    <div className="label" style={{ fontSize: 10 }}>{k}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {shown.skills.slice(0, 5).map((s) => <span key={s} className="tag plain">{s}</span>)}
              {(learned?.clusters ?? []).slice(0, 2).map((c) => <span key={c} className="tag">{c.toLowerCase()}</span>)}
              {learned?.minMonthly ? <span className="tag mint">₹{Math.round(learned.minMonthly / 1000)}k+</span> : null}
            </div>
          </div>
          <div style={{ width: 220, borderLeft: "1px solid var(--border)", background: "var(--bg)" }} title="Your map">
            <RoleMap home={home} places={places} height={104} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
