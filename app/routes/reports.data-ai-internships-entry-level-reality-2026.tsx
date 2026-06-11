import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Data and AI Internships 2026: Entry-Level Reality | Studojo" },
    { name: "description", content: "Data and AI internships in 2026: what entry-level roles actually are, skills that get interviews, pay bands, who's hiring, and how to break in without hype." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "data science internship 2026, AI internship entry level, machine learning intern jobs, data analyst intern salary, how to get AI internship, ML intern skills 2026" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/data-ai-internships-entry-level-reality-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Data and AI Internships 2026: Entry-Level Reality" },
    { property: "og:description", content: "Data and AI internships in 2026: the real job mix, skills employers screen for, pay ranges, and how students break in past the buzzwords." },
    { property: "og:url", content: `${BASE_URL}/reports/data-ai-internships-entry-level-reality-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-06-01T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Data and AI Internships 2026: Entry-Level Reality | Studojo" },
    { name: "twitter:description", content: "Data & AI interns 2026: what roles actually look like, skills, pay, who's hiring, and entry-level reality without the hype." },
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

  const dataAiRoleMixChartEl = document.getElementById("dataAiRoleMixChart") as HTMLCanvasElement | null;
  if (dataAiRoleMixChartEl && !dataAiRoleMixChartEl.dataset.rendered) {
    dataAiRoleMixChartEl.dataset.rendered = "1";
    new Chart(dataAiRoleMixChartEl, {
      type: "doughnut",
      data: {
        labels: ["Analytics and BI (SQL, dashboards)", "Data engineering lite (pipelines, cleaning)", "Applied ML / model evaluation", "GenAI product support (prompts, evals)", "Research-style ML (rarer at intern level)", "Labeling / QA / data ops"],
        datasets: [{
          data: [34.0, 22.0, 18.0, 14.0, 6.0, 6.0],
          backgroundColor: ["#6366f1", "#818cf8", "#8b5cf6", "#a855f7", "#4f46e5", "#737373"],
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

  const dataAiSkillsChartEl = document.getElementById("dataAiSkillsChart") as HTMLCanvasElement | null;
  if (dataAiSkillsChartEl && !dataAiSkillsChartEl.dataset.rendered) {
    dataAiSkillsChartEl.dataset.rendered = "1";
    new Chart(dataAiSkillsChartEl, {
      type: "bar",
      data: {
        labels: ["SQL and data modeling", "Python (pandas, notebooks)", "Statistics and experimentation", "Visualization (Looker, Tableau, etc.)", "Basic ML (sklearn, metrics)", "LLM / API familiarity"],
        datasets: [{
          label: "Skill priority in data/AI intern job posts (index 0 to 10)",
          data: [9.5, 9.2, 8.5, 7.8, 7.6, 6.2],
          backgroundColor: ["#6366f1", "#6366f1", "#818cf8", "#8b5cf6", "#a855f7", "#737373"],
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

  const dataAiPayIndexChartEl = document.getElementById("dataAiPayIndexChart") as HTMLCanvasElement | null;
  if (dataAiPayIndexChartEl && !dataAiPayIndexChartEl.dataset.rendered) {
    dataAiPayIndexChartEl.dataset.rendered = "1";
    new Chart(dataAiPayIndexChartEl, {
      type: "bar",
      data: {
        labels: ["US data/ML intern (large tech)", "US data analyst intern (finance)", "India structured tech intern (Bengaluru)", "India GCC data intern", "India startup data intern (variance)", "Unpaid or \"stipend TBD\" (avoid)"],
        datasets: [{
          label: "Illustrative monthly pay index (US tech/finance vs India product/GCC, index 0 to 25)",
          data: [22.0, 20.0, 16.5, 14.0, 10.5, 2.0],
          backgroundColor: ["#6366f1", "#818cf8", "#8b5cf6", "#4f46e5", "#a855f7", "#ef4444"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} (index)` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 25.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }
}

const reportCSS = `
  .rpt-hero { background: #171717; padding: 64px 0 52px; border-bottom: 3px solid #171717; position: relative; overflow: hidden; }
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #6366f1; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #6366f1; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #6366f1; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }
  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #6366f1; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
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
  .rpt-cta { background: #6366f1; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #6366f1; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #6366f1; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #6366f1; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_DataAiInternshipsEntryLevelReality2026() {
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
        "headline": "Data and AI Internships 2026: Entry-Level Reality",
        "description": "Data and AI internships in 2026: what entry-level roles actually are, skills that get interviews, pay bands, who's hiring, and how to break in without hype.",
        "url": `${BASE_URL}/reports/data-ai-internships-entry-level-reality-2026`,
        "datePublished": "2026-06-01T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/data-ai-internships-entry-level-reality-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Data and AI Internships 2026: Entry-Level Reality", "item": `${BASE_URL}/reports/data-ai-internships-entry-level-reality-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">{"Internships · June 2026"}</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>{"Data and AI Internships 2026: Entry-Level Reality"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "Data and AI Internships 2026:<br /><em>Entry-Level Reality</em>" }} />
            <p className="rpt-hero-sub">{"Hiring posts mention LLMs and agents. Intern work still clusters around clean data, SQL, notebooks, evaluation, and shipping small models or features with supervision. This report separates hype from the entry-level work employers pay for in 2026, the skills that survive screens, pay bands in the US and India, who is actually hiring, and how to stand out without pretending you built GPT-5."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"Global · Undergrad through early master's · Data analyst, data science, ML, and AI-adjacent intern pathways"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Career / Internships"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">{"June 2026"}</span>
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
              <div className="sc-num">{"~62%"}</div>
              <div className="sc-label">{"Illustrative share of entry-level data/AI-titled intern reqs that emphasize SQL, Python, and analytics over training frontier models (Studojo job-post synthesis, 2026)"}</div>
              <div className="sc-source">{"Studojo job-posting scrape synthesis, 2026"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"$35–$55/hr"}</div>
              <div className="sc-label">{"Typical US hourly range for paid data science or ML intern roles at large tech and finance employers (varies by city and year of study)"}</div>
              <div className="sc-source">{"Levels.fyi and employer intern cohorts, synthesised June 2026"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"4 proofs"}</div>
              <div className="sc-label">{"What hiring managers weight most: SQL + one dataset story, one notebook with clear metrics, basic stats/ML literacy, and communication in a short write-up"}</div>
              <div className="sc-source">{"Studojo data hiring-manager interview synthesis, 2025 to 2026"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6366f1" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"Entry-level reality: most \"AI\" interns do data work"}</div>
                <div className="sec-sub">{"Titles say AI. Week one is still tables and metrics."}</div>
              </div>
            </div>
            <p>{"Job boards bundle data analyst intern, data science intern, ML intern, AI research intern, and business intelligence intern into one hype bucket. In 2026, most undergrad and master's interns spend time on definable data work: writing SQL, fixing datasets, building dashboards, running A/B analysis, labeling and evaluating model outputs, or wiring APIs into product features. Training foundation models from scratch is rare at intern level outside a handful of research labs."}</p>
            <p>{"GenAI shifted the stack, not the entry bar. Employers want interns who can measure quality, debug bad outputs, and ship small features with guardrails. That is closer to analytics plus software hygiene than to Hollywood AI."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> Optimize for data credibility first. AI fluency is a layer on top of SQL, Python, and clear metrics."}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"What \"data/AI\" intern roles actually do (illustrative mix of work, %)"}</div>
              <div style={{ height: 280 }}>
                <canvas id="dataAiRoleMixChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Research intern ≠ corporate intern."}</strong> {"University labs and FAANG research programmes expect coursework and papers. Product companies expect shipping and communication."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Data ops is a valid foot in the door."}</strong> {"Cleaning data and building pipelines teaches how models fail in production. Do not dismiss it if paid and mentored."}</span>
              </div>
            </div>

            <div className="callout">{"<strong>Title decoder:</strong> \"Data analyst intern\" → SQL + dashboards. \"Data science intern\" → notebooks + experiments. \"ML intern\" → features + evaluation. \"AI intern\" → read the bullets; often product analytics with LLM APIs."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6366f1" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"Skills that actually move shortlists"}</div>
                <div className="sec-sub">{"SQL, Python, stats, and one story you can defend"}</div>
              </div>
            </div>
            <p>{"Recruiters skim for SQL depth (joins, window functions, sane data models), Python in notebooks (pandas, matplotlib or plotly), basic statistics (hypothesis tests, confidence, train/test intuition), and one portfolio project with a metric that moved. GitHub with readable README beats twenty Kaggle medals with no narrative."}</p>
            <p>{"For GenAI-facing roles, show prompt evaluation, RAG basics, or failure analysis on a small corpus. You do not need to fine-tune a 70B model. You need to show you can define success, measure it, and iterate."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Skill priority in data/AI intern job posts (index 0 to 10)"}</div>
              <div style={{ height: 300 }}>
                <canvas id="dataAiSkillsChart" />
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> One end-to-end project (question → data → analysis → decision) beats listing sklearn on your resume without context."}</div>

            <div className="pull-quote">
              <p>{"\"I hire data interns who explain one decision their analysis changed. Most portfolios only show plots.\""}</p>
              <span className="pq-source">{"Analytics manager, B2B SaaS (Studojo community, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"LeetCode-heavy ML interviews are niche."}</strong> {"Many data intern screens are SQL + case study + take-home, not hard competitive programming."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Cloud certs are optional."}</strong> {"BigQuery or Snowflake exposure helps. A project that queries a warehouse beats a badge alone."}</span>
              </div>
            </div>

            <div className="callout-amber">{"<strong>90-day skill stack:</strong> Week 1–4: SQL on a real schema. Week 5–8: one Kaggle or public dataset with a written report. Week 9–12: small app or dashboard plus 5-slide presentation. Optional: one LLM eval notebook with labeled examples."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6366f1" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Pay in 2026: US, India, and the unpaid trap"}</div>
                <div className="sec-sub">{"What paid looks like when it is real"}</div>
              </div>
            </div>
            <p>{"In the United States, large tech and finance data interns often land roughly $35 to $55 per hour in major metros, with housing stipends sometimes added. Smaller startups vary from competitive hourly to low stipends. Unpaid data internships at for-profit firms remain a red flag (see Studojo's unpaid internship report)."}</p>
            <p>{"In India, structured tech and GCC data interns often see monthly stipends roughly in the ₹25K–₹80K band for summer programmes, highly employer-dependent. Startups may offer less cash plus project ownership. Always confirm in the offer letter."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Illustrative monthly pay index (US tech/finance vs India product/GCC, index 0 to 25)"}</div>
              <div style={{ height: 280 }}>
                <canvas id="dataAiPayIndexChart" />
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> Paid data interns exist in volume at employers with real data teams. If everyone on the team is paid except interns, question the setup."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Remote US intern from India."}</strong> {"Confirm currency, hours, and tax. Some US employers hire contractors with different rules than US campus interns."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"PhD vs undergrad bands differ."}</strong> {"Research labs and quant firms pay premiums. Do not compare your offer to a friend's without matching level and city."}</span>
              </div>
            </div>

            <div className="callout-green">{"<strong>Negotiate scope, not only stipend:</strong> Ask about mentor, warehouse access, presentation to leadership, and return offer history."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6366f1" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"Who's hiring data and AI interns"}</div>
                <div className="sec-sub">{"Tech, finance, GCCs, and verticals with real data teams"}</div>
              </div>
            </div>
            <p>{"Large tech, fintech, and e-commerce run the biggest cohorts: product analytics, risk, search, ads, and platform data. Banks and asset managers hire quant-leaning and analytics interns. GCCs in India hire data engineering and BI interns for global stacks. Health, retail, and logistics hire when they have centralized data teams, not when \"AI\" is a press release only."}</p>
            <p>{"Consulting and agencies hire analytics interns for client dashboards. AI startups hire if you can ship evaluations and prototypes, not because you watched a transformer lecture."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> Target employers with a named data org chart. \"AI-first\" marketing without data job postings is a warning."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Capstone and university labs count."}</strong> {"Professor research with a publication or shipped artifact helps research intern screens."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Hackathons are side doors."}</strong> {"Winning a data track with a reproducible repo sometimes skips the queue for startups."}</span>
              </div>
            </div>

            <div className="callout">{"<strong>Search strings:</strong> \"data analyst intern,\" \"analytics intern,\" \"data science intern summer 2026,\" \"ML intern,\" plus company careers filter. Add city if you target India GCC or US hub."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6366f1" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"Interviews: what entry-level looks like in the room"}</div>
                <div className="sec-sub">{"SQL, cases, take-homes, and honest communication"}</div>
              </div>
            </div>
            <p>{"Typical loops: SQL screen (live or timed), statistics and product sense questions, take-home analysis with a deck, and behavioral questions on ambiguity. ML-leaning roles may add Python coding or model metric questions. Rarely will undergrads face deep architecture proofs unless applying to elite research programmes."}</p>
            <p>{"Take-homes should be time-boxed (2 to 4 hours of real work). If an employer assigns a week of unpaid labor, decline or negotiate. Present insights, not notebook dumps."}</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>{"Reach data hiring managers directly"}</h4>
                <p>{"Studojo Outreach helps you message analytics and ML leads with one project link before you are buried in a generic intern queue."}</p>
                <Link to="/dojos/internships" className="rpt-cta-mid-btn">{"Try Studojo Outreach →"}</Link>
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> Interviewers reward clarity: metric, method, limitation, next step. Practice saying \"I don't know, but I would test X.\""}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Explain tradeoffs aloud."}</strong> {"Why median vs mean, why logistic vs linear, why you dropped outliers. Junior hires win on judgment narration."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"GenAI take-homes often test evaluation."}</strong> {"Design rubrics, human rating samples, and failure buckets. That is real 2026 work."}</span>
              </div>
            </div>

            <div className="callout-amber">{"<strong>Take-home template:</strong> Problem → Data quirks → Analysis → Chart → Recommendation → What I'd do with two more weeks."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6366f1" }}>{"6"}</div>
              <div>
                <div className="sec-title">{"A realistic 60-day break-in plan"}</div>
                <div className="sec-sub">{"Proof, targets, and channel mix"}</div>
              </div>
            </div>
            <p>{"Days 1–20: finish SQL + one portfolio project with a README and slides. Days 21–40: apply to 15 tailored roles (5 large tech/finance, 5 India GCC or product, 5 startups). Days 41–60: ten outreaches to data managers with your project link; mock SQL twice a week."}</p>
            <p>{"Track screens per ten tailored applies. If only startups reply, tighten dashboards. If only GCC replies, emphasize SQL and pipeline hygiene. Do not spray \"AI enthusiast\" resumes."}</p>

            <div className="highlight">{"<strong>Summary insight:</strong> Entry-level data and AI hiring is a data credibility game with an AI accent. Build the base, then add LLM literacy with measured projects."}</div>

            <div className="pull-quote">
              <p>{"\"The intern who got the return offer explained one dashboard that changed a team's sprint priority. The others had pretty plots.\""}</p>
              <span className="pq-source">{"Head of data, consumer marketplace (Studojo community, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Avoid fake AI projects."}</strong> {"Wrappers around ChatGPT with no evaluation metric hurt trust. Show evals, costs, and failure modes."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Return offers follow communication."}</strong> {"Interns who present weekly to mentors convert more than interns who only code in silence."}</span>
              </div>
            </div>

            <div className="callout">{"<strong>Portfolio must-haves:</strong> One SQL repo, one notebook with business recommendation, one slide deck under 6 pages, LinkedIn headline that names your stack honestly."}</div>
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
              <div className="blist-item" key="Most AI interns do data work">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Most AI interns do data work"}.</strong> {"SQL, cleaning, dashboards, and evaluation beat frontier training at entry level. Read the job bullets, not only the title."}</span>
              </div>
              <div className="blist-item" key="Ship one defensible project">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Ship one defensible project"}.</strong> {"Question, data, method, metric, recommendation. That narrative beats tool lists and buzzwords."}</span>
              </div>
              <div className="blist-item" key="Target employers with real data teams">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Target employers with real data teams"}.</strong> {"Large tech, finance, GCCs, and verticals with centralized analytics hire paid cohorts. Skip vague \"AI-first\" posts with no data org."}</span>
              </div>
              <div className="blist-item" key="Practice SQL and communication">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Practice SQL and communication"}.</strong> {"Screens are often SQL + case + take-home. Present tradeoffs clearly; time-box unpaid homework and walk if abused."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Land a paid data intern role with proof."}</h3>
              <p>{"Studojo helps you find structured data and analytics internships and reach hiring managers with a project link, not a generic AI resume."}</p>
            </div>
            <Link to="/dojos/internships" className="rpt-cta-btn">
              {"Explore Studojo Internships →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
