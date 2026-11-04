import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "PM Internship Scheme 2026: ₹9,000 Stipend, Eligibility, Dropouts and Job Odds | Studojo" },
    { name: "description", content: "The PM Internship Scheme now pays ₹9,000 a month. But only about 30% of accepted offers turned into joinings and 53.6% of round 1 joiners left early. Eligibility, stipend, dropouts and whether it leads to a job." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "pm internship scheme, pm internship scheme 2026, pm internship stipend, pm internship eligibility, is pm internship worth it, pm internship scheme job guarantee, pmis dropout, pm internship 9000 stipend" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/pm-internship-scheme-report-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The PM Internship Scheme Report: ₹9,000 a Month, Who Finishes, and Does It Lead to a Job?" },
    { property: "og:description", content: "Eligibility, the ₹5,000 to ₹9,000 stipend change, the offer to joining funnel, why interns drop out, and an honest verdict on who should take PMIS." },
    { property: "og:url", content: `${BASE_URL}/reports/pm-internship-scheme-report-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-05T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The PM Internship Scheme Report 2026 | Studojo" },
    { name: "twitter:description", content: "₹9,000 a month, 18 to 25 age limit, and a dropout problem. Who finishes PMIS, and does it lead to a job?" },
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

  // Chart 1: round 1 funnel, offers to completions (ThePrint, 13 Mar 2026; Policy Circle, 1 Oct 2026)
  const funnelEl = document.getElementById("pmisFunnelChart") as HTMLCanvasElement | null;
  if (funnelEl && !funnelEl.dataset.rendered) {
    funnelEl.dataset.rendered = "1";
    new Chart(funnelEl, {
      type: "bar",
      data: {
        labels: ["Offers made", "Offers accepted", "Actually joined", "Completed (Aug 2026)"],
        datasets: [{
          label: "Round 1 candidates",
          data: [60866, 28144, 8760, 3731],
          backgroundColor: [VIOLET3, VIOLET2, VIOLET, GREEN],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${Number(ctx.raw).toLocaleString("en-IN")}` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: offers vs joinings by pilot round (Policy Circle, 1 Oct 2026)
  const roundEl = document.getElementById("pmisRoundChart") as HTMLCanvasElement | null;
  if (roundEl && !roundEl.dataset.rendered) {
    roundEl.dataset.rendered = "1";
    new Chart(roundEl, {
      type: "bar",
      data: {
        labels: ["Round 1 (2024)", "Round 2 (2025)", "Round 3 (2026, in progress)"],
        datasets: [
          { label: "Offers made", data: [60866, 71192, 25794], backgroundColor: VIOLET3, borderRadius: 6, borderWidth: 0 },
          { label: "Joined", data: [8760, 7300, 14620], backgroundColor: VIOLET, borderRadius: 6, borderWidth: 0 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString("en-IN")}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: what happened to round 1 joiners, as of 6 Aug 2026 (Policy Circle, 1 Oct 2026)
  const outEl = document.getElementById("pmisOutcomeChart") as HTMLCanvasElement | null;
  if (outEl && !outEl.dataset.rendered) {
    outEl.dataset.rendered = "1";
    new Chart(outEl, {
      type: "doughnut",
      data: {
        labels: ["Left before completion", "Completed", "Other / not yet reported"],
        datasets: [{
          data: [4698, 3731, 331],
          backgroundColor: [RED, GREEN, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${Number(ctx.raw).toLocaleString("en-IN")} of 8,760 joiners` } },
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
    q: "What is the stipend in the PM Internship Scheme?",
    a: "The stipend is ₹9,000 a month, raised from ₹5,000 with effect from March 2026, and the increase applies to both ongoing and new interns (Angel One, 18 March 2026). The government pays ₹8,100 directly to your bank account and the company pays ₹900, usually from its CSR funds (ThePrint, 13 March 2026). There is also a one-time ₹6,000 grant on joining.",
  },
  {
    q: "What is the age limit for the PM Internship Scheme?",
    a: "The age limit is now 18 to 25 years, widened in March 2026 from the original 21 to 24 (ThePrint, 13 March 2026). Many older guides and coaching sites still show 21 to 24, so if a page quotes that range it was written before the revamp. Final-year undergraduate and postgraduate students can also apply now, with a no-objection certificate from their institution (Angel One, 24 April 2026).",
  },
  {
    q: "Who is not eligible for the PM Internship Scheme?",
    a: "You are not eligible if you are in full-time employment, if a family member holds a permanent government job, or if you are a graduate of a premier institute such as an IIT, IIM, IISER, NLU or IISc (PW, 24 April 2026; Careers360, 21 April 2026). Sources disagree on two points: the family income cap (₹8 lakh in the original rules, ₹12 lakh in some 2026 guides) and whether MBA and other postgraduate degree holders are excluded. Check the current rules on pminternship.mca.gov.in before you apply.",
  },
  {
    q: "Does the PM Internship Scheme guarantee a job?",
    a: "No. The scheme does not guarantee a job; its stated aim is to improve employability (Angel One, 18 March 2026). The government has not published any figure for how many interns were hired after finishing. ThePrint (7 June 2026) found individual interns who got full-time offers from companies like ITC, but no aggregate absorption data exists.",
  },
  {
    q: "Why are so many people dropping out of the PM Internship Scheme?",
    a: "The main reasons given are location, money and fit. In a February 2026 parliamentary reply, the government said many candidates would not travel beyond 5 to 10 km, the 12-month length was longer than most skilling programmes, and there was limited interest in the roles offered (ThePrint, 2 February 2026). About 44% of the 16,060 interns who joined in the first two rounds had exited by January 2026.",
  },
  {
    q: "Is the PM Internship Scheme worth it?",
    a: "It is worth it if you have no formal work experience, the internship is near home or the company is one you would want to work for, and the role matches what you want to do next. It is a weaker deal if you must relocate to a metro on ₹9,000 a month, or if you already have private internship offers paying 10,000 to 20,000 rupees, the most common stated stipend band in Studojo's October 2026 listings data.",
  },
];

export default function PmInternshipSchemeReport() {
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
        "headline": "The PM Internship Scheme Report: ₹9,000 a Month, Who Finishes, and Does It Lead to a Job?",
        "description": "Eligibility, the ₹5,000 to ₹9,000 stipend change, the offer to joining funnel, why interns drop out, and an honest verdict on who should take PMIS.",
        "url": `${BASE_URL}/reports/pm-internship-scheme-report-2026`,
        "datePublished": "2026-11-05T00:00:00Z",
        "dateModified": "2026-11-05T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/pm-internship-scheme-report-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The PM Internship Scheme Report 2026", "item": `${BASE_URL}/reports/pm-internship-scheme-report-2026` },
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
              <span>PM Internship Scheme 2026</span>
            </nav>
            <h1>The PM Internship Scheme: ₹9,000 a Month, <em>Who Finishes</em>, and Does It Lead to a Job?</h1>
            <p className="rpt-hero-sub">
              The government's flagship internship now pays ₹9,000 a month and takes 18 to 25 year
              olds. We pulled the parliamentary numbers on who gets an offer, who shows up, who quits
              and who finishes, and what the scheme does and does not promise you.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · PMIS pilot rounds 1 to 3</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Data</span>
                <span className="rpt-meta-value">Parliament replies, MCA, news reports</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Updated</span>
                <span className="rpt-meta-value">5 November 2026</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The stipend is now ₹9,000 a month</strong> (₹8,100 from the government, ₹900 from the company), up from ₹5,000, effective March 2026, plus a one-time ₹6,000 grant.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The age limit is 18 to 25</strong>, widened from 21 to 24. Sources still conflict on the income cap (₹8 lakh or ₹12 lakh) and on MBA eligibility.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>In the first two rounds, <strong>52,600 people accepted an offer but only 16,060 joined</strong>, about 30%.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>53.6% of round 1 joiners left before finishing.</strong> Location, a low stipend for relocation and poorly matched roles are the main reasons given.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>There is no job guarantee</strong>, and no official data on how many finishers got hired.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">₹9,000</div>
              <div className="sc-label">monthly stipend from March 2026, up from ₹5,000</div>
              <div className="sc-source">ThePrint, 13 Mar 2026; Angel One, 18 Mar 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">30%</div>
              <div className="sc-label">of accepted offers in rounds 1 and 2 turned into an actual joining (16,060 of 52,600)</div>
              <div className="sc-source">Lok Sabha reply via ThePrint, 2 Feb 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">53.6%</div>
              <div className="sc-label">of round 1 joiners left before completing the internship</div>
              <div className="sc-source">ThePrint, 13 Mar 2026; Policy Circle, 1 Oct 2026</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">What PMIS Is, and Who Can Apply</div>
                <div className="sec-sub">The eligibility rules changed in 2026, and many sites have not caught up</div>
              </div>
            </div>
            <p>The Prime Minister's Internship Scheme (PMIS) is run by the Ministry of Corporate Affairs. It launched as a pilot on 3 October 2024 with a stated five-year goal of one crore internships, originally in India's top 500 companies by CSR spending (Policy Circle, 1 October 2026). You apply on the official portal, pminternship.mca.gov.in, pick internships by location and sector, and companies make offers. At least half of the internship is meant to be spent in a real job environment, not a classroom (Careers360, 21 April 2026).</p>
            <p>The rules were loosened in March and April 2026. The age range moved from 21 to 24 to 18 to 25 (ThePrint, 13 March 2026), and final-year undergraduate and postgraduate students became eligible, as long as their institution gives a no-objection certificate (Angel One, 24 April 2026). That is why you will find two different age limits online. If a guide says 21 to 24, it was written for the 2024 and 2025 rounds.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>What sources say</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Age</td><td>18 to 25 from March 2026; 21 to 24 before that (ThePrint, 13 Mar 2026)</td><td><span className="tag-pill pill-green">Settled</span></td></tr>
                <tr><td>Final-year students</td><td>Eligible from April 2026 with an institute NOC (Angel One, 24 Apr 2026)</td><td><span className="tag-pill pill-green">Settled</span></td></tr>
                <tr><td>Education</td><td>Class 10, Class 12, ITI, polytechnic diploma, UG and PG holders (PW, 24 Apr 2026)</td><td><span className="tag-pill pill-green">Settled</span></td></tr>
                <tr><td>Family income cap</td><td>₹8 lakh a year in the original rules; ₹12 lakh in some 2026 guides (PW, 24 Apr 2026)</td><td><span className="tag-pill pill-amber">Conflicting</span></td></tr>
                <tr><td>MBA and PG degree holders</td><td>Angel One (23 Mar 2026) says postgraduates and MBAs are now eligible; Careers360 and PW (April 2026) say MBA, CA and similar professional degrees are excluded</td><td><span className="tag-pill pill-amber">Conflicting</span></td></tr>
                <tr><td>Premier institutes</td><td>Graduates of IIT, IIM, IISER, NLU, IISc and similar are excluded (PW, 24 Apr 2026)</td><td><span className="tag-pill pill-green">Settled</span></td></tr>
                <tr><td>Other exclusions</td><td>Full-time job, a family member in a permanent government job, past NATS or NAPS training (PW, 24 Apr 2026)</td><td><span className="tag-pill pill-green">Settled</span></td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>Before you apply:</strong> the income cap and the MBA rule are the two places where reputable sites disagree. Read the eligibility page on pminternship.mca.gov.in on the day you apply, and do not rely on a coaching blog or a YouTube video from 2025.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: ThePrint (13 Mar 2026), Angel One (23 Mar and 24 Apr 2026), PW (24 Apr 2026), Careers360 (21 Apr 2026), Policy Circle (1 Oct 2026).</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">The Money: ₹5,000 Became ₹9,000</div>
                <div className="sec-sub">Who pays what, and when the change kicked in</div>
              </div>
            </div>
            <p>When PMIS launched, interns got ₹5,000 a month: ₹4,500 from the government and ₹500 from the company, mostly out of CSR funds, plus a one-time ₹6,000 grant for incidentals (ThePrint, 2 February 2026). After the first two rounds went badly, the government raised the monthly amount to ₹9,000, effective March 2026, and said the hike covers ongoing interns as well as new ones (Angel One, 18 March 2026, citing the Ministry of Corporate Affairs in Parliament).</p>
            <p>The split kept the same 90:10 shape. The government now pays ₹8,100 by direct benefit transfer and the company pays ₹900 (ThePrint, 13 March 2026). Careers360 (21 April 2026) adds that the payment depends on attendance and performance, so a missed month can cost you.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Before March 2026</th>
                  <th>From March 2026</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Monthly stipend</td><td>₹5,000</td><td>₹9,000</td></tr>
                <tr><td>Government share</td><td>₹4,500</td><td>₹8,100 (via DBT)</td></tr>
                <tr><td>Company share</td><td>₹500</td><td>₹900</td></tr>
                <tr><td>One-time joining grant</td><td>₹6,000</td><td>₹6,000 (listed in April 2026 guides; ThePrint's revamp report does not mention it)</td></tr>
                <tr><td>Duration</td><td>12 months</td><td>6 to 9 months, set by the employer</td></tr>
              </tbody>
            </table>
            <div className="highlight">
              On paper, a 9-month internship now pays ₹81,000 in stipend plus the ₹6,000 grant. The old 12-month version paid ₹60,000 plus the grant. More money in less time, which is the point of the revamp.
            </div>
            <div className="callout">
              <strong>The honest comparison:</strong> ₹9,000 is fine if you live at home. It is thin if you move to a metro and pay rent and food. Policy Circle (1 October 2026) makes the same point: the stipend looks acceptable in the abstract, much less so when you have to relocate.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: ThePrint (2 Feb and 13 Mar 2026), Angel One (18 Mar 2026), Careers360 (21 Apr 2026), PW (24 Apr 2026), Policy Circle (1 Oct 2026). Our 9-month total is simple arithmetic on the stated stipend.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Applications, Offers, Joinings, Completions</div>
                <div className="sec-sub">Lakhs apply, a few thousand finish</div>
              </div>
            </div>
            <p>Interest was never the problem. Round 1, launched in October 2024, drew about 6.21 lakh applications, and round 2, launched in early 2025, drew about 4.55 lakh (Angel One, 18 March 2026). The problem is what happens between an offer and a finished internship.</p>
            <p>In round 1, companies made 60,866 offers. 28,144 were accepted, 8,760 people actually joined, and 3,731 had completed by 6 August 2026 (ThePrint, 13 March 2026; Policy Circle, 1 October 2026). Note that one ThePrint report (2 February 2026) puts round 1 offers at about 82,000; the difference is likely offers counted per candidate versus total, so we use the lower figure that both ThePrint (March) and Policy Circle agree on.</p>
            <div className="chart-wrap">
              <div className="chart-label">Round 1: from offer to completion (ThePrint, Mar 2026; Policy Circle, Oct 2026)</div>
              <div style={{ height: 260 }}>
                <canvas id="pmisFunnelChart" />
              </div>
            </div>
            <p>Across rounds 1 and 2 together, 52,600 offers were accepted but only 16,060 people physically joined, which is about 30%, according to a written Lok Sabha reply by Minister of State for Corporate Affairs Harsh Malhotra (ThePrint, 2 February 2026). Round 3, after the revamp, looks much better: 25,794 offers and 14,620 joinings by August, a 56.7% offer to joining rate (Policy Circle, 1 October 2026). By mid-October, ThePrint (13 October 2026) reported more than 30,000 round 3 joinings, more than the first two rounds combined.</p>
            <div className="chart-wrap">
              <div className="chart-label">Offers made vs candidates who joined, by pilot round (Policy Circle, Oct 2026)</div>
              <div style={{ height: 300 }}>
                <canvas id="pmisRoundChart" />
              </div>
            </div>
            <div className="callout">
              <strong>What this tells you:</strong> getting a PMIS offer is not hard. Across the first three rounds, companies posted 4,00,822 opportunities and about 39% led to offers (Policy Circle, 1 October 2026). The hard part is getting an offer you will actually take and finish, which means choosing location and role carefully at the application stage.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: Angel One (18 Mar 2026), ThePrint (2 Feb, 13 Mar and 13 Oct 2026), Policy Circle (1 Oct 2026). Round 3 figures are in progress and will change.</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Who Drops Out, and Why</div>
                <div className="sec-sub">44%, 7,292, 53.6%: three numbers for the same problem</div>
              </div>
            </div>
            <p>You will see several dropout figures quoted, and they are all real; they just measure different things at different dates. The February 2026 Lok Sabha reply said 7,094 of 16,060 joiners in rounds 1 and 2 had exited before completion by January 2026, about 44% (ThePrint, 2 February 2026). By March, the ministry's count of exits across both rounds had risen to 7,292 (Angel One and Business Standard, 18 March 2026). For round 1 alone, 4,698 of 8,760 joiners had left by August 2026, or 53.6% (Policy Circle, 1 October 2026). Round 2's attrition was lower at 33.7% (ThePrint, 13 March 2026).</p>
            <div className="chart-wrap">
              <div className="chart-label">What happened to round 1's 8,760 joiners, as of 6 Aug 2026 (Policy Circle, Oct 2026)</div>
              <div style={{ height: 280 }}>
                <canvas id="pmisOutcomeChart" />
              </div>
            </div>
            <p>The reasons come from the government itself and from analysts. The ministry told Parliament that many candidates were unwilling to travel beyond 5 to 10 km, that the 12-month tenure was longer than most skilling programmes, and that there was limited interest in the roles offered (ThePrint, 2 February 2026). ThePrint (7 June 2026) added the government's mention of a low stipend, and TeamLease EdTech founder Shantanu Rooj pointed to a mismatch between what candidates expected and what the internships were.</p>
            <div className="blist">
              {[
                ["Location", "Many internships required moving cities. Candidates were unwilling to travel more than 5 to 10 km (Lok Sabha reply, Feb 2026)."],
                ["Stipend", "₹5,000, and even ₹9,000, does not cover rent and food in a metro (Policy Circle, Oct 2026)."],
                ["Role quality and fit", "Policy Circle's example: an accounting graduate offered a sales internship in another state. Roles unrelated to your degree do little for your CV."],
                ["Duration and opportunity cost", "12 months was long. Taking PMIS means passing on other jobs or exam prep for the whole period."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" />
                  <span><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
            <p>The revamp targets exactly these points: higher pay, a shorter 6 to 9 month term, and geo-tagged locations so vacancies and candidates can be moved between places (Policy Circle, 1 October 2026). Early signs are positive. Preliminary round 3 attrition is about 10% (ThePrint, 13 October 2026), though that is early in the internships.</p>
            <div className="callout">
              <strong>For you:</strong> most people who quit PMIS did not fail at the work. They accepted something far from home, in a role they did not want, at a stipend that did not cover the move. Filter for those three things before you accept.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: ThePrint (2 Feb, 13 Mar, 7 Jun and 13 Oct 2026), Angel One (18 Mar 2026), Business Standard (18 Mar 2026), Policy Circle (1 Oct 2026).</p>
          </div>
          <StuCta via="report-pm-internship-scheme-report-2026" place="report-mid" size="quiet" title="Stu finds internships that fit you and the person hiring for each one, after one short call." />

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The 2026 Revamp: More Sectors, More Companies, Less Money</div>
                <div className="sec-sub">What changed for round 3, and what it means for the budget</div>
              </div>
            </div>
            <p>Beyond the stipend and the age limit, the March 2026 changes widened who can offer internships. The scheme now includes semiconductors, renewable energy and global capability centres (GCCs), and companies without a mandatory CSR obligation can take part (Angel One, 23 March 2026). Companies can also list internships on a rolling basis through the year instead of in fixed phases.</p>
            <p>The employer pool grew from 500 to about 2,000 companies, and now includes statutory bodies such as the Airports Authority of India and the Shipping Corporation of India, MSMEs, GCCs and professional bodies like ICAI (ThePrint, 13 October 2026). IT services and manufacturing had the strongest participation. Round 3's target is 1.1 lakh enrolments, offers will be posted until December 2026, and candidates can join until January 2027 (ThePrint, 13 October 2026).</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>PMIS budget</th>
                  <th>What happened</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>FY 2024-25</td><td>₹2,000 crore allocated</td><td>₹29.29 crore spent (Policy Circle)</td></tr>
                <tr><td>FY 2025-26</td><td>₹10,831 crore budgeted, revised to ₹526 crore</td><td>₹87.46 crore spent by 28 Feb 2026 (Policy Circle; ThePrint)</td></tr>
                <tr><td>FY 2026-27</td><td>₹4,788 crore</td><td>Cut by over half from the previous budget estimate (ThePrint, 2 Feb 2026)</td></tr>
              </tbody>
            </table>
            <div className="highlight">
              The budget cuts reflect low uptake, not a smaller ambition. The government spent less than 1% of the ₹10,831 crore set aside for FY 2025-26, because far fewer people joined than planned.
            </div>
            <div className="callout">
              <strong>Why this matters to you:</strong> round 3 is the best version of PMIS so far, and ThePrint reports it may be the last pilot before a full rollout, though no decision has been made. If you are eligible, the window to join is open until January 2027.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: Angel One (23 Mar 2026), ThePrint (2 Feb and 13 Oct 2026), Policy Circle (1 Oct 2026).</p>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">Does It Lead to a Job? Who Should Take It</div>
                <div className="sec-sub">No guarantee, no official hiring data, a real foot in the door for some</div>
              </div>
            </div>
            <p>PMIS does not guarantee a job. Its aim, in the ministry's framing, is to improve employability (Angel One, 18 March 2026). More importantly, the government has not published how many finishers received a job offer from their host company. ThePrint (7 June 2026) found interns who were hired after completing internships at companies like ITC and GAIL, and one who finished at Wipro without an offer. Those are individual stories, not a rate, and nobody should read them as one.</p>
            <p>What the scheme does give you is a named company on your CV, real work for 6 to 9 months, and a manager who has seen you work. That last part is what turns internships into jobs anywhere: the person who supervised you can vouch for you, or hire you.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Your situation</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>No work experience, from a tier 2 or tier 3 town, internship available near home</td><td><span className="tag-pill pill-green">Take it</span> ₹9,000 at home goes far, and a known company name helps</td></tr>
                <tr><td>ITI or diploma holder looking at manufacturing or plant roles</td><td><span className="tag-pill pill-green">Take it</span> manufacturing is one of the strongest sectors in the scheme</td></tr>
                <tr><td>Role matches your degree, at a company you would want to join</td><td><span className="tag-pill pill-green">Take it</span> and treat it as a 9-month interview</td></tr>
                <tr><td>Must relocate to a metro, role unrelated to your field</td><td><span className="tag-pill pill-amber">Think hard</span> this is the profile that dropped out most</td></tr>
                <tr><td>Already holding private internship offers paying more</td><td><span className="tag-pill pill-amber">Probably skip</span> stated private stipends commonly run 10,000 to 20,000 rupees a month (Studojo listings data, Oct 2026)</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>How to make it count:</strong> if you take PMIS, do not wait for an offer to appear in month nine. In the first month, find out who decides on hiring in your team, show them your work, and ask early what it would take to stay on. If the host company cannot hire, ask your supervisor which other teams or firms they would recommend you to.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: Angel One (18 Mar 2026), ThePrint (7 Jun and 13 Oct 2026), Studojo listings data (October 2026). Verdicts are Studojo's judgement based on the dropout reasons above.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The questions people ask about the PM Internship Scheme, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to use PMIS without becoming a dropout statistic</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The numbers point to a simple plan:</p>
            <div className="blist">
              {[
                ["Check eligibility on the official portal", "The age limit is 18 to 25 now, but the income cap and MBA rule differ across sources. Trust pminternship.mca.gov.in, not old blogs."],
                ["Filter by location first", "Distance was the top reason people never joined or quit. Apply near home, or only where ₹9,000 covers your costs."],
                ["Pick the role, not just the company", "A big name in an unrelated role does little for you. Choose work you want to do next."],
                ["Treat the internship as an audition", "There is no job guarantee. Make sure the person who can hire you sees your work early."],
                ["Keep a second route open", "PMIS is one door. Writing directly to hiring managers at companies you want runs in parallel and does not depend on a portal."],
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
              <Link to="/reports/return-offer-report-why-some-interns-get-hired-2026" className="related-card">
                <div className="rc-kicker">Internships</div>
                <div className="rc-title">The Return Offer Report: Why Some Interns Get Hired and Others Don't</div>
              </Link>
              <Link to="/reports/internships-15k-india-2026" className="related-card">
                <div className="rc-kicker">Stipends</div>
                <div className="rc-title">Roles That Land You Above ₹15k: The Internship Map India 2026</div>
              </Link>
              <Link to="/reports/tier-2-cities-hiring-jobs-leaving-bangalore-mumbai-2026" className="related-card">
                <div className="rc-kicker">Cities</div>
                <div className="rc-title">Tier 2 Cities Are Hiring: The Jobs Leaving Bangalore and Mumbai</div>
              </Link>
            </div>
          </div>
          <StuCta via="report-pm-internship-scheme-report-2026" place="report-end" size="card" title="Want an internship that leads somewhere?" line="Tell Stu the field, the city and the stipend you want in one short call. Stu finds internships that fit you, finds who's hiring and writes the email to them." />
        </div>
      </main>
      <Footer />
    </>
  );
}
