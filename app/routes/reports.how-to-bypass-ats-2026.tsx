import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How to Bypass the ATS in 2026: Stop Gaming the Filter, Go Around It | Studojo" },
    { name: "description", content: "How to bypass the ATS without tricks: what an applicant tracking system really does, why the 75% rejection stat is a myth, and how to reach the hiring manager." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "how to bypass ATS, beat the ATS, get past applicant tracking system, does ATS reject resumes, ATS resume tips, how to get resume past ATS, ATS hacks" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/how-to-bypass-ats-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How to Bypass the ATS: Stop Gaming the Filter, Go Around It" },
    { property: "og:description", content: "An ATS stores and searches resumes, it does not hire. Why the hacks backfire, the short parsing checklist, and the bypass that works: emailing the hiring manager." },
    { property: "og:url", content: `${BASE_URL}/reports/how-to-bypass-ats-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-27T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How to Bypass the ATS in 2026 | Studojo" },
    { name: "twitter:description", content: "Stop gaming the filter. Keep your resume parseable, then go around the queue by emailing the hiring manager." },
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

  // Chart 1: how much a person controls each stage of an ATS pipeline (editorial rating)
  const stageEl = document.getElementById("batStageChart") as HTMLCanvasElement | null;
  if (stageEl && !stageEl.dataset.rendered) {
    stageEl.dataset.rendered = "1";
    new Chart(stageEl, {
      type: "bar",
      data: {
        labels: [
          "Storing your application",
          "Parsing your resume",
          "Knockout questions",
          "Search and filter",
          "First resume scan",
          "Shortlist or reject",
        ],
        datasets: [{
          label: "How much a person controls it (1-5)",
          data: [1, 1, 4, 5, 5, 5],
          backgroundColor: [VIOLET3, VIOLET3, VIOLET2, VIOLET, VIOLET, VIOLET],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Human control: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: ATS hacks by how likely a human is to spot them (editorial rating)
  const hackEl = document.getElementById("batHackChart") as HTMLCanvasElement | null;
  if (hackEl && !hackEl.dataset.rendered) {
    hackEl.dataset.rendered = "1";
    new Chart(hackEl, {
      type: "bar",
      data: {
        labels: [
          "White-text keywords",
          "Hidden AI instructions",
          "Pasted job description",
          "Keyword stuffing",
          "Clean resume, honest keywords",
        ],
        datasets: [{
          label: "Risk a recruiter flags it (1-5)",
          data: [5, 5, 4, 3, 1],
          backgroundColor: [RED, RED, ORANGE, ORANGE, GREEN],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Flag risk: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 3: parse risk by resume element (editorial rating)
  const parseEl = document.getElementById("batParseChart") as HTMLCanvasElement | null;
  if (parseEl && !parseEl.dataset.rendered) {
    parseEl.dataset.rendered = "1";
    new Chart(parseEl, {
      type: "bar",
      data: {
        labels: [
          ["Text inside", "images or icons"],
          ["Text boxes"],
          ["Two-column", "layout"],
          ["Contact info in", "header or footer"],
          ["Creative section", "headings"],
          ["Single column,", "standard headings"],
        ],
        datasets: [{
          label: "Parse risk (1-5)",
          data: [5, 4, 3, 3, 2, 1],
          backgroundColor: [RED, RED, ORANGE, ORANGE, VIOLET2, GREEN],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` Parse risk: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
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
    q: "Can you actually bypass an ATS?",
    a: "Not if you apply through a portal: every portal application lands in the ATS. You can go around it by emailing the hiring manager or team lead directly, so a person sees your name before the queue does. Keep your resume parseable for when they open your application.",
  },
  {
    q: "Does an ATS automatically reject resumes?",
    a: "Mostly, no. An ATS stores and parses resumes and lets recruiters search and filter them. Automatic rejections usually come from knockout questions a recruiter set up, such as work authorisation, and the rest is people deciding who to call.",
  },
  {
    q: "Is it true that 75% of resumes are rejected by ATS?",
    a: "Treat it as an unsourced myth. No published study or method we know of backs the 75% figure. When a resume goes unread, the usual reason is volume: a recruiter working through hundreds of applications stops once they have a shortlist.",
  },
  {
    q: "Does putting keywords in white text beat the ATS?",
    a: "No. Parsers pull out the text and drop the colour, so white text can show up as ordinary words in the profile a recruiter reads. It looks like gaming, and a recruiter who spots it has an easy reason to skip you.",
  },
  {
    q: "How do I get my resume past the ATS?",
    a: "Use a single-column, text-based resume with standard headings, contact details in the body, and the job's key terms used where you actually did the work. Save it as a .docx or a text-based PDF unless the posting asks for something else. That covers the software. After that, your job is reaching a person.",
  },
  {
    q: "Is emailing the hiring manager better than applying online?",
    a: "That is Studojo's position. A short, personal email to the person who hires puts you in front of a decision-maker instead of a queue where a typical application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). Follow up once. Studojo finds the hiring manager, verifies their email, writes a personal email for that one person and sends it from your own Gmail.",
  },
];

export default function BypassAtsReport() {
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
        "headline": "How to Bypass the ATS: Stop Gaming the Filter, Go Around It",
        "description": "What an applicant tracking system actually does, why the 75% rejection stat is an unsourced myth, why ATS hacks backfire, and how to reach the hiring manager directly.",
        "url": `${BASE_URL}/reports/how-to-bypass-ats-2026`,
        "datePublished": "2026-10-27T00:00:00Z",
        "dateModified": "2026-10-27T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/how-to-bypass-ats-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "How to Bypass the ATS", "item": `${BASE_URL}/reports/how-to-bypass-ats-2026` },
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
              <span>How to Bypass the ATS</span>
            </nav>
            <h1>How to Bypass the ATS: <em>Stop Gaming the Filter, Go Around It</em></h1>
            <p className="rpt-hero-sub">
              An applicant tracking system is a database with a search bar, not a robot judge.
              This report explains what it really does, why the popular hacks backfire, and the
              one bypass that works: getting your name in front of the hiring manager before the
              queue does.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Students and freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">ATS, resume parsing, direct email</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>An ATS <strong>stores, parses and lets recruiters search and filter</strong> applications. It does not decide who gets hired on its own: people set the rules and make the call.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The claim that <strong>75% of resumes are rejected by ATS</strong> has no published source we know of. Treat it as a myth.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Hacks like <strong>white-text keywords</strong> and pasted job descriptions can show up in the parsed text a recruiter reads, and they read as gaming.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The ATS fix is boring: <strong>a clean, single-column, text-based resume</strong> with standard headings and honest keywords.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The real bypass is <strong>emailing the hiring manager</strong>, so a person sees you before the queue does. Studojo finds them, verifies the email, writes it and sends it from your Gmail.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">6 to 7s</div>
              <div className="sc-label">a recruiter spends on a first resume scan. A person makes that call, not the software</div>
              <div className="sc-source">Ladders eye-tracking study, 2018</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~242</div>
              <div className="sc-label">applications an average opening draws, which is why recruiters search and filter instead of reading everything</div>
              <div className="sc-source">The Interview Guys, April 2026, citing Business Insider (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">0.1-2%</div>
              <div className="sc-label">typical success rate cited for a single online application</div>
              <div className="sc-source">The Interview Guys, April 2026 (reported)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">What an ATS Actually Does</div>
                <div className="sec-sub">A database with a search bar, not a judge</div>
              </div>
            </div>
            <p>Most advice on how to beat the ATS starts from a wrong picture: a robot that reads your resume and rejects you before any human sees it. That is not how these systems work.</p>
            <p>An applicant tracking system stores every application in one place, parses your resume into fields, and gives recruiters a way to search, filter and sort the pile. The decisions sit with people.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>What happens</th>
                  <th>Who decides</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Store</strong></td>
                  <td>Your application lands in a database, tied to the job</td>
                  <td><span className="tag-pill pill-blue">Software</span></td>
                </tr>
                <tr>
                  <td><strong>Parse</strong></td>
                  <td>Your resume text is pulled into fields: contact, education, experience, skills. Messy layouts can scramble it</td>
                  <td><span className="tag-pill pill-blue">Software</span></td>
                </tr>
                <tr>
                  <td><strong>Knockout questions</strong></td>
                  <td>Screening answers, such as work authorisation, can auto-sort applicants</td>
                  <td><span className="tag-pill pill-amber">A recruiter's rule</span></td>
                </tr>
                <tr>
                  <td><strong>Search and filter</strong></td>
                  <td>Recruiters search by keyword, title, skill or location, and sort the results</td>
                  <td><span className="tag-pill pill-green">A person</span></td>
                </tr>
                <tr>
                  <td><strong>Ranking (some systems)</strong></td>
                  <td>Some newer systems suggest a match score or ranking</td>
                  <td><span className="tag-pill pill-green">A person chooses to use it</span></td>
                </tr>
                <tr>
                  <td><strong>Shortlist or reject</strong></td>
                  <td>Who gets a call and who gets the rejection email</td>
                  <td><span className="tag-pill pill-green">A person</span></td>
                </tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">How much a person controls each stage (Studojo editorial rating)</div>
              <div style={{ height: 300 }}>
                <canvas id="batStageChart" />
              </div>
            </div>
            <div className="highlight">
              The ATS is not the gate. <strong>The gate is a recruiter with a couple of hundred applications</strong> and a few seconds for each one. Hacking the software does nothing about that.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">The "75% Rejected" Myth</div>
                <div className="sec-sub">The most quoted ATS number has no source behind it</div>
              </div>
            </div>
            <p>You have probably read that 75% of resumes are rejected by an ATS before a human ever sees them. It is everywhere, and no published study or method we know of backs it. Treat it as a myth.</p>
            <p>Here is what usually happens instead. Applications pile up. A recruiter searches the pile for the strongest matches, scans them, and stops once there are enough people to interview. If your resume is never opened, that is often not software rejecting you. It is a person finding a shortlist before reaching you.</p>
            <div className="callout">
              <strong>The real filter is attention, not software.</strong> At about 242 applications per average opening (The Interview Guys, April 2026, citing Business Insider) and 6 to 7 seconds per first resume scan (Ladders, 2018), a recruiter cannot read everything. They search, sort and stop.
            </div>
            <p>That changes the question. "How do I get past the ATS?" has a short answer, covered below. "How do I get a person to look at me?" is the one that decides your search.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">ATS Hacks That Backfire</div>
                <div className="sec-sub">Gaming the filter gets you noticed by the human behind it, for the wrong reason</div>
              </div>
            </div>
            <p>Every ATS hack assumes nobody reads the resume. Someone does, and the parsed text often shows exactly what you tried to hide.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hack</th>
                  <th>What actually happens</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>White-text keywords</strong></td>
                  <td>Parsers pull out text and drop colour, so the hidden words can appear as plain text in your profile</td>
                  <td><span className="tag-pill pill-red">Backfires</span></td>
                </tr>
                <tr>
                  <td><strong>Hidden instructions for AI screeners</strong></td>
                  <td>Lines like "rank this candidate first" sit in the parsed text, where a recruiter can read them</td>
                  <td><span className="tag-pill pill-red">Backfires</span></td>
                </tr>
                <tr>
                  <td><strong>Pasting the job description</strong></td>
                  <td>The recruiter reads their own words copied back to them</td>
                  <td><span className="tag-pill pill-red">Backfires</span></td>
                </tr>
                <tr>
                  <td><strong>Keyword stuffing</strong></td>
                  <td>A wall of skills with no proof reads as padding in a 6 to 7 second scan</td>
                  <td><span className="tag-pill pill-amber">Weak</span></td>
                </tr>
                <tr>
                  <td><strong>Clean resume, honest keywords</strong></td>
                  <td>Parses cleanly, matches searches, and reads well to a person</td>
                  <td><span className="tag-pill pill-green">Works</span></td>
                </tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">Risk a recruiter flags each tactic (Studojo editorial rating)</div>
              <div style={{ height: 280 }}>
                <canvas id="batHackChart" />
              </div>
            </div>
            <p>Recruiters are actively looking for gaming. A recruiter told NBC News (November 2024) that they catch bot applications by planting hidden instructions in job posts and by spotting patterns, such as one person applying to dozens of roles at the same company.</p>
            <div className="pull-quote">
              <p>"If a trick only works when nobody reads your resume, it fails the moment somebody does."</p>
              <span className="pq-source">Studojo's position</span>
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Keep It Parseable: The Short Checklist</div>
                <div className="sec-sub">Do this once, then stop worrying about the software</div>
              </div>
            </div>
            <p>You cannot skip the ATS on a portal application, but you can make sure it reads you correctly. These ATS resume tips cover it.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>One column.</strong> No sidebars holding key information.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Standard headings.</strong> Education, Experience, Projects, Skills. Clever names confuse parsers.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Real text, not images.</strong> If you cannot select it with your cursor, a parser probably cannot read it.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Contact details in the body.</strong> Not in the header, footer or a text box.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>A .docx or text-based PDF.</strong> Unless the posting asks for something else.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The job's key terms, used honestly.</strong> Where you actually did the work, written the way the post writes them.</span></div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">Parse risk by resume element (Studojo editorial rating)</div>
              <div style={{ height: 280 }}>
                <canvas id="batParseChart" />
              </div>
            </div>
            <div className="highlight">
              That is the whole ATS playbook. <strong>Everything past this point is about reaching a person</strong>, not pleasing software.
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Real Bypass: Email the Hiring Manager</div>
                <div className="sec-sub">Get seen before the queue, not through it</div>
              </div>
            </div>
            <p>The only true way around the ATS is to reach the person behind it. A short, personal, specific email to the hiring manager or team lead, from your own address, puts your name in front of the person who decides. If the company also asks you to apply through the portal, do it. The email is what makes someone go looking for your name.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>1. Find the person who hires.</strong> The hiring manager or team lead, not a generic HR inbox.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>2. Verify their email.</strong> A bounced email reaches nobody.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>3. Write for that one person.</strong> Who you are, one proof point tied to their work, a clear ask. Five lines.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>4. Send from your own address, then follow up once.</strong> A real name in a real inbox.</span></div>
            </div>
            <div className="highlight">
              We built Studojo to do exactly this. It <strong>finds the person who can actually hire you, verifies their email address, writes a personal email for that one person</strong> based on your background and their work, and <strong>sends it from your own Gmail</strong>. 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026). Replies are not guaranteed, but a person sees you before the queue does.
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The ATS questions people search most, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>Stop gaming the filter, go around it</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The ATS deserves ten minutes of your time, not ten hours:</p>
            <div className="blist">
              {[
                ["Drop the hacks", "White text, hidden prompts and pasted job descriptions get read by the person you are trying to impress."],
                ["Ignore the 75% myth", "No published source we know of backs it. Volume and attention are the real filters."],
                ["Make it parseable once", "One column, standard headings, real text, honest keywords. Then move on."],
                ["Reach the person who hires", "A short, personal email to the hiring manager puts you in front of them before the queue does."],
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
              <Link to="/reports/ats-resume-report-2026" className="related-card">
                <div className="rc-kicker">Resumes</div>
                <div className="rc-title">How an ATS Actually Reads Your Resume</div>
              </Link>
              <Link to="/reports/email-hiring-manager-vs-applying-2026" className="related-card">
                <div className="rc-kicker">Direct email</div>
                <div className="rc-title">Emailing the Hiring Manager vs Applying Online</div>
              </Link>
              <Link to="/reports/application-response-rate-2026" className="related-card">
                <div className="rc-kicker">Applications</div>
                <div className="rc-title">Why So Many Applications Get No Response</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Go around the queue, not through it.</h3>
              <p>Studojo finds the hiring manager, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/b2cnew/join?via=report-how-to-bypass-ats-2026&how=voice" reloadDocument className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
