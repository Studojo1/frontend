import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Placement Test Report 2026: How to Crack Aptitude and Coding Rounds | Studojo" },
    { name: "description", content: "The online test eliminates most applicants before any interview. What is on aptitude and coding rounds, how sectional cutoffs work, and a realistic prep plan." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "how to crack aptitude test, placement aptitude preparation, coding round preparation, online assessment tips, quantitative aptitude placement, how to pass coding test fresher" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/aptitude-coding-test-report-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Placement Test Report 2026: How to Crack Aptitude and Coding Rounds" },
    { property: "og:description", content: "What is on placement aptitude and coding rounds, how sectional cutoffs work, and a realistic prep plan with test-day tactics." },
    { property: "og:url", content: `${BASE_URL}/reports/aptitude-coding-test-report-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-17T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Placement Test Report 2026 | Studojo" },
    { name: "twitter:description", content: "The online test is the first filter. Here is what is on it, how it is scored, and how to prepare." },
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

  // Chart 1: where applicants drop out (illustrative)
  const funnelEl = document.getElementById("aptFunnelChart") as HTMLCanvasElement | null;
  if (funnelEl && !funnelEl.dataset.rendered) {
    funnelEl.dataset.rendered = "1";
    new Chart(funnelEl, {
      type: "doughnut",
      data: {
        labels: ["Out at the online test", "Out at interviews", "Offer"],
        datasets: [{
          data: [70, 22, 8],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw} of 100 applicants` } },
        },
      },
    });
  }

  // Chart 2: typical split of test time (illustrative)
  const splitEl = document.getElementById("aptSplitChart") as HTMLCanvasElement | null;
  if (splitEl && !splitEl.dataset.rendered) {
    splitEl.dataset.rendered = "1";
    new Chart(splitEl, {
      type: "bar",
      data: {
        labels: ["Quantitative", "Logical", "Verbal", "Coding"],
        datasets: [{
          label: "Share of test time (%)",
          data: [25, 20, 15, 40],
          backgroundColor: [VIOLET, VIOLET2, VIOLET3, INK],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw}% of time` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 50, ticks: { font: { size: 11 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: prep topics ranked by return on time (illustrative)
  const prepEl = document.getElementById("aptPrepChart") as HTMLCanvasElement | null;
  if (prepEl && !prepEl.dataset.rendered) {
    prepEl.dataset.rendered = "1";
    new Chart(prepEl, {
      type: "bar",
      data: {
        labels: [
          "Timed mock tests",
          "Percentages, ratios, time and work",
          "Arrays, strings, hashing",
          "Logical puzzles and seating",
          "Reading comprehension",
          "Reviewing wrong answers",
        ],
        datasets: [{
          label: "Return on prep time (1-5)",
          data: [5, 5, 5, 4, 3, 5],
          backgroundColor: [VIOLET, VIOLET, VIOLET, VIOLET2, VIOLET3, VIOLET],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Return: ${ctx.raw}/5` } },
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
    q: "How do I crack an aptitude test for placements?",
    a: "Practise under a timer, not from a textbook. The test is a speed and accuracy game, so the fastest gain is doing timed sections, then reviewing every wrong answer. Cover quantitative, logical and verbal evenly, because a sectional cutoff can reject you for one weak area.",
  },
  {
    q: "What topics come in placement aptitude tests?",
    a: "Three areas: quantitative, logical reasoning and verbal ability. Quant covers percentages, ratios, time and work, and data interpretation. Logical covers puzzles, series and seating arrangements. Verbal covers reading comprehension, grammar and sentence correction.",
  },
  {
    q: "How do I prepare for a coding round?",
    a: "Solve problems on arrays, strings and hashing in a timed setting, in the one language you know best. Most rounds give one or two problems plus MCQs. Practise reading the problem fully, writing a working solution first, then checking edge cases like empty input.",
  },
  {
    q: "How much time do I need to prepare for placement tests?",
    a: "Plan for 6 to 8 weeks of steady daily practice if you are starting from scratch. An hour or two a day is enough if it is timed and reviewed. If your fundamentals are strong, 3 to 4 weeks of mocks can be enough.",
  },
  {
    q: "What is a sectional cutoff?",
    a: "A sectional cutoff is a minimum score you must clear in each section, not just overall. You can score well in total and still be rejected if one section falls below its line. That is why a strong quant score cannot fully cover for ignoring verbal.",
  },
  {
    q: "Are placement tests proctored?",
    a: "Most online assessments are. Expect webcam monitoring, full-screen enforcement and tab-switch tracking. Read the rules before you start, close other apps, and do not leave the test window, because a flagged session can be disqualified even if your answers are right.",
  },
];

export default function AptitudeCodingTestReport() {
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
        "headline": "The Placement Test Report 2026: How to Crack Aptitude and Coding Rounds",
        "description": "What is on placement aptitude and coding rounds, how they are scored, and a realistic prep plan.",
        "url": `${BASE_URL}/reports/aptitude-coding-test-report-2026`,
        "datePublished": "2026-10-17T00:00:00Z",
        "dateModified": "2026-10-17T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/aptitude-coding-test-report-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Placement Test Report 2026", "item": `${BASE_URL}/reports/aptitude-coding-test-report-2026` },
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
              <span>Placement Test Report 2026</span>
            </nav>
            <h1>How to Crack the <em>Aptitude and Coding Rounds</em></h1>
            <p className="rpt-hero-sub">
              For most applicants the online test is where the process ends, before any
              interview. This report covers what is actually on it, how it is scored, and
              how to prepare in a realistic amount of time.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India-leaning · Freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Aptitude, coding, scoring</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>The online test <strong>eliminates the majority of applicants</strong> before any interviewer sees them.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Aptitude is <strong>quantitative, logical and verbal</strong>, while the coding round is usually one or two problems plus MCQs.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>It is a <strong>speed and accuracy game</strong>, and that makes it preparable.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Sectional cutoffs</strong> catch people who are strong in only one area.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Timed practice beats passive study</strong>, every time.</span></div>
            </div>
          </div>

          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">~70%</div>
              <div className="sc-label">of applicants are typically eliminated at the test stage (framed estimate, varies by company)</div>
              <div className="sc-source">Illustrative, placement test patterns</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">3</div>
              <div className="sc-label">sections in a typical aptitude test: quantitative, logical and verbal</div>
              <div className="sc-source">Placement test patterns (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">1-2</div>
              <div className="sc-label">coding problems per assessment, often alongside MCQs</div>
              <div className="sc-source">Placement test patterns (reported)</div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Why the Test Is the Real First Filter</div>
                <div className="sec-sub">Most people are out before the first conversation</div>
              </div>
            </div>
            <p>A company with thousands of applicants cannot interview them all. So it sends one standard online test and keeps only those above a cutoff. The test is cheap to run, scores automatically, and treats everyone the same.</p>
            <p>That makes it the real first filter. Your resume got you the link. The test decides whether anyone reads it again. The split below is an illustration, not a measured figure, but the shape holds: most drop-out happens here.</p>
            <div className="chart-wrap">
              <div className="chart-label">Where 100 applicants tend to drop out (illustrative)</div>
              <div style={{ height: 260 }}>
                <canvas id="aptFunnelChart" />
              </div>
            </div>
            <div className="highlight">
              The good news: unlike an interview, the test is <strong>highly preparable</strong>. The questions repeat in pattern, and the skill being measured is speed, which practice builds.
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">What Is Actually on It</div>
                <div className="sec-sub">Four blocks, each with a different way to prepare</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>What it tests</th>
                  <th>How to prep</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Quantitative</strong></td>
                  <td>Percentages, ratios, time and work, averages, data interpretation</td>
                  <td>Learn shortcuts, then drill 20 questions against a clock</td>
                </tr>
                <tr>
                  <td><strong>Logical</strong></td>
                  <td>Series, puzzles, seating arrangements, syllogisms</td>
                  <td>Practise one puzzle type per day until the method is automatic</td>
                </tr>
                <tr>
                  <td><strong>Verbal</strong></td>
                  <td>Reading comprehension, grammar, sentence correction</td>
                  <td>Read daily, then do timed passages and error-spotting sets</td>
                </tr>
                <tr>
                  <td><strong>Coding</strong></td>
                  <td>One or two problems on arrays, strings, hashing, plus MCQs</td>
                  <td>Solve timed problems in one language, test edge cases</td>
                </tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">Typical split of test time (illustrative)</div>
              <div style={{ height: 240 }}>
                <canvas id="aptSplitChart" />
              </div>
            </div>
            <div className="callout">
              <strong>Remember:</strong> exact weights change by company and by year. Treat the split as a guide to where the clock goes, then check the format of the specific test you were invited to.
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">How Companies Score It</div>
                <div className="sec-sub">Cutoffs, negative marking and the clock</div>
              </div>
            </div>
            <p>Three rules decide most outcomes, and most people only plan for the first.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Sectional cutoffs:</strong> you must clear a minimum in each section, not just the total. A great quant score cannot rescue a verbal section you skipped.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Negative marking:</strong> some tests deduct for wrong answers. Where they do, a blind guess costs you. Read the rules before the first question.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Time limits:</strong> sections are often timed separately, so unused time in one does not carry over. Speed matters as much as knowledge.</span></div>
            </div>
            <div className="pull-quote">
              <p>"You do not fail a test because you are weak. You fail it because one section was weak and the cutoff was per section."</p>
              <span className="pq-source">Studojo Research, on placement test patterns</span>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">A Prep Plan</div>
                <div className="sec-sub">Topics and a realistic timeline</div>
              </div>
            </div>
            <p>Starting from scratch, plan on 6 to 8 weeks at an hour or two a day. This is a guide, not a promise. The chart shows where an hour of effort tends to pay back most.</p>
            <div className="chart-wrap">
              <div className="chart-label">Prep activities by return on time (illustrative)</div>
              <div style={{ height: 300 }}>
                <canvas id="aptPrepChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Weeks 1 to 2:</strong> fundamentals. Percentages, ratios, time and work, and basic array and string problems.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Weeks 3 to 4:</strong> logical puzzles, verbal passages, and hashing and sorting problems, all under a timer.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Weeks 5 to 6:</strong> full mock tests twice a week, with a written list of every wrong answer and why.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Weeks 7 to 8:</strong> repeat the weakest section until it clears the cutoff comfortably.</span></div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Test-Day Tactics and Common Mistakes</div>
                <div className="sec-sub">Small habits that protect a good score</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Manage time per question:</strong> give each question a budget. If you pass it, move on.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Flag, do not freeze:</strong> mark a hard question, take the easy marks first, and return if time is left.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Know the proctoring rules:</strong> webcam, full screen and tab-switch tracking are common. Close other apps before you start.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Test your setup early:</strong> check internet, power and camera well before the slot.</span></div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mistake</th>
                  <th>What it costs you</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Ignoring verbal</strong></td>
                  <td><span className="tag-pill pill-red">Risk</span> A sectional cutoff rejects you despite strong quant</td>
                </tr>
                <tr>
                  <td><strong>No timed practice</strong></td>
                  <td><span className="tag-pill pill-red">Risk</span> You know the method but run out of clock</td>
                </tr>
                <tr>
                  <td><strong>Panicking on one hard question</strong></td>
                  <td><span className="tag-pill pill-amber">Careful</span> Five easy marks lost chasing one hard one</td>
                </tr>
              </tbody>
            </table>
            <div className="highlight">
              One rule covers most of this: <strong>never let a single question eat the time of five</strong>.
            </div>
          </div>

          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The placement test questions students ask most, answered directly</div>
              </div>
            </div>
            {FAQ.map((f) => (
              <div className="faq-item" key={f.q}>
                <div className="faq-q">{f.q}</div>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>

          <div className="takeaway-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6d28d9" }}>→</div>
              <div>
                <div className="sec-title" style={{ color: "#3b0764" }}>What This Means For You</div>
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to spend your effort</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The test is a filter you can beat with practice. Do these four things:</p>
            <div className="blist">
              {[
                ["Practise against a clock", "Every session timed. Untimed practice feels productive and prepares you for a different test."],
                ["Cover all sections", "Bring your weakest section above the cutoff before you polish your strongest."],
                ["Review every wrong answer", "A mistake you understand once rarely repeats. A mistake you skip repeats on test day."],
                ["Read the rules first", "Negative marking, proctoring and time limits change your strategy before question one."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" style={{ background: "#6d28d9" }} />
                  <span style={{ color: "#3b0764" }}><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="related">
            <h2>Related reports</h2>
            <div className="related-grid">
              <Link to="/reports/interview-report-why-candidates-fail-after-shortlist-2026" className="related-card">
                <div className="rc-kicker">Interviews</div>
                <div className="rc-title">The Interview Report: Why Candidates Fail After Getting Shortlisted</div>
              </Link>
              <Link to="/reports/cs-india-2026" className="related-card">
                <div className="rc-kicker">Tech India</div>
                <div className="rc-title">CS in India: What Freshers Are Actually Getting Into</div>
              </Link>
              <Link to="/reports/application-response-rate-2026" className="related-card">
                <div className="rc-kicker">Screening</div>
                <div className="rc-title">Why 80% of Applications Get No Response</div>
              </Link>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Clear the test, then reach a human.</h3>
              <p>A good score gets you in the room. Studojo Outreach helps you contact hiring managers directly, so you are not relying on the portal alone.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">
              Try Studojo Outreach →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
