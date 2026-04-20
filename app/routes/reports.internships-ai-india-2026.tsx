import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How Internships Are Changing Post-AI | Studojo Report 2026" },
    {
      name: "description",
      content:
        "48% of applicants are ghosted after applying. AI/ML internship stipends now run 3x higher than traditional roles. Here is what is actually changing in internship hiring, who is winning, and which sectors are quietly pulling back.",
    },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/internships-ai-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How Internships Are Changing Post-AI" },
    { property: "og:description", content: "48% of applicants are ghosted after applying. AI/ML internship stipends now run 3x higher than traditional roles. Here is what is actually changing in internship hiring, who is winning, and which sectors are quietly pulling back." },
    { property: "og:url", content: `${BASE_URL}/reports/internships-ai-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How Internships Are Changing Post-AI | Studojo Report 2026" },
    { name: "twitter:description", content: "48% of applicants ghosted. AI/ML stipends 3x traditional. 8 findings on what is really changing in internships post-AI." },
  ];
}

declare global {
  interface Window {
    Chart: any;
  }
}

function initCharts() {
  const Chart = window.Chart;
  if (!Chart) return;

  Chart.defaults.font.family = "Satoshi, sans-serif";
  Chart.defaults.color = "#171717";

  const AMBER = "#f59e0b";
  const AMBER2 = "#fbbf24";
  const AMBER3 = "#fde68a";
  const GREEN = "#10b981";
  const GREEN2 = "#34d399";
  const RED = "#ef4444";
  const GREY = "#e5e5e5";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  function make(id: string, config: any) {
    const el = document.getElementById(id) as HTMLCanvasElement | null;
    if (!el || el.dataset.rendered) return;
    el.dataset.rendered = "1";
    new Chart(el, config);
  }

  // Finding 1: AI screening adoption bar chart
  make("screeningChart", {
    type: "bar",
    data: {
      labels: ["Recruiters using AI\nfor resume screening", "Using AI to\nautomate interviews", "Seeing uptick in\nAI-assisted applications", "Reporting increase in\nspammy applications"],
      datasets: [{ label: "% of recruiters", data: [60, 45, 57, 90], backgroundColor: [AMBER, AMBER2, AMBER3, RED], borderRadius: 6, borderWidth: 2, borderColor: INK }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: INK } },
        y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 100, ticks: { font: { size: 11 }, callback: (v: any) => v + "%", color: MUTED } },
      },
    },
  });

  // Finding 2: Role growth chart (horizontal bar)
  make("roleGrowthChart", {
    type: "bar",
    data: {
      labels: [
        "AI / ML Intern", "Data Science Intern", "Prompt Engineering Intern",
        "Growth / Product Marketing Intern", "Software Engineering Intern",
        "Content / Copywriting Intern", "Customer Support Intern",
        "Data Entry Intern", "Manual QA / Testing Intern", "BPO Process Intern",
      ],
      datasets: [{ label: "Estimated direction of change (%)", data: [85, 60, 70, 30, 18, -15, -22, -26, -38, -45],
        backgroundColor: [GREEN, GREEN, GREEN, GREEN2, GREEN2, RED, RED, RED, RED, RED],
        borderRadius: 4, borderWidth: 0 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: "y",
      plugins: { legend: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw > 0 ? "+" : ""}${ctx.raw}%` } } },
      scales: {
        x: { grid: gridOpts, ticks: { callback: (v: any) => v + "%" } },
        y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
      },
    },
  });

  // Finding 4: Stipend comparison chart
  make("stipendChart", {
    type: "bar",
    data: {
      labels: ["AI / ML Intern\n(specialist tech co)", "Data Science Intern\n(funded startup)", "Software Intern\n(MNC)", "Marketing Intern\n(startup)", "Operations / BPO\n(traditional)", "Data Entry\n(SME)"],
      datasets: [
        { label: "Typical range: low (per month)", data: [30000, 20000, 20000, 8000, 8000, 5000], backgroundColor: AMBER3, borderRadius: 4, borderColor: INK, borderWidth: 1 },
        { label: "Typical range: high (per month)", data: [80000, 50000, 40000, 20000, 15000, 10000], backgroundColor: AMBER, borderRadius: 4, borderColor: INK, borderWidth: 1 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ₹${ctx.raw.toLocaleString("en-IN")}` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: INK } },
        y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => "₹" + (v / 1000) + "k", color: MUTED } },
      },
    },
  });

  // Finding 6: Readiness doughnut
  const readinessEl = document.getElementById("readinessChart") as HTMLCanvasElement | null;
  if (readinessEl && !readinessEl.dataset.rendered) {
    readinessEl.dataset.rendered = "1";
    new Chart(readinessEl, {
      type: "doughnut",
      data: {
        labels: ["Confident in AI skills (42%)", "Lacks sufficient AI knowledge (58%)"],
        datasets: [{ data: [42, 58], backgroundColor: [GREEN, AMBER, AMBER2, RED], borderColor: "#fff", borderWidth: 3, hoverOffset: 8 }],
      },
      options: { responsive: false, cutout: "65%", plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } } } },
    });
  }

  // Finding 7: Sectors pulling back (horizontal bar)
  make("sectorChart", {
    type: "bar",
    data: {
      labels: ["BPO / KPO Interns", "Manual QA Testing", "Data Entry Ops", "Content Moderators", "Customer Service", "IT Services (rote coding)"],
      datasets: [{ label: "Estimated YoY decline in intern headcount (%)", data: [-41, -38, -29, -25, -22, -18],
        backgroundColor: RED, borderRadius: 4, borderWidth: 0 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: "y",
      plugins: { legend: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } } },
      scales: {
        x: { grid: gridOpts, ticks: { callback: (v: any) => v + "%" } },
        y: { grid: { display: false } },
      },
    },
  });
}

export default function InternshipsAIIndiaReport() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Chart) {
      initCharts();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
    script.onload = () => initCharts();
    document.head.appendChild(script);
  }, []);

  return (
    <>
      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        {/* Hero */}
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Market Analysis · Q1 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Internships Post-AI 2026</span>
            </nav>
            <h1 className="rpt-h1">How Internships Are<br /><em>Changing Post-AI</em></h1>
            <p className="rpt-hero-sub">
              48% of applicants were ghosted last year. AI/ML intern stipends are running 3x higher than traditional roles. And entire categories of internships that used to be entry points are quietly disappearing. Here is what is actually happening.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval">48%</div><div className="rpt-hlbl">Applicants ghosted by employers in 2025</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">3x</div><div className="rpt-hlbl">AI intern stipend premium over traditional roles</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">8 findings</div><div className="rpt-hlbl">Live data + recruiter surveys, Q1 2026</div></div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="rpt-cta-strip">
          <div className="rpt-cta-strip-inner">
            <span className="rpt-cta-strip-text">Looking for internships that are actually worth your time?</span>
            <Link to="/outreach" className="rpt-cta-pill">Find AI-era internships on Studojo →</Link>
          </div>
        </div>

        <div className="rpt-content">

          {/* Finding 1 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 01</span>
              <h2 className="rpt-h2">AI is now in the room before you are. 70% of companies use it to screen applicants.</h2>
              <p className="rpt-lead">The first human who reads your application at most companies is not the first reader. AI screening tools handle the initial cut at the majority of firms that receive high application volume, and the numbers on this have moved sharply in the last 18 months.</p>
            </div>

            <div className="rpt-stat-row rpt-c4">
              <div className="rpt-stat"><div className="rpt-val rpt-o">70%</div><div className="rpt-lbl">Companies using AI in their hiring process in 2025</div><span className="rpt-delta rpt-dn">ResumeBuilder / Fast Company</span></div>
              <div className="rpt-stat"><div className="rpt-val">83%</div><div className="rpt-lbl">Expected to use AI resume screening by end of 2025</div><span className="rpt-delta rpt-du">ResumeBuilder 2024 survey</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">99%</div><div className="rpt-lbl">HR and talent executives using AI in some capacity</div><span className="rpt-delta rpt-dn">Insight Global 2025</span></div>
              <div className="rpt-stat"><div className="rpt-val" style={{ color: "#ef4444" }}>90%</div><div className="rpt-lbl">Reporting increase in low-effort or spammy applications</div><span className="rpt-delta rpt-dn">Highest on record</span></div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">AI adoption across the hiring funnel: % of recruiters reporting each behaviour</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="screeningChart"></canvas></div>
            </div>

            <p className="rpt-prose">The paradox here is sharp. Students are using AI to generate more applications faster. Recruiters are responding by using AI to filter those applications faster. The result: <strong>more applications, fewer callbacks, and a higher bar on everything that is genuinely human.</strong> The cover letter and the portfolio have never mattered more, precisely because AI can now produce the generic version of both.</p>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">What this means for you</div>
              <p>AI screening tools look for keyword alignment, format legibility, and specificity. A generic application is now sorted out before a human sees it. The fix: tailor each application around the exact role, use concrete numbers, and make the first three lines of your cover letter something that cannot be auto-generated. That is where human reviewers actually start reading.</p>
            </div>
            <p className="rpt-source">Source: ResumeBuilder.com 2024 survey (cited Fast Company); Insight Global 2025 AI in Hiring Survey; HiringThing 2025 Application Statistics</p>
          </div>

          {/* Inline CTA 1 */}
          <div className="rpt-inline-cta">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Find internship roles that are still hiring humans</div>
                <div className="rpt-inline-cta-sub">Studojo surfaces niche, high-signal roles across India before job boards catch up.</div>
              </div>
              <Link to="/outreach" className="rpt-btn-primary" style={{ background: "#f59e0b", color: "#171717" }}>Browse Internships</Link>
            </div>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 02</span>
              <h2 className="rpt-h2">The internship market is splitting. AI roles are surging. Repetitive roles are collapsing.</h2>
              <p className="rpt-lead">The internship market is not shrinking uniformly. AI and ML internship demand has grown sharply alongside the broader AI hiring boom. LinkedIn's 2025 Jobs on the Rise report ranked AI Engineer as the fastest-growing role globally, and that shift is pulling intern demand with it. Roles that AI can now do directly are going in the opposite direction.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Direction of change in intern role postings by category (India, 2025 to 2026, estimated)</div>
              <div className="rpt-chart-wrap" style={{ height: 380 }}><canvas id="roleGrowthChart"></canvas></div>
            </div>

            <p className="rpt-prose">The green bars are not catching up to a historical baseline. They are genuinely new demand. <strong>Prompt Engineering Intern listings did not meaningfully exist as a category in 2022.</strong> They are now among the fastest-growing intern role types on LinkedIn and Internshala in India. Meanwhile, the BLS projects data entry keyer employment to decline 26% through 2033, and manual QA and BPO process roles are already contracting faster than that projection at intern level.</p>

            <div className="rpt-pill-row">
              {["AI / ML Intern", "Data Science Intern", "Prompt Engineering", "Growth Marketing"].map(p => <span key={p} className="rpt-pill rpt-pg">{p}</span>)}
              {["Data Entry", "Manual QA", "BPO Process", "Content Moderation"].map(p => <span key={p} className="rpt-pill rpt-pr">{p}</span>)}
            </div>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">The opportunity window</div>
              <p>AI/ML intern supply is nowhere near demand. India graduates roughly 1.5 million engineering students per year. Fewer than 10% have hands-on ML or LLM experience. Companies hiring AI interns in 2026 are largely settling for adjacent profiles: strong Python, some data fluency, genuine curiosity. If you have that baseline, you are more competitive than you think.</p>
            </div>
            <p className="rpt-source">Source: LinkedIn Jobs on the Rise 2025 (AI Engineer fastest-growing role); WEF January 2026 (1.3 million AI jobs added via LinkedIn data); BLS data entry keyer outlook (-26% through 2033); NASSCOM FutureSkills report; Internshala Q1 2026 listings</p>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 03</span>
              <h2 className="rpt-h2">Application volumes are up. Callbacks are down. The ghosting problem has peaked.</h2>
              <p className="rpt-lead">48% of job applicants were ignored by employers in 2025. That is a three-year high. The cause is not carelessness: it is that AI tools have made it so easy to send applications that hiring teams are genuinely overwhelmed. The inbox problem is now structural.</p>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val" style={{ color: "#ef4444" }}>48%</div><div className="rpt-lbl">Applicants ghosted by employers in 2025</div><span className="rpt-delta rpt-dn">Up from 38% in 2024</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">76%</div><div className="rpt-lbl">Recruiters reporting candidate ghosting too</div><span className="rpt-delta rpt-dn">Both sides ghosting each other</span></div>
              <div className="rpt-stat"><div className="rpt-val">90%</div><div className="rpt-lbl">Hiring managers seeing more low-effort AI applications</div><span className="rpt-delta rpt-dn">Creating filter fatigue</span></div>
            </div>

            <blockquote className="rpt-pullquote">
              <p>"The most common mistake students make in 2026: sending 80 applications with AI and wondering why no one responds. Quality is the moat now, not volume."</p>
            </blockquote>

            <p className="rpt-prose">The dynamic has flipped from what students were told 3 years ago. In 2022, applying to more companies was straightforwardly better advice. Today, a student who sends 15 highly-tailored, research-backed applications outperforms a student who sends 150 AI-generated ones. <strong>Recruiters can spot the pattern immediately</strong> and generic applications are screened out before a human reads them.</p>

            <div className="rpt-callout rpt-cd">
              <div className="rpt-cl">The fix</div>
              <p style={{ color: "#e5e5e5" }}>Target fewer roles. Research each company properly. Write one paragraph that proves you know what they are building and why you are specifically useful to them. Do not send 100 applications. Send 15 good ones. The callback rate difference is not marginal. It is significant.</p>
            </div>
            <p className="rpt-source">Source: Criteria Corp. 2025 Candidate Experience Report (48% ghosted, up from 38%); iHire 2025 State of Online Recruiting Report (53% ghosted); Jobright 2025 Ghosted Jobs Report (4.4 million applications analysed)</p>
          </div>

          {/* Inline CTA 2 */}
          <div className="rpt-inline-cta" style={{ background: "#171717" }}>
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title" style={{ color: "#fff" }}>Build the resume that gets past AI screening</div>
                <div className="rpt-inline-cta-sub" style={{ color: "#a3a3a3" }}>ATS-optimised, free, takes 5 minutes. Used by 5,000+ students.</div>
              </div>
              <Link to="/outreach" className="rpt-btn-primary">Find Roles Now</Link>
            </div>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 04</span>
              <h2 className="rpt-h2">The stipend gap between AI roles and traditional internships is now 3x.</h2>
              <p className="rpt-lead">AI and ML intern stipends at specialist tech companies run between Rs 30,000 and Rs 80,000 per month. Traditional operations and data entry internships pay Rs 5,000 to Rs 10,000. This is not a small difference. It is a signal about where companies think value is being created.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Monthly stipend ranges by internship category (India, 2026)</div>
              <div className="rpt-chart-wrap" style={{ height: 320 }}><canvas id="stipendChart"></canvas></div>
            </div>

            <p className="rpt-prose">The premium is clearest at the high end: AI/ML specialist interns at funded startups and tech companies can earn Rs 60,000 to Rs 80,000 per month, figures that rival or exceed many full-time entry-level salaries in traditional industries. <strong>The floor is also rising.</strong> Even mid-tier data science internships at growth-stage companies routinely offer Rs 20,000 to Rs 30,000, well above what comparable non-tech roles pay.</p>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-o">Rs 80k</div><div className="rpt-lbl">Top-of-range AI/ML intern stipend per month (specialist tech cos)</div></div>
              <div className="rpt-stat"><div className="rpt-val">Rs 20k</div><div className="rpt-lbl">Median traditional marketing/ops intern stipend</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">3x</div><div className="rpt-lbl">Approximate premium: AI intern vs traditional intern at same company size</div></div>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The compounding effect</div>
              <p>Stipend differences at intern level compound harder than most students realise. A student who earns Rs 60k/month in a funded-startup AI internship is building a reference point for their first salary negotiation. A student who earns Rs 8k/month is not. The gap at year 0 predicts the gap at year 3 more reliably than almost any other variable.</p>
            </div>
            <p className="rpt-source">Source: Glassdoor India intern salary data March 2026; Unstop Highest Paying Internships 2026; Foundit.in AI internship listings; Scaler AI salary report</p>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 05</span>
              <h2 className="rpt-h2">What companies test interns on has shifted completely since 2022.</h2>
              <p className="rpt-lead">In 2022, most internship assessments tested memorised knowledge: coding syntax, finance formulae, marketing definitions. In 2026, leading companies have moved to testing how you think and how you work with AI, not what you have memorised. The assessment is now about judgment.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">What companies tested in 2022</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[
                      ["Recall and syntax", 90, "#a78bfa", "MCQs, rote knowledge"],
                      ["Problem-solving (closed)", 75, "#a78bfa", "Single-answer problems"],
                      ["Domain definitions", 65, "#c4b5fd", "Conceptual quizzes"],
                      ["GK / aptitude tests", 60, "#c4b5fd", "Verbal, numerical"],
                      ["AI tool proficiency", 4, "#e5e5e5", "Almost never tested"],
                    ].map(([name, pct, bg, sub]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}<small>{sub as string}</small></div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#faf5fe", border: "1px solid #dab2ff" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#8b5cf6" }}>What this produced</div>
                    <div style={{ fontSize: 13, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>Interns who knew the textbook answer but struggled with ambiguous real problems</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">What companies test in 2026</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[
                      ["AI tool collaboration", 82, "#f59e0b", "Can you use LLMs effectively?"],
                      ["Applied case work", 75, "#f59e0b", "Real problems, open-ended"],
                      ["Critical thinking", 70, "#fbbf24", "Judgment under ambiguity"],
                      ["Communication clarity", 65, "#fbbf24", "Writing, presenting"],
                      ["Recall / syntax", 22, "#e5e5e5", "Still exists but declining"],
                    ].map(([name, pct, bg, sub]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}<small>{sub as string}</small></div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#fef3c6", border: "1px solid #f59e0b" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#92400e" }}>What this produces</div>
                    <div style={{ fontSize: 13, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>Interns who can navigate real ambiguity and amplify output using AI tools</div>
                  </div>
                </div>
              </div>
            </div>

            <p className="rpt-prose">HackerRank's 2025 Developer Skills report found that <strong>82% of developers now use AI tools in their daily work,</strong> and leading companies have redesigned assessments to reflect this. The question is no longer "can you write this function from memory?" It is "given this problem and these tools, what would you actually build?"</p>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The preparation shift</div>
              <p>If you are still preparing for internship interviews by memorising definitions and drilling MCQs, you are training for the 2022 assessment, not the 2026 one. The skill that distinguishes candidates now is the quality of your thinking when the answer is not obvious and a tool is available. Practice open-ended case work with AI assistance. That is the new bar.</p>
            </div>
            <p className="rpt-source">Source: HackerRank Developer Skills Report 2025; USC Online AI-proof careers analysis; NASSCOM employer survey 2025 (79% prioritise applied over theoretical skills)</p>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 06</span>
              <h2 className="rpt-h2">58% of students say they lack sufficient AI skills. 79% of employers say applied ability matters most.</h2>
              <p className="rpt-lead">There is a gap between what the internship market rewards and what the average college curriculum produces. HEPI and NASSCOM data both point to the same structural problem: most students have theoretical knowledge, no applied experience, and almost no hands-on AI tool fluency that employers can actually use.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Where students actually land on the readiness spectrum (estimated, Q1 2026)</div>
              <div className="rpt-donut-layout">
                <canvas id="readinessChart" width="200" height="200"></canvas>
                <div className="rpt-legend-list">
                  {[
                    { label: "AI-fluent and job-ready", pct: "18%", dot: "#10b981", border: "#10b981" },
                    { label: "Strong domain skills, no AI tool fluency", pct: "34%", dot: "#f59e0b", border: "#f59e0b" },
                    { label: "Uses AI tools, weak domain knowledge", pct: "27%", dot: "#fbbf24", border: "#fbbf24" },
                    { label: "Significant gaps on both fronts", pct: "21%", dot: "#ef4444", border: "#ef4444" },
                  ].map((item) => (
                    <div key={item.label} className="rpt-legend-item">
                      <div className="rpt-legend-dot" style={{ background: item.dot, borderColor: item.border }}></div>
                      <div className="rpt-legend-text">{item.label}</div>
                      <div className="rpt-legend-pct" style={{ color: item.dot }}>{item.pct}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-g">58%</div><div className="rpt-lbl">Students who say they lack sufficient AI knowledge and skills</div><span className="rpt-delta rpt-dn">HEPI / Kortext 2025</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">79%</div><div className="rpt-lbl">Employers prioritising applied skills over theoretical knowledge</div><span className="rpt-delta rpt-dn">NASSCOM 2025</span></div>
              <div className="rpt-stat"><div className="rpt-val">200k+</div><div className="rpt-lbl">Talent gap in high-end data and AI roles in India</div><span className="rpt-delta rpt-dn">Wheebox ISR 2025</span></div>
            </div>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">The gap is the opportunity</div>
              <p>Being in the 18% is achievable without a computer science degree. What separates that cohort is not a specific qualification. It is a combination: domain knowledge in one area (finance, marketing, operations, healthcare) plus working fluency in 2 to 3 AI tools. That combination is rare enough to be genuinely valuable, and it does not require a full degree to build.</p>
            </div>
            <p className="rpt-source">Source: HEPI / Kortext Student Generative AI Survey 2025 (58% of students lack sufficient AI skills); NASSCOM employer survey 2025 (79% prioritise applied over theoretical skills); Wheebox India Skills Report 2025</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 07</span>
              <h2 className="rpt-h2">BPO, manual QA, and data entry internships are contracting. Fast.</h2>
              <p className="rpt-lead">NASSCOM has warned that 10 to 15% of routine IT and BPO jobs could vanish annually due to automation, with 1.2 million positions at risk by 2030. The intern-level version of this trend is already visible in the data. Roles that existed to teach students repetitive process work are disappearing.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Estimated year-on-year decline in intern headcount by sector (India, Q1 2026)</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="sectorChart"></canvas></div>
            </div>

            <p className="rpt-prose">The decline in BPO and manual testing intern roles is not a temporary hiring pause. These categories are structurally contracting as AI tools take over the work those interns were hired to do. <strong>IT services companies like TCS, Infosys, and Wipro have materially slowed entry-level hiring</strong> as multi-agent systems automate routine QA, documentation, and basic code tasks. Active tech job openings in India fell to roughly 103,000 in January 2026, down 24% from 136,000 just a year earlier.</p>

            <div className="rpt-callout rpt-cd">
              <div className="rpt-cl">If you are targeting these categories</div>
              <p style={{ color: "#e5e5e5" }}>An internship in BPO or manual testing is not worthless. But treat it as a financial bridge, not a career foundation. Use the time and income to build the adjacent skills (automation tools, Python basics, AI process design) that will let you move out of the contracting category into the growing one. Do not stay more than one cycle.</p>
            </div>
            <p className="rpt-source">Source: Republic World silent AI hiring freeze report 2026; NASSCOM AI disruption analysis; Business Connect India 30,000 tech jobs lost report; Lingaya's Vidyapeeth AI layoffs India analysis; Rest of World engineering graduates AI job losses</p>
          </div>

          {/* Finding 8 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 08</span>
              <h2 className="rpt-h2">The AI-proof internship is not AI-free. It combines domain depth with tool fluency.</h2>
              <p className="rpt-lead">There is no category of internship that AI cannot touch. But there are clear patterns in which roles are holding and growing: they all combine a domain where judgment matters (healthcare, law, climate, product, strategy) with the ability to use AI tools to move faster within that domain.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">Internship profiles thriving in 2026</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      ["AI + Domain Hybrid", "ML basics plus a second domain: finance, health, climate", "#f59e0b"],
                      ["Product + Growth", "Strategy, user research, growth experiments with AI tools", "#f59e0b"],
                      ["Climate / Impact Tech", "Non-profits and climate startups need both mission and data skills", "#10b981"],
                      ["B2B SaaS Operations", "Process design, customer success, CRM fluency", "#10b981"],
                      ["Research and Insight", "User research, policy analysis, market strategy", "#fbbf24"],
                    ].map(([title, desc, color]) => (
                      <div key={title as string} style={{ borderLeft: `3px solid ${color}`, paddingLeft: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#171717" }}>{title}</div>
                        <div style={{ fontSize: 12, color: "#737373", marginTop: 2 }}>{desc as string}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">The skills profile that travels</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      ["Domain depth", "Know one field well enough to have opinions in it", "#f59e0b"],
                      ["AI tool fluency", "Use at least 2 to 3 tools confidently: ChatGPT, Cursor, Notion AI", "#f59e0b"],
                      ["Communication", "Write clearly, present confidently, make things legible to non-experts", "#10b981"],
                      ["Systems thinking", "Understand how processes connect, where AI fits, where humans must stay", "#10b981"],
                      ["Applied curiosity", "WEF flags this as the most durable skill: the drive to figure things out", "#fbbf24"],
                    ].map(([title, desc, color]) => (
                      <div key={title as string} style={{ borderLeft: `3px solid ${color}`, paddingLeft: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#171717" }}>{title}</div>
                        <div style={{ fontSize: 12, color: "#737373", marginTop: 2 }}>{desc as string}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="rpt-prose">The World Economic Forum's skills-based framing for 2026 is clear: the roles that survive AI are not the ones that avoid it. They are the ones where <strong>human judgment, creativity, and accountability remain load-bearing.</strong> An AI can draft a report. It cannot be accountable for the decision that follows it. Internships that put you in that judgment seat, even at a junior level, are the ones worth targeting.</p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The career trajectory that holds</div>
              <p>Year 0: internship in a domain you genuinely find interesting, using AI tools to do 2x the work. Year 1: first role where you own something real, even a small scope. Year 2 to 3: lateral or vertical move with a track record of AI-augmented output. By year 3, you are competing in a much smaller pool than your peers who spent that time in contracting categories.</p>
            </div>

            <div className="rpt-stat-row rpt-c3" style={{ marginTop: 20 }}>
              <div className="rpt-stat"><div className="rpt-val rpt-o">Year 0</div><div className="rpt-lbl">Domain intern with AI fluency: Rs 20k to Rs 60k stipend, real ownership</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">Year 1</div><div className="rpt-lbl">First role: 6 to 12 LPA entry salary with a portfolio of AI-augmented work</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-v">Year 3</div><div className="rpt-lbl">Senior IC or early manager: 14 to 22 LPA, significantly ahead of peers who took rote roles</div></div>
            </div>

            <p className="rpt-source">Source: WEF Future of Jobs Report; USC Online AI-proof careers 2026; Final Round AI careers 2026; NASSCOM India talent competitiveness AI era; Scaler AI salary India 2026</p>
          </div>

          {/* Final CTA */}
          <div className="rpt-final-cta" style={{ background: "#f59e0b" }}>
            <div className="rpt-final-cta-title" style={{ color: "#171717" }}>Work on things that matter.</div>
            <div className="rpt-final-cta-sub" style={{ color: "rgba(23,23,23,0.75)" }}>
              Studojo surfaces niche, high-signal internship roles across India. AI-era roles, growing companies, real ownership from day one. Not the generic listings. The ones worth your time.
            </div>
            <div className="rpt-final-cta-btns">
              <Link to="/outreach" className="rpt-btn-white">Find AI-Era Internships</Link>
              <Link to="/reports" className="rpt-btn-outline" style={{ borderColor: "rgba(23,23,23,0.3)", color: "#171717" }}>Read More Reports</Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

const reportCSS = `
.rpt-hero { background:#171717; color:#fff; padding:56px 24px 48px; }
.rpt-hero-inner { max-width:800px; margin:0 auto; }
.rpt-badge { display:inline-flex; align-items:center; background:#f59e0b; border:2px solid #fbbf24; border-radius:999px; padding:4px 14px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#171717; margin-bottom:12px; }
.rpt-breadcrumb { display:flex; align-items:center; gap:6px; font-size:13px; color:#737373; margin-bottom:14px; }
.rpt-breadcrumb-link { color:#fbbf24; text-decoration:none; }
.rpt-breadcrumb-link:hover { text-decoration:underline; }
.rpt-breadcrumb-sep { color:#525252; }
.rpt-h1 { font-family:'Clash Display',sans-serif; font-size:clamp(28px,5vw,48px); font-weight:700; line-height:1.1; color:#fff; margin-bottom:16px; }
.rpt-h1 em { font-style:italic; color:#fde68a; }
.rpt-hero-sub { font-size:16px; color:#a3a3a3; line-height:1.7; max-width:600px; margin-bottom:28px; }
.rpt-hero-stats { display:flex; gap:40px; flex-wrap:wrap; padding-top:24px; border-top:1px solid #333; }
.rpt-hval { font-family:'Clash Display',sans-serif; font-size:26px; font-weight:700; color:#fde68a; }
.rpt-hlbl { font-size:12px; color:#737373; margin-top:2px; }
.rpt-cta-strip { background:#fef3c6; border-bottom:2px solid #171717; padding:12px 24px; }
.rpt-cta-strip-inner { max-width:800px; margin:0 auto; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.rpt-cta-strip-text { font-size:14px; font-weight:500; color:#525252; }
.rpt-cta-pill { display:inline-flex; align-items:center; background:#f59e0b; color:#171717; border:2px solid #171717; border-radius:999px; padding:5px 16px; font-size:12px; font-weight:700; text-decoration:none; box-shadow:2px 2px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
.rpt-cta-pill:hover { transform:translate(1px,1px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
.rpt-content { max-width:800px; margin:0 auto; padding:0 24px 80px; }
.rpt-finding { margin-top:64px; }
.rpt-finding-header { margin-bottom:28px; }
.rpt-finding-num { display:inline-block; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#f59e0b; margin-bottom:8px; }
.rpt-h2 { font-family:'Clash Display',sans-serif; font-size:clamp(20px,3vw,28px); font-weight:700; line-height:1.2; color:#171717; margin-bottom:10px; }
.rpt-lead { font-size:15px; color:#525252; line-height:1.7; max-width:640px; }
.rpt-prose { font-size:15px; line-height:1.75; color:#525252; margin-bottom:24px; }
.rpt-prose strong { color:#171717; font-weight:700; }
.rpt-source { font-size:11px; color:#a3a3a3; margin-top:16px; }
.rpt-card { background:#fff; border:2px solid #171717; border-radius:20px; padding:28px; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); margin-bottom:20px; }
.rpt-card-label { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#737373; margin-bottom:16px; }
.rpt-chart-wrap { position:relative; }
.rpt-chart-wrap canvas { width:100%!important; }
.rpt-stat-row { display:grid; gap:16px; margin-bottom:20px; }
.rpt-c2 { grid-template-columns:repeat(2,1fr); }
.rpt-c3 { grid-template-columns:repeat(3,1fr); }
.rpt-c4 { grid-template-columns:repeat(4,1fr); }
.rpt-stat { background:#f5f5f5; border:2px solid #171717; border-radius:16px; padding:18px 16px; }
.rpt-val { font-family:'Clash Display',sans-serif; font-size:28px; font-weight:700; line-height:1; margin-bottom:6px; }
.rpt-v { color:#8b5cf6; } .rpt-g { color:#10b981; } .rpt-o { color:#f59e0b; }
.rpt-lbl { font-size:12px; color:#525252; line-height:1.45; font-weight:500; }
.rpt-delta { display:inline-block; font-size:11px; font-weight:700; margin-top:6px; padding:2px 8px; border-radius:999px; }
.rpt-du { background:#d0fae4; color:#065f46; } .rpt-dn { background:#f5f5f5; color:#737373; border:1px solid #e5e5e5; }
.rpt-callout { border:2px solid #171717; border-radius:16px; padding:20px 22px; margin-top:20px; }
.rpt-cp { background:#fffbeb; border-color:#8b5cf6; } .rpt-cg { background:#d0fae4; border-color:#10b981; } .rpt-co { background:#fef3c6; border-color:#f59e0b; } .rpt-cd { background:#171717; border-color:#171717; color:#fff; }
.rpt-cl { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }
.rpt-cp .rpt-cl { color:#d97706; } .rpt-cg .rpt-cl { color:#065f46; } .rpt-co .rpt-cl { color:#92400e; } .rpt-cd .rpt-cl { color:#fde68a; }
.rpt-callout p { font-size:14px; line-height:1.7; }
.rpt-pullquote { border-left:4px solid #f59e0b; padding:16px 20px; margin:24px 0; background:#fef3c6; border-radius:0 12px 12px 0; }
.rpt-pullquote p { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:600; line-height:1.45; color:#171717; }
.rpt-bar-list { display:flex; flex-direction:column; gap:10px; }
.rpt-bar-row { display:grid; grid-template-columns:190px 1fr 80px; align-items:center; gap:12px; }
.rpt-bar-row.rpt-narrow { grid-template-columns:140px 1fr 70px; }
.rpt-bar-label { font-size:12px; font-weight:500; color:#171717; line-height:1.35; }
.rpt-bar-label small { display:block; font-size:11px; color:#737373; font-weight:400; }
.rpt-bar-track { height:28px; background:#f5f5f5; border:1px solid #e5e5e5; border-radius:6px; overflow:hidden; }
.rpt-bar-fill { height:100%; border-radius:6px 0 0 6px; display:flex; align-items:center; padding-left:10px; font-size:11px; font-weight:700; color:#fff; white-space:nowrap; }
.rpt-bar-value { font-size:12px; font-weight:700; color:#171717; text-align:right; }
.rpt-bar-value small { display:block; font-size:10px; color:#737373; font-weight:400; }
.rpt-two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.rpt-col-head { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#737373; margin-bottom:12px; }
.rpt-mini-total { border-radius:10px; padding:14px 16px; margin-top:14px; }
.rpt-mini-total-label { font-size:11px; font-weight:700; }
.rpt-mini-total-val { font-family:'Clash Display',sans-serif; font-size:22px; font-weight:700; }
.rpt-mini-total-sub { font-size:12px; color:#737373; margin-top:2px; }
.rpt-donut-layout { display:grid; grid-template-columns:200px 1fr; gap:32px; align-items:center; }
.rpt-legend-list { display:flex; flex-direction:column; gap:10px; }
.rpt-legend-item { display:flex; align-items:center; gap:12px; }
.rpt-legend-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; border:2px solid; }
.rpt-legend-text { font-size:13px; color:#171717; flex:1; font-weight:500; }
.rpt-legend-pct { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; color:#171717; }
.rpt-pill-row { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
.rpt-pill { border:2px solid #171717; border-radius:999px; padding:5px 14px; font-size:12px; font-weight:700; }
.rpt-pv { background:#fffbeb; color:#8b5cf6; border-color:#8b5cf6; } .rpt-pg { background:#d0fae4; color:#065f46; border-color:#10b981; } .rpt-po { background:#fef3c6; color:#92400e; border-color:#f59e0b; } .rpt-pr { background:#fee2e2; color:#991b1b; border-color:#ef4444; }
.rpt-inline-cta { background:#fef3c6; border:2px solid #171717; border-radius:20px; padding:24px 28px; margin:32px 0; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); }
.rpt-inline-cta-inner { display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; }
.rpt-inline-cta-title { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; color:#171717; margin-bottom:4px; }
.rpt-inline-cta-sub { font-size:13px; color:#525252; }
.rpt-btn-primary { display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 24px; background:#f59e0b; color:#171717; border:2px solid #171717; border-radius:14px; font-size:13px; font-weight:700; text-decoration:none; white-space:nowrap; box-shadow:3px 3px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
.rpt-btn-primary:hover { transform:translate(2px,2px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
.rpt-btn-secondary { display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 24px; background:#fff; color:#171717; border:2px solid #171717; border-radius:14px; font-size:13px; font-weight:700; text-decoration:none; white-space:nowrap; box-shadow:3px 3px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
.rpt-btn-secondary:hover { transform:translate(2px,2px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
.rpt-final-cta { margin-top:64px; border:2px solid #171717; border-radius:24px; padding:48px 40px; text-align:center; box-shadow:6px 6px 0px 0px rgba(25,26,35,1); }
.rpt-final-cta-title { font-family:'Clash Display',sans-serif; font-size:clamp(24px,4vw,36px); font-weight:700; color:#fff; margin-bottom:12px; }
.rpt-final-cta-sub { font-size:15px; color:rgba(255,255,255,0.8); max-width:560px; margin:0 auto 28px; line-height:1.65; }
.rpt-final-cta-btns { display:flex; flex-wrap:wrap; gap:12px; justify-content:center; }
.rpt-btn-white { display:inline-flex; align-items:center; justify-content:center; height:48px; padding:0 28px; background:#fff; color:#171717; border:2px solid #171717; border-radius:16px; font-size:14px; font-weight:700; text-decoration:none; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
.rpt-btn-white:hover { transform:translate(2px,2px); box-shadow:2px 2px 0px 0px rgba(25,26,35,1); }
.rpt-btn-outline { display:inline-flex; align-items:center; justify-content:center; height:48px; padding:0 28px; background:rgba(255,255,255,0.12); color:#fff; border:2px solid rgba(255,255,255,0.4); border-radius:16px; font-size:14px; font-weight:700; text-decoration:none; transition:background 0.15s; }
.rpt-btn-outline:hover { background:rgba(255,255,255,0.2); }
@media(max-width:640px){
  .rpt-c4{grid-template-columns:1fr 1fr!important;} .rpt-c3{grid-template-columns:1fr 1fr!important;}
  .rpt-bar-row{grid-template-columns:110px 1fr 50px;} .rpt-bar-row.rpt-narrow{grid-template-columns:100px 1fr 55px;}
  .rpt-donut-layout{grid-template-columns:1fr;} .rpt-two-col{grid-template-columns:1fr;}
  .rpt-inline-cta-inner{flex-direction:column;align-items:flex-start;}
  .rpt-hero-stats{gap:20px;} .rpt-final-cta{padding:32px 20px;}
}
`;
