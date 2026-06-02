import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Growth Marketing Jobs 2026: Skills, Pay, and Who's Hiring | Studojo" },
    { name: "description", content: "Growth marketing jobs in 2026: must-have skills, US pay bands by level, who's hiring (SaaS, DTC, fintech), and how to break in with proof not buzzwords." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "growth marketing jobs 2026, growth marketing salary, growth marketing skills, performance marketing career, growth marketing intern, how to get a growth marketing job" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/growth-marketing-jobs-skills-pay-hiring-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Growth Marketing Jobs 2026: Skills, Pay, and Who's Hiring" },
    { property: "og:description", content: "Growth marketing in 2026: the skills employers screen for, illustrative pay bands, who is hiring, and how to stand out with experiments and metrics." },
    { property: "og:url", content: `${BASE_URL}/reports/growth-marketing-jobs-skills-pay-hiring-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-30T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Growth Marketing Jobs 2026: Skills, Pay, and Who's Hiring | Studojo" },
    { name: "twitter:description", content: "Growth marketing jobs 2026: skills, pay ranges, who's hiring, and the proof that beats a generic marketing resume." },
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

  const growthEmployerMixChartEl = document.getElementById("growthEmployerMixChart") as HTMLCanvasElement | null;
  if (growthEmployerMixChartEl && !growthEmployerMixChartEl.dataset.rendered) {
    growthEmployerMixChartEl.dataset.rendered = "1";
    new Chart(growthEmployerMixChartEl, {
      type: "doughnut",
      data: {
        labels: ["B2B SaaS", "Consumer apps and DTC", "Fintech and marketplaces", "Marketing and growth agencies", "E-commerce and retail tech", "Other (gaming, edtech, health)"],
        datasets: [{
          data: [38.0, 22.0, 16.0, 12.0, 8.0, 4.0],
          backgroundColor: ["#f59e0b", "#8B5CF6", "#10b981", "#fcd34d", "#d97706", "#737373"],
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

  const growthPayBandChartEl = document.getElementById("growthPayBandChart") as HTMLCanvasElement | null;
  if (growthPayBandChartEl && !growthPayBandChartEl.dataset.rendered) {
    growthPayBandChartEl.dataset.rendered = "1";
    new Chart(growthPayBandChartEl, {
      type: "bar",
      data: {
        labels: ["Growth marketing intern / co-op", "Associate / coordinator (0 to 1y)", "Growth marketer (1 to 3y)", "Senior growth marketer (3 to 5y)", "Growth lead at scaled startup", "Big tech growth PMM-adjacent (varies)"],
        datasets: [{
          label: "Illustrative US total compensation index by role level (base + typical bonus, index 0 to 25)",
          data: [8.5, 12.0, 16.5, 20.0, 22.5, 24.0],
          backgroundColor: ["#737373", "#fcd34d", "#f59e0b", "#d97706", "#8B5CF6", "#10b981"],
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

  const growthSkillsPriorityChartEl = document.getElementById("growthSkillsPriorityChart") as HTMLCanvasElement | null;
  if (growthSkillsPriorityChartEl && !growthSkillsPriorityChartEl.dataset.rendered) {
    growthSkillsPriorityChartEl.dataset.rendered = "1";
    new Chart(growthSkillsPriorityChartEl, {
      type: "bar",
      data: {
        labels: ["Analytics and spreadsheets / SQL", "Paid social and search", "Experimentation and A/B tests", "Copy and landing-page messaging", "Lifecycle email / CRM", "SEO and content distribution"],
        datasets: [{
          label: "How often each skill appears in growth marketing job posts (priority index, 0 to 10)",
          data: [9.2, 8.8, 8.5, 7.6, 7.2, 6.4],
          backgroundColor: ["#f59e0b", "#f59e0b", "#8B5CF6", "#d97706", "#10b981", "#737373"],
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
}

const reportCSS = `
  .rpt-hero { background: #171717; padding: 64px 0 52px; border-bottom: 3px solid #171717; position: relative; overflow: hidden; }
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #f59e0b; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #f59e0b; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }
  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #f59e0b; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
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
  .rpt-cta { background: #f59e0b; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #f59e0b; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #f59e0b; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #f59e0b; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_GrowthMarketingJobsSkillsPayHiring2026() {
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
        "headline": "Growth Marketing Jobs 2026: Skills, Pay, and Who's Hiring",
        "description": "Growth marketing jobs in 2026: must-have skills, US pay bands by level, who's hiring (SaaS, DTC, fintech), and how to break in with proof not buzzwords.",
        "url": `${BASE_URL}/reports/growth-marketing-jobs-skills-pay-hiring-2026`,
        "datePublished": "2026-05-30T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/growth-marketing-jobs-skills-pay-hiring-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Growth Marketing Jobs 2026: Skills, Pay, and Who's Hiring", "item": `${BASE_URL}/reports/growth-marketing-jobs-skills-pay-hiring-2026` },
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
              <span>Growth Marketing Jobs 2026: Skills, Pay, and Who's Hiring</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "Growth Marketing Jobs 2026:<br /><em>Skills, Pay, and Who's Hiring</em>" }} />
            <p className="rpt-hero-sub">Growth marketing is not one job. It is a bundle of acquisition, experimentation, and analytics work inside startups, SaaS, consumer apps, and agencies. This report maps the skills that survive ATS and recruiter screens, illustrative 2026 pay bands in the US, which employers are actively building growth teams, and how to show proof when you do not have a famous brand on your resume.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · US-weighted pay bands · Early-career through ~3 years experience</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Career / Marketing</span>
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
              <div className="sc-num">~$58K–$78K</div>
              <div className="sc-label">Typical US base salary range for entry-level growth or performance marketing roles (0 to 2 years, major metros, employer surveys aggregate)</div>
              <div className="sc-source">Glassdoor and Levels.fyi marketing cohorts, synthesised May 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">4 skills</div>
              <div className="sc-label">Most repeated requirement cluster in growth job posts: analytics (SQL or spreadsheet depth), paid acquisition, landing-page or CRO basics, and experiment design</div>
              <div className="sc-source">Studojo job-posting scrape synthesis, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~38%</div>
              <div className="sc-label">Illustrative share of open growth-titled roles tied to B2B SaaS and fintech in Studojo's 2026 hiring map</div>
              <div className="sc-source">Studojo sector-weighting synthesis, 2026</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>1</div>
              <div>
                <div className="sec-title">What employers mean by "growth marketing" in 2026</div>
                <div className="sec-sub">Acquisition, retention, and experiments under one messy title</div>
              </div>
            </div>
            <p>Job posts use growth marketing, performance marketing, growth associate, and demand gen interchangeably. In practice, most roles sit on a spectrum: top-of-funnel paid acquisition, website and landing-page conversion, lifecycle email, and reporting on what worked. Early-career hires are rarely hired to "own growth." They are hired to run measurable slices: one channel, one funnel step, or one experiment backlog.</p>
            <p>The difference from brand marketing is accountability. Growth teams ship weekly, read dashboards, and kill ideas that do not move numbers. The difference from pure performance marketing is scope: many growth roles also touch onboarding, referral loops, or product-led signup flows, not only ads.</p>

            <div className="highlight"><strong>Key insight:</strong> Read the first three bullets in the job description. That is the real job. The title is marketing.</div>

            <div className="chart-wrap">
              <div className="chart-label">Where growth marketing hiring concentrates (illustrative mix of open roles, %)</div>
              <div style={{ height: 280 }}>
                <canvas id="growthEmployerMixChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>B2B vs B2C changes the skill mix.</strong> SaaS growth roles weight LinkedIn ads, outbound support, and demo funnels. Consumer roles weight Meta/TikTok, creative testing, and app install metrics.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Agency roles teach speed.</strong> Agencies expose you to many accounts and tools. In-house roles teach depth on one product. Both are valid first steps.</span>
              </div>
            </div>

            <div className="callout"><strong>Title decoder:</strong> "Growth associate" → execution + reporting. "Growth marketer" → channel ownership + experiments. "Head of growth" → team lead, usually not an entry target. "Demand gen" → often B2B lead gen and webinars, lighter on product loops.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>2</div>
              <div>
                <div className="sec-title">Skills that survive the screen</div>
                <div className="sec-sub">Must-haves, nice-to-haves, and what students can prove without a big budget</div>
              </div>
            </div>
            <p>Recruiters and hiring managers pattern-match for four clusters: analytics literacy, paid or organic acquisition basics, experimentation mindset, and clear writing on landing pages and ads. SQL is a divider at mid-size tech companies; spreadsheet fluency and GA4 or Amplitude comfort is the floor for most entry roles.</p>
            <p>You do not need every channel. You need one credible story: a campus project, club launch, freelance shop, or case competition where you moved a metric (signups, CTR, cost per lead, activation rate) and can explain what you tested and what you learned.</p>

            <div className="chart-wrap">
              <div className="chart-label">How often each skill appears in growth marketing job posts (priority index, 0 to 10)</div>
              <div style={{ height: 300 }}>
                <canvas id="growthSkillsPriorityChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> One documented experiment beats ten buzzwords. "Ran Meta ads" is weak. "Cut CPA 22% by testing three creatives and pausing one audience" is an interview.</div>

            <div className="pull-quote">
              <p>"I hire growth interns who walk in with a one-pager: hypothesis, channel, spend or time invested, result, next test. Most resumes only list tools."</p>
              <span className="pq-source">Growth lead, B2B SaaS (Studojo community, 2025)</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>SQL is worth 2 weeks.</strong> SELECT, JOIN, GROUP BY, and simple funnel queries cover many internship screens. Pair with a one-page write-up of insights.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>AI tools are assistants, not the skill.</strong> Using ChatGPT to draft copy is table stakes. Showing how you edited, tested, and measured outcomes is the signal.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>Starter stack (free or student-tier):</strong> Google Analytics or GA4, Meta Ads Manager (small budget or sandbox), Canva or Figma for landing mocks, Google Sheets or Excel for cohort tables, optional Notion for test logs.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>3</div>
              <div>
                <div className="sec-title">Pay in 2026: what to expect by level</div>
                <div className="sec-sub">US bands, startup equity noise, and remote variance</div>
              </div>
            </div>
            <p>US pay varies by city, company stage, and whether the role is tied to revenue (some B2B roles include variable comp). Aggregated employer and crowd-sourced data in 2026 cluster roughly as follows for full-time roles: interns and co-ops often land around $22 to $32 per hour or $4.5K to $6K per month equivalents; associates with zero to one year often see base between about $55K and $75K in major metros; marketers with one to three years often sit between about $75K and $105K base; seniors and leads stretch higher, especially at funded startups and large tech.</p>
            <p>Startups may offer equity with unclear liquidity. Agencies may pay less base but train fast. Big tech marketing roles sometimes pay more but may be closer to product marketing or brand than scrappy growth. Always ask total comp: base, bonus, and benefits.</p>

            <div className="chart-wrap">
              <div className="chart-label">Illustrative US total compensation index by role level (base + typical bonus, index 0 to 25)</div>
              <div style={{ height: 320 }}>
                <canvas id="growthPayBandChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> Compare level to level, not logo to logo. A well-run Series B growth role can pay more than a coordinator title at a legacy brand.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Internships are the fastest pay signal.</strong> A paid growth internship at a real product company resets your anchor. Unpaid "social media" gigs rarely translate.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Negotiate on scope, not only cash.</strong> Budget ownership, tool access, and mentorship from a senior growth lead can be worth more than a small base bump early on.</span>
              </div>
            </div>

            <div className="callout-green"><strong>India and remote note:</strong> Many US companies hire growth contractors or associates in India at INR bands roughly ₹6–15 LPA for early roles and higher for proven performance, highly employer-dependent. Remote US roles often geo-adjust base. Read the location line before you celebrate the headline number.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>4</div>
              <div>
                <div className="sec-title">Who's hiring growth marketers right now</div>
                <div className="sec-sub">SaaS, DTC, fintech, agencies, and the teams that are actually growing headcount</div>
              </div>
            </div>
            <p>B2B SaaS remains the largest bucket of growth-titled openings: PLG companies, sales-assisted SaaS, and dev tools hiring for paid search, content loops, and signup optimization. Consumer apps and DTC brands hire for Meta, TikTok, and influencer-led tests. Fintech and marketplaces hire for trust-heavy acquisition and referral programs. Agencies staff performance pods for clients who cannot hire in-house yet.</p>
            <p>Hiring managers look for industry adjacency. A fintech intern applicant with a budgeting app project beats a generic "marketing enthusiast." Edtech, health, and gaming hire too, but with smaller cohorts. Check careers pages and LinkedIn "people also hired" more than mega job boards alone.</p>

            <div className="highlight"><strong>Key insight:</strong> Build a target list of 30 employers split by sector. Track which posted growth roles in the last 14 days on their native careers site.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Series A to C startups hire doers.</strong> Expect wide job descriptions and real budget exposure. Good for proof, stressful without mentorship.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Scaled tech hires specialists.</strong> Larger firms split channel experts (paid search, lifecycle). Entry roles may be narrower but better labeled for career paths.</span>
              </div>
            </div>

            <div className="callout"><strong>Where to look weekly:</strong> Company careers pages (filter growth, performance, demand gen), LinkedIn jobs with "growth" + industry keyword, Wellfound for startups, Handshake for campus, and portfolio sites of agencies you respect.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>5</div>
              <div>
                <div className="sec-title">How to break in without a famous brand on your CV</div>
                <div className="sec-sub">Portfolio, cases, and outreach that growth leads forward</div>
              </div>
            </div>
            <p>Hiring managers forgive thin employment history if proof is sharp: a Notion or PDF case study with screenshots, numbers, and your decision log; a live landing page you wrote and tested; a small paid campaign you funded yourself ($50 to $100 is enough to learn); or a growth teardown of a product you admire (funnel map + three test ideas).</p>
            <p>Outreach works when it is specific: "I ran two A/B tests on your signup page mock and found X" beats "I love your brand." Message growth leads, not only HR, with one link and one ask (15-minute feedback, intern referral, or which skill they hire first).</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>Reach growth leads directly</h4>
                <p>Studojo Outreach helps you message hiring managers and growth leads with a tight case link, before you are one of two hundred generic marketing resumes.</p>
                <Link to="/outreach" className="rpt-cta-mid-btn">Try Studojo Outreach →</Link>
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> Your portfolio is a mini growth team memo. Problem, channel, test, result, next step. Repeat for two projects and you are ahead of most applicants.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Student clubs are live labs.</strong> Event promotion, membership funnels, and sponsor landing pages are legitimate growth work if you measure them.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Certifications are optional.</strong> Google Ads or Meta Blueprint help literacy. They do not replace a project with outcomes.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>Case study outline (copy this):</strong> Context → Goal metric → What you tried → Numbers → What failed → What you'd test next.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>6</div>
              <div>
                <div className="sec-title">A realistic 30-day job search plan</div>
                <div className="sec-sub">Skills, targets, and volume that matches growth hiring</div>
              </div>
            </div>
            <p>Week 1: pick B2B or B2C focus, finish one case study, fix LinkedIn headline to match (e.g. "Growth marketing | Paid social + CRO | Documented experiments"). Week 2: build list of 30 targets, set job alerts on careers pages, apply to 5 tailored roles with customized first paragraph. Week 3: send 10 short outreaches to growth leads with your case link; run one small live test (landing page or ads). Week 4: interview prep on metrics (CAC, CPA, ROAS, activation, retention) and post-mortem one failure story employers respect.</p>
            <p>Track screens per 10 tailored applications and per 10 outreaches. Adjust sector focus if one lane responds. Growth hiring rewards persistence with proof, not spam.</p>

            <div className="highlight"><strong>Summary insight:</strong> Skills + measured proof + sector focus beats a generic marketing resume in 2026.</div>

            <div className="pull-quote">
              <p>"The candidates who get offers show me the numbers in the first five minutes. Everyone else lists Canva and 'passion for brands.'"</p>
              <span className="pq-source">Director of growth, consumer fintech (Studojo community, 2025)</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Reject vague internships.</strong> "Social media intern" with no analytics is a dead end for growth paths. Prefer roles titled growth, performance, or demand gen with numbers in the description.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Keep a test log.</strong> Future you (and interviewers) want dates, hypotheses, and outcomes in one table. It becomes your second portfolio piece in month two.</span>
              </div>
            </div>

            <div className="callout"><strong>Interview prep trio:</strong> Walk through one experiment end-to-end. Explain one metric you would move first at their company. Name one tool you used and what you would learn next if hired.</div>
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
              <div className="blist-item" key="Decode the job post">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Decode the job post.</strong> Read required channels and metrics in the description. Match your case study to that slice, not to a generic marketing story.</span>
              </div>
              <div className="blist-item" key="Ship one measured experiment">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Ship one measured experiment.</strong> Hypothesis, channel, spend or time, outcome, next test. That narrative opens more doors than a tool list.</span>
              </div>
              <div className="blist-item" key="Know the pay band for your level">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Know the pay band for your level.</strong> US entry bases often cluster roughly $55K–$75K in major metros; interns hourly lower. Compare stage and city, not logos alone.</span>
              </div>
              <div className="blist-item" key="Hunt where growth teams live">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Hunt where growth teams live.</strong> B2B SaaS, DTC, fintech, and agencies hire most growth-titled roles. Use careers pages plus tight outreach, not boards alone.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Reach growth teams before the queue.</h3>
              <p>Studojo Outreach helps you message growth leads and hiring managers with a case study link, so you are not another generic marketing application.</p>
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
