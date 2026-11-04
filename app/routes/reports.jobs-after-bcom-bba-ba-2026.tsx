import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Jobs After BCom, BBA and BA in 2026: What Non-Engineering Graduates Actually Land | Studojo" },
    { name: "description", content: "Jobs after BCom, BBA and BA in 2026: the roles that actually hire, starting pay of about 3 to 4 LPA in most of them, employability by degree, and whether MBA, CA, CFA or ACCA beats working first." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "jobs after bcom, career options after bba, jobs after ba, best jobs for bcom freshers, salary after bcom, jobs after bba without mba, bcom fresher salary, bba fresher jobs, ba graduate jobs India 2026" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/jobs-after-bcom-bba-ba-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Jobs After BCom, BBA and BA in 2026: What Non-Engineering Graduates Actually Land" },
    { property: "og:description", content: "The roles that hire BCom, BBA and BA graduates, what they pay, how employable each degree is, and when an MBA, CA, CFA or ACCA is worth it." },
    { property: "og:url", content: `${BASE_URL}/reports/jobs-after-bcom-bba-ba-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-07T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Jobs After BCom, BBA and BA in 2026 | Studojo" },
    { name: "twitter:description", content: "Commerce grads are 62.81% employable, arts grads 55.55%. Here is what they actually get hired into, and what it pays." },
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
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: entry-level listings by role family (Studojo listings data, Oct 2026, non-engineering families)
  const roleEl = document.getElementById("jabRoleChart") as HTMLCanvasElement | null;
  if (roleEl && !roleEl.dataset.rendered) {
    roleEl.dataset.rendered = "1";
    new Chart(roleEl, {
      type: "bar",
      data: {
        labels: [
          "Sales / BD",
          "Customer Support",
          "Marketing / Content",
          "Data / Analytics",
          "HR / Recruiting",
          "Finance / Accounts",
          "Operations / Supply",
        ],
        datasets: [{
          label: "Listings",
          data: [24188, 23147, 7998, 7876, 7673, 7156, 6484],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET2, VIOLET2, VIOLET2, VIOLET3],
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

  // Chart 2: employability by degree (India Skills Report 2026)
  const empEl = document.getElementById("jabEmployChart") as HTMLCanvasElement | null;
  if (empEl && !empEl.dataset.rendered) {
    empEl.dataset.rendered = "1";
    new Chart(empEl, {
      type: "bar",
      data: {
        labels: ["MBA", "BE / BTech", "Commerce (BCom)", "Science (BSc)", "Arts (BA)", "ITI", "Polytechnic"],
        datasets: [{
          label: "Employable (%)",
          data: [72.76, 70.15, 62.81, 61, 55.55, 45.95, 32.92],
          backgroundColor: [VIOLET3, VIOLET3, VIOLET, VIOLET3, VIOLET, VIOLET3, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% employable` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK, maxRotation: 45, minRotation: 45 } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 100, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}%` } },
        },
      },
    });
  }

  // Chart 3: fresher pay by role, midpoint of reported range in LPA (self-reported AmbitionBox figures, as quoted by BMU, July 2026)
  const payEl = document.getElementById("jabPayChart") as HTMLCanvasElement | null;
  if (payEl && !payEl.dataset.rendered) {
    payEl.dataset.rendered = "1";
    new Chart(payEl, {
      type: "bar",
      data: {
        labels: ["Operations Executive", "Sales Executive", "HR Executive", "Marketing Executive", "Business Development Executive", "Financial Analyst"],
        datasets: [{
          label: "LPA (midpoint)",
          data: [3.3, 3.35, 3.65, 3.8, 4.1, 5],
          backgroundColor: [VIOLET2, VIOLET2, VIOLET2, VIOLET2, VIOLET2, VIOLET],
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
          tooltip: { callbacks: { label: (ctx: any) => ` about ${ctx.raw} LPA (midpoint, self-reported)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v} L` } },
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
    q: "What are the best jobs after BCom for freshers?",
    a: "The jobs that actually hire BCom freshers in volume are accounts and finance operations, banking and NBFC sales or relationship roles, Big 4 and audit support roles, business development, and operations. Sales and business development was the biggest entry-level role family in our October 2026 India count at 24,188 listings, against 7,156 for finance and accounts (Studojo listings data, October 2026). The best-paying of the common fresher routes is analyst work: financial analyst roles are commonly estimated at about 4 to 6 LPA for freshers (self-reported aggregator figures that vary widely), well above a typical executive role (as quoted by BMU, July 2026).",
  },
  {
    q: "What is the salary after BCom for a fresher?",
    a: "Most BCom freshers start at about 2 to 5 LPA, and reported numbers vary a lot by role and city. AmbitionBox's self-reported BCom fresher average sits near 2.1 lakh a year on a small sample, while Naukri's campus guidance puts freshers at 3 to 5 LPA. Executive roles in sales, HR, marketing and operations cluster at about 3.1 to 4.3 LPA (self-reported AmbitionBox figures quoted by BMU, July 2026). A qualified CA is a different market: ICAI says newly qualified CAs average 12 to 13 LPA (Taxscan, May 2026).",
  },
  {
    q: "What are the career options after BBA without an MBA?",
    a: "Without an MBA, BBA graduates are hired mainly into business development and sales, marketing and content, HR and recruiting, operations, customer success, and junior analyst roles. These pay about 3.1 to 4.3 LPA at the start for executive titles (self-reported AmbitionBox figures quoted by BMU, July 2026). The useful fact for anyone delaying an MBA: IIM lateral placement processes typically ask for about 18 months or more of work experience (Careers360), so two years of real work now can make a later MBA pay off better.",
  },
  {
    q: "What jobs can I get after BA?",
    a: "BA graduates are hired most into customer support and success, sales, content and marketing, HR and recruiting, and operations roles, plus government exams for those who choose that route. Arts graduates scored 55.55% on employability in the India Skills Report 2026, below commerce at 62.81%, so a BA graduate usually needs a visible skill on top of the degree. Communication is the strongest card: Mercer-Mettl found communication was the best-scoring skill among Indian graduates at 55.1% employable.",
  },
  {
    q: "Should I do an MBA right after BBA or BCom?",
    a: "Only if you can get into a top school; otherwise working first usually makes more sense. MBA employability fell from 78% to 72.76% in a year in the India Skills Report 2026, and the big averages you read about, around 30 lakh at IIM Ahmedabad (IIMA, 2025), come from a small set of schools that about 2.58 lakh CAT 2025 test-takers compete for (Careers360). Work experience also helps in the MBA job market itself, since lateral placement processes at IIMs usually need 18 months or more.",
  },
  {
    q: "Is CA better than MBA after BCom?",
    a: "CA pays well if you finish, but most people do not finish quickly. Only 16.23% of candidates who wrote both groups of the CA Final in September 2025 passed (2,727 of 16,800, Careers360). Those who do qualify average 12 to 13 LPA at the start according to ICAI (Taxscan, May 2026). An MBA from a strong school can pay more, but costs far more in fees. If you like accounts and can handle a long exam grind, CA has the clearer return; if you want sales, marketing or general management, work first and then decide on an MBA.",
  },
];

export default function JobsAfterBcomBbaBaReport() {
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
        "headline": "Jobs After BCom, BBA and BA in 2026: What Non-Engineering Graduates Actually Land",
        "description": "The roles that hire BCom, BBA and BA graduates, what they pay, how employable each degree is, and when an MBA, CA, CFA or ACCA is worth it.",
        "url": `${BASE_URL}/reports/jobs-after-bcom-bba-ba-2026`,
        "datePublished": "2026-11-07T00:00:00Z",
        "dateModified": "2026-11-07T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/jobs-after-bcom-bba-ba-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Jobs After BCom, BBA and BA in 2026", "item": `${BASE_URL}/reports/jobs-after-bcom-bba-ba-2026` },
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
              <span>Jobs After BCom, BBA and BA, 2026</span>
            </nav>
            <h1>Jobs After BCom, BBA and BA in 2026: What Non-Engineering Graduates <em>Actually Land</em></h1>
            <p className="rpt-hero-sub">
              Not the brochure list of 40 career options. The roles that actually hire commerce,
              management and arts graduates, what they pay in year one, how employable each degree
              is, and when an MBA, CA, CFA or ACCA is worth the money.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · BCom, BBA, BA freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Data</span>
                <span className="rpt-meta-value">ISR 2026, Mercer-Mettl, ICAI, TeamLease</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">7 November 2026</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Sales and customer support dwarf everything else</strong> for non-engineering freshers: 24,188 and 23,147 entry-level listings in October 2026, against 7,156 for finance and accounts (Studojo listings data).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Commerce graduates are 62.81% employable</strong>, up from 55% a year earlier. Arts graduates sit at 55.55% (India Skills Report 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Most executive roles start at <strong>about 3.1 to 4.3 LPA</strong>. Financial analyst roles are commonly estimated at about 4 to 6 LPA, though self-reported figures vary widely by employer.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Only 16.23% passed both groups of the CA Final</strong> in September 2025. Those who qualify average 12 to 13 LPA, per ICAI.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>College tier matters less than you think</strong>: Mercer-Mettl found tier 1 graduates 48.4% employable against 43.4% for tier 3.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">62.81%</div>
              <div className="sc-label">of commerce graduates rated employable, up from 55% in 2025</div>
              <div className="sc-source">India Skills Report 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">3 to 4 L</div>
              <div className="sc-label">typical first-year pay for sales, HR, marketing and operations executives</div>
              <div className="sc-source">Self-reported, AmbitionBox via BMU, Jul 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">16.23%</div>
              <div className="sc-label">of CA Final candidates passed both groups in September 2025</div>
              <div className="sc-source">ICAI results via Careers360, Nov 2025</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Where BCom, BBA and BA Graduates Actually Get Hired</div>
                <div className="sec-sub">The volume is in selling, supporting and running things</div>
              </div>
            </div>
            <p>Search "jobs after BCom" and you get lists of 30 or 40 career options. The hiring data is much narrower. In our count of live India entry-level listings for October 2026, sales and business development led with 24,188 listings and customer support followed with 23,147. Marketing and content (7,998), data and analytics (7,876), HR and recruiting (7,673), finance and accounts (7,156) and operations (6,484) each sat far behind (Studojo listings data, October 2026, published in our <Link to="/reports/india-entry-level-jobs-internships-october-2026">October entry-level count</Link>).</p>
            <div className="chart-wrap">
              <div className="chart-label">Entry-level listings by role family, non-engineering families (Studojo listings data, Oct 2026)</div>
              <div style={{ height: 300 }}>
                <canvas id="jabRoleChart" />
              </div>
            </div>
            <p>None of these families asks for an engineering degree. Here is how the common fresher job titles map to each degree, based on what the roles typically ask for:</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role family</th>
                  <th>Typical fresher titles</th>
                  <th>Best fit</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Accounts and finance ops</td><td>Accounts Executive, AP/AR Associate, GST and Tax Associate, Reconciliation Analyst</td><td>BCom</td></tr>
                <tr><td>Banking and NBFC</td><td>Relationship Executive, Sales Officer, Loan Officer, Branch Operations</td><td>BCom, BBA</td></tr>
                <tr><td>Big 4 and audit support</td><td>Audit Associate, Tax Analyst, Risk Analyst at delivery centres</td><td>BCom</td></tr>
                <tr><td>Sales and BD</td><td>Business Development Executive, Inside Sales, Field Sales</td><td>BBA, BCom, BA</td></tr>
                <tr><td>Customer success and support</td><td>Customer Success Associate, Support Executive</td><td>BA, BBA</td></tr>
                <tr><td>Marketing and content</td><td>Marketing Executive, Content Writer, Social Media Executive</td><td>BA, BBA</td></tr>
                <tr><td>HR</td><td>HR Executive, Recruiter, Talent Acquisition Associate</td><td>BBA, BA</td></tr>
                <tr><td>Operations and analyst</td><td>Operations Executive, MIS Executive, Business or Financial Analyst</td><td>All three, with Excel</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>What this means:</strong> if you only apply to "finance" or "marketing" titles, you are ignoring the two biggest pools. A year in sales or customer success is not a detour. It is where most non-engineering careers in India actually start, and both skills transfer to almost every later role.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Studojo listings data, India entry-level and internship listings posted October 2026, snapshot 2 November 2026.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">How Employable Each Degree Is</div>
                <div className="sec-sub">Commerce is up sharply, arts trails, and the two big surveys disagree</div>
              </div>
            </div>
            <p>The India Skills Report 2026 (Wheebox with partners, based on over 1 lakh candidates who took its Global Employability Test and more than 1,000 employers) put commerce graduates at 62.81% employable, up from 55% the year before. The report links the jump to BFSI and fintech hiring. Science graduates came in at 61% and arts graduates at 55.55%. For context, MBA graduates scored 72.76%, down from 78%, and BE/BTech 70.15% (India Skills Report 2026, as reported by Careers360). The overall national figure was 56.35%.</p>
            <div className="chart-wrap">
              <div className="chart-label">Share of graduates rated employable, by degree (India Skills Report 2026)</div>
              <div style={{ height: 300 }}>
                <canvas id="jabEmployChart" />
              </div>
            </div>
            <p>A second survey tells a harsher story. Mercer-Mettl's India Graduate Skill Index 2025, built on assessments across more than 2,700 campuses, rated only 42.6% of graduates employable, down from 44.3%. The drop came mainly from non-technical roles, where employability fell from 48.3% to 43.5% (ThePrint, February 2025). The two reports use different tests and different samples, so read the gap as a range, not a contradiction: somewhere between four and six in ten graduates are judged job-ready.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Non-technical role (Mercer-Mettl GSI 2025)</th>
                  <th>Graduates rated employable</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Project management</td><td>45.1%</td></tr>
                <tr><td>Business analyst</td><td>44.5%</td></tr>
                <tr><td>Digital marketing</td><td>41.0%</td></tr>
                <tr><td>HR associate</td><td>39.9% <span className="tag-pill pill-amber">Lowest</span></td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>The honest read:</strong> no survey breaks out BBA on its own, and arts graduates score lowest of the three general degrees. The degree gets you into the room. What lifts you above the 40 to 60% line is evidence of one usable skill, which is what sections 5 and 6 are about.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: India Skills Report 2026 via Careers360 (November 2025); Mercer-Mettl India Graduate Skill Index 2025 via ThePrint (February 2025).</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">What the First Job Pays</div>
                <div className="sec-sub">Most roles cluster at 3 to 4 LPA; analyst work pays more</div>
              </div>
            </div>
            <p>There is no official salary survey for BCom, BBA or BA freshers, so every number here is self-reported or indicative. AmbitionBox's self-reported BCom fresher figures average about 2.1 lakh a year on a small sample, while Naukri's campus guidance puts BCom freshers at 3 to 5 LPA. Reported ranges vary, and they depend heavily on city and employer.</p>
            <p>Role is a better predictor than degree. Self-reported AmbitionBox averages, as compiled by BML Munjal University in July 2026, show executive roles bunched tightly together, with analyst roles well above them:</p>
            <div className="chart-wrap">
              <div className="chart-label">Fresher pay by role, midpoint of reported range, LPA (self-reported AmbitionBox data, via BMU, Jul 2026)</div>
              <div style={{ height: 300 }}>
                <canvas id="jabPayChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Reported fresher pay</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Operations Executive</td><td>3.1 to 3.5 LPA</td><td>AmbitionBox, self-reported (via BMU)</td></tr>
                <tr><td>Sales Executive</td><td>3.2 to 3.5 LPA</td><td>AmbitionBox, self-reported (via BMU)</td></tr>
                <tr><td>HR Executive</td><td>3.5 to 3.8 LPA</td><td>AmbitionBox, self-reported (via BMU)</td></tr>
                <tr><td>Marketing Executive</td><td>3.6 to 4 LPA</td><td>AmbitionBox, self-reported (via BMU)</td></tr>
                <tr><td>Business Development Executive</td><td>3.9 to 4.3 LPA</td><td>AmbitionBox, self-reported (via BMU)</td></tr>
                <tr><td>Accounts Executive</td><td>1.8 to 3.6 LPA</td><td>CorpReady, cross-checked against AmbitionBox</td></tr>
                <tr><td>Big 4 graduate hire, no qualification</td><td>4 to 7 LPA</td><td>IIC Lakshya guide, indicative</td></tr>
                <tr><td>Financial Analyst</td><td>About 4 to 6 LPA <span className="tag-pill pill-green">Highest</span></td><td>Salary aggregators, self-reported; estimates vary widely</td></tr>
              </tbody>
            </table>
            <p>Two things to know about these numbers. First, plain accounts roles often pay the least, especially at small firms, even though they feel like the "natural" BCom job. Second, BFSI pay is moving: TeamLease's Jobs and Salaries Primer projected entry-level BFSI salaries to rise 8.9% to 10.4% in FY2025 to 26, led by NBFCs, with relationship executives at NBFCs up 11.6% (TeamLease, via Sightsinplus, October 2025).</p>
            <div className="callout">
              <strong>Watch the CTC:</strong> a 3.5 LPA offer is roughly 29,000 a month on paper, and less after PF and deductions. Compare in-hand pay, and ask about incentives in sales roles, where variable pay can be a large share. Our <Link to="/reports/ctc-illusion-report-what-12-lpa-pays-in-hand-2026" style={{ color: "#c4b5fd" }}>CTC report</Link> shows the maths.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: AmbitionBox self-reported data as quoted by BML Munjal University (July 2026); Naukri campus career guidance; CorpReady; IIC Lakshya (September 2026); TeamLease Jobs and Salaries Primer FY2025 to 26 via Sightsinplus (October 2025).</p>
          </div>
          <StuCta via="report-jobs-after-bcom-bba-ba-2026" place="report-mid" size="quiet" title="Stu finds roles that fit a BCom, BBA or BA and the people hiring for them." />

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">MBA, CA, CFA, ACCA, or Work First?</div>
                <div className="sec-sub">What each route costs, how many finish, and what it pays</div>
              </div>
            </div>
            <p>This is the decision most BCom and BBA students agonise over. The numbers do not give one answer, but they do rule some choices out.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>What it costs or asks</th>
                  <th>How many get through</th>
                  <th>What it pays</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>CA</td><td>Years of articleship and exams</td><td>16.23% passed both groups of the CA Final, Sept 2025 (2,727 of 16,800)</td><td>ICAI says 12 to 13 LPA average for newly qualified CAs</td></tr>
                <tr><td>MBA (top school)</td><td>CAT, then fees that run into lakhs</td><td>About 2.58 lakh took CAT 2025 for a limited set of top seats</td><td>About 30 lakh average at IIM Ahmedabad, 2025</td></tr>
                <tr><td>MBA (general)</td><td>Fees vary widely</td><td>MBA employability fell from 78% to 72.76% (ISR 2026)</td><td>Varies sharply by school</td></tr>
                <tr><td>CFA Level I</td><td>USD 1,140 early or 1,490 standard registration from 2026; enrollment fee removed</td><td>Roughly 43% to 45% pass rate in 2025 windows (third-party reports)</td><td>A signal for analyst roles, not a job by itself</td></tr>
                <tr><td>ACCA</td><td>About 1,500 to 3,000 pounds in ACCA fees before tuition, by exemptions</td><td>BCom exemptions vary by university syllabus</td><td>Useful for Big 4 delivery and global accounting roles</td></tr>
                <tr><td>Work first</td><td>Nothing, you get paid</td><td>Not applicable</td><td>3 to 4 LPA now, plus experience</td></tr>
              </tbody>
            </table>
            <p><strong>The case for working first.</strong> MBA employability dropped about five points in one year (India Skills Report 2026), and CAT registrations fell about 10% in 2025 (Careers360). IIM placements also run a separate lateral process for people with prior experience, typically 18 months or more (Careers360), so work experience is not wasted time on the MBA route. You also learn whether you like sales, finance or HR before you pay to specialise.</p>
            <p><strong>The case for a qualification now.</strong> CA is the one route with a clear, published pay jump. ICAI's own figure of 12 to 13 LPA for newly qualified CAs (Taxscan, May 2026) is three to four times a typical executive start. The cost is time and a low pass rate. CFA and ACCA are cheaper bets that can be done while working, which is their biggest advantage.</p>
            <div className="blist">
              {[
                ["Doing CA", "Go if you like accounting and can handle a multi-year grind. Have a plan B job in accounts or audit if attempts drag on."],
                ["Doing an MBA", "Go straight only for a top school. For others, two years of work usually means a better school and better placements."],
                ["Doing CFA or ACCA", "Do it alongside a job in finance ops, audit or analysis. Fees in dollars and pounds move with the exchange rate, so check official sites before paying."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" />
                  <span><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
            <div className="callout">
              <strong>Bottom line:</strong> a qualification is a multiplier on experience, not a substitute for it. If you are unsure, take the job, then choose the course with a year of real work behind your decision.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: ICAI CA results via Careers360 (November 2025); ICAI salary statement via Taxscan (May 2026); CAT 2025 data via Careers360; IIM Ahmedabad (2025); India Skills Report 2026; CFA fees and pass rates via Zell Education and UWorld; ACCA fees via LearnSignal and CorpReady (third-party, verify on cfainstitute.org and accaglobal.com).</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Skills That Move Pay</div>
                <div className="sec-sub">Excel, SQL, Tally and GST, and plain communication</div>
              </div>
            </div>
            <p>The biggest pay gap in section 3 is between executive roles at about 3 to 4 LPA and analyst roles at about 4 to 6 LPA (self-reported aggregator estimates, which vary widely). What separates them is mostly not the degree. It is whether you can work with data. TeamLease Digital's FY2024 to 25 report projected about 6.37 LPA for entry-level data management and analytics roles in non-tech sectors, and said non-tech sectors pay less partly because of a perceived gap in practical, industry-specific skills among freshers (TeamLease Digital, November 2024).</p>
            <p>We looked for a clean, survey-based number on the "Excel premium" and could not find one. Blog claims of a 25% to 40% premium do not name a dataset, so we are not repeating them as fact. What the hiring side does show clearly is which skills fall short. Mercer-Mettl found communication was the strongest graduate skill at 55.1% employable, with critical thinking at 54.6% and creativity weakest at 44.3% (ThePrint, February 2025).</p>
            <div className="blist">
              {[
                ["Excel, properly", "Pivot tables, XLOOKUP, SUMIFS, basic charts and a clean model. This is the floor for accounts, ops, MIS and analyst roles."],
                ["SQL basics", "Enough to pull and join data. It is the line between an MIS executive and a junior analyst."],
                ["Tally and GST", "For BCom grads aiming at accounts, tax or CA firms. Filing a real GST return or doing a reconciliation is a stronger signal than a certificate."],
                ["Written and spoken English", "Sales, customer success, HR and Big 4 delivery roles all screen for it. It is also the skill that makes a cold email to a manager work."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" />
                  <span><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
            <div className="highlight">
              Pick one skill that matches one role family, and show it with a piece of work, not a course certificate. A reconciliation you built, a sales pitch you recorded, or a dashboard of public data says more than three online badges.
            </div>
            <div className="callout">
              <strong>For BA grads especially:</strong> arts graduates score lowest on degree employability (55.55%, India Skills Report 2026), but communication is the skill graduates score best on overall. Pair writing or speaking ability with Excel and you are competitive for content, HR, customer success and sales roles.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: TeamLease Digital report via TenNews and Punekar News (November 2024); Mercer-Mettl India Graduate Skill Index 2025 via ThePrint; India Skills Report 2026 via Careers360.</p>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">How to Stand Out Without a Campus Brand</div>
                <div className="sec-sub">The college gap is smaller than the contact gap</div>
              </div>
            </div>
            <p>Most BCom, BBA and BA graduates do not come from a college with a busy placement cell. The good news is that college tier explains less than people assume. Mercer-Mettl rated 48.4% of tier 1 graduates employable, 46.1% of tier 2 and 43.4% of tier 3 (ThePrint, February 2025). A five-point gap is real, but it is smaller than the gap between graduates who can show a skill and those who cannot.</p>
            <p>The bigger obstacle is access. In our October 2026 count, 85.1% of India entry-level listings with a real job description gave no direct contact, only an application form (Studojo listings data, October 2026). Applying through forms alone means competing in a queue where nobody has agreed to read you.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Instead of</th>
                  <th>Do this</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Listing "MS Office" on your resume</td><td>Attach one Excel file or dashboard you built from real or public data</td></tr>
                <tr><td>Waiting for campus placement</td><td>Target 20 to 30 firms in one role family, mid-size and growing</td></tr>
                <tr><td>Applying to every "fresher" post</td><td>Write to the sales head, finance manager or HR lead who owns the team</td></tr>
                <tr><td>Hiding a non-brand college</td><td>Lead with what you did: an internship, a family business ledger, a sales target you hit</td></tr>
              </tbody>
            </table>
            <div className="pull-quote">
              <p>"For a non-engineering fresher, the degree rarely decides the offer. Getting in front of the person who runs the team usually does."</p>
              <span className="pq-source">The takeaway from the 2026 employability and listings data</span>
            </div>
            <div className="callout">
              <strong>The move:</strong> a short, specific email to the person who would manage you, showing one piece of relevant work, reaches a human inbox instead of a form. Replies are never guaranteed, but it is the step most applicants skip.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Mercer-Mettl India Graduate Skill Index 2025 via ThePrint (February 2025); Studojo listings data, October 2026.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">What BCom, BBA and BA students ask about jobs and pay, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>A plan for a BCom, BBA or BA fresher in 2026</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The data points to a simple plan:</p>
            <div className="blist">
              {[
                ["Pick a role family, not a degree label", "Sales, customer success, accounts, HR, marketing or analyst. Each has a clear starting band, mostly 3 to 4 LPA, with analyst work higher."],
                ["Do not skip sales and support", "They are the biggest entry-level pools by far, and the skills carry into every later role."],
                ["Build one provable skill", "Excel and SQL for analyst and ops roles, Tally and GST for accounts, writing and speaking for client-facing roles."],
                ["Decide on MBA, CA, CFA or ACCA with data", "CA has the clearest pay jump but a 16.23% both-group pass rate. A non-top MBA rarely beats two years of work."],
                ["Reach the person, not the form", "Most postings give no contact. Writing to the manager who owns the team is how you skip the queue."],
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
              <Link to="/reports/finance-india-2026" className="related-card">
                <div className="rc-kicker">Finance</div>
                <div className="rc-title">Finance in India: What Graduates Actually Face</div>
              </Link>
              <Link to="/reports/off-campus-placement-report-india-2026" className="related-card">
                <div className="rc-kicker">Off-campus</div>
                <div className="rc-title">The Off-Campus Placement Report India 2026</div>
              </Link>
            </div>
          </div>
          <StuCta via="report-jobs-after-bcom-bba-ba-2026" place="report-end" size="card" title="Not sure which role fits your degree?" line="Tell Stu your degree, the work you like and the pay you want in one short call. Stu finds jobs that fit you, finds who's hiring and writes the email to them." />
        </div>
      </main>
      <Footer />
    </>
  );
}
