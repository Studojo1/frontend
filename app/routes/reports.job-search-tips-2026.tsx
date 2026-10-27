import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Job Search Tips, Rated: 15 Common Tips and What the Evidence Says | Studojo" },
    { name: "description", content: "Job search tips, rated by evidence: 15 common tips from apply early to keyword stuffing, the facts behind each, and the one tip that rates highest." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "job search tips, job hunting tips, job search tips 2026, job search tips for freshers, job search advice, tips to get a job" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/job-search-tips-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Job Search Tips, Rated: 15 Common Tips and What the Evidence Says" },
    { property: "og:description", content: "We rated the 15 most repeated job search tips by the evidence behind them. Volume tips score lowest. Reaching the person who hires scores highest." },
    { property: "og:url", content: `${BASE_URL}/reports/job-search-tips-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-28T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Job Search Tips, Rated | Studojo" },
    { name: "twitter:description", content: "15 common job search tips, rated by evidence. Which to keep, which to fix and which to drop." },
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

  // Chart 1: where the evidence for the 15 tips comes from (Studojo count)
  const evEl = document.getElementById("jstEvidenceChart") as HTMLCanvasElement | null;
  if (evEl && !evEl.dataset.rendered) {
    evEl.dataset.rendered = "1";
    new Chart(evEl, {
      type: "doughnut",
      data: {
        labels: ["Backed by cited data", "Recruiter reports", "Logic, little hard data", "Unsourced myth"],
        datasets: [{
          data: [6, 1, 7, 1],
          backgroundColor: [GREEN, VIOLET2, ORANGE, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} of 15 tips` } },
        },
      },
    });
  }

  // Chart 2: all 15 tips rated (editorial rating)
  const rateEl = document.getElementById("jstRatingChart") as HTMLCanvasElement | null;
  if (rateEl && !rateEl.dataset.rendered) {
    rateEl.dataset.rendered = "1";
    new Chart(rateEl, {
      type: "bar",
      data: {
        labels: [
          "Email the hiring manager",
          "Ask for a referral",
          "Follow up once",
          "Tailor your resume",
          "Check the job is real",
          "Apply early",
          "One-page resume",
          "Polish your LinkedIn",
          "Always write a cover letter",
          "Let AI write it",
          "Job alerts everywhere",
          "Apply to everything",
          "Easy Apply for speed",
          "Keyword stuffing",
          "Auto-apply bot",
        ],
        datasets: [{
          label: "Editorial rating (1-5)",
          data: [5, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1],
          backgroundColor: [
            VIOLET, VIOLET2, VIOLET2, VIOLET2,
            VIOLET3, VIOLET3, VIOLET3, VIOLET3,
            ORANGE, ORANGE, ORANGE,
            RED, RED, RED, RED,
          ],
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
          tooltip: { callbacks: { label: (ctx: any) => ` Editorial rating: ${ctx.raw}/5` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 3: a suggested 10-hour job search week (editorial)
  const weekEl = document.getElementById("jstWeekChart") as HTMLCanvasElement | null;
  if (weekEl && !weekEl.dataset.rendered) {
    weekEl.dataset.rendered = "1";
    new Chart(weekEl, {
      type: "doughnut",
      data: {
        labels: ["Emailing hiring managers", "Asking for referrals", "Tailoring your resume", "Following up", "Portal applications"],
        datasets: [{
          data: [4, 2, 2, 1, 1],
          backgroundColor: [VIOLET, VIOLET2, VIOLET3, GREEN, ORANGE],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} of 10 hours (suggested)` } },
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
    q: "What are the best job search tips in 2026?",
    a: "The three that rate highest in our review are: email the hiring manager directly, ask for a referral, and follow up once. All three reach a person instead of a pile. Everything else, from tailoring your resume to polishing your LinkedIn profile, is support for those three.",
  },
  {
    q: "What are the best job search tips for freshers?",
    a: "Sit every campus drive you qualify for, then email hiring managers at smaller companies and startups, where one person often reads the inbox. Lead with one real project and its result, keep your resume to one page, and follow up once. Skip mass applying, because a fresher's resume rarely stands out in a pile of about 242 (The Interview Guys, April 2026, citing Business Insider data).",
  },
  {
    q: "Does applying early to a job really help?",
    a: "Probably a little. Piles grow over time, so an early application faces fewer rivals when it is read, but the most quoted data on this is old and secondhand, so we rate it 3 out of 5. Never rush a generic application just to be first.",
  },
  {
    q: "Should I stuff my resume with keywords to beat the ATS?",
    a: "No. The claim that 75% of resumes are rejected by ATS is an unsourced myth, and a person still makes the call after a first scan of about 6 to 7 seconds (Ladders eye-tracking study, 2018). Use the job's own words where they are true of you, and write for the human reading it.",
  },
  {
    q: "What is the most useful job search advice?",
    a: "Stop treating the search as a numbers game. A typical online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026), so we would rather you send ten specific emails to the people who hire than a hundred applications. Studojo does that for you: it finds the person, verifies their email, writes the email and sends it from your own Gmail.",
  },
  {
    q: "Are auto-apply tools a good way to get a job?",
    a: "No, they rate lowest of all 15 tips. Recruiters catch bot applications with hidden instructions planted in job posts and by spotting one person applying to dozens of roles at the same company (NBC News, November 2024), and LinkedIn's terms ban bots and automation tools. Spend that time emailing the person who hires instead.",
  },
];

const TIPS = [
  { tip: "Email the hiring manager directly", verdict: "Do this first", evidence: "About 242 applications per opening and a 0.1% to 2% success rate per application (The Interview Guys, 2026). A direct email skips that queue.", rating: 5, pill: "pill-green" },
  { tip: "Ask for a referral", verdict: "Do it whenever you can", evidence: "Referrals were 2% of applicants but 11% of hires (CareerPlug, 2025, vendor report).", rating: 4, pill: "pill-green" },
  { tip: "Follow up once", verdict: "Yes, once, about a week later", evidence: "Little hard data. Our position: one short follow-up helps, more reads as pressure.", rating: 4, pill: "pill-green" },
  { tip: "Tailor your resume to each role", verdict: "Yes, the top third most of all", evidence: "Recruiters spend about 6 to 7 seconds on a first scan (Ladders, 2018), so the top has to match the role.", rating: 4, pill: "pill-green" },
  { tip: "Check the job is real before applying", verdict: "Worth a minute", evidence: "39% of 649 US hiring managers said their company had posted fake or ghost listings (ResumeBuilder, 2024, vendor survey).", rating: 3, pill: "pill-blue" },
  { tip: "Apply early", verdict: "Helps a little, never at the cost of quality", evidence: "Logical, because piles grow. The most quoted data is old and secondhand, so we leave its numbers out.", rating: 3, pill: "pill-blue" },
  { tip: "Keep your resume to one page", verdict: "Sensible for freshers", evidence: "Convention, plus the 6 to 7 second scan. No study we trust shows page count alone decides.", rating: 3, pill: "pill-blue" },
  { tip: "Polish your LinkedIn profile", verdict: "Do it once, then move on", evidence: "Logic: people you email may look you up. A clean profile supports outreach, it does not replace it.", rating: 3, pill: "pill-blue" },
  { tip: "Always write a cover letter", verdict: "Only when asked, or when a person reads it", evidence: "Logic and recruiter habit. A generic letter adds little.", rating: 2, pill: "pill-amber" },
  { tip: "Let AI write your applications", verdict: "Draft with it, never send it untouched", evidence: "Recruiters spot bot patterns (NBC News, 2024). AI text is everywhere, so untouched drafts blend in.", rating: 2, pill: "pill-amber" },
  { tip: "Set job alerts on every portal", verdict: "Fine for finding roles, not for getting read", evidence: "Logic: alerts get you to the same pile faster.", rating: 2, pill: "pill-amber" },
  { tip: "Apply to as many jobs as you can", verdict: "Drop it", evidence: "At 0.1% to 2% per application (The Interview Guys, 2026), volume is a slow plan.", rating: 1, pill: "pill-red" },
  { tip: "Use Easy Apply to apply faster", verdict: "Drop it as a strategy", evidence: "Logic: the easier it is to apply, the bigger the pile.", rating: 1, pill: "pill-red" },
  { tip: "Stuff your resume with keywords", verdict: "Drop it", evidence: "The \"75% of resumes are rejected by ATS\" line is an unsourced myth.", rating: 1, pill: "pill-red" },
  { tip: "Use an auto-apply bot", verdict: "Avoid", evidence: "One account reported about 5 interviews from thousands of applications (The Interview Guys, 2026). Recruiters plant hidden instructions to catch bots (NBC News, 2024).", rating: 1, pill: "pill-red" },
];

export default function JobSearchTipsReport() {
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
        "headline": "Job Search Tips, Rated: 15 Common Tips and What the Evidence Says",
        "description": "The 15 most repeated job search tips, rated by the evidence behind them, from apply early and tailoring to Easy Apply, keyword stuffing and emailing the hiring manager.",
        "url": `${BASE_URL}/reports/job-search-tips-2026`,
        "datePublished": "2026-10-28T00:00:00Z",
        "dateModified": "2026-10-28T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/job-search-tips-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Job Search Tips 2026", "item": `${BASE_URL}/reports/job-search-tips-2026` },
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
              <span>Job Search Tips 2026</span>
            </nav>
            <h1>Job Search Tips, Rated: <em>15 Common Tips and What the Evidence Says</em></h1>
            <p className="rpt-hero-sub">
              Most job search tips get repeated because they sound right, not because anyone
              checked. We rated the 15 most common ones by the evidence behind them. The winner
              is the tip most lists bury: reach the person who hires.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Freshers and early career</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">15 tips, rated by evidence</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>The highest rated tip is <strong>emailing the hiring manager directly</strong>, followed by asking for a referral and following up once. All three reach a person.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Volume tips score lowest. A typical online application succeeds <strong>roughly 0.1% to 2% of the time</strong> (The Interview Guys, April 2026), so more of them is a weak plan.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The most repeated unsourced claim is <strong>"75% of resumes are rejected by ATS"</strong>. Keyword stuffing fixes a problem that is mostly a fast human skim.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Auto-apply bots rate worst: one account reported <strong>about 5 interviews from thousands of applications</strong>, and recruiters plant hidden instructions to catch bots (NBC News, 2024).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Several tips are <strong>half right</strong>: applying early, cover letters and AI drafting help in the right place and hurt when done generically.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">6 to 7s</div>
              <div className="sc-label">is about how long a recruiter spends on a first resume scan</div>
              <div className="sc-source">Ladders eye-tracking study, 2018 (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">39%</div>
              <div className="sc-label">of 649 US hiring managers said their company had posted fake or ghost job listings</div>
              <div className="sc-source">ResumeBuilder.com, June 2024 (vendor survey, reported by Staffing Industry Analysts)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~0.1%</div>
              <div className="sc-label">interview rate in one reported auto-apply account: about 5 interviews from thousands of applications</div>
              <div className="sc-source">The Interview Guys, April 2026 (reported)</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">How We Rated These Job Search Tips</div>
                <div className="sec-sub">Evidence first, then payoff for your time</div>
              </div>
            </div>
            <p>Search for job search tips and you get the same list everywhere: apply early, tailor your resume, use keywords, network, follow up. Some of it is good. Some of it is folklore. Very little of it says where it came from.</p>
            <p>So we took the 15 tips we see repeated most and asked two questions of each. What is the evidence, and where it exists, who measured it? And if you follow the tip, does it get you closer to the person who decides? Each tip gets a Studojo editorial rating from 1 to 5. Where a cited fact exists, we name the source and year. Where it does not, we say so.</p>
            <div className="chart-wrap">
              <div className="chart-label">Where the evidence for the 15 tips comes from (Studojo count of the tips in this report)</div>
              <div style={{ height: 260 }}>
                <canvas id="jstEvidenceChart" />
              </div>
            </div>
            <div className="highlight">
              Almost half of the most repeated tips rest on <strong>logic with little hard data behind them</strong>. That does not make them wrong. It means you should weigh them, not obey them.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Job Search Tips 2026: All 15, Rated</div>
                <div className="sec-sub">Ratings are Studojo's editorial ratings, not measured data</div>
              </div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">All 15 tips, rated 1 to 5 (Studojo editorial rating)</div>
              <div style={{ height: 460 }}>
                <canvas id="jstRatingChart" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tip</th>
                  <th>Verdict</th>
                  <th>Evidence</th>
                  <th>Editorial rating</th>
                </tr>
              </thead>
              <tbody>
                {TIPS.map((t) => (
                  <tr key={t.tip}>
                    <td><strong>{t.tip}</strong></td>
                    <td>{t.verdict}</td>
                    <td>{t.evidence}</td>
                    <td><span className={`tag-pill ${t.pill}`}>{t.rating}/5</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Tips to Get a Job That Actually Work: Reach a Person</div>
                <div className="sec-sub">The three tips that rate 4 or 5</div>
              </div>
            </div>
            <p>The top of the table has one thing in common. Each tip puts you in front of a human with a name instead of a queue.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Email the hiring manager directly (5/5).</strong> This is Studojo's position: a short, personal, specific email to the hiring manager or team lead, from your own email address, beats another application in a pile of about 242 (The Interview Guys, April 2026, citing Business Insider data). Four to six lines: why their team, one proof point, a small ask.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Ask for a referral (4/5).</strong> The best measured tip here. In CareerPlug's 2025 Recruiting Metrics Report (a vendor report on US small and mid-sized businesses), referrals were 2% of applicants but 11% of hires. It loses a point only because most freshers have few people to ask.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Follow up once (4/5).</strong> A short nudge about a week after your email, with one new detail. Following up once helps. Following up five times does not.</span></div>
            </div>
            <div className="pull-quote">
              <p>"Every tip that rates well gets you read by a person. Every tip that rates badly gets you counted."</p>
              <span className="pq-source">The Studojo position</span>
            </div>
            <div className="highlight">
              <strong>The fastest way to follow the top tip is Studojo.</strong> It finds the person who can actually hire you, verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail. 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026). Replies are not guaranteed.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Job Hunting Tips That Are Half Right</div>
                <div className="sec-sub">Useful in the right place, wasted in the wrong one</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Tailor your resume (4/5).</strong> Recruiters spend about 6 to 7 seconds on a first scan (Ladders eye-tracking study, 2018). Rewrite the top third for each role: the title you want, your closest project, one number.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Check the job is real (3/5).</strong> In a June 2024 ResumeBuilder.com survey of 649 US hiring managers (a vendor survey), 39% said their company had posted fake or ghost listings. Before you invest, check the posting date and whether the company is actually hiring for that team.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Apply early (3/5).</strong> It makes sense, because piles grow. The most quoted numbers on it come from old, secondhand data we could not trace to the original, so we leave them out. Early and specific beats early and generic.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>One-page resume (3/5).</strong> A sound convention for freshers given how short that first scan is. It is not a rule that decides outcomes by itself.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Polish your LinkedIn (3/5).</strong> Worth an afternoon, because the people you email may look you up. Then stop tweaking and start writing to people.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Always write a cover letter (2/5).</strong> Write one when the role asks or a small team reads every application. Skip it when you would only write something generic. More in <Link to="/reports/cover-letter-report-2026">the cover letter report</Link>.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Let AI write your applications (2/5).</strong> 85.6% of job seekers say they use AI tools (Huntr, Q3 2025, n=527, a vendor survey), and a Capterra figure cited by NBC News (2024) puts it at 58%. AI chatbots are fine for a first draft. They cannot find and verify the hiring manager, send from your Gmail or follow up for you.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Job alerts everywhere (2/5).</strong> Good for spotting roles quickly. Bad as a plan, because an alert just gets you to the same pile sooner.</span></div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Job Search Advice to Drop</div>
                <div className="sec-sub">The four tips that rate 1 out of 5</div>
              </div>
            </div>
            <p>These tips share one idea: the job search is a numbers game, so do more of it, faster. The numbers say otherwise.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Apply to everything.</strong> At roughly 0.1% to 2% per online application (The Interview Guys, April 2026), you can send hundreds and still have little to show.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Easy Apply for speed.</strong> If it is quick for you, it is quick for everyone else. The easier it is to apply, the bigger the pile.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Keyword stuffing.</strong> The "75% of resumes are rejected by ATS" figure is an unsourced myth. A person reads your resume, and a page stuffed with keywords reads badly to a person. See <Link to="/reports/ats-resume-report-2026">the ATS resume report</Link>.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Auto-apply bots.</strong> One account reported about 5 interviews from thousands of applications, and one bulk-apply service shut its bulk-send feature in August 2025 at roughly one interview per fifty sends (The Interview Guys, April 2026). Sonara shut its original service on 1 February 2024 (Sonara's own shutdown notice).</span></div>
            </div>
            <div className="callout">
              <strong>Bots get noticed.</strong> Recruiters plant hidden instructions in job posts, such as asking applicants to include an odd word, and they spot one person applying to dozens of roles at the same company (NBC News, 17 November 2024, quoting recruiter Mike Peditto). LinkedIn's terms ban bots and automation tools.
            </div>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">Job Search Tips for Freshers: Rebuild Your Week</div>
                <div className="sec-sub">Put your hours where the ratings are</div>
              </div>
            </div>
            <p>If you have about ten hours a week for the job search, this is how we would split them. Portals still get an hour, because that is where you find roles. Most of the time goes to reaching people.</p>
            <div className="chart-wrap">
              <div className="chart-label">A 10-hour job search week, suggested split (Studojo editorial suggestion, not measured data)</div>
              <div style={{ height: 260 }}>
                <canvas id="jstWeekChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>In India, start with campus.</strong> Sit every drive you qualify for. Use Naukri, Internshala, LinkedIn and foundit to find roles off campus.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Aim at smaller teams.</strong> At startups and small companies, the founder or team lead often reads their own email. That is where a fresher's project gets a real look.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Write to the person, then follow up once.</strong> Ten specific emails a week beat a hundred blind applications in our view.</span></div>
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">Job search tips and advice, answered directly</div>
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
              <Link to="/reports/how-to-get-a-job-2026" className="related-card">
                <div className="rc-kicker">Getting hired</div>
                <div className="rc-title">How to Get a Job in 2026: Every Route Compared, and the One That Skips the Queue</div>
              </Link>
              <Link to="/reports/job-search-2026" className="related-card">
                <div className="rc-kicker">Job search</div>
                <div className="rc-title">Job Boards Are Dead: How Students Actually Get Hired in 2026</div>
              </Link>
              <Link to="/reports/why-am-i-not-getting-a-job-2026" className="related-card">
                <div className="rc-kicker">Diagnosis</div>
                <div className="rc-title">Why Am I Not Getting a Job? The Six Real Reasons, and the Fix for Each</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Use the tip that rates highest.</h3>
              <p>Studojo finds the person who can hire you, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
