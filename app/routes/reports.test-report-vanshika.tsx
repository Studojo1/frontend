import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Example Report: A Research Finding | Studojo" },
    { name: "description", content: "A 150-character meta description that summarises the report findings for search engines. Be specific." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "keyword one, keyword two, keyword three 2026" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/test-report-vanshika` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Example Report: A Research Finding" },
    { property: "og:description", content: "OG description shown when shared on social. Under 120 characters." },
    { property: "og:url", content: `${BASE_URL}/reports/test-report-vanshika` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-04T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Example Report: A Research Finding | Studojo" },
    { name: "twitter:description", content: "Twitter description. Punchy, under 100 characters." },
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

  const rankChartEl = document.getElementById("rankChart") as HTMLCanvasElement | null;
  if (rankChartEl && !rankChartEl.dataset.rendered) {
    rankChartEl.dataset.rendered = "1";
    new Chart(rankChartEl, {
      type: "bar",
      data: {
        labels: ["Demonstrated work", "Relevant experience", "Degree"],
        datasets: [{
          label: "Hirer ranking by factor (average out of 10)",
          data: [9.2, 8.7, 5.1],
          backgroundColor: ["#8B5CF6", "#8B5CF6", "#ef4444"],
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

  const splitChartEl = document.getElementById("splitChart") as HTMLCanvasElement | null;
  if (splitChartEl && !splitChartEl.dataset.rendered) {
    splitChartEl.dataset.rendered = "1";
    new Chart(splitChartEl, {
      type: "doughnut",
      data: {
        labels: ["Degree hard required (26%)", "Degree preferred (27%)", "Skills-first (47%)"],
        datasets: [{
          data: [26.0, 27.0, 47.0],
          backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
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
}

const reportCSS = `
  .rpt-hero { background: #171717; padding: 64px 0 52px; border-bottom: 3px solid #171717; position: relative; overflow: hidden; }
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #8B5CF6; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #8B5CF6; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #8B5CF6; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }
  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #8B5CF6; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
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
  .rpt-cta { background: #8B5CF6; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_TestReportVanshika() {
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
        "headline": "Example Report: A Research Finding",
        "description": "A 150-character meta description that summarises the report findings for search engines. Be specific.",
        "url": `${BASE_URL}/reports/test-report-vanshika`,
        "datePublished": "2026-05-04T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/test-report-vanshika` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Example Report: A Research Finding", "item": `${BASE_URL}/reports/test-report-vanshika` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · May 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Example Report: A Research Finding</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "Example Report:<br /><em>A Research Finding</em>" }} />
            <p className="rpt-hero-sub">One or two sentences summarising the report. What does it cover and why does it matter to the reader.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · All industries</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Behavioural / Insight</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">May 2026</span>
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
              <div className="sc-num">55%</div>
              <div className="sc-label">Short label describing what this stat represents</div>
              <div className="sc-source">Source name, year</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">3x</div>
              <div className="sc-label">Short label describing what this stat represents</div>
              <div className="sc-source">Source name, year</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">9.2</div>
              <div className="sc-label">Short label describing what this stat represents</div>
              <div className="sc-source">Studojo research, 2025</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>1</div>
              <div>
                <div className="sec-title">First Section Title</div>
                <div className="sec-sub">One-line subtitle explaining the focus of this section</div>
              </div>
            </div>
            <p>First paragraph. 3-5 sentences. Specific, evidenced, editorial. State the fact, then explain why it matters.</p>
            <p>Second paragraph. Continue the argument. Don't repeat — each paragraph should add a new piece of the story.</p>

            <div className="chart-wrap">
              <div className="chart-label">Hirer ranking by factor (average out of 10)</div>
              <div style={{ height: 280 }}>
                <canvas id="rankChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> One highlighted takeaway that deserves visual emphasis. Can include HTML bold.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Bold lead-in for first bullet</strong> The rest of the bullet text. One observation plus its implication. Do not write a bullet that is just a stat — explain what it means.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Bold lead-in for second bullet</strong> The rest of the bullet text. Keep each bullet to 2–3 sentences max.</span>
              </div>
            </div>

            <div className="callout"><strong>The practical implication:</strong> A dark callout with supporting context or a memorable framing of the finding.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>2</div>
              <div>
                <div className="sec-title">Second Section Title</div>
                <div className="sec-sub">Subtitle for section 2</div>
              </div>
            </div>
            <p>Opening paragraph for section 2. Lead with the most important finding.</p>

            <div className="chart-wrap">
              <div className="chart-label">Hiring landscape by degree dependency</div>
              <div style={{ height: 240 }}>
                <canvas id="splitChart" />
              </div>
            </div>

            <div className="pull-quote">
              <p>"A real or representative quote from a student, hiring manager, or founder. First person, specific detail."</p>
              <span className="pq-source">Role, institution or company (shared in Studojo community, 2025)</span>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>3</div>
              <div>
                <div className="sec-title">Third Section Title</div>
                <div className="sec-sub">Subtitle for section 3</div>
              </div>
            </div>
            <p>Paragraph explaining the third finding.</p>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Action-oriented bullet</strong> Explanation of what to do with this finding.</span>
              </div>
            </div>

            <div className="callout-amber">An amber callout. Good for practical warnings or action-oriented advice.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>4</div>
              <div>
                <div className="sec-title">Fourth Section Title</div>
                <div className="sec-sub">Subtitle for section 4</div>
              </div>
            </div>
            <p>Final findings section. Build toward the takeaway.</p>

            <div className="highlight"><strong>Summary insight:</strong> The key thing to carry forward from this section.</div>
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
              <div className="blist-item" key="First action title">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>First action title.</strong> One to two sentences explaining exactly what to do and why. Specific, not generic.</span>
              </div>
              <div className="blist-item" key="Second action title">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Second action title.</strong> Another specific action. Each takeaway item should be independently actionable.</span>
              </div>
              <div className="blist-item" key="Third action title">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Third action title.</strong> A final action. The takeaway section should leave the reader knowing exactly what to do next.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>CTA headline that links the report topic to Studojo's product.</h3>
              <p>One supporting sentence. What Studojo does for this specific reader situation.</p>
            </div>
            <Link to="/dojos/internships" className="rpt-cta-btn">
              Browse Real Internships →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
