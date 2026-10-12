import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Microsoft Internship Report 2026-27: Explore, SWE, and How to Get In | Studojo" },
    { name: "description", content: "Microsoft runs two intern tracks: Explore for early-year students and SWE internships for later years. Calendar, interview rounds, reported pay and India sites." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "Microsoft internship 2026, Microsoft internship 2027, Microsoft SWE intern, Microsoft Explore program, Microsoft internship India Hyderabad Noida, Microsoft intern salary, how to get a Microsoft internship" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/microsoft-internship-report-2026-27` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Microsoft Internship Report 2026-27: Explore, SWE, and How to Get In" },
    { property: "og:description", content: "Two tracks, one calendar, one interview loop. How Microsoft interns get in, what they are paid as reported, and where India students fit." },
    { property: "og:url", content: `${BASE_URL}/reports/microsoft-internship-report-2026-27` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-14T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Microsoft Internship Report 2026-27 | Studojo" },
    { name: "twitter:description", content: "Explore vs SWE intern, the calendar, the interview and India sites. How Microsoft interns actually get in." },
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
  const GREEN = "#10b981";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: what the interview weighs (illustrative editorial rating)
  const weighEl = document.getElementById("msWeighChart") as HTMLCanvasElement | null;
  if (weighEl && !weighEl.dataset.rendered) {
    weighEl.dataset.rendered = "1";
    new Chart(weighEl, {
      type: "bar",
      data: {
        labels: [
          "Data structures and algorithms",
          "Problem-solving out loud",
          "Clean working code",
          "Collaboration and culture fit",
          "Past projects",
          "Brand-name experience",
        ],
        datasets: [{
          label: "Weight in the loop (1-5)",
          data: [5, 5, 4, 4, 3, 1],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET2, VIOLET3, ORANGE],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Weight: ${ctx.raw}/5 (illustrative)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: suggested prep time split (illustrative)
  const prepEl = document.getElementById("msPrepChart") as HTMLCanvasElement | null;
  if (prepEl && !prepEl.dataset.rendered) {
    prepEl.dataset.rendered = "1";
    new Chart(prepEl, {
      type: "doughnut",
      data: {
        labels: [
          "Coding practice (arrays, strings, trees, graphs)",
          "Explaining your thinking out loud",
          "Project and resume stories",
          "Application and referral work",
        ],
        datasets: [{
          data: [50, 20, 20, 10],
          backgroundColor: [VIOLET, VIOLET2, GREEN, ORANGE],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of prep time (suggested)` } },
        },
      },
    });
  }

  // Chart 3: how early to start, by track (illustrative months before the summer)
  const startEl = document.getElementById("msStartChart") as HTMLCanvasElement | null;
  if (startEl && !startEl.dataset.rendered) {
    startEl.dataset.rendered = "1";
    new Chart(startEl, {
      type: "bar",
      data: {
        labels: ["Start prep", "Apply", "Online assessment", "Interviews"],
        datasets: [
          {
            label: "Months before the summer start",
            data: [8, 9, 7, 6],
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
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` About ${ctx.raw} months out (illustrative)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 12, ticks: { font: { size: 12 }, color: MUTED } },
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
    q: "When do Microsoft internships open for summer 2027?",
    a: "Applications for summer internships typically open in the late summer or early autumn before, so the 2027 window is opening around now. Microsoft's university recruiting pattern is to open early and review on a rolling basis. Apply in the first few weeks, because earlier applications tend to reach interviews first.",
  },
  {
    q: "What is the Microsoft Explore program?",
    a: "Explore is Microsoft's 12-week internship program aimed at first and second-year students. It is built for people who are early in a computer science or related degree and do not yet have much experience. It is the easiest way into Microsoft if you are not yet in your later years.",
  },
  {
    q: "Does Microsoft hire interns in India?",
    a: "Yes. Microsoft hires interns at its India sites, which include Hyderabad, Noida and Bangalore. Roles are mostly engineering, and hiring leans on campus pipelines plus direct applications. Check the careers page for the current list of open India internships.",
  },
  {
    q: "How much do Microsoft interns get paid?",
    a: "Reported US software engineering intern pay is around $8,000 to $9,000 a month, according to self-reported data on Levels.fyi and Glassdoor. Treat that as a rough guide, not a fixed rate. Pay varies by location and role, and India pay is on a different scale that is also only known through reports.",
  },
  {
    q: "How hard is the Microsoft internship interview?",
    a: "It is competitive but predictable. You usually face an online assessment, then coding and problem-solving rounds that test data structures, plus signals on how you work with people. The coding bar is the main filter, so steady practice on core problems matters more than anything else.",
  },
  {
    q: "How do I get a Microsoft internship with no experience?",
    a: "Apply to Explore if you are in your first or second year. It is designed for students without much experience. Build one or two real projects, practise core coding problems, and apply early with a clean resume. A referral from an employee also helps your application get read.",
  },
];

export default function MicrosoftInternshipReport() {
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
        "headline": "The Microsoft Internship Report 2026-27: Explore, SWE, and How to Get In",
        "description": "Microsoft's two intern tracks, the calendar, the interview, reported pay and India sites, and a plan to get in.",
        "url": `${BASE_URL}/reports/microsoft-internship-report-2026-27`,
        "datePublished": "2026-10-14T00:00:00Z",
        "dateModified": "2026-10-14T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/microsoft-internship-report-2026-27` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Microsoft Internship Report 2026-27", "item": `${BASE_URL}/reports/microsoft-internship-report-2026-27` },
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
              <span>Microsoft Internship Report 2026-27</span>
            </nav>
            <h1>How Microsoft Interns <em>Actually Get In</em></h1>
            <p className="rpt-hero-sub">
              Microsoft runs two doors for students: Explore for early years and the
              standard SWE internship for later years. This report covers both, the
              calendar, the interview loop, reported pay and where India students fit.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">US · India</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Explore, SWE intern, interviews</span>
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
          {/* Key findings */}
          <div className="keyfindings">
            <h2>Key findings</h2>
            <div className="kf-list">
              <div className="kf-item"><span className="kf-check">✓</span><span>There are <strong>two tracks</strong>: Explore for first and second-year students, and the SWE internship for later years.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>India hiring runs through <strong>Hyderabad, Noida and Bangalore</strong>, so you do not need to relocate abroad to intern at Microsoft.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Interviews test <strong>data structures, problem-solving and culture fit</strong>, after an online assessment.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Explore is the easiest entry</strong> for first and second-year students with little experience.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Interns are <strong>measured for a return offer</strong> from the first week, so the internship is a long interview.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">12 wks</div>
              <div className="sc-label">length of the Microsoft Explore internship program</div>
              <div className="sc-source">Microsoft</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~$8-9K</div>
              <div className="sc-label">reported monthly pay for a US software engineering intern, self-reported and approximate</div>
              <div className="sc-source">Levels.fyi / Glassdoor (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">Aug-Oct</div>
              <div className="sc-label">typical application window for the following summer</div>
              <div className="sc-source">Microsoft university recruiting pattern</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">The Two Tracks: Explore vs SWE Intern</div>
                <div className="sec-sub">Pick the door that matches your year, not your ambition</div>
              </div>
            </div>
            <p>Microsoft does not have one internship. It has two main student doors. Explore is a 12-week program aimed at first and second-year students. The standard software engineering internship is for students further into their degree, with more coursework and projects behind them.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Track</th>
                  <th>Who it is for</th>
                  <th>What it needs</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Explore</strong></td>
                  <td>First and second-year students <span className="tag-pill pill-green">Early entry</span></td>
                  <td>Curiosity, basic coding, one or two small projects. Experience is not expected.</td>
                </tr>
                <tr>
                  <td><strong>SWE intern</strong></td>
                  <td>Later-year undergrads and postgrads <span className="tag-pill pill-blue">Standard</span></td>
                  <td>Solid data structures, real projects, and strong coding interviews.</td>
                </tr>
              </tbody>
            </table>
            <div className="highlight">
              If you are in your first or second year, <strong>Explore is your best shot</strong>. You compete with people at your own level, not with final-year students who have two internships behind them.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">The Calendar</div>
                <div className="sec-sub">Applications open months before the summer starts</div>
              </div>
            </div>
            <p>Microsoft's pattern is to open applications for next summer in late summer or early autumn and review as they come in. That means the 2027 window is open about now. Waiting until the new year means competing for fewer seats.</p>
            <div className="chart-wrap">
              <div className="chart-label">Rough timeline, in months before a summer start (illustrative)</div>
              <div style={{ height: 260 }}>
                <canvas id="msStartChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Start prep early:</strong> coding fluency takes weeks, not days.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Apply in the first weeks:</strong> rolling review favours early applicants.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Expect an online assessment first,</strong> then interviews a few weeks later.</span></div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">The Interview</div>
                <div className="sec-sub">Online assessment, coding rounds, and what they weigh</div>
              </div>
            </div>
            <p>The process generally starts with an online assessment. Pass it and you move to coding and problem-solving rounds with engineers. Alongside the code, interviewers watch how you work with them: whether you ask questions, take hints and explain your thinking.</p>
            <div className="chart-two">
              <div>
                <div className="chart-label">What the loop weighs (illustrative)</div>
                <div style={{ height: 280 }}>
                  <canvas id="msWeighChart" />
                </div>
              </div>
              <div>
                <div className="chart-label">Suggested prep split (illustrative)</div>
                <div style={{ height: 280 }}>
                  <canvas id="msPrepChart" />
                </div>
              </div>
            </div>
            <div className="pull-quote">
              <p>"A correct answer you cannot explain is weaker than a partial answer you reason through clearly."</p>
              <span className="pq-source">Studojo editorial view on coding interviews</span>
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Pay</div>
                <div className="sec-sub">What is reported, and how far to trust it</div>
              </div>
            </div>
            <p>Microsoft does not publish a standard intern pay figure. Self-reported data on Levels.fyi and Glassdoor puts US software engineering intern pay at roughly $8,000 to $9,000 a month. These are user submissions, so treat them as a rough guide. Pay can differ by location and role.</p>
            <p>India pay is on a different scale and is also known only through reports. Ask the recruiter for the figure at the offer stage, and compare it to the cost of living in your city.</p>
            <div className="callout">
              <strong>Do not anchor on one number.</strong> A reported average hides a range. Use it to set expectations, then confirm the real figure in your offer.
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">India Sites and Who They Hire</div>
                <div className="sec-sub">Hyderabad, Noida and Bangalore</div>
              </div>
            </div>
            <p>Microsoft's India presence includes Hyderabad, Noida and Bangalore. Interns are mostly in engineering roles, hired through campus pipelines and direct applications. You can intern at Microsoft without leaving India.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Hyderabad:</strong> the largest India site, with a wide range of engineering teams.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Noida:</strong> a growing engineering base in the Delhi NCR region.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Bangalore:</strong> engineering and product roles in India's main tech hub.</span></div>
            </div>
            <div className="highlight">
              Check the Microsoft careers page filtered by India for current openings. <strong>Team and location availability changes every cycle.</strong>
            </div>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">A Plan for US and India Students</div>
                <div className="sec-sub">What to do this month</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Pick your track.</strong> Early years: Explore. Later years: SWE intern.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Build one real project</strong> you can explain end to end, including what broke.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Practise core coding problems</strong> and say your thinking out loud as you solve them.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Apply early,</strong> and message an employee or alum for a referral.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Treat the internship as a return-offer audition</strong> from day one: ship something, ask for feedback, document your impact.</span></div>
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The Microsoft internship questions students ask most</div>
              </div>
            </div>
            {FAQ.map((f) => (
              <div className="faq-item" key={f.q}>
                <div className="faq-q">{f.q}</div>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>

          {/* Related reports */}
          <div className="related">
            <h2>Related reports</h2>
            <div className="related-grid">
              <Link to="/reports/google-internship-report-2026" className="related-card">
                <div className="rc-kicker">Big Tech</div>
                <div className="rc-title">The Google Internship Report</div>
              </Link>
              <Link to="/reports/apple-internship-report-2026-27" className="related-card">
                <div className="rc-kicker">Big Tech</div>
                <div className="rc-title">The Apple Internship Report: 2026-27</div>
              </Link>
              <Link to="/reports/amazon-internship-report-2026-27" className="related-card">
                <div className="rc-kicker">Big Tech</div>
                <div className="rc-title">The Amazon Internship Report 2026-27</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Reach the people behind the posting.</h3>
              <p>Studojo Outreach helps you write personal messages to hiring teams, so your application does not sit alone in a portal.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">
              Start Your Outreach →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
