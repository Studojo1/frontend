import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Remote Jobs Report: Who Is Still Hiring Remote Freshers, and for What | Studojo" },
    { name: "description", content: "Only 9.1% of Indian job posts mention remote work, and big IT firms want freshers in office. Where remote fresher roles still exist, global options and scams." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "remote jobs for freshers india, work from home jobs freshers 2026, return to office india it companies, remote jobs for indians foreign companies, freelance tax india foreign clients, remote job scams india" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/remote-jobs-report-who-hires-remote-freshers-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Remote Jobs Report: Who Is Still Hiring Remote Freshers, and for What" },
    { property: "og:description", content: "Only about 1 in 11 Indian job posts mentions remote work, and big IT employers want freshers in the office. Remote fresher jobs still exist, but in specific places." },
    { property: "og:url", content: `${BASE_URL}/reports/remote-jobs-report-who-hires-remote-freshers-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-17T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Remote Jobs Report: Who Is Still Hiring Remote Freshers, and for What | Studojo" },
    { name: "twitter:description", content: "1 in 11 Indian job posts mentions remote. TCS wants 5 days in office, Infosys 10 a month. Remote fresher jobs still exist, but not where most students look." },
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
  const VIOLET = "#8B5CF6";
  const ORANGE = "#f59e0b";
  const RED    = "#ef4444";
  const GREEN  = "#10b981";
  const MUTED  = "#737373";
  const INK    = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  const remoteShareChartEl = document.getElementById("remoteShareChart") as HTMLCanvasElement | null;
  if (remoteShareChartEl && !remoteShareChartEl.dataset.rendered) {
    remoteShareChartEl.dataset.rendered = "1";
    new Chart(remoteShareChartEl, {
      type: "bar",
      data: {
        labels: ["IT infrastructure, operations and support", "Community and social service", "Industrial engineering", "All Indian postings, Oct 2025", "All Indian postings, a year earlier"],
        datasets: [{
          label: "Share of Indian job postings mentioning remote work (Indeed Hiring Lab, 2025)",
          data: [18.2, 15.1, 14.0, 9.1, 7.6],
          backgroundColor: ["#8B5CF6", "#a78bfa", "#a78bfa", "#10b981", "#737373"],
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
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 20.0,
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
`;

export default function Report_RemoteJobsReportWhoHiresRemoteFreshers2026() {
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
        "headline": "The Remote Jobs Report: Who Is Still Hiring Remote Freshers, and for What",
        "description": "Only 9.1% of Indian job posts mention remote work, and big IT firms want freshers in office. Where remote fresher roles still exist, global options and scams.",
        "url": `${BASE_URL}/reports/remote-jobs-report-who-hires-remote-freshers-2026`,
        "datePublished": "2026-10-17T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/remote-jobs-report-who-hires-remote-freshers-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Remote Jobs Report: Who Is Still Hiring Remote Freshers, and for What", "item": `${BASE_URL}/reports/remote-jobs-report-who-hires-remote-freshers-2026` },
        ],
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
              <span>{"The Remote Jobs Report: Who Is Still Hiring Remote Freshers, and for What"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Remote Jobs Report:<br /><em>Only 1 in 11 Job Posts Offers It. Here Is Where They Are.</em>" }} />
            <p className="rpt-hero-sub">{"Students search for work-from-home jobs as if they were the default. They are not. Only about 9% of Indian job postings mention remote work, and India's largest IT employers now want freshers in the office. Remote fresher roles do exist, but in specific functions, company types and global contractor arrangements. Here is the map."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India and global · Fresher and early-career roles"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Sector / Trends"}</span>
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
              <div className="sc-num">{"9.1%"}</div>
              <div className="sc-label">{"Indian job postings that mention remote or work from home, up from 7.6% a year earlier"}</div>
              <div className="sc-source">{"Indeed Hiring Lab, October 2025"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"18.2%"}</div>
              <div className="sc-label">{"Remote share in IT infrastructure, operations and support postings, the highest of any occupation group"}</div>
              <div className="sc-source">{"Indeed Hiring Lab, October 2025 quarter"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"10 days"}</div>
              <div className="sc-label">{"Minimum office days per month Infosys required from March 2025. TCS moved to five days a week"}</div>
              <div className="sc-source">{"Infosys and TCS policy coverage, 2025"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"The big employers want freshers in the office"}</div>
                <div className="sec-sub">{"What return-to-office means for your first job"}</div>
              </div>
            </div>
            <p>{"India's largest fresher employers have moved firmly back to offices. Infosys required employees to work from office at least 10 days a month from March 2025, with system tracking and leave deductions for shortfalls. TCS moved to a five-day office policy and linked it to variable pay. Other large services firms have followed similar patterns."}</p>
            <p>{"For freshers, the logic is training. Companies believe new hires learn faster sitting next to experienced colleagues, and onboarding thousands of graduates remotely proved hard during the pandemic. If your plan is a fully remote first job at a large Indian employer, it is very unlikely in 2026."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Remote-first fresher roles are mostly outside the big Indian employers. You have to look in different places."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"Remote is rising again, slowly and unevenly"}</div>
                <div className="sec-sub">{"Where remote postings actually cluster"}</div>
              </div>
            </div>
            <p>{"Indeed Hiring Lab data shows 9.1% of Indian job postings mentioned remote or work from home in October 2025, up from 7.6% a year earlier. The remote share rose in 84% of occupations. That increase came while overall postings fell nearly 20% year on year, so remote roles are a growing share of a shrinking pool."}</p>
            <p>{"The remote share varies a lot by function. IT infrastructure, operations and support led at 18.2% of postings, followed by community and social service at 15.1% and industrial engineering at 14.0%. Roles where output is measurable and work happens on a screen go remote first. Roles that need hardware, customers or a shop floor do not."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Share of Indian job postings mentioning remote work (Indeed Hiring Lab, 2025)"}</div>
              <div style={{ height: 280 }}>
                <canvas id="remoteShareChart" />
              </div>
            </div>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" If remote work matters to you, choose the function first. The occupation shapes your remote odds more than the company does."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Who actually hires remote freshers"}</div>
                <div className="sec-sub">{"Five places remote entry roles really come from"}</div>
              </div>
            </div>
            <p>{"Remote fresher roles are concentrated in organisations where hiring is lean and the work produces output that can be checked without watching the worker. These are the main sources."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Remote employers hire on visible proof of output. A portfolio, writing samples or a public code repository does more than a degree."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Early-stage startups."}</strong> {"Small teams that are distributed by default, often hiring for engineering, design, content and growth. Many hire through founder networks and direct outreach, not job boards."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Global remote-first companies."}</strong> {"Some hire in India through Employer of Record platforms or as contractors. Entry roles are competitive and mostly in engineering, support and operations."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"AI data and evaluation work."}</strong> {"Annotation, evaluation and domain-expert work for AI models has grown fast. Pay and stability vary widely, and it is usually contract work."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Agencies and content businesses."}</strong> {"Marketing, design, video and writing agencies often run remote teams and take on freshers with good portfolios."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Customer support and IT operations."}</strong> {"The occupations with the highest remote share in the Indeed data, though often with shift work."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"Working for a foreign company from India"}</div>
                <div className="sec-sub">{"How to get paid legally and keep your tax clean"}</div>
              </div>
            </div>
            <p>{"Many global remote roles open to Indians are structured as contractor agreements, not employment. You invoice the company, receive money from abroad, and handle your own tax. This is legal and common, but it puts the paperwork on you."}</p>
            <p>{"Receive payments through a bank or licensed payment platform and keep the inward remittance documents. Under GST, services exported to a foreign client are generally zero-rated, and registration is required only above 20 lakh of annual turnover in most states. Many freelancers in notified professions can use presumptive taxation, declaring a share of receipts as income, within turnover limits. Rules and section numbers change, so confirm your setup with a chartered accountant before your first invoice."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" A foreign contractor role pays in dollars but gives you no PF, no gratuity and no employer insurance. Compare it with Indian offers after you account for those."}</div>

            <div className="callout-green"><strong>{"Employer of Record roles are different:"}</strong>{" If a global company employs you through an EOR platform, you are an employee of the EOR in India, with salary slips, TDS and often PF. That is closer to a normal job."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"The remote job scam problem"}</div>
                <div className="sec-sub">{"Why 'work from home' is the most abused phrase in Indian hiring"}</div>
              </div>
            </div>
            <p>{"Fraudsters know students want remote work, so 'work from home' is the most common hook in Indian job scams. Task scams that pay for liking videos or rating hotels, then ask for a deposit, ran through overseas-operated websites that the government blocked in late 2023. Fake offer letters from well-known company names, sent from personal email accounts, ask for 'registration' or 'training' fees."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" A legitimate remote employer never asks you to pay to start, to buy equipment from a specific seller, or to deposit money to unlock earnings."}</div>

            <div className="callout-red"><strong>{"Red flags:"}</strong>{" Offers on WhatsApp or Telegram without an interview, pay that is too high for the work, a personal email domain, and any request for money. If you were defrauded, call 1930 or report at cybercrime.gov.in immediately."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"6"}</div>
              <div>
                <div className="sec-title">{"How to land a remote first role"}</div>
                <div className="sec-sub">{"What remote hiring managers check for"}</div>
              </div>
            </div>
            <p>{"Remote managers cannot see you work, so they hire for evidence that you can work without being watched: clear writing, reliable delivery, and output they can inspect. Build that evidence on purpose."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" Remote fresher jobs are rarer than students think, and easier than they think to win once you look in the right places with the right proof."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Show async work."}</strong> {"A public repo, case study or writing sample that someone can judge without talking to you."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Write like a remote employee."}</strong> {"Short, structured messages with context and a clear next step. Your application email is your first work sample."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Do a remote internship first."}</strong> {"A remote internship is the strongest proof that you can deliver without supervision."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Go direct."}</strong> {"Many remote startup roles are never posted widely. Reach founders and hiring managers directly with proof of your work."}</span>
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
              <div className="blist-item" key="Do not wait for a remote job at a big Indian employer">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Do not wait for a remote job at a big Indian employer"}.</strong> {"Large fresher employers have moved back to offices. Look at startups, global companies and agencies instead."}</span>
              </div>
              <div className="blist-item" key="Choose remote-friendly functions">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Choose remote-friendly functions"}.</strong> {"IT operations, support, engineering, design and content have the highest remote share."}</span>
              </div>
              <div className="blist-item" key="Set up foreign contract work properly">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Set up foreign contract work properly"}.</strong> {"Keep remittance records, understand GST and presumptive tax, and talk to a CA before your first invoice."}</span>
              </div>
              <div className="blist-item" key="Never pay to work">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Never pay to work"}.</strong> {"Any remote offer that asks for a fee, deposit or equipment purchase is a scam."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Reach the founders hiring remote teams"}</h3>
              <p>{"Many remote startup roles are filled before they are posted. Studojo Outreach helps you reach founders and hiring managers directly with proof of your work."}</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">
              {"Try Studojo Outreach →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
