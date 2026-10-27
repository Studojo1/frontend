import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How to Get a Job Abroad From India, 2026: Visas, Pay Floors and Who to Email | Studojo" },
    { name: "description", content: "How to get a job abroad from India in 2026: work visas and salary floors for the UAE, Singapore, Germany, UK and US, agent red flags, and who to email." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "how to get a job abroad from India, how to get job in Dubai from India, how to get job in Singapore from India, how to get job in Germany from India, how to get a job outside India, overseas jobs for Indian freshers" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/how-to-get-a-job-abroad-from-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How to Get a Job Abroad From India, 2026: Visas, Pay Floors and Who to Email" },
    { property: "og:description", content: "Verified work visa routes and salary floors for five countries, how to check an overseas agent, and why the hiring manager abroad is the person to email." },
    { property: "og:url", content: `${BASE_URL}/reports/how-to-get-a-job-abroad-from-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-28T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How to Get a Job Abroad From India, 2026 | Studojo" },
    { name: "twitter:description", content: "Visa routes and pay floors for the UAE, Singapore, Germany, UK and US, plus who to email abroad." },
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
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: Singapore Employment Pass minimum qualifying salary, most sectors (MOM)
  const sgEl = document.getElementById("abrSgChart") as HTMLCanvasElement | null;
  if (sgEl && !sgEl.dataset.rendered) {
    sgEl.dataset.rendered = "1";
    new Chart(sgEl, {
      type: "bar",
      data: {
        labels: ["Age 23 or below", "Age 45 and above"],
        datasets: [
          {
            label: "New applications in 2026",
            data: [5600, 10700],
            backgroundColor: VIOLET2,
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            label: "New applications from 1 Jan 2027",
            data: [6000, 11500],
            backgroundColor: VIOLET,
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: S$${ctx.raw.toLocaleString("en-US")} a month` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, ticks: { font: { size: 11 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 2: Germany EU Blue Card salary floors, 2026 (German missions)
  const deEl = document.getElementById("abrDeChart") as HTMLCanvasElement | null;
  if (deEl && !deEl.dataset.rendered) {
    deEl.dataset.rendered = "1";
    new Chart(deEl, {
      type: "bar",
      data: {
        labels: ["Standard floor", "Shortage roles, new entrants, IT"],
        datasets: [{
          label: "Minimum gross salary, euros a year",
          data: [50700, 45934.2],
          backgroundColor: [VIOLET, ORANGE],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` €${ctx.raw.toLocaleString("en-US")} a year (2026)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, ticks: { font: { size: 11 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: H-1B lottery entries by wage level, FY2027 onward (DHS final rule)
  const usEl = document.getElementById("abrUsChart") as HTMLCanvasElement | null;
  if (usEl && !usEl.dataset.rendered) {
    usEl.dataset.rendered = "1";
    new Chart(usEl, {
      type: "bar",
      data: {
        labels: ["Level I (entry)", "Level II", "Level III", "Level IV"],
        datasets: [{
          label: "Lottery entries per registration",
          data: [1, 2, 3, 4],
          backgroundColor: [ORANGE, VIOLET3, VIOLET2, VIOLET],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} ${ctx.raw === 1 ? "entry" : "entries"} in the lottery` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 4, ticks: { font: { size: 11 }, color: MUTED, stepSize: 1 } },
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
    q: "Are there overseas jobs for Indian freshers?",
    a: "Yes, but the visa rules decide which ones are realistic. Singapore's Employment Pass needs at least S$5,600 a month for applicants aged 23 or below (Ministry of Manpower, 2026), and the UK Skilled Worker floor is £41,700 or the going rate for the job (gov.uk), so the employer has to value you at that level. Germany's EU Blue Card has a lower floor for new entrants, €45,934.20 a year in 2026. These numbers change, so check each official site.",
  },
  {
    q: "How to get job in Dubai from India?",
    a: "Most people get a UAE job through an employer, who applies for your work permit with the Ministry of Human Resources and Emiratisation (MOHRE). If you want to search on the ground, the jobseeker visit visa allows 60, 90 or 120 days without a sponsor, for MOHRE skill levels 1 to 3 or recent graduates of a top-500 university, with a financial guarantee (u.ae, 2026). Either way, an employer still has to hire and sponsor you before you work.",
  },
  {
    q: "How to get job in Singapore from India?",
    a: "You need an employer to apply for an Employment Pass for you. In 2026 the pass needs at least S$5,600 a month at age 23 or below (S$6,200 in financial services), rising with age, and from 1 January 2027 the starting floor rises to S$6,000 (Ministry of Manpower). Most applicants must also score 40 points under the COMPASS framework.",
  },
  {
    q: "How to get job in Germany from India?",
    a: "There are two main ways. Get a job offer first and apply for an EU Blue Card (€50,700 a year in 2026, or €45,934.20 for shortage occupations, new entrants and IT specialists), or apply for the Opportunity Card, which lets you stay up to 12 months to look for work. The Opportunity Card needs a recognised or assessed qualification, German at A1 or English at B2 on the points route, and proof you can support yourself.",
  },
  {
    q: "Should I pay an overseas job agent or consultancy?",
    a: "Check before you pay anyone. Under India's Emigration Act, 1983, recruiting Indians for jobs abroad needs a licence from the Ministry of External Affairs, and you can look an agent up on emigrate.gov.in under \"List of active RA\". A registered agent may not charge you more than ₹30,000 plus GST in service charges and must give a receipt (Indian Embassy advisory citing the Act), so a demand for lakhs is a red flag.",
  },
  {
    q: "What is the best way to get a job outside India?",
    a: "Get an employer to want you, because almost every work visa route needs one to sponsor you. A recruiter abroad has probably never heard of your college, but a hiring manager who sees your work can be the person whose yes starts the sponsorship. Email that person directly with a short, specific email from your own Gmail; Studojo finds the hiring manager, verifies their email and writes and sends it for you. Replies are not guaranteed.",
  },
];

export default function JobAbroadFromIndiaReport() {
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
        "headline": "How to Get a Job Abroad From India, 2026: Visas, Pay Floors and Who to Email",
        "description": "Verified work visa routes and salary floors for the UAE, Singapore, Germany, the UK and the US, how to check an overseas recruiting agent, and why the hiring manager abroad is the person to email.",
        "url": `${BASE_URL}/reports/how-to-get-a-job-abroad-from-india-2026`,
        "datePublished": "2026-10-28T00:00:00Z",
        "dateModified": "2026-10-28T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/how-to-get-a-job-abroad-from-india-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "How to Get a Job Abroad From India 2026", "item": `${BASE_URL}/reports/how-to-get-a-job-abroad-from-india-2026` },
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
              <span>Job Abroad From India 2026</span>
            </nav>
            <h1>How to Get a Job Abroad From India, 2026: <em>Visas, Pay Floors and Who to Email</em></h1>
            <p className="rpt-hero-sub">
              How to get a job abroad from India comes down to two things: a visa route you
              qualify for, and an employer who wants you enough to sponsor it. Here are the
              verified rules for five countries, how to check an overseas agent, and why the
              hiring manager is the person to email.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India to 5 countries · Students and freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Work visas, salary floors, agents</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>Almost every work visa route starts with <strong>an employer who sponsors you</strong>. Two routes in this report let you search on the ground first: Germany's Opportunity Card (up to 12 months) and the UAE jobseeker visit visa (60, 90 or 120 days).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Salary floors are real and rising. Singapore's Employment Pass starts at <strong>S$5,600 a month</strong> in 2026 and S$6,000 from 1 January 2027 (Ministry of Manpower). The UK Skilled Worker floor is <strong>£41,700</strong> or the going rate (gov.uk).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Germany's EU Blue Card needs <strong>€50,700 a year</strong> in 2026, or €45,934.20 for shortage occupations, new entrants and IT specialists. The US H-1B lottery is now <strong>weighted by wage level</strong>, so entry-level offers get the fewest entries.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Overseas recruiting agents must be <strong>licensed under the Emigration Act, 1983</strong>. Check them on emigrate.gov.in, and know that a registered agent may charge you at most ₹30,000 plus GST.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>A recruiter abroad has probably never heard of your college. <strong>The hiring manager is the one whose yes starts the sponsorship</strong>, so email them directly. That is what Studojo does.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">S$5,600</div>
              <div className="sc-label">minimum monthly salary for a new Singapore Employment Pass in 2026, age 23 or below, most sectors</div>
              <div className="sc-source">Ministry of Manpower, Singapore, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">£41,700</div>
              <div className="sc-label">general salary floor for a UK Skilled Worker visa, or the going rate if higher</div>
              <div className="sc-source">gov.uk, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">₹30k</div>
              <div className="sc-label">plus GST: the most a registered recruiting agent may charge you in service fees</div>
              <div className="sc-source">Indian Embassy advisory, citing the Emigration Act 1983</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">The Country Table: Work Visas and Salary Floors</div>
                <div className="sec-sub">UAE, Singapore, Germany, UK and US, checked on official sites in October 2026</div>
              </div>
            </div>
            <p>Before you apply anywhere, check two things: which visa route the job would use, and whether your likely salary clears that route's floor. A job you cannot get a visa for is not a job offer.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Main work route</th>
                  <th>Salary floor</th>
                  <th>Search there first?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>UAE</strong></td>
                  <td>Employer gets your work permit from MOHRE; free zone companies sponsor through their free zone authority</td>
                  <td>Set by your offer and contract; no visa salary floor we could verify for a standard permit</td>
                  <td><span className="tag-pill pill-green">Yes</span> Jobseeker visit visa, 60, 90 or 120 days</td>
                </tr>
                <tr>
                  <td><strong>Singapore</strong></td>
                  <td>Employment Pass, applied for by the employer; most applicants need 40 COMPASS points</td>
                  <td>S$5,600 a month at 23 or below, up to S$10,700 at 45+ (financial services S$6,200 to S$11,800); from 1 Jan 2027, S$6,000 to S$11,500</td>
                  <td><span className="tag-pill pill-amber">No</span> Not on this route</td>
                </tr>
                <tr>
                  <td><strong>Germany</strong></td>
                  <td>EU Blue Card or skilled worker visa once you have an offer</td>
                  <td>Blue Card: €50,700 a year, or €45,934.20 for shortage occupations, new entrants and IT specialists (2026)</td>
                  <td><span className="tag-pill pill-green">Yes</span> Opportunity Card, up to 12 months</td>
                </tr>
                <tr>
                  <td><strong>UK</strong></td>
                  <td>Skilled Worker visa with a licensed sponsor, in a job listed as higher skilled</td>
                  <td>£41,700 a year or the going rate, whichever is higher; £33,400 in some cases, such as new entrants</td>
                  <td><span className="tag-pill pill-amber">No</span> Not on this route</td>
                </tr>
                <tr>
                  <td><strong>US</strong></td>
                  <td>H-1B: employer registers you in an annual lottery for a role needing at least a bachelor's degree</td>
                  <td>Wage level against the Department of Labor's prevailing wage sets your lottery entries (1 to 4)</td>
                  <td><span className="tag-pill pill-amber">No</span> Not on this route</td>
                </tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>These rules change, often.</strong> Salary floors rise every year or two, and fees move with court rulings. Check the official site before you apply or pay anything: mom.gov.sg for Singapore, gov.uk for the UK, make-it-in-germany.com for Germany, u.ae and mohre.gov.ae for the UAE, and uscis.gov for the US.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">How to Get a Job in Dubai From India</div>
                <div className="sec-sub">The UAE: an employer sponsor, or the jobseeker visa</div>
              </div>
            </div>
            <p>Most UAE jobs start with the employer. A mainland company gets your work permit from the Ministry of Human Resources and Emiratisation (MOHRE), and your residence visa is processed after you arrive. Free zone companies sponsor staff through their own free zone authority instead.</p>
            <p>If you want to look on the ground first, the jobseeker visit visa gives you 60, 90 or 120 days without a sponsor. It is open to people at MOHRE skill levels 1, 2 or 3, or graduates of one of the world's top 500 universities within the last two years. You need at least a bachelor's degree and a refundable financial guarantee (u.ae, 2026).</p>
            <div className="highlight">
              A visit visa is for looking, not working. <strong>You still need an employer to hire and sponsor you</strong> before you start, so the job search itself does not change: find the person who can say yes.
            </div>
            <p>For which companies are hiring in Dubai and what they pay, see our <Link to="/reports/dubai-hiring-whos-hiring-and-pay-2026">Dubai hiring report</Link>.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">How to Get a Job in Singapore From India</div>
                <div className="sec-sub">The Employment Pass, COMPASS, and the 2027 salary rise</div>
              </div>
            </div>
            <p>The Employment Pass is the main route for graduates and professionals, and your employer applies for it. There are two stages. First you must earn at least the qualifying salary, which the Ministry of Manpower benchmarks to the top third of local professionals' pay by age. Then most applicants must score 40 points under COMPASS, unless they earn S$22,500 a month or more (MOM, 2026).</p>
            <p>In 2026 the qualifying salary is S$5,600 a month at age 23 or below in most sectors, rising with age to S$10,700 at 45 and above. In financial services it runs from S$6,200 to S$11,800. From 1 January 2027, new applications need S$6,000 to S$11,500, or S$6,600 to S$12,700 in financial services.</p>
            <div className="chart-wrap">
              <div className="chart-label">Employment Pass minimum salary, most sectors, S$ a month (Ministry of Manpower)</div>
              <div style={{ height: 260 }}>
                <canvas id="abrSgChart" />
              </div>
            </div>
            <p>That is a high bar for a fresher. It means a Singapore employer has to see you as worth top-third local pay before the paperwork even starts. If you want to work for a Singapore company without moving, see our <Link to="/reports/singapore-remote-from-india-2026">Singapore remote jobs report</Link>.</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">How to Get a Job in Germany From India</div>
                <div className="sec-sub">The Opportunity Card to search, the EU Blue Card to work</div>
              </div>
            </div>
            <p>Germany has a route built for job hunting. The Opportunity Card (Chancenkarte) lets you stay for up to 12 months to look for work. You qualify with a foreign degree or vocational qualification that is fully recognised in Germany, or through a points-based pathway if it is not yet recognised. The card also allows limited part-time work while you search.</p>
            <p>On the points route you need German at level A1 or English at level B2, and you must show you can support yourself. The German Embassy in Dublin's Opportunity Card page listed €1,027 a month for this in 2024 and notes the figure changes, so check the current amount with your German mission.</p>
            <p>Once you have an offer, the EU Blue Card is the main work permit for graduates. For 2026 it needs a gross salary of at least €50,700 a year, or €45,934.20 for shortage occupations, new entrants to the labour market and IT specialists (German Missions in the United States, March 2026).</p>
            <div className="chart-wrap">
              <div className="chart-label">EU Blue Card minimum salary, Germany, euros a year, 2026 (German missions)</div>
              <div style={{ height: 240 }}>
                <canvas id="abrDeChart" />
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The UK and the US: Sponsor First, Then Visa</div>
                <div className="sec-sub">Skilled Worker floors, the weighted H-1B lottery and the $100,000 fee fight</div>
              </div>
            </div>
            <p><strong>UK.</strong> The Skilled Worker visa needs a job offer from an employer with a sponsor licence, in a job listed as higher skilled. You must be paid at least £41,700 a year or the going rate for the job, whichever is higher. A lower floor of £33,400 applies in some cases, such as new entrants (gov.uk, 2026). The general floor rose from £38,700 in July 2025.</p>
            <p><strong>US.</strong> The H-1B is for specialty occupations that need at least a bachelor's degree. Your employer registers you in an annual lottery for 65,000 places, plus 20,000 for holders of a US master's degree or higher. From the FY2027 season the lottery is weighted by wage level: under a DHS final rule (December 2025, in force from 27 February 2026), a registration gets four entries at Level IV of the Department of Labor's prevailing wage, three at Level III, two at Level II and one at Level I.</p>
            <div className="chart-wrap">
              <div className="chart-label">H-1B lottery entries by wage level, FY2027 onward (DHS final rule, December 2025)</div>
              <div style={{ height: 220 }}>
                <canvas id="abrUsChart" />
              </div>
            </div>
            <p>Level I is the entry level, so an entry-level offer gets the fewest entries. Then there is the fee. A September 2025 presidential proclamation added a $100,000 payment for some new H-1B petitions for workers outside the US. It has been challenged in court and its status has changed more than once during 2026, so do not plan around any version of it without checking uscis.gov first.</p>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">Skip the Agent. Email the Hiring Manager Abroad.</div>
                <div className="sec-sub">How to check an overseas recruiter, and who to write to instead</div>
              </div>
            </div>
            <p>Search for jobs abroad and you will find agents promising placements for a fee. Indian law is clear on who may recruit you. Under the Emigration Act, 1983, no person or agency may work as a recruiting agent for jobs abroad without a valid licence from the Ministry of External Affairs.</p>
            <div className="highlight">
              <strong>Before you pay anyone:</strong> go to emigrate.gov.in, open "List of active RA" and check the agent's licence number. A registered agent may collect at most ₹30,000 plus 18% GST in service charges and must give you a receipt (Indian Embassy advisory, citing the Emigration Act, 1983).
            </div>
            <p>Mass applying to foreign portals does not fix the problem either. A typical online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026), and an auto-apply bot cannot explain why you are worth a visa.</p>
            <p>Here is the bigger point. A recruiter abroad screens hundreds of applications and has probably never heard of your college. The hiring manager is different. They feel the gap on their team, and their yes is what starts the sponsorship.</p>
            <p>Studojo's position: email that person directly, with a short, personal, specific email from your own address, and follow up once. We built Studojo to do exactly this. It finds the person who can actually hire you (not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail. 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026).</p>
            <div className="pull-quote">
              <p>"The visa is the company's paperwork. Getting the company to want you is yours."</p>
              <span className="pq-source">The Studojo view on working abroad</span>
            </div>
            <p>Replies are not guaranteed. But in our view, one specific email to the right manager abroad is worth more than a hundred portal applications.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The working abroad questions people in India ask most, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to plan a move abroad from India</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Pick the country by its rules, then spend your effort on the person who can hire you:</p>
            <div className="blist">
              {[
                ["Check the floor first", "Make sure your likely salary clears the visa floor before you spend months applying."],
                ["Use a search route if you need one", "Germany's Opportunity Card and the UAE jobseeker visa let you look on the ground."],
                ["Check any agent before you pay", "Look them up on emigrate.gov.in. A registered agent can charge at most ₹30,000 plus GST."],
                ["Email the manager abroad", "The person whose yes starts the sponsorship is the one to write to, from your own Gmail."],
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
              <Link to="/reports/dubai-hiring-whos-hiring-and-pay-2026" className="related-card">
                <div className="rc-kicker">Dubai</div>
                <div className="rc-title">Dubai Hiring Report 2026: Who's Actually Hiring and What They Pay</div>
              </Link>
              <Link to="/reports/job-consultancy-for-freshers-india-2026" className="related-card">
                <div className="rc-kicker">Consultancies</div>
                <div className="rc-title">Job Consultancies for Freshers: Who Pays Whom, and When to Walk Away</div>
              </Link>
              <Link to="/reports/how-to-get-a-job-2026" className="related-card">
                <div className="rc-kicker">Job search</div>
                <div className="rc-title">How to Get a Job in 2026: Every Route Compared, and the One That Skips the Queue</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Email the manager abroad.</h3>
              <p>Studojo finds the hiring manager at the company you want, verifies their email and sends a personal email from your own Gmail.</p>
            </div>
            <Link to="/b2cnew/join?via=report-how-to-get-a-job-abroad-from-india-2026&how=voice" reloadDocument className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
