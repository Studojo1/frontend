import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How Long to Wait to Follow Up on a Job Application (2026) | Studojo" },
    { name: "description", content: "How long to wait to follow up on a job application: about 5 to 7 working days, once, twice at most, in the same email thread. Timing guide plus two templates." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "how long to wait to follow up on a job application, follow up on job application, when to follow up after applying, follow up email timing, how many times to follow up, follow up after no response job, is it okay to follow up on a job application" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/follow-up-job-application-timing-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Following Up on a Job Application: When, How Often, and What to Say" },
    { property: "og:description", content: "Wait about 5 to 7 working days, follow up once (twice at most), reply in the same thread and add one new thing. Studojo's timing rule, plus two templates." },
    { property: "og:url", content: `${BASE_URL}/reports/follow-up-job-application-timing-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-27T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Following Up on a Job Application (2026) | Studojo" },
    { name: "twitter:description", content: "When to follow up after applying, how many times, where, and two short templates you can send today." },
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

  // Chart 1: when to send the first follow-up, by working day (editorial guidance)
  const timeEl = document.getElementById("futTimelineChart") as HTMLCanvasElement | null;
  if (timeEl && !timeEl.dataset.rendered) {
    timeEl.dataset.rendered = "1";
    new Chart(timeEl, {
      type: "line",
      data: {
        labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10", "Day 12", "Day 15"],
        datasets: [{
          label: "Good time to follow up (1-5)",
          data: [1, 1, 2, 3, 5, 5, 5, 4, 4, 3, 2, 2],
          borderColor: VIOLET,
          backgroundColor: "rgba(139, 92, 246, 0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 5,
          pointBackgroundColor: [RED, RED, ORANGE, ORANGE, GREEN, GREEN, GREEN, VIOLET2, VIOLET2, VIOLET3, VIOLET3, VIOLET3],
          pointBorderColor: INK,
          pointBorderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}/5 (editorial guidance)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 12 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 2: how many follow-ups (editorial rating)
  const countEl = document.getElementById("futCountChart") as HTMLCanvasElement | null;
  if (countEl && !countEl.dataset.rendered) {
    countEl.dataset.rendered = "1";
    new Chart(countEl, {
      type: "bar",
      data: {
        labels: ["None", "One", "Two", "Three", "Four or more"],
        datasets: [{
          label: "How well it serves you (1-5)",
          data: [2, 5, 3, 1, 1],
          backgroundColor: [ORANGE, GREEN, VIOLET2, RED, RED],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 12 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: where to follow up (editorial rating)
  const whereEl = document.getElementById("futWhereChart") as HTMLCanvasElement | null;
  if (whereEl && !whereEl.dataset.rendered) {
    whereEl.dataset.rendered = "1";
    new Chart(whereEl, {
      type: "bar",
      data: {
        labels: [
          "Reply in the same thread to the hiring manager",
          "LinkedIn message to the hiring manager",
          "New email to the hiring manager",
          "Email to the recruiter on the role",
          "Generic HR inbox",
          "Checking the portal status page",
        ],
        datasets: [{
          label: "Chance a person reads it (1-5)",
          data: [5, 3, 3, 3, 1, 1],
          backgroundColor: [VIOLET, VIOLET2, VIOLET2, VIOLET3, RED, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}/5 (editorial rating)` } },
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
    q: "How long should you wait to follow up on a job application?",
    a: "About 5 to 7 working days after you apply or send your first email. That is Studojo's editorial rule, not a measured number: long enough for the person to have seen it, soon enough that they still remember you. If the job post gives its own timeline, wait until that has passed.",
  },
  {
    q: "Is it okay to follow up on a job application?",
    a: "Yes. One short, polite follow-up is normal, and it is Studojo's position that following up once helps. What is not okay is a daily nudge, or the same message through every channel at once.",
  },
  {
    q: "How many times should you follow up?",
    a: "Once, twice at most. The first follow-up goes 5 to 7 working days after your first email, and a second only if you have something genuinely new to add. After that, stop and put the energy into the next hiring manager.",
  },
  {
    q: "What should a follow-up email say?",
    a: "One line reminding them who you are and which role, one new thing (a project, a result or an idea for their team), and a small, specific ask. Keep it shorter than your first email. Never send \"just checking in\" with nothing new.",
  },
  {
    q: "What if I get no response after following up?",
    a: "Stop after the second follow-up and move on to the next person. Silence is not always a no: inboxes fill up, hiring plans change, and replies are not guaranteed. Keep the thread, because if a role opens on that team later, you can reply to it with something new.",
  },
  {
    q: "Should I follow up through the job portal or email the hiring manager?",
    a: "Email the hiring manager. A portal has no person on the other side to read a follow-up, while a reply in an existing email thread lands in front of the person who decides. Studojo sends your first email from your own Gmail, so your follow-up can go in that same thread.",
  },
];

export default function FollowUpTimingReport() {
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
        "headline": "Following Up on a Job Application: When, How Often, and What to Say",
        "description": "Studojo's rule for following up on a job application: wait about 5 to 7 working days, follow up once (twice at most), reply in the same thread and add one new thing.",
        "url": `${BASE_URL}/reports/follow-up-job-application-timing-2026`,
        "datePublished": "2026-10-27T00:00:00Z",
        "dateModified": "2026-10-27T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/follow-up-job-application-timing-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Following Up on a Job Application", "item": `${BASE_URL}/reports/follow-up-job-application-timing-2026` },
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
              <span>Following Up on a Job Application</span>
            </nav>
            <h1>Following Up on a Job Application: <em>When, How Often, and What to Say</em></h1>
            <p className="rpt-hero-sub">
              You sent it. Now there is silence. Here is Studojo's rule for what comes
              next: wait about 5 to 7 working days, follow up once (twice at most),
              reply in the same thread, and add one new thing every time.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · India first</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Follow-up timing, count, wording</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>Wait <strong>about 5 to 7 working days</strong> before your first follow-up. That is Studojo's editorial rule, not a law of nature.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Follow up <strong>once, twice at most</strong>. After the second, stop and move to the next hiring manager.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Reply in the same thread</strong>, so your first email sits right under the follow-up and nobody has to search for it.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Add one new thing</strong> every time: a project, a result, an idea for their team. Never "just checking in".</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Follow up with <strong>the hiring manager, not a portal</strong>. Studojo sends the first email from your own Gmail, so the follow-up lands in the same thread.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">~242</div>
              <div className="sc-label">applications an average job opening draws, which is why a portal follow-up gets lost</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider data (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">6 to 7 sec</div>
              <div className="sc-label">is how long recruiters spend on a first resume scan, so your follow-up must be readable in less</div>
              <div className="sc-source">Ladders eye-tracking study, 2018 (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">28,000+</div>
              <div className="sc-label">personal emails sent from students' own Gmail through Studojo</div>
              <div className="sc-source">Studojo's own records, September 2026</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">When to Follow Up: About 5 to 7 Working Days</div>
                <div className="sec-sub">Studojo's editorial rule, and the reasoning behind it</div>
              </div>
            </div>
            <p>Hiring managers have a day job. Your email competes with their team's actual work, and a role does not move every day. Follow up on day 2 and you look impatient. Wait three weeks and they have forgotten you, or filled the role.</p>
            <p>So our rule is simple: about 5 to 7 working days after your first email. Count their working days, not yours. Skip weekends and public holidays where they are, such as Diwali week if the team is in India. If the job post says when they will get back to people, wait until that date has passed.</p>
            <div className="chart-wrap">
              <div className="chart-label">How good a time it is to send your first follow-up, by working day after your email (Studojo editorial guidance, not measured data)</div>
              <div style={{ height: 260 }}>
                <canvas id="futTimelineChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>What to do</th>
                  <th>Why (editorial guidance)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Day 0</strong></td>
                  <td><span className="tag-pill pill-blue">Send</span> If the post asks for a portal application, do it. Then email the hiring manager directly.</td>
                  <td>The portal is the formal record. The email reaches a person.</td>
                </tr>
                <tr>
                  <td><strong>Working days 1 to 4</strong></td>
                  <td><span className="tag-pill pill-amber">Wait</span> Nothing. No nudge, no LinkedIn message.</td>
                  <td>They need time to see it and act on it.</td>
                </tr>
                <tr>
                  <td><strong>Working days 5 to 7</strong></td>
                  <td><span className="tag-pill pill-green">Follow up</span> Reply in the same thread with one new thing.</td>
                  <td>Long enough to be fair, soon enough to be remembered.</td>
                </tr>
                <tr>
                  <td><strong>About a week later</strong></td>
                  <td><span className="tag-pill pill-green">Optional</span> A second and final follow-up, only if you have something genuinely new.</td>
                  <td>The last message, so make it count.</td>
                </tr>
                <tr>
                  <td><strong>After that</strong></td>
                  <td><span className="tag-pill pill-red">Stop</span> Move on to the next hiring manager.</td>
                  <td>A third nudge reads as pressure, not interest.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">How Many Times to Follow Up: Once, Twice at Most</div>
                <div className="sec-sub">The second follow-up is a bonus, not a requirement</div>
              </div>
            </div>
            <p>Not following up at all leaves the door half open. It is Studojo's position that following up once helps: it puts your name back at the top of the inbox with something new attached.</p>
            <p>A second follow-up is fine when you have a genuine reason, such as a new project, a result or a sharp idea for their team. A third is where helpful turns into pushy. Stop there.</p>
            <div className="chart-wrap">
              <div className="chart-label">Number of follow-ups, by how well it serves you (Studojo editorial rating)</div>
              <div style={{ height: 260 }}>
                <canvas id="futCountChart" />
              </div>
            </div>
            <div className="pull-quote">
              <p>"Every follow-up must carry one thing the first email did not. If you have nothing new, you have nothing to send."</p>
              <span className="pq-source">The Studojo follow-up rule</span>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Where to Follow Up: The Hiring Manager, Not the Portal</div>
                <div className="sec-sub">A follow-up only works if a person reads it</div>
              </div>
            </div>
            <p>You cannot follow up with a portal. There is no person on the other side of "Application submitted". An average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data), and checking the status page every morning changes nothing about where yours sits.</p>
            <p>A follow-up works when it lands in a real inbox, in front of the person who decides. That is the hiring manager or team lead. Best of all is a reply in the thread of your first email, so they see your original note right under the new one.</p>
            <div className="chart-wrap">
              <div className="chart-label">Where a follow-up gets read (Studojo editorial rating)</div>
              <div style={{ height: 300 }}>
                <canvas id="futWhereChart" />
              </div>
            </div>
            <div className="callout">
              <strong>This is why the first email matters.</strong> Studojo finds the person who can actually hire you, verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail. Because it goes from your Gmail, the thread is yours, and your follow-up lands right under it. So far: 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026).
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">What to Say: Two Short Templates</div>
                <div className="sec-sub">Fill the brackets, cut anything that does not earn its place</div>
              </div>
            </div>
            <p>Recruiters spend about 6 to 7 seconds on a first resume scan (Ladders eye-tracking study, 2018). Assume your follow-up gets the same glance. Four or five lines, one new thing, one small ask.</p>
            <div className="callout">
              <strong>Template 1: the first follow-up (working days 5 to 7, same thread)</strong><br /><br />
              Hi [Name],<br /><br />
              Following up on my note from last week about the [role] role on your team.<br /><br />
              Since then I [one new thing: finished a project, shipped a feature, tried an idea on your product]. [One line on why it matters to their team.]<br /><br />
              Would a 15-minute call in the next week or two work for you?<br /><br />
              [Your name]
            </div>
            <div className="callout">
              <strong>Template 2: the final follow-up (about a week later, same thread)</strong><br /><br />
              Hi [Name],<br /><br />
              One last note on the [role] role, and then I will stay out of your inbox.<br /><br />
              [One new thing: a link, a result or a short idea for their team.]<br /><br />
              If the timing is wrong, no problem at all. I would be glad to hear from you if something opens up on [team] later.<br /><br />
              [Your name]
            </div>
            <div className="highlight">
              Keep the subject line as it is. <strong>Hit reply, do not start a new email</strong>, so the subject reads "Re: [your original subject]" and the first note is right there underneath.
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">No Response? When to Stop, and Mistakes That Undo You</div>
                <div className="sec-sub">Following up after no response, without burning the bridge</div>
              </div>
            </div>
            <p>Silence is not always a no. Inboxes fill up, budgets freeze, plans change. Replies are not guaranteed, however good your email is. What you control is the next move: stop after the second follow-up, keep the thread, and spend your time on the next hiring manager.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>"Just checking in."</strong> It asks them to do work for you and gives nothing back. Add one new thing or do not send it.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>A brand new thread.</strong> A fresh subject line means they have to search for your first email. Most will not.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Following up too early.</strong> Day 1 or day 2 reads as impatience, not enthusiasm.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Every channel at once.</strong> Email, LinkedIn and a phone call on the same day feels like pressure. Pick the email thread.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>"Did you get my application?"</strong> The hiring manager cannot check a portal queue for you. Talk about the work instead.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>A guilt trip in the last email.</strong> Close warmly. Teams reopen roles, and a polite last note keeps the door open.</span></div>
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">Follow-up timing questions, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>The rule on one screen</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Following up is not chasing. Done right, it is one more useful email to the right person:</p>
            <div className="blist">
              {[
                ["Wait 5 to 7 working days", "Their working days, not yours. Respect any timeline the post gives."],
                ["Once, twice at most", "Then stop and move to the next hiring manager."],
                ["Same thread, one new thing", "Hit reply, add something the first email did not have."],
                ["A person, not a portal", "Start with an email to the hiring manager from your own Gmail, so the follow-up has a thread to land in."],
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
              <Link to="/reports/best-time-to-email-hr-or-hiring-manager-2026" className="related-card">
                <div className="rc-kicker">Timing</div>
                <div className="rc-title">The Best Time to Email HR or a Hiring Manager</div>
              </Link>
              <Link to="/reports/rejection-report-what-happens-after-you-apply-2026" className="related-card">
                <div className="rc-kicker">After you apply</div>
                <div className="rc-title">The Rejection Report: What Happens After You Apply</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Start a thread worth following up on.</h3>
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
