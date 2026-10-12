import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Salary Negotiation Report: Do Freshers Who Negotiate Actually Get More? | Studojo" },
    { name: "description", content: "At TCS and Infosys, a test decides a 2x to 2.6x pay gap before any conversation. Where fresher offers move, where they never do, and when asking is risky." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "salary negotiation freshers india, can freshers negotiate salary, tcs ninja digital prime salary, infosys specialist programmer salary, offer rescinded after negotiation, how to negotiate first job offer" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/salary-negotiation-report-do-freshers-who-negotiate-get-more-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Salary Negotiation Report: Do Freshers Who Negotiate Actually Get More?" },
    { property: "og:description", content: "Two freshers from the same batch join TCS. One earns 3.36 LPA, the other 7 LPA. Neither negotiated. Here is where fresher pay is really decided." },
    { property: "og:url", content: `${BASE_URL}/reports/salary-negotiation-report-do-freshers-who-negotiate-get-more-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-13T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Salary Negotiation Report: Do Freshers Who Negotiate Actually Get More? | Studojo" },
    { name: "twitter:description", content: "Same batch. Same company. 3.36 LPA vs 7 LPA. Neither negotiated. A test did it for them. Where fresher pay actually moves, and where asking backfires." },
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

  const trackPayChartEl = document.getElementById("trackPayChart") as HTMLCanvasElement | null;
  if (trackPayChartEl && !trackPayChartEl.dataset.rendered) {
    trackPayChartEl.dataset.rendered = "1";
    new Chart(trackPayChartEl, {
      type: "bar",
      data: {
        labels: ["TCS Ninja", "Infosys Systems Engineer", "Infosys Digital Specialist Engineer", "Infosys Power Programmer", "TCS Digital", "Infosys Specialist Programmer", "TCS Prime (upper band)"],
        datasets: [{
          label: "Fresher pay by hiring track at two mass recruiters (LPA)",
          data: [3.36, 3.6, 5.0, 6.5, 7.0, 9.5, 11.5],
          backgroundColor: ["#737373", "#737373", "#a78bfa", "#a78bfa", "#8B5CF6", "#8B5CF6", "#10b981"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} LPA` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 12.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
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
  .rpt-cta { background: #8B5CF6; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #8B5CF6; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
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
  { q: "Should freshers negotiate their first salary in India?", a: "It depends on the type of offer. Band offers from mass recruiters do not move on base salary, because everyone hired into the same track gets the same base. Bespoke offers from startups, mid-size product companies and off-campus roles are the opening position of one person with a budget range, and they often can move." },
  { q: "How do I know if my offer is a band offer or a bespoke offer?", a: "Band signals are a mass campus drive, a named track like Ninja, Digital or SE, a standard joining date for the whole batch and no named hiring manager. Bespoke signals are that you spoke to your future manager, the role was posted on its own, and the recruiter asked about your expectations or other offers." },
  { q: "How much more can you earn by clearing a higher hiring track?", a: "A lot more than negotiation usually delivers. TCS Digital pays 7 LPA against 3.36 LPA for Ninja, a 2.1x gap, and Infosys Specialist Programmer at 9.5 LPA is 2.6x the 3.6 LPA Systems Engineer role. That gap is set by test performance, not by an email to HR." },
  { q: "What can I negotiate if base salary will not move?", a: "Ask for things that cost the company less to give: a joining bonus, relocation support, a later start date, or an early salary review at six months instead of twelve. These are one-time or non-cash, so they do not set a precedent for future raises. Get any change in writing." },
  { q: "Can a company withdraw an offer if I try to negotiate?", a: "A polite, specific question asked once before you accept is very rarely the problem. Documented rescissions in India, such as the hundreds of fresher offers reported revoked at Wipro, Infosys and Tech Mahindra in 2023, were business decisions applied to whole batches. Offers do get pulled after ultimatums, an invented competing offer, or shopping an accepted offer around." },
  { q: "When should I not negotiate a fresher offer?", a: "Skip it when it is a mass-recruiter band offer, your placement cell forbids negotiating, or you have no other option in a slow market. Breaking campus rules can get you barred from future drives, which costs more than any salary difference. Put the energy into a higher track test or a first job switch instead." },
];

export default function Report_SalaryNegotiationReportDoFreshersWhoNegotiateGetMore2026() {
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
        "headline": "The Salary Negotiation Report: Do Freshers Who Negotiate Actually Get More?",
        "description": "At TCS and Infosys, a test decides a 2x to 2.6x pay gap before any conversation. Where fresher offers move, where they never do, and when asking is risky.",
        "url": `${BASE_URL}/reports/salary-negotiation-report-do-freshers-who-negotiate-get-more-2026`,
        "datePublished": "2026-10-13T00:00:00Z",
        "dateModified": "2026-10-13T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/salary-negotiation-report-do-freshers-who-negotiate-get-more-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Salary Negotiation Report: Do Freshers Who Negotiate Actually Get More?", "item": `${BASE_URL}/reports/salary-negotiation-report-do-freshers-who-negotiate-get-more-2026` },
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
              <span>{"The Salary Negotiation Report: Do Freshers Who Negotiate Actually Get More?"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Salary Negotiation Report:<br /><em>Your Real Negotiation Happened in the Test Hall</em>" }} />
            <p className="rpt-hero-sub">{"Freshers ask whether they should negotiate. At India's biggest fresher employers, the answer was decided months earlier by an online test that sorts the same batch into pay tracks up to 2.6x apart. We mapped where fresher offers are fixed, where they genuinely move, and what actually gets an offer pulled."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India · Campus and off-campus fresher offers"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Behavioural / Data"}</span>
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
              <div className="sc-num">{"2.1x"}</div>
              <div className="sc-label">{"Pay gap between TCS Ninja (3.36 LPA) and Digital (7 LPA) tracks, decided by test performance, not negotiation"}</div>
              <div className="sc-source">{"TCS NQT hiring tracks, 2025"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"2.6x"}</div>
              <div className="sc-label">{"Pay gap between Infosys Systems Engineer (3.6 LPA) and Specialist Programmer (9.5 LPA) entry roles"}</div>
              <div className="sc-source">{"Infosys fresher hiring tracks, 2025"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"21 LPA"}</div>
              <div className="sc-label">{"Top Infosys fresher package for specialised technology roles, announced in 2025"}</div>
              <div className="sc-source">{"Infosys via Storyboard18, 2025"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"Two kinds of offers, two different games"}</div>
                <div className="sec-sub">{"Band offers do not move. Bespoke offers often do."}</div>
              </div>
            </div>
            <p>{"Most negotiation advice is written for a market where every offer is individually priced. India's fresher market mostly does not work that way. The biggest employers of freshers hire in tens of thousands and pay by band. Everyone hired into the same track in the same cycle gets the same base. A recruiter who handles 400 offers a week cannot change one without changing all of them, so they will not."}</p>
            <p>{"The other half of the market is bespoke: startups, mid-size product companies, off-campus hires, and roles where the company actively wanted you. Here the number on the offer is the opening position of one person with a budget range, and it can move. The mistake freshers make is running the bespoke playbook on a band offer, or assuming a bespoke offer is fixed because their friends' mass-recruiter offers were."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Before you decide whether to negotiate, work out which game you are in. If thousands of people got the same letter, the base is fixed. If the offer was written for you, it is a starting point."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Signals of a band offer."}</strong> {"Mass campus drive, a named track (Ninja, Digital, SE), a standard joining date for the whole batch, and no named hiring manager."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Signals of a bespoke offer."}</strong> {"You spoke to the person you will report to, the role was posted on its own, and the recruiter asked about your expectations or other offers."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"The test is the negotiation"}</div>
                <div className="sec-sub">{"How mass recruiters price freshers before any conversation"}</div>
              </div>
            </div>
            <p>{"At TCS, the same NQT process places freshers into Ninja at 3.36 LPA, Digital at 7 LPA, or Prime at 9 to 11.5 LPA. At Infosys, the tracks run from Systems Engineer at 3.6 LPA through Digital Specialist Engineer and Power Programmer to Specialist Programmer at 9.5 LPA. In 2025 Infosys went further, announcing packages of up to 21 LPA for specialised technology roles."}</p>
            <p>{"No conversation with HR moves a Ninja offer to Digital. Performance in the advanced coding rounds does. A fresher who spends two extra months on data structures before the test is negotiating harder than one who writes a polite email after the offer arrives. The pay gap that matters is set in the exam, and the leverage is skill evidence you bring to it."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Fresher pay by hiring track at two mass recruiters (LPA)"}</div>
              <div style={{ height: 320 }}>
                <canvas id="trackPayChart" />
              </div>
            </div>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" The largest pay jump available to most Indian freshers is a track upgrade, worth 2x or more, and it is won on a test. Prepare for the advanced round as if it were a salary meeting, because it is."}</div>

            <div className="callout-green"><strong>{"Second chances exist:"}</strong>{" Some mass recruiters run internal upgrade tests or let candidates sit for higher tracks in later cycles. Ask your placement cell how upgrades worked for last year's batch before you assume a track is permanent."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Where offers actually move"}</div>
                <div className="sec-sub">{"The levers that exist even when base salary is fixed"}</div>
              </div>
            </div>
            <p>{"Base salary is the hardest thing for a company to change, because it sets the starting point for every future raise and has to fit pay bands. One-time and non-cash items are much easier to change, because they do not set a precedent. That is where a first negotiation usually succeeds."}</p>
            <p>{"For bespoke offers, the strongest position is a specific, polite ask tied to a reason the company already accepts: a competing offer, relocation cost, a skill they said they valued, or a market data point. A vague 'is there any flexibility?' invites a vague no. A concrete 'could the joining bonus cover relocation from Kolkata to Bengaluru?' invites a yes or a counter."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" If base will not move, ask for things that cost the company less to give: joining bonus, relocation, start date, laptop or WFH setup, or an early performance review."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Joining bonus or relocation support."}</strong> {"Easiest to grant because it is one-time. Remember it may carry a clawback if you leave early."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Start date."}</strong> {"Useful if you need to finish exams, a project or another internship. Companies trade dates more easily than money."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"An early review."}</strong> {"Ask for a salary review at six months instead of twelve, written into the offer. It costs nothing today and builds in a later conversation."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Role or team."}</strong> {"At startups, the team you join often matters more for your next salary than a 5% bump on this one."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"What actually gets an offer pulled"}</div>
                <div className="sec-sub">{"Rescinded offers in India are mostly about business, not tone"}</div>
              </div>
            </div>
            <p>{"The fear behind most fresher silence is that asking will make the company withdraw the offer. Publicly documented rescissions in India point somewhere else. In 2023, Wipro, Infosys and Tech Mahindra were reported to have revoked hundreds of fresher offers after months of delayed joining dates, because demand slowed. In 2024, the employee union NITES complained to the Labour Ministry that over 2,000 Infosys recruits had waited up to two years to be onboarded. These were business decisions applied to whole batches, not reactions to individual emails."}</p>
            <p>{"That does not mean every ask is safe. Offers do get pulled after ultimatums, after a candidate invents a competing offer and is caught, or after someone accepts and then keeps shopping the offer around. Tone, honesty and timing matter. A polite, specific question asked once, before you accept, is very rarely the problem."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" The bigger rescission risk for most freshers is a market slowdown, not a negotiation email. The protection is having a second option, not staying silent."}</div>

            <div className="callout-red"><strong>{"Campus rules come first:"}</strong>{" Many placement cells forbid negotiating campus offers or holding more than one. Breaking those rules can get you barred from future drives, which is a far bigger cost than any salary difference. Read your placement policy before you ask anything."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"How to ask: a script that works on bespoke offers"}</div>
                <div className="sec-sub">{"One email, one ask, one reason"}</div>
              </div>
            </div>
            <p>{"Start with enthusiasm, because the recruiter needs to know you will accept if they move. Then make one specific ask with one reason. Then make it easy to say yes by offering an alternative if base is fixed."}</p>
            <p>{"A workable version: 'Thank you, I am excited about this role and want to make it work. I have an offer at 9 LPA from another product company, and I would prefer to join you. Is there room to bring the base closer to that? If base is fixed, a joining bonus to cover relocation would also make this an easy yes for me.' That is short, specific and honest, and it gives them two ways to agree."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" The recruiter is not your opponent. They usually need you to accept. Your job is to give them a reason they can take to whoever approves the budget."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Never invent a competing offer."}</strong> {"Recruiters talk, and some ask for the letter. Getting caught ends the conversation and sometimes the offer."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Ask once, before you accept."}</strong> {"Negotiating after signing reads as bad faith. Reopening the same point twice reads as a risk."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Get changes in writing."}</strong> {"A revised offer letter or an email from HR. Verbal promises about reviews and bonuses are often forgotten when managers change."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"6"}</div>
              <div>
                <div className="sec-title">{"When not to negotiate"}</div>
                <div className="sec-sub">{"Cases where silence really is the better move"}</div>
              </div>
            </div>
            <p>{"Some offers are worth taking as they are. If it is a mass-recruiter band offer, the placement cell forbids it, you have no other option and a slow market, or the role's value is the learning and the brand rather than the pay, the expected gain from asking is close to zero and the downside is real."}</p>
            <p>{"In those cases, put the negotiating energy somewhere else: a higher track test, an internal transfer after a year, or building the skills that make your first switch a 40% jump instead of a 7% raise. For most freshers, the first job switch is a much bigger pay negotiation than the first offer."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" Do freshers who negotiate get more? On bespoke offers, often yes, mostly through one-time items. On band offers, the people who get more are the ones who won the test."}</div>
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
              <div className="blist-item" key="Identify the game first">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Identify the game first"}.</strong> {"Band offers from mass drives do not move on base. Offers written for you usually have room. Ask only where room exists."}</span>
              </div>
              <div className="blist-item" key="Treat the coding test as your salary meeting">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Treat the coding test as your salary meeting"}.</strong> {"Track upgrades at TCS and Infosys are worth 2x or more. Extra preparation for advanced rounds is the highest-paying negotiation most freshers will have."}</span>
              </div>
              <div className="blist-item" key="Ask for what is cheap to give">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Ask for what is cheap to give"}.</strong> {"Joining bonus, relocation, start date and an early review move more easily than base salary."}</span>
              </div>
              <div className="blist-item" key="Protect yourself with options, not silence">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Protect yourself with options, not silence"}.</strong> {"Most documented rescissions were business-driven. A second offer protects you better than not asking."}</span>
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
              <Link to="/reports/ctc-illusion-report-what-12-lpa-pays-in-hand-2026" className="related-card"><div className="rc-kicker">Pay</div><div className="rc-title">What a 12 LPA Offer Actually Pays In Hand</div></Link>
              <Link to="/reports/service-vs-product-company-report-5-years-later-2026" className="related-card"><div className="rc-kicker">Careers</div><div className="rc-title">IT Services vs Product Firms, 5 Years Later</div></Link>
              <Link to="/reports/return-offer-report-why-some-interns-get-hired-2026" className="related-card"><div className="rc-kicker">Internships</div><div className="rc-title">Why Some Interns Get Hired</div></Link>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Leverage starts with a second option"}</h3>
              <p>{"Find more internships and early-career roles on Studojo so you never have to accept the first offer by default."}</p>
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
