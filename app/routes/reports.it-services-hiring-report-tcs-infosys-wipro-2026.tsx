import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The IT Services Hiring Report 2026: TCS, Infosys, Wipro and How Freshers Get In | Studojo" },
    { name: "description", content: "How freshers get into TCS, Infosys, Wipro and Cognizant in 2026: the entry exams (NQT, Elite, GenC), reported pay ranges, how to clear them, and the bench." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "TCS NQT 2026, Infosys fresher hiring, Wipro Elite, how to get into TCS, IT services fresher salary, mass hiring india, cognizant genc, TCS vs Infosys salary" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/it-services-hiring-report-tcs-infosys-wipro-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The IT Services Hiring Report 2026: TCS, Infosys, Wipro and How Freshers Get In" },
    { property: "og:description", content: "The entry exams, the reported pay bands, how to clear them, and what the bench and the first two years really look like at India's IT services majors." },
    { property: "og:url", content: `${BASE_URL}/reports/it-services-hiring-report-tcs-infosys-wipro-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-16T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The IT Services Hiring Report 2026 | Studojo" },
    { name: "twitter:description", content: "TCS NQT, Wipro Elite, Cognizant GenC and Infosys: how freshers get in, what it pays, and what the bench means." },
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

  // Chart 1: relative fresher intake (illustrative)
  const scaleEl = document.getElementById("itsScaleChart") as HTMLCanvasElement | null;
  if (scaleEl && !scaleEl.dataset.rendered) {
    scaleEl.dataset.rendered = "1";
    new Chart(scaleEl, {
      type: "bar",
      data: {
        labels: ["TCS", "Infosys", "Wipro", "Cognizant", "HCLTech", "Tech Mahindra"],
        datasets: [{
          label: "Relative fresher intake (1-5)",
          data: [5, 4, 3, 4, 3, 2],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET2, VIOLET3, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` Relative scale: ${ctx.raw}/5 (illustrative)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 12 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 2: base vs premium offer tiers (illustrative)
  const payEl = document.getElementById("itsPayChart") as HTMLCanvasElement | null;
  if (payEl && !payEl.dataset.rendered) {
    payEl.dataset.rendered = "1";
    new Chart(payEl, {
      type: "bar",
      data: {
        labels: ["Standard mass-hiring role", "Digital / premium role", "Top tier prime role"],
        datasets: [{
          label: "Reported base CTC, index (illustrative)",
          data: [100, 180, 250],
          backgroundColor: [VIOLET3, VIOLET2, VIOLET],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` Index: ${ctx.raw} (standard = 100, illustrative)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, ticks: { font: { size: 12 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: where prep time pays off (illustrative)
  const prepEl = document.getElementById("itsPrepChart") as HTMLCanvasElement | null;
  if (prepEl && !prepEl.dataset.rendered) {
    prepEl.dataset.rendered = "1";
    new Chart(prepEl, {
      type: "doughnut",
      data: {
        labels: ["Aptitude and reasoning", "Coding basics", "Communication and interview", "CS fundamentals"],
        datasets: [{
          data: [35, 30, 20, 15],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw}% of prep time (suggested)` } },
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
    q: "What is the TCS NQT?",
    a: "The TCS NQT (National Qualifier Test) is the standardized exam TCS uses to screen freshers. It tests aptitude, reasoning, verbal ability and basic coding, and your score decides which hiring track you can interview for. It is the main front door to TCS, and other employers also accept NQT scores.",
  },
  {
    q: "How much does a TCS or Infosys fresher earn?",
    a: "Reported base CTC for standard fresher roles at TCS and Infosys clusters in the low single-digit lakhs per year, with premium or digital offers reported higher. Exact figures change by role, year and campus, so check the current offer letter or the company's hiring page. Treat any single number you see online as a range, not a promise.",
  },
  {
    q: "Which is better for freshers, TCS or Infosys?",
    a: "Neither wins on every count. Both hire at huge scale through standardized tests, and pay for standard roles is reported in a similar band. The better choice is the one that offers the higher tier (digital or prime) and a project in a stack you want to learn, so compare the role and the offer, not the logo.",
  },
  {
    q: "How do I prepare for IT services hiring exams?",
    a: "Spend most of your time on aptitude and basic coding, then practise speaking clearly. These exams reward speed and accuracy on standard question types, so timed practice beats long theory. Do mock tests, solve easy and medium coding problems, and rehearse a short self-introduction out loud.",
  },
  {
    q: "Is an IT services job good for freshers?",
    a: "It is a solid start if you want a stable first job, structured training and a way in without a top-tier college. The trade-offs are base pay that starts low and a first project you may not choose. It works best when you treat the first two years as paid learning and keep building skills.",
  },
  {
    q: "What is the bench in IT services?",
    a: "The bench is the period when you are trained or between client projects and not yet billed to one. It is a normal part of services hiring, especially for freshers after training. It can last weeks or longer, so use the time to learn the stack, earn a certification and ask your manager for a project.",
  },
];

export default function ITServicesHiringReport() {
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
        "headline": "The IT Services Hiring Report 2026: TCS, Infosys, Wipro and How Freshers Get In",
        "description": "How freshers get into India's IT services majors in 2026: the entry exams, reported pay ranges, how to clear them, and what the bench means.",
        "url": `${BASE_URL}/reports/it-services-hiring-report-tcs-infosys-wipro-2026`,
        "datePublished": "2026-10-16T00:00:00Z",
        "dateModified": "2026-10-16T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/it-services-hiring-report-tcs-infosys-wipro-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "IT Services Hiring Report 2026", "item": `${BASE_URL}/reports/it-services-hiring-report-tcs-infosys-wipro-2026` },
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
              <span>IT Services Hiring Report 2026</span>
            </nav>
            <h1>How Freshers Get Into <em>IT Services</em></h1>
            <p className="rpt-hero-sub">
              TCS, Infosys, Wipro and Cognizant hire more freshers than anyone else in
              India, and they do it through standardized tests. This report covers the
              entry exams, the reported pay bands, how to clear them, and the bench.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Entry exams, pay, the bench</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>These firms hire <strong>the most freshers in India</strong>, and they do it through standardized tests rather than résumé screens.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>TCS NQT, Wipro Elite and Cognizant GenC</strong> are the main gates. Infosys runs its own hiring tests and the InfyTQ route.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Base CTC clusters low</strong> for standard roles, while premium and digital offers are reported to pay more.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The <strong>test score and your communication</strong> matter more than your college tier.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The bench and slow early growth are real.</strong> Plan to keep learning through the first two years.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">10,000s</div>
              <div className="sc-label">of freshers onboarded each year by the largest majors (reported, varies by year)</div>
              <div className="sc-source">Company annual reports (reported)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">Low LPA</div>
              <div className="sc-label">typical fresher base CTC band for standard roles (reported range, not a fixed figure)</div>
              <div className="sc-source">Public offer reports (reported range)</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">1 test</div>
              <div className="sc-label">is usually the gate between you and the interview stage</div>
              <div className="sc-source">Company hiring pages</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Who Hires the Most Freshers</div>
                <div className="sec-sub">The mass-hiring machine</div>
              </div>
            </div>
            <p>India's IT services majors are the largest entry point for graduates. TCS, Infosys, Wipro, Cognizant, HCLTech and Tech Mahindra each bring in freshers in big batches, often across hundreds of campuses plus off-campus drives. The model is volume: hire many, train them together, then place them on client projects.</p>
            <p>That is why the process is standardized. A common test lets a company screen a huge pool fairly and fast, and it opens the door to students from colleges no recruiter visits.</p>
            <div className="chart-wrap">
              <div className="chart-label">Relative fresher intake by firm (illustrative, not exact headcount)</div>
              <div style={{ height: 280 }}>
                <canvas id="itsScaleChart" />
              </div>
            </div>
            <div className="highlight">
              The takeaway: these firms are built to say yes to <strong>many</strong> freshers. You do not need a famous college. You need to clear the test.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">The Entry Exams</div>
                <div className="sec-sub">One qualifying test per firm, and what each one screens</div>
              </div>
            </div>
            <p>Each major runs its own gate. Formats and cut-offs change from year to year, so always confirm on the firm's current hiring page before you register.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Firm</th>
                  <th>Test</th>
                  <th>What it screens</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>TCS</strong></td>
                  <td>TCS NQT (National Qualifier Test)</td>
                  <td>Aptitude, reasoning, verbal ability and basic coding</td>
                </tr>
                <tr>
                  <td><strong>Infosys</strong></td>
                  <td>Infosys hiring tests and InfyTQ</td>
                  <td>Logical reasoning, math, verbal, and programming ability</td>
                </tr>
                <tr>
                  <td><strong>Wipro</strong></td>
                  <td>Elite NTH (National Talent Hunt)</td>
                  <td>Aptitude, written communication and coding</td>
                </tr>
                <tr>
                  <td><strong>Cognizant</strong></td>
                  <td>GenC hiring assessment</td>
                  <td>Aptitude, communication and coding for GenC roles</td>
                </tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>Why this matters:</strong> a single qualifying score can open several doors. A strong result keeps you in the running for the higher-paying tracks, not just the standard one.
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">What They Pay</div>
                <div className="sec-sub">Base versus premium and digital, as reported ranges</div>
              </div>
            </div>
            <p>Standard fresher roles at the majors are reported to start in the low single-digit lakhs per year, and the figure has stayed in a narrow band for years. Premium, digital or prime tracks are reported to pay noticeably more, and the test score or interview performance usually decides which track you get.</p>
            <p>Treat every number you read online as a range. Offers differ by role, year, campus and city, and the CTC often includes variable pay and benefits that are not in hand each month.</p>
            <div className="chart-wrap">
              <div className="chart-label">Offer tiers, indexed to a standard role at 100 (illustrative)</div>
              <div style={{ height: 280 }}>
                <canvas id="itsPayChart" />
              </div>
            </div>
            <div className="pull-quote">
              <p>"Read the offer letter, not the headline CTC. The base, the variable and the joining terms are what you actually take home."</p>
              <span className="pq-source">Studojo Research</span>
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">How to Actually Clear Them</div>
                <div className="sec-sub">Aptitude, coding and communication</div>
              </div>
            </div>
            <p>These tests reward preparation more than raw talent. The question types repeat, so timed practice works.</p>
            <div className="chart-wrap">
              <div className="chart-label">Suggested split of prep time (illustrative)</div>
              <div style={{ height: 280 }}>
                <canvas id="itsPrepChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Aptitude first:</strong> quant, logical reasoning and verbal. Practise against a timer, because speed is part of the score.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Coding basics:</strong> arrays, strings, loops and simple logic in one language you know well. Easy and medium problems are enough for most gates.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Communication:</strong> a clear self-introduction and a calm, simple answer to "tell me about a project". This often decides the premium tracks.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>A clean resume:</strong> keep one ready for the interview round. The <Link to="/resume-maker">Studojo resume builder</Link> is free if you need one.</span></div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Bench and the First Two Years</div>
                <div className="sec-sub">What happens after you say yes</div>
              </div>
            </div>
            <p>After joining, most freshers go through training, then wait for a project allocation. The gap between training and a billed project is the bench. It can be short or long depending on demand, your skills and the client mix, and it is a normal part of the services model.</p>
            <p>Early growth is also slow. Raises and promotions follow set cycles, so pay moves gradually. The people who move faster are the ones who pick up in-demand skills, take on responsibility early and say yes to harder projects.</p>
            <div className="callout">
              <strong>Use the bench:</strong> learn the stack your target project uses, finish a certification, and tell your manager you are ready for allocation. Idle time is the cheapest learning time you will get.
            </div>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">Services vs Product in One Paragraph</div>
                <div className="sec-sub">Where this path sits</div>
              </div>
            </div>
            <p>Services firms are the widest door: high volume, structured training, lower starting pay and slower early growth. Product firms hire fewer freshers, screen harder and usually pay more. Many people start in services, build skills, then move. For the full comparison, read <Link to="/reports/service-vs-product-company-report-5-years-later-2026">the service vs product report</Link>.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The IT services questions freshers ask most, answered directly</div>
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
            <p style={{ color: "#3b0764" }}>The exam is the gate, so treat it like one. Then keep your options wider than a single test:</p>
            <div className="blist">
              {[
                ["Register early", "Test windows open and close. Check each firm's hiring page for the current dates."],
                ["Practise on a clock", "Timed mocks in aptitude and coding raise your score faster than reading theory."],
                ["Aim for the higher tier", "A strong score and clear communication can put you on the premium or digital track."],
                ["Do not stop at one door", "Apply to the exams, and also reach hiring managers directly so one result never decides everything."],
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
              <Link to="/reports/service-vs-product-company-report-5-years-later-2026" className="related-card">
                <div className="rc-kicker">Compare</div>
                <div className="rc-title">IT Services vs Startups vs Product Firms, 5 Years Later</div>
              </Link>
              <Link to="/reports/first-job-india-2026" className="related-card">
                <div className="rc-kicker">First job</div>
                <div className="rc-title">What Entry-Level Actually Looks Like in India</div>
              </Link>
              <Link to="/reports/cs-india-2026" className="related-card">
                <div className="rc-kicker">Tech India</div>
                <div className="rc-title">CS in India: What Freshers Are Actually Getting Into</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Do not wait on one exam.</h3>
              <p>Studojo Outreach helps you reach hiring managers and recruiters directly, so a single test result is not your only way in.</p>
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
