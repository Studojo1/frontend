import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Fresher Resume With No Experience, 2026: What Recruiters Read in the First Few Seconds | Studojo" },
    { name: "description", content: "Recruiters give a resume about 7.4 seconds on the first pass (Ladders). Here is the fresher resume format for India that survives it: one page, projects in place of experience, what to do about photo, CGPA and objective." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "resume format for freshers, fresher resume with no experience, how to write a resume with no experience, resume for freshers india, one page resume fresher, fresher resume 2026, resume photo india, cgpa on resume" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/fresher-resume-no-experience-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Fresher Resume With No Experience, 2026: What Recruiters Read in the First Few Seconds" },
    { property: "og:description", content: "What recruiters look at first, one page vs two, what to write in place of experience, and the India format questions (photo, CGPA, objective) answered with data." },
    { property: "og:url", content: `${BASE_URL}/reports/fresher-resume-no-experience-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-10T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Fresher Resume With No Experience, 2026 | Studojo" },
    { name: "twitter:description", content: "About 7.4 seconds on the first pass. The fresher resume format that survives it, section by section, for India." },
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

  // Chart 1: first-pass resume scan time, seconds (Ladders 2012, Ladders 2018, InterviewPal 2025)
  const scanEl = document.getElementById("frrScanChart") as HTMLCanvasElement | null;
  if (scanEl && !scanEl.dataset.rendered) {
    scanEl.dataset.rendered = "1";
    new Chart(scanEl, {
      type: "bar",
      data: {
        labels: ["Ladders, 2012", "Ladders, 2018", "InterviewPal, 2025"],
        datasets: [{
          label: "Seconds on first scan",
          data: [6, 7.4, 11.2],
          backgroundColor: [VIOLET3, VIOLET, VIOLET2],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} seconds on the first scan` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, beginAtZero: true, ticks: { font: { size: 11 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 2: share of reviewer attention by resume section (InterviewPal, Aug 2025, 4,289 reviews)
  const focusEl = document.getElementById("frrFocusChart") as HTMLCanvasElement | null;
  if (focusEl && !focusEl.dataset.rendered) {
    focusEl.dataset.rendered = "1";
    new Chart(focusEl, {
      type: "doughnut",
      data: {
        labels: ["Experience", "Summary and headline", "Skills", "Education", "Layout and design"],
        datasets: [{
          data: [38, 24, 18, 11, 9],
          backgroundColor: [VIOLET, VIOLET2, VIOLET3, GREEN, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of review attention` } },
        },
      },
    });
  }

  // Chart 3: influence on choosing between two equal candidates, 1 to 5 scale (NACE Job Outlook 2023)
  const tieEl = document.getElementById("frrTieChart") as HTMLCanvasElement | null;
  if (tieEl && !tieEl.dataset.rendered) {
    tieEl.dataset.rendered = "1";
    new Chart(tieEl, {
      type: "bar",
      data: {
        labels: [
          "Internship with the hiring company",
          "Internship in the same industry",
          "Major (field of study)",
          "General work experience",
          "Held a leadership position",
        ],
        datasets: [{
          label: "Influence rating (1 to 5)",
          data: [4.5, 4.3, 3.7, 3.7, 3.5],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET2, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} out of 5` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 1, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
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
    q: "What is the best resume format for freshers?",
    a: "The best resume format for a fresher is a one-page, single-column, reverse-chronological layout with education and projects near the top. Recruiters give a resume about 7.4 seconds on the first pass (Ladders eye-tracking study, 2018), and that study found simple layouts with clear section headings held attention while multi-column, cluttered layouts lost it. Use standard headings (Education, Projects, Internships, Skills) so both a person and an applicant tracking system can find them.",
  },
  {
    q: "How do I write a resume with no work experience?",
    a: "Replace the experience section with proof of work: projects, internships, college clubs, freelance jobs and competitions, each written as bullets that say what you did and what came out of it. Employers say they look for evidence of problem-solving (nearly 90% of employers) and teamwork (nearly 80%) on student resumes (NACE Job Outlook 2025), and 70% now use skills-based hiring for entry-level roles (NACE Job Outlook 2026). A college project with a clear result shows both.",
  },
  {
    q: "Should a fresher resume be one page or two?",
    a: "Keep a fresher resume to one page. The one study that favoured two pages (ResumeGo, 2018, 482 hiring professionals in a simulation) found the preference was weakest at entry level, 1.4 times versus 2.9 times for managers, and that study came from a resume-writing company. With little work history, a second page usually means padding, which hurts more than it helps in a 7.4 second scan.",
  },
  {
    q: "Should I put a photo on my resume in India?",
    a: "No, not unless the employer asks for one. Most private-sector roles in India do not need a photo, it takes space from the top third of the page that recruiters read first, and image-heavy templates can trip up applicant tracking systems. Some government forms, airline, hospitality and modelling roles do ask for a photo, so follow the application instructions where they say so.",
  },
  {
    q: "Should I mention CGPA on my fresher resume?",
    a: "Yes, mention your CGPA as a fresher in India, especially if it is 6.0 or above. Large IT services recruiters commonly set academic cut-offs, and prep sites report TCS NQT asks for 60% or 6.0 CGPA across 10th, 12th and graduation (check the official TCS NextStep notice for your cycle). If your CGPA is low, list it anyway when the form asks, and let projects carry the page. In the US, GPA screening fell to 42% of employers from 73% in 2019 (NACE), a sign skills are gaining weight.",
  },
  {
    q: "Should a fresher write an objective or a summary?",
    a: "Write a short summary, not a generic objective. A two-line summary that names the role you want, your strongest skill and one proof point uses the space recruiters look at early. In one 2025 vendor study, the summary and headline area drew 24% of reviewer attention, second only to experience (InterviewPal, 4,289 reviews). \"Seeking a challenging position in a reputed organisation\" tells the reader nothing, so cut it.",
  },
];

export default function FresherResumeNoExperienceReport() {
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
        "headline": "Fresher Resume With No Experience, 2026: What Recruiters Read in the First Few Seconds",
        "description": "What recruiters look at first, one page vs two, what to write in place of experience, and the India format questions (photo, CGPA, objective) answered with data.",
        "url": `${BASE_URL}/reports/fresher-resume-no-experience-2026`,
        "datePublished": "2026-11-10T00:00:00Z",
        "dateModified": "2026-11-10T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/fresher-resume-no-experience-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Fresher Resume With No Experience, 2026", "item": `${BASE_URL}/reports/fresher-resume-no-experience-2026` },
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
              <span>Fresher Resume, 2026</span>
            </nav>
            <h1>Fresher Resume With No Experience, 2026: What Recruiters Read in the <em>First Few Seconds</em></h1>
            <p className="rpt-hero-sub">
              A recruiter gives your resume about 7.4 seconds before deciding whether to keep
              reading. Here is what they look at in that time, what to put where the experience
              section should be, and the India format questions (photo, CGPA, objective) answered
              with data.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Freshers · India and global research</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Sources</span>
                <span className="rpt-meta-value">Ladders, NACE, ResumeGo, CareerBuilder</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">10 November 2026</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>Recruiters spent <strong>about 7.4 seconds</strong> on the first scan of a resume in the Ladders 2018 eye-tracking study. A 2025 vendor study put it at 11.2 seconds. Either way, the top third of your page does the work.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>In the first scan, the eye goes to <strong>names, titles, dates and education</strong>. For a fresher, the title slot should hold your strongest project or internship, not a paragraph of objective.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>One page is right for freshers.</strong> Even the study that favoured two pages found the effect weakest at entry level (1.4 times, ResumeGo 2018).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Employers want proof of <strong>problem-solving (nearly 90%) and teamwork (nearly 80%)</strong> on student resumes (NACE). Projects, clubs and competitions can show both.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>77% of hiring managers</strong> called typos or bad grammar an instant deal breaker (CareerBuilder and Harris Poll, 2018). It is the cheapest mistake to fix.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">7.4 sec</div>
              <div className="sc-label">average first scan of a resume by recruiters</div>
              <div className="sc-source">Ladders eye-tracking study, 2018</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">77%</div>
              <div className="sc-label">of hiring managers call typos or bad grammar an instant deal breaker</div>
              <div className="sc-source">CareerBuilder and Harris Poll, 2018</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">70%</div>
              <div className="sc-label">of employers use skills-based hiring for entry-level roles</div>
              <div className="sc-source">NACE Job Outlook 2026</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">How Long a Recruiter Actually Looks</div>
                <div className="sec-sub">Seconds on the first pass, minutes only if you pass it</div>
              </div>
            </div>
            <p>The number everyone quotes comes from Ladders, a US careers site. In 2012 it tracked the eye movements of 30 recruiters over 10 weeks and found they spent about 6 seconds on a resume before deciding whether the candidate was worth a closer look. Ladders repeated the exercise in 2018 and got 7.4 seconds (reported by HR Dive, November 2018).</p>
            <p>Newer data points the same way, with a little more time. InterviewPal, a company that sells interview and resume tools, analysed 4,289 resume reviews by 312 recruiters and hiring managers in August 2025. It reported an average first scan of 11.2 seconds and a median total review of 1 minute 34 seconds, with the longer review going to resumes that passed the first fit check. Its reviewers had the job post open beside the resume, which the company says explains part of the extra time.</p>
            <div className="chart-wrap">
              <div className="chart-label">Average first scan of a resume, in seconds (Ladders 2012 and 2018; InterviewPal 2025)</div>
              <div style={{ height: 280 }}>
                <canvas id="frrScanChart" />
              </div>
            </div>
            <p>Be honest about what these studies are. None is peer-reviewed, both companies sell career services, and Ladders never published full methods for its 2018 run. But they agree on the shape of the process: a short scan decides whether you get a real read. Nobody reads a fresher resume top to bottom first and decides later.</p>
            <div className="callout">
              <strong>What this means for you:</strong> write for a 10 second reader. If the top third of your page does not say what you can do and where you have done it, the rest of the page may never be read.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Ladders eye-tracking study (2012, 2018) via HR Dive and PR Newswire; InterviewPal resume review study, August 2025.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">What They Look At First</div>
                <div className="sec-sub">Names, titles, dates and education, in that order</div>
              </div>
            </div>
            <p>In the 2012 Ladders study, recruiters spent about 80% of their 6 seconds on a short list: your name, your current title and company, your previous title and company, the start and end dates of each, and your education. Only after that did they scan for keywords that matched the job. The 2018 follow-up found resumes with simple layouts, clear section headings, bold titles and bulleted achievements held attention, laid out so the eye could move in an F or E pattern. Multi-column layouts, long sentences and cluttered pages without white space did badly (HR Dive, 2018).</p>
            <p>The InterviewPal 2025 data splits attention by section. Experience took the largest share, followed by the summary and headline area, then skills. Note that it measured cursor position, which is only a rough stand-in for where the eye goes.</p>
            <div className="chart-wrap">
              <div className="chart-label">Share of reviewer attention by resume section (InterviewPal, August 2025, 4,289 reviews)</div>
              <div style={{ height: 300 }}>
                <canvas id="frrFocusChart" />
              </div>
            </div>
            <p>Here is the fresher problem. The slot recruiters read hardest, title and organisation with dates, is the one you think you cannot fill. You can. A project, an internship, a club role or a freelance job all have a title, an organisation (or a context) and dates. Put them in the same shape as a job and the scan pattern works for you instead of against you.</p>
            <div className="callout">
              <strong>Practical rule:</strong> every entry under Projects or Internships should start with a bold title line (what you were, where, when), then two or three bullets. That is the shape a recruiter's eye is trained to find.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Ladders 2012 study via PR Newswire and Dice; Ladders 2018 via HR Dive; InterviewPal, August 2025.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">One Page or Two</div>
                <div className="sec-sub">The case for two pages is weakest exactly where you are</div>
              </div>
            </div>
            <p>The most cited argument for longer resumes is a 2018 study by ResumeGo, a resume-writing service. It asked 482 hiring professionals to review matched pairs of one-page and two-page resumes in a simulated hiring exercise. Overall, two-page resumes were preferred about 2.3 times as often. But the effect depended on seniority, and for entry-level roles it was the smallest.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role level</th>
                  <th>How much more likely a two-page resume was preferred</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Entry level</td><td>1.4 times <span className="tag-pill pill-amber">Weakest</span></td></tr>
                <tr><td>Mid level</td><td>2.6 times</td></tr>
                <tr><td>Management</td><td>2.9 times</td></tr>
              </tbody>
            </table>
            <p>Two things to keep in mind. First, the study compared candidates with similar backgrounds where the longer version simply had more detail; it did not test a fresher stretching thin material to fill a second page. Second, it was a simulation run by a company that sells resumes. Fast Company's coverage at the time warned readers not to add content just to reach a second page.</p>
            <div className="highlight">
              For a fresher with one or two internships and a few projects, one page is the honest length. A second page with a hobbies list, a declaration and a full address does not add evidence. It dilutes it.
            </div>
            <div className="callout">
              <strong>The exception:</strong> if you have a publication list, several substantial internships or a large open-source record, a second page can be fine. Put your best material on page one anyway, because page two may not be reached in a short scan.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: ResumeGo, "Settling the Debate: One or Two Page Resumes" (2018), with coverage by CNBC and Fast Company.</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">What to Put in Place of Experience</div>
                <div className="sec-sub">Employers are asking for skills evidence, not job titles</div>
              </div>
            </div>
            <p>The good news for freshers is that employers have moved toward skills. In NACE's Job Outlook 2026 survey (183 US employers, fielded August to September 2025), 70% said they use skills-based hiring for entry-level roles, up from 65% a year earlier, and more than 80% list the skills they want in job descriptions. In the Job Outlook 2025 survey, nearly 90% of employers said they look for evidence of problem-solving on a student's resume, nearly 80% for teamwork, and at least 70% each for written communication, initiative, work ethic and technical skills.</p>
            <p>Internships still carry the most weight when two candidates look equal. In NACE's Job Outlook 2023 data, an internship with the hiring company rated 4.5 out of 5 in influence and an internship in the same industry 4.3, ahead of major (3.7), general work experience (3.7) and a leadership role (3.5). NACE's February 2026 update repeated the ranking: internships with the employer or in its industry have "very much influence".</p>
            <div className="chart-wrap">
              <div className="chart-label">Influence when choosing between two equal candidates, 1 to 5 scale (NACE Job Outlook 2023)</div>
              <div style={{ height: 300 }}>
                <canvas id="frrTieChart" />
              </div>
            </div>
            <p>Here is how to turn what you already have into that evidence:</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>What you have</th>
                  <th>How to write it</th>
                  <th>Attribute it shows</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>College or personal project</td><td>Title, your role, the tools, one result (users, accuracy, time saved, a live link)</td><td>Problem-solving, technical skills</td></tr>
                <tr><td>Internship, even short or unpaid</td><td>Treat it like a job: title, company, dates, two outcome bullets</td><td>Industry exposure, work ethic</td></tr>
                <tr><td>Relevant coursework</td><td>One line of 4 to 6 course names that match the role, not your whole syllabus</td><td>Technical grounding</td></tr>
                <tr><td>College club or fest role</td><td>Position, team size, what you organised, a number (footfall, sponsors, budget)</td><td>Teamwork, initiative, leadership</td></tr>
                <tr><td>Freelance or family business work</td><td>Client type, what you delivered, how many, what it earned or saved</td><td>Initiative, communication</td></tr>
                <tr><td>Hackathons and competitions</td><td>Event, rank or shortlist stage, what you built, team size</td><td>Problem-solving under pressure</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>The test for every bullet:</strong> does it say what you did and what came out of it? "Built a Flask app that tracks hostel mess attendance, used by 300 students" beats "Worked on a web development project" every time. For more on building that proof, see our proof-of-work report.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: NACE Job Outlook 2026 (press release, 23 January 2026); NACE "What Are Employers Looking for When Reviewing College Students' Resumes?" (Job Outlook 2025); NACE Job Outlook 2023 and NACE candidate selection update, 9 February 2026.</p>
          </div>
          <StuCta via="report-fresher-resume-no-experience-2026" place="report-mid" size="quiet" title="Stu finds the person hiring for each role, so your resume reaches a reader, not just a portal." />

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The India Format Questions</div>
                <div className="sec-sub">Photo, CGPA, objective, and the personal details nobody needs</div>
              </div>
            </div>
            <p>Indian resume templates still carry habits from the biodata era: a passport photo, date of birth, father's name, marital status, religion, a "Declaration" at the bottom. None of these helps a recruiter decide in a 7 to 11 second scan whether you can do the job, and every line of them pushes your projects further down the page.</p>
            <p>CGPA is different. Unlike the US, where GPA screening has fallen to 42% of employers from 73% in 2019 (NACE, January 2026), Indian mass recruiters still use academic cut-offs. For TCS NQT, prep sites such as PrepInsta report a 60% or 6.0 CGPA minimum across 10th, 12th and graduation, though backlog rules differ between cycles, so check the official TCS NextStep notice. If a recruiter has a cut-off, they will look for your number, so make it easy to find.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Our call for freshers in India</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Photo</td><td><span className="tag-pill pill-amber">Skip</span> unless the posting asks</td><td>Takes prime space; image templates can confuse an ATS</td></tr>
                <tr><td>CGPA or percentage</td><td><span className="tag-pill pill-green">Include</span> with 10th and 12th marks</td><td>Many Indian recruiters use academic cut-offs</td></tr>
                <tr><td>Objective</td><td><span className="tag-pill pill-amber">Replace</span> with a 2-line summary</td><td>A generic objective says nothing a recruiter can use</td></tr>
                <tr><td>Date of birth, father's name, marital status, religion</td><td><span className="tag-pill pill-amber">Skip</span></td><td>Not relevant to the job; ask for it on a form if needed</td></tr>
                <tr><td>Full home address</td><td><span className="tag-pill pill-amber">Shorten</span> to city and state</td><td>City matters for location fit; your street does not</td></tr>
                <tr><td>Declaration and signature</td><td><span className="tag-pill pill-amber">Skip</span></td><td>Uses lines without adding evidence</td></tr>
                <tr><td>LinkedIn and GitHub or portfolio links</td><td><span className="tag-pill pill-green">Include</span> if the profile is complete</td><td>See the ResumeGo result below</td></tr>
              </tbody>
            </table>
            <p>On links: in a 2018 to 2019 field experiment, ResumeGo sent 24,570 fictitious applications and found resumes linking to a detailed LinkedIn profile got a 13.5% callback rate, against 7.9% with no profile. A bare-bones profile did slightly worse than none, at 7.2%. Link a profile only if it is filled in.</p>
            <div className="callout">
              <strong>If your CGPA is low:</strong> still list it if the application form or posting asks, because hiding it only delays the filter. Then put a strong Projects section above Education so the first thing the recruiter reads is what you have built.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: NACE Job Outlook 2026 press release (January 2026); PrepInsta TCS NQT eligibility page (check against TCS NextStep); ResumeGo LinkedIn field study (2019), reported by Fortune and Statista.</p>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">The Mistakes That End the Scan</div>
                <div className="sec-sub">Most are free to fix</div>
              </div>
            </div>
            <p>A survey of 1,138 hiring and HR managers run by The Harris Poll for CareerBuilder (June to July 2018) asked what makes them reject a resume on sight. Typos and bad grammar topped the list at 77%. An unprofessional email address put off 35%, and a resume with no quantifiable results put off 34%. The data is from the US and is older, but nothing about typos has become more forgivable since.</p>
            <p>The 2025 InterviewPal data adds the layout side. Among resumes rejected straight away in its sample, 43% had dense text and inconsistent formatting, 31% had missing job titles or unclear progression, and 18% used over-decorated templates that broke the reading path.</p>
            <div className="blist">
              {[
                ["Typos and grammar slips", "77% of hiring managers called them an instant deal breaker (CareerBuilder, 2018). Read the resume aloud once, then ask a friend to read it."],
                ["A casual email address", "35% were put off by an unprofessional email (same survey). Use firstname.lastname style on Gmail."],
                ["Duties instead of results", "34% rejected resumes with no quantifiable results. Give a number where you have one: users, rank, marks, team size, time saved."],
                ["Two columns, icons and skill bars", "Multi-column, cluttered layouts lost recruiter attention in the Ladders 2018 study, and they are also the layouts applicant tracking systems most often misread."],
                ["A generic objective at the top", "It takes the space recruiters read first and says nothing specific. Swap it for a two-line summary."],
                ["Listing every course and certificate", "Pick the four to six that match the role. A long list reads as filler, not depth."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" />
                  <span><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
            <p>For how applicant tracking systems parse fonts, columns, file types and headings, we covered that in detail in{" "}
              <Link to="/reports/ats-resume-report-2026" style={{ color: "#6d28d9", fontWeight: 600 }}>The ATS Resume Report 2026</Link>. The short version: one column, standard headings, a text-based PDF or DOCX, no text inside images.
            </p>
            <div className="callout">
              <strong>Ten-minute check before you send:</strong> spell-check, a professional email, at least one number in every project, one column, and a file name like Firstname_Lastname_Resume.pdf.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: The Harris Poll for CareerBuilder, June to July 2018, as reported by CareerBuilder and CBIA; InterviewPal, August 2025; Ladders 2018 via HR Dive.</p>
          </div>

          {/* Section 7 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">7</div>
              <div>
                <div className="sec-title">The Fresher Resume, Section by Section</div>
                <div className="sec-sub">A one-page skeleton you can fill in tonight</div>
              </div>
            </div>
            <p>Put together, the research gives a simple order: the things a recruiter scans first go at the top, and each one carries evidence. This is the skeleton we would use for a fresher in India applying to an entry-level role.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>What goes in it</th>
                  <th>Length</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1. Header</td><td>Name, phone, professional email, city, LinkedIn, GitHub or portfolio</td><td>2 lines</td></tr>
                <tr><td>2. Summary</td><td>Target role, strongest skill, one proof point (a project result or internship)</td><td>2 lines</td></tr>
                <tr><td>3. Education</td><td>Degree, college, years, CGPA; 12th and 10th marks on one line each</td><td>3 to 4 lines</td></tr>
                <tr><td>4. Projects</td><td>2 to 3 projects, each with a title line and 2 bullets with a result</td><td>8 to 10 lines</td></tr>
                <tr><td>5. Internships or work</td><td>Title, organisation, dates, 2 outcome bullets each; include freelance</td><td>4 to 8 lines</td></tr>
                <tr><td>6. Skills</td><td>Grouped: languages, tools, domain skills. Only what you can defend in an interview</td><td>2 to 3 lines</td></tr>
                <tr><td>7. Achievements and activities</td><td>Competitions, club roles, certifications that match the role</td><td>2 to 4 lines</td></tr>
              </tbody>
            </table>
            <div className="highlight">
              If your projects are stronger than your CGPA, swap sections 3 and 4. The order should put your best evidence where the eye lands first.
            </div>
            <div className="pull-quote">
              <p>"The experience slot is not empty for a fresher. It is waiting for a project written like a job."</p>
              <span className="pq-source">The takeaway from the recruiter attention research</span>
            </div>
            <div className="callout">
              <strong>One resume per role type:</strong> keep a base version, then reorder projects and skills for each kind of role you apply to. With 80% of employers listing the skills they want in the job description (NACE), the posting tells you what to move to the top.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Studojo synthesis of the Ladders, InterviewPal, NACE and ResumeGo findings cited above.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The questions freshers ask about their first resume, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>Your first resume, in five moves</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>If you have no work experience, the research points to a short list:</p>
            <div className="blist">
              {[
                ["Design for the first 10 seconds", "Name, summary, education and your best project must sit in the top third of one page."],
                ["Write projects like jobs", "Title, context, dates, then bullets with a result. That is the shape recruiters scan for."],
                ["Keep CGPA, drop the biodata", "Marks matter to Indian recruiters with cut-offs. Photo, father's name and a declaration do not."],
                ["Fix the free mistakes", "Typos, a casual email and duty-only bullets are the most common reasons for instant rejection."],
                ["Send it to a person", "A good resume in a portal queue still waits. The same resume sent to the hiring manager with a short note gets read by someone who chose to open it."],
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
              <Link to="/reports/ats-resume-report-2026" className="related-card">
                <div className="rc-kicker">Resume</div>
                <div className="rc-title">The ATS Resume Report 2026: How Applicant Tracking Systems Read Your Resume</div>
              </Link>
              <Link to="/reports/proof-of-work-report-projects-github-portfolio-2026" className="related-card">
                <div className="rc-kicker">Projects</div>
                <div className="rc-title">The Proof-of-Work Report 2026: Projects, GitHub and Portfolios</div>
              </Link>
              <Link to="/reports/how-to-get-a-job-as-a-fresher-india-2026" className="related-card">
                <div className="rc-kicker">Freshers</div>
                <div className="rc-title">How to Get a Job as a Fresher in India, 2026</div>
              </Link>
            </div>
          </div>
          <StuCta via="report-fresher-resume-no-experience-2026" place="report-end" size="card" title="Want your resume read by the person who hires?" line="Tell Stu the role, the city and the pay you want in one short call. Stu finds jobs that fit you, finds who's hiring and writes the email to them." />
        </div>
      </main>
      <Footer />
    </>
  );
}
