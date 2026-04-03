# Resource Creator — Studojo Market Report Skill

Use this skill to build a new Studojo market report from scratch. It covers research, writing, data, charts, code, and deployment.

---

## Step 1 — Research the market

Before writing any code, research the topic thoroughly. Use WebSearch to gather:

- Total active job openings (use sources: Naukri JobSpeak, Foundit.in Insights Tracker, LinkedIn hiring data, Unstop)
- YoY hiring growth % (compare same period last year)
- Salary ranges by sector/role (PayScale India, AmbitionBox, Glassdoor India, 6figr, Salarite)
- Top hiring companies and which types of freshers they target
- Skill gaps (what JDs require vs what freshers show up knowing)
- Employability data (Mercer-Mettl Graduate Skill Index, Wheebox, NASSCOM)
- City/geography distribution
- Role growth trends (which sub-roles are growing vs shrinking vs contracting)
- Variable pay structures by sector
- 5-year career trajectory comparisons between 2 distinct paths

Target: 8 findings, each backed by at least one named, dateable source.

---

## Step 2 — Plan the 8 findings

Structure findings in this order:
1. **Market size + geography** — total openings, city distribution, YoY growth
2. **Salary gap** — range by sector (not average), why the same job title pays very differently
3. **Role growth** — which sub-roles are growing vs shrinking (YoY %)
4. **Who's hiring** — two dominant pipelines (e.g. FMCG vs SaaS), what each tests
5. **Skill gap** — what JDs ask for vs what freshers arrive knowing; the one fixable gap
6. **Employability / readiness** — % job-ready, top interview failure reasons
7. **Variable pay** — base + variable at target across sectors; questions to ask before accepting
8. **Career trajectories** — two paths, side-by-side year 0 to year 5

Each finding needs: a stat row, at least one chart or bar list, prose, a callout, and a source line.

---

## Step 3 — Create the route file

File: `app/routes/reports.[topic]-[country]-[year].tsx`
Example: `app/routes/reports.sales-india-2026.tsx`

### File structure

```tsx
import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "[Topic] in [Country]: [Hook] | Studojo Report [Year]" },
    { name: "description", content: "[2-sentence hook with a key stat and the core tension]" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/[slug]` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "[Topic] in [Country]: [Hook]" },
    { property: "og:site_name", content: "Studojo" },
  ];
}

declare global { interface Window { Chart: any; } }

function initCharts() {
  const Chart = window.Chart;
  if (!Chart) return;

  Chart.defaults.font.family = "Satoshi, sans-serif";
  Chart.defaults.color = "#171717";

  // Palette
  const VIOLET = "#8b5cf6";
  const VIOLET2 = "#a78bfa";
  const VIOLET3 = "#c4b5fd";
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

  // Charts go here — see chart patterns below
}

export default function [Topic][Country]Report() {
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
        {/* Hero, findings, CTAs — see structure below */}
      </main>
      <Footer />
    </>
  );
}

const rptCSS = `[paste full CSS block from existing report]`;
```

### Chart patterns

**Horizontal bar (role growth, skills frequency):**
```ts
make("roleChart", {
  type: "bar",
  data: {
    labels: ["Label A", "Label B"],
    datasets: [{ label: "YoY growth (%)", data: [38, -25],
      backgroundColor: [GREEN, RED], borderRadius: 4, borderWidth: 0 }],
  },
  options: {
    responsive: true, maintainAspectRatio: false, indexAxis: "y",
    plugins: { legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw > 0 ? "+" : ""}${ctx.raw}%` } } },
    scales: {
      x: { grid, ticks: { callback: (v: any) => v + "%" } },
      y: { grid: { display: false } },
    },
  },
});
```

**Grouped bar (salary ranges):**
```ts
make("salaryChart", {
  type: "bar",
  data: {
    labels: ["Sector A", "Sector B"],
    datasets: [
      { label: "Base salary: low (LPA)", data: [4, 2.5], backgroundColor: VIOLET3, borderRadius: 4 },
      { label: "Base salary: high (LPA)", data: [8, 5], backgroundColor: VIOLET, borderRadius: 4 },
    ],
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
    scales: {
      x: { grid: { display: false } },
      y: { grid, ticks: { callback: (v: any) => v + " L" } },
    },
  },
});
```

**Line chart (trajectory):**
```ts
make("trajectoryChart", {
  type: "line",
  data: {
    labels: ["Year 0", "Year 1", "Year 2", "Year 3", "Year 5"],
    datasets: [
      { label: "Path A", data: [5, 7, 10, 15, 28],
        borderColor: VIOLET, backgroundColor: "rgba(139,92,246,0.1)",
        tension: 0.4, pointBackgroundColor: VIOLET, pointRadius: 5, fill: true },
      { label: "Path B", data: [4, 5, 7, 9, 14],
        borderColor: GREEN, backgroundColor: "rgba(16,185,129,0.08)",
        tension: 0.4, pointBackgroundColor: GREEN, pointRadius: 5, fill: true },
    ],
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
    scales: {
      x: { grid: { display: false } },
      y: { grid, ticks: { callback: (v: any) => v + " L" } },
    },
  },
});
```

**Doughnut (readiness):**
```ts
const el = document.getElementById("readinessChart") as HTMLCanvasElement | null;
if (el && !el.dataset.rendered) {
  el.dataset.rendered = "1";
  new Chart(el, {
    type: "doughnut",
    data: {
      labels: ["Job-ready (22%)", "Good instincts, no tools (35%)", "Weak on process (25%)", "Major gaps (18%)"],
      datasets: [{ data: [22, 35, 25, 18],
        backgroundColor: [VIOLET, VIOLET2, ORANGE, RED],
        borderColor: "#fff", borderWidth: 3, hoverOffset: 8 }],
    },
    options: { responsive: false, cutout: "65%",
      plugins: { legend: { display: false } } },
  });
}
```

### HTML structure — one finding

```tsx
<div className="rpt-finding">
  <div className="rpt-finding-header">
    <span className="rpt-finding-num">Finding 01</span>
    <h2 className="rpt-h2">Headline with no em dashes.</h2>
    <p className="rpt-lead">2-sentence setup. One key stat. What this finding reveals.</p>
  </div>

  {/* Stat row */}
  <div className="rpt-stat-row rpt-c3">
    <div className="rpt-stat">
      <div className="rpt-val rpt-v">28,600+</div>
      <div className="rpt-lbl">Active openings (Source, date)</div>
      <span className="rpt-delta rpt-du">+23% YoY</span>
    </div>
    {/* repeat */}
  </div>

  {/* Chart */}
  <div className="rpt-card">
    <div className="rpt-card-label">Chart title: what this shows</div>
    <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="myChart"></canvas></div>
  </div>

  {/* Prose */}
  <p className="rpt-prose">2-3 sentences interpreting the chart. <strong>Bold the key insight.</strong></p>

  {/* Callout */}
  <div className="rpt-callout rpt-cp"> {/* rpt-cp=violet, rpt-cg=green, rpt-co=amber, rpt-cd=dark */}
    <div className="rpt-cl">Callout header</div>
    <p>Actionable insight or important nuance.</p>
  </div>

  <p className="rpt-source">Source: Name, Date</p>
</div>
```

### Inline CTAs (place between findings 2-3 and 5-6)

```tsx
<div className="rpt-inline-cta">
  <div className="rpt-inline-cta-inner">
    <div>
      <div className="rpt-inline-cta-title">Build the resume that gets you the role</div>
      <div className="rpt-inline-cta-sub">ATS-optimised, free, takes 5 minutes.</div>
    </div>
    <Link to="/outreach" className="rpt-btn-primary">Find Roles</Link>
  </div>
</div>
```

### Two-column comparison block (Finding 4 and 8)

```tsx
<div className="rpt-two-col">
  <div>
    <div className="rpt-col-head">Pipeline A</div>
    <div className="rpt-card" style={{ padding: 20 }}>
      <div className="rpt-bar-list">
        {[["Company A", 90, "#8b5cf6", "Role type"], ...].map(([name, pct, bg, sub]) => (
          <div key={name as string} className="rpt-bar-row rpt-narrow">
            <div className="rpt-bar-label">{name}<small>{sub}</small></div>
            <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
          </div>
        ))}
      </div>
      <div className="rpt-mini-total" style={{ background: "#faf5fe", border: "1px solid #dab2ff" }}>
        <div className="rpt-mini-total-label" style={{ color: "#8b5cf6" }}>What they test</div>
        <div style={{ fontSize: 13, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>Skill 1, Skill 2, Skill 3</div>
      </div>
    </div>
  </div>
  {/* repeat for Pipeline B */}
</div>
```

### Year-by-year progression block (Finding 8)

```tsx
{[
  ["Year 1", "Role Title: X to Y LPA", "City / remote info"],
  ["Year 2", "Senior Role: X to Y LPA", "Location"],
  ["Year 3", "Role: X to Y LPA", "Location"],
  ["Year 5", "Senior Role: X to Y LPA", "Location"],
].map(([yr, role, loc]) => (
  <div key={yr as string} style={{ borderLeft: "3px solid #8b5cf6", paddingLeft: 12 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: 1 }}>{yr}</div>
    <div style={{ fontSize: 13, fontWeight: 600, color: "#171717" }}>{role}</div>
    <div style={{ fontSize: 11, color: "#737373" }}>{loc}</div>
  </div>
))}
```

---

## Step 4 — Register the route

In `app/routes.ts`, add inside the route list:

```ts
route("reports/[slug]", "routes/reports.[slug].tsx"),
```

Place it directly after the other reports lines.

---

## Step 5 — Add the card to the reports listing

In `app/routes/reports.tsx`, add to the `REPORTS` array (new reports go first):

```ts
{
  slug: "[slug]",
  title: "[Report title]",
  subtitle: "Q1 2026",
  excerpt: "[2-sentence hook. Key stat + tension]",
  category: "[Finance / Sales / PM / Marketing / etc]",
  date: "[Month Year]",
  findings: 8,
  color: "bg-emerald-500", // violet=finance, emerald=sales, blue=PM, amber=marketing
  badge: "New",
},
```

---

## Step 6 — Writing rules

- No em dashes anywhere. Use `:` `,` `.` or `(parentheses)` instead.
- All CTAs point to `/outreach` (not `/dojos/internships`).
- Numbers must be sourced. Never make up data. Every stat needs a named source.
- Salary data: use PayScale India, AmbitionBox, Glassdoor India, 6figr, Salarite.
- Hiring volume: use Naukri JobSpeak, Foundit.in, LinkedIn hiring data.
- Employability: use Mercer-Mettl Graduate Skill Index, Wheebox, NASSCOM.
- Prose is written in Studojo brand voice: direct, no jargon, warm but sharp.
- Callout types: rpt-cp (violet insight), rpt-cg (green positive), rpt-co (amber warning), rpt-cd (dark fix/action).

---

## Step 7 — Deploy

```bash
# Always staging first
git add app/routes/reports.[slug].tsx app/routes.ts app/routes/reports.tsx
git commit -m "feat: add [topic] [country] [year] report"
git push origin staging
# Wait for user to confirm staging looks good
# Then merge to main for production
```

---

## Full CSS block

Copy this into the `rptCSS` constant at the bottom of the route file. Do not modify it — it is the shared design system for all reports.

```css
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
```

---

## Existing reports (for reference)

| Slug | Topic | Color |
|---|---|---|
| `finance-india-2026` | Finance graduates in India | `bg-violet-500` |
| `sales-india-2026` | Fresher sales roles in India | `bg-emerald-500` |

Use different accent colours for new reports to visually distinguish them on the listing page.