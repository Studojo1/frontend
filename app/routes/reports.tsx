import { useState } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Career Market Reports – Studojo | Data-Driven Analyses for Students" },
    {
      name: "description",
      content:
        "Free career market reports for students. Entry-level salary benchmarks, hiring trends, skill gaps, and job data across Finance, Sales, CS, and more — India 2026.",
    },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Career Market Reports – Studojo" },
    { property: "og:description", content: "Free career market reports for students. Entry-level salary benchmarks, hiring trends, and skill gaps across Finance, Sales, CS, and more." },
    { property: "og:url", content: `${BASE_URL}/reports` },
    { property: "og:site_name", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Career Market Reports – Studojo" },
    { name: "twitter:description", content: "Free career market reports for students. Entry-level salary benchmarks, hiring trends, and skill gaps across Finance, Sales, CS, and more." },
  ];
}

type ReportType = "Sector" | "Internships" | "Cities" | "Colleges" | "Hiring Calendar";

const TYPE_COLORS: Record<ReportType, string> = {
  "Sector":          "bg-blue-500",
  "Internships":     "bg-amber-500",
  "Cities":          "bg-emerald-500",
  "Colleges":        "bg-violet-500",
  "Hiring Calendar": "bg-orange-500",
};

const REPORTS = [
  {
    slug: "ops-india-2026",
    title: "Operations Interns in India: The Skill Gap Nobody Talks About",
    subtitle: "Q1 2026",
    excerpt:
      "12,400+ ops intern openings. Only 19% of applicants work-ready. The Excel crisis, the SOP gap, and why Notion fluency is now the deciding factor in ops intern hiring across India.",
    category: "Operations",
    type: "Sector" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "internships-ai-india-2026",
    title: "How Internships Are Changing Post-AI",
    subtitle: "Q1 2026",
    excerpt:
      "48% of applicants were ghosted last year. AI/ML intern stipends now run 3x higher than traditional roles. Here is what is actually shifting in internship hiring, which categories are collapsing, and what the AI-era intern looks like.",
    category: "Internships",
    type: "Internships" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "cs-india-2026",
    title: "CS in India: What Freshers Are Actually Getting Into",
    subtitle: "Q1 2026",
    excerpt:
      "135,000 IT hires projected for FY26. A 12x salary gap at Year 0 based purely on which company you join. And the one skill gap (DSA fluency) keeping 94.5% of engineering graduates out of the roles worth having.",
    category: "Tech",
    type: "Sector" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "sales-india-2026",
    title: "Sales in India: What Freshers Actually Face",
    subtitle: "Q1 2026",
    excerpt:
      "28,600+ entry-level openings. A ₹12 LPA ceiling that almost nobody in their first year reaches. And the one skill gap (CRM fluency) that ends 60% of sales interviews before they start.",
    category: "Sales",
    type: "Sector" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "",
  },
  {
    slug: "finance-india-2026",
    title: "Finance in India: What Graduates Actually Face",
    subtitle: "Q1 2026",
    excerpt:
      "1,400+ entry-level openings. A 20 LPA ceiling at global banks that almost nobody reaches. And the one skill gap that sends 75% of finance graduates home before the first round.",
    category: "Finance",
    type: "Sector" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "",
  },
  {
    slug: "marketing-india-2026",
    title: "Marketing Internships in India: Where the Good Roles Actually Are",
    subtitle: "Q1 2026",
    excerpt:
      "22,000+ listings. A 6x stipend gap between niche and generic roles. And the reason 90% of students apply to the wrong ones — and get nothing back.",
    category: "Marketing",
    type: "Sector" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "pune-jobs-2026",
    title: "Pune's Job Market in 2026: What Students Are Actually Walking Into",
    subtitle: "Q1 2026",
    excerpt:
      "4,800+ openings. A 3x salary gap between niche and generic roles. And why Hinjewadi isn't the only game in town anymore.",
    category: "City Report",
    type: "Cities" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "internships-15k-india-2026",
    title: "Roles That Land You Above ₹15k: The Internship Map India 2026",
    subtitle: "Q2 2026",
    excerpt: "48 roles mapped across 8 domains. Which categories own the ₹30k+ bracket, which skills unlock the floor, and which roles will never pay ₹15k no matter who you are.",
    category: "Internships",
    type: "Internships" as ReportType,
    date: "April 2026",
    findings: 3,
    badge: "New",
  },
  {
    slug: "flame-marketing-2026",
    title: "Flame University & Marketing Roles: Where Flame Grads Actually Land",
    subtitle: "Q1 2026",
    excerpt:
      "7 role tracks. A 1.7x salary gap between campus and off-campus. And the one skill that moves a Flame grad into the top 20% of marketing applicants immediately.",
    category: "Colleges",
    type: "Colleges" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "hiring-calendar-india-2026",
    title: "India Hiring Calendar 2026: Which Companies Hire in Which Month",
    subtitle: "Q2 2026",
    excerpt:
      "80+ companies mapped with exact application windows. HUL opens 8 months before start. Goldman opens in August for a March internship. Miss the window and you wait a year.",
    category: "Hiring Calendar",
    type: "Hiring Calendar" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "internships-germany-2026",
    title: "Do Interns in Germany Get Paid? Stipends, Laws and What to Expect",
    subtitle: "Q1 2026",
    excerpt:
      "Germany's minimum wage is EUR 13.90/hour from Jan 2026 but mandatory internships are legally exempt. DAX 40 companies pay EUR 1,500 to 3,000/month. The exact rules, city data, and how international students qualify.",
    category: "Cities",
    type: "Cities" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "internships-uk-2026",
    title: "Do Interns in the UK Get Paid? NLW Rules, Sector Rates and What to Expect",
    subtitle: "Q1 2026",
    excerpt:
      "The UK National Living Wage hits £12.71/hr in April 2026 and applies to most interns — unpaid placements are largely illegal. Goldman pays £5,000/month. Here's what every sector actually pays and how to get in.",
    category: "Cities",
    type: "Cities" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "internships-australia-2026",
    title: "Do Interns in Australia Get Paid? Minimum Wage, Sector Rates and How to Apply",
    subtitle: "Q1 2026",
    excerpt:
      "Australia's minimum wage is AUD $24.95/hr from July 2025 and unpaid internships are tightly regulated under the Fair Work Act. Canva pays AUD $90,000+ annualised. Here's what the market actually looks like.",
    category: "Cities",
    type: "Cities" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
];

const FILTERS: Array<"All" | ReportType> = ["All", "Sector", "Internships", "Cities", "Colleges", "Hiring Calendar"];

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
  const [activeFilter, setActiveFilter] = useState<"All" | ReportType>("All");
  const visibleReports = activeFilter === "All" ? REPORTS : REPORTS.filter((r) => r.type === activeFilter);

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

        {/* Filter tabs */}
        <section className="border-b-2 border-neutral-900 bg-white px-4 md:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="flex gap-1 overflow-x-auto py-3">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`whitespace-nowrap rounded-full border-2 px-4 py-1.5 font-['Satoshi'] text-sm font-semibold transition-colors ${
                    activeFilter === f
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400 hover:text-neutral-900"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Reports grid */}
        <section className="mx-auto max-w-5xl px-4 py-12 md:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleReports.map((report) => (
              <Link
                key={report.slug}
                to={`/reports/${report.slug}`}
                className="group flex flex-col rounded-2xl border-2 border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
              >
                {/* Card top */}
                <div className={`${TYPE_COLORS[report.type]} rounded-t-xl border-b-2 border-neutral-900 p-6`}>
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

            {/* Coming soon placeholder 2 */}
            <div className="flex flex-col rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 opacity-60">
              <div className="mb-3 font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-neutral-400">
                Coming soon
              </div>
              <h2 className="font-['Clash_Display'] text-lg font-bold text-neutral-400">
                Data Science & Analytics Roles India 2026
              </h2>
              <p className="mt-2 font-['Satoshi'] text-sm text-neutral-400">
                Entry-level salaries, skill gaps, and which companies actually hire freshers into real data roles.
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
