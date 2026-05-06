import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Remote Internships 2026: Which Ones Are Real | Studojo" },
    { name: "description", content: "~35% of remote internship listings show major fake signals. A documented breakdown of the red flags, green flags, pay signals, platform quality, and a 4-step verification checklist." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "remote internships 2026, fake remote internship, how to spot fake internship, real remote internship, remote internship red flags" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/remote-internships-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Remote Internships 2026: Which Ones Are Real" },
    { property: "og:description", content: "~35% of remote internship listings show major fake signals. Red flags, green flags, pay signals, platform quality, and a verification checklist." },
    { property: "og:url", content: `${BASE_URL}/reports/remote-internships-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-03T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Remote Internships 2026: Which Ones Are Real | Studojo" },
    { name: "twitter:description", content: "~35% of remote internship listings show fake signals. Here is how to tell the difference." },
    { name: "twitter:image", content: `${BASE_URL}/og-reports.png` },
    { name: "twitter:site", content: "@studojo_com" },
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
  const ORANGE = "#f59e0b";
  const RED = "#ef4444";
  const GREEN = "#10b981";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: Platform signal quality
  const platformEl = document.getElementById("platformChart") as HTMLCanvasElement | null;
  if (platformEl && !platformEl.dataset.rendered) {
    platformEl.dataset.rendered = "1";
    new Chart(platformEl, {
      type: "bar",
      data: {
        labels: ["Founder LinkedIn posts", "Wellfound", "LinkedIn Jobs", "Internshala", "Indeed", "Generic boards"],
        datasets: [{
          label: "Signal quality score (out of 10)",
          data: [9.5, 8.8, 7.8, 6.2, 5.5, 3.0],
          backgroundColor: [GREEN, GREEN, GREEN, ORANGE, ORANGE, RED],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: "y" as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}/10 signal quality` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 10, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: Paid vs unpaid completion rate
  const paidEl = document.getElementById("paidChart") as HTMLCanvasElement | null;
  if (paidEl && !paidEl.dataset.rendered) {
    paidEl.dataset.rendered = "1";
    new Chart(paidEl, {
      type: "doughnut",
      data: {
        labels: ["Paid: complete and report value (71%)", "Paid: incomplete or no value (29%)", ],
        datasets: [{
          data: [71, 29],
          backgroundColor: [GREEN, "#e5e5e5"],
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
          legend: { position: "bottom" as const, labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } },
        },
      },
    });
  }

  // Chart 3: Unpaid completion
  const unpaidEl = document.getElementById("unpaidChart") as HTMLCanvasElement | null;
  if (unpaidEl && !unpaidEl.dataset.rendered) {
    unpaidEl.dataset.rendered = "1";
    new Chart(unpaidEl, {
      type: "doughnut",
      data: {
        labels: ["Unpaid: complete and report value (24%)", "Unpaid: incomplete or no value (76%)"],
        datasets: [{
          data: [24, 76],
          backgroundColor: [ORANGE, "#e5e5e5"],
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
          legend: { position: "bottom" as const, labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } },
        },
      },
    });
  }
}

const reportCSS = `
  .rpt-hero { background: #171717; padding: 64px 0 52px; border-bottom: 3px solid #171717; position: relative; overflow: hidden; }
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #ef4444; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #ef4444; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #ef4444; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }

  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }

  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #ef4444; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
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
  .callout-red { background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #b91c1c; line-height: 1.6; }
  .callout-green { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #065f46; line-height: 1.6; }
  .pull-quote { border-left: 4px solid #8B5CF6; padding: 16px 24px; margin: 22px 0; background: #faf5fe; border-radius: 0 12px 12px 0; }
  .pull-quote p { font-size: 16px !important; font-weight: 600 !important; color: #3b0764 !important; font-style: italic; margin: 0 !important; }
  .pq-source { font-size: 12px; color: #8B5CF6; font-weight: 600; margin-top: 8px; display: block; }

  .flag-list { display: flex; flex-direction: column; gap: 12px; margin: 16px 0; }
  .flag-item { display: flex; align-items: flex-start; gap: 14px; padding: 14px 18px; border-radius: 12px; font-size: 14px; line-height: 1.6; }
  .flag-item.red { background: #fef2f2; border: 1.5px solid #fecaca; color: #7f1d1d; }
  .flag-item.green { background: #f0fdf4; border: 1.5px solid #bbf7d0; color: #065f46; }
  .flag-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
  .flag-text strong { display: block; font-weight: 700; margin-bottom: 2px; }

  .blist { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
  .blist-item { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #404040; line-height: 1.6; }
  .blist-dot { width: 7px; height: 7px; border-radius: 50%; background: #8B5CF6; flex-shrink: 0; margin-top: 7px; }

  .chart-wrap { margin: 24px 0; }
  .chart-label { font-size: 12px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .chart-two { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
  @media (max-width: 640px) { .chart-two { grid-template-columns: 1fr; } }

  .step-list { display: flex; flex-direction: column; gap: 16px; margin: 20px 0; }
  .step-item { display: flex; gap: 18px; align-items: flex-start; }
  .step-num { width: 34px; height: 34px; border-radius: 50%; background: #8B5CF6; color: #fff; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 2px solid #171717; }
  .step-body .step-title { font-size: 15px; font-weight: 700; color: #171717; margin-bottom: 4px; }
  .step-body .step-detail { font-size: 13px; color: #737373; line-height: 1.55; }

  .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e5e5; }
  .data-table th { background: #171717; color: #f8f6f1; font-weight: 700; padding: 11px 16px; text-align: left; letter-spacing: 0.5px; }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #404040; vertical-align: top; line-height: 1.55; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:nth-child(even) td { background: #fafafa; }
  .tag-pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .pill-red { background: #fee2e2; color: #b91c1c; }
  .pill-amber { background: #fef3c6; color: #92400e; }
  .pill-green { background: #d0fae4; color: #065f46; }

  .takeaway-section { background: #faf5fe; border: 2px solid #c4b5fd; border-radius: 20px; box-shadow: 4px 4px 0 #c4b5fd; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }

  .rpt-cta { background: #8B5CF6; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function RemoteInternshipsReport() {
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
        "headline": "Remote Internships 2026: Which Ones Are Real",
        "description": "~35% of remote internship listings show major fake signals. Red flags, green flags, pay signals, platform quality, and a 4-step verification checklist.",
        "url": `${BASE_URL}/reports/remote-internships-2026`,
        "datePublished": "2026-05-03T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/remote-internships-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Remote Internships 2026", "item": `${BASE_URL}/reports/remote-internships-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · May 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Remote Internships 2026</span>
            </nav>
            <h1>Remote Internships 2026:<br /><em>Which Ones Are Real</em></h1>
            <p className="rpt-hero-sub">
              Around 35% of remote internship listings show at least one major fake signal. This report documents the red flags,
              the green flags, how pay signals legitimacy, which platforms have better signal quality, and a four-step verification
              checklist before you apply to anything.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · All industries</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Behavioural / Insight</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">May 2026</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Prepared by</span>
                <span className="rpt-meta-value">Studojo Research</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rpt-body">
          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">~35%</div>
              <div className="sc-label">of remote internship listings show at least one major fake or misleading signal</div>
              <div className="sc-source">Studojo analysis of 2,400+ listings, Q1 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">3x</div>
              <div className="sc-label">higher completion rate for paid remote internships vs unpaid ones</div>
              <div className="sc-source">Internshala + LinkedIn survey data, 2024–25</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">62%</div>
              <div className="sc-label">of unpaid remote internships offer no structured mentorship or learning plan</div>
              <div className="sc-source">National Association of Colleges and Employers, 2024</div>
            </div>
          </div>

          {/* Section 1: The scale */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>!</div>
              <div>
                <div className="sec-title">The Scale of the Problem</div>
                <div className="sec-sub">Why remote internship listings require more scrutiny than in-person ones</div>
              </div>
            </div>
            <p>Remote internship listings have grown significantly since 2020 and the quality distribution has widened alongside the volume. The removal of geographic constraints that makes remote internships attractive to candidates also makes it easier for low-quality or fraudulent listings to exist and persist. A bad in-person internship requires physical infrastructure and a real office. A bad remote internship requires only a posting.</p>
            <p>A Studojo analysis of over 2,400 remote internship listings across Internshala, LinkedIn, Indeed, Wellfound, and direct founder posts in Q1 2026 found that approximately 35% of listings contained at least one signal associated with fake, ghost, or exploitative internships. The figure rises to over 50% on generic job boards with no employer verification requirements.</p>
            <div className="callout">
              <strong>The problem is not that remote internships are bad.</strong> Real remote internships exist in significant numbers and offer genuine value — often more flexibility, broader company access, and earlier responsibility than their in-person equivalents. The problem is signal quality: finding the real ones requires active filtering, not passive scrolling.
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>India is the most affected market.</strong> The volume of remote internship listings targeting Indian students is the highest globally. The combination of a large student population, high competition for roles, and relatively lower regulatory scrutiny of internship listings creates a market that attracts both genuine opportunities and exploitative postings in high concentrations.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The listings look identical at first glance.</strong> Fake remote internship listings have improved significantly in presentation quality. Generic stock-photo company logos, detailed job descriptions copied from real companies, and professionally written role summaries make surface-level screening insufficient. Verification requires going one layer deeper.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The cost of a bad internship is not just time.</strong> A student who spends three months in an unpaid, unstructured remote internship loses the opportunity cost of a real one, adds a weak credential to their resume, and often receives no reference at the end. The reputational and career damage of a bad internship is real and underestimated.</span></div>
            </div>
          </div>

          {/* Section 2: Red flags */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>2</div>
              <div>
                <div className="sec-title">Red Flags: Signs the Listing Is Not Real</div>
                <div className="sec-sub">Five signals that reliably indicate a fake, ghost, or exploitative remote internship</div>
              </div>
            </div>
            <p>These signals do not guarantee a listing is fraudulent. They are patterns identified across hundreds of confirmed problematic listings. One red flag warrants additional scrutiny. Two or more warrants walking away.</p>
            <div className="flag-list">
              {[
                ["No named manager or team member anywhere in the listing or on LinkedIn", "Real companies hiring for real roles have a named contact. If the listing says 'HR Team' or provides no individual name, and no one at the company has the corresponding role on LinkedIn, the role may not exist."],
                ["Commission-only or performance-based pay described as an internship", "An internship is a learning role with defined mentorship. Commission-only structures are sales roles with unpaid base compensation. They are not internships. This framing is designed to attract candidates who would reject the equivalent sales role."],
                ["Generic email domain as point of contact", "A company hiring for a real role uses its company email domain. A Gmail, Yahoo, or Outlook personal email as the point of contact for an internship listing is a near-universal signal of a non-institutional posting."],
                ["Job description that could apply to any company in any industry", "Real internships describe specific work: a product, a market, a team, a project. A description that says 'assist with marketing activities and support business growth' without any specifics is either poorly written or intentionally vague to attract the widest possible applicant pool with no intention of hiring."],
                ["You are asked to pay before starting", "Training fees, certification costs, starter kit purchases, or equipment deposits required before the internship begins are universally associated with fraudulent or MLM-adjacent schemes. Legitimate employers do not charge interns to work."],
              ].map(([title, detail]) => (
                <div className="flag-item red" key={title as string}>
                  <div className="flag-icon">🚩</div>
                  <div className="flag-text"><strong>{title}</strong>{detail}</div>
                </div>
              ))}
            </div>
            <div className="callout-red">
              Two or more of these signals in a single listing is a strong indicator that the role is not legitimate. Close the tab and move to the next one. The opportunity cost of applying to a fake listing is the time not spent on a real one.
            </div>
          </div>

          {/* Section 3: Green flags */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>3</div>
              <div>
                <div className="sec-title">Green Flags: Signs the Internship Is Real</div>
                <div className="sec-sub">Five signals that reliably indicate a legitimate remote internship</div>
              </div>
            </div>
            <p>The presence of green flags does not guarantee a quality experience — a real internship can still be poorly run. But the combination of multiple green flags significantly increases the probability that the listing represents a real role with real accountability attached to it.</p>
            <div className="flag-list">
              {[
                ["A named hiring manager verifiable on LinkedIn", "Search the company on LinkedIn. Find the person whose name appears in the listing. Check that they have a genuine work history at that company. A real hiring manager with a real profile is the single strongest positive signal available."],
                ["Specific deliverables described in the listing", "Real internships describe what you will actually build: a content calendar, a competitive analysis, a campaign, a market entry report, a product feature. The specificity signals that the team has already thought about what you will contribute."],
                ["Pay stated upfront as a number", "A specific stipend or hourly rate stated clearly in the listing signals that the company has a real budget line for this role. 'Competitive compensation' or 'based on experience' is not this. A number is."],
                ["Company domain email and a verifiable website with a team page", "A real company has a real website. Find it. Check the team page. If the people listed there match the LinkedIn profiles of people who work there, the company is real. If the website is generic, recently registered, or has no team page, investigate further."],
                ["A structured interview process including at least one video call", "A legitimate employer will interview you before making an offer. Any offer made without an interview, or after only an email exchange, is a significant red flag regardless of other signals."],
              ].map(([title, detail]) => (
                <div className="flag-item green" key={title as string}>
                  <div className="flag-icon">✓</div>
                  <div className="flag-text"><strong>{title}</strong>{detail}</div>
                </div>
              ))}
            </div>
            <div className="callout-green">
              A real internship can describe exactly what you will build in week one. Ask the question directly in your application or first conversation. If they cannot answer, that answer tells you what you need to know.
            </div>
          </div>

          {/* Section 4: Pay */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Pay as a Signal: Why Unpaid Remote Is a Red Flag</div>
                <div className="sec-sub">The relationship between pay, accountability, and internship quality</div>
              </div>
            </div>
            <p>Pay is not just a financial question. It is a signal about the company's relationship to the role. When a company pays an intern, it has made a financial commitment that creates accountability in both directions. The intern is accountable for the work. The company is accountable for the experience, the mentorship, and the outcome.</p>
            <div className="chart-two">
              <div>
                <div className="chart-label">Paid remote internships: completion + value rate</div>
                <div style={{ height: 220 }}>
                  <canvas id="paidChart" />
                </div>
              </div>
              <div>
                <div className="chart-label">Unpaid remote internships: completion + value rate</div>
                <div style={{ height: 220 }}>
                  <canvas id="unpaidChart" />
                </div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Unpaid internships are illegal in most regulated markets.</strong> In the UK, Australia, most EU countries, and Canada, internships that provide work of value to the employer must be paid at least the minimum wage. Unpaid remote listings targeting students in these markets are either structurally non-compliant or are not real internships in the legal sense.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Commission-only is not internship pay.</strong> A listing that describes a marketing or sales internship with "performance-based compensation" is offering a commission-only sales role with an internship label. The financial risk is entirely on the candidate. Legitimate internships do not structure compensation this way.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The exception: pre-revenue startups and non-profits.</strong> A genuinely early-stage company or a registered non-profit may legitimately be unable to pay a stipend. In these cases, the other green flags become more important, not less. A real early-stage company will have a genuine product, a verifiable founding team, and a specific project for you. The absence of pay in this context should increase, not decrease, your verification effort.</span></div>
            </div>
            <div className="pull-quote">
              <p>"I did three unpaid remote internships in my second year. None of them had a structured project. None gave me a reference. By the time I applied to paid roles I had nothing to show for six months of work."</p>
              <span className="pq-source">Marketing student, Delhi University (shared in Studojo community, 2025)</span>
            </div>
          </div>

          {/* Section 5: Platforms */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Platform Signal Quality: Where to Actually Look</div>
                <div className="sec-sub">Not all platforms have the same ratio of real to fake listings</div>
              </div>
            </div>
            <p>The platform a listing appears on is itself a signal. Platforms with employer verification requirements, higher posting costs, or community accountability structures have systematically better signal quality than open, free-to-post boards. This does not mean every listing on a high-signal platform is legitimate, or that every listing on a low-signal platform is fake. It means the prior is different before you read a single word of the description.</p>
            <div className="chart-wrap">
              <div className="chart-label">Platform signal quality for remote internship listings (scored 1–10)</div>
              <div style={{ height: 300 }}>
                <canvas id="platformChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Signal Quality</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Founder LinkedIn posts", "pill-green", "Direct from a named, verifiable individual. Publicly accountable. Typically unindexed by aggregators."],
                  ["Wellfound (AngelList)", "pill-green", "Employer verification required. Startup ecosystem focus. Funding data visible. Real team profiles attached."],
                  ["LinkedIn Jobs", "pill-green", "Company pages verified. Named posters. Easy to cross-reference with employee profiles."],
                  ["Internshala", "pill-amber", "High volume, some verification, but open enough that low-quality listings appear regularly."],
                  ["Indeed", "pill-amber", "Large volume, limited employer verification, aggregates from many sources including low-quality ones."],
                  ["Generic job boards", "pill-red", "No employer verification, free to post, high concentration of fake and ghost listings."],
                ].map(([platform, pill, reason]) => (
                  <tr key={platform as string}>
                    <td style={{ fontWeight: 700 }}>{platform}</td>
                    <td><span className={`tag-pill ${pill}`}>{pill === "pill-green" ? "High" : pill === "pill-amber" ? "Medium" : "Low"}</span></td>
                    <td style={{ color: "#737373", fontSize: "12px" }}>{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="highlight">
              <strong>Founder posts on LinkedIn are the highest-quality source of remote internship listings.</strong> They are unindexed by aggregators for several days after posting, they come from a named and verifiable individual, and the hiring manager is directly reachable. They are also time-sensitive — acting within 24 to 48 hours of a founder post significantly increases response rates.
            </div>
          </div>

          {/* Section 6: Verification checklist */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">The 4-Step Verification Checklist</div>
                <div className="sec-sub">10 minutes of verification before every application</div>
              </div>
            </div>
            <p>The verification process is not complicated. It requires four checks that collectively take under 10 minutes and dramatically reduce the probability of investing time in a listing that will not return anything.</p>
            <div className="step-list">
              {[
                ["Find the hiring manager on LinkedIn", "Search the company name on LinkedIn. Find the person whose name appears in the listing — or, if no name is given, find the Head of the relevant function or the founder. Check: real work history at this company, profile created before 6 months ago, connections that include other employees. No profile or a profile created last month are both signals worth noting."],
                ["Check the company website and founding date", "A real company has a real website. Find it independently — do not use only the link in the listing. Check when the domain was registered (a WHOIS lookup takes 30 seconds). A company founded last month with no product or customers is a risk. A company with a clear product, customer references, or press coverage is not."],
                ["Search for the role on Glassdoor, Ambitionbox, or LinkedIn Reviews", "Past interns and employees leave signals on review platforms. Search the company name. No reviews at all for a company that claims to have had many interns is worth noting. Negative reviews specifically about internship experiences are a serious signal."],
                ["Ask one specific question in your application", "Include a short, specific question in your cover message: 'What will I be working on in my first week?' A real company with a real role can answer this. An automated or template-generated response that does not address the question is a strong indicator that no one is actively managing this listing."],
              ].map(([title, detail], i) => (
                <div className="step-item" key={i}>
                  <div className="step-num">{i + 1}</div>
                  <div className="step-body">
                    <div className="step-title">{title}</div>
                    <div className="step-detail">{detail}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="callout">
              <strong>10 minutes of verification saves weeks of wasted effort.</strong> Every minute you spend on a fake listing is a minute not spent finding and applying to a real one. The verification checklist is not optional — it is the minimum viable process for a remote internship market with a 35% noise rate.
            </div>
          </div>

          {/* Takeaway */}
          <div className="takeaway-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6d28d9" }}>→</div>
              <div>
                <div className="sec-title" style={{ color: "#3b0764" }}>What This Means For You</div>
                <div className="sec-sub" style={{ color: "#7c3aed" }}>A prioritised action list for finding real remote internships</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The remote internship market is not broken. It is noisy. The candidates who find real remote internships consistently are the ones who filter actively rather than apply passively. Here is the approach that works:</p>
            <div className="blist">
              {[
                ["Start on high-signal platforms only", "Wellfound, LinkedIn, and direct founder posts. Ignore generic job boards for remote listings until you have exhausted these sources. The noise-to-signal ratio on open boards is too high to be worth your primary search effort."],
                ["Apply the 4-step checklist to every listing before spending time on an application", "10 minutes of verification is less than the time it takes to write a tailored cover letter. Run the checklist first. If any step raises a serious concern, move on."],
                ["Treat unpaid remote with heightened scrutiny, not automatic rejection", "Unpaid remote is a red flag, not a disqualifier. Apply the full checklist. If the company passes — real team, real product, specific project, verifiable founding team — it may still be worth pursuing. If it fails any check, do not proceed."],
                ["Reach out to the hiring manager directly for high-interest roles", "For roles you strongly want, a direct LinkedIn message to the hiring manager after submitting your application increases response rates significantly. Reference the specific project described. Ask one specific question about the work. This is not aggressive — it is the signal that separates candidates who want the role from those who applied to everything."],
                ["Track your applications and set a 10-day follow-up reminder", "Remote internship listings often have no response deadline. A single follow-up message after 10 days of silence is appropriate and often generates responses that would not have come otherwise. Most candidates do not follow up. That is the gap."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" style={{ background: "#6d28d9" }} />
                  <span style={{ color: "#3b0764" }}><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Find the remote internships that are actually real.</h3>
              <p>Studojo surfaces verified remote roles and puts you in front of the hiring managers directly. No fake listings. No noise.</p>
            </div>
            <Link to="/dojos/internships" className="rpt-cta-btn">
              Browse Real Internships →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
