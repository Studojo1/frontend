import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Direct Outreach Job Search 2026: Write to the Person, Not the Portal | Studojo" },
    { name: "description", content: "A direct outreach job search means writing to the person who hires you. The channels, what gets a message read, and a 2-week plan built on email." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "direct outreach job search, direct outreach jobs, direct outreach strategy for jobs, reach out directly to companies for a job, outreach job search, job search outreach strategy" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/direct-outreach-job-search-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Direct Outreach Report: How People Get Hired by Writing to the Person, Not the Portal" },
    { property: "og:description", content: "What a direct outreach job search is, the three channels, what gets a message read, and a 2-week plan that puts email from your own address first." },
    { property: "og:url", content: `${BASE_URL}/reports/direct-outreach-job-search-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-28T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Direct Outreach Report 2026 | Studojo" },
    { name: "twitter:description", content: "Write to the person who hires, not the portal. The channels, what gets read, and a 2-week direct outreach plan." },
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

  // Chart 1: the outreach channels compared (Studojo editorial rating)
  const chanEl = document.getElementById("dorChannelChart") as HTMLCanvasElement | null;
  if (chanEl && !chanEl.dataset.rendered) {
    chanEl.dataset.rendered = "1";
    new Chart(chanEl, {
      type: "bar",
      data: {
        labels: [
          "Email from your own address",
          "Referral ask",
          "LinkedIn InMail",
          "LinkedIn connection note",
          "Portal application",
        ],
        datasets: [
          {
            label: "Room to make your case (1-5)",
            data: [5, 3, 4, 1, 2],
            backgroundColor: VIOLET,
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            label: "Reaches the person who decides (1-5)",
            data: [5, 4, 3, 3, 1],
            backgroundColor: GREEN,
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

  // Chart 2: what decides whether a message gets read (Studojo editorial rating)
  const readEl = document.getElementById("dorReadChart") as HTMLCanvasElement | null;
  if (readEl && !readEl.dataset.rendered) {
    readEl.dataset.rendered = "1";
    new Chart(readEl, {
      type: "bar",
      data: {
        labels: [
          "Sent to the person who decides",
          "A reason tied to their work",
          "Short enough for one screen",
          "Verified address, so it arrives",
          "From your own name and address",
          "Generic HR inbox, template text",
        ],
        datasets: [{
          label: "Effect on getting read (1-5)",
          data: [5, 5, 4, 4, 4, 1],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET2, VIOLET3, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Effect: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 3: the 2-week plan, new emails and follow-ups per working day (illustrative)
  const planEl = document.getElementById("dorPlanChart") as HTMLCanvasElement | null;
  if (planEl && !planEl.dataset.rendered) {
    planEl.dataset.rendered = "1";
    new Chart(planEl, {
      type: "bar",
      data: {
        labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],
        datasets: [
          {
            label: "New personal emails",
            data: [0, 0, 5, 5, 5, 0, 5, 5, 5, 0],
            backgroundColor: VIOLET,
            borderRadius: 4,
            borderWidth: 0,
          },
          {
            label: "Follow-ups (one per first-week email)",
            data: [0, 0, 0, 0, 0, 0, 0, 5, 5, 5],
            backgroundColor: ORANGE,
            borderRadius: 4,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw} (illustrative)` } },
        },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
          y: { stacked: true, grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 10, ticks: { font: { size: 12 }, color: MUTED } },
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
    q: "What is direct outreach in a job search?",
    a: "Direct outreach means writing to the person who can hire you, usually the hiring manager or team lead, instead of only applying through a portal. You still use listings to learn who is hiring. The difference is that your message reaches a person who decides, not a pile of about 242 applications for an average opening (The Interview Guys, April 2026, citing Business Insider data).",
  },
  {
    q: "Does direct outreach work for getting a job?",
    a: "In Studojo's view it is a far better use of your time than spraying applications, where the typical success rate is cited at roughly 0.1% to 2% per application (The Interview Guys, April 2026). A short, personal email reaches a person instead of a queue. It does not guarantee a reply or an interview, but it gives each message a real chance of being read.",
  },
  {
    q: "How do I reach out directly to companies for a job?",
    a: "Pick the role, find the hiring manager or team lead for it, verify their email address, and send a short email from your own address with one reason tied to their work and one proof point. Follow up once if you hear nothing. Studojo does the finding, verifying, writing and sending from your own Gmail for you.",
  },
  {
    q: "What is a good direct outreach strategy for jobs?",
    a: "Work in two-week cycles: about 15 carefully chosen roles a week, 5 personal emails a day, one follow-up per email about a week later, and a review at the end of week two. Small and specific beats big and generic. Every message should be written for one person.",
  },
  {
    q: "Is email or LinkedIn better for job search outreach?",
    a: "Email, in our view. A LinkedIn connection note is capped at 200 characters and a free account can personalise only three invitations a month (LinkedIn Help Center, 2026), while an email has room for your full case. Use LinkedIn to find and check the person, then email them.",
  },
  {
    q: "Can I automate my outreach job search?",
    a: "Blasting generic messages defeats the point, and on LinkedIn it breaks the rules: LinkedIn's terms ban bots and automation tools (User Agreement, section 8.2). What you can hand off is the slow work behind each message. Studojo finds the person who can hire you, verifies their email, writes a personal email for that one person and sends it from your own Gmail.",
  },
];

export default function DirectOutreachReport() {
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
        "headline": "The Direct Outreach Report: How People Get Hired by Writing to the Person, Not the Portal",
        "description": "What a direct outreach job search is, the three channels, what makes a message get read, and a 2-week plan built on email from your own address.",
        "url": `${BASE_URL}/reports/direct-outreach-job-search-2026`,
        "datePublished": "2026-10-28T00:00:00Z",
        "dateModified": "2026-10-28T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/direct-outreach-job-search-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Direct Outreach Report 2026", "item": `${BASE_URL}/reports/direct-outreach-job-search-2026` },
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
              <span>Direct Outreach Report 2026</span>
            </nav>
            <h1>The Direct Outreach Report: <em>How People Get Hired by Writing to the Person, Not the Portal</em></h1>
            <p className="rpt-hero-sub">
              A direct outreach job search skips the portal queue and goes to the person who
              can say yes. This report defines it, compares the channels, shows what gets a
              message read, and gives you a 2-week plan built on email from your own address.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · India first</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Channels, messages, a 2-week plan</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>Direct outreach means <strong>writing to the person who hires</strong>, the hiring manager or team lead, instead of waiting in a portal queue.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>A portal application joins a pile of <strong>about 242 for an average opening</strong> (The Interview Guys, April 2026, citing Business Insider data).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>There are three channels: <strong>email, LinkedIn and referral asks</strong>. Email is the one with room for a full message that needs no connection request and no paid credit.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>A message gets read when it is <strong>sent to the right person, specific to their work, and short</strong>. A generic HR inbox is where good messages go to wait.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>A <strong>2-week plan</strong> of about 30 personal emails and one follow-up each is enough to learn what works. Studojo finds the person, verifies the email, writes it and sends it from your own Gmail.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">~242</div>
              <div className="sc-label">applications for an average job opening, the pile a portal puts you in</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider data (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">0.1% to 2%</div>
              <div className="sc-label">typical success rate cited for a single online application</div>
              <div className="sc-source">The Interview Guys, April 2026 (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">28,000+</div>
              <div className="sc-label">personal emails sent from students' own Gmail, with 8,500+ students signed up and 4,000+ matched with hiring managers</div>
              <div className="sc-source">Studojo's own records, September 2026</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">What Direct Outreach Means in a Job Search</div>
                <div className="sec-sub">Writing to the person, not the portal</div>
              </div>
            </div>
            <p>A direct outreach job search is simple to describe. Instead of uploading your resume to a portal and waiting, you write to the person who can actually hire you. That is usually the hiring manager or the team lead for the role, not a generic HR inbox.</p>
            <p>Portals still have a job. Naukri, Internshala, LinkedIn and Indeed are where most listings live, and they are a good way to see who is hiring. The trouble starts after you click apply. An average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data), and the typical success rate of an online application is cited at roughly 0.1% to 2% (same source).</p>
            <p>Direct outreach jobs are not a secret list of roles. They are the same roles, reached through a different door. You use the listing to learn the role exists, then you write to the person behind it.</p>
            <div className="highlight">
              <strong>Studojo's position:</strong> spray-and-pray applications and auto-apply bots do not work. A short, personal email to the person who hires, sent from your own address, is the better bet. It is not a guarantee, and no method is.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">The Outreach Job Search Channels: Email, LinkedIn and Referral Asks</div>
                <div className="sec-sub">Three doors, and how much each one lets you say</div>
              </div>
            </div>
            <p>Every direct message travels through one of three doors. They are not equal. What matters is how much room you get to make your case, and whether the message reaches the person who decides.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Room to say it</th>
                  <th>What it needs</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Email from your own address</strong></td>
                  <td>A full message (keep it to five lines)</td>
                  <td>The person's verified address</td>
                  <td><span className="tag-pill pill-green">Strongest</span> Lands where hiring work happens</td>
                </tr>
                <tr>
                  <td><strong>Referral ask</strong></td>
                  <td>Depends on your contact</td>
                  <td>Someone you already know at the company</td>
                  <td><span className="tag-pill pill-blue">Strong</span> Only if you have the contact</td>
                </tr>
                <tr>
                  <td><strong>LinkedIn InMail</strong></td>
                  <td>A full message</td>
                  <td>Paid plan credits (Premium Career includes 5 a month, LinkedIn Help Center, 2026)</td>
                  <td><span className="tag-pill pill-amber">Limited</span> Scarce and paid</td>
                </tr>
                <tr>
                  <td><strong>LinkedIn connection note</strong></td>
                  <td>Up to 200 characters (LinkedIn Help Center, 2026)</td>
                  <td>A connection request; free accounts can personalise 3 a month</td>
                  <td><span className="tag-pill pill-amber">Support</span> Good for finding and warming up</td>
                </tr>
                <tr>
                  <td><strong>Portal application</strong></td>
                  <td>A form and a file</td>
                  <td>A click</td>
                  <td><span className="tag-pill pill-red">Weak alone</span> One of about 242</td>
                </tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">Outreach channels compared (Studojo editorial rating, not measured data)</div>
              <div style={{ height: 300 }}>
                <canvas id="dorChannelChart" />
              </div>
            </div>
            <p>One warning on LinkedIn: its terms ban bots and automation tools (LinkedIn User Agreement, section 8.2). Any tool that sends requests and messages from your account on autopilot breaks those terms on the account you job hunt with. We compare the two main channels in detail in <Link to="/reports/linkedin-message-vs-email-hiring-manager-2026">LinkedIn Message vs Email to a Hiring Manager</Link>.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">What Makes an Outreach Message Get Read</div>
                <div className="sec-sub">Before anyone replies, someone has to open it and keep reading</div>
              </div>
            </div>
            <p>Reply tactics are their own topic, covered in <Link to="/reports/cold-outreach-what-gets-reply-2026">Cold Outreach: What Actually Gets a Reply</Link>. This section is about the step before that: getting read at all.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>The right person.</strong> The hiring manager or team lead for the role, by name. A message to a generic HR inbox waits in a queue, just like an application.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>An address that works.</strong> A guessed address that bounces is a message nobody sees. Verify it before you send.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>A reason that is only about them.</strong> One line on their team, product or recent work. If the line could go to any company, it reads like it went to every company.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Short.</strong> Recruiters spend about 6 to 7 seconds on a first resume scan (Ladders eye-tracking study, 2018). Assume a cold message gets no longer. Five lines that fit on one phone screen.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Your own name and address.</strong> A message from a real person's inbox reads like a real person wrote it, because one did.</span></div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">What decides whether a direct message gets read (Studojo editorial rating, not measured data)</div>
              <div style={{ height: 300 }}>
                <canvas id="dorReadChart" />
              </div>
            </div>
            <div className="callout">
              <strong>The first-line test:</strong> read your opening line out loud and ask whether it could be sent to anyone else. If the answer is yes, rewrite it until it could only go to this one person.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">A 2-Week Direct Outreach Strategy for Jobs</div>
                <div className="sec-sub">About 30 personal emails, one follow-up each, one review</div>
              </div>
            </div>
            <p>Here is a job search outreach strategy you can run in ten working days. It is a pace, not a quota. The rule that matters is that every message is written for one person.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>What you do</th>
                  <th>Output</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Day 1</strong></td>
                  <td>Pick 15 roles at 15 companies you actually want. Portals are fine for spotting who is hiring.</td>
                  <td>15 target roles</td>
                </tr>
                <tr>
                  <td><strong>Day 2</strong></td>
                  <td>Find the hiring manager or team lead for each role, and verify each email address.</td>
                  <td>15 names and addresses</td>
                </tr>
                <tr>
                  <td><strong>Days 3 to 5</strong></td>
                  <td>Write and send 5 personal emails a day from your own address.</td>
                  <td>15 emails</td>
                </tr>
                <tr>
                  <td><strong>Day 6</strong></td>
                  <td>Build the second list of 15 the same way.</td>
                  <td>15 more names and addresses</td>
                </tr>
                <tr>
                  <td><strong>Days 7 to 9</strong></td>
                  <td>Send the second batch, 5 a day.</td>
                  <td>15 more emails</td>
                </tr>
                <tr>
                  <td><strong>Days 8 to 10</strong></td>
                  <td>Follow up once on each first-week email, about a week after you sent it.</td>
                  <td>15 follow-ups</td>
                </tr>
                <tr>
                  <td><strong>Day 10</strong></td>
                  <td>Review which roles, companies and first lines got read or answered, and sharpen the next list.</td>
                  <td>A better list for week 3</td>
                </tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">The 2-week plan: new emails and follow-ups per working day (illustrative plan, not measured data)</div>
              <div style={{ height: 260 }}>
                <canvas id="dorPlanChart" />
              </div>
            </div>
            <p>Thirty emails sounds small next to the hundreds of applications people fire off. That is the point. Each one goes to a person who can say yes, and each one says something true about their work.</p>
            <p>Replies are not guaranteed, and some people will never answer. One polite follow-up is enough; more than that turns into noise. For timing, see <Link to="/reports/follow-up-job-application-timing-2026">Following Up on a Job Application</Link>.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Why Email From Your Own Address Is the Strongest Channel</div>
                <div className="sec-sub">And how Studojo runs direct outreach for you</div>
              </div>
            </div>
            <p>Email gives you room to make your case, needs no connection request or paid credit, and lands where hiring work happens: interview invites, offer letters and calendar invites all arrive there. Sent from your own address, it reads as what it is, one person writing to another.</p>
            <p>The hard part is the work behind each email: finding the right person, getting an address that is real, and writing something specific for every one of them. Done by hand, that is the slow part of the whole plan above.</p>
            <p>We built Studojo to do exactly this. Studojo finds the person who can actually hire you (the hiring manager or team lead, not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail.</p>
            <div className="pull-quote">
              <p>"Write to the person who decides, from your own address, about their work. Everything else is detail."</p>
              <span className="pq-source">The Studojo rule for direct outreach</span>
            </div>
            <p>So far: 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026). Replies are not guaranteed. What you get is a specific email in front of the right person.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">Direct outreach questions, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to run your outreach job search</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Fewer messages, each one aimed at a person. That is the whole strategy:</p>
            <div className="blist">
              {[
                ["Use portals to find, not to wait", "Listings tell you who is hiring. The person behind the listing is who you write to."],
                ["Pick the person, not the inbox", "The hiring manager or team lead, by name, with a verified address."],
                ["Write for one reader", "One reason tied to their work, one proof point, one small ask, five lines."],
                ["Run it in two-week cycles", "About 30 emails, one follow-up each, then review and sharpen the list."],
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
              <Link to="/reports/linkedin-message-vs-email-hiring-manager-2026" className="related-card">
                <div className="rc-kicker">LinkedIn vs email</div>
                <div className="rc-title">LinkedIn Message vs Email to a Hiring Manager: Which One Actually Gets Read</div>
              </Link>
              <Link to="/reports/email-hiring-manager-vs-applying-2026" className="related-card">
                <div className="rc-kicker">Direct vs portal</div>
                <div className="rc-title">Emailing the Hiring Manager vs Applying Online</div>
              </Link>
              <Link to="/reports/cold-outreach-what-gets-reply-2026" className="related-card">
                <div className="rc-kicker">Reply tactics</div>
                <div className="rc-title">Cold Outreach: What Actually Gets a Reply</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Let Studojo run your direct outreach.</h3>
              <p>Studojo finds the person who can hire you, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/b2cnew/join?via=report-direct-outreach-job-search-2026&how=voice" reloadDocument className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
