import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "AI Job Search in India 2026: What Helps Freshers, and What Wastes Their Name | Studojo" },
    { name: "description", content: "AI job search in India, 2026: where AI tools help freshers (resumes, finding openings), why bot mass-applying backfires, and the move that works instead." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "AI job search India, AI job search tools India, best AI for job search India, AI job apply India, AI job portal India, AI for freshers job search, AI job search app India" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/ai-job-search-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "AI Job Search in India 2026: What Helps Freshers, and What Wastes Their Name" },
    { property: "og:description", content: "Where AI genuinely helps Indian freshers, why letting a bot mass-apply in your name backfires, and the direct email that works instead." },
    { property: "og:url", content: `${BASE_URL}/reports/ai-job-search-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-27T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "AI Job Search in India 2026 | Studojo" },
    { name: "twitter:description", content: "Use AI to write and to find openings. Never let a bot apply in your name. Email the person who hires instead." },
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

  // Chart 1: where AI earns its place in a fresher's job search (editorial rating)
  const useEl = document.getElementById("ajsUseChart") as HTMLCanvasElement | null;
  if (useEl && !useEl.dataset.rendered) {
    useEl.dataset.rendered = "1";
    new Chart(useEl, {
      type: "bar",
      data: {
        labels: [
          "Tailoring a resume to one job post",
          "Fixing resume wording",
          "Finding companies and openings",
          "Researching a team before you write",
          "Interview practice",
          "Mass applying through a bot",
        ],
        datasets: [{
          label: "How useful (1-5)",
          data: [5, 4, 4, 4, 3, 1],
          backgroundColor: [VIOLET, VIOLET2, VIOLET2, VIOLET2, VIOLET3, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Useful: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: 500 applications at the cited 0.1% to 2% success range (arithmetic)
  const mathEl = document.getElementById("ajsMathChart") as HTMLCanvasElement | null;
  if (mathEl && !mathEl.dataset.rendered) {
    mathEl.dataset.rendered = "1";
    new Chart(mathEl, {
      type: "bar",
      data: {
        labels: ["At 0.1% (low end)", "At 1% (middle)", "At 2% (high end)"],
        datasets: [{
          label: "Expected successes from 500 applications",
          data: [0.5, 5, 10],
          backgroundColor: [RED, ORANGE, GREEN],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} of 500 (arithmetic, not a forecast)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 12, ticks: { font: { size: 12 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: which door works, by employer type in India (editorial rating)
  const doorEl = document.getElementById("ajsDoorChart") as HTMLCanvasElement | null;
  if (doorEl && !doorEl.dataset.rendered) {
    doorEl.dataset.rendered = "1";
    new Chart(doorEl, {
      type: "bar",
      data: {
        labels: ["Large IT services firms", "Mid-size companies", "Funded startups", "Early-stage startups"],
        datasets: [
          {
            label: "Official drive or portal",
            data: [5, 3, 2, 1],
            backgroundColor: VIOLET3,
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            label: "Email to the hiring manager or team lead",
            data: [2, 4, 5, 5],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}/5` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 12 }, color: MUTED } },
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
    q: "What is the best AI for job search in India?",
    a: "There is no single best tool, because a job search has several different jobs in it. Any good AI assistant can help you tighten resume lines and research companies. For the step that matters most, reaching the hiring manager or team lead directly, we built Studojo: it finds the right person, verifies their email and sends a personal email from your own Gmail.",
  },
  {
    q: "Is it safe to use AI auto-apply tools for jobs in India?",
    a: "We do not recommend it. The success rate of a single online application is cited at roughly 0.1% to 2% (The Interview Guys, 2026), and recruiters spot bot patterns such as one person applying to dozens of roles at the same company (NBC News, 2024). LinkedIn's terms also ban bots and automation tools, so automating your applications puts your account at risk as well as your name.",
  },
  {
    q: "Can AI help freshers find jobs in India?",
    a: "Yes, for finding and for writing. AI is good at surfacing companies and openings you had not heard of, and at tailoring your resume to one job post at a time. Check that every listing is real and every line on your resume is true before you use it.",
  },
  {
    q: "Can recruiters tell if a bot applied for me?",
    a: "Often, yes. Recruiters plant hidden instructions in job posts, such as asking applicants to include an odd word, and they watch for one name applying to dozens of roles at the same company (NBC News, November 2024). A bot that skims the post can miss the test, and it fails that test in your name.",
  },
  {
    q: "Should I pay for an AI job apply app?",
    a: "Not for one that mass-applies. Reviewers of LazyApply on Trustpilot report irrelevant jobs, wrong locations, and billing and refund complaints, and more volume does not fix a low success rate. If you spend money, spend it on reaching the person who hires: Studojo writes a personal email to the hiring manager and sends it from your own Gmail.",
  },
  {
    q: "What is the best way for a fresher to get a startup job in India?",
    a: "Email the hiring manager or team lead directly. Startups and mid-size companies hire in small numbers and the team lead often decides, so a short, specific email from your own address with one proof point reaches the decision maker in a way a portal cannot. Follow up once about a week later, and remember that replies are not guaranteed.",
  },
];

export default function AiJobSearchIndiaReport() {
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
        "headline": "AI Job Search in India 2026: What Helps Freshers, and What Wastes Their Name",
        "description": "Where AI tools genuinely help Indian freshers in the job search, why bot mass-applying backfires, and why emailing the hiring manager directly works better.",
        "url": `${BASE_URL}/reports/ai-job-search-india-2026`,
        "datePublished": "2026-10-27T00:00:00Z",
        "dateModified": "2026-10-27T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/ai-job-search-india-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "AI Job Search in India 2026", "item": `${BASE_URL}/reports/ai-job-search-india-2026` },
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
              <span>AI Job Search in India 2026</span>
            </nav>
            <h1>AI Job Search in India 2026: <em>What Helps Freshers, and What Wastes Their Name</em></h1>
            <p className="rpt-hero-sub">
              Use AI to write a sharper resume and to find openings you would have missed.
              Do not let it apply to hundreds of jobs in your name. This report sorts the
              useful from the harmful, with the India specifics: off-campus season, service
              companies versus startups, and what it costs in rupees.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Freshers and final-year students</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">AI tools, auto-apply, direct email</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>AI is genuinely useful for <strong>writing and research</strong>: tightening resume lines, tailoring to one job post, and finding companies and openings you would have missed.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>AI that <strong>applies for you is a different thing</strong>. A single online application is cited at roughly 0.1% to 2% success, and a bot multiplies volume, not quality.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Recruiters <strong>spot bot patterns</strong>: hidden instructions planted in job posts, and one name applying to dozens of roles at the same company (NBC News, 2024). That is how a bot wastes your name.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>In India the door depends on the employer: <strong>large IT services firms</strong> hire freshers through their own drives, while at <strong>startups and mid-size companies</strong> the team lead often decides.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The move that works: a <strong>short, personal email to the hiring manager or team lead</strong>, from your own email address, with one follow-up. We built Studojo to do exactly that from your Gmail.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">58%</div>
              <div className="sc-label">of job seekers use AI in their search</div>
              <div className="sc-source">Capterra, cited by NBC News, Nov 2024 (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">0.1% to 2%</div>
              <div className="sc-label">typical success rate cited for a single online application</div>
              <div className="sc-source">The Interview Guys, April 2026 (reported)</div>
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
                <div className="sec-title">Three Jobs Freshers Hand to AI</div>
                <div className="sec-sub">Writing, finding and applying carry very different risks</div>
              </div>
            </div>
            <p>Most fresher job hunts that use AI give it three jobs. It rewrites the resume. It finds openings. And, more and more, it applies on your behalf.</p>
            <p>Using AI is now normal. NBC News (November 2024) cited a Capterra figure that 58% of job seekers use AI in their search, and a Huntr vendor survey (Q3 2025, 527 people) put it at 85.6%. Using AI is no longer an edge by itself. The edge is in what you use it for.</p>
            <p>The first two jobs make you sharper. The third one speaks for you, at scale, to people you have never met, about roles you never read. That is where the trouble starts.</p>
            <div className="highlight">
              The rule of this report: <strong>let AI help you write and find. Never let it speak for you at scale.</strong> Your name goes on every application a bot sends, and the people reading them notice patterns.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Where AI Actually Helps</div>
                <div className="sec-sub">Writing help and finding openings are fair game</div>
              </div>
            </div>
            <p>Recruiters spend about 6 to 7 seconds on a first resume scan (Ladders eye-tracking study, 2018). AI is good at turning a bloated line into a sharp one, and at matching your words to the words in a job post. It is bad at telling the truth for you. Check every line, and delete any skill or number it made up.</p>
            <p>Finding is the other strong use. Ask an AI assistant which startups in your city are building in your field, what a team ships, or who leads it, and you get a shortlist in minutes that would take an afternoon by hand. Then verify it. Some listings are stale and some are not real.</p>
            <div className="chart-wrap">
              <div className="chart-label">Where AI earns its place in a fresher's job search (Studojo editorial rating, 1 to 5)</div>
              <div style={{ height: 300 }}>
                <canvas id="ajsUseChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>What AI does well</th>
                  <th>The catch</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Tailoring to one job post</strong></td>
                  <td>Matches your words to the post's words</td>
                  <td>Only works one job at a time</td>
                  <td><span className="tag-pill pill-green">Use</span></td>
                </tr>
                <tr>
                  <td><strong>Resume wording</strong></td>
                  <td>Cuts filler, sharpens bullet points</td>
                  <td>Invents skills if you let it</td>
                  <td><span className="tag-pill pill-green">Use</span> Then check</td>
                </tr>
                <tr>
                  <td><strong>Finding openings</strong></td>
                  <td>Surfaces startups and teams you had not heard of</td>
                  <td>Some listings are stale or fake</td>
                  <td><span className="tag-pill pill-blue">Check</span> Verify first</td>
                </tr>
                <tr>
                  <td><strong>Interview practice</strong></td>
                  <td>Asks likely questions, critiques answers</td>
                  <td>Generic if you give it no context</td>
                  <td><span className="tag-pill pill-green">Use</span></td>
                </tr>
                <tr>
                  <td><strong>Mass applying through a bot</strong></td>
                  <td>Sends hundreds of applications fast</td>
                  <td>Irrelevant roles, your name on every one</td>
                  <td><span className="tag-pill pill-red">Skip</span></td>
                </tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>A note on the ATS myth:</strong> you will see the claim that 75% of resumes are rejected by software before a human looks. It has no traceable source. Treat it as a myth, and do not pay anyone to "beat the ATS" because of it.
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Where It Goes Wrong: Bots That Apply in Your Name</div>
                <div className="sec-sub">Volume is not a strategy when every send carries your name</div>
              </div>
            </div>
            <p>Auto-apply tools such as LazyApply, AIApply and JobCopilot advertise applying to jobs on your behalf. The pitch sounds logical: if every application is a lottery ticket, buy more tickets.</p>
            <p>The numbers do not back the pitch. The Interview Guys (April 2026) cite a typical success rate of roughly 0.1% to 2% per online application, report one auto-apply account of about 5 interviews from thousands of applications (about 0.1%), and note that an average opening draws about 242 applications, citing Business Insider data. The same article reports that one bulk-apply service shut its bulk-send feature in August 2025, at roughly one interview per fifty sends.</p>
            <div className="chart-wrap">
              <div className="chart-label">500 portal applications at the cited 0.1% to 2% success range (illustrative arithmetic)</div>
              <div style={{ height: 260 }}>
                <canvas id="ajsMathChart" />
              </div>
            </div>
            <p>Then there is your name. Recruiters catch bot applications by planting hidden instructions in job posts, such as asking applicants to include an odd word, and by noticing one person applying to dozens of roles at the same company (NBC News, 17 November 2024, quoting recruiter Mike Peditto). LinkedIn's terms ban bots and automation tools. Reviewers of LazyApply on Trustpilot report irrelevant jobs, wrong locations, billing and refund complaints, subscriptions renewing without notice and emails landing in spam.</p>
            <div className="callout">
              <strong>Why this hits freshers harder:</strong> if you are targeting startups in one city and one field, the same founders and team leads see your name again and again. Fifty mismatched applications from one name is a pattern, and it can be the first thing they know about you.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">The India Picture: Off-Campus Season, Service Companies and Startups</div>
                <div className="sec-sub">Different employers, different doors</div>
              </div>
            </div>
            <p>Once campus drives thin out, the off-campus months begin. No placement cell, no schedule, just portals and a feeling that the window is closing. This is exactly when handing everything to a bot looks tempting.</p>
            <p>But Indian employers do not all hire the same way. Large IT services firms hire freshers in volume through their own drives, registrations and hiring tests. There, the official route is the route, and a bot adds nothing but risk. Startups and mid-size companies usually hire one or two people at a time, and the person who decides is often the team lead or a founder, not a central HR team.</p>
            <div className="chart-wrap">
              <div className="chart-label">Which door works, by employer type in India (Studojo editorial rating, 1 to 5)</div>
              <div style={{ height: 280 }}>
                <canvas id="ajsDoorChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Large IT services firms.</strong> Register for the official drive, prepare for the test, and apply where they tell you to. No shortcut beats their process.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Mid-size companies.</strong> Apply if there is a posting, then email the team lead who owns the role with one line of proof.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Startups.</strong> Email the hiring manager, team lead or founder directly. At a small team, a role can be filled before a post ever goes up.</span></div>
            </div>
            <p>Then there is the cost. Auto-apply tools charge subscriptions. At the far end, reverse recruiters (people hired to job hunt for you) are reported to charge about $1,500 a month, well over ₹1 lakh, plus about 10% of first-year salary (Fortune, 25 March 2026). On a ₹6 LPA fresher offer, that 10% alone is ₹60,000.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Move That Works in India: Email the Person Who Hires</div>
                <div className="sec-sub">Hiring manager or team lead, from your own email, one follow-up</div>
              </div>
            </div>
            <p>Studojo's position is simple. Skip the bot. Find the hiring manager or team lead at a startup or mid-size company, and send one short, personal, specific email from your own email address. Follow up once.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Pick the person, not the inbox.</strong> The team lead for the work you want, not a generic HR address or a careers inbox.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Lead with proof.</strong> One project, one number, one link. Show you can do the work before you ask for it.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Keep it short.</strong> Five lines that fit on a phone screen. A team lead often reads email between meetings.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Use AI as a writing partner, not a sender.</strong> Draft with it, then make every line yours and true.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Follow up once.</strong> About a week later, in the same thread. Then move on to the next person.</span></div>
            </div>
            <div className="pull-quote">
              <p>"Use AI to make your email sharper. Never use it to make your emails more numerous."</p>
              <span className="pq-source">The Studojo rule for AI in the job search</span>
            </div>
            <p>We built Studojo to do exactly this. It finds the person who can actually hire you (the hiring manager or team lead, not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail.</p>
            <div className="highlight">
              <strong>8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail</strong> (Studojo's own records, September 2026). Replies are not guaranteed. The email still has to be worth answering, and that is the part we help you get right.
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">What freshers in India ask most about AI and the job search</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to use AI without spending your name</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Give AI the jobs it is good at, and keep the one that carries your name:</p>
            <div className="blist">
              {[
                ["Write with AI", "Resume lines and one job post at a time, checked by you before anything goes out."],
                ["Find with AI", "Companies, teams and openings, then verify each one is real and current."],
                ["Never apply with a bot", "Every application it sends carries your name, and recruiters spot the pattern."],
                ["Email the person", "The hiring manager or team lead, short and specific, one follow-up. Studojo does it from your Gmail."],
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
              <Link to="/reports/mail-to-hr-for-job-india-2026" className="related-card">
                <div className="rc-kicker">Emailing</div>
                <div className="rc-title">Mail to HR for Job: The India Report</div>
              </Link>
              <Link to="/reports/ai-job-agent-report-2026" className="related-card">
                <div className="rc-kicker">AI agents</div>
                <div className="rc-title">The AI Job Agent Report 2026</div>
              </Link>
              <Link to="/reports/off-campus-placement-report-india-2026" className="related-card">
                <div className="rc-kicker">Off-campus</div>
                <div className="rc-title">The Off-Campus Placement Report India 2026</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Skip the bot. Email the person who hires.</h3>
              <p>Studojo finds the hiring manager or team lead, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
