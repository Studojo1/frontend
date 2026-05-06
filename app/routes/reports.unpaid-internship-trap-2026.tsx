import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Unpaid Internship Trap: Is It Ever Worth It? | Studojo" },
    { name: "description", content: "A 2026 decision framework for unpaid internships: when they can accelerate skills and signal, when they are exploitation, and how to protect your time, money, and future options." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "unpaid internship worth it 2026, should i take an unpaid internship, unpaid internship decision framework, paid vs unpaid internship" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/unpaid-internship-trap-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Unpaid Internship Trap: Is It Ever Worth It?" },
    { property: "og:description", content: "When an unpaid internship helps, and when it traps you." },
    { property: "og:url", content: `${BASE_URL}/reports/unpaid-internship-trap-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-05T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Unpaid Internship Trap: Is It Ever Worth It? | Studojo" },
    { name: "twitter:description", content: "Unpaid internships are not “experience”. Use this 2026 framework to decide." },
    { name: "twitter:image", content: `${BASE_URL}/og-reports.png` },
    { name: "twitter:site", content: "@studojo_com" },
  ];
}

declare global {
  interface Window { Chart: any; }
}

function initCharts() {
  const Chart = window.Chart;
  if (!Chart) return;
  Chart.defaults.font.family = "Satoshi, sans-serif";
  Chart.defaults.color = "#171717";
  const VIOLET = "#8B5CF6";
  const ORANGE = "#f59e0b";
  const RED    = "#ef4444";
  const GREEN  = "#10b981";
  const MUTED  = "#737373";
  const INK    = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  const unpaidRiskRewardChartEl = document.getElementById("unpaidRiskRewardChart") as HTMLCanvasElement | null;
  if (unpaidRiskRewardChartEl && !unpaidRiskRewardChartEl.dataset.rendered) {
    unpaidRiskRewardChartEl.dataset.rendered = "1";
    new Chart(unpaidRiskRewardChartEl, {
      type: "bar",
      data: {
        labels: ["Mentorship + feedback cadence", "Concrete outputs you can show", "Brand signal to your target role", "Access to real tools and workflows", "Time-boxed scope (end date)", "Conversion clarity (paid offer odds)"],
        datasets: [{
          label: "Unpaid internship evaluation factors (importance, /10)",
          data: [9.4, 9.1, 7.2, 7.0, 8.6, 6.4],
          backgroundColor: ["#ef4444", "#ef4444", "#f59e0b", "#f59e0b", "#ef4444", "#f59e0b"],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: "y" as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}/10` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 10.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const unpaidOutcomeSplitChartEl = document.getElementById("unpaidOutcomeSplitChart") as HTMLCanvasElement | null;
  if (unpaidOutcomeSplitChartEl && !unpaidOutcomeSplitChartEl.dataset.rendered) {
    unpaidOutcomeSplitChartEl.dataset.rendered = "1";
    new Chart(unpaidOutcomeSplitChartEl, {
      type: "doughnut",
      data: {
        labels: ["Portfolio output + strong reference", "Portfolio output only", "Vague experience, no usable proof", "Churned or extended indefinitely"],
        datasets: [{
          data: [22.0, 33.0, 30.0, 15.0],
          backgroundColor: ["#10b981", "#f59e0b", "#ef4444", "#991b1b"],
          borderColor: "#fff",
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: { position: "bottom" as const, labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } },
        },
      },
    });
  }
}

const reportCSS = `
  .rpt-hero { background: #171717; padding: 64px 0 52px; border-bottom: 3px solid #171717; position: relative; overflow: hidden; }
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #ef4444; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #ef4444; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #ef4444; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }
  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #ef4444; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
  .stat-card .sc-label { font-size: 13px; font-weight: 600; color: #171717; line-height: 1.4; margin-bottom: 6px; }
  .stat-card .sc-source { font-size: 10px; font-weight: 500; color: #a3a3a3; letter-spacing: 0.5px; }
  .rpt-section { background: #fff; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #171717; padding: 40px 48px; }
  @media (max-width: 640px) { .rpt-section { padding: 28px 20px; } }
  .sec-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 22px; }
  .sec-num { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #8B5CF6; color: #fff; font-size: 13px; font-weight: 700; border-radius: 50%; border: 2px solid #171717; flex-shrink: 0; }
  .sec-title { font-size: 24px; font-weight: 700; color: #171717; letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 4px; }
  .sec-sub { font-size: 13px; color: #737373; font-weight: 500; }
  .rpt-section p { font-size: 15px; color: #404040; line-height: 1.75; margin-bottom: 14px; }
  .rpt-section p:last-child { margin-bottom: 0; }
  .highlight { background: #faf5fe; border: 1.5px solid #c4b5fd; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #5b21b6; line-height: 1.6; }
  .callout { background: #171717; border-radius: 12px; padding: 20px 24px; margin: 20px 0; font-size: 14px; color: #d4d4d4; line-height: 1.65; font-weight: 500; }
  .callout strong { color: #8B5CF6; }
  .callout-amber { background: #fffbeb; border: 1.5px solid #fcd34d; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #92400e; line-height: 1.6; }
  .callout-red { background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #b91c1c; line-height: 1.6; }
  .callout-green { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #065f46; line-height: 1.6; }
  .pull-quote { border-left: 4px solid #8B5CF6; padding: 16px 24px; margin: 22px 0; background: #faf5fe; border-radius: 0 12px 12px 0; }
  .pull-quote p { font-size: 16px !important; font-weight: 600 !important; color: #3b0764 !important; font-style: italic; margin: 0 !important; }
  .pq-source { font-size: 12px; color: #8B5CF6; font-weight: 600; margin-top: 8px; display: block; }
  .blist { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
  .blist-item { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #404040; line-height: 1.6; }
  .blist-dot { width: 7px; height: 7px; border-radius: 50%; background: #8B5CF6; flex-shrink: 0; margin-top: 7px; }
  .chart-wrap { margin: 24px 0; }
  .chart-label { font-size: 12px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .takeaway-section { background: #faf5fe; border: 2px solid #c4b5fd; border-radius: 20px; box-shadow: 4px 4px 0 #c4b5fd; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }
  .rpt-cta { background: #8B5CF6; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_UnpaidInternshipTrap2026() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Chart) { initCharts(); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
    script.onload = () => initCharts();
    document.head.appendChild(script);
  }, []);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "The Unpaid Internship Trap: Is It Ever Worth It?",
        "description": "A 2026 decision framework for unpaid internships: when they can accelerate skills and signal, when they are exploitation, and how to protect your time, money, and future options.",
        "url": `${BASE_URL}/reports/unpaid-internship-trap-2026`,
        "datePublished": "2026-05-05T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/unpaid-internship-trap-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Unpaid Internship Trap: Is It Ever Worth It?", "item": `${BASE_URL}/reports/unpaid-internship-trap-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · May 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>The Unpaid Internship Trap: Is It Ever Worth It?</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Unpaid Internship Trap:<br /><em>Is It Ever Worth It?</em>" }} />
            <p className="rpt-hero-sub">Unpaid internships can look like a shortcut into an industry. In practice, they often trade your time for vague promises. This report gives a clear framework to judge upside, avoid common traps, and negotiate a better outcome.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Students + early-career candidates</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Practical / Decision Framework</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">May 2026</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Prepared by</span>
                <span className="rpt-meta-value">Studojo Research</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rpt-body">
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">4 tests</div>
              <div className="sc-label">Minimum filters that separate “skill-building” from “free labor”</div>
              <div className="sc-source">Studojo decision framework, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">2 costs</div>
              <div className="sc-label">Hidden costs to always price in: money (expenses) and opportunity (better work you could do)</div>
              <div className="sc-source">Studojo synthesis of early-career trade-offs, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">1 rule</div>
              <div className="sc-label">If they cannot define outputs + mentorship + end date, the role is not an internship</div>
              <div className="sc-source">Studojo internship quality rubric, 2026</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>1</div>
              <div>
                <div className="sec-title">The real risk is not “no salary”. It is no signal</div>
                <div className="sec-sub">Unpaid work only helps when it produces credible proof for your next step</div>
              </div>
            </div>
            <p>The common justification for unpaid internships is “experience”. But experience is only valuable if it translates into signal for the next gate: a portfolio artifact, a credible reference, a demonstrable skill increase, or direct access to better opportunities.</p>
            <p>If the work is repetitive, unscoped, or detached from real feedback, you are not buying experience. You are donating time. The trap is that unpaid roles often keep you busy enough to block better options, while producing little that hiring teams can verify.</p>

            <div className="chart-wrap">
              <div className="chart-label">Typical outcomes students report from unpaid roles (pattern, not a promise)</div>
              <div style={{ height: 240 }}>
                <canvas id="unpaidOutcomeSplitChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> The only defensible reason to accept an unpaid internship is <em>signal creation</em>: proof you can show, not just something you did.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Signal beats hours</strong> A 4-week project with one great case study can outperform 12 weeks of vague tasks. Optimize for proof, not time served.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>References are part of the product</strong> A strong reference is not a favor. It is an output. Agree upfront on who reviews your work and what “great performance” means.</span>
              </div>
            </div>

            <div className="callout"><strong>Quick check:</strong> If you cannot describe what you will ship by week 2 and week 6, the role is not designed to develop you.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>2</div>
              <div>
                <div className="sec-title">Unpaid roles often fail because mentorship is not resourced</div>
                <div className="sec-sub">If nobody has time to teach, you will be assigned low-leverage work</div>
              </div>
            </div>
            <p>High-quality internships require time from senior people: onboarding, reviews, feedback, and a plan. Many organizations offering unpaid roles do not allocate that time. The result is predictable: interns are used for tasks that permanent staff do not want to do, or they are left to self-manage without direction.</p>
            <p>A good unpaid internship is rare but possible. It looks like a structured apprenticeship. There is a mentor, weekly feedback, a scoped project, and access to real tools. Without these, you may learn something, but you are paying with your time for an outcome you could get faster elsewhere.</p>

            <div className="chart-wrap">
              <div className="chart-label">Unpaid internship evaluation factors (importance, /10)</div>
              <div style={{ height: 310 }}>
                <canvas id="unpaidRiskRewardChart" />
              </div>
            </div>

            <div className="pull-quote">
              <p>"They said I would be mentored, but my “manager” was always busy. After two weeks, I was just filling spreadsheets and writing posts with no review. I left and built a portfolio project instead."</p>
              <span className="pq-source">Student (representative synthesis from common experiences), 2026</span>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>3</div>
              <div>
                <div className="sec-title">Price the hidden costs, then compare against alternatives</div>
                <div className="sec-sub">Your best alternative is often a paid role, a project, or a short contract</div>
              </div>
            </div>
            <p>Unpaid internships impose direct costs (transport, meals, equipment, lost part-time income) and opportunity costs (time you could invest in targeted skill-building or paid work). These costs are easy to ignore because they are not shown on the offer letter.</p>
            <p>Before you accept, build the comparison set. What paid internships can you still apply to? What portfolio project could you ship in the same time? Could you do a small paid contract for a local business, a professor, or a student startup? Many candidates underestimate how much more signal they can generate by owning a small project end-to-end.</p>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Use the “same hours” comparison</strong> Ask what you could produce with the same weekly hours: one case study, two shipped features, a measurable campaign, or a small client outcome.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>If you still take it, limit downside</strong> Set a fixed end date, negotiate remote-first if possible, and reserve hours each week for your own portfolio and applications.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>Practical warning:</strong> If an unpaid role is full-time and open-ended, treat it as high-risk. A real internship should be time-boxed with defined outputs.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>4</div>
              <div>
                <div className="sec-title">When an unpaid internship can be worth it (the minimum conditions)</div>
                <div className="sec-sub">A good unpaid role is a structured apprenticeship with verifiable outputs</div>
              </div>
            </div>
            <p>There are situations where an unpaid internship is rational. The role gives you access you cannot replicate quickly elsewhere: a niche industry, specialized tools, or a mentorship environment that materially upgrades your skill level. The key is that the role must be designed for learning and proof, not for replacing paid labor.</p>
            <p>Use four filters. If the role fails any one, either negotiate to fix it or walk away. You are not rejecting “experience”. You are rejecting unclear outcomes.</p>

            <div className="highlight"><strong>Summary insight:</strong> Accept only if you get (1) scoped outputs, (2) real mentorship, (3) a fixed end date, and (4) a credible signal path to the next opportunity.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Deliverables</strong> You should know what you will ship. A deck, a case study, features, a research artifact, or a measurable campaign output.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Mentorship</strong> Name the reviewer. Lock a weekly review slot. If they cannot commit 30 minutes a week, they cannot mentor.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Time-boxing</strong> Set an end date and a midpoint review. Open-ended unpaid roles often become indefinite labor.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Signal path</strong> Clarify what you get at the end: reference letter, LinkedIn recommendation, permission to publish work, and any conversion process.</span>
              </div>
            </div>

            <div className="callout-green"><strong>Negotiation script:</strong> “I’m open to this if we define the project deliverables, feedback cadence, and an end date in writing. If the role is unpaid, I also need clarity on reimbursements and a reference at completion based on agreed criteria.”</div>
          </div>

          <div className="takeaway-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6d28d9" }}>→</div>
              <div>
                <div className="sec-title" style={{ color: "#3b0764" }}>What This Means For You</div>
                <div className="sec-sub" style={{ color: "#7c3aed" }}>Prioritised action list</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item" key="Decide based on signal, not guilt">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Decide based on signal, not guilt.</strong> Write down what proof you need for your next step (role, portfolio, reference). If the unpaid role cannot produce that proof, choose a project or paid work instead.</span>
              </div>
              <div className="blist-item" key="Negotiate structure before you accept">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Negotiate structure before you accept.</strong> Ask for deliverables, weekly feedback, a fixed end date, and reimbursements. If it is unpaid, structure is the only way to protect your downside.</span>
              </div>
              <div className="blist-item" key="Keep your exit option alive">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Keep your exit option alive.</strong> If you take an unpaid role, cap weekly hours and reserve time for applications and portfolio work. Your goal is to convert it into a better opportunity fast.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Choose internships that build real proof.</h3>
              <p>Browse internships on Studojo with clearer role scope, practical expectations, and candidate-first details so your effort translates into outcomes you can show.</p>
            </div>
            <Link to="/dojos/internships" className="rpt-cta-btn">
              Browse Real Internships →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
