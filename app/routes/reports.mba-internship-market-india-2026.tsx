import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The MBA Internship Market India 2026: Who Hires, What They Pay, and How Offers Actually Close | Studojo" },
    { name: "description", content: "A 2026 snapshot of MBA summer internships in India: consulting, banking, FMCG, and tech strategy pipelines, stipend bands in INR, campus calendars, and how students break in off the obvious portals." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "MBA internship India 2026, MBA summer internship stipend India, IIM internship hiring 2026, consulting MBA intern India, MBA placement summer internship" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/mba-internship-market-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The MBA Internship Market India 2026: Who Hires, What They Pay, and How Offers Actually Close" },
    { property: "og:description", content: "MBA internships in India 2026: sectors, INR stipend bands, hiring windows, and channels that still move shortlists." },
    { property: "og:url", content: `${BASE_URL}/reports/mba-internship-market-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-19T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The MBA Internship Market India 2026: Who Hires, What They Pay, and How Offers Actually Close | Studojo" },
    { name: "twitter:description", content: "India MBA interns 2026: who hires, stipend ranges, and how offers close beyond job boards." },
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

  const indiaMbaInternSectorMixChartEl = document.getElementById("indiaMbaInternSectorMixChart") as HTMLCanvasElement | null;
  if (indiaMbaInternSectorMixChartEl && !indiaMbaInternSectorMixChartEl.dataset.rendered) {
    indiaMbaInternSectorMixChartEl.dataset.rendered = "1";
    new Chart(indiaMbaInternSectorMixChartEl, {
      type: "doughnut",
      data: {
        labels: ["Management consulting", "Investment banking and markets", "FMCG and consumer", "Tech strategy and product", "Private equity and venture", "General management and conglomerates"],
        datasets: [{
          data: [28.0, 18.0, 16.0, 14.0, 12.0, 12.0],
          backgroundColor: ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#115e59", "#737373"],
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

  const indiaMbaInternStipendBandChartEl = document.getElementById("indiaMbaInternStipendBandChart") as HTMLCanvasElement | null;
  if (indiaMbaInternStipendBandChartEl && !indiaMbaInternStipendBandChartEl.dataset.rendered) {
    indiaMbaInternStipendBandChartEl.dataset.rendered = "1";
    new Chart(indiaMbaInternStipendBandChartEl, {
      type: "bar",
      data: {
        labels: ["Top-tier consulting (MBB-style programme)", "Bulge-bracket or leading IB summer analyst", "FMCG leadership intern (structured cohort)", "Tech strategy or corp dev at scaled employer", "Mid-market consulting or boutique IB", "Growth-stage startup strategy (high variance)"],
        datasets: [{
          label: "Illustrative monthly INR stipend index for MBA summer internships (midpoint index, 0 to 25 scale)",
          data: [23.5, 21.0, 17.8, 16.5, 14.2, 11.0],
          backgroundColor: ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#115e59", "#737373"],
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
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #0d9488; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #0d9488; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #0d9488; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }
  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #0d9488; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
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
  .rpt-cta { background: #0d9488; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #0d9488; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #0d9488; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #0d9488; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_MbaInternshipMarketIndia2026() {
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
        "headline": "The MBA Internship Market India 2026: Who Hires, What They Pay, and How Offers Actually Close",
        "description": "A 2026 snapshot of MBA summer internships in India: consulting, banking, FMCG, and tech strategy pipelines, stipend bands in INR, campus calendars, and how students break in off the obvious portals.",
        "url": `${BASE_URL}/reports/mba-internship-market-india-2026`,
        "datePublished": "2026-05-19T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/mba-internship-market-india-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The MBA Internship Market India 2026: Who Hires, What They Pay, and How Offers Actually Close", "item": `${BASE_URL}/reports/mba-internship-market-india-2026` },
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
              <span>The MBA Internship Market India 2026: Who Hires, What They Pay, and How Offers Actually Close</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The MBA Internship Market India 2026:<br /><em>Who Hires, What They Pay, and How Offers Actually Close</em>" }} />
            <p className="rpt-hero-sub">Job boards show a thin slice of how MBA summer roles fill in India. Firms hire across consulting, banking, FMCG, and tech strategy, often through campus pipelines, referrals, and partner-led screens long before a public form goes live. This report maps where demand clusters in 2026, what INR stipend bands look like for serious programmes, and how to search without mistaking brand noise for your personal funnel.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · MBA summer and lateral internship pathways (consulting, banking, FMCG, tech strategy)</span>
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
              <div className="sc-num">~42%</div>
              <div className="sc-label">Illustrative share of visible MBA summer internship pipeline volume tied to consulting, banking, and FMCG employers in Studojo's 2026 India synthesis</div>
              <div className="sc-source">Studojo sector-weighting synthesis, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">Jan–Apr</div>
              <div className="sc-label">Peak offer window for most structured MBA summer internships aligned with first-year MBA calendars at leading Indian business schools</div>
              <div className="sc-source">Studojo hiring-calendar synthesis, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">2.5x</div>
              <div className="sc-label">Typical lift in interview probability when a candidate leads with one crisp case memo or sector thesis versus a generic resume-only apply</div>
              <div className="sc-source">Studojo MBA intern signal framework, 2026</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#0d9488" }}>1</div>
              <div>
                <div className="sec-title">India's MBA internship market is tiered, not flat</div>
                <div className="sec-sub">Campus brand, prior work, and sector focus shape your funnel more than any single portal</div>
              </div>
            </div>
            <p>MBA summer internships in India in 2026 still cluster around a familiar employer set: management consulting, investment banking and markets, FMCG leadership programmes, tech strategy and corporate development, and selective private equity or venture roles. Volume is concentrated, but the path in is not one ladder.</p>
            <p>Top business schools run formal summer placement processes with slot caps, waitlists, and sector day schedules. Candidates from other programmes compete through lateral processes, alumni referrals, and direct outreach to hiring managers who never posted the role on a public board.</p>
            <p>Geography matters less than sector for many roles. Mumbai anchors banking and several consulting offices. Bangalore and Gurgaon host tech strategy and GCC leadership tracks. FMCG and conglomerate programmes often rotate across manufacturing and sales hubs.</p>

            <div className="chart-wrap">
              <div className="chart-label">Where MBA summer internship hiring activity concentrates in India (illustrative mix, %)</div>
              <div style={{ height: 280 }}>
                <canvas id="indiaMbaInternSectorMixChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> Your competition is not only the IIM-A pipeline. Strong candidates from ISB, XLRI, SPJIMR, and tier-one programmes with prior sector experience routinely clear screens when proof is obvious.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Campus process versus open market</strong> If you are in a formal summer placement cycle, read slot rules, sector caps, and renege policies before optimising for dream firms only. Parallel pipelines still matter for backup offers.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Prior work is currency</strong> Banking and consulting screens weight analytical comfort and structured communication. FMCG weights leadership stories and execution. Tech strategy weights product sense and metrics fluency. Lead with the proof each sector actually buys.</span>
              </div>
            </div>

            <div className="callout"><strong>Reframe:</strong> Search by problem domain and team maturity, not only by firm logo. A mid-market consulting internship with client exposure can teach more than a famous brand where you only build slides no one presents.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#0d9488" }}>2</div>
              <div>
                <div className="sec-title">Who is actually hiring MBA interns in 2026</div>
                <div className="sec-sub">Consulting and banking lead visibility; FMCG and tech strategy grow share among structured cohorts</div>
              </div>
            </div>
            <p>Employers with visible MBA summer budgets in 2026 include global and India-focused consulting firms running case-heavy summer associate tracks, banks and markets businesses hiring summer analysts, and FMCG players with leadership intern programmes tied to brand and supply chain exposure.</p>
            <p>Scaled tech employers hire MBA interns into strategy, corporate development, and product leadership paths. Private equity and venture roles exist but are fewer seats per firm and often expect prior deal or operator experience.</p>
            <p>Some programmes are explicitly general management tracks with rotation. Others title the role "summer intern" but assign narrow workstreams. Read scope, staffing model, and who signs your evaluation, not only the badge on LinkedIn.</p>

            <div className="highlight"><strong>Key insight:</strong> The same employer can run a serious MBA summer programme in one practice and a token internship in another. Practice-level research beats firm-level myth.</div>

            <div className="pull-quote">
              <p>"We filled a third of our MBA summer seats from referrals and alumni intros before the official form went live. The form was hygiene, not discovery."</p>
              <span className="pq-source">Campus recruiting lead, consulting firm (representative synthesis), 2026</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Ask what ships with your name on it</strong> Good programmes can point to a client deliverable, deal memo, brand plan, or strategy recommendation you owned. Vague "support the team" language without milestones is a yellow flag.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Off-cycle and lateral paths exist</strong> Six-month internships, thesis-linked work, and return offers from prior employers or freelance projects still route candidates into banking and consulting outside the main summer window. Watch firm blogs and alumni channels.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#0d9488" }}>3</div>
              <div>
                <div className="sec-title">What they pay in INR, without fairy tales</div>
                <div className="sec-sub">Stipends vary by sector, programme structure, and whether benefits are bundled</div>
              </div>
            </div>
            <p>Monthly stipends for structured MBA summer internships in India in 2026 often sit in a wide band from roughly 80,000 INR to 250,000 INR or more for top consulting and banking programmes, with FMCG and tech strategy cohorts typically in a strong but lower band and startups more variable.</p>
            <p>Some employers bundle housing, travel, or project allowances, which changes your net cash. Two offers with the same headline stipend are not equal if one expects you to self-fund Mumbai rent for ten weeks.</p>
            <p>Boutique firms and growth-stage employers may pay below headline consulting numbers but offer partner proximity and faster reference letters. That can be rational if you are optimising for sector entry and conversion odds, not monthly savings alone.</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>Turn bands into conversations</h4>
                <p>When you know your target stipend band, Studojo Outreach helps you reach the campus recruiter or hiring manager who can confirm real numbers for your cohort, not forum screenshots.</p>
                <Link to="/outreach" className="rpt-cta-mid-btn">Try Studojo Outreach →</Link>
              </div>
            </div>

            <div className="chart-wrap">
              <div className="chart-label">Illustrative monthly INR stipend index for MBA summer internships (midpoint index, 0 to 25 scale)</div>
              <div style={{ height: 340 }}>
                <canvas id="indiaMbaInternStipendBandChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Use bands, not single numbers</strong> The chart above is an index for comparison, not a guarantee. Negotiate from evidence: competing offers, prior sector experience, and shipped artefacts.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Title drift is real</strong> "Strategy intern" at one firm may be mostly market sizing slides. At another it is live deal work or a brand launch. Ask for last year's intern showcase if you can.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>Practical note:</strong> Always clarify gross stipend, tax handling, internship agreement duration, full-time conversion criteria, and whether return offer evaluation is tied to a single project or composite feedback.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#0d9488" }}>4</div>
              <div>
                <div className="sec-title">Calendars, return offers, and why timelines feel chaotic</div>
                <div className="sec-sub">Summer windows dominate, but sector days and rolling lateral hires reward preparation</div>
              </div>
            </div>
            <p>Most high-visibility MBA summer hiring aligns with first-year MBA calendars, with offer spikes between January and April for May and June start dates and a smaller autumn window for six-month or off-cycle programmes.</p>
            <p>Return offers often assume you will join full-time after graduation. Read clauses for role placement guarantees, location lock-in, and what happens if the practice reorganises before you join.</p>
            <p>Macro hiring cycles still shift intern cohort sizes quarter to quarter. A brand that hired thirty MBA summers last year may hire fifteen this year without a press release. Parallel pipelines matter until paperwork is signed.</p>

            <div className="highlight"><strong>Key insight:</strong> Treat deadline clarity as part of your professional brand. Recruiters forward candidates who respond with crisp dates, sector preferences, and conflict-free interview slots.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Build a personal hiring calendar</strong> Track application open dates, case prep rounds, and super-day schedules per target firm so you are not surprised by overlapping final rounds.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Ask conversion mechanics early</strong> Request how return offer decisions are made: manager-only, committee, cross-functional review, and typical notification week.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#0d9488" }}>5</div>
              <div>
                <div className="sec-title">Channels that still move MBA intern shortlists</div>
                <div className="sec-sub">Case prep, referrals, campus processes, and tight cold outreach beat spray-and-pray</div>
              </div>
            </div>
            <p>LinkedIn remains the default discovery layer for India MBA hiring. Profiles that link one flagship case write-up, deal memo, or sector thesis get more serious passes than buzzword summaries.</p>
            <p>Campus placement cells, case competitions, and employer insight sessions still route many structured cohorts. Lateral candidates should treat those same competitions and open challenges as legitimate side doors.</p>
            <p>When you message a partner, VP, or campus recruiter, lead with a specific problem you investigated and one recommendation, not admiration for the brand. Busy managers forward messages that make them look sharp, not long essays.</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>Send the message that gets forwarded</h4>
                <p>Studojo Outreach helps you reach campus recruiters and hiring managers with a tight brief and one flagship link, the pattern Indian MBA teams actually forward.</p>
                <Link to="/outreach" className="rpt-cta-mid-btn">Try Studojo Outreach →</Link>
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Recruiters are routers, not gatekeepers</strong> Give a tight brief: internship window, city flexibility, sector preference, link to one flagship project, and prior roles that prove you can handle ambiguity.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Referrals need scaffolding</strong> Forward a short paragraph your alumni contact can paste into an internal referral form. Make it effortless to vouch for you.</span>
              </div>
            </div>

            <div className="callout-green"><strong>Weekly habit:</strong> One case or sector artefact update, two tailored applications, and one warm intro ask with a paste-ready blurb for your contact. Consistency beats bursts the night before deadlines.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#0d9488" }}>6</div>
              <div>
                <div className="sec-title">Red flags and realism for 2026</div>
                <div className="sec-sub">Vague scope, unpaid trial projects, and return offer promises without paperwork</div>
              </div>
            </div>
            <p>Be cautious of employers who will not put stipend, duration, reporting manager, and evaluation criteria in a written internship agreement. Verbal promises evaporate when budgets tighten.</p>
            <p>Take-home cases that look like full client or deal work for free are a pattern in every market, including India. Push for bounded tasks, or ask whether strong submissions receive interview priority and timeline guarantees.</p>
            <p>If conversion to a return offer is sold aggressively but HR cannot explain the rubric, treat the role as learning-only until something is documented.</p>

            <div className="highlight"><strong>Summary insight:</strong> India rewards MBA intern candidates who combine sector fluency, structured communication, and proof of judgment. Optimism without artefacts burns cycles.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Compare three offer components</strong> Cash today, learning depth, and conversion odds. A higher stipend with no mentorship is not automatically optimal.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Keep a parallel pipeline until paperwork</strong> Reorgs and hiring freezes happen quarterly. A verbal yes is not a stamped internship agreement.</span>
              </div>
            </div>

            <div className="callout-red"><strong>Checklist:</strong> Signed offer or internship letter, stipend and tax clarity, duration and notice if early exit, mentor name, weekly cadence, and what deliverable you will own for your portfolio.</div>
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
              <div className="blist-item" key="Search by practice and shipped scope">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Search by practice and shipped scope.</strong> Map five target teams doing the work you want, not only five famous logos. Read who leads the squad and what MBA summers owned last year.</span>
              </div>
              <div className="blist-item" key="Make dates, cities, and sectors explicit">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Make dates, cities, and sectors explicit.</strong> Put internship window, location flexibility, and sector preference in your summary and first recruiter message. Reduce back-and-forth so you look low-friction.</span>
              </div>
              <div className="blist-item" key="Negotiate on total support">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Negotiate on total support.</strong> Ask how stipend, housing, travel, and return offer evaluation combine. Use bands from this report as anchors, then validate with real offers in your cohort.</span>
              </div>
              <div className="blist-item" key="Run a dual-track search">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Run a dual-track search.</strong> Keep campus and portal alerts, and run referrals plus direct recruiter outreach weekly. Tag outcomes by channel so you know what actually works for your profile in India.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Reach MBA campus recruiters and hiring managers in India, directly.</h3>
              <p>Studojo Outreach finds the people behind real MBA summer pipelines and helps you land in their inbox with a personalised, credible intro. No resume builder rabbit hole.</p>
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
