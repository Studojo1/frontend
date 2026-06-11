import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Unpaid Internship Report: Where It's Legal and Where It Isn't | Studojo" },
    { name: "description", content: "Unpaid internships in 2026: US FLSA rules, UK and EU minimums, India stipend norms, red flags, and how students evaluate offers before signing." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "unpaid internship legal, are unpaid internships legal, FLSA internship test, internship stipend India, unpaid internship UK, intern rights 2026" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/unpaid-internship-report-where-legal-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Unpaid Internship Report: Where It's Legal and Where It Isn't" },
    { property: "og:description", content: "Where unpaid internships are legal, where they are restricted, and the red flags students should check before accepting any offer." },
    { property: "og:url", content: `${BASE_URL}/reports/unpaid-internship-report-where-legal-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-06-01T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Unpaid Internship Report: Where It's Legal and Where It Isn't | Studojo" },
    { name: "twitter:description", content: "Unpaid internships 2026: US, UK, EU, India rules, red flags, and what to ask before you sign." },
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

  const unpaidLegalByRegionChartEl = document.getElementById("unpaidLegalByRegionChart") as HTMLCanvasElement | null;
  if (unpaidLegalByRegionChartEl && !unpaidLegalByRegionChartEl.dataset.rendered) {
    unpaidLegalByRegionChartEl.dataset.rendered = "1";
    new Chart(unpaidLegalByRegionChartEl, {
      type: "bar",
      data: {
        labels: ["United States (for-profit, FLSA)", "United Kingdom", "European Union (typical member state)", "India (formal campus / many employers)", "Australia", "Canada (province-dependent)"],
        datasets: [{
          label: "How strictly unpaid for-profit internships are restricted (regulatory strictness index, 0 to 10)",
          data: [6.5, 8.5, 8.0, 7.0, 8.5, 7.5],
          backgroundColor: ["#ef4444", "#f59e0b", "#f59e0b", "#8B5CF6", "#10b981", "#737373"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}/10` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 10.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const internPayTypeChartEl = document.getElementById("internPayTypeChart") as HTMLCanvasElement | null;
  if (internPayTypeChartEl && !internPayTypeChartEl.dataset.rendered) {
    internPayTypeChartEl.dataset.rendered = "1";
    new Chart(internPayTypeChartEl, {
      type: "doughnut",
      data: {
        labels: ["Paid at or above local minimum/stipend norm", "Stipend below living costs", "Unpaid but expenses covered", "Fully unpaid", "Pay unclear / delayed"],
        datasets: [{
          data: [48.0, 14.0, 11.0, 18.0, 9.0],
          backgroundColor: ["#10b981", "#f59e0b", "#fcd34d", "#ef4444", "#737373"],
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

  const highRiskRoleChartEl = document.getElementById("highRiskRoleChart") as HTMLCanvasElement | null;
  if (highRiskRoleChartEl && !highRiskRoleChartEl.dataset.rendered) {
    highRiskRoleChartEl.dataset.rendered = "1";
    new Chart(highRiskRoleChartEl, {
      type: "bar",
      data: {
        labels: ["Replacing paid entry-level work", "Revenue-generating sales or growth", "Long hours with production KPIs", "Short training with certificate only", "Charity / public sector (rules vary)", "Credit-bearing university placement"],
        datasets: [{
          label: "Roles where unpaid arrangements are most often challenged (risk index, 0 to 10)",
          data: [9.5, 9.2, 8.8, 4.0, 5.5, 3.5],
          backgroundColor: ["#ef4444", "#ef4444", "#f59e0b", "#10b981", "#737373", "#10b981"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}/10` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 10.0,
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

export default function Report_UnpaidInternshipReportWhereLegal2026() {
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
        "headline": "The Unpaid Internship Report: Where It's Legal and Where It Isn't",
        "description": "Unpaid internships in 2026: US FLSA rules, UK and EU minimums, India stipend norms, red flags, and how students evaluate offers before signing.",
        "url": `${BASE_URL}/reports/unpaid-internship-report-where-legal-2026`,
        "datePublished": "2026-06-01T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/unpaid-internship-report-where-legal-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Unpaid Internship Report: Where It's Legal and Where It Isn't", "item": `${BASE_URL}/reports/unpaid-internship-report-where-legal-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · June 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>The Unpaid Internship Report: Where It's Legal and Where It Isn't</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Unpaid Internship Report:<br /><em>Where It's Legal and Where It Isn't</em>" }} />
            <p className="rpt-hero-sub">Students are told to "pay dues" with free work. Regulators in several countries disagree. This report explains how the United States, United Kingdom, European Union, India, and a few other markets treat unpaid or below-minimum internships, which roles are most likely to be unlawful, and how to evaluate an offer before you sign. Read it as a map, not a lawyer.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Students and early-career interns · Informational overview (not legal advice)</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Policy / Rights</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">June 2026</span>
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
              <div className="sc-num">7 factors</div>
              <div className="sc-label">US Department of Labor primary-beneficiary test used to decide if for-profit interns may work without minimum wage</div>
              <div className="sc-source">US DOL Fact Sheet #71, internship programs under the FLSA</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">~40%</div>
              <div className="sc-label">Share of US students who reported completing at least one unpaid internship in recent NACE student surveys (varies by cohort)</div>
              <div className="sc-source">NACE internship and student experience surveys</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">₹5K+</div>
              <div className="sc-label">Common floor cited in Indian campus placement guidelines and state rules for many formal internships (employer and state dependent)</div>
              <div className="sc-source">AICTE / state labour guidelines and campus placement norms, synthesised 2026</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>1</div>
              <div>
                <div className="sec-title">Unpaid is not one thing</div>
                <div className="sec-sub">Zero cash, stipend, expenses, and "exposure"</div>
              </div>
            </div>
            <p>Students use unpaid loosely. Regulators separate categories: no compensation at all; stipend below living costs; expenses only (travel, lunch); academic credit instead of cash; and deferred promises (equity, full-time offer). Each has different rules by country.</p>
            <p>A role can be legal on paper but exploitative in practice if hours, commute, and rent mean you subsidize the employer. This report focuses on law-shaped boundaries and practical red flags, not whether unpaid work is morally fair.</p>

            <div className="highlight"><strong>Key insight:</strong> Ask for the category in writing: gross pay, hours expected, expenses, credit requirements, and whether you are classified as employee, intern, or trainee.</div>

            <div className="chart-wrap">
              <div className="chart-label">How students describe internship compensation (illustrative global survey themes, %)</div>
              <div style={{ height: 260 }}>
                <canvas id="internPayTypeChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Credit does not automatically make US roles unpaid-legal.</strong> Academic credit is one factor in the US test. For-profit employers still must satisfy the full primary-beneficiary analysis.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>"Volunteer" labels can be wrong.</strong> If you perform work that benefits the company's revenue, calling you a volunteer does not fix classification by itself.</span>
              </div>
            </div>

            <div className="callout-red"><strong>Disclaimer:</strong> This is an informational overview for students, not legal advice. Rules change by country, state, and employer type. When in doubt, consult your university career office or a qualified employment lawyer in your jurisdiction.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>2</div>
              <div>
                <div className="sec-title">United States: the primary-beneficiary test</div>
                <div className="sec-sub">When for-profit internships can be unpaid under federal wage law</div>
              </div>
            </div>
            <p>Under the Fair Labor Standards Act, for-profit interns are not automatically exempt from minimum wage. The US Department of Labor uses a primary-beneficiary test (seven factors): both parties understand there is no expectation of pay; training is similar to vocational school; the internship ties to formal education; it accommodates academic commitments; duration is limited; work does not displace paid employees; and both sides understand there is no entitlement to a paid job afterward.</p>
            <p>If the employer is the primary beneficiary (you mainly fetch value for them with little training), the intern may be an employee owed minimum wage and overtime. Nonprofits and public sector have different analyses. Government and some charitable roles follow separate rules.</p>
            <p>NACE and student surveys show unpaid internships remain common in the US, especially in media, politics, and nonprofits, but for-profit tech, finance, and consulting unpaid roles are higher legal risk when interns do real production work.</p>

            <div className="chart-wrap">
              <div className="chart-label">Roles where unpaid arrangements are most often challenged (risk index, 0 to 10)</div>
              <div style={{ height: 260 }}>
                <canvas id="highRiskRoleChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> US for-profit unpaid internships are narrow exceptions, not a default. Production work, sales quotas, and 40-hour weeks point toward employee status.</div>

            <div className="pull-quote">
              <p>"We stopped unpaid summer roles after legal review. If they do intern-level deliverables, they are on payroll."</p>
              <span className="pq-source">People operations lead, US SaaS company (Studojo community, 2025)</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>State law can be stricter.</strong> California, New York, and other states add protections. A role lawful under federal analysis might still fail state tests.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Paid is the market norm in many US tech intern programmes.</strong> Large tech and finance employers pay competitive hourly rates. Unpaid offers there are a signal to scrutinize, not accept blindly.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>US red flags:</strong> You operate alone like staff, deadlines match employees, internship has no learning plan, or manager says "everyone does unpaid first."</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>3</div>
              <div>
                <div className="sec-title">United Kingdom and European Union</div>
                <div className="sec-sub">National minimum wage, worker status, and placements</div>
              </div>
            </div>
            <p>In the United Kingdom, many interns qualify as workers if they have contracts, set hours, or perform work personally. Workers must receive at least National Minimum Wage (age bands apply). Genuine volunteers at charities without employment contracts are a separate category. Students on required placements as part of UK higher education may be exempt in specific circumstances, but commercial employers cannot assume exemption.</p>
            <p>European Union member states implement minimum wage and working-time rules nationally. Unpaid internships at for-profit firms are generally restricted; some countries publish explicit minimum internship allowances (for example France has regulated gratification for stagiaires above a threshold duration). Always check the member state, not "EU" as one rule.</p>
            <p>Australia similarly treats many interns as employees entitled to minimum rates unless a narrow vocational exception applies with clear training integration.</p>

            <div className="highlight"><strong>Key insight:</strong> UK and EU trend: if it looks like a job, pay like a job. Lengthy unpaid corporate internships are higher risk than short, supervised learning blocks.</div>

            <div className="chart-wrap">
              <div className="chart-label">How strictly unpaid for-profit internships are restricted (regulatory strictness index, 0 to 10)</div>
              <div style={{ height: 280 }}>
                <canvas id="unpaidLegalByRegionChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Erasmus and university exchange placements follow programme rules.</strong> Funding may come from grants, not the host company. Read the mobility agreement for living cost support.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Remote cross-border interns still have a jurisdiction.</strong> Where you physically work and where the employer is registered both matter for wage law.</span>
              </div>
            </div>

            <div className="callout-green"><strong>UK questions to ask:</strong> Will I have a contract? Fixed hours? Am I a worker or volunteer? What is the hourly rate and pay date?</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>4</div>
              <div>
                <div className="sec-title">India: stipends, campus rules, and shop-floor reality</div>
                <div className="sec-sub">What placement cells expect vs what startups post</div>
              </div>
            </div>
            <p>India does not have one federal "intern minimum wage" branded like the US FLSA test, but multiple layers apply: state labour laws, apprenticeship schemes, company policies, and campus placement guidelines. Many Indian institutes expect stipends for summer internships and treat zero-pay roles as non-eligible for credit. AICTE and university placement norms often cite minimum stipend floors (commonly discussed around ₹5,000 to ₹10,000 per month for formal programmes, varying by institution and state).</p>
            <p>Startups and creative agencies sometimes offer "unpaid" or performance-only roles. Legality depends on classification, hours, sector, and whether an employment relationship exists under state law. Even where enforcement is loose, career risk is real: unpaid gigs rarely convert to quality full-time offers compared with paid structured programmes.</p>
            <p>Government and PSU internships often pay modest but defined honoraria. MNC and large tech summer programmes in India usually pay competitive stipends; unpaid pitches there deserve skepticism.</p>

            <div className="highlight"><strong>Key insight:</strong> In India, campus rules and brand risk often protect you before courts do. Check placement policy before accepting zero-pay corporate internships for credit.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Apprenticeship Act paths differ from casual internships.</strong> Registered apprenticeships have prescribed training and compensation structures. Do not confuse them with a WhatsApp "intern" invite.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Remote intern for US firm from India.</strong> You may still have Indian labour considerations plus US employer policies. Get jurisdiction and pay currency clear.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>India checklist:</strong> Stipend amount and pay date in offer letter, PF/ESI mention if applicable, hours, WFH costs, bond clauses, and whether the placement office approves the employer.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>5</div>
              <div>
                <div className="sec-title">Red flags: when to walk away</div>
                <div className="sec-sub">Patterns that show up in unlawful or exploitative gigs</div>
              </div>
            </div>
            <p>Walk away or escalate to your career office when you see: unlimited hours with no pay; immediate revenue ownership ("bring clients, no salary"); no mentor or learning plan; pressure to sign away IP for free; visa or placement threats tied to unpaid work; pay "after funding" with no contract; or roles that replaced a paid posting with an intern title.</p>
            <p>Sectors with higher unpaid abuse reports include media, fashion, NGOs misclassified as volunteer shops, and small agencies selling "portfolio building." Sectors with clearer pay norms include large tech, banking analyst programmes, consulting summer analyst roles, and regulated GCC internships.</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>Prioritize paid pipelines</h4>
                <p>Studojo helps you find structured internships and outreach to employers who pay stipends or wages, so you are not defaulting to free labour.</p>
                <Link to="/dojos/internships" className="rpt-cta-mid-btn">Explore Studojo Internships →</Link>
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> If only unpaid doors open, fix proof and channel mix before you normalize free production work.</div>

            <div className="pull-quote">
              <p>"Our placement office now blocks zero-stipend corporate interns for credit. Students were doing employee hours."</p>
              <span className="pq-source">Placement coordinator, Indian engineering college (Studojo community, 2025)</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>"Certificate only" with client delivery is a warning.</strong> Real training programmes show curriculum, supervisors, and limited scope. Client billable work without pay is a different beast.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Negotiate expenses at minimum.</strong> If an org truly cannot pay (early nonprofit), negotiate metro pass, meals, or project budget before you accept.</span>
              </div>
            </div>

            <div className="callout-red"><strong>Document before you decline:</strong> Save the job post, messages, and offer terms. Career offices and regulators sometimes act on patterns when students report with evidence.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>6</div>
              <div>
                <div className="sec-title">What to do instead</div>
                <div className="sec-sub">Paid targets, alternatives, and how to ask for stipends</div>
              </div>
            </div>
            <p>Build a paid-first list: large employers with published stipends, government programmes, paid research assistants, and freelance projects with contracts. If you need experience urgently, cap unpaid hours (for example 10 hours per week for 6 weeks), require a written learning plan, and parallel a paid job or family-supported runway.</p>
            <p>When negotiating, ask: "What is the monthly stipend or hourly rate, and when is the first pay date?" If they hesitate, ask whether the role can be structured as a part-time paid intern with reduced hours. Many employers have budget but default to unpaid because students accept.</p>
            <p>Track outcomes: paid interns in NACE-linked studies often report stronger offer conversion than unpaid peers in several cohorts, though results vary by sector. Your metric is paid screens per month, not hours donated.</p>

            <div className="highlight"><strong>Summary insight:</strong> Legality varies by country; exploitation is global. Default to paid, documented, and approved by your school when credit is involved.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Micro-internships and paid projects count.</strong> Two-week paid audits beat three months of vague unpaid "shadowing."</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Know campus legal clinics.</strong> Many universities offer free employment advice for students reviewing offer letters.</span>
              </div>
            </div>

            <div className="callout"><strong>30-day reset:</strong> Week 1: remove unpaid for-profit targets. Week 2: apply to 10 paid roles. Week 3: one portfolio project you own. Week 4: report bad actors to placement office with screenshots.</div>
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
              <div className="blist-item" key="Country first, logo second">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Country first, logo second.</strong> US for-profit unpaid roles face a strict primary-beneficiary test. UK, EU, and Australia generally expect pay when work looks like employment.</span>
              </div>
              <div className="blist-item" key="Get pay terms in writing">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Get pay terms in writing.</strong> Amount, hours, expenses, credit link, and pay date. Verbal "exposure" promises are not compensation.</span>
              </div>
              <div className="blist-item" key="Production work should be paid">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Production work should be paid.</strong> Sales quotas, client deliverables, and replacing staff are high-risk unpaid patterns in every market we mapped.</span>
              </div>
              <div className="blist-item" key="Use your placement office">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Use your placement office.</strong> Many Indian and US schools block zero-pay corporate internships for credit. Report patterns with saved posts and messages.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Target paid internships first.</h3>
              <p>Studojo helps you find structured, paid internship paths and reach employers with real stipends, so you are not relying on unlawful or exploitative free work.</p>
            </div>
            <Link to="/dojos/internships" className="rpt-cta-btn">
              Explore Studojo Internships →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
