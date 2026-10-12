import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Cover Letter Report 2026: Do They Still Matter, and What Actually Works | Studojo" },
    { name: "description", content: "Do cover letters still matter in 2026? An honest breakdown of who reads them, when they tip a decision, the short structure that works, and cover letter vs cold email." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "cover letter 2026, do cover letters matter, how to write a cover letter for internship, cover letter for freshers, cover letter examples, is a cover letter necessary" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/cover-letter-report-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Cover Letter Report 2026: Do They Still Matter, and What Actually Works" },
    { property: "og:description", content: "Do cover letters still matter in 2026? Who reads them, when they tip a decision, the short structure that works, and how they compare to a cold email." },
    { property: "og:url", content: `${BASE_URL}/reports/cover-letter-report-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-12T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Cover Letter Report 2026 | Studojo" },
    { name: "twitter:description", content: "Do cover letters still matter? An honest answer, plus the short structure that works and when to skip it." },
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

  // Chart 1: how a cover letter is typically handled (illustrative)
  const readEl = document.getElementById("clReadChart") as HTMLCanvasElement | null;
  if (readEl && !readEl.dataset.rendered) {
    readEl.dataset.rendered = "1";
    new Chart(readEl, {
      type: "doughnut",
      data: {
        labels: ["Never opened", "Skimmed in seconds", "Read properly"],
        datasets: [{
          data: [40, 40, 20],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw} of 100 (illustrative)` } },
        },
      },
    });
  }

  // Chart 2: situations ranked by how much a cover letter matters
  const whenEl = document.getElementById("clWhenChart") as HTMLCanvasElement | null;
  if (whenEl && !whenEl.dataset.rendered) {
    whenEl.dataset.rendered = "1";
    new Chart(whenEl, {
      type: "bar",
      data: {
        labels: [
          "Role asks for one",
          "Small team / founder reads it",
          "Career switch",
          "Reaching a named person",
          "Big-portal bulk apply",
          "Optional box, no instructions",
        ],
        datasets: [{
          label: "How much it matters (1-5)",
          data: [5, 5, 4, 4, 2, 2],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET2, VIOLET3, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Matters: ${ctx.raw}/5` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 3: length versus how well it lands (illustrative)
  const lenEl = document.getElementById("clLenChart") as HTMLCanvasElement | null;
  if (lenEl && !lenEl.dataset.rendered) {
    lenEl.dataset.rendered = "1";
    new Chart(lenEl, {
      type: "bar",
      data: {
        labels: ["2-3 lines", "80-150 words", "200-250 words", "Full page", "Over a page"],
        datasets: [{
          label: "Likelihood it gets read (1-5)",
          data: [4, 5, 3, 2, 1],
          backgroundColor: [VIOLET2, VIOLET, ORANGE, RED, RED],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` Read: ${ctx.raw}/5` } },
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
    q: "Do recruiters actually read cover letters?",
    a: "Some do, most skim, and many skip it. Recruiter surveys report that a sizeable minority still read them, and the time spent is measured in seconds. A cover letter rarely wins you an interview alone, but a good short one can break a tie between two similar resumes.",
  },
  {
    q: "Should I write a cover letter if it is optional?",
    a: "Yes, if you can keep it short and specific to the role. An optional box costs you ten minutes and can only help when the shortlist is tight. Skip it only if you would be forced to write something generic, because a generic letter is worse than none.",
  },
  {
    q: "How long should a cover letter be?",
    a: "Aim for 80 to 150 words, a few tight lines that fit on one screen without scrolling. A full page is almost always too long for a recruiter skimming a pile. If you can say it in four sentences, send four sentences.",
  },
  {
    q: "What goes in a cover letter for a fresher with no experience?",
    a: "One reason you want this exact role, one proof point from a project, course or club, and one line on fit. You do not need work history to show evidence. A concrete project with a result beats a paragraph about being hardworking and passionate.",
  },
  {
    q: "Cover letter or cold email, which is better?",
    a: "A cold email to a named person usually gets read more often, because it lands in a human inbox instead of a portal. Use the cover letter when the application asks for one, and the cold email when you want to reach the person who decides. The strongest move is doing both with the same three-line core.",
  },
  {
    q: "Can I use AI to write my cover letter?",
    a: "You can use AI for a first draft, but never send it untouched. Generic AI letters are easy to spot and say nothing specific about the company. Feed it your real project and the job post, then rewrite it in your own voice and cut it to a few lines.",
  },
];

export default function CoverLetterReport() {
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
        "headline": "The Cover Letter Report 2026: Do They Still Matter, and What Actually Works",
        "description": "An honest look at whether cover letters still matter in 2026, when they tip a decision, and the short structure that works.",
        "url": `${BASE_URL}/reports/cover-letter-report-2026`,
        "datePublished": "2026-10-12T00:00:00Z",
        "dateModified": "2026-10-12T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/cover-letter-report-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Cover Letter Report 2026", "item": `${BASE_URL}/reports/cover-letter-report-2026` },
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
              <span>Cover Letter Report 2026</span>
            </nav>
            <h1>Do Cover Letters <em>Still Matter</em> in 2026?</h1>
            <p className="rpt-hero-sub">
              The honest answer is: sometimes. This report covers who actually reads a
              cover letter, the moments it tips a decision, and the short structure that
              works when you do write one.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Students and freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Cover letters, structure, alternatives</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>A cover letter is <strong>a tie-breaker, not a gate</strong>. It rarely gets you hired alone, but it can separate two similar resumes.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Most are <strong>skimmed in seconds or skipped</strong>. Assume a recruiter gives yours a glance, not a read.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>It matters most when <strong>a role asks for one</strong>, when you are switching careers, and when a small team or founder reads the inbox.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The winning format is <strong>a few tight lines, not a full page</strong>: why this role, one proof point, one line on fit, a clear ask.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Never <strong>just restate your resume</strong>. If a line is already on your resume, it does not belong in the letter.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">A minority</div>
              <div className="sc-label">of recruiters say they still read cover letters on most applications</div>
              <div className="sc-source">Recruiter surveys (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">Most</div>
              <div className="sc-label">applicant tracking systems store the cover letter as an attachment and do not parse it into searchable fields</div>
              <div className="sc-source">Industry observation (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">Seconds</div>
              <div className="sc-label">is how long a recruiter typically spends on a cover letter, if they open it at all</div>
              <div className="sc-source">Industry estimate (reported)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Do They Still Matter? The Honest Answer</div>
                <div className="sec-sub">Less than your college career office says, more than the internet says</div>
              </div>
            </div>
            <p>Two stories compete. One says the cover letter is dead and nobody reads it. The other says it is the secret weapon that sets you apart. Neither is right.</p>
            <p>A cover letter is a tie-breaker. When a recruiter has forty resumes that all look alike, a sharp three-line note can be the reason yours gets a second look. When the resume already makes the case, the letter adds little. Many recruiters skip it entirely, and most applicant tracking systems file it as an attachment rather than reading it into fields.</p>
            <div className="chart-wrap">
              <div className="chart-label">How a typical cover letter is handled, per 100 (illustrative)</div>
              <div style={{ height: 260 }}>
                <canvas id="clReadChart" />
              </div>
            </div>
            <div className="highlight">
              The practical takeaway: <strong>never skip the resume to polish the letter</strong>. Get the resume right first. Then treat the cover letter as a cheap bonus that costs ten focused minutes.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">When a Cover Letter Actually Moves the Decision</div>
                <div className="sec-sub">The situations where it is worth your time</div>
              </div>
            </div>
            <p>Not every application deserves one. Put the effort where it changes the outcome.</p>
            <div className="chart-wrap">
              <div className="chart-label">How much a cover letter matters, by situation (Studojo editorial rating)</div>
              <div style={{ height: 300 }}>
                <canvas id="clWhenChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>The role asks for one.</strong> If the post says "include a cover letter," skipping it signals you do not follow instructions. Write it.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>You are switching fields.</strong> Your resume says one thing and you want another. The letter is the only place to explain the jump in one line.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>A small team or founder reads the inbox.</strong> At a ten-person startup, a human reads everything. A specific note shows you did your homework.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>You are writing to a named person.</strong> Here the letter is really a short email, and it works best that way.</span></div>
            </div>
            <div className="callout">
              <strong>When to skip it:</strong> a one-click bulk apply on a big portal with an optional box and no instructions. If you can only write something generic, a blank box beats a boring letter.
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">The Short Structure That Works</div>
                <div className="sec-sub">Four moves, around 100 words</div>
              </div>
            </div>
            <p>Forget "I am writing to apply for." Recruiters have read that line ten thousand times. Use four short moves instead.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>1. Open with why this role.</strong> One sentence on what about this exact job or company pulled you in. Name something specific.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>2. Give one proof point.</strong> A single project, result or experience that shows you can do the work. Numbers help if you have them.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>3. Add one line on fit.</strong> Connect your proof to what they need. This is the line that does the persuading.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>4. End with a clear ask.</strong> "I would love 15 minutes to talk about this." Specific, easy to say yes to.</span></div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">Length versus how likely it is to be read (Studojo editorial rating)</div>
              <div style={{ height: 260 }}>
                <canvas id="clLenChart" />
              </div>
            </div>
            <div className="pull-quote">
              <p>"If the first sentence could be sent to any company, delete it and start again."</p>
              <span className="pq-source">The Studojo test for every cover letter</span>
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Cover Letter vs Cold Email vs LinkedIn Note</div>
                <div className="sec-sub">Same core message, three different doors</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Best for</th>
                  <th>Length</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Cover letter</strong></td>
                  <td>Portal applications that ask for one</td>
                  <td>80 to 150 words</td>
                  <td><span className="tag-pill pill-amber">Situational</span> Tie-breaker only</td>
                </tr>
                <tr>
                  <td><strong>Cold email</strong></td>
                  <td>Reaching the person who decides</td>
                  <td>3 to 5 lines</td>
                  <td><span className="tag-pill pill-green">Strong</span> Lands in a human inbox</td>
                </tr>
                <tr>
                  <td><strong>LinkedIn note</strong></td>
                  <td>Connecting before or after you apply</td>
                  <td>Under 300 characters</td>
                  <td><span className="tag-pill pill-blue">Support</span> Opens the conversation</td>
                </tr>
                <tr>
                  <td><strong>Generic letter</strong></td>
                  <td>Nothing</td>
                  <td>A full page</td>
                  <td><span className="tag-pill pill-red">Skip</span> Worse than nothing</td>
                </tr>
              </tbody>
            </table>
            <p>The smart move is to write the three-line core once, then adapt it to each door. The same proof point works in all three.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Common Mistakes</div>
                <div className="sec-sub">What gets a letter ignored in the first line</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>A generic greeting.</strong> "To whom it may concern" says you did not look. Find a name, or use the team name.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Restating the resume.</strong> The recruiter has your resume open in the next tab. Add what it cannot say: why this role, and the thinking behind your best project.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Too long.</strong> A full page of paragraphs gets skimmed or skipped. Cut it in half, then cut it again.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Vague claims.</strong> "Hardworking, passionate team player" proves nothing. One real project proves something.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Sending an untouched AI draft.</strong> It reads smooth and says nothing. Add one detail only you would know.</span></div>
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The cover letter questions students ask most, answered directly</div>
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
            <p style={{ color: "#3b0764" }}>Do not agonise over the letter. Get the resume right, then spend ten minutes on a note that is short and specific:</p>
            <div className="blist">
              {[
                ["Resume first", "A strong resume does most of the work. A letter cannot rescue a weak one."],
                ["Write it when it counts", "Required, career switch, small team, or a named person. Skip it when it would be generic."],
                ["Keep it to four moves", "Why this role, one proof point, one line on fit, a clear ask."],
                ["Pair it with a person", "A short cold email or LinkedIn note to the hiring manager often does more than the letter itself."],
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
              <Link to="/reports/cold-email-subject-lines-best-practices-2026" className="related-card">
                <div className="rc-kicker">Cold email</div>
                <div className="rc-title">Cold Email Subject Lines: What Actually Gets Opened</div>
              </Link>
              <Link to="/reports/ats-resume-report-2026" className="related-card">
                <div className="rc-kicker">Resumes</div>
                <div className="rc-title">How an ATS Actually Reads Your Resume</div>
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
              <h3>Get the resume right first.</h3>
              <p>The letter is a bonus. The resume does the heavy lifting. Build a clean, ATS-safe one with the free Studojo resume builder.</p>
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
