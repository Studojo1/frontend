import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Amazon Internship Report 2026-27: SDE Roles, the Bar Raiser, and How Offers Actually Close | Studojo" },
    { name: "description", content: "Amazon internships 2026-27: the online assessment, the 16 Leadership Principles, the Bar Raiser, what interns earn in the US and India, and how the return offer actually works." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "Amazon internship 2026, Amazon internship 2027, Amazon SDE intern, Amazon internship India, Amazon online assessment, Amazon Leadership Principles, Bar Raiser, Amazon intern salary, how to get an Amazon internship" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/amazon-internship-report-2026-27` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Amazon Internship Report 2026-27: SDE Roles, the Bar Raiser, and How Offers Actually Close" },
    { property: "og:description", content: "The Amazon online assessment, the 16 Leadership Principles, the Bar Raiser, intern pay in the US and India, and how the return offer really works." },
    { property: "og:url", content: `${BASE_URL}/reports/amazon-internship-report-2026-27` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-12T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Amazon Internship Report 2026-27 | Studojo" },
    { name: "twitter:description", content: "How Amazon picks interns: the online assessment, the Leadership Principles, the Bar Raiser, pay, and the return offer." },
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
  const ORANGE = "#f59e0b";
  const GREEN = "#10b981";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: suggested prep time by skill (illustrative)
  const prepEl = document.getElementById("amzPrepChart") as HTMLCanvasElement | null;
  if (prepEl && !prepEl.dataset.rendered) {
    prepEl.dataset.rendered = "1";
    new Chart(prepEl, {
      type: "bar",
      data: {
        labels: [
          "Coding problems (arrays, strings, graphs, DP basics)",
          "Leadership Principle stories (STAR)",
          "Code debugging practice",
          "Work-simulation and work-styles familiarity",
          "Mock interviews out loud",
        ],
        datasets: [{
          label: "Suggested weeks of prep (illustrative)",
          data: [6, 4, 2, 1, 2],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET3, VIOLET2],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw} weeks` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 8, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: what a typical loop weighs (illustrative)
  const loopEl = document.getElementById("amzLoopChart") as HTMLCanvasElement | null;
  if (loopEl && !loopEl.dataset.rendered) {
    loopEl.dataset.rendered = "1";
    new Chart(loopEl, {
      type: "doughnut",
      data: {
        labels: [
          "Coding and problem solving",
          "Leadership Principles stories",
          "Bar Raiser judgement of long-term bar",
          "Communication and clarifying questions",
        ],
        datasets: [{
          data: [40, 35, 15, 10],
          backgroundColor: [VIOLET, ORANGE, GREEN, VIOLET3],
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
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw}% of the signal` } },
        },
      },
    });
  }

  // Chart 3: emphasis on LPs vs raw coding by stage (illustrative)
  const emphEl = document.getElementById("amzEmphasisChart") as HTMLCanvasElement | null;
  if (emphEl && !emphEl.dataset.rendered) {
    emphEl.dataset.rendered = "1";
    new Chart(emphEl, {
      type: "bar",
      data: {
        labels: ["Online assessment", "Technical interview", "Bar Raiser round", "Return-offer review"],
        datasets: [
          {
            label: "Raw coding",
            data: [9, 7, 5, 3],
            backgroundColor: VIOLET,
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            label: "Leadership Principles",
            data: [2, 6, 9, 9],
            backgroundColor: ORANGE,
            borderRadius: 6,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}/10` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 10, ticks: { font: { size: 12 }, color: MUTED } },
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
  .chart-two { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
  @media (max-width: 640px) { .chart-two { grid-template-columns: 1fr; } }

  .divider { height: 2px; background: #f0f0f0; margin: 24px 0; border-radius: 2px; }

  .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e5e5; }
  .data-table th { background: #171717; color: #f8f6f1; font-weight: 700; padding: 11px 16px; text-align: left; letter-spacing: 0.5px; }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #404040; vertical-align: top; line-height: 1.55; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:nth-child(even) td { background: #fafafa; }
  .tag-pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .pill-red { background: #fee2e2; color: #b91c1c; }
  .pill-amber { background: #fef3c6; color: #92400e; }
  .pill-green { background: #d0fae4; color: #065f46; }
  .pill-blue { background: #dbeafe; color: #1e40af; }

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
    q: "When do Amazon internships open for summer 2027?",
    a: "Applications for summer internships usually open between August and October of the year before, so roughly 8 to 11 months ahead. For summer 2027 that means the window is open now, in autumn 2026. Roles are filled on a rolling basis, so apply early and check amazon.jobs for exact dates for your country.",
  },
  {
    q: "What is an Amazon Bar Raiser?",
    a: "A Bar Raiser is a specially trained Amazon interviewer from outside the hiring team who sits in your interview loop. Their job is to protect the hiring bar, and they can veto a hire even if the team wants you. They focus heavily on the Leadership Principles and on whether you would raise the average of the people already doing the job.",
  },
  {
    q: "How much do Amazon interns get paid?",
    a: "Reported pay for US software dev engineer interns is roughly $9,000 to $11,000+ per month, according to self-reported data on Levels.fyi and Glassdoor. Many US interns also report relocation or housing support. These are reported figures, not an offer, and they vary by location and team.",
  },
  {
    q: "Does Amazon hire interns in India?",
    a: "Yes. Amazon hires interns in India through both campus programs and off-campus routes, mainly for software development engineer roles in cities like Bengaluru, Hyderabad and Chennai. Reported SDE intern stipends sit in the rough range of ₹80,000 to ₹1,10,000 per month on Glassdoor and AmbitionBox. Treat that as reported, not guaranteed.",
  },
  {
    q: "How many Amazon Leadership Principles are there?",
    a: "There are 16 Leadership Principles. Amazon uses them to score nearly every behavioural answer you give, in the online assessment and in interviews. Customer Obsession, Ownership, Dive Deep and Bias for Action are the ones students are asked about most often.",
  },
  {
    q: "How should I prepare for the Amazon online assessment?",
    a: "Practise three things: debugging short pieces of broken code, solving two timed coding problems, and answering the work-simulation and work-styles questions honestly. Spend most of your time on the coding problems, since that is where scores are won or lost. Do not try to game the work-styles survey, because it checks for consistency.",
  },
];

export default function AmazonInternshipReport() {
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
        "headline": "The Amazon Internship Report 2026-27: SDE Roles, the Bar Raiser, and How Offers Actually Close",
        "description": "Amazon internships 2026-27: the online assessment, the 16 Leadership Principles, the Bar Raiser, what interns earn in the US and India, and how the return offer actually works.",
        "url": `${BASE_URL}/reports/amazon-internship-report-2026-27`,
        "datePublished": "2026-10-12T00:00:00Z",
        "dateModified": "2026-10-12T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/amazon-internship-report-2026-27` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Amazon Internship Report 2026-27", "item": `${BASE_URL}/reports/amazon-internship-report-2026-27` },
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
            <div className="rpt-badge">Studojo Research · October 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Amazon Internship Report 2026-27</span>
            </nav>
            <h1>How Amazon Interns <em>Actually Get Picked</em></h1>
            <p className="rpt-hero-sub">
              Amazon does not hire interns on a gut feeling. It runs a timed online assessment,
              scores every story against 16 Leadership Principles, and puts an independent Bar
              Raiser in the loop. This report explains each gate, what interns earn, and how the
              return offer really closes.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · US and India</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">SDE and the interview loop</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">October 2026</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>There are <strong>two entry routes</strong>: an online assessment first, then an interview loop for those who pass.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The <strong>online assessment is the real first gate</strong>: code debugging, two coding problems, a work simulation and a work-styles survey.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Every behavioural answer is scored against the <strong>16 Leadership Principles</strong>, and the expected format is STAR (Situation, Task, Action, Result).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The <strong>Bar Raiser</strong> is an independent interviewer with a veto, whose job is to protect the hiring bar.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Interns are assessed for a <strong>return offer (PPO) from week one</strong>. In India, Amazon hires interns through both <strong>campus and off-campus</strong> routes.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">16</div>
              <div className="sc-label">Leadership Principles every Amazon answer is scored against</div>
              <div className="sc-source">Amazon, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">$9k+</div>
              <div className="sc-label">reported monthly pay for US software dev engineer interns</div>
              <div className="sc-source">Levels.fyi / Glassdoor (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">Aug-Oct</div>
              <div className="sc-label">typical window when applications open for the next summer, roughly 8 to 11 months ahead</div>
              <div className="sc-source">Amazon university recruiting pattern</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">The Two Ways In</div>
                <div className="sec-sub">US pipeline, India campus and off-campus, and the non-SDE tracks</div>
              </div>
            </div>
            <p>In the US, the software development engineer (SDE) intern pipeline starts with an application on amazon.jobs, usually in the autumn before the summer you want. If your resume clears the first screen, you get an invitation to the online assessment. Pass that, and you move to an interview loop.</p>
            <p>In India, there are two routes. Campus hiring runs through placement cells, where Amazon visits selected colleges and uses its own assessment as the filter. Off-campus hiring runs through amazon.jobs and occasional hiring drives, open to students at any college. The bar is the same. The volume of applicants is not.</p>
            <p>SDE is not the only door. Amazon also hires interns in business and support-style tracks such as operations, finance, product and customer support. These usually lean less on algorithms and more on analytical thinking and the Leadership Principles, and they tend to get fewer applicants than SDE.</p>
            <div className="highlight">
              The practical takeaway: <strong>every route starts with an assessment or a screen you can prepare for</strong>. There is no secret side door, so the plan is to get good at the gates, in order.
            </div>
            <div className="chart-wrap">
              <div className="chart-label">Where prep time goes for an SDE intern candidate (illustrative)</div>
              <div style={{ height: 280 }}>
                <canvas id="amzPrepChart" />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">The Online Assessment</div>
                <div className="sec-sub">The real first gate, and what is actually in it</div>
              </div>
            </div>
            <p>For SDE roles, the online assessment (OA) typically has a debugging section, two coding problems and a work simulation. A work-styles survey sits alongside. Exact format and timing change by role and year, so read your invitation email carefully.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Code debugging:</strong> short pieces of code with bugs. You find and fix them against test cases. Speed and careful reading matter more than clever ideas.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Two coding problems:</strong> timed, graded on hidden test cases. Expect common data structures and algorithm patterns. Correct and clean beats fancy.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Work simulation:</strong> short workplace scenarios where you pick how you would respond, which Amazon uses to see how you reason about priorities and trade-offs.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Work-styles survey:</strong> questions about how you like to work. There is no trick answer. It checks for consistency, so answer honestly.</span></div>
            </div>
            <div className="callout">
              <strong>Where people lose it:</strong> not on the hard problem, but on the easy one they rushed. Run your own edge cases (empty input, one element, duplicates) before you submit, every time.
            </div>
            <div className="chart-wrap">
              <div className="chart-label">Where the signal comes from at each stage (illustrative, 0 to 10)</div>
              <div style={{ height: 280 }}>
                <canvas id="amzEmphasisChart" />
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">The 16 Leadership Principles and STAR</div>
                <div className="sec-sub">How behavioural answers are scored</div>
              </div>
            </div>
            <p>Amazon has 16 Leadership Principles (LPs). Interviewers are assigned specific LPs to probe and they write up your answers against them. The standard format is STAR: describe the Situation, the Task, the Action you took, and the Result, with numbers where you can.</p>
            <p>The key word is "you". Interviewers listen for what you did, not what the team did. Prepare six to eight real stories from projects, clubs, jobs or coursework, and map each to two or three LPs.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Principle</th>
                  <th>What it sounds like in an answer</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Customer Obsession</strong></td>
                  <td>You started from what the user needed, not from what was easy to build, and changed the plan when feedback came in.</td>
                </tr>
                <tr>
                  <td><strong>Ownership</strong></td>
                  <td>You fixed something that was not strictly your job, and you stayed with it until it was done.</td>
                </tr>
                <tr>
                  <td><strong>Invent and Simplify</strong></td>
                  <td>You found a simpler way to do something that was slow or clumsy, and you can say how much better it got.</td>
                </tr>
                <tr>
                  <td><strong>Dive Deep</strong></td>
                  <td>You went into the data or the code to find the real cause instead of accepting the first explanation.</td>
                </tr>
                <tr>
                  <td><strong>Bias for Action</strong></td>
                  <td>You made a reasonable call with incomplete information and moved, instead of waiting for certainty.</td>
                </tr>
                <tr>
                  <td><strong>Deliver Results</strong></td>
                  <td>You hit a deadline or a goal despite obstacles, and you can show the outcome in numbers.</td>
                </tr>
                <tr>
                  <td><strong>Learn and Be Curious</strong></td>
                  <td>You taught yourself something new to solve a problem, and you can say what you learned and used.</td>
                </tr>
                <tr>
                  <td><strong>Earn Trust</strong></td>
                  <td>You were honest about a mistake, listened to criticism, and rebuilt confidence with the people involved.</td>
                </tr>
              </tbody>
            </table>
            <div className="highlight">
              Eight of 16 are shown here because they come up most for students. Read all 16 on Amazon's own careers site, and <strong>never memorise a script</strong>. Interviewers ask follow-ups until they hit the real detail.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">The Bar Raiser and the Interview Loop</div>
                <div className="sec-sub">Rounds, the debrief, and the veto</div>
              </div>
            </div>
            <p>If you pass the OA, you usually get a loop of several interviews, often done virtually for interns. A typical SDE loop mixes coding rounds with LP questions in every round. Each interviewer is given LPs to cover, so even a coding round will start or end with a behavioural question.</p>
            <p>One interviewer in the loop is often a Bar Raiser. This is a trained Amazon interviewer who does not work on the team hiring you. Their purpose is to keep the hiring bar consistent across the company and to make sure each hire is better than the average of the current team.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Independent by design.</strong> The Bar Raiser has no stake in filling the team's seat, so they can say no when the team is tempted to say yes.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The debrief.</strong> After the loop, interviewers meet and share written feedback. The Bar Raiser helps lead the discussion and pushes on weak evidence.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The veto.</strong> A Bar Raiser can block a hire even if everyone else is in favour. That is why consistent LP stories matter as much as clean code.</span></div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">What a typical loop weighs (illustrative share of signal, %)</div>
              <div style={{ height: 280 }}>
                <canvas id="amzLoopChart" />
              </div>
            </div>
            <div className="callout">
              <strong>Do not try to spot the Bar Raiser.</strong> You will not be told, and you should not change how you answer. Treat every interviewer as the one holding the veto.
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Pay and the Return Offer</div>
                <div className="sec-sub">What interns earn, and why the PPO is the real prize</div>
              </div>
            </div>
            <p>For US software dev engineer interns, self-reported data on Levels.fyi and Glassdoor puts monthly pay at roughly $9,000 to $11,000 or more, often with relocation or housing support. For India, SDE intern stipends are widely reported in the rough range of ₹80,000 to ₹1,10,000 per month on Glassdoor and AmbitionBox. These are reported figures, not published Amazon pay scales, and they vary by team, location and year.</p>
            <p>The stipend is not the main prize. The return offer, called a pre-placement offer or PPO, is. Interns are assessed from week one against the same Leadership Principles, plus how well they deliver a real project. Strong interns are often offered a full-time role at the end, and that can be worth far more than the internship itself.</p>
            <div className="highlight">
              <strong>Treat the internship as a twelve-week interview.</strong> Pick a project you can finish, write down your decisions, ask for feedback early, and keep notes you can turn into STAR stories for the final review.
            </div>
            <div className="callout">
              <strong>Pay caveat:</strong> numbers on community sites are self-reported and can be out of date. Confirm your actual terms in your offer letter before you plan around them.
            </div>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">The Calendar and a Plan</div>
                <div className="sec-sub">What to do, and when, for the US and India</div>
              </div>
            </div>
            <p>Roles for the next summer typically open between August and October. Because hiring is rolling, earlier applications get more of the open seats. For summer 2027 that means the window is open as you read this.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>US students</th>
                  <th>India students</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Now to November</strong></td>
                  <td>Apply on amazon.jobs. Finish your resume and write LP stories.</td>
                  <td>Check your placement cell calendar. Apply off-campus on amazon.jobs in parallel.</td>
                </tr>
                <tr>
                  <td><strong>After you apply</strong></td>
                  <td>Do the OA in a quiet two-hour block once invited.</td>
                  <td>Campus OA dates are set by your college. Prepare before they are announced.</td>
                </tr>
                <tr>
                  <td><strong>Loop stage</strong></td>
                  <td>Mock interviews out loud, with LP questions in every round.</td>
                  <td>Same format. Practise explaining your thinking in clear spoken English.</td>
                </tr>
                <tr>
                  <td><strong>Internship</strong></td>
                  <td>Ship your project and collect feedback for the PPO review.</td>
                  <td>Same. Keep a weekly log of decisions and results.</td>
                </tr>
              </tbody>
            </table>
            <p>One more thing. A resume that clears the first screen is specific: projects with numbers, tools named, and your own role made clear. A generic resume rarely gets as far as the assessment.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The Amazon internship questions students ask most, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to spend your effort</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Amazon is a process you can prepare for, one gate at a time. Spend your effort where the scoring actually happens:</p>
            <div className="blist">
              {[
                ["Apply early", "Roles open from August to October and fill on a rolling basis. A good application this month beats a perfect one in January."],
                ["Practise the OA under a timer", "Debugging and two coding problems, with a clock running. Check edge cases before you submit."],
                ["Write six to eight STAR stories", "Real ones, with numbers, where you did the work. Map each to two or three Leadership Principles and say them out loud."],
                ["Aim for the PPO, not just the stipend", "Once you are in, treat the internship as a twelve-week interview and keep notes for your final review."],
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
              <Link to="/reports/google-internship-report-2026" className="related-card">
                <div className="rc-kicker">Big Tech</div>
                <div className="rc-title">The Google Internship Report</div>
              </Link>
              <Link to="/reports/apple-internship-report-2026-27" className="related-card">
                <div className="rc-kicker">Big Tech</div>
                <div className="rc-title">The Apple Internship Report 2026-27</div>
              </Link>
              <Link to="/reports/return-offer-report-why-some-interns-get-hired-2026" className="related-card">
                <div className="rc-kicker">Return offers</div>
                <div className="rc-title">Why Some Interns Get Hired and Others Do Not</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Find roles like this, without the queue.</h3>
              <p>Stu, Studojo&apos;s job agent, finds roles that fit you and the hiring manager to write to at each company, then drafts the email you send from your own mailbox.</p>
            </div>
            <Link to="/b2cnew/join?via=report-amazon-internship-report-2026-27&how=voice" reloadDocument className="rpt-cta-btn">
              Start with Stu →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
