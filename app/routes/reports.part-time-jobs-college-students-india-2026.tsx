import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Part-Time and Work-From-Home Jobs for College Students in India, 2026: The Real Ones and the Scams | Studojo" },
    { name: "description", content: "Part-time and work-from-home jobs for students in India, 2026: what tutoring, freelancing, delivery, AI training and internships really pay, and how to spot the task scams that cost Indians ₹222 crore in four months." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "part time jobs for students, work from home jobs for students, online jobs for students without investment, part time jobs for college students india, earn money online students, task scam India, part time job scam" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/part-time-jobs-college-students-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Part-Time and Work-From-Home Jobs for College Students in India, 2026: The Real Ones and the Scams" },
    { property: "og:description", content: "What real student jobs pay per hour, from ₹102 on a delivery app to ₹1,000 for tutoring, and the red flags that separate them from task scams." },
    { property: "og:url", content: `${BASE_URL}/reports/part-time-jobs-college-students-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-13T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Part-Time Jobs for College Students in India, 2026 | Studojo" },
    { name: "twitter:description", content: "The real part-time and online jobs for students, what they pay, and how to spot a task scam before it takes your money." },
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
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: indicative hourly earnings by student option (sources named in the chart label and text)
  const earnEl = document.getElementById("ptjEarnChart") as HTMLCanvasElement | null;
  if (earnEl && !earnEl.dataset.rendered) {
    earnEl.dataset.rendered = "1";
    new Chart(earnEl, {
      type: "bar",
      data: {
        labels: [
          "Delivery, after fuel and bike costs (union estimate)",
          "Delivery, gross average (Zomato, 2025)",
          "AI data recording (Objectways contributor)",
          "Home tutoring, platform average (Superprof)",
        ],
        datasets: [{
          label: "₹ per hour",
          data: [81, 102, 250, 1000],
          backgroundColor: [VIOLET3, VIOLET2, VIOLET2, VIOLET],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ₹${Number(ctx.raw).toLocaleString("en-IN")} per hour` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: cybercrime incidents registered on NCRP, in lakh (MHA reply in Lok Sabha, July 2025)
  const ncrpEl = document.getElementById("ptjNcrpChart") as HTMLCanvasElement | null;
  if (ncrpEl && !ncrpEl.dataset.rendered) {
    ncrpEl.dataset.rendered = "1";
    new Chart(ncrpEl, {
      type: "bar",
      data: {
        labels: ["2022", "2023", "2024"],
        datasets: [{
          label: "Incidents (lakh)",
          data: [10.29, 15.96, 22.68],
          backgroundColor: [VIOLET3, VIOLET2, RED],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} lakh incidents` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: losses by scam type, January to April 2024, in crore (I4C analysis released by MHA)
  const lossEl = document.getElementById("ptjScamLossChart") as HTMLCanvasElement | null;
  if (lossEl && !lossEl.dataset.rendered) {
    lossEl.dataset.rendered = "1";
    new Chart(lossEl, {
      type: "doughnut",
      data: {
        labels: ["Trading scams", "Investment (task-based) scams", "Digital arrest", "Romance / dating"],
        datasets: [{
          data: [1420.48, 222.58, 120.30, 13.23],
          backgroundColor: [VIOLET3, RED, VIOLET2, MUTED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ₹${ctx.raw} crore lost` } },
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
  .rpt-section .sc-source { font-size: 12px; color: #a3a3a3; font-weight: 500; line-height: 1.6; }
  .rpt-section .sc-source a { color: #8B5CF6; }
  .check-num { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 6px; background: #ef4444; color: #fff; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
`;

const FAQ = [
  {
    q: "Which part-time job is best for college students in India?",
    a: "The best part-time job for most college students is one that pays per hour for a skill you already have, such as tutoring, freelance writing or design, or a part-time internship. Tutoring averages around ₹1,000 an hour on Superprof's India data, with a wide range of ₹100 to ₹1,500 or more. Delivery apps are the easiest to start: Zomato says partners averaged ₹102 an hour in 2025 before tips, though a gig workers' union puts it nearer ₹81 after fuel and bike costs.",
  },
  {
    q: "How can a student earn money online without investment?",
    a: "You earn money online without investment by selling a real skill on a real platform: tutoring, writing, design, coding, translation, or AI training and data work. None of these ask you to pay to start. Internshala reported that 49% of internships on its platform in 2024 were work-from-home, with an average stipend of ₹8,000 a month. Any 'online job' that asks you to deposit money, even ₹500, to unlock tasks or withdraw earnings is a scam.",
  },
  {
    q: "Are work-from-home jobs for students real or fake?",
    a: "Many are real, but the ones that find you on WhatsApp or Telegram promising money for liking videos, rating products or writing reviews are almost always fake. In January to April 2024 alone, Indians lost ₹222.58 crore to task-based investment scams, according to I4C data released by the Ministry of Home Affairs. Real remote work comes through a known platform or company, involves a skill, and never asks you to pay.",
  },
  {
    q: "How much can a college student earn from part-time jobs in India?",
    a: "Most students earn somewhere between a few thousand and about ₹25,000 a month, depending on hours and skill. A Shriram Finance guide puts part-time delivery earnings at ₹7,000 to ₹25,000 a month, and Internshala's average internship stipend was ₹8,000 a month in 2024. Skilled online work pays more per hour: Outlier advertises $16.5 to $27.5 an hour on its Hindi-language page, but work is project-based and not guaranteed.",
  },
  {
    q: "What should I do if I paid money for a part-time job and got scammed?",
    a: "Call the national cybercrime helpline 1930 immediately and file a complaint at cybercrime.gov.in, then stop paying, however much the scammers say you need to 'withdraw' your balance. Speed matters because banks can freeze money still in transit: the government says over ₹5,489 crore has been saved through its fraud reporting system across more than 17.82 lakh complaints (MHA reply in Lok Sabha, July 2025).",
  },
  {
    q: "How many hours should a college student work part-time?",
    a: "Most students can keep up with classes on roughly 10 to 15 hours of paid work a week, which is a common rule of thumb rather than an Indian study. Flexible gig work makes this easier: Zomato says its average delivery partner worked only 38 days in 2025, about seven hours a day. Cut hours first in exam months, and avoid work that eats your sleep or attendance.",
  },
];

export default function PartTimeJobsStudentsReport() {
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
        "headline": "Part-Time and Work-From-Home Jobs for College Students in India, 2026: The Real Ones and the Scams",
        "description": "What real student jobs in India pay, from delivery and tutoring to freelancing and AI training work, and how to spot the task scams that target students.",
        "url": `${BASE_URL}/reports/part-time-jobs-college-students-india-2026`,
        "datePublished": "2026-11-13T00:00:00Z",
        "dateModified": "2026-11-13T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/part-time-jobs-college-students-india-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Part-Time Jobs for College Students in India, 2026", "item": `${BASE_URL}/reports/part-time-jobs-college-students-india-2026` },
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
              <span>Part-Time Jobs for Students, 2026</span>
            </nav>
            <h1>Part-Time and Work-From-Home Jobs for College Students in India, 2026: <em>The Real Ones</em> and the Scams</h1>
            <p className="rpt-hero-sub">
              What tutoring, freelancing, delivery apps, AI training work and part-time internships
              actually pay per hour, what they cost you in study time, and how to tell them apart
              from the "like and earn" task scams that took ₹222 crore in four months.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · College students</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Covers</span>
                <span className="rpt-meta-value">Pay, scams, time trade-off</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Data</span>
                <span className="rpt-meta-value">MHA, I4C, NITI Aayog, platforms</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Real student jobs pay by the hour for effort or skill.</strong> Delivery averaged ₹102 an hour on Zomato in 2025 before tips; tutoring averages around ₹1,000 an hour on Superprof's India data.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Gig work is mostly part-time already.</strong> Zomato's average delivery partner worked just 38 days in 2025, about seven hours a day, and only 2.3% worked more than 250 days.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Remote work is real:</strong> 49% of internships on Internshala in 2024 were work-from-home, at an average stipend of ₹8,000 a month.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Cyber fraud keeps climbing:</strong> 22.68 lakh incidents were registered on the national portal in 2024, up from 10.29 lakh in 2022, and Indians lost ₹22,845 crore (MHA).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The one rule that catches almost every scam:</strong> a real job pays you. If anyone asks you to pay to join, unlock tasks or withdraw earnings, it is fraud.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">₹102</div>
              <div className="sc-label">average hourly earnings for a Zomato delivery partner in 2025, before tips</div>
              <div className="sc-source">Eternal CEO Deepinder Goyal, Jan 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">₹222 cr</div>
              <div className="sc-label">lost to task-based investment scams in India in just January to April 2024</div>
              <div className="sc-source">I4C analysis, released by MHA</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">22.68 lakh</div>
              <div className="sc-label">cybercrime incidents registered on the national portal in 2024</div>
              <div className="sc-source">MHA reply in Lok Sabha, July 2025</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">How Many Students Work While Studying</div>
                <div className="sec-sub">Nobody counts it well, but side income is now normal</div>
              </div>
            </div>
            <p>Start with an honest gap. India has no reliable official count of how many college students work part-time. The Periodic Labour Force Survey tracks youth employment, but it does not publish a clean "studying and working" figure, and the student surveys you see quoted on blogs (a "26% of students freelance" number, for example) rarely name their source. We do not use them here.</p>
            <p>What we do have points one way. Deloitte's 2022 Gen Z and Millennial Survey found that 62% of Indian Gen Z respondents had a side job, against a 43% global average (500 Indian Gen Z respondents, reported by Business Today). The most common were social media work (35%), selling products or services online (25%) and writing or blogging (23%). In November 2025, Randstad India's Gen Z Workplace Blueprint found 43% of Indian Gen Z would rather have a full-time job plus a side hustle, and only 16% wanted a single traditional job.</p>
            <p>The wider market for flexible work is also growing. NITI Aayog's report "India's Booming Gig and Platform Economy" (June 2022) estimated 77 lakh gig workers in 2020-21 and projected 2.35 crore by 2029-30. Many delivery, tutoring and freelance jobs that students take sit inside that number.</p>
            <div className="highlight">
              Working while studying is no longer unusual for Indian students. The real question is not whether to earn, but which work pays fairly, fits your timetable, and is not a trap.
            </div>
            <div className="callout">
              <strong>Read the numbers carefully:</strong> the Deloitte figure covers young people broadly, not only students, and the NITI Aayog number is a 2022 projection, not a current count. They show direction, not a precise share of your classmates.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Deloitte Gen Z and Millennial Survey 2022 via Business Today (May 2022); Randstad India Gen Z Workplace Blueprint via NewsMeter (Nov 2025); NITI Aayog, India's Booming Gig and Platform Economy (June 2022).</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">The Legitimate Options, and What They Pay</div>
                <div className="sec-sub">Indicative pay by option, with the source for each</div>
              </div>
            </div>
            <p>Here are the student jobs that are real, roughly ordered from easiest to start to most skill-dependent. Pay figures come from very different sources, some company-reported, some platform-reported, some self-reported, so treat them as indicative ranges, not promises.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Option</th>
                  <th>Indicative pay</th>
                  <th>Where the number comes from</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Food or quick-commerce delivery</td><td>₹102/hr gross; about ₹81/hr after costs</td><td>Zomato 2025 factsheet; Telangana Gig and Platform Workers Union</td></tr>
                <tr><td>Home or online tutoring</td><td>About ₹1,000/hr average; ₹100 to ₹1,500+</td><td>Superprof India platform data (self-set rates)</td></tr>
                <tr><td>Part-time or remote internship</td><td>₹8,000/month average stipend</td><td>Internshala Internship Trends Report 2024</td></tr>
                <tr><td>AI data recording and annotation</td><td>About ₹250/hr for one reported contributor</td><td>Business Today, June 2026 (Objectways)</td></tr>
                <tr><td>Skilled AI training (coding, maths, languages)</td><td>$16.5 to $27.5/hr advertised</td><td>Outlier's Hindi-language page; project-based, not guaranteed</td></tr>
                <tr><td>Freelance writing, design, video, coding</td><td>Varies widely; platform takes a cut</td><td>Fiverr 20% fee; Upwork variable 0% to 15% since May 2025</td></tr>
                <tr><td>Retail, cafe, events, campus ambassador</td><td>Varies by city and brand</td><td>No reliable national figure found; ambassador roles often pay in perks or certificates</td></tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">Indicative earnings per hour, ₹ (Zomato 2025; TGPWU; Business Today June 2026; Superprof)</div>
              <div style={{ height: 300 }}>
                <canvas id="ptjEarnChart" />
              </div>
            </div>
            <p>The pattern is simple. Work that needs only time, like delivery, pays close to ₹100 an hour. Work that needs a skill other people lack, like teaching a subject well or writing code an AI lab will pay to check, pays several times more per hour. If you have one sellable skill, lead with it.</p>
            <div className="callout">
              <strong>Where to look:</strong> tutoring through your college network, local coaching centres and platforms like Superprof; internships on Internshala and company career pages; freelance work on Fiverr and Upwork; AI training through the company's own site only. Never through a stranger's WhatsApp link.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Business Today (2 Jan 2026) and People Matters (Jan 2026) on Zomato's 2025 data; Superprof India rate guides; Internshala via CXOToday (Dec 2024); Business Today (13 June 2026); outlier.ai Hindi-language page; platform fee pages and third-party fee trackers.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Delivery and Quick-Commerce Gigs: The Real Numbers</div>
                <div className="sec-sub">Easy to start, flexible, and modest per hour</div>
              </div>
            </div>
            <p>Delivery is the most visible student gig because it needs a bike, a phone and a licence, and nothing else. In January 2026, Eternal CEO Deepinder Goyal shared Zomato's 2025 numbers: average earnings of ₹102 per logged-in hour, excluding tips, up from ₹92 in 2024. Logged-in time includes waiting between orders. His illustration was that 10 hours a day for 26 days would gross about ₹26,500 a month, or about ₹21,000 after roughly 20% fuel and vehicle costs (Business Today).</p>
            <p>The union side disputes this. The Telangana Gig and Platform Workers Union says that once fuel, maintenance and other costs are taken out, real earnings fall to about ₹81 an hour. Both numbers are useful: ₹102 is the gross, ₹81 is closer to what lands in your pocket.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Tips are rare.</strong> Average tips were about ₹2.6 an hour in 2025; only about 5% of Zomato orders and 2.5% of Blinkit orders were tipped.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Most riders already work part-time.</strong> The average Zomato partner worked 38 days in 2025, about seven hours a day; just 2.3% worked more than 250 days (People Matters).</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Monthly ranges are wide.</strong> A Shriram Finance guide puts part-time riders at ₹7,000 to ₹25,000 a month, without stating its method.</span></div>
            </div>
            <div className="callout">
              <strong>For a student:</strong> delivery works best as short evening or weekend shifts during peak hours. It does not build a skill you can put on a resume, so if you have a skill, a few hours of tutoring or freelancing will usually pay more for the same time.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Business Today, "Look at the full picture" (2 Jan 2026); People Matters (Jan 2026); IANS via Free Press Journal on the union response (Jan 2026); Shriram Finance (2025).</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Online Work That Is Real: Freelancing, AI Training, Tutoring, Internships</div>
                <div className="sec-sub">The work-from-home options that do not ask you to pay</div>
              </div>
            </div>
            <p>"Online jobs for students without investment" is one of the most searched phrases in this space, and it is also the phrase scammers buy ads against. The real versions share three traits: they run on a known platform or company site, they ask for a skill, and the money flows to you, never from you.</p>
            <p><strong>Part-time and remote internships.</strong> Internshala's 2024 trends report found internship openings up 25% on the year, with 49% of them work-from-home and an average stipend of ₹8,000 a month. Many are listed as part-time, which suits a college timetable. Some pay very little, so read the stipend line before you apply. Our <Link to="/reports/remote-internships-2026">Remote Internships 2026 report</Link> covers how to tell which ones are real.</p>
            <p><strong>AI training and data work.</strong> India is a major hub for AI data collection and annotation. In June 2026, Business Today reported on Objectways contributors who record everyday tasks for robotics training, one of whom earned about ₹250 an hour. Higher-skill work, like checking AI answers in maths, coding or Indian languages, pays more: Outlier's Hindi-language page advertises $16.5 to $27.5 an hour. Worker reviews say pay is often per task and project availability comes and goes, so do not count on it as steady income.</p>
            <p><strong>Freelancing.</strong> Fiverr keeps 20% of each order. Upwork moved to a variable fee of 0% to 15% per contract in May 2025, according to fee trackers, with about 10% typical. Start with small, specific gigs: thumbnails, short video edits, slide decks, translation, simple websites.</p>
            <p><strong>Tutoring.</strong> Still the best-paying option for most students. Superprof's India data puts the average around ₹1,000 an hour, with Delhi tutors ranging from about ₹150 to ₹1,500. Rates are self-set, so treat them as asking prices.</p>
            <div className="highlight">
              The single biggest upgrade for any of these is a direct relationship. A coaching centre owner, a startup founder or a team lead who already knows your work will send you repeat paid work. A platform queue will not.
            </div>
          <StuCta via="report-part-time-jobs-college-students-india-2026" place="report-mid" size="quiet" title="Stu finds real internships from company career sites and job boards, never pay-to-join offers." />
            <p className="sc-source" style={{marginTop: 12}}>Source: Internshala Internship Trends Report 2024 via CXOToday (Dec 2024); Business Today (13 June 2026); outlier.ai Hindi-language page; Fiverr seller fees; Upwork fee change as reported by Jobbers and Snipework; Superprof India rate guides.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Scam Landscape: Task Scams, "Like and Earn" and Pay-to-Join</div>
                <div className="sec-sub">Students looking for part-time income are a favourite target</div>
              </div>
            </div>
            <p>Cyber fraud in India is rising fast. In a July 2025 Lok Sabha reply, the Ministry of Home Affairs said incidents registered on the National Cybercrime Reporting Portal rose from 10.29 lakh in 2022 to 15.96 lakh in 2023 and 22.68 lakh in 2024. Citizens lost ₹22,845.73 crore in 2024, up from ₹7,465.18 crore in 2023.</p>
            <div className="chart-wrap">
              <div className="chart-label">Cybercrime incidents registered on NCRP, lakh (MHA, Lok Sabha, July 2025)</div>
              <div style={{ height: 260 }}>
                <canvas id="ptjNcrpChart" />
              </div>
            </div>
            <p>The "part-time job" scam has a name in government data: the task-based investment scam. I4C's analysis of January to April 2024, released by the MHA, put losses at ₹222.58 crore for task-based investment scams, alongside ₹1,420.48 crore for trading scams, ₹120.30 crore for digital arrest and ₹13.23 crore for romance scams. I4C also said about 46% of cybercrime in that period traced back to operations in Myanmar, Laos and Cambodia.</p>
            <div className="chart-wrap">
              <div className="chart-label">Losses by scam type, January to April 2024, ₹ crore (I4C via MHA)</div>
              <div style={{ height: 280 }}>
                <canvas id="ptjScamLossChart" />
              </div>
            </div>
            <p>The script is the same almost every time. A WhatsApp or Telegram message offers easy part-time work: like YouTube videos, rate products, write Google Maps reviews. The first tasks pay a small amount, like the ₹1,650 a 19-year-old VJTI engineering student received before he was pushed into paying ₹2.45 lakh to "unlock" bigger returns (Free Press Journal, Nov 2023). A 22-year-old Hyderabad student lost ₹1.18 lakh after a WhatsApp offer of ₹60,000 a month for rating products (NewsMeter, Sept 2024). When victims try to withdraw, they are told to pay a "fee" or "penalty" first.</p>
            <div className="pull-quote">
              <p>"The early payout is the bait. Every scam in this report pays you a little first so it can take a lot later."</p>
              <span className="pq-source">The takeaway from the police cases above</span>
            </div>
            <p>The government has acted. In December 2023, MeitY blocked over 100 websites linked to task-based part-time job fraud, on I4C's recommendation, after complaints to the 1930 helpline. New sites keep appearing. For the full breakdown of fake internships and pay-to-join offers, read our <Link to="/reports/job-scam-report-fake-internships-task-scams-students-2026">Job Scam Report</Link>.</p>
            <div className="callout">
              <strong>Keep this in proportion:</strong> the ₹222 crore covers everyone, not only students, and four months only. But task scams are built for people who want small, quick income from a phone, which describes a lot of students in exam-free months.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: MHA reply in Lok Sabha via YourStory and India TV (22 July 2025); I4C analysis via Organiser (Oct 2024); MHA statement on website blocking via ThePrint (Dec 2023); Free Press Journal (5 Nov 2023); NewsMeter (12 Sept 2024); DT Next on the Chennai arrests.</p>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">The Red Flags Checklist</div>
                <div className="sec-sub">If you see even one, stop</div>
              </div>
            </div>
            <p>These come straight from the patterns in the police cases and I4C advisories above. A real job can have one awkward feature. A scam usually has several.</p>
            <div className="blist">
              {[
                ["You are asked to pay anything", "Registration fee, security deposit, training kit, \"unlock\" fee, tax before withdrawal. Real employers pay you."],
                ["The offer found you on WhatsApp or Telegram", "Unsolicited messages from unknown numbers offering ₹2,000 to ₹8,000 a day for simple tasks."],
                ["The task is liking, rating or reviewing", "Likes, subscribes, Google Maps reviews, product ratings. This is the core task-scam script."],
                ["You are paid quickly for tiny tasks", "A fast ₹150 or ₹1,650 is how they win your trust before asking for deposits."],
                ["Your earnings live on a dashboard you cannot withdraw from", "Fake balances that grow until you try to cash out, then a fee appears."],
                ["There is no company you can verify", "No website on a company domain, no named manager, no office, only a Telegram \"HR\" or \"receptionist\"."],
                ["The pay is far above the work", "₹60,000 a month for rating products is about ten times what real entry-level pay looks like."],
                ["Pressure and time limits", "Tasks that expire in minutes, penalties for \"mistakes\", group members cheering their profits."],
              ].map(([title, detail], i) => (
                <div className="blist-item" key={title as string}>
                  <span className="check-num">{i + 1}</span>
                  <span><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
            <div className="callout">
              <strong>If you have already paid:</strong> stop sending money, call 1930 and file at cybercrime.gov.in the same day. Fast reports let banks freeze money in transit: the MHA says over ₹5,489 crore has been saved across more than 17.82 lakh complaints through its fraud reporting system.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: patterns from Free Press Journal, NewsMeter and DT Next case reports; MHA reply in Lok Sabha (July 2025) for the amount saved.</p>
          </div>

          {/* Section 7 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">7</div>
              <div>
                <div className="sec-title">The Time Trade-Off: Earning Without Wrecking Your Grades</div>
                <div className="sec-sub">Hours are the real cost of a part-time job</div>
              </div>
            </div>
            <p>We did not find a solid Indian study on how part-time work affects college grades, so this section is guidance, not data. The useful idea is to price your hours. A semester has a fixed number of them, and every hour on a ₹100 gig is an hour not spent on a course, a project, or an internship that could pay far more after you graduate.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>If you have</th>
                  <th>A sensible choice</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>5 to 8 hours a week</td><td>Tutoring one or two students</td><td>Highest pay per hour; fixed, predictable slots</td></tr>
                <tr><td>10 to 15 hours a week</td><td>Part-time remote internship or a freelance client</td><td>Pays and builds a resume line at the same time</td></tr>
                <tr><td>Weekends only</td><td>Delivery peak shifts, events, retail</td><td>Flexible; the average Zomato partner worked only 38 days in 2025</td></tr>
                <tr><td>Exam months</td><td>Pause or cut hours</td><td>Flexible work lets you stop without losing the job</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>A rule of thumb many students use:</strong> keep paid work to about 10 to 15 hours a week during term. That is not an official limit, just a ceiling that leaves room for classes and sleep. If you need more income than that, aim for higher pay per hour, not more hours.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Zomato 2025 data via People Matters (Jan 2026); the hours guidance is a Studojo rule of thumb, not survey data.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">What students ask about part-time and online jobs, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>A simple plan for earning while you study</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>If you want to earn this semester without getting scammed or falling behind:</p>
            <div className="blist">
              {[
                ["Lead with a skill", "Tutoring, writing, design or coding pays several times what time-only gigs pay per hour."],
                ["Use known platforms and real companies", "Internshala, Fiverr, Upwork, company career pages, your college network. Not WhatsApp links."],
                ["Never pay to work", "Any deposit, fee or \"unlock\" payment means it is a scam. Report it on 1930."],
                ["Cap your hours", "Around 10 to 15 a week in term, less in exam months."],
                ["Turn part-time work into a direction", "Write to the person who runs the team you want to work for. That is how a small gig becomes a real internship or offer."],
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
              <Link to="/reports/job-scam-report-fake-internships-task-scams-students-2026" className="related-card">
                <div className="rc-kicker">Scams</div>
                <div className="rc-title">The Job Scam Report: Fake Internships, Pay-to-Join Offers and Task Scams</div>
              </Link>
              <Link to="/reports/remote-internships-2026" className="related-card">
                <div className="rc-kicker">Remote</div>
                <div className="rc-title">Remote Internships 2026: Which Ones Are Real</div>
              </Link>
              <Link to="/reports/first-1-lakh-month-report-fastest-paths-students-2026" className="related-card">
                <div className="rc-kicker">Earning</div>
                <div className="rc-title">The First ₹1 Lakh/Month Report: The Fastest Paths Students Use</div>
              </Link>
            </div>
          </div>
          <StuCta via="report-part-time-jobs-college-students-india-2026" place="report-end" size="card" title="Looking for a real internship instead?" line="Tell Stu the field, the city and the stipend you want in one short call. Stu finds internships that fit you, finds who's hiring and writes the email to them." />
        </div>
      </main>
      <Footer />
    </>
  );
}
