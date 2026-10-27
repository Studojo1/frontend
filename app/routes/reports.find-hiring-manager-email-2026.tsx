import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How to Find a Hiring Manager's Email in 2026: The Manual Way and the Fast Way | Studojo" },
    { name: "description", content: "How to find a hiring manager's email: find who leads the team, work out the company email format, check it before you send, or let Studojo do it." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "find hiring manager email, how to find hiring manager for a job, how to find hiring manager email address, who is the hiring manager, how to find a recruiter's email, find hiring manager on LinkedIn, company email format" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/find-hiring-manager-email-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How to Find a Hiring Manager's Email: The Manual Way, and the Fast Way" },
    { property: "og:description", content: "Find the person who leads the team, work out the company's email format, check the address before you send. Or let Studojo do all of it for you." },
    { property: "og:url", content: `${BASE_URL}/reports/find-hiring-manager-email-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-27T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How to Find a Hiring Manager's Email (2026) | Studojo" },
    { name: "twitter:description", content: "The manual method, step by step, why guessed addresses hurt you, and the fast way to reach the person who can actually hire you." },
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

  // Chart 1: who to email, by how close they sit to the hiring decision (editorial rating)
  const whoEl = document.getElementById("fhmWhoChart") as HTMLCanvasElement | null;
  if (whoEl && !whoEl.dataset.rendered) {
    whoEl.dataset.rendered = "1";
    new Chart(whoEl, {
      type: "bar",
      data: {
        labels: [
          "Team lead / hiring manager",
          "Founder (small startup)",
          "Recruiter on this role",
          "Senior person on the team",
          "Generic HR inbox",
          "careers@ or jobs@ address",
        ],
        datasets: [{
          label: "Closeness to the decision (1-5)",
          data: [5, 5, 4, 3, 1, 1],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET3, RED, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Closeness: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: bounce risk by how you got the address (editorial rating)
  const riskEl = document.getElementById("fhmRiskChart") as HTMLCanvasElement | null;
  if (riskEl && !riskEl.dataset.rendered) {
    riskEl.dataset.rendered = "1";
    new Chart(riskEl, {
      type: "bar",
      data: {
        labels: ["Pure guess", "Pattern from 1 public address", "Pattern seen several times", "Published by the person", "Verified before sending"],
        datasets: [{
          label: "Bounce risk (1-5)",
          data: [5, 3, 2, 1, 1],
          backgroundColor: [RED, ORANGE, VIOLET2, GREEN, GREEN],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` Bounce risk: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 12 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: effort per step of the manual method (editorial rating)
  const effortEl = document.getElementById("fhmEffortChart") as HTMLCanvasElement | null;
  if (effortEl && !effortEl.dataset.rendered) {
    effortEl.dataset.rendered = "1";
    new Chart(effortEl, {
      type: "bar",
      data: {
        labels: ["Read the job post", "Find the team lead", "Confirm they are current", "Work out the format", "Check the address", "Write a personal email"],
        datasets: [{
          label: "Effort per person (1-5)",
          data: [1, 3, 3, 4, 5, 4],
          backgroundColor: [GREEN, VIOLET2, VIOLET2, ORANGE, RED, ORANGE],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` Effort: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 12 }, color: MUTED } },
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
    q: "How do I find the hiring manager for a job?",
    a: "Start with the job post: it tells you the team and often the level the role reports to. Then search LinkedIn for people at that company who currently lead that team, and check the company's team page, blog and press releases. At a small startup, the hiring manager is often a founder.",
  },
  {
    q: "How do I find a hiring manager's email address?",
    a: "Find the person first, then work out the company's email format from addresses of named employees that the company has published, and apply that pattern to the person's name. Check the address before you send, because a guessed address that bounces hurts your own sending reputation. Studojo does this for you: it finds the person who can actually hire you, verifies the address, writes the email and sends it from your own Gmail.",
  },
  {
    q: "Who is the hiring manager, and is it the recruiter?",
    a: "Usually not. The hiring manager is the person the role reports to, the one whose team you would join and who makes the final call. The recruiter runs the process and screens candidates. Both are worth reaching, but the hiring manager sits closest to the decision.",
  },
  {
    q: "How do I find a recruiter's email?",
    a: "Use the same method: find the recruiter on LinkedIn (the job post sometimes shows who posted it), work out the company's email format, and check the address. Some job posts list a recruiter's address directly, which also shows you the company's format. A recruiter is a good second contact, but email the hiring manager first.",
  },
  {
    q: "What is a company email format, and how do I find it?",
    a: "It is the pattern a company uses for every employee address, such as first.last@ or first@ followed by the company domain. Find two or three public addresses of named people at that company, on its website, press releases, job posts or event pages, and see which pattern they share. Do not assume a format because it is common elsewhere.",
  },
  {
    q: "What happens if I email the wrong address?",
    a: "It bounces, and the person never sees it. One bounce is harmless, but a run of them tells email providers you send to addresses you do not know, and your own emails can start landing in spam. That is why you check the address first instead of sending and hoping.",
  },
];

export default function FindHiringManagerEmailReport() {
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
        "headline": "How to Find a Hiring Manager's Email: The Manual Way, and the Fast Way",
        "description": "A step by step guide to finding a hiring manager's email: read the job post, find the team lead, work out the company email format and check the address before you send.",
        "url": `${BASE_URL}/reports/find-hiring-manager-email-2026`,
        "datePublished": "2026-10-27T00:00:00Z",
        "dateModified": "2026-10-27T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/find-hiring-manager-email-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "How to Find a Hiring Manager's Email", "item": `${BASE_URL}/reports/find-hiring-manager-email-2026` },
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
              <span>Find a Hiring Manager's Email</span>
            </nav>
            <h1>How to Find a Hiring Manager's Email: <em>The Manual Way, and the Fast Way</em></h1>
            <p className="rpt-hero-sub">
              Applying through a portal puts you in a pile. Emailing the person who
              actually hires puts you in an inbox. Here is how to find that person and
              their address by hand, step by step, and why doing it by hand is slower
              and riskier than it looks.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · India first</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Hiring managers, email formats, checking</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>The hiring manager is <strong>the person whose team you would join</strong>, usually the team lead. Not HR, and usually not the recruiter. At a small startup it is often a founder.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The manual method has four steps: <strong>read the job post for the team, find who leads it, work out the company's email format, check the address</strong>.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Companies usually give every employee <strong>the same address pattern</strong>. Find it from public addresses of named people at that company, never from what is common elsewhere.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>A guessed address is a risk: <strong>bounces hurt your own Gmail's sending reputation</strong>, and enough of them push your emails toward spam.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Doing this by hand takes real time per person. <strong>Studojo does it for you</strong>: it finds the person who can actually hire you, verifies the address, writes the email and sends it from your Gmail.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">~242</div>
              <div className="sc-label">applications an average job opening draws, so a portal application joins a crowd</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider data (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">0.1% to 2%</div>
              <div className="sc-label">typical success rate cited for a single online application</div>
              <div className="sc-source">The Interview Guys, April 2026 (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">4,000+</div>
              <div className="sc-label">students matched with hiring managers through Studojo, out of 8,500+ signed up</div>
              <div className="sc-source">Studojo's own records, September 2026</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Who Is the Hiring Manager, and Why Not HR?</div>
                <div className="sec-sub">Get the person right before you hunt for the address</div>
              </div>
            </div>
            <p>The hiring manager is the person the role reports to. They run the team you would join, they feel the pain of the empty seat, and they make the final call. In a big company that is a team lead, an engineering manager or a head of a function. At a ten-person startup it is often a founder.</p>
            <p>HR and the careers inbox are not the same thing. A generic HR address handles every role at once and sits furthest from the decision. A recruiter is closer: they screen candidates for the role. But the person who reads your email and thinks "I need this person on my team" is the hiring manager.</p>
            <div className="chart-wrap">
              <div className="chart-label">Who to email, by closeness to the hiring decision (Studojo editorial rating)</div>
              <div style={{ height: 300 }}>
                <canvas id="fhmWhoChart" />
              </div>
            </div>
            <div className="highlight">
              Studojo's position: <strong>auto-apply bots and spray-and-pray applications do not work</strong>. What works is a short, personal, specific email to the person who actually hires, sent from your own email address. Everything below is about finding that person.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Steps 1 and 2: Read the Job Post, Then Find the Team Lead</div>
                <div className="sec-sub">How to find the hiring manager for a job, by hand</div>
              </div>
            </div>
            <p>The job post is your map. Read it for the team, not just the title. A "Growth Marketing Intern" post usually names the growth team, a location and sometimes the title the role reports to.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Pull the team name from the post.</strong> Look for "you will join the X team", "reports to the Head of Y" and the city. Those three details narrow the search fast.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Check who posted it.</strong> Some LinkedIn job posts show the person who posted the role under "Meet the hiring team". Often that is a recruiter, sometimes it is the manager.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Search the company's people on LinkedIn.</strong> Open the company page, go to People, and search the team keyword ("growth", "data", "brand"). Look for Lead, Manager or Head of titles in the right city.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Confirm they are current.</strong> Check the role is their present one and that their recent posts match the team. People move, and an old title sends you to the wrong person.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Cross-check on the company site.</strong> Team pages, blog bylines, press releases and conference talks often name who leads what.</span></div>
            </div>
            <div className="callout">
              <strong>Do it by hand on LinkedIn.</strong> LinkedIn's terms ban bots and automation tools, including browser add-ons that scrape or automate the site (LinkedIn User Agreement, section 8.2). Searching and reading profiles yourself is fine. Installing something to pull data for you is not.
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Step 3: Work Out the Company's Email Format</div>
                <div className="sec-sub">One pattern, applied to one name</div>
              </div>
            </div>
            <p>Companies usually give everyone an address built the same way. Find two or three public addresses of named people at that company and the pattern shows itself. Good places to look: the company's own website, press releases with a named media contact, the job post itself (some list a recruiter's address), event and speaker pages, and research papers or open source projects where staff list a work address.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pattern</th>
                  <th>Address shape</th>
                  <th>Watch out for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>First name</strong></td>
                  <td>[first]@company.com</td>
                  <td>Two people with the same first name. Later hires may get a variation.</td>
                </tr>
                <tr>
                  <td><strong>First dot last</strong></td>
                  <td>[first].[last]@company.com</td>
                  <td>Middle names, double surnames and initials used as first names.</td>
                </tr>
                <tr>
                  <td><strong>Initial dot last</strong></td>
                  <td>[f].[last]@company.com</td>
                  <td>Easy to confuse with the version without a dot.</td>
                </tr>
                <tr>
                  <td><strong>Initial plus last</strong></td>
                  <td>[f][last]@company.com</td>
                  <td>Clashes between people with the same initial and surname.</td>
                </tr>
                <tr>
                  <td><strong>First plus last</strong></td>
                  <td>[first][last]@company.com</td>
                  <td>Long names sometimes get shortened.</td>
                </tr>
                <tr>
                  <td><strong>First plus last initial</strong></td>
                  <td>[first][l]@company.com</td>
                  <td>Some companies add a dot, some do not.</td>
                </tr>
                <tr>
                  <td><strong>Underscore</strong></td>
                  <td>[first]_[last]@company.com</td>
                  <td>Rare enough that one public example is not proof.</td>
                </tr>
              </tbody>
            </table>
            <div className="highlight">
              We list these as <strong>patterns, not a ranking</strong>. Which format is "most common" across companies does not matter. The only format that matters is the one this company uses, and only its own public addresses can tell you that.
            </div>
            <p>Two more traps. Many companies run more than one domain (a regional domain, an old brand name, a parent group), so check which one people actually use. And names in India often have several valid spellings, so the address may use a short form of the name on the person's LinkedIn profile.</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Step 4: Check the Address Before You Send</div>
                <div className="sec-sub">Why a guessed address is a risk to your own inbox</div>
              </div>
            </div>
            <p>Here is where the manual way gets risky. A pattern applied to a name gives you a likely address, not a confirmed one. Send to it and you find out only when it bounces.</p>
            <p>One bounce costs you one email. A run of them costs more. Email providers watch how often your messages fail to deliver, and a sender who keeps hitting addresses that do not exist starts to look like a spammer. Your own Gmail is the account you will use for every application, interview and offer. It is not the place to experiment.</p>
            <div className="chart-wrap">
              <div className="chart-label">Bounce risk, by how you got the address (Studojo editorial rating)</div>
              <div style={{ height: 260 }}>
                <canvas id="fhmRiskChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Search the full address in quotes.</strong> If it appears on a public page next to that person's name, you are on solid ground.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Look for the pattern more than once.</strong> One public address could be an exception. Three that match is a pattern.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Never "test" by sending.</strong> Sending and waiting for a bounce is the exact behaviour that damages your sending reputation.</span></div>
            </div>
            <div className="pull-quote">
              <p>"A guessed address is not an address. It is a bounce you have not seen yet."</p>
              <span className="pq-source">The Studojo rule for every cold email</span>
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Why the Manual Way Is Slow, and the Fast Way</div>
                <div className="sec-sub">Four steps per person, every time</div>
              </div>
            </div>
            <p>None of these steps is hard. All of them take time, and you repeat every one for every company. The checking step is the hardest to do well by hand, and it is the one that protects your inbox.</p>
            <div className="chart-wrap">
              <div className="chart-label">Effort per person, manual method, by step (Studojo editorial rating)</div>
              <div style={{ height: 260 }}>
                <canvas id="fhmEffortChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Manual way</th>
                  <th>With Studojo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Find the person</strong></td>
                  <td>Job post, LinkedIn, company site</td>
                  <td><span className="tag-pill pill-green">Done for you</span> Finds the hiring manager or team lead, not a generic HR inbox</td>
                </tr>
                <tr>
                  <td><strong>Get the address</strong></td>
                  <td>Work out the format, then hope</td>
                  <td><span className="tag-pill pill-green">Done for you</span> Verifies their email address</td>
                </tr>
                <tr>
                  <td><strong>Write the email</strong></td>
                  <td>From scratch, for each person</td>
                  <td><span className="tag-pill pill-green">Done for you</span> A personal email for that one person, based on your background and their work</td>
                </tr>
                <tr>
                  <td><strong>Send it</strong></td>
                  <td>Copy, paste, send</td>
                  <td><span className="tag-pill pill-blue">Your inbox</span> Sent from your own Gmail</td>
                </tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>We built Studojo to do exactly this.</strong> It finds the person who can actually hire you, verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail. So far: 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026). Replies are not guaranteed, but you are writing to a person, not a pile.
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">Finding hiring managers and their emails, answered directly</div>
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
            <p style={{ color: "#3b0764" }}>Stop adding to the pile. Reach the person who decides, with an address you trust:</p>
            <div className="blist">
              {[
                ["Person first", "Find the team lead from the job post and LinkedIn before you think about the address."],
                ["Format from evidence", "Use the company's own public addresses, never a guess about what is common."],
                ["Check before you send", "A bounce costs more than one email. It costs your inbox's reputation."],
                ["Or skip the grind", "Studojo finds the person, verifies the address, writes the email and sends it from your Gmail."],
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
              <Link to="/reports/email-hiring-manager-vs-applying-2026" className="related-card">
                <div className="rc-kicker">Strategy</div>
                <div className="rc-title">Emailing the Hiring Manager vs Applying Online</div>
              </Link>
              <Link to="/reports/hr-email-id-lists-why-they-fail-2026" className="related-card">
                <div className="rc-kicker">Email lists</div>
                <div className="rc-title">HR Email ID Lists: Why They Fail</div>
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
              <h3>Skip the guesswork. Email the person who hires.</h3>
              <p>Studojo finds the hiring manager, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/b2cnew/join?via=report-find-hiring-manager-email-2026&how=voice" reloadDocument className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
