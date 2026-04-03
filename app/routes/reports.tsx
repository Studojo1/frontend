import { useState } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Reports – Studojo | Data-Driven Career Market Analyses" },
    {
      name: "description",
      content:
        "In-depth market analyses for students. Job data, salary benchmarks, and hiring trends across India and beyond.",
    },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports` },
  ];
}

const REPORTS = [
  {
    slug: "sales-india-2026",
    title: "Sales in India: What Freshers Actually Face",
    subtitle: "Q1 2026",
    excerpt:
      "28,600+ entry-level openings. A ₹12 LPA ceiling that almost nobody in their first year reaches. And the one skill gap (CRM fluency) that ends 60% of sales interviews before they start.",
    category: "Sales",
    date: "April 2026",
    findings: 8,
    color: "bg-emerald-500",
    badge: "New",
  },
  {
    slug: "finance-india-2026",
    title: "Finance in India: What Graduates Actually Face",
    subtitle: "Q1 2026",
    excerpt:
      "1,400+ entry-level openings. A 20 LPA ceiling at global banks that almost nobody reaches. And the one skill gap that sends 75% of finance graduates home before the first round.",
    category: "Finance",
    date: "April 2026",
    findings: 8,
    color: "bg-violet-500",
    badge: "",
  },
];

function RequestForm() {
  const [topic, setTopic] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/report-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), email: email.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || "Something went wrong"); setState("error"); return; }
      setState("done");
    } catch {
      setErrorMsg("Could not connect. Try again.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-2xl border-2 border-neutral-900 bg-green-50 p-8 text-center shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-900 bg-green-500">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="font-['Clash_Display'] text-xl font-bold text-neutral-900">Request received</div>
        <p className="mt-2 font-['Satoshi'] text-sm text-neutral-500">We will review it and let you know when it is published.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border-2 border-neutral-900 bg-white p-8 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
      <div className="mb-2 font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-violet-600">Request a Report</div>
      <h3 className="mb-1 font-['Clash_Display'] text-2xl font-bold text-neutral-900">
        What should we research next?
      </h3>
      <p className="mb-6 font-['Satoshi'] text-sm text-neutral-500">
        Tell us which job market, industry, or role you want data on. We review every request and publish the most-requested ones.
      </p>

      <div className="mb-4">
        <label className="mb-1.5 block font-['Satoshi'] text-sm font-semibold text-neutral-800">
          What would you like us to research? <span className="text-red-500">*</span>
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Software engineering salaries in Bengaluru, Data science internships in India, MBA vs direct hire for finance..."
          required
          maxLength={500}
          rows={3}
          className="w-full resize-none rounded-xl border-2 border-neutral-900 bg-neutral-50 px-4 py-3 font-['Satoshi'] text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        />
        <div className="mt-1 text-right font-['Satoshi'] text-xs text-neutral-400">{topic.length}/500</div>
      </div>

      <div className="mb-6">
        <label className="mb-1.5 block font-['Satoshi'] text-sm font-semibold text-neutral-800">
          Email <span className="text-neutral-400 font-normal">(optional — we will notify you when it is live)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          maxLength={200}
          className="w-full rounded-xl border-2 border-neutral-900 bg-neutral-50 px-4 py-3 font-['Satoshi'] text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        />
      </div>

      {state === "error" && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 font-['Satoshi'] text-sm text-red-700">{errorMsg}</div>
      )}

      <button
        type="submit"
        disabled={state === "loading" || !topic.trim()}
        className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-neutral-900 bg-violet-500 font-['Satoshi'] text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] disabled:opacity-60 disabled:pointer-events-none"
      >
        {state === "loading" ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}

export default function Reports() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-50">
        {/* Hero */}
        <section className="border-b-2 border-neutral-900 bg-white px-4 py-16 md:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-neutral-900 bg-violet-500 px-4 py-1.5 font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
              Studojo Research
            </div>
            <h1 className="font-['Clash_Display'] text-4xl font-bold leading-tight text-neutral-900 md:text-5xl">
              Market Reports
            </h1>
            <p className="mt-4 max-w-2xl font-['Satoshi'] text-lg text-neutral-600">
              Data-driven analyses of job markets, salary benchmarks, and hiring trends for students across India and beyond. No fluff. Just the numbers that matter.
            </p>
          </div>
        </section>

        {/* Reports grid */}
        <section className="mx-auto max-w-5xl px-4 py-12 md:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {REPORTS.map((report) => (
              <Link
                key={report.slug}
                to={`/reports/${report.slug}`}
                className="group flex flex-col rounded-2xl border-2 border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
              >
                {/* Card top */}
                <div className={`${report.color} rounded-t-xl border-b-2 border-neutral-900 p-6`}>
                  <div className="flex items-start justify-between">
                    <span className="rounded-full border-2 border-white/40 bg-white/20 px-3 py-1 font-['Satoshi'] text-xs font-bold text-white">
                      {report.category}
                    </span>
                    {report.badge && (
                      <span className="rounded-full border-2 border-neutral-900 bg-amber-400 px-3 py-1 font-['Satoshi'] text-xs font-bold text-neutral-900">
                        {report.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-6 font-['Satoshi'] text-xs font-semibold uppercase tracking-widest text-white/70">
                    {report.findings} findings · {report.subtitle}
                  </div>
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-['Clash_Display'] text-lg font-bold leading-snug text-neutral-900">
                    {report.title}
                  </h2>
                  <p className="mt-2 flex-1 font-['Satoshi'] text-sm leading-relaxed text-neutral-600">
                    {report.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-['Satoshi'] text-xs text-neutral-400">{report.date}</span>
                    <span className="font-['Satoshi'] text-sm font-semibold text-violet-600 group-hover:underline">
                      Read report →
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Coming soon placeholder */}
            <div className="flex flex-col rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 opacity-60">
              <div className="mb-3 font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-neutral-400">
                Coming soon
              </div>
              <h2 className="font-['Clash_Display'] text-lg font-bold text-neutral-400">
                PM Roles in Bangalore 2026
              </h2>
              <p className="mt-2 font-['Satoshi'] text-sm text-neutral-400">
                5,200+ open PM roles. Salary data, AI skill premiums, and where to actually apply.
              </p>
            </div>

            <div className="flex flex-col rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 opacity-60">
              <div className="mb-3 font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-neutral-400">
                Coming soon
              </div>
              <h2 className="font-['Clash_Display'] text-lg font-bold text-neutral-400">
                Marketing Internships: India 2026
              </h2>
              <p className="mt-2 font-['Satoshi'] text-sm text-neutral-400">
                Where the good roles actually are, what they pay, and why 90% of students apply to the wrong ones.
              </p>
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="border-t-2 border-neutral-900 bg-violet-500 px-4 py-14 text-center">
          <h2 className="font-['Clash_Display'] text-3xl font-bold text-white md:text-4xl">
            Find the roles these reports talk about.
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-['Satoshi'] text-base text-white/80">
            Use the Studojo Outreach tool to discover and apply to niche finance, PM, and marketing roles across India. ATS resume builder included.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/outreach"
              className="flex h-12 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-white px-8 font-['Satoshi'] text-sm font-bold text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
            >
              Browse Internships
            </Link>
            <Link
              to="/dojos/careers"
              className="flex h-12 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/10 px-8 font-['Satoshi'] text-sm font-bold text-white transition hover:bg-white/20"
            >
              Build Your Resume Free
            </Link>
          </div>
        </section>

        {/* Request a report */}
        <section className="mx-auto max-w-5xl px-4 py-16 md:px-8">
          <div className="mx-auto max-w-2xl">
            <RequestForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
