import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "US Internships for International Students 2026: CPT, OPT and How to Get Hired | Studojo" },
    { name: "description", content: "How F-1 international students legally intern in the US: CPT vs OPT, STEM OPT, who authorizes what, and how to find employers that do not filter you out." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "US internship international students 2026, CPT internship, OPT, F1 visa internship, can international students do internships in usa, day 1 cpt, international student jobs usa" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/us-internships-international-students-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "US Internships for International Students 2026: CPT, OPT and How to Get Hired" },
    { property: "og:description", content: "CPT vs OPT explained, what STEM OPT adds, and how F-1 students find US internships that do not filter them out." },
    { property: "og:url", content: `${BASE_URL}/reports/us-internships-international-students-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-19T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "US Internships for International Students 2026 | Studojo" },
    { name: "twitter:description", content: "CPT, OPT and STEM OPT explained, plus how to find US internships that hire international students." },
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

  // Chart 1: months of OPT authorization (standard rules)
  const optEl = document.getElementById("usiOptChart") as HTMLCanvasElement | null;
  if (optEl && !optEl.dataset.rendered) {
    optEl.dataset.rendered = "1";
    new Chart(optEl, {
      type: "bar",
      data: {
        labels: ["Standard OPT", "STEM OPT extension", "Total with STEM extension"],
        datasets: [{
          label: "Months",
          data: [12, 24, 36],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} months` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 40, ticks: { font: { size: 11 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 2: where to spend search effort (illustrative)
  const effortEl = document.getElementById("usiEffortChart") as HTMLCanvasElement | null;
  if (effortEl && !effortEl.dataset.rendered) {
    effortEl.dataset.rendered = "1";
    new Chart(effortEl, {
      type: "doughnut",
      data: {
        labels: [
          "Employers with a record of hiring international students",
          "Direct outreach to hiring managers",
          "Open job board applications",
        ],
        datasets: [{
          data: [45, 35, 20],
          backgroundColor: [GREEN, VIOLET, ORANGE],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of effort (suggested)` } },
        },
      },
    });
  }

  // Chart 3: employer type openness to international interns (editorial rating)
  const openEl = document.getElementById("usiOpenChart") as HTMLCanvasElement | null;
  if (openEl && !openEl.dataset.rendered) {
    openEl.dataset.rendered = "1";
    new Chart(openEl, {
      type: "bar",
      data: {
        labels: [
          "Large tech and consulting firms",
          "Universities and research labs",
          "Funded startups",
          "Small businesses",
          "Government and defense roles",
        ],
        datasets: [{
          label: "Openness (1-5)",
          data: [4, 4, 3, 2, 1],
          backgroundColor: [GREEN, GREEN, VIOLET2, ORANGE, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Openness: ${ctx.raw}/5 (editorial)` } },
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
    q: "Can international students do internships in the USA?",
    a: "Yes. F-1 students can intern in the US through Curricular Practical Training (CPT) while studying or through Optional Practical Training (OPT). Both need authorization first, and you must not start work before it is in place. Your school's DSO is the person to confirm which route fits you.",
  },
  {
    q: "What is CPT?",
    a: "CPT is Curricular Practical Training, work authorization that lets you do an internship as part of your degree program. It must relate to your program of study, and your school's DSO authorizes it. The details vary by school, so ask your international student office before you accept an offer.",
  },
  {
    q: "What is the difference between CPT and OPT?",
    a: "CPT is tied to your curriculum and authorized by your school's DSO. OPT is practical training related to your major, authorized by USCIS, and can be used before or after you complete your program. CPT is employer and role specific. OPT is broader but needs an approved employment authorization document.",
  },
  {
    q: "Do I need OPT for a summer internship?",
    a: "Not always. Many students use CPT for a summer internship because it is tied to the program and authorized by the school. Using OPT for a summer role spends part of your OPT time, so check with your DSO before you decide which to use.",
  },
  {
    q: "How long is STEM OPT?",
    a: "STEM OPT is a 24-month extension on top of the standard 12 months of OPT, for eligible STEM degrees. That makes up to 36 months in total. Eligibility depends on your degree and your employer, so confirm the current rules with your DSO and official USCIS guidance.",
  },
  {
    q: "How do I find internships that hire international students?",
    a: "Target employers with a track record of hiring international students, and skip postings that say they cannot sponsor or support work authorization, unless your CPT or OPT already covers you. Reach out directly to hiring managers and lead with your authorization status in plain words. Studojo's outreach tool helps you find and contact them.",
  },
];

export default function USInternshipsInternationalReport() {
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
        "headline": "US Internships for International Students 2026: CPT, OPT and How to Get Hired",
        "description": "How F-1 international students legally intern in the US: CPT vs OPT, STEM OPT, and how to find employers that hire international students.",
        "url": `${BASE_URL}/reports/us-internships-international-students-2026`,
        "datePublished": "2026-10-19T00:00:00Z",
        "dateModified": "2026-10-19T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/us-internships-international-students-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "US Internships for International Students 2026", "item": `${BASE_URL}/reports/us-internships-international-students-2026` },
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
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · October 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>US Internships for International Students 2026</span>
            </nav>
            <h1>US Internships for <em>International Students</em></h1>
            <p className="rpt-hero-sub">
              You can intern in the US on an F-1 visa, but only with the right
              authorization in place first. This report explains CPT, OPT and STEM OPT in
              plain words, and how to find employers that will not filter you out.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">United States · F-1 students</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">CPT, OPT, hiring</span>
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
          <div className="keyfindings">
            <h2>Key findings</h2>
            <div className="kf-list">
              <div className="kf-item"><span className="kf-check">✓</span><span>F-1 students can intern through <strong>CPT during study</strong> or through <strong>OPT</strong> as practical training.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>CPT needs <strong>authorization from your school DSO</strong> and must relate to your program.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>STEM degrees get a <strong>24-month OPT extension</strong> on top of the standard 12 months.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Timing and paperwork</strong>, not just the offer, decide whether you can start work.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Many postings filter out visa-needers, so <strong>target international-friendly employers</strong>.</span></div>
            </div>
          </div>

          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">12 mo</div>
              <div className="sc-label">standard length of OPT</div>
              <div className="sc-source">USCIS</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">+24 mo</div>
              <div className="sc-label">additional months of OPT for eligible STEM degrees</div>
              <div className="sc-source">USCIS</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">DSO</div>
              <div className="sc-label">your school's designated official authorizes CPT</div>
              <div className="sc-source">USCIS / school international office</div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">The Two Routes: CPT and OPT</div>
                <div className="sec-sub">Two kinds of work authorization, two different gatekeepers</div>
              </div>
            </div>
            <p>If you are on an F-1 visa, you cannot just accept an internship and start. You need work authorization first. The two main routes for internships are CPT and OPT. They look similar from the outside, but they are authorized by different people and tied to different things.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>When</th>
                  <th>Who authorizes</th>
                  <th>How long</th>
                  <th>Ties to</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>CPT</strong></td>
                  <td>During your program</td>
                  <td>Your school DSO</td>
                  <td>Per employer and period, set by your school</td>
                  <td>Your curriculum and the specific job</td>
                </tr>
                <tr>
                  <td><strong>OPT</strong></td>
                  <td>Before or after you complete your program</td>
                  <td>USCIS</td>
                  <td>12 months standard</td>
                  <td>Your field of study</td>
                </tr>
                <tr>
                  <td><strong>STEM OPT</strong></td>
                  <td>After standard OPT, for eligible STEM degrees</td>
                  <td>USCIS</td>
                  <td>24 additional months</td>
                  <td>Your STEM degree and your employer</td>
                </tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">Months of OPT under the standard rules</div>
              <div style={{ height: 260 }}>
                <canvas id="usiOptChart" />
              </div>
            </div>
            <div className="highlight">
              The short version: <strong>CPT is for internships tied to your degree while you study.</strong> OPT is practical training in your field that you apply for through USCIS.
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">How CPT Works</div>
                <div className="sec-sub">Eligibility, the DSO, timing and full versus part time</div>
              </div>
            </div>
            <p>CPT covers internships that are an integral part of your program. Your school decides whether your role qualifies, and your DSO is the one who authorizes it. Rules differ between schools, so the most useful first step is a short email to your international student office.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>It must relate to your program.</strong> A finance internship for a finance student fits. An unrelated role may not.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>You need an offer first.</strong> Your school typically needs the employer, role, dates and hours before it authorizes CPT.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Do not start early.</strong> Work only begins once CPT is authorized on your record. Starting before that can put your status at risk.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Full time and part time are different.</strong> CPT is authorized as one or the other, and heavy full-time use can affect your later OPT eligibility. Ask your DSO how this applies to you.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Day 1 CPT.</strong> You may see this term. Whether CPT is available from your first day depends on your school and program, and it gets extra scrutiny. Check with your DSO and rely on official guidance.</span></div>
            </div>
            <div className="callout">
              <strong>Ask your DSO before you say yes to an offer.</strong> A good internship you cannot legally start is worth nothing, and the paperwork takes time.
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">How OPT and STEM OPT Work</div>
                <div className="sec-sub">Practical training authorized by USCIS</div>
              </div>
            </div>
            <p>OPT is practical training directly related to your field of study. You can use it before you complete your program or after. It is authorized by USCIS, usually through an employment authorization document, and your DSO is involved in the process. You generally cannot start until the approval is in hand.</p>
            <p>Standard OPT is 12 months. If your degree is on the STEM list, you may qualify for a 24-month extension on top, which can bring the total to 36 months. Eligibility depends on your degree and your employer, so verify current requirements with USCIS and your DSO.</p>
            <div className="pull-quote">
              <p>"Using OPT for a summer internship spends part of your OPT time. Plan your months like a budget."</p>
              <span className="pq-source">Studojo guidance, confirm with your DSO</span>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Who Actually Hires International Interns</div>
                <div className="sec-sub">Openness varies a lot by employer type</div>
              </div>
            </div>
            <p>Authorization is half the battle. The other half is finding an employer willing to take on the paperwork and the long-term question of sponsorship. Some employer types are far more open than others. The chart below is an editorial rating, not a measured statistic.</p>
            <div className="chart-wrap">
              <div className="chart-label">Typical openness to international interns by employer type (editorial, 1-5)</div>
              <div style={{ height: 300 }}>
                <canvas id="usiOpenChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Large tech, consulting and finance firms</strong> often have established processes for international students.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Universities and research labs</strong> deal with student authorization all the time.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Funded startups</strong> can be open, but each one is a case by case conversation.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Government and defense roles</strong> usually require citizenship or similar and are a poor fit.</span></div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">How to Find Roles That Do Not Filter You Out</div>
                <div className="sec-sub">Many postings screen out candidates who need sponsorship</div>
              </div>
            </div>
            <p>Many job posts and application forms ask whether you will need visa sponsorship. Answer yes to some of them and you are filtered out automatically. That does not mean the door is closed. It means you should spend effort where the filter is not.</p>
            <div className="chart-wrap">
              <div className="chart-label">Where to spend your search effort (illustrative split)</div>
              <div style={{ height: 260 }}>
                <canvas id="usiEffortChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Read the sponsorship line carefully.</strong> "No sponsorship" usually refers to long-term work visas. Ask whether CPT or OPT work is fine, because for an internship it often is.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>State your authorization plainly.</strong> "I am an F-1 student authorized to work through CPT" answers the question before it becomes a worry.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Reach hiring managers directly.</strong> A short, specific message skips the form filter entirely.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Use your school.</strong> Career offices and alumni networks know which employers have hired international students before.</span></div>
            </div>
            <div className="highlight">
              Studojo's outreach tool finds the right people at the right companies and helps you write the message, so you are not stuck behind a form that screens you out.
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">Timeline and Paperwork</div>
                <div className="sec-sub">Start earlier than feels necessary</div>
              </div>
            </div>
            <p>Paperwork takes time, and the offer is not the last step. Work backward from your start date.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Months before:</strong> talk to your DSO about which route fits and any limits on your program.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>With an offer:</strong> give your DSO the employer, role, dates and hours, and ask what they need from the employer.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Before day one:</strong> confirm your authorization is on record and any required document is in hand. Do not start early.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>During the internship:</strong> keep your DSO updated on any change in role, dates or employer.</span></div>
            </div>
            <div className="callout">
              <strong>Informational only, not legal advice.</strong> Immigration rules change and your situation is specific. Confirm everything with your school's DSO and official USCIS guidance before you act.
            </div>
          </div>

          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">What international students ask most about US internships</div>
              </div>
            </div>
            {FAQ.map((f) => (
              <div className="faq-item" key={f.q}>
                <div className="faq-q">{f.q}</div>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>

          <div className="related">
            <h2>Related reports</h2>
            <div className="related-grid">
              <Link to="/reports/internships-singapore-what-gets-you-hired-2026" className="related-card">
                <div className="rc-kicker">Global</div>
                <div className="rc-title">Internships in Singapore 2026: What Gets You Hired</div>
              </Link>
              <Link to="/reports/singapore-remote-from-india-2026" className="related-card">
                <div className="rc-kicker">Cross-border</div>
                <div className="rc-title">Singapore Remote Jobs from India 2026: The Real Map</div>
              </Link>
              <Link to="/reports/remote-internships-2026" className="related-card">
                <div className="rc-kicker">Remote</div>
                <div className="rc-title">Remote Internships 2026: Which Ones Are Real</div>
              </Link>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Reach the people who hire international interns.</h3>
              <p>Studojo's outreach tool finds hiring managers at the companies you want and helps you write a message that states your authorization clearly.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">
              Start Your Outreach →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
