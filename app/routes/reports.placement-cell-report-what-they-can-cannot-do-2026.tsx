import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Placement Cell Report: What Placement Cells Can and Cannot Actually Do | Studojo" },
    { name: "description", content: "What college placement cells can and cannot do in 2026: campus drives, policy rules, employer access, and what students must handle themselves off the official schedule." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "placement cell India 2026, campus placement what to expect, placement office limitations, college placement process, off campus vs campus placement, placement cell rules" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/placement-cell-report-what-they-can-cannot-do-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Placement Cell Report: What Placement Cells Can and Cannot Actually Do" },
    { property: "og:description", content: "Placement cells run schedules and policies. They do not guarantee offers. What they can do, what they cannot, and how to use them without false hope." },
    { property: "og:url", content: `${BASE_URL}/reports/placement-cell-report-what-they-can-cannot-do-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-06-06T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Placement Cell Report: What Placement Cells Can and Cannot Actually Do | Studojo" },
    { name: "twitter:description", content: "Your placement cell runs drives and rules. It does not guarantee your dream offer. Here's what it can and cannot do." },
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

  const offerSourceMixChartEl = document.getElementById("offerSourceMixChart") as HTMLCanvasElement | null;
  if (offerSourceMixChartEl && !offerSourceMixChartEl.dataset.rendered) {
    offerSourceMixChartEl.dataset.rendered = "1";
    new Chart(offerSourceMixChartEl, {
      type: "doughnut",
      data: {
        labels: ["Formal placement-cell drives", "Off-campus self-apply and outreach", "Internship or PPO conversion", "Referrals and alumni intros", "Higher study or family business", "Unplaced at graduation"],
        datasets: [{
          data: [38.0, 22.0, 18.0, 12.0, 6.0, 4.0],
          backgroundColor: ["#8B5CF6", "#a78bfa", "#10b981", "#f59e0b", "#737373", "#ef4444"],
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

  const placementCellScopeChartEl = document.getElementById("placementCellScopeChart") as HTMLCanvasElement | null;
  if (placementCellScopeChartEl && !placementCellScopeChartEl.dataset.rendered) {
    placementCellScopeChartEl.dataset.rendered = "1";
    new Chart(placementCellScopeChartEl, {
      type: "bar",
      data: {
        labels: ["Scheduling drives and slot rules", "Employer registration and logistics", "Policy compliance and documentation", "Blocking bad or unpaid offers", "Building your proof and portfolio", "Targeting roles outside campus list", "Interview performance and follow-up", "Negotiating role scope and CTC"],
        datasets: [{
          label: "What placement cells handle vs what students must own (responsibility index, 0 to 10)",
          data: [9.2, 8.8, 8.5, 7.5, 1.5, 1.2, 0.8, 2.0],
          backgroundColor: ["#8B5CF6", "#8B5CF6", "#8B5CF6", "#a78bfa", "#ef4444", "#ef4444", "#ef4444", "#f59e0b"],
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

  const tierAccessGapChartEl = document.getElementById("tierAccessGapChart") as HTMLCanvasElement | null;
  if (tierAccessGapChartEl && !tierAccessGapChartEl.dataset.rendered) {
    tierAccessGapChartEl.dataset.rendered = "1";
    new Chart(tierAccessGapChartEl, {
      type: "bar",
      data: {
        labels: ["Top-tier IIT, IIM, NIT, BITS-style pipeline", "Strong state and private university", "Mid-tier engineering or commerce college", "Tier-3 or newer institute", "No active placement cell"],
        datasets: [{
          label: "Employer access through placement cell by campus tier (illustrative index, 0 to 25)",
          data: [23.0, 18.5, 13.0, 8.0, 2.0],
          backgroundColor: ["#8B5CF6", "#a78bfa", "#f59e0b", "#737373", "#ef4444"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} (index)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 25.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
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
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #8B5CF6; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_PlacementCellReportWhatTheyCanCannotDo2026() {
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
        "headline": "The Placement Cell Report: What Placement Cells Can and Cannot Actually Do",
        "description": "What college placement cells can and cannot do in 2026: campus drives, policy rules, employer access, and what students must handle themselves off the official schedule.",
        "url": `${BASE_URL}/reports/placement-cell-report-what-they-can-cannot-do-2026`,
        "datePublished": "2026-06-06T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/placement-cell-report-what-they-can-cannot-do-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Placement Cell Report: What Placement Cells Can and Cannot Actually Do", "item": `${BASE_URL}/reports/placement-cell-report-what-they-can-cannot-do-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">{"Colleges · June 2026"}</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>{"The Placement Cell Report: What Placement Cells Can and Cannot Actually Do"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Placement Cell Report:<br /><em>What Placement Cells Can and Cannot Actually Do</em>" }} />
            <p className="rpt-hero-sub">{"Final-year students arrive expecting the placement cell to deliver offers. In practice it coordinates employer visits, enforces slot rules, and filters bad actors. It does not replace your proof, your outreach, or your judgment about which roles fit. This report separates campus infrastructure from career outcomes so you use the office well without outsourcing your job search to it."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India-first · Engineering, commerce, and MBA campuses · With US and UK career-center parallels"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Campus / Career"}</span>
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
              <div className="sc-num">{"~35 to 55%"}</div>
              <div className="sc-label">{"Illustrative share of final-year offers at mid-tier Indian campuses that still flow through formal placement-cell processes (varies sharply by college brand and batch size)"}</div>
              <div className="sc-source">{"Studojo campus placement synthesis, 2026"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"1:400+"}</div>
              <div className="sc-label">{"Typical student-to-placement-staff ratio at large Indian engineering colleges during peak season, before counting training partners and volunteers"}</div>
              <div className="sc-source">{"Studojo placement-office survey synthesis, 2025 to 2026"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"3 layers"}</div>
              <div className="sc-label">{"What most placement cells actually manage: employer relationships, process compliance, and student eligibility, not individual career coaching at scale"}</div>
              <div className="sc-source">{"Studojo placement-cell framework, 2026"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"A placement cell is operations, not magic"}</div>
                <div className="sec-sub">{"Logistics desk, policy enforcer, employer relationship manager"}</div>
              </div>
            </div>
            <p>{"In India, the placement cell (or training and placement office) sits between graduating batches and employers who agree to run campus drives. Its core job is coordination: register companies, publish schedules, collect resumes, run aptitude rounds, enforce slot caps, and keep offer letters documented for accreditation and alumni statistics."}</p>
            <p>{"Students often imagine a placement officer personally lobbying for them. At scale that is rare. A single coordinator may cover hundreds of students across multiple branches. The office optimises for process integrity and employer satisfaction, not bespoke career strategy for every candidate."}</p>
            <p>{"US and UK equivalents (career centers, Handshake admins, OCR coordinators) play a similar role with different branding: calendars, employer events, and system access, not guaranteed outcomes."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> Treat the placement cell as infrastructure you plug into, not a concierge that shops roles on your behalf."}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"What placement cells handle vs what students must own (responsibility index, 0 to 10)"}</div>
              <div style={{ height: 320 }}>
                <canvas id="placementCellScopeChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Success metrics differ from yours."}</strong> {"The office is judged on placement percentage, average CTC, and recruiter return rate. You are judged on whether one role fits your skills and growth. Those overlap but are not identical."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Volunteers and training partners fill gaps."}</strong> {"Mock interviews and aptitude classes are often outsourced. Useful, but not a substitute for domain proof employers actually screen."}</span>
              </div>
            </div>

            <div className="callout">{"<strong>Mental model:</strong> Airport control tower, not the airline booking your seat. They sequence traffic. You still need a ticket (skills, proof, fit) and you still choose your destination."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"What placement cells can actually do for you"}</div>
                <div className="sec-sub">{"Access, schedules, policy cover, and bad-offer filters"}</div>
              </div>
            </div>
            <p>{"Placement cells open doors to employers who only hire through campus pipelines. Large IT services firms, GCCs, banks, and consulting cohorts often post drives exclusively via registered colleges. You get a structured path: pre-placement talk, test, technical round, HR round, offer documentation."}</p>
            <p>{"They enforce rules that protect students: slot limits so one candidate cannot hoard offers, renege policies, minimum stipend or CTC floors at many institutes, and blocks on zero-pay corporate internships for credit. When an employer ghosts or delays joining letters, the office sometimes has a relationship manager to escalate."}</p>
            <p>{"They also maintain institutional memory: which firms actually joined last year, which roles were real versus vanity drives, and which recruiters respond when batches complain collectively."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Where final-year offers come from at typical Indian campuses (illustrative mix, %)"}</div>
              <div style={{ height: 280 }}>
                <canvas id="offerSourceMixChart" />
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> The placement cell's superpower is legitimate access to employers who refuse open-market chaos. Use it when those employers match your goals."}</div>

            <div className="pull-quote">
              <p>{"\"We can get the recruiter on campus. We cannot get you through the technical round if your projects are empty.\""}</p>
              <span className="pq-source">{"Placement officer, private engineering college (Studojo community, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Bulk applications have leverage."}</strong> {"Employers visit campus because they want cohort volume. Your resume rides a trusted channel instead of a public ATS black hole."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Documentation helps visa and loan paperwork."}</strong> {"Formal offer letters routed through the cell satisfy banks, embassies, and family scrutiny better than WhatsApp congratulations."}</span>
              </div>
            </div>

            <div className="callout-green">{"<strong>Get from your office early:</strong> Placement policy PDF, slot and renege rules, eligible company list from last two years, and the official resume format. Read before dream-company season, not after you are disqualified."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"What placement cells cannot do"}</div>
                <div className="sec-sub">{"No guaranteed offers, no bypassing screens, no custom lobbying at scale"}</div>
              </div>
            </div>
            <p>{"Placement cells cannot place you at a company that is not in their network. Product firms, niche startups, media houses, and many foreign roles never run traditional drives at mid-tier campuses. If your target list lives off that menu, the cell will not conjure it."}</p>
            <p>{"They cannot override employer hiring bars. Low GPA cutoffs, branch restrictions, backlog rules, and aptitude thresholds are set by recruiters. Officers may negotiate batch size or dates; they rarely negotiate individual exceptions without a strong referral or exceptional proof."}</p>
            <p>{"They cannot interview for you, build your GitHub, or fix a generic resume. They also cannot force employers to wait while you explore off-campus options if slot policies require you to accept or release offers on a deadline."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> The placement cell controls process, not outcomes. Passing the aptitude test still leaves technical, HR, and fit screens entirely on you."}</div>

            <div className="pull-quote">
              <p>{"\"Students blame us when they fail GD rounds. We brought the company. We did not write their answers.\""}</p>
              <span className="pq-source">{"Head of training and placement, state university (Studojo interview synthesis, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Dream companies may visit once."}</strong> {"Miss the slot or fail round one and you often wait a year. Parallel off-campus pipelines are not disloyalty; they are risk management."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Mass recruiters dominate many calendars."}</strong> {"High-volume IT services drives fill statistics. They are valid paths, but the cell is not offering personalized career counseling when forty firms hire hundreds in the same month."}</span>
              </div>
            </div>

            <div className="callout-red">{"<strong>Common myths:</strong> \"The TPO will push my profile\" (only if the employer asks for a shortlist and you are already on it). \"Campus means safe offer\" (startups and third-party staffing still flake). \"One offer is enough\" (role scope may be wrong; read the letter)."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"The tier gap: same office name, different power"}</div>
                <div className="sec-sub">{"Brand pulls employers; infrastructure alone does not"}</div>
              </div>
            </div>
            <p>{"Top-tier campuses attract recruiters who skip smaller colleges entirely. The placement cell at an IIT, top IIM, BITS, or leading NIT is a gate to firms that literally do not read open applications from elsewhere. Mid-tier colleges may host the same logos occasionally, but with smaller cohorts, narrower roles, or third-party staffing layers."}</p>
            <p>{"Tier-three and newer institutes may have enthusiastic staff but thin employer lists. Students there must assume off-campus search is primary, not backup. The office can still help with documentation, mock tests, and local employer tie-ups, but it cannot invent national-brand pipelines."}</p>
            <p>{"Comparing placement statistics across colleges without context misleads students. A 90% placement rate at one institute may count dissimilar role quality, CTC bands, and \"placed for higher study\" categories versus another school's reporting."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Employer access through placement cell by campus tier (illustrative index, 0 to 25)"}</div>
              <div style={{ height: 280 }}>
                <canvas id="tierAccessGapChart" />
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> Judge your placement cell by the employer graph it actually has, not the brochure from a sibling college."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Branch matters inside the same college."}</strong> {"CS and IT often see more product and GCC tech drives. Civil and mechanical may rely on core industry recruiters with different calendars. Office support is shared; employer interest is not."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"MBA cells run a parallel game."}</strong> {"Summer internship placement and final placement are different seasons with different employer sets. First-year MBAs should study summer outcomes, not only final CTC billboards."}</span>
              </div>
            </div>

            <div className="callout-amber">{"<strong>Ask your seniors:</strong> Which drives were real jobs versus attendance theater? Which offers had bonds or training deposits? Which firms returned three years in a row?"}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"How to use your placement cell without false hope"}</div>
                <div className="sec-sub">{"A practical partnership model for final-year students"}</div>
              </div>
            </div>
            <p>{"Week one of final year: download every policy doc, build a tracker with drive dates, and list employers you will pursue on-campus versus off-campus. Register every eligible drive even if it is a backup. Skipping registration because you dislike the firm is how students miss deadline surprises."}</p>
            <p>{"Treat the cell as an intelligence source. Ask which recruiters requested shortlists by GPA, which roles are repeat visits, and whether last year's offers converted to joining letters. Bring your placement officer a tight question, not a vague plea for help."}</p>
            <p>{"Invest your personal time in proof the cell cannot manufacture: one flagship project, internship outcomes, GitHub or portfolio link, and a resume that names metrics. Many campuses run mandatory resume templates. Fit the template but keep a sharper version for off-campus outreach."}</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>{"Run the off-campus lane in parallel"}</h4>
                <p>{"Studojo Outreach helps you reach hiring managers and recruiters at firms your placement cell never booked, with the same forwardable proof pattern campus referrers use."}</p>
                <Link to="/dojos/internships" className="rpt-cta-mid-btn">{"Try Studojo Outreach →"}</Link>
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> High performers treat campus drives as one channel in a portfolio. They do not pause other channels until placement season ends."}</div>

            <div className="pull-quote">
              <p>{"\"The students who stressed less treated placement season like exam season: calendar, mocks, and backups. The ones who waited for us to call them daily got surprised.\""}</p>
              <span className="pq-source">{"Final-year student, commerce programme (Studojo community, 2026)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Slot discipline is career discipline."}</strong> {"Holding three offers while classmates have zero is a policy issue, not a flex. Release early if you will not join."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Use training slots selectively."}</strong> {"Aptitude marathons help mass recruiters. Product and data roles need domain prep the cell may not schedule. Fill gaps yourself."}</span>
              </div>
            </div>

            <div className="callout">{"<strong>Weekly habit during season:</strong> Monday: check drive calendar. Tuesday: one off-campus outreach. Wednesday: aptitude or technical prep. Thursday: follow up pending applications. Friday: talk to one senior about employer reality."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"6"}</div>
              <div>
                <div className="sec-title">{"When to go around the placement cell"}</div>
                <div className="sec-sub">{"Off-campus, referrals, and roles the schedule will never show"}</div>
              </div>
            </div>
            <p>{"Go off-campus when your target employers are absent from the official list, when you want startup or niche roles, when you are in a restricted branch with thin drives, or when you already have a warm intro that will conflict with slot timing if you wait."}</p>
            <p>{"Legitimate off-campus paths include LinkedIn and Naukri with tailoring, alumni WhatsApp and Slack groups, professor referrals, prior internship conversions, hackathon networks, and direct outreach to hiring managers. Many strong offers never touch the placement cell, even at colleges with active offices."}</p>
            <p>{"Stay compliant: read whether your institute requires offer disclosure, whether off-campus offers count toward placement stats, and whether signing an outside offer triggers renege penalties. Work the system; do not get disqualified on a technicality."}</p>

            <div className="highlight">{"<strong>Summary insight:</strong> Placement cells run the on-campus railroad. You still need a map for the territory outside the tracks."}</div>

            <div className="pull-quote">
              <p>{"\"My offer came from a founder DM. I told placement office after signing so they could update records. Both paths can coexist.\""}</p>
              <span className="pq-source">{"Graduate, tier-two engineering college (Studojo community, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"PPOs are the quiet win."}</strong> {"Return offers from summer internships bypass much of the chaos. Negotiate PPO scope before celebrating; title inflation happens here too."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Report bad actors with evidence."}</strong> {"Ghost employers, unpaid mandates, and bait-and-switch roles hurt the next batch. Placement cells act faster with documented complaints than with rumors."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Global roles need global channels."}</strong> {"US, UK, UAE, and Singapore hiring rarely flows through an Indian placement cell. Use company sites, referrals, and diaspora networks instead."}</span>
              </div>
            </div>

            <div className="callout-amber">{"<strong>90-day parallel plan:</strong> Month 1: fix proof and policy literacy. Month 2: register all viable drives plus ten off-campus outreaches per week. Month 3: decide using role fit and joining certainty, not panic or peer pressure."}</div>
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
              <div className="blist-item" key="Treat the cell as infrastructure">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Treat the cell as infrastructure"}.</strong> {"It schedules drives, enforces policy, and maintains employer relationships. It does not guarantee your dream role or substitute for skills and proof."}</span>
              </div>
              <div className="blist-item" key="Read policy before season starts">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Read policy before season starts"}.</strong> {"Slot caps, renege rules, stipend floors, and documentation requirements bite students who skim too late. Ask seniors which rules actually get enforced."}</span>
              </div>
              <div className="blist-item" key="Use campus for access, not hope">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Use campus for access, not hope"}.</strong> {"Register every viable drive, but keep off-campus outreach, referrals, and internship conversions running in parallel."}</span>
              </div>
              <div className="blist-item" key="Judge by your employer graph">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Judge by your employer graph"}.</strong> {"Placement power varies by college tier and branch. Compare last year's real offers, not billboard CTC peaks."}</span>
              </div>
              <div className="blist-item" key="Stay compliant when going off-campus">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Stay compliant when going off-campus"}.</strong> {"Disclose offers if required, avoid slot violations, and report bad employers with evidence so the office can protect the next batch."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Run campus and off-campus lanes together."}</h3>
              <p>{"Studojo helps you find internships and reach hiring managers at firms your placement cell never scheduled, so you are not betting everything on one drive calendar."}</p>
            </div>
            <Link to="/dojos/internships" className="rpt-cta-btn">
              {"Explore Studojo Internships →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
