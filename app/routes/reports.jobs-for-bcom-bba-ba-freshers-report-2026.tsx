import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Non-Engineering Freshers Report: Jobs for BCom, BBA and BA Graduates in 2026 | Studojo" },
    { name: "description", content: "Commerce graduate employability rose to about 63% in 2026. The roles, sectors and routes that hire BCom, BBA and BA freshers, and the skills that matter." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "jobs for bcom freshers, jobs after bba, jobs after ba, bcom fresher salary, non it jobs for freshers, career options after bcom" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/jobs-for-bcom-bba-ba-freshers-report-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Non-Engineering Freshers Report: Jobs for BCom, BBA and BA Graduates in 2026" },
    { property: "og:description", content: "Most job advice is written for engineers. Commerce graduate employability rose to about 63% in 2026. The roles and routes that work for BCom, BBA and BA freshers." },
    { property: "og:url", content: `${BASE_URL}/reports/jobs-for-bcom-bba-ba-freshers-report-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-11-12T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Non-Engineering Freshers Report: Jobs for BCom, BBA and BA Graduates in 2026 | Studojo" },
    { name: "twitter:description", content: "Most career advice is written for engineers. Commerce employability jumped to ~63% in 2026, and retail and e-commerce lead fresher hiring. The jobs that actually hire BCom, BBA and BA freshers." },
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

  const freshersIntentChartEl = document.getElementById("freshersIntentChart") as HTMLCanvasElement | null;
  if (freshersIntentChartEl && !freshersIntentChartEl.dataset.rendered) {
    freshersIntentChartEl.dataset.rendered = "1";
    new Chart(freshersIntentChartEl, {
      type: "bar",
      data: {
        labels: ["E-commerce and tech startups", "Retail", "Manufacturing", "FMCG", "IT"],
        datasets: [{
          label: "Employers planning to hire freshers, July to December 2026, by sector (as reported)",
          data: [93.0, 93.0, 89.0, 86.0, 76.0],
          backgroundColor: ["#10b981", "#10b981", "#8B5CF6", "#8B5CF6", "#737373"],
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
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #10b981; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #10b981; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #10b981; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }
  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #10b981; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
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
  .rpt-cta { background: #10b981; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #10b981; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #10b981; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #10b981; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_JobsForBcomBbaBaFreshersReport2026() {
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
        "headline": "The Non-Engineering Freshers Report: Jobs for BCom, BBA and BA Graduates in 2026",
        "description": "Commerce graduate employability rose to about 63% in 2026. The roles, sectors and routes that hire BCom, BBA and BA freshers, and the skills that matter.",
        "url": `${BASE_URL}/reports/jobs-for-bcom-bba-ba-freshers-report-2026`,
        "datePublished": "2026-11-12T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/jobs-for-bcom-bba-ba-freshers-report-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Non-Engineering Freshers Report: Jobs for BCom, BBA and BA Graduates in 2026", "item": `${BASE_URL}/reports/jobs-for-bcom-bba-ba-freshers-report-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">{"Studojo Research · November 2026"}</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>{"The Non-Engineering Freshers Report: Jobs for BCom, BBA and BA Graduates in 2026"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "Jobs for BCom, BBA and BA Freshers:<br /><em>Most Career Advice Isn't Written for You. This Is.</em>" }} />
            <p className="rpt-hero-sub">{"Fresher job advice in India is mostly written for engineers: coding tests, IT services tracks and product companies. Most graduates study commerce, management or arts. Commerce graduate employability rose to about 63% in the India Skills Report 2026, and retail, e-commerce and financial services report some of the strongest fresher hiring. Here are the roles and routes that actually work."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India · BCom, BBA, BA and other non-engineering graduates"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Sector / Career paths"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">{"November 2026"}</span>
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
              <div className="sc-num">{"62.81%"}</div>
              <div className="sc-label">{"Employability of commerce graduates in 2026, up from 55% the year before"}</div>
              <div className="sc-source">{"India Skills Report 2026"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"93%"}</div>
              <div className="sc-label">{"Retail employers, and e-commerce and tech startups, planning to hire freshers in H2 2026, as reported"}</div>
              <div className="sc-source">{"TeamLease EdTech Career Outlook, H2 2026"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"55.55%"}</div>
              <div className="sc-label">{"Employability of arts graduates in 2026. The gap is skills you can build alongside the degree"}</div>
              <div className="sc-source">{"India Skills Report 2026"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"Where non-engineering freshers are hired"}</div>
                <div className="sec-sub">{"The sectors with the strongest demand"}</div>
              </div>
            </div>
            <p>{"TeamLease EdTech's outlook for July to December 2026 reported fresher hiring intent of about 93% among e-commerce and tech startups and among retail employers, with manufacturing and FMCG close behind. These sectors hire large numbers of graduates into sales, operations, customer, supply chain and business roles that do not require an engineering degree."}</p>
            <p>{"Financial services is the other big employer. The India Skills Report 2026 linked the jump in commerce graduate employability, from 55% to about 63%, to hiring in banking, financial services, insurance and fintech. Global capability centres, the India offices of global companies, also hire many commerce graduates into finance and operations roles."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Employers planning to hire freshers, July to December 2026, by sector (as reported)"}</div>
              <div style={{ height: 260 }}>
                <canvas id="freshersIntentChart" />
              </div>
            </div>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Your strongest employers are in retail, e-commerce, FMCG, financial services and GCCs, not IT services."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"Roles that hire BCom, BBA and BA freshers"}</div>
                <div className="sec-sub">{"Real entry points, by stream"}</div>
              </div>
            </div>
            <p>{"Most of these roles hire on aptitude, communication and specific tools rather than on the exact degree. Many accept graduates from any stream."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Pick one of these roles and build for it. 'Any job' is not a strategy; 'financial analyst at a bank GCC' is."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Finance and accounts (BCom)."}</strong> {"Accounts executive, audit associate, financial analyst, banking operations, credit and fintech operations."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Sales and business development (all streams)."}</strong> {"Inside sales, business development associate and key account roles, often with incentive pay."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Operations and supply chain (BBA, BCom)."}</strong> {"Operations executive, supply chain and category roles in e-commerce, retail and logistics."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Marketing and content (BBA, BA)."}</strong> {"Digital marketing, social media, content writing, communications and brand roles."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"HR and recruitment (BBA, BA)."}</strong> {"Recruitment associate and HR operations, a common and fast-hiring entry point."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Customer success and support (all streams)."}</strong> {"Often the fastest way into a tech company, with routes into product and operations later."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Data and business analysis (any stream with skills)."}</strong> {"Excel, SQL and a visualisation tool can open analyst roles to commerce and arts graduates."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"The skills that close the gap"}</div>
                <div className="sec-sub">{"What to add to your degree"}</div>
              </div>
            </div>
            <p>{"Arts graduates scored about 56% employability in the India Skills Report 2026. The gap is rarely intelligence. It is usually workplace skills that degrees do not teach. A few months of focused learning on the right tools, plus proof that you used them, changes how recruiters read your resume."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Excel, clear business writing and one role-specific tool will do more for a non-engineering fresher than another generic certificate."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Advanced Excel."}</strong> {"Lookups, pivot tables and basic modelling. Asked for in almost every business role."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Business communication."}</strong> {"Clear emails, short reports and confident English in interviews."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"One role tool."}</strong> {"Tally or GST basics for accounts, a CRM for sales, Google Analytics or Meta Ads for marketing, SQL for analytics."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Proof."}</strong> {"A sample analysis, a marketing campaign you ran, or an internship report you can show."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"Routes that work without campus placements"}</div>
                <div className="sec-sub">{"Most non-engineering colleges have weak placement cells"}</div>
              </div>
            </div>
            <p>{"Many commerce and arts colleges have limited campus recruitment. That makes off-campus routes essential: internships that convert to jobs, referrals from alumni and seniors, direct applications on company careers pages, walk-in and pool drives in financial services and BPO, and direct outreach to hiring managers at startups and mid-size companies."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" If your college has few placements, an internship is your placement. Start one before your final year."}</div>

            <div className="callout-red"><strong>{"Watch for scams:"}</strong>{" Non-engineering freshers are heavily targeted by fake jobs and pay-to-join internships. A real employer never asks you to pay a fee to get hired."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"A 90-day plan"}</div>
                <div className="sec-sub">{"From degree to first offer"}</div>
              </div>
            </div>
            <p>{"Month one: choose one target role, study 20 real job descriptions for it, and list the skills that keep appearing. Month two: learn the top two tools and build one piece of proof. Month three: apply to 30 to 50 targeted roles through several channels, ask five alumni for referrals, and practise interviews. Track which channel gets responses and double down on it."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" Non-engineering graduates are hired in large numbers across retail, e-commerce, finance and GCCs. The ones who win pick a role and build proof for it."}</div>
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
              <div className="blist-item" key="Target the sectors that hire you">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Target the sectors that hire you"}.</strong> {"Retail, e-commerce, FMCG, financial services and GCCs report strong fresher hiring."}</span>
              </div>
              <div className="blist-item" key="Pick one role, not 'any job'">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Pick one role, not 'any job'"}.</strong> {"Finance, sales, operations, marketing, HR or analytics. Then build for it."}</span>
              </div>
              <div className="blist-item" key="Add Excel, communication and one tool">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Add Excel, communication and one tool"}.</strong> {"These close most of the gap between your degree and an offer."}</span>
              </div>
              <div className="blist-item" key="Use internships as your placement">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Use internships as your placement"}.</strong> {"If your college has few campus drives, an internship that converts is your best route."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Find internships open to every stream"}</h3>
              <p>{"Stu, Studojo's job agent, finds internships and early-career roles that fit you, best fit first."}</p>
            </div>
            <Link to="/b2cnew/join?via=report-jobs-for-bcom-bba-ba-freshers-report-2026&how=voice" reloadDocument className="rpt-cta-btn">
              {"Let Stu find roles →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
