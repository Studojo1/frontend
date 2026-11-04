import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";
const SLUG = "best-job-portal-freshers-india-2026";

export function meta() {
  return [
    { title: "Naukri vs LinkedIn vs Indeed vs Internshala: Best Job Portal for Freshers in 2026 | Studojo" },
    { name: "description", content: "Naukri holds 115 million resumes, LinkedIn India over 160 million members, and 61% of freshers still hear little or nothing back. We compare Naukri, LinkedIn, Indeed, Internshala, Apna, Unstop and foundit for freshers, with sources." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "best job portal for freshers, naukri vs linkedin, best job site in india for freshers, is naukri premium worth it, naukri fastforward worth it, internshala vs linkedin, foundit for freshers, apna for freshers, unstop for freshers, linkedin premium worth it india" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/${SLUG}` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Naukri vs LinkedIn vs Indeed vs Internshala: Which Job Portal Works for Freshers in 2026?" },
    { property: "og:description", content: "Size, roles, pay, paid upgrades, response rates and scam risk for India's main job portals, compared with sourced numbers. Plus the honest verdict on how freshers should use them." },
    { property: "og:url", content: `${BASE_URL}/reports/${SLUG}` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-12T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Which Job Portal Works for Freshers in 2026? | Studojo" },
    { name: "twitter:description", content: "Naukri, LinkedIn, Indeed, Internshala, Apna, Unstop and foundit compared for Indian freshers, with sources. Portals are for discovery. Reaching the person is what gets you read." },
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

  // Chart 1: self-reported scale of each portal in India (millions; definitions differ, see table)
  const sizeEl = document.getElementById("bjpSizeChart") as HTMLCanvasElement | null;
  if (sizeEl && !sizeEl.dataset.rendered) {
    sizeEl.dataset.rendered = "1";
    new Chart(sizeEl, {
      type: "bar",
      data: {
        labels: [
          "LinkedIn India (members, Sep 2025)",
          "Naukri (resumes, FY26)",
          "Apna (users, Dec 2025)",
          "Internshala (candidates, Nov 2026)",
          "Unstop (users, Dec 2025)",
        ],
        datasets: [{
          label: "Millions",
          data: [160, 115, 60, 32, 28],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET3, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} million (company-reported)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: Internshala internship opportunities by sector, 2024 (Internshala Internship Trends Report 2024)
  const sectorEl = document.getElementById("bjpSectorChart") as HTMLCanvasElement | null;
  if (sectorEl && !sectorEl.dataset.rendered) {
    sectorEl.dataset.rendered = "1";
    new Chart(sectorEl, {
      type: "doughnut",
      data: {
        labels: ["Management", "Engineering", "Media", "Design", "Education", "All other"],
        datasets: [{
          data: [42, 20, 13, 4, 4, 17],
          backgroundColor: [VIOLET, VIOLET2, VIOLET3, "#ddd6fe", "#ede9fe", "#d4d4d4"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of internship opportunities` } },
        },
      },
    });
  }

  // Chart 3: what freshers report after applying (Indeed Fresher Hiring Report, June 2026)
  const freshEl = document.getElementById("bjpFresherChart") as HTMLCanvasElement | null;
  if (freshEl && !freshEl.dataset.rendered) {
    freshEl.dataset.rendered = "1";
    new Chart(freshEl, {
      type: "bar",
      data: {
        labels: [
          "Say entry-level roles now ask for experience",
          "Demoralised by repeated rejections",
          "Heard little or nothing back on job applications",
          "Little or no response on internship applications",
          "Say getting shortlisted is the biggest hurdle",
        ],
        datasets: [{
          label: "% of freshers surveyed",
          data: [72, 64, 61, 61, 49],
          backgroundColor: [VIOLET2, VIOLET2, RED, RED, VIOLET],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of respondents` } },
        },
        scales: {
          x: { min: 0, max: 100, grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}%` } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
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
    q: "Which is the best job portal for freshers in India?",
    a: "There is no single best portal: Naukri has the biggest resume pool (about 115 million resumes at FY26 year end, per Info Edge), LinkedIn has the most white-collar reach (over 160 million India members, per LinkedIn in September 2025), Internshala is built for internships, and Apna covers mass-market roles. Use one or two for discovery that match your role type. Then find the person who owns the role and write to them, because 61% of freshers in Indeed's June 2026 Fresher Hiring Report heard little or nothing back from applications.",
  },
  {
    q: "Is Naukri better than LinkedIn for freshers?",
    a: "Naukri is better for volume of Indian listings and recruiter resume search, and LinkedIn is better for finding and researching the actual people at a company. Naukri reported a database of 115 million resumes for FY26 (Info Edge results coverage, May 2026), so standing out there is hard. LinkedIn says applicants per open role in India have more than doubled since early 2022 (LinkedIn data reported January 2026). Most freshers do best using Naukri to find openings and LinkedIn to find the hiring manager.",
  },
  {
    q: "Is Naukri FastForward or Naukri premium worth it for freshers?",
    a: "There is no independent evidence that it gets freshers more interviews. Naukri's own FAQ says Resume Display marks you as a featured candidate and refreshes your resume weekly so it shows higher in recruiter search, for 3 or 6 months. That changes your position in a recruiter's search, not what they think of your resume. Third-party price quotes vary, roughly 700 to 900 rupees a month, so check the current price and refund terms on Naukri before paying.",
  },
  {
    q: "Is LinkedIn Premium worth it for freshers in India?",
    a: "Maybe for one focused month, not as a habit. LinkedIn's Premium Career page claims subscribers are 2.7x more likely to get hired on average (LinkedIn data, January 2022) and 2x more likely to hear back from a recruiter on Top Choice jobs (LinkedIn data, June 2026). These are LinkedIn's own numbers with no published method, and people who pay are often the most active searchers anyway. India pricing has been reported at roughly 1,400 to 1,900 rupees a month.",
  },
  {
    q: "Internshala vs LinkedIn: which is better for internships?",
    a: "Internshala is better for finding student internships, and LinkedIn is better for reaching the people who run them. Internshala's site claims 3.2 crore+ candidates, and its 2024 trends report put the average stipend at 8,000 rupees a month, with management roles making up 42% of opportunities. LinkedIn has fewer listings aimed at students but lets you find the team lead or founder and message or email them directly.",
  },
  {
    q: "Are jobs on Naukri, Indeed and Apna fake?",
    a: "Most listings on large portals are real, but scams show up across platforms, and impostors copy portal branding. In Indeed's 2026 survey of 1,161 Indian workers, 93% said they had come across suspicious or fraudulent job offers and 51% were not confident they could tell a real recruiter from a scammer. In April 2025, Kanpur police reported a gang that used fake websites imitating Naukri.com and other portals. A genuine employer never asks you to pay for a job.",
  },
];

export default function BestJobPortalFreshersReport() {
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
        "headline": "Naukri vs LinkedIn vs Indeed vs Internshala: Which Job Portal Works for Freshers in 2026?",
        "description": "Size, roles, pay, paid upgrades, response rates and scam risk for India's main job portals, compared with sourced numbers, and how freshers should use them.",
        "url": `${BASE_URL}/reports/${SLUG}`,
        "datePublished": "2026-11-12T00:00:00Z",
        "dateModified": "2026-11-12T00:00:00Z",
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
          { "@type": "ListItem", "position": 3, "name": "Best Job Portal for Freshers in India, 2026", "item": `${BASE_URL}/reports/${SLUG}` },
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
              <span>Best Job Portal for Freshers, 2026</span>
            </nav>
            <h1>Naukri vs LinkedIn vs Indeed vs Internshala: Which Job Portal <em>Works</em> for Freshers in 2026?</h1>
            <p className="rpt-hero-sub">
              We compared India's main job portals on what a fresher actually cares about: how big
              they are, which roles and pay they carry, whether the paid upgrades do anything, how
              often anyone replies, and how much scam risk you take on. Every number is sourced.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Freshers and interns</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Portals</span>
                <span className="rpt-meta-value">Naukri, LinkedIn, Indeed, Internshala, Apna, Unstop, foundit</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Data</span>
                <span className="rpt-meta-value">Company disclosures and surveys, 2024 to 2026</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Naukri is the biggest Indian resume pool</strong> at about 115 million resumes (Info Edge, FY26). LinkedIn India passed 160 million members (LinkedIn, September 2025). Big pools mean more competition, not better odds.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Each portal has a lane.</strong> Internshala is student internships (average stipend 8,000 rupees a month in 2024), Apna is mass-market and frontline roles, Unstop is competitions and campus hiring, LinkedIn and Naukri are white-collar.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>61% of freshers heard little or nothing back</strong> after applying for jobs (Indeed Fresher Hiring Report, June 2026). LinkedIn says applicants per open role in India have more than doubled since early 2022.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Paid upgrades have no independent proof.</strong> Naukri's Resume Display boosts your rank in recruiter search. LinkedIn's "2.7x more likely to get hired" claim is its own data from January 2022, with no published method.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>93% of Indian job seekers have seen suspicious job offers</strong> (Indeed survey of 1,161 workers, 2026). Scams reach people across platforms, including fakes that copy portal branding.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">115M</div>
              <div className="sc-label">resumes in Naukri's database at FY26 year end, the pool you compete against</div>
              <div className="sc-source">Info Edge FY26 results, May 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">61%</div>
              <div className="sc-label">of Indian freshers heard little or nothing back after applying for jobs</div>
              <div className="sc-source">Indeed Fresher Hiring Report, June 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">93%</div>
              <div className="sc-label">of Indian workers and job seekers have come across suspicious job offers</div>
              <div className="sc-source">Indeed survey of 1,161 workers, July 2026</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">How Big Each Portal Is, and Who Is On It</div>
                <div className="sec-sub">Every company counts users differently, so compare with care</div>
              </div>
            </div>
            <p>Start with scale, because it tells you how crowded each queue is. Naukri, run by Info Edge, reported a resume database of about 115 million at the end of FY26, with Naukri's B2C business (what job seekers pay for) up 33% year on year (Info Edge FY26 results, as reported by InvestyWise, May 2026). LinkedIn said in August 2024 that India had 135 million members and was its second-largest market. By September 2025 its India head, Kumaresh Pattabiraman, put the figure at over 160 million and said India could become LinkedIn's largest market in two to three years (PTI interview, reported by YourStory).</p>
            <p>The rest are smaller, and their numbers are self-reported. Apna says it has more than 6 crore (60 million) users on Android and more than 7 lakh employers across 900+ cities (Apna statement via CXOToday, December 2025). Internshala's homepage claims a talent pool of 3.2 crore+ candidates and 10K+ openings daily (internshala.com, viewed November 2026). Unstop reported about 28 million student and early-career users and 150+ enterprise customers by December 2025 (YourStory), up from 20 million in February 2025 (Entrepreneur India). foundit, the former Monster India owned by Quess, cites over 75 million registered users across 18 countries, with no India-only figure disclosed (foundit release via ThePrint). Indeed does not publish a current India user count; an older Indeed statement cited 24.5 million unique monthly visitors in India (CXOToday, undated), so treat it as dated.</p>
            <div className="chart-wrap">
              <div className="chart-label">Company-reported scale in India, millions (definitions differ: members, resumes, users, candidates)</div>
              <div style={{ height: 300 }}>
                <canvas id="bjpSizeChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Portal</th>
                  <th>What it reports</th>
                  <th>Who it is mainly for</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Naukri</td><td>About 115 million resumes (FY26)</td><td>White-collar jobs, recruiters searching resumes</td></tr>
                <tr><td>LinkedIn</td><td>Over 160 million India members (Sep 2025)</td><td>Corporate and tech roles, research on people</td></tr>
                <tr><td>Apna</td><td>60 million+ users, 7 lakh+ employers</td><td>Frontline, sales, support, entry-level roles</td></tr>
                <tr><td>Internshala</td><td>3.2 crore+ candidates (site claim)</td><td>Student internships and fresher jobs</td></tr>
                <tr><td>Unstop</td><td>About 28 million users (Dec 2025)</td><td>Competitions, hackathons, campus hiring</td></tr>
                <tr><td>foundit</td><td>75 million+ users across 18 countries</td><td>White-collar jobs, India and Gulf</td></tr>
                <tr><td>Indeed</td><td>No current India count published</td><td>Broad mix of listings from many sources</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>What this means for a fresher:</strong> the biggest portal is not the best one for you. It is the one with the most people applying alongside you. Pick the portal whose lane matches the role you want, then expect to compete with a crowd.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Sources: Info Edge FY26 results (InvestyWise, May 2026); LinkedIn India via YourStory (Aug 2024, Sep 2025); Apna via CXOToday (Dec 2025); internshala.com (viewed Nov 2026); Unstop via YourStory (Dec 2025) and Entrepreneur India (Feb 2025); foundit via ThePrint; Indeed via CXOToday.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Which Roles and Pay Each Portal Carries</div>
                <div className="sec-sub">The lane matters more than the logo</div>
              </div>
            </div>
            <p>Internshala is the clearest case. Its 2024 Internship Trends Report found management internships (marketing, finance, sales, HR) made up 42% of opportunities, engineering 20% and media 13%. The average stipend was 8,000 rupees a month, top offers reached 1 lakh a month, and 22% of internships offered a chance of a pre-placement offer. Delhi NCR carried 31% of listings, Mumbai 17% and Bangalore 11% (Internshala Internship Trends Report 2024, via Careers360, December 2024).</p>
            <div className="chart-wrap">
              <div className="chart-label">Internshala internship opportunities by sector, 2024 (Internshala Internship Trends Report 2024)</div>
              <div style={{ height: 280 }}>
                <canvas id="bjpSectorChart" />
              </div>
            </div>
            <p>Apna sits at the other end of the market. Its India at Work 2025 report counted over 9 crore applications and about 14 lakh jobs posted in 2025, with over 2.2 crore applications from first-time job seekers. Fresher interest was strongest in administrative services, customer experience, finance and digital operations (Apna, via The Hans India, December 2025). Unstop is built around competitions, hackathons and quizzes that companies use for campus and early-career hiring. Naukri, foundit and LinkedIn lean white-collar, with LinkedIn strongest for corporate, tech and startup roles.</p>
            <p>None of these portals publish a clean salary breakdown for freshers, so we will not invent one. If you need a pay benchmark, see the stated bands in our <Link to="/reports/india-entry-level-jobs-internships-october-2026">October 2026 entry-level count</Link>, where 3 lakh to 5 lakh a year was the most common stated band (Studojo listings data), and treat salary sites like AmbitionBox and Glassdoor as self-reported.</p>
            <div className="callout">
              <strong>How to pick:</strong> internship or student, start with Internshala and Unstop. Sales, support or operations role, Apna and Naukri. Tech, consulting, product or startup role, LinkedIn plus Naukri. Do not spread yourself across all seven.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Sources: Internshala Internship Trends Report 2024 (Careers360, Dec 2024); Apna India at Work 2025 (The Hans India, Dec 2025); Studojo listings data, Oct 2026.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Applicants Per Posting, and How Often Anyone Replies</div>
                <div className="sec-sub">The portal makes applying easy. That is the problem.</div>
              </div>
            </div>
            <p>The volume is enormous. LinkedIn told the New York Times in June 2025 that it was receiving about 11,000 applications a minute, up 45% in a year; later coverage in October 2025 cited about 9,500 a minute from a LinkedIn representative. In India specifically, LinkedIn said in January 2026 that applicants per open role had more than doubled since early 2022, and that 84% of Indian professionals felt unprepared to find a new job (Deccan Chronicle, January 2026). On Apna, 9 crore applications against about 14 lakh jobs posted in 2025 works out to roughly 64 applications per job (our division of Apna's own figures).</p>
            <p>Replies have not kept up. In LinkedIn's research for 2025, 49% of Indian job seekers said they were applying to more jobs but getting fewer responses, and 55% of Indian HR professionals said less than half of the applications they receive meet all the criteria (LinkedIn research by Censuswide, via The Hans India, January 2025). For freshers it is starker. Indeed's Fresher Hiring Report found 61% heard little or nothing back on job applications, 61% got little or no response on internship applications, and 49% said getting shortlisted was the biggest hurdle (Indeed, via Outlook Money, June 2026).</p>
            <div className="chart-wrap">
              <div className="chart-label">What Indian freshers report after applying, % of respondents (Indeed Fresher Hiring Report, June 2026)</div>
              <div style={{ height: 300 }}>
                <canvas id="bjpFresherChart" />
              </div>
            </div>
            <p>One-click buttons make this worse, because they let everyone apply to everything. We cover that in detail in <Link to="/reports/linkedin-easy-apply-killing-chances-2026">why LinkedIn Easy Apply is killing your chances</Link>, and the wider silence in <Link to="/reports/application-response-rate-2026">why 80% of applications get no response</Link>.</p>
            <div className="callout">
              <strong>The pattern across every portal:</strong> the easier it is to apply, the more people apply, and the less any single application is read. Switching portals does not fix that. Changing who you send it to does.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Sources: LinkedIn via New York Times (June 2025) and later coverage (Oct 2025); LinkedIn India via Deccan Chronicle (Jan 2026); LinkedIn and Censuswide via The Hans India (Jan 2025); Indeed Fresher Hiring Report via Outlook Money (June 2026); Apna India at Work 2025.</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Naukri FastForward and LinkedIn Premium: Is Paying Worth It?</div>
                <div className="sec-sub">What you actually buy, and what the evidence says</div>
              </div>
            </div>
            <p>Naukri's paid job seeker services, sold under the FastForward name, include Resume Display. Naukri's own FAQ says it marks you as a "featured" candidate in recruiter search and refreshes your resume every week so it appears near the top, for 3 or 6 months depending on the plan (resume.naukri.com FAQ). That is a ranking boost inside recruiter search. It does not change what a recruiter thinks of your resume once they open it. We found no independent study showing it raises interview rates for freshers, and Naukri's own FastForward paperwork states that it does not guarantee interview calls or job offers. Third-party price quotes range from roughly 700 to 900 rupees a month and change often, so check the live price and refund terms.</p>
            <p>LinkedIn Premium Career makes bigger claims. Its product page says subscribers are "2.7x more likely to get hired on average" (LinkedIn data, January 2022) and "2x more likely to receive a message back from a recruiter" when applying to Top Choice jobs (LinkedIn data, June 2026). It includes 5 InMail credits a month. The listed US price is 39.99 dollars a month (premium.linkedin.com, updated April 2026); Indian prices have been reported at about 1,400 to 1,900 rupees a month (Analytics Insight). LinkedIn publishes no method for these figures, and the people who pay for Premium are often the most active searchers, so some of the gap is likely who buys it, not what it does.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Upgrade</th>
                  <th>What you get</th>
                  <th>Evidence</th>
                  <th>Verdict for freshers</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Naukri Resume Display / FastForward</td><td>Featured tag, weekly refresh, higher rank in recruiter search</td><td>No independent data; no guarantee of calls</td><td><span className="tag-pill pill-amber">Skip for now</span></td></tr>
                <tr><td>LinkedIn Premium Career</td><td>InMail credits, who viewed you, applicant insights</td><td>LinkedIn's own claims, no published method</td><td><span className="tag-pill pill-green">One focused month at most</span></td></tr>
              </tbody>
            </table>
            <div className="highlight">
              The useful part of Premium is not the badge. It is the ability to reach a named person. You can do that without paying by finding the hiring manager and emailing them directly.
            </div>
            <div className="callout">
              <strong>Before you pay anything:</strong> fix the resume and the target list first. A boosted profile aimed at the wrong roles gets seen more and rejected faster.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Sources: resume.naukri.com FAQ (Resume Display); premium.linkedin.com/careers/career (viewed Nov 2026); Analytics Insight (India pricing).</p>
          </div>
          <StuCta via="report-best-job-portal-freshers-india-2026" place="report-mid" size="quiet" title="Stu checks company career sites and job boards every day and shows your best fits first." />

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Scam and Fake Listing Risk, Portal by Portal</div>
                <div className="sec-sub">No platform is scam-proof, and impostors copy the big names</div>
              </div>
            </div>
            <p>Scams are common enough that you should assume you will meet one. In Indeed's 2026 survey of 1,161 Indian workers, 93% said they had come across suspicious or fraudulent job opportunities, 51% were not confident they could tell a genuine recruiter from a scammer, and 46% of Gen Z respondents reported losing money to recruitment scams (Indeed, via CXOToday and Business Today, July 2026). Half said verifying the recruiter's identity was the biggest trust signal.</p>
            <p>Some fraud uses the portals' names rather than the portals themselves. In April 2025, Kanpur police reported arresting a gang that ran fake websites imitating Naukri.com and other job portals, promised jobs in Dubai and the US, and duped about 1.2 lakh job seekers of roughly 3 to 4 crore rupees (ETV Bharat, April 2025). On LinkedIn, the main risk is fake recruiter profiles; LinkedIn's Community Report says most fake accounts are blocked automatically at sign-up, but some get through, which is why the profile behind a message matters.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Where</th>
                  <th>Common pattern to watch for</th>
                  <th>Simple check</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Naukri, foundit, Indeed</td><td>Calls or emails claiming to be from the portal or a big company, asking for a registration or training fee</td><td>Check the sender domain; real employers do not charge you</td></tr>
                <tr><td>LinkedIn</td><td>New recruiter profiles with few connections, moving you to WhatsApp or Telegram</td><td>Find the same person on the company site or via a colleague</td></tr>
                <tr><td>Apna, WhatsApp groups</td><td>High pay for data entry or "task" work, deposit requested</td><td>Any upfront payment is the red flag</td></tr>
                <tr><td>Internship listings anywhere</td><td>Certificate fees, "security deposit" or paid training</td><td>Ask who your manager will be and look them up</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>One rule covers most of it:</strong> a genuine employer never asks you to pay to get a job. A named, verifiable person at the company is the best defence there is, which is another reason to deal with people, not anonymous listings. More signals in our <Link to="/reports/fake-job-internship-scams-2026" style={{ color: "#c4b5fd" }}>fake job and internship guide</Link>.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Sources: Indeed recruitment scam survey (CXOToday, Business Today, July 2026); ETV Bharat (April 2025); LinkedIn Community Report (about.linkedin.com/transparency).</p>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">The Honest Verdict: Portals Are for Discovery</div>
                <div className="sec-sub">Use them to find the role. Then go find the person.</div>
              </div>
            </div>
            <p>Every portal in this report is good at one thing: showing you that a role exists. None of them is good at getting a fresher's application read, because the same features that make applying easy also flood every opening. LinkedIn's own data shows applicants per role in India more than doubled since early 2022, and Indeed found 61% of freshers hear little or nothing back. That is not a Naukri problem or a LinkedIn problem. It is how open queues work.</p>
            <div className="blist">
              {[
                ["Pick two portals, not seven", "One matched to your role type (Internshala, Apna or Naukri) and LinkedIn for researching people."],
                ["Use the listing as a lead", "Note the company, team and role. That is the useful part of the posting."],
                ["Find who owns the role", "The hiring manager or team lead, not a generic careers inbox. LinkedIn is useful here even without Premium."],
                ["Write to that person", "A short, specific email about their work and what you can do. Replies are never guaranteed, but a human inbox beats a queue."],
                ["Keep applying, but less", "Apply on the portal too, for the roles you actually want, so you exist in their system when the manager looks you up."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" />
                  <span><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
            <div className="pull-quote">
              <p>"The portal tells you the job exists. It almost never tells you who will decide. That second step is the one most freshers skip."</p>
              <span className="pq-source">The takeaway from comparing seven portals</span>
            </div>
            <div className="callout">
              <strong>The bottom line:</strong> choose your portal by lane, skip paid upgrades until your basics are right, treat every fee request as a scam, and spend your energy on reaching the person who can hire you.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Sources: LinkedIn India via Deccan Chronicle (Jan 2026); Indeed Fresher Hiring Report via Outlook Money (June 2026).</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The questions freshers ask about job portals, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>A simple portal plan for a fresher in India</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The numbers point to a short plan:</p>
            <div className="blist">
              {[
                ["Match the portal to the role", "Internshala and Unstop for internships and campus hiring, Apna for frontline roles, Naukri and LinkedIn for white-collar jobs."],
                ["Do not pay to be seen yet", "Naukri and LinkedIn upgrades have no independent proof for freshers. A sharper resume and target list come first."],
                ["Never pay to be hired", "93% of Indian job seekers have seen suspicious offers. Any fee request is the end of the conversation."],
                ["Reach the person, not the portal", "Use the listing to find the company and team, then email the person who owns the role."],
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
              <Link to="/reports/linkedin-easy-apply-killing-chances-2026" className="related-card">
                <div className="rc-kicker">LinkedIn</div>
                <div className="rc-title">Why LinkedIn Easy Apply Is Killing Your Chances</div>
              </Link>
              <Link to="/reports/application-response-rate-2026" className="related-card">
                <div className="rc-kicker">Response rates</div>
                <div className="rc-title">Why 80% of Applications Get No Response</div>
              </Link>
              <Link to="/reports/fake-job-internship-scams-2026" className="related-card">
                <div className="rc-kicker">Scams</div>
                <div className="rc-title">How to Spot a Fake Job or Internship in 2026</div>
              </Link>
            </div>
          </div>
          <StuCta via="report-best-job-portal-freshers-india-2026" place="report-end" size="card" title="Want jobs from every portal, best fit first?" line="Tell Stu the role, the city and the pay you want in one short call. Every day Stu checks company career sites and job boards, shows your best fits first and finds who's hiring." />
        </div>
      </main>
      <Footer />
    </>
  );
}
