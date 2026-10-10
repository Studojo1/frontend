import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import type { QuickResume } from "~/lib/resume-quick-parse";
import { inferPrefs, matches, type Cluster, type DeckRole } from "~/lib/swipe-prefs";
import { TalentGlobe, type GlobePin } from "~/components/profile/talent-globe";
import { ProfileChat, type ChatAnswers } from "~/components/start/profile-chat";
import { COORDS } from "~/lib/geo";

/**
 * /start: sign up by dropping a resume.
 *
 *  1. Drop    the resume is read instantly (no account yet, nothing stored)
 *  2. Verify  a six-digit code goes to the email on the resume; no password
 *  3. Confirm one tap if we read it right; edit only what's wrong
 *  4. Swipe   real roles instead of a quiz, so we learn what they want
 *  5. Cities  where they'd work, on the globe
 *  6. Chat    a short conversation for what a resume can't say
 *
 * Three columns so no space sits empty: steps and a log of what we've
 * learned on the left, the step in the middle, and a live panel (globe,
 * counts, profile card) on the right that fills in as each step lands.
 */

export function meta() {
  return [
    { title: "Start | Studojo" },
    { name: "description", content: "Drop your resume. That's the signup." },
  ];
}

type Step = "drop" | "reading" | "verify" | "confirm" | "swipe" | "cities" | "chat" | "saving";
type Card = DeckRole;
type PoolRow = Pick<DeckRole, "cluster" | "city" | "monthly">;

const CONSENT_PENDING_KEY = "sj_consent_pending";
const STASH_KEY = "sj_start_resume";

const BTN =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-500 text-white font-bold text-sm border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all font-['Satoshi'] disabled:opacity-60 disabled:pointer-events-none";
const BTN_GHOST =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-neutral-900 font-bold text-sm border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all font-['Satoshi']";
const CARD = "rounded-2xl border-2 border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]";
const LABEL = "font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-neutral-500";
const H1 = "font-['Clash_Display'] text-4xl md:text-5xl font-bold leading-[1.02] text-neutral-900";

const STEPS: { key: Step[]; label: string; hint: string; dot: string }[] = [
  { key: ["drop", "reading"], label: "Drop your resume", hint: "We read it in a second", dot: "bg-amber-300" },
  { key: ["verify"], label: "Verify your email", hint: "A code, not a password", dot: "bg-pink-300" },
  { key: ["confirm"], label: "Check what we found", hint: "Fix only what's wrong", dot: "bg-emerald-300" },
  { key: ["swipe"], label: "Swipe real roles", hint: "We learn what you want", dot: "bg-violet-300" },
  { key: ["cities"], label: "Pick your cities", hint: "Where you'd work", dot: "bg-sky-300" },
  { key: ["chat", "saving"], label: "Tell us more", hint: "A one-minute chat", dot: "bg-amber-300" },
];

// One colour per kind of work, in the Studojo palette.
const CLUSTER_STYLE: Record<Cluster, string> = {
  Analytics: "bg-violet-200",
  Product: "bg-pink-200",
  Engineering: "bg-sky-200",
  Design: "bg-fuchsia-200",
  Marketing: "bg-orange-200",
  Finance: "bg-emerald-200",
  Consulting: "bg-teal-200",
  Sales: "bg-amber-200",
  Content: "bg-rose-200",
  HR: "bg-lime-200",
  Operations: "bg-slate-200",
  Other: "bg-neutral-200",
};

// Skills that make a kind of work a natural fit, for "why you're seeing this".
const CLUSTER_SKILLS: Partial<Record<Cluster, string[]>> = {
  Analytics: ["sql", "excel", "python", "tableau", "power bi", "statistics", "r", "looker", "data analysis"],
  Product: ["sql", "figma", "a/b testing", "excel", "product management", "mixpanel"],
  Engineering: ["python", "java", "javascript", "typescript", "react", "node.js", "c++", "go", "sql", "git"],
  Design: ["figma", "photoshop", "illustrator", "canva", "ui/ux"],
  Marketing: ["seo", "google analytics", "social media", "canva", "content writing", "digital marketing", "excel"],
  Finance: ["excel", "financial modelling", "financial modeling", "valuation", "accounting"],
  Consulting: ["excel", "market research", "public speaking", "powerpoint"],
  Content: ["content writing", "copywriting", "canva", "seo"],
};

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
  /** Fields we read with low confidence: flagged until confirmed or edited. */
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
const coordsOf = (city: string) => COORDS[city.toLowerCase()] ?? (city === "Bengaluru" ? COORDS.bangalore : undefined);
const maskEmail = (e: string) => e.replace(/^(.)[^@]*(@.*)$/, "$1•••$2");
const Check = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
    <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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

type FeedItem = { t: number; text: string; tone?: "good" | "warn" | "info" };

// ── Right panel pieces ───────────────────────────────────────────────────────

function Stat({ label, value, bg, tour }: { label: string; value: ReactNode; bg: string; tour?: string }) {
  return (
    <div className={`rounded-xl border-2 border-neutral-900 ${bg} px-2 py-2.5 text-center shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]`} data-tour={tour}>
      <div className="font-['Clash_Display'] text-2xl font-bold leading-none text-neutral-900 tabular-nums">{value}</div>
      <div className="mt-1 font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-neutral-700">{label}</div>
    </div>
  );
}

function TalentCard({ d, prefs, chat }: { d: Draft; prefs: ReturnType<typeof inferPrefs> | null; chat: ChatAnswers }) {
  const initials = (d.name || "").split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const line = [d.course, d.college, d.gradYear && `’${d.gradYear.slice(-2)}`].filter(Boolean).join(" · ");
  const Empty = ({ w }: { w: string }) => <span className={`block h-3.5 ${w} rounded bg-neutral-100`} />;
  return (
    <div className={`${CARD} p-4`} data-tour="card">
      <div className={`${LABEL} mb-3`}>Your profile, building itself</div>
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-neutral-900 font-['Clash_Display'] text-base font-bold ${initials ? "bg-violet-500 text-white" : "bg-neutral-100 text-neutral-300"}`}>
          {initials || "?"}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          {d.name ? <div className="truncate font-['Clash_Display'] text-lg font-bold text-neutral-900 sj-pop">{d.name}</div> : <Empty w="w-36" />}
          {line ? <div className="truncate font-['Satoshi'] text-xs text-neutral-600 sj-pop">{line}</div> : <Empty w="w-48" />}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {d.skills.length
          ? d.skills.slice(0, 8).map((s, i) => (
              <span key={s} className="rounded-full bg-violet-50 px-2 py-0.5 font-['Satoshi'] text-[11px] font-semibold text-violet-700 sj-pop" style={{ animationDelay: `${i * 40}ms` }}>{s}</span>
            ))
          : ["w-14", "w-10", "w-16", "w-12"].map((w, i) => <span key={i} className={`h-5 ${w} rounded-full bg-neutral-100`} />)}
      </div>
      <div className="mt-3 space-y-2 border-t-2 border-dashed border-neutral-200 pt-3">
        <div>
          <div className={LABEL}>Looking for</div>
          {prefs && (prefs.clusters.length || prefs.cities.length || prefs.minMonthly) ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {prefs.clusters.slice(0, 3).map((c) => (
                <span key={c} className={`rounded-full border-2 border-neutral-900 ${CLUSTER_STYLE[c]} px-2 py-0.5 font-['Satoshi'] text-[11px] font-bold sj-pop`}>{c}</span>
              ))}
              {prefs.cities.slice(0, 3).map((c) => (
                <span key={c} className="rounded-full bg-neutral-100 px-2 py-0.5 font-['Satoshi'] text-[11px] font-semibold text-neutral-700 sj-pop">{c}</span>
              ))}
              {prefs.minMonthly ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-['Satoshi'] text-[11px] font-bold text-emerald-800 sj-pop">₹{Math.round(prefs.minMonthly / 1000)}k+/mo</span>
              ) : null}
            </div>
          ) : (
            <p className="mt-1 font-['Satoshi'] text-xs text-neutral-400">Fills in as you swipe roles</p>
          )}
        </div>
        {(chat.companyStage || chat.dreamCompanies?.length || chat.workMode || chat.startWhen || chat.proud) && (
          <div className="sj-pop" data-tour="from-chat">
            <div className={LABEL}>From our chat</div>
            <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-['Satoshi'] text-xs">
              {chat.companyStage && <><dt className="text-neutral-500">Company</dt><dd className="font-semibold text-neutral-900">{chat.companyStage}</dd></>}
              {chat.dreamCompanies?.length ? <><dt className="text-neutral-500">Dream</dt><dd className="truncate font-semibold text-neutral-900">{chat.dreamCompanies.join(", ")}</dd></> : null}
              {chat.workMode && <><dt className="text-neutral-500">Works</dt><dd className="font-semibold text-neutral-900">{chat.workMode}</dd></>}
              {chat.startWhen && <><dt className="text-neutral-500">Starts</dt><dd className="font-semibold text-neutral-900">{chat.startWhen}</dd></>}
              {chat.proud && <><dt className="text-neutral-500">Proud of</dt><dd className="line-clamp-2 font-semibold text-neutral-900">{chat.proud}</dd></>}
            </dl>
          </div>
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
  const [fileName, setFileName] = useState("");
  const [revealed, setRevealed] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const t0 = useRef(0);

  // verify
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // confirm
  const [editing, setEditing] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);

  // swipe + cities + chat
  const [cards, setCards] = useState<Card[]>([]);
  const [pool, setPool] = useState<PoolRow[]>([]);
  const [liked, setLiked] = useState<Card[]>([]);
  const [passed, setPassed] = useState<Card[]>([]);
  const [drag, setDrag] = useState<{ x: number; start: number } | null>(null);
  const [fling, setFling] = useState<"left" | "right" | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [focusCity, setFocusCity] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatAnswers>({});
  const [chatDone, setChatDone] = useState(false);

  const signedIn = !!auth?.user;
  // While reading, the panel shows only the fields revealed so far, in checklist order.
  const shown = useMemo<Draft>(() => {
    if (step !== "reading") return d;
    const keep = (i: number) => revealed > i;
    return { ...d, name: keep(0) ? d.name : "", email: keep(1) ? d.email : "", college: keep(2) ? d.college : "",
      course: keep(3) ? d.course : "", gradYear: keep(4) ? d.gradYear : "", city: keep(5) ? d.city : "", skills: keep(6) ? d.skills : [] };
  }, [d, step, revealed]);

  useEffect(() => {
    setMounted(true);
    t0.current = Date.now();
  }, []);

  const log = useCallback((text: string, tone?: FeedItem["tone"]) => {
    setFeed((f) => [{ t: Math.round((Date.now() - t0.current) / 1000), text, tone }, ...f].slice(0, 9));
  }, []);

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
    setFileName(file.name);
    setRevealed(0);
    setStep("reading");
    log(`Reading ${file.name}`, "info");
    const form = new FormData();
    form.append("file", file);
    try {
      const [res] = await Promise.all([fetch("/api/start/parse", { method: "POST", body: form }), sleep(700)]);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "We couldn't read that file.");
      const draft = draftFrom(data.resume);
      try { localStorage.setItem(CONSENT_PENDING_KEY, "1"); } catch {}
      setD(signedIn ? { ...draft, email: auth!.user.email } : draft);
      for (let i = 1; i <= 7; i++) {
        setRevealed(i);
        await sleep(240);
      }
      log(`Found ${data.filled} of ${data.total} details`, "good");
      if (draft.skills.length) log(`Picked up ${draft.skills.length} skills: ${draft.skills.slice(0, 3).join(", ")}…`, "good");
      if (draft.unsure.size) log(`Not sure about: ${[...draft.unsure].join(", ")}`, "warn");
      await sleep(900);
      if (signedIn) {
        setStep("confirm");
        return;
      }
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
    if (err) {
      setError(err.message || "We couldn't send a code to that address.");
      setChangingEmail(true);
      return;
    }
    setSentTo(email);
    setChangingEmail(false);
    setCode("");
    log(`Code sent to ${maskEmail(email)}`, "info");
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
      log("Signed in · email verified", "good");
      setStep("confirm");
    },
    [sentTo, log],
  );

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
      log(d.edited.size ? `Saved your details · you fixed ${d.edited.size}` : "Saved your details", "good");
      const deck = await fetch("/api/start/deck").then((r) => r.json());
      setCards(Array.isArray(deck?.cards) ? deck.cards : []);
      setPool(Array.isArray(deck?.pool) ? deck.pool : []);
      log(`${deck?.pool?.length ?? 0} open roles to learn from`, "info");
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
      log(`${dir === "right" ? "Kept" : "Passed"} ${current.title} · ${current.company}`, dir === "right" ? "good" : undefined);
      if (dir === "right" && current.city) setFocusCity(current.city);
      setTimeout(() => {
        if (dir === "right") setLiked((l) => [...l, current]);
        else setPassed((p) => [...p, current]);
        setFling(null);
        setDrag(null);
      }, 220);
    },
    [current, fling, log],
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
    if (p.clusters.length) log(`Learned: ${p.clusters.slice(0, 2).join(" + ")}${p.minMonthly ? ` · ₹${p.minMonthly / 1000}k+` : ""}`, "good");
    setStep("cities");
  };
  useEffect(() => {
    if (step === "swipe" && cards.length && index >= cards.length) toCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, cards.length, step]);

  // ── 5. Cities → 6. Chat ──
  const cityCounts = useMemo(() => {
    const n = new Map<string, number>();
    for (const r of pool) if (r.city) n.set(r.city, (n.get(r.city) ?? 0) + 1);
    for (const c of cities) if (!n.has(c)) n.set(c, 0);
    return [...n.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [pool, cities]);
  const maxCount = Math.max(1, ...cityCounts.map(([, n]) => n));

  const toChat = async () => {
    const p = prefs ?? inferPrefs([], []);
    await fetch("/api/start/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "prefs", prefs: { ...p, cities, liked: liked.map((c) => c.id), passed: passed.map((c) => c.id) } }),
    }).catch(() => {});
    log(`Saved ${cities.length} ${cities.length === 1 ? "city" : "cities"}${cities.length ? `: ${cities.join(", ")}` : ""}`, "good");
    setStep("chat");
  };

  const finishChat = async (a: ChatAnswers) => {
    setChat(a);
    setChatDone(true);
    await fetch("/api/start/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "chat", chat: a }),
    }).catch(() => {});
    log("Profile complete", "good");
  };

  // Globe: home from the resume, hubs where roles are, targets from swipes / picks.
  const afterSwipes = step === "cities" || step === "chat" || step === "saving";
  const targetCities = afterSwipes ? cities : (prefs?.cities ?? []);
  const pins = useMemo<GlobePin[]>(() => {
    const out: GlobePin[] = [];
    const home = shown.city ? coordsOf(shown.city) : undefined;
    if (home) out.push({ id: "home", kind: "home", lat: home[0], lng: home[1], kicker: "You're here", text: shown.city });
    for (const [c, n] of cityCounts) {
      const at = coordsOf(c);
      if (!at) continue;
      const on = targetCities.includes(c);
      if (home && Math.abs(at[0] - home[0]) + Math.abs(at[1] - home[1]) < 0.3 && !on) continue;
      out.push({ id: c, kind: on ? "target" : "hub", lat: at[0], lng: at[1], ...(on ? { kicker: `${n} open`, text: c } : {}) });
    }
    return out;
  }, [shown.city, cityCounts, targetCities]);
  const globeFocus = focusCity ?? (shown.city ? "home" : null);

  const stepIndex = STEPS.findIndex((s) => s.key.includes(step));
  const dx = fling === "right" ? 560 : fling === "left" ? -560 : drag?.x ?? 0;
  const why = (c: Card) => {
    const want = CLUSTER_SKILLS[c.cluster] ?? [];
    const hits = d.skills.filter((s) => want.includes(s.toLowerCase())).slice(0, 3);
    return { fit: hits.length > 0, text: hits.length ? `Uses your ${hits.join(", ")}` : "A different direction. Tells us if you're open to it." };
  };
  const tags = (c: Card) => {
    const out: { text: string; cls: string }[] = [];
    if (c.city && d.city && c.city === d.city) out.push({ text: "Near you", cls: "bg-emerald-100 text-emerald-800" });
    else if (c.city) out.push({ text: `Move to ${c.city}`, cls: "bg-sky-100 text-sky-800" });
    else out.push({ text: "Remote", cls: "bg-violet-100 text-violet-800" });
    if (c.monthly) out.push({ text: c.monthly >= 40000 ? "Well paid" : "Paid", cls: "bg-emerald-100 text-emerald-800" });
    else out.push({ text: "Stipend not stated", cls: "bg-amber-100 text-amber-800" });
    if (/6 month/i.test(c.duration)) out.push({ text: "Long internship", cls: "bg-neutral-100 text-neutral-700" });
    return out;
  };
  const globeCaption =
    step === "swipe" && prefs?.cities.length
      ? `Your swipes point to ${prefs.cities.slice(0, 2).join(" and ")}`
      : afterSwipes
        ? cities.length ? `${cities.length} ${cities.length === 1 ? "city" : "cities"} picked` : "Pick where you'd work"
        : shown.city
          ? `Based in ${shown.city}`
          : "Your map lights up as we learn";
  const firstName = d.name.split(" ")[0] || "there";
  const known = [
    prefs?.clusters.length ? `you're into ${prefs.clusters.slice(0, 2).join(" and ")}` : null,
    cities.length ? `you want to work in ${cities.slice(0, 3).join(", ")}` : null,
    prefs?.minMonthly ? `you're after ₹${Math.round(prefs.minMonthly / 1000)}k+ a month` : null,
  ].filter(Boolean);
  const chatSummary = known.length
    ? `From your resume and swipes I know ${known.join(", ")}. I won't ask you that again.`
    : "I've got your resume, so I won't ask you anything that's already on it.";
  const chatSuggestions = [...new Set(liked.map((c) => c.company))];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-violet-50 via-white to-amber-50 lg:h-screen lg:overflow-hidden">
      <style>{`
        @keyframes sjPop { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
        .sj-pop { animation: sjPop .35s ease both }
        @media (prefers-reduced-motion: reduce) { .sj-pop { animation: none } }
      `}</style>

      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b-2 border-neutral-900 bg-white px-4 md:gap-4 md:px-6">
        <Link to="/" className="font-['Clash_Display'] text-2xl font-bold text-neutral-900">studojo</Link>
        <span className="hidden md:inline rounded-full border-2 border-neutral-900 bg-amber-200 px-2.5 py-0.5 font-['Satoshi'] text-xs font-bold">Getting to know you</span>
        <div className="flex flex-1 justify-center gap-1.5" data-tour="progress" aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <span key={s.label} className={`h-2.5 w-5 rounded-full border-2 border-neutral-900 transition-colors md:w-10 ${i < stepIndex ? "bg-neutral-900" : i === stepIndex ? "bg-violet-500" : "bg-white"}`} />
          ))}
        </div>
        <span className="hidden md:inline font-['Satoshi'] text-sm font-bold tabular-nums text-neutral-600">Step {stepIndex + 1}/{STEPS.length}</span>
        {!signedIn && <Link to="/auth?mode=signin" className="font-['Satoshi'] text-sm font-bold text-neutral-900 hover:text-violet-700">Sign in</Link>}
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_400px]">
        {/* Left rail: steps + what we've learned */}
        <aside className="hidden min-h-0 flex-col gap-5 overflow-y-auto border-r-2 border-neutral-900 bg-white p-4 lg:flex" data-tour="rail">
          <ol className="space-y-1.5">
            {STEPS.map((s, i) => {
              const done = i < stepIndex, now = i === stepIndex;
              return (
                <li key={s.label} className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2 transition-colors ${now ? "border-neutral-900 bg-violet-50 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]" : "border-transparent"}`}>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 font-['Clash_Display'] text-xs font-bold ${done ? "border-neutral-900 bg-neutral-900 text-white" : now ? `border-neutral-900 ${s.dot}` : "border-neutral-300 bg-white text-neutral-400"}`}>
                    {done ? <Check /> : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className={`block font-['Satoshi'] text-sm font-bold ${done || now ? "text-neutral-900" : "text-neutral-400"}`}>{s.label}</span>
                    <span className="block font-['Satoshi'] text-xs text-neutral-500">{s.hint}</span>
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="min-h-0 border-t-2 border-dashed border-neutral-200 pt-4" data-tour="feed">
            <div className={`${LABEL} mb-3 flex items-center gap-1.5`}>
              <span className={`h-2 w-2 rounded-full ${feed.length ? "bg-emerald-500" : "bg-neutral-300"}`} /> What we've learned
            </div>
            {feed.length === 0 ? (
              <p className="font-['Satoshi'] text-xs leading-relaxed text-neutral-500">
                Everything we read or work out shows up here, so nothing about your profile is a mystery.
              </p>
            ) : (
              <ul className="space-y-2">
                {feed.map((f, i) => (
                  <li key={`${f.t}-${i}-${f.text}`} className="grid grid-cols-[34px_1fr] gap-1.5 font-['Satoshi'] text-xs leading-snug sj-pop">
                    <span className="tabular-nums text-neutral-400">{`0:${String(f.t).padStart(2, "0")}`}</span>
                    <span className={f.tone === "good" ? "font-semibold text-neutral-900" : f.tone === "warn" ? "font-semibold text-amber-700" : "text-neutral-600"}>{f.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="mt-auto rounded-xl bg-neutral-50 p-3 font-['Satoshi'] text-[11px] leading-relaxed text-neutral-500">
            Your file is read once and isn't stored until you confirm. No password is created.
          </p>
        </aside>

        {/* Centre: the current step */}
        <main className="min-h-0 overflow-y-auto px-4 py-8 md:px-10">
          <div className={`mx-auto flex min-h-full max-w-[680px] flex-col gap-6 ${step === "chat" || step === "saving" ? "" : "justify-center"}`}>
            {/* 1. Drop */}
            {(step === "drop" || step === "reading") && (
              <>
                <div>
                  <span className="inline-block -rotate-2 rounded-lg border-2 border-neutral-900 bg-amber-300 px-2.5 py-1 font-['Satoshi'] text-xs font-bold shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">No forms · no password</span>
                  <h1 className={`${H1} mt-4`}>
                    Drop your resume.
                    <br />
                    <span className="text-violet-600">That's the signup.</span>
                  </h1>
                  <p className="mt-3 max-w-xl font-['Satoshi'] text-base text-neutral-600">
                    We read it in a second, set up your account, and get to know you with a few swipes and a quick chat.
                  </p>
                </div>
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
                  className={`relative block overflow-hidden rounded-2xl border-[3px] border-dashed bg-white transition-colors ${dragOver ? "border-violet-500 bg-violet-50" : "border-neutral-900"} ${step === "reading" ? "pointer-events-none p-5" : "cursor-pointer p-8"}`}
                >
                  <input
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
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 animate-ping rounded-full bg-violet-500" />
                        <span className="truncate font-['Clash_Display'] text-lg font-bold text-neutral-900">Reading {fileName}</span>
                        <span className="ml-auto font-['Satoshi'] text-sm font-bold tabular-nums text-neutral-500">{Math.min(revealed, 7)}/7</span>
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {(
                          [
                            ["Name", d.name],
                            ["Email", d.email],
                            ["College", d.college],
                            ["Course", d.course],
                            ["Graduating", d.gradYear],
                            ["City", d.city],
                            ["Skills", d.skills.length ? `${d.skills.length} found` : ""],
                          ] as [string, string][]
                        ).map(([k, v], i) => (
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
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ["bg-violet-200", "Read in a second", "Name, college, skills and links come straight off your resume."],
                        ["bg-pink-200", "A code, not a password", "We email a 6-digit code to the address on it."],
                        ["bg-emerald-200", "Swipe, then chat", "Keep or pass real roles, then a one-minute chat."],
                      ].map(([bg, t, b], i) => (
                        <div key={t} className={`${CARD} p-4`}>
                          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border-2 border-neutral-900 ${bg} font-['Clash_Display'] text-sm font-bold`}>{i + 1}</span>
                          <div className="mt-2 font-['Satoshi'] text-sm font-bold text-neutral-900">{t}</div>
                          <div className="mt-1 font-['Satoshi'] text-xs leading-relaxed text-neutral-600">{b}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {!signedIn && (
                        <button
                          type="button"
                          className={BTN_GHOST}
                          onClick={() => {
                            try { localStorage.setItem(CONSENT_PENDING_KEY, "1"); } catch {}
                            authClient.signIn.social({ provider: "google", callbackURL: "/start", errorCallbackURL: "/auth?redirect=%2Fstart" });
                          }}
                        >
                          No resume handy? Continue with Google
                        </button>
                      )}
                      <p className="max-w-md font-['Satoshi'] text-xs text-neutral-500">
                        By continuing, you confirm you are 18 or older and agree to our{" "}
                        <a href="/terms" target="_blank" rel="noopener" className="underline">Terms of Service</a> and{" "}
                        <a href="/privacy" target="_blank" rel="noopener" className="underline">Privacy Policy</a>.
                      </p>
                    </div>
                  </>
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
                  <div className={`${CARD} p-6`}>
                    <label htmlFor="start-code" className={LABEL}>6-digit code</label>
                    <div className="relative mt-3 inline-block">
                      <input
                        id="start-code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        autoFocus
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="absolute inset-0 opacity-0"
                      />
                      <div className="flex gap-2" aria-hidden="true">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className={`flex h-14 w-11 items-center justify-center rounded-xl border-2 font-['Clash_Display'] text-2xl font-bold sm:h-16 sm:w-12 ${code[i] ? "border-neutral-900 bg-violet-50" : i === code.length ? "border-violet-500 bg-white" : "border-neutral-900 bg-white"}`}>
                            {code[i] ?? ""}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 font-['Satoshi'] text-sm text-neutral-500">
                      {verifying ? "Checking…" : "You're signed in as soon as you type the last digit."}{" "}
                      {!verifying && <button type="button" onClick={() => void sendCode(sentTo)} className="font-bold text-violet-700 hover:text-violet-900">Send a new code</button>}
                    </p>
                  </div>
                ) : (
                  <form
                    className={`${CARD} flex flex-wrap gap-2 p-4`}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (/\S+@\S+\.\S+/.test(d.email)) void sendCode(d.email.trim().toLowerCase());
                    }}
                  >
                    <label htmlFor="start-email" className="sr-only">Email</label>
                    <input id="start-email" type="email" value={d.email} onChange={(e) => setD((x) => ({ ...x, email: e.target.value }))} placeholder="you@college.edu"
                      className="min-w-0 flex-1 rounded-xl border-2 border-neutral-300 px-3 py-2 font-['Satoshi'] text-base focus:border-violet-500 focus:outline-none" />
                    <button type="submit" className={BTN}>Send code</button>
                  </form>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border-2 border-dashed border-neutral-300 bg-white/60 p-4 font-['Satoshi'] text-sm text-neutral-600">
                    <span className="font-bold text-neutral-900">No password to remember.</span> Next time, sign in with a code the same way.
                  </div>
                  <div className="rounded-xl border-2 border-dashed border-neutral-300 bg-white/60 p-4 font-['Satoshi'] text-sm text-neutral-600">
                    <span className="font-bold text-neutral-900">Can't find it?</span> Check spam or Promotions. Codes last 10 minutes.
                  </div>
                </div>
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
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
                    const mine = d.edited.has(key === "gradYear" ? "year" : (key as string));
                    const pill = unsure
                      ? { t: "Check this", cls: "bg-amber-300 text-neutral-900" }
                      : !value
                        ? { t: "Add", cls: "bg-neutral-100 text-neutral-600" }
                        : mine
                          ? { t: "Edited", cls: "bg-violet-200 text-violet-900" }
                          : { t: "From resume", cls: "bg-emerald-200 text-emerald-900" };
                    return editing === key ? (
                      <div key={key} className="rounded-xl border-2 border-violet-500 bg-white p-3 shadow-[3px_3px_0px_0px_rgba(139,92,246,1)]">
                        <label htmlFor={`start-${key}`} className={`${LABEL} text-violet-700`}>{label}</label>
                        <input
                          id={`start-${key}`}
                          autoFocus
                          defaultValue={value}
                          placeholder={ph}
                          onBlur={(e) => { setField(key, e.target.value.trim()); setEditing(null); }}
                          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                          className="mt-1 w-full bg-transparent font-['Satoshi'] text-base font-bold text-neutral-900 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <button
                        key={key}
                        type="button"
                        data-tour={`field-${key}`}
                        onClick={() => setEditing(key as string)}
                        className={`rounded-xl border-2 p-3 text-left transition-all hover:-translate-y-0.5 ${unsure ? "border-dashed border-amber-500 bg-amber-50" : value ? "border-neutral-900 bg-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]" : "border-dashed border-neutral-300 bg-white"}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={LABEL}>{label}</span>
                          <span className={`rounded-full px-2 py-0.5 font-['Satoshi'] text-[10px] font-bold ${pill.cls}`}>{pill.t}</span>
                        </div>
                        <div className={`mt-1 font-['Satoshi'] text-base font-bold ${value ? "text-neutral-900" : "text-neutral-400"}`}>{value || ph}</div>
                      </button>
                    );
                  })}
                  <div className="rounded-xl border-2 border-neutral-900 bg-white p-3 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
                    <span className={LABEL}>Experience</span>
                    {d.experience.length ? (
                      <ul className="mt-1 space-y-0.5">
                        {d.experience.slice(0, 3).map((e, i) => (
                          <li key={i} className="font-['Satoshi'] text-sm"><span className="font-bold">{e.title}</span>{e.company && <span className="text-neutral-500"> · {e.company}</span>}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-1 font-['Satoshi'] text-sm text-neutral-400">None yet. That's fine.</div>
                    )}
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
                        <button
                          type="button"
                          aria-label={`Remove ${s}`}
                          onClick={() => setD((x) => ({ ...x, skills: x.skills.filter((k) => k !== s), edited: new Set(x.edited).add("skills") }))}
                          className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-violet-300"
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
                      <input id="start-skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="+ add skill"
                        className="w-28 rounded-full border-2 border-dashed border-neutral-400 px-2.5 py-0.5 font-['Satoshi'] text-xs focus:border-violet-500 focus:outline-none" />
                    </form>
                  </div>
                  {(d.links.github || d.links.linkedin || d.links.portfolio) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t-2 border-dashed border-neutral-200 pt-3">
                      <span className={LABEL}>Links</span>
                      {d.links.github && <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 font-['Satoshi'] text-xs font-semibold">GitHub @{d.links.github}</span>}
                      {d.links.linkedin && <span className="rounded-full bg-sky-100 px-2.5 py-0.5 font-['Satoshi'] text-xs font-semibold">LinkedIn</span>}
                      {d.links.portfolio && <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 font-['Satoshi'] text-xs font-semibold">{d.links.portfolio.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>}
                    </div>
                  )}
                </div>
                {error && <p className="font-['Satoshi'] text-sm font-semibold text-red-600">{error}</p>}
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={confirm} disabled={saving || !d.name.trim()} className={BTN} data-tour="looks-right">
                    {saving ? "Saving…" : "Looks right →"}
                  </button>
                  <span className="font-['Satoshi'] text-sm text-neutral-500">{!d.name.trim() ? "Add your name to continue." : "Next: a few swipes so we know what you want."}</span>
                </div>
              </div>
            )}

            {/* 4. Swipe */}
            {step === "swipe" && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <span className="inline-block -rotate-2 rounded-lg border-2 border-neutral-900 bg-violet-300 px-2.5 py-1 font-['Satoshi'] text-xs font-bold shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">Getting to know you</span>
                    <h1 className={`${H1} mt-4`}>Would you take this?</h1>
                    <p className="mt-2 font-['Satoshi'] text-base text-neutral-600">Real roles, open right now. Keep or pass; we learn what you want from what you keep.</p>
                  </div>
                  <span className="font-['Clash_Display'] text-lg font-bold tabular-nums text-neutral-900">{Math.min(index + 1, cards.length)}/{cards.length}</span>
                </div>
                <div className="flex gap-1" aria-hidden="true">
                  {cards.map((c, i) => (
                    <span key={c.id} className={`h-2 flex-1 rounded-full border border-neutral-900 ${i < index ? (liked.includes(c) ? "bg-violet-500" : "bg-neutral-300") : i === index ? "bg-amber-300" : "bg-white"}`} />
                  ))}
                </div>

                <div className="relative h-[310px] select-none" data-tour="deck">
                  {cards.slice(index, index + 3).reverse().map((c, i, arr) => {
                    const top = i === arr.length - 1;
                    const depth = arr.length - 1 - i;
                    const w = why(c);
                    return (
                      <div
                        key={c.id}
                        data-cluster={c.cluster}
                        onPointerDown={top ? (e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setDrag({ x: 0, start: e.clientX }); } : undefined}
                        onPointerMove={top ? (e) => drag && setDrag({ ...drag, x: e.clientX - drag.start }) : undefined}
                        onPointerUp={top ? () => { if (drag && Math.abs(drag.x) > 90) decide(drag.x > 0 ? "right" : "left"); else setDrag(null); } : undefined}
                        className={`absolute inset-0 flex touch-none flex-col rounded-2xl border-2 border-neutral-900 bg-white p-6 ${top ? "cursor-grab shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]" : ""}`}
                        style={{
                          transform: top ? `translateX(${dx}px) rotate(${dx / 22}deg)` : `translateY(${depth * 10}px) scale(${1 - depth * 0.04})`,
                          transition: drag && !fling ? "none" : "transform .22s ease",
                        }}
                      >
                        {top && dx !== 0 && (
                          <span
                            className={`absolute top-5 rounded-lg border-2 px-2 py-0.5 font-['Clash_Display'] text-lg font-bold ${dx > 0 ? "right-5 rotate-6 border-emerald-600 bg-emerald-50 text-emerald-700" : "left-5 -rotate-6 border-red-500 bg-red-50 text-red-600"}`}
                            style={{ opacity: Math.min(1, Math.abs(dx) / 90) }}
                          >
                            {dx > 0 ? "INTERESTED" : "NOT FOR ME"}
                          </span>
                        )}
                        <div className="flex items-center gap-3">
                          <span className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 border-neutral-900 ${CLUSTER_STYLE[c.cluster]} font-['Clash_Display'] text-sm font-bold`}>
                            {c.company.replace(/[^A-Za-z0-9 ]/g, "").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <div className="font-['Satoshi'] text-sm font-bold text-neutral-900">{c.company}</div>
                            <div className="font-['Satoshi'] text-xs text-neutral-500">is hiring</div>
                          </div>
                          <span className={`ml-auto rounded-full border-2 border-neutral-900 ${CLUSTER_STYLE[c.cluster]} px-2.5 py-0.5 font-['Satoshi'] text-xs font-bold`}>{c.cluster}</span>
                        </div>
                        <div className="mt-4 font-['Clash_Display'] text-3xl font-bold leading-tight text-neutral-900">{c.title}</div>
                        <div className={`mt-2 flex items-center gap-1.5 font-['Satoshi'] text-sm font-semibold ${w.fit ? "text-emerald-700" : "text-neutral-500"}`}>
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {w.text}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {tags(c).map((t) => (
                            <span key={t.text} className={`rounded-full px-2.5 py-0.5 font-['Satoshi'] text-xs font-bold ${t.cls}`}>{t.text}</span>
                          ))}
                        </div>
                        <dl className="mt-auto grid grid-cols-3 gap-3 border-t-2 border-neutral-100 pt-4">
                          {[["Stipend", c.stipend], ["Where", c.city ?? c.location], ["Length", c.duration]].map(([k, v]) => (
                            <div key={k} className="min-w-0">
                              <dt className={LABEL}>{k}</dt>
                              <dd className="truncate font-['Satoshi'] text-sm font-bold text-neutral-900">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    );
                  })}
                  {cards.length === 0 && (
                    <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 font-['Satoshi'] text-sm text-neutral-500">
                      No open roles to show yet. You can pick cities next.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button type="button" onClick={() => decide("left")} className={`${BTN_GHOST} min-w-[150px]`} data-tour="pass">✕ Not for me</button>
                  <button type="button" onClick={() => decide("right")} className={`${BTN} min-w-[150px]`} data-tour="like">♥ Interested</button>
                </div>
                <p className="text-center font-['Satoshi'] text-xs text-neutral-500">
                  Drag the card, use the buttons, or press ← →.{" "}
                  {(index >= 6 || cards.length === 0) && (
                    <button type="button" onClick={toCities} className="font-bold text-violet-700 hover:text-violet-900">That's enough, next →</button>
                  )}
                </p>
              </div>
            )}

            {/* 5. Cities */}
            {step === "cities" && (
              <div data-tour="cities" className="space-y-5">
                <div>
                  <h1 className={H1}>Where would you work?</h1>
                  <p className="mt-3 font-['Satoshi'] text-base text-neutral-600">{cities.length ? "Picked from your swipes. Tap to add or remove; the globe follows." : "Tap the cities you'd work in."}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {cityCounts.map(([c, n]) => {
                    const on = cities.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setFocusCity(c); setCities((x) => (on ? x.filter((k) => k !== c) : [...x, c])); }}
                        className={`rounded-xl border-2 border-neutral-900 p-3 text-left transition-all hover:-translate-y-0.5 ${on ? "bg-violet-100 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]" : "bg-white"}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-['Clash_Display'] text-lg font-bold text-neutral-900">{c}</span>
                          <span className={`flex h-6 w-6 items-center justify-center rounded-md border-2 border-neutral-900 ${on ? "bg-violet-500 text-white" : "bg-white"}`}>{on && <Check />}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="h-2 flex-1 overflow-hidden rounded-full border border-neutral-900 bg-white">
                            <span className={`block h-full ${on ? "bg-violet-500" : "bg-amber-300"}`} style={{ width: `${(n / maxCount) * 100}%` }} />
                          </span>
                          <span className="font-['Satoshi'] text-xs font-bold tabular-nums text-neutral-600">{n} open</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={toChat} className={BTN} data-tour="finish">Next: a quick chat →</button>
                  <span className="font-['Satoshi'] text-sm text-neutral-500">One minute. Things a resume can't tell us.</span>
                </div>
              </div>
            )}

            {/* 6. Chat */}
            {(step === "chat" || step === "saving") && (
              <div className="flex h-[78vh] flex-col gap-4 lg:h-[calc(100vh-64px-64px)]">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h1 className="font-['Clash_Display'] text-3xl font-bold leading-tight text-neutral-900 md:text-4xl">Tell us more about you.</h1>
                    <p className="mt-2 font-['Satoshi'] text-sm text-neutral-600">What a resume can't say. Everything you answer shows up on the right.</p>
                  </div>
                  {chatDone && (
                    <button type="button" onClick={() => { setStep("saving"); navigate("/profile"); }} className={BTN} data-tour="done">
                      {step === "saving" ? "Opening…" : "See my profile →"}
                    </button>
                  )}
                </div>
                <div className="flex min-h-0 flex-1 flex-col">
                  <ProfileChat firstName={firstName} summary={chatSummary} suggestions={chatSuggestions} onAnswer={setChat} onDone={finishChat} />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right: live panel */}
        <aside className="min-h-0 space-y-4 overflow-y-auto border-t-2 border-neutral-900 bg-white/70 p-4 lg:border-l-2 lg:border-t-0">
          <div
            data-tour="globe"
            className="relative overflow-hidden rounded-2xl border-2 border-neutral-900 p-4 text-white shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]"
            style={{ background: "radial-gradient(120% 90% at 50% 0%, #4c1d95 0%, #1e1b4b 50%, #0f0d24 100%)" }}
          >
            <div className="relative z-10 flex items-center justify-between">
              <span className="font-['Satoshi'] text-[10px] font-bold uppercase tracking-wider text-white/60">Your map</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 font-['Satoshi'] text-[11px] font-bold">
                <span className={`h-1.5 w-1.5 rounded-full ${pins.length ? "bg-emerald-400" : "bg-white/40"}`} />
                {pins.length ? "Live" : "Waiting"}
              </span>
            </div>
            <div className="relative mx-auto mt-1 max-w-[320px]">
              <div aria-hidden="true" className="absolute inset-[8%] rounded-full" style={{ boxShadow: "0 0 70px 8px rgba(139,92,246,.4)" }} />
              <TalentGlobe pins={pins} arcsFrom="home" focus={globeFocus} tone="dark" />
            </div>
            <div className="text-center font-['Satoshi'] text-sm font-bold text-white/90">{globeCaption}</div>
            <div className="mt-2 flex justify-center gap-3 font-['Satoshi'] text-[11px] text-white/60">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-300" />You</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />Your picks</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-400/70" />Roles open</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Stat label="Skills" value={shown.skills.length || "–"} bg="bg-violet-200" />
            <Stat label="Roles fit" value={pool.length ? matchCount : "–"} bg="bg-amber-200" tour="counter" />
            <Stat label="Cities" value={(afterSwipes ? cities.length : prefs?.cities.length) || "–"} bg="bg-emerald-200" />
          </div>

          <TalentCard d={shown} prefs={prefs} chat={chat} />
        </aside>
      </div>
    </div>
  );
}
