import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Why Am I Not Getting a Job? The Six Real Reasons, and the Fix for Each (2026) | Studojo" },
    { name: "description", content: "Why am I not getting a job? Six real reasons, from 242 applicants per opening to 6 to 7 second resume scans, and the fix for each: email the hiring manager." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "why am I not getting a job, why am I not getting hired, not getting job what to do, not getting job calls, why am I not getting a job offer, not getting a job after graduation" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/why-am-i-not-getting-a-job-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Why Am I Not Getting a Job? The Six Real Reasons, and the Fix for Each" },
    { property: "og:description", content: "Six real reasons you are not getting a job, from the size of the pile to writing to the wrong person, and the one fix they share: email the hiring manager." },
    { property: "og:url", content: `${BASE_URL}/reports/why-am-i-not-getting-a-job-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-28T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Why Am I Not Getting a Job? Six Reasons, Six Fixes | Studojo" },
    { name: "twitter:description", content: "Applying every day and hearing nothing? Six real reasons, a fix for each, and the one fix they share." },
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
  const PALE = "#e5e5e5";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: one opening, about 242 applications, one hire (illustrative arithmetic)
  const pileEl = document.getElementById("wngPileChart") as HTMLCanvasElement | null;
  if (pileEl && !pileEl.dataset.rendered) {
    pileEl.dataset.rendered = "1";
    new Chart(pileEl, {
      type: "doughnut",
      data: {
        labels: ["The one person who gets this job", "Everyone else in the same pile"],
        datasets: [{
          data: [1, 241],
          backgroundColor: [VIOLET, PALE],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} of about 242 applicants (illustrative)` } },
        },
      },
    });
  }

  // Chart 2: where your application goes, and whether a decision-maker reads it (editorial rating)
  const readEl = document.getElementById("wngReadChart") as HTMLCanvasElement | null;
  if (readEl && !readEl.dataset.rendered) {
    readEl.dataset.rendered = "1";
    new Chart(readEl, {
      type: "bar",
      data: {
        labels: [
          "One-click portal application",
          "Shared careers@ inbox",
          "Generic HR address from a list",
          "Connection note to a stranger",
          "The recruiter for the role",
          "The hiring manager or team lead",
        ],
        datasets: [{
          label: "Chance the person who decides reads it (1-5)",
          data: [1, 1, 1, 2, 3, 5],
          backgroundColor: [RED, RED, RED, ORANGE, VIOLET2, VIOLET],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Read by the decider: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 3: effort versus impact of each fix (editorial rating)
  const fixEl = document.getElementById("wngFixChart") as HTMLCanvasElement | null;
  if (fixEl && !fixEl.dataset.rendered) {
    fixEl.dataset.rendered = "1";
    new Chart(fixEl, {
      type: "bar",
      data: {
        labels: ["Fewer, aimed roles", "Skip stale posts", "Proof in the top third", "A person, not a portal", "Follow up once", "Email the hiring manager"],
        datasets: [
          {
            label: "Effort (1-5)",
            data: [2, 1, 2, 3, 1, 3],
            backgroundColor: VIOLET3,
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            label: "Impact (1-5)",
            data: [3, 2, 3, 4, 3, 5],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}/5 (editorial rating)` } },
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
    q: "Why am I not getting hired even though I apply every day?",
    a: "Because applying every day mostly adds you to bigger piles. An average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider), and a typical online application is cited at roughly 0.1% to 2% success. Send fewer, better-aimed applications, and email the hiring manager for each one.",
  },
  {
    q: "Why am I not getting job calls?",
    a: "No calls at all usually means your application never reaches a person, or it does not survive the first glance. Recruiters spend about 6 to 7 seconds on a first resume scan (Ladders eye-tracking study, 2018), so your strongest proof has to sit in the top third of the page. Then put your name in front of the hiring manager with a short email instead of waiting in the portal.",
  },
  {
    q: "I am not getting a job. What should I do first?",
    a: "Stop adding applications for a few days and find where you drop out. No calls points to reach or your resume, interviews with no second round points to interview prep, and final rounds with no offer points to the close. Fix the one stage that is broken before you send anything else.",
  },
  {
    q: "Why am I not getting a job offer after interviews?",
    a: "If you reach interviews, your reach and resume are working, so the gap is in the room or in the role itself. Ask once, politely, for feedback, and practise answers built on real examples from your projects. Some posts are not real openings either: in a 2024 ResumeBuilder survey of 649 US hiring managers (a vendor survey), 40% said their company had posted a fake job listing that year.",
  },
  {
    q: "Why am I not getting a job after graduation?",
    a: "Because a fresher's application looks like hundreds of others in the same portal, and there is no work history to break the tie. Put proof first: a project, an internship result or a number, right at the top. Then write directly to the person who runs the team you want to join, from your own email.",
  },
  {
    q: "Should I email the hiring manager instead of applying online?",
    a: "Do both: apply if the company asks for it, then email the hiring manager or team lead. In our view the email is the part that changes your odds, because it lands in one person's inbox instead of a pile. Replies are not guaranteed, so follow up once and then move on.",
  },
];

export default function WhyAmINotGettingAJobReport() {
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
        "headline": "Why Am I Not Getting a Job? The Six Real Reasons, and the Fix for Each",
        "description": "A diagnosis report: six real reasons you are not getting a job, the fix for each, and the one fix they share, emailing the hiring manager.",
        "url": `${BASE_URL}/reports/why-am-i-not-getting-a-job-2026`,
        "datePublished": "2026-10-28T00:00:00Z",
        "dateModified": "2026-10-28T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/why-am-i-not-getting-a-job-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Why Am I Not Getting a Job", "item": `${BASE_URL}/reports/why-am-i-not-getting-a-job-2026` },
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
              <span>Why Am I Not Getting a Job</span>
            </nav>
            <h1>Why Am I Not Getting a Job? <em>The Six Real Reasons, and the Fix for Each</em></h1>
            <p className="rpt-hero-sub">
              Asking "why am I not getting a job?" after weeks of applications and silence?
              It is rarely about your worth. It is usually six fixable problems, and one fix
              that covers all six: write to the person who actually hires.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · India first</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Six reasons, six fixes</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>An average opening draws <strong>about 242 applications</strong> (The Interview Guys, April 2026, citing Business Insider). One person gets the job. The pile, not you, is the first problem.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Recruiters <strong>screen for bot applications</strong> with hidden instructions in job posts (NBC News, 2024), and some posts are <strong>not real openings</strong> at all.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>A first resume scan lasts <strong>about 6 to 7 seconds</strong> (Ladders, 2018). If your best proof is below the top third, it was not seen.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Most applications go <strong>where no decision-maker reads</strong>, to the wrong person, and with no follow-up.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The fix they share: <strong>email the hiring manager or team lead</strong>, short, personal and specific, from your own address. Studojo does exactly that.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">242</div>
              <div className="sc-label">applications for an average job opening, and only one person gets it</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">6 to 7s</div>
              <div className="sc-label">is how long a recruiter spends on a first resume scan</div>
              <div className="sc-source">Ladders eye-tracking study, 2018</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">0.1 to 2%</div>
              <div className="sc-label">typical success rate cited for a single online application</div>
              <div className="sc-source">The Interview Guys, April 2026 (reported)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Reason 1: You Are One of About 242</div>
                <div className="sec-sub">Why am I not getting hired? Start with the size of the pile</div>
              </div>
            </div>
            <p>If you are asking why am I not getting a job, start with arithmetic, not self-doubt. An average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data). One person gets that job. Even a strong candidate loses most of these draws simply because of the count.</p>
            <p>The same article cites a typical success rate of roughly 0.1% to 2% for an online application. Sending more applications buys more tickets in the same lottery. It does not change the odds of any single ticket.</p>
            <div className="chart-wrap">
              <div className="chart-label">One opening, about 242 applicants, one hire (illustrative, using the reported 242)</div>
              <div style={{ height: 260 }}>
                <canvas id="wngPileChart" />
              </div>
            </div>
            <div className="highlight">
              <strong>The fix:</strong> apply to fewer roles and aim every one. A role you genuinely fit, a company you can name a reason for, and a person you will write to. We did the full math in <Link to="/reports/how-many-jobs-should-i-apply-to-2026">How Many Jobs Should You Apply To?</Link>
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Reason 2: A Bot Filter, or a Fake Post, Gets There First</div>
                <div className="sec-sub">Bot screening and ghost jobs</div>
              </div>
            </div>
            <p>Recruiters now plant hidden instructions in job posts, for example asking applicants to include a specific odd word, to catch applications written by bots. They also spot patterns such as one person applying to dozens of roles at the same company (NBC News, 17 November 2024, quoting recruiter Mike Peditto). The same NBC piece cites a Capterra figure that 58% of job seekers use AI in their search. If a tool is mass-applying for you, you are the pattern they are looking for.</p>
            <p>Some posts are not real openings at all. In a 2024 ResumeBuilder survey of 649 US hiring managers (a vendor survey), 40% said their company had posted a fake job listing that year. We cover why in <Link to="/reports/ghost-jobs-2026">Why Companies Post Jobs Without Planning to Hire</Link>.</p>
            <div className="callout">
              <strong>One myth to drop:</strong> you may have read that 75% of resumes are rejected by an ATS before a human sees them. That number has no traceable source. Treat it as a myth. The real problems are the size of the pile and the posts that were never going to hire.
            </div>
            <div className="highlight">
              <strong>The fix:</strong> never let a bot apply for you, and answer exactly what each post asks. Skip posts with no team named and no detail, check the company's own careers page, and put your effort into roles you can tie to a real person.
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Reason 3: Your Resume Gets 6 to 7 Seconds</div>
                <div className="sec-sub">Not getting job calls? Check the top third of the page</div>
              </div>
            </div>
            <p>Ladders' 2018 eye-tracking study found recruiters spend about 6 to 7 seconds on a first resume scan. That glance decides whether they read on. If the top of your page is a generic objective and a list of soft skills, the glance ends there and the call never comes.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Name the role.</strong> The first line should say what you want to do, in the job post's own words.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Lead with proof.</strong> Your strongest project or internship result, with a number if you have one, goes in the top third.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Match the skills they list.</strong> If the post asks for SQL and Excel, those words should be easy to find, not buried in a paragraph.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>One page for freshers.</strong> A second page rarely gets read in a 7-second scan.</span></div>
            </div>
            <div className="highlight">
              <strong>The fix:</strong> rewrite the top third until a stranger can tell, in one glance, what role you want and why you can do it.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Reason 4: You Apply Where Nobody Reads</div>
                <div className="sec-sub">Portals, shared inboxes and HR lists</div>
              </div>
            </div>
            <p>Naukri, LinkedIn and Internshala are where listings live, and they are fine places to find a role. The problem is stopping there. A one-click portal application sits in a queue of hundreds. A shared careers@ inbox is read by whoever has time. A generic HR address from a list sends you to someone who does not hire for the role (more in <Link to="/reports/hr-email-id-lists-why-they-fail-2026">HR Email ID Lists: Why They Fail</Link>).</p>
            <div className="chart-wrap">
              <div className="chart-label">Where you send it versus whether the person who decides reads it (Studojo editorial rating, not measured data)</div>
              <div style={{ height: 300 }}>
                <canvas id="wngReadChart" />
              </div>
            </div>
            <div className="highlight">
              <strong>The fix:</strong> use portals to find roles, then put every application you care about in front of a named person as well.
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Reason 5: You Never Follow Up</div>
                <div className="sec-sub">One polite nudge is part of the process, not pestering</div>
              </div>
            </div>
            <p>Most people send once and wait. Busy managers miss emails, read them on a phone and forget, or mean to reply and never do. Silence after one message is not a no. It is often just a full inbox.</p>
            <p>Our position is simple: follow up once, about a week later, with something new. A link to a project, a line on something the team just shipped, or a one-sentence update. Then stop. Timing details are in <Link to="/reports/follow-up-job-application-timing-2026">Following Up on a Job Application</Link>.</p>
            <div className="highlight">
              <strong>The fix:</strong> one short follow-up that adds something new. Never a "just checking in" with nothing in it, and never a third email.
            </div>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">Reason 6: You Are Writing to the Wrong Person</div>
                <div className="sec-sub">The common fix: email the hiring manager</div>
              </div>
            </div>
            <p>HR runs the process. The hiring manager or team lead decides whether they need you. When everything you send goes to HR or a portal, the one person who can say "let's talk" never sees your name.</p>
            <p>So the fix for all six reasons is the same move. Stop waiting in the pile and write to the person who hires: a short, personal, specific email from your own address, about their team and your proof.</p>
            <div className="pull-quote">
              <p>"The pile is where applications wait. The hiring manager's inbox is where decisions start."</p>
              <span className="pq-source">The Studojo position</span>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>The right person.</strong> The manager or team lead for the role, not a generic HR inbox.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>One specific line about them.</strong> Something their team built, shipped or posted.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>One proof point from you.</strong> A project or result that matches what the team does.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>A small ask.</strong> A short call, or a pointer to the right person.</span></div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">Effort versus impact of each fix (Studojo editorial rating, not measured data)</div>
              <div style={{ height: 280 }}>
                <canvas id="wngFixChart" />
              </div>
            </div>
            <p>We built Studojo to do exactly this. It finds the person who can actually hire you (the hiring manager or team lead, not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail. Replies are not guaranteed, but you are finally in the right inbox.</p>
            <p>8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026).</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">Not getting hired, not getting calls, not getting offers: answered directly</div>
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
                <div className="sec-title" style={{ color: "#3b0764" }}>Not Getting a Job? What to Do This Week</div>
                <div className="sec-sub" style={{ color: "#7c3aed" }}>The six reasons and their fixes, on one page</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reason</th>
                  <th>What you notice</th>
                  <th>The fix</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>1. The pile</strong></td>
                  <td>Lots of applications, almost no replies</td>
                  <td><span className="tag-pill pill-green">Aim</span> Fewer roles, each one chosen</td>
                </tr>
                <tr>
                  <td><strong>2. Bots and fakes</strong></td>
                  <td>Instant rejections, or posts that never move</td>
                  <td><span className="tag-pill pill-red">Stop</span> No bots, skip stale posts</td>
                </tr>
                <tr>
                  <td><strong>3. The 6 to 7 second scan</strong></td>
                  <td>Not getting job calls at all</td>
                  <td><span className="tag-pill pill-amber">Rewrite</span> Proof in the top third</td>
                </tr>
                <tr>
                  <td><strong>4. Nobody reads it</strong></td>
                  <td>Silence from portals and shared inboxes</td>
                  <td><span className="tag-pill pill-blue">Redirect</span> A named person, every time</td>
                </tr>
                <tr>
                  <td><strong>5. No follow-up</strong></td>
                  <td>One message sent, then waiting</td>
                  <td><span className="tag-pill pill-green">Nudge</span> One follow-up with something new</td>
                </tr>
                <tr>
                  <td><strong>6. Wrong person</strong></td>
                  <td>Everything goes to HR</td>
                  <td><span className="tag-pill pill-green">Email</span> The hiring manager or team lead</td>
                </tr>
              </tbody>
            </table>
            <p style={{ color: "#3b0764" }}>Getting interviews but no offers? Then your reach and resume are working and the gap is in the room. Start with <Link to="/reports/interview-report-why-candidates-fail-after-shortlist-2026">The Interview Report</Link>.</p>
          </div>

          {/* Related reports */}
          <div className="related">
            <h2>Related reports</h2>
            <div className="related-grid">
              <Link to="/reports/how-many-jobs-should-i-apply-to-2026" className="related-card">
                <div className="rc-kicker">The math</div>
                <div className="rc-title">How Many Jobs Should You Apply To? The Math Says Fewer, Aimed Better</div>
              </Link>
              <Link to="/reports/application-response-rate-2026" className="related-card">
                <div className="rc-kicker">Response rates</div>
                <div className="rc-title">Why So Many Applications Get No Response</div>
              </Link>
              <Link to="/reports/how-to-get-a-job-2026" className="related-card">
                <div className="rc-kicker">Getting hired</div>
                <div className="rc-title">How to Get a Job in 2026: Every Route Compared, and the One That Skips the Queue</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Stop waiting in the pile.</h3>
              <p>Studojo finds the hiring manager or team lead, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/b2cnew/join?via=report-why-am-i-not-getting-a-job-2026&how=voice" reloadDocument className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
