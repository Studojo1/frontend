import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Graduate Unemployment Report: Why Degrees Are Not Turning Into Jobs in India | Studojo" },
    { name: "description", content: "Young people were 83% of India's unemployed in 2022, and most jobless youth were educated. Yet 75% of employers plan to hire freshers. Why the two don't meet." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "graduate unemployment india, why freshers are not getting jobs, educated unemployment india, india employment report 2024, employability india skills report 2026, fresher hiring 2026" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/graduate-unemployment-report-why-degrees-not-getting-jobs-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Graduate Unemployment Report: Why Degrees Are Not Turning Into Jobs in India" },
    { property: "og:description", content: "Young people make up 83% of India's unemployed, and most of them are educated. Employers say they plan to hire freshers. Why degrees and jobs keep missing each other." },
    { property: "og:url", content: `${BASE_URL}/reports/graduate-unemployment-report-why-degrees-not-getting-jobs-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-11-10T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Graduate Unemployment Report: Why Degrees Are Not Turning Into Jobs in India | Studojo" },
    { name: "twitter:description", content: "83% of India's unemployed are young. Most jobless youth are educated. 75% of employers say they'll hire freshers. Both are true. Here's the gap, and how to land on the right side of it." },
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

  const employabilityChartEl = document.getElementById("employabilityChart") as HTMLCanvasElement | null;
  if (employabilityChartEl && !employabilityChartEl.dataset.rendered) {
    employabilityChartEl.dataset.rendered = "1";
    new Chart(employabilityChartEl, {
      type: "bar",
      data: {
        labels: ["Computer science and IT engineering", "MBA", "BE / BTech overall", "Commerce", "Science", "Arts", "All graduates"],
        datasets: [{
          label: "Graduate employability by stream (India Skills Report 2026)",
          data: [80.0, 72.76, 70.15, 62.81, 61.0, 55.55, 56.35],
          backgroundColor: ["#10b981", "#8B5CF6", "#8B5CF6", "#f59e0b", "#f59e0b", "#ef4444", "#737373"],
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

export default function Report_GraduateUnemploymentReportWhyDegreesNotGettingJobs2026() {
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
        "headline": "The Graduate Unemployment Report: Why Degrees Are Not Turning Into Jobs in India",
        "description": "Young people were 83% of India's unemployed in 2022, and most jobless youth were educated. Yet 75% of employers plan to hire freshers. Why the two don't meet.",
        "url": `${BASE_URL}/reports/graduate-unemployment-report-why-degrees-not-getting-jobs-2026`,
        "datePublished": "2026-11-10T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/graduate-unemployment-report-why-degrees-not-getting-jobs-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Graduate Unemployment Report: Why Degrees Are Not Turning Into Jobs in India", "item": `${BASE_URL}/reports/graduate-unemployment-report-why-degrees-not-getting-jobs-2026` },
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
              <span>{"The Graduate Unemployment Report: Why Degrees Are Not Turning Into Jobs in India"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Graduate Unemployment Report:<br /><em>Most Jobless Youth Are Educated. Employers Still Say They Are Hiring.</em>" }} />
            <p className="rpt-hero-sub">{"India's unemployment problem is mostly a young, educated one. In 2022, young people made up about 83% of the unemployed, and nearly two-thirds of unemployed youth had at least secondary education. Yet employer surveys show three in four companies planning to hire freshers. We look at why degrees and jobs keep missing each other, and what moves a graduate onto the hired side."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India · Graduates and young job seekers"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Data / Insight"}</span>
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
              <div className="sc-num">{"82.9%"}</div>
              <div className="sc-label">{"Share of India's unemployed who were young people (15 to 29) in 2022"}</div>
              <div className="sc-source">{"India Employment Report 2024, ILO and IHD"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"65.7%"}</div>
              <div className="sc-label">{"Share of unemployed youth who had at least secondary education in 2022"}</div>
              <div className="sc-source">{"India Employment Report 2024, ILO and IHD"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"75%"}</div>
              <div className="sc-label">{"Employers planning to hire freshers in July to December 2026, as reported"}</div>
              <div className="sc-source">{"TeamLease EdTech Career Outlook, H2 2026"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"Unemployment in India is young and educated"}</div>
                <div className="sec-sub">{"What the India Employment Report found"}</div>
              </div>
            </div>
            <p>{"The India Employment Report 2024, published by the International Labour Organization and the Institute for Human Development, found that young people aged 15 to 29 made up about 83% of India's unemployed in 2022. Nearly two-thirds of unemployed youth had at least secondary education, a share that has risen sharply over two decades. Youth unemployment rates were highest among graduates, and higher still for young women."}</p>
            <p>{"In other words, more education has not automatically meant more employment. Many educated young people are waiting for jobs that match their qualifications and expectations, while the jobs being created do not always need or reward their degrees."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" A degree increases your chances of a better job, but it does not guarantee any job. Graduates now compete in the most crowded part of the labour market."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"But employers say they are hiring freshers"}</div>
                <div className="sec-sub">{"Why both things are true at once"}</div>
              </div>
            </div>
            <p>{"TeamLease EdTech's employer surveys reported that about 73% of employers planned to hire freshers in the first half of 2026, and about 75% in the second half. E-commerce, tech startups and retail reported some of the highest intent. These are not small numbers."}</p>
            <p>{"The gap is in what employers want. Recent employer surveys describe a shift from degree-based screening to applied skills and proof of work. Employers are hiring freshers who can show they can do the job. Graduates who can show only a degree are the ones left waiting."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" The jobs exist. They are going to freshers with evidence of skills, not to freshers with the most impressive certificates."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Employability varies sharply by stream"}</div>
                <div className="sec-sub">{"What the India Skills Report 2026 shows"}</div>
              </div>
            </div>
            <p>{"The India Skills Report 2026 put overall graduate employability at about 56%, meaning roughly half of graduates assessed met the bar employers look for. Computer science and IT engineers scored around 80%. Commerce graduates rose to about 63%, driven by financial services and fintech hiring. Arts graduates were around 56%."}</p>
            <p>{"Employability is not employment, but it shows where the gap is widest. For arts, science and many commerce graduates, the skills employers test for are often not taught in the degree itself, so they have to be built alongside it."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Graduate employability by stream (India Skills Report 2026)"}</div>
              <div style={{ height: 300 }}>
                <canvas id="employabilityChart" />
              </div>
            </div>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Your stream sets your starting point, not your ceiling. The gap between employable and not employable is skills you can build."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"The four gaps that keep graduates unemployed"}</div>
                <div className="sec-sub">{"And which ones you can close"}</div>
              </div>
            </div>
            <p>{"Graduate unemployment is not one problem. It is several, and only some of them are in your control."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" You cannot fix the economy. You can fix the skill, proof and search gaps, which are the ones that decide individual outcomes."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Skill gap."}</strong> {"Degrees teach theory; employers test practical tools, communication and problem solving."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Proof gap."}</strong> {"Even skilled graduates struggle if they cannot show their skills through projects, internships or work samples."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Search gap."}</strong> {"Many graduates apply only through one channel, often mass portals, and never reach the hidden part of the market."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Expectation gap."}</strong> {"Waiting for a specific job title or employer, often a government job, while entry-level roles in growing sectors go unfilled."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"How to land on the hired side"}</div>
                <div className="sec-sub">{"A practical plan for graduates"}</div>
              </div>
            </div>
            <p>{"Pick one target role and learn exactly what it requires from real job descriptions. Build one or two pieces of proof that show you can do that work. Get an internship, even a short or part-time one, because it is the strongest proof of all. Then search through several channels at once: portals, referrals, direct outreach and campus or off-campus drives."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" Graduate unemployment is real, but it is not random. Freshers who show skills and search widely are the ones employers are hiring."}</div>
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
              <div className="blist-item" key="A degree is a ticket, not a job">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"A degree is a ticket, not a job"}.</strong> {"Most unemployed young Indians are educated. The difference is what you can show beyond the degree."}</span>
              </div>
              <div className="blist-item" key="Build proof for one target role">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Build proof for one target role"}.</strong> {"Projects, internships and work samples matched to real job descriptions."}</span>
              </div>
              <div className="blist-item" key="Search through several channels">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Search through several channels"}.</strong> {"Portals, referrals, direct outreach and drives. One channel is not enough."}</span>
              </div>
              <div className="blist-item" key="Look where hiring is strongest">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Look where hiring is strongest"}.</strong> {"E-commerce, startups, retail and financial services report high fresher hiring intent."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Turn your degree into proof"}</h3>
              <p>{"Stu, Studojo's job agent, finds internships and early-career roles that fit you, best fit first."}</p>
            </div>
            <Link to="/b2cnew/join?via=report-graduate-unemployment-report-why-degrees-not-getting-jobs-2026&how=voice" reloadDocument className="rpt-cta-btn">
              {"Let Stu find roles →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
