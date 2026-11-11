import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How to Get an Internship in Pune in 2026: Where They Are, What They Pay, and the Move That Works | Studojo" },
    { name: "description", content: "How to get an internship in Pune in 2026: the auto, IT, GCC and startup teams hiring interns, real stipend ranges, rent, and why emailing the person who hires beats mass applying." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "how to get an internship in Pune, internship in pune for freshers, paid internship in pune, internship in pune for btech students" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/internships-pune-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How to Get an Internship in Pune in 2026" },
    { property: "og:description", content: "The auto, IT, GCC and startup teams hiring interns in Pune, what stipends really look like, hybrid vs on-site, and why emailing a founder, team lead or manager beats mass applying." },
    { property: "og:url", content: `${BASE_URL}/reports/internships-pune-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-11T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How to Get an Internship in Pune in 2026 | Studojo" },
    { name: "twitter:description", content: "Where internships live in Pune, what they pay, and why emailing the person who hires beats mass applying." },
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

  // Chart 1: where interns in Pune are hired (editorial grouping of hiring pools, Nov 2026)
  const punHiringEl = document.getElementById("punHiringChart") as HTMLCanvasElement | null;
  if (punHiringEl && !punHiringEl.dataset.rendered) {
    punHiringEl.dataset.rendered = "1";
    new Chart(punHiringEl, {
      type: "doughnut",
      data: {
        labels: ["IT and global capability centres (GCCs)", "Auto and manufacturing teams", "Startups and small teams", "Agencies, NGOs, labs"],
        datasets: [{
          data: [35, 30, 25, 10],
          backgroundColor: [VIOLET, VIOLET2, VIOLET3, MUTED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw}% (illustrative)` } },
        },
      },
    });
  }

  // Chart 2: reported Pune intern stipend bands (reported ranges, Internshala, 2026)
  const punStipendEl = document.getElementById("punStipendChart") as HTMLCanvasElement | null;
  if (punStipendEl && !punStipendEl.dataset.rendered) {
    punStipendEl.dataset.rendered = "1";
    new Chart(punStipendEl, {
      type: "bar",
      data: {
        labels: ["Low / unpaid", "Common band", "CS and IT roles", "Funded or specialist"],
        datasets: [{
          label: "Reported monthly stipend (rupees, thousands)",
          data: [3, 15, 28, 40],
          backgroundColor: [VIOLET3, VIOLET, VIOLET2, INK],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` about ${ctx.raw},000 rupees a month (reported)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}k` } },
        },
      },
    });
  }

  // Chart 3: the odds on one online application (illustrative, based on 0.1% to 2% per application, The Interview Guys, Apr 2026)
  const punOddsEl = document.getElementById("punOddsChart") as HTMLCanvasElement | null;
  if (punOddsEl && !punOddsEl.dataset.rendered) {
    punOddsEl.dataset.rendered = "1";
    new Chart(punOddsEl, {
      type: "bar",
      data: {
        labels: ["Applications sent", "Interviews (illustrative)"],
        datasets: [{
          label: "Out of 100 online applications",
          data: [100, 1.5],
          backgroundColor: [RED, GREEN],
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
    q: "How do I get an internship in Pune for freshers?",
    a: "Pick two or three roles you actually want, build one small piece of proof for each, then email the founder, team lead or manager who would run that work, not a generic careers inbox. Pune runs on auto and manufacturing, IT and GCCs, and startups, so the person who decides is usually close by. No experience is normal for an internship; what stands out is a student who found the right person and showed a slice of real work.",
  },
  {
    q: "Where do internships in Pune actually get listed?",
    a: "Listings live on portals like Internshala, LinkedIn, Naukri and foundit, on company and startup careers pages, on Hinjewadi and manufacturing company sites, and through your college placement cell. Portals are where listings sit, not where decisions get made. Use them to find who is hiring, then write to that person directly, especially at startups and small teams where the founder often reads their own inbox.",
  },
  {
    q: "What does a paid internship in Pune pay?",
    a: "It varies widely and many listings do not say. Reported stipends for a paid internship in Pune commonly run about 5,000 to 25,000 rupees a month, with computer science and IT roles reported up to about 28,000 and a few funded or specialist roles higher (Internshala, November 2026, reported). Plenty of early startup, lab and NGO roles pay little or nothing, so always confirm the stipend in writing before you accept.",
  },
  {
    q: "Is an internship in Pune for btech students worth it given the rent?",
    a: "Often yes, but do the maths first. A shared PG in Pune is reported at about 5,000 to 12,000 rupees a month, with two to three sharing cheapest, and a 1BHK from about 9,000 in areas like Hinjewadi and Wakad up to about 22,000 or more centrally (Stanza Living, NoBroker and portal data, reported, 2026). A low stipend can be eaten by rent and commute, so ask whether the role is hybrid or on-site before you say yes.",
  },
  {
    q: "Is emailing a founder, team lead or manager a good way to get an internship in Pune?",
    a: "Yes, and in a city built on close-knit teams it is one of the strongest moves a student has. Most listings give you no person to contact, so finding the founder, team lead or hiring manager and sending one short, specific email puts you in front of the person who decides instead of a queue of hundreds. It is legal in India when one person writes to one person about a job, and at a small team your email may be read the same day.",
  },
  {
    q: "How many internships should I apply to in Pune?",
    a: "Fewer than you think, done better. A typical opening draws about 242 applicants (The Interview Guys, April 2026) and a single online application converts at roughly 0.1% to 2%, so sending a hundred identical forms rarely works. Target a shortlist of teams you genuinely fit across Pune's auto, IT and startup pools, write a specific email to each hiring person, and follow up once.",
  },
];

export default function InternshipsPuneReport() {
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
        "headline": "How to Get an Internship in Pune in 2026",
        "description": "The auto, IT, GCC and startup teams hiring interns in Pune, what stipends really look like, hybrid vs on-site and rent, and why emailing a founder, team lead or manager beats mass applying.",
        "url": `${BASE_URL}/reports/internships-pune-2026`,
        "datePublished": "2026-11-11T00:00:00Z",
        "dateModified": "2026-11-11T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/internships-pune-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "How to Get an Internship in Pune 2026", "item": `${BASE_URL}/reports/internships-pune-2026` },
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
              <span>How to Get an Internship in Pune 2026</span>
            </nav>
            <h1>How to Get an Internship in Pune, <em>and the Move That Works</em></h1>
            <p className="rpt-hero-sub">
              Pune runs on three engines, auto and manufacturing, IT and global capability centres, and startups,
              which means the person who can hire you is usually close. This is how to get an internship in Pune in
              2026: who is hiring, what stipends really look like, hybrid versus on-site, the rent maths, and why
              writing to a founder, team lead or manager beats mass applying.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Pune · freshers and students</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Data</span>
                <span className="rpt-meta-value">DPIIT, KPMG, Internshala, public sources</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Updated</span>
                <span className="rpt-meta-value">11 November 2026</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>Maharashtra is India's top startup state with about <strong>35,992 DPIIT-recognised startups</strong> as of December 2025 (DPIIT data via The Federal, January 2026), and Pune is one of the state's largest startup hubs. That is a lot of small teams that hire interns.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Pune hosts <strong>about 380 or more global capability centres employing roughly 180,000 professionals</strong>, reported to hold around a quarter of India's GCCs (KPMG and industry reports, 2026, reported). Hinjewadi is Maharashtra's largest IT park.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The Pune belt (Chakan, Talegaon, Pimpri-Chinchwad) is one of India's densest auto and manufacturing hubs, sometimes called the <strong>"Detroit of India"</strong> (industry profiles, 2026). Three engines means three large pools of intern work.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>A paid internship in Pune <strong>commonly reports 5,000 to 25,000 rupees a month</strong>, with CS and IT roles reported up to about 28,000 (Internshala, November 2026, reported). Rent runs about 5,000 to 12,000 for a shared PG. Ask about hybrid.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The move that works: email the founder, team lead or manager who hires.</strong> In a city of close-knit teams, that person often reads their own inbox. Stu finds them, verifies the work email, and writes the email for you.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">35,992</div>
              <div className="sc-label">DPIIT-recognised startups in Maharashtra, India's top startup state; Pune a major hub</div>
              <div className="sc-source">DPIIT via The Federal, Jan 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">380+</div>
              <div className="sc-label">GCCs in Pune employing about 180,000 people, roughly a quarter of India's total</div>
              <div className="sc-source">KPMG and industry reports, reported, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">5k to 25k</div>
              <div className="sc-label">rupees a month, common reported paid internship stipend band</div>
              <div className="sc-source">Internshala, reported, Nov 2026</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Who hires interns in Pune, and why that helps you</div>
                <div className="sec-sub">A three-engine city, which changes the move</div>
              </div>
            </div>
            <p>Pune is not a one-industry town; it is built on three engines, and all three hire interns. The first is IT and global capability centres, the India arms of global companies. Pune hosts about 380 or more GCCs employing roughly 180,000 professionals, and is reported to hold around a quarter of India's GCCs (KPMG and industry reports, 2026, reported). Hinjewadi, the Rajiv Gandhi Infotech Park, is Maharashtra's largest IT park, with GCCs and IT firms such as Wipro, Infosys and Siemens based there.</p>
            <p>The second engine is auto and manufacturing. The Pune belt, running through Chakan, Talegaon and Pimpri-Chinchwad, is one of India's densest automobile and manufacturing hubs, sometimes called the "Detroit of India", home to Tata Motors, Bajaj Auto, Mahindra, Mercedes-Benz and Volkswagen plus Tier-1 suppliers like Bharat Forge and Tata AutoComp (widely reported industry profiles, 2026). That means core mechanical, electrical, production and supply-chain internships that many other cities cannot match.</p>
            <p>The third engine is startups. Maharashtra is India's top startup state with about 35,992 DPIIT-recognised startups as of December 2025 (DPIIT data via The Federal, January 2026), and Pune is one of the state's largest hubs. On a small team there is often no HR wall between you and the person who decides. Add agencies, labs and NGOs, and you have a wide field.</p>
            <div className="chart-wrap">
              <div className="chart-label">Where Pune interns tend to get hired (illustrative grouping, not measured shares)</div>
              <div style={{ height: 260 }}>
                <canvas id="punHiringChart" />
              </div>
            </div>
            <p>Why does the mix matter? Because it tells you who to write to. At a startup, that is often the founder or an early team lead. At a GCC, IT firm or a manufacturing plant, it is the engineering, production or team manager for the role, not the central careers inbox. The chart above is an illustrative grouping to show the spread, not a measured breakdown, but the point holds: most interns here are hired by a specific person on a specific team.</p>
            <div className="callout">
              <strong>The Pune edge:</strong> three engines means three large pools of teams, and across all of them the hiring person is rarely far away. That is exactly why a direct, specific email works better here than a form dropped into a portal queue.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Where internships in Pune are actually listed</div>
                <div className="sec-sub">Five places to look, and what each is good for</div>
              </div>
            </div>
            <p>Where do you find an internship in Pune for freshers in 2026? In a handful of places, and each has a different job to do. Portals such as Internshala, LinkedIn, Naukri and foundit carry the volume. Hinjewadi IT firms and manufacturing company careers pages carry the structured programmes. Startup careers pages and startup job boards carry the early roles the big portals never list. Your college placement cell and your seniors carry the ones that never get posted at all.</p>
            <p>Treat all of them the same way: as a map of who is hiring, not as the place you win the internship. A listing tells you a team needs help. The decision is made by a person on that team, and in a startup that person is often the founder reading their own inbox, while in a plant or GCC it is the manager for the role.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Where</th>
                  <th>Good for</th>
                  <th>The catch</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Portals (Internshala, LinkedIn, Naukri, foundit)</td><td>Volume and breadth across roles and areas of Pune</td><td>Hundreds of applicants per post; your form sits in a queue</td></tr>
                <tr><td>Startup careers pages and startup job boards</td><td>Early roles on small teams, often near the founder</td><td>You have to check them one by one, and still land in a queue</td></tr>
                <tr><td>IT, GCC and manufacturing careers pages</td><td>Structured intern programmes with clearer stipends</td><td>More process and screening; the manager is behind a portal</td></tr>
                <tr><td>College placement cell</td><td>Pre-screened roles and Pune alumni links</td><td>Limited to your campus and its recruiters</td></tr>
                <tr><td>A direct email to the founder, team lead or manager</td><td>Reaching the person who decides, with no queue</td><td>You have to find them; this is the part Stu does for you</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>The pattern:</strong> every route above ends at the same door, a person on a team who needs help. Portals make you wait in line at that door. Everything in this report is about getting to the door first.
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">What a paid internship in Pune really pays</div>
                <div className="sec-sub">Reported stipend bands, and the rent that eats them</div>
              </div>
            </div>
            <p>What does a paid internship in Pune pay? Honestly, most postings do not say, and the ones that do span a wide range. Reported stipends commonly run about 5,000 to 25,000 rupees a month, with computer science and IT roles reported up to about 28,000 and a few funded or specialist roles higher (Internshala, November 2026, reported). Plenty of early startup, lab and NGO roles pay little or nothing. These are self-reported figures, so treat them as a guide, not a guarantee.</p>
            <div className="chart-wrap">
              <div className="chart-label">Reported Pune intern stipend bands, rupees a month (reported, Internshala, 2026)</div>
              <div style={{ height: 240 }}>
                <canvas id="punStipendChart" />
              </div>
            </div>
            <p>Then do the rent maths. A shared PG in Pune is reported at about 5,000 to 12,000 rupees a month, with two to three sharing cheapest, and a 1BHK from about 9,000 in areas like Hinjewadi and Wakad up to about 22,000 or more centrally (Stanza Living, NoBroker and portal data, reported, 2026). A 10,000 rupee stipend minus a 9,000 rupee room, before food and a long commute, is not a living. This is why the next question, hybrid or on-site, matters as much as the number.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kind of role</th>
                  <th>Reported monthly stipend</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Early startup, lab, NGO</td><td>Low or unpaid</td><td><span className="tag-pill pill-amber">Confirm in writing</span> before you accept</td></tr>
                <tr><td>Common paid internship band</td><td>About 5,000 to 25,000 rupees</td><td><span className="tag-pill pill-green">Common band</span> Internshala, reported, Nov 2026</td></tr>
                <tr><td>Computer science and IT roles</td><td>Reported up to about 28,000 rupees</td><td>Hinjewadi IT and GCC teams, varies by role</td></tr>
                <tr><td>Funded or specialist roles</td><td>Reported higher than the common band</td><td>Few roles, heavy competition</td></tr>
              </tbody>
            </table>
            <div className="highlight">
              An unstated stipend is not a dealbreaker, but silence about it is a signal. Ask for the number, and ask whether the role is hybrid or on-site, in your first reply. A team that cannot answer plainly is telling you something.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Sources: stipend ranges from Internshala listings (reported, November 2026); rent from Stanza Living, NoBroker and portal data (reported, 2026). Figures move, so verify current numbers before you plan.</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Why mass applying does not work, even in Pune</div>
                <div className="sec-sub">The maths of the portal queue</div>
              </div>
            </div>
            <p>Why does firing off a hundred applications rarely land an internship in Pune? Because the odds on any single online application are poor, and more applications do not fix them. A typical opening draws about 242 applicants, and a single application converts at roughly 0.1% to 2% (The Interview Guys, April 2026). The person who skims your form spends about 6 to 7 seconds on a first resume scan (Ladders eye-tracking study, 2018).</p>
            <div className="chart-wrap">
              <div className="chart-label">The odds on one online application (illustrative, based on 0.1% to 2% per application)</div>
              <div style={{ height: 220 }}>
                <canvas id="punOddsChart" />
              </div>
            </div>
            <p>Doubling the number of forms you send does not change those odds; it just doubles the number of queues you are stuck in. Worse, firing the same application at dozens of roles at the same company is exactly the pattern recruiters watch for, and a flood of near-identical forms is easy to screen out (NBC News, 17 November 2024). In a city where many teams are small and the founder or manager reads their own mail, the queue is the slowest possible route to them.</p>
            <div className="callout">
              <strong>Read this twice:</strong> the portal queue treats you as one of a few hundred near-identical forms. Nothing you write inside that form changes that you are in the queue. To get read, you have to step out of it.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: The Interview Guys (April 2026); Ladders eye-tracking study (2018); NBC News (17 November 2024). The chart is illustrative, drawn from the 0.1% to 2% per-application range.</p>
          </div>

          <StuCta via="report-internships-pune-2026" place="report-mid" size="quiet" title="One short call with Stu, and you get Pune internships that fit you and the person who hires for each one." />

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The move that works: email a founder, team lead or manager</div>
                <div className="sec-sub">Step out of the queue and write to one person</div>
              </div>
            </div>
            <p>What actually gets you an internship in Pune is reaching the person who runs the team and writing them a short, specific email about why you fit. That is the move, and it is unusually strong here. Across Pune's startups, IT and GCC teams and manufacturing plants, the person who decides is often the founder, an early team lead or the hiring manager for the role, and at a small team your email may be read the same day instead of sitting behind a portal.</p>
            <p>The catch is finding that person and a work email that reaches them. Most listings give you no contact at all, so the hard part is not writing the email; it is the research. That is the part we built Studojo to do. If you are also weighing full-time roles, our <Link to="/reports/pune-jobs-2026">Pune jobs report</Link> covers the same three engines from the other side.</p>
            <p>You start with one short call with Stu, your career agent: tell Stu the field, the area of Pune and the stipend you want, by talking or typing. Stu finds internships that fit you, finds who is hiring for each one, usually the founder, the team lead or a recruiter for the role, with a verified work email, and writes a short, personal email on why you fit, from your real work. Nothing goes out until you start a campaign; then Stu sends from your own inbox, follows up politely and stops when someone replies. Replies are not guaranteed, and Stu does not mass apply for you. The point is the opposite of volume: one good email to the right person.</p>
            <div className="pull-quote">
              <p>In a city of close-knit teams, being one email in a founder's or manager's inbox beats being one of 242 forms in the portal queue. Every time.</p>
              <span className="pq-source">The whole argument of this report, in one line</span>
            </div>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">A step-by-step plan for btech students and other freshers</div>
                <div className="sec-sub">Six steps, in order, tuned for Pune</div>
              </div>
            </div>
            <p>Most students chasing an internship in Pune for btech students or any other field are starting from zero experience, and that is fine. An internship is the job you take to get experience. The blockers that actually stop people are smaller and more fixable than they feel. Here is the plan.</p>
            <div className="blist">
              {[
                ["Pick two or three roles and teams you actually want", "Not twenty. A clear target, field, area of Pune, hybrid or on-site, and a realistic stipend band, lets you write a specific email, and specific is what gets read. A mechanical student might aim at Chakan plants; a coder at Hinjewadi teams."],
                ["Build one small piece of proof for each", "A project, a teardown of the company's product, a short writeup, a dataset, a CAD model. One slice of the actual work beats a resume line that says you are a fast learner."],
                ["Find who runs the team", "On the company site and on LinkedIn, find the founder, team lead or hiring manager who would manage an intern. That is who your email goes to, not a generic careers inbox."],
                ["Write one short, specific email", "Three or four lines: who you are, the one thing you made, why their team, and a small ask. Link the proof. No wall of text, no flattery."],
                ["Send from your own email and follow up once", "A personal email from your own address, not a portal form. If there is no reply in about a week, one polite follow-up. Then move to the next target."],
                ["Let the tooling do the slow parts", "Finding the right person and a verified work email for every team is the slow, repetitive part. Stu does exactly that, and writes the first draft, so you can run this across many teams without burning out."],
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

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The questions students ask about getting an internship in Pune, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to get an internship in Pune without joining the back of the queue</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The data points to a simple plan:</p>
            <div className="blist">
              {[
                ["Use the city's three engines to your advantage", "Auto and manufacturing, IT and GCCs, and startups all hire interns, and across all of them the hiring person is usually close. Use portals as a map, not a mailbox."],
                ["Target a short list you genuinely fit", "Two or three teams with real proof beats a hundred forms. The odds on volume are against you."],
                ["Reach the person, not the inbox", "At a startup that is often the founder; at a GCC or plant it is the team or production manager. Finding them and a work email is the real skill."],
                ["Check the rent before you say yes", "A shared PG runs about 5,000 to 12,000 rupees a month. Weigh the stipend against rent and commute, and ask about hybrid."],
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
              <Link to="/reports/how-to-get-an-internship-india-2026" className="related-card">
                <div className="rc-kicker">Internships</div>
                <div className="rc-title">How to Get an Internship in India in 2026: Where to Look and What It Pays</div>
              </Link>
              <Link to="/reports/internships-bangalore-2026" className="related-card">
                <div className="rc-kicker">Bangalore</div>
                <div className="rc-title">How to Get an Internship in Bangalore in 2026</div>
              </Link>
              <Link to="/reports/internships-hyderabad-2026" className="related-card">
                <div className="rc-kicker">Hyderabad</div>
                <div className="rc-title">How to Get an Internship in Hyderabad in 2026</div>
              </Link>
            </div>
          </div>

          <StuCta via="report-internships-pune-2026" place="report-end" size="card" title="Want a Pune internship that actually leads somewhere?" line="Tell Stu the field, the area of Pune and the stipend you want in one short call. Stu finds internships that fit you, finds the founder, team lead or manager who is hiring and writes the email to them, sent from your own inbox once you start." />
        </div>
      </main>
      <Footer />
    </>
  );
}
