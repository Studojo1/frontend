import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "AI Job Matching in 2026: A Match Score Is Not an Interview | Studojo" },
    { name: "description", content: "How AI job matching works, from resume parsing to match scores, what a score is good for, and why a 92% match still joins a queue of about 242 applications." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "AI job matching, AI job matching platform, AI job match, resume job match AI, job matching algorithm, AI job matcher, match my resume to jobs" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/ai-job-matching-report-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "AI Job Matching in 2026: A Match Score Is Not an Interview" },
    { property: "og:description", content: "Inside the job matching algorithm: parsing, keywords, embeddings and scores. What a match is good for, and why the better match is a person, not a posting." },
    { property: "og:url", content: `${BASE_URL}/reports/ai-job-matching-report-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-27T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The AI Job Matching Report 2026 | Studojo" },
    { name: "twitter:description", content: "A 92% match still lands in a queue of about 242 applications. How matching works, and what to do instead." },
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

  // Chart 1: what each matching method picks up (editorial rating)
  const methodEl = document.getElementById("ajmMethodChart") as HTMLCanvasElement | null;
  if (methodEl && !methodEl.dataset.rendered) {
    methodEl.dataset.rendered = "1";
    new Chart(methodEl, {
      type: "bar",
      data: {
        labels: ["Keyword matching", "Embedding similarity", "Rules and filters", "Blended score"],
        datasets: [
          {
            label: "Catches the exact skills a post names",
            data: [5, 3, 2, 4],
            backgroundColor: ORANGE,
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            label: "Spots related experience in other words",
            data: [1, 5, 1, 4],
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

  // Chart 2: one application among about 242 for an average opening
  const queueEl = document.getElementById("ajmQueueChart") as HTMLCanvasElement | null;
  if (queueEl && !queueEl.dataset.rendered) {
    queueEl.dataset.rendered = "1";
    new Chart(queueEl, {
      type: "doughnut",
      data: {
        labels: ["Your 92% match", "Every other application for the same opening"],
        datasets: [{
          data: [1, 241],
          backgroundColor: [VIOLET, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} of about 242` } },
        },
      },
    });
  }

  // Chart 3: how likely a person who can hire reads it (editorial rating)
  const personEl = document.getElementById("ajmPersonChart") as HTMLCanvasElement | null;
  if (personEl && !personEl.dataset.rendered) {
    personEl.dataset.rendered = "1";
    new Chart(personEl, {
      type: "bar",
      data: {
        labels: [
          "Bulk applications to every match",
          "Application to a 92% match",
          "Email to a generic HR inbox",
          "Tailored application to a 92% match",
          "Personal email to the hiring manager",
        ],
        datasets: [{
          label: "Chance a person who can hire reads it (1-5)",
          data: [1, 2, 2, 3, 5],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Read by a person who can hire: ${ctx.raw}/5` } },
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
    q: "How does AI job matching work?",
    a: "Most AI job matchers parse your resume into fields such as skills, titles and education, then compare it with each posting. The comparison is usually keyword overlap, meaning-based similarity from embeddings, or a blend of both, plus hard filters like location and experience. The result is a match score that ranks jobs for you.",
  },
  {
    q: "Are AI job match scores accurate?",
    a: "They are a fair guide to how much your resume overlaps with a posting, and not much more. The score cannot see who else applied, what the hiring manager actually wants, or whether the role has changed since it was posted. Treat it as a shortlisting tool, not a forecast.",
  },
  {
    q: "Does a high match score mean I will get an interview?",
    a: "No. A 92% match still goes into the same queue as everyone else, and an average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data). The score helps you choose where to aim, and reaching the person who hires is the step that gets you out of the queue.",
  },
  {
    q: "How do I match my resume to jobs?",
    a: "Use a matcher to shortlist roles where your skills genuinely overlap, then read each posting yourself. Rewrite your resume to show real evidence for the two or three things the role cares about most, in their words where that is true. Do not stuff keywords: a recruiter's first scan takes about 6 to 7 seconds (Ladders, 2018), and stuffing reads badly.",
  },
  {
    q: "What is the best AI job matching platform?",
    a: "The best match is a match to a person, not a posting. We built Studojo to match you with the hiring manager for the role, verify their email, write a personal email for that one person and send it from your own Gmail. 4,000+ students have been matched with hiring managers so far (Studojo's own records, September 2026).",
  },
  {
    q: "Should I apply to every job with a high match score?",
    a: "No. Applying to every high match is how auto-apply tools work, and an online application is cited at roughly 0.1% to 2% success (The Interview Guys, April 2026). Pick the few roles you want most, email the hiring manager for each one with a short, personal note, and follow up once.",
  },
];

export default function AiJobMatchingReport() {
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
        "headline": "AI Job Matching in 2026: A Match Score Is Not an Interview",
        "description": "How AI job matching works, what a match score is good for, and why the better match is the hiring manager, not the posting.",
        "url": `${BASE_URL}/reports/ai-job-matching-report-2026`,
        "datePublished": "2026-10-27T00:00:00Z",
        "dateModified": "2026-10-27T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/ai-job-matching-report-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "AI Job Matching Report 2026", "item": `${BASE_URL}/reports/ai-job-matching-report-2026` },
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
              <span>AI Job Matching Report 2026</span>
            </nav>
            <h1>AI Job Matching in 2026: <em>A Match Score Is Not an Interview</em></h1>
            <p className="rpt-hero-sub">
              Upload a resume, get a list of jobs with a percentage next to each one. It feels
              like progress. This report explains how AI job matching scores you, what the
              number is good for, and why a 92% match still puts you in a queue of about 242
              applications.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Students and freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">AI job matching, match scores, hiring managers</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>AI job matchers <strong>parse your resume, compare it with a posting and output a score</strong>, built from keyword overlap, meaning-based (embedding) similarity, or a blend of both.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>A match score is <strong>useful for shortlisting where to aim</strong>. It is not a prediction that anyone will read your application.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>A high score <strong>still ends at the apply button</strong>, where an average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Keyword stuffing <strong>helps the software, not the reader</strong>. A recruiter's first resume scan takes about 6 to 7 seconds (Ladders, 2018).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The better match is <strong>to a person, not a posting</strong>. Studojo matches you with the hiring manager for the role and emails them from your own Gmail: 4,000+ matched with hiring managers (Studojo's own records, September 2026).</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">~242</div>
              <div className="sc-label">applications an average job opening draws, whatever your match score</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">0.1 to 2%</div>
              <div className="sc-label">typical success rate cited for a single online application</div>
              <div className="sc-source">The Interview Guys, April 2026 (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">4,000+</div>
              <div className="sc-label">students matched with hiring managers through Studojo</div>
              <div className="sc-source">Studojo's own records, September 2026</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">How AI Job Matching Works</div>
                <div className="sec-sub">Inside a typical job matching algorithm</div>
              </div>
            </div>
            <p>Every AI job matcher, whether it sits inside a job board or runs as its own AI job matching platform, follows roughly the same four steps.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>1. Parse.</strong> It reads your resume and turns it into fields: titles, skills, education, dates and location. Columns, tables and text inside images can break this step.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>2. Compare.</strong> It checks those fields against each posting. Simpler systems count shared keywords. Newer ones use embeddings, which turn text into numbers so that similar meanings sit close together, so "built a sales dashboard" can match "data visualisation".</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>3. Filter.</strong> Hard rules drop roles on location, years of experience, work authorisation or pay.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>4. Score and rank.</strong> The signals are blended into one number, a percentage or a label like "strong match", and your jobs are sorted by it.</span></div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>How it scores you</th>
                  <th>Good at</th>
                  <th>Blind to</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Keyword matching</strong></td>
                  <td>Counts the terms your resume shares with the post</td>
                  <td>Exact tools and skills, such as SQL, Excel or Python</td>
                  <td>The same skill described in different words</td>
                </tr>
                <tr>
                  <td><strong>Embedding similarity</strong></td>
                  <td>Compares meaning, not exact words</td>
                  <td>Related experience and synonyms</td>
                  <td>Whether that experience is real, recent or any good</td>
                </tr>
                <tr>
                  <td><strong>Rules and filters</strong></td>
                  <td>Pass or fail on location, years, authorisation</td>
                  <td>Removing roles you cannot take</td>
                  <td>Everything about how good you are</td>
                </tr>
                <tr>
                  <td><strong>Blended score</strong></td>
                  <td>Mixes the three into one percentage</td>
                  <td>A quick ranked shortlist</td>
                  <td>Who else applied, and what the hiring manager wants</td>
                </tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">What each matching method picks up, 1 to 5 (Studojo editorial rating)</div>
              <div style={{ height: 280 }}>
                <canvas id="ajmMethodChart" />
              </div>
            </div>
            <p>That is the whole job matching algorithm, give or take. It is clever pattern matching between two documents. Keep that in mind when a number on a screen starts to feel like a verdict.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">What a Match Score Is Good For</div>
                <div className="sec-sub">Shortlisting where to aim, and not much more</div>
              </div>
            </div>
            <p>Used well, resume job match AI saves you real time. It is a good first filter, and it is fine to lean on it for that.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Shortlisting.</strong> Out of a long list of postings, it surfaces the ones that genuinely fit your background, so you stop scrolling.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Spotting gaps.</strong> If every role you want asks for SQL and your score keeps dropping on it, that is a skill to build, not a word to paste in.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Ruling roles out.</strong> A low score on the basics (location, required years, work authorisation) saves you an application that had little chance.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Learning the language.</strong> It shows which words a role uses, so you can describe your real work in their terms.</span></div>
            </div>
            <div className="highlight">
              A match score measures how much your resume overlaps with a posting. <strong>It does not measure whether anyone will read your application.</strong>
            </div>
            <p>You will also see the claim that 75% of resumes are rejected by an ATS before a human sees them. That number has no published source behind it. Treat it as a myth, and do not let it scare you into stuffing keywords.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">What the Score Cannot See</div>
                <div className="sec-sub">A posting does not hire anyone</div>
              </div>
            </div>
            <p>A match score compares two documents: your resume and a job description. Everything outside those two documents is invisible to it, and that is where most hiring decisions get made.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>What the match score sees</th>
                  <th>What the hiring manager actually weighs</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Skills listed on your resume</td>
                  <td>Whether you can do the work this team needs right now</td>
                </tr>
                <tr>
                  <td>Job titles and years</td>
                  <td>What you actually built, shipped or fixed</td>
                </tr>
                <tr>
                  <td>Keywords from the posting</td>
                  <td>Whether you understand what the team works on</td>
                </tr>
                <tr>
                  <td>Your resume, on its own</td>
                  <td>Who else is in the running, and who reached out directly</td>
                </tr>
                <tr>
                  <td>The posting as written</td>
                  <td>What the role has turned into since it was posted</td>
                </tr>
              </tbody>
            </table>
            <p>That is the gap. The score can tell you a role fits your resume. Only the hiring manager decides whether you fit the team.</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Why a 92% Match Still Lands You in a Queue</div>
                <div className="sec-sub">The score sorts your list. The queue stays the same.</div>
              </div>
            </div>
            <p>Once you press apply, your 92% match joins everyone else. An average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data), and the typical success rate of an online application is cited at roughly 0.1% to 2% (same source).</p>
            <div className="chart-wrap">
              <div className="chart-label">Your application among about 242 for an average opening (based on The Interview Guys, April 2026)</div>
              <div style={{ height: 260 }}>
                <canvas id="ajmQueueChart" />
              </div>
            </div>
            <p>You are also not the only one with AI help: 85.6% of job seekers say they use AI tools (Huntr survey, Q3 2025, n=527; a vendor survey). When a recruiter finally opens your resume, the first scan takes about 6 to 7 seconds (Ladders eye-tracking study, 2018). Keyword stuffing may lift your score, but a person reads in those seconds, and stuffed resumes read badly.</p>
            <div className="callout">
              <strong>The trap:</strong> a high score feels like permission to apply to everything above 80%. That is how auto-apply tools work, and it turns a useful shortlist into spray-and-pray. Pick fewer roles and do more for each one.
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Match to a Person, Not a Posting</div>
                <div className="sec-sub">The match that actually matters</div>
              </div>
            </div>
            <p>A posting is a page. The hiring manager or team lead is the person who decides, whether the role is at a Bengaluru startup or a global firm. The match worth having is between you and that person: someone whose team needs what you can do.</p>
            <p>That is why Studojo works differently. Studojo matches you with the hiring manager for the role (the person who can actually hire you, not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail.</p>
            <div className="chart-wrap">
              <div className="chart-label">Chance a person who can hire reads it, 1 to 5 (Studojo editorial rating)</div>
              <div style={{ height: 280 }}>
                <canvas id="ajmPersonChart" />
              </div>
            </div>
            <div className="highlight">
              8,500+ students signed up, <strong>4,000+ matched with hiring managers</strong> and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026). Replies are not guaranteed. The difference is that your email lands with a person, not in a queue.
            </div>
            <div className="pull-quote">
              <p>"A posting cannot hire you. A person can. Match to the person."</p>
              <span className="pq-source">The Studojo rule for job matching</span>
            </div>
            <p>What works is a short, personal, specific email to the person who hires, from your own address, and one polite follow-up if you hear nothing. Studojo does the finding, the verifying and the writing for you.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The AI job matching questions people ask most, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>From match score to a person, in five steps</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Keep the matcher. Change what you do after it:</p>
            <div className="blist">
              {[
                ["Shortlist with the score", "Keep the roles where the overlap is real and the basics (location, years, work authorisation) fit."],
                ["Read the posting yourself", "Find the two or three things the team clearly cares about most."],
                ["Fix real gaps, not keywords", "Show evidence for those things on your resume, in their words where it is true."],
                ["Find the hiring manager", "The person who leads the team you would join. Studojo finds them and verifies their email for you."],
                ["Email them, then follow up once", "A short, personal note from your own address about their work and what you can do for the team."],
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
                <div className="rc-kicker">AI agents</div>
                <div className="rc-title">AI Job Agents: What They Do, and Why Most Do Not Get You Hired</div>
              </Link>
              <Link to="/reports/email-hiring-manager-vs-applying-2026" className="related-card">
                <div className="rc-kicker">Hiring managers</div>
                <div className="rc-title">Emailing the Hiring Manager vs Applying Online</div>
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
              <h3>Get matched with the person who hires.</h3>
              <p>Studojo matches you with the hiring manager for the role, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/b2cnew/join?via=report-ai-job-matching-report-2026&how=voice" reloadDocument className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
