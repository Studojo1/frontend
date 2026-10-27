import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Do Hiring Managers Read Cold Emails? The 2026 Report | Studojo" },
    { name: "description", content: "Do hiring managers read cold emails? Yes, the short, relevant ones. What gets read, what gets deleted, and a checklist for an email they will open." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "do hiring managers read cold emails, do recruiters read cold emails, is it okay to email a hiring manager directly, does cold emailing for jobs work, cold email hiring manager, is it unprofessional to email hiring manager" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/do-hiring-managers-read-cold-emails-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Do Hiring Managers Read Cold Emails? Yes, If You Earn the First Line" },
    { property: "og:description", content: "Hiring managers own the hiring problem. They read short, relevant notes and delete generic blasts. What gets read, what gets deleted, and the checklist." },
    { property: "og:url", content: `${BASE_URL}/reports/do-hiring-managers-read-cold-emails-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-27T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Do Hiring Managers Read Cold Emails? | Studojo" },
    { name: "twitter:description", content: "What gets a cold email to a hiring manager read, what gets it deleted, and the checklist to run before you hit send." },
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
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: what gets a cold email read (editorial rating)
  const readEl = document.getElementById("dhmReadChart") as HTMLCanvasElement | null;
  if (readEl && !readEl.dataset.rendered) {
    readEl.dataset.rendered = "1";
    new Chart(readEl, {
      type: "bar",
      data: {
        labels: [
          "Subject names the role or their work",
          "First line is about them",
          "One proof point with a result",
          "One clear, small ask",
          "Sent from your own email address",
          "Readable on a phone without scrolling",
        ],
        datasets: [{
          label: "How much it helps (1-5)",
          data: [5, 5, 4, 4, 4, 4],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET2, VIOLET2, VIOLET2],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Helps: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: what gets a cold email deleted (editorial rating)
  const deleteEl = document.getElementById("dhmDeleteChart") as HTMLCanvasElement | null;
  if (deleteEl && !deleteEl.dataset.rendered) {
    deleteEl.dataset.rendered = "1";
    new Chart(deleteEl, {
      type: "bar",
      data: {
        labels: [
          "Attachment only, no message",
          "Same text sent to hundreds",
          "'Dear Sir/Madam' greeting",
          "Asks for 'any opening'",
          "Untouched AI draft",
          "Opens with your life story",
        ],
        datasets: [{
          label: "How much it hurts (1-5)",
          data: [5, 5, 4, 4, 4, 3],
          backgroundColor: [RED, RED, ORANGE, ORANGE, ORANGE, ORANGE],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Hurts: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 3: email length vs how likely it is read to the end (editorial rating)
  const lenEl = document.getElementById("dhmLengthChart") as HTMLCanvasElement | null;
  if (lenEl && !lenEl.dataset.rendered) {
    lenEl.dataset.rendered = "1";
    new Chart(lenEl, {
      type: "bar",
      data: {
        labels: ["2 to 3 lines", "60 to 120 words", "150 to 200 words", "300+ words"],
        datasets: [{
          label: "Likely to be read to the end (1-5)",
          data: [4, 5, 3, 1],
          backgroundColor: [VIOLET2, VIOLET, ORANGE, RED],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` Read to the end: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
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
    q: "Do hiring managers read cold emails?",
    a: "Yes, the short and relevant ones. A hiring manager owns the open seat on their team, so a note that shows you understand that work is useful to them. Generic blasts and attachment-only emails get deleted. Replies are not guaranteed, but a specific email to the right person has a real chance of being read.",
  },
  {
    q: "Do recruiters read cold emails?",
    a: "They can, but recruiters usually run several roles at once and screen big queues, about 242 applications for an average opening (The Interview Guys, April 2026, citing Business Insider data). If you can find the hiring manager, write to them, because they make the call. If you cannot, a short, specific note to the recruiter about that exact role beats saying nothing.",
  },
  {
    q: "Is it okay to email a hiring manager directly?",
    a: "Yes. A short email to a hiring manager's work address about a role on their team is normal professional behaviour. Keep it specific, ask one question, and follow up once at most. What crosses the line is chasing again and again, or messaging a personal number nobody gave you.",
  },
  {
    q: "Is it unprofessional to email the hiring manager instead of HR?",
    a: "No, as long as you still follow the process. If there is an application form, apply, then email the hiring manager to say you did and why you fit. The email adds a human signal. It does not replace the application.",
  },
  {
    q: "Does cold emailing for jobs work?",
    a: "In our view it works better than spraying applications, because it reaches the person who decides instead of a queue. Online applications are cited at roughly 0.1% to 2% success per application (The Interview Guys, April 2026). We have not found a cold email reply rate for job seekers that we can verify, so we do not quote one, and replies are never guaranteed.",
  },
  {
    q: "How long should a cold email to a hiring manager be?",
    a: "Short enough to read on a phone without scrolling, roughly 60 to 120 words. That is room for one line about them, one proof point and one ask. Anything longer starts to read like a cover letter, and it gets skimmed.",
  },
];

export default function DoHiringManagersReadColdEmailsReport() {
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
        "headline": "Do Hiring Managers Read Cold Emails? Yes, If You Earn the First Line",
        "description": "Do hiring managers read cold emails? The short, relevant ones, yes. What gets read, what gets deleted, and an editorial checklist for writing one.",
        "url": `${BASE_URL}/reports/do-hiring-managers-read-cold-emails-2026`,
        "datePublished": "2026-10-27T00:00:00Z",
        "dateModified": "2026-10-27T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/do-hiring-managers-read-cold-emails-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Do Hiring Managers Read Cold Emails?", "item": `${BASE_URL}/reports/do-hiring-managers-read-cold-emails-2026` },
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
              <span>Do Hiring Managers Read Cold Emails?</span>
            </nav>
            <h1>Do Hiring Managers Read Cold Emails? <em>Yes, If You Earn the First Line</em></h1>
            <p className="rpt-hero-sub">
              Short answer: the good ones, yes. A hiring manager owns the empty seat on their
              team, so a short note from someone who did their homework is useful to them. A
              generic blast is not. This report shows the difference, line by line.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Students and freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Cold emails to hiring managers</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Hiring managers own the hiring problem.</strong> The empty seat is on their team, so a short, relevant note about that work is worth their time. In our view, that is why the good ones get read.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>What gets read: <strong>a subject naming the role or their work, a first line about them, one proof point, one ask</strong>.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>What gets deleted: <strong>generic blasts and attachment-only emails</strong>, along with "Dear Sir/Madam" and requests for "any opening".</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>You get seconds. Recruiters spend about <strong>6 to 7 seconds</strong> on a first resume scan (Ladders, 2018). Write as if your first line gets the same glance.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>We have not found a cold email reply rate we can verify</strong>, so this report does not quote one. Every rating chart here is a Studojo editorial rating and says so.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">6 to 7s</div>
              <div className="sc-label">is how long a recruiter spends on a first resume scan, so your first line has seconds</div>
              <div className="sc-source">Ladders eye-tracking study, 2018</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">242</div>
              <div className="sc-label">applications for an average opening, the pile a direct email skips</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider data (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">58%</div>
              <div className="sc-label">of job seekers use AI in their search, so generic AI-written emails are everywhere</div>
              <div className="sc-source">Capterra, cited by NBC News, November 2024 (reported)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">The Short Answer: Yes, the Good Ones</div>
                <div className="sec-sub">Why a hiring manager has a reason to read you</div>
              </div>
            </div>
            <p>A hiring manager is the person whose team has the open role. Until it is filled, the work either waits or lands on someone already busy. That makes them the one person in the company with a direct reason to read a note about the job.</p>
            <p>Recruiters and HR usually screen the queue, and the queue is big: about 242 applications for an average opening (The Interview Guys, April 2026, citing Business Insider data). The hiring manager often sees only a shortlist. A cold email skips that pile and lands with the person who decides.</p>
            <p>That does not mean every email gets read. Hiring managers are busy, and they ignore what wastes their time. Our position is simple: <strong>they read short, relevant notes from people who did their homework, and they delete the rest.</strong></p>
            <div className="highlight">
              You will see cold email reply rates quoted all over the internet. <strong>We have not found one for job seekers emailing hiring managers that we can verify</strong>, so we do not quote one. Replies are not guaranteed. What you control is whether your email is worth reading.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">What Gets Read</div>
                <div className="sec-sub">Four things the opened email has in common</div>
              </div>
            </div>
            <p>The emails that get read are not clever. They are specific. Each one answers the reader's first question, "why is this in my inbox?", before they have to ask it.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>A subject naming the role or their work.</strong> "Backend intern role: your payments API docs" tells them what this is in one glance. "Request for opportunity" does not.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>A first line about them.</strong> Their product, a launch, a post they wrote, the problem their team is hiring to solve. One sentence that proves you looked.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>One proof point.</strong> A single project or result that matches their work. One, with a number if you have it. Not a list of skills.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>One ask.</strong> A small, specific question: a 15-minute call, or permission to send a short plan. Easy to say yes to.</span></div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">What gets a cold email to a hiring manager read, scored 1 to 5 (Studojo editorial rating)</div>
              <div style={{ height: 300 }}>
                <canvas id="dhmReadChart" />
              </div>
            </div>
            <div className="pull-quote">
              <p>"Earn the first line and the rest gets read. Waste it and nothing after it matters."</p>
              <span className="pq-source">The Studojo rule for cold emails</span>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">What Gets Deleted</div>
                <div className="sec-sub">The habits that end an email in the first second</div>
              </div>
            </div>
            <p>Every deleted email has the same flaw: it could have been sent to anyone. The reader can tell in one line.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>The generic blast.</strong> The same text sent to hundreds of people, with only the company name swapped. It reads exactly like what it is.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The attachment-only email.</strong> A resume and no message, or "PFA my resume". It gives the reader no reason to open the file.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>"Any opening, any role."</strong> It tells the hiring manager you did not look at their team. It also hands them homework: work out where you fit.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The life story first.</strong> Three paragraphs about you before a single line about them. They stop before the good part.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The untouched AI draft.</strong> Smooth, polite and empty. It says nothing only you could say.</span></div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">What gets a cold email deleted, by how much it hurts, 1 to 5 (Studojo editorial rating)</div>
              <div style={{ height: 300 }}>
                <canvas id="dhmDeleteChart" />
              </div>
            </div>
            <div className="callout">
              <strong>Why generic is getting worse.</strong> Capterra found 58% of job seekers use AI in their search (cited by NBC News, 17 November 2024), and a Huntr survey (a vendor survey, Q3 2025, n=527) reports 85.6% say they use AI tools. When everyone uses the same tools the same way, the same email arrives again and again. Recruiters already look for bot patterns: the same NBC piece reported recruiters planting hidden instructions in job posts to catch automated applications. A blast looks like a blast.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Is It Okay to Email a Hiring Manager Directly?</div>
                <div className="sec-sub">Yes. Here is where the line is.</div>
              </div>
            </div>
            <p>A short email to a work address, about a role on that person's own team, is normal professional behaviour. It is not unprofessional to skip HR when you also follow the process. If there is a form, apply, then write to the hiring manager and say you did.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fine</th>
                  <th>Crosses the line</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Emailing their work address</td>
                  <td>Messaging a personal number or account nobody gave you</td>
                </tr>
                <tr>
                  <td>One email and one follow-up about a week later</td>
                  <td>Three nudges in a week</td>
                </tr>
                <tr>
                  <td>Writing to the one person who leads the team</td>
                  <td>The same text to five people at the same company</td>
                </tr>
                <tr>
                  <td>Mentioning that you also applied</td>
                  <td>Asking them to skip the process for you</td>
                </tr>
              </tbody>
            </table>
            <p><strong>What about recruiters?</strong> Recruiters run the process, often for several roles at once. The hiring manager owns the problem. Our view: write to the hiring manager whenever you can find them, and to the recruiter for that exact role when you cannot.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Editorial Checklist</div>
                <div className="sec-sub">Run every email through this before you hit send</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Gets read</th>
                  <th>Gets deleted</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Subject</strong></td>
                  <td><span className="tag-pill pill-green">Read</span> Names the role or their work</td>
                  <td><span className="tag-pill pill-red">Deleted</span> "Job application" or "Request"</td>
                </tr>
                <tr>
                  <td><strong>Greeting</strong></td>
                  <td><span className="tag-pill pill-green">Read</span> Their first name</td>
                  <td><span className="tag-pill pill-red">Deleted</span> "Dear Sir/Madam", "To whom it may concern"</td>
                </tr>
                <tr>
                  <td><strong>First line</strong></td>
                  <td><span className="tag-pill pill-green">Read</span> About their team, product or post</td>
                  <td><span className="tag-pill pill-red">Deleted</span> "I hope this email finds you well"</td>
                </tr>
                <tr>
                  <td><strong>Proof</strong></td>
                  <td><span className="tag-pill pill-green">Read</span> One project with a result</td>
                  <td><span className="tag-pill pill-red">Deleted</span> A list of skills and adjectives</td>
                </tr>
                <tr>
                  <td><strong>Ask</strong></td>
                  <td><span className="tag-pill pill-green">Read</span> One small, specific question</td>
                  <td><span className="tag-pill pill-red">Deleted</span> "Please consider me for any opening"</td>
                </tr>
                <tr>
                  <td><strong>Length</strong></td>
                  <td><span className="tag-pill pill-green">Read</span> Fits on a phone screen</td>
                  <td><span className="tag-pill pill-red">Deleted</span> Paragraphs of background</td>
                </tr>
                <tr>
                  <td><strong>Attachment</strong></td>
                  <td><span className="tag-pill pill-green">Read</span> Resume linked or attached as backup</td>
                  <td><span className="tag-pill pill-red">Deleted</span> Attachment with no message</td>
                </tr>
                <tr>
                  <td><strong>Sender</strong></td>
                  <td><span className="tag-pill pill-green">Read</span> Your own email address</td>
                  <td><span className="tag-pill pill-red">Deleted</span> A bulk-sending or no-reply address</td>
                </tr>
                <tr>
                  <td><strong>Follow-up</strong></td>
                  <td><span className="tag-pill pill-green">Read</span> One, about a week later</td>
                  <td><span className="tag-pill pill-red">Deleted</span> Several in a week</td>
                </tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">Email length vs how likely it is read to the end (Studojo editorial rating)</div>
              <div style={{ height: 260 }}>
                <canvas id="dhmLengthChart" />
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">Studojo Writes This Email for You</div>
                <div className="sec-sub">One person at a time, sent from your Gmail</div>
              </div>
            </div>
            <p>Everything above takes time per email: finding the right person, getting an address that will not bounce, reading their work, writing a first line that is actually about them. That is the work that makes an email worth reading, and it is the work most people skip.</p>
            <p>We built Studojo to do exactly this. It finds the person who can actually hire you (the hiring manager or team lead, not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail. One person at a time, never a blast.</p>
            <div className="highlight">
              So far: <strong>8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail</strong> (Studojo's own records, September 2026).
            </div>
            <p>Replies are not guaranteed. A specific email to the person who decides is still, in our view, the best shot you can take.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">Cold emails to hiring managers, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>Before you hit send</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>A hiring manager will give your email a glance. Make the glance count:</p>
            <div className="blist">
              {[
                ["Write to the person who decides", "The hiring manager or team lead, not a generic HR inbox."],
                ["Earn the first line", "Make it about them. If it could go to any company, rewrite it."],
                ["One proof, one ask", "A single result that matches their work, and one small question."],
                ["Follow up once", "About a week later, on the same thread. Then move on."],
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
              <Link to="/reports/email-hiring-manager-vs-applying-2026" className="related-card">
                <div className="rc-kicker">Hiring managers</div>
                <div className="rc-title">Emailing the Hiring Manager vs Applying Online</div>
              </Link>
              <Link to="/reports/follow-up-job-application-timing-2026" className="related-card">
                <div className="rc-kicker">Follow-ups</div>
                <div className="rc-title">Following Up on a Job Application</div>
              </Link>
              <Link to="/reports/cold-email-subject-lines-best-practices-2026" className="related-card">
                <div className="rc-kicker">Cold email</div>
                <div className="rc-title">Cold Email Subject Lines: What Actually Gets Opened</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Earn the first line. Studojo writes it.</h3>
              <p>Studojo finds the hiring manager, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/b2cnew/join?via=report-do-hiring-managers-read-cold-emails-2026&how=voice" reloadDocument className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
