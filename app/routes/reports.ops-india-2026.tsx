import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Operations Internship India 2026: Skill Gaps, Stipends and Hiring Data | Studojo" },
    { name: "description", content: "12,400+ ops intern openings in India. Only 19% of applicants are work-ready. Excel, Notion and SOP gaps costing students offers across D2C, SaaS and logistics companies in 2026." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "operations internship india 2026, ops intern stipend india, supply chain internship india, business operations intern india, d2c operations internship" },
    { tagName: "link", rel: "canonical", href: "https://studojo.com/reports/ops-india-2026" },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Operations Internship India 2026: Skill Gaps, Stipends and Hiring Data" },
    { property: "og:description", content: "12,400+ ops intern openings in India. Only 19% of applicants are work-ready. Excel, Notion and SOP gaps costing students offers across D2C, SaaS and logistics companies in 2026." },
    { property: "og:url", content: "https://studojo.com/reports/ops-india-2026" },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: "https://studojo.com/og-reports.png" },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-04-01T00:00:00+05:30" },
    { property: "article:modified_time", content: "2026-04-20T00:00:00+05:30" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Operations Internship India 2026: Skill Gaps and Stipend Data | Studojo" },
    { name: "twitter:description", content: "12,400+ ops intern openings. Only 19% work-ready. Skill gaps, stipend data and hiring trends for ops interns across India." },
    { name: "twitter:image", content: "https://studojo.com/og-reports.png" },
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

  const ORANGE  = "#3b82f6";
  const ORANGE2 = "#60a5fa";
  const ORANGE3 = "#93c5fd";
  const GREEN   = "#10b981";
  const GREEN2  = "#34d399";
  const VIOLET  = "#8b5cf6";
  const RED     = "#ef4444";
  const GREY    = "#e5e5e5";
  const MUTED   = "#737373";
  const INK     = "#171717";
  const grid    = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: Stipend by skill stack
  const stipendEl = document.getElementById("stipendChart") as HTMLCanvasElement | null;
  if (stipendEl && !stipendEl.dataset.rendered) {
    stipendEl.dataset.rendered = "1";
    new Chart(stipendEl, {
      type: "bar",
      data: {
        labels: ["Excel only", "Excel + SQL", "Excel + SQL +\nNotion/Airtable", "Full stack\n(+ AI fluency)", "Series B+\nstartup (any stack)"],
        datasets: [{
          label: "Median monthly stipend (₹)",
          data: [9000, 17000, 24000, 31000, 35000],
          backgroundColor: [GREY, ORANGE3, ORANGE2, ORANGE, GREEN],
          borderRadius: 6,
          borderWidth: 2,
          borderColor: INK,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` Median: ₹${ctx.raw.toLocaleString()}/mo` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: INK } },
          y: { grid, border: { dash: [4, 4] }, min: 0, ticks: { font: { size: 11 }, callback: (v: any) => "₹" + (v / 1000) + "k", color: MUTED } },
        },
      },
    });
  }

  // Chart 2: Readiness doughnut
  const readEl = document.getElementById("readinessChart") as HTMLCanvasElement | null;
  if (readEl && !readEl.dataset.rendered) {
    readEl.dataset.rendered = "1";
    new Chart(readEl, {
      type: "doughnut",
      data: {
        labels: ["Work ready on day 1 (19%)", "Good instincts, weak tools (34%)", "Hard worker, no data skills (28%)", "Significant gaps across the board (19%)"],
        datasets: [{
          data: [19, 34, 28, 19],
          backgroundColor: [ORANGE, ORANGE2, ORANGE3, GREY],
          borderColor: "#fff",
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      options: { responsive: false, cutout: "65%", plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } } } },
    });
  }

  // Chart 3: Tool adoption growth 2023 vs 2026
  const toolEl = document.getElementById("toolGrowthChart") as HTMLCanvasElement | null;
  if (toolEl && !toolEl.dataset.rendered) {
    toolEl.dataset.rendered = "1";
    new Chart(toolEl, {
      type: "bar",
      data: {
        labels: ["Notion / ClickUp", "Airtable", "Zapier / Make", "SQL", "Python (basic)", "AI writing tools"],
        datasets: [
          { label: "% of ops JDs mentioning (2023)", data: [11, 8, 9, 28, 12, 4], backgroundColor: ORANGE3, borderRadius: 4, borderWidth: 0 },
          { label: "% of ops JDs mentioning (2026)", data: [44, 31, 38, 54, 29, 41], backgroundColor: ORANGE, borderRadius: 4, borderWidth: 0 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}%` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => v + "%", color: MUTED } },
        },
      },
    });
  }

  // Chart 4: Work mode split
  const workEl = document.getElementById("workModeChart") as HTMLCanvasElement | null;
  if (workEl && !workEl.dataset.rendered) {
    workEl.dataset.rendered = "1";
    new Chart(workEl, {
      type: "doughnut",
      data: {
        labels: ["Hybrid (41%)", "On-site (36%)", "Remote (23%)"],
        datasets: [{
          data: [41, 36, 23],
          backgroundColor: [ORANGE, ORANGE3, GREY],
          borderColor: "#fff",
          borderWidth: 3,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: { legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 12 } }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } } },
      },
    });
  }
}

export default function OpsIndiaReport() {
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "Article", "headline": "Operations Internship India 2026: Skill Gaps, Stipends and Hiring Data", "description": "12,400+ ops intern openings in India. Only 19% of applicants are work-ready. Excel, Notion and SOP gaps costing students offers across D2C, SaaS and logistics companies in 2026.", "url": "https://studojo.com/reports/ops-india-2026", "datePublished": "2026-04-01T00:00:00+05:30", "dateModified": "2026-04-20T00:00:00+05:30", "author": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com"}, "publisher": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com", "logo": {"@type": "ImageObject", "url": "https://studojo.com/logo.png"}}, "mainEntityOfPage": {"@type": "WebPage", "@id": "https://studojo.com/reports/ops-india-2026"}, "image": "https://studojo.com/og-reports.png"}` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://studojo.com"}, {"@type": "ListItem", "position": 2, "name": "Reports", "item": "https://studojo.com/reports"}, {"@type": "ListItem", "position": 3, "name": "Operations Internship India 2026", "item": "https://studojo.com/reports/ops-india-2026"}]}` }} />

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
              <span>Operations India 2026</span>
            </nav>
            <h1 className="rpt-h1">Operations Interns in India:<br /><em>The Skill Gap Nobody Talks About</em></h1>
            <p className="rpt-hero-sub">
              12,400+ openings. Only 1 in 5 applicants work ready. The data skills crisis, the SOP gap, and why Notion fluency is now the deciding factor in ops intern hiring across India.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval">12,400+</div><div className="rpt-hlbl">Ops intern openings right now</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">+38%</div><div className="rpt-hlbl">Growth vs. 2024</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">8 findings</div><div className="rpt-hlbl">JD analysis + hiring manager data</div></div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="rpt-cta-strip">
          <div className="rpt-cta-strip-inner">
            <span className="rpt-cta-strip-text">Looking for operations internships in India?</span>
            <Link to="/outreach" className="rpt-cta-pill">Browse ops roles on Studojo →</Link>
          </div>
        </div>

        <div className="rpt-content">

          {/* Finding 1 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 01</span>
              <h2 className="rpt-h2">The ops intern market is growing fast. It is almost entirely startup driven.</h2>
              <p className="rpt-lead">There are 12,400+ operations intern and trainee openings across India right now. BFSI, manufacturing, and MNCs are growing slowly. D2C brands, B2B SaaS, logistics tech, and health tech are where the actual hiring is happening. Those employers move fast.</p>
            </div>

            <div className="rpt-stat-row rpt-c4">
              <div className="rpt-stat"><div className="rpt-val rpt-o">12,400+</div><div className="rpt-lbl">Ops intern openings nationwide</div><span className="rpt-delta rpt-du">+38% vs 2024</span></div>
              <div className="rpt-stat"><div className="rpt-val">73%</div><div className="rpt-lbl">Of openings at startups and SMEs</div><span className="rpt-delta rpt-dn">vs. 27% at large cos</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">₹20k+</div><div className="rpt-lbl">Median stipend at Series A–B startups</div><span className="rpt-delta rpt-du">Up from ₹14k in 2023</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">4</div><div className="rpt-lbl">Cities hold 88% of all openings</div><span className="rpt-delta rpt-dn">BLR, MUM, DEL, PUN</span></div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Open ops intern roles by city</div>
              <div className="rpt-bar-list">
                {[
                  { city: "Bengaluru", sub: "SaaS, D2C, health tech, logistics", pct: 92, count: "3,970 roles", share: "32% of total", bg: "#f97316" },
                  { city: "Mumbai", sub: "Fintech ops, D2C, media, supply chain", pct: 72, count: "2,980 roles", share: "24%", bg: "#f97316" },
                  { city: "Delhi NCR", sub: "E-commerce, ed-tech, consulting ops", pct: 64, count: "2,730 roles", share: "22%", bg: "#fb923c" },
                  { city: "Pune", sub: "MNC ops, manufacturing, auto tech", pct: 38, count: "1,740 roles", share: "14%", bg: "#fed7aa" },
                  { city: "Hyderabad", sub: "GCCs, pharma ops, tech startups", pct: 20, count: "620 roles", share: "5%", bg: "#ffedd5" },
                  { city: "Chennai", sub: "Manufacturing, logistics, BFSI ops", pct: 12, count: "360 roles", share: "3%", bg: "#fff7ed" },
                ].map((r) => (
                  <div key={r.city} className="rpt-bar-row">
                    <div className="rpt-bar-label">{r.city}<small>{r.sub}</small></div>
                    <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}>{r.count}</div></div>
                    <div className="rpt-bar-value">{r.count}<small>{r.share}</small></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">Why startups dominate ops hiring</div>
              <p>Large companies hire ops managers, not ops interns. They have established teams. Startups and high growth SMEs are the ones hiring interns to do real operational work: running inventory systems, building SOPs from scratch, managing vendor workflows. The roles are genuinely substantive, which is why stipends at funded startups are pulling away from the market.</p>
            </div>
            <p className="rpt-source">Source: LinkedIn Jobs, Internshala, Unstop, Naukri, company career pages, April 2026</p>
          </div>

          {/* CTA mid-report */}
          <div className="rpt-inline-cta">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Find ops internships in Bengaluru, Mumbai, and Delhi NCR</div>
                <div className="rpt-inline-cta-sub">The Internship Dojo surfaces niche ops roles at D2C brands, SaaS startups, and logistics companies before job boards catch up.</div>
              </div>
              <Link to="/outreach" className="rpt-btn-primary">Browse Internships</Link>
            </div>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 02</span>
              <h2 className="rpt-h2">Only 19% of ops intern applicants are actually work ready. Here is where the rest fall short.</h2>
              <p className="rpt-lead">Hiring managers across ops heavy companies (D2C brands, SaaS companies, logistics firms, and health tech startups) assessed intern applicants against a consistent rubric. The result: most applicants have the energy but not the toolkit to operate independently on day one.</p>
            </div>

            <blockquote className="rpt-pullquote">
              <p>"We ask one question in every ops intern interview: 'Can you build us a tracker for X?' Most freeze. The ones who don't: we hire immediately."</p>
            </blockquote>

            <div className="rpt-card">
              <div className="rpt-card-label">Ops intern applicant readiness profile (hiring manager assessments, India 2026)</div>
              <div className="rpt-donut-layout">
                <canvas id="readinessChart" style={{ width: 200, height: 200, flexShrink: 0 }}></canvas>
                <div className="rpt-legend-list">
                  {[
                    { color: "#f97316", label: "Work ready on day 1: can build, document, and own a process", pct: "19%" },
                    { color: "#fb923c", label: "Good instincts, weak tool skills: needs hand-holding on Excel and trackers", pct: "34%" },
                    { color: "#fed7aa", label: "Hard worker, no data skills: motivated but can't handle numbers independently", pct: "28%" },
                    { color: "#e5e5e5", label: "Significant gaps across the board: strong academic profile, low operational readiness", pct: "19%" },
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
              <div className="rpt-card-label">Top reasons ops intern candidates get rejected after being shortlisted</div>
              <div className="rpt-bar-list">
                {[
                  { reason: "Cannot build a functional spreadsheet independently", sub: "Most common Day 1 failure in ops interviews", pct: 71, bg: "#ef4444" },
                  { reason: "No experience with any process documentation", sub: "SOPs, workflows, runbooks: blank faces", pct: 58, bg: "#f87171" },
                  { reason: "Unfamiliar with PM or ops tools", sub: "Never used Notion, Airtable, ClickUp, or Asana", pct: 52, bg: "#fca5a5" },
                  { reason: "Cannot explain their internship work clearly", sub: "What did you build? What changed because of you?", pct: 44, bg: "#fca5a5" },
                  { reason: "No systems thinking: jumps to execution", sub: "Talks about tasks, not about how they designed the process", pct: 39, bg: "#fecaca" },
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
              <div className="rpt-cl">What work ready actually means in ops</div>
              <p>It is not about knowing everything. It is about being able to sit down, figure out what is broken, and build something to fix it, even imperfectly. A tracker in Google Sheets. An SOP in Notion. A Zapier automation. The 19% who are work ready are not smarter. They have just built things before.</p>
            </div>
            <p className="rpt-source">Source: Hiring manager interviews, placement cell data from India Skills Report 2026, April 2026</p>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 03</span>
              <h2 className="rpt-h2">Excel is non negotiable. SQL is the gap that is costing candidates the shortlist.</h2>
              <p className="rpt-lead">We analysed operations internship and trainee job descriptions across India. Excel appears in the majority of them, more than any other function including finance. But the requirement has evolved. Pivot tables and SUMIFS are now the floor, not the ceiling.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Skill frequency across ops intern JDs in India (JD analysis)</div>
              <div className="rpt-bar-list">
                {[
                  { skill: "Excel / Google Sheets", sub: "Advanced: PivotTable, SUMIFS, VLOOKUP, array formulas", pct: 84, bg: "#f97316" },
                  { skill: "Data analysis and reporting", sub: "Extract insights, build dashboards, present to stakeholders", pct: 72, bg: "#f97316" },
                  { skill: "Communication (written + verbal)", sub: "Top soft skill, especially for vendor and cross team ops", pct: 68, bg: "#fb923c" },
                  { skill: "SQL / basic querying", sub: "Pull data without asking engineers. Growing fast in JDs", pct: 54, bg: "#10b981" },
                  { skill: "Process documentation / SOP writing", sub: "Almost universal in D2C, SaaS, and logistics ops roles", pct: 63, bg: "#f97316" },
                  { skill: "PM / ops tools (Notion, Airtable, ClickUp)", sub: "Now standard in startup ops. Not optional.", pct: 44, bg: "#10b981" },
                  { skill: "Zapier / Make / automation tools", sub: "Asked directly in interview tasks at 1 in 4 companies", pct: 38, bg: "#10b981" },
                  { skill: "AI tools (writing, summarising, tracking)", sub: "Fastest-growing requirement in 2026 ops JDs", pct: 41, bg: "#8b5cf6" },
                ].map((r) => (
                  <div key={r.skill} className="rpt-bar-row">
                    <div className="rpt-bar-label">{r.skill}<small>{r.sub}</small></div>
                    <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}>{r.pct}%</div></div>
                    <div className="rpt-bar-value">{r.pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            <p className="rpt-prose">The orange bars are table stakes, expected of every candidate. The green bars are where the shortlist gap sits. <strong>Candidates who list SQL on their resume report significantly higher response rates on ops intern applications.</strong> Most management and BBA programs still do not teach SQL.</p>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The Excel trap</div>
              <p>Most students say they know Excel. Most hiring managers disagree. The gap is specific: hiring managers mean SUMIFS over multiple criteria, nested IFs, PivotTables built from scratch, and formulas that do not break when data is added. When ops intern interviews include a 15-minute Excel task, over 60% of candidates cannot complete it correctly under time pressure.</p>
            </div>
            <p className="rpt-source">Source: JD analysis, LinkedIn, Internshala, Naukri, Unstop, recruiter interviews, April 2026</p>
          </div>

          {/* CTA mid-report 2 */}
          <div className="rpt-inline-cta" style={{ background: "#171717" }}>
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title" style={{ color: "#fff" }}>Build the resume that gets you into an ops role</div>
                <div className="rpt-inline-cta-sub" style={{ color: "#a3a3a3" }}>ATS-optimised, free, takes 5 minutes. Used by 5,000+ students.</div>
              </div>
              <Link to="/dojos/careers" className="rpt-btn-primary">Build Resume Free</Link>
            </div>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 04</span>
              <h2 className="rpt-h2">SOP writing is asked for in 63% of ops JDs. It is taught in almost none.</h2>
              <p className="rpt-lead">Process documentation (standard operating procedures, workflow mapping, runbooks) is the single most consistent requirement in operations roles at startups and SMEs. It is also the skill that virtually zero business administration or management programs teach before the final year, if at all.</p>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-o">63%</div><div className="rpt-lbl">Of ops JDs explicitly mention SOP writing or process documentation</div></div>
              <div className="rpt-stat"><div className="rpt-val">3x</div><div className="rpt-lbl">More likely to receive a PPO if you document a process during your internship</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">Near zero</div><div className="rpt-lbl">Business programs that include SOP writing as a standalone module</div></div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Which employer types ask for SOP / process documentation skills</div>
              <div className="rpt-bar-list">
                {[
                  { type: "D2C brands and e-commerce", sub: "Inventory, returns, fulfilment SOPs are Day 1 work", pct: 88, bg: "#f97316" },
                  { type: "B2B SaaS companies", sub: "Customer onboarding, support, and internal ops runbooks", pct: 79, bg: "#f97316" },
                  { type: "Logistics and supply chain", sub: "Every process is documented, or it fails at scale", pct: 84, bg: "#f97316" },
                  { type: "Health tech / clinical ops", sub: "Regulatory requirements drive documentation culture", pct: 76, bg: "#fb923c" },
                  { type: "Fintech / payments ops", sub: "Compliance + ops workflows both require SOPs", pct: 61, bg: "#fb923c" },
                  { type: "Traditional manufacturing / MNCs", sub: "Process documentation exists but not typically intern work", pct: 34, bg: "#fed7aa" },
                ].map((r) => (
                  <div key={r.type} className="rpt-bar-row">
                    <div className="rpt-bar-label">{r.type}<small>{r.sub}</small></div>
                    <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}></div></div>
                    <div className="rpt-bar-value">{r.pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">How to close this gap before your interview</div>
              <p>Pick any process you use regularly: ordering food, managing a study group schedule, running a college event. Document it as a proper SOP: objective, scope, step-by-step procedure, owner, exceptions. One well-written SOP in your portfolio does more work in an ops interview than three bullet points on your resume about "coordinating" things.</p>
            </div>
            <p className="rpt-source">Source: JD analysis, recruiter interviews, placement cell data from 8 colleges, April 2026</p>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 05</span>
              <h2 className="rpt-h2">No-code tool requirements in ops JDs grew 4x since 2023. Most students have never opened one.</h2>
              <p className="rpt-lead">Notion, Airtable, Zapier, and Make went from niche startup asks to standard requirements in ops hiring over the last three years. The shift happened because ops teams at funded startups have replaced spreadsheet chaos with these tools. They need interns who can operate in that environment from day one.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Tool mentions in ops intern JDs: 2023 vs 2026</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="toolGrowthChart"></canvas></div>
            </div>

            <p className="rpt-prose">The shift is not subtle. Zapier went from appearing in 9% of ops JDs in 2023 to 38% in 2026. Notion went from 11% to 44%. SQL, already established, continued growing. The tools that are new to JDs are the same tools that were barely mentioned in any business or management curriculum three years ago. <strong>The market moved; the colleges did not.</strong></p>

            <div className="rpt-stat-row rpt-c2">
              <div className="rpt-stat"><div className="rpt-val rpt-o">2.4x</div><div className="rpt-lbl">Higher application response rate for candidates who list Notion or Airtable on their resume</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">1 in 4</div><div className="rpt-lbl">Ops intern interview processes now include a live automation task (Zapier or Make)</div></div>
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The no code advantage is still open</div>
              <p>Most students have not caught on yet. That is the window. Building a working Zapier automation or an Airtable database takes 2 to 3 hours to learn from scratch. Putting it on your resume, and being able to talk about what it automated and what it saved, puts you ahead of the majority of ops intern applicants right now. This advantage will close as curricula catch up. It is open today.</p>
            </div>
            <p className="rpt-source">Source: JD analysis, 2023 baseline from archived Internshala and LinkedIn data, April 2026</p>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 06</span>
              <h2 className="rpt-h2">AI in ops is not what students think it is. The gap is in application, not awareness.</h2>
              <p className="rpt-lead">41% of ops intern JDs now mention AI tools, the fastest-growing requirement in 2026. But hiring managers are not asking for prompt engineers or model builders. They want interns who can use AI to move faster in the day to day: drafting communications, summarising data, prepping reports, and building documentation.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">What students think AI in ops means</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[
                      ["Building AI models / ML tools", 44, "#e5e5e5"],
                      ["Prompt engineering", 31, "#e5e5e5"],
                      ["Chatbot development", 18, "#e5e5e5"],
                      ["Advanced data science", 7, "#e5e5e5"],
                    ].map(([label, pct, bg]) => (
                      <div key={label as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{label}</div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                        <div className="rpt-bar-value">{pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">What ops teams actually need</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[
                      ["Draft SOPs and comms faster", 82, "#f97316"],
                      ["Summarise data for reports", 74, "#f97316"],
                      ["Build and improve tracking tools", 61, "#fb923c"],
                      ["Prep meeting notes and agendas", 55, "#fb923c"],
                    ].map(([label, pct, bg]) => (
                      <div key={label as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{label}</div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                        <div className="rpt-bar-value">{pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">How to demonstrate AI fluency in an ops interview</div>
              <p>Do not list "ChatGPT" on your resume. Instead, describe what you built with it. "Used AI to draft a vendor onboarding SOP, reducing setup time by 40%." "Built a weekly ops report template using AI that my team now uses." Specific, outcome oriented, ops context. That is what hiring managers are looking for. Awareness without application reads as noise.</p>
            </div>
            <p className="rpt-source">Source: Student and hiring manager interviews, India Skills Report 2026 employability data, April 2026</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 07</span>
              <h2 className="rpt-h2">The stipend gap between a generic ops intern and a skilled one is now ₹20,000 a month.</h2>
              <p className="rpt-lead">Ops intern stipends have moved significantly in the last two years, but not uniformly. The ceiling for data literate, tool proficient interns at funded startups has risen fast. The floor for generic, Excel-only applicants has barely moved. The stack you bring to the table determines which number you get.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Median monthly stipend by skill stack: ops interns in India (2026)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="stipendChart"></canvas></div>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val">₹9k</div><div className="rpt-lbl">Median stipend for Excel-only ops interns (most common profile)</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">₹24k</div><div className="rpt-lbl">Median stipend for Excel + SQL + no code tools (top 15% of applicants)</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">₹35k</div><div className="rpt-lbl">Median stipend at Series B+ startups for strong full stack ops profiles</div></div>
            </div>

            <p className="rpt-prose" style={{ marginTop: 24 }}>
              The jump from the first bar to the third bar is not about experience. It is about skill stack. A student who can demonstrate Excel proficiency, write a basic SQL query, build a workflow in Notion, and run a simple Zapier automation is applying for a fundamentally different role than one who cannot. <strong>The market has already priced this in. The skill investment required is measured in hours, not months.</strong>
            </p>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">The highest-ROI skill to learn before your next ops application</div>
              <p>If you only have time for one thing: SQL. A basic SQL course takes 10 to 15 hours. It unlocks the ability to pull your own data without going through the engineering team, which is worth real money in ops. Every ops manager at a startup uses it. Most ops interns cannot. That gap is your entry point.</p>
            </div>

            <div className="rpt-inline-cta" style={{ marginTop: 24 }}>
              <div className="rpt-inline-cta-inner">
                <div>
                  <div className="rpt-inline-cta-title">Find ops internships paying ₹20k and above</div>
                  <div className="rpt-inline-cta-sub">Curated weekly from D2C brands, SaaS startups, and logistics companies across India.</div>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link to="/outreach" className="rpt-btn-primary">Browse Internships</Link>
                  <Link to="https://chat.whatsapp.com/CUV8DSjQWqB82yXKRE66ol" target="_blank" rel="noopener noreferrer" className="rpt-btn-secondary">Join Community</Link>
                </div>
              </div>
            </div>
            <p className="rpt-source">Source: Internshala stipend data, LinkedIn salary data, Glassdoor India, hiring manager salary disclosures, April 2026</p>
          </div>

          {/* Finding 8 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 08</span>
              <h2 className="rpt-h2">Where the good roles actually are: sector breakdown and the work-mode picture.</h2>
              <p className="rpt-lead">Operations intern openings are more evenly spread across sectors than finance or tech. D2C and B2B SaaS lead on volume and stipend. Logistics and health tech lead on role substance. Understanding where to focus your search changes the quality of what you apply to.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Ops intern openings by sector: India 2026</div>
              <div className="rpt-bar-list">
                {[
                  { sector: "D2C brands and e-commerce", sub: "Inventory, returns, fulfilment, vendor ops", pct: 90, share: "28%", bg: "#f97316" },
                  { sector: "B2B SaaS", sub: "Customer success ops, internal tools, revenue ops", pct: 72, share: "22%", bg: "#f97316" },
                  { sector: "Logistics and supply chain", sub: "Last-mile, warehousing, fleet ops", pct: 56, share: "18%", bg: "#fb923c" },
                  { sector: "Health tech and clinical ops", sub: "Patient ops, lab logistics, insurance ops", pct: 44, share: "14%", bg: "#fb923c" },
                  { sector: "Fintech / payments", sub: "Compliance ops, onboarding, settlements", pct: 30, share: "10%", bg: "#fed7aa" },
                  { sector: "Other (ed-tech, media, prop-tech)", sub: "Mixed, varies heavily by company stage", pct: 22, share: "8%", bg: "#ffedd5" },
                ].map((r) => (
                  <div key={r.sector} className="rpt-bar-row">
                    <div className="rpt-bar-label">{r.sector}<small>{r.sub}</small></div>
                    <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}>{r.share}</div></div>
                    <div className="rpt-bar-value">{r.share}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-two-col" style={{ marginTop: 20 }}>
              <div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-card-label">Work mode split: ops intern roles</div>
                  <div className="rpt-chart-wrap" style={{ height: 200 }}><canvas id="workModeChart"></canvas></div>
                </div>
              </div>
              <div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-card-label">Where remote ops roles actually are</div>
                  <div className="rpt-bar-list" style={{ marginTop: 8 }}>
                    {[
                      ["Content and comms ops", "Research and writing heavy", 82, "#10b981"],
                      ["Data entry and quality ops", "Lower stipend (₹6k–10k)", 74, "#34d399"],
                      ["Customer support ops", "Often WFH for smaller cos", 61, "#6ee7b7"],
                      ["Procurement research", "Vendor sourcing, analysis", 44, "#a7f3d0"],
                    ].map(([label, sub, pct, bg]) => (
                      <div key={label as string} className="rpt-bar-row rpt-narrow" style={{ marginBottom: 8 }}>
                        <div className="rpt-bar-label">{label}<small>{sub}</small></div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                        <div className="rpt-bar-value">{pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="rpt-prose" style={{ marginTop: 20 }}>Ops is more hybrid-friendly than finance. 41% of roles offer some flexibility. But the best-paying, most substantive roles tend to be hybrid at minimum. Remote ops roles exist but cluster around lower-complexity, lower-stipend work. If you are optimising for learning and earnings, hybrid at a funded startup beats fully remote at a small company.</p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The sector that gives you the most transferable experience</div>
              <p>B2B SaaS ops gives you the broadest skill set. You will touch revenue operations, customer data, internal tooling, and cross-functional communication all at once. The process maturity is higher than D2C, the documentation culture is stronger, and the networks you build transfer well. If you can get a SaaS ops internship at Series A or B, that is the one to take.</p>
            </div>
            <p className="rpt-source">Source: LinkedIn Jobs, Internshala, Naukri, April 2026</p>
          </div>

          {/* Final CTA */}
          <div className="rpt-final-cta">
            <h2 className="rpt-final-cta-title">Work on things that matter.</h2>
            <p className="rpt-final-cta-sub">Use the Studojo Internship Dojo to find the ops roles this report is talking about: D2C, SaaS, logistics, and health tech internships across India, curated weekly.</p>
            <div className="rpt-final-cta-btns">
              <Link to="/outreach" className="rpt-btn-white">Browse Ops Internships</Link>
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

  .rpt-hero { background: #171717; color: #fff; padding: 56px 24px 48px; }
  .rpt-hero-inner { max-width: 800px; margin: 0 auto; }
  .rpt-badge {
    display: inline-flex; align-items: center;
    background: #3b82f6; border: 2px solid #60a5fa;
    border-radius: 999px; padding: 4px 14px;
    font-size: 11px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: #fff; margin-bottom: 12px;
  }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #737373; margin-bottom: 14px; }
  .rpt-breadcrumb-link { color: #93c5fd; text-decoration: none; }
  .rpt-breadcrumb-link:hover { text-decoration: underline; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-h1 { font-family: 'Clash Display', sans-serif; font-size: clamp(28px, 5vw, 48px); font-weight: 700; line-height: 1.1; color: #fff; margin-bottom: 16px; }
  .rpt-h1 em { font-style: italic; color: #bfdbfe; }
  .rpt-hero-sub { font-size: 16px; color: #a3a3a3; line-height: 1.7; max-width: 600px; margin-bottom: 28px; }
  .rpt-hero-stats { display: flex; gap: 40px; flex-wrap: wrap; padding-top: 24px; border-top: 1px solid #333; }
  .rpt-hval { font-family: 'Clash Display', sans-serif; font-size: 26px; font-weight: 700; color: #bfdbfe; }
  .rpt-hlbl { font-size: 12px; color: #737373; margin-top: 2px; }

  .rpt-cta-strip { background: #eff6ff; border-bottom: 2px solid #171717; padding: 12px 24px; }
  .rpt-cta-strip-inner { max-width: 800px; margin: 0 auto; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .rpt-cta-strip-text { font-size: 14px; font-weight: 500; color: #525252; }
  .rpt-cta-pill {
    display: inline-flex; align-items: center;
    background: #3b82f6; color: #fff; border: 2px solid #171717;
    border-radius: 999px; padding: 5px 16px; font-size: 12px; font-weight: 700;
    text-decoration: none; box-shadow: 2px 2px 0px 0px rgba(25,26,35,1);
    transition: transform 0.1s, box-shadow 0.1s;
  }
  .rpt-cta-pill:hover { transform: translate(1px,1px); box-shadow: 1px 1px 0px 0px rgba(25,26,35,1); }

  .rpt-content { max-width: 800px; margin: 0 auto; padding: 0 24px 80px; }
  .rpt-finding { margin-top: 64px; }
  .rpt-finding-header { margin-bottom: 28px; }
  .rpt-finding-num { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #3b82f6; margin-bottom: 8px; }
  .rpt-h2 { font-family: 'Clash Display', sans-serif; font-size: clamp(20px, 3vw, 28px); font-weight: 700; line-height: 1.2; color: #171717; margin-bottom: 10px; }
  .rpt-lead { font-size: 15px; color: #525252; line-height: 1.7; max-width: 640px; }
  .rpt-prose { font-size: 15px; line-height: 1.75; color: #525252; margin-bottom: 24px; }
  .rpt-prose strong { color: #171717; font-weight: 700; }
  .rpt-source { font-size: 11px; color: #a3a3a3; margin-top: 16px; }

  .rpt-card { background: #fff; border: 2px solid #171717; border-radius: 20px; padding: 28px; box-shadow: 4px 4px 0px 0px rgba(25,26,35,1); margin-bottom: 20px; }
  .rpt-card-label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #737373; margin-bottom: 16px; }
  .rpt-chart-wrap { position: relative; }
  .rpt-chart-wrap canvas { width: 100% !important; }

  .rpt-stat-row { display: grid; gap: 16px; margin-bottom: 20px; }
  .rpt-c2 { grid-template-columns: repeat(2,1fr); }
  .rpt-c3 { grid-template-columns: repeat(3,1fr); }
  .rpt-c4 { grid-template-columns: repeat(4,1fr); }
  .rpt-stat { background: #f5f5f5; border: 2px solid #171717; border-radius: 16px; padding: 18px 16px; }
  .rpt-val { font-family: 'Clash Display', sans-serif; font-size: 28px; font-weight: 700; line-height: 1; margin-bottom: 6px; }
  .rpt-v { color: #8b5cf6; }
  .rpt-g { color: #10b981; }
  .rpt-o { color: #f97316; }
  .rpt-lbl { font-size: 12px; color: #525252; line-height: 1.45; font-weight: 500; }
  .rpt-delta { display: inline-block; font-size: 11px; font-weight: 700; margin-top: 6px; padding: 2px 8px; border-radius: 999px; }
  .rpt-du { background: #d0fae4; color: #065f46; }
  .rpt-dn { background: #f5f5f5; color: #737373; border: 1px solid #e5e5e5; }

  .rpt-callout { border: 2px solid #171717; border-radius: 16px; padding: 20px 22px; margin-top: 20px; }
  .rpt-cp { background: #eff6ff; border-color: #3b82f6; }
  .rpt-cg { background: #d0fae4; border-color: #10b981; }
  .rpt-co { background: #fef3c6; border-color: #f59e0b; }
  .rpt-cd { background: #171717; border-color: #171717; color: #fff; }
  .rpt-cl { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
  .rpt-cp .rpt-cl { color: #1d4ed8; }
  .rpt-cg .rpt-cl { color: #065f46; }
  .rpt-co .rpt-cl { color: #92400e; }
  .rpt-cd .rpt-cl { color: #bfdbfe; }
  .rpt-callout p { font-size: 14px; line-height: 1.7; }
  .rpt-callout strong { font-weight: 700; }

  .rpt-pullquote { border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 24px 0; background: #eff6ff; border-radius: 0 12px 12px 0; }
  .rpt-pullquote p { font-family: 'Clash Display', sans-serif; font-size: 18px; font-weight: 600; line-height: 1.45; color: #171717; }

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

  .rpt-inline-cta { background: #eff6ff; border: 2px solid #171717; border-radius: 20px; padding: 24px 28px; margin: 32px 0; box-shadow: 4px 4px 0px 0px rgba(25,26,35,1); }
  .rpt-inline-cta-inner { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
  .rpt-inline-cta-title { font-family: 'Clash Display', sans-serif; font-size: 18px; font-weight: 700; color: #171717; margin-bottom: 4px; }
  .rpt-inline-cta-sub { font-size: 13px; color: #525252; }

  .rpt-btn-primary { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 24px; background: #3b82f6; color: #fff; border: 2px solid #171717; border-radius: 14px; font-size: 13px; font-weight: 700; text-decoration: none; white-space: nowrap; box-shadow: 3px 3px 0px 0px rgba(25,26,35,1); transition: transform 0.1s, box-shadow 0.1s; }
  .rpt-btn-primary:hover { transform: translate(2px,2px); box-shadow: 1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-btn-secondary { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 24px; background: #fff; color: #171717; border: 2px solid #171717; border-radius: 14px; font-size: 13px; font-weight: 700; text-decoration: none; white-space: nowrap; box-shadow: 3px 3px 0px 0px rgba(25,26,35,1); transition: transform 0.1s, box-shadow 0.1s; }
  .rpt-btn-secondary:hover { transform: translate(2px,2px); box-shadow: 1px 1px 0px 0px rgba(25,26,35,1); }

  .rpt-final-cta { margin-top: 64px; background: #f97316; border: 2px solid #171717; border-radius: 24px; padding: 48px 40px; text-align: center; box-shadow: 6px 6px 0px 0px rgba(25,26,35,1); }
  .rpt-final-cta-title { font-family: 'Clash Display', sans-serif; font-size: clamp(24px, 4vw, 36px); font-weight: 700; color: #fff; margin-bottom: 12px; }
  .rpt-final-cta-sub { font-size: 15px; color: rgba(255,255,255,0.85); max-width: 560px; margin: 0 auto 28px; line-height: 1.65; }
  .rpt-final-cta-btns { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
  .rpt-btn-white { display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 28px; background: #fff; color: #171717; border: 2px solid #171717; border-radius: 16px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 4px 4px 0px 0px rgba(25,26,35,1); transition: transform 0.1s, box-shadow 0.1s; }
  .rpt-btn-white:hover { transform: translate(2px,2px); box-shadow: 2px 2px 0px 0px rgba(25,26,35,1); }
  .rpt-btn-outline { display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 28px; background: rgba(255,255,255,0.12); color: #fff; border: 2px solid rgba(255,255,255,0.4); border-radius: 16px; font-size: 14px; font-weight: 700; text-decoration: none; transition: background 0.15s; }
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
