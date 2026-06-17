import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";
import { capturePostHog } from "~/lib/posthog";

const POLL_INTERVAL_MS = 5000;
// The counter + bar ramp over this window, then HOLD until results are actually
// ready (allDone) — so the user never sees a "finished" screen with nothing happening.
const RAMP_MS = 95000;
const BAR_CAP = 96; // bar holds here until allDone, then jumps to 100

// Named, recognizable sources — concrete names make "scouring the web" credible.
const SOURCES = [
  "Company career pages", "LinkedIn", "Naukri", "Wellfound", "Crunchbase",
  "Y Combinator", "Product Hunt", "AngelList", "Indeed", "Glassdoor",
  "Internshala", "Instahyre", "Cutshort", "Foundit", "Hirect",
  "Hacker News (Who's hiring)", "TechCrunch", "Funding & news feeds", "Twitter / X",
];

// Rotating headline — ~50% conversion lines (c: true), interleaved with status.
const HEADLINES: { t: string; c?: boolean }[] = [
  { t: "Scouring the internet for your people…" },
  { t: "The average student lands 3 interview calls in week one.", c: true },
  { t: "Mapping your niche across the market…" },
  { t: "One warm intro beats 100 cold applications.", c: true },
  { t: "Identifying decision-makers everywhere…" },
  { t: "95% of students say this beat cold-applying.", c: true },
  { t: "Filtering for the highest-signal matches…" },
  { t: "Your personalised pitches are being written right now.", c: true },
  { t: "Cross-referencing who's hiring this week…" },
  { t: "Students who finish setup get 3× more replies.", c: true },
];

// Matches keyed by market — NO company names, location-aware.
type Person = { i: string; n: string; t: string; c: string; m: number };
const PEOPLE_BY_MARKET: Record<string, Person[]> = {
  India: [
    { i: "AR", n: "Arjun R.", t: "Engineering Manager", c: "Bangalore", m: 96 },
    { i: "PT", n: "Priya T.", t: "Founding Engineer", c: "Bangalore", m: 94 },
    { i: "KV", n: "Karthik V.", t: "Product Director", c: "Bangalore", m: 95 },
    { i: "RS", n: "Rohan S.", t: "VP Engineering", c: "Hyderabad", m: 92 },
    { i: "SM", n: "Sneha M.", t: "Growth Lead", c: "Mumbai", m: 91 },
    { i: "AD", n: "Ananya D.", t: "Marketing Head", c: "Delhi", m: 90 },
    { i: "VN", n: "Vikram N.", t: "Head of Design", c: "Bangalore", m: 93 },
    { i: "AS", n: "Aditya S.", t: "Co-founder", c: "Bangalore", m: 95 },
    { i: "NK", n: "Neha K.", t: "Product Manager", c: "Gurgaon", m: 88 },
    { i: "SC", n: "Sanjay C.", t: "CTO", c: "Chennai", m: 91 },
    { i: "RP", n: "Riya P.", t: "Brand Lead", c: "Mumbai", m: 90 },
    { i: "IR", n: "Isha R.", t: "Talent Partner", c: "Pune", m: 89 },
  ],
  US: [
    { i: "DL", n: "David L.", t: "Head of Product", c: "San Francisco", m: 95 },
    { i: "MC", n: "Maya C.", t: "VP Engineering", c: "New York", m: 93 },
    { i: "JB", n: "Jordan B.", t: "Growth Director", c: "San Francisco", m: 91 },
    { i: "EK", n: "Emily K.", t: "Talent Lead", c: "New York", m: 90 },
    { i: "CP", n: "Chris P.", t: "Founding Engineer", c: "Austin", m: 92 },
    { i: "SW", n: "Sarah W.", t: "Marketing Director", c: "Seattle", m: 89 },
    { i: "MR", n: "Mike R.", t: "Head of Design", c: "San Francisco", m: 90 },
    { i: "LT", n: "Laura T.", t: "Product Manager", c: "Boston", m: 88 },
  ],
  UK: [
    { i: "LN", n: "Lena N.", t: "Principal Engineer", c: "London", m: 95 },
    { i: "OH", n: "Oliver H.", t: "Product Lead", c: "London", m: 92 },
    { i: "SM", n: "Sophie M.", t: "Marketing Director", c: "Manchester", m: 90 },
    { i: "JC", n: "James C.", t: "Head of Growth", c: "London", m: 91 },
    { i: "AR", n: "Amelia R.", t: "Talent Partner", c: "London", m: 89 },
    { i: "HB", n: "Harry B.", t: "Founding Engineer", c: "Bristol", m: 90 },
  ],
  UAE: [
    { i: "OH", n: "Omar H.", t: "Marketing Director", c: "Dubai", m: 94 },
    { i: "LA", n: "Layla A.", t: "Head of Growth", c: "Dubai", m: 92 },
    { i: "RK", n: "Rashid K.", t: "Product Manager", c: "Dubai", m: 90 },
    { i: "FZ", n: "Fatima Z.", t: "Brand Lead", c: "Abu Dhabi", m: 89 },
    { i: "YM", n: "Yusuf M.", t: "Engineering Manager", c: "Dubai", m: 91 },
    { i: "NS", n: "Noor S.", t: "Talent Lead", c: "Dubai", m: 88 },
  ],
  Singapore: [
    { i: "WZ", n: "Wei Z.", t: "Head of Growth", c: "Singapore", m: 94 },
    { i: "ML", n: "Mei L.", t: "Engineering Manager", c: "Singapore", m: 92 },
    { i: "DT", n: "Daniel T.", t: "Product Director", c: "Singapore", m: 91 },
    { i: "AR", n: "Aisha R.", t: "Marketing Lead", c: "Singapore", m: 90 },
    { i: "JH", n: "Jun H.", t: "Founding Engineer", c: "Singapore", m: 89 },
    { i: "PN", n: "Priya N.", t: "Talent Partner", c: "Singapore", m: 88 },
  ],
  Global: [
    { i: "DL", n: "David L.", t: "Head of Product", c: "San Francisco", m: 95 },
    { i: "AR", n: "Arjun R.", t: "Engineering Manager", c: "Bangalore", m: 96 },
    { i: "LN", n: "Lena N.", t: "Principal Engineer", c: "London", m: 94 },
    { i: "OH", n: "Omar H.", t: "Marketing Director", c: "Dubai", m: 92 },
    { i: "WZ", n: "Wei Z.", t: "Head of Growth", c: "Singapore", m: 93 },
    { i: "MC", n: "Maya C.", t: "VP Engineering", c: "New York", m: 91 },
    { i: "PT", n: "Priya T.", t: "Founding Engineer", c: "Bangalore", m: 90 },
    { i: "SW", n: "Sarah W.", t: "Marketing Director", c: "Seattle", m: 89 },
  ],
};

const MARKET_CITIES: Record<string, string[]> = {
  India: ["india", "bangalore", "bengaluru", "mumbai", "delhi", "hyderabad", "pune", "chennai", "gurgaon", "noida", "kolkata"],
  US: ["united states", "usa", "san francisco", "new york", "austin", "seattle", "boston", "los angeles"],
  UK: ["united kingdom", " uk", "london", "manchester", "bristol", "england"],
  UAE: ["uae", "united arab", "dubai", "abu dhabi"],
  Singapore: ["singapore"],
};
function detectMarket(locations: string[]): string {
  const hay = (" " + locations.join(" ") + " ").toLowerCase();
  for (const [m, keys] of Object.entries(MARKET_CITIES)) if (keys.some((k) => hay.includes(k))) return m;
  return "Global";
}

// Wall of Love — mixed authentic "screenshots": X, iMessage, WhatsApp, LinkedIn.
type Card =
  | { type: "tweet"; n: string; h: string; d: string; v: boolean; q: string; re: number; rt: number; lk: number }
  | { type: "imsg"; in: string; out: string; t: string }
  | { type: "whatsapp"; q: string; t: string }
  | { type: "linkedin"; n: string; role: string; deg: string; q: string };
const WALL: Card[] = [
  { type: "tweet", n: "Sahil Gulihar", h: "@Sahil_Gulihar", d: "May 30", v: false, q: "went in as a casual tester to find bugs. came out with an interview lol 💀 no messy emails, no hunting. just chat, then interview", re: 4, rt: 4, lk: 34 },
  { type: "imsg", in: "yo update, my profile got shortlisted for a role 😭", out: "and I wasn't even trying that hard", t: "2:11 PM" },
  { type: "linkedin", n: "Rimjhim Hazarika", role: "L&D Consultant · Career Coach", deg: "2nd", q: "Trying it out and saying this with a lot of respect. The convo feels anything but transactional. Genuinely impressed." },
  { type: "tweet", n: "Siddharth K S", h: "@sidks", d: "4d", v: true, q: "been testing this for the past hour, honestly seamless. gives such a great handle on things right away :D", re: 1, rt: 2, lk: 21 },
  { type: "whatsapp", q: "have been using studojo, it's pretty good at finding the right people. really liked it", t: "9:09 PM" },
  { type: "tweet", n: "Anunaya Tandon", h: "@AnunayaTandon", d: "May 28", v: false, q: "first experience of @studojo, the ai is so good!", re: 0, rt: 1, lk: 12 },
  { type: "imsg", in: "wait this actually works??", out: "told you 😎", t: "3:38 AM" },
  { type: "whatsapp", q: "studojo slaps hard <3", t: "9:12 PM" },
  { type: "linkedin", n: "Marcus T.", role: "CS @ NYU", deg: "2nd", q: "3 founder replies in week one. Genuinely did not expect this from a tool. Telling everyone in my batch." },
  { type: "tweet", n: "Meera P.", h: "@meera_builds", d: "Jun 2", v: false, q: "stopped spamming applications. finally getting actual responses 🙌", re: 2, rt: 3, lk: 27 },
];

const COLORS = ["bg-studojo-purple", "bg-studojo-pink", "bg-studojo-green", "bg-studojo-orange", "bg-studojo-teal", "bg-indigo-500", "bg-rose-500", "bg-amber-500"];
const fmt = (n: number) => Math.max(0, Math.round(n)).toLocaleString("en-US");
const initOf = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const colOf = (n: string) => COLORS[n.charCodeAt(0) % COLORS.length];

// ── Odometer: each digit rolls to its value ──
function Odometer({ value }: { value: number }) {
  const s = fmt(value);
  return (
    <span className="sd-odo">
      {[...s].map((ch, i) =>
        /\d/.test(ch) ? (
          <span className="sd-reel" key={i}>
            <span className="sd-col" style={{ transform: `translateY(-${(+ch) * 10}%)` }}>
              {"0123456789".split("").map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span className="sd-sep" key={i}>{ch}</span>
        )
      )}
      {value > 0 && <span className="sd-sep">+</span>}
    </span>
  );
}

// ── Wall of Love icons ──
const Verified = () => (
  <span className="inline-flex w-3.5 h-3.5 rounded-full bg-[#1d9bf0] items-center justify-center flex-shrink-0">
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
  </span>
);
const XLogo = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-studojo-ink/60 flex-shrink-0"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);
const Ticks = () => (
  <svg viewBox="0 0 18 12" className="w-3.5 h-3 inline-block">
    <path d="M1 6.5 4 9.5 9.5 2.5" fill="none" stroke="#53bdeb" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 6.5 9 9.5 14.5 2.5" fill="none" stroke="#53bdeb" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const tweetAction = (path: string, n: number) => (
  <span className="flex items-center gap-1 text-studojo-muted text-[11px]">
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d={path} /></svg>
    {n > 0 && <span className="tabular-nums">{n}</span>}
  </span>
);
const P_REPLY = "M1.75 11C1.75 5.9 5.9 1.75 11 1.75h2c5.1 0 9.25 4.15 9.25 9.25S18.1 20.25 13 20.25h-1.4l-4.6 3.1V20.1C4 18.6 1.75 15.1 1.75 11z";
const P_RT = "M4.5 3.9 1 7.4l3.5 3.5V8.4h11v3l4-4-4-4v3h-9V3.9zm15 13.2L16 13.6v2.5h-11v-3l-4 4 4 4v-3h13z";
const P_LIKE = "M12 21s-7.5-4.9-10-9.3C.4 8.6 1.8 5 5.2 5c2 0 3.4 1.2 4.3 2.6h1C11.4 6.2 12.8 5 14.8 5c3.4 0 4.8 3.6 3.2 6.7C19.5 16.1 12 21 12 21z";

const WCARD = "w-[300px] h-[168px] flex-shrink-0 rounded-2xl shadow-sm flex flex-col";
function ReviewCard({ v }: { v: Card }) {
  if (v.type === "tweet") {
    return (
      <div className={`${WCARD} border border-studojo-ink/10 bg-white p-4`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-full ${colOf(v.n)} text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 sd-pii`}>{initOf(v.n)}</div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-bold text-studojo-ink truncate sd-pii">{v.n}</span>{v.v && <Verified />}
            </div>
            <div className="text-[12px] text-studojo-muted truncate"><span className="sd-pii">{v.h}</span> · {v.d}</div>
          </div>
          <XLogo />
        </div>
        <p className="text-[13px] text-studojo-ink leading-snug mt-2.5 flex-1 overflow-hidden">{v.q}</p>
        <div className="flex items-center gap-7 pt-2">{tweetAction(P_REPLY, v.re)}{tweetAction(P_RT, v.rt)}{tweetAction(P_LIKE, v.lk)}</div>
      </div>
    );
  }
  if (v.type === "imsg") {
    return (
      <div className={`${WCARD} bg-[#1c1c1e] p-3.5 justify-center`}>
        <div className="flex flex-col gap-2">
          <div className="self-start max-w-[88%] bg-[#3a3a3c] text-white text-[13px] leading-snug rounded-2xl rounded-bl-md px-3 py-2">{v.in}</div>
          <div className="self-end max-w-[88%] bg-[#0a84ff] text-white text-[13px] leading-snug rounded-2xl rounded-br-md px-3 py-2">{v.out}</div>
        </div>
        <p className="text-[10px] text-white/40 text-center mt-2.5">{v.t}</p>
      </div>
    );
  }
  if (v.type === "whatsapp") {
    return (
      <div className={`${WCARD} bg-[#0b141a] p-3.5 justify-center`}>
        <div className="self-end max-w-[94%] bg-[#005c4b] text-white text-[13.5px] leading-snug rounded-2xl rounded-br-md px-3 py-2">
          {v.q}
          <span className="flex items-center justify-end gap-1 mt-1 text-[10px] text-white/55">{v.t} <Ticks /></span>
        </div>
      </div>
    );
  }
  return (
    <div className={`${WCARD} border border-studojo-ink/10 bg-white p-4`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-full ${colOf(v.n)} text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 sd-pii`}>{initOf(v.n)}</div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-studojo-ink truncate sd-pii">{v.n}</span>
            <span className="text-[10px] text-studojo-muted whitespace-nowrap">· {v.deg}</span>
            <span className="inline-flex w-3.5 h-3.5 rounded-[3px] bg-[#0a66c2] text-white items-center justify-center text-[8px] font-bold flex-shrink-0">in</span>
          </div>
          <div className="text-[12px] font-medium text-studojo-ink/75 truncate">{v.role}</div>
        </div>
      </div>
      <p className="text-[13px] text-studojo-ink leading-snug mt-2.5 flex-1 overflow-hidden">{v.q}</p>
      <div className="flex items-center gap-3 pt-2 text-[11px] font-semibold text-studojo-muted"><span>Like</span><span>· Reply</span></div>
    </div>
  );
}

export default function DiscoveryPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { candidateId, profileData } = useOutreachStore();

  const [error, setError] = useState("");
  const [allDone, setAllDone] = useState(false);
  const [countVal, setCountVal] = useState(0);
  const [barPct, setBarPct] = useState(0);
  const [headIdx, setHeadIdx] = useState(0);
  const [scanChecked, setScanChecked] = useState(0);
  const [scanRows, setScanRows] = useState<{ src: string; n: number; key: number }[]>([]);
  const [matchOff, setMatchOff] = useState(0);

  const allDoneRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const scanCounter = useRef(0);

  // Per-user scan total: deterministic from candidateId, 2.1M–3.4M. Stable on
  // refresh, different across users.
  const TARGET = useMemo(() => {
    const seed = String(candidateId ?? "studojo").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const r = ((seed * 9301 + 49297) % 233280) / 233280;
    return Math.round((2_100_000 + r * (3_400_000 - 2_100_000)) / 1000) * 1000;
  }, [candidateId]);

  // Location-aware matches from the candidate's quiz preferences.
  const locations: string[] = profileData?.parsed_json?.preferences?.locations || [];
  const market = useMemo(() => detectMarket(locations), [locations.join(",")]);
  const pool = PEOPLE_BY_MARKET[market] || PEOPLE_BY_MARKET.Global;
  const marketLabel = locations[0] || (market === "Global" ? "across markets" : market);
  const visibleMatches = Array.from({ length: 6 }, (_, k) => pool[(matchOff + k) % pool.length]);

  useEffect(() => { allDoneRef.current = allDone; }, [allDone]);

  // ── Discovery + scoring orchestration (unchanged behaviour) ──
  useEffect(() => {
    if (authLoading || !candidateId) return;
    let cancelled = false;

    const startedAt = Date.now();
    capturePostHog("discovery_started", { candidate_id: candidateId });

    const finish = (leadsFound?: number) => {
      if (cancelled) return;
      capturePostHog("discovery_completed", { candidate_id: candidateId, leads_found: leadsFound ?? null, seconds: Math.round((Date.now() - startedAt) / 1000) });
      setAllDone(true);
      setTimeout(() => navigate("/outreach/leads/results"), 900);
    };

    outreachFetch("/discovery/search", {
      method: "POST",
      body: JSON.stringify({ candidate_id: candidateId }),
      timeout: 300_000,
      maxRetries: 1,
    })
      .then(() => {
        const SCORING_TIMEOUT_MS = 6 * 60 * 1000;
        const started = Date.now();
        pollRef.current = setInterval(async () => {
          if (Date.now() - started >= SCORING_TIMEOUT_MS) {
            clearInterval(pollRef.current);
            capturePostHog("discovery_failed", { candidate_id: candidateId, reason: "scoring_timeout" });
            finish();
            return;
          }
          try {
            const data = await outreachFetch<any>(`/discovery/scoring-ready/${candidateId}`, { method: "GET" });
            if (data?.ready) {
              clearInterval(pollRef.current);
              finish(data?.with_bullets ?? data?.count ?? undefined);
            }
          } catch {
            // non-fatal — keep polling
          }
        }, POLL_INTERVAL_MS);
      })
      .catch((err: any) => {
        if (!cancelled) {
          capturePostHog("discovery_failed", { candidate_id: candidateId, reason: err?.body?.detail || err?.message || "search_error" });
          setError(err?.body?.detail || err.message || "Lead discovery failed");
        }
      });

    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
    };
  }, [candidateId, authLoading, navigate]);

  // ── Visual animation loop ──
  useEffect(() => {
    if (!candidateId || authLoading) return;
    const start = Date.now();

    const step = setInterval(() => {
      const t = Date.now() - start;
      const done = allDoneRef.current;
      setBarPct(done ? 100 : Math.min(BAR_CAP, Math.round((t / RAMP_MS) * BAR_CAP)));
      setScanChecked(done ? SOURCES.length : Math.min(SOURCES.length, Math.floor((t / RAMP_MS) * (SOURCES.length + 1)) + 1));
      setCountVal((v) => {
        const g = done ? TARGET : Math.pow(Math.min(t / RAMP_MS, 1), 0.8) * TARGET;
        return Math.abs(g - v) < 1 ? g : v + (g - v) * 0.34;
      });
    }, 450);

    const head = setInterval(() => setHeadIdx((i) => (i + 1) % HEADLINES.length), 14000);

    const scan = setInterval(() => {
      const src = SOURCES[scanCounter.current % SOURCES.length];
      const n = Math.floor(8000 + Math.random() * 240000);
      scanCounter.current += 1;
      setScanRows((rows) => [...rows, { src, n, key: scanCounter.current }].slice(-5));
    }, 1200);

    const match = setInterval(() => setMatchOff((o) => o + 1), 1900);

    return () => { clearInterval(step); clearInterval(head); clearInterval(scan); clearInterval(match); };
  }, [candidateId, authLoading, TARGET]);

  if (!candidateId) {
    navigate("/outreach/onboarding/upload");
    return null;
  }

  const headline = HEADLINES[headIdx];
  const rowA = WALL.slice(0, Math.ceil(WALL.length / 2));
  const rowB = WALL.slice(Math.ceil(WALL.length / 2));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1">
        {error ? (
          <div className="flex items-center justify-center px-4 py-20">
            <div className="max-w-md w-full rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border-2 border-red-200">
                <span className="text-2xl">!</span>
              </div>
              <p className="text-red-600 text-sm font-satoshi mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="h-11 px-6 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-semibold border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <main className="max-w-3xl mx-auto px-4 py-10 text-center">
              {/* rotating headline */}
              <div className="min-h-[2.25rem] mb-1">
                <h2 key={headIdx} className={`sd-fade-up font-clash text-2xl sm:text-3xl font-bold ${headline.c ? "text-studojo-purple" : "text-studojo-ink"}`}>
                  {headline.t}
                </h2>
              </div>
              <p className="text-sm text-studojo-muted font-satoshi mb-7">We're searching the entire web to find the right people for you.</p>

              {/* hero counter */}
              <div className="font-clash text-4xl sm:text-6xl md:text-7xl font-bold text-studojo-purple tabular-nums leading-none">
                <Odometer value={countVal} />
              </div>
              <p className="text-sm font-satoshi text-studojo-muted mt-2.5">profiles scanned to find <span className="font-semibold text-studojo-ink">your best few</span></p>

              {/* source chips */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-4 max-w-xl mx-auto">
                {SOURCES.map((s, idx) => {
                  const ok = idx < scanChecked;
                  return (
                    <span key={s} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-satoshi border ${ok ? "bg-studojo-green-bg border-studojo-green/30 text-studojo-green" : "bg-studojo-surface-muted border-studojo-ink/10 text-studojo-muted"}`}>
                      {ok ? "✓" : <span className="w-1.5 h-1.5 rounded-full bg-studojo-purple animate-pulse inline-block" />} {s}
                    </span>
                  );
                })}
              </div>

              {/* single progress bar */}
              <div className="w-full max-w-lg mx-auto mt-8 mb-9">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-satoshi text-studojo-muted">
                    {allDone ? "Done. Opening your matches…" : barPct >= BAR_CAP ? "Finalising your matches…" : "Finding your matches"}
                  </span>
                  <span className={`text-sm font-satoshi font-bold tabular-nums ${allDone ? "text-studojo-green" : "text-studojo-purple"}`}>{barPct}%</span>
                </div>
                <div className="relative h-3.5 w-full bg-studojo-surface-muted rounded-full border border-studojo-ink/10">
                  <div
                    className={`relative h-full rounded-full overflow-hidden ${allDone ? "" : "sd-shimmer"}`}
                    style={{ width: `${barPct}%`, background: allDone ? "#10b981" : "linear-gradient(90deg,#8b5cf6,#ec4899)", transition: "width .6s cubic-bezier(.2,.8,.2,1)" }}
                  />
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 ${allDone ? "" : "sd-glow"}`}
                    style={{ left: `calc(${barPct}% - 8px)`, borderColor: allDone ? "#10b981" : "#8b5cf6", transition: "left .6s cubic-bezier(.2,.8,.2,1)" }}
                  />
                </div>
              </div>

              {/* live scan + matches */}
              <div className="grid sm:grid-cols-2 gap-3 text-left items-start">
                {/* live scan */}
                <div className="rounded-2xl border border-studojo-ink/10 bg-gradient-to-b from-studojo-purple-bg to-white p-4 overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] uppercase tracking-wide font-satoshi font-bold text-studojo-muted flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-studojo-green animate-pulse" /> Live scan
                    </p>
                    <span className="text-[10px] font-satoshi text-studojo-muted tabular-nums">{fmt(countVal * 0.013)} /sec</span>
                  </div>
                  <div className="space-y-2">
                    {scanRows.map((r) => (
                      <div key={r.key} className="sd-feed-in flex items-center gap-2.5 rounded-xl bg-white/70 border border-studojo-ink/8 px-2.5 py-2">
                        <span className="w-6 h-6 rounded-md bg-studojo-purple/10 flex items-center justify-center text-[10px] font-bold text-studojo-purple flex-shrink-0">{r.src[0]}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-satoshi font-medium text-studojo-ink truncate">{r.src}</p>
                          <p className="text-[10px] font-satoshi text-studojo-muted tabular-nums">{fmt(r.n)} profiles indexed</p>
                        </div>
                        <span className="text-studojo-green text-sm">✓</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* matches forming */}
                <div className="rounded-2xl border border-studojo-ink/10 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] uppercase tracking-wide font-satoshi font-bold text-studojo-muted">Matches forming</p>
                    <span className="text-[10px] font-satoshi font-semibold text-studojo-purple bg-studojo-purple/10 px-2 py-0.5 rounded-md">{marketLabel}</span>
                  </div>
                  <div className="space-y-2">
                    {visibleMatches.map((p, k) => (
                      <div key={`${matchOff}-${k}`} className="flex items-center gap-2.5 sd-fade-up">
                        <div className={`w-8 h-8 rounded-full ${colOf(p.i)} flex items-center justify-center flex-shrink-0`}><span className="text-white text-xs font-bold">{p.i}</span></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-satoshi font-semibold text-studojo-ink truncate">{p.n}</p>
                          <p className="text-[11px] font-satoshi text-studojo-muted truncate">{p.t} · {p.c}</p>
                        </div>
                        <span className="text-[10px] font-satoshi font-bold text-studojo-green bg-studojo-green-bg px-1.5 py-0.5 rounded-md">{p.m}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </main>

            {/* Wall of Love */}
            <section className="mt-6 pb-16 max-w-3xl mx-auto px-4">
              <div className="text-center mb-6">
                <p className="font-clash text-2xl font-bold">Students are already getting in</p>
                <p className="text-sm font-satoshi text-studojo-muted mt-1">Don't take it from us. Real messages from students using Studojo.</p>
              </div>
              <div className="sd-wall-mask space-y-3 overflow-hidden">
                <div className="sd-marquee flex gap-3 w-max">
                  {[...rowA, ...rowA].map((v, i) => <ReviewCard key={i} v={v} />)}
                </div>
                <div className="sd-marquee-rev flex gap-3 w-max">
                  {[...rowB, ...rowB].map((v, i) => <ReviewCard key={i} v={v} />)}
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
