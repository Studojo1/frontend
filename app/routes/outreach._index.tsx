import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { trackMeta } from "~/lib/meta-pixel";
import { authClient } from "~/lib/auth-client";
import { FiUpload, FiSearch, FiMail, FiArrowRight, FiClipboard, FiChevronDown, FiCheck } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { TrustStrip } from "~/components";
import { RealNumbers } from "~/components/outreach/RealNumbers";
import { useNextStep, isPaidNotLaunched, nextStepLabel, nextStepSummary } from "~/lib/outreach/hooks";

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
    a: "You connect your Gmail, confirm your target companies and roles, and we handle the rest. About 4 in 10 students hear back in their first week. You can track everything from your dashboard.",
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

  // "View My Campaigns" is meaningless to someone who arrived from an ad and has
  // no campaigns yet, and on mobile it stacks directly under the primary CTA. Show
  // it only once we know there is a session to go back to. isPending keeps it
  // hidden through the first render rather than letting it flash in and out.
  const { data: session, isPending } = authClient.useSession();
  const showMyCampaigns = !isPending && !!session;

  // A signed-in user who has paid and not launched must never be sent back to
  // resume upload from here. One who paid Rs 3,465 followed "Find My Hiring
  // Managers" and re-uploaded her resume three times without reaching Launch.
  const nextStep = useNextStep();
  const paidNotLaunched = isPaidNotLaunched(nextStep) ? nextStep : null;
  const primaryCta = paidNotLaunched
    ? {
        label: nextStepLabel(paidNotLaunched),
        to: `/outreach${paidNotLaunched.path}`,
      }
    : nextStep?.state === "campaign_active"
      ? { label: "Go to my campaign", to: "/outreach/campaign/dashboard" }
      : { label: "Find My Hiring Managers", to: "/outreach/onboarding/upload" };

  // Ad traffic lands here. This is the audience the retargeting campaigns are
  // built from, so it needs its own event rather than a bare PageView.
  useEffect(() => {
    trackMeta("ViewContent", { content_name: "Outreach Dojo LP" });
  }, []);

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
              Upload your resume. We find who can actually hire you, write a personal email, and send it from your Gmail. About 4 in 10 students hear back in their first week.
            </p>
            {paidNotLaunched && (
              <p className="max-w-xl font-satoshi text-sm font-semibold text-white">
                {nextStepSummary(paidNotLaunched)}
              </p>
            )}
            <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
              <button
                onClick={() => navigate(primaryCta.to)}
                className="inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-white text-studojo-ink font-satoshi font-bold text-base border-2 border-studojo-ink shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                {primaryCta.label} <FiArrowRight className="w-5 h-5 ml-2" />
              </button>
              {showMyCampaigns && (
                <button
                  onClick={() => navigate("/outreach/orders")}
                  className="inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-transparent text-white font-satoshi font-medium text-base border-2 border-white/40 transition-all hover:border-white/70"
                >
                  View My Campaigns <FiClipboard className="w-5 h-5 ml-2" />
                </button>
              )}
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

      {/* Outcome figures from our own records (these replaced invented testimonials). */}
      <section className="border-b-2 border-studojo-ink bg-studojo-surface-muted">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-16 md:px-8 md:py-24">
          <RealNumbers title="Students are already getting in" />
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
            Takes 2 minutes to set up. About 4 in 10 students hear back in their first week.
          </p>
          <button
            onClick={() => navigate(primaryCta.to)}
            className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-white text-studojo-ink font-satoshi font-bold text-base border-2 border-studojo-ink shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            {primaryCta.label} <FiArrowRight className="w-5 h-5 ml-2" />
          </button>
          <p className="font-satoshi text-xs text-white/50 mt-4">From ₹1,825 for 200 outreaches. One-time payment. No subscriptions.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
