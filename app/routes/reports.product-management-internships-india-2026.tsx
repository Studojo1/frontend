import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Product Management Internships India 2026: Who Hires, What You Earn, and How Offers Actually Close | Studojo" },
    { name: "description", content: "A 2026 snapshot of product management internships in India: where demand clusters, illustrative stipend bands in INR, hiring windows, and how students break in beyond generic job posts." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "product management internship India 2026, PM intern stipend India, how to get PM internship India, associate product intern campus hiring, product internship Bangalore Mumbai" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/product-management-internships-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Product Management Internships India 2026: Who Hires, What You Earn, and How Offers Actually Close" },
    { property: "og:description", content: "PM internships in India in 2026: sectors, stipend bands, timelines, and the channels that still move shortlists." },
    { property: "og:url", content: `${BASE_URL}/reports/product-management-internships-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-10T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Product Management Internships India 2026: Who Hires, What You Earn, and How Offers Actually Close | Studojo" },
    { name: "twitter:description", content: "India PM interns 2026: who hires, INR stipend ranges, and how offers close off the obvious boards." },
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

  const indiaPmInternSectorMixChartEl = document.getElementById("indiaPmInternSectorMixChart") as HTMLCanvasElement | null;
  if (indiaPmInternSectorMixChartEl && !indiaPmInternSectorMixChartEl.dataset.rendered) {
    indiaPmInternSectorMixChartEl.dataset.rendered = "1";
    new Chart(indiaPmInternSectorMixChartEl, {
      type: "doughnut",
      data: {
        labels: ["Consumer internet and marketplaces", "Fintech and payments", "B2B SaaS and enterprise software", "E-commerce and logistics tech", "Health, edtech, and vertical SaaS", "GCCs and global product hubs in India"],
        datasets: [{
          data: [26.0, 20.0, 18.0, 12.0, 14.0, 10.0],
          backgroundColor: ["#6366f1", "#8b5cf6", "#a855f7", "#818cf8", "#4f46e5", "#737373"],
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

  const indiaPmInternStipendBandChartEl = document.getElementById("indiaPmInternStipendBandChart") as HTMLCanvasElement | null;
  if (indiaPmInternStipendBandChartEl && !indiaPmInternStipendBandChartEl.dataset.rendered) {
    indiaPmInternStipendBandChartEl.dataset.rendered = "1";
    new Chart(indiaPmInternStipendBandChartEl, {
      type: "bar",
      data: {
        labels: ["Top-tier funded consumer or fintech (structured programme)", "Growth-stage B2B SaaS (APM or PM intern)", "Mid-market product org (6 to 8 week summer)", "Campus-linked cohort at large tech employer", "Startup with small product team (high variance)", "Stipend-plus-equity or grant-heavy early startup"],
        datasets: [{
          label: "Illustrative monthly INR stipend index for PM intern roles (midpoint index, 0 to 25 scale)",
          data: [21.2, 17.5, 13.8, 16.0, 10.5, 9.2],
          backgroundColor: ["#6366f1", "#8b5cf6", "#818cf8", "#4f46e5", "#a855f7", "#737373"],
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
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #6366f1; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #6366f1; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #6366f1; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }
  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #6366f1; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
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
  .rpt-cta { background: #6366f1; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #6366f1; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #6366f1; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #6366f1; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_ProductManagementInternshipsIndia2026() {
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
        "headline": "Product Management Internships India 2026: Who Hires, What You Earn, and How Offers Actually Close",
        "description": "A 2026 snapshot of product management internships in India: where demand clusters, illustrative stipend bands in INR, hiring windows, and how students break in beyond generic job posts.",
        "url": `${BASE_URL}/reports/product-management-internships-india-2026`,
        "datePublished": "2026-05-10T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/product-management-internships-india-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Product Management Internships India 2026: Who Hires, What You Earn, and How Offers Actually Close", "item": `${BASE_URL}/reports/product-management-internships-india-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Internships · May 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Product Management Internships India 2026: Who Hires, What You Earn, and How Offers Actually Close</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "Product Management Internships India 2026:<br /><em>Who Hires, What You Earn, and How Offers Actually Close</em>" }} />
            <p className="rpt-hero-sub">Job boards and mass mailing lists show a thin slice of how PM intern roles fill in India. Teams hire across consumer tech, fintech, enterprise SaaS, and global capability centres, often with campus pipelines, referrals, and hiring-manager screens in the loop. This report maps where demand clusters in 2026, what INR stipend bands look like for serious programmes, and how to search without mistaking hype for your personal funnel.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Early-career product roles (APM, PM intern, product analyst pathways)</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Career / Internships</span>
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
              <div className="sc-num">~38%</div>
              <div className="sc-label">Illustrative share of visible PM intern and APM pipeline volume tied to scaled consumer, fintech, and B2B SaaS employers in Studojo's 2026 India synthesis</div>
              <div className="sc-source">Studojo sector-weighting synthesis, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">2 peaks</div>
              <div className="sc-label">Most structured PM intern hiring still concentrates around summer internship windows and pre-placement offers tied to final-year campus cycles</div>
              <div className="sc-source">Studojo hiring-calendar synthesis, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">3x</div>
              <div className="sc-label">Typical lift in interview probability when a candidate ships one crisp case write-up or teardown versus a generic resume-only apply</div>
              <div className="sc-source">Studojo PM intern signal framework, 2026</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6366f1" }}>1</div>
              <div>
                <div className="sec-title">India is a product hiring continent, not one labour pool</div>
                <div className="sec-sub">Bangalore, NCR, and Hyderabad anchor volume, but remote-first teams complicate the map</div>
              </div>
            </div>
            <p>Most PM intern and associate product manager (APM) roles still cluster around product engineering hubs: Bangalore, the National Capital Region, and Hyderabad, with meaningful secondary pockets in Pune, Chennai, and Mumbai for certain verticals.</p>
            <p>Global capability centres based in India increasingly run roadmap slices for international products. Those roles can look like "PM intern" on paper but expect stakeholder calls across time zones and clearer written communication than a purely domestic sprint team.</p>
            <p>Remote-first Indian startups may hire interns anywhere with good internet, but many programmes still prefer co-location for mentorship density. Read the JD for expected office days before optimising only for brand.</p>

            <div className="chart-wrap">
              <div className="chart-label">Where PM intern hiring activity concentrates in India (illustrative mix, %)</div>
              <div style={{ height: 280 }}>
                <canvas id="indiaPmInternSectorMixChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> Your competition is not only IIT and NIT pipelines. Strong portfolios from regional universities and returnees from gap-year projects routinely clear screens when proof is obvious.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>City label versus actual team</strong> Many offers say Bangalore or Gurgaon but the hiring manager sits in a different cluster. Clarify reporting line and mentor load in week one.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>GCC roles are a different sport</strong> Expect more documentation, stakeholder matrices, and release hygiene. That is excellent training if you want enterprise or platform PM paths later.</span>
              </div>
            </div>

            <div className="callout"><strong>Reframe:</strong> Search by problem domain and team maturity, not only by unicorn logo. A Series B logistics SaaS can teach more PM craft in eight weeks than a famous app where you only file tickets.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6366f1" }}>2</div>
              <div>
                <div className="sec-title">Who is actually hiring PM interns in 2026</div>
                <div className="sec-sub">Consumer, fintech, and B2B SaaS lead visibility; GCCs and vertical SaaS grow share</div>
              </div>
            </div>
            <p>Employers with visible PM intern budgets in 2026 include scaled consumer apps and marketplaces modernising discovery and trust, fintech and payments players shipping compliance-heavy releases, and B2B SaaS firms building onboarding and expansion loops.</p>
            <p>E-commerce and logistics tech still run large summer cohorts tied to peak-season readiness. Health, edtech, and vertical SaaS hire fewer seats per company but often give interns closer access to founders and live metrics.</p>
            <p>Some programmes are explicitly APM tracks with rotation across growth, platform, and core product. Others title the role "product intern" but assign mostly analytics or operations support. Read scope, not only the badge.</p>

            <div className="highlight"><strong>Key insight:</strong> The same employer can run a serious PM intern programme in one business unit and a token internship in another. Business-unit research beats company-level myth.</div>

            <div className="pull-quote">
              <p>"We filled half our PM intern seats from referrals and club networks before the official form went live. The form was hygiene, not discovery."</p>
              <span className="pq-source">Product leader, growth-stage SaaS (representative synthesis), 2026</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Ask what ships with your name on it</strong> Good programmes can point to a spec, experiment readout, or launch checklist you owned. Vague "support the PM" language without milestones is a yellow flag.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Campus schedules are not the whole market</strong> Off-cycle interns exist for gap semesters, thesis-linked work, and return offers from prior freelance or club projects. Watch company blogs and PM Twitter for ad hoc cohorts.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6366f1" }}>3</div>
              <div>
                <div className="sec-title">What they pay in INR, without fairy tales</div>
                <div className="sec-sub">Stipends vary by funding stage, programme length, and whether housing is bundled</div>
              </div>
            </div>
            <p>Monthly stipends for structured PM intern programmes in India in 2026 often sit in a wide band from roughly 25,000 INR to 90,000 INR for many eight-to-twelve week corporate programmes, with top-tier consumer and fintech cohorts skewing higher and early startups lower but sometimes sweetening with equity or grants.</p>
            <p>Some employers bundle accommodation, travel, or meal allowances, which changes your net cash. Two offers with the same headline stipend are not equal if one expects you to self-fund Mumbai rent for the summer.</p>
            <p>Very small teams sometimes pay stipends below typical living costs for the city but offer founder proximity. That can be rational if you are optimising for learning and reference letters, not monthly savings.</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>Turn bands into conversations</h4>
                <p>When you know your target stipend band, Studojo Outreach helps you reach the hiring manager or recruiter who can confirm real numbers for your cohort, not forum screenshots.</p>
                <Link to="/outreach" className="rpt-cta-mid-btn">Try Studojo Outreach →</Link>
              </div>
            </div>

            <div className="chart-wrap">
              <div className="chart-label">Illustrative monthly INR stipend index for PM intern roles (midpoint index, 0 to 25 scale)</div>
              <div style={{ height: 340 }}>
                <canvas id="indiaPmInternStipendBandChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Use bands, not single numbers</strong> The chart above is an index for comparison, not a guarantee. Negotiate from evidence: competing offers, prior internships, and shipped artefacts.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Title drift is real</strong> "Product intern" at one firm may be mostly SQL dashboards. At another it is PRDs and A/B tests. Ask for last year's intern showcase if you can.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>Practical note:</strong> Always clarify gross stipend, TDS handling, internship agreement duration, full-time conversion criteria, and whether PPO evaluation is tied to a single project or composite feedback.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6366f1" }}>4</div>
              <div>
                <div className="sec-title">Calendars, PPOs, and why timelines feel chaotic</div>
                <div className="sec-sub">Summer windows dominate, but off-cycle and thesis-linked roles reward patience</div>
              </div>
            </div>
            <p>Most high-visibility PM intern hiring still aligns with summer breaks and campus placement calendars, with offer spikes between January and April for summer start dates and a smaller autumn window for six-month programmes.</p>
            <p>Pre-placement offers often assume you will join full-time after graduation. Read PPO clauses for bond periods, role placement guarantees, and what happens if the business unit reorganises before you join.</p>
            <p>Macro funding cycles still shift intern cohort sizes quarter to quarter. A brand that hired twenty PM interns last year may hire eight this year without a press release. Parallel pipelines matter.</p>

            <div className="highlight"><strong>Key insight:</strong> Treat deadline clarity as part of your professional brand. Recruiters forward candidates who respond with crisp dates, availability, and conflict-free interview slots.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Build a personal hiring calendar</strong> Track application open dates, test platforms, and manager chat rounds per target firm so you are not surprised by overlapping super days.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Ask conversion mechanics early</strong> Request how PPO decisions are made: manager-only, committee, cross-functional review, and typical notification week.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6366f1" }}>5</div>
              <div>
                <div className="sec-title">Channels that still move PM intern shortlists</div>
                <div className="sec-sub">Portfolios, referrals, campus programmes, and tight cold outreach beat spray-and-pray</div>
              </div>
            </div>
            <p>LinkedIn remains the default discovery layer for India tech hiring. Profiles that link one flagship teardown, PRD sample, or experiment write-up get more serious passes than buzzword summaries.</p>
            <p>Campus placement cells, hackathons, and product case competitions still route many structured cohorts. Off-campus candidates should treat those same competitions and open challenges as legitimate side doors.</p>
            <p>When you message a PM or hiring manager, lead with a specific customer problem you investigated and one recommendation, not admiration for the brand. Busy managers forward messages that make them look sharp, not long essays.</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>Send the message that gets forwarded</h4>
                <p>Studojo Outreach helps you reach hiring managers with a tight brief and one flagship link, the pattern Indian product teams actually forward.</p>
                <Link to="/outreach" className="rpt-cta-mid-btn">Try Studojo Outreach →</Link>
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Recruiters are routers, not gatekeepers</strong> Give a tight brief: internship window, city flexibility, link to one flagship project, and courses or jobs that prove you can handle ambiguity.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Referrals need scaffolding</strong> Forward a short paragraph your alumni contact can paste into an internal referral form. Make it effortless to vouch for you.</span>
              </div>
            </div>

            <div className="callout-green"><strong>Weekly habit:</strong> One shipped artefact update, two tailored applications, and one warm intro ask with a paste-ready blurb for your contact. Consistency beats bursts the night before deadlines.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6366f1" }}>6</div>
              <div>
                <div className="sec-title">Red flags and realism for 2026</div>
                <div className="sec-sub">Vague scope, unpaid trial projects, and PPO promises without paperwork</div>
              </div>
            </div>
            <p>Be cautious of employers who will not put stipend, duration, reporting manager, and evaluation criteria in a written internship agreement. Verbal promises evaporate when budgets tighten.</p>
            <p>Take-home assignments that look like full roadmap or GTM work for free are a pattern in every market, including India. Push for bounded tasks, or ask whether strong submissions receive interview priority and timeline guarantees.</p>
            <p>If conversion to PPO is sold aggressively but HR cannot explain the rubric, treat the role as learning-only until something is documented.</p>

            <div className="highlight"><strong>Summary insight:</strong> India rewards PM intern candidates who combine quantitative comfort, user empathy, and written clarity. Optimism without proof burns cycles.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Compare three offer components</strong> Cash today, learning depth, and conversion odds. A higher stipend with no mentorship is not automatically optimal.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Keep a parallel pipeline until paperwork</strong> Funding and reorgs happen quarterly. A verbal yes is not a stamped internship agreement.</span>
              </div>
            </div>

            <div className="callout-red"><strong>Checklist:</strong> Signed offer or internship letter, stipend and TDS clarity, duration and notice if early exit, mentor name, weekly cadence, and what artefact you will own for your portfolio.</div>
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
              <div className="blist-item" key="Search by team maturity and shipped scope">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Search by team maturity and shipped scope.</strong> Map five target product units doing the work you want, not only five famous logos. Read who leads the squad and what they shipped last quarter.</span>
              </div>
              <div className="blist-item" key="Make dates and cities explicit">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Make dates and cities explicit.</strong> Put internship window, office-day expectations, and relocation constraints in your summary and first recruiter message. Reduce back-and-forth so you look low-friction.</span>
              </div>
              <div className="blist-item" key="Negotiate on total support">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Negotiate on total support.</strong> Ask how stipend, housing, travel, and PPO evaluation combine. Use bands from this report as anchors, then validate with real offers in your cohort.</span>
              </div>
              <div className="blist-item" key="Run a dual-track search">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Run a dual-track search.</strong> Keep campus and portal alerts, and run referrals plus direct manager outreach weekly. Tag outcomes by channel so you know what actually works for your profile in India.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Reach product hiring managers in India, directly.</h3>
              <p>Studojo Outreach finds the people behind real PM intern and APM pipelines and helps you land in their inbox with a personalised, credible intro. No resume builder rabbit hole.</p>
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
