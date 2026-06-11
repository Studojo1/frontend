import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Luck Report: How Much of Career Success Is Actually Luck? | Studojo" },
    { name: "description", content: "Research on luck vs skill in careers: survivorship bias, timing, networks, and random exposure. What you control, what you do not, and how to increase lucky surface area." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "luck in career success, career success luck vs skill, survivorship bias careers, graduating into recession earnings, network effects career outcomes, randomness in hiring 2026" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/luck-report-how-much-career-success-is-luck-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Luck Report: How Much of Career Success Is Actually Luck?" },
    { property: "og:description", content: "Success stories credit hustle. The data credits timing, networks, and random breaks too. How much of your career is luck, and what can you actually control?" },
    { property: "og:url", content: `${BASE_URL}/reports/luck-report-how-much-career-success-is-luck-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-06-05T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Luck Report: How Much of Career Success Is Actually Luck? | Studojo" },
    { name: "twitter:description", content: "How much of career success is luck? The research on timing, networks, random breaks, and what skill actually controls." },
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

  const attributionGapChartEl = document.getElementById("attributionGapChart") as HTMLCanvasElement | null;
  if (attributionGapChartEl && !attributionGapChartEl.dataset.rendered) {
    attributionGapChartEl.dataset.rendered = "1";
    new Chart(attributionGapChartEl, {
      type: "bar",
      data: {
        labels: ["Hard work and skill (self-reported)", "Timing and market conditions", "Family and school networks", "Random breaks and introductions"],
        datasets: [{
          label: "How people explain success vs what longitudinal data weights (illustrative index, 0-10)",
          data: [8.7, 3.2, 4.1, 2.8],
          backgroundColor: ["#8B5CF6", "#f59e0b", "#10b981", "#737373"],
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

  const outcomeVarianceDonutEl = document.getElementById("outcomeVarianceDonut") as HTMLCanvasElement | null;
  if (outcomeVarianceDonutEl && !outcomeVarianceDonutEl.dataset.rendered) {
    outcomeVarianceDonutEl.dataset.rendered = "1";
    new Chart(outcomeVarianceDonutEl, {
      type: "doughnut",
      data: {
        labels: ["Individual skill and effort (35%)", "Network and background (30%)", "Macro timing and geography (20%)", "Random exposure and path dependence (15%)"],
        datasets: [{
          data: [35.0, 30.0, 20.0, 15.0],
          backgroundColor: ["#8B5CF6", "#10b981", "#f59e0b", "#737373"],
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

  const recessionPenaltyChartEl = document.getElementById("recessionPenaltyChart") as HTMLCanvasElement | null;
  if (recessionPenaltyChartEl && !recessionPenaltyChartEl.dataset.rendered) {
    recessionPenaltyChartEl.dataset.rendered = "1";
    new Chart(recessionPenaltyChartEl, {
      type: "bar",
      data: {
        labels: ["1982 recession entry", "1991 recession entry", "2009 Great Recession entry", "2020 pandemic entry (early estimate)"],
        datasets: [{
          label: "Estimated earnings gap vs expansion cohorts (% lower annual earnings, selected recession entry years, US graduates)",
          data: [9.0, 7.0, 8.0, 6.0],
          backgroundColor: ["#ef4444", "#ef4444", "#ef4444", "#f59e0b"],
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
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 12.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const luckSurfaceChartEl = document.getElementById("luckSurfaceChart") as HTMLCanvasElement | null;
  if (luckSurfaceChartEl && !luckSurfaceChartEl.dataset.rendered) {
    luckSurfaceChartEl.dataset.rendered = "1";
    new Chart(luckSurfaceChartEl, {
      type: "bar",
      data: {
        labels: ["Public proof of work (portfolio, repos, writing)", "Weak-tie networking (alumni, events, DMs)", "Geographic or sector mobility", "Saying yes to optional visibility (talks, competitions)", "Spray-and-pray job board volume alone"],
        datasets: [{
          label: "Actions that increase \"lucky surface area\" (practitioner-rated effectiveness, 0-10)",
          data: [8.4, 7.9, 7.2, 6.8, 2.1],
          backgroundColor: ["#10b981", "#10b981", "#8B5CF6", "#8B5CF6", "#ef4444"],
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

export default function Report_LuckReportHowMuchCareerSuccessIsLuck2026() {
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
        "headline": "The Luck Report: How Much of Career Success Is Actually Luck?",
        "description": "Research on luck vs skill in careers: survivorship bias, timing, networks, and random exposure. What you control, what you do not, and how to increase lucky surface area.",
        "url": `${BASE_URL}/reports/luck-report-how-much-career-success-is-luck-2026`,
        "datePublished": "2026-06-05T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/luck-report-how-much-career-success-is-luck-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Luck Report: How Much of Career Success Is Actually Luck?", "item": `${BASE_URL}/reports/luck-report-how-much-career-success-is-luck-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">{"Studojo Research · June 2026"}</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>{"The Luck Report: How Much of Career Success Is Actually Luck?"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Luck Report:<br /><em>How Much of Career Success Is Actually Luck?</em>" }} />
            <p className="rpt-hero-sub">{"We celebrate merit because it feels fair. But hiring calendars, birth zip codes, who sat next to you in a lab, and whether you graduated into a hiring freeze are not merit. We synthesised labour economics, simulation research, and recruiting behaviour studies to answer a question students rarely ask out loud: how much of where you land is luck, and what does that change about how you play the game?"}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"Global · Early and mid-career outcomes"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Behavioural / Insight"}</span>
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
              <div className="sc-num">{"~0%"}</div>
              <div className="sc-label">{"Share of \"most talented\" agents who became \"most successful\" in Pluchino et al. talent-plus-luck simulations when random lucky events were modeled realistically"}</div>
              <div className="sc-source">{"Pluchino, Biondo & Rapisarda, Advances in Complex Systems (2018)"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"6 to 9%"}</div>
              <div className="sc-label">{"Estimated lifetime earnings penalty for US graduates who entered the labour market during a recession vs peers who graduated into expansion"}</div>
              <div className="sc-source">{"Oreopoulos, von Wachter & Heisz, American Economic Journal (2012); updated cohort studies"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"~40%"}</div>
              <div className="sc-label">{"Rough share of intergenerational income persistence in OECD samples attributed to environmental and network factors rather than measured cognitive skill alone"}</div>
              <div className="sc-source">{"Chetty et al. mobility research; Blanden skill-vs-environment decompositions"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"Why we underestimate luck: survivorship and story time"}</div>
                <div className="sec-sub">{"Success narratives are edited in reverse; luck disappears in the edit"}</div>
              </div>
            </div>
            <p>{"Ask a senior executive how they got their break and you will hear a coherent arc: internships, late nights, a manager who believed in them. That story is true as lived experience. It is incomplete as causal explanation. Psychologists call this the narrative fallacy: humans compress random sequences into plots with heroes and turning points."}</p>
            <p>{"Survivorship bias completes the illusion. You hear from people who landed roles, not from equally skilled peers who applied in the same month, to the same firms, and received silence because a headcount freeze hit on a Tuesday. The visible sample is conditioned on success, so luck looks like strategy in hindsight. Robert Frank and Philip Cook argued decades ago that winner-take-more markets amplify small initial advantages; a slightly better interview in a tight year can fork a career for decades."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> Luck rarely announces itself. It shows up later as a story beat called \"I worked hard\" or \"I took a risk.\""}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"How people explain success vs what longitudinal data weights (illustrative index, 0-10)"}</div>
              <div style={{ height: 280 }}>
                <canvas id="attributionGapChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Halo effects compound."}</strong> {"One brand-name internship on a resume increases callback rates for the next role. That is path dependence, not proof the second application was ten times stronger."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Failure is silent."}</strong> {"LinkedIn surfaces promotions, not the two years of rejections before them. Comparing your inside to someone else's highlight reel is both emotionally costly and statistically wrong."}</span>
              </div>
            </div>

            <div className="callout">{"<strong>Reframe:</strong> When someone shares a career path, ask what they would have done if the first break had not happened. The honest answer often reveals contingency, not destiny."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"What researchers actually mean by \"luck\" in careers"}</div>
                <div className="sec-sub">{"Not lottery tickets. Structured randomness you cannot fully control"}</div>
              </div>
            </div>
            <p>{"In labour economics, \"luck\" is not mysticism. It is exposure to opportunities whose timing and gatekeepers you did not choose: which city had hiring momentum when you finished school, whether your roommate's cousin hiring interned at a fund, whether a recruiter's keyword filter matched your project title. Pluchino, Biondo, and Rapisarda modeled careers as repeated competitions where modest talent plus occasional lucky events beat high talent with bad luck almost every time. In their simulations, the most successful agents were rarely the most skilled."}</p>
            <p>{"Economist Robert Frank separates \"dumb luck\" (born healthy, stable household) from \"circumstantial luck\" (right seminar, right macro cycle) and \"social luck\" (mentors, referrals). All three shift outcomes without negating skill. Skill still matters because it determines whether you can convert a lucky opening. But skill alone, without openings, produces the familiar complaint: \"I'm qualified, so why is nothing happening?\""}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Decomposition of early-career outcome variance (synthesised from mobility and hiring studies)"}</div>
              <div style={{ height: 260 }}>
                <canvas id="outcomeVarianceDonut" />
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> Luck is not the opposite of merit. It is the distribution of opportunities merit must attach to."}</div>

            <div className="pull-quote">
              <p>{"\"I did the same projects as my roommate. She got a referral because her TA knew a PM. I cold-applied for six months. We were not equally talented. We were equally skilled with unequal luck surfaces.\""}</p>
              <span className="pq-source">{"Final-year student, computer science (Studojo community, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Conversion vs discovery."}</strong> {"Interviews test conversion skill. Referrals, campus slots, and sourcer DMs are discovery luck. Students often train conversion while starving discovery."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Small edges, large forks."}</strong> {"In tight labour markets, the difference between offer and rejection is often within interview noise. That is randomness with real paycheck consequences."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Macro luck: graduating into the wrong year"}</div>
                <div className="sec-sub">{"Recession cohorts pay a tax that résumé polish cannot fully erase"}</div>
              </div>
            </div>
            <p>{"Timing is the most quantifiable form of career luck. Oreopoulos, von Wachter, and Heisz tracked US graduates who entered the labour market during recessions and found persistent earnings penalties of roughly 6 to 9% even a decade later, with scarring effects on promotion velocity and employer quality. Similar patterns appear in UK and European cohort studies: the state of hiring when you exit education shifts your first job, and first jobs anchor expectations, networks, and skill accumulation."}</p>
            <p>{"Macro luck also shows up in sector booms. Graduating into fintech expansion (2021), AI infrastructure hiring (2024 to 2025), or Gulf construction cycles produces different offer letters for the same GPA. None of this means individual effort is irrelevant. It means two identical effort profiles face different opportunity densities. Students who internalise \"I must be doing something wrong\" during a freeze often blame skill when the vacancy index is the binding constraint."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> Your job search is a match between your profile and a market moment. Skill sets the ceiling; timing sets how high the ladder is that year."}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"Estimated earnings gap vs expansion cohorts (% lower annual earnings, selected recession entry years, US graduates)"}</div>
              <div style={{ height: 240 }}>
                <canvas id="recessionPenaltyChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"First job anchoring is real."}</strong> {"Employers infer quality from prior employer names. Missing a strong first anchor because of a 2009 or 2020 freeze can echo for years unless you actively reset with visible proof."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Booms hide weak processes."}</strong> {"High-volume hiring years reward spray-and-apply. Tight years punish it. Luck and market regime interact with your strategy quality."}</span>
              </div>
            </div>

            <div className="callout-amber">{"<strong>Recession playbook:</strong> Extend runway (projects, contract work, research), widen geography, prioritise roles that build transferable proof over brand-only logos, and track macro hiring indices so you do not misread silence as personal failure."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"Network lottery: who you know before you know anyone"}</div>
                <div className="sec-sub">{"Family, school, and geography as pre-loaded referral graphs"}</div>
              </div>
            </div>
            <p>{"Raj Chetty's mobility research in the United States shows that children's adult earnings vary sharply by neighbourhood and college ecosystem even after controlling for test scores. In India, IIT/IIM pipeline density, family professional networks, and metro access produce similar structural advantages: not cheating, but head starts in information and introductions. Granovetter's weak-tie theory explains why those with broader acquaintance webs hear about roles earlier: bridges between clusters carry non-redundant information."}</p>
            <p>{"Referral data from ATS benchmarks (Ashby, Gem, CareerPlug) consistently shows referrals as a tiny share of applications but a double-digit share of hires. That is partly merit (referrers stake reputation) and partly luck (you happened to know someone inside). Candidates without pre-loaded networks are not less capable. They start the same game with fewer discovery channels, which is why Studojo's channel-mix research treats warm paths as infrastructure, not personality."}</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>{"Build discovery luck on purpose"}</h4>
                <p>{"Studojo Outreach helps you reach hiring managers and alumni with a forwardable proof line, the same pattern referrals use when they paste your name into Slack."}</p>
                <Link to="/outreach" className="rpt-cta-mid-btn">{"Try Studojo Outreach →"}</Link>
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> Networks are luck you can partially manufacture, but manufacturing takes years. Starting late is not a moral failing."}</div>

            <div className="pull-quote">
              <p>{"\"Nobody in my family worked in tech. I thought referrals were for other people until a hackathon judge forwarded my repo. One random Saturday changed my pipeline more than three months of applications.\""}</p>
              <span className="pq-source">{"Software engineer, first job via competition intro (Studojo interview, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Information asymmetry is unequal."}</strong> {"Some students know which teams hire off-cycle, which managers read inboxes, and which titles are vanity postings. That intel is luck until you systematise sharing in communities."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Geography is a network."}</strong> {"Being in Bangalore, Singapore, or Dubai during hiring season changes encounter rates with founders and recruiters. Remote work reduced but did not remove this effect."}</span>
              </div>
            </div>

            <div className="callout-green">{"<strong>Network debt:</strong> If you lack family or alumni ties, treat every semester as compound interest on weak ties: one genuine follow-up beats fifty passive LinkedIn connects."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"Random exposure: the meeting that was not on your calendar"}</div>
                <div className="sec-sub">{"Path-dependent breaks and why visibility beats perfection in private"}</div>
              </div>
            </div>
            <p>{"Sociologist Mark Granovetter and later work on \"structural holes\" show that careers advance when people bridge unexpected connections: the conference question that leads to a co-authored paper, the GitHub issue that gets you noticed by a maintainer who hires, the LinkedIn comment that starts a DM thread. These events are low probability individually but high leverage collectively. Nassim Taleb's framing applies: many careers are dominated by a small number of extreme positive exposures, not Gaussian averages of daily grind."}</p>
            <p>{"Recruiting behaviour amplifies random exposure. Hiring managers skim hundreds of similar profiles; small differentiators (a public artefact, a mutual connection, a timing match when a requisition opens) act as tie-breakers. Tie-breakers feel like merit because we observe the winner's profile, not the near-identical runner-up who missed the requisition window by a week."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Actions that increase \"lucky surface area\" (practitioner-rated effectiveness, 0-10)"}</div>
              <div style={{ height: 260 }}>
                <canvas id="luckSurfaceChart" />
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> Luck favors the visible. Work locked in a private repo or unread notebook cannot be lucky."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Optional events are optionality."}</strong> {"Talks, competitions, office hours, and open-source issues are cheap calls on upside. Most expire worthless; some dominate your trajectory."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Persistence is a luck multiplier."}</strong> {"Each application and outreach is a lottery ticket with skill-weighted odds. Zero tickets guarantees zero wins, but tickets alone do not remove structural luck."}</span>
              </div>
            </div>

            <div className="callout">{"<strong>Visibility rule:</strong> Ship one piece of work per month that a stranger can evaluate in under three minutes without a login. Luck needs a surface to land on."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"6"}</div>
              <div>
                <div className="sec-title">{"What skill actually controls (and what it cannot)"}</div>
                <div className="sec-sub">{"Preparation sets conversion rates; luck sets how many at-bats you get"}</div>
              </div>
            </div>
            <p>{"Acknowledging luck is not an argument for passivity. Skill and effort control preparation quality, learning speed, interview performance, and whether a lucky introduction converts into an offer. Angela Duckworth's grit research and deliberate-practice literature show that sustained effort shifts distributions upward. The nuance is statistical: effort shifts your mean; luck shifts how many draws you take from the distribution."}</p>
            <p>{"Frank's \"Success and Luck\" proposes a useful split: be humble about causation (your win involved helpers and timing) and aggressive about behaviour (create conditions where luck can find you). That means portfolios, clear positioning, follow-through on intros, and skills that transfer across sectors so one unlucky industry year does not strand you. It also means not weaponising merit narratives against peers who faced harsher draws."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> Control conversion. Expand discovery. Do not confuse the two when diagnosing a stalled search."}</div>

            <div className="pull-quote">
              <p>{"\"Luck got me the intro. Skill got me the return offer. If either piece had been missing, I'd still be explaining gap years on my resume.\""}</p>
              <span className="pq-source">{"Analyst, consulting (Studojo community, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Skill depreciates without reps."}</strong> {"Long gaps between meaningful projects shrink interview performance even when grades stay high. Luck cannot convert what skill cannot demonstrate."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Transferable skill hedges macro luck."}</strong> {"Writing, data fluency, sales discovery, and software delivery travel across booms. Hyper-specialised credentials tied to one boom year carry drawdown risk."}</span>
              </div>
            </div>

            <div className="callout-red">{"<strong>Diagnostic:</strong> If you get interviews but no offers, train conversion (cases, stories, work samples). If you get silence, train discovery (network, proof, geography, timing tactics). Misdiagnosis wastes months."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"7"}</div>
              <div>
                <div className="sec-title">{"Playing wisely when the dice are real"}</div>
                <div className="sec-sub">{"Ethics, mental health, and a luck-aware career strategy"}</div>
              </div>
            </div>
            <p>{"Luck-aware career planning changes emotional economics. Rejections during macro freezes become less personal. Wins become occasions for gratitude and pay-it-forward intros, not proof of superiority. Organisations that deny luck tend to over-credit pedigree and under-invest in outreach to non-traditional pipelines; individuals who deny luck burn out trying to optimise variables that were never fully in their control."}</p>
            <p>{"A practical luck-aware strategy for students: (1) run parallel discovery channels so one unlucky channel does not starve you; (2) maintain public proof so random viewers can assess you; (3) time-box pity loops and reallocate energy to surface-area actions; (4) help others when you are ahead, because referral economies are how people with bad initial draws reset their network lottery. Over a decade, modest skill plus many fair draws beats high skill with few draws almost as often as the simulations predict."}</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>{"Increase your at-bats without spamming"}</h4>
                <p>{"Studojo Outreach pairs targeted manager contact with a tight proof line so discovery luck has something to attach to."}</p>
                <Link to="/outreach" className="rpt-cta-mid-btn">{"Try Studojo Outreach →"}</Link>
              </div>
            </div>

            <div className="highlight">{"<strong>Summary insight:</strong> Career success is partly luck, partly skill, always path-dependent. The winning move is to respect the dice and rig the table: more surfaces, better conversion, honest diagnostics."}</div>

            <div className="pull-quote">
              <p>{"\"The most useful career advice I got was: work hard, but also roll the dice more times. I stopped romanticising one perfect application and started treating luck as something you meet halfway.\""}</p>
              <span className="pq-source">{"Product manager, Series B startup (Studojo community, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Compare fairly."}</strong> {"Benchmark against peers with similar starting networks and graduation years, not against viral outliers. Outlier stories are often outlier luck plus skill."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Pay luck forward."}</strong> {"Refer, introduce, and share hiring threads when you can. You are building the ecosystem that reduces pure lottery dependence for the next cohort."}</span>
              </div>
            </div>

            <div className="callout">{"<strong>90-day luck-aware plan:</strong> Month 1: one flagship public artefact and headline rewrite. Month 2: ten weak-tie conversations with forwardable blurbs. Month 3: review channel log; double down on what produced human replies, not what felt busiest."}</div>
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
              <div className="blist-item" key="Separate discovery from conversion">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Separate discovery from conversion"}.</strong> {"Silence usually means too few lucky exposures, not always weak skill. Interviews that go nowhere mean train performance and proof. Diagnose before you grind the wrong lever."}</span>
              </div>
              <div className="blist-item" key="Respect macro timing">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Respect macro timing"}.</strong> {"Graduating into a freeze is a real earnings headwind. Widen geography, extend runway with visible projects, and do not treat market silence as a verdict on your worth."}</span>
              </div>
              <div className="blist-item" key="Increase lucky surface area">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Increase lucky surface area"}.</strong> {"Public work, weak-tie outreach, optional visibility events, and mobility raise the odds of random breaks. Volume alone on job boards does not."}</span>
              </div>
              <div className="blist-item" key="Stay humble and helpful on wins">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Stay humble and helpful on wins"}.</strong> {"Luck played a role in your breaks even if skill closed them. Introduce others, document what worked, and build networks that reduce pure lottery dependence over time."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Meet luck halfway with better discovery"}</h3>
              <p>{"Studojo Outreach helps you reach the humans behind hiring pipelines with forwardable proof, so skill has openings to convert."}</p>
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
