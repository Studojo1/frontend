import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How to Get an Internship at DRDO and ISRO in 2026: Eligibility, Duration, Stipend and the Official Route | Studojo" },
    { name: "description", content: "How to get an internship at DRDO and ISRO in 2026: verified eligibility, duration, stipend (often none) and the institute letter rule, from the official DRDO, ISRO, BEL and BHEL sites." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "how to get an internship at DRDO and ISRO, isro internship 2026, internship at drdo eligibility, drdo internship for cse, BEL BHEL internship" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/drdo-isro-internship-report-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How to Get an Internship at DRDO and ISRO in 2026" },
    { property: "og:description", content: "Verified eligibility, duration and stipend for ISRO and DRDO internships, the institute letter rule, and the one move that gets you read inside the official process." },
    { property: "og:url", content: `${BASE_URL}/reports/drdo-isro-internship-report-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-07T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How to Get an Internship at DRDO and ISRO in 2026 | Studojo" },
    { name: "twitter:description", content: "Eligibility, duration, stipend and the official route at ISRO, DRDO, BEL and BHEL, verified from their own sites." },
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

  // Chart 1: does the official programme pay a stipend? (official DRDO and ISRO pages, Nov 2026)
  const payEl = document.getElementById("drdStipendChart") as HTMLCanvasElement | null;
  if (payEl && !payEl.dataset.rendered) {
    payEl.dataset.rendered = "1";
    new Chart(payEl, {
      type: "doughnut",
      data: {
        labels: ["ISRO: no stipend", "DRDO: paid, varies by lab", "BHEL student training: usually unpaid"],
        datasets: [{
          data: [1, 1, 1],
          backgroundColor: [RED, GREEN, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}` } },
        },
      },
    });
  }

  // Chart 2: monthly stipend where it is paid, two DRDO labs (official DRDO notifications, 2026)
  const labEl = document.getElementById("drdLabChart") as HTMLCanvasElement | null;
  if (labEl && !labEl.dataset.rendered) {
    labEl.dataset.rendered = "1";
    new Chart(labEl, {
      type: "bar",
      data: {
        labels: ["DRDO CASDIC (per month)", "DRDO DIPAS (monthly average)", "ISRO (any centre)"],
        datasets: [{
          label: "Rupees per month",
          data: [5000, 5000, 0],
          backgroundColor: [VIOLET, VIOLET2, RED],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw === 0 ? "No stipend" : "Rs " + ctx.raw + " a month"}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `Rs ${v}` } },
        },
      },
    });
  }

  // Chart 3: the odds on one mass online application (illustrative, based on 0.1% to 2% per application, The Interview Guys, Apr 2026)
  const oddsEl = document.getElementById("drdOddsChart") as HTMLCanvasElement | null;
  if (oddsEl && !oddsEl.dataset.rendered) {
    oddsEl.dataset.rendered = "1";
    new Chart(oddsEl, {
      type: "bar",
      data: {
        labels: ["Applications sent", "Interviews (illustrative)"],
        datasets: [{
          label: "Out of 100 online applications",
          data: [100, 1.5],
          backgroundColor: [VIOLET3, VIOLET],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} of 100` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
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
    q: "What is the eligibility for an ISRO internship in 2026?",
    a: "For the ISRO Internship Scheme you must be an Indian citizen in a UG, PG or PhD programme at a recognised institution, with a minimum 60% aggregate or CGPA 6.32 on a 10-point scale (ISRO, isro.gov.in, 2026). For the Student Project Trainee Scheme, BE and BTech students need to have completed the 6th semester, and BSc and Diploma are for final-year students only. Each ISRO centre runs its own application, so confirm the current rule on the centre's own page.",
  },
  {
    q: "What is the eligibility for an internship at DRDO?",
    a: "DRDO's Paid Internship Scheme 2026-27 is for final-year students only, pursuing BE, BTech, ME, MTech or MSc at UGC or AICTE approved institutions (official DRDO lab notifications, drdo.gov.in, 2026). Individual labs add their own cut-offs, for example DRDO CASDIC asks for a BE or BTech final-year CGPA of at least 7.5 and an age below 25. There is no central portal, so you apply to the specific lab, and the official scheme asks the Dean, HoD, Director or Principal to send a request letter for the student.",
  },
  {
    q: "Does DRDO or ISRO pay a stipend for internships?",
    a: "ISRO pays nothing: its official page states that project trainees and interns are not eligible for any stipend, remuneration or financial assistance (ISRO, isro.gov.in, 2026). DRDO's internship is a Paid Internship Scheme, but the amount varies by lab, for example Rs 5,000 a month at CASDIC and a total of Rs 30,000 over six months at DIPAS, paid in two installments (official DRDO notifications, 2026). Always check the exact stipend on the lab's own notification before you apply.",
  },
  {
    q: "Is there a DRDO internship for CSE students?",
    a: "Yes, several DRDO labs invite engineering students across disciplines, and the DIPAS notification names Computer Science among the eligible branches (DRDO DIPAS notification, 2026). Because DRDO internships are lab by lab, a CSE student should scan the live notifications on drdo.gov.in and apply to the labs whose work matches software, signals or computing. The deciding step is a short, specific note to the right group about what you can build for them.",
  },
  {
    q: "How do BEL and BHEL internships work for students?",
    a: "BEL and BHEL mainly run course-based industrial training and project work for students, and that student track is usually unpaid, so confirm any stipend with the unit in writing. BEL's paid Management Industrial Trainee roles, around Rs 25,000 to Rs 30,000 a month, are a recruitment role for CA or CMA Inter candidates, not a student internship (BEL, bel-india.in, 2026). BHEL's apprentice intake is separate again: its Trichy notification of 14 August 2026 listed 530 apprentice posts with a trade stipend near Rs 10,560 to Rs 11,040 a month (BHEL, bhel.com, 2026).",
  },
  {
    q: "What is the best way to get noticed for a DRDO or ISRO internship?",
    a: "Follow the official process exactly, then add one move inside it: a short, specific note to the right lab or group about their actual work and what you can contribute. Spraying generic applications does not help, and a single mass online application converts at roughly 0.1% to 2% (The Interview Guys, April 2026). The people who get read are the ones who found the right team and wrote to them like a person, not a form.",
  },
];

export default function DrdoIsroInternshipReport() {
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
        "headline": "How to Get an Internship at DRDO and ISRO in 2026",
        "description": "Verified eligibility, duration and stipend for ISRO and DRDO internships, the institute letter rule at BEL and BHEL, and the one move that gets you read inside the official process.",
        "url": `${BASE_URL}/reports/drdo-isro-internship-report-2026`,
        "datePublished": "2026-11-07T00:00:00Z",
        "dateModified": "2026-11-07T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/drdo-isro-internship-report-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "DRDO and ISRO Internship Report 2026", "item": `${BASE_URL}/reports/drdo-isro-internship-report-2026` },
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
              <span>DRDO and ISRO Internship Report 2026</span>
            </nav>
            <h1>How to Get an Internship at DRDO and ISRO, <em>the Official Route</em></h1>
            <p className="rpt-hero-sub">
              The eligibility, duration, stipend and the institute letter rule, checked on 7 November 2026
              from DRDO, ISRO, BEL and BHEL's own sites. Every number is sourced. Where an official page
              does not state a figure, we say so instead of guessing.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · students and freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Sources</span>
                <span className="rpt-meta-value">DRDO, ISRO, BEL, BHEL (official)</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Verified</span>
                <span className="rpt-meta-value">7 November 2026</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>ISRO pays no stipend.</strong> Its official page states project trainees and interns are not eligible for any stipend, remuneration or financial assistance (ISRO, isro.gov.in, 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>ISRO eligibility</strong> is UG, PG or PhD with a minimum 60% aggregate or CGPA 6.32 on 10, and the Internship Scheme runs for a maximum of 45 days (ISRO, isro.gov.in, 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>DRDO runs a Paid Internship Scheme for final-year students, lab by lab, for six months.</strong> The official scheme asks the Dean, HoD, Director or Principal to send a request letter for the student (DRDO lab notifications, drdo.gov.in, 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>DRDO stipends vary by lab:</strong> Rs 5,000 a month at CASDIC and Rs 30,000 total over six months at DIPAS, each paid in two installments (official DRDO notifications, 2026). Confirm the amount on the lab's own page.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The deciding move inside the official process:</strong> a short, specific note to the right lab or group about their work. Stu finds that person, verifies their work email, and writes the note for you.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">Rs 0</div>
              <div className="sc-label">ISRO stipend: no remuneration or financial assistance</div>
              <div className="sc-source">ISRO, isro.gov.in, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">6 months</div>
              <div className="sc-label">duration of the DRDO Paid Internship Scheme, final year only</div>
              <div className="sc-source">DRDO notifications, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">0.1 to 2%</div>
              <div className="sc-label">typical success rate of one mass online application (reported)</div>
              <div className="sc-source">The Interview Guys, Apr 2026</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">How to get an internship at DRDO and ISRO: start with the official route</div>
                <div className="sec-sub">Why there is no single portal and what that means for you</div>
              </div>
            </div>
            <p>How do you get an internship at DRDO and ISRO in 2026? You follow each organisation's own official process, which is not one portal but many. ISRO internships are offered by its individual centres, and DRDO internships are offered lab by lab, with no central application. That is the first thing to get right: there is no magic form that reaches all of them, so you work through the official pages of the specific centre or lab you want.</p>
            <p>This report checks the real rules from the source. On 7 November 2026 we read ISRO's own internship page (isro.gov.in), DRDO's lab notifications (drdo.gov.in), and BEL and BHEL's student training information. Where an official page states a number, we cite it. Where it does not, we say so and tell you to confirm on the official site, because these schemes change and guessing helps nobody.</p>
            <div className="callout">
              <strong>The honest frame:</strong> these are competitive, government research internships. The official process is non-negotiable, and this report walks you through it. Inside that process, one small move separates the students who get read from the ones who do not. We get to it in section five.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">ISRO internship 2026: eligibility, duration and the no-stipend rule</div>
                <div className="sec-sub">Straight from isro.gov.in</div>
              </div>
            </div>
            <p>ISRO runs two tracks on its official page: the Internship Scheme and the Student Project Trainee Scheme. For both, you must be an Indian citizen from a recognised university with a minimum 60% aggregate or CGPA 6.32 on a 10-point scale (ISRO, isro.gov.in, 2026). The Internship Scheme runs for a maximum of 45 days. The Student Project Trainee Scheme sets the year of study by degree: BE and BTech must have completed the 6th semester, ME, MTech and MSc must have completed the 1st semester, and BSc and Diploma are for final-year students only.</p>
            <p>On pay, ISRO is blunt. Its page states that project trainees and interns are not eligible for any stipend, remuneration or financial assistance (ISRO, isro.gov.in, 2026). Accommodation is not provided either, though a guest house or hostel may be available on a paid basis. So an ISRO internship is for the experience and the certificate, not the money. Each centre runs its own application and schedule, so the exact window and form live on the centre's page, not on the central site.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ISRO track</th>
                  <th>Who is eligible</th>
                  <th>Duration</th>
                  <th>Stipend</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Internship Scheme</td><td>UG, PG, PhD; min 60% or CGPA 6.32</td><td>Max 45 days</td><td><span className="tag-pill pill-amber">None</span></td></tr>
                <tr><td>Student Project Trainee (BE, BTech)</td><td>Completed 6th semester</td><td>Min 45 days</td><td><span className="tag-pill pill-amber">None</span></td></tr>
                <tr><td>Student Project Trainee (ME, MTech, MSc)</td><td>Completed 1st semester</td><td>Min 120 days</td><td><span className="tag-pill pill-amber">None</span></td></tr>
                <tr><td>Student Project Trainee (BSc, Diploma)</td><td>Final-year students only</td><td>Min 45 days</td><td><span className="tag-pill pill-amber">None</span></td></tr>
              </tbody>
            </table>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: ISRO, Internship and Student Project Trainee Schemes (isro.gov.in), read 7 November 2026. Confirm the current rule and the application window on the specific centre's page before you apply.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Internship at DRDO: eligibility, the six-month duration and stipend by lab</div>
                <div className="sec-sub">A paid scheme, but the amount depends on the lab</div>
              </div>
            </div>
            <p>DRDO's internship is a Paid Internship Scheme 2026-27, and its lab notifications on drdo.gov.in share the same spine: it is for final-year students only, pursuing BE, BTech, ME, MTech or MSc at UGC or AICTE approved institutions, and it runs for six months with the stipend paid in two installments, after three months and after six months (official DRDO notifications, drdo.gov.in, 2026). Selection is on academic merit, with no written exam. Where a lab adds its own cut-off, it is specific: DRDO CASDIC asks a BE or BTech final-year student for a CGPA of at least 7.5, an MSc student for 70% in the first year, and an age below 25 (DRDO CASDIC notification, 2026).</p>
            <p>The amount is where you have to read carefully, because it is not uniform. CASDIC's notification sets Rs 5,000 a month. The DIPAS notification sets a total of Rs 30,000 for the six months, paid as two installments of Rs 15,000 (official DRDO notifications, 2026). Other labs set their own figure. We did not find one single DRDO-wide stipend number on the official pages, so treat each lab's notification as the only figure that applies to you.</p>
            <div className="chart-wrap">
              <div className="chart-label">Monthly stipend where it is paid (official DRDO notifications 2026; ISRO for contrast)</div>
              <div style={{ height: 260 }}>
                <canvas id="drdLabChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>DRDO lab</th>
                  <th>Eligibility snapshot</th>
                  <th>Stipend</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>CASDIC</td><td>BE, BTech final year CGPA 7.5; MSc 2nd year, 70% in 1st year; age below 25</td><td><span className="tag-pill pill-green">Rs 5,000 a month</span> two installments</td></tr>
                <tr><td>DIPAS (and DIBER)</td><td>BE, BTech or ME, MTech final year; branches include CSE; no active backlogs</td><td>Rs 30,000 total over 6 months, two installments</td></tr>
                <tr><td>Other DRDO labs</td><td>Final-year UG or PG engineering or science</td><td>Varies; read the lab's own notification</td></tr>
              </tbody>
            </table>
            <div className="highlight">
              <strong>Internship at DRDO eligibility, in one line:</strong> final year, strong academics, no central portal. The lab notification is the only source of truth for its own stipend, dates and branches, so read it before anything else.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: DRDO Paid Internship Scheme 2026-27 lab notifications (drdo.gov.in), including CASDIC and DIPAS, read 7 November 2026.</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">The college letter rule, and what DRDO internship for CSE students looks like</div>
                <div className="sec-sub">The institute recommendation is not optional</div>
              </div>
            </div>
            <p>Here is the rule that trips up most applicants. The official DRDO scheme does not accept a student application on its own. It asks the institute to send it: the Dean, HoD, Director or Principal should send a request letter for the paid internship for their deserving students (official DRDO notifications, drdo.gov.in, 2026). Some labs name this a referral or sponsorship letter, for example the DIPAS notification asks for a referral or sponsorship letter from your college Principal or Head of Department, plus mark sheets, an Aadhaar card and photos. ISRO centres route applications through institutes in a similar spirit. So your first job is not the email to the lab, it is getting your department to back you.</p>
            <p>A DRDO internship for CSE students is real, not a workaround. The DIPAS notification names Computer Science among its eligible branches, and several labs invite engineering students across disciplines (DRDO DIPAS notification, 2026). Because the scheme is lab by lab, a CSE student should scan the live notifications on drdo.gov.in and apply to the labs whose work touches software, signals, data or computing, rather than hoping one generic application lands everywhere.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>What the official process asks for</th>
                  <th>What you do about it</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Request letter from Dean, HoD, Director or Principal (DRDO)</td><td>Ask your department early; this gates your whole application.</td></tr>
                <tr><td>Final-year status and strong academics</td><td>Check the specific lab's cut-off; CASDIC wants CGPA 7.5, others differ.</td></tr>
                <tr><td>Application to the specific lab, not a central portal</td><td>Find the lab whose work matches you and follow its notification exactly.</td></tr>
                <tr><td>Mark sheets, Aadhaar, photos, biodata</td><td>Keep a clean set ready so a short window does not catch you out.</td></tr>
                <tr><td>Check the window; these open and close fast</td><td>Watch drdo.gov.in and the centre pages; confirm dates at the source.</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>Confirm at the source:</strong> stipends, windows and branch lists change between intakes. Everything here was read on 7 November 2026, but the official lab or centre page is what you act on, not a summary.
            </div>
          </div>

          <StuCta via="report-drdo-isro-internship-report-2026" place="report-mid" size="quiet" title="One short call with Stu, and you get matches that fit you plus the person who runs the team hiring for each one." />

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The move that works inside the official process: write to the right group</div>
                <div className="sec-sub">A short, specific note beats a generic application</div>
              </div>
            </div>
            <p>Follow the official route to the letter, then add one thing that almost nobody does: a short, specific note to the right lab or group about their actual work. DRDO and ISRO are full of named teams doing named things, propulsion, radar, remote sensing, materials, software. A student who reads a group's work, then writes three honest lines about why that group and what they could contribute, stands out against a stack of identical forms routed through the same channel.</p>
            <p>Why does this matter so much? Because volume is not the lever. A single mass online application converts at roughly 0.1% to 2%, and a typical opening draws about 242 applicants (The Interview Guys, April 2026). Spraying the same application at every lab is the pattern that gets screened out, not read. One good note to the right person, inside the official process, does the opposite.</p>
            <div className="chart-wrap">
              <div className="chart-label">The odds on one mass online application (illustrative, based on 0.1% to 2% per application)</div>
              <div style={{ height: 220 }}>
                <canvas id="drdOddsChart" />
              </div>
            </div>
            <p>This is the part we built Studojo to do. You start with one short call with Stu, your career agent: tell Stu the field, the city and the pay you want, by talking or typing. Stu finds roles that fit you, finds who is hiring or who runs the relevant team, usually a team lead or a recruiter for the role, with a verified work email, and writes a short, personal note on why you fit, from your real work. Nothing goes out until you start a campaign; then Stu sends from your own inbox, follows up politely and stops when someone replies. Replies are not guaranteed, and Stu does not mass apply for you. The point is the opposite of spraying: one good note to the right person. You can <a href="https://platform.studojo.com/join?via=report-drdo-isro-internship-report-2026&amp;how=voice" data-stu-start="">tell Stu what you want</a> and see your top matches for free.</p>
            <div className="pull-quote">
              <p>Being one specific note in the right group's inbox beats being one of hundreds of identical forms. Inside the official process, that is the whole game.</p>
              <span className="pq-source">The argument of this report, in one line</span>
            </div>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">BEL BHEL internship routes, and how they differ from DRDO and ISRO</div>
                <div className="sec-sub">Student training is mostly unpaid; the paid roles are recruitment</div>
              </div>
            </div>
            <p>If you are weighing a BEL or BHEL internship, read the label carefully, because the paid-sounding programmes are often not student internships at all. BEL mainly offers course-based industrial training and project work to students, and that student track is usually unpaid, so confirm any stipend with the unit in writing. BEL's paid Management Industrial Trainee roles, around Rs 25,000 to Rs 30,000 a month, are a recruitment role for CA or CMA Inter candidates, not a summer internship for an engineering student (BEL, bel-india.in, 2026).</p>
            <p>BHEL is similar. Its student vocational and summer training is generally unpaid, with at most a small honorarium that varies by unit. The paid track there is the apprentice intake, which is separate: BHEL's Trichy notification of 14 August 2026 listed 530 apprentice posts across trade, technician and graduate categories, with a trade apprentice stipend near Rs 10,560 to Rs 11,040 a month (BHEL, bhel.com, 2026). We did not find a single official BHEL summer-internship stipend figure, so we are not inventing one; confirm it with the unit.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Programme</th>
                  <th>Who it is for</th>
                  <th>Pay</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>BEL student industrial training and project work</td><td>Engineering and diploma students, course-based</td><td><span className="tag-pill pill-amber">Usually unpaid</span> confirm in writing</td></tr>
                <tr><td>BEL Management Industrial Trainee</td><td>CA or CMA Inter candidates (recruitment, not an internship)</td><td>Rs 25,000 to Rs 30,000 a month</td></tr>
                <tr><td>BHEL vocational and summer training</td><td>Engineering, diploma and ITI students</td><td>Usually unpaid; confirm with the unit</td></tr>
                <tr><td>BHEL apprentice intake (Trichy, 2026)</td><td>ITI, diploma and graduate candidates</td><td><span className="tag-pill pill-green">Trade near Rs 10,560 to 11,040</span> a month</td></tr>
              </tbody>
            </table>
            <div className="highlight">
              Whatever the organisation, the pattern holds: student internships are often unpaid, the process is run by institutes, and the thing you control is writing well to the right team. Get the stipend in writing before you accept.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: BEL (bel-india.in) and BHEL (bhel.com) training and apprentice information, read 7 November 2026. BHEL apprentice figures from the Trichy notification dated 14 August 2026.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The questions students ask about DRDO, ISRO, BEL and BHEL internships, answered directly</div>
              </div>
            </div>
            {FAQ.map((f) => (
              <div className="faq-item" key={f.q}>
                <div className="faq-q">{f.q}</div>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>

          {/* Chart 1 lives in the takeaway context */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">✓</div>
              <div>
                <div className="sec-title">Stipend at a glance</div>
                <div className="sec-sub">Who pays, who does not, verified from official pages</div>
              </div>
            </div>
            <p>The single biggest surprise for students is that the most famous names often pay the least, or nothing. ISRO pays no stipend at all. DRDO pays, but the amount depends entirely on the lab. BHEL's student training is usually unpaid, while its separate apprentice intake pays. Here is the shape of it.</p>
            <div className="chart-wrap">
              <div className="chart-label">Does the official programme pay a stipend? (official DRDO, ISRO, BHEL pages, Nov 2026)</div>
              <div style={{ height: 260 }}>
                <canvas id="drdStipendChart" />
              </div>
            </div>
            <p className="sc-source">Source: ISRO (isro.gov.in), DRDO lab notifications (drdo.gov.in), BHEL (bhel.com), read 7 November 2026. The chart shows pay status by programme, not amounts.</p>
          </div>

          {/* Takeaway */}
          <div className="takeaway-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6d28d9" }}>→</div>
              <div>
                <div className="sec-title" style={{ color: "#3b0764" }}>What This Means For You</div>
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to run the official process without getting lost in it</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The verified data points to a simple plan:</p>
            <div className="blist">
              {[
                ["Pick the centre or lab, not the organisation", "ISRO and DRDO both work centre by centre and lab by lab. Choose the ones whose work actually matches you."],
                ["Get your institute letter early", "DRDO needs a request from your Dean, HoD, Director or Principal. That gates everything, so start there."],
                ["Read the real figures at the source", "ISRO pays nothing; DRDO pays but varies by lab. Confirm the stipend, dates and branches on the official page."],
                ["Add one specific note inside the process", "A short, honest line to the right group about their work beats a generic form every time."],
                ["Let Stu do the slow parts", "Finding who runs the team, verifying the email and drafting the note is what Stu does after one short call."],
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
              <Link to="/reports/pm-internship-scheme-report-2026" className="related-card">
                <div className="rc-kicker">Internships</div>
                <div className="rc-title">The PM Internship Scheme Report: Stipend, Eligibility and Dropouts</div>
              </Link>
              <Link to="/reports/government-vs-private-job-report-why-crores-apply-2026" className="related-card">
                <div className="rc-kicker">Careers</div>
                <div className="rc-title">Government vs Private Job: Why Crores Apply in 2026</div>
              </Link>
              <Link to="/reports/how-to-get-an-internship-india-2026" className="related-card">
                <div className="rc-kicker">Internships</div>
                <div className="rc-title">How to Get an Internship in India in 2026</div>
              </Link>
            </div>
          </div>

          <StuCta via="report-drdo-isro-internship-report-2026" place="report-end" size="card" title="Want a research internship that actually fits you?" line="Tell Stu the field, the city and the pay you want in one short call. Stu finds roles that fit you, finds who runs the team hiring and writes the note to them, sent from your own inbox once you start a campaign." />
        </div>
      </main>
      <Footer />
    </>
  );
}
