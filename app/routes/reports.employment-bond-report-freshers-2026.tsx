import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";
const SLUG = "employment-bond-report-freshers-2026";

export function meta() {
  return [
    { title: "The Employment Bond Report: Are Fresher Service Agreements Legal, and What Happens If You Break One? | Studojo" },
    { name: "description", content: "Is a job bond legal in India? The Supreme Court upheld a ₹2 lakh bond in 2025, but courts still cut inflated claims to real loss: one ₹3.95 lakh claim was assessed at ₹34,532. What freshers should know before signing or leaving." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "is bond legal in india, employment bond india, service agreement in it company freshers, what happens if i break bond, can company keep original certificates, bond amount freshers, Section 27 Contract Act bond, Vijaya Bank v Prashant Narnaware" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/${SLUG}` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Employment Bond Report: Are Fresher Service Agreements Legal?" },
    { property: "og:description", content: "Section 27, Section 74, the 2025 Supreme Court ruling, original certificates, typical bond amounts, and your options if you want to leave early." },
    { property: "og:url", content: `${BASE_URL}/reports/${SLUG}` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-14T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Employment Bond Report for Freshers | Studojo" },
    { name: "twitter:description", content: "Bonds can be legal in India. Inflated bond amounts usually are not. What the courts actually said, and what to check before you sign." },
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

  // Chart 1: bond amounts in documented offers and court cases (sources cited in section 4)
  const amtEl = document.getElementById("ebrAmountChart") as HTMLCanvasElement | null;
  if (amtEl && !amtEl.dataset.rendered) {
    amtEl.dataset.rendered = "1";
    new Chart(amtEl, {
      type: "bar",
      data: {
        labels: [
          "Wipro WILP (60 months, pro rata)",
          "Tech Mahindra campus (2 years)",
          "Satyam Computer (bond sum)",
          "Vijaya Bank (3 years)",
          "Algonox, Hyderabad (demanded)",
          "Bharat Aviation (3 years)",
        ],
        datasets: [{
          label: "Bond amount (₹)",
          data: [75000, 100000, 200000, 200000, 500000, 1000000],
          backgroundColor: [VIOLET3, VIOLET3, VIOLET2, VIOLET2, VIOLET, VIOLET],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ₹${Number(ctx.raw).toLocaleString("en-IN")}` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `₹${(Number(v) / 100000).toLocaleString("en-IN")}L` } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: Sicpa India v Manas Pratim Deb, Delhi HC 2011: claimed vs shown vs assessed
  const sicpaEl = document.getElementById("ebrSicpaChart") as HTMLCanvasElement | null;
  if (sicpaEl && !sicpaEl.dataset.rendered) {
    sicpaEl.dataset.rendered = "1";
    new Chart(sicpaEl, {
      type: "bar",
      data: {
        labels: ["Employer's claim", "Trip cost shown in vouchers", "Reasonable compensation assessed"],
        datasets: [{
          label: "₹",
          data: [395170, 67596, 34532],
          backgroundColor: [RED, VIOLET2, GREEN],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ₹${Number(ctx.raw).toLocaleString("en-IN")}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `₹${Number(v).toLocaleString("en-IN")}` } },
        },
      },
    });
  }

  // Chart 3: Wipro WILP monthly stipend by year (college placement notice, Jan 2025)
  const wilpEl = document.getElementById("ebrWilpChart") as HTMLCanvasElement | null;
  if (wilpEl && !wilpEl.dataset.rendered) {
    wilpEl.dataset.rendered = "1";
    new Chart(wilpEl, {
      type: "bar",
      data: {
        labels: ["Year 1", "Year 2", "Year 3", "Year 4"],
        datasets: [{
          label: "Monthly stipend (₹)",
          data: [15000, 17000, 19000, 23000],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ₹${Number(ctx.raw).toLocaleString("en-IN")} a month` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, beginAtZero: true, ticks: { font: { size: 11 }, color: MUTED } },
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
    q: "Is an employment bond legal in India?",
    a: "Yes, a bond that only asks you to stay for a minimum period, or pay if you leave early, can be legal. In Vijaya Bank v Prashant B Narnaware (14 May 2025), the Supreme Court upheld a clause requiring three years of service or ₹2 lakh, holding that it operates during employment and so is not a restraint of trade under Section 27 of the Indian Contract Act (LiveLaw, 15 May 2025). What is not settled in your favour is the amount: courts can cut an inflated sum down to reasonable compensation under Section 74.",
  },
  {
    q: "What happens if I break my bond with a company?",
    a: "The company can ask you to pay, and if you refuse it has to go to court to recover the money; it cannot force you to keep working. Courts then decide what is reasonable. In Sicpa India v Manas Pratim Deb (Delhi High Court, 17 November 2011), the employer claimed ₹3,95,170, but reasonable compensation was assessed at ₹34,532, and the claim failed after money the employer owed the employee was set off (Indian Kanoon judgment text). The 2025 Supreme Court ruling shows a clear, moderate sum can be upheld in full.",
  },
  {
    q: "Can a company keep my original certificates?",
    a: "Courts have repeatedly said no. The Madras High Court held in 2014 that \"withholding of original certificates by the authorities on any ground is not legal and proper\" and ordered a college to return a lecturer's documents, while leaving the employer free to sue for damages (LiveLaw, June 2014). The Orissa High Court in 2023 ordered 125 doctors' originals released, calling them \"the assets of the persons concerned\" (Medical Dialogues, August 2023). Give copies for verification, not originals.",
  },
  {
    q: "How much is the bond amount for freshers in IT companies?",
    a: "Reported amounts for freshers mostly sit between ₹75,000 and ₹2 lakh, but they vary by company, batch and programme. Wipro's WILP programme notice lists a 60-month agreement with ₹75,000 payable pro rata on early exit (CSJMU placement notice, January 2025). A 2023 Tech Mahindra campus offer shared by a student listed a ₹1 lakh indemnity bond for two years (Business Today, September 2023). Larger demands exist: a Hyderabad engineer challenged a ₹5 lakh exit demand in the Telangana High Court (Siasat, December 2025).",
  },
  {
    q: "Will I get a relieving letter if I leave before my bond ends?",
    a: "Not necessarily. In Bharat Aviation v Rahul Sudhindra Soni (2026), the Bombay High Court held that an employee who resigned in breach of a training bond could not force the employer to issue a relieving letter or experience certificate (LiveLaw, May 2026). That is different from original educational certificates, which courts have ordered returned. Plan for the relieving letter question before you resign.",
  },
  {
    q: "Is a non-compete clause after I leave enforceable in India?",
    a: "Generally no. Section 27 of the Indian Contract Act voids agreements that restrain a person from a lawful profession, and the Supreme Court has long read it to cover restraints after employment ends, while allowing reasonable restrictions during employment (Niranjan Shankar Golikari, 1967, as summarised by PSA Legal). A clause stopping you from joining a competitor after you leave is the weak part of most contracts. The minimum service period is the strong part.",
  },
];

export default function EmploymentBondReport() {
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
        "headline": "The Employment Bond Report: Are Fresher Service Agreements Legal, and What Happens If You Break One?",
        "description": "What employment bonds and service agreements are, what Section 27 and Section 74 of the Indian Contract Act say, the 2025 Supreme Court ruling, original certificates, typical bond amounts, and options if you want to leave.",
        "url": `${BASE_URL}/reports/${SLUG}`,
        "datePublished": "2026-11-14T00:00:00Z",
        "dateModified": "2026-11-14T00:00:00Z",
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
          { "@type": "ListItem", "position": 3, "name": "The Employment Bond Report", "item": `${BASE_URL}/reports/${SLUG}` },
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
              <span>The Employment Bond Report</span>
            </nav>
            <h1>The Employment Bond Report: Are Fresher Service Agreements <em>Legal</em>, and What Happens If You Break One?</h1>
            <p className="rpt-hero-sub">
              Short answer: a bond can be legal, and the Supreme Court upheld one in 2025. But the
              number written in it is not automatically what you owe, and your original certificates
              are not the company's to keep. Here is what the courts have actually said.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Freshers and early-career</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Based on</span>
                <span className="rpt-meta-value">Court rulings, offer terms, news reports</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">14 November 2026</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Bonds can be legal.</strong> In May 2025 the Supreme Court upheld a clause requiring three years of service or ₹2 lakh, holding it is not a restraint of trade under Section 27 (Vijaya Bank v Prashant B Narnaware).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The written amount is a ceiling, not a bill.</strong> Under Section 74 courts award reasonable compensation. In one Delhi High Court case a ₹3,95,170 claim was assessed at ₹34,532.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Original certificates should not be held hostage.</strong> The Madras High Court (2014) and Orissa High Court (2023) both ordered originals returned.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Relieving letters are a different story.</strong> The Bombay High Court held in 2026 that an employee who broke a training bond could not force the employer to issue one.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Fresher bond amounts reported in public sources</strong> mostly range from ₹75,000 to ₹2 lakh over 1 to 5 years, with outliers up to ₹5 lakh and ₹10 lakh.</span></div>
            </div>
          </div>

          <div className="highlight">
            <strong>Not legal advice.</strong> This report summarises public court rulings and news reports for general information. Every bond is worded differently. If you face a demand or a dispute, speak to a qualified lawyer or your state labour department before you pay or sign anything.
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">₹2 lakh</div>
              <div className="sc-label">three-year bond upheld by the Supreme Court in May 2025</div>
              <div className="sc-source">Vijaya Bank v Prashant B Narnaware, via LiveLaw</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">₹34,532</div>
              <div className="sc-label">reasonable compensation assessed against a ₹3,95,170 bond claim</div>
              <div className="sc-source">Sicpa India v Manas Pratim Deb, Delhi HC, 2011</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">60 months</div>
              <div className="sc-label">Wipro WILP agreement, ₹75,000 payable pro rata on early exit</div>
              <div className="sc-source">CSJMU placement notice, January 2025</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">What a Bond Actually Is, and Who Uses Them</div>
                <div className="sec-sub">Service agreement, training agreement, indemnity bond: same idea</div>
              </div>
            </div>
            <p>An employment bond is a clause in your offer letter or a separate agreement that says: stay with us for a minimum period, or pay us a fixed sum if you leave early. Companies call it different things. A "service agreement", a "training agreement", an "indemnity bond" or a "minimum service surety agreement" all do the same job. The usual reason given is training cost: the company says it spends money making you productive and wants that back if you leave before it pays off.</p>
            <p>They show up most often where the employer trains freshers in bulk or pays for expensive training. Public examples include IT services training programmes (Wipro's Work Integrated Learning Programme lists a 60-month agreement, per a January 2025 college placement notice), some IT campus offers (a 2023 Tech Mahindra campus offer shared by a student listed a ₹1 lakh indemnity bond for two years, Business Today), smaller IT firms (a Hyderabad software engineer challenged a ₹5 lakh exit demand from Algonox Technologies, Siasat, December 2025), aviation (Bharat Aviation, Bombay High Court, 2026) and banking (Vijaya Bank, Supreme Court, 2025).</p>
            <p>How common are they overall? Honestly, nobody publishes a good number. We could not find a recent survey measuring what share of Indian employers use bonds for freshers. The best-known data point is old: a 2008 Careernet Consulting survey of about 2,200 students, reported by Business Standard, found that around 60% had turned down offers because they were asked to sign a bond or were offered low-end jobs. That tells you bonds have long been a sore point. It does not tell you how many offers carry one today.</p>
            <div className="blist">
              {[
                "Minimum service clause: you agree to stay a set period, often 1 to 3 years, sometimes 5.",
                "Exit amount: a fixed sum, sometimes reducing pro rata as you serve more months.",
                "Notice period: separate from the bond, but often enforced alongside it.",
                "Document clauses: some employers ask to hold original certificates as security (see section 5).",
              ].map((t) => (
                <div className="blist-item" key={t}><div className="blist-dot" /><span>{t}</span></div>
              ))}
            </div>
            <div className="callout">
              <strong>Read the whole thing:</strong> the bond is often not in the first offer email. It can sit in a joining kit, an annexure or a document you sign on day one. Ask for the full text before you accept, in writing.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: CSJMU placement notice for Wipro WILP (Jan 2025); Business Today (12 Sep 2023); Siasat (14 Dec 2025); LiveLaw (May 2025, May 2026); Business Standard report on Careernet survey (Apr 2008).</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Section 27: Why "Bonds Are Illegal in India" Is Wrong</div>
                <div className="sec-sub">The 2025 Supreme Court ruling changed the conversation</div>
              </div>
            </div>
            <p>Section 27 of the Indian Contract Act, 1872 says any agreement that restrains someone from carrying on a lawful profession, trade or business is void. For years, freshers have been told this makes every bond illegal. It does not.</p>
            <p>The key distinction comes from the Supreme Court's 1967 decision in Niranjan Shankar Golikari v Century Spinning: restrictions that apply <em>during</em> employment are generally fine, while restrictions that stop you working <em>after</em> you leave are void (as summarised by PSA Legal). A minimum service clause is about the period you are still employed, so it falls on the "during" side.</p>
            <p>On 14 May 2025, the Supreme Court applied exactly this in Vijaya Bank v Prashant B Narnaware. The bank required officers it recruited to serve three years or pay ₹2 lakh. Mr Narnaware joined as a Senior Manager in 2007, resigned in 2009 to join IDBI Bank, paid ₹2 lakh under protest and challenged it. The Karnataka High Court had struck the clause down as a restraint of trade. The Supreme Court (Justices PS Narasimha and Joymalya Bagchi) reversed that, held the clause was not a restraint of trade, rejected the argument that it was unconscionable, and said ₹2 lakh was not excessive for a Senior Manager on a substantial salary (LiveLaw, 15 May 2025; Gulf News, 23 May 2025).</p>
            <table className="data-table">
              <thead>
                <tr><th>Type of clause</th><th>Where the law stands</th><th>Risk for you</th></tr>
              </thead>
              <tbody>
                <tr><td>Stay X years or pay ₹Y</td><td>Can be valid (Vijaya Bank, 2025)</td><td><span className="tag-pill pill-amber">Real</span></td></tr>
                <tr><td>Notice period</td><td>Generally enforceable as agreed</td><td><span className="tag-pill pill-amber">Real</span></td></tr>
                <tr><td>No joining a competitor after you leave</td><td>Generally void under Section 27</td><td><span className="tag-pill pill-green">Low</span></td></tr>
                <tr><td>Company holds your original certificates</td><td>Courts have ordered return (section 5)</td><td><span className="tag-pill pill-green">Challengeable</span></td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>One honest caveat:</strong> Vijaya Bank is a public sector case, and the court leaned on the bank's need to follow open recruitment rules. Commentators disagree on how far it carries to private IT firms. But no one should now tell you a bond is automatically void.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: LiveLaw, 2025 LiveLaw (SC) 565 (15 May 2025); Gulf News (23 May 2025); PSA Legal, "Retention Clauses under Scrutiny".</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Section 74: The Number in the Bond Is Not Automatically What You Owe</div>
                <div className="sec-sub">Courts award reasonable compensation, and cut penalties</div>
              </div>
            </div>
            <p>Here is the part that matters most for a fresher. Section 74 of the Indian Contract Act says that when a contract names a sum payable on breach, the court awards reasonable compensation not exceeding that sum. The bond amount is a ceiling. If it looks like a penalty meant to scare you rather than a genuine estimate of the employer's loss, courts can cut it down.</p>
            <p>The clearest example is Sicpa India v Manas Pratim Deb, decided by the Delhi High Court on 17 November 2011 (Justice Valmiki J Mehta). A sales executive signed two bonds of ₹2 lakh each, was sent abroad for what the company called training, and resigned early. The company sued for ₹3,95,170. The vouchers for the second trip showed ₹67,596, mostly travel and stay, with no training charges. The trial court called the bonds "terrorem, unconscionable and extravagant", assessed reasonable compensation at ₹34,532, and dismissed the suit because the company admitted owing the employee ₹44,330. The High Court upheld that (judgment text on Indian Kanoon).</p>
            <div className="chart-wrap">
              <div className="chart-label">Sicpa India v Manas Pratim Deb: what was claimed vs what was proven (₹)</div>
              <div style={{ height: 280 }}>
                <canvas id="ebrSicpaChart" />
              </div>
            </div>
            <p>Other rulings point the same way. In Ledalla Ravichandar v Satyam Computer Services, the Andhra Pradesh High Court upheld a bond because training was documented, but reduced recovery from ₹2 lakh to ₹1 lakh because the employee had served a substantial part of the period (as summarised by PSA Legal). And the Supreme Court said back in 1963, in Fateh Chand v Balkishan Dass, that compensation cannot be awarded mechanically just because a contract names a figure.</p>
            <div className="pull-quote">
              <p>"A bond is a promise to pay a fair amount for a real loss. It is not a price tag the company gets to name."</p>
              <span className="pq-source">The takeaway from Sicpa, Satyam and Section 74</span>
            </div>
            <div className="callout">
              <strong>But do not over-read this:</strong> Vijaya Bank shows a clear, moderate, well-explained sum can be upheld in full. The smaller and more reasonable the amount looks next to your salary and the training you got, the more likely you pay all of it.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Sicpa India Ltd v Manas Pratim Deb, Delhi HC, RFA 596/2002 (Indian Kanoon); PSA Legal, "Retention Clauses under Scrutiny".</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Typical Bond Amounts and Durations</div>
                <div className="sec-sub">What public offers and court cases show</div>
              </div>
            </div>
            <p>There is no official register of bond terms, and companies change them by batch, so treat every figure below as one documented example, not a company-wide rule. Career blogs publish tables of "bond amounts by company", but they often contradict each other and rarely cite anything, so we left them out.</p>
            <div className="chart-wrap">
              <div className="chart-label">Bond amounts in documented offers and court cases (₹)</div>
              <div style={{ height: 300 }}>
                <canvas id="ebrAmountChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Employer / case</th><th>Period</th><th>Amount</th><th>Source</th></tr>
              </thead>
              <tbody>
                <tr><td>Wipro WILP (work-integrated degree programme)</td><td>60 months</td><td>₹75,000, pro rata</td><td>CSJMU placement notice, Jan 2025</td></tr>
                <tr><td>Tech Mahindra campus offer (NIT Jalandhar)</td><td>2 years</td><td>₹1 lakh</td><td>Business Today, Sep 2023 (student screenshot, not independently verified)</td></tr>
                <tr><td>Satyam Computer Services</td><td>Not stated in summary</td><td>₹2 lakh, cut to ₹1 lakh by court</td><td>PSA Legal summary</td></tr>
                <tr><td>Vijaya Bank (officer recruitment)</td><td>3 years</td><td>₹2 lakh, upheld</td><td>LiveLaw, May 2025</td></tr>
                <tr><td>Algonox Technologies, Hyderabad</td><td>Three successive agreements</td><td>₹5 lakh demanded</td><td>Siasat, Dec 2025</td></tr>
                <tr><td>Bharat Aviation (aircraft engineer)</td><td>3 years after training</td><td>₹10 lakh, held proportionate</td><td>PSA Legal; LiveLaw, May 2026</td></tr>
              </tbody>
            </table>
            <p>Bond terms should also be read next to pay. The same Wipro WILP notice lists a ₹75,000 joining bonus and a monthly stipend that rises from ₹15,000 in year one to ₹23,000 in year four. So the exit amount is about five months of first-year stipend.</p>
            <div className="chart-wrap">
              <div className="chart-label">Wipro WILP monthly stipend by year, as listed in the notice (₹)</div>
              <div style={{ height: 240 }}>
                <canvas id="ebrWilpChart" />
              </div>
            </div>
            <div className="callout">
              <strong>The ratio to watch:</strong> compare the exit amount with your monthly in-hand pay. A bond worth a few months' salary for real training is the kind courts tend to accept. A bond worth more than a year's pay for a short induction is the kind courts have cut.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: CSJMU placement notice (Jan 2025); Business Today (12 Sep 2023); LiveLaw (15 May 2025, 8 May 2026); Siasat (14 Dec 2025); PSA Legal.</p>
          </div>
          <StuCta via="report-employment-bond-report-freshers-2026" place="report-mid" size="quiet" title="More offers means you can walk away from a bad bond: Stu finds roles that fit you and who's hiring." />

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Can a Company Keep Your Original Certificates?</div>
                <div className="sec-sub">Courts have said no. Relieving letters are a separate fight.</div>
              </div>
            </div>
            <p>Some employers ask freshers to hand over original degree certificates or mark sheets at joining and keep them until the bond ends. Courts have repeatedly refused to back this.</p>
            <div className="blist">
              {[
                "Madras High Court (June 2014): a private engineering college kept a lecturer's originals after she left. The court said \"withholding of original certificates by the authorities on any ground is not legal and proper\", ordered them returned, and left the college free to sue for damages separately (LiveLaw).",
                "Orissa High Court (2023, Justice AK Mohapatra): 125 PG doctors' originals were held under a state bond policy. The court ordered them released, said the certificates are \"the assets of the persons concerned\", and let the authorities take an undertaking instead (Medical Dialogues, 28 Aug 2023).",
                "Telangana High Court (December 2025): hearing a software engineer's challenge to a ₹5 lakh exit demand, the court questioned a fixed sum with no formula tied to tenure or actual loss, and directed labour authorities to examine whether such clauses are an illegal bargain (Siasat).",
              ].map((t) => (
                <div className="blist-item" key={t}><div className="blist-dot" /><span>{t}</span></div>
              ))}
            </div>
            <p>The pattern: the employer's remedy for a broken bond is money, claimed through the proper route. Holding your degree certificate as leverage is not that route. Most of these cases involve colleges or government bodies rather than IT companies, so the exact outcome against a private employer will depend on facts, but the principle is consistent.</p>
            <p>Relieving letters and experience certificates are different. In Bharat Aviation v Rahul Sudhindra Soni, the Bombay High Court (Justice Sandeep V Marne) held in May 2026 that an engineer who resigned in breach of a three-year training bond could not force the employer to issue a relieving letter or service certificate, and that the employer had not given up its damages claim just by not yet suing (LiveLaw, 8 May 2026).</p>
            <div className="callout">
              <strong>Practical rule:</strong> give self-attested copies for verification and show originals in person. If a company insists on keeping originals, get a dated written receipt listing every document. And know that leaving mid-bond can cost you a relieving letter, which many background checks ask for.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: LiveLaw (22 Jun 2014; 8 May 2026); Medical Dialogues (28 Aug 2023); Siasat (14 Dec 2025).</p>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">You Want to Leave Early: Your Real Options</div>
                <div className="sec-sub">From cleanest to riskiest</div>
              </div>
            </div>
            <p>No court in India will force you to keep working for an employer: contracts of personal service are not specifically enforced, and the employer's remedy is money. So the question is never "can I leave", it is "what will leaving cost, and how do I keep that cost low".</p>
            <table className="data-table">
              <thead>
                <tr><th>Option</th><th>What it involves</th><th>Trade-off</th></tr>
              </thead>
              <tbody>
                <tr><td>Wait it out, or wait for pro rata to shrink</td><td>If the amount reduces monthly, every month you stay cuts what you owe</td><td><span className="tag-pill pill-green">Cleanest</span></td></tr>
                <tr><td>Negotiate a release in writing</td><td>Ask HR for the exact amount, how it was calculated, and a waiver or reduction</td><td><span className="tag-pill pill-green">Often worth trying</span></td></tr>
                <tr><td>Pay the amount and get a relieving letter</td><td>Get a written receipt and a clear "no further dues" statement</td><td><span className="tag-pill pill-amber">Costs money</span></td></tr>
                <tr><td>Pay under protest and challenge</td><td>What Mr Narnaware did in Vijaya Bank; he lost at the Supreme Court</td><td><span className="tag-pill pill-amber">Slow, uncertain</span></td></tr>
                <tr><td>Leave and dispute the sum</td><td>Employer must sue and prove loss; you may not get a relieving letter</td><td><span className="tag-pill pill-amber">Riskiest</span></td></tr>
              </tbody>
            </table>
            <p>If you dispute a demand, the questions a court will ask are the ones Sicpa and Satyam turned on: what training did you actually receive, what did it cost, and how much of the bond period did you already serve? Keep your own records: training schedules, emails, offer letter, every page you signed. If the company is holding your originals or a demand looks out of proportion, your state labour department is the first official stop, and the Telangana High Court case shows courts expect those departments to act.</p>
            <div className="callout">
              <strong>Do not resign before you have the next offer in writing.</strong> A bond dispute is far easier to handle with a confirmed joining date and an employer who knows the situation than while you are unemployed.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: LiveLaw (15 May 2025); Sicpa India v Manas Pratim Deb (Indian Kanoon); PSA Legal; Siasat (14 Dec 2025).</p>
          </div>

          {/* Section 7 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">7</div>
              <div>
                <div className="sec-title">What to Check Before You Sign</div>
                <div className="sec-sub">Ten minutes now saves a lakh later</div>
              </div>
            </div>
            <p>Most bond trouble starts with a fresher signing a document they never fully read. The court cases above tell you exactly which details end up mattering.</p>
            <div className="blist">
              {[
                "Get the full bond text before you accept the offer, not on joining day.",
                "Is the amount fixed, or does it reduce pro rata as you serve? Pro rata is fairer and closer to what courts award.",
                "What training is the bond tied to? A named programme with real cost is different from a two-week induction.",
                "Does it start from your joining date or from the end of training? Bharat Aviation's three years ran from after training.",
                "Is there a separate notice period on top of the bond?",
                "Is there any clause about holding original certificates? Ask for it to be removed or replaced with copies.",
                "Is there a post-exit non-compete? It is generally void, but note it.",
                "Do you get a signed copy? Keep it, with your offer letter, in your own email.",
              ].map((t) => (
                <div className="blist-item" key={t}><div className="blist-dot" /><span>{t}</span></div>
              ))}
            </div>
            <div className="highlight">
              A bond is not automatically a reason to refuse a job. A fair, pro rata bond tied to genuine training, at a company you would stay at anyway, can be a reasonable trade. A large fixed sum, a long period and a demand for your originals together are the warning sign.
            </div>
            <div className="callout">
              <strong>Ask questions in writing:</strong> an email asking HR to confirm the bond amount, period and how it is calculated is polite, normal and creates a record. A company that will not answer that clearly has told you something.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Studojo analysis of the rulings cited above (Vijaya Bank 2025, Sicpa 2011, Satyam, Bharat Aviation 2026).</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The bond questions freshers search for, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to handle a bond as a fresher</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The law in 2026 is more balanced than either "bonds are illegal" or "you must pay whatever they say":</p>
            <div className="blist">
              {[
                ["Assume the bond is valid", "After Vijaya Bank (2025), a minimum service clause is not void just because it limits when you can quit."],
                ["But the amount must be fair", "Section 74 lets courts cut inflated sums to real, proven loss, as in Sicpa and Satyam."],
                ["Keep your originals", "Give copies. Courts have ordered originals returned more than once."],
                ["Plan for the relieving letter", "After the 2026 Bombay ruling, leaving mid-bond can cost you one. Factor that into any exit."],
                ["Line up the next role first", "Talk to the person hiring you about your joining date and situation before you resign."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" style={{ background: "#6d28d9" }} />
                  <span style={{ color: "#3b0764" }}><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
            <p style={{ color: "#3b0764", fontSize: 13 }}>This is general information, not legal advice. For a specific bond or demand, consult a qualified lawyer.</p>
          </div>

          {/* Related reports */}
          <div className="related">
            <h2>Related reports</h2>
            <div className="related-grid">
              <Link to="/reports/it-services-hiring-report-tcs-infosys-wipro-2026" className="related-card">
                <div className="rc-kicker">IT services</div>
                <div className="rc-title">The IT Services Hiring Report 2026: TCS, Infosys, Wipro and How Freshers Get In</div>
              </Link>
              <Link to="/reports/background-verification-report-what-bgv-checks-2026" className="related-card">
                <div className="rc-kicker">Background checks</div>
                <div className="rc-title">The Background Verification Report: What BGV Actually Checks and What Fails It</div>
              </Link>
              <Link to="/reports/ctc-illusion-report-what-12-lpa-pays-in-hand-2026" className="related-card">
                <div className="rc-kicker">Offers</div>
                <div className="rc-title">The CTC Illusion Report: What a 12 LPA Offer Actually Pays In Hand</div>
              </Link>
            </div>
          </div>
          <StuCta via="report-employment-bond-report-freshers-2026" place="report-end" size="card" title="Want more offers to choose from?" line="Tell Stu the role, the city and the pay you want in one short call. Stu finds jobs that fit you, finds who's hiring and writes the email to them." />
        </div>
      </main>
      <Footer />
    </>
  );
}
