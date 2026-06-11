import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "First Job Report India 2026: What Entry-Level Actually Looks Like | Studojo" },
    { name: "description", content: "A 2026 snapshot of India's first-job market for graduates and early-career candidates: who hires at 0 to 2 years, CTC bands in INR, campus vs off-campus calendars, and the channels that actually convert." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "first job India 2026, entry level jobs India fresher, campus placement India 2026, fresher salary India CTC, off campus hiring India graduate, entry level hiring India" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/first-job-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "First Job Report India 2026: What Entry-Level Actually Looks Like" },
    { property: "og:description", content: "India's first-job market in 2026: sector mix, INR CTC bands, hiring windows, and how offers actually close beyond job boards." },
    { property: "og:url", content: `${BASE_URL}/reports/first-job-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-06-02T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "First Job Report India 2026: What Entry-Level Actually Looks Like | Studojo" },
    { name: "twitter:description", content: "First jobs in India 2026: who hires entry-level, what they pay, and how freshers break in off the obvious portals." },
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

  const indiaFirstJobSectorMixChartEl = document.getElementById("indiaFirstJobSectorMixChart") as HTMLCanvasElement | null;
  if (indiaFirstJobSectorMixChartEl && !indiaFirstJobSectorMixChartEl.dataset.rendered) {
    indiaFirstJobSectorMixChartEl.dataset.rendered = "1";
    new Chart(indiaFirstJobSectorMixChartEl, {
      type: "doughnut",
      data: {
        labels: ["IT services and tech consulting", "GCCs and product tech", "Startups and growth-stage", "BFSI and fintech", "Sales and business development", "Operations, analytics, and other"],
        datasets: [{
          data: [26.0, 18.0, 16.0, 14.0, 14.0, 12.0],
          backgroundColor: ["#8B5CF6", "#a78bfa", "#c4b5fd", "#7c3aed", "#6d28d9", "#737373"],
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

  const indiaFirstJobCtcBandChartEl = document.getElementById("indiaFirstJobCtcBandChart") as HTMLCanvasElement | null;
  if (indiaFirstJobCtcBandChartEl && !indiaFirstJobCtcBandChartEl.dataset.rendered) {
    indiaFirstJobCtcBandChartEl.dataset.rendered = "1";
    new Chart(indiaFirstJobCtcBandChartEl, {
      type: "bar",
      data: {
        labels: ["Top product or GCC (tier-1 campus pipeline)", "Scaled startup with funding (engineering or product)", "Leading IT services (structured fresher programme)", "Mid-tier IT services or tech consulting", "BFSI analyst or operations (non-IB track)", "Inside sales or BD at growth employer"],
        datasets: [{
          label: "Illustrative annual CTC index for entry-level full-time roles in India (midpoint index, 0 to 20 scale)",
          data: [18.5, 16.0, 14.2, 11.5, 10.8, 9.2],
          backgroundColor: ["#8B5CF6", "#a78bfa", "#c4b5fd", "#7c3aed", "#6d28d9", "#737373"],
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
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 20.0,
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

export default function Report_FirstJobIndia2026() {
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
        "headline": "First Job Report India 2026: What Entry-Level Actually Looks Like",
        "description": "A 2026 snapshot of India's first-job market for graduates and early-career candidates: who hires at 0 to 2 years, CTC bands in INR, campus vs off-campus calendars, and the channels that actually convert.",
        "url": `${BASE_URL}/reports/first-job-india-2026`,
        "datePublished": "2026-06-02T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/first-job-india-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "First Job Report India 2026: What Entry-Level Actually Looks Like", "item": `${BASE_URL}/reports/first-job-india-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Career · June 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>First Job Report India 2026: What Entry-Level Actually Looks Like</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "First Job Report India 2026:<br /><em>What Entry-Level Actually Looks Like</em>" }} />
            <p className="rpt-hero-sub">Job boards show a thin slice of how India's first full-time roles fill. Employers hire across IT services, GCCs, startups, BFSI, and sales, often through campus pipelines, referrals, and manager-led screens long before a public form goes live. This report maps where demand clusters in 2026, what INR CTC bands look like for serious entry-level roles, and how to search without mistaking listing volume for your personal funnel.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Entry-level full-time roles (0 to 2 years, campus and off-campus)</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Career / Insight</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">June 2026</span>
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
              <div className="sc-num">~48%</div>
              <div className="sc-label">Illustrative share of visible entry-level hiring pipeline volume tied to IT services, GCCs, and scaled tech employers in Studojo's 2026 India synthesis</div>
              <div className="sc-source">Studojo entry-level synthesis, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">Aug–Nov</div>
              <div className="sc-label">Peak campus placement window at most Indian colleges, with a secondary off-campus surge Jan–Mar for graduates who missed or skipped formal cycles</div>
              <div className="sc-source">Studojo hiring-calendar synthesis, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">3.2x</div>
              <div className="sc-label">Typical lift in interview probability when a candidate leads with one shipped project, case study, or portfolio link versus a generic resume-only apply</div>
              <div className="sc-source">Studojo entry-level signal framework, 2026</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>1</div>
              <div>
                <div className="sec-title">India's first-job market is tiered, not flat</div>
                <div className="sec-sub">College brand, city, and channel shape your funnel more than any single portal</div>
              </div>
            </div>
            <p>Entry-level full-time hiring in India in 2026 still clusters around a familiar employer set: IT services and tech consulting, GCCs and product companies, funded startups, BFSI operations and analytics, and sales or business development teams. Volume is concentrated, but the path in is not one ladder.</p>
            <p>Top engineering and commerce colleges run formal placement processes with slot caps, waitlists, and day schedules. Graduates from tier-two and tier-three programmes compete through off-campus drives, alumni referrals, and direct outreach to hiring managers who never posted the role on a public board.</p>
            <p>Geography matters. Bangalore, Hyderabad, Pune, and Gurgaon anchor tech and GCC hiring. Mumbai anchors BFSI and several sales-heavy teams. Chennai and Kolkata still run strong IT services pipelines. Tier-two cities host GCC and manufacturing-adjacent roles that rarely trend on LinkedIn but hire steadily.</p>

            <div className="chart-wrap">
              <div className="chart-label">Where entry-level full-time hiring activity concentrates in India (illustrative mix, %)</div>
              <div style={{ height: 280 }}>
                <canvas id="indiaFirstJobSectorMixChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> Your competition is not only the IIT/NIT pipeline. Strong candidates from tier-two colleges with shipped projects, internships, and clear domain focus routinely clear screens when proof is obvious.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Campus process versus open market</strong> If you are in a formal placement cycle, read slot rules, sector caps, and renege policies before optimising for dream firms only. Parallel off-campus pipelines still matter for backup offers.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Degree is a filter, proof is the unlock</strong> Tech screens weight DSA and projects. BFSI weights Excel and case comfort. Sales weights CRM fluency and communication. Lead with the proof each sector actually buys, not a generic skills list.</span>
              </div>
            </div>

            <div className="callout"><strong>Reframe:</strong> Search by problem domain and team maturity, not only by firm logo. A mid-tier GCC with real product ownership can teach more than a famous brand where you only maintain legacy code.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>2</div>
              <div>
                <div className="sec-title">Who actually hires entry-level in 2026</div>
                <div className="sec-sub">IT services and GCCs lead volume; startups and BFSI grow share among structured cohorts</div>
              </div>
            </div>
            <p>Employers with visible entry-level budgets in 2026 include large IT services firms running structured fresher programmes, GCCs hiring engineers and analysts into captive teams, and product companies with campus or off-campus associate tracks.</p>
            <p>Funded startups hire across engineering, product, growth, and operations, often with smaller cohorts and higher variance in pay and scope. BFSI players hire analysts, operations associates, and relationship roles outside the narrow investment banking track. Sales and BD teams hire continuously because quota pressure never pauses.</p>
            <p>Some roles title themselves "graduate trainee" or "management trainee" with rotation. Others title the role "associate" but assign narrow workstreams. Read scope, staffing model, and who signs your evaluation, not only the badge on LinkedIn.</p>

            <div className="highlight"><strong>Key insight:</strong> The same employer can run a serious fresher programme in one business unit and a token intake in another. Team-level research beats firm-level myth.</div>

            <div className="pull-quote">
              <p>"We filled a quarter of our fresher seats from referrals and alumni intros before the official form went live. The form was hygiene, not discovery."</p>
              <span className="pq-source">Campus recruiting lead, IT services firm (representative synthesis), 2026</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Ask what ships with your name on it</strong> Good first roles can point to a feature, client deliverable, model, or campaign you owned. Vague "support the team" language without milestones is a yellow flag.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Off-cycle paths exist</strong> Six-month contract-to-hire, internship conversions, and return offers from prior employers or freelance projects still route candidates into full-time roles outside the main placement window. Watch company career pages and alumni channels.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>3</div>
              <div>
                <div className="sec-title">What they pay in INR, without fairy tales</div>
                <div className="sec-sub">CTC varies by sector, employer type, and whether variable pay is bundled into the headline number</div>
              </div>
            </div>
            <p>Annual CTC for entry-level full-time roles in India in 2026 often sits in a wide band from roughly 3.5 LPA to 18 LPA or more for top product and GCC campus offers, with IT services structured programmes typically in a strong mid band and startups more variable.</p>
            <p>Some employers bundle variable pay, joining bonus, and stock into headline CTC, which changes your in-hand cash. Two offers with the same headline number are not equal if one is 70% fixed and the other is 50% variable with a clawback clause.</p>
            <p>Tier-two city roles and mid-market employers may pay below headline Bangalore numbers but offer lower living costs and faster ownership. That can be rational if you are optimising for skill depth and conversion odds, not headline CTC alone.</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>Turn bands into conversations</h4>
                <p>When you know your target CTC band, Studojo Outreach helps you reach the campus recruiter or hiring manager who can confirm real numbers for your cohort, not forum screenshots.</p>
                <Link to="/dojos/careers" className="rpt-cta-mid-btn">Try Studojo Outreach →</Link>
              </div>
            </div>

            <div className="chart-wrap">
              <div className="chart-label">Illustrative annual CTC index for entry-level full-time roles in India (midpoint index, 0 to 20 scale)</div>
              <div style={{ height: 340 }}>
                <canvas id="indiaFirstJobCtcBandChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Use bands, not single numbers</strong> The chart above is an index for comparison, not a guarantee. Negotiate from evidence: competing offers, prior internships, and shipped artefacts.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Title drift is real</strong> "Software engineer" at one firm may be mostly maintenance. At another it is greenfield product work. Ask for last year's fresher project showcase if you can.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>Practical note:</strong> Always clarify fixed versus variable split, probation terms, bond clauses, relocation support, and whether the role is billable, cost-centre, or revenue-facing.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>4</div>
              <div>
                <div className="sec-title">Campus calendars vs off-cycle hiring</div>
                <div className="sec-sub">Placement season dominates visibility, but rolling off-campus hiring rewards year-round preparation</div>
              </div>
            </div>
            <p>Most high-visibility campus hiring aligns with final-year calendars, with offer spikes between August and November for July and August joiners, and a secondary off-campus surge between January and March for graduates who missed formal cycles or chose to skip them.</p>
            <p>IT services and GCC employers often run pre-placement offers after summer internships. Startups hire rolling because headcount plans shift quarter to quarter. BFSI and sales teams hire in batches tied to fiscal planning but also backfill continuously.</p>
            <p>Macro hiring cycles still shift fresher cohort sizes without press releases. A brand that hired five hundred graduates last year may hire three hundred this year. Parallel pipelines matter until offer letter paperwork is signed.</p>

            <div className="highlight"><strong>Key insight:</strong> Treat deadline clarity as part of your professional brand. Recruiters forward candidates who respond with crisp dates, city preferences, and conflict-free interview slots.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Build a personal hiring calendar</strong> Track pre-placement talk dates, aptitude test windows, and HR round schedules per target employer so you are not surprised by overlapping final rounds.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Off-campus is not a backup plan only</strong> Many strong first roles never touch a campus placement cell. Naukri, LinkedIn, Unstop, and direct outreach remain legitimate primary channels for tier-two and tier-three graduates.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>5</div>
              <div>
                <div className="sec-title">Channels that still move entry-level shortlists</div>
                <div className="sec-sub">Referrals, campus processes, and tight cold outreach beat spray-and-pray</div>
              </div>
            </div>
            <p>LinkedIn and Naukri remain the default discovery layers for India entry-level hiring. Profiles that link one shipped project, GitHub repo, or case write-up get more serious passes than buzzword summaries.</p>
            <p>Campus placement cells, hackathons, and employer insight sessions still route many structured cohorts. Off-campus candidates should treat those same competitions and open challenges as legitimate side doors.</p>
            <p>When you message a hiring manager or campus recruiter, lead with a specific problem you solved and one link to proof, not admiration for the brand. Busy managers forward messages that make them look sharp, not long essays.</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>Send the message that gets forwarded</h4>
                <p>Studojo Outreach helps you reach campus recruiters and hiring managers with a tight brief and one flagship link, the pattern Indian entry-level teams actually forward.</p>
                <Link to="/dojos/careers" className="rpt-cta-mid-btn">Try Studojo Outreach →</Link>
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Recruiters are routers, not gatekeepers</strong> Give a tight brief: join date, city flexibility, role preference, link to one flagship project, and prior internships that prove you can handle ambiguity.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Referrals need scaffolding</strong> Forward a short paragraph your alumni contact can paste into an internal referral form. Make it effortless to vouch for you.</span>
              </div>
            </div>

            <div className="callout-green"><strong>Weekly habit:</strong> One portfolio or project update, two tailored applications, and one warm intro ask with a paste-ready blurb for your contact. Consistency beats bursts the night before deadlines.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>6</div>
              <div>
                <div className="sec-title">Skill gaps that kill first-round screens</div>
                <div className="sec-sub">Sector-specific proof beats generic resumes in every funnel</div>
              </div>
            </div>
            <p>Tech first-round screens in India still weight DSA fundamentals and one demonstrable project. Candidates who can explain trade-offs in a system they built convert at higher rates than those with certificate stacks and no shipped code.</p>
            <p>BFSI and analytics roles weight Excel comfort, basic modelling, and structured case answers. Sales and BD roles weight CRM fluency, objection handling, and communication under pressure. Marketing roles weight campaign metrics and portfolio samples, not only course certificates.</p>
            <p>AI literacy is becoming a hygiene factor across sectors, not a standalone role for most freshers. Employers expect you to use tools thoughtfully and explain outputs, not claim prompt-engineering expertise without domain context.</p>

            <div className="highlight"><strong>Summary insight:</strong> India rewards entry-level candidates who combine sector fluency, structured communication, and proof of execution. Optimism without artefacts burns cycles.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Compare three offer components</strong> Cash today, learning depth, and growth trajectory. A higher CTC with no mentorship or stale tech stack is not automatically optimal.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Keep a parallel pipeline until paperwork</strong> Reorgs and hiring freezes happen quarterly. A verbal yes is not a stamped offer letter.</span>
              </div>
            </div>

            <div className="callout-red"><strong>Checklist:</strong> Signed offer letter, fixed versus variable CTC clarity, probation and bond terms, reporting manager name, onboarding timeline, and what deliverable you will own in your first ninety days.</div>
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
              <div className="blist-item" key="Search by team and shipped scope">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Search by team and shipped scope.</strong> Map five target teams doing the work you want, not only five famous logos. Read who leads the squad and what freshers owned last year.</span>
              </div>
              <div className="blist-item" key="Make dates, cities, and roles explicit">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Make dates, cities, and roles explicit.</strong> Put join date, location flexibility, and role preference in your summary and first recruiter message. Reduce back-and-forth so you look low-friction.</span>
              </div>
              <div className="blist-item" key="Negotiate on total package">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Negotiate on total package.</strong> Ask how fixed pay, variable, joining bonus, and bond clauses combine. Use bands from this report as anchors, then validate with real offers in your cohort.</span>
              </div>
              <div className="blist-item" key="Run a dual-track search">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Run a dual-track search.</strong> Keep campus and portal alerts, and run referrals plus direct recruiter outreach weekly. Tag outcomes by channel so you know what actually works for your profile in India.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Reach hiring managers for your first role in India, directly.</h3>
              <p>Studojo Outreach finds the people behind real entry-level pipelines and helps you land in their inbox with a personalised, credible intro. No resume builder rabbit hole.</p>
            </div>
            <Link to="/dojos/careers" className="rpt-cta-btn">
              Explore Studojo Careers →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
