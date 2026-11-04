import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Big 4 Report: How Freshers Get Into Deloitte, EY, KPMG and PwC (2026) | Studojo" },
    { name: "description", content: "Who Deloitte, EY, KPMG and PwC hire as freshers in India, what they pay by role (self-reported ranges, flagged where they conflict), the selection rounds, and why reaching the team manager matters." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "deloitte hiring freshers, ey internship india, kpmg fresher salary, pwc off campus drive, big 4 salary india freshers, how to get into big 4 after bcom, big 4 india fresher, deloitte usi, ey gds fresher, kpmg global services, pwc acceleration center, ca fresher salary big 4" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/big-4-fresher-internship-report-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Big 4 Report: How Freshers Get Into Deloitte, EY, KPMG and PwC (2026)" },
    { property: "og:description", content: "The four doors into the Big 4 in India, what freshers are paid by role, how the selection rounds work, and why the team manager matters more than the portal." },
    { property: "og:url", content: `${BASE_URL}/reports/big-4-fresher-internship-report-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-05T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Big 4 Report: How Freshers Get In (2026) | Studojo" },
    { name: "twitter:description", content: "Deloitte, EY, KPMG and PwC for Indian freshers: the four doors in, pay by role, the selection rounds, and who actually decides." },
    { name: "twitter:image", content: `${BASE_URL}/og-reports.png` },
    { name: "twitter:site", content: "" },
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
  const VIOLET2 = "#a78bfa";
  const VIOLET3 = "#c4b5fd";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: self-reported fresher pay ranges by firm and title (AmbitionBox, pages updated 2025)
  const payEl = document.getElementById("b4rPayChart") as HTMLCanvasElement | null;
  if (payEl && !payEl.dataset.rendered) {
    payEl.dataset.rendered = "1";
    new Chart(payEl, {
      type: "bar",
      data: {
        labels: [
          "KPMG Global Services, Analyst",
          "Deloitte, Associate Analyst",
          "EY GDS, Associate Analyst",
          "PwC India, Associate Trainee",
          "Deloitte, Analyst",
          "KPMG India, Associate Consultant",
        ],
        datasets: [{
          label: "Fresher range, lakh per year",
          data: [[1.7, 7.3], [2.5, 5.4], [5, 7.2], [6, 7.5], [3.3, 12], [3.6, 15]],
          backgroundColor: [VIOLET3, VIOLET3, VIOLET2, VIOLET2, VIOLET, VIOLET],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw[0]} to ${ctx.raw[1]} lakh a year (self-reported)` } },
        },
        scales: {
          x: { min: 0, max: 16, grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}L` } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: Deloitte Campus Workforce Trends 2025, year-on-year change in FY25 (Deloitte India press release, June 2025)
  const trendEl = document.getElementById("b4rCampusChart") as HTMLCanvasElement | null;
  if (trendEl && !trendEl.dataset.rendered) {
    trendEl.dataset.rendered = "1";
    new Chart(trendEl, {
      type: "bar",
      data: {
        labels: ["PPO conversions", "Campus hiring budgets", "Campus salaries (all)", "MBA salaries"],
        datasets: [{
          label: "Change in FY25, %",
          data: [24, 15, 3.91, 1.6],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` up ${ctx.raw}% in FY25` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}%` } },
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

  .keyfindings { background: #faf5fe; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #8B5CF6; padding: 32px 40px; }
  @media (max-width: 640px) { .keyfindings { padding: 24px 20px; } }
  .keyfindings h2 { font-size: 13px; font-weight: 700; color: #6d28d9; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 18px; }
  .kf-list { display: flex; flex-direction: column; gap: 12px; }
  .kf-item { display: flex; align-items: flex-start; gap: 12px; font-size: 15px; color: #3b0764; line-height: 1.6; font-weight: 500; }
  .kf-check { width: 20px; height: 20px; border-radius: 6px; background: #8B5CF6; color: #fff; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .kf-item strong { color: #6d28d9; }

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
  .pull-quote { border-left: 4px solid #8B5CF6; padding: 16px 24px; margin: 22px 0; background: #faf5fe; border-radius: 0 12px 12px 0; }
  .pull-quote p { font-size: 16px !important; font-weight: 600 !important; color: #3b0764 !important; font-style: italic; margin: 0 !important; }
  .pq-source { font-size: 12px; color: #8B5CF6; font-weight: 600; margin-top: 8px; display: block; }

  .blist { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
  .blist-item { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #404040; line-height: 1.6; }
  .blist-dot { width: 7px; height: 7px; border-radius: 50%; background: #8B5CF6; flex-shrink: 0; margin-top: 7px; }

  .chart-wrap { margin: 24px 0; }
  .chart-label { font-size: 12px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }

  .divider { height: 2px; background: #f0f0f0; margin: 24px 0; border-radius: 2px; }

  .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e5e5; }
  .data-table th { background: #171717; color: #f8f6f1; font-weight: 700; padding: 11px 16px; text-align: left; letter-spacing: 0.5px; }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #404040; vertical-align: top; line-height: 1.55; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:nth-child(even) td { background: #fafafa; }
  .tag-pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .pill-amber { background: #fef3c6; color: #92400e; }
  .pill-green { background: #d0fae4; color: #065f46; }

  .faq-section { background: #fff; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #171717; padding: 40px 48px; }
  @media (max-width: 640px) { .faq-section { padding: 28px 20px; } }
  .faq-item { border-bottom: 1px solid #f0f0f0; padding: 18px 0; }
  .faq-item:first-of-type { padding-top: 0; }
  .faq-item:last-child { border-bottom: none; padding-bottom: 0; }
  .faq-q { font-size: 16px; font-weight: 700; color: #171717; line-height: 1.4; margin-bottom: 8px; }
  .faq-a { font-size: 14px; color: #404040; line-height: 1.7; }
  .faq-a strong { color: #6d28d9; }

  .related { background: #fff; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #171717; padding: 32px 40px; }
  @media (max-width: 640px) { .related { padding: 24px 20px; } }
  .related h2 { font-size: 13px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
  .related-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  @media (max-width: 640px) { .related-grid { grid-template-columns: 1fr; } }
  .related-card { display: block; border: 1.5px solid #e5e5e5; border-radius: 12px; padding: 16px 18px; text-decoration: none; transition: border-color .15s; }
  .related-card:hover { border-color: #8B5CF6; }
  .related-card .rc-kicker { font-size: 10px; font-weight: 700; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .related-card .rc-title { font-size: 14px; font-weight: 600; color: #171717; line-height: 1.4; }

  .takeaway-section { background: #faf5fe; border: 2px solid #c4b5fd; border-radius: 20px; box-shadow: 4px 4px 0 #c4b5fd; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }

  .rpt-cta { background: #8B5CF6; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

const FAQ = [
  {
    q: "What is the salary of a fresher in Big 4 companies in India?",
    a: "It depends far more on the role than on the firm. Self-reported AmbitionBox figures put most analyst-track fresher roles at the Big 4 delivery centres between about 2.5 and 7.5 lakh a year (for example 5 to 7.2 lakh for an EY GDS Associate Analyst, 2.5 to 5.4 lakh for a Deloitte Associate Analyst). Newly qualified CAs sit higher: ICAI says the average starting salary for new CAs is 12 to 13 lakh a year (ICAI letter, April 2026), and Big 4 offers usually sit near that band. Treat every figure as indicative, because ranges on AmbitionBox pages for the same title often disagree.",
  },
  {
    q: "Can a BCom graduate get a job in Big 4?",
    a: "Yes. BCom graduates are hired mainly into audit support, tax and finance operations roles, most often at the delivery centres (Deloitte USI, EY GDS, KPMG Global Services and KDN, PwC Acceleration Centers), with titles like Associate Analyst or Associate. Pay at that entry point is modest, roughly 2.5 to 7 lakh a year on self-reported AmbitionBox data. Many BCom students also enter through CA articleship at a Big 4 firm, then move up after qualifying, when the ICAI average starting salary is 12 to 13 lakh (ICAI, April 2026).",
  },
  {
    q: "Does Deloitte hire freshers off campus?",
    a: "Yes, through its careers portal, job boards and referrals, but public fresher postings are a thin slice of its hiring. A December 2024 count by CareerIndia found only 14 full-time roles and 9 internships listed for Deloitte on the day, against 461 for EY and 471 for KPMG, even though Deloitte's India team was already over 1.2 lakh people (Business Today, December 2023). Much of its entry intake comes from campus drives and internal referrals, so a referral or a note to the right team lead matters more off campus.",
  },
  {
    q: "What is the selection process for Big 4 freshers?",
    a: "Usually an online aptitude test (quant, logical reasoning, verbal English), then one or two interviews mixing technical and HR questions. Some delivery-centre drives add a spoken English test such as Versant, and recent guides say the group discussion or JAM round has been dropped in many drives (FACE Prep; Weekday). Consulting and MBA roles add a case or guesstimate round, and CA hires typically face a technical interview on accounting, audit and tax. Your college's drive notice is the most reliable guide for your batch.",
  },
  {
    q: "When do Big 4 firms hire freshers in India?",
    a: "Campus hiring for graduates mostly runs from September to December, ahead of joining the next summer. Newly qualified CAs are hired through ICAI's own campus placement programmes, which run after each CA result: recent cycles ran in August to September 2025, December 2025 to January 2026 and April to May 2026 (ICAI and Careers360). Off-campus and delivery-centre roles are posted year round, so you do not have to wait for a season.",
  },
  {
    q: "Is it hard to get into Big 4 as a fresher?",
    a: "The entry bar is not the hard part; being seen is. The Big 4 hire in large numbers, with PwC India alone planning 20,000 new jobs by 2030 (Business Standard, August 2025), but intake is split across many teams, each with its own manager and need. Referred candidates convert far better: Ashby data cited in our referrals report found 40% of referred candidates reached interview against 3% of inbound applicants. Reaching the specific team, not just the portal, is what moves the odds.",
  },
];

export default function Big4FresherReport() {
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
        "headline": "The Big 4 Report: How Freshers Get Into Deloitte, EY, KPMG and PwC (2026)",
        "description": "Who Deloitte, EY, KPMG and PwC hire as freshers in India, what they pay by role, the selection rounds, and why reaching the team manager matters.",
        "url": `${BASE_URL}/reports/big-4-fresher-internship-report-2026`,
        "datePublished": "2026-11-05T00:00:00Z",
        "dateModified": "2026-11-05T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/big-4-fresher-internship-report-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Big 4 Report: How Freshers Get In (2026)", "item": `${BASE_URL}/reports/big-4-fresher-internship-report-2026` },
        ],
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        {/* Hero */}
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · November 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>The Big 4 Report, 2026</span>
            </nav>
            <h1>The Big 4 Report: How Freshers Get Into <em>Deloitte, EY, KPMG and PwC</em> (2026)</h1>
            <p className="rpt-hero-sub">
              The Big 4 are among the largest employers of Indian graduates, but "the Big 4" is not one
              job. It is four doors, each with different pay, different tests and a different person who
              decides. Here is what each door looks like, with the numbers and where they come from.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Freshers, interns, new CAs</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Firms</span>
                <span className="rpt-meta-value">Deloitte · EY · KPMG · PwC</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Data</span>
                <span className="rpt-meta-value">ICAI, Deloitte, news, AmbitionBox</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Prepared by</span>
                <span className="rpt-meta-value">Studojo Research</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rpt-body">
          {/* Key findings answer box */}
          <div className="keyfindings">
            <h2>Key findings</h2>
            <div className="kf-list">
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Four doors, not one.</strong> Freshers enter through audit and assurance, tax, advisory and consulting, or the large delivery centres (Deloitte USI, EY GDS, KPMG Global Services and KDN, PwC Acceleration Centers).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Pay depends on the door.</strong> Self-reported analyst-track fresher ranges mostly sit between <strong>2.5 and 7.5 lakh</strong> a year (AmbitionBox), while ICAI puts the average new CA start at <strong>12 to 13 lakh</strong>.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The firms are still growing.</strong> PwC India plans to go from about 30,000 people to 50,000 by 2030, adding <strong>20,000 jobs</strong> (Business Standard, August 2025).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>But money is tighter inside.</strong> Mint reported in June 2025 that Big 4 raises were expected at 5 to 7%, down from 7 to 9%, with fewer promotions.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Interns convert more often.</strong> Pre-placement offer conversions rose 24% in FY25 across 200+ employers (Deloitte Campus Workforce Trends 2025).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Teams hire, not logos.</strong> Each service line has its own manager and need, which is why referrals and a direct note to the team lead beat a cold portal application.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">₹12 to 13L</div>
              <div className="sc-label">average starting salary for newly qualified CAs, per ICAI</div>
              <div className="sc-source">ICAI letter, 27 April 2026 (via Taxscan)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">₹2.5 to 7.5L</div>
              <div className="sc-label">typical self-reported fresher range for analyst-track Big 4 roles</div>
              <div className="sc-source">AmbitionBox, pages updated 2025</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">20,000</div>
              <div className="sc-label">new jobs PwC India plans to add by 2030, taking it to about 50,000 people</div>
              <div className="sc-source">Business Standard, August 2025</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Who the Big 4 Hire at Entry Level</div>
                <div className="sec-sub">Four doors, each with its own pay, tests and decision-maker</div>
              </div>
            </div>
            <p>When people say "get into the Big 4", they usually mean a logo. Inside, each firm runs separate businesses, and freshers are hired into one of them. In India there are four main doors: audit and assurance, tax, advisory or consulting, and the global delivery centres that serve the firm's US, UK and other offices from India. That last door takes many non-CA graduates, and it is the one most students do not know by name.</p>
            <p>The scale is real. Deloitte's South Asia CEO Romal Shetty told Business Today in December 2023 that the firm planned to add 40,000 to 50,000 people over four to five years, on top of a team of over 1.2 lakh. PwC India said in August 2025 that it has about 30,000 people and plans to reach 50,000 by 2030 (Business Standard). Industry estimates cited by the Economic Times put the four firms' combined India revenue at roughly 38,500 to 38,800 crore rupees in FY24. Exact current headcounts for EY and KPMG India are not published in one reliable place, and the blog figures that circulate conflict, so we leave them out.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Door</th>
                  <th>What freshers do</th>
                  <th>Typical entry titles</th>
                  <th>Who it suits</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Audit and assurance</td><td>Testing client accounts, controls, documentation</td><td>Audit Associate, Article Assistant</td><td>CA students, BCom, MCom</td></tr>
                <tr><td>Tax</td><td>Direct and indirect tax compliance, transfer pricing support</td><td>Tax Analyst, Tax Consultant</td><td>CA, BCom, LLB</td></tr>
                <tr><td>Advisory and consulting</td><td>Risk, technology, deals and strategy projects for clients</td><td>Analyst, Associate Consultant, Consultant</td><td>MBA, BTech, CA</td></tr>
                <tr><td>Delivery centres (Deloitte USI, EY GDS, KPMG Global Services and KDN, PwC AC)</td><td>Audit, tax, tech and operations work for the firm's offices abroad</td><td>Associate Analyst, Analyst, Associate</td><td>BCom, BBA, BTech, BSc</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>Pick the door before you apply.</strong> An application that says "any role at Deloitte" goes nowhere. One that says "audit associate, USI, Hyderabad" reaches a specific team with a specific opening.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Business Today (December 2023), Business Standard and Outlook Business (August 2025), Economic Times industry estimates via CAalley (January 2025), firm careers pages for entity names.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">What the Big 4 Pay Freshers</div>
                <div className="sec-sub">Self-reported ranges by role, and where the numbers disagree</div>
              </div>
            </div>
            <p>No Big 4 firm publishes fresher pay in India, so every figure here is either self-reported or a body's average. The cleanest benchmark is ICAI. In a letter dated 27 April 2026, ICAI said newly qualified CAs earn an average starting salary of 12 to 13 lakh a year (Taxscan, May 2026). At ICAI's 62nd campus programme for the May 2025 batch, 3,795 candidates received offers from 157 organisations, with a top domestic package of 26.60 lakh (Taxscan, November 2025). ICAI's own placement page gives a top domestic offer of 32.33 lakh for the December 2025 to January 2026 drive. These are averages across all recruiters, not Big 4 only.</p>
            <p>For graduates without a CA, the delivery centres are the main door, and pay is lower. The chart shows fresher ranges reported on AmbitionBox for common titles.</p>
            <div className="chart-wrap">
              <div className="chart-label">Self-reported fresher pay ranges by firm and title, lakh per year (AmbitionBox, pages updated 2025)</div>
              <div style={{ height: 320 }}>
                <canvas id="b4rPayChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Fresher range or average</th>
                  <th>Reliability</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Newly qualified CA (all recruiters)</td><td>12 to 13 lakh average</td><td><span className="tag-pill pill-green">ICAI figure</span></td></tr>
                <tr><td>EY GDS Associate Analyst</td><td>5 to 7.2 lakh (43 salaries)</td><td><span className="tag-pill pill-amber">Self-reported</span></td></tr>
                <tr><td>Deloitte Associate Analyst</td><td>2.5 to 5.4 lakh on one page, 1.9 to 5 lakh on another</td><td><span className="tag-pill pill-amber">Conflicting</span></td></tr>
                <tr><td>KPMG Global Services Analyst</td><td>1.7 to 7.3 lakh (165 salaries)</td><td><span className="tag-pill pill-amber">Self-reported</span></td></tr>
                <tr><td>PwC India Associate Trainee</td><td>6 to 7.5 lakh</td><td><span className="tag-pill pill-amber">Only 4 salaries</span></td></tr>
                <tr><td>KPMG India Associate Consultant</td><td>3.6 to 15 lakh on AmbitionBox; 9 to 12 lakh per Glassdoor via upGrad</td><td><span className="tag-pill pill-amber">Conflicting</span></td></tr>
              </tbody>
            </table>
            <p>Two things to take from this. First, the wide ranges mix very different people under one title: a BCom associate in a delivery centre and a CA or MBA consultant can both be called "Analyst". Second, raises inside the firms have slowed. Mint reported in June 2025 that the Big 4 expected raises of 5 to 7%, against 7 to 9% the year before, and were cutting promotions and partner elevations as clients trimmed spending.</p>
            <div className="callout">
              <strong>How to read a Big 4 offer:</strong> compare it against the range for your exact title and entity, not "Big 4 salary" in general. A USI or GDS offer and an India consulting offer are different jobs with different bands.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: ICAI letter via Taxscan (1 May 2026); Taxscan on ICAI 62nd campus (1 November 2025); ICAI CCG placement page; AmbitionBox company salary pages for Deloitte, EY GDS, KPMG India, KPMG Global Services and PwC (self-reported, updated 2025); upGrad citing Glassdoor; Mint, 3 June 2025.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Campus vs Off-Campus, and When Hiring Happens</div>
                <div className="sec-sub">Three calendars run at once</div>
              </div>
            </div>
            <p>There is no single Big 4 hiring season. Three calendars run side by side, and knowing which one you are on saves months.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>College campus season, roughly September to December.</strong> Graduates in BCom, BBA, BTech and MBA programmes are usually hired in the final year, with joining the following summer. Your placement cell controls access, and only firms that visit your campus are in play.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>ICAI campus placements, after every CA result.</strong> Recent programmes ran in August to September 2025 (the 62nd), December 2025 to January 2026, and April to May 2026, where Careers360 reported over 2,570 candidates placed at an average CTC of 13 lakh. Sources label these drives inconsistently, so check ICAI's placement portal for the official numbering.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Off-campus, all year.</strong> Delivery centres and individual teams post roles on their careers portals and job boards whenever a project needs people.</span></div>
            </div>
            <p>Off-campus postings are a thin and uneven view of real demand. When CareerIndia counted live Big 4 openings for freshers and early-career candidates on one day in December 2024, it found 471 at KPMG, 461 at EY, 452 at PwC and just 14 at Deloitte, plus 61 internships in total. Deloitte was already one of India's largest professional employers, so the low count does not mean it was not hiring. It means most of its intake was running through campus drives, referrals and channels that never show up as a public post.</p>
            <div className="highlight">
              If you missed campus, you have not missed the Big 4. You have missed one channel. The off-campus route works, but it rewards people who reach a team directly rather than wait for a posting.
            </div>
            <div className="callout">
              <strong>Timing tip:</strong> a team that needs people usually knows before the posting goes live. A short note to that team lead early can reach them before the portal queue fills up.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Taxscan (November 2025); ICAI CCG placement page; Careers360 on ICAI campus placement April to May 2026; CareerIndia, 11 December 2024.</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">The Selection Process, Round by Round</div>
                <div className="sec-sub">Aptitude, English, interviews, and a case for consulting</div>
              </div>
            </div>
            <p>The rounds vary by firm, door and year, and student write-ups disagree on details. Read the list below as the common shape, and your drive notice as the final word.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>What it tests</th>
                  <th>Where you see it</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Online aptitude test</td><td>Quant, logical reasoning, verbal English; often around 90 minutes</td><td>Most campus and delivery-centre drives</td></tr>
                <tr><td>Spoken English test (for example Versant)</td><td>Fluency and pronunciation for client-facing work abroad</td><td>Some delivery-centre roles</td></tr>
                <tr><td>Group discussion or JAM</td><td>Communication, structure, composure</td><td>Some campus drives; dropped in many recent ones</td></tr>
                <tr><td>Technical interview</td><td>Accounting, audit, tax basics for finance roles; coding or tools for tech roles</td><td>Nearly all roles</td></tr>
                <tr><td>Case or guesstimate</td><td>Structured thinking on a business problem</td><td>Consulting, MBA and strategy roles</td></tr>
                <tr><td>HR or partner round</td><td>Fit, mobility, expectations, notice of joining</td><td>Final round for most roles</td></tr>
              </tbody>
            </table>
            <p>A FACE Prep guide to Deloitte's fresher process says the group discussion step has been dropped, leaving a 90-minute online test followed by a combined technical and HR interview. A 2026 Weekday guide says most recent processes go straight to interviews, while some campus drives still run a group discussion, and lists Versant as a separate step. Older experiences on GeeksforGeeks from 2020 to 2022 describe a JAM round in place of a group discussion during virtual drives. The differences are real, so do not over-prepare for one format.</p>
            <div className="callout">
              <strong>Where people actually fail:</strong> not the aptitude test, which is screened by cut-off, but the technical interview. For audit and tax, revise your basics on accounting standards, GST and TDS. For tech roles, be ready to explain one project end to end.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: FACE Prep, Deloitte recruitment process for freshers; Weekday, Deloitte interview questions 2026; GeeksforGeeks Deloitte USI interview experiences (2020 to 2022).</p>
          </div>
          <StuCta via="report-big-4-fresher-internship-report-2026" place="report-mid" size="quiet" title="Stu finds the manager hiring for the Big 4 team you want and writes the email to them." />

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Your Path by Degree: CA, BCom, BTech, MBA</div>
                <div className="sec-sub">Where each degree usually lands, and what it pays</div>
              </div>
            </div>
            <p>Your degree decides which door is realistic first. It does not lock you in: people move from delivery centres to India practices and from audit to advisory after a few years. But the starting point shapes your first offer.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Background</th>
                  <th>Most common entry</th>
                  <th>Pay signal</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Newly qualified CA</td><td>Audit, tax, deals and risk advisory, via ICAI campus or off-campus</td><td>ICAI average 12 to 13 lakh (all recruiters)</td></tr>
                <tr><td>CA student or BCom</td><td>Articleship in audit or tax; or Associate Analyst at a delivery centre</td><td>Analyst-track ranges of about 2.5 to 7.5 lakh (AmbitionBox, self-reported)</td></tr>
                <tr><td>BTech or BSc</td><td>Technology consulting, cyber, data and risk, mostly at USI, GDS, KGS or AC</td><td>Wide ranges; AI and data skills carry a 15 to 20% premium (Deloitte, 2025)</td></tr>
                <tr><td>MBA</td><td>Consulting and deals advisory at India practices; strategy arms like EY-Parthenon</td><td>MBA campus salaries grew only 1.6% in FY25 (Deloitte, 2025)</td></tr>
              </tbody>
            </table>
            <p>For MBAs, consulting demand is strong but crowded at the top. At IIM Bangalore's summer placements for the 2025 to 2027 batch, consulting made up a record 46% of offers, up from 38%, with Accenture Strategy alone making 132 offers (Mint, October 2025). For engineers, Deloitte's Campus Workforce Trends 2025 found AI, machine learning and data science skills carried pay premiums of 15 to 20%, and that about 87% of engineering students were upskilling in those areas, so the skill alone no longer sets you apart.</p>
            <div className="chart-wrap">
              <div className="chart-label">Campus hiring in FY25: year-on-year change, % (Deloitte Campus Workforce Trends 2025, 200+ employers, 500+ campuses)</div>
              <div style={{ height: 280 }}>
                <canvas id="b4rCampusChart" />
              </div>
            </div>
            <div className="callout">
              <strong>For BCom students asking "how do I get into the Big 4":</strong> the two realistic routes are articleship in audit or tax while doing CA, or an Associate Analyst role at a delivery centre. Both are real entries. Choose based on whether you want the CA, not on which logo looks better.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: ICAI via Taxscan (May 2026); AmbitionBox (self-reported, 2025); Deloitte India press release, Campus Workforce Trends 2025 (June 2025); IBEF summary of the same report; Mint via IIM Bangalore Digest (October 2025).</p>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">Internships and Articleship</div>
                <div className="sec-sub">The cheapest door in, and the one that converts</div>
              </div>
            </div>
            <p>For CA students, articleship is the practical training ICAI requires before you qualify, and a Big 4 articleship is one of the most direct routes to a Big 4 job afterwards. ICAI sets only a minimum monthly stipend, which firms are free to exceed. In 2026 ICAI published draft amendment regulations proposing higher minimum stipends, with monthly amounts of up to 6,000 rupees in larger cities, but as of a July 2026 Studycafe report these were still a proposal, not a notified rule. Big 4 articleship stipends are widely reported to be well above the minimum, with blog estimates often in the 10,000 to 25,000 a month range in metros, but we found no official figure, so treat that as indicative.</p>
            <p>For graduates, internships are a smaller door. In the December 2024 CareerIndia count, the four firms together listed only 61 internships against 1,398 full-time roles. Most Big 4 internships come through campus tie-ups, the firms' own student programmes, or a team that needs help for a season.</p>
            <div className="highlight">
              The payoff is conversion. Deloitte's Campus Workforce Trends 2025 found pre-placement offer conversions rose 24% in FY25 across more than 200 organisations. An intern who does good work for one manager is the easiest hire that manager will make all year.
            </div>
            <div className="callout">
              <strong>Make the internship count:</strong> ask your manager in the first week what a full-time offer would need from you, then deliver that. A return offer is decided by one person who has watched you work.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Studycafe (4 July 2026) and VSI Jaipur on ICAI draft stipend regulations 2026; catestseries.org and blog estimates on Big 4 stipends (indicative); CareerIndia (December 2024); Deloitte India press release (June 2025).</p>
          </div>

          {/* Section 7 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">7</div>
              <div>
                <div className="sec-title">Why Referrals and the Team Manager Matter</div>
                <div className="sec-sub">The Big 4 are big, but every hire is a small team's decision</div>
              </div>
            </div>
            <p>A Big 4 firm in India has tens of thousands of people, but nobody hires "for Deloitte". An engagement manager or team lead in a specific service line needs two more associates for a specific client, and that is the hire. HR runs the process, but the team's need decides it. That is why the same firm can be "not hiring" on its portal while a team two floors up is short of people.</p>
            <p>Referrals are how the firms fill many of those seats quickly, and the data on referrals is consistent. Ashby's Talent Trends data, cited in our referrals report, found 40% of referred candidates reached interview against 3% of inbound applicants. CareerPlug's 2024 data found referrals were about 2% of applicants but 11% of hires. These are cross-industry figures, not Big 4 numbers, but the mechanism is the same: a person who knows the team vouches for you before your resume is read.</p>
            <div className="pull-quote">
              <p>"Nobody hires for the Big 4. A manager hires for one team, for one client, this quarter. Reach that person and you are no longer one of thousands."</p>
              <span className="pq-source">The takeaway from this report's data</span>
            </div>
            <p>With raises and promotions tighter in 2025 (Mint, June 2025), teams are hiring for exact needs rather than in bulk. A short, specific email to the manager of the team you want, saying which service line, what you have done that fits, and when you can join, gives that manager an easy yes. No email is guaranteed a reply, but it is read by the person who decides, which a portal application often is not.</p>
            <div className="callout">
              <strong>If you have no referral:</strong> you can still reach the team. Studojo finds the person who can actually hire you, verifies their email, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Ashby Talent Trends (2021 to 2024) and CareerPlug 2024 Recruiting Metrics, as summarised in Studojo's referrals vs applications report; Mint, 3 June 2025.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">What freshers ask about getting into the Big 4, answered directly</div>
              </div>
            </div>
            {FAQ.map((f) => (
              <div className="faq-item" key={f.q}>
                <div className="faq-q">{f.q}</div>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>

          {/* Takeaway */}
          <div className="takeaway-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6d28d9" }}>→</div>
              <div>
                <div className="sec-title" style={{ color: "#3b0764" }}>What This Means For You</div>
                <div className="sec-sub" style={{ color: "#7c3aed" }}>A plan for getting into the Big 4 as a fresher</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The numbers point to a simple plan:</p>
            <div className="blist">
              {[
                ["Choose one door", "Audit, tax, advisory or a delivery centre. Your degree decides which is realistic first. Apply to that door, not to a logo."],
                ["Know the real pay band", "Compare offers against your exact title and entity. Delivery-centre analyst roles and CA roles sit in very different bands."],
                ["Use every calendar", "Campus from September to December, ICAI drives after each CA result, and off-campus all year. Missing one is not missing the Big 4."],
                ["Prepare for the technical round", "That is where most candidates fall. Know your accounting, tax or tech basics cold, and one project end to end."],
                ["Reach the team, not just the portal", "Every hire is one manager's decision. A referral or a short, specific email to that manager is the strongest move you have."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" style={{ background: "#6d28d9" }} />
                  <span style={{ color: "#3b0764" }}><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related reports */}
          <div className="related">
            <h2>Related reports</h2>
            <div className="related-grid">
              <Link to="/reports/finance-internships-india-ib-consulting-fintech-2026" className="related-card">
                <div className="rc-kicker">Finance</div>
                <div className="rc-title">Finance Internships India 2026: IB, Consulting, and Fintech</div>
              </Link>
              <Link to="/reports/off-campus-placement-report-india-2026" className="related-card">
                <div className="rc-kicker">Off-campus</div>
                <div className="rc-title">The Off-Campus Placement Report India 2026</div>
              </Link>
              <Link to="/reports/referrals-vs-applications-how-people-get-hired-2026" className="related-card">
                <div className="rc-kicker">Referrals</div>
                <div className="rc-title">Referrals vs Applications: How People Actually Get Hired</div>
              </Link>
            </div>
          </div>
          <StuCta via="report-big-4-fresher-internship-report-2026" place="report-end" size="card" title="Want a Big 4 role, not just another portal application?" line="Tell Stu the firm, the team and the city you want in one short call. Stu finds roles that fit you, finds who's hiring and writes the email to them." />
        </div>
      </main>
      <Footer />
    </>
  );
}
