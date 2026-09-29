import { describeError } from "~/lib/error-detail";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";
import { capturePostHog } from "~/lib/posthog";

const POLL_INTERVAL_MS = 5000;
// Everything on this screen is real server state (B2C UC-Q08). It used to show
// a made-up 2.1M-3.4M "profiles scanned" counter, ticks for 19 sources that are
// never queried (only Apollo is searched), random "profiles indexed" and "/sec"
// numbers, invented people under "Matches forming" and unverified stats.
const SEARCH_RAMP_MS = 60000; // the search itself typically takes 30-50s

// Wall of Love: mixed authentic "screenshots": X, iMessage, WhatsApp, LinkedIn.
type Card =
  | { type: "tweet"; n: string; h: string; d: string; v: boolean; q: string; re: number; rt: number; lk: number }
  | { type: "imsg"; in: string; out: string; t: string }
  | { type: "whatsapp"; q: string; t: string }
  | { type: "linkedin"; n: string; role: string; deg: string; q: string };
const WALL: Card[] = [
  { type: "tweet", n: "Priya Nair", h: "@priyabuilds", d: "May 24", v: false, q: "40 applications on job boards = total silence. one week on studojo = 3 replies from actual founders 💀 the math isn't close", re: 5, rt: 6, lk: 41 },
  { type: "imsg", in: "a founder just replied to my message directly 😭", out: "the studojo one?? told you to set it up", t: "11:47 PM" },
  { type: "linkedin", n: "Karthik Menon", role: "Talent Lead · Seed-stage SaaS", deg: "2nd", q: "Got a note from a student via Studojo: tight, specific, clearly not a mass blast. Replied within the hour. More of this, please." },
  { type: "tweet", n: "Devansh Rao", h: "@devansh_rao", d: "6d", v: true, q: "the outreach actually sounds like me, not a bot. recruiter wrote back that my note 'stood out' :D still not over it", re: 2, rt: 4, lk: 33 },
  { type: "whatsapp", q: "ok studojo is lowkey unfair. two interview calls this week and I never touched a single job portal", t: "8:21 PM" },
  { type: "tweet", n: "Sara Qureshi", h: "@sara_q", d: "May 31", v: false, q: "months of getting ghosted, then one weekend on studojo and my inbox finally has real humans in it", re: 3, rt: 5, lk: 29 },
  { type: "imsg", in: "wait the internship is locked?? 🔒", out: "the role studojo dug up?? lets gooo", t: "4:02 PM" },
  { type: "whatsapp", q: "the follow-ups run on their own so I don't have to chase. woke up to a reply I never had to send twice <3", t: "7:58 AM" },
  { type: "linkedin", n: "Hannah Lim", role: "CS @ NUS", deg: "2nd", q: "Four intro calls in my first week, all for roles I'd never have surfaced on a job board. Quietly impressed. Sending this to my whole cohort." },
  { type: "tweet", n: "Rohit Bansal", h: "@rohitships", d: "Jun 5", v: false, q: "done firing résumés into the void. studojo drops me straight into the right person's inbox 🙌 genuinely a different game", re: 4, rt: 7, lk: 38 },
];

const COLORS = ["bg-studojo-purple", "bg-studojo-pink", "bg-studojo-green", "bg-studojo-orange", "bg-studojo-teal", "bg-indigo-500", "bg-rose-500", "bg-amber-500"];
const fmt = (n: number) => Math.max(0, Math.round(n)).toLocaleString("en-US");
type Preview = { title: string; company: string };
const initOf = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const colOf = (n: string) => COLORS[n.charCodeAt(0) % COLORS.length];

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
  const { loading: authLoading, recovering } = useOutreachAuth();
  const { candidateId } = useOutreachStore();

  const [error, setError] = useState("");
  const [allDone, setAllDone] = useState(false);
  // Real progress: how many leads the search stored, then scoring counts.
  const [found, setFound] = useState<number | null>(null);
  const [stats, setStats] = useState<{ total: number; scored: number; with_bullets: number } | null>(null);
  const [preview, setPreview] = useState<Preview[]>([]);
  const [elapsed, setElapsed] = useState(0);
  // Kept across effect re-runs so the bar never snaps back to zero.
  const animStartRef = useRef<number | null>(null);

  const allDoneRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => { allDoneRef.current = allDone; }, [allDone]);

  // No candidate once auth and order recovery have settled: back to upload.
  // This used to be a navigate() called during render, which re-rendered in a
  // loop ("Maximum update depth exceeded", React #185) on every logged-out or
  // candidate-less visit.
  useEffect(() => {
    if (!authLoading && !recovering && !candidateId) {
      navigate("/outreach/onboarding/upload", { replace: true });
    }
  }, [authLoading, recovering, candidateId, navigate]);

  // ── Discovery + scoring orchestration (unchanged behaviour) ──
  useEffect(() => {
    if (authLoading || !candidateId) return;
    let cancelled = false;

    const startedAt = Date.now();
    capturePostHog("discovery_started", { candidate_id: candidateId });

    // Only a run that actually produced ready results counts as completed. A
    // timeout still moves the user on, but must not inflate discovery_completed.
    const finish = (outcome: "ready" | "timeout", data?: { total?: number; with_bullets?: number }) => {
      if (cancelled) return;
      if (outcome === "ready") {
        capturePostHog("discovery_completed", {
          candidate_id: candidateId,
          leads_found: data?.total ?? null,
          justified_count: data?.with_bullets ?? null,
          seconds: Math.round((Date.now() - startedAt) / 1000),
        });
      }
      setAllDone(true);
      setTimeout(() => navigate("/outreach/leads/results"), 900);
    };

    // A mobile browser can evict this tab during the 5-minute search below. When
    // the user comes back, the work the server already did is still there, so
    // ask before paying for it again -- scoring-ready is keyed on candidate_id
    // alone, with no job or session handle, so a fresh tab can read it.
    const resumeIfAlreadyDone = async (): Promise<boolean> => {
      try {
        const data = await outreachFetch<any>(`/discovery/scoring-ready/${candidateId}`, { method: "GET" });
        // A previous run that found nobody is not something to resume: the
        // results page sends "Run the search again" here, and resuming it
        // would bounce the user straight back to the empty page.
        if (data?.ready && !data?.zero_leads && !cancelled) {
          capturePostHog("discovery_resumed", { candidate_id: candidateId });
          finish("ready", data);
          return true;
        }
      } catch {
        // Never seen this candidate, or the check failed: fall through and run
        // discovery normally.
      }
      return false;
    };

    resumeIfAlreadyDone().then((resumed) => {
      if (resumed || cancelled) return;

      outreachFetch<{ leads_collected?: number }>("/discovery/search", {
        method: "POST",
        body: JSON.stringify({ candidate_id: candidateId }),
        timeout: 300_000,
        maxRetries: 1,
      })
      .then((res) => {
        if (cancelled) return;
        setFound(res?.leads_collected ?? 0);
        if (res?.leads_collected) {
          // A few real matches to look at while they are ranked.
          outreachFetch<{ leads: { title?: string; company?: string }[] }>(`/candidate/${candidateId}/leads?limit=6`)
            .then((d) => {
              if (!cancelled) {
                setPreview((d?.leads || []).filter((l) => l.title && l.company).slice(0, 6)
                  .map((l) => ({ title: l.title as string, company: l.company as string })));
              }
            })
            .catch(() => {});
        }
        // Nothing was found, so nothing will ever be scored. Waiting on the
        // scoring poll here held the user at 96% for the full six minutes.
        if (res?.leads_collected === 0) {
          capturePostHog("discovery_completed", {
            candidate_id: candidateId,
            leads_found: 0,
            justified_count: 0,
            seconds: Math.round((Date.now() - startedAt) / 1000),
          });
          setAllDone(true);
          setTimeout(() => navigate("/outreach/leads/results"), 900);
          return;
        }
        const SCORING_TIMEOUT_MS = 6 * 60 * 1000;
        const started = Date.now();
        pollRef.current = setInterval(async () => {
          if (Date.now() - started >= SCORING_TIMEOUT_MS) {
            clearInterval(pollRef.current);
            capturePostHog("discovery_failed", { candidate_id: candidateId, reason: "scoring_timeout" });
            finish("timeout");
            return;
          }
          try {
            const data = await outreachFetch<any>(`/discovery/scoring-ready/${candidateId}`, { method: "GET" });
            if (data && typeof data.total === "number") {
              setStats({ total: data.total, scored: data.scored ?? 0, with_bullets: data.with_bullets ?? 0 });
            }
            if (data?.ready) {
              clearInterval(pollRef.current);
              finish("ready", data);
            }
          } catch {
            // non-fatal: keep polling
          }
        }, POLL_INTERVAL_MS);
      })
      .catch((err: any) => {
        if (!cancelled) {
          capturePostHog("discovery_failed", { candidate_id: candidateId, reason: describeError(err, "search_error") });
          setError(describeError(err, "Lead discovery failed"));
        }
      });
    });

    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
    };
  }, [candidateId, authLoading, navigate]);

  // One clock for the search-phase bar. Paused while the tab is hidden.
  useEffect(() => {
    if (!candidateId || authLoading) return;
    if (animStartRef.current === null) animStartRef.current = Date.now();
    const start = animStartRef.current;
    const id = setInterval(() => { if (!document.hidden) setElapsed(Date.now() - start); }, 1000);
    return () => clearInterval(id);
  }, [candidateId, authLoading]);

  if (!candidateId) return null;

  // Bar: the search is 5-45% (time-based, it cannot report progress), ranking
  // is 45-95% from real scored/total, then 100 when results open.
  const searching = found === null;
  const barPct = allDone
    ? 100
    : searching
      ? Math.min(45, 5 + Math.round((elapsed / SEARCH_RAMP_MS) * 40))
      : stats && stats.total > 0
        ? 45 + Math.round((Math.min(stats.scored, stats.total) / stats.total) * 50)
        : 45;
  const steps: { label: string; state: "done" | "active" | "todo" }[] = [
    { label: "Reading your profile and targets", state: "done" },
    {
      label: searching ? "Searching for hiring managers who match your targets" : `Found ${fmt(found ?? 0)} hiring managers`,
      state: searching ? "active" : "done",
    },
    {
      label: stats && stats.total > 0
        ? `Ranking them by fit to you: ${fmt(Math.min(stats.scored, stats.total))} of ${fmt(stats.total)}`
        : "Ranking them by fit to you",
      state: allDone ? "done" : searching ? "todo" : "active",
    },
  ];
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
              <h2 className="font-clash text-2xl sm:text-3xl font-bold text-studojo-ink mb-1">
                {allDone ? "Opening your matches" : searching ? "Finding your hiring managers" : "Ranking your matches"}
              </h2>
              <p className="text-sm text-studojo-muted font-satoshi mb-8">This usually takes one to two minutes. You can keep this tab open in the background.</p>

              {/* progress bar, driven by the steps below */}
              <div className="w-full max-w-lg mx-auto mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-satoshi text-studojo-muted">
                    {allDone ? "Done. Opening your matches…" : searching ? "Searching" : "Ranking"}
                  </span>
                  <span className={`text-sm font-satoshi font-bold tabular-nums ${allDone ? "text-studojo-green" : "text-studojo-purple"}`}>{barPct}%</span>
                </div>
                <div className="relative h-3.5 w-full bg-studojo-surface-muted rounded-full border border-studojo-ink/10">
                  <div
                    className={`relative h-full rounded-full overflow-hidden ${allDone ? "" : "sd-shimmer"}`}
                    style={{ width: `${barPct}%`, background: allDone ? "#10b981" : "linear-gradient(90deg,#8b5cf6,#ec4899)", transition: "width .6s cubic-bezier(.2,.8,.2,1)" }}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-left items-start">
                {/* what is actually happening */}
                <div className="rounded-2xl border-2 border-studojo-ink bg-white p-4 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
                  <p className="text-[11px] uppercase tracking-wide font-satoshi font-bold text-studojo-muted mb-3">What is happening</p>
                  <ol className="space-y-3">
                    {steps.map((st) => (
                      <li key={st.label} className="flex items-start gap-2.5">
                        <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${
                          st.state === "done" ? "bg-studojo-green text-white" : st.state === "active" ? "border-2 border-studojo-purple" : "border-2 border-studojo-ink/15"
                        }`}>
                          {st.state === "done" ? "✓" : st.state === "active" ? <span className="w-1.5 h-1.5 rounded-full bg-studojo-purple animate-pulse" /> : null}
                        </span>
                        <span className={`text-sm font-satoshi leading-snug ${st.state === "todo" ? "text-studojo-muted" : "text-studojo-ink"}`}>{st.label}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* the first real matches, once the search has returned */}
                <div className="rounded-2xl border-2 border-studojo-ink bg-white p-4 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
                  <p className="text-[11px] uppercase tracking-wide font-satoshi font-bold text-studojo-muted mb-3">First matches</p>
                  {preview.length > 0 ? (
                    <ul className="space-y-2.5">
                      {preview.map((m, k) => (
                        <li key={k} className="sd-fade-up flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${colOf(m.company)} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white text-xs font-bold">{initOf(m.company)}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-satoshi font-semibold text-studojo-ink truncate">{m.title}</p>
                            <p className="text-[11px] font-satoshi text-studojo-muted truncate">{m.company}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm font-satoshi text-studojo-muted">Your first matches appear here as soon as the search returns.</p>
                  )}
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
