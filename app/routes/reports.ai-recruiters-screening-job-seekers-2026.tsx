import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "AI Recruiters Are Screening You Now: What Changes When a Bot Reads Your Application | Studojo" },
    { name: "description", content: "How AI recruiters screen you in 2026: verified data on AI screening, AI recruiter calls and AI interviews, and why the hiring manager's inbox matters more." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "AI recruiter, AI recruiter call, AI screening interview, AI in hiring 2026, are companies using AI to screen resumes, AI interview for jobs" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/ai-recruiters-screening-job-seekers-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "AI Recruiters Are Screening You Now: What Changes When a Bot Reads Your Application" },
    { property: "og:description", content: "Verified data on employers using AI to screen and interview, what it means for you, and the route around the bot: the hiring manager's inbox." },
    { property: "og:url", content: `${BASE_URL}/reports/ai-recruiters-screening-job-seekers-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-28T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "AI Recruiters Are Screening You Now | Studojo" },
    { name: "twitter:description", content: "What changes when a bot reads your application, the verified numbers, and how to reach a human instead." },
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

  // Chart 1: HR areas where AI tools are most common (SHRM, State of AI in HR 2026)
  const shrmEl = document.getElementById("airShrmChart") as HTMLCanvasElement | null;
  if (shrmEl && !shrmEl.dataset.rendered) {
    shrmEl.dataset.rendered = "1";
    new Chart(shrmEl, {
      type: "bar",
      data: {
        labels: ["Recruiting", "HR technology", "Learning and development", "Employee experience"],
        datasets: [{
          label: "HR professionals reporting AI tools in this area (%)",
          data: [27, 21, 17, 14],
          backgroundColor: [VIOLET, VIOLET2, VIOLET3, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of HR professionals` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 30, ticks: { font: { size: 12 }, color: MUTED, callback: (v: any) => `${v}%` } },
        },
      },
    });
  }

  // Chart 2: what job candidates think about AI screening (Gartner, July 2025)
  const trustEl = document.getElementById("airTrustChart") as HTMLCanvasElement | null;
  if (trustEl && !trustEl.dataset.rendered) {
    trustEl.dataset.rendered = "1";
    new Chart(trustEl, {
      type: "bar",
      data: {
        labels: [
          "Believe AI screens their application",
          "Worried AI could fail their application",
          "Trust AI to evaluate them fairly",
          "Trust an employer less if AI evaluates them",
        ],
        datasets: [{
          label: "Share of job candidates (%)",
          data: [52, 32, 26, 25],
          backgroundColor: [VIOLET, ORANGE, RED, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of candidates` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 60, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}%` } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 3: chance a person who can hire you sees your name, by route (editorial rating)
  const routeEl = document.getElementById("airRouteChart") as HTMLCanvasElement | null;
  if (routeEl && !routeEl.dataset.rendered) {
    routeEl.dataset.rendered = "1";
    new Chart(routeEl, {
      type: "bar",
      data: {
        labels: [
          "Bulk auto-apply",
          "Portal application",
          "AI recruiter call or screening interview",
          "Referral",
          "Email to the hiring manager",
        ],
        datasets: [{
          label: "Chance a decision-maker sees you (1 to 5)",
          data: [1, 2, 2, 4, 5],
          backgroundColor: [RED, ORANGE, ORANGE, VIOLET2, GREEN],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}/5 (editorial rating)` } },
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
    q: "What is an AI recruiter?",
    a: "An AI recruiter is software that does a recruiter's early work: reading and ranking applications, messaging candidates, scheduling, or running a first screening call or interview. It shapes which applicants a person looks at next, which is why it matters to you. In SHRM's State of AI in HR 2026 report, recruiting was the HR area where AI tools were most common, reported by 27% of HR professionals.",
  },
  {
    q: "What happens on an AI recruiter call?",
    a: "A voice agent asks screening questions, such as your experience, location, notice period or expected pay, and may book you into the next round. Treat it like a real phone screen: short, direct answers with one specific example. If you are unsure how your answers are used, ask the employer whether a person reviews them.",
  },
  {
    q: "Are companies using AI to screen resumes?",
    a: "Yes, many are. In a ResumeBuilder.com survey of 948 business leaders (October 2024, a vendor survey), about half of companies said they already used AI in hiring, and resume review was the most common use. SHRM's State of AI in HR 2026 report also found recruiting is the HR area where AI tools are used most.",
  },
  {
    q: "How do I do well in an AI interview for a job?",
    a: "Treat it as a real interview: a quiet room, a tested camera and connection, and answers that respond to the exact question with one concrete example each. Do not read a script or paste AI-written answers, because flat, generic answers help no one. Then take the step a screener cannot block: email the hiring manager directly.",
  },
  {
    q: "Is AI in hiring regulated in 2026?",
    a: "Rules vary by country and are tightening. For example, the EU AI Act lists AI systems used to analyse and filter job applications and to evaluate candidates as high-risk (Annex III), which brings extra duties for employers that use them. These rules change, so check the official regulator's site where you live.",
  },
  {
    q: "How do I get past AI screening and reach a human?",
    a: "Apply if the role needs it, then email the hiring manager or team lead directly with a short, personal email from your own address, and follow up once. That email lands in a person's inbox instead of a ranked list. Studojo finds that person, verifies their email, writes a personal email for them and sends it from your own Gmail.",
  },
];

export default function AiRecruitersScreeningReport() {
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
        "headline": "AI Recruiters Are Screening You Now: What Changes When a Bot Reads Your Application",
        "description": "Verified data on employers using AI recruiters to screen and interview candidates, what it means for you, and why reaching the hiring manager's inbox matters more.",
        "url": `${BASE_URL}/reports/ai-recruiters-screening-job-seekers-2026`,
        "datePublished": "2026-10-28T00:00:00Z",
        "dateModified": "2026-10-28T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/ai-recruiters-screening-job-seekers-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "AI Recruiters Report 2026", "item": `${BASE_URL}/reports/ai-recruiters-screening-job-seekers-2026` },
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
              <span>AI Recruiters Report 2026</span>
            </nav>
            <h1>AI Recruiters Are Screening You Now: <em>What Changes When a Bot Reads Your Application</em></h1>
            <p className="rpt-hero-sub">
              An AI recruiter may read your application, call you, or run your first interview
              before any person does. Here is what the verified data says about employers using
              AI to screen, what it changes for you, and the route around the bot: the hiring
              manager's inbox.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Candidate side</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">AI screening, AI calls, AI interviews</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>Recruiting is <strong>where HR uses AI most</strong>: it topped the list in SHRM's State of AI in HR 2026 report, at 27% of HR professionals.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>In a ResumeBuilder.com vendor survey (October 2024), <strong>about half of companies</strong> said they already used AI in hiring, and 68% expected to by the end of 2025.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Candidates do not trust it: <strong>only 26% trust AI to evaluate them fairly</strong> (Gartner, July 2025).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>In our view, when software filters the pile, <strong>the pile gets worse for you</strong>: more applicants using AI, more bots, less human attention per name.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The route around the bot is <strong>a human inbox</strong>: a short, personal email to the hiring manager from your own address. That is what Studojo does.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">27%</div>
              <div className="sc-label">of HR professionals report AI tools in recruiting, the top HR area for AI</div>
              <div className="sc-source">SHRM, State of AI in HR 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">26%</div>
              <div className="sc-label">of job candidates trust AI to evaluate them fairly</div>
              <div className="sc-source">Gartner candidate survey, n=2,918, July 2025</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">66%</div>
              <div className="sc-label">of US adults would not want to apply to an employer that uses AI to help make hiring decisions</div>
              <div className="sc-source">Pew Research Center, April 2023</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">AI in Hiring 2026: What the Data Says</div>
                <div className="sec-sub">Verified numbers only, with the source next to each</div>
              </div>
            </div>
            <p>An AI recruiter is any software that does a recruiter's early work: reading and ranking applications, messaging candidates, scheduling, or running a first screening call or interview. Employers do not always tell you which steps were automated.</p>
            <p>Recruiting is where employers use AI most inside HR. In SHRM's State of AI in HR 2026 report, recruiting topped the list of HR areas using AI tools, at 27% of HR professionals, ahead of HR technology (21%) and learning and development (17%).</p>
            <div className="chart-wrap">
              <div className="chart-label">HR areas where AI tools are most common, % of HR professionals (SHRM, State of AI in HR 2026)</div>
              <div style={{ height: 260 }}>
                <canvas id="airShrmChart" />
              </div>
            </div>
            <p>Vendor numbers run higher. In a ResumeBuilder.com survey of 948 business leaders (October 2024, a vendor survey), about half of companies said they already used AI in hiring and 68% expected to by the end of 2025. The survey reports 82% using AI to review resumes and about 23% using it to conduct interviews.</p>
            <div className="highlight">
              Much of this data comes from US surveys. If you apply through big company portals anywhere, India included, <strong>plan as if software reads your application before a person does</strong>.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">What Candidates Think of Being Screened by AI</div>
                <div className="sec-sub">Low trust, and most people already assume a bot is reading</div>
              </div>
            </div>
            <p>Gartner surveyed 2,918 job candidates in the first quarter of 2025 and published the results in July 2025. Only 26% said they trust AI to evaluate them fairly. 52% said they believe AI screens their application information, 32% worried AI could fail their application, and 25% said they trust an employer less if it uses AI to evaluate them.</p>
            <div className="chart-wrap">
              <div className="chart-label">What job candidates think about AI screening (Gartner survey, n=2,918, published July 2025)</div>
              <div style={{ height: 260 }}>
                <canvas id="airTrustChart" />
              </div>
            </div>
            <p>The distrust is not new. In Pew Research Center's April 2023 survey of US adults, 66% said they would not want to apply for a job with an employer that uses AI to help make hiring decisions.</p>
            <p>Regulators have noticed too. The EU AI Act lists AI systems used to analyse and filter job applications and to evaluate candidates as high-risk (Annex III, point 4(a)), which brings extra duties for employers that use them. These rules are still being phased in, so check the European Commission's AI Act Service Desk for the current position.</p>
            <div className="callout">
              <strong>The honest read:</strong> not liking AI screening does not make it go away. The useful question is what you do about it.
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">The AI Recruiter Call and the AI Screening Interview</div>
                <div className="sec-sub">What to expect, and how to handle an AI interview for a job</div>
              </div>
            </div>
            <p>Two formats show up most. An AI recruiter call, where a voice agent phones you (or you call in) to ask screening questions. And an AI screening interview, where you record answers to questions on screen with no person on the other side, often called a one-way interview.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Treat it as a real interview.</strong> Assume what you say is recorded, and may be scored or reviewed by a person later.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Answer the question asked.</strong> Then give one specific example, with a number if you have one. Long, vague answers help no one.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Have the basics ready.</strong> Notice period, expected pay, cities you will work in, when you can start. These come up early on screening calls.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Check your setup.</strong> Quiet room, stable connection, camera at eye level, and a practice run if one is offered.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Ask before you start.</strong> If you need an adjustment for a disability, connectivity or language, ask the employer first. You can also ask whether a person reviews the answers.</span></div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>What the software may do</th>
                  <th>What it means for you</th>
                  <th>Your move</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Job ad</strong></td>
                  <td>Decides who is shown the post</td>
                  <td>You may not see every role</td>
                  <td><span className="tag-pill pill-blue">Widen</span> Search more than one portal</td>
                </tr>
                <tr>
                  <td><strong>Application</strong></td>
                  <td>Parses, ranks or scores your resume against the post</td>
                  <td>A parsing error can bury you</td>
                  <td><span className="tag-pill pill-amber">Simplify</span> Keep the resume plain and readable</td>
                </tr>
                <tr>
                  <td><strong>AI recruiter call or chatbot</strong></td>
                  <td>Asks screening questions, books slots</td>
                  <td>Short answers, possibly scored</td>
                  <td><span className="tag-pill pill-amber">Prepare</span> Have pay, notice and location ready</td>
                </tr>
                <tr>
                  <td><strong>AI screening interview</strong></td>
                  <td>Records and may score your answers</td>
                  <td>No one to read the room</td>
                  <td><span className="tag-pill pill-amber">Prepare</span> One clear example per answer</td>
                </tr>
                <tr>
                  <td><strong>Hiring manager</strong></td>
                  <td>Nothing: a person decides</td>
                  <td>The one who can say yes</td>
                  <td><span className="tag-pill pill-green">Go direct</span> Email them yourself</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Why the Pile Gets Worse When Software Filters It</div>
                <div className="sec-sub">Bots on both sides, and less human attention per name</div>
              </div>
            </div>
            <p>Candidates use AI too. NBC News (17 November 2024) cited a Capterra figure that 58% of job seekers use AI in their search, and a Huntr survey (Q3 2025, n=527, a vendor survey) put it at 85.6%. Mass-apply bots add volume on top, and an average opening already draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data).</p>
            <p>Employers answer with more filters. Recruiters catch bot applications with hidden instructions planted in job posts, such as asking applicants to include a specific odd word, and by spotting one person applying to dozens of roles at the same company (NBC News, 17 November 2024, quoting recruiter Mike Peditto).</p>
            <p>Our read: volume goes up, filters get tighter, and every real person in the pile gets less attention. Polishing your application for the software helps at the margin. It does not get you out of the pile.</p>
            <div className="pull-quote">
              <p>"When software filters the pile, the pile gets worse for you. The fix is not a better trick for the software. It is a person."</p>
              <span className="pq-source">Studojo's position</span>
            </div>
            <div className="callout">
              <strong>Do not game the screener.</strong> Tricks aimed at the software, like hidden keywords, look bad the moment a person spots them. For what actually helps, read <Link to="/reports/how-to-bypass-ats-2026" style={{ color: "#fff" }}>How to Bypass the ATS</Link>.
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Route Around the Bot: the Hiring Manager's Inbox</div>
                <div className="sec-sub">A person who can hire you, reading one email about their work</div>
              </div>
            </div>
            <p>Studojo's position: you cannot out-apply a filter, so stop trying. Do the portal application if the role needs it, then email the hiring manager or team lead directly with a short, personal, specific email from your own address. Follow up once.</p>
            <p>A recruiter's first resume scan lasts about 6 to 7 seconds (Ladders eye-tracking study, 2018). An email to the person who runs the team never enters the ranking queue. It arrives as a message, not as a row in a ranked list.</p>
            <div className="chart-wrap">
              <div className="chart-label">Chance a person who can hire you sees your name, by route (Studojo editorial rating, 1 to 5)</div>
              <div style={{ height: 280 }}>
                <canvas id="airRouteChart" />
              </div>
            </div>
            <p>We built Studojo for exactly this. Studojo finds the person who can actually hire you (the hiring manager or team lead, not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail.</p>
            <div className="callout">
              <strong>The counts so far:</strong> 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026). Replies are not guaranteed. A person reading your email is still a better shot than a bot ranking your file.
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The AI recruiter questions people ask most, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to deal with a bot in the way</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>You will not avoid AI screening on every application. You can stop depending on it:</p>
            <div className="blist">
              {[
                ["Assume a bot reads first", "On big company portals, plan as if software sees your application before a person does."],
                ["Prepare for the call", "Treat an AI recruiter call or screening interview as a real interview, with one clear example per answer."],
                ["Skip the tricks", "Hidden keywords and pasted AI answers can look worse than a plain, honest application."],
                ["Reach a person", "Email the hiring manager or team lead directly, from your own address, and follow up once."],
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
              <Link to="/reports/ai-career-agent-report-2026" className="related-card">
                <div className="rc-kicker">AI job hunting</div>
                <div className="rc-title">What an AI Career Agent Should Actually Do</div>
              </Link>
              <Link to="/reports/how-to-bypass-ats-2026" className="related-card">
                <div className="rc-kicker">ATS</div>
                <div className="rc-title">How to Bypass the ATS</div>
              </Link>
              <Link to="/reports/ats-resume-report-2026" className="related-card">
                <div className="rc-kicker">Resumes</div>
                <div className="rc-title">How an ATS Actually Reads Your Resume</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Go around the bot.</h3>
              <p>Studojo finds the hiring manager, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
