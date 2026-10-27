import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Job Consultancy for Freshers in India 2026: Who Pays Whom, and When to Walk Away | Studojo" },
    { name: "description", content: "Job consultancy for freshers: how placement consultancies earn, why paying one is a red flag, the eMigrate check for jobs abroad, and how to skip the middleman." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "job consultancy for freshers, placement consultancy fees, do job consultancies charge freshers, job consultancy in Bangalore for freshers, is it safe to pay a job consultancy, placement agency for freshers" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/job-consultancy-for-freshers-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Job Consultancy for Freshers in India 2026: Who Pays Whom, and When to Walk Away" },
    { property: "og:description", content: "A real job consultancy for freshers is paid by the employer, not by you. How they earn, the money requests that mean walk away, and the eMigrate check." },
    { property: "og:url", content: `${BASE_URL}/reports/job-consultancy-for-freshers-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-28T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Job Consultancy for Freshers in India 2026 | Studojo" },
    { name: "twitter:description", content: "Who pays a job consultancy, why one asking a fresher for money is a red flag, and why you do not need a middleman." },
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

  // Chart 1: consultancy red flags by how serious (editorial rating)
  const flagEl = document.getElementById("jcfFlagChart") as HTMLCanvasElement | null;
  if (flagEl && !flagEl.dataset.rendered) {
    flagEl.dataset.rendered = "1";
    new Chart(flagEl, {
      type: "bar",
      data: {
        labels: [
          "Asks for a registration fee",
          "Guarantees a job for a fee",
          "Offer letter, then a processing fee",
          "Overseas agent not on eMigrate",
          "Paid training before any placement",
          "Interviews only on WhatsApp or Telegram",
          "Will not name the employer",
        ],
        datasets: [{
          label: "How serious (1-5)",
          data: [5, 5, 5, 5, 4, 4, 3],
          backgroundColor: [RED, RED, RED, RED, ORANGE, ORANGE, VIOLET2],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Serious: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: layers between you and the hiring manager, by route (illustrative)
  const hopsEl = document.getElementById("jcfHopsChart") as HTMLCanvasElement | null;
  if (hopsEl && !hopsEl.dataset.rendered) {
    hopsEl.dataset.rendered = "1";
    new Chart(hopsEl, {
      type: "bar",
      data: {
        labels: ["Through a consultancy", "Auto-apply bot", "Portal application", "Email to the hiring manager"],
        datasets: [{
          label: "Layers before a hiring manager sees you",
          data: [3, 3, 2, 0],
          backgroundColor: [RED, RED, ORANGE, GREEN],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} layers (illustrative)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 4, ticks: { stepSize: 1, font: { size: 12 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: how much control you keep (editorial rating)
  const ctrlEl = document.getElementById("jcfControlChart") as HTMLCanvasElement | null;
  if (ctrlEl && !ctrlEl.dataset.rendered) {
    ctrlEl.dataset.rendered = "1";
    new Chart(ctrlEl, {
      type: "bar",
      data: {
        labels: ["Who sees you", "Which companies", "What the message says", "Follow-up"],
        datasets: [
          { label: "Through a consultancy", data: [1, 2, 1, 1], backgroundColor: ORANGE, borderRadius: 6, borderWidth: 0 },
          { label: "Emailing the hiring manager", data: [5, 5, 5, 5], backgroundColor: VIOLET, borderRadius: 6, borderWidth: 0 },
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
    q: "Do job consultancies charge freshers?",
    a: "A genuine job consultancy for freshers in India should not charge you anything. Its fee comes from the employer that hired it to fill the role. If a consultancy asks you for a registration, training, deposit or processing fee, treat it as a red flag and walk away.",
  },
  {
    q: "How much are placement consultancy fees, and who pays them?",
    a: "Placement consultancy fees are paid by the employer, usually as a fee linked to the salary of the person placed and commonly billed after that person joins. Rates vary by firm and role, and we have not quoted a figure because we could not verify an independent one. For a job in India, the right amount for you to pay a consultancy is zero.",
  },
  {
    q: "Is it safe to pay a job consultancy?",
    a: "For a job in India, no. Paying a consultancy buys you no extra access to the hiring manager, and an upfront fee is one of the most common signs of a job scam. For a job abroad, a registered recruiting agent may take a service charge capped by the Emigration Rules, with a receipt, so check the agent on emigrate.gov.in and confirm the current cap before you pay anything.",
  },
  {
    q: "How do I find a genuine job consultancy in Bangalore for freshers?",
    a: "Use the same tests in Bangalore as anywhere else: it never asks you for money, it names the actual employer, the employer's own website confirms the role, and you interview with the company itself. Even a genuine consultancy only forwards your resume for roles it has been paid to fill. You will often get further by emailing the hiring manager at the company directly.",
  },
  {
    q: "Is a placement agency for freshers worth it?",
    a: "A free, honest one can be an extra channel, but it is not a plan. A placement agency for freshers works for the employers that pay it, and if its fee is linked to salary, entry-level roles are where it earns the least. Your strongest route is a short, personal email to the person who actually hires, sent from your own email, with one follow-up.",
  },
  {
    q: "How do I check if an overseas job recruiting agent is registered?",
    a: "Under Section 10 of the Emigration Act, 1983, anyone recruiting in India for jobs abroad must be registered with the Protector General of Emigrants at the Ministry of External Affairs. Go to emigrate.gov.in, open the List of active RA and search for the agent, and ask for its licence number, which registered agents must display. If the agent is not on the list, do not pay and do not hand over your passport.",
  },
];

export default function JobConsultancyForFreshersReport() {
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
        "headline": "Job Consultancy for Freshers in India 2026: Who Pays Whom, and When to Walk Away",
        "description": "How placement consultancies earn, why a consultancy asking a fresher for money is a red flag, the eMigrate check for overseas recruiters, and why you do not need a middleman.",
        "url": `${BASE_URL}/reports/job-consultancy-for-freshers-india-2026`,
        "datePublished": "2026-10-28T00:00:00Z",
        "dateModified": "2026-10-28T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/job-consultancy-for-freshers-india-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Job Consultancy for Freshers 2026", "item": `${BASE_URL}/reports/job-consultancy-for-freshers-india-2026` },
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
              <span>Job Consultancy for Freshers 2026</span>
            </nav>
            <h1>Job Consultancies for Freshers: <em>Who Pays Whom, and When to Walk Away</em></h1>
            <p className="rpt-hero-sub">
              A real job consultancy for freshers is paid by the employer, not by you. This
              report covers how placement consultancies earn, the money requests that mean
              walk away, the eMigrate check for jobs abroad, and why you do not need a
              middleman to reach the person who hires.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Consultancy fees, red flags, eMigrate</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>A genuine consultancy is <strong>paid by the employer</strong>, usually a fee linked to the salary of the person it places. You are what it delivers, not who it bills.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>A consultancy that asks a fresher for money is a red flag.</strong> Registration fees, paid training, security deposits and offer processing fees are the classic patterns.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>For jobs abroad, recruiting agents <strong>must be registered with the Ministry of External Affairs</strong> under the Emigration Act, 1983. Check them on emigrate.gov.in before you pay or share a passport.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Even an honest consultancy only forwards you to an HR inbox for roles it is paid to fill. <strong>It cannot make a hiring manager read you.</strong></span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>You do not need a middleman. <strong>Email the hiring manager yourself</strong>, from your own Gmail. That is exactly what we built Studojo to do.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">Section 10</div>
              <div className="sc-label">of the Emigration Act, 1983 requires anyone recruiting in India for jobs abroad to register with the Protector General of Emigrants</div>
              <div className="sc-source">Ministry of External Affairs, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">$1,500/mo</div>
              <div className="sc-label">plus about 10% of first-year salary is what reverse recruiters are reported to charge job seekers</div>
              <div className="sc-source">Fortune, 25 March 2026 (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">28,000+</div>
              <div className="sc-label">personal emails sent from students' own Gmail, with no middleman in between</div>
              <div className="sc-source">Studojo's own records, September 2026</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">How a Placement Consultancy Actually Earns</div>
                <div className="sec-sub">Placement consultancy fees come from the employer, not from you</div>
              </div>
            </div>
            <p>A job consultancy for freshers, also sold as a placement agency or placement consultancy, is a recruiter that companies hire to fill roles. The company is the client. The company pays.</p>
            <p>The usual model is a placement fee linked to the salary of the person placed, commonly billed once that person joins. Rates vary by firm, city and role, and we could not find an independent figure we trust, so we are not quoting one. The number that matters to you is simpler: for a job in India, you should pay a consultancy nothing.</p>
            <p>Follow the money and the incentives become clear. A consultancy works to fill the roles its clients are paying for, quickly. If the fee is linked to salary, a fresher salary earns it the smallest fee. That does not make every consultancy bad. It does mean you are rarely its priority.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Who you deal with</th>
                  <th>Who pays</th>
                  <th>What you should pay</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Genuine consultancy, job in India</strong></td>
                  <td>The employer</td>
                  <td>Nothing</td>
                  <td><span className="tag-pill pill-blue">Normal</span> Free, but serves its clients</td>
                </tr>
                <tr>
                  <td><strong>Registered recruiting agent, job abroad</strong></td>
                  <td>The rules allow a capped service charge from you</td>
                  <td>Only the capped charge, with a receipt</td>
                  <td><span className="tag-pill pill-amber">Check eMigrate</span> Verify first</td>
                </tr>
                <tr>
                  <td><strong>Consultancy charging a fresher upfront</strong></td>
                  <td>You</td>
                  <td>Nothing. Walk away</td>
                  <td><span className="tag-pill pill-red">Red flag</span> You are the revenue</td>
                </tr>
                <tr>
                  <td><strong>Reverse recruiter</strong></td>
                  <td>You</td>
                  <td>About $1,500 a month plus about 10% of first-year salary (Fortune, 2026)</td>
                  <td><span className="tag-pill pill-red">Costly</span> Same inboxes, higher bill</td>
                </tr>
                <tr>
                  <td><strong>Email to the hiring manager</strong></td>
                  <td>Nobody in between</td>
                  <td>Your time</td>
                  <td><span className="tag-pill pill-green">Best route</span> Reaches the person who decides</td>
                </tr>
              </tbody>
            </table>
            <p>Paying someone to job hunt for you is covered in depth in our report on <Link to="/reports/hire-someone-to-apply-for-jobs-2026">paying someone to apply for jobs</Link>. This report stays on consultancies.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Do Job Consultancies Charge Freshers? They Should Not</div>
                <div className="sec-sub">Is it safe to pay a job consultancy? For a job in India, no</div>
              </div>
            </div>
            <p>If the employer pays a consultancy to fill a role, there is only one reason it would also bill you: you are the business. Money flowing from a fresher to a consultancy is the clearest warning sign in this whole market.</p>
            <p>The requests come dressed up. Each name below means the same thing: pay us first.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Registration fee.</strong> "Pay to get into our database." A real consultancy wants good candidates in its database for free.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Guaranteed placement.</strong> No one can guarantee an employer will hire you. A guarantee with a price tag is a sales pitch.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Offer letter, then a fee.</strong> An offer arrives fast, then comes a processing, documentation or verification charge before you can join.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Paid training first.</strong> A course or certification you must buy before they will put you forward for any role.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Security deposit.</strong> "Refundable once you join." Treat it as gone the moment you send it.</span></div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">Consultancy red flags, by how serious (Studojo editorial rating)</div>
              <div style={{ height: 320 }}>
                <canvas id="jcfFlagChart" />
              </div>
            </div>
            <div className="callout">
              <strong>The rule:</strong> for a job in India, if a consultancy asks you for money at any stage, walk away. No genuine role needs you to pay the people placing you in it.
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">What Consultancy Scams Look Like</div>
                <div className="sec-sub">Job consultancy in Bangalore for freshers, or anywhere else: the patterns repeat</div>
              </div>
            </div>
            <p>Searching for a job consultancy in Bangalore for freshers, or in Pune, Hyderabad or Delhi, does not change the rules. City does not change who should pay. The scams that use a consultancy front tend to follow a few scripts.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>The big-name tie-up.</strong> The caller claims a direct line into a famous company, runs a short phone "interview", and sends an offer within a day. Then the fee appears.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The training trap.</strong> You pay for a course with placement "included". The course happens. The placement does not.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The chat-only recruiter.</strong> Everything runs on WhatsApp or Telegram, no company email, no office you can visit, no employer name until you pay.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The overseas package.</strong> A job abroad plus visa "processing" for a large fee, from an agent who is not registered with the Ministry of External Affairs.</span></div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Red flag</th>
                  <th>What a genuine consultancy does</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="tag-pill pill-red">Fee</span> Asks you to pay to register, train or process</td>
                  <td>Charges the employer, never the fresher, for a job in India</td>
                </tr>
                <tr>
                  <td><span className="tag-pill pill-red">Vague</span> Will not name the employer</td>
                  <td>Names the company and the role, which you can confirm on the company's own site</td>
                </tr>
                <tr>
                  <td><span className="tag-pill pill-red">Rushed</span> Offer letter before any real interview</td>
                  <td>Sends you to interviews run by the employer</td>
                </tr>
                <tr>
                  <td><span className="tag-pill pill-red">Hidden</span> Chat apps only, personal phone numbers</td>
                  <td>Uses a company email domain and a verifiable office</td>
                </tr>
                <tr>
                  <td><span className="tag-pill pill-red">Unregistered</span> Overseas jobs from an agent not on eMigrate</td>
                  <td>Shows its MEA registration licence number for overseas recruitment</td>
                </tr>
              </tbody>
            </table>
            <p>For the wider picture, from task scams to pay-to-join internships and fake offer letters, read <Link to="/reports/job-scam-report-fake-internships-task-scams-students-2026">The Job Scam Report</Link>. To check a specific offer in five minutes, use <Link to="/reports/fake-job-internship-scams-2026">How to Spot a Fake Job or Internship</Link>.</p>
            <div className="highlight">
              Already paid? Report it at <strong>cybercrime.gov.in</strong> or call <strong>1930</strong>, the national cybercrime helpline run under the Ministry of Home Affairs (I4C). Report as fast as you can.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Jobs Abroad: The eMigrate Check</div>
                <div className="sec-sub">Overseas recruiting agents must be registered with the Ministry of External Affairs</div>
              </div>
            </div>
            <p>Jobs abroad have a legal test that domestic consultancies do not. Under Section 10 of the Emigration Act, 1983, anyone who recruits people in India for employment abroad must register with the Protector General of Emigrants, part of the Ministry of External Affairs (MEA).</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Check the list.</strong> The MEA tells job seekers to go to emigrate.gov.in and open the "List of active RA" (registered recruiting agents) to confirm the agent.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Ask for the licence number.</strong> Registered agents have one, and the MEA says it should be displayed at their premises and in their advertisements.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Know the charge is capped.</strong> The Emigration Rules cap the service charge a registered agent can take from you, and the agent must give a receipt. The cap has been revised over time, so confirm the current figure on eMigrate or with a Protector of Emigrants office.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Unregistered means illegal.</strong> The MEA treats recruitment by unregistered agents as a violation of the Act, and refers such cases to the police.</span></div>
            </div>
            <div className="callout">
              <strong>Check the official site:</strong> rules and caps change. Before you pay anyone or hand over a passport for a job abroad, confirm the agent on emigrate.gov.in. Complaints can be filed through eMigrate, and the MEA's Overseas Workers Resource Centre helpline is 1800 11 3090.
            </div>
            <p>If a job abroad is your goal, our report on <Link to="/reports/how-to-get-a-job-abroad-from-india-2026">how to get a job abroad from India</Link> covers visas, pay floors and who to email.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">You Do Not Need a Middleman</div>
                <div className="sec-sub">Placement agency for freshers vs emailing the hiring manager</div>
              </div>
            </div>
            <p>Even the best consultancy sends your resume into the same pile as everyone else's: an HR inbox, for roles it is already paid to fill. An average opening draws about 242 applications, and the typical online application succeeds at roughly 0.1% to 2% (The Interview Guys, April 2026, citing Business Insider data for the 242 figure).</p>
            <p>Auto-apply bots and spray-and-pray applications do not fix that. They just add volume to piles nobody reads closely, and recruiters say they catch bot applications with hidden instructions planted in job posts (NBC News, November 2024).</p>
            <div className="chart-two">
              <div className="chart-wrap">
                <div className="chart-label">Layers between you and the hiring manager (illustrative)</div>
                <div style={{ height: 260 }}>
                  <canvas id="jcfHopsChart" />
                </div>
              </div>
              <div className="chart-wrap">
                <div className="chart-label">How much control you keep, 1 to 5 (Studojo editorial rating)</div>
                <div style={{ height: 260 }}>
                  <canvas id="jcfControlChart" />
                </div>
              </div>
            </div>
            <p>What works is emailing the person who actually hires: the hiring manager or team lead. Keep it short, personal and specific, send it from your own email address, and follow up once. No fee, no middleman, and you decide who sees you and what they read.</p>
            <p>Studojo does this for you. It finds the person who can actually hire you (the hiring manager or team lead, not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail. 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026). Replies are not guaranteed, and nobody honest will promise you one.</p>
            <div className="pull-quote">
              <p>"If someone has to be paid to stand between you and the hiring manager, ask why they need to be there at all."</p>
              <span className="pq-source">The Studojo view on middlemen</span>
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">Job consultancy questions freshers ask most, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>Four rules for dealing with consultancies</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>A consultancy can be a free extra channel. It should never be your plan, and it should never cost you money:</p>
            <div className="blist">
              {[
                ["Pay nothing for a job in India", "Any fee, deposit or paid training is a reason to walk away."],
                ["Verify every overseas agent", "Check emigrate.gov.in and the licence number before you pay a capped charge or share a passport."],
                ["Confirm the employer yourself", "If they will not name the company, or the company's site does not show the role, stop."],
                ["Go to the person who decides", "A short, personal email to the hiring manager, from your own Gmail, with one follow-up."],
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
              <Link to="/reports/hire-someone-to-apply-for-jobs-2026" className="related-card">
                <div className="rc-kicker">Done for you</div>
                <div className="rc-title">Paying Someone to Apply for Jobs: Reverse Recruiters, Apply Services and Bots, Costed</div>
              </Link>
              <Link to="/reports/job-scam-report-fake-internships-task-scams-students-2026" className="related-card">
                <div className="rc-kicker">Scams</div>
                <div className="rc-title">The Job Scam Report: Fake Internships, Pay-to-Join Offers and Task Scams</div>
              </Link>
              <Link to="/reports/how-to-get-a-job-as-a-fresher-india-2026" className="related-card">
                <div className="rc-kicker">Freshers</div>
                <div className="rc-title">How to Get a Job as a Fresher in India, 2026</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Skip the middleman.</h3>
              <p>Studojo finds the person who can actually hire you, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/b2cnew/join?via=report-job-consultancy-for-freshers-india-2026&how=voice" reloadDocument className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
