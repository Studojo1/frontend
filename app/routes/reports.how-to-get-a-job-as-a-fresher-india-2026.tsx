import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How to Get a Job as a Fresher in India, 2026: What Works When You Have No Experience | Studojo" },
    { name: "description", content: "How to get a job as a fresher in India in 2026: why applying alone stalls, what proof replaces experience, and how to email the team lead who hires." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "how to get a job as a fresher, how to get a job as a fresher with no experience, how to get first job in India, fresher job search India, how to get a job as a fresher in India, jobs for freshers 2026" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/how-to-get-a-job-as-a-fresher-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How to Get a Job as a Fresher in India, 2026: What Works When You Have No Experience" },
    { property: "og:description", content: "Graduate unemployment, the application pile, and the fresher route that reaches a person: proof of work plus a short email to the team lead who hires." },
    { property: "og:url", content: `${BASE_URL}/reports/how-to-get-a-job-as-a-fresher-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-28T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How to Get a Job as a Fresher in India, 2026 | Studojo" },
    { name: "twitter:description", content: "No experience? Build one piece of proof and email the team lead who hires. The numbers behind the fresher job search in India." },
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

  // Chart 1: unemployment rate by education and age (State of Working India 2023, PLFS 2021-22 data)
  const ageEl = document.getElementById("frsAgeChart") as HTMLCanvasElement | null;
  if (ageEl && !ageEl.dataset.rendered) {
    ageEl.dataset.rendered = "1";
    new Chart(ageEl, {
      type: "bar",
      data: {
        labels: ["Graduates under 25", "Higher secondary, under 25", "Graduates 35 to 39", "Graduates 40 and above"],
        datasets: [{
          label: "Unemployment rate (%)",
          data: [42.3, 21.4, 4.5, 1.6],
          backgroundColor: [RED, ORANGE, VIOLET2, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% unemployed` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 50, ticks: { font: { size: 12 }, color: MUTED, callback: (v: any) => `${v}%` } },
        },
      },
    });
  }

  // Chart 2: youth (15 to 29) unemployment, 2024 vs 2025 (PLFS Annual Report 2025, MoSPI)
  const youthEl = document.getElementById("frsYouthChart") as HTMLCanvasElement | null;
  if (youthEl && !youthEl.dataset.rendered) {
    youthEl.dataset.rendered = "1";
    new Chart(youthEl, {
      type: "bar",
      data: {
        labels: ["All youth", "Rural youth", "Urban youth"],
        datasets: [
          { label: "2024", data: [10.3, 8.7, 14.3], backgroundColor: VIOLET3, borderRadius: 6, borderWidth: 0 },
          { label: "2025", data: [9.9, 8.3, 13.6], backgroundColor: VIOLET, borderRadius: 6, borderWidth: 0 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}%` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 16, ticks: { font: { size: 12 }, color: MUTED, callback: (v: any) => `${v}%` } },
        },
      },
    });
  }

  // Chart 3: routes rated by whether a person who decides sees your work (editorial rating)
  const routeEl = document.getElementById("frsRouteChart") as HTMLCanvasElement | null;
  if (routeEl && !routeEl.dataset.rendered) {
    routeEl.dataset.rendered = "1";
    new Chart(routeEl, {
      type: "bar",
      data: {
        labels: [
          "Email to the team lead with proof",
          "Referral from someone inside",
          "Campus drive (if your college has one)",
          "Tailored portal application",
          "Mass portal applications",
          "Auto-apply bot",
        ],
        datasets: [{
          label: "Chance a decision maker sees you (1-5)",
          data: [5, 4, 3, 2, 1, 1],
          backgroundColor: [GREEN, VIOLET, VIOLET2, VIOLET3, ORANGE, RED],
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
    q: "How do I get a job as a fresher with no experience?",
    a: "Replace experience with proof, then put that proof in front of the person who hires. Build one small piece of work tied to the company (a project, a teardown, a short analysis) and email it to the team lead from your own address. One specific email to the right person does more than dozens of generic applications.",
  },
  {
    q: "How to get first job in India if my college has no campus placements?",
    a: "Go off campus and go direct. Use Naukri, LinkedIn, Indeed, Internshala or foundit to see which companies are hiring, then find the team lead for the role and email them with one piece of proof. Studojo does that part for you: it finds the person, verifies the email and sends a personal email from your own Gmail.",
  },
  {
    q: "Which website is best for a fresher job search in India?",
    a: "Listings live on Naukri, LinkedIn, Indeed, Internshala and foundit, and they are useful for seeing who is hiring. The site matters less than what you do next, because an average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data). Use the listing to find the team, then email the person who leads it.",
  },
  {
    q: "Do auto-apply tools work for freshers?",
    a: "No. Auto-apply bots and AI job hunters that mass-apply put you in the same pile hundreds of times, and recruiters spot bot applications with hidden instructions in job posts and by noticing one person applying to dozens of roles at one company (NBC News, November 2024). LinkedIn's terms also ban bots and automation tools. A few personal emails to team leads are a better use of the same hour.",
  },
  {
    q: "Is it okay for a fresher to email a hiring manager directly?",
    a: "Yes. Keep it to about five lines, name something specific about their team's work, include one piece of proof and send it from your own email address. Follow up once if you hear nothing. Replies are not guaranteed, but a short, personal email puts you in front of the person who decides.",
  },
  {
    q: "What should a fresher put on a resume with no experience?",
    a: "Lead with proof: your strongest project, with a link and one line on the result. Recruiters spend about 6 to 7 seconds on a first resume scan (Ladders eye-tracking study, 2018), so the best thing you have built must sit near the top. Cut generic lines like 'hardworking team player' and keep it to one page.",
  },
];

export default function FresherJobIndiaReport() {
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
        "headline": "How to Get a Job as a Fresher in India, 2026: What Works When You Have No Experience",
        "description": "How to get a job as a fresher in India: graduate unemployment data, why the application pile stalls freshers, proof of work that replaces experience, and emailing the team lead who hires.",
        "url": `${BASE_URL}/reports/how-to-get-a-job-as-a-fresher-india-2026`,
        "datePublished": "2026-10-28T00:00:00Z",
        "dateModified": "2026-10-28T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/how-to-get-a-job-as-a-fresher-india-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "How to Get a Job as a Fresher in India", "item": `${BASE_URL}/reports/how-to-get-a-job-as-a-fresher-india-2026` },
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
              <span>How to Get a Job as a Fresher in India</span>
            </nav>
            <h1>How to Get a Job as a Fresher in India, 2026: <em>What Works When You Have No Experience</em></h1>
            <p className="rpt-hero-sub">
              How to get a job as a fresher in India comes down to one shift: stop waiting
              in the application pile and reach the person who hires. Build one piece of
              proof, find the team lead, and send a short email from your own address.
              Here is the case, with the numbers.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Freshers and final-year students</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">First job, proof of work, emailing the team lead</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>The first job is the hard part. Unemployment was <strong>42.3% for graduates under 25</strong> but 4.5% for graduates aged 35 to 39 (State of Working India 2023, Azim Premji University, PLFS 2021-22 data).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Cities are the most crowded market: <strong>urban youth unemployment was 13.6% in 2025</strong>, against 9.9% for all youth aged 15 to 29 (PLFS Annual Report 2025, MoSPI).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Applying online puts you in a pile. An average opening draws <strong>about 242 applications</strong>, and a typical application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>With no experience, <strong>proof replaces history</strong>: one project, teardown or sample that shows you can do the work, tied to the company you are writing to.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Auto-apply bots and mass applications do not work. Studojo's position: <strong>email the team lead directly</strong>, with one piece of proof, from your own address, and follow up once.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">42.3%</div>
              <div className="sc-label">unemployment rate among graduates under 25 in India</div>
              <div className="sc-source">State of Working India 2023, Azim Premji University (PLFS 2021-22 data)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">13.6%</div>
              <div className="sc-label">unemployment rate among urban youth aged 15 to 29 in 2025</div>
              <div className="sc-source">PLFS Annual Report 2025, MoSPI</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~242</div>
              <div className="sc-label">applications drawn by an average job opening</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider data (reported)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">How to Get Your First Job in India: Why the First Door Is the Hardest</div>
                <div className="sec-sub">Graduate unemployment is a starting problem, not a career-long one</div>
              </div>
            </div>
            <p>India's graduate unemployment numbers look brutal until you split them by age. The State of Working India 2023 report from Azim Premji University, using PLFS 2021-22 data, put unemployment at 42.3% for graduates under 25. For graduates aged 35 to 39 it was 4.5%, and for those 40 and above it was 1.6%.</p>
            <p>Read that the right way. Most graduates do find work. The wall is the first job, when you have no track record and nobody inside the company knows your name. Under-25 graduates also had about twice the unemployment rate of under-25s who stopped at higher secondary (21.4%), so the squeeze sits at the entry to the jobs graduates are aiming for.</p>
            <div className="chart-wrap">
              <div className="chart-label">Unemployment rate by education and age, % (State of Working India 2023, PLFS 2021-22 data)</div>
              <div style={{ height: 280 }}>
                <canvas id="frsAgeChart" />
              </div>
            </div>
            <div className="highlight">
              The takeaway: <strong>your degree is not the problem, the first introduction is</strong>. A fresher with no experience needs one person at the company to look at their work once. The rest of this report is built around making that happen.
            </div>
            <p>For what entry-level roles and pay look like across India, see our <Link to="/reports/first-job-india-2026">First Job Report India 2026</Link>. This report is about how to get through the door.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Fresher Job Search in India: Where the Hours Actually Go</div>
                <div className="sec-sub">Most freshers apply, wait, and apply again</div>
              </div>
            </div>
            <p>Ask how people look for work in India and the answer is mostly the same: apply. In the PLFS Annual Report 2025 (MoSPI), unemployed people said their main search effort was applying to employers or answering job ads, followed by asking relatives and friends.</p>
            <p>Applying is not wrong. Listings on Naukri, LinkedIn, Indeed, Internshala and foundit tell you who is hiring and for what. The problem is what happens after you click. An average opening draws about 242 applications, and a typical online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026, citing Business Insider data for the 242 figure). When a recruiter does open your resume, the first scan lasts about 6 to 7 seconds (Ladders eye-tracking study, 2018).</p>
            <div className="chart-wrap">
              <div className="chart-label">Youth (15 to 29) unemployment rate in India, %, 2024 vs 2025 (PLFS Annual Report 2025, MoSPI)</div>
              <div style={{ height: 260 }}>
                <canvas id="frsYouthChart" />
              </div>
            </div>
            <p>The numbers are improving slowly, but urban youth unemployment is still 13.6%. If you are hunting in a city, you are in the most crowded part of the market, and the pile for each opening is deepest there.</p>
            <div className="callout">
              <strong>Do not hand this to a bot.</strong> Auto-apply tools and AI job hunters that mass-apply make the pile bigger and your odds worse. Recruiters catch bot applications by planting hidden instructions in job posts and by spotting one person applying to dozens of roles at the same company (NBC News, November 2024). LinkedIn's terms ban bots and automation tools. Mass applying does not work. Write to one person instead.
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">How to Get a Job as a Fresher With No Experience: Swap History for Proof</div>
                <div className="sec-sub">One piece of finished work beats a page of adjectives</div>
              </div>
            </div>
            <p>Recruiters ask for experience because they want evidence you can do the work. You can give them evidence without a job. Build one small, specific piece of proof that relates to the company you are writing to, then put it at the top of your resume and in the first lines of your email.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Proof that works</th>
                  <th>Send it to</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Software / SDE</strong></td>
                  <td>A deployed project or a repo with a clear README and one feature you shipped end to end</td>
                  <td>Engineering manager or tech lead</td>
                </tr>
                <tr>
                  <td><strong>Data and analytics</strong></td>
                  <td>A short analysis of a public dataset close to their business, with one chart and one finding</td>
                  <td>Analytics or data lead</td>
                </tr>
                <tr>
                  <td><strong>Marketing</strong></td>
                  <td>A teardown of their landing page or Instagram with three specific fixes</td>
                  <td>Marketing or growth lead</td>
                </tr>
                <tr>
                  <td><strong>Design</strong></td>
                  <td>A redesign of one real screen from their product, with your reasoning</td>
                  <td>Design lead</td>
                </tr>
                <tr>
                  <td><strong>Sales and BD</strong></td>
                  <td>A list of 20 prospects that fit their product, with one line on why each fits</td>
                  <td>Sales manager or founder</td>
                </tr>
                <tr>
                  <td><strong>Finance</strong></td>
                  <td>A one-page note on a listed company in their sector: results, risks, one view</td>
                  <td>Finance manager or team lead</td>
                </tr>
              </tbody>
            </table>
            <p>Keep it small. A focused piece you finished in a weekend says more than a big project you abandoned. For more on what counts as proof, see <Link to="/reports/proof-of-work-report-projects-github-portfolio-2026">The Proof-of-Work Report</Link>.</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Jobs for Freshers 2026: Every Route, Compared</div>
                <div className="sec-sub">Who actually reads you on each route</div>
              </div>
            </div>
            <p>Every route to a first job ends with a person deciding. The question is how many filters stand between you and that person.</p>
            <div className="chart-wrap">
              <div className="chart-label">Chance a person who decides sees your work, by route (Studojo editorial rating, 1-5)</div>
              <div style={{ height: 300 }}>
                <canvas id="frsRouteChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Who reads you first</th>
                  <th>Effort</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Campus placement</strong></td>
                  <td>Placement cell, then a company panel</td>
                  <td>Low, if your college runs strong drives</td>
                  <td><span className="tag-pill pill-amber">Situational</span> Use it if you have it</td>
                </tr>
                <tr>
                  <td><strong>Portal applications</strong></td>
                  <td>An applicant tracking system, then a recruiter skim</td>
                  <td>Low per application, high in total</td>
                  <td><span className="tag-pill pill-amber">Weak</span> One of about 242</td>
                </tr>
                <tr>
                  <td><strong>Auto-apply bots</strong></td>
                  <td>Often nobody, or a recruiter who flags it as a bot</td>
                  <td>Low, but it costs your reputation</td>
                  <td><span className="tag-pill pill-red">Skip</span> Mass applying does not work</td>
                </tr>
                <tr>
                  <td><strong>Referral</strong></td>
                  <td>A colleague, then the hiring manager</td>
                  <td>Depends on who you know</td>
                  <td><span className="tag-pill pill-blue">Strong</span> If you have one</td>
                </tr>
                <tr>
                  <td><strong>Email to the team lead</strong></td>
                  <td>The person who decides</td>
                  <td>About an hour of focused work per company</td>
                  <td><span className="tag-pill pill-green">Strongest</span> Reaches a human directly</td>
                </tr>
              </tbody>
            </table>
            <p>If your college runs strong drives, use them. Many colleges do not, and even good drives may not cover your branch or the role you want. For the off-campus channels in detail, see <Link to="/reports/off-campus-placement-report-india-2026">The Off-Campus Placement Report India 2026</Link>.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Five-Line Email That Gets a Fresher Read</div>
                <div className="sec-sub">Short, specific, from your own address</div>
              </div>
            </div>
            <p>The team lead does not need your life story. They need to know, in under a minute, that you understand their work and can do some of it.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>1. A subject line about them.</strong> Name their product, feature or recent post, not "Application for fresher role".</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>2. Why them.</strong> One line on something specific their team built or shipped.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>3. Your proof.</strong> One line and one link: the project, teardown or analysis from section 3.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>4. What you want.</strong> The role, your degree and year, and when you can start.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>5. An easy ask.</strong> A 15-minute call, or a pointer to the right opening.</span></div>
            </div>
            <div className="highlight">
              Subject: Your [feature] and a small idea<br />
              Hi [first name], I saw [specific thing their team shipped] and tried it myself.<br />
              I built [one-line proof, with link] that [what it shows].<br />
              I am a [degree, year] fresher looking for a [role] role on your team.<br />
              Would you be open to a 15-minute call, or should I apply to a specific opening?<br />
              [Your name] · [resume link]
            </div>
            <div className="pull-quote">
              <p>"If your email could be sent to any company, it is not ready."</p>
              <span className="pq-source">The Studojo rule for every first email</span>
            </div>
            <p>Follow up once, politely, after about a week if you hear nothing. Then move on to the next team lead. Replies are not guaranteed, so you write to more than one company, but every email is written for one person.</p>
            <p>We built Studojo to do exactly this. It finds the person who can actually hire you (the hiring manager or team lead, not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail. So far, 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026).</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The fresher job questions asked most in India, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to spend your first-job hours</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The first door is the hard one. Spend your effort where a person will see it:</p>
            <div className="blist">
              {[
                ["Build one proof", "A small, finished piece of work tied to the company beats a list of skills."],
                ["Use portals to find, not to wait", "Listings tell you who is hiring. They do not get you read."],
                ["Skip the bots", "Auto-apply and mass applications make the pile bigger and your odds worse."],
                ["Email the team lead", "Five lines, one proof, your own address, one polite follow-up."],
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
              <Link to="/reports/how-to-get-a-job-2026" className="related-card">
                <div className="rc-kicker">Job search</div>
                <div className="rc-title">How to Get a Job in 2026: Every Route Compared, and the One That Skips the Queue</div>
              </Link>
              <Link to="/reports/how-to-get-a-job-in-bangalore-fresher-2026" className="related-card">
                <div className="rc-kicker">Bangalore</div>
                <div className="rc-title">How to Get a Job in Bangalore as a Fresher, 2026: Where the Hiring Is and Who Decides</div>
              </Link>
              <Link to="/reports/off-campus-placement-report-india-2026" className="related-card">
                <div className="rc-kicker">Off campus</div>
                <div className="rc-title">The Off-Campus Placement Report India 2026: How Freshers Get Hired Without Campus</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Skip the pile. Write to the team lead.</h3>
              <p>Studojo finds the person who can actually hire you, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/b2cnew/join?via=report-how-to-get-a-job-as-a-fresher-india-2026&how=voice" reloadDocument className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
