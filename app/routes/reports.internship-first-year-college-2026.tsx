import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How to Get an Internship in First Year of College, 2026 (With No Skills Yet) | Studojo" },
    { name: "description", content: "Who actually takes first-year students, what AICTE and UGC require, what stipends look like (Internshala reports ₹8,000 a month on average), and the short email that gets a founder or professor to say yes." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "internship for first year students, how to get internship in first year, internship for 1st year btech students, first year college internship india, summer internship for first year students, AICTE internship first year, Microsoft Explore India eligibility, Google STEP 2026" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/internship-first-year-college-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How to Get an Internship in First Year of College, 2026 (With No Skills Yet)" },
    { property: "og:description", content: "Most formal programmes in India start at second year. Here is who still takes first-years, what it pays, and how to ask." },
    { property: "og:url", content: `${BASE_URL}/reports/internship-first-year-college-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-15T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How to Get an Internship in First Year of College, 2026 | Studojo" },
    { name: "twitter:description", content: "Startups, NGOs, professors and your own college lab take first-years. Big Tech mostly does not. The data, the stipends and the email to send." },
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

  // Chart 1: NACE outcome figures (2026 Student Survey and 2026 Internship and Co-op Report)
  const naceEl = document.getElementById("fyiNaceChart") as HTMLCanvasElement | null;
  if (naceEl && !naceEl.dataset.rendered) {
    naceEl.dataset.rendered = "1";
    new Chart(naceEl, {
      type: "bar",
      data: {
        labels: [
          "Class of 2026 with a job offer by graduation",
          "Paid interns (who applied) with at least one offer",
          "Interns converted to full-time hires (2024-25)",
          "Interns who accepted the full-time offer (2024-25)",
        ],
        datasets: [{
          label: "Percent",
          data: [43, 55, 63.1, 88.3],
          backgroundColor: [VIOLET3, VIOLET, VIOLET, VIOLET2],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } },
        },
        scales: {
          x: { min: 0, max: 100, grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}%` } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: reported monthly stipend reference points (Internshala 2024, IIT Kanpur SURGE 2026, Indeed March 2025)
  const stipendEl = document.getElementById("fyiStipendChart") as HTMLCanvasElement | null;
  if (stipendEl && !stipendEl.dataset.rendered) {
    stipendEl.dataset.rendered = "1";
    new Chart(stipendEl, {
      type: "bar",
      data: {
        labels: ["Internshala average, 2024", "IIT Kanpur SURGE, institute funded", "Indeed average, March 2025"],
        datasets: [{
          label: "₹ per month",
          data: [8000, 16000, 25432],
          backgroundColor: [VIOLET, VIOLET2, VIOLET3],
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
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `₹${Number(v).toLocaleString("en-IN")}` } },
        },
      },
    });
  }

  // Chart 3: internships by category (Internshala Internship Trends Report 2024)
  const catEl = document.getElementById("fyiCategoryChart") as HTMLCanvasElement | null;
  if (catEl && !catEl.dataset.rendered) {
    catEl.dataset.rendered = "1";
    new Chart(catEl, {
      type: "doughnut",
      data: {
        labels: ["Management", "Engineering", "Media", "Design", "Education", "Everything else"],
        datasets: [{
          data: [42, 20, 13, 4, 4, 17],
          backgroundColor: [VIOLET, VIOLET2, VIOLET3, "#6d28d9", "#ddd6fe", "#e5e5e5"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of internships` } },
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
    q: "Can a first year student get an internship?",
    a: "Yes, but rarely through the big formal programmes. In India, Microsoft's Explore track has been listed for second-year students (Unstop and Prosple listings of the India posting), and research programmes like the IAS-INSA-NASI Summer Research Fellowship and IIT Kanpur's SURGE take students from second year. First-years get in through startups, NGOs, their own professors and college incubators, usually by asking directly rather than through a portal.",
  },
  {
    q: "Is an internship mandatory for first year B.Tech students?",
    a: "Not an external one. AICTE's internship policy asks for inter or intra institutional activities in the summer after the second semester, such as a tinkering lab, in-house research, workshop training or Institution's Innovation Council work, and sets 14 to 20 credits of internship and related work across the B.Tech, with 1 credit equal to at least 45 hours (AICTE Internship Policy, 2019). Your college sets the exact rules, so check your own academic regulations.",
  },
  {
    q: "Which companies offer internships for first year students in India?",
    a: "Very few large companies do. Google has no STEP posting for summer 2027 and has not announced the programme's end (Extern guide, updated November 2026), and Microsoft Explore in India has been aimed at second-years. The realistic hirers are early-stage startups, NGOs, faculty research projects, college incubators and the listings on the AICTE internship portal, which reports about 4.7 crore student registrations (Internshala's AICTE portal guide, 2026).",
  },
  {
    q: "What is the stipend for a first year internship in India?",
    a: "Expect low or no pay. Internshala's 2024 Internship Trends Report put the average stipend across all students at ₹8,000 a month, and Indeed put the average posted stipend at ₹25,432 a month in March 2025, using a different method. First-year roles sit at the bottom of those ranges, and many college and NGO projects are unpaid. Never pay a company to intern.",
  },
  {
    q: "How do I get an internship in first year with no skills?",
    a: "Build one small, finished thing in a month, then email 15 to 20 specific people who could use it. A founder, a professor or an NGO lead can say yes in one reply, which no portal can. Keep the email under 120 words, name their work, show your one thing, and ask for a defined task over the summer.",
  },
  {
    q: "When should first year students apply for summer internships?",
    a: "Start in December and send most emails in January to March. Formal programmes run earlier: the IAS-INSA-NASI fellowship closed on 31 January 2026 for summer 2026, and IIT Kanpur's SURGE 2026 closed on 22 February 2026 and ran from 11 May to 10 July. Startups and professors usually decide closer to the summer, so early February to March emails land when they are planning.",
  },
];

export default function InternshipFirstYearCollegeReport() {
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
        "headline": "How to Get an Internship in First Year of College, 2026 (With No Skills Yet)",
        "description": "Who actually takes first-year students in India, what AICTE and UGC require, what stipends look like, and the short email that gets a founder or professor to say yes.",
        "url": `${BASE_URL}/reports/internship-first-year-college-2026`,
        "datePublished": "2026-11-15T00:00:00Z",
        "dateModified": "2026-11-15T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/internship-first-year-college-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "How to Get an Internship in First Year of College, 2026", "item": `${BASE_URL}/reports/internship-first-year-college-2026` },
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
              <span>First-Year Internships, 2026</span>
            </nav>
            <h1>How to Get an Internship in <em>First Year</em> of College (With No Skills Yet)</h1>
            <p className="rpt-hero-sub">
              Most of India's formal internship programmes start at second year. First-years still
              get in, through startups, NGOs, professors and their own college, and almost always by
              asking one person directly. Here is who says yes, what it pays, and what to send.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · First-year UG and B.Tech</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Sources</span>
                <span className="rpt-meta-value">NACE, AICTE, UGC, Internshala, Indeed</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Season</span>
                <span className="rpt-meta-value">Summer 2027</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The big programmes mostly start at second year.</strong> Microsoft Explore in India, the IAS-INSA-NASI fellowship and IIT Kanpur's SURGE have all listed second-year students, and Google has no STEP posting for summer 2027.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Your college's first-year requirement can be met on campus.</strong> AICTE asks for inter or intra institutional activities after the second semester, not a company internship.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Internships do pay off later:</strong> 55% of paid interns who applied for jobs had an offer (NACE, Class of 2026), and 63.1% of 2024-25 interns were converted to full-time hires.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Stipends are low.</strong> Internshala reported an average of ₹8,000 a month in 2024. First-year roles sit at the bottom of that range or are unpaid.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The route that works is direct:</strong> one finished project, then a short email to a founder, professor or NGO lead who can say yes in one reply.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">2nd year</div>
              <div className="sc-label">the earliest year Microsoft Explore India, IAS SRFP and IIT Kanpur SURGE have listed</div>
              <div className="sc-source">Unstop, Prosple, IAS and SURGE listings, 2025 to 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">₹8,000</div>
              <div className="sc-label">average monthly internship stipend across all students on Internshala</div>
              <div className="sc-source">Internshala Internship Trends Report 2024</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">63.1%</div>
              <div className="sc-label">of 2024-25 interns were converted to full-time hires by their employer</div>
              <div className="sc-source">NACE 2026 Internship and Co-op Report</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Does a First-Year Internship Even Matter?</div>
                <div className="sec-sub">Not for the job offer. For the next internship.</div>
              </div>
            </div>
            <p>Start with what internships do in general. The most reliable data is American, from the National Association of Colleges and Employers (NACE), but the pattern holds well beyond the US. In NACE's 2026 Student Survey, 43% of the Class of 2026 had at least one job offer before graduating. Among students who had done a paid internship and applied for jobs, 55% had an offer (NACE, survey of more than 17,000 students at 258 institutions, March to May 2026). On the employer side, 63.1% of 2024-25 interns were converted into full-time hires, and 88.3% of those offered accepted (NACE 2026 Internship and Co-op Report, April 2026).</p>
            <div className="chart-wrap">
              <div className="chart-label">What internships lead to, in percent (NACE 2026 Student Survey and 2026 Internship and Co-op Report)</div>
              <div style={{ height: 260 }}>
                <canvas id="fyiNaceChart" />
              </div>
            </div>
            <p>India has a similar signal. Internshala's 2024 Internship Trends Report found that 22% of internships on its platform came with a pre-placement offer (PPO) attached. That is for all students, mostly final-years.</p>
            <p>Now the honest part. None of those numbers are about first-year internships. Nobody converts a first-year intern into a full-time hire three years early. A first-year internship matters for a smaller, more practical reason: it is the line on your resume that gets you the second-year internship, and the second-year one is what gets you the PPO-track role. Each one is a step up to the next.</p>
            <div className="callout">
              <strong>What this means for you:</strong> do not chase a famous logo in first year. Chase a real piece of work with a person who will vouch for it. A specific task you finished at a 10-person startup or in a professor's lab is worth more in second-year applications than a certificate from a course you paid for.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: NACE press release, "More than two out of five of college Class of 2026 had a job offer in hand by graduation" (2026); NACE, "Intern conversion rate hits highest mark in five years" (3 April 2026); Internshala Internship Trends Report 2024, via Careers360.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">What Your College Actually Requires</div>
                <div className="sec-sub">AICTE for engineering, UGC for other degrees</div>
              </div>
            </div>
            <p>A lot of first-year panic comes from hearing "internship is mandatory" without the detail. Here is what the rules say.</p>
            <p><strong>Engineering (AICTE).</strong> AICTE's internship policy counts 14 to 20 credits of internship, entrepreneurship, project work, seminars and inter or intra institutional training toward a B.Tech, with 1 credit equal to at least 45 hours of work. That works out to a minimum of about 630 hours across the degree (AICTE Internship Policy, 2019). For the summer after the second semester, which is your first-year summer, the policy lists inter or intra institutional activities: training at a higher institution, soft-skill training, work in a tinkering lab or institutional workshop, in-house research or consultancy, and Institution's Innovation Council activities. External industry internships are placed in later summers.</p>
            <p><strong>Other undergraduate degrees (UGC).</strong> UGC's final guidelines, issued in October 2023 under NEP 2020, give 2 to 4 credits to an internship of 60 to 120 hours after the fourth semester, with one credit equal to 30 hours. Accepted hosts include research labs, universities, industry, NGOs and social projects, farms and government offices (Careers360, 11 October 2023). In February 2024, UGC asked all universities to implement these guidelines.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>AICTE (B.Tech)</th>
                  <th>UGC (other UG)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Total internship credit</td><td>14 to 20 credits across the degree</td><td>2 to 4 credits</td></tr>
                <tr><td>Hours per credit</td><td>At least 45</td><td>30</td></tr>
                <tr><td>First-year summer</td><td>Inter or intra institutional activities, on campus is fine</td><td>No requirement; the internship comes after semester 4</td></tr>
                <tr><td>Who sets the details</td><td colSpan={2}>Your university or college. Their regulations override any general summary, including this one.</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>The practical upshot:</strong> your first-year requirement can usually be met inside your own college, in a lab, a workshop or the incubator. That means you never need to pay a "certificate internship" company to tick the box. If someone asks for a registration fee to give you an internship, walk away.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: AICTE Internship Policy (aicte.gov.in, 2019 version); UGC internship and research internship guidelines as reported by Careers360 (October 2023 and February 2024). AICTE policy text has been adapted by individual colleges, so check your own regulations.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Who Actually Takes First-Years</div>
                <div className="sec-sub">Big Tech mostly does not. Small teams and your own campus do.</div>
              </div>
            </div>
            <p>We checked the programmes first-years ask about most. The answer for an Indian first-year is mostly "not yet".</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Programme</th>
                  <th>Who it has taken</th>
                  <th>Status for an Indian first-year</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Google STEP</td><td>First and second-year CS undergrads in past cycles</td><td><span className="tag-pill pill-amber">No 2027 posting</span> No summer 2027 posting as of 2 November 2026, and no announced end (Extern guide)</td></tr>
                <tr><td>Microsoft Explore</td><td>First-years in the US, Canada and Mexico; second-years in India</td><td><span className="tag-pill pill-amber">Second year</span> The India listing asked for second-year B.E or B.Tech students (Unstop, Prosple)</td></tr>
                <tr><td>IAS-INSA-NASI Summer Research Fellowship</td><td>B.Tech or BE students in 2nd or 3rd year</td><td><span className="tag-pill pill-amber">Second year</span> Plan to apply in your second-year winter</td></tr>
                <tr><td>IIT Kanpur SURGE</td><td>B.Tech or BS students in 2nd or 3rd year (external)</td><td><span className="tag-pill pill-amber">Second year</span> Institute-funded stipend of ₹16,000 a month in 2026</td></tr>
                <tr><td>AICTE internship portal</td><td>Open to students of AICTE institutions</td><td><span className="tag-pill pill-green">Open</span> Includes virtual and in-house options; quality varies by listing</td></tr>
                <tr><td>Startups, NGOs, professors, college incubators</td><td>Anyone who can do a defined task</td><td><span className="tag-pill pill-green">Open</span> Usually not posted. You have to ask.</td></tr>
              </tbody>
            </table>
            <p>The AICTE internship portal is the one government route built for this. Secondary reports put it at about 4.7 crore student registrations since launch (Internshala's guide to the AICTE portal, 2026, citing official figures). That number also tells you the problem: a portal with crores of registrations is a queue. Use it, but do not make it your only plan.</p>
            <p>The places that reliably take first-years are small and informal:</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Early-stage startups.</strong> A team of five to twenty people has more work than hands, and the founder decides on the spot. Content, research, outreach, testing, simple front-end or data cleanup are all real first-year tasks.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Your own professors.</strong> Faculty with funded projects need help with literature reviews, data entry, simple code and lab work. This also counts toward AICTE's intra institutional activities.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>College incubators and E-cells.</strong> Startups incubated on your campus are the easiest founders to meet in person.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>NGOs.</strong> Most run on thin staff and need help with social media, fundraising research, field surveys and reports. UGC's guidelines explicitly accept social-sector work.</span></div>
            </div>
            <div className="callout">
              <strong>The pattern:</strong> every option that takes first-years has one thing in common. A single person can say yes without a hiring process. Your job is to find that person and give them a reason to.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: Extern, Google STEP guide (updated November 2026); Unstop, Microsoft internship FAQ; Prosple, Microsoft India Explore listing (second-year students); IAS-INSA-NASI SRFP eligibility via Careers360 and Shri Mata Vaishno Devi University notice (2026); IIT Kanpur SURGE (surge.iitk.ac.in, 2026); Internshala blog, AICTE Internship Portal guide (2026).</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">What First-Year Internships Pay</div>
                <div className="sec-sub">Low, often nothing, and the averages disagree</div>
              </div>
            </div>
            <p>There is no clean dataset of first-year stipends in India, so here are the best reference points, with their limits. Internshala's 2024 Internship Trends Report put the average stipend at ₹8,000 a month across all internships on its platform, the same average it reported for 2023, with top offers reaching ₹1 lakh a month. Indeed, measuring its own postings in March 2025, put the average at ₹25,432 a month, with Hyderabad, Bengaluru, Mumbai, Pune and Gurugram above that. The two use different methods and different pools of listings, so read them as a range, not a contradiction.</p>
            <div className="chart-wrap">
              <div className="chart-label">Reported monthly stipend reference points, ₹ (Internshala 2024; IIT Kanpur SURGE 2026; Indeed, March 2025)</div>
              <div style={{ height: 280 }}>
                <canvas id="fyiStipendChart" />
              </div>
            </div>
            <p>First-year roles sit at the bottom of both. Most professor projects and NGO roles are unpaid, and a stipend of a few thousand rupees from a startup is normal. A blog citing an "Internshala 2025" report claims the average rose to ₹9,500; we could not find that report from Internshala itself, so we have not used it.</p>
            <p>Where the internships are matters too. In Internshala's 2024 data, management roles made up 42% of internships and engineering 20%, with media at 13%. Delhi-NCR held 31% of internships, Mumbai 17% and Bengaluru 11%.</p>
            <div className="chart-wrap">
              <div className="chart-label">Internships by category, 2024 (Internshala Internship Trends Report 2024; "Everything else" is the remaining 17%)</div>
              <div style={{ height: 280 }}>
                <canvas id="fyiCategoryChart" />
              </div>
            </div>
            <div className="callout">
              <strong>How to think about pay in first year:</strong> an unpaid internship with a real mentor and a defined output is a fair trade for one summer. Paying the company is never a fair trade. If the work is real and the stipend is zero, agree on what you will ship and that you will get a letter or reference at the end.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: Internshala Internship Trends Report 2024, via Careers360; Indeed India internship data, March 2025, via Storyboard18; IIT Kanpur SURGE 2026 stipend terms (surge.iitk.ac.in).</p>
          </div>
          <StuCta via="report-internship-first-year-college-2026" place="report-mid" size="quiet" title="Stu finds the founder or manager who takes first-year interns and writes the email to them." />

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">What to Build in Month One</div>
                <div className="sec-sub">One finished thing beats five half-done courses</div>
              </div>
            </div>
            <p>"No skills" usually means "nothing to show". You fix that in about four weeks by finishing one small thing that a specific kind of team would actually use. It does not need to be impressive. It needs to be finished, public and easy to look at in under a minute.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>If you want to</th>
                  <th>Build this in month one</th>
                  <th>Who it is for</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Code</td><td>A small working web page or script that solves one problem, on GitHub with a short README</td><td>Startups, professors with software projects</td></tr>
                <tr><td>Data or research</td><td>A cleaned dataset and a one-page summary with two charts, on a topic a target company cares about</td><td>Professors, research labs, analytics startups</td></tr>
                <tr><td>Marketing or content</td><td>Three posts or a short audit of one startup's website or Instagram, with specific fixes</td><td>D2C brands, early startups, NGOs</td></tr>
                <tr><td>Design</td><td>A redesign of one screen of a real app, before and after, with your reasoning</td><td>Startups, agencies</td></tr>
                <tr><td>Social impact</td><td>A two-page note on one NGO's work with three ideas they could try</td><td>NGOs, CSR teams</td></tr>
              </tbody>
            </table>
            <div className="highlight">
              The best month-one project is one made for the exact organisation you will email. A two-page audit of their app or a dataset on their research area tells the reader you already did the work once, for free, for them.
            </div>
            <div className="callout">
              <strong>Keep it to one link:</strong> a GitHub repo, a Google Drive folder or a Notion page. If they need to log in or download a zip, most will not open it.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: Studojo guidance. No statistic is claimed in this section.</p>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">The Email to a Founder or Professor</div>
                <div className="sec-sub">Short, specific, and easy to say yes to</div>
              </div>
            </div>
            <p>A founder or professor is not reading your email to decide whether you are talented. They are deciding whether saying yes will cost them more time than it saves. So the email has one job: make the yes cheap. Keep it under about 120 words, say what you noticed about their work, show your one thing, and ask for a defined task over defined weeks.</p>
            <div className="highlight" style={{ fontWeight: 500 }}>
              <strong>Subject:</strong> First-year at [College], idea for [their product or paper]<br /><br />
              Hi [Name],<br /><br />
              I am a first-year [branch] student at [College]. I read [their paper / used their app] and noticed [one specific thing]. I put together [your one thing] that [what it does for them]: [link].<br /><br />
              I would like to help with [a specific task] for 6 to 8 weeks this summer, from [month]. I can work [remote or in person] and do not need a stipend to start.<br /><br />
              Would a 10-minute call next week work?<br /><br />
              [Name] · [Phone] · [LinkedIn or GitHub]
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>For a professor,</strong> mention the paper or project by name, and ask about a reading or data task, not "any research opportunity".</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>For a founder,</strong> point to something on their product or site, and offer the fix, not your CV.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Follow up once,</strong> five to seven days later, with one new line. Then move on.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Write each email for one person.</strong> Mass-sending the same text to 200 founders reads as a mass email and gets treated like one.</span></div>
            </div>
            <div className="callout">
              <strong>Volume still matters, but in the right unit:</strong> 15 to 20 emails written for 15 to 20 specific people is a real search for a first-year. 300 copy-pasted ones is spam. Replies are never guaranteed either way, so the plan is to send enough personal emails that a few people say yes.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: Studojo guidance and template. No reply-rate statistic is claimed.</p>
          </div>

          {/* Section 7 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">7</div>
              <div>
                <div className="sec-title">The Summer 2027 Timeline</div>
                <div className="sec-sub">Formal deadlines come early. Direct emails peak January to March.</div>
              </div>
            </div>
            <p>Formal research programmes close in winter for the following summer. The IAS-INSA-NASI Summer Research Fellowship closed on 31 January 2026 for the 2026 cycle, and IIT Kanpur's SURGE 2026 accepted applications until 22 February 2026 and ran from 11 May to 10 July 2026. Microsoft's Explore India listing for summer 2026 went up in December 2025, according to job aggregators. Most of these are second-year options, but knowing the calendar now means you will not miss them next year.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>What a first-year should do</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>November to December</td><td>Pick one field. Build your month-one project. List 30 target startups, labs and NGOs.</td></tr>
                <tr><td>January to February</td><td>Talk to two or three of your own professors in person. Send your first 10 to 15 personal emails to founders and NGO leads.</td></tr>
                <tr><td>February to March</td><td>Follow up once. Send the next batch. Check the AICTE portal and your college incubator for listings.</td></tr>
                <tr><td>April</td><td>Confirm the task, the dates and who your mentor is, in writing. Decline anything that asks for a fee.</td></tr>
                <tr><td>May to July</td><td>Do the work. Ship one thing you can show, and ask for a letter at the end.</td></tr>
                <tr><td>August to January (second year)</td><td><span className="tag-pill pill-green">Next step</span> Apply to Explore India, SRFP and SURGE-type programmes, with your first-year work on the resume.</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>Why January to March:</strong> startups and professors plan summer help a few weeks to a couple of months out. An email in October is forgotten by May. An email in late May arrives after they have found someone.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: IAS-INSA-NASI SRFP 2026 deadline via Careers360 and Biotecnika; IIT Kanpur SURGE 2026 dates (surge.iitk.ac.in); Microsoft Explore India posting date via offcampusjobs4u (December 2025). Timeline guidance is Studojo's.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">What first-years ask about internships, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>A first-year plan that fits on one page</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The data points to a simple plan for a first-year in India:</p>
            <div className="blist">
              {[
                ["Skip the logo hunt", "Google STEP has no 2027 posting and Microsoft Explore in India has been for second-years. Aim at small teams this year and big programmes next year."],
                ["Use your own campus", "AICTE's first-year summer requirement can be met in a lab, workshop or incubator. Your professors are the easiest yes you will get."],
                ["Build one thing", "Four weeks, one finished project, one link. Make it for the exact organisation you will email."],
                ["Email one person at a time", "A short, specific email to a founder, professor or NGO lead, sent January to March, is how most first-year internships actually happen."],
                ["Never pay to intern", "Low or no stipend is common in first year. A fee is a scam signal."],
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
              <Link to="/reports/how-to-get-a-high-school-internship-2026" className="related-card">
                <div className="rc-kicker">Internships</div>
                <div className="rc-title">How to Get a High School Internship</div>
              </Link>
              <Link to="/reports/microsoft-internship-report-2026-27" className="related-card">
                <div className="rc-kicker">Big Tech</div>
                <div className="rc-title">The Microsoft Internship Report 2026-27: Explore, SWE, and How to Get In</div>
              </Link>
              <Link to="/reports/how-to-get-a-job-at-a-startup-india-2026" className="related-card">
                <div className="rc-kicker">Startups</div>
                <div className="rc-title">How to Get a Job at a Startup in India, 2026: Founders Read Their Email</div>
              </Link>
            </div>
          </div>
          <StuCta via="report-internship-first-year-college-2026" place="report-end" size="card" title="Want your first internship this summer?" line="Tell Stu the field, the city and the stipend you want in one short call. Stu finds internships that fit you, finds who's hiring and writes the email to them." />
        </div>
      </main>
      <Footer />
    </>
  );
}
