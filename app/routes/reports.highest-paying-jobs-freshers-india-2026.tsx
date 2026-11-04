import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Highest Paying Jobs for Freshers in India 2026: By Degree, and What You Take Home | Studojo" },
    { name: "description", content: "The highest paying fresher jobs in India for 2026, by degree: product SDE, quant, consulting, CA, data and sales. Real CTC ranges, the in-hand gap, and why the average offer is still about 3.5 LPA." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "highest paying jobs in india for freshers, highest salary jobs for freshers, best paying entry level jobs india, highest paying jobs after graduation india, fresher salary india 2026, highest salary after btech, highest salary after bcom, ctc vs in hand fresher" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/highest-paying-jobs-freshers-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Highest Paying Jobs for Freshers in India 2026: By Degree, and What You Take Home" },
    { property: "og:description", content: "Product SDE, quant, consulting, CA, data and sales: what the top fresher roles in India pay, how few people land them, and what a big CTC pays in hand." },
    { property: "og:url", content: `${BASE_URL}/reports/highest-paying-jobs-freshers-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-06T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Highest Paying Jobs for Freshers in India 2026 | Studojo" },
    { name: "twitter:description", content: "The top fresher roles by degree, their real CTC ranges, and the gap between the headline and your monthly in-hand." },
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
  const RED = "#ef4444";
  const GREEN = "#10b981";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: reported fresher pay points, LPA (Indeed, GetWork, Business Today, Infosys via Storyboard18, ICAI via Taxscan, IIT Bombay via FPJ, IIM Ahmedabad via InsideIIM)
  const payEl = document.getElementById("hpjPayChart") as HTMLCanvasElement | null;
  if (payEl && !payEl.dataset.rendered) {
    payEl.dataset.rendered = "1";
    new Chart(payEl, {
      type: "bar",
      data: {
        labels: [
          "Avg fresher package, GetWork FY25",
          "TCS trainee (ASET), 2026",
          "Avg fresher offer, Indeed 2025",
          "Infosys Digital Specialist Engineer",
          "Infosys Specialist Programmer L1",
          "ICAI campus average, new CAs",
          "IIT Bombay median, 2024-25",
          "Infosys Specialist Programmer L3",
          "IIM Ahmedabad median fixed pay, 2026",
        ],
        datasets: [{
          label: "LPA",
          data: [3.22, 3.36, 3.5, 7, 11, 12.49, 20, 21, 29.07],
          backgroundColor: [VIOLET3, VIOLET3, VIOLET3, VIOLET2, VIOLET2, VIOLET2, VIOLET, VIOLET, VIOLET],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} lakh a year (CTC or fixed, as reported)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v} L` } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: IIT Bombay 2024-25 registered students by outcome (IIT Bombay placement report via Free Press Journal)
  const topEl = document.getElementById("hpjTopBandChart") as HTMLCanvasElement | null;
  if (topEl && !topEl.dataset.rendered) {
    topEl.dataset.rendered = "1";
    new Chart(topEl, {
      type: "doughnut",
      data: {
        labels: ["Accepted 20 LPA or more", "Accepted below 20 LPA", "Sat placements, no offer accepted", "Registered, did not sit placements"],
        datasets: [{
          data: [705, 717, 618, 429],
          backgroundColor: [VIOLET, VIOLET3, RED, MUTED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${Number(ctx.raw).toLocaleString("en-IN")} of 2,469 registered students` } },
        },
      },
    });
  }

  // Chart 3: headline CTC per month vs modelled monthly in-hand (Studojo CTC Illusion model; Business Today Nov 2025 calculator)
  const handEl = document.getElementById("hpjInHandChart") as HTMLCanvasElement | null;
  if (handEl && !handEl.dataset.rendered) {
    handEl.dataset.rendered = "1";
    new Chart(handEl, {
      type: "bar",
      data: {
        labels: ["12 LPA offer", "15 LPA offer", "20 LPA startup offer"],
        datasets: [
          {
            label: "CTC divided by 12",
            data: [100000, 125000, 166700],
            backgroundColor: VIOLET3,
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            label: "Monthly in-hand",
            data: [73900, 98250, 99000],
            backgroundColor: GREEN,
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ₹${Number(ctx.raw).toLocaleString("en-IN")}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `₹${Number(v).toLocaleString("en-IN")}` } },
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

  .divider { height: 2px; background: #f0f0f0; margin: 24px 0; border-radius: 2px; }

  .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e5e5; }
  .data-table th { background: #171717; color: #f8f6f1; font-weight: 700; padding: 11px 16px; text-align: left; letter-spacing: 0.5px; }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #404040; vertical-align: top; line-height: 1.55; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:nth-child(even) td { background: #fafafa; }
  .tag-pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .pill-amber { background: #fef3c6; color: #92400e; }
  .pill-green { background: #d0fae4; color: #065f46; }

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
    q: "Which job has the highest salary for freshers in India?",
    a: "The highest fresher salaries in India come from quant trading and high-frequency trading firms hiring from IITs, followed by software engineering at top product companies, strategy consulting and investment banking. Quant firms make the largest campus offers, often running into crores for a handful of students (Careers360 and IIT placement reports). For a more reachable benchmark, a fresher SDE-1 at Amazon India self-reports about 14.5 lakh to 30 lakh a year on AmbitionBox, and McKinsey's undergraduate Business Analyst role is estimated at about 14 lakh to 21 lakh (Hacking the Case Interview).",
  },
  {
    q: "What is the average salary of a fresher in India?",
    a: "The average fresher salary in India is about 3 lakh to 3.5 lakh a year. Indeed's hiring tracker put the average offer for the class of 2025 at 3.5 LPA, against the 3.8 LPA freshers expected, and GetWork's FY25 data put the average fresher package at 3.22 LPA. At the large IT services firms, a TCS trainee starts at about 3.36 LPA in 2026 (Business Today, February 2026).",
  },
  {
    q: "Which degree gives the highest salary for freshers in India?",
    a: "A BTech in computer science from a top institute gives the highest fresher salaries on average, with IIT Bombay reporting a median of 20 LPA in 2024-25 (IIT Bombay placement report, via Free Press Journal). Outside engineering, the CA qualification is the strongest commerce route: ICAI's campus drive for newly qualified CAs reported an average of 12.49 LPA (Taxscan, December 2024). An MBA from a top IIM pays more, with IIM Ahmedabad's 2026 median fixed pay at about 29 lakh, but most MBA students are not true freshers.",
  },
  {
    q: "Can a fresher get 10 LPA or 20 LPA in India?",
    a: "Yes, but it is the top slice of the market, not the norm. Infosys pays 11 LPA to 21 LPA for its Specialist Programmer trainee levels (Storyboard18, 2026), and 705 of IIT Bombay's 1,422 placed students in 2024-25 accepted offers of 20 LPA or more. Against that, the average fresher offer across India is about 3.5 LPA (Indeed, 2025), so a 10 LPA offer puts you far above the typical graduate.",
  },
  {
    q: "How much is 12 LPA in hand per month for a fresher?",
    a: "A typical 12 LPA fresher offer pays about 73,900 a month in hand, roughly 74% of the 1 lakh a month the headline suggests. That is from Studojo's CTC model assuming 10.5 lakh fixed, 1 lakh variable and a 50,000 joining bonus under the new tax regime. The rest is employer PF, gratuity, insurance, variable pay and one-time money.",
  },
  {
    q: "Which non-IT jobs pay freshers the most in India?",
    a: "Among non-IT routes, chartered accountancy, strategy consulting, investment banking and sales roles with incentives pay freshers the most. Newly qualified CAs averaged 12.49 LPA on ICAI's campus drive, with a top domestic offer of 32.33 LPA in the December 2025 to January 2026 drive (ICAI). Sales roles start lower, with entry SDR base pay near 4.4 LPA (PayScale), but variable pay can lift total earnings for strong performers. GetWork's FY25 data also found sales and finance roles offered the highest entry salaries on its platform.",
  },
];

export default function HighestPayingJobsFreshersReport() {
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
        "headline": "Highest Paying Jobs for Freshers in India 2026: By Degree, and What You Take Home",
        "description": "The highest paying fresher jobs in India for 2026, by degree, with real CTC ranges, how few people land them, and the gap between CTC and in-hand pay.",
        "url": `${BASE_URL}/reports/highest-paying-jobs-freshers-india-2026`,
        "datePublished": "2026-11-06T00:00:00Z",
        "dateModified": "2026-11-06T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/highest-paying-jobs-freshers-india-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Highest Paying Jobs for Freshers in India 2026", "item": `${BASE_URL}/reports/highest-paying-jobs-freshers-india-2026` },
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
            <div className="rpt-badge">Studojo Research · November 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Highest Paying Jobs for Freshers, India 2026</span>
            </nav>
            <h1>Highest Paying Jobs for Freshers in India 2026: <em>By Degree</em>, and What You Take Home</h1>
            <p className="rpt-hero-sub">
              Product SDE, quant, consulting, CA, data and sales. What the top fresher roles in
              India actually pay, how few graduates land them, and how much of a big CTC reaches
              your bank account each month.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Freshers and new graduates</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Data</span>
                <span className="rpt-meta-value">Placement reports, ICAI, Indeed, AmbitionBox</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">6 November 2026</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The top fresher jobs in India</strong> are quant trading, SDE roles at product companies, strategy consulting, investment banking, product management, data science, chartered accountancy and incentive-heavy sales.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The typical fresher earns about 3.5 LPA.</strong> Indeed put the class of 2025's average offer at 3.5 LPA and GetWork's FY25 average was 3.22 LPA. A TCS trainee starts near 3.36 LPA.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The top band is narrow even at the top college.</strong> At IIT Bombay in 2024-25, 705 of 2,469 registered students accepted offers of 20 LPA or more.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Outside engineering, CA is the strongest route:</strong> ICAI's campus drive averaged 12.49 LPA for newly qualified CAs, with a top domestic offer of 32.33 LPA in the latest drive.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>CTC is not take-home.</strong> A 12 LPA offer pays about 73,900 a month in hand, and a 20 LPA startup offer with ESOPs about 99,000 (Studojo CTC model).</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">3.5 LPA</div>
              <div className="sc-label">average offer to India's class of 2025 freshers, against 3.8 LPA expected</div>
              <div className="sc-source">Indeed Hiring Tracker, via People Matters, Apr 2025</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">705</div>
              <div className="sc-label">of 2,469 registered IIT Bombay students accepted 20 LPA or more in 2024-25</div>
              <div className="sc-source">IIT Bombay placement report, via Free Press Journal</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">74%</div>
              <div className="sc-label">of a 12 LPA offer's headline monthly figure reaches you in hand</div>
              <div className="sc-source">Studojo CTC Illusion model, 2026</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">The Highest Paying Fresher Jobs, Ranked</div>
                <div className="sec-sub">Eight routes, from quant desks to sales floors</div>
              </div>
            </div>
            <p>Here are the roles that pay Indian freshers the most, with the ranges that public data supports. Two warnings first. Company-level numbers on AmbitionBox and Glassdoor are self-reported, often from small samples, so treat them as indicative. And the headline is usually CTC, not cash in hand (more on that in section 6).</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Indicative fresher pay</th>
                  <th>Where the number comes from</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Quant trader or quant developer (HFT firms)</td><td>Often 1 crore plus for a few IIT hires</td><td>IIT placement reports; Careers360, Aug 2026 <span className="tag-pill pill-amber">Very rare</span></td></tr>
                <tr><td>SDE at a top product company</td><td>About 14.5 to 30 lakh (Amazon SDE-1, fresher)</td><td>AmbitionBox, self-reported, small sample</td></tr>
                <tr><td>Strategy consulting analyst (undergrad)</td><td>About 14 to 21 lakh (McKinsey Business Analyst)</td><td>Hacking the Case Interview estimate</td></tr>
                <tr><td>Investment banking analyst</td><td>Roughly 12 to 25 lakh plus bonus at global banks</td><td>Salary-guide compilations; ranges vary widely</td></tr>
                <tr><td>Associate product manager</td><td>About 8 to 22 lakh; 15 to 25 lakh at top firms</td><td>EICTA, IIT Kanpur</td></tr>
                <tr><td>Chartered accountant (newly qualified)</td><td>12.49 lakh average on campus</td><td>ICAI 60th campus drive, via Taxscan <span className="tag-pill pill-green">Official</span></td></tr>
                <tr><td>Data scientist</td><td>Typically 5 to 8 lakh; more at product firms</td><td>Salary guides citing AmbitionBox and Glassdoor</td></tr>
                <tr><td>Sales with incentives (SaaS SDR, B2B)</td><td>About 4 to 7 lakh base plus variable</td><td>PayScale; Wisemonk hiring guide</td></tr>
              </tbody>
            </table>
            <p>To put these against the wider market, the chart below lines up hard, published pay points: national averages at the bottom, special hiring tracks in the middle, and top-campus medians at the top.</p>
            <div className="chart-wrap">
              <div className="chart-label">Reported fresher pay points, lakh per year (sources in the note below)</div>
              <div style={{ height: 360 }}>
                <canvas id="hpjPayChart" />
              </div>
            </div>
            <div className="callout">
              <strong>The honest read:</strong> the jump from the national average (about 3.5 LPA) to the top campus medians (20 to 29 lakh) is six to eight times. Most of the "highest paying jobs" lists you see online describe that top slice as if it were normal. It is not.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Indeed Hiring Tracker via People Matters (Apr 2025); GetWork FY25 data via StartupTalky (May 2025); Business Today (Feb 2026); Infosys tracks via Storyboard18 (2026); ICAI 60th campus drive via Taxscan (Dec 2024); IIT Bombay 2024-25 placement report via Free Press Journal; IIM Ahmedabad 2026 final placements via InsideIIM (Sep 2026); AmbitionBox; Hacking the Case Interview; EICTA IIT Kanpur; PayScale.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">BTech: Product, Quant, and the Special Tracks</div>
                <div className="sec-sub">Engineering still holds the most high-paying fresher seats</div>
              </div>
            </div>
            <p>Engineering, and computer science in particular, is where most high-paying fresher jobs sit. The India Skills Report 2026 rates computer science engineers as 80% employable and IT engineers 78%, the highest of any group it measured (India Skills Report 2026, via Careers360, November 2025). It also found the IT sector accounts for 35% of fresher hiring intent.</p>
            <p>At the very top are quant trading firms. At IIT Kharagpur, about 38 quant firms made internship offers in the first two days of the 2026 season, up from about 20 a year earlier, and names like Jane Street, Optiver, IMC, Quadeye and Graviton now compete with Google and Microsoft for the same students (Careers360, August 2026). These offers go to a few dozen students per IIT, not thousands.</p>
            <p>The next tier is software engineering at product companies. AmbitionBox shows fresher SDE-1 pay at Amazon India at about 14.5 lakh to 30 lakh a year, from only 7 reported salaries, so read it as a range rather than a promise. At the top campus, IIT Bombay reported an average of 26.45 lakh and a median of 20 lakh across 1,422 placed students in 2024-25 (IIT Bombay placement report, via Free Press Journal).</p>
            <p>The most reachable high-pay route for most BTech students is a special track at a large employer. Infosys pays trainees 7 lakh as a Digital Specialist Engineer and 11 lakh, 16 lakh and 21 lakh at Specialist Programmer levels 1, 2 and 3 (Storyboard18, 2026). Compare that with the mass-hiring trainee role at TCS, which pays about 3.36 lakh in 2026, only about 20,000 more than in 2007 (Business Today, February 2026).</p>
            <div className="highlight">
              The same company can pay a fresher 3.6 lakh or 21 lakh depending on which test and which track you clear. Ask which track an offer is for, not just which company.
            </div>
            <div className="callout">
              <strong>For a BTech fresher:</strong> the realistic high-pay targets are product company SDE roles and the specialist tracks at large firms. Quant is real but narrow. Plan for it only if you are already near the top of a competitive programming or maths cohort.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: India Skills Report 2026 via Careers360 (Nov 2025); Careers360 IIT internship report (Aug 2026); AmbitionBox Amazon SDE-1 fresher salaries (self-reported); IIT Bombay 2024-25 placement report via Free Press Journal; Storyboard18 (2026); Business Today (Feb 2026).</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">BCom, CA, BBA and MBA: Where Commerce Pays</div>
                <div className="sec-sub">The CA exam and a top MBA are the two big multipliers</div>
              </div>
            </div>
            <p>For commerce students, the single strongest pay lever is qualifying as a chartered accountant. In ICAI's 60th campus placement programme, for those who cleared the May 2024 exams, 15,266 candidates registered, 4,782 offers were made and 3,705 were accepted, at an average CTC of 12.49 lakh, barely up from 12.45 lakh the year before (Taxscan, December 2024). The highest domestic offer in that drive was 26.5 lakh, from Power Finance Corporation. In the December 2025 to January 2026 drive, ICAI reports a highest domestic offer of 32.33 lakh (ICAI Career Counselling and Guidance portal).</p>
            <p>Notice the gap in those numbers: fewer than a quarter of registered candidates accepted a campus offer in the 60th drive. Others may have taken jobs off campus, but the campus average describes the ones who did get placed, not every new CA.</p>
            <p>A BCom alone, without CA, sits much closer to the national fresher average. The India Skills Report 2026 rated commerce graduates 62.81% employable, up from 55% the year before, but did not publish salary data. GetWork's FY25 analysis found sales and finance roles offered the highest entry-level salaries on its platform, though its overall fresher average was only 3.22 lakh and its highest fresher salary was 10 lakh.</p>
            <p>An MBA from a top IIM pays far more, but most of those students are not freshers in the strict sense. At IIM Ahmedabad's 2026 final placements, 392 offers were accepted with a median fixed yearly cash of about 29.07 lakh and a median maximum earning potential of 37 lakh. Consulting took 155 offers at a median MEP of 39.04 lakh, and finance and BFSI 82 offers at a median of 40 lakh (InsideIIM, September 2026). Accenture Strategy (36), BCG (33) and McKinsey (21) were among the largest recruiters.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Reported pay</th>
                  <th>Who it covers</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Newly qualified CA, ICAI campus</td><td>12.49 lakh average; 26.5 lakh top</td><td>3,705 accepted offers, 60th drive</td></tr>
                <tr><td>Newly qualified CA, latest drive</td><td>32.33 lakh top domestic offer</td><td>December 2025 to January 2026</td></tr>
                <tr><td>IIM Ahmedabad MBA, all offers</td><td>29.07 lakh median fixed; 37 lakh median MEP</td><td>392 offers, 2026</td></tr>
                <tr><td>IIM Ahmedabad, consulting</td><td>39.04 lakh median MEP</td><td>155 offers, 2026</td></tr>
                <tr><td>Fresher average, GetWork platform</td><td>3.22 lakh</td><td>Jobs posted on GetWork, FY25</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>For a BCom student:</strong> the CA qualification roughly triples the national fresher average on campus. If you are weighing an MBA, remember the IIM numbers come after a hard entrance exam and, for many, a few years of work. They are not first-job numbers for most people.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Taxscan on ICAI's 60th Campus Placement Programme (Dec 2024); ICAI CCG placement portal (ccg.icai.org); India Skills Report 2026 via Careers360; GetWork FY25 via StartupTalky (May 2025); IIM Ahmedabad 2026 final placements via InsideIIM (Sep 2026).</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">BA, BSc and Any Degree: Consulting, Data, PM and Sales</div>
                <div className="sec-sub">Roles that hire on skill and output, not branch</div>
              </div>
            </div>
            <p>If you have a BA, BSc or another non-engineering degree, the high-paying fresher roles are fewer but they exist, and most of them care more about what you can show than what your degree says. The India Skills Report 2026 rated arts graduates 55.55% employable and science graduates 61%, both up from the year before.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Strategy consulting analyst.</strong> McKinsey's Business Analyst role is its entry point for undergraduates, with total pay estimated at about 14 lakh to 21 lakh (Hacking the Case Interview). These seats mostly go through top campuses and are very competitive.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Data analyst and data scientist.</strong> Salary guides that cite AmbitionBox and Glassdoor put typical fresher pay at about 5 lakh to 8 lakh, with Glassdoor-based ranges of 6 lakh to 14 lakh at stronger employers. Reported ranges vary, and many of these guides are written by course sellers.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Associate product manager.</strong> EICTA at IIT Kanpur puts fresher and APM pay at about 8 lakh to 22 lakh, with top product companies at 15 lakh to 25 lakh, mostly through campus programmes.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Sales with incentives.</strong> PayScale puts the entry-level SDR average near 4.4 lakh base, and Wisemonk's B2B SaaS hiring guide gives 4.5 lakh to 7 lakh for junior roles. Variable pay sits on top, and a live founding-SDR posting offered 4 lakh to 6 lakh plus uncapped incentives.</span></div>
            </div>
            <p>Sales is the one route on this list that does not depend on your college at all. The base is modest, but the variable part rewards output, and the role teaches the skill every other high-paying job also needs: getting a busy person to reply.</p>
            <div className="callout">
              <strong>Check the split:</strong> in sales and incentive-heavy roles, ask what share of the CTC is fixed, what the quota is, and what share of the team hit target last year. A high on-target number with a quota nobody hits is a low salary.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: India Skills Report 2026 via Careers360; Hacking the Case Interview, McKinsey India recruiting; salary guides citing AmbitionBox and Glassdoor (ITM, Masai School); EICTA IIT Kanpur; PayScale India SDR data; Wisemonk SDR hiring guide.</p>
          </div>
          <StuCta via="report-highest-paying-jobs-freshers-india-2026" place="report-mid" size="quiet" title="Stu finds the best-paying roles that fit your degree and the people hiring for them." />

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">How Few Freshers Actually Land the Top Band</div>
                <div className="sec-sub">The median fresher is nowhere near the headline offers</div>
              </div>
            </div>
            <p>The pay numbers above are real, but they describe a thin layer. Across India, the average fresher offer for the class of 2025 was 3.5 LPA, below the 3.8 LPA freshers expected, and nearly 60% of employers who raised fresher pay said the raise was only about 5% (Indeed Hiring Tracker, via People Matters, April 2025). GetWork's FY25 data put the average fresher package at 3.22 lakh, from 3.12 lakh in FY24, with Mumbai highest at 4.29 lakh.</p>
            <p>Even getting placed is not a given. AICTE data for 2019-20 to 2022-23 showed about 1.64 million of roughly 3.43 million undergraduate engineering students were placed, 47.7% (ThePrint, March 2025). The Centre told Parliament it does not keep year-wise data on how many engineering graduates find jobs after their degree.</p>
            <p>Now look at the best-placed college in the country. IIT Bombay had 2,469 students register for placements in 2024-25. Of them, 2,040 took part and 1,422 accepted offers. Only 705 accepted offers of 20 LPA or more. That is 29% of registered students at the most sought-after engineering campus in India.</p>
            <div className="chart-wrap">
              <div className="chart-label">IIT Bombay 2024-25: what happened to 2,469 registered students</div>
              <div style={{ height: 300 }}>
                <canvas id="hpjTopBandChart" />
              </div>
            </div>
            <div className="pull-quote">
              <p>"The highest paying fresher jobs are real. They are also a top-college, top-percentile outcome, and the typical first offer in India is still about 3.5 lakh."</p>
              <span className="pq-source">The takeaway from the 2025 and 2026 placement and hiring data</span>
            </div>
            <div className="callout">
              <strong>What this means:</strong> aim high, but plan your search around the market you are actually in. If your college does not get quant firms or McKinsey on campus, those seats are not closed to you, but you will need a different way in than the placement cell.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Indeed Hiring Tracker via People Matters (Apr 2025); GetWork FY25 via StartupTalky (May 2025); AICTE data via ThePrint (Mar 2025); IIT Bombay 2024-25 placement report via Free Press Journal.</p>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">CTC vs In-Hand: What You Actually Take Home</div>
                <div className="sec-sub">The headline number is a budget, not your salary</div>
              </div>
            </div>
            <p>Every number in a "highest paying jobs" list is a CTC, and CTC is what the company budgets for you, not what lands in your account. It includes employer PF, a gratuity provision, insurance, variable pay and often a one-time joining bonus. Studojo's own model in{" "}
              <Link to="/reports/ctc-illusion-report-what-12-lpa-pays-in-hand-2026" style={{ color: "#6d28d9", fontWeight: 600 }}>The CTC Illusion Report</Link>{" "}
              found a typical 12 LPA fresher offer pays about 73,900 a month in hand, about 74% of the 1 lakh a month the headline implies. A 20 LPA startup offer with ESOPs pays about 99,000 a month in guaranteed cash, 59% of the headline.</p>
            <div className="chart-wrap">
              <div className="chart-label">Headline CTC per month vs monthly in-hand, in rupees</div>
              <div style={{ height: 300 }}>
                <canvas id="hpjInHandChart" />
              </div>
            </div>
            <p>The labour codes made this gap slightly wider. Since 21 November 2025, wages must be at least half of total pay, which raises PF inside the same CTC. Business Today's November 2025 calculator showed annual in-hand at a 15 lakh CTC falling from about 12.43 lakh to about 11.79 lakh, or roughly 98,000 a month.</p>
            <p>Top-campus numbers have the same gap built in. IIM Ahmedabad reports three figures for its 2026 batch: median fixed yearly cash of about 29.07 lakh, median guaranteed cash of 32.5 lakh, and median maximum earning potential of 37 lakh (InsideIIM, September 2026). The 37 lakh headline includes money that depends on bonuses and performance.</p>
            <div className="highlight">
              Compare offers on fixed monthly in-hand pay. Then treat variable pay, joining bonuses and ESOPs as separate bets with their own odds. Two offers 2 lakh apart on paper can pay almost the same each month.
            </div>
            <div className="callout">
              <strong>Before you accept:</strong> ask for the salary annexure that lists every component. If a recruiter will only quote the CTC, that tells you something about the offer.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Studojo, The CTC Illusion Report (2026); Business Today salary calculator (Nov 2025); IIM Ahmedabad 2026 final placements via InsideIIM (Sep 2026).</p>
          </div>

          {/* Section 7 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">7</div>
              <div>
                <div className="sec-title">What Actually Gets People Into These Roles</div>
                <div className="sec-sub">Tests, internships, proof of work, and a person who says yes</div>
              </div>
            </div>
            <p>Looking across the data, the people who land top-paying first jobs tend to get there through a small number of doors. None of them is "apply to more listings".</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>A hard filter you can prepare for.</strong> The CA exam, the coding tests behind Infosys's Specialist Programmer tracks, and CAT for the IIMs all act as gates. Pay jumps sharply once you pass them, from about 3.6 lakh to 11 lakh or more at the same company, or to a 12.49 lakh campus average for new CAs.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Internships that turn into offers.</strong> IIT Bombay recorded 260 pre-placement offers in 2024-25, and quant firms now recruit largely through summer internships (Careers360, August 2026). The India Skills Report 2026 found 92.8% of students want practical exposure before they graduate.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Visible proof of skill.</strong> Product, data and PM roles hire on what you can show: shipped projects, analyses, a portfolio. Employers increasingly look past the degree to the work.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Reaching the decision-maker off campus.</strong> If your college does not attract these employers, the job board is a long queue. Writing directly to the team lead or hiring manager who owns the role gets your work in front of the one person who can say yes.</span></div>
            </div>
            <div className="callout">
              <strong>The pattern:</strong> high-paying fresher jobs are rarely won by volume. They go to people who cleared a specific bar and then got in front of a specific person, on campus or off it.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Storyboard18 (2026); Taxscan on ICAI (Dec 2024); IIT Bombay 2024-25 placement report via Free Press Journal; Careers360 (Aug 2026); India Skills Report 2026 via Careers360.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">What people ask about the highest paying fresher jobs in India</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to chase a high first salary without fooling yourself</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The data points to a simple plan for an Indian fresher who wants a well-paid first job:</p>
            <div className="blist">
              {[
                ["Pick the gate that fits your degree", "BTech: product SDE roles and specialist tracks. Commerce: the CA exam. Any degree: consulting, data, PM or incentive-based sales. Prepare for that one bar seriously."],
                ["Know the real baseline", "The average fresher offer is about 3.5 LPA. Anything near 10 LPA puts you well above most graduates, so judge offers against the market, not against viral packages."],
                ["Compare in-hand, not CTC", "A 12 LPA offer pays about 73,900 a month. Ask for the annexure and work out fixed monthly cash before you decide."],
                ["Get an internship that can convert", "Pre-placement offers and summer internships are how many top offers are actually made."],
                ["Reach the person who hires", "If the top employers do not come to your campus, write to the hiring manager or team lead directly with proof of what you can do."],
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
              <Link to="/reports/ctc-illusion-report-what-12-lpa-pays-in-hand-2026" className="related-card">
                <div className="rc-kicker">Salary</div>
                <div className="rc-title">The CTC Illusion Report: What a 12 LPA Offer Actually Pays In Hand</div>
              </Link>
              <Link to="/reports/first-1-lakh-month-report-fastest-paths-students-2026" className="related-card">
                <div className="rc-kicker">Earnings</div>
                <div className="rc-title">The First ₹1 Lakh/Month Report: The Fastest Paths Students Actually Use</div>
              </Link>
              <Link to="/reports/service-vs-product-company-report-5-years-later-2026" className="related-card">
                <div className="rc-kicker">Career paths</div>
                <div className="rc-title">Service vs Product Company: IT Services vs Startups vs Product Firms, 5 Years Later</div>
              </Link>
            </div>
          </div>
          <StuCta via="report-highest-paying-jobs-freshers-india-2026" place="report-end" size="card" title="Want the better-paying roles that fit you?" line="Tell Stu the role, the city and the pay you want in one short call. Stu finds jobs that fit you, finds who's hiring and writes the email to them." />
        </div>
      </main>
      <Footer />
    </>
  );
}
