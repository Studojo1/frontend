import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Fresher CS Salaries India 2026: Salary Data, Skill Gaps and Hiring Trends | Studojo" },
    { name: "description", content: "135,000 IT hires projected for FY26. TCS pays 3.6 LPA, product startups pay 20 LPA+. The 12x salary gap, DSA skill gaps, and what CS freshers actually face in India." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "fresher cs salary india 2026, entry level software engineer salary india, it fresher salary india, dsa interview india, software engineer salary freshers" },
    { tagName: "link", rel: "canonical", href: "https://studojo.com/reports/cs-india-2026" },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Fresher CS Salaries India 2026: Salary Data, Skill Gaps and Hiring Trends" },
    { property: "og:description", content: "135,000 IT hires projected for FY26. TCS pays 3.6 LPA, product startups pay 20 LPA+. The 12x salary gap, DSA skill gaps, and what CS freshers actually face in India." },
    { property: "og:url", content: "https://studojo.com/reports/cs-india-2026" },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: "https://studojo.com/og-reports.png" },
    { property: "og:image:alt", content: "Studojo Career Market Report" },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-04-01T00:00:00+05:30" },
    { property: "article:modified_time", content: "2026-04-20T00:00:00+05:30" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Fresher CS Salaries India 2026: Salary Data, Skill Gaps and Hiring Trends | Studojo" },
    { name: "twitter:description", content: "135,000 IT hires projected for FY26. A 12x salary gap at Year 0. Free data-driven report for CS freshers entering the job market in India." },
    { name: "twitter:image", content: "https://studojo.com/og-reports.png" },
    { name: "twitter:site", content: "" },
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

  const BLUE = "#3b82f6";
  const BLUE2 = "#60a5fa";
  const BLUE3 = "#93c5fd";
  const VIOLET = "#8b5cf6";
  const GREEN = "#10b981";
  const GREEN2 = "#34d399";
  const ORANGE = "#f59e0b";
  const RED = "#ef4444";
  const MUTED = "#737373";
  const INK = "#171717";
  const grid = { color: "#f0f0ee", lineWidth: 1 };

  function make(id: string, config: any) {
    const el = document.getElementById(id) as HTMLCanvasElement | null;
    if (!el || el.dataset.rendered) return;
    el.dataset.rendered = "1";
    new Chart(el, config);
  }

  // Chart 1: City distribution
  make("cityChart", {
    type: "bar",
    data: {
      labels: ["Bengaluru", "Hyderabad", "Pune", "Chennai", "Delhi NCR"],
      datasets: [{
        label: "Fresher CS roles (relative index)",
        data: [100, 65, 52, 50, 45],
        backgroundColor: [BLUE, BLUE2, BLUE2, BLUE3, BLUE3],
        borderRadius: 6,
        borderWidth: 2,
        borderColor: INK,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` Index: ${ctx.raw}` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
      },
    },
  });

  // Chart 2: Salary by company type (grouped bar: low / high)
  make("salaryChart", {
    type: "bar",
    data: {
      labels: ["TCS Ninja /\nWipro", "Infosys SE /\nCognizant", "TCS Digital /\nInfosys DSE", "Infosys SP /\nTCS Prime", "Product\nStartup", "MNC Product\n(Adobe, Atlassian)", "FAANG\n(Google, Microsoft)"],
      datasets: [
        { label: "Base salary: low (LPA)", data: [3.4, 3.6, 6.25, 7, 10, 15, 30], backgroundColor: BLUE3, borderRadius: 4, borderWidth: 0 },
        { label: "Base salary: high (LPA)", data: [4.2, 6.25, 7, 11.5, 18, 25, 50], backgroundColor: BLUE, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw} LPA` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => v + " L", color: MUTED } },
      },
    },
  });

  // Chart 3: Role growth: YoY %, single axis, coloured by direction
  make("roleChart", {
    type: "bar",
    data: {
      labels: ["AI / ML Engineer", "Data Engineering / GenAI", "Full Stack Developer", "Cloud / DevOps", "QA Automation", "Generic IT Services SWE", "Manual QA / Testing"],
      datasets: [{
        label: "YoY growth (%)",
        data: [54, 34, 30, 25, 15, 2, -12],
        backgroundColor: [GREEN, GREEN, GREEN, GREEN2, GREEN2, ORANGE, RED],
        borderRadius: 4,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => ` YoY: ${ctx.raw > 0 ? "+" : ""}${ctx.raw}%` } },
      },
      scales: {
        x: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + "%" } },
        y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
      },
    },
  });

  // Chart 4: Skill frequency in CS JDs
  make("skillChart", {
    type: "bar",
    data: {
      labels: ["DSA\n(arrays, trees, DP)", "OOP / DBMS\n/ OS fundamentals", "Python or\nJava", "Git /\nversion control", "One real\nproject (GitHub)", "Cloud basics\n(AWS/Azure)", "System design\nconcepts", "API /\nREST basics"],
      datasets: [{
        label: "Mentioned in JDs (%)",
        data: [91, 88, 82, 74, 68, 61, 54, 71],
        backgroundColor: [BLUE, BLUE, BLUE, BLUE2, BLUE2, BLUE3, BLUE3, BLUE2],
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of JDs` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, min: 0, max: 100, ticks: { font: { size: 11 }, callback: (v: any) => v + "%", color: MUTED } },
      },
    },
  });

  // Chart 5: Readiness donut
  const readEl = document.getElementById("readinessChart") as HTMLCanvasElement | null;
  if (readEl && !readEl.dataset.rendered) {
    readEl.dataset.rendered = "1";
    new Chart(readEl, {
      type: "doughnut",
      data: {
        labels: ["Fully job-ready (5.5%)", "Strong aptitude, weak DSA/projects (37%)", "Communication OK, no coding practice (32%)", "Major gaps across the board (25.5%)"],
        datasets: [{ data: [5.5, 37, 32, 25.5], backgroundColor: [BLUE, BLUE2, ORANGE, RED], borderColor: "#fff", borderWidth: 3, hoverOffset: 8 }],
      },
      options: { responsive: false, cutout: "65%", plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } } } },
    });
  }

  // Chart 6: Compensation breakdown by company type (stacked: base + variable + equity)
  make("compChart", {
    type: "bar",
    data: {
      labels: ["TCS Ninja", "Infosys SE", "TCS Digital", "Product Startup", "MNC Product", "FAANG India"],
      datasets: [
        { label: "Base (LPA)", data: [3.4, 3.6, 6.25, 12, 18, 28], backgroundColor: BLUE, borderRadius: 0, borderWidth: 0 },
        { label: "Variable / bonus (LPA)", data: [0.3, 0.3, 0.75, 1.5, 2.5, 5], backgroundColor: BLUE2, borderRadius: 0, borderWidth: 0 },
        { label: "ESOPs / RSUs (LPA)", data: [0, 0, 0, 3, 4.5, 15], backgroundColor: GREEN, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
        tooltip: { mode: "index", intersect: false, callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw} LPA` } },
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 }, color: MUTED } },
        y: { stacked: true, grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => v + " L", color: MUTED } },
      },
    },
  });

  // Chart 7: Career trajectory: Services vs Product/GCC
  make("trajectoryChart", {
    type: "line",
    data: {
      labels: ["Year 0", "Year 1", "Year 2", "Year 3", "Year 5"],
      datasets: [
        { label: "Product / GCC path (total comp LPA)", data: [15, 18, 22, 28, 40], borderColor: BLUE, backgroundColor: "rgba(59,130,246,0.1)", tension: 0.4, pointBackgroundColor: BLUE, pointRadius: 5, fill: true },
        { label: "IT Services path (total comp LPA)", data: [4, 4.5, 6, 8, 14], borderColor: GREEN, backgroundColor: "rgba(16,185,129,0.08)", tension: 0.4, pointBackgroundColor: GREEN, pointRadius: 5, fill: true },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw} LPA` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => v + " L", color: MUTED } },
      },
    },
  });
}

export default function CSIndiaReport() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Chart) { initCharts(); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
    s.onload = () => initCharts();
    document.head.appendChild(s);
  }, []);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "Article", "headline": "Fresher CS Salaries India 2026: Salary Data, Skill Gaps and Hiring Trends", "description": "135,000 IT hires projected for FY26. TCS pays 3.6 LPA, product startups pay 20 LPA+. The 12x salary gap, DSA skill gaps, and what CS freshers actually face in India.", "url": "https://studojo.com/reports/cs-india-2026", "datePublished": "2026-04-01T00:00:00+05:30", "dateModified": "2026-04-20T00:00:00+05:30", "author": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com"}, "publisher": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com", "logo": {"@type": "ImageObject", "url": "https://studojo.com/logo.png"}}, "mainEntityOfPage": {"@type": "WebPage", "@id": "https://studojo.com/reports/cs-india-2026"}, "image": "https://studojo.com/og-reports.png"}` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://studojo.com"}, {"@type": "ListItem", "position": 2, "name": "Reports", "item": "https://studojo.com/reports"}, {"@type": "ListItem", "position": 3, "name": "Fresher CS Salaries India 2026", "item": "https://studojo.com/reports/cs-india-2026"}]}` }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: rptCSS }} />
      <main>

        {/* Hero */}
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Market Analysis · Q1 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>CS India 2026</span>
            </nav>
            <h1 className="rpt-h1">Fresher CS in India:<br /><em>What You're Actually Getting Into</em></h1>
            <p className="rpt-hero-sub">
              135,000 IT hires projected for FY26. A 12x salary gap at Year 0 based entirely on which company you join. And the one skill that 94.5% of engineering graduates do not have on day one.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval">135,000</div><div className="rpt-hlbl">IT hires projected FY26 (NASSCOM)</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">+39%</div><div className="rpt-hlbl">Fresher hiring growth YoY, Jan 2026</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">8 findings</div><div className="rpt-hlbl">Salary data, hiring pipelines, what actually works</div></div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="rpt-cta-strip">
          <div className="rpt-cta-strip-inner">
            <span className="rpt-cta-strip-text">Looking for CS and SWE roles in India?</span>
            <Link to="/outreach" className="rpt-cta-pill">Find CS roles on Studojo →</Link>
          </div>
        </div>

        <div className="rpt-content">

          {/* Finding 1 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 01</span>
              <h2 className="rpt-h2">135,000 IT hires projected for FY26. Fresher hiring jumped 39% in a single month.</h2>
              <p className="rpt-lead">The Indian IT-BPM sector is adding headcount again. NASSCOM projects 135,000 net new hires for FY26, and fresher hiring is driving the growth. The Naukri JobSpeak Index hit 3,001 points in December 2025, with fresher-specific hiring up 39% YoY in January 2026 alone.</p>
            </div>

            <div className="rpt-stat-row rpt-c4">
              <div className="rpt-stat"><div className="rpt-val rpt-b">135,000</div><div className="rpt-lbl">Projected IT-BPM hires FY26 (NASSCOM, Feb 2026)</div><span className="rpt-delta rpt-du">+2K vs FY25</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-b">77,000+</div><div className="rpt-lbl">Confirmed fresher seats from TCS, Infosys, Wipro, HCL alone</div></div>
              <div className="rpt-stat"><div className="rpt-val">+39%</div><div className="rpt-lbl">Fresher hiring YoY growth, January 2026 (Naukri JobSpeak)</div><span className="rpt-delta rpt-du">Sharpest spike on record</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">+53%</div><div className="rpt-lbl">Tier-2 city IT hiring surge, June 2025 (Naukri JobSpeak)</div></div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Fresher CS/SWE roles by city (Bengaluru = 100)</div>
              <div className="rpt-chart-wrap" style={{ height: 260 }}><canvas id="cityChart"></canvas></div>
            </div>

            <p className="rpt-prose">Bengaluru leads because it concentrates India's product companies, GCCs, and funded startups. Hyderabad is the fastest-growing alternative: Cyberabad hosts Google, Microsoft, Amazon, and Apple campuses, and the state government has actively courted GCCs. Pune is the outsourcing hub of the west with 1,000+ IT firms. The real story is tier-2: cities like Coimbatore, Jaipur, Indore, and Nagpur saw a 53% YoY surge in IT hiring as companies seek lower attrition and cheaper office costs.</p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The GCC shift</div>
              <p>Global Capability Centers: Indian offices of multinationals like JPMorgan, Goldman Sachs, Boeing, and Nike: added 40% more presence in tier-2 cities in FY26. GCCs now employ over 1.9 million people in India. They pay product-company salaries with MNC stability. They are the most underrated fresher opportunity in the market right now.</p>
            </div>
            <p className="rpt-source">Source: NASSCOM via BusinessToday Feb 2026, Naukri JobSpeak Jan 2026, Taggd IT Hiring Trends 2026</p>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 02</span>
              <h2 className="rpt-h2">The salary gap within "CS fresher" is 12x. Same degree, very different outcomes.</h2>
              <p className="rpt-lead">A TCS Ninja earn 3.4 LPA. A Google L3 India earns 40.5 LPA median. Both hired from the same graduating class, with the same B.Tech degree. The only difference is which interview they prepared for.</p>
            </div>

            <blockquote className="rpt-pullquote">
              <p>"Your degree gets you in the door. Your DSA practice decides which door."</p>
            </blockquote>

            <div className="rpt-card">
              <div className="rpt-card-label">Fresher year-1 total CTC range by company type (LPA): low to high</div>
              <div className="rpt-chart-wrap" style={{ height: 320 }}><canvas id="salaryChart"></canvas></div>
            </div>

            <p className="rpt-prose">The chart shows actual ranges, not aspirational ceilings. Within IT services, Infosys has three distinct tracks: SE (3.6 LPA), DSE (6.25 LPA), and SP (7.1 to 11.7 LPA), and a new AI-roles band hitting 21 LPA for specialist hires announced in December 2025. <strong>The single biggest salary lever at Year 0 is not your college or your CGPA: it is which company type you get into.</strong> Everything else is secondary.</p>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-b">3.4 LPA</div><div className="rpt-lbl">TCS Ninja: the largest single fresher intake in India (42,000 seats)</div></div>
              <div className="rpt-stat"><div className="rpt-val">40.5 LPA</div><div className="rpt-lbl">Google India L3 median total comp (Levels.fyi, 2026)</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">21 LPA</div><div className="rpt-lbl">Infosys new AI-roles band for freshers, announced Dec 2025 (Business Standard)</div></div>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The Infosys tier structure in 2026</div>
              <p>Infosys has formalised four tracks for freshers: SE (3.6 LPA), DSE (6.25 LPA), SP (7.1 to 11.7 LPA), and a new AI-specialist band at 21 LPA. The track you enter is determined by your performance in their specific hiring assessment, not by your college. You can apply off-campus. The DSE and SP assessments are harder but entirely learnable.</p>
            </div>
            <p className="rpt-source">Source: Levels.fyi Google India 2026, PrepInsta Infosys salary tiers, Business Standard Dec 2025 (Infosys AI band), TCS hiring confirmation PeopleMatters</p>
          </div>

          {/* CTA 1 */}
          <div className="rpt-inline-cta">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Build the resume that gets you into a product company</div>
                <div className="rpt-inline-cta-sub">ATS-optimised, free, takes 5 minutes. Used by 5,000+ students.</div>
              </div>
              <Link to="/dojos/careers" className="rpt-btn-primary">Build Resume Free</Link>
            </div>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 03</span>
              <h2 className="rpt-h2">AI/ML is up 54%. Manual QA is shrinking. NASSCOM calls it a shift from mass to selective hiring.</h2>
              <p className="rpt-lead">Not all CS roles are moving in the same direction. The Naukri JobSpeak Index tracked AI/ML roles growing 54% YoY by August 2025. At the same time, NASSCOM has publicly flagged a shift from mass hiring to AI-led selective recruitment. Here is what is growing and what is not.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Role type YoY growth rate (%): India, 2025 to 2026</div>
              <div className="rpt-chart-wrap" style={{ height: 340 }}><canvas id="roleChart"></canvas></div>
            </div>

            <p className="rpt-prose">AI/ML is the outlier at +54% YoY, driven by every company retrofitting its product with LLMs and needing engineers who can build with them. Data engineering and GenAI roles follow at +34%, full-stack at +30%. Cloud and DevOps are steady growers. <strong>Manual QA is the one role in active decline</strong>: AI-assisted test generation is replacing repetitive test-writing, and QA Automation (which requires coding) is absorbing the growth instead.</p>

            <div className="rpt-pill-row">
              {["AI / ML Engineer", "Data Engineering", "Full Stack Developer", "Cloud / DevOps", "QA Automation"].map(p => <span key={p} className="rpt-pill rpt-pg">{p}</span>)}
              {["Generic IT Services SWE"].map(p => <span key={p} className="rpt-pill rpt-po">{p}</span>)}
              {["Manual QA / Testing"].map(p => <span key={p} className="rpt-pill rpt-pr">{p}</span>)}
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">What "AI-led selective recruitment" actually means for you</div>
              <p>NASSCOM is saying that companies are hiring fewer people but each hire is expected to do more. TCS, Infosys, and Wipro are all investing in AI upskilling internally, which means they want freshers who can learn fast, not freshers who already know a lot. The bar on aptitude and fundamentals has not dropped. But the companies are increasingly willing to train you on specific tools as long as you pass the fundamentals screen.</p>
            </div>
            <p className="rpt-source">Source: Naukri JobSpeak Aug 2025 (AI-ML +54%), Naukri JobSpeak Jun 2025 (AI-ML +42%), NASSCOM mass-to-selective shift statement, Taggd IT Hiring Trends 2026</p>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 04</span>
              <h2 className="rpt-h2">Two hiring pipelines dominate. They test completely different things and lead to completely different careers.</h2>
              <p className="rpt-lead">IT services giants and product/GCC companies both hire freshers at scale. But the profiles they want, the interviews they run, and the career paths they offer are almost entirely different. Knowing which pipeline you are targeting determines everything about how you prepare.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">IT Services (TCS, Infosys, Wipro, HCL, Cognizant)</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[
                      ["TCS", 90, "#3b82f6", "42,000 fresher seats FY26"],
                      ["Infosys", 80, "#3b82f6", "20,000 fresher seats FY26"],
                      ["Wipro", 65, "#60a5fa", "10,000 to 12,000 (Train & Hire)"],
                      ["HCLTech", 50, "#60a5fa", "5,196+ in Q2 FY26 alone"],
                      ["Cognizant / Tech M", 45, "#93c5fd", "Selective campus drives"],
                    ].map(([name, pct, bg, sub]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}<small>{sub}</small></div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#eff6ff", border: "1px solid #93c5fd" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#1d4ed8" }}>What they test</div>
                    <div style={{ fontSize: 13, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>Aptitude (quant, logical, verbal), DSA basics (Easy to Medium), OOP/DBMS/OS MCQs, one HR round. Specialist tracks: harder coding + 2 to 3 technical interviews.</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Product, GCC, and Funded Startups</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[
                      ["Google / Microsoft / Amazon", 90, "#10b981", "IIT/NIT campus + off-campus"],
                      ["Adobe / Atlassian / Salesforce", 75, "#10b981", "MNC GCCs hiring freshers"],
                      ["Swiggy / Razorpay / CRED", 65, "#34d399", "Product startups (off-campus)"],
                      ["Zerodha / Groww / PhonePe", 55, "#34d399", "Fintech product companies"],
                      ["JPMorgan / Goldman GCCs", 45, "#6ee7b7", "BFSI GCCs: fast-growing segment"],
                    ].map(([name, pct, bg, sub]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}<small>{sub}</small></div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#d0fae4", border: "1px solid #10b981" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#065f46" }}>What they test</div>
                    <div style={{ fontSize: 13, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>2 to 4 rounds of DSA (Medium to Hard), system design concepts, CS fundamentals, deployed projects, GitHub portfolio. College tier determines initial shortlisting.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">The non-IIT path into product companies</div>
              <p>Product companies and GCCs do off-campus hiring. Platforms: Wellfound, LinkedIn, company career pages, hackathons (Codeforces, LeetCode contests). A strong GitHub profile, 2 to 3 deployed projects, and LeetCode 150 solved consistently is more deterministic than your college name at most funded startups. The IIT filter applies strongly at FAANG: it is much weaker at the Series A to C level.</p>
            </div>
            <p className="rpt-source">Source: Taggd IT Hiring Trends 2026, NASSCOM FY26 headcount projections, company-confirmed fresher targets (Business Standard, PeopleMatters)</p>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 05</span>
              <h2 className="rpt-h2">DSA is in 91% of CS JDs. Only 5.5% of graduates arrive able to write functional code.</h2>
              <p className="rpt-lead">We looked at what skills appear across fresher CS and SWE job descriptions. Then we looked at what freshers actually show up knowing. The gap is structural and significant, but the top items are entirely learnable.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Skill frequency across fresher CS/SWE JDs (%)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="skillChart"></canvas></div>
            </div>

            <p className="rpt-prose">DSA and OOP/DBMS fundamentals appear in nearly every JD because every technical interview tests them directly. Git appears in 74% of JDs and is almost never taught in college. Cloud basics appear in 61%: also absent from most curricula. <strong>The most striking gap: only 5.5% of engineering graduates have basic programming ability sufficient for industry use</strong> (Aspiring Minds / Masai School analysis). The remaining 94.5% fail on practical coding screens despite having passed engineering courses on the same topics.</p>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-b">5.5%</div><div className="rpt-lbl">Of engineering graduates with functional programming ability for industry use (Aspiring Minds)</div></div>
              <div className="rpt-stat"><div className="rpt-val">3.84%</div><div className="rpt-lbl">With combined technical, cognitive, and linguistic skills for startup roles</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">15 lakh</div><div className="rpt-lbl">Engineering graduates per year in India: only a fraction industry-ready</div></div>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The weekend fix for the biggest gap</div>
              <p>LeetCode 150 is a curated list of the most commonly tested DSA patterns. Solving it consistently over 3 to 4 months (2 to 3 problems per day) closes the DSA gap that kills 70%+ of interview attempts. Then: set up Git, push 2 projects to GitHub, deploy one of them. These two actions alone put you ahead of the vast majority of applicants at both service and product companies.</p>
            </div>
            <p className="rpt-source">Source: Masai School Skill Gap analysis 2025, Aspiring Minds AMCAT data, Mercer-Mettl Graduate Skill Index 2025, Statista India engineering employability</p>
          </div>

          {/* CTA 2 */}
          <div className="rpt-inline-cta" style={{ background: "#171717" }}>
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title" style={{ color: "#fff" }}>Find SWE, AI/ML, and product company internships</div>
                <div className="rpt-inline-cta-sub" style={{ color: "#a3a3a3" }}>Build your track record before you apply full-time. The outreach tool finds the right roles.</div>
              </div>
              <Link to="/outreach" className="rpt-btn-primary">Find CS Roles</Link>
            </div>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 06</span>
              <h2 className="rpt-h2">Only 42.6% of graduates are employable. 83% of 2024 engineering graduates had no job or internship.</h2>
              <p className="rpt-lead">The Mercer-Mettl India Graduate Skill Index 2025 assessed over 1 million students across 2,700+ campuses. Only 42.6% met the minimum employability threshold: down from 44.3% in 2023. Here is where the gaps are and why interviews go wrong.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Fresher CS readiness profile (hiring manager and assessment data, 2025)</div>
              <div className="rpt-donut-layout">
                <canvas id="readinessChart" style={{ width: 200, height: 200, flexShrink: 0 }}></canvas>
                <div className="rpt-legend-list">
                  {[
                    { color: "#3b82f6", label: "Fully job-ready on arrival", pct: "5.5%" },
                    { color: "#60a5fa", label: "Strong aptitude, weak DSA and projects", pct: "37%" },
                    { color: "#f59e0b", label: "Communication OK, no consistent coding practice", pct: "32%" },
                    { color: "#ef4444", label: "Significant gaps across the board", pct: "25.5%" },
                  ].map(i => (
                    <div key={i.label} className="rpt-legend-item">
                      <div className="rpt-legend-dot" style={{ background: i.color, borderColor: i.color }}></div>
                      <div className="rpt-legend-text">{i.label}</div>
                      <div className="rpt-legend-pct">{i.pct}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rpt-card" style={{ marginTop: 20 }}>
              <div className="rpt-card-label">Top reasons freshers fail CS interviews after being shortlisted</div>
              <div className="rpt-bar-list">
                {[
                  { r: "Cannot solve LeetCode medium DSA under time pressure", sub: "The most common and most fixable failure mode", pct: 74, bg: "#ef4444" },
                  { r: "No real project to discuss", sub: "73% of recruiters weight proof over college brand", pct: 68, bg: "#f87171" },
                  { r: "Weak OOP, DBMS, OS fundamentals", sub: "Passed college exams, cannot apply concepts in context", pct: 61, bg: "#fca5a5" },
                  { r: "No Git or cloud exposure", sub: "Expected as day-1 baseline at every company type", pct: 54, bg: "#fca5a5" },
                  { r: "Poor communication in technical explanation", sub: "Can code but cannot walk through thinking out loud", pct: 47, bg: "#fecaca" },
                ].map(r => (
                  <div key={r.r} className="rpt-bar-row">
                    <div className="rpt-bar-label">{r.r}<small>{r.sub}</small></div>
                    <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}></div></div>
                    <div className="rpt-bar-value">{r.pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-callout rpt-cd">
              <div className="rpt-cl">The fix</div>
              <p>Solve DSA problems out loud. Literally narrate your thought process as you code. That single habit closes the gap that causes 47% of interview failures at the explanation stage and also trains you to think structurally, which makes the DSA itself easier. Do this from problem 1, not after you feel "ready."</p>
            </div>
            <p className="rpt-source">Source: Mercer-Mettl India Graduate Skill Index 2025, Wheebox India Skills Report 2025, Unstop Talent Report 2025, Business Standard Feb 2026</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 07</span>
              <h2 className="rpt-h2">At product companies, ESOPs average 23% of total comp. At services companies, there are none.</h2>
              <p className="rpt-lead">Compensation at CS roles is not just salary. At product companies and GCCs, equity is a meaningful part of Year 0 packages. But the reality of ESOP liquidity in Indian startups is more complicated than the headline numbers suggest.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Year-1 total compensation breakdown: base + variable + equity (LPA)</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="compChart"></canvas></div>
            </div>

            <p className="rpt-prose">The stacked bars show the three components of total comp. Services companies are almost entirely base salary with minimal variable and zero equity. Product startups begin adding equity meaningfully, but on a 4-year vesting schedule. <strong>FAANG India packages are structured with the highest RSU component</strong>: at Google India, RSUs account for approximately 32% of total compensation and vest quarterly after the one-year cliff.</p>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-b">54%</div><div className="rpt-lbl">Of product-company freshers (10 to 25 LPA band) receive ESOPs at joining (Weekday.works)</div></div>
              <div className="rpt-stat"><div className="rpt-val">23%</div><div className="rpt-lbl">Average ESOP share of total comp in that band (4-year vesting standard)</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">~1%</div><div className="rpt-lbl">Of Indian startups that have run actual ESOP buyback programs: liquidity is not guaranteed</div></div>
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The four questions to ask before accepting any offer with equity</div>
              <p>(1) What is the current 409A / fair market value per share? (2) What percentage of the company does this grant represent? (3) Has the company run a secondary sale or buyback before? (4) What happens to my unvested shares if I leave before the 4-year cliff? ESOP value at a pre-IPO startup is speculative. RSUs at Google or Microsoft are liquid within days of vesting.</p>
            </div>
            <p className="rpt-source">Source: Weekday.works State of Tech Salaries India (ESOP data), Levels.fyi Google India, TCS/Infosys salary breakdowns (PrepInsta, CloudDevOpsJobs), Business Standard</p>
          </div>

          {/* Finding 8 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 08</span>
              <h2 className="rpt-h2">IT Services path vs Product/GCC path: same starting point, very different year 5.</h2>
              <p className="rpt-lead">Both are real career paths. Both are accessible. But the salary trajectories diverge sharply by year two, and the gap compounds. Here is the full picture so you can choose with your eyes open.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Total compensation trajectory: Product/GCC path vs IT Services path (LPA, median)</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="trajectoryChart"></canvas></div>
            </div>

            <div className="rpt-two-col" style={{ marginTop: 24 }}>
              <div>
                <div className="rpt-col-head">Product / GCC path</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Year 0", "SWE-1 / Junior Engineer: 10 to 18 LPA", "Bengaluru / Hyderabad / Pune"],
                      ["Year 1-2", "SWE-1 / SWE-2: 13 to 22 LPA", "6-month performance cycles"],
                      ["Year 3", "SWE-2 / Senior SWE: 18 to 28 LPA", "First ESOP vest window"],
                      ["Year 5", "Senior / Staff SWE: 28 to 45 LPA", "Metro / remote / global"],
                    ].map(([yr, role, loc]) => (
                      <div key={yr as string} style={{ borderLeft: "3px solid #3b82f6", paddingLeft: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: 1 }}>{yr}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#171717" }}>{role}</div>
                        <div style={{ fontSize: 11, color: "#737373" }}>{loc}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#eff6ff", border: "1px solid #93c5fd" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#1d4ed8" }}>Pros</div>
                    <div style={{ fontSize: 12, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>Faster salary growth · Equity upside · Global skill portability · Remote-friendly · Exit to senior IC or management at scale</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">IT Services path</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Year 0", "Systems Engineer / Trainee: 3.4 to 6.25 LPA", "Pan-India, including tier-2/3"],
                      ["Year 1-2", "Junior Engineer / Analyst: 4 to 8 LPA", "5 to 7% annual increments"],
                      ["Year 3", "Engineer / Senior Analyst: 6 to 10 LPA", "Lateral move window opens"],
                      ["Year 5", "Senior Engineer / Module Lead: 8 to 14 LPA", "Or 14 to 22 LPA post-lateral"],
                    ].map(([yr, role, loc]) => (
                      <div key={yr as string} style={{ borderLeft: "3px solid #10b981", paddingLeft: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: 1 }}>{yr}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#171717" }}>{role}</div>
                        <div style={{ fontSize: 11, color: "#737373" }}>{loc}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#d0fae4", border: "1px solid #10b981" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#065f46" }}>Pros</div>
                    <div style={{ fontSize: 12, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>Accessible from any college tier · Pan-India locations · Structured onboarding · Campus recruitment pipeline · Stable, predictable comp</div>
                  </div>
                </div>
              </div>
            </div>

            <p className="rpt-prose" style={{ marginTop: 24 }}>The services path is not a dead end. It is a skills incubator that becomes a salary suppressor if you stay too long. Developers who start in services and pivot to product at Year 2 to 3 (once DSA is solid and 1 to 2 real projects are built) typically negotiate 50 to 100% salary jumps on the switch. <strong>The mistake is not starting in services. The mistake is staying without a plan to move.</strong></p>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">The lateral move playbook</div>
              <p>The optimal window to switch from services to product is Year 2 to 3. At that point you have enough experience to get past resume screens, but your salary is still low enough that product companies can make you a competitive offer. After Year 4 to 5, your service-company salary expectation can become a mismatch with product company bands. Move earlier, not later.</p>
            </div>
            <p className="rpt-source">Source: Priygop SWE salary year-by-year 2026, Sharpener.tech SWE salary guide, upGrad software engineer salary India, 6figr India data</p>
          </div>

          {/* Final CTA */}
          <div className="rpt-final-cta">
            <h2 className="rpt-final-cta-title">Work on things that matter.</h2>
            <p className="rpt-final-cta-sub">Use the Studojo Outreach tool to find SWE, AI/ML, and product company roles across India. Build a resume that shows real skills, not just a degree.</p>
            <div className="rpt-final-cta-btns">
              <Link to="/outreach" className="rpt-btn-white">Find CS Roles</Link>
              <Link to="/dojos/careers" className="rpt-btn-outline">Build Your Resume Free</Link>
              <Link to="https://chat.whatsapp.com/CUV8DSjQWqB82yXKRE66ol" target="_blank" rel="noopener noreferrer" className="rpt-btn-outline">Join the Student Community</Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

const rptCSS = `
  .rpt-hero { background:#171717; color:#fff; padding:56px 24px 48px; }
  .rpt-hero-inner { max-width:800px; margin:0 auto; }
  .rpt-badge { display:inline-flex; align-items:center; background:#3b82f6; border:2px solid #60a5fa; border-radius:999px; padding:4px 14px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#fff; margin-bottom:12px; }
  .rpt-breadcrumb { display:flex; align-items:center; gap:6px; font-size:13px; color:#737373; margin-bottom:14px; }
  .rpt-breadcrumb-link { color:#93c5fd; text-decoration:none; }
  .rpt-breadcrumb-link:hover { text-decoration:underline; }
  .rpt-breadcrumb-sep { color:#525252; }
  .rpt-h1 { font-family:'Clash Display',sans-serif; font-size:clamp(28px,5vw,48px); font-weight:700; line-height:1.1; color:#fff; margin-bottom:16px; }
  .rpt-h1 em { font-style:italic; color:#bfdbfe; }
  .rpt-hero-sub { font-size:16px; color:#a3a3a3; line-height:1.7; max-width:600px; margin-bottom:28px; }
  .rpt-hero-stats { display:flex; gap:40px; flex-wrap:wrap; padding-top:24px; border-top:1px solid #333; }
  .rpt-hval { font-family:'Clash Display',sans-serif; font-size:26px; font-weight:700; color:#bfdbfe; }
  .rpt-hlbl { font-size:12px; color:#737373; margin-top:2px; }
  .rpt-cta-strip { background:#eff6ff; border-bottom:2px solid #171717; padding:12px 24px; }
  .rpt-cta-strip-inner { max-width:800px; margin:0 auto; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
  .rpt-cta-strip-text { font-size:14px; font-weight:500; color:#525252; }
  .rpt-cta-pill { display:inline-flex; align-items:center; background:#3b82f6; color:#fff; border:2px solid #171717; border-radius:999px; padding:5px 16px; font-size:12px; font-weight:700; text-decoration:none; box-shadow:2px 2px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-cta-pill:hover { transform:translate(1px,1px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-content { max-width:800px; margin:0 auto; padding:0 24px 80px; }
  .rpt-finding { margin-top:64px; }
  .rpt-finding-header { margin-bottom:28px; }
  .rpt-finding-num { display:inline-block; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#3b82f6; margin-bottom:8px; }
  .rpt-h2 { font-family:'Clash Display',sans-serif; font-size:clamp(20px,3vw,28px); font-weight:700; line-height:1.2; color:#171717; margin-bottom:10px; }
  .rpt-lead { font-size:15px; color:#525252; line-height:1.7; max-width:640px; }
  .rpt-prose { font-size:15px; line-height:1.75; color:#525252; margin-bottom:24px; }
  .rpt-prose strong { color:#171717; font-weight:700; }
  .rpt-source { font-size:11px; color:#a3a3a3; margin-top:16px; }
  .rpt-card { background:#fff; border:2px solid #171717; border-radius:20px; padding:28px; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); margin-bottom:20px; }
  .rpt-card-label { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#737373; margin-bottom:16px; }
  .rpt-chart-wrap { position:relative; }
  .rpt-chart-wrap canvas { width:100%!important; }
  .rpt-stat-row { display:grid; gap:16px; margin-bottom:20px; }
  .rpt-c2 { grid-template-columns:repeat(2,1fr); }
  .rpt-c3 { grid-template-columns:repeat(3,1fr); }
  .rpt-c4 { grid-template-columns:repeat(4,1fr); }
  .rpt-stat { background:#f5f5f5; border:2px solid #171717; border-radius:16px; padding:18px 16px; }
  .rpt-val { font-family:'Clash Display',sans-serif; font-size:28px; font-weight:700; line-height:1; margin-bottom:6px; }
  .rpt-b { color:#3b82f6; } .rpt-v { color:#8b5cf6; } .rpt-g { color:#10b981; } .rpt-o { color:#f59e0b; }
  .rpt-lbl { font-size:12px; color:#525252; line-height:1.45; font-weight:500; }
  .rpt-delta { display:inline-block; font-size:11px; font-weight:700; margin-top:6px; padding:2px 8px; border-radius:999px; }
  .rpt-du { background:#d0fae4; color:#065f46; } .rpt-dn { background:#f5f5f5; color:#737373; border:1px solid #e5e5e5; }
  .rpt-callout { border:2px solid #171717; border-radius:16px; padding:20px 22px; margin-top:20px; }
  .rpt-cp { background:#eff6ff; border-color:#3b82f6; } .rpt-cg { background:#d0fae4; border-color:#10b981; } .rpt-co { background:#fef3c6; border-color:#f59e0b; } .rpt-cd { background:#171717; border-color:#171717; color:#fff; }
  .rpt-cl { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }
  .rpt-cp .rpt-cl { color:#1d4ed8; } .rpt-cg .rpt-cl { color:#065f46; } .rpt-co .rpt-cl { color:#92400e; } .rpt-cd .rpt-cl { color:#bfdbfe; }
  .rpt-callout p { font-size:14px; line-height:1.7; }
  .rpt-pullquote { border-left:4px solid #3b82f6; padding:16px 20px; margin:24px 0; background:#eff6ff; border-radius:0 12px 12px 0; }
  .rpt-pullquote p { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:600; line-height:1.45; color:#171717; }
  .rpt-bar-list { display:flex; flex-direction:column; gap:10px; }
  .rpt-bar-row { display:grid; grid-template-columns:190px 1fr 80px; align-items:center; gap:12px; }
  .rpt-bar-row.rpt-narrow { grid-template-columns:140px 1fr; }
  .rpt-bar-label { font-size:12px; font-weight:500; color:#171717; line-height:1.35; }
  .rpt-bar-label small { display:block; font-size:11px; color:#737373; font-weight:400; }
  .rpt-bar-track { height:28px; background:#f5f5f5; border:1px solid #e5e5e5; border-radius:6px; overflow:hidden; }
  .rpt-bar-fill { height:100%; border-radius:6px 0 0 6px; display:flex; align-items:center; padding-left:10px; font-size:11px; font-weight:700; color:#fff; white-space:nowrap; }
  .rpt-bar-value { font-size:12px; font-weight:700; color:#171717; text-align:right; }
  .rpt-bar-value small { display:block; font-size:10px; color:#737373; font-weight:400; }
  .rpt-two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .rpt-col-head { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#737373; margin-bottom:12px; }
  .rpt-mini-total { border-radius:10px; padding:14px 16px; margin-top:14px; }
  .rpt-mini-total-label { font-size:11px; font-weight:700; }
  .rpt-donut-layout { display:grid; grid-template-columns:200px 1fr; gap:32px; align-items:center; }
  .rpt-legend-list { display:flex; flex-direction:column; gap:10px; }
  .rpt-legend-item { display:flex; align-items:center; gap:12px; }
  .rpt-legend-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; border:2px solid; }
  .rpt-legend-text { font-size:13px; color:#171717; flex:1; font-weight:500; }
  .rpt-legend-pct { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; color:#171717; }
  .rpt-pill-row { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
  .rpt-pill { border:2px solid #171717; border-radius:999px; padding:5px 14px; font-size:12px; font-weight:700; }
  .rpt-pg { background:#d0fae4; color:#065f46; border-color:#10b981; } .rpt-po { background:#fef3c6; color:#92400e; border-color:#f59e0b; } .rpt-pr { background:#fee2e2; color:#991b1b; border-color:#ef4444; }
  .rpt-inline-cta { background:#eff6ff; border:2px solid #171717; border-radius:20px; padding:24px 28px; margin:32px 0; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); }
  .rpt-inline-cta-inner { display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; }
  .rpt-inline-cta-title { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; color:#171717; margin-bottom:4px; }
  .rpt-inline-cta-sub { font-size:13px; color:#525252; }
  .rpt-btn-primary { display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 24px; background:#3b82f6; color:#fff; border:2px solid #171717; border-radius:14px; font-size:13px; font-weight:700; text-decoration:none; white-space:nowrap; box-shadow:3px 3px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-btn-primary:hover { transform:translate(2px,2px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-final-cta { margin-top:64px; background:#3b82f6; border:2px solid #171717; border-radius:24px; padding:48px 40px; text-align:center; box-shadow:6px 6px 0px 0px rgba(25,26,35,1); }
  .rpt-final-cta-title { font-family:'Clash Display',sans-serif; font-size:clamp(24px,4vw,36px); font-weight:700; color:#fff; margin-bottom:12px; }
  .rpt-final-cta-sub { font-size:15px; color:rgba(255,255,255,0.8); max-width:560px; margin:0 auto 28px; line-height:1.65; }
  .rpt-final-cta-btns { display:flex; flex-wrap:wrap; gap:12px; justify-content:center; }
  .rpt-btn-white { display:inline-flex; align-items:center; justify-content:center; height:48px; padding:0 28px; background:#fff; color:#171717; border:2px solid #171717; border-radius:16px; font-size:14px; font-weight:700; text-decoration:none; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-btn-white:hover { transform:translate(2px,2px); box-shadow:2px 2px 0px 0px rgba(25,26,35,1); }
  .rpt-btn-outline { display:inline-flex; align-items:center; justify-content:center; height:48px; padding:0 28px; background:rgba(255,255,255,0.12); color:#fff; border:2px solid rgba(255,255,255,0.4); border-radius:16px; font-size:14px; font-weight:700; text-decoration:none; transition:background 0.15s; }
  .rpt-btn-outline:hover { background:rgba(255,255,255,0.2); }
  @media(max-width:640px){
    .rpt-c4{grid-template-columns:1fr 1fr!important;} .rpt-c3{grid-template-columns:1fr 1fr!important;}
    .rpt-bar-row{grid-template-columns:110px 1fr 50px;} .rpt-bar-row.rpt-narrow{grid-template-columns:100px 1fr;}
    .rpt-donut-layout{grid-template-columns:1fr;} .rpt-two-col{grid-template-columns:1fr;}
    .rpt-inline-cta-inner{flex-direction:column;align-items:flex-start;}
    .rpt-hero-stats{gap:20px;} .rpt-final-cta{padding:32px 20px;}
  }
`;
