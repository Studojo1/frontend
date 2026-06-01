import { Link } from "react-router";
import type { Route } from "./+types/partners._index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Partners API | Studojo" },
    {
      name: "description",
      content:
        "The Studojo B2B API delivers 200 verified hiring manager contacts per candidate run — complete with personalised outreach intel. Build hiring intelligence into your product.",
    },
  ];
}

const FEATURES = [
  {
    icon: "🎯",
    title: "200 leads per run",
    desc: "Every run returns exactly 200 verified hiring managers — scored, ranked, and ready to use.",
  },
  {
    icon: "✉️",
    title: "Verified emails",
    desc: "Every lead includes a verified work email with bounce-rate protection built in.",
  },
  {
    icon: "🧠",
    title: "Personalised outreach intel",
    desc: "Each lead comes with a connection point, outreach angle, suggested opening, and timing rationale — written by AI for the specific candidate.",
  },
  {
    icon: "🔗",
    title: "Webhook delivery",
    desc: "Get notified the moment a job completes. Or poll the status endpoint — your call.",
  },
  {
    icon: "⚡",
    title: "10–15 min per run",
    desc: "Full discovery, scoring, web research, and email enrichment — delivered in under 15 minutes.",
  },
  {
    icon: "💰",
    title: "₹7.5 per lead",
    desc: "₹1,500 per candidate run. 200 leads per run. No monthly fee, no seat license, no renewal.",
  },
];

const INTEL_FIELDS = [
  { field: "connection_point", desc: "Why this person and this candidate belong in a conversation" },
  { field: "outreach_angle", desc: "The strategic angle for the cold message" },
  { field: "why_now", desc: "What makes this timing specifically right" },
  { field: "suggested_opening", desc: "A first-person opening sentence to paste directly into an email" },
  { field: "signal_rationale", desc: "Evidence behind the lead's relevance score" },
];

export default function PartnersLanding() {
  return (
    <div className="min-h-screen bg-white font-['Satoshi']">
      {/* Nav */}
      <nav className="border-b-2 border-neutral-900 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-['Clash_Display'] text-xl font-bold text-neutral-900">
          Studojo
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/partners/login"
            className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
          >
            Sign in
          </Link>
          <Link
            to="/partners/signup"
            className="rounded-xl border-2 border-neutral-900 bg-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
          >
            Get API Access
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="mb-4 inline-block rounded-full border-2 border-neutral-900 bg-yellow-300 px-4 py-1 text-xs font-semibold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
          B2B Partners API
        </div>
        <h1 className="mt-6 font-['Clash_Display'] text-5xl font-bold leading-tight text-neutral-900 md:text-6xl">
          Build hiring intelligence
          <br />
          into your product.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
          The Studojo API delivers 200 verified hiring manager contacts per candidate run — complete with
          personalised outreach intel. Drop it into your platform and let your users start reaching decision-makers
          in minutes.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/partners/signup"
            className="rounded-xl border-2 border-neutral-900 bg-violet-500 px-8 py-3.5 text-base font-semibold text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
          >
            Start building →
          </Link>
          <Link
            to="/partners/login"
            className="rounded-xl border-2 border-neutral-900 bg-white px-8 py-3.5 text-base font-semibold text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
          >
            Sign in
          </Link>
        </div>

        {/* Pricing callout */}
        <div className="mx-auto mt-12 flex w-fit items-center gap-6 rounded-2xl border-2 border-neutral-900 bg-neutral-50 px-8 py-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
          <div className="text-center">
            <div className="font-['Clash_Display'] text-3xl font-bold text-neutral-900">₹1,500</div>
            <div className="text-xs text-neutral-500">per candidate run</div>
          </div>
          <div className="h-10 w-px bg-neutral-300" />
          <div className="text-center">
            <div className="font-['Clash_Display'] text-3xl font-bold text-neutral-900">200</div>
            <div className="text-xs text-neutral-500">leads per run</div>
          </div>
          <div className="h-10 w-px bg-neutral-300" />
          <div className="text-center">
            <div className="font-['Clash_Display'] text-3xl font-bold text-violet-600">₹7.5</div>
            <div className="text-xs text-neutral-500">per verified lead</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y-2 border-neutral-900 bg-neutral-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 font-['Clash_Display'] text-3xl font-bold text-neutral-900">
            What you get with every run
          </h2>
          <p className="mb-10 text-neutral-500">No setup. No scraping. No prompt engineering.</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
              >
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="mb-1 font-['Clash_Display'] text-lg font-bold text-neutral-900">{f.title}</h3>
                <p className="text-sm text-neutral-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outreach intel breakdown */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 font-['Clash_Display'] text-3xl font-bold text-neutral-900">
            Five intel fields. Per lead.
          </h2>
          <p className="mb-10 text-neutral-500">
            Every lead includes structured outreach intelligence — not just contact data.
          </p>
          <div className="space-y-3">
            {INTEL_FIELDS.map((item, i) => (
              <div
                key={item.field}
                className="flex items-start gap-4 rounded-xl border-2 border-neutral-900 bg-white px-6 py-4 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-neutral-900 bg-violet-100 text-xs font-bold text-violet-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <code className="text-sm font-semibold text-violet-600">{item.field}</code>
                  <p className="mt-0.5 text-sm text-neutral-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t-2 border-neutral-900 bg-violet-500 px-6 py-16 text-center">
        <h2 className="font-['Clash_Display'] text-4xl font-bold text-white">
          Ready to plug in?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-violet-100">
          Buy candidate credits, create your API key, and ship your first request today.
          No monthly fee.
        </p>
        <Link
          to="/partners/signup"
          className="mt-8 inline-block rounded-xl border-2 border-neutral-900 bg-white px-8 py-3.5 text-base font-semibold text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
        >
          Get API Access →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-neutral-900 px-6 py-8 text-center text-sm text-neutral-500">
        <p>
          © 2026 Studojo ·{" "}
          <Link to="https://studojo.com" className="underline">
            studojo.com
          </Link>
        </p>
      </footer>
    </div>
  );
}
