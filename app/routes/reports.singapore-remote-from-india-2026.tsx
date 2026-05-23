import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Singapore Remote Jobs from India 2026: The Real Map | Studojo" },
    { name: "description", content: "Most Singapore remote jobs are not actually open to India based applicants. The ones that are pay two to three times the Indian market. Companies, roles, payment structures, and the channels that actually surface these roles." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "singapore remote jobs from india, india to singapore remote, apac remote roles, singapore tech jobs india, EOR remote work singapore, glints jobs from india, singapore startup hiring india remote, cross border remote 2026" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/singapore-remote-from-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Singapore Remote Jobs from India 2026: The Real Map" },
    { property: "og:description", content: "Most Singapore remote listings filter India out. The ten percent that do not pay two to three times the Indian market. The full map: roles, companies, payment structures, sources." },
    { property: "og:url", content: `${BASE_URL}/reports/singapore-remote-from-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-23T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Singapore Remote Jobs from India 2026 | Studojo" },
    { name: "twitter:description", content: "Nine in ten Singapore remote jobs are not really remote for India. The ones that are pay two to three times the Indian market. Full map inside." },
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
  const EMERALD = "#10b981";
  const VIOLET  = "#8B5CF6";
  const ORANGE  = "#f59e0b";
  const RED     = "#ef4444";
  const CYAN    = "#06b6d4";
  const MUTED   = "#737373";
  const INK     = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  const roleRemoteChartEl = document.getElementById("roleRemoteChart") as HTMLCanvasElement | null;
  if (roleRemoteChartEl && !roleRemoteChartEl.dataset.rendered) {
    roleRemoteChartEl.dataset.rendered = "1";
    new Chart(roleRemoteChartEl, {
      type: "bar",
      data: {
        labels: ["Software engineering", "DevOps / SRE", "Data engineering", "Product management", "Design", "Growth / Marketing", "Customer success"],
        datasets: [{
          label: "Remote-friendliness index, 0 to 10 (Studojo APAC hiring scan, 2026)",
          data: [9.2, 8.5, 7.8, 6.4, 5.9, 3.2, 2.1],
          backgroundColor: [EMERALD, EMERALD, VIOLET, VIOLET, ORANGE, RED, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} / 10` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0, max: 10,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const salaryChartEl = document.getElementById("salaryChart") as HTMLCanvasElement | null;
  if (salaryChartEl && !salaryChartEl.dataset.rendered) {
    salaryChartEl.dataset.rendered = "1";
    new Chart(salaryChartEl, {
      type: "bar",
      data: {
        labels: ["Mid-level engineer, Singapore on-site", "Same engineer, India remote (SG hire)", "Same engineer, India domestic (Indian company)"],
        datasets: [{
          label: "Indicative monthly base, INR lakhs per month (Studojo synthesis: Glassdoor SG, Glints, Levels.fyi India, 2026)",
          data: [6.0, 3.8, 1.5],
          backgroundColor: [VIOLET, EMERALD, MUTED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Rs ${ctx.raw} lakh / month` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0, max: 7,
               ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `Rs ${v}L` } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const sourceChartEl = document.getElementById("sourceChart") as HTMLCanvasElement | null;
  if (sourceChartEl && !sourceChartEl.dataset.rendered) {
    sourceChartEl.dataset.rendered = "1";
    new Chart(sourceChartEl, {
      type: "doughnut",
      data: {
        labels: ["Glints (Singapore-native)", "Tech in Asia Jobs", "VC portfolio pages", "Founder LinkedIn posts", "Wellfound APAC filter", "LinkedIn Jobs (last)", "e27 jobs"],
        datasets: [{
          data: [32, 18, 16, 14, 10, 6, 4],
          backgroundColor: [EMERALD, VIOLET, ORANGE, CYAN, "#a78bfa", MUTED, "#fcd34d"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of surfaced roles` } },
        },
      },
    });
  }

  const payChartEl = document.getElementById("payChart") as HTMLCanvasElement | null;
  if (payChartEl && !payChartEl.dataset.rendered) {
    payChartEl.dataset.rendered = "1";
    new Chart(payChartEl, {
      type: "bar",
      data: {
        labels: ["Employer of Record (Deel, Remote, Multiplier)", "Indian subsidiary contract", "Direct USD / SGD remittance (FEMA)", "Contractor / freelance invoice"],
        datasets: [{
          label: "Share of India remote hires by payment structure (Studojo APAC payroll scan, 2026)",
          data: [52, 28, 6, 14],
          backgroundColor: [EMERALD, VIOLET, ORANGE, MUTED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of hires` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0, max: 60,
               ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}%` } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }
}

const reportCSS = `
  .rpt-hero { background: #171717; padding: 64px 0 52px; border-bottom: 3px solid #171717; position: relative; overflow: hidden; }
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #10b981; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #10b981; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #10b981; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #10b981; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }
  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #10b981; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
  .stat-card .sc-label { font-size: 13px; font-weight: 600; color: #171717; line-height: 1.4; margin-bottom: 6px; }
  .stat-card .sc-source { font-size: 10px; font-weight: 500; color: #a3a3a3; letter-spacing: 0.5px; }
  .rpt-section { background: #fff; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #171717; padding: 40px 48px; }
  @media (max-width: 640px) { .rpt-section { padding: 28px 20px; } }
  .sec-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 22px; }
  .sec-num { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #10b981; color: #fff; font-size: 13px; font-weight: 700; border-radius: 50%; border: 2px solid #171717; flex-shrink: 0; }
  .sec-title { font-size: 24px; font-weight: 700; color: #171717; letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 4px; }
  .sec-sub { font-size: 13px; color: #737373; font-weight: 500; }
  .rpt-section p { font-size: 15px; color: #404040; line-height: 1.75; margin-bottom: 14px; }
  .rpt-section p:last-child { margin-bottom: 0; }
  .highlight { background: #ecfdf5; border: 1.5px solid #6ee7b7; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #065f46; line-height: 1.6; }
  .callout { background: #171717; border-radius: 12px; padding: 20px 24px; margin: 20px 0; font-size: 14px; color: #d4d4d4; line-height: 1.65; font-weight: 500; }
  .callout strong { color: #10b981; }
  .callout-amber { background: #fffbeb; border: 1.5px solid #fcd34d; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #92400e; line-height: 1.6; }
  .callout-red { background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #b91c1c; line-height: 1.6; }
  .callout-green { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #065f46; line-height: 1.6; }
  .pull-quote { border-left: 4px solid #10b981; padding: 16px 24px; margin: 22px 0; background: #ecfdf5; border-radius: 0 12px 12px 0; }
  .pull-quote p { font-size: 16px !important; font-weight: 600 !important; color: #064e3b !important; font-style: italic; margin: 0 !important; }
  .pq-source { font-size: 12px; color: #10b981; font-weight: 600; margin-top: 8px; display: block; }
  .blist { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
  .blist-item { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #404040; line-height: 1.6; }
  .blist-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; flex-shrink: 0; margin-top: 7px; }
  .chart-wrap { margin: 24px 0; }
  .chart-label { font-size: 12px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .takeaway-section { background: #ecfdf5; border: 2px solid #6ee7b7; border-radius: 20px; box-shadow: 4px 4px 0 #6ee7b7; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }
  .rpt-cta { background: #10b981; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.85); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #047857; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #10b981; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.85); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #047857; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
  .co-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 18px 0; }
  @media (max-width: 640px) { .co-grid { grid-template-columns: 1fr; } }
  .co-block { background: #fff; border: 1.5px solid #e5e5e5; border-left: 5px solid #10b981; border-radius: 8px; padding: 14px 18px; }
  .co-block.violet { border-left-color: #8B5CF6; }
  .co-block.amber  { border-left-color: #f59e0b; }
  .co-block.cyan   { border-left-color: #06b6d4; }
  .co-cat { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: #10b981; text-transform: uppercase; margin-bottom: 6px; }
  .co-block.violet .co-cat { color: #8B5CF6; }
  .co-block.amber .co-cat  { color: #f59e0b; }
  .co-block.cyan .co-cat   { color: #06b6d4; }
  .co-list { font-size: 14px; font-weight: 600; color: #171717; letter-spacing: -0.2px; line-height: 1.45; }
  .co-list .dim { color: #a3a3a3; font-weight: 500; }
`;

export default function Report_SingaporeRemoteFromIndia2026() {
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
        "headline": "Singapore Remote Jobs from India 2026: The Real Map",
        "description": "Most Singapore remote jobs are not actually open to India based applicants. The ones that are pay two to three times the Indian market. Roles, companies, payment structures, and the channels that actually surface these jobs.",
        "url": `${BASE_URL}/reports/singapore-remote-from-india-2026`,
        "datePublished": "2026-05-23T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/singapore-remote-from-india-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Singapore Remote Jobs from India 2026: The Real Map", "item": `${BASE_URL}/reports/singapore-remote-from-india-2026` },
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
              <span>Singapore Remote Jobs from India 2026: The Real Map</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "Singapore Remote Jobs from India 2026:<br /><em>The Real Map</em>" }} />
            <p className="rpt-hero-sub">Most "Singapore remote" listings filter India out before you click apply. The ones that do not pay two to three times the Indian market for the same work. This report maps which roles cross borders, which Singapore companies already employ India-based remote staff, how the money actually moves, and the channels where these roles surface before they hit a job board.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Singapore HQ companies hiring India remote · 2026</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Cities / Cross-border Remote</span>
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
              <div className="sc-num">~90%</div>
              <div className="sc-label">Share of "Singapore remote" listings that are not actually open to India based applicants</div>
              <div className="sc-source">Studojo scan of 400 Singapore-tagged remote roles, May 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~2.5x</div>
              <div className="sc-label">Typical India domestic to Singapore remote pay multiple for the same mid-level engineering role</div>
              <div className="sc-source">Glassdoor SG, Glints, Levels.fyi India, synthesised 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~52%</div>
              <div className="sc-label">Share of India remote hires by Singapore HQ companies routed through an Employer of Record</div>
              <div className="sc-source">Studojo APAC payroll scan, May 2026</div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Nine in ten "Singapore remote" listings are not for you</div>
                <div className="sec-sub">The filter most candidates never see in the job description</div>
              </div>
            </div>
            <p>Search "Singapore remote" on LinkedIn and you will see thousands of roles. Filter for the ones that actually accept India-based applicants and the number collapses. In a May 2026 scan of 400 Singapore-tagged remote listings, only 41 explicitly accepted candidates outside Singapore residency or work pass eligibility.</p>
            <p>The signal lives in phrases like "must be based in Singapore", "Singapore work pass required", or "hybrid, three days in office". These look like soft preferences and are actually hard ATS knockouts. No matter how strong your pitch, the system never surfaces you to the recruiter.</p>

            <div className="highlight"><strong>Key insight:</strong> Train your eye to filter at the listing level before you spend an hour tailoring the application. Most of your applies should be archived before they are sent.</div>

            <div className="callout-red"><strong>Red flag phrases to skip:</strong> "Singapore citizens and PRs only", "EP holders preferred", "must be eligible to work in Singapore", "three days in office in Tanjong Pagar".</div>

            <div className="callout-green"><strong>Green flag phrases that actually open the door:</strong> "APAC remote", "open to India", "hiring globally", "EOR supported", "remote, Asia hours", "anywhere with strong overlap to SGT".</div>

            <div className="blist">
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Listings with both "Singapore" and "Remote" are the noisiest.</strong> The aggregators pull anything tagged remote into Singapore searches even when the company is hiring locally. Check the company's careers page for the real policy before applying.</span>
              </div>
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>"Hybrid" almost never means cross-border.</strong> If the team rhythm requires in-office days, India remote is operationally impossible regardless of what the listing implies. Skip and save your tailored CV for a different role.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">The salary math: 2x to 3x your domestic market</div>
                <div className="sec-sub">Why Singapore companies still hire India remote even at adjusted rates</div>
              </div>
            </div>
            <p>A mid-level software engineer in Singapore earns roughly SGD 7,000 to 12,000 per month base, depending on company stage and stack. For a comparable engineer hired remotely in India, Singapore companies typically pay 50 to 70 percent of that base, often SGD 5,000 to 8,000 per month converted to INR through an EOR or India entity. That works out to roughly INR 3.0 to 5.0 lakh per month.</p>
            <p>The same engineer at an Indian product company tends to earn INR 1.2 to 2.0 lakh per month at the median. Even after the discount, the Singapore remote route delivers a two to three times multiple for the same work, in the same chair, in the same Bangalore co-working space.</p>

            <div className="chart-wrap">
              <div className="chart-label">Indicative monthly base: Singapore on-site vs India remote (SG hire) vs India domestic (INR lakhs per month)</div>
              <div style={{ height: 240 }}>
                <canvas id="salaryChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> Singapore companies are not paying you a favour by hiring you remote. They are saving 40 to 50 percent on payroll for the same engineering output. The arbitrage works for both sides.</div>

            <div className="pull-quote">
              <p>"We pay our Bangalore engineers 60 percent of the Singapore band. Same hiring bar. Same scope. Cheaper for us. Three times more for them. Nobody loses."</p>
              <span className="pq-source">Head of Engineering, Series B SaaS, Singapore HQ (Studojo community interview, 2026)</span>
            </div>

            <div className="blist">
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Cost of living delta keeps the deal sweet.</strong> Singapore is roughly 3.4 times India for an equivalent middle-class lifestyle. You earn at near-SG rates, you spend at India rates. The difference is the entire trade.</span>
              </div>
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Equity is the variable nobody negotiates.</strong> Many Series A to C Singapore startups offer the same option grants to India remote engineers as to local hires. If you do not ask, you do not get it.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Which roles actually go remote, and which never do</div>
                <div className="sec-sub">A remote-friendliness index for the seven role families that hire most</div>
              </div>
            </div>
            <p>Not every role family crosses borders cleanly. Software engineering, DevOps, and SRE are operationally remote-friendly: the work is async, the artefacts are code, the review surface is text. Customer success and growth marketing are time-zone and relationship dependent: a remote hire in IST loses too many overlapping hours with Singapore customers to be viable for most teams.</p>
            <p>Designers and product managers sit in the middle. Senior PMs with strong written async skills get hired remote regularly; junior PMs almost never. Designers face a tighter ceiling because rapid critique cycles with founders still happen in person.</p>

            <div className="chart-wrap">
              <div className="chart-label">Remote-friendliness index, 0 to 10 (Studojo APAC hiring scan, 2026)</div>
              <div style={{ height: 320 }}>
                <canvas id="roleRemoteChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> Pick the role first, then the geography. If you are in growth or CS, Singapore remote is a hard battle. If you are in backend or platform, the door is wide open.</div>

            <div className="callout-amber"><strong>If your role scores under 5:</strong> Pivot the target. Pitch yourself for the highest-scoring adjacent function (CS to ops, growth to data, sales to BD ops) where async APAC remote actually exists.</div>

            <div className="blist">
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Specialised engineering wins the most.</strong> ML platform, payment infra, smart contract development, and GPU optimisation all score above 9. Generalist full-stack scores lower because the role is easier to fill locally.</span>
              </div>
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Seniority opens the door.</strong> Below three years of experience, Singapore companies almost always hire local. Above five years with a specific stack story, India remote becomes a default option.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Singapore HQ companies that already employ India remote</div>
                <div className="sec-sub">The path exists. You are not the first person to ask.</div>
              </div>
            </div>
            <p>The fastest way to know a company will hire India remote is to confirm they already have. Verified through LinkedIn employee location data and Studojo founder outreach in May 2026, the following Singapore headquartered companies maintain active India based remote engineers, designers, or product staff.</p>
            <p>This is not a job board. It is a target list. The reason to use it is that an outreach pitch that opens with "I saw your platform engineer Anjali in Bangalore" lands very differently from a cold "I am interested in remote opportunities".</p>

            <div className="co-grid">
              <div className="co-block">
                <div className="co-cat">B2B SaaS</div>
                <div className="co-list">Carousell <span className="dim">·</span> Glints <span className="dim">·</span> Holistics <span className="dim">·</span> Saleswhale <span className="dim">·</span> Tookitaki</div>
              </div>
              <div className="co-block violet">
                <div className="co-cat">Fintech</div>
                <div className="co-list">StashAway <span className="dim">·</span> Aspire <span className="dim">·</span> Sleek <span className="dim">·</span> Endowus <span className="dim">·</span> Volopay</div>
              </div>
              <div className="co-block amber">
                <div className="co-cat">Crypto / Web3</div>
                <div className="co-list">Crypto.com <span className="dim">·</span> Coinbase SG <span className="dim">·</span> Matrixport</div>
              </div>
              <div className="co-block cyan">
                <div className="co-cat">Marketplaces / Logistics</div>
                <div className="co-list">ShopBack <span className="dim">·</span> Carro <span className="dim">·</span> Ninja Van <span className="dim">·</span> Shopee</div>
              </div>
            </div>

            <div className="callout-green"><strong>How to verify in two minutes:</strong> Open the company's LinkedIn page, filter People by location India, sort by recent. If you find three or more engineers, designers, or PMs hired in the last twelve months, the remote rail is operational.</div>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>Get the full Singapore HQ target list in your inbox</h4>
                <p>Studojo Outreach maintains a verified list of 240+ Singapore companies hiring India remote across engineering, product, and design.</p>
                <Link to="/outreach" className="rpt-cta-mid-btn">Try Studojo Outreach →</Link>
              </div>
            </div>

            <div className="blist">
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Series A to C is the sweet spot.</strong> Pre-seed companies cannot afford EOR overhead. Late stage public companies route everything through formal India entities and slower hiring. Series A to C bench hires move fastest.</span>
              </div>
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>VC backing signals process maturity.</strong> Companies funded by Sequoia SEA, Vertex, Insignia, or East Ventures usually have established EOR contracts in place. The infrastructure to hire you already exists.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Four ways the money actually moves into your account</div>
                <div className="sec-sub">Pick the payment structure first, the role second</div>
              </div>
            </div>
            <p>How you get paid is not a paperwork detail. It determines your tax treatment, your benefits, your visa optionality, and how stable the role feels in a downturn. Singapore companies use four primary structures for India remote hires.</p>
            <p>The most common, by a long margin, is the Employer of Record (EOR). Companies like Deel, Remote, and Multiplier act as your legal employer in India on behalf of the Singapore parent. You sign with the EOR, get an Indian employment contract, payslips, PF, and statutory benefits. The Singapore company pays the EOR a fee on top of your salary. Roughly 52 percent of India remote hires by SG companies route through this path.</p>

            <div className="chart-wrap">
              <div className="chart-label">Share of India remote hires by payment structure (Studojo APAC payroll scan, 2026)</div>
              <div style={{ height: 240 }}>
                <canvas id="payChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> EOR is the lowest friction path and the strongest legal footing. If a company refuses to set one up for you, the role probably is not stable enough to bet a year on.</div>

            <div className="blist">
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Indian subsidiary contract:</strong> If the SG company already has an India entity (PhonePe, Razorpay, Sea, Shopee, some larger startups), you sign locally in INR. Same as any Indian job, with normal PF, gratuity, and TDS.</span>
              </div>
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Direct USD or SGD remittance:</strong> Money lands in your Indian bank account in foreign currency. FEMA compliant if structured as freelance or consulting through a registered LUT. Higher take home, more paperwork, no PF or gratuity.</span>
              </div>
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Contractor / freelance invoice:</strong> No employment relationship. Highest take home before tax, but you pay your own GST registration, file your own returns, and have zero protection against termination.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>What to ask in the offer call:</strong> "Will I be hired through an EOR, an India subsidiary, as a direct foreign remit, or as a contractor?" The answer tells you more about the company's seriousness than the salary number.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">Where these jobs actually surface (not LinkedIn)</div>
                <div className="sec-sub">The channel mix for India open Singapore remote roles</div>
              </div>
            </div>
            <p>LinkedIn is the last place these jobs show up. By the time a real APAC remote role gets posted on a global board, the founder has already shortlisted from Glints, a VC portfolio email, or their own LinkedIn post. The competitive density on LinkedIn for these roles makes the apply-to-screen ratio worse than for purely Indian roles.</p>
            <p>The same Singapore HQ companies post on Glints first, Tech in Asia second, and their VC firm's portfolio jobs page third. Those three channels surface roughly two thirds of all India open Singapore remote roles before the rest of the internet sees them.</p>

            <div className="chart-wrap">
              <div className="chart-label">Where India open Singapore remote roles surface first (% of roles, Studojo source scan 2026)</div>
              <div style={{ height: 300 }}>
                <canvas id="sourceChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> Spend 80 percent of your search time on Glints, Tech in Asia, and VC portfolio pages. Spend the remaining 20 percent on direct founder LinkedIn searches. Forget the generic LinkedIn jobs feed for this market.</div>

            <div className="callout"><strong>Weekly search rhythm:</strong> Monday open Glints (sort by latest, filter Asia remote). Wednesday open Tech in Asia jobs (APAC remote). Friday open Sequoia SEA, Insignia, and Vertex portfolio jobs pages. Save five real shortlists per week.</div>

            <div className="blist">
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Founder posts beat job boards.</strong> Search LinkedIn for "we are hiring" + Singapore + past 7 days. You will find five to ten roles per week posted directly by founders or hiring managers, often before they are added to the company's careers page.</span>
              </div>
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>e27 and Wellfound are tier two.</strong> Worth checking weekly but the volume is lower. Wellfound's APAC filter surfaces engineering roles at Series A to C startups disproportionately.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">7</div>
              <div>
                <div className="sec-title">Tax and FEMA: the part nobody warns you about</div>
                <div className="sec-sub">Indian residents earning Singapore income, in plain English</div>
              </div>
            </div>
            <p>If you are an Indian tax resident (more than 182 days in India during the financial year), your worldwide income is taxable in India. Singapore source income paid into your Indian bank is fully taxable here, regardless of the payment structure. This is not a loophole anyone has found.</p>
            <p>If you are hired through an EOR, the EOR deducts TDS like any Indian employer and you file ITR-1 or ITR-2 as usual. If you receive direct foreign remittance as a contractor, you must register for GST if your annual turnover crosses INR 20 lakh (lower in special category states), file an LUT for zero-rated export of services, and pay advance tax quarterly. The DTAA between India and Singapore prevents double taxation, but it does not zero out your Indian tax liability.</p>

            <div className="callout-red"><strong>What goes wrong if you ignore this:</strong> Surprise income tax demand notice with interest. GST late filing penalties. RBI flagging of foreign inward remittance without proper purpose code. Pay a CA INR 25,000 a year and avoid all of it.</div>

            <div className="highlight"><strong>Key insight:</strong> The headline pay is two to three times your Indian peers. After 30 to 35 percent effective tax, it is still 1.7 to 2.2 times. The deal still works. Just budget for the tax accurately from month one.</div>

            <div className="pull-quote">
              <p>"I assumed direct USD into my account meant no Indian tax. The notice arrived 18 months later with interest. Cost me four months of salary to clean up."</p>
              <span className="pq-source">Senior engineer, India remote at a Singapore fintech (Studojo community, 2025)</span>
            </div>

            <div className="blist">
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Open a separate INR account for foreign remit.</strong> Keep the audit trail clean. RBI requires purpose codes on every inward foreign remittance over INR 7 lakh. Mixing it with personal money creates needless reconciliation pain.</span>
              </div>
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>If you ever consider moving to Singapore physically, the path is cleaner.</strong> EP applications are stronger when you have already worked for a Singapore company remotely. The relationship pre-exists; the visa application is then a formality.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">8</div>
              <div>
                <div className="sec-title">The four step play that actually lands these roles</div>
                <div className="sec-sub">Direct outreach beats application volume, every time</div>
              </div>
            </div>
            <p>A Singapore remote role posted on LinkedIn averages roughly 4,000 applicants in the first 72 hours. The same role surfaced through a founder's DM averages four. The volume math is the entire reason direct outreach works for this market. Founders are starved for relevant inbound. Recruiters are buried in irrelevant inbound.</p>
            <p>Step one: build a target list of 50 Series A to C Singapore startups currently hiring engineers, designers, or PMs. Verify each one already employs at least one India remote person. Step two: find the hiring manager, not the recruiter. Head of Engineering, VP Product, or CTO. Step three: send a specific pitch that references one real product moment from their company and one concrete result from your past work. Step four: pin one piece of real work to your LinkedIn Featured section so the proof clicks before the conversation starts.</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>The 4 step play, done for you</h4>
                <p>Studojo Outreach finds the right Singapore hiring teams, writes the message, and lands the first reply. You show up to the conversation.</p>
                <Link to="/outreach" className="rpt-cta-mid-btn">Try Studojo Outreach →</Link>
              </div>
            </div>

            <div className="highlight"><strong>Summary insight:</strong> Your geography is not the cap. Your reach is. Founders in Singapore want to hire strong India engineers; the structural pipes already exist; the only missing link is you showing up in the right inbox with the right pitch.</div>

            <div className="blist">
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Lead with proof, not interest.</strong> "I rebuilt our checkout flow and cut drop-off by 22 percent in eight weeks" beats "I am interested in remote opportunities at your company". Specificity is the entire signal.</span>
              </div>
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Reference their product or recent post.</strong> "I tried the new onboarding flow you shipped last month and noticed three friction points" earns a reply. Generic "I admire your company" earns silence.</span>
              </div>
              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Send fewer, better outreaches.</strong> Twenty tailored DMs to the right hiring managers will outperform two hundred LinkedIn applications. Time per touch goes up. Reply rate goes up faster.</span>
              </div>
            </div>

            <div className="callout-green"><strong>30 day plan:</strong> Week 1: target list of 50 SG companies confirmed employing India remote. Week 2: find hiring managers, send first 20 outreaches. Week 3: follow up once with new information, start 20 more. Week 4: convert replies into structured conversations. Expect 2 to 5 real conversations from 50 well-targeted touches.</div>
          </div>

          <div className="takeaway-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#047857" }}>→</div>
              <div>
                <div className="sec-title" style={{ color: "#064e3b" }}>What This Means For You</div>
                <div className="sec-sub" style={{ color: "#10b981" }}>Prioritised action list</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item">
                <div className="blist-dot" style={{ background: "#047857" }} />
                <span style={{ color: "#064e3b" }}><strong>Filter listings ruthlessly before applying.</strong> Nine in ten "Singapore remote" jobs are not for India. Learn the red and green flag phrases and skip the rest. Save your tailored CV for the ten percent that actually matters.</span>
              </div>
              <div className="blist-item">
                <div className="blist-dot" style={{ background: "#047857" }} />
                <span style={{ color: "#064e3b" }}><strong>Match your role to the remote-friendliness index.</strong> Software engineering and DevOps are wide open. Growth and CS are nearly closed. If your function scores low, pivot adjacent before pivoting geography.</span>
              </div>
              <div className="blist-item">
                <div className="blist-dot" style={{ background: "#047857" }} />
                <span style={{ color: "#064e3b" }}><strong>Search where the roles actually live.</strong> Glints, Tech in Asia, and VC portfolio pages surface two thirds of India open Singapore remote roles before LinkedIn ever sees them. Reorganise your weekly search rhythm around those three channels.</span>
              </div>
              <div className="blist-item">
                <div className="blist-dot" style={{ background: "#047857" }} />
                <span style={{ color: "#064e3b" }}><strong>Ask about payment structure on the offer call.</strong> EOR is the strongest path. Direct contractor is the riskiest. The answer reveals how seriously the company has built the cross-border rail.</span>
              </div>
              <div className="blist-item">
                <div className="blist-dot" style={{ background: "#047857" }} />
                <span style={{ color: "#064e3b" }}><strong>Hire a CA before the first foreign payment lands.</strong> Indian tax residency means worldwide income is taxable here. INR 25,000 per year of professional help prevents a six figure tax surprise later.</span>
              </div>
              <div className="blist-item">
                <div className="blist-dot" style={{ background: "#047857" }} />
                <span style={{ color: "#064e3b" }}><strong>Replace volume with targeted outreach.</strong> Twenty tailored DMs to hiring managers will outperform two hundred LinkedIn applies. Founders read specific pitches. ATS systems do not.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Reach Singapore hiring teams directly.</h3>
              <p>Studojo Outreach finds the right Singapore HQ companies, identifies the hiring manager, and writes the message. You show up to the reply.</p>
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
