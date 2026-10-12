import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The ATS Resume Report 2026: How Applicant Tracking Systems Actually Read Your Resume | Studojo" },
    { name: "description", content: "Most resumes are screened by software before a recruiter sees them. A documented breakdown of how an ATS parses your resume in 2026, what formatting silently breaks it, the keyword myth, and the exact format that passes. PDF vs Word, columns, the one-page question, answered." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "ATS resume 2026, applicant tracking system, ATS friendly resume format, how to pass ATS, resume format for freshers india, ats resume checker, pdf or word for ats, does ats reject resumes" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/ats-resume-report-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The ATS Resume Report 2026: How Applicant Tracking Systems Actually Read Your Resume" },
    { property: "og:description", content: "How an ATS actually parses your resume in 2026, what formatting breaks it, the keyword myth, and the format that passes. PDF vs Word and the one-page question, answered." },
    { property: "og:url", content: `${BASE_URL}/reports/ats-resume-report-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-12T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The ATS Resume Report 2026 | Studojo" },
    { name: "twitter:description", content: "How an ATS actually reads your resume, what breaks it, and the format that passes. The keyword myth and PDF vs Word, settled." },
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

  // Chart 1: formatting elements that break parsing
  const breakEl = document.getElementById("breakChart") as HTMLCanvasElement | null;
  if (breakEl && !breakEl.dataset.rendered) {
    breakEl.dataset.rendered = "1";
    new Chart(breakEl, {
      type: "bar",
      data: {
        labels: [
          "Multi-column layout",
          "Text inside tables",
          "Text boxes / shapes",
          "Header / footer blocks",
          "Icons and graphics",
          "Skill bars / charts",
          "Non-standard section names",
          "Decorative fonts",
        ],
        datasets: [{
          label: "Parsing risk (1-5)",
          data: [5, 5, 5, 4, 4, 4, 3, 2],
          backgroundColor: [RED, RED, RED, ORANGE, ORANGE, ORANGE, VIOLET3, VIOLET3],
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

  // Chart 2: what happens to 100 online applications (illustrative)
  const funnelEl = document.getElementById("funnelChart") as HTMLCanvasElement | null;
  if (funnelEl && !funnelEl.dataset.rendered) {
    funnelEl.dataset.rendered = "1";
    new Chart(funnelEl, {
      type: "doughnut",
      data: {
        labels: [
          "Screened out before a human reads them",
          "Read by a recruiter, not advanced",
          "Advanced to a call or interview",
        ],
        datasets: [{
          data: [72, 22, 6],
          backgroundColor: [RED, ORANGE, GREEN],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw} of 100` } },
        },
      },
    });
  }

  // Chart 3: fixes ranked by impact on getting parsed and surfaced
  const fixEl = document.getElementById("fixChart") as HTMLCanvasElement | null;
  if (fixEl && !fixEl.dataset.rendered) {
    fixEl.dataset.rendered = "1";
    new Chart(fixEl, {
      type: "bar",
      data: {
        labels: [
          "Single-column layout",
          "Standard section headings",
          "Keywords from the job post",
          "Submit .docx (or text PDF)",
          "Plain dates, no graphics",
        ],
        datasets: [{
          label: "Impact (1-5)",
          data: [5, 5, 5, 4, 3],
          backgroundColor: [VIOLET, VIOLET, VIOLET, VIOLET2, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` Impact: ${ctx.raw}/5` } },
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
    q: "Do applicant tracking systems automatically reject resumes?",
    a: "Mostly no. The common image of a robot scoring your resume and auto-rejecting it is largely a myth. Most systems like Workday, Greenhouse and Lever parse your resume into fields, store it, and let a recruiter search and filter. The rejection usually comes from a human skimming a filtered list, or from knockout questions you answered in the application form, not from a hidden score.",
  },
  {
    q: "Should I send my resume as a PDF or a Word document?",
    a: "A text-based PDF or a .docx both parse well in modern systems. The real failure is a PDF exported as an image, or a resume built in a design tool where the text is not selectable. If you can open your PDF, select the text with your cursor and copy it cleanly, an ATS can read it. When a job form offers a choice and you are unsure, .docx is the safest default.",
  },
  {
    q: "Do columns and tables break an ATS?",
    a: "They are the single most common cause of garbled parsing. A two-column layout can make the system read straight across both columns and merge your skills into your job history. Tables and text boxes are read inconsistently. Use a single-column layout with normal text and your content survives intact.",
  },
  {
    q: "How many keywords should my resume have?",
    a: "There is no magic number. Match the real language of the specific job post: if it says SQL, Python and stakeholder management, those exact phrases should appear where they are true for you. Stuffing in a hidden wall of keywords is both easy to detect and useless once a human reads it. Relevance beats volume.",
  },
  {
    q: "Does my resume have to be one page?",
    a: "An ATS does not care about page count, it reads the text either way. One page is a human-reading convention that helps for students and early-career candidates because recruiters skim. If you have two years or less of experience, one focused page is almost always stronger than two thin ones.",
  },
  {
    q: "What applicant tracking systems do most companies use in 2026?",
    a: "The most common at scale are Workday, Oracle Taleo, SAP SuccessFactors and iCIMS at large enterprises, and Greenhouse, Lever, Ashby and Workable at startups and mid-size firms. They differ in detail, but all of them reward the same thing: clean, single-column, text-based formatting with standard section headings.",
  },
];

export default function ATSResumeReport() {
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
        "headline": "The ATS Resume Report 2026: How Applicant Tracking Systems Actually Read Your Resume",
        "description": "How an ATS parses your resume in 2026, what formatting breaks it, the keyword myth, and the exact format that passes.",
        "url": `${BASE_URL}/reports/ats-resume-report-2026`,
        "datePublished": "2026-10-12T00:00:00Z",
        "dateModified": "2026-10-12T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/ats-resume-report-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "ATS Resume Report 2026", "item": `${BASE_URL}/reports/ats-resume-report-2026` },
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
              <span>ATS Resume Report 2026</span>
            </nav>
            <h1>How an ATS <em>Actually Reads</em> Your Resume</h1>
            <p className="rpt-hero-sub">
              Before a recruiter sees your resume, software parses it. Most advice about
              that software is folklore. This report documents what an applicant tracking
              system really does in 2026, what formatting quietly breaks it, and the format
              that passes every time.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · All roles</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Parsing, keywords, format</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>An ATS is a filing and search tool, not an auto-rejecting judge. It <strong>parses your resume into fields</strong> so a recruiter can search and filter. Most rejections are still human.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The thing that actually hurts you is <strong>broken parsing</strong>: multi-column layouts, tables, text boxes and graphics scramble your content before anyone reads it.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>A single-column, text-based resume</strong> with standard headings (Experience, Education, Skills) parses cleanly in every major system.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Keywords matter, but as <strong>relevance, not volume</strong>. Mirror the exact language of the specific job post where it is true for you.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>A selectable, text-based <strong>PDF or .docx both pass</strong>. A resume exported as an image, or built in a design tool, is what fails.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">99%</div>
              <div className="sc-label">of Fortune 500 companies use an applicant tracking system to manage hiring</div>
              <div className="sc-source">Jobscan, 2024</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~75%</div>
              <div className="sc-label">commonly cited estimate of resumes filtered or never surfaced before a recruiter reads them</div>
              <div className="sc-source">Industry estimate (Jobscan)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">6-7s</div>
              <div className="sc-label">average time a recruiter spends on the first pass over a resume</div>
              <div className="sc-source">Ladders eye-tracking study</div>
            </div>
          </div>

          {/* Section 1: what an ATS is */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">What an ATS Actually Is</div>
                <div className="sec-sub">Myth versus how the software really behaves</div>
              </div>
            </div>
            <p>An applicant tracking system is the software a company uses to receive, store, search and move candidates through hiring. Workday, Greenhouse, Lever, Taleo and iCIMS are the names you will meet most often. When you upload a resume, the system reads the file and tries to sort your information into structured fields: name, contact, work history, education, skills.</p>
            <p>The popular story is that a robot scores each resume and silently bins the low scores. For the vast majority of roles, that is not what happens. The system is closer to a searchable database. A recruiter runs a search, filters by a must-have skill or location, and skims the shortlist by hand.</p>
            <div className="highlight">
              The practical takeaway: your enemy is almost never a secret score. It is <strong>bad parsing</strong> (the system misreads your resume) and <strong>weak relevance</strong> (a human skims your filtered resume and moves on). Both are fixable, and neither requires gaming a machine.
            </div>
            <div className="callout">
              <strong>Where a machine can reject you:</strong> knockout questions on the application form. "Do you have a work permit for this country?" or "Do you have 3 years of experience?" answered the wrong way can filter you automatically. That is the form, not your resume.
            </div>
          </div>

          {/* Section 2: how parsing works */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">How Parsing Works, and What Breaks It</div>
                <div className="sec-sub">The formatting choices that scramble your resume before anyone reads it</div>
              </div>
            </div>
            <p>Parsing is the step where the system converts your document into text and guesses which text belongs in which field. It reads in a reading order. Anything that confuses that order corrupts the result: your job titles land under skills, your dates vanish, your degree ends up blank.</p>
            <div className="chart-wrap">
              <div className="chart-label">Formatting elements by how often they break parsing</div>
              <div style={{ height: 320 }}>
                <canvas id="breakChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Multiple columns:</strong> the top offender. A two-column resume can be read straight across, merging your left column into your right. Your skills get stapled onto the wrong job.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Tables and text boxes:</strong> content placed inside a table cell or a floating box is read inconsistently or dropped. Many templates hide their layout in invisible tables.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Headers and footers:</strong> some parsers ignore the header and footer region entirely. Put your phone number or email there and it can disappear.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Icons, graphics and skill bars:</strong> a little bar showing "Python 80%" carries zero machine-readable information. A photo and decorative icons add noise and nothing else.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Non-standard section names:</strong> "Where I have made an impact" is clever and unparseable. Call it Experience. Call your education Education.</span></div>
            </div>
            <div className="pull-quote">
              <p>"The fanciest resume in the pile is often the one the system reads worst. Clean and boring beats designed and broken every single time."</p>
              <span className="pq-source">Common refrain among technical recruiters</span>
            </div>
          </div>

          {/* Section 3: the format that passes */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">The Format That Passes</div>
                <div className="sec-sub">A checklist that parses cleanly in every major system</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Do this</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Layout</strong></td>
                  <td>Single column, top to bottom</td>
                  <td><span className="tag-pill pill-green">Safe</span> Reading order stays correct</td>
                </tr>
                <tr>
                  <td><strong>Section headings</strong></td>
                  <td>Experience, Education, Skills, Projects</td>
                  <td><span className="tag-pill pill-green">Safe</span> The parser knows these words</td>
                </tr>
                <tr>
                  <td><strong>Dates</strong></td>
                  <td>Plain text, consistent (Jan 2025 - Present)</td>
                  <td><span className="tag-pill pill-green">Safe</span> Builds your timeline correctly</td>
                </tr>
                <tr>
                  <td><strong>Fonts</strong></td>
                  <td>One standard font, 10-12pt body</td>
                  <td><span className="tag-pill pill-amber">Careful</span> Decorative fonts can misread</td>
                </tr>
                <tr>
                  <td><strong>Contact details</strong></td>
                  <td>In the body, not the header region</td>
                  <td><span className="tag-pill pill-red">Risk</span> Headers are sometimes skipped</td>
                </tr>
                <tr>
                  <td><strong>File</strong></td>
                  <td>Text-based PDF or .docx</td>
                  <td><span className="tag-pill pill-green">Safe</span> Both parse when text is selectable</td>
                </tr>
              </tbody>
            </table>
            <div className="chart-two">
              <div>
                <div className="chart-label">Where 100 online applications tend to land (illustrative)</div>
                <div style={{ height: 240 }}>
                  <canvas id="funnelChart" />
                </div>
              </div>
              <div>
                <div className="chart-label">Fixes ranked by impact</div>
                <div style={{ height: 240 }}>
                  <canvas id="fixChart" />
                </div>
              </div>
            </div>
            <div className="highlight">
              The one-minute test: open your resume, press select-all, copy it, and paste into a plain notes app. If the text comes out in a sensible order and nothing is missing, an ATS can read it. If it is scrambled or blank, your layout is the problem, not your experience.
            </div>
          </div>

          {/* Section 4: keywords */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">The Keyword Question, Settled</div>
                <div className="sec-sub">Relevance beats volume, and honesty beats both</div>
              </div>
            </div>
            <p>Recruiters search the database by the skills a role needs. If the job calls for SQL and your resume never says SQL, a keyword search will not surface you, even if your projects clearly used it. So keywords matter. What does not work is the folklore version: stuffing a hidden block of every skill under the sun, or matching some invented percentage.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Read the actual job post.</strong> Pull the specific tools, skills and titles it names. Those are the exact phrases to use where they are genuinely true for you.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Use the real words, not only acronyms.</strong> Write both the term and its short form once, for example "search engine optimisation (SEO)", so either search finds you.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Put skills in context.</strong> A skill inside a bullet that shows a result is far stronger to the human than a bare keyword list, and still fully searchable.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Never fake a keyword.</strong> White text, hidden blocks and skills you cannot defend get caught the moment a human reads the page, and in the interview.</span></div>
            </div>
            <div className="callout">
              <strong>For freshers specifically:</strong> you will not match a senior job description, and you should not try to. Target roles that say intern, trainee, associate or entry level, and mirror the language of those posts. Your coursework, projects and internships are real keywords. Use them.
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The ATS questions students ask most, answered directly</div>
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
            <p style={{ color: "#3b0764" }}>Stop treating the ATS as a puzzle to outsmart. It is a filing cabinet with a search box. Make your resume easy to file and easy to find, then put your real energy into relevance and reaching humans:</p>
            <div className="blist">
              {[
                ["Fix the format once", "Single column, standard headings, selectable text. Do this one time and it works for every application you ever send."],
                ["Tailor the words to the role", "Mirror the language of each post where it is true for you. Ten minutes of tailoring beats a hundred identical sends."],
                ["Do not rely on the portal alone", "A clean resume that nobody searches for still goes nowhere. A referral or a direct message to the hiring manager is what gets a filtered resume actually opened."],
                ["Keep it honest", "Everything on the page has to survive a human reading it and an interview about it. The ATS was never the final judge. The person is."],
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
              <Link to="/reports/application-response-rate-2026" className="related-card">
                <div className="rc-kicker">Response rates</div>
                <div className="rc-title">Why 80% of Applications Get No Response</div>
              </Link>
              <Link to="/reports/linkedin-profile-2026" className="related-card">
                <div className="rc-kicker">Profiles</div>
                <div className="rc-title">What Hiring Managers Actually Look At on LinkedIn</div>
              </Link>
              <Link to="/reports/degree-vs-skills-2026" className="related-card">
                <div className="rc-kicker">Screening</div>
                <div className="rc-title">Degree vs Skills: What Hirers Actually Look At</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Build a resume that parses cleanly.</h3>
              <p>The free Studojo resume builder produces a single-column, ATS-safe resume with the right headings, so the format is handled and you can focus on the words.</p>
            </div>
            <Link to="/resume-maker" className="rpt-cta-btn">
              Build Your Resume Free →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
