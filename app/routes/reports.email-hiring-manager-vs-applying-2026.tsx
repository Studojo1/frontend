import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Email the Hiring Manager vs Applying Online (2026 Report) | Studojo" },
    { name: "description", content: "Should you email the hiring manager or apply online? Both paths side by side, when to do both, and the 4-part email a hiring manager actually reads." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "email hiring manager, should I email the hiring manager, email hiring manager vs apply online, contact hiring manager directly, cold email hiring manager, email hiring manager directly, reach out to hiring manager" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/email-hiring-manager-vs-applying-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Emailing the Hiring Manager vs Applying Online: Skip the Queue" },
    { property: "og:description", content: "About 242 applications per opening, or one email to the person who decides. The two paths side by side, when to do both, and how to write the email." },
    { property: "og:url", content: `${BASE_URL}/reports/email-hiring-manager-vs-applying-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-27T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Email the Hiring Manager vs Applying Online | Studojo" },
    { name: "twitter:description", content: "The portal queue vs one email to the person who decides. When to do both, and the four parts of an email that gets read." },
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

  // Chart 1: results per 100 applications at the reported rates (calculated)
  const oddsEl = document.getElementById("ehmOddsChart") as HTMLCanvasElement | null;
  if (oddsEl && !oddsEl.dataset.rendered) {
    oddsEl.dataset.rendered = "1";
    new Chart(oddsEl, {
      type: "bar",
      data: {
        labels: [
          "Online application, low end (0.1%)",
          "Online application, high end (2%)",
          "Bulk-send service, about 1 in 50",
          "One auto-apply account, about 0.1%",
        ],
        datasets: [{
          label: "Results per 100 applications",
          data: [0.1, 2, 2, 0.1],
          backgroundColor: [RED, ORANGE, ORANGE, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} per 100 applications (calculated from reported rates)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 3, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: portal path vs direct email path (editorial rating)
  const pathsEl = document.getElementById("ehmPathsChart") as HTMLCanvasElement | null;
  if (pathsEl && !pathsEl.dataset.rendered) {
    pathsEl.dataset.rendered = "1";
    new Chart(pathsEl, {
      type: "bar",
      data: {
        labels: [
          "Reaches the person who decides",
          "Shows you understand the team",
          "Gets a human read fast",
          "Easy to send",
          "Stands out from other applicants",
        ],
        datasets: [
          {
            label: "Portal path",
            data: [1, 2, 1, 5, 1],
            backgroundColor: MUTED,
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            label: "Direct email path",
            data: [5, 5, 4, 2, 4],
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

  // Chart 3: word budget of a 100-word email (illustrative)
  const wordsEl = document.getElementById("ehmWordsChart") as HTMLCanvasElement | null;
  if (wordsEl && !wordsEl.dataset.rendered) {
    wordsEl.dataset.rendered = "1";
    new Chart(wordsEl, {
      type: "doughnut",
      data: {
        labels: ["First line about their team", "One proof point", "One clear ask", "Sign-off and a link"],
        datasets: [{
          data: [25, 45, 15, 15],
          backgroundColor: [VIOLET, VIOLET2, ORANGE, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw} of 100 words (illustrative)` } },
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
    q: "Should I email the hiring manager after applying online?",
    a: "Yes. Apply through the form so you are in their system, then send the hiring manager a short email the same day or the next. Name the role, show one thing you noticed about their team, give one proof point and ask one question. That turns one application in a queue of about 242 into a name a person has actually read.",
  },
  {
    q: "Is it better to email the hiring manager or apply online?",
    a: "Emailing the hiring manager is the stronger move, and when a role has an application form, the best move is both. Online applications are cited at roughly 0.1% to 2% success per application (The Interview Guys, April 2026). An email puts you in front of the person who decides instead of at the back of a queue.",
  },
  {
    q: "How do I find the hiring manager's email?",
    a: "First work out who leads the team the role sits in, using the job post, the company site or LinkedIn. Then you need an address that actually delivers, because a guessed email that bounces wastes the whole effort. Studojo does this for you: it finds the person who can hire you and verifies their email before anything is sent.",
  },
  {
    q: "What should I write in an email to a hiring manager?",
    a: "Four parts: a subject that names the role or their work, a first line about their team, one proof point from your own work, and one clear ask. Keep it short enough to read on a phone without scrolling. Leave out the life story and the list of skills.",
  },
  {
    q: "What if the hiring manager does not reply?",
    a: "Follow up once, about a week later, on the same thread with one or two short lines. If there is still nothing, stop and write to the next person. Replies are not guaranteed, so keep several conversations going at once.",
  },
  {
    q: "Should I attach my resume when I email a hiring manager?",
    a: "Attach it or link it, but never let the attachment do the talking. An email with a resume and no message gives the reader no reason to open the file. Make your case in three or four lines of the body and treat the resume as backup.",
  },
];

export default function EmailHiringManagerVsApplyingReport() {
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
        "headline": "Emailing the Hiring Manager vs Applying Online: Skip the Queue",
        "description": "Should you email the hiring manager or apply online? The portal path and the direct path side by side, when to do both, and the four-part email that gets read.",
        "url": `${BASE_URL}/reports/email-hiring-manager-vs-applying-2026`,
        "datePublished": "2026-10-27T00:00:00Z",
        "dateModified": "2026-10-27T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/email-hiring-manager-vs-applying-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Email the Hiring Manager vs Applying Online", "item": `${BASE_URL}/reports/email-hiring-manager-vs-applying-2026` },
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
              <span>Email the Hiring Manager vs Applying Online</span>
            </nav>
            <h1>Emailing the Hiring Manager vs Applying Online: <em>Skip the Queue</em></h1>
            <p className="rpt-hero-sub">
              An average job opening draws about 242 applications. A hiring manager has one
              inbox. This report puts the two paths side by side, shows when to use both, and
              breaks down the four-part email that gets read.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Students and freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Portal applications vs direct email</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>The portal path is a queue: an average opening draws <strong>about 242 applications</strong> (The Interview Guys, April 2026, citing Business Insider data), and a first resume scan lasts about 6 to 7 seconds (Ladders, 2018).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Online applications are cited at <strong>roughly 0.1% to 2% success per application</strong> (The Interview Guys, April 2026). Mass-applying multiplies the misses, not the odds.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The direct path skips the queue: <strong>one short email to the person who decides</strong>, the hiring manager or team lead, not a generic HR inbox.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>You do not have to choose. <strong>Apply, then email</strong> the hiring manager the same day or the next, so you are in their system and in their inbox.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The email has <strong>four parts</strong>: a subject naming the role or their work, a first line about their team, one proof point, one ask. Follow up once, then stop.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">242</div>
              <div className="sc-label">applications for an average job opening, which is the queue the portal puts you in</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider data (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">6 to 7s</div>
              <div className="sc-label">is how long a recruiter spends on a first resume scan</div>
              <div className="sc-source">Ladders eye-tracking study, 2018</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">2%</div>
              <div className="sc-label">is the high end of the cited success rate per online application. The low end is 0.1%.</div>
              <div className="sc-source">The Interview Guys, April 2026 (reported)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">The Portal Path: You Are One of About 242</div>
                <div className="sec-sub">Why applying online so often feels like shouting into a void</div>
              </div>
            </div>
            <p>When you click apply, your resume joins a queue. The Interview Guys (April 2026), citing Business Insider data, put the average at about 242 applications per opening. Someone has to get through that pile, and the first pass is fast: recruiters spend about 6 to 7 seconds on a first resume scan (Ladders eye-tracking study, 2018).</p>
            <p>That is why the cited success rate for an online application sits at roughly 0.1% to 2% per application (The Interview Guys, April 2026). Applying online can work. It is a lottery with bad odds.</p>
            <div className="chart-wrap">
              <div className="chart-label">Results per 100 applications at the reported rates (calculated from The Interview Guys, April 2026)</div>
              <div style={{ height: 260 }}>
                <canvas id="ehmOddsChart" />
              </div>
            </div>
            <p>The obvious response is volume. Apply to more. That is what auto-apply bots and "AI job hunters" sell, and it does not work. The same Interview Guys article reports one auto-apply account getting about 5 interviews from thousands of applications (about 0.1%), and a bulk-apply service that shut its bulk-send feature in August 2025 at roughly one interview per fifty sends.</p>
            <div className="callout">
              <strong>Recruiters notice.</strong> NBC News (17 November 2024) reported recruiters planting hidden instructions in job posts to catch bot applications, and spotting people who apply to dozens of roles at the same company. Spraying applications does not only miss. It can make you look like a bot.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">The Direct Path: One Person Who Decides</div>
                <div className="sec-sub">Skip the queue and write to the person who owns the problem</div>
              </div>
            </div>
            <p>The hiring manager is the person whose team has the empty seat. In most teams, recruiters and HR run the process and the hiring manager makes the call. They know exactly what the job needs, because they are the one waiting for someone to do it.</p>
            <p>A short email to that person skips the portal queue. It lands in a human inbox, it gets read by someone who knows the work, and it gives you room to show you understand their team, which no resume field can do.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Portal path</th>
                  <th>Direct email path</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Who sees it first</strong></td>
                  <td>A screening pass, often a recruiter reading fast</td>
                  <td>The person who leads the team</td>
                </tr>
                <tr>
                  <td><strong>Competition</strong></td>
                  <td>About 242 applications per opening (reported)</td>
                  <td>Whatever else is in their inbox that day</td>
                </tr>
                <tr>
                  <td><strong>First look</strong></td>
                  <td>About 6 to 7 seconds on your resume (Ladders, 2018)</td>
                  <td>A subject line and one opening sentence</td>
                </tr>
                <tr>
                  <td><strong>What you can show</strong></td>
                  <td>Keywords, job titles, dates</td>
                  <td>That you understand their team and its work</td>
                </tr>
                <tr>
                  <td><strong>Reported odds</strong></td>
                  <td>0.1% to 2% per application (reported)</td>
                  <td>We have not found a verified rate, so we do not quote one</td>
                </tr>
                <tr>
                  <td><strong>Effort per send</strong></td>
                  <td>Low: a few clicks</td>
                  <td>Higher: the right person, a working email, the right words (Studojo does this for you)</td>
                </tr>
                <tr>
                  <td><strong>Verdict</strong></td>
                  <td><span className="tag-pill pill-amber">Lottery</span> Do it, but do not rely on it</td>
                  <td><span className="tag-pill pill-green">Strong</span> Where your effort should go</td>
                </tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">Portal path vs direct email path, scored 1 to 5 (Studojo editorial rating)</div>
              <div style={{ height: 320 }}>
                <canvas id="ehmPathsChart" />
              </div>
            </div>
            <div className="highlight">
              The portal path is cheap to send and easy to ignore. The direct path costs more per send and is much harder to ignore. <strong>Our position: put your effort where a human reads it.</strong>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">When to Do Both: Apply, Then Email</div>
                <div className="sec-sub">You do not have to pick one</div>
              </div>
            </div>
            <p>If the role is posted with an application form, fill it in. Larger companies often need your application in their system before they can move you forward. Then email the hiring manager, the same day or the next, so a person knows your name before the queue reaches you.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Situation</th>
                  <th>What to do</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Role posted on a careers page or job board</strong></td>
                  <td>Apply, then email the hiring manager within a day</td>
                  <td>You exist in their system and in their inbox</td>
                </tr>
                <tr>
                  <td><strong>Startup or small team, no posting</strong></td>
                  <td>Email only</td>
                  <td>There is no queue to join. The founder or team lead is the process.</td>
                </tr>
                <tr>
                  <td><strong>Big company with a strict process</strong></td>
                  <td>Apply, then a short email to the team lead saying you applied</td>
                  <td>You respect the process and add a human signal</td>
                </tr>
                <tr>
                  <td><strong>You already have a referral</strong></td>
                  <td>Use the referral, then email the hiring manager</td>
                  <td>Two signals beat one</td>
                </tr>
                <tr>
                  <td><strong>No role posted yet</strong></td>
                  <td>Email the team lead about the work, not an opening</td>
                  <td>Teams often know they need someone before a post goes live</td>
                </tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>The email does not replace the application.</strong> If the post says apply through the portal, do that too. The email makes sure a person actually reads what you sent.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">How to Write the Email: Four Parts</div>
                <div className="sec-sub">Short enough to read on a phone, specific enough to answer</div>
              </div>
            </div>
            <p>Forget "I am writing to express my interest." A hiring manager has read that line hundreds of times. Use four parts instead.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>1. A subject that names the role or their work.</strong> "Data analyst role: a note on your churn dashboard" gets opened. "Job application" gets archived.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>2. A first line about them.</strong> One sentence that proves you looked: their product, a recent launch, a post they wrote, the problem their team is hiring for.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>3. One proof point.</strong> A single project or result that matches the work. Numbers if you have them. Not your whole resume.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>4. One ask.</strong> "Would a 15-minute call next week work?" One question, easy to say yes to.</span></div>
            </div>
            <div className="highlight">
              <strong>Subject:</strong> Growth intern role: a thought on your referral flow<br />
              Hi [first name], I saw your team opened a growth intern role, and I have been using your referral flow for a month. [One specific thing you noticed about their product or work.]<br />
              Last semester I [one project that matches the role, with a result]. I have applied through your careers page as well. Would a 15-minute call next week work?<br />
              [Your name] · [LinkedIn or portfolio link]
            </div>
            <div className="chart-wrap">
              <div className="chart-label">Where the words go in a 100-word email (illustrative)</div>
              <div style={{ height: 260 }}>
                <canvas id="ehmWordsChart" />
              </div>
            </div>
            <div className="pull-quote">
              <p>"If your first line could be sent to any company, it is not your first line yet."</p>
              <span className="pq-source">The Studojo test for every email</span>
            </div>
            <p>Then follow up once. If there is no reply after about a week, send one or two short lines on the same thread and stop there. Replies are not guaranteed, and chasing past one follow-up turns a good email into a nuisance.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Fastest Way to Do This: Studojo</div>
                <div className="sec-sub">The person, the verified email, the words, sent from your Gmail</div>
              </div>
            </div>
            <p>The direct path has one honest cost: effort. You have to work out who leads the team, find an email that will not bounce, and write something specific to that one person. Doing that by hand for twenty roles is a lot of evenings.</p>
            <p>We built Studojo to do exactly this. It finds the person who can actually hire you (the hiring manager or team lead, not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail.</p>
            <div className="highlight">
              So far: <strong>8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail</strong> (Studojo's own records, September 2026).
            </div>
            <p>Replies are not guaranteed. What Studojo does is put a specific, personal email in front of the person who decides, which is where we think your effort belongs.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">Emailing the hiring manager, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to spend your effort this week</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Stop measuring your search by how many applications you sent. Measure it by how many people who decide have read your name:</p>
            <div className="blist">
              {[
                ["Apply where there is a form", "It keeps you in their system. Do not expect it to do the work alone."],
                ["Then email the person", "The hiring manager or team lead, the same day or the next."],
                ["Four parts, one ask", "Subject naming the role, a line about them, one proof point, one question."],
                ["Follow up once", "About a week later, then move on to the next person."],
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
              <Link to="/reports/do-hiring-managers-read-cold-emails-2026" className="related-card">
                <div className="rc-kicker">Cold email</div>
                <div className="rc-title">Do Hiring Managers Read Cold Emails?</div>
              </Link>
              <Link to="/reports/find-hiring-manager-email-2026" className="related-card">
                <div className="rc-kicker">Hiring managers</div>
                <div className="rc-title">How to Find a Hiring Manager's Email</div>
              </Link>
              <Link to="/reports/cold-outreach-what-gets-reply-2026" className="related-card">
                <div className="rc-kicker">Replies</div>
                <div className="rc-title">Cold Outreach: What Actually Gets a Reply</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Skip the queue. Email the person who decides.</h3>
              <p>Studojo finds the hiring manager, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
