import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Summer Internship 2027 in India: What Has Closed, What Is Open Now and What Opens Next | Studojo" },
    { name: "description", content: "Summer internship 2027 India calendar: IIM and IIT drives are done, RBI and a research fellowship close soon. What is open now, and who to email first." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "summer internship 2027 India, summer internship 2027 for btech students in india, summer internship 2027 mba india, summer internship 2027 india for students, summer internship 2027 software, when do summer internships open in india" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/summer-internships-2027-india` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Summer Internship 2027 in India: What Is Still Open" },
    { property: "og:description", content: "The IIM and IIT campus windows for summer 2027 have run. RBI, the Science Academies fellowship and NITI Aayog are still open, and the off-campus window never closes. Here is the calendar, and the move that works." },
    { property: "og:url", content: `${BASE_URL}/reports/summer-internships-2027-india` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-26T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Summer Internship 2027 in India | Studojo" },
    { name: "twitter:description", content: "What has closed, what is open now and what opens next for summer 2027, and why one email to the team lead beats the portal rush." },
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
  const GREEN = "#10b981";
  const GREY = "#d4d4d4";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: when each summer 2027 window runs (illustrative, from the official pages cited, fetched 26 Nov 2026)
  const MONTHS = ["Jun '26", "Jul '26", "Aug '26", "Sep '26", "Oct '26", "Nov '26", "Dec '26", "Jan '27", "Feb '27", "Mar '27", "Apr '27", "May '27", "Jun '27", "Jul '27", "Aug '27"];
  const WINDOWS = [
    "7 Jun 2026 drive, tests from 1 Jul, interviews from 22 Jul 2026",
    "23 to 30 Oct 2026 (IIMA), 26 to 29 Oct 2026 (IIMB)",
    "15 Oct to 15 Dec 2026",
    "Last date 30 Nov 2026",
    "1 to 10 Dec 2026, then 1 to 10 of every month",
    "2 to 22 Feb in the 2026 cycle (2027 dates not yet posted)",
    "Up to three months between April and July 2027",
  ];
  const timeEl = document.getElementById("s27TimelineChart") as HTMLCanvasElement | null;
  if (timeEl && !timeEl.dataset.rendered) {
    timeEl.dataset.rendered = "1";
    new Chart(timeEl, {
      type: "bar",
      data: {
        labels: [
          "IIT Madras intern drive (2026-27)",
          "IIM summer placements (2026-28 batch)",
          "RBI summer placement: applications",
          "Science Academies fellowship 2027",
          "NITI Aayog: next monthly window",
          "IIT Kanpur SURGE (2026 pattern)",
          "RBI summer placement: the internship",
        ],
        datasets: [{
          label: "Window",
          data: [[0.2, 2], [4.7, 5], [4.5, 6.5], [5.6, 6], [6, 6.33], [8.05, 8.7], [10, 14]],
          backgroundColor: [GREY, GREY, GREEN, GREEN, VIOLET, VIOLET2, VIOLET3],
          borderRadius: 6,
          borderSkipped: false,
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${WINDOWS[ctx.dataIndex]}` } },
        },
        scales: {
          x: { min: 0, max: 14, grid: gridOpts, border: { dash: [4, 4] }, ticks: { stepSize: 1, font: { size: 10 }, color: MUTED, callback: (v: any) => MONTHS[v] ?? "" } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: stated internship stipends by band (Studojo Jobs Index, October 2026, 385 listings that state pay)
  const payEl = document.getElementById("s27StipendChart") as HTMLCanvasElement | null;
  if (payEl && !payEl.dataset.rendered) {
    payEl.dataset.rendered = "1";
    new Chart(payEl, {
      type: "bar",
      data: {
        labels: ["Under ₹5,000", "₹5,000 to 10,000", "₹10,000 to 20,000", "₹20,000 to 40,000", "₹40,000 or more"],
        datasets: [{
          label: "Internship listings",
          data: [16, 70, 180, 98, 21],
          backgroundColor: [VIOLET3, VIOLET2, VIOLET, VIOLET2, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} of 385 listings` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: online applications needed for one interview (illustrative, from 0.1% to 2% per application, The Interview Guys, Apr 2026)
  const oddsEl = document.getElementById("s27OddsChart") as HTMLCanvasElement | null;
  if (oddsEl && !oddsEl.dataset.rendered) {
    oddsEl.dataset.rendered = "1";
    new Chart(oddsEl, {
      type: "bar",
      data: {
        labels: ["If 2% of applications work", "If 0.1% of applications work"],
        datasets: [{
          label: "Applications for one interview (illustrative)",
          data: [50, 1000],
          backgroundColor: [VIOLET2, VIOLET],
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
          tooltip: { callbacks: { label: (ctx: any) => ` about ${ctx.raw} applications for one interview` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
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
  .pill-grey { background: #f0f0f0; color: #525252; }

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
    q: "When do summer internships open in India?",
    a: "It depends on the track. For summer 2027, the IIM summer placements ran in late October 2026 and IIT Madras's campus intern drive started in June 2026 with interviews from 22 July, while RBI takes summer placement applications from 15 October to 15 December and the Science Academies research fellowship closes on 30 November 2026. Startups and company teams off campus have no fixed season. Always check the official page before you plan, because dates change every year.",
  },
  {
    q: "Is it too late to apply for a summer internship 2027 in India?",
    a: "No. The big campus processes are mostly done, but RBI's summer placement is open until 15 December, NITI Aayog takes applications from the 1st to the 10th of every month, and IIT Kanpur's SURGE research programme took registrations in February in its last cycle. Off-campus teams at startups and companies hire when they have work, so a short email to the team lead in December or January is well timed.",
  },
  {
    q: "How do BTech students get a summer internship 2027 in India?",
    a: "Through two routes: the on-campus intern drive in your pre-final year, which at IIT Madras started in June 2026 with interviews from 22 July, and off-campus roles at companies that never visit your campus. If the campus drive did not work out for you, build one small project that matches a team's work and email the engineering manager or team lead directly. Stu can find that person and write the email for you.",
  },
  {
    q: "When are MBA summer internships for 2027 decided in India?",
    a: "At the top B-schools, in October of the first year. IIM Ahmedabad and IIM Bangalore both finished their summer placement processes for the 2026-28 batch in late October 2026. If your school runs a later process, follow your placement office, and if you missed out, email managers at firms that did not recruit on your campus.",
  },
  {
    q: "Which government summer internships for 2027 can students apply to now?",
    a: "On 26 November 2026, the Reserve Bank of India's summer placement (until 15 December, for eligible penultimate-year postgraduate, integrated-course and law students) and the Science Academies Summer Research Fellowship (until 30 November) were open. NITI Aayog's internship link opens from the 1st to the 10th of every month. For DRDO and ISRO, see our DRDO and ISRO internship report, and check every official page before you apply.",
  },
  {
    q: "How do I get a summer internship 2027 in software?",
    a: "Target teams, not portals. Pick companies whose product you know, build one small project in their stack, find the engineering manager or team lead and send a short email about what you built and why their team. Big tech careers pages are worth watching, but on 26 November 2026 a search of Google's careers site for Summer 2027 roles in India showed only PhD intern listings.",
  },
];

export default function SummerInternships2027IndiaReport() {
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
        "headline": "Summer Internship 2027 in India: What Has Closed, What Is Open Now and What Opens Next",
        "description": "A summer internship 2027 calendar for India: which campus, finance, government and research windows have closed, which are open now, and why emailing the team lead beats the portal rush.",
        "url": `${BASE_URL}/reports/summer-internships-2027-india`,
        "datePublished": "2026-11-26T00:00:00Z",
        "dateModified": "2026-11-26T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/summer-internships-2027-india` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Summer Internship 2027 in India", "item": `${BASE_URL}/reports/summer-internships-2027-india` },
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
              <span>Summer Internship 2027 in India</span>
            </nav>
            <h1>Summer Internship 2027 in India: <em>What Is Still Open</em></h1>
            <p className="rpt-hero-sub">
              If you want a summer internship 2027 in India, some doors shut in October and one shuts on 30 November.
              Here is what has closed, what is open right now and what opens next, track by track, from the
              official pages. Then the move that beats the January portal rush.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · BTech, MBA and research students</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Data</span>
                <span className="rpt-meta-value">Official institute and programme pages</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Updated</span>
                <span className="rpt-meta-value">26 November 2026</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The IIM summer process for the 2026-28 batch is over.</strong> IIM Ahmedabad ran its clusters from 23 to 30 October 2026, and IIM Bangalore's placement week ran from 26 to 29 October 2026 (official press releases, October 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>IIT Madras's campus intern drive ran in mid-2026.</strong> IIT Madras's 2026-27 timeline put company tests from 1 July and interviews from 22 July 2026 (IIT Madras Internship Office, 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Open now, closing soon:</strong> the Science Academies Summer Research Fellowship 2027 closes on 30 November 2026, and RBI takes summer placement applications from 15 October to 15 December (RBI, 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Open every month:</strong> NITI Aayog's internship link is open from the 1st to the 10th of each month. IIT Kanpur's SURGE took registrations in February in its 2026 cycle.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The window that never closes is off campus.</strong> Write a short email to the team lead who runs the internship before the portal rush starts. Stu finds that person and writes the email for you.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">30 Nov</div>
              <div className="sc-label">last date for Science Academies Summer Research Fellowship 2027 applications</div>
              <div className="sc-source">IASc, INSA and NASI, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">15 Dec</div>
              <div className="sc-label">RBI summer placement applications close (the window opens 15 October)</div>
              <div className="sc-source">Reserve Bank of India, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">0.1 to 2%</div>
              <div className="sc-label">typical success rate of one online application</div>
              <div className="sc-source">The Interview Guys, Apr 2026</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">When do summer internships open in India? The 2027 calendar</div>
                <div className="sec-sub">Where each track stands on 26 November 2026</div>
              </div>
            </div>
            <p>When do summer internships open in India? There is no single date. Each track runs its own clock, and by late November some of those clocks have already stopped. Campus processes at IIMs and IITs decide most of their summer 2027 interns months ahead. Official programmes publish short, fixed windows. Startups and company teams off campus have no window at all, which is exactly why they are worth your time.</p>
            <p>The table maps what each official page said when we opened it on 26 November 2026.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Track</th>
                  <th>Window on the official page</th>
                  <th>Status on 26 Nov 2026</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>IIM summer placements (2026-28 batch)</td><td>IIMA clusters 23 to 30 Oct 2026; IIMB placement week 26 to 29 Oct 2026</td><td><span className="tag-pill pill-grey">Closed</span></td></tr>
                <tr><td>IIT on-campus intern drive (IIT Madras, 2026-27)</td><td>Drive from 7 Jun 2026; tests from 1 Jul; interviews from 22 Jul 2026</td><td><span className="tag-pill pill-grey">Run for this cycle</span></td></tr>
                <tr><td>Big tech careers pages (Google, India)</td><td>Summer 2027 roles listed on the careers site; two PhD intern roles showed on 26 Nov</td><td><span className="tag-pill pill-amber">Partly open</span></td></tr>
                <tr><td>RBI summer placement</td><td>Apply 15 Oct to 15 Dec; interviews in Jan or Feb; placement up to three months between April and July</td><td><span className="tag-pill pill-green">Open, closes 15 Dec</span></td></tr>
                <tr><td>Science Academies Summer Research Fellowship 2027</td><td>Last date 30 Nov 2026; selections around March to April 2027</td><td><span className="tag-pill pill-green">Open, closes 30 Nov</span></td></tr>
                <tr><td>NITI Aayog internship</td><td>Application link open 1st to 10th of every month</td><td><span className="tag-pill pill-amber">Next window 1 to 10 Dec</span></td></tr>
                <tr><td>IIT Kanpur SURGE (research)</td><td>2026 cycle: registration 2 to 22 Feb 2026; reporting 11 May 2026</td><td><span className="tag-pill pill-amber">Watch for the 2027 notice</span></td></tr>
                <tr><td>Startups and company teams off campus</td><td>No fixed season</td><td><span className="tag-pill pill-green">Open whenever a team needs help</span></td></tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">When each summer 2027 window runs (illustrative, from the official pages cited, fetched 26 Nov 2026; grey closed, green open now, violet next)</div>
              <div style={{ height: 320 }}>
                <canvas id="s27TimelineChart" />
              </div>
            </div>
            <div className="callout">
              <strong>Dates change.</strong> Every window here came from the official page on 26 November 2026. Programmes move their dates from year to year, so open the official page before you plan around any of them.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Sources: <a href="https://iima.ac.in/inmedia/pgp-summer-placements-2026-27-cluster-3" target="_blank" rel="noopener noreferrer">IIM Ahmedabad (2026)</a>, <a href="https://www.iimb.ac.in/iimb-summer-placements-2026-28" target="_blank" rel="noopener noreferrer">IIM Bangalore (2026)</a>, <a href="https://internship.iitm.ac.in/students" target="_blank" rel="noopener noreferrer">IIT Madras Internship Office (2026)</a>, <a href="https://opportunities.rbi.org.in/scripts/summer.aspx" target="_blank" rel="noopener noreferrer">Reserve Bank of India (2026)</a>, <a href="https://webjapps.ias.ac.in/fellowship2027/" target="_blank" rel="noopener noreferrer">Science Academies SRFP 2027 (2026)</a>, <a href="https://indiascienceandtechnology.gov.in/internships/internship-niti-aayog" target="_blank" rel="noopener noreferrer">India Science, Technology and Innovation portal (2026)</a>, <a href="https://surge.iitk.ac.in/node/4" target="_blank" rel="noopener noreferrer">IIT Kanpur SURGE (2026)</a>. The chart places each window on a month axis and is illustrative.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Summer internship 2027 for MBA students in India</div>
                <div className="sec-sub">The top B-school process for the 2026-28 batch finished in October</div>
              </div>
            </div>
            <p>If you are in the first year of a two-year MBA at a top school, your summer internship 2027 was most likely decided on campus last month. IIM Ahmedabad held Cluster 1 of the Summer Placement Process for the PGP class of 2028 on 23 October 2026 and Cluster 3 on 30 October 2026, and said that with it, IIMA had concluded the Summer Internship Process for the 2026-28 batch (IIM Ahmedabad press releases, October 2026). IIM Bangalore's placement week for its PGP and PGPBA 2026-28 cohorts ran from 26 to 29 October 2026, with 608 participating students and 128 organisations (IIM Bangalore, 31 October 2026).</p>
            <p>Both processes ran in a compressed week or so, early in the first year, for an internship in the summer between the two years, which for this batch is 2027. Other B-schools set their own calendars, so your placement office is the only source to plan around. Check its notices rather than a date you read online; schedules move.</p>
            <p>What if you were not placed, or you landed a role you do not want? Then the campus process is not your only door. Firms that did not come to your campus, smaller companies and startups still need summer help, and none of them has to run a campus-style process to take an intern. That is where a direct email to the person who runs the team does its best work: there is no queue, because nobody else thought to ask.</p>
            <div className="highlight">
              For the MBA summer market itself, who hires and how offers close, see our <Link to="/reports/mba-internship-market-india-2026">MBA internship market report</Link>. This page sticks to timing: what has closed and what is still open.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Sources: <a href="https://iima.ac.in/inmedia/pgp-summer-placements-2026-27-cluster-1" target="_blank" rel="noopener noreferrer">IIM Ahmedabad, PGP Summer Placements 2026-27 (Cluster 1), 24 October 2026</a>; <a href="https://iima.ac.in/inmedia/pgp-summer-placements-2026-27-cluster-3" target="_blank" rel="noopener noreferrer">IIM Ahmedabad, Cluster 3, 30 October 2026</a>; <a href="https://www.iimb.ac.in/iimb-summer-placements-2026-28" target="_blank" rel="noopener noreferrer">IIM Bangalore, 31 October 2026</a>. Check your own institute's placement office for its dates; they change every year.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Summer internship 2027 for BTech and software students</div>
                <div className="sec-sub">Campus drives ran in mid-2026; off campus, the window stays open</div>
              </div>
            </div>
            <p>For engineering students in the pre-final year, the biggest on-campus window for a summer 2027 internship has already run. IIT Madras's internship office published its 2026-27 timeline: the internship drive from 7 June 2026, company registration from 15 June, company presentations and tests from 1 July and interviews from 22 July 2026 onwards (IIT Madras Internship Office, 2026). Each IIT and NIT sets its own calendar, so ask your training and placement cell for yours; the one we could verify today started in June, and dates can shift next year.</p>
            <p>Big tech intern programmes post their summer roles on their own careers sites, usually in the second half of the year. On 26 November 2026, a search of Google's careers site for Summer 2027 roles in India showed two listings, a Software Engineering PhD Intern and a Silicon Engineering Intern (PhD), both in Bengaluru and Hyderabad (<a href="https://www.google.com/about/careers/applications/jobs/results/?q=%22Summer%202027%22&location=India" target="_blank" rel="noopener noreferrer">Google Careers</a>, searched 26 November 2026). If you are an undergraduate who wanted a big tech summer internship 2027 in software, the lesson is to watch those pages early next cycle, and to look past them this one. Listings open and close, so check the careers page itself.</p>
            <p>So where is the window still open? At the companies that never ran a campus drive: product startups, mid-size software firms, agencies, labs and research groups. They hire interns when a team lead has work and budget, not on a calendar. In our view this is the biggest pool for summer 2027 and the least crowded, because nobody is running a process for it, and nobody is standing in line.</p>
            <div className="blist">
              {[
                ["List 20 teams, not 200 listings", "Companies whose product you use, whose code you have read, or whose work you can explain in one line. A short list is what lets you write a specific email."],
                ["Build one small thing in their stack", "A feature, a bug fix on their open-source repo, a tiny clone, a teardown. One slice of real work says more than a list of languages."],
                ["Find the engineering manager or team lead", "The person who would have you on their team, not a careers inbox. That is who decides whether a summer intern is worth it."],
                ["Write early, then follow up once", "A short email in December or January lands before the listings go up. If there is no reply in about a week, send one polite follow-up and move on."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" />
                  <span><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
            <div className="callout">
              <strong>The software student's edge:</strong> you can show the work. A link to something you built for their product, in three honest lines, is hard for a team lead to ignore. Almost nobody sends one, which is why it stands out.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Sources: <a href="https://internship.iitm.ac.in/students" target="_blank" rel="noopener noreferrer">IIT Madras Internship Office, 2026-27 timeline</a>; <a href="https://www.google.com/about/careers/applications/jobs/results/?q=%22Summer%202027%22&location=India" target="_blank" rel="noopener noreferrer">Google Careers search, 26 November 2026</a>. Check the official pages before you plan; dates and listings change.</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Finance, government and research: the windows still open</div>
                <div className="sec-sub">RBI, the Science Academies, NITI Aayog and IIT research programmes</div>
              </div>
            </div>
            <p><strong>RBI summer placement.</strong> The Reserve Bank of India's summer placement is the clearest open window right now. Eligible domestic students apply through RBI's online form from 15 October to 15 December of the previous year, for an internship starting from April of the next year. Shortlisted candidates are interviewed in January or February, names are communicated in February or March, and the placement normally runs for up to three months between April and July (<a href="https://opportunities.rbi.org.in/scripts/summer.aspx" target="_blank" rel="noopener noreferrer">Reserve Bank of India, summer placements page</a>, 2026). It is for Indian students in the penultimate year of a postgraduate or integrated five-year course in management, statistics, law, commerce, economics, econometrics, banking or finance (three-year law degree students can also apply), and RBI says it selects a maximum of 200 students a year. The same page lists a stipend of ₹25,000 a month from April 2027. Check the RBI page before you apply, because the window and the terms can change.</p>
            <p><strong>Science Academies Summer Research Fellowship 2027.</strong> Run by the Indian Academy of Sciences, the Indian National Science Academy and the National Academy of Sciences, India, it closes on 30 November 2026. Selected students and teachers work with an assigned guide for two months, any time in 2027 but preferably in summer, with a monthly fellowship and train fare, and the academies say selection information will go out around March to April 2027 (<a href="https://webjapps.ias.ac.in/fellowship2027/" target="_blank" rel="noopener noreferrer">Science Academies SRFP 2027 page</a>, 2026). Eligibility and the list of guides sit inside the online application, so read them there, and confirm the deadline on the page itself.</p>
            <p><strong>NITI Aayog internship.</strong> NITI Aayog takes applications on a monthly cycle: the online application link is open from the 1st to the 10th of every month, for undergraduate and postgraduate students and research scholars (<a href="https://indiascienceandtechnology.gov.in/internships/internship-niti-aayog" target="_blank" rel="noopener noreferrer">India Science, Technology and Innovation portal</a>, 2026). That makes 1 to 10 December your next chance. Confirm the current rules and timing on NITI Aayog's own internship page before you apply.</p>
            <p><strong>IIT summer research programmes.</strong> Some of these open in the new year. IIT Kanpur's SURGE shows the shape: in its 2026 cycle, online registration ran from 2 to 22 February 2026, results came on 23 March, and students reported on campus on 11 May 2026 (<a href="https://surge.iitk.ac.in/node/4" target="_blank" rel="noopener noreferrer">IIT Kanpur SURGE, important dates</a>, 2026). The page still showed the 2026 cycle when we checked, so watch it from January for the 2027 notice and its dates.</p>
            <p><strong>DRDO and ISRO.</strong> These run through their own labs and centres, each with its own process. Our <Link to="/reports/drdo-isro-internship-report-2026">DRDO and ISRO internship report</Link> covers eligibility and the official route, so we will not repeat it here.</p>
            <div className="highlight">
              The pattern across official programmes: the windows are short, fixed and public. Put the dates in your calendar today, apply on time, and do not treat them as your only bet. Each one takes a small, set number of students.
            </div>
          </div>

          <StuCta via="report-summer-internships-2027-india" place="report-mid" size="quiet" title="One short call with Stu: tell it the summer internship you want, and Stu finds the person hiring for each match." />

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">What a summer internship pays in India</div>
                <div className="sec-sub">Most listings do not say; here is what the ones that do show</div>
              </div>
            </div>
            <p>What does a summer internship in India pay? It depends on the track more than anything else, and most listings do not tell you. The RBI summer placement page lists ₹25,000 a month from April 2027. For the wider market, the Studojo Jobs Index for October 2026 found that only 385 of 18,458 internship listings in India (2.1%) stated a stipend in rupees, and among those, the median top of the stated range was ₹15,000 a month (Studojo Jobs Index, October 2026).</p>
            <div className="chart-wrap">
              <div className="chart-label">Stated internship stipend, top of range, per month (Studojo Jobs Index, October 2026, 385 listings that state pay in rupees)</div>
              <div style={{ height: 260 }}>
                <canvas id="s27StipendChart" />
              </div>
            </div>
            <p>Most of the listings that state pay sit between ₹10,000 and ₹20,000 a month (180 of 385, or 46.8%). Another 98 (25.5%) reach ₹20,000 to ₹40,000, and only 21 (5.5%) reach ₹40,000 or more. We do not quote campus placement stipends from press releases here: they describe a small group and are a poor guide for most students.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Where the number comes from</th>
                  <th>What it says</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>RBI summer placement page</td><td>₹25,000 a month from April 2027</td><td><span className="tag-pill pill-green">Official</span> Eligibility applies; check the page</td></tr>
                <tr><td>Internship listings that state pay</td><td>Median top of range ₹15,000 a month</td><td>Studojo Jobs Index, Oct 2026, 385 listings</td></tr>
                <tr><td>Listings that state any stipend</td><td>2.1% of 18,458</td><td><span className="tag-pill pill-amber">Most are silent</span> Ask before you accept</td></tr>
              </tbody>
            </table>
            <div className="highlight">
              If a listing does not state the stipend, ask in your first reply. A team that cannot answer plainly is telling you something. Our <Link to="/reports/internship-stipend-india-2026">internship stipend report for India</Link> has the role-by-role numbers.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Sources: <a href="https://opportunities.rbi.org.in/scripts/summer.aspx" target="_blank" rel="noopener noreferrer">Reserve Bank of India, summer placements (2026)</a>; Studojo Jobs Index (October 2026). Stipends change; confirm the number in writing before you accept.</p>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">Beat the portal rush: email the team lead before it starts</div>
                <div className="sec-sub">Why mass applying fails, and the move that works</div>
              </div>
            </div>
            <p>Here is how the portal rush goes. Summer internship listings land on portals like LinkedIn, Internshala, Naukri and Unstop, and a crowd of students hits apply on the same day. A typical opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data), and a single online application succeeds roughly 0.1% to 2% of the time. At those odds, one interview can take anywhere from 50 to 1,000 applications.</p>
            <div className="chart-wrap">
              <div className="chart-label">Online applications needed for one interview (illustrative, from 0.1% to 2% per application, The Interview Guys, Apr 2026)</div>
              <div style={{ height: 200 }}>
                <canvas id="s27OddsChart" />
              </div>
            </div>
            <p>Mass applying, and the auto-apply bots that promise to do it for you, make this worse, not better. A recruiter quoted by NBC News (17 November 2024) described planting hidden instructions in job posts, such as asking applicants to use one odd word, to catch bot applications. The person screening whatever survives spends about 6 to 7 seconds on a first resume scan (Ladders eye-tracking study, 2018). Sending more forms does not change the odds. It just puts you in more queues.</p>
            <p>Studojo's position is simple: stop joining the queue and write to the person who runs the internship. For a summer role, that is usually the team lead or manager who will actually have you on their team. Send a short, specific email from your own address: who you are, one thing you built or did that matches their work, why their team, and a small ask. Send it before the listing goes up, while that person is still deciding whether they need an intern at all. Follow up once.</p>
            <div className="pull-quote">
              <p>The best time to ask for a summer internship is before the listing exists. By the time it is on a portal, you are one of a few hundred.</p>
              <span className="pq-source">Studojo's view</span>
            </div>
            <p>This is the part we built Studojo to do. You start with one short call with Stu, our AI career agent: tell Stu the role, the city and the stipend you want, by talking or typing. Stu finds internships that fit you, finds who is hiring, usually the hiring manager, the head of the team or a recruiter for the role, with a verified work email, and writes a short, personal email to them on why you fit, from your real work. Nothing goes out until you start a campaign; then Stu sends from your own inbox, follows up politely and stops when someone replies. Stu does not mass apply for you and does not promise replies, interviews or jobs. Talking to Stu is free, and so are your top matches every day. You can <a href="https://platform.studojo.com/join?via=report-summer-internships-2027-india&amp;how=voice" data-stu-start="">tell Stu the summer internship you want</a> and see where to start.</p>
            <div className="divider" />
            <div className="blist">
              {[
                ["This week", "If you are eligible, apply for the Science Academies fellowship before 30 November and start the RBI form before 15 December. Note 1 to 10 December for NITI Aayog."],
                ["December", "Pick 15 to 20 teams you would genuinely want to spend a summer with, and build one small piece of proof for the ones you want most."],
                ["Late December to January", "Email the team lead or manager at each, one at a time, in your own words. Follow up once after about a week."],
                ["February onwards", "Watch the IIT research programme pages for their 2027 notices, and keep your list moving: a new target for every one that goes quiet."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" />
                  <span><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Sources: The Interview Guys (April 2026); NBC News (17 November 2024); Ladders eye-tracking study (2018). The chart is illustrative, drawn from the 0.1% to 2% per-application range. Portals are named only as places where listings appear. For the full playbook, see <Link to="/reports/how-to-get-an-internship-india-2026">how to get an internship in India</Link>.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">What students ask about summer internship 2027 in India, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>Your summer 2027 plan, from late November</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The calendar points to a simple plan:</p>
            <div className="blist">
              {[
                ["Accept what has closed", "The IIM and IIT campus windows for summer 2027 have run. If you missed them, you have not missed summer."],
                ["Hit the open deadlines now", "Science Academies fellowship by 30 November, RBI by 15 December, NITI Aayog from 1 to 10 December, if you are eligible."],
                ["Watch for what opens next", "IIT research programmes such as SURGE took registrations in February last cycle. Check their pages from January."],
                ["Go where there is no queue", "Startups and company teams off campus hire when they have work. Email the team lead before the listing exists."],
                ["Let Stu do the slow parts", "Finding who hires, verifying the email and drafting a personal note is what Stu does after one short call."],
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
              <Link to="/reports/how-to-get-an-internship-india-2026" className="related-card">
                <div className="rc-kicker">Internships</div>
                <div className="rc-title">How to Get an Internship in India in 2026: Where to Look and the Move That Works</div>
              </Link>
              <Link to="/reports/internship-stipend-india-2026" className="related-card">
                <div className="rc-kicker">Pay</div>
                <div className="rc-title">Internship Stipend in India 2026: What 385 Listings Actually Pay</div>
              </Link>
              <Link to="/reports/internships-with-ppo-india-2026" className="related-card">
                <div className="rc-kicker">Internships</div>
                <div className="rc-title">Internship With PPO in India 2026: What 460 Listings Actually Say</div>
              </Link>
            </div>
          </div>

          <StuCta via="report-summer-internships-2027-india" place="report-end" size="card" title="Want a summer internship in 2027 without fighting the portal rush?" line="Tell Stu the role, the city and the stipend you want for summer 2027 in one short call. Stu finds internships that fit you, finds the team lead or manager who is hiring with a verified work email, and writes a short email to them, sent from your own inbox once you start a campaign." />
        </div>
      </main>
      <Footer />
    </>
  );
}
