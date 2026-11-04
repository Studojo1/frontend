import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Is an MS Abroad Worth It in 2026? ROI for Indian Students in the US, UK, Germany and Canada | Studojo" },
    { name: "description", content: "An MS abroad costs an Indian student roughly ₹24 lakh to ₹1.06 crore in 2026. We compare tuition, living costs, post-study work rights, H-1B odds, graduate pay and loan payback for the US, UK, Germany and Canada." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "is ms in us worth it, is ms abroad worth it 2026, ms in uk worth it for indian students, ms in germany vs us, study abroad roi india, ms abroad cost in rupees, h-1b 100000 fee f-1 students, uk graduate route 18 months, canada pgwp masters, education loan payback ms abroad" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/is-ms-abroad-worth-it-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Is an MS Abroad Worth It in 2026? The ROI for Indian Students in the US, UK, Germany and Canada" },
    { property: "og:description", content: "Total cost in rupees, post-study work rights, H-1B lottery odds, graduate salaries and a worked loan payback example, country by country." },
    { property: "og:url", content: `${BASE_URL}/reports/is-ms-abroad-worth-it-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-09T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Is an MS Abroad Worth It in 2026? | Studojo" },
    { name: "twitter:description", content: "₹24 lakh to ₹1.06 crore, a 35% H-1B lottery, an 18-month UK Graduate Route and a 50% fall in Canadian permits for Indians. The ROI, counted." },
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

  // Chart 1: example total cost in lakh rupees (official tuition plus official living benchmarks, converted at stated rates)
  const costEl = document.getElementById("msaCostChart") as HTMLCanvasElement | null;
  if (costEl && !costEl.dataset.rendered) {
    costEl.dataset.rendered = "1";
    new Chart(costEl, {
      type: "bar",
      data: {
        labels: [
          "US: ASU, 2 years",
          "Canada: U of T MEng, 1 year",
          "UK: Manchester MSc, 1 year",
          "Germany: TUM, 2 years (upper)",
          "Germany: tuition-free public uni, 2 years",
        ],
        datasets: [{
          label: "Total cost, lakh rupees",
          data: [106, 63, 62, 48, 24],
          backgroundColor: [VIOLET, VIOLET2, VIOLET2, VIOLET3, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` about ₹${ctx.raw} lakh` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `₹${v}L` } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: post-study work time in months by route (DHS, UK Home Office, German Residence Act s.20(3), IRCC)
  const workEl = document.getElementById("msaWorkChart") as HTMLCanvasElement | null;
  if (workEl && !workEl.dataset.rendered) {
    workEl.dataset.rendered = "1";
    new Chart(workEl, {
      type: "bar",
      data: {
        labels: ["US OPT, STEM", "Canada PGWP, master's", "UK Graduate Route, before 2027", "UK Graduate Route, from Jan 2027", "Germany job-seeker permit", "US OPT, non-STEM"],
        datasets: [{
          label: "Months",
          data: [36, 36, 24, 18, 18, 12],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, RED, VIOLET2, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` up to ${ctx.raw} months` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK, maxRotation: 45, minRotation: 45 } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: year-on-year change in Indian student numbers by destination (Open Doors 2025, DAAD via PIE News, Home Office via news, IRCC via The Tribune)
  const flowEl = document.getElementById("msaFlowChart") as HTMLCanvasElement | null;
  if (flowEl && !flowEl.dataset.rendered) {
    flowEl.dataset.rendered = "1";
    const vals = [17.5, 10, -15.8, -17, -49.9];
    new Chart(flowEl, {
      type: "bar",
      data: {
        labels: [
          "Germany: Indian students, 2025/26",
          "US: Indian students, 2024/25",
          "UK: study visas to Indians, yr to Jun 2026",
          "US: all new intl students, fall 2025",
          "Canada: study permits to Indians, 2025",
        ],
        datasets: [{
          label: "Change, %",
          data: vals,
          backgroundColor: vals.map((v) => (v >= 0 ? GREEN : RED)),
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw > 0 ? "+" : ""}${ctx.raw}%` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}%` } },
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
    q: "Is an MS in the US worth it for Indian students in 2026?",
    a: "It is worth it mainly for STEM students who can fund it without a crushing loan and who plan around a lottery. US pay is the highest of the four countries (NACE projects $94,212 average starting pay for Class of 2026 computer science master's graduates), and STEM OPT gives up to 36 months of work. But only about 35% of eligible FY2026 H-1B registrations were selected (120,141 of 343,981, USCIS data via Envoy Global), and an example two-year budget at Arizona State comes to roughly ₹1.06 crore at ₹88 to the dollar.",
  },
  {
    q: "How much does an MS abroad cost in Indian rupees?",
    a: "Our worked examples range from about ₹24 lakh to ₹1.06 crore for the full degree, tuition plus living. That is two years at a tuition-free German public university on the €11,904 a year blocked-account benchmark at the low end, and two years at Arizona State ($42,475 a year base tuition for international graduate students, per ASU) at the high end. A one-year MSc at Manchester (£39,400) or MEng at the University of Toronto (CAD 76,090 listed for 2026-27) lands near ₹62 lakh to ₹63 lakh. Exchange rates are our stated assumptions.",
  },
  {
    q: "Is an MS in the UK worth it for Indian students after the Graduate Route cut?",
    a: "It is worth it only if you have a clear plan to land a sponsored job within 18 months. From 1 January 2027, Graduate Route applications get 18 months instead of two years (Home Office Statement of Changes, October 2025), so anyone starting a one-year MSc in 2026 will likely apply in 2027 and get 18 months. To stay on, most graduates need a Skilled Worker job paying at least the £33,400 new-entrant floor, close to the £32,000 to £33,000 median graduate starting salary reported by the Institute of Student Employers.",
  },
  {
    q: "MS in Germany vs US: which is better for Indian students?",
    a: "Germany is far cheaper and lower risk, the US pays more if it works out. Most German public universities charge no tuition, TUM charges non-EU students €4,000 to €6,000 a semester, and graduates get an 18-month job-seeker permit with no lottery. The EU Blue Card needs a salary of €50,700, or €45,934.20 in shortage fields (Federal Employment Agency, 2026). Germany also drew 69,816 Indian students in 2025/26, up 17.5% (DAAD figures reported by The PIE News), while new US graduate enrolment fell.",
  },
  {
    q: "Do F-1 students have to pay the $100,000 H-1B fee?",
    a: "In most cases no, and right now nobody is paying it. USCIS guidance said the fee does not apply to a change of status from F-1 to H-1B inside the US when that change is approved. Separately, a federal court in Massachusetts vacated the policy implementing the fee on 8 June 2026, and USCIS is not collecting it, even though the proclamation was extended on 18 September 2026 through 21 September 2027 (Yale OISS). A separate proposed DHS rule of 25 August 2026 would add a $103,265 fee that could cover change-of-status cases, but it is only a proposal.",
  },
  {
    q: "How long does it take to repay an education loan after an MS abroad?",
    a: "On our assumptions, a 10-year loan works comfortably in the US and Germany if you get a job, and is tight in the UK. A ₹70 lakh loan at an assumed 10% grows to about ₹85 lakh after two years of study, an EMI near ₹1.13 lakh a month over 10 years. A US graduate on NACE's $94,212 average could clear it in about four years by putting all savings into it; a UK graduate on £33,000 would have roughly ₹90,000 a month spare against a ₹73,000 EMI on a ₹50 lakh loan. Without a job abroad, an Indian fresher salary cannot carry these EMIs.",
  },
];

export default function IsMsAbroadWorthItReport() {
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
        "headline": "Is an MS Abroad Worth It in 2026? The ROI for Indian Students in the US, UK, Germany and Canada",
        "description": "Total cost in rupees, post-study work rights, H-1B lottery odds, graduate salaries and a worked loan payback example for Indian students choosing between the US, UK, Germany and Canada.",
        "url": `${BASE_URL}/reports/is-ms-abroad-worth-it-2026`,
        "datePublished": "2026-11-09T00:00:00Z",
        "dateModified": "2026-11-09T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/is-ms-abroad-worth-it-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Is an MS Abroad Worth It in 2026?", "item": `${BASE_URL}/reports/is-ms-abroad-worth-it-2026` },
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
              <span>Is an MS Abroad Worth It, 2026</span>
            </nav>
            <h1>Is an MS Abroad <em>Worth It</em> in 2026? The ROI for Indian Students in the US, UK, Germany and Canada</h1>
            <p className="rpt-hero-sub">
              What the degree costs in rupees, how long each country lets you stay and work,
              what graduates earn, and how long the loan takes to pay back. Built from
              university fee pages, government rules and enrolment data, with every
              assumption stated.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">US · UK · Germany · Canada</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">For</span>
                <span className="rpt-meta-value">Indian students planning a master's</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Data as of</span>
                <span className="rpt-meta-value">Early November 2026</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span>Our worked examples put the <strong>full cost at about ₹24 lakh to ₹1.06 crore</strong>: cheapest at a tuition-free German public university, dearest for two years at a US state university like Arizona State.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The US pays most (NACE projects <strong>$94,212</strong> for 2026 computer science master's grads), but only <strong>about 35%</strong> of eligible FY2026 H-1B registrations were selected, and the lottery is now weighted toward higher wage levels.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The $100,000 H-1B fee proclamation was <strong>extended to September 2027</strong>, but a court vacated its implementing policy and USCIS is not collecting it. F-1 change-of-status cases were exempt in USCIS guidance anyway.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>The <strong>UK Graduate Route drops to 18 months</strong> for applications from 1 January 2027, which catches most students starting a one-year MSc in 2026.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Indians are moving: <strong>study permits from Canada halved</strong> in 2025 (188,715 to 94,605) while Indian students in <strong>Germany rose 17.5%</strong> to 69,816.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">₹24L to ₹1.06Cr</div>
              <div className="sc-label">full cost of our example master's degrees, tuition plus living</div>
              <div className="sc-source">University fee pages, visa funds rules; Studojo calculation</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">35%</div>
              <div className="sc-label">of eligible FY2026 H-1B registrations selected in the lottery</div>
              <div className="sc-source">USCIS data via Envoy Global, 2025</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">-50%</div>
              <div className="sc-label">fall in Canadian study permits issued to Indians, 2025 vs 2024</div>
              <div className="sc-source">IRCC data via The Tribune, Feb 2026</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">What It Actually Costs, in Rupees</div>
                <div className="sec-sub">Tuition from university pages, living costs from visa rules</div>
              </div>
            </div>
            <p>Sticker prices on agent websites are all over the place, so we built each estimate from two official numbers: the university's own published tuition, and the living-cost figure the country's visa rules make you prove you have. Real spending can be higher, especially in big cities, but these are the floors the governments themselves use.</p>
            <p>Our exchange rate assumptions are round numbers: ₹88 to the US dollar, ₹116 to the pound, ₹100 to the euro and ₹63 to the Canadian dollar. Rates move, so redo the sums on the day you apply.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Example</th>
                  <th>Tuition (official)</th>
                  <th>Living benchmark</th>
                  <th>Total, approx</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>US: Arizona State, 2-year MS</td><td>$42,475 a year base tuition for international graduate students (ASU)</td><td>$18,000 a year (our assumption; use your I-20 budget)</td><td>$120,950, about ₹1.06 crore</td></tr>
                <tr><td>Canada: U of T MEng, 1 year</td><td>CAD 76,090 listed for 2026-27 incl. incidental fees (U of T Engineering)</td><td>CAD 23,448 proof of funds from 1 Sep 2026 (IRCC via CIC News)</td><td>CAD 99,538, about ₹63 lakh</td></tr>
                <tr><td>UK: Manchester MSc Advanced CS, 1 year</td><td>£39,400 for 2026 entry (University of Manchester)</td><td>£1,171 a month outside London, times 12 (UKVI)</td><td>£53,452, about ₹62 lakh</td></tr>
                <tr><td>Germany: TUM, 2-year MSc</td><td>€4,000 to €6,000 a semester for non-EU students (TUM)</td><td>€11,904 a year blocked account</td><td>€39,808 to €47,808, about ₹40 lakh to ₹48 lakh</td></tr>
                <tr><td>Germany: tuition-free public uni, 2 years</td><td>Semester contribution only</td><td>€11,904 a year blocked account</td><td>About €24,000, roughly ₹24 lakh plus fees</td></tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">Example total cost of a master's, lakh rupees (Studojo calculation from official fee and funds figures)</div>
              <div style={{ height: 300 }}>
                <canvas id="msaCostChart" />
              </div>
            </div>
            <p>Two caveats. First, the US figure assumes a full two years; some US programs finish in three semesters and many students cut costs with assistantships or cheaper universities, while private schools such as Carnegie Mellon are commonly listed at $60,000 to $65,000 a year in tuition alone on third-party sites. Second, the UK maintenance requirement rises again from 30 November 2026 (Statement of Changes HC 854), so the UK number is a floor.</p>
            <div className="callout">
              <strong>The point:</strong> the same degree title can cost four times as much depending on the country. Germany is the only one of the four where a full master's can come in under ₹30 lakh, and the US is the only one where it routinely crosses ₹1 crore.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: Arizona State University tuition page; University of Toronto Faculty of Engineering, Money Matters (2026-27); University of Manchester course page; TUM tuition fees; UKVI Student visa funds guidance; CIC News on IRCC proof of funds, Aug 2026; blocked-account amount per Expatrio and ApplyBoard; exchange rates are Studojo assumptions.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">How Long Each Country Lets You Stay and Work</div>
                <div className="sec-sub">The post-study window is where the degree pays back</div>
              </div>
            </div>
            <p>An MS abroad only pays off if you earn in that country for a few years. So the most important number after cost is the post-study work window: how long you can work without an employer sponsoring a visa.</p>
            <div className="chart-wrap">
              <div className="chart-label">Maximum post-study work time, months (DHS, UK Home Office, German Residence Act, IRCC)</div>
              <div style={{ height: 300 }}>
                <canvas id="msaWorkChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>US:</strong> 12 months of OPT, plus a 24-month STEM extension, so up to 36 months for STEM degrees. DHS has said it is reviewing OPT and STEM OPT, but as of mid-October 2026 no rule had changed their length (law-firm alerts, including Erickson Immigration Group). Staying longer needs an H-1B, covered in section 3.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>UK:</strong> the Graduate Route gives two years if you apply before 1 January 2027, and 18 months for applications from that date (Statement of Changes HC 1333, October 2025). PhD holders keep three years. Your application date, not your graduation date, decides it.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Germany:</strong> graduates of a German degree can get up to 18 months to look for a job matching their qualification, under Section 20(3) of the Residence Act. The separate Opportunity Card (Chancenkarte) is a 12-month, points-based permit, minimum 6 points, aimed at people applying from abroad.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Canada:</strong> master's graduates can get a Post-Graduation Work Permit of up to three years, even from programs as short as eight months, and degree holders are exempt from the field-of-study list, which IRCC froze for 2026. A language score of CLB 7 is required (summaries by immigration.ca and SiLaw).</span></div>
            </div>
            <div className="highlight">
              The UK change matters more than it looks. A one-year MSc that starts in September 2026 usually finishes in autumn 2027, so that student applies after 1 January 2027 and gets <strong>18 months, not two years</strong>.
            </div>
            <div className="callout">
              <strong>What this means:</strong> the window is your runway to get hired and to earn back the loan. Canada and the US (STEM) give the longest runways on paper, Germany gives 18 months with no lottery at the end, and the UK now gives the shortest. For how hiring abroad actually works from India, see our <Link to="/reports/how-to-get-a-job-abroad-from-india-2026" style={{ color: "#a78bfa" }}>guide to getting a job abroad from India</Link>.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: UK Home Office Statement of Changes HC 1333 via The PIE News and university guidance (Manchester, Birmingham); German Residence Act s.20(3) and Opportunity Card rules via Make it in Germany summaries; IRCC PGWP rules via immigration.ca, CIC News and SiLaw (2026); DHS OPT and STEM OPT rules.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">The US Question: OPT, the H-1B Lottery and the $100,000 Fee</div>
                <div className="sec-sub">Three years of runway, then a draw you do not control</div>
              </div>
            </div>
            <p>Most Indian students who choose the US do it for the long game: OPT, then an H-1B. The trouble is that the H-1B is a lottery. For FY2026, USCIS received 343,981 eligible registrations and selected 120,141, a selection rate of about 35% (USCIS data reported by Envoy Global and Visa Lawyer Blog). That was already better than FY2025, when there were 470,342 eligible registrations.</p>
            <p>From the FY2027 season, the draw changed. A DHS rule that took effect on 27 February 2026 gives each registration one to four entries based on the wage level offered, so a higher-paid offer has better odds than an entry-level one. USCIS confirmed on 31 March 2026 that it had enough registrations to fill the FY2027 cap, but we could not find an official FY2027 selection rate, so treat any figure you see as an estimate. Master's graduates from US universities do still get the separate 20,000-seat advanced degree pool.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>H-1B fee development</th>
                  <th>Status as of early November 2026</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Proclamation of 19 Sept 2025: $100,000 payment on certain new H-1B petitions for workers outside the US</td><td><span className="tag-pill pill-amber">Extended</span> to 21 Sept 2027 by a proclamation signed 18 Sept 2026</td></tr>
                <tr><td>USCIS guidance: fee does not apply to an approved change of status from F-1 to H-1B inside the US</td><td>Applies to most students on OPT; a denied change of status can trigger the fee</td></tr>
                <tr><td>Court challenge</td><td><span className="tag-pill pill-green">Not collected</span> District of Massachusetts vacated the implementing policy on 8 June 2026; First Circuit refused to pause that on 24 July 2026</td></tr>
                <tr><td>Proposed DHS rule of 25 Aug 2026: $103,265 fee on cap-subject petitions, including change of status</td><td>Proposal only, not in effect</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>Plain reading:</strong> if you graduate in the US and switch from OPT to H-1B without leaving, the $100,000 fee is not in play today. The bigger risks are the lottery itself, the weighted draw that favours higher pay, and a proposed fee that could change the maths for employers. Plan for three years of OPT and a real chance of not being selected.
            </div>
            <p>The practical move is to use your OPT years well: target employers who already sponsor, aim for roles that pay above entry wage levels, and start the search during your degree. Our report on <Link to="/reports/us-internships-international-students-2026" style={{ color: "#8B5CF6" }}>US internships for international students</Link> covers how CPT and OPT work for that.</p>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: USCIS FY2026 registration data via Envoy Global and Visa Lawyer Blog; Ogletree and National Law Review on FY2027 selection; Yale OISS, September 2026; USCIS guidance via Columbia ISSO and Holland and Hart.</p>
          </div>
          <StuCta via="report-is-ms-abroad-worth-it-2026" place="report-mid" size="quiet" title="Before you borrow for an MS, see what a job search now looks like: Stu finds roles that fit you and who's hiring." />

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">What Graduates Earn, and the Pay Floors That Matter</div>
                <div className="sec-sub">Salary surveys and the visa thresholds you need to clear</div>
              </div>
            </div>
            <p>Good salary data for international master's graduates is thin, so we used the most credible survey in each country and set it next to the visa salary floor, because a job below the floor usually cannot keep you in the country.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Typical graduate pay</th>
                  <th>Visa pay floor to stay on</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>US</td><td>$94,212 projected average for computer science master's grads, $92,873 for engineering, about $86,563 for business (NACE Winter 2026 Salary Survey)</td><td>H-1B prevailing wage for the role; higher wage levels now get more lottery entries</td></tr>
                <tr><td>UK</td><td>£32,000 to £33,000 median graduate starting salary (Institute of Student Employers, 2025 surveys)</td><td>£41,700 general Skilled Worker threshold; £33,400 for new entrants and recent graduates</td></tr>
                <tr><td>Germany</td><td>No single reliable graduate survey found; reported ranges vary by field</td><td>EU Blue Card: €50,700, or €45,934.20 in shortage occupations, which some sources say also covers recent graduates (Federal Employment Agency, 2026)</td></tr>
                <tr><td>Canada</td><td>No reliable 2026 survey of master's graduate starting pay found</td><td>No fixed floor during the PGWP; permanent residence is the usual next step</td></tr>
              </tbody>
            </table>
            <div className="highlight">
              The UK squeeze in one line: the median graduate salary (£32,000 to £33,000) sits right at the <strong>£33,400 new-entrant floor</strong>. An average graduate job may not be enough to get sponsored.
            </div>
            <p>The NACE figures are employer projections from a survey of about 150 US organisations, not reported offers, and they cover all graduates, not only international ones. Treat them as a ceiling for a typical first job, not a promise. Pay figures you see on Glassdoor or AmbitionBox for specific roles abroad are self-reported and indicative only.</p>
            <div className="callout">
              <strong>Use the floor, not the average:</strong> when you shortlist jobs, check the visa salary floor first. A role that pays below it is a short-term job, not a path to staying.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: NACE Winter 2026 Salary Survey (naceweb.org); Institute of Student Employers Student Recruitment Survey and Student Development Survey 2025; GOV.UK review of salary requirements; Bundesagentur für Arbeit, EU Blue Card 2026.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Loan Payback Maths, Worked Through</div>
                <div className="sec-sub">Three examples, every assumption on the table</div>
              </div>
            </div>
            <p>Here is how the numbers play out for a student who borrows most of the cost. These are illustrations, not quotes from a bank. Our assumptions: a 10% interest rate, a 10-year repayment term, interest building up during the course (the degree length, compounded monthly), and the exchange rates from section 1. Take-home pay and monthly living costs after graduation are also our assumptions, marked below.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>US (STEM MS)</th>
                  <th>UK (1-year MSc)</th>
                  <th>Germany (public uni)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Loan taken</td><td>₹70 lakh</td><td>₹50 lakh</td><td>₹30 lakh</td></tr>
                <tr><td>Owed at graduation (interest during study)</td><td>about ₹85 lakh after 2 years</td><td>about ₹55 lakh after 1 year</td><td>about ₹37 lakh after 2 years</td></tr>
                <tr><td>EMI over 10 years at 10%</td><td>about ₹1.13 lakh a month</td><td>about ₹73,000 a month</td><td>about ₹48,000 a month</td></tr>
                <tr><td>Gross salary used</td><td>$94,212 (NACE projection)</td><td>£33,000 (ISE median)</td><td>€45,934 (Blue Card shortage floor)</td></tr>
                <tr><td>Take-home a month (our estimate)</td><td>about $5,650 (72% of gross)</td><td>about £2,273 (after UK income tax and NI)</td><td>about €2,410 (63% of gross)</td></tr>
                <tr><td>Living costs a month (our assumption)</td><td>$3,000</td><td>£1,500</td><td>€1,200</td></tr>
                <tr><td>Left over a month</td><td>about ₹2.3 lakh</td><td>about ₹90,000</td><td>about ₹1.2 lakh</td></tr>
                <tr><td>Verdict</td><td><span className="tag-pill pill-green">Comfortable if employed</span></td><td><span className="tag-pill pill-amber">Tight</span></td><td><span className="tag-pill pill-green">Comfortable if employed</span></td></tr>
              </tbody>
            </table>
            <p>In the US example, putting all ₹2.3 lakh a month toward the loan would clear about ₹85 lakh in roughly four years, inside a 36-month STEM OPT window plus one more year, which is exactly why the H-1B draw matters. In the UK example, the margin over the EMI is about ₹17,000 a month, and the 18-month Graduate Route leaves little time before you need a sponsored job. In Germany, a smaller loan and no lottery make the sums the most forgiving, but the job search usually needs working German for roles outside tech.</p>
            <div className="pull-quote">
              <p>"The degree is not what repays the loan. The first two years of salary abroad are. If those years are at risk, so is the whole investment."</p>
              <span className="pq-source">The takeaway from the payback maths</span>
            </div>
            <div className="callout">
              <strong>The stress test:</strong> rerun the table with no job abroad. Every EMI above is larger than a typical Indian fresher's monthly salary, so the real question is not "is the degree good" but "how likely am I to be employed abroad within six months of graduating".
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: Studojo calculation. Salary inputs from NACE Winter 2026, ISE 2025 and Bundesagentur für Arbeit 2026; interest rate, tax shares, living costs and exchange rates are stated assumptions, not lender quotes.</p>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">Where Indian Students Are Actually Going Now</div>
                <div className="sec-sub">Canada down sharply, Germany up, the US and UK cooling</div>
              </div>
            </div>
            <p>The Ministry of External Affairs told the Rajya Sabha that over 18.8 lakh Indian students were abroad, with about 4.27 lakh in Canada, 2.55 lakh in the US, 1.73 lakh in the UK and about 59,000 in Germany. ICEF Monitor, reading MEA data, reports that the number of Indians abroad fell about 5.7% in 2025, the first drop after three years of growth. Counts differ by source because some measure students present and others measure new arrivals.</p>
            <div className="chart-wrap">
              <div className="chart-label">Year-on-year change, Indian student numbers by destination (mixed measures, see source line)</div>
              <div style={{ height: 300 }}>
                <canvas id="msaFlowChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>US:</strong> Open Doors 2025 counted 363,019 Indian students in 2024/25, up 10%, and India stayed the top source. But new international enrolment fell 17% in fall 2025 and new graduate enrolment fell sharply, with institutions citing visa concerns (IIE).</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>UK:</strong> Indians still lead UK study visas, but grants fell to 82,523 in the year to June 2026 from 98,014 a year earlier, about 16% lower (Home Office statistics as reported by Indian and UK media).</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Germany:</strong> Indian students rose from 49,483 in 2023/24 to 59,419 in 2024/25 and 69,816 in 2025/26, the largest international group (DAAD and Destatis figures reported by The PIE News).</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Canada:</strong> study permits issued to Indians fell from 188,715 in 2024 to 94,605 in 2025 (IRCC via The Tribune). The 2026 levels plan allows 155,000 new student permits, and master's and PhD students at public institutions no longer need a provincial attestation letter from 1 January 2026.</span></div>
            </div>
            <div className="callout">
              <strong>Read the shift carefully:</strong> fewer Indians going to Canada partly reflects Canada's caps, not just student choice. For master's students at public universities, Canada actually got easier in 2026. Do not pick a country because everyone else is leaving or arriving.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: MEA reply to Rajya Sabha via Free Press Journal; ICEF Monitor, December 2025; IIE Open Doors 2025 press release; UK Home Office immigration statistics via Business Today and newswire coverage; DAAD India via The PIE News; IRCC via The Tribune, February 2026; CIC News on the 2026 study permit cap.</p>
          </div>

          {/* Section 7 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">7</div>
              <div>
                <div className="sec-title">Who It Is Worth It For, and Who Should Wait</div>
                <div className="sec-sub">The same degree is a great bet for some and a bad one for others</div>
              </div>
            </div>
            <p>Put the cost, the work window and the payback maths together and a pattern shows up. The ROI depends less on the country than on how much you borrow and how employable you are in that market on day one.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Likely worth it</th>
                  <th>Think twice</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>STEM students in high-demand fields (CS, data, engineering) heading to the US, with family funds covering a good part of the cost</td><td>Non-STEM US master's with a large loan: only 12 months of OPT before you need an H-1B</td></tr>
                <tr><td>Students willing to learn German, choosing a tuition-free public university in Germany</td><td>Expensive private German programs that cost as much as the UK without the same outcomes</td></tr>
                <tr><td>Master's students at public Canadian universities who want a three-year PGWP and a route to permanent residence</td><td>Students relying on short college programs or private institutions still under the cap</td></tr>
                <tr><td>UK MSc students with internships or a clear target employer that sponsors at £33,400 or more</td><td>A one-year UK MSc funded entirely by a ₹50 lakh loan, with no job plan for the 18-month window</td></tr>
                <tr><td>People with two or more years of work experience who can command higher wage levels</td><td>Freshers going abroad mainly because Indian placements went badly, with no stronger plan abroad</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>One rule of thumb:</strong> if your total loan is more than your realistic first-year gross salary abroad, the plan depends on everything going right. Either cut the cost (Germany, scholarships, cheaper universities) or raise your odds of a job before you board the flight.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>Source: Studojo analysis of sections 1 to 6.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The questions Indian students ask about MS abroad ROI, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to decide, and how to protect the investment</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>If you are weighing an MS abroad in 2026, work through it in this order:</p>
            <div className="blist">
              {[
                ["Price the whole degree", "Use the university's own fee page and the visa funds rule, in rupees. Anything above ₹60 lakh needs a very clear job plan."],
                ["Match the window to your field", "STEM in the US or a master's in Canada gives up to 36 months. The UK now gives 18 months from 2027. Germany gives 18 months with no lottery."],
                ["Check the pay floor first", "A job below the Skilled Worker or Blue Card threshold, or at the lowest H-1B wage level, is a weaker path to staying."],
                ["Run the no-job scenario", "If the EMI is bigger than an Indian fresher salary, borrow less or pick a cheaper country."],
                ["Start the job hunt in semester one", "The people who make the ROI work usually have conversations going with hiring managers long before graduation, not after."],
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
              <Link to="/reports/us-internships-international-students-2026" className="related-card">
                <div className="rc-kicker">US</div>
                <div className="rc-title">US Internships for International Students 2026: CPT, OPT and How to Get Hired</div>
              </Link>
              <Link to="/reports/how-to-get-a-job-abroad-from-india-2026" className="related-card">
                <div className="rc-kicker">Abroad</div>
                <div className="rc-title">How to Get a Job Abroad From India, 2026</div>
              </Link>
              <Link to="/reports/internships-germany-2026" className="related-card">
                <div className="rc-kicker">Germany</div>
                <div className="rc-title">Do Interns in Germany Get Paid? Stipends, Laws and What to Expect</div>
              </Link>
            </div>
          </div>
          <StuCta via="report-is-ms-abroad-worth-it-2026" place="report-end" size="card" title="Weighing a job now against an MS later?" line="Tell Stu the role, the city and the pay you want in one short call. Stu finds jobs that fit you, finds who's hiring and writes the email to them." />
        </div>
      </main>
      <Footer />
    </>
  );
}
