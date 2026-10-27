import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Mail to HR for Job: What Happens to Your Email, and What Works Better | Studojo" },
    { name: "description", content: "How to write a mail to HR for a job in India: the subject line, 4-line body and resume file that work, and why mailing the hiring manager works better." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "mail to HR for job, email to HR for job, how to write mail to HR for job, job mail to HR for fresher, HR mail for job opportunity, mail to HR for job vacancy, sample mail to HR for job" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/mail-to-hr-for-job-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Mail to HR for Job: What Happens to Your Email, and What Works Better" },
    { property: "og:description", content: "A mail to hr@ lands in a shared inbox screened against open roles. The format that works if you do mail HR, and why the hiring manager is the better inbox." },
    { property: "og:url", content: `${BASE_URL}/reports/mail-to-hr-for-job-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-27T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Mail to HR for Job: The India Report | Studojo" },
    { name: "twitter:description", content: "The subject line, 4-line body and resume file that work when you mail HR, and the better move: mail the hiring manager too." },
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

  // Chart 1: suggested word budget for a 4-line mail to HR (guideline, not measured data)
  const budgetEl = document.getElementById("mhrBudgetChart") as HTMLCanvasElement | null;
  if (budgetEl && !budgetEl.dataset.rendered) {
    budgetEl.dataset.rendered = "1";
    new Chart(budgetEl, {
      type: "doughnut",
      data: {
        labels: ["Line 1: who you are + the role", "Line 2: one proof point", "Line 3: why this company", "Line 4: the ask"],
        datasets: [{
          data: [20, 35, 20, 15],
          backgroundColor: [VIOLET, VIOLET2, VIOLET3, GREEN],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw} words (Studojo guideline)` } },
        },
      },
    });
  }

  // Chart 2: who can move your application forward (editorial rating)
  const whoEl = document.getElementById("mhrWhoChart") as HTMLCanvasElement | null;
  if (whoEl && !whoEl.dataset.rendered) {
    whoEl.dataset.rendered = "1";
    new Chart(whoEl, {
      type: "bar",
      data: {
        labels: [
          "careers@ shared inbox",
          "hr@ shared inbox",
          "A named recruiter",
          "Hiring manager of the team",
          "Founder or team lead, small company",
        ],
        datasets: [{
          label: "Power to move you forward (1-5)",
          data: [1, 1, 3, 5, 5],
          backgroundColor: [VIOLET3, VIOLET3, VIOLET2, GREEN, GREEN],
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

  // Chart 3: mistakes that get a mail to HR ignored (editorial rating)
  const mistakeEl = document.getElementById("mhrMistakeChart") as HTMLCanvasElement | null;
  if (mistakeEl && !mistakeEl.dataset.rendered) {
    mistakeEl.dataset.rendered = "1";
    new Chart(mistakeEl, {
      type: "bar",
      data: {
        labels: ["No role named", "Same mail CC'd to 50 HRs", "Subject just says 'Resume'", "Word file or Drive link", "Long letter in the body", "'Respected Sir/Madam'"],
        datasets: [{
          label: "How much it hurts (1-5)",
          data: [5, 5, 4, 3, 3, 2],
          backgroundColor: [RED, RED, ORANGE, ORANGE, ORANGE, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` Hurts: ${ctx.raw}/5 (editorial rating)` } },
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
    q: "How do I write a mail to HR for a job?",
    a: "Use a subject line that names the role and job ID, a body of four short lines (who you are, one proof point, why this company, a clear ask) and your resume as one PDF named with your name and the role. Keep it under about 100 words and send it from a professional address. Then mail the hiring manager of the team as well, because HR screens but the hiring manager decides.",
  },
  {
    q: "What should the subject line be when I mail HR for a job?",
    a: "Name the role, the job ID if there is one, and who you are, for example 'Application: [Role], Job ID [ID] | [Your Name], [Degree] [Year]'. Avoid subjects like 'Resume' or 'Job application', because they look like every other mail in a shared inbox. A clear subject makes your mail easy to match to an open role and easy to forward.",
  },
  {
    q: "How should a fresher write a job mail to HR?",
    a: "Lead with your degree, graduation year and the exact role, then give one project, internship or result that matches it. You do not need work history to show proof: one concrete project with a number beats a list of soft skills. Keep it to four lines, attach a one-page PDF resume, and follow up once after about a week.",
  },
  {
    q: "Should I mail HR when there is no job vacancy?",
    a: "You can, but expect little from it. HR screens mail against open requisitions, so a mail that matches no opening is usually filed rather than acted on. The hiring manager of a team knows when a role is coming, so a short, specific mail to them is the better bet.",
  },
  {
    q: "Is it better to email HR or the hiring manager?",
    a: "Email the hiring manager, and mail HR too when the process asks for it. HR runs the process, while the hiring manager decides who the team needs. That is Studojo's position, and it is why we built Studojo to find the hiring manager, verify their email, write a personal mail and send it from your own Gmail.",
  },
  {
    q: "How long should I wait before following up on a mail to HR?",
    a: "Wait about a week, then send one short follow-up in the same thread with one new detail, such as a project update. One follow-up helps; three in a week reads as pressure. Replies are not guaranteed, so keep reaching out to other hiring managers while you wait.",
  },
];

export default function MailToHrReport() {
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
        "headline": "Mail to HR for Job: What Happens to Your Email, and What Works Better",
        "description": "Where a mail to HR for a job actually goes in India, the subject line, body and resume format that work, and why mailing the hiring manager works better.",
        "url": `${BASE_URL}/reports/mail-to-hr-for-job-india-2026`,
        "datePublished": "2026-10-27T00:00:00Z",
        "dateModified": "2026-10-27T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/mail-to-hr-for-job-india-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Mail to HR for Job India 2026", "item": `${BASE_URL}/reports/mail-to-hr-for-job-india-2026` },
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
              <span>Mail to HR for Job India 2026</span>
            </nav>
            <h1>Mail to HR for Job: <em>What Happens to Your Email, and What Works Better</em></h1>
            <p className="rpt-hero-sub">
              Most freshers send their resume to a careers@ or hr@ inbox and hear nothing back.
              This report shows where that mail goes, the format that works if you do mail HR,
              and why the hiring manager of the team is the inbox that matters.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Freshers and students</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Mail to HR, format, hiring managers</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>A mail to careers@ or hr@ lands in <strong>a shared inbox that can hold hundreds of resumes</strong>. An average opening already draws about 242 applications (The Interview Guys, April 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>HR screens, the hiring manager decides.</strong> HR checks your mail against open requisitions. The manager of the team decides who the team needs.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>If you mail HR, use <strong>a subject with the role, a 4-line body and a PDF resume named with your name and the role</strong>.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The better move is to <strong>also mail the hiring manager of the team</strong>: short, personal, specific, from your own address, with one follow-up.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Studojo does this for you.</strong> It finds the hiring manager, verifies their email, writes a personal mail and sends it from your own Gmail.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">242</div>
              <div className="sc-label">applications an average job opening draws, before your mail to HR even arrives</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">6-7 sec</div>
              <div className="sc-label">is how long a recruiter spends on the first scan of a resume</div>
              <div className="sc-source">Ladders eye-tracking study, 2018 (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">0.1-2%</div>
              <div className="sc-label">typical success rate cited for a single online application</div>
              <div className="sc-source">The Interview Guys, April 2026 (reported)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Where Your Mail to HR Actually Goes</div>
                <div className="sec-sub">A shared inbox, a busy recruiter, a list of open roles</div>
              </div>
            </div>
            <p>You find careers@company.com on a website or in a forum post, attach your resume and hit send. Here is what usually happens next.</p>
            <p>That inbox is shared. At a company people have heard of, it can collect hundreds of resumes from freshers doing exactly what you just did. An average job opening already draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data). Your mail joins that pile.</p>
            <p>Someone in HR or talent acquisition works through the pile when they can. They are not reading for talent in general. They are matching mails against open requisitions: the roles the company has approved and budgeted for. If your mail does not point at one of those roles, the easiest thing to do with it is file it.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Is there an open role this fits?</strong> No role named in the mail means the reader has to guess. Most will not.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Does the resume clear the basics?</strong> Degree, graduation year, location and the skills the job post names. Recruiters give a first scan about 6 to 7 seconds (Ladders, 2018).</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Is it easy to forward?</strong> A clear subject and a properly named PDF can go straight to the team. A Drive link that asks for access usually goes nowhere.</span></div>
            </div>
            <div className="highlight">
              A mail to HR is not wasted. It is a mail to <strong>the person who runs the process, not the person who makes the call</strong>. Write it well, and do not stop there.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">HR Screens. The Hiring Manager Decides.</div>
                <div className="sec-sub">Two different people with two different jobs</div>
              </div>
            </div>
            <p>Freshers often treat HR as the person who hires. In most companies, HR runs the hiring process: openings, screening, scheduling, offers. The manager of the team the role sits in decides who actually joins it.</p>
            <div className="chart-wrap">
              <div className="chart-label">Who can move your application forward (Studojo editorial rating, 1 to 5, not measured data)</div>
              <div style={{ height: 280 }}>
                <canvas id="mhrWhoChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>HR or talent team</th>
                  <th>Hiring manager</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>What they own</strong></td>
                  <td>The process: openings, screening, interviews, offers</td>
                  <td>The team's work and who joins the team</td>
                </tr>
                <tr>
                  <td><strong>What they check first</strong></td>
                  <td>Does this match an open requisition and the basic criteria?</td>
                  <td>Can this person do the work my team needs?</td>
                </tr>
                <tr>
                  <td><strong>What they can do with your mail</strong></td>
                  <td>Add you to a pipeline, or file it</td>
                  <td>Ask HR to move you forward, or tell you a role is coming</td>
                </tr>
                <tr>
                  <td><strong>Their inbox</strong></td>
                  <td><span className="tag-pill pill-amber">Shared</span> Built to collect resumes</td>
                  <td><span className="tag-pill pill-green">Personal</span> Not a resume dump</td>
                </tr>
              </tbody>
            </table>
            <p>In Studojo's view, this is the whole game. HR can keep you in the process. The hiring manager can pull you into it.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">The Format That Works If You Do Mail HR</div>
                <div className="sec-sub">One subject line, four lines of body, one clean PDF</div>
              </div>
            </div>
            <p>Sometimes mailing HR is the right step: the job post names an HR address, an off-campus drive asks you to mail in, or a recruiter posted the opening. When you do, make the mail easy to match and easy to forward.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Subject line.</strong> Name the role, the job ID and who you are. Not "Resume", not "Job application", not "Looking for opportunity".</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Line 1: who you are and which role.</strong> Degree, year, college, and the exact opening you are applying for.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Line 2: one proof point.</strong> A project, internship or result that matches the role. A number helps.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Line 3: why this company.</strong> One specific thing you noticed about its product, team or recent work.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Line 4: the ask.</strong> A short call, plus your phone number.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The attachment.</strong> One PDF, named [FirstName]_[LastName]_[Role]_Resume.pdf. Not resume_final_v3.docx, and not a Drive link that asks for access.</span></div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">Suggested word budget for the 4-line body, about 90 words (Studojo guideline, not measured data)</div>
              <div style={{ height: 260 }}>
                <canvas id="mhrBudgetChart" />
              </div>
            </div>
            <div className="callout">
              <strong>Sample mail to HR for a job (fill the brackets):</strong><br /><br />
              Subject: Application: [Role], Job ID [ID] | [Your Name], [Degree] [Year]<br /><br />
              Hi [Name, or "Hiring team"],<br />
              I am [Your Name], a [Degree] [Year] graduate from [College], applying for the [Role] opening (Job ID [ID]).<br />
              [One project or internship with a result that matches the role.]<br />
              [One line on why this company: a product, team or recent move you noticed.]<br />
              My resume is attached. Could we speak for 15 minutes this week? I am on [phone number].<br /><br />
              Thanks,<br />
              [Your Name] | [LinkedIn URL]
            </div>
            <p>Send it from an address with your name in it, not an old nickname. Write the same four lines to the hiring manager, and change line 3 to say something about their team's work.</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">The Mistakes That Get a Mail to HR Ignored</div>
                <div className="sec-sub">Most of them take five minutes to fix</div>
              </div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">How much each mistake hurts (Studojo editorial rating, 1 to 5, not measured data)</div>
              <div style={{ height: 280 }}>
                <canvas id="mhrMistakeChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>No role named.</strong> "I am looking for any opportunity in your esteemed organisation" gives HR nothing to match against. Name one role.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>One mail, fifty HRs in CC.</strong> Everyone can see it went to everyone. It reads as bulk mail, because it is.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>A vague subject.</strong> "Resume" or "Job application" looks like every other mail in that inbox.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The wrong file.</strong> A Word file breaks on phones, and a Drive link needs a click and a permission request. Send a PDF.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>A full letter in the body.</strong> Four lines get read. Four paragraphs get skimmed or skipped.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>"Respected Sir/Madam".</strong> Not fatal, but a name, or "Hi [Team] team", shows you looked.</span></div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Better Move: Mail the Hiring Manager Too</div>
                <div className="sec-sub">Same four lines, a different inbox</div>
              </div>
            </div>
            <p>Studojo's position is simple. Auto-apply bots and spray-and-pray applications do not work: the typical success rate of a single online application is cited at roughly 0.1% to 2% (The Interview Guys, April 2026). What works is a short, personal, specific email to the person who actually hires, sent from your own address, with one follow-up.</p>
            <p>For a fresher, that person is usually the manager or team lead of the team the role sits in: the analytics lead for a data analyst role, the marketing manager for a marketing intern role. They know what the team needs. A mail that shows you understood their work stands out in a way a resume in a shared inbox cannot.</p>
            <div className="pull-quote">
              <p>"HR keeps you in the process. The hiring manager pulls you into it."</p>
              <span className="pq-source">The Studojo view</span>
            </div>
            <p>Finding that person, and the right address for them, is the slow part. We built Studojo to do exactly this. Studojo finds the person who can actually hire you (the hiring manager or team lead, not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail.</p>
            <div className="highlight">
              So far: <strong>8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail</strong> (Studojo's own records, September 2026). Replies are not guaranteed, and we will not pretend otherwise.
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The mail to HR questions freshers ask most, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>Where to put your next hour</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Mailing HR is fine. Stopping there is the mistake. Do both, in this order:</p>
            <div className="blist">
              {[
                ["Mail HR when the process asks", "Subject with the role and job ID, four lines, one PDF named properly."],
                ["Mail the hiring manager too", "Same proof point, plus one line about their team's work."],
                ["Follow up once", "After about a week, one short reply in the same thread. Then move on."],
                ["Let Studojo find the person", "It finds the hiring manager, verifies the email, writes the mail and sends it from your Gmail."],
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
              <Link to="/reports/hr-email-id-lists-why-they-fail-2026" className="related-card">
                <div className="rc-kicker">HR lists</div>
                <div className="rc-title">HR Email ID Lists: Why the Free PDFs and Paid Lists Fail</div>
              </Link>
              <Link to="/reports/ai-job-search-india-2026" className="related-card">
                <div className="rc-kicker">AI job search</div>
                <div className="rc-title">AI Job Search in India 2026</div>
              </Link>
              <Link to="/reports/off-campus-placement-report-india-2026" className="related-card">
                <div className="rc-kicker">Off-campus</div>
                <div className="rc-title">The Off-Campus Placement Report India 2026</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Skip the shared inbox.</h3>
              <p>Studojo finds the hiring manager for the role you want, verifies their email, writes a personal mail for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
