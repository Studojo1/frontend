import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The CTC Illusion Report: What a 12 LPA Offer Actually Pays In Hand | Studojo" },
    { name: "description", content: "A 12 LPA offer pays about 74,000 a month in hand. We break down PF, gratuity, variable pay, joining bonuses, ESOPs and tax across five offer types." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "ctc vs in hand salary, 12 lpa in hand salary, ctc breakdown india 2026, variable pay tax india, new labour code in hand salary, esop tax india freshers" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/ctc-illusion-report-what-12-lpa-pays-in-hand-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The CTC Illusion Report: What a 12 LPA Offer Actually Pays In Hand" },
    { property: "og:description", content: "A 12 LPA offer pays about 74,000 a month. An 18 LPA and a 20 LPA offer pay almost the same in hand. Here is the maths recruiters skip." },
    { property: "og:url", content: `${BASE_URL}/reports/ctc-illusion-report-what-12-lpa-pays-in-hand-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-12T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The CTC Illusion Report: What a 12 LPA Offer Actually Pays In Hand | Studojo" },
    { name: "twitter:description", content: "Your 12 LPA offer pays 74,000 a month. Your friend's 20 LPA startup offer pays 99,000, not 1.67 lakh. Where the rest of CTC actually goes." },
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
  const MUTED  = "#737373";
  const INK    = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  const ctcSplitChartEl = document.getElementById("ctcSplitChart") as HTMLCanvasElement | null;
  if (ctcSplitChartEl && !ctcSplitChartEl.dataset.rendered) {
    ctcSplitChartEl.dataset.rendered = "1";
    new Chart(ctcSplitChartEl, {
      type: "doughnut",
      data: {
        labels: ["Monthly in-hand salary x 12 (73.8%)", "Variable pay, if paid in full (8.3%)", "Your PF contribution (5.3%)", "Employer PF contribution (5.3%)", "Joining bonus, one time (4.2%)", "Gratuity provision (2.1%)", "Insurance and professional tax (1.0%)"],
        datasets: [{
          data: [73.8, 8.3, 5.3, 5.3, 4.2, 2.1, 1.0],
          backgroundColor: ["#10b981", "#f59e0b", "#8B5CF6", "#a78bfa", "#fcd34d", "#737373", "#d4d4d4"],
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

  const inHandShareChartEl = document.getElementById("inHandShareChart") as HTMLCanvasElement | null;
  if (inHandShareChartEl && !inHandShareChartEl.dataset.rendered) {
    inHandShareChartEl.dataset.rendered = "1";
    new Chart(inHandShareChartEl, {
      type: "bar",
      data: {
        labels: ["IT services entry offer, 3.6 LPA", "IT services elite track, 7 LPA", "Typical mid offer, 12 LPA", "Product company offer, 18 LPA", "Funded startup offer with ESOPs, 20 LPA"],
        datasets: [{
          label: "Monthly in-hand pay as a share of headline CTC divided by 12 (Studojo model)",
          data: [84.9, 76.7, 73.9, 66.9, 59.4],
          backgroundColor: ["#10b981", "#10b981", "#f59e0b", "#f59e0b", "#ef4444"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 100.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }
}

const reportCSS = `
  .rpt-hero { background: #171717; padding: 64px 0 52px; border-bottom: 3px solid #171717; position: relative; overflow: hidden; }
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #f59e0b; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #f59e0b; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }
  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #f59e0b; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
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
  .callout { background: #171717; border-radius: 12px; padding: 20px 24px; margin: 20px 0; font-size: 14px; color: #d4d4d4; line-height: 1.65; font-weight: 500; }
  .callout strong { color: #8B5CF6; }
  .callout-amber { background: #fffbeb; border: 1.5px solid #fcd34d; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #92400e; line-height: 1.6; }
  .callout-red { background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #b91c1c; line-height: 1.6; }
  .callout-green { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #065f46; line-height: 1.6; }
  .pull-quote { border-left: 4px solid #8B5CF6; padding: 16px 24px; margin: 22px 0; background: #faf5fe; border-radius: 0 12px 12px 0; }
  .pull-quote p { font-size: 16px !important; font-weight: 600 !important; color: #3b0764 !important; font-style: italic; margin: 0 !important; }
  .pq-source { font-size: 12px; color: #8B5CF6; font-weight: 600; margin-top: 8px; display: block; }
  .blist { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
  .blist-item { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #404040; line-height: 1.6; }
  .blist-dot { width: 7px; height: 7px; border-radius: 50%; background: #8B5CF6; flex-shrink: 0; margin-top: 7px; }
  .chart-wrap { margin: 24px 0; }
  .chart-label { font-size: 12px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .takeaway-section { background: #faf5fe; border: 2px solid #c4b5fd; border-radius: 20px; box-shadow: 4px 4px 0 #c4b5fd; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }
  .rpt-cta { background: #f59e0b; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #f59e0b; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #f59e0b; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #f59e0b; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
  .faq-section { background: #fff; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #171717; padding: 40px 48px; }
  .faq-item { border-bottom: 1px solid #f0f0f0; padding: 18px 0; }
  .faq-item:first-of-type { padding-top: 0; }
  .faq-item:last-child { border-bottom: none; padding-bottom: 0; }
  .faq-q { font-size: 16px; font-weight: 700; color: #171717; line-height: 1.4; margin-bottom: 8px; }
  .faq-a { font-size: 14px; color: #404040; line-height: 1.7; }
  .faq-a strong { color: #6d28d9; }
  .related { background: #fff; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #171717; padding: 32px 40px; margin-top: 4px; }
  .related h2 { font-size: 13px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
  .related-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  @media (max-width: 640px) { .related-grid { grid-template-columns: 1fr; } .faq-section { padding: 28px 20px; } .related { padding: 24px 20px; } }
  .related-card { display: block; border: 1.5px solid #e5e5e5; border-radius: 12px; padding: 16px 18px; text-decoration: none; transition: border-color .15s; }
  .related-card:hover { border-color: #8B5CF6; }
  .related-card .rc-kicker { font-size: 10px; font-weight: 700; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .related-card .rc-title { font-size: 14px; font-weight: 600; color: #171717; line-height: 1.4; }
`;

const FAQ = [
  { q: "How much do you actually get in hand on a 12 LPA salary?", a: "A typical 12 LPA fresher offer pays about 73,900 a month in hand, roughly 74% of the 1 lakh a month the headline implies. The model assumes 10.5 lakh fixed, 1 lakh variable and a 50,000 joining bonus, with the new tax regime and Bengaluru professional tax. Your own offer will differ, so use the method rather than just the numbers." },
  { q: "Why is my in-hand salary lower than CTC divided by 12?", a: "CTC is the total the company budgets for you, not your monthly salary. It includes employer PF, a gratuity provision, insurance premiums, variable pay and often a one-time joining bonus. About a quarter of a 12 LPA offer is money that is saved for you, conditional or one-time, and only the monthly credit is guaranteed cash." },
  { q: "How did the new labour codes change take-home pay?", a: "Under the labour codes in force from 21 November 2025, wages (basic plus DA) must be at least 50% of total pay. A higher basic means a higher PF deduction and a higher employer PF charge inside the same CTC. Business Today's calculator showed annual in-hand at a 15 lakh CTC falling from about 12.43 lakh to about 11.79 lakh, with the difference moving into PF and gratuity." },
  { q: "Is variable pay taxed heavily on a 20 LPA offer?", a: "It can be. Under the new regime, taxable income up to 12 lakh gets effectively zero tax through the Section 87A rebate. In the report's 20 LPA startup model, a 2 lakh variable payout pushes taxable income to about 14.07 lakh and adds about 87,000 of tax, so 44% of that bonus goes to tax." },
  { q: "Do ESOPs and joining bonuses count as salary?", a: "No. A joining bonus is one-time and often carries a clawback if you leave within about 12 months. ESOPs usually vest over four years with a one-year cliff, so nothing vests in your first year. In the 20 LPA startup model, guaranteed monthly in-hand is about 99,000, or 59% of the 1.67 lakh a month the headline implies." },
  { q: "How should I compare two job offers?", a: "Convert each offer to guaranteed monthly in-hand pay before comparing. Ask for the annexure that lists every component, then work down from monthly gross, minus your PF, professional tax and estimated TDS. Treat variable pay, the joining bonus and ESOPs as separate bets, because two offers 2 lakh apart on paper can pay almost the same each month." },
];

export default function Report_CtcIllusionReportWhat12LpaPaysInHand2026() {
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
        "headline": "The CTC Illusion Report: What a 12 LPA Offer Actually Pays In Hand",
        "description": "A 12 LPA offer pays about 74,000 a month in hand. We break down PF, gratuity, variable pay, joining bonuses, ESOPs and tax across five offer types.",
        "url": `${BASE_URL}/reports/ctc-illusion-report-what-12-lpa-pays-in-hand-2026`,
        "datePublished": "2026-10-12T00:00:00Z",
        "dateModified": "2026-10-12T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/ctc-illusion-report-what-12-lpa-pays-in-hand-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The CTC Illusion Report: What a 12 LPA Offer Actually Pays In Hand", "item": `${BASE_URL}/reports/ctc-illusion-report-what-12-lpa-pays-in-hand-2026` },
        ],
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ.map((f) => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">{"Studojo Research · October 2026"}</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>{"The CTC Illusion Report: What a 12 LPA Offer Actually Pays In Hand"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The CTC Illusion Report:<br /><em>Your 12 LPA Offer Pays 74,000 a Month</em>" }} />
            <p className="rpt-hero-sub">{"Recruiters quote CTC because it is the biggest number they can legally put on the page. A typical 12 LPA offer pays about 73,900 a month in hand. A 20 LPA startup offer with ESOPs pays about 99,000. We modelled five common fresher offers under the new labour codes and the new tax regime to show exactly where the rest goes."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India · Fresher and early-career offers"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Data / Explainer"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">{"October 2026"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Prepared by</span>
                <span className="rpt-meta-value">Studojo Research</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rpt-body">
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">{"74%"}</div>
              <div className="sc-label">{"Share of a typical 12 LPA headline that reaches your bank account as monthly salary"}</div>
              <div className="sc-source">{"Studojo offer model, new tax regime, Bengaluru, 2026"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"44%"}</div>
              <div className="sc-label">{"Share of a 2 lakh variable payout lost to tax when it pushes taxable income past the 12 lakh rebate line"}</div>
              <div className="sc-source">{"Studojo calculation, new tax regime slabs and Section 87A rebate"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"50%"}</div>
              <div className="sc-label">{"Minimum share of total pay that must count as wages (basic + DA) under the labour codes in force from 21 Nov 2025"}</div>
              <div className="sc-source">{"Code on Wages, effective 21 November 2025"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"CTC is a sum, not a salary"}</div>
                <div className="sec-sub">{"What actually sits inside a 12 LPA headline"}</div>
              </div>
            </div>
            <p>{"A 12 LPA offer sounds like 1 lakh a month. It is not. CTC is the total the company budgets for you in a year. That includes money you never see monthly: the employer's PF contribution, a gratuity provision you only receive after about five years, group insurance premiums, a variable bonus that depends on ratings, and often a one-time joining bonus that disappears in year two."}</p>
            <p>{"We modelled a typical 12 LPA fresher offer: 10.5 lakh fixed, 1 lakh variable, and a 50,000 joining bonus. Basic pay is set at half of fixed pay, as the new labour codes now require. PF is 12% of basic on both sides, there is no PF wage cap, and the employee is in Bengaluru under the new tax regime. The result is a monthly credit of about 73,900. That is 74% of the 1 lakh a month the headline implies."}</p>
            <p>{"The good news is that a 12 LPA package pays almost no income tax under the new regime. Taxable salary stays under the 12 lakh line where the Section 87A rebate brings tax to zero. The gap between headline and in-hand at this level is almost entirely deferred money and conditional money, not tax."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" About a quarter of a 12 LPA offer is money that is either saved on your behalf (PF, gratuity), conditional (variable), or one-time (joining bonus). Only the monthly credit is guaranteed cash."}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"Where a typical 12 LPA offer goes in year one (Studojo model)"}</div>
              <div style={{ height: 300 }}>
                <canvas id="ctcSplitChart" />
              </div>
            </div>

            <div className="callout"><strong>{"Model assumptions:"}</strong>{" New tax regime with 75,000 standard deduction, 4% cess, professional tax of 200 a month, basic at 50% of fixed pay, PF uncapped at 12%, gratuity at 4.81% of basic. Your offer will differ. Use the method, not just the numbers."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"The 50% rule: why in-hand pay fell at the same CTC"}</div>
                <div className="sec-sub">{"How the labour codes moved money from your account into PF"}</div>
              </div>
            </div>
            <p>{"Until late 2025 many Indian employers kept basic pay at 30% to 40% of CTC and paid the rest as allowances. A low basic meant low PF and gratuity contributions, so more of the CTC landed in the monthly salary. The four labour codes that came into force on 21 November 2025 changed that. Wages, meaning basic plus DA, must now be at least 50% of total pay."}</p>
            <p>{"A higher basic means a higher PF deduction from your salary and a higher employer PF charge inside the same CTC. Business Today's November 2025 salary calculator showed annual in-hand pay at a 15 lakh CTC falling from about 12.43 lakh to about 11.79 lakh under the new structure. Nobody's CTC went down. The share paid out monthly did."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" The money did not vanish. It moved into your PF account and a larger gratuity base. But if you compare offers by monthly cash, two identical CTCs can now differ by several thousand rupees a month."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Gratuity got bigger and closer."}</strong> {"It is now calculated on the higher wage base, and the codes extend gratuity to fixed-term employees after one year instead of five."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"PF is real money, just locked."}</strong> {"Employee and employer PF together are roughly a tenth of a typical CTC. It earns interest and can be withdrawn under specific conditions, but it will not pay your rent."}</span>
              </div>
            </div>

            <div className="callout-amber"><strong>{"What to ask:"}</strong>{" Whether PF is calculated on full basic or capped at the 15,000 statutory wage ceiling. A capped structure leaves you noticeably more cash each month, with a smaller retirement corpus."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Variable pay and the 12 lakh rebate cliff"}</div>
                <div className="sec-sub">{"Why a bonus can be taxed at more than 40%"}</div>
              </div>
            </div>
            <p>{"Variable pay is the most misunderstood line in a fresher offer. It is usually tied to your rating and the company's results, it is often paid quarterly or annually rather than monthly, and many companies pay less than 100% in a weak year. Treat it as a possibility, not part of your salary."}</p>
            <p>{"There is also a tax trap. Under the new regime, taxable income up to 12 lakh carries effectively zero tax because of the Section 87A rebate. Above that line, the rebate disappears and slab tax applies to the whole income, with only narrow marginal relief just above the line. In our 20 LPA startup model, the fixed salary alone produces taxable income of about 12.07 lakh, and the tax on it is about 7,600 for the year. A 2 lakh variable payout pushes taxable income to about 14.07 lakh and the tax bill to about 94,700. The extra 87,000 of tax means 44% of that bonus goes to tax."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Around the 12 lakh line, extra variable pay is taxed at a far higher effective rate than the slab table suggests. A larger fixed salary with a smaller variable is often worth more than the headline implies."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Ask for the payout history."}</strong> {"What percentage of target variable did people at your level actually receive in the last two cycles? A recruiter who will not answer has answered."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Check the payout schedule."}</strong> {"Annual variable paid after the appraisal cycle means a fresher joining in July may not see any of it for over a year, or may receive a pro-rated amount."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Check what triggers forfeiture."}</strong> {"Many policies pay variable only to employees still on the rolls on the payout date. Leave a week early and the money stays with the company."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"Joining bonuses and ESOPs: money with conditions"}</div>
                <div className="sec-sub">{"The two components that inflate first-year CTC the most"}</div>
              </div>
            </div>
            <p>{"Joining bonuses make the first-year number look bigger, but they are one-time. In our 12 LPA model, the 50,000 joining bonus means the year-two CTC is really 11.5 lakh before any hike. Most joining bonus clauses also include a clawback: leave within a set period, commonly 12 months, and you repay some or all of it."}</p>
            <p>{"ESOPs are the biggest gap between headline and cash. A startup that quotes 20 LPA including 4 lakh a year of ESOPs is usually quoting the value of options at the last funding round, vesting over four years with a one-year cliff. Nothing vests in your first year. When you exercise, the gap between fair market value and your exercise price is taxed as salary, even though you cannot sell the shares. Employees of eligible DPIIT-recognised startups can defer that tax, but they still owe it later."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" In our 20 LPA startup model, guaranteed monthly in-hand is about 99,000, which is 59% of the 1.67 lakh a month the headline implies. The ESOP slice may be worth a lot or nothing, and you will not know for years."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Read the ESOP grant letter, not the offer letter."}</strong> {"You need the number of options, exercise price, vesting schedule, cliff, exercise window after leaving, and whether buybacks have ever happened."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Short exercise windows are a hidden cost."}</strong> {"If you must exercise within 90 days of leaving, you may need to pay the exercise price and the perquisite tax in cash for shares you cannot sell."}</span>
              </div>
            </div>

            <div className="callout-green"><strong>{"Rule of thumb:"}</strong>{" Compare offers on guaranteed annual cash (monthly in-hand x 12), then treat variable, joining bonus and ESOPs as separate bets with their own odds."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"Five offers compared: the bigger the headline, the smaller the share"}</div>
                <div className="sec-sub">{"Monthly in-hand pay as a share of headline CTC"}</div>
              </div>
            </div>
            <p>{"We ran the same method across five offer types that freshers commonly see. A 3.6 LPA IT services entry offer with no variable pays about 25,500 a month, which is 85% of the headline monthly figure. A 7 LPA elite-track offer with 10% variable pays about 44,700, or 77%. The 12 LPA mid offer pays about 73,900, or 74%."}</p>
            <p>{"Above that, the share falls fast. An 18 LPA product company offer (15 lakh base, 10% bonus, 1.5 lakh sign-on) pays about 1,00,300 a month, or 67%, because base salary alone crosses the rebate line and slab tax starts. A 20 LPA startup offer that includes 4 lakh of ESOPs pays about 99,000, or 59%. On guaranteed monthly cash, the 18 LPA and 20 LPA offers are almost the same."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" A 2 lakh difference in headline CTC can be a near-zero difference in monthly cash. Always convert offers to monthly in-hand before comparing."}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"Monthly in-hand pay as a share of headline CTC divided by 12 (Studojo model)"}</div>
              <div style={{ height: 300 }}>
                <canvas id="inHandShareChart" />
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"6"}</div>
              <div>
                <div className="sec-title">{"How to read an offer letter in ten minutes"}</div>
                <div className="sec-sub">{"The questions that turn CTC into a real number"}</div>
              </div>
            </div>
            <p>{"Ask for the annexure that lists every component, not just the summary. Then work from the top down: monthly gross, minus your PF, minus professional tax, minus estimated monthly TDS. That figure is your salary. Everything else is a benefit, a saving or a bet."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" The question is not how big the CTC is. It is how much arrives every month, how much is locked away for you, and how much depends on things outside your control."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Monthly gross and basic."}</strong> {"Is basic at least 50% of pay, and is PF on full basic or capped?"}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Variable."}</strong> {"Target percentage, payout frequency, last two years' actual payout, and whether you must be employed on the payout date."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Joining bonus."}</strong> {"When is it paid, and what is the clawback period?"}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"ESOPs."}</strong> {"Grant size, strike price, vesting, cliff, post-exit exercise window and buyback history."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Insurance and gratuity."}</strong> {"Are these counted inside CTC? Many offers include them, which inflates the headline without changing your pay."}</span>
              </div>
            </div>
          </div>

          <div className="takeaway-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6d28d9" }}>→</div>
              <div>
                <div className="sec-title" style={{ color: "#3b0764" }}>What This Means For You</div>
                <div className="sec-sub" style={{ color: "#7c3aed" }}>Prioritised action list</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item" key="Compare offers on monthly in-hand, not CTC">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Compare offers on monthly in-hand, not CTC"}.</strong> {"Convert every offer to guaranteed monthly cash before you compare. Two offers 2 lakh apart on paper can pay the same each month."}</span>
              </div>
              <div className="blist-item" key="Discount variable pay and ESOPs">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Discount variable pay and ESOPs"}.</strong> {"Treat them as bets with odds you should ask about. Payout history and vesting terms matter more than the headline value."}</span>
              </div>
              <div className="blist-item" key="Watch the 12 lakh tax line">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Watch the 12 lakh tax line"}.</strong> {"Around 12 lakh of taxable income, extra variable pay can be taxed at over 40%. Fixed pay is usually worth more than an equal amount of variable."}</span>
              </div>
              <div className="blist-item" key="Remember the money that is still yours">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Remember the money that is still yours"}.</strong> {"PF and gratuity are not lost. They are deferred. Count them as savings, not salary."}</span>
              </div>
            </div>
          </div>

          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The questions students ask most about this, answered directly</div>
              </div>
            </div>
            {FAQ.map((f) => (
              <div className="faq-item" key={f.q}>
                <div className="faq-q">{f.q}</div>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>

          <div className="related">
            <h2>Related reports</h2>
            <div className="related-grid">
              <Link to="/reports/salary-negotiation-report-do-freshers-who-negotiate-get-more-2026" className="related-card"><div className="rc-kicker">Pay</div><div className="rc-title">Do Freshers Who Negotiate Get More?</div></Link>
              <Link to="/reports/service-vs-product-company-report-5-years-later-2026" className="related-card"><div className="rc-kicker">Careers</div><div className="rc-title">IT Services vs Product Firms, 5 Years Later</div></Link>
              <Link to="/reports/first-job-india-2026" className="related-card"><div className="rc-kicker">First job</div><div className="rc-title">What Entry-Level Actually Looks Like</div></Link>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Find roles where the numbers add up"}</h3>
              <p>{"Browse internships and early-career roles on Studojo and compare offers on what you will actually take home."}</p>
            </div>
            <Link to="/dojos/internships" className="rpt-cta-btn">
              {"Browse Internships →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
