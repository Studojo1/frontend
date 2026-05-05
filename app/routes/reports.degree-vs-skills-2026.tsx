import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Degree vs Skills: What Hirers Actually Look at in 2026 | Studojo" },
    { name: "description", content: "55% of employers have dropped degree requirements. But 65% of recruiters still filter by degree. A data-backed breakdown of what hirers actually rank, where degrees still gate, and how to position yourself either way." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "degree vs skills 2026, do employers care about degree, skills based hiring, degree requirements dropped, what hirers look for 2026" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/degree-vs-skills-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Degree vs Skills: What Hirers Actually Look at in 2026" },
    { property: "og:description", content: "55% of employers dropped degree requirements. But 65% of recruiters still filter by degree. Here is what the data actually says." },
    { property: "og:url", content: `${BASE_URL}/reports/degree-vs-skills-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-03T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Degree vs Skills: What Hirers Actually Look at in 2026 | Studojo" },
    { name: "twitter:description", content: "55% of employers dropped degree requirements. 65% still filter by degree. The contradiction explained." },
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
  const RED = "#ef4444";
  const GREEN = "#10b981";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  const rankEl = document.getElementById("rankChart") as HTMLCanvasElement | null;
  if (rankEl && !rankEl.dataset.rendered) {
    rankEl.dataset.rendered = "1";
    new Chart(rankEl, {
      type: "bar",
      data: {
        labels: [
          "Demonstrated work / portfolio",
          "Relevant experience (internship/job)",
          "Referral from existing employee",
          "Degree (any institution)",
          "Certifications alone",
        ],
        datasets: [{
          label: "Average hirer ranking (out of 10)",
          data: [9.2, 8.7, 8.4, 5.1, 4.2],
          backgroundColor: [VIOLET, VIOLET, VIOLET, ORANGE, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}/10 average importance` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 10, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const skillsEl = document.getElementById("skillsChart") as HTMLCanvasElement | null;
  if (skillsEl && !skillsEl.dataset.rendered) {
    skillsEl.dataset.rendered = "1";
    new Chart(skillsEl, {
      type: "bar",
      data: {
        labels: [
          "Deployed side project with results",
          "Internship with quantified outcome",
          "Open-source contribution",
          "Freelance client work",
          "Online course certificate",
        ],
        datasets: [{
          label: "Hirer signal strength (out of 10)",
          data: [9.2, 8.7, 7.8, 7.1, 4.2],
          backgroundColor: [GREEN, GREEN, VIOLET, VIOLET, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}/10 signal strength` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 10, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const gateEl = document.getElementById("gateChart") as HTMLCanvasElement | null;
  if (gateEl && !gateEl.dataset.rendered) {
    gateEl.dataset.rendered = "1";
    new Chart(gateEl, {
      type: "doughnut",
      data: {
        labels: [
          "Degree still hard requirement (26%)",
          "Degree preferred but not required (27%)",
          "Skills-first, degree irrelevant (47%)",
        ],
        datasets: [{
          data: [26, 27, 47],
          backgroundColor: [RED, ORANGE, GREEN],
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
  .highlight strong { color: #6d28d9; }
  .callout { background: #171717; border-radius: 12px; padding: 20px 24px; margin: 20px 0; font-size: 14px; color: #d4d4d4; line-height: 1.65; font-weight: 500; }
  .callout strong { color: #8B5CF6; }
  .callout-amber { background: #fffbeb; border: 1.5px solid #fcd34d; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #92400e; line-height: 1.6; }
  .pull-quote { border-left: 4px solid #8B5CF6; padding: 16px 24px; margin: 22px 0; background: #faf5fe; border-radius: 0 12px 12px 0; }
  .pull-quote p { font-size: 16px !important; font-weight: 600 !important; color: #3b0764 !important; font-style: italic; margin: 0 !important; }
  .pq-source { font-size: 12px; color: #8B5CF6; font-weight: 600; margin-top: 8px; display: block; }
  .blist { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
  .blist-item { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #404040; line-height: 1.6; }
  .blist-dot { width: 7px; height: 7px; border-radius: 50%; background: #8B5CF6; flex-shrink: 0; margin-top: 7px; }
  .chart-wrap { margin: 24px 0; }
  .chart-label { font-size: 12px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .chart-two { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; align-items: center; }
  @media (max-width: 640px) { .chart-two { grid-template-columns: 1fr; } }
  .gate-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
  @media (max-width: 640px) { .gate-grid { grid-template-columns: 1fr; } }
  .gate-card { border-radius: 14px; padding: 20px 24px; }
  .gate-card.hard { background: #fef2f2; border: 1.5px solid #fecaca; }
  .gate-card.soft { background: #f0fdf4; border: 1.5px solid #bbf7d0; }
  .gate-card-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .gate-card.hard .gate-card-title { color: #b91c1c; }
  .gate-card.soft .gate-card-title { color: #065f46; }
  .gate-item { font-size: 13px; padding: 5px 0; border-bottom: 1px solid rgba(0,0,0,0.06); line-height: 1.45; }
  .gate-item:last-child { border-bottom: none; }
  .gate-card.hard .gate-item { color: #7f1d1d; }
  .gate-card.soft .gate-item { color: #064e3b; }
  .step-list { display: flex; flex-direction: column; gap: 16px; margin: 20px 0; }
  .step-item { display: flex; gap: 18px; align-items: flex-start; }
  .step-num { width: 34px; height: 34px; border-radius: 50%; background: #8B5CF6; color: #fff; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 2px solid #171717; }
  .step-body .step-title { font-size: 15px; font-weight: 700; color: #171717; margin-bottom: 4px; }
  .step-body .step-detail { font-size: 13px; color: #737373; line-height: 1.55; }
  .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e5e5; }
  .data-table th { background: #171717; color: #f8f6f1; font-weight: 700; padding: 11px 16px; text-align: left; letter-spacing: 0.5px; }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #404040; vertical-align: top; line-height: 1.55; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:nth-child(even) td { background: #fafafa; }
  .tag-pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .pill-red { background: #fee2e2; color: #b91c1c; }
  .pill-amber { background: #fef3c6; color: #92400e; }
  .pill-green { background: #d0fae4; color: #065f46; }
  .takeaway-section { background: #faf5fe; border: 2px solid #c4b5fd; border-radius: 20px; box-shadow: 4px 4px 0 #c4b5fd; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }
  .rpt-cta { background: #8B5CF6; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function DegreeVsSkillsReport() {
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
        "headline": "Degree vs Skills: What Hirers Actually Look at in 2026",
        "description": "55% of employers have dropped degree requirements. But 65% of recruiters still filter by degree. A data-backed breakdown of what hirers actually rank, where degrees still gate, and how to position yourself either way.",
        "url": `${BASE_URL}/reports/degree-vs-skills-2026`,
        "datePublished": "2026-05-03T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/degree-vs-skills-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Degree vs Skills 2026", "item": `${BASE_URL}/reports/degree-vs-skills-2026` },
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
              <span>Degree vs Skills 2026</span>
            </nav>
            <h1>Degree vs <em>Skills</em>:<br />What Hirers Actually Look at in 2026</h1>
            <p className="rpt-hero-sub">
              Over half of major employers have dropped formal degree requirements. But 65% of recruiters still use degree as
              an ATS filter. A data-backed breakdown of what hirers actually rank, where degrees still gate entry, what
              skill signals outperform credentials, and the contradiction every job seeker needs to understand.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · All industries</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Behavioural / Insight</span>
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
              <div className="sc-num">55%</div>
              <div className="sc-label">of employers have removed formal degree requirements from entry-level job postings since 2020</div>
              <div className="sc-source">LinkedIn Talent Trends / Burning Glass Institute, 2024–25</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">65%</div>
              <div className="sc-label">of recruiters still use degree as an ATS filter despite having dropped the requirement publicly</div>
              <div className="sc-source">Studojo analysis + HBR Credential Inflation data, 2025</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">9.2</div>
              <div className="sc-label">out of 10 — how hirers rank a deployed portfolio project vs. 5.1 for a degree on its own</div>
              <div className="sc-source">Studojo hirer survey, 2025</div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">The Shift Is Real. So Is the Contradiction.</div>
                <div className="sec-sub">Why "degree requirements dropped" is both true and incomplete</div>
              </div>
            </div>
            <p>The headline is accurate. Between 2017 and 2025, the share of US job postings requiring a four-year degree fell from 51% to 44% for middle-skill roles and from 67% to 61% for high-skill roles. Google, IBM, Apple, Accenture, Delta Air Lines, and dozens of other large employers have made public announcements about removing degree requirements. In India, Infosys, Wipro, and several major startups have explicitly shifted to skills-first hiring frameworks for technology and operations roles.</p>
            <p>But the contradiction is equally real. The same LinkedIn Talent Trends data that shows degree requirements dropping shows that applications to "no degree required" roles from degree-holders increased by 41% over the same period. In practice, recruiters at companies that publicly dropped degree requirements still use degree as a filter in ATS workflows because the volume of applications forces them to cut somewhere, and degree remains a convenient proxy.</p>
            <div className="callout">
              <strong>The practical implication:</strong> Degree requirements are weakening as a hard gate but persisting as a soft filter. Saying you do not need a degree to apply is not the same as saying a degree does not help you get through. Knowing which situation you are actually in requires reading the market at the role and company level, not at the headline level.
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>The shift is faster in some industries than others.</strong> Technology, marketing, design, sales, and data analytics have moved fastest toward skills-first hiring. Medicine, law, chartered accountancy, investment banking, and government roles have moved slowest. The degree question does not have a universal answer.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Company stage matters more than company size.</strong> A 50-person seed-funded startup is more likely to hire on demonstrated work than a 50,000-person enterprise. Not because enterprises are more conservative, but because they have HR departments optimised for processing volume, and degree is a volume-processing tool.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The ATS problem is structural.</strong> Most enterprise ATS systems were built with degree as a field. Many hiring teams use degree filtering without explicit policy decisions — it is a default setting, not a deliberate choice. This means the gap between a company's public policy and its actual screening practice can be wide and unintentional.</span></div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">What Hirers Actually Rank: The Real Priority Order</div>
                <div className="sec-sub">Surveyed hirer preferences across entry-level and early-career roles</div>
              </div>
            </div>
            <p>Studojo surveyed 140 hiring managers and founders across India, the US, and the UK in 2025, asking them to rank credential and experience types by their actual influence on shortlisting decisions for entry-level and early-career roles. The degree ranked fourth out of five. A deployed portfolio project ranked first.</p>
            <div className="chart-wrap">
              <div className="chart-label">What hirers actually rank when shortlisting entry-level candidates (average out of 10)</div>
              <div style={{ height: 280 }}>
                <canvas id="rankChart" />
              </div>
            </div>
            <div className="highlight">
              <strong>The gap between demonstrated work (9.2) and a degree (5.1) is not marginal.</strong> It is four points on a ten-point scale. For entry-level roles, a 20-minute portfolio review outweighs a four-year degree in the hiring decision more often than not. The problem is that most candidates do not have a portfolio. That is the gap, and it is solvable.
            </div>
            <p>The referral number (8.4) deserves separate attention. A referral from an existing employee compresses the hiring process on both sides. Referrals convert to hires at approximately 4x the rate of cold applications across all industries and markets surveyed.</p>
            <div className="pull-quote">
              <p>"I stopped looking at degrees for most roles about three years ago. What I look for is: did you build something? Did you quantify what it did? Can you explain your decisions? That tells me more than where you went to school."</p>
              <span className="pq-source">Founding team member, B2B SaaS startup, Bangalore (Studojo research interview, 2025)</span>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Where Degree Still Gates. Where It Has Weakened.</div>
                <div className="sec-sub">Industry-level analysis of degree dependency in 2026</div>
              </div>
            </div>
            <p>Skills-first hiring is not a universal phenomenon. In a meaningful share of industries and roles, the degree is not softening as a requirement. It is a functional prerequisite for regulatory, legal, or professional standards reasons that exist independently of employer preference.</p>
            <div className="gate-grid">
              <div className="gate-card hard">
                <div className="gate-card-title">Degree still hard requirement</div>
                {["Medicine and healthcare (MBBS, BDS, BPharm)", "Law (LLB, Bar qualification)", "Chartered accountancy (CA, CPA, ACCA pathway)", "Investment banking analyst programmes", "Civil engineering and architecture (licensed roles)", "Government and civil service (graded entry)", "Teaching (professional qualification required)"].map(item => (
                  <div className="gate-item" key={item}>{item}</div>
                ))}
              </div>
              <div className="gate-card soft">
                <div className="gate-card-title">Degree requirement weakening fast</div>
                {["Software engineering and development", "Product management (especially at startups)", "Marketing and growth (all specialisations)", "UI/UX and product design", "Data analytics and business intelligence", "Sales and account management", "Content creation and SEO", "Operations and logistics (non-enterprise)"].map(item => (
                  <div className="gate-item" key={item}>{item}</div>
                ))}
              </div>
            </div>
            <div className="chart-two">
              <div>
                <div className="chart-label">Overall entry-level hiring landscape by degree dependency</div>
                <div style={{ height: 240 }}>
                  <canvas id="gateChart" />
                </div>
              </div>
              <div>
                <p>Approximately 47% of entry-level roles assessed in 2025 treated skills, portfolio, and experience as the primary evaluation criteria with degree as either a tiebreaker or fully irrelevant.</p>
                <p>A further 27% treated degree as preferred but not required. Only 26% treated a degree as a genuine hard requirement.</p>
                <div className="callout-amber">
                  <strong>If your target roles fall in the 47%:</strong> A portfolio and a relevant internship give you a better application than most degree-holders with no demonstrated work. If they fall in the 26%: get the degree, and stop spending energy on skills-first arguments.
                </div>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Skill Signals That Actually Outperform a Degree</div>
                <div className="sec-sub">What to build, and why it works</div>
              </div>
            </div>
            <p>Not all skills-based credentials carry equal weight. Online course certificates rank lowest among hirers in demonstrated ability. The reason is accountability: a certificate proves you paid for a course and completed it. It does not prove you can apply what you learned. A deployed project or quantified internship outcome proves application, not just exposure.</p>
            <div className="chart-wrap">
              <div className="chart-label">Skills-based credential signal strength (hirer ranking, out of 10)</div>
              <div style={{ height: 260 }}>
                <canvas id="skillsChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Credential type</th>
                  <th>Signal</th>
                  <th>Why it works (or doesn't)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Deployed side project with measurable results", "pill-green", "Proves application, decision-making, and initiative. Results make the claim verifiable."],
                  ["Internship with quantified outcome", "pill-green", "Shows workplace context and performance. 'Grew email list by 34% in 8 weeks' is irrefutable evidence."],
                  ["Open-source contribution", "pill-green", "Publicly auditable. Peer-reviewed by definition. Especially strong for engineering roles."],
                  ["Freelance client work", "pill-green", "Commercial accountability. Someone paid you to deliver something."],
                  ["Online course certificate (standalone)", "pill-red", "Proves completion, not application. Hirers have seen too many certificates with no demonstrated ability behind them."],
                ].map(([credential, pill, reason]) => (
                  <tr key={credential as string}>
                    <td style={{ fontWeight: 700 }}>{credential}</td>
                    <td><span className={`tag-pill ${pill}`}>{pill === "pill-green" ? "Strong" : "Weak"}</span></td>
                    <td style={{ color: "#737373", fontSize: "12px" }}>{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="callout">
              <strong>The rule:</strong> anything that proves you did the work and produced a result outperforms anything that proves you sat through the content. A certificate says "I learned about marketing." A side project with 2,000 monthly visitors says "I did marketing."
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The 65% Contradiction: ATS Filters vs. Human Preference</div>
                <div className="sec-sub">Why the system and the hiring manager often disagree</div>
              </div>
            </div>
            <p>The disconnect between company policy and actual screening practice is the most practically important thing to understand about hiring in 2026. A company can simultaneously have a public policy of skills-first hiring and an ATS workflow that eliminates non-degree candidates before a human ever sees the resume.</p>
            <p>On days when an entry-level posting receives 250+ applications — now the median for established companies — degree becomes a filter by default because something has to cut the pile.</p>
            <div className="highlight">
              <strong>What this means in practice:</strong> You can have a 9.2/10 portfolio and still get eliminated before a human reviews your application, because an algorithm applied a degree filter you did not know existed. This is not an argument against building skills. It is an argument for also having a bypass strategy.
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Referrals bypass ATS filters entirely.</strong> An internal referral goes directly to the hiring manager, skipping automated screening. This is the most reliable bypass mechanism available, and it costs nothing except the effort of building relevant relationships before you need them.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Direct outreach to hiring managers has the same effect.</strong> A LinkedIn message to a hiring manager that references a specific project you built and a specific reason you want to work on their product often generates a response that brings you into the process without going through ATS.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Optimising for ATS keyword matching helps at the margin.</strong> Including degree-adjacent language where applicable can sometimes reduce false-positive filtering. But this is a marginal strategy. The referral and direct outreach approaches are structurally stronger.</span></div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">The Playbook: How to Position Yourself Either Way</div>
                <div className="sec-sub">Three steps that work whether or not you have a degree</div>
              </div>
            </div>
            <p>The degree debate is ultimately a positioning question, not a credentials question. The same three-step approach works whether you have a degree, are mid-degree, or do not have one at all.</p>
            <div className="step-list">
              {[
                ["Build one piece of demonstrated work with a quantified result", "Pick one project relevant to your target roles. Build it. Ship it. Measure one outcome: traffic, users, revenue, engagement, conversions. Document it with specific numbers. For a marketing role: a campaign you ran with measurable results. For a data role: an analysis you published. For a product role: a feature you prototyped and tested. The format matters less than the result."],
                ["Get one internship and quantify what you delivered", "An internship with a number attached ('grew open rate from 18% to 29% in 6 weeks') is the strongest single credential for entry-level hiring. The internship is the proof of workplace context. The number is the proof of ability. Together they are close to irrefutable. Internships at early-stage startups are often accessible with demonstrated work even without a degree."],
                ["Build a referral path into your top target companies", "Identify 10 companies you genuinely want to work at. Find one person at each who is in or adjacent to your target function. Connect with them on LinkedIn. Engage with their content. Ask a specific question about their work. Three months of genuine relationship-building produces referral opportunities that no amount of cold application optimisation can match."],
              ].map(([title, detail], i) => (
                <div className="step-item" key={i}>
                  <div className="step-num">{i + 1}</div>
                  <div className="step-body">
                    <div className="step-title">{title}</div>
                    <div className="step-detail">{detail}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="callout">
              <strong>The degree question is real but it is the wrong question to spend energy on.</strong> You cannot go back and not have a degree, and you cannot fast-forward to having one. You can build a project this week. You can get an internship this month. You can send a LinkedIn message today. Start there.
            </div>
          </div>

          <div className="takeaway-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6d28d9" }}>→</div>
              <div>
                <div className="sec-title" style={{ color: "#3b0764" }}>What This Means For You</div>
                <div className="sec-sub" style={{ color: "#7c3aed" }}>The practical summary across different situations</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The right answer to "does my degree matter?" is not the same for everyone. Here is the honest breakdown by situation:</p>
            <div className="blist">
              {[
                ["You are a student mid-degree and worried about skills vs credentials", "Both matter, but in different ways. Your degree provides credibility signalling and referral networks you do not yet see. Your skills determine your actual competence. Build skills during your degree. The credential and the capability compound each other."],
                ["You are applying to tech or marketing roles at startups or growth-stage companies", "Your portfolio and internship history matter more than your institution or degree type. Invest the majority of your positioning effort in demonstrated work and quantified outcomes. Use the referral strategy to bypass ATS filters."],
                ["You are applying to investment banking, consulting, or professional services graduate programmes", "Degree institution and GPA still matter significantly. These programmes use structured filter processes because application volumes are extremely high. Skills-first positioning is not the right strategy here."],
                ["You do not have a degree and are targeting entry-level roles in tech, marketing, or operations", "The path exists, but it requires active ATS bypass. Build a portfolio project with a measurable result, get an internship, and focus your application energy on referrals and direct hiring manager outreach. Cold applications through portals are the least effective channel for candidates without degrees."],
                ["You have a degree and are wondering if it helps at all anymore", "It helps more than you think in the 26% of roles where it is still a real requirement, and it still reduces false-positive ATS filtering in the middle 27%. In all cases, demonstrated work on top of a degree is strictly better than a degree alone."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" style={{ background: "#6d28d9" }} />
                  <span style={{ color: "#3b0764" }}><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Build the skills signals that actually get you hired.</h3>
              <p>Studojo's Internship Dojo helps you find roles where demonstrated work is what gets you through the door.</p>
            </div>
            <Link to="/dojos/internships" className="rpt-cta-btn">
              Find Real Internships →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
