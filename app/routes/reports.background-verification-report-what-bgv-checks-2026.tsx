import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Background Verification Report: What BGV Actually Checks and What Fails It | Studojo" },
    { name: "description", content: "About 6 in 100 white-collar hires in India get flagged in background checks. What BGV verifies, how your PF history is read, and how to clear it first time." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "background verification process india, what is checked in bgv, bgv failed what happens, uan check background verification, employment verification discrepancy, bgv for freshers" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/background-verification-report-what-bgv-checks-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Background Verification Report: What BGV Actually Checks and What Fails It" },
    { property: "og:description", content: "About 6 in 100 white-collar hires get flagged in background checks. Most of them are not fraud. They are mismatched dates, missing letters and PF records that tell a different story." },
    { property: "og:url", content: `${BASE_URL}/reports/background-verification-report-what-bgv-checks-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-19T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Background Verification Report: What BGV Actually Checks and What Fails It | Studojo" },
    { name: "twitter:description", content: "About 6 in 100 white-collar hires get flagged in BGV. Your PF record already knows your real joining dates. What gets checked, what fails, and how to fix it before it costs you the offer." },
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

  const sectorDiscrepancyChartEl = document.getElementById("sectorDiscrepancyChart") as HTMLCanvasElement | null;
  if (sectorDiscrepancyChartEl && !sectorDiscrepancyChartEl.dataset.rendered) {
    sectorDiscrepancyChartEl.dataset.rendered = "1";
    new Chart(sectorDiscrepancyChartEl, {
      type: "bar",
      data: {
        labels: ["Pharma", "BFSI", "Telecom", "Retail", "IT, ITES and BPO", "All white-collar hires"],
        datasets: [{
          label: "Background verification discrepancy rate by sector (AuthBridge, Oct 2024 to Mar 2025)",
          data: [16.0, 11.69, 11.34, 10.3, 9.46, 6.0],
          backgroundColor: ["#ef4444", "#ef4444", "#f59e0b", "#f59e0b", "#8B5CF6", "#737373"],
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
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 18.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }
}

const reportCSS = `
  .rpt-hero { background: #171717; padding: 64px 0 52px; border-bottom: 3px solid #171717; position: relative; overflow: hidden; }
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #ef4444; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #ef4444; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #ef4444; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }
  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #ef4444; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
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
  .rpt-cta { background: #ef4444; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #ef4444; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #ef4444; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #ef4444; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_BackgroundVerificationReportWhatBgvChecks2026() {
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
        "headline": "The Background Verification Report: What BGV Actually Checks and What Fails It",
        "description": "About 6 in 100 white-collar hires in India get flagged in background checks. What BGV verifies, how your PF history is read, and how to clear it first time.",
        "url": `${BASE_URL}/reports/background-verification-report-what-bgv-checks-2026`,
        "datePublished": "2026-10-19T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/background-verification-report-what-bgv-checks-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Background Verification Report: What BGV Actually Checks and What Fails It", "item": `${BASE_URL}/reports/background-verification-report-what-bgv-checks-2026` },
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
              <span>{"The Background Verification Report: What BGV Actually Checks and What Fails It"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Background Verification Report:<br /><em>6 in 100 Hires Get Flagged. Here Is What BGV Checks.</em>" }} />
            <p className="rpt-hero-sub">{"Your offer letter almost certainly says it is subject to background verification. Few candidates know what that means until a vendor emails them for documents. AuthBridge's verification data puts the white-collar discrepancy rate at about 6%, and far higher in some sectors. We break down what is checked, which mismatches fail, and how to make sure yours is not one of them."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India · Freshers and early-career hires"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Explainer / Data"}</span>
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
              <div className="sc-num">{"6%"}</div>
              <div className="sc-label">{"White-collar hires flagged with a discrepancy in background verification, October 2024 to March 2025"}</div>
              <div className="sc-source">{"AuthBridge Workforce Fraud Files 2025"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"9.46%"}</div>
              <div className="sc-label">{"Discrepancy rate in IT, ITES and BPO hiring, the sector most freshers enter"}</div>
              <div className="sc-source">{"AuthBridge Workforce Fraud Files 2025"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"1 UAN"}</div>
              <div className="sc-label">{"Your PF account number links every formal employer you have had, with dates. Verifiers read it"}</div>
              <div className="sc-source">{"EPFO UAN system; BGV industry practice"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"What BGV actually checks"}</div>
                <div className="sec-sub">{"The standard components, and who does the checking"}</div>
              </div>
            </div>
            <p>{"Most large Indian employers outsource background verification to specialist vendors. The vendor emails you a portal link after the offer, collects documents and consent, and then contacts universities, past employers and databases directly. The employer chooses which checks to run, so the package varies by company and role, but the core is similar everywhere."}</p>
            <p>{"Education checks confirm your degree, university, year and sometimes marks with the university or a records registry. Employment checks confirm each past employer, your designation, joining and leaving dates and exit status, usually through the employer's HR and increasingly through your PF history. Address checks confirm where you live, sometimes with a physical visit. Database and court-record checks look for criminal cases and listings in fraud and sanctions databases. Some roles add reference checks, identity checks, and in financial services, credit history."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" BGV does not trust your documents. It goes to the source. Anything on your resume that the source will not confirm in the same words is a potential discrepancy."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Education."}</strong> {"Degree, university, year of passing and sometimes marks, confirmed with the institution."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Employment and internships."}</strong> {"Employer name, title, dates and exit status, confirmed with HR and cross-checked against PF records."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Address and identity."}</strong> {"Current and permanent address, PAN and other IDs."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Criminal and court records."}</strong> {"Searches of court databases and police verification where required."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"How common discrepancies are"}</div>
                <div className="sec-sub">{"Which sectors flag the most hires"}</div>
              </div>
            </div>
            <p>{"AuthBridge's Workforce Fraud Files 2025, based on verification data from October 2024 to March 2025, found a 6% discrepancy rate across white-collar hires and 4% for gig workers. Rates vary sharply by sector: 16% in pharma, 11.7% in BFSI, 11.3% in telecom, 10.3% in retail and 9.5% in IT, ITES and BPO."}</p>
            <p>{"In BFSI, the sector with the clearest breakdown, employment misrepresentation was the largest category of discrepancy, well ahead of address, education and database issues. In IT, the red flags AuthBridge names are inflated job titles, exaggerated tenures, unverifiable employers and false claims about notice periods. These are not forged degrees. They are small edits that candidates assume nobody will check."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" The most common BGV failures are about work history, not education. Titles, dates and employers are where candidates bend the truth, and where verifiers look hardest."}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"Background verification discrepancy rate by sector (AuthBridge, Oct 2024 to Mar 2025)"}</div>
              <div style={{ height: 280 }}>
                <canvas id="sectorDiscrepancyChart" />
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"The UAN trail: your PF record tells your real history"}</div>
                <div className="sec-sub">{"Why stretched dates and hidden jobs are easy to catch"}</div>
              </div>
            </div>
            <p>{"Every employee covered by provident fund has a Universal Account Number that stays with them across jobs. Each employer that contributes to it leaves a record with dates. Verifiers routinely check UAN history against the resume, because it is fast and hard to fake."}</p>
            <p>{"That catches three things. Tenure stretched to cover a gap shows up when PF contributions stop months before your claimed leaving date. An employer left off the resume, often a short job that ended badly, appears as an unexplained entry. And overlapping contributions from two employers in the same months can suggest dual employment, the issue behind the 2022 moonlighting firings at Wipro."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Your resume dates must match your PF dates. If they do not, fix the resume, not the story."}</div>

            <div className="callout-amber"><strong>{"Innocent overlaps happen:"}</strong>{" A one-month overlap during a job switch, a late exit date filed by an old employer, or a payroll correction can look like dual employment. If you see one in your UAN passbook, get a letter from the old employer explaining it before BGV starts."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"What freshers get flagged for"}</div>
                <div className="sec-sub">{"BGV is not only a problem for experienced hires"}</div>
              </div>
            </div>
            <p>{"Freshers have less history to check, but it is still checked. The common problems are internship certificates that the company will not confirm, internship titles that do not match what the company says, a final degree certificate that has not been issued yet, an unexplained gap between graduation and joining, and addresses that do not match documents."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" If an internship was informal, list it exactly as the company will describe it, and keep the offer letter, certificate and the email of the person who supervised you."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Internships that cannot be verified."}</strong> {"Small startups shut down or never answer verifiers. Keep your certificate, offer email and a supervisor contact who can confirm."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Pending degree certificates."}</strong> {"Provisional certificates and final marksheets usually work. Tell the vendor early if the final degree is delayed."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Gaps."}</strong> {"A gap is not a discrepancy. A gap hidden by stretched dates is. Declare it plainly."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Paid certificates from fake internships."}</strong> {"Certificates bought from pay-to-join schemes often fail employment checks because there was no real employer."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"What happens when BGV flags you"}</div>
                <div className="sec-sub">{"Discrepancy does not always mean rejection"}</div>
              </div>
            </div>
            <p>{"Most offer letters make the offer conditional on satisfactory verification, and many employment contracts allow termination if a material discrepancy is found after joining. In practice, outcomes depend on severity. A minor date mismatch with a reasonable explanation is often cleared after you provide documents. A fake degree, a fabricated employer or an undisclosed dual job usually ends the offer or the job."}</p>
            <p>{"When the vendor or HR raises a discrepancy, respond quickly, in writing and with documents. Explain what happened, attach proof, and correct anything that was wrong. Silence or a new excuse makes a small mismatch look like deliberate misrepresentation."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" The fastest way to turn a small discrepancy into a lost offer is to defend an inaccurate claim. Correct it, document it, move on."}</div>

            <div className="callout-red"><strong>{"Long-term cost:"}</strong>{" Some BGV vendors and industry databases record verified discrepancies. A failed check at one employer can surface at the next. Getting it right once is worth more than any title inflation."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"6"}</div>
              <div>
                <div className="sec-title">{"The pre-BGV checklist"}</div>
                <div className="sec-sub">{"Fifteen minutes that protect your offer"}</div>
              </div>
            </div>
            <p>{"Run this before you accept an offer, not after the vendor emails you."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" BGV rewards boring accuracy. If every line on your resume matches what the source will say, verification is a formality."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Download your UAN service history."}</strong> {"Compare every employer and date with your resume and fix any mismatch."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Use official titles."}</strong> {"Write the designation on your offer or relieving letter, then describe the work in bullets."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Collect your letters."}</strong> {"Offer, relieving and experience letters for every job and internship, plus final payslips."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Check your degree status."}</strong> {"Make sure the university has your correct name and date of birth, and request transcripts early."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Declare gaps and short stints."}</strong> {"A short job you leave off the resume is a bigger risk than one you explain."}</span>
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
              <div className="blist-item" key="Make your resume match the source">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Make your resume match the source"}.</strong> {"Titles, dates and employers should read exactly as HR records and your UAN history show them."}</span>
              </div>
              <div className="blist-item" key="Check your PF history before anyone else does">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Check your PF history before anyone else does"}.</strong> {"Download your UAN service history and fix any mismatch or overlap with documents."}</span>
              </div>
              <div className="blist-item" key="Keep every letter">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Keep every letter"}.</strong> {"Offer, relieving and experience letters and internship certificates are your proof when a verifier cannot reach a source."}</span>
              </div>
              <div className="blist-item" key="Answer discrepancies fast and in writing">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Answer discrepancies fast and in writing"}.</strong> {"A documented explanation clears most small mismatches. Defending a false claim ends offers."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Build a resume that survives verification"}</h3>
              <p>{"Studojo helps you write a resume that is sharp and accurate, so the story you tell is the one BGV confirms."}</p>
            </div>
            <Link to="/dojos/careers" className="rpt-cta-btn">
              {"Build Your Resume →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
