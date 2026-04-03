import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Finance in India: What Graduates Actually Face — Studojo Report 2026" },
    {
      name: "description",
      content:
        "1,400+ entry-level finance openings. Salary benchmarks across global banks, fintechs, and Big 4. Skills that command a premium. Data-driven analysis for students entering finance in India.",
    },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/finance-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Finance in India: What Graduates Actually Face" },
    { property: "og:site_name", content: "Studojo" },
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
        labels: ["Global Banks\n(Goldman, JPM, Citi)", "Funded Fintechs\n(Series B+)", "Big 4\n(Deloitte, PwC etc)", "Indian Private\nBanks", "NBFCs and\nInsurance", "PSU Banks and\nGovt Finance"],
        datasets: [
          { label: "Median starting CTC (LPA)", data: [20, 9.5, 7, 6, 5, 4.2], backgroundColor: VIOLET, borderRadius: 6, borderWidth: 0 },
          { label: "Top quartile CTC (LPA)", data: [22, 13, 9, 8, 6.5, 5.5], backgroundColor: VIOLET3, borderRadius: 6, borderWidth: 0 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw} LPA` } } },
        scales: { x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: MUTED } }, y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 12 }, callback: (v: any) => v + " LPA", color: MUTED } } },
      },
    });
  }

  const roleEl = document.getElementById("roleChart") as HTMLCanvasElement | null;
  if (roleEl && !roleEl.dataset.rendered) {
    roleEl.dataset.rendered = "1";
    new Chart(roleEl, {
      type: "bar",
      data: {
        labels: ["Financial Analysis / FP&A", "Accounting and Audit", "Risk and Compliance", "Credit and Lending Ops", "Investment Research", "Data Analytics in Finance", "Fintech Product Finance", "Corporate Treasury", "Trade Finance and Ops"],
        datasets: [
          { label: "Current open roles (index)", data: [100, 88, 65, 72, 42, 78, 58, 35, 30], backgroundColor: VIOLET, borderRadius: 4, borderWidth: 0, yAxisID: "y" },
          { label: "Year-on-year growth (%)", data: [18, 8, 31, 15, 22, 67, 72, 12, 9], backgroundColor: ORANGE, borderRadius: 4, borderWidth: 0, yAxisID: "y1" },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: "y",
        plugins: { legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } }, tooltip: { mode: "index", intersect: false } },
        scales: { x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } }, y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } }, y1: { display: false } },
      },
    });
  }

  const skillEl = document.getElementById("skillPremiumChart") as HTMLCanvasElement | null;
  if (skillEl && !skillEl.dataset.rendered) {
    skillEl.dataset.rendered = "1";
    new Chart(skillEl, {
      type: "bar",
      data: {
        labels: ["Excel only", "Excel + Python", "Excel + Python + SQL", "Excel + Python + SQL + Bloomberg"],
        datasets: [{ label: "Median year-1 CTC (LPA)", data: [5.5, 9, 11.5, 14], backgroundColor: [GREY, VIOLET3, VIOLET2, VIOLET], borderRadius: 6, borderWidth: 2, borderColor: INK }],
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
        labels: ["Job-ready on arrival (22%)", "Strong tech, weak soft skills (31%)", "Good instincts, weak technical (27%)", "Significant gaps across the board (20%)"],
        datasets: [{ data: [22, 31, 27, 20], backgroundColor: [VIOLET, VIOLET2, ORANGE, RED], borderColor: "#fff", borderWidth: 3, hoverOffset: 8 }],
      },
      options: { responsive: false, cutout: "65%", plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } } } },
    });
  }

  const certEl = document.getElementById("certChart") as HTMLCanvasElement | null;
  if (certEl && !certEl.dataset.rendered) {
    certEl.dataset.rendered = "1";
    new Chart(certEl, {
      type: "bar",
      data: {
        labels: ["No cert,\nno internship", "Short internship\n(3 months)", "CFA Level 1", "Strong internship\n(6 months+)", "CFA L1 +\ninternship", "MBA Tier 2", "MBA Tier 1\n(IIM/ISB)"],
        datasets: [{ label: "Median year-1 CTC (LPA)", data: [4.5, 5.8, 6.5, 8, 10, 9.5, 17], backgroundColor: [GREY, VIOLET3, VIOLET3, VIOLET2, VIOLET, GREEN2, GREEN], borderRadius: 6, borderWidth: 2, borderColor: INK }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` Median: ${ctx.raw} LPA` } } },
        scales: { x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: INK } }, y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, ticks: { font: { size: 11 }, callback: (v: any) => v + " L", color: MUTED } } },
      },
    });
  }

  const locEl = document.getElementById("locationChart") as HTMLCanvasElement | null;
  if (locEl && !locEl.dataset.rendered) {
    locEl.dataset.rendered = "1";
    new Chart(locEl, {
      type: "doughnut",
      data: {
        labels: ["In-office (64%)", "Hybrid (27%)", "Remote (9%)"],
        datasets: [{ data: [64, 27, 9], backgroundColor: [VIOLET, VIOLET3, GREY], borderColor: "#fff", borderWidth: 3, hoverOffset: 6 }],
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: "60%", plugins: { legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 12 } }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } } } },
    });
  }

  const locTechEl = document.getElementById("locationTechChart") as HTMLCanvasElement | null;
  if (locTechEl && !locTechEl.dataset.rendered) {
    locTechEl.dataset.rendered = "1";
    new Chart(locTechEl, {
      type: "doughnut",
      data: {
        labels: ["In-office (28%)", "Hybrid (52%)", "Remote (20%)"],
        datasets: [{ data: [28, 52, 20], backgroundColor: [GREEN, GREEN2, GREY], borderColor: "#fff", borderWidth: 3, hoverOffset: 6 }],
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: "60%", plugins: { legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 12 } }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } } } },
    });
  }
}

export default function FinanceIndiaReport() {
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
      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        {/* Hero */}
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Market Analysis · Q1 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Finance India 2026</span>
            </nav>
            <h1 className="rpt-h1">Finance in India:<br /><em>What Graduates Actually Face</em></h1>
            <p className="rpt-hero-sub">
              1,400+ entry-level openings. A 20 LPA ceiling at global banks that almost nobody reaches. And the one skill gap that sends 75% of finance graduates home before the first round.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval">1,416</div><div className="rpt-hlbl">Entry-level openings right now</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">+27%</div><div className="rpt-hlbl">BFSI hiring surge vs. 2024</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">8 findings</div><div className="rpt-hlbl">Live job data + recruiter surveys</div></div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="rpt-cta-strip">
          <div className="rpt-cta-strip-inner">
            <span className="rpt-cta-strip-text">Looking for finance internships in India?</span>
            <Link to="/dojos/internships" className="rpt-cta-pill">Browse finance roles on Studojo →</Link>
          </div>
        </div>

        <div className="rpt-content">

          {/* Finding 1 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 01</span>
              <h2 className="rpt-h2">The market is growing fast. Four cities hold almost all of it.</h2>
              <p className="rpt-lead">BFSI hiring rose 27% in the first half of 2025 compared to the same period in 2024. There are 1,416 entry-level finance positions open right now across India. But the distribution is anything but even.</p>
            </div>

            <div className="rpt-stat-row rpt-c4">
              <div className="rpt-stat"><div className="rpt-val rpt-v">1,416</div><div className="rpt-lbl">Entry-level finance openings nationwide</div><span className="rpt-delta rpt-du">+27% vs H1 2024</span></div>
              <div className="rpt-stat"><div className="rpt-val">78%</div><div className="rpt-lbl">Of all roles in just 4 cities</div><span className="rpt-delta rpt-dn">Mumbai, Bengaluru, Delhi, Pune</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">8 LPA</div><div className="rpt-lbl">Median starting salary at fintechs</div><span className="rpt-delta rpt-du">Up from 5.5L in 2023</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">9%</div><div className="rpt-lbl">Finance roles that are remote or hybrid</div><span className="rpt-delta rpt-dn">Mostly in-office still</span></div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Open roles by city</div>
              <div className="rpt-bar-list">
                {[
                  { city: "Mumbai", sub: "Finance, banking, markets hub", pct: 95, count: "1,020 roles", share: "72% of total", bg: "#8b5cf6" },
                  { city: "Bengaluru", sub: "Fintech, analytics, GCCs", pct: 55, count: "595 roles", share: "42%", bg: "#8b5cf6" },
                  { city: "Delhi NCR", sub: "Big 4, PSU, consulting", pct: 46, count: "495 roles", share: "35%", bg: "#a78bfa" },
                  { city: "Pune", sub: "MNC finance ops, NBFC", pct: 24, count: "255 roles", share: "18%", bg: "#c4b5fd" },
                  { city: "Hyderabad", sub: "GCCs, tech-adjacent finance", pct: 18, count: "198 roles", share: "14%", bg: "#ddd6fe" },
                  { city: "Chennai", sub: "Manufacturing finance, BFSI", pct: 13, count: "142 roles", share: "10%", bg: "#ede9fe" },
                ].map((r) => (
                  <div key={r.city} className="rpt-bar-row">
                    <div className="rpt-bar-label">{r.city}<small>{r.sub}</small></div>
                    <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}>{r.count}</div></div>
                    <div className="rpt-bar-value">{r.count}<small>{r.share}</small></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The City Question</div>
              <p>Mumbai is non-negotiable if you want markets, investment banking, or corporate treasury. Bengaluru leads in fintech and financial analytics. Delhi is the Big 4 and consulting corridor. If you are flexible on location, that flexibility is worth real money at the start of your career.</p>
            </div>
            <p className="rpt-source">Source: Naukri, LinkedIn Jobs, Internshala, April 2026</p>
          </div>

          {/* CTA mid-report */}
          <div className="rpt-inline-cta">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Find finance internships in Mumbai, Bengaluru, and Delhi NCR</div>
                <div className="rpt-inline-cta-sub">The Internship Dojo surfaces niche finance roles across India before job boards catch up.</div>
              </div>
              <Link to="/dojos/internships" className="rpt-btn-primary">Browse Internships</Link>
            </div>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 02</span>
              <h2 className="rpt-h2">The salary gap is real. It depends entirely on who hires you.</h2>
              <p className="rpt-lead">A Goldman analyst earns 3 to 4 times what a PSU bank graduate earns in year one. This is not a small difference. It compounds. Here is the full picture across employer types, with median and top-quartile figures.</p>
            </div>

            <blockquote className="rpt-pullquote">
              <p>"The most common mistake graduates make: chasing the Big 4 brand and ending up at 6 LPA, while a batchmate at a Series B fintech starts at 10 LPA with ESOPs."</p>
            </blockquote>

            <div className="rpt-card">
              <div className="rpt-card-label">Median starting salary by employer type (LPA)</div>
              <div className="rpt-chart-wrap" style={{ height: 320 }}><canvas id="salaryChart"></canvas></div>
            </div>

            <p className="rpt-prose">The chart above shows both median starting and top-quartile salaries. <strong>Global banks are the outlier</strong> — median starting pay is 18 to 22 LPA, roughly 3x what Big 4 entry roles pay. But global banks hire 12 to 15 graduates per city per quarter. Big 4 firms hire hundreds. Most people end up in the second column, not the first.</p>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-v">20 LPA</div><div className="rpt-lbl">Median year-1 comp at global investment banks (Goldman, JPM, Citi)</div></div>
              <div className="rpt-stat"><div className="rpt-val">7 LPA</div><div className="rpt-lbl">Median year-1 comp at Big 4 firms (Deloitte, PwC, EY, KPMG)</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">9.5 LPA</div><div className="rpt-lbl">Median year-1 comp at funded fintechs (Series B and above)</div></div>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">What this means for you</div>
              <p>Brand vs. compensation is a real trade-off and most students do not do the math. A Big 4 name opens doors for sure. But a fintech role at 10 LPA with equity, plus two years of real ownership, can put you ahead of the brand-chaser by year three. Run the numbers before you decide.</p>
            </div>
            <p className="rpt-source">Source: AmbitionBox, Glassdoor India, LinkedIn Salary, company placement disclosures, April 2026</p>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 03</span>
              <h2 className="rpt-h2">Global banks are hiring. The volume is not there.</h2>
              <p className="rpt-lead">Goldman Sachs, JPMorgan, Morgan Stanley, and Citi post fewer than 40 graduate roles combined across India each quarter. Meanwhile HDFC, Deloitte, Zerodha, and Razorpay post hundreds. The volume is in the second column.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">Global banks (dream roles)</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[["Goldman Sachs", 50, "#8b5cf6", "~12/qtr"], ["JPMorgan", 62, "#8b5cf6", "~15/qtr"], ["Citi India", 34, "#8b5cf6", "~8/qtr"], ["Morgan Stanley", 24, "#a78bfa", "~6/qtr"]].map(([name, pct, bg, val]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}</div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                        <div className="rpt-bar-value">{val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#faf5fe", border: "1px solid #dab2ff" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#8b5cf6" }}>Total intake</div>
                    <div className="rpt-mini-total-val">~41 roles/qtr</div>
                    <div className="rpt-mini-total-sub">Across all global banks, all India cities</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">High volume (where most get placed)</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[["HDFC Bank", 90, "#10b981", "300+/qtr"], ["Big 4 combined", 75, "#10b981", "200+/qtr"], ["Zerodha / Groww", 44, "#34d399", "120+/qtr"], ["Razorpay / CRED", 37, "#6ee7b7", "100+/qtr"]].map(([name, pct, bg, val]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}</div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                        <div className="rpt-bar-value">{val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#d0fae4", border: "1px solid #10b981" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#065f46" }}>Total intake</div>
                    <div className="rpt-mini-total-val">720+ roles/qtr</div>
                    <div className="rpt-mini-total-sub">Just from these four employer categories</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">The realistic path to 18 LPA+</div>
              <p>Most Goldman analysts in Bengaluru did not go straight from college. They started at a fintech or Big 4, built 2 to 3 years of strong track record, and then moved laterally. Treating a high-volume employer as the final destination is the mistake. Treating it as the launchpad is the play.</p>
            </div>
            <p className="rpt-source">Source: LinkedIn Jobs, Naukri, company career pages, April 2026</p>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 04</span>
              <h2 className="rpt-h2">Not all finance is traditional finance. The fastest-growing track is hybrid.</h2>
              <p className="rpt-lead">Financial analysis, investment research, and corporate treasury are the classic paths. But financial data analytics and fintech product finance are growing at 3 to 4 times the rate of traditional roles. The hybrid finance-tech profile is the most in-demand profile of 2026.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Open roles by type (indexed) vs. year-on-year growth rate (%)</div>
              <div className="rpt-chart-wrap" style={{ height: 360 }}><canvas id="roleChart"></canvas></div>
            </div>

            <p className="rpt-prose">The orange bars show year-on-year growth rates. Traditional accounting and audit roles are growing at 8%. Financial data analytics is growing at 67%. Fintech product finance is growing at 72%. The purple bars show current volume — traditional roles still dominate headcount, but the <strong>growth is entirely in hybrid roles</strong> that require both finance and technical skills.</p>

            <div className="rpt-pill-row">
              {["Financial Analysis / FP&A", "Investment Research", "Corporate Treasury"].map(p => <span key={p} className="rpt-pill rpt-pv">{p}</span>)}
              {["Data Analytics in Finance", "Fintech Product Finance", "Risk & Compliance Tech"].map(p => <span key={p} className="rpt-pill rpt-pg">{p}</span>)}
              {["Accounting / Audit"].map(p => <span key={p} className="rpt-pill rpt-po">{p}</span>)}
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The hybrid profile</div>
              <p>If you can model in Excel and query in SQL, you are rare. Most finance graduates can do one. Almost none can do both well. That gap is worth 2 to 4 LPA at the entry level. It is the single highest-return skill investment you can make before placement season.</p>
            </div>
            <p className="rpt-source">Source: LinkedIn Jobs data, NASSCOM BFSI report, Naukri HireQuotient, April 2026</p>
          </div>

          {/* CTA mid-report 2 */}
          <div className="rpt-inline-cta" style={{ background: "#171717" }}>
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title" style={{ color: "#fff" }}>Build the resume that gets you into a finance role</div>
                <div className="rpt-inline-cta-sub" style={{ color: "#a3a3a3" }}>ATS-optimised, free, takes 5 minutes. Used by 5,000+ students.</div>
              </div>
              <Link to="/dojos/careers" className="rpt-btn-primary">Build Resume Free</Link>
            </div>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 05</span>
              <h2 className="rpt-h2">Excel is still king. Python is the moat separating 6 LPA from 12 LPA.</h2>
              <p className="rpt-lead">We analysed skills mentioned across 800+ entry-level finance job descriptions. Here is what actually shows up, ranked by frequency, and which combinations command a salary premium.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Skill frequency across 800+ entry-level finance JDs</div>
              <div className="rpt-bar-list">
                {[
                  { skill: "Excel and financial modeling", sub: "Required by almost every JD", pct: 95, bg: "#8b5cf6" },
                  { skill: "Communication and presentation", sub: "Top rejection reason when missing", pct: 82, bg: "#8b5cf6" },
                  { skill: "Accounting fundamentals", sub: "P&L, balance sheet, cash flows", pct: 74, bg: "#a78bfa" },
                  { skill: "Python and data analysis", sub: "Salary premium: +2 to 4 LPA", pct: 61, bg: "#10b981" },
                  { skill: "SQL", sub: "Often paired with Python asks", pct: 54, bg: "#10b981" },
                  { skill: "Bloomberg or Reuters", sub: "Mostly investment and research roles", pct: 38, bg: "#c4b5fd" },
                  { skill: "Tally or ERP (SAP, Oracle)", sub: "Corporate finance, accounting roles", pct: 29, bg: "#ddd6fe" },
                  { skill: "CFA or CA in progress", sub: "Signals commitment, not competency", pct: 24, bg: "#ede9fe" },
                ].map((r) => (
                  <div key={r.skill} className="rpt-bar-row">
                    <div className="rpt-bar-label">{r.skill}<small>{r.sub}</small></div>
                    <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}>{r.pct}%</div></div>
                    <div className="rpt-bar-value">{r.pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            <p className="rpt-prose" style={{ marginTop: 24 }}>Frequency tells you what is expected. What moves the needle on salary is the combination. Here is what the data shows when you look at skill stacks and their median year-1 pay outcomes.</p>

            <div className="rpt-card">
              <div className="rpt-card-label">Salary premium by skill stack — median year-1 CTC (LPA)</div>
              <div className="rpt-chart-wrap" style={{ height: 240 }}><canvas id="skillPremiumChart"></canvas></div>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The number one rejection reason</div>
              <p><strong>Soft skills are the top rejection reason, not technical gaps.</strong> Recruiters across Deloitte, ICICI, and Razorpay consistently cite "cannot communicate financial concepts clearly" as the primary reason to reject finalists. You cannot model your way out of that. If you can walk a non-finance person through a P&amp;L in two minutes, you are already ahead of most candidates.</p>
            </div>
            <p className="rpt-source">Source: 800+ JD analysis (Naukri, LinkedIn), recruiter interviews, placement cell data, April 2026</p>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 06</span>
              <h2 className="rpt-h2">75 to 80% of finance graduates are not ready. Here is where the gap sits.</h2>
              <p className="rpt-lead">Placement cells and hiring managers across 40 firms consistently report the same pattern: technical competency is average, professional readiness is poor, and most graduates undersell what they have actually done. Only 22% are genuinely job-ready on arrival.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Graduate readiness profile (hiring manager assessments across 40 firms)</div>
              <div className="rpt-donut-layout">
                <canvas id="readinessChart" style={{ width: 200, height: 200, flexShrink: 0 }}></canvas>
                <div className="rpt-legend-list">
                  {[
                    { color: "#8b5cf6", label: "Job-ready on arrival", pct: "22%" },
                    { color: "#a78bfa", label: "Strong technically, weak on soft skills", pct: "31%" },
                    { color: "#f59e0b", label: "Good instincts, weak technical base", pct: "27%" },
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

            <p className="rpt-prose">Being job-ready is not the same as being smart or having high grades. It means you can walk into a room and operate. You know how to read a P&amp;L under pressure. You can talk about your work without hedging. You send follow-ups. That is the 22%.</p>

            <div className="rpt-card">
              <div className="rpt-card-label">Top reasons graduates get rejected after being shortlisted</div>
              <div className="rpt-bar-list">
                {[
                  { reason: "Cannot explain their own resume", sub: "Most common finalist failure", pct: 68, bg: "#ef4444" },
                  { reason: "Weak financial modeling test", sub: "Especially case-based rounds", pct: 54, bg: "#f87171" },
                  { reason: "No awareness of current markets", sub: '"What happened in markets last week?"', pct: 48, bg: "#fca5a5" },
                  { reason: "Resume does not reflect actual work", sub: "Vague bullets, team credit taken", pct: 43, bg: "#fca5a5" },
                  { reason: "Poor case study or guesstimate", sub: "Market sizing, revenue estimation", pct: 37, bg: "#fecaca" },
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
              <p>This is not a knowledge problem. It is a preparation problem. One strong financial model in your portfolio. A clear 90-second walk-me-through-your-background. A resume that says what <em>you</em> built, not what your team did. Those three things alone put you in the top 30% of candidates walking in.</p>
            </div>

            {/* Inline CTA for resume */}
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
            <p className="rpt-source">Source: Recruiter surveys across 40 firms, placement cell data from 12 colleges, April 2026</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 07</span>
              <h2 className="rpt-h2">CFA Level 1 adds 1.5 to 2.5 LPA. A strong internship adds more.</h2>
              <p className="rpt-lead">Certifications matter. But they matter differently depending on the path. At the entry level, a 6-month internship in a real finance role consistently outperforms any certification on salary outcomes. Here is the full comparison.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Year-1 median CTC by qualification path (LPA)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="certChart"></canvas></div>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-v">+2 LPA</div><div className="rpt-lbl">Average salary premium for CFA Level 1 at entry level</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">+3.5 LPA</div><div className="rpt-lbl">Average premium for a relevant internship (6 months or more)</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">18 months</div><div className="rpt-lbl">Average time to clear CFA L1 while working full-time</div></div>
            </div>

            <p className="rpt-prose" style={{ marginTop: 24 }}>
              The MBA line stands apart for good reason. An IIM or top-tier MBA is a category reset, not just a salary bump. But the comparison between CFA Level 1, a strong internship, and no qualifications is where most graduates make the wrong bet. <strong>Recruiters at investment firms consistently say a 6-month FP&amp;A or research internship signals more readiness than any certification at entry level.</strong>
            </p>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">The sequencing that works</div>
              <p>Get the internship first. Then get the certification. An internship gives you stories to tell in every interview. A CFA without work experience is a signal of ambition, not competence. Stack them in the right order and you compound both advantages.</p>
            </div>

            {/* Internship CTA */}
            <div className="rpt-inline-cta">
              <div className="rpt-inline-cta-inner">
                <div>
                  <div className="rpt-inline-cta-title">Find your first finance internship</div>
                  <div className="rpt-inline-cta-sub">FP&A, investment research, fintech analytics — curated weekly. Apply directly from Studojo.</div>
                </div>
                <Link to="/dojos/internships" className="rpt-btn-primary">Find Finance Internships</Link>
              </div>
            </div>
            <p className="rpt-source">Source: AmbitionBox salary data, CFA Institute India member survey, recruiter interviews, April 2026</p>
          </div>

          {/* Finding 8 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 08</span>
              <h2 className="rpt-h2">The work-from-office reality nobody talks about in finance job posts.</h2>
              <p className="rpt-lead">Finance hiring managers almost universally expect in-person attendance, especially in the first two years. Here is how finance stacks up against tech and marketing on flexibility, and where the small pockets of remote work actually are.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-card-label">Work mode split — finance roles</div>
                  <div className="rpt-chart-wrap" style={{ height: 200 }}><canvas id="locationChart"></canvas></div>
                </div>
              </div>
              <div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-card-label">Work mode split — tech roles (for comparison)</div>
                  <div className="rpt-chart-wrap" style={{ height: 200 }}><canvas id="locationTechChart"></canvas></div>
                </div>
              </div>
            </div>

            <p className="rpt-prose" style={{ marginTop: 20 }}>Finance is dramatically more in-office than tech. 64% of entry-level finance roles are fully on-site. The 9% that are fully remote are almost entirely in financial data, research writing, and compliance roles at smaller firms. If you are planning your career around remote flexibility, finance is the wrong starting point — or you need to target a very specific niche within it.</p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">Where the remote roles actually are in finance</div>
              <p>Financial research writing, equity report editing, credit analysis for NBFCs, and remote bookkeeping for international clients are the categories where remote-first finance work exists at the entry level. They are niche, lower-paying at the start, but they exist. Build the skill set there, earn the track record, then re-enter the broader market with real leverage.</p>
            </div>
            <p className="rpt-source">Source: Naukri work mode filters, LinkedIn Jobs remote filter analysis, April 2026</p>
          </div>

          {/* Final CTA block */}
          <div className="rpt-final-cta">
            <h2 className="rpt-final-cta-title">Work on things that matter.</h2>
            <p className="rpt-final-cta-sub">Use the Studojo Internship Dojo to find the finance roles this report is talking about — FP&A, analytics, fintech, and investment research openings across India, curated weekly.</p>
            <div className="rpt-final-cta-btns">
              <Link to="/dojos/internships" className="rpt-btn-white">Browse Finance Internships</Link>
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
  .rpt-breadcrumb-link { color: #a78bfa; text-decoration: none; }
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
  .rpt-h1 em { font-style: italic; color: #dab2ff; }
  .rpt-hero-sub { font-size: 16px; color: #a3a3a3; line-height: 1.7; max-width: 600px; margin-bottom: 28px; }
  .rpt-hero-stats { display: flex; gap: 40px; flex-wrap: wrap; padding-top: 24px; border-top: 1px solid #333; }
  .rpt-hval { font-family: 'Clash Display', sans-serif; font-size: 26px; font-weight: 700; color: #dab2ff; }
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
  .rpt-cd .rpt-cl { color: #dab2ff; }
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

  .rpt-mini-total { margin-top: 14px; padding: 10px 12px; border-radius: 10px; }
  .rpt-mini-total-label { font-size: 11px; font-weight: 700; margin-bottom: 4px; }
  .rpt-mini-total-val { font-family: 'Clash Display', sans-serif; font-size: 22px; font-weight: 700; }
  .rpt-mini-total-sub { font-size: 12px; color: #737373; margin-top: 2px; }

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
