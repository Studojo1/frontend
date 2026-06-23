import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Studojo Career Toolkit | Studojo" },
    { name: "description", content: "Every Studojo tool in one place — Career Coach, Internship Dojo, and Resume Maker. Everything you need to land the job, free." },
    { name: "robots", content: "index, follow" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/toolkit` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "The Studojo Career Toolkit" },
    { property: "og:description", content: "Four tools. One goal: get you hired. Everything from the webinar, ready to use now." },
    { property: "og:url", content: `${BASE_URL}/toolkit` },
    { property: "og:site_name", content: "Studojo" },
  ];
}

const TOOLS = [
  {
    badge: "START HERE",
    name: "Career Coach",
    tagline: "Know where you stand. Get a plan.",
    desc: "Have a real conversation about your career. The coach builds an honest picture of your strengths, your gaps, and the exact actions that move you forward. Most students skip this — and stay stuck.",
    cta: "Talk to your coach",
    href: "/cc",
    accent: "bg-violet-500",
  },
  {
    badge: "FIX THE FOUNDATION",
    name: "Resume Maker",
    tagline: "An ATS-ready resume in minutes. Free.",
    desc: "Build a clean, recruiter-friendly resume that actually gets past the filters. Having it ready means you can act on every opportunity the moment you find it.",
    cta: "Build your resume",
    href: "/resume-maker",
    accent: "bg-blue-500",
  },
  {
    badge: "REACH REAL OPENINGS",
    name: "Internship Dojo",
    tagline: "Real internships worth applying to.",
    desc: "A free board of genuine internships, not the same recycled listings. See what's actually out there for your stage and field, and apply with a resume that's ready to go.",
    cta: "Browse internships",
    href: "/dojos/internships",
    accent: "bg-amber-500",
  },
];

const STEPS = [
  { n: "1", title: "Coach: find your gaps", body: "Start with the Career Coach. Get your honest readiness score and the priority actions that matter most." },
  { n: "2", title: "Resume: fix the foundation", body: "Build or sharpen your resume so it's ready to send the moment an opportunity shows up." },
  { n: "3", title: "Internship Dojo: reach openings", body: "Find real internships and apply with a profile that's genuinely ready — not rushed." },
];

export default function Toolkit() {
  return (
    <div className="min-h-screen bg-neutral-50 font-['Satoshi']">
      <Header />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-10 text-center">
        <span className="inline-block bg-violet-100 text-violet-700 text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border-2 border-neutral-900 mb-6">
          Your webinar toolkit
        </span>
        <h1 className="font-['Clash_Display'] text-4xl sm:text-6xl font-extrabold text-neutral-900 leading-[1.05]">
          The Studojo<br />Career Toolkit
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
          Three tools. One goal: get you hired. Everything we covered in the webinar, ready to use now — and it's all free.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/cc" className="inline-flex items-center gap-2 bg-violet-500 text-white font-bold px-7 py-3.5 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all">
            Start with the Career Coach →
          </a>
          <a href="/playbook" className="inline-flex items-center gap-2 bg-white text-neutral-900 font-bold px-7 py-3.5 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all">
            Read the playbook 📕
          </a>
        </div>
      </section>

      {/* TOOL CARDS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
        <h2 className="font-['Clash_Display'] text-sm font-bold tracking-widest uppercase text-neutral-500 mb-5">Pick your starting point</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TOOLS.map((t) => (
            <div key={t.name} className="flex flex-col rounded-[24px] border-2 border-neutral-900 bg-white p-7 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]">
              <span className={`self-start text-[10px] font-bold tracking-widest uppercase text-white px-2.5 py-1 rounded-full ${t.accent} border-2 border-neutral-900 mb-4`}>
                {t.badge}
              </span>
              <h3 className="font-['Clash_Display'] text-2xl font-extrabold text-neutral-900">{t.name}</h3>
              <p className="text-neutral-900 font-semibold mt-1">{t.tagline}</p>
              <p className="text-neutral-600 mt-3 flex-1 leading-relaxed">{t.desc}</p>
              <a href={t.href} className="mt-6 inline-flex items-center justify-center gap-2 bg-neutral-900 text-white font-bold px-5 py-3 rounded-2xl border-2 border-neutral-900 hover:bg-violet-500 transition-colors">
                {t.cta} →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 3-STEP PLAYBOOK */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-[32px] border-2 border-neutral-900 bg-violet-50 p-8 sm:p-10 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]">
          <h2 className="font-['Clash_Display'] text-3xl font-extrabold text-neutral-900 text-center">The 3-step playbook</h2>
          <p className="text-neutral-600 text-center mt-2 max-w-xl mx-auto">Don't try to do everything at once. Follow the order — it's how the students who actually get hired use these tools.</p>
          <div className="grid sm:grid-cols-3 gap-6 mt-8">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[20px] border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <div className="w-10 h-10 rounded-full bg-neutral-900 text-white font-extrabold flex items-center justify-center mb-4">{s.n}</div>
                <h3 className="font-['Clash_Display'] text-lg font-bold text-neutral-900">{s.title}</h3>
                <p className="text-neutral-600 mt-2 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="/playbook" className="inline-flex items-center gap-2 bg-violet-500 text-white font-bold px-7 py-3.5 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all">
              Read the full playbook 📕
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 text-center">
        <h2 className="font-['Clash_Display'] text-4xl font-extrabold text-neutral-900">Start now. It's free.</h2>
        <p className="text-neutral-600 mt-3">The fastest path to your first interview is starting today, not after the webinar.</p>
        <a href="/cc" className="mt-6 inline-flex items-center gap-2 bg-neutral-900 text-white font-bold px-8 py-4 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(124,58,237,1)] transition-all">
          Open the Career Coach →
        </a>
      </section>

      <Footer />
    </div>
  );
}
