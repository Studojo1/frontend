import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How to Get a Job in Bangalore as a Fresher, 2026: Where the Hiring Is and Who Decides | Studojo" },
    { name: "description", content: "How to get a job in Bangalore as a fresher in 2026: GCCs, startups and IT services, who decides at each, the traps to skip, and how to email the team lead." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "how to get a job in Bangalore as a fresher, jobs in Bangalore for freshers, how to get job in Bangalore, fresher jobs Bangalore 2026, Bangalore startup jobs for freshers, job search in Bangalore" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/how-to-get-a-job-in-bangalore-fresher-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How to Get a Job in Bangalore as a Fresher, 2026: Where the Hiring Is and Who Decides" },
    { property: "og:description", content: "Bengaluru's employer mix (GCCs, startups, IT services), what each hires freshers for, who makes the call, and why you should email the team lead." },
    { property: "og:url", content: `${BASE_URL}/reports/how-to-get-a-job-in-bangalore-fresher-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-28T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How to Get a Job in Bangalore as a Fresher, 2026 | Studojo" },
    { name: "twitter:description", content: "Where Bangalore hires freshers, who actually decides, the paid-consultancy trap, and a three-week plan built around emailing the team lead." },
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
  const LIGHT = "#e5e5e5";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: Bengaluru's share of India's GCCs and GCC workforce (Karnataka GCC Policy 2024-29)
  const gccEl = document.getElementById("blrGccChart") as HTMLCanvasElement | null;
  if (gccEl && !gccEl.dataset.rendered) {
    gccEl.dataset.rendered = "1";
    new Chart(gccEl, {
      type: "bar",
      data: {
        labels: ["India's GCCs", "India's GCC workforce"],
        datasets: [
          { label: "Bengaluru", data: [30, 35], backgroundColor: VIOLET, borderRadius: 6, borderWidth: 0 },
          { label: "Rest of India", data: [70, 65], backgroundColor: LIGHT, borderRadius: 6, borderWidth: 0 },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.dataset.label === "Bengaluru" && ctx.dataIndex === 0 ? "over 30" : ctx.raw}%` } },
        },
        scales: {
          x: { stacked: true, grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 100, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}%` } },
          y: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: how reachable the decision maker is by email, by employer type (editorial rating)
  const empEl = document.getElementById("blrEmployerChart") as HTMLCanvasElement | null;
  if (empEl && !empEl.dataset.rendered) {
    empEl.dataset.rendered = "1";
    new Chart(empEl, {
      type: "bar",
      data: {
        labels: ["Early-stage startup", "Growth-stage startup", "GCC team", "Sales, support, operations", "IT services fresher drive"],
        datasets: [{
          label: "Decision maker reachable by email (1-5)",
          data: [5, 4, 4, 3, 1],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET3, ORANGE],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` Reachable: ${ctx.raw}/5 (editorial)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 12 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: Bangalore job search routes rated by whether a decision maker sees you (editorial rating)
  const routeEl = document.getElementById("blrRouteChart") as HTMLCanvasElement | null;
  if (routeEl && !routeEl.dataset.rendered) {
    routeEl.dataset.rendered = "1";
    new Chart(routeEl, {
      type: "bar",
      data: {
        labels: [
          "Email to the team lead with proof",
          "Referral from a team member",
          "Verified walk-in drive",
          "Mass portal applications",
          "Auto-apply bots",
          "Paying a consultancy",
        ],
        datasets: [{
          label: "Chance a decision maker sees you (1-5)",
          data: [5, 4, 2, 1, 1, 1],
          backgroundColor: [GREEN, VIOLET, VIOLET2, ORANGE, RED, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Rating: ${ctx.raw}/5 (editorial)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
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
    q: "How do I get a job in Bangalore as a fresher?",
    a: "Pick your lane first: GCCs, startups or IT services. For GCCs and startups, find the team lead or founder for the role you want and email them a short note with one piece of proof, from your own address. For IT services fresher drives, follow the official test process on the company's own careers page.",
  },
  {
    q: "Is it hard to find jobs in Bangalore for freshers?",
    a: "It is competitive. Urban youth unemployment in India was 13.6% in 2025 (PLFS Annual Report 2025, MoSPI), and an average online opening draws about 242 applications (The Interview Guys, April 2026). Bengaluru has a deep employer base, so the bottleneck is getting noticed by the person who decides.",
  },
  {
    q: "Which kinds of companies hire freshers in Bangalore?",
    a: "Three main kinds: global capability centres (Bengaluru has over 30% of India's GCCs, per the Government of Karnataka's GCC Policy 2024-29), startups of every size, and IT services firms with structured fresher intake. Sales, support and operations teams across sectors also hire freshers. At GCCs and startups, a team lead or founder usually makes the call.",
  },
  {
    q: "How do I get Bangalore startup jobs for freshers?",
    a: "Email the founder at an early-stage startup, or the team lead at a larger one. Show you understand their product with something concrete: a teardown, a small prototype or three ideas with reasons. Studojo finds the right person, verifies their email and sends a personal email from your own Gmail.",
  },
  {
    q: "Should I pay a job consultancy in Bangalore or go to walk-in interviews?",
    a: "Never pay to be interviewed, trained, registered or placed. A consultancy that charges a fresher is a red flag, and some walk-in ads are fronts for paid courses, so verify any drive on the company's own careers page before you go. You do not need a middleman to reach the person who hires.",
  },
  {
    q: "Do I need to move to Bangalore before my job search in Bangalore starts?",
    a: "Not necessarily. You can find team leads, email them and hold first conversations from anywhere, and many first-round interviews now run online. Say in your email when you can be in Bangalore, so the manager knows you are serious.",
  },
];

export default function BangaloreFresherJobReport() {
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
        "headline": "How to Get a Job in Bangalore as a Fresher, 2026: Where the Hiring Is and Who Decides",
        "description": "How to get a job in Bangalore as a fresher: the city's employer mix (GCCs, startups, IT services), what each hires freshers for, who decides, the traps to skip, and a three-week plan.",
        "url": `${BASE_URL}/reports/how-to-get-a-job-in-bangalore-fresher-2026`,
        "datePublished": "2026-10-28T00:00:00Z",
        "dateModified": "2026-10-28T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/how-to-get-a-job-in-bangalore-fresher-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "How to Get a Job in Bangalore as a Fresher", "item": `${BASE_URL}/reports/how-to-get-a-job-in-bangalore-fresher-2026` },
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
              <span>How to Get a Job in Bangalore as a Fresher</span>
            </nav>
            <h1>How to Get a Job in Bangalore as a Fresher, 2026: <em>Where the Hiring Is and Who Decides</em></h1>
            <p className="rpt-hero-sub">
              How to get a job in Bangalore as a fresher starts with two questions: who is
              hiring, and who decides. The city holds over 30% of India's global capability
              centres, a dense startup scene and the big IT services campuses. At most GCCs
              and startups, a team lead or founder makes the call. Write to them.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Bengaluru · Freshers and final-year students</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Employer mix, decision makers, traps</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>Bengaluru holds <strong>over 30% of India's GCCs and 35% of the GCC workforce</strong> (Government of Karnataka, GCC Policy 2024-29).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Freshers get hired through <strong>three main lanes</strong>: GCCs (engineering, analytics, finance, operations), startups (almost every function, fast), and IT services (structured fresher intake through drives and tests).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>At GCCs and startups, <strong>a team lead or founder usually decides</strong>. That is the person to email, not a generic HR inbox.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>A consultancy or walk-in that asks you to pay is <strong>a trap</strong>. Never pay to be interviewed, trained, registered or placed.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Auto-apply bots and mass applications do not work. Studojo's position: <strong>email the team lead with one piece of proof</strong>, from your own address, and follow up once.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">30%+</div>
              <div className="sc-label">of India's global capability centres (GCCs) are located in Bengaluru</div>
              <div className="sc-source">Government of Karnataka, GCC Policy 2024-29</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">35%</div>
              <div className="sc-label">of India's total GCC workforce works in Bengaluru</div>
              <div className="sc-source">Government of Karnataka, GCC Policy 2024-29</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">13.6%</div>
              <div className="sc-label">unemployment rate among urban youth aged 15 to 29 in India, 2025</div>
              <div className="sc-source">PLFS Annual Report 2025, MoSPI</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Jobs in Bangalore for Freshers: Where the Hiring Actually Is</div>
                <div className="sec-sub">Three lanes, and each one hires differently</div>
              </div>
            </div>
            <p>Bangalore is not one job market. It is three, stacked on top of each other, and each one hires freshers in its own way.</p>
            <p>The first is global capability centres (GCCs): the in-house engineering, analytics, finance and operations teams of multinational companies. Bengaluru is home to over 30% of India's GCCs and 35% of the GCC workforce, according to the Government of Karnataka's GCC Policy 2024-29. The same policy counts 875+ GCC units in Karnataka, out of 2,975+ in India.</p>
            <p>The second is startups, from five-person teams to large venture-funded companies. The third is IT services: large firms with big campuses and structured fresher intake. Around all three sit sales, support and operations roles in every sector.</p>
            <div className="chart-wrap">
              <div className="chart-label">Bengaluru's share of India's GCCs and GCC workforce, % (Government of Karnataka, GCC Policy 2024-29)</div>
              <div style={{ height: 200 }}>
                <canvas id="blrGccChart" />
              </div>
            </div>
            <div className="highlight">
              The practical point: <strong>most fresher roles at GCCs and startups sit inside a team with a named lead</strong>. That lead can be found and emailed. It changes how you should search.
            </div>
            <p>If you are weighing Bangalore against cheaper cities, see <Link to="/reports/tier-2-cities-hiring-jobs-leaving-bangalore-mumbai-2026">Tier 2 Cities Are Hiring</Link>. This report stays on how to get hired inside Bangalore.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Fresher Jobs Bangalore 2026: What Each Employer Type Hires For</div>
                <div className="sec-sub">And who usually makes the call</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employer type</th>
                  <th>What they hire freshers for</th>
                  <th>Who usually decides</th>
                  <th>Best way in</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>GCC</strong></td>
                  <td>Software engineering, data and analytics, finance, operations, cybersecurity</td>
                  <td>The team lead or hiring manager, with HR running the process</td>
                  <td><span className="tag-pill pill-green">Email</span> The team lead, with proof</td>
                </tr>
                <tr>
                  <td><strong>Early-stage startup</strong></td>
                  <td>Generalist roles in growth, sales, operations, product and engineering</td>
                  <td>The founder</td>
                  <td><span className="tag-pill pill-green">Email</span> The founder directly</td>
                </tr>
                <tr>
                  <td><strong>Growth-stage startup</strong></td>
                  <td>Engineering, product, marketing, sales, customer success</td>
                  <td>The lead of the function</td>
                  <td><span className="tag-pill pill-green">Email</span> The team lead, with proof</td>
                </tr>
                <tr>
                  <td><strong>IT services firm</strong></td>
                  <td>Large fresher batches in engineering, testing and support</td>
                  <td>A central process: online test, then interviews</td>
                  <td><span className="tag-pill pill-blue">Official</span> The company's own drive or careers page</td>
                </tr>
                <tr>
                  <td><strong>Sales, support, operations</strong></td>
                  <td>Inside sales, customer support, operations executive roles</td>
                  <td>The team manager</td>
                  <td><span className="tag-pill pill-amber">Verify</span> Email the manager, check any walk-in on the company's site</td>
                </tr>
              </tbody>
            </table>
            <p>For how the big IT services firms hire freshers, see <Link to="/reports/it-services-hiring-report-tcs-infosys-wipro-2026">The IT Services Hiring Report</Link>. Their mass intake runs on tests, so the official process is the route there. Everywhere else in the table, a person decides.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">How to Get Job in Bangalore: Who Actually Decides</div>
                <div className="sec-sub">The recruiter runs the process. The team lead makes the call.</div>
              </div>
            </div>
            <p>At most GCCs and startups, the person who decides whether you get hired is the lead of the team you would join. A recruiter screens and schedules. The team lead shapes the role, runs the interview that matters and says yes or no. At a small startup, that person is usually the founder.</p>
            <p>The application pile lands with the recruiter: an average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data), and a first resume scan lasts about 6 to 7 seconds (Ladders eye-tracking study, 2018). The team lead's inbox is a different place. A short, specific email about their team's work stands out there.</p>
            <div className="chart-wrap">
              <div className="chart-label">How reachable the decision maker is by email, by employer type (Studojo editorial rating, 1-5)</div>
              <div style={{ height: 280 }}>
                <canvas id="blrEmployerChart" />
              </div>
            </div>
            <div className="pull-quote">
              <p>"Find the person whose problem you would solve, then write to them about it."</p>
              <span className="pq-source">The Studojo rule for a Bangalore job search</span>
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Bangalore Startup Jobs for Freshers: Founders Read Their Email</div>
                <div className="sec-sub">Small teams hire people, not applications</div>
              </div>
            </div>
            <p>Many startups hire before a role is ever posted, and at the early stage the founder reads every message that matters. A fresher who sends a specific idea, a teardown or a small working prototype is doing exactly what a founder does all day: showing, not telling.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Show you used the product.</strong> Name one thing that works and one thing you would fix, with a reason.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Bring a finished piece of work.</strong> A landing page rewrite, a prospect list, a script that automates one of their chores. Small and done beats big and planned.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Be quick and clear.</strong> Five lines. The founder should know what you want by the second line.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Be honest about the gaps.</strong> "I have not done this at a company, but here is the version I built" is a strong line for a fresher.</span></div>
            </div>
            <p>The same rules apply at a growth-stage startup or a GCC. The only change is the name at the top of the email: the lead of the team, not the founder.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Job Search in Bangalore: The Traps to Skip</div>
                <div className="sec-sub">Paid consultancies, unverified walk-ins and bots</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Consultancies that charge you.</strong> A consultancy that asks a fresher for a registration, training or placement fee is a red flag. Genuine recruiters are typically paid by the employer, not by you.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Walk-ins you cannot verify.</strong> Some walk-in drives are real, often for support and sales roles. Others are fronts for paid courses. Check the drive on the company's own careers page or official account before you travel. If anyone asks for money at the door, leave.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Auto-apply bots.</strong> Mass-applying adds you to the same pile again and again. Recruiters catch bot applications with hidden instructions in job posts and by spotting one person applying to dozens of roles at the same company (NBC News, November 2024). LinkedIn's terms ban bots and automation tools.</span></div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">Job search in Bangalore: routes rated by whether a decision maker sees you (Studojo editorial rating, 1-5)</div>
              <div style={{ height: 300 }}>
                <canvas id="blrRouteChart" />
              </div>
            </div>
            <div className="callout">
              <strong>The one rule:</strong> never pay to be interviewed, trained, registered or placed. For the warning signs in detail, see <Link to="/reports/fake-job-internship-scams-2026" style={{ color: "#c4b5fd" }}>How to Spot a Fake Job or Internship in 2026</Link>.
            </div>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">A Three-Week Plan for Your Bangalore Job Search</div>
                <div className="sec-sub">Twenty companies, one person each</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Week 1: pick and prepare.</strong> List 20 Bangalore companies across GCCs and startups whose work you understand. Use listings on LinkedIn, Naukri, Indeed and foundit to see which teams are hiring. Build one piece of proof for your field.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Week 2: find and write.</strong> Find the team lead or founder at each company. Write a five-line email that names their work and links your proof. Send it from your own address.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Week 3: follow up and widen.</strong> Follow up once, politely, with anyone who has not replied. Prepare for the conversations you do get. Add the next 20 companies.</span></div>
            </div>
            <p>Replies are not guaranteed, which is why the plan covers 20 companies, not two. But every email goes to one named person who can say yes.</p>
            <p>We built Studojo to do exactly this. It finds the person who can actually hire you (the hiring manager or team lead, not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail. So far, 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026).</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The Bangalore fresher job questions asked most, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to search Bangalore without wasting weeks</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Bangalore has the employers. Your job is to reach the right person at them:</p>
            <div className="blist">
              {[
                ["Pick your lane", "GCC, startup or IT services. Each one hires differently."],
                ["Find the decider", "The team lead at a GCC or growth startup, the founder at an early one."],
                ["Never pay", "Not a consultancy, not a walk-in, not a training fee."],
                ["Email with proof", "Five lines, one link, your own address, one polite follow-up."],
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
                <div className="rc-title">How to Get a Job as a Fresher in India, 2026: What Works When You Have No Experience</div>
              </Link>
              <Link to="/reports/how-to-get-a-job-at-a-startup-india-2026" className="related-card">
                <div className="rc-kicker">Startups</div>
                <div className="rc-title">How to Get a Job at a Startup in India, 2026: Founders Read Their Email</div>
              </Link>
              <Link to="/reports/tier-2-cities-hiring-jobs-leaving-bangalore-mumbai-2026" className="related-card">
                <div className="rc-kicker">Cities</div>
                <div className="rc-title">Tier 2 Cities Are Hiring: The Jobs Leaving Bangalore and Mumbai</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Write to the team lead, not the pile.</h3>
              <p>Studojo finds the person who can actually hire you, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
