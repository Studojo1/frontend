import { useState } from "react";
import { useNavigate } from "react-router";
import { FiUpload, FiSearch, FiMail, FiArrowRight, FiClipboard, FiChevronDown, FiCheck } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { TrustStrip } from "~/components";

const STEPS = [
  {
    number: "01",
    icon: <FiUpload className="w-5 h-5" />,
    title: "Upload your resume",
    desc: "We read your background and figure out which roles and companies fit you, in under a minute.",
  },
  {
    number: "02",
    icon: <FiSearch className="w-5 h-5" />,
    title: "We find the right person",
    desc: "Not HR. Not a generic inbox. The actual VP or hiring manager who'd interview you, sourced from 20,000+ databases.",
  },
  {
    number: "03",
    icon: <FiMail className="w-5 h-5" />,
    title: "A personal email goes out",
    desc: "Written for each person, sent from your Gmail. It sounds like you, because we research them before writing it.",
  },
];

// Wall of Love — mixed authentic "screenshots": X, iMessage, WhatsApp, LinkedIn.
type WallItem =
  | { type: "tweet"; n: string; h: string; d: string; v: boolean; q: string; re: number; rt: number; lk: number }
  | { type: "imsg"; in: string; out: string; t: string }
  | { type: "whatsapp"; q: string; t: string }
  | { type: "linkedin"; n: string; role: string; deg: string; q: string };
const WALL: WallItem[] = [
  { type: "tweet", n: "Priya Nair", h: "@priyabuilds", d: "May 24", v: false, q: "40 applications on job boards = total silence. one week on studojo = 3 replies from actual founders 💀 the math isn't close", re: 5, rt: 6, lk: 41 },
  { type: "imsg", in: "a founder just replied to my message directly 😭", out: "the studojo one?? told you to set it up", t: "11:47 PM" },
  { type: "linkedin", n: "Karthik Menon", role: "Talent Lead · Seed-stage SaaS", deg: "2nd", q: "Got a note from a student via Studojo — tight, specific, clearly not a mass blast. Replied within the hour. More of this, please." },
  { type: "tweet", n: "Devansh Rao", h: "@devansh_rao", d: "6d", v: true, q: "the outreach actually sounds like me, not a bot. recruiter wrote back that my note 'stood out' :D still not over it", re: 2, rt: 4, lk: 33 },
  { type: "whatsapp", q: "ok studojo is lowkey unfair. two interview calls this week and I never touched a single job portal", t: "8:21 PM" },
  { type: "tweet", n: "Sara Qureshi", h: "@sara_q", d: "May 31", v: false, q: "months of getting ghosted, then one weekend on studojo and my inbox finally has real humans in it", re: 3, rt: 5, lk: 29 },
  { type: "imsg", in: "wait the internship is locked?? 🔒", out: "the role studojo dug up?? lets gooo", t: "4:02 PM" },
  { type: "whatsapp", q: "the follow-ups run on their own so I don't have to chase. woke up to a reply I never had to send twice <3", t: "7:58 AM" },
  { type: "linkedin", n: "Hannah Lim", role: "CS @ NUS", deg: "2nd", q: "Four intro calls in my first week, all for roles I'd never have surfaced on a job board. Quietly impressed — sending this to my whole cohort." },
  { type: "tweet", n: "Rohit Bansal", h: "@rohitships", d: "Jun 5", v: false, q: "done firing résumés into the void. studojo drops me straight into the right person's inbox 🙌 genuinely a different game", re: 4, rt: 7, lk: 38 },
];
const WALL_ROW_A = WALL.slice(0, Math.ceil(WALL.length / 2));
const WALL_ROW_B = WALL.slice(Math.ceil(WALL.length / 2));

const WALL_COLORS = ["bg-studojo-purple", "bg-studojo-pink", "bg-studojo-green", "bg-studojo-orange", "bg-studojo-teal", "bg-indigo-500", "bg-rose-500", "bg-amber-500"];
const wallInit = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const wallCol = (n: string) => WALL_COLORS[n.charCodeAt(0) % WALL_COLORS.length];

const WallVerified = () => (
  <span className="inline-flex w-3.5 h-3.5 rounded-full bg-[#1d9bf0] items-center justify-center flex-shrink-0">
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
  </span>
);
const WallXLogo = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-studojo-ink/60 flex-shrink-0"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);
const WallTicks = () => (
  <svg viewBox="0 0 18 12" className="w-3.5 h-3 inline-block">
    <path d="M1 6.5 4 9.5 9.5 2.5" fill="none" stroke="#53bdeb" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 6.5 9 9.5 14.5 2.5" fill="none" stroke="#53bdeb" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const wallTweetAction = (path: string, n: number) => (
  <span className="flex items-center gap-1 text-studojo-muted text-[11px]">
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d={path} /></svg>
    {n > 0 && <span className="tabular-nums">{n}</span>}
  </span>
);
const WALL_P_REPLY = "M1.75 11C1.75 5.9 5.9 1.75 11 1.75h2c5.1 0 9.25 4.15 9.25 9.25S18.1 20.25 13 20.25h-1.4l-4.6 3.1V20.1C4 18.6 1.75 15.1 1.75 11z";
const WALL_P_RT = "M4.5 3.9 1 7.4l3.5 3.5V8.4h11v3l4-4-4-4v3h-9V3.9zm15 13.2L16 13.6v2.5h-11v-3l-4 4 4 4v-3h13z";
const WALL_P_LIKE = "M12 21s-7.5-4.9-10-9.3C.4 8.6 1.8 5 5.2 5c2 0 3.4 1.2 4.3 2.6h1C11.4 6.2 12.8 5 14.8 5c3.4 0 4.8 3.6 3.2 6.7C19.5 16.1 12 21 12 21z";

const WALL_CARD = "w-[300px] h-[168px] flex-shrink-0 rounded-2xl shadow-sm flex flex-col";
function WallCard({ v }: { v: WallItem }) {
  if (v.type === "tweet") {
    return (
      <div className={`${WALL_CARD} border border-studojo-ink/10 bg-white p-4`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-full ${wallCol(v.n)} text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0`}>{wallInit(v.n)}</div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-bold text-studojo-ink truncate">{v.n}</span>{v.v && <WallVerified />}
            </div>
            <div className="text-[12px] text-studojo-muted truncate">{v.h} · {v.d}</div>
          </div>
          <WallXLogo />
        </div>
        <p className="text-[13px] text-studojo-ink leading-snug mt-2.5 flex-1 overflow-hidden">{v.q}</p>
        <div className="flex items-center gap-7 pt-2">{wallTweetAction(WALL_P_REPLY, v.re)}{wallTweetAction(WALL_P_RT, v.rt)}{wallTweetAction(WALL_P_LIKE, v.lk)}</div>
      </div>
    );
  }
  if (v.type === "imsg") {
    return (
      <div className={`${WALL_CARD} bg-[#1c1c1e] p-3.5 justify-center`}>
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
      <div className={`${WALL_CARD} bg-[#0b141a] p-3.5 justify-center`}>
        <div className="self-end max-w-[94%] bg-[#005c4b] text-white text-[13.5px] leading-snug rounded-2xl rounded-br-md px-3 py-2">
          {v.q}
          <span className="flex items-center justify-end gap-1 mt-1 text-[10px] text-white/55">{v.t} <WallTicks /></span>
        </div>
      </div>
    );
  }
  return (
    <div className={`${WALL_CARD} border border-studojo-ink/10 bg-white p-4`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-full ${wallCol(v.n)} text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0`}>{wallInit(v.n)}</div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-studojo-ink truncate">{v.n}</span>
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

const FAQS = [
  {
    q: "Is this spam? Will my Gmail get flagged?",
    a: "No. Emails are sent one at a time, spaced out naturally, and written individually for each person. They come from your own Gmail account, look hand-typed, and hit inboxes - not spam folders. We cap send volume to protect your account's health.",
  },
  {
    q: "What fields does this work for?",
    a: "Any field where hiring happens through people, not just portals. Engineering, product, finance, marketing, consulting, design - our students have landed roles in all of them. It works best for internships and early-career roles where hiring managers actually respond to direct outreach.",
  },
  {
    q: "How personal are the emails, really?",
    a: "Each email is written based on the hiring manager's role, their company's recent news or stage, and your specific background. No two emails are the same. We research each contact before writing - which is why the reply rate is much higher than templated outreach.",
  },
  {
    q: "What happens after I pay?",
    a: "You connect your Gmail, confirm your target companies and roles, and we handle the rest. Most students see their first reply within a week. You can track everything from your dashboard.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-2 border-studojo-ink rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-white hover:bg-studojo-surface-muted transition-colors"
      >
        <span className="font-clash text-base font-bold text-studojo-ink pr-4">{q}</span>
        <FiChevronDown className={`w-5 h-5 shrink-0 text-studojo-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 bg-white border-t-2 border-studojo-ink">
          <p className="font-satoshi text-sm leading-relaxed text-studojo-muted pt-4">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function OutreachLanding() {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white">
      <Header />

      {/* Hero */}
      <section className="border-b-2 border-studojo-ink bg-gradient-to-br from-violet-700 via-purple-700 to-violet-800">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-12 md:px-8 md:py-20">
          <div className="flex flex-col gap-6 text-center md:gap-8 md:text-left">
            <div className="inline-flex items-center gap-2 justify-center md:justify-start">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-satoshi text-xs font-semibold text-white/80 uppercase tracking-widest">2026 recruiting is open</span>
            </div>
            <h1 className="max-w-3xl font-clash text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              Skip the job board queue. Email hiring managers directly.
            </h1>
            <p className="max-w-xl font-satoshi text-sm font-normal leading-6 text-white/90 md:text-base md:leading-7">
              Upload your resume. We find who can actually hire you, write a personal email, and send it from your Gmail. Most students get their first reply within a week.
            </p>
            <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
              <button
                onClick={() => navigate("/outreach/onboarding/upload")}
                className="inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-white text-studojo-ink font-satoshi font-bold text-base border-2 border-studojo-ink shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Find My Hiring Managers <FiArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={() => navigate("/outreach/orders")}
                className="inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-transparent text-white font-satoshi font-medium text-base border-2 border-white/40 transition-all hover:border-white/70"
              >
                View My Campaigns <FiClipboard className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>

      </section>

      <TrustStrip />

      {/* How It Works */}
      <section className="border-b-2 border-studojo-ink bg-white">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-16 md:px-8 md:py-24">
          <div className="text-center mb-14">
            <h2 className="font-clash text-3xl font-bold text-studojo-ink md:text-4xl">How it works</h2>
            <p className="font-satoshi text-base text-studojo-muted mt-3 max-w-lg mx-auto">Three steps. Two minutes of your time. We do the rest.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="relative rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                <div className="flex items-start gap-4 mb-5">
                  <span className="font-clash text-4xl font-black text-studojo-purple/20 leading-none">{step.number}</span>
                  <div className="mt-1 w-10 h-10 rounded-xl bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-purple shrink-0">
                    {step.icon}
                  </div>
                </div>
                <h3 className="font-clash text-lg font-bold mb-2 text-studojo-ink">{step.title}</h3>
                <p className="font-satoshi text-sm leading-relaxed text-studojo-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Email Preview */}
      <section className="border-b-2 border-studojo-ink bg-studojo-surface-muted">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-16 md:px-8 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-satoshi text-xs font-bold uppercase tracking-widest text-studojo-purple mb-3">What goes out</p>
              <h2 className="font-clash text-3xl font-bold text-studojo-ink mb-4 md:text-4xl">Not a template. An actual email.</h2>
              <p className="font-satoshi text-base text-studojo-muted leading-relaxed mb-6">
                Every email is written for one specific person, based on their role, their company's recent news, and your background. It reads like you spent 20 minutes writing it. Because we did.
              </p>
              <ul className="flex flex-col gap-3">
                {["Named to the right person, not 'Dear Hiring Manager'", "References something specific about their company or team", "Connects your experience to their actual work", "Short enough to read in 30 seconds"].map((item) => (
                  <li key={item} className="flex items-start gap-3 font-satoshi text-sm text-studojo-muted">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-studojo-green-bg border-2 border-studojo-ink flex items-center justify-center shrink-0">
                      <FiCheck className="w-3 h-3 text-studojo-green" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock email card */}
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal overflow-hidden">
              {/* Email client top bar */}
              <div className="bg-studojo-surface-muted border-b-2 border-studojo-ink px-5 py-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 border border-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-400 border border-green-500" />
                <span className="ml-3 font-satoshi text-xs text-studojo-muted">Gmail - Compose</span>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1 border-b border-neutral-100 pb-4">
                  <div className="flex gap-2 font-satoshi text-xs text-studojo-muted">
                    <span className="font-semibold w-10 shrink-0">To</span>
                    <span className="text-studojo-ink font-medium">Sarah Chen · VP Engineering, Stripe</span>
                  </div>
                  <div className="flex gap-2 font-satoshi text-xs text-studojo-muted">
                    <span className="font-semibold w-10 shrink-0">Subject</span>
                    <span className="text-studojo-ink">Quick question about your backend team</span>
                  </div>
                </div>
                <div className="font-satoshi text-sm text-studojo-ink leading-relaxed space-y-3">
                  <p>Hi Sarah,</p>
                  <p>I came across your post about Stripe's payment infrastructure redesign - the idempotency keys section was interesting, since I've been working on something similar for a side project.</p>
                  <p>I'm finishing my CS degree at NUS in May. I've built a payments SDK for small merchants and an async job queue in Go - both things your team works on at scale.</p>
                  <p>Would you be open to a quick 15-minute call? I'd love to hear more about what engineering at Stripe looks like right now.</p>
                  <p className="text-studojo-muted">Best,<br />Aisha</p>
                </div>
              </div>
              <div className="border-t-2 border-studojo-ink bg-studojo-purple-bg px-5 py-3">
                <p className="font-satoshi text-xs text-studojo-purple font-semibold">Sarah replied: "This looks really interesting. Are you free for a quick call this week?"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wall of Love — dynamic marquee */}
      <section className="border-b-2 border-studojo-ink bg-studojo-surface-muted overflow-hidden">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-16 md:px-8 md:py-24">
          <div className="text-center mb-10">
            <h2 className="font-clash text-3xl font-bold text-studojo-ink md:text-4xl">Students are already getting in</h2>
            <p className="font-satoshi text-base text-studojo-muted mt-3">Don't take it from us. Real messages from students using Studojo.</p>
          </div>
          <div className="sd-wall-mask space-y-3 overflow-hidden">
            <div className="sd-marquee flex gap-3 w-max">
              {[...WALL_ROW_A, ...WALL_ROW_A].map((v, i) => <WallCard key={i} v={v} />)}
            </div>
            <div className="sd-marquee-rev flex gap-3 w-max">
              {[...WALL_ROW_B, ...WALL_ROW_B].map((v, i) => <WallCard key={i} v={v} />)}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b-2 border-studojo-ink bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
          <div className="text-center mb-14">
            <h2 className="font-clash text-3xl font-bold text-studojo-ink md:text-4xl">Questions</h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-b-2 border-studojo-ink bg-studojo-purple">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-16 md:px-8 md:py-24 text-center">
          <h2 className="font-clash text-3xl font-bold text-white mb-4 md:text-4xl">Your resume is worth more than a job board application.</h2>
          <p className="font-satoshi text-base text-white/80 mb-10 max-w-lg mx-auto">
            Takes 2 minutes to set up. Most students get their first reply within a week.
          </p>
          <button
            onClick={() => navigate("/outreach/onboarding/upload")}
            className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-white text-studojo-ink font-satoshi font-bold text-base border-2 border-studojo-ink shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            Find My Hiring Managers <FiArrowRight className="w-5 h-5 ml-2" />
          </button>
          <p className="font-satoshi text-xs text-white/50 mt-4">From ₹499 for 50 outreaches. One-time payment. No subscriptions.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
