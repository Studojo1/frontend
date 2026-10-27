import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How to Get a Job in 2026: Every Route Compared, and the One That Skips the Queue | Studojo" },
    { name: "description", content: "How to get a job in 2026: seven routes compared on effort, competition and who reads you, from job portals and Easy Apply to emailing the hiring manager." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "how to get a job, how to get a job in 2026, how to find a job, ways to get a job, how to get a job quickly, best way to get a job" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/how-to-get-a-job-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How to Get a Job in 2026: Every Route Compared, and the One That Skips the Queue" },
    { property: "og:description", content: "Seven ways to get a job, rated on effort, competition and who actually reads you. Some routes put you in a pile. Others put you in front of a person." },
    { property: "og:url", content: `${BASE_URL}/reports/how-to-get-a-job-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-28T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How to Get a Job in 2026: Every Route Compared | Studojo" },
    { name: "twitter:description", content: "Job portals, Easy Apply, auto-apply, campus, referrals, recruiters and emailing the hiring manager, compared." },
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

  // Chart 1: how likely a person with hiring power reads you, by route (editorial rating)
  const routeEl = document.getElementById("hgjRouteChart") as HTMLCanvasElement | null;
  if (routeEl && !routeEl.dataset.rendered) {
    routeEl.dataset.rendered = "1";
    new Chart(routeEl, {
      type: "bar",
      data: {
        labels: [
          "Emailing the hiring manager",
          "Referral",
          "Campus placement",
          "Recruiter",
          "Job portal application",
          "Easy Apply",
          "Auto-apply bot",
        ],
        datasets: [{
          label: "Editorial rating (1-5)",
          data: [5, 4, 4, 3, 2, 1, 1],
          backgroundColor: [VIOLET, VIOLET2, VIOLET2, VIOLET3, ORANGE, RED, RED],
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

  // Chart 2: applications needed for one success at the cited success rates (illustrative maths)
  const mathEl = document.getElementById("hgjMathChart") as HTMLCanvasElement | null;
  if (mathEl && !mathEl.dataset.rendered) {
    mathEl.dataset.rendered = "1";
    new Chart(mathEl, {
      type: "bar",
      data: {
        labels: ["At 2% per application", "At 1% per application", "At 0.1% per application"],
        datasets: [{
          label: "Applications needed for one success",
          data: [50, 100, 1000],
          backgroundColor: [ORANGE, ORANGE, RED],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` About ${ctx.raw} applications for one success` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, ticks: { font: { size: 12 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: share of applicants vs share of hires by source (CareerPlug, vendor report)
  const srcEl = document.getElementById("hgjSourceChart") as HTMLCanvasElement | null;
  if (srcEl && !srcEl.dataset.rendered) {
    srcEl.dataset.rendered = "1";
    new Chart(srcEl, {
      type: "bar",
      data: {
        labels: ["Job boards", "Company career pages", "Referrals"],
        datasets: [
          {
            label: "Share of applicants (%)",
            data: [61, 13, 2],
            backgroundColor: VIOLET3,
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            label: "Share of hires (%)",
            data: [42, 26, 11],
            backgroundColor: VIOLET,
            borderRadius: 6,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 70, ticks: { font: { size: 12 }, color: MUTED } },
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
    q: "What is the best way to get a job in 2026?",
    a: "Reach the person who hires you, not just the portal. Apply where the company requires it, then send the hiring manager or team lead a short, personal email from your own address and follow up once. Studojo does this for you: it finds that person, verifies their email, writes the email for them and sends it from your own Gmail.",
  },
  {
    q: "How can I get a job quickly?",
    a: "Cut the number of people between you and the decision. Pick 10 to 20 roles you genuinely fit, find who leads each team, and send each one a specific email instead of firing off hundreds of applications. At a cited 0.1% to 2% success rate per online application (The Interview Guys, April 2026), mass applying feels fast but rarely is.",
  },
  {
    q: "How do I find a job with no experience?",
    a: "Use the routes where a person reads your proof: campus placement, referrals, and emails to hiring managers, especially at smaller companies and startups. Lead with one real project and what it achieved, because a concrete result beats a list of adjectives. Portals are fine for finding roles, but a fresher's resume rarely stands out in a pile of about 242.",
  },
  {
    q: "What are the different ways to get a job?",
    a: "The seven common routes are job portals, Easy Apply, auto-apply bots, campus placement, referrals, recruiters and emailing the hiring manager. The first three put you in a queue of applicants. The last four put you in front of a person, which is why we rate them higher.",
  },
  {
    q: "Do job portals like Naukri, LinkedIn and Indeed still work?",
    a: "They work as the place where listings live, and people do get hired through them. In CareerPlug's 2025 Recruiting Metrics Report (a vendor report on US small and mid-sized businesses), job boards brought 61% of applicants but 42% of hires. Use portals to find roles, then pair each application you care about with an email to the person who hires.",
  },
  {
    q: "Should I use an auto-apply bot to find a job?",
    a: "We say no. Recruiters catch bot applications with hidden instructions planted in job posts and by spotting one person applying to dozens of roles at the same company (NBC News, November 2024), and LinkedIn's terms ban bots and automation tools. One auto-apply account reported about 5 interviews from thousands of applications, roughly 0.1% (The Interview Guys, April 2026).",
  },
];

export default function HowToGetAJobReport() {
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
        "headline": "How to Get a Job in 2026: Every Route Compared, and the One That Skips the Queue",
        "description": "How to get a job in 2026: job portals, Easy Apply, auto-apply, campus placement, referrals, recruiters and emailing the hiring manager, compared on effort, competition and who reads you.",
        "url": `${BASE_URL}/reports/how-to-get-a-job-2026`,
        "datePublished": "2026-10-28T00:00:00Z",
        "dateModified": "2026-10-28T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/how-to-get-a-job-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "How to Get a Job 2026", "item": `${BASE_URL}/reports/how-to-get-a-job-2026` },
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
              <span>How to Get a Job 2026</span>
            </nav>
            <h1>How to Get a Job in 2026: <em>Every Route Compared, and the One That Skips the Queue</em></h1>
            <p className="rpt-hero-sub">
              Here is how to get a job in 2026, route by route. Several routes drop you into a
              pile of about 242 applicants. A few put you in front of the person who decides.
              We compare all seven on effort, competition and who actually reads you.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · India first</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Seven job routes, compared</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>Every route ends at one moment: <strong>a person with hiring power decides to talk to you</strong>. The best way to get a job is the route that reaches that person fastest.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Portals and Easy Apply put you in a pile. An average opening draws <strong>about 242 applications</strong> (The Interview Guys, April 2026, citing Business Insider data).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Auto-apply bots make the pile bigger, not your odds better. <strong>Recruiters plant hidden instructions</strong> in job posts to catch them (NBC News, 2024).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Referrals are the best measured shortcut: <strong>2% of applicants but 11% of hires</strong> in CareerPlug's data (vendor report, 2025).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The route we rate highest is <strong>emailing the hiring manager</strong>: short, personal, from your own address, with one follow-up. Studojo does it for you.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">~242</div>
              <div className="sc-label">applications drawn by an average job opening</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider data (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">0.1 to 2%</div>
              <div className="sc-label">typical success rate cited for a single online application</div>
              <div className="sc-source">The Interview Guys, April 2026 (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">11%</div>
              <div className="sc-label">of hires came from referrals, which were only 2% of applicants</div>
              <div className="sc-source">CareerPlug Recruiting Metrics Report, 2025 (vendor report)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">How to Get a Job: The One Moment Every Route Leads To</div>
                <div className="sec-sub">A person decides to talk to you. Everything else is getting there.</div>
              </div>
            </div>
            <p>If you want to know how to get a job, start with the moment it actually happens. Someone who can hire you reads about you and thinks, "I want to talk to this person." No offer exists without that moment.</p>
            <p>Every route to a job is a path to that moment. The routes differ on three things: how much effort each try costs you, how many people you compete with, and who reads you first. A portal puts a filter and a busy recruiter between you and the decision. A referral or a direct email puts you in front of a human with a name.</p>
            <div className="chart-wrap">
              <div className="chart-label">How likely a person with hiring power reads you, by route (Studojo editorial rating, not measured data)</div>
              <div style={{ height: 300 }}>
                <canvas id="hgjRouteChart" />
              </div>
            </div>
            <div className="highlight">
              The rule behind this whole report: <strong>the fewer people between you and the decision, the better your odds</strong>. Judge every route by how close it gets you to the person who hires.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Ways to Get a Job: All Seven Routes Compared</div>
                <div className="sec-sub">Effort, competition and who reads you first. Ratings are Studojo's editorial ratings.</div>
              </div>
            </div>
            <p>Here is every common route side by side. The ratings are our editorial judgement, built on the cited facts in this report, not a measured ranking.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Effort per try</th>
                  <th>Competition</th>
                  <th>Who reads you first</th>
                  <th>Editorial rating</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Emailing the hiring manager</strong></td>
                  <td>Medium (Studojo does the work)</td>
                  <td>You are not ranked in a queue of hundreds</td>
                  <td>The person who hires</td>
                  <td><span className="tag-pill pill-green">5/5</span> Our top pick</td>
                </tr>
                <tr>
                  <td><strong>Referral</strong></td>
                  <td>Medium, you need a contact</td>
                  <td>Small pool: 2% of applicants (CareerPlug, 2025)</td>
                  <td>A recruiter or manager, with a name attached</td>
                  <td><span className="tag-pill pill-green">4/5</span> Strong when you have one</td>
                </tr>
                <tr>
                  <td><strong>Campus placement</strong></td>
                  <td>Medium</td>
                  <td>Your batch, not the whole internet</td>
                  <td>A company panel at your college</td>
                  <td><span className="tag-pill pill-green">4/5</span> Strong if your college has it</td>
                </tr>
                <tr>
                  <td><strong>Recruiter</strong></td>
                  <td>Low</td>
                  <td>The recruiter's shortlist</td>
                  <td>A recruiter working for the employer</td>
                  <td><span className="tag-pill pill-blue">3/5</span> Useful, never pay to be placed</td>
                </tr>
                <tr>
                  <td><strong>Job portal application</strong></td>
                  <td>Medium</td>
                  <td>About 242 per opening (reported)</td>
                  <td>A filter, then a 6 to 7 second skim</td>
                  <td><span className="tag-pill pill-amber">2/5</span> Find roles here, do not stop here</td>
                </tr>
                <tr>
                  <td><strong>Easy Apply</strong></td>
                  <td>Very low</td>
                  <td>Usually a large pile, because it is so easy</td>
                  <td>The same skim, if you get one</td>
                  <td><span className="tag-pill pill-red">1/5</span> Volume, not odds</td>
                </tr>
                <tr>
                  <td><strong>Auto-apply bot</strong></td>
                  <td>None, until it backfires</td>
                  <td>You join every pile at once</td>
                  <td>Often a recruiter looking for bot patterns</td>
                  <td><span className="tag-pill pill-red">1/5</span> Avoid</td>
                </tr>
              </tbody>
            </table>
            <p>Notice the pattern. The low-effort routes have the most competition and the least human attention. The routes that need a little more thought are the ones that reach a person. That trade is worth making.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">How to Find a Job on Portals Without Living in the Pile</div>
                <div className="sec-sub">Naukri, LinkedIn, Indeed, Internshala and foundit are where listings live</div>
              </div>
            </div>
            <p>Job portals are not useless. They are where most listings live, and people do get hired through them. The problem is the pile. An average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data), and recruiters spend about 6 to 7 seconds on a first resume scan (Ladders eye-tracking study, 2018).</p>
            <p>Run the numbers on the typical success rate cited for one online application, roughly 0.1% to 2% (The Interview Guys, April 2026), and you see why sending more applications is a slow plan.</p>
            <div className="chart-wrap">
              <div className="chart-label">Applications needed for one success at the cited 0.1% to 2% rates (illustrative maths)</div>
              <div style={{ height: 260 }}>
                <canvas id="hgjMathChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Easy Apply makes the pile worse.</strong> The easier a role is to apply for, the more people apply. If it is quick for you, it is quick for everyone else.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Auto-apply bots make it worse still.</strong> One auto-apply account reported about 5 interviews from thousands of applications, roughly 0.1%, and one bulk-apply service shut its bulk-send feature in August 2025 at roughly one interview per fifty sends (The Interview Guys, April 2026).</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Recruiters are watching for bots.</strong> They plant hidden instructions in job posts, such as asking you to include an odd word, and they notice one person applying to dozens of roles at the same company (NBC News, 17 November 2024). LinkedIn's terms ban bots and automation tools.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Paying someone to apply feeds the same pile.</strong> Reverse recruiters are reported to charge about $1,500 a month plus about 10% of first-year salary (Fortune, 25 March 2026).</span></div>
            </div>
            <div className="callout">
              <strong>How to use portals well:</strong> treat them as a search engine for roles, not as the way in. Find the role on the portal, apply if the company requires it, then email the person who leads that team.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">The Routes That Reach a Person: Referrals, Campus and Recruiters</div>
                <div className="sec-sub">Smaller pools, human readers</div>
              </div>
            </div>
            <p>Referrals are the best measured shortcut we found. In CareerPlug's 2025 Recruiting Metrics Report, which covers 2024 hiring at US small and mid-sized businesses (a vendor report), referrals were 2% of applicants but 11% of hires. Company career pages also punched above their weight, while job boards brought most applicants and a smaller share of hires.</p>
            <div className="chart-wrap">
              <div className="chart-label">Share of applicants vs share of hires, by source, % (CareerPlug Recruiting Metrics Report 2025, vendor report)</div>
              <div style={{ height: 280 }}>
                <canvas id="hgjSourceChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Referrals.</strong> Ask people who already work there, and ask for something specific: "Could you pass my resume to the person hiring for this role?" The catch is that most freshers have a thin network, so referrals cannot be your only route.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Campus placement.</strong> In India, if your college has a strong placement cell, it is a smaller, friendlier pool than the open internet. Sit every drive you qualify for, and run your own outreach alongside it.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Recruiters.</strong> A genuine recruiter is paid by the employer to fill a role. Good ones are worth replying to. If anyone asks you to pay to be placed, we would walk away.</span></div>
            </div>
            <p>Some roles are filled through people before a listing ever gets much attention, which is why reaching people matters. We cover that in <Link to="/reports/hidden-job-market-70-percent-never-posted-2026">the hidden job market report</Link>.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Best Way to Get a Job: Email the Person Who Hires</div>
                <div className="sec-sub">The route that skips the queue</div>
              </div>
            </div>
            <p>This is Studojo's position, and we hold it firmly: the best way to get a job is to email the person who actually hires for the role. That is the hiring manager or team lead, not a generic HR inbox. Keep it short, personal and specific, send it from your own email address, and follow up once.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>1. Find the right person.</strong> The manager of the team you would join. They feel the empty seat every day.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>2. Get an email that works.</strong> A verified address, not a guess that bounces.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>3. Write for that one person.</strong> Four to six lines: why their team, one proof point from your work, a small ask like a 15 minute call.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>4. Send from your own Gmail.</strong> A real person writing to a real person, not a blast.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>5. Follow up once.</strong> A short nudge about a week later, with one new detail. Following up once helps.</span></div>
            </div>
            <div className="pull-quote">
              <p>"Applying gets you into a pile. Emailing gets you into an inbox."</p>
              <span className="pq-source">The Studojo position</span>
            </div>
            <div className="highlight">
              <strong>We built Studojo to do exactly this.</strong> It finds the person who can actually hire you, verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail. 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026). Replies are not guaranteed, but you are finally writing to the right person.
            </div>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">How to Get a Job Quickly: A Two-Week Plan</div>
                <div className="sec-sub">Use every route, weighted toward the ones that reach a person</div>
              </div>
            </div>
            <p>You do not have to pick one route. Use the cheap ones to find roles and the strong ones to get read.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>What you do</th>
                  <th>Route</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Day 1</strong></td>
                  <td>Shortlist 10 to 20 roles you genuinely fit from portals and company career pages</td>
                  <td>Job portals</td>
                </tr>
                <tr>
                  <td><strong>Days 2 to 4</strong></td>
                  <td>Find who leads each team and send each one a short, specific email</td>
                  <td>Emailing the hiring manager</td>
                </tr>
                <tr>
                  <td><strong>Days 2 to 4</strong></td>
                  <td>Apply formally wherever the company requires an application</td>
                  <td>Job portals</td>
                </tr>
                <tr>
                  <td><strong>Day 5</strong></td>
                  <td>Ask two or three people you know for a specific referral</td>
                  <td>Referrals</td>
                </tr>
                <tr>
                  <td><strong>Days 9 to 11</strong></td>
                  <td>Follow up once on every email, with one new detail</td>
                  <td>Emailing the hiring manager</td>
                </tr>
                <tr>
                  <td><strong>Day 12 onward</strong></td>
                  <td>Repeat with a fresh shortlist, and keep campus drives running</td>
                  <td>All routes</td>
                </tr>
              </tbody>
            </table>
            <p>Skip auto-apply and mass Easy Apply. They feel productive, but all they do is add you to bigger piles.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">How to get a job, answered directly</div>
              </div>
            </div>
            {FAQ.map((f) => (
              <div className="faq-item" key={f.q}>
                <div className="faq-q">{f.q}</div>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>

          {/* Related reports */}
          <div className="related">
            <h2>Related reports</h2>
            <div className="related-grid">
              <Link to="/reports/how-to-get-a-job-as-a-fresher-india-2026" className="related-card">
                <div className="rc-kicker">Freshers</div>
                <div className="rc-title">How to Get a Job as a Fresher in India, 2026: What Works When You Have No Experience</div>
              </Link>
              <Link to="/reports/direct-outreach-job-search-2026" className="related-card">
                <div className="rc-kicker">Direct outreach</div>
                <div className="rc-title">The Direct Outreach Report: How People Get Hired by Writing to the Person, Not the Portal</div>
              </Link>
              <Link to="/reports/job-search-2026" className="related-card">
                <div className="rc-kicker">Job search</div>
                <div className="rc-title">Job Boards Are Dead: How Students Actually Get Hired in 2026</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Skip the queue. Email the person who hires.</h3>
              <p>Studojo finds the hiring manager, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/b2cnew/join?via=report-how-to-get-a-job-2026&how=voice" reloadDocument className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
