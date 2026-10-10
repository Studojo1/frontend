import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import type { QuickResume } from "~/lib/resume-quick-parse";
import { type Cluster } from "~/lib/swipe-prefs";
import { confidence, believe, learn, nextCard, predict, skillHits, type BrainRole, type CardPick, type Swipe, type Verdict, type Insight } from "~/lib/swipe-brain";
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
 * One card on the sensei.studojo.com background, a profile strip with a live
 * map under it. Then it hands off to /app for a short "tell us more" chat.
 */

export function meta() {
  return [
    { title: "Start | Studojo" },
    { name: "description", content: "Drop your resume. That's the signup." },
  ];
}

type Step = "drop" | "reading" | "verify" | "confirm" | "swipe" | "learned" | "cities" | "saving";

const CONSENT_PENDING_KEY = "sj_consent_pending";
const STASH_KEY = "sj_start_resume";

const BTN =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-500 text-white font-bold text-sm border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all font-['Satoshi'] disabled:opacity-60 disabled:pointer-events-none";
const BTN_GHOST =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-neutral-900 font-bold text-sm border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all font-['Satoshi']";
const CARD = "rounded-2xl border-2 border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]";
const LABEL = "font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-neutral-500";
const H1 = "font-['Clash_Display'] text-4xl md:text-[44px] font-bold leading-[1.04] text-neutral-900";

const STEPS: { key: Step[]; label: string }[] = [
  { key: ["drop", "reading"], label: "Drop your resume" },
  { key: ["verify"], label: "Verify your email" },
  { key: ["confirm"], label: "Check what we found" },
  { key: ["swipe", "learned"], label: "Get to know you" },
  { key: ["cities", "saving"], label: "Pick your cities" },
];

const CLUSTER_STYLE: Record<Cluster, string> = {
  Analytics: "bg-violet-200", Product: "bg-pink-200", Engineering: "bg-sky-200", Design: "bg-fuchsia-200",
  Marketing: "bg-orange-200", Finance: "bg-emerald-200", Consulting: "bg-teal-200", Sales: "bg-amber-200",
  Content: "bg-rose-200", HR: "bg-lime-200", Operations: "bg-slate-200", Other: "bg-neutral-200",
};
const INSIGHT_STYLE: Record<Insight["kind"], { icon: string; bg: string }> = {
  work: { icon: "◆", bg: "bg-violet-200" },
  avoid: { icon: "✕", bg: "bg-neutral-200" },
  place: { icon: "➚", bg: "bg-sky-200" },
  pay: { icon: "₹", bg: "bg-emerald-200" },
  length: { icon: "◷", bg: "bg-amber-200" },
  company: { icon: "▣", bg: "bg-pink-200" },
  fit: { icon: "✦", bg: "bg-orange-200" },
  speed: { icon: "⚡", bg: "bg-yellow-200" },
};

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
const Check = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
  const [current, setCurrent] = useState<CardPick | null>(null);
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
  const learned = useMemo(() => (swipes.length ? learn(pool, swipes, ctx) : null), [pool, swipes, ctx]);
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
      for (let i = 1; i <= 7; i++) { setRevealed(i); await sleep(240); }
      await sleep(900);
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
      const first = nextCard(list, [], { homeCity: d.city || null, skills: d.skills }, []);
      setCurrent(first);
      setShownAt(performance.now());
      setStep(first ? "swipe" : "learned");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── 4. Swipe: every next card is chosen from what they've kept and passed ──
  const decide = useCallback((verdict: Verdict) => {
    if (!current || fling) return;
    const ms = Math.round(performance.now() - shownAt);
    setFling(verdict === "pass" ? "left" : verdict === "love" ? "up" : "right");
    setTimeout(() => {
      const nextSwipes = [...swipes, { id: current.role.id, verdict, ms }];
      const nextProbes = [...probes, current.probe];
      const before = learned?.insights.map((i) => i.text) ?? [];
      const after = learn(pool, nextSwipes, ctx).insights;
      setJustLearned(after.find((i) => !before.includes(i.text)) ?? null);
      setSwipes(nextSwipes);
      setProbes(nextProbes);
      const n = nextCard(pool, nextSwipes, ctx, nextProbes);
      setCurrent(n);
      setShownAt(performance.now());
      setFling(null);
      setDrag(null);
      if (!n) setStep("learned");
    }, 240);
  }, [current, fling, shownAt, swipes, probes, pool, ctx, learned]);

  useEffect(() => {
    if (step !== "swipe") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") decide("like");
      if (e.key === "ArrowLeft") decide("pass");
      if (e.key === "ArrowUp") decide("love");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, decide]);

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
  const dx = fling === "right" ? 560 : fling === "left" ? -560 : drag?.x ?? 0;
  const dy = fling === "up" ? -480 : 0;
  const tags = (c: BrainRole) => {
    const out: { text: string; cls: string }[] = [];
    if (c.city && d.city && c.city === d.city) out.push({ text: "Near you", cls: "bg-emerald-100 text-emerald-800" });
    else if (c.city) out.push({ text: `Move to ${c.city}`, cls: "bg-sky-100 text-sky-800" });
    else out.push({ text: "Remote", cls: "bg-violet-100 text-violet-800" });
    if (c.monthly) out.push({ text: c.monthly >= 35000 ? "Well paid" : c.monthly < 15000 ? "Low stipend" : "Paid", cls: c.monthly < 15000 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800" });
    else out.push({ text: "Stipend not stated", cls: "bg-amber-100 text-amber-800" });
    out.push({ text: c.big ? "Big company" : "Startup", cls: "bg-neutral-100 text-neutral-700" });
    if (c.months && c.months >= 6) out.push({ text: "6+ months", cls: "bg-neutral-100 text-neutral-700" });
    return out;
  };

  return (
    <div className="relative min-h-screen">
      <SenseiBackdrop />
      <style>{`
        @keyframes sjPop { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
        .sj-pop { animation: sjPop .35s ease both }
        @media (prefers-reduced-motion: reduce) { .sj-pop { animation: none } }
      `}</style>

      <div className="relative z-10 flex min-h-screen flex-col items-center px-4 pb-6 pt-5">
        <header className="flex w-full max-w-[720px] items-center justify-between gap-4">
          <Link to="/" className="font-['Clash_Display'] text-2xl font-bold text-neutral-900">studojo</Link>
          {!signedIn && <Link to="/auth?mode=signin" className="font-['Satoshi'] text-sm font-bold text-neutral-900 hover:underline">Sign in</Link>}
        </header>
        <div className="mt-4 flex w-full max-w-[720px] items-center gap-1.5" data-tour="progress" aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <span key={s.label} className={`h-2.5 w-8 rounded-full border-2 border-neutral-900 transition-colors ${i < stepIndex ? "bg-neutral-900" : i === stepIndex ? "bg-violet-500" : "bg-white"}`} />
          ))}
          <span className="ml-2 font-['Satoshi'] text-xs font-bold text-neutral-600">{STEPS[stepIndex]?.label}</span>
        </div>

        <main className="mt-4 w-full max-w-[720px] rounded-3xl border-2 border-neutral-900 bg-white/95 p-6 shadow-[8px_8px_0px_0px_rgba(25,26,35,0.9)] backdrop-blur md:p-8" data-tour="main">
          <div className="flex flex-col gap-6">
            {/* 1. Drop */}
            {(step === "drop" || step === "reading") && (
              <>
                <div>
                  <span className="inline-block -rotate-2 rounded-lg border-2 border-neutral-900 bg-amber-300 px-2.5 py-1 font-['Satoshi'] text-xs font-bold shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">No forms · no password</span>
                  <h1 className={`${H1} mt-4`}>Drop your resume.<br /><span className="text-violet-600">That's the signup.</span></h1>
                  <p className="mt-3 max-w-xl font-['Satoshi'] text-base text-neutral-600">We read it in a second, then get to know you from a few swipes on real roles. No questionnaire.</p>
                </div>
                <label
                  data-tour="dropzone"
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) void readFile(f); }}
                  className={`relative block overflow-hidden rounded-2xl border-[3px] border-dashed bg-white transition-colors ${dragOver ? "border-violet-500 bg-violet-50" : "border-neutral-900"} ${step === "reading" ? "pointer-events-none p-5" : "cursor-pointer p-8"}`}
                >
                  <input id="start-resume" type="file" accept=".pdf,.txt,application/pdf,text/plain" className="sr-only"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) void readFile(f); e.target.value = ""; }} />
                  {step === "reading" ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 animate-ping rounded-full bg-violet-500" />
                        <span className="truncate font-['Clash_Display'] text-lg font-bold text-neutral-900">Reading {fileName}</span>
                        <span className="ml-auto font-['Satoshi'] text-sm font-bold tabular-nums text-neutral-500">{Math.min(revealed, 7)}/7</span>
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {([["Name", d.name], ["Email", d.email], ["College", d.college], ["Course", d.course], ["Graduating", d.gradYear], ["City", d.city], ["Skills", d.skills.length ? `${d.skills.length} found` : ""]] as [string, string][]).map(([k, v], i) => (
                          <div key={k} className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 transition-all ${i < revealed ? "border-neutral-900 bg-emerald-50" : "border-neutral-200 opacity-50"}`}>
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${i < revealed && v ? "bg-emerald-500 text-white" : "bg-neutral-100"}`}>{i < revealed && v ? <Check /> : null}</span>
                            <span className={`${LABEL} w-20 shrink-0`}>{k}</span>
                            <span className="truncate font-['Satoshi'] text-sm font-semibold text-neutral-900">{i < revealed ? v || "not found" : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-neutral-900 bg-amber-300 font-['Clash_Display'] text-2xl font-bold shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">↓</div>
                      <div className="mt-4 font-['Clash_Display'] text-xl font-bold text-neutral-900">Drop your resume here</div>
                      <div className="mt-1 font-['Satoshi'] text-sm text-neutral-500">or <span className="font-bold text-violet-700 underline">choose a file</span> · PDF up to 5 MB</div>
                    </div>
                  )}
                </label>
                {error && <p className="font-['Satoshi'] text-sm font-semibold text-red-600">{error}</p>}
                {step === "drop" && (
                  <div className="flex flex-wrap items-center gap-3">
                    {!signedIn && (
                      <button type="button" className={BTN_GHOST} onClick={() => {
                        try { localStorage.setItem(CONSENT_PENDING_KEY, "1"); } catch {}
                        authClient.signIn.social({ provider: "google", callbackURL: "/start", errorCallbackURL: "/auth?redirect=%2Fstart" });
                      }}>No resume handy? Continue with Google</button>
                    )}
                    <p className="max-w-sm font-['Satoshi'] text-xs text-neutral-500">
                      By continuing, you confirm you are 18 or older and agree to our{" "}
                      <a href="/terms" target="_blank" rel="noopener" className="underline">Terms of Service</a> and{" "}
                      <a href="/privacy" target="_blank" rel="noopener" className="underline">Privacy Policy</a>.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* 2. Verify */}
            {step === "verify" && (
              <div data-tour="verify" className="space-y-6">
                <div>
                  <span className="inline-block -rotate-2 rounded-lg border-2 border-neutral-900 bg-emerald-300 px-2.5 py-1 font-['Satoshi'] text-xs font-bold shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">✓ Resume read · {d.name || "you"}</span>
                  <h1 className={`${H1} mt-4`}>Check your inbox.</h1>
                  {sentTo && !changingEmail ? (
                    <p className="mt-3 font-['Satoshi'] text-base text-neutral-600">
                      Your resume says <span className="font-bold text-neutral-900">{sentTo}</span>. We sent a 6-digit code there.{" "}
                      <button type="button" onClick={() => setChangingEmail(true)} className="font-bold text-violet-700 hover:text-violet-900">Wrong address?</button>
                    </p>
                  ) : (
                    <p className="mt-3 font-['Satoshi'] text-base text-neutral-600">{d.email ? "Where should we send your code?" : "We couldn't find an email on your resume. Where should we send your code?"}</p>
                  )}
                </div>
                {sentTo && !changingEmail ? (
                  <div>
                    <label htmlFor="start-code" className={LABEL}>6-digit code</label>
                    <div className="relative mt-3 inline-block">
                      <input id="start-code" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={6} value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="absolute inset-0 opacity-0" />
                      <div className="flex gap-2" aria-hidden="true">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className={`flex h-14 w-11 items-center justify-center rounded-xl border-2 font-['Clash_Display'] text-2xl font-bold sm:h-16 sm:w-12 ${code[i] ? "border-neutral-900 bg-violet-50" : i === code.length ? "border-violet-500 bg-white" : "border-neutral-900 bg-white"}`}>{code[i] ?? ""}</div>
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 font-['Satoshi'] text-sm text-neutral-500">
                      {verifying ? "Checking…" : "You're signed in as soon as you type the last digit. No password to remember."}{" "}
                      {!verifying && <button type="button" onClick={() => void sendCode(sentTo)} className="font-bold text-violet-700 hover:text-violet-900">Send a new code</button>}
                    </p>
                  </div>
                ) : (
                  <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); if (/\S+@\S+\.\S+/.test(d.email)) void sendCode(d.email.trim().toLowerCase()); }}>
                    <label htmlFor="start-email" className="sr-only">Email</label>
                    <input id="start-email" type="email" value={d.email} onChange={(e) => setD((x) => ({ ...x, email: e.target.value }))} placeholder="you@college.edu"
                      className="min-w-0 flex-1 rounded-xl border-2 border-neutral-300 px-3 py-2 font-['Satoshi'] text-base focus:border-violet-500 focus:outline-none" />
                    <button type="submit" className={BTN}>Send code</button>
                  </form>
                )}
                {error && <p className="font-['Satoshi'] text-sm font-semibold text-red-600">{error}</p>}
              </div>
            )}

            {/* 3. Confirm */}
            {step === "confirm" && (
              <div data-tour="confirm" className="space-y-5">
                <div>
                  <h1 className={H1}>Did we get it right?</h1>
                  <p className="mt-3 font-['Satoshi'] text-base text-neutral-600">
                    Tap anything that's wrong.{" "}
                    {d.unsure.size ? <>The <span className="rounded bg-amber-200 px-1 font-bold text-neutral-900">amber</span> ones we weren't sure about.</> : "Everything came straight off your resume."}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {([["name", "Name", d.name, "Your full name"], ["college", "College", d.college, "e.g. Christ University"], ["course", "Course", d.course, "e.g. BBA, B.Tech"], ["gradYear", "Graduating", d.gradYear, "e.g. 2027"], ["city", "Based in", d.city, "e.g. Bengaluru"]] as [keyof Draft, string, string, string][]).map(([key, label, value, ph]) => {
                    const unsure = d.unsure.has(key as string);
                    const mine = d.edited.has(key === "gradYear" ? "year" : (key as string));
                    const pill = unsure ? { t: "Check this", cls: "bg-amber-300 text-neutral-900" } : !value ? { t: "Add", cls: "bg-neutral-100 text-neutral-600" } : mine ? { t: "Edited", cls: "bg-violet-200 text-violet-900" } : { t: "From resume", cls: "bg-emerald-200 text-emerald-900" };
                    return editing === key ? (
                      <div key={key} className="rounded-xl border-2 border-violet-500 bg-white p-3 shadow-[3px_3px_0px_0px_rgba(139,92,246,1)]">
                        <label htmlFor={`start-${key}`} className={`${LABEL} text-violet-700`}>{label}</label>
                        <input id={`start-${key}`} autoFocus defaultValue={value} placeholder={ph}
                          onBlur={(e) => { setField(key, e.target.value.trim()); setEditing(null); }}
                          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                          className="mt-1 w-full bg-transparent font-['Satoshi'] text-base font-bold text-neutral-900 focus:outline-none" />
                      </div>
                    ) : (
                      <button key={key} type="button" data-tour={`field-${key}`} onClick={() => setEditing(key as string)}
                        className={`rounded-xl border-2 p-3 text-left transition-all hover:-translate-y-0.5 ${unsure ? "border-dashed border-amber-500 bg-amber-50" : value ? "border-neutral-900 bg-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]" : "border-dashed border-neutral-300 bg-white"}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className={LABEL}>{label}</span>
                          <span className={`rounded-full px-2 py-0.5 font-['Satoshi'] text-[10px] font-bold ${pill.cls}`}>{pill.t}</span>
                        </div>
                        <div className={`mt-1 truncate font-['Satoshi'] text-base font-bold ${value ? "text-neutral-900" : "text-neutral-400"}`}>{value || ph}</div>
                      </button>
                    );
                  })}
                  <div className="rounded-xl border-2 border-neutral-900 bg-white p-3 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
                    <span className={LABEL}>Experience</span>
                    {d.experience.length ? (
                      <ul className="mt-1 space-y-0.5">
                        {d.experience.slice(0, 2).map((e, i) => <li key={i} className="truncate font-['Satoshi'] text-sm"><span className="font-bold">{e.title}</span>{e.company && <span className="text-neutral-500"> · {e.company}</span>}</li>)}
                      </ul>
                    ) : <div className="mt-1 font-['Satoshi'] text-sm text-neutral-400">None yet. That's fine.</div>}
                  </div>
                </div>
                <div className="rounded-xl border-2 border-neutral-900 bg-white p-3 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]" data-tour="skills">
                  <div className="flex items-center justify-between">
                    <span className={LABEL}>Skills · {d.skills.length}</span>
                    <span className="font-['Satoshi'] text-xs text-neutral-500">Tap × to remove</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {d.skills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-full border-2 border-neutral-900 bg-violet-100 py-0.5 pl-2.5 pr-1 font-['Satoshi'] text-xs font-bold text-neutral-900">
                        {s}
                        <button type="button" aria-label={`Remove ${s}`} onClick={() => setD((x) => ({ ...x, skills: x.skills.filter((k) => k !== s), edited: new Set(x.edited).add("skills") }))}
                          className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-violet-300">×</button>
                      </span>
                    ))}
                    <form onSubmit={(e) => { e.preventDefault(); const s = newSkill.trim(); if (s && !d.skills.some((k) => k.toLowerCase() === s.toLowerCase())) setD((x) => ({ ...x, skills: [...x.skills, s], edited: new Set(x.edited).add("skills") })); setNewSkill(""); }}>
                      <label htmlFor="start-skill" className="sr-only">Add a skill</label>
                      <input id="start-skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="+ add skill"
                        className="w-28 rounded-full border-2 border-dashed border-neutral-400 px-2.5 py-0.5 font-['Satoshi'] text-xs focus:border-violet-500 focus:outline-none" />
                    </form>
                  </div>
                </div>
                {error && <p className="font-['Satoshi'] text-sm font-semibold text-red-600">{error}</p>}
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={confirm} disabled={saving || !d.name.trim()} className={BTN} data-tour="looks-right">{saving ? "Saving…" : "Looks right →"}</button>
                  <span className="font-['Satoshi'] text-sm text-neutral-500">{!d.name.trim() ? "Add your name to continue." : "Next: swipe real roles so we get to know you."}</span>
                </div>
              </div>
            )}

            {/* 4. Swipe */}
            {step === "swipe" && current && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <span className="inline-block -rotate-2 rounded-lg border-2 border-neutral-900 bg-violet-300 px-2.5 py-1 font-['Satoshi'] text-xs font-bold shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">Getting to know you</span>
                    <h1 className={`${H1} mt-3`}>Would you take this?</h1>
                  </div>
                  <div className="min-w-[180px]" data-tour="confidence">
                    <div className="flex items-baseline justify-between font-['Satoshi'] text-xs font-bold text-neutral-600">
                      <span>How well we know you</span>
                      <span className="font-['Clash_Display'] text-lg text-neutral-900 tabular-nums">{confShown}%</span>
                    </div>
                    <div className="mt-1 h-2.5 overflow-hidden rounded-full border-2 border-neutral-900 bg-white">
                      <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${conf}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl border-2 border-dashed border-violet-400 bg-violet-50 px-3 py-2 font-['Satoshi'] text-sm font-semibold text-violet-900 sj-pop" key={current.role.id} data-tour="reason">
                  <span aria-hidden="true">✦</span>
                  <span>{current.reason}</span>
                </div>

                <div className="relative h-[290px] select-none" data-tour="deck">
                  {[2, 1].map((depth) => (
                    <div key={depth} aria-hidden="true" className="absolute inset-0 rounded-2xl border-2 border-neutral-900 bg-white" style={{ transform: `translateY(${depth * 9}px) scale(${1 - depth * 0.035})` }} />
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
                        className="absolute inset-0 flex cursor-grab touch-none flex-col rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] sj-pop"
                        style={{ transform: `translate(${dx}px, ${dy}px) rotate(${dx / 22}deg)`, transition: drag && !fling ? "none" : "transform .24s ease, opacity .24s", opacity: fling ? 0.4 : 1 }}
                      >
                        {dx !== 0 && (
                          <span className={`absolute top-4 rounded-lg border-2 px-2 py-0.5 font-['Clash_Display'] text-lg font-bold ${dx > 0 ? "right-4 rotate-6 border-emerald-600 bg-emerald-50 text-emerald-700" : "left-4 -rotate-6 border-red-500 bg-red-50 text-red-600"}`} style={{ opacity: Math.min(1, Math.abs(dx) / 90) }}>
                            {dx > 0 ? "INTERESTED" : "NOT FOR ME"}
                          </span>
                        )}
                        <div className="flex items-center gap-3">
                          <span className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 border-neutral-900 ${CLUSTER_STYLE[c.cluster]} font-['Clash_Display'] text-sm font-bold`}>
                            {c.company.replace(/[^A-Za-z0-9 ]/g, "").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <div className="font-['Satoshi'] text-sm font-bold text-neutral-900">{c.company}</div>
                            <div className="font-['Satoshi'] text-xs text-neutral-500">is hiring · {c.focus}</div>
                          </div>
                          <span className={`ml-auto rounded-full border-2 border-neutral-900 ${CLUSTER_STYLE[c.cluster]} px-2.5 py-0.5 font-['Satoshi'] text-xs font-bold`}>{c.cluster}</span>
                        </div>
                        <div className="mt-3 font-['Clash_Display'] text-[28px] font-bold leading-tight text-neutral-900">{c.title}</div>
                        <div className={`mt-1.5 flex items-center gap-1.5 font-['Satoshi'] text-sm font-semibold ${hits.length ? "text-emerald-700" : "text-neutral-500"}`}>
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {hits.length ? `Uses your ${hits.join(", ")}` : "Doesn't use your resume skills: a stretch"}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {tags(c).map((t) => <span key={t.text} className={`rounded-full px-2.5 py-0.5 font-['Satoshi'] text-xs font-bold ${t.cls}`}>{t.text}</span>)}
                        </div>
                        <dl className="mt-auto grid grid-cols-3 gap-3 border-t-2 border-neutral-100 pt-3">
                          {[["Stipend", c.stipend], ["Where", c.city ?? c.location], ["Length", c.duration]].map(([k, v]) => (
                            <div key={k} className="min-w-0"><dt className={LABEL}>{k}</dt><dd className="truncate font-['Satoshi'] text-sm font-bold text-neutral-900">{v}</dd></div>
                          ))}
                        </dl>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button type="button" onClick={() => decide("pass")} className={`${BTN_GHOST} min-w-[130px]`} data-tour="pass">✕ Not for me</button>
                  <button type="button" onClick={() => decide("love")} className={`${BTN_GHOST} min-w-[110px] !bg-amber-200`} data-tour="love">★ Love it</button>
                  <button type="button" onClick={() => decide("like")} className={`${BTN} min-w-[130px]`} data-tour="like">♥ Interested</button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 font-['Satoshi'] text-xs text-neutral-500">
                  <span>Drag, tap, or use ← ↑ →. {swipes.length} answered · {fitNow} roles fit so far</span>
                  {swipes.length >= 6 && <button type="button" onClick={() => setStep("learned")} className="font-bold text-violet-700 hover:text-violet-900">That's enough, show me →</button>}
                </div>
                {justLearned && (
                  <div key={justLearned.text} className="flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-emerald-50 px-3 py-2 font-['Satoshi'] text-sm sj-pop" data-tour="just-learned">
                    <span className="shrink-0 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Just learned</span>
                    <span className="font-semibold text-neutral-900">{justLearned.text}</span>
                    <span className="truncate text-neutral-500">({justLearned.evidence})</span>
                  </div>
                )}
              </div>
            )}

            {/* 4b. What we learned */}
            {step === "learned" && (
              <div className="space-y-5" data-tour="learned">
                <div>
                  <span className="inline-block -rotate-2 rounded-lg border-2 border-neutral-900 bg-emerald-300 px-2.5 py-1 font-['Satoshi'] text-xs font-bold shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">{swipes.length} swipes · {conf}% sure</span>
                  <h1 className={`${H1} mt-3`}>Here's what we learned about you.</h1>
                  {learned?.matters.length ? (
                    <p className="mt-2 font-['Satoshi'] text-base text-neutral-600">
                      What decides it for you: {learned.matters.map((m, i) => <span key={m}>{i > 0 && " › "}<span className="font-bold text-neutral-900">{m}</span></span>)}
                    </p>
                  ) : null}
                </div>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {(learned?.insights ?? []).map((i, k) => (
                    <li key={i.text} className={`${CARD} flex gap-3 p-3 sj-pop`} style={{ animationDelay: `${k * 90}ms` }}>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-neutral-900 ${INSIGHT_STYLE[i.kind].bg} font-bold`}>{INSIGHT_STYLE[i.kind].icon}</span>
                      <span className="min-w-0">
                        <span className="block font-['Satoshi'] text-sm font-bold text-neutral-900">{i.text}</span>
                        <span className="block font-['Satoshi'] text-xs text-neutral-500">{i.evidence}</span>
                      </span>
                    </li>
                  ))}
                  {!learned?.insights.length && <li className="font-['Satoshi'] text-sm text-neutral-500">Swipe a few more and we'll have a clearer picture.</li>}
                </ul>
                {!!learned?.best.length && (
                  <div>
                    <div className={`${LABEL} mb-2`}>Your best matches you haven't seen</div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {learned.best.map(({ role, match }) => (
                        <a key={role.id} href={`/internships/${role.slug}`} target="_blank" rel="noopener" className="rounded-xl border-2 border-neutral-900 bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
                          <div className="flex items-center justify-between">
                            <span className={`rounded-full border-2 border-neutral-900 ${CLUSTER_STYLE[role.cluster]} px-2 py-0.5 font-['Satoshi'] text-[10px] font-bold`}>{role.cluster}</span>
                            <span className="font-['Clash_Display'] text-base font-bold text-violet-700">{Math.round(match * 100)}%</span>
                          </div>
                          <div className="mt-2 line-clamp-2 font-['Satoshi'] text-sm font-bold text-neutral-900">{role.title}</div>
                          <div className="font-['Satoshi'] text-xs text-neutral-500">{role.company} · {role.city ?? "Remote"} · {role.stipend}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={toCities} className={BTN} data-tour="to-cities">Looks like me → pick cities</button>
                  {current && <button type="button" onClick={() => setStep("swipe")} className="font-['Satoshi'] text-sm font-bold text-violet-700 hover:text-violet-900">Not quite, keep swiping</button>}
                </div>
              </div>
            )}

            {/* 5. Cities */}
            {(step === "cities" || step === "saving") && (
              <div data-tour="cities" className="space-y-4">
                <div>
                  <h1 className={H1}>Where would you work?</h1>
                  <p className="mt-2 font-['Satoshi'] text-base text-neutral-600">{cities.length ? "Picked from the roles you kept. Tap a city on the map or below to add or remove it." : "Tap the cities you'd work in."}</p>
                </div>
                <div className="overflow-hidden rounded-2xl border-2 border-neutral-900 bg-[#FBFBFD]">
                  <RoleMap home={home} places={places} onToggle={toggleCity} height={330} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {cityCounts.slice(0, 10).map(([c, n]) => {
                    const on = cities.includes(c);
                    return (
                      <button key={c} type="button" onClick={() => toggleCity(c)}
                        className={`rounded-full border-2 border-neutral-900 px-3 py-1 font-['Satoshi'] text-sm font-bold transition-colors ${on ? "bg-violet-500 text-white" : "bg-white text-neutral-900 hover:bg-violet-50"}`}>
                        {on ? "✓ " : ""}{c} <span className="opacity-60">{n}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={finish} disabled={step === "saving"} className={BTN} data-tour="finish">{step === "saving" ? "Setting up…" : "Finish signup →"}</button>
                  <span className="font-['Satoshi'] text-sm text-neutral-500">Next, a one-minute chat in your Studojo app.</span>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Profile strip with a live map */}
        <div className="mt-4 grid w-full max-w-[720px] gap-3 rounded-2xl border-2 border-neutral-900 bg-white/95 p-3 shadow-[4px_4px_0px_0px_rgba(25,26,35,0.9)] backdrop-blur sm:grid-cols-[1fr_210px]" data-tour="card">
          <div className="min-w-0 space-y-2 p-1">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-neutral-900 font-['Clash_Display'] text-sm font-bold ${shown.name ? "bg-violet-500 text-white" : "bg-neutral-100 text-neutral-300"}`}>
                {(shown.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate font-['Clash_Display'] text-base font-bold text-neutral-900">{shown.name || "Your profile"}</div>
                <div className="truncate font-['Satoshi'] text-xs text-neutral-500">{[shown.course, shown.college, shown.gradYear && `’${shown.gradYear.slice(-2)}`].filter(Boolean).join(" · ") || "Builds itself as you go"}</div>
              </div>
              <div className="ml-auto flex gap-4 pr-1">
                {[["Skills", shown.skills.length], ["Fit", pool.length ? fitNow : 0], ["Sure", conf ? `${conf}%` : 0]].map(([k, v]) => (
                  <div key={k as string} className="text-center">
                    <div className="font-['Clash_Display'] text-lg font-bold leading-none tabular-nums">{v || "–"}</div>
                    <div className="font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-neutral-500">{k}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {shown.skills.slice(0, 5).map((s) => <span key={s} className="rounded-full bg-violet-50 px-2 py-0.5 font-['Satoshi'] text-[11px] font-semibold text-violet-700 sj-pop">{s}</span>)}
              {(learned?.clusters ?? []).slice(0, 2).map((c) => <span key={c} className={`rounded-full border-2 border-neutral-900 ${CLUSTER_STYLE[c as Cluster] ?? "bg-neutral-100"} px-2 py-0.5 font-['Satoshi'] text-[11px] font-bold sj-pop`}>{c}</span>)}
              {learned?.minMonthly ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-['Satoshi'] text-[11px] font-bold text-emerald-800 sj-pop">₹{Math.round(learned.minMonthly / 1000)}k+</span> : null}
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border-2 border-neutral-900 bg-[#FBFBFD]" title="Your map">
            <RoleMap home={home} places={places} height={96} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
