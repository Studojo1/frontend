import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { productHref } from "~/lib/product-origin";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Entry-Level Jobs in India, October 2026: 171,203 Listings, and the One Gap That Matters | Studojo" },
    { name: "description", content: "We counted India's live entry-level and internship listings for October 2026: 171,203 of them. The surprise is that about 85 in 100 give you no person to contact." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "entry level jobs India October 2026, internship listings India 2026, entry level job market India, fresher jobs India data, cities hiring freshers India, entry level salary India" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/india-entry-level-jobs-internships-october-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Entry-Level Jobs in India, October 2026: 171,203 Listings, and the Gap That Matters" },
    { property: "og:description", content: "A count of India's live entry-level and internship listings for October 2026, by role, city and pay, and why so few give you a person to email." },
    { property: "og:url", content: `${BASE_URL}/reports/india-entry-level-jobs-internships-october-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-03T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Entry-Level Jobs in India, October 2026 | Studojo" },
    { name: "twitter:description", content: "171,203 live listings, counted. By role, city and pay, and the contact gap that decides who gets read." },
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

  // Chart 1: listings by role family (classified roles only; Studojo listings data, Oct 2026)
  const roleEl = document.getElementById("ielRoleChart") as HTMLCanvasElement | null;
  if (roleEl && !roleEl.dataset.rendered) {
    roleEl.dataset.rendered = "1";
    new Chart(roleEl, {
      type: "bar",
      data: {
        labels: [
          "Sales / BD",
          "Customer Support",
          "Marketing / Content",
          "Data / Analytics / AI",
          "HR / Recruiting",
          "Finance / Accounts",
          "Operations / Supply",
          "Software / IT",
          "Design / Creative",
        ],
        datasets: [{
          label: "Listings",
          data: [24188, 23147, 7998, 7876, 7673, 7156, 6484, 5176, 4911],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET2, VIOLET2, VIOLET2, VIOLET3, VIOLET3, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${Number(ctx.raw).toLocaleString("en-IN")} listings` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: does the posting give you a person to contact (of listings with a job description)
  const contactEl = document.getElementById("ielContactChart") as HTMLCanvasElement | null;
  if (contactEl && !contactEl.dataset.rendered) {
    contactEl.dataset.rendered = "1";
    new Chart(contactEl, {
      type: "doughnut",
      data: {
        labels: ["No direct contact, just a form", "Email or phone in the posting"],
        datasets: [{
          data: [85.1, 14.9],
          backgroundColor: [RED, GREEN],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of listings with a description` } },
        },
      },
    });
  }

  // Chart 3: listings by city (top 10; Studojo listings data, Oct 2026)
  const cityEl = document.getElementById("ielCityChart") as HTMLCanvasElement | null;
  if (cityEl && !cityEl.dataset.rendered) {
    cityEl.dataset.rendered = "1";
    new Chart(cityEl, {
      type: "bar",
      data: {
        labels: ["Mumbai", "Bengaluru", "Chennai", "Hyderabad", "Delhi", "Pune", "Gurugram", "Ahmedabad", "Noida", "Kolkata"],
        datasets: [{
          label: "Listings",
          data: [21026, 20855, 11884, 11729, 10265, 9677, 9376, 8454, 8057, 3963],
          backgroundColor: VIOLET,
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${Number(ctx.raw).toLocaleString("en-IN")} listings` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK, maxRotation: 45, minRotation: 45 } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
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
    q: "How many entry-level jobs are there in India right now?",
    a: "In our own India index, October 2026 held 171,203 live entry-level and internship listings on the snapshot date of 2 November 2026: 152,744 entry-level roles and 18,459 internships (Studojo listings data). That is the live October stock we could see on the snapshot date, not every listing ever posted, because closed roles are removed after a short grace period.",
  },
  {
    q: "Which cities in India have the most entry-level jobs?",
    a: "Mumbai led with 21,026 listings, then Bengaluru at 20,855, Chennai at 11,884, Hyderabad at 11,729 and Delhi at 10,265 (Studojo listings data, October 2026). Pune, Gurugram, Ahmedabad and Noida each sat between about 8,000 and 9,700. Another 8,997 listings were remote and 11,811 did not state a location.",
  },
  {
    q: "What do entry-level jobs in India pay?",
    a: "Among the entry-level listings that stated a salary, the most common band was 3 lakh to 5 lakh a year (21,022 listings), with 5 lakh to 8 lakh next (9,577). The catch is that only 28.6% of entry-level listings stated a number at all (Studojo listings data, October 2026), so treat any single figure as a rough guide and ask about pay directly.",
  },
  {
    q: "Do internships in India pay a stipend?",
    a: "Often not that we can see: only 2.1% of the internship listings stated a stipend (389 of 18,459, Studojo listings data, October 2026). Among those that did, 10,000 to 20,000 rupees a month was the most common band. A listing with no stipend figure is not proof it pays nothing, but it is worth confirming before you invest time.",
  },
  {
    q: "Why do so few job postings include an email or phone number?",
    a: "Most listings route you to an application form instead of a person. Of the listings with a real job description, 85.1% gave no direct contact and only about 7% put an email in the posting (Studojo listings data, October 2026). That is the whole problem with applying online: you are talking to a queue, not the person who hires. Finding that person is the work Studojo does for you.",
  },
  {
    q: "What kinds of entry-level roles are hiring most in India?",
    a: "Sales and business development led the classified roles at 24,188 listings, with customer support close behind at 23,147 (Studojo listings data, October 2026). Marketing, data and analytics, HR and finance each sat near 7,000 to 8,000, and software and IT at 5,176. A large share of listings are associate and operations roles that do not fall into one neat family.",
  },
];

export default function IndiaEntryLevelReport() {
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
        "headline": "Entry-Level Jobs in India, October 2026: 171,203 Listings, and the Gap That Matters",
        "description": "A count of India's live entry-level and internship listings for October 2026, by role, city and pay, and why so few give you a person to email.",
        "url": `${BASE_URL}/reports/india-entry-level-jobs-internships-october-2026`,
        "datePublished": "2026-11-03T00:00:00Z",
        "dateModified": "2026-11-03T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/india-entry-level-jobs-internships-october-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "India Entry-Level Jobs and Internships, October 2026", "item": `${BASE_URL}/reports/india-entry-level-jobs-internships-october-2026` },
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
              <span>India Entry-Level Jobs, October 2026</span>
            </nav>
            <h1>India's Entry-Level Jobs, <em>Counted</em> for October 2026</h1>
            <p className="rpt-hero-sub">
              We counted the live entry-level and internship listings in our India index for
              October 2026: 171,203 of them. Here is where they are, what they pay, and the
              one gap that decides who actually gets read.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Entry-level and internships</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Window</span>
                <span className="rpt-meta-value">Posted in October 2026</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Snapshot</span>
                <span className="rpt-meta-value">2 November 2026</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>171,203 live listings</strong> for October 2026 in our India index: 152,744 entry-level and 18,459 internships.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Of listings with a real description, <strong>85.1% gave no direct contact</strong>, just an application form. Only about 7% put an email in the posting.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Pay is rarely stated: <strong>28.6% of entry-level and 2.1% of internship listings</strong> disclosed a number. The common entry band was 3 lakh to 5 lakh a year.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Sales and customer support dominate</strong> the classified roles (24,188 and 23,147), well ahead of software and IT (5,176).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Mumbai and Bengaluru lead on volume</strong> (21,026 and 20,855), with Chennai, Hyderabad and Delhi next.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">171,203</div>
              <div className="sc-label">live India entry-level and internship listings for October 2026</div>
              <div className="sc-source">Studojo listings data, snapshot 2 Nov 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">85 in 100</div>
              <div className="sc-label">listings with a description give no person to contact, only a form</div>
              <div className="sc-source">Studojo listings data, October 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">7%</div>
              <div className="sc-label">of listings with a description put an email address in the posting</div>
              <div className="sc-source">Studojo listings data, October 2026</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">What We Counted</div>
                <div className="sec-sub">The dataset, and what it does and does not include</div>
              </div>
            </div>
            <p>This report uses Studojo's own index of India job listings. We counted the listings with a posting date in October 2026 (1 October to 31 October) that were either entry-level or an internship, as seen on a single snapshot taken on 2 November 2026. The total came to 171,203 listings: 152,744 entry-level and 18,459 internships.</p>
            <p>Two honest caveats. First, this is live stock, not a full census. Listings that were closed or removed before the snapshot are cleared out after a short grace period, so a role posted and filled early in October may not be here. Second, counts drift by a few rows between queries as listings close, so we fixed every number to the snapshot above. Where we talk about a "contact" in the posting, we mean an email address or an Indian mobile number inside the job description. The phone signal can over-count, so email is the clean number to trust.</p>
            <div className="highlight">
              Read this as a map of what was open and visible in October 2026, and of how those listings behave, not as the exact number of jobs that existed in India. The patterns, not the last digit, are the point.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Where the Roles Are</div>
                <div className="sec-sub">Sales and support lead, tech is smaller than you think</div>
              </div>
            </div>
            <p>The classified roles are led by sales and business development (24,188 listings) and customer support (23,147). Marketing and content, data and analytics, HR and finance each land between about 7,000 and 8,000. Software and IT, the field many freshers assume is the biggest, comes in at 5,176. A large block of listings, about 71,759, are associate and operations roles that do not sort cleanly into one family, which is why the chart below shows only the roles we could classify.</p>
            <div className="chart-wrap">
              <div className="chart-label">Listings by role family, classified roles only (Studojo listings data, Oct 2026)</div>
              <div style={{ height: 320 }}>
                <canvas id="ielRoleChart" />
              </div>
            </div>
            <p>The single most common job titles tell the same story: the market wants people who sell and people who support customers.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job title</th>
                  <th>Listings</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Associate, Housekeeping</td><td>2,811</td></tr>
                <tr><td>Business Development Associate</td><td>1,349</td></tr>
                <tr><td>Customer Support Executive</td><td>1,210</td></tr>
                <tr><td>Sales Executive</td><td>1,062</td></tr>
                <tr><td>Business Development Executive</td><td>798</td></tr>
                <tr><td>Customer Service Executive</td><td>665</td></tr>
                <tr><td>Business Development (Sales) Internship</td><td>596</td></tr>
                <tr><td>Field Sales Executive</td><td>576</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>What this means for a fresher:</strong> if your plan is only software roles, you are fishing in the smallest classified pond. Widening to sales, support and operations roles multiplies the openings you can reach, and those teams often hire faster.
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Where the Cities Are</div>
                <div className="sec-sub">Mumbai and Bengaluru lead, but remote is real</div>
              </div>
            </div>
            <p>Mumbai (21,026) and Bengaluru (20,855) are almost level at the top, with Chennai (11,884), Hyderabad (11,729) and Delhi (10,265) forming the next tier. Pune, Gurugram, Ahmedabad and Noida each sit between about 8,000 and 9,700. Two numbers that matter if you are not in a metro: 8,997 listings were remote, and 11,811 did not state a location at all, so filtering strictly by city can hide roles you could actually take.</p>
            <div className="chart-wrap">
              <div className="chart-label">Listings by city, top 10 (Studojo listings data, Oct 2026)</div>
              <div style={{ height: 300 }}>
                <canvas id="ielCityChart" />
              </div>
            </div>
            <div className="highlight">
              If you are open to remote work or to relocating, you are competing in a far bigger pool than your home city's count suggests. Do not let a city filter quietly shrink your search.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">What They Pay, When They Say</div>
                <div className="sec-sub">Most listings do not state a number at all</div>
              </div>
            </div>
            <p>Pay transparency is low. Only 43,628 of the 152,744 entry-level listings (28.6%) stated an annual salary, and for internships it is far lower: 389 of 18,459 (2.1%) stated a stipend. So the tables below describe the listings that disclosed a figure, not the whole market. Among entry-level listings that did, 3 lakh to 5 lakh a year was clearly the most common band.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Entry-level salary band (per year)</th>
                  <th>Listings that stated it</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Under 2 lakh</td><td>2,328</td><td></td></tr>
                <tr><td>2 lakh to 3 lakh</td><td>7,616</td><td></td></tr>
                <tr><td>3 lakh to 5 lakh</td><td>21,022</td><td><span className="tag-pill pill-green">Most common</span></td></tr>
                <tr><td>5 lakh to 8 lakh</td><td>9,577</td><td></td></tr>
                <tr><td>8 lakh to 12 lakh</td><td>1,749</td><td></td></tr>
                <tr><td>12 lakh to 20 lakh</td><td>612</td><td></td></tr>
                <tr><td>Over 20 lakh</td><td>724</td><td></td></tr>
              </tbody>
            </table>
            <p>For internships, the small group that stated a stipend clustered at 10,000 to 20,000 rupees a month.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Internship stipend band (per month)</th>
                  <th>Listings that stated it</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Under 5,000</td><td>17</td><td></td></tr>
                <tr><td>5,000 to 10,000</td><td>72</td><td></td></tr>
                <tr><td>10,000 to 20,000</td><td>181</td><td><span className="tag-pill pill-green">Most common</span></td></tr>
                <tr><td>20,000 to 40,000</td><td>98</td><td></td></tr>
                <tr><td>Over 40,000</td><td>21</td><td><span className="tag-pill pill-amber">Rare</span></td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>How to use this:</strong> a blank pay field is not a red flag by itself, it is the norm. Do not rule a role out for it. Instead, ask about pay directly once you are talking to a person, which is far easier when you reach the hiring manager rather than a form.
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Contact Gap</div>
                <div className="sec-sub">The number that explains why applying online feels like shouting into a void</div>
              </div>
            </div>
            <p>Here is the finding that matters most. Of the 148,171 listings that carried a real job description, 126,029 (85.1%) gave you no direct way to reach a person. Only 22,142 (14.9%) included an email or a phone number, and if you count clean email addresses alone, just 10,423 listings did, about 7% of the ones with a description.</p>
            <div className="chart-wrap">
              <div className="chart-label">Does the posting give you a person to contact? Of listings with a description (Studojo listings data, Oct 2026)</div>
              <div style={{ height: 280 }}>
                <canvas id="ielContactChart" />
              </div>
            </div>
            <p>So for roughly 85 out of every 100 listings, the posting hands you a form and nothing else. You upload a resume, it joins a queue, and no human has agreed to read it. That is why online applications are cited at roughly 0.1% to 2% success per application (The Interview Guys, April 2026), and why the average opening draws about 242 applications (the same source, citing Business Insider data). The volume is not the problem you can fix. The silence is.</p>
            <div className="pull-quote">
              <p>"The posting almost never gives you a person. Finding the one who actually hires, and writing to them, is the job most applicants skip."</p>
              <span className="pq-source">The takeaway from the October 2026 numbers</span>
            </div>
            <p>What works instead is reaching the person who owns the role. A short, specific email to the hiring manager or team lead lands in a human inbox, not a queue, and it shows you understand the work. Replies are never guaranteed, but a note to the right person has a real chance of being read, which a form submission does not. This is exactly what Studojo is built to do: it finds the person who can actually hire you, verifies their email, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The questions people ask about India's entry-level market, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to search in this market</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The October numbers point to a simple plan for a fresher in India:</p>
            <div className="blist">
              {[
                ["Widen past tech", "Sales, support and operations carry the most openings. Applying only to software roles shrinks your market to a fraction of it."],
                ["Do not over-filter by city", "Remote and no-location listings are a real chunk of the market. A tight city filter hides roles you could take."],
                ["Ignore the blank pay field", "Most listings state no salary. Treat that as normal, and ask about pay once you reach a person."],
                ["Reach the person, not the form", "About 85 in 100 listings give you no one to email. Finding the hiring manager and writing to them is the move that skips the queue."],
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
              <Link to="/reports/how-to-get-a-job-as-a-fresher-india-2026" className="related-card">
                <div className="rc-kicker">Freshers</div>
                <div className="rc-title">How to Get a Job as a Fresher in India, 2026</div>
              </Link>
              <Link to="/reports/mail-to-hr-for-job-india-2026" className="related-card">
                <div className="rc-kicker">Outreach</div>
                <div className="rc-title">Mail to HR for a Job in India: What to Send</div>
              </Link>
              <Link to="/reports/first-job-india-2026" className="related-card">
                <div className="rc-kicker">First job</div>
                <div className="rc-title">Landing Your First Job in India, 2026</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Reach the person, not the form.</h3>
              <p>Most India listings route you to an application form with no one to email. Studojo finds the hiring manager who owns the role, verifies their email, and writes a personal note for that one person, sent from your own Gmail.</p>
            </div>
            <Link to={productHref("/join?via=report-india-entry-level-jobs-internships-october-2026&how=voice")} reloadDocument className="rpt-cta-btn">
              Email hiring managers with Studojo →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
