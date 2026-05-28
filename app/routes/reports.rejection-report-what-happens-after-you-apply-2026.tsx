import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Rejection Report: What Happens After You Apply | Studojo" },
    { name: "description", content: "What really happens after you apply: ATS screening, silence vs rejection emails, ghost jobs, and response timelines. Data from CareerPlug, Greenhouse, and response-time research." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "job application rejection, application ghosting statistics, what happens after you apply, ATS rejection rate, no response after applying, job search silence 2026" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/rejection-report-what-happens-after-you-apply-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Rejection Report: What Happens After You Apply" },
    { property: "og:description", content: "Most applications never get a human reply. This report maps the post-apply funnel: ATS, silence, ghost jobs, and when to move on." },
    { property: "og:url", content: `${BASE_URL}/reports/rejection-report-what-happens-after-you-apply-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-20T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Rejection Report: What Happens After You Apply | Studojo" },
    { name: "twitter:description", content: "After you apply: ~2% get interviews, most hear nothing. The data on silence, rejections, and ghost jobs." },
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

  const postApplyFunnelChartEl = document.getElementById("postApplyFunnelChart") as HTMLCanvasElement | null;
  if (postApplyFunnelChartEl && !postApplyFunnelChartEl.dataset.rendered) {
    postApplyFunnelChartEl.dataset.rendered = "1";
    new Chart(postApplyFunnelChartEl, {
      type: "bar",
      data: {
        labels: ["Receive any human contact", "Invited to interview", "Interview leads to offer", "Hired (end-to-end from one apply)"],
        datasets: [{
          label: "Typical cold-apply funnel (CareerPlug all-industry averages, illustrative % of applicants)",
          data: [8.0, 2.0, 0.7, 0.25],
          backgroundColor: ["#737373", "#f59e0b", "#8B5CF6", "#10b981"],
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
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 10.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const outcomeMixChartEl = document.getElementById("outcomeMixChart") as HTMLCanvasElement | null;
  if (outcomeMixChartEl && !outcomeMixChartEl.dataset.rendered) {
    outcomeMixChartEl.dataset.rendered = "1";
    new Chart(outcomeMixChartEl, {
      type: "doughnut",
      data: {
        labels: ["Silence (no status change)", "Automated rejection", "Human rejection email", "Interview invite", "Role closed / filled"],
        datasets: [{
          data: [58.0, 22.0, 6.0, 2.0, 12.0],
          backgroundColor: ["#737373", "#fca5a5", "#ef4444", "#10b981", "#f59e0b"],
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

  const responseTimeChartEl = document.getElementById("responseTimeChart") as HTMLCanvasElement | null;
  if (responseTimeChartEl && !responseTimeChartEl.dataset.rendered) {
    responseTimeChartEl.dataset.rendered = "1";
    new Chart(responseTimeChartEl, {
      type: "bar",
      data: {
        labels: ["By day 4 to 5", "By day 6 to 7 (median band)", "By day 8", "After day 14 (slow tail)", "No response within 45 days"],
        datasets: [{
          label: "When employers respond at all (Careery 2025, % of responses arriving by day)",
          data: [25.0, 50.0, 75.0, 12.0, 55.0],
          backgroundColor: ["#10b981", "#f59e0b", "#8B5CF6", "#ef4444", "#737373"],
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
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 80.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const interviewStageChartEl = document.getElementById("interviewStageChart") as HTMLCanvasElement | null;
  if (interviewStageChartEl && !interviewStageChartEl.dataset.rendered) {
    interviewStageChartEl.dataset.rendered = "1";
    new Chart(interviewStageChartEl, {
      type: "bar",
      data: {
        labels: ["Interviews that become hires", "Interviews that end in rejection or ghosting"],
        datasets: [{
          label: "Interview stage conversion (CareerPlug: once you are in the room)",
          data: [36.0, 64.0],
          backgroundColor: ["#10b981", "#ef4444"],
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
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 100.0,
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

export default function Report_RejectionReportWhatHappensAfterYouApply2026() {
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
        "headline": "The Rejection Report: What Happens After You Apply",
        "description": "What really happens after you apply: ATS screening, silence vs rejection emails, ghost jobs, and response timelines. Data from CareerPlug, Greenhouse, and response-time research.",
        "url": `${BASE_URL}/reports/rejection-report-what-happens-after-you-apply-2026`,
        "datePublished": "2026-05-20T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/rejection-report-what-happens-after-you-apply-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Rejection Report: What Happens After You Apply", "item": `${BASE_URL}/reports/rejection-report-what-happens-after-you-apply-2026` },
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
              <span>The Rejection Report: What Happens After You Apply</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Rejection Report:<br /><em>What Happens After You Apply</em>" }} />
            <p className="rpt-hero-sub">The hiring funnel is designed to filter out almost everyone who applies cold. Most outcomes are silence, not a thoughtful no. We mapped post-submit timelines, ATS behaviour, and candidate-reported ghosting from CareerPlug funnel data, Greenhouse job-hunting research, and application response benchmarks so you can interpret what happened and what to do next.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Students, interns, and early-career through mid-level hiring</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Recruiting / Data</span>
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
              <div className="sc-num">~2%</div>
              <div className="sc-label">Average share of applicants invited to interview after applying (all industries, SMB aggregate)</div>
              <div className="sc-source">CareerPlug 2024 Recruiting Metrics Report</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~61%</div>
              <div className="sc-label">Candidates who reported being ghosted by an employer after an interview (up from earlier 2024 baselines)</div>
              <div className="sc-source">Greenhouse 2024 State of Job Hunting</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~6 to 7 days</div>
              <div className="sc-label">Median time to first employer response when a reply actually happens (2025 application dataset)</div>
              <div className="sc-source">Careery Job Application Response Time Benchmarks, 2025</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>1</div>
              <div>
                <div className="sec-title">The default outcome is silence, not a rejection letter</div>
                <div className="sec-sub">Why most applications end in a status that never updates</div>
              </div>
            </div>
            <p>Candidates imagine a binary path: interview or rejection. Employer systems optimise for a third state: no action. Recruiters triage hundreds of inbound applications per role; ATS queues auto-archive low-match profiles; and many teams only send rejections after a finalist accepts an offer, if ever.</p>
            <p>Greenhouse's 2024 State of Job Hunting found a majority of candidates reporting employer ghosting, with post-interview ghosting especially common. That is a different pain than pre-screen silence, but the same root cause: bandwidth. Silence is often operational default, not a verdict on your worth.</p>

            <div className="highlight"><strong>Key insight:</strong> Silence usually means you were never prioritized, not that a hiring manager debated your file and said no.</div>

            <div className="chart-wrap">
              <div className="chart-label">What candidates experience after applying (synthesised candidate-reported themes, illustrative %)</div>
              <div style={{ height: 260 }}>
                <canvas id="outcomeMixChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Automated rejections are the honest minority.</strong> When you do get an instant "we've decided to move forward with other candidates," that is often an ATS rule firing on location, visa, or keyword mismatch. It is impersonal but at least terminal.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>"Still under review" can mean frozen req.</strong> Hiring freezes, headcount swaps, and internal candidates promoted late all leave external applicants in limbo. The status string is not a live feed of manager sentiment.</span>
              </div>
            </div>

            <div className="callout"><strong>Reframe:</strong> If you received no reply in 21 days on a cold apply, treat it as a closed loop for your pipeline spreadsheet. Do not wait for closure from the company to move your energy elsewhere.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>2</div>
              <div>
                <div className="sec-title">Funnel math: where almost everyone drops out</div>
                <div className="sec-sub">From submit to interview invite in employer aggregate data</div>
              </div>
            </div>
            <p>CareerPlug's analysis of more than 10 million applications (60,000+ small businesses, 2023 to 2024 data) reports employers invite about 2% of applicants to interview, then convert roughly 36% of interviews into hires. The bottleneck is almost always the first gate: getting a human to schedule time.</p>
            <p>That implies on the order of 50+ applications per hire at the employer level across industries, with wide variance. For you as an individual, the combinatorics are harsher: you compete on each posting, not across an employer's whole year. One tailored apply is still a low single-digit chance without a warm path.</p>

            <div className="chart-wrap">
              <div className="chart-label">Typical cold-apply funnel (CareerPlug all-industry averages, illustrative % of applicants)</div>
              <div style={{ height: 280 }}>
                <canvas id="postApplyFunnelChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> Interview rate is the metric that explains emotional whiplash. Offer rate only matters after you clear the first gate.</div>

            <div className="pull-quote">
              <p>"We had four hundred applies in a week. Maybe eight got a phone screen. Most never hit my inbox."</p>
              <span className="pq-source">Recruiter, growth-stage startup (Studojo community interview, 2025)</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Interview-to-hire is healthier than apply-to-interview.</strong> Once you are in process, odds improve materially. Prep and proof matter more in that slice than resume keyword games at the top.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Volume without tailoring scales silence.</strong> Fifty identical applies mostly produce fifty non-events. The funnel data punishes noise at the ATS layer before a recruiter sees you.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>3</div>
              <div>
                <div className="sec-title">The first 72 hours inside the ATS</div>
                <div className="sec-sub">Parsing, knockouts, and the ranking you never see</div>
              </div>
            </div>
            <p>When you submit, the ATS extracts fields from your PDF (sometimes badly), matches required keywords and location, applies knockout questions (work authorization, graduation year, salary band), and ranks you against applicants who applied earlier with referrals or internal tags.</p>
            <p>Referral and internal sources often bypass or boost ranking in the same req. Ashby and Gem benchmarks show referred applicants advancing to interview at much higher rates than inbound cold traffic. Your application can be "received" while never entering the shortlist a recruiter scrolls.</p>

            <div className="highlight"><strong>Key insight:</strong> "Application received" is a receipt, not a score. It confirms storage, not consideration.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Knockouts are silent killers.</strong> Wrong work authorization answer or salary expectation outside band ends the run before a human opens the file. Read every screener question as a filter, not paperwork.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Duplicate applies can merge or clutter.</strong> Applying twice through a board and the careers page can create two records or flag you as noisy. Pick one primary path per role.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>ATS hygiene checklist:</strong> PDF with selectable text (not scanned image), standard section headers, exact job title keywords in context (not a keyword footer), knockout answers honest and consistent with LinkedIn, file name like FirstLast_Role_Company.pdf.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>4</div>
              <div>
                <div className="sec-title">Response timelines: when silence means move on</div>
                <div className="sec-sub">Median replies, slow months, and the 45-day ghost line</div>
              </div>
            </div>
            <p>Careery's 2025 response-time research on real application outcomes found a median first response around six to seven days when employers reply at all, with roughly a quarter hearing back within four to five days and most responses within about eight days. October tended slower; late spring somewhat faster in their dataset.</p>
            <p>Practical rule used by many recruiters: if nothing in two to three weeks on a cold apply, the req is not active for you. Careery and candidate-advocacy sources often treat 45 days without contact as functionally ghosted. Waiting six weeks for dignity closure burns calendar time you could spend on warm paths.</p>

            <div className="highlight"><strong>Key insight:</strong> Calendar rules protect your psychology. Companies that want you will move inside two weeks for most corporate roles, often faster for intern cycles.</div>

            <div className="chart-wrap">
              <div className="chart-label">When employers respond at all (Careery 2025, % of responses arriving by day)</div>
              <div style={{ height: 260 }}>
                <canvas id="responseTimeChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Follow-up once, with new information.</strong> A single note that adds a link, metric, or availability change is fair. Three "just checking in" pings rarely restart a dead req.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Speed after interview is different.</strong> If you finished a final round and hear nothing for 10+ business days, escalate politely to your recruiter contact. Post-interview silence is where Greenhouse data shows the worst candidate experience.</span>
              </div>
            </div>

            <div className="callout-green"><strong>Pipeline columns that work:</strong> Applied → Acknowledged (auto) → Human touch → Interview → Offer → Closed (hired/rejected) → Archive (silence 21d). Drag rows to Archive without guilt.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>5</div>
              <div>
                <div className="sec-title">Typed rejections: what they actually signal</div>
                <div className="sec-sub">Template nos, feedback rarity, and when a rejection is good news</div>
              </div>
            </div>
            <p>Automated rejections within 24 to 48 hours usually mean hard mismatch: location, authorization, level, or missing required skill flag. A rejection after a phone screen often means you were genuinely considered and lost to fit or slate size. A rejection months later frequently means the req closed and the ATS cleared the queue.</p>
            <p>Personalised feedback is rare in the United States and many global markets due to legal risk and time cost. Do not treat absence of feedback as hidden praise. Treat a fast no as efficient filtering that freed your attention.</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>Skip the queue that ends in silence</h4>
                <p>Studojo Outreach helps you reach hiring managers before you are one of two hundred identical PDFs in an ATS bucket.</p>
                <Link to="/outreach" className="rpt-cta-mid-btn">Try Studojo Outreach →</Link>
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> A rejection email after a real conversation is progress. You entered the shortlist. Silence from the same company on your next apply means different role or path.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Do not argue the rejection.</strong> Replying with a manifesto rarely reverses decisions and can burn bridges with recruiters who cover multiple reqs.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Track rejection stage.</strong> ATS screen vs phone screen vs onsite tells you which skill layer failed. Adjust proof for the next similar role accordingly.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>Reply template (optional, after human rejection):</strong> "Thanks for letting me know. If a similar role opens on [team], I'd welcome staying in touch. I'll keep following [company/product]." One sentence. No essay.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>6</div>
              <div>
                <div className="sec-title">Ghost jobs and postings that were never your pipeline</div>
                <div className="sec-sub">Roles that collect CVs without a live hire intent</div>
              </div>
            </div>
            <p>Greenhouse's 2024 research highlighted candidate suspicion of "ghost jobs": listings that stay open, collect applications, but lack an active hire behind them. Surveys in that cycle found a large share of candidates believing they had encountered such postings; independent analyses of major boards have estimated high teens to low twenties percent of listings as stale or low-intent in some samples.</p>
            <p>Signals: posting open 60+ days with hundreds of applicants, reposted identical copy, or company layoffs in the news while the req stays live. You cannot fix ghost jobs. You can deprioritize them in your weekly apply budget and favour reqs with recent repost dates, hiring manager posts, or referral confirmation.</p>

            <div className="highlight"><strong>Key insight:</strong> A ghost job wastes your time, not your talent. Detect early and archive.</div>

            <div className="pull-quote">
              <p>"We left the posting up because HR policy requires it even after we made an offer. External applicants had no way to know."</p>
              <span className="pq-source">Hiring manager, enterprise software (Studojo community, 2025)</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Evergreen postings are marketing.</strong> Some firms keep generic intern or engineer reqs open for talent pools. Treat them as low priority unless you have a warm confirm.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Budget cycles matter.</strong> Q4 freezes and January reopens create zombie listings. Timing explains silence that feels personal in November.</span>
              </div>
            </div>

            <div className="callout-red"><strong>Quick ghost-job checks:</strong> Search LinkedIn for employees with the title who started recently; ask alumni "is this team actually hiring?"; see if the same req ID reposted monthly.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>7</div>
              <div>
                <div className="sec-title">After the interview: a different rejection category</div>
                <div className="sec-sub">Post-interview ghosting, debrief delays, and competing offers</div>
              </div>
            </div>
            <p>Once you interview, the employer has invested calendar time. Silence here hurts more because the implied social contract is stronger. Greenhouse reported a majority of candidates experiencing ghosting after interviews, with higher reported rates among some underrepresented groups in their sample.</p>
            <p>Behind the scenes, debriefs slip when the hiring manager travels, another candidate negotiates, or finance rescopes headcount. None of that helps you wait. After a final round, one polite check-in to your recruiter at day 7 to 10 business days, with continued activity on other processes, is standard professional practice.</p>

            <div className="chart-wrap">
              <div className="chart-label">Interview stage conversion (CareerPlug: once you are in the room)</div>
              <div style={{ height: 220 }}>
                <canvas id="interviewStageChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> Post-interview silence is a process failure, not a secret no until proven otherwise. Still, behave as if you need other offers moving.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Continue interviewing until signed.</strong> Verbal yeses are not hires. Momentum on parallel processes protects you from debrief ghosting.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Ask for timeline in the room.</strong> "What are next steps and typical decision timing?" gives you permission to follow up and sets recruiter accountability.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>8</div>
              <div>
                <div className="sec-title">Running your search when rejection is the baseline</div>
                <div className="sec-sub">Metrics, mental model, and channels that change the post-apply story</div>
              </div>
            </div>
            <p>Replace "applications sent" with leading indicators: human replies, screens scheduled, and second conversations. CareerPlug's channel data (and Studojo's referral report) both show warm paths and careers-page applies convert at multiples of board spray-and-pray. Silence after cold apply is the expected output; your job is to increase the share of applies that are not cold.</p>
            <p>Batch emotional processing: weekly review of archived silences, not daily inbox refreshing. Celebrate rejections that reached interview stage as pipeline progress. Cap untailored applies so silence does not dominate your self-image.</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>Fewer applies, more conversations</h4>
                <p>Studojo Outreach targets the humans who can move you from silence to a scheduled call, instead of another auto-received receipt.</p>
                <Link to="/outreach" className="rpt-cta-mid-btn">Try Studojo Outreach →</Link>
              </div>
            </div>

            <div className="highlight"><strong>Summary insight:</strong> The system is noisy by design. Your strategy is to shorten the silence-heavy paths and lengthen the conversation-heavy ones.</div>

            <div className="pull-quote">
              <p>"I built a spreadsheet of silences vs screens. Once I saw the ratio, I stopped taking ghosting personally and started fixing channels."</p>
              <span className="pq-source">Early-career candidate, consulting track (Studojo community, 2025)</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Silence is not feedback.</strong> Without a screen, you lack data on your interview performance. Change channel or proof, not your core worth narrative.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Offer timing is survivor bias.</strong> Peers who post offer celebrations rarely post the 47 silences before. Compare processes, not highlight reels.</span>
              </div>
            </div>

            <div className="callout"><strong>30-day reset:</strong> Week 1: fix proof and ATS hygiene. Week 2: ten warm touches, max five tailored applies. Week 3: measure interview rate, not apply count. Week 4: double down on the channel that produced any human reply.</div>
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
              <div className="blist-item" key="Treat 21-day silence as closed">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Treat 21-day silence as closed.</strong> Archive cold applies with no human touch after three weeks. Redirect energy to warm intros and tailored careers-page applications.</span>
              </div>
              <div className="blist-item" key="Track interview rate, not apply count">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Track interview rate, not apply count.</strong> CareerPlug-scale data shows ~2% interview invites from applicants. Your personal leading metric is screens per ten serious attempts.</span>
              </div>
              <div className="blist-item" key="Fix ATS hygiene before scaling volume">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Fix ATS hygiene before scaling volume.</strong> Searchable PDF, honest knockouts, consistent LinkedIn, no keyword stuffing. Many rejections are mechanical filters, not judgment.</span>
              </div>
              <div className="blist-item" key="Run parallel processes until offer signed">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Run parallel processes until offer signed.</strong> Post-interview ghosting is common in candidate surveys. Never pause other pipelines because one final round felt warm.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Stop waiting on silence. Start conversations.</h3>
              <p>Studojo Outreach helps you reach hiring managers and recruiters behind real reqs so your next step is a reply, not a black hole.</p>
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
