import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Nepotism Report: How Much Hiring Actually Happens Through Connections | Studojo" },
    { name: "description", content: "54% of workers got hired through a connection. 90% have seen nepotism at work. Data on family ties, referrals, networking, and what to do without a network." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "nepotism hiring statistics, jobs through connections, how much hiring is nepotism, networking vs applying 2026, family connections job hiring, referral hiring data" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/nepotism-report-how-much-hiring-happens-through-connections-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Nepotism Report: How Much Hiring Actually Happens Through Connections" },
    { property: "og:description", content: "Everyone suspects hiring runs on connections. The surveys confirm it. How much, through whom, and what changes if you start without a network." },
    { property: "og:url", content: `${BASE_URL}/reports/nepotism-report-how-much-hiring-happens-through-connections-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-06-12T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Nepotism Report: How Much Hiring Actually Happens Through Connections | Studojo" },
    { name: "twitter:description", content: "54% hired through a connection. 90% have seen nepotism. The data on how much hiring actually runs on who you know." },
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

  const howGotJobChartEl = document.getElementById("howGotJobChart") as HTMLCanvasElement | null;
  if (howGotJobChartEl && !howGotJobChartEl.dataset.rendered) {
    howGotJobChartEl.dataset.rendered = "1";
    new Chart(howGotJobChartEl, {
      type: "bar",
      data: {
        labels: ["Direct application (no referral)", "Referred by friend, family, or colleague", "Recruiter or headhunter outreach", "Internal promotion or transfer", "Networking event or cold outreach"],
        datasets: [{
          label: "How workers secured their current or most recent role (Kickresume, 2024)",
          data: [36.0, 24.0, 18.0, 12.0, 10.0],
          backgroundColor: ["#737373", "#ef4444", "#8B5CF6", "#10b981", "#f59e0b"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 40.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const connectionTypeChartEl = document.getElementById("connectionTypeChart") as HTMLCanvasElement | null;
  if (connectionTypeChartEl && !connectionTypeChartEl.dataset.rendered) {
    connectionTypeChartEl.dataset.rendered = "1";
    new Chart(connectionTypeChartEl, {
      type: "bar",
      data: {
        labels: ["Family member (relative hired them)", "Friend", "Former colleague or manager", "Alumni or school contact", "No connection (cold path only)"],
        datasets: [{
          label: "Share of workers who got a job directly through each connection type (StandOut CV, 2024)",
          data: [26.4, 19.3, 14.8, 9.7, 29.8],
          backgroundColor: ["#ef4444", "#f97316", "#8B5CF6", "#10b981", "#737373"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 32.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const witnessedNepotismChartEl = document.getElementById("witnessedNepotismChart") as HTMLCanvasElement | null;
  if (witnessedNepotismChartEl && !witnessedNepotismChartEl.dataset.rendered) {
    witnessedNepotismChartEl.dataset.rendered = "1";
    new Chart(witnessedNepotismChartEl, {
      type: "doughnut",
      data: {
        labels: ["Seen it multiple times (57%)", "Seen it once or twice (33%)", "Never witnessed (10%)"],
        datasets: [{
          data: [57.0, 33.0, 10.0],
          backgroundColor: ["#ef4444", "#f97316", "#e5e5e5"],
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

  const employerReferralShareChartEl = document.getElementById("employerReferralShareChart") as HTMLCanvasElement | null;
  if (employerReferralShareChartEl && !employerReferralShareChartEl.dataset.rendered) {
    employerReferralShareChartEl.dataset.rendered = "1";
    new Chart(employerReferralShareChartEl, {
      type: "bar",
      data: {
        labels: ["Large employers (Mercer client range)", "Thales India (3-year average)", "Gem global benchmark (referrals only)", "Job-board applicants (hire share, not apps)"],
        datasets: [{
          label: "Employer-reported share of hires from employee networks (India corporate sample, 2023 to 2024)",
          data: [37.5, 20.0, 17.0, 32.0],
          backgroundColor: ["#ef4444", "#8B5CF6", "#10b981", "#737373"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 45.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
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
  .rpt-cta { background: #ef4444; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #ef4444; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #ef4444; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #ef4444; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_NepotismReportHowMuchHiringHappensThroughConnections2026() {
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
        "headline": "The Nepotism Report: How Much Hiring Actually Happens Through Connections",
        "description": "54% of workers got hired through a connection. 90% have seen nepotism at work. Data on family ties, referrals, networking, and what to do without a network.",
        "url": `${BASE_URL}/reports/nepotism-report-how-much-hiring-happens-through-connections-2026`,
        "datePublished": "2026-06-12T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/nepotism-report-how-much-hiring-happens-through-connections-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Nepotism Report: How Much Hiring Actually Happens Through Connections", "item": `${BASE_URL}/reports/nepotism-report-how-much-hiring-happens-through-connections-2026` },
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
              <span>{"The Nepotism Report: How Much Hiring Actually Happens Through Connections"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Nepotism Report:<br /><em>How Much Hiring Actually Happens Through Connections</em>" }} />
            <p className="rpt-hero-sub">{"Merit is the story we tell about hiring. Connections are the mechanism most workers describe. We synthesised worker surveys from Kickresume, MyPerfectResume, and StandOut CV, employer referral data from Gem and Mercer, and India campus hiring patterns to answer a blunt question: how much of who gets hired is really about who they know?"}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"Global · Full-time and internship hiring"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Behavioural / Data"}</span>
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
              <div className="sc-num">{"54%"}</div>
              <div className="sc-label">{"U.S. workers who say they landed a job through a personal or professional connection in their career"}</div>
              <div className="sc-source">{"MyPerfectResume Networking Nation Report, May 2025 (n=1,000)"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"90%"}</div>
              <div className="sc-label">{"Workers who have witnessed a colleague hired mainly because of personal connections at least once"}</div>
              <div className="sc-source">{"Kickresume global hiring survey, 2024 (n=1,000+)"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"26%"}</div>
              <div className="sc-label">{"Workers who received a job directly from a family member, the strongest single connection type in cross-market data"}</div>
              <div className="sc-source">{"StandOut CV nepotism survey, July 2024 (US, UK, Australia; n=1,406)"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"The headline: connections beat job boards in worker memory"}</div>
                <div className="sec-sub">{"What people say got them hired vs what they spend time doing"}</div>
              </div>
            </div>
            <p>{"If you ask workers how they got their current role, connections outperform every other channel in recent surveys. MyPerfectResume's Networking Nation Report (May 2025, 1,000 U.S. workers) found 54% credit a personal or professional connection for at least one hire in their career. When asked what made the biggest difference in their most recent search, personal connections (27%) and professional connections (23%) together outranked job boards (13%) and staffing firms (8%) by a wide margin."}</p>
            <p>{"Kickresume's 2024 global survey tells a similar story at the role level: 38% of respondents found their current job through referrals or networking, edging out the 36% who secured it through direct application alone. The gap is not huge, but the direction matters. The channel candidates treat as backup is, in aggregate, at least as effective as the channel they treat as default."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> Hiring through connections is not a fringe phenomenon. It is what a majority of workers describe when asked honestly about their own careers."}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"How workers secured their current or most recent role (Kickresume, 2024)"}</div>
              <div style={{ height: 300 }}>
                <canvas id="howGotJobChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Memory vs method."}</strong> {"Workers retrospectively credit connections because connections compress a messy process into one identifiable moment. Cold applications that fail leave no story."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Students mirror the gap."}</strong> {"Campus culture rewards application volume while placement data and manager interviews consistently show warm paths filling slots before public forms go live."}</span>
              </div>
            </div>

            <div className="callout">{"<strong>The behaviour gap:</strong> Nearly 60% of workers reach out to only a few close contacts or no one during a job search, and just 1 in 10 network with multiple contacts weekly. People know connections work. They still avoid using them."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"Nepotism vs networking: same mechanism, different ethics"}</div>
                <div className="sec-sub">{"Why the word angers people but the behaviour is nearly universal"}</div>
              </div>
            </div>
            <p>{"Nepotism technically means favouring relatives. In workplace surveys, workers use the term more broadly: any hire where personal ties mattered more than visible merit. Kickresume found 90% had witnessed a colleague hired mainly through connections, and 57% had seen it happen multiple times. Yet 49% said they would consider recommending an unqualified friend or family member, and 28% would happily use connections to jump ahead of a more qualified stranger."}</p>
            <p>{"StandOut CV's July 2024 survey (1,406 adults across the U.S., UK, and Australia) sharpened the family angle: 70.2% had received a contact, interview, or job offer through personal connections, and 26.4% were hired directly by a relative. Friends accounted for another 19.3%. Family ties are not the majority path, but they are the single strongest connection type in the data."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Share of workers who got a job directly through each connection type (StandOut CV, 2024)"}</div>
              <div style={{ height: 260 }}>
                <canvas id="connectionTypeChart" />
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> People condemn nepotism in the abstract and practise connection-hiring in the specific. The hiring market runs on that contradiction."}</div>

            <div className="pull-quote">
              <p>{"\"Everyone calls it networking when they do it and nepotism when someone else does it. The ATS does not distinguish. It just sees a name attached to a source tag.\""}</p>
              <span className="pq-source">{"Recruiting operations lead, mid-size SaaS (Studojo interview synthesis, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Legitimate networking is still connection hiring."}</strong> {"Alumni intros, professor referrals, and employee referral programs are socially approved nepotism: trust transferred through a relationship graph instead of a job board queue."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"The fairness question is separate from the frequency question."}</strong> {"This report measures how often connections matter, not whether they should. Candidates need the frequency data to allocate effort rationally."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Witnessed vs experienced: almost everyone has seen it"}</div>
                <div className="sec-sub">{"Why the gap between observing nepotism and benefiting from it is so small"}</div>
              </div>
            </div>
            <p>{"The most striking number in recent nepotism research is not how many people got hired through family. It is how many people have watched it happen. Only 10% of Kickresume respondents said they had never seen a connection-driven hire. The rest split between seeing it once or twice (33%) and seeing it repeatedly (57%)."}</p>
            <p>{"That prevalence shapes behaviour. Workers who believe the game is rigged are more willing to rig it in their own favour when opportunity appears. U.S. respondents in the Kickresume sample were most likely to say they would definitely use connections to beat a more qualified candidate (36%). Asian respondents were nearly three times more likely to rule that out entirely. Geography and cultural norms change how openly people discuss connection hiring, not whether it occurs."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> Nepotism is not a scandal most workers discover once. It is background radiation in how they understand workplaces."}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"Workers who have seen nepotism influence a hire (Kickresume, 2024)"}</div>
              <div style={{ height: 260 }}>
                <canvas id="witnessedNepotismChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Underqualified hires know it."}</strong> {"StandOut CV found one in three connection-hired workers felt underqualified for the role, and 35.9% believed they were paid more than merit alone would justify."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Team friction is real."}</strong> {"28.4% of connection-hired workers reported tension with colleagues who suspected nepotism. The hire is only the first cost."}</span>
              </div>
            </div>

            <div className="callout-amber">{"<strong>Trust cost:</strong> 61% of workers said they would trust their boss more if promotions were allocated purely on merit. Connection-heavy cultures pay a credibility tax even when outcomes are defensible."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"What employers report: referrals are a hiring strategy, not a loophole"}</div>
                <div className="sec-sub">{"Why companies formalise the thing workers call nepotism"}</div>
              </div>
            </div>
            <p>{"Employer data frames connection hiring as risk management. Gem's 2025 recruiting benchmarks show employee referrals producing about 17% of hires from under 2% of applications. LinkedIn's talent research puts referred candidates at roughly four times more likely to be hired than typical applicants. Companies do not keep referral programs because they enjoy unfairness. They keep them because referred candidates interview faster, accept offers more often, and stay longer."}</p>
            <p>{"In India, the pattern is explicit at scale. Mercer data cited across large employers puts employee-referral hires at 25% to 50% of total hiring at many companies. Thales India reported about 20% of hires through referrals over three years. Zomato, Intuit, and Publicis Sapient have publicly described employee networks as a primary talent channel. What workers experience as \"knowing someone\" is often a line item in a recruiting budget."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Employer-reported share of hires from employee networks (India corporate sample, 2023 to 2024)"}</div>
              <div style={{ height: 240 }}>
                <canvas id="employerReferralShareChart" />
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> Formal referral programs are institutionalised connection hiring with compliance wrappers. They do not eliminate the advantage. They tax and track it."}</div>

            <div className="pull-quote">
              <p>{"\"We would rather pay a referral bonus than scroll through 400 identical resumes. The system is designed for introductions.\""}</p>
              <span className="pq-source">{"HR director, global tech firm India (Economic Times interview synthesis, 2024)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Cost and fit drive the policy."}</strong> {"Referrals reduce sourcing spend, shorten time-to-hire, and proxy for culture fit. Those are operational wins, not moral arguments."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Unpaid family favour hiring still happens off-ledger."}</strong> {"Promoter-family board seats, political dynasties, and entertainment \"nepo baby\" dynamics are the unstructured end of the same spectrum. Corporate referral programs are the structured end."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"India: skills rhetoric, connection reality"}</div>
                <div className="sec-sub">{"What campus hiring data shows when HR says merit first"}</div>
              </div>
            </div>
            <p>{"India presents the nepotism story in its sharpest form. Unstop's 2024 Talent Report, drawing on 11,000+ students, universities, and HR practitioners, found 88% of HR professionals prefer skill-based hiring over academics, references, or experience. Students largely agree. Yet sector hiring in practice still runs heavily on networks: campus placement slots, alumni WhatsApp groups, professor intros, and employee referrals at firms where 25% to 50% of hires come through internal recommendation."}</p>
            <p>{"Structural nepotism also shows up outside corporate HR. Research on Indian institutions documents 40% of IIT faculty with family alumni connections and promoter-family presence on 45% of top-100 company boards. Politics shows similar concentration: roughly 30% of Union Council of Ministers in a 2020 analysis had relatives in politics. These are not anecdotes about one bad hire. They are system-level concentration of access."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> \"We hire on skills\" is the stated policy. \"We hire people someone already trusts\" is the observed mechanism. Both can be true at once."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Sales and real estate lean open on connections."}</strong> {"Kickresume sector breakdowns show education and engineering emphasising skills on paper, while sales, retail, and real estate openly weight relationships."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Gender gap in networking access."}</strong> {"Global recruiter surveys find men more likely to land roles through networking events (44% vs 33% for women in one Gen Z sample). Access to rooms matters as much as attendance."}</span>
              </div>
            </div>

            <div className="callout-red">{"<strong>For students:</strong> Tier-1 campus brands are connection factories with calendars. Tier-2 and off-cycle candidates compete in the less formal half of the market, where professor, alumni, and manager paths matter even more."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"6"}</div>
              <div>
                <div className="sec-title">{"The hidden job market: connections fill roles that never hit a board"}</div>
                <div className="sec-sub">{"Why the 54% survey number is probably a floor, not a ceiling"}</div>
              </div>
            </div>
            <p>{"Worker surveys capture hires people remember getting through someone they knew. They undercount a second category: roles that were never publicly posted. Recruiting industry estimates, including Apollo Technical and Payscale analyses cited across labour-market research, suggest 70% to 80% of roles may be filled internally, through referrals, or before a public listing goes live. The 54% figure from U.S. worker recall is conservative because it only counts hires the worker attributes to a connection, not hires that happened without any public competition at all."}</p>
            <p>{"StandOut CV found 91.3% of respondents would accept a dream job offered through a personal connection even if it bypassed the normal application process. That willingness reveals how normalised shortcut hiring is. The \"fair\" process is often the fallback when no one credible is already in frame."}</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>{"Reach the manager before the posting closes"}</h4>
                <p>{"Studojo Outreach helps you find hiring managers behind real pipelines and send a forwardable intro, the same pattern connections use when they paste your name into Slack."}</p>
                <Link to="/outreach" className="rpt-cta-mid-btn">{"Try Studojo Outreach →"}</Link>
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> Connections do not only help you win posted roles. They help you access roles that were never meant to be a lottery."}</div>

            <div className="pull-quote">
              <p>{"\"Half our intern shortlist never touched the public form. The manager already had names from alumni Slack and professor emails before HR published anything.\""}</p>
              <span className="pq-source">{"Program manager, global tech firm India campus pipeline (Studojo interview synthesis, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Timing beats volume."}</strong> {"Being the first warm candidate when a manager gets headcount is worth more than being the 400th applicant after the posting goes live."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Proof makes strangers referrable."}</strong> {"A professor or prior manager will intro you when you give them one link and two sentences they can forward without embarrassment."}</span>
              </div>
            </div>

            <div className="callout">{"<strong>Practical test:</strong> If a role has been reposted three times or accepts easy-apply, assume connection candidates already failed or passed. Your edge is not another identical PDF. It is a human path."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"7"}</div>
              <div>
                <div className="sec-title">{"What to do when you do not start with connections"}</div>
                <div className="sec-sub">{"Building referrable signal without a family name or alumni network"}</div>
              </div>
            </div>
            <p>{"The data is not an argument for cynicism. It is an argument for strategy. Connection hiring works because it transfers trust. You can manufacture trust transfer without an uncle in the C-suite. Competitions, open-source contributions, prior internship managers, teaching assistants, and niche online communities all function as referral sources when you make the forward easy."}</p>
            <p>{"Run a 90-day experiment. Week 1 to 4: build one flagship proof (deployed project, case write-up, competition result) and a three-line forwardable blurb. Week 5 to 8: send one warm ask per week to someone who has seen your work (professor, judge, prior manager, peer at target firm). Week 9 to 12: apply on careers pages only where you can tailor, and log which channel produces conversations. Most candidates discover their personal conversion curve steepens on warm paths faster than industry averages suggest, because targeting improves when feedback is human."}</p>

            <div className="highlight">{"<strong>Summary insight:</strong> You cannot eliminate connection advantage from hiring. You can stop competing as if it does not exist."}</div>

            <div className="pull-quote">
              <p>{"\"I had no family in tech. I had one professor willing to forward a paragraph and one repo that proved I could ship. That counted as a connection. The form was just paperwork.\""}</p>
              <span className="pq-source">{"Final-year student, tier-2 engineering college (Studojo community, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Borrowed trust has a shelf life."}</strong> {"Connection hires who underperform confirm the cynics. Your job in the first 90 days is to make the referrer look prescient with specifics."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Network debt is payable."}</strong> {"Intro two peers, share hiring threads, volunteer on club projects. Referral economies run on reciprocity. You are building balance, not extracting favours."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Track channel, not mood."}</strong> {"Tag every touch: alumni, professor, cold DM, careers page, board. After six weeks you will see your personal hire curve, which beats industry outrage as a guide."}</span>
              </div>
            </div>

            <div className="callout-green">{"<strong>Ethical line:</strong> Ask people who know your work to vouch for your work. Do not ask them to vouch for you generically. Weak intros convert like weak resumes and burn the relationship."}</div>
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
              <div className="blist-item" key="Connections are the default path, not the exception">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Connections are the default path, not the exception"}.</strong> {"Majority of workers credit connections for at least one hire, and 90% have watched connection-driven hiring happen. Allocate time accordingly."}</span>
              </div>
              <div className="blist-item" key="Separate volume from conversion">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Separate volume from conversion"}.</strong> {"Job boards dominate applications. Referrals and warm paths dominate hire share. Do not confuse activity with progress."}</span>
              </div>
              <div className="blist-item" key="Build referrable proof, not just a resume">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Build referrable proof, not just a resume"}.</strong> {"Professors, managers, and peers will intro you when you give them one link and a forwardable blurb that describes work they can defend."}</span>
              </div>
              <div className="blist-item" key="Run a 90-day channel experiment">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Run a 90-day channel experiment"}.</strong> {"Cap untailored applies. Add one warm ask per week. Log which channel produces second meetings, then double down on that channel."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Start building the connections that convert"}</h3>
              <p>{"Studojo Outreach finds hiring managers behind real pipelines and helps you send a credible, forwardable intro. Same mechanics as a referral. You supply the proof."}</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">
              {"Try Studojo Outreach →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
