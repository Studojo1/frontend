import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Cybersecurity Internship Report: Stop Collecting Certificates | Studojo" },
    { name: "description", content: "Security+ is the right first certificate. CISSP and OSCP are not entry level and buying them early wastes money. What actually gets a cybersecurity intern hired in 2026." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "cybersecurity internship, cyber security internship requirements, cybersecurity intern salary 2026, is security plus worth it for internships, entry level cybersecurity jobs, cybersecurity home lab portfolio" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/cybersecurity-internship-report-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Cybersecurity Internship Report: Stop Collecting Certificates" },
    { property: "og:description", content: "Most students buy the wrong certificate and skip the thing that actually works. A documented home lab outperforms certifications alone." },
    { property: "og:url", content: `${BASE_URL}/reports/cybersecurity-internship-report-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-09-27T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Cybersecurity Internship Report: Stop Collecting Certificates | Studojo" },
    { name: "twitter:description", content: "CISSP is not an entry level certificate. Here is what actually gets a cybersecurity intern hired." },
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

  const payChartEl = document.getElementById("payChart") as HTMLCanvasElement | null;
  if (payChartEl && !payChartEl.dataset.rendered) {
    payChartEl.dataset.rendered = "1";
    new Chart(payChartEl, {
      type: "bar",
      data: {
        labels: ["Entry level role, low end", "Cybersecurity intern, average", "Entry level role, high end"],
        datasets: [{
          label: "US cybersecurity pay, annual US dollars",
          data: [50000.0, 57115.0, 85000.0],
          backgroundColor: ["#f59e0b", "#8B5CF6", "#10b981"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} per year` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 95000.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const certChartEl = document.getElementById("certChart") as HTMLCanvasElement | null;
  if (certChartEl && !certChartEl.dataset.rendered) {
    certChartEl.dataset.rendered = "1";
    new Chart(certChartEl, {
      type: "doughnut",
      data: {
        labels: ["Certificates beyond the first one", "Coursework already covered by the degree", "A documented home lab and write-ups", "Applying outside technology companies"],
        datasets: [{
          data: [45.0, 30.0, 18.0, 7.0],
          backgroundColor: ["#ef4444", "#f59e0b", "#10b981", "#10b981"],
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
  .tmpl { background: #faf9f6; border: 2px solid #171717; border-radius: 14px; padding: 22px 24px; margin: 22px 0; box-shadow: 3px 3px 0 #171717; overflow-x: auto; }
  .tmpl-label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #737373; margin-bottom: 14px; }
  .tmpl-line { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.8; color: #171717; white-space: pre-wrap; word-break: break-word; }
  .tmpl-blank { height: 12px; }
  .tmpl-var { color: #8B5CF6; font-weight: 700; }
  @media (max-width: 640px) { .tmpl { padding: 18px 16px; } .tmpl-line { font-size: 12px; } }
  .chart-wrap { margin: 24px 0; }
  .chart-label { font-size: 12px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .takeaway-section { background: #faf5fe; border: 2px solid #c4b5fd; border-radius: 20px; box-shadow: 4px 4px 0 #c4b5fd; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }
  .rpt-cta { background: #8B5CF6; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_CybersecurityInternshipReport2026() {
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
        "headline": "The Cybersecurity Internship Report: Stop Collecting Certificates",
        "description": "Security+ is the right first certificate. CISSP and OSCP are not entry level and buying them early wastes money. What actually gets a cybersecurity intern hired in 2026.",
        "url": `${BASE_URL}/reports/cybersecurity-internship-report-2026`,
        "datePublished": "2026-09-27T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/cybersecurity-internship-report-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Cybersecurity Internship Report: Stop Collecting Certificates", "item": `${BASE_URL}/reports/cybersecurity-internship-report-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · September 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>The Cybersecurity Internship Report: Stop Collecting Certificates</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Cybersecurity Internship Report:<br /><em>Stop Collecting Certificates</em>" }} />
            <p className="rpt-hero-sub">Students entering security are handed a reading list of acronyms and told to collect them. Most buy the expensive ones first, apply exclusively to technology companies, and never build the one thing that separates a shortlisted application from a rejected one. The field is hiring. The standard approach to entering it is close to backwards.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Primarily United States data · Entry level and internship cybersecurity roles</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Sector / Cybersecurity</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">September 2026</span>
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
              <div className="sc-num">$57,115</div>
              <div className="sc-label">average annual pay for a cybersecurity intern in the United States. Entry level roles run roughly $50,000 to $85,000</div>
              <div className="sc-source">Indeed and aggregated salary data, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">Security+</div>
              <div className="sc-label">the correct first certificate, alongside ISC2 CC. CISSP, CISM and OSCP are not entry level and do not help you get an internship</div>
              <div className="sc-source">Certification requirement analysis across entry level postings, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">55%</div>
              <div className="sc-label">of hiring managers now use internships specifically to build their talent pipeline, which makes the internship the main door in</div>
              <div className="sc-source">Employer hiring intent surveys, 2026</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>1</div>
              <div>
                <div className="sec-title">The certificate order most students get wrong</div>
                <div className="sec-sub">One of these is the first one. The famous ones are not.</div>
              </div>
            </div>
            <p>CompTIA Security+ is the most common baseline requirement across entry and mid-level security postings, and ISC2's Certified in Cybersecurity sits alongside it as a genuine starting credential. Between them they cover what an entry-level posting is actually screening for.</p>
            <p>CISSP, CISM and OSCP are not entry-level certificates, and treating them as the next rung is the expensive mistake. CISSP carries a multi-year professional experience requirement before you can even hold the full certification. OSCP is a demanding practical exam aimed at working penetration testers. Buying either as a student is money and months spent on a door that is not yet in front of you.</p>
            <p>The practical rule is that one baseline certificate clears the screening filter, and the second one adds very little. After Security+, additional certificates have sharply diminishing returns compared with what the next section covers.</p>

            <div className="chart-wrap">
              <div className="chart-label">US cybersecurity pay, annual US dollars</div>
              <div style={{ height: 250 }}>
                <canvas id="payChart" />
              </div>
            </div>

            <div className="highlight">Key insight: get one baseline certificate, then stop. The second certificate is almost always worth less than the first project you could have built in the same time.</div>

            <div className="callout-red">If a training provider is selling you CISSP as a route into your first security job, that is a signal about the provider rather than about the field.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>2</div>
              <div>
                <div className="sec-title">What actually outperforms a certificate</div>
                <div className="sec-sub">Demonstrable skill, which means a home lab you wrote about</div>
              </div>
            </div>
            <p>The consistent finding across 2026 hiring guidance is that demonstrable skill, meaning a home lab plus a documented portfolio, outperforms certifications alone. That phrase is doing a lot of work and most students only hear the first half.</p>
            <p>A home lab on its own proves nothing to a stranger, because they cannot see it. What converts is the documentation: a short write-up of what you built, what you were trying to detect or break, what happened, and what you concluded. Ten of those is a portfolio. It is also the only thing in your application that a hiring manager cannot get from anyone else, because everyone else has the same certificate.</p>
            <p>The tooling expectation at entry level is modest and specific. Familiarity with Wireshark, a Linux distribution such as Kali, and enough scripting to automate something small. You are not expected to arrive expert. You are expected to have actually touched the tools.</p>

            <div className="chart-wrap">
              <div className="chart-label">Where a student's first year of effort is usually spent, against where it pays off</div>
              <div style={{ height: 300 }}>
                <canvas id="certChart" />
              </div>
            </div>

            <div className="highlight">Key insight: the lab is the work, the write-up is the evidence. A lab nobody can read about does not exist as far as your application is concerned.</div>

            <div className="pull-quote">
              <p>&quot;Demonstrable skill, a home lab plus a documented portfolio, outperforms certifications alone.&quot;</p>
              <span className="pq-source">Consistent finding across 2026 entry level security hiring guidance</span>
            </div>

            <div className="callout-green">Write up the failures too. A post explaining what you expected, what actually happened, and why you were wrong reads as genuine investigation. A page of clean successes reads as a tutorial you followed.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>3</div>
              <div>
                <div className="sec-title">The roles are not where students look</div>
                <div className="sec-sub">Every industry has a security function. Technology companies are the crowded one.</div>
              </div>
            </div>
            <p>Cybersecurity internship opportunities exist across virtually every industry, not just technology. Government agencies, healthcare systems, banks, insurers, utilities and major retailers all run security functions and all hire interns into them.</p>
            <p>Almost every student application goes to technology companies and to the handful of named security vendors. This is the same queue problem that shows up in every field: the best-known employers receive applications from everyone, while a hospital network or a regional bank receives a fraction of that volume for work that is frequently more hands-on.</p>
            <p>Regulated industries are worth particular attention. Healthcare and finance carry compliance obligations that force them to maintain real security capability regardless of the hiring market, which makes their demand steadier than a technology company's.</p>

            <div className="highlight">Key insight: your odds are set as much by which queue you join as by how strong you are. The hospital and the utility are hiring, and almost nobody applied.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Healthcare systems.</strong> Compliance obligations force continuous security investment, and patient data makes the work consequential from day one.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Government and public sector.</strong> Structured intern programmes, defined timelines, and in some roles a security clearance path that becomes durable career leverage.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Banking, insurance and utilities.</strong> Regulated, permanently staffed security functions with far shorter applicant queues than technology companies.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Retail and logistics at scale.</strong> Large payment and supply chain surfaces, genuine incident volume, and very little student competition.</span>
              </div>
            </div>

            <div className="callout">Search by the function rather than the industry. Filtering job boards for security analyst intern surfaces employers that never appear on a list of top cybersecurity companies.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>4</div>
              <div>
                <div className="sec-title">What the internship is actually worth</div>
                <div className="sec-sub">The pay, and the thing that matters more than the pay</div>
              </div>
            </div>
            <p>Cybersecurity interns in the United States average around $57,115 a year, and entry-level security roles land roughly between $50,000 and $85,000 depending on the role, the metro and whether a clearance is involved. Intern pay generally sits below the entry-level band, as it does in most fields.</p>
            <p>The number that should matter more to you is that 55 percent of hiring managers now use internships specifically to build their talent pipeline. That reframes the internship from a summer of experience into the primary hiring channel for the field.</p>
            <p>Clearance is worth understanding early if you are in the United States. Roles requiring one pay at the top of the band, partly because the pool of cleared candidates is small and slow to grow. An internship in a government agency or a cleared contractor can start that process years before it would otherwise begin.</p>

            <div className="highlight">Key insight: if more than half of hiring managers use internships as their pipeline, then the internship is not a step toward the career. It is the entrance.</div>

            <div className="callout">Compare offers on what you will touch, not only on the rate. A summer with real incident exposure at a hospital is worth more to your second job than a higher-paying summer writing documentation.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>5</div>
              <div>
                <div className="sec-title">The twelve week plan</div>
                <div className="sec-sub">What to do between now and applications if you are starting from nothing</div>
              </div>
            </div>
            <p>The sequence matters more than the intensity. One baseline certificate, then a lab, then write-ups, then applications aimed outside the obvious employers. Doing these in a different order is what produces a student with three certificates and no interviews.</p>
            <p>Most entry-level postings also expect enrolment in a relevant programme and foundational knowledge of networking and operating systems. If your degree already covers those, do not re-learn them through a paid course. That is the second most common way students spend a term on something that changes nothing.</p>

            <div className="highlight">Key insight: a student with one certificate and ten written-up investigations beats a student with three certificates and nothing to show, essentially every time.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Weeks 1 to 6: one certificate.</strong> Security+ or ISC2 CC. Not both, and definitely not CISSP. This clears the screening filter and nothing more, which is all it needs to do.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Weeks 3 to 10: build the lab, in parallel.</strong> A few virtual machines, a network you can break, Wireshark, a Linux distribution, and a small script that automates something tedious.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Weeks 6 to 12: write up eight to ten investigations.</strong> Short posts. What you tried, what happened, what you concluded, what you got wrong. This is the portfolio, and it is the differentiator.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Weeks 10 onward: apply outside the crowd.</strong> Hospitals, utilities, banks, government, retail. Same function, far shorter queue, frequently more hands-on work.</span>
              </div>
            </div>

            <div className="callout-green">Put the write-ups somewhere with a link you can paste into an application. A portfolio a recruiter has to ask for is a portfolio that does not get read.</div>
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
              <div className="blist-item" key="One certificate, then stop">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>One certificate, then stop.</strong> Security+ or ISC2 CC clears the filter. CISSP, CISM and OSCP are not entry level and buying them early wastes both money and months.</span>
              </div>
              <div className="blist-item" key="Build a lab, then write about it">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Build a lab, then write about it.</strong> Demonstrable skill beats certifications alone, but only the documented part is visible to a stranger reading your application.</span>
              </div>
              <div className="blist-item" key="Apply where nobody else does">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Apply where nobody else does.</strong> Hospitals, utilities, banks, government and retail all run security functions. Almost every student application goes to technology companies instead.</span>
              </div>
              <div className="blist-item" key="Treat the internship as the entrance">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Treat the internship as the entrance.</strong> 55 percent of hiring managers use internships to build their pipeline, which makes it the main hiring channel rather than a stepping stone.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Reach the security teams that never post.</h3>
              <p>Studojo finds the person running security at employers outside the obvious list, and helps you put your write-ups in front of them.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">
              Find Roles →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
