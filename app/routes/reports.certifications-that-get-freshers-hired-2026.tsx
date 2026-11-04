import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Certificate Report 2026: Which Certifications Actually Get Freshers Hired | Studojo" },
    { name: "description", content: "Which certifications get freshers hired in 2026? AWS, Google, NPTEL, Coursera, CFA and Udemy ranked high, medium or low signal, with costs, completion rates and what hiring managers say." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "best certifications for freshers, are google certificates worth it, certification courses for freshers to get job, is coursera certificate valid in india, nptel certificate value, aws certification for freshers, certifications that get you hired 2026" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/certifications-that-get-freshers-hired-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Certificate Report 2026: Which Certifications Actually Get Freshers Hired" },
    { property: "og:description", content: "Job descriptions, hiring surveys, costs and completion rates, put together into one ranking of certificates by how much they actually signal to an employer." },
    { property: "og:url", content: `${BASE_URL}/reports/certifications-that-get-freshers-hired-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-11T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Certificate Report 2026: Which Certifications Get Freshers Hired | Studojo" },
    { name: "twitter:description", content: "Only 3.13% of MOOC learners finished. Employers rate internships above everything. Here is which certificates still carry weight, ranked." },
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
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: how employers assess candidates (TestGorilla, State of Skills-Based Hiring 2025, UK and US)
  const methodsEl = document.getElementById("cfhMethodsChart") as HTMLCanvasElement | null;
  if (methodsEl && !methodsEl.dataset.rendered) {
    methodsEl.dataset.rendered = "1";
    new Chart(methodsEl, {
      type: "bar",
      data: {
        labels: [
          "Use skills-based hiring",
          "Use skills tests",
          "Still use resumes",
          "Dropped degree requirements",
          "Use cognitive ability tests",
        ],
        datasets: [{
          label: "% of employers",
          data: [85, 76, 67, 53, 50],
          backgroundColor: [VIOLET, VIOLET, MUTED, VIOLET2, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of employers` } },
        },
        scales: {
          x: { min: 0, max: 100, grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}%` } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: completion rates (Reich and Ruipérez-Valiente, Science 2019, via Inside Higher Ed; NPTEL via Careers360)
  const completeEl = document.getElementById("cfhCompletionChart") as HTMLCanvasElement | null;
  if (completeEl && !completeEl.dataset.rendered) {
    completeEl.dataset.rendered = "1";
    new Chart(completeEl, {
      type: "bar",
      data: {
        labels: [
          "Harvard/MIT edX, all learners (2017-18)",
          "NPTEL, all enrollees (since 2014)",
          "NPTEL, exam registrants, Jan to Apr 2023",
          "Harvard/MIT edX, paid verified learners (2017-18)",
          "NPTEL, exam registrants (since 2014)",
        ],
        datasets: [{
          label: "% who finished or got certified",
          data: [3.13, 5.66, 42, 46, 56.8],
          backgroundColor: [RED, RED, VIOLET2, VIOLET, VIOLET],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% finished or certified` } },
        },
        scales: {
          x: { min: 0, max: 100, grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}%` } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 3: what tips a close hiring decision (NACE Job Outlook 2025, 1 to 5 influence scale)
  const naceEl = document.getElementById("cfhNaceChart") as HTMLCanvasElement | null;
  if (naceEl && !naceEl.dataset.rendered) {
    naceEl.dataset.rendered = "1";
    new Chart(naceEl, {
      type: "bar",
      data: {
        labels: ["Interned with the employer", "Interned in the same industry", "Academic major"],
        datasets: [{
          label: "Influence score (1 to 5)",
          data: [4.4, 4.3, 4.0],
          backgroundColor: [VIOLET, VIOLET2, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} out of 5` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { min: 1, max: 5, grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
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
  .pill-red { background: #fee2e2; color: #991b1b; }
`;

const FAQ = [
  {
    q: "Which certification is best for freshers to get a job?",
    a: "The certificates that help most are the ones employers name in job descriptions for your target role, such as an AWS, Azure or Google Cloud associate-level exam for cloud and DevOps roles, or CFA Level I for finance research roles. Lightcast found the top 50 certifications account for two-thirds of all certification requests in job postings, so demand is narrow. A certificate with no project behind it is a weak signal: NACE's Job Outlook 2025 rates internship experience (4.3 to 4.4 out of 5) above academic major (4.0) when employers choose between close candidates.",
  },
  {
    q: "Are Google Career Certificates worth it in India?",
    a: "They are worth it as a cheap, structured way to learn, but not as a hiring ticket on their own. Google lists the price in India at 20 US dollars a month on Coursera, and says many learners finish in three to six months (Google Career Certificates India page). Google's India page gives no hiring outcome figures, so pair the certificate with one finished project that uses the skill before you put it at the top of your resume.",
  },
  {
    q: "Is a Coursera certificate valid in India?",
    a: "A Coursera certificate is a real record that you completed a course, but it is not a degree and does not by itself earn university credit in India. UGC's credit framework allows up to 40% of a programme's credits through SWAYAM courses, and 415 universities have adopted it, yet uptake is about 15% to 20% of students (Careers360, April 2026). Employers treat a Coursera certificate as evidence of effort, and a project as evidence of skill.",
  },
  {
    q: "What is the value of an NPTEL certificate?",
    a: "An NPTEL certificate carries more weight than most free online certificates because it requires a proctored exam, costs about 1,000 rupees per course, and is run by the IITs and IISc. Only 5.66% of NPTEL enrollees since 2014 ended up certified, and about 42% of exam registrants passed in the January to April 2023 semester (Careers360, 2025). It can also count for credit if your university has adopted SWAYAM.",
  },
  {
    q: "Is AWS certification good for freshers?",
    a: "AWS certification helps freshers aiming at cloud, DevOps or support roles, especially the Associate level, but it works best next to a deployed project. In India the Foundational exam costs 8,553 rupees and the Associate exams 12,829.50 rupees per attempt, plus applicable taxes (AWS certification policies page). The Foundational Cloud Practitioner exam is a fine start, but it is rarely the credential a job description asks for.",
  },
  {
    q: "Do employers prefer certifications or projects?",
    a: "Employers lean toward evidence of doing the work. TestGorilla's 2025 survey of 1,084 UK and US employers found 76% use skills tests to hire, and TeamLease EdTech's survey of 1,051 Indian employers (November 2025 to January 2026) found fresher hiring decisions are mainly driven by internships and real project work. Surveys showing near-universal employer love for certificates mostly come from companies that sell them, such as Coursera.",
  },
];

export default function CertificationsFreshersReport() {
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
        "headline": "The Certificate Report 2026: Which Certifications Actually Get Freshers Hired",
        "description": "Job descriptions, hiring surveys, costs and completion rates, put together into one ranking of certificates by how much they actually signal to an employer.",
        "url": `${BASE_URL}/reports/certifications-that-get-freshers-hired-2026`,
        "datePublished": "2026-11-11T00:00:00Z",
        "dateModified": "2026-11-11T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/certifications-that-get-freshers-hired-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Certificate Report 2026", "item": `${BASE_URL}/reports/certifications-that-get-freshers-hired-2026` },
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
              <span>The Certificate Report 2026</span>
            </nav>
            <h1>The Certificate Report 2026: Which Certifications <em>Actually</em> Get Freshers Hired</h1>
            <p className="rpt-hero-sub">
              AWS, Google, NPTEL, Coursera, CFA, Udemy. We put job description data, hiring
              surveys, exam costs and completion rates side by side, then ranked each kind of
              certificate by how much it really tells an employer.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India focus · global hiring data</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Covers</span>
                <span className="rpt-meta-value">Cloud, finance, MOOCs, NPTEL</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Sources</span>
                <span className="rpt-meta-value">Lightcast, NACE, TestGorilla, TeamLease, AWS</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Job descriptions ask for a narrow set of certificates.</strong> The top 50 certifications make up two-thirds of all certification requests in job postings (Lightcast).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Employers test skills more than they read credentials.</strong> 76% of employers use skills tests, and internship experience outranks academic major in close calls (TestGorilla 2025, NACE 2025).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The loudest "employers love certificates" numbers come from sellers.</strong> Coursera's 2025 survey says 98% of Indian employers think micro-credentials strengthen an application. Read it as marketing research.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Most people never finish.</strong> 3.13% of Harvard and MIT edX learners completed in 2017-18, and 5.66% of NPTEL enrollees since 2014 got certified. Finishing is itself a filter.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>High signal:</strong> proctored, role-named exams (cloud associate, CFA Level I, NPTEL with a good score) plus a project. <strong>Low signal:</strong> course completion certificates with nothing built.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">3.13%</div>
              <div className="sc-label">of Harvard and MIT edX MOOC learners completed their course in 2017-18</div>
              <div className="sc-source">Reich and Ruipérez-Valiente, Science 2019</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">5.66%</div>
              <div className="sc-label">of NPTEL enrollees since 2014 went on to earn a certificate</div>
              <div className="sc-source">Careers360, Sept 2025</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">76%</div>
              <div className="sc-label">of employers now use skills tests to judge candidates</div>
              <div className="sc-source">TestGorilla, State of Skills-Based Hiring 2025</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">What Job Descriptions Actually Ask For</div>
                <div className="sec-sub">Certificate demand is narrow, named, and mostly aimed at experienced hires</div>
              </div>
            </div>
            <p>Start with the place where an employer's preference is written down: the job description. Lightcast, the labour market data firm that scrapes postings from more than 50,000 job boards and employer sites, found that demand for certifications is highly concentrated. The top 50 certifications account for two-thirds of all certification requests in job postings, and in fields that value them, they carry a salary premium of up to 18% (Lightcast, "The Narrow Ladder"). A Lightcast presentation also reports that the share of postings requesting any non-degree credential rose from 26% to 31% since 2018 (Lightcast deck for the Institute for Credentialing Excellence). That is US data, and we could not find an equivalent public count for India.</p>
            <p>The practical meaning: a few named certificates show up again and again, and the long tail of course certificates barely shows up at all. You will see "AWS Certified Solutions Architect Associate" written into a cloud job description. You will almost never see "completed a Udemy course in Python".</p>
            <p>The second thing JD data shows is that many of the most requested certificates are built for people with experience. In a LinuxCareers analysis of 1,675 deduplicated Linux-focused postings from January to March 2026, only 14.7% mentioned any certification at all, and the most requested was CISSP (7.8% of postings), a security credential that ISC2 awards only after several years of paid work. Postings that required a certification did not pay more in that sample. It is a small, mostly US dataset with some internal inconsistencies, so treat it as directional.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Certificate type</th>
                  <th>Shows up in JDs for</th>
                  <th>Realistic for a fresher?</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>AWS / Azure / Google Cloud associate</td><td>Cloud, DevOps, support engineer roles</td><td><span className="tag-pill pill-green">Yes, with a project</span></td></tr>
                <tr><td>CFA Level I, ACCA papers</td><td>Equity research, fund ops, audit, accounts</td><td><span className="tag-pill pill-green">Yes, in finance</span></td></tr>
                <tr><td>Salesforce Administrator</td><td>Salesforce partner firms and CRM teams</td><td><span className="tag-pill pill-green">Yes, niche</span></td></tr>
                <tr><td>CISSP, CISA, CCNP</td><td>Mid and senior security and network roles</td><td><span className="tag-pill pill-amber">Mostly no</span></td></tr>
                <tr><td>Coursera, Udemy completion certificates</td><td>Rarely named in any JD</td><td><span className="tag-pill pill-red">Weak on its own</span></td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>How to use this:</strong> open ten job descriptions for the exact role you want and write down every certificate they name. If one appears in three or more, it is worth considering. If none appear, your time is better spent on a project. For security roles specifically, our <Link to="/reports/cybersecurity-internship-report-2026" style={{ color: "#c4b5fd" }}>Cybersecurity Internship Report</Link> covers why collecting certificates rarely beats hands-on lab work.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Lightcast, The Narrow Ladder; Lightcast presentation to the Institute for Credentialing Excellence; LinuxCareers job posting analysis, April 2026 (revised June 2026).</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">What Hiring Managers Say: Proof Beats Paper</div>
                <div className="sec-sub">Skills tests, internships and projects are what decide close calls</div>
              </div>
            </div>
            <p>Independent surveys of employers point in one direction. TestGorilla's State of Skills-Based Hiring 2025, which surveyed 1,084 employers and 1,076 job seekers in the UK and US in April 2025, found 85% of employers use skills-based hiring, 76% use skills tests, and only 67% still use resumes, down from 73% a year earlier. 53% said they had dropped degree requirements for at least some roles. The point for you: more employers check whether you can do the work, rather than reading what credentials you list.</p>
            <div className="chart-wrap">
              <div className="chart-label">How employers assess candidates, % of employers (TestGorilla, 2025, UK and US)</div>
              <div style={{ height: 280 }}>
                <canvas id="cfhMethodsChart" />
              </div>
            </div>
            <p>India data says the same thing. TeamLease EdTech's Career Outlook Report, based on 1,051 employers surveyed between November 2025 and January 2026, found 73% plan to hire freshers in January to June 2026, with decisions driven mainly by internships and real project experience rather than academic credentials alone (Careers360, May 2026). The report lists AI, cloud, data and cybersecurity as skills in demand, framed as skills, not as certificate titles.</p>
            <p>In the US, NACE's Job Outlook 2025 asks employers what tips the decision between two equally qualified graduates. An internship with the employer scored 4.4 out of 5 and an internship in the same industry 4.3, ahead of academic major at 4.0 (NACE table reproduced by Iowa State University careers). Certificates are not among the top deciding attributes.</p>
            <div className="chart-wrap">
              <div className="chart-label">Influence on choosing between equal candidates, 1 to 5 (NACE Job Outlook 2025)</div>
              <div style={{ height: 240 }}>
                <canvas id="cfhNaceChart" />
              </div>
            </div>
            <p>One warning before you assume "skills-based hiring" means anyone with a certificate gets in. Harvard Business School and the Burning Glass Institute tracked what happened after large firms dropped degree requirements and found the real change in hiring amounted to fewer than 1 in 700 hires in the year studied (Skills-Based Hiring: The Long Road from Pronouncements to Practice, February 2024). Employers talk about skills far more than they act on them. The candidates who benefit are the ones who make their skills impossible to miss.</p>
            <div className="callout">
              <strong>The takeaway:</strong> a certificate tells an employer you studied. A project, an internship or a passed skills test tells them you can do the job. Our <Link to="/reports/proof-of-work-report-projects-github-portfolio-2026" style={{ color: "#c4b5fd" }}>Proof-of-Work Report</Link> covers how to build the second kind of evidence.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: TestGorilla, State of Skills-Based Hiring 2025; TeamLease EdTech Career Outlook Report HY1 2026 via Careers360; NACE Job Outlook 2025; Harvard Business School and Burning Glass Institute, 2024.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">The Surveys That Say Employers Love Certificates</div>
                <div className="sec-sub">Check who paid for the survey before you trust the percentage</div>
              </div>
            </div>
            <p>Search "are certificates worth it" and you will find very large numbers. Almost all of them come from companies that sell certificates. That does not make them false, but it shapes which questions get asked.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Claim</th>
                  <th>Who ran the survey</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>98% of Indian employers say micro-credentials strengthen an application; 97% would offer higher starting pay</td><td>Coursera, Micro-Credentials Impact Report 2025</td><td><span className="tag-pill pill-amber">Vendor</span></td></tr>
                <tr><td>87% of employers globally hired a micro-credential holder last year; 90% would pay more, often 10% to 15%</td><td>Coursera, 2025 (1,000+ employers, 1,200 learners)</td><td><span className="tag-pill pill-amber">Vendor</span></td></tr>
                <tr><td>92% of Indian employers say a professional certificate strengthens an application</td><td>Coursera survey with Dynata and Repdata, 2023</td><td><span className="tag-pill pill-amber">Vendor</span></td></tr>
                <tr><td>85% of Indian graduates say certifications improved their employability or earnings</td><td>CFA Institute Graduate Outlook Survey 2025</td><td><span className="tag-pill pill-amber">Vendor, self-reported</span></td></tr>
                <tr><td>97% of IT decision-makers say certified staff add value</td><td>Skillsoft IT Skills and Salary Report 2024 (5,100+ responses)</td><td><span className="tag-pill pill-amber">Vendor, existing staff</span></td></tr>
              </tbody>
            </table>
            <p>Three things to notice. First, "more likely to hire" is a soft question: almost any employer will say a credential does not hurt. Second, the CFA Institute figure measures what graduates believe, not what employers did. Third, the Skillsoft figure is about certifying people already on the payroll, which is a different decision from shortlisting a stranger with no experience.</p>
            <div className="highlight">
              The independent data in section 2 asks what employers actually do: test skills, weigh internships, look at projects. The vendor data asks whether they like credentials. Both can be true at once. Only one tells you what gets you the interview.
            </div>
            <div className="callout">
              <strong>Use vendor numbers carefully:</strong> they are fine as a reason to finish a credential you have started. They are not a reason to spend lakhs on a stack of certificates in place of building something.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Coursera Micro-Credentials Impact Report 2025 (Coursera blog, April 2025; Millennium Post, May 2025); Careers360, February 2023; CFA Institute Graduate Outlook Survey 2025 via ThePrint, July 2025; Skillsoft, November 2024.</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">What Each Certificate Costs</div>
                <div className="sec-sub">From free to several lakh, and price does not track value</div>
              </div>
            </div>
            <p>Costs range from about 1,000 rupees to several lakh. The official prices below are per attempt and can change; AWS updates its exam prices at least once a year. Where we only found coaching-institute estimates, we say so.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Certificate</th>
                  <th>Cost (India)</th>
                  <th>What you are paying for</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>NPTEL (IITs, IISc)</td><td>Course free; about ₹1,000 per proctored exam, 50% waiver for SC/ST and eligible PwD</td><td>Proctored exam in 170+ cities</td></tr>
                <tr><td>Google Career Certificates</td><td>20 US dollars a month on Coursera; 3 to 6 months typical</td><td>Structured course, no proctored exam</td></tr>
                <tr><td>Microsoft AZ-900 (Azure Fundamentals)</td><td>₹3,691 shown for India on a Microsoft Learn answer (99 US dollars list)</td><td>Proctored exam</td></tr>
                <tr><td>AWS Foundational (Cloud Practitioner)</td><td>₹8,553 plus applicable taxes</td><td>Proctored exam</td></tr>
                <tr><td>AWS Associate (e.g. Solutions Architect)</td><td>₹12,829.50 plus applicable taxes</td><td>Proctored exam, role-level</td></tr>
                <tr><td>AWS Professional or Specialty</td><td>₹25,659 plus applicable taxes</td><td>Proctored exam, experienced level</td></tr>
                <tr><td>ACCA (full qualification)</td><td>Reported totals vary from about 1.1 lakh to 5.5 lakh with coaching</td><td>Professional qualification; estimates from coaching institutes</td></tr>
                <tr><td>Udemy course certificate</td><td>Price of the course</td><td>Completion record; Udemy says it is not an accredited institution</td></tr>
              </tbody>
            </table>
            <p>The pattern: the cheapest serious option, NPTEL, has a proctored exam, while some paid course certificates have none. CFA Level I is the expensive outlier in finance, and its difficulty is the point: the August 2025 Level I pass rate was 43%, with 11,262 of 26,192 candidates passing (CFA Institute). A certificate that many people fail tells an employer more than one that everyone who pays receives.</p>
            <div className="callout">
              <strong>Before you pay:</strong> check whether the exam is proctored, whether the certificate can be verified online by an employer, and whether the job descriptions you want actually name it. If the answer to all three is no, the money is buying a course, not a signal.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: AWS certification policies page; NPTEL exam announcements 2025; Careers360, Sept 2025; Google Career Certificates India page; Microsoft Learn Q&amp;A; ACCA fee estimates from coaching institutes (indicative); Udemy support; CFA Institute, August 2025 results.</p>
          </div>
          <StuCta via="report-certifications-that-get-freshers-hired-2026" place="report-mid" size="quiet" title="Stu finds roles that fit your skills and the people hiring for them, after one short call." />

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Most People Never Finish</div>
                <div className="sec-sub">MOOC completion rates are low, which is why finishing still means something</div>
              </div>
            </div>
            <p>The best long-run data on online course completion comes from Harvard and MIT's courses on edX. Justin Reich and José Ruipérez-Valiente analysed 261 courses and 5.63 million learners and found only 3.13% completed their courses in 2017-18, down from nearly 6% in 2014-15. Even learners who paid for a verified certificate only finished 46% of the time, down from 56% the year before (Science, 2019, via Inside Higher Ed). Of 1.1 million first-time learners in 2015-16, just 12% took another course the next year.</p>
            <p>NPTEL shows the same funnel in India. Since 2014, NPTEL recorded over 1.58 crore enrolments, but only 15.7 lakh learners registered for the certification exam and 8,94,316 were certified: 5.66% of enrollees and 56.8% of those who registered. In recent semesters about 42% of registrants passed, for example over 1.1 lakh certified in January to April 2023 (Careers360, September 2025). Careers360 notes that NPTEL's headline enrolment figures vary between its own articles, so treat the totals as approximate.</p>
            <div className="chart-wrap">
              <div className="chart-label">Share who finished or were certified, % (Science 2019 via Inside Higher Ed; Careers360, 2025)</div>
              <div style={{ height: 300 }}>
                <canvas id="cfhCompletionChart" />
              </div>
            </div>
            <p>Two lessons. First, a certificate from a course with a proctored exam and a real failure rate is rarer than you think, and that rarity is why NPTEL or a cloud exam carries some weight. Second, paying is the strongest predictor of finishing in the edX data, so if you start a paid course, finish it; an abandoned course is money spent with nothing to show.</p>
            <div className="callout">
              <strong>Practical rule:</strong> one finished, proctored certificate plus one project using that skill is worth more on a fresher resume than five half-done course badges.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Reich and Ruipérez-Valiente, "The MOOC Pivot", Science, 2019, reported by Inside Higher Ed; Careers360, "Why is NPTEL certification success rate so low", updated September 2025.</p>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">The Ranking: High, Medium and Low Signal</div>
                <div className="sec-sub">Our judgement from the data above, for an Indian fresher in 2026</div>
              </div>
            </div>
            <p>This ranking is our reading of the evidence in sections 1 to 5, not a survey result. We scored each certificate on four things: does it appear in job descriptions, is the exam proctored, can a meaningful share of people fail it, and can an employer verify it. A certificate that scores on all four is a strong signal. One that scores on none is a receipt.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Signal</th>
                  <th>Certificate</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><span className="tag-pill pill-green">High</span></td><td>AWS, Azure or Google Cloud associate-level</td><td>Named in cloud JDs, proctored, verifiable. Best with a deployed project.</td></tr>
                <tr><td><span className="tag-pill pill-green">High</span></td><td>CFA Level I cleared; ACCA papers passed</td><td>Known to finance employers; Level I pass rate 43% in August 2025.</td></tr>
                <tr><td><span className="tag-pill pill-green">High</span></td><td>Salesforce Administrator (for Salesforce ecosystem roles)</td><td>Named in partner firm JDs; useless outside that niche.</td></tr>
                <tr><td><span className="tag-pill pill-amber">Medium</span></td><td>NPTEL with a strong score (Elite or Gold)</td><td>Proctored, run by IITs, cheap, can count as credit. Rarely named in JDs.</td></tr>
                <tr><td><span className="tag-pill pill-amber">Medium</span></td><td>Foundational cloud exams (AWS Cloud Practitioner, AZ-900)</td><td>Proctored and verifiable, but entry-level and seldom the one JDs ask for.</td></tr>
                <tr><td><span className="tag-pill pill-amber">Medium</span></td><td>Google Career Certificates</td><td>Structured and cheap at 20 US dollars a month, but no proctored exam and no published India hiring outcomes.</td></tr>
                <tr><td><span className="tag-pill pill-red">Low</span></td><td>Single Coursera or Udemy course completion certificates</td><td>Not named in JDs, no proctored exam; Udemy itself says it is not accredited.</td></tr>
                <tr><td><span className="tag-pill pill-red">Low</span></td><td>Paid "internship certificates" and workshop participation certificates</td><td>Prove attendance or payment, not skill.</td></tr>
              </tbody>
            </table>
            <div className="highlight">
              Any certificate moves up a level when it comes with a project that uses the skill. A Google Data Analytics certificate plus a public dashboard on real data is worth more than the certificate alone. A Coursera course plus a deployed app is worth more than either.
            </div>
            <div className="callout">
              <strong>If you have limited money:</strong> do the free NPTEL course and pay ₹1,000 for the exam, or take one associate-level cloud exam aligned with the JDs you want. Put the rest of your time into one project you can show in an email.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Studojo analysis of the sources cited in sections 1 to 5; CFA Institute, August 2025; Udemy support; Google Career Certificates India page.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The questions freshers ask about certificates, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to spend your time and money on certificates</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The data points to a short plan for a fresher in India:</p>
            <div className="blist">
              {[
                ["Let job descriptions choose", "Read ten JDs for your target role. Only chase a certificate that several of them name."],
                ["Pick proctored over pretty", "An exam people can fail (NPTEL, cloud associate, CFA Level I) says more than a course badge anyone who pays receives."],
                ["Pair every certificate with a project", "Employers test skills and weigh internships and projects. Build one thing that uses what the certificate covers."],
                ["Discount vendor surveys", "When the survey comes from the company selling the course, read the percentage as marketing."],
                ["Put the proof in front of a person", "A certificate on a portal is a line in a pile. A short email to the hiring manager, with your project linked, is a reason to talk."],
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
              <Link to="/reports/proof-of-work-report-projects-github-portfolio-2026" className="related-card">
                <div className="rc-kicker">Proof of work</div>
                <div className="rc-title">The Proof-of-Work Report 2026: Projects, GitHub and Portfolios</div>
              </Link>
              <Link to="/reports/cybersecurity-internship-report-2026" className="related-card">
                <div className="rc-kicker">Cybersecurity</div>
                <div className="rc-title">The Cybersecurity Internship Report: Stop Collecting Certificates</div>
              </Link>
              <Link to="/reports/degree-vs-skills-2026" className="related-card">
                <div className="rc-kicker">Hiring</div>
                <div className="rc-title">Degree vs Skills: What Hirers Actually Look at in 2026</div>
              </Link>
            </div>
          </div>
          <StuCta via="report-certifications-that-get-freshers-hired-2026" place="report-end" size="card" title="Done with certificates? Start reaching people." line="Tell Stu the role, the city and the pay you want in one short call. Stu finds jobs that fit you, finds who's hiring and writes the email to them." />
        </div>
      </main>
      <Footer />
    </>
  );
}
