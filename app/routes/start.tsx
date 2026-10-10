import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import type { QuickResume } from "~/lib/resume-quick-parse";
import { inferPrefs, matches, type DeckRole } from "~/lib/swipe-prefs";
import { TalentGlobe, type GlobePin } from "~/components/profile/talent-globe";
import { COORDS } from "~/lib/geo";

/**
 * /start: sign up by dropping a resume.
 *
 *  1. Drop    the resume is read instantly (no account yet, nothing stored)
 *  2. Verify  a six-digit code goes to the email on the resume; no password
 *  3. Confirm one tap if we read it right; edit only what's wrong
 *  4. Shape   swipe real roles instead of answering a quiz, then pick cities
 *
 * The talent card on the right fills in as each step lands, and ends up as
 * the student's /profile.
 */

export function meta() {
  return [
    { title: "Start | Studojo" },
    { name: "description", content: "Drop your resume. That's the signup." },
  ];
}

type Step = "drop" | "reading" | "verify" | "confirm" | "swipe" | "cities" | "saving";
type Card = DeckRole;
type PoolRow = Pick<DeckRole, "cluster" | "city" | "monthly">;

const BTN =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-500 text-white font-bold text-sm border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all font-['Satoshi'] disabled:opacity-60 disabled:pointer-events-none";
const BTN_GHOST =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-neutral-900 font-bold text-sm border-2 border-neutral-900 rounded-xl hover:bg-neutral-50 transition-colors font-['Satoshi']";
const CONSENT_PENDING_KEY = "sj_consent_pending";
const STASH_KEY = "sj_start_resume";

const STEPS: { key: Step[]; label: string }[] = [
  { key: ["drop", "reading"], label: "Drop" },
  { key: ["verify"], label: "Verify" },
  { key: ["confirm"], label: "Confirm" },
  { key: ["swipe", "cities", "saving"], label: "Shape" },
];

type Draft = {
  name: string;
  email: string;
  college: string;
  course: string;
  gradYear: string;
  city: string;
  skills: string[];
  experience: { title: string; company: string }[];
  links: { github?: string; linkedin?: string; portfolio?: string };
  /** Fields we read with low confidence: shown dashed until confirmed or edited. */
  unsure: Set<string>;
  edited: Set<string>;
};

function draftFrom(r: QuickResume | null): Draft {
  const unsure = new Set<string>();
  const v = <T,>(key: string, f: { value: T; confidence: string } | null | undefined): T | "" => {
    if (!f) return "";
    if (f.confidence === "low") unsure.add(key);
    return f.value;
  };
  return {
    name: v("name", r?.name) as string,
    email: v("email", r?.email) as string,
    college: v("college", r?.college) as string,
    course: v("course", r?.course) as string,
    gradYear: r?.gradYear ? String(v("gradYear", r.gradYear)) : "",
    city: v("city", r?.city) as string,
    skills: r?.skills ?? [],
    experience: r?.experience ?? [],
    links: r?.links ?? {},
    unsure,
    edited: new Set(),
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function useCountUp(target: number) {
  const [n, setN] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 450);
      setN(Math.round(a + (target - a) * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return n;
}

// ── Talent card (right column) ───────────────────────────────────────────────

function Slot({ label, value, unsure, delay = 0 }: { label: string; value: ReactNode; unsure?: boolean; delay?: number }) {
  const empty = value === "" || value === null || value === undefined;
  return (
    <div className="min-w-0">
      <div className="font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</div>
      {empty ? (
        <div className="mt-1 h-4 w-3/4 rounded bg-neutral-100" />
      ) : (
        <div
          className={`mt-0.5 font-['Satoshi'] text-sm font-semibold text-neutral-900 truncate sj-pop ${unsure ? "underline decoration-dashed decoration-amber-500 underline-offset-4" : ""}`}
          style={{ animationDelay: `${delay}ms` }}
        >
          {value}
        </div>
      )}
    </div>
  );
}

function TalentCard({ d, prefs, step }: { d: Draft; prefs: ReturnType<typeof inferPrefs> | null; step: Step }) {
  const initials = (d.name || "?").split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className="rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]" data-tour="card">
      <div className="flex items-center gap-3">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-neutral-900 font-['Clash_Display'] text-lg font-bold ${d.name ? "bg-violet-500 text-white" : "bg-neutral-100 text-neutral-300"}`}>
          {initials}
        </div>
        <div className="min-w-0">
          {d.name ? (
            <div className="font-['Clash_Display'] text-xl font-bold text-neutral-900 truncate sj-pop">{d.name}</div>
          ) : (
            <div className="h-5 w-40 rounded bg-neutral-100" />
          )}
          <div className="font-['Satoshi'] text-xs text-neutral-500 truncate">{d.email || "your@email"}</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Slot label="College" value={d.college} unsure={d.unsure.has("college")} delay={80} />
        <Slot label="Course" value={d.course} unsure={d.unsure.has("course")} delay={160} />
        <Slot label="Graduating" value={d.gradYear} unsure={d.unsure.has("gradYear")} delay={240} />
        <Slot label="Based in" value={d.city} unsure={d.unsure.has("city")} delay={320} />
      </div>
      <div className="mt-4">
        <div className="font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-neutral-400">Skills</div>
        <div className="mt-1 flex flex-wrap gap-1">
          {d.skills.length ? (
            d.skills.slice(0, 10).map((s, i) => (
              <span key={s} className="rounded-full bg-violet-50 px-2 py-0.5 font-['Satoshi'] text-[11px] font-semibold text-violet-700 sj-pop" style={{ animationDelay: `${400 + i * 40}ms` }}>{s}</span>
            ))
          ) : (
            <span className="h-4 w-1/2 rounded bg-neutral-100" />
          )}
        </div>
      </div>
      <div className="mt-4 border-t-2 border-dashed border-neutral-200 pt-3">
        <div className="font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-neutral-400">Looking for</div>
        {prefs && (prefs.clusters.length || prefs.cities.length) ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {prefs.clusters.slice(0, 3).map((c) => (
              <span key={c} className="rounded-full border-2 border-neutral-900 bg-amber-50 px-2 py-0.5 font-['Satoshi'] text-[11px] font-bold sj-pop">{c}</span>
            ))}
            {prefs.cities.slice(0, 3).map((c) => (
              <span key={c} className="rounded-full bg-neutral-100 px-2 py-0.5 font-['Satoshi'] text-[11px] font-semibold text-neutral-700 sj-pop">📍 {c}</span>
            ))}
            {prefs.minMonthly ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-['Satoshi'] text-[11px] font-semibold text-emerald-700 sj-pop">₹{Math.round(prefs.minMonthly / 1000)}k+/mo</span>
            ) : null}
          </div>
        ) : (
          <p className="mt-1 font-['Satoshi'] text-xs text-neutral-400">
            {step === "swipe" ? "Learning from your swipes…" : "Fills in when you swipe roles"}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function StartPage() {
  const navigate = useNavigate();
  const { data: auth, isPending } = authClient.useSession();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("drop");
  const [error, setError] = useState("");
  const [d, setD] = useState<Draft>(() => draftFrom(null));
  const [found, setFound] = useState<{ filled: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // verify
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // confirm
  const [editing, setEditing] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);

  // swipe
  const [cards, setCards] = useState<Card[]>([]);
  const [pool, setPool] = useState<PoolRow[]>([]);
  const [liked, setLiked] = useState<Card[]>([]);
  const [passed, setPassed] = useState<Card[]>([]);
  const [drag, setDrag] = useState<{ x: number; start: number } | null>(null);
  const [fling, setFling] = useState<"left" | "right" | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [focusCity, setFocusCity] = useState<string | null>(null);

  const signedIn = !!auth?.user;
  useEffect(() => setMounted(true), []);

  // Resume read before a Google round trip survives it.
  useEffect(() => {
    if (!mounted || isPending) return;
    try {
      const raw = sessionStorage.getItem(STASH_KEY);
      if (raw && signedIn) {
        sessionStorage.removeItem(STASH_KEY);
        const r = JSON.parse(raw) as QuickResume;
        setD({ ...draftFrom(r), email: auth!.user.email });
        setStep("confirm");
      }
    } catch {}
  }, [mounted, isPending, signedIn, auth]);

  const prefs = useMemo(() => (liked.length || passed.length ? inferPrefs(liked, passed) : null), [liked, passed]);
  const matchCount = useCountUp(pool.length ? matches(pool, prefs ?? inferPrefs([], [])) : 0);
  const index = liked.length + passed.length;
  const current = cards[index];

  // ── 1. Drop ──
  const readFile = async (file: File) => {
    setError("");
    if (!/\.pdf$|\.txt$/i.test(file.name)) {
      setError("Use a PDF of your resume.");
      return;
    }
    setStep("reading");
    const form = new FormData();
    form.append("file", file);
    try {
      const [res] = await Promise.all([fetch("/api/start/parse", { method: "POST", body: form }), sleep(900)]);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "We couldn't read that file.");
      const draft = draftFrom(data.resume);
      setFound({ filled: data.filled, total: data.total });
      try { localStorage.setItem(CONSENT_PENDING_KEY, "1"); } catch {}
      if (signedIn) {
        setD({ ...draft, email: auth!.user.email });
        await sleep(1400);
        setStep("confirm");
        return;
      }
      setD(draft);
      try { sessionStorage.setItem(STASH_KEY, JSON.stringify(data.resume)); } catch {}
      await sleep(1400);
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
    if (err) {
      setError(err.message || "We couldn't send a code to that address.");
      setChangingEmail(true);
      return;
    }
    setSentTo(email);
    setChangingEmail(false);
    setCode("");
  };

  const verify = useCallback(
    async (otp: string) => {
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
    },
    [sentTo],
  );

  useEffect(() => {
    if (step === "verify" && code.length === 6 && !verifying) void verify(code);
  }, [code, step, verifying, verify]);

  // ── 3. Confirm ──
  const setField = (key: keyof Draft, value: string) =>
    setD((x) => {
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
            fullName: d.name,
            college: d.college,
            course: d.course,
            yearOfStudy: d.gradYear ? `${Number(d.gradYear) < new Date().getFullYear() ? "Graduated" : "Graduating"} ${d.gradYear}` : "",
          },
          resume: { skills: d.skills, experience: d.experience, city: d.city, gradYear: d.gradYear },
          links: d.links,
          edited: [...d.edited],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Couldn't save. Try again.");
      // The session cookie still carries the blank name a code sign-up starts with.
      void authClient.getSession({ query: { disableCookieCache: true } });
      const deck = await fetch("/api/start/deck").then((r) => r.json());
      setCards(Array.isArray(deck?.cards) ? deck.cards : []);
      setPool(Array.isArray(deck?.pool) ? deck.pool : []);
      setStep("swipe");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── 4. Swipe ──
  const decide = useCallback(
    (dir: "left" | "right") => {
      if (!current || fling) return;
      setFling(dir);
      setTimeout(() => {
        if (dir === "right") setLiked((l) => [...l, current]);
        else setPassed((p) => [...p, current]);
        setFling(null);
        setDrag(null);
      }, 220);
    },
    [current, fling],
  );

  useEffect(() => {
    if (step !== "swipe") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") decide("right");
      if (e.key === "ArrowLeft") decide("left");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, decide]);

  const toCities = () => {
    const p = prefs ?? inferPrefs([], []);
    setCities(p.cities.length ? p.cities : d.city ? [d.city] : []);
    setStep("cities");
  };
  useEffect(() => {
    if (step === "swipe" && cards.length && index >= cards.length) toCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, cards.length, step]);

  // City options: where the open roles are, with counts.
  const cityCounts = useMemo(() => {
    const n = new Map<string, number>();
    for (const r of pool) if (r.city) n.set(r.city, (n.get(r.city) ?? 0) + 1);
    for (const c of cities) if (!n.has(c)) n.set(c, 0);
    return [...n.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [pool, cities]);
  const pins = useMemo<GlobePin[]>(
    () =>
      cityCounts
        .map(([c, count]) => {
          const at = COORDS[c.toLowerCase()];
          if (!at) return null;
          const on = cities.includes(c);
          return { id: c, lat: at[0], lng: at[1], kind: on ? "target" : "hub", kicker: on ? "You'd work here" : `${count} open`, text: c } as GlobePin;
        })
        .filter((p): p is GlobePin => !!p),
    [cityCounts, cities],
  );

  const finish = async () => {
    setStep("saving");
    const p = prefs ?? inferPrefs([], []);
    await fetch("/api/start/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: "prefs",
        prefs: { ...p, cities, liked: liked.map((c) => c.id), passed: passed.map((c) => c.id) },
      }),
    }).catch(() => {});
    navigate("/profile");
  };

  const stepIndex = STEPS.findIndex((s) => s.key.includes(step));
  const dx = fling === "right" ? 520 : fling === "left" ? -520 : drag?.x ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50 px-4 md:px-8 pb-12">
      <style>{`
        @keyframes sjPop { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
        .sj-pop { animation: sjPop .35s ease both }
        @keyframes sjScan { 0% { top: 0 } 100% { top: calc(100% - 3px) } }
        @media (prefers-reduced-motion: reduce) { .sj-pop { animation: none } .sj-scan { display: none } }
      `}</style>

      {/* Top bar + progress */}
      <div className="mx-auto flex max-w-6xl items-center justify-between py-5">
        <Link to="/" className="font-['Clash_Display'] text-2xl font-bold text-neutral-900">studojo</Link>
        <ol className="flex items-center gap-1.5 sm:gap-3" data-tour="progress">
          {STEPS.map((s, i) => (
            <li key={s.label} className="flex items-center gap-1.5">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 font-['Satoshi'] text-[11px] font-bold ${i < stepIndex ? "border-neutral-900 bg-neutral-900 text-white" : i === stepIndex ? "border-neutral-900 bg-violet-500 text-white" : "border-neutral-300 text-neutral-400"}`}
              >
                {i < stepIndex ? "✓" : i + 1}
              </span>
              <span className={`hidden sm:inline font-['Satoshi'] text-xs font-bold ${i <= stepIndex ? "text-neutral-900" : "text-neutral-400"}`}>{s.label}</span>
            </li>
          ))}
        </ol>
        {!signedIn ? (
          <Link to="/auth?mode=signin" className="font-['Satoshi'] text-sm font-bold text-neutral-600 hover:text-neutral-900">Sign in</Link>
        ) : (
          <span className="w-12" />
        )}
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
        <main className="min-w-0">
          {/* 1. Drop */}
          {(step === "drop" || step === "reading") && (
            <section>
              <h1 className="font-['Clash_Display'] text-4xl md:text-6xl font-bold leading-[1.02] text-neutral-900">
                Drop your resume.
                <br />
                <span className="text-violet-600">That's the signup.</span>
              </h1>
              <p className="mt-4 max-w-xl font-['Satoshi'] text-base text-neutral-600">
                We read it in a second and build your profile from it. No forms, no password. You just check what we found.
              </p>
              <label
                data-tour="dropzone"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) void readFile(f);
                }}
                className={`relative mt-6 flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-[3px] border-dashed bg-white p-8 text-center transition-colors ${dragOver ? "border-violet-500 bg-violet-50" : "border-neutral-900"} ${step === "reading" ? "pointer-events-none" : ""}`}
              >
                <input
                  ref={fileRef}
                  id="start-resume"
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void readFile(f);
                    e.target.value = "";
                  }}
                />
                {step === "reading" ? (
                  <>
                    <span className="sj-scan absolute inset-x-0 h-[3px] bg-violet-500/70" style={{ animation: "sjScan 1.1s ease-in-out infinite alternate" }} />
                    <div className="font-['Clash_Display'] text-2xl font-bold text-neutral-900">Reading your resume…</div>
                    {found ? (
                      <p className="mt-2 font-['Satoshi'] text-sm text-neutral-600 sj-pop">
                        Found {found.filled} of {found.total} things we need. Watch your card fill in →
                      </p>
                    ) : (
                      <p className="mt-2 font-['Satoshi'] text-sm text-neutral-500">Name, college, course, skills, links</p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-neutral-900 bg-amber-200 font-['Clash_Display'] text-2xl font-bold shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">↓</div>
                    <div className="mt-4 font-['Clash_Display'] text-xl font-bold text-neutral-900">Drop your resume here</div>
                    <div className="mt-1 font-['Satoshi'] text-sm text-neutral-500">or click to choose · PDF up to 5 MB</div>
                  </>
                )}
              </label>
              {error && <p className="mt-3 font-['Satoshi'] text-sm font-semibold text-red-600">{error}</p>}
              {!signedIn && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      try { localStorage.setItem(CONSENT_PENDING_KEY, "1"); } catch {}
                      authClient.signIn.social({ provider: "google", callbackURL: "/start", errorCallbackURL: "/auth?redirect=%2Fstart" });
                    }}
                    className={BTN_GHOST}
                  >
                    No resume handy? Continue with Google
                  </button>
                </div>
              )}
              <p className="mt-4 max-w-xl font-['Satoshi'] text-xs text-neutral-500">
                By continuing, you confirm you are 18 or older and agree to our{" "}
                <a href="/terms" target="_blank" rel="noopener" className="underline">Terms of Service</a> and{" "}
                <a href="/privacy" target="_blank" rel="noopener" className="underline">Privacy Policy</a>. We read your file once to fill your profile and don't keep it until you confirm.
              </p>
            </section>
          )}

          {/* 2. Verify */}
          {step === "verify" && (
            <section data-tour="verify">
              <h1 className="font-['Clash_Display'] text-4xl md:text-5xl font-bold leading-tight text-neutral-900">Check your inbox.</h1>
              {sentTo && !changingEmail ? (
                <p className="mt-3 font-['Satoshi'] text-base text-neutral-600">
                  Your resume says <span className="font-bold text-neutral-900">{sentTo}</span>. We sent a 6-digit code there.{" "}
                  <button type="button" onClick={() => setChangingEmail(true)} className="font-bold text-violet-600 hover:text-violet-800">Wrong address?</button>
                </p>
              ) : (
                <form
                  className="mt-4 flex max-w-md flex-wrap gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (/\S+@\S+\.\S+/.test(d.email)) void sendCode(d.email.trim().toLowerCase());
                  }}
                >
                  <label htmlFor="start-email" className="w-full font-['Satoshi'] text-sm text-neutral-600">
                    {d.email ? "Send the code to:" : "We couldn't find an email on your resume. Where should we send your code?"}
                  </label>
                  <input
                    id="start-email"
                    type="email"
                    value={d.email}
                    onChange={(e) => setD((x) => ({ ...x, email: e.target.value }))}
                    placeholder="you@college.edu"
                    className="min-w-0 flex-1 rounded-xl border-2 border-neutral-300 px-3 py-2 font-['Satoshi'] text-base focus:border-violet-500 focus:outline-none"
                  />
                  <button type="submit" className={BTN}>Send code</button>
                </form>
              )}
              {sentTo && !changingEmail && (
                <div className="mt-6">
                  <label htmlFor="start-code" className="sr-only">6-digit code</label>
                  <div className="relative inline-block">
                    <input
                      id="start-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="absolute inset-0 opacity-0"
                      aria-label="6-digit code"
                    />
                    <div className="flex gap-2" aria-hidden="true">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex h-14 w-11 sm:h-16 sm:w-12 items-center justify-center rounded-xl border-2 bg-white font-['Clash_Display'] text-2xl font-bold ${i === code.length ? "border-violet-500" : "border-neutral-900"}`}
                        >
                          {code[i] ?? ""}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 font-['Satoshi'] text-sm text-neutral-500">
                    {verifying ? "Checking…" : "It signs you in as soon as you type the last digit. No password to remember."}{" "}
                    {!verifying && (
                      <button type="button" onClick={() => void sendCode(sentTo)} className="font-bold text-violet-600 hover:text-violet-800">Send a new code</button>
                    )}
                  </p>
                </div>
              )}
              {error && <p className="mt-3 font-['Satoshi'] text-sm font-semibold text-red-600">{error}</p>}
            </section>
          )}

          {/* 3. Confirm */}
          {step === "confirm" && (
            <section data-tour="confirm">
              <h1 className="font-['Clash_Display'] text-4xl md:text-5xl font-bold leading-tight text-neutral-900">Did we get it right?</h1>
              <p className="mt-3 max-w-xl font-['Satoshi'] text-base text-neutral-600">
                Tap anything that's wrong. Underlined in amber means we weren't sure.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["name", "Name", d.name, "Your full name"],
                    ["college", "College", d.college, "e.g. Christ University"],
                    ["course", "Course", d.course, "e.g. BBA, B.Tech"],
                    ["gradYear", "Graduating", d.gradYear, "e.g. 2027"],
                    ["city", "Based in", d.city, "e.g. Bengaluru"],
                  ] as [keyof Draft, string, string, string][]
                ).map(([key, label, value, ph]) => {
                  const unsure = d.unsure.has(key as string);
                  return editing === key ? (
                    <div key={key} className="rounded-xl border-2 border-violet-500 bg-white p-3">
                      <label htmlFor={`start-${key}`} className="font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-violet-600">{label}</label>
                      <input
                        id={`start-${key}`}
                        autoFocus
                        defaultValue={value}
                        placeholder={ph}
                        onBlur={(e) => { setField(key, e.target.value.trim()); setEditing(null); }}
                        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                        className="mt-1 w-full font-['Satoshi'] text-base font-semibold text-neutral-900 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <button
                      key={key}
                      type="button"
                      data-tour={`field-${key}`}
                      onClick={() => setEditing(key as string)}
                      className={`group rounded-xl border-2 bg-white p-3 text-left transition-colors hover:border-violet-500 ${unsure ? "border-dashed border-amber-500 bg-amber-50/40" : value ? "border-neutral-900" : "border-dashed border-neutral-300"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</span>
                        <span className={`font-['Satoshi'] text-[10px] font-bold ${unsure ? "text-amber-600" : d.edited.has(key === "gradYear" ? "year" : (key as string)) ? "text-violet-600" : "text-emerald-600"}`}>
                          {unsure ? "Check this" : !value ? "Add" : d.edited.has(key === "gradYear" ? "year" : (key as string)) ? "You" : "From resume"}
                        </span>
                      </div>
                      <div className={`mt-1 font-['Satoshi'] text-base font-semibold ${value ? "text-neutral-900" : "text-neutral-400"}`}>{value || ph}</div>
                    </button>
                  );
                })}
                <div className="rounded-xl border-2 border-neutral-900 bg-white p-3 sm:col-span-2" data-tour="skills">
                  <div className="flex items-center justify-between">
                    <span className="font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-neutral-400">Skills</span>
                    <span className="font-['Satoshi'] text-[10px] font-bold text-emerald-600">{d.skills.length ? "From resume · tap × to remove" : "Add a few"}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {d.skills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-full bg-violet-50 py-1 pl-2.5 pr-1 font-['Satoshi'] text-xs font-semibold text-violet-700">
                        {s}
                        <button
                          type="button"
                          aria-label={`Remove ${s}`}
                          onClick={() => setD((x) => ({ ...x, skills: x.skills.filter((k) => k !== s), edited: new Set(x.edited).add("skills") }))}
                          className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-violet-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const s = newSkill.trim();
                        if (s && !d.skills.some((k) => k.toLowerCase() === s.toLowerCase()))
                          setD((x) => ({ ...x, skills: [...x.skills, s], edited: new Set(x.edited).add("skills") }));
                        setNewSkill("");
                      }}
                    >
                      <label htmlFor="start-skill" className="sr-only">Add a skill</label>
                      <input
                        id="start-skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="+ add skill"
                        className="w-28 rounded-full border-2 border-dashed border-neutral-300 px-2.5 py-0.5 font-['Satoshi'] text-xs focus:border-violet-500 focus:outline-none"
                      />
                    </form>
                  </div>
                </div>
                {(d.links.github || d.links.linkedin || d.links.portfolio) && (
                  <div className="rounded-xl border-2 border-neutral-900 bg-white p-3 sm:col-span-2">
                    <span className="font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-neutral-400">Links we found</span>
                    <div className="mt-1 flex flex-wrap gap-2 font-['Satoshi'] text-sm font-semibold">
                      {d.links.github && <span>GitHub @{d.links.github}</span>}
                      {d.links.linkedin && <span>LinkedIn</span>}
                      {d.links.portfolio && <span>{d.links.portfolio.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>}
                    </div>
                  </div>
                )}
              </div>
              {error && <p className="mt-3 font-['Satoshi'] text-sm font-semibold text-red-600">{error}</p>}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button type="button" onClick={confirm} disabled={saving || !d.name.trim()} className={BTN} data-tour="looks-right">
                  {saving ? "Saving…" : d.unsure.size ? "Looks right, including the amber ones" : "Looks right"}
                </button>
                {!d.name.trim() && <span className="font-['Satoshi'] text-sm text-neutral-500">Add your name to continue.</span>}
              </div>
            </section>
          )}

          {/* 4a. Swipe */}
          {step === "swipe" && (
            <section>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="font-['Clash_Display'] text-4xl md:text-5xl font-bold leading-tight text-neutral-900">Would you take this?</h1>
                  <p className="mt-2 font-['Satoshi'] text-base text-neutral-600">
                    Real roles open right now. Swipe instead of answering a quiz; we learn what you want from what you keep.
                  </p>
                </div>
                <div className="rounded-xl border-2 border-neutral-900 bg-white px-4 py-2 text-right" data-tour="counter">
                  <div className="font-['Clash_Display'] text-3xl font-bold tabular-nums text-violet-600">{matchCount}</div>
                  <div className="font-['Satoshi'] text-[11px] font-semibold text-neutral-500">roles match you</div>
                </div>
              </div>

              <div className="relative mx-auto mt-6 h-[340px] max-w-md select-none" data-tour="deck">
                {cards.slice(index, index + 3).reverse().map((c, i, arr) => {
                  const top = i === arr.length - 1;
                  const depth = arr.length - 1 - i;
                  return (
                    <div
                      key={c.id}
                      onPointerDown={top ? (e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setDrag({ x: 0, start: e.clientX }); } : undefined}
                      onPointerMove={top ? (e) => drag && setDrag({ ...drag, x: e.clientX - drag.start }) : undefined}
                      onPointerUp={top ? () => { if (drag && Math.abs(drag.x) > 90) decide(drag.x > 0 ? "right" : "left"); else setDrag(null); } : undefined}
                      className="absolute inset-0 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(25,26,35,1)] touch-none"
                      style={{
                        transform: top
                          ? `translateX(${dx}px) rotate(${dx / 22}deg)`
                          : `translateY(${depth * 10}px) scale(${1 - depth * 0.04})`,
                        transition: drag && !fling ? "none" : "transform .22s ease",
                        cursor: top ? "grab" : "default",
                      }}
                    >
                      {top && dx !== 0 && (
                        <span
                          className={`absolute top-5 rounded-lg border-2 px-2 py-0.5 font-['Clash_Display'] text-lg font-bold ${dx > 0 ? "left-5 border-emerald-600 text-emerald-600 -rotate-12" : "right-5 border-red-500 text-red-500 rotate-12"}`}
                          style={{ opacity: Math.min(1, Math.abs(dx) / 90) }}
                        >
                          {dx > 0 ? "INTERESTED" : "NOT FOR ME"}
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 font-['Satoshi'] text-[11px] font-bold text-violet-700">{c.cluster}</span>
                        <span className="font-['Satoshi'] text-xs text-neutral-400">{index + 1 + depth} / {cards.length}</span>
                      </div>
                      <div className="mt-5 font-['Satoshi'] text-sm font-bold uppercase tracking-wider text-neutral-500">{c.company} is hiring</div>
                      <div className="mt-1 font-['Clash_Display'] text-3xl font-bold leading-tight text-neutral-900">{c.title}</div>
                      <dl className="mt-6 grid grid-cols-3 gap-3 border-t-2 border-neutral-100 pt-4">
                        <div><dt className="font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-neutral-400">Stipend</dt><dd className="font-['Satoshi'] text-sm font-bold text-neutral-900">{c.stipend}</dd></div>
                        <div><dt className="font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-neutral-400">Where</dt><dd className="font-['Satoshi'] text-sm font-bold text-neutral-900 truncate">{c.city ?? c.location}</dd></div>
                        <div><dt className="font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-neutral-400">Length</dt><dd className="font-['Satoshi'] text-sm font-bold text-neutral-900">{c.duration}</dd></div>
                      </dl>
                    </div>
                  );
                })}
                {!current && cards.length === 0 && (
                  <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 font-['Satoshi'] text-sm text-neutral-500">
                    No open roles to show yet. You can pick cities next.
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-center gap-4">
                <button type="button" onClick={() => decide("left")} aria-label="Not for me" className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-neutral-900 bg-white text-2xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:bg-red-50" data-tour="pass">✕</button>
                <button type="button" onClick={() => decide("right")} aria-label="Interested" className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 text-2xl text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:bg-violet-600" data-tour="like">♥</button>
              </div>
              <p className="mt-3 text-center font-['Satoshi'] text-xs text-neutral-500">
                ← → keys work too.{" "}
                {(index >= 6 || cards.length === 0) && (
                  <button type="button" onClick={toCities} className="font-bold text-violet-600 hover:text-violet-800">That's enough, next →</button>
                )}
              </p>
            </section>
          )}

          {/* 4b. Cities */}
          {(step === "cities" || step === "saving") && (
            <section data-tour="cities">
              <h1 className="font-['Clash_Display'] text-4xl md:text-5xl font-bold leading-tight text-neutral-900">Where would you work?</h1>
              <p className="mt-2 font-['Satoshi'] text-base text-neutral-600">
                {cities.length ? "We picked these from your swipes. Tap to add or remove." : "Tap the cities you'd work in."}
              </p>
              <div className="mt-4 grid gap-6 md:grid-cols-[1fr_1fr] md:items-center">
                <div className="mx-auto w-full max-w-[340px]">
                  <TalentGlobe pins={pins} focus={focusCity ?? cities[0] ?? pins[0]?.id} />
                </div>
                <div>
                  <div className="flex flex-wrap gap-2">
                    {cityCounts.map(([c, count]) => {
                      const on = cities.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setFocusCity(c);
                            setCities((x) => (on ? x.filter((k) => k !== c) : [...x, c]));
                          }}
                          className={`rounded-full border-2 px-3 py-1.5 font-['Satoshi'] text-sm font-bold transition-colors ${on ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900"}`}
                        >
                          {on ? "✓ " : ""}{c} <span className="opacity-60">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button type="button" onClick={finish} disabled={step === "saving"} className={`${BTN} mt-6`} data-tour="finish">
                    {step === "saving" ? "Building your profile…" : "See my profile →"}
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>

        <aside className="lg:sticky lg:top-6">
          <p className="mb-2 font-['Satoshi'] text-xs font-bold uppercase tracking-wider text-neutral-500">Your profile, building itself</p>
          <TalentCard d={d} prefs={prefs} step={step} />
          {step === "swipe" && (
            <p className="mt-3 font-['Satoshi'] text-xs text-neutral-500">
              {liked.length} kept · {passed.length} passed
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
