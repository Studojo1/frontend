import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Startup vs MNC: A Real Comparison for Early-Career Talent | Studojo" },
    { name: "description", content: "Salary, learning speed, brand name value, job security, and career velocity — a data-backed comparison of startups vs MNCs for students and early-career candidates in 2026." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "startup vs mnc 2026, startup vs corporate salary india, should i join startup or mnc, early career startup vs mnc, fresher startup vs mnc india" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/startup-vs-mnc-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Startup vs MNC: A Real Comparison for Early-Career Talent" },
    { property: "og:description", content: "Salary, learning speed, job security, and career velocity — the actual data on startups vs MNCs for early-career candidates." },
    { property: "og:url", content: `${BASE_URL}/reports/startup-vs-mnc-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-03T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Startup vs MNC: A Real Comparison for Early-Career Talent | Studojo" },
    { name: "twitter:description", content: "Salary, learning speed, brand name, job security, career velocity. The actual data." },
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
  const VIOLET2 = "#a78bfa";
  const ORANGE = "#f59e0b";
  const RED = "#ef4444";
  const GREEN = "#10b981";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: Salary comparison — startup vs MNC by year
  const salaryEl = document.getElementById("salaryChart") as HTMLCanvasElement | null;
  if (salaryEl && !salaryEl.dataset.rendered) {
    salaryEl.dataset.rendered = "1";
    new Chart(salaryEl, {
      type: "bar",
      data: {
        labels: ["Year 0 (entry)", "Year 1", "Year 2", "Year 3", "Year 5"],
        datasets: [
          {
            label: "Startup (median LPA)",
            data: [5, 6.5, 9, 14, 22],
            backgroundColor: VIOLET,
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            label: "MNC (median LPA)",
            data: [9, 10.5, 12, 14, 18],
            backgroundColor: "#d4d4d4",
            borderRadius: 6,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" as const, labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ₹${ctx.raw} LPA (median)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => "₹" + v + "L", color: MUTED } },
        },
      },
    });
  }

  // Chart 2: What matters most — radar
  const radarEl = document.getElementById("radarChart") as HTMLCanvasElement | null;
  if (radarEl && !radarEl.dataset.rendered) {
    radarEl.dataset.rendered = "1";
    new Chart(radarEl, {
      type: "radar",
      data: {
        labels: ["Entry salary", "Learning speed", "Brand name", "Job security", "Career velocity", "Mentorship", "Work-life balance"],
        datasets: [
          {
            label: "Startup",
            data: [4, 9, 5, 4, 8, 6, 4],
            borderColor: VIOLET,
            backgroundColor: VIOLET + "22",
            pointBackgroundColor: VIOLET,
            borderWidth: 2,
          },
          {
            label: "MNC",
            data: [8, 5, 9, 8, 5, 7, 7],
            borderColor: INK,
            backgroundColor: INK + "11",
            pointBackgroundColor: INK,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" as const, labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
        },
        scales: {
          r: {
            min: 0, max: 10,
            ticks: { display: false },
            grid: { color: "#e5e5e5" },
            pointLabels: { font: { size: 11 } },
          },
        },
      },
    });
  }

  // Chart 3: Failure / restructuring risk
  const riskEl = document.getElementById("riskChart") as HTMLCanvasElement | null;
  if (riskEl && !riskEl.dataset.rendered) {
    riskEl.dataset.rendered = "1";
    new Chart(riskEl, {
      type: "doughnut",
      data: {
        labels: ["Fail within 10 years (90%)", "Survive past 10 years (10%)"],
        datasets: [{
          data: [90, 10],
          backgroundColor: [RED, GREEN],
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
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #8B5CF6; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #8B5CF6; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #8B5CF6; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }

  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }

  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #8B5CF6; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
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
  .highlight strong { color: #6d28d9; }
  .callout { background: #171717; border-radius: 12px; padding: 20px 24px; margin: 20px 0; font-size: 14px; color: #d4d4d4; line-height: 1.65; font-weight: 500; }
  .callout strong { color: #8B5CF6; }
  .pull-quote { border-left: 4px solid #8B5CF6; padding: 16px 24px; margin: 22px 0; background: #faf5fe; border-radius: 0 12px 12px 0; }
  .pull-quote p { font-size: 16px !important; font-weight: 600 !important; color: #3b0764 !important; font-style: italic; margin: 0 !important; }
  .pq-source { font-size: 12px; color: #8B5CF6; font-weight: 600; margin-top: 8px; display: block; }

  .blist { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
  .blist-item { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #404040; line-height: 1.6; }
  .blist-dot { width: 7px; height: 7px; border-radius: 50%; background: #8B5CF6; flex-shrink: 0; margin-top: 7px; }

  .chart-wrap { margin: 24px 0; }
  .chart-label { font-size: 12px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .chart-two { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
  @media (max-width: 640px) { .chart-two { grid-template-columns: 1fr; } }

  .vs-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e5e5; }
  .vs-table th { padding: 11px 16px; text-align: left; letter-spacing: 0.5px; font-weight: 700; font-size: 12px; }
  .vs-table th:first-child { background: #f5f5f5; color: #737373; }
  .vs-table th.startup { background: #8B5CF6; color: #fff; }
  .vs-table th.mnc { background: #171717; color: #f8f6f1; }
  .vs-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #404040; vertical-align: top; line-height: 1.55; }
  .vs-table tr:last-child td { border-bottom: none; }
  .vs-table td:first-child { font-weight: 700; color: #171717; background: #fafafa; }
  .vs-table td.s { color: #5b21b6; font-weight: 600; }
  .vs-table td.m { color: #404040; }

  .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e5e5; }
  .data-table th { background: #171717; color: #f8f6f1; font-weight: 700; padding: 11px 16px; text-align: left; letter-spacing: 0.5px; }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #404040; vertical-align: top; line-height: 1.55; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:nth-child(even) td { background: #fafafa; }
  .tag-pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .pill-red { background: #fee2e2; color: #b91c1c; }
  .pill-amber { background: #fef3c6; color: #92400e; }
  .pill-green { background: #d0fae4; color: #065f46; }
  .pill-violet { background: #ede9fe; color: #5b21b6; }

  .takeaway-section { background: #faf5fe; border: 2px solid #c4b5fd; border-radius: 20px; box-shadow: 4px 4px 0 #c4b5fd; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }

  .rpt-cta { background: #8B5CF6; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function StartupVsMncReport() {
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
        "headline": "Startup vs MNC: A Real Comparison for Early-Career Talent",
        "description": "Salary, learning speed, brand name, job security, and career velocity — a data-backed comparison of startups vs MNCs for early-career candidates in 2026.",
        "url": `${BASE_URL}/reports/startup-vs-mnc-2026`,
        "datePublished": "2026-05-03T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/startup-vs-mnc-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Startup vs MNC 2026", "item": `${BASE_URL}/reports/startup-vs-mnc-2026` },
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
              <span>Startup vs MNC 2026</span>
            </nav>
            <h1>Startup vs MNC:<br /><em>A Real Comparison</em></h1>
            <p className="rpt-hero-sub">
              Neither is universally better. Salary, learning speed, brand name value, job security, and career velocity — compared
              across five dimensions with actual data for early-career candidates in 2026.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Global context</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Findings</span>
                <span className="rpt-meta-value">5 dimensions compared</span>
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
          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">2x</div>
              <div className="sc-label">higher median entry salary at MNCs vs early-stage startups in India</div>
              <div className="sc-source">Glassdoor India, AmbitionBox 2024–25 data</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">90%</div>
              <div className="sc-label">of startups fail within 10 years — but most early-career hires leave before that</div>
              <div className="sc-source">CB Insights / Startup Genome Report, 2024</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">3 yrs</div>
              <div className="sc-label">median time to first manager role at a startup vs 5+ years at most MNCs</div>
              <div className="sc-source">LinkedIn Career Pathways, 2024</div>
            </div>
          </div>

          {/* Overview */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>≡</div>
              <div>
                <div className="sec-title">The Comparison at a Glance</div>
                <div className="sec-sub">Five dimensions, scored 1 to 10</div>
              </div>
            </div>
            <div className="chart-two">
              <div>
                <div className="chart-label">Salary trajectory over 5 years (India, median LPA)</div>
                <div style={{ height: 260 }}>
                  <canvas id="salaryChart" />
                </div>
              </div>
              <div>
                <div className="chart-label">Dimension comparison (1 = low, 10 = high)</div>
                <div style={{ height: 260 }}>
                  <canvas id="radarChart" />
                </div>
              </div>
            </div>
            <div className="callout">
              <strong>The salary gap at Year 0 is real — but it narrows by Year 3 and often reverses by Year 5</strong> if the startup trajectory is strong. The comparison is not binary. It is a function of timing, company stage, and what you are optimising for.
            </div>
          </div>

          {/* Section 1: Salary */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Salary: MNCs Win at Entry, Startups Can Win Later</div>
                <div className="sec-sub">The gap is significant at Year 0. It is not permanent.</div>
              </div>
            </div>
            <p>India data from Glassdoor, AmbitionBox, and LinkedIn consistently shows MNC entry-level compensation running 1.5x to 2x higher than early-stage startup compensation for equivalent roles. A fresher joining an MNC in a technology or finance role can expect ₹6 to 14 LPA depending on the firm. The equivalent role at a Seed or Series A startup typically offers ₹3 to 8 LPA.</p>
            <table className="vs-table">
              <thead>
                <tr>
                  <th>Compensation factor</th>
                  <th className="startup">Startup</th>
                  <th className="mnc">MNC</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Entry base (India median)", "₹3–8 LPA", "₹6–14 LPA"],
                  ["Equity / ESOPs", "Often offered, illiquid", "Rare at entry level"],
                  ["Annual hike", "Performance-based, variable", "Structured band (8–15%)"],
                  ["Benefits (PF, health, etc.)", "Varies widely by company", "Standardised, comprehensive"],
                  ["Bonus", "Rare at entry, sometimes equity", "Annual performance bonus common"],
                  ["Negotiability", "High — founders often flexible", "Low — fixed bands"],
                ].map(([factor, s, m]) => (
                  <tr key={factor as string}>
                    <td>{factor}</td>
                    <td className="s">{s}</td>
                    <td className="m">{m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>The equity question matters, but only if the startup succeeds.</strong> ESOPs at an early-stage company are a lottery ticket. Most are worth zero. A small number are worth significantly more than any MNC salary trajectory would have produced. The expected value calculation depends entirely on your risk appetite and the quality of the company you are joining.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Series B and C startups close most of the salary gap.</strong> The narrative that startups pay less is largely a Seed and Series A story. Well-funded growth-stage startups frequently match or exceed MNC compensation while retaining the cultural and ownership characteristics of a startup environment.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>MNC hike cycles can be a trap.</strong> A 10% annual hike on a ₹9 LPA base is ₹900K per year. A 40% raise from a competing offer or role change at Year 2 is ₹3.6 LPA. Candidates who stay in MNC bands without external moves often see slower real compensation growth than those who switch aggressively.</span></div>
            </div>
            <div className="highlight">
              The salary comparison is not Year 0 vs Year 0. It is a five-year trajectory question. <strong>Pick the option that maximises your position at Year 5, not just the first month's take-home.</strong>
            </div>
          </div>

          {/* Section 2: Learning */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Learning Speed: Startups Make You Faster, MNCs Make You Deeper</div>
                <div className="sec-sub">Both are real advantages. Neither is universally superior.</div>
              </div>
            </div>
            <p>The most consistent finding across candidate surveys and recruiter feedback is that startup alumni learn faster in breadth and MNC alumni learn deeper in domain. This is a structural difference, not a quality difference. It reflects what each environment optimises for.</p>
            <table className="vs-table">
              <thead>
                <tr>
                  <th>Learning dimension</th>
                  <th className="startup">Startup</th>
                  <th className="mnc">MNC</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Role ownership", "High from day one", "Ramp-up period, defined scope"],
                  ["Breadth of skills", "Generalist by default", "Specialist track"],
                  ["Feedback quality", "Direct and frequent", "Structured review cycles"],
                  ["Process exposure", "Build the process yourself", "Inherit established processes"],
                  ["Mentorship", "Informal, access to founders", "Formal programs, L&D budget"],
                  ["Failure tolerance", "High — experiments expected", "Lower — mistakes visible"],
                ].map(([dim, s, m]) => (
                  <tr key={dim as string}>
                    <td>{dim}</td>
                    <td className="s">{s}</td>
                    <td className="m">{m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>The question is not which environment teaches more. It is which type of learning compounds better for the career you want. A candidate who wants to run their own company eventually benefits disproportionately from startup breadth. A candidate targeting a senior specialist role at a large institution benefits from MNC depth and process exposure.</p>
            <div className="pull-quote">
              <p>"I did three years at a Series A and learned more in the first six months than most of my batchmates did in two years at large companies. But they understood enterprise sales and procurement in ways I had to catch up on later."</p>
              <span className="pq-source">Product Manager, Bangalore (shared in Studojo community, 2025)</span>
            </div>
          </div>

          {/* Section 3: Brand name */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Brand Name: It Travels, But Not Everywhere</div>
                <div className="sec-sub">The MNC name opens certain doors. The startup name opens others.</div>
              </div>
            </div>
            <p>Brand name on a resume functions as a filtering signal — it tells a screener something about the candidate before any content is read. The problem is that the signal is context-dependent. The same brand name that impresses one hiring manager is irrelevant or even a negative signal to another.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>MNC names travel furthest in structured hiring pipelines.</strong> Large company recruitment processes, MBA admissions, government sector roles, and international applications all weight institutional recognition heavily. A Goldman Sachs, Unilever, or TCS on a resume is immediately legible to any screener globally.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Startup names matter only if the startup is known.</strong> A role at Zepto, Razorpay, or Meesho is legible in Indian tech hiring. A role at an unknown pre-Series A company is not a brand signal — it is simply a company name. The benefit of a startup brand is concentrated in well-funded, well-known companies.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The brand fades as work evidence accumulates.</strong> By Year 3 to 5, what you built matters more than where you built it. Candidates who have strong portfolio evidence, quantified outcomes, and referrals from past colleagues find that the brand name question becomes secondary. The brand buys the first read; the work keeps you in the room.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>In the startup and VC ecosystem, MNC pedigree can be a mild negative signal.</strong> Founders and early-stage hiring managers frequently express preference for candidates who have worked in ambiguous, resource-constrained environments. An exclusively MNC background can read as an indicator of someone who needs structure that a startup cannot provide.</span></div>
            </div>
            <div className="callout">
              <strong>The strategic play:</strong> A well-known MNC name early in your career followed by a respected startup gives you the broadest signal range. The reverse sequence — startup first, then MNC — is harder to execute but not impossible. The least useful path is spending five years at an unknown company in either category.
            </div>
          </div>

          {/* Section 4: Risk */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Job Security: Both Are Riskier Than They Look</div>
                <div className="sec-sub">90% of startups fail. MNCs restructure. Neither is a guarantee.</div>
              </div>
            </div>
            <p>The conventional framing places MNCs as stable and startups as risky. The data complicates this. MNC employment has become significantly less stable over the past decade as restructuring, offshoring, and automation have eliminated large categories of entry-level roles. Meanwhile, startup risk is real but is often misunderstood by early-career candidates.</p>
            <div className="chart-two">
              <div>
                <div className="chart-label">Startup failure rate within 10 years</div>
                <div style={{ height: 220 }}>
                  <canvas id="riskChart" />
                </div>
              </div>
              <div>
                <div className="blist" style={{ marginTop: 12 }}>
                  <div className="blist-item"><div className="blist-dot" /><span><strong>Most early-career candidates leave a startup before it fails.</strong> The median tenure at a Seed to Series A startup is under two years. The failure events that damage careers happen to people who stay through decline, not those who leave during the company's growth phase.</span></div>
                  <div className="blist-item"><div className="blist-dot" /><span><strong>MNC restructuring is less visible but equally disruptive.</strong> Large-scale layoffs at IBM, Wipro, Accenture, and similar firms have affected hundreds of thousands of employees in India since 2022. The perception of MNC job security is partly a survivor bias problem — the people who were not laid off are the ones discussing their stable careers.</span></div>
                  <div className="blist-item"><div className="blist-dot" /><span><strong>Real security is portable skills.</strong> The candidates who navigate both startup failures and MNC restructurings without career damage are those who built genuine, demonstrable skills during their tenure. A role that teaches nothing is risky regardless of the employer's size.</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Career velocity */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Career Velocity: Fast but Unclear vs Slow but Legible</div>
                <div className="sec-sub">Promotion timelines and path clarity compared</div>
              </div>
            </div>
            <p>Career velocity — how quickly you move from entry level to a position of real responsibility — differs structurally between startups and MNCs. Neither is objectively better; they optimise for different things.</p>
            <table className="vs-table">
              <thead>
                <tr>
                  <th>Career factor</th>
                  <th className="startup">Startup</th>
                  <th className="mnc">MNC</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Time to first management role", "2–3 years (if company grows)", "4–6 years minimum"],
                  ["Promotion criteria", "Informal, relationship-driven", "Formal, documented criteria"],
                  ["Compensation at promotion", "Title moves fast, pay catches up slowly", "Grade change = defined pay band jump"],
                  ["Path visibility", "Ambiguous — depends on company trajectory", "Defined career ladders available"],
                  ["Lateral move optionality", "High — wear many hats", "Lower — tracks are distinct"],
                  ["Influence at early stage", "High — decisions made in small rooms", "Low — hierarchy filters access"],
                ].map(([factor, s, m]) => (
                  <tr key={factor as string}>
                    <td>{factor}</td>
                    <td className="s">{s}</td>
                    <td className="m">{m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="highlight">
              The startup velocity advantage only materialises <strong>if the company grows alongside you</strong>. A startup that plateaus at 20 people does not give you a management track — it gives you a stable small-team role. The velocity is a function of the company's trajectory, not just your performance.
            </div>
            <p>MNC career paths are slower but they are legible in advance. A candidate at a structured MNC can see what the next three roles look like, what the criteria are, and what the compensation bands will be. This predictability has real value for candidates who are optimising for long-term security and institutional advancement rather than speed.</p>
          </div>

          {/* Summary table */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>≡</div>
              <div>
                <div className="sec-title">The Decision Framework</div>
                <div className="sec-sub">What to optimise for, and which path serves it</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>If you are optimising for...</th>
                  <th>Choose</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Maximum Year 0 salary", "pill-violet", "MNC", "Structural pay bands run 1.5–2x startup at entry"],
                  ["Learning speed and breadth", "pill-violet", "Startup", "Full ownership faster, generalist exposure by default"],
                  ["Brand name for future roles at large companies", "pill-violet", "MNC", "Institutional recognition travels in structured pipelines"],
                  ["Brand name for future startup roles", "pill-amber", "Either", "Known startup > Unknown MNC in VC/startup ecosystem"],
                  ["Management responsibility early", "pill-violet", "Startup", "Median time to first team lead role: 2–3 years"],
                  ["Long-term salary trajectory", "pill-amber", "Depends", "Strong startup at right stage can match or beat MNC by Year 5"],
                  ["Job security", "pill-amber", "Neither", "Both are riskier than they appear — portable skills are the hedge"],
                  ["Career path clarity", "pill-violet", "MNC", "Defined ladders, documented criteria, visible next steps"],
                ].map(([goal, pillClass, pick, reason]) => (
                  <tr key={goal as string}>
                    <td>{goal}</td>
                    <td><span className={`tag-pill ${pillClass}`}>{pick}</span></td>
                    <td style={{ color: "#737373", fontSize: "12px" }}>{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Takeaway */}
          <div className="takeaway-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6d28d9" }}>→</div>
              <div>
                <div className="sec-title" style={{ color: "#3b0764" }}>What This Means For You</div>
                <div className="sec-sub" style={{ color: "#7c3aed" }}>The research conclusion — how to actually make this decision</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The startup vs MNC question is not a question about which is better. It is a question about what you are optimising for at this specific point in your career. The answer changes depending on your financial situation, risk tolerance, career goals, and the specific companies on offer. Here is the decision logic:</p>
            <div className="blist">
              {[
                ["If money is the constraint right now, choose the MNC", "The salary gap at Year 0 is real and significant. If you have financial obligations or need to build savings quickly, the MNC offer closes the fastest. Do not romanticise the startup path if you cannot afford the pay cut."],
                ["If learning is the priority, choose the startup — but choose carefully", "The learning advantage of a startup is not automatic. It depends on having a strong founding team, a real product, and genuine ownership from day one. A bad startup gives you chaos, not learning. Evaluate the team first, the company second."],
                ["If brand name matters, choose the MNC for the first role", "A well-known MNC in your first two years gives you a legible credential that opens doors across the widest range of future options. You can always move to a startup from an MNC. The reverse transition is harder to explain."],
                ["If you want to move fast, choose a startup that is already moving", "The career velocity advantage of a startup only exists if the company is growing. A Series B company adding 50 people per quarter creates management opportunities. A Seed company of 8 people does not. Stage matters as much as type."],
                ["The best outcome is often sequential, not binary", "A well-known MNC for the first 18 to 24 months followed by a well-funded startup gives you the broadest combination of brand name, process exposure, salary floor, and growth trajectory. You do not have to choose one path forever. You have to choose which path is right for where you are right now."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" style={{ background: "#6d28d9" }} />
                  <span style={{ color: "#3b0764" }}><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Find the roles worth choosing between.</h3>
              <p>Studojo Outreach finds the right hiring managers at both startups and MNCs and puts you in front of them directly. No ATS, no job board noise.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">
              Try Studojo Outreach →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
