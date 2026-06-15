import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The First ₹1 Lakh/Month Report: The Fastest Paths Students Actually Use | Studojo" },
    { name: "description", content: "How students in India actually reach ₹1 lakh/month: product campus offers, startup SDE, freelancing, sales commissions, and finance tracks. Timelines, INR bands, and what to skip." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "1 lakh per month salary India, how to earn 1 lakh monthly student, highest fresher salary India 2026, product company salary India, freelancing 1 lakh month India, fastest way earn lakh month" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/first-1-lakh-month-report-fastest-paths-students-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The First ₹1 Lakh/Month Report: The Fastest Paths Students Actually Use" },
    { property: "og:description", content: "₹1 lakh/month is rare at graduation and common by year three for students who pick the right lane. The paths, timelines, and traps." },
    { property: "og:url", content: `${BASE_URL}/reports/first-1-lakh-month-report-fastest-paths-students-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-06-12T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The First ₹1 Lakh/Month Report: The Fastest Paths Students Actually Use | Studojo" },
    { name: "twitter:description", content: "The fastest paths students actually use to hit ₹1 lakh/month in India. Product, freelancing, sales, finance. With timelines." },
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

  const pathTimelineChartEl = document.getElementById("pathTimelineChart") as HTMLCanvasElement | null;
  if (pathTimelineChartEl && !pathTimelineChartEl.dataset.rendered) {
    pathTimelineChartEl.dataset.rendered = "1";
    new Chart(pathTimelineChartEl, {
      type: "bar",
      data: {
        labels: ["FAANG / top product campus offer", "Funded startup SDE (tier-1 pipeline)", "International freelancing (dev or growth)", "B2B sales with uncapped commission", "IT services → product company switch", "Investment banking / top finance track"],
        datasets: [{
          label: "Typical months to first ₹1 lakh/month in-hand by path (median student, illustrative)",
          data: [0.0, 6.0, 12.0, 18.0, 30.0, 36.0],
          backgroundColor: ["#10b981", "#34d399", "#8B5CF6", "#f59e0b", "#737373", "#6d28d9"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} mo` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 42.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const pathMixChartEl = document.getElementById("pathMixChart") as HTMLCanvasElement | null;
  if (pathMixChartEl && !pathMixChartEl.dataset.rendered) {
    pathMixChartEl.dataset.rendered = "1";
    new Chart(pathMixChartEl, {
      type: "doughnut",
      data: {
        labels: ["Product tech (campus or off-campus)", "Funded startup engineering", "Freelancing / contract (global clients)", "Sales or BD with commission", "Finance (IB, markets, consulting)", "Business / other"],
        datasets: [{
          data: [34.0, 22.0, 14.0, 12.0, 11.0, 7.0],
          backgroundColor: ["#10b981", "#34d399", "#8B5CF6", "#f59e0b", "#6d28d9", "#737373"],
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

  const monthlyInHandChartEl = document.getElementById("monthlyInHandChart") as HTMLCanvasElement | null;
  if (monthlyInHandChartEl && !monthlyInHandChartEl.dataset.rendered) {
    monthlyInHandChartEl.dataset.rendered = "1";
    new Chart(monthlyInHandChartEl, {
      type: "bar",
      data: {
        labels: ["IT services fresher (TCS, Infosys band)", "Mid startup SDE (₹12–18 LPA CTC)", "Top product fresher (₹20–35 LPA CTC)", "Freelancer at ₹1L/month run rate", "B2B sales at quota (base + commission)", "IB analyst at global bank"],
        datasets: [{
          label: "Illustrative monthly in-hand range by path at entry to ₹1L threshold (INR thousands)",
          data: [26.0, 75.0, 110.0, 100.0, 95.0, 105.0],
          backgroundColor: ["#737373", "#34d399", "#10b981", "#8B5CF6", "#f59e0b", "#6d28d9"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}K` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 120.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const ctcVsInHandChartEl = document.getElementById("ctcVsInHandChart") as HTMLCanvasElement | null;
  if (ctcVsInHandChartEl && !ctcVsInHandChartEl.dataset.rendered) {
    ctcVsInHandChartEl.dataset.rendered = "1";
    new Chart(ctcVsInHandChartEl, {
      type: "bar",
      data: {
        labels: ["₹4 LPA (IT services mass recruiter)", "₹8 LPA (mid startup / GCC)", "₹12 LPA (strong startup / lower product)", "₹18 LPA (top startup / lower FAANG)", "₹25 LPA (FAANG / top product band)"],
        datasets: [{
          label: "Annual CTC vs realistic monthly in-hand at fresher level (₹ thousands/month)",
          data: [27.0, 52.0, 72.0, 98.0, 125.0],
          backgroundColor: ["#737373", "#a3a3a3", "#34d399", "#10b981", "#059669"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}K/mo` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 140.0,
               ticks: { font: { size: 11 }, color: MUTED } },
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
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
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
  .rpt-cta { background: #10b981; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #10b981; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #10b981; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #10b981; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_First1LakhMonthReportFastestPathsStudents2026() {
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
        "headline": "The First ₹1 Lakh/Month Report: The Fastest Paths Students Actually Use",
        "description": "How students in India actually reach ₹1 lakh/month: product campus offers, startup SDE, freelancing, sales commissions, and finance tracks. Timelines, INR bands, and what to skip.",
        "url": `${BASE_URL}/reports/first-1-lakh-month-report-fastest-paths-students-2026`,
        "datePublished": "2026-06-12T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/first-1-lakh-month-report-fastest-paths-students-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The First ₹1 Lakh/Month Report: The Fastest Paths Students Actually Use", "item": `${BASE_URL}/reports/first-1-lakh-month-report-fastest-paths-students-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">{"Studojo Research · June 2026"}</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>{"The First ₹1 Lakh/Month Report: The Fastest Paths Students Actually Use"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The First ₹1 Lakh/Month Report:<br /><em>The Fastest Paths Students Actually Use</em>" }} />
            <p className="rpt-hero-sub">{"Social media shows the offer letter. It rarely shows the lane. We mapped six paths Indian students and early-career professionals actually use to cross ₹1 lakh per month in take-home pay: what each requires, how long it typically takes, where the ceiling sits, and which crowded strategies look busy but pay ₹25,000 for years."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India · Students and early-career (0 to 5 years)"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Career / Compensation"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">{"June 2026"}</span>
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
              <div className="sc-num">{"₹12L+"}</div>
              <div className="sc-label">{"Approximate annual CTC floor where ₹1 lakh/month in-hand becomes realistic after tax and PF deductions (metro, standard structure)"}</div>
              <div className="sc-source">{"Studojo in-hand synthesis from 2026 campus and payroll data"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"2–3×"}</div>
              <div className="sc-label">{"Typical salary gap between IT services and product companies at the same experience level in India tech"}</div>
              <div className="sc-source">{"Pathvio India Tech Salary Report 2026"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"~8×"}</div>
              <div className="sc-label">{"Gap between bottom-quartile and top-quartile campus offers for the same graduating batch in 2026 fresher market"}</div>
              <div className="sc-source">{"Recrew.ai software engineer salary guide, 2026"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"What ₹1 lakh/month actually means"}</div>
                <div className="sec-sub">{"CTC headlines vs the number that pays your rent"}</div>
              </div>
            </div>
            <p>{"Students chase CTC. Landlords cash in-hand cheques. ₹1 lakh per month in take-home pay typically requires roughly ₹12 lakh or more in annual CTC after income tax, provident fund, and standard deductions, assuming a metro location and a normal salary structure without large one-time bonuses counted as monthly income."}</p>
            <p>{"The 2026 fresher market is the most bifurcated it has been. Recrew.ai's salary synthesis puts the gap between bottom-quartile and top-quartile campus offers at nearly 8× for the same graduating year. A TCS or Infosys fresher at ₹3.5 to ₹4.5 LPA takes home roughly ₹22,000 to ₹30,000 per month. A Google, Microsoft, or Amazon India offer at ₹20 to ₹45 LPA can clear ₹1 lakh per month in-hand at the upper band. Same country. Same job title on LinkedIn. Different lane entirely."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> Before picking a path, decide whether you are optimising for CTC on an offer letter or in-hand cash every month. They diverge sharply at bonus-heavy and ESOP-heavy packages."}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"Annual CTC vs realistic monthly in-hand at fresher level (₹ thousands/month)"}</div>
              <div style={{ height: 260 }}>
                <canvas id="ctcVsInHandChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"ESOPs are not salary."}</strong> {"CRED, PhonePe, and Razorpay offers include meaningful equity upside, but vesting timelines mean your month-one bank balance runs on base plus joining bonus, not paper wealth."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"City changes the number."}</strong> {"₹1 lakh in-hand in Bangalore with rent shares differently than the same cheque in Mumbai or a tier-2 city where living costs are lower but offer bands are too."}</span>
              </div>
            </div>

            <div className="callout">{"<strong>Rule of thumb:</strong> Divide annual CTC by 14 (not 12) for a conservative monthly in-hand estimate on standard Indian payroll. Variable pay and ESOPs are upside, not rent money."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"Path 1: Top product campus offer (0 to 6 months)"}</div>
                <div className="sec-sub">{"The fastest lane if you already have DSA depth and a tier-1 pipeline"}</div>
              </div>
            </div>
            <p>{"For engineering students with strong competitive programming or DSA preparation, a campus offer from Google, Microsoft, Amazon, or a top Indian product company is the shortest path to ₹1 lakh per month. JoinSaarthi's 2026 fresher breakdown puts Google at ₹18 to ₹50 LPA, Microsoft at ₹20 to ₹45 LPA, and Amazon SDE-1 at ₹20 to ₹30 LPA. At the upper bands, monthly in-hand crosses ₹1 lakh without waiting for a promotion."}</p>
            <p>{"This path is narrow. Fewer than 1% of engineering graduates receive FAANG-tier campus offers in any given year. The screen is brutal: multiple DSA rounds, system design for some firms, and heavy competition from IITs, NITs, BITS, and IIITs. Off-campus routes exist but require the same skill bar with less scheduling predictability."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Typical months to first ₹1 lakh/month in-hand by path (median student, illustrative)"}</div>
              <div style={{ height: 320 }}>
                <canvas id="pathTimelineChart" />
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> This is the only path where ₹1 lakh/month can arrive at graduation. It is also the path with the lowest admission rate and the highest prep intensity."}</div>

            <div className="pull-quote">
              <p>{"\"The offer letter said ₹38 LPA. My first in-hand was ₹92,000. Close enough that I stopped doing the math and started doing the work.\""}</p>
              <span className="pq-source">{"SDE-1, global product company India (Studojo community, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Prep timeline is measured in years, not weeks."}</strong> {"Students who clear these screens typically start structured DSA practice 12 to 24 months before final-year placements, not after the placement season opens."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Branch and college still gate the first interview."}</strong> {"Off-campus hiring at this band exists, but referral and alumni paths into the loop are part of the game. Cold applications without proof rarely clear the resume screen."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Path 2: Funded startup SDE (6 to 18 months)"}</div>
                <div className="sec-sub">{"CRED, PhonePe, Razorpay, Swiggy, and the tier below FAANG"}</div>
              </div>
            </div>
            <p>{"If FAANG campus slots miss you, funded fintech and consumer startups are the next fastest lane. JoinSaarthi lists CRED at ₹15 to ₹25 LPA, PhonePe at ₹15 to ₹25 LPA, Razorpay at ₹12 to ₹18 LPA, and Swiggy at ₹12 to ₹22 LPA for engineering freshers in 2026. PhonePe's published fresher structure shows base salary of ₹14 to ₹20 lakh plus joining bonus, pushing total CTC toward ₹18 to ₹28 lakh for strong performers."}</p>
            <p>{"At ₹18 LPA and above, monthly in-hand typically lands in the ₹85,000 to ₹1.1 lakh range. A performance cycle or promotion within 12 months pushes many startup SDEs over the ₹1 lakh line without switching companies. The interview bar is high: machine coding, system design, and take-home assignments (CRED is known for 24-hour build tasks) filter harder than mass IT services screens."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> Startup SDE is the realistic \"almost ₹1 lakh\" path for strong engineers from tier-1 and tier-2 colleges who miss the FAANG slot but clear product-style interviews."}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"Illustrative monthly in-hand range by path at entry to ₹1L threshold (INR thousands)"}</div>
              <div style={{ height: 300 }}>
                <canvas id="monthlyInHandChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"ESOPs are the startup tax trade."}</strong> {"You accept slightly lower cash than FAANG for earlier responsibility and equity upside. Cash path to ₹1 lakh still works on base at the upper bands."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Off-campus is real here."}</strong> {"These companies run rolling hiring and referral loops. One shipped project with metrics beats a perfect CGPA without code."}</span>
              </div>
            </div>

            <div className="callout-amber">{"<strong>Target list:</strong> CRED, PhonePe, Razorpay, Swiggy, Zepto, Meesho, BrowserStack, Chargebee, Freshworks, and well-funded Series B+ SaaS. Skip unfunded startups offering equity instead of cash unless you have a runway."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"Path 3: IT services to product switch (2 to 4 years)"}</div>
                <div className="sec-sub">{"The most common slow path, and the one most engineers eventually take"}</div>
              </div>
            </div>
            <p>{"The majority of Indian engineering graduates still start in IT services at ₹3.5 to ₹7 LPA. Pathvio's 2026 tech salary report states the gap between IT services and product companies at the same experience level is 2 to 3× and widening. A mid-level SWE at TCS earns ₹14 to ₹18 LPA; the same profile at Swiggy or CRED earns ₹28 to ₹45 LPA; at Google or Amazon India, ₹45 to ₹70 LPA."}</p>
            <p>{"The switch typically happens between 18 and 36 months. Engineers who treat the services job as a paid DSA gym, ship one external-facing project, and interview at product firms during the 2-year mark often land 80% to 150% CTC jumps. That single move is how most engineers who did not get a dream campus offer eventually cross ₹1 lakh per month."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> IT services is not a dead end. It is a slow lane that punishes people who stop preparing and rewards people who treat it as runway."}</div>

            <div className="pull-quote">
              <p>{"\"Two years at Infosys, one side project with 2,000 users, one referral into a fintech. CTC went from ₹4.5L to ₹22L. That was the whole strategy.\""}</p>
              <span className="pq-source">{"Software engineer, Bangalore (Studojo community, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"No amount of tenure at TCS closes the gap alone."}</strong> {"Pathvio is explicit: skills and years in services do not converge to product pay without a company switch. The variable is employer, not patience."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Bonds and notice periods are real friction."}</strong> {"Factor buyout costs and non-compete clauses into your switch timeline. Start interviewing before you are desperate."}</span>
              </div>
            </div>

            <div className="callout-green">{"<strong>Switch checklist:</strong> (1) DSA at product-interview level. (2) One project outside work with users or metrics. (3) LinkedIn headline with nouns, not adjectives. (4) Apply through referrals, not only portals."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"Path 4: International freelancing (6 to 18 months)"}</div>
                <div className="sec-sub">{"The path students without a campus pipeline actually control"}</div>
              </div>
            </div>
            <p>{"Freelancing is the highest-agency path and the most uneven. Jobipo's 2026 platform guide puts skilled Upwork and Fiverr professionals in India at ₹20,000 to ₹5,00,000+ per month depending on niche. Beginners land ₹5,000 to ₹10,000. Consistent earners with 6 to 12 months of client history cluster at ₹20,000 to ₹80,000. The ₹1 lakh line typically requires either international rate cards (USD or EUR clients) or 3 to 5 domestic retainer clients at ₹20,000 to ₹30,000 each."}</p>
            <p>{"Highest-yield student niches in 2026: full-stack development, ML and data engineering, performance marketing with proven ROAS, and technical content for SaaS. Upwork's highest-paying freelance categories include machine learning engineers ($50 to $200/hour) and cybersecurity specialists. A student billing $40/hour for 25 billable hours weekly clears roughly ₹4.3 lakh monthly at current rates, well above the ₹1 lakh threshold, but billable hours are not 25 every week when you are also in college."}</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>{"Build proof that wins international clients"}</h4>
                <p>{"Studojo Careers helps you ship a portfolio and resume that reads credibly to global buyers, not just campus placement cells."}</p>
                <Link to="/dojos/internships" className="rpt-cta-mid-btn">{"Build your resume free →"}</Link>
              </div>
            </div>

            <div className="chart-wrap">
              <div className="chart-label">{"Where students who hit ₹1L/month in-hand by age 25 say the income came from (Studojo synthesis, illustrative)"}</div>
              <div style={{ height: 280 }}>
                <canvas id="pathMixChart" />
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> Freelancing hits ₹1 lakh faster than IT services but slower than a top campus offer. The bottleneck is client acquisition, not skill alone."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Platform fees eat margin."}</strong> {"Upwork charges 20% on the first $500 per client. Price your rates to absorb platform tax and Payoneer conversion."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Niche beats generalist."}</strong> {"\"I do web development\" competes with millions. \"I build Shopify checkout flows for D2C brands\" competes with dozens."}</span>
              </div>
            </div>

            <div className="callout">{"<strong>Realistic student math:</strong> Three retainer clients at ₹35,000/month each gets you to ₹1.05 lakh. That is a sales and delivery job, not a gig platform lottery."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"6"}</div>
              <div>
                <div className="sec-title">{"Path 5: Sales and commission roles (12 to 24 months)"}</div>
                <div className="sec-sub">{"The uncapped lane for people who can close, not just code"}</div>
              </div>
            </div>
            <p>{"Sales is the most ignored high-ceiling path on campus. B2B SaaS, EdTech institutional sales, and digital marketing agency field sales routinely advertise uncapped commission structures where top performers clear ₹1 to ₹2 lakh per month on ₹30,000 to ₹70,000 bases. Aimlead's Bangalore field sales manager posting cites ₹30,000 fixed with realistic earnings of ₹80,000 to ₹2,00,000 per month for performers. Ixyle AI's institutional SaaS role offers ₹50,000 fixed plus ₹50,000 per deal closed plus revenue share."}</p>
            <p>{"This path favours students who already sell: society sponsorships, event ticketing, prior internship BD work. The ramp is 6 to 12 months of pipeline building before commission income stabilises. It is high variance. Many wash out at the base-salary line. The ones who survive often out-earn batchmates in IT services within 18 months."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> Sales is the fastest non-technical path to ₹1 lakh/month with uncapped upside, and the path most career offices never mention."}</div>

            <div className="pull-quote">
              <p>{"\"My engineering friends were mock-interviewing for TCS. I was closing three college deals a month. I crossed ₹1 lakh in month seven. Different game.\""}</p>
              <span className="pq-source">{"BD manager, EdTech SaaS (Studojo community, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"OTE is a promise, not a guarantee."}</strong> {"On-target earnings assume 100% quota attainment. Ask what percentage of the team actually hit quota last quarter."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"EdTech and SaaS are hiring."}</strong> {"Institutional sales to colleges and B2B SaaS to SMBs are active 2026 lanes with commission-heavy structures and lower credential gates than IB or product engineering."}</span>
              </div>
            </div>

            <div className="callout-red">{"<strong>Red flag filter:</strong> Avoid roles that are pure cold-calling with no product-market fit, no CRM, and no existing leads. \"Uncapped commission\" without inbound pipeline is a churn factory."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"7"}</div>
              <div>
                <div className="sec-title">{"Path 6: Finance and consulting (2 to 5 years)"}</div>
                <div className="sec-sub">{"Credential-heavy, bonus-heavy, and rarely instant"}</div>
              </div>
            </div>
            <p>{"Investment banking and top consulting pay well but rarely hit ₹1 lakh per month in-hand at true fresher level at domestic firms. GeeksforGeeks and TimesPro put IB analyst salaries at ₹6 to ₹19 LPA at domestic houses, with global banks (Goldman Sachs, JP Morgan, Morgan Stanley) at ₹15 to ₹28 LPA for analysts. Monthly in-hand at a global bank analyst offer often lands at ₹80,000 to ₹1.2 lakh, crossing the threshold at the upper band."}</p>
            <p>{"The finance path is slow-burn for most: CA or CFA progression, MBA from a top programme, or boutique advisory grind before base plus bonus consistently clears ₹1 lakh monthly. Associate-level IB (2 to 4 years) reliably crosses ₹1.5 to ₹2.5 lakh per month at global banks. For students, the honest timeline is 3 to 5 years unless you enter through a top MBA campus process."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> Finance pays among the highest lifetime ceilings but is rarely the fastest first ₹1 lakh unless you land a global bank analyst offer or top consulting return."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Bonus is not monthly."}</strong> {"IB bonuses can double annual comp but arrive annually. Budget rent on base salary, not bonus headlines."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"CA + IB is a known route."}</strong> {"Chartered accountants who move into deal advisory or equity research can cross ₹1 lakh/month within 3 to 4 years at top firms, but the exam years are a long upfront investment."}</span>
              </div>
            </div>

            <div className="callout-amber">{"<strong>Honest comparison:</strong> A PhonePe SDE fresher may match an IB analyst's in-hand with less credential debt and more linear skill progression. Finance wins on bonus spikes and senior comp, not on speed to first ₹1 lakh for the median entrant."}</div>
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
              <div className="blist-item" key="Pick a lane, not a mood board">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Pick a lane, not a mood board"}.</strong> {"Product campus, startup SDE, services switch, freelancing, sales, and finance each have different timelines. Mixing prep across all six is how students lose two years."}</span>
              </div>
              <div className="blist-item" key="Count in-hand, not CTC">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Count in-hand, not CTC"}.</strong> {"Divide CTC by 14 for a conservative monthly estimate. ₹1 lakh/month needs roughly ₹12L+ annual CTC on standard payroll, more if you are in a high-tax bracket."}</span>
              </div>
              <div className="blist-item" key="IT services is a runway, not a destination">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"IT services is a runway, not a destination"}.</strong> {"The 2 to 3× product-company pay gap closes on a switch, not on tenure. Start preparing for product interviews by month 12, not month 36."}</span>
              </div>
              <div className="blist-item" key="Freelance and sales reward client proof">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Freelance and sales reward client proof"}.</strong> {"Three retainer clients or three closed deals matter more than fifty certificates. Build a portfolio or pipeline before you optimise your rate card."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Find roles that pay what the path promises"}</h3>
              <p>{"Studojo Internship Dojo surfaces funded startups, product teams, and high-signal roles with real INR bands, so you pick a lane with data, not guesswork."}</p>
            </div>
            <Link to="/dojos/internships" className="rpt-cta-btn">
              {"Browse internships →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
