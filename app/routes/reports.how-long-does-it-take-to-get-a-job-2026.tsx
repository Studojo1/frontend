import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How Long Does It Take to Get a Job? The Timelines, and How to Shorten Yours (2026) | Studojo" },
    { name: "description", content: "How long does it take to get a job? The US median search is 11.5 weeks (BLS, 2026). The India data, where the weeks go, and how to shorten yours." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "how long does it take to get a job, how long does it take to get a job after college, how long does it take to get a job after graduation in India, how long does it take to get a job after applying, how long does it take to hear back from a job application, average job search time" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/how-long-does-it-take-to-get-a-job-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How Long Does It Take to Get a Job? The Timelines, and How to Shorten Yours" },
    { property: "og:description", content: "Cited job search timelines for the US and India, where the weeks of a search actually go, and the one step that shortens yours." },
    { property: "og:url", content: `${BASE_URL}/reports/how-long-does-it-take-to-get-a-job-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-28T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How Long Does It Take to Get a Job? | Studojo" },
    { name: "twitter:description", content: "The real timeline numbers, the India data gap, and the step that shortens your search." },
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
  const ORANGE = "#f59e0b";
  const RED = "#ef4444";
  const GREEN = "#10b981";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: US median vs mean duration of unemployment, September 2026 (BLS)
  const durEl = document.getElementById("hljDurChart") as HTMLCanvasElement | null;
  if (durEl && !durEl.dataset.rendered) {
    durEl.dataset.rendered = "1";
    new Chart(durEl, {
      type: "bar",
      data: {
        labels: ["Median", "Mean"],
        datasets: [{
          label: "Weeks spent looking",
          data: [11.5, 24.8],
          backgroundColor: [VIOLET, ORANGE],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} weeks (BLS, Sept 2026)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 30, ticks: { font: { size: 11 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 2: share of US unemployed looking 27 weeks or more, September 2026 (BLS)
  const longEl = document.getElementById("hljLongChart") as HTMLCanvasElement | null;
  if (longEl && !longEl.dataset.rendered) {
    longEl.dataset.rendered = "1";
    new Chart(longEl, {
      type: "doughnut",
      data: {
        labels: ["Under 27 weeks", "27 weeks or more"],
        datasets: [{
          data: [72.9, 27.1],
          backgroundColor: [VIOLET2, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of the unemployed` } },
        },
      },
    });
  }

  // Chart 3: how much each move shortens a search (Studojo editorial rating)
  const fixEl = document.getElementById("hljFixChart") as HTMLCanvasElement | null;
  if (fixEl && !fixEl.dataset.rendered) {
    fixEl.dataset.rendered = "1";
    new Chart(fixEl, {
      type: "bar",
      data: {
        labels: [
          "Email the hiring manager directly",
          "Follow up once after a week or two",
          "Aim at fewer, better-fit roles",
          "Rewrite your resume again",
          "Apply to more jobs, faster",
          "Auto-apply bots",
        ],
        datasets: [{
          label: "How much it shortens a search (1-5)",
          data: [5, 4, 3, 2, 1, 1],
          backgroundColor: [GREEN, VIOLET, VIOLET2, ORANGE, RED, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Editorial rating: ${ctx.raw}/5` } },
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
    q: "How long does it take to get a job after college?",
    a: "Plan for months, not weeks. In the US, the median unemployed person had been looking for 11.5 weeks in September 2026 (US Bureau of Labor Statistics), and that covers every age, not only graduates. The first stretch after college is the hardest: in India, 42.3% of graduates under 25 were unemployed in 2021-22 (State of Working India 2023, Azim Premji University).",
  },
  {
    q: "How long does it take to get a job after graduation in India?",
    a: "There is no good official India figure for how many months a graduate's job search takes. The closest data shows 42.3% of graduates under 25 were unemployed in 2021-22, falling to under 5% for graduates aged 35 and above (State of Working India 2023, using PLFS data). Graduates do find work, but the first years are the slowest, so start before you graduate.",
  },
  {
    q: "How long does it take to hear back from a job application?",
    a: "Often you never hear back at all. An average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data), and silence is the normal outcome, not a verdict on you. If you have heard nothing after a week or two, follow up once, ideally with the hiring manager rather than the portal.",
  },
  {
    q: "How long does it take to get a job after applying?",
    a: "It depends less on the calendar and more on whether a person who can hire you ever reads your application. A typical online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026), so many never move at all. The clock really starts when the hiring manager sees your name, which is why writing to them directly saves the most time.",
  },
  {
    q: "What is the average job search time?",
    a: "For the US, the official figures for September 2026 are a median of 11.5 weeks and a mean of 24.8 weeks (BLS). The mean is higher because 27.1% of the unemployed, about 1.9 million people, had been looking for 27 weeks or more. These numbers count people still searching, so they describe searches in progress, not finished ones.",
  },
  {
    q: "How can I get a job faster?",
    a: "Send fewer, better-aimed applications and write to the person who decides. A short, specific email to the hiring manager from your own address, followed up once, skips the pile your application would sit in. Studojo does this for you: it finds the hiring manager, verifies their email, writes a personal email and sends it from your Gmail. Replies are not guaranteed, but you stop waiting on a portal.",
  },
];

export default function HowLongToGetAJobReport() {
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
        "headline": "How Long Does It Take to Get a Job? The Timelines, and How to Shorten Yours",
        "description": "Cited job search timelines for the US and India, where the weeks of a search go, and the step that shortens it: reaching the person who decides.",
        "url": `${BASE_URL}/reports/how-long-does-it-take-to-get-a-job-2026`,
        "datePublished": "2026-10-28T00:00:00Z",
        "dateModified": "2026-10-28T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/how-long-does-it-take-to-get-a-job-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "How Long Does It Take to Get a Job 2026", "item": `${BASE_URL}/reports/how-long-does-it-take-to-get-a-job-2026` },
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
              <span>How Long to Get a Job 2026</span>
            </nav>
            <h1>How Long Does It Take to Get a Job? <em>The Timelines, and How to Shorten Yours</em></h1>
            <p className="rpt-hero-sub">
              How long does it take to get a job? Longer than anyone tells you, and most of
              that time is spent waiting on applications nobody has opened. Here are the
              timeline numbers we could verify, the honest gap in India's data, and the one
              step that shortens your search.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India and US · Students and freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Job search timelines, how to shorten them</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>In the US, the median unemployed person had been looking for <strong>11.5 weeks</strong> in September 2026, and the mean was <strong>24.8 weeks</strong> (US Bureau of Labor Statistics).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>27.1% of the unemployed</strong>, about 1.9 million Americans, had been searching for 27 weeks or more (BLS, September 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>India has <strong>no good official figure</strong> for how long a graduate's search takes. The best proxy: 42.3% of graduates under 25 were unemployed in 2021-22, against under 5% at 35 and above (State of Working India 2023).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Most of the waiting is <strong>your application sitting unread</strong>. An average opening draws about 242 applications, and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The step that shortens it is <strong>reaching the person who decides</strong>: a short, personal email to the hiring manager from your own Gmail, followed up once. That is what Studojo does.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">11.5 wks</div>
              <div className="sc-label">median time unemployed Americans had been looking for work, September 2026</div>
              <div className="sc-source">US Bureau of Labor Statistics, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">42.3%</div>
              <div className="sc-label">of Indian graduates under 25 were unemployed in 2021-22</div>
              <div className="sc-source">State of Working India 2023, Azim Premji University</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">242</div>
              <div className="sc-label">applications an average job opening draws</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">The Short Answer: What the Timeline Data Says</div>
                <div className="sec-sub">Average job search time, from the official numbers</div>
              </div>
            </div>
            <p>Start with the best data there is. Every month the US Bureau of Labor Statistics asks unemployed people how long they have been looking for work. In September 2026 the median was 11.5 weeks and the mean was 24.8 weeks (BLS Employment Situation, released October 2026).</p>
            <p>The gap between those two numbers is the story. Half of the unemployed had been looking for under three months. But a long tail drags the average up: 27.1% of them, about 1.9 million people, had been looking for 27 weeks or more.</p>
            <div className="chart-two">
              <div className="chart-wrap">
                <div className="chart-label">Weeks spent looking, US unemployed, Sept 2026 (BLS)</div>
                <div style={{ height: 240 }}>
                  <canvas id="hljDurChart" />
                </div>
              </div>
              <div className="chart-wrap">
                <div className="chart-label">Share looking 27 weeks or more, Sept 2026 (BLS)</div>
                <div style={{ height: 240 }}>
                  <canvas id="hljLongChart" />
                </div>
              </div>
            </div>
            <p>One caution. These figures count people who are still looking, so they describe searches in progress, not finished ones. They also cover every age and every kind of job, not only graduates. Treat them as a reference point, not your forecast.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Figure</th>
                  <th>What it measures</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>11.5 weeks</strong></td>
                  <td>Median time unemployed people in the US had been looking, September 2026</td>
                  <td><span className="tag-pill pill-blue">Official</span> US Bureau of Labor Statistics, 2026</td>
                </tr>
                <tr>
                  <td><strong>24.8 weeks</strong></td>
                  <td>Mean time for the same group</td>
                  <td><span className="tag-pill pill-blue">Official</span> US Bureau of Labor Statistics, 2026</td>
                </tr>
                <tr>
                  <td><strong>27.1%</strong></td>
                  <td>Share of US unemployed looking 27 weeks or more (about 1.9 million people)</td>
                  <td><span className="tag-pill pill-blue">Official</span> US Bureau of Labor Statistics, 2026</td>
                </tr>
                <tr>
                  <td><strong>42.3%</strong></td>
                  <td>Unemployment rate of Indian graduates under 25, 2021-22</td>
                  <td><span className="tag-pill pill-amber">Report</span> State of Working India 2023, Azim Premji University (PLFS data)</td>
                </tr>
                <tr>
                  <td><strong>Under 5%</strong></td>
                  <td>Unemployment rate of Indian graduates aged 35 and above</td>
                  <td><span className="tag-pill pill-amber">Report</span> State of Working India 2023, Azim Premji University</td>
                </tr>
                <tr>
                  <td><strong>None found</strong></td>
                  <td>An official figure for how many months an Indian graduate's job search takes</td>
                  <td><span className="tag-pill pill-red">Gap</span> We could not find a good one</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">How Long Does It Take to Get a Job After College in India?</div>
                <div className="sec-sub">After graduation in India: what the data does and does not say</div>
              </div>
            </div>
            <p>Here is the honest part. There is no good official India figure for how long it takes to get a job after graduation. India's main jobs survey, the Periodic Labour Force Survey (PLFS), reports who is unemployed. We could not find an official number for how many months a graduate's search lasts.</p>
            <p>The best proxy comes from Azim Premji University's State of Working India 2023 report, which used PLFS data. It found that 42.3% of graduates under 25 were unemployed in 2021-22. For graduates aged 35 and above, the rate was under 5%.</p>
            <p>Read that carefully. It does not mean 42% of graduates never work. It means the first stretch after college is the hardest, and most graduates do find work as they get older. The report also asks the harder question: whether those jobs match what graduates trained for.</p>
            <div className="highlight">
              The practical takeaway: <strong>start before you graduate</strong>. The months you spend waiting after college are the expensive ones. Begin writing to hiring managers in your final year, not after your results come out.
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">How Long Does It Take to Hear Back From a Job Application?</div>
                <div className="sec-sub">Often never. Here is why.</div>
              </div>
            </div>
            <p>Most of a job search is waiting, and most of the waiting is your application sitting in a pile. An average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data). The typical success rate of an online application is roughly 0.1% to 2% (same source).</p>
            <p>So silence is the normal outcome, not a verdict on you. Applying faster does not fix it. The same article reports one auto-apply account of about 5 interviews from thousands of applications, roughly 0.1%. Recruiters also catch bot applications with hidden instructions planted in job posts, and flag one person applying to dozens of roles at the same company (NBC News, November 2024).</p>
            <div className="callout">
              <strong>How long to wait before you follow up:</strong> if you have heard nothing after a week or two, follow up once. Send it to the hiring manager, not the portal, because the portal is where your application went quiet.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Where the Weeks Actually Go</div>
                <div className="sec-sub">How long it takes to get a job after applying, stage by stage</div>
              </div>
            </div>
            <p>A job search is not one long wait. It is a few stages, and you control some far more than others.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>What is happening</th>
                  <th>What you control</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>In the pile</strong></td>
                  <td>Your resume waits with hundreds of others, and many are never opened by a person</td>
                  <td><span className="tag-pill pill-red">Little</span> Only who you send it to</td>
                </tr>
                <tr>
                  <td><strong>First screen</strong></td>
                  <td>A recruiter spends about 6 to 7 seconds on a first resume scan (Ladders eye-tracking study, 2018)</td>
                  <td><span className="tag-pill pill-amber">Some</span> A clear, specific resume</td>
                </tr>
                <tr>
                  <td><strong>Hiring manager review</strong></td>
                  <td>The person who decides finally sees your name</td>
                  <td><span className="tag-pill pill-green">A lot</span> Reach them directly, and earlier</td>
                </tr>
                <tr>
                  <td><strong>Interviews and offer</strong></td>
                  <td>Rounds, scheduling and the final decision</td>
                  <td><span className="tag-pill pill-green">A lot</span> Preparation and a prompt follow-up</td>
                </tr>
              </tbody>
            </table>
            <p>Notice where the time hides. In our view, the first stage is where most of the weeks disappear, because nothing happens until a person looks. It is also the stage where applying to more jobs changes the least.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Step That Shortens It: Reach the Person Who Decides</div>
                <div className="sec-sub">Fewer applications, aimed at a person</div>
              </div>
            </div>
            <p>You cannot make a company's hiring process faster. You can skip the part where your application waits to be noticed.</p>
            <p>Studojo's position is simple. Email the person who actually hires, the hiring manager or team lead, with a short, personal, specific email from your own email address. Follow up once. That puts your name in front of the decider on day one, instead of whenever the pile gets sorted.</p>
            <div className="chart-wrap">
              <div className="chart-label">How much each move shortens a search (Studojo editorial rating, not measured data)</div>
              <div style={{ height: 300 }}>
                <canvas id="hljFixChart" />
              </div>
            </div>
            <p>We built Studojo to do exactly this. It finds the person who can actually hire you (not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail. 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026).</p>
            <div className="pull-quote">
              <p>"If nobody who can hire you has read your name yet, your job search clock has not really started."</p>
              <span className="pq-source">The Studojo rule for job search timing</span>
            </div>
            <p>Replies are not guaranteed. But a search built on emails to real people gives you something a portal rarely does: a person to follow up with.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The job search timeline questions people ask most, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to shorten your own timeline</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Expect months, not weeks, and spend them on the moves that change the outcome:</p>
            <div className="blist">
              {[
                ["Start early", "Begin in your final year. The first stretch after college is the hardest, so do not start it from zero."],
                ["Apply less, aim better", "A few roles where you fit beat hundreds of blind applications that sit unread."],
                ["Write to the decider", "A short, specific email to the hiring manager from your own Gmail skips the pile."],
                ["Follow up once", "Silence after a week or two is normal. Send one polite follow-up, then move on."],
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
              <Link to="/reports/how-many-jobs-should-i-apply-to-2026" className="related-card">
                <div className="rc-kicker">Applications</div>
                <div className="rc-title">How Many Jobs Should You Apply To? The Math Says Fewer, Aimed Better</div>
              </Link>
              <Link to="/reports/follow-up-job-application-timing-2026" className="related-card">
                <div className="rc-kicker">Follow-ups</div>
                <div className="rc-title">Following Up on a Job Application</div>
              </Link>
              <Link to="/reports/first-job-india-2026" className="related-card">
                <div className="rc-kicker">India</div>
                <div className="rc-title">First Job Report India 2026: What Entry-Level Actually Looks Like</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Stop waiting on the portal.</h3>
              <p>Studojo finds the hiring manager, verifies their email and sends a personal email for that one person from your own Gmail.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
