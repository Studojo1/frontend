import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import type { QuickResume } from "~/lib/resume-quick-parse";
import { inferPrefs, matches, type Cluster, type DeckRole } from "~/lib/swipe-prefs";
import { TalentGlobe, type GlobePin } from "~/components/profile/talent-globe";
import { COORDS } from "~/lib/geo";

/**
 * /start: sign up by dropping a resume. This is the profiling stage that
 * leads into the Sensei-style outreach app, so it uses the same design
 * language (Geist, indigo, soft bordered panels, a live panel on the right).
 *
 *  1. Drop    the resume is read instantly (no account yet, nothing stored)
 *  2. Verify  a six-digit code goes to the email on the resume; no password
 *  3. Confirm one tap if we read it right; edit only what's wrong
 *  4. Swipe   real roles instead of a quiz, so we learn what they want
 *  5. Cities  confirm where they'd work, on the globe
 *
 * The right panel (globe, counts, talent card) fills in as each step lands.
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

const CONSENT_PENDING_KEY = "sj_consent_pending";
const STASH_KEY = "sj_start_resume";

const STEPS: { key: Step[]; label: string; hint: string }[] = [
  { key: ["drop", "reading"], label: "Drop your resume", hint: "We read it in a second" },
  { key: ["verify"], label: "Verify your email", hint: "A code, not a password" },
  { key: ["confirm"], label: "Check what we found", hint: "Fix only what's wrong" },
  { key: ["swipe"], label: "Swipe real roles", hint: "We learn what you want" },
  { key: ["cities", "saving"], label: "Pick your cities", hint: "Where you'd work" },
];

// One hue per kind of work, so the deck isn't a wall of the same colour.
const CLUSTER_HUE: Record<Cluster, { bg: string; fg: string }> = {
  Analytics: { bg: "#EEEFFD", fg: "#4349C9" },
  Product: { bg: "#F3ECFE", fg: "#7A3FD8" },
  Engineering: { bg: "#E8F4FD", fg: "#1F6FB2" },
  Design: { bg: "#FDEDF5", fg: "#B4337A" },
  Marketing: { bg: "#FFF1E6", fg: "#B85A12" },
  Finance: { bg: "#E8F7F0", fg: "#167A55" },
  Consulting: { bg: "#E6F6F6", fg: "#13777A" },
  Sales: { bg: "#FFF7E0", fg: "#946200" },
  Content: { bg: "#FDECEC", fg: "#B23B3B" },
  HR: { bg: "#F0F7E4", fg: "#4F7A16" },
  Operations: { bg: "#EEF1F5", fg: "#4A5568" },
  Other: { bg: "#F1F1F5", fg: "#55556A" },
};

// Skills that make a kind of work a natural fit, for "why you're seeing this".
const CLUSTER_SKILLS: Partial<Record<Cluster, string[]>> = {
  Analytics: ["sql", "excel", "python", "tableau", "power bi", "statistics", "r", "looker", "data analysis"],
  Product: ["sql", "figma", "a/b testing", "excel", "product management", "mixpanel", "analytics"],
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

const CSS = `
@font-face { font-family: "Geist"; src: url(/fonts/geist/Geist-Variable.woff2) format("woff2"); font-weight: 100 900; font-display: swap; }
@font-face { font-family: "Geist Mono"; src: url(/fonts/geist/GeistMono-Variable.woff2) format("woff2"); font-weight: 100 900; font-display: swap; }
.st {
  --bg: #FBFBFD; --panel: #FFFFFF; --ink: #16161E; --ink-2: #3A3A4A; --muted: #6B6B80; --faint: #9A9AAD;
  --line: #E7E7EF; --line-2: #F0F0F5; --indigo: #5B63E8; --indigo-ink: #4349C9; --indigo-soft: #EEEFFD;
  --green: #12A672; --green-soft: #E7F7F0; --amber: #D98A00; --amber-soft: #FFF5E0; --night: #10112A;
  --sans: "Geist", -apple-system, "Segoe UI", system-ui, sans-serif; --mono: "Geist Mono", ui-monospace, Menlo, monospace;
  font-family: var(--sans); color: var(--ink); background: var(--bg);
  min-height: 100dvh; display: grid; grid-template-rows: auto 1fr;
}
.st *:focus-visible { outline: 2px solid var(--indigo); outline-offset: 2px; border-radius: 8px; }
.st-mono { font-family: var(--mono); font-variant-numeric: tabular-nums; }
.st-label { font-family: var(--mono); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--faint); }
@media (max-width: 720px) { .st-hide-sm { display: none !important; } .st-seg { width: 22px !important; } .st-top { gap: 10px !important; padding: 0 14px !important; } }
.st-top { height: 56px; display: flex; align-items: center; gap: 16px; padding: 0 20px; border-bottom: 1px solid var(--line); background: var(--panel); }
.st-body { display: grid; grid-template-columns: 1fr; min-height: 0; }
@media (min-width: 1100px) { .st-body { grid-template-columns: 272px minmax(0, 1fr) 420px; height: calc(100dvh - 56px); } .st-rail, .st-center, .st-side { overflow-y: auto; } }
.st-rail { display: none; border-right: 1px solid var(--line); background: var(--panel); padding: 20px 16px; }
@media (min-width: 1100px) { .st-rail { display: flex; flex-direction: column; gap: 20px; } }
.st-center { position: relative; padding: 28px 20px 40px; background-color: var(--bg);
  background-image: radial-gradient(circle at 1px 1px, #DCDCE8 1px, transparent 0); background-size: 22px 22px; }
@media (min-width: 1100px) { .st-center { padding: 40px 48px; } }
.st-center-inner { max-width: 680px; margin: 0 auto; min-height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 22px; }
.st-side { border-left: 1px solid var(--line); background: var(--panel); padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.st-panel { background: var(--panel); border: 1px solid var(--line); border-radius: 16px; box-shadow: 0 1px 2px rgba(22,22,30,.04), 0 8px 24px rgba(22,22,30,.04); }
.st-h1 { font-size: clamp(30px, 4vw, 46px); line-height: 1.05; letter-spacing: -.03em; font-weight: 650; text-wrap: balance; margin: 0; }
.st-sub { color: var(--muted); font-size: 16px; line-height: 1.55; max-width: 56ch; margin: 0; }
.st-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 18px; border-radius: 12px; font: 600 14px var(--sans);
  background: var(--ink); color: #fff; border: 0; cursor: pointer; transition: transform .15s, background .15s; }
.st-btn:hover { background: #2A2A38; } .st-btn:active { transform: translateY(1px); }
.st-btn[disabled] { opacity: .5; pointer-events: none; }
.st-btn.indigo { background: var(--indigo); } .st-btn.indigo:hover { background: var(--indigo-ink); }
.st-btn.ghost { background: var(--panel); color: var(--ink); border: 1px solid var(--line); } .st-btn.ghost:hover { background: var(--line-2); }
.st-link { color: var(--indigo-ink); font-weight: 600; background: none; border: 0; padding: 0; cursor: pointer; font: inherit; font-weight: 600; }
.st-pill { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 8px; border-radius: 999px; font: 600 11px var(--sans); white-space: nowrap; }
.st-kbd { font: 500 11px var(--mono); border: 1px solid var(--line); border-bottom-width: 2px; border-radius: 6px; padding: 1px 6px; color: var(--muted); background: var(--panel); }
.st-chip { display: inline-flex; align-items: center; gap: 4px; height: 26px; padding: 0 10px; border-radius: 999px; font: 500 12px var(--sans); background: var(--line-2); color: var(--ink-2); }
@keyframes stPop { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
.st-pop { animation: stPop .35s ease both }
@keyframes stScan { from { top: 8% } to { top: 88% } }
@keyframes stSpin { to { transform: rotate(360deg) } }
.st-spin { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--indigo-soft); border-top-color: var(--indigo); animation: stSpin .8s linear infinite; }
@media (prefers-reduced-motion: reduce) { .st-pop, .st-spin { animation: none } .st-scan { display: none } }
`;

type FeedItem = { t: number; text: string; tone?: "good" | "warn" | "info" };

// ── Right panel ──────────────────────────────────────────────────────────────

function Stat({ label, value, tone, tour }: { label: string; value: ReactNode; tone?: string; tour?: string }) {
  return (
    <div className="st-panel" style={{ padding: "12px 12px 10px", textAlign: "center" }} data-tour={tour}>
      <div className="st-mono" style={{ fontSize: 24, fontWeight: 600, color: tone ?? "var(--ink)", lineHeight: 1.1 }}>{value}</div>
      <div className="st-label" style={{ marginTop: 4, fontSize: 10 }}>{label}</div>
    </div>
  );
}

function TalentCard({ d, prefs }: { d: Draft; prefs: ReturnType<typeof inferPrefs> | null }) {
  const initials = (d.name || "").split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const line = [d.course, d.college, d.gradYear && `’${d.gradYear.slice(-2)}`].filter(Boolean).join(" · ");
  return (
    <div className="st-panel" style={{ padding: 16 }} data-tour="card">
      <div className="st-label" style={{ marginBottom: 10 }}>Your profile, building itself</div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div
          style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", fontWeight: 650, fontSize: 15,
            background: initials ? "linear-gradient(135deg,#5B63E8,#8B5CF6)" : "var(--line-2)", color: initials ? "#fff" : "var(--faint)" }}
        >
          {initials || "?"}
        </div>
        <div style={{ minWidth: 0 }}>
          {d.name ? <div className="st-pop" style={{ fontWeight: 650, fontSize: 16 }}>{d.name}</div> : <div style={{ height: 14, width: 140, borderRadius: 6, background: "var(--line-2)" }} />}
          {line ? (
            <div className="st-pop" style={{ fontSize: 12.5, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 300 }}>{line}</div>
          ) : (
            <div style={{ height: 10, width: 200, borderRadius: 6, background: "var(--line-2)", marginTop: 6 }} />
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 12 }}>
        {d.skills.length
          ? d.skills.slice(0, 8).map((s, i) => (
              <span key={s} className="st-chip st-pop" style={{ height: 22, fontSize: 11, animationDelay: `${i * 40}ms` }}>{s}</span>
            ))
          : [64, 48, 80, 56].map((w, i) => <span key={i} style={{ height: 22, width: w, borderRadius: 999, background: "var(--line-2)" }} />)}
      </div>
      <div style={{ borderTop: "1px dashed var(--line)", marginTop: 12, paddingTop: 10 }}>
        <div className="st-label" style={{ fontSize: 10 }}>Looking for</div>
        {prefs && (prefs.clusters.length || prefs.cities.length || prefs.minMonthly) ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
            {prefs.clusters.slice(0, 3).map((c) => (
              <span key={c} className="st-pill st-pop" style={{ background: CLUSTER_HUE[c].bg, color: CLUSTER_HUE[c].fg }}>{c}</span>
            ))}
            {prefs.cities.slice(0, 3).map((c) => (
              <span key={c} className="st-pill st-pop" style={{ background: "var(--line-2)", color: "var(--ink-2)" }}>{c}</span>
            ))}
            {prefs.minMonthly ? (
              <span className="st-pill st-pop st-mono" style={{ background: "var(--green-soft)", color: "var(--green)" }}>₹{Math.round(prefs.minMonthly / 1000)}k+/mo</span>
            ) : null}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 4 }}>Fills in as you swipe roles</div>
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

  // swipe + cities
  const [cards, setCards] = useState<Card[]>([]);
  const [pool, setPool] = useState<PoolRow[]>([]);
  const [liked, setLiked] = useState<Card[]>([]);
  const [passed, setPassed] = useState<Card[]>([]);
  const [drag, setDrag] = useState<{ x: number; start: number } | null>(null);
  const [fling, setFling] = useState<"left" | "right" | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [focusCity, setFocusCity] = useState<string | null>(null);

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
        setRevealed(99);
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
      // Reveal the found fields one by one so the student sees what we read.
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

  // City options: where the open roles are, with counts.
  const cityCounts = useMemo(() => {
    const n = new Map<string, number>();
    for (const r of pool) if (r.city) n.set(r.city, (n.get(r.city) ?? 0) + 1);
    for (const c of cities) if (!n.has(c)) n.set(c, 0);
    return [...n.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [pool, cities]);
  const maxCount = Math.max(1, ...cityCounts.map(([, n]) => n));

  // Globe: home from the resume, hubs where roles are, targets from swipes / picks.
  const targetCities = step === "cities" || step === "saving" ? cities : (prefs?.cities ?? []);
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
  const dx = fling === "right" ? 560 : fling === "left" ? -560 : drag?.x ?? 0;
  const why = (c: Card) => {
    const want = CLUSTER_SKILLS[c.cluster] ?? [];
    const hits = d.skills.filter((s) => want.includes(s.toLowerCase())).slice(0, 3);
    return hits.length ? `Uses your ${hits.join(", ")}` : "A different direction. Tells us if you're open to it.";
  };
  const tags = (c: Card) => {
    const out: { text: string; bg: string; fg: string }[] = [];
    if (c.city && d.city && c.city === d.city) out.push({ text: "Near you", bg: "var(--green-soft)", fg: "var(--green)" });
    else if (c.city) out.push({ text: `Move to ${c.city}`, bg: "var(--line-2)", fg: "var(--ink-2)" });
    else out.push({ text: "Remote", bg: "var(--indigo-soft)", fg: "var(--indigo-ink)" });
    if (c.monthly) out.push({ text: c.monthly >= 40000 ? "Well paid" : "Paid", bg: "var(--green-soft)", fg: "var(--green)" });
    else out.push({ text: "Stipend not stated", bg: "var(--amber-soft)", fg: "var(--amber)" });
    if (/6 month/i.test(c.duration)) out.push({ text: "Long internship", bg: "var(--line-2)", fg: "var(--ink-2)" });
    return out;
  };
  const globeCaption =
    step === "swipe" && prefs?.cities.length
      ? `Your swipes point to ${prefs.cities.slice(0, 2).join(" and ")}`
      : step === "cities" || step === "saving"
        ? cities.length ? `${cities.length} ${cities.length === 1 ? "city" : "cities"} picked` : "Pick where you'd work"
        : shown.city
          ? `Based in ${shown.city}`
          : "Your map lights up as we learn";

  return (
    <div className="st">
      <style>{CSS}</style>

      {/* Top bar */}
      <header className="st-top">
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink)", textDecoration: "none" }}>
          <span style={{ width: 26, height: 26, borderRadius: 8, background: "var(--ink)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13 }}>S</span>
          <span style={{ fontWeight: 650, fontSize: 15 }}>studojo</span>
        </Link>
        <span className="st-hide-sm" style={{ width: 1, height: 20, background: "var(--line)" }} />
        <span className="st-hide-sm" style={{ fontSize: 14, color: "var(--muted)" }}>Getting to know you</span>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 4 }} data-tour="progress" aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <span key={s.label} className="st-seg" style={{ width: 44, height: 4, borderRadius: 4, background: i < stepIndex ? "var(--ink)" : i === stepIndex ? "var(--indigo)" : "var(--line)", transition: "background .3s" }} />
          ))}
        </div>
        <span className="st-mono st-hide-sm" style={{ fontSize: 12, color: "var(--muted)" }}>Step {stepIndex + 1} of {STEPS.length}</span>
        {!signedIn && <Link to="/auth?mode=signin" style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Sign in</Link>}
      </header>

      <div className="st-body">
        {/* Left rail: steps + what we've learned */}
        <aside className="st-rail" data-tour="rail">
          <div>
            <div className="st-label" style={{ marginBottom: 12 }}>Setup · about 90 seconds</div>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
              {STEPS.map((s, i) => {
                const done = i < stepIndex, now = i === stepIndex;
                return (
                  <li key={s.label} style={{ display: "flex", gap: 10, padding: "8px 10px", borderRadius: 10, background: now ? "var(--indigo-soft)" : "transparent" }}>
                    <span style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, display: "grid", placeItems: "center" }}>
                      {done ? (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="#12A672" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      ) : now ? (
                        <span className="st-spin" />
                      ) : (
                        <span style={{ width: 13, height: 13, borderRadius: "50%", border: "1.5px solid var(--line)" }} />
                      )}
                    </span>
                    <span>
                      <span style={{ display: "block", fontSize: 13.5, fontWeight: now ? 600 : 500, color: done || now ? "var(--ink)" : "var(--faint)" }}>{s.label}</span>
                      <span style={{ display: "block", fontSize: 12, color: "var(--faint)" }}>{s.hint}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, minHeight: 0 }} data-tour="feed">
            <div className="st-label" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: feed.length ? "var(--green)" : "var(--line)" }} /> What we've learned
            </div>
            {feed.length === 0 ? (
              <p style={{ fontSize: 12.5, color: "var(--faint)", margin: 0, lineHeight: 1.5 }}>
                Everything we read or infer shows up here, so nothing about your profile is a mystery.
              </p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
                {feed.map((f, i) => (
                  <li key={`${f.t}-${i}-${f.text}`} className="st-pop" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 6, fontSize: 12.5, lineHeight: 1.4 }}>
                    <span className="st-mono" style={{ color: "var(--faint)", fontSize: 11 }}>{`0:${String(f.t).padStart(2, "0")}`.replace(/^0:(\d{3,})$/, "$1s")}</span>
                    <span style={{ color: f.tone === "good" ? "var(--ink)" : f.tone === "warn" ? "var(--amber)" : "var(--muted)" }}>{f.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p style={{ marginTop: "auto", fontSize: 11.5, color: "var(--faint)", lineHeight: 1.5 }}>
            Your file is read once and isn't stored until you confirm. No password is created.
          </p>
        </aside>

        {/* Centre: the current step */}
        <main className="st-center">
          <div className="st-center-inner">
            {/* 1. Drop */}
            {(step === "drop" || step === "reading") && (
              <>
                <div>
                  <span className="st-pill" style={{ background: "var(--indigo-soft)", color: "var(--indigo-ink)" }}>No forms · no password</span>
                  <h1 className="st-h1" style={{ marginTop: 14 }}>Drop your resume.<br /><span style={{ color: "var(--indigo)" }}>That's your signup.</span></h1>
                  <p className="st-sub" style={{ marginTop: 12 }}>We read it, set up your account, and learn what you want from a few swipes. Then Sensei starts finding the people hiring for it.</p>
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
                  className="st-panel"
                  style={{
                    position: "relative", overflow: "hidden", display: "block", cursor: step === "reading" ? "default" : "pointer",
                    border: `1.5px dashed ${dragOver ? "var(--indigo)" : "#CFCFDD"}`, background: dragOver ? "var(--indigo-soft)" : "var(--panel)",
                    padding: step === "reading" ? 20 : "36px 24px", pointerEvents: step === "reading" ? "none" : undefined,
                  }}
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
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span className="st-spin" />
                        <span style={{ fontWeight: 600 }}>Reading {fileName}</span>
                        <span className="st-mono" style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>{Math.min(revealed, 7)}/7</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginTop: 14 }}>
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
                          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: i < revealed ? "var(--line-2)" : "transparent", border: "1px solid var(--line-2)", opacity: i < revealed ? 1 : 0.45, transition: "all .25s" }}>
                            <span style={{ width: 16 }}>{i < revealed ? (v ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="#12A672" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : "–") : ""}</span>
                            <span className="st-label" style={{ fontSize: 10, width: 70 }}>{k}</span>
                            <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i < revealed ? v || "not found" : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10 }}>
                      <span style={{ width: 52, height: 52, borderRadius: 14, background: "var(--indigo-soft)", display: "grid", placeItems: "center" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15V4m0 0l-4 4m4-4l4 4M5 15v3a2 2 0 002 2h10a2 2 0 002-2v-3" stroke="#5B63E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      <span style={{ fontSize: 17, fontWeight: 600 }}>Drop your resume here</span>
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>or <span style={{ color: "var(--indigo-ink)", fontWeight: 600 }}>choose a file</span> · PDF up to 5 MB</span>
                    </div>
                  )}
                </label>
                {error && <p style={{ color: "#C0392B", fontWeight: 600, fontSize: 14, margin: 0 }}>{error}</p>}
                {step === "drop" && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
                      {[
                        ["01", "Read in a second", "Name, college, skills and links come straight off your resume."],
                        ["02", "A code, not a password", "We email a 6-digit code to the address on it."],
                        ["03", "Swipe, not a quiz", "Keep or pass real roles. We learn what you want."],
                      ].map(([n, t, b]) => (
                        <div key={n} className="st-panel" style={{ padding: 14 }}>
                          <div className="st-mono" style={{ fontSize: 11, color: "var(--indigo)" }}>{n}</div>
                          <div style={{ fontWeight: 600, fontSize: 14, marginTop: 6 }}>{t}</div>
                          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4, lineHeight: 1.45 }}>{b}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                      {!signedIn && (
                        <button
                          type="button"
                          className="st-btn ghost"
                          onClick={() => {
                            try { localStorage.setItem(CONSENT_PENDING_KEY, "1"); } catch {}
                            authClient.signIn.social({ provider: "google", callbackURL: "/start", errorCallbackURL: "/auth?redirect=%2Fstart" });
                          }}
                        >
                          No resume handy? Continue with Google
                        </button>
                      )}
                      <span style={{ fontSize: 12, color: "var(--faint)", maxWidth: "52ch", lineHeight: 1.5 }}>
                        By continuing, you confirm you are 18 or older and agree to our{" "}
                        <a href="/terms" target="_blank" rel="noopener" style={{ color: "inherit" }}>Terms</a> and{" "}
                        <a href="/privacy" target="_blank" rel="noopener" style={{ color: "inherit" }}>Privacy Policy</a>.
                      </span>
                    </div>
                  </>
                )}
              </>
            )}

            {/* 2. Verify */}
            {step === "verify" && (
              <div data-tour="verify" style={{ display: "grid", gap: 22 }}>
                <div>
                  <span className="st-pill" style={{ background: "var(--green-soft)", color: "var(--green)" }}>Resume read · {d.name || "you"}</span>
                  <h1 className="st-h1" style={{ marginTop: 14 }}>Check your inbox.</h1>
                  {sentTo && !changingEmail ? (
                    <p className="st-sub" style={{ marginTop: 10 }}>
                      Your resume says <strong style={{ color: "var(--ink)" }}>{sentTo}</strong>. We sent a 6-digit code there.{" "}
                      <button type="button" className="st-link" onClick={() => setChangingEmail(true)}>Wrong address?</button>
                    </p>
                  ) : (
                    <p className="st-sub" style={{ marginTop: 10 }}>{d.email ? "Where should we send your code?" : "We couldn't find an email on your resume. Where should we send your code?"}</p>
                  )}
                </div>
                {sentTo && !changingEmail ? (
                  <div className="st-panel" style={{ padding: 22 }}>
                    <label htmlFor="start-code" className="st-label">6-digit code</label>
                    <div style={{ position: "relative", display: "inline-block", marginTop: 10 }}>
                      <input
                        id="start-code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        autoFocus
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        style={{ position: "absolute", inset: 0, opacity: 0 }}
                      />
                      <div style={{ display: "flex", gap: 8 }} aria-hidden="true">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="st-mono" style={{ width: 48, height: 58, borderRadius: 12, display: "grid", placeItems: "center", fontSize: 24, fontWeight: 600, background: code[i] ? "var(--panel)" : "var(--bg)", border: `1.5px solid ${i === code.length ? "var(--indigo)" : "var(--line)"}`, boxShadow: i === code.length ? "0 0 0 4px var(--indigo-soft)" : "none" }}>
                            {code[i] ?? ""}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--muted)", margin: "14px 0 0" }}>
                      {verifying ? "Checking…" : "You're signed in as soon as you type the last digit."}{" "}
                      {!verifying && <button type="button" className="st-link" onClick={() => void sendCode(sentTo)}>Send a new code</button>}
                    </p>
                  </div>
                ) : (
                  <form
                    className="st-panel"
                    style={{ padding: 18, display: "flex", gap: 10, flexWrap: "wrap" }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (/\S+@\S+\.\S+/.test(d.email)) void sendCode(d.email.trim().toLowerCase());
                    }}
                  >
                    <label htmlFor="start-email" className="sr-only">Email</label>
                    <input id="start-email" type="email" value={d.email} onChange={(e) => setD((x) => ({ ...x, email: e.target.value }))} placeholder="you@college.edu"
                      style={{ flex: 1, minWidth: 200, height: 44, borderRadius: 12, border: "1px solid var(--line)", padding: "0 14px", font: "500 15px var(--sans)" }} />
                    <button type="submit" className="st-btn indigo">Send code</button>
                  </form>
                )}
                {error && <p style={{ color: "#C0392B", fontWeight: 600, fontSize: 14, margin: 0 }}>{error}</p>}
              </div>
            )}

            {/* 3. Confirm */}
            {step === "confirm" && (
              <div data-tour="confirm" style={{ display: "grid", gap: 18 }}>
                <div>
                  <h1 className="st-h1">Did we get it right?</h1>
                  <p className="st-sub" style={{ marginTop: 10 }}>
                    Tap anything that's wrong.{" "}
                    {d.unsure.size ? <>The <span style={{ color: "var(--amber)", fontWeight: 600 }}>amber</span> ones we weren't sure about.</> : "Everything came straight off your resume."}
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
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
                      ? { t: "Check this", bg: "var(--amber-soft)", fg: "var(--amber)" }
                      : !value
                        ? { t: "Add", bg: "var(--line-2)", fg: "var(--muted)" }
                        : mine
                          ? { t: "Edited", bg: "var(--indigo-soft)", fg: "var(--indigo-ink)" }
                          : { t: "From resume", bg: "var(--green-soft)", fg: "var(--green)" };
                    return editing === key ? (
                      <div key={key} className="st-panel" style={{ padding: 12, borderColor: "var(--indigo)", boxShadow: "0 0 0 4px var(--indigo-soft)" }}>
                        <label htmlFor={`start-${key}`} className="st-label" style={{ color: "var(--indigo-ink)" }}>{label}</label>
                        <input id={`start-${key}`} autoFocus defaultValue={value} placeholder={ph}
                          onBlur={(e) => { setField(key, e.target.value.trim()); setEditing(null); }}
                          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                          style={{ display: "block", width: "100%", marginTop: 6, border: 0, outline: "none", font: "600 16px var(--sans)", color: "var(--ink)", background: "transparent" }} />
                      </div>
                    ) : (
                      <button key={key} type="button" data-tour={`field-${key}`} onClick={() => setEditing(key as string)} className="st-panel"
                        style={{ padding: 12, textAlign: "left", cursor: "pointer", font: "inherit", color: "inherit", borderStyle: unsure ? "dashed" : "solid", borderColor: unsure ? "#E8B54D" : "var(--line)", background: unsure ? "#FFFCF5" : "var(--panel)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <span className="st-label">{label}</span>
                          <span className="st-pill" style={{ background: pill.bg, color: pill.fg }}>{pill.t}</span>
                        </div>
                        <div style={{ marginTop: 6, fontSize: 16, fontWeight: 600, color: value ? "var(--ink)" : "var(--faint)" }}>{value || ph}</div>
                      </button>
                    );
                  })}
                  <div className="st-panel" style={{ padding: 12 }}>
                    <div className="st-label">Experience</div>
                    {d.experience.length ? (
                      <ul style={{ listStyle: "none", margin: "6px 0 0", padding: 0, display: "grid", gap: 4 }}>
                        {d.experience.slice(0, 3).map((e, i) => (
                          <li key={i} style={{ fontSize: 13.5 }}><strong style={{ fontWeight: 600 }}>{e.title}</strong>{e.company && <span style={{ color: "var(--muted)" }}> · {e.company}</span>}</li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{ marginTop: 6, fontSize: 14, color: "var(--faint)" }}>None yet. That's fine.</div>
                    )}
                  </div>
                </div>
                <div className="st-panel" style={{ padding: 14 }} data-tour="skills">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="st-label">Skills · {d.skills.length}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Tap × to remove</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {d.skills.map((s) => (
                      <span key={s} className="st-chip" style={{ paddingRight: 4, background: "var(--indigo-soft)", color: "var(--indigo-ink)", fontWeight: 600 }}>
                        {s}
                        <button type="button" aria-label={`Remove ${s}`} onClick={() => setD((x) => ({ ...x, skills: x.skills.filter((k) => k !== s), edited: new Set(x.edited).add("skills") }))}
                          style={{ width: 18, height: 18, borderRadius: 999, border: 0, background: "transparent", color: "inherit", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
                      </span>
                    ))}
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const s = newSkill.trim();
                      if (s && !d.skills.some((k) => k.toLowerCase() === s.toLowerCase())) setD((x) => ({ ...x, skills: [...x.skills, s], edited: new Set(x.edited).add("skills") }));
                      setNewSkill("");
                    }}>
                      <label htmlFor="start-skill" className="sr-only">Add a skill</label>
                      <input id="start-skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="+ Add skill"
                        style={{ height: 26, width: 110, borderRadius: 999, border: "1px dashed #CFCFDD", padding: "0 10px", font: "500 12px var(--sans)", background: "transparent" }} />
                    </form>
                  </div>
                  {(d.links.github || d.links.linkedin || d.links.portfolio) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--line-2)" }}>
                      <span className="st-label" style={{ alignSelf: "center", marginRight: 4 }}>Links</span>
                      {d.links.github && <span className="st-chip">GitHub @{d.links.github}</span>}
                      {d.links.linkedin && <span className="st-chip">LinkedIn</span>}
                      {d.links.portfolio && <span className="st-chip">{d.links.portfolio.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>}
                    </div>
                  )}
                </div>
                {error && <p style={{ color: "#C0392B", fontWeight: 600, fontSize: 14, margin: 0 }}>{error}</p>}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <button type="button" className="st-btn indigo" onClick={confirm} disabled={saving || !d.name.trim()} data-tour="looks-right">
                    {saving ? "Saving…" : "Looks right →"}
                  </button>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{!d.name.trim() ? "Add your name to continue." : "Next: a few swipes so we know what you want."}</span>
                </div>
              </div>
            )}

            {/* 4. Swipe */}
            {step === "swipe" && (
              <div style={{ display: "grid", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <span className="st-pill" style={{ background: "var(--indigo-soft)", color: "var(--indigo-ink)" }}>Getting to know you</span>
                    <h1 className="st-h1" style={{ marginTop: 12 }}>Would you take this?</h1>
                    <p className="st-sub" style={{ marginTop: 8 }}>Real roles, open right now. Keep or pass; we learn what you want from what you keep.</p>
                  </div>
                  <div className="st-mono" style={{ fontSize: 13, color: "var(--muted)" }}>{Math.min(index + 1, cards.length)} / {cards.length}</div>
                </div>

                <div style={{ display: "flex", gap: 4 }} aria-hidden="true">
                  {cards.map((c, i) => (
                    <span key={c.id} style={{ flex: 1, height: 4, borderRadius: 4, background: i < index ? (liked.includes(c) ? "var(--indigo)" : "#D5D5E0") : i === index ? "var(--ink)" : "var(--line)" }} />
                  ))}
                </div>

                <div style={{ position: "relative", height: 300, userSelect: "none" }} data-tour="deck">
                  {cards.slice(index, index + 3).reverse().map((c, i, arr) => {
                    const top = i === arr.length - 1;
                    const depth = arr.length - 1 - i;
                    const hue = CLUSTER_HUE[c.cluster];
                    return (
                      <div
                        key={c.id}
                        data-cluster={c.cluster}
                        onPointerDown={top ? (e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setDrag({ x: 0, start: e.clientX }); } : undefined}
                        onPointerMove={top ? (e) => drag && setDrag({ ...drag, x: e.clientX - drag.start }) : undefined}
                        onPointerUp={top ? () => { if (drag && Math.abs(drag.x) > 90) decide(drag.x > 0 ? "right" : "left"); else setDrag(null); } : undefined}
                        className="st-panel"
                        style={{
                          position: "absolute", inset: 0, padding: 24, touchAction: "none", cursor: top ? "grab" : "default",
                          boxShadow: top ? "0 1px 2px rgba(22,22,30,.06), 0 18px 40px rgba(22,22,30,.10)" : undefined,
                          transform: top ? `translateX(${dx}px) rotate(${dx / 24}deg)` : `translateY(${depth * 12}px) scale(${1 - depth * 0.04})`,
                          transition: drag && !fling ? "none" : "transform .22s ease",
                          display: "flex", flexDirection: "column",
                        }}
                      >
                        {top && dx !== 0 && (
                          <span className="st-pill" style={{ position: "absolute", top: 18, [dx > 0 ? "right" : "left"]: 18, height: 28, fontSize: 12, opacity: Math.min(1, Math.abs(dx) / 90),
                            background: dx > 0 ? "var(--indigo)" : "var(--ink)", color: "#fff" } as React.CSSProperties}>
                            {dx > 0 ? "Interested" : "Not for me"}
                          </span>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 15, background: hue.bg, color: hue.fg }}>
                            {c.company.replace(/[^A-Za-z0-9 ]/g, "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{c.company}</div>
                            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>is hiring</div>
                          </div>
                          <span className="st-pill" style={{ marginLeft: "auto", background: hue.bg, color: hue.fg }}>{c.cluster}</span>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 650, letterSpacing: "-.02em", lineHeight: 1.15, marginTop: 20, textWrap: "balance" } as React.CSSProperties}>{c.title}</div>
                        <div style={{ marginTop: 10, fontSize: 13, color: CLUSTER_SKILLS[c.cluster]?.some((k) => d.skills.some((s) => s.toLowerCase() === k)) ? "var(--green)" : "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
                          {why(c)}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                          {tags(c).map((t) => (
                            <span key={t.text} className="st-pill" style={{ height: 24, background: t.bg, color: t.fg }}>{t.text}</span>
                          ))}
                        </div>
                        <dl style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--line-2)", marginBottom: 0 }}>
                          {[["Stipend", c.stipend], ["Where", c.city ?? c.location], ["Length", c.duration]].map(([k, v]) => (
                            <div key={k} style={{ minWidth: 0 }}>
                              <dt className="st-label" style={{ fontSize: 10 }}>{k}</dt>
                              <dd className="st-mono" style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    );
                  })}
                  {cards.length === 0 && (
                    <div className="st-panel" style={{ height: "100%", display: "grid", placeItems: "center", color: "var(--muted)", fontSize: 14 }}>No open roles to show yet. You can pick cities next.</div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <button type="button" className="st-btn ghost" onClick={() => decide("left")} data-tour="pass" style={{ minWidth: 150 }}>
                    <span className="st-kbd">←</span> Not for me
                  </button>
                  <button type="button" className="st-btn indigo" onClick={() => decide("right")} data-tour="like" style={{ minWidth: 150 }}>
                    Interested <span className="st-kbd" style={{ background: "rgba(255,255,255,.15)", color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>→</span>
                  </button>
                </div>
                <p style={{ textAlign: "center", fontSize: 12.5, color: "var(--faint)", margin: 0 }}>
                  Drag the card, use the buttons or your arrow keys.{" "}
                  {(index >= 6 || cards.length === 0) && <button type="button" className="st-link" onClick={toCities}>That's enough, next →</button>}
                </p>
              </div>
            )}

            {/* 5. Cities */}
            {(step === "cities" || step === "saving") && (
              <div data-tour="cities" style={{ display: "grid", gap: 18 }}>
                <div>
                  <h1 className="st-h1">Where would you work?</h1>
                  <p className="st-sub" style={{ marginTop: 10 }}>{cities.length ? "Picked from your swipes. Tap to add or remove; the globe follows." : "Tap the cities you'd work in."}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
                  {cityCounts.map(([c, n]) => {
                    const on = cities.includes(c);
                    return (
                      <button key={c} type="button" className="st-panel" onClick={() => { setFocusCity(c); setCities((x) => (on ? x.filter((k) => k !== c) : [...x, c])); }}
                        style={{ padding: 14, textAlign: "left", cursor: "pointer", font: "inherit", color: "inherit", borderColor: on ? "var(--indigo)" : "var(--line)", boxShadow: on ? "0 0 0 3px var(--indigo-soft)" : undefined }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{c}</span>
                          <span style={{ width: 20, height: 20, borderRadius: 6, display: "grid", placeItems: "center", background: on ? "var(--indigo)" : "transparent", border: on ? 0 : "1.5px solid var(--line)" }}>
                            {on && <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                          <span style={{ flex: 1, height: 4, borderRadius: 4, background: "var(--line-2)", overflow: "hidden" }}>
                            <span style={{ display: "block", height: "100%", width: `${(n / maxCount) * 100}%`, background: on ? "var(--indigo)" : "#C9C9D8" }} />
                          </span>
                          <span className="st-mono" style={{ fontSize: 12, color: "var(--muted)" }}>{n} open</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <button type="button" className="st-btn indigo" onClick={finish} disabled={step === "saving"} data-tour="finish">
                    {step === "saving" ? "Setting up…" : "Finish and see my profile →"}
                  </button>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>Next, Sensei finds the people hiring for this.</span>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right: live panel */}
        <aside className="st-side">
          <div
            data-tour="globe"
            style={{ borderRadius: 18, overflow: "hidden", position: "relative", padding: "16px 16px 12px",
              background: "radial-gradient(120% 90% at 50% 0%, #2A2E78 0%, #15173A 45%, #0D0E24 100%)", color: "#fff", boxShadow: "0 12px 32px rgba(16,17,42,.25)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
              <span className="st-label" style={{ color: "rgba(255,255,255,.55)" }}>Your map</span>
              <span className="st-pill" style={{ background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.85)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: pins.length ? "#3BE29A" : "rgba(255,255,255,.4)" }} />
                {pins.length ? "Live" : "Waiting"}
              </span>
            </div>
            <div style={{ position: "relative", margin: "4px auto 0", maxWidth: 340 }}>
              <div aria-hidden="true" style={{ position: "absolute", inset: "6%", borderRadius: "50%", boxShadow: "0 0 80px 10px rgba(91,99,232,.35)" }} />
              <TalentGlobe pins={pins} arcsFrom="home" focus={globeFocus} tone="dark" />
            </div>
            <div style={{ textAlign: "center", fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,.9)", marginTop: 2 }}>{globeCaption}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 8, fontSize: 11, color: "rgba(255,255,255,.55)" }}>
              <span><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#9EA8FF", marginRight: 5 }} />You</span>
              <span><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#FFB840", marginRight: 5 }} />Your picks</span>
              <span><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#7F8BD9", marginRight: 5 }} />Roles open</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <Stat label="Skills" value={shown.skills.length || "–"} />
            <Stat label="Roles fit" value={pool.length ? matchCount : "–"} tone="var(--indigo)" tour="counter" />
            <Stat label="Cities" value={(step === "cities" || step === "saving" ? cities.length : prefs?.cities.length) || "–"} tone="var(--green)" />
          </div>

          <TalentCard d={shown} prefs={prefs} />
        </aside>
      </div>
    </div>
  );
}
