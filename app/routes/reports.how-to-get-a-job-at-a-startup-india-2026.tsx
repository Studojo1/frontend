import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How to Get a Job at a Startup in India, 2026: Founders Read Their Email | Studojo" },
    { name: "description", content: "How to get a job at a startup in India: founders and team leads hire, often before a role is posted. What they look for, plus a 5-line founder email to send." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "how to get a job at a startup, how to get a job in a startup with no experience, startup jobs for freshers India, cold email startup founder for job, how to apply to startups, how startups hire freshers" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/how-to-get-a-job-at-a-startup-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How to Get a Job at a Startup in India, 2026: Founders Read Their Email" },
    { property: "og:description", content: "Startups hire through founders and team leads, often before a role is posted. How startups hire freshers, what founders look for, and a 5-line email." },
    { property: "og:url", content: `${BASE_URL}/reports/how-to-get-a-job-at-a-startup-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-28T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How to Get a Job at a Startup in India, 2026 | Studojo" },
    { name: "twitter:description", content: "Founders read their email. How startups hire freshers, what they look for, and a 5-line founder email you can send this week." },
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
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: startups recognised by DPIIT per financial year (PIB / Ministry of Commerce and Industry)
  const recogEl = document.getElementById("sjbRecogChart") as HTMLCanvasElement | null;
  if (recogEl && !recogEl.dataset.rendered) {
    recogEl.dataset.rendered = "1";
    new Chart(recogEl, {
      type: "bar",
      data: {
        labels: ["FY 2024-25 (approx.)", "FY 2025-26"],
        datasets: [{
          label: "Startups recognised by DPIIT in the year",
          data: [36400, 55200],
          backgroundColor: [VIOLET3, VIOLET],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${Number(ctx.raw).toLocaleString("en-IN")}+ recognised` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, ticks: { font: { size: 11 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 2: how likely the founder reads your email, by startup size (editorial rating)
  const sizeEl = document.getElementById("sjbSizeChart") as HTMLCanvasElement | null;
  if (sizeEl && !sizeEl.dataset.rendered) {
    sizeEl.dataset.rendered = "1";
    new Chart(sizeEl, {
      type: "bar",
      data: {
        labels: ["Under 20 people", "20 to 100 people", "100 to 500 people", "500+ people"],
        datasets: [{
          label: "Founder reads it (1-5)",
          data: [5, 4, 2, 1],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Founder reads it: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 3: what a founder looks for in a fresher (editorial rating)
  const sigEl = document.getElementById("sjbSignalChart") as HTMLCanvasElement | null;
  if (sigEl && !sigEl.dataset.rendered) {
    sigEl.dataset.rendered = "1";
    new Chart(sigEl, {
      type: "bar",
      data: {
        labels: [
          "Something you built or shipped",
          "You used their product",
          "One specific idea for them",
          "Short, clear writing",
          "Can start soon",
          "College name",
          "Generic cover letter",
        ],
        datasets: [{
          label: "Weight with a founder (1-5)",
          data: [5, 5, 4, 4, 3, 2, 1],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET2, VIOLET3, ORANGE, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Weight: ${ctx.raw}/5 (editorial rating)` } },
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
    q: "How do I get a job in a startup with no experience?",
    a: "Show evidence instead of experience. Build or ship one small thing related to the startup's work, use their product, and send the founder or team lead a short email with one specific idea and a link to your work. At a small company, proof you can do the job counts for more than a past job title.",
  },
  {
    q: "How do startups hire freshers in India?",
    a: "Mostly through the founder or a team lead, and often before a role is posted. They ask people they trust, read what lands in their inbox, and post on LinkedIn, Naukri or Internshala later, if at all. Larger startups add a recruiter and a formal process, but the hiring manager still makes the call.",
  },
  {
    q: "Is it okay to cold email a startup founder for a job?",
    a: "Yes. A short, specific email to a founder is normal at startups, and at a small company the founder often reads their own inbox. Keep it to about five lines, send it from your own email to one person, include one link to your work, and follow up once. Replies are not guaranteed, so write to several founders, each one personally.",
  },
  {
    q: "How do I apply to startups in India?",
    a: "Apply through the listing when one exists, on LinkedIn, Naukri, Internshala or the company's careers page, and email the person who decides at the same time. When no role is posted, the email is the application. The fastest way to find that person, verify their email and send a personal note from your own Gmail is Studojo.",
  },
  {
    q: "How many startups are there in India in 2026?",
    a: "Over 2.23 lakh startups were recognised by DPIIT as of 31 March 2026, according to the Ministry of Commerce and Industry (PIB, April 2026). More than 55,200 were recognised in FY 2025-26 alone, the most in any single year. Recognition is a government tag, not proof a company is hiring, so check each one before you write.",
  },
  {
    q: "What should I write in a cold email to a startup founder for a job?",
    a: "Five lines: something specific you noticed about their product, who you are with one proof of work, what you could help with, a link to that work, and a small ask such as a 15-minute call. Skip the life story and the attachments. If the email could be sent to any company, rewrite it.",
  },
];

export default function StartupJobReport() {
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
        "headline": "How to Get a Job at a Startup in India, 2026: Founders Read Their Email",
        "description": "Startups hire through founders and team leads, often before a role is posted. How startups hire freshers, what founders look for, and a five-line founder email.",
        "url": `${BASE_URL}/reports/how-to-get-a-job-at-a-startup-india-2026`,
        "datePublished": "2026-10-28T00:00:00Z",
        "dateModified": "2026-10-28T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/how-to-get-a-job-at-a-startup-india-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "How to Get a Job at a Startup 2026", "item": `${BASE_URL}/reports/how-to-get-a-job-at-a-startup-india-2026` },
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
              <span>How to Get a Job at a Startup 2026</span>
            </nav>
            <h1>How to Get a Job at a Startup in India, 2026: <em>Founders Read Their Email</em></h1>
            <p className="rpt-hero-sub">
              How to get a job at a startup starts with one thing about how they hire: the
              founder or a team lead decides, often before a role is ever posted. This report
              covers how startups hire freshers, what founders look for, and a five-line email
              you can send this week.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Startup hiring, founder emails</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>India had <strong>over 2.23 lakh DPIIT-recognised startups</strong> as of 31 March 2026 (PIB, April 2026). At a small company, the founder or a team lead makes the hiring call.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Startups often <strong>hire before a role is posted</strong>. By the time a listing appears, the founder may already be talking to people who wrote in.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Founders look for <strong>proof you can do the work</strong>: something you built, shipped or grew, and signs you actually used their product.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The best first move is <strong>a five-line email to the founder or team lead</strong>, from your own email address, with one follow-up.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Auto-apply and mass applications do not work</strong> here either. A small team reads every word, so a copy-paste application counts against you.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">2.23 lakh+</div>
              <div className="sc-label">startups recognised by DPIIT in India as of 31 March 2026</div>
              <div className="sc-source">PIB, Ministry of Commerce and Industry, April 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">23.36 lakh+</div>
              <div className="sc-label">direct jobs created by recognised startups since Startup India began</div>
              <div className="sc-source">PIB, Ministry of Commerce and Industry, April 2026 (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">242</div>
              <div className="sc-label">applications an average job opening draws, which is why the inbox beats the pile</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider (reported)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">How Startups Hire Freshers</div>
                <div className="sec-sub">The founder or a team lead, often before a role is posted</div>
              </div>
            </div>
            <p>If you want to know how to get a job at a startup, start with how a startup fills a seat. At a large company, a vacancy moves through HR, a job post, an applicant tracking system and several rounds. At a ten or forty person startup, the founder notices a gap, asks people they trust, and reads whatever lands in their inbox. A post on LinkedIn, Naukri or Internshala may come later, or never.</p>
            <p>There is no shortage of startups to write to. DPIIT had recognised 2,12,283 startups as of 31 January 2026, and the total crossed 2.23 lakh by 31 March 2026, with more than 55,200 recognised in FY 2025-26 alone, the highest in any single year since Startup India began (PIB, Ministry of Commerce and Industry, 2026).</p>
            <div className="chart-wrap">
              <div className="chart-label">Startups recognised by DPIIT per financial year (PIB and Ministry of Commerce and Industry, April 2026). FY 2024-25 is approximate, worked back from the reported 51.6% rise in FY 2025-26.</div>
              <div style={{ height: 240 }}>
                <canvas id="sjbRecogChart" />
              </div>
            </div>
            <div className="highlight">
              Recognition is a <strong>government tag, not a hiring signal</strong>. Check that a startup is active, shipping and growing before you write. A recent product launch, a funding announcement or a team page with new faces are good signs.
            </div>
            <p>If you are still deciding whether a startup is the right first job at all, our <Link to="/reports/startup-vs-mnc-2026">Startup vs MNC report</Link> covers that comparison. This report assumes you have decided and want in.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Who Actually Decides</div>
                <div className="sec-sub">Founders, team leads, and when a recruiter appears</div>
              </div>
            </div>
            <p>The person to email changes as a startup grows. Write to the wrong one and your email sits in a shared inbox. Write to the right one and it lands with someone who can say yes.</p>
            <div className="chart-wrap">
              <div className="chart-label">How likely the founder reads your email, by startup size (Studojo editorial rating)</div>
              <div style={{ height: 240 }}>
                <canvas id="sjbSizeChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Startup size</th>
                  <th>Who usually decides</th>
                  <th>Who to email</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Under 20 people</strong></td>
                  <td>A founder</td>
                  <td>The founder who runs your function</td>
                  <td><span className="tag-pill pill-green">Founder</span> Email them directly</td>
                </tr>
                <tr>
                  <td><strong>20 to 100 people</strong></td>
                  <td>A team lead, with founder sign-off</td>
                  <td>The team lead for your role, or the founder if the team is tiny</td>
                  <td><span className="tag-pill pill-green">Team lead</span> Usually the right inbox</td>
                </tr>
                <tr>
                  <td><strong>100 to 500 people</strong></td>
                  <td>The hiring manager; a recruiter runs the process</td>
                  <td>The hiring manager, and apply if there is a post</td>
                  <td><span className="tag-pill pill-amber">Both</span> Email plus application</td>
                </tr>
                <tr>
                  <td><strong>500+ people</strong></td>
                  <td>The hiring manager, through a formal process</td>
                  <td>The hiring manager for the team you want</td>
                  <td><span className="tag-pill pill-blue">Manager</span> Founder is the wrong inbox</td>
                </tr>
              </tbody>
            </table>
            <p>The rule holds at every size: email the person who would be your manager, not a generic HR address. At a startup, that is often a founder.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">What Founders Look For in a Fresher</div>
                <div className="sec-sub">How to get a job in a startup with no experience</div>
              </div>
            </div>
            <p>A founder hiring a fresher is not buying a resume. They are buying someone who will take a task and finish it without being chased. Everything in your email should prove that.</p>
            <div className="chart-wrap">
              <div className="chart-label">What carries weight with a founder (Studojo editorial rating)</div>
              <div style={{ height: 320 }}>
                <canvas id="sjbSignalChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Something you built or shipped.</strong> A project, a small app, a growth experiment, a content series with real numbers. Our <Link to="/reports/proof-of-work-report-projects-github-portfolio-2026">Proof-of-Work Report</Link> covers what counts.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>You used their product.</strong> One specific observation shows more interest than a paragraph of enthusiasm.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>One idea, not ten.</strong> A single concrete suggestion for their onboarding, their content or their sales list shows how you think.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Short, clear writing.</strong> Founders often read email on their phones between meetings. Five lines get read. Five paragraphs get saved for later.</span></div>
            </div>
            <div className="callout">
              <strong>No experience is not the problem. No evidence is.</strong> One weekend spent building something close to their product will do more for you than another certificate.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">The Five-Line Founder Email</div>
                <div className="sec-sub">How to cold email a startup founder for a job without sounding like a template</div>
              </div>
            </div>
            <p>Here is the structure. Replace every bracket with something real and specific. If you cannot fill a bracket, you are not ready to send it yet.</p>
            <div className="callout">
              <strong>Subject:</strong> An idea for [Company]'s [onboarding / growth / content], from a fresher who uses it<br /><br />
              Hi [Name],<br />
              1. I have used [Company] for [time] and noticed [one specific thing about the product or its users].<br />
              2. I am a [degree] fresher from [college], and last month I [built / ran / wrote] [project] that [result].<br />
              3. I think I could help your team with [specific problem], starting with [one concrete idea].<br />
              4. Here is the work: [one link].<br />
              5. Would a 15-minute call next week be useful?<br /><br />
              [Your name]
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Line 1 proves you looked.</strong> It is the line that separates you from every mass email they get.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Line 2 is your proof.</strong> One project with one result. Not a list of skills.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Line 3 is the pitch.</strong> Tie your proof to a problem they actually have.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Lines 4 and 5 make it easy.</strong> One link, one small ask, no attachments.</span></div>
            </div>
            <p>Send it from your own email address, to one person, and follow up once a few working days later if you hear nothing. AI chatbots can help you tighten the wording, but they cannot find and verify the founder's email, send from your Gmail or follow up for you.</p>
            <div className="pull-quote">
              <p>"If your email could be sent to any startup, it will be read like it was sent to every startup."</p>
              <span className="pq-source">The Studojo test for every founder email</span>
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">How to Apply to Startups: The Pile or the Inbox</div>
                <div className="sec-sub">Startup jobs for freshers in India, and the fastest route to a founder</div>
              </div>
            </div>
            <p>Startup jobs for freshers in India do show up on LinkedIn, Naukri, Internshala and company careers pages. Apply when there is a post. Just do not stop there. The typical online application succeeds at roughly 0.1% to 2% (The Interview Guys, April 2026).</p>
            <p>Auto-apply bots and spray-and-pray applications make it worse, not better. Recruiters say they catch bot applications with hidden instructions in job posts and by spotting one person applying to dozens of roles at the same company (NBC News, November 2024). At a twenty-person startup, a founder is likely to spot a copy-paste application on the first line.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Who sees it first</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Auto-apply bot</strong></td>
                  <td>A filter, if anyone</td>
                  <td><span className="tag-pill pill-red">Skip</span> Volume without fit</td>
                </tr>
                <tr>
                  <td><strong>Portal application</strong></td>
                  <td>An applicant tracking system or a busy recruiter</td>
                  <td><span className="tag-pill pill-amber">Do it</span> But never alone</td>
                </tr>
                <tr>
                  <td><strong>Email to the founder or team lead</strong></td>
                  <td>The person who decides</td>
                  <td><span className="tag-pill pill-green">Best</span> Short, specific, from your own email</td>
                </tr>
              </tbody>
            </table>
            <p>We built Studojo to do the hard part of that last route. At a startup, the person who can actually hire you is often a founder or team lead. Studojo finds that person, verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail. It is the fastest way we know to reach founders from your Gmail.</p>
            <p>8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026). Replies are not guaranteed. Writing to the right person gives you the best shot at one.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">Startup job questions freshers ask most, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>Your startup job plan for this week</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Startups are small, busy and run by people who read their own email. Use that:</p>
            <div className="blist">
              {[
                ["Pick ten startups you would actually use", "Active, shipping, and in a field you can talk about."],
                ["Find the person who decides", "A founder at the smallest ones, the team lead for your role at the rest."],
                ["Build one piece of proof", "Something close to their product, with a link you can share."],
                ["Send five lines, follow up once", "From your own email, one person at a time, no attachments."],
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
              <Link to="/reports/direct-outreach-job-search-2026" className="related-card">
                <div className="rc-kicker">Direct outreach</div>
                <div className="rc-title">The Direct Outreach Report: Writing to the Person, Not the Portal</div>
              </Link>
              <Link to="/reports/startup-vs-mnc-2026" className="related-card">
                <div className="rc-kicker">Career choices</div>
                <div className="rc-title">Startup vs MNC: A Real Comparison for Early-Career Talent</div>
              </Link>
              <Link to="/reports/how-to-get-a-job-in-bangalore-fresher-2026" className="related-card">
                <div className="rc-kicker">Bangalore</div>
                <div className="rc-title">How to Get a Job in Bangalore as a Fresher, 2026</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Write to the founder this week.</h3>
              <p>Studojo finds the person who can actually hire you, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/b2cnew/join?via=report-how-to-get-a-job-at-a-startup-india-2026&how=voice" reloadDocument className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
