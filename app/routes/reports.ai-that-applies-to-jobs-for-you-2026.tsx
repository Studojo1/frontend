import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "AI That Applies to Jobs for You: LazyApply, Jobright, AIApply and JobCopilot Compared | Studojo" },
    { name: "description", content: "AI that applies to jobs for you, compared: what LazyApply, Jobright, AIApply and JobCopilot claim, what they cost, what reviewers say, and their shared ceiling." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "AI that applies to jobs for you, AI apply to jobs for me, AI auto apply tools, LazyApply review, Jobright review, AIApply review, JobCopilot review, best auto apply tool" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/ai-that-applies-to-jobs-for-you-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "AI That Applies to Jobs for You: LazyApply, Jobright, AIApply and JobCopilot, Compared" },
    { property: "og:description", content: "What four AI auto-apply tools claim on their own sites, what they cost as listed, what reviewers report, and why they all hit the same ceiling." },
    { property: "og:url", content: `${BASE_URL}/reports/ai-that-applies-to-jobs-for-you-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-27T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "AI That Applies to Jobs for You, Compared | Studojo" },
    { name: "twitter:description", content: "LazyApply, Jobright, AIApply and JobCopilot: their claims, their listed prices, what reviewers report, and the ceiling they all share." },
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

  // Chart 1: daily limits by plan, as listed on each site (log scale)
  const capEl = document.getElementById("aajCapChart") as HTMLCanvasElement | null;
  if (capEl && !capEl.dataset.rendered) {
    capEl.dataset.rendered = "1";
    new Chart(capEl, {
      type: "bar",
      data: {
        labels: ["LazyApply Basic", "JobCopilot Premium", "JobCopilot Elite", "LazyApply Premium", "LazyApply Ultimate"],
        datasets: [{
          label: "Listed daily limit",
          data: [15, 20, 50, 150, 1500],
          backgroundColor: [VIOLET2, ORANGE, ORANGE, VIOLET2, VIOLET2],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Up to ${Number(ctx.raw).toLocaleString()} a day (as listed)` } },
        },
        scales: {
          x: {
            type: "logarithmic",
            min: 10,
            max: 2000,
            grid: gridOpts,
            border: { dash: [4, 4] },
            ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => ([10, 100, 1000].includes(Number(v)) ? Number(v).toLocaleString() : "") },
          },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: monthly equivalent of listed prices, USD (derived from listed prices)
  const priceEl = document.getElementById("aajPriceChart") as HTMLCanvasElement | null;
  if (priceEl && !priceEl.dataset.rendered) {
    priceEl.dataset.rendered = "1";
    new Chart(priceEl, {
      type: "bar",
      data: {
        labels: [
          "LazyApply Basic ($99/yr)",
          "LazyApply Premium ($149/yr)",
          "JobCopilot Premium (from $0.93/day)",
          "JobCopilot Elite (from $1.05/day)",
          "AIApply, 100 applications ($49/mo)",
          "LazyApply Ultimate ($999/yr)",
          "AIApply, 250 applications ($99/mo)",
        ],
        datasets: [{
          label: "Monthly equivalent (USD)",
          data: [8.25, 12.42, 27.9, 31.5, 49, 83.25, 99],
          backgroundColor: [VIOLET2, VIOLET2, ORANGE, ORANGE, INK, VIOLET2, INK],
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
          tooltip: { callbacks: { label: (ctx: any) => ` About $${ctx.raw} a month` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 110, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `$${v}` } },
          y: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
        },
      },
    });
  }

  // Chart 3: auto-apply vs applying by hand vs a personal email (editorial rating)
  const ceilEl = document.getElementById("aajCeilChart") as HTMLCanvasElement | null;
  if (ceilEl && !ceilEl.dataset.rendered) {
    ceilEl.dataset.rendered = "1";
    new Chart(ceilEl, {
      type: "bar",
      data: {
        labels: [
          ["Applications", "per hour"],
          ["Reaches the person", "who decides"],
          ["Written for that", "one team"],
          ["Low risk of", "bot flags"],
        ],
        datasets: [
          { label: "Auto-apply tool (any of the four)", data: [5, 1, 2, 1], backgroundColor: RED, borderRadius: 6, borderWidth: 0 },
          { label: "Applying by hand", data: [2, 1, 3, 5], backgroundColor: VIOLET3, borderRadius: 6, borderWidth: 0 },
          { label: "Personal email to the hiring manager", data: [2, 5, 5, 5], backgroundColor: VIOLET, borderRadius: 6, borderWidth: 0 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}/5` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
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
    q: "Is there an AI that applies to jobs for you?",
    a: "Yes. LazyApply, Jobright, AIApply and JobCopilot each say on their own sites that they fill in and submit applications for you. Whether that gets you interviews is a different question: they all send into the same application queues, where a typical online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026).",
  },
  {
    q: "How much do AI auto-apply tools cost?",
    a: "As listed on their sites in October 2026: LazyApply sells annual plans at $99, $149 and $999, AIApply's auto-apply starts at $49 a month for 100 applications, and JobCopilot lists plans from $0.93 a day. Jobright shows no job-seeker price on its public pages. Prices in this category change often.",
  },
  {
    q: "Is LazyApply legit?",
    a: "LazyApply is a real, paid product: its site lists annual plans allowing 15 to 1,500 applications a day. On Trustpilot (2.1 of 5 from 110 reviews, October 2026), reviewers report forms filled wrong or left blank, filters returning the wrong jobs, charges after cancelling and slow refunds. Our view is that, like every auto-apply tool, it adds volume without changing the odds per application.",
  },
  {
    q: "Which is the best auto-apply tool: Jobright, AIApply or JobCopilot?",
    a: "We do not rank them, because they share the same ceiling. Each one sends applications into the same portals, where the average opening draws about 242 applications (Business Insider data cited by The Interview Guys, 2026). If the goal is interviews, our advice is to stop choosing between bots and email the hiring manager instead.",
  },
  {
    q: "Can employers tell if an AI applied to a job for me?",
    a: "Often, yes. NBC News (17 November 2024) reported recruiters planting hidden instructions in job posts, such as asking applicants to include a specific odd word, and spotting one person applying to dozens of roles at the same company. A tool that misses the instruction or sprays one company gives you away.",
  },
  {
    q: "What is the alternative to AI auto-apply tools?",
    a: "Email the person who actually hires: the hiring manager or team lead, with a short, personal, specific email from your own address, and follow up once. Studojo does this for you: it finds that person, verifies their email, writes the email for them and sends it from your own Gmail. Replies are not guaranteed, but a real email to a real person is a better bet than a bot in a queue.",
  },
];

export default function AiThatAppliesToJobsReport() {
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
        "headline": "AI That Applies to Jobs for You: LazyApply, Jobright, AIApply and JobCopilot, Compared",
        "description": "What four AI auto-apply tools claim on their own sites, their listed prices, what public reviewers report, and why they all share auto-apply's ceiling.",
        "url": `${BASE_URL}/reports/ai-that-applies-to-jobs-for-you-2026`,
        "datePublished": "2026-10-27T00:00:00Z",
        "dateModified": "2026-10-27T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/ai-that-applies-to-jobs-for-you-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "AI That Applies to Jobs for You 2026", "item": `${BASE_URL}/reports/ai-that-applies-to-jobs-for-you-2026` },
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
              <span>AI That Applies to Jobs for You 2026</span>
            </nav>
            <h1>AI That Applies to Jobs for You: <em>LazyApply, Jobright, AIApply and JobCopilot, Compared</em></h1>
            <p className="rpt-hero-sub">
              Four tools that say they will apply to jobs for you. What each one claims on
              its own site, what it costs where the price is listed, what public reviewers
              report, and why all four run into the same ceiling.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Job seekers and freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">AI auto-apply tools, compared</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>All four sell the same core product: <strong>software that fills in and submits job applications for you</strong>, as each describes on its own site (October 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Listed prices run from <strong>LazyApply's $99 a year</strong> (15 applications a day) to <strong>$999 a year</strong> (1,500 a day). AIApply's auto-apply starts at $49 a month for 100 applications; JobCopilot lists plans from $0.93 a day. Jobright shows no job-seeker price on its public pages.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Their headline interview claims are <strong>their own marketing</strong>. We found no published method behind any of them.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Critical reviewers of all four report the same things: <strong>wrong jobs, wrong locations, forms filled wrong and billing trouble</strong>.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Our verdict: they all feed the same queue, so they all share auto-apply's ceiling. <strong>The alternative is emailing the hiring manager</strong>, and Studojo does that for you.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">$999</div>
              <div className="sc-label">a year for LazyApply's top plan, listed at up to 1,500 applications a day</div>
              <div className="sc-source">lazyapply.com/pricing, October 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">0.1 to 2%</div>
              <div className="sc-label">typical success rate of an online application, the queue every one of these tools sends into</div>
              <div className="sc-source">The Interview Guys, April 2026 (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">242</div>
              <div className="sc-label">applications drawn by the average job opening</div>
              <div className="sc-source">Business Insider data via The Interview Guys, 2026 (reported)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">What "AI That Applies for You" Actually Does</div>
                <div className="sec-sub">Same pipeline, different branding</div>
              </div>
            </div>
            <p>Every tool in this report sells some version of the same pipeline. Pull listings from job boards or company career pages. Match them to your profile. Fill in the application form. Submit. Track. Some rewrite your resume or cover letter for each role along the way.</p>
            <p>The differences are in volume caps, pricing and how much you review before anything is sent. The destination is the same for all of them: the company's application portal, the same queue every other applicant uses. Whether you are a fresher in Bengaluru or a graduate in Boston, that queue works the same way.</p>
            <div className="chart-wrap">
              <div className="chart-label">Daily limits by plan, as listed on each site, October 2026 (applications or matches a day, log scale)</div>
              <div style={{ height: 280 }}>
                <canvas id="aajCapChart" />
              </div>
            </div>
            <p>AIApply sells auto-apply by the month or quarter (100, 250 or 750 applications) rather than by the day, and Jobright's site says "Apply to hundreds of jobs daily" without listing a cap, so neither appears above.</p>
            <div className="highlight">
              What all four optimise is <strong>how many applications leave your account</strong>. What decides your search is what happens after one arrives.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">The Four Tools, Side by Side</div>
                <div className="sec-sub">What each says on its own site, as listed in October 2026</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>What it says it does</th>
                  <th>Price (as listed on its site, October 2026)</th>
                  <th>What reviewers report (Trustpilot, October 2026)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>LazyApply</strong><br /><span className="tag-pill pill-amber">Auto-apply</span></td>
                  <td>Says it can "automatically apply to all the jobs on platforms like Greenhouse, Dice, Indeed and Ziprecruiter" and "Apply to jobs across multiple platforms with a single click."</td>
                  <td>Basic $99 a year (15 applications a day), Premium $149 a year (150 a day), Ultimate $999 a year (1,500 a day).</td>
                  <td>Reviewers report the automation failing to fill forms, entry-level remote searches returning senior on-site roles, charges after cancelling, slow or unanswered refunds and unresponsive support.</td>
                </tr>
                <tr>
                  <td><strong>Jobright</strong><br /><span className="tag-pill pill-blue">Copilot + agent</span></td>
                  <td>Calls itself "Your AI Job Search Copilot": job matching, application autofill and tailored resumes. Its Jobright Agent "customizes your resume, writes a cover letter, fills forms, and applies", and "currently works best for tech and adjacent fields" (Jobright blog, 22 July 2025).</td>
                  <td>No job-seeker price on its public pages. It offers a free start, and its agent page invites you to "Unlock Auto-Apply".</td>
                  <td>Critical reviewers report 200+ applications with no interview, an inaccurate location filter and match scores that differ from the employer's listing.</td>
                </tr>
                <tr>
                  <td><strong>AIApply</strong><br /><span className="tag-pill pill-amber">Auto-apply</span></td>
                  <td>"Our AI matches you with relevant jobs and applies to hundreds of roles for you," with a tailored resume and cover letter per role. Its help center: "Auto Apply submits job applications on your behalf, automatically, based on the criteria you set."</td>
                  <td>$49 a month for 100 applications, $99 a month for 250, $199 a quarter for 750. Tailored resume and cover letter add-ons $12 a month each (AIApply help center).</td>
                  <td>Critical reviewers report jobs in countries they did not want, cover letters in languages they do not speak, forms auto-filled with wrong details, charges that differed from the advertised price, and refused refunds.</td>
                </tr>
                <tr>
                  <td><strong>JobCopilot</strong><br /><span className="tag-pill pill-amber">Auto-apply</span></td>
                  <td>"Use AI to automatically apply to jobs from 500,000+ companies worldwide," sending "up to 50 personalized job applications per day," only to jobs on official company career pages.</td>
                  <td>Premium from $0.93 a day (1 copilot, up to 20 job matches a day). Elite from $1.05 a day (3 copilots, up to 50). Weekly, monthly and quarterly plans.</td>
                  <td>Reviewers report irrelevant matches, closed listings, charges after a trial they believed was free, hard cancellation, hundreds of applications with no interview, and AI-tailored resumes with wrong details.</td>
                </tr>
              </tbody>
            </table>
            <p>Sources: lazyapply.com and lazyapply.com/pricing; jobright.ai, jobright.ai/ai-agent and the Jobright blog; aiapply.co/auto-apply and AIApply's help center article on how Auto Apply works; jobcopilot.com and jobcopilot.com/pricing; each tool's Trustpilot page. All read in October 2026. Prices in this category change often.</p>
            <div className="chart-wrap">
              <div className="chart-label">Monthly equivalent of each listed price, USD (derived from listed prices, October 2026)</div>
              <div style={{ height: 320 }}>
                <canvas id="aajPriceChart" />
              </div>
            </div>
            <p>A good review tells you how the app feels to use. It does not tell you how many of those applications reached a person who could hire you.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">The Marketing Numbers</div>
                <div className="sec-sub">Their claims, in their words, from their own sites</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Interview multipliers.</strong> Each site advertises more interviews, framed as "x times more" or "% higher".</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>User counts.</strong> Each site leads with how many people have signed up.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Volume.</strong> Applications per day and hours saved, the core of every pitch.</span></div>
            </div>
            <p>We could not find a published method behind any of these interview numbers. Treat them as what they are: marketing.</p>
            <p>Notice what the claims measure. Hours saved. Applications sent. Users signed up. None of it is the one number that matters to you: how many of those applications reached a person who could say yes.</p>
            <div className="callout">
              <strong>This category moves fast.</strong> Sonara, an earlier auto-apply service, ran a $2.95 trial that rolled into $23.95 per four weeks, and shut its original service on 1 February 2024 (Sonara's shutdown notice and public reviews).
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Why They All Hit the Same Ceiling</div>
                <div className="sec-sub">Better software, same queue</div>
              </div>
            </div>
            <p>Swap one tool for another and the destination does not change. The average job opening draws about 242 applications (Business Insider data cited by The Interview Guys, April 2026), and a typical online application succeeds roughly 0.1% to 2% of the time. The same article reports one auto-apply account that got about 5 interviews from thousands of applications, and one bulk-apply service that shut its bulk-send feature in August 2025 at roughly one interview per fifty sends.</p>
            <p>Volume also leaves tracks. NBC News (17 November 2024) reported recruiters planting hidden instructions in job posts, such as asking applicants to include a specific odd word, and spotting one person applying to dozens of roles at the same company. And LinkedIn's terms ban bots and automation tools (User Agreement, section 8.2), so read them before any tool touches your account.</p>
            <div className="chart-wrap">
              <div className="chart-label">Auto-apply vs applying by hand vs a personal email (Studojo editorial rating, 1 to 5)</div>
              <div style={{ height: 300 }}>
                <canvas id="aajCeilChart" />
              </div>
            </div>
            <div className="highlight">
              A faster bot, a better match score or a nicer dashboard all improve the same step: <strong>getting into the queue</strong>. None of them gets you out of it.
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">What to Do Instead</div>
                <div className="sec-sub">Skip the queue and write to the person who hires</div>
              </div>
            </div>
            <p>The way out of the queue is not a better queue tool. It is a short email to the person who actually hires: the hiring manager or team lead, not a generic HR inbox.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Find the person.</strong> The manager of the team you would join, not the careers page.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Make it specific.</strong> One line on their team's work, one proof point from yours, one clear ask.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Send it from your own address.</strong> A real email from a real person, not a portal submission.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Follow up once.</strong> A short nudge a few days later. Then move on.</span></div>
            </div>
            <div className="pull-quote">
              <p>"Every auto-apply tool is racing to the same queue. The person who hires is not standing in it."</p>
              <span className="pq-source">Studojo's verdict on AI auto-apply tools</span>
            </div>
            <p>We built Studojo to do exactly this. It finds the person who can actually hire you, verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail.</p>
            <p>So far: 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026). Replies are not guaranteed. But one real email to the right person is a better bet than a thousand applications in a queue.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The AI auto-apply questions people ask most, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>Before you pay for any auto-apply tool</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Choosing between these tools is choosing how fast to join the same line. Ask a different question:</p>
            <div className="blist">
              {[
                ["Read the claim, then the method", "An interview number with no published method is marketing, not evidence."],
                ["Read the critical reviews", "Wrong jobs and wrong details go out under your name, not the tool's."],
                ["Count people, not applications", "How many real hiring managers saw your name this week?"],
                ["Email the person who hires", "Short, personal, specific, from your own address, with one follow-up. Studojo does this for you."],
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
              <Link to="/reports/does-auto-apply-work-report-2026" className="related-card">
                <div className="rc-kicker">Auto-apply</div>
                <div className="rc-title">Does Auto-Apply Work? The Numbers Say No</div>
              </Link>
              <Link to="/reports/ai-job-agent-report-2026" className="related-card">
                <div className="rc-kicker">AI agents</div>
                <div className="rc-title">The AI Job Agent Report 2026</div>
              </Link>
              <Link to="/reports/ai-job-search-tools-2026" className="related-card">
                <div className="rc-kicker">AI tools</div>
                <div className="rc-title">AI Tools for the Job Search: What Actually Helps, and What Gets You Caught</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Skip the queue. Email the person who hires.</h3>
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
