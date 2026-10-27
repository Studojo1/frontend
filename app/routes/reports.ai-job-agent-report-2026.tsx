import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "AI Job Agents in 2026: What They Actually Do, and Why Most Do Not Get You Hired | Studojo" },
    { name: "description", content: "What an AI job agent really does: finders, matchers and auto-appliers compared, why mass-applying fails, and the agent that emails the hiring manager." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "AI job agent, AI job search agent, AI job hunter, AI job search assistant, AI agent for job search, best AI job agent, AI job hunting" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/ai-job-agent-report-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "AI Job Agents in 2026: What They Actually Do, and Why Most Do Not Get You Hired" },
    { property: "og:description", content: "Finders, matchers and auto-appliers: what each kind of AI job agent does, why most do not get you hired, and the one that reaches the person who hires." },
    { property: "og:url", content: `${BASE_URL}/reports/ai-job-agent-report-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-27T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The AI Job Agent Report 2026 | Studojo" },
    { name: "twitter:description", content: "Three kinds of AI job agent, why mass-applying fails, and the agent that emails the hiring manager from your own Gmail." },
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
  const RED = "#ef4444";
  const GREEN = "#10b981";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: the kinds of AI job agent, time saved vs reaching the person who hires (editorial rating)
  const typesEl = document.getElementById("ajaTypesChart") as HTMLCanvasElement | null;
  if (typesEl && !typesEl.dataset.rendered) {
    typesEl.dataset.rendered = "1";
    new Chart(typesEl, {
      type: "bar",
      data: {
        labels: ["Finder", "Matcher", "Auto-applier", "Studojo (emails the hiring manager)"],
        datasets: [
          {
            label: "Saves you time",
            data: [4, 4, 5, 4],
            backgroundColor: ORANGE,
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            label: "Puts you in front of the person who hires",
            data: [1, 1, 1, 5],
            backgroundColor: VIOLET,
            borderRadius: 6,
            borderWidth: 0,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}/5` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: successful applications per 1,000 sent, at the cited 0.1% to 2% range (derived)
  const rateEl = document.getElementById("ajaRateChart") as HTMLCanvasElement | null;
  if (rateEl && !rateEl.dataset.rendered) {
    rateEl.dataset.rendered = "1";
    new Chart(rateEl, {
      type: "bar",
      data: {
        labels: ["At 0.1% (low end)", "At 1%", "At 2% (high end)"],
        datasets: [{
          label: "Successful applications per 1,000 sent",
          data: [1, 10, 20],
          backgroundColor: [RED, ORANGE, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} of 1,000 applications` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, beginAtZero: true, ticks: { font: { size: 12 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: risk to your name, by how an agent sends (editorial rating)
  const riskEl = document.getElementById("ajaRiskChart") as HTMLCanvasElement | null;
  if (riskEl && !riskEl.dataset.rendered) {
    riskEl.dataset.rendered = "1";
    new Chart(riskEl, {
      type: "bar",
      data: {
        labels: [
          "Dozens of roles at one company",
          "Bots or add-ons on LinkedIn",
          "Template blast to HR inboxes",
          "One-click apply to every match",
          "Personal email from your own Gmail",
        ],
        datasets: [{
          label: "Risk to your name (1-5)",
          data: [5, 5, 4, 3, 1],
          backgroundColor: [RED, RED, ORANGE, VIOLET2, GREEN],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Risk: ${ctx.raw}/5` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
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
    q: "What is an AI job agent?",
    a: "An AI job agent is software that does part of your job search for you. Most fall into three groups: finders that collect listings, matchers that score how well you fit each one, and auto-appliers that submit applications in your name. Studojo is built differently: it finds the hiring manager for the role and emails them from your own Gmail.",
  },
  {
    q: "Do AI job agents actually get you hired?",
    a: "Not on their own. Finders and matchers save time, but they still end at an online application, and the typical success rate of an online application is cited at roughly 0.1% to 2% (The Interview Guys, April 2026). The step that changes things is a short, personal email to the person who hires, which is what Studojo does for you, though no tool can guarantee a reply.",
  },
  {
    q: "Is it safe to use an AI job hunter that auto-applies for you?",
    a: "We do not recommend it. Recruiters told NBC News in November 2024 that they plant hidden instructions in job posts to catch bots and watch for one person applying to dozens of roles at the same company. LinkedIn's terms also ban bots and automation tools, and reviewers of LazyApply on Trustpilot report applications going to irrelevant jobs and wrong locations.",
  },
  {
    q: "What is the best AI job agent?",
    a: "The best AI job agent is the one that gets you in front of the person who hires, not the one that sends the most applications. We built Studojo to do exactly that: it finds the hiring manager or team lead, verifies their email, writes a personal email for that one person and sends it from your own Gmail.",
  },
  {
    q: "What is the difference between an AI job search assistant and an AI job hunter?",
    a: "An AI job search assistant helps you do the work yourself: finding roles, scoring your fit, tightening a resume line. An AI job hunter usually means a tool that applies for you, often in bulk. The first saves you time, while the second trades your name for volume, and more volume at a 0.1% to 2% success rate mostly buys you more silence.",
  },
  {
    q: "Should I let an AI agent email hiring managers for me?",
    a: "Yes, if every email is written for one person and sent from your own address. A template blasted from an unknown domain reads like spam. Studojo writes each email for that one hiring manager, based on your background and their work, and sends it from your own Gmail, so any reply comes straight to you.",
  },
];

export default function AiJobAgentReport() {
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
        "headline": "AI Job Agents in 2026: What They Actually Do, and Why Most Do Not Get You Hired",
        "description": "What finders, matchers and auto-appliers actually do, why mass-applying fails, and why the AI job agent worth using reaches the hiring manager.",
        "url": `${BASE_URL}/reports/ai-job-agent-report-2026`,
        "datePublished": "2026-10-27T00:00:00Z",
        "dateModified": "2026-10-27T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/ai-job-agent-report-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "AI Job Agent Report 2026", "item": `${BASE_URL}/reports/ai-job-agent-report-2026` },
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
              <span>AI Job Agent Report 2026</span>
            </nav>
            <h1>AI Job Agents in 2026: What They Actually Do, and <em>Why Most Do Not Get You Hired</em></h1>
            <p className="rpt-hero-sub">
              Every job app now calls itself an AI job agent. Underneath, most are one of
              three things: a finder, a matcher or an auto-applier. This report shows what
              each one does, which ones are worth your time, and the step none of them take:
              reaching the person who hires.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Students and freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">AI job agents, auto-apply, hiring managers</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>"AI job agent" covers <strong>three different products</strong>: finders that list jobs, matchers that score your fit, and auto-appliers that submit applications in your name.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Finders and matchers <strong>save you time, not a place in the queue</strong>. Their last step is still an online application.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Auto-appliers <strong>burn your name</strong>. An online application is cited at roughly 0.1% to 2% success (The Interview Guys, April 2026), and recruiters now hunt for bot patterns (NBC News, November 2024).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Using AI is now normal: <strong>85.6% of job seekers</strong> say they use AI tools (Huntr, Q3 2025, a vendor survey). Applying faster with AI puts you in the same queue as everyone else.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The agent worth using <strong>reaches the person who hires</strong>. We built Studojo to find the hiring manager, verify their email, write a personal email for that one person and send it from your own Gmail.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">85.6%</div>
              <div className="sc-label">of job seekers say they already use AI tools in their search</div>
              <div className="sc-source">Huntr survey, Q3 2025, n=527 (vendor survey)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">0.1 to 2%</div>
              <div className="sc-label">typical success rate cited for a single online application</div>
              <div className="sc-source">The Interview Guys, April 2026 (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~242</div>
              <div className="sc-label">applications an average job opening draws</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider (reported)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">The Three Kinds of AI Job Agent</div>
                <div className="sec-sub">One label, three very different products</div>
              </div>
            </div>
            <p>Search for an AI job agent and you get dozens of tools that promise to run your job hunt. Strip out the marketing and nearly all AI job hunting tools sort into three groups.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>What it does</th>
                  <th>Where its work ends</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Finder</strong></td>
                  <td>Pulls listings from many boards into one feed, with filters</td>
                  <td>An apply button</td>
                  <td><span className="tag-pill pill-blue">Saves time</span> Fine for a shortlist</td>
                </tr>
                <tr>
                  <td><strong>Matcher</strong></td>
                  <td>Reads your resume and scores your fit for each posting</td>
                  <td>An apply button</td>
                  <td><span className="tag-pill pill-blue">Saves time</span> Fine for choosing where to aim</td>
                </tr>
                <tr>
                  <td><strong>Auto-applier</strong></td>
                  <td>Submits applications in your name, often in bulk</td>
                  <td>A pile of applications with your name on them</td>
                  <td><span className="tag-pill pill-red">Avoid</span> Burns your name</td>
                </tr>
                <tr>
                  <td><strong>Studojo</strong></td>
                  <td>Finds the hiring manager, verifies their email, writes a personal email and sends it from your Gmail</td>
                  <td>The inbox of the person who hires</td>
                  <td><span className="tag-pill pill-green">Use this</span> Reaches a person</td>
                </tr>
              </tbody>
            </table>
            <p>The first two are AI job search assistants. They do real work and save real time. The third is what most people mean by an AI job hunter, and it is the one that hurts you. Studojo sits outside all three, because it is built around a different last step.</p>
            <div className="chart-wrap">
              <div className="chart-label">Saves you time vs puts you in front of the person who hires, 1 to 5 (Studojo editorial rating)</div>
              <div style={{ height: 280 }}>
                <canvas id="ajaTypesChart" />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Finders and Matchers: Useful, Up to a Point</div>
                <div className="sec-sub">They save you time. They do not get you seen.</div>
              </div>
            </div>
            <p>A good finder saves you an evening of scrolling. A good matcher tells you which of fifty roles actually fit your background. Both are fair uses of an AI agent for job search.</p>
            <p>They are also everywhere. 85.6% of job seekers say they use AI tools (Huntr survey, Q3 2025, n=527; a vendor survey, so read it as a direction, not a census). NBC News, citing Capterra, put the share at 58% in November 2024. Either way, using AI no longer sets you apart.</p>
            <p>The problem is where they stop. Every finder and every matcher ends at the same apply button, and behind that button an average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data). When a recruiter does open yours, the first scan takes about 6 to 7 seconds (Ladders eye-tracking study, 2018).</p>
            <div className="highlight">
              A better list of jobs is still a list of jobs. For most freshers the hard part is not finding postings. <strong>It is getting one person who can hire to look at you.</strong>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Auto-Appliers: Why Mass-Applying Burns Your Name</div>
                <div className="sec-sub">More applications, the same odds, new risks</div>
              </div>
            </div>
            <p>Auto-appliers take the apply button and press it for you, over and over. The pitch is simple maths: if each application is a long shot, send more of them. The maths does not hold up.</p>
            <p>The typical success rate of an online application is cited at roughly 0.1% to 2% (The Interview Guys, April 2026). The same article reports one auto-apply account that produced about 5 interviews from thousands of applications, around 0.1%, and a bulk-apply service that shut its bulk-send feature in August 2025 at roughly one interview per fifty sends.</p>
            <div className="chart-wrap">
              <div className="chart-label">Successful applications per 1,000 sent, at the cited 0.1% to 2% range (derived from The Interview Guys, April 2026)</div>
              <div style={{ height: 260 }}>
                <canvas id="ajaRateChart" />
              </div>
            </div>
            <p>Volume also leaves a trail. Recruiters, including Mike Peditto, told NBC News (17 November 2024) that they catch bot applications by planting hidden instructions in job posts, such as asking applicants to include a specific odd word, and by spotting one person applying to dozens of roles at the same company. LinkedIn's terms ban bots and automation tools (User Agreement, section 8.2).</p>
            <div className="callout">
              <strong>What reviewers report:</strong> on Trustpilot, reviewers of LazyApply, an auto-apply tool, report applications sent to irrelevant jobs and wrong locations, billing and refund complaints, subscriptions renewing without notice, and emails landing in spam. Sonara, an early AI job hunter, ran a $2.95 trial that rolled into $23.95 per four weeks, and shut its original service on 1 February 2024 (public reviews and Sonara's own shutdown notice).
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">The Step Every Agent Skips: Reaching the Person Who Hires</div>
                <div className="sec-sub">Where the hiring decision actually gets made</div>
              </div>
            </div>
            <p>A job is filled by a person: usually the hiring manager or team lead who needs the help. Finders, matchers and auto-appliers all work on the queue in front of that person. None of them goes to the person.</p>
            <p>What works is direct. A short, personal, specific email to the hiring manager, sent from your own email address, that shows you looked at their work and says what you can do for the team. If you hear nothing, one polite follow-up helps. That is Studojo's position, and it is the reason we built Studojo.</p>
            <div className="pull-quote">
              <p>"If your agent's last step is a submit button, it is just a faster way to join the queue."</p>
              <span className="pq-source">The Studojo test for any AI job agent</span>
            </div>
            <p>Studojo is the AI job agent we built to take that step for you. It finds the person who can actually hire you (the hiring manager or team lead, not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail.</p>
            <div className="highlight">
              <strong>8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail</strong> (Studojo's own records, September 2026). Replies are not guaranteed. The difference is that your email lands with a person, not in a queue.
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">How to Choose an AI Job Agent</div>
                <div className="sec-sub">Six questions before you hand over your name</div>
              </div>
            </div>
            <p>Before you trust any AI job search agent with your name, ask it these six questions.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Who receives what it sends?</strong> A portal queue or a named person who can hire. If it is a queue, the agent is a faster way to apply, nothing more.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Whose address does it send from?</strong> Your own email address carries your name, and replies come back to you. An unknown sending domain reads like spam.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Does it write for one person?</strong> A template with the company name swapped in is still a template. Hiring managers can tell.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Does it automate LinkedIn?</strong> LinkedIn's terms ban bots and automation tools. A tool that clicks for you there puts your account on the wrong side of those terms.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>How does billing work?</strong> Check whether a cheap trial rolls into a recurring charge. Reviewers of auto-apply tools have complained about exactly this.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Does it promise interviews?</strong> No honest tool can. If an agent guarantees interviews or offers, walk away.</span></div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">Risk to your name, by how an agent sends, 1 to 5 (Studojo editorial rating)</div>
              <div style={{ height: 280 }}>
                <canvas id="ajaRiskChart" />
              </div>
            </div>
            <p>There is also a human version of the AI job hunter. Reverse recruiters, people you pay to job hunt for you, are reported to charge about $1,500 a month plus about 10% of your first-year salary (Fortune, 25 March 2026). For a fresher paid in rupees, that is well over ₹1 lakh a month before you have an offer.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The AI job agent questions people ask most, answered directly</div>
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
            <p style={{ color: "#3b0764" }}>An AI job agent is only as good as the place its work lands. Spend your effort like this:</p>
            <div className="blist">
              {[
                ["Use finders and matchers to shortlist", "Let them narrow the field to roles worth aiming at. Do not let them be your last step."],
                ["Skip the auto-applier", "More volume does not fix a 0.1% to 2% success rate, and bot patterns are easy for recruiters to spot."],
                ["Write to one person", "The hiring manager or team lead for the role, in a short email that shows you looked at their work."],
                ["Follow up once", "One polite follow-up helps. Then move on to the next person."],
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
              <Link to="/reports/does-auto-apply-work-report-2026" className="related-card">
                <div className="rc-kicker">Auto-apply</div>
                <div className="rc-title">Does Auto-Apply Work?</div>
              </Link>
              <Link to="/reports/ai-job-matching-report-2026" className="related-card">
                <div className="rc-kicker">Job matching</div>
                <div className="rc-title">AI Job Matching: A Match Score Is Not an Interview</div>
              </Link>
              <Link to="/reports/ai-job-search-tools-2026" className="related-card">
                <div className="rc-kicker">AI tools</div>
                <div className="rc-title">AI Tools for the Job Search: What Actually Helps</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Skip the queue. Reach the person who hires.</h3>
              <p>Studojo finds the hiring manager for the role, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/b2cnew/join?via=report-ai-job-agent-report-2026&how=voice" reloadDocument className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
