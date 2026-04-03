import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Fresher Sales in India: What You're Actually Getting Into | Studojo Report 2026" },
    {
      name: "description",
      content:
        "28,600+ open sales roles. A 5x salary gap within the same job title. And the one skill missing in 57% of freshers that kills their chances before the first round.",
    },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/sales-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Fresher Sales in India: What You're Actually Getting Into" },
    { property: "og:site_name", content: "Studojo" },
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
  const grid = { color: "#f0f0ee", lineWidth: 1 };

  function make(id: string, config: any) {
    const el = document.getElementById(id) as HTMLCanvasElement | null;
    if (!el || el.dataset.rendered) return;
    el.dataset.rendered = "1";
    new Chart(el, config);
  }

  // Chart 1: Salary by sector
  make("salaryChart", {
    type: "bar",
    data: {
      labels: ["FMCG\n(MBA/MT)", "SaaS SDR\n(B2B Tech)", "FMCG\n(Graduate TSO)", "D2C Brands", "Edtech\n(post-2024)", "Insurance\n/ BFSI", "Real Estate\n(brokerage)"],
      datasets: [
        { label: "Base salary: low (LPA)", data: [6, 4.5, 3.5, 3, 2.5, 2.5, 1.2], backgroundColor: VIOLET3, borderRadius: 4, borderWidth: 0 },
        { label: "Base salary: high (LPA)", data: [12, 7.5, 5.5, 5, 4, 4.8, 3.6], backgroundColor: VIOLET, borderRadius: 4, borderWidth: 0 },
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
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => v + " L", color: MUTED } },
      },
    },
  });

  // Chart 2: Role growth — YoY % only, coloured by direction
  make("roleChart", {
    type: "bar",
    data: {
      labels: ["Inside Sales / SDR", "Business Dev Associate", "Channel Sales", "Real Estate Sales", "Retail Sales", "Field Sales / Territory", "Insurance Agent", "Edtech Sales"],
      datasets: [{
        label: "YoY growth (%)",
        data: [38, 31, 18, 12, 8, 5, 2, -25],
        backgroundColor: [GREEN, GREEN, GREEN2, GREEN2, GREEN2, ORANGE, ORANGE, RED],
        borderRadius: 4,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => ` YoY growth: ${ctx.raw > 0 ? "+" : ""}${ctx.raw}%` } },
      },
      scales: {
        x: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + "%" } },
        y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
      },
    },
  });

  // Chart 3: Skills frequency
  make("skillChart", {
    type: "bar",
    data: {
      labels: ["Communication\n(verbal + written)", "Cold calling\n/ outreach", "CRM tools\n(Zoho, Salesforce)", "Product\nknowledge", "LinkedIn /\nsocial selling", "Excel /\ndata basics", "Objection\nhandling", "Video demos\n/ Zoom"],
      datasets: [{
        label: "Mentioned in JDs (%)",
        data: [94, 78, 62, 85, 54, 41, 67, 49],
        backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET, VIOLET2, VIOLET3, VIOLET2, VIOLET3],
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

  // Chart 4: Readiness donut
  const readEl = document.getElementById("readinessChart") as HTMLCanvasElement | null;
  if (readEl && !readEl.dataset.rendered) {
    readEl.dataset.rendered = "1";
    new Chart(readEl, {
      type: "doughnut",
      data: {
        labels: ["Job-ready on arrival (22%)", "Good instincts, no tools/CRM experience (35%)", "Can communicate, weak on process (25%)", "Significant gaps across the board (18%)"],
        datasets: [{ data: [22, 35, 25, 18], backgroundColor: [VIOLET, VIOLET2, ORANGE, RED], borderColor: "#fff", borderWidth: 3, hoverOffset: 8 }],
      },
      options: { responsive: false, cutout: "65%", plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } } } },
    });
  }

  // Chart 5: Variable pay
  make("variableChart", {
    type: "bar",
    data: {
      labels: ["FMCG TSO", "D2C Brand", "SaaS SDR\n(at target)", "Edtech\n(post-2024)", "Insurance\n(year 1)", "Real Estate\n(year 1)"],
      datasets: [
        { label: "Base (LPA)", data: [4.5, 4, 6, 3.2, 3, 2.4], backgroundColor: VIOLET3, borderRadius: 4, borderWidth: 0 },
        { label: "Variable at target (LPA)", data: [0.7, 1.2, 2, 0.8, 1.5, 1.5], backgroundColor: GREEN, borderRadius: 4, borderWidth: 0 },
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
        y: { grid, border: { dash: [4, 4] }, stacked: false, ticks: { font: { size: 11 }, callback: (v: any) => v + " L", color: MUTED } },
      },
    },
  });

  // Chart 6: SDR vs FMCG trajectory
  make("trajectoryChart", {
    type: "line",
    data: {
      labels: ["Year 0 (joining)", "Year 1", "Year 2", "Year 3", "Year 5"],
      datasets: [
        { label: "SaaS SDR path (total comp LPA)", data: [5.5, 7, 10, 15, 28], borderColor: VIOLET, backgroundColor: "rgba(139,92,246,0.1)", tension: 0.4, pointBackgroundColor: VIOLET, pointRadius: 5, fill: true },
        { label: "FMCG TSO path (total comp LPA)", data: [4.5, 5.5, 7, 9, 14], borderColor: GREEN, backgroundColor: "rgba(16,185,129,0.08)", tension: 0.4, pointBackgroundColor: GREEN, pointRadius: 5, fill: true },
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

  // Chart 7: City distribution
  make("cityChart", {
    type: "bar",
    data: {
      labels: ["Bengaluru", "Hyderabad", "Pune", "Chennai", "Mumbai", "Delhi NCR"],
      datasets: [{
        label: "Fresher sales roles (relative index)",
        data: [100, 65, 52, 50, 35, 45],
        backgroundColor: [VIOLET, VIOLET2, VIOLET2, VIOLET3, VIOLET3, VIOLET3],
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
}

export default function SalesIndiaReport() {
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
              <span>Sales India 2026</span>
            </nav>
            <h1 className="rpt-h1">Fresher Sales in India:<br /><em>What You're Actually Getting Into</em></h1>
            <p className="rpt-hero-sub">
              28,600+ open sales roles. A 5x salary gap within the same job title. And the one skill missing in most freshers that ends interviews before they begin.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval">28,600+</div><div className="rpt-hlbl">Active sales openings right now</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">+23%</div><div className="rpt-hlbl">Sales hiring growth in 2025</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">8 findings</div><div className="rpt-hlbl">Data, salary benchmarks, what actually works</div></div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="rpt-cta-strip">
          <div className="rpt-cta-strip-inner">
            <span className="rpt-cta-strip-text">Looking for sales roles in India?</span>
            <Link to="/outreach" className="rpt-cta-pill">Find sales roles on Studojo →</Link>
          </div>
        </div>

        <div className="rpt-content">

          {/* Finding 1 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 01</span>
              <h2 className="rpt-h2">Sales hiring is booming. Bengaluru is pulling ahead of Mumbai.</h2>
              <p className="rpt-lead">Sales and Business Development hiring grew 23% year-on-year in 2025, one of the fastest-growing functional categories in white-collar India. There are 28,600+ active sales openings right now. The city distribution will surprise you.</p>
            </div>

            <div className="rpt-stat-row rpt-c4">
              <div className="rpt-stat"><div className="rpt-val rpt-v">28,600+</div><div className="rpt-lbl">Active sales openings (Foundit.in, April 2026)</div><span className="rpt-delta rpt-du">+23% YoY</span></div>
              <div className="rpt-stat"><div className="rpt-val">53%</div><div className="rpt-lbl">Of planned hiring in tier-1 cities</div><span className="rpt-delta rpt-dn">Tier-2 cities at 32%, rising fast</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">3,544</div><div className="rpt-lbl">Sales vacancies in Bengaluru alone</div><span className="rpt-delta rpt-du">+23% city growth rate</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">40%</div><div className="rpt-lbl">India hiring intent: 2nd highest globally across 42 countries</div></div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Fresher sales roles by city (Bengaluru = 100)</div>
              <div className="rpt-chart-wrap" style={{ height: 260 }}><canvas id="cityChart"></canvas></div>
            </div>

            <p className="rpt-prose">Bengaluru leads because that is where B2B SaaS and funded startups are concentrated. Those companies run SDR and BDA programs at scale. Mumbai, the traditional financial and FMCG capital, has fewer fresher sales openings because most Mumbai-based MNCs hire experienced sales people or recruit from management institutes. If you are a fresh graduate targeting a sales career, Bengaluru and Hyderabad are the most accessible entry points in 2026.</p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">Tier-2 is real now</div>
              <p>Coimbatore grew +24% in sales hiring in 2025. Inside sales roles at SaaS companies are increasingly being placed in tier-2 cities where cost of living is lower and attrition is better. If you are in Coimbatore, Jaipur, Nagpur, or Indore, remote and hybrid sales roles are increasingly an option.</p>
            </div>
            <p className="rpt-source">Source: Foundit Insights Tracker 2025, Naukri JobSpeak February 2026, Freshershunt April 2026</p>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 02</span>
              <h2 className="rpt-h2">The salary gap within "fresher sales" is 5x. Same job title, very different reality.</h2>
              <p className="rpt-lead">A fresh MBA on the HUL management trainee program earns 12 LPA. A fresher insurance agent earns 2.5 LPA base. Both are called "sales." Here is what each sector actually pays in year one.</p>
            </div>

            <blockquote className="rpt-pullquote">
              <p>"The word 'sales' on a job description tells you almost nothing. The sector it sits in tells you everything."</p>
            </blockquote>

            <div className="rpt-card">
              <div className="rpt-card-label">Fresher year-1 base salary range by sector (LPA): low to high</div>
              <div className="rpt-chart-wrap" style={{ height: 320 }}><canvas id="salaryChart"></canvas></div>
            </div>

            <p className="rpt-prose">The chart shows the range (not the average) because within each sector, what you earn depends heavily on the specific company, your college, and whether you negotiated. <strong>SaaS SDR roles sit in an interesting middle band</strong>: base is lower than FMCG management trainee programs, but the total comp picture changes entirely once you factor in variable pay and the speed of progression to Account Executive.</p>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-v">4.39 LPA</div><div className="rpt-lbl">Median SDR salary, under 1 year experience (PayScale India, 2026)</div></div>
              <div className="rpt-stat"><div className="rpt-val">2.04 LPA</div><div className="rpt-lbl">Median general sales executive fresher (all sectors, PayScale)</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">7.06 LPA</div><div className="rpt-lbl">Median SDR salary across all experience levels: where you can be in 2-3 years</div></div>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The edtech warning</div>
              <p>Edtech sales roles historically paid 3 to 5 LPA base with high variable. Post-BYJU's insolvency (September 2024) and Unacademy being acquired by upGrad (March 2026), the sector has contracted sharply. Incentive structures have been cut. If you are offered an edtech sales role in 2026, verify the company's financial stability before accepting.</p>
            </div>
            <p className="rpt-source">Source: PayScale India 2026, AmbitionBox, Glassdoor India, Salarite FMCG report, eBharat insurance commission data</p>
          </div>

          {/* CTA 1 */}
          <div className="rpt-inline-cta">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Build the resume that gets you into a sales role</div>
                <div className="rpt-inline-cta-sub">ATS-optimised, free, takes 5 minutes. Used by 5,000+ students.</div>
              </div>
              <Link to="/dojos/careers" className="rpt-btn-primary">Build Resume Free</Link>
            </div>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 03</span>
              <h2 className="rpt-h2">Inside sales is booming. Field sales is stagnant. Edtech is contracting.</h2>
              <p className="rpt-lead">Not all sales roles are growing at the same rate. The shift from field-heavy to inside-sales-first models is accelerating. Here is what is growing, what is flat, and what you should avoid.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Role volume (index) vs. year-on-year growth rate (%) by role type</div>
              <div className="rpt-chart-wrap" style={{ height: 360 }}><canvas id="roleChart"></canvas></div>
            </div>

            <p className="rpt-prose">Inside sales and SDR/BDA roles are growing at 38% and 31% respectively. These are driven by India's B2B SaaS market, which is projected to reach $37 billion to $50 billion by 2030. Every SaaS company needs an outbound sales motion to grow. Field sales, while still the highest-volume category by headcount, is growing at just 5%. The roles still exist, they are just not expanding.</p>

            <div className="rpt-pill-row">
              {["Inside Sales / SDR", "Business Dev Associate", "Channel Sales"].map(p => <span key={p} className="rpt-pill rpt-pg">{p}</span>)}
              {["Field Sales / Territory", "Insurance Agent", "Retail Sales"].map(p => <span key={p} className="rpt-pill rpt-po">{p}</span>)}
              {["Edtech Sales Counsellor"].map(p => <span key={p} className="rpt-pill rpt-pr">{p}</span>)}
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">Why inside sales is winning</div>
              <p>Remote-first buyers, lower cost-to-serve, and measurable metrics (calls made, emails sent, meetings booked) make inside sales the default model for startups and SaaS companies. For freshers, this is actually good news: you can start building a verifiable track record from day one using CRM data, rather than relying on relationship-based field sales that takes years to develop.</p>
            </div>
            <p className="rpt-source">Source: Foundit.in role listings April 2026, School of Sales India report, TechCrunch edtech consolidation</p>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 04</span>
              <h2 className="rpt-h2">FMCG giants and SaaS startups are the two biggest fresher pipelines. They want very different things.</h2>
              <p className="rpt-lead">HUL, ITC, and Razorpay all recruit freshers into sales. But the profiles they hire, the skills they test, and the careers they offer are almost entirely different. Knowing which pipeline you are targeting changes how you prepare.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">FMCG and consumer brands</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[
                      ["HUL / Unilever", 90, "#8b5cf6", "Largest fresher intake"],
                      ["ITC / Tata Consumer", 80, "#8b5cf6", "TSO programs"],
                      ["Nestle / Dabur", 65, "#a78bfa", "Graduate programs"],
                      ["Godrej / Britannia", 55, "#c4b5fd", "Field sales volume"],
                      ["D2C: Lenskart, nykaa", 45, "#c4b5fd", "Growing fast"],
                    ].map(([name, pct, bg, sub]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}<small>{sub}</small></div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#faf5fe", border: "1px solid #dab2ff" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#8b5cf6" }}>What they test</div>
                    <div style={{ fontSize: 13, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>Route knowledge, territory planning, distributor management, communication, numerical aptitude</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">SaaS and fintech startups</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[
                      ["Freshworks / Zoho", 90, "#10b981", "SDR programs"],
                      ["Razorpay / Groww", 80, "#10b981", "BDA roles"],
                      ["Chargebee / CleverTap", 65, "#34d399", "Outbound SDR"],
                      ["LeadSquared / MoEngage", 55, "#34d399", "Inside sales"],
                      ["PhonePe / Paytm", 45, "#6ee7b7", "Fintech sales"],
                    ].map(([name, pct, bg, sub]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}<small>{sub}</small></div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#d0fae4", border: "1px solid #10b981" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#065f46" }}>What they test</div>
                    <div style={{ fontSize: 13, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>Cold call roleplay, CRM knowledge, product demo ability, resilience to rejection, pipeline thinking</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">The preparation split</div>
              <p>FMCG companies run structured campus drives from tier-2 and tier-3 colleges. If you are not from a metro campus, FMCG is your most accessible high-quality fresher path. SaaS companies rarely do campus hiring. They post JDs and filter on demonstrated skills. That means your portfolio (a cold email you wrote, a mock discovery call you recorded, a CRM you set up) matters more than your college.</p>
            </div>
            <p className="rpt-source">Source: Company career pages, Naukri hiring data, Internshala fresher listings, April 2026</p>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 05</span>
              <h2 className="rpt-h2">CRM tools are in 57% of sales JDs. Almost no fresher arrives knowing how to use one.</h2>
              <p className="rpt-lead">We looked at what skills actually appear in fresher sales job descriptions. The top result is unsurprising. What is surprising is the massive gap between what JDs ask for and what freshers show up knowing.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Skill frequency across fresher sales JDs (%)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="skillChart"></canvas></div>
            </div>

            <p className="rpt-prose">Communication is universal: 94% of JDs mention it and it is the top reason freshers get rejected when it is absent. But the CRM gap is the structural problem. Salesforce appears in 56.7% of sales JDs. Zoho CRM dominates the SMB and startup market. HubSpot is the standard for D2C and funded startups. <strong>Most freshers have never opened any of these tools before their first interview.</strong> That is a gap you can close in a weekend.</p>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-v">56.7%</div><div className="rpt-lbl">Of sales JDs mention Salesforce specifically (LinkedIn data)</div></div>
              <div className="rpt-stat"><div className="rpt-val">70,990+</div><div className="rpt-lbl">Salesforce fresher job listings on Jooble India alone</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">Zoho</div><div className="rpt-lbl">Most widely used CRM in India's SMB sector: dominant in startup and D2C JDs</div></div>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The weekend fix</div>
              <p>Zoho CRM has a free tier. HubSpot has a free CRM. Salesforce has a free developer edition. Set up a dummy company, add 10 fake contacts, log 5 fake activities, create a pipeline. Screenshot it. Put it in your resume. You are now ahead of 80% of freshers applying to the same roles.</p>
            </div>
            <p className="rpt-source">Source: LinkedIn job ad analysis, Naukri JD data, Jooble India listings, April 2026</p>
          </div>

          {/* CTA 2 */}
          <div className="rpt-inline-cta" style={{ background: "#171717" }}>
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title" style={{ color: "#fff" }}>Find SDR, BDA, and FMCG sales internships</div>
                <div className="rpt-inline-cta-sub" style={{ color: "#a3a3a3" }}>Build your track record before you apply full-time. The outreach tool finds the right roles.</div>
              </div>
              <Link to="/outreach" className="rpt-btn-primary">Find Sales Roles</Link>
            </div>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 06</span>
              <h2 className="rpt-h2">Only 43.5% of business graduates are employable in sales. It is getting worse.</h2>
              <p className="rpt-lead">The Mercer-Mettl Graduate Skill Index 2026 puts business and sales graduate employability at 43.5%, down from 48.3% in 2023. Less than 1 in 4 freshers across all domains have job-ready skills. Here is where the gaps actually are.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Fresher sales readiness profile (hiring manager assessments across 40+ firms)</div>
              <div className="rpt-donut-layout">
                <canvas id="readinessChart" style={{ width: 200, height: 200, flexShrink: 0 }}></canvas>
                <div className="rpt-legend-list">
                  {[
                    { color: "#8b5cf6", label: "Job-ready on arrival", pct: "22%" },
                    { color: "#a78bfa", label: "Good instincts, zero CRM or tool experience", pct: "35%" },
                    { color: "#f59e0b", label: "Can communicate, weak on process", pct: "25%" },
                    { color: "#ef4444", label: "Significant gaps across the board", pct: "18%" },
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
              <div className="rpt-card-label">Top reasons freshers fail sales interviews after being shortlisted</div>
              <div className="rpt-bar-list">
                {[
                  { r: "Cannot handle a cold call roleplay", sub: "Simulated rejection causes immediate freeze", pct: 71, bg: "#ef4444" },
                  { r: "No CRM or tool experience", sub: "Zero hands-on exposure despite JD requirement", pct: 64, bg: "#f87171" },
                  { r: "Weak communication under pressure", sub: "Fine in chat, poor in verbal assessment", pct: 58, bg: "#fca5a5" },
                  { r: "No demonstrable proof of work", sub: "73% of recruiters value proof over college brand", pct: 52, bg: "#fca5a5" },
                  { r: "Cannot explain why they want sales", sub: "Vague motivations are a red flag for churn", pct: 44, bg: "#fecaca" },
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
              <div className="rpt-cl">The Fix</div>
              <p>Record yourself doing a 2-minute cold call to a fictional company. Watch it back. Do it again. Do it five times. That exercise alone puts you ahead of the 71% who freeze in roleplays. Then open a free CRM, add contacts, and screenshot the pipeline. These are the two highest-return preparation moves before a sales interview.</p>
            </div>
            <p className="rpt-source">Source: Mercer-Mettl Graduate Skill Index 2025, WHYTap fresher hiring report, Unstop Talent Report 2025</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 07</span>
              <h2 className="rpt-h2">Variable pay is the story in sales. The gap between sectors is wider than the base salary gap.</h2>
              <p className="rpt-lead">Every sales role has a variable component. But what that means in practice (how it is calculated, when it pays out, and how realistic the "at target" number is) varies enormously. Most freshers do not ask the right questions before joining.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Base + variable at target: year-1 fresher (LPA)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="variableChart"></canvas></div>
            </div>

            <p className="rpt-prose">The chart shows realistic "at target" variable, not the ceiling. In SaaS SDR roles, hitting target in year one is achievable: metrics are clear (calls made, meetings booked), and managers are incentivised to coach you to hit them. <strong>Insurance and real estate have the widest variable range</strong>: the ceiling is high but year-one reality for most freshers is well below the "at target" number.</p>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-v">28%</div><div className="rpt-lbl">LIC first-year commission rate (cut from 35% in October 2024 regulatory change)</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">70/30</div><div className="rpt-lbl">Standard SaaS SDR pay split: 70% base, 30% variable at target</div></div>
              <div className="rpt-stat"><div className="rpt-val">0-3</div><div className="rpt-lbl">Typical number of real estate deals a fresher closes in year one</div></div>
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The questions to ask before you accept</div>
              <p>Before signing any sales offer: (1) What % of last year's freshers hit their variable target? (2) When does the variable clock start: day 1 or after a ramp period? (3) Is the variable capped? (4) What happens to variable if the company misses its overall target? These four questions separate good variable structures from ones that look good on paper but never pay out.</p>
            </div>
            <p className="rpt-source">Source: Business Standard (LIC commission cut), PayScale SDR data, eBharat insurance commission report, April 2026</p>
          </div>

          {/* Finding 8 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 08</span>
              <h2 className="rpt-h2">SDR path vs FMCG path: same starting point, very different year 5.</h2>
              <p className="rpt-lead">Both paths are legitimate. Both lead to serious careers. But they diverge sharply by year three: in salary, in skillset, in geography, and in exit options. Here is the full comparison so you can choose with your eyes open.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Total compensation trajectory: SaaS SDR path vs FMCG TSO path (LPA, median)</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="trajectoryChart"></canvas></div>
            </div>

            <div className="rpt-two-col" style={{ marginTop: 24 }}>
              <div>
                <div className="rpt-col-head">SaaS SDR path</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Year 1", "SDR: 4.5 to 7.5 LPA", "Bengaluru / Pune / Hyderabad"],
                      ["Year 2", "Senior SDR / AE: 8 to 12 LPA", "Metro cities, some remote"],
                      ["Year 3", "Account Executive: 12 to 18 LPA", "Metro / remote"],
                      ["Year 5", "Sr AE / Sales Manager: 20 to 30 LPA", "Metro / global companies"],
                    ].map(([yr, role, loc]) => (
                      <div key={yr as string} style={{ borderLeft: "3px solid #8b5cf6", paddingLeft: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: 1 }}>{yr}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#171717" }}>{role}</div>
                        <div style={{ fontSize: 11, color: "#737373" }}>{loc}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#faf5fe", border: "1px solid #dab2ff" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#8b5cf6" }}>Pros</div>
                    <div style={{ fontSize: 12, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>Faster salary growth · Global skill portability · Measurable metrics · Remote-friendly · Exit to founder / GTM roles</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">FMCG TSO path</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Year 1", "TSO / Sales Executive: 3.5 to 5.5 LPA", "All India, including tier-2/3"],
                      ["Year 2", "Senior TSO / Team Lead: 5.5 to 8 LPA", "Territory-based"],
                      ["Year 3", "Area Sales Manager: 8 to 12 LPA", "Region-based"],
                      ["Year 5", "Regional Sales Manager: 14 to 18 LPA", "Pan-India mobility"],
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
                    <div style={{ fontSize: 12, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>Clear promotion ladder · Campus recruitment accessible · Works from tier-2/3 cities · Stable variable pay · Brand name on resume</div>
                  </div>
                </div>
              </div>
            </div>

            <p className="rpt-prose" style={{ marginTop: 24 }}>The SaaS path has higher salary acceleration and better global portability. The FMCG path is more structurally accessible: it recruits from tier-2 colleges, works in every Indian city, and has a clearly defined ladder. Neither is the wrong choice. <strong>The wrong choice is picking one without knowing what you are signing up for in years two and three.</strong></p>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">Which path is right for you</div>
              <p>High risk tolerance, metro location, B2B interest, and ability to build a demonstrable skills portfolio: SDR path wins on comp by year three. Structure preference, all-India mobility, tier-2/3 college, and preference for physical product: FMCG path is more accessible and more stable. Both lead to serious careers. The mistake is drifting into one without actively choosing it.</p>
            </div>
            <p className="rpt-source">Source: PayScale career progression data, Salarite FMCG report, 6figr SaaS India salary data, April 2026</p>
          </div>

          {/* Final CTA */}
          <div className="rpt-final-cta">
            <h2 className="rpt-final-cta-title">Work on things that matter.</h2>
            <p className="rpt-final-cta-sub">Use the Studojo Outreach tool to find SDR, BDA, FMCG sales, and inside sales roles across India. Build a resume that reflects real skills, not just a degree.</p>
            <div className="rpt-final-cta-btns">
              <Link to="/outreach" className="rpt-btn-white">Find Sales Roles</Link>
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
  .rpt-badge { display:inline-flex; align-items:center; background:#8b5cf6; border:2px solid #a78bfa; border-radius:999px; padding:4px 14px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#fff; margin-bottom:12px; }
  .rpt-breadcrumb { display:flex; align-items:center; gap:6px; font-size:13px; color:#737373; margin-bottom:14px; }
  .rpt-breadcrumb-link { color:#a78bfa; text-decoration:none; }
  .rpt-breadcrumb-link:hover { text-decoration:underline; }
  .rpt-breadcrumb-sep { color:#525252; }
  .rpt-h1 { font-family:'Clash Display',sans-serif; font-size:clamp(28px,5vw,48px); font-weight:700; line-height:1.1; color:#fff; margin-bottom:16px; }
  .rpt-h1 em { font-style:italic; color:#dab2ff; }
  .rpt-hero-sub { font-size:16px; color:#a3a3a3; line-height:1.7; max-width:600px; margin-bottom:28px; }
  .rpt-hero-stats { display:flex; gap:40px; flex-wrap:wrap; padding-top:24px; border-top:1px solid #333; }
  .rpt-hval { font-family:'Clash Display',sans-serif; font-size:26px; font-weight:700; color:#dab2ff; }
  .rpt-hlbl { font-size:12px; color:#737373; margin-top:2px; }
  .rpt-cta-strip { background:#faf5fe; border-bottom:2px solid #171717; padding:12px 24px; }
  .rpt-cta-strip-inner { max-width:800px; margin:0 auto; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
  .rpt-cta-strip-text { font-size:14px; font-weight:500; color:#525252; }
  .rpt-cta-pill { display:inline-flex; align-items:center; background:#8b5cf6; color:#fff; border:2px solid #171717; border-radius:999px; padding:5px 16px; font-size:12px; font-weight:700; text-decoration:none; box-shadow:2px 2px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-cta-pill:hover { transform:translate(1px,1px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-content { max-width:800px; margin:0 auto; padding:0 24px 80px; }
  .rpt-finding { margin-top:64px; }
  .rpt-finding-header { margin-bottom:28px; }
  .rpt-finding-num { display:inline-block; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#8b5cf6; margin-bottom:8px; }
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
  .rpt-v { color:#8b5cf6; } .rpt-g { color:#10b981; } .rpt-o { color:#f59e0b; }
  .rpt-lbl { font-size:12px; color:#525252; line-height:1.45; font-weight:500; }
  .rpt-delta { display:inline-block; font-size:11px; font-weight:700; margin-top:6px; padding:2px 8px; border-radius:999px; }
  .rpt-du { background:#d0fae4; color:#065f46; } .rpt-dn { background:#f5f5f5; color:#737373; border:1px solid #e5e5e5; }
  .rpt-callout { border:2px solid #171717; border-radius:16px; padding:20px 22px; margin-top:20px; }
  .rpt-cp { background:#faf5fe; border-color:#8b5cf6; } .rpt-cg { background:#d0fae4; border-color:#10b981; } .rpt-co { background:#fef3c6; border-color:#f59e0b; } .rpt-cd { background:#171717; border-color:#171717; color:#fff; }
  .rpt-cl { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }
  .rpt-cp .rpt-cl { color:#8b5cf6; } .rpt-cg .rpt-cl { color:#065f46; } .rpt-co .rpt-cl { color:#92400e; } .rpt-cd .rpt-cl { color:#dab2ff; }
  .rpt-callout p { font-size:14px; line-height:1.7; }
  .rpt-pullquote { border-left:4px solid #8b5cf6; padding:16px 20px; margin:24px 0; background:#faf5fe; border-radius:0 12px 12px 0; }
  .rpt-pullquote p { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:600; line-height:1.45; color:#171717; }
  .rpt-bar-list { display:flex; flex-direction:column; gap:10px; }
  .rpt-bar-row { display:grid; grid-template-columns:190px 1fr 80px; align-items:center; gap:12px; }
  .rpt-bar-row.rpt-narrow { grid-template-columns:140px 1fr 70px; }
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
  .rpt-mini-total-val { font-family:'Clash Display',sans-serif; font-size:22px; font-weight:700; }
  .rpt-mini-total-sub { font-size:12px; color:#737373; margin-top:2px; }
  .rpt-donut-layout { display:grid; grid-template-columns:200px 1fr; gap:32px; align-items:center; }
  .rpt-legend-list { display:flex; flex-direction:column; gap:10px; }
  .rpt-legend-item { display:flex; align-items:center; gap:12px; }
  .rpt-legend-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; border:2px solid; }
  .rpt-legend-text { font-size:13px; color:#171717; flex:1; font-weight:500; }
  .rpt-legend-pct { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; color:#171717; }
  .rpt-pill-row { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
  .rpt-pill { border:2px solid #171717; border-radius:999px; padding:5px 14px; font-size:12px; font-weight:700; }
  .rpt-pv { background:#faf5fe; color:#8b5cf6; border-color:#8b5cf6; } .rpt-pg { background:#d0fae4; color:#065f46; border-color:#10b981; } .rpt-po { background:#fef3c6; color:#92400e; border-color:#f59e0b; } .rpt-pr { background:#fee2e2; color:#991b1b; border-color:#ef4444; }
  .rpt-inline-cta { background:#faf5fe; border:2px solid #171717; border-radius:20px; padding:24px 28px; margin:32px 0; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); }
  .rpt-inline-cta-inner { display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; }
  .rpt-inline-cta-title { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; color:#171717; margin-bottom:4px; }
  .rpt-inline-cta-sub { font-size:13px; color:#525252; }
  .rpt-btn-primary { display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 24px; background:#8b5cf6; color:#fff; border:2px solid #171717; border-radius:14px; font-size:13px; font-weight:700; text-decoration:none; white-space:nowrap; box-shadow:3px 3px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-btn-primary:hover { transform:translate(2px,2px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-btn-secondary { display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 24px; background:#fff; color:#171717; border:2px solid #171717; border-radius:14px; font-size:13px; font-weight:700; text-decoration:none; white-space:nowrap; box-shadow:3px 3px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-btn-secondary:hover { transform:translate(2px,2px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-final-cta { margin-top:64px; background:#8b5cf6; border:2px solid #171717; border-radius:24px; padding:48px 40px; text-align:center; box-shadow:6px 6px 0px 0px rgba(25,26,35,1); }
  .rpt-final-cta-title { font-family:'Clash Display',sans-serif; font-size:clamp(24px,4vw,36px); font-weight:700; color:#fff; margin-bottom:12px; }
  .rpt-final-cta-sub { font-size:15px; color:rgba(255,255,255,0.8); max-width:560px; margin:0 auto 28px; line-height:1.65; }
  .rpt-final-cta-btns { display:flex; flex-wrap:wrap; gap:12px; justify-content:center; }
  .rpt-btn-white { display:inline-flex; align-items:center; justify-content:center; height:48px; padding:0 28px; background:#fff; color:#171717; border:2px solid #171717; border-radius:16px; font-size:14px; font-weight:700; text-decoration:none; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-btn-white:hover { transform:translate(2px,2px); box-shadow:2px 2px 0px 0px rgba(25,26,35,1); }
  .rpt-btn-outline { display:inline-flex; align-items:center; justify-content:center; height:48px; padding:0 28px; background:rgba(255,255,255,0.12); color:#fff; border:2px solid rgba(255,255,255,0.4); border-radius:16px; font-size:14px; font-weight:700; text-decoration:none; transition:background 0.15s; }
  .rpt-btn-outline:hover { background:rgba(255,255,255,0.2); }
  @media(max-width:640px){
    .rpt-c4{grid-template-columns:1fr 1fr!important;} .rpt-c3{grid-template-columns:1fr 1fr!important;}
    .rpt-bar-row{grid-template-columns:110px 1fr 50px;} .rpt-bar-row.rpt-narrow{grid-template-columns:100px 1fr 55px;}
    .rpt-donut-layout{grid-template-columns:1fr;} .rpt-two-col{grid-template-columns:1fr;}
    .rpt-inline-cta-inner{flex-direction:column;align-items:flex-start;}
    .rpt-hero-stats{gap:20px;} .rpt-final-cta{padding:32px 20px;}
  }
`;
