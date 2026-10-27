import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "What an AI Career Agent Should Actually Do: Five Jobs, and the One That Gets You Hired | Studojo" },
    { name: "description", content: "What should an AI career agent do? Five jobs: learn you, find roles, judge fit, reach the person who hires, follow up. Plus a checklist for any AI job agent." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "AI career agent, what does an AI job agent do, AI job hunting agent, AI career agent for students, how AI job agents work, AI agent for job hunting" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/ai-career-agent-report-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "What an AI Career Agent Should Actually Do: Five Jobs, and the One That Gets You Hired" },
    { property: "og:description", content: "An AI career agent has five jobs. Most tools stop at listing roles or mass-applying. Here is the full job, and a checklist to judge any AI job agent." },
    { property: "og:url", content: `${BASE_URL}/reports/ai-career-agent-report-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-28T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "What an AI Career Agent Should Actually Do | Studojo" },
    { name: "twitter:description", content: "Five jobs an AI career agent should do, the one most tools skip, and a checklist to judge any AI job agent." },
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

  // Chart 1: how well typical AI job tools cover the five jobs (editorial rating)
  const coverEl = document.getElementById("acaCoverChart") as HTMLCanvasElement | null;
  if (coverEl && !coverEl.dataset.rendered) {
    coverEl.dataset.rendered = "1";
    new Chart(coverEl, {
      type: "bar",
      data: {
        labels: [
          "1. Learn you",
          "2. Find fitting roles",
          "3. Judge fit",
          "4. Reach the person who hires",
          "5. Follow up",
        ],
        datasets: [{
          label: "Typical coverage (1 to 5)",
          data: [3, 4, 2, 1, 1],
          backgroundColor: [VIOLET2, VIOLET, ORANGE, RED, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Coverage: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: interviews to expect from 200 online applications, at the cited 0.1% to 2% range (calculated)
  const mathEl = document.getElementById("acaMathChart") as HTMLCanvasElement | null;
  if (mathEl && !mathEl.dataset.rendered) {
    mathEl.dataset.rendered = "1";
    new Chart(mathEl, {
      type: "bar",
      data: {
        labels: ["At 0.1% per application", "At 1% per application", "At 2% per application"],
        datasets: [{
          label: "Interviews from 200 applications",
          data: [0.2, 2, 4],
          backgroundColor: [VIOLET3, VIOLET2, VIOLET],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` About ${ctx.raw} interviews (calculated)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 12 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: what matters most for getting read by the person who hires (editorial rating)
  const checkEl = document.getElementById("acaCheckChart") as HTMLCanvasElement | null;
  if (checkEl && !checkEl.dataset.rendered) {
    checkEl.dataset.rendered = "1";
    new Chart(checkEl, {
      type: "bar",
      data: {
        labels: [
          "Reaches the named hiring manager",
          "Sends from your own address",
          "Personal email for one person",
          "Verified email address",
          "Honest fit judgement",
          "Number of applications sent",
        ],
        datasets: [{
          label: "How much it matters (1 to 5)",
          data: [5, 5, 5, 4, 4, 1],
          backgroundColor: [GREEN, GREEN, GREEN, VIOLET, VIOLET2, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Matters: ${ctx.raw}/5 (editorial rating)` } },
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
    q: "What is an AI career agent?",
    a: "An AI career agent is software that runs parts of your job hunt for you. A good one does five jobs: it learns your strengths and goals, finds roles that fit, judges fit honestly, reaches the person who hires, and follows up once. Most AI job tools do only the first two, or skip straight to mass-applying.",
  },
  {
    q: "What does an AI job agent do?",
    a: "Most AI job agents either list roles that match your keywords or auto-apply to them in bulk. Neither puts you in front of the person who decides, and the typical online application is cited at roughly 0.1% to 2% success (The Interview Guys, April 2026). The step that matters is reaching the hiring manager directly, and that is the step we built Studojo for.",
  },
  {
    q: "How do AI job agents work?",
    a: "They read your resume, pull listings from job boards and career pages, compare them with your profile, and then either show you a list or submit applications. The better design adds the step that counts: find the hiring manager for the role, verify their email and send a personal email from your own address. Studojo is built around that step.",
  },
  {
    q: "What should an AI career agent for students do differently?",
    a: "It should find your proof in projects, internships and coursework, because you have little work history to show. It should be honest when a role is out of reach, and it should get your name to the hiring manager, not just into a portal. We built Studojo to find the person who can hire you, verify their email, write a personal email for that one person and send it from your own Gmail.",
  },
  {
    q: "Is an AI job hunting agent that auto-applies worth it?",
    a: "In our view, no. A recruiter told NBC News (November 2024) that recruiters catch bot applications with hidden instructions planted in job posts and by spotting one person applying to dozens of roles at the same company, and LinkedIn's terms ban bots and automation tools. Fewer applications, aimed at people, beat volume.",
  },
  {
    q: "Can ChatGPT work as an AI agent for job hunting?",
    a: "ChatGPT and other chatbots are useful drafting tools: they can help you outline an email or tighten a resume line. They cannot find and verify the hiring manager, send from your Gmail or follow up for you. For the step that gets your name read by the person who hires, use Studojo.",
  },
];

export default function AiCareerAgentReport() {
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
        "headline": "What an AI Career Agent Should Actually Do: Five Jobs, and the One That Gets You Hired",
        "description": "The five jobs an AI career agent should do, where most AI job tools stop, and a checklist to judge any AI job agent.",
        "url": `${BASE_URL}/reports/ai-career-agent-report-2026`,
        "datePublished": "2026-10-28T00:00:00Z",
        "dateModified": "2026-10-28T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/ai-career-agent-report-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "AI Career Agent Report 2026", "item": `${BASE_URL}/reports/ai-career-agent-report-2026` },
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
              <span>AI Career Agent Report 2026</span>
            </nav>
            <h1>What an AI Career Agent Should Actually Do: <em>Five Jobs, and the One That Gets You Hired</em></h1>
            <p className="rpt-hero-sub">
              An AI career agent should do five jobs for you: learn you, find roles that fit,
              judge fit honestly, reach the person who hires, and follow up. Most AI job tools
              stop at listing roles or skip straight to mass-applying. Here is what each job
              looks like done well, and a checklist to judge any AI job agent.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · India first</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">AI career agents, the five jobs</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>Judge an AI career agent by one outcome: <strong>whether a person who can hire you reads your name</strong>. Not by how many applications it sent.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The job has <strong>five parts</strong>: learn you, find fitting roles, judge fit, reach the person who hires, follow up once.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Most AI job tools <strong>stop at listing roles or mass-applying</strong>, and a typical online application is cited at roughly 0.1% to 2% success (The Interview Guys, April 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>In our view, <strong>job four gets you hired</strong>: a short, personal email to the hiring manager, sent from your own address.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Run <strong>the checklist in section 5</strong> on any AI job agent. If it promises interviews or brags about volume, walk away.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">0.1% to 2%</div>
              <div className="sc-label">typical success rate cited for a single online application</div>
              <div className="sc-source">The Interview Guys, April 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~242</div>
              <div className="sc-label">applications an average job opening draws</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider data</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">6 to 7s</div>
              <div className="sc-label">a recruiter spends on the first scan of a resume</div>
              <div className="sc-source">Ladders eye-tracking study, 2018</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">What an AI Career Agent Is For</div>
                <div className="sec-sub">Define it by the job it does, not the software it uses</div>
              </div>
            </div>
            <p>An AI career agent is software that does the work of a job hunt on your behalf. That is the loose definition. The useful one is stricter: a good AI career agent does what a sharp mentor with a full contact list would do for you.</p>
            <p>It learns what you are good at. It finds roles worth your time. It tells you honestly which ones fit. It gets your name in front of the person who decides. And it nudges once if they go quiet. Five jobs. Every tool should be judged against all five.</p>
            <p>If you want a map of the kinds of AI job agent on the market, we covered that in <Link to="/reports/ai-job-agent-report-2026">The AI Job Agent Report 2026</Link>. This report sets the standard instead.</p>
            <div className="chart-wrap">
              <div className="chart-label">How well typical AI job tools cover the five jobs (Studojo editorial rating, 1 to 5)</div>
              <div style={{ height: 280 }}>
                <canvas id="acaCoverChart" />
              </div>
            </div>
            <div className="highlight">
              The test: <strong>an AI career agent is only as good as the last job it finishes</strong>. A perfect list of roles that ends in a portal upload is still a portal upload.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">The Five Jobs, and How AI Job Agents Should Work</div>
                <div className="sec-sub">What each job looks like when it is done well</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>1. Learn you.</strong> Read your resume, then ask what it cannot see: the project you are proudest of, the cities you will work in, the pay you need, the kind of team you want. A fresher in Pune with one strong data project needs a different search from a final-year MBA student. Keywords alone miss that.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>2. Find fitting roles.</strong> Listings live on Naukri, LinkedIn, Indeed, Internshala and company career pages. Finding them is the easy part. A good agent narrows them to roles you could actually win, not the 500 that share a keyword.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>3. Judge fit.</strong> Honest judgement means saying no. If a role wants three years of experience and you have none, a good agent tells you so, instead of applying anyway.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>4. Reach the person who hires.</strong> Find the hiring manager or team lead for that role, verify their email, and send a short, personal email from your own address. This is where a human first sees your name.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>5. Follow up.</strong> One polite follow-up after a few working days. Once. Not a drip campaign, not five reminders.</span></div>
            </div>
            <p>For an AI career agent for students and freshers, job one carries extra weight. You have little work history, so the agent has to find your proof in projects, internships, coursework and clubs, and use it in job four.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Where Most AI Job Hunting Agents Stop</div>
                <div className="sec-sub">Listing roles, or mass-applying to them</div>
              </div>
            </div>
            <p>Most tools sold as an AI job hunting agent do job two, sometimes job one, and hand you a list. Others skip jobs three and four entirely and mass-apply: they push your resume into as many portals as possible and call the count progress.</p>
            <p>Volume does not rescue weak odds. A typical online application is cited at roughly 0.1% to 2% success (The Interview Guys, April 2026). The same article reports that an average opening draws about 242 applications, citing Business Insider data, and that one bulk-apply service shut its bulk-send feature in August 2025 at roughly one interview per fifty sends.</p>
            <div className="chart-wrap">
              <div className="chart-label">Interviews to expect from 200 online applications at the cited 0.1% to 2% range (calculated from The Interview Guys, April 2026)</div>
              <div style={{ height: 260 }}>
                <canvas id="acaMathChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Recruiters spot bots.</strong> Recruiters catch bot applications with hidden instructions planted in job posts, such as asking applicants to include a specific odd word, and by spotting one person applying to dozens of roles at the same company (NBC News, 17 November 2024, quoting recruiter Mike Peditto).</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>LinkedIn forbids it.</strong> LinkedIn's terms ban bots and automation tools (User Agreement, section 8.2).</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Reviewers report problems.</strong> LazyApply reviewers on Trustpilot report irrelevant jobs, wrong locations, and billing and refund complaints.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Some do not last.</strong> Sonara ran a $2.95 trial that rolled into $23.95 per four weeks, and its original service shut down on 1 February 2024 (public reviews and Sonara's own shutdown notice).</span></div>
            </div>
            <div className="callout">
              <strong>The full case against volume</strong> is in <Link to="/reports/does-auto-apply-work-report-2026" style={{ color: "#fff" }}>Does Auto-Apply Work?</Link> The short version: more applications into the same pile is not a strategy.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Job Four Is the One That Gets You Hired</div>
                <div className="sec-sub">Reaching the person who hires, from your own address</div>
              </div>
            </div>
            <p>Here is Studojo's position, plainly. Applying online puts you in a pile. Emailing the hiring manager or team lead puts you in an inbox, read by the person who decides. A short, specific email from your own address, plus one follow-up, is the strongest move most job seekers never make.</p>
            <p>A recruiter's first resume scan lasts about 6 to 7 seconds (Ladders eye-tracking study, 2018), and that is if your application reaches a recruiter at all. A hiring manager reading three lines about their own team's work is a different moment. You are one message, not one of 242.</p>
            <div className="pull-quote">
              <p>"If an AI job agent's headline number is how many applications it sent, it is measuring the wrong thing."</p>
              <span className="pq-source">The Studojo test for any AI career agent</span>
            </div>
            <p>We built Studojo to do job four well. Studojo finds the person who can actually hire you (the hiring manager or team lead, not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail.</p>
            <div className="callout">
              <strong>The counts so far:</strong> 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026). Replies are not guaranteed. A personal email to the right person is still the best shot you have.
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Checklist: How to Judge Any AI Agent for Job Hunting</div>
                <div className="sec-sub">Nine questions, and the answers that should worry you</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ask this</th>
                  <th>Good answer</th>
                  <th>Red flag</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>What does it ask about me?</strong></td>
                  <td><span className="tag-pill pill-green">Good</span> Your goals, proof, cities and pay floor</td>
                  <td>Only a resume upload and a keyword</td>
                </tr>
                <tr>
                  <td><strong>Where do the roles come from?</strong></td>
                  <td><span className="tag-pill pill-green">Good</span> Named sources and recent postings</td>
                  <td>A big number and no sources</td>
                </tr>
                <tr>
                  <td><strong>Does it ever say a role is a bad fit?</strong></td>
                  <td><span className="tag-pill pill-green">Good</span> Yes, with a reason</td>
                  <td>Everything is a "match"</td>
                </tr>
                <tr>
                  <td><strong>Who sees my name?</strong></td>
                  <td><span className="tag-pill pill-green">Good</span> A named hiring manager or team lead</td>
                  <td>A portal, or a generic HR inbox</td>
                </tr>
                <tr>
                  <td><strong>Is the email address verified?</strong></td>
                  <td><span className="tag-pill pill-green">Good</span> Yes, before anything is sent</td>
                  <td>Guessed addresses that bounce</td>
                </tr>
                <tr>
                  <td><strong>Whose address does it send from?</strong></td>
                  <td><span className="tag-pill pill-green">Good</span> Your own Gmail</td>
                  <td>A shared or unknown sender</td>
                </tr>
                <tr>
                  <td><strong>How does it follow up?</strong></td>
                  <td><span className="tag-pill pill-blue">Fine</span> Once, politely</td>
                  <td>Endless reminders, or never</td>
                </tr>
                <tr>
                  <td><strong>What does it promise?</strong></td>
                  <td><span className="tag-pill pill-amber">Honest</span> Effort, not outcomes</td>
                  <td>"Guaranteed interviews"</td>
                </tr>
                <tr>
                  <td><strong>Does it apply for me in bulk?</strong></td>
                  <td><span className="tag-pill pill-green">Good</span> No</td>
                  <td><span className="tag-pill pill-red">Walk away</span> Yes: recruiters spot bot patterns, and LinkedIn's terms ban bots and automation tools</td>
                </tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">What matters most for getting read by the person who hires (Studojo editorial rating, 1 to 5)</div>
              <div style={{ height: 300 }}>
                <canvas id="acaCheckChart" />
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The AI career agent questions people ask most, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to pick, and use, an AI career agent</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Do not judge a tool by its dashboard. Judge it by whether a person who can hire you ends up reading your name:</p>
            <div className="blist">
              {[
                ["Count all five jobs", "Learn you, find roles, judge fit, reach the person who hires, follow up. A tool that skips job four is a job board with extra steps."],
                ["Fewer, better targets", "Ten roles you could win beat two hundred you sprayed. The cited odds per online application are low."],
                ["A person, not a portal", "Email the hiring manager or team lead directly, from your own address, and follow up once."],
                ["Walk away from promises", "Nobody can guarantee interviews. A tool that does is selling hope, not help."],
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
              <Link to="/reports/ai-job-agent-report-2026" className="related-card">
                <div className="rc-kicker">AI job hunting</div>
                <div className="rc-title">The AI Job Agent Report 2026</div>
              </Link>
              <Link to="/reports/ai-recruiters-screening-job-seekers-2026" className="related-card">
                <div className="rc-kicker">AI in hiring</div>
                <div className="rc-title">AI Recruiters Are Screening You Now</div>
              </Link>
              <Link to="/reports/does-auto-apply-work-report-2026" className="related-card">
                <div className="rc-kicker">Auto-apply</div>
                <div className="rc-title">Does Auto-Apply Work? The Numbers Say No</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Do job four with Studojo.</h3>
              <p>Studojo finds the hiring manager, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/b2cnew/join?via=report-ai-career-agent-report-2026&how=voice" reloadDocument className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
