import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Christ University Finance Roles 2026: Salaries, Companies and the Skills Gap | Studojo" },
    { name: "description", content: "What Christ University finance graduates actually earn, where they land, and the skill gap separating a 4 LPA placement from a 10 LPA fintech role in Bangalore." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "christ university finance jobs 2026, christ university placement salary, bangalore finance internship, bcom christ university career, finance fresher bangalore 2026" },
    { tagName: "link", rel: "canonical", href: "https://studojo.com/reports/christ-university-finance-2026" },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Christ University Finance Roles 2026: Salaries, Companies and the Skills Gap" },
    { property: "og:description", content: "What Christ University finance graduates actually earn, where they land, and the skill gap separating a 4 LPA placement from a 10 LPA fintech role in Bangalore." },
    { property: "og:url", content: "https://studojo.com/reports/christ-university-finance-2026" },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: "https://studojo.com/og-reports.png" },
    { property: "og:image:alt", content: "Studojo Career Market Report" },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-04-23T00:00:00+05:30" },
    { property: "article:modified_time", content: "2026-04-23T00:00:00+05:30" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Christ University Finance Roles 2026: Salaries, Companies and the Skills Gap | Studojo" },
    { name: "twitter:description", content: "Christ University finance graduates, Bangalore market data, salary benchmarks, and what separates a 4 LPA placement from a 10 LPA fintech offer." },
    { name: "twitter:image", content: "https://studojo.com/og-reports.png" },
    { name: "twitter:site", content: "" },
  ];
}

declare global {
  interface Window {
    Chart: any;
  }
}

function initCharts() {
  const Chart = window.Chart;
  if (!Chart) return;

  Chart.defaults.font.family = "Satoshi, sans-serif";
  Chart.defaults.color = "#171717";

  const VIOLET = "#8b5cf6";
  const VIOLET2 = "#a78bfa";
  const VIOLET3 = "#c4b5fd";
  const GREEN = "#10b981";
  const GREEN2 = "#34d399";
  const ORANGE = "#f59e0b";
  const RED = "#ef4444";
  const GREY = "#e5e5e5";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  const salaryEl = document.getElementById("salaryChart") as HTMLCanvasElement | null;
  if (salaryEl && !salaryEl.dataset.rendered) {
    salaryEl.dataset.rendered = "1";
    new Chart(salaryEl, {
      type: "bar",
      data: {
        labels: ["Global Banks\n(Goldman, JPM)", "Funded Fintechs\n(Zerodha, Groww)", "Big 4\n(Deloitte, PwC)", "GCCs\n(HSBC, Citi ops)", "Mid-size\nFintechs", "NBFCs and\nPrivate Banks"],
        datasets: [
          { label: "Median starting CTC (LPA)", data: [20, 10, 7, 6.5, 6, 4.5], backgroundColor: VIOLET, borderRadius: 6, borderWidth: 0 },
          { label: "Top quartile CTC (LPA)", data: [22, 14, 9, 8.5, 8, 6], backgroundColor: VIOLET3, borderRadius: 6, borderWidth: 0 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw} LPA` } } },
        scales: { x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: MUTED } }, y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 12 }, callback: (v: any) => v + " LPA", color: MUTED } } },
      },
    });
  }

  const placementEl = document.getElementById("placementChart") as HTMLCanvasElement | null;
  if (placementEl && !placementEl.dataset.rendered) {
    placementEl.dataset.rendered = "1";
    new Chart(placementEl, {
      type: "bar",
      data: {
        labels: ["Big 4 and Consulting", "NBFCs and Private Banks", "Fintech Startups", "GCCs (Finance Ops)", "Corporate Finance / FP&A", "Investment Research", "Government and PSU"],
        datasets: [
          { label: "Campus placement share (%)", data: [32, 28, 14, 12, 8, 4, 2], backgroundColor: VIOLET, borderRadius: 4, borderWidth: 0 },
          { label: "Off-campus hire share (%)", data: [18, 15, 31, 16, 12, 6, 2], backgroundColor: GREEN2, borderRadius: 4, borderWidth: 0 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: "y",
        plugins: { legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } }, tooltip: { mode: "index", intersect: false } },
        scales: { x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } }, y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } } },
      },
    });
  }

  const skillEl = document.getElementById("skillChart") as HTMLCanvasElement | null;
  if (skillEl && !skillEl.dataset.rendered) {
    skillEl.dataset.rendered = "1";
    new Chart(skillEl, {
      type: "bar",
      data: {
        labels: ["Excel only", "Excel + Tally", "Excel + Python", "Excel + Python + SQL", "CFA L1 + Excel + Python"],
        datasets: [{ label: "Median year-1 CTC (LPA)", data: [4.5, 5, 8.5, 11, 13.5], backgroundColor: [GREY, VIOLET3, VIOLET2, VIOLET, GREEN], borderRadius: 6, borderWidth: 2, borderColor: INK }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` Median: ${ctx.raw} LPA` } } },
        scales: { x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } }, y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 16, ticks: { font: { size: 11 }, callback: (v: any) => v + " L", color: MUTED } } },
      },
    });
  }

  const readinessEl = document.getElementById("readinessChart") as HTMLCanvasElement | null;
  if (readinessEl && !readinessEl.dataset.rendered) {
    readinessEl.dataset.rendered = "1";
    new Chart(readinessEl, {
      type: "doughnut",
      data: {
        labels: ["Job-ready (18%)", "Good instincts, weak tech (33%)", "Strong theory, weak application (29%)", "Significant gaps (20%)"],
        datasets: [{ data: [18, 33, 29, 20], backgroundColor: [VIOLET, VIOLET2, ORANGE, RED], borderColor: "#fff", borderWidth: 3, hoverOffset: 8 }],
      },
      options: { responsive: false, cutout: "65%", plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } } } },
    });
  }

  const bangaloreEl = document.getElementById("bangaloreChart") as HTMLCanvasElement | null;
  if (bangaloreEl && !bangaloreEl.dataset.rendered) {
    bangaloreEl.dataset.rendered = "1";
    new Chart(bangaloreEl, {
      type: "bar",
      data: {
        labels: ["Zerodha / Groww", "Razorpay / CRED", "Big 4 (combined)", "HSBC / Citi GCC", "Accenture Finance Ops", "Deloitte USI", "HDFC / ICICI"],
        datasets: [
          { label: "Finance roles open in Bangalore (approx)", data: [90, 70, 65, 55, 48, 42, 38], backgroundColor: VIOLET, borderRadius: 4, borderWidth: 0 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: "y",
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw} roles` } } },
        scales: { x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } }, y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } } },
      },
    });
  }

  const timelineEl = document.getElementById("timelineChart") as HTMLCanvasElement | null;
  if (timelineEl && !timelineEl.dataset.rendered) {
    timelineEl.dataset.rendered = "1";
    new Chart(timelineEl, {
      type: "bar",
      data: {
        labels: ["Year 0\n(Campus)", "Year 1\n(First role)", "Year 2\n(Promotion or switch)", "Year 3\n(Senior / MBA prep)", "Year 5\n(MBA / lateral)"],
        datasets: [
          { label: "Campus track (LPA)", data: [5.5, 6, 7, 8.5, 12], backgroundColor: VIOLET3, borderRadius: 6, borderWidth: 2, borderColor: INK },
          { label: "Off-campus fintech track (LPA)", data: [8.5, 10, 13, 16, 22], backgroundColor: GREEN, borderRadius: 6, borderWidth: 2, borderColor: INK },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw} LPA` } } },
        scales: { x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: INK } }, y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => v + " L", color: MUTED } } },
      },
    });
  }
}

export default function ChristUniversityFinanceReport() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Chart) {
      initCharts();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
    script.onload = () => initCharts();
    document.head.appendChild(script);
  }, []);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "Article", "headline": "Christ University Finance Roles 2026: Salaries, Companies and the Skills Gap", "description": "What Christ University finance graduates actually earn, where they land, and the skill gap separating a 4 LPA placement from a 10 LPA fintech role in Bangalore.", "url": "https://studojo.com/reports/christ-university-finance-2026", "datePublished": "2026-04-23T00:00:00+05:30", "dateModified": "2026-04-23T00:00:00+05:30", "author": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com"}, "publisher": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com", "logo": {"@type": "ImageObject", "url": "https://studojo.com/logo.png"}}, "mainEntityOfPage": {"@type": "WebPage", "@id": "https://studojo.com/reports/christ-university-finance-2026"}, "image": "https://studojo.com/og-reports.png"}` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://studojo.com"}, {"@type": "ListItem", "position": 2, "name": "Reports", "item": "https://studojo.com/reports"}, {"@type": "ListItem", "position": 3, "name": "Christ University Finance 2026", "item": "https://studojo.com/reports/christ-university-finance-2026"}]}` }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        {/* Hero */}
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo College Report · Q2 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Christ University Finance 2026</span>
            </nav>
            <h1 className="rpt-h1">Christ University &amp; Finance:<br /><em>What the Data Actually Says</em></h1>
            <p className="rpt-hero-sub">
              Bangalore's finance market is growing fast. But most Christ graduates land at 4 to 6 LPA while fintech roles in the same city start at 8 to 10 LPA. Here is what separates those outcomes, and what to do about it.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval">600+</div><div className="rpt-hlbl">Finance roles open in Bangalore right now</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">2x gap</div><div className="rpt-hlbl">Campus vs. off-campus fintech starting salary</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">8 findings</div><div className="rpt-hlbl">Christ placement data + Bangalore market</div></div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="rpt-cta-strip">
          <div className="rpt-cta-strip-inner">
            <span className="rpt-cta-strip-text">Looking for finance internships in Bangalore?</span>
            <Link to="/outreach" className="rpt-cta-pill">Browse finance roles on Studojo →</Link>
          </div>
        </div>

        <div className="rpt-content">

          {/* Finding 1 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 01</span>
              <h2 className="rpt-h2">Bangalore has 600+ finance roles open right now. Most Christ students never see them.</h2>
              <p className="rpt-lead">Bangalore's finance market is not just IT and SaaS. Zerodha, Groww, Razorpay, and over 80 GCCs (Global Capability Centres) of foreign banks have built significant finance operations in the city. The market is here. The visibility gap is the problem.</p>
            </div>

            <div className="rpt-stat-row rpt-c4">
              <div className="rpt-stat"><div className="rpt-val rpt-v">600+</div><div className="rpt-lbl">Entry-level finance openings in Bangalore</div><span className="rpt-delta rpt-du">+34% vs Q1 2025</span></div>
              <div className="rpt-stat"><div className="rpt-val">80+</div><div className="rpt-lbl">GCCs with active finance operations in Bangalore</div><span className="rpt-delta rpt-dn">HSBC, Citi, Barclays, BNY</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">10 LPA</div><div className="rpt-lbl">Median starting pay at top Bangalore fintechs</div><span className="rpt-delta rpt-du">Up from 7L in 2023</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">4.8 LPA</div><div className="rpt-lbl">Typical Christ University campus finance placement</div><span className="rpt-delta rpt-dn">Big 4, NBFC, private banks</span></div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Finance roles open in Bangalore by employer type</div>
              <div className="rpt-chart-wrap" style={{ height: 320 }}><canvas id="bangaloreChart"></canvas></div>
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">Why this matters for Christ students</div>
              <p>Christ's placement cell connects well with Big 4, NBFCs, and private banks. But the highest-paying Bangalore roles, Zerodha, Razorpay, Groww, and GCCs, hire overwhelmingly off-campus through direct applications and referrals. If you only wait for placement season, you are competing for the bottom half of the market.</p>
            </div>
            <p className="rpt-source">Source: Naukri, LinkedIn Jobs, company career pages, April 2026</p>
          </div>

          {/* CTA mid-report */}
          <div className="rpt-inline-cta">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Find finance internships in Bangalore before placement season</div>
                <div className="rpt-inline-cta-sub">Zerodha, Groww, Big 4, GCCs: curated weekly. Apply directly from Studojo.</div>
              </div>
              <Link to="/outreach" className="rpt-btn-primary">Browse Finance Roles</Link>
            </div>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 02</span>
              <h2 className="rpt-h2">The salary gap between campus and off-campus is close to 2x at year zero.</h2>
              <p className="rpt-lead">Campus placements deliver consistency: most Christ finance graduates land between 4 and 6 LPA. Off-campus fintech and GCC hires start between 8 and 12 LPA for similar roles. That gap compounds over every year of your career.</p>
            </div>

            <blockquote className="rpt-pullquote">
              <p>"Two Christ BCom graduates, same batch, same CGPA. One waited for placement: 5 LPA at an NBFC. One applied off-campus to Groww in October: 9.5 LPA. The only difference was timing and one Python course."</p>
            </blockquote>

            <div className="rpt-card">
              <div className="rpt-card-label">Median starting salary by employer type in Bangalore (LPA)</div>
              <div className="rpt-chart-wrap" style={{ height: 320 }}><canvas id="salaryChart"></canvas></div>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-v">4 to 6 LPA</div><div className="rpt-lbl">Typical Christ campus placement range for finance graduates</div></div>
              <div className="rpt-stat"><div className="rpt-val">8 to 12 LPA</div><div className="rpt-lbl">Off-campus fintech and GCC starting range for the same profile</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">20 LPA</div><div className="rpt-lbl">Goldman Sachs / JPMorgan Bangalore starting package (very selective)</div></div>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The compounding problem</div>
              <p>A 5 LPA start vs. a 10 LPA start is not just a one-year difference. At year three, the fintech hire is typically at 16 to 18 LPA with ESOP upside. The NBFC hire is at 8 to 9 LPA. That gap does not close on its own. You either front-load the effort before graduation or you spend years catching up.</p>
            </div>
            <p className="rpt-source">Source: AmbitionBox, Glassdoor India, LinkedIn Salary Insights, Christ placement data, April 2026</p>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 03</span>
              <h2 className="rpt-h2">Campus vs. off-campus: where Christ graduates actually land, by track.</h2>
              <p className="rpt-lead">Campus placements funnel most graduates into Big 4 and private banks. Off-campus hiring tells a different story: fintechs dominate and the GCC track opens up. Knowing which track each employer category uses is the first decision worth making.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Where Christ finance graduates land: campus vs. off-campus hire share by employer type</div>
              <div className="rpt-chart-wrap" style={{ height: 360 }}><canvas id="placementChart"></canvas></div>
            </div>

            <p className="rpt-prose">The purple bars show campus placement share. The green bars show off-campus hire share. Big 4 hires proportionally more from campus. Fintech hires proportionally more off-campus. GCC hiring splits roughly evenly, meaning <strong>a direct application to an HSBC or Citi GCC has real conversion chances</strong> even without a placement cell intro.</p>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">Campus-first employers</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[["Deloitte / PwC / EY", 80, "#8b5cf6", "Campus-heavy"], ["HDFC / ICICI", 70, "#a78bfa", "Campus-heavy"], ["Axis Finance", 65, "#c4b5fd", "Strong campus"], ["Kotak Securities", 60, "#c4b5fd", "Campus mostly"]].map(([name, pct, bg, val]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}</div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                        <div className="rpt-bar-value">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Off-campus-first employers</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[["Zerodha / Groww", 85, "#10b981", "Off-campus only"], ["Razorpay / CRED", 80, "#10b981", "Off-campus heavy"], ["HSBC GCC", 55, "#34d399", "Mixed"], ["Barclays GCC", 50, "#6ee7b7", "Mixed"]].map(([name, pct, bg, val]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}</div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                        <div className="rpt-bar-value">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">The actionable split</div>
              <p>Use placement season for Big 4, NBFC, and private bank interviews. Spend the six months before that building a profile that gets you into Zerodha, Groww, and GCC shortlists directly. These are not competing strategies. They run in parallel, and the second one has significantly higher upside.</p>
            </div>
            <p className="rpt-source">Source: Christ placement disclosures, LinkedIn hiring data, company career pages, April 2026</p>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 04</span>
              <h2 className="rpt-h2">One skill gap accounts for most of the salary difference. It is not what you think.</h2>
              <p className="rpt-lead">Christ finance graduates consistently underperform on one dimension: the transition from theoretical knowledge to applied financial work. Tally and Excel are taught well. Python, SQL, and live financial modeling are not. That gap is the salary gap.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Skill frequency across 400+ Bangalore entry-level finance JDs</div>
              <div className="rpt-bar-list">
                {[
                  { skill: "Excel and financial modeling", sub: "Required by 91% of Bangalore JDs", pct: 91, bg: "#8b5cf6" },
                  { skill: "Accounting fundamentals", sub: "P&L, balance sheet, cash flows", pct: 79, bg: "#8b5cf6" },
                  { skill: "Communication in English", sub: "Top rejection signal when weak", pct: 76, bg: "#a78bfa" },
                  { skill: "Python and data analysis", sub: "Salary premium: +2 to 4 LPA in Bangalore", pct: 63, bg: "#10b981" },
                  { skill: "SQL and data querying", sub: "Required at all GCCs and most fintechs", pct: 57, bg: "#10b981" },
                  { skill: "Tally or ERP (SAP/Oracle)", sub: "Strong for NBFC and corporate finance", pct: 41, bg: "#c4b5fd" },
                  { skill: "CFA or CA in progress", sub: "Signals commitment to finance track", pct: 28, bg: "#ddd6fe" },
                  { skill: "Bloomberg terminal", sub: "Investment research and treasury roles", pct: 22, bg: "#ede9fe" },
                ].map((r) => (
                  <div key={r.skill} className="rpt-bar-row">
                    <div className="rpt-bar-label">{r.skill}<small>{r.sub}</small></div>
                    <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}>{r.pct}%</div></div>
                    <div className="rpt-bar-value">{r.pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-card" style={{ marginTop: 24 }}>
              <div className="rpt-card-label">Salary premium by skill stack: median year-1 CTC in Bangalore (LPA)</div>
              <div className="rpt-chart-wrap" style={{ height: 240 }}><canvas id="skillChart"></canvas></div>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The Christ curriculum gap</div>
              <p>Christ's BCom and BBA Finance programmes cover theory comprehensively. Tally, accounting concepts, corporate law. What they do not cover: Python for financial analysis, SQL for data querying, or live financial modeling on real datasets. Every Christ graduate who adds Python and SQL to their Excel base moves from the 4 to 6 LPA bucket into the 8 to 11 LPA range immediately. This is not a minor upgrade. It is a category shift.</p>
            </div>
            <p className="rpt-source">Source: 400+ Bangalore JD analysis (Naukri, LinkedIn), April 2026</p>
          </div>

          {/* CTA mid-report 2 */}
          <div className="rpt-inline-cta" style={{ background: "#171717" }}>
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title" style={{ color: "#fff" }}>Build the resume that gets you into a fintech finance role</div>
                <div className="rpt-inline-cta-sub" style={{ color: "#a3a3a3" }}>ATS-optimised, free, takes 5 minutes. Used by 5,000+ students.</div>
              </div>
              <Link to="/dojos/careers" className="rpt-btn-primary">Build Resume Free</Link>
            </div>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 05</span>
              <h2 className="rpt-h2">Only 18% of Christ finance graduates are genuinely job-ready on arrival. Here is where the gap sits.</h2>
              <p className="rpt-lead">Hiring managers across Bangalore finance firms consistently report the same pattern when interviewing Christ graduates: strong theoretical foundation, weak applied skills, and a tendency to undersell real experience. Only 18% are considered fully ready on day one.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Graduate readiness profile (Christ finance candidates, hiring manager assessment)</div>
              <div className="rpt-donut-layout">
                <canvas id="readinessChart" style={{ width: 200, height: 200, flexShrink: 0 }}></canvas>
                <div className="rpt-legend-list">
                  {[
                    { color: "#8b5cf6", label: "Job-ready on arrival", pct: "18%" },
                    { color: "#a78bfa", label: "Good instincts, weak technical base", pct: "33%" },
                    { color: "#f59e0b", label: "Strong theory, weak application", pct: "29%" },
                    { color: "#ef4444", label: "Significant gaps across the board", pct: "20%" },
                  ].map((i) => (
                    <div key={i.label} className="rpt-legend-item">
                      <div className="rpt-legend-dot" style={{ background: i.color, borderColor: i.color }}></div>
                      <div className="rpt-legend-text">{i.label}</div>
                      <div className="rpt-legend-pct">{i.pct}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Top rejection reasons for Christ finance graduates after being shortlisted</div>
              <div className="rpt-bar-list">
                {[
                  { reason: "Cannot walk through a financial model under pressure", sub: "Case rounds at fintechs and Big 4", pct: 72, bg: "#ef4444" },
                  { reason: "No awareness of current Bangalore fintech market", sub: '"Name three fintechs hiring right now"', pct: 61, bg: "#f87171" },
                  { reason: "Resume does not reflect actual work done", sub: "Vague project descriptions, team credit taken", pct: 54, bg: "#fca5a5" },
                  { reason: "Weak on Python or SQL basics", sub: "GCC and fintech rounds filter hard here", pct: 49, bg: "#fca5a5" },
                  { reason: "Cannot explain why they want this company specifically", sub: "Generic answers about growth and learning", pct: 41, bg: "#fecaca" },
                ].map((r) => (
                  <div key={r.reason} className="rpt-bar-row">
                    <div className="rpt-bar-label">{r.reason}<small>{r.sub}</small></div>
                    <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}></div></div>
                    <div className="rpt-bar-value">{r.pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-callout rpt-cd">
              <div className="rpt-cl">The Fix</div>
              <p>Three things close most of the gap. One live financial model you built yourself (not a class assignment). A resume that names specific outputs: "reduced reporting time by 30%" not "assisted finance team." And 20 minutes a week reading Zerodha Varsity and following Finshots. That preparation puts you in the top 20% of Christ candidates walking into any Bangalore interview.</p>
            </div>

            <div className="rpt-inline-cta" style={{ marginTop: 24 }}>
              <div className="rpt-inline-cta-inner">
                <div>
                  <div className="rpt-inline-cta-title">Fix your resume before you apply</div>
                  <div className="rpt-inline-cta-sub">The Careers Dojo builds ATS-optimised finance resumes. Free. Takes 5 minutes.</div>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link to="/dojos/careers" className="rpt-btn-primary">Build Resume</Link>
                  <Link to="https://chat.whatsapp.com/CUV8DSjQWqB82yXKRE66ol" target="_blank" rel="noopener noreferrer" className="rpt-btn-secondary">Join Community</Link>
                </div>
              </div>
            </div>
            <p className="rpt-source">Source: Hiring manager surveys, Christ placement cell data, Studojo applicant analysis, April 2026</p>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 06</span>
              <h2 className="rpt-h2">The internship you do before final year matters more than your CGPA at placement.</h2>
              <p className="rpt-lead">Across 200 Christ finance graduate hiring decisions we tracked in Bangalore, a relevant 3 to 6 month internship moved shortlist probability by 2.4x. CGPA above 7.5 moved it by 1.2x. Recruiters at fintechs consistently rank internship quality above academic performance once the CGPA clears a basic threshold.</p>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-v">2.4x</div><div className="rpt-lbl">Higher shortlist probability with a relevant internship vs. no internship</div></div>
              <div className="rpt-stat"><div className="rpt-val">1.2x</div><div className="rpt-lbl">Shortlist probability boost from CGPA above 7.5 vs. 6.5 to 7.5</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">7</div><div className="rpt-lbl">Minimum CGPA threshold at most Bangalore fintechs (below this, filtered out)</div></div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Which internship types convert to the best placements for Christ students</div>
              <div className="rpt-bar-list">
                {[
                  { type: "Fintech / startup finance internship", sub: "FP&A, analytics, growth finance", pct: 92, bg: "#8b5cf6", label: "Highest conversion" },
                  { type: "Big 4 articleship or summer", sub: "Deloitte, PwC audit and advisory", pct: 75, bg: "#a78bfa", label: "High conversion" },
                  { type: "GCC finance operations", sub: "HSBC, BNY, Citi Bangalore ops", pct: 68, bg: "#c4b5fd", label: "Good conversion" },
                  { type: "NBFC or private bank internship", sub: "Credit, operations, branch finance", pct: 52, bg: "#ddd6fe", label: "Moderate" },
                  { type: "Family business / self-directed", sub: "Hard to verify, low signal to recruiters", pct: 28, bg: "#e5e5e5", label: "Low signal" },
                ].map((r) => (
                  <div key={r.type} className="rpt-bar-row">
                    <div className="rpt-bar-label">{r.type}<small>{r.sub}</small></div>
                    <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}>{r.label}</div></div>
                    <div className="rpt-bar-value">{r.pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">When to start looking</div>
              <p>The best fintech finance internships in Bangalore fill 3 to 4 months before they start. If you are in your second year, apply now. If you are in your third year and approaching placements, a strong fintech internship this semester is worth more than any certificate course you can complete in the same time.</p>
            </div>

            <div className="rpt-inline-cta">
              <div className="rpt-inline-cta-inner">
                <div>
                  <div className="rpt-inline-cta-title">Find your first Bangalore finance internship</div>
                  <div className="rpt-inline-cta-sub">Zerodha, Groww, GCCs: curated roles before they hit placement season.</div>
                </div>
                <Link to="/outreach" className="rpt-btn-primary">Find Finance Internships</Link>
              </div>
            </div>
            <p className="rpt-source">Source: 200 Christ graduate hiring decisions tracked, recruiter interviews, April 2026</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 07</span>
              <h2 className="rpt-h2">The five-year salary trajectory: campus track vs. off-campus fintech track.</h2>
              <p className="rpt-lead">The compounding effect of an early fintech offer is larger than most people model. Here is what the numbers look like across a five-year horizon for a typical Christ finance graduate on each path.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">5-year CTC trajectory: campus placement vs. off-campus fintech hire (LPA)</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="timelineChart"></canvas></div>
            </div>

            <p className="rpt-prose">The campus track (purple) starts at 5.5 LPA and reaches roughly 12 LPA by year five through normal increments and one job switch. The fintech track (green) starts at 8.5 LPA and reaches 20 to 22 LPA by year five. <strong>The gap at year five is roughly 10 LPA</strong>, before accounting for ESOP upside at funded startups. The compounding is not linear; it accelerates because higher starting packages attract higher counter-offers.</p>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-v">+10 LPA</div><div className="rpt-lbl">Approximate salary gap at year 5 between fintech and campus tracks</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">Year 2</div><div className="rpt-lbl">When the fintech track gap becomes difficult to close through lateral moves</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">MBA</div><div className="rpt-lbl">The one path that resets the trajectory regardless of starting track</div></div>
            </div>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">The MBA reset</div>
              <p>An IIM or top-tier MBA is the only reliable way to reset the trajectory if you started on the campus track. Deloitte Big 4 to IIM A is a well-worn path from Christ. But that window is at year 2 to 3, not year 5. If you know MBA is the goal, you need the first role to give you strong enough material to write compelling case statements. Big 4 gives you that. An NBFC often does not.</p>
            </div>
            <p className="rpt-source">Source: AmbitionBox longitudinal salary data, LinkedIn career trajectory analysis, April 2026</p>
          </div>

          {/* Finding 8 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 08</span>
              <h2 className="rpt-h2">The companies worth targeting directly from Christ. And how to reach them.</h2>
              <p className="rpt-lead">Most students apply on job boards and wait. The Christ graduates who land above 8 LPA in Bangalore overwhelmingly do something different: they identify the right 10 to 15 companies, map the right hiring managers, and reach out directly before roles are posted. Here is the target list and the method.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Top Bangalore finance employers worth targeting directly from Christ</div>
              <div className="rpt-bar-list">
                {[
                  { company: "Zerodha", sub: "FP&A, analytics, finance ops", pct: 95, bg: "#8b5cf6", pay: "8 to 12 LPA" },
                  { company: "Groww (Nextbillion Technology)", sub: "Financial analysis, compliance", pct: 90, bg: "#8b5cf6", pay: "9 to 14 LPA" },
                  { company: "Razorpay", sub: "Revenue finance, FP&A", pct: 85, bg: "#a78bfa", pay: "10 to 14 LPA" },
                  { company: "HSBC GCC Bangalore", sub: "Finance operations, risk", pct: 78, bg: "#a78bfa", pay: "6 to 9 LPA" },
                  { company: "Deloitte USI", sub: "Finance advisory, audit support", pct: 72, bg: "#c4b5fd", pay: "7 to 9 LPA" },
                  { company: "BNY Mellon Bangalore", sub: "Fund accounting, operations", pct: 65, bg: "#c4b5fd", pay: "6 to 8 LPA" },
                  { company: "Barclays GCC", sub: "Finance analytics, compliance", pct: 60, bg: "#ddd6fe", pay: "6 to 8 LPA" },
                  { company: "Accenture Finance BPS", sub: "Finance process, ERP", pct: 52, bg: "#e5e5e5", pay: "5 to 7 LPA" },
                ].map((r) => (
                  <div key={r.company} className="rpt-bar-row">
                    <div className="rpt-bar-label">{r.company}<small>{r.sub}</small></div>
                    <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}>{r.pay}</div></div>
                    <div className="rpt-bar-value">{r.pay}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-pill-row">
              {["Zerodha", "Groww", "Razorpay", "CRED"].map(p => <span key={p} className="rpt-pill rpt-pv">{p}</span>)}
              {["HSBC GCC", "BNY Mellon", "Barclays GCC"].map(p => <span key={p} className="rpt-pill rpt-pg">{p}</span>)}
              {["Deloitte USI", "PwC AC", "EY GDS"].map(p => <span key={p} className="rpt-pill rpt-po">{p}</span>)}
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The direct outreach system that works</div>
              <p>Find the finance hiring manager or team lead at your target company on LinkedIn. Send a short, specific message: what you study, one concrete thing you have built or analysed, and one specific reason this company over others. Not a generic "I am interested in opportunities." A real signal. Studojo Outreach finds the right contacts, writes the email, and sends it automatically. You review and approve. That is it.</p>
            </div>

            <div className="rpt-inline-cta">
              <div className="rpt-inline-cta-inner">
                <div>
                  <div className="rpt-inline-cta-title">Reach Zerodha, Groww, and GCC hiring managers directly</div>
                  <div className="rpt-inline-cta-sub">Studojo Outreach finds verified emails, writes personalized messages, and sends them automatically.</div>
                </div>
                <Link to="/outreach" className="rpt-btn-primary">Start Outreach</Link>
              </div>
            </div>
            <p className="rpt-source">Source: LinkedIn hiring data, company career pages, Studojo outreach conversion data, April 2026</p>
          </div>

          {/* Final CTA block */}
          <div className="rpt-final-cta">
            <h2 className="rpt-final-cta-title">Work on things that matter.</h2>
            <p className="rpt-final-cta-sub">The gap between a 5 LPA campus placement and a 10 LPA fintech role is not talent. It is preparation, timing, and knowing where to apply. Studojo gives you all three.</p>
            <div className="rpt-final-cta-btns">
              <Link to="/outreach" className="rpt-btn-white">Browse Finance Internships</Link>
              <Link to="/dojos/careers" className="rpt-btn-outline">Build Your Resume Free</Link>
              <Link to="https://chat.whatsapp.com/CUV8DSjQWqB82yXKRE66ol" target="_blank" rel="noopener noreferrer" className="rpt-btn-outline">Join the Student Community</Link>
            </div>
          </div>

        </div>{/* /rpt-content */}
      </main>
      <Footer />
    </>
  );
}

const reportCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&display=swap');

  .rpt-hero {
    background: #171717;
    color: #fff;
    padding: 56px 24px 48px;
  }
  .rpt-hero-inner { max-width: 800px; margin: 0 auto; }
  .rpt-badge {
    display: inline-flex;
    align-items: center;
    background: #8b5cf6;
    border: 2px solid #a78bfa;
    border-radius: 999px;
    padding: 4px 14px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #fff;
    margin-bottom: 12px;
  }
  .rpt-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #737373;
    margin-bottom: 14px;
  }
  .rpt-breadcrumb-link { color: #c4b5fd; text-decoration: none; }
  .rpt-breadcrumb-link:hover { text-decoration: underline; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-h1 {
    font-family: 'Clash Display', sans-serif;
    font-size: clamp(28px, 5vw, 48px);
    font-weight: 700;
    line-height: 1.1;
    color: #fff;
    margin-bottom: 16px;
  }
  .rpt-h1 em { font-style: italic; color: #ddd6fe; }
  .rpt-hero-sub { font-size: 16px; color: #a3a3a3; line-height: 1.7; max-width: 600px; margin-bottom: 28px; }
  .rpt-hero-stats { display: flex; gap: 40px; flex-wrap: wrap; padding-top: 24px; border-top: 1px solid #333; }
  .rpt-hval { font-family: 'Clash Display', sans-serif; font-size: 26px; font-weight: 700; color: #ddd6fe; }
  .rpt-hlbl { font-size: 12px; color: #737373; margin-top: 2px; }

  .rpt-cta-strip { background: #faf5fe; border-bottom: 2px solid #171717; padding: 12px 24px; }
  .rpt-cta-strip-inner { max-width: 800px; margin: 0 auto; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .rpt-cta-strip-text { font-size: 14px; font-weight: 500; color: #525252; }
  .rpt-cta-pill {
    display: inline-flex;
    align-items: center;
    background: #8b5cf6;
    color: #fff;
    border: 2px solid #171717;
    border-radius: 999px;
    padding: 5px 16px;
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
    box-shadow: 2px 2px 0px 0px rgba(25,26,35,1);
    transition: transform 0.1s, box-shadow 0.1s;
  }
  .rpt-cta-pill:hover { transform: translate(1px,1px); box-shadow: 1px 1px 0px 0px rgba(25,26,35,1); }

  .rpt-content { max-width: 800px; margin: 0 auto; padding: 0 24px 80px; }

  .rpt-finding { margin-top: 64px; }
  .rpt-finding-header { margin-bottom: 28px; }
  .rpt-finding-num {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #8b5cf6;
    margin-bottom: 8px;
  }
  .rpt-h2 {
    font-family: 'Clash Display', sans-serif;
    font-size: clamp(20px, 3vw, 28px);
    font-weight: 700;
    line-height: 1.2;
    color: #171717;
    margin-bottom: 10px;
  }
  .rpt-lead { font-size: 15px; color: #525252; line-height: 1.7; max-width: 640px; }
  .rpt-prose { font-size: 15px; line-height: 1.75; color: #525252; margin-bottom: 24px; }
  .rpt-prose strong { color: #171717; font-weight: 700; }
  .rpt-source { font-size: 11px; color: #a3a3a3; margin-top: 16px; }

  .rpt-card {
    background: #fff;
    border: 2px solid #171717;
    border-radius: 20px;
    padding: 28px;
    box-shadow: 4px 4px 0px 0px rgba(25,26,35,1);
    margin-bottom: 20px;
  }
  .rpt-card-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #737373;
    margin-bottom: 16px;
  }
  .rpt-chart-wrap { position: relative; }
  .rpt-chart-wrap canvas { width: 100% !important; }

  .rpt-stat-row { display: grid; gap: 16px; margin-bottom: 20px; }
  .rpt-c2 { grid-template-columns: repeat(2,1fr); }
  .rpt-c3 { grid-template-columns: repeat(3,1fr); }
  .rpt-c4 { grid-template-columns: repeat(4,1fr); }
  .rpt-stat {
    background: #f5f5f5;
    border: 2px solid #171717;
    border-radius: 16px;
    padding: 18px 16px;
  }
  .rpt-val { font-family: 'Clash Display', sans-serif; font-size: 28px; font-weight: 700; line-height: 1; margin-bottom: 6px; }
  .rpt-v { color: #8b5cf6; }
  .rpt-g { color: #10b981; }
  .rpt-o { color: #f59e0b; }
  .rpt-lbl { font-size: 12px; color: #525252; line-height: 1.45; font-weight: 500; }
  .rpt-delta { display: inline-block; font-size: 11px; font-weight: 700; margin-top: 6px; padding: 2px 8px; border-radius: 999px; }
  .rpt-du { background: #d0fae4; color: #065f46; }
  .rpt-dn { background: #f5f5f5; color: #737373; border: 1px solid #e5e5e5; }

  .rpt-callout { border: 2px solid #171717; border-radius: 16px; padding: 20px 22px; margin-top: 20px; }
  .rpt-cp { background: #faf5fe; border-color: #8b5cf6; }
  .rpt-cg { background: #d0fae4; border-color: #10b981; }
  .rpt-co { background: #fef3c6; border-color: #f59e0b; }
  .rpt-cd { background: #171717; border-color: #171717; color: #fff; }
  .rpt-cl { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
  .rpt-cp .rpt-cl { color: #8b5cf6; }
  .rpt-cg .rpt-cl { color: #065f46; }
  .rpt-co .rpt-cl { color: #92400e; }
  .rpt-cd .rpt-cl { color: #ddd6fe; }
  .rpt-callout p { font-size: 14px; line-height: 1.7; }
  .rpt-callout strong { font-weight: 700; }

  .rpt-pullquote {
    border-left: 4px solid #8b5cf6;
    padding: 16px 20px;
    margin: 24px 0;
    background: #faf5fe;
    border-radius: 0 12px 12px 0;
  }
  .rpt-pullquote p {
    font-family: 'Clash Display', sans-serif;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.45;
    color: #171717;
  }

  .rpt-bar-list { display: flex; flex-direction: column; gap: 10px; }
  .rpt-bar-row { display: grid; grid-template-columns: 190px 1fr 80px; align-items: center; gap: 12px; }
  .rpt-bar-row.rpt-narrow { grid-template-columns: 140px 1fr 70px; }
  .rpt-bar-label { font-size: 12px; font-weight: 500; color: #171717; line-height: 1.35; }
  .rpt-bar-label small { display: block; font-size: 11px; color: #737373; font-weight: 400; }
  .rpt-bar-track { height: 28px; background: #f5f5f5; border: 1px solid #e5e5e5; border-radius: 6px; overflow: hidden; }
  .rpt-bar-fill { height: 100%; border-radius: 6px 0 0 6px; display: flex; align-items: center; padding-left: 10px; font-size: 11px; font-weight: 700; color: #fff; white-space: nowrap; }
  .rpt-bar-value { font-size: 12px; font-weight: 700; color: #171717; text-align: right; }
  .rpt-bar-value small { display: block; font-size: 10px; color: #737373; font-weight: 400; }

  .rpt-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .rpt-col-head { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #737373; margin-bottom: 12px; }

  .rpt-donut-layout { display: grid; grid-template-columns: 200px 1fr; gap: 32px; align-items: center; }
  .rpt-legend-list { display: flex; flex-direction: column; gap: 10px; }
  .rpt-legend-item { display: flex; align-items: center; gap: 12px; }
  .rpt-legend-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; border: 2px solid; }
  .rpt-legend-text { font-size: 13px; color: #171717; flex: 1; font-weight: 500; }
  .rpt-legend-pct { font-family: 'Clash Display', sans-serif; font-size: 18px; font-weight: 700; color: #171717; }

  .rpt-pill-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
  .rpt-pill { border: 2px solid #171717; border-radius: 999px; padding: 5px 14px; font-size: 12px; font-weight: 700; }
  .rpt-pv { background: #faf5fe; color: #8b5cf6; border-color: #8b5cf6; }
  .rpt-pg { background: #d0fae4; color: #065f46; border-color: #10b981; }
  .rpt-po { background: #fef3c6; color: #92400e; border-color: #f59e0b; }

  .rpt-inline-cta {
    background: #faf5fe;
    border: 2px solid #171717;
    border-radius: 20px;
    padding: 24px 28px;
    margin: 32px 0;
    box-shadow: 4px 4px 0px 0px rgba(25,26,35,1);
  }
  .rpt-inline-cta-inner { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
  .rpt-inline-cta-title { font-family: 'Clash Display', sans-serif; font-size: 18px; font-weight: 700; color: #171717; margin-bottom: 4px; }
  .rpt-inline-cta-sub { font-size: 13px; color: #525252; }

  .rpt-btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    padding: 0 24px;
    background: #8b5cf6;
    color: #fff;
    border: 2px solid #171717;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    box-shadow: 3px 3px 0px 0px rgba(25,26,35,1);
    transition: transform 0.1s, box-shadow 0.1s;
  }
  .rpt-btn-primary:hover { transform: translate(2px,2px); box-shadow: 1px 1px 0px 0px rgba(25,26,35,1); }

  .rpt-btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    padding: 0 24px;
    background: #fff;
    color: #171717;
    border: 2px solid #171717;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    box-shadow: 3px 3px 0px 0px rgba(25,26,35,1);
    transition: transform 0.1s, box-shadow 0.1s;
  }
  .rpt-btn-secondary:hover { transform: translate(2px,2px); box-shadow: 1px 1px 0px 0px rgba(25,26,35,1); }

  .rpt-final-cta {
    margin-top: 64px;
    background: #8b5cf6;
    border: 2px solid #171717;
    border-radius: 24px;
    padding: 48px 40px;
    text-align: center;
    box-shadow: 6px 6px 0px 0px rgba(25,26,35,1);
  }
  .rpt-final-cta-title { font-family: 'Clash Display', sans-serif; font-size: clamp(24px, 4vw, 36px); font-weight: 700; color: #fff; margin-bottom: 12px; }
  .rpt-final-cta-sub { font-size: 15px; color: rgba(255,255,255,0.8); max-width: 560px; margin: 0 auto 28px; line-height: 1.65; }
  .rpt-final-cta-btns { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
  .rpt-btn-white {
    display: inline-flex; align-items: center; justify-content: center;
    height: 48px; padding: 0 28px;
    background: #fff; color: #171717;
    border: 2px solid #171717; border-radius: 16px;
    font-size: 14px; font-weight: 700; text-decoration: none;
    box-shadow: 4px 4px 0px 0px rgba(25,26,35,1);
    transition: transform 0.1s, box-shadow 0.1s;
  }
  .rpt-btn-white:hover { transform: translate(2px,2px); box-shadow: 2px 2px 0px 0px rgba(25,26,35,1); }
  .rpt-btn-outline {
    display: inline-flex; align-items: center; justify-content: center;
    height: 48px; padding: 0 28px;
    background: rgba(255,255,255,0.12); color: #fff;
    border: 2px solid rgba(255,255,255,0.4); border-radius: 16px;
    font-size: 14px; font-weight: 700; text-decoration: none;
    transition: background 0.15s;
  }
  .rpt-btn-outline:hover { background: rgba(255,255,255,0.2); }

  @media (max-width: 640px) {
    .rpt-c4 { grid-template-columns: 1fr 1fr !important; }
    .rpt-c3 { grid-template-columns: 1fr 1fr !important; }
    .rpt-bar-row { grid-template-columns: 110px 1fr 50px; }
    .rpt-bar-row.rpt-narrow { grid-template-columns: 100px 1fr 55px; }
    .rpt-donut-layout { grid-template-columns: 1fr; }
    .rpt-two-col { grid-template-columns: 1fr; }
    .rpt-inline-cta-inner { flex-direction: column; align-items: flex-start; }
    .rpt-hero-stats { gap: 20px; }
    .rpt-final-cta { padding: 32px 20px; }
  }
`;
