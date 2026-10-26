import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";
const SLUG = "fake-job-internship-scams-2026";

export function meta() {
  return [
    { title: "How to Spot a Fake Job or Internship in 2026: The Scam Signals, by the Data | Studojo" },
    { name: "description", content: "One rule catches most job scams: a real employer never asks you to pay to get hired. The common types, from registration fees to Telegram task scams and fake offer letters, the red flags, how to verify an employer in five minutes, and what to do if you have already paid." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "fake job scam 2026, is this internship a scam, fake internship offer, job scam signs, fake offer letter, telegram job scam, work from home job scam india, how to verify a recruiter, upi job scam" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/${SLUG}` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How to Spot a Fake Job or Internship in 2026: The Scam Signals, by the Data" },
    { property: "og:description", content: "The one rule that catches most job scams, the common types, the red flags, how to verify an employer, and what to do if you already paid." },
    { property: "og:url", content: `${BASE_URL}/reports/${SLUG}` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-12T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How to Spot a Fake Job or Internship in 2026 | Studojo" },
    { name: "twitter:description", content: "A real employer never asks you to pay to get hired. The scam types, red flags and a five minute verification check." },
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

  // Chart 1: scam type prevalence (illustrative)
  const typeEl = document.getElementById("scamTypeChart") as HTMLCanvasElement | null;
  if (typeEl && !typeEl.dataset.rendered) {
    typeEl.dataset.rendered = "1";
    new Chart(typeEl, {
      type: "bar",
      data: {
        labels: [
          "Upfront fee (registration, training, kit)",
          "Fake offer letter",
          "Task or commission scam",
          "Impersonating a real company",
          "Data-harvesting fake listing",
          "Cheque or overpayment scam",
        ],
        datasets: [{
          label: "How often students meet it (1-5, illustrative)",
          data: [5, 5, 4, 4, 3, 2],
          backgroundColor: [RED, RED, ORANGE, ORANGE, VIOLET3, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Illustrative: ${ctx.raw}/5` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: channels (illustrative)
  const channelEl = document.getElementById("channelChart") as HTMLCanvasElement | null;
  if (channelEl && !channelEl.dataset.rendered) {
    channelEl.dataset.rendered = "1";
    new Chart(channelEl, {
      type: "doughnut",
      data: {
        labels: [
          "Telegram / WhatsApp",
          "Fake job portals",
          "Email",
          "Social media DMs",
          "Fake recruiter calls",
        ],
        datasets: [{
          data: [32, 22, 18, 16, 12],
          backgroundColor: [RED, ORANGE, VIOLET, VIOLET2, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw}% (illustrative)` } },
        },
      },
    });
  }

  // Chart 3: when money is first requested (illustrative)
  const askEl = document.getElementById("askChart") as HTMLCanvasElement | null;
  if (askEl && !askEl.dataset.rendered) {
    askEl.dataset.rendered = "1";
    new Chart(askEl, {
      type: "bar",
      data: {
        labels: ["Before any interview", "After a chat-only interview", "With the offer letter", "On day one or onboarding", "Never (genuine)"],
        datasets: [{
          label: "Share of scams (%, illustrative)",
          data: [30, 28, 24, 14, 0],
          backgroundColor: [RED, RED, ORANGE, ORANGE, GREEN],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw}% (illustrative)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 40, ticks: { font: { size: 12 }, color: MUTED } },
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
    q: "Is it a scam if a company asks for a registration or training fee?",
    a: "Yes, almost always. A genuine employer pays you or trains you, it does not charge you for the chance to work. Fees labelled as registration, security deposit, training, ID card, laptop or kit are the most common job scam pattern. Walk away and do not send any money.",
  },
  {
    q: "Do real companies send an offer letter before any interview?",
    a: "No. A real offer follows a real process: an application, at least one conversation with a person who works there, and usually a background or reference step. An offer letter that arrives with no interview, or after a text-only chat, is a strong sign of a fake. Scammers use it to make you feel committed before they ask for money.",
  },
  {
    q: "Are job offers that come through Telegram or WhatsApp real?",
    a: "Rarely. A recruiter who messages you first on Telegram or WhatsApp, offers easy pay for liking videos or completing small tasks, and then asks you to deposit money to unlock earnings is running a task scam. Real recruiters may use WhatsApp to schedule a call, but the job itself comes from a company email and a company hiring process.",
  },
  {
    q: "How do I check if a recruiter is genuine?",
    a: "Check that they write from the company's own domain, not Gmail or Outlook, and that they have a real LinkedIn profile with a history. Then find the job on the company's official careers page and confirm the company is registered. If any of these fail, treat the offer as fake until the company confirms it through its official website.",
  },
  {
    q: "I already paid a fake company, what should I do?",
    a: "Stop all contact and act today. Call your bank or UPI provider to report the transaction and ask them to flag or block it. In India, report on the national cyber crime portal (cybercrime.gov.in) or call 1930. In the US, report at reportfraud.ftc.gov and ic3.gov. Keep screenshots, receipts and chat history as evidence.",
  },
  {
    q: "Should I share my Aadhaar, PAN, SSN or bank details before I start a job?",
    a: "No. Not before you have a verified offer from a verified employer. Identity and bank details are collected at onboarding, inside a real HR process, usually on or after your joining date. A stranger who asks for them early may be harvesting them for identity theft or to empty your account.",
  },
];

export default function FakeJobScamsReport() {
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
        "headline": "How to Spot a Fake Job or Internship in 2026: The Scam Signals, by the Data",
        "description": "The one rule that catches most job scams, the common types, the red flags, how to verify an employer, and what to do if you already paid.",
        "url": `${BASE_URL}/reports/${SLUG}`,
        "datePublished": "2026-10-12T00:00:00Z",
        "dateModified": "2026-10-12T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/${SLUG}` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Fake Job and Internship Scams 2026", "item": `${BASE_URL}/reports/${SLUG}` },
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
              <span>Fake Job and Internship Scams 2026</span>
            </nav>
            <h1>How to Spot a Fake Job <em>Before It Costs You</em></h1>
            <p className="rpt-hero-sub">
              Job scams target people who are hopeful and short on time, which
              describes most students. This report covers the one rule that catches most
              of them, the common types, the red flags, a five minute way to verify an
              employer, and what to do if you have already paid.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · India focus</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Scam signals and verification</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The one rule:</strong> a real employer never asks you to pay to get hired, for any reason. Registration, training, equipment, a deposit. All of them are the same scam.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The common types:</strong> upfront fees, fake offer letters sent before any real interview, task or commission scams run on Telegram and WhatsApp, cheque or overpayment scams, data-harvesting fake listings, and scammers impersonating real companies and recruiters.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The fastest tell is the channel and the ask.</strong> A Gmail address, a chat app, and money or documents requested early. Any two together should stop you.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Verify before you engage:</strong> an email from the company domain, a real LinkedIn page with a history, official company registration, and reviews on Glassdoor or AmbitionBox.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>If you have paid or shared bank or ID details, act fast.</strong> Contact your bank, report it, and stop all contact with the sender.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">Top 5</div>
              <div className="sc-label">business and job-opportunity scams were a top-5 most-reported fraud category to the US FTC in 2023, and reports capture only a fraction of real cases</div>
              <div className="sc-source">US FTC, 2023</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">₹0</div>
              <div className="sc-label">what a genuine employer ever charges you to get hired</div>
              <div className="sc-source">FTC and India I4C guidance</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">Rising</div>
              <div className="sc-label">task-based and work-from-home scams aimed at young job seekers keep growing as a complaint category in India</div>
              <div className="sc-source">Indian Cyber Crime Coordination Centre / news reports (reported)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">The One Rule That Catches Most Scams</div>
                <div className="sec-sub">Pay-to-work, in all its disguises</div>
              </div>
            </div>
            <p>Real employers pay people. They do not collect money from the people they want to hire. That single fact filters out the large majority of fake jobs and internships, because most of them need you to send money at some point. That is the whole business model.</p>
            <p>The trick is that the request rarely says "fee". It arrives dressed as something reasonable.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>"Registration fee":</strong> pay a small amount to "confirm your seat" or "register your profile".</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>"Training fee":</strong> pay for a course or certification you "must complete" before you start.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>"Equipment or kit":</strong> pay for a laptop, ID card, software licence or uniform, sometimes "refundable".</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>"Security deposit":</strong> pay a deposit that you will "get back with your first salary".</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>"Verification charge":</strong> pay a small amount via UPI to "verify your bank account".</span></div>
            </div>
            <div className="highlight">
              <strong>The test:</strong> if money moves from you to them before you have earned anything, stop. The label on the request does not matter. The direction of the money does.
            </div>
            <div className="callout">
              <strong>One honest exception to know about:</strong> paying for your own education, such as a course you chose to buy, is fine. It is not a job. If a "job" is conditional on a purchase, it is not a job.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">The Main Scam Types</div>
                <div className="sec-sub">How each one works, and the tell that gives it away</div>
              </div>
            </div>
            <p>Scams change their story, not their structure. They build urgency and trust quickly, then ask for money or data. Knowing the six common types lets you spot the structure under a new story.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>How it works</th>
                  <th>The tell</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Upfront fee</strong></td>
                  <td>You are "selected", then asked to pay for registration, training or a kit.</td>
                  <td><span className="tag-pill pill-red">Any payment</span> asked of you</td>
                </tr>
                <tr>
                  <td><strong>Fake offer letter</strong></td>
                  <td>A polished letter arrives with no real interview, then fees or documents follow.</td>
                  <td><span className="tag-pill pill-red">No interview</span> before the offer</td>
                </tr>
                <tr>
                  <td><strong>Task or commission scam</strong></td>
                  <td>On Telegram or WhatsApp, you are paid small amounts for easy tasks, then told to deposit money to unlock larger earnings.</td>
                  <td><span className="tag-pill pill-red">Deposit</span> to earn more</td>
                </tr>
                <tr>
                  <td><strong>Cheque or overpayment</strong></td>
                  <td>You receive a payment "for equipment", are told to forward part of it, and the original payment later bounces.</td>
                  <td><span className="tag-pill pill-amber">Forward money</span> you received</td>
                </tr>
                <tr>
                  <td><strong>Data-harvesting listing</strong></td>
                  <td>A fake job form collects your ID, bank details or résumé for identity theft or resale.</td>
                  <td><span className="tag-pill pill-amber">ID or bank details</span> asked early</td>
                </tr>
                <tr>
                  <td><strong>Impersonation</strong></td>
                  <td>Scammers copy a real company's name, logo and a lookalike email or recruiter profile.</td>
                  <td><span className="tag-pill pill-blue">Lookalike domain</span> or Gmail address</td>
                </tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">How often students meet each type (illustrative, 1 to 5)</div>
              <div style={{ height: 300 }}>
                <canvas id="scamTypeChart" />
              </div>
            </div>
            <div className="chart-two">
              <div>
                <div className="chart-label">Where scams reach students, by channel (illustrative)</div>
                <div style={{ height: 260 }}>
                  <canvas id="channelChart" />
                </div>
              </div>
              <div>
                <div className="chart-label">When money is first requested (illustrative)</div>
                <div style={{ height: 260 }}>
                  <canvas id="askChart" />
                </div>
              </div>
            </div>
            <p>The charts above are illustrative. They show the pattern we see repeated in public reports and complaints: the earlier money or documents are requested, and the more informal the channel, the more likely it is a scam. They are not measured survey results.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Red Flags Versus Green Flags</div>
                <div className="sec-sub">One flag is a reason to slow down. Two is a reason to leave</div>
              </div>
            </div>
            <div className="chart-label" style={{ color: "#b91c1c" }}>Red flags</div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" style={{ background: "#ef4444" }} /><span><strong>Any request for money</strong> from you, at any stage, for any reason.</span></div>
              <div className="blist-item"><div className="blist-dot" style={{ background: "#ef4444" }} /><span><strong>A Gmail, Yahoo or Outlook address</strong> from someone claiming to represent a company.</span></div>
              <div className="blist-item"><div className="blist-dot" style={{ background: "#ef4444" }} /><span><strong>The whole process happens in chat,</strong> on Telegram or WhatsApp, with no call or video interview.</span></div>
              <div className="blist-item"><div className="blist-dot" style={{ background: "#ef4444" }} /><span><strong>An offer you did not apply for,</strong> or one that arrives within hours of a first message.</span></div>
              <div className="blist-item"><div className="blist-dot" style={{ background: "#ef4444" }} /><span><strong>Pay that is too good</strong> for the work: high earnings for liking posts, typing or "simple tasks".</span></div>
              <div className="blist-item"><div className="blist-dot" style={{ background: "#ef4444" }} /><span><strong>Pressure and deadlines</strong> such as "pay within 2 hours or lose your seat".</span></div>
              <div className="blist-item"><div className="blist-dot" style={{ background: "#ef4444" }} /><span><strong>Early requests for Aadhaar, PAN, SSN, a bank login or an OTP.</strong> Never share an OTP with anyone.</span></div>
            </div>
            <div className="divider" />
            <div className="chart-label" style={{ color: "#065f46" }}>Green flags</div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" style={{ background: "#10b981" }} /><span><strong>Email from the company's own domain,</strong> matching its official website.</span></div>
              <div className="blist-item"><div className="blist-dot" style={{ background: "#10b981" }} /><span><strong>The role is listed on the official careers page,</strong> and you can apply there yourself.</span></div>
              <div className="blist-item"><div className="blist-dot" style={{ background: "#10b981" }} /><span><strong>At least one live conversation</strong> with a named person you can find on LinkedIn.</span></div>
              <div className="blist-item"><div className="blist-dot" style={{ background: "#10b981" }} /><span><strong>Clear, specific job details:</strong> responsibilities, manager, location, pay and dates.</span></div>
              <div className="blist-item"><div className="blist-dot" style={{ background: "#10b981" }} /><span><strong>Documents come late,</strong> at onboarding, through an HR process, never a payment.</span></div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">How to Verify an Employer in Five Minutes</div>
                <div className="sec-sub">A checklist you can run before you reply</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Check</th>
                  <th>What to do</th>
                  <th>Pass looks like</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>1. Email domain</strong></td>
                  <td>Compare the sender's domain to the company's official website, letter by letter.</td>
                  <td><span className="tag-pill pill-green">Match</span> exact company domain</td>
                </tr>
                <tr>
                  <td><strong>2. LinkedIn page</strong></td>
                  <td>Open the company page and the recruiter's profile. Check history, connections and posts.</td>
                  <td><span className="tag-pill pill-green">Real</span> years of history and real employees</td>
                </tr>
                <tr>
                  <td><strong>3. Registration</strong></td>
                  <td>Look up the company in the official registry (in India, the MCA company search; in the US, the state business registry).</td>
                  <td><span className="tag-pill pill-green">Found</span> a registered, active entity</td>
                </tr>
                <tr>
                  <td><strong>4. Reviews</strong></td>
                  <td>Search the company on Glassdoor or AmbitionBox. Read the recent and the negative reviews.</td>
                  <td><span className="tag-pill pill-green">Exists</span> with employee reviews</td>
                </tr>
                <tr>
                  <td><strong>5. Official listing</strong></td>
                  <td>Find the same role on the company's own careers page, or ask the company's official contact to confirm it.</td>
                  <td><span className="tag-pill pill-green">Listed</span> or confirmed</td>
                </tr>
                <tr>
                  <td><strong>6. Search the pitch</strong></td>
                  <td>Search the company name plus "scam" or "fraud", and paste part of the message into a search engine.</td>
                  <td><span className="tag-pill pill-green">Clean</span> no scam reports</td>
                </tr>
              </tbody>
            </table>
            <div className="highlight">
              If you cannot confirm the company through a source <strong>you found yourself</strong>, not a link or number the recruiter gave you, do not continue.
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">If It Already Happened</div>
                <div className="sec-sub">How to report and limit the damage</div>
              </div>
            </div>
            <p>If you have paid or shared details, you are not alone and it is not your fault. These scams are designed by professionals. Speed is what helps most, so work through these steps in order.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Stop all contact.</strong> Do not argue, threaten or send more money to "fix" it. Do not pay a "refund fee".</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Call your bank or UPI provider immediately.</strong> Report the transaction, ask them to flag or block it, and freeze any card or account you shared.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>India:</strong> report on the national cyber crime portal (cybercrime.gov.in) or call the helpline <strong>1930</strong>. Reporting quickly improves the chance of freezing the money.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>US:</strong> report at <strong>reportfraud.ftc.gov</strong> and <strong>ic3.gov</strong>.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Keep evidence.</strong> Screenshots, chat history, phone numbers, UPI IDs, receipts and the original job post.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Protect your identity.</strong> If you shared Aadhaar, PAN, SSN or bank details, change passwords, enable two-factor login and watch your accounts and credit reports.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Report the listing</strong> to the platform where you found it, so it comes down for the next student.</span></div>
            </div>
            <div className="callout">
              <strong>Informational only, not legal advice.</strong> Reporting channels and processes can change. Check the official portals for current instructions, and speak to your bank or a qualified adviser about your specific situation.
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The scam questions students ask most, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to stay safe and keep applying</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>You do not need to be suspicious of every opportunity. You need a short set of rules you apply every time:</p>
            <div className="blist">
              {[
                ["Never pay to get hired", "No fee, deposit or kit, for any reason. If money has to leave your account first, it is not a job."],
                ["Slow down when it feels fast", "An offer with no interview, a deadline and a chat app is a pattern. Real hiring takes a few days, and a real employer will wait."],
                ["Verify with a source you found yourself", "Use the company's official website and careers page, not links, numbers or emails supplied by the recruiter."],
                ["Go direct to real companies", "Applying straight to a hiring manager at a company you have checked removes most of the risk, and gets you noticed more."],
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
              <Link to="/reports/remote-internships-2026" className="related-card">
                <div className="rc-kicker">Remote</div>
                <div className="rc-title">Remote Internships 2026: Which Ones Are Real</div>
              </Link>
              <Link to="/reports/ghost-jobs-2026" className="related-card">
                <div className="rc-kicker">Hiring</div>
                <div className="rc-title">Why Companies Post Jobs Without Planning to Hire</div>
              </Link>
              <Link to="/reports/unpaid-internship-report-where-legal-2026" className="related-card">
                <div className="rc-kicker">Pay and law</div>
                <div className="rc-title">The Unpaid Internship Report: Where It Is Legal</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Apply to real roles, direct from the company.</h3>
              <p>Stu, Studojo's job agent, finds roles that fit you on company career sites and job boards, and the hiring manager or recruiter to write to. You send the email from your own mailbox.</p>
            </div>
            <Link to="/b2cnew/join?via=report-fake-job-internship-scams-2026&how=voice" reloadDocument className="rpt-cta-btn">
              Let Stu find roles →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
