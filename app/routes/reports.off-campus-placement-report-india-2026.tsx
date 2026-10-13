import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Off-Campus Placement Report India 2026: How Freshers Get Hired Without Campus | Studojo" },
    { name: "description", content: "Most Indian students are not placed by their college cell. A breakdown of the off-campus channels that work in 2026, the timeline to follow, and the system to run." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "off campus placement 2026, how to get off campus placement, off campus drive, off campus jobs for freshers india, on campus vs off campus, off campus placement preparation" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/off-campus-placement-report-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Off-Campus Placement Report India 2026: How Freshers Get Hired Without Campus" },
    { property: "og:description", content: "Off-campus is the default path for most Indian freshers. The channels that work, the timeline, and the system to run." },
    { property: "og:url", content: `${BASE_URL}/reports/off-campus-placement-report-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-14T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Off-Campus Placement Report India 2026 | Studojo" },
    { name: "twitter:description", content: "How Indian freshers get hired without campus placement: the channels, the timeline, and the system." },
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
  const RED = "#ef4444";
  const GREEN = "#10b981";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: channel odds (illustrative)
  const chanEl = document.getElementById("ocpChannelChart") as HTMLCanvasElement | null;
  if (chanEl && !chanEl.dataset.rendered) {
    chanEl.dataset.rendered = "1";
    new Chart(chanEl, {
      type: "bar",
      data: {
        labels: [
          "Referral",
          "Direct outreach",
          "Hiring drive",
          "Mass-hiring exam",
          "Niche portal",
          "Big portal, cold apply",
        ],
        datasets: [{
          label: "Relative odds (1-5)",
          data: [5, 4, 4, 3, 3, 1],
          backgroundColor: [GREEN, GREEN, VIOLET, VIOLET2, VIOLET3, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Odds: ${ctx.raw}/5 (illustrative)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: illustrative split of effort for a typical off-campus fresher
  const effortEl = document.getElementById("ocpEffortChart") as HTMLCanvasElement | null;
  if (effortEl && !effortEl.dataset.rendered) {
    effortEl.dataset.rendered = "1";
    new Chart(effortEl, {
      type: "doughnut",
      data: {
        labels: [
          "Direct outreach and referrals",
          "Drives and exams",
          "Niche portals",
          "Big portal applications",
        ],
        datasets: [{
          data: [45, 20, 20, 15],
          backgroundColor: [VIOLET, GREEN, ORANGE, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of weekly time` } },
        },
      },
    });
  }

  // Chart 3: timeline, weekly hours by phase (illustrative)
  const timeEl = document.getElementById("ocpTimelineChart") as HTMLCanvasElement | null;
  if (timeEl && !timeEl.dataset.rendered) {
    timeEl.dataset.rendered = "1";
    new Chart(timeEl, {
      type: "bar",
      data: {
        labels: [
          "12 months out",
          "9 months out",
          "6 months out",
          "3 months out",
          "Graduation",
        ],
        datasets: [{
          label: "Suggested weekly hours",
          data: [3, 5, 8, 10, 10],
          backgroundColor: [VIOLET3, VIOLET3, VIOLET2, VIOLET, VIOLET],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw} hours a week` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
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
    q: "What is off-campus placement?",
    a: "Off-campus placement means getting hired without going through your college's placement cell. You find the job yourself through referrals, direct outreach, hiring drives, exams and job portals. For most Indian students this is the default path, not the backup.",
  },
  {
    q: "Is off-campus placement harder than on-campus?",
    a: "It takes more effort, but it is not harder to win. On-campus hands you a pipeline, off-campus asks you to build one. Students who run a system of referrals and direct outreach often do as well as campus peers, and they are not limited to the companies that visit their college.",
  },
  {
    q: "How do I get an off-campus job as a fresher?",
    a: "Build a clean single-column resume, show proof of work, then contact people directly. Message hiring managers and recent hires at target companies, ask for referrals, and attend drives and exams. A weekly routine beats a burst of 200 portal applications.",
  },
  {
    q: "When should I start off-campus applications?",
    a: "Start about 9 to 12 months before graduation. Use the first months for your resume, projects and a target company list, then ramp up outreach in the final 6 months. Many mass-hiring and drive cycles open well before your final exams.",
  },
  {
    q: "Which websites are best for off-campus jobs?",
    a: "Use a mix. LinkedIn and company career pages for direct contact, Naukri and Indeed for volume, and niche portals like Internshala, Unstop and Wellfound for fresher and startup roles. Portals work best when you pair each application with a direct message to a person.",
  },
  {
    q: "Do companies pay less for off-campus hires?",
    a: "Not as a rule. Pay is set by the role, company and your skills, not by how you were hired. Large mass recruiters often use one fresher salary band for everyone, and startups pay for demonstrated ability. Negotiate on proof of work, not on the channel.",
  },
];

export default function OffCampusPlacementReport() {
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
        "headline": "The Off-Campus Placement Report India 2026: How Freshers Get Hired Without Campus",
        "description": "Off-campus is the default path for most Indian freshers. The channels that work, the timeline, and the system to run.",
        "url": `${BASE_URL}/reports/off-campus-placement-report-india-2026`,
        "datePublished": "2026-10-14T00:00:00Z",
        "dateModified": "2026-10-14T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/off-campus-placement-report-india-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Off-Campus Placement Report India 2026", "item": `${BASE_URL}/reports/off-campus-placement-report-india-2026` },
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
              <span>Off-Campus Placement Report India 2026</span>
            </nav>
            <h1>How Freshers Get Hired <em>Off Campus</em></h1>
            <p className="rpt-hero-sub">
              Most students in India are not placed by their college cell. Off-campus is
              the default path. This report maps the channels that actually work and the
              system to run them.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Channels, timeline, system</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>On-campus placement <strong>reaches only a minority</strong> of students and colleges. Most graduates never get a campus offer.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Off-campus is where most fresher hiring happens</strong>, so treat it as the main path, not the fallback.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>It runs on <strong>referrals, direct outreach to hiring managers, mass-hiring drives and portals</strong>.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Recency and direct contact</strong> beat portal spray. A message to a person outperforms a cold apply.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>A <strong>repeatable weekly system</strong> beats raw application volume.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">Minority</div>
              <div className="sc-label">of colleges run a strong campus recruiting calendar (framed as an estimate)</div>
              <div className="sc-source">Studojo estimate, illustrative</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">Majority</div>
              <div className="sc-label">of fresher hiring in India happens off campus (framed as an estimate)</div>
              <div className="sc-source">Studojo estimate, illustrative</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">Low</div>
              <div className="sc-label">single-digit callback rate on portal-only applications</div>
              <div className="sc-source">Industry estimate (reported)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">On-Campus vs Off-Campus: The Reality</div>
                <div className="sec-sub">Who actually gets campus placement</div>
              </div>
            </div>
            <p>Campus placement is a pipeline that a college builds with recruiters. A small set of colleges, usually top-tier and well connected, run a full calendar of companies. Most colleges host a handful of mass recruiters, or none at all. Even inside a strong college, many students sit through the process without an offer.</p>
            <p>That makes off-campus the default path for most students. You do not wait for a company to visit. You find the company, find the person, and make the case yourself.</p>
            <div className="highlight">
              Off-campus is not the harder version of placement. It is <strong>the main version</strong>. The only question is whether you run it with a system or with panic.
            </div>
            <div className="callout">
              <strong>One honest caveat:</strong> a college placement cell is useful when it works. Use it, then run off-campus in parallel. Do not wait on a drive that may never come.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">The Off-Campus Channels That Work</div>
                <div className="sec-sub">Effort, odds and speed for each channel</div>
              </div>
            </div>
            <p>Not every channel pays back your time equally. The ratings below are Studojo's illustrative read, not a measured survey. They show the pattern: channels with a human in the loop win.</p>
            <div className="chart-wrap">
              <div className="chart-label">Relative odds by channel (illustrative)</div>
              <div style={{ height: 300 }}>
                <canvas id="ocpChannelChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Effort</th>
                  <th>Odds</th>
                  <th>Speed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Referrals</strong></td>
                  <td>Medium: build contacts first</td>
                  <td><span className="tag-pill pill-green">High</span></td>
                  <td>Fast once asked</td>
                </tr>
                <tr>
                  <td><strong>Direct outreach</strong></td>
                  <td>Medium: research and message</td>
                  <td><span className="tag-pill pill-green">High</span></td>
                  <td>Days to weeks</td>
                </tr>
                <tr>
                  <td><strong>Mass-hiring exams</strong></td>
                  <td>High: prepare and sit tests</td>
                  <td><span className="tag-pill pill-amber">Medium</span></td>
                  <td>Weeks to months</td>
                </tr>
                <tr>
                  <td><strong>Niche portals</strong></td>
                  <td>Low to medium</td>
                  <td><span className="tag-pill pill-amber">Medium</span></td>
                  <td>Weeks</td>
                </tr>
                <tr>
                  <td><strong>Hiring drives</strong></td>
                  <td>Medium: travel or register</td>
                  <td><span className="tag-pill pill-blue">Good</span></td>
                  <td>Days to weeks</td>
                </tr>
              </tbody>
            </table>
            <div className="pull-quote">
              <p>"A named person who knows your name beats a thousand applications to a faceless inbox."</p>
              <span className="pq-source">Common refrain among recruiters and hiring managers</span>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">The Timeline</div>
                <div className="sec-sub">When to start before graduation</div>
              </div>
            </div>
            <p>Start earlier than feels necessary. Mass-hiring cycles and drives open months ahead, and referrals need time to build. A steady ramp works better than a last-minute sprint.</p>
            <div className="chart-two">
              <div>
                <div className="chart-label">Suggested weekly hours by phase (illustrative)</div>
                <div style={{ height: 240 }}>
                  <canvas id="ocpTimelineChart" />
                </div>
              </div>
              <div>
                <div className="chart-label">Where your weekly time should go (illustrative)</div>
                <div style={{ height: 240 }}>
                  <canvas id="ocpEffortChart" />
                </div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>12 to 9 months out:</strong> fix your resume, ship two real projects, list 40 target companies.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>9 to 6 months out:</strong> start conversations, join communities, sit mass-hiring tests.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>6 months to graduation:</strong> run weekly outreach, attend drives, follow up every lead.</span></div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">The Off-Campus System</div>
                <div className="sec-sub">Clean resume, proof of work, direct outreach</div>
              </div>
            </div>
            <p>A system is three parts you repeat every week. Each part makes the next one work.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>A clean ATS resume.</strong> Single column, standard headings, selectable text. It gets you through the filter and reads fast.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Proof of work.</strong> Projects, internships, a portfolio or a GitHub link. It gives a stranger a reason to reply.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Direct outreach.</strong> A short message to a hiring manager or recent hire, with one specific ask. Follow up once after a week.</span></div>
            </div>
            <div className="highlight">
              Aim for a fixed weekly quota, for example <strong>10 targeted messages, 5 tailored applications and 1 drive or test</strong>. Consistency compounds. Bursts do not.
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Mistakes That Cost Offers</div>
                <div className="sec-sub">What to stop doing</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Portal spray.</strong> Applying to 200 jobs with one resume and no contact. Low callback rates make this the slowest route.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>No follow-up.</strong> Most replies come after a second nudge. One message and silence wastes the first.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>A generic resume.</strong> The same document for every role. Mirror the language of each post where it is true.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Waiting for campus.</strong> Pausing off-campus work until the college drive result lands.</span></div>
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The off-campus questions students ask most, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to spend your effort</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Treat off-campus as your main plan from day one. Build the system, then run it every week:</p>
            <div className="blist">
              {[
                ["Start early", "Nine to twelve months out beats the final semester scramble."],
                ["Reach people, not inboxes", "Referrals and direct messages carry more weight than any portal."],
                ["Show proof", "A project or internship gives a stranger a reason to answer."],
                ["Follow up", "A single polite nudge a week later doubles your chances of being seen."],
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
              <Link to="/reports/placement-cell-report-what-they-can-cannot-do-2026" className="related-card">
                <div className="rc-kicker">Campus</div>
                <div className="rc-title">What Placement Cells Can and Cannot Actually Do</div>
              </Link>
              <Link to="/reports/job-search-2026" className="related-card">
                <div className="rc-kicker">Job search</div>
                <div className="rc-title">Job Boards Are Dead: How Students Actually Get Hired in 2026</div>
              </Link>
              <Link to="/reports/referrals-vs-applications-how-people-get-hired-2026" className="related-card">
                <div className="rc-kicker">Referrals</div>
                <div className="rc-title">Referrals vs Applications: How People Actually Get Hired</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Run your off-campus search with a system.</h3>
              <p>Studojo Outreach helps you reach hiring managers directly, so your search does not depend on a campus drive.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">
              Try Studojo Outreach →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
