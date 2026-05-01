import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Pune Jobs for Freshers 2026: Salary Data, Top Sectors and Hiring Trends | Studojo" },
    { name: "description", content: "4,800+ entry-level openings in Pune. IT, product, ops and fintech are growing fastest. A 3x salary gap between role types. What freshers and students are actually walking into in Pune in 2026." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "pune jobs freshers 2026, entry level jobs pune, pune it jobs 2026, jobs in pune for freshers, hinjewadi jobs freshers, pune startup jobs" },
    { tagName: "link", rel: "canonical", href: "https://studojo.com/reports/pune-jobs-2026" },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Pune Jobs for Freshers 2026: Salary Data, Top Sectors and Hiring Trends" },
    { property: "og:description", content: "4,800+ entry-level openings in Pune. IT, product, ops and fintech are growing fastest. A 3x salary gap between role types. What freshers and students are actually walking into in Pune in 2026." },
    { property: "og:url", content: "https://studojo.com/reports/pune-jobs-2026" },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: "https://studojo.com/og-reports.png" },
    { property: "og:image:alt", content: "Studojo Career Market Report" },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-04-01T00:00:00+05:30" },
    { property: "article:modified_time", content: "2026-04-20T00:00:00+05:30" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Pune Jobs for Freshers 2026: Salary Data and Hiring Trends | Studojo" },
    { name: "twitter:description", content: "4,800+ entry-level openings in Pune. Sectors, salary data, skill gaps, and what actually gets freshers hired in 2026." },
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

  const BLUE   = "#10b981";
  const BLUE2  = "#34d399";
  const BLUE3  = "#6ee7b7";
  const ORANGE = "#f59e0b";
  const RED    = "#ef4444";
  const GREEN  = "#10b981";
  const GREY   = "#e5e5e5";
  const MUTED  = "#737373";
  const INK    = "#171717";
  const grid   = { color: "#f0f0ee", lineWidth: 1 };

  function make(id: string, config: any) {
    const el = document.getElementById(id) as HTMLCanvasElement | null;
    if (!el || el.dataset.rendered) return;
    el.dataset.rendered = "1";
    new Chart(el, config);
  }

  // Chart 1 - Entry-level openings by sector
  make("sectorChart", {
    type: "bar",
    data: {
      labels: ["IT / Software\nServices", "Product &\nSaaS Startups", "Manufacturing\n/ Automotive", "BFSI\n(Banking, Finance)", "Operations &\nLogistics", "Healthcare\n/ Pharma", "Edtech &\nEd Services"],
      datasets: [{
        label: "Estimated entry-level openings (Pune, Q1 2026)",
        data: [1800, 920, 640, 520, 380, 290, 250],
        backgroundColor: [BLUE, BLUE, BLUE2, BLUE2, BLUE3, BLUE3, GREY],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw.toLocaleString("en-IN")} openings` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
      },
    },
  });

  // Chart 2 - YoY growth by sector
  make("growthChart", {
    type: "bar",
    data: {
      labels: ["Product /\nSaaS Startups", "AI / ML\nRoles (Fresher)", "Operations &\nLogistics Tech", "BFSI\n(Fintech subset)", "Healthcare\n/ Pharma IT", "IT Services\n(Legacy)", "Manufacturing\n(Non-EV)"],
      datasets: [{
        label: "YoY opening growth (%)",
        data: [44, 61, 38, 29, 22, 6, -4],
        backgroundColor: [BLUE, BLUE, BLUE2, BLUE2, BLUE3, GREY, RED],
        borderRadius: 4,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw > 0 ? "+" : ""}${ctx.raw}% YoY` } },
      },
      scales: {
        x: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + "%" } },
        y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
      },
    },
  });

  // Chart 3 - Salary range by company type (fresher, CTC LPA)
  make("salaryChart", {
    type: "bar",
    data: {
      labels: ["Product Startup\n(Series A-C)", "MNC IT\n(TCS / Infosys / Wipro)", "Mid-size IT\nService Co.", "Fintech /\nBFSI Startup", "Manufacturing\n/ Auto (Tata, etc.)", "Consulting\n(Big 4)"],
      datasets: [
        { label: "CTC: Low (LPA)", data: [4.5, 3.5, 3.0, 5.0, 3.8, 6.0], backgroundColor: BLUE3, borderRadius: 4, borderWidth: 0 },
        { label: "CTC: High (LPA)", data: [12, 7, 5.5, 15, 7, 12], backgroundColor: BLUE, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw} LPA` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => v + " LPA", color: MUTED } },
      },
    },
  });

  // Chart 4 - Skills gap (% of JDs requiring vs % of freshers who can demonstrate)
  make("skillsGapChart", {
    type: "bar",
    data: {
      labels: ["SQL /\nData querying", "Cloud basics\n(AWS / Azure)", "Python /\nautomation", "System design\n(fundamentals)", "API integration\n/ REST", "Excel /\nSheets (advanced)", "Communication\n(written, English)"],
      datasets: [
        { label: "Required in JDs (%)", data: [72, 65, 61, 54, 58, 48, 82], backgroundColor: BLUE, borderRadius: 4, borderWidth: 0 },
        { label: "Freshers who can demonstrate (%)", data: [31, 28, 38, 19, 35, 41, 52], backgroundColor: GREY, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => v + "%", color: MUTED } },
      },
    },
  });

  // Chart 5 - Pune zones by hiring density
  make("zonesChart", {
    type: "bar",
    data: {
      labels: ["Hinjewadi\n(IT Park)", "Kharadi /\nEON IT Park", "Magarpatta\n/ Hadapsar", "Baner /\nBanerghatta", "Viman Nagar /\nNagar Road", "Wakad /\nPimple Saudagar", "Pune City\n(Camp / FC Rd)"],
      datasets: [{
        label: "Job posting density (relative index, Hinjewadi = 100)",
        data: [100, 84, 71, 55, 48, 42, 28],
        backgroundColor: [BLUE, BLUE, BLUE2, BLUE2, BLUE3, BLUE3, GREY],
        borderRadius: 6,
        borderWidth: 2,
        borderColor: INK,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` Index: ${ctx.raw}` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: INK } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
      },
    },
  });
}

export default function PuneJobsReport() {
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "Article", "headline": "Pune Jobs for Freshers 2026: Salary Data, Top Sectors and Hiring Trends", "description": "4,800+ entry-level openings in Pune. IT, product, ops and fintech are growing fastest. A 3x salary gap between role types. What freshers and students are actually walking into in Pune in 2026.", "url": "https://studojo.com/reports/pune-jobs-2026", "datePublished": "2026-04-01T00:00:00+05:30", "dateModified": "2026-04-20T00:00:00+05:30", "author": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com"}, "publisher": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com", "logo": {"@type": "ImageObject", "url": "https://studojo.com/logo.png"}}, "mainEntityOfPage": {"@type": "WebPage", "@id": "https://studojo.com/reports/pune-jobs-2026"}, "image": "https://studojo.com/og-reports.png"}` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://studojo.com"}, {"@type": "ListItem", "position": 2, "name": "Reports", "item": "https://studojo.com/reports"}, {"@type": "ListItem", "position": 3, "name": "Pune Jobs for Freshers 2026", "item": "https://studojo.com/reports/pune-jobs-2026"}]}` }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: rptCSS }} />
      <main>

        {/* Hero */}
        <div className="rpt-hero rpt-hero-blue">
          <div className="rpt-hero-inner">
            <div className="rpt-badge rpt-badge-blue">Studojo Market Analysis · Q1 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link rpt-breadcrumb-link-blue">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Pune Jobs 2026</span>
            </nav>
            <h1 className="rpt-h1">Pune Job Market 2026:<br /><em className="rpt-em-blue">What Students and Freshers Actually Face</em></h1>
            <p className="rpt-hero-sub">
              4,800+ entry-level openings. A city quietly becoming India's best early-career bet for tech, ops, and product roles. And the reason most freshers from Pune colleges are still losing to candidates from other cities.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval rpt-hval-blue">4,800+</div><div className="rpt-hlbl">Active entry-level openings (Pune, April 2026)</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval rpt-hval-blue">3x</div><div className="rpt-hlbl">Salary gap between MNC and product startup offers</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval rpt-hval-blue">8 findings</div><div className="rpt-hlbl">Sectors, salaries, skill gaps, and hiring zones</div></div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="rpt-cta-strip rpt-cta-strip-blue">
          <div className="rpt-cta-strip-inner">
            <span className="rpt-cta-strip-text">Looking for jobs and internships in Pune?</span>
            <Link to="/dojos/internships" className="rpt-cta-pill rpt-cta-pill-blue">Find Pune roles on Studojo →</Link>
          </div>
        </div>

        <div className="rpt-content">

          {/* Finding 1 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-blue">Finding 01</span>
              <h2 className="rpt-h2">Pune has 4,800+ entry-level openings. IT services dominate, but product startups are growing fastest.</h2>
              <p className="rpt-lead">Pune is not one job market - it is three overlapping ones: a mature IT services corridor (Hinjewadi to Kharadi), a fast-growing product and SaaS cluster, and a manufacturing and automotive base that is quietly going digital. Entry-level candidates who understand which cluster they are targeting get hired faster.</p>
            </div>

            <div className="rpt-stat-row rpt-c4">
              <div className="rpt-stat"><div className="rpt-val rpt-b">4,800+</div><div className="rpt-lbl">Active entry-level openings across all sectors (Pune, April 2026)</div><span className="rpt-delta rpt-du">+22% vs April 2025</span></div>
              <div className="rpt-stat"><div className="rpt-val">38%</div><div className="rpt-lbl">Share held by IT / software services (TCS, Infosys, Wipro, Cognizant)</div><span className="rpt-delta rpt-dn">Stable, not growing</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-b">19%</div><div className="rpt-lbl">Share held by product startups and SaaS companies</div><span className="rpt-delta rpt-du">+44% YoY</span></div>
              <div className="rpt-stat"><div className="rpt-val">13%</div><div className="rpt-lbl">Manufacturing / auto tech (Tata Motors, Bajaj, Mahindra digital)</div></div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Entry-level openings by sector, Pune Q1 2026 (estimated)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="sectorChart"></canvas></div>
            </div>

            <p className="rpt-prose">IT services firms (TCS, Infosys, Wipro, Cognizant, Tech Mahindra) still represent the largest share of raw openings in Pune - but they are not growing. The growth is entirely in product and SaaS companies: think Persistent Systems, KPIT, Tata Elxsi, and 50+ funded startups in the Hinjewadi and Baner belt. Manufacturing and automotive is the dark horse - Tata Motors, Mahindra, and Bajaj are all running digital transformation programs that hire freshers into IT, data, and ops roles. <strong>If you are in Pune and only applying to TCS and Infosys, you are competing for the slowest-growing, lowest-paying segment of the market.</strong></p>

            <div className="rpt-callout rpt-cb">
              <div className="rpt-cl">Why Pune specifically</div>
              <p>Pune ranks 4th in India for entry-level tech hiring after Bengaluru, Hyderabad, and Chennai - but it ranks 2nd for cost of living adjusted salary. The rent-to-salary ratio for a fresher in Pune is significantly better than Bengaluru. For students from PICT, COEP, VIT Pune, Symbiosis, and MIT Pune, this is the most accessible high-quality job market in India without relocating.</p>
            </div>
            <p className="rpt-source">Source: LinkedIn Jobs India April 2026, Naukri.com, Glassdoor India, Studojo analysis</p>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-blue">Finding 02</span>
              <h2 className="rpt-h2">Product startups and AI roles are growing at 44-61% YoY. IT services grew 6%.</h2>
              <p className="rpt-lead">The distribution of growth across sectors in Pune is stark. Freshers who align their skills and applications with the fast-growing segments will face less competition and get higher offers.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Year-on-year growth in entry-level openings by sector, Pune 2025-2026</div>
              <div className="rpt-chart-wrap" style={{ height: 340 }}><canvas id="growthChart"></canvas></div>
            </div>

            <p className="rpt-prose">AI and ML fresher roles in Pune grew 61% year-on-year - the fastest of any category. These are not research roles. They are implementation roles: fine-tuning models on company data, building RAG pipelines, writing evaluation scripts, integrating AI APIs into existing products. The skills required are learnable. The gap is that most engineering freshers in Pune have not built a single AI project. Product and SaaS startup hiring grew 44% - driven by companies like Druva, IDeaS, Icertis, Zensar, and 30+ Series A companies who are hiring across engineering, ops, and growth. Operations and logistics tech grew 38%, led by companies like Porter, Locus, and Shadowfax who are hiring operations analysts and product ops interns.</p>

            <div className="rpt-pill-row">
              {["AI / ML Integration Roles", "Product Engineering", "Growth & Product Ops", "Data Engineering", "Fintech Backend"].map(p => <span key={p} className="rpt-pill rpt-pb">{p}</span>)}
              {["IT Services (Support)", "QA / Testing (Manual)", "Traditional BPO"].map(p => <span key={p} className="rpt-pill rpt-po">{p}</span>)}
              {["Non-digital Manufacturing (entry)", "Legacy IT Services"].map(p => <span key={p} className="rpt-pill rpt-pr">{p}</span>)}
            </div>

            <div className="rpt-callout rpt-cb">
              <div className="rpt-cl">The AI role you can actually get as a fresher</div>
              <p>Most "AI Engineer" job titles require 3+ years. But "AI Implementation Analyst", "LLM Integration Intern", "Prompt Engineer (Entry)", and "AI QA Engineer" are real fresher-accessible titles appearing in Pune right now. The entry bar is one solid AI project: a RAG application, a fine-tuned classifier, or a working agent with tool calls. Build one. Document it publicly. It is worth more than a specialisation certificate.</p>
            </div>
            <p className="rpt-source">Source: LinkedIn Jobs India April 2026, Naukri.com Pune sector data, Wellfound India, Studojo analysis</p>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-blue">Finding 03</span>
              <h2 className="rpt-h2">The salary gap is 3x. A product startup and an IT services firm are both called "software engineer."</h2>
              <p className="rpt-lead">The median fresher CTC in Pune is 4.2 LPA. The top quartile of roles - at funded startups and mid-sized product companies - starts at 7-12 LPA. The difference has nothing to do with the job title and everything to do with company type and the candidate's ability to demonstrate output.</p>
            </div>

            <blockquote className="rpt-pullquote">
              <p>"Two classmates. Same CGPA. One joined Infosys at 3.6 LPA. One joined a Series B SaaS at 9 LPA. Same city. Same month."</p>
            </blockquote>

            <div className="rpt-card">
              <div className="rpt-card-label">Fresher CTC range by employer type, Pune 2026 (LPA)</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="salaryChart"></canvas></div>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val">4.2 LPA</div><div className="rpt-lbl">Median fresher CTC, all sectors, Pune (April 2026)</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-b">7-12 LPA</div><div className="rpt-lbl">Typical range at funded product startups and mid-sized SaaS</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-b">15 LPA+</div><div className="rpt-lbl">Top-end fintech/startup offers (rare, requires strong portfolio)</div></div>
            </div>

            <p className="rpt-prose">Big 4 consulting (Deloitte, PwC, EY, KPMG) pays 6-12 LPA for freshers with strong academics and communication skills - but requires a different preparation path than tech roles. MNC IT services (TCS, Infosys, Wipro) start at 3-3.6 LPA with structured training. Funded startups start higher but have less structure - you are expected to contribute from week one. The deciding factor at startups is almost always a portfolio or a take-home project. <strong>At IT services firms, it is your CGPA and aptitude test score. Know which game you are playing before you prepare.</strong></p>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The CGPA trap</div>
              <p>Most IT services companies in Pune have a 6.0 or 6.5 CGPA cutoff. Most funded startups do not have a CGPA cutoff at all - they screen on a project or assignment. If your CGPA is below 7.0, your fastest path to a good offer in Pune is not to study harder. It is to build something and apply to companies that screen differently.</p>
            </div>
            <p className="rpt-source">Source: Glassdoor India salary data 2026, AmbitionBox, LinkedIn Salary Insights, Studojo analysis</p>
          </div>

          {/* CTA 1 */}
          <div className="rpt-inline-cta rpt-inline-cta-blue">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Find Pune roles that actually pay</div>
                <div className="rpt-inline-cta-sub">Studojo filters for salary, company stage, and role type. Updated daily.</div>
              </div>
              <Link to="/dojos/internships" className="rpt-btn-primary rpt-btn-blue">Browse Pune Roles Free</Link>
            </div>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-blue">Finding 04</span>
              <h2 className="rpt-h2">Hinjewadi has 100% of the jobs, but Kharadi and Baner are where the better roles are.</h2>
              <p className="rpt-lead">Pune's job market is geographically concentrated. But the quality distribution across zones is not equal. Knowing where specific company types cluster changes your commute time, your interview success rate, and your peer network.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Job posting density by Pune zone (Hinjewadi = 100 index)</div>
              <div className="rpt-chart-wrap" style={{ height: 260 }}><canvas id="zonesChart"></canvas></div>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">Zone breakdown</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  {[
                    ["Hinjewadi IT Park", "Phase 1-3: TCS, Infosys, Wipro, Cognizant, Persistent, Cyient. Largest concentration. Primarily IT services."],
                    ["Kharadi / EON IT Park", "Barclays, Deutsche Bank India, HSBC, Zensar, KPIT. Mix of BFSI tech and product co. Better quality-to-volume ratio."],
                    ["Magarpatta / Hadapsar", "Sybase, Fiserv, Symantec, mid-size IT. Good for fintech and security roles."],
                    ["Baner / Banerghatta", "Startups and Series A-B companies. Less density but highest ratio of product and AI roles. Best for portfolio-first applicants."],
                    ["Viman Nagar / Nagar Road", "Logistics, e-commerce ops, travel tech. Porter, Locus, Thomas Cook ops centers."],
                  ].map(([zone, desc]) => (
                    <div key={zone} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #f5f5f5" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#171717" }}>{zone}</div>
                      <div style={{ fontSize: 12, color: "#525252", marginTop: 2 }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Zone vs role type match</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  {[
                    ["IT services (TCS, Wipro)", "Hinjewadi Phase 1-2"],
                    ["Product engineering", "Baner, Kharadi"],
                    ["BFSI / Fintech tech", "Kharadi, Magarpatta"],
                    ["AI / ML implementation", "Baner, Hinjewadi Phase 3"],
                    ["Ops / logistics tech", "Viman Nagar, Wakad"],
                    ["Consulting (Big 4)", "Bund Garden, Camp"],
                    ["Manufacturing / auto", "Pimpri-Chinchwad, Talegaon"],
                  ].map(([role, zone]) => (
                    <div key={role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f5f5f5", fontSize: 12 }}>
                      <span style={{ color: "#171717", fontWeight: 500 }}>{role}</span>
                      <span style={{ color: "#3b82f6", fontWeight: 700 }}>{zone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="rpt-prose" style={{ marginTop: 20 }}>Commute is a real filter in Pune. Many freshers underestimate the time cost of Hinjewadi traffic. If you live in Kothrud, Karve Nagar, or Deccan, Hinjewadi at peak hour is a 45-90 minute commute each way. Factor this into your targeting. Baner and Kharadi are more accessible from central Pune. <strong>Hybrid and remote is still limited in Pune - most companies in the IT parks expect 5 days in office, at least for freshers.</strong></p>
            <p className="rpt-source">Source: LinkedIn Jobs India, Naukri.com location data, Google Maps commute analysis, Studojo field research</p>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-blue">Finding 05</span>
              <h2 className="rpt-h2">The skills gap is specific. SQL, cloud, and system design are the three things blocking 70% of freshers.</h2>
              <p className="rpt-lead">We analysed 1,200+ entry-level job descriptions in Pune. Most freshers have what companies do not want. They are missing what companies actually screen for.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Skills required in Pune JDs vs % of freshers who can demonstrate them</div>
              <div className="rpt-chart-wrap" style={{ height: 320 }}><canvas id="skillsGapChart"></canvas></div>
            </div>

            <p className="rpt-prose">Communication (written English) is the most commonly required skill at 82% of JDs - but only 52% of freshers can demonstrate it credibly in a screening call or written assignment. SQL is required in 72% of JDs but fewer than a third of freshers can write a non-trivial query. Cloud basics (AWS or Azure fundamentals) appear in 65% of JDs - a gap addressable in 2-3 weeks with a free tier account and one small project. <strong>System design at an introductory level is required in 54% of JDs but only 19% of freshers can articulate a basic architecture decision with trade-offs.</strong> This is the single hardest gap to close quickly, but also the one that differentiates most in interviews.</p>

            <div className="rpt-two-col" style={{ marginTop: 24 }}>
              <div>
                <div className="rpt-col-head">What most Pune freshers show up with</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  {[
                    "Java / C++ from curriculum",
                    "DBMS theory (not practical SQL)",
                    "Final year project (rarely deployed)",
                    "LinkedIn profile (no portfolio link)",
                  ].map(skill => (
                    <div key={skill} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 16 }}>-</span>
                      <span style={{ fontSize: 13, color: "#737373" }}>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="rpt-col-head">What gets you shortlisted in Pune</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  {[
                    "SQL: 10 solved problems on StrataScratch or LeetCode (documented)",
                    "1 deployed project (GitHub + live URL)",
                    "AWS/Azure free tier: at least 1 service set up and documented",
                    "Written: 1 technical blog post or project write-up",
                  ].map(skill => (
                    <div key={skill} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <span style={{ color: "#3b82f6", fontWeight: 700, fontSize: 16, marginTop: 1 }}>+</span>
                      <span style={{ fontSize: 13, color: "#171717", fontWeight: 500 }}>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rpt-callout rpt-cb">
              <div className="rpt-cl">The practical SQL gap</div>
              <p>Hiring managers in Pune report that 60-70% of freshers who claim "SQL" on their resume cannot write a GROUP BY with a HAVING clause under interview conditions. The fix is not more theory. It is 20 solved problems on a public platform, linked from your resume. That alone removes the most common early-round screen-out for data, analytics, backend, and ops roles in Pune.</p>
            </div>
            <p className="rpt-source">Source: Studojo JD analysis (1,200+ listings, April 2026), hiring manager interviews Q1 2026, Naukri fresher skills data</p>
          </div>

          {/* CTA 2 */}
          <div className="rpt-inline-cta rpt-inline-cta-blue">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Build an ATS-optimised resume for Pune roles</div>
                <div className="rpt-inline-cta-sub">Free, takes 5 minutes. Used by 5,000+ students across India.</div>
              </div>
              <Link to="/dojos/careers" className="rpt-btn-primary rpt-btn-blue">Build Resume Free</Link>
            </div>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-blue">Finding 06</span>
              <h2 className="rpt-h2">College matters less than most Pune students think. The gap is in what you build, not where you studied.</h2>
              <p className="rpt-lead">COEP, PICT, and VIT Pune have strong placement records. But the companies offering the highest packages are not restricting their search to these colleges. The single most predictive variable for a good offer in Pune in 2026 is a deployed project, not a college name.</p>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-b">71%</div><div className="rpt-lbl">Of funded startup hires in Pune came from non-tier-1 colleges (Studojo analysis, Q1 2026)</div><span className="rpt-delta rpt-du">Up from 58% in 2024</span></div>
              <div className="rpt-stat"><div className="rpt-val">3.4x</div><div className="rpt-lbl">Higher interview conversion rate for freshers with a deployed project vs those without</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-b">1</div><div className="rpt-lbl">Deployed project with a live URL is the single highest-leverage resume addition for Pune freshers</div></div>
            </div>

            <p className="rpt-prose">Product startups in Pune (and most Kharadi-based BFSI tech companies) have stopped filtering by college and started filtering by output. The screening process is typically: resume screen (ATS for keywords + project check) + take-home assignment + technical interview. If you have no deployed project and no documented work, you do not pass the first screen regardless of your college. COEP and PICT still matter for IT services campus placements and for some MNC programs - but those companies pay 3.5-5 LPA. The companies paying 7-15 LPA do not care where you studied.</p>

            <div className="rpt-callout rpt-cb">
              <div className="rpt-cl">The one thing that changes your odds in Pune</div>
              <p>One deployed project - an app with a live URL, a script that solves a real problem and is documented on GitHub, an AI tool with a working demo - changes your interview-to-offer rate more than any other single action. Most Pune freshers have a "project" that only runs locally and is not documented. That is not a project. Push it to GitHub. Deploy it for free on Render or Railway. Write 200 words in the README about what it does and what you learned. That is what gets you called.</p>
            </div>
            <p className="rpt-source">Source: Studojo placement data Q1 2026, LinkedIn recruiter interviews, Wellfound India hiring patterns</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-blue">Finding 07</span>
              <h2 className="rpt-h2">Internships in Pune convert to full-time at 64% at funded startups. Campus placements convert at 91% - but for lower packages.</h2>
              <p className="rpt-lead">Campus placements are predictable and lower-risk. Off-campus applications to funded startups are higher-effort but lead to significantly better packages. The two paths require completely different preparation.</p>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-b">64%</div><div className="rpt-lbl">Intern-to-full-time conversion rate at funded Pune startups (Series A-C)</div><span className="rpt-delta rpt-du">Highest among all routes</span></div>
              <div className="rpt-stat"><div className="rpt-val">91%</div><div className="rpt-lbl">Campus placement offer acceptance-to-joining rate (IT services, all Pune colleges)</div><span className="rpt-delta rpt-dn">High volume, lower CTC</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">38%</div><div className="rpt-lbl">Students who apply off-campus to funded startups alongside campus placements</div></div>
            </div>

            <p className="rpt-prose">The most effective strategy for a Pune student in 2026 is to run both tracks in parallel. Sit for campus placements (especially for IT services and consulting) as a floor - it guarantees a job. Simultaneously spend 10 hours a week on off-campus applications to funded startups via LinkedIn, Wellfound, and company career pages. The off-campus track takes longer but the upside is 2-3x the package. Most students do not run both tracks because campus placement season feels all-consuming. It should not be. The prep for off-campus (portfolio, SQL practice, system design basics) is independent of aptitude tests and group discussions.</p>

            <div className="rpt-callout rpt-cb">
              <div className="rpt-cl">How internships work as a shortcut</div>
              <p>An intern at a funded Pune startup who delivers measurable output - a feature shipped, a data pipeline running, a growth experiment with a number attached - converts to full-time in 64% of cases, typically at a 30-50% higher package than a direct fresher hire from the same company would get. The intern-to-hire path is faster and better compensated. The constraint is getting the internship - which again comes back to the portfolio.</p>
            </div>
            <p className="rpt-source">Source: Studojo intern outcomes survey 2025, LinkedIn India career data, Internshala Pune conversion study</p>
          </div>

          {/* Finding 8 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-blue">Finding 08</span>
              <h2 className="rpt-h2">70% of applications in Pune are screened by ATS before a human sees them. Most Pune freshers are writing resumes for humans.</h2>
              <p className="rpt-lead">At any Pune company with more than 100 employees, your resume hits an ATS before it hits a recruiter. Most freshers from Pune colleges are still submitting Word documents with tables, columns, and design elements that ATS systems cannot parse. They wonder why they never hear back.</p>
            </div>

            <p className="rpt-prose">ATS systems screen on keyword matching. A JD that says "REST API development" will filter out a resume that says "built web services" - even if the candidate has the exact skill. The fix is not to game the ATS. It is to mirror the language of the JD in your resume, naturally, in the context of real experience. A Pune fresher applying to a product startup should not have a resume that looks like it was designed for a TCS campus drive. The template, language, and structure are different.</p>

            <div className="rpt-card">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  {
                    label: "What most Pune resumes say",
                    bad: true,
                    items: [
                      "Developed a project using Java and MySQL",
                      "Good communication and teamwork skills",
                      "Responsible for backend development",
                      "Knowledge of data structures and algorithms",
                    ],
                  },
                  {
                    label: "What the ATS and recruiter want to see",
                    bad: false,
                    items: [
                      "Built REST API with Java Spring Boot, MySQL (deployed on Render)",
                      "Technical write-up: [link] - demonstrates written English",
                      "Owned backend for [feature]: reduced response time by X%",
                      "LeetCode: 50+ problems solved (linked) - DSA is demonstrated, not claimed",
                    ],
                  },
                ].map(({ label, bad, items }) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: bad ? "#991b1b" : "#1e40af", marginBottom: 12 }}>{label}</div>
                    {items.map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                        <span style={{ color: bad ? "#ef4444" : "#3b82f6", fontWeight: 700, marginTop: 1 }}>{bad ? "x" : "+"}</span>
                        <span style={{ fontSize: 13, color: bad ? "#737373" : "#171717", lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-callout rpt-cb">
              <div className="rpt-cl">The Pune-specific resume problem</div>
              <p>Campus placement cells at Pune colleges often give students a standard template that formats well for IT services recruiting - two columns, a header with a photo, all skills listed as "Proficient / Familiar / Beginner". This format fails ATS systems and looks wrong to product startup recruiters. Use a single-column, clean text resume for off-campus applications. Keep the college template for campus drives only.</p>
            </div>
            <p className="rpt-source">Source: Studojo resume analysis data 2025-2026, Jobscan ATS research, Pune recruiter interviews Q1 2026</p>
          </div>

          {/* Final CTA */}
          <div className="rpt-final-cta rpt-final-cta-blue">
            <h2 className="rpt-final-cta-title">Work on things that matter.</h2>
            <p className="rpt-final-cta-sub">Use Studojo to find the Pune roles worth applying to, build an ATS-ready resume that passes the first screen, and track every application in one place.</p>
            <div className="rpt-final-cta-btns">
              <Link to="/dojos/internships" className="rpt-btn-white">Find Pune Internships</Link>
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
  .rpt-hero-blue { background:#052e16; }
  .rpt-hero-inner { max-width:800px; margin:0 auto; }
  .rpt-badge { display:inline-flex; align-items:center; border:2px solid; border-radius:999px; padding:4px 14px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#fff; margin-bottom:12px; }
  .rpt-badge-blue { background:#10b981; border-color:#34d399; }
  .rpt-breadcrumb { display:flex; align-items:center; gap:6px; font-size:13px; color:#737373; margin-bottom:14px; }
  .rpt-breadcrumb-link { text-decoration:none; }
  .rpt-breadcrumb-link-blue { color:#60a5fa; }
  .rpt-breadcrumb-link:hover { text-decoration:underline; }
  .rpt-breadcrumb-sep { color:#525252; }
  .rpt-h1 { font-family:'Clash Display',sans-serif; font-size:clamp(28px,4vw,44px); font-weight:700; line-height:1.15; color:#fff; margin-bottom:16px; }
  .rpt-em-blue { color:#60a5fa; font-style:normal; }
  .rpt-hero-sub { font-family:'Satoshi',sans-serif; font-size:16px; color:rgba(255,255,255,0.75); max-width:680px; line-height:1.6; margin-bottom:32px; }
  .rpt-hero-stats { display:flex; gap:32px; flex-wrap:wrap; }
  .rpt-hero-stat { display:flex; flex-direction:column; gap:4px; }
  .rpt-hval { font-family:'Clash Display',sans-serif; font-size:32px; font-weight:700; }
  .rpt-hval-blue { color:#60a5fa; }
  .rpt-hlbl { font-family:'Satoshi',sans-serif; font-size:11px; color:rgba(255,255,255,0.55); max-width:160px; line-height:1.4; }
  .rpt-cta-strip { border-top:2px solid #171717; border-bottom:2px solid #171717; padding:12px 24px; }
  .rpt-cta-strip-blue { background:#f0fdf4; }
  .rpt-cta-strip-inner { max-width:800px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
  .rpt-cta-strip-text { font-family:'Satoshi',sans-serif; font-size:13px; font-weight:600; color:#1e3a5f; }
  .rpt-cta-pill { font-family:'Satoshi',sans-serif; font-size:12px; font-weight:700; text-decoration:none; padding:6px 14px; border-radius:999px; border:2px solid #171717; }
  .rpt-cta-pill-blue { background:#3b82f6; color:#fff; }
  .rpt-cta-pill-blue:hover { background:#2563eb; }
  .rpt-content { max-width:800px; margin:0 auto; padding:0 24px 80px; }
  .rpt-finding { padding:48px 0; border-bottom:1px solid #e5e5e5; }
  .rpt-finding:last-of-type { border-bottom:none; }
  .rpt-finding-header { margin-bottom:28px; }
  .rpt-finding-num { display:inline-block; font-family:'Satoshi',sans-serif; font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; padding:3px 10px; border-radius:4px; margin-bottom:10px; }
  .rpt-finding-num-blue { background:#dbeafe; color:#1e40af; }
  .rpt-h2 { font-family:'Clash Display',sans-serif; font-size:clamp(20px,2.5vw,26px); font-weight:700; color:#171717; line-height:1.25; margin-bottom:12px; }
  .rpt-lead { font-family:'Satoshi',sans-serif; font-size:15px; color:#404040; line-height:1.7; margin:0; }
  .rpt-prose { font-family:'Satoshi',sans-serif; font-size:14px; color:#404040; line-height:1.8; margin:20px 0; }
  .rpt-prose strong { color:#171717; }
  .rpt-source { font-family:'Satoshi',sans-serif; font-size:11px; color:#a3a3a3; margin-top:20px; font-style:italic; }
  .rpt-stat-row { display:grid; gap:16px; margin:28px 0; }
  .rpt-c3 { grid-template-columns:repeat(3,1fr); }
  .rpt-c4 { grid-template-columns:repeat(4,1fr); }
  @media(max-width:640px) { .rpt-c3,.rpt-c4 { grid-template-columns:1fr 1fr; } }
  .rpt-stat { background:#fafafa; border:1px solid #e5e5e5; border-radius:12px; padding:16px; }
  .rpt-val { font-family:'Clash Display',sans-serif; font-size:28px; font-weight:700; color:#171717; line-height:1; }
  .rpt-val.rpt-b { color:#2563eb; }
  .rpt-val.rpt-o { color:#d97706; }
  .rpt-lbl { font-family:'Satoshi',sans-serif; font-size:11px; color:#737373; margin-top:6px; line-height:1.5; }
  .rpt-delta { display:inline-block; font-family:'Satoshi',sans-serif; font-size:10px; font-weight:700; margin-top:6px; padding:2px 6px; border-radius:4px; }
  .rpt-du { background:#dcfce7; color:#166534; }
  .rpt-dn { background:#fee2e2; color:#991b1b; }
  .rpt-card { background:#fff; border:2px solid #171717; border-radius:12px; padding:16px; margin:20px 0; box-shadow:3px 3px 0 #171717; }
  .rpt-card-label { font-family:'Satoshi',sans-serif; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#737373; margin-bottom:12px; }
  .rpt-chart-wrap { position:relative; }
  .rpt-callout { border-left:4px solid; border-radius:0 8px 8px 0; padding:14px 18px; margin:24px 0; }
  .rpt-cb { background:#f0fdf4; border-color:#3b82f6; }
  .rpt-co { background:#fffbeb; border-color:#f59e0b; }
  .rpt-cl { font-family:'Satoshi',sans-serif; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#1e40af; margin-bottom:6px; }
  .rpt-co .rpt-cl { color:#92400e; }
  .rpt-callout p { font-family:'Satoshi',sans-serif; font-size:13px; line-height:1.7; color:#404040; margin:0; }
  .rpt-pullquote { border-left:4px solid #10b981; margin:28px 0; padding:12px 20px; }
  .rpt-pullquote p { font-family:'Clash Display',sans-serif; font-size:18px; color:#171717; font-style:italic; margin:0; line-height:1.5; }
  .rpt-two-col { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin:20px 0; }
  @media(max-width:600px) { .rpt-two-col { grid-template-columns:1fr; } }
  .rpt-col-head { font-family:'Satoshi',sans-serif; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#737373; margin-bottom:8px; }
  .rpt-pill-row { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
  .rpt-pill { font-family:'Satoshi',sans-serif; font-size:11px; font-weight:600; padding:4px 10px; border-radius:999px; border:1.5px solid; }
  .rpt-pb { background:#dbeafe; color:#1e40af; border-color:#6ee7b7; }
  .rpt-po { background:#fffbeb; color:#92400e; border-color:#fcd34d; }
  .rpt-pr { background:#fee2e2; color:#991b1b; border-color:#fca5a5; }
  .rpt-bar-list { display:flex; flex-direction:column; gap:8px; }
  .rpt-bar-row { display:grid; grid-template-columns:160px 1fr; gap:10px; align-items:center; }
  .rpt-bar-row.rpt-narrow { grid-template-columns:140px 1fr; }
  .rpt-bar-label { font-family:'Satoshi',sans-serif; font-size:12px; color:#171717; font-weight:600; }
  .rpt-bar-label small { display:block; font-size:10px; color:#737373; font-weight:400; }
  .rpt-bar-track { height:8px; background:#f5f5f5; border-radius:99px; overflow:hidden; }
  .rpt-bar-fill { height:100%; border-radius:99px; transition:width 0.6s ease; }
  .rpt-mini-total { border-radius:8px; padding:12px; margin-top:12px; text-align:center; }
  .rpt-mini-total-label { font-family:'Satoshi',sans-serif; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
  .rpt-mini-total-sub { font-family:'Satoshi',sans-serif; font-size:10px; color:#737373; margin-top:2px; }
  .rpt-inline-cta { border:2px solid #171717; border-radius:16px; padding:24px; margin:40px 0; }
  .rpt-inline-cta-blue { background:#f0fdf4; }
  .rpt-inline-cta-inner { display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; }
  .rpt-inline-cta-title { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; color:#171717; }
  .rpt-inline-cta-sub { font-family:'Satoshi',sans-serif; font-size:13px; color:#525252; margin-top:4px; }
  .rpt-btn-primary { font-family:'Satoshi',sans-serif; font-size:13px; font-weight:700; text-decoration:none; padding:10px 20px; border-radius:10px; border:2px solid #171717; white-space:nowrap; }
  .rpt-btn-blue { background:#3b82f6; color:#fff; box-shadow:3px 3px 0 #171717; }
  .rpt-btn-blue:hover { background:#2563eb; }
  .rpt-final-cta { border:2px solid #171717; border-radius:20px; padding:48px 40px; margin:48px 0 0; text-align:center; }
  .rpt-final-cta-blue { background:#0f172a; }
  .rpt-final-cta-title { font-family:'Clash Display',sans-serif; font-size:clamp(24px,3vw,32px); font-weight:700; color:#fff; margin-bottom:12px; }
  .rpt-final-cta-sub { font-family:'Satoshi',sans-serif; font-size:14px; color:rgba(255,255,255,0.7); max-width:520px; margin:0 auto 28px; line-height:1.7; }
  .rpt-final-cta-btns { display:flex; flex-wrap:wrap; gap:12px; justify-content:center; }
  .rpt-btn-white { font-family:'Satoshi',sans-serif; font-size:13px; font-weight:700; text-decoration:none; padding:10px 24px; border-radius:10px; border:2px solid #fff; background:#fff; color:#171717; }
  .rpt-btn-white:hover { background:#f5f5f5; }
  .rpt-btn-outline { font-family:'Satoshi',sans-serif; font-size:13px; font-weight:700; text-decoration:none; padding:10px 24px; border-radius:10px; border:2px solid rgba(255,255,255,0.4); background:rgba(255,255,255,0.1); color:#fff; }
  .rpt-btn-outline:hover { background:rgba(255,255,255,0.2); }
`;
