import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The PM Internship Scheme Report: Is It Worth Applying, and Why Did Most Interns Walk Away? | Studojo" },
    { name: "description", content: "The PM Internship Scheme pilot made about 82,000 offers in round one, but only about 8,760 interns joined. Eligibility, stipend, and who should apply." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "pm internship scheme, pm internship scheme apply, pm internship stipend, pm internship eligibility, is pm internship worth it, pminternship.mca.gov.in" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/pm-internship-scheme-report-is-it-worth-it-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The PM Internship Scheme Report: Is It Worth Applying, and Why Did Most Interns Walk Away?" },
    { property: "og:description", content: "Round one of the PM Internship Scheme pilot drew 6.2 lakh applications and about 82,000 offers. Only about 8,760 interns joined. What the data says about who should apply." },
    { property: "og:url", content: `${BASE_URL}/reports/pm-internship-scheme-report-is-it-worth-it-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-11-09T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The PM Internship Scheme Report: Is It Worth Applying, and Why Did Most Interns Walk Away? | Studojo" },
    { name: "twitter:description", content: "PM Internship Scheme, round 1: 6.2 lakh applications, about 82,000 offers, about 8,760 joined. Why most selected candidates walked away, and who it's actually worth it for." },
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

  const pmisFunnelChartEl = document.getElementById("pmisFunnelChart") as HTMLCanvasElement | null;
  if (pmisFunnelChartEl && !pmisFunnelChartEl.dataset.rendered) {
    pmisFunnelChartEl.dataset.rendered = "1";
    new Chart(pmisFunnelChartEl, {
      type: "bar",
      data: {
        labels: ["Candidates who applied", "Offers made by companies", "Offers accepted", "Interns who joined"],
        datasets: [{
          label: "PM Internship Scheme pilot, round one funnel (reported figures)",
          data: [181000.0, 82077.0, 28141.0, 8760.0],
          backgroundColor: ["#737373", "#f59e0b", "#8B5CF6", "#10b981"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 200000.0,
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
`;

export default function Report_PmInternshipSchemeReportIsItWorthIt2026() {
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
        "headline": "The PM Internship Scheme Report: Is It Worth Applying, and Why Did Most Interns Walk Away?",
        "description": "The PM Internship Scheme pilot made about 82,000 offers in round one, but only about 8,760 interns joined. Eligibility, stipend, and who should apply.",
        "url": `${BASE_URL}/reports/pm-internship-scheme-report-is-it-worth-it-2026`,
        "datePublished": "2026-11-09T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/pm-internship-scheme-report-is-it-worth-it-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The PM Internship Scheme Report: Is It Worth Applying, and Why Did Most Interns Walk Away?", "item": `${BASE_URL}/reports/pm-internship-scheme-report-is-it-worth-it-2026` },
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
              <span>{"The PM Internship Scheme Report: Is It Worth Applying, and Why Did Most Interns Walk Away?"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The PM Internship Scheme Report:<br /><em>82,000 Offers. About 8,760 Joined.</em>" }} />
            <p className="rpt-hero-sub">{"The government's flagship internship scheme promised a year at a top company with a monthly stipend. The pilot's first round drew 6.2 lakh applications, and companies made about 82,000 offers. Reported figures show only about 8,760 interns actually joined. We explain who is eligible, what it pays, why so many walked away, and who should still apply."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India · Students and young graduates (check current age limits)"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Scheme / Data"}</span>
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
              <div className="sc-num">{"6.21 lakh"}</div>
              <div className="sc-label">{"Applications in round one of the pilot, from about 1.81 lakh candidates"}</div>
              <div className="sc-source">{"PM Internship Scheme pilot data, as reported"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"~34%"}</div>
              <div className="sc-label">{"Share of round-one offers that were accepted. About 8,760 candidates eventually joined"}</div>
              <div className="sc-source">{"PM Internship Scheme pilot data, as reported"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"₹9,000"}</div>
              <div className="sc-label">{"Revamped monthly stipend reported for 2026, up from ₹5,000 in the pilot"}</div>
              <div className="sc-source">{"Media reports, 2026; check the official portal"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"What the scheme offers"}</div>
                <div className="sec-sub">{"Eligibility, stipend and duration"}</div>
              </div>
            </div>
            <p>{"The PM Internship Scheme places young Indians in 12-month internships with large companies, using their CSR budgets alongside government funding. In the pilot, interns received ₹5,000 a month, ₹4,500 from the government and ₹500 from the company, plus a one-time grant of ₹6,000. Reports in 2026 say the stipend has been raised to ₹9,000 a month as part of a revamp."}</p>
            <p>{"The scheme targets people who would not normally get these internships. Graduates of IITs, IIMs and similar elite institutions, people with professional qualifications such as CA, and those already in full-time work have been excluded, along with candidates from higher-income families. Eligibility rules, including age limits and whether final-year students can apply, have changed between rounds, so check the official portal for the current criteria."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" This is not a regular internship. It is a year-long, government-supported placement aimed at students who lack access to top-company internships."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"The funnel: why so few joined"}</div>
                <div className="sec-sub">{"From 6.2 lakh applications to about 8,760 interns"}</div>
              </div>
            </div>
            <p>{"Round one of the pilot drew more than 6.2 lakh applications from about 1.81 lakh candidates. Companies made about 82,000 offers, though some reports give a lower number. Only around a third were accepted, and only about 8,760 candidates joined. Reports put full 12-month completions in the low thousands. Round two drew a further 4.55 lakh applications from about 2.14 lakh candidates, with over 71,000 offers reported by mid-2025."}</p>
            <p>{"Reporting on the pilot points to familiar reasons for the drop-off: a stipend too low to cover living costs in a new city, internships located far from home, roles that did not match what candidates expected, and a 12-month commitment that competed with studies, exams and job searches. The revamp's higher stipend and relaxed eligibility are aimed directly at those problems."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"PM Internship Scheme pilot, round one funnel (reported figures)"}</div>
              <div style={{ height: 260 }}>
                <canvas id="pmisFunnelChart" />
              </div>
            </div>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" The scheme's problem was not demand. It was fit: location, pay and role. Those are exactly the things to check before you accept."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Who it is worth it for"}</div>
                <div className="sec-sub">{"The students who gain the most"}</div>
              </div>
            </div>
            <p>{"For a student from a smaller college or town with no corporate experience, a year at a large, well-known company is a strong resume line, a source of references and often a first exposure to how big organisations work. For students who already have internship options at good companies, a full year at a modest stipend may cost more than it gives."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" The scheme is most valuable for students who have no other route into a large company. If you already have better options, the 12-month commitment is a real cost."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Strong fit."}</strong> {"Students from tier-2 and tier-3 colleges, non-engineering graduates, and anyone without corporate internship experience."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Check carefully."}</strong> {"Students who need to relocate to an expensive city on the stipend alone."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Probably skip."}</strong> {"Students with offers for paid internships or jobs that pay more and fit their career direction."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"How to choose the right internship on the portal"}</div>
                <div className="sec-sub">{"Apply for fit, not for the brand name"}</div>
              </div>
            </div>
            <p>{"The portal lets you apply to several internships. Use the choices well. Pick locations you can actually live in on the stipend, roles that connect to the job you want next, and companies whose work you can describe in an interview later. A famous name in the wrong role and city is the most common reason people dropped out."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Choose by location and role first, company name second. A year is long enough to build real skills, but only if you stay."}</div>

            <div className="callout-red"><strong>{"Use the official portal only:"}</strong>{" Applications go through the government's PM Internship portal. No agent, coaching centre or website can charge you to get selected. Anyone asking for a fee is running a scam."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"Making the year count"}</div>
                <div className="sec-sub">{"Turn 12 months into a job"}</div>
              </div>
            </div>
            <p>{"Treat the internship like a job audition. Ask your supervisor in the first month what a strong intern looks like, keep a log of what you contribute, and ask about full-time openings well before the year ends. Even if the company cannot hire you, a supervisor's reference and a clear account of what you did will carry into every interview that follows."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" The PM Internship Scheme is a door into companies that are usually closed to most students. It is worth it if you pick the right internship and stay long enough to use it."}</div>
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
              <div className="blist-item" key="Check the current eligibility on the official portal">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Check the current eligibility on the official portal"}.</strong> {"Age limits, stipend and student eligibility have changed between rounds."}</span>
              </div>
              <div className="blist-item" key="Apply for fit">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Apply for fit"}.</strong> {"Location and role decide whether you finish the year. Company name matters less."}</span>
              </div>
              <div className="blist-item" key="Do the cost maths before accepting">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Do the cost maths before accepting"}.</strong> {"Can you live in that city on the stipend? If not, the offer is not really an option."}</span>
              </div>
              <div className="blist-item" key="Never pay anyone">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Never pay anyone"}.</strong> {"Selection is free and only through the official portal."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Compare it with paid internships"}</h3>
              <p>{"Browse internships on Studojo before you commit a full year, so the PM Internship Scheme is a choice, not your only option."}</p>
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
