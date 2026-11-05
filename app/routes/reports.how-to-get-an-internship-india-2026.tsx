import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How to Get an Internship in India in 2026: Where to Look, What It Pays, and the Move That Works | Studojo" },
    { name: "description", content: "How to get an internship in India in 2026: where internships are actually listed, what stipends really look like, and why emailing the person who hires beats mass applying." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "how to get an internship in India, internship in India, how to get internship for freshers, internship stipend India, where to find internships India, internship with no experience, how to apply for internships" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/how-to-get-an-internship-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How to Get an Internship in India in 2026" },
    { property: "og:description", content: "Where internships are listed, what they pay, why spraying applications fails, and the one move that gets you read: email the person who hires." },
    { property: "og:url", content: `${BASE_URL}/reports/how-to-get-an-internship-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-05T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How to Get an Internship in India in 2026 | Studojo" },
    { name: "twitter:description", content: "Where to look, what it pays, and why emailing the person who hires beats mass applying." },
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
  const RED = "#ef4444";
  const GREEN = "#10b981";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: does a listing name a person to contact? (Studojo listings data, Oct 2026)
  const contactEl = document.getElementById("internContactChart") as HTMLCanvasElement | null;
  if (contactEl && !contactEl.dataset.rendered) {
    contactEl.dataset.rendered = "1";
    new Chart(contactEl, {
      type: "doughnut",
      data: {
        labels: ["No direct contact", "An email in the posting", "Some other contact"],
        datasets: [{
          data: [85.1, 7.0, 7.9],
          backgroundColor: [RED, GREEN, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw}%` } },
        },
      },
    });
  }

  // Chart 2: how often pay is stated, entry-level vs internship (Studojo listings data, Oct 2026)
  const payEl = document.getElementById("internPayChart") as HTMLCanvasElement | null;
  if (payEl && !payEl.dataset.rendered) {
    payEl.dataset.rendered = "1";
    new Chart(payEl, {
      type: "bar",
      data: {
        labels: ["Entry-level listings", "Internship listings"],
        datasets: [{
          label: "Share that state the pay",
          data: [28.6, 2.1],
          backgroundColor: [VIOLET, VIOLET2],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% state the pay` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}%` } },
        },
      },
    });
  }

  // Chart 3: the odds on one online application (illustrative, based on 0.1% to 2% per application, The Interview Guys, Apr 2026)
  const oddsEl = document.getElementById("internOddsChart") as HTMLCanvasElement | null;
  if (oddsEl && !oddsEl.dataset.rendered) {
    oddsEl.dataset.rendered = "1";
    new Chart(oddsEl, {
      type: "bar",
      data: {
        labels: ["Applications sent", "Interviews (illustrative)"],
        datasets: [{
          label: "Out of 100 online applications",
          data: [100, 1.5],
          backgroundColor: [VIOLET3, VIOLET],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} of 100` } },
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
    q: "How do I get an internship in India with no experience?",
    a: "Pick two or three roles you actually want, build one small piece of proof for each (a project, a teardown, a short writeup), then reach the person who runs that team and send a short, specific email about why you fit. No experience is normal for an internship. What stands out is showing you can do a slice of the work and writing to a person instead of a portal queue.",
  },
  {
    q: "Which sites list internships in India?",
    a: "Internships in India are listed on job portals like Naukri, Internshala, LinkedIn and foundit, on company careers pages, on government schemes like the PM Internship Scheme portal, and through your college placement cell. Portals are where listings live, not where decisions get made. Use them to find who is hiring, then write to that person directly.",
  },
  {
    q: "What stipend do internships in India pay?",
    a: "It varies widely and many listings do not say. In Studojo's October 2026 listings data, only about 2.1% of internship postings stated a stipend at all. Where interns report pay, it commonly runs 10,000 to 20,000 rupees a month, and the PM Internship Scheme pays 9,000 rupees a month. Always confirm the stipend in writing before you accept.",
  },
  {
    q: "Is cold emailing a good way to get an internship?",
    a: "Yes, for most roles it is the strongest move a student has. About 85 in 100 India listings give you no person to contact (Studojo listings data, October 2026), so finding the hiring manager and writing one short, specific email puts you in front of the person who decides, instead of a queue of hundreds. It is legal in India when one person writes to one person about a job.",
  },
  {
    q: "How many internships should I apply to?",
    a: "Fewer than you think, done better. A typical opening draws about 242 applicants (The Interview Guys, April 2026), and a single online application converts at roughly 0.1% to 2%, so sending a hundred identical forms rarely works. Target a shortlist you genuinely fit, write a specific email to each hiring manager, and follow up once.",
  },
  {
    q: "Do I need a LinkedIn profile to get an internship in India?",
    a: "It helps for research and for being found, but it is not required for most fresher internships. A direct email to the person who hires works without one, and a thin profile is fine when you are starting out. Spend the time on one good project and a clear, short email rather than on polishing a profile nobody has asked to see.",
  },
];

export default function HowToGetAnInternshipIndiaReport() {
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
        "headline": "How to Get an Internship in India in 2026",
        "description": "Where internships are actually listed in India, what stipends really look like, and why emailing the person who hires beats mass applying.",
        "url": `${BASE_URL}/reports/how-to-get-an-internship-india-2026`,
        "datePublished": "2026-11-05T00:00:00Z",
        "dateModified": "2026-11-05T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/how-to-get-an-internship-india-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "How to Get an Internship in India 2026", "item": `${BASE_URL}/reports/how-to-get-an-internship-india-2026` },
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
              <span>How to Get an Internship in India 2026</span>
            </nav>
            <h1>How to Get an Internship in India, <em>and the Move That Works</em></h1>
            <p className="rpt-hero-sub">
              There is no shortage of internships in India. There is a shortage of ways to get read.
              Here is where internships are actually listed, what they really pay, why spraying
              applications fails, and the one step that puts you in front of the person who hires.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · freshers and students</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Data</span>
                <span className="rpt-meta-value">Studojo listings, public sources</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Updated</span>
                <span className="rpt-meta-value">5 November 2026</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>India listed about <strong>18,459 internship openings</strong> in October 2026, part of 171,203 live entry-level and internship listings (Studojo listings data, October 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>About 85 in 100 listings give you no person to contact</strong>, and only about 7 in 100 put an email in the posting. You have to find the person who hires.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Only about 2.1% of internship listings even state the stipend.</strong> Where interns report pay, it commonly runs 10,000 to 20,000 rupees a month; the PM Internship Scheme pays 9,000 rupees a month.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>A single online application converts at roughly <strong>0.1% to 2%</strong>, and a typical opening draws about 242 applicants (The Interview Guys, April 2026). Volume is not the lever.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The move that works: email the person who hires for the role.</strong> Stu finds that person, verifies their work email, and writes the email for you.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">18,459</div>
              <div className="sc-label">internship listings counted in India, October 2026</div>
              <div className="sc-source">Studojo listings data, Oct 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">85%</div>
              <div className="sc-label">of listings give you no direct person to contact</div>
              <div className="sc-source">Studojo listings data, Oct 2026</div>
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
                <div className="sec-title">Where internships are actually listed in India</div>
                <div className="sec-sub">Six places to look, and what each is good for</div>
              </div>
            </div>
            <p>Where do you find internships in India in 2026? In six places, and each has a different job to do. Portals such as Naukri, Internshala, LinkedIn and foundit carry the volume. Company careers pages carry the roles the big portals never list. Government schemes like the PM Internship Scheme run their own portal. Your college placement cell and your seniors carry the ones that never get posted at all.</p>
            <p>Treat all of them the same way: as a map of who is hiring, not as the place you win the internship. A listing tells you a team needs help. The decision is made by a person on that team, and that person is almost never the one reading the portal inbox.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Where</th>
                  <th>Good for</th>
                  <th>The catch</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Portals (Naukri, Internshala, LinkedIn, foundit)</td><td>Volume and breadth across cities and roles</td><td>Hundreds of applicants per post; your form sits in a queue</td></tr>
                <tr><td>Company careers pages</td><td>Roles and teams that never reach the big portals</td><td>You have to check them one by one, and still land in a queue</td></tr>
                <tr><td>PM Internship Scheme portal</td><td>Stipend-backed internships at listed companies</td><td>Eligibility rules and location limits; see our PMIS report</td></tr>
                <tr><td>College placement cell</td><td>Pre-screened roles and alumni links</td><td>Limited to your campus and its recruiters</td></tr>
                <tr><td>Seniors, faculty and alumni</td><td>The unposted internships, the warm intro</td><td>Depends on who you know and how you ask</td></tr>
                <tr><td>A direct email to the hiring manager</td><td>Reaching the person who decides, with no queue</td><td>You have to find them; this is the part Stu does for you</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>The pattern:</strong> every route above ends at the same door, a person on a team who needs help. Portals make you wait in line at that door. Everything in this report is about getting to the door first.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>For the PM Internship Scheme stipend, eligibility and dropout data, see <Link to="/reports/pm-internship-scheme-report-2026">our PM Internship Scheme report</Link>.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">What internships in India really pay</div>
                <div className="sec-sub">Most listings do not say, so here is what the data shows</div>
              </div>
            </div>
            <p>What does an internship in India pay? The honest answer is that most postings do not tell you. In Studojo's October 2026 listings data, only about 2.1% of internship listings stated a stipend at all, against 28.6% of entry-level job listings. The pay is there; it just moves to the interview or the offer stage, which is why so many students take a role and only then learn it is unpaid.</p>
            <div className="chart-wrap">
              <div className="chart-label">Share of listings that state the pay (Studojo listings data, Oct 2026)</div>
              <div style={{ height: 240 }}>
                <canvas id="internPayChart" />
              </div>
            </div>
            <p>Where interns do report pay, stipends commonly run 10,000 to 20,000 rupees a month. The PM Internship Scheme pays 9,000 rupees a month, raised from 5,000 in March 2026. Finance and consulting internships, including the Big 4, can pay more, and plenty of startup internships pay little or nothing. Numbers like these move, so always confirm the stipend in writing before you accept.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kind of internship</th>
                  <th>What it tends to pay</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Typical reported private internship</td><td>10,000 to 20,000 rupees a month</td><td><span className="tag-pill pill-green">Common band</span> Studojo listings data, Oct 2026</td></tr>
                <tr><td>PM Internship Scheme</td><td>9,000 rupees a month</td><td>Plus a one-time grant; eligibility applies</td></tr>
                <tr><td>Finance, consulting, Big 4</td><td>Higher, varies by role and city</td><td>See our Big 4 report</td></tr>
                <tr><td>Many startup and NGO internships</td><td>Low or unpaid</td><td>Confirm in writing before you accept</td></tr>
              </tbody>
            </table>
            <div className="highlight">
              An unstated stipend is not a good sign, but it is not a dealbreaker either. Ask for the number in your first reply. A team that cannot answer plainly is telling you something.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: Studojo listings data (October 2026); PM Internship Scheme figures via <Link to="/reports/pm-internship-scheme-report-2026">our PMIS report</Link>; Big 4 pay via <Link to="/reports/big-4-fresher-internship-report-2026">our Big 4 fresher report</Link>.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Why mass applying does not work</div>
                <div className="sec-sub">The maths of the portal queue</div>
              </div>
            </div>
            <p>Why does sending a hundred applications rarely get an internship? Because the odds on any single online application are poor, and the fix is not more applications. A typical opening draws about 242 applicants, and a single application converts at roughly 0.1% to 2% (The Interview Guys, April 2026). The person who skims your form spends about 6 to 7 seconds on a first resume scan (Ladders eye-tracking study, 2018).</p>
            <div className="chart-wrap">
              <div className="chart-label">The odds on one online application (illustrative, based on 0.1% to 2% per application)</div>
              <div style={{ height: 220 }}>
                <canvas id="internOddsChart" />
              </div>
            </div>
            <p>Doubling the number of forms you send does not change those odds; it just doubles the number of queues you are stuck in. Worse, firing the same application at dozens of roles is exactly the pattern recruiters watch for, and a flood of near-identical forms is easy to screen out. The problem was never your effort. It was the channel.</p>
            <div className="callout">
              <strong>Read this twice:</strong> the portal queue treats you as one of a few hundred near-identical forms. Nothing you write inside that form changes that you are in the queue. To get read, you have to step out of it.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: The Interview Guys (April 2026); Ladders eye-tracking study (2018). The chart is illustrative, drawn from the 0.1% to 2% per-application range. See <Link to="/reports/india-entry-level-jobs-internships-october-2026">our India entry-level listings report</Link> for the underlying counts.</p>
          </div>

          <StuCta via="report-how-to-get-an-internship-india-2026" place="report-mid" size="quiet" title="One short call with Stu, and you get internships that fit you and the person who hires for each one." />

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">The move that works: email the person who hires</div>
                <div className="sec-sub">Step out of the queue and write to one person</div>
              </div>
            </div>
            <p>What actually gets you an internship is reaching the person who runs the team and writing them a short, specific email about why you fit. That is the move. It works because it skips the queue entirely: instead of being one of 242 forms, you are one email in the inbox of the person who decides.</p>
            <p>The catch is in the data. About 85 in 100 India listings give you no person to contact, and only about 7 in 100 put an email in the posting (Studojo listings data, October 2026). So the hard part is not writing the email. It is finding the right person and a work email that reaches them.</p>
            <div className="chart-wrap">
              <div className="chart-label">Does a listing name a person to contact? (Studojo listings data, Oct 2026)</div>
              <div style={{ height: 260 }}>
                <canvas id="internContactChart" />
              </div>
            </div>
            <p>This is the part we built Studojo to do. You start with one short call with Stu, your career agent: tell Stu the field, the city and the stipend you want, by talking or typing. Stu finds internships that fit you, finds who is hiring for each one, usually the team lead or a recruiter for the role, with a verified work email, and writes a short, personal email on why you fit, from your real work. Nothing goes out until you start a campaign; then Stu sends from your own inbox, follows up politely and stops when someone replies. Replies are not guaranteed, and Stu does not mass apply for you. The point is the opposite of volume: one good email to the right person. You can <a href="https://platform.studojo.com/join?via=report-how-to-get-an-internship-india-2026&amp;how=voice" data-stu-start="">tell Stu the internship you want</a> and see your top matches for free.</p>
            <div className="pull-quote">
              <p>Being one email in the hiring manager's inbox beats being one of 242 forms in the portal queue. Every time.</p>
              <span className="pq-source">The whole argument of this report, in one line</span>
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">A step-by-step plan to get an internship in India</div>
                <div className="sec-sub">Six steps, in order</div>
              </div>
            </div>
            <div className="blist">
              {[
                ["Pick two or three roles you actually want", "Not twenty. A clear target lets you write a specific email, and specific is what gets read. Internship, field, city, and a realistic stipend band."],
                ["Build one small piece of proof for each", "A project, a teardown of the company's product, a short writeup, a dataset. One slice of the actual work beats a line on a resume that says you are a fast learner."],
                ["Find who runs the team", "On the company site and on LinkedIn, find the person who would manage an intern on that team. That is who your email goes to, not a generic careers inbox."],
                ["Write one short, specific email", "Three or four lines: who you are, the one thing you made, why their team, and a small ask. Attach or link the proof. No wall of text, no flattery."],
                ["Send from your own email and follow up once", "A personal email from your own address, not a portal form. If there is no reply in about a week, one polite follow-up. Then move on to the next target."],
                ["Let the tooling do the slow parts", "Finding the right person and a verified work email for every role is the slow, repetitive part. Stu does exactly that, and writes the first draft, so you can run this across many roles without burning out."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" />
                  <span><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
            <div className="highlight">
              Notice what is not on this list: sending a hundred identical forms, buying a fancy template, or waiting for a portal to call. The plan is small, specific and aimed at people, not queues.
            </div>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">No experience, thin resume, no referrals: what to do</div>
                <div className="sec-sub">The common blockers, and the honest answer to each</div>
              </div>
            </div>
            <p>Most students who want an internship are starting from zero, and that is fine. An internship is the job you take to get experience; nobody expects you to have it already. The blockers that actually stop people are smaller and more fixable than they feel.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>What is stopping you</th>
                  <th>What to do about it</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>No work experience</td><td>Make one small thing that looks like the work, and show it. Proof beats a claim.</td></tr>
                <tr><td>Resume feels thin</td><td>A short resume is normal for a student. One real project does more than five vague bullet points.</td></tr>
                <tr><td>No referrals or contacts</td><td>A direct email to the hiring manager is the referral you write yourself. It works without knowing anyone inside.</td></tr>
                <tr><td>No replies from portals</td><td>That is the channel, not you. Step out of the queue and write to a person.</td></tr>
                <tr><td>Not sure who to contact</td><td>Find the team lead on the company site or LinkedIn. If finding a verified email is the wall, that is the piece Stu handles.</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>The fresher advantage:</strong> hiring managers know an intern has little experience. What they cannot ignore is a student who found them, understood the team, and showed a piece of real work in three honest lines. Almost nobody does this, which is exactly why it works.
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The questions students ask about getting an internship in India, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to get an internship without joining the back of the queue</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The data points to a simple plan:</p>
            <div className="blist">
              {[
                ["Use portals to find who is hiring, not to apply", "They are a map of open teams. The listing is the start of the trail, not the finish line."],
                ["Target a short list you genuinely fit", "Two or three roles with real proof beats a hundred forms. The odds on volume are against you."],
                ["Reach the person, not the inbox", "About 85 in 100 listings name no one, so the real skill is finding the hiring manager and a work email."],
                ["Write one short, specific email and follow up once", "From your own address, about one thing you made. Then move to the next target."],
                ["Let Stu do the slow parts", "Finding who hires, verifying the email and drafting the message is what Stu does after one short call."],
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
              <Link to="/reports/pm-internship-scheme-report-2026" className="related-card">
                <div className="rc-kicker">Internships</div>
                <div className="rc-title">The PM Internship Scheme Report: Stipend, Eligibility and Dropouts</div>
              </Link>
              <Link to="/reports/big-4-fresher-internship-report-2026" className="related-card">
                <div className="rc-kicker">Finance</div>
                <div className="rc-title">The Big 4 Report: How Freshers Get Into Deloitte, EY, KPMG and PwC</div>
              </Link>
              <Link to="/reports/india-entry-level-jobs-internships-october-2026" className="related-card">
                <div className="rc-kicker">Job Market</div>
                <div className="rc-title">India Entry-Level Jobs and Internships, October 2026: 171,203 Listings</div>
              </Link>
            </div>
          </div>

          <StuCta via="report-how-to-get-an-internship-india-2026" place="report-end" size="card" title="Want an internship that actually leads somewhere?" line="Tell Stu the field, the city and the stipend you want in one short call. Stu finds internships that fit you, finds who is hiring and writes the email to them, sent from your own inbox once you start." />
        </div>
      </main>
      <Footer />
    </>
  );
}
