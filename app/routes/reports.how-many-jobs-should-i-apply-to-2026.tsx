import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How Many Jobs Should I Apply To? The Math Says Fewer, Aimed Better (2026) | Studojo" },
    { name: "description", content: "How many jobs should I apply to? At the cited 0.1% to 2% success rate, 100 cold applications can mean zero to two interviews. The math, and a better plan." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "how many jobs should I apply to, how many jobs should I apply to a day, how many jobs should I apply to per week, how many applications does it take to get a job, how many jobs to apply for at one company, how many job applications per day" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/how-many-jobs-should-i-apply-to-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How Many Jobs Should You Apply To? The Math Says Fewer, Aimed Better" },
    { property: "og:description", content: "The arithmetic with cited per-application rates, how many roles to apply for at one company, and why ten personal emails beat 100 cold applications." },
    { property: "og:url", content: `${BASE_URL}/reports/how-many-jobs-should-i-apply-to-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-28T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How Many Jobs Should You Apply To? | Studojo" },
    { name: "twitter:description", content: "We did the arithmetic with cited rates. It says fewer applications, each one aimed at a real person." },
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

  // Chart 1: expected interviews by applications sent (illustrative, cited 0.1% to 2% range)
  const expectEl = document.getElementById("hmjExpectChart") as HTMLCanvasElement | null;
  if (expectEl && !expectEl.dataset.rendered) {
    expectEl.dataset.rendered = "1";
    new Chart(expectEl, {
      type: "line",
      data: {
        labels: ["10", "50", "100", "250", "500"],
        datasets: [
          {
            label: "At 2% per application",
            data: [0.2, 1, 2, 5, 10],
            borderColor: VIOLET,
            backgroundColor: VIOLET,
            borderWidth: 2.5,
            pointRadius: 4,
            tension: 0.2,
          },
          {
            label: "At 1% per application",
            data: [0.1, 0.5, 1, 2.5, 5],
            borderColor: VIOLET2,
            backgroundColor: VIOLET2,
            borderWidth: 2.5,
            pointRadius: 4,
            tension: 0.2,
          },
          {
            label: "At 0.1% per application",
            data: [0.01, 0.05, 0.1, 0.25, 0.5],
            borderColor: MUTED,
            backgroundColor: MUTED,
            borderWidth: 2.5,
            pointRadius: 4,
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw} expected interviews (illustrative)` } },
        },
        scales: {
          x: { grid: { display: false }, title: { display: true, text: "Cold applications sent", color: MUTED, font: { size: 11 } }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, title: { display: true, text: "Expected interviews", color: MUTED, font: { size: 11 } }, ticks: { font: { size: 11 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 2: applications needed for one expected interview (illustrative, cited 0.1% to 2% range)
  const needEl = document.getElementById("hmjNeedChart") as HTMLCanvasElement | null;
  if (needEl && !needEl.dataset.rendered) {
    needEl.dataset.rendered = "1";
    new Chart(needEl, {
      type: "bar",
      data: {
        labels: ["At 0.1%", "At 0.5%", "At 1%", "At 2%"],
        datasets: [{
          label: "Applications for one expected interview",
          data: [1000, 200, 100, 50],
          backgroundColor: [RED, ORANGE, VIOLET2, VIOLET],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} applications for one expected interview (illustrative)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, ticks: { font: { size: 11 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: 100 cold applications versus 10 personal emails (editorial rating)
  const compareEl = document.getElementById("hmjCompareChart") as HTMLCanvasElement | null;
  if (compareEl && !compareEl.dataset.rendered) {
    compareEl.dataset.rendered = "1";
    new Chart(compareEl, {
      type: "bar",
      data: {
        labels: ["Reaches the person who decides", "Written for one person", "Easy to follow up once", "Stands out from the pile", "Covers many openings"],
        datasets: [
          {
            label: "100 cold applications",
            data: [1, 2, 1, 1, 5],
            backgroundColor: VIOLET3,
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            label: "10 personal emails to hiring managers",
            data: [5, 5, 5, 4, 2],
            backgroundColor: VIOLET,
            borderRadius: 6,
            borderWidth: 0,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}/5 (editorial rating)` } },
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
    q: "How many jobs should I apply to a day?",
    a: "In our view, about two well-aimed applications a day, each paired with a short email to the hiring manager, beats twenty cold ones. There is no measured magic number, and chasing a daily count pushes you toward copy-paste applications. At the cited 0.1% to 2% success rate per online application (The Interview Guys, April 2026), how well you aim moves your odds far more than how many you send.",
  },
  {
    q: "How many jobs should I apply to per week?",
    a: "About ten a week, if every one is a role you genuinely fit and every one gets a personal email to the person who decides. That is our suggestion, not a measured rule, and it leaves you time to follow up once on each. A hundred cold applications a week mostly buys you more time in the pile.",
  },
  {
    q: "How many applications does it take to get a job?",
    a: "At the cited 0.1% to 2% success rate, one expected interview takes somewhere between 50 and 1,000 cold applications (illustrative arithmetic), and an interview is not yet an offer. The range is so wide that the count alone tells you very little. How well each application is aimed is what moves you within it.",
  },
  {
    q: "How many jobs should I apply for at one company?",
    a: "One or two roles that genuinely fit. Recruiters look for patterns such as one person applying to dozens of roles at the same company, which is one way they catch bot applications (NBC News, November 2024, quoting recruiter Mike Peditto). Apply to the role you fit best, then email the manager who runs that team.",
  },
  {
    q: "Is applying to 100 jobs a good strategy?",
    a: "Usually not. At the cited 0.1% to 2% range, 100 cold applications work out to between 0.1 and 2 expected interviews (illustrative). In our view, ten aimed applications with a personal email to each hiring manager is a better use of the same week, though replies are not guaranteed.",
  },
  {
    q: "Should I use an auto-apply tool to send more applications per day?",
    a: "No. Auto-apply raises the count and drags down the rate: The Interview Guys (April 2026) report one auto-apply account with about 5 interviews from thousands of applications, roughly 0.1%. LinkedIn's terms ban bots and automation tools, and recruiters plant hidden instructions in job posts to catch bot applications (NBC News, November 2024).",
  },
];

export default function HowManyJobsShouldIApplyToReport() {
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
        "headline": "How Many Jobs Should You Apply To? The Math Says Fewer, Aimed Better",
        "description": "The arithmetic of job applications using cited per-application rates, how many roles to apply for at one company, and why a few personal emails to hiring managers beat volume.",
        "url": `${BASE_URL}/reports/how-many-jobs-should-i-apply-to-2026`,
        "datePublished": "2026-10-28T00:00:00Z",
        "dateModified": "2026-10-28T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/how-many-jobs-should-i-apply-to-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "How Many Jobs Should You Apply To", "item": `${BASE_URL}/reports/how-many-jobs-should-i-apply-to-2026` },
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
              <span>How Many Jobs Should You Apply To</span>
            </nav>
            <h1>How Many Jobs Should You Apply To? <em>The Math Says Fewer, Aimed Better</em></h1>
            <p className="rpt-hero-sub">
              How many jobs should I apply to? Most advice hands you a daily number. We did
              the arithmetic with cited per-application rates instead, and it points the
              other way: fewer applications, each one aimed at a real person.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Students and freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Application math, daily and weekly targets</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>A typical online application is cited at <strong>roughly 0.1% to 2% success</strong> (The Interview Guys, April 2026). At that range, <strong>100 cold applications work out to between 0.1 and 2 expected interviews</strong> (illustrative).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>To expect one interview you need <strong>somewhere between 50 and 1,000 applications</strong>. The range is so wide that the count alone tells you very little.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Doubling your applications doubles your odds. Moving from the bottom of the range to the top <strong>multiplies them by twenty</strong>. Aim beats volume.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Applying to <strong>dozens of roles at one company</strong> is a pattern recruiters use to catch bot applications (NBC News, 2024). Pick one or two.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Our position: <strong>ten personal emails to the right hiring managers beat 100 cold applications</strong>. Replies are not guaranteed, but each email reaches the person who decides.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">0.1 to 2%</div>
              <div className="sc-label">typical success rate cited for a single online application</div>
              <div className="sc-source">The Interview Guys, April 2026 (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">242</div>
              <div className="sc-label">applications for an average job opening</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~1 in 50</div>
              <div className="sc-label">interviews per send at one bulk-apply service, which shut its bulk-send feature in August 2025</div>
              <div className="sc-source">The Interview Guys, April 2026 (reported)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">How Many Applications Does It Take to Get a Job? The Arithmetic</div>
                <div className="sec-sub">Multiply the cited rate by the number you send</div>
              </div>
            </div>
            <p>If you are asking how many jobs should I apply to, start with the rate, not the count. The Interview Guys (April 2026) cite a typical success rate of roughly 0.1% to 2% for an online application. Their own examples sit at both ends: one auto-apply account of about 5 interviews from thousands of applications (about 0.1%), and one bulk-apply service at roughly one interview per fifty sends (2%) before it shut its bulk-send feature in August 2025.</p>
            <p>Multiply the rate by the number you send and you get the expected interviews. This is simple arithmetic on a cited range, not a measurement of your odds.</p>
            <div className="chart-wrap">
              <div className="chart-label">Expected interviews by cold applications sent (illustrative, based on the cited 0.1% to 2% range)</div>
              <div style={{ height: 280 }}>
                <canvas id="hmjExpectChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cold applications</th>
                  <th>Expected interviews at 0.1%</th>
                  <th>Expected interviews at 2%</th>
                  <th>Chance of at least one, 0.1% to 2%</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>10</strong></td>
                  <td>0.01</td>
                  <td>0.2</td>
                  <td><span className="tag-pill pill-red">Low</span> About 1% to 18%</td>
                </tr>
                <tr>
                  <td><strong>50</strong></td>
                  <td>0.05</td>
                  <td>1</td>
                  <td><span className="tag-pill pill-amber">Mixed</span> About 5% to 64%</td>
                </tr>
                <tr>
                  <td><strong>100</strong></td>
                  <td>0.1</td>
                  <td>2</td>
                  <td><span className="tag-pill pill-amber">Mixed</span> About 10% to 87%</td>
                </tr>
                <tr>
                  <td><strong>250</strong></td>
                  <td>0.25</td>
                  <td>5</td>
                  <td><span className="tag-pill pill-blue">Wide</span> About 22% to 99%</td>
                </tr>
                <tr>
                  <td><strong>500</strong></td>
                  <td>0.5</td>
                  <td>10</td>
                  <td><span className="tag-pill pill-blue">Wide</span> About 39% to almost certain</td>
                </tr>
              </tbody>
            </table>
            <p>The last column assumes every application is independent, which flatters volume. In real life, sending more usually means writing less for each one.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Volume vs Aim: The Rate Matters More Than the Count</div>
                <div className="sec-sub">Why the math says fewer, aimed better</div>
              </div>
            </div>
            <p>Look at the table again. Going from 100 to 200 applications doubles your expected interviews. Going from the bottom of the cited range to the top multiplies them by twenty. No amount of extra clicking gives you a twentyfold jump.</p>
            <div className="chart-wrap">
              <div className="chart-label">Applications needed for one expected interview (illustrative, based on the cited 0.1% to 2% range)</div>
              <div style={{ height: 260 }}>
                <canvas id="hmjNeedChart" />
              </div>
            </div>
            <p>Every extra application also joins a big pile. An average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider). A copy-paste application is one more identical line in that list. In our view, what moves you up the range is aim: a role you genuinely fit, a resume whose top third matches the post, and a direct note to the person who decides.</p>
            <div className="highlight">
              <strong>Doubling your applications doubles your odds. Moving up the range multiplies them by twenty.</strong> Spend your week on the rate, not the count.
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">How Many Jobs to Apply For at One Company</div>
                <div className="sec-sub">One or two, not every opening on the careers page</div>
              </div>
            </div>
            <p>Recruiters catch bot applications in two ways. They plant hidden instructions in job posts, for example asking applicants to include a specific odd word, and they spot patterns such as one person applying to dozens of roles at the same company (NBC News, 17 November 2024, quoting recruiter Mike Peditto). Spraying one company's careers page puts you in the second group, even if you typed every form yourself.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Apply to one or two roles</strong> that genuinely match your proof, not every opening with "associate" in the title.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Read the post to the end.</strong> If it asks for something specific, give exactly that.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Email the manager for the role you want most.</strong> One clear message beats six applications to the same building.</span></div>
            </div>
            <div className="callout">
              <strong>On daily volume tools:</strong> LinkedIn's terms ban bots and automation tools (User Agreement, section 8.2). Software that pushes your daily count up by automating applications runs straight into those terms, and recruiters are watching for the patterns it leaves.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">How Many Job Applications per Day, and per Week?</div>
                <div className="sec-sub">Our suggested week: about ten aimed roles, each with an email</div>
              </div>
            </div>
            <p>There is no measured magic number for how many jobs to apply to a day. Here is the week we would run instead. It is a suggestion, not a statistic, and it works out to about ten applications a week, or two a day across a five-day week.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>What you do</th>
                  <th>How many</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Monday</strong></td>
                  <td>Shortlist roles you genuinely fit from Naukri, LinkedIn, Internshala and company careers pages</td>
                  <td>10 roles</td>
                </tr>
                <tr>
                  <td><strong>Tuesday to Thursday</strong></td>
                  <td>Apply where the company asks for it, with the top third of your resume matched to each post</td>
                  <td>About 3 a day</td>
                </tr>
                <tr>
                  <td><strong>Same days</strong></td>
                  <td>Find the hiring manager or team lead for each role and send one short, personal email</td>
                  <td>10 emails</td>
                </tr>
                <tr>
                  <td><strong>The next week</strong></td>
                  <td>Follow up once on each email, with something new to add</td>
                  <td>Up to 10</td>
                </tr>
                <tr>
                  <td><strong>Friday</strong></td>
                  <td>Drop roles that have gone cold and refill the shortlist</td>
                  <td>Back to 10</td>
                </tr>
              </tbody>
            </table>
            <p>Ten a week sounds small next to "apply to 50 a day." But every one of the ten reaches a person, and you can actually follow up on ten.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Ten Personal Emails vs 100 Cold Applications</div>
                <div className="sec-sub">Same week, very different inboxes</div>
              </div>
            </div>
            <p>A cold application goes into the pile. A personal email goes to the hiring manager or team lead, the person who can say "let's talk." We do not have a reply rate for emails and we will not invent one. Replies are not guaranteed. What changes is who reads your name.</p>
            <div className="chart-wrap">
              <div className="chart-label">100 cold applications vs 10 personal emails (Studojo editorial rating, not measured data)</div>
              <div style={{ height: 300 }}>
                <canvas id="hmjCompareChart" />
              </div>
            </div>
            <div className="pull-quote">
              <p>"A hundred applications ask a hundred piles to notice you. Ten emails ask ten people who can actually hire you."</p>
              <span className="pq-source">The Studojo position</span>
            </div>
            <p>We built Studojo to do exactly this. It finds the person who can actually hire you (the hiring manager or team lead, not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail. A few emails, each written for one person, instead of hundreds of identical sends.</p>
            <p>8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026).</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">How many jobs to apply to a day, per week and at one company, answered directly</div>
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
                <div className="sec-title" style={{ color: "#3b0764" }}>The Short Answer</div>
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How many jobs should you apply to? Fewer, aimed better</div>
              </div>
            </div>
            <div className="blist">
              {[
                ["About ten a week", "Roles you genuinely fit, chosen on purpose, not scrolled past and clicked."],
                ["One or two per company", "Dozens at one company is a pattern recruiters watch for."],
                ["An email for every one", "A short, personal note to the hiring manager or team lead, from your own address."],
                ["One follow-up, then move on", "Add something new, and never send a third message."],
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
              <Link to="/reports/why-am-i-not-getting-a-job-2026" className="related-card">
                <div className="rc-kicker">Diagnosis</div>
                <div className="rc-title">Why Am I Not Getting a Job? The Six Real Reasons, and the Fix for Each</div>
              </Link>
              <Link to="/reports/does-auto-apply-work-report-2026" className="related-card">
                <div className="rc-kicker">Auto-apply</div>
                <div className="rc-title">Does Auto-Apply Work?</div>
              </Link>
              <Link to="/reports/how-long-does-it-take-to-get-a-job-2026" className="related-card">
                <div className="rc-kicker">Timelines</div>
                <div className="rc-title">How Long Does It Take to Get a Job? The Timelines, and How to Shorten Yours</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Send ten emails, not a hundred applications.</h3>
              <p>Studojo finds the hiring manager or team lead, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
