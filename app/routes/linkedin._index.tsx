import { useNavigate } from "react-router";
import {
  FiLinkedin, FiZap, FiShield, FiCheckCircle, FiArrowRight,
  FiUploadCloud, FiUsers, FiSend,
} from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";

export function meta() {
  return [
    { title: "Studojo LinkedIn, Auto-send connection requests to hiring managers" },
    { name: "description", content: "Upload your resume. We find decision-makers. You connect on LinkedIn at scale, safely." },
  ];
}

const STEPS = [
  {
    n: 1,
    icon: <FiUploadCloud className="w-5 h-5" />,
    title: "Upload your resume",
    body: "Drag it in. We read your skills, target roles, and dream companies. ~10 seconds.",
  },
  {
    n: 2,
    icon: <FiUsers className="w-5 h-5" />,
    title: "We find the right hiring managers",
    body: "200+ decision-makers matched to your profile, founders, heads, hiring leads. Not random recruiters.",
  },
  {
    n: 3,
    icon: <FiLinkedin className="w-5 h-5" />,
    title: "Connect your LinkedIn",
    body: "One-time secure login. We send connection requests on your behalf, paced safely, hand-personalised notes.",
  },
  {
    n: 4,
    icon: <FiSend className="w-5 h-5" />,
    title: "Replies land in your inbox",
    body: "When they accept, we send a tailored intro message. Track everything from one dashboard.",
  },
];

const FEATURES = [
  "Sends 8-12 invites per day (LinkedIn-safe pacing)",
  "AI-written personal notes referencing their company",
  "Auto-follow-up message when they accept",
  "Withdraws stale invites after 14 days to keep your limit clean",
  "Full transparency, see every invite, every reply",
];

const TIERS = [
  { id: "linkedin_weekly", label: "Weekly", count: 80, priceUSD: 8, priceINR: 500, per: "week", duration: 7 },
  { id: "linkedin_monthly", label: "Monthly", count: 350, priceUSD: 25, priceINR: 1800, per: "month", duration: 30, popular: true },
];

const FAQ: [string, string][] = [
  ["Is this safe for my LinkedIn account?", "Yes. We pace invites at 8-12/day (well below LinkedIn's 100/week limit), use your own session cookies, and randomise send times to mirror human behaviour. We don't use bots or third-party automation tools, everything runs through real browser sessions."],
  ["What if someone reports me?", "Reports are rare because every invite has a real personal note. We also let you blacklist companies or titles you don't want contacted. If LinkedIn ever asks you to verify, we pause automatically."],
  ["Will I be the one signing in?", "Yes. You log into LinkedIn once on our connect page. We never store your password, only the session token. You can revoke access from LinkedIn → Settings → Sessions at any time."],
  ["What's the reply rate?", "Acceptance rate is usually 25-40% (depends on profile match). Of those who accept, about 8-15% reply to the follow-up message."],
];

export default function LinkedInLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden border-b-2 border-studojo-ink/10">
        <div className="absolute inset-0 bg-gradient-to-br from-studojo-purple-bg/40 via-white to-blue-50/40 pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 md:py-24 md:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-satoshi bg-[#0a66c2]/10 text-[#0a66c2] border-2 border-[#0a66c2]/25 mb-5">
            <FiLinkedin className="w-3.5 h-3.5" /> LINKEDIN OUTREACH · BETA
          </span>
          <h1 className="font-clash text-4xl md:text-6xl font-bold text-studojo-ink mb-5 leading-tight">
            Connect with hiring managers<br />
            <span className="text-[#0a66c2]">on LinkedIn.</span>{" "}
            <span className="text-studojo-ink/80">Automatically.</span>
          </h1>
          <p className="text-base md:text-xl text-studojo-muted font-satoshi max-w-2xl mx-auto mb-8">
            Upload your resume. We find the right decision-makers. You connect with hand-personalised invites, sent safely on autopilot.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <button
              onClick={() => navigate("/linkedin/onboarding/upload")}
              className="h-12 px-7 rounded-xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center justify-center gap-2"
            >
              <FiUploadCloud className="w-4 h-4" /> Upload your resume
            </button>
            <button
              onClick={() => navigate("/linkedin/pricing")}
              className="h-12 px-7 rounded-xl bg-white text-studojo-ink font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              See pricing
            </button>
          </div>

          {/* Quick trust row */}
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {["200+ matched contacts", "8-12 invites/day", "Auto follow-ups", "LinkedIn-safe pacing"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-satoshi bg-white border-2 border-studojo-ink/15 text-studojo-ink">
                <FiCheckCircle className="w-3.5 h-3.5 text-studojo-green" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 md:px-8">

        {/* HOW IT WORKS */}
        <section className="py-16">
          <div className="text-center mb-10">
            <span className="text-xs font-bold font-satoshi text-studojo-purple uppercase tracking-wider">How it works</span>
            <h2 className="font-clash text-3xl md:text-4xl font-bold text-studojo-ink mt-2">From resume to first reply in under 24 hours.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-[#0a66c2]/10 border-2 border-studojo-ink flex items-center justify-center text-[#0a66c2]">
                    {s.icon}
                  </div>
                  <span className="font-clash text-2xl font-bold text-studojo-ink/20">0{s.n}</span>
                </div>
                <h3 className="font-clash text-lg font-bold text-studojo-ink mb-1">{s.title}</h3>
                <p className="text-sm text-studojo-muted font-satoshi">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WHAT YOU GET */}
        <section className="py-16 border-t border-studojo-ink/10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold font-satoshi text-studojo-purple uppercase tracking-wider">What you get</span>
              <h2 className="font-clash text-3xl md:text-4xl font-bold text-studojo-ink mt-2 mb-4">
                Real outreach. Sent like a human. From your LinkedIn.
              </h2>
              <p className="text-base text-studojo-muted font-satoshi mb-5">
                Every invite comes from <span className="font-bold text-studojo-ink">your</span> LinkedIn profile with a personal note referencing the person's company and what they do. No bulk messages, no recycled templates.
              </p>
              <ul className="space-y-3">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm font-satoshi text-studojo-ink">
                    <FiCheckCircle className="w-4 h-4 text-studojo-green flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-ink text-white shadow-brutal p-6 font-mono text-[12px] leading-relaxed">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/15">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="text-white/50 text-[11px] ml-2">connection note · auto-generated</span>
              </div>
              <p className="mb-3">
                <span className="text-blue-300">Hi Aarav,</span>
              </p>
              <p className="mb-3 text-white/90">
                Saw you're scaling Polymath AI's LLM orchestration stack,
                I've been building production voice AI pipelines at Cred and
                am drawn to teams shipping real-time inference at your stage.
              </p>
              <p className="mb-3 text-white/90">
                Would love to connect.
              </p>
              <p className="text-blue-300">Himanshu</p>
              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[10px] text-white/40">
                <span>≤ 300 chars · LinkedIn-safe</span>
                <span>Sent · Tuesday 10:42 AM</span>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING TEASER */}
        <section className="py-16 border-t border-studojo-ink/10">
          <div className="text-center mb-10">
            <span className="text-xs font-bold font-satoshi text-studojo-purple uppercase tracking-wider">Pricing</span>
            <h2 className="font-clash text-3xl md:text-4xl font-bold text-studojo-ink mt-2">Weekly or monthly. Your call.</h2>
            <p className="text-base text-studojo-muted font-satoshi mt-2">No hidden costs. Cancel any time. India launch pricing.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {TIERS.map((t) => (
              <div
                key={t.id}
                className={`rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6 flex flex-col ${t.popular ? "ring-4 ring-studojo-purple/20" : ""}`}
              >
                {t.popular && (
                  <span className="self-start mb-3 px-2.5 py-1 rounded-full text-[10px] font-bold font-satoshi bg-studojo-purple text-white border-2 border-studojo-ink">
                    MOST POPULAR
                  </span>
                )}
                <p className="text-xs font-bold font-satoshi text-studojo-muted uppercase mb-1">{t.label}</p>
                <h3 className="font-clash text-2xl font-bold text-studojo-ink">{t.count} invites</h3>
                <div className="mt-3 mb-4 flex items-baseline gap-1 flex-wrap">
                  <span className="font-clash text-3xl font-bold text-studojo-ink">₹{t.priceINR}</span>
                  <span className="text-sm font-satoshi text-studojo-muted">/{t.per}</span>
                </div>
                <ul className="space-y-2 mb-5 flex-1 text-sm font-satoshi text-studojo-ink">
                  <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-studojo-green flex-shrink-0 mt-0.5" /> {t.count} hand-personalised invites</li>
                  <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-studojo-green flex-shrink-0 mt-0.5" /> AI-written follow-up on accept</li>
                  <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-studojo-green flex-shrink-0 mt-0.5" /> Reply tracking + inbox</li>
                  <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-studojo-green flex-shrink-0 mt-0.5" /> Safe pacing (~{Math.round(t.count / t.duration)}/day)</li>
                </ul>
                <button
                  onClick={() => navigate("/linkedin/onboarding/upload")}
                  className="h-11 rounded-xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  Get started
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 border-t border-studojo-ink/10">
          <div className="text-center mb-8">
            <span className="text-xs font-bold font-satoshi text-studojo-purple uppercase tracking-wider">FAQ</span>
            <h2 className="font-clash text-3xl md:text-4xl font-bold text-studojo-ink mt-2">Common questions.</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group rounded-2xl border-2 border-studojo-ink bg-white">
                <summary className="cursor-pointer list-none px-5 py-4 flex items-start justify-between gap-4">
                  <span className="text-sm md:text-base font-bold font-satoshi text-studojo-ink">{q}</span>
                  <span className="text-studojo-purple text-xl leading-none flex-shrink-0">+</span>
                </summary>
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-sm text-studojo-muted font-satoshi leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-16 border-t border-studojo-ink/10">
          <div className="rounded-2xl border-2 border-studojo-ink bg-[#0a66c2] text-white shadow-brutal p-10 text-center">
            <h2 className="font-clash text-3xl md:text-4xl font-bold mb-3">Ready to connect with the right people?</h2>
            <p className="text-base font-satoshi text-white/80 mb-6 max-w-xl mx-auto">
              Upload your resume, we'll have your contact list ready in 3 minutes.
            </p>
            <button
              onClick={() => navigate("/linkedin/onboarding/upload")}
              className="h-12 px-7 rounded-xl bg-white text-[#0a66c2] font-satoshi font-bold text-sm border-2 border-studojo-ink inline-flex items-center justify-center gap-2"
            >
              <FiUploadCloud className="w-4 h-4" /> Start with my resume <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        <p className="text-xs text-studojo-muted font-satoshi text-center py-6">
          Questions? <a href="mailto:studojo@gmail.com" className="underline text-studojo-purple">studojo@gmail.com</a>
        </p>
      </div>

      <Footer />
    </div>
  );
}
