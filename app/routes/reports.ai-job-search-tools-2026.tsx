import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "AI Tools for the Job Search 2026: What Actually Helps, and What Gets You Caught | Studojo" },
    { name: "description", content: "Where AI genuinely helps a job search, where it backfires, whether recruiters can tell, and the workflow that uses AI as a drafting layer without letting it invent facts about you." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "ai tools for job search 2026, chatgpt resume, ai cover letter, can recruiters tell if i used ai, ai job application, best ai tools job search, auto apply bots, ai interview prep" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/ai-job-search-tools-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "AI Tools for the Job Search 2026: What Actually Helps, and What Gets You Caught" },
    { property: "og:description", content: "Where AI helps a job search, where it backfires, whether recruiters can tell, and the workflow that keeps AI from inventing facts about you." },
    { property: "og:url", content: `${BASE_URL}/reports/ai-job-search-tools-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-12T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "AI Tools for the Job Search 2026 | Studojo" },
    { name: "twitter:description", content: "Use AI to draft. Never let it invent a fact about you. What helps, what backfires, and whether recruiters can tell." },
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
  const RED = "#ef4444";
  const GREEN = "#10b981";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: where AI helps versus hurts, by task (illustrative editorial scores)
  const helpEl = document.getElementById("helpHurtChart") as HTMLCanvasElement | null;
  if (helpEl && !helpEl.dataset.rendered) {
    helpEl.dataset.rendered = "1";
    new Chart(helpEl, {
      type: "bar",
      data: {
        labels: [
          "Tailoring a resume to a post",
          "First draft of outreach",
          "Mock interview practice",
          "Company research",
          "Mapping skill gaps",
          "Cover letter first draft",
          "Writing your experience",
          "Mass auto-apply",
        ],
        datasets: [
          {
            label: "Helps when used well (1-5)",
            data: [5, 4, 5, 4, 4, 3, 1, 1],
            backgroundColor: GREEN,
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            label: "Backfire risk (1-5)",
            data: [2, 2, 1, 2, 1, 4, 5, 5],
            backgroundColor: RED,
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

  // Chart 2: adoption split (illustrative)
  const adoptEl = document.getElementById("adoptChart") as HTMLCanvasElement | null;
  if (adoptEl && !adoptEl.dataset.rendered) {
    adoptEl.dataset.rendered = "1";
    new Chart(adoptEl, {
      type: "doughnut",
      data: {
        labels: [
          "Use AI as a drafting aid and edit it",
          "Paste AI output with little editing",
          "Do not use AI in applications",
        ],
        datasets: [{
          data: [35, 20, 45],
          backgroundColor: [GREEN, RED, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw}% of job seekers (illustrative)` } },
        },
      },
    });
  }

  // Chart 3: time saved by task, minutes per application (illustrative)
  const timeEl = document.getElementById("timeChart") as HTMLCanvasElement | null;
  if (timeEl && !timeEl.dataset.rendered) {
    timeEl.dataset.rendered = "1";
    new Chart(timeEl, {
      type: "bar",
      data: {
        labels: ["Resume tailoring", "Cover letter draft", "Outreach message", "Company research", "Interview prep"],
        datasets: [{
          label: "Minutes saved (illustrative)",
          data: [20, 15, 10, 25, 30],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET2, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw} min saved (illustrative)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 35, ticks: { font: { size: 12 }, color: MUTED } },
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
    q: "Can recruiters tell if I used AI on my resume or cover letter?",
    a: "Sometimes, but not because of a detector. AI detectors are unreliable and recruiters should not trust them either. What humans spot is sameness: the same stock phrases, the same polished but empty structure, and claims that fall apart when one interview question probes them. If you can speak to every line on your page, it hardly matters how the first draft started.",
  },
  {
    q: "Should I use ChatGPT to write my cover letter?",
    a: "Use it for a first draft, not the final letter. Give it the job post and your real experience, then rewrite in your own voice and add the specifics only you know. A letter pasted straight from AI tends to read like everyone else's and can ring false.",
  },
  {
    q: "Are auto-apply bots worth it?",
    a: "No. They flood employers with generic applications, often answer screening questions wrongly, and attach your name to roles you never read. Ten tailored applications and a few direct messages beat hundreds of bot sends, and they do not put your reputation at risk.",
  },
  {
    q: "Will using AI get my application rejected?",
    a: "Not by itself. Most employers do not auto-reject for using AI, and many expect candidates to use it. Applications get rejected for being generic, inaccurate or unsupported by the candidate in an interview. Edit the draft, verify every claim and you avoid the real risk.",
  },
  {
    q: "What AI tools actually help a job search?",
    a: "Think in tasks, not brands. A general chat assistant works for tailoring a resume to a job post, drafting outreach and mock interviews. A research assistant helps with fast company research. A resume editor with parsing checks helps with format. Pick whatever you already trust and apply the same rule: AI drafts, you verify.",
  },
  {
    q: "Is it cheating to use AI in a job application?",
    a: "Generally no, if the content is true and the work is yours. Using AI to draft, tidy and tailor is like using a spell checker or a friend who edits. It crosses the line when it invents experience, or when an employer explicitly bans it for a specific step such as an assessment. Read the instructions, then be honest.",
  },
];

export default function AIJobSearchToolsReport() {
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
        "headline": "AI Tools for the Job Search 2026: What Actually Helps, and What Gets You Caught",
        "description": "Where AI helps a job search, where it backfires, whether recruiters can tell, and the workflow that uses AI as a drafting layer.",
        "url": `${BASE_URL}/reports/ai-job-search-tools-2026`,
        "datePublished": "2026-10-12T00:00:00Z",
        "dateModified": "2026-10-12T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/ai-job-search-tools-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "AI Tools for the Job Search 2026", "item": `${BASE_URL}/reports/ai-job-search-tools-2026` },
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
              <span>AI Tools for the Job Search 2026</span>
            </nav>
            <h1>AI in Your Job Search: <em>What Helps, What Backfires</em></h1>
            <p className="rpt-hero-sub">
              AI can save you hours on a job search. It can also make you sound like
              everyone else, or put claims on your resume you cannot defend. This report
              covers where AI genuinely helps, where it hurts, and the workflow that uses it
              as a drafting layer while you stay the source of truth.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Tools, workflow, limits</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>Treat AI as a <strong>drafting and reasoning layer</strong>, not a source of truth about you. It is good at structure and wording. It knows nothing about your real experience.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>It genuinely helps with <strong>tailoring a resume to a specific job post</strong>, first drafts of cover letters and outreach, mock interviews and feedback, fast company research, and mapping your skill gaps.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>It backfires through <strong>generic AI paste</strong> that reads identical to everyone else, hallucinated experience you cannot defend, mass auto-apply bots that flood employers and damage your name, and cover letters so polished they ring false.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The one rule: <strong>never let AI invent a fact about you</strong>. Every date, number, tool and claim has to be something you can explain out loud.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The workflow that wins: <strong>AI drafts, you edit, verify and add the specifics only you know</strong>. That is where the speed comes from and where your voice comes back.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">~1 in 2</div>
              <div className="sc-label">job seekers reported using AI tools somewhere in their applications</div>
              <div className="sc-source">2025 survey (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">Most</div>
              <div className="sc-label">recruiters reported being wary of, or able to spot, generic AI-written applications</div>
              <div className="sc-source">Recruiter survey (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~20 min</div>
              <div className="sc-label">saved per tailored application when AI drafts the first version and you edit it</div>
              <div className="sc-source">Illustrative</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Where AI Genuinely Helps</div>
                <div className="sec-sub">Tasks where it saves time and your facts stay yours</div>
              </div>
            </div>
            <p>AI is strongest when you hand it real material and ask it to reshape that material. A job post, your resume, a company page. It is weakest when you ask it to supply the material itself.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Tailoring a resume to a specific post:</strong> it spots which of your real experiences match the language of the role and suggests how to word them. Works because the facts come from you.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>First drafts of cover letters and outreach:</strong> a blank page is the slowest part. A rough draft gives you something to cut, correct and make human.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Mock interviews and feedback:</strong> it asks the questions the role is likely to bring up and tells you where your answer was vague. Low stakes, repeatable, available at midnight.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Fast company research:</strong> summarise what a company does, who it sells to and what changed recently, so your message is specific. Check anything that matters against the source.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Mapping your skill gaps:</strong> paste five job posts for the role you want and ask what keeps repeating. It turns a vague feeling into a short list to learn.</span></div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">Where AI helps versus where it hurts, by task (illustrative editorial scores)</div>
              <div style={{ height: 360 }}>
                <canvas id="helpHurtChart" />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Where It Backfires</div>
                <div className="sec-sub">Auto-apply bots, hallucination, sameness and the detector trap</div>
              </div>
            </div>
            <p>Most AI job search damage comes from one habit: letting the tool do the part only you can do. Here is how it goes wrong.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Auto-apply bots:</strong> they send hundreds of generic applications, answer screening questions on your behalf and put your name on roles you never read. Employers notice the flood, and a wrong answer on a knockout question can end an application automatically.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Hallucination:</strong> ask for a stronger bullet and AI may add a metric, a tool or a team size that never existed. If it lands on your resume, you now have to defend it in an interview.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Sameness:</strong> a hundred candidates feeding the same prompt to the same tool produce the same opening line, the same adjectives and the same structure. Stock phrases are what recruiters learn to skim past.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The detector trap:</strong> do not run your text through an AI detector and trust the score. They are unreliable in both directions, so a pass proves nothing and a fail does not either. Judge your draft like a reader would: does it sound like you, and is it true?</span></div>
            </div>
            <div className="chart-two">
              <div>
                <div className="chart-label">How job seekers use AI (illustrative split)</div>
                <div style={{ height: 240 }}>
                  <canvas id="adoptChart" />
                </div>
              </div>
              <div>
                <div className="chart-label">Time saved per application, by task (illustrative)</div>
                <div style={{ height: 240 }}>
                  <canvas id="timeChart" />
                </div>
              </div>
            </div>
            <div className="callout">
              <strong>The pattern:</strong> the time AI saves is real, but only when you spend part of it back on editing. Skip the edit and the saving turns into a cost.
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">The Right Workflow: AI Drafts, You Edit and Verify</div>
                <div className="sec-sub">Task by task, good use versus bad use</div>
              </div>
            </div>
            <p>The workflow is four steps. Give the AI your real material. Ask for a draft. Edit it in your voice. Check every claim against what actually happened. Then add the detail only you would know: the number, the name, the thing that went wrong and how you fixed it.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Good use</th>
                  <th>Bad use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Resume</strong></td>
                  <td><span className="tag-pill pill-green">Good</span> Reword your real bullets to match the job post</td>
                  <td><span className="tag-pill pill-red">Bad</span> Ask it to add experience or metrics you do not have</td>
                </tr>
                <tr>
                  <td><strong>Cover letter</strong></td>
                  <td><span className="tag-pill pill-green">Good</span> Draft a structure, then rewrite it in your voice</td>
                  <td><span className="tag-pill pill-red">Bad</span> Send the first output unedited</td>
                </tr>
                <tr>
                  <td><strong>Outreach</strong></td>
                  <td><span className="tag-pill pill-green">Good</span> Draft a short note around one real detail about the person</td>
                  <td><span className="tag-pill pill-red">Bad</span> Mass-send identical messages</td>
                </tr>
                <tr>
                  <td><strong>Interview prep</strong></td>
                  <td><span className="tag-pill pill-green">Good</span> Practise answers and get feedback on clarity</td>
                  <td><span className="tag-pill pill-amber">Careful</span> Memorise a scripted answer that is not yours</td>
                </tr>
                <tr>
                  <td><strong>Company research</strong></td>
                  <td><span className="tag-pill pill-green">Good</span> Summarise, then verify the key facts at the source</td>
                  <td><span className="tag-pill pill-amber">Careful</span> Quote a detail you never checked</td>
                </tr>
                <tr>
                  <td><strong>Applying</strong></td>
                  <td><span className="tag-pill pill-green">Good</span> Shortlist roles worth your time</td>
                  <td><span className="tag-pill pill-red">Bad</span> Let a bot submit for you</td>
                </tr>
              </tbody>
            </table>
            <div className="highlight">
              The one-minute check: read every line of your resume and ask, could I talk about this for two minutes if the interviewer picked it? If not, cut it or make it true.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Can Recruiters Tell?</div>
                <div className="sec-sub">Honest answer: not the way people think</div>
              </div>
            </div>
            <p>AI detectors are unreliable. They flag human writing and miss AI writing, so neither a clean score nor a flagged one should be trusted, by you or by an employer. If a recruiter tells you they use one to reject people, that is a weak process, not proof of anything.</p>
            <p>What humans do notice is sameness. The same confident opening. The same list of three adjectives. A letter with no detail that could only come from you. They also notice when a fact collapses under one interview question.</p>
            <div className="pull-quote">
              <p>"The real tell is a candidate who cannot speak to what is on their own page."</p>
              <span className="pq-source">Studojo Research</span>
            </div>
            <p>So the test is not whether you used AI. It is whether you can explain, in your own words, every claim you made. If you can, the draft history does not matter. If you cannot, no tool will save you in the room.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">A Simple AI Stack, by Task</div>
                <div className="sec-sub">Categories, not brands. Use what you already trust</div>
              </div>
            </div>
            <p>You do not need a dozen subscriptions. You need one tool per job, and the same rule for all of them.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Resume tailoring:</strong> a general chat assistant plus the job post and your real resume. Ask it to match wording, never to add facts.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Mock interview:</strong> a chat assistant set up to interview you for a named role, one question at a time, and score your answers for clarity and specifics.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Company research:</strong> a search-connected assistant that cites sources, so you can click through and verify before you quote anything.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Outreach drafting:</strong> a short drafting prompt with one real detail about the recipient. Keep it under a few lines and rewrite it so it sounds like you.</span></div>
            </div>
            <div className="highlight">
              The rule, restated: <strong>never let AI invent a fact about you.</strong> It can word things, order things and ask you questions. The facts come from you.
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The AI job search questions students ask most, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to use AI without paying for it later</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>AI is a fast first draft, not a substitute for knowing your own story. Use it to move quicker, then put your time where it counts:</p>
            <div className="blist">
              {[
                ["Draft with AI, finish as yourself", "Let it produce the first version. Then cut the stock phrases and add the detail only you would know."],
                ["Verify every claim", "If you cannot explain a line in an interview, it does not belong on the page."],
                ["Skip the auto-apply bots", "A few tailored applications and direct messages beat hundreds of bot sends and protect your name."],
                ["Use it to practise, not to perform", "Mock interviews and feedback are where AI helps most. Practise out loud until the answers are yours."],
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
              <Link to="/reports/skills-ai-entry-level-2026" className="related-card">
                <div className="rc-kicker">AI careers</div>
                <div className="rc-title">Breaking Into AI in 2026: Skills, Roles and Reality</div>
              </Link>
              <Link to="/reports/ai-interns-using-ai-wont-replace-interns-2026" className="related-card">
                <div className="rc-kicker">AI and work</div>
                <div className="rc-title">Interns Using AI Will Replace Interns Who Do Not</div>
              </Link>
              <Link to="/reports/linkedin-profile-2026" className="related-card">
                <div className="rc-kicker">Profiles</div>
                <div className="rc-title">What Hiring Managers Actually Look At on LinkedIn</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Point AI at the right roles.</h3>
              <p>Studojo uses AI to find roles that fit you and draft real outreach you can stand behind, so the speed is real and the words are still yours.</p>
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
