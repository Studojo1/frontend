import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Proof-of-Work Report 2026: Projects, GitHub and Portfolios That Get You Hired | Studojo" },
    { name: "description", content: "A deployed project with a live link beats a certificate. Which projects move shortlists in 2026, how to present them, and what GitHub and a portfolio need." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "projects for resume 2026, how to build a portfolio, github for jobs, best projects to get a job, proof of work, portfolio for freshers, what projects impress recruiters" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/proof-of-work-report-projects-github-portfolio-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Proof-of-Work Report 2026: Projects, GitHub and Portfolios That Get You Hired" },
    { property: "og:description", content: "A shipped project with a live link beats a certificate. The projects that move shortlists, how to present them, and GitHub and portfolio hygiene." },
    { property: "og:url", content: `${BASE_URL}/reports/proof-of-work-report-projects-github-portfolio-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-16T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Proof-of-Work Report 2026 | Studojo" },
    { name: "twitter:description", content: "Proof of work beats credentials. The projects, GitHub setup and portfolios that actually get freshers shortlisted." },
    { name: "twitter:image", content: `${BASE_URL}/og-reports.png` },
    { name: "twitter:site", content: "" },
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
  const VIOLET3 = "#c4b5fd";
  const ORANGE = "#f59e0b";
  const RED = "#ef4444";
  const GREEN = "#10b981";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: how hiring managers rank proof signals (illustrative)
  const signalEl = document.getElementById("powSignalChart") as HTMLCanvasElement | null;
  if (signalEl && !signalEl.dataset.rendered) {
    signalEl.dataset.rendered = "1";
    new Chart(signalEl, {
      type: "bar",
      data: {
        labels: [
          "Deployed project with live link",
          "Open-source contribution",
          "Project with code only",
          "Internship",
          "Course certificate",
          "Skills list with no evidence",
        ],
        datasets: [{
          label: "Strength as a signal (1-5)",
          data: [5, 5, 4, 4, 2, 1],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET2, ORANGE, RED],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` Signal: ${ctx.raw}/5 (illustrative)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: where a recruiter's project scan goes (illustrative)
  const scanEl = document.getElementById("powScanChart") as HTMLCanvasElement | null;
  if (scanEl && !scanEl.dataset.rendered) {
    scanEl.dataset.rendered = "1";
    new Chart(scanEl, {
      type: "doughnut",
      data: {
        labels: [
          "Project title and one-line result",
          "Live link or demo",
          "Tech or tools used",
          "Everything else",
        ],
        datasets: [{
          data: [40, 30, 20, 10],
          backgroundColor: [VIOLET, GREEN, ORANGE, VIOLET3],
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
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw}% of attention (illustrative)` } },
        },
      },
    });
  }

  // Chart 3: what to build by field, effort vs signal (illustrative)
  const fieldEl = document.getElementById("powFieldChart") as HTMLCanvasElement | null;
  if (fieldEl && !fieldEl.dataset.rendered) {
    fieldEl.dataset.rendered = "1";
    new Chart(fieldEl, {
      type: "bar",
      data: {
        labels: [
          "Real problem, deployed",
          "Clone with a genuine twist",
          "Open-source fix",
          "Tutorial clone, unchanged",
          "Certificate only",
        ],
        datasets: [{
          label: "Shortlist signal (1-5)",
          data: [5, 4, 5, 2, 1],
          backgroundColor: [VIOLET, VIOLET2, VIOLET, ORANGE, RED],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` Signal: ${ctx.raw}/5 (illustrative)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 12 }, color: MUTED } },
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

  .keyfindings { background: #faf5fe; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #8B5CF6; padding: 32px 40px; }
  @media (max-width: 640px) { .keyfindings { padding: 24px 20px; } }
  .keyfindings h2 { font-size: 13px; font-weight: 700; color: #6d28d9; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 18px; }
  .kf-list { display: flex; flex-direction: column; gap: 12px; }
  .kf-item { display: flex; align-items: flex-start; gap: 12px; font-size: 15px; color: #3b0764; line-height: 1.6; font-weight: 500; }
  .kf-check { width: 20px; height: 20px; border-radius: 6px; background: #8B5CF6; color: #fff; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .kf-item strong { color: #6d28d9; }

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

  .divider { height: 2px; background: #f0f0f0; margin: 24px 0; border-radius: 2px; }

  .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e5e5; }
  .data-table th { background: #171717; color: #f8f6f1; font-weight: 700; padding: 11px 16px; text-align: left; letter-spacing: 0.5px; }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #404040; vertical-align: top; line-height: 1.55; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:nth-child(even) td { background: #fafafa; }
  .tag-pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .pill-red { background: #fee2e2; color: #b91c1c; }
  .pill-amber { background: #fef3c6; color: #92400e; }
  .pill-green { background: #d0fae4; color: #065f46; }
  .pill-blue { background: #dbeafe; color: #1e40af; }

  .faq-section { background: #fff; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #171717; padding: 40px 48px; }
  @media (max-width: 640px) { .faq-section { padding: 28px 20px; } }
  .faq-item { border-bottom: 1px solid #f0f0f0; padding: 18px 0; }
  .faq-item:first-of-type { padding-top: 0; }
  .faq-item:last-child { border-bottom: none; padding-bottom: 0; }
  .faq-q { font-size: 16px; font-weight: 700; color: #171717; line-height: 1.4; margin-bottom: 8px; }
  .faq-a { font-size: 14px; color: #404040; line-height: 1.7; }
  .faq-a strong { color: #6d28d9; }

  .related { background: #fff; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #171717; padding: 32px 40px; }
  @media (max-width: 640px) { .related { padding: 24px 20px; } }
  .related h2 { font-size: 13px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
  .related-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  @media (max-width: 640px) { .related-grid { grid-template-columns: 1fr; } }
  .related-card { display: block; border: 1.5px solid #e5e5e5; border-radius: 12px; padding: 16px 18px; text-decoration: none; transition: border-color .15s; }
  .related-card:hover { border-color: #8B5CF6; }
  .related-card .rc-kicker { font-size: 10px; font-weight: 700; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .related-card .rc-title { font-size: 14px; font-weight: 600; color: #171717; line-height: 1.4; }

  .takeaway-section { background: #faf5fe; border: 2px solid #c4b5fd; border-radius: 20px; box-shadow: 4px 4px 0 #c4b5fd; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }

  .rpt-cta { background: #8B5CF6; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

const FAQ = [
  {
    q: "What projects should I put on my resume?",
    a: "Put projects that solve a real problem for a real person and have a live link. A tool you built for your hostel, a site for a local shop, a dashboard on public data all work. Pick two or three you can explain in detail, and skip anything you cannot defend in an interview.",
  },
  {
    q: "Does GitHub matter for getting a job?",
    a: "For engineering and data roles, yes. Many technical recruiters reportedly open a candidate's GitHub, and a clean profile with a few pinned, documented repos helps. For design, marketing and content roles a portfolio matters more than GitHub.",
  },
  {
    q: "How many projects do I need on my resume?",
    a: "Two to three strong ones. One deep project with a live link and a measurable result beats five thin ones. Recruiters skim, so every extra weak project dilutes your best one.",
  },
  {
    q: "Are tutorial projects bad for my resume?",
    a: "Unchanged tutorial clones are weak because everyone else built the same thing. A tutorial is fine as a starting point. Change the problem, add a feature, use your own data, then deploy it, and it becomes your project.",
  },
  {
    q: "What is a portfolio and do I need one?",
    a: "A portfolio is a simple page that shows your best work with proof: what the problem was, what you did, the result and a link. You need one for design, marketing, content and writing roles. For engineering, a tidy GitHub plus one live demo usually does the job.",
  },
  {
    q: "How do I show a project if I cannot deploy it?",
    a: "Record a 60 to 90 second screen demo and link it, then add clear screenshots and a short README. If the data is private, describe it generally and show a sanitised version. A demo video is far better than a description alone.",
  },
];

export default function ProofOfWorkReport() {
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
        "headline": "The Proof-of-Work Report 2026: Projects, GitHub and Portfolios That Get You Hired",
        "description": "Why a deployed project beats a certificate, which projects move shortlists in 2026, and how to present them.",
        "url": `${BASE_URL}/reports/proof-of-work-report-projects-github-portfolio-2026`,
        "datePublished": "2026-10-16T00:00:00Z",
        "dateModified": "2026-10-16T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/proof-of-work-report-projects-github-portfolio-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Proof-of-Work Report 2026", "item": `${BASE_URL}/reports/proof-of-work-report-projects-github-portfolio-2026` },
        ],
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        {/* Hero */}
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · October 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Proof-of-Work Report 2026</span>
            </nav>
            <h1>The Projects That <em>Actually Get You Hired</em></h1>
            <p className="rpt-hero-sub">
              A certificate says you watched a course. A deployed project says you can
              build. This report covers which projects move shortlists in 2026, how to
              present them, and what your GitHub and portfolio need to look like.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Projects, GitHub, portfolios</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">October 2026</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Prepared by</span>
                <span className="rpt-meta-value">Studojo Research</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rpt-body">
          {/* Key findings answer box */}
          <div className="keyfindings">
            <h2>Key findings</h2>
            <div className="kf-list">
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Proof of work beats credentials.</strong> A shipped project shows skill. A certificate shows attendance.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>One deep real project beats five tutorial clones.</strong> Depth and your own decisions are what recruiters probe.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>A live link or demo beats a description.</strong> If a recruiter can click it in ten seconds, it counts.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>GitHub matters for engineering roles.</strong> A portfolio matters for design, marketing and content roles.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Frame every project as a problem solved with a result.</strong> Not "built a website", but who it helped and what changed.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">3-5x</div>
              <div className="sc-label">how much higher hiring managers reportedly score a deployed project than a certificate</div>
              <div className="sc-source">Hiring manager survey (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~10s</div>
              <div className="sc-label">roughly how long a recruiter spends scanning one project entry before moving on</div>
              <div className="sc-source">Recruiter scan estimate (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~60%</div>
              <div className="sc-label">estimated share of engineering recruiters who check a candidate's GitHub</div>
              <div className="sc-source">Industry estimate (reported)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Why Proof Beats Certificates</div>
                <div className="sec-sub">What a recruiter can verify in ten seconds</div>
              </div>
            </div>
            <p>A certificate is easy to get and easy to list. Thousands of candidates hold the same one. A recruiter has no way to tell what you can actually do from it.</p>
            <p>A deployed project is different. It is specific to you, it can be clicked, and it invites questions. "How did you decide on that database?" is a question only a builder can answer.</p>
            <div className="chart-wrap">
              <div className="chart-label">Strength of each signal for a fresher (illustrative)</div>
              <div style={{ height: 300 }}>
                <canvas id="powSignalChart" />
              </div>
            </div>
            <div className="highlight">
              Hiring managers <strong>reportedly score a deployed project far higher than a certificate</strong>. Treat the exact multiple as an estimate. The direction is consistent across what recruiters say.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">The Three Kinds of Projects That Move Shortlists</div>
                <div className="sec-sub">Pick one of these, not another tutorial</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>What it signals</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Solve a real problem</strong></td>
                  <td><span className="tag-pill pill-green">Strongest</span> Initiative and judgement</td>
                  <td>A fee tracker your college society actually uses</td>
                </tr>
                <tr>
                  <td><strong>A clone with a genuine twist</strong></td>
                  <td><span className="tag-pill pill-amber">Good</span> You can build and also adapt</td>
                  <td>A to-do app that syncs with exam timetables</td>
                </tr>
                <tr>
                  <td><strong>Open-source contribution</strong></td>
                  <td><span className="tag-pill pill-green">Strongest</span> You can work in someone else's code</td>
                  <td>A merged docs or bug fix in a known library</td>
                </tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">Shortlist signal by project type (illustrative)</div>
              <div style={{ height: 260 }}>
                <canvas id="powFieldChart" />
              </div>
            </div>
            <div className="pull-quote">
              <p>"Show me one thing you built, who used it, and what changed. I do not need five."</p>
              <span className="pq-source">Common refrain among hiring managers</span>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Projects by Field</div>
                <div className="sec-sub">What to build depends on the job you want</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Engineering:</strong> a deployed full-stack app or API with a README, tests and a live URL. GitHub is your portfolio.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Data:</strong> an analysis on a messy public dataset with a clear question, a chart-led write-up and a notebook anyone can run.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Design:</strong> two or three case studies showing the problem, your process and the outcome. A portfolio site is non-negotiable.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Marketing:</strong> a real campaign, even small. A page you grew, a newsletter, a local business you helped, with numbers.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Content:</strong> a published body of work. A blog, a channel or a newsletter with a consistent topic beats a folder of drafts.</span></div>
            </div>
            <div className="callout">
              <strong>No experience yet?</strong> Pick a problem near you. A club, a shop, a hostel, a family business. A real user with a real need makes a small project credible.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">How to Present a Project</div>
                <div className="sec-sub">Problem, what you did, result, link</div>
              </div>
            </div>
            <p>Recruiters skim. Give them a four-part entry they can read in one pass.</p>
            <div className="chart-wrap">
              <div className="chart-label">Where a recruiter's attention goes on a project entry (illustrative)</div>
              <div style={{ height: 260 }}>
                <canvas id="powScanChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Problem:</strong> one line on who had the problem and why it mattered.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>What you did:</strong> your role, the stack or method, and one hard decision you made.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Result:</strong> a number if you have one. Users, time saved, sign-ups, reach.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Link:</strong> a live URL or a short demo video. Put it on the same line as the title.</span></div>
            </div>
            <div className="highlight">
              Compare "Built a website for a bakery" with <strong>"Built an order page for a local bakery. 40 orders in the first month."</strong> Same project, very different shortlist odds.
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">GitHub and Portfolio Hygiene</div>
                <div className="sec-sub">Ten minutes of cleanup that changes first impressions</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Write a README for every pinned repo:</strong> what it does, a screenshot, how to run it, and the live link at the top.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Pin your best three to six repos:</strong> hide or archive the rest. Your pinned section is your shop window.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Keep a live link that works:</strong> check it before every application. A dead demo is worse than none.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Use a clear profile:</strong> real name, short bio, a photo, and your email or LinkedIn.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Portfolio, if your field needs one:</strong> a single page, your best three pieces first, and a clear way to contact you.</span></div>
            </div>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">Mistakes That Cost You the Shortlist</div>
                <div className="sec-sub">Common and all fixable</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Tutorial clones with no change:</strong> the same weather app, the same Netflix clone. Recruiters have seen it hundreds of times.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Dead links:</strong> a broken demo or a private repo tells the recruiter you do not check your work.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>No README:</strong> code with no explanation is skipped in seconds.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Too many projects:</strong> ten thin entries hide the one good one.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>No result:</strong> describing features instead of outcomes.</span></div>
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The project and portfolio questions students ask most</div>
              </div>
            </div>
            {FAQ.map((f) => (
              <div className="faq-item" key={f.q}>
                <div className="faq-q">{f.q}</div>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>

          {/* Takeaway */}
          <div className="takeaway-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6d28d9" }}>→</div>
              <div>
                <div className="sec-title" style={{ color: "#3b0764" }}>What This Means For You</div>
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to spend your next month</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Stop collecting certificates. Build one thing that matters, put it online and write it up well:</p>
            <div className="blist">
              {[
                ["Pick one real problem", "Choose a problem near you and a real user. Scope it so you can ship in two to four weeks."],
                ["Ship it with a link", "Deploy it or record a demo. A clickable link is the difference between a claim and proof."],
                ["Write the result", "Add one number and one sentence on what changed. That line is what recruiters remember."],
                ["Put it on your resume and reach out", "List it first, then message the hiring manager with the link. Outreach with proof gets replies."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" style={{ background: "#6d28d9" }} />
                  <span style={{ color: "#3b0764" }}><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related reports */}
          <div className="related">
            <h2>Related reports</h2>
            <div className="related-grid">
              <Link to="/reports/ats-resume-report-2026" className="related-card">
                <div className="rc-kicker">Resumes</div>
                <div className="rc-title">How an ATS Actually Reads Your Resume</div>
              </Link>
              <Link to="/reports/skills-ai-entry-level-2026" className="related-card">
                <div className="rc-kicker">AI skills</div>
                <div className="rc-title">Breaking Into AI in 2026: Skills and Hiring Reality</div>
              </Link>
              <Link to="/reports/degree-vs-skills-2026" className="related-card">
                <div className="rc-kicker">Screening</div>
                <div className="rc-title">Degree vs Skills: What Hirers Actually Look At</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Put your best project first.</h3>
              <p>Build a clean, ATS-safe resume with your projects up top, then use Outreach to send the link to the people who hire.</p>
            </div>
            <Link to="/resume-maker" className="rpt-cta-btn">
              Build Your Resume Free →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
